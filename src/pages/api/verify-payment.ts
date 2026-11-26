import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDB } from '@/src/lib/d1';
import { boldJSON, isNonEmptyString, isRecord } from '@/src/lib/bold';

export const prerender = false;

/** Compatibility endpoint: redirects are untrusted, D1 is the only status source. */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return boldJSON({ error: 'Invalid JSON' }, 400);
  }
  if (!isRecord(body) || !isNonEmptyString(body.boldOrderId)) {
    return boldJSON({ error: 'Missing or invalid boldOrderId' }, 400);
  }

  // boldTxStatus is deliberately never read. No writes, stock, email or Telegram.
  try {
    const order = await getDB(env)
      .prepare('SELECT status FROM orders WHERE bold_order_id = ?')
      .bind(body.boldOrderId)
      .first<{ status: string }>();
    if (!order) return boldJSON({ error: 'Order not found' }, 404);
    return boldJSON({ ok: true, status: order.status });
  } catch {
    console.error('[verify-payment] Status lookup failed');
    return boldJSON({ error: 'Internal error' }, 500);
  }
};
