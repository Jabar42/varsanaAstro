import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { c as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DpYl7aVH.mjs';
import { $ as $$Layout } from './Layout_CqN0jZ5c.mjs';
import { $ as $$EventCard } from './EventCard_CYj9iunv.mjs';
import { a as getUpcomingEvents } from './events_CiUs4K4Y.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const upcomingEvents = await getUpcomingEvents();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Calendario de Eventos | Varsana Eco Yoga Aldea" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16"> <div class="mb-12"> <h1 class="text-5xl font-bold tracking-tightest mb-4">Calendario de Eventos</h1> <p class="text-gray-500 text-xl">Explora todas nuestras próximas actividades y retiros.</p> </div> ${upcomingEvents.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"> ${upcomingEvents.map((event) => renderTemplate`${renderComponent($$result2, "EventCard", $$EventCard, { ...event.data, "slug": event.id })}`)} </div>` : renderTemplate`<div class="py-20 text-center bg-gray-50 rounded-3xl"> <p class="text-2xl font-medium text-gray-400">No hay eventos programados por ahora.</p> <a href="/" class="mt-6 inline-block text-rausch font-bold underline">Volver al inicio</a> </div>`} </main> ` })}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/events/index.astro", void 0);

const $$file = "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/events/index.astro";
const $$url = "/events";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
