-- D1 Database schema for Tacos El Compa survey
CREATE TABLE IF NOT EXISTS encuestas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mood TEXT NOT NULL CHECK(mood IN ('feliz', 'neutral', 'triste')),
  factura TEXT NOT NULL,
  comentarios TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))  -- UTC. Dashboard converts to Panama time.
);

CREATE INDEX IF NOT EXISTS idx_encuestas_created ON encuestas(created_at);