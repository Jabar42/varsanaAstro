/**
 * Diccionarios por página/sección (carga automática).
 *
 * Cada archivo `src/i18n/dictionaries/<namespace>.ts` exporta `es` y `en` con
 * la MISMA forma. El nombre del archivo es el namespace: `hospedaje.ts` →
 * `t('hospedaje.clave')`. Se fusiona en profundidad con `translations.ts`, así
 * que un archivo puede extender un namespace que ya exista allí.
 *
 * Para traducir una página nueva:
 *   1. Crear `src/i18n/dictionaries/<pagina>.ts`:
 *        export const es = { title: 'Hola' };
 *        export const en = { title: 'Hello' } satisfies typeof es;
 *   2. En la página: `const t = useTranslations(getLocale(Astro))` y `t('<pagina>.title')`.
 * No hace falta registrar nada.
 */
import type { Locale } from '../translations';

type Dict = Record<string, unknown>;
interface DictionaryModule { es: Dict; en: Dict }

const modules = import.meta.glob<DictionaryModule>('./*.ts', { eager: true });

function pick(locale: Locale): Record<string, Dict> {
  const out: Record<string, Dict> = {};
  for (const [path, mod] of Object.entries(modules)) {
    const name = path.replace(/^\.\//, '').replace(/\.ts$/, '');
    if (name === 'index' || !mod || typeof mod[locale] !== 'object') continue;
    out[name] = mod[locale];
  }
  return out;
}

export const dictionaries: Record<Locale, Record<string, Dict>> = {
  es: pick('es'),
  en: pick('en'),
};
