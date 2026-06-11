import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getDB, getEnv } from '@/src/lib/d1';
import { releaseStock } from '@/src/lib/db-d1';
import { getEntry } from 'astro:content';
import { sendOrderConfirmationEmail } from '@/src/lib/email';
import { sendTelegramMessage, buildSaleMessage, buildEmailErrorMessage } from '@/src/lib/telegram';

/** Ensure this route runs on the server (not pre-rendered). */
export const prerender = false;

// ---------------------------------------------------------------------------
// Signature Verification
// Following Bold's updated documentation:
//   1. Get raw request body
//   2. Convert body to Base64:  Buffer.from(body).toString('base64')
//   3. Generate HMAC-SHA256 using BOLD_SECRET_KEY (empty string in test mode)
//   4. Compare result with the x-bold-signature header
// ---------------------------------------------------------------------------

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  // Step 2: Convert raw body to Base64
  const base64Body = Buffer.from(rawBody).toString('base64');

  // Step 3: Generate HMAC-SHA256 using the secret key
  const expectedSignature = createHmac('sha256', secret)
    .update(base64Body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
  const receivedBuffer = Buffer.from(signatureHeader, 'utf-8');

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

// ---------------------------------------------------------------------------
// Bold Webhook Event Types
// ---------------------------------------------------------------------------

interface BoldAmount {
  currency: string;
  total: number;
  taxes: Array<{ base: number; type: string; value: number }>;
  tip: number;
}

interface BoldData {
  payment_id: string;
  merchant_id: string;
  created_at: string;
  amount: BoldAmount;
  metadata: {
    reference: string | null;
  };
  payment_method: string;
  [key: string]: unknown;
}

interface BoldWebhookPayload {
  id: string;
  type: string;
  subject: string;
  source: string;
  spec_version: string;
  time: number;
  data: BoldData;
  datacontenttype?: string;
}

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

/**
 * Convert Bold's CloudEvents `type` to our internal status.
 */
function mapBoldStatus(boldType: string): string {
  switch (boldType) {
    case 'SALE_APPROVED':
      return 'APPROVED';
    case 'SALE_REJECTED':
      return 'DECLINED';
    case 'VOID_APPROVED':
      return 'VOID';
    case 'VOID_REJECTED':
      return 'VOID_FAILED';
    default:
      return boldType;
  }
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export const POST: APIRoute = async ({ request, locals }) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const env = getEnv(locals);

  // ------------------------------------------------------------------
  // 1. Read raw body + signature header
  // ------------------------------------------------------------------
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    console.error(`[webhook:${requestId}] Failed to read request body`);
    return new Response(JSON.stringify({ error: 'Cannot read body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signatureHeader = request.headers.get('x-bold-signature') || '';

  // ------------------------------------------------------------------
  // 2. Signature Verification (MANDATORY)
  // ------------------------------------------------------------------
  const boldSecretKey = (env.BOLD_SECRET_KEY as string) || '';

  if (!signatureHeader) {
    console.warn(`[webhook:${requestId}] Missing x-bold-signature header`);
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isValid = verifyWebhookSignature(rawBody, signatureHeader, boldSecretKey);
  if (!isValid) {
    const bodyPreview = rawBody.length > 200 ? rawBody.slice(0, 200) + '...' : rawBody;
    console.warn(`[webhook:${requestId}] Invalid signature — rejecting. body=${bodyPreview} sig=${signatureHeader.slice(0, 20)}... key=${boldSecretKey ? 'present' : 'EMPTY'}`);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[webhook:${requestId}] Signature verified OK`);

  // ------------------------------------------------------------------
  // 3. Parse webhook payload (Bold CloudEvents format)
  // ------------------------------------------------------------------
  let boldPayload: BoldWebhookPayload;
  try {
    boldPayload = JSON.parse(rawBody) as BoldWebhookPayload;
  } catch {
    console.error(`[webhook:${requestId}] Invalid JSON payload`);
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const orderId = boldPayload.data?.metadata?.reference || boldPayload.subject || '';
  const status = mapBoldStatus(boldPayload.type);

  if (!orderId || !status) {
    console.warn(`[webhook:${requestId}] Missing orderId or status. Parsed: type=${boldPayload.type} reference=${boldPayload.data?.metadata?.reference} subject=${boldPayload.subject}`);
    return new Response(JSON.stringify({ error: 'Missing orderId or status' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[webhook:${requestId}] Processing order=${orderId} status=${status} (boldType=${boldPayload.type}, method=${boldPayload.data?.payment_method})`);

  // ------------------------------------------------------------------
  // 4. Idempotency Check — skip if already paid
  // ------------------------------------------------------------------
  const db = getDB(locals);

  const existingOrder = await db
    .prepare(
      `SELECT status, content_type, content_id, quantity, event_date,
              customer_email, customer_name, ticket_details, amount, currency
       FROM orders WHERE bold_order_id = ?`
    )
    .bind(orderId)
    .first<OrderRow>();

  if (!existingOrder) {
    console.warn(`[webhook:${requestId}] Order ${orderId} not found in database`);
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'order_not_found' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (existingOrder.status === 'paid') {
    console.log(`[webhook:${requestId}] Order ${orderId} already paid — idempotency skip`);
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'already_paid' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // 5. Process based on payment status
  // ------------------------------------------------------------------
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === 'APPROVED') {
    // --- Payment approved ---
    await db
      .prepare(
        `UPDATE orders
         SET status = 'paid', bold_tx_status = 'approved', updated_at = datetime('now')
         WHERE bold_order_id = ?`
      )
      .bind(orderId)
      .run();

    console.log(`[webhook:${requestId}] Order ${orderId} marked as paid`);

    // Resolve content title from Markdown frontmatter
    let contentTitle = existingOrder.content_id.replace(/-/g, ' ');
    try {
      const collection = existingOrder.content_type === 'event' ? 'events' : 'pasadias';
      const entry = await getEntry(collection as 'events' | 'pasadias', existingOrder.content_id);
      if (entry?.data && typeof (entry.data as any).title === 'string') {
        contentTitle = (entry.data as any).title as string;
      }
    } catch {
      // fallback: content_id sin guiones
    }

    // Parse ticket_details from JSON string
    let ticketDetails: any;
    try {
      ticketDetails = typeof existingOrder.ticket_details === 'string'
        ? JSON.parse(existingOrder.ticket_details)
        : existingOrder.ticket_details;
    } catch {
      ticketDetails = [];
    }

    const orderData = {
      bold_order_id: orderId,
      customer_email: existingOrder.customer_email,
      customer_name: existingOrder.customer_name || 'Invitado',
      content_title: contentTitle,
      content_type: existingOrder.content_type as 'event' | 'pasadia',
      event_date: existingOrder.event_date,
      ticket_details: ticketDetails,
      amount: existingOrder.amount,
      currency: existingOrder.currency || 'COP',
    };

    // 1. Notificar al admin via Telegram (nueva venta)
    await sendTelegramMessage(buildSaleMessage({
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      content_title: contentTitle,
      content_type: orderData.content_type,
      event_date: orderData.event_date,
      amount: orderData.amount,
      bold_order_id: orderId,
    }));

    // 2. Email de confirmacion al cliente
    const [emailResult] = await Promise.allSettled([
      sendOrderConfirmationEmail(orderData),
    ]);
    if (emailResult.status === 'rejected') {
      const errMsg = emailResult.reason instanceof Error
        ? emailResult.reason.message
        : String(emailResult.reason);
      console.error(`[webhook:${requestId}] Email failed:`, errMsg);
      await sendTelegramMessage(buildEmailErrorMessage(orderId, errMsg));
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (normalizedStatus === 'DECLINED' || normalizedStatus === 'FAILED') {
    // --- Payment failed — release stock + mark order as failed ---
    const { content_type: contentType, content_id: contentId, quantity, event_date: eventDate } = existingOrder;

    try {
      const date = eventDate || new Date().toISOString().slice(0, 10);
      await releaseStock(db, contentType, contentId, quantity || 1, date);
    } catch (releaseError) {
      const msg = releaseError instanceof Error ? releaseError.message : 'Unknown';
      console.error(`[webhook:${requestId}] Failed to release stock for ${orderId}:`, msg);
    }

    await db
      .prepare(
        `UPDATE orders
         SET status = 'failed', bold_tx_status = ?, updated_at = datetime('now')
         WHERE bold_order_id = ?`
      )
      .bind(normalizedStatus.toLowerCase(), orderId)
      .run();

    console.log(`[webhook:${requestId}] Order ${orderId} marked as failed, stock released`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- Unknown status — acknowledge but log ---
  console.log(`[webhook:${requestId}] Unhandled status ${status} for order ${orderId} — acknowledged`);

  await db
    .prepare(
      `UPDATE orders
       SET bold_tx_status = ?, updated_at = datetime('now')
       WHERE bold_order_id = ?`
    )
    .bind(normalizedStatus.toLowerCase(), orderId)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
