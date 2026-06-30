---
name: publish-new-member
description: Step-by-step instructions for adding a new member to the nosotros collection. Use when the user wants to add a new team member to the Varsana website.
---
# Cómo Publicar un Nuevo Miembro

Los miembros del equipo son archivos `.mdoc` en `src/content/nosotros/`. El nombre del archivo es el entry ID. A diferencia de eventos y pasadías, el cuerpo del miembro se escribe en **Markdown plano** (no HTML+Tailwind) — la biografía no se renderiza en una página de detalle, solo los datos del frontmatter se muestran en las tarjetas.

## Flujo de trabajo con el usuario

Cuando un usuario te pide agregar un miembro del equipo en lenguaje natural (ej. *"agrega a María López, facilitadora de yoga, 8 años de experiencia"*), seguí este proceso:

### 1. Extraé lo que ya sabés

| Lo que dice el usuario | Campo |
|------------------------|-------|
| "María López" | `nombre` → `"María López"` |
| "facilitadora de yoga" | `rol` → `"Facilitadora de Yoga"` |
| "8 años guiando retiros" | `descripcion` → usalo en la bio |
| "Instagram @maria.yoga" | `enlaces_sociales` |
| "maria@varsana.com" | `correo` |

### 2. Aplicá defaults inteligentes

| Campo | Default | Cuándo usarlo |
|-------|---------|---------------|
| `imagen` | Pedila al usuario | No hay placeholder genérico para personas |
| `orden` | `0` | Si no hay preferencia de posición |
| `activo` | `true` | Si el usuario no dice lo contrario |
| `enlaces_sociales` | `[]` | Si no menciona redes |
| `correo` | Omitilo | Si no se menciona |
| `telefono` | Omitilo | Si no se menciona |

### 3. Preguntá solo lo necesario

- **`imagen`**: Si el usuario no provee una foto, preguntale. No hay placeholder razonable para un retrato.
- **`rol`**: Si no queda claro de la conversación, preguntá.
- **Redes sociales**: Si el miembro es público, preguntá si quiere incluir Instagram, LinkedIn, etc.

### 4. Confirmá antes de escribir

Antes de crear el archivo, mostrale al usuario un resumen:

> *"Ok, voy a agregar a:*
> - *Archivo: `maria-lopez.mdoc`*
> - *Nombre: María López*
> - *Rol: Facilitadora de Yoga*
> - *Orden: 3*
> - *Redes: Instagram*
>
> *¿Lo creo así?"*

Recién cuando el usuario confirme, escribí el archivo.

## Instrucciones paso a paso

[Instrucciones paso a paso](references/step-by-step-instructions.md) — guía completa: nombre de archivo, frontmatter, cuerpo.

## Ejemplos

[Ejemplos](references/examples.md) — frontmatter mínimo y ejemplo completo con cuerpo.

---

**Ver también:** [`upload-image`](../upload-image/SKILL.md), [`design-guidelines`](../design-guidelines/SKILL.md).
