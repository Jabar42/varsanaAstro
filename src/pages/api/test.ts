import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ status: 'ok', message: 'API route working', timestamp: Date.now() }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ status: 'ok', message: 'POST API route working', timestamp: Date.now() }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
