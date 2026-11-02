/**
 * Sitemap generado en tiempo de petición (en SSR @astrojs/sitemap no puede
 * enumerar rutas). Incluye páginas estáticas y entradas de colecciones en
 * ambos idiomas con hreflang alternates.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { localizePath, locales } from '@/src/i18n/utils';

export const prerender = false;

const STATIC_PATHS = [
  '/',
  '/nosotros',
  '/nuestra-historia',
  '/practica-espiritual',
  '/experiencias',
  '/experiencias/temazcal',
  '/experiencias/yoga',
  '/experiencias/yoga-terapeutico',
  '/experiencias/cuevas',
  '/events',
  '/pasadias',
  '/voluntariado',
  '/hospedaje',
  '/alimentacion',
  '/restaurante-campestre',
  '/parador-el-elefante',
  '/red-eco-aldeas',
  '/blog',
  '/contacto',
  '/donar',
  '/mapa-del-sitio',
];

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://varsana.com')).origin;
  const now = new Date();

  const [events, pasadias, blog, hospedaje, nosotros] = await Promise.all([
    getCollection('events'),
    getCollection('pasadias'),
    getCollection('blog'),
    getCollection('hospedaje'),
    getCollection('nosotros'),
  ]);

  const entries: { path: string; lastmod?: Date }[] = STATIC_PATHS.map((path) => ({ path }));
  for (const e of events) {
    const end = e.data.event_end ?? e.data.event_start;
    if (end >= now) entries.push({ path: `/events/${e.id}` });
  }
  for (const p of pasadias) entries.push({ path: `/pasadias/${p.id}` });
  for (const b of blog) entries.push({ path: `/blog/${b.id}`, lastmod: b.data.date });
  for (const h of hospedaje) entries.push({ path: `/hospedaje/${h.id}` });
  for (const n of nosotros) if (n.data.activo) entries.push({ path: `/nosotros/${n.id}` });

  const urls = entries.flatMap(({ path, lastmod }) =>
    locales.map((locale) => {
      const loc = origin + localizePath(locale, path);
      const alternates = locales
        .map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(origin + localizePath(l, path))}"/>`)
        .join('');
      const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(origin + localizePath('es', path))}"/>`;
      const mod = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${esc(loc)}</loc>${mod}${alternates}${xDefault}</url>`;
    }),
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    urls.join('\n') +
    `\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
