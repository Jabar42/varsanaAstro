## 1. Understand the Existing Structure

Before adding a new collection, examine how the current collections are defined.

### 1.1 Configuration File
The main content configuration lives in [`src/content.config.ts`](../src/content.config.ts). Open it and observe the pattern:

```ts
const eventsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // … additional fields
  }),
});
```

Each collection has:
- A `loader` that points to the directory where markdown files are stored.
- A `schema` that defines the required front‑matter fields using Zod.

### 1.2 Schema‑Generated JSON
Astro automatically generates JSON‑Schema files in [`.astro/collections/`](../.astro/collections/):
- `events.schema.json`
- `pasadias.schema.json`

These files are used by the Astro content layer for validation and editor support.

### 1.3 Content Directories
Content files are stored in `src/content/<collectionName>/`. Each markdown file must contain a front‑matter block that matches the schema.

Example event file: [`src/content/events/ceremonia‑equinoccio.md`](../src/content/events/ceremonia-equinoccio.md)

```yaml
---
title: "Ceremonia de Equinoccio"
description: "Ritual ancestral…"
event_date: 2026‑09‑21
image: "https://picsum.photos/…"
prices:
  - label: "General"
    amount: 50000
---
```

### 1.4 Helper Libraries
Each collection typically has a corresponding library in `src/lib/` that provides data‑fetching functions:
- [`src/lib/events.ts`](../src/lib/events.ts) – `getUpcomingEvents`, `getCurrentPrice`
- [`src/lib/pasadias.ts`](../src/lib/pasadias.ts) – `getAllPasadias`, `getPasadiasByCategory`

### 1.5 Listing & Detail Pages
Pages for rendering the collection are found in `src/pages/<collectionName>/`:
- `index.astro` – lists all items
- `[slug].astro` – displays a single item