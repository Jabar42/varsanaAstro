---
name: create-content-collection-schema
description: Teaches how to create new content collection schemas in Astro, following the patterns for events and pasadías. Use when the user wants to add a new type of content (e.g., workshops, blogs) to the Varsana website.
---
# Adding a New Content Collection Schema in Astro

This skill provides a step‑by‑step guide for creating a new content collection schema in the Varsana Astro project, following the established patterns of the `events` and `pasadías` collections.

## 1. Understand the Existing Structure

Before adding a new collection, examine how the current collections are defined. For detailed analysis of configuration, schema‑generated JSON, content directories, helper libraries, and page structure, see [Existing Structure](references/existing-structure.md).

## 2. Define the New Schema in `content.config.ts`

Follow the step‑by‑step instructions and example in [Define the New Schema](references/define-schema.md).

## 3. Create the Content Directory

Create a new folder under `src/content/` with the same name used in the loader’s `base` path.

```bash
mkdir -p src/content/workshops
```

## 4. Update TypeScript Types (Automatic)

Astro automatically generates TypeScript types for your collection based on the schema. After saving `content.config.ts`, the types will be available in `astro:content` via `getCollection('workshops')`. No manual type definitions are required.

You can verify the generated types by checking `src/env.d.ts` (it should already reference `astro/client`).

## 5. Create Listing and Detail Pages (Optional)

If you want the new collection to have its own pages, replicate the pattern used for events or pasadías. For detailed examples of listing and detail pages, see [Listing and Detail Pages](references/listing-detail-pages.md).

## 6. Create a Helper Library (Optional)

For convenience, add a dedicated library in `src/lib/workshops.ts`:

```ts
import { getCollection } from 'astro:content';

export async function getAllWorkshops() {
  const all = await getCollection('workshops');
  return all.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export async function getUpcomingWorkshops() {
  const all = await getCollection('workshops');
  const now = new Date();
  return all
    .filter(w => new Date(w.data.date) >= now)
    .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());
}
```

## 7. Test the New Collection

1. Create a sample markdown file in `src/content/workshops/` (e.g., `yoga‑inicial.md`) with front‑matter that matches your schema.
2. Start the development server (`npm run dev`) and navigate to `/workshops` (if you created a listing page) or directly to the entry ID.
3. Verify that the data is loaded correctly and that the pages render without errors.

## 8. Summary

You have now:
- Added a new schema definition in `src/content.config.ts`
- Created a content directory for the collection
- (Optional) Added listing/detail pages and a helper library

The new collection is fully integrated into the Astro content layer and can be queried with `getCollection('<collectionName>')`.

## Reference Files

- [`src/content.config.ts`](../src/content.config.ts) – main configuration
- [`src/content/events/`](../src/content/events/) – example content files
- [`src/pages/events/`](../src/pages/events/) – example pages
- [`src/lib/events.ts`](../src/lib/events.ts) – example data‑fetching functions
- [`.astro/collections/events.schema.json`](../.astro/collections/events.schema.json) – generated JSON‑Schema

Use these references as templates when creating your own collection.

**See also:** [`design‑guidelines`](../design-guidelines/SKILL.md).