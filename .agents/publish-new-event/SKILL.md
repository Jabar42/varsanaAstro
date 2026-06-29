---
name: publish-new-event
description: Step-by-step instructions for publishing a new event in the Astro content collection. Use when the user wants to add a new event to the Varsana website.
---
# How to Publish a New Event

Events are managed through **content collections**. Each event is a `.mdoc` file in `src/content/events/`. The filename is the entry ID (URL slug, `content_id` in payment orders). The body is written in **HTML with Tailwind classes**; the formatting guide is at [`event-content-formatting`](../event-content-formatting/SKILL.md).

## Workflow with the user

When a user asks you to publish an event in natural language (e.g. *"publica un retiro de yoga el 20 de julio, 20 cupos, 180 lucas"*), follow this process:

### 1. Extract what you already know

Map what the user said directly to fields:

| What the user says | Field |
|--------------------|-------|
| "20 de julio" / "fin de semana del 18 al 20" | `event_start`, `event_end` |
| "20 cupos" / "máximo 30 personas" | `stock_max` → `20` |
| "180 lucas" / "350.000 por persona" | `amount` → `180000` |
| "preventa hasta el 1 de julio" | `deadline` |
| "retiro de yoga y meditación" | `title` → `"Retiro de Yoga y Meditación"` |
| "precio por pareja 600.000" | Separate price tier with higher `amount` |

### 2. Apply smart defaults

Fields the user didn't mention that you can **infer without asking**:

| Field | Default | When to use |
|-------|---------|-------------|
| `image` | `https://picsum.photos/seed/<slug>/1600/1000` | Always, unless the user provides a URL |
| `location` | `"Granada, Cundinamarca"` | Unless the user specifies another location |
| `host_name` | `"Varsana"` | Unless specified otherwise |
| `host_tagline` | `"Comunidad intencional · 15 años de sabiduría"` | Unless specified otherwise |
| `destacado` | `false` | Unless the user wants it featured on the homepage |
| `orden` | `0` | If no preference |
| `event_end` | Omit it | If it's a single-day event (no end date mentioned) |
| Prices without `deadline` | The last price in the array | Acts as the "regular" fallback price |

### 3. Ask only what's necessary

Fields you **must ask about** if the user didn't mention them:

- **`event_start`**: If the user says "publica un retiro" with no date at all, ask. This is required.
- **Price**: If the user says "publica algo" without mentioning money, ask for `amount` and whether they want early-bird pricing with a deadline.
- **`stock_max`**: If no capacity is mentioned, ask. Don't assume a number.

### 4. Confirm before writing

Before creating the file, show the user a summary of what you understood:

> *"Ok, I'll publish:*
> - *File: `retiro-yoga-meditacion.mdoc`*
> - *Title: Retiro de Yoga y Meditación*
> - *Date: July 20, 2026*
> - *Price: $180.000 General*
> - *Capacity: 20*
> - *Image: picsum placeholder*
>
> *Create it?"*

Only write the file once the user confirms.

## Step‑by‑Step Instructions

[Step‑by‑Step Instructions](references/step-by-step-instructions.md) — complete guide: filename, frontmatter, prices, body format.

## Examples

[Examples](references/examples.md) — minimal frontmatter and complete example with HTML+Tailwind body.

## Common Pitfalls & Tips

- **Date format:** Always `YYYY-MM-DD` with standard ASCII hyphens.
- **`event_end`:** Omit for single-day events. Add only if the user mentions multiple days.
- **YAML:** Use spaces (not tabs) for indentation. Each price starts with a hyphen and a space.
- **`amount`:** Plain number, no currency symbols or commas (e.g. `180000`).
- **Sentence case:** Title must start with uppercase, no ALL CAPS, no emoji.

---

**See also:** [`event-content-formatting`](../event-content-formatting/SKILL.md), [`upload-image`](../upload-image/SKILL.md), [`design-guidelines`](../design-guidelines/SKILL.md).
