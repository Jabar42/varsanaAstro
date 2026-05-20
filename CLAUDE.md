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

**Source of truth:** [`.agents/design-guidelines/SKILL.md`](.agents/design-guidelines/SKILL.md) — read it before any UI change.

Tailwind v4 with custom theme tokens in [src/styles/global.css](src/styles/global.css):
- `--color-rausch` (#52185B) — primary CTA, brand accent
- `--color-saffron` (#F7941E) — spiritual accent, highlights, tags
- `--color-forest` (#779B05) — nature accent, volunteering
- `--color-sacred-sand` (#FAF9F6) — page background
- `--font-display` / `--font-sans` — Proza Libre (headings) / Inter (body, UI)
- `--shadow-airbnb` — card elevation (`rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px`)

**Component rules** (see [component-stylings.md](.agents/design-guidelines/references/component-stylings.md)):
- Cards: 24–32px border-radius, Lotus White background, subtle lift + saffron glow on hover
- Buttons: 16px border-radius, bold Inter, Rausch Red primary / Forest or Saffron secondary
- Icons: Lucide-react, prefer organic shapes (Leaf, Flower2, Sun, Moon, Heart)

**Layout** (see [layout-principles.md](.agents/design-guidelines/references/layout-principles.md)):
- Favor asymmetry over rigid grids; increase vertical spacing ~20% vs standard layouts
- Transitions: 0.6–0.8s ease-in-out, slow and graceful
- Touch targets: ≥ 44px on mobile

### Content Formatting

**Source of truth:** [`.agents/event-content-formatting/SKILL.md`](.agents/event-content-formatting/SKILL.md) — read it before editing any Markdown content.

- Headings: `h2` → `mt-10 mb-5`, `h3` → `mt-8 mb-4`, no skipping levels
- Structured data → HTML tables with Tailwind classes (see [tables.md](.agents/event-content-formatting/references/tables.md))
- Spacing: paragraphs `mb-5`, blockquotes/images `my-8`, images `rounded-3xl shadow-airbnb`
- Sentence case for all headings, no ALL-CAPS, active voice, inclusive tone
- Frontmatter: follow schema in [src/content.config.ts](src/content.config.ts); see [frontmatter-consistency.md](.agents/event-content-formatting/references/frontmatter-consistency.md)

### Key Patterns

- **Alias**: `@/` maps to project root (e.g. `@/src/components/Header.astro`)
- **Astro components** (`.astro`) handle static/SSR rendering; **React components** (`.tsx`) are client islands for interactivity (e.g. payment button)
- **API routes** must set `export const prerender = false` (SSR-only)
- **`getEntry()` / `getCollection()`** from `astro:content` are used to read Markdown content — these are the source of truth for prices and metadata

### Agent Skills

This repo includes project-specific agent skills in `.agents/`. See [skill-index](.agents/skill-index/SKILL.md) for the full catalog.

| Skill | Use when |
|---|---|
| `design-guidelines` | UI changes, styling, component design |
| `event-content-formatting` | Editing event/pasadia markdown |
| `publish-new-event` | Adding a new event |
| `publish-new-pasadia` | Adding a new pasadia |
| `publish-new-member` | Adding a team member |
| `create-content-collection-schema` | Adding a new content type |
| `payment-integration-bold` | Debugging checkout, payments, webhooks |
| `vercel-integration` | Deploying, env vars, logs, domains |
| `upload-image` | Uploading/optimizing images to Supabase bucket |
