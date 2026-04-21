import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate, c as renderComponent } from './entrypoint_DpYl7aVH.mjs';
import { $ as $$Layout } from './Layout_CqN0jZ5c.mjs';
import { g as getCollection } from './_astro_content_CTymiYzW.mjs';
import { g as getCurrentPrice } from './events_CiUs4K4Y.mjs';
import { Clock, MapPin } from 'lucide-react';

async function getAllPasadias() {
  const allPasadias = await getCollection("pasadias");
  return allPasadias.sort(
    (a, b) => a.data.title.localeCompare(b.data.title)
  );
}

const $$PasadiaCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PasadiaCard;
  const { title, description, image, prices, duration, meeting_point, category, slug } = Astro2.props;
  const currentPrice = getCurrentPrice(prices);
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(`/pasadias/${slug}`, "href")} class="bg-white rounded-[20px] shadow-airbnb overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.02] cursor-pointer group" data-astro-cid-hkazc6az> <div class="aspect-[16/10] overflow-hidden relative" data-astro-cid-hkazc6az> <img${addAttribute(image, "src")}${addAttribute(title, "alt")} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer" data-astro-cid-hkazc6az> ${currentPrice?.label && currentPrice.label !== "General" && renderTemplate`<div class="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm text-rausch" data-astro-cid-hkazc6az> ${currentPrice.label} </div>`} </div> <div class="p-6 flex flex-col flex-grow space-y-3" data-astro-cid-hkazc6az> <div class="space-y-1" data-astro-cid-hkazc6az> <h3 class="text-2xl font-bold tracking-tightest leading-tight font-display" data-astro-cid-hkazc6az>${title}</h3> </div>  <div class="flex flex-col gap-1 text-sm text-gray-500" data-astro-cid-hkazc6az> <div class="flex items-center gap-2" data-astro-cid-hkazc6az> ${renderComponent($$result, "Clock", Clock, { "size": 14, "className": "text-saffron", "data-astro-cid-hkazc6az": true })} <span data-astro-cid-hkazc6az>${duration}</span> </div> <div class="flex items-center gap-2" data-astro-cid-hkazc6az> ${renderComponent($$result, "MapPin", MapPin, { "size": 14, "className": "text-saffron", "data-astro-cid-hkazc6az": true })} <span class="truncate" data-astro-cid-hkazc6az>${meeting_point}</span> </div> </div> <p class="text-gray-600 line-clamp-2 text-[15px] leading-relaxed" data-astro-cid-hkazc6az> ${description} </p> <div class="pt-4 mt-auto border-t border-gray-100" data-astro-cid-hkazc6az> <div class="flex items-center justify-between" data-astro-cid-hkazc6az> <div data-astro-cid-hkazc6az> <p class="text-xs text-saffron uppercase font-bold tracking-widest" data-astro-cid-hkazc6az> ${currentPrice?.label || "Precio"} </p> <p class="text-xl font-bold tracking-tightest" data-astro-cid-hkazc6az>
$${currentPrice?.amount.toLocaleString("es-CO") || "0"} </p> </div> <button class="bg-rausch text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rausch-dark transition-colors shadow-sm" data-astro-cid-hkazc6az>
Reservar
</button> </div> </div> </div> </a>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/PasadiaCard.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allPasadias = await getAllPasadias();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Pasadías | Varsana Eco Yoga Aldea" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16"> <div class="mb-12"> <h1 class="text-5xl font-bold tracking-tightest mb-4">Pasadías</h1> <p class="text-gray-500 text-xl">Descubre nuestras experiencias de día completo en contacto con la naturaleza y la espiritualidad.</p> </div> ${allPasadias.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"> ${allPasadias.map((pasadia) => renderTemplate`${renderComponent($$result2, "PasadiaCard", $$PasadiaCard, { ...pasadia.data, "slug": pasadia.id })}`)} </div>` : renderTemplate`<div class="py-20 text-center bg-gray-50 rounded-3xl"> <p class="text-2xl font-medium text-gray-400">No hay pasadías disponibles en este momento.</p> <a href="/" class="mt-6 inline-block text-rausch font-bold underline">Volver al inicio</a> </div>`} </main> ` })}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/pasadias/index.astro", void 0);

const $$file = "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/pasadias/index.astro";
const $$url = "/pasadias";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
