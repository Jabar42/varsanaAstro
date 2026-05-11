# Email para Soporte Técnico de Bold

---

**Asunto:** Problema con Webhook — No se reciben notificaciones POST en nuestra URL configurada

**Para:** soporte@bold.co

---

Estimado equipo de Bold,

Estamos integrando el Botón de Pagos Bold en nuestro sitio web Varsana (varsana-astro.vercel.app) y hemos implementado el flujo completo de checkout con monto definido, incluyendo la generación de hash de integridad desde el servidor.

Nuestro flujo actual funciona de la siguiente manera:

1. El usuario selecciona tiquetes en nuestro sitio y hace clic en "Pagar"
2. Nuestro backend (`POST /api/checkout`) crea la orden en nuestra base de datos con estado `pending`, genera el integrity signature, y retorna los datos necesarios (`orderId`, `amount`, `currency`, `integritySignature`, `apiKey`)
3. El botón de Bold se renderiza con los atributos `data-order-id`, `data-amount`, `data-currency`, `data-integrity-signature`, `data-api-key`, y `data-redirection-url` apuntando a nuestra página de éxito
4. El usuario es redirigido a la pasarela de pagos de Bold y completa el pago exitosamente
5. El usuario regresa a nuestra página de éxito con los parámetros `boldOrderId` y `bold-tx-status=approved` en la URL
6. **Problema:** Nunca recibimos la notificación webhook POST en nuestro endpoint

Hemos realizado las siguientes verificaciones técnicas desde nuestro lado:

### 1. Endpoint webhook configurado
Hemos implementado el endpoint `POST /api/webhook/bold` en nuestro servidor (Vercel). Este endpoint:
- Lee el cuerpo crudo de la solicitud y el header `x-bold-signature`
- Verifica la firma HMAC-SHA256 usando `BOLD_SECRET_KEY` (el Base64 del cuerpo como mensaje, comparado con `timingSafeEqual`)
- Actualiza la orden en nuestra base de datos Supabase según el estado (`APPROVED` → `paid`, `DECLINED/FAILED` → `failed` con liberación de stock)
- Retorna `401` si falta la firma, `200` si todo es correcto

### 2. Verificación de reachabilidad
Hemos confirmado que el endpoint es accesible públicamente:
```bash
curl -X POST https://varsana-astro.vercel.app/api/webhook/bold
# Responde: {"error":"Missing signature"} con HTTP 401 (comportamiento correcto)
```

### 3. Logs de funciones en Vercel
Hemos revisado los logs del deployment en producción. **Solo aparecen 2 solicitudes**, ambas de nuestras pruebas con `curl`. **No hay ningún log de Bold.** Esto confirma que Bold nunca ha realizado una solicitud POST a nuestra URL de webhook.

```
TIME         HOST                      LEVEL    STATUS  MESSAGE
17:11:07.74  varsana-astro.vercel.app  warning  401     [webhook:f09b9e2c] Missing x-bold-signature
17:10:16.28  varsana-astro.vercel.app  warning  401     [webhook:f56cec86] Missing x-bold-signature
```

### 4. Variables de entorno
Nuestras llaves de integración están configuradas correctamente en el servidor:
- `BOLD_API_KEY`: sztv4LzZqRGtgYqwW5k-NSvPROoCzEz1bK2PDCdSImo
- `BOLD_SECRET_KEY`: MKiMFTruKtFurHGXhFrAbw

No tenemos `BOLD_WEBHOOK_SECRET` (según su documentación, solo existe una llave secreta).

### Nuestra pregunta:
¿Es necesario configurar la URL del webhook en el panel de administración de Bold (portal.bold.co)? Si es así, ¿en qué sección se configura? En su documentación técnica no encontramos referencias a la configuración de webhooks.

Alternativamente, ¿Bold envía automáticamente notificaciones webhook a todos los comercios o es necesario habilitarlo explícitamente?

Agradecemos su ayuda para identificar por qué no estamos recibiendo las notificaciones.

Quedamos atentos a su respuesta.

Saludos cordiales,

**Jabar**
Varsana
