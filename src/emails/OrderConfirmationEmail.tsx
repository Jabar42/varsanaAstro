import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from 'react-email';

interface TicketDetail {
  label: string;
  amount: number;
  quantity: number;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  contentTitle: string;
  contentType: 'event' | 'pasadia';
  eventDate: string;
  tickets: TicketDetail[];
  totalAmount: number;
  currency: string;
  orderId: string;
}

function formatDateSpanish(dateStr: string): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
}

export default function OrderConfirmationEmail({
  customerName = 'Invitado',
  contentTitle,
  contentType,
  eventDate,
  tickets,
  totalAmount,
  currency,
  orderId,
}: OrderConfirmationEmailProps) {
  const tipo = contentType === 'event' ? 'Evento' : 'Pasadía';
  const ticketRows = tickets.map((ticket, i) => {
    const subtotal = ticket.amount * ticket.quantity;
    return (
      <Row key={i} className="border-b border-solid border-gray-200 py-2">
        <Column className="py-2 pr-4">
          <Text className="text-sm text-gray-800 m-0 font-medium">
            {ticket.label}
          </Text>
        </Column>
        <Column className="py-2 px-2 text-center">
          <Text className="text-sm text-gray-600 m-0">{ticket.quantity}</Text>
        </Column>
        <Column className="py-2 px-2 text-right">
          <Text className="text-sm text-gray-600 m-0">
            {formatCurrency(ticket.amount)}
          </Text>
        </Column>
        <Column className="py-2 pl-4 text-right">
          <Text className="text-sm text-gray-800 m-0 font-medium">
            {formatCurrency(subtotal)}
          </Text>
        </Column>
      </Row>
    );
  });

  return (
    <Html lang="es">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                rausch: '#52185B',
                saffron: '#F7941E',
                forest: '#779B05',
                'sacred-sand': '#FAF9F6',
              },
            },
          },
        }}
      >
        <Head />
        <Preview>
          Confirmación de tu reserva en Varsana Eco Yoga Aldea
        </Preview>
        <Body className="bg-sacred-sand font-sans">
          <Container className="max-w-xl mx-auto py-8 px-4">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-2xl text-rausch m-0 font-bold tracking-wide">
                VARSANA
              </Heading>
              <Text className="text-sm text-gray-500 m-0 mt-1">
                Eco Yoga Aldea
              </Text>
            </Section>

            <Hr className="border-saffron border-solid my-6" />

            {/* Greeting */}
            <Text className="text-lg text-gray-800 m-0 mb-2">
              Hola {customerName},
            </Text>
            <Text className="text-base text-gray-600 m-0 mb-8">
              Tu reserva ha sido confirmada. Aquí están los detalles:
            </Text>

            {/* Content Card */}
            <Section className="bg-white rounded-3xl px-6 py-6 shadow-airbnb mb-8">
              <Section className="mb-4">
                <Text className="inline-block bg-saffron text-white text-xs font-bold px-3 py-1 rounded-full m-0 uppercase tracking-wide">
                  {tipo}
                </Text>
              </Section>

              <Heading className="text-xl text-rausch m-0 mb-2 font-bold">
                {contentTitle}
              </Heading>

              <Text className="text-base text-gray-600 m-0 mb-6">
                {formatDateSpanish(eventDate)}
              </Text>

              {/* Tickets Table */}
              <Section className="mb-4">
                {/* Header row */}
                <Row className="border-b-2 border-solid border-gray-300 pb-2 mb-2">
                  <Column className="pr-4">
                    <Text className="text-xs text-gray-500 font-bold uppercase m-0">
                      Ticket
                    </Text>
                  </Column>
                  <Column className="px-2 text-center">
                    <Text className="text-xs text-gray-500 font-bold uppercase m-0">
                      Cant.
                    </Text>
                  </Column>
                  <Column className="px-2 text-right">
                    <Text className="text-xs text-gray-500 font-bold uppercase m-0">
                      Precio
                    </Text>
                  </Column>
                  <Column className="pl-4 text-right">
                    <Text className="text-xs text-gray-500 font-bold uppercase m-0">
                      Subtotal
                    </Text>
                  </Column>
                </Row>
                {ticketRows}
              </Section>

              {/* Total */}
              <Row className="pt-3 border-t border-solid border-gray-200">
                <Column className="w-2/3">
                  <Text className="text-base text-gray-800 font-bold m-0">
                    Total
                  </Text>
                </Column>
                <Column className="w-1/3 text-right">
                  <Text className="text-base text-rausch font-bold m-0">
                    {formatCurrency(totalAmount)} {currency}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Order Reference */}
            <Section className="text-center mb-8">
              <Text className="text-xs text-gray-400 m-0">
                Referencia: <code className="text-gray-500">{orderId}</code>
              </Text>
            </Section>

            <Hr className="border-gray-200 border-solid my-6" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-sm text-gray-500 m-0 mb-1">
                Varsana Eco Yoga Aldea
              </Text>
              <Text className="text-xs text-gray-400 m-0 mb-4">
                Granada, Cundinamarca, Colombia
              </Text>
              <Text className="text-xs text-gray-400 m-0">
                Este es un correo automático generado por tu reserva.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

OrderConfirmationEmail.PreviewProps = {
  customerName: 'María García',
  contentTitle: 'Amanecer entre nubes',
  contentType: 'event',
  eventDate: '2026-06-15',
  tickets: [
    { label: 'Ticket general', amount: 20000, quantity: 2 },
    { label: 'Ticket preferencial', amount: 150000, quantity: 1 },
  ],
  totalAmount: 190000,
  currency: 'COP',
  orderId: 'event-amanecer-entre-nubes-1717000000000',
} satisfies OrderConfirmationEmailProps;

export { OrderConfirmationEmail };
