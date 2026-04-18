# Design System: Varsana Eco-Wellness (Airbnb + Spiritual)

## 1. Visual Theme & Atmosphere

The Varsana design system evolves the warm, photography-forward foundation of Airbnb into a **Spiritual Sanctuary**. It maintains the clean, airy feel of a travel magazine but infuses it with a "soulful" atmosphere inspired by Hindu tradition, yoga, and wellness.

The foundation shifts from pure white to **Sacred Sand** (`#FAF9F6`) — a warmer, more organic off-white that reduces digital glare and feels like natural linen. The iconic **Rausch Red** (`#52185B`) remains for primary actions, but is now complemented by **Saffron Wisdom** (`#F7941E`) and **Forest Prana** (`#779B05`) to represent spiritual energy and nature.

**Key Characteristics:**
- **Sacred Sand Canvas** (`#FAF9F6`) for a softer, more organic feel.
- **Dual Typography**: Bold Display headings for "Wisdom" and Sans-serif for "Clarity".
- **Spiritual Accents**: Saffron (#F7941E) and Forest Green (#779B05).
- **Organic Geometry**: 32px+ border-radius and subtle "squircle" shapes.
- **Breathable Spacing**: Increased whitespace to promote a sense of calm.
- **Tactile Textures**: Subtle grain or paper-like overlays on large surfaces.

## 2. Color Palette & Roles

### Primary Brand
- **Rausch Red** (`#52185B`): Primary CTA, brand accent.
- **Saffron Wisdom** (`#F7941E`): Secondary accent for spiritual highlights, yoga tags.
- **Forest Prana** (`#779B05`): Accent for nature-based activities, volunteering.

### Light Tones (For Gradients)
- **Rausch Red Light** (`#97448E`): Lighter purple for gradients and hover states.
- **Saffron Wisdom Light** (`#FAAF3E`): Lighter orange for gradients and highlights.
- **Forest Prana Light** (`#95AD02`): Lighter green for gradients and accents.

### Neutral Scale
- **Near Black** (`#222222`): Primary text — warm and grounded.
- **Secondary Gray** (`#6a6a6a`): Descriptions and metadata.
- **Sacred Sand** (`#FAF9F6`): Primary background — organic and calming.
- **Lotus White** (`#FFFFFF`): Card surfaces and highlighted containers.

### Elevation
- **Card Shadow**: `rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px` (Airbnb standard).

## 3. Typography Rules

### Font Family
- **Headings (Wisdom)**: `Proza Libre` (Sans-serif) — Bold, professional, and soulful.
- **UI & Body (Clarity)**: `Inter` (Sans-serif) — Clean, modern, and highly legible.

### Hierarchy

| Role | Font | Size | Weight | Letter Spacing | Notes |
|------|------|------|--------|----------------|-------|
| Hero Heading | Display | 64px+ | 700 | -0.01em | Soulful and grand |
| Section Title | Display | 36px | 700 | normal | Professional feel |
| Card Title | Sans | 20px | 600 | -0.02em | Modern clarity |
| Body Text | Sans | 16px | 400 | normal | Standard reading |
| Metadata | Sans | 14px | 500 | 0.02em | Slightly tracked |

## 4. Component Stylings

### Cards
- **Radius**: 24px–32px for a softer, more inviting look.
- **Hover**: Subtle lift with a soft saffron glow or border.

### Buttons
- **Primary**: Rausch Red, 16px radius, bold sans-serif.
- **Secondary**: Forest Green or Saffron, 16px radius.
- **Ghost**: Near-black border, display text for a "boutique" feel.

### Icons
- Use **Lucide-react** but prioritize organic shapes: `Leaf`, `Flower2`, `Sun`, `Moon`, `Heart`.

## 5. Layout Principles

- **Asymmetry**: Use slightly asymmetrical layouts (e.g., staggered grids) to feel more organic and less "robotic".
- **Negative Space**: "Let the design breathe." Increase padding-top/bottom by 20% compared to standard tech layouts.
- **Transitions**: Use `motion` for slow, graceful entrances (durations of 0.6s–0.8s).
