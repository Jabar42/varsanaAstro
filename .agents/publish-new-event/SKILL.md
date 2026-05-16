---
name: publish-new-event
description: Step-by-step instructions for publishing a new event in the Astro content collection. Use when the user wants to add a new event to the Varsana website.
---
# How to Publish a New Event

## Overview

Events in this Astro project are managed through **content collections**. Each event is a Markdown file placed in `src/content/events/` with a defined frontmatter schema. The system automatically:

- Lists upcoming events on the main events page (`/events`) using the `getUpcomingEvents` helper.
- Generates a dedicated detail page for each event at `/events/[slug]`, where the URL is derived from the entry ID (the filename without extension).
- Selects the currently active price based on deadlines (if any) via `getCurrentPrice`.

The frontmatter schema is defined in `src/content.config.ts` and includes `id`, `title`, `description`, `event_start`, `event_end` (optional), `image`, `stock_max`, and an array of `prices`.

## Step‑by‑Step Instructions

For detailed step‑by‑step instructions, see [Step‑by‑Step Instructions](references/step-by-step-instructions.md).

## Examples

For minimal and complete examples, see [Examples](references/examples.md).

## Integration Details

### Automatic inclusion in the upcoming events list
The helper `getUpcomingEvents` (in `src/lib/events.ts`) fetches all events, filters out past dates, and sorts them chronologically. Your new event will appear on the main events page (`/events`) as soon as the site is rebuilt.

### Event identification (`id` vs filename)
Each event has a unique `id` field in its frontmatter, but the **entry ID** (filename without extension) is what Astro uses for routing (`/events/[entry-id]`) and for payment order references. The frontmatter `id` is a persistent human-readable identifier that should match the filename for consistency, but the system uses the **filename** as the canonical key.

- The URL path is derived from the **filename**, not the frontmatter `id`. Example: `retiro-silencio.md` → `/events/retiro-silencio`.
- Payment orders reference events by their **entry ID** (filename), not the frontmatter `id`.
- Keep the frontmatter `id` identical to the filename (without extension) to avoid confusion.
- Choose both carefully — once published and linked to payment records, changing the filename would break associations.

### Stock management (`stock_max`)
The `stock_max` field defines the maximum capacity (number of available spots) for the event. This value will be used to control reservations and prevent overbooking when the payment gateway is integrated.

- Must be a positive integer.
- Set realistically based on the venue capacity and logistics.
- Example: `stock_max: 30` for an intimate retreat, `stock_max: 500` for a large festival.

### Price deadline logic (`getAvailablePrices` and `getCurrentPrice`)
There are two functions for price selection:

**`getAvailablePrices(prices, eventStart)`** — Returns all prices whose effective deadline is still in the future. The effective deadline for each price is:
- The explicit `deadline` if present.
- `event_start` if no deadline is set (tickets must be purchased before the event begins).

**`getCurrentPrice(prices, eventStart?)`** — Determines the single active price tier:
1. It iterates through the `prices` array.
2. For each price, it checks if its effective deadline is still in the future.
3. The **first** price with a future deadline is selected.
4. If none have a future deadline, the **last** price in the array is used as fallback.

**UTC midnight caveat:** The comparison uses `new Date(price.deadline) > now`. Because `deadline` is parsed as UTC midnight, a deadline of `2026-04-15` means "until the end of 2026‑04‑15 UTC". If your local timezone is ahead of UTC (e.g., America/Bogota is UTC‑5), the deadline may be considered passed 5 hours earlier than you expect. Plan accordingly.

### Event detail page generation
The file `src/pages/events/[slug].astro` dynamically generates a page for each event. It uses the event's frontmatter for the title, description, image, and prices, and renders the Markdown body as HTML. The page also displays the active price tier and a "Reservar ahora" button ready for payment gateway integration.

## Common Pitfalls & Tips

### Date formats
- **Always** use `YYYY-MM-DD` (with standard ASCII hyphens). Other formats (like `DD/MM/YYYY`) will cause parsing errors.
- The `event_start`, `event_end` (optional), and `deadline` fields are parsed as `Date` objects by the schema.
- For single-day events, omit `event_end`. For multi-day events, add `event_end`.
- If a price has no explicit `deadline`, its effective deadline defaults to `event_start` (the ticket is available until the event starts).

### Imágenes
- Usa la skill [`upload-image`](../upload-image/SKILL.md) para subir la imagen del evento al bucket `VarsanaImages` y obtener una URL pública.
- Si el evento aún no tiene imagen, usa `https://picsum.photos/seed/<event-slug>/1600/1000` como placeholder temporal.
- La imagen debe ser de alta calidad y orientación horizontal (16:10 funciona bien).

### Deadline timezone issue
- As noted above, deadlines are evaluated at UTC midnight. If you want a deadline to be effective until the end of a certain day in Colombia, set the deadline **one day later** (e.g., if the cutoff is April 15 Colombia time, write `deadline: 2026-04-16`).

### Price ordering
- Place price tiers in the order you want them evaluated. The last price is the fallback, so put your "regular" or "default" price at the end.
- Example:
  ```yaml
  prices:
    - label: "Super Early Bird"   # first checked
      amount: 50000
      deadline: 2026-03-01
    - label: "Early Bird"         # checked next
      amount: 60000
      deadline: 2026-04-01
    - label: "Regular"            # fallback if both deadlines passed
      amount: 80000
  ```

### YAML syntax
- Use spaces (not tabs) for indentation.
- Each price entry must start with a hyphen and a space.
- The `amount` must be a plain number (no currency symbols, no commas).

## Validation

After creating your event file, verify that everything works as expected:

1. **Check the events list** – Run the development server (`npm run dev`) and visit `/events`. Your new event should appear in the upcoming events grid.

2. **Visit the detail page** – Click on the event card or navigate directly to `/events/[entry-id]`. Confirm that:
   - The title, description, and image are displayed correctly.
   - The Markdown body renders properly.
   - The price card shows the expected active tier.

3. **Test price selection** – If you included deadlines, verify that the active price changes as expected when the deadline passes (you can temporarily adjust your system clock or create a test event with a near‑future deadline).

4. **Build the site** – Run `npm run build` to ensure there are no schema validation errors.

If any step fails, review the frontmatter for typos, check the YAML indentation, and consult the browser's developer console for errors.

---

## Bold Payment Gateway Integration

This project uses **Bold Payment Gateway** for online payments. When you publish a new event:

1. **`stock_max` is critical** — This value seeds the inventory table. It controls how many reservations are accepted before the event sells out. Choose it carefully.
2. **The entry ID (filename) is the key** — Payment orders reference events by the entry ID (the filename without extension). Never rename an event file after it has been published and linked to payment records.
3. **Prices come from frontmatter** — The checkout API reads prices from the Markdown file, not from user input. The API validates ticket labels against the frontmatter and calculates amounts server-side to prevent price manipulation.
4. **Lazy inventory init** — If no inventory row exists for your event when the first checkout is attempted, one will be created automatically from the frontmatter `stock_max`.

For full details on the payment integration, see [`payment-integration-bold`](../payment-integration-bold/SKILL.md).

---

**See also:** [`upload-image`](../upload-image/SKILL.md), [`design‑guidelines`](../design-guidelines/SKILL.md), [`payment-integration-bold`](../payment-integration-bold/SKILL.md).

*This guide is based on the project's implementation as of May 2026. For updates, refer to the latest `src/content.config.ts`, `src/lib/events.ts`, and [`payment-integration-bold`](../payment-integration-bold/SKILL.md).*
