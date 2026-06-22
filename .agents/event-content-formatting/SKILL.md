---
name: event-content-formatting
description: Provides guidelines for formatting event, pasadía, and blog content with HTML + Tailwind typography classes. Use when creating or editing .mdoc files to ensure consistent Varsana brand styling.
---
# Guía de formato para Events, Pasadías y Blog

Este documento define los estándares de formato para el contenido de events, pasadías y blog, usando HTML con clases Tailwind del design system Varsana. `allowHTML: true` está activado en la configuración de Markdoc.

## Referencia rápida

| Elemento | Clases clave |
|----------|-------------|
| h2 | `text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5` |
| h3 | `text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4` |
| Párrafo | `text-secondary-gray text-lg leading-relaxed mb-5` |
| Lead (1er párrafo) | `text-xl text-near-black leading-relaxed mb-8 font-medium lead-dropcap` |
| Blockquote | `border-l-4 border-saffron bg-saffron/5 rounded-r-[16px] p-6 my-8 text-secondary-gray italic leading-relaxed text-lg` |
| Pull quote | `bg-saffron/5 border-l-4 border-saffron rounded-r-[16px] p-8 my-10 text-2xl font-display font-bold tracking-tightest text-near-black italic leading-snug mx-auto max-w-2xl` |
| Link | `text-rausch font-medium underline decoration-rausch/30 hover:decoration-rausch transition-all duration-300` |
| Imagen | `rounded-[24px] shadow-airbnb w-full my-10` |
| Bullet lista | `space-y-2 my-5 list-none` + bullet span con `text-forest` |

---

## 1. Structure – Hierarchical Headings

Use clear heading levels to separate sections. The recommended order is:

- **`##` (H2)** – Main sections (e.g., “Actividades Destacadas”, “Información Práctica”, “Precios”, “Cómo Reservar”).
- **`###` (H3)** – Subsections within each main section (e.g., “Servicios Adicionales”, “Precios y Categorías”).

**Do not skip heading levels** (e.g., do not go from H2 directly to H4). Keep the hierarchy logical and predictable.

**Styling:** Use the following HTML tags with Tailwind classes for brand typography:

```html
<h2 class=”text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5”>Sección principal</h2>
<h3 class=”text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4”>Subsección</h3>
<h4 class=”text-xl font-display font-semibold tracking-tightest text-near-black mt-8 mb-3”>Sub-subsección</h4>
```

> **Design tokens:** `font-display` = Proza Libre (headings), `text-near-black` = #222222, `tracking-tightest` = -0.02em.

---

## 2. Tables for Structured Data

Convert any list of features, pricing tiers, schedules, service descriptions, etc., into HTML tables with Tailwind styling. Tables improve scannability and make complex information easier to digest. For the table template and usage guidelines, see [Tables for Structured Data](references/tables.md).

---

## 3. Guía tipográfica completa

Todos los elementos usan HTML con clases Tailwind del design system Varsana. `allowHTML: true` está activado en la configuración de Markdoc.

### Párrafos

```html
<p class="text-secondary-gray text-lg leading-relaxed mb-5">Texto del párrafo...</p>
```

### Párrafo lead (primer párrafo del artículo, con drop cap)

```html
<p class="text-xl text-near-black leading-relaxed mb-8 font-medium lead-dropcap">Primer párrafo del artículo con drop cap decorativa...</p>
```

### Blockquote estándar

```html
<blockquote class="border-l-4 border-saffron bg-saffron/5 rounded-r-[16px] p-6 my-8 text-secondary-gray italic leading-relaxed text-lg">Cita normal...</blockquote>
```

### Pull quote (cita destacada, centrada)

```html
<blockquote class="bg-saffron/5 border-l-4 border-saffron rounded-r-[16px] p-8 my-10 text-2xl font-display font-bold tracking-tightest text-near-black italic leading-snug mx-auto max-w-2xl">"Cita destacada..."</blockquote>
```

### Listas

```html
<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Elemento uno</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Elemento dos</li>
</ul>
```

### Imagen

```html
<img src="url" alt="descripcion" class="rounded-[24px] shadow-airbnb w-full my-10" />
```

### Imagen con caption

```html
<figure class="my-10">
  <img src="url" alt="descripcion" class="rounded-[24px] shadow-airbnb w-full" />
  <figcaption class="text-sm text-secondary-gray text-center mt-3 italic">Texto del caption</figcaption>
</figure>
```

### Links

```html
<a href="url" class="text-rausch font-medium underline decoration-rausch/30 hover:decoration-rausch transition-all duration-300" target="_blank" rel="noopener noreferrer">Texto del enlace</a>
```

### Negrita y cursiva (inline)

```html
<strong>texto en negrita</strong>
<em>texto en cursiva</em>
```

### Separador horizontal

```html
<hr class="my-8 border-sacred-sand" />
```

> **Diseño:** `text-secondary-gray` = #6A6A6A (body), `text-near-black` = #222222 (headings), `text-rausch` = #52185B (links), `text-forest` = #779B05 (bullets), `border-saffron` = #F7941E (acento). Todas las fuentes: `font-display` = Proza Libre para headings, Inter para body.

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

- **Events:** `src/content/events/` – filename determines the URL (the slug); use kebab‑case.
- **Pasadías:** `src/content/pasadias/` – same naming convention.
- **Blog:** `src/content/blog/` – same naming convention.

After saving, the site will automatically rebuild and the new content will appear on the respective listing pages (`/events`, `/pasadias`, `/blog`) and its dedicated detail page.

---

**Last updated:** 2026‑06‑22
**allowHTML:** Enabled
**See also:** [`design‑guidelines`](../design-guidelines/SKILL.md), [`publish-new-event`](../publish-new-event/SKILL.md), [`publish-new-pasadia`](../publish-new-pasadia/SKILL.md)