import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { createHash } from 'node:crypto';
import { getAdminClient } from '@/src/lib/supabase';
import { getAvailableStock, reserveStock } from '@/src/lib/db';

/** Ensure this route runs on the server (not pre-rendered). */
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // ------------------------------------------------------------------
  // 1. Parse & validate request body
  // ------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await request.json();
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
  //    - Events: derived from Markdown event_start
  //    - Pasadias: must be provided by the user
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
  if (!tickets || tickets.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one ticket is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 3. Read Markdown — source of truth for price & stock
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

  // Prices array exists in both schemas
  const prices = (entry.data as Record<string, unknown>).prices as
    | { label: string; amount: number; deadline?: string }[]
    | undefined;

  if (!prices || prices.length === 0) {
    return new Response(JSON.stringify({ error: 'No prices configured for this content' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate each ticket label against frontmatter prices (source of truth)
  for (const ticket of tickets) {
    const priceDef = prices.find(p => p.label === ticket.label);
    if (!priceDef) {
      return new Response(
        JSON.stringify({ error: `Invalid ticket label: "${ticket.label}". Valid labels: ${prices.map(p => p.label).join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (!Number.isInteger(ticket.quantity) || ticket.quantity < 1) {
      return new Response(
        JSON.stringify({ error: `Invalid quantity for "${ticket.label}": must be a positive integer` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  // Calculate total server-side (prevents price manipulation)
  const totalAmount = tickets.reduce((sum, t) => {
    const priceDef = prices.find(p => p.label === t.label)!;
    return sum + priceDef.amount * t.quantity;
  }, 0);

  // Total quantity for stock reservation
  const totalQuantity = tickets.reduce((sum, t) => sum + t.quantity, 0);

  // stock_max is required in both events and pasadias schemas
  const stockMax = (entry.data as Record<string, unknown>).stock_max as number | undefined;
  if (!stockMax) {
    return new Response(JSON.stringify({ error: 'Content has no stock_max defined' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 4. Validate stock with lazy inventory initialization
  // ------------------------------------------------------------------
  const admin = getAdminClient();
  const stock = await getAvailableStock(contentType, contentId, eventDate);

  if (stock === null) {
    // First access for this date — upsert inventory row from Markdown data
    const { error: upsertError } = await admin.from('inventory').upsert(
      {
        content_type: contentType,
        content_id: contentId,
        event_date: eventDate,
        stock_max: stockMax,
        stock_reserved: 0,
      },
      { onConflict: 'content_type, content_id, event_date' },
    );

    if (upsertError) {
      console.error('Inventory upsert error:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to initialize inventory' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (stock.available < totalQuantity) {
    return new Response(JSON.stringify({ error: 'Insufficient stock' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 5. Generate order-id
  // ------------------------------------------------------------------
  const orderId = `${contentType}-${contentId}-${Date.now()}`;

  // ------------------------------------------------------------------
  // 6. Generate integrity-signature (SHA256)
  //    Formula: SHA256(orderId + amount + currency + BOLD_SECRET_KEY)
  // ------------------------------------------------------------------
  const boldSecretKey = import.meta.env.BOLD_SECRET_KEY as string | undefined;
  if (!boldSecretKey) {
    console.error('BOLD_SECRET_KEY is not configured');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signatureInput = `${orderId}${totalAmount}COP${boldSecretKey}`;
  const integritySignature = createHash('sha256').update(signatureInput).digest('hex');

  // ------------------------------------------------------------------
  // 7. Reserve stock atomically (row-level lock via decrement_stock RPC)
  // ------------------------------------------------------------------
  try {
    await reserveStock(contentType, contentId, totalQuantity, eventDate);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stock reservation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 8. Insert order row (status: 'pending') with ticket_details
  // ------------------------------------------------------------------
  const { error: insertError } = await admin.from('orders').insert({
    bold_order_id: orderId,
    content_type: contentType,
    content_id: contentId,
    event_date: eventDate,
    customer_email: customerData.email,
    customer_name: customerData.fullName,
    amount: totalAmount,
    currency: 'COP',
    status: 'pending',
    quantity: totalQuantity,
    ticket_details: tickets.map(t => ({
      label: t.label,
      amount: prices.find(p => p.label === t.label)!.amount,
      quantity: t.quantity,
    })),
  });

  if (insertError) {
    console.error('Order insert error:', insertError);
    // NOTE: Stock was already decremented; a compensating transaction
    // would be needed in production. For v1, we let the webhook handler
    // release stock if the order is never paid.
    return new Response(JSON.stringify({ error: 'Failed to create order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 9. Return signed payload to the frontend
  // ------------------------------------------------------------------
  let siteUrl = (import.meta.env.PUBLIC_SITE_URL as string) || 'https://varsana.co';
  // Remove trailing slash to avoid double slashes in redirect URL
  siteUrl = siteUrl.replace(/\/+$/, '');

  const description = (entry.data as Record<string, unknown>).title as string;

  const payload = {
    orderId,
    amount: totalAmount,
    currency: 'COP',
    integritySignature,
    apiKey: import.meta.env.BOLD_API_KEY as string,
    description,
    redirectionUrl: `${siteUrl}/pago/exito?bold-order-id=${orderId}`,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
