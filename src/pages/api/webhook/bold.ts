import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getAdminClient } from '@/src/lib/supabase';
import { releaseStock } from '@/src/lib/db';

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
// Maps Bold's CloudEvents `type` field to our internal status values.
// ---------------------------------------------------------------------------

/**
 * Bold sends events with the following CloudEvents structure:
 * {
 *   id: string,
 *   type: 'SALE_APPROVED' | 'SALE_REJECTED' | 'VOID_APPROVED' | 'VOID_REJECTED',
 *   subject: string,
 *   source: string,
 *   spec_version: string,
 *   time: number,              // POSIX nanoseconds
 *   data: {
 *     payment_id: string,
 *     merchant_id: string,
 *     created_at: string,
 *     amount: { currency, total, taxes, tip },
 *     metadata: { reference: string | null },   // ← our orderId lives here
 *     payment_method: string,
 *     ...
 *   },
 *   datacontenttype?: string
 * }
 */

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
      return boldType; // pass through unknown types
  }
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID().slice(0, 8); // short id for traceability

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
  //    Uses BOLD_SECRET_KEY; falls back to empty string in test mode.
  // ------------------------------------------------------------------
  const boldSecretKey = (import.meta.env.BOLD_SECRET_KEY as string) || '';

  if (!signatureHeader) {
    console.warn(`[webhook:${requestId}] Missing x-bold-signature header`);
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isValid = verifyWebhookSignature(rawBody, signatureHeader, boldSecretKey);
  if (!isValid) {
    // Log preview of body for debugging (safe: no PII in orderId)
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
  //    Bold sends events as CloudEvents: { type, subject, data: { metadata: { reference }, ... } }
  //    Our orderId → data.metadata.reference
  //    Our status   → type (SALE_APPROVED / SALE_REJECTED)
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

  // Extract our orderId from Bold's metadata.reference (what we sent via data-order-id)
  // Fallback to subject (Bold's own transaction ID) if reference is null
  const orderId = boldPayload.data?.metadata?.reference || boldPayload.subject || '';
  // Map Bold's CloudEvents type (e.g. "SALE_APPROVED") → our internal status
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
  const admin = getAdminClient();

  const { data: existingOrder } = await admin
    .from('orders')
    .select('status, content_type, content_id, quantity, event_date')
    .eq('bold_order_id', orderId)
    .single();

  if (!existingOrder) {
    console.warn(`[webhook:${requestId}] Order ${orderId} not found in database`);
    // Return 200 so Bold doesn't keep retrying — order was never created
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
    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'paid',
        bold_tx_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('bold_order_id', orderId);

    if (updateError) {
      console.error(`[webhook:${requestId}] Failed to update order ${orderId}:`, updateError.message);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[webhook:${requestId}] Order ${orderId} marked as paid`);

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
      await releaseStock(contentType, contentId, quantity || 1, date);
    } catch (releaseError) {
      const msg = releaseError instanceof Error ? releaseError.message : 'Unknown';
      console.error(`[webhook:${requestId}] Failed to release stock for ${orderId}:`, msg);
      // Continue anyway — still mark the order as failed
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'failed',
        bold_tx_status: normalizedStatus.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('bold_order_id', orderId);

    if (updateError) {
      console.error(`[webhook:${requestId}] Failed to update failed order ${orderId}:`, updateError.message);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[webhook:${requestId}] Order ${orderId} marked as failed, stock released`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- Unknown status — acknowledge but log ---
  console.log(`[webhook:${requestId}] Unhandled status ${status} for order ${orderId} — acknowledged`);

  const { error: updateError } = await admin
    .from('orders')
    .update({
      bold_tx_status: normalizedStatus.toLowerCase(),
      updated_at: new Date().toISOString(),
    })
    .eq('bold_order_id', orderId);

  if (updateError) {
    console.error(`[webhook:${requestId}] Failed to update status for ${orderId}:`, updateError.message);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
