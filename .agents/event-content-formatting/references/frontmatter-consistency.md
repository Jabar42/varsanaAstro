## Frontmatter Consistency

Every event or pasadía must follow the schema defined in [`src/content.config.ts`](../src/content.config.ts).

### Events

```yaml
---
title: "Event Title"
description: "A short, compelling description for SEO and cards."
event_date: YYYY-MM-DD
image: "https://picsum.photos/seed/your‑event/1600/1000"
prices:
  - label: "Early Bird"
    amount: 50000
    deadline: 2026-03-31
  - label: "Regular"
    amount: 70000
---
```

### Pasadías

```yaml
---
title: "Título del pasadía"
description: "Una descripción corta y atractiva para SEO y tarjetas."
image: "https://picsum.photos/seed/tu‑pasadia/1600/1000"
prices:
  - label: "General"
    amount: 50000
duration: "8 horas"
meeting_point: "Lugar de encuentro (dirección completa)"
category: "naturaleza"
included_services:
  - "Servicio incluido 1"
  - "Servicio incluido 2"
---
```

**Validation points:**

- `event_date` and `deadline` must be in `YYYY‑MM‑DD` format.
- `amount` is a plain number (no currency symbols, no commas).
- `image` URLs should be high‑quality and landscape‑oriented (16:10 ratio).
- Price ordering: place price tiers in evaluation order, with the fallback (regular) price last.