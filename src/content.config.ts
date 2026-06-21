import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
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

/** Shared schema for locale-aware content. */
const localizableSchema = z.object({
  locale: z.enum(['es', 'en']).optional().default('es'),
});

/** Shared schema for collections that can appear in the featured slider. */
const destacableSchema = z.object({
  destacado: z.boolean().optional().default(false),
  orden: z.number().int().min(0).optional().default(0),
});

/** Reusable price tier schema. */
const priceSchema = z.object({
  label: z.string(),
  amount: z.number(),
  deadline: z.date().optional(),
});

const pricesSchema = z.array(priceSchema);

const eventsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdoc', base: './src/content/events' }),
  schema: localizableSchema.merge(destacableSchema).merge(z.object({
    title: titleSchema,
    description: z.string(),
    event_start: z.date(),
    event_end: z.date().optional(),
    image: z.string(),
    stock_max: z.number().int().positive(),
    prices: pricesSchema,
  })),
});

const pasadiasCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdoc', base: './src/content/pasadias' }),
  schema: localizableSchema.merge(destacableSchema).merge(z.object({
    title: titleSchema,
    description: z.string(),
    image: z.string(),
    prices: pricesSchema,
    stock_max: z.number().int().positive(),
    duration: z.string(),
    meeting_point: z.string(),
    category: z.string(),
    included_services: z.array(z.string()).optional().default([]),
  })),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdoc', base: './src/content/blog' }),
  schema: localizableSchema.merge(destacableSchema).merge(z.object({
    title: titleSchema,
    description: z.string(),
    image: z.string(),
    date: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional().default([]),
  })),
});

const nosotrosCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdoc', base: './src/content/nosotros' }),
  schema: localizableSchema.merge(z.object({
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
      }),
    ).optional().default([]),
    correo: z.string().email().optional(),
    telefono: z.string().optional(),
  })),
});

export const collections = {
  events: eventsCollection,
  pasadias: pasadiasCollection,
  nosotros: nosotrosCollection,
  blog: blogCollection,
};
