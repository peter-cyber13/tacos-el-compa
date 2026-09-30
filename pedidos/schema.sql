-- Tacos El Compa - Online Orders Schema
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS status_log;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_notes TEXT DEFAULT '',
  delivery_cost REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL,
  total REAL NOT NULL,
  yappy_proof TEXT DEFAULT '',       -- base64 URL of uploaded proof
  yappy_confirmed INTEGER DEFAULT 0, -- 0=pending, 1=confirmed
  status TEXT DEFAULT 'pending_payment', -- pending_payment | confirmed | preparing | ready | delivered | cancelled
  created_at TEXT DEFAULT (datetime('now', '-5 hours')),  -- Panama TZ offset
  updated_at TEXT DEFAULT (datetime('now', '-5 hours'))
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE status_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'customer', -- customer | admin
  created_at TEXT DEFAULT (datetime('now', '-5 hours')),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);