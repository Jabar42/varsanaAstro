import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import markdoc from "@astrojs/markdoc";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://varsana.com",
  // "ignore" para que la petición llegue al middleware, que redirige 301 la barra final.
  trailingSlash: "ignore",

  adapter: cloudflare(),
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: "manual",
  },
  // El sitemap se genera en src/pages/sitemap.xml.ts (en SSR @astrojs/sitemap queda vacío).
  integrations: [react(), markdoc({ allowHTML: true })],

  build: {
    inlineStylesheets: "always",
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["agents", "@modelcontextprotocol"],
    },
  },
});
