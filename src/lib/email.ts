/**
 * Confirmaciones transaccionales con bindings runtime y clave de idempotencia
 * estable por orden. Los fallos se propagan sin datos del proveedor/secretos.
 */
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { render } from 'react-email';
import OrderConfirmationEmail from '@/src/emails/OrderConfirmationEmail';

interface TicketDetail {
  label: string;
  amount: number;
  quantity: number;
}

interface OrderEmailData {
  bold_order_id: string;
  customer_email: string;
  customer_name: string;
  content_title: string;
  content_type: 'event' | 'pasadia';
  event_date: string;
  ticket_details: unknown;
  amount: number;
  currency: string;
}

const EMAIL_TIMEOUT_MS = 10_000;
const EMAIL_FAILURE = 'Order confirmation email unavailable';

// Resend's send options do not expose AbortSignal. Its public fetchRequest
// method is the transport hook: keep cancellation local to this client/request.
class RequestBoundResend extends Resend {
  constructor(apiKey: string, private readonly signal: AbortSignal) {
    super(apiKey);
  }

  override fetchRequest<T>(path: string, options: RequestInit = {}) {
    return super.fetchRequest<T>(path, { ...options, signal: this.signal });
  }
}

function normalizeTickets(raw: unknown): TicketDetail[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((ticket: unknown) => {
    const t = ticket && typeof ticket === 'object' ? ticket as Record<string, unknown> : {};
    return {
      label: typeof t.label === 'string' ? t.label : 'Ticket',
      amount: typeof t.amount === 'number' ? t.amount : 0,
      quantity: typeof t.quantity === 'number' ? t.quantity : 1,
    };
  });
}

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  // Read per call: isolates may survive a binding/secret rotation.
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  if (typeof apiKey !== 'string' || !apiKey.trim() || typeof from !== 'string' || !from.trim()) {
    console.error('[email] Configuration unavailable');
    throw new Error(EMAIL_FAILURE);
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error(EMAIL_FAILURE));
      }, EMAIL_TIMEOUT_MS);
    });
    await Promise.race([
      deadline,
      (async () => {
        const resend = new RequestBoundResend(apiKey, controller.signal);
        let tickets = normalizeTickets(order.ticket_details);
        if (tickets.length === 0) {
          tickets = [{ label: 'Reserva', amount: order.amount, quantity: 1 }];
        }
        const prefix = order.content_type === 'event'
          ? 'Confirmación de tu reserva'
          : 'Confirmación de tu pasadía';
        const html = await render(OrderConfirmationEmail({
          customerName: order.customer_name,
          contentTitle: order.content_title,
          contentType: order.content_type,
          eventDate: order.event_date,
          tickets,
          totalAmount: order.amount,
          currency: order.currency,
          orderId: order.bold_order_id,
        }));
        // A slow renderer must not initiate delivery after our deadline.
        if (controller.signal.aborted) throw new Error(EMAIL_FAILURE);
        const { data, error } = await resend.emails.send({
          from,
          to: [order.customer_email],
          subject: `${prefix}: ${order.content_title}`,
          html,
        }, { idempotencyKey: `order-confirmation/${order.bold_order_id}` });
        if (error || !data?.id) throw new Error(EMAIL_FAILURE);
      })(),
    ]);
    console.log('[email] Confirmation sent');
  } catch {
    // Provider errors may contain credentials or customer data. Never forward
    // their body/message/cause to logs, callers, or the Telegram error alert.
    console.error('[email] Confirmation failed');
    throw new Error(EMAIL_FAILURE);
  } finally {
    clearTimeout(timeout);
  }
}
