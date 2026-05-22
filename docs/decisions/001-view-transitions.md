# ADR-001: Enable View Transitions with ClientRouter

**Date:** 2026-05-22
**Status:** accepted

## Context

We want smooth SPA-like page transitions across all pages. The project uses
Astro 6 (SSR mode) with a single shared layout (`Layout.astro`) that wraps all
8 pages.

Astro 5+ renamed `<ViewTransitions />` to `<ClientRouter />` (still imported
from `astro:transitions`). It provides client-side routing with built-in
cross-fade animations using the View Transition API.

## Decision

- Add `<ClientRouter />` from `astro:transitions` to `Layout.astro` `<head>`
- Set `prefetch.prefetchAll: true` with `defaultStrategy: 'viewport'` in
  `astro.config.mjs`
- Provide a default cross-fade between all navigations, with lazy
  viewport-based prefetch

## Consequences

- All 8 pages covered via the single shared layout
- `<Header>` and `<Footer>` persist across navigations (no re-render flash)
- No per-page changes needed; incremental opt-in to `transition:name`,
  `transition:animate`, and `transition:persist` per element
- Prefetch is lazy (viewport), not eager (hover), keeping bandwidth low
