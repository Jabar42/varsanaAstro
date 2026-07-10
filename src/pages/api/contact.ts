import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    let nombre = '', email = '', mensaje = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json() as Record<string, string>;
      nombre = body.nombre || '';
      email = body.email || '';
      mensaje = body.mensaje || '';
    } else {
      const formData = await request.formData();
      nombre = formData.get('nombre')?.toString() || '';
      email = formData.get('email')?.toString() || '';
      mensaje = formData.get('mensaje')?.toString() || '';
    }

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

    // Telegram notification (fire and forget)
    const token = env.TELEGRAM_BOT_TOKEN as string;
    const chatId = env.TELEGRAM_CHAT_ID as string;
    if (token && chatId) {
      const text = [
        '\u{1F4EC} <b>Nuevo contacto \u2014 Varsana</b>',
        '',
        `<b>Nombre:</b> ${contact.nombre}`,
        `<b>Email:</b> ${contact.email}`,
        contact.mensaje ? `\n<i>${contact.mensaje.slice(0, 300)}</i>` : '',
      ].filter(Boolean).join('\n');

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      }).then(r => {
        if (!r.ok) console.error('[CONTACT] Telegram:', r.status);
      }).catch(e => {
        console.error('[CONTACT] Telegram error:', e);
      });
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
