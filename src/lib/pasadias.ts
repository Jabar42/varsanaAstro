/**
 * Helpers de lectura para la colección de pasadías (servicios sin fecha).
 * - getAllPasadias: filtra por locale y ordena alfabéticamente.
 * - getPasadiasByCategory: agrupa por categoría.
 * - getPasadiaBySlug: busca por slug.
 * Reexporta getCurrentPrice desde events.ts porque ambas colecciones
 * comparten la misma estructura de precios con deadlines.
 */
import { getCollection } from 'astro:content';

/**
 * Returns all pasadias (fixed services without dates), sorted alphabetically by title.
 */
export async function getAllPasadias(locale = 'es') {
  const allPasadias = await getCollection('pasadias');
  const localeItems = allPasadias.filter(p => (p.data.locale ?? 'es') === locale);
  const sourceItems = localeItems.length > 0 ? localeItems : allPasadias.filter(p => (p.data.locale ?? 'es') === 'es');
  return sourceItems.sort((a, b) =>
    a.data.title.localeCompare(b.data.title)
  );
}

/**
 * Returns pasadias belonging to a specific category.
 */
export async function getPasadiasByCategory(category: string) {
  const allPasadias = await getCollection('pasadias');
  return allPasadias.filter(p => p.data.category === category);
}

/**
 * Returns a single pasadia by its slug.
 */
export async function getPasadiaBySlug(slug: string) {
  const allPasadias = await getCollection('pasadias');
  return allPasadias.find(p => p.id === slug);
}

// Reuse the existing price‑selection logic from events
export { getCurrentPrice } from './events';
