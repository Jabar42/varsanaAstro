import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  const entries = await getCollection("events");

  // Filtrar eventos futuros, ordenar por fecha
  const now = new Date();
  const upcoming = entries
    .filter((e) => {
      const start = (e.data as any).event_start;
      return start && new Date(start) > now;
    })
    .sort(
      (a, b) =>
        new Date((a.data as any).event_start).getTime() -
        new Date((b.data as any).event_start).getTime(),
    );

  if (slug) {
    const entry = upcoming.find((e) => e.id === slug);
    if (!entry) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    return new Response(JSON.stringify({ slug: entry.id, ...entry.data }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const list = upcoming.slice(0, 5).map((e) => {
    const { body, ...data } = e.data as any;
    return { slug: e.id, ...data };
  });

  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};
