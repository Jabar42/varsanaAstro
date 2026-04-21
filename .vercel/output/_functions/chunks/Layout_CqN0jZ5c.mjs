import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { j as createRenderInstruction, m as maybeRenderHead, a as addAttribute, c as renderComponent, r as renderTemplate, k as renderSlot, l as renderHead } from './entrypoint_DpYl7aVH.mjs';
import { House, Calendar, Info, Images, Tent, Map, Users, Compass, Phone, Mail, MessageCircle, MapPin, Globe, Facebook, Instagram, Youtube } from 'lucide-react';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$CategoryBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$CategoryBar;
  const { align = "end" } = Astro2.props;
  const alignmentClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end"
  };
  const alignmentClass = alignmentClasses[align] || "justify-end";
  const containerClass = `max-w-none md:max-w-7xl mx-auto flex flex-nowrap items-center ${alignmentClass} gap-8 md:gap-12 w-max md:w-auto`;
  const categories = [
    { name: "Inicio", icon: House, href: "/" },
    { name: "Eventos", icon: Calendar, href: "/events" },
    { name: "Nosotros", icon: Info, href: "/nosotros" },
    { name: "Galeria", icon: Images, href: "/" },
    { name: "Hospedaje", icon: Tent, href: "/" },
    { name: "Pasadias", icon: Map, href: "/pasadias" },
    { name: "Voluntariado", icon: Users, href: "/voluntariado" },
    { name: "Retiros", icon: Compass, href: "/" }
  ];
  const firstRootIndex = categories.findIndex((cat) => cat.href === "/");
  const currentPath = Astro2.url.pathname;
  const isActive = (href, index) => {
    if (href === "/") {
      if (currentPath !== "/") return false;
      return index === firstRootIndex;
    }
    return currentPath.startsWith(href);
  };
  return renderTemplate`${maybeRenderHead()}<div class="bg-white border-t border-gray-100 py-2 overflow-x-auto no-scrollbar scroll-smooth" data-astro-cid-xocjh5a2> <div${addAttribute(containerClass, "class")} data-astro-cid-xocjh5a2> ${categories.map((cat, i) => renderTemplate`<a${addAttribute(cat.href, "href")}${addAttribute(`flex flex-col items-center gap-0 min-w-fit flex-shrink-0 group cursor-pointer border-b transition-all duration-600 pb-0 ${isActive(cat.href, i) ? "border-near-black opacity-100" : "border-transparent opacity-60 hover:opacity-100 hover:border-saffron"}`, "class")} data-astro-cid-xocjh5a2> ${renderComponent($$result, "cat.icon", cat.icon, { "size": 20, "strokeWidth": 1.5, "data-astro-cid-xocjh5a2": true })} <span class="text-xs font-medium whitespace-nowrap leading-none" data-astro-cid-xocjh5a2>${cat.name}</span> </a>`)} </div> </div>  ${renderScript($$result, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/CategoryBar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/CategoryBar.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 bg-white border-b border-gray-100"> <div class="max-w-7xl mx-auto px-8 py-2 md:px-16 lg:px-24"> <!-- Top row: logo & contact --> <div class="flex items-center justify-between"> <!-- Logo --> <a href="/" class="flex items-center  cursor-pointer group"> <div class="h-6 w-auto overflow-hidden"> <img src="/logo/logovarsana.png" alt="Varsana Logo" class="h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105" referrerpolicy="no-referrer"> </div> <span class="text-2xl font-bold tracking-tightest block font-display text-forest">Varsana</span> </a> <!-- Contact Info --> <div class="flex items-center gap-4 md:gap-8"> <!-- Desktop contact info (hidden on mobile) --> <div class="hidden md:flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-6 text-sm font-semibold"> <a href="tel:+573214538242" class="flex items-center gap-2 hover:text-rausch transition-colors"> ${renderComponent($$result, "Phone", Phone, { "size": 16, "className": "text-rausch" })} <span class="hidden sm:inline">+57 321 4538242</span> </a> <a href="mailto:contacto@varsana.com" class="flex items-center gap-2 hover:text-rausch transition-colors"> ${renderComponent($$result, "Mail", Mail, { "size": 16, "className": "text-rausch" })} <span class="hidden sm:inline">contacto@varsana.com</span> </a> </div> <!-- Mobile-only icons (WhatsApp & Location) --> <div class="flex md:hidden items-center gap-4"> <a href="https://wa.me/573214538242" target="_blank" rel="noopener" class="p-2 hover:bg-sacred-sand rounded-full cursor-pointer transition-colors"> ${renderComponent($$result, "MessageCircle", MessageCircle, { "size": 18, "className": "text-rausch" })} </a> <a href="https://maps.google.com/?q=Varsana" target="_blank" rel="noopener" class="p-2 hover:bg-sacred-sand rounded-full cursor-pointer transition-colors"> ${renderComponent($$result, "MapPin", MapPin, { "size": 18, "className": "text-rausch" })} </a> </div> <!-- Globe icon (hidden on mobile) --> <div class="p-2 hover:bg-sacred-sand rounded-full cursor-pointer transition-colors hidden md:block"> ${renderComponent($$result, "Globe", Globe, { "size": 18 })} </div> </div> </div> <!-- Navigation row --> ${renderComponent($$result, "CategoryBar", $$CategoryBar, {})} </div> </header>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="bg-light-surface border-t border-gray-200 mt-16 px-6 py-12 md:px-12 lg:px-20"> <div class="max-w-7xl mx-auto"> <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-300"> <div class="space-y-4"> <h4 class="font-bold text-sm uppercase tracking-wider">Programas</h4> <ul class="space-y-3 text-sm text-secondary-gray"> <li class="hover:underline cursor-pointer">Yoga y Meditación</li> <li class="hover:underline cursor-pointer">Voluntariado</li> <li class="hover:underline cursor-pointer"><a href="/pasadias">Pasadías Ecológicos</a></li> <li class="hover:underline cursor-pointer">Retiros Espirituales</li> <li class="hover:underline cursor-pointer">Talleres de Cocina</li> </ul> </div> <div class="space-y-4"> <h4 class="font-bold text-sm uppercase tracking-wider">Comunidad</h4> <ul class="space-y-3 text-sm text-secondary-gray"> <li class="hover:underline cursor-pointer">Varsana.org</li> <li class="hover:underline cursor-pointer">Proyectos Sociales</li> <li class="hover:underline cursor-pointer">Agricultura Orgánica</li> <li class="hover:underline cursor-pointer">Eco-Construcción</li> </ul> </div> <div class="space-y-4"> <h4 class="font-bold text-sm uppercase tracking-wider">Sobre Nosotros</h4> <ul class="space-y-3 text-sm text-secondary-gray"> <li class="hover:underline cursor-pointer">Nuestra Historia</li> <li class="hover:underline cursor-pointer">Filosofía</li> <li class="hover:underline cursor-pointer">Galería</li> <li class="hover:underline cursor-pointer">Preguntas Frecuentes</li> </ul> </div> <div class="space-y-4"> <h4 class="font-bold text-sm uppercase tracking-wider">Contacto</h4> <ul class="space-y-3 text-sm text-secondary-gray"> <li class="hover:underline cursor-pointer">+57 321 4538242</li> <li class="hover:underline cursor-pointer">contacto@varsana.com</li> <li class="hover:underline cursor-pointer">Granada, Cundinamarca</li> <li class="hover:underline cursor-pointer">Colombia</li> </ul> </div> </div> <div class="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"> <div class="flex flex-wrap justify-center gap-2 text-secondary-gray"> <span>© 2024 Varsana Eco Yoga Aldea</span> <span>·</span> <span class="hover:underline cursor-pointer">Privacidad</span> <span>·</span> <span class="hover:underline cursor-pointer">Condiciones</span> <span>·</span> <span class="hover:underline cursor-pointer">Mapa del sitio</span> </div> <div class="flex items-center gap-6 font-semibold"> <div class="flex items-center gap-2 hover:underline cursor-pointer"> ${renderComponent($$result, "Globe", Globe, { "size": 16 })} <span>Español (CO)</span> </div> <div class="flex items-center gap-2 hover:underline cursor-pointer"> <span>$</span> <span>COP</span> </div> <div class="flex items-center gap-4"> ${renderComponent($$result, "Facebook", Facebook, { "size": 18 })} ${renderComponent($$result, "Instagram", Instagram, { "size": 18 })} ${renderComponent($$result, "Youtube", Youtube, { "size": 18 })} </div> </div> </div> </div> </footer>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/components/Footer.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const propsStr = JSON.stringify(Astro2.props);
  const paramsStr = JSON.stringify(Astro2.params);
  return renderTemplate`${renderComponent($$result, "vercel-speed-insights", "vercel-speed-insights", { "data-props": propsStr, "data-params": paramsStr, "data-pathname": Astro2.url.pathname })} ${renderScript($$result, "/home/j/Documents/nullclaw-work/varsanaAstro/node_modules/@vercel/speed-insights/dist/astro/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/node_modules/@vercel/speed-insights/dist/astro/index.astro", void 0);

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Varsana Eco Yoga Aldea", description = "" } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${description && renderTemplate`<meta name="description"${addAttribute(description, "content")}>`}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderComponent($$result, "SpeedInsights", $$Index, {})}${renderSlot($$result, $$slots["head"])}${renderHead()}</head> <body class="bg-white text-near-black font-sans antialiased"> ${renderComponent($$result, "Header", $$Header, {})} <main> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
