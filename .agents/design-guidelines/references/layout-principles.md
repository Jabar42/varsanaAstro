# Layout Principles

## Philosophy

The layout philosophy favors **organic asymmetry** over rigid, symmetrical grids. The goal is a space that feels hand-arranged rather than machine-generated. Break symmetry at the section level — alternate left-aligned and right-anchored content.

## Grid System

- **Desktop**: 12-column grid with 24px (`gutter`) gaps.
- **Content max-width**: 1280px centered, with generous outer margins.
- **Mobile**: Single-column layout with 16px (`px-4`) side padding.
- Use CSS Grid for complex layouts (overlapping images, staggered cards).
- Overlapping elements (image + text block) are encouraged when tasteful.

## Vertical Rhythm

Spacing follows an 8px base unit. Section spacing is inflated ~20% above standard web layouts:

- Section separation: 80px on desktop, 48px on mobile.
- Card gaps: 24px in grid layouts.
- Internal card padding: 24px.
- Paragraph spacing: 16px (relaxed from typical 12px).
- Maintain consistent spacing between sibling elements.

## Asymmetry

- Prefer staggered grids (e.g., one column offset by 50% of card height) over uniform grids.
- Use intentional offsets rather than centering everything.
- Don't center-align every layout — asymmetry is intentional and expected.
- Break symmetry at the section level — alternate left-aligned and right-anchored content.

## Transitions

- Use slow, graceful entrances: 0.6s–0.8s ease-in-out.
- Prefer ease-in-out curves for a natural, organic feel.
- Avoid abrupt, fast animations — transitions should be subtle and soothing.
- Don't use fast transitions (under 0.3s). The brand feels slow, graceful, and deliberate.

## Breakpoints

| Breakpoint | Min Width | Layout Behavior |
|------------|-----------|-----------------|
| sm | 640px | Two-column grid possible |
| md | 768px | Sidebar layouts viable |
| lg | 1024px | Full 12-column grid, multi-column |
| xl | 1280px | Maximum content width reached |

## Visual Hierarchy

- Ensure the most important content (headings, CTAs) receives the most visual weight.
- Use size, color, and spacing to guide the user's eye through the page.
- Maintain a clear Z-index stack: Content (auto) → Header (40) → Overlays (50).

## Responsive Considerations

- Test layouts at all breakpoints: sm, md, lg, xl.
- Adjust typography sizes and spacing proportionally for smaller screens.
- Touch targets must be at least 44px on mobile.

---

**Source:** [`DESIGN.md`](../../DESIGN.md)
