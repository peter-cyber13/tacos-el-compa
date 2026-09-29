# Encuesta Tacos El Compa

Formulario de encuesta para Tacos El Compa / SABOR A MÉXICO.

## Stack
- **Frontend**: HTML+CSS+JS (single-page)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)

## Deploy
El worker se deploya automáticamente vía GitHub Actions al hacer push a `main`.

```bash
# Manual deploy
npx wrangler deploy
```

## Schema
```sql
CREATE TABLE encuestas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mood TEXT NOT NULL CHECK(mood IN ('feliz', 'neutral', 'triste')),
  factura TEXT NOT NULL,
  comentarios TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', '-5 hours'))
);
```