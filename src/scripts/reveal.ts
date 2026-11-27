/**
 * Aparición al hacer scroll («El umbral»).
 *
 * - `data-reveal` en un elemento: entra cuando asoma en pantalla
 *   (variantes: "fade", "mask", "draw"; ver global.css).
 * - `data-reveal-group` en un contenedor: sus hijos entran escalonados.
 *
 * Se re-inicializa en `astro:page-load` (ClientRouter) y publica la altura
 * real del header en `--hh` para las piezas que se fijan debajo de él.
 */
const STAGGER_MS = 90;
let observer: IntersectionObserver | null = null;
let headerObserver: ResizeObserver | null = null;

function trackHeaderHeight() {
  headerObserver?.disconnect();
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  const set = () => document.documentElement.style.setProperty('--hh', `${header.offsetHeight}px`);
  set();
  headerObserver = new ResizeObserver(set);
  headerObserver.observe(header);
}

function init() {
  observer?.disconnect();
  trackHeaderHeight();

  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      const el = child as HTMLElement;
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      el.style.setProperty('--rd', `${i * STAGGER_MS}ms`);
    });
  });

  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  // Un elemento recortado por completo (máscara, línea en escala 0) no tiene
  // área visible y nunca intersecta: en esos casos se observa a su padre.
  const watched = new Map<Element, HTMLElement[]>();
  targets.forEach((el) => {
    const collapsed = ['mask', 'draw', 'draw-y'].includes(el.dataset.reveal ?? '');
    const anchor = (collapsed && el.parentElement) || el;
    watched.set(anchor, [...(watched.get(anchor) ?? []), el]);
  });

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        watched.get(entry.target)?.forEach((el) => el.classList.add('is-in'));
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  watched.forEach((_, anchor) => observer!.observe(anchor));
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => {
  observer?.disconnect();
  headerObserver?.disconnect();
});
