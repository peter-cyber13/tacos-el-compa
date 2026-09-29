// Tacos El Compa - Encuesta Worker
// Routes:
//   GET /                      → Encuesta pública
//   GET /admin                 → Dashboard protegido
//   GET /static/*              → Assets automáticos
//   POST /api/encuesta          → Guardar respuesta
//   POST /api/limpiar           → Limpieza manual (solo admin)
//   */* (cron semanal)         → Limpieza automática >6 meses

const PASSWORD = 'TacosElCompa2026';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // ──────── POST /api/encuesta ────────
    if (request.method === 'POST' && url.pathname === '/api/encuesta') {
      try {
        const body = await request.json();
        const { mood, factura, comentarios } = body;
        if (!mood || !['feliz', 'neutral', 'triste'].includes(mood))
          return new Response(JSON.stringify({ ok: false, error: 'Estado de ánimo inválido' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        if (!factura || factura.trim() === '')
          return new Response(JSON.stringify({ ok: false, error: 'La factura es obligatoria' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        const ahora = new Date().toISOString(); // UTC ISO
        const result = await env.tacos_encuesta.prepare(
          'INSERT INTO encuestas (mood, factura, comentarios, created_at) VALUES (?1, ?2, ?3, ?4)'
        ).bind(mood, factura.trim(), (comentarios || '').trim(), ahora).run();
        return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: 'Error del servidor' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
    }

    // ──────── POST /api/limpiar (cron/administrador) ────────
    if (request.method === 'POST' && url.pathname === '/api/limpiar') {
      // Si viene del cron (sin auth), permitir
      const auth = request.headers.get('Authorization');
      const isCron = request.headers.get('X-Cron') === 'true';
      if (!isCron && (!auth || !verificaAuth(auth))) {
        return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
      }
      try {
        const seisMeses = new Date();
        seisMeses.setDate(seisMeses.getDate() - 180);
        const result = await env.tacos_encuesta.prepare(
          'DELETE FROM encuestas WHERE created_at < ?1'
        ).bind(seisMeses.toISOString()).run();
        return new Response(JSON.stringify({ ok: true, deleted: result.meta.changes }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: 'Error de limpieza' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
    }

    // ──────── GET /admin — Dashboard ────────
    if (request.method === 'GET' && url.pathname === '/admin') {
      const auth = request.headers.get('Authorization');
      if (!auth || !verificaAuth(auth)) {
        return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
      }
      try {
        const { results, success } = await env.tacos_encuesta.prepare(
          'SELECT * FROM encuestas ORDER BY created_at DESC'
        ).all();
        return new Response(ADMIN_HTML(results || [], success), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
        });
      } catch (e) {
        return new Response('<h1>Error al cargar datos</h1>', { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    }

    // ──────── GET / — Encuesta pública ────────
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '')) {
      return new Response(HTML, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Assets estáticos
    return env.ASSETS.fetch(request);
  },

  // ──────── Cron semanal: limpieza automática ────────
  async scheduled(event, env, ctx) {
    try {
      const seisMeses = new Date();
      seisMeses.setDate(seisMeses.getDate() - 180);
      const result = await env.tacos_encuesta.prepare(
        'DELETE FROM encuestas WHERE created_at < ?1'
      ).bind(seisMeses.toISOString()).run();
      console.log(`Limpieza automática: ${result.meta.changes} registros eliminados`);
    } catch (e) {
      console.error('Error en limpieza automática:', e);
    }
  }
};

function verificaAuth(auth) {
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(':');
  return user === 'admin' && pass === PASSWORD;
}

// ──────── HTML Dashboard ────────
function ADMIN_HTML(results, success) {
  const total = results.length;
  const feliz = results.filter(r => r.mood === 'feliz').length;
  const neutral = results.filter(r => r.mood === 'neutral').length;
  const triste = results.filter(r => r.mood === 'triste').length;
  const porcentajeFeliz = total > 0 ? Math.round(feliz * 100 / total) : 0;
  const porcentajeNeutral = total > 0 ? Math.round(neutral * 100 / total) : 0;
  const porcentajeTriste = total > 0 ? Math.round(triste * 100 / total) : 0;
  const rows = results.map(r => {
    const moodIcon = r.mood === 'feliz' ? '😊' : r.mood === 'neutral' ? '😐' : '☹️';
    return `<tr>
      <td>${moodIcon}</td>
      <td>${escapeHtml(r.factura)}</td>
      <td>${r.comentarios ? escapeHtml(r.comentarios) : '—'}</td>
      <td>${formatearFecha(r.created_at)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dashboard — Encuesta Tacos El Compa</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f3ef; color: #1a1a1a; padding: 24px; }
  .container { max-width: 900px; margin: 0 auto; }
  h1 { color: #A40902; font-size: 22px; margin-bottom: 4px; }
  h1 span { color: #FCB416; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
  .stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat { background: white; border-radius: 14px; padding: 16px 20px; flex: 1; min-width: 120px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e0d5c8; }
  .stat .num { font-size: 28px; font-weight: 800; }
  .stat .label { font-size: 12px; color: #666; margin-top: 2px; }
  .bar-container { height: 6px; background: #eee; border-radius: 3px; margin-top: 8px; overflow: hidden; }
  .bar { height: 100%; border-radius: 3px; }
  .bar-green { background: #347a49; }
  .bar-gold { background: #FCB416; }
  .bar-red { background: #A40902; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e0d5c8; }
  th { background: #A40902; color: white; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
  td { padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #f0ece6; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf8f5; }
  .empty { text-align: center; padding: 40px; color: #999; }
  .actions { margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; }
  .btn { padding: 8px 18px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn-primary { background: #A40902; color: white; }
  .btn-primary:hover { background: #cc0a02; }
  .btn-outline { background: transparent; color: #347a49; border: 2px solid #347a49; }
  .btn-outline:hover { background: #347a49; color: white; }
  .toast { display: none; padding: 10px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
  .toast.success { display: block; background: #e8f5e9; color: #347a49; border: 1px solid #347a49; }
</style>
</head>
<body>
<div class="container">
  <h1>📊 TACOS <span>EL COMPA</span></h1>
  <p class="subtitle">Dashboard de Encuestas ${total} respuestas</p>
  <div class="toast ${success ? 'success' : ''}" id="toast">${success ? 'Limpieza completada' : 'Error al cargar datos'}</div>
  <div class="stats">
    <div class="stat"><div class="num" style="color:#347a49">${feliz}</div><div class="label">😊 Buenísimo ${porcentajeFeliz}%</div><div class="bar-container"><div class="bar bar-green" style="width:${porcentajeFeliz}%"></div></div></div>
    <div class="stat"><div class="num" style="color:#FCB416">${neutral}</div><div class="label">😐 Regular ${porcentajeNeutral}%</div><div class="bar-container"><div class="bar bar-gold" style="width:${porcentajeNeutral}%"></div></div></div>
    <div class="stat"><div class="num" style="color:#A40902">${triste}</div><div class="label">☹️ Deficiente ${porcentajeTriste}%</div><div class="bar-container"><div class="bar bar-red" style="width:${porcentajeTriste}%"></div></div></div>
  </div>
  <table>
    <thead><tr><th>😊</th><th>Factura</th><th>Comentarios</th><th>Fecha</th></tr></thead>
    <tbody>${results.length > 0 ? rows : '<tr><td colspan="4" class="empty">No hay respuestas todavía</td></tr>'}</tbody>
  </table>
  <div class="actions">
    <button class="btn btn-outline" onclick="exportCSV()">📥 Exportar CSV</button>
    <button class="btn btn-primary" onclick="limpiar()">🗑️ Limpiar >6 meses</button>
  </div>
</div>
<script>
function exportCSV() {
  const rows = [['Estado','Factura','Comentarios','Fecha']];
  ${JSON.stringify(results)}.forEach(r => {
    rows.push([r.mood === 'feliz' ? 'Feliz' : r.mood === 'neutral' ? 'Neutral' : 'Deficiente', r.factura, r.comentarios || '', r.created_at]);
  });
  const csv = rows.map(r => r.map(c => '"' + c.replace(/"/g,'""') + '"').join(',')).join('\\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'encuestas_elcompa.csv'; a.click();
  URL.revokeObjectURL(url);
}
function limpiar() {
  if (!confirm('¿Borrar respuestas con más de 6 meses?')) return;
  fetch('/api/limpiar', { method: 'POST', headers: { 'Authorization': '${btoa('admin:'+PASSWORD)}' } })
    .then(r => r.json()).then(d => { if(d.ok) location.reload(); else alert('Error'); });
}
</script>
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatearFecha(utcStr) {
  if (utcStr.includes('Z') || utcStr.includes('+')) {
    // New format: UTC ISO → convert to Panama
    return new Date(utcStr).toLocaleString('es-PA', { timeZone: 'America/Panama', hour12: true });
  }
  // Old format: stored already in Panama time (no timezone)
  return utcStr;
}

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>📋 Encuesta Tacos El Compa</title>
<style>
  :root {
    --gold: #FCB416;
    --red: #A40902;
    --green: #347a49;
    --bg: #faf8f5;
    --card: #ffffff;
    --text: #1a1a1a;
    --text-muted: #666;
    --border: #e0d5c8;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    color: var(--text);
  }
  .container { width: 100%; max-width: 420px; margin: 0 auto; }
  .header { text-align: center; padding: 32px 0 24px; }
  .header h1 { font-size: 24px; font-weight: 800; color: var(--red); letter-spacing: -0.5px; }
  .header h1 span { color: var(--gold); }
  .header p { color: var(--text-muted); font-size: 14px; margin-top: 6px; }
  .card { background: var(--card); border-radius: 20px; padding: 28px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid var(--border); }
  .card-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 24px; }
  .mood-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 12px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
  .moods { display: flex; gap: 12px; justify-content: center; margin-bottom: 28px; }
  .mood-option { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .mood-option input { display: none; }
  .mood-btn {
    display: flex; align-items: center; justify-content: center;
    width: 100px; height: 100px; border-radius: 50%;
    border: 3px solid transparent; cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    overflow: hidden;
  }
  .mood-btn img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .mood-btn:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
  .mood-option input:checked + .mood-btn { border-color: var(--green); box-shadow: 0 0 0 3px rgba(52,122,73,0.2); transform: scale(1.08); }
  .mood-option input:checked + .mood-btn.neutral { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(252,180,22,0.3); }
  .mood-option input:checked + .mood-btn.sad { border-color: var(--red); box-shadow: 0 0 0 3px rgba(164,9,2,0.2); }
  .mood-label-emoji { font-size: 11px; font-weight: 600; text-align: center; }
  .mood-label-emoji.happy { color: var(--green); }
  .mood-label-emoji.neutral { color: var(--gold); }
  .mood-label-emoji.sad { color: var(--red); }
  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-muted); }
  .field label .required { color: var(--red); margin-left: 2px; }
  .field input, .field textarea {
    width: 100%; padding: 12px 14px;
    border: 2px solid var(--border); border-radius: 12px;
    font-size: 15px; font-family: inherit; background: var(--bg);
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .field input:focus, .field textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(252,180,22,0.15); }
  .field textarea { resize: vertical; min-height: 80px; }
  .field .error-msg { font-size: 12px; color: var(--red); margin-top: 4px; display: none; }
  .field.invalid input, .field.invalid textarea { border-color: var(--red); box-shadow: 0 0 0 3px rgba(164,9,2,0.12); }
  .field.invalid .error-msg { display: block; }
  .submit-btn {
    width: 100%; padding: 14px; border: none; border-radius: 12px;
    font-size: 16px; font-weight: 700; color: white;
    background: linear-gradient(135deg, var(--red), #cc0a02); cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(164,9,2,0.3); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .toast { display: none; text-align: center; padding: 40px 20px; }
  .toast.show { display: block; }
  .toast .icon { font-size: 56px; margin-bottom: 12px; }
  .toast h2 { font-size: 20px; margin-bottom: 8px; }
  .toast p { color: var(--text-muted); font-size: 14px; }
  .toast .btn-volver { margin-top: 20px; padding: 10px 24px; border: 2px solid var(--green); border-radius: 10px; background: transparent; color: var(--green); font-weight: 600; font-size: 14px; cursor: pointer; }
  .footer { text-align: center; padding: 24px 0; font-size: 12px; color: var(--text-muted); }
  .footer a { color: var(--red); text-decoration: none; }
  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>TACOS <span>EL COMPA</span></h1>
    <p>¡Cuéntanos cómo te fue! 🎉</p>
  </div>
  <div class="card" id="formCard">
    <div class="card-title">¿Cómo estuvo tu visita?</div>
    <div class="mood-label">Selecciona una opción</div>
    <div class="moods" id="moodGroup">
      <div class="mood-option">
        <input type="radio" name="mood" id="moodHappy" value="feliz">
        <label for="moodHappy" class="mood-btn"><img src="/carita-feliz.png" alt="Feliz"></label>
        <span class="mood-label-emoji happy">¡Buenísimo!</span>
      </div>
      <div class="mood-option">
        <input type="radio" name="mood" id="moodNeutral" value="neutral">
        <label for="moodNeutral" class="mood-btn neutral"><img src="/carita-neutral.png" alt="Neutral"></label>
        <span class="mood-label-emoji neutral">Regular</span>
      </div>
      <div class="mood-option">
        <input type="radio" name="mood" id="moodSad" value="triste">
        <label for="moodSad" class="mood-btn sad"><img src="/carita-triste.png" alt="Triste"></label>
        <span class="mood-label-emoji sad">Deficiente</span>
      </div>
    </div>
    <div class="field" id="facturaField">
      <label>Nro. de Factura <span class="required">*</span></label>
      <input type="text" id="factura" placeholder="Ej: 001-002-000123" inputmode="numeric" autocomplete="off">
      <div class="error-msg">La factura es obligatoria</div>
    </div>
    <div class="field">
      <label>Comentarios <span style="color:var(--text-muted);font-weight:400;">(opcional)</span></label>
      <textarea id="comentarios" placeholder="¿Qué te gustó? ¿Qué mejorarías?"></textarea>
    </div>
    <button class="submit-btn" id="submitBtn" onclick="enviar()">Enviar encuesta ✨</button>
  </div>
  <div class="card toast" id="successCard">
    <div class="icon">🎉</div>
    <h2>¡Gracias por tu opinión!</h2>
    <p>Tu respuesta nos ayuda a mejorar cada día.</p>
    <p style="margin-top:4px;font-size:13px;color:var(--green);" id="successMood"></p>
    <button class="btn-volver" onclick="volver()">Enviar otra respuesta</button>
  </div>
  <div class="footer">
    <p>TACOS EL COMPA / SABOR A MÉXICO</p>
    <p>Hecho por <a href="https://fastdatasys.com" target="_blank">Fast Data Sys</a></p>
    <p>🔒 <a href="/admin" style="color:var(--text-muted)">Admin</a></p>
  </div>
</div>
<script>
function getSelectedMood() { const el = document.querySelector('input[name="mood"]:checked'); return el ? el.value : null; }
function showError(fieldId, show) { document.getElementById(fieldId).classList.toggle('invalid', show); }
function enviar() {
  const mood = getSelectedMood();
  const factura = document.getElementById('factura').value.trim();
  const comentarios = document.getElementById('comentarios').value.trim();
  let valid = true;
  if (!mood) { alert('Por favor selecciona cómo estuvo tu visita'); valid = false; }
  if (!factura) { showError('facturaField', true); valid = false; } else { showError('facturaField', false); }
  if (!valid) return;
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enviando...';
  fetch('/api/encuesta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood, factura, comentarios }) })
  .then(r => r.json())
  .then(data => {
    if (data.ok) {
      const labels = { feliz: '😊 ¡Buenísimo!', neutral: '😐 Regular', triste: '☹️ Deficiente' };
      document.getElementById('successMood').textContent = labels[mood] || '';
      document.getElementById('formCard').style.display = 'none';
      document.getElementById('successCard').classList.add('show');
    } else { alert('Error al enviar: ' + (data.error || 'intenta de nuevo')); }
  })
  .catch(() => { alert('Error de conexión. Intenta de nuevo.'); })
  .finally(() => { btn.disabled = false; btn.innerHTML = 'Enviar encuesta ✨'; });
}
function volver() {
  document.getElementById('successCard').classList.remove('show');
  document.getElementById('formCard').style.display = 'block';
  document.querySelectorAll('input[name="mood"]').forEach(r => r.checked = false);
  document.getElementById('factura').value = ''; document.getElementById('comentarios').value = '';
  showError('facturaField', false);
}
</script>
</body>
</html>`;