/* ============================================================
   Sladus — Lidlar/so‘rovlar ombori (Netlify Function)
   POST /api/leads, GET/PATCH/DELETE /api/leads (netlify.toml orqali
   shu faylga yo‘naltiriladi). Mantiq api/leads.js (Vercel) bilan bir xil.
   ============================================================ */
'use strict';

var kv = null;
try { kv = require('@vercel/kv').kv; } catch (e) { kv = null; }

var LIST_KEY = 'sladus:leads';
var MAX_LEADS = 1000;

function makeId() {
  return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function checkAdmin(event) {
  var key = (event.queryStringParameters && event.queryStringParameters.key) ||
    (event.headers && (event.headers['x-admin-key'] || event.headers['X-Admin-Key']));
  return !!process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY;
}

exports.handler = async function (event) {
  var headers = { 'Content-Type': 'application/json; charset=utf-8' };

  if (!kv) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: 'Lidlar ombori sozlanmagan. Netlify loyihasiga KV ulanmagan.' }) };
  }

  try {
    if (event.httpMethod === 'POST') {
      var body;
      try { body = JSON.parse(event.body || '{}'); } catch (e) { body = null; }
      if (!body || !String(body.name || '').trim()) {
        return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Ism kiritilishi shart.' }) };
      }
      var lead = {
        id: makeId(),
        name: String(body.name || '').slice(0, 120),
        phone: String(body.phone || '').slice(0, 40),
        email: String(body.email || '').slice(0, 120),
        company: String(body.company || '').slice(0, 120),
        country: String(body.country || '').slice(0, 80),
        message: String(body.message || body.interest || '').slice(0, 3000),
        source: String(body.source || 'contact').slice(0, 40),
        lang: String(body.lang || '').slice(0, 5),
        is_read: false,
        created_at: new Date().toISOString()
      };
      await kv.lpush(LIST_KEY, JSON.stringify(lead));
      await kv.ltrim(LIST_KEY, 0, MAX_LEADS - 1);
      return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true, id: lead.id }) };
    }

    if (event.httpMethod === 'GET') {
      if (!checkAdmin(event)) {
        return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Ruxsat yo‘q.' }) };
      }
      var raw = await kv.lrange(LIST_KEY, 0, MAX_LEADS - 1);
      var leads = raw.map(function (s) {
        if (typeof s === 'object') return s;
        try { return JSON.parse(s); } catch (e) { return null; }
      }).filter(Boolean);
      return { statusCode: 200, headers: headers, body: JSON.stringify({ leads: leads }) };
    }

    if (event.httpMethod === 'PATCH' || event.httpMethod === 'DELETE') {
      if (!checkAdmin(event)) {
        return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Ruxsat yo‘q.' }) };
      }
      var pbody;
      try { pbody = JSON.parse(event.body || '{}'); } catch (e) { pbody = {}; }
      if (!pbody.id) {
        return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'id kerak.' }) };
      }
      var all = await kv.lrange(LIST_KEY, 0, MAX_LEADS - 1);
      var items = all.map(function (s) {
        if (typeof s === 'object') return s;
        try { return JSON.parse(s); } catch (e) { return null; }
      }).filter(Boolean);

      if (event.httpMethod === 'PATCH') {
        items.forEach(function (it) { if (it.id === pbody.id) it.is_read = !!pbody.is_read; });
      } else {
        items = items.filter(function (it) { return it.id !== pbody.id; });
      }

      await kv.del(LIST_KEY);
      if (items.length) {
        await kv.rpush.apply(kv, [LIST_KEY].concat(items.slice().reverse().map(function (it) { return JSON.stringify(it); })));
      }
      return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Usul qo‘llab-quvvatlanmaydi.' }) };
  } catch (err) {
    return { statusCode: 502, headers: headers, body: JSON.stringify({ error: 'Lidlar omboriga ulanib bo‘lmadi.' }) };
  }
};
