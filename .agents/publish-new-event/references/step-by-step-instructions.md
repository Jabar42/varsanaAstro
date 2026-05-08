## Step‑by‑Step Instructions

### 1. Choose a filename
- Create a new `.md` file inside `src/content/events/`.
- The filename determines the entry ID (used as the URL slug). Use kebab‑case, lowercase, and avoid special characters.

### 2. Required frontmatter fields
Every event must include the following frontmatter fields:

```yaml
---
id: "my-event-id"
title: "Event Title"
description: "A short, compelling description for SEO and cards."
event_date: YYYY-MM-DD
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
- **`id`** (string): A unique, persistent identifier for the event. This ID is used by the payment gateway and will not change even if the file is renamed. The URL path for the event's detail page is derived from this ID (e.g., `id: "retiro-silencio-2026"` → `/events/retiro-silencio-2026`). Use kebab‑case.
- **`title`** (string): The event's display name. Must be in **sentence case** (only the first letter capitalized; e.g., `"Retiro de silencio y meditación"`). Do **not** use ALL CAPS or emoji characters.
- **`description`** (string): A one‑ or two‑sentence summary used in meta tags and cards.
- **`event_date`** (date): The date of the event in `YYYY‑MM‑DD` format.
- **`image`** (string): A high‑quality image URL. The project currently uses `picsum.photos` placeholders; replace with a real image when available.
- **`stock_max`** (integer): Maximum capacity / number of available spots for the event. Must be a positive integer. **This value seeds the inventory table** — it controls how many reservations are accepted before the event sells out. Stock is managed via Supabase; see [`payment-integration-bold`](../../payment-integration-bold/SKILL.md) for details.
- **`prices`** (array): A list of price objects.

### 3. Price object structure
Each price object can have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Display name of the price tier (e.g., "Early Bird", "VIP"). |
| `amount` | number | Yes | Price in Colombian pesos (without decimal places). |
| `deadline` | date | No | Cut‑off date for this tier in `YYYY‑MM‑DD`. If omitted, the price is always available. |

**Important ordering:** The price list is evaluated from first to last. The first price with a future `deadline` becomes the active price. If no deadlines are in the future, the **last** price in the array is used as the fallback. Therefore, place your "regular" or "default" price at the end.

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
