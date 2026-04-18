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

const pasadiasCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/pasadias" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    prices: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
        deadline: z.date().optional(),
        stripePriceId: z.string().optional(),
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
