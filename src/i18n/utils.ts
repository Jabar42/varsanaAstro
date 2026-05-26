import { translations, type Locale, type TranslationDict } from './translations';

const defaultLocale: Locale = 'es';

/** Get a nested value from the translation dictionary using dot-notation keys. */
function getNested(obj: Record<string, any>, path: string): string {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = current[key];
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Returns a translator function bound to the given locale.
 * Usage: `const t = useTranslations(Astro.currentLocale ?? "es")`
 * Then:  `t("nav.home")` → "Inicio" / "Home"
 */
export function useTranslations(locale?: string) {
  const loc = (locale as Locale) ?? defaultLocale;
  const dict: TranslationDict = translations[loc] ?? translations[defaultLocale];

  return (key: string): string => getNested(dict, key);
}

/**
 * Returns the locale from Astro.url or falls back to default.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;
  if (pathname.startsWith('/en/') || pathname === '/en') return 'en';
  return 'es';
}

export { defaultLocale };
export type { Locale };
