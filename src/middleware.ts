import { defineMiddleware } from 'astro:middleware';

const COOKIE_NAME = 'varsana_locale';
const REWRITTEN_HEADER = 'x-i18n-rewritten';

function getLocaleFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

function getLocaleFromBrowser(request: Request): string | null {
  const acceptLang = request.headers.get('accept-language');
  if (!acceptLang) return null;
  const first = acceptLang.split(',')[0].trim().toLowerCase();
  return first.startsWith('en') ? 'en' : null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Already rewritten? Just pass through without any redirect logic
  if (context.request.headers.get(REWRITTEN_HEADER)) {
    return next();
  }

  const isEnglishPath = pathname === '/en' || pathname.startsWith('/en/');

  // ---- Requests with /en/ prefix ----
  if (isEnglishPath) {
    context.locals.locale = 'en';
    const newPath = pathname === '/en' ? '/' : pathname.slice(3);
    const rewrittenUrl = new URL(newPath + url.search, url.origin);

    const headers = new Headers(context.request.headers);
    headers.set(REWRITTEN_HEADER, '1');

    const response = await context.rewrite(
      new Request(rewrittenUrl, { headers, method: context.request.method }),
    );

    if (!pathname.startsWith('/en/api/')) {
      response.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=en; Path=/; Max-Age=31536000; SameSite=Lax`,
      );
    }
    return response;
  }

  // ---- Requests without locale prefix ----

  // Omitir peticiones internas de datos de Astro generadas por ViewTransitions/Prefetch
  if (
    pathname.startsWith('/_astro/') ||
    context.request.headers.get('Purpose') === 'prefetch' ||
    context.request.headers.get('Sec-Fetch-Dest') === 'empty'
  ) {
    return next();
  }

  // Skip API and static assets
  if (pathname.startsWith('/api/') || pathname.includes('.')) {
    return next();
  }

  const cookieLocale = getLocaleFromCookie(context.request);

  // Cookie says English → redirect to /en/...
  if (cookieLocale === 'en') {
    const dest = pathname === '/' ? '/en/' : `/en${pathname}`;
    const destWithQuery = url.search ? dest + url.search : dest;
    return new Response(null, {
      status: 302,
      headers: { Location: destWithQuery },
    });
  }

  // First visit → check browser language
  if (!cookieLocale) {
    const browserLocale = getLocaleFromBrowser(context.request);
    if (browserLocale === 'en') {
      const dest = pathname === '/' ? '/en/' : `/en${pathname}`;
      const destWithQuery = url.search ? dest + url.search : dest;
      return new Response(null, {
        status: 302,
        headers: {
          Location: destWithQuery,
          'Set-Cookie': `${COOKIE_NAME}=en; Path=/; Max-Age=31536000; SameSite=Lax`,
        },
      });
    }
  }

  return next();
});
