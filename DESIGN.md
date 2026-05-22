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

## Using This Design System

The YAML frontmatter above is the **machine-readable single source of truth** for design tokens. It generates `src/styles/design-tokens.css` via `npm run export:theme`. Never edit that CSS file by hand.

For detailed implementation guidance — color roles, typography hierarchy, component specs, layout principles, and do's/don'ts — see [`.agents/design-guidelines/SKILL.md`](.agents/design-guidelines/SKILL.md).
