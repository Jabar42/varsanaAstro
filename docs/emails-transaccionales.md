# Correos transaccionales y notificaciones Telegram

## Arquitectura

Cuando un pago es aprobado por Bold, el sistema dispara dos notificaciones:

```
Pago aprobado (webhook o verify-payment)
  │
  ├─ 1. Telegram → admin (nueva venta)
  │     Formato: resumen con cliente, evento, fecha, total, orden
  │
  └─ 2. Email → cliente (confirmacion de reserva)
        Plantilla React Email con marca Varsana
        │
        └─ Si falla → Telegram → admin (alerta de fallo)
```

Ambos canales usan `await Promise.allSettled` antes del `return` del webhook para garantizar ejecucion completa en el entorno serverless de Vercel.

## Archivos

| Archivo | Proposito |
|---------|-----------|
| `src/lib/email.ts` | Cliente Resend, `normalizeTickets`, `sendOrderConfirmationEmail` |
| `src/lib/telegram.ts` | `sendTelegramMessage`, `buildSaleMessage`, `buildEmailErrorMessage` |
| `src/emails/OrderConfirmationEmail.tsx` | Plantilla React Email con Tailwind |
| `src/pages/api/webhook/bold.ts` | Punto principal: resuelve titulo, dispara Telegram + email |
| `src/pages/api/verify-payment.ts` | Fallback: mismo patron que el webhook |

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
3. Busca la orden en Supabase por `bold_order_id`
4. Verifica idempotencia: si ya esta `paid`, retorna 200 y termina
5. Actualiza la orden a `status = 'paid'`
6. Resuelve el titulo del contenido desde Markdown via `getEntry('events' | 'pasadias', contentId)`
7. Envia notificacion Telegram al admin: `sendTelegramMessage(buildSaleMessage(...))`
8. Envia email al cliente: `sendOrderConfirmationEmail(orderData)`
9. Si el email falla, envia alerta Telegram: `sendTelegramMessage(buildEmailErrorMessage(...))`
10. Retorna 200 a Bold

### Verify-payment (`POST /api/verify-payment`)

Mismo flujo que el webhook (pasos 6-9), llamado desde la pagina de exito (`/pago/exito`) como fallback si el webhook aun no ha llegado. La idempotencia de Resend (`idempotencyKey`) previene emails duplicados si ambos caminos se ejecutan.

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

Para enviar correos a destinatarios reales, el dominio `varsana.co` debe estar verificado en [resend.com/domains](https://resend.com/domains). Esto requiere agregar registros DNS (MX, TXT, DKIM).

**Durante desarrollo**, usar el sandbox de Resend:

- `from`: `'Varsana <onboarding@resend.dev>'`
- Solo entrega al email del owner de la cuenta Resend
- No requiere dominio verificado

**En produccion**:

- `from`: `'Varsana Eco Yoga Aldea <reservas@varsana.co>'`
- Requiere dominio `varsana.co` verificado en Resend

## Idempotencia

Proteccion contra emails duplicados en dos niveles:

1. **Aplicacion**: El webhook verifica `existingOrder.status === 'paid'` antes de procesar — si ya se proceso, retorna 200 sin enviar emails
2. **Resend**: `idempotencyKey: 'order-confirmation/<boldOrderId>'` — si el mismo key se usa dos veces con el mismo payload, Resend devuelve la respuesta original sin reenviar

Esto cubre el caso donde webhook y verify-payment intentan procesar la misma orden.

## Manejo de errores

| Punto de fallo | Comportamiento |
|----------------|---------------|
| `getEntry()` falla (contenido eliminado) | Usa `content_id` con guiones reemplazados como titulo |
| `render()` falla (bug en plantilla) | Lanza error, capturado por `Promise.allSettled`, alerta Telegram |
| `ticket_details` es null o malformado | `normalizeTickets` aplica fallback: `[{ label: 'Reserva', amount, quantity: 1 }]` |
| `resend.emails.send()` falla | Lanza error → `Promise.allSettled` lo captura → alerta Telegram |
| `TELEGRAM_BOT_TOKEN` no definido | `sendTelegramMessage` retorna sin hacer nada |
| `fetch` a Telegram falla | Error loggeado, nunca lanza |

En todos los casos, el webhook retorna 200 a Bold. Las notificaciones nunca bloquean la respuesta del webhook.

## Probar en desarrollo

1. **Previsualizar plantilla**: `npm run email:dev` → `http://localhost:3001`
2. **Probar envio sandbox**:
   - Cambiar `from` a `'Varsana <onboarding@resend.dev>'` en `src/lib/email.ts`
   - El destino debe ser el email del owner de la cuenta Resend
   - Hacer una compra de prueba con Bold en modo test
   - Verificar que el webhook recibe `SALE_APPROVED` y el email llega
3. **Probar sin Telegram**: comentar `TELEGRAM_BOT_TOKEN` en `.env`, verificar que el email se envia y Telegram simplemente se omite
4. **Probar fallo de email**: usar un `from` invalido, verificar que llega `⚠️ Email de confirmacion fallo` por Telegram
5. **Restaurar `from`** a `'Varsana Eco Yoga Aldea <reservas@varsana.co>'` antes de deploy a produccion
