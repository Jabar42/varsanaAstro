import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { c as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DpYl7aVH.mjs';
import { $ as $$Layout } from './Layout_CqN0jZ5c.mjs';
import { Leaf, Coffee, Home, Heart, CheckCircle2, Info } from 'lucide-react';

const $$Voluntariado = createComponent(($$result, $$props, $$slots) => {
  const activities = [
    { title: "Agricultura Orgánica", description: "Participa en la siembra, cuidado y cosecha de alimentos saludables en nuestra huerta.", icon: Leaf },
    { title: "Cocina Vegetariana", description: "Aprende el arte de la cocina consciente y saludable preparando alimentos para la community.", icon: Coffee },
    { title: "Mantenimiento y Bioconstrucción", description: "Ayuda en el mejoramiento de las instalaciones usando técnicas sostenibles.", icon: Home },
    { title: "Proyectos Especiales", description: "Si tienes habilidades en diseño, comunicaciones o artes, puedes aportar a la visibilidad de la aldea.", icon: Heart }
  ];
  const includes = [
    "Alojamiento en la eco-aldea",
    "Alimentación vegetariana completa (3 comidas al día)",
    "Participación en programas de yoga y meditación",
    "Conexión profunda con la naturaleza",
    "Descubrimiento de nuevas habilidades sostenibles"
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Programa de Voluntariado | Varsana Eco Yoga Aldea", "data-astro-cid-mmr3ssd5": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12" data-astro-cid-mmr3ssd5> <!-- Hero Section --> <section class="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" data-astro-cid-mmr3ssd5> <div class="space-y-6" data-astro-cid-mmr3ssd5> <h1 class="text-4xl md:text-6xl font-bold tracking-tightest leading-tight" data-astro-cid-mmr3ssd5>
Programa de Voluntariado Cerca a Bogotá
</h1> <p class="text-gray-500 text-xl leading-relaxed" data-astro-cid-mmr3ssd5>
Una experiencia especial para quienes desean vivir en una eco-aldea, conectar con la naturaleza y descubrir nuevas habilidades.
</p> <div class="flex flex-wrap gap-4 pt-4" data-astro-cid-mmr3ssd5> <button class="bg-rausch text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg" data-astro-cid-mmr3ssd5>
Inscribirme ahora
</button> <button class="border border-near-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors" data-astro-cid-mmr3ssd5>
Ver actividades
</button> </div> </div> <div class="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-airbnb" data-astro-cid-mmr3ssd5> <img src="https://picsum.photos/seed/voluntariado/1200/900" alt="Voluntarios en Varsana" class="w-full h-full object-cover" referrerpolicy="no-referrer" data-astro-cid-mmr3ssd5> </div> </section> <!-- Activities Grid --> <section class="mb-24" data-astro-cid-mmr3ssd5> <div class="mb-12" data-astro-cid-mmr3ssd5> <h2 class="text-3xl font-bold tracking-tightest mb-4" data-astro-cid-mmr3ssd5>¿Qué harás como voluntario?</h2> <p class="text-gray-500 text-lg" data-astro-cid-mmr3ssd5>Participa en actividades sostenibles y descubre el ritmo de la vida consciente.</p> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" data-astro-cid-mmr3ssd5> ${activities.map((act) => renderTemplate`<div class="p-8 bg-white border border-gray-100 rounded-[24px] shadow-airbnb hover:shadow-airbnb-hover transition-shadow space-y-4" data-astro-cid-mmr3ssd5> <div class="w-12 h-12 bg-rausch/10 rounded-xl flex items-center justify-center text-rausch" data-astro-cid-mmr3ssd5> ${renderComponent($$result2, "act.icon", act.icon, { "size": 24, "data-astro-cid-mmr3ssd5": true })} </div> <h3 class="text-xl font-bold tracking-tightest" data-astro-cid-mmr3ssd5>${act.title}</h3> <p class="text-gray-500 text-sm leading-relaxed" data-astro-cid-mmr3ssd5>${act.description}</p> </div>`)} </div> </section> <!-- What's Included --> <section class="mb-24 bg-light-surface rounded-[40px] p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" data-astro-cid-mmr3ssd5> <div class="space-y-8" data-astro-cid-mmr3ssd5> <h2 class="text-3xl md:text-4xl font-bold tracking-tightest" data-astro-cid-mmr3ssd5>Tu estancia incluye</h2> <ul class="space-y-4" data-astro-cid-mmr3ssd5> ${includes.map((item) => renderTemplate`<li class="flex items-center gap-4 text-lg font-medium" data-astro-cid-mmr3ssd5> ${renderComponent($$result2, "CheckCircle2", CheckCircle2, { "className": "text-rausch shrink-0", "size": 24, "data-astro-cid-mmr3ssd5": true })} <span data-astro-cid-mmr3ssd5>${item}</span> </li>`)} </ul> <div class="pt-4" data-astro-cid-mmr3ssd5> <div class="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm" data-astro-cid-mmr3ssd5> ${renderComponent($$result2, "Info", Info, { "className": "text-rausch shrink-0", "size": 32, "data-astro-cid-mmr3ssd5": true })} <p class="text-sm text-gray-600" data-astro-cid-mmr3ssd5>
Buscamos voluntarios comprometidos, con ganas de aprender y compartir en un ambiente de respeto y espiritualidad.
</p> </div> </div> </div> <div class="grid grid-cols-2 gap-4" data-astro-cid-mmr3ssd5> <img src="https://picsum.photos/seed/garden2/600/800" class="rounded-3xl shadow-md" alt="Huerta" referrerpolicy="no-referrer" data-astro-cid-mmr3ssd5> <img src="https://picsum.photos/seed/community2/600/800" class="rounded-3xl shadow-md mt-8" alt="Comunidad" referrerpolicy="no-referrer" data-astro-cid-mmr3ssd5> </div> </section> <!-- FAQ / Info Section --> <section class="max-w-3xl mx-auto mb-24 space-y-12" data-astro-cid-mmr3ssd5> <div class="text-center" data-astro-cid-mmr3ssd5> <h2 class="text-3xl font-bold tracking-tightest mb-4" data-astro-cid-mmr3ssd5>Preguntas Frecuentes</h2> <p class="text-gray-500" data-astro-cid-mmr3ssd5>Todo lo que necesitas saber antes de venir.</p> </div> <div class="space-y-6" data-astro-cid-mmr3ssd5> <div class="border-b border-gray-200 pb-6" data-astro-cid-mmr3ssd5> <h4 class="font-bold text-lg mb-2" data-astro-cid-mmr3ssd5>¿Qué debo traer?</h4> <p class="text-gray-600" data-astro-cid-mmr3ssd5>Ropa cómoda para trabajo de campo, botas de caucho, linterna, artículos de aseo personal biodegradables y muchas ganas de aprender.</p> </div> <div class="border-b border-gray-200 pb-6" data-astro-cid-mmr3ssd5> <h4 class="font-bold text-lg mb-2" data-astro-cid-mmr3ssd5>¿Hay requisitos de alimentación?</h4> <p class="text-gray-600" data-astro-cid-mmr3ssd5>En Varsana seguimos una dieta vegetariana consciente. No se permite el consumo de carne, huevos, alcohol ni tabaco dentro de la aldea.</p> </div> <div class="border-b border-gray-200 pb-6" data-astro-cid-mmr3ssd5> <h4 class="font-bold text-lg mb-2" data-astro-cid-mmr3ssd5>¿Cuál es la duración mínima?</h4> <p class="text-gray-600" data-astro-cid-mmr3ssd5>Recomendamos una estancia mínima de una semana para poder integrarte plenamente en las actividades y el ritmo de la comunidad.</p> </div> </div> </section> </main> ` })}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/voluntariado.astro", void 0);

const $$file = "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/voluntariado.astro";
const $$url = "/voluntariado";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Voluntariado,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
