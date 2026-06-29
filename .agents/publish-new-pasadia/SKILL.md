---
name: publish-new-pasadia
description: Step-by-step instructions for publishing a new pasadía (day-trip) in the Astro content collection. Use when the user wants to add a new pasadía to the Varsana website.
---
# Cómo Publicar un Nuevo Pasadía

Los pasadías son **servicios disponibles todo el año con cupo limitado por día**. A diferencia de los eventos (fecha fija), el usuario elige la fecha que desea reservar. Cada pasadía es un archivo `.mdoc` en `src/content/pasadias/`. El nombre del archivo es el entry ID (slug de la URL, `content_id` en órdenes de pago). El cuerpo se escribe en **HTML con clases Tailwind**; la guía de formato está en [`event-content-formatting`](../event-content-formatting/SKILL.md).

## Flujo de trabajo con el usuario

Cuando un usuario te pide publicar un pasadía en lenguaje natural (ej. *"publica una caminata ecológica, 20 cupos, 75 lucas"*), seguí este proceso:

### 1. Extraé lo que ya sabés

De lo que el usuario dijo, identificá los campos que podés mapear directamente:

| Lo que dice el usuario | Campo |
|------------------------|-------|
| "caminata ecológica por la montaña" | `title` → `"Caminata Ecológica por la Montaña"` |
| "20 cupos" / "máximo 30 personas" | `stock_max` → `20` |
| "75 lucas" / "50.000 por persona" | `amount` → `75000` |
| "8 horas" / "medio día" | `duration` → `"8 horas"` |
| "nos vemos en la entrada principal" | `meeting_point` |
| "incluye almuerzo y guía" | `included_services` |
| "preventa hasta el 15 de julio" | `deadline` |

### 2. Aplicá defaults inteligentes

Campos que el usuario no mencionó y **podés inferir sin preguntar**:

| Campo | Default | Cuándo usarlo |
|-------|---------|---------------|
| `image` | `https://picsum.photos/seed/<slug>/1600/1000` | Siempre, si el usuario no da una URL |
| `meeting_point` | `"Entrada principal de Varsana, Granada, Cundinamarca"` | Si el usuario no especifica otro lugar |
| `category` | Inferila de palabras clave (ver abajo) | Si el usuario no la dice explícitamente |
| `included_services` | `[]` | Si el usuario no menciona qué incluye |
| `destacado` | `false` | Si el usuario no pide que aparezca en la homepage |
| `orden` | `0` | Si no hay preferencia |

**Heurísticas para `category`:**
- "montaña", "senderos", "caminata", "naturaleza", "bosque", "cascada" → `"naturaleza"`
- "yoga", "meditación", "bienestar", "sanación", "témazcal" → `"bienestar"`
- "siembra", "huerta", "permacultura", "ecológico", "reciclaje" → `"ecologico"`

### 3. Preguntá solo lo necesario

Campos que **debés preguntar** si el usuario no los mencionó:

- **`duration`**: Si el usuario no da ninguna pista ("medio día", "4 horas"), preguntale. No la inventes.
- **Precio**: Si el usuario dice "publicame algo" sin mencionar plata, preguntale `amount` y si quiere preventa con deadline.
- **`stock_max`**: Si no menciona cupos, preguntale. No asumas un número.

### 4. Confirmá antes de escribir

Antes de crear el archivo, mostrale al usuario un resumen de lo que entendiste:

> *"Ok, voy a publicar:*
> - *Archivo: `caminata-ecologica.mdoc`*
> - *Título: Caminata Ecológica por la Montaña*
> - *Categoría: naturaleza (inferido de 'montaña')*
> - *Duración: 8 horas*
> - *Precio: $75.000 General*
> - *Cupos: 20 por día*
> - *Imagen: placeholder de picsum*
>
> *¿Lo creo así?"*

Recién cuando el usuario confirme, escribí el archivo.

## Instrucciones paso a paso

[Instrucciones paso a paso](references/instrucciones-paso-a-paso.md) — guía completa: nombre de archivo, frontmatter, precios, formato del cuerpo.

## Ejemplos

[Ejemplos](references/ejemplos.md) — frontmatter mínimo y ejemplo completo con cuerpo HTML+Tailwind.

## Errores comunes y consejos

[Errores comunes y consejos](references/errores-consejos.md) — sintaxis YAML, formato de fechas, orden de precios, categorías.

---

**Ver también:** [`event-content-formatting`](../event-content-formatting/SKILL.md), [`upload-image`](../upload-image/SKILL.md), [`design-guidelines`](../design-guidelines/SKILL.md).
