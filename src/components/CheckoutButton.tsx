import { useState } from 'react';

interface CheckoutButtonProps {
  /** ID del producto/evento (interno) */
  itemId: string;
  /** Título del producto (opcional) */
  itemTitle?: string;
  /** Precio unitario en la moneda local (ej. COP) */
  unitPrice: number;
  /** Cantidad por defecto (por defecto 1) */
  quantity?: number;
  /** Email del comprador (opcional, si no se proporciona se pedirá en un modal) */
  payerEmail?: string;
  /** Referencia externa para vincular con la orden (opcional) */
  externalReference?: string;
}

export default function CheckoutButton({
  itemId,
  itemTitle,
  unitPrice,
  quantity = 1,
  payerEmail,
  externalReference,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(payerEmail || '');

  const handleCheckout = async () => {
    if (!email.trim()) {
      setError('Por favor, ingresa tu email');
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setError('El email ingresado no es válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: itemId,
              quantity,
              unit_price: unitPrice,
              title: itemTitle,
            },
          ],
          payer_email: email,
          external_reference: externalReference,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la preferencia');
      }

      // Redirigir al init_point de Mercado Pago
      window.location.href = data.init_point;
    } catch (err) {
      console.error('Error en checkout:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-button-container">
      {!payerEmail && (
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email para recibir detalles del pago
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="tu@email.com"
            disabled={loading}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
      >
        {loading ? 'Procesando...' : `Pagar $${unitPrice * quantity} COP`}
      </button>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Serás redirigido a Mercado Pago para completar la transacción de forma segura.
      </p>
    </div>
  );
}