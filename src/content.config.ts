import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const eventsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    event_date: z.date(),
    image: z.string(),
    prices: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        deadline: z.date().optional(),
        stripePriceId: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  events: eventsCollection,
};
