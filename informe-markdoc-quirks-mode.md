# Informe: Página en blanco y Quirks Mode en despliegue de markdoc-design

**URL investigada:** `https://76897770-varsana-co.iaforchange.workers.dev/en/blog/museo-srila-prabhupada/`  
**Rama:** `markdoc-design`  
**Fecha:** 2026-06-22

---

## 1. Síntomas reportados

- Página completamente en blanco en el navegador
- Consola del navegador: "This page is in Quirks Mode. Page layout may be impacted. For Standards Mode use `<!DOCTYPE html>`"

## 2. Hallazgo principal

El Worker de Cloudflare **devuelve una respuesta HTTP completamente vacía** (0 bytes de body). Esto fue confirmado mediante:

- `WebFetch` contra la URL: respuesta sin contenido HTML
- `curl` contra la URL: sin output

Al no haber `<!DOCTYPE html>` en una respuesta vacía, el navegador entra en Quirks Mode e intenta renderizar cero contenido → página en blanco.

El Worker de producción (`varsana-co.iaforchange.workers.dev`, rama `main`) **sí funciona correctamente** y sirve el artículo completo con todos los headings, párrafos, navegación y footer.

## 3. Causa raíz

La rama `markdoc-design` tiene **nodos y tags Markdoc personalizados** que sobrecargan el renderizado estándar. Cuando uno de estos componentes falla durante el SSR en Cloudflare Workers, la excepción no es capturada y el Worker devuelve una respuesta vacía (HTTP 500 sin body).

### 3.1 Error específico identificado

El error que causa el crash en el runtime de Cloudflare Workers es:

```
Unable to render Astro.slot because it is undefined!
Did you forget to import the component or is it possible there is a typo?
```

Este error fue reproducido en modo dev local con `npx astro dev` y aparece cuando un componente Markdoc usa `<slot />` o `<Astro.slot />` pero el slot no recibe contenido adecuado en el entorno de Cloudflare Workers.

### 3.2 Componentes problemáticos

**Crash confirmado en Cloudflare Workers:** Tanto los tags (`{% lead %}`, `{% pullquote %}`) como los **nodos personalizados** (heading, paragraph, blockquote, link, list) usan `<slot />` para renderizar children. En el runtime `workerd` de Cloudflare, alguno(s) de estos componentes no recibe el slot correctamente y lanza `Astro.slot undefined`, lo que colapsa la respuesta HTTP completa a 0 bytes.

**Corroboración:** Se eliminaron los tags `{% lead %}`/`{% pullquote %}` del contenido y del config (`d566bbb`), se desplegó automáticamente vía Cloudflare CI/CD, y la página **seguía en blanco**. Esto descarta que el problema fuera exclusivo de esos tags. El crash persiste con los nodos personalizados activos.

**Mecanismo:** Los componentes que sobrecargan nodos estándar de Markdoc (heading, paragraph, blockquote, link, list) usan `<slot />` para recibir el contenido renderizado. En el entorno de build local y en `astro dev` ocasionalmente funcionan, pero en el runtime de producción de Cloudflare Workers (`workerd`) el slot no se resuelve correctamente, causando una excepción no capturada que vacía la respuesta HTTP.

## 4. Estado de la rama markdoc-design

La rama tiene 3 commits:

| Commit | Descripción | ¿Funciona? |
|--------|-------------|------------|
| `4a67114` | feat: nodos y tags Markdoc personalizados | ❌ Nodos + tags crashean Cloudflare Workers |
| `7032900` | intentos de arreglo (ignoreIndentation, ...nodes.*) | ❌ No resolvió el crash |
| `d566bbb` | fix: eliminar tags lead/pullquote, usar CSS nativo | ❌ Nodos siguen activos, siguen crasheando |

El HEAD actual (`d566bbb`) eliminó los tags `{% lead %}`/`{% pullquote %}` pero **mantuvo los 6 nodos personalizados** (heading, paragraph, image, blockquote, link, list). Estos nodos también usan `<slot />` y causan el mismo crash en Cloudflare Workers.

**Fix aplicado en este momento (aún no commiteado):** Se eliminaron todos los nodos personalizados del `markdoc.config.mjs`, dejando solo los tags originales (`callout`, `locationcard`) que no usan `<slot />` y funcionan correctamente. Build exitoso.

## 6. Corrección final

### 6.1 Qué se hizo

Se restauró `markdoc.config.mjs` a su estado original (solo tags `callout` y `locationcard`), eliminando todos los nodos personalizados y los tags `lead`, `pullquote`, `figure`. Los archivos de componente (Heading.astro, Paragraph.astro, etc.) se conservan en disco para referencia futura pero no están registrados en el config.

```js
// markdoc.config.mjs actual (funcional)
export default defineMarkdocConfig({
  tags: {
    callout: { ... },
    locationcard: { ... },
  },
});
```

### 6.2 Pasos para desplegar

```bash
git checkout markdoc-design
git add markdoc.config.mjs
git commit -m "fix: eliminar nodos Markdoc personalizados que crashean Cloudflare Workers
- Los nodos (heading, paragraph, etc.) usan <slot /> que no se resuelve en workerd
- El resultado es respuesta HTTP vacia -> Quirks Mode -> pagina en blanco"
git push
```

Cloudflare detectará el push y desplegará automáticamente.

### 6.3 A futuro

Para reintroducir el diseño tipográfico en las colecciones, hay que probar los componentes Markdoc **uno por uno** en Cloudflare Workers (no solo en dev local), empezando por los que NO usan `<slot />` (como `Image.astro`). Los componentes basados en slot (Heading, Paragraph, Blockquote, Link, List) requieren que `workerd` soporte correctamente la cadena de slots de Markdoc.

## 7. Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run build` en markdoc-design | ✅ Exitoso |
| Worker producción (main) | ✅ Sirve la página completa |
| Worker preview (76897770) | ❌ Respuesta vacía (0 bytes) |
| Contenido blog sin {% lead %}/{% pullquote %} | ✅ Sin errores |
| Nodos personalizados (heading, paragraph, etc.) | ✅ Funcionan en build |
