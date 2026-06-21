// src/pages/api/[collection].ts
import type { APIRoute } from "astro";
import { getCollection, type CollectionKey } from "astro:content";

// ─── Constantes ────────────────────────────────────────────────────────────────

const MAX_ITEMS = 10;

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
}

// ─── Endpoint ──────────────────────────────────────────────────────────────────

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const collectionName = params.collection as CollectionKey;
    const slug = new URL(request.url).searchParams.get("slug");
    const entries = await getCollection(collectionName);

    // Detalle de un registro específico
    if (slug) {
      const entry = entries.find((e) => e.id === slug);

      if (!entry) {
        return jsonResponse({ error: "Registro no encontrado" }, 404);
      }

      return jsonResponse({ slug: entry.id, ...entry.data, body: entry.body }, 200);
    }

    // Lista sin body, máximo MAX_ITEMS
    const list = entries.slice(0, MAX_ITEMS).map((e) => {
      const { body: _body, ...data } = e.data as any;
      return { slug: e.id, ...data };
    });

    return jsonResponse(list, 200);
  } catch (err) {
    console.error(`[GET /api/${params.collection}]`, err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
