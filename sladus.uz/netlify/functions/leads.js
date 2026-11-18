/* ============================================================
   Sladus — Lidlar/so‘rovlar ombori (Netlify Function)
   POST /api/leads, GET/PATCH/DELETE /api/leads (netlify.toml orqali
   shu faylga yo‘naltiriladi). Mantiq api/leads.js (Vercel) bilan bir xil.
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

  if (!sql) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: 'Lidlar ombori sozlanmagan. Postgres (Neon) ulanmagan.' }) };
  }

  try {
    await ensureTable();

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
        lang: String(body.lang || '').slice(0, 5)
      };
      await sql`INSERT INTO sladus_leads (id, name, phone, email, company, country, message, source, lang, is_read)
        VALUES (${lead.id}, ${lead.name}, ${lead.phone}, ${lead.email}, ${lead.company}, ${lead.country}, ${lead.message}, ${lead.source}, ${lead.lang}, false)`;
      return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true, id: lead.id }) };
    }

    if (event.httpMethod === 'GET') {
      if (!checkAdmin(event)) {
        return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Ruxsat yo‘q.' }) };
      }
      var rows = await sql`SELECT id, name, phone, email, company, country, message, source, lang, is_read, created_at
        FROM sladus_leads ORDER BY created_at DESC LIMIT 1000`;
      return { statusCode: 200, headers: headers, body: JSON.stringify({ leads: rows }) };
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

      if (event.httpMethod === 'PATCH') {
        await sql`UPDATE sladus_leads SET is_read = ${!!pbody.is_read} WHERE id = ${pbody.id}`;
      } else {
        await sql`DELETE FROM sladus_leads WHERE id = ${pbody.id}`;
      }
      return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Usul qo‘llab-quvvatlanmaydi.' }) };
  } catch (err) {
    return { statusCode: 502, headers: headers, body: JSON.stringify({ error: 'Lidlar omboriga ulanib bo‘lmadi.' }) };
  }
};
