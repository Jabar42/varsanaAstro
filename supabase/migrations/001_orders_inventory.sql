CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bold_order_id text UNIQUE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('event','pasadia')),
  content_id text NOT NULL,
  customer_email text,
  customer_name text,
  amount integer NOT NULL,
  currency text DEFAULT 'COP',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  quantity integer DEFAULT 1,
  bold_tx_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_content ON orders(content_type, content_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_bold_order_id ON orders(bold_order_id);

CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('event','pasadia')),
  content_id text NOT NULL,
  stock_max integer NOT NULL,
  stock_reserved integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);
