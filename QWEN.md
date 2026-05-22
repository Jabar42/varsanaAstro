# QWEN.md — Varsana Eco-Wellness (Astro)

## Project Overview

**Varsana Eco Yoga Aldea** — a spiritual retreat center website built with **Astro 6** (SSR mode), deployed to **Vercel** via `@astrojs/vercel`. The site manages events, pasadías (day-pass services), and team members through file-based Markdown content collections, with a **Bold** payment gateway integration and **Supabase** database for inventory/orders.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6 (SSR, `output: 'server'`) |
| UI Islands | React 19 (`.tsx` components via `@astrojs/react`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Fonts | Proza Libre (local woff2, headings) + Inter (Google Fonts, body/UI) |
| Icons | lucide-react |
| Animations | Motion (motion.dev) |
| Database | Supabase (Postgres with RLS) |
| Payments | Bold gateway (Colombia) |
| Hosting | Vercel (`@astrojs/vercel` adapter) |
| Language | TypeScript (strict mode) |

## Building and Running

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (port 3000, exposed on network)
npm run build            # Production build
npm run preview          # Preview production build locally
npm run lint             # Type-check with tsc --noEmit
npm run clean            # Remove dist/
```

### Required Environment Variables

Defined in `.env.example`:

| Variable | Purpose |
|---|---|
| `BOLD_API_KEY` | Bold public API key |
| `BOLD_SECRET_KEY` | Bold secret key (HMAC signing & verification) |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe, RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only, bypasses RLS) |
| `PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://varsana.co`) |

## Architecture

### Directory Structure

```
src/
├── components/      # Astro (.astro) + React (.tsx) components
├── content/         # Markdown content collections
│   ├── events/      # Dated retreats/workshops
│   ├── pasadias/    # Evergreen day-pass services
│   └── nosotros/    # Team members
├── layouts/         # Page layout wrappers
├── lib/             # Server-side logic (Supabase, DB, helpers)
├── pages/           # File-based routing
│   ├── api/         # API endpoints (SSR-only, `prerender = false`)
│   ├── events/      # Event listing + detail pages
│   ├── pasadias/    # Pasadía listing + detail pages
│   ├── pago/        # Payment success/failure pages
│   └── index.astro  # Homepage
├── styles/          # Global CSS, design tokens, Tailwind imports
└── content.config.ts # Content collection schemas (Zod)
```

### Content Collections

Three collections defined in `src/content.config.ts`, loaded via `astro:content` glob loader:

- **events** — Dated retreats/workshops with `event_start`, `event_end`, `stock_max`, and tiered `prices` with deadlines
- **pasadias** — Evergreen services (no dates) with `category`, `duration`, `meeting_point`, and `included_services`
- **nosotros** — Team members with social links, order, and active status

All titles are validated for sentence case and no-emoji via Zod `.refine()`. The `id` field must match the filename slug.

### Payment Flow (Bold)

1. `BoldPaymentButton.tsx` (React island) → `POST /api/checkout`
2. Server validates tickets against Markdown prices (source of truth), computes integrity signature with `BOLD_SECRET_KEY`, reserves stock atomically via `decrement_stock` RPC
3. Bold payment gateway handles payment → redirect back with `bold-order-id` & `bold-tx-status` query params
4. `GET /pago/exito` → client-side `POST /api/verify-payment` (fallback verification)

### Webhook Handling

`POST /api/webhook/bold` receives Bold CloudEvents (`SALE_APPROVED`, `SALE_REJECTED`, `VOID_APPROVED`, `VOID_REJECTED`). Verifies HMAC-SHA256 from `x-bold-signature` header. On approval: marks order `paid`. On decline: releases stock via `release_stock` RPC. Has idempotency guards.

### Database Layer (Supabase)

Two client tiers in `src/lib/supabase.ts`:
- **Public** (default export) — uses `PUBLIC_SUPABASE_ANON_KEY`, RLS-enforced
- **Admin** (`getAdminClient()`) — uses `SUPABASE_SERVICE_ROLE_KEY`, server-only, bypasses RLS

`src/lib/db.ts` wraps inventory operations: `getAvailableStock()`, `reserveStock()` (atomic RPC), `releaseStock()`. Stock managed in `inventory` table with `stock_max` and `stock_reserved`. Orders in `orders` table.

## Design System

**Source of truth:** `.agents/design-guidelines/SKILL.md` and `DESIGN.md`

### Brand Colors (Tailwind tokens)

| Token | Hex | Usage |
|---|---|---|
| `rausch` | `#52185B` | Primary CTA, brand accent |
| `rausch-light` | `#97448E` | Hover states, gradients |
| `saffron` | `#F7941E` | Spiritual accent, highlights, tags |
| `saffron-light` | `#FAAF3E` | Saffron hover/glow |
| `forest` | `#779B05` | Nature accent, volunteering |
| `forest-light` | `#95AD02` | Forest hover |
| `sacred-sand` | `#FAF9F6` | Page background |
| `near-black` | `#222222` | Primary text |
| `secondary-gray` | `#6A6A6A` | Metadata, descriptions |
| `light-surface` | `#F7F7F7` | Alternating section backgrounds |

### Typography

- **Headings (H1–H6):** Proza Libre (`font-display`) — never use for body copy
- **Body/UI:** Inter (`font-sans`) — never use for headings
- Sentence case only, no ALL-CAPS

### Component Rules

- **Cards:** `rounded-2xl` to `rounded-3xl` (24–32px), Lotus White bg, `shadow-airbnb`, lift + saffron glow on hover, 0.6s ease-in-out transitions
- **Buttons:** `rounded-2xl` (16px), bold Inter 600, Rausch primary / Forest or Saffron secondary / Ghost with border
- **Icons:** Lucide-react only, prefer organic shapes (`Leaf`, `Flower2`, `Sun`, `Moon`, `Heart`)
- **Shadow:** `shadow-airbnb` = `0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.1)`

### Layout Principles

- Favor **asymmetry** over rigid grids
- 8px base spacing unit; section spacing inflated ~20% above standard
- Transitions: **0.6–0.8s ease-in-out** (slow, graceful)
- Touch targets: **≥ 44px** on mobile
- Content max-width: 1280px centered

## Development Conventions

### Key Patterns

- **Path alias:** `@/` maps to project root (e.g. `@/src/components/Header.astro`)
- **Astro components** (`.astro`) handle static/SSR rendering
- **React components** (`.tsx`) are client islands for interactivity (e.g. payment button)
- **API routes** must set `export const prerender = false` (SSR-only)
- **Content access:** Use `getEntry()` / `getCollection()` from `astro:content` — Markdown is the source of truth for prices and metadata

### Content Formatting

**Source of truth:** `.agents/event-content-formatting/SKILL.md`

- Headings: `h2` → `mt-10 mb-5`, `h3` → `mt-8 mb-4`, no skipping levels
- Structured data → HTML tables with Tailwind classes
- Spacing: paragraphs `mb-5`, blockquotes/images `my-8`
- Images: `rounded-3xl shadow-airbnb`
- Active voice, inclusive tone, sentence case

### Agent Skills (`.agents/`)

| Skill | Use when |
|---|---|
| `design-guidelines` | UI changes, styling, component design |
| `event-content-formatting` | Editing event/pasadia markdown |
| `publish-new-event` | Adding a new event |
| `publish-new-pasadia` | Adding a new pasadía |
| `publish-new-member` | Adding a team member |
| `create-content-collection-schema` | Adding a new content type |
| `payment-integration-bold` | Debugging checkout, payments, webhooks |
| `vercel-integration` | Deploying, env vars, logs, domains |
| `upload-image` | Uploading/optimizing images to Supabase bucket |

### Do's and Don'ts

**Do:**
- Use `sacred-sand` as default page background
- Pair Proza Libre headings with Inter body text
- Apply `shadow-airbnb` to all elevated cards
- Maintain 8px spacing rhythm
- Use slow 0.6–0.8s transitions

**Don't:**
- Use pure black (`#000`) — `near-black` (`#222222`) is the darkest allowed
- Use Rausch for large background areas — reserve for CTAs
- Mix more than two brand colors in a single view
- Use border-radius below 16px for buttons
- Use fast transitions (under 0.3s)
- Center-align every layout — asymmetry is intentional
- Use ALL CAPS for headings
