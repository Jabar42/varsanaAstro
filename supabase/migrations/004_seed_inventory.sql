-- Seed inventory table from Markdown frontmatter stock_max values.
-- This is a one-time seed for deploy. Rows may already exist if the
-- checkout API lazily initialized them via getAvailableStock().
-- Uses ON CONFLICT DO NOTHING to avoid overwriting live reserved counts.

INSERT INTO inventory (content_type, content_id, stock_max, stock_reserved)
VALUES
  -- Events
  ('event', 'ceremonia-equinoccio-2026',  50, 0),
  ('event', 'taller-cocina-2026',         20, 0),
  ('event', 'festival-bhakti-2026',      200, 0),
  ('event', 'holi-fest-2026',            500, 0),
  ('event', 'retiro-silencio-2026',       30, 0),
  ('event', 'taller-permacultura-2026',   25, 0),
  ('event', 'temazcal-femenino-2026',     20, 0),
  ('event', 'retiro-yoga-sonido-2026',    25, 0)
ON CONFLICT (content_type, content_id) DO NOTHING;

-- Pasadias are excluded: they have no stock_max in frontmatter and are
-- treated as effectively unlimited. The checkout API defaults to 999.
