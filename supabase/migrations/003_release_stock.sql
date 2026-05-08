CREATE OR REPLACE FUNCTION release_stock(
  p_content_type text,
  p_content_id text,
  p_quantity integer
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE inventory
  SET stock_reserved = GREATEST(0, stock_reserved - p_quantity),
      updated_at = now()
  WHERE content_type = p_content_type AND content_id = p_content_id;
END;
$$;
