import type { APIRoute } from 'astro';

export const prerender = false;

async function notifyTelegram(contact: Record<string, string>, env: any) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[CONTACT] Telegram config missing');
    return;
  }

  const text = [
    '📬 <b>Nuevo contacto — Varsana</b>',
    '',
    `<b>Nombre:</b> ${contact.nombre || '—'}`,
    `<b>Email:</b> ${contact.email || '—'}`,
    contact.mensaje ? `\n<i>${contact.mensaje.slice(0, 300)}</i>` : '',
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    if (!res.ok) {
      console.error('[CONTACT] Telegram error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[CONTACT] Telegram fetch failed:', err);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let nombre = '', email = '', mensaje = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
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
    const env = (locals as any).runtime?.env;
    if (env?.DB) {
      await env.DB.prepare(
        'INSERT INTO contacts (nombre, email, mensaje, created_at) VALUES (?, ?, ?, ?)'
      ).bind(contact.nombre, contact.email, contact.mensaje, contact.timestamp).run();
    }

    // Telegram notification (non-blocking)
    if (env) {
      notifyTelegram(contact, env);
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
