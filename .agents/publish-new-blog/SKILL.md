---
name: publish-new-blog
description: Step-by-step instructions for publishing a new blog post in the Astro content collection. Use when the user wants to add a new blog post to the Varsana website.
---
# Cómo Publicar un Nuevo Post de Blog

Los posts de blog son artículos en `src/content/blog/`. El nombre del archivo es el entry ID (slug de la URL). El cuerpo se escribe en **HTML con clases Tailwind**; la guía de formato está en [`event-content-formatting`](../event-content-formatting/SKILL.md) — secciones 1–4 para lo básico, secciones 5–6 para los patrones específicos de blog (lead paragraph, blockquote, links).

## Flujo de trabajo con el usuario

Cuando un usuario te pide publicar un post de blog en lenguaje natural (ej. *"escribe un artículo sobre la historia de Varsana"*), seguí este proceso:

### 1. Extraé lo que ya sabés

| Lo que dice el usuario | Campo |
|------------------------|-------|
| "historia de Varsana" / "el museo de Prabhupada" | `title` → `"Historia de Varsana"` |
| Frase descriptiva sobre el tema | `description` |
| "escribí vos el contenido" | El usuario te da libertad sobre el cuerpo |
| "etiquetalo como espiritualidad, cultura" | `tags` |

### 2. Aplicá defaults inteligentes

| Campo | Default | Cuándo usarlo |
|-------|---------|---------------|
| `image` | `https://picsum.photos/seed/<slug>/1200/630` | Siempre, si el usuario no da una URL |
| `date` | Fecha de hoy | Si el usuario no especifica otra |
| `author` | `"Comunidad Varsana"` | Si el usuario no dice quién firma |
| `tags` | `[]` | Si el usuario no menciona etiquetas |
| `destacado` | `false` | Si el usuario no pide que aparezca en la homepage |
| `orden` | `0` | Si no hay preferencia |

### 3. Preguntá solo lo necesario

- **Tema y enfoque**: Si el usuario dice "publica algo en el blog" sin más, preguntale sobre qué quiere escribir.
- **`author`**: Si el texto suena personal, confirmá si lo firma el usuario o la comunidad.
- **`tags`**: Si no las menciona, sugerile 2–3 basadas en el contenido y pedí confirmación.

### 4. Confirmá antes de escribir

Antes de crear el archivo, mostrale al usuario un resumen:

> *"Ok, voy a publicar:*
> - *Archivo: `historia-de-varsana.mdoc`*
> - *Título: Historia de Varsana Eco Yoga Aldea*
> - *Autor: Comunidad Varsana*
> - *Tags: comunidad, historia, ecoaldea*
> - *Imagen: placeholder de picsum*
>
> *¿Lo creo así?"*

Recién cuando el usuario confirme, escribí el archivo.

## Instrucciones paso a paso

[Instrucciones paso a paso](references/instrucciones-paso-a-paso.md) — guía completa: nombre de archivo, frontmatter, formato del cuerpo.

## Ejemplos

[Ejemplos](references/ejemplos.md) — frontmatter mínimo y ejemplo completo con cuerpo HTML+Tailwind.

---

**Ver también:** [`event-content-formatting`](../event-content-formatting/SKILL.md), [`design-guidelines`](../design-guidelines/SKILL.md), [`upload-image`](../upload-image/SKILL.md).
