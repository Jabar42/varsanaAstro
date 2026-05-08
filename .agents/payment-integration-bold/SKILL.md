---
name: payment-integration-bold
description: "Complete reference for the Bold Payment Gateway integration in the Varsana website. Covers checkout flow, database schema, webhook handling, and inventory management."
---

# Bold Payment Gateway Integration

This skill documents the full Bold Payment Gateway integration for the Varsana website. Use it when you need to understand, debug, or extend the payment system.

## Architecture Overview

```
User clicks "Pagar" → BoldPaymentButton (React) → POST /api/checkout → signed payload → Bold.js modal → user pays → Bold webhook → /api/webhook/bold → status update
```

### Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Price source of truth** | Price comes from Markdown frontmatter (`getEntry`), never from the request body. Prevents price manipulation. |
| **Atomic inventory** | PostgreSQL `SELECT ... FOR UPDATE` row lock prevents race conditions. |
| **Integrity signature** | `SHA256(orderId + amount + currency + BOLD_SECRET_KEY)` signed server-side, verified by Bold. |
| **Idempotent webhooks** | Duplicate webhook events are detected via `bold_order_id` — already-paid orders are skipped. |
| **Timing-safe verification** | Webhook HMAC-SHA256 uses `timingSafeEqual` to prevent timing attacks. |

## Key Files

| File | Purpose |
|------|---------|
| [`src/pages/api/checkout.ts`](../../src/pages/api/checkout.ts) | POST endpoint — creates order, signs payload, reserves stock |
| [`src/components/BoldPaymentButton.tsx`](../../src/components/BoldPaymentButton.tsx) | React component — renders Bold embedded checkout |
| [`src/pages/api/webhook/bold.ts`](../../src/pages/api/webhook/bold.ts) | POST endpoint — verifies HMAC, processes payment status |
| [`src/pages/pago/exito.astro`](../../src/pages/pago/exito.astro) | Payment result page — shows approved/declined/failed/pending |
| [`src/lib/supabase.ts`](../../src/lib/supabase.ts) | Supabase client factory (public + admin) |
| [`src/lib/db.ts`](../../src/lib/db.ts) | Database helpers: `getAvailableStock`, `reserveStock`, `releaseStock` |

## Database Schema

### `orders` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto-generated |
| `bold_order_id` | `text` UNIQUE | Bold's order ID, used for webhook idempotency |
| `content_type` | `text` | `'event'` or `'pasadia'` |
| `content_id` | `text` | Matches Markdown frontmatter `id` field |
| `customer_email` | `text` | Collected via Bold form |
| `customer_name` | `text` | Collected via Bold form |
| `amount` | `integer` | Price in COP (no decimals) |
| `currency` | `text` | Defaults to `'COP'` |
| `status` | `text` | `'pending'` / `'paid'` / `'failed'` / `'refunded'` |
| `quantity` | `integer` | Defaults to 1 |
| `bold_tx_status` | `text` | Raw transaction status from Bold |

### `inventory` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto-generated |
| `content_type` | `text` | `'event'` or `'pasadia'` |
| `content_id` | `text` | Matches frontmatter `id` |
| `stock_max` | `integer` | Maximum capacity |
| `stock_reserved` | `integer` | Currently reserved (paid + pending) |

**Unique constraint:** `(content_type, content_id)`

### SQL Migrations

| Migration | Purpose |
|-----------|---------|
| [`001_orders_inventory.sql`](../../supabase/migrations/001_orders_inventory.sql) | Creates `orders` and `inventory` tables |
| [`002_decrement_stock.sql`](../../supabase/migrations/002_decrement_stock.sql) | `decrement_stock` RPC with `FOR UPDATE` row-lock |
| [`003_release_stock.sql`](../../supabase/migrations/003_release_stock.sql) | `release_stock` RPC (uses `GREATEST(0, ...)` to prevent negative) |
| [`004_seed_inventory.sql`](../../supabase/migrations/004_seed_inventory.sql) | Seeds inventory from event `stock_max` frontmatter values |

## Checkout Flow (Detailed)

### 1. User clicks "Pagar" in BoldPaymentButton
The BoldPaymentButton component collects customer data (email, name, phone) and POSTs to `/api/checkout`.

### 2. `/api/checkout` processes the request
Steps performed by [`src/pages/api/checkout.ts`](../../src/pages/api/checkout.ts):

1. **Parse body**: Extracts `contentType`, `contentId`, `quantity`, `customerEmail`, `customerName`, `customerPhone`
2. **Read price from Markdown**: Uses `getEntry(contentType, contentId)` to get the entry — price and description come from frontmatter, NOT the request body
3. **Lazy inventory init**: Calls `getAvailableStock()` — if null (no row exists yet), inserts a new inventory row using the frontmatter `stock_max` value (defaults to 999 for pasadías which have no `stock_max`)
4. **Generate order ID**: `crypto.randomUUID()`
5. **Generate integrity signature**: `SHA256(orderId + amount + currency + BOLD_SECRET_KEY)` — this is a server-only operation; the secret never reaches the frontend
6. **Atomic stock reserve**: Calls `reserveStock()` which invokes the `decrement_stock` RPC with `FOR UPDATE` row-lock
7. **Insert order**: Creates a new `orders` row with status `'pending'`
8. **Return signed payload**: Returns JSON with `orderId`, `amount`, `currency`, `integritySignature`, `description`, and `customerData`

### 3. BoldPaymentButton initializes Bold checkout
After receiving the signed payload from `/api/checkout`, the component dynamically creates a `<script>` tag with `data-bold-*` attributes (including `data-render-mode="embedded"`) which triggers Bold's embedded checkout modal.

### 4. User completes payment in Bold modal
Bold handles the payment. On completion, the user is redirected to `/pago/exito?bold-order-id=...&bold-tx-status=...`.

### 5. Bold sends webhook to `/api/webhook/bold`
Bold sends a POST to `/api/webhook/bold` with the payment status. The handler:

1. **Verifies HMAC-SHA256 signature**: Computes `HMAC-SHA256(rawBody, BOLD_WEBHOOK_SECRET)` and compares using `timingSafeEqual`
2. **Idempotency check**: Queries `orders` by `bold_order_id` — if the status is already `'paid'`, returns `200 { skipped: true }`
3. **Processes status**:
   - `APPROVED` → `UPDATE orders SET status = 'paid'`
   - `DECLINED` / `FAILED` → calls `releaseStock()` + `UPDATE orders SET status = 'failed'`
   - Unknown status → logs warning, acknowledges with 200
4. **Returns fast**: `200 { received: true }` immediately

## Environment Variables

```
# Bold API Keys
BOLD_API_KEY="pk_live_xxxxxxxxx"
BOLD_SECRET_KEY="sk_live_xxxxxxxxx"
BOLD_WEBHOOK_SECRET="whsec_xxxxxxxxx"

# Supabase
PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Site
PUBLIC_SITE_URL="https://varsana.co"
```

## Stock Management

### Events
Events have `stock_max` in frontmatter. Inventory is seeded via `004_seed_inventory.sql` on deploy, or lazily initialized on first checkout access. `decrement_stock` RPC uses `FOR UPDATE` row-lock for atomicity.

### Pasadías (Day-trips)
Pasadías have **no** `stock_max` field. They default to 999 (effectively unlimited) in the checkout API. If a pasadía needs stock limits, add `stock_max` to the frontmatter.

## Common Tasks

### Adding stock to a pasadía
Add `stock_max: 50` to the frontmatter. The checkout API will detect it and use it for inventory. No migration needed — lazy init handles it.

### Manually releasing stock
To release reserved stock manually (e.g., for a cancelled order that didn't go through the webhook), use:

```sql
SELECT release_stock('event', 'event-id-here', 1);
```

### Checking inventory status
```sql
SELECT * FROM inventory WHERE content_type = 'event' AND content_id = 'event-id-here';
```

## Security Rules

1. **Never expose `BOLD_SECRET_KEY`** or `SUPABASE_SERVICE_ROLE_KEY` to the frontend — they are server-only
2. **Price must come from Markdown**, never from user input
3. **Webhook must verify HMAC** before processing — no exceptions
4. **Use `timingSafeEqual`** for signature comparison
5. **Check idempotency** — skip already-processed orders

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Bold modal doesn't open | Script not loaded or `BOLD_API_KEY` missing | Check `<script>` injection in BoldPaymentButton; verify env vars |
| "Invalid signature" from Bold | `integritySignature` mismatch | Verify `BOLD_SECRET_KEY` matches Bold dashboard; check signature formula |
| Webhook not processing | Invalid `BOLD_WEBHOOK_SECRET` or wrong URL | Verify webhook secret; check Bold dashboard webhook URL points to `/api/webhook/bold` |
| Stock not decrementing | Inventory row missing | Lazy init should handle this; check `getAvailableStock` returns null |
| Duplicate webhook processed | Idempotency check failing | Check `bold_order_id` column and unique constraint |

---

**See also:** [`publish-new-event`](../publish-new-event/SKILL.md), [`publish-new-pasadia`](../publish-new-pasadia/SKILL.md)

*This guide is based on the project's implementation as of May 2026. For updates, refer to the latest source files.*
