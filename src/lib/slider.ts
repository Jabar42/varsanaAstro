/**
 * Construye la lista unificada de elementos destacados para el slider del
 * homepage. Itera sobre eventos y pasadías, filtra los marcados con
 * `destacado: true`, descarta eventos ya finalizados, y normaliza todo a una
 * interfaz común FeaturedItem. Ordena por el campo `orden` (prioridad manual),
 * luego por fecha (eventos primero) y finalmente por título alfabético.
 * Soporta límite de items vía maxItems.
 */
import { getCollection } from 'astro:content';

export interface FeaturedItem {
  collection: string;
  slug: string;
  image: string;
  title: string;
  description: string;
  url: string;
  ctaLabel?: string;
  price?: { label: string; amount: number };
  date?: Date;
  _orden: number; // internal sort key
}

interface GetFeaturedOptions {
  collections?: string[];
  maxItems?: number;
  locale?: string;
}

export async function getFeaturedItems(
  options: GetFeaturedOptions = {},
): Promise<FeaturedItem[]> {
  const { collections = ['events', 'pasadias'], maxItems, locale = 'es' } = options;
  const items: FeaturedItem[] = [];

  if (collections.includes('events')) {
    const all = await getCollection('events');
    const localeEvents = all.filter(e => (e.data.locale ?? 'es') === locale);
    const sourceEvents = localeEvents.length > 0 ? localeEvents : all.filter(e => (e.data.locale ?? 'es') === 'es');
    const now = new Date();
    for (const entry of sourceEvents) {
      if (!entry.data.destacado) continue;
      const end = entry.data.event_end
        ? new Date(entry.data.event_end)
        : new Date(entry.data.event_start);
      if (end < now) continue;

      items.push({
        collection: 'events',
        slug: entry.id,
        image: entry.data.image,
        title: entry.data.title,
        description: entry.data.description,
        url: `/events/${entry.id}`,
        ctaLabel: 'Reservar',
        price: entry.data.prices.length
          ? { label: entry.data.prices[0].label, amount: entry.data.prices[0].amount }
          : undefined,
        date: new Date(entry.data.event_start),
        _orden: entry.data.orden ?? 0,
      });
    }
  }

  if (collections.includes('pasadias')) {
    const all = await getCollection('pasadias');
    const localePasadias = all.filter(p => (p.data.locale ?? 'es') === locale);
    const sourcePasadias = localePasadias.length > 0 ? localePasadias : all.filter(p => (p.data.locale ?? 'es') === 'es');
    for (const entry of sourcePasadias) {
      if (!entry.data.destacado) continue;

      items.push({
        collection: 'pasadias',
        slug: entry.id,
        image: entry.data.image,
        title: entry.data.title,
        description: entry.data.description,
        url: `/pasadias/${entry.id}`,
        ctaLabel: 'Reservar',
        price: entry.data.prices.length
          ? { label: entry.data.prices[0].label, amount: entry.data.prices[0].amount }
          : undefined,
        _orden: entry.data.orden ?? 0,
      });
    }
  }

  items.sort((a, b) => {
    if (a._orden !== b._orden) return a._orden - b._orden;
    if (a.date && b.date) return a.date.getTime() - b.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  if (maxItems !== undefined) {
    return items.slice(0, maxItems);
  }
  return items;
}
