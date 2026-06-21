import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

// ─── Constantes ────────────────────────────────────────────────────────────────

const MAX_EVENTS = 5;

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  // Reemplaza "*" por tu dominio si la API no es pública
  "Access-Control-Allow-Origin": "*",
};

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface EventData {
  event_start: string;
  body?: string;
  [key: string]: unknown;
}

type EventEntry = CollectionEntry<"events"> & { data: EventData };

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isFutureEvent(entry: EventEntry, now: Date): boolean {
  const start = entry.data.event_start;
  return !!start && new Date(start) > now;
}

function sortByDate(a: EventEntry, b: EventEntry): number {
  return (
    new Date(a.data.event_start).getTime() -
    new Date(b.data.event_start).getTime()
  );
}

function toListItem(entry: EventEntry): Omit<EventData, "body"> & { slug: string } {
  const { body: _body, ...data } = entry.data;
  return { slug: entry.id, ...data };
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
}

// ─── Endpoint ──────────────────────────────────────────────────────────────────

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const slug = new URL(request.url).searchParams.get("slug");
    const entries = (await getCollection("events")) as EventEntry[];
    const now = new Date();

    const upcoming = entries
      .filter((e) => isFutureEvent(e, now))
      .sort(sortByDate);

    // Detalle de un evento específico
    if (slug) {
      const entry = upcoming.find((e) => e.id === slug);

      if (!entry) {
        return jsonResponse({ error: "Evento no encontrado" }, 404);
      }

      return jsonResponse({ slug: entry.id, ...entry.data, body: entry.body }, 200);
    }

    // Listado de próximos eventos (sin body)
    const list = upcoming.slice(0, MAX_EVENTS).map(toListItem);
    return jsonResponse(list, 200);

  } catch (err) {
    console.error("[GET /api/events]", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
