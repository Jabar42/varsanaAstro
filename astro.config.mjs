import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import markdoc from "@astrojs/markdoc";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://varsana.com",
  adapter: cloudflare(),
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: "manual",
  },
  integrations: [react(), sitemap(), markdoc({ allowHTML: true })],
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
