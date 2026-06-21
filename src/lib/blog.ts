/**
 * Helpers de lectura para la colección de blog.
 * - getAllPosts: filtra por locale y ordena por fecha (más reciente primero).
 * - getPostsByTag: filtra por tag.
 * - getPostBySlug: busca un post por slug.
 */
import { getCollection } from 'astro:content';

/**
 * Returns all blog posts, sorted by date descending (newest first).
 * Falls back to Spanish locale if no posts exist for the requested locale.
 */
export async function getAllPosts(locale = 'es') {
  const allPosts = await getCollection('blog');
  const localeItems = allPosts.filter(p => (p.data.locale ?? 'es') === locale);
  const sourceItems = localeItems.length > 0 ? localeItems : allPosts.filter(p => (p.data.locale ?? 'es') === 'es');
  return sourceItems.sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

/**
 * Returns blog posts that have the given tag.
 */
export async function getPostsByTag(tag: string, locale = 'es') {
  const allPosts = await getAllPosts(locale);
  return allPosts.filter(p => p.data.tags?.includes(tag));
}

/**
 * Returns a single blog post by its slug.
 */
export async function getPostBySlug(slug: string) {
  const allPosts = await getCollection('blog');
  return allPosts.find(p => p.id === slug);
}
