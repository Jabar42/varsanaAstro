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

interface BoldPaymentButtonProps {
  contentType: 'event' | 'pasadia';
  contentId: string;
  amount?: number;
  description?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BoldPaymentButton({
  contentType,
  contentId,
  amount: _amount,
  description: _description,
  onSuccess,
  onError,
}: BoldPaymentButtonProps) {
  // --- State ---
  const [phase, setPhase] = useState<'idle' | 'loading' | 'embedding' | 'success' | 'error'>('idle');
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({ email: '', fullName: '' });
  const [showForm, setShowForm] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);

  const boldContainerRef = useRef<HTMLDivElement>(null);
  const payloadRef = useRef<CheckoutPayload | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // --- Handle payment result from redirection URL params ---
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

  // --- Render Bold checkout (hidden until checkout form is ready) ---
  //
  // Uses Bold docs Approach B: put the library src directly on the config
  // <script data-bold-button> tag. The browser executes the script each
  // time a fresh script element is added to the DOM, regardless of cache.
  //
  // The container is kept hidden (CSS invisible) until the checkout form
  // (iframe) appears. Any intermediate button rendered by Bold is auto-clicked
  // while hidden, so the user sees only:
  //   "Reservar ahora" → spinner → embedded checkout form (no flicker)
  // ---------------------------------------------------------------------------
  const renderBoldCheckout = useCallback((payload: CheckoutPayload, customer: CustomerData) => {
    if (!boldContainerRef.current) return;

    // Reset state
    setCheckoutReady(false);

    // Clear any previous Bold-rendered elements
    boldContainerRef.current.innerHTML = '';

    // Create config script WITH src (Approach B)
    const configEl = document.createElement('script');
    configEl.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
    configEl.setAttribute('data-bold-button', 'dark-L');
    configEl.setAttribute('data-api-key', payload.apiKey);
    configEl.setAttribute('data-amount', String(payload.amount));
    configEl.setAttribute('data-currency', payload.currency);
    configEl.setAttribute('data-order-id', payload.orderId);
    configEl.setAttribute('data-integrity-signature', payload.integritySignature);
    configEl.setAttribute('data-description', payload.description);
    configEl.setAttribute('data-redirection-url', payload.redirectionUrl);
    configEl.setAttribute('data-render-mode', 'embedded');

    configEl.setAttribute(
      'data-customer-data',
      JSON.stringify({
        email: customer.email,
        fullName: customer.fullName,
        ...(customer.phone && { phone: customer.phone }),
        ...(customer.dialCode && { dialCode: customer.dialCode }),
      }),
    );

    boldContainerRef.current.appendChild(configEl);

    // Set up a MutationObserver that handles all rendering scenarios:
    //   A) Bold renders the checkout form (iframe) directly → show container
    //   B) Bold renders a button → auto-click while hidden → show container when iframe appears
    //   C) Bold renders other non-script content → show container
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    let autoClicked = false;

    observerRef.current = new MutationObserver(() => {
      if (!boldContainerRef.current) return;

      // Prefer iframe detection (checkout form is ready)
      const iframe = boldContainerRef.current.querySelector('iframe');
      if (iframe) {
        setCheckoutReady(true);
        observerRef.current?.disconnect();
        return;
      }

      // If a button exists and we haven't auto-clicked yet, do it now
      if (!autoClicked) {
        const btn = boldContainerRef.current.querySelector('button');
        if (btn) {
          autoClicked = true;
          btn.click();
          return; // Wait for next mutation (checkout form after click)
        }
      }

      // If there's any rendered content that isn't the config script, show it
      const hasContent = Array.from(boldContainerRef.current.children).some(
        (child) => child.tagName !== 'SCRIPT',
      );
      if (hasContent) {
        setCheckoutReady(true);
        observerRef.current?.disconnect();
      }
    });

    observerRef.current.observe(boldContainerRef.current, {
      childList: true,
      subtree: true,
    });
  }, []);

  // --- Once the "embedding" phase is committed, render the Bold checkout ---
  useEffect(() => {
    if (phase === 'embedding' && payloadRef.current) {
      renderBoldCheckout(payloadRef.current, customerData);
    }
  }, [phase, customerData, renderBoldCheckout]);

  // --- Handle "Reservar ahora" click ---
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
          quantity: 1,
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
  }, [contentType, contentId, customerData, phase, onError]);

  // ==========================================================================
  // Render
  // ==========================================================================

  // --- Success state ---
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

  // --- Error state ---
  if (phase === 'error' && !showForm) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{embeddingError || 'Ocurrió un error inesperado.'}</p>
        </div>
        <button
          onClick={() => {
            setPhase('idle');
            setEmbeddingError(null);
          }}
          className="w-full cursor-pointer rounded-lg bg-sacred-sand px-4 py-3 font-semibold text-near-black transition-colors hover:bg-sacred-sand/80"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  // --- Loading / Embedding phases ---
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-sacred-sand/50 px-4 py-3">
        <svg
          className="h-5 w-5 animate-spin text-near-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
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
        {/* Spinner — hidden once checkout is ready */}
        {!checkoutReady && (
          <div className="flex items-center justify-center gap-3 rounded-lg bg-sacred-sand/50 px-4 py-3">
            <svg
              className="h-5 w-5 animate-spin text-near-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-near-black">Iniciando pasarela de pago...</span>
          </div>
        )}
        {/* Bold checkout container — hidden until checkout form is ready */}
        <div
          key="bold-container"
          ref={boldContainerRef}
          className={`flex justify-center min-h-[100px] ${!checkoutReady ? 'invisible' : ''}`}
        />
      </div>
    );
  }

  // --- Idle state: show customer form + "Reservar ahora" button ---
  return (
    <div className="space-y-4">
      {showForm ? (
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

          {embeddingError && (
            <p className="text-xs text-red-600">{embeddingError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 cursor-pointer rounded-lg border border-sacred-sand px-4 py-2.5 text-sm font-medium text-near-black transition-colors hover:bg-sacred-sand/50"
            >
              Cancelar
            </button>
            <button
              onClick={handleReserve}
              disabled={!customerData.email || !customerData.fullName}
              className="flex-1 cursor-pointer rounded-lg bg-rausch px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rausch/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reservar ahora
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full cursor-pointer rounded-lg bg-rausch px-4 py-3 font-semibold text-white transition-colors hover:bg-rausch/90"
        >
          Reservar ahora
        </button>
      )}
    </div>
  );
}
