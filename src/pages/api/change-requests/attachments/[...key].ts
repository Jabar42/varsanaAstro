/**
 * Sirve los adjuntos de una solicitud de cambio desde R2.
 *
 * GET /api/change-requests/attachments/<key>
 *
 * Solo lee objetos bajo el prefijo `change-requests/`: el bucket también
 * guarda las imágenes del sitio, y esta ruta no debe poder servir cualquiera.
 * La clave incluye un sufijo aleatorio (no enumerable) porque el link viaja
 * por Telegram y el formulario no tiene login.
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { ATTACHMENTS } from '@/src/lib/change-requests';

export const prerender = false;

const INLINE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf']);

export const GET: APIRoute = async ({ request, params }) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const key = String(params.key ?? '').replace(/^\/+/, '');
  if (!key || !key.startsWith(ATTACHMENTS.prefix)) {
    return new Response('Not found', { status: 404 });
  }

  const bucket = (env as unknown as Record<string, R2Bucket>).VARSANA_IMAGES;
  if (!bucket) return new Response('Not found', { status: 404 });

  const object = await bucket.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const type = object.httpMetadata?.contentType ?? 'application/octet-stream';
  const headers = new Headers();
  headers.set('Content-Type', type);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
  headers.set('Cache-Control', 'private, max-age=600');
  headers.set('ETag', object.httpEtag);
  // Imágenes y PDF se abren en el navegador; cualquier otra cosa se descarga.
  const name = object.customMetadata?.original ?? key.split('/').pop() ?? 'archivo';
  headers.set('Content-Disposition', `${INLINE.has(type) ? 'inline' : 'attachment'}; filename="${name.replace(/["\\]/g, '')}"`);

  if (request.method === 'HEAD') {
    headers.set('Content-Length', String(object.size));
    return new Response(null, { headers });
  }

  return new Response(object.body, { headers });
};
