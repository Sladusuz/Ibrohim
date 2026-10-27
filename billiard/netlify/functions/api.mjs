// One Netlify Function that serves the whole /api/* surface: catalog, customers, orders, the admin panel
// and the Telegram bot (Mini App login + webhook). Data lives in Netlify Blobs.
// Required env: ADMIN_PASSWORD. Optional: ADMIN_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ADMIN_TELEGRAM_IDS.
import crypto from 'node:crypto';

export const config = { path: '/api/*' };

const CATS = ['table', 'balls', 'cues', 'acc'];
const STATUSES = ['new', 'confirmed', 'shipped', 'done', 'cancelled'];
const ST_CODE = { c: 'confirmed', s: 'shipped', d: 'done', x: 'cancelled' };
const ST_LABEL = { new: '🆕 Yangi', confirmed: '✅ Tasdiqlandi', shipped: '🚚 Yuborildi', done: '✔️ Bajarildi', cancelled: '❌ Bekor qilindi' };
const IMG_TYPES = ['image/webp', 'image/jpeg', 'image/png'];

/* ---------- helpers ---------- */
const json = (o, status = 200, headers = {}) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const fail = (status, error) => json({ error }, status);
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = v => { if (v === null || v === undefined || v === '') return null; const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
const rid = () => crypto.randomBytes(4).toString('hex');

/* ---------- storage (Netlify Blobs; in-memory only for local development) ---------- */
const mem = new Map();
function memStore(name) {
  const k = key => name + '/' + key;
  return {
    async get(key, opts) { const e = mem.get(k(key)); if (!e) return null; return opts && opts.type === 'json' ? JSON.parse(e.v) : e.v; },
    async getWithMetadata(key) { const e = mem.get(k(key)); return e ? { data: e.v, metadata: e.m } : null; },
    async set(key, v, o) { mem.set(k(key), { v: typeof v === 'string' ? v : Buffer.from(v), m: o && o.metadata }); },
    async setJSON(key, v) { mem.set(k(key), { v: JSON.stringify(v) }); },
    async delete(key) { mem.delete(k(key)); },
    async list({ prefix = '' } = {}) { return { blobs: [...mem.keys()].filter(x => x.startsWith(k(prefix))).map(x => ({ key: x.slice(name.length + 1) })) }; }
  };
}
let getStoreFn;
async function store(name) {
  if (!getStoreFn) {
    try { getStoreFn = (await import('@netlify/blobs')).getStore; }
    catch (e) { if (process.env.NETLIFY || process.env.NETLIFY_LOCAL) throw e; getStoreFn = memStore; }
  }
  return getStoreFn(name);
}
const getJSON = async (s, key) => s.get(key, { type: 'json' });

/* ---------- auth tokens ---------- */
const secret = () => process.env.ADMIN_SECRET || (process.env.ADMIN_PASSWORD ? crypto.createHash('sha256').update('bl:' + process.env.ADMIN_PASSWORD).digest('hex') : null);
const b64 = b => Buffer.from(b).toString('base64url');
function sign(payload, ttlSec) {
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec }));
  return body + '.' + crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}
function verify(token) {
  if (!secret() || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const good = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() / 1000 ? p : null; } catch { return null; }
}
const bearer = req => (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
const authAdmin = req => { const p = verify(bearer(req)); return p && p.r === 'admin' ? p : null; };
const authUser = req => { const p = verify(bearer(req)); return p && p.r === 'user' && /^user-\w+$/.test(p.k || '') ? p : null; };
const hashPw = (pw, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') });
const checkPw = (pw, rec) => { const h = crypto.scryptSync(pw, rec.salt, 32); const g = Buffer.from(rec.hash, 'hex'); return h.length === g.length && crypto.timingSafeEqual(h, g); };
const normPhone = v => { let d = String(v || '').replace(/\D/g, ''); if (d.length === 9) d = '998' + d; return d.length >= 9 && d.length <= 15 ? d : ''; };
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const pubUser = u => ({ id: u.key, phone: u.phone || '', name: u.name, city: u.city || '', createdAt: u.createdAt, tg: !!u.tg, username: (u.tg && u.tg.username) || '' });

/* ---------- Telegram ---------- */
const tgToken = () => process.env.TELEGRAM_BOT_TOKEN || '';
const tgSecret = () => crypto.createHash('sha256').update(tgToken() + ':webhook').digest('hex');
async function tg(method, payload) {
  const t = tgToken();
  if (!t) return { ok: false, description: 'no token' };
  try {
    const r = await fetch(`https://api.telegram.org/bot${t}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload || {}) });
    return await r.json().catch(() => ({ ok: false }));
  } catch { return { ok: false, description: 'network' }; }
}
async function settings() {
  try { return (await getJSON(await store('meta'), 'settings')) || {}; } catch { return {}; }
}
async function saveSettings(patch) {
  const ms = await store('meta');
  const cur = (await getJSON(ms, 'settings')) || {};
  const next = { ...cur, ...patch };
  await ms.setJSON('settings', next);
  return next;
}
async function adminTgIds() {
  const s = await settings();
  const env = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
  return [...new Set([...env, ...(s.adminTgIds || []).map(String)])];
}
async function notifyTargets() {
  const s = await settings();
  return [...new Set([process.env.TELEGRAM_CHAT_ID || s.chatId || '', ...(await adminTgIds())].filter(Boolean))];
}
function verifyInitData(initData) {
  const t = tgToken();
  if (!t || typeof initData !== 'string' || initData.length > 4000) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  if (!hash) return null;
  p.delete('hash');
  const data = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(t).digest();
  const calc = crypto.createHmac('sha256', key).update(data).digest('hex');
  const a = Buffer.from(calc), b = Buffer.from(hash);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const age = Date.now() / 1000 - Number(p.get('auth_date') || 0);
  if (!(age >= -60 && age < 86400)) return null;
  try { const u = JSON.parse(p.get('user') || ''); return u && u.id ? u : null; } catch { return null; }
}
const orderButtons = (key, siteUrl, priv) => {
  const rows = [[{ text: '✅ Tasdiqlash', callback_data: `s:${key}:c` }, { text: '🚚 Yuborildi', callback_data: `s:${key}:s` }], [{ text: '✔️ Bajarildi', callback_data: `s:${key}:d` }, { text: '❌ Bekor', callback_data: `s:${key}:x` }]];
  if (priv && siteUrl) rows.push([{ text: '📋 Admin panel', web_app: { url: siteUrl + '/admin/' } }]);
  return { inline_keyboard: rows };
};
async function notifyAdmins(text, key, siteUrl) {
  const rec = { ts: Date.now(), ok: false, error: '', targets: 0 };
  try {
    if (!tgToken()) rec.error = 'TELEGRAM_BOT_TOKEN yo\'q';
    else {
      const targets = await notifyTargets();
      rec.targets = targets.length;
      if (!targets.length) rec.error = "Qabul qiluvchi yo'q: botga /admin <parol> yuboring";
      for (const chat of targets) {
        const priv = !String(chat).startsWith('-');
        const r = await tg('sendMessage', { chat_id: chat, text, ...(key ? { reply_markup: orderButtons(key, siteUrl, priv) } : {}) });
        if (r.ok) rec.ok = true; else rec.error = r.description || rec.error || 'send failed';
      }
    }
  } catch (e) { rec.error = 'exception'; }
  try { await (await store('meta')).setJSON('lastNotify', rec); } catch { /* ignore */ }
  return rec;
}
const siteOf = async req => (await settings()).siteUrl || new URL(req.url).origin;


/* ---------- bot profile (name, descriptions, commands) in uz / ru / en ---------- */
export const BOT_PROFILE = {
  uz: { name: 'Bilyard Ishlab Chiqarish', short: "Bilyard stollari va aksessuarlar: katalog, narxlar, buyurtma. Samarqand.", about: "Samarqanddagi bilyard va snooker stollari ishlab chiqaruvchisi.\n\n🎱 Stollar, sharlar, kiyular va aksessuarlar\n💬 Katalog, narxlar va buyurtma bot ichida\n🚚 Dastavka, o'rnatish va eksport\n📞 +998 88 888 55 82",
        commands: [{ command: 'start', description: "Do'konni ochish" }, { command: 'orders', description: 'Yangi buyurtmalar (admin)' }] },
  ru: { name: 'Бильярд Производство', short: 'Бильярдные столы и аксессуары: каталог, цены, заказ. Самарканд.', about: 'Производитель бильярдных и снукерных столов в Самарканде.\n\n🎱 Столы, шары, кии и аксессуары\n💬 Каталог, цены и заказ прямо в боте\n🚚 Доставка, установка и экспорт\n📞 +998 88 888 55 82',
        commands: [{ command: 'start', description: 'Открыть магазин' }, { command: 'orders', description: 'Новые заказы (админ)' }] },
  en: { name: 'Billiard Manufacturing', short: 'Billiard tables and accessories: catalogue, prices, orders. Samarkand.', about: 'Snooker and billiard table maker in Samarkand, Uzbekistan.\n\n🎱 Tables, balls, cues and accessories\n💬 Catalogue, prices and ordering inside the bot\n🚚 Delivery, installation and export\n📞 +998 88 888 55 82',
        commands: [{ command: 'start', description: 'Open the store' }, { command: 'orders', description: 'New orders (admin)' }] }
};
export async function applyBotProfile(call) {
  const res = {};
  for (const [lc, b] of Object.entries(BOT_PROFILE)) {
    const code = lc === 'uz' ? {} : { language_code: lc };
    res['name_' + lc] = (await call('setMyName', { name: b.name, ...code })).ok;
    res['short_' + lc] = (await call('setMyShortDescription', { short_description: b.short, ...code })).ok;
    res['about_' + lc] = (await call('setMyDescription', { description: b.about, ...code })).ok;
    res['cmd_' + lc] = (await call('setMyCommands', { commands: b.commands, ...code })).ok;
  }
  return res;
}

/* ---------- catalog ---------- */
async function products(req) {
  const s = await store('catalog');
  const v = await getJSON(s, 'products');
  if (Array.isArray(v)) return v;
  try { const r = await fetch(new URL('/data/products.json', req.url)); if (r.ok) return await r.json(); } catch { /* ignore */ }
  return [];
}
const L = (o, lang = 'uz') => (o && typeof o === 'object' ? o[lang] || o.uz || '' : String(o || ''));
const cleanI18n = (o, max) => {
  if (typeof o === 'string') o = { uz: o };
  o = o && typeof o === 'object' ? o : {};
  return { uz: str(o.uz, max), ru: str(o.ru, max), en: str(o.en, max) };
};
const okImg = u => typeof u === 'string' && /^(img\/|\/api\/img\/)[\w\-./]+$/.test(u) && u.length < 200;
function cleanProduct(p, i) {
  const id = str(p.id, 40).toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'p-' + rid();
  const specs = {};
  for (const l of ['uz', 'ru', 'en']) {
    const a = p.specs && Array.isArray(p.specs[l]) ? p.specs[l] : [];
    specs[l] = a.slice(0, 20).map(r => [str(r[0], 60), str(r[1], 120)]).filter(r => r[0] && r[1]);
  }
  return {
    id, cat: CATS.includes(p.cat) ? p.cat : 'acc', sort: Number.isFinite(+p.sort) ? +p.sort : i, active: p.active !== false,
    badge: cleanI18n(p.badge, 30), name: cleanI18n(p.name, 120), desc: cleanI18n(p.desc, 300), info: cleanI18n(p.info, 1500), unit: cleanI18n(p.unit, 20), specs,
    price: num(p.price), priceMax: num(p.priceMax),
    variants: (Array.isArray(p.variants) ? p.variants : []).slice(0, 8).map(v => ({ name: cleanI18n(v.name, 60), price: num(v.price), priceMax: num(v.priceMax) })).filter(v => L(v.name)),
    images: (Array.isArray(p.images) ? p.images : []).filter(okImg).slice(0, 8)
  };
}

/* ---------- orders ---------- */
async function createOrder(req, user, body) {
  const list = await products(req);
  const items = [];
  for (const it of (Array.isArray(body.items) ? body.items : []).slice(0, 40)) {
    const p = list.find(x => x.id === it.id && x.active !== false);
    if (!p) continue;
    const q = Math.min(99, Math.max(1, parseInt(it.q, 10) || 1));
    const v = Number.isInteger(it.v) && p.variants && p.variants[it.v] ? p.variants[it.v] : null;
    const price = v ? v.price : p.price, priceMax = v ? v.priceMax : p.priceMax;
    items.push({ id: p.id, name: L(p.name), variant: v ? L(v.name) : '', qty: q, unit: L(p.unit), price, priceMax: priceMax || null });
  }
  if (!items.length) return null;
  const total = items.reduce((s, i) => s + (i.price && !i.priceMax ? i.price * i.qty : 0), 0);
  const quote = items.some(i => i.priceMax || !i.price);
  const ts = Date.now();
  const phone = normPhone(body.phone) || user.phone || '';
  const order = {
    id: 'BL-' + ts.toString(36).toUpperCase().slice(-5) + rid().slice(0, 2).toUpperCase(), key: `order-${ts}-${rid()}`, ts, status: 'new',
    user: { id: user.key, phone, name: user.name, city: user.city || '', tg: user.tg ? (user.tg.username || String(user.tg.id)) : '' },
    city: str(body.city, 80), address: str(body.address, 200), note: str(body.note, 500), lang: ['uz', 'ru', 'en'].includes(body.lang) ? body.lang : 'uz',
    items, total, quote
  };
  const s = await store('orders');
  await s.setJSON(order.key, order);
  const us = await store('users');
  const u = await getJSON(us, user.key);
  if (u) { u.orderIds = [order.key, ...(u.orderIds || [])].slice(0, 100); if (phone && !u.phone) u.phone = phone; await us.setJSON(user.key, u); }
  const lines = items.map(i => `• ${i.name}${i.variant ? ' (' + i.variant + ')' : ''} × ${i.qty}` + (i.price ? ` — ${i.priceMax ? i.price + '–' + i.priceMax : i.price} $` : '')).join('\n');
  await notifyAdmins(`🛒 Yangi buyurtma ${order.id}\n👤 ${user.name}${order.user.tg ? ' (@' + order.user.tg + ')' : ''}\n📞 ${phone ? '+' + phone : '—'}\n📍 ${[order.city, order.address].filter(Boolean).join(', ') || '—'}\n\n${lines}\n\n💰 Jami: ${total} $${quote ? ' + kelishiladigan narxlar' : ''}${order.note ? '\n📝 ' + order.note : ''}`, order.key, await siteOf(req)).catch(() => null);
  return order;
}
async function allOrders() {
  const s = await store('orders');
  const { blobs } = await s.list({ prefix: 'order-' });
  const rows = await Promise.all(blobs.map(b => getJSON(s, b.key)));
  return rows.filter(Boolean).sort((a, b) => b.ts - a.ts).slice(0, 500);
}
async function setOrderStatus(key, status) {
  const s = await store('orders');
  const o = await getJSON(s, key);
  if (!o || !STATUSES.includes(status)) return null;
  o.status = status;
  await s.setJSON(o.key, o);
  return o;
}

/* ---------- Telegram bot webhook ---------- */
async function handleUpdate(req, up) {
  const site = await siteOf(req);
  if (up.callback_query) {
    const cq = up.callback_query;
    const admins = await adminTgIds();
    const m = /^s:(order-\d+-\w+):([csdx])$/.exec(cq.data || '');
    if (!m || !admins.includes(String(cq.from.id))) { await tg('answerCallbackQuery', { callback_query_id: cq.id, text: '⛔' }); return; }
    const o = await setOrderStatus(m[1], ST_CODE[m[2]]);
    await tg('answerCallbackQuery', { callback_query_id: cq.id, text: o ? ST_LABEL[o.status] : 'Topilmadi' });
    if (o && cq.message) await tg('editMessageText', { chat_id: cq.message.chat.id, message_id: cq.message.message_id, text: (cq.message.text || '').split('\n\n📌')[0] + `\n\n📌 ${ST_LABEL[o.status]}`, reply_markup: orderButtons(o.key, site, !String(cq.message.chat.id).startsWith('-')) });
    return;
  }
  const msg = up.message;
  if (!msg || !msg.text) return;
  const chat = msg.chat.id, text = msg.text.trim();
  const ru = (msg.from && msg.from.language_code) === 'ru';
  const open = { inline_keyboard: [[{ text: ru ? '🛒 Открыть магазин' : "🛒 Do'konni ochish", web_app: { url: site } }]] };
  if (/^\/start/.test(text)) {
    if ((await adminTgIds()).includes(String(msg.from.id))) open.inline_keyboard.push([{ text: '📋 Admin panel', web_app: { url: site + '/admin/' } }]);
    await tg('sendMessage', { chat_id: chat, text: ru ? 'Добро пожаловать! Бильярдные столы и аксессуары: каталог, цены и заказ прямо в Telegram.' : "Xush kelibsiz! Bilyard stollari va aksessuarlar: katalog, narxlar va buyurtma to'g'ridan-to'g'ri Telegram'da.", reply_markup: open });
    return;
  }
  const am = /^\/admin(?:\s+(.+))?$/s.exec(text);
  const pw = am ? (am[1] || '').trim() : text;
  if (am && !pw) { await tg('sendMessage', { chat_id: chat, text: ru ? 'Отправьте пароль администратора одним сообщением.' : "Admin parolini bitta xabar bilan yuboring." }); return; }
  if (process.env.ADMIN_PASSWORD && pw && eq(pw, process.env.ADMIN_PASSWORD)) {
    const id = String(msg.from.id);
    if (!(await adminTgIds()).includes(id)) await saveSettings({ adminTgIds: [...new Set([...((await settings()).adminTgIds || []), id])] });
    await tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });
    await tg('sendMessage', { chat_id: chat, text: `✅ Siz admin sifatida ulandingiz.\n\n📋 Admin panel: ${site}/admin/\n\nYangi buyurtmalar shu yerga keladi, statusini tugmalar bilan o'zgartira olasiz. Buyurtmalar: /orders`, reply_markup: { inline_keyboard: [[{ text: '📋 Admin panel', web_app: { url: site + '/admin/' } }], [{ text: "🛒 Do'kon", web_app: { url: site } }]] } });
    return;
  }
  if (am) { await tg('sendMessage', { chat_id: chat, text: "⛔ Parol noto'g'ri." }); return; }
  if (/^\/(orders|buyurtmalar)/.test(text)) {
    if (!(await adminTgIds()).includes(String(msg.from.id))) return;
    const rows = (await allOrders()).filter(o => o.status === 'new').slice(0, 8);
    await tg('sendMessage', { chat_id: chat, text: rows.length ? rows.map(o => `${o.id} · ${o.user.name} · ${o.total} $`).join('\n') : 'Yangi buyurtma yo\'q.', reply_markup: { inline_keyboard: [[{ text: '📋 Admin panel', web_app: { url: site + '/admin/' } }]] } });
    return;
  }
  await tg('sendMessage', { chat_id: chat, text: ru ? 'Нажмите кнопку, чтобы открыть магазин.' : "Do'konni ochish uchun tugmani bosing.", reply_markup: open });
}

/* ---------- router ---------- */
export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
  const m = req.method;
  const readJSON = async (max = 200000) => { const t = await req.text(); if (t.length > max) throw new Error('big'); return t ? JSON.parse(t) : {}; };
  try {
    if (path === '/ping') return json({ ok: true, ready: !!secret(), tg: !!tgToken() });

    /* ----- public ----- */
    if (path === '/products' && m === 'GET') {
      const list = (await products(req)).filter(p => p.active !== false).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      return json(list, 200, { 'cache-control': 'public, max-age=15' });
    }
    if (path.startsWith('/img/') && m === 'GET') {
      const s = await store('images');
      const r = await s.getWithMetadata(path.slice(5).replace(/[^\w-]/g, ''), { type: 'arrayBuffer' });
      if (!r) return fail(404, 'not found');
      const type = IMG_TYPES.includes(r.metadata && r.metadata.type) ? r.metadata.type : 'image/webp';
      return new Response(r.data, { headers: { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable' } });
    }

    /* ----- Telegram webhook (verified by secret header, not by bearer token) ----- */
    if (path === '/tg-webhook' && m === 'POST') {
      if (!tgToken() || !eq(req.headers.get('x-telegram-bot-api-secret-token') || '', tgSecret())) return fail(401, 'auth');
      try { await handleUpdate(req, await readJSON(100000)); } catch (e) { console.error('webhook', e && e.message); }
      return json({ ok: true });
    }

    if (!secret()) return fail(503, "Server sozlanmagan: Netlify'da ADMIN_PASSWORD o'rnating.");

    /* ----- customers ----- */
    if (path === '/tg-auth' && m === 'POST') {
      const b = await readJSON();
      const tu = verifyInitData(b.initData);
      if (!tu) return fail(401, 'telegram');
      const key = 'user-tg' + tu.id;
      const us = await store('users');
      let u = await getJSON(us, key);
      const name = [tu.first_name, tu.last_name].filter(Boolean).join(' ').slice(0, 60) || tu.username || 'Telegram';
      if (!u) {
        u = { key, phone: '', name, city: '', createdAt: Date.now(), tg: { id: tu.id, username: tu.username || '' }, orderIds: [] };
        await notifyAdmins(`👤 Yangi mijoz (Telegram): ${name}${tu.username ? ' @' + tu.username : ''}`).catch(() => null);
      } else { u.tg = { id: tu.id, username: tu.username || '' }; }
      u.lastLogin = Date.now();
      await us.setJSON(key, u);
      const isAdmin = (await adminTgIds()).includes(String(tu.id));
      return json({ token: sign({ r: 'user', k: key }, 30 * 86400), user: pubUser(u), ...(isAdmin ? { adminToken: sign({ r: 'admin' }, 12 * 3600) } : {}) });
    }
    if (path === '/register' && m === 'POST') {
      const b = await readJSON();
      const phone = normPhone(b.phone), name = str(b.name, 60), pw = typeof b.password === 'string' ? b.password : '';
      if (name.length < 2) return fail(400, 'name');
      if (!phone) return fail(400, 'phone');
      if (pw.length < 6 || pw.length > 72) return fail(400, 'password');
      const us = await store('users');
      const key = 'user-' + phone;
      if (await getJSON(us, key)) return fail(409, 'exists');
      const u = { key, phone, name, city: str(b.city, 60), createdAt: Date.now(), pass: hashPw(pw), orderIds: [], fails: 0, lockUntil: 0 };
      await us.setJSON(key, u);
      await notifyAdmins(`👤 Yangi mijoz: ${name} · +${phone} ${u.city}`).catch(() => null);
      return json({ token: sign({ r: 'user', k: key }, 30 * 86400), user: pubUser(u) });
    }
    if (path === '/login' && m === 'POST') {
      const b = await readJSON();
      const phone = normPhone(b.phone), pw = typeof b.password === 'string' ? b.password : '';
      const us = await store('users');
      const key = 'user-' + phone;
      const u = phone ? await getJSON(us, key) : null;
      if (!u || !u.pass) return fail(401, 'credentials');
      if (u.lockUntil && u.lockUntil > Date.now()) return fail(429, 'locked');
      if (!checkPw(pw, u.pass)) {
        u.fails = (u.fails || 0) + 1;
        if (u.fails >= 8) { u.lockUntil = Date.now() + 15 * 60000; u.fails = 0; }
        await us.setJSON(key, u);
        return fail(401, 'credentials');
      }
      u.fails = 0; u.lockUntil = 0; u.lastLogin = Date.now();
      await us.setJSON(key, u);
      return json({ token: sign({ r: 'user', k: key }, 30 * 86400), user: pubUser(u) });
    }
    if (path === '/me' && m === 'GET') {
      const a = authUser(req); if (!a) return fail(401, 'auth');
      const us = await store('users');
      const u = await getJSON(us, a.k);
      if (!u) return fail(401, 'auth');
      const os = await store('orders');
      const orders = (await Promise.all((u.orderIds || []).slice(0, 30).map(k => getJSON(os, k)))).filter(Boolean);
      return json({ user: pubUser(u), orders });
    }
    if (path === '/me' && m === 'PATCH') {
      const a = authUser(req); if (!a) return fail(401, 'auth');
      const us = await store('users');
      const u = await getJSON(us, a.k);
      if (!u) return fail(401, 'auth');
      const b = await readJSON();
      if (str(b.name, 60).length >= 2) u.name = str(b.name, 60);
      if (typeof b.city === 'string') u.city = str(b.city, 60);
      if (normPhone(b.phone)) u.phone = normPhone(b.phone);
      await us.setJSON(a.k, u);
      return json({ user: pubUser(u) });
    }
    if (path === '/orders' && m === 'POST') {
      const a = authUser(req); if (!a) return fail(401, 'auth');
      const us = await store('users');
      const u = await getJSON(us, a.k);
      if (!u) return fail(401, 'auth');
      const b = await readJSON();
      if (b.hp) return json({ ok: true });
      const order = await createOrder(req, u, b);
      return order ? json({ ok: true, order }) : fail(400, 'items');
    }

    /* ----- admin ----- */
    if (path === '/admin/login' && m === 'POST') {
      const b = await readJSON();
      const ms = await store('meta');
      const lock = (await getJSON(ms, 'adminlock')) || { fails: 0, until: 0 };
      if (lock.until > Date.now()) return fail(429, 'locked');
      if (!eq(b.password || '', process.env.ADMIN_PASSWORD || '')) {
        lock.fails += 1;
        if (lock.fails >= 8) { lock.until = Date.now() + 15 * 60000; lock.fails = 0; }
        await ms.setJSON('adminlock', lock);
        return fail(401, 'credentials');
      }
      await ms.setJSON('adminlock', { fails: 0, until: 0 });
      return json({ token: sign({ r: 'admin' }, 12 * 3600) });
    }
    if (path.startsWith('/admin/')) {
      if (!authAdmin(req)) return fail(401, 'auth');
      if (path === '/admin/status') return json({ telegram: !!(tgToken() && (await notifyTargets()).length), storage: getStoreFn === memStore ? 'memory' : 'blobs', lastNotify: (await getJSON(await store('meta'), 'lastNotify')) || null });
      if (path === '/admin/telegram' && m === 'GET') {
        const s = await settings();
        const out = { token: !!tgToken(), chatId: process.env.TELEGRAM_CHAT_ID || s.chatId || '', admins: await adminTgIds(), siteUrl: s.siteUrl || '', webhook: false, chats: [], bot: '' };
        if (out.token) {
          const me = await tg('getMe');
          out.bot = (me.result && me.result.username) || '';
          const wi = await tg('getWebhookInfo');
          out.webhook = !!(wi.result && wi.result.url);
          if (!out.webhook) {
            const up = await tg('getUpdates');
            const seen = new Map();
            for (const u of Array.isArray(up.result) ? up.result : []) { const mm = u.message || u.channel_post || u.my_chat_member; const c = mm && mm.chat; if (c) seen.set(String(c.id), { id: String(c.id), type: c.type, name: c.title || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.username || '' }); }
            out.chats = [...seen.values()];
          }
        }
        return json(out);
      }
      if (path === '/admin/telegram' && m === 'POST') {
        const b = await readJSON();
        const patch = {};
        if (typeof b.chatId === 'string') patch.chatId = str(b.chatId, 40).replace(/[^\d-]/g, '');
        if (Array.isArray(b.adminTgIds)) patch.adminTgIds = b.adminTgIds.map(x => String(x).replace(/\D/g, '')).filter(Boolean).slice(0, 20);
        const next = await saveSettings(patch);
        return json({ ok: true, chatId: next.chatId || '', admins: await adminTgIds() });
      }
      if (path === '/admin/telegram/setup' && m === 'POST') {
        if (!tgToken()) return fail(400, 'no token');
        const origin = url.origin;
        const out = {};
        out.webhook = await tg('setWebhook', { url: origin + '/api/tg-webhook', secret_token: tgSecret(), allowed_updates: ['message', 'callback_query'], drop_pending_updates: false });
        out.profile = await applyBotProfile(tg);
        out.menu = await tg('setChatMenuButton', { menu_button: { type: 'web_app', text: "Do'kon", web_app: { url: origin } } });
        await saveSettings({ siteUrl: origin });
        return json({ ok: !!(out.webhook.ok && out.menu.ok), ...out });
      }
      if (path === '/admin/telegram/test' && m === 'POST') {
        const targets = await notifyTargets();
        if (!tgToken() || !targets.length) return json({ ok: false, error: !tgToken() ? 'no token' : 'no chat' }, 400);
        let ok = false, error = '';
        for (const c of targets) { const r = await tg('sendMessage', { chat_id: c, text: '✅ Test xabar: Telegram bildirishnomalari ishlayapti.' }); ok = ok || !!r.ok; if (!r.ok) error = r.description || error; }
        return json({ ok, error }, ok ? 200 : 400);
      }
      if (path === '/admin/products' && m === 'GET') return json((await products(req)).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)));
      if (path === '/admin/products' && m === 'PUT') {
        const b = await readJSON(1500000);
        if (!Array.isArray(b) || b.length > 400) return fail(400, 'products');
        const seen = new Set();
        const clean = b.map(cleanProduct).filter(p => (seen.has(p.id) ? false : seen.add(p.id)));
        await (await store('catalog')).setJSON('products', clean);
        return json({ ok: true, count: clean.length });
      }
      if (path === '/admin/image' && m === 'POST') {
        const type = (req.headers.get('content-type') || '').split(';')[0];
        if (!IMG_TYPES.includes(type)) return fail(415, 'type');
        const buf = Buffer.from(await req.arrayBuffer());
        if (!buf.length || buf.length > 3 * 1024 * 1024) return fail(413, 'size');
        const id = 'i' + Date.now().toString(36) + rid();
        await (await store('images')).set(id, buf, { metadata: { type } });
        return json({ url: '/api/img/' + id });
      }
      if (path === '/admin/orders' && m === 'GET') return json(await allOrders());
      const om = path.match(/^\/admin\/orders\/([\w-]+)$/);
      if (om) {
        const s = await store('orders');
        const o = await getJSON(s, om[1]);
        if (!o) return fail(404, 'not found');
        if (m === 'PATCH') { const b = await readJSON(); return json((await setOrderStatus(o.key, b.status)) || o); }
        if (m === 'DELETE') { await s.delete(o.key); return json({ ok: true }); }
      }
      if (path === '/admin/users' && m === 'GET') {
        const us = await store('users');
        const { blobs } = await us.list({ prefix: 'user-' });
        const rows = (await Promise.all(blobs.map(b => getJSON(us, b.key)))).filter(Boolean)
          .map(u => ({ ...pubUser(u), orders: (u.orderIds || []).length, lastLogin: u.lastLogin || 0 })).sort((a, b) => b.createdAt - a.createdAt);
        return json(rows);
      }
      const um = path.match(/^\/admin\/users\/(\w+)$/);
      if (um) {
        const us = await store('users');
        const key = 'user-' + um[1];
        const u = await getJSON(us, key);
        if (!u) return fail(404, 'not found');
        if (m === 'PATCH') {
          const b = await readJSON();
          if (typeof b.password === 'string' && b.password.length >= 6) { u.pass = hashPw(b.password); u.fails = 0; u.lockUntil = 0; }
          if (b.name) u.name = str(b.name, 60);
          if (typeof b.city === 'string') u.city = str(b.city, 60);
          if (normPhone(b.phone)) u.phone = normPhone(b.phone);
          await us.setJSON(key, u);
          return json(pubUser(u));
        }
        if (m === 'DELETE') { await us.delete(key); return json({ ok: true }); }
      }
    }
    return fail(404, 'not found');
  } catch (e) {
    console.error(e && e.message);
    return fail(e && e.message === 'big' ? 413 : 500, 'server');
  }
}
