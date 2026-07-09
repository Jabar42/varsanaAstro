# CLAUDE.md

Guía para Claude Code en el repositorio varsanaAstro.

## Commands

```bash
npm install              # Instalar dependencias
npm run dev              # Dev server (port 3000)
npm run build            # Build producción
npm run deploy           # Build + deploy a Cloudflare Workers
npm run lint             # Type-check con tsc --noEmit
```

## Arquitectura

Astro 6 en **modo SSR** (`output: 'server'`), desplegado en **Cloudflare Workers** via `@astrojs/cloudflare`. Worker name: `varsana-co`.

**Ramas activas:**
- `main` — producción (Cloudflare Workers)
- `test/hermes-widget` — integración del widget de chat con Hermes Agent vía `@tp3/chat-widget`

### Workers del ecosistema varsana

| Worker | URL | Backend | Función |
|--------|-----|---------|---------|
| `varsana-co` | `varsana-co.iaforchange.workers.dev` | Este repo | Sitio Astro SSR + API + D1 + R2 |
| `varsana-chat` | `varsana-chat.iaforchange.workers.dev` | Hermes Agent (perfil `varsana-servicio-al-cliente`) | Agente IA (Ananda) — responde consultas de clientes |

### Content Collections

Tres colecciones en `src/content/` (Zod + Markdoc):
- **`events/`** — retiros con `event_start`, `stock_max`, `prices` con deadlines
- **`pasadias/`** — experiencias de un día con `duration`, `category`, `meeting_point`
- **`nosotros/`** — equipo con `role`, social links

### API Endpoints

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/checkout` | POST | Crea orden Bold + reserva stock en D1 |
| `/api/webhook/bold` | POST | Recibe webhooks de Bold (HMAC-SHA256) |
| `/api/verify-payment` | POST | Verifica pago via redirect de Bold |
| `/api/order-status` | GET | Consulta estado de orden en D1 |
| `/api/events` | GET | Lista eventos futuros (usado por el agente) |
| `/api/pasadias` | GET | Lista pasadías (usado por el agente) |
| `/api/images/[...key]` | GET/POST | Subida y servicio de imágenes desde R2 |

### Database (D1)

**D1** (`varsana-db`) con binding `DB`. Tablas: `inventory` (stock_max, stock_reserved) y `orders` (bold_order_id, status, ticket_details).

El acceso se hace via `import { env } from "cloudflare:workers"` → `env.DB` (D1Database). El wrapper está en `src/lib/d1.ts`. Las operaciones de inventario atómico en `src/lib/db-d1.ts`.

### R2 (Imágenes)

Bucket `varsana-images` con binding `VARSANA_IMAGES`. La API `/api/images/[...key]` maneja subida y servicio.

### Widget de Chat

El sitio usa `@tp3/chat-widget` (v0.2.0, npm) conectado al plugin `hermes-webchat` del perfil Hermes `varsana-servicio-al-cliente`. Integrado en la rama `test/hermes-widget`.

### Variables de entorno

```bash
BOLD_API_KEY            # Bold public key (secret)
BOLD_SECRET_KEY         # Bold secret key (secret, para HMAC)
PUBLIC_SITE_URL         # URL canónica (varsana.co)
RESEND_API_KEY          # Resend para emails transaccionales (secret)
RESEND_FROM_EMAIL       # Email remitente
TELEGRAM_BOT_TOKEN      # Notificaciones admin (secret)
TELEGRAM_CHAT_ID        # Chat destino Telegram (secret)
PUBLIC_DONATION_URL     # URL de donación (var en wrangler.jsonc)
```

### Design System

Tailwind v4 con tokens en `src/styles/design-tokens.css`:
- `--color-rausch` (#52185B) — primary CTA
- `--color-saffron` (#F7941E) — accent
- `--color-forest` (#779B05) — nature
- `--color-sacred-sand` (#FAF9F6) — background
- `--font-display` / `--font-sans` — Proza Libre / Inter

### Tool-calling del agente

El agente Ananda (perfil Hermes `varsana-servicio-al-cliente`) consulta los endpoints `/api/events` y `/api/pasadias` via tool-calling para dar datos reales a los usuarios del chat.

### Agregar un evento nuevo

1. Crear `src/content/events/<slug>.mdoc` con frontmatter y contenido markdown
2. `npm run build && npx wrangler deploy`
3. El agente lo detecta automáticamente en la próxima consulta
