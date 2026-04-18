## 2. Define the New Schema in `content.config.ts`

1. Open [`src/content.config.ts`](../src/content.config.ts).
2. Add a new constant for your collection, following the same pattern as `eventsCollection` and `pasadiasCollection`.

**Example – adding a `workshops` collection:**

```ts
const workshopsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/workshops" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    instructor: z.string(),
    date: z.date(),
    duration: z.string(),
    image: z.string(),
    prices: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        deadline: z.date().optional(),
        stripePriceId: z.string().optional(),
      })
    ),
    prerequisites: z.array(z.string()).optional().default([]),
  }),
});
```

3. Add the new collection to the `collections` export:

```ts
export const collections = {
  events: eventsCollection,
  pasadias: pasadiasCollection,
  workshops: workshopsCollection,   // ← new entry
};