# Cómo Publicar un Nuevo Pasadía

## Visión general

Los pasadías en este proyecto Astro son **servicios fijos sin fecha específica**. A diferencia de los eventos, que tienen una fecha única (`event_date`), los pasadías están disponibles de forma permanente y se pueden reservar en cualquier momento. Cada pasadía es un archivo Markdown ubicado en `src/content/pasadias/` con un esquema de frontmatter definido. El sistema automáticamente:

- Lista todos los pasadías en la página principal de pasadías (`/pasadias`) usando el helper `getAllPasadias`.
- Genera una página de detalle para cada pasadía en `/pasadias/[slug]`.
- Selecciona el precio activo según los deadlines (si existen) mediante `getCurrentPrice` (la misma lógica que para los eventos).

El esquema de frontmatter se define en `src/content.config.ts` e incluye `title`, `description`, `image`, `prices`, `duration`, `meeting_point`, `category` y `included_services`.

## Instrucciones paso a paso

### 1. Elegir un nombre de archivo y slug
- Crea un nuevo archivo `.md` dentro de `src/content/pasadias/`.
- El nombre del archivo se convertirá en el slug de la URL (ej. `mi-pasadia.md` → `/mi-pasadia`).
- Usa **kebab‑case**, minúsculas y evita caracteres especiales.
- Recomendación: usar un nombre descriptivo en español, como `caminata-ecologica.md` o `pasadia-basico.md`.

### 2. Campos obligatorios del frontmatter
Cada pasadía debe incluir los siguientes campos en el frontmatter:

```yaml
---
title: "Título del pasadía"
description: "Una descripción corta y atractiva para SEO y tarjetas."
image: "https://picsum.photos/seed/tu-pasadia/1600/1000"
prices:
  - label: "General"
    amount: 50000
duration: "8 horas"
meeting_point: "Lugar de encuentro (dirección completa)"
category: "naturaleza"
included_services:
  - "Servicio incluido 1"
  - "Servicio incluido 2"
---
```

#### Detalles de cada campo
- **`title`** (string): Nombre visible del pasadía.
- **`description`** (string): Resumen de una o dos frases que se usará en las meta‑etiquetas y en las tarjetas de listado.
- **`image`** (string): URL de una imagen de alta calidad. Actualmente el proyecto usa placeholders de `picsum.photos`; reemplázala con una imagen real cuando esté disponible.
- **`prices`** (array): Lista de objetos de precio (misma estructura que los eventos).
- **`duration`** (string): Duración aproximada en formato legible, ej. `"8 horas"`, `"4–5 horas"`, `"medio día"`.
- **`meeting_point`** (string): Punto de encuentro donde los participantes deben presentarse. Incluye dirección completa o referencias claras.
- **`category`** (string): Categoría temática del pasadía. Se usa para filtros en la interfaz. Los valores existentes son `"naturaleza"`, `"ecologico"`, `"bienestar"`, etc. Mantén la consistencia con las categorías ya usadas.
- **`included_services`** (array de strings, opcional): Lista de servicios, elementos o beneficios incluidos en el pasadía. Si no se especifica, por defecto es un array vacío `[]`.

### 3. Estructura del objeto de precio
Cada objeto de precio puede tener:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `label` | string | Sí | Nombre visible del nivel de precio (ej. “Preventa”, “General”, “VIP”). |
| `amount` | number | Sí | Precio en pesos colombianos **sin decimales** (ej. `35000`). |
| `deadline` | date | No | Fecha límite para este precio en formato `YYYY‑MM‑DD`. Si se omite, el precio está siempre disponible. |
| `stripePriceId` | string | No | ID de precio de Stripe para la integración de pagos (opcional). |

**Orden importante:** La lista de precios se evalúa de primero a último. El primer precio con un `deadline` futuro se convierte en el precio activo. Si ningún deadline está en el futuro, se usa el **último** precio del array como fallback. Por tanto, coloca tu precio “regular” o “por defecto” al final.

### 4. Escribir el cuerpo en Markdown
Debajo del frontmatter, escribe la descripción completa del pasadía en Markdown.

**Estructura recomendada:**
- Comienza con un titular atractivo (H2).
- Usa párrafos cortos y listas con viñetas para mejorar la legibilidad.
- Incluye secciones como “Itinerario aproximado”, “¿Qué incluye?”, “Recomendaciones”, “Punto de encuentro”, “Políticas de cancelación”, etc.
- Mantén un tono amigable e inspirador que coincida con la marca Varsana.

**Fragmento de ejemplo:**

```markdown
## Una experiencia que te conecta con la tierra

Sumérgete en los senderos ancestrales de la montaña sagrada de Varsana. Esta caminata ecológica está diseñada para quienes buscan un contacto profundo con la naturaleza, lejos del ruido urbano.

### Itinerario aproximado

- **8:00 a. m.** – Encuentro en la entrada principal.
- **8:30 a. m.** – Inicio de la caminata con una ceremonia de gratitud a la tierra.
- **10:00 a. m.** – Parada en el mirador “El Colibrí” para meditación guiada.
- **12:00 p. m.** – Almuerzo vegetariano preparado con ingredientes locales.
- **2:00 p. m.** – Continuación del recorrido hasta la cascada “Agua Clara”.
- **4:00 p. m.** – Regreso al punto de encuentro y cierre con círculo de compartir.

### ¿Qué incluye?

- Guía especializado en ecoturismo y sabiduría ancestral.
- Almuerzo vegetariano completo (plato principal, bebida y postre).
- Bastones de trekking y botella de agua reutilizable.
- Seguro de asistencia médica durante la actividad.
```

### 5. Dónde guardar el archivo
Guarda el archivo en `src/content/pasadias/`. El cargador de colecciones de contenido de Astro lo detectará automáticamente.

## Ejemplos

### Frontmatter mínimo
```yaml
---
title: "Pasadía de Bienestar"
description: "Una jornada de reconexión interior a través del yoga y la meditación."
image: "https://picsum.photos/seed/bienestar/1600/1000"
prices:
  - label: "General"
    amount: 45000
duration: "4 horas"
meeting_point: "Salón principal de Varsana, Granada, Cundinamarca"
category: "bienestar"
---
```

### Ejemplo completo (frontmatter + cuerpo)
```markdown
---
title: "Caminata Ecológica por la Montaña"
description: "Una jornada de conexión con la naturaleza a través de senderos ancestrales."
image: "https://picsum.photos/seed/caminata/1600/1000"
prices:
  - label: "Preventa"
    amount: 65000
    deadline: 2026-05-10
  - label: "General"
    amount: 75000
duration: "8 horas"
meeting_point: "Entrada principal de Varsana, Granada, Cundinamarca"
category: "naturaleza"
included_services:
  - "Guía especializado"
  - "Almuerzo vegetariano"
  - "Materiales para la caminata"
---
## Una experiencia que te conecta con la tierra

Sumérgete en los senderos ancestrales de la montaña sagrada de Varsana. Esta caminata ecológica está diseñada para quienes buscan un contacto profundo con la naturaleza, lejos del ruido urbano.

### Itinerario aproximado

- **8:00 a. m.** – Encuentro en la entrada principal.
- **8:30 a. m.** – Inicio de la caminata con una ceremonia de gratitud a la tierra.
- **10:00 a. m.** – Parada en el mirador “El Colibrí” para meditación guiada.
- **12:00 p. m.** – Almuerzo vegetariano preparado con ingredientes locales.
- **2:00 p. m.** – Continuación del recorrido hasta la cascada “Agua Clara”.
- **4:00 p. m.** – Regreso al punto de encuentro y cierre con círculo de compartir.

### ¿Qué incluye?

- Guía especializado en ecoturismo y sabiduría ancestral.
- Almuerzo vegetariano completo (plato principal, bebida y postre).
- Bastones de trekking y botella de agua reutilizable.
- Seguro de asistencia médica durante la actividad.
```

## Detalles de integración

### Inclusión automática en el listado de pasadías
El helper `getAllPasadias` (en `src/lib/pasadias.ts`) obtiene todos los pasadías, los ordena alfabéticamente por título y los muestra en la página principal de pasadías (`/pasadias`). Tu nuevo pasadía aparecerá allí tan pronto como se reconstruya el sitio.

### Lógica de selección de precio (`getCurrentPrice`)
La función `getCurrentPrice` determina qué nivel de precio está actualmente activo:

1. Itera a través del array `prices`.
2. Para cada precio que tenga un `deadline`, verifica si la fecha límite aún está en el futuro (comparada con la fecha UTC actual).
3. El **primer** precio con un deadline futuro es seleccionado.
4. Si ninguno tiene un deadline futuro (o no se definen deadlines), se usa el **último** precio del array.

**Advertencia sobre la medianoche UTC:** La comparación usa `new Date(price.deadline) > now`. Dado que `deadline` se interpreta como medianoche UTC, un deadline `2026‑04‑15` significa “hasta el final del 2026‑04‑15 UTC”. Si tu zona horaria está adelantada respecto a UTC (ej. America/Bogota es UTC‑5), el deadline podría considerarse pasado 5 horas antes de lo que esperas. Tenlo en cuenta al planificar.

### Generación de la página de detalle
El archivo `src/pages/pasadias/[slug].astro` genera dinámicamente una página para cada pasadía. Utiliza el frontmatter del pasadía para el título, descripción, imagen, precios, duración, punto de encuentro, categoría y servicios incluidos, y renderiza el cuerpo Markdown como HTML. La página también muestra el nivel de precio activo y un botón “Reservar ahora” (listo para integración con Stripe).

## Errores comunes y consejos

### Formatos de fecha
- **Siempre** usa `YYYY‑MM‑DD`. Otros formatos (como `DD/MM/YYYY`) provocarán errores de análisis.
- Los campos `deadline` (en los precios) se analizan como objetos `Date` en el esquema.

### Placeholders de imagen
- El proyecto actualmente usa `https://picsum.photos/seed/…/1600/1000` como placeholder. Reemplázalo con una URL de imagen real cuando el activo visual del pasadía esté listo.
- Asegúrate de que la imagen sea de alta calidad y en orientación horizontal (la proporción 16:10 funciona bien).

### Problema de zona horaria en los deadlines
- Como se mencionó arriba, los deadlines se evalúan a medianoche UTC. Si quieres que un deadline sea efectivo hasta el final de un día determinado en Colombia, establece el deadline **un día después** (ej. si el corte es el 15 de abril hora Colombia, escribe `deadline: 2026‑04‑16`).

### Orden de los precios
- Coloca los niveles de precio en el orden en que quieres que sean evaluados. El último precio es el fallback, así que pon tu precio “regular” o “por defecto” al final.
- Ejemplo:
  ```yaml
  prices:
    - label: "Super Preventa"   # primero que se verifica
      amount: 50000
      deadline: 2026-03-01
    - label: "Preventa"         # se verifica después
      amount: 60000
      deadline: 2026-04-01
    - label: "General"          # fallback si ambos deadlines pasaron
      amount: 80000
  ```

### Sintaxis YAML
- Usa espacios (no tabuladores) para la indentación.
- Cada entrada de precio debe comenzar con un guion y un espacio.
- El `amount` debe ser un número simple (sin símbolos de moneda, sin comas).

### Consistencia de categorías
- Utiliza una de las categorías ya existentes en otros pasadías (`"naturaleza"`, `"ecologico"`, `"bienestar"`, etc.) para mantener la coherencia en los filtros de la interfaz.
- Si necesitas una nueva categoría, actualiza el componente `CategoryBar.astro` para que la reconozca.

### Duración y punto de encuentro
- Escribe la duración en un formato claro y legible para el usuario, ej. `"8 horas"` en lugar de `"8h"`.
- Incluye toda la información necesaria en `meeting_point`: dirección, referencias, si hay parqueadero, etc.

## Validación

Después de crear el archivo de tu pasadía, verifica que todo funcione como se espera:

1. **Revisa el listado de pasadías** – Ejecuta el servidor de desarrollo (`npm run dev`) y visita `/pasadias`. Tu nuevo pasadía debería aparecer en la cuadrícula.

2. **Visita la página de detalle** – Haz clic en la tarjeta del pasadía o navega directamente a `/pasadias/[tu‑slug]`. Confirma que:
   - El título, la descripción y la imagen se muestren correctamente.
   - El cuerpo Markdown se renderice adecuadamente.
   - La tarjeta de precio muestre el nivel activo esperado.
   - La duración, el punto de encuentro, la categoría y los servicios incluidos se visualicen.

3. **Prueba la selección de precio** – Si incluiste deadlines, verifica que el precio activo cambie según lo previsto cuando el deadline pase (puedes ajustar temporalmente el reloj del sistema o crear un pasadía de prueba con un deadline cercano).

4. **Construye el sitio** – Ejecuta `npm run build` para asegurarte de que no haya errores de validación del esquema.

Si algún paso falla, revisa el frontmatter en busca de errores tipográficos, comprueba la indentación YAML y consulta la consola de desarrollo del navegador para ver mensajes de error.

---

*Esta guía se basa en la implementación del proyecto a abril de 2026. Para actualizaciones, consulta los archivos más recientes `src/content.config.ts` y `src/lib/pasadias.ts`.*