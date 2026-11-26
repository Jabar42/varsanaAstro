# Correos transaccionales y notificaciones Telegram

## Arquitectura

Cuando un pago es aprobado por Bold, el sistema dispara dos notificaciones:

```
Pago aprobado (sólo webhook autenticado y validado contra D1)
  │
  ├─ 1. Telegram → admin (nueva venta)
  │     Formato: resumen con cliente, evento, fecha, total, orden
  │
  └─ 2. Email → cliente (confirmacion de reserva)
        Plantilla React Email con marca Varsana
        │
        └─ Si falla → Telegram → admin (alerta de fallo)
```

La aplicación corre en Cloudflare Workers. Las notificaciones nacen únicamente de una transición de pago autorizada por el webhook; su entrega externa puede fallar y debe revisarse en logs. Ver [el contrato Bold vigente](./bold-payments.md).

Los secretos se leen por llamada de `cloudflare:workers.env`, no de variables de compilación. Email exige clave y remitente runtime, mantiene idempotencia por orden y limita el intento a 10 s; Telegram limita cada intento a 5 s y mantiene el contrato sin excepciones. Los errores son genéricos y no imprimen respuestas del proveedor ni URLs con token. El timeout no garantiza que el proveedor no haya aceptado previamente el mensaje.

## Archivos

| Archivo | Proposito |
|---------|-----------|
| `src/lib/email.ts` | Cliente Resend, `normalizeTickets`, `sendOrderConfirmationEmail` |
| `src/lib/telegram.ts` | `sendTelegramMessage`, `buildSaleMessage`, `buildEmailErrorMessage` |
| `src/emails/OrderConfirmationEmail.tsx` | Plantilla React Email con Tailwind |
| `src/pages/api/webhook/bold.ts` | Punto principal: resuelve titulo, dispara Telegram + email |
| `src/pages/api/verify-payment.ts` | Sólo lectura de estado D1; nunca dispara notificaciones |

## Variables de entorno

```bash
# Resend (envio de emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx       # API key de Resend

# Telegram (notificaciones al admin)
TELEGRAM_BOT_TOKEN="123456:ABC-DEF..." # Token del bot de Telegram
TELEGRAM_CHAT_ID="123456789"           # Chat ID numerico del destino
```

Si `TELEGRAM_BOT_TOKEN` o `TELEGRAM_CHAT_ID` no estan definidas, las notificaciones de Telegram simplemente se omiten sin errores. El email al cliente se sigue enviando normalmente.

## Flujo detallado

### Webhook (`POST /api/webhook/bold`)

1. Bold envia notificacion `SALE_APPROVED` al webhook
2. El webhook verifica la firma HMAC-SHA256
3. Busca la orden en D1 por `data.metadata.reference` (`bold_order_id`)
4. Compara importe/moneda y comprueba la transición permitida
5. Actualiza condicionalmente a `status = 'paid'`; un duplicado no vuelve a notificar
6. Resuelve el titulo del contenido desde Markdown via `getEntry('events' | 'pasadias', contentId)`
7. Envia notificacion Telegram al admin: `sendTelegramMessage(buildSaleMessage(...))`
8. Envia email al cliente: `sendOrderConfirmationEmail(orderData)`
9. Si el email falla, envia alerta Telegram: `sendTelegramMessage(buildEmailErrorMessage(...))`
10. Retorna 200 a Bold

### Verify-payment (`POST /api/verify-payment`)

Consulta de sólo lectura por compatibilidad: recibe `boldOrderId` y devuelve el estado de D1. Ignora cualquier `boldTxStatus` del cliente. No confirma pagos, no libera inventario ni envía correos o avisos. La página de resultados consulta `order-status` mientras espera el webhook.

## Plantilla de email

`OrderConfirmationEmail.tsx` usa React Email con Tailwind (`pixelBasedPreset`). Caracteristicas:

- **Idioma**: Espanol
- **Colores**: Rausch (#52185B), Saffron (#F7941E), Sacred Sand (#FAF9F6)
- **Contenido**: Saludo personalizado, tipo de reserva (Evento/Pasadia), titulo, fecha en espanol, tabla de tickets con cantidades y precios, total en COP, referencia de orden, footer con datos de Varsana
- **Constraints**: Sin flexbox/grid (usa `Section`/`Row`/`Column`), sin media queries, sin SVG/WebP, `Button` con `box-border`, max-width ~600px

### Previsualizar durante desarrollo

```bash
npm run email:dev
```

Abre `http://localhost:3001` y muestra la plantilla con datos de ejemplo (`PreviewProps`).

## Formato de mensajes Telegram

### Nueva venta

```
🌿 Nueva reserva
Cliente: Maria Garcia (maria@email.com)
Evento: Amanecer entre nubes
Fecha: 2026-06-15
Total: $190.000
Orden: event-amanecer-entre-nubes-1717000000000
```

Usa `parse_mode: 'HTML'` — soporta `<b>`, `<code>`, emojis.

### Alerta de fallo de email

```
⚠️ Email de confirmacion fallo
Orden: event-amanecer-entre-nubes-1717000000000
Error: Failed to send email
```

## Configuracion del bot de Telegram

1. Habla con [@BotFather](https://t.me/BotFather) en Telegram
2. Crea un bot con `/newbot` y copia el token
3. Inicia una conversacion con tu bot (enviando cualquier mensaje)
4. Obten el `chat_id` visitando: `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Agrega ambos valores a `.env`

Para grupos: agrega el bot al grupo, envia un mensaje, y usa `getUpdates` para obtener el `chat_id` del grupo (numeros negativos).

## Verificacion de dominio en Resend

Para enviar correos a destinatarios reales, verificar en [resend.com/domains](https://resend.com/domains) el dominio del remitente autorizado configurado en `RESEND_FROM_EMAIL`. No asumir un dominio por el nombre del proyecto; la configuración DNS debe corresponder a un dominio controlado por Varsana.

**Durante desarrollo**, usar el sandbox de Resend:

- `from`: `'Varsana <onboarding@resend.dev>'`
- Solo entrega al email del owner de la cuenta Resend
- No requiere dominio verificado

**En produccion**:

- `from`: valor autorizado de `RESEND_FROM_EMAIL`
- Requiere verificar el dominio de ese remitente en Resend

## Idempotencia

Proteccion contra emails duplicados en dos niveles:

1. **Aplicacion**: sólo quien consigue el UPDATE condicional `pending → paid` en D1 envía las notificaciones. La lectura previa no es la protección contra carreras.
2. **Resend**: `idempotencyKey: 'order-confirmation/<boldOrderId>'` — si el mismo key se usa dos veces con el mismo payload, Resend devuelve la respuesta original sin reenviar

Esto excluye duplicados y entregas concurrentes del webhook. `verify-payment` no participa en los envíos. No hay outbox durable: un crash después del UPDATE puede perder una notificación; no se debe prometer entrega exactamente una vez.

## Manejo de errores

| Punto de fallo | Comportamiento |
|----------------|---------------|
| `getEntry()` falla (contenido eliminado) | Usa `content_id` con guiones reemplazados como titulo |
| `render()` falla (bug en plantilla) | El webhook captura la excepción y trata de enviar una alerta Telegram |
| `ticket_details` es null o malformado | `normalizeTickets` aplica fallback: `[{ label: 'Reserva', amount, quantity: 1 }]` |
| `resend.emails.send()` falla | El webhook captura la excepción y trata de enviar una alerta Telegram |
| `TELEGRAM_BOT_TOKEN` no definido | `sendTelegramMessage` retorna sin hacer nada |
| `fetch` a Telegram falla | Error loggeado, nunca lanza |

Después de una transición válida, el handler espera los intentos de notificación antes de responder; la latencia externa puede demorar la respuesta. Los fallos capturados no revierten un pago confirmado. Fallos de firma, payload, correlación, importe/moneda o persistencia pueden devolver errores HTTP; no siempre responde 200.

## Probar en desarrollo

1. **Previsualizar plantilla**: `npm run email:dev` → `http://localhost:3001`
2. **Probar envio sandbox**:
   - Usar `RESEND_FROM_EMAIL='Varsana <onboarding@resend.dev>'` en el entorno de pruebas aislado
   - El destino debe ser el email del owner de la cuenta Resend
   - Hacer una compra simulada con llaves de pruebas y `BOLD_ENVIRONMENT=test`, sólo con Worker/D1/notificaciones aislados
   - Usar **Probar el webhook** en el comprobante de Bold y verificar `SALE_APPROVED` y entrega del email
3. **Probar sin Telegram**: comentar `TELEGRAM_BOT_TOKEN` en `.env`, verificar que el email se envia y Telegram simplemente se omite
4. **Probar fallo de email**: usar un `from` invalido, verificar que llega `⚠️ Email de confirmacion fallo` por Telegram
5. Mantener el Worker canónico en `BOLD_ENVIRONMENT=production` con remitente y llaves autorizados; no modificar sus secretos para ejecutar pruebas.
