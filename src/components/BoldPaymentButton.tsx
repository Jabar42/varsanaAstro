import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustomerData {
  email: string;
  fullName: string;
  phone?: string;
  dialCode?: string;
}

interface CheckoutPayload {
  orderId: string;
  amount: number;
  currency: string;
  integritySignature: string;
  apiKey: string;
  description: string;
  redirectionUrl: string;
}

interface TicketSelection {
  label: string;
  amount: number;
  quantity: number;
}

interface BoldPaymentButtonProps {
  contentType: 'event' | 'pasadia';
  contentId: string;
  prices: { label: string; amount: number }[];
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
}

/**
 * Dynamically load the Bold checkout script and resolve when BoldCheckout is
 * available on `window`.  Based on Bold's "Inicializar el script sólo en el
 * momento que lo necesites" pattern from the personalised-button docs.
 */
function loadBoldScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already available
    if (typeof (window as any).BoldCheckout !== 'undefined') {
      resolve();
      return;
    }

    // Script tag already present – wait for it to finish
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.bold.co/library/boldPaymentButton.js"]',
    );
    if (existing) {
      const check = setInterval(() => {
        if (typeof (window as any).BoldCheckout !== 'undefined') {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    // Create & inject a fresh script tag
    const script = document.createElement('script');
    script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';

    script.onload = () => {
      // Small guard – give the browser a tick to expose the constructor
      const check = setInterval(() => {
        if (typeof (window as any).BoldCheckout !== 'undefined') {
          clearInterval(check);
          resolve();
        }
      }, 50);
      // Safety timeout – reject after 5 s even if not ready
      setTimeout(() => { clearInterval(check); reject(new Error('BoldCheckout not available after load')); }, 5000);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Bold checkout script'));
    };

    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BoldPaymentButton({
  contentType,
  contentId,
  prices,
  onSuccess,
  onError,
}: BoldPaymentButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({ email: '', fullName: '' });
  const [boldReady, setBoldReady] = useState(false);

  // Initialize ticket selections from prices prop
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>(
    () => prices.map(p => ({ label: p.label, amount: p.amount, quantity: 0 })),
  );

  // Derived values
  const totalAmount = ticketSelections.reduce(
    (sum, t) => sum + t.amount * t.quantity, 0,
  );
  const totalQuantity = ticketSelections.reduce(
    (sum, t) => sum + t.quantity, 0,
  );
  const selectedTickets = ticketSelections.filter(t => t.quantity > 0);

  // ------------------------------------------------------------------
  // 1. Load Bold script on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    loadBoldScript()
      .then(() => setBoldReady(true))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Bold script load failed:', msg);
        setErrorMsg('No se pudo cargar la pasarela de pago. Intenta recargar la página.');
      });
  }, []);

  // ------------------------------------------------------------------
  // 2. Handle payment result from redirection URL params
  //    (when user lands back on this page after a redirect checkout)
  // ------------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const boldOrderId = params.get('bold-order-id');
    const boldTxStatus = params.get('bold-tx-status');

    if (boldOrderId && boldTxStatus) {
      if (boldTxStatus === 'approved') {
        setPhase('success');
        onSuccess?.(boldOrderId);
      } else {
        setPhase('error');
        setErrorMsg(
          boldTxStatus === 'declined' || boldTxStatus === 'failed'
            ? 'El pago no pudo completarse. Intenta nuevamente.'
            : `Estado: ${boldTxStatus}. Te notificaremos cuando se confirme.`,
        );
      }

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [onSuccess]);

  // ------------------------------------------------------------------
  // 3. Handle "Reservar ahora" click → API → BoldCheckout.open()
  // ------------------------------------------------------------------
  const handleReserve = useCallback(async () => {
    if (phase === 'loading') return;
    if (!boldReady) {
      setErrorMsg('La pasarela de pago aún no está lista. Intenta de nuevo en un momento.');
      return;
    }

    setPhase('loading');
    setErrorMsg(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          tickets: selectedTickets.map(t => ({ label: t.label, quantity: t.quantity })),
          customerData,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(errBody.error || `HTTP ${response.status}`);
      }

      const payload: CheckoutPayload = await response.json();

      // Create a BoldCheckout instance and open it immediately (embedded)
      const BoldCheckoutCtor = (window as any).BoldCheckout;
      if (!BoldCheckoutCtor) {
        throw new Error('BoldCheckout no está disponible. Recarga la página.');
      }

      const checkout = new BoldCheckoutCtor({
        orderId: payload.orderId,
        currency: payload.currency,
        amount: String(payload.amount),
        apiKey: payload.apiKey,
        integritySignature: payload.integritySignature,
        description: payload.description,
        redirectionUrl: payload.redirectionUrl,
        renderMode: 'embedded',
        customerData: JSON.stringify({
          email: customerData.email,
          fullName: customerData.fullName,
          ...(customerData.phone && { phone: customerData.phone }),
          ...(customerData.dialCode && { dialCode: customerData.dialCode }),
        }),
      });

      // Open the Bold checkout modal/iframe
      checkout.open();

      // Go back to idle so the underlying form is visible behind the modal
      setPhase('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setPhase('error');
      setErrorMsg(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [contentType, contentId, selectedTickets, customerData, phase, boldReady, onError]);

  // ------------------------------------------------------------------
  // 4. Update ticket quantity
  // ------------------------------------------------------------------
  const updateQuantity = useCallback((label: string, delta: number) => {
    setTicketSelections(prev =>
      prev.map(t =>
        t.label === label
          ? { ...t, quantity: Math.max(0, t.quantity + delta) }
          : t,
      ),
    );
  }, []);

  // ==================================================================
  // Render
  // ==================================================================

  if (phase === 'success') {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
        <p className="text-green-800 font-semibold">¡Pago exitoso!</p>
        <p className="text-green-600 text-sm mt-1">
          Pronto recibirás un correo de confirmación con los detalles de tu reserva.
        </p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{errorMsg || 'Ocurrió un error inesperado.'}</p>
        </div>
        <button
          onClick={() => { setPhase('idle'); setErrorMsg(null); }}
          className="w-full cursor-pointer rounded-lg bg-sacred-sand px-4 py-3 font-semibold text-near-black transition-colors hover:bg-sacred-sand/80"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-sacred-sand/50 px-4 py-3">
        <svg className="h-5 w-5 animate-spin text-near-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium text-near-black">Verificando disponibilidad...</span>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Idle state: ticket selector + customer form + "Reservar ahora"
  // ------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Ticket Selection Grid */}
      {prices.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-near-black">Selecciona tus boletos</h4>
          <div className="space-y-2">
            {ticketSelections.map(ticket => (
              <div
                key={ticket.label}
                className="flex items-center justify-between rounded-lg border border-sacred-sand bg-white px-3 py-2"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-near-black">{ticket.label}</p>
                  <p className="text-xs text-gray-500">{formatCOP(ticket.amount)} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(ticket.label, -1)}
                    disabled={ticket.quantity === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-sacred-sand text-sm font-medium text-near-black transition-colors hover:bg-sacred-sand/50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {ticket.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(ticket.label, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-sacred-sand text-sm font-medium text-near-black transition-colors hover:bg-sacred-sand/50"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single price: hide selector, show info */}
      {prices.length === 1 && (
        <div className="rounded-lg border border-sacred-sand bg-white px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-near-black">
              {prices[0].label} &middot; {formatCOP(prices[0].amount)}
            </p>
            <span className="text-sm font-semibold tabular-nums">× 1</span>
          </div>
        </div>
      )}

      {/* Running Total */}
      {totalAmount > 0 && (
        <div className="flex items-center justify-between border-t border-sacred-sand pt-2">
          <span className="text-sm font-medium text-near-black">Total</span>
          <span className="text-lg font-bold text-near-black">{formatCOP(totalAmount)}</span>
        </div>
      )}

      {/* Customer Form */}
      <div className="space-y-3 rounded-lg border border-sacred-sand bg-white p-4">
        <h4 className="text-sm font-semibold text-near-black">Tus datos</h4>
        <input
          type="email"
          placeholder="Correo electrónico *"
          required
          value={customerData.email}
          onChange={(e) => setCustomerData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
        />
        <input
          type="text"
          placeholder="Nombre completo *"
          required
          value={customerData.fullName}
          onChange={(e) => setCustomerData((prev) => ({ ...prev, fullName: e.target.value }))}
          className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Teléfono (opcional)"
          value={customerData.phone || ''}
          onChange={(e) => setCustomerData((prev) => ({ ...prev, phone: e.target.value }))}
          className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
        />
        {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
        <button
          onClick={handleReserve}
          disabled={!customerData.email || !customerData.fullName || totalQuantity === 0}
          className="w-full cursor-pointer rounded-lg bg-rausch px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rausch/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!boldReady
            ? 'Cargando pasarela de pago...'
            : totalQuantity === 0
              ? 'Selecciona al menos un boleto'
              : 'Reservar ahora'}
        </button>
      </div>
    </div>
  );
}
