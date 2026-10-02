// Tacos El Compa - Online Orders Worker + WhatsApp Bridge (no external deps)
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
const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago', confirmed: 'Confirmado', preparing: 'En preparacion', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}
function textResponse(body, status) {
  return new Response(body, { status: status||200, headers: { 'Content-Type': 'text/plain' } });
}

// ===== WHATSAPP HELPERS =====

async function sendWa(env, to, message) {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) return { ok: false, error: 'WA no config' };
  const phone = to.replace(/[^0-9]/g, '');
  const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`;
  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: message }
  });
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: body
  });
  const data = await resp.json();
  if (!resp.ok) { console.error('WA send err:', JSON.stringify(data)); return { ok: false, error: data.error?.message||'WA err', detail: data }; }
  return { ok: true, msgId: data.messages?.[0]?.id };
}

async function sendWaButtons(env, to, headerText, bodyText, buttons) {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) return { ok: false, error: 'WA no config' };
  const phone = to.replace(/[^0-9]/g, '');
  const rows = buttons.map(b => ({ type: 'reply', reply: { id: b.id.substring(0,256), title: b.title.substring(0,20) } }));
  const payload = JSON.stringify({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: headerText },
      body: { text: bodyText },
      action: { buttons: rows }
    }
  });
  const resp = await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: payload
  });
  const data = await resp.json();
  if (!resp.ok) { console.error('WA btn err:', JSON.stringify(data)); return { ok: false, error: data.error?.message||'WA err', detail: data }; }
  return { ok: true, msgId: data.messages?.[0]?.id };
}

async function getOrderDetail(env, orderId) {
  const o = await env.tacos_pedidos.prepare('SELECT * FROM orders WHERE id=?').bind(orderId).first();
  if (!o) return null;
  const items = await env.tacos_pedidos.prepare('SELECT * FROM order_items WHERE order_id=?').bind(orderId).all();
  let msg = '*PEDIDO #'+o.id+'*\n';
  msg += 'Cliente: '+o.customer_name+'\nTelefono: '+o.phone+'\nDireccion: '+o.address+'\n';
  if (o.delivery_notes) msg += 'Notas: '+o.delivery_notes+'\n';
  msg += '\n*Pedido:*\n';
  for (const i of items.results) {
    msg += i.quantity+'x '+i.product_name+' -- $'+i.subtotal.toFixed(2)+'\n';
    if (i.notes) msg += '  * '+i.notes+'\n';
  }
  msg += '\n------------------\n';
  msg += 'Envio: $5.00\n';
  msg += '*TOTAL: $'+o.total.toFixed(2)+'*\n';
  msg += o.created_at;
  return msg;
}

async function notifyNewOrder(env, orderId) {
  const msg = await getOrderDetail(env, orderId);
  if (!msg) return;
  // A Juan con botones
  const r1 = await sendWaButtons(env, env.JUAN_WHATSAPP, 'NUEVO PEDIDO', msg.substring(0,1024), [
    { id: 'confirm_'+orderId, title: 'CONFIRMAR' },
    { id: 'reject_'+orderId, title: 'RECHAZAR' }
  ]);
  console.error('notifyNewOrder->Juan:', JSON.stringify(r1));
  // Al restaurante informativo
  const r2 = await sendWa(env, env.RESTAURANTE_WHATSAPP, '*Nuevo Pedido #'+orderId+'*\nPendiente de confirmacion.\nAdmin: tacos-el-compa.com/order/admin');
  console.error('notifyNewOrder->Rest1:', JSON.stringify(r2));
  const r3 = await sendWa(env, env.RESTAURANTE_WHATSAPP, msg);
  console.error('notifyNewOrder->Rest2:', JSON.stringify(r3));
}

async function notifyCustomerStatus(env, orderId) {
  const o = await env.tacos_pedidos.prepare('SELECT * FROM orders WHERE id=?').bind(orderId).first();
  if (!o || !o.phone) return;
  const cp = o.phone.startsWith('+') ? o.phone : '+507'+o.phone.replace(/[^0-9]/g, '');
  let m = '';
  if (o.status==='confirmed') m = 'TU PEDIDO #'+o.id+' FUE CONFIRMADO. Ya lo estamos preparando. Gracias!';
  else if (o.status==='preparing') m = 'TU PEDIDO #'+o.id+' SE ESTA PREPARANDO. En breve estara listo.';
  else if (o.status==='delivered') m = 'TU PEDIDO #'+o.id+' FUE ENTREGADO. Gracias por tu preferencia! Danos tu opinion: encuesta.tacos-el-compa.com';
  else if (o.status==='cancelled') m = 'TU PEDIDO #'+o.id+' NO PUDO SER CONFIRMADO. Contacta al restaurante al +507 6232-6405.';
  if (m) await sendWa(env, cp, m);
}

async function rejectOrder(env, orderId, reason) {
  const o = await env.tacos_pedidos.prepare('SELECT * FROM orders WHERE id=?').bind(orderId).first();
  if (!o) return;
  await env.tacos_pedidos.prepare("UPDATE orders SET status='cancelled', updated_at=datetime('now','-5 hours') WHERE id=?").bind(orderId).run();
  await env.tacos_pedidos.prepare("INSERT INTO status_log(order_id,old_status,new_status,changed_by) VALUES(?,?,'cancelled','admin')").bind(orderId, o.status).run();
  await sendWa(env, env.JUAN_WHATSAPP, 'Pedido #'+orderId+' rechazado.');
  await sendWa(env, env.RESTAURANTE_WHATSAPP, 'Pedido #'+orderId+' RECHAZADO.\nRazon: '+(reason||'N/E'));
  const cp = o.phone.startsWith('+') ? o.phone : '+507'+o.phone.replace(/[^0-9]/g, '');
  let m = 'Tu pedido #'+orderId+' no pudo confirmarse. ';
  if (reason==='comprobante_ilegible') m += 'El comprobante no se veia claro.';
  else if (reason==='monto_incorrecto') m += 'El monto del Yappy no coincide.';
  else if (reason==='yappy_no_encontrado') m += 'No encontramos tu pago en Yappy.';
  else m += 'Contacta al restaurante al +507 6232-6405.';
  await sendWa(env, cp, m);
}

async function confirmOrderInternal(env, orderId) {
  const cur = await env.tacos_pedidos.prepare('SELECT status FROM orders WHERE id=?').bind(orderId).first();
  if (!cur || cur.status!=='pending_payment') return { ok: false };
  await env.tacos_pedidos.prepare("UPDATE orders SET status='confirmed', yappy_confirmed=1, updated_at=datetime('now','-5 hours') WHERE id=?").bind(orderId).run();
  await env.tacos_pedidos.prepare("INSERT INTO status_log(order_id,old_status,new_status,changed_by) VALUES(?,?,'confirmed','admin')").bind(orderId, cur.status).run();
  await notifyCustomerStatus(env, orderId);
  await sendWa(env, env.RESTAURANTE_WHATSAPP, 'Pedido #'+orderId+' CONFIRMADO por Juan. A preparar!');
  return { ok: true };
}

async function handleWebhook(env, body) {
  if (!body.entry) return { ok: true };
  for (const entry of body.entry) {
    if (!entry.changes) continue;
    for (const change of entry.changes) {
      if (change.field!=='messages' || !change.value) continue;
      const v = change.value;
      const metaPhone = v.metadata?.display_phone_number;
      if (!v.messages) continue;
      for (const msg of v.messages) {
        const from = msg.from || metaPhone || '';
        if (msg.type==='interactive' && msg.interactive?.type==='button_reply') {
          const rid = msg.interactive.button_reply.id;
          console.error('wh button:', rid, 'from:', from);
          if (rid.startsWith('confirm_')) {
            const oid = parseInt(rid.replace('confirm_',''));
            if (!isNaN(oid)) { await confirmOrderInternal(env, oid); await sendWa(env, from, 'Pedido #'+oid+' confirmado.'); }
          } else if (rid.startsWith('reject_') && !rid.startsWith('reject_reason_')) {
            const oid = parseInt(rid.replace('reject_',''));
            if (!isNaN(oid)) {
              await sendWaButtons(env, from, 'RECHAZAR PEDIDO', 'Por que rechazas el pedido #'+oid+'?', [
                { id: 'reject_reason_'+oid+'_comprobante_ilegible', title: 'No se ve' },
                { id: 'reject_reason_'+oid+'_monto_incorrecto', title: 'Monto mal' },
                { id: 'reject_reason_'+oid+'_yappy_no_encontrado', title: 'No aparece' }
              ]);
            }
          } else if (rid.startsWith('reject_reason_')) {
            const parts = rid.split('_');
            const oid = parseInt(parts[2]);
            const reason = parts.slice(3).join('_');
            if (!isNaN(oid) && reason) { await rejectOrder(env, oid, reason); await sendWa(env, from, 'Pedido #'+oid+' rechazado.'); }
          }
        }
      }
    }
  }
  return { ok: true };
}

// ===== STATIC ASSETS =====

async function serveStatic(env, path) {
  if (!path || path==='/' || path==='/order' || path==='/order/') path = '/index.html';
  if (path==='/admin' || path==='/admin/' || path==='/order/admin' || path==='/order/admin/') path = '/admin/index.html';
  const assetPath = path.replace(/^\/order/,'') || '/index.html';
  try {
    const resp = await env.ASSETS.fetch(new URL(assetPath, 'https://placeholder/'));
    const out = new Response(resp.body, resp);
    Object.entries(CORS).forEach(([k,v])=>out.headers.set(k,v));
    return out;
  } catch {
    const fb = await env.ASSETS.fetch(new URL('/index.html', 'https://placeholder/'));
    const out = new Response(fb.body, fb);
    Object.entries(CORS).forEach(([k,v])=>out.headers.set(k,v));
    return out;
  }
}

// ===== MAIN =====

export default {
  async fetch(request, env) {
    if (request.method==='OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    let path = url.pathname;
    if (path.startsWith('/order/')) path = path.replace(/^\/order/,'');

    // WhatsApp webhook verification (GET)
    if (path==='/webhook/whatsapp' && request.method==='GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      if (mode==='subscribe' && token===env.WHATSAPP_VERIFY_TOKEN) return textResponse(challenge);
      return textResponse('fail', 403);
    }
    // WhatsApp webhook events (POST)
    if (path==='/webhook/whatsapp' && request.method==='POST') {
      try {
        const body = await request.json();
        handleWebhook(env, body).catch(e=>console.error('wh err:',e.message));
        return json({ ok: true });
      } catch(e) { return json({ ok: false, error: e.message }, 500); }
    }

    // WhatsApp test endpoint
    if (path==='/api/test-wa' && request.method==='GET') {
      const testPhone = url.searchParams.get('phone') || env.JUAN_WHATSAPP;
      const r = await sendWa(env, testPhone, '🧪 Test desde Tacos El Compa. Si ves esto, WhatsApp funciona!');
      return json(r);
    }

    // API: Products
    if (path==='/api/products' && request.method==='GET') return json({ ok: true, products: MENU });

    // API: Create order
    if (path==='/api/orders' && request.method==='POST') {
      try {
        const body = await request.json();
        const { customer_name, phone, address, delivery_notes, items, yappy_proof } = body;
        if (!customer_name || !phone || !address) return json({ ok: false, error: 'Nombre, telefono y direccion requeridos' }, 400);
        if (!items || !Array.isArray(items) || items.length===0) return json({ ok: false, error: 'Debe incluir al menos un producto' }, 400);
        let subtotal = 0;
        for (const item of items) {
          const p = MENU.find(m=>m.id===item.product_id);
          if (!p) return json({ ok: false, error: 'Producto no encontrado: '+item.product_id }, 400);
          subtotal += p.price * (parseInt(item.quantity)||1);
        }
        const delivery = 5.0;
        const total = subtotal + delivery;
        const result = await env.tacos_pedidos.prepare(
          "INSERT INTO orders (customer_name, phone, address, delivery_notes, delivery_cost, subtotal, total, yappy_proof, status) VALUES (?,?,?,?,?,?,?,?,'pending_payment')"
        ).bind(customer_name, phone, address, delivery_notes||'', delivery, subtotal, total, yappy_proof||'').run();
        const orderId = result.meta.last_row_id;

        for (const item of items) {
          const p = MENU.find(m=>m.id===item.product_id);
          const qty = parseInt(item.quantity)||1;
          await env.tacos_pedidos.prepare(
            "INSERT INTO order_items (order_id, product_name, product_price, quantity, subtotal, notes) VALUES (?,?,?,?,?,?)"
          ).bind(orderId, p.name, p.price, qty, p.price*qty, item.notes||'').run();
        }
        await env.tacos_pedidos.prepare(
          "INSERT INTO status_log (order_id, old_status, new_status, changed_by) VALUES (?,NULL,'pending_payment','customer')"
        ).bind(orderId).run();

        // Notify via WhatsApp (await it so we can catch errors)
        const waResult = await notifyNewOrder(env, orderId);

        return json({ ok: true, order_id: orderId, wa: waResult }, 201);
      } catch(e) {
        console.error('create order err:', e.message);
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // API: List/Get orders
    if (path==='/api/orders' && request.method==='GET') {
      if (url.searchParams.get('pass')!==ADMIN_PASS) return json({ ok: false }, 403);
      const id = url.searchParams.get('id');
      if (id) {
        const order = await env.tacos_pedidos.prepare('SELECT * FROM orders WHERE id=?').bind(parseInt(id)).first();
        if (!order) return json({ ok: false }, 404);
        const items = await env.tacos_pedidos.prepare('SELECT * FROM order_items WHERE order_id=?').bind(parseInt(id)).all();
        const logs = await env.tacos_pedidos.prepare('SELECT * FROM status_log WHERE order_id=? ORDER BY id').bind(parseInt(id)).all();
        return json({ ok: true, order, items: items.results, status_log: logs.results });
      }
      const orders = await env.tacos_pedidos.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      return json({ ok: true, orders: orders.results });
    }

    // API: Update order status
    if (path==='/api/orders' && request.method==='PATCH') {
      try {
        const body = await request.json();
        const id = parseInt(url.searchParams.get('id')||body.id);
        const { status, pass } = body;
        if (pass!==ADMIN_PASS) return json({ ok: false, error: 'No autorizado' }, 403);
        const validStatuses = ['pending_payment','confirmed','preparing','ready','delivered','cancelled'];
        if (!validStatuses.includes(status)) return json({ ok: false, error: 'Estado invalido' }, 400);
        const cur = await env.tacos_pedidos.prepare('SELECT status FROM orders WHERE id=?').bind(id).first();
        if (!cur) return json({ ok: false, error: 'No encontrado' }, 404);

        if (status==='confirmed' && cur.status==='pending_payment') {
          await env.tacos_pedidos.prepare("UPDATE orders SET status=?, yappy_confirmed=1, updated_at=datetime('now','-5 hours') WHERE id=?").bind(status, id).run();
        } else {
          await env.tacos_pedidos.prepare("UPDATE orders SET status=?, updated_at=datetime('now','-5 hours') WHERE id=?").bind(status, id).run();
        }
        await env.tacos_pedidos.prepare("INSERT INTO status_log(order_id,old_status,new_status,changed_by) VALUES(?,?,?,'admin')").bind(id, cur.status, status).run();

        // Notify
        notifyCustomerStatus(env, id).catch(e=>console.error('notify err:',e.message));
        if (status!=='pending_payment') sendWa(env, env.RESTAURANTE_WHATSAPP, 'Pedido #'+id+': '+(STATUS_LABELS[status]||status)).catch(e=>{});

        return json({ ok: true });
      } catch(e) { return json({ ok: false, error: e.message }, 500); }
    }

    // Static assets
    return serveStatic(env, path);
  }
};