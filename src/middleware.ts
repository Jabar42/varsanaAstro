/**
 * Middleware de idioma y normalización de URLs.
 *
 * - `/en/...` se reescribe internamente a la ruta en español con
 *   `locals.locale = 'en'`; las páginas traducen leyendo `getLocale(Astro)`.
 * - La URL siempre manda. Solo la raíz `/` redirige a `/en` cuando la cookie
 *   dice `en`, o en la primera visita si el navegador prefiere inglés.
 * - La cookie `varsana_locale` guarda el último idioma visto y la fija el
 *   servidor en cada página HTML (no en prefetch, API ni assets).
 * - URLs con barra final se redirigen 301 a la versión sin barra.
 */
import { defineMiddleware } from 'astro:middleware';
import { LOCALE_COOKIE, type Locale } from './i18n/utils';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isPrefetch(request: Request): boolean {
  const h = request.headers;
  return (
    h.get('sec-purpose')?.includes('prefetch') === true ||
    h.get('purpose') === 'prefetch' ||
    h.get('x-moz') === 'prefetch'
  );
}

function prefersEnglish(request: Request): boolean {
  const first = request.headers.get('accept-language')?.split(',')[0]?.trim().toLowerCase();
  return !!first && first.startsWith('en');
}

export const onRequest = defineMiddleware(async (context, next) => {
  // El rewrite de /en vuelve a ejecutar el middleware: ya está resuelto.
  if (context.locals.locale) return next();

  const { pathname, search } = context.url;

  // API, assets de Astro y archivos estáticos: sin lógica de idioma.
  if (pathname.startsWith('/api/') || pathname.startsWith('/_') || /\.[a-z0-9]+$/i.test(pathname)) {
    return next();
  }

  // Normalizar barra final: /pasadias/ → /pasadias (la raíz se mantiene).
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return context.redirect(pathname.replace(/\/+$/, '') + search, 301);
  }

  const cookieLocale = context.cookies.get(LOCALE_COOKIE)?.value;
  const remember = (locale: Locale) => {
    if (cookieLocale === locale || isPrefetch(context.request)) return;
    context.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      httpOnly: false,
    });
  };

  // Inglés: /en o /en/...
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const stripped = pathname === '/en' ? '/' : pathname.slice(3);
    if (stripped.startsWith('/api/')) return next(); // no existe /en/api → 404
    context.locals.locale = 'en';
    remember('en');
    return context.rewrite(stripped + search);
  }

  // Español
  context.locals.locale = 'es';

  if (pathname === '/') {
    if (cookieLocale === 'en') return context.redirect('/en' + search, 302);
    if (!cookieLocale && prefersEnglish(context.request)) {
      remember('en');
      return context.redirect('/en' + search, 302);
    }
  }

  remember('es');
  return next();
});
