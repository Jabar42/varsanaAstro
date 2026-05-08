CREATE OR REPLACE FUNCTION decrement_stock(
  p_content_type text,
  p_content_id text,
  p_quantity integer
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_reserved integer;
  current_max integer;
BEGIN
  SELECT stock_reserved, stock_max INTO current_reserved, current_max
  FROM inventory
  WHERE content_type = p_content_type AND content_id = p_content_id
  FOR UPDATE;  -- row-level lock

  IF current_reserved IS NULL THEN
    RAISE EXCEPTION 'Inventory record not found for % / %', p_content_type, p_content_id;
  END IF;

  IF (current_reserved + p_quantity) > current_max THEN
    RAISE EXCEPTION 'Insufficient stock: % available, % requested',
      (current_max - current_reserved), p_quantity;
  END IF;

  UPDATE inventory
  SET stock_reserved = stock_reserved + p_quantity,
      updated_at = now()
  WHERE content_type = p_content_type AND content_id = p_content_id;

  RETURN TRUE;
END;
$$;
