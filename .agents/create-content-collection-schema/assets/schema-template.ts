// Schema template for a new content collection in Astro.
// Copy this template into `src/content.config.ts` and adapt fields.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro:schema';

const myCollection = defineCollection({
  // Update the `base` path to match your content directory name.
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/my-collection" }),
  schema: z.object({
    // Required fields
    title: z.string(),
    description: z.string(),
    image: z.string(),
    // Optional fields
    date: z.date().optional(),
    duration: z.string().optional(),
    prices: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        deadline: z.date().optional(),
        stripePriceId: z.string().optional(),
      })
    ).optional().default([]),
    // Add any custom fields needed for your collection.
    // Use appropriate Zod validators: z.string(), z.number(), z.boolean(), z.array(...), etc.
  }),
});

// Remember to export the collection in the `collections` object.
// Example:
// export const collections = {
//   events: eventsCollection,
//   pasadias: pasadiasCollection,
//   myCollection: myCollection,
// };