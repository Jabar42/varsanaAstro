# CLAUDE.md

Guia para Claude Code en el repositorio varsanaAstro.

## Commands

```bash
npm install              # Instalar dependencias
npm run dev              # Dev server (port 3000)
npm run build            # Build produccion
npm run deploy           # Build + deploy a Cloudflare Workers
npm run lint             # Type-check con tsc --noEmit
```

## Arquitectura

Astro 6 en **modo SSR** (`output: 'server'`), desplegado en **Cloudflare Workers** via `@astrojs/cloudflare`. Branch `cf-migration` (staging), `main` (produccion Vercel — a migrar).

### Workers del ecosistema varsana

| Worker | URL | Repo | Funcion |
|--------|-----|------|---------|
| `varsana-co` | `varsana-co.iaforchange.workers.dev` | varsanaAstro | Sitio Astro SSR + API + D1 + R2 |
| `varsana-chat` | `varsana-chat.iaforchange.workers.dev` | agente-core-tp3 | Agente IA (Ananda) con tool-calling |
| `varsana-mcp` | `varsana-mcp.iaforchange.workers.dev` | agente-core-tp3 | MCP server (experimental) |

### Content Collections

Tres colecciones en `src/content/` (Zod + Markdoc):
- **`events/`** — retiros con `event_start`, `stock_max`, `prices` con deadlines
- **`pasadias/`** — experiencias de un dia con `duration`, `category`, `meeting_point`
- **`nosotros/`** — equipo con `role`, social links

### API Endpoints

| Endpoint | Metodo | Funcion |
|----------|--------|---------|
| `/api/checkout` | POST | Crea orden Bold + reserva stock en D1 |
| `/api/webhook/bold` | POST | Recibe webhooks de Bold (HMAC-SHA256) |
| `/api/verify-payment` | POST | Verifica pago via redirect de Bold |
| `/api/order-status` | GET | Consulta estado de orden en D1 |
| `/api/events` | GET | Lista eventos futuros (usado por el agente) |
| `/api/pasadias` | GET | Lista pasadias (usado por el agente) |
| `/api/images/[...key]` | GET/POST | Subida y servicio de imagenes desde R2 |

### Database (D1)

**D1** (`varsana-db`) con binding `DB`. Tablas: `inventory` (stock_max, stock_reserved) y `orders` (bold_order_id, status, ticket_details).

El acceso se hace via `import { env } from "cloudflare:workers"` → `env.DB` (D1Database). El wrapper esta en `src/lib/d1.ts`. Las operaciones de inventario atomico en `src/lib/db-d1.ts`.

### R2 (Imagenes)

Bucket `varsana-images` con binding `VARSANA_IMAGES`. La API `/api/images/[...key]` maneja subida y servicio.

### Variables de entorno

```bash
BOLD_API_KEY            # Bold public key (secret)
BOLD_SECRET_KEY         # Bold secret key (secret, para HMAC)
PUBLIC_SITE_URL         # URL canonica (varsana.co)
RESEND_API_KEY          # Resend para emails transaccionales (secret)
RESEND_FROM_EMAIL       # Email remitente
TELEGRAM_BOT_TOKEN      # Notificaciones admin (secret)
TELEGRAM_CHAT_ID        # Chat destino Telegram (secret)
PUBLIC_DONATION_URL     # URL de donacion (var en wrangler.jsonc)
```

### Design System

Tailwind v4 con tokens en `src/styles/design-tokens.css`:
- `--color-rausch` (#52185B) — primary CTA
- `--color-saffron` (#F7941E) — accent
- `--color-forest` (#779B05) — nature
- `--color-sacred-sand` (#FAF9F6) — background
- `--font-display` / `--font-sans` — Proza Libre / Inter

### Tool-calling del agente

El agente `varsana-chat` (Ananda) consulta los endpoints `/api/events` y `/api/pasadias` via tool-calling para dar datos reales a los usuarios del chat. Las tools se definen en `agente-core-tp3/packages/agent/src/prompts/varsana/`.

### Agregar un evento nuevo

1. Crear `src/content/events/<slug>.mdoc` con frontmatter y contenido markdown
2. `npm run build && npx wrangler deploy`
3. El agente lo detecta automaticamente en la proxima consulta
