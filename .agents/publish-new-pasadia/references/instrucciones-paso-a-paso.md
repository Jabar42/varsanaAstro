## Instrucciones paso a paso

### 1. Elegir un nombre de archivo
- Crea un nuevo archivo `.md` dentro de `src/content/pasadias/`.
- El nombre del archivo determina el ID de entrada (que se usa como slug de la URL). Usa **kebab‑case**, minúsculas y evita caracteres especiales.
- Recomendación: usar un nombre descriptivo en español, como `caminata-ecologica.md` o `pasadia-basico.md`.

### 2. Campos obligatorios del frontmatter
Cada pasadía debe incluir los siguientes campos en el frontmatter:

```yaml
---
id: "mi-pasadia-id"
title: "Título del pasadía"
description: "Una descripción corta y atractiva para SEO y tarjetas."
image: "https://picsum.photos/seed/tu-pasadia/1600/1000"
prices:
  - label: "General"
    amount: 50000
stock_max: 30
duration: "8 horas"
meeting_point: "Lugar de encuentro (dirección completa)"
category: "naturaleza"
included_services:
  - "Servicio incluido 1"
  - "Servicio incluido 2"
---
```

#### Detalles de cada campo
- **`id`** (string): Un identificador único y persistente para el pasadía. Este ID se usará para la integración con la pasarela de pagos y no cambiará aunque se renombre el archivo. La URL de la página de detalle se deriva de este ID (ej. `id: "caminata-ecologica"` → `/pasadias/caminata-ecologica`). Usa kebab‑case.
- **`title`** (string): Nombre visible del pasadía. Debe estar en **minúscula con la primera letra mayúscula** (sentence case; ej. `"Caminata ecológica por la montaña"`). **No** uses MAYÚSCULAS SOSTENIDAS ni caracteres emoji.
- **`description`** (string): Resumen de una o dos frases que se usará en las meta‑etiquetas y en las tarjetas de listado.
- **`image`** (string): URL de una imagen de alta calidad. Actualmente el proyecto usa placeholders de `picsum.photos`; reemplázala con una imagen real cuando esté disponible.
- **`prices`** (array): Lista de objetos de precio (misma estructura que los eventos).
- **`stock_max`** (number): Cupo máximo de personas **por día**. El inventario se gestiona por fecha: cada día tiene su propio cupo independiente.
- **`duration`** (string): Duración aproximada en formato legible, ej. `"8 horas"`, `"4–5 horas"`, `"medio día"`.
- **`meeting_point`** (string): Punto de encuentro donde los participantes deben presentarse. Incluye dirección completa o referencias claras.
- **`category`** (string): Categoría temática del pasadía. Se usa para filtros en la interfaz. Los valores existentes son `"naturaleza"`, `"ecologico"`, `"bienestar"`, etc. Mantén la consistencia con las categorías ya usadas.
- **`included_services`** (array de strings, opcional): Lista de servicios, elementos o beneficios incluidos en el pasadía. Si no se especifica, por defecto es un array vacío `[]`.

### 3. Estructura del objeto de precio
Cada objeto de precio puede tener:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `label` | string | Sí | Nombre visible del nivel de precio (ej. "Preventa", "General", "VIP"). |
| `amount` | number | Sí | Precio en pesos colombianos **sin decimales** (ej. `35000`). |
| `deadline` | date | No | Fecha límite para este precio en formato `YYYY‑MM‑DD`. Si se omite, el precio está siempre disponible. |

**Orden importante:** La lista de precios se evalúa de primero a último. El primer precio con un `deadline` futuro se convierte en el precio activo. Si ningún deadline está en el futuro, se usa el **último** precio del array como fallback. Por tanto, coloca tu precio "regular" o "por defecto" al final.

### 4. Escribir el cuerpo en Markdown
Debajo del frontmatter, escribe la descripción completa del pasadía en Markdown.

**Estructura recomendada:**
- Comienza con un titular atractivo (H2).
- Usa párrafos cortos y listas con viñetas para mejorar la legibilidad.
- Incluye secciones como "Itinerario aproximado", "¿Qué incluye?", "Recomendaciones", "Punto de encuentro", "Políticas de cancelación", etc.
- Mantén un tono amigable e inspirador que coincida con la marca Varsana.

**Fragmento de ejemplo:**

```markdown
## Una experiencia que te conecta con la tierra

Sumérgete en los senderos ancestrales de la montaña sagrada de Varsana. Esta caminata ecológica está diseñada para quienes buscan un contacto profundo con la naturaleza, lejos del ruido urbano.

### Itinerario aproximado

- **8:00 a. m.** – Encuentro en la entrada principal.
- **8:30 a. m.** – Inicio de la caminata con una ceremonia de gratitud a la tierra.
- **10:00 a. m.** – Parada en el mirador "El Colibrí" para meditación guiada.
- **12:00 p. m.** – Almuerzo vegetariano preparado con ingredientes locales.
- **2:00 p. m.** – Continuación del recorrido hasta la cascada "Agua Clara".
- **4:00 p. m.** – Regreso al punto de encuentro y cierre con círculo de compartir.

### ¿Qué incluye?

- Guía especializado en ecoturismo y sabiduría ancestral.
- Almuerzo vegetariano completo (plato principal, bebida y postre).
- Bastones de trekking y botella de agua reutilizable.
- Seguro de asistencia médica durante la actividad.
```

### 5. Dónde guardar el archivo
Guarda el archivo en `src/content/pasadias/`. El cargador de colecciones de contenido de Astro lo detectará automáticamente.

