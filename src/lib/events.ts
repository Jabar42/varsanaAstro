import { getCollection } from 'astro:content';

/**
 * Obtiene todos los eventos de la colección, filtra los pasados
 * y los ordena por fecha (más cercanos primero).
 */
export async function getUpcomingEvents() {
  const allEvents = await getCollection('events');
  const now = new Date();
  
  return allEvents
    .filter(event => {
      // Aseguramos que la fecha del evento sea hoy o en el futuro
      const eventDate = new Date(event.data.event_date);
      return eventDate >= now;
    })
    .sort((a, b) => {
      return new Date(a.data.event_date).getTime() - new Date(b.data.event_date).getTime();
    });
}

/**
 * Determina el precio vigente basado en los deadlines.
 * Retorna el primer precio cuyo deadline no ha pasado, o el último si todos pasaron.
 */
export function getCurrentPrice(prices: any[]) {
  if (!prices || prices.length === 0) return null;
  
  const now = new Date();
  
  // Buscamos el primer precio con deadline futuro
  const activePrice = prices.find(price => {
    if (!price.deadline) return false;
    return new Date(price.deadline) > now;
  });
  
  // Si no hay ninguno con deadline futuro, devolvemos el último (que suele ser el Regular)
  return activePrice || prices[prices.length - 1];
}
