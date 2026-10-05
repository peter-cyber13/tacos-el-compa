# 🌮 Tacos El Compa / Sabor a México

**Menú web + sistema de pedidos online + encuestas** para la taquería de Peter en Panamá.

**URL pública:** https://tacos-el-compa.com

---

## 📁 Estructura del repositorio

```
tacos-el-compa/
├── index.html                 ← Raíz (redirige a /menu)
├── _routes.json               ← Cloudflare Pages routing config
├── menu/                      ← Menú web (HTML inline + imágenes JPG)
│   ├── index.html             ← Menú completo con todas las secciones
│   ├── img/                   ← ~35 fotos de platillos
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
├── encuesta/                  ← Worker de encuesta (Cloudflare Workers + D1)
│   ├── src/worker.js          ← Lógica: encuesta pública + dashboard admin + API
│   ├── static/                ← Assets HTML/CSS
│   ├── schema.sql             ← DB schema (D1)
│   └── wrangler.toml
├── pedidos/                   ← Sistema de pedidos online
│   ├── src/worker.js          ← Worker con menú, carrito, checkout + WhatsApp bridge
│   ├── static/                ← Frontend del pedido
│   └── package.json
├── whatsapp-bridge/           ← Bridge para notificaciones WhatsApp (en desarrollo)
├── menu.bak-antes-quesadillas/ ← Backup del menú antes de cambios de quesadillas
├── BACKUPS-README.md          ← Guía de respaldos
└── .github/workflows/         ← CI/CD (auto-deploy)
```

## 🚀 Stack

| Componente | Tecnología |
|---|---|
| Menú web | HTML5 + CSS3 inline (estático) |
| Encuestas | **Cloudflare Workers + D1** (SQLite serverless) |
| Pedidos online | **Cloudflare Workers** (JS vanilla, sin deps externas) |
| WhatsApp | Bridge interno en el worker de pedidos |
| Deploy | **Cloudflare Pages** |
| Dominio | tacos-el-compa.com |
| Host | Peter (Mini PC local) |

## 🆕 Últimas novedades

- ✅ **Sistema de pedidos online** — Worker + D1 + frontend completo, con catálogo, carrito y checkout
- ✅ **Notas por artículo** en checkout + migración DB (`e5fa1d5`)
- ✅ **Dashboard admin** + cron de limpieza semanal de encuestas
- ✅ **Encuesta "Caritas"** con sombrero (mood: feliz/neutral/triste)
- ✅ **Fotos mejoradas con IA** — varias fotos de platillos reemplazadas con calidad profesional
- ✅ **Menú actualizado** — precios de queso fundido, Corona 0, tacos individuales a $3.00
- ✅ **Cobertura Cloudflare Pages** — `/order/*` excluido para el worker

## 🍽️ Secciones del menú

Entradas, Sopas, Tacos, Tacos Individuales, Flautas, Quesadillas, Platos Fuertes, Postres, Bebidas.

---

**HEAD:** [`e5fa1d5`](https://github.com/peter-cyber13/tacos-el-compa/commit/e5fa1d5) (2026-09-29)
**Inicio:** ~2026-08 · **Última actualización:** 2026-10-05