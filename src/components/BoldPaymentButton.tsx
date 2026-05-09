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
// Helper — inject the Bold library script into <head> (idempotent)
// ---------------------------------------------------------------------------

let boldLibraryInjected = false;

function injectBoldLibrary(): Promise<void> {
  if (boldLibraryInjected) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
    script.async = true;
    script.onload = () => {
      boldLibraryInjected = true;
      resolve();
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

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const boldContainerRef = useRef<HTMLDivElement>(null);
  const payloadRef = useRef<CheckoutPayload | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const renderCountRef = useRef(0);
  const configElRef = useRef<HTMLScriptElement | null>(null);

  const addDebug = useCallback((msg: string) => {
    setDebugInfo(prev => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${msg}`]);
  }, []);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (boldContainerRef.current) {
        boldContainerRef.current.innerHTML = '';
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
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

  // --- Render Bold button ---
  //
  // Uses approach recommended by Bold docs for React:
  //   1. Append config <script data-bold-button> to the container div
  //   2. THEN inject the Bold library into <head>
  //
  // The Bold library scans the DOM at init time, finds the script tag
  // with data-bold-button, and replaces it with the checkout iframe.
  // ---------------------------------------------------------------------------
  const renderBoldButton = useCallback((payload: CheckoutPayload, customer: CustomerData) => {
    if (!boldContainerRef.current) {
      addDebug('ERROR: container ref is null');
      return;
    }

    renderCountRef.current += 1;
    const renderId = renderCountRef.current;
    addDebug(`renderBoldButton #${renderId} starting`);

    // Clear any previous Bold-rendered elements
    boldContainerRef.current.innerHTML = '';

    // 1. Create and append the config script tag
    const configEl = document.createElement('script');
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
    configElRef.current = configEl;
    addDebug(`config script appended to container (id=${payload.orderId})`);

    // 2. Set up a MutationObserver to detect when Bold modifies the container
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    let boldModified = false;
    observerRef.current = new MutationObserver((mutations) => {
      addDebug(`Mutation detected: ${mutations.length} mutation(s)`);
      for (const mutation of mutations) {
        addDebug(`  type=${mutation.type}, added=${mutation.addedNodes.length}, removed=${mutation.removedNodes.length}`);
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          boldModified = true;
          // Check if any iframe was added
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeName === 'IFRAME') {
              addDebug('BOLD IFRAME DETECTED! Checkout rendered successfully.');
              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }
          }
        }
      }
    });

    observerRef.current.observe(boldContainerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    addDebug('MutationObserver started on container');

    // 3. Set a 20-second timeout in case Bold never renders
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      if (!boldModified) {
        addDebug('TIMEOUT: Bold did not modify the container within 20s');
        // Check if the config tag is still in the DOM
        const stillInDom = document.body.contains(configElRef.current);
        addDebug(`config tag still in DOM: ${stillInDom}`);
        addDebug(`boldLibraryInjected: ${boldLibraryInjected}`);
        setPhase('error');
        setEmbeddingError('La pasarela de pago no respondió. Recarga la página e intenta nuevamente.');
      }
    }, 20000);

    // 4. NOW inject the Bold library into <head>
    addDebug('injecting Bold library into <head>...');
    injectBoldLibrary()
      .then(() => {
        addDebug('Bold library loaded successfully');
      })
      .catch((err: Error) => {
        addDebug(`Bold library FAILED to load: ${err.message}`);
        setPhase('error');
        setEmbeddingError('No se pudo cargar la pasarela de pago. Verifica tu conexión e intenta nuevamente.');
        onError?.(err);
      });
  }, [onError, addDebug]);

  // --- Once the "embedding" phase is committed, render the Bold button ---
  useEffect(() => {
    if (phase === 'embedding' && payloadRef.current) {
      addDebug('embedding phase detected in useEffect');
      renderBoldButton(payloadRef.current, customerData);
    }
  }, [phase, customerData, renderBoldButton, addDebug]);

  // --- Handle "Reservar ahora" click ---
  const handleReserve = useCallback(async () => {
    if (phase === 'loading') return;

    setPhase('loading');
    setEmbeddingError(null);
    setDebugInfo([]);
    addDebug('Starting reservation...');

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

      addDebug(`API response: ${response.status}`);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(errBody.error || `HTTP ${response.status}`);
      }

      const payload: CheckoutPayload = await response.json();
      payloadRef.current = payload;
      addDebug(`Checkout payload received. orderId=${payload.orderId}, amount=${payload.amount}`);

      setPhase('embedding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      addDebug(`Error: ${message}`);
      setPhase('error');
      setEmbeddingError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [contentType, contentId, customerData, phase, onError, addDebug]);

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
        {debugInfo.length > 0 && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">Diagnóstico ({debugInfo.length} eventos)</summary>
            <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-gray-100 p-2">
              {debugInfo.join('\n')}
            </pre>
          </details>
        )}
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
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium text-near-black">Iniciando pasarela de pago...</span>
        </div>
        {/* Bold renders its embedded checkout inside this container */}
        <div ref={boldContainerRef} className="min-h-[100px]" />
        {/* Debug panel */}
        {debugInfo.length > 0 && (
          <details open className="text-xs text-gray-500">
            <summary className="cursor-pointer">Diagnóstico ({debugInfo.length} eventos)</summary>
            <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-gray-100 p-2">
              {debugInfo.join('\n')}
            </pre>
          </details>
        )}
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
