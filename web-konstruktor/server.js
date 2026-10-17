'use strict';
// Impro IT platforma serveri (tashqi kutubxonasiz, faqat Node.js 18+).
// Ishga tushirish: node server.js   |   Ma'lumotlar papkasi: DATA_DIR (standart: ./data)
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const UPLOADS = path.join(DATA, 'uploads');
const PROJECTS = path.join(DATA, 'projects');
const F = (n) => path.join(DATA, n);
const PORT = Number(process.env.PORT) || 3000;
const TRUST_PROXY = process.env.TRUST_PROXY === '1';   // Caddy / Nginx / Render orqasida ishlaganda yoqiladi
const ipOf = (req) => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '';
const isHttps = (req) => TRUST_PROXY && String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
for (const d of [DATA, UPLOADS, PROJECTS]) fs.mkdirSync(d, { recursive: true });

// Birinchi ishga tushishda namunaviy sayt va narxlarni ko'chirib qo'yamiz
for (const [src, dst] of [[path.join(ROOT, 'data', 'site.json'), F('site.json')], [path.join(PUBLIC, 'pricing.json'), F('pricing.json')]]) {
  if (!fs.existsSync(dst) && fs.existsSync(src) && src !== dst) fs.copyFileSync(src, dst);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon' };
const IMG_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };

/* ---------- Fayl bazasi ---------- */
const readJSON = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fb; } };
const writeJSON = (f, obj) => { const tmp = f + '.' + process.pid + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(obj)); fs.renameSync(tmp, f); };
const db = {
  users: () => readJSON(F('users.json'), []), saveUsers: (v) => writeJSON(F('users.json'), v),
  orders: () => readJSON(F('orders.json'), []), saveOrders: (v) => writeJSON(F('orders.json'), v),
  projects: () => readJSON(F('projects.json'), []), saveProjects: (v) => writeJSON(F('projects.json'), v),
  site: () => readJSON(F('site.json'), {}), settings: () => Object.assign({ notify: {}, allowedOrigins: [] }, readJSON(F('settings.json'), {})),
  pricing: () => Object.assign({ currency: "so'm", plans: [], templatePrice: { usd: 10, rate: 12800 } }, readJSON(F('pricing.json'), {})),
};
const newId = (n = 6) => crypto.randomBytes(n).toString('hex');
const projFile = (id) => path.join(PROJECTS, id.replace(/[^a-f0-9]/g, '') + '.json');

/* ---------- Parol, token, sessiya ---------- */
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
let secret = readJSON(F('secret.json'), null);
if (!secret) {
  const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(5).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  secret = { salt, hash: hashPw(pw, salt), key: crypto.randomBytes(32).toString('hex') };
  writeJSON(F('secret.json'), secret);
  console.log(`\n  ADMIN PAROLI (birinchi ishga tushirish): ${pw}\n  Uni admin paneldan o'zgartiring.\n`);
}
const sign = (v) => crypto.createHmac('sha256', secret.key).update(v).digest('hex');
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const makeAdminToken = () => { const exp = String(Date.now() + 12 * 3600e3); return `${exp}.${sign(exp)}`; };
const validAdminToken = (t) => { if (!t) return false; const [exp, sig] = t.split('.'); return !!(exp && sig && Number(exp) > Date.now() && eq(sig, sign(exp))); };
const isAdmin = (req) => { const m = /(?:^|;\s*)sid=([^;]+)/.exec(req.headers.cookie || ''); return validAdminToken(m && m[1]); };
const makeUserToken = (uid) => { const p = `u.${uid}.${Date.now() + 30 * 86400e3}`; return `${p}.${sign(p)}`; };
function userFromReq(req) {
  const m = /^Bearer\s+(\S+)$/.exec(req.headers.authorization || ''); if (!m) return null;
  const parts = m[1].split('.'); if (parts.length !== 4 || parts[0] !== 'u') return null;
  const p = parts.slice(0, 3).join('.'); if (!eq(parts[3], sign(p)) || Number(parts[2]) < Date.now()) return null;
  return db.users().find((u) => u.id === parts[1]) || null;
}
const pubUser = (u) => ({ id: u.id, name: u.name, phone: u.phone, email: u.email || '', createdAt: u.createdAt });

/* ---------- Yordamchilar ---------- */
const hits = new Map();
const limited = (ip, key, max, windowMs) => { const k = key + '|' + ip, now = Date.now(); const a = (hits.get(k) || []).filter((t) => now - t < windowMs); a.push(now); hits.set(k, a); return a.length > max; };
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some((t) => now - t < 3600e3)) hits.delete(k); }, 600e3).unref();
const str = (v, max = 500) => String(v == null ? '' : v).trim().slice(0, max);
const digits = (s) => String(s || '').replace(/\D/g, '');
const phoneKey = (s) => digits(s).slice(-9);
const goodPhone = (s) => /^[+\d][\d\s()\-]{6,}$/.test(String(s || '').trim()) && digits(s).length >= 7;
const goodEmail = (s) => /^\S+@\S+\.\S+$/.test(String(s || ''));

const send = (res, code, body, headers = {}) => {
  const obj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(code, { 'Content-Type': obj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(obj ? JSON.stringify(body) : body);
};
const readBody = (req, limit = 8 * 1024 * 1024) => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', (c) => { size += c.length; if (size > limit) { reject(Object.assign(new Error('Hajm juda katta'), { code: 413 })); req.destroy(); return; } chunks.push(c); });
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(Object.assign(new Error("Noto'g'ri ma'lumot"), { code: 400 })); } });
  req.on('error', reject);
});

function notifyTelegram(text) {
  const n = db.settings().notify || {};
  const token = process.env.TELEGRAM_BOT_TOKEN || n.telegramBotToken, chat = process.env.TELEGRAM_CHAT_ID || n.telegramChatId;
  if (!token || !chat) return;
  const data = JSON.stringify({ chat_id: chat, text: String(text).slice(0, 3500) });
  const r = https.request({ hostname: 'api.telegram.org', path: `/bot${token}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => res.resume());
  r.on('error', () => {}); r.write(data); r.end();
}

/* ---------- Modullar: eksport, to'lov, AI ---------- */
const exporter = require('./lib/export')({ PUBLIC, UPLOADS });
const readRaw = (req, limit = 64 * 1024) => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', (c) => { size += c.length; if (size > limit) { reject(Object.assign(new Error('Hajm juda katta'), { code: 413 })); req.destroy(); return; } chunks.push(c); });
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8'))); req.on('error', reject);
});
const pay = require('./lib/pay')({
  readJSON, writeJSON, file: F('payments.json'), newId, getSettings: () => db.settings(),
  onPaid: (pm) => {
    const all = db.projects(), meta = all.find((x) => x.id === pm.projectId);
    if (meta) { meta.paid = { at: new Date().toISOString(), usd: pm.usd, uzs: pm.uzs, method: pm.method, paymentId: pm.id }; meta.updatedAt = meta.paid.at; db.saveProjects(all); }
    notifyTelegram(`To'lov qabul qilindi (${pm.method})\n${meta ? meta.name : pm.projectId}\n$${pm.usd} = ${pm.uzs} so'm`);
  },
  onRefund: (pm) => {
    const all = db.projects(), meta = all.find((x) => x.id === pm.projectId);
    if (meta) { meta.paid = null; meta.published = false; db.saveProjects(all); }
    notifyTelegram(`To'lov qaytarildi/bekor qilindi: ${meta ? meta.name : pm.projectId}`);
  },
});
const ai = require('./lib/ai')({ getSettings: () => db.settings() });
let lastOrigin = '';
const bots = require('./lib/bot')({ F, readJSON, writeJSON, newId, getOrders: () => db.orders(), saveOrders: (v) => db.saveOrders(v), baseUrl: () => String(process.env.PUBLIC_URL || (rootDomains()[0] ? 'https://' + rootDomains()[0] : lastOrigin)).replace(/\/$/, '') });

const publicBase = () => String(process.env.PUBLIC_URL || (rootDomains()[0] ? 'https://' + rootDomains()[0] : lastOrigin)).replace(/\/$/, '');
const adminBot = require('./lib/adminbot')({ db, pay, tg: bots.tg, readJSON, writeJSON, F, newId, checkPassword: (pw) => eq(hashPw(String(pw || ''), secret.salt), secret.hash), baseUrl: publicBase, limited: (k, n, max, w) => limited(k, n, max, w), siteUrl: (m) => siteUrl(m) });
// Server ishga tushganda (token va HTTPS domen bo'lsa) admin bot webhook'i o'zi o'rnatiladi
setTimeout(() => { if ((process.env.TELEGRAM_BOT_TOKEN || (db.settings().notify || {}).telegramBotToken) && /^https:\/\//.test(publicBase())) adminBot.connect().catch((e) => console.log('Admin bot ulanmadi:', e.message)); }, 4000).unref();

/* ---------- Subdomenlar, o'z domeni va statistika ---------- */
const RESERVED = new Set(['www', 'mail', 'api', 'app', 'admin', 'kabinet', 'yaratish', 'ftp', 'smtp', 'imap', 'pop', 'ns1', 'ns2', 'static', 'cdn', 'help', 'support', 'blog', 'shop', 'test', 'demo', 'root', 'dashboard', 'login', 'impro', 'status']);
const rootDomains = () => [...new Set([...String(process.env.ROOT_DOMAIN || '').split(','), ...(db.settings().domains || [])].map((x) => String(x).trim().toLowerCase()).filter(Boolean))];
const hostOf = (req) => String(req.headers.host || '').split(':')[0].toLowerCase();
const isMainHost = (h) => !h || h === 'localhost' || /^[\d.]+$/.test(h) || /^\[/.test(h) || rootDomains().some((r) => h === r || h === 'www.' + r);
const goodSlug = (v) => /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(v) && !RESERVED.has(v) && !/--/.test(v);
const goodDomain = (v) => /^(?=.{4,100}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(v);
function tenantOf(host) {
  if (isMainHost(host)) return null;
  const projects = db.projects();
  for (const r of rootDomains()) {
    if (host.endsWith('.' + r)) { const sl = host.slice(0, -(r.length + 1)); return projects.find((x) => x.published && x.slug === sl) || { missing: true }; }
  }
  return projects.find((x) => x.published && x.customDomain === host) || (rootDomains().length ? { missing: true } : null);
}
const tenantData = (meta) => readJSON(projFile(meta.id), null);
const statsMem = readJSON(F('stats.json'), {});
const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
function hit(pid, k) { const d = (statsMem[pid] = statsMem[pid] || {}), day = dayKey(); (d[day] = d[day] || { v: 0, o: 0 })[k]++; }
function flushStats() { try { for (const pid of Object.keys(statsMem)) { const keys = Object.keys(statsMem[pid]).sort(); for (const k of keys.slice(0, Math.max(0, keys.length - 90))) delete statsMem[pid][k]; } writeJSON(F('stats.json'), statsMem); } catch { /* ignore */ } }
setInterval(flushStats, 20000).unref();
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { flushStats(); process.exit(0); });
function statsOf(pid) {
  const d = statsMem[pid] || {}; const out = [];
  for (let i = 29; i >= 0; i--) { const k = dayKey(Date.now() - i * 864e5); out.push({ day: k, v: (d[k] || {}).v || 0, o: (d[k] || {}).o || 0 }); }
  return out;
}
const originOf = (req) => `${isHttps(req) ? 'https' : 'http'}://${req.headers.host}`;
const siteUrl = (meta) => { const r = rootDomains()[0]; return meta.customDomain ? `https://${meta.customDomain}` : r ? `https://${meta.slug}.${r}` : ''; };

/* ---------- CORS (faqat ochiq API uchun) ---------- */
function allowedOrigins() { return [...(db.settings().allowedOrigins || []), ...String(process.env.ALLOWED_ORIGINS || '').split(',')].map((s) => s.trim().replace(/\/$/, '')).filter(Boolean); }
function cors(req, res, pathname) {
  const o = req.headers.origin; if (!o || pathname.startsWith('/api/admin')) return;
  const host = req.headers.host; let same = false; try { same = new URL(o).host === host; } catch { /* ignore */ }
  if (same || allowedOrigins().includes(o.replace(/\/$/, ''))) {
    res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); res.setHeader('Access-Control-Max-Age', '600');
  }
}

/* ---------- Buyurtma yordamchilari ---------- */
function siteItems(site) {
  const m = {}; for (const s of (site || db.site()).sections || []) if (['products', 'menu'].includes(s.type)) for (const p of s.items || []) if (p && p.id) m[p.id] = p; return m;
}
function cleanOrder(b, user, site) {
  const type = ['order', 'booking', 'message', 'brief'].includes(b.type) ? b.type : 'order';
  const local = siteItems(site);
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60).map((i) => {
    const l = local[i && i.id]; const qty = Math.min(999, Math.max(1, parseInt(i && i.qty, 10) || 1));
    return l ? { id: str(l.id, 40), name: str(l.name, 120), price: Number(l.price) || 0, qty } : { id: str(i && i.id, 40), name: str(i && i.name, 120), price: Math.max(0, Number(i && i.price) || 0), qty };
  }).filter((i) => i.name);
  const extra = {}; if (b.extra && typeof b.extra === 'object') for (const k of Object.keys(b.extra).slice(0, 30)) extra[str(k, 40)] = str(b.extra[k], 700);
  const shipping = Math.max(0, Number(b.shipping) || 0);
  const total = items.reduce((a, i) => a + i.price * i.qty, 0) + (items.length ? shipping : 0);
  return { type, name: str(b.name, 100) || (user && user.name) || '', phone: str(b.phone, 40) || (user && user.phone) || '', message: str(b.message, type === 'brief' ? 3000 : 1000), items, extra, shipping, total };
}

/* ---------- API ---------- */
async function api(req, res, url) {
  const ip = ipOf(req);
  const pn = url.pathname, route = `${req.method} ${pn}`;
  cors(req, res, pn);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  /* --- subdomendagi sayt (tenant): faqat buyurtma qabul qiladi --- */
  if (req.tenant) {
    if (route === 'POST /api/order') {
      const t = req.tenant, data = tenantData(t);
      if (!data || limited(ip, 'torder' + t.id, 10, 600e3)) return send(res, 429, { error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." });
      const b = await readBody(req, 100 * 1024), o = cleanOrder(b, null, data);
      if (o.name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
      if (!goodPhone(o.phone)) return send(res, 400, { error: "Telefon raqamini to'g'ri kiriting" });
      if (o.type === 'order' && !o.items.length) return send(res, 400, { error: "Savat bo'sh" });
      const order = { id: newId(4), date: new Date().toISOString(), userId: '', tenant: t.id, ...o, status: 'yangi', note: '' };
      const orders = db.orders(); orders.unshift(order); db.saveOrders(orders.slice(0, 50000)); hit(t.id, 'o');
      return send(res, 200, { ok: true, id: order.id });
    }
    if (route === 'GET /api/site') return send(res, 200, tenantData(req.tenant) || {});
    return send(res, 404, { error: 'Topilmadi' });
  }

  /* --- ochiq --- */
  if (route === 'GET /api/site') return send(res, 200, db.site());
  if (route === 'GET /api/pricing') return send(res, 200, { ...db.pricing(), payMethods: pay.methods(), manualPay: db.settings().manualPay || '', rootDomain: rootDomains()[0] || '', contacts: { phone: (db.site().contacts || {}).phone || '', telegram: (db.site().contacts || {}).telegram || '' }, aiEnabled: ai.enabled() });

  /* --- hisob --- */
  if (route === 'POST /api/auth/register') {
    if (limited(ip, 'reg', 6, 3600e3)) return send(res, 429, { error: "Juda ko'p urinish. Keyinroq qayta urinib ko'ring." });
    const b = await readBody(req, 8192);
    const name = str(b.name, 80), phone = str(b.phone, 30), email = str(b.email, 120).toLowerCase(), pw = String(b.password || '');
    if (name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
    if (!goodPhone(phone)) return send(res, 400, { error: "Telefon raqamini to'g'ri kiriting" });
    if (email && !goodEmail(email)) return send(res, 400, { error: "Email noto'g'ri" });
    if (pw.length < 6 || pw.length > 100) return send(res, 400, { error: "Parol kamida 6 belgi bo'lsin" });
    const users = db.users();
    if (users.some((u) => phoneKey(u.phone) === phoneKey(phone))) return send(res, 409, { error: "Bu telefon raqam bilan hisob mavjud. Iltimos, kiring." });
    if (email && users.some((u) => u.email && u.email === email)) return send(res, 409, { error: 'Bu email bilan hisob mavjud. Iltimos, kiring.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const u = { id: newId(6), name, phone, email, salt, hash: hashPw(pw, salt), createdAt: new Date().toISOString() };
    users.push(u); db.saveUsers(users);
    notifyTelegram(`Yangi mijoz ro'yxatdan o'tdi\n${name}\n${phone}${email ? '\n' + email : ''}`);
    return send(res, 200, { token: makeUserToken(u.id), user: pubUser(u) });
  }
  if (route === 'POST /api/auth/login') {
    const b = await readBody(req, 4096), id = str(b.id, 120).toLowerCase(), pw = String(b.password || '');
    if (limited(ip, 'login', 12, 600e3) || limited(id, 'loginid', 8, 600e3)) return send(res, 429, { error: "Juda ko'p urinish. 10 daqiqadan so'ng qayta urining." });
    const users = db.users();
    const u = id.includes('@') ? users.find((x) => x.email === id) : users.find((x) => phoneKey(x.phone) === phoneKey(id) && digits(id).length >= 7);
    if (!u || !eq(hashPw(pw, u.salt), u.hash)) return send(res, 401, { error: "Telefon/email yoki parol noto'g'ri" });
    return send(res, 200, { token: makeUserToken(u.id), user: pubUser(u) });
  }
  const me = userFromReq(req);
  if (route === 'GET /api/me') return me ? send(res, 200, { user: pubUser(me) }) : send(res, 401, { error: 'Kirish talab qilinadi' });
  if (route === 'PUT /api/me' && me) {
    const b = await readBody(req, 4096), users = db.users(), u = users.find((x) => x.id === me.id);
    const name = str(b.name, 80), email = str(b.email, 120).toLowerCase(), phone = str(b.phone, 30);
    if (name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
    if (email && !goodEmail(email)) return send(res, 400, { error: "Email noto'g'ri" });
    if (phone && !goodPhone(phone)) return send(res, 400, { error: "Telefon raqamini to'g'ri kiriting" });
    if (email && users.some((x) => x.id !== u.id && x.email === email)) return send(res, 409, { error: 'Bu email band' });
    if (phone && users.some((x) => x.id !== u.id && phoneKey(x.phone) === phoneKey(phone))) return send(res, 409, { error: 'Bu telefon raqam band' });
    u.name = name; u.email = email; if (phone) u.phone = phone; db.saveUsers(users);
    return send(res, 200, { user: pubUser(u) });
  }
  if (route === 'POST /api/me/password' && me) {
    const b = await readBody(req, 4096), users = db.users(), u = users.find((x) => x.id === me.id);
    if (limited(ip, 'chpw', 8, 600e3)) return send(res, 429, { error: "Juda ko'p urinish" });
    if (!eq(hashPw(String(b.old || ''), u.salt), u.hash)) return send(res, 400, { error: "Joriy parol noto'g'ri" });
    const np = String(b.password || ''); if (np.length < 6) return send(res, 400, { error: "Yangi parol kamida 6 belgi bo'lsin" });
    u.salt = crypto.randomBytes(16).toString('hex'); u.hash = hashPw(np, u.salt); db.saveUsers(users);
    return send(res, 200, { ok: true });
  }

  /* --- buyurtma (hisob bo'lsa unga bog'lanadi) --- */
  if (route === 'POST /api/order') {
    if (limited(ip, 'order', 10, 600e3)) return send(res, 429, { error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." });
    const b = await readBody(req, 200 * 1024);
    const site = db.site(), acc = site.account || {}, gate = [];
    if (acc.enabled) { if (acc.requireOrder !== false) gate.push('order', 'brief'); if (acc.requireBooking) gate.push('booking'); }
    const o = cleanOrder(b, me);
    if (gate.includes(o.type) && !me) return send(res, 401, { error: "Buyurtma berish uchun hisobingizga kiring", needAuth: true });
    if (o.name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
    if (!goodPhone(o.phone)) return send(res, 400, { error: "Telefon raqamini to'g'ri kiriting" });
    if (o.type === 'order' && !o.items.length) return send(res, 400, { error: "Savat bo'sh" });
    if (o.type === 'brief' && !Object.keys(o.extra).length) return send(res, 400, { error: "So'rov ma'lumotlari bo'sh" });
    const order = { id: newId(4), date: new Date().toISOString(), userId: me ? me.id : '', ...o, status: 'yangi', note: '' };
    const orders = db.orders(); orders.unshift(order); db.saveOrders(orders.slice(0, 20000));
    adminBot.notifyOrder(order);
    const cur = (site.orders && site.orders.currency) || '';
    notifyTelegram(`${o.type === 'booking' ? 'Yangi ariza' : o.type === 'message' ? 'Yangi xabar' : o.type === 'brief' ? "Yangi LOYIHA SO'ROVI" : 'Yangi buyurtma'} #${order.id}\n${o.name}\n${o.phone}\n` + o.items.map((i) => `- ${i.name} x${i.qty}`).join('\n') + (o.total ? `\nJami: ${o.total} ${cur}` : '') + Object.entries(o.extra).map(([k, v]) => `\n${k}: ${v}`).join('') + (o.message ? `\n${o.message}` : ''));
    return send(res, 200, { ok: true, id: order.id });
  }

  /* --- Admin Telegram bot: webhook va mini ilova sessiyasi --- */
  const abw = /^\/api\/adminbot\/([a-f0-9]{16,64})$/.exec(pn);
  if (abw && req.method === 'POST') {
    const cfgA = adminBot.cfg();
    if (!cfgA.secret || !eq(cfgA.secret, abw[1]) || (req.headers['x-telegram-bot-api-secret-token'] && !eq(req.headers['x-telegram-bot-api-secret-token'], cfgA.secret))) return send(res, 403, { error: "Ruxsat yo'q" });
    const upd = await readBody(req, 256 * 1024);
    try { await adminBot.handle(upd); } catch (e) { console.error('admin bot xatosi', e.message); }
    return send(res, 200, { ok: true });
  }
  if (route === 'POST /api/adminbot/session') {
    if (limited(ip, 'absess', 20, 600e3)) return send(res, 429, { error: "Juda ko'p urinish" });
    const b = await readBody(req, 8192), tkn = process.env.TELEGRAM_BOT_TOKEN || (db.settings().notify || {}).telegramBotToken;
    const user = tkn ? bots.verifyInitData({ token: tkn }, b.initData, 3600) : null;
    if (!user) return send(res, 401, { error: "Telegram ma'lumoti tasdiqlanmadi. Panelni botdagi tugma orqali oching." });
    if (!adminBot.cfg().chats.some((c) => c.id === user.id)) return send(res, 403, { error: "Avval botda /login PAROL bilan kiring" });
    return send(res, 200, { ok: true }, { 'Set-Cookie': `sid=${makeAdminToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${isHttps(req) ? '; Secure' : ''}` });
  }

  /* --- Telegram bot webhook va mini ilova --- */
  const tw = /^\/api\/tg\/([a-f0-9]{6,24})\/([a-f0-9]{16,64})$/.exec(pn);
  if (tw && req.method === 'POST') {
    const bot = bots.find(tw[1]);
    if (!bot || !eq(bot.secret, tw[2]) || (req.headers['x-telegram-bot-api-secret-token'] && !eq(req.headers['x-telegram-bot-api-secret-token'], bot.secret))) return send(res, 403, { error: 'Ruxsat yo\'q' });
    const upd = await readBody(req, 256 * 1024);
    try { await bots.handle(bot, upd); } catch (e) { console.error('bot xatosi', bot.id, e.message); }
    return send(res, 200, { ok: true });
  }
  const ap2 = /^\/api\/app\/([a-f0-9]{6,24})\/(config|order)$/.exec(pn);
  if (ap2) {
    const bot = bots.find(ap2[1]); if (!bot || bot.status !== 'faol') return send(res, 404, { error: 'Do\'kon topilmadi' });
    if (ap2[2] === 'config' && req.method === 'GET') return send(res, 200, bots.publicConfig(bot));
    if (ap2[2] === 'order' && req.method === 'POST') {
      if (limited(ip, 'apporder' + bot.id, 12, 600e3)) return send(res, 429, { error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." });
      const b = await readBody(req, 64 * 1024), user = bots.verifyInitData(bot, b.initData);
      if (!user) return send(res, 401, { error: "Buyurtma berish uchun do'konni Telegram ichida oching" });
      const name = str(b.name, 100), phone = str(b.phone, 40);
      if (name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
      if (!goodPhone(phone)) return send(res, 400, { error: "Telefon raqamini to'g'ri kiriting" });
      try {
        const o = bots.placeOrder(bot, { items: b.items, name, phone, note: str(b.note, 500), tgUser: user });
        bots.tg(bot.token, 'sendMessage', { chat_id: user.id, text: `✅ Buyurtmangiz qabul qilindi! #${o.id}\nJami: ${o.total} ${bot.config.currency}\nTez orada siz bilan bog'lanamiz.` }).catch(() => {});
        return send(res, 200, { ok: true, id: o.id, total: o.total });
      } catch (e) { return send(res, 400, { error: e.message }); }
    }
  }

  /* --- to'lov tizimlari webhooklari --- */
  if (route === 'POST /api/pay/payme') {
    const raw = await readRaw(req); let body = {}; try { body = JSON.parse(raw || '{}'); } catch { /* ignore */ }
    return send(res, 200, pay.payme(body, req.headers.authorization));
  }
  if (route === 'POST /api/pay/click') {
    const raw = await readRaw(req); let f = {};
    try { f = /^\s*\{/.test(raw) ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw)); } catch { /* ignore */ }
    return send(res, 200, pay.click(f));
  }

  /* --- AI yordamchi --- */
  if (route === 'POST /api/ai/generate') {
    if (!me) return send(res, 401, { error: 'Kirish talab qilinadi' });
    if (limited(me.id, 'ai', 8, 3600e3)) return send(res, 429, { error: "AI so'rovlari soatiga 8 ta. Keyinroq urinib ko'ring." });
    const b = await readBody(req, 64 * 1024), d = str(b.description, 1500);
    if (d.length < 8) return send(res, 400, { error: "Biznesingiz haqida kamida bir jumla yozing" });
    try { return send(res, 200, { ok: true, ...(await ai.generate(d, b.templates)) }); } catch (e) { return send(res, 400, { error: e.message }); }
  }

  /* --- mijozning shaxsiy ma'lumotlari --- */
  if (pn.startsWith('/api/my/')) {
    if (!me) return send(res, 401, { error: 'Kirish talab qilinadi' });
    if (route === 'GET /api/my/orders') return send(res, 200, db.orders().filter((o) => o.userId === me.id && !o.tenant && !o.bot).slice(0, 200));
    if (route === 'GET /api/my/leads') {
      const mine = new Map(db.projects().filter((p) => p.userId === me.id).map((p) => [p.id, p.name]));
      return send(res, 200, db.orders().filter((o) => o.tenant && mine.has(o.tenant)).slice(0, 500).map((o) => ({ ...o, site: mine.get(o.tenant) })));
    }
    if (route === 'GET /api/my/projects') return send(res, 200, db.projects().filter((p) => p.userId === me.id).map((p) => ({ ...p, url: p.published ? siteUrl(p) : '' })));
    if (route === 'POST /api/my/projects') {
      if (limited(me.id, 'pcreate', 20, 3600e3)) return send(res, 429, { error: "Juda ko'p yangi loyiha. Keyinroq urinib ko'ring." });
      const mine = db.projects().filter((p) => p.userId === me.id); if (mine.length >= 25) return send(res, 400, { error: "Loyihalar soni chegarasi (25). Keraksizini o'chiring." });
      const b = await readBody(req, 16 * 1024 * 1024);
      if (!b.data || typeof b.data !== 'object' || !Array.isArray(b.data.sections)) return send(res, 400, { error: "Noto'g'ri loyiha" });
      const id = newId(6), now = new Date().toISOString(), json = JSON.stringify(b.data);
      fs.writeFileSync(projFile(id), json);
      const meta = { id, userId: me.id, name: str(b.name || (b.data.company && b.data.company.name), 80) || 'Yangi sayt', template: str(b.template || b.data.template, 30), status: 'qoralama', plan: '', price: '', note: '', adminNote: '', createdAt: now, updatedAt: now, submittedAt: '', size: json.length };
      const all = db.projects(); all.unshift(meta); db.saveProjects(all);
      return send(res, 200, { project: meta });
    }
    if (route === 'POST /api/my/upload') {
      if (limited(me.id, 'myupload', 80, 3600e3)) return send(res, 429, { error: "Juda ko'p rasm yuklandi. Keyinroq urinib ko'ring." });
      const b = await readBody(req, 5 * 1024 * 1024);
      const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
      if (!m) return send(res, 400, { error: 'Faqat PNG, JPG, WEBP yoki GIF rasm yuklang' });
      const buf = Buffer.from(m[2], 'base64'); if (buf.length > 3 * 1024 * 1024) return send(res, 413, { error: 'Rasm 3 MB dan oshmasin' });
      const name = `${Date.now()}-${newId(3)}${IMG_EXT[m[1]]}`; fs.writeFileSync(path.join(UPLOADS, name), buf);
      return send(res, 200, { url: `/uploads/${name}` });
    }
    /* --- Telegram botlarim --- */
    if (route === 'GET /api/my/bots') { const os = db.orders(); return send(res, 200, bots.list().filter((x) => x.userId === me.id).map((x) => ({ ...bots.pub(x), subscribers: bots.subscribers(x.id), orders: os.filter((o) => o.bot === x.id).length }))); }
    if (route === 'POST /api/my/bots') {
      if (limited(me.id, 'botcreate', 10, 3600e3)) return send(res, 429, { error: "Juda ko'p urinish. Keyinroq urinib ko'ring." });
      if (bots.list().filter((x) => x.userId === me.id).length >= 5) return send(res, 400, { error: "Botlar soni chegarasi (5)" });
      const b = await readBody(req, 4096);
      try { return send(res, 200, await bots.create(me.id, b.token, str(b.name, 60))); } catch (e) { return send(res, 400, { error: e.message }); }
    }
    const bm = /^\/api\/my\/bots\/([a-f0-9]{6,24})(?:\/(connect|broadcast|orders))?$/.exec(pn);
    if (bm) {
      const bot = bots.find(bm[1]); if (!bot || bot.userId !== me.id) return send(res, 404, { error: 'Bot topilmadi' });
      const act = bm[2] || '';
      if (!act && req.method === 'GET') return send(res, 200, { ...bots.pub(bot), subscribers: bots.subscribers(bot.id) });
      if (!act && req.method === 'PUT') {
        const b = await readBody(req, 1024 * 1024), x = bots.update(bot, b.config);
        let r = { webhook: !!x.webhookOk }; try { r = await bots.reconnect(x); } catch (e) { r = { webhook: false, warn: e.message }; }
        return send(res, 200, { ...bots.pub(bots.find(bot.id)), ...r });
      }
      if (!act && req.method === 'DELETE') { await bots.remove(bot); return send(res, 200, { ok: true }); }
      if (act === 'connect' && req.method === 'POST') { try { return send(res, 200, { ...(await bots.reconnect(bot)), bot: bots.pub(bots.find(bot.id)) }); } catch (e) { return send(res, 400, { error: 'Ulanmadi: ' + e.message }); } }
      if (act === 'broadcast' && req.method === 'POST') {
        if (limited(me.id, 'broadcast', 6, 3600e3)) return send(res, 429, { error: "Soatiga 6 ta xabar yuborish mumkin" });
        const b = await readBody(req, 8192), text = str(b.text, 3000); if (text.length < 2) return send(res, 400, { error: 'Xabar matnini yozing' });
        const n = bots.subscribers(bot.id); bots.broadcast(bot, text).catch(() => {}); return send(res, 200, { ok: true, total: n });
      }
      if (act === 'orders' && req.method === 'GET') return send(res, 200, db.orders().filter((o) => o.bot === bot.id).slice(0, 300));
    }
    const pm = /^\/api\/my\/projects\/([a-f0-9]{6,24})(\/(?:submit|checkout|export|publish|domain|stats))?$/.exec(pn);
    if (pm) {
      const all = db.projects(), meta = all.find((p) => p.id === pm[1] && p.userId === me.id);
      if (!meta) return send(res, 404, { error: 'Loyiha topilmadi' });
      const act = (pm[2] || '').slice(1);
      if (req.method === 'GET' && !act) return send(res, 200, { project: { ...meta, url: meta.published ? siteUrl(meta) : '' }, data: readJSON(projFile(meta.id), null) });
      if (act === 'stats' && req.method === 'GET') { const series = statsOf(meta.id); return send(res, 200, { series, views: series.reduce((a, x) => a + x.v, 0), orders: series.reduce((a, x) => a + x.o, 0) }); }
      if (act === 'checkout' && req.method === 'POST') {
        if (meta.paid) return send(res, 200, { paid: true });
        if (limited(me.id, 'checkout', 20, 3600e3)) return send(res, 429, { error: "Juda ko'p urinish" });
        const b = await readBody(req, 4096), tp = db.pricing().templatePrice || { usd: 10, rate: 12800 }, avail = pay.methods();
        const method = ['payme', 'click'].includes(b.method) && avail[b.method] ? b.method : 'manual';
        const ret = `${originOf(req)}/yaratish.html?p=${meta.id}&paid=1`;
        if (method === 'manual') {
          const ex = pay.list().find((x) => x.projectId === meta.id && x.method === 'manual' && x.state === 'pending') || pay.create({ projectId: meta.id, userId: me.id, usd: tp.usd, rate: tp.rate, method: 'manual' });
          adminBot.notifyPayment(ex, meta, me);
          notifyTelegram(`Shablon sotib olish so'rovi (qo'lda to'lov)\nMijoz: ${me.name} (${me.phone})\nSayt: ${meta.name}\nSumma: $${tp.usd} (${ex.uzs} so'm)`);
          return send(res, 200, { manual: true, payment: { id: ex.id, usd: ex.usd, uzs: ex.uzs }, contacts: db.site().contacts || {}, text: db.settings().manualPay || '' });
        }
        const pmt = pay.create({ projectId: meta.id, userId: me.id, usd: tp.usd, rate: tp.rate, method });
        return send(res, 200, { payment: { id: pmt.id, usd: pmt.usd, uzs: pmt.uzs }, payUrl: pay.checkoutUrl(pmt, ret) });
      }
      if (act === 'export' && req.method === 'GET') {
        if (!meta.paid) return send(res, 402, { error: "Yuklab olish uchun avval saytni sotib oling" });
        const data = readJSON(projFile(meta.id), null); if (!data) return send(res, 404, { error: "Ma'lumot topilmadi" });
        const fn = (String(meta.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sayt') + '.html';
        return send(res, 200, exporter.standalone(data), { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `attachment; filename="${fn}"` });
      }
      if (act === 'publish') {
        if (!meta.paid) return send(res, 402, { error: "Joylash uchun avval saytni sotib oling" });
        if (req.method === 'DELETE') { meta.published = false; db.saveProjects(all); return send(res, 200, { project: meta }); }
        if (req.method === 'POST') {
          const b = await readBody(req, 2048), sl = str(b.slug, 40).toLowerCase();
          if (!rootDomains().length) return send(res, 400, { error: "Server domeni sozlanmagan (ROOT_DOMAIN)" });
          if (!goodSlug(sl)) return send(res, 400, { error: "Manzil 3–30 belgi: kichik harf, raqam va chiziqcha bo'lsin" });
          if (all.some((x) => x.id !== meta.id && x.slug === sl)) return send(res, 409, { error: 'Bu manzil band. Boshqasini tanlang.' });
          meta.slug = sl; meta.published = true; meta.updatedAt = new Date().toISOString(); db.saveProjects(all);
          return send(res, 200, { project: { ...meta, url: siteUrl(meta) } });
        }
      }
      if (act === 'domain' && req.method === 'POST') {
        if (!meta.paid) return send(res, 402, { error: "Avval saytni sotib oling" });
        const b = await readBody(req, 2048), dm = str(b.domain, 100).toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!dm) { meta.customDomain = ''; db.saveProjects(all); return send(res, 200, { project: meta }); }
        if (!goodDomain(dm) || rootDomains().some((r) => dm === r || dm.endsWith('.' + r))) return send(res, 400, { error: "Domen noto'g'ri" });
        if (all.some((x) => x.id !== meta.id && x.customDomain === dm)) return send(res, 409, { error: 'Bu domen band' });
        meta.customDomain = dm; db.saveProjects(all); return send(res, 200, { project: { ...meta, url: siteUrl(meta) } });
      }
      if (act && act !== 'submit') return send(res, 405, { error: "Ruxsat yo'q" });
      if (req.method === 'PUT' && !act) {
        if (limited(me.id, 'psave', 200, 600e3)) return send(res, 429, { error: "Juda ko'p saqlash. Biroz kuting." });
        const b = await readBody(req, 16 * 1024 * 1024);
        if (b.data) { if (typeof b.data !== 'object' || !Array.isArray(b.data.sections)) return send(res, 400, { error: "Noto'g'ri loyiha" }); const json = JSON.stringify(b.data); fs.writeFileSync(projFile(meta.id), json); meta.size = json.length; }
        if (b.name) meta.name = str(b.name, 80); if (b.template) meta.template = str(b.template, 30);
        meta.updatedAt = new Date().toISOString(); db.saveProjects(all);
        return send(res, 200, { project: meta });
      }
      if (req.method === 'DELETE' && !act) { try { fs.unlinkSync(projFile(meta.id)); } catch { /* ignore */ } db.saveProjects(all.filter((p) => p.id !== meta.id)); return send(res, 200, { ok: true }); }
      if (req.method === 'POST' && act === 'submit') {
        const b = await readBody(req, 8192);
        meta.plan = str(b.plan, 60); meta.note = str(b.note, 1000); meta.contactPhone = str(b.phone, 40) || me.phone;
        if (!['yuborilgan', 'korilmoqda', 'narx', 'joylandi'].includes(meta.status)) meta.status = 'yuborilgan';
        meta.submittedAt = new Date().toISOString(); meta.updatedAt = meta.submittedAt; db.saveProjects(all);
        adminBot.notifyText(`🌐 <b>Yangi sayt buyurtmasi</b>\n${me.name} · ${me.phone}\n${meta.name} [${meta.template}]\nTarif: ${meta.plan || '-'}`, { inline_keyboard: [[{ text: "✅ To'lovni tasdiqlash", callback_data: `pp:${meta.id}` }]] });
        notifyTelegram(`Yangi sayt buyurtmasi\nMijoz: ${me.name} (${me.phone})\nSayt: ${meta.name} [${meta.template}]\nTarif: ${meta.plan || '-'}${meta.note ? '\nIzoh: ' + meta.note : ''}`);
        return send(res, 200, { project: meta });
      }
    }
    return send(res, 404, { error: 'Topilmadi' });
  }

  /* --- admin --- */
  if (pn.startsWith('/api/admin')) {
    if (route === 'POST /api/admin/login') {
      if (limited(ip, 'alogin', 8, 600e3)) return send(res, 429, { error: "Juda ko'p urinish. 10 daqiqadan so'ng qayta urining." });
      const b = await readBody(req, 4096);
      if (!eq(hashPw(String(b.password || ''), secret.salt), secret.hash)) return send(res, 401, { error: "Parol noto'g'ri" });
      return send(res, 200, { ok: true }, { 'Set-Cookie': `sid=${makeAdminToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${isHttps(req) ? '; Secure' : ''}` });
    }
    if (route === 'POST /api/admin/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
    if (!isAdmin(req)) return send(res, 401, { error: 'Kirish talab qilinadi' });

    if (route === 'GET /api/admin/site') return send(res, 200, db.site());
    if (route === 'PUT /api/admin/site') {
      const b = await readBody(req, 6 * 1024 * 1024);
      if (!b || typeof b !== 'object' || Array.isArray(b) || !Array.isArray(b.sections)) return send(res, 400, { error: "Noto'g'ri ma'lumot" });
      writeJSON(F('site.json'), b); return send(res, 200, { ok: true });
    }
    if (route === 'POST /api/admin/upload') {
      const b = await readBody(req, 8 * 1024 * 1024);
      const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
      if (!m) return send(res, 400, { error: 'Faqat PNG, JPG, WEBP yoki GIF rasm yuklang' });
      const buf = Buffer.from(m[2], 'base64'); if (buf.length > 5 * 1024 * 1024) return send(res, 413, { error: 'Rasm 5 MB dan oshmasin' });
      const name = `${Date.now()}-${newId(3)}${IMG_EXT[m[1]]}`; fs.writeFileSync(path.join(UPLOADS, name), buf);
      return send(res, 200, { url: `/uploads/${name}` });
    }
    if (route === 'GET /api/admin/orders') { const users = Object.fromEntries(db.users().map((u) => [u.id, u])); return send(res, 200, db.orders().filter((o) => !o.tenant && !o.bot).map((o) => ({ ...o, userName: o.userId && users[o.userId] ? users[o.userId].name : '' }))); }
    if (route === 'PUT /api/admin/orders') {
      const b = await readBody(req, 8192), orders = db.orders(), o = orders.find((x) => x.id === b.id); if (!o) return send(res, 404, { error: 'Topilmadi' });
      if (['yangi', 'jarayonda', 'bajarildi', 'bekor'].includes(b.status)) o.status = b.status; if (typeof b.note === 'string') o.note = str(b.note, 1000);
      db.saveOrders(orders); return send(res, 200, { ok: true });
    }
    if (route === 'DELETE /api/admin/orders') { const id = url.searchParams.get('id'); db.saveOrders(db.orders().filter((x) => x.id !== id)); return send(res, 200, { ok: true }); }
    if (route === 'GET /api/admin/orders.csv') {
      const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
      const rows = [['ID', 'Sana', 'Turi', 'Ism', 'Telefon', 'Mahsulotlar', 'Jami', 'Holat', 'Izoh'].map(q).join(',')];
      for (const o of db.orders()) rows.push([o.id, o.date, o.type, o.name, o.phone, (o.items || []).map((i) => `${i.name} x${i.qty}`).join('; '), o.total, o.status, o.message].map(q).join(','));
      return send(res, 200, '﻿' + rows.join('\r\n'), { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="buyurtmalar.csv"' });
    }
    if (route === 'GET /api/admin/projects') { const users = Object.fromEntries(db.users().map((u) => [u.id, u])); return send(res, 200, db.projects().map((p) => ({ ...p, user: users[p.userId] ? { name: users[p.userId].name, phone: users[p.userId].phone, email: users[p.userId].email } : null }))); }
    const ap = /^\/api\/admin\/projects\/([a-f0-9]{6,24})$/.exec(pn);
    if (ap) {
      const all = db.projects(), meta = all.find((p) => p.id === ap[1]); if (!meta) return send(res, 404, { error: 'Topilmadi' });
      if (req.method === 'GET') return send(res, 200, { project: meta, data: readJSON(projFile(meta.id), null) });
      if (req.method === 'PUT') {
        const b = await readBody(req, 8192);
        if (['qoralama', 'yuborilgan', 'korilmoqda', 'narx', 'joylandi', 'bekor'].includes(b.status)) meta.status = b.status;
        if (typeof b.price === 'string') meta.price = str(b.price, 60); if (typeof b.adminNote === 'string') meta.adminNote = str(b.adminNote, 1000);
        if (typeof b.paid === 'boolean') {
          const tp = db.pricing().templatePrice || { usd: 10, rate: 12800 };
          let pm2 = pay.list().find((x) => x.projectId === meta.id && x.state !== 'refunded') || pay.list().find((x) => x.projectId === meta.id);
          if (!pm2 && b.paid) pm2 = pay.create({ projectId: meta.id, userId: meta.userId, usd: tp.usd, rate: tp.rate, method: 'manual' });
          if (pm2) pay.setPaid(pm2.id, b.paid, 'admin');
          const fresh = db.projects().find((x) => x.id === meta.id); return send(res, 200, { project: fresh || meta });
        }
        meta.updatedAt = new Date().toISOString(); db.saveProjects(all); return send(res, 200, { project: meta });
      }
      if (req.method === 'DELETE') { try { fs.unlinkSync(projFile(meta.id)); } catch { /* ignore */ } db.saveProjects(all.filter((p) => p.id !== meta.id)); return send(res, 200, { ok: true }); }
    }
    if (route === 'GET /api/admin/bots') {
      const users = Object.fromEntries(db.users().map((u) => [u.id, u])), os = db.orders();
      return send(res, 200, bots.list().map((x) => ({ id: x.id, name: x.name, username: x.username, status: x.status, owner: users[x.userId] ? users[x.userId].name : '', phone: users[x.userId] ? users[x.userId].phone : '', subscribers: bots.subscribers(x.id), orders: os.filter((o) => o.bot === x.id).length, webhook: !!x.webhookOk, miniApp: !!x.config.miniApp.enabled, createdAt: x.createdAt })));
    }
    const adb = /^\/api\/admin\/bots\/([a-f0-9]{6,24})$/.exec(pn);
    if (adb && req.method === 'DELETE') { const bot = bots.find(adb[1]); if (!bot) return send(res, 404, { error: 'Topilmadi' }); await bots.remove(bot); return send(res, 200, { ok: true }); }
    if (route === 'POST /api/admin/adminbot/connect') { try { return send(res, 200, { ok: true, ...(await adminBot.connect()), status: adminBot.status() }); } catch (e) { return send(res, 400, { error: e.message }); } }
    if (route === 'POST /api/admin/adminbot/revoke') { const b = await readBody(req, 1024); adminBot.revoke(Number(b.id)); return send(res, 200, { ok: true, status: adminBot.status() }); }
    if (route === 'GET /api/admin/payments') {
      const users = Object.fromEntries(db.users().map((u) => [u.id, u])), prj = Object.fromEntries(db.projects().map((x) => [x.id, x]));
      return send(res, 200, pay.list().map((x) => ({ id: x.id, projectId: x.projectId, project: prj[x.projectId] ? prj[x.projectId].name : '', user: users[x.userId] ? users[x.userId].name : '', phone: users[x.userId] ? users[x.userId].phone : '', usd: x.usd, uzs: x.uzs, method: x.method, state: x.state, createdAt: x.createdAt, paidAt: x.paidAt || '' })));
    }
    if (route === 'GET /api/admin/users') {
      const orders = db.orders(), projects = db.projects();
      return send(res, 200, db.users().map((u) => ({ ...pubUser(u), orders: orders.filter((o) => o.userId === u.id).length, projects: projects.filter((p) => p.userId === u.id).length })));
    }
    const au = /^\/api\/admin\/users\/([a-f0-9]{6,24})$/.exec(pn);
    if (au) {
      const users = db.users(), u = users.find((x) => x.id === au[1]); if (!u) return send(res, 404, { error: 'Topilmadi' });
      if (req.method === 'GET') return send(res, 200, { user: pubUser(u), orders: db.orders().filter((o) => o.userId === u.id), projects: db.projects().filter((p) => p.userId === u.id) });
      if (req.method === 'DELETE') {
        for (const p of db.projects().filter((x) => x.userId === u.id)) { try { fs.unlinkSync(projFile(p.id)); } catch { /* ignore */ } }
        db.saveProjects(db.projects().filter((p) => p.userId !== u.id)); db.saveUsers(users.filter((x) => x.id !== u.id)); return send(res, 200, { ok: true });
      }
    }
    if (route === 'GET /api/admin/pricing') return send(res, 200, db.pricing());
    if (route === 'PUT /api/admin/pricing') {
      const b = await readBody(req, 100 * 1024);
      const plans = (Array.isArray(b.plans) ? b.plans : []).slice(0, 12).map((p) => ({ id: str(p.id, 30) || newId(3), name: str(p.name, 60), price: str(p.price, 40), period: str(p.period, 40), popular: !!p.popular, features: (Array.isArray(p.features) ? p.features : []).slice(0, 10).map((x) => str(x, 100)).filter(Boolean) })).filter((p) => p.name);
      const tpIn = b.templatePrice || {}, tpOld = db.pricing().templatePrice; writeJSON(F('pricing.json'), { currency: str(b.currency, 12) || "so'm", plans, templatePrice: { usd: Math.max(0, Number(tpIn.usd) || tpOld.usd), rate: Math.max(1000, Number(tpIn.rate) || tpOld.rate) } }); return send(res, 200, { ok: true });
    }
    if (route === 'GET /api/admin/settings') {
      const st = db.settings(), pm = (st.payments || {}).payme || {}, ck = (st.payments || {}).click || {}, a = st.ai || {};
      return send(res, 200, { notify: st.notify || {}, allowedOrigins: st.allowedOrigins || [], envAllowed: String(process.env.ALLOWED_ORIGINS || ''), domains: st.domains || [], envDomain: String(process.env.ROOT_DOMAIN || ''), manualPay: st.manualPay || '',
        ai: { hasKey: !!(process.env.ANTHROPIC_API_KEY || a.key), model: a.model || 'claude-sonnet-5-5' }, payments: { payme: { merchantId: pm.merchantId || '', hasKey: !!(process.env.PAYME_KEY || pm.key) }, click: { serviceId: ck.serviceId || '', merchantId: ck.merchantId || '', hasSecret: !!(process.env.CLICK_SECRET_KEY || ck.secretKey) } },
        adminBot: adminBot.status(), webhooks: { payme: `${originOf(req)}/api/pay/payme`, click: `${originOf(req)}/api/pay/click` } });
    }
    if (route === 'PUT /api/admin/settings') {
      const b = await readBody(req, 32 * 1024), st = db.settings(), keep = (nv, ov, n) => (typeof nv === 'string' && nv.trim() ? str(nv, n) : ov || '');
      const n = b.notify || {}, pmIn = (b.payments || {}).payme || {}, ckIn = (b.payments || {}).click || {}, aiIn = b.ai || {}, pmOld = (st.payments || {}).payme || {}, ckOld = (st.payments || {}).click || {}, aiOld = st.ai || {};
      const out = Object.assign({}, st, {
        notify: { telegramBotToken: str(n.telegramBotToken, 120), telegramChatId: str(n.telegramChatId, 40) },
        allowedOrigins: (Array.isArray(b.allowedOrigins) ? b.allowedOrigins : st.allowedOrigins || []).slice(0, 10).map((x) => str(x, 200).replace(/\/$/, '')).filter((x) => /^https?:\/\/[^\s]+$/.test(x)),
        domains: (Array.isArray(b.domains) ? b.domains : st.domains || []).slice(0, 5).map((x) => str(x, 100).toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')).filter(goodDomain),
        manualPay: typeof b.manualPay === 'string' ? str(b.manualPay, 600) : st.manualPay || '',
        ai: { key: keep(aiIn.key, aiOld.key, 200), model: str(aiIn.model, 60) || aiOld.model || '' },
        payments: { payme: { merchantId: str(pmIn.merchantId, 60) || '', key: keep(pmIn.key, pmOld.key, 120) }, click: { serviceId: str(ckIn.serviceId, 40) || '', merchantId: str(ckIn.merchantId, 40) || '', secretKey: keep(ckIn.secretKey, ckOld.secretKey, 120) } },
      });
      writeJSON(F('settings.json'), out);
      return send(res, 200, { ok: true });
    }
    if (route === 'POST /api/admin/password') {
      const b = await readBody(req, 4096), pw = String(b.password || ''); if (pw.length < 6) return send(res, 400, { error: "Parol kamida 6 belgi bo'lsin" });
      secret.salt = crypto.randomBytes(16).toString('hex'); secret.hash = hashPw(pw, secret.salt); writeJSON(F('secret.json'), secret); return send(res, 200, { ok: true });
    }
    if (route === 'GET /api/admin/stats') {
      const orders = db.orders(), users = db.users(), projects = db.projects(), day = 864e5, now = Date.now();
      const series = (arr, key) => Array.from({ length: 14 }, (_, i) => { const from = now - (13 - i) * day; const d = new Date(from); d.setHours(0, 0, 0, 0); const a = d.getTime(), b2 = a + day; return arr.filter((x) => { const t = Date.parse(x[key]); return t >= a && t < b2; }).length; });
      return send(res, 200, {
        orders: { total: orders.length, new: orders.filter((o) => o.status === 'yangi').length, sum: orders.filter((o) => o.status !== 'bekor').reduce((a, o) => a + (o.total || 0), 0), series: series(orders, 'date') },
        users: { total: users.length, series: series(users, 'createdAt') },
        projects: { total: projects.length, submitted: projects.filter((p) => p.status === 'yuborilgan').length, series: series(projects, 'createdAt'), paid: projects.filter((p) => p.paid).length, published: projects.filter((p) => p.published).length },
        revenue: { usd: projects.filter((p) => p.paid).reduce((a, p) => a + (p.paid.usd || 0), 0), uzs: projects.filter((p) => p.paid).reduce((a, p) => a + (p.paid.uzs || 0), 0) },
      });
    }
    return send(res, 404, { error: 'Topilmadi' });
  }
  return send(res, 404, { error: 'Topilmadi' });
}

/* ---------- Statik fayllar ---------- */
function serveFile(res, file, cache) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Sahifa topilmadi');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': cache ? 'public, max-age=86400' : 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}
const PAGES = { '/': 'index.html', '/yaratish': 'yaratish.html', '/kabinet': 'kabinet.html', '/admin': 'admin.html', '/bot': 'bot.html', '/ru': 'ru/index.html', '/ru/': 'ru/index.html', '/en': 'en/index.html', '/en/': 'en/index.html' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'); let p;
    try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, "Noto'g'ri manzil"); }
    if (isHttps(req)) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    if (p === '/healthz') return send(res, 200, 'ok');
    if (p === '/_ask') { // Caddy on-demand TLS: sertifikat faqat bizning domenlar uchun beriladi
      const ra = req.socket.remoteAddress || ''; if (!/^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(ra)) return send(res, 403, 'no');
      const d = String(url.searchParams.get('domain') || '').toLowerCase(); const t = tenantOf(d);
      return send(res, isMainHost(d) && rootDomains().some((r) => d === r || d === 'www.' + r) || (t && !t.missing) ? 200 : 404, 'ok');
    }
    const tenant = tenantOf(hostOf(req));
    if (!tenant) lastOrigin = originOf(req);
    if (tenant) {
      if (tenant.missing) return send(res, 404, '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Sayt topilmadi</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:90vh;text-align:center;color:#334"><div><h1>Sayt topilmadi</h1><p>Bu manzilda hozircha sayt joylanmagan.</p></div>', { 'Content-Type': 'text/html; charset=utf-8' });
      req.tenant = tenant;
      if (p.startsWith('/api/')) return await api(req, res, url);
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, "Ruxsat yo'q");
      const data = tenantData(tenant); if (!data) return send(res, 404, 'Sayt topilmadi');
      const origin = originOf(req);
      if (p === '/') { hit(tenant.id, 'v'); return send(res, 200, exporter.tenantPage(data, { origin, slug: tenant.slug || tenant.customDomain }), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); }
      if (p === '/manifest.webmanifest') return send(res, 200, JSON.stringify(exporter.manifest(data, origin)), { 'Content-Type': 'application/manifest+json; charset=utf-8' });
      if (p === '/icon.svg') return send(res, 200, exporter.icon(data), { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
      if (p === '/sw.js') return send(res, 200, exporter.SW, { 'Content-Type': 'application/javascript; charset=utf-8', 'Service-Worker-Allowed': '/' });
      if (p === '/robots.txt') return send(res, 200, `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
      if (p === '/sitemap.xml') return send(res, 200, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`, { 'Content-Type': 'application/xml; charset=utf-8' });
      if (p === '/config.js') return send(res, 200, "window.__API__=location.origin;window.__SERVER__=true;", { 'Content-Type': 'application/javascript; charset=utf-8' });
      if (p.startsWith('/uploads/')) return serveFile(res, path.join(UPLOADS, path.basename(p)), true);
      if (p.startsWith('/img/')) { const f = path.normalize(path.join(PUBLIC, p)); if (!f.startsWith(path.join(PUBLIC, 'img') + path.sep)) return send(res, 404, 'Topilmadi'); return serveFile(res, f, true); }
      return send(res, 404, 'Sahifa topilmadi');
    }
    if (p.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, "Ruxsat yo'q");
    if (p === '/config.js') return send(res, 200, "window.__API__='';window.__SERVER__=true;", { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
    if (p === '/admin.html') return send(res, 404, 'Sahifa topilmadi');
    const am = /^\/app\/([a-f0-9]{6,24})\/?$/.exec(p);
    if (am) {
      const bot = bots.find(am[1]); if (!bot || bot.status !== 'faol') return send(res, 404, "Do'kon topilmadi");
      let html; try { html = fs.readFileSync(path.join(PUBLIC, 'miniapp.html'), 'utf8'); } catch { return send(res, 404, 'Topilmadi'); }
      return send(res, 200, html.replace('/*__BOT__*/', `window.__BOT__=${JSON.stringify(bot.id)};`), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    }
    if (p.startsWith('/uploads/')) return serveFile(res, path.join(UPLOADS, path.basename(p)), true);
    if (p === '/pricing.json') return send(res, 200, db.pricing());
    if (PAGES[p]) p = '/' + PAGES[p];
    const file = path.normalize(path.join(PUBLIC, p));
    if (!file.startsWith(PUBLIC + path.sep)) return send(res, 404, 'Sahifa topilmadi');
    return serveFile(res, file, /^\/img\//.test(p));
  } catch (e) {
    if (!res.headersSent) send(res, e.code === 413 || e.code === 400 ? e.code : 500, { error: e.code ? e.message : 'Server xatosi' });
    if (!e.code) console.error(e);
  }
});
server.listen(PORT, () => console.log(`Sayt: http://localhost:${PORT}   Admin: http://localhost:${PORT}/admin`));
