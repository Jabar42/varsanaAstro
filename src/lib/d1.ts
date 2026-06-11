/// <reference types="@cloudflare/workers-types" />

/**
 * Wrapper para el binding D1 y variables de entorno.
 * En Workers, los bindings y secrets están disponibles en `env`.
 * En páginas Astro SSR y API routes, se accede via `context.locals.runtime.env`.
 */

/**
 * Obtiene el binding D1 desde los locals de Astro.
 * Debe llamarse solo en server context (API routes, SSR pages).
 */
export function getDB(locals: any): D1Database {
  const env = locals?.runtime?.env;
  if (!env?.DB) {
    throw new Error('D1 binding (DB) not available in context');
  }
  return env.DB as D1Database;
}

/**
 * Obtiene el objeto `env` completo desde los locals de Astro.
 * Útil para acceder a secrets (BOLD_SECRET_KEY, BOLD_API_KEY, etc.)
 * y otros bindings que se necesiten en API routes.
 */
export function getEnv(locals: any): Record<string, unknown> {
  const env = locals?.runtime?.env;
  if (!env) {
    throw new Error('Cloudflare env not available in context');
  }
  return env as Record<string, unknown>;
}
