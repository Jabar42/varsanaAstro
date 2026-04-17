---
name: publish-new-event
description: Step-by-step instructions for publishing a new event in the Astro content collection. Use when the user wants to add a new event to the Varsana website.
---
# How to Publish a New Event

## Overview

Events in this Astro project are managed through **content collections**. Each event is a Markdown file placed in `src/content/events/` with a defined frontmatter schema. The system automatically:

- Lists upcoming events on the main events page (`/events`) using the `getUpcomingEvents` helper.
- Generates a dedicated detail page for each event at `/[slug]`.
- Selects the currently active price based on deadlines (if any) via `getCurrentPrice`.

The frontmatter schema is defined in `src/content.config.ts` and includes `title`, `description`, `event_date`, `image`, and an array of `prices`.

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

## Examples

### Minimal frontmatter
```yaml
---
title: "Taller de Mindfulness"
description: "Aprende técnicas de atención plena en un entorno natural."
event_date: 2026-05-10
image: "https://picsum.photos/seed/mindfulness/1600/1000"
prices:
  - label: "General"
    amount: 60000
---
```

### Complete example (frontmatter + body)
```markdown
---
title: "Retiro de Silencio"
description: "Un fin de semana de introspección y reconexión en completo silencio."
event_date: 2026-06-15
image: "https://picsum.photos/seed/silence/1600/1000"
prices:
  - label: "Preventa"
    amount: 180000
    deadline: 2026-05-31
  - label: "Regular"
    amount: 220000
---
## Un espacio para escucharte

Este retiro está diseñado para que puedas desconectar del ruido exterior y conectar con tu voz interior.

### Lo que vivirás
- Meditaciones guiadas por la mañana y la tarde.
- Caminatas contemplativas por el bosque.
- Alimentación ayurvédica preparada con amor.
- Espacios de escritura reflexiva.

### Recomendaciones
- Traer ropa cómoda y una manta para sentarse.
- Se recomienda dejar dispositivos electrónicos en casa.
- El silencio comienza el viernes a las 6 p. m. y finaliza el domingo al mediodía.
```

## Integration Details

### Automatic inclusion in the upcoming events list
The helper `getUpcomingEvents` (in `src/lib/events.ts`) fetches all events, filters out past dates, and sorts them chronologically. Your new event will appear on the main events page (`/events`) as soon as the site is rebuilt.

### Price selection logic (`getCurrentPrice`)
The function `getCurrentPrice` determines which price tier is currently active:

1. It iterates through the `prices` array.
2. For each price that has a `deadline`, it checks whether the deadline is still in the future (compared to the current UTC date).
3. The **first** price with a future deadline is selected.
4. If none have a future deadline (or no deadlines are defined), the **last** price in the array is used.

**UTC midnight caveat:** The comparison uses `new Date(price.deadline) > now`. Because `deadline` is parsed as UTC midnight, a deadline of `2026-04-15` means “until the end of 2026‑04‑15 UTC”. If your local timezone is ahead of UTC (e.g., America/Bogota is UTC‑5), the deadline may be considered passed 5 hours earlier than you expect. Plan accordingly.

### Event detail page generation
The file `src/pages/events/[slug].astro` dynamically generates a page for each event. It uses the event’s frontmatter for the title, description, image, and prices, and renders the Markdown body as HTML. The page also displays the active price tier and a “Reservar ahora” button (Stripe integration ready).

## Common Pitfalls & Tips

### Date formats
- **Always** use `YYYY‑MM‑DD`. Other formats (like `DD/MM/YYYY`) will cause parsing errors.
- The `event_date` and `deadline` fields are parsed as `Date` objects by the schema.

### Image placeholders
- The project currently uses `https://picsum.photos/seed/…/1600/1000` as a placeholder. Replace with a real image URL when the event’s visual asset is ready.
- Ensure the image is high‑quality and landscape‑oriented (16:10 ratio works well).

### Deadline timezone issue
- As noted above, deadlines are evaluated at UTC midnight. If you want a deadline to be effective until the end of a certain day in Colombia, set the deadline **one day later** (e.g., if the cutoff is April 15 Colombia time, write `deadline: 2026-04-16`).

### Price ordering
- Place price tiers in the order you want them evaluated. The last price is the fallback, so put your “regular” or “default” price at the end.
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

2. **Visit the detail page** – Click on the event card or navigate directly to `/[your‑slug]`. Confirm that:
   - The title, description, and image are displayed correctly.
   - The Markdown body renders properly.
   - The price card shows the expected active tier.

3. **Test price selection** – If you included deadlines, verify that the active price changes as expected when the deadline passes (you can temporarily adjust your system clock or create a test event with a near‑future deadline).

4. **Build the site** – Run `npm run build` to ensure there are no schema validation errors.

If any step fails, review the frontmatter for typos, check the YAML indentation, and consult the browser’s developer console for errors.

---

*This guide is based on the project’s implementation as of April 2026. For updates, refer to the latest `src/content.config.ts` and `src/lib/events.ts`.*