---
name: upload-image
description: Subir imagenes al bucket R2 de Varsana via API. Usar cuando se necesita una imagen real para eventos, pasadias, equipo o cualquier contenido del sitio.
---

# Como Subir una Imagen

## Vision general

Las imagenes se almacenan en **R2** (Cloudflare) en el bucket `varsana-images`. Se suben via `POST /api/images` (multipart `file`). La API devuelve una URL publica que se usa en el frontmatter.

Ya no se usa Supabase Storage ni el script `scripts/upload-image.ts`.

## Cuando usar esta skill

- El usuario quiere subir una imagen para un evento, pasadia o miembro del equipo.
- Se esta creando contenido nuevo y necesita una imagen real (no placeholder).
- Se necesita reemplazar una imagen existente.

## Instrucciones

### 1. Identificar el contenido

Determinar para que contenido es la imagen y cual es su slug.

### 2. Subir via API

```bash
curl -X POST https://varsana-co.iaforchange.workers.dev/api/images \
  -F "file=@ruta/de/la/imagen.jpg"
```

Respuesta:
```json
{"ok":true,"url":"https://varsana-co.iaforchange.workers.dev/api/images/1718400000000-imagen.jpg","key":"1718400000000-imagen.jpg"}
```

### 3. Usar la URL en el frontmatter

```yaml
image: "https://varsana-co.iaforchange.workers.dev/api/images/1718400000000-imagen.jpg"
```

Cuando el sitio migre a `varsana.co`, reemplazar el dominio.

### 4. Verificar

```bash
curl -s -o /dev/null -w "%{http_code}" "<url>"
# Debe devolver 200
```

## Convencion de carpetas en R2

El bucket es plano (no tiene carpetas). El nombre del archivo incluye un timestamp para evitar colisiones: `<timestamp>-<nombre-original>`.

## Formato de imagenes

- Formatos aceptados: JPG, PNG, WebP, AVIF
- Sin limite de tamano (Cloudflare R2)
- Cache: inmutable (1 ano), forzar recarga con nuevo upload
