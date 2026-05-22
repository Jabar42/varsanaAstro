# Component Stylings

## Cards

Cards are the dominant content container. They sit on Lotus White with the Airbnb layered shadow.

- **Radius**: 24px–32px (`--radius-md` / `--radius-lg`). Larger cards get larger radius.
- **Base state**: Lotus White background, Airbnb shadow, 24px internal padding.
- **Hover state**: `scale(1.02)` transform, shadow deepens, warm saffron glow `0 8px 24px rgba(247,148,30,0.12)` at the edges.
- **Transition**: 0.6s ease-in-out for both enter and exit.
- **Image treatment**: Full-width image at top, rounded to match card radius at top corners only.
- Avoid mixing radius sizes within the same component group.

## Buttons

Three variants share the same base: 16px radius (`--radius-DEFAULT`), bold Inter (600 weight), 12px vertical / 24px horizontal padding.

- **Primary**: Rausch Red (`#52185B`) background, Lotus White text. For main CTAs, form submissions, checkout. Hover: `rausch-dark` (`#3A1241`).
- **Secondary**: Forest Prana (`#779B05`) or Saffron Wisdom (`#F7941E`) background, Lotus White text. For supporting actions, filters, category tags. Hover: `forest-dark` or `saffron-light`.
- **Ghost**: Transparent background, Near Black 2px border, Near Black text. For tertiary actions, "learn more" links, navigation items.

All buttons use `transition-all duration-300` with a darken-on-hover effect. Don't use border-radius below 16px for buttons.

## Shapes & Radius

| Token | Value | Application |
|-------|-------|-------------|
| sm | 8px | Input fields, small badges, inline tags |
| DEFAULT | 16px | Buttons, form elements, small containers |
| md | 24px | Standard cards, modals |
| lg | 32px | Large cards, hero images, featured content |
| full | 9999px | Pills, status badges, avatar crops |

Squircle-like shapes (continuous curvature) are preferred over pure geometric rounded rectangles where CSS supports it.

## Icons

Use **Lucide-react** exclusively. Prefer organic, nature-themed shapes over abstract ones.

- Navigation/actions: `Leaf`, `Flower2`, `Sun`, `Moon`, `Heart`, `Star`
- UI controls: `ChevronLeft`, `ChevronRight`, `X`, `Menu`, `Search`
- Status/info: `Clock`, `MapPin`, `Calendar`, `Users`, `Info`

Icon color defaults to Near Black. For accent use, match to Saffron Wisdom or Forest Prana. Size: 1.25rem (20px) for inline, 2rem (32px) for standalone.

---

**Source:** [`DESIGN.md`](../../DESIGN.md)
