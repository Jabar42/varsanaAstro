import type { APIRoute } from 'astro';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { Options } from 'mercadopago/dist/types';
import type { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import crypto from 'node:crypto';

export const prerender = false;

interface CreatePreferenceRequest {
  items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    title?: string;
  }>;
  payer_email: string;
  external_reference?: string;
}

// Validar que el email tenga formato válido (simple)
function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Generar una idempotencyKey determinística a partir de los datos de la preferencia
function generateIdempotencyKey(request: CreatePreferenceRequest): string {
  const data = JSON.stringify(request);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: CreatePreferenceRequest = await request.json();

    // Validaciones básicas
    if (!body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El array "items" no puede estar vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    for (const item of body.items) {
      if (item.unit_price <= 0) {
        return new Response(
          JSON.stringify({ error: `El precio unitario del item ${item.id} debe ser positivo` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: `La cantidad del item ${item.id} debe ser positiva` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!body.payer_email || !isValidEmail(body.payer_email)) {
      return new Response(
        JSON.stringify({ error: 'El email del pagador es inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener token de entorno
    const accessToken = import.meta.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN no está definido en las variables de entorno');
      return new Response(
        JSON.stringify({ error: 'Error de configuración del servidor' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    // Construir back_urls usando SITE (URL base del sitio)
    const site = import.meta.env.SITE || 'http://localhost:3000';
    const baseUrl = site.endsWith('/') ? site.slice(0, -1) : site;

    const backUrls = {
      success: `${baseUrl}/pago/exito`,
      failure: `${baseUrl}/pago/fallo`,
      pending: `${baseUrl}/pago/pendiente`,
    };

    // Transformar items al formato esperado por Mercado Pago
    const mpItems = body.items.map(item => ({
      id: item.id,
      title: item.title || `Producto ${item.id}`,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: 'COP', // Moneda colombiana, ajustar según necesidad
    }));

    // Opciones de la solicitud, incluyendo idempotencyKey para evitar duplicados en reintentos
    const requestOptions: Options = {
      idempotencyKey: generateIdempotencyKey(body),
      timeout: 5000,
    };

    // Crear preferencia
    const response: PreferenceResponse = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: body.payer_email,
        },
        back_urls: backUrls,
        auto_return: 'approved',
        external_reference: body.external_reference,
      },
      requestOptions,
    });

    // Verificar que los campos esenciales estén presentes
    if (!response.id || !response.init_point) {
      console.error('Respuesta de Mercado Pago incompleta:', response);
      return new Response(
        JSON.stringify({ error: 'La preferencia creada no contiene datos válidos' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    };

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return new Response(
      JSON.stringify({ error: 'No se pudo crear la preferencia de pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};