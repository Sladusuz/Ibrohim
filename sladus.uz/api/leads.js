/* ============================================================
   Sladus — Lidlar/so‘rovlar ombori (Vercel Serverless Function)
   POST /api/leads   — yangi lid qo‘shish (AI chat yoki Aloqa formasi), ochiq
   GET  /api/leads   — lidlar ro‘yxatini olish, faqat ?key=ADMIN_API_KEY bilan
   PATCH /api/leads  — { id, is_read:true } — o‘qilgan deb belgilash, faqat key bilan
   DELETE /api/leads — { id } — o‘chirish, faqat key bilan

   Vercel loyihasiga Storage → Postgres (Neon) ulanganda kerakli muhit
   o‘zgaruvchisi (DATABASE_URL yoki POSTGRES_URL) avtomatik qo‘shiladi.
   ADMIN_API_KEY — admin panel uchun o‘zingiz o‘ylab topgan parol, Environment
   Variables bo‘limiga qo‘lda qo‘shiladi.
   ============================================================ */
'use strict';

var neonMod = null;
try { neonMod = require('@neondatabase/serverless'); } catch (e) { neonMod = null; }

var DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL;

var sql = (neonMod && DB_URL) ? neonMod.neon(DB_URL) : null;
var tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`CREATE TABLE IF NOT EXISTS sladus_leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    company TEXT,
    country TEXT,
    message TEXT,
    source TEXT,
    lang TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  tableReady = true;
}

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

  if (!sql) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Lidlar ombori sozlanmagan. Vercel loyihasiga Storage → Postgres (Neon) ulanmagan.' }));
  }

  try {
    await ensureTable();

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
        lang: String(body.lang || '').slice(0, 5)
      };
      await sql`INSERT INTO sladus_leads (id, name, phone, email, company, country, message, source, lang, is_read)
        VALUES (${lead.id}, ${lead.name}, ${lead.phone}, ${lead.email}, ${lead.company}, ${lead.country}, ${lead.message}, ${lead.source}, ${lead.lang}, false)`;
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, id: lead.id }));
    }

    if (req.method === 'GET') {
      if (!checkAdmin(req)) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Ruxsat yo‘q.' }));
      }
      var rows = await sql`SELECT id, name, phone, email, company, country, message, source, lang, is_read, created_at
        FROM sladus_leads ORDER BY created_at DESC LIMIT 1000`;
      res.statusCode = 200;
      return res.end(JSON.stringify({ leads: rows }));
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

      if (req.method === 'PATCH') {
        await sql`UPDATE sladus_leads SET is_read = ${!!pbody.is_read} WHERE id = ${pbody.id}`;
      } else {
        await sql`DELETE FROM sladus_leads WHERE id = ${pbody.id}`;
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
