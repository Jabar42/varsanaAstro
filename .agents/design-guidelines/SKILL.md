---
name: design-guidelines
description: Design guidelines for the Varsana website — colors, typography, spacing, and components. Tokens are defined in DESIGN.md (Google Labs format with YAML frontmatter). Use when implementing UI changes or reviewing design consistency.
---

# Design System: Varsana Eco‑Wellness (Airbnb + Spiritual)

This document defines the visual design system for the Varsana website. It blends the clean, photography‑forward aesthetic of Airbnb with a spiritual‑sanctuary atmosphere inspired by Hindu tradition, yoga, and wellness.

**Source of truth:** [`DESIGN.md`](../../DESIGN.md) — now in the [Google Labs design.md](https://github.com/google-labs-code/design.md) format with **machine‑readable YAML frontmatter** (design tokens) and **human‑readable Markdown prose** (design rationale).

---

## 1. Visual Theme & Atmosphere

The Varsana design system evolves the warm, photography‑forward foundation of Airbnb into a **Spiritual Sanctuary**. It maintains the clean, airy feel of a travel magazine but infuses it with a "soulful" atmosphere.

**Key Characteristics:**
- **Sacred Sand Canvas** (`#FAF9F6`) for a softer, more organic feel.
- **Dual Typography**: Proza Libre headings for "Wisdom" and Inter body for "Clarity".
- **Spiritual Accents**: Saffron (`#F7941E`) and Forest Green (`#779B05`).
- **Organic Geometry**: 24–32px border‑radius and subtle "squircle" shapes.
- **Breathable Spacing**: Increased whitespace (~20% above standard) for calm.
- **Tactile Textures**: Subtle grain or paper‑like overlays on large surfaces.

For a detailed breakdown of colors, typography, components, and layout, see the corresponding reference guides:

- [Color Palette & Roles](references/color-palette.md)
- [Typography Rules](references/typography.md)
- [Component Stylings](references/component-stylings.md)
- [Layout Principles](references/layout-principles.md)

---

## 2. Token Workflow

The DESIGN.md YAML frontmatter is the single source of truth for design tokens. The Tailwind v4 `@theme` block in `src/styles/design-tokens.css` is **generated** from it — never edit that file by hand.

| Command | Purpose |
|---------|---------|
| `npm run export:theme` | Regenerate `src/styles/design-tokens.css` from DESIGN.md |
| `npm run export:theme:tailwind` | Export Tailwind v3 JSON snapshot to `src/styles/tailwind.theme.json` |
| `npm run lint:design` | Lint DESIGN.md for structural errors and WCAG contrast warnings |

**When to regenerate tokens:**
- After adding or renaming a color in DESIGN.md
- After changing typography font families
- After adjusting border-radius or spacing scale
- After adding new component definitions

---

## 3. Quick Reference

| Aspect | Key Values |
|--------|------------|
| Primary Brand | Rausch Red (`#52185B`), Saffron Wisdom (`#F7941E`), Forest Prana (`#779B05`) |
| Neutral Scale | Near Black (`#222222`), Secondary Gray (`#6A6A6A`), Sacred Sand (`#FAF9F6`), Lotus White (`#FFFFFF`) |
| Fonts | **Headings:** Proza Libre (`--font-display`), **UI & Body:** Inter (`--font-sans`) |
| Card Radius | 24px–32px (`--radius-md` / `--radius-lg`) |
| Button Radius | 16px (`--radius-DEFAULT`) |
| Shadows | Airbnb‑style layered shadow (`--shadow-airbnb`) |
| Spacing | 8px base, vertical spacing inflated ~20% vs standard layouts |

---

## 4. When to Use This Skill

- **Implementing UI changes** (new components, page layouts)
- **Reviewing design consistency** across the site
- **Creating content** that needs to follow visual brand guidelines
- **Debugging styling issues** related to colors, spacing, or typography
- **Onboarding new developers/designers** to the Varsana design system
- **Updating DESIGN.md** — run `npm run lint:design` after edits and `npm run export:theme` if tokens changed

---

## 5. See Also

- [Event & Pasadía Content Formatting](../event-content-formatting/SKILL.md) — for content‑specific styling (tables, spacing, typography)
- [Publish a New Pasadía](../publish-new-pasadia/SKILL.md) — for integrating design into pasadía pages
- [Publish a New Event](../publish-new-event/SKILL.md) — for event page design integration
- [Create a Content Collection Schema](../create-content-collection-schema/SKILL.md) — for structuring content with design‑aware fields
- [Payment Integration (Bold)](../payment-integration-bold/SKILL.md) — for checkout UI and payment button styling

---

**Last updated:** 2026‑05‑22
**Source:** [`DESIGN.md`](../../DESIGN.md) (Google Labs format with YAML frontmatter)
