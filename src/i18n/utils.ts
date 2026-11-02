/**
 * Utilidades de internacionalización.
 *
 * Reglas del sistema de idiomas (ver src/middleware.ts):
 * - La URL manda: `/x` es español, `/en/x` es inglés. Nunca se redirige una
 *   URL concreta por cookie.
 * - La cookie `varsana_locale` solo influye en la raíz `/` (primera visita o
 *   último idioma visto) y la fija el servidor, nunca JavaScript.
 * - El cambio de idioma es un enlace normal a la misma página en el otro
 *   idioma; no depende de scripts.
 */
import { translations, type Locale, type TranslationDict } from './translations';
import { dictionaries } from './dictionaries';

export const LOCALE_COOKIE = 'varsana_locale';
export const defaultLocale: Locale = 'es';
export const locales: readonly Locale[] = ['es', 'en'] as const;

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en';
}

type Dict = Record<string, unknown>;

function isPlainObject(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Fusión en profundidad: los diccionarios por página extienden translations.ts. */
function deepMerge(base: Dict, extra: Dict): Dict {
  const out: Dict = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? deepMerge(out[k] as Dict, v) : v;
  }
  return out;
}

const merged: Record<Locale, Dict> = {
  es: deepMerge(translations.es as unknown as Dict, dictionaries.es),
  en: deepMerge(translations.en as unknown as Dict, dictionaries.en),
};

/** Get a nested value from the translation dictionary using dot-notation keys. */
function getNested(obj: Dict, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Dict)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export type Translator = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Returns a translator function bound to the given locale.
 * Usage: `const t = useTranslations(locale)` → `t("nav.home")`.
 * Supports `{name}` placeholders: `t('x.y', { name: 'Ana' })`.
 * Falls back to Spanish, then to the key itself.
 */
export function useTranslations(locale?: string): Translator {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale;
  return (key, vars) => {
    let value = getNested(merged[loc], key) ?? getNested(merged[defaultLocale], key) ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replaceAll(`{${k}}`, String(v));
      }
    }
    return value;
  };
}

/**
 * Locale of the current request. The middleware sets `Astro.locals.locale`
 * for every HTML page; this helper is the single place to read it.
 */
export function getLocale(astro: { locals: { locale?: string } }): Locale {
  return isLocale(astro.locals.locale) ? astro.locals.locale : defaultLocale;
}

/** Removes the `/en` prefix and any trailing slash. `/en/x/` → `/x`. */
export function stripLocale(pathname: string): string {
  let p = pathname.replace(/^\/en(?=\/|$)/, '');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * Builds the URL for `path` in `locale`, without trailing slash.
 * `localizePath('en', '/pasadias')` → `/en/pasadias`; `localizePath('en', '/')` → `/en`.
 * Accepts paths that already carry a locale prefix.
 */
export function localizePath(locale: Locale, path: string): string {
  const [pathnameRaw, query] = path.split('?');
  const pathname = stripLocale(pathnameRaw.startsWith('/') ? pathnameRaw : `/${pathnameRaw}`);
  const base = locale === defaultLocale ? pathname : pathname === '/' ? '/en' : `/en${pathname}`;
  return query ? `${base}?${query}` : base;
}

/** Returns the locale encoded in a URL path. */
export function getLocaleFromUrl(url: URL | { pathname: string }): Locale {
  const pathname = url.pathname;
  if (pathname.startsWith('/en/') || pathname === '/en') return 'en';
  return 'es';
}

/** Date formatting consistent with the locale (Colombian Spanish by default). */
export function formatDate(
  date: Date | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', options);
}

/** Currency formatting in COP for both locales. */
export function formatCOP(amount: number, locale: Locale): string {
  return `$${amount.toLocaleString(locale === 'en' ? 'en-US' : 'es-CO')} COP`;
}

export type { Locale, TranslationDict };
