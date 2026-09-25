# 🌮 Tacos El Compa — Menú Web — Respaldos

> **Para:** Mónica (futura tú) u otro agente sin contexto.
> **Propósito:** saber qué es el menú web, dónde está, cómo respaldarlo y cómo regenerarlo.
> **Creado:** 2026-09-24
> **Último backup:** 2026-09-24

---

## 📖 ¿Qué es?

Menú web del restaurante **Tacos El Compa / Sabor a México** — taquería de Peter.

**URL pública:** https://tacos-el-compa.com/menu/

Es un HTML + imágenes estáticas servido vía Cloudflare Pages. Sin backend, sin base de datos.

---

## 🧱 Estructura

```
tacos-el-compa/ (repo GitHub)
├── index.html          ← Página raíz (redirige a /menu/)
├── menu/
│   ├── index.html      ← Menú completo (HTML inline style)
│   ├── img/
│   │   ├── logo.jpg    ← Logo del restaurante
│   │   ├── platillo1.jpg  ← ~35 fotos de platillos
│   │   ├── ...
│   │   └── fds-icon.svg ← Icono Fast Data Systems
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
└── .gitignore
```

**Stack:** HTML + CSS inline + imágenes JPG. Sin dependencias externas.

---

## 📍 Ubicación de los respaldos

| Destino | Ruta |
|---|---|
| **Local (Mini PC)** | `/home/minipc/.openclaw/workspace/life/projects/menu-taqueria/` |
| **Google Drive** | `gdrive-backup:monica-backup/menu-taqueria/backup-2026-09-24/` |
| **GitHub** | https://github.com/peter-cyber13/tacos-el-compa |

### Archivos de origen fuera del repo (también respaldados)

```
life/projects/menu-taqueria/
├── index.html              ← Versión de desarrollo del menú
├── generar_imagenes.py     ← Script Python para generar imágenes con IA
├── fix_logo.py             ← Script para procesar el logo
├── items.json              ← Catálogo de items del menú
├── summary.md              ← Estado del proyecto
├── logovector/             ← Logos vectoriales (SVG + EPS)
│   ├── El_Compa_Tacos_logo_vector.svg
│   ├── El_Compa_Tacos_logo_vector_blanco.svg
│   └── El_Compa_Tacos_logo_vector.eps
├── menu_imprimible/        ← Versión PDF imprimible
│   ├── Menu_Tacos_El_Compa_imprimible.pdf
│   └── menu_imprimible.html
├── img/                    ← Imágenes originales (alta resolución)
├── img/fotos_reales/       ← Fotos reales del restaurante
└── deploy/
    ├── index.html          ← Redirección a /menu/
    └── menu/               ← Sitio desplegado
        ├── index.html
        └── img/
```

---

## 🚨 Cómo restaurar desde el backup

### Si se pierde solo el local (GitHub intacto)

```bash
git clone https://github.com/peter-cyber13/tacos-el-compa.git
cd tacos-el-compa
# El deploy automático de Cloudflare Pages se encarga
```

### Si se pierde GitHub también

```bash
# Desde Google Drive
rclone copy gdrive-backup:monica-backup/menu-taqueria/backup-2026-09-24/deployed-site/ \
  ./menu/ --progress

# Desde backup local
cp -r /home/minipc/.openclaw/workspace/life/projects/menu-taqueria/backups/deployed-site/* ./menu/
```

---

## 📦 ¿Cómo se despliega?

```bash
# 1. Clonar
git clone https://github.com/peter-cyber13/tacos-el-compa.git

# 2. La raíz tiene index.html que redirige a /menu/
#    El contenido real está en menu/ (index.html + img/)

# 3. En Cloudflare Pages:
#    - Proyecto: tacos-el-compa
#    - Build: none (static)
#    - Root: /
#    - Domain: tacos-el-compa.com
#    - Auto-deploy desde main branch

# 4. Push → deploy automático ~24s
git push origin main
```

---

## 🔄 ¿Qué necesita mantenimiento?

| Aspecto | Estado | Notas |
|---|---|---|
| Precios | ✅ Actualizados desde Excel (2026-08-19) | Cambiar en `img` y `index.html` si se actualizan |
| Fotos IA | ✅ Reemplazadas por placeholders reales | Pendiente fotos reales definitivas |
| Fotos reales | 📸 En `img/fotos_reales/` | Sin integrar al menú aún |
| Reels video | 🎬 3 archivos MP4 sin commitear | `elote-reel-completo.mp4`, `elote-reel-con-endcard.mp4`, `flautas-reel.mp4` |
| Logo vector | ✅ SVG vectorial en `logovector/` | Listo para usar |
| Menú imprimible | ✅ PDF en `menu_imprimible/` | |

**No requiere respaldos frecuentes.** Solo actualizar si cambian precios, fotos o se agregan platillos.

---

## 📋 Checklist de respaldo (2026-09-24)

- [x] Backup local en `life/projects/menu-taqueria/backups/` (sitio + src + logos + imprimible)
- [x] Backup remoto en Google Drive (`gdrive-backup:`)
- [x] Código fuente en GitHub (`peter-cyber13/tacos-el-compa`)
- [x] README de respaldo creado
- [ ] 3 videos reel sin commitear (no críticos, se pueden regenerar)
- [ ] Fotos reales sin integrar al menú (están en `img/fotos_reales/`)