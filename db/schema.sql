-- Tabla de inventario (stock)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  event_date TEXT NOT NULL,
  stock_max INTEGER NOT NULL,
  stock_reserved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(content_type, content_id, event_date)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bold_order_id TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  event_date TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'pending',
  quantity INTEGER NOT NULL DEFAULT 1,
  ticket_details TEXT,       -- JSON string con [{label, amount, quantity}]
  bold_tx_status TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Índices
CREATE INDEX idx_inventory_lookup ON inventory(content_type, content_id, event_date);
CREATE INDEX idx_orders_bold_id ON orders(bold_order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);

-- Tabla de contactos (formulario /contacto → POST /api/contact)
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
