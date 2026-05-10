import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Shared title validator: enforces sentence case and no emoji characters.
 */
const titleSchema = z.string().trim()
  .refine(val => !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(val), {
    message: 'Title must not contain emoji characters',
  })
  .refine(val => val.length === 0 || val[0] === val[0].toUpperCase(), {
    message: 'Title must start with an uppercase letter (sentence case)',
  });

const eventsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/events" }),
  schema: z.object({
    id: z.string(),
    title: titleSchema,
    description: z.string(),
    event_start: z.date(),
    event_end: z.date().optional(),
    image: z.string(),
    stock_max: z.number().int().positive(),
    prices: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        deadline: z.date().optional(),
      })
    ),
  }),
});

const pasadiasCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/pasadias" }),
  schema: z.object({
    id: z.string(),
    title: titleSchema,
    description: z.string(),
    image: z.string(),
    prices: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        deadline: z.date().optional(),
      })
    ),
    duration: z.string(),
    meeting_point: z.string(),
    category: z.string(),
    included_services: z.array(z.string()).optional().default([]),
  }),
});

const nosotrosCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/nosotros" }),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    rol: z.string(),
    descripcion: z.string(),
    imagen: z.string(),
    orden: z.number().int().min(0).optional().default(0),
    activo: z.boolean().optional().default(true),
    enlaces_sociales: z.array(
      z.object({
        plataforma: z.string(),
        url: z.string().url(),
      })
    ).optional().default([]),
    correo: z.string().email().optional(),
    telefono: z.string().optional(),
  }),
});

export const collections = {
  events: eventsCollection,
  pasadias: pasadiasCollection,
  nosotros: nosotrosCollection,
};
