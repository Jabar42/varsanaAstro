---
name: event-content-formatting
description: Provides guidelines for formatting event and pasadía content with HTML + Tailwind typography classes. Use when creating or editing .mdoc files to ensure consistent Varsana brand styling.
---
# Guía de formato para Events y Pasadías

Este documento define los estándares de formato para el cuerpo de events y pasadías, usando HTML con clases Tailwind del design system Varsana. `allowHTML: true` está activado en la configuración de Markdoc.

## Referencia rápida

| Elemento | Clases clave |
|----------|-------------|
| h2 | `text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5` |
| h3 | `text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4` |
| Párrafo | `text-secondary-gray text-lg leading-relaxed mb-5` |
| Lista (ul) | `space-y-2 my-5 list-none` |
| Elemento de lista (li) | `flex items-start gap-3 text-secondary-gray text-lg` |
| Bullet (span dentro de li) | `text-forest mt-1.5 shrink-0` |
| Negrita inline | `<strong>` |
| Cursiva inline | `<em>` |

---

## 1. Jerarquía de headings

Usá niveles de heading en orden sin saltos (h2 → h3 → h4):

```html
<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">Sección principal</h2>
<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">Subsección</h3>
<h4 class="text-xl font-display font-semibold tracking-tightest text-near-black mt-8 mb-3">Sub-subsección</h4>
```

> **Design tokens:** `font-display` = Proza Libre (headings), `text-near-black` = #222222, `tracking-tightest` = -0.02em.

---

## 2. Párrafos

```html
<p class="text-secondary-gray text-lg leading-relaxed mb-5">Texto del párrafo...</p>
```

**Todos** los párrafos del cuerpo usan esta misma clase. No hay párrafo lead ni variantes — `text-secondary-gray` (#6A6A6A) para todo el texto corrido.

---

## 3. Listas con bullets verdes

```html
<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Elemento uno</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>8:00 a. m.</strong> – Descripción con horario</li>
</ul>
```

---

## 4. Negrita y cursiva

```html
<strong>texto en negrita</strong>
<em>texto en cursiva</em>
```

---

> **Colores:** `text-secondary-gray` = #6A6A6A (body), `text-near-black` = #222222 (headings), `text-forest` = #779B05 (bullets). `font-display` = Proza Libre (headings), Inter (body).

---

**Last updated:** 2026-06-29
**See also:** [`design-guidelines`](../design-guidelines/SKILL.md), [`publish-new-event`](../publish-new-event/SKILL.md), [`publish-new-pasadia`](../publish-new-pasadia/SKILL.md)
