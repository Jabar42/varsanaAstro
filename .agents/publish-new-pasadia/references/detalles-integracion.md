## Detalles de integración

### Inclusión automática en el listado de pasadías
El helper `getAllPasadias` (en `src/lib/pasadias.ts`) obtiene todos los pasadías, los ordena alfabéticamente por título y los muestra en la página principal de pasadías (`/pasadias`). Tu nuevo pasadía aparecerá allí tan pronto como se reconstruya el sitio.

### Lógica de selección de precio (`getCurrentPrice`)
La función `getCurrentPrice` determina qué nivel de precio está actualmente activo:

1. Itera a través del array `prices`.
2. Para cada precio que tenga un `deadline`, verifica si la fecha límite aún está en el futuro (comparada con la fecha UTC actual).
3. El **primer** precio con un deadline futuro es seleccionado.
4. Si ninguno tiene un deadline futuro (o no se definen deadlines), se usa el **último** precio del array.

**Advertencia sobre la medianoche UTC:** La comparación usa `new Date(price.deadline) > now`. Dado que `deadline` se interpreta como medianoche UTC, un deadline `2026‑04‑15` significa "hasta el final del 2026‑04‑15 UTC". Si tu zona horaria está adelantada respecto a UTC (ej. America/Bogota es UTC‑5), el deadline podría considerarse pasado 5 horas antes de lo que esperas. Tenlo en cuenta al planificar.

### Generación de la página de detalle
El archivo `src/pages/pasadias/[slug].astro` genera dinámicamente una página para cada pasadía. Utiliza el frontmatter del pasadía para el título, descripción, imagen, precios, duración, punto de encuentro, categoría y servicios incluidos, y renderiza el cuerpo Markdown como HTML. La página también muestra el nivel de precio activo y un botón "Reservar ahora" listo para integración con pasarela de pagos.