import { useState, useEffect, useRef, useCallback } from 'react';

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

/** Format COP amounts with locale formatting */
function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
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
  const [phase, setPhase] = useState<'idle' | 'loading' | 'embedding' | 'success' | 'error'>('idle');
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({ email: '', fullName: '' });
  const [checkoutReady, setCheckoutReady] = useState(false);

  // Initialize ticket selections from prices prop
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>(
    () => prices.map(p => ({ label: p.label, amount: p.amount, quantity: 0 })),
  );

  const boldContainerRef = useRef<HTMLDivElement>(null);
  const payloadRef = useRef<CheckoutPayload | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Derived values
  const totalAmount = ticketSelections.reduce(
    (sum, t) => sum + t.amount * t.quantity, 0,
  );
  const totalQuantity = ticketSelections.reduce(
    (sum, t) => sum + t.quantity, 0,
  );
  const selectedTickets = ticketSelections.filter(t => t.quantity > 0);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // Handle payment result from redirection URL params
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
        setEmbeddingError(
          boldTxStatus === 'declined' || boldTxStatus === 'failed'
            ? 'El pago no pudo completarse. Intenta nuevamente.'
            : `Estado: ${boldTxStatus}. Te notificaremos cuando se confirme.`,
        );
      }

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [onSuccess]);

  // Render Bold checkout using Approach B (src directly on the config script tag).
  // The browser executes the script each time a fresh <script> element is added
  // to the DOM, even if the file is cached.
  // ---------------------------------------------------------------------------
  const renderBoldCheckout = useCallback((payload: CheckoutPayload, customer: CustomerData) => {
    if (!boldContainerRef.current) return;

    setCheckoutReady(false);
    boldContainerRef.current.innerHTML = '';

    // 1. Create the config script tag with src (Approach B)
    const script = document.createElement('script');
    script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
    script.setAttribute('data-bold-button', 'dark-L');
    script.setAttribute('data-api-key', payload.apiKey);
    script.setAttribute('data-amount', String(payload.amount));
    script.setAttribute('data-currency', payload.currency);
    script.setAttribute('data-order-id', payload.orderId);
    script.setAttribute('data-integrity-signature', payload.integritySignature);
    script.setAttribute('data-description', payload.description);
    script.setAttribute('data-redirection-url', payload.redirectionUrl);
    script.setAttribute('data-render-mode', 'embedded');
    script.setAttribute(
      'data-customer-data',
      JSON.stringify({
        email: customer.email,
        fullName: customer.fullName,
        ...(customer.phone && { phone: customer.phone }),
        ...(customer.dialCode && { dialCode: customer.dialCode }),
      }),
    );

    boldContainerRef.current.appendChild(script);

    // 2. Observe the container for Bold-rendered content.
    //    When Bold adds any non-<script> element, the checkout is visible.
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new MutationObserver(() => {
      if (!boldContainerRef.current) return;

      const hasRenderedContent = Array.from(boldContainerRef.current.children)
        .some((child) => child.tagName !== 'SCRIPT');

      if (hasRenderedContent) {
        setCheckoutReady(true);
        observerRef.current?.disconnect();
      }
    });

    observerRef.current.observe(boldContainerRef.current, {
      childList: true,
      subtree: true,
    });
  }, []);

  // Once the "embedding" phase is committed, render Bold into the container
  useEffect(() => {
    if (phase === 'embedding' && payloadRef.current) {
      renderBoldCheckout(payloadRef.current, customerData);
    }
  }, [phase, customerData, renderBoldCheckout]);

  // Handle "Reservar ahora" click: call the API then transition to embedding
  const handleReserve = useCallback(async () => {
    if (phase === 'loading') return;

    setPhase('loading');
    setEmbeddingError(null);

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
      payloadRef.current = payload;
      setPhase('embedding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setPhase('error');
      setEmbeddingError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [contentType, contentId, selectedTickets, customerData, phase, onError]);

  // Update ticket quantity
  const updateQuantity = useCallback((label: string, delta: number) => {
    setTicketSelections(prev =>
      prev.map(t =>
        t.label === label
          ? { ...t, quantity: Math.max(0, t.quantity + delta) }
          : t,
      ),
    );
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

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

  if (phase === 'error' && phase !== 'idle') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{embeddingError || 'Ocurrió un error inesperado.'}</p>
        </div>
        <button
          onClick={() => { setPhase('idle'); setEmbeddingError(null); }}
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

  if (phase === 'embedding') {
    return (
      <div className="space-y-3">
        {!checkoutReady && (
          <div className="flex items-center justify-center gap-3 rounded-lg bg-sacred-sand/50 px-4 py-3">
            <svg className="h-5 w-5 animate-spin text-near-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-near-black">Iniciando pasarela de pago...</span>
          </div>
        )}
        <div key="bold-container" ref={boldContainerRef} className="flex justify-center min-h-[100px]" />
      </div>
    );
  }

  // Idle state: ticket selector + customer form + "Reservar ahora" button
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
        {embeddingError && <p className="text-xs text-red-600">{embeddingError}</p>}
        <button
          onClick={handleReserve}
          disabled={!customerData.email || !customerData.fullName || totalQuantity === 0}
          className="w-full cursor-pointer rounded-lg bg-rausch px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rausch/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {totalQuantity === 0 ? 'Selecciona al menos un boleto' : 'Reservar ahora'}
        </button>
      </div>
    </div>
  );
}
