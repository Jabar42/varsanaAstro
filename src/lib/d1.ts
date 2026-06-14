/**
 * Wrapper para el binding D1 de Cloudflare.
 * En Astro 6 + @astrojs/cloudflare, los bindings y secrets se importan
 * directamente desde el módulo virtual "cloudflare:workers".
 *
 * Uso:
 *   import { env } from "cloudflare:workers";
 *   const db = getDB(env);
 */

/**
 * Obtiene el binding D1 desde el objeto env de Cloudflare.
 */
export function getDB(env: Record<string, unknown>): D1Database {
  if (!env?.DB) {
    throw new Error("D1 binding (DB) not available in env");
  }
  return env.DB as D1Database;
}

/**
 * Obtiene una variable de entorno o secret del objeto env.
 */
export function getSecret(env: Record<string, unknown>, name: string): string {
  return (env[name] as string) || "";
}
