# Bold: pagos, credenciales y ambientes

## Contrato vigente

Varsana usa **Botón de pagos personalizado (Embedded Checkout)**, no API Datáfono ni API Pagos en Línea. Runtime: Astro SSR en Cloudflare Workers; órdenes e inventario en D1 (`varsana-db`). URL canónica: `https://varsana-co.iaforchange.workers.dev`.

1. `POST /api/checkout` calcula el importe desde contenido, exige ambas llaves antes de reservar cupos, crea una referencia opaca (`event-<UUID>` / `pasadia-<UUID>`, menos de 60 caracteres), y crea reserva + orden `pending` en un único batch transaccional D1. Sin cupos no crea orden; un fallo de INSERT revierte también la reserva.
2. El servidor firma `SHA256(orderId + amount + currency + BOLD_SECRET_KEY)`; el navegador recibe la firma y la llave de identidad pública, nunca la secreta.
3. `BoldPaymentButton.tsx` abre `https://checkout.bold.co/library/boldPaymentButton.js` con `new BoldCheckout(...)` y `renderMode: embedded`.
4. **Sólo el webhook autenticado confirma o rechaza el pago.** Valida firma, referencia, importe y moneda contra D1 antes de efectuar una transición. Un parámetro de URL o un JSON enviado desde el navegador no es evidencia de pago.
5. `POST /api/verify-payment` se conserva por compatibilidad como consulta de sólo lectura (`{boldOrderId}`); ignora `boldTxStatus`, no modifica órdenes/cupos ni envía notificaciones. `GET /api/order-status?bold-order-id=...` también es sólo lectura. Ambas respuestas evitan caché.
6. `/pago/exito` muestra el estado almacenado en D1 y consulta hasta diez minutos si sigue pendiente. El componente de pago también consulta D1 antes de mostrar éxito o ejecutar `onSuccess`.

## Variables

- `BOLD_API_KEY`: **llave de identidad de Botón de pagos**. Es pública, aunque se almacena como secret en Cloudflare.
- `BOLD_SECRET_KEY`: llave secreta del mismo comercio/producto/ambiente. Sólo backend. Se necesita también en pruebas para el hash del checkout.
- `BOLD_ENVIRONMENT`: `production` o `test`, exactamente. Ausente equivale a `production`; un valor diferente falla de forma cerrada. El despliegue canónico declara `production` en `wrangler.jsonc`.
- `ENVIRONMENT=staging` **no determina el ambiente de Bold**. No deducirlo del nombre del Worker, del prefijo de una llave ni de parámetros del cliente.
- **No existe una tercera `BOLD_WEBHOOK_SECRET`** en este contrato.

### Producción

El webhook verifica `x-bold-signature` hexadecimal mediante `HMAC-SHA256(Base64(cuerpo UTF-8 original), BOLD_SECRET_KEY)` con comparación de tiempo constante. Si falta la llave, no se acepta ninguna notificación. No registrar cuerpos completos, firmas ni llaves en logs.

### Pruebas

Únicamente con `BOLD_ENVIRONMENT=test`, el HMAC del webhook utiliza la **clave vacía documentada por Bold**. Esto NO significa dejar vacía `BOLD_SECRET_KEY`: el checkout sigue requiriendo la llave secreta de pruebas.

La firma de pruebas no autentica pagos reales: ejecutar este modo sólo en un Worker separado con base D1 y notificaciones aisladas. **Nunca cambiar el Worker canónico a test para probar.** Bold no manda automáticamente los webhooks simulados: después de una compra simulada se usa **Probar el webhook** en el comprobante. Las referencias de pruebas de la API expiran a las 12 horas.

## Cambio de cuenta o rotación de llaves

1. En la cuenta del comercio correcto: Integraciones → Llaves de integración → **Botón de pagos**. Confirmar ambiente y habilitación de las llaves. Resolver cualquier activación/certificación que indique el panel; no confundir requisitos de API Pagos en Línea con este botón.
2. Cambiar **el par de llaves junto**, de forma segura en Cloudflare; nunca pegarlas en Telegram, comandos con valores, logs o git. Usar el panel o carga en lote desde archivo privado fuera del repo. La actualización de secretos no sustituye el pipeline del código.
3. En esa misma cuenta: Integraciones → Webhooks → registrar `https://varsana-co.iaforchange.workers.dev/api/webhook/bold`.
4. Validar en un ambiente separado: aprobado, rechazado, duplicados, monto/moneda incorrectos, firma incorrecta y retorno a la tienda sin confirmación falsa. En producción, verificar el flujo real con autorización del titular; una prueba local o un HTTP 200 no certifica la cuenta.
5. Consultar la orden y el webhook real antes de afirmar que la nueva cuenta cobra correctamente. No invalidar las llaves anteriores hasta prever las notificaciones de pagos en curso: una rotación puede hacer que sus firmas dejen de validarse.

## Integridad e idempotencia

- Tarifas por volumen: el servidor ignora importes del cliente y agrupa cantidades antes de aplicar `min_quantity`. Con una única etiqueta base, las escalas superiores (p. ej. General/Pareja de temazcal) son alias de volumen; varias etiquetas base conservan categorías independientes (Adulto/Niño o Preventa/General/Pareja del retiro). Cantidades, mínimos, precios y totales deben ser enteros seguros positivos.

- Correlacionar con `data.metadata.reference`; `subject` identifica el pago en Bold y no debe usarse como referencia de una reserva.
- Importe numérico finito y moneda deben coincidir exactamente con la orden. Una discrepancia no autoriza escrituras ni avisos de venta.
- Aplicar cambios de estado condicionales en D1, no una secuencia insegura de leer y luego actualizar sin condición.
- Un duplicado no debe reenviar confirmaciones ni liberar cupos por segunda vez. Una orden pagada no se degrada por un rechazo tardío.
- Un aprobado posterior a una orden ya rechazada requiere revisión: sus cupos pudieron liberarse y venderse a otra persona. No confirmar automáticamente sin una política de recuperación de inventario.
- Los eventos de anulación no implementan automáticamente reembolsos de reservas; revisar manualmente. La entrega duradera/reintentable de notificaciones no es una garantía de este flujo: verificar logs si una confirmación no llega.

## Notificaciones runtime

Email y Telegram leen `cloudflare:workers.env` por llamada, no `import.meta.env` de compilación. Email exige `RESEND_API_KEY` y `RESEND_FROM_EMAIL` válidos, sin fallback a remitente de sandbox. Telegram conserva no-op sin configuración y no propaga fallos. Ambos tienen tiempo de espera acotado (email 10 s, Telegram 5 s), aborto y logs genéricos sin tokens ni datos de proveedor; los datos dinámicos de mensajes HTML se escapan. La clave de idempotencia de Resend se mantiene por orden. El timeout no demuestra que el proveedor no haya aceptado ya un envío.

## Archivos y comprobaciones

- `src/pages/api/checkout.ts`
- `src/pages/api/webhook/bold.ts`
- `src/pages/api/verify-payment.ts` y `order-status.ts`
- `src/components/BoldPaymentButton.tsx`
- `src/pages/pago/exito.astro`
- Pruebas: `scripts/test-bold*.ts`; ejecutar el comando `npm run test:bold` del repo.
- Ejecutar además `npm run lint`, `npm run build` y `git diff --check`.

**Publicación de código exclusivamente por commit y push a `main`**. Cloudflare Git Integration realiza el despliegue; verificar después el Worker canónico. Nunca `npm run deploy` ni `wrangler deploy` manual.

## Fuentes oficiales

- [Llaves](https://developers.bold.co/pagos-en-linea/llaves-de-integracion)
- [Botón personalizado](https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual/integracion-personalizada)
- [Webhook](https://developers.bold.co/webhook)
- [Pruebas](https://developers.bold.co/pagos-en-linea/boton-de-pagos/ambiente-pruebas)

Los planes y la transcripción `docs/bold-api-docs.md` son históricos; no prevalecen sobre este contrato ni sobre el código probado.
