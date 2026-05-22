# Color Palette & Roles

## Brand Colors

Three primary brand colors anchor the identity:

- **Rausch Red** (`#52185B`): The dominant CTA and brand accent. A deep, warm purple that conveys grounded spirituality. Use for primary buttons, links, and key brand moments.
- **Saffron Wisdom** (`#F7941E`): The spiritual accent. Evokes marigold garlands, monk robes, and sacred fire. Use for highlights, tags, yoga-related elements, and hover glows.
- **Forest Prana** (`#779B05`): The nature accent. Represents the surrounding farmland, orchards, and eco-conscious values. Use for nature activities, volunteering, and secondary CTAs.

## Light Tones (For Gradients & Hover States)

- **Rausch Red Light** (`#97448E`): Lifted purple for hover states and gradient stops.
- **Saffron Wisdom Light** (`#FAAF3E`): Warm glow for saffron hover states.
- **Forest Prana Light** (`#95AD02`): Brightened green for hover and accents.

## Neutral Scale

A warm-shifted neutral scale replaces harsh pure-black and cool-gray:

- **Near Black** (`#222222`): Primary text. Warmer and softer than `#000`, grounded and approachable.
- **Secondary Gray** (`#6A6A6A`): Descriptions, metadata, and supporting text.
- **Sacred Sand** (`#FAF9F6`): Page background. An organic off-white with warm undertones.
- **Lotus White** (`#FFFFFF`): Card surfaces and elevated containers. Pure white for contrast against the sand background.
- **Light Surface** (`#F7F7F7`): Subtle surface variation for alternating sections.

## Elevation

### Card Shadow

```
0 0 0 1px rgba(0,0,0,0.02),
0 2px 6px rgba(0,0,0,0.04),
0 4px 8px rgba(0,0,0,0.10)
```

Three layers: a hairline border (1px, 2%) defines the edge, a tight blur (2px, 4%) adds proximity depth, and a wider blur (4px, 10%) creates ambient separation.

### Depth Levels

| Level | Usage | Behavior |
|-------|-------|----------|
| Base | Page background (Sacred Sand) | Flat, no shadow |
| Elevated | Cards, modals, dialogs | Airbnb shadow on Lotus White |
| Interactive | Hovered/focused cards | Shadow deepens + saffron glow `0 8px 24px rgba(247,148,30,0.12)` |

Cards lift on hover with `scale(1.02)` and a warm saffron-tinted shadow expansion. Transition: 0.6s ease-in-out.

### Z-Index Stack

| Layer | z-index | Usage |
|-------|---------|-------|
| Content | auto | Default page content |
| Sticky header | 40 | Main navigation bar |
| Overlay | 50 | Modals, drawers, dropdowns |

## Usage Rules

- Use Rausch Red for buttons, links, and primary actions. Never use it for large background areas.
- Use Saffron Wisdom for highlights, tags, and spiritual elements.
- Use Forest Prana for nature-related content, volunteering, and eco-themed sections.
- Near Black is the default text color; Secondary Gray for supporting text.
- Sacred Sand is the main page background — never use pure white for large surfaces.
- Lotus White is for cards, modals, and elevated surfaces.
- Don't mix more than two brand colors in a single view.
- Don't use pure black (`#000`) for text — Near Black is the darkest allowed value.

---

**Source:** [`DESIGN.md`](../../DESIGN.md)
