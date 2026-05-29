import { Resend } from 'resend';
import { render } from 'react-email';
import OrderConfirmationEmail from '@/src/emails/OrderConfirmationEmail';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _resend: Resend | null = null;

function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(import.meta.env.RESEND_API_KEY as string);
  }
  return _resend;
}

function normalizeTickets(raw: unknown): TicketDetail[] {
  if (!Array.isArray(raw)) return [];
  const normalized = raw.map((t: any) => ({
    label: typeof t?.label === 'string' ? t.label : 'Ticket',
    amount: typeof t?.amount === 'number' ? t.amount : 0,
    quantity: typeof t?.quantity === 'number' ? t.quantity : 1,
  }));
  return normalized.length > 0 ? normalized : [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  const resend = getResendClient();

  let tickets = normalizeTickets(order.ticket_details);
  if (tickets.length === 0) {
    tickets = [{ label: 'Reserva', amount: order.amount, quantity: 1 }];
  }

  const prefix =
    order.content_type === 'event'
      ? 'Confirmación de tu reserva'
      : 'Confirmación de tu pasadía';
  const subject = `${prefix}: ${order.content_title}`;

  let html: string;
  try {
    html = await render(
      OrderConfirmationEmail({
        customerName: order.customer_name,
        contentTitle: order.content_title,
        contentType: order.content_type,
        eventDate: order.event_date,
        tickets,
        totalAmount: order.amount,
        currency: order.currency,
        orderId: order.bold_order_id,
      }),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[email] render failed for ${order.bold_order_id}:`, msg);
    throw new Error(`render: ${msg}`);
  }

  const { data, error } = await resend.emails.send(
    {
      from: 'Varsana Eco Yoga Aldea <reservas@varsana.co>',
      to: [order.customer_email],
      subject,
      html,
    },
    { idempotencyKey: `order-confirmation/${order.bold_order_id}` },
  );

  if (error) {
    console.error(
      `[email] send failed for ${order.bold_order_id}:`,
      error.name,
      error.message,
    );
    throw new Error(error.message);
  }

  console.log(
    `[email] confirmation sent for ${order.bold_order_id}, resendId=${data?.id}`,
  );
}
