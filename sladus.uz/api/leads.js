/* ============================================================
   Sladus — Lidlar/so‘rovlar ombori (Vercel Serverless Function)
   POST /api/leads   — yangi lid qo‘shish (AI chat yoki Aloqa formasi), ochiq
   GET  /api/leads   — lidlar ro‘yxatini olish, faqat ?key=ADMIN_API_KEY bilan
   PATCH /api/leads  — { id, is_read:true } — o‘qilgan deb belgilash, faqat key bilan
   DELETE /api/leads — { id } — o‘chirish, faqat key bilan

   Vercel KV (Storage → KV) loyihaga ulanganda kerakli muhit o‘zgaruvchilari
   (KV_REST_API_URL, KV_REST_API_TOKEN va h.k.) avtomatik qo‘shiladi.
   ADMIN_API_KEY — admin panel uchun o‘zingiz o‘ylab topgan parol, Environment
   Variables bo‘limiga qo‘lda qo‘shiladi.
   ============================================================ */
'use strict';

var kv = null;
try { kv = require('@vercel/kv').kv; } catch (e) { kv = null; }

var LIST_KEY = 'sladus:leads';
var MAX_LEADS = 1000;

function cors(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function makeId() {
  return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function parseBody(req) {
  var body = req.body;
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch (e) { return null; }
  }
  return body || null;
}

function checkAdmin(req) {
  var key = (req.query && req.query.key) || (req.headers && req.headers['x-admin-key']);
  return !!process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY;
}

module.exports = async function handler(req, res) {
  cors(res);

  if (!kv) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Lidlar ombori sozlanmagan. Vercel loyihasiga Storage → KV ulanmagan.' }));
  }

  try {
    if (req.method === 'POST') {
      var body = parseBody(req);
      if (!body || !String(body.name || '').trim()) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Ism kiritilishi shart.' }));
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
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, id: lead.id }));
    }

    if (req.method === 'GET') {
      if (!checkAdmin(req)) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Ruxsat yo‘q.' }));
      }
      var raw = await kv.lrange(LIST_KEY, 0, MAX_LEADS - 1);
      var leads = raw.map(function (s) {
        if (typeof s === 'object') return s;
        try { return JSON.parse(s); } catch (e) { return null; }
      }).filter(Boolean);
      res.statusCode = 200;
      return res.end(JSON.stringify({ leads: leads }));
    }

    if (req.method === 'PATCH' || req.method === 'DELETE') {
      if (!checkAdmin(req)) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Ruxsat yo‘q.' }));
      }
      var pbody = parseBody(req) || {};
      if (!pbody.id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'id kerak.' }));
      }
      var all = await kv.lrange(LIST_KEY, 0, MAX_LEADS - 1);
      var items = all.map(function (s) {
        if (typeof s === 'object') return s;
        try { return JSON.parse(s); } catch (e) { return null; }
      }).filter(Boolean);

      if (req.method === 'PATCH') {
        items.forEach(function (it) { if (it.id === pbody.id) it.is_read = !!pbody.is_read; });
      } else {
        items = items.filter(function (it) { return it.id !== pbody.id; });
      }

      await kv.del(LIST_KEY);
      if (items.length) {
        await kv.rpush.apply(kv, [LIST_KEY].concat(items.slice().reverse().map(function (it) { return JSON.stringify(it); })));
      }
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Usul qo‘llab-quvvatlanmaydi.' }));
  } catch (err) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'Lidlar omboriga ulanib bo‘lmadi.' }));
  }
};
