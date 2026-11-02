import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

/** Comparación en tiempo constante para tokens. */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export const ALL: APIRoute = async ({ request, params }) => {
  const key = (params.key as string)?.replace(/^\//, "");

  const bucket = env.VARSANA_IMAGES as R2Bucket;

  // POST: upload an image. Requiere `Authorization: Bearer <IMAGES_UPLOAD_TOKEN>`.
  // Si el secreto no está configurado, la subida queda deshabilitada (fail closed).
  if (request.method === "POST" && !key) {
    const expected = env.IMAGES_UPLOAD_TOKEN as string | undefined;
    const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!expected || !provided || !timingSafeEqual(provided, expected)) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" },
      });
    }
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
        });
      }

      // Validate: WebP only, max 150 KB
      const MAX_SIZE = 150 * 1024;
      if (file.type !== "image/webp") {
        return new Response(JSON.stringify({
          error: "Solo se aceptan WebP. Convierte: cwebp -q 75 imagen.jpg -o imagen.webp",
        }), { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return new Response(JSON.stringify({
          error: `Imagen de ${(file.size / 1024).toFixed(0)} KB. Maximo: 150 KB. Reduce con cwebp -q 50 o redimensiona.`,
        }), { status: 400 });
      }

      const uploadKey = `${Date.now()}-${file.name.replace(/\.(jpe?g|png|gif|avif)$/i, ".webp")}`;
      const buffer = await file.arrayBuffer();
      await bucket.put(uploadKey, buffer, {
        httpMetadata: { contentType: "image/webp" },
      });

      const imageUrl = `/api/images/${uploadKey}`;
      return new Response(JSON.stringify({ ok: true, url: imageUrl, key: uploadKey }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // Solo GET/HEAD para servir; cualquier otro método no está permitido.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD, POST" } });
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
