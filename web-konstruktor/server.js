'use strict';
// Nol-bog'liqlikdagi server (faqat Node.js 18+ kerak). Ishga tushirish: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const SITE_FILE = path.join(DATA, 'site.json');
const ORDERS_FILE = path.join(DATA, 'orders.json');
const SECRET_FILE = path.join(DATA, 'secret.json');
const PORT = Number(process.env.PORT) || 3000;

fs.mkdirSync(UPLOADS, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
};
const IMG_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };

const readJSON = (f, fallback) => {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; }
};
const writeJSON = (f, obj) => {
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, f);
};

// ---- Parol va sessiya ----
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
let secret = readJSON(SECRET_FILE, null);
if (!secret) {
  const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(5).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  secret = { salt, hash: hashPw(pw, salt), key: crypto.randomBytes(32).toString('hex') };
  writeJSON(SECRET_FILE, secret);
  console.log(`\n  ADMIN PAROLI (birinchi ishga tushirish): ${pw}\n  Uni admin paneldan o'zgartiring.\n`);
}
const sign = (v) => crypto.createHmac('sha256', secret.key).update(v).digest('hex');
const makeToken = () => { const exp = String(Date.now() + 12 * 3600e3); return `${exp}.${sign(exp)}`; };
const validToken = (t) => {
  if (!t) return false;
  const [exp, sig] = t.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const isAdmin = (req) => {
  const m = /(?:^|;\s*)sid=([^;]+)/.exec(req.headers.cookie || '');
  return validToken(m && m[1]);
};

// ---- Oddiy tezlik cheklovi ----
const hits = new Map();
const limited = (ip, key, max, windowMs) => {
  const k = key + ip, now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
};

const send = (res, code, body, headers = {}) => {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(code, {
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff', ...headers,
  });
  res.end(isObj ? JSON.stringify(body) : body);
};

const readBody = (req, limit = 8 * 1024 * 1024) => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', (c) => {
    size += c.length;
    if (size > limit) { reject(Object.assign(new Error('Hajm katta'), { code: 413 })); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
    catch { reject(Object.assign(new Error('Noto\'g\'ri JSON'), { code: 400 })); }
  });
  req.on('error', reject);
});

const str = (v, max = 500) => String(v == null ? '' : v).trim().slice(0, max);
const site = () => readJSON(SITE_FILE, {});
const feat = (s, k) => !!(s.features && s.features[k]);

function publicSite(s) {
  const out = { ...s };
  out.products = (s.products || []).filter((p) => p.active !== false);
  if (out.notify) out.notify = undefined; // maxfiy sozlamalar mijozga ketmaydi
  return out;
}

// ---- Telegram xabarnoma (ixtiyoriy) ----
function notifyTelegram(s, text) {
  const n = s.notify || {};
  const token = process.env.TELEGRAM_BOT_TOKEN || n.telegramBotToken;
  const chat = process.env.TELEGRAM_CHAT_ID || n.telegramChatId;
  if (!token || !chat) return;
  const data = JSON.stringify({ chat_id: chat, text });
  const r = https.request({
    hostname: 'api.telegram.org', path: `/bot${token}/sendMessage`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
  }, (res) => res.resume());
  r.on('error', () => {}); r.write(data); r.end();
}

// ---- API ----
async function api(req, res, url) {
  const ip = req.socket.remoteAddress || '';
  const route = `${req.method} ${url.pathname}`;
  const s = site();

  if (route === 'GET /api/site') return send(res, 200, { ...publicSite(s), _admin: isAdmin(req) });

  if (route === 'POST /api/order') {
    if (!feat(s, 'orders')) return send(res, 404, { error: 'O\'chirilgan' });
    if (limited(ip, 'order', 5, 10 * 60e3)) return send(res, 429, { error: 'Juda ko\'p so\'rov. Birozdan so\'ng urinib ko\'ring.' });
    const b = await readBody(req, 100 * 1024);
    const name = str(b.name, 100), phone = str(b.phone, 40), message = str(b.message, 1000);
    if (name.length < 2) return send(res, 400, { error: 'Ismingizni kiriting' });
    if (!/^[+\d][\d\s()\-]{6,}$/.test(phone)) return send(res, 400, { error: 'Telefon raqamini to\'g\'ri kiriting' });
    const catalog = s.products || [];
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50).map((i) => {
      const p = catalog.find((x) => x.id === i.id && x.active !== false);
      const qty = Math.min(999, Math.max(1, parseInt(i.qty, 10) || 1));
      return p ? { id: p.id, name: p.name, price: Number(p.price) || 0, qty } : null;
    }).filter(Boolean);
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const orders = readJSON(ORDERS_FILE, []);
    const order = {
      id: crypto.randomBytes(4).toString('hex'), date: new Date().toISOString(),
      name, phone, message, items, total, status: 'yangi',
    };
    orders.unshift(order); writeJSON(ORDERS_FILE, orders);
    const cur = (s.catalog && s.catalog.currency) || '';
    notifyTelegram(s, `Yangi buyurtma #${order.id}\n${name}\n${phone}\n` +
      items.map((i) => `- ${i.name} x${i.qty}`).join('\n') +
      (total ? `\nJami: ${total} ${cur}` : '') + (message ? `\n${message}` : ''));
    return send(res, 200, { ok: true, id: order.id });
  }

  // ----- Admin -----
  if (!feat(s, 'admin') && url.pathname.startsWith('/api/admin')) return send(res, 404, { error: 'Admin panel o\'chirilgan' });

  if (route === 'POST /api/admin/login') {
    if (limited(ip, 'login', 8, 10 * 60e3)) return send(res, 429, { error: 'Juda ko\'p urinish. 10 daqiqadan so\'ng qayta urining.' });
    const b = await readBody(req, 4096);
    const ok = hashPw(String(b.password || ''), secret.salt) === secret.hash;
    if (!ok) return send(res, 401, { error: 'Parol noto\'g\'ri' });
    return send(res, 200, { ok: true }, {
      'Set-Cookie': `sid=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`,
    });
  }
  if (route === 'POST /api/admin/logout') {
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
  }
  if (url.pathname.startsWith('/api/admin') && !isAdmin(req)) return send(res, 401, { error: 'Kirish talab qilinadi' });

  if (route === 'GET /api/admin/site') return send(res, 200, s);

  if (route === 'PUT /api/admin/site') {
    const b = await readBody(req, 2 * 1024 * 1024);
    if (!b || typeof b !== 'object' || Array.isArray(b)) return send(res, 400, { error: 'Noto\'g\'ri ma\'lumot' });
    const next = { ...s, ...b };
    next.features = { ...s.features, ...(b.features || {}), admin: true }; // admin'ni panel ichidan o'chirib bo'lmaydi
    next.products = (Array.isArray(next.products) ? next.products : []).slice(0, 500).map((p) => ({
      id: str(p.id, 40) || crypto.randomBytes(4).toString('hex'),
      name: str(p.name, 120), price: Math.max(0, Number(p.price) || 0),
      category: str(p.category, 60), badge: str(p.badge, 40), description: str(p.description, 1000),
      image: str(p.image, 300), active: p.active !== false,
    })).filter((p) => p.name);
    writeJSON(SITE_FILE, next);
    return send(res, 200, { ok: true });
  }

  if (route === 'POST /api/admin/upload') {
    const b = await readBody(req, 8 * 1024 * 1024);
    const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
    if (!m) return send(res, 400, { error: 'Faqat PNG, JPG, WEBP yoki GIF rasm yuklang' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 5 * 1024 * 1024) return send(res, 413, { error: 'Rasm 5 MB dan oshmasin' });
    const name = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}${IMG_EXT[m[1]]}`;
    fs.writeFileSync(path.join(UPLOADS, name), buf);
    return send(res, 200, { url: `/uploads/${name}` });
  }

  if (route === 'GET /api/admin/orders') return send(res, 200, readJSON(ORDERS_FILE, []));
  if (route === 'PUT /api/admin/orders') {
    const b = await readBody(req, 4096);
    const orders = readJSON(ORDERS_FILE, []);
    const o = orders.find((x) => x.id === b.id);
    if (!o) return send(res, 404, { error: 'Topilmadi' });
    if (['yangi', 'jarayonda', 'bajarildi', 'bekor'].includes(b.status)) o.status = b.status;
    writeJSON(ORDERS_FILE, orders);
    return send(res, 200, { ok: true });
  }
  if (route === 'DELETE /api/admin/orders') {
    const id = url.searchParams.get('id');
    writeJSON(ORDERS_FILE, readJSON(ORDERS_FILE, []).filter((x) => x.id !== id));
    return send(res, 200, { ok: true });
  }
  if (route === 'POST /api/admin/password') {
    const b = await readBody(req, 4096);
    const pw = String(b.password || '');
    if (pw.length < 6) return send(res, 400, { error: 'Parol kamida 6 belgi bo\'lsin' });
    secret.salt = crypto.randomBytes(16).toString('hex');
    secret.hash = hashPw(pw, secret.salt);
    writeJSON(SECRET_FILE, secret);
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: 'Topilmadi' });
}

// ---- Statik fayllar ----
function serveFile(res, file, cache) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Sahifa topilmadi');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size, 'X-Content-Type-Options': 'nosniff',
      'Cache-Control': cache ? 'public, max-age=86400' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let p;
    try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Noto\'g\'ri manzil'); }
    if (p.startsWith('/api/')) return await api(req, res, url);

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Ruxsat yo\'q');
    if (p === '/admin' || p === '/admin/') {
      return feat(site(), 'admin') ? serveFile(res, path.join(PUBLIC, 'admin.html')) : send(res, 404, 'Sahifa topilmadi');
    }
    if (p.startsWith('/uploads/')) {
      const f = path.join(UPLOADS, path.basename(p));
      return serveFile(res, f, true);
    }
    if (p === '/') p = '/index.html';
    const file = path.normalize(path.join(PUBLIC, p));
    if (!file.startsWith(PUBLIC + path.sep) || path.basename(file) === 'admin.html') return send(res, 404, 'Sahifa topilmadi');
    return serveFile(res, file, /^\/img\//.test(p));
  } catch (e) {
    if (!res.headersSent) send(res, e.code === 413 || e.code === 400 ? e.code : 500, { error: e.code ? e.message : 'Server xatosi' });
    if (!e.code) console.error(e);
  }
});

server.listen(PORT, () => console.log(`Sayt: http://localhost:${PORT}   Admin: http://localhost:${PORT}/admin`));
