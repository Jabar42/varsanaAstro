import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate, c as renderComponent } from './entrypoint_DpYl7aVH.mjs';
import { $ as $$Layout } from './Layout_CqN0jZ5c.mjs';
import { $ as $$EventCard } from './EventCard_CYj9iunv.mjs';
import 'clsx';
import { a as getUpcomingEvents } from './events_CiUs4K4Y.mjs';

const $$PhotoGallery = createComponent(($$result, $$props, $$slots) => {
  const photos = [
    {
      src: "https://picsum.photos/seed/varsana-temple/1200/800",
      alt: "Templo principal de Varsana",
      className: "md:col-span-2 md:row-span-2"
    },
    {
      src: "https://picsum.photos/seed/varsana-yoga/800/600",
      alt: "Práctica de yoga al amanecer",
      className: "md:col-span-1 md:row-span-1"
    },
    {
      src: "https://picsum.photos/seed/varsana-nature/800/600",
      alt: "Senderos ecológicos",
      className: "md:col-span-1 md:row-span-1"
    },
    {
      src: "https://picsum.photos/seed/varsana-food/800/600",
      alt: "Comida vegetariana consciente",
      className: "md:col-span-1 md:row-span-1"
    },
    {
      src: "https://picsum.photos/seed/varsana-community/800/600",
      alt: "Comunidad y voluntariado",
      className: "md:col-span-1 md:row-span-1"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="mt-20"> <div class="flex items-end justify-between mb-8"> <div class="space-y-2"> <h2 class="text-4xl font-bold tracking-tight font-display">Galería de Varsana</h2> <p class="text-secondary-gray text-lg">Explora la belleza y serenidad de nuestra aldea ecológica.</p> </div> <button class="hidden md:block text-near-black font-semibold underline underline-offset-4 hover:text-rausch transition-colors">
Ver todas las fotos
</button> </div> <div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px] lg:h-[600px]"> ${photos.map((photo) => renderTemplate`<div${addAttribute(`relative overflow-hidden rounded-2xl group cursor-pointer aspect-square md:aspect-auto ${photo.className || ""}`, "class")}> <img${addAttribute(photo.src, "src")}${addAttribute(photo.alt, "alt")} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerpolicy="no-referrer"> <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"> <p class="text-white font-medium text-sm drop-shadow-md">${photo.alt}</p> </div> </div>`)} </div> <button class="md:hidden mt-6 w-full py-3 border border-near-black rounded-lg font-bold hover:bg-light-surface transition-colors">
Ver todas las fotos
</button> </section>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/PhotoGallery.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const upcomingEvents = await getUpcomingEvents();
  const featuredEvents = upcomingEvents.slice(0, 3);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Varsana Eco Yoga Aldea | Eventos y Retiros" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8"> <!-- Hero Section --> <section class="mb-16 relative rounded-[32px] overflow-hidden h-[450px] md:h-[550px] shadow-airbnb"> <img src="https://picsum.photos/seed/varsana-hero/1920/1080" alt="Varsana Eco Yoga Aldea" class="w-full h-full object-cover" referrerpolicy="no-referrer"> <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-center text-center p-6"> <h1 class="text-white text-5xl md:text-8xl font-bold tracking-tightest mb-6 drop-shadow-xl font-display">
Vive la experiencia Varsana
</h1> <p class="text-white/90 text-xl md:text-2xl font-medium mb-10 max-w-2xl drop-shadow-md">
Retiros, talleres y festivales diseñados para elevar tu consciencia.
</p> <a href="/events" class="bg-rausch text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
Ver calendario completo
</a> </div> </section> <!-- Featured Events Section --> <section class="mb-20"> <div class="flex items-end justify-between mb-10"> <div class="space-y-2"> <h2 class="text-4xl md:text-5xl font-bold tracking-tightest font-display">Próximas Experiencias</h2> <p class="text-gray-500 text-lg">Los eventos más cercanos para tu transformación.</p> </div> <a href="/events" class="hidden md:block text-near-black font-semibold underline underline-offset-4 hover:text-rausch transition-colors">
Ver todos los eventos
</a> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> ${featuredEvents.map((event) => renderTemplate`${renderComponent($$result2, "EventCard", $$EventCard, { ...event.data, "slug": event.id })}`)} </div> <div class="mt-12 text-center md:hidden"> <a href="/events" class="inline-block w-full py-4 border border-near-black rounded-xl font-bold hover:bg-gray-50 transition-colors">
Ver todos los eventos
</a> </div> </section> <!-- Photo Gallery Section --> ${renderComponent($$result2, "PhotoGallery", $$PhotoGallery, {})} <!-- Call to Action --> <section class="mt-24 bg-near-black rounded-[32px] md:rounded-[40px] p-8 md:p-16 lg:p-24 text-white flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl text-center lg:text-left"> <div class="space-y-8 z-10 max-w-2xl"> <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tightest">
¿Listo para tu transformación?
</h2> <p class="text-gray-400 text-lg md:text-xl leading-relaxed">
Únete a cientos de personas que han encontrado paz y propósito en nuestra aldea. Tu viaje comienza aquí.
</p> <div class="flex flex-wrap gap-4 md:gap-6 justify-center lg:justify-start"> <button class="w-full sm:w-auto bg-rausch hover:bg-[#e00b41] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg transition-all hover:shadow-lg active:scale-95">
Reservar ahora
</button> <button class="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg transition-all">
Contactar guía
</button> </div> </div> <div class="relative w-full lg:w-1/2 aspect-video rounded-3xl overflow-hidden shadow-2xl rotate-0 lg:rotate-2 hover:rotate-0 transition-transform duration-500"> <img src="https://picsum.photos/seed/meditation-cta/1200/750" alt="Meditación" class="w-full h-full object-cover" referrerpolicy="no-referrer"> </div> </section> </main> ` })}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/index.astro", void 0);

const $$file = "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
