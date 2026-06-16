// src/pages/api/collections.ts
import type { APIRoute } from "astro";

// ─── Constantes ────────────────────────────────────────────────────────────────

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

const INTERNAL_PREFIX = "meta::";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extrae los nombres de las colecciones desde el data store serializado
 * que Astro genera en el build. No usa content.config.ts (evita dependencias
 * de Node.js que no funcionan en Cloudflare Workers).
 *
 * El data store se serializa como array plano con formato:
 *   ["Map", keyIdx1, valIdx1, ...], "colName1", [...], "colName2", [...]
 *
 * Las claves de nivel superior cuyos índices aparecen en las posiciones
 * impares del header (después de "Map") son los nombres de colección.
 */
function extractCollectionNames(data: any[]): string[] {
  const header = data?.[0];
  if (!Array.isArray(header) || header[0] !== "Map") return [];

  const names: string[] = [];
  for (let i = 1; i < header.length; i += 2) {
    const keyIndex = header[i] as number;
    const name = data[keyIndex];
    if (typeof name === "string" && !name.startsWith(INTERNAL_PREFIX)) {
      names.push(name);
    }
  }
  return names.sort();
}

function getEndpoints(name: string): Record<string, string> {
  return {
    list:   `/api/${name}`,
    detail: `/api/${name}?slug={slug}`,
  };
}

// ─── Endpoint ──────────────────────────────────────────────────────────────────

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Importamos el data store que Astro genera en el build — solo contiene
    // datos serializados, sin dependencias de Node.js (a diferencia de
    // content.config.ts que importa astro/loaders → glob → createRequire).
    const data = (await import("astro:data-layer-content")).default;

    const names = extractCollectionNames(data);

    const result = Object.fromEntries(
      names.map((name) => [
        name,
        {
          fields: {}, // Los esquemas Zod no están disponibles en runtime en Workers
          endpoints: getEndpoints(name),
        },
      ])
    );

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error("[GET /api/collections]", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
