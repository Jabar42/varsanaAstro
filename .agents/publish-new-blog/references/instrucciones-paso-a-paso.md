## Instrucciones paso a paso

### 1. Elegir un nombre de archivo

Crea un nuevo archivo `.mdoc` dentro de `src/content/blog/`. El nombre del archivo **es** el entry ID y determina el slug de la URL (`/blog/<filename>`). No cambies el nombre después de publicar.

Usa **kebab‑case**, minúsculas y evita caracteres especiales. Ejemplo: `historia-de-varsana.mdoc`, `museo-srila-prabhupada.mdoc`.

### 2. Campos del frontmatter

```yaml
---
title: "Título del Post"
description: "Descripción corta para SEO y tarjetas."
image: "https://picsum.photos/seed/blog-post/1200/630"
date: 2026-06-29
author: "Comunidad Varsana"
tags:
  - "comunidad"
  - "ecoaldea"
destacado: true
orden: 1
---
```

#### Detalle de cada campo

- **`title`** (string, requerido): Título del artículo. Sentence case, sin emoji.
- **`description`** (string, requerido): Resumen de una o dos frases para meta‑etiquetas y tarjetas.
- **`image`** (string, requerido): URL de imagen. Usá `https://picsum.photos/seed/<slug>/1200/630` como placeholder. Si necesitás una imagen real, usá la skill [`upload-image`](../../upload-image/SKILL.md).
- **`date`** (date, requerido): Fecha de publicación en formato `YYYY-MM-DD`. Si el usuario no la especifica, usá la fecha actual.
- **`author`** (string, requerido): Quién firma el artículo. Default: `"Comunidad Varsana"`.
- **`tags`** (array de strings, opcional): Etiquetas para categorizar. Default `[]`.
- **`destacado`** (boolean, opcional): `true` para que aparezca en la homepage. Default `false`.
- **`orden`** (number, opcional): Posición entre los destacados. Números más bajos primero. Default `0`.

### 3. Escribir el cuerpo del contenido

El cuerpo del blog combina los patrones básicos de `event-content-formatting` (secciones 1–4) con patrones específicos de blog (secciones 5–6).

**Estructura recomendada:**
- Abrí con un **h1** que repita o expanda el título
- Primer párrafo con **lead + drop cap** (`text-xl text-near-black lead-dropcap`)
- Organizá el contenido con **h2** para secciones principales
- Usá **blockquote** para citas destacadas
- Usá **párrafos estándar** (`text-secondary-gray`) para el texto corrido
- Incluí **links** con estilo `text-rausch` para referencias externas

**Fragmento de ejemplo:**

```html
<h1 class="text-4xl md:text-5xl font-display font-bold tracking-tightest text-near-black mb-6">Título del artículo</h1>

<p class="text-xl text-near-black leading-relaxed mb-8 font-medium lead-dropcap">Primer párrafo del artículo, con drop cap decorativa. Acá va el gancho que atrapa al lector.</p>

<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">Primera sección</h2>

<p class="text-secondary-gray text-lg leading-relaxed mb-5">Texto del artículo. Párrafos cortos, legibles, con <strong>negritas</strong> y <em>cursivas</em> cuando haga falta.</p>

<blockquote class="bg-saffron/5 border-l-4 border-saffron rounded-r-[16px] p-8 my-10 text-2xl font-display font-bold tracking-tightest text-near-black italic leading-snug mx-auto max-w-2xl">"Una cita destacada del artículo."</blockquote>

<p class="text-secondary-gray text-lg leading-relaxed mb-5">Más contenido. Podés incluir <a href="https://ejemplo.com" class="text-rausch font-medium underline decoration-rausch/30 hover:decoration-rausch transition-all duration-300" target="_blank" rel="noopener noreferrer">links a referencias externas</a>.</p>
```
