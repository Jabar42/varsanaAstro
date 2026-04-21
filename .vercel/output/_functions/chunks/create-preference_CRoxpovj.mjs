import { MercadoPagoConfig, Preference } from 'mercadopago';
import crypto from 'node:crypto';

const prerender = false;
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
function generateIdempotencyKey(request) {
  const data = JSON.stringify(request);
  return crypto.createHash("sha256").update(data).digest("hex");
}
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El array "items" no puede estar vacío' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    for (const item of body.items) {
      if (item.unit_price <= 0) {
        return new Response(
          JSON.stringify({ error: `El precio unitario del item ${item.id} debe ser positivo` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: `La cantidad del item ${item.id} debe ser positiva` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    if (!body.payer_email || !isValidEmail(body.payer_email)) {
      return new Response(
        JSON.stringify({ error: "El email del pagador es inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const accessToken = "APP_USR-2911311044190645-042113-85ecd2b244f61d3957a62061062b7f48-50293683";
    if (!accessToken) ;
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5e3 }
    });
    const preference = new Preference(client);
    const site = "http://localhost:3000";
    const baseUrl = site.endsWith("/") ? site.slice(0, -1) : site;
    const backUrls = {
      success: `${baseUrl}/pago/exito`,
      failure: `${baseUrl}/pago/fallo`,
      pending: `${baseUrl}/pago/pendiente`
    };
    const mpItems = body.items.map((item) => ({
      id: item.id,
      title: item.title || `Producto ${item.id}`,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: "COP"
      // Moneda colombiana, ajustar según necesidad
    }));
    const requestOptions = {
      idempotencyKey: generateIdempotencyKey(body),
      timeout: 5e3
    };
    const response = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: body.payer_email
        },
        back_urls: backUrls,
        auto_return: "approved",
        external_reference: body.external_reference
      },
      requestOptions
    });
    if (!response.id || !response.init_point) {
      console.error("Respuesta de Mercado Pago incompleta:", response);
      return new Response(
        JSON.stringify({ error: "La preferencia creada no contiene datos válidos" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    };
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo crear la preferencia de pago" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
