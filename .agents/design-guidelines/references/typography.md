# Typography Rules

## Font Families

The system uses a dual-font strategy: **Proza Libre** for headings (the "voice of wisdom") and **Inter** for body and UI (the "voice of clarity").

| Role | Family | Purpose |
|------|--------|---------|
| Display | Proza Libre | Headings H1–H6, hero text, section titles |
| Sans | Inter | Body text, UI elements, buttons, labels, metadata |

Proza Libre is served locally as woff2 (weights 400–800). Inter is loaded via Google Fonts as a variable font.

## Hierarchy

| Role | Font | Size | Weight | Letter Spacing | Usage |
|------|------|------|--------|----------------|-------|
| Hero Heading | Display | 64px+ | 700 | -0.01em | Homepage hero, landing banners |
| Section Title | Display | 36px | 700 | normal | Page sections, feature titles |
| Card Title | Sans | 20px | 600 | -0.02em | Event cards, pasadia cards, info cards |
| Body | Sans | 16px | 400 | normal | Paragraphs, descriptions, long-form text |
| Metadata | Sans | 14px | 500 | 0.02em | Dates, prices, tags, captions |
| Button | Sans | 16px | 600 | normal | All button and CTA text |

## Rules

- Proza Libre exclusively for headings (H1–H6). Never use Inter for headings.
- Inter exclusively for body text, UI labels, buttons, and metadata. Never use Proza Libre for body copy.
- Maintain hierarchy: never skip from Hero directly to Body without an intermediate heading level.
- On mobile, scale heading sizes down proportionally (hero ~48px, section title ~28px).
- Ensure adequate line-height for readability (default Tailwind line-height classes are acceptable).
- Don't use ALL CAPS for headings — sentence case only, matching the calm tone.
- Don't skip heading levels — maintain H2 → H3 → H4 hierarchy without gaps.

---

**Source:** [`DESIGN.md`](../../DESIGN.md)
