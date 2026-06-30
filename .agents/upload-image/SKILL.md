---
name: upload-image
description: Subir imagenes al bucket R2 de Varsana via API. Usar cuando se necesita una imagen real para eventos, pasadias, equipo o cualquier contenido del sitio.
---

# Como Subir una Imagen

## Vision general

Las imagenes se almacenan en **R2** (Cloudflare) en el bucket `varsana-images`. Se suben via `POST /api/images` (multipart `file`). La API devuelve una URL publica que se usa en el frontmatter.


## Cuando usar esta skill

- El usuario quiere subir una imagen para un evento, blog, pasadia o miembro del equipo.
- Se esta creando contenido nuevo y necesita una imagen real (no placeholder).
- Se necesita reemplazar una imagen existente.

## Instrucciones

### 1. Preparar la imagen

Convertir a WebP y verificar que pese menos de 150 KB:

```bash
# Convertir
cwebp -q 75 imagen_original.jpg -o imagen.webp

# Verificar formato
file imagen.webp   # debe decir: Web/P image

# Verificar peso (debe ser < 150 KB)
ls -lh imagen.webp
```

Si el peso excede 150 KB, reducir calidad: `cwebp -q 50 ...` o redimensionar: `cwebp -resize 1200 0 -q 75 ...`.

### 2. Subir via API

```bash
curl -X POST https://varsana-co.iaforchange.workers.dev/api/images \
  -F "file=@ruta/de/la/imagen.webp"
```

Respuesta:
```json
{"ok":true,"url":"https://varsana-co.iaforchange.workers.dev/api/images/1718400000000-imagen.webp","key":"1718400000000-imagen.webp"}
```

### 3. Usar la URL en el frontmatter

```yaml
image: "https://varsana-co.iaforchange.workers.dev/api/images/1718400000000-imagen.webp"
```

Cuando el sitio migre a `varsana.com`, reemplazar el dominio.

### 4. Verificar

```bash
curl -s -o /dev/null -w "%{http_code}" "<url>"
# Debe devolver 200
```

## Convencion de carpetas en R2

El bucket es plano (no tiene carpetas). El nombre del archivo incluye un timestamp para evitar colisiones: `<timestamp>-<nombre-original>`.

## Formato de imagenes

- **Formato obligatorio: WebP**. Usar `cwebp` o ImageMagick para convertir.
- **Peso maximo: 150 KB**. Optimizar con `cwebp -q 75` o ajustar calidad.
- Cache: inmutable (1 ano), forzar recarga con nuevo upload.

### Conversion a WebP

Dos opciones. Cualquiera funciona:

**Opción A — `cwebp` (mas liviano, instalar con `sudo dnf install libwebp-tools`):**
```bash
cwebp -q 75 imagen.jpg -o imagen.webp
```

**Opción B — ImageMagick (viene preinstalado en Fedora):**
```bash
convert imagen.jpg -quality 75 imagen.webp
# o si convert esta deprecado:
magick imagen.jpg -quality 75 imagen.webp
```

**Verificar:**
```bash
file imagen.webp   # debe decir: Web/P image
ls -lh imagen.webp  # debe ser < 150 KB
```
