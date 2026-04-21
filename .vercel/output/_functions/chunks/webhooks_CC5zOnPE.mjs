import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const accessToken = "APP_USR-2911311044190645-042113-85ecd2b244f61d3957a62061062b7f48-50293683";
    if (!accessToken) ;
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5e3 }
    });
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic");
    const id = url.searchParams.get("id");
    if (!topic || !id) {
      return new Response("Faltan parámetros topic o id", { status: 400 });
    }
    if (topic !== "payment" && topic !== "merchant_order") {
      return new Response(`Topic no soportado: ${topic}`, { status: 400 });
    }
    if (topic === "payment") {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id });
      if (!payment || !payment.status) {
        console.error("No se pudo obtener el pago o falta estado:", payment);
        return new Response("Pago no encontrado", { status: 404 });
      }
      console.log(`Webhook payment recibido: ID=${id}, status=${payment.status}`);
      switch (payment.status) {
        case "approved":
          console.log("Pago aprobado, actualizando orden...");
          break;
        case "pending":
          console.log("Pago pendiente, manteniendo orden en espera...");
          break;
        case "rejected":
          console.log("Pago rechazado, marcando orden como fallida...");
          break;
        default:
          console.log(`Estado no manejado: ${payment.status}`);
      }
    } else if (topic === "merchant_order") {
      const merchantOrderClient = new MerchantOrder(client);
      const merchantOrder = await merchantOrderClient.get({ merchantOrderId: id });
      if (!merchantOrder) {
        console.error("No se pudo obtener la merchant order");
        return new Response("Merchant order no encontrada", { status: 404 });
      }
      console.log(`Webhook merchant_order recibido: ID=${id}, status=${merchantOrder.status}`);
      if (merchantOrder.payments && merchantOrder.payments.length > 0) {
        console.log(`Payments asociados: ${merchantOrder.payments.map((p) => p.id).join(", ")}`);
      }
    }
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
