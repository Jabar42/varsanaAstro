# Pasadias (Day Trips) Architecture Design

## Overview
This document outlines the design for adding "pasadias" (day trips) functionality to the Varsana Astro project, following the pattern established by the existing events system. Pasadias are single‑day experiences with specific attributes such as duration, meeting point, and itinerary.

## 1. Schema Design

### Zod Schema (`src/content.config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pasadiasCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/pasadias" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
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

export const collections = {
  events: eventsCollection,
  pasadias: pasadiasCollection,
};
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Name of the pasadia. |
| `description` | string | Yes | Short summary for cards and SEO. |
| `date` | Date | Yes | The day the pasadia takes place. |
| `image` | string | Yes | URL of the hero image. |
| `prices` | array of objects | Yes | Price tiers, each with `label`, `amount`, optional `deadline`, optional `stripePriceId`. |
| `duration` | string | Yes | Human‑readable duration (e.g., “Full day”, “8 hours”). |
| `meeting_point` | string | Yes | Where participants should gather. |
| `category` | string | Yes | Single category for filtering (e.g., “nature”, “cultural”, “spiritual”). |
| `included_services` | string[] | No | List of services included in the experience (default empty). |

### Example Frontmatter (`src/content/pasadias/example.md`)

```yaml
---
title: "Caminata Ecológica por la Montaña"
description: "Una jornada de conexión con la naturaleza a través de senderos ancestrales."
date: 2026-05-20
image: "https://picsum.photos/seed/caminata/1600/1000"
prices:
  - label: "General"
    amount: 75000
  - label: "Preventa"
    amount: 65000
    deadline: 2026-05-10
duration: "8 horas"
meeting_point: "Entrada principal de Varsana, Granada, Cundinamarca"
category: "naturaleza"
included_services:
  - "Guía especializado"
  - "Almuerzo vegetariano"
  - "Materiales para la caminata"
---
```

## 2. Directory Structure

```
src/content/
  events/           # Existing event markdown files
  pasadias/         # New directory for pasadia markdown files
    example.md
    otra-pasadia.md
```

- All pasadia markdown files reside under `src/content/pasadias/`.
- The file name becomes the URL slug (e.g., `caminata-ecologica.md` → `/pasadias/caminata-ecologica`).

## 3. Component Strategy

### New Components

1. **`PasadiaCard.astro`**  
   - Based on `EventCard.astro` but adds `duration` and `meeting_point` fields.
   - Uses the same visual style (rounded card, hover effects, price display).
   - Located in `src/components/PasadiaCard.astro`.

2. **`PasadiaDetail.astro` (optional)**  
   - Not required initially; the detail page can be built directly in `src/pages/pasadias/[slug].astro` using the same layout as the event detail page.

### Reused Components

- `Header.astro`, `Footer.astro` – unchanged.
- `CategoryBar.astro` – will be updated to link to `/pasadias`.

## 4. Page Designs

### Listing Page (`src/pages/pasadias/index.astro`)

- **Purpose**: Display all upcoming pasadias in a responsive grid.
- **Layout**: Header → main content → Footer (no CategoryBar).
- **Features**:
  - Fetches pasadias via `getUpcomingPasadias()` (filters past dates, sorts ascending).
  - Grid of `PasadiaCard` components.
  - Optional category filter (can be added later).
- **Fallback**: Message when no upcoming pasadias exist.

### Detail Page (`src/pages/pasadias/[slug].astro`)

- **Purpose**: Show full details of a single pasadia.
- **Layout**: Similar to `src/pages/events/[slug].astro` but with extra sections for duration, meeting point, and included services.
- **Sections**:
  1. Hero image.
  2. Title, date, meeting point (with icon), duration (with icon).
  3. Description and markdown body.
  4. Included services list.
  5. Pricing card (using `getCurrentPrice`).
- **SEO**: Dynamic title, description, and OpenGraph tags.

## 5. Helper Functions (`src/lib/pasadias.ts`)

Create a new helper file mirroring `src/lib/events.ts`.

```typescript
import { getCollection } from 'astro:content';

/**
 * Returns all pasadias whose date is today or in the future,
 * sorted by date (earliest first).
 */
export async function getUpcomingPasadias() {
  const allPasadias = await getCollection('pasadias');
  const now = new Date();

  return allPasadias
    .filter(pasadia => {
      const pasadiaDate = new Date(pasadia.data.date);
      return pasadiaDate >= now;
    })
    .sort((a, b) => {
      return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
    });
}

/**
 * Returns pasadias belonging to a specific category.
 */
export async function getPasadiasByCategory(category: string) {
  const allPasadias = await getCollection('pasadias');
  return allPasadias.filter(p => p.data.category === category);
}

/**
 * Returns a single pasadia by its slug.
 */
export async function getPasadiaBySlug(slug: string) {
  const allPasadias = await getCollection('pasadias');
  return allPasadias.find(p => p.id === slug);
}

// Reuse the existing price‑selection logic (could be moved to a shared utility)
export { getCurrentPrice } from './events';
```

## 6. Integration Plan

### Navigation Updates

1. **CategoryBar** (`src/components/CategoryBar.astro`)  
   Change the href for “Pasadias” from `'/'` to `'/pasadias'`.

2. **Footer** (`src/components/Footer.astro`)  
   Update “Pasadías Ecológicos” list item to be a clickable link pointing to `/pasadias`.

3. **Header** – no changes required.

### Page Inclusion

- The listing page will be accessible at `/pasadias`.
- Detail pages will be generated at `/pasadias/[slug]`.
- No CategoryBar will be displayed on pasadias pages (consistent with events pages).

### Styling Consistency

- All new pages and components will follow the existing design system defined in `DESIGN.md`.
- Use the same color palette, typography, and spacing as the events section.

## 7. Implementation Steps (High‑Level)

1. **Schema & Configuration**
   - Add the new collection to `src/content.config.ts`.
   - Create the `src/content/pasadias/` directory.

2. **Helper Functions**
   - Create `src/lib/pasadias.ts` with the functions described above.

3. **Components**
   - Create `src/components/PasadiaCard.astro`.
   - (Optional) Create a reusable detail component.

4. **Pages**
   - Create `src/pages/pasadias/index.astro`.
   - Create `src/pages/pasadias/[slug].astro`.

5. **Integration**
   - Update `CategoryBar.astro` and `Footer.astro`.
   - Verify that all links work and the new routes are accessible.

6. **Content Migration**
   - Write example pasadia markdown files.
   - Test the listing and detail pages.

## 8. Open Questions & Future Enhancements

- **Filtering**: The listing page could later add a category‑filter UI (dropdown or tabs).
- **Search**: Integrate with a site‑wide search.
- **Booking Flow**: Connect the “Reservar” button to a Stripe checkout (same as events).
- **Multi‑day pasadias**: Currently designed for single‑day trips; could be extended with `start_date`/`end_date` fields.

## Conclusion
This design provides a solid foundation for the pasadias feature, leveraging the existing events infrastructure while adding day‑trip‑specific fields. The implementation can be carried out in a modular, step‑by‑step fashion, ensuring consistency with the overall Varsana design system.