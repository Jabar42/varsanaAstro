import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { m as maybeRenderHead, a as addAttribute, c as renderComponent, r as renderTemplate } from './entrypoint_DpYl7aVH.mjs';
import { $ as $$Layout } from './Layout_CqN0jZ5c.mjs';
import { Mail, Phone, Globe, Youtube, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';
import { g as getCollection } from './_astro_content_CTymiYzW.mjs';

const $$MemberCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MemberCard;
  const { member } = Astro2.props;
  const { nombre, rol, descripcion, imagen, enlaces_sociales, correo, telefono } = member.data;
  const getSocialIcon = (platform) => {
    const normalized = platform.toLowerCase();
    switch (normalized) {
      case "instagram":
        return Instagram;
      case "twitter":
      case "x":
        return Twitter;
      case "linkedin":
        return Linkedin;
      case "facebook":
        return Facebook;
      case "youtube":
        return Youtube;
      default:
        return Globe;
    }
  };
  return renderTemplate`${maybeRenderHead()}<article class="bg-white rounded-[20px] shadow-airbnb overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.02] cursor-pointer group" data-astro-cid-6qtsqqpf> <div class="aspect-square overflow-hidden relative" data-astro-cid-6qtsqqpf> <img${addAttribute(imagen, "src")}${addAttribute(nombre, "alt")} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer" data-astro-cid-6qtsqqpf> </div> <div class="p-6 flex flex-col flex-grow space-y-3" data-astro-cid-6qtsqqpf> <div class="space-y-1" data-astro-cid-6qtsqqpf> <h3 class="text-2xl font-bold tracking-tightest leading-tight font-display" data-astro-cid-6qtsqqpf>${nombre}</h3> <p class="text-sm text-saffron font-semibold uppercase tracking-wider" data-astro-cid-6qtsqqpf>${rol}</p> </div> <p class="text-gray-600 line-clamp-3 text-[15px] leading-relaxed" data-astro-cid-6qtsqqpf> ${descripcion.slice(0, 150)}${descripcion.length > 150 ? "..." : ""} </p>  ${enlaces_sociales && enlaces_sociales.length > 0 && renderTemplate`<div class="flex items-center gap-3 pt-2" data-astro-cid-6qtsqqpf> ${enlaces_sociales.map((enlace) => {
    const Icon = getSocialIcon(enlace.plataforma);
    return renderTemplate`<a${addAttribute(enlace.url, "href")} target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-saffron transition-colors"${addAttribute(enlace.plataforma, "title")} data-astro-cid-6qtsqqpf> ${renderComponent($$result, "Icon", Icon, { "size": 18, "data-astro-cid-6qtsqqpf": true })} </a>`;
  })} </div>`}  <div class="pt-4 mt-auto border-t border-gray-100 space-y-2" data-astro-cid-6qtsqqpf> ${correo && renderTemplate`<div class="flex items-center gap-2 text-sm text-gray-600" data-astro-cid-6qtsqqpf> ${renderComponent($$result, "Mail", Mail, { "size": 14, "className": "text-saffron", "data-astro-cid-6qtsqqpf": true })} <a${addAttribute(`mailto:${correo}`, "href")} class="hover:text-saffron" data-astro-cid-6qtsqqpf>${correo}</a> </div>`} ${telefono && renderTemplate`<div class="flex items-center gap-2 text-sm text-gray-600" data-astro-cid-6qtsqqpf> ${renderComponent($$result, "Phone", Phone, { "size": 14, "className": "text-saffron", "data-astro-cid-6qtsqqpf": true })} <a${addAttribute(`tel:${telefono}`, "href")} class="hover:text-saffron" data-astro-cid-6qtsqqpf>${telefono}</a> </div>`} </div> </div> </article>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/MemberCard.astro", void 0);

const $$Nosotros = createComponent(async ($$result, $$props, $$slots) => {
  const allMembers = await getCollection("nosotros");
  const activeMembers = allMembers.filter((m) => m.data.activo);
  const sortedMembers = activeMembers.sort((a, b) => a.data.orden - b.data.orden);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Nuestro Equipo | Varsana Eco Yoga Aldea" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16"> <div class="mb-12"> <h1 class="text-5xl font-bold tracking-tightest mb-4">Nuestro Equipo</h1> <p class="text-gray-500 text-xl">Conoce a las personas que hacen posible Varsana Eco Yoga Aldea.</p> </div> ${sortedMembers.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"> ${sortedMembers.map((member) => renderTemplate`${renderComponent($$result2, "MemberCard", $$MemberCard, { "member": member })}`)} </div>` : renderTemplate`<div class="py-20 text-center bg-gray-50 rounded-3xl"> <p class="text-2xl font-medium text-gray-400">No hay miembros activos en este momento.</p> <a href="/" class="mt-6 inline-block text-rausch font-bold underline">Volver al inicio</a> </div>`} </main> ` })}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/nosotros.astro", void 0);

const $$file = "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/nosotros.astro";
const $$url = "/nosotros";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Nosotros,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
