import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import markdoc from "@astrojs/markdoc";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://varsana.com",
  adapter: vercel(),
  integrations: [react(), sitemap(), markdoc()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  build: {
    inlineStylesheets: "always",
  },
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
