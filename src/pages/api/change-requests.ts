/**
 * API de solicitudes de cambio al sitio.
 *
 * POST  /api/change-requests   — público (formulario /solicitud-cambios).
 *        Valida, guarda en D1 y avisa al chat del equipo por Telegram.
 *        Rate limit: 5 solicitudes / 10 min por IP (hash). Honeypot `website`.
 *
 * GET   /api/change-requests?token=…&status=…&limit=…
 * PATCH /api/change-requests   { token, id, status }
 *        Lectura y cambio de estado, protegidos por el secret
 *        CHANGE_REQUESTS_TOKEN. Sin ese secret configurado, responden 404
 *        (no se expone el listado por accidente).
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  STATUSES,
  buildChangeRequestMessage,
  countRecentByIp,
  hashIp,
  insertChangeRequest,
  nextCode,
  validate,
  type ChangeRequestStatus,
} from '@/src/lib/change-requests';

export const prerender = false;

const RATE_LIMIT = { max: 5, minutes: 10 };

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }
  const formData = await request.formData();
  const out: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) out[k] = typeof v === 'string' ? v : '';
  return out;
}

async function notifyTelegram(text: string): Promise<void> {
  const token = (env as unknown as Record<string, string>).TELEGRAM_BOT_TOKEN;
  const chatId = (env as unknown as Record<string, string>).TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[change-requests] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
  } catch (e) {
    console.error('[change-requests] Telegram:', e instanceof Error ? e.message : e);
  } finally {
    clearTimeout(timeout);
  }
}

function requireToken(url: URL, body?: Record<string, unknown>): boolean {
  const expected = (env as unknown as Record<string, string>).CHANGE_REQUESTS_TOKEN;
  if (!expected) return false;
  const provided =
    url.searchParams.get('token') ||
    (body ? String(body.token ?? '') : '');
  return provided === expected;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await readBody(request);

    // Honeypot: invisible para personas. Respondemos éxito para no dar pistas.
    if (String(body.website ?? '').trim()) {
      return json({ success: true });
    }

    const result = validate(body);
    if (!result.ok) return json({ success: false, message: result.message }, 400);

    const db = (env as unknown as Record<string, D1Database>).DB;
    if (!db) return json({ success: false, message: 'Base de datos no disponible' }, 500);

    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
    const ipHash = await hashIp(ip);

    const recent = await countRecentByIp(db, ipHash, RATE_LIMIT.minutes);
    if (recent >= RATE_LIMIT.max) {
      return json(
        { success: false, message: 'Demasiadas solicitudes seguidas. Intenta en unos minutos.' },
        429,
      );
    }

    const code = await nextCode(db);
    await insertChangeRequest(db, result.value, {
      code,
      ipHash,
      userAgent: request.headers.get('user-agent') || '',
    });

    await notifyTelegram(buildChangeRequestMessage(result.value, code));

    return json({ success: true, code, message: 'Solicitud registrada' });
  } catch (error) {
    console.error('[change-requests] POST error:', error);
    return json({ success: false, message: 'No pudimos registrar la solicitud' }, 500);
  }
};

export const GET: APIRoute = async ({ request, url }) => {
  if (!requireToken(url)) return json({ success: false, message: 'No encontrado' }, 404);

  const db = (env as unknown as Record<string, D1Database>).DB;
  if (!db) return json({ success: false, message: 'Base de datos no disponible' }, 500);

  const status = url.searchParams.get('status');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);

  const where: string[] = [];
  const params: unknown[] = [];
  if (status && STATUSES.includes(status as ChangeRequestStatus)) {
    where.push('status = ?');
    params.push(status);
  }

  const sql = `SELECT id, code, requester_name, requester_contact, area, type, page, title,
                      description, priority, deadline, reference_url, status, created_at, updated_at
               FROM change_requests ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY CASE priority WHEN 'urgente' THEN 0 WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
                        created_at DESC
               LIMIT ?`;
  const { results } = await db.prepare(sql).bind(...params, limit).all();

  return json({ success: true, count: results.length, requests: results });
};

export const PATCH: APIRoute = async ({ request, url }) => {
  const body = await readBody(request);
  if (!requireToken(url, body)) return json({ success: false, message: 'No encontrado' }, 404);

  const db = (env as unknown as Record<string, D1Database>).DB;
  if (!db) return json({ success: false, message: 'Base de datos no disponible' }, 500);

  const id = Number(body.id);
  const status = String(body.status ?? '');
  if (!Number.isInteger(id) || !STATUSES.includes(status as ChangeRequestStatus)) {
    return json({ success: false, message: 'id o status inválido' }, 400);
  }

  await db
    .prepare("UPDATE change_requests SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(status, id)
    .run();

  return json({ success: true, id, status });
};
