/**
 * Notificaciones internas al equipo vía Telegram Bot API.
 * - sendTelegramMessage: envía un mensaje genérico al chat configurado.
 * - buildSaleMessage: formatea los datos de una venta nueva en un mensaje
 *   legible con emojis y formato HTML.
 * - buildEmailErrorMessage: genera una alerta cuando el envío de confirmación
 *   por correo falla.
 * Si TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID no están configurados, las
 * llamadas son no-op silenciosas.
 */
const TELEGRAM_API = 'https://api.telegram.org';

function getTelegramConfig(): { token: string; chatId: string } | null {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN as string | undefined;
  const chatId = import.meta.env.TELEGRAM_CHAT_ID as string | undefined;
  if (!token || !chatId) return null;
  return { token, chatId };
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const config = getTelegramConfig();
  if (!config) return;
  try {
    await fetch(`${TELEGRAM_API}/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.chatId, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[telegram] sendMessage failed:', err instanceof Error ? err.message : err);
  }
}

export function buildSaleMessage(order: {
  customer_name: string;
  customer_email: string;
  content_title: string;
  content_type: 'event' | 'pasadia';
  event_date: string;
  amount: number;
  bold_order_id: string;
}): string {
  const tipo = order.content_type === 'event' ? 'Evento' : 'Pasadía';
  const total = '$' + order.amount.toLocaleString('es-CO');
  return (
    `🌿 <b>Nueva reserva</b>\n` +
    `<b>Cliente:</b> ${order.customer_name} (${order.customer_email})\n` +
    `<b>${tipo}:</b> ${order.content_title}\n` +
    `<b>Fecha:</b> ${order.event_date}\n` +
    `<b>Total:</b> ${total}\n` +
    `<b>Orden:</b> <code>${order.bold_order_id}</code>`
  );
}

export function buildEmailErrorMessage(boldOrderId: string, error: string): string {
  return (
    `⚠️ <b>Email de confirmación falló</b>\n` +
    `<b>Orden:</b> <code>${boldOrderId}</code>\n` +
    `<b>Error:</b> ${error}`
  );
}
