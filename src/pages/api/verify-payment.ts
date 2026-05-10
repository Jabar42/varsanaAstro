import type { APIRoute } from 'astro';
import { getAdminClient } from '@/src/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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
  const admin = getAdminClient();
  const { data: order, error: lookupError } = await admin
    .from('orders')
    .select('id, status')
    .eq('bold_order_id', boldOrderId)
    .single();

  if (lookupError || !order) {
    return new Response(JSON.stringify({ error: 'Order not found', detail: lookupError?.message }), {
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
    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'paid',
        bold_tx_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('bold_order_id', boldOrderId);

    if (updateError) {
      console.error(`[verify-payment] Failed to update order ${boldOrderId}:`, updateError.message);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[verify-payment] Order ${boldOrderId} marked as paid (fallback from success page)`);
    return new Response(JSON.stringify({ ok: true, status: 'paid' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (normalizedStatus === 'declined' || normalizedStatus === 'failed') {
    // Mark as failed — stock release is handled by the webhook
    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'failed',
        bold_tx_status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('bold_order_id', boldOrderId);

    if (updateError) {
      console.error(`[verify-payment] Failed to mark order ${boldOrderId} as failed:`, updateError.message);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
