# Plan de Integración de Mercado Pago Checkout Pro

## Contexto
Proyecto Astro 6.1.6 desplegado en Vercel. SDK mercadopago 2.12.0 ya instalado.

## Objetivos
1. Generar preferencias de pago seguras desde el servidor.
2. Redirigir al usuario al checkout de Mercado Pago.
3. Recibir notificaciones de pago (webhooks) para actualizar estados.
4. Mantener seguridad del access token y tipado estricto.

## Diseño Técnico

### Variables de Entorno
- `MP_ACCESS_TOKEN`: Token de acceso de Mercado Pago (Producción o Sandbox).
- `PUBLIC_MP_PUBLIC_KEY`: Clave pública para uso frontend (expuesta al cliente por Astro).
- `SITE` (ya definido por Astro): URL base del sitio.

Se renombrarán las variables existentes en `.env`:
- `MERCADOPAGO-ACCESS-TOKEN` → `MP_ACCESS_TOKEN`
- `MERCADOPAGO-PUBLIC-KEY` → `PUBLIC_MP_PUBLIC_KEY`

**Tipado en `src/env.d.ts`:**
```typescript
interface ImportMetaEnv {
  readonly MP_ACCESS_TOKEN: string;
  readonly PUBLIC_MP_PUBLIC_KEY?: string;
  readonly SITE?: string;
}
```

### Endpoint de Creación de Preferencia
**Ruta:** `POST /api/create-preference`

**Request Body:**
```typescript
interface CreatePreferenceRequest {
  items: Array<{
    id: string;        // Identificador interno del producto/evento
    quantity: number;
    unit_price: number; // Precio unitario en la moneda local (ej. COP)
    title?: string;    // Opcional, se puede obtener desde BD
  }>;
  payer_email: string; // Email del comprador
  external_reference?: string; // Referencia externa para vincular la orden
}
```

**Validaciones:**
- `items` no vacío.
- `unit_price` positivo.
- `payer_email` formato válido.

**Proceso:**
1. Inicializar cliente de Mercado Pago con `MP_ACCESS_TOKEN`.
2. Construir objeto `preference` con:
   - `items` (transformados al formato de Mercado Pago).
   - `payer` (con email).
   - `back_urls` generadas dinámicamente usando `import.meta.env.SITE` (asegurar que termine con `/`):
     - `success`: `${site}/pago/exito`
     - `failure`: `${site}/pago/fallo`
     - `pending`: `${site}/pago/pendiente`
   - `auto_return`: `"approved"`.
   - `external_reference` si se proporciona.
3. Llamar a `preference.create()` con un `idempotencyKey` generado (ej. hash de los datos de la preferencia) para evitar duplicados en reintentos de Vercel.
4. Retornar respuesta con `id` e `init_point`.

**Response:**
```typescript
interface CreatePreferenceResponse {
  id: string;          // ID de la preferencia
  init_point: string;  // URL para redirigir al checkout
  sandbox_init_point?: string;
}
```

**Código de ejemplo (esqueleto):**
```typescript
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: import.meta.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

export const POST: APIRoute = async ({ request }) => {
  // Validar y parsear body
  // Crear preferencia
  // Retornar JSON
};
```

### Endpoint de Webhooks
**Ruta:** `POST /api/webhooks`

**Responsabilidad:** Procesar notificaciones de `payment` y `merchant_order`.

**Parámetros de consulta:** Mercado Pago envía `topic` y `id`.
- `topic`: `'payment'` o `'merchant_order'`.
- `id`: ID del recurso.

**Proceso:**
1. Validar que la solicitud provenga de Mercado Pago (opcional, con firma).
2. Según el `topic`, obtener los detalles correspondientes usando el SDK.
   - Para `payment`: llamar a `payment.get({ id })` para obtener el estado actual.
   - Para `merchant_order`: llamar a `merchantOrder.get({ id })`.
3. **Validar el estado** antes de actualizar la base de datos (ej. verificar que el pago esté `approved` o `authorized`).
4. Actualizar el estado de la orden en la base de datos (si existe) solo si la validación es exitosa.
5. Retornar `200 OK` para confirmar recepción.

**Nota:** La lógica de negocio (qué hacer con el pago confirmado) dependerá del sistema interno. Por ahora se registrará en logs.

### Integración Frontend (Ejemplo)
En una página de evento, agregar un botón "Reservar ahora" que:

1. Recoge los datos del evento (ID, precio actual, cantidad).
2. Envía `POST` a `/api/create-preference` con los items y el email del usuario (capturado mediante un formulario).
3. Recibe la respuesta y redirige a `init_point`.

**Código de ejemplo (React/TSX):**
```tsx
const handleCheckout = async () => {
  const res = await fetch('/api/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: eventId, quantity: 1, unit_price: currentPrice }],
      payer_email: userEmail
    })
  });
  const data = await res.json();
  window.location.href = data.init_point;
};
```

### Estrategia de Pruebas
1. **Local:** Usar token de sandbox y simular pagos con tarjetas de prueba.
2. **Validación de flujo:** Verificar que la preferencia se crea y se redirige correctamente.
3. **Webhooks:** Usar herramientas como `ngrok` para exponer localmente y configurar la URL de notificaciones en el panel de Mercado Pago.
4. **Variables de entorno:** Asegurar que `MP_ACCESS_TOKEN` esté disponible en Vercel.

### Checklist de Despliegue en Vercel
- [ ] Agregar variables de entorno `MP_ACCESS_TOKEN` y `PUBLIC_MP_PUBLIC_KEY` en el dashboard de Vercel.
- [ ] Configurar las **back URLs** en el panel de Mercado Pago (opcional, ya que se generan dinámicamente).
- [ ] Configurar **Webhooks** en el panel de Mercado Pago apuntando a `https://tu-dominio.vercel.app/api/webhooks`.
- [ ] Verificar que el entorno de producción use el token de producción (no sandbox).
- [ ] Realizar una prueba de extremo a extremo con un pago de prueba.

## Próximos Pasos
1. Aprobación de este plan.
2. Cambio a modo **💻 Code** para implementar los endpoints y ajustes de entorno.
3. Implementación de la integración frontend en una página de ejemplo (evento).
4. Pruebas locales.
5. Despliegue en Vercel y configuración final.