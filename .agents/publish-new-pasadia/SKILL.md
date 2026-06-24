---
name: publish-new-pasadia
description: Step-by-step instructions for publishing a new pasadía (day-trip) in the Astro content collection. Use when the user wants to add a new pasadía to the Varsana website.
---
# Cómo Publicar un Nuevo Pasadía

## Visión general

Los pasadías en este proyecto Astro son **servicios disponibles todo el año con cupo limitado por día**. A diferencia de los eventos, que tienen una fecha fija (`event_start`), los pasadías permiten al usuario elegir la fecha que desea reservar. Cada pasadía es un archivo Markdown ubicado en `src/content/pasadias/` con un esquema de frontmatter definido. El sistema automáticamente:

- Lista todos los pasadías en la página principal de pasadías (`/pasadias`) usando el helper `getAllPasadias`.
- Genera una página de detalle para cada pasadía en `/pasadias/[slug]`, donde la URL se deriva del ID de entrada (el nombre del archivo sin extensión).
- Muestra un contador único de personas con precio automático. Si hay `min_quantity`, aplica descuento por volumen al alcanzar la cantidad mínima.
- Muestra un selector de fecha en el botón de pago para que el usuario elija el día de su visita.
- Gestiona el inventario por fecha: cada día tiene su propio cupo de `stock_max` personas.

El esquema de frontmatter se define en `src/content.config.ts` e incluye `id`, `title`, `description`, `image`, `prices`, `stock_max`, `duration`, `meeting_point`, `category` y `included_services`.

## Instrucciones paso a paso

Para una guía detallada paso a paso, consulta [Instrucciones paso a paso](references/instrucciones-paso-a-paso.md).

## Ejemplos

Puedes ver ejemplos de frontmatter mínimo y completo en [Ejemplos](references/ejemplos.md).

## Detalles de integración

Para detalles técnicos sobre inclusión automática, lógica de precios y generación de páginas, consulta [Detalles de integración](references/detalles-integracion.md).


## Errores comunes y consejos

Consulta la lista de errores frecuentes y recomendaciones en [Errores comunes y consejos](references/errores-consejos.md).

## Validación

Después de crear el archivo de tu pasadía, verifica que todo funcione como se espera:

1. **Revisa el listado de pasadías** – Ejecuta el servidor de desarrollo (`npm run dev`) y visita `/pasadias`. Tu nuevo pasadía debería aparecer en la cuadrícula.

2. **Visita la página de detalle** – Haz clic en la tarjeta del pasadía o navega directamente a `/pasadias/[entry-id]`. Confirma que:
   - El título, la descripción y la imagen se muestren correctamente.
   - El cuerpo Markdown se renderice adecuadamente.
   - La tarjeta de precio muestre el nivel activo esperado.
   - La duración, el punto de encuentro, la categoría, el stock máximo y los servicios incluidos se visualicen.
   - El selector de fecha esté visible en el botón de pago.

3. **Prueba el selector de fecha** – Verifica que solo permita seleccionar fechas a partir de mañana. Sin fecha seleccionada, el botón debe mostrar "Elige una fecha" y estar deshabilitado.

4. **Prueba el descuento por volumen** – Si usaste `min_quantity`, verifica que al alcanzar la cantidad mínima el precio por persona baje automáticamente.

5. **Construye el sitio** – Ejecuta `npm run build` para asegurarte de que no haya errores de validación del esquema.

Si algún paso falla, revisa el frontmatter en busca de errores tipográficos, comprueba la indentación YAML y consulta la consola de desarrollo del navegador para ver mensajes de error.

---

## Integración con Bold Payment Gateway

Este proyecto utiliza **Bold Payment Gateway** para pagos en línea. Al publicar un nuevo pasadía:

1. **Los precios vienen del frontmatter** — La API de checkout lee los precios del archivo Markdown, no de la entrada del usuario. Esto previene la manipulación de precios.
2. **`stock_max` es requerido** — Cada pasadía debe definir un cupo máximo por día. El control de stock es por fecha: el usuario elige la fecha al reservar y el inventario se gestiona por día.
3. **El usuario elige la fecha** — A diferencia de los eventos (fecha fija), los pasadías muestran un selector de fecha en el botón de pago. El stock se reserva para la fecha seleccionada.
4. **El `id` es persistente** — Las órdenes de pago referencian los pasadías por su `id`, no por el nombre del archivo. No cambies el `id` después de publicar.
5. **Inventario lazy por fecha** — Si no existe una fila de inventario para la combinación pasadía+fecha cuando se intente el primer checkout, se creará automáticamente con el `stock_max` del frontmatter.

Para detalles completos de la integración de pagos, consulta [`payment-integration-bold`](../payment-integration-bold/SKILL.md).

---

**Ver también:** [`upload-image`](../upload-image/SKILL.md), [`design‑guidelines`](../design-guidelines/SKILL.md), [`payment-integration-bold`](../payment-integration-bold/SKILL.md).

*Esta guía se basa en la implementación del proyecto a mayo de 2026. Para actualizaciones, consulta los archivos más recientes `src/content.config.ts`, `src/lib/pasadias.ts` y [`payment-integration-bold`](../payment-integration-bold/SKILL.md).*
