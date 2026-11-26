import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDB } from '@/src/lib/d1';
import { boldJSON } from '@/src/lib/bold';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const boldOrderId = new URL(request.url).searchParams.get('bold-order-id');
  if (!boldOrderId) return boldJSON({ status: 'not_found' });

  try {
    const row = await getDB(env)
      .prepare('SELECT status FROM orders WHERE bold_order_id = ?')
      .bind(boldOrderId)
      .first<{ status: string }>();
    return boldJSON({ status: row?.status ?? 'not_found' });
  } catch {
    console.error('[order-status] Status lookup failed');
    return boldJSON({ error: 'Internal error' }, 500);
  }
};
