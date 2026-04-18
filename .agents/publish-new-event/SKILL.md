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

For detailed step‑by‑step instructions, see [Step‑by‑Step Instructions](references/step-by-step-instructions.md).

## Examples

For minimal and complete examples, see [Examples](references/examples.md).

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