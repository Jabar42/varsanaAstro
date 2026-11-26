/**
 * Notificaciones internas vía Telegram. Sin bindings es un no-op; los fallos
 * nunca se propagan a contact/change requests ni exponen la URL con el token.
 */
import { env } from 'cloudflare:workers';

const TELEGRAM_API = 'https://api.telegram.org';
const TELEGRAM_TIMEOUT_MS = 5_000;

function getTelegramConfig(): { token: string; chatId: string } | null {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (typeof token !== 'string' || !token.trim() || typeof chatId !== 'string' || !chatId.trim()) return null;
  return { token, chatId };
}

export async function sendTelegramMessage(text: string): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const config = getTelegramConfig();
    if (!config) return;
    const controller = new AbortController();
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('Telegram delivery unavailable'));
      }, TELEGRAM_TIMEOUT_MS);
    });
    await Promise.race([
      deadline,
      (async () => {
        const response = await fetch(`${TELEGRAM_API}/bot${config.token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: config.chatId, text, parse_mode: 'HTML' }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Telegram delivery unavailable');
        const body: unknown = await response.json();
        if (!body || typeof body !== 'object' || !('ok' in body) || body.ok !== true) {
          throw new Error('Telegram delivery unavailable');
        }
      })(),
    ]);
  } catch {
    // Fetch errors can contain the Bot API URL (and therefore the token).
    console.error('[telegram] sendMessage failed');
  } finally {
    clearTimeout(timeout);
  }
}

function escapeHTML(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
    `<b>Cliente:</b> ${escapeHTML(order.customer_name)} (${escapeHTML(order.customer_email)})\n` +
    `<b>${tipo}:</b> ${escapeHTML(order.content_title)}\n` +
    `<b>Fecha:</b> ${escapeHTML(order.event_date)}\n` +
    `<b>Total:</b> ${total}\n` +
    `<b>Orden:</b> <code>${escapeHTML(order.bold_order_id)}</code>`
  );
}

export function buildEmailErrorMessage(boldOrderId: string, error: string): string {
  return (
    `⚠️ <b>Email de confirmación falló</b>\n` +
    `<b>Orden:</b> <code>${escapeHTML(boldOrderId)}</code>\n` +
    `<b>Error:</b> ${escapeHTML(error)}`
  );
}
