import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "@/src/lib/d1";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const boldOrderId = url.searchParams.get("bold-order-id");

  if (!boldOrderId) {
    return new Response(JSON.stringify({ status: "not_found" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDB(env);
  const row = await db
    .prepare("SELECT status FROM orders WHERE bold_order_id = ?")
    .bind(boldOrderId)
    .first<{ status: string }>();

  if (!row) {
    return new Response(JSON.stringify({ status: "not_found" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: row.status }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
