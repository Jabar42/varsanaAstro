import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ---------------------------------------------------------------------------
// Global type declaration — elimina todos los (window as any).BoldCheckout
// FIX Leg 1
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    BoldCheckout: new (config: Record<string, string>) => { open(): void };
  }
}

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

interface PriceTier {
  label: string;
  amount: number;
  min_quantity?: number;
}

interface BoldPaymentButtonProps {
  contentType: "event" | "pasadia";
  contentId: string;
  prices: PriceTier[];
  fixedDate?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// FIX Leg 3: formatCOP ahora maneja valores inválidos
function formatCOP(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "$0";
  return "$" + amount.toLocaleString("es-CO");
}

// FIX Seg 3: validación de formato de email en cliente
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Dynamically load the Bold checkout script and resolve when BoldCheckout is
 * available on `window`.  Based on Bold's "Inicializar el script sólo en el
 * momento que lo necesites" pattern from the personalised-button docs.
 */
function loadBoldScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already available
    if (typeof window.BoldCheckout !== "undefined") {
      resolve();
      return;
    }

    // FIX Bug 2: la rama "script ya existe" ahora tiene timeout de seguridad
    // para evitar un interval infinito si el script nunca expone BoldCheckout
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.bold.co/library/boldPaymentButton.js"]',
    );
    if (existing) {
      let elapsed = 0;
      const check = setInterval(() => {
        elapsed += 100;
        if (typeof window.BoldCheckout !== "undefined") {
          clearInterval(check);
          resolve();
        } else if (elapsed >= 8000) {
          clearInterval(check);
          reject(new Error("BoldCheckout load timeout"));
        }
      }, 100);
      return;
    }

    // Create & inject a fresh script tag
    const script = document.createElement("script");
    script.src = "https://checkout.bold.co/library/boldPaymentButton.js";

    script.onload = () => {
      // Small guard: give the browser a tick to expose the constructor
      const check = setInterval(() => {
        if (typeof window.BoldCheckout !== "undefined") {
          clearInterval(check);
          resolve();
        }
      }, 50);
      // Safety timeout: reject after 5 s even if not ready
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("BoldCheckout not available after load"));
      }, 5000);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Bold checkout script"));
    };

    document.head.appendChild(script);
  });
}

// FIX Leg 2: lógica de apertura del SDK extraída como función pura,
// separando responsabilidades de handleReserve
function openBoldCheckout(
  payload: CheckoutPayload,
  customer: CustomerData,
): void {
  if (typeof window.BoldCheckout === "undefined") {
    throw new Error("BoldCheckout no está disponible. Recarga la página.");
  }

  // Nota: payload.apiKey viene del servidor. Confirmar con Bold que es una
  // clave pública antes de asumir que exponerla al cliente es seguro (Seg 1).
  const checkout = new window.BoldCheckout({
    orderId: payload.orderId,
    currency: payload.currency,
    amount: String(payload.amount),
    apiKey: payload.apiKey,
    integritySignature: payload.integritySignature,
    description: payload.description,
    redirectionUrl: payload.redirectionUrl,
    renderMode: "embedded",
    customerData: JSON.stringify({
      email: customer.email,
      fullName: customer.fullName,
      ...(customer.phone && { phone: customer.phone }),
      ...(customer.dialCode && { dialCode: customer.dialCode }),
    }),
  });

  checkout.open();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BoldPaymentButton({
  contentType,
  contentId,
  prices,
  fixedDate,
  onSuccess,
  onError,
}: BoldPaymentButtonProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    email: "",
    fullName: "",
  });
  const [boldReady, setBoldReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(fixedDate || "");
  const needsDatePicker = contentType === "pasadia" && !fixedDate;

  // FIX Bug 3: refs estabilizados para los callbacks del padre. Evitan que el
  // useEffect de redirección se re-ejecute si el padre no memoriza los callbacks,
  // lo que podría disparar onSuccess más de una vez.
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Contador único de personas
  const [quantity, setQuantity] = useState(prices.length === 1 ? 1 : 0);

  // Precio por persona según cantidad seleccionada (descuento por volumen)
  const effectivePrice = useMemo(() => {
    if (prices.length === 0) return 0;
    // Ordenar por min_quantity descendente, elegir el primer precio donde quantity >= min_quantity
    const sorted = [...prices].sort(
      (a, b) => (b.min_quantity ?? 1) - (a.min_quantity ?? 1),
    );
    const tier = sorted.find((p) => quantity >= (p.min_quantity ?? 1));
    return tier ? tier.amount : prices[prices.length - 1].amount;
  }, [prices, quantity]);

  const baseAmount = prices.length > 0 ? Math.min(...prices.map(p => p.min_quantity ?? 1)) : 1;
  const basePrice = prices.find(p => (p.min_quantity ?? 1) === baseAmount)?.amount ?? effectivePrice;
  const discountTier = prices.find(p => (p.min_quantity ?? 1) > 1 && p.amount < basePrice);
  const hasVolumeDiscount = !!discountTier;
  const discountApplied = hasVolumeDiscount && effectivePrice < basePrice;
  const totalAmount = effectivePrice * quantity;
  const priceLabel = prices[0]?.label ?? "";

  // FIX Bug 5: minDate memoizado — new Date() en el cuerpo del componente
  // producía una instancia diferente en cada render
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  // ------------------------------------------------------------------
  // 1. Load Bold script on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    loadBoldScript()
      .then(() => setBoldReady(true))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Bold script load failed:", msg);
        setErrorMsg(
          "No se pudo cargar la pasarela de pago. Intenta recargar la página.",
        );
      });
  }, []);

  // ------------------------------------------------------------------
  // 2. Handle payment result from redirection URL params
  //    (when user lands back on this page after a redirect checkout)
  // ------------------------------------------------------------------
  // FIX Bug 3: dep array vacío — solo ejecutar al montar.
  // onSuccess/onError se llaman a través de refs para no re-ejecutar este
  // effect si el padre recrea los callbacks entre renders.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const boldOrderId = params.get("bold-order-id");
    const boldTxStatus = params.get("bold-tx-status");

    if (boldOrderId && boldTxStatus) {
      if (boldTxStatus === "approved") {
        setPhase("success");
        onSuccessRef.current?.(boldOrderId);
      } else {
        setPhase("error");
        setErrorMsg(
          boldTxStatus === "declined" || boldTxStatus === "failed"
            ? "El pago no pudo completarse. Intenta nuevamente."
            : `Estado: ${boldTxStatus}. Te notificaremos cuando se confirme.`,
        );
      }

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------
  // 3. Handle "Reservar ahora" click → API → BoldCheckout.open()
  // ------------------------------------------------------------------
  // FIX Bug 1: setPhase('idle') se mueve después de openBoldCheckout(); si
  //            open() lanza, el catch captura el error sin resetear el estado
  //            prematuramente.
  // FIX Leg 2: la apertura del SDK fue delegada a openBoldCheckout().
  const handleReserve = useCallback(async () => {
    if (phase === "loading") return;
    if (!boldReady) {
      setErrorMsg(
        "La pasarela de pago aún no está lista. Intenta de nuevo en un momento.",
      );
      return;
    }

    if (needsDatePicker && selectedDate) {
      const chosen = new Date(selectedDate);
      if (isNaN(chosen.getTime())) {
        setErrorMsg("La fecha seleccionada no es válida.");
        return;
      }
    }

    setPhase("loading");
    setErrorMsg(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          eventDate: selectedDate || undefined,
          tickets: [{ label: priceLabel, quantity, amount: effectivePrice }],
          customerData,
        }),
      });

      if (!response.ok) {
        const errBody = (await response
          .json()
          .catch(() => ({ error: "Error del servidor" }))) as {
          error?: string;
        };
        throw new Error(errBody.error || `HTTP ${response.status}`);
      }

      const payload: CheckoutPayload = await response.json();

      openBoldCheckout(payload, customerData);

      setPhase("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setPhase("error");
      setErrorMsg(message);
      onErrorRef.current?.(err instanceof Error ? err : new Error(message));
    }
  }, [
    contentType,
    contentId,
    priceLabel,
    quantity,
    effectivePrice,
    customerData,
    selectedDate,
    phase,
    boldReady,
    needsDatePicker,
  ]);

  const canSubmit =
    isValidEmail(customerData.email) &&
    customerData.fullName.trim().length > 0 &&
    quantity > 0 &&
    (!needsDatePicker || !!selectedDate);

  // ==================================================================
  // Render
  // ==================================================================

  if (phase === "success") {
    return (
      <div className="rounded-xl bg-forest/10 border border-forest/20 p-4 text-center">
        <p className="text-forest font-semibold">¡Pago exitoso!</p>
        <p className="text-forest/80 text-sm mt-1">
          Pronto recibirás un correo de confirmación con los detalles de tu
          reserva.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-rausch/10 border border-rausch/20 p-4 text-center">
          <p className="text-rausch font-semibold">Error</p>
          <p className="text-rausch/80 text-sm mt-1">
            {errorMsg || "Ocurrió un error inesperado."}
          </p>
        </div>
        <button
          onClick={() => {
            setPhase("idle");
            setErrorMsg(null);
          }}
          className="w-full cursor-pointer rounded-xl bg-sacred-sand px-4 py-3 font-semibold text-near-black transition-colors hover:bg-sacred-sand/50"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-sacred-sand/50 px-4 py-3">
        <svg
          className="h-5 w-5 animate-spin text-near-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm font-medium text-near-black">
          Verificando disponibilidad...
        </span>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Idle state: ticket selector + customer form + "Reservar ahora"
  // FIX Perf 1: JSX unificado — un solo bloque de tickets para ambos casos
  // (prices.length === 1 y prices.length > 1). Elimina ~30 líneas duplicadas.
  // ------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Date Picker — pasadias only */}
      {needsDatePicker && (
        <div className="space-y-1">
          <label className="text-sm font-semibold text-near-black font-display tracking-tightest">
            Elige la fecha
          </label>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
          />
        </div>
      )}

      {/* Person Counter */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-near-black font-display tracking-tightest">
          Personas
        </h4>
        <div className="flex items-center justify-between rounded-xl border border-sacred-sand bg-lotus-white px-3 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-near-black">
              {quantity > 0
                ? `${formatCOP(effectivePrice)} / persona`
                : "Selecciona la cantidad"}
            </p>
            {hasVolumeDiscount && quantity > 0 && (
              <p className="text-xs text-forest mt-0.5">
                {discountApplied
                  ? "¡Descuento por volumen aplicado!"
                  : `Compra ${discountTier?.min_quantity ?? 2}+ para obtener descuento`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(0, q - 1))}
              disabled={quantity === 0}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-sacred-sand text-sm font-medium text-near-black transition-colors hover:bg-sacred-sand/50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <span className="w-8 text-center text-base font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-sacred-sand text-sm font-medium text-near-black transition-colors hover:bg-sacred-sand/50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Running Total */}
      {totalAmount > 0 && (
        <div className="flex items-center justify-between border-t border-sacred-sand pt-2">
          <span className="text-sm font-medium text-near-black">Total</span>
          <span className="text-lg font-bold text-near-black">
            {formatCOP(totalAmount)}
          </span>
        </div>
      )}

      {/* Customer Form */}
      <div className="space-y-3 rounded-lg border border-sacred-sand bg-lotus-white p-4">
        <h4 className="text-sm font-semibold text-near-black font-display tracking-tightest">Tus datos</h4>
        <input
          type="email"
          placeholder="Correo electrónico *"
          required
          value={customerData.email}
          onChange={(e) =>
            setCustomerData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
        />
        <input
          type="text"
          placeholder="Nombre completo *"
          required
          value={customerData.fullName}
          onChange={(e) =>
            setCustomerData((prev) => ({ ...prev, fullName: e.target.value }))
          }
          className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Teléfono (opcional)"
          value={customerData.phone || ""}
          onChange={(e) =>
            setCustomerData((prev) => ({ ...prev, phone: e.target.value }))
          }
          className="w-full rounded-md border border-sacred-sand px-3 py-2 text-sm focus:border-rausch focus:outline-none"
        />
        {errorMsg && <p className="text-xs text-rausch">{errorMsg}</p>}
        <button
          onClick={handleReserve}
          disabled={!canSubmit}
          className="w-full cursor-pointer rounded-xl bg-rausch px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rausch/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!boldReady
            ? "Cargando pasarela de pago..."
            : needsDatePicker && !selectedDate
              ? "Elige una fecha"
              : quantity === 0
                ? "Selecciona al menos una persona"
                : "Reservar ahora"}
        </button>
      </div>
    </div>
  );
}
