import { getCollection } from 'astro:content';

/**
 * Returns all pasadias (fixed services without dates), sorted alphabetically by title.
 */
export async function getAllPasadias() {
  const allPasadias = await getCollection('pasadias');
  return allPasadias.sort((a, b) =>
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