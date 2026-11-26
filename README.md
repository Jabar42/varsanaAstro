# Varsana Eco Yoga Aldea — sitio web

Sitio de [Varsana](https://varsana-co.iaforchange.workers.dev) construido con **Astro 6** en modo SSR y desplegado en **Cloudflare Workers** (worker `varsana-co`), con **D1** (órdenes e inventario), **R2** (imágenes) y pagos con **Bold**.

## Requisitos

- Node.js 20+
- Cuenta de Cloudflare con acceso al worker (solo para desplegar)

## Desarrollo

```bash
npm install
cp .env.example .dev.vars   # completar secretos locales
npm run dev                 # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run lint` | `astro check` (tipos) + lint de clases Tailwind |
| `npm run test:bold` | Regresiones de autenticación, estados y webhook Bold |

**Publicación:** sólo commit + push a `main`; Cloudflare Git Integration despliega automáticamente. Nunca ejecutar `npm run deploy` ni `wrangler deploy` manual. Verificar después el Worker canónico.

## Idiomas

El sitio es bilingüe (español por defecto, inglés bajo `/en/...`). La URL manda: `/x` siempre es español y `/en/x` siempre inglés. Solo la raíz `/` redirige a `/en` según la cookie `varsana_locale` o el idioma del navegador en la primera visita. Detalles en `src/middleware.ts` y `src/i18n/`.

Para traducir una página: crea `src/i18n/dictionaries/<pagina>.ts` exportando `es` y `en`, y en la página usa `const t = useTranslations(getLocale(Astro))` → `t('<pagina>.clave')`.

## Contenido

Las colecciones viven en `src/content/` (`events`, `pasadias`, `blog`, `hospedaje`, `nosotros`) en formato Markdoc con esquema Zod en `src/content.config.ts`. Las guías para publicar contenido están en `.agents/` (`publish-new-event`, `publish-new-pasadia`, `publish-new-blog`, `publish-new-member`, `upload-image`).

## Más documentación

- `CLAUDE.md` — arquitectura, endpoints, variables de entorno
- `DESIGN.md` — sistema de diseño (tokens en `src/styles/design-tokens.css`)
- `docs/` — integración con Bold, emails transaccionales, decisiones
- [`docs/bold-payments.md`](docs/bold-payments.md) — contrato vigente, cambio de cuenta y ambientes de Bold
