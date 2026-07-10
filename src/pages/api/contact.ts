import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

async function notifyTelegram(contact: Record<string, string>) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    '📬 <b>Nuevo contacto — Varsana</b>',
    '',
    `<b>Nombre:</b> ${contact.nombre || '—'}`,
    `<b>Email:</b> ${contact.email || '—'}`,
    contact.mensaje ? `\n<i>${contact.mensaje.slice(0, 300)}</i>` : '',
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch {
    // Non-blocking
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const mensaje = formData.get('mensaje')?.toString() || '';

    if (!nombre || !email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nombre y email requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const contact = { nombre, email, mensaje, timestamp: new Date().toISOString() };

    // Store in D1
    await env.DB.prepare(
      'INSERT INTO contacts (nombre, email, mensaje, created_at) VALUES (?, ?, ?, ?)'
    ).bind(contact.nombre, contact.email, contact.mensaje, contact.timestamp).run();

    // Notify Telegram (fire-and-forget via waitUntil)
    if (typeof request as any) {
      notifyTelegram(contact);
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
