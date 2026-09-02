// Efeitos visuais globais do site (carregado pelo BaseLayout em todas as
// páginas). Tudo aqui é progressivo: sem JS a página continua legível, e quem
// prefere menos movimento (prefers-reduced-motion) não recebe animação nenhuma
// além do que o CSS já respeita.
//
// O que vive aqui:
//   1. Revelação no scroll (.reveal) com cascata automática — elementos que
//      entram juntos na tela aparecem um atrás do outro.
//   2. Cabeçalho: sombra mais funda depois de rolar + barra de progresso da
//      leitura + botão "voltar ao topo".
//   3. Holofote (.card-glow) e inclinação 3D ([data-tilt]) seguindo o cursor.
//   4. Parallax leve das decorações dos heros ([data-parallax]).
//   5. Acordeão do FAQ abrindo/fechando com altura animada.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Só mouse/trackpad: em telas de toque não existe "passar o cursor".
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 1. Revelação no scroll com cascata ---------- */
function initReveal() {
  const elements = document.querySelectorAll<HTMLElement>('.reveal');
  if (elements.length === 0) return;
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Quem apareceu no mesmo instante entra em cascata na ordem visual
      // (de cima para baixo, da esquerda para a direita).
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left
        );
      visible.forEach((entry, index) => {
        const el = entry.target as HTMLElement;
        el.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 80}ms`);
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -4% 0px' }
  );
  elements.forEach((el) => observer.observe(el));
}

/* ---------- 2. Cabeçalho, progresso de leitura e "voltar ao topo" ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('.site-header');
  const toTop = document.getElementById('to-top');
  const root = document.documentElement;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 12);
    toTop?.classList.toggle('is-visible', y > 600);
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--scroll-progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  window.addEventListener('resize', update);
  update();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* ---------- 3. Holofote e inclinação 3D nos cards ---------- */
function initPointerEffects() {
  if (!finePointer) return;
  const cards = document.querySelectorAll<HTMLElement>('.card-glow, [data-tilt]');

  cards.forEach((card) => {
    const glow = card.classList.contains('card-glow');
    const tilt = !reduceMotion && card.hasAttribute('data-tilt');
    const maxAngle = Number(card.dataset.tilt) || 6;
    let pending: PointerEvent | null = null;
    let frame = 0;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const rect = card.getBoundingClientRect();
      const x = pending.clientX - rect.left;
      const y = pending.clientY - rect.top;
      if (glow) {
        card.style.setProperty('--mx', `${x.toFixed(1)}px`);
        card.style.setProperty('--my', `${y.toFixed(1)}px`);
      }
      if (tilt && rect.width > 0 && rect.height > 0) {
        const rx = (0.5 - y / rect.height) * 2 * maxAngle;
        const ry = (x / rect.width - 0.5) * 2 * maxAngle;
        card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      }
    };

    card.addEventListener('pointermove', (event) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(apply);
    });
    card.addEventListener('pointerleave', () => {
      pending = null;
      if (tilt) {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      }
    });
  });
}

/* ---------- 4. Parallax das decorações do hero ---------- */
function initParallax() {
  if (!finePointer || reduceMotion) return;
  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (layers.length === 0) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;

  const tick = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    for (const layer of layers) {
      const depth = Number(layer.dataset.parallax) || 10;
      layer.style.transform = `translate3d(${(currentX * depth).toFixed(2)}px, ${(currentY * depth).toFixed(2)}px, 0)`;
    }
    const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
    frame = settled ? 0 : requestAnimationFrame(tick);
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(tick);
    },
    { passive: true }
  );
}

/* ---------- 5. Acordeão do FAQ com altura animada ---------- */
function initAccordions() {
  if (reduceMotion) return; // fica o abrir/fechar nativo do <details>
  document.querySelectorAll<HTMLDetailsElement>('details.faq').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = details.querySelector<HTMLElement>('.faq-body');
    if (!summary || !body) return;
    let animation: Animation | null = null;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      animation?.cancel();

      if (details.open) {
        const height = body.offsetHeight;
        animation = body.animate(
          [
            { height: `${height}px`, opacity: 1 },
            { height: '0px', opacity: 0 },
          ],
          { duration: 260, easing: 'ease' }
        );
        animation.onfinish = () => {
          details.open = false;
          animation = null;
        };
      } else {
        details.open = true;
        const height = body.offsetHeight;
        animation = body.animate(
          [
            { height: '0px', opacity: 0 },
            { height: `${height}px`, opacity: 1 },
          ],
          { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        animation.onfinish = () => {
          animation = null;
        };
      }
    });
  });
}

initReveal();
initHeader();
initPointerEffects();
initParallax();
initAccordions();
