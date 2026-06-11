import type { APIRoute } from 'astro';
import { getDB } from '@/src/lib/d1';
import { getEntry } from 'astro:content';
import { sendOrderConfirmationEmail } from '@/src/lib/email';
import { sendTelegramMessage, buildSaleMessage, buildEmailErrorMessage } from '@/src/lib/telegram';

export const prerender = false;

interface OrderRow {
  id: number;
  status: string;
  content_type: string;
  content_id: string;
  event_date: string;
  customer_email: string;
  customer_name: string;
  ticket_details: string;
  amount: number;
  currency: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // ------------------------------------------------------------------
  // 1. Parse request body
  // ------------------------------------------------------------------
  let body: { boldOrderId?: string; boldTxStatus?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { boldOrderId, boldTxStatus } = body;

  if (!boldOrderId || !boldTxStatus) {
    return new Response(JSON.stringify({ error: 'Missing boldOrderId or boldTxStatus' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 2. Look up the order
  // ------------------------------------------------------------------
  const db = getDB(locals);
  const order = await db
    .prepare(
      `SELECT id, status, content_type, content_id, event_date,
              customer_email, customer_name, ticket_details, amount, currency
       FROM orders WHERE bold_order_id = ?`
    )
    .bind(boldOrderId)
    .first<OrderRow>();

  if (!order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 3. Idempotency — skip if already paid
  // ------------------------------------------------------------------
  if (order.status === 'paid') {
    return new Response(JSON.stringify({ ok: true, status: 'paid', skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 4. Update based on the transaction status from Bold redirect
  //    Bold adds bold-tx-status=approved to the redirect URL.
  // ------------------------------------------------------------------
  const normalizedStatus = boldTxStatus.toLowerCase();

  if (normalizedStatus === 'approved') {
    await db
      .prepare(
        `UPDATE orders
         SET status = 'paid', bold_tx_status = 'approved', updated_at = datetime('now')
         WHERE bold_order_id = ?`
      )
      .bind(boldOrderId)
      .run();

    console.log(`[verify-payment] Order ${boldOrderId} marked as paid (fallback from success page)`);

    // Resolve content title from Markdown frontmatter
    let contentTitle = order.content_id.replace(/-/g, ' ');
    try {
      const collection = order.content_type === 'event' ? 'events' : 'pasadias';
      const entry = await getEntry(collection as 'events' | 'pasadias', order.content_id);
      if (entry?.data && typeof (entry.data as any).title === 'string') {
        contentTitle = (entry.data as any).title as string;
      }
    } catch {
      // fallback: content_id sin guiones
    }

    // Parse ticket_details from JSON string
    let ticketDetails: any;
    try {
      ticketDetails = typeof order.ticket_details === 'string'
        ? JSON.parse(order.ticket_details)
        : order.ticket_details;
    } catch {
      ticketDetails = [];
    }

    const orderData = {
      bold_order_id: boldOrderId,
      customer_email: order.customer_email,
      customer_name: order.customer_name || 'Invitado',
      content_title: contentTitle,
      content_type: order.content_type as 'event' | 'pasadia',
      event_date: order.event_date,
      ticket_details: ticketDetails,
      amount: order.amount,
      currency: order.currency || 'COP',
    };

    // 1. Notificar al admin via Telegram (nueva venta)
    await sendTelegramMessage(buildSaleMessage({
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      content_title: contentTitle,
      content_type: orderData.content_type,
      event_date: orderData.event_date,
      amount: orderData.amount,
      bold_order_id: boldOrderId,
    }));

    // 2. Email de confirmacion al cliente
    //    Si falla, notificar via Telegram
    const [emailResult] = await Promise.allSettled([
      sendOrderConfirmationEmail(orderData),
    ]);
    if (emailResult.status === 'rejected') {
      const errMsg = emailResult.reason instanceof Error
        ? emailResult.reason.message
        : String(emailResult.reason);
      console.error(`[verify-payment] Email failed:`, errMsg);
      await sendTelegramMessage(buildEmailErrorMessage(boldOrderId, errMsg));
    }

    return new Response(JSON.stringify({ ok: true, status: 'paid' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (normalizedStatus === 'declined' || normalizedStatus === 'failed') {
    // Mark as failed — stock release is handled by the webhook
    await db
      .prepare(
        `UPDATE orders
         SET status = 'failed', bold_tx_status = ?, updated_at = datetime('now')
         WHERE bold_order_id = ?`
      )
      .bind(normalizedStatus, boldOrderId)
      .run();

    return new Response(JSON.stringify({ ok: true, status: 'failed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Unknown status — just log it
  console.log(`[verify-payment] Unhandled status ${boldTxStatus} for order ${boldOrderId} — no action taken`);
  return new Response(JSON.stringify({ ok: true, status: order.status, skipped: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
