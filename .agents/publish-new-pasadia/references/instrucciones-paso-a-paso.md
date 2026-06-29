## Instrucciones paso a paso

### 1. Elegir un nombre de archivo

Crea un nuevo archivo `.mdoc` dentro de `src/content/pasadias/`. El nombre del archivo **es** el entry ID: determina el slug de la URL (`/pasadias/<filename>`), cómo se referencia desde `getEntry()`, y el `content_id` en las órdenes de pago. No cambies el nombre después de publicar.

Usa **kebab‑case**, minúsculas y evita caracteres especiales. Ejemplo: `caminata-ecologica.mdoc`, `pasadia-bienestar.mdoc`.

### 2. Campos del frontmatter

```yaml
---
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

#### Campos obligatorios

- **`title`** (string): Nombre visible del pasadía. Sentence case (primera letra mayúscula). No usar MAYÚSCULAS SOSTENIDAS ni emoji.
- **`description`** (string): Resumen de una o dos frases para meta‑etiquetas y tarjetas de listado.
- **`image`** (string): URL de una imagen de alta calidad. Usa la skill [`upload-image`](../../upload-image/SKILL.md) para subirla al bucket `VarsanaImages`. Si aún no tienes la imagen, usa `https://picsum.photos/seed/<pasadia-slug>/1600/1000` como placeholder.
- **`prices`** (array): Lista de objetos de precio (ver sección 3).
- **`stock_max`** (number): Cupo máximo de personas **por día**.
- **`duration`** (string): Duración aproximada, ej. `"8 horas"`, `"4–5 horas"`, `"medio día"`.
- **`meeting_point`** (string): Punto de encuentro con dirección completa o referencias claras.
- **`category`** (string): Categoría temática. Valores existentes: `"naturaleza"`, `"ecologico"`, `"bienestar"`. Usá una ya existente para mantener consistencia en los filtros.

#### Campos opcionales

- **`destacado`** (boolean): `true` para que aparezca en el slider de la homepage. Default `false`.
- **`orden`** (number): Posición dentro del slider. Números más bajos primero. Default `0`.
- **`included_services`** (array de strings): Servicios incluidos. Default `[]`.

### 3. Estructura del objeto de precio

Cada objeto de precio puede tener:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `label` | string | Sí | Nombre visible del nivel (ej. "Preventa", "General"). |
| `amount` | number | Sí | Precio en pesos colombianos **sin decimales** (ej. `35000`). |
| `deadline` | date | No | Fecha límite en formato `YYYY‑MM‑DD`. Si se omite, el precio está siempre disponible. |
| `min_quantity` | number | No | Cantidad mínima de personas para aplicar este precio. Default `1`. |

**Orden importante:** La lista de precios se evalúa de primero a último. El primer precio con un `deadline` futuro se convierte en el precio activo. Si todos los deadlines ya pasaron, se usa el **último** precio como fallback. Por tanto, poné tu precio "regular" al final.

**Descuento por volumen con `min_quantity`:**
```yaml
prices:
  - label: "General"
    amount: 75000
    min_quantity: 1
  - label: "General"
    amount: 65000
    min_quantity: 4
```
- 1–3 personas → $75.000/persona
- 4+ personas → $65.000/persona

### 4. Escribir el cuerpo del contenido

Debajo del frontmatter, escribí la descripción completa. **El contenido debe escribirse en HTML con clases Tailwind**, no en Markdown plano. La guía completa de formato está en [`event-content-formatting`](../../event-content-formatting/SKILL.md).

**Fragmento de ejemplo:**

```html
<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">Una experiencia que te conecta con la tierra</h2>

<p class="text-secondary-gray text-lg leading-relaxed mb-5">Sumérgete en los senderos ancestrales de la montaña sagrada de Varsana. Esta caminata ecológica está diseñada para quienes buscan un contacto profundo con la naturaleza, lejos del ruido urbano.</p>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">Itinerario aproximado</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>8:00 a. m.</strong> – Encuentro en la entrada principal.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>8:30 a. m.</strong> – Inicio de la caminata con una ceremonia de gratitud a la tierra.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>10:00 a. m.</strong> – Parada en el mirador "El Colibrí" para meditación guiada.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>12:00 p. m.</strong> – Almuerzo vegetariano preparado con ingredientes locales.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>2:00 p. m.</strong> – Continuación del recorrido hasta la cascada "Agua Clara".</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>4:00 p. m.</strong> – Regreso al punto de encuentro y cierre con círculo de compartir.</li>
</ul>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">¿Qué incluye?</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Guía especializado en ecoturismo y sabiduría ancestral.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Almuerzo vegetariano completo (plato principal, bebida y postre).</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Bastones de trekking y botella de agua reutilizable.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Seguro de asistencia médica durante la actividad.</li>
</ul>
```

**Estructura recomendada:** abrí con un párrafo atractivo, organizá el contenido con h2/h3, usá listas con bullets verdes para itinerarios y servicios, e incluí secciones como "Itinerario", "¿Qué incluye?", "Recomendaciones", "Punto de encuentro", "Políticas de cancelación".
