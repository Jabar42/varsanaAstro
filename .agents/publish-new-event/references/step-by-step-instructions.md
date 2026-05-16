## Step‑by‑Step Instructions

### 1. Choose a filename
- Create a new `.md` file inside `src/content/events/`.
- The filename determines the entry ID (used as the URL slug and as the key for payment records). Use kebab‑case, lowercase, and avoid special characters.
- Set the frontmatter `id` field to match the filename (without extension) for consistency.

### 2. Required frontmatter fields
Every event must include the following frontmatter fields:

```yaml
---
id: "my-event-id"
title: "Event Title"
description: "A short, compelling description for SEO and cards."
event_start: YYYY-MM-DD
image: "https://picsum.photos/seed/your‑event/1600/1000"
stock_max: 100
prices:
  - label: "Early Bird"
    amount: 50000
    deadline: 2026-03-31
  - label: "Regular"
    amount: 70000
---
```

#### Field details
- **`id`** (string): A unique, persistent identifier for the event. Should match the filename (without extension) for consistency. The URL path for the event's detail page is derived from the **filename** (e.g., `retiro-silencio.md` → `/events/retiro-silencio`). Payment orders also reference the filename, not the frontmatter `id`.
- **`title`** (string): The event's display name. Must be in **sentence case** (only the first letter capitalized; e.g., `"Retiro de silencio y meditación"`). Do **not** use ALL CAPS or emoji characters.
- **`description`** (string): A one‑ or two‑sentence summary used in meta tags and cards.
- **`event_start`** (date, required): The start date of the event in `YYYY‑MM‑DD` format.
- **`event_end`** (date, optional): The end date of the event. Omit for single-day events. If set, used to determine if the event is still upcoming.
- **`image`** (string): A high‑quality image URL. The project currently uses `picsum.photos` placeholders; replace with a real image when available.
- **`stock_max`** (integer): Maximum capacity / number of available spots for the event. Must be a positive integer. **This value seeds the inventory table** — it controls how many reservations are accepted before the event sells out. Stock is managed via Supabase; see [`payment-integration-bold`](../../payment-integration-bold/SKILL.md) for details.
- **`destacado`** (boolean, optional): Set to `true` to feature this event in the homepage slider. Defaults to `false`. Past events are automatically excluded from the slider even if `destacado` is `true`.
- **`orden`** (number, optional): Sort order within the slider. Lower numbers appear first. Defaults to `0`.
- **`prices`** (array): A list of price objects.

### 3. Price object structure
Each price object can have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Display name of the price tier (e.g., "Early Bird", "VIP"). |
| `amount` | number | Yes | Price in Colombian pesos (without decimal places). |
| `deadline` | date | No | Cut‑off date for this tier in `YYYY‑MM‑DD`. If omitted, the effective deadline defaults to `event_start` — the ticket is available only until the event starts. |

**Important ordering:** The price list is evaluated from first to last. The first price with a future effective deadline becomes the active price via `getCurrentPrice`. If none have a future deadline, the **last** price in the array is used as the fallback. Therefore, place your "regular" or "default" price at the end.

**Multi-ticket behavior:** When an event has multiple prices, the BoldPaymentButton component shows a ticket selector where users can choose quantities of each ticket type. The total is calculated client-side and validated server-side. The checkout API reads prices from the Markdown file (not user input) to prevent price manipulation.

### 4. Writing the markdown body
Below the frontmatter, write the event's full description in Markdown.

**Recommended structure:**
- Start with an engaging headline (H2).
- Use short paragraphs and bullet lists for readability.
- Include subsections such as "What to Expect", "Schedule", "Location", "What to Bring", etc.
- Maintain a friendly, inspirational tone that matches the Varsana brand.

**Example body snippet:**
```markdown
## ¡Una experiencia que transforma!

Ven a reconectar con la naturaleza y contigo mismo en un entorno único.

### ¿Qué incluye?
- Meditación guiada al amanecer.
- Taller de permacultura práctica.
- Almuerzo vegetariano consciente.
- Ceremonia de cierre alrededor del fuego.

### Información práctica
**Fecha:** Domingo, 18 de abril de 2026  
**Horario:** 8:00 a. m. – 6:00 p. m.  
**Ubicación:** Varsana Eco Aldea – Yoga Village, Km 28 Vía Melgar (Granada, Cundinamarca)
```

### 5. Where to place the file
Save the file in `src/content/events/`. The Astro content collection loader will automatically pick it up.
