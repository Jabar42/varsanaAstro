import type { APIRoute } from 'astro';
import { getAdminClient } from '@/src/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const boldOrderId = url.searchParams.get('bold-order-id');

  if (!boldOrderId) {
    return new Response(JSON.stringify({ status: 'not_found' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select('status')
    .eq('bold_order_id', boldOrderId)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ status: 'not_found' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: data.status }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
