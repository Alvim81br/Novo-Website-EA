// Carrossel infinito ("roleta"): as setas nunca travam nas pontas — chegou no
// último card, o próximo clique já mostra o primeiro de novo, e vice-versa.
//
// Como funciona: o conteúdo é renderizado três vezes lado a lado (no build) e o
// scroll fica sempre preso à faixa do meio. Quando a posição sai dessa faixa,
// ela é deslocada em exatamente um bloco — como os três blocos são idênticos,
// o salto é invisível e sempre sobra um bloco inteiro de "pista" nos dois lados.
// O deslocamento é múltiplo exato da largura de um card, então o scroll-snap
// continua caindo nos mesmos pontos de encaixe.
//
// HTML esperado:
//   <div data-carousel>
//     <div data-carousel-track>
//       …itens do bloco real…
//       …dois blocos com data-carousel-clone e class="hidden"…
//     </div>
//     <button data-carousel-prev> … <button data-carousel-next> …
//   </div>
//
// Sem JS os blocos clonados continuam escondidos e a faixa rola no toque
// normalmente — nada de conteúdo repetido na tela.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';

function initCarousel(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  if (!track) return;

  const prevBtn = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const clones = Array.from(track.querySelectorAll<HTMLElement>('[data-carousel-clone]'));
  const setSize = track.children.length - clones.length;
  if (setSize < 1) return;

  let loop = false;
  let span = 0; // largura de um bloco completo
  let step = 0; // avanço de um card
  let trackWidth = 0;
  let idleTimer = 0;

  const showClones = (show: boolean) => {
    for (const clone of clones) clone.classList.toggle('hidden', !show);
    prevBtn?.classList.toggle('hidden', !show);
    nextBtn?.classList.toggle('hidden', !show);
  };

  const measure = (initial: boolean) => {
    showClones(true);
    const items = Array.from(track.children) as HTMLElement[];
    const first = items[0];
    const second = items[1];
    const nextSet = items[setSize];
    if (!first) return;

    step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    span = nextSet ? nextSet.offsetLeft - first.offsetLeft : 0;
    trackWidth = track.clientWidth;

    // Com todos os cards à vista não há o que girar: some com as setas e com as
    // cópias, deixando só o bloco real.
    loop = span > trackWidth + 1 && step > 0;
    showClones(loop);
    if (!loop) return;

    // A posição 0 é um ponto de encaixe válido, e um bloco inteiro adiante
    // também é — começamos ali, mostrando os mesmos primeiros cards de sempre.
    if (initial) track.scrollLeft = span;
    else wrap();
  };

  // Mantém o scroll na faixa do meio, deslocando um bloco inteiro quando escapa.
  const wrap = () => {
    if (!loop) return;
    const pos = track.scrollLeft;
    if (pos >= span * 1.5) track.scrollLeft = pos - span;
    else if (pos < span * 0.5) track.scrollLeft = pos + span;
  };

  const slide = (dir: number) => {
    wrap(); // reposiciona antes de andar, para nunca esbarrar no fim do scroll
    track.scrollBy({ left: dir * (step || track.clientWidth), behavior });
  };

  prevBtn?.addEventListener('click', () => slide(-1));
  nextBtn?.addEventListener('click', () => slide(1));

  track.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        // Se o scroll veio de um card recebendo foco pelo teclado, deslocar a
        // faixa arrastaria justamente o card que a pessoa acabou de alcançar.
        if (track.contains(document.activeElement)) return;
        wrap();
      }, 140);
    },
    { passive: true }
  );

  // Só remede quando a largura muda de fato: no mobile a barra de endereço
  // some e aparece disparando `resize` a cada rolagem vertical.
  window.addEventListener('resize', () => {
    if (Math.abs(track.clientWidth - trackWidth) < 1) return;
    measure(false);
  });

  measure(true);
}

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(initCarousel);
