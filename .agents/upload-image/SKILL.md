---
name: upload-image
description: Upload images to the VarsanaImages Supabase bucket. Use when the user provides an image file and wants it uploaded for use in events, pasadias, team members, or any site content.
---

# Cómo Subir una Imagen al Bucket

## Visión general

Las imágenes del sitio se almacenan en el bucket público **`VarsanaImages`** de Supabase Storage. El bucket acepta imágenes en formato **webp** con un tamaño máximo de **150KB**. El script `scripts/upload-image.ts` se encarga de:

- Convertir cualquier formato (PNG, JPG, GIF, etc.) a webp usando sharp.
- Comprimir la imagen para que cumpla con el límite de 150KB.
- Subir la imagen al bucket y devolver la URL pública.

La URL devuelta puede usarse directamente como valor del campo `image` en el frontmatter de eventos, pasadías o miembros.

## Cuándo usar esta skill

- El usuario te pasa una imagen y quiere subirla al sitio.
- Estás creando o actualizando un evento, pasadía o miembro y necesitas una imagen real (no un placeholder de picsum).
- El usuario pide reemplazar la imagen de un contenido existente.

## Convención de carpetas en el bucket

| Carpeta | Uso |
|---------|-----|
| `eventos/<slug>/` | Imágenes de eventos (portada, galería) |
| `pasadias/<slug>/` | Imágenes de pasadías (portada, galería) |
| `nosotros/<slug>/` | Fotos de miembros del equipo |
| `general/` | Imágenes del sitio sin categoría específica |

El `<slug>` debe coincidir con el nombre del archivo `.md` (sin extensión) en la colección de contenido correspondiente.

**Colecciones nuevas:** Cuando se crea una nueva colección de contenido (ej. `talleres`), define una carpeta en el bucket siguiendo la misma convención: nombre de la colección en español, minúsculas (ej. `talleres/<slug>/`). La skill [`create-content-collection-schema`](../create-content-collection-schema/SKILL.md) ya incluye este paso en su sección 7.

## Instrucciones

### 1. Identificar el contexto

Antes de subir, determina:
- ¿Para qué contenido es esta imagen? (evento, pasadía, miembro, general)
- ¿Cuál es el slug del contenido? (nombre del archivo `.md` sin extensión)

### 2. Ejecutar el script

```bash
npx tsx scripts/upload-image.ts <ruta-de-la-imagen> --folder <carpeta/slug> --name <nombre-descriptivo>
```

**Parámetros:**
- `<ruta-de-la-imagen>` — Ruta absoluta o relativa al archivo local (requerido).
- `--folder` — Carpeta dentro del bucket, típicamente `eventos/<slug>`, `pasadias/<slug>`, `nosotros/<slug>`.
- `--name` — Nombre base del archivo (sin extensión). Si se omite, se usa el nombre del archivo original.

**Ejemplos:**

```bash
# Imagen de portada para el evento "retiro-silencio"
npx tsx scripts/upload-image.ts ./portada.jpg --folder eventos/retiro-silencio --name portada

# Foto de perfil para un miembro del equipo
npx tsx scripts/upload-image.ts ./foto-juan.png --folder nosotros/juan-perez --name perfil

# Imagen de portada para un pasadía
npx tsx scripts/upload-image.ts ./caminata.jpg --folder pasadias/caminata-guaviare --name portada
```

### 3. Usar la URL devuelta

El script imprime la URL pública en la salida estándar. Usa esa URL como valor del campo `image` en el frontmatter del archivo `.md`:

```yaml
image: "https://avvgfkclrciwimctbgqy.supabase.co/storage/v1/object/public/VarsanaImages/eventos/retiro-silencio/portada.webp"
```

### 4. Verificar

Después de subir, confirma que la URL es accesible:

```bash
curl -s -o /dev/null -w "%{http_code}" "<url>"
```

Debe devolver `200`.

## Errores comunes

### La imagen convertida excede 150KB
- Usa una imagen fuente más pequeña (menor resolución).
- El script reduce la calidad automáticamente de 80% hasta 10%. Si aún así excede el límite, redimensiona la imagen antes de subirla.

### "Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
- Verifica que el archivo `.env` existe en la raíz del proyecto y contiene las variables requeridas.
- El script carga automáticamente `.env` en la raíz del proyecto.

### "File not found"
- Usa una ruta absoluta o verifica que la ruta relativa sea correcta desde la raíz del proyecto.

---

**Ver también:** [`publish-new-event`](../publish-new-event/SKILL.md), [`publish-new-pasadia`](../publish-new-pasadia/SKILL.md), [`publish-new-member`](../publish-new-member/SKILL.md), [`design-guidelines`](../design-guidelines/SKILL.md).
