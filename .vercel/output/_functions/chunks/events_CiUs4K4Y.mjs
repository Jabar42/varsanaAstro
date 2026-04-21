import { g as getCollection } from './_astro_content_CTymiYzW.mjs';

async function getUpcomingEvents() {
  const allEvents = await getCollection("events");
  const now = /* @__PURE__ */ new Date();
  return allEvents.filter((event) => {
    const eventDate = new Date(event.data.event_date);
    return eventDate >= now;
  }).sort((a, b) => {
    return new Date(a.data.event_date).getTime() - new Date(b.data.event_date).getTime();
  });
}
function getCurrentPrice(prices) {
  if (!prices || prices.length === 0) return null;
  const now = /* @__PURE__ */ new Date();
  const activePrice = prices.find((price) => {
    if (!price.deadline) return false;
    return new Date(price.deadline) > now;
  });
  return activePrice || prices[prices.length - 1];
}

export { getUpcomingEvents as a, getCurrentPrice as g };
