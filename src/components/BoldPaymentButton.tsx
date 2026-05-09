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
// Script loader — loads Bold library AFTER the button script tag is in the DOM
// The Bold library scans the DOM at init time for [data-bold-button] elements,
// so we must ensure the button script tag exists BEFORE loading the library.
// ---------------------------------------------------------------------------

let boldScriptPromise: Promise<void> | null = null;

/**
 * Removes any previously-loaded Bold library script from the DOM so that
 * loading it again will trigger a fresh DOM scan for [data-bold-button].
 */
function resetBoldScript(): void {
  const existing = document.querySelector(
    'script[src="https://checkout.bold.co/library/boldPaymentButton.js"]',
  );
  if (existing) {
    existing.remove();
  }
  boldScriptPromise = null;
}

function loadBoldScript(): Promise<void> {
  if (boldScriptPromise) return boldScriptPromise;

  boldScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      boldScriptPromise = null; // Allow retry on failure
      reject(new Error('Failed to load Bold checkout script'));
    };
    document.head.appendChild(script);
  });

  return boldScriptPromise;
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
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'embedding' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({ email: '', fullName: '' });
  const [showForm, setShowForm] = useState(false);

  const boldContainerRef = useRef<HTMLDivElement>(null);
  const payloadRef = useRef<CheckoutPayload | null>(null);

  // --- Cleanup: remove Bold-rendered elements when unmounting or re-rendering ---
  useEffect(() => {
    return () => {
      if (boldContainerRef.current) {
        boldContainerRef.current.innerHTML = '';
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

  // --- Load Bold library on mount so the initial button shows "Reservar ahora" ---
  useEffect(() => {
    loadBoldScript()
      .then(() => setScriptReady(true))
      .catch((err: Error) => {
        setScriptError(err.message);
        onError?.(err);
      });
  }, [onError]);

  // --- Render Bold button script tag, THEN reload the library so it scans the DOM ---
  const renderBoldButton = useCallback((payload: CheckoutPayload, customer: CustomerData) => {
    if (!boldContainerRef.current) return;

    // Clear any previous Bold-rendered elements
    boldContainerRef.current.innerHTML = '';

    // 1. Create the configuration script tag FIRST — this is what Bold's
    //    library will detect and replace with the checkout iframe
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('data-bold-button', 'dark-L');
    scriptEl.setAttribute('data-api-key', payload.apiKey);
    scriptEl.setAttribute('data-amount', String(payload.amount));
    scriptEl.setAttribute('data-currency', payload.currency);
    scriptEl.setAttribute('data-order-id', payload.orderId);
    scriptEl.setAttribute('data-integrity-signature', payload.integritySignature);
    scriptEl.setAttribute('data-description', payload.description);
    scriptEl.setAttribute('data-redirection-url', payload.redirectionUrl);
    scriptEl.setAttribute('data-render-mode', 'embedded');

    scriptEl.setAttribute(
      'data-customer-data',
      JSON.stringify({
        email: customer.email,
        fullName: customer.fullName,
        ...(customer.phone && { phone: customer.phone }),
        ...(customer.dialCode && { dialCode: customer.dialCode }),
      }),
    );

    boldContainerRef.current.appendChild(scriptEl);

    // 2. NOW load/reset the Bold library so it scans the DOM and finds the tag
    resetBoldScript();
    loadBoldScript()
      .then(() => setScriptReady(true))
      .catch((err: Error) => {
        setScriptError(err.message);
        onError?.(err);
      });
  }, [onError]);

  // --- Once the "embedding" phase is committed, render the Bold button ---
  useEffect(() => {
    if (phase === 'embedding' && payloadRef.current) {
      renderBoldButton(payloadRef.current, customerData);
    }
  }, [phase, customerData, renderBoldButton]);

  // --- Handle "Reservar ahora" click ---
  const handleReserve = useCallback(async () => {
    if (phase === 'loading') return;

    setPhase('loading');
    setErrorMsg(null);

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

      // Transition to embedding phase — React re-renders, creating the container
      // div. The useEffect above will fire once the DOM is committed,
      // ensuring boldContainerRef.current is set.
      setPhase('embedding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setPhase('error');
      setErrorMsg(message);
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
          <p className="text-red-600 text-sm mt-1">{errorMsg || 'Ocurrió un error inesperado.'}</p>
        </div>
        <button
          onClick={() => {
            setPhase('idle');
            setErrorMsg(null);
          }}
          className="w-full cursor-pointer rounded-lg bg-sacred-sand px-4 py-3 font-semibold text-near-black transition-colors hover:bg-sacred-sand/80"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  // --- Script failed to load ---
  if (scriptError) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
        <p className="text-red-800 font-semibold">Error de conexión</p>
        <p className="text-red-600 text-sm mt-1">
          No se pudo cargar la pasarela de pago. Por favor, recarga la página.
        </p>
      </div>
    );
  }

  // --- Loading / Embedding phases (spinner + status) ---
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
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm font-medium text-near-black">Verificando disponibilidad...</span>
      </div>
    );
  }

  if (phase === 'embedding') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3 rounded-lg bg-sacred-sand/50 px-4 py-3">
          <svg
            className="h-5 w-5 animate-spin text-near-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm font-medium text-near-black">Iniciando pasarela de pago...</span>
        </div>
        {/* Bold renders its embedded checkout inside this container */}
        <div ref={boldContainerRef} className="min-h-[100px]" />
      </div>
    );
  }

  // --- Idle state: show customer form + "Reservar ahora" button ---
  return (
    <div className="space-y-4">
      {/* Customer data form — shown before payment */}
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

          {errorMsg && (
            <p className="text-xs text-red-600">{errorMsg}</p>
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
              disabled={!customerData.email || !customerData.fullName || !scriptReady}
              className="flex-1 cursor-pointer rounded-lg bg-rausch px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rausch/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reservar ahora
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          disabled={!scriptReady}
          className="w-full cursor-pointer rounded-lg bg-rausch px-4 py-3 font-semibold text-white transition-colors hover:bg-rausch/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scriptReady ? 'Reservar ahora' : 'Cargando...'}
        </button>
      )}
    </div>
  );
}
