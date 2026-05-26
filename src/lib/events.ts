import { getCollection } from 'astro:content';

/**
 * Obtiene todos los eventos de la colección, filtra los pasados
 * y los ordena por fecha de inicio (más cercanos primero).
 * Usa event_end si está disponible, o event_start como fecha final.
 */
export async function getUpcomingEvents(locale = 'es') {
  const allEvents = await getCollection('events');
  const now = new Date();

  // Filter by locale, falling back to Spanish content
  const localeEvents = allEvents.filter(e => (e.data.locale ?? 'es') === locale);
  const sourceEvents = localeEvents.length > 0 ? localeEvents : allEvents.filter(e => (e.data.locale ?? 'es') === 'es');

  return sourceEvents
    .filter(event => {
      const eventEnd = event.data.event_end
        ? new Date(event.data.event_end)
        : new Date(event.data.event_start);
      return eventEnd >= now;
    })
    .sort((a, b) => {
      return new Date(a.data.event_start).getTime() - new Date(b.data.event_start).getTime();
    });
}

/**
 * Retorna solo los precios cuyo deadline efectivo (deadline explícito
 * o event_start como fallback) aún no ha pasado.
 */
export function getAvailablePrices(
  prices: { label: string; amount: number; deadline?: Date }[],
  eventStart: Date,
): { label: string; amount: number; deadline?: Date }[] {
  if (!prices || prices.length === 0) return [];
  const now = new Date();
  return prices.filter(price => {
    const effectiveDeadline = price.deadline
      ? new Date(price.deadline)
      : new Date(eventStart);
    return effectiveDeadline > now;
  });
}

/**
 * Determina el precio vigente basado en los deadlines.
 * Retorna el primer precio cuyo deadline no ha pasado, o el último si todos pasaron.
 * Si se proporciona eventStart, se usa como deadline implícito para precios sin deadline.
 */
export function getCurrentPrice(
  prices: { label: string; amount: number; deadline?: Date }[],
  eventStart?: Date,
) {
  if (!prices || prices.length === 0) return null;

  const now = new Date();

  // Buscamos el primer precio con deadline futuro
  const activePrice = prices.find(price => {
    const effectiveDeadline = price.deadline
      ? new Date(price.deadline)
      : (eventStart ? new Date(eventStart) : null);
    if (!effectiveDeadline) return false;
    return effectiveDeadline > now;
  });

  // Si no hay ninguno con deadline futuro, devolvemos el último (que suele ser el Regular)
  return activePrice || prices[prices.length - 1];
}
