---
name: event-content-formatting
description: Provides guidelines for formatting event and pasadía content with HTML tables, spacing, and typography. Use when creating or editing event/pasadía markdown files to ensure consistent styling.
---
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

Convert any list of features, pricing tiers, schedules, service descriptions, etc., into HTML tables with Tailwind styling. Tables improve scannability and make complex information easier to digest. For the table template and usage guidelines, see [Tables for Structured Data](references/tables.md).

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

Every event or pasadía must follow the schema defined in [`src/content.config.ts`](../src/content.config.ts). For detailed frontmatter examples and validation points, see [Frontmatter Consistency](references/frontmatter-consistency.md).

## 6. Examples

For concrete examples of formatted tables, see [Examples](references/examples.md).

---

## 7. Checklist for Content Creators

Before saving a new or updated event/pasadía markdown file, verify the checklist. See [Checklist for Content Creators](references/checklist.md) for detailed items.

---

## 8. Where to Place Files

- **Events:** `src/content/events/` – filename becomes the URL slug (use kebab‑case).
- **Pasadías:** `src/content/pasadias/` – same naming convention.

After saving, the site will automatically rebuild and the new content will appear on the respective listing pages (`/events`, `/pasadias`) and its dedicated detail page.

---

**Last updated:** 2026‑04‑16  
**Based on:** [`holi‑fest‑2026.md`](../src/content/events/holi-fest-2026.md)  
**See also:** [`.roo/how‑to‑a‑new‑event.md`](../publish-new-event/SKILL.md), [`.roo/how‑to‑a‑new‑pasadia.md`](../publish-new-pasadia/SKILL.md)