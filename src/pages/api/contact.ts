import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const LIMITS = { nombre: 120, email: 254, mensaje: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escapa texto para `parse_mode: HTML` de Telegram. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    let nombre = '', email = '', mensaje = '', honeypot = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json() as Record<string, unknown>;
      nombre = String(body.nombre ?? '');
      email = String(body.email ?? '');
      mensaje = String(body.mensaje ?? '');
      honeypot = String(body.website ?? '');
    } else {
      const formData = await request.formData();
      nombre = formData.get('nombre')?.toString() || '';
      email = formData.get('email')?.toString() || '';
      mensaje = formData.get('mensaje')?.toString() || '';
      honeypot = formData.get('website')?.toString() || '';
    }

    // Honeypot: el campo `website` está oculto en el formulario; si llega lleno
    // es un bot. Respondemos éxito para no darle pistas.
    if (honeypot) return json({ success: true, message: 'Mensaje recibido' }, 200);

    nombre = nombre.trim().slice(0, LIMITS.nombre);
    email = email.trim().slice(0, LIMITS.email);
    mensaje = mensaje.trim().slice(0, LIMITS.mensaje);

    if (!nombre || !email) return json({ success: false, message: 'Nombre y email requeridos' }, 400);
    if (!EMAIL_RE.test(email)) return json({ success: false, message: 'Email inválido' }, 400);

    const contact = { nombre, email, mensaje, timestamp: new Date().toISOString() };

    // Store in D1
    await env.DB.prepare(
      'INSERT INTO contacts (nombre, email, mensaje, created_at) VALUES (?, ?, ?, ?)'
    ).bind(contact.nombre, contact.email, contact.mensaje, contact.timestamp).run();

    // Telegram notification (blocking with 3s timeout)
    const token = env.TELEGRAM_BOT_TOKEN as string;
    const chatId = env.TELEGRAM_CHAT_ID as string;
    if (token && chatId) {
      const text = [
        '\u{1F4EC} <b>Nuevo contacto \u2014 Varsana</b>',
        '',
        `<b>Nombre:</b> ${escapeHtml(contact.nombre)}`,
        `<b>Email:</b> ${escapeHtml(contact.email)}`,
        contact.mensaje ? `\n<i>${escapeHtml(contact.mensaje.slice(0, 300))}</i>` : '',
      ].filter(Boolean).join('\n');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
          signal: controller.signal,
        });
      } catch (e) {
        console.error('[CONTACT] Telegram:', e);
      } finally {
        clearTimeout(timeout);
      }
    } else {
      console.error('[CONTACT] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Mensaje recibido' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[CONTACT] Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error al enviar' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
