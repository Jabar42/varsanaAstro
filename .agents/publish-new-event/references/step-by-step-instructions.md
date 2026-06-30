## Step‑by‑Step Instructions

### 1. Choose a filename
- Create a new `.mdoc` file inside `src/content/events/`.
- The filename (without `.mdoc`) determines the entry ID — used as the URL slug (`/events/<slug>`), the API slug (`?slug=<slug>`), and the key for payment records. Use kebab‑case, lowercase, and avoid special characters.

### 2. Required frontmatter fields
Every event must include the following frontmatter fields:

```yaml
---
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
- **`title`** (string): The event's display name. Must be in **sentence case** (only the first letter capitalized; e.g., `"Retiro de silencio y meditación"`). Do **not** use ALL CAPS or emoji characters.
- **`description`** (string): A one‑ or two‑sentence summary used in meta tags and cards.
- **`event_start`** (date, required): The start date of the event in `YYYY‑MM‑DD` format.
- **`event_end`** (date, optional): The end date of the event. Omit for single-day events. If set, used to determine if the event is still upcoming.
- **`image`** (string): A high‑quality image URL. Use the [`upload-image`](../../upload-image/SKILL.md) skill to upload to the `VarsanaImages` bucket. If you don't have the image yet, use `https://picsum.photos/seed/<event-slug>/1600/1000` as a temporary placeholder.
- **`stock_max`** (integer): Maximum capacity / number of available spots for the event. Must be a positive integer.
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

### 4. Writing the content body

Below the frontmatter, write the event's full description. **The content must be written in HTML with Tailwind classes**, not plain Markdown. The complete formatting guide is at [`event-content-formatting`](../../event-content-formatting/SKILL.md).

**Required classes for each element:**

| Element | HTML + Tailwind classes |
|---------|----------------------|
| h2 (main section) | `<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">` |
| h3 (subsection) | `<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">` |
| p (paragraph) | `<p class="text-secondary-gray text-lg leading-relaxed mb-5">` |
| ul (list) | `<ul class="space-y-2 my-5 list-none">` |
| li (list item) | `<li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> ...</li>` |
| li with schedule | `<li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>8:00 a. m.</strong> – Description</li>` |

**Recommended structure:**
- Start with an engaging opening paragraph that introduces the experience.
- Organize content into sections using h2/h3.
- Use lists with green bullets for schedules, included items, and recommendations.
- Include subsections such as "¿Qué incluye?", "Itinerario", "¿Qué debes traer?", "Recomendaciones".

**Example body snippet:**
```html
<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">¡Una experiencia que transforma!</h2>

<p class="text-secondary-gray text-lg leading-relaxed mb-5">Ven a reconectar con la naturaleza y contigo mismo en un entorno único.</p>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">¿Qué incluye?</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Meditación guiada al amanecer.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Taller de permacultura práctica.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Almuerzo vegetariano consciente.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Ceremonia de cierre alrededor del fuego.</li>
</ul>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">Información práctica</h3>

<p class="text-secondary-gray text-lg leading-relaxed mb-5"><strong>Fecha:</strong> Domingo, 18 de abril de 2026</p>
<p class="text-secondary-gray text-lg leading-relaxed mb-5"><strong>Horario:</strong> 8:00 a. m. – 6:00 p. m.</p>
<p class="text-secondary-gray text-lg leading-relaxed mb-5"><strong>Ubicación:</strong> Varsana Eco Aldea – Yoga Village, Km 28 Vía Melgar (Granada, Cundinamarca)</p>
```

### 5. Where to place the file
Save the file in `src/content/events/`. The Astro content collection loader will automatically pick it up.
