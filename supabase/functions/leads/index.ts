// API de dados do painel de leads (a página fica em /painel/, no site).
//
// GET  ?s=SESSAO            → leads da unidade daquela sessão
// GET  ?k=CHAVE             → 403 {erro:'pin'} se a chave exige senha
// POST {acao:'entrar',k,pin} → confere o PIN e devolve uma sessão
// POST {acao:'atendido'|'reabrir', s, id} → marca/desmarca atendido
// POST {acao:'sair', s}      → encerra a sessão deste aparelho
//
// Duas travas, porque só o link não basta (link encaminhado, print, celular
// emprestado): a CHAVE identifica a unidade e o PIN prova quem é a pessoa.
// Guardamos só o hash do PIN — SHA-256 de (pin + chave), com a chave de sal.
//
// Por que só JSON: o runtime do Supabase reescreve o content-type de toda
// resposta para `text/plain`, então HTML servido daqui chega como código à
// mostra. Com JSON não importa — quem lê é o `fetch()` da página, servida
// pelo Netlify.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CAMPOS =
  "id, created_at, name, phone, email, unit, course, schedule, source, contacted, contacted_at, utm_source, utm_campaign";
const SESSAO_DIAS = 30;
const TENTATIVAS_ATE_BLOQUEIO = 5;
const BLOQUEIO_MINUTOS = 15;

interface Acesso {
  token: string;
  unit: string | null;
  label: string;
  pin_hash: string | null;
  locked_until: string | null;
  failed_attempts: number;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Só o site (e os previews) podem chamar direto do navegador. */
function origemPermitida(req: Request): string | null {
  const origem = req.headers.get("origin");
  if (!origem) return null;
  try {
    const host = new URL(origem).hostname;
    const ok = host === "englishacademy.net.br" ||
      host.endsWith(".englishacademy.net.br") ||
      host.endsWith(".netlify.app") ||
      host.endsWith(".vercel.app");
    return ok ? origem : null;
  } catch {
    return null;
  }
}

function responder(req: Request, dados: unknown, status = 200): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  const origem = origemPermitida(req);
  if (origem) {
    headers.set("access-control-allow-origin", origem);
    headers.set("vary", "Origin");
    headers.set("access-control-allow-headers", "content-type");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  }
  return new Response(JSON.stringify(dados), { status, headers });
}

async function hashDoPin(pin: string, token: string): Promise<string> {
  const bytes = new TextEncoder().encode(pin + token);
  const resumo = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(resumo)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação de tempo constante: não entrega o PIN pelo relógio. */
function igual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

function novoId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function acessoPorChave(token: string): Promise<Acesso | null> {
  if (!token || token.length < 8) return null;
  const { data } = await admin()
    .from("unit_access")
    .select("token, unit, label, pin_hash, locked_until, failed_attempts")
    .eq("token", token)
    .eq("active", true)
    .maybeSingle();
  return (data as Acesso) ?? null;
}

async function acessoPorSessao(id: string): Promise<Acesso | null> {
  if (!id || id.length < 16) return null;

  const { data: sessao } = await admin()
    .from("unit_sessions")
    .select("id, token, expires_at")
    .eq("id", id)
    .maybeSingle();
  if (!sessao) return null;

  if (new Date(sessao.expires_at).getTime() < Date.now()) {
    await admin().from("unit_sessions").delete().eq("id", id);
    return null;
  }

  const acesso = await acessoPorChave(sessao.token);
  if (!acesso) return null;

  const agora = new Date().toISOString();
  await admin().from("unit_sessions").update({ last_seen_at: agora }).eq("id", id);
  await admin().from("unit_access").update({ last_seen_at: agora }).eq("token", acesso.token);
  return acesso;
}

async function leadsDe(acesso: Acesso) {
  let consulta = admin().from("leads").select(CAMPOS).order("created_at", { ascending: false }).limit(300);
  if (acesso.unit) consulta = consulta.eq("unit", acesso.unit);
  return await consulta;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") return responder(req, null, 204);

  if (req.method === "POST") {
    const corpo = await req.json().catch(() => ({} as Record<string, unknown>));
    const acao = String(corpo.acao ?? "");

    // --- entrar: confere o PIN e abre uma sessão neste aparelho -------------
    if (acao === "entrar") {
      const acesso = await acessoPorChave(String(corpo.k ?? ""));
      if (!acesso) return responder(req, { erro: "chave" }, 401);

      if (acesso.locked_until && new Date(acesso.locked_until).getTime() > Date.now()) {
        return responder(req, { erro: "bloqueado", ate: acesso.locked_until }, 429);
      }

      const pin = String(corpo.pin ?? "");
      if (acesso.pin_hash && !igual(await hashDoPin(pin, acesso.token), acesso.pin_hash)) {
        const tentativas = (acesso.failed_attempts ?? 0) + 1;
        const bloqueado = tentativas >= TENTATIVAS_ATE_BLOQUEIO;
        await admin()
          .from("unit_access")
          .update({
            failed_attempts: bloqueado ? 0 : tentativas,
            locked_until: bloqueado ? new Date(Date.now() + BLOQUEIO_MINUTOS * 60000).toISOString() : null,
          })
          .eq("token", acesso.token);
        return bloqueado
          ? responder(req, { erro: "bloqueado", minutos: BLOQUEIO_MINUTOS }, 429)
          : responder(req, { erro: "pin_errado", restantes: TENTATIVAS_ATE_BLOQUEIO - tentativas }, 401);
      }

      const id = novoId();
      const expira = new Date(Date.now() + SESSAO_DIAS * 24 * 3600 * 1000).toISOString();
      const { error } = await admin()
        .from("unit_sessions")
        .insert({ id, token: acesso.token, expires_at: expira, last_seen_at: new Date().toISOString() });
      if (error) return responder(req, { erro: "sessao" }, 500);

      await admin().from("unit_access").update({ failed_attempts: 0, locked_until: null }).eq("token", acesso.token);

      const { data } = await leadsDe(acesso);
      return responder(req, {
        ok: true,
        sessao: id,
        expira,
        unidade: acesso.unit,
        label: acesso.label,
        leads: data ?? [],
      });
    }

    // --- sair: encerra a sessão deste aparelho ------------------------------
    if (acao === "sair") {
      await admin().from("unit_sessions").delete().eq("id", String(corpo.s ?? ""));
      return responder(req, { ok: true });
    }

    // --- marcar como atendido / reabrir -------------------------------------
    const acesso = await acessoPorSessao(String(corpo.s ?? ""));
    if (!acesso) return responder(req, { erro: "sessao" }, 401);

    const atendido = acao === "atendido";
    // A unidade só mexe nos próprios leads (a chave da direção mexe em todos).
    let q = admin()
      .from("leads")
      .update({ contacted: atendido, contacted_at: atendido ? new Date().toISOString() : null })
      .eq("id", String(corpo.id ?? ""));
    if (acesso.unit) q = q.eq("unit", acesso.unit);

    const { error } = await q;
    if (error) return responder(req, { erro: "salvar" }, 500);
    return responder(req, { ok: true });
  }

  // --- listagem -------------------------------------------------------------
  const sessao = url.searchParams.get("s") ?? "";
  const chave = url.searchParams.get("k") ?? "";

  let acesso = sessao ? await acessoPorSessao(sessao) : null;

  if (!acesso && chave) {
    const porChave = await acessoPorChave(chave);
    if (!porChave) return responder(req, { erro: "chave" }, 401);
    // Com PIN configurado, a chave sozinha não abre nada: pede a senha.
    if (porChave.pin_hash) {
      return responder(req, { erro: "pin", unidade: porChave.unit, label: porChave.label }, 403);
    }
    acesso = porChave;
  }

  if (!acesso) return responder(req, { erro: sessao ? "sessao" : "chave" }, 401);

  const { data, error } = await leadsDe(acesso);
  if (error) return responder(req, { erro: "consulta" }, 500);

  return responder(req, { unidade: acesso.unit, label: acesso.label, leads: data ?? [] });
});
