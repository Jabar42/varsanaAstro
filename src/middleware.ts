import { defineMiddleware } from 'astro:middleware';

const COOKIE_NAME = 'varsana_locale';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (context.locals.locale === 'en') {
    return next();
  }

  const isEnglishPath = pathname === '/en' || pathname.startsWith('/en/');

  if (isEnglishPath) {
    context.locals.locale = 'en';
    const newPath = pathname === '/en' ? '/' : pathname.slice(3);
    const destPath = newPath + url.search;

    const response = await context.rewrite(destPath);

    if (!pathname.startsWith('/en/api/')) {
      response.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=en; Path=/; Max-Age=31536000; SameSite=Lax`,
      );
    }
    return response;
  }

  if (pathname.startsWith('/api/') || pathname.includes('.')) {
    return next();
  }

  const cookieLocale = context.cookies.get(COOKIE_NAME)?.value;

  if (cookieLocale === 'en') {
    const dest = pathname === '/' ? '/en/' : `/en${pathname}`;
    const destWithQuery = url.search ? dest + url.search : dest;
    return context.redirect(destWithQuery, 302);
  }

  if (!cookieLocale) {
    const acceptLang = context.request.headers.get('accept-language');
    const firstLang = acceptLang?.split(',')[0].trim().toLowerCase();

    if (firstLang?.startsWith('en')) {
      const dest = pathname === '/' ? '/en/' : `/en${pathname}`;
      const destWithQuery = url.search ? dest + url.search : dest;

      const response = context.redirect(destWithQuery, 302);
      response.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=en; Path=/; Max-Age=31536000; SameSite=Lax`,
      );
      return response;
    }
  }

  return next();
});
