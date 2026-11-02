/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Fijado por src/middleware.ts para toda página HTML. */
    locale?: 'es' | 'en';
  }
}

declare namespace Cloudflare {
  interface Env {
    [key: string]: unknown;
    // Assets (required by @astrojs/cloudflare)
    ASSETS: Fetcher;
    // Variables (wrangler.jsonc vars)
    ENVIRONMENT: string;
    PUBLIC_DONATION_URL: string;
    /** URL wss:// del gateway del agente de chat (túnel cloudflared). */
    PUBLIC_HERMES_WS_URL: string;
    // D1
    DB: D1Database;
    // R2
    VARSANA_IMAGES: R2Bucket;
    // Secrets
    BOLD_API_KEY: string;
    BOLD_SECRET_KEY: string;
    PUBLIC_SITE_URL: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
    /** Token requerido en `Authorization: Bearer` para POST /api/images. */
    IMAGES_UPLOAD_TOKEN: string;
  }
}

/**
 * Virtual module interno de Astro 6 (content layer data store).
 * Astro lo registra en Vite (`DATA_STORE_VIRTUAL_ID`) pero no publica su
 * declaración de tipos, así que `astro check` falla con TS2307 en
 * `src/pages/api/collections.ts`. El valor por defecto es el store aplanado
 * con `devalue` (o un `Map` en dev); se tipa de forma laxa a propósito
 * porque es API interna y su forma cambia entre versiones.
 */
declare module 'astro:data-layer-content' {
  const dataStore: any;
  export default dataStore;
}
