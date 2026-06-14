import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

export const ALL: APIRoute = async ({ request, params }) => {
  const key = (params.key as string)?.replace(/^\//, "");

  const bucket = env.VARSANA_IMAGES as R2Bucket;

  // POST: upload an image
  if (request.method === "POST" && !key) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
        });
      }

      const uploadKey = `${Date.now()}-${file.name}`;
      const buffer = await file.arrayBuffer();
      await bucket.put(uploadKey, buffer, {
        httpMetadata: { contentType: file.type },
      });

      const imageUrl = `${new URL(request.url).origin}/api/images/${uploadKey}`;
      return new Response(JSON.stringify({ ok: true, url: imageUrl, key: uploadKey }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // GET: serve image by key
  if (key) {
    const object = await bucket.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(object.body, { headers });
  }

  return new Response("Images API", { status: 200 });
};
