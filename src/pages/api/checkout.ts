import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { createHash } from 'node:crypto';
import { getAdminClient } from '@/src/lib/supabase';
import { getAvailableStock, reserveStock } from '@/src/lib/db';
import { getCurrentPrice } from '@/src/lib/events';

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

  const { contentType, contentId, quantity, customerData } = body as {
    contentType?: string;
    contentId?: string;
    quantity?: number;
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

  const qty = Math.max(1, quantity ?? 1);

  // ------------------------------------------------------------------
  // 2. Read Markdown — source of truth for price & stock
  // ------------------------------------------------------------------
  const entry = await getEntry(contentType as 'events' | 'pasadias', contentId);
  if (!entry) {
    return new Response(JSON.stringify({ error: 'Content not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
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

  const currentPrice = getCurrentPrice(prices);
  if (!currentPrice) {
    return new Response(JSON.stringify({ error: 'No valid price available' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const amount = currentPrice.amount; // Integer COP, as expected by Bold
  const description = (entry.data as Record<string, unknown>).title as string;

  // stock_max only exists in the events schema; pasadias have no stock limit
  const stockMax = (entry.data as Record<string, unknown>).stock_max as number | undefined;
  const effectiveStockMax = stockMax ?? 999; // pasadias default to effectively unlimited

  // ------------------------------------------------------------------
  // 3. Validate stock with lazy inventory initialization
  // ------------------------------------------------------------------
  const admin = getAdminClient();
  const stock = await getAvailableStock(contentType, contentId);

  if (stock === null) {
    // First access — upsert inventory row from Markdown data
    const { error: upsertError } = await admin.from('inventory').upsert(
      {
        content_type: contentType,
        content_id: contentId,
        stock_max: effectiveStockMax,
        stock_reserved: 0,
      },
      { onConflict: 'content_type, content_id' },
    );

    if (upsertError) {
      console.error('Inventory upsert error:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to initialize inventory' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (stock.available < qty) {
    return new Response(JSON.stringify({ error: 'Insufficient stock' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 4. Generate order-id
  // ------------------------------------------------------------------
  const orderId = `${contentType}-${contentId}-${Date.now()}`;

  // ------------------------------------------------------------------
  // 5. Generate integrity-signature (SHA256)
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

  const signatureInput = `${orderId}${amount}COP${boldSecretKey}`;
  const integritySignature = createHash('sha256').update(signatureInput).digest('hex');

  // ------------------------------------------------------------------
  // 6. Reserve stock atomically (row-level lock via decrement_stock RPC)
  // ------------------------------------------------------------------
  try {
    await reserveStock(contentType, contentId, qty);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stock reservation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 7. Insert order row (status: 'pending')
  // ------------------------------------------------------------------
  const { error: insertError } = await admin.from('orders').insert({
    bold_order_id: orderId,
    content_type: contentType,
    content_id: contentId,
    customer_email: customerData.email,
    customer_name: customerData.fullName,
    amount,
    currency: 'COP',
    status: 'pending',
    quantity: qty,
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
  // 8. Return signed payload to the frontend
  // ------------------------------------------------------------------
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL as string) || 'https://varsana.co';

  const payload = {
    orderId,
    amount,
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
