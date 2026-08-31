"""Pipeline de mídia dos depoimentos (roda no runner do GitHub Actions).

Modos (definidos em .github/depoimentos/manifest.json):

  {"mode": "triage", "folder_id": "..."}
      Baixa a pasta inteira do Drive e gera out/triage-pack.zip com, por vídeo:
      meta.json (ffprobe), 3 frames JPEG (480px) e transcript.txt (faster-whisper).

  {"mode": "finalists", "files": [{"id": "...", "name": "apelido"}, ...]}
      Baixa apenas os vídeos escolhidos e os publica como assets individuais
      (out/<apelido>.mov), para edição final pelo Claude.

Tolerante a falhas por arquivo: um vídeo problemático não derruba o lote.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import unicodedata
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / '.github' / 'depoimentos' / 'manifest.json'
WORK = Path('work')
OUT = Path('out')
TRANSCRIBE_CAP_SECONDS = 240  # depoimentos raramente passam de 4 min


def sh(*cmd: str, check: bool = True, capture: bool = False) -> str:
    print('+', ' '.join(cmd), flush=True)
    res = subprocess.run(cmd, check=check, text=True, capture_output=capture)
    return res.stdout if capture else ''


def safe_name(name: str) -> str:
    base = unicodedata.normalize('NFKD', Path(name).stem)
    base = base.encode('ascii', 'ignore').decode()
    base = re.sub(r'[^A-Za-z0-9._-]+', '_', base).strip('_') or 'video'
    return base[:60]


def ffprobe(path: Path) -> dict:
    out = sh(
        'ffprobe', '-v', 'quiet', '-print_format', 'json',
        '-show_format', '-show_streams', str(path),
        capture=True,
    )
    return json.loads(out or '{}')


def duration_of(meta: dict) -> float:
    try:
        return float(meta.get('format', {}).get('duration', 0) or 0)
    except (TypeError, ValueError):
        return 0.0


def extract_frames(video: Path, dest: Path, dur: float) -> None:
    for i, pct in enumerate((0.15, 0.45, 0.75), start=1):
        ts = max(0.5, dur * pct) if dur else i * 2.0
        sh(
            'ffmpeg', '-v', 'error', '-y', '-ss', f'{ts:.2f}', '-i', str(video),
            '-frames:v', '1', '-vf', 'scale=480:-2', '-q:v', '4',
            str(dest / f'f{i}.jpg'),
            check=False,
        )


def transcribe(model, video: Path, dest: Path) -> None:
    wav = dest / 'audio.wav'
    sh(
        'ffmpeg', '-v', 'error', '-y', '-i', str(video),
        '-t', str(TRANSCRIBE_CAP_SECONDS),
        '-vn', '-ac', '1', '-ar', '16000', str(wav),
        check=False,
    )
    if not wav.exists() or wav.stat().st_size < 1000:
        (dest / 'transcript.txt').write_text('[sem áudio utilizável]\n')
        return
    try:
        segments, info = model.transcribe(str(wav), vad_filter=True, beam_size=1)
        lines = [f'[idioma detectado: {info.language} p={info.language_probability:.2f}]']
        for seg in segments:
            lines.append(f'[{seg.start:07.2f} → {seg.end:07.2f}] {seg.text.strip()}')
        (dest / 'transcript.txt').write_text('\n'.join(lines) + '\n')
    except Exception as exc:  # noqa: BLE001 — melhor transcrição faltando que lote perdido
        (dest / 'transcript.txt').write_text(f'[falha na transcrição: {exc}]\n')
    finally:
        wav.unlink(missing_ok=True)


def find_videos(folder: Path) -> list[Path]:
    exts = {'.mov', '.mp4', '.m4v', '.avi', '.mkv', '.webm'}
    return sorted(p for p in folder.rglob('*') if p.suffix.lower() in exts and p.is_file())


def run_triage(manifest: dict) -> None:
    folder_id = manifest['folder_id']
    WORK.mkdir(exist_ok=True)
    sh(sys.executable, '-m', 'gdown', '--folder', '-O', str(WORK / 'drive'), folder_id)

    videos = find_videos(WORK / 'drive')
    print(f'{len(videos)} vídeos baixados', flush=True)
    if not videos:
        raise SystemExit('Nenhum vídeo baixado — a pasta está compartilhada como "qualquer pessoa com o link"?')

    from faster_whisper import WhisperModel

    model = WhisperModel('small', device='cpu', compute_type='int8')

    pack = WORK / 'triage'
    pack.mkdir(exist_ok=True)
    index = []
    for video in videos:
        name = safe_name(video.name)
        dest = pack / name
        n = 2
        while dest.exists():
            dest = pack / f'{name}_{n}'
            n += 1
        dest.mkdir(parents=True)
        print(f'--- {video.name} → {dest.name}', flush=True)
        try:
            meta = ffprobe(video)
            (dest / 'meta.json').write_text(json.dumps(meta, indent=1)[:20000])
            dur = duration_of(meta)
            extract_frames(video, dest, dur)
            transcribe(model, video, dest)
            index.append({
                'key': dest.name,
                'original': video.name,
                'bytes': video.stat().st_size,
                'seconds': round(dur, 1),
            })
        except Exception as exc:  # noqa: BLE001
            print(f'ERRO em {video.name}: {exc}', flush=True)
            (dest / 'ERROR.txt').write_text(str(exc))
            index.append({'key': dest.name, 'original': video.name, 'error': str(exc)})

    (pack / 'index.json').write_text(json.dumps(index, indent=1, ensure_ascii=False))

    ok = [entry for entry in index if 'error' not in entry]
    print(f'{len(ok)}/{len(index)} vídeos processados com sucesso', flush=True)
    if not ok:
        raise SystemExit('Nenhum vídeo processado — veja os erros acima.')

    OUT.mkdir(exist_ok=True)
    zip_path = OUT / 'triage-pack.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(pack.rglob('*')):
            if f.is_file():
                zf.write(f, f.relative_to(pack))
    print(f'pack: {zip_path} ({zip_path.stat().st_size / 1e6:.1f} MB)', flush=True)


def run_finalists(manifest: dict) -> None:
    OUT.mkdir(exist_ok=True)
    WORK.mkdir(exist_ok=True)
    missing = []
    for item in manifest['files']:
        fid, alias = item['id'], safe_name(item['name'])
        dl_dir = WORK / alias
        dl_dir.mkdir(parents=True, exist_ok=True)
        sh(sys.executable, '-m', 'gdown', '-O', str(dl_dir) + '/', fid, check=False)
        files = [p for p in dl_dir.iterdir() if p.is_file()]
        if not files:
            print(f'ERRO: nada baixado para {alias} ({fid})', flush=True)
            missing.append(alias)
            continue
        src = max(files, key=lambda p: p.stat().st_size)
        shutil.move(str(src), OUT / f'{alias}{src.suffix.lower()}')
    print('finalists prontos:', [p.name for p in OUT.iterdir()], flush=True)
    if missing:
        raise SystemExit(f'Finalistas não baixados: {missing}')


def main() -> None:
    missing = [tool for tool in ('ffmpeg', 'ffprobe') if not shutil.which(tool)]
    if missing:
        raise SystemExit(f'Ferramentas ausentes no runner: {missing} — instale ffmpeg no workflow.')
    manifest = json.loads(MANIFEST.read_text())
    mode = manifest.get('mode')
    print(f'modo: {mode}', flush=True)
    if mode == 'triage':
        run_triage(manifest)
    elif mode == 'finalists':
        run_finalists(manifest)
    else:
        raise SystemExit(f'modo desconhecido: {mode!r}')


if __name__ == '__main__':
    main()
