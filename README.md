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

## 📋 Control de versiones

| Fecha | Commit | Descripción |
|---|---|---|
| 2026-10-05 | [`4033ae6`](https://github.com/peter-cyber13/tacos-el-compa/commit/4033ae6) | Docs: README con estructura, stack y últimas features |
| 2026-10-01 | [`9c69fa8`](https://github.com/peter-cyber13/tacos-el-compa/commit/9c69fa8) | Feat: muestra envío $5 y total en resumen checkout |
| 2026-10-01 | [`ad03134`](https://github.com/peter-cyber13/tacos-el-compa/commit/ad03134) | Favicon: logo de Tacos El Compa |
| 2026-10-01 | [`f66ebe6`](https://github.com/peter-cyber13/tacos-el-compa/commit/f66ebe6) | Delivery fijo + WhatsApp Bridge completo |
| 2026-09-29 | [`e5fa1d5`](https://github.com/peter-cyber13/tacos-el-compa/commit/e5fa1d5) | Feat: per-item notes in checkout + DB migration |
| 2026-09-29 | [`63928ad`](https://github.com/peter-cyber13/tacos-el-compa/commit/63928ad) | Feat: sistema de pedidos online — Worker + D1 + frontend |
| 2026-09-28 | [`a0777bd`](https://github.com/peter-cyber13/tacos-el-compa/commit/a0777bd) | Feat: dashboard admin + cron limpieza semanal |
| 2026-09-28 | [`195c839`](https://github.com/peter-cyber13/tacos-el-compa/commit/195c839) | Feat: encuesta caritas con sombrero |
| 2026-09-28 | [`ccbee34`](https://github.com/peter-cyber13/tacos-el-compa/commit/ccbee34) | Feat: encuesta + D1 para Tacos El Compa |
| 2026-09-15 | [`a4c5f9b`](https://github.com/peter-cyber13/tacos-el-compa/commit/a4c5f9b) | Menu: todas las secciones con precios actualizados |

---

**HEAD:** [`4033ae6`](https://github.com/peter-cyber13/tacos-el-compa/commit/4033ae6) (2026-10-05)
**Inicio:** ~2026-08 · **Última actualización:** 2026-10-05 | # commits: 70