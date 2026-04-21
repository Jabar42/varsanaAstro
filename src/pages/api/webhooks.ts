import type { APIRoute } from 'astro';
import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const accessToken = import.meta.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN no está definido en las variables de entorno');
      return new Response('Error de configuración', { status: 500 });
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    // Mercado Pago envía los parámetros topic e id en la query string
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic');
    const id = url.searchParams.get('id');

    if (!topic || !id) {
      return new Response('Faltan parámetros topic o id', { status: 400 });
    }

    // Validar que el topic sea soportado
    if (topic !== 'payment' && topic !== 'merchant_order') {
      return new Response(`Topic no soportado: ${topic}`, { status: 400 });
    }

    // Consultar el recurso correspondiente usando el SDK
    if (topic === 'payment') {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id });

      // Validar el estado del pago antes de proceder
      if (!payment || !payment.status) {
        console.error('No se pudo obtener el pago o falta estado:', payment);
        return new Response('Pago no encontrado', { status: 404 });
      }

      console.log(`Webhook payment recibido: ID=${id}, status=${payment.status}`);

      // Aquí iría la lógica de negocio: actualizar base de datos, enviar email, etc.
      // Por ahora solo registramos en consola
      switch (payment.status) {
        case 'approved':
          console.log('Pago aprobado, actualizando orden...');
          // TODO: actualizar orden en base de datos como pagada
          break;
        case 'pending':
          console.log('Pago pendiente, manteniendo orden en espera...');
          break;
        case 'rejected':
          console.log('Pago rechazado, marcando orden como fallida...');
          break;
        default:
          console.log(`Estado no manejado: ${payment.status}`);
      }

    } else if (topic === 'merchant_order') {
      const merchantOrderClient = new MerchantOrder(client);
      const merchantOrder = await merchantOrderClient.get({ merchantOrderId: id });

      if (!merchantOrder) {
        console.error('No se pudo obtener la merchant order');
        return new Response('Merchant order no encontrada', { status: 404 });
      }

      console.log(`Webhook merchant_order recibido: ID=${id}, status=${merchantOrder.status}`);

      // La merchant order contiene un array de pagos (payments)
      // Se puede iterar sobre ellos para tomar decisiones
      // Por ahora solo registramos
      if (merchantOrder.payments && merchantOrder.payments.length > 0) {
        console.log(`Payments asociados: ${merchantOrder.payments.map(p => p.id).join(', ')}`);
      }
    }

    // Siempre responder 200 OK para confirmar recepción
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
};