// Tacos El Compa - Online Orders Worker (no external deps)
const ADMIN_PASS = 'elcompa2024';

const MENU = [
  { id: 'ent-01', section: 'Entradas', name: 'Guacamole', price: 8.75, description: 'Aguacate fresco con cebolla, tomate, cilantro y limón.' },
  { id: 'ent-02', section: 'Entradas', name: 'Queso Fundido', price: 10.00, description: 'Queso Oaxaca y asadero derretido en cazuela.' },
  { id: 'ent-03', section: 'Entradas', name: 'Elote', price: 6.75 },
  { id: 'ent-04', section: 'Entradas', name: 'Esquites', price: 6.00 },
  { id: 'sop-01', section: 'Sopas', name: 'Caldo Tlalpeño', price: 8.25 },
  { id: 'sop-02', section: 'Sopas', name: 'Sopa de Tortilla', price: 7.00 },
  { id: 'tac-01', section: 'Tacos', name: 'Gaoneras', price: 13.00 },
  { id: 'tac-02', section: 'Tacos', name: 'Chorizo', price: 7.00 },
  { id: 'tac-03', section: 'Tacos', name: 'Pastor', price: 8.50 },
  { id: 'tac-04', section: 'Tacos', name: 'Baja Estilo La Paz', price: 9.00 },
  { id: 'tac-05', section: 'Tacos', name: 'Cochinita', price: 8.50 },
  { id: 'tac-06', section: 'Tacos', name: 'Carnitas', price: 8.50 },
  { id: 'tac-ind-01', section: 'Tacos Individuales', name: 'Taco de Chorizo (1 und)', price: 2.50 },
  { id: 'tac-ind-02', section: 'Tacos Individuales', name: 'Taco de Pastor (1 und)', price: 3.00 },
  { id: 'tac-ind-03', section: 'Tacos Individuales', name: 'Taco La Paz (1 und)', price: 3.00 },
  { id: 'tac-ind-04', section: 'Tacos Individuales', name: 'Taco de Gaonera (1 und)', price: 4.50 },
  { id: 'tac-ind-05', section: 'Tacos Individuales', name: 'Taco de Cochinita (1 und)', price: 3.00 },
  { id: 'tac-ind-06', section: 'Tacos Individuales', name: 'Taco de Carnitas (1 und)', price: 3.00 },
  { id: 'fla-01', section: 'Flautas', name: 'Flautas de Papa', price: 6.25 },
  { id: 'fla-02', section: 'Flautas', name: 'Flautas de Pollo', price: 7.50 },
  { id: 'fla-03', section: 'Flautas', name: 'Flautas de Carne', price: 7.50 },
  { id: 'fla-04', section: 'Flautas', name: 'Flautas de Frijol', price: 6.25 },
  { id: 'fla-05', section: 'Flautas', name: 'Flautas de Chorizo con Papa', price: 7.50 },
  { id: 'que-01', section: 'Quesadillas', name: 'Tradicional', price: 7.50 },
  { id: 'que-02', section: 'Quesadillas', name: 'Queso con Papa', price: 8.50 },
  { id: 'que-03', section: 'Quesadillas', name: 'Queso con Chorizo', price: 8.50 },
  { id: 'que-04', section: 'Quesadillas', name: 'Queso con Hongos', price: 8.50 },
  { id: 'que-05', section: 'Quesadillas', name: 'Tinga', price: 8.50 },
  { id: 'que-06', section: 'Quesadillas', name: 'Queso con Tinga', price: 8.50 },
  { id: 'que-07', section: 'Quesadillas', name: 'Papa con Chorizo', price: 8.50 },
  { id: 'esp-01', section: 'Especialidades', name: 'Enchiladas', price: 10.50 },
  { id: 'esp-02', section: 'Especialidades', name: 'Enfrijoladas', price: 10.50 },
  { id: 'com-01', section: 'Con los Compas', name: 'Molcajete', price: 24.75 },
  { id: 'com-02', section: 'Con los Compas', name: 'Nachos Compas', price: 14.25 },
  { id: 'ant-01', section: 'Antojos', name: 'Churros con Cajeta', price: 7.50 },
  { id: 'ant-02', section: 'Antojos', name: 'Fresas con Crema', price: 7.00 },
  { id: 'ant-03', section: 'Antojos', name: 'Flan Napolitano', price: 6.50 },
  { id: 'ant-04', section: 'Antojos', name: 'Helado', price: 5.00 },
];

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

async function serveStatic(env, path) {
  if (!path || path === '/' || path === '/order' || path === '/order/') path = '/index.html';
  if (path === '/admin' || path === '/admin/' || path === '/order/admin' || path === '/order/admin/') path = '/admin/index.html';
  // strip /order prefix for asset resolution
  const assetPath = path.replace(/^\/order/, '') || '/index.html';
  try {
    const resp = await env.ASSETS.fetch(new URL(assetPath, 'https://placeholder/'));
    const out = new Response(resp.body, resp);
    Object.entries(CORS).forEach(([k, v]) => out.headers.set(k, v));
    return out;
  } catch {
    const fallback = await env.ASSETS.fetch(new URL('/index.html', 'https://placeholder/'));
    const out = new Response(fallback.body, fallback);
    Object.entries(CORS).forEach(([k, v]) => out.headers.set(k, v));
    return out;
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // ── API Routes ──
    
    // GET /api/products
    if (path === '/api/products' && request.method === 'GET') {
      return json({ ok: true, products: MENU });
    }
    
    // POST /api/orders
    if (path === '/api/orders' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { customer_name, phone, address, delivery_notes, delivery_cost, items, yappy_proof } = body;
        
        if (!customer_name || !phone || !address) return json({ ok: false, error: 'Nombre, teléfono y dirección requeridos' }, 400);
        if (!items || !Array.isArray(items) || items.length === 0) return json({ ok: false, error: 'Debe incluir al menos un producto' }, 400);
        
        let subtotal = 0;
        for (const item of items) {
          const p = MENU.find(m => m.id === item.product_id);
          if (!p) return json({ ok: false, error: 'Producto no encontrado: ' + item.product_id }, 400);
          subtotal += p.price * (parseInt(item.quantity) || 1);
        }
        
        const delivery = parseFloat(delivery_cost) || 0;
        const total = subtotal + delivery;
        
        const result = await env.tacos_pedidos.prepare(
          `INSERT INTO orders (customer_name, phone, address, delivery_notes, delivery_cost, subtotal, total, yappy_proof, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`
        ).bind(customer_name, phone, address, delivery_notes || '', delivery, subtotal, total, yappy_proof || '').run();
        
        const orderId = result.meta.last_row_id;
        
        for (const item of items) {
          const p = MENU.find(m => m.id === item.product_id);
          const qty = parseInt(item.quantity) || 1;
          await env.tacos_pedidos.prepare(
            `INSERT INTO order_items (order_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)`
          ).bind(orderId, p.name, p.price, qty, p.price * qty).run();
        }
        
        await env.tacos_pedidos.prepare(
          `INSERT INTO status_log (order_id, old_status, new_status, changed_by) VALUES (?, NULL, 'pending_payment', 'customer')`
        ).bind(orderId).run();
        
        return json({ ok: true, order_id: orderId }, 201);
      } catch (e) {
        return json({ ok: false, error: e.message }, 500);
      }
    }
    
    // GET /api/orders (admin)
    if (path === '/api/orders' && request.method === 'GET') {
      if (url.searchParams.get('pass') !== ADMIN_PASS) return json({ ok: false, error: 'No autorizado' }, 403);
      
      const id = url.searchParams.get('id');
      if (id) {
        const order = await env.tacos_pedidos.prepare(`SELECT * FROM orders WHERE id = ?`).bind(parseInt(id)).first();
        if (!order) return json({ ok: false, error: 'Pedido no encontrado' }, 404);
        const items = await env.tacos_pedidos.prepare(`SELECT * FROM order_items WHERE order_id = ?`).bind(parseInt(id)).all();
        const statusLog = await env.tacos_pedidos.prepare(`SELECT * FROM status_log WHERE order_id = ? ORDER BY id`).bind(parseInt(id)).all();
        return json({ ok: true, order, items: items.results, status_log: statusLog.results });
      }
      
      const orders = await env.tacos_pedidos.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
      return json({ ok: true, orders: orders.results });
    }
    
    // PATCH /api/orders (admin)
    if (path === '/api/orders' && request.method === 'PATCH') {
      try {
        const body = await request.json();
        const id = parseInt(url.searchParams.get('id') || body.id);
        const { status, pass } = body;
        
        if (pass !== ADMIN_PASS) return json({ ok: false, error: 'No autorizado' }, 403);
        
        const validStatuses = ['pending_payment', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) return json({ ok: false, error: 'Estado inválido' }, 400);
        
        const current = await env.tacos_pedidos.prepare(`SELECT status FROM orders WHERE id = ?`).bind(id).first();
        if (!current) return json({ ok: false, error: 'Pedido no encontrado' }, 404);
        
        if (status === 'confirmed' && current.status === 'pending_payment') {
          await env.tacos_pedidos.prepare(`UPDATE orders SET status = ?, yappy_confirmed = 1, updated_at = datetime('now', '-5 hours') WHERE id = ?`).bind(status, id).run();
        } else {
          await env.tacos_pedidos.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now', '-5 hours') WHERE id = ?`).bind(status, id).run();
        }
        
        await env.tacos_pedidos.prepare(`INSERT INTO status_log (order_id, old_status, new_status, changed_by) VALUES (?, ?, ?, 'admin')`).bind(id, current.status, status).run();
        
        return json({ ok: true });
      } catch (e) {
        return json({ ok: false, error: e.message }, 500);
      }
    }
    
    // ── Static Assets ──
    return serveStatic(env, path);
  }
};