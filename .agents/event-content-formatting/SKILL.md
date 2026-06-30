---
name: event-content-formatting
description: Provides guidelines for formatting event, pasadía, and blog content with HTML + Tailwind typography classes.
---
# Guía de formato para Events, Pasadías y Blog

Este documento define los estándares de formato para el cuerpo de events, pasadías y blog, usando HTML con clases Tailwind del design system Varsana. `allowHTML: true` está activado en la configuración de Markdoc.

Las secciones 1–4 aplican a los tres tipos de contenido. Las secciones 5–6 son específicas de blog.

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

**Events y pasadías:** todos los párrafos del cuerpo usan esta misma clase — `text-secondary-gray` (#6A6A6A) para todo el texto corrido. **Blog:** ver sección 5 para el párrafo lead.

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

## 5. Blog: Párrafo lead con drop cap

El primer párrafo de un post de blog usa un estilo destacado con drop cap:

```html
<p class="text-xl text-near-black leading-relaxed mb-8 font-medium lead-dropcap">Primer párrafo del artículo con drop cap decorativa...</p>
```

Los párrafos siguientes vuelven al formato estándar de la sección 2.

## 6. Blog: Blockquote y links

**Blockquote:**
```html
<blockquote class="border-l-4 border-saffron bg-saffron/5 rounded-r-[16px] p-6 my-8 text-secondary-gray italic leading-relaxed text-lg">Cita...</blockquote>
```

**Pull quote (cita destacada, centrada):**
```html
<blockquote class="bg-saffron/5 border-l-4 border-saffron rounded-r-[16px] p-8 my-10 text-2xl font-display font-bold tracking-tightest text-near-black italic leading-snug mx-auto max-w-2xl">"Cita destacada..."</blockquote>
```

**Link:**
```html
<a href="url" class="text-rausch font-medium underline decoration-rausch/30 hover:decoration-rausch transition-all duration-300" target="_blank" rel="noopener noreferrer">Texto del enlace</a>
```

---

> **Colores:** `text-secondary-gray` = #6A6A6A (body), `text-near-black` = #222222 (headings), `text-forest` = #779B05 (bullets), `text-rausch` = #52185B (links, solo blog), `border-saffron` = #F7941E (blockquote). `font-display` = Proza Libre (headings), Inter (body).

---

**Last updated:** 2026-06-29
**See also:** [`design-guidelines`](../design-guidelines/SKILL.md), [`publish-new-event`](../publish-new-event/SKILL.md), [`publish-new-pasadia`](../publish-new-pasadia/SKILL.md), [`publish-new-blog`](../publish-new-blog/SKILL.md)
