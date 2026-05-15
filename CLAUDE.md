# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (port 3000, exposed on network)
npm run build            # Production build
npm run preview          # Preview production build locally
npm run lint             # Type-check with tsc --noEmit
npm run clean            # Remove dist/
```

## Architecture

Astro 6 site for Varsana Eco Yoga Aldea — a spiritual retreat center. **SSR mode** (`output: 'server'`), deployed to Vercel via `@astrojs/vercel`.

### Content Collections (file-based Markdown CMS)

Three collections defined in [src/content.config.ts](src/content.config.ts), loaded via `astro:content` glob loader:

- **`src/content/events/`** — dated retreats/workshops with `event_start`, `event_end`, `stock_max`, and tiered `prices` with deadlines
- **`src/content/pasadias/`** — evergreen services (no dates, no stock limits) with `category`, `duration`, `meeting_point`
- **`src/content/nosotros/`** — team members with social links

`id` must match the filename slug. Schema uses Zod with a shared `titleSchema` that enforces sentence case and no-emoji via `.refine()`.

### Payment Flow (Bold)

`BoldPaymentButton.tsx` (React island) → `POST /api/checkout` → Bold payment gateway → redirect back with `bold-order-id` & `bold-tx-status` query params → `GET /pago/exito` → client-side `POST /api/verify-payment` (fallback).

Server-side: checkout validates tickets against Markdown prices (source of truth), computes integrity signature with `BOLD_SECRET_KEY`, reserves stock atomically via `decrement_stock` RPC.

### Webhook Handling

`POST /api/webhook/bold` receives Bold CloudEvents (`type: SALE_APPROVED | SALE_REJECTED | VOID_APPROVED | VOID_REJECTED`). Maps `data.metadata.reference` → our `orderId`. Verifies HMAC-SHA256 signature from `x-bold-signature` header. On approval: marks order `paid`. On decline: releases stock via `release_stock` RPC and marks `failed`. Has idempotency guards.

### Database Layer

Supabase with two client tiers:
- **Public** (`src/lib/supabase.ts` default export) — uses `PUBLIC_SUPABASE_ANON_KEY`, RLS-enforced
- **Admin** (`getAdminClient()`) — uses `SUPABASE_SERVICE_ROLE_KEY`, server-only, bypasses RLS

`src/lib/db.ts` wraps inventory operations: `getAvailableStock()`, `reserveStock()` (atomic RPC), `releaseStock()`. Stock is managed in an `inventory` table with `stock_max` and `stock_reserved`. Orders go to `orders` table.

### Required Environment Variables

```
BOLD_API_KEY            # Bold public key
BOLD_SECRET_KEY         # Bold secret key (used for HMAC signing & verification)
PUBLIC_SUPABASE_URL     # Supabase project URL
PUBLIC_SUPABASE_ANON_KEY # Supabase anon key (client-safe)
SUPABASE_SERVICE_ROLE_KEY # Supabase service role (server-only, bypasses RLS)
PUBLIC_SITE_URL         # Canonical site URL (e.g. https://varsana.co)
```

### Design System

Tailwind v4 with custom theme tokens in [src/styles/global.css](src/styles/global.css):
- `--color-rausch` (#52185B) — primary CTA
- `--color-saffron` (#F7941E) — spiritual accent
- `--color-forest` (#779B05) — nature accent
- `--color-sacred-sand` (#FAF9F6) — page background
- `--font-display` / `--font-sans` — Proza Libre / Inter
- `--shadow-airbnb` — card elevation

### Key Patterns

- **Alias**: `@/` maps to project root (e.g. `@/src/components/Header.astro`)
- **Astro components** (`.astro`) handle static/SSR rendering; **React components** (`.tsx`) are client islands for interactivity (e.g. payment button)
- **Content formatting**: follow the guidelines in the repo's `.roo/event-content-formatting.md` for Markdown events — HTML tables with Tailwind classes, consistent frontmatter
- **API routes** must set `export const prerender = false` (SSR-only)
- **`getEntry()` / `getCollection()`** from `astro:content` are used to read Markdown content — these are the source of truth for prices and metadata
