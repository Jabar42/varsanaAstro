import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDB } from '@/src/lib/d1';
import { getEntry } from 'astro:content';
import { sendOrderConfirmationEmail } from '@/src/lib/email';
import { sendTelegramMessage, buildSaleMessage, buildEmailErrorMessage } from '@/src/lib/telegram';
import {
  boldJSON, getBoldWebhookSecret, isBoldSale, isNonEmptyString, isRecord, verifyBoldSignature,
} from '@/src/lib/bold';

export const prerender = false;

interface OrderRow {
  status: string;
  content_type: string;
  content_id: string;
  quantity: number;
  event_date: string;
  customer_email: string;
  customer_name: string;
  ticket_details: string;
  amount: number;
  currency: string;
}

/** Only the winner of the pending -> paid compare-and-set may deliver. */
async function notifyApproval(orderId: string, order: OrderRow): Promise<void> {
  let contentTitle = order.content_id.replace(/-/g, ' ');
  try {
    const collection = order.content_type === 'event' ? 'events' : 'pasadias';
    const entry = await getEntry(collection, order.content_id);
    if (entry?.data && typeof entry.data.title === 'string') contentTitle = entry.data.title;
  } catch {
    // Keep existing content-id fallback and the existing ES/EN confirmation template.
  }

  let ticketDetails: unknown = [];
  try { ticketDetails = JSON.parse(order.ticket_details); } catch { /* default tickets */ }
  const orderData = {
    bold_order_id: orderId,
    customer_email: order.customer_email,
    customer_name: order.customer_name || 'Invitado',
    content_title: contentTitle,
    content_type: order.content_type as 'event' | 'pasadia',
    event_date: order.event_date,
    ticket_details: ticketDetails,
    amount: order.amount,
    currency: order.currency,
  };

  try {
    await sendTelegramMessage(buildSaleMessage(orderData));
  } catch {
    // A Telegram outage must not suppress the customer confirmation.
    console.error('[bold-webhook] Sale notification failed');
  }
  try {
    await sendOrderConfirmationEmail(orderData);
  } catch {
    console.error('[bold-webhook] Confirmation email failed');
    try {
      await sendTelegramMessage(buildEmailErrorMessage(orderId, 'Confirmation email delivery failed'));
    } catch {
      console.error('[bold-webhook] Email error notification failed');
    }
  }
}

const manualReview = () => boldJSON({ error: 'Payment requires manual review', reason: 'manual_review' }, 409);
const skipped = (reason: string) => boldJSON({ ok: true, skipped: true, reason });

/** The authenticated webhook is the ONLY authority that mutates payment status. */
export const POST: APIRoute = async ({ request }) => {
  let secret: string;
  try {
    secret = getBoldWebhookSecret(env);
  } catch {
    console.error('[bold-webhook] Invalid server configuration');
    return boldJSON({ error: 'Server configuration error' }, 500);
  }

  const signature = request.headers.get('x-bold-signature') ?? '';
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) return boldJSON({ error: 'Invalid signature' }, 401);

  // Bound unauthenticated input before buffering. Bold events are small JSON bodies.
  const chunks: Uint8Array[] = [];
  let length = 0;
  let rawBody: string;
  try {
    const reader = request.body?.getReader();
    if (!reader) return boldJSON({ error: 'Missing body' }, 400);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 64 * 1024) {
        await reader.cancel();
        return boldJSON({ error: 'Payload too large' }, 413);
      }
      chunks.push(value);
    }
    rawBody = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Buffer.concat(chunks));
  } catch {
    return boldJSON({ error: 'Cannot read UTF-8 body' }, 400);
  }

  if (!verifyBoldSignature(rawBody, signature, secret)) {
    // Never log raw bodies, signature values, customer data, or key details.
    console.warn('[bold-webhook] Signature verification failed');
    return boldJSON({ error: 'Invalid signature' }, 401);
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { return boldJSON({ error: 'Invalid JSON' }, 400); }
  if (!isRecord(payload) || !isNonEmptyString(payload.id) || !isNonEmptyString(payload.type)) {
    return boldJSON({ error: 'Invalid event' }, 400);
  }
  // Refunds/voids and future events are deliberately NOT payment mutations.
  if (payload.type !== 'SALE_APPROVED' && payload.type !== 'SALE_REJECTED') return skipped('unsupported_event');
  if (!isBoldSale(payload)) return boldJSON({ error: 'Invalid sale event' }, 400);

  const orderId = payload.data.metadata.reference; // subject is a Bold payment ID, NOT our order ID.
  const { total, currency } = payload.data.amount;
  try {
    const db = getDB(env);
    const order = await db.prepare(
      `SELECT status, content_type, content_id, quantity, event_date,
              customer_email, customer_name, ticket_details, amount, currency
       FROM orders WHERE bold_order_id = ?`,
    ).bind(orderId).first<OrderRow>();
    if (!order) return skipped('order_not_found');
    if (!Number.isFinite(order.amount) || order.amount !== total || order.currency !== currency) {
      return boldJSON({ error: 'Payment amount or currency mismatch' }, 409);
    }
    if (order.status === 'paid') return skipped('already_paid');
    if (order.status === 'failed') {
      // Released stock cannot be resurrected by a late approval without reserving again.
      return payload.type === 'SALE_REJECTED' ? skipped('already_failed') : manualReview();
    }
    if (order.status !== 'pending') return manualReview();

    if (payload.type === 'SALE_APPROVED') {
      const result = await db.prepare(
        `UPDATE orders
         SET status = 'paid', bold_tx_status = 'approved', updated_at = datetime('now')
         WHERE bold_order_id = ? AND status = 'pending' AND amount = ? AND currency = ?`,
      ).bind(orderId, total, currency).run();
      if (result.meta.changes === 1) {
        // Await all delivery work; no floating promises or dependence on request lifetime.
        await notifyApproval(orderId, order);
        return boldJSON({ ok: true });
      }
    } else {
      if (!Number.isSafeInteger(order.quantity) || order.quantity <= 0 || !isNonEmptyString(order.event_date)) return manualReview();
      // D1 batch is transactional and sequential. The inventory UPDATE only runs
      // while the matching order is pending. changes() gates the status UPDATE
      // on exactly one inventory row being released in the preceding statement.
      // If stock is absent/inconsistent neither changes; if SQL fails both roll back.
      const results = await db.batch([
        db.prepare(
          `UPDATE inventory
           SET stock_reserved = stock_reserved - ?, updated_at = datetime('now')
           WHERE content_type = ? AND content_id = ? AND event_date = ? AND stock_reserved >= ?
             AND EXISTS (
               SELECT 1 FROM orders WHERE bold_order_id = ? AND status = 'pending'
                 AND amount = ? AND currency = ? AND quantity = ?
                 AND content_type = ? AND content_id = ? AND event_date = ?
             )`,
        ).bind(order.quantity, order.content_type, order.content_id, order.event_date, order.quantity,
          orderId, total, currency, order.quantity, order.content_type, order.content_id, order.event_date),
        db.prepare(
          `UPDATE orders
           SET status = 'failed', bold_tx_status = 'declined', updated_at = datetime('now')
           WHERE bold_order_id = ? AND status = 'pending' AND amount = ? AND currency = ?
             AND changes() = 1`,
        ).bind(orderId, total, currency),
      ]);
      if (results[1].meta.changes === 1) return boldJSON({ ok: true });
    }

    // Another authenticated delivery may have won after the initial read.
    const current = await db.prepare('SELECT status FROM orders WHERE bold_order_id = ?')
      .bind(orderId).first<{ status: string }>();
    if (current?.status === 'paid') return skipped('already_paid');
    if (current?.status === 'failed' && payload.type === 'SALE_REJECTED') return skipped('already_failed');
    return manualReview();
  } catch {
    console.error('[bold-webhook] Payment processing failed');
    return boldJSON({ error: 'Internal error' }, 500);
  }
};
