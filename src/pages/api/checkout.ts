import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getEntry } from "astro:content";
import { createHash } from "node:crypto";
import { getDB } from "@/src/lib/d1";
import { createOrderAndReserve } from "@/src/lib/db-d1";
import { getBoldEnvironment } from "@/src/lib/bold";

/** Ensure this route runs on the server (not pre-rendered). */
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {

  // Credenciales obligatorias antes de reservar cupos. El modo de pruebas de
  // webhooks se habilita explícitamente; staging NO implica pagos simulados.
  const boldApiKey = env.BOLD_API_KEY as string | undefined;
  const boldSecretKey = env.BOLD_SECRET_KEY as string | undefined;
  let validEnvironment = true;
  try { getBoldEnvironment(env); } catch { validEnvironment = false; }
  if (!boldApiKey?.trim() || !boldSecretKey?.trim() || !validEnvironment) {
    console.error('Bold credentials or BOLD_ENVIRONMENT are not configured correctly');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  // Mantener la redirección en el sitio actual, incluso si queda un valor
  // antiguo en PUBLIC_SITE_URL. Nunca enviar reservas al WordPress anterior.
  const siteUrl = 'https://varsana-co.iaforchange.workers.dev';

  // ------------------------------------------------------------------
  // 1. Parse & validate request body
  // ------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { contentType, contentId, eventDate: rawEventDate, tickets, customerData } = body as {
    contentType?: string;
    contentId?: string;
    eventDate?: string;
    tickets?: { label: string; quantity: number }[];
    customerData?: { email?: string; fullName?: string; phone?: string; dialCode?: string };
  };

  if (!contentType || !['event', 'pasadia'].includes(contentType)) {
    return new Response(JSON.stringify({ error: 'Invalid or missing contentType' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!contentId) {
    return new Response(JSON.stringify({ error: 'Missing contentId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!customerData?.email || !customerData?.fullName) {
    return new Response(JSON.stringify({ error: 'Missing customerData (email, fullName)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 2. Determine eventDate
  // ------------------------------------------------------------------
  let eventDate = '';

  if (contentType === 'pasadia') {
    if (!rawEventDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawEventDate)) {
      return new Response(JSON.stringify({ error: 'eventDate is required for pasadias (YYYY-MM-DD)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const parsed = new Date(rawEventDate + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid eventDate format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    eventDate = rawEventDate;
  }

  // ------------------------------------------------------------------
  // 3. Validate tickets
  // ------------------------------------------------------------------
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one ticket is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 4. Read Markdown — source of truth for price & stock
  // ------------------------------------------------------------------
  const collection = contentType === 'event' ? 'events' : 'pasadias';
  const entry = await getEntry(collection, contentId);
  if (!entry) {
    return new Response(JSON.stringify({ error: 'Content not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // For events, eventDate comes from the Markdown
  if (contentType === 'event') {
    const eventStart = (entry.data as Record<string, unknown>).event_start as Date | undefined;
    if (!eventStart) {
      return new Response(JSON.stringify({ error: 'Event has no start date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    eventDate = eventStart.toISOString().slice(0, 10);
  }

  const prices = (entry.data as Record<string, unknown>).prices as
    | { label: string; amount: number; min_quantity?: number; deadline?: string }[]
    | undefined;

  if (!Array.isArray(prices) || prices.length === 0 || prices.some(p =>
    !p || typeof p.label !== 'string' || !p.label ||
    !Number.isSafeInteger(p.amount) || p.amount <= 0 ||
    !Number.isSafeInteger(p.min_quantity ?? 1) || (p.min_quantity ?? 1) < 1
  )) {
    return new Response(JSON.stringify({ error: 'No prices configured for this content' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Contrato de tarifas: con una única categoría base (min_quantity=1),
  // las etiquetas de mínimos superiores son alias de volumen (General/Pareja).
  // Varias categorías base siguen siendo tickets independientes (Adulto/Niño,
  // Preventa/General/Pareja); sus escalas se resuelven sólo por su etiqueta.
  const baseLabels = new Set(prices.filter(p => (p.min_quantity ?? 1) === 1).map(p => p.label));
  const singleBase = baseLabels.size === 1 ? [...baseLabels][0] : undefined;
  const grouped = new Map<string, number>();
  let totalQuantity = 0;
  for (const ticket of tickets) {
    if (!ticket || typeof ticket !== 'object' || typeof ticket.label !== 'string' ||
        !prices.some(p => p.label === ticket.label)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticket label' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (!Number.isSafeInteger(ticket.quantity) || ticket.quantity < 1 ||
        !Number.isSafeInteger(totalQuantity + ticket.quantity)) {
      return new Response(
        JSON.stringify({ error: `Invalid quantity for "${ticket.label}": must be a positive integer` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    totalQuantity += ticket.quantity;
    const group = singleBase ?? ticket.label;
    grouped.set(group, (grouped.get(group) ?? 0) + ticket.quantity);
  }

  // Agregar antes de elegir escala impide cambiar el precio dividiendo líneas.
  // Nunca usar amount del cliente; guardar únicamente los detalles resueltos.
  const resolvedTickets: { label: string; quantity: number; amount: number }[] = [];
  let totalAmount = 0;
  for (const [label, quantity] of grouped) {
    const price = prices.filter(p => singleBase !== undefined || p.label === label)
      .sort((a, b) => (b.min_quantity ?? 1) - (a.min_quantity ?? 1))
      .find(p => quantity >= (p.min_quantity ?? 1));
    if (!price || !Number.isSafeInteger(price.amount * quantity) ||
        !Number.isSafeInteger(totalAmount + price.amount * quantity)) {
      return new Response(JSON.stringify({ error: 'No eligible price or unsafe total amount' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    totalAmount += price.amount * quantity;
    resolvedTickets.push({ label: price.label, quantity, amount: price.amount });
  }

  // stock_max is required in both events and pasadias schemas
  const stockMax = (entry.data as Record<string, unknown>).stock_max as number | undefined;
  if (typeof stockMax !== 'number' || !Number.isSafeInteger(stockMax) || stockMax < 1) {
    return new Response(JSON.stringify({ error: 'Content has no stock_max defined' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 5. Generate order-id
  // ------------------------------------------------------------------
  // Referencia opaca, única y menor al límite de 60 caracteres de Bold.
  const orderId = `${contentType}-${crypto.randomUUID()}`;

  // ------------------------------------------------------------------
  // 6. Generate integrity-signature (SHA256)
  // ------------------------------------------------------------------
  const signatureInput = `${orderId}${totalAmount}COP${boldSecretKey}`;
  const integritySignature = createHash('sha256').update(signatureInput).digest('hex');

  // ------------------------------------------------------------------
  // 7. Inicialización + reserva + orden: una única transacción D1 batch.
  // ------------------------------------------------------------------
  const db = getDB(env);

  try {
    const result = await createOrderAndReserve(db, {
      orderId, contentType, contentId, eventDate, stockMax,
      quantity: totalQuantity, amount: totalAmount,
      customerEmail: customerData.email, customerName: customerData.fullName,
      ticketDetails: JSON.stringify(resolvedTickets),
    });
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient stock',
          available: result.available,
          requested: result.requested,
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('Atomic order creation error:', message);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }


  // ------------------------------------------------------------------
  // 9. Return signed payload to the frontend
  // ------------------------------------------------------------------
  const description = (entry.data as Record<string, unknown>).title as string;

  const redirectionUrl = `${siteUrl}/pago/exito`;

  new URL(redirectionUrl);

  const payload = {
    orderId,
    amount: totalAmount,
    currency: 'COP',
    integritySignature,
    apiKey: boldApiKey,
    description,
    redirectionUrl,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
