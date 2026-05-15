-- Atomic: initialize inventory row (if missing) + validate stock + reserve.
-- Replaces the previous 3-step pattern (getAvailableStock → upsert → decrement_stock)
-- with a single function call that holds a FOR UPDATE lock for the entire operation.

CREATE OR REPLACE FUNCTION ensure_inventory_and_reserve(
  p_content_type text,
  p_content_id text,
  p_event_date date,
  p_stock_max integer,
  p_quantity integer
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_row inventory%ROWTYPE;
BEGIN
  -- Insert if this is the first access, otherwise no-op
  INSERT INTO inventory (content_type, content_id, event_date, stock_max, stock_reserved)
  VALUES (p_content_type, p_content_id, p_event_date, p_stock_max, 0)
  ON CONFLICT (content_type, content_id, event_date) DO NOTHING;

  -- Lock the row for the remainder of the transaction
  SELECT * INTO v_row
  FROM inventory
  WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND event_date = p_event_date
  FOR UPDATE;

  IF v_row.stock_reserved + p_quantity > v_row.stock_max THEN
    RETURN jsonb_build_object(
      'success', false,
      'available', v_row.stock_max - v_row.stock_reserved,
      'requested', p_quantity
    );
  END IF;

  UPDATE inventory
  SET stock_reserved = stock_reserved + p_quantity,
      updated_at = now()
  WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND event_date = p_event_date;

  RETURN jsonb_build_object('success', true);
END;
$$;
