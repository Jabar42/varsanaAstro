/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    locale?: string;
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
  }
}
