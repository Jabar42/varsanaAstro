-- Add event_date to inventory and orders, making stock per-date for pasadias.
-- Events use their fixed event_start date; pasadias use the user-selected date.

-- 1. Add event_date columns (nullable initially for migration)
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS event_date date;

-- 2. Remove old pasadia inventory rows (they used fake 999 stock_max)
DELETE FROM inventory WHERE content_type = 'pasadia';

-- 3. Backfill event_date for existing event inventory rows
UPDATE inventory SET event_date = '2026-09-21' WHERE content_type = 'event' AND content_id = 'ceremonia-equinoccio-2026';
UPDATE inventory SET event_date = '2026-06-05' WHERE content_type = 'event' AND content_id = 'taller-cocina-2026';
UPDATE inventory SET event_date = '2026-06-20' WHERE content_type = 'event' AND content_id = 'festival-bhakti-2026';
UPDATE inventory SET event_date = '2026-05-18' WHERE content_type = 'event' AND content_id = 'holi-fest-2026';
UPDATE inventory SET event_date = '2026-05-15' WHERE content_type = 'event' AND content_id = 'retiro-silencio-2026';
UPDATE inventory SET event_date = '2026-07-10' WHERE content_type = 'event' AND content_id = 'taller-permacultura-2026';
UPDATE inventory SET event_date = '2026-03-29' WHERE content_type = 'event' AND content_id = 'temazcal-femenino-2026';
UPDATE inventory SET event_date = '2026-10-12' WHERE content_type = 'event' AND content_id = 'retiro-yoga-sonido-2026';

-- 4. Make event_date NOT NULL on inventory (after backfill)
ALTER TABLE inventory ALTER COLUMN event_date SET NOT NULL;

-- 5. Replace unique constraint: drop old (content_type, content_id), create new with event_date
DO $$
BEGIN
  -- Drop the old unique constraint (name varies, find it dynamically)
  ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_content_type_content_id_key;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new unique constraint including event_date
DO $$
BEGIN
  -- Try standard name first
  ALTER TABLE inventory ADD CONSTRAINT inventory_content_type_content_id_event_date_key UNIQUE (content_type, content_id, event_date);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- 6. Update decrement_stock RPC to include event_date
DROP FUNCTION IF EXISTS decrement_stock(text, text, integer);
CREATE OR REPLACE FUNCTION decrement_stock(
  p_content_type text,
  p_content_id text,
  p_quantity integer,
  p_event_date date
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_reserved integer;
  current_max integer;
BEGIN
  SELECT stock_reserved, stock_max INTO current_reserved, current_max
  FROM inventory
  WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND event_date = p_event_date
  FOR UPDATE;

  IF current_reserved IS NULL THEN
    RAISE EXCEPTION 'Inventory record not found for % / % / %', p_content_type, p_content_id, p_event_date;
  END IF;

  IF (current_reserved + p_quantity) > current_max THEN
    RAISE EXCEPTION 'Insufficient stock: % available, % requested',
      (current_max - current_reserved), p_quantity;
  END IF;

  UPDATE inventory
  SET stock_reserved = stock_reserved + p_quantity,
      updated_at = now()
  WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND event_date = p_event_date;

  RETURN TRUE;
END;
$$;

-- 7. Update release_stock RPC to include event_date
DROP FUNCTION IF EXISTS release_stock(text, text, integer);
CREATE OR REPLACE FUNCTION release_stock(
  p_content_type text,
  p_content_id text,
  p_quantity integer,
  p_event_date date
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE inventory
  SET stock_reserved = GREATEST(0, stock_reserved - p_quantity),
      updated_at = now()
  WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND event_date = p_event_date;
END;
$$;
