# Layout Principles

## Asymmetry
- Use slightly asymmetrical layouts (e.g., staggered grids) to feel more organic and less "robotic".
- Avoid perfectly centered, rigid grids; introduce intentional offsets where appropriate.

## Negative Space
- "Let the design breathe." Increase padding‑top/bottom by 20% compared to standard tech layouts.
- Use generous margins (`my‑8`, `py‑12`, etc.) to create a sense of calm and openness.
- Prioritize vertical rhythm: maintain consistent spacing between sibling elements.

## Transitions
- Use `motion` for slow, graceful entrances (durations of 0.6s–0.8s).
- Prefer ease‑in‑out curves for a natural, organic feel.
- Avoid abrupt, fast animations; transitions should be subtle and soothing.

## Grid & Breakpoints
- The site uses Tailwind’s default breakpoint system.
- On desktop, favor a 12‑column grid with gutters of `1.5rem`.
- On mobile, switch to a single column with side padding (`px‑4`).
- Consider using CSS Grid for complex layouts (e.g., overlapping images, staggered cards).

## Visual Hierarchy
- Ensure the most important content (headings, CTAs) receives the most visual weight.
- Use size, color, and spacing to guide the user’s eye through the page.
- Maintain a clear Z‑index stack: navigation and modals above content, footer at bottom.

## Responsive Considerations
- Test layouts at breakpoints `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- Adjust typography sizes and spacing proportionally for smaller screens.
- Ensure touch targets are at least `44px` on mobile.

---

**Source:** [`DESIGN.md`](../../DESIGN.md)