import { c as createComponent } from './astro-component_BhDHFbb0.mjs';
import 'piccolore';
import { c as renderComponent, r as renderTemplate, d as Fragment, a as addAttribute, m as maybeRenderHead } from './entrypoint_DpYl7aVH.mjs';
import { $ as $$Layout } from './Layout_CqN0jZ5c.mjs';
import { g as getCollection, r as renderEntry } from './_astro_content_CTymiYzW.mjs';
import { g as getCurrentPrice } from './events_CiUs4K4Y.mjs';
import { Calendar, MapPin, Users, Info, Star } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';

function CheckoutButton({
  itemId,
  itemTitle,
  unitPrice,
  quantity = 1,
  payerEmail,
  externalReference
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(payerEmail || "");
  const handleCheckout = async () => {
    if (!email.trim()) {
      setError("Por favor, ingresa tu email");
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setError("El email ingresado no es válido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: itemId,
              quantity,
              unit_price: unitPrice,
              title: itemTitle
            }
          ],
          payer_email: email,
          external_reference: externalReference
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al crear la preferencia");
      }
      window.location.href = data.init_point;
    } catch (err) {
      console.error("Error en checkout:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "checkout-button-container", children: [
    !payerEmail && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email para recibir detalles del pago" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          id: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          placeholder: "tu@email.com",
          disabled: loading
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md", children: error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleCheckout,
        disabled: loading,
        className: "w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200",
        children: loading ? "Procesando..." : `Pagar $${unitPrice * quantity} COP`
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-gray-500 text-center", children: "Serás redirigido a Mercado Pago para completar la transacción de forma segura." })
  ] });
}

async function getStaticPaths() {
  const events = await getCollection("events");
  return events.map((event) => ({
    params: { slug: event.id },
    props: { event }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { event } = Astro2.props;
  const { title, description, event_date, image, prices } = event.data;
  const { Content } = await renderEntry(event);
  const currentPrice = getCurrentPrice(prices);
  const formattedDate = event_date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site || "https://varsana.com");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${title} | Varsana Eco Yoga Aldea`, "description": description, "data-astro-cid-jugqba64": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-0 md:px-12 lg:px-20 py-0 md:py-8" data-astro-cid-jugqba64> <!-- Photography-first Header --> <div class="md:rounded-[24px] overflow-hidden relative h-[300px] md:h-[500px] lg:h-[600px] shadow-airbnb" data-astro-cid-jugqba64> <img${addAttribute(image, "src")}${addAttribute(title, "alt")} class="w-full h-full object-cover" referrerpolicy="no-referrer" data-astro-cid-jugqba64> </div> <div class="px-6 md:px-0 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12" data-astro-cid-jugqba64> <!-- Main Content Column --> <div class="lg:col-span-2 space-y-8" data-astro-cid-jugqba64> <div class="border-b border-gray-200 pb-8" data-astro-cid-jugqba64> <h1 class="text-4xl md:text-6xl font-bold tracking-tightest mb-4 font-display" data-astro-cid-jugqba64>${title}</h1> <div class="flex flex-wrap gap-6 text-sm font-medium" data-astro-cid-jugqba64> <div class="flex items-center gap-2" data-astro-cid-jugqba64> ${renderComponent($$result2, "Calendar", Calendar, { "size": 18, "className": "text-saffron", "data-astro-cid-jugqba64": true })} <span data-astro-cid-jugqba64>${formattedDate}</span> </div> <div class="flex items-center gap-2" data-astro-cid-jugqba64> ${renderComponent($$result2, "MapPin", MapPin, { "size": 18, "className": "text-saffron", "data-astro-cid-jugqba64": true })} <span data-astro-cid-jugqba64>Granada, Cundinamarca</span> </div> </div> </div> <!-- Host Info --> <div class="flex items-center justify-between border-b border-gray-200 pb-8" data-astro-cid-jugqba64> <div class="space-y-1" data-astro-cid-jugqba64> <h2 class="text-2xl font-bold font-display" data-astro-cid-jugqba64>Experiencia organizada por Varsana</h2> <p class="text-gray-500 text-sm" data-astro-cid-jugqba64>Comunidad intencional · 15 años de sabiduría</p> </div> <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden" data-astro-cid-jugqba64> <img src="https://picsum.photos/seed/host/100/100" alt="Host" class="w-full h-full object-cover" data-astro-cid-jugqba64> </div> </div> <!-- Description --> <div class="prose prose-zinc max-w-none text-gray-700 leading-relaxed text-lg" data-astro-cid-jugqba64> ${renderComponent($$result2, "Content", Content, { "data-astro-cid-jugqba64": true })} <p data-astro-cid-jugqba64>${description}</p> </div> <!-- Features --> <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-8" data-astro-cid-jugqba64> <div class="flex gap-4" data-astro-cid-jugqba64> ${renderComponent($$result2, "Users", Users, { "size": 24, "strokeWidth": 1.5, "data-astro-cid-jugqba64": true })} <div data-astro-cid-jugqba64> <h4 class="font-bold" data-astro-cid-jugqba64>Ambiente Comunitario</h4> <p class="text-gray-500 text-sm" data-astro-cid-jugqba64>Comparte con personas que buscan el mismo camino de paz.</p> </div> </div> <div class="flex gap-4" data-astro-cid-jugqba64> ${renderComponent($$result2, "Info", Info, { "size": 24, "strokeWidth": 1.5, "data-astro-cid-jugqba64": true })} <div data-astro-cid-jugqba64> <h4 class="font-bold" data-astro-cid-jugqba64>Todo Incluido</h4> <p class="text-gray-500 text-sm" data-astro-cid-jugqba64>Alimentación vegetariana consciente y hospedaje ecológico.</p> </div> </div> </div> </div> <!-- Sticky Price Card Column --> <div class="relative" data-astro-cid-jugqba64> <div class="sticky top-28 bg-white border border-gray-200 rounded-[24px] p-6 shadow-airbnb space-y-6" data-astro-cid-jugqba64> <div class="flex justify-between items-end" data-astro-cid-jugqba64> <div data-astro-cid-jugqba64> <span class="text-3xl font-bold tracking-tightest font-display" data-astro-cid-jugqba64>$${currentPrice?.amount.toLocaleString("es-CO")}</span> <span class="text-gray-500 text-base font-normal" data-astro-cid-jugqba64> / persona</span> </div> <div class="flex items-center gap-1 text-sm font-semibold" data-astro-cid-jugqba64> ${renderComponent($$result2, "Star", Star, { "size": 14, "fill": "currentColor", "className": "text-saffron", "data-astro-cid-jugqba64": true })} <span data-astro-cid-jugqba64>4.98</span> </div> </div> <!-- Booking Details Box --> <div class="border border-gray-400 rounded-xl overflow-hidden" data-astro-cid-jugqba64> <div class="grid grid-cols-2 border-b border-gray-400" data-astro-cid-jugqba64> <div class="p-3 border-r border-gray-400" data-astro-cid-jugqba64> <p class="text-[10px] font-bold uppercase" data-astro-cid-jugqba64>Fecha</p> <p class="text-sm" data-astro-cid-jugqba64>${event_date.toLocaleDateString("es-ES")}</p> </div> <div class="p-3" data-astro-cid-jugqba64> <p class="text-[10px] font-bold uppercase" data-astro-cid-jugqba64>Cupos</p> <p class="text-sm" data-astro-cid-jugqba64>Disponibles</p> </div> </div> <div class="p-3" data-astro-cid-jugqba64> <p class="text-[10px] font-bold uppercase" data-astro-cid-jugqba64>Tipo de Entrada</p> <p class="text-sm font-medium text-saffron" data-astro-cid-jugqba64>${currentPrice?.label || "General"}</p> </div> </div> <!-- Payment Button --> ${currentPrice && renderTemplate`${renderComponent($$result2, "CheckoutButton", CheckoutButton, { "client:load": true, "itemId": event.id, "itemTitle": title, "unitPrice": currentPrice.amount, "quantity": 1, "client:component-hydration": "load", "client:component-path": "@/src/components/CheckoutButton", "client:component-export": "default", "data-astro-cid-jugqba64": true })}`} <p class="text-center text-gray-500 text-xs" data-astro-cid-jugqba64>Asegura tu cupo con anticipación</p> <!-- Price Breakdown --> <div class="space-y-3 pt-4" data-astro-cid-jugqba64> <div class="flex justify-between text-gray-600" data-astro-cid-jugqba64> <span class="underline" data-astro-cid-jugqba64>Inscripción ${currentPrice?.label}</span> <span data-astro-cid-jugqba64>$${currentPrice?.amount.toLocaleString("es-CO")}</span> </div> <div class="flex justify-between text-gray-600" data-astro-cid-jugqba64> <span class="underline" data-astro-cid-jugqba64>Servicio de aldea</span> <span data-astro-cid-jugqba64>$0</span> </div> <div class="pt-4 border-t border-gray-200 flex justify-between font-bold text-lg" data-astro-cid-jugqba64> <span data-astro-cid-jugqba64>Total</span> <span data-astro-cid-jugqba64>$${currentPrice?.amount.toLocaleString("es-CO")}</span> </div> </div> </div> </div> </div> </main> `, "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate`  <meta property="og:type" content="website"> <meta property="og:url"${addAttribute(canonicalURL, "content")}> <meta property="og:title"${addAttribute(title, "content")}> <meta property="og:description"${addAttribute(description, "content")}> <meta property="og:image"${addAttribute(image, "content")}> <meta name="twitter:card" content="summary_large_image"> ` })}` })}`;
}, "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/events/[slug].astro", void 0);

const $$file = "/home/j/Documents/nullclaw-work/varsanaAstro/src/pages/events/[slug].astro";
const $$url = "/events/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
