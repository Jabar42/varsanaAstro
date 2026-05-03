## Checklist for Content Creators

Before saving a new or updated event/pasadía markdown file, verify:

### Frontmatter
- [ ] `id` (for events) is a unique, persistent identifier in kebab‑case.
- [ ] `title` and `description` are filled and compelling.
- [ ] `event_date` (for events) is in `YYYY‑MM‑DD` format.
- [ ] `image` URL points to a high‑quality landscape image (or a valid placeholder).
- [ ] `stock_max` (for events) is a positive integer representing maximum capacity.
- [ ] `prices` array is present, with at least one price object.
- [ ] Price `amount` is a number without currency symbols.
- [ ] `deadline` (if used) is in `YYYY‑MM‑DD` and correctly placed.
- [ ] For pasadías: `duration`, `meeting_point`, `category`, and `included_services` are filled.

### Content Body
- [ ] Headings follow the hierarchy (H2 → H3, no skipping).
- [ ] Headings include spacing classes (`mt-10 mb-5` for H2, `mt-8 mb-4` for H3).
- [ ] Paragraphs are wrapped in `<p class="mb-5">`.
- [ ] Lists of comparable items are converted into tables using the provided table template.
- [ ] Tables are wrapped in `<div class="overflow‑x‑auto my‑8">`.
- [ ] Blockquotes use `<blockquote class="my‑8">`.
- [ ] Language is clear, sentence‑cased, and free of unnecessary all‑caps.
- [ ] No stray Markdown syntax (e.g., unclosed HTML tags, misplaced asterisks).

### Visual Verification
- [ ] Preview the page in the development server (`npm run dev`) to confirm tables are responsive and spacing looks balanced.
- [ ] Check that the active price tier (if deadlines are used) is displayed correctly.
- [ ] Ensure images load and are not distorted.

---