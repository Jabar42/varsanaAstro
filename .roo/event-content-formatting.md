# Event & Pasadía Content Formatting Guidelines

This document defines formatting standards for event and pasadía content, ensuring legibility, consistency, and a professional presentation across the Varsana website.

The guidelines are based on the improvements introduced in [`holi‑fest‑2026.md`](../src/content/events/holi-fest-2026.md). Use this file as a reference model.

---

## 1. Structure – Hierarchical Headings

Use clear heading levels to separate sections. The recommended order is:

- **`##` (H2)** – Main sections (e.g., “Actividades Destacadas”, “Información Práctica”, “Precios”, “Cómo Reservar”).
- **`###` (H3)** – Subsections within each main section (e.g., “Servicios Adicionales”, “Precios y Categorías”).

**Do not skip heading levels** (e.g., do not go from H2 directly to H4). Keep the hierarchy logical and predictable.

**Styling:** Add Tailwind spacing classes directly to the heading tags for consistent vertical rhythm:

```html
<h2 class="mt-10 mb-5">¡El festival más colorido del planeta!</h2>
<h3 class="mt-8 mb-4">Actividades Destacadas</h3>
```

> **Why:** The classes `mt-10 mb-5` (H2) and `mt-8 mb-4` (H3) create a balanced visual separation that matches the site’s design system.

---

## 2. Tables for Structured Data

Convert any list of features, pricing tiers, schedules, service descriptions, etc., into HTML tables with Tailwind styling. Tables improve scannability and make complex information easier to digest.

### Table Template

Wrap every table in a responsive container:

```html
<div class="overflow-x-auto my-8">
  <table class="w-full table-auto border-collapse border border-sacred-sand rounded-3xl shadow-airbnb">
    <thead>
      <tr>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Column 1</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Column 2</th>
        <!-- add more columns as needed -->
      </tr>
    </thead>
    <tbody>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand">Row 1, Cell 1</td>
        <td class="p-4 border-t border-sacred-sand">Row 1, Cell 2</td>
      </tr>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand">Row 2, Cell 1</td>
        <td class="p-4 border-t border-sacred-sand">Row 2, Cell 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Key details:**
- `overflow-x-auto` ensures the table scrolls on small screens.
- `border-collapse border border-sacred-sand rounded-3xl shadow-airbnb` gives a clean, bordered look.
- `bg-sacred-sand` for header background, `font-semibold` for header text.
- `even:bg-sacred-sand` alternates row colors for better readability.
- `p-4` provides consistent padding inside cells.
- `border-t border-sacred-sand` adds a subtle separator between rows.

### When to Use Tables
- Comparing multiple items (e.g., pricing tiers with different inclusions).
- Displaying schedules with time, activity, and description columns.
- Listing services with descriptions and costs.
- Presenting practical information (date, location, contact) in a two‑column layout.

---

## 3. Spacing & Vertical Rhythm

Consistent spacing between elements makes the content feel organized and easy to read.

| Element | Recommended HTML & Classes |
|---------|----------------------------|
| **Paragraph** | `<p class="mb-5">…</p>` |
| **Blockquote** | `<blockquote class="my-8">…</blockquote>` |
| **Unordered/Ordered List** | `<ul class="mb-5 list-disc pl-5">…</ul>` |
| **Image** | `<img class="my-8 rounded-3xl shadow-airbnb" …>` |
| **Horizontal Rule** | `<hr class="my-8 border-sacred-sand">` |

**Rule of thumb:** Use `my-8` for block‑level separators (blockquotes, tables, images) and `mb-5` for inter‑paragraph spacing. Avoid adding extra `<br>` tags; rely on margin classes instead.

---

## 4. Capitalization & Readability

- **Sentence case:** Write headings and labels in sentence case (only the first word capitalized, plus proper nouns). Avoid ALL‑CAPS.
- **Short paragraphs:** Keep paragraphs to 2‑4 lines on desktop. Break long sentences into shorter ones.
- **Clear language:** Use simple, direct vocabulary. Avoid jargon unless it’s well‑explained.
- **Active voice:** Prefer “You will enjoy…” over “Enjoyment will be experienced…”.
- **Inclusive tone:** Maintain the friendly, inspirational voice that matches the Varsana brand.

---

## 5. Frontmatter Consistency

Every event or pasadía must follow the schema defined in [`src/content.config.ts`](../src/content.config.ts).

### Events
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

### Pasadías
```yaml
---
title: "Título del pasadía"
description: "Una descripción corta y atractiva para SEO y tarjetas."
image: "https://picsum.photos/seed/tu‑pasadia/1600/1000"
prices:
  - label: "General"
    amount: 50000
duration: "8 horas"
meeting_point: "Lugar de encuentro (dirección completa)"
category: "naturaleza"
included_services:
  - "Servicio incluido 1"
  - "Servicio incluido 2"
---
```

**Validation points:**
- `event_date` and `deadline` must be in `YYYY‑MM‑DD` format.
- `amount` is a plain number (no currency symbols, no commas).
- `image` URLs should be high‑quality and landscape‑oriented (16:10 ratio).
- Price ordering: place price tiers in evaluation order, with the fallback (regular) price last.

---

## 6. Examples

### Example 1 – Activities Table (from Holi Fest)
```html
<div class="overflow-x-auto my-8">
  <table class="w-full table-auto border-collapse border border-sacred-sand rounded-3xl shadow-airbnb">
    <thead>
      <tr>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Actividad</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Descripción</th>
      </tr>
    </thead>
    <tbody>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand">✅ <strong>DJs y shows en vivo</strong></td>
        <td class="p-4 border-t border-sacred-sand">Ritmos vibrantes que llenan el ambiente de energía y alegría.</td>
      </tr>
      <!-- more rows -->
    </tbody>
  </table>
</div>
```

### Example 2 – Practical Information Table
```html
<h3 class="mt-10 mb-5">Información Práctica</h3>
<div class="overflow-x-auto my-8">
  <table class="w-full table-auto border-collapse border border-sacred-sand rounded-3xl shadow-airbnb">
    <thead>
      <tr>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Detalle</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Información</th>
      </tr>
    </thead>
    <tbody>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand"><strong>Fecha</strong></td>
        <td class="p-4 border-t border-sacred-sand">Domingo, 18 de abril de 2026</td>
      </tr>
      <!-- more rows -->
    </tbody>
  </table>
</div>
```

### Example 3 – Pricing Table with Multiple Columns
```html
<h3 class="mt-10 mb-5">Precios y Categorías</h3>
<div class="overflow-x-auto my-8">
  <table class="w-full table-auto border-collapse border border-sacred-sand rounded-3xl shadow-airbnb">
    <thead>
      <tr>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Categoría</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Preventa</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Taquilla</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Incluye</th>
      </tr>
    </thead>
    <tbody>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand"><strong>VIP</strong></td>
        <td class="p-4 border-t border-sacred-sand">$120.000</td>
        <td class="p-4 border-t border-sacred-sand">$130.000</td>
        <td class="p-4 border-t border-sacred-sand">• Entrada<br>• Bebidas ilimitadas…</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 7. Checklist for Content Creators

Before saving a new or updated event/pasadía markdown file, verify:

### Frontmatter
- [ ] `title` and `description` are filled and compelling.
- [ ] `event_date` (for events) is in `YYYY‑MM‑DD` format.
- [ ] `image` URL points to a high‑quality landscape image (or a valid placeholder).
- [ ] `prices` array is present, with at least one price object.
- [ ] Price `amount` is a number without currency symbols.
- [ ] `deadline` (if used) is in `YYYY‑MM‑DD` and correctly placed.
- [ ] For pasadías: `duration`, `meeting_point`, `category`, and `included_services` are filled.

### Content Body
- [ ] Headings follow the hierarchy (H2 → H3, no skipping).
- [ ] Headings include spacing classes (`mt-10 mb-5` for H2, `mt-8 mb-4` for H3).
- [ ] Paragraphs are wrapped in `<p class="mb-5">`.
- [ ] Lists of comparable items are converted into tables using the provided table template.
- [ ] Tables are wrapped in `<div class="overflow‑x‑auto my‑8">`.
- [ ] Blockquotes use `<blockquote class="my‑8">`.
- [ ] Language is clear, sentence‑cased, and free of unnecessary all‑caps.
- [ ] No stray Markdown syntax (e.g., unclosed HTML tags, misplaced asterisks).

### Visual Verification
- [ ] Preview the page in the development server (`npm run dev`) to confirm tables are responsive and spacing looks balanced.
- [ ] Check that the active price tier (if deadlines are used) is displayed correctly.
- [ ] Ensure images load and are not distorted.

---

## 8. Where to Place Files

- **Events:** `src/content/events/` – filename becomes the URL slug (use kebab‑case).
- **Pasadías:** `src/content/pasadias/` – same naming convention.

After saving, the site will automatically rebuild and the new content will appear on the respective listing pages (`/events`, `/pasadias`) and its dedicated detail page.

---

**Last updated:** 2026‑04‑16  
**Based on:** [`holi‑fest‑2026.md`](../src/content/events/holi-fest-2026.md)  
**See also:** [`.roo/how‑to‑a‑new‑event.md`](./how-to-a-new-event.md), [`.roo/how‑to‑a‑new‑pasadia.md`](./how-to-a-new-pasadia.md)