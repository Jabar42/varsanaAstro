# Component Stylings

## Cards
- **Radius**: 24px–32px for a softer, more inviting look.
- **Hover**: Subtle lift with a soft saffron glow or border.

## Buttons
- **Primary**: Rausch Red, 16px radius, bold sans‑serif.
- **Secondary**: Forest Green or Saffron, 16px radius.
- **Ghost**: Near‑black border, display text for a "boutique" feel.

## Icons
- Use **Lucide‑react** but prioritize organic shapes: `Leaf`, `Flower2`, `Sun`, `Moon`, `Heart`.

## Implementation Details

### Card Styling
- Apply the card shadow defined in [Color Palette & Roles](color-palette.md#elevation).
- Use background color `Lotus White` (`#FFFFFF`) for card surfaces.
- Border radius should be between 24px and 32px, depending on context (larger radius for larger cards).
- On hover, add a slight scale transform (`scale‑[1.02]`) and a shadow elevation increase, optionally with a saffron border (`border‑saffron‑wisdom`).

### Button Styling
- Primary buttons: background `Rausch Red`, text white, font weight `600`, padding `0.75rem 1.5rem`.
- Secondary buttons: background `Forest Prana` or `Saffron Wisdom`, same padding and radius.
- Ghost buttons: transparent background, `Near Black` border (`border‑2`), text `Near Black`.
- All buttons should have a transition (`transition‑all duration‑300`) and a hover effect (darken background, slight shadow).

### Icons
- Use Lucide‑react icon set (already installed).
- Prefer organic, nature‑themed icons over abstract or technical ones.
- Icon color defaults to `Near Black`; for accents use `Saffron Wisdom` or `Forest Prana`.
- Ensure icons are sized appropriately (usually `1.25rem` for inline, `2rem` for standalone).

---

**Source:** [`DESIGN.md`](../../DESIGN.md)