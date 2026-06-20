// src/pages/api/collections.ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

// ─── Constantes ────────────────────────────────────────────────────────────────

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

const INTERNAL_PREFIX = "meta::";

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
  return { list: `/api/${name}`, detail: `/api/${name}?slug={slug}` };
}

/** Infiere tipos de campos desde los datos reales de la primera entrada. */
function inferFields(entry: any): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!entry?.data) return fields;
  const { body, slug, ...data } = entry.data;
  for (const [key, value] of Object.entries(data)) {
    const t = typeof value;
    if (t === "string") fields[key] = "string";
    else if (t === "number") fields[key] = "number";
    else if (t === "boolean") fields[key] = "boolean";
    else if (Array.isArray(value)) fields[key] = "array";
    else if (value instanceof Date) fields[key] = "date";
    else if (t === "object" && value !== null) fields[key] = "object";
  }
  return fields;
}

// ─── Endpoint ──────────────────────────────────────────────────────────────────

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = (await import("astro:data-layer-content")).default;
    const names = extractCollectionNames(data);

    const result: Record<string, any> = {};
    for (const name of names) {
      const entries = await getCollection(name as any);
      result[name] = {
        fields: entries.length > 0 ? inferFields(entries[0]) : {},
        endpoints: getEndpoints(name),
      };
    }

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
