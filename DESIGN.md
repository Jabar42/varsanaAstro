---
name: "Varsana Eco-Wellness"
description: "A spiritual sanctuary design system blending Airbnb's photography-forward warmth with Hindu, yoga, and wellness aesthetics. Sacred Sand canvas, dual typography (Proza Libre + Inter), organic geometry, and breathable spacing."

colors:
  primary: "#52185B"
  rausch: "#52185B"
  rausch-dark: "#3A1241"
  rausch-light: "#97448E"
  secondary: "#F7941E"
  saffron: "#F7941E"
  saffron-light: "#FAAF3E"
  forest: "#779B05"
  forest-dark: "#5A7A04"
  forest-light: "#95AD02"
  near-black: "#222222"
  secondary-gray: "#6A6A6A"
  sacred-sand: "#FAF9F6"
  lotus-white: "#FFFFFF"
  light-surface: "#F7F7F7"

typography:
  hero-heading:
    fontFamily: "Proza Libre"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em
  section-title:
    fontFamily: "Proza Libre"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
  card-title:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.02em
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  metadata:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.02em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2

rounded:
  sm: 8px
  DEFAULT: 16px
  md: 24px
  lg: 32px
  full: 9999px

spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 64px
  section: 80px
  gutter: 24px

components:
  card:
    backgroundColor: "{colors.lotus-white}"
    textColor: "{colors.near-black}"
    rounded: "{rounded.lg}"
    padding: 24px
  background-page:
    backgroundColor: "{colors.sacred-sand}"
    textColor: "{colors.near-black}"
  surface-alternate:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.near-black}"
  text-muted:
    textColor: "{colors.secondary-gray}"
    typography: metadata
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.lotus-white}"
    typography: button
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.rausch-dark}"
    textColor: "{colors.lotus-white}"
    typography: button
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.forest-dark}"
    textColor: "{colors.lotus-white}"
    typography: button
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-saffron:
    backgroundColor: "{colors.saffron}"
    textColor: "{colors.near-black}"
    typography: button
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.near-black}"
    typography: button
    rounded: "{rounded.DEFAULT}"
    padding: "12px 24px"
  tag-spiritual:
    backgroundColor: "{colors.saffron-light}"
    textColor: "{colors.near-black}"
    typography: metadata
    rounded: "{rounded.full}"
    padding: "4px 12px"
  tag-nature:
    backgroundColor: "{colors.forest-light}"
    textColor: "{colors.near-black}"
    typography: metadata
    rounded: "{rounded.full}"
    padding: "4px 12px"
  icon-nature:
    textColor: "{colors.forest}"
  link:
    textColor: "{colors.rausch}"
    typography: body
  link-hover:
    textColor: "{colors.rausch-light}"
    typography: body
---

## Overview

The Varsana design system evolves the warm, photography-forward foundation of Airbnb into a **Spiritual Sanctuary**. It maintains the clean, airy feel of a travel magazine but infuses it with a "soulful" atmosphere inspired by Hindu tradition, yoga, and wellness.

The foundation shifts from pure white to **Sacred Sand** (`#FAF9F6`) — a warmer, more organic off-white that reduces digital glare and feels like natural linen. The iconic **Rausch Red** (`#52185B`) anchors primary actions, while **Saffron Wisdom** (`#F7941E`) and **Forest Prana** (`#779B05`) represent spiritual energy and nature.

**Key Characteristics:**
- **Sacred Sand Canvas** — softer, more organic feel than pure white
- **Dual Typography** — Proza Libre for soulful headings, Inter for crisp body text
- **Spiritual Accents** — Saffron for highlights and yoga tags, Forest for nature and volunteering
- **Organic Geometry** — 24–32px border-radius and subtle squircle shapes
- **Breathable Spacing** — increased whitespace (~20% more than standard layouts) for calm
- **Slow Transitions** — 0.6–0.8s ease-in-out for graceful, soothing motion

## Colors

### Brand Colors

Three primary brand colors anchor the identity:

- **Rausch Red** (`#52185B`) — the dominant CTA and brand accent. A deep, warm purple that conveys grounded spirituality. Use for primary buttons, links, and key brand moments.
- **Saffron Wisdom** (`#F7941E`) — the spiritual accent. Evokes marigold garlands, monk robes, and sacred fire. Use for highlights, tags, yoga-related elements, and hover glows.
- **Forest Prana** (`#779B05`) — the nature accent. Represents the surrounding farmland, orchards, and eco-conscious values. Use for nature activities, volunteering, and secondary CTAs.

### Light Tones

Lighter variants for gradients, hover states, and subtle highlights:

- **Rausch Red Light** (`#97448E`) — lifted purple for hover states and gradient stops
- **Saffron Wisdom Light** (`#FAAF3E`) — warm glow for saffron hover states
- **Forest Prana Light** (`#95AD02`) — brightened green for hover and accents

### Neutrals

A warm-shifted neutral scale replaces harsh pure-black and cool-gray:

- **Near Black** (`#222222`) — primary text. Warmer and softer than `#000`, grounded and approachable.
- **Secondary Gray** (`#6A6A6A`) — descriptions, metadata, and supporting text.
- **Sacred Sand** (`#FAF9F6`) — page background. An organic off-white with warm undertones.
- **Lotus White** (`#FFFFFF`) — card surfaces and elevated containers. Pure white for contrast against the sand background.
- **Light Surface** (`#F7F7F7`) — subtle surface variation for alternating sections.

## Typography

The system uses a dual-font strategy: **Proza Libre** for headings (the "voice of wisdom") and **Inter** for body and UI (the "voice of clarity").

### Font Families

| Role | Family | Purpose |
|------|--------|---------|
| Display | Proza Libre | Headings H1–H6, hero text, section titles |
| Sans | Inter | Body text, UI elements, buttons, labels, metadata |

Proza Libre is served locally as woff2 (weights 400–800). Inter is loaded via Google Fonts as a variable font for optimal performance.

### Hierarchy

| Token | Size / Weight | Letter Spacing | Usage |
|-------|---------------|----------------|-------|
| Hero Heading | 64px+ / 700 | -0.01em | Homepage hero, landing banners |
| Section Title | 36px / 700 | normal | Page sections, feature titles |
| Card Title | 20px / 600 | -0.02em | Event cards, pasadia cards, info cards |
| Body | 16px / 400 | normal | Paragraphs, descriptions, long-form text |
| Metadata | 14px / 500 | 0.02em | Dates, prices, tags, captions |
| Button | 16px / 600 | normal | All button and CTA text |

### Rules

- Proza Libre exclusively for headings (H1–H6). Never use Inter for headings.
- Inter exclusively for body text, UI labels, buttons, and metadata. Never use Proza Libre for body copy.
- Maintain hierarchy: never skip from Hero directly to Body without an intermediate heading level.
- On mobile, scale heading sizes down proportionally (hero ~48px, section title ~28px).

## Layout

The layout philosophy favors **organic asymmetry** over rigid, symmetrical grids. The goal is a space that feels hand-arranged rather than machine-generated.

### Grid System

- Desktop: 12-column grid with 24px (`gutter`) gaps
- Content max-width: 1280px centered, with generous outer margins
- Mobile: single-column layout with 16px (`px-4`) side padding

### Vertical Rhythm

Spacing follows an 8px base unit. Section spacing is inflated ~20% above standard web layouts:

- Section separation: 80px (`section`) on desktop, 48px on mobile
- Card gaps: 24px (`md`) in grid layouts
- Internal card padding: 24px (`md`)
- Paragraph spacing: 16px (relaxed from typical 12px)

### Asymmetry

- Prefer staggered grids (e.g., one column offset by 50% of card height) over uniform grids
- Use intentional offsets rather than centering everything
- Overlapping elements (image + text block) are encouraged when tasteful
- Break symmetry at the section level — alternate left-aligned and right-anchored content

### Responsive Breakpoints

| Breakpoint | Min Width | Layout Behavior |
|------------|-----------|-----------------|
| sm | 640px | Two-column grid possible |
| md | 768px | Sidebar layouts viable |
| lg | 1024px | Full 12-column grid, multi-column |
| xl | 1280px | Maximum content width reached |

Touch targets must be at least 44px on mobile.

## Elevation & Depth

The elevation system uses a single, carefully tuned **Airbnb-style layered shadow** that creates depth without harsh outlines.

### Shadow Token

```
0 0 0 1px rgba(0,0,0,0.02),
0 2px 6px rgba(0,0,0,0.04),
0 4px 8px rgba(0,0,0,0.10)
```

Three layers work together: a hairline border (1px, 2% opacity) defines the edge, a tight blur (2px, 4%) adds proximity depth, and a wider blur (4px, 10%) creates ambient separation.

### Depth Levels

| Level | Usage | Behavior |
|-------|-------|----------|
| Base | Page background (Sacred Sand) | Flat, no shadow |
| Elevated | Cards, modals, dialogs | Airbnb shadow on Lotus White |
| Interactive | Hovered/focused cards | Shadow deepens + saffron glow (0 8px 24px rgba(247,148,30,0.12)) |

Cards lift on hover with `scale(1.02)` and a warm saffron-tinted shadow expansion. The transition is 0.6s ease-in-out for a slow, organic response.

### Z-Index Stack

| Layer | z-index | Usage |
|-------|---------|-------|
| Content | auto | Default page content |
| Sticky header | 40 | Main navigation bar |
| Overlay | 50 | Modals, drawers, dropdowns |

## Shapes

The system uses generous, consistent border-radius values that soften the interface without becoming cartoonish.

### Radius Scale

| Token | Value | Application |
|-------|-------|-------------|
| sm | 8px | Input fields, small badges, inline tags |
| DEFAULT | 16px | Buttons, form elements, small containers |
| md | 24px | Standard cards, modals |
| lg | 32px | Large cards, hero images, featured content |
| full | 9999px | Pills, status badges, avatar crops |

### Guidelines

- Cards use the airbnb shadow with 24–32px radius (`md` or `lg`) — larger cards get larger radius
- Buttons always use 16px radius (`DEFAULT`) regardless of size
- Images follow card radius when used as card thumbnails (`rounded-t-lg` or `rounded-lg`)
- Avoid mixing radius sizes within the same component group
- Squircle-like shapes (continuous curvature) are preferred over pure geometric rounded rectangles where CSS supports it

## Components

### Cards

Cards are the dominant content container. They sit on Lotus White (`#FFFFFF`) with the Airbnb layered shadow.

- **Base state:** Lotus White background, airbnb shadow, 24-32px radius
- **Hover state:** `scale(1.02)` transform, shadow deepens, warm saffron glow (0 8px 24px rgba(247,148,30,0.12)) at the edges
- **Transition:** 0.6s ease-in-out for both enter and exit
- **Content padding:** 24px internal
- **Image treatment:** Full-width image at top, rounded to match card radius at top corners only

### Buttons

Three button variants share the same base: 16px radius, bold Inter (600 weight), 12px vertical / 24px horizontal padding.

- **Primary:** Rausch Red (`#52185B`) background, Lotus White text. For main CTAs, form submissions, checkout.
- **Secondary:** Forest Prana (`#779B05`) or Saffron Wisdom (`#F7941E`) background, Lotus White text. For supporting actions, filters, category tags.
- **Ghost:** Transparent background, Near Black 2px border, Near Black text. For tertiary actions, "learn more" links, navigation items.

All buttons use `transition-all duration-300` with a darken-on-hover effect.

### Icons

Use **Lucide-react** exclusively. Prefer organic, nature-themed shapes over abstract or technical ones:

- Navigation/actions: `Leaf`, `Flower2`, `Sun`, `Moon`, `Heart`, `Star`
- UI controls: `ChevronLeft`, `ChevronRight`, `X`, `Menu`, `Search`
- Status/info: `Clock`, `MapPin`, `Calendar`, `Users`, `Info`

Icon color defaults to Near Black. For accent use, match to Saffron Wisdom or Forest Prana. Size: 20px (1.25rem) for inline, 32px (2rem) for standalone.

## Do's and Don'ts

### Do

- Use Sacred Sand as the default page background — never pure white for large surfaces
- Pair Proza Libre headings with Inter body text — never mix font roles
- Apply the Airbnb shadow to all elevated cards and containers
- Maintain the 8px spacing rhythm — all spacing values should be multiples of 8px
- Favor slow 0.6–0.8s ease-in-out transitions over abrupt changes
- Use organic Lucide icons (Leaf, Flower2, Sun) over geometric or technical ones
- Ensure 44px minimum touch targets on mobile
- Bump vertical spacing ~20% above what feels "standard" — the design should breathe

### Don't

- Don't use pure black (`#000`) for text — Near Black (`#222222`) is the darkest allowed value
- Don't use Rausch Red for large background areas — reserve it for CTAs and accent moments
- Don't mix more than two brand colors (Rausch, Saffron, Forest) in a single view
- Don't use border-radius below 16px for buttons — 16px is the minimum
- Don't use fast transitions (under 0.3s) — the brand feels slow, graceful, and deliberate
- Don't center-align every layout — asymmetry is intentional and expected
- Don't use ALL CAPS for headings — sentence case only, matching the calm tone
- Don't skip heading levels — maintain H2 → H3 → H4 hierarchy without gaps
