## Step‑by‑Step Instructions

### 1. Choose a filename and slug
- Create a new `.md` file inside `src/content/events/`.
- The filename will become the URL slug (e.g., `my-event.md` → `/my-event`).
- Use kebab‑case, lowercase, and avoid special characters.

### 2. Required frontmatter fields
Every event must include the following frontmatter fields:

```yaml
---
title: "Event Title"
description: "A short, compelling description for SEO and cards."
event_date: YYYY-MM-DD
image: "https://picsum.photos/seed/your‑event/1600/1000"
prices:
  - label: "Early Bird"
    amount: 50000
    deadline: 2026-03-31
  - label: "Regular"
    amount: 70000
---
```

#### Field details
- **`title`** (string): The event’s display name.
- **`description`** (string): A one‑ or two‑sentence summary used in meta tags and cards.
- **`event_date`** (date): The date of the event in `YYYY‑MM‑DD` format.
- **`image`** (string): A high‑quality image URL. The project currently uses `picsum.photos` placeholders; replace with a real image when available.
- **`prices`** (array): A list of price objects.

### 3. Price object structure
Each price object can have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Display name of the price tier (e.g., “Early Bird”, “VIP”). |
| `amount` | number | Yes | Price in Colombian pesos (without decimal places). |
| `deadline` | date | No | Cut‑off date for this tier in `YYYY‑MM‑DD`. If omitted, the price is always available. |
| `stripePriceId` | string | No | Stripe Price ID for payment integration (optional). |

**Important ordering:** The price list is evaluated from first to last. The first price with a future `deadline` becomes the active price. If no deadlines are in the future, the **last** price in the array is used as the fallback. Therefore, place your “regular” or “default” price at the end.

### 4. Writing the markdown body
Below the frontmatter, write the event’s full description in Markdown.

**Recommended structure:**
- Start with an engaging headline (H2).
- Use short paragraphs and bullet lists for readability.
- Include subsections such as “What to Expect”, “Schedule”, “Location”, “What to Bring”, etc.
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