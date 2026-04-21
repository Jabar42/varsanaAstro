import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate } from './entrypoint_DpYl7aVH.mjs';
import 'clsx';
import { g as getCurrentPrice } from './events_CiUs4K4Y.mjs';

const $$EventCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$EventCard;
  const { title, description, event_date, image, prices, slug } = Astro2.props;
  const currentPrice = getCurrentPrice(prices);
  const formattedDate = event_date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(`/events/${slug}`, "href")} class="bg-white rounded-[20px] shadow-airbnb overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.02] cursor-pointer group" data-astro-cid-h4bw6n5x> <div class="aspect-[16/10] overflow-hidden relative" data-astro-cid-h4bw6n5x> <img${addAttribute(image, "src")}${addAttribute(title, "alt")} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer" data-astro-cid-h4bw6n5x> ${currentPrice?.label && currentPrice.label !== "General" && renderTemplate`<div class="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm text-rausch" data-astro-cid-h4bw6n5x> ${currentPrice.label} </div>`} </div> <div class="p-6 flex flex-col flex-grow space-y-3" data-astro-cid-h4bw6n5x> <div class="space-y-1" data-astro-cid-h4bw6n5x> <p class="text-saffron font-semibold text-sm uppercase tracking-wider" data-astro-cid-h4bw6n5x>${formattedDate}</p> <h3 class="text-2xl font-bold tracking-tightest leading-tight font-display" data-astro-cid-h4bw6n5x>${title}</h3> </div> <p class="text-gray-600 line-clamp-2 text-[15px] leading-relaxed" data-astro-cid-h4bw6n5x> ${description} </p> <div class="pt-4 mt-auto border-t border-gray-100" data-astro-cid-h4bw6n5x> <div class="flex items-center justify-between" data-astro-cid-h4bw6n5x> <div data-astro-cid-h4bw6n5x> <p class="text-xs text-saffron uppercase font-bold tracking-widest" data-astro-cid-h4bw6n5x> ${currentPrice?.label || "Precio"} </p> <p class="text-xl font-bold tracking-tightest" data-astro-cid-h4bw6n5x>
$${currentPrice?.amount.toLocaleString("es-CO") || "0"} </p> </div> <button class="bg-rausch text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rausch-dark transition-colors shadow-sm" data-astro-cid-h4bw6n5x>
Reservar
</button> </div> </div> </div></a>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/EventCard.astro", void 0);

export { $$EventCard as $ };
