# CategoryBar Scroll Improvements Plan

## Overview
Improve the CategoryBar component to provide a better horizontal scrolling experience on mobile devices while maintaining the current desktop layout. The changes include reducing the height of category items, adding subtle auto‑scroll animation on mobile to indicate scrollability, and ensuring smooth touch scrolling.

## Goals
1. **Horizontal scroll** – Keep the existing `max‑w‑7xl` container; scroll appears only when categories overflow.
2. **Height reduction** – Make each category item more compact (smaller icon, tighter spacing, lighter text weight).
3. **Auto‑scroll hint** – On mobile, a slow marquee‑like animation gently moves the content back and forth to signal that more content is available horizontally.
4. **Touch‑friendly** – Restore `-webkit‑overflow‑scrolling: touch` for smoother iOS scrolling.

## Detailed Changes

### 1. Container & Layout
- **File:** `src/components/CategoryBar.astro`
- **Current container class:** `max‑w‑7xl mx‑auto flex items-center ${alignmentClass} gap‑8 md:gap‑12`
- **New container class:** `max‑w‑7xl mx‑auto flex flex‑nowrap items‑center ${alignmentClass} gap‑8 md:gap‑12`
  - Add `flex‑nowrap` explicitly (already default, but clearer).
  - Add `scroll‑smooth` for smooth scrolling (optional).

### 2. Category Items (Links)
- **Current link class:** `flex flex‑col items‑center gap‑2 min‑w‑fit group cursor‑pointer border‑b‑2 transition‑all duration‑600 pb‑2`
- **New link class:** `flex flex‑col items‑center gap‑1 min‑w‑fit flex‑shrink‑0 group cursor‑pointer border‑b‑2 transition‑all duration‑600 pb‑1`
  - `gap‑1` instead of `gap‑2` (reduced vertical space between icon and text).
  - `flex‑shrink‑0` prevents items from shrinking when the container is narrow.
  - `pb‑1` instead of `pb‑2` (less bottom padding).
- **Icon size:** Change from `size={24}` to `size={20}`.
- **Text style:** Change from `text‑xs font‑semibold` to `text‑xs font‑medium`.

### 3. Scrollbar Hiding & iOS Smooth Scrolling
- **Current style block:**
  ```css
  .no‑scrollbar {
    -ms‑overflow‑style: none;
    scrollbar‑width: none;
  }
  ```
- **Add:** `-webkit‑overflow‑scrolling: touch;` inside `.no‑scrollbar` rule for better momentum scrolling on iOS.

### 4. Auto‑Scroll Animation (Mobile Only)
- **Implementation:** A lightweight JavaScript that runs only on viewports narrower than 768px.
- **Logic:**
  1. Select the scroll container (`div.overflow‑x‑auto`).
  2. Check if `scrollWidth > clientWidth` (content overflows).
  3. If overflowing, start an animation that slowly moves `scrollLeft` back and forth.
  4. Animation parameters:
     - Scroll distance: 40px
     - Duration per direction: 4 seconds
     - Pause at each end: 2 seconds
     - Loop indefinitely
  5. Stop animation on user interaction (`mouseenter`, `touchstart`) and resume after a 10‑second idle period.
- **Script placement:** Embedded inside the Astro component with `client:visible` directive to run only when the component is in viewport.
- **Fallback:** If JavaScript is disabled, the component works normally (no animation).

## Implementation Steps

1. **Edit `CategoryBar.astro`** – Apply the class changes described above.
2. **Add the auto‑scroll script** – Insert the JavaScript block before the closing `</style>` tag (or in a separate `<script>` block).
3. **Test on desktop** – Verify that the layout remains unchanged and scroll appears only when categories overflow.
4. **Test on mobile** – Use browser devtools to simulate mobile viewport; confirm that the auto‑scroll animation runs and stops on interaction.
5. **Verify touch scrolling** – Ensure `-webkit‑overflow‑scrolling: touch` works smoothly on iOS simulators/devices.

## Code Snippets

### Updated Container & Link
```astro
---
// ... existing imports and props
---
const containerClass = `max‑w‑7xl mx‑auto flex flex‑nowrap items‑center ${alignmentClass} gap‑8 md:gap‑12`;
---
<div class="bg‑white border‑t border‑gray‑100 py‑4 overflow‑x‑auto no‑scrollbar">
  <div class={containerClass}>
    {categories.map((cat, i) => (
      <a
        href={cat.href}
        class={`flex flex‑col items‑center gap‑1 min‑w‑fit flex‑shrink‑0 group cursor‑pointer border‑b‑2 transition‑all duration‑600 pb‑1 ${
          isActive(cat.href, i)
            ? 'border‑near‑black opacity‑100'
            : 'border‑transparent opacity‑60 hover:opacity‑100 hover:border‑saffron'
        }`}
      >
        <cat.icon size={20} strokeWidth={1.5} />
        <span class="text‑xs font‑medium whitespace‑nowrap">{cat.name}</span>
      </a>
    ))}
  </div>
</div>
```

### Updated Style Block
```astro
<style>
  .no‑scrollbar::-webkit‑scrollbar {
    display: none;
  }
  .no‑scrollbar {
    -ms‑overflow‑style: none;
    scrollbar‑width: none;
    -webkit‑overflow‑scrolling: touch;
  }
</style>
```

### Auto‑Scroll Script (simplified)
```astro
<script>
  // Run only on client
  if (typeof window !== 'undefined') {
    function startAutoScroll(container) {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      if (scrollWidth <= clientWidth) return; // No overflow

      let direction = 1;
      let position = 0;
      const step = 1;
      const limit = 40;
      let paused = false;

      function animate() {
        if (paused) {
          requestAnimationFrame(animate);
          return;
        }
        position += direction * step;
        if (position >= limit || position <= 0) {
          direction *= -1;
          paused = true;
          setTimeout(() => { paused = false; }, 2000);
        }
        container.scrollLeft = position;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);

      // Pause on interaction
      const pause = () => { paused = true; };
      const resume = () => { setTimeout(() => { paused = false; }, 10000); };
      container.addEventListener('mouseenter', pause);
      container.addEventListener('touchstart', pause);
      container.addEventListener('touchend', resume);
    }

    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
      if (window.innerWidth >= 768) return; // Desktop, no animation
      const container = document.querySelector('.overflow‑x‑auto');
      if (container) startAutoScroll(container);
    });
  }
</script>
```

## Testing Checklist
- [ ] Desktop view: categories align correctly within `max‑w‑7xl`.
- [ ] Desktop view: no horizontal scrollbar appears when all categories fit.
- [ ] Desktop view: scrollbar appears when categories overflow (test by reducing viewport width).
- [ ] Mobile view: scrollbar is hidden (`.no‑scrollbar` works).
- [ ] Mobile view: touch scrolling feels smooth (iOS simulator).
- [ ] Auto‑scroll animation runs only on mobile viewports (< 768px).
- [ ] Animation stops when user touches the container and resumes after a delay.
- [ ] Height reduction: icon size 20px, text `font‑medium`, reduced gaps and padding.
- [ ] Active/hover states remain intact.

## Rollback Plan
If any issue arises, revert the changes using `git revert` on the new commit(s). The previous state is preserved in the commit history.

## Next Steps
1. Review this plan with the team/stakeholder.
2. Once approved, switch to **Code** mode and implement the changes.
3. After implementation, test thoroughly and deploy.
