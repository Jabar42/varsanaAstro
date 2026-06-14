import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const prerender = false;

const server = new McpServer({
  name: "varsana-mcp",
  version: "1.0.0",
});

server.registerTool(
  "get_collection",
  {
    description:
      "Consulta datos de una coleccion de Varsana: 'events' para retiros, 'pasadias' para experiencias de un dia, 'nosotros' para el equipo. Sin slug devuelve hasta 5 entradas (sin la descripcion larga). Con slug devuelve el detalle completo.",
    inputSchema: {
      type: "object",
      properties: {
        collection: {
          type: "string",
          enum: ["events", "pasadias", "nosotros"],
          description: "Coleccion a consultar",
        },
        slug: {
          type: "string",
          description: "Slug para obtener detalle completo (opcional)",
        },
      },
      required: ["collection"],
    },
  },
  async ({ collection, slug }) => {
    const entries = await getCollection(
      collection as "events" | "pasadias" | "nosotros",
    );

    let filtered = entries;
    if (collection === "events") {
      const now = new Date();
      filtered = entries.filter((e) => {
        const start = (e.data as any).event_start;
        return start && new Date(start) > now;
      });
      filtered.sort(
        (a, b) =>
          new Date((a.data as any).event_start).getTime() -
          new Date((b.data as any).event_start).getTime(),
      );
    }

    if (slug) {
      const entry = filtered.find((e) => e.id === slug);
      if (!entry) {
        return { content: [{ type: "text" as const, text: JSON.stringify({ error: "not found" }) }] };
      }
      return { content: [{ type: "text" as const, text: JSON.stringify({ slug: entry.id, ...entry.data }) }] };
    }

    const list = filtered.slice(0, 5).map((e) => {
      const { body, ...data } = e.data as any;
      return { slug: e.id, ...data };
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(list) }] };
  },
);

// Astro API route handler
export const ALL: APIRoute = async ({ request }) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });
  
  await server.connect(transport);
  
  // Let the transport handle the request
  const response = await transport.handleRequest(request);
  
  await transport.close();
  
  if (response) {
    // Ensure CORS headers for cross-origin access from the agent
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "*");
    return response;
  }
  
  return new Response("MCP endpoint", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/plain",
    },
  });
};
