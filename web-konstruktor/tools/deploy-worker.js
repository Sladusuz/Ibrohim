'use strict';
// Cloudflare Worker'ni bitta buyruq bilan joylaydi (KV yaratadi, kodni yuklaydi, maxfiy qiymatlarni o'rnatadi, webhookni ulaydi).
// Kerak: Cloudflare API token (ruxsatlar: Workers Scripts: Edit, Workers KV Storage: Edit, Account Settings: Read) va Account ID,
// yoki Global API Key (CF_EMAIL + CF_API_KEY; Account ID ixtiyoriy: o'zi topiladi).
// Ishga tushirish (qiymatlar muhit o'zgaruvchisi orqali, repoga yozilmaydi):
//   CF_API_TOKEN=... CF_ACCOUNT_ID=... TG_TOKEN=... ADMIN_PASSWORD=... [ANTHROPIC_API_KEY=...] node tools/deploy-worker.js
// Ixtiyoriy: WORKER_NAME (impro-bot), ALLOW_ORIGIN. DRY=1 bo'lsa hech narsa yuborilmaydi.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const E = process.env, NAME = E.WORKER_NAME || 'impro-bot', API = 'https://api.cloudflare.com/client/v4';
const GLOBAL = !!(E.CF_EMAIL && E.CF_API_KEY), need = [...(GLOBAL ? [] : ['CF_API_TOKEN', 'CF_ACCOUNT_ID']), ...(E.KEEP ? [] : ['TG_TOKEN', 'ADMIN_PASSWORD'])].filter((k) => !E[k]);
if (need.length && !E.DRY) { console.error('Yetishmayapti: ' + need.join(', ')); process.exit(1); }
const rnd = (n) => crypto.randomBytes(n).toString('base64url');
async function cf(method, p, body, headers) {
  const r = await fetch(API + p, { method, headers: { ...(GLOBAL ? { 'X-Auth-Email': E.CF_EMAIL, 'X-Auth-Key': E.CF_API_KEY } : { Authorization: `Bearer ${E.CF_API_TOKEN}` }), ...(body && !(body instanceof FormData) ? { 'content-type': 'application/json' } : {}), ...headers }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!j.success) throw new Error(`${method} ${p}: ${(j.errors || []).map((e) => e.message).join('; ') || r.status}`);
  return j.result;
}
(async () => {
  require('./build-worker.js');
  const code = fs.readFileSync(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs'), 'utf8');
  const secrets = E.KEEP ? Object.fromEntries(['WEBHOOK_SECRET', 'SETUP_KEY'].filter((k) => E[k]).map((k) => [k, E[k]])) : { WEBHOOK_SECRET: E.WEBHOOK_SECRET || rnd(24), SETUP_KEY: E.SETUP_KEY || rnd(18) }; // KEEP=1: mavjud maxfiy qiymatlar (TG_TOKEN va b.) o'zgarmaydi
  if (E.DRY) { console.log('DRY: kod', Math.round(code.length / 1024) + 'KB, maxfiy qiymatlar', Object.keys({ ...secrets, TG_TOKEN: 1, ADMIN_PASSWORD: 1 }).join(', ')); return; }
  const accId = E.CF_ACCOUNT_ID || (await cf('GET', '/accounts'))[0].id, acc = `/accounts/${accId}`;
  let sub; try { sub = (await cf('GET', `${acc}/workers/subdomain`)).subdomain; } catch { sub = ''; }
  if (!sub) sub = (await cf('PUT', `${acc}/workers/subdomain`, { subdomain: 'impro-' + crypto.randomBytes(3).toString('hex') })).subdomain; // yangi hisobda workers.dev nomi yaratiladi
  const kvs = await cf('GET', `${acc}/storage/kv/namespaces?per_page=100`);
  const kv = kvs.find((x) => x.title === 'impro-state') || (await cf('POST', `${acc}/storage/kv/namespaces`, { title: 'impro-state' }));
  // D1 baza (kuniga 100 000 yozuv bepul): holat shu yerda saqlanadi, KV zaxira sifatida qoladi
  let d1 = null; try { d1 = (await cf('GET', `${acc}/d1/database?name=impro-state`)).find((x) => x.name === 'impro-state'); } catch { /* yo'q */ }
  if (!d1) d1 = await cf('POST', `${acc}/d1/database`, { name: 'impro-state' });
  const bindings = [{ type: 'd1', name: 'DB', id: d1.uuid }, { type: 'kv_namespace', name: 'STATE', namespace_id: kv.id }, { type: 'ai', name: 'AI' }, // Workers AI: bepul sun'iy intellekt (kalit shart emas)
    ...['TWILIO_SID', 'TWILIO_TOKEN'].filter((k) => E[k]).map((k) => ({ type: 'secret_text', name: k, text: E[k] })),
    ...['TWILIO_FROM', 'CALL_PHONE'].filter((k) => E[k]).map((k) => ({ type: 'plain_text', name: k, text: E[k] })),
    ...(E.PAYME_MERCHANT_ID ? [{ type: 'plain_text', name: 'PAYME_MERCHANT_ID', text: E.PAYME_MERCHANT_ID }] : []),
    ...(E.CLICK_SERVICE_ID ? [{ type: 'plain_text', name: 'CLICK_SERVICE_ID', text: E.CLICK_SERVICE_ID }] : []),
    ...(E.CLICK_MERCHANT_ID ? [{ type: 'plain_text', name: 'CLICK_MERCHANT_ID', text: E.CLICK_MERCHANT_ID }] : []),
    ...(E.CLICK_SECRET_KEY ? [{ type: 'secret_text', name: 'CLICK_SECRET_KEY', text: E.CLICK_SECRET_KEY }] : []),
    ...(E.SMS_KEY ? [{ type: 'secret_text', name: 'SMS_KEY', text: E.SMS_KEY }] : []),
    ...(E.CARD_INFO ? [{ type: 'plain_text', name: 'CARD_INFO', text: E.CARD_INFO }] : []),
    ...(E.PAYME_KEY ? [{ type: 'secret_text', name: 'PAYME_KEY', text: E.PAYME_KEY }] : []),
    ...(E.BARK_KEY ? [{ type: 'secret_text', name: 'BARK_KEY', text: E.BARK_KEY }] : []),
    ...(E.PUSHBULLET_TOKEN ? [{ type: 'secret_text', name: 'PUSHBULLET_TOKEN', text: E.PUSHBULLET_TOKEN }] : []),
    ...(E.NTFY_TOKEN ? [{ type: 'secret_text', name: 'NTFY_TOKEN', text: E.NTFY_TOKEN }] : []),
    ...(E.NTFY_TOPIC ? [{ type: 'plain_text', name: 'NTFY_TOPIC', text: E.NTFY_TOPIC }] : []),
    ...(E.CALL_USER ? [{ type: 'plain_text', name: 'CALL_USER', text: E.CALL_USER }] : []),
    ...(E.CALL_LANG ? [{ type: 'plain_text', name: 'CALL_LANG', text: E.CALL_LANG }] : []),
    ...(E.TG_CHAT ? [{ type: 'plain_text', name: 'TG_CHAT', text: E.TG_CHAT }] : []), // doimiy admin chat ID (/logout qilsa ham xabarlar keladi)
    { type: 'plain_text', name: 'ALLOW_ORIGIN', text: E.ALLOW_ORIGIN || 'https://improuzbekiston.uz,https://www.improuzbekiston.uz' },
    ...(E.TG_TOKEN ? [{ type: 'secret_text', name: 'TG_TOKEN', text: E.TG_TOKEN }] : []), ...(E.ADMIN_PASSWORD ? [{ type: 'secret_text', name: 'ADMIN_PASSWORD', text: E.ADMIN_PASSWORD }] : []),
    ...Object.entries(secrets).map(([name, text]) => ({ type: 'secret_text', name, text })),
    ...(E.ANTHROPIC_API_KEY ? [{ type: 'secret_text', name: 'ANTHROPIC_API_KEY', text: E.ANTHROPIC_API_KEY }] : [])];
  const fd = new FormData();
  fd.append('metadata', new Blob([JSON.stringify({ main_module: 'worker.mjs', compatibility_date: '2024-11-01', bindings, ...(E.KEEP ? { keep_bindings: ['secret_text', 'plain_text'] } : {}) })], { type: 'application/json' }));
  fd.append('worker.mjs', new Blob([code], { type: 'application/javascript+module' }), 'worker.mjs');
  await cf('PUT', `${acc}/workers/scripts/${NAME}`, fd);
  await cf('POST', `${acc}/workers/scripts/${NAME}/subdomain`, { enabled: true });
  await cf('PUT', `${acc}/workers/scripts/${NAME}/schedules`, [{ cron: '* * * * *' }]); // shoshilinch eslatmalar va kunlik hisobot (20:00 Toshkent)
  const url = `https://${NAME}.${sub}.workers.dev`;
  let res = { error: 'javob yo\'q' }; // yangi workers.dev manzili bir necha daqiqada ishga tushadi: qayta urinamiz
  for (let i = 0; i < (E.NO_SETUP ? 0 : 24); i++) { await new Promise((r) => setTimeout(r, 5000)); res = await fetch(`${url}/setup?key=${encodeURIComponent(secrets.SETUP_KEY || '')}`).then((r) => r.json()).catch((e) => ({ error: e.message })); if (!res.error) break; }
  console.log('Worker manzili:', url); console.log('Sozlash natijasi:', JSON.stringify(res));
  console.log(`Saytga ulash: RELAY=${url} node tools/build-static.js\nTelegram: botga /login <ADMIN_PASSWORD> yozing.`);
})().catch((e) => { console.error('XATO:', e.message); process.exit(1); });
