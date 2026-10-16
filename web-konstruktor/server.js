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
  pricing: () => readJSON(F('pricing.json'), { currency: "so'm", plans: [] }),
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
function siteItems() {
  const m = {}; for (const s of db.site().sections || []) if (['products', 'menu'].includes(s.type)) for (const p of s.items || []) if (p && p.id) m[p.id] = p; return m;
}
function cleanOrder(b, user) {
  const type = ['order', 'booking', 'message'].includes(b.type) ? b.type : 'order';
  const local = siteItems();
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60).map((i) => {
    const l = local[i && i.id]; const qty = Math.min(999, Math.max(1, parseInt(i && i.qty, 10) || 1));
    return l ? { id: str(l.id, 40), name: str(l.name, 120), price: Number(l.price) || 0, qty } : { id: str(i && i.id, 40), name: str(i && i.name, 120), price: Math.max(0, Number(i && i.price) || 0), qty };
  }).filter((i) => i.name);
  const extra = {}; if (b.extra && typeof b.extra === 'object') for (const k of Object.keys(b.extra).slice(0, 12)) extra[str(k, 40)] = str(b.extra[k], 300);
  const shipping = Math.max(0, Number(b.shipping) || 0);
  const total = items.reduce((a, i) => a + i.price * i.qty, 0) + (items.length ? shipping : 0);
  return { type, name: str(b.name, 100) || (user && user.name) || '', phone: str(b.phone, 40) || (user && user.phone) || '', message: str(b.message, 1000), items, extra, shipping, total };
}

/* ---------- API ---------- */
async function api(req, res, url) {
  const ip = ipOf(req);
  const pn = url.pathname, route = `${req.method} ${pn}`;
  cors(req, res, pn);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  /* --- ochiq --- */
  if (route === 'GET /api/site') return send(res, 200, db.site());
  if (route === 'GET /api/pricing') return send(res, 200, db.pricing());

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
    if (acc.enabled) { if (acc.requireOrder !== false) gate.push('order'); if (acc.requireBooking) gate.push('booking'); }
    const o = cleanOrder(b, me);
    if (gate.includes(o.type) && !me) return send(res, 401, { error: "Buyurtma berish uchun hisobingizga kiring", needAuth: true });
    if (o.name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
    if (!goodPhone(o.phone)) return send(res, 400, { error: "Telefon raqamini to'g'ri kiriting" });
    if (o.type === 'order' && !o.items.length) return send(res, 400, { error: "Savat bo'sh" });
    const order = { id: newId(4), date: new Date().toISOString(), userId: me ? me.id : '', ...o, status: 'yangi', note: '' };
    const orders = db.orders(); orders.unshift(order); db.saveOrders(orders.slice(0, 20000));
    const cur = (site.orders && site.orders.currency) || '';
    notifyTelegram(`${o.type === 'booking' ? 'Yangi ariza' : o.type === 'message' ? 'Yangi xabar' : 'Yangi buyurtma'} #${order.id}\n${o.name}\n${o.phone}\n` + o.items.map((i) => `- ${i.name} x${i.qty}`).join('\n') + (o.total ? `\nJami: ${o.total} ${cur}` : '') + Object.entries(o.extra).map(([k, v]) => `\n${k}: ${v}`).join('') + (o.message ? `\n${o.message}` : ''));
    return send(res, 200, { ok: true, id: order.id });
  }

  /* --- mijozning shaxsiy ma'lumotlari --- */
  if (pn.startsWith('/api/my/')) {
    if (!me) return send(res, 401, { error: 'Kirish talab qilinadi' });
    if (route === 'GET /api/my/orders') return send(res, 200, db.orders().filter((o) => o.userId === me.id).slice(0, 200));
    if (route === 'GET /api/my/projects') return send(res, 200, db.projects().filter((p) => p.userId === me.id));
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
    const pm = /^\/api\/my\/projects\/([a-f0-9]{6,24})(\/submit)?$/.exec(pn);
    if (pm) {
      const all = db.projects(), meta = all.find((p) => p.id === pm[1] && p.userId === me.id);
      if (!meta) return send(res, 404, { error: 'Loyiha topilmadi' });
      if (req.method === 'GET' && !pm[2]) return send(res, 200, { project: meta, data: readJSON(projFile(meta.id), null) });
      if (req.method === 'PUT' && !pm[2]) {
        if (limited(me.id, 'psave', 200, 600e3)) return send(res, 429, { error: "Juda ko'p saqlash. Biroz kuting." });
        const b = await readBody(req, 16 * 1024 * 1024);
        if (b.data) { if (typeof b.data !== 'object' || !Array.isArray(b.data.sections)) return send(res, 400, { error: "Noto'g'ri loyiha" }); const json = JSON.stringify(b.data); fs.writeFileSync(projFile(meta.id), json); meta.size = json.length; }
        if (b.name) meta.name = str(b.name, 80); if (b.template) meta.template = str(b.template, 30);
        meta.updatedAt = new Date().toISOString(); db.saveProjects(all);
        return send(res, 200, { project: meta });
      }
      if (req.method === 'DELETE' && !pm[2]) { try { fs.unlinkSync(projFile(meta.id)); } catch { /* ignore */ } db.saveProjects(all.filter((p) => p.id !== meta.id)); return send(res, 200, { ok: true }); }
      if (req.method === 'POST' && pm[2]) {
        const b = await readBody(req, 8192);
        meta.plan = str(b.plan, 60); meta.note = str(b.note, 1000); meta.contactPhone = str(b.phone, 40) || me.phone;
        if (!['yuborilgan', 'korilmoqda', 'narx', 'joylandi'].includes(meta.status)) meta.status = 'yuborilgan';
        meta.submittedAt = new Date().toISOString(); meta.updatedAt = meta.submittedAt; db.saveProjects(all);
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
    if (route === 'GET /api/admin/orders') { const users = Object.fromEntries(db.users().map((u) => [u.id, u])); return send(res, 200, db.orders().map((o) => ({ ...o, userName: o.userId && users[o.userId] ? users[o.userId].name : '' }))); }
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
        meta.updatedAt = new Date().toISOString(); db.saveProjects(all); return send(res, 200, { project: meta });
      }
      if (req.method === 'DELETE') { try { fs.unlinkSync(projFile(meta.id)); } catch { /* ignore */ } db.saveProjects(all.filter((p) => p.id !== meta.id)); return send(res, 200, { ok: true }); }
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
      writeJSON(F('pricing.json'), { currency: str(b.currency, 12) || "so'm", plans }); return send(res, 200, { ok: true });
    }
    if (route === 'GET /api/admin/settings') { const s = db.settings(); return send(res, 200, { notify: s.notify || {}, allowedOrigins: s.allowedOrigins || [], envAllowed: String(process.env.ALLOWED_ORIGINS || '') }); }
    if (route === 'PUT /api/admin/settings') {
      const b = await readBody(req, 16 * 1024);
      writeJSON(F('settings.json'), { notify: { telegramBotToken: str(b.notify && b.notify.telegramBotToken, 120), telegramChatId: str(b.notify && b.notify.telegramChatId, 40) }, allowedOrigins: (Array.isArray(b.allowedOrigins) ? b.allowedOrigins : []).slice(0, 10).map((s) => str(s, 200).replace(/\/$/, '')).filter((s) => /^https?:\/\/[^\s/]+$/.test(s)) });
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
        projects: { total: projects.length, submitted: projects.filter((p) => p.status === 'yuborilgan').length, series: series(projects, 'createdAt') },
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
const PAGES = { '/': 'index.html', '/yaratish': 'yaratish.html', '/kabinet': 'kabinet.html', '/admin': 'admin.html' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'); let p;
    try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, "Noto'g'ri manzil"); }
    if (isHttps(req)) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    if (p === '/healthz') return send(res, 200, 'ok');
    if (p.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, "Ruxsat yo'q");
    if (p === '/config.js') return send(res, 200, "window.__API__='';window.__SERVER__=true;", { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
    if (p === '/admin.html') return send(res, 404, 'Sahifa topilmadi');
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
