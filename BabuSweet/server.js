'use strict';
/**
 * BabuSweet — zero-dependency Node server.
 *  - serves /public (site + /admin)
 *  - JSON API for the public site and the admin panel
 *  - data lives in data/db.json, a static snapshot is mirrored to public/data/public.json
 * Run:  node server.js     (PORT, SITE_URL optional)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const UPLOADS = path.join(PUBLIC, 'assets', 'uploads');
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const SNAPSHOT = path.join(PUBLIC, 'data', 'public.json');
const SESSION_MS = 1000 * 60 * 60 * 12;
const LANGS = ['uz', 'ru', 'en'];

fs.mkdirSync(UPLOADS, { recursive: true });
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });

/* ------------------------------------------------------------------ helpers */
const tri = (uz, ru, en) => ({ uz, ru, en });
const uid = () => crypto.randomBytes(6).toString('hex');
const now = () => new Date().toISOString();
const str = (v, max = 200) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '');
const i18n = (v, max = 400) => {
  const o = {};
  LANGS.forEach(l => { o[l] = str(v && v[l], max); });
  return o;
};
const color = (v, d) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : d);
const slugify = s => str(s, 80).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-') || uid();
const safeUrl = v => { v = str(v, 300); return /^(https?:\/\/|\/)/i.test(v) ? v : ''; };
const imgPath = v => { v = str(v, 300); return /^\/assets\/(products|uploads)\/[\w.\-]+$/.test(v) ? v : ''; };

/* ------------------------------------------------------------------ seed */
function seed() {
  const P = (id, name, color1, color2, file, order, extra = {}) => ({
    id, slug: slugify(name), name,
    tagline: tri('Dengiz tuzi va karamel', 'Морская соль и карамель', 'Sea salt & caramel'),
    desc: tri(
      "Sut shokolad ichida mayin tuzli karamel. Har bir luqma — haqiqiy shokoladning boyligi va karamelning ipakdek yumshoqligi.",
      'Мягкая карамель с морской солью внутри молочного шоколада. Каждый кусочек — богатство настоящего шоколада и шелковистость карамели.',
      'Silky sea-salt caramel wrapped in real milk chocolate. Every bite is the richness of true chocolate and the softness of caramel.'),
    flavor: 'Sea Salt Caramel', weight: '', category: 'Chocolate Candies',
    image: '/assets/products/' + file, color: color1, color2,
    status: 'active', badge: '', order, createdAt: now(), ...extra
  });
  return {
    version: 1,
    auth: null,
    settings: {
      brand: 'BabuSweet',
      phone: '+998 33 623 33 13',
      email: '',
      address: 'Yangihayot, Sputnik-17, 52a, 100102, Tashkent, Tashkent Region',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Sputnik-17, 52a, Yangihayot, Tashkent'),
      hours: tri('Du–Sha: 09:00–18:00', 'Пн–Сб: 09:00–18:00', 'Mon–Sat: 09:00–18:00'),
      social: { instagram: '', telegram: '', facebook: '', youtube: '' },
      hero: {
        title: tri("O'zbekistondan butun dunyoga — shokoladning haqiqiy ta'mi", 'Из Узбекистана — к лучшим столам мира', "Real chocolate, made in Uzbekistan"),
        lead: tri(
          "BabuSweet — ichki bozor va eksport uchun shokolad mahsulotlari ishlab chiqaruvchi zamonaviy fabrika.",
          'BabuSweet — современная фабрика шоколадной продукции для внутреннего рынка и экспорта.',
          'BabuSweet is a modern chocolate factory serving the domestic market and export.')
      },
      stats: [
        { value: 5, suffix: '', label: tri('mahsulot rangi', 'цветов линейки', 'signature colours') },
        { value: 24, suffix: '/7', label: tri('ishlab chiqarish', 'производство', 'production') },
        { value: 100, suffix: '%', label: tri('haqiqiy shokolad', 'настоящий шоколад', 'real chocolate') },
        { value: 3, suffix: '+', label: tri('eksport yo‘nalishi', 'экспортных направления', 'export regions') }
      ],
      exportRegions: ['Central Asia', 'CIS', 'Middle East', 'Europe']
    },
    products: [
      P('p1', 'BabuSweet Blue', '#1f63ff', '#0a2a8f', 'kok.webp', 1, { badge: 'Bestseller' }),
      P('p2', 'BabuSweet Gold', '#f5b81a', '#8a5a00', 'sariq.webp', 2),
      P('p3', 'BabuSweet Dark', '#c8892b', '#2a1608', 'qora.webp', 3, { badge: 'Premium' }),
      P('p4', 'BabuSweet Green', '#1d8a55', '#073b26', 'yashil.webp', 4),
      P('p5', 'BabuSweet Ruby', '#b01e4a', '#3a0a18', 'bordo.webp', 5)
    ],
    news: [{
      id: 'n1', published: true, date: now(),
      title: tri('Yangi mahsulotlar tez orada!', 'Скоро — новые продукты!', 'New flavours coming soon!'),
      body: tri("BabuSweet liniyasi kengayadi: yangi ta'm va yangi qadoqlar yaqin kunlarda sotuvga chiqadi. Yangiliklarni kuzatib boring.",
        'Линейка BabuSweet расширяется: новые вкусы и упаковки скоро появятся в продаже. Следите за новостями.',
        'The BabuSweet range is growing: new flavours and packs are arriving very soon. Stay tuned.'),
      image: ''
    }],
    messages: []
  };
}

/* ------------------------------------------------------------------ storage */
let db;
function load() {
  try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch (e) { db = seed(); save(); }
  db.settings = db.settings || seed().settings;
  db.products = db.products || []; db.news = db.news || []; db.messages = db.messages || [];
}
function publicData() {
  const s = db.settings;
  return {
    updatedAt: now(),
    settings: s,
    products: db.products.filter(p => p.status !== 'hidden').sort((a, b) => a.order - b.order),
    news: db.news.filter(n => n.published).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  };
}
function atomicWrite(file, data) {
  const tmp = file + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}
function save() {
  atomicWrite(DB_FILE, JSON.stringify(db, null, 2));
  try { atomicWrite(SNAPSHOT, JSON.stringify(publicData())); } catch (e) { console.error('snapshot failed', e.message); }
}
load();
if (!fs.existsSync(SNAPSHOT)) save();

/* ------------------------------------------------------------------ auth */
function hashPw(pw, salt) { return crypto.scryptSync(pw, salt, 64).toString('hex'); }
function secret() {
  if (!db.auth || !db.auth.secret) { db.auth = db.auth || {}; db.auth.secret = crypto.randomBytes(32).toString('hex'); save(); }
  return db.auth.secret;
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return body + '.' + crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}
function verify(tok) {
  if (typeof tok !== 'string') return null;
  const [body, sig] = tok.split('.');
  if (!body || !sig) return null;
  const good = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() && p.v === (db.auth.v || 0) ? p : null; }
  catch (e) { return null; }
}
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(c => c[0]).map(([k, ...v]) => [k, v.join('=')]));
const isAuthed = req => !!verify(cookies(req).bs_admin);
function setSession(req, res) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted ? '; Secure' : '';
  res.setHeader('Set-Cookie', `bs_admin=${sign({ exp: Date.now() + SESSION_MS, v: db.auth.v || 0 })}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`);
}
const buckets = new Map();
function limited(key, max, windowMs) {
  const t = Date.now(); const arr = (buckets.get(key) || []).filter(x => t - x < windowMs);
  if (arr.length >= max) { buckets.set(key, arr); return true; }
  arr.push(t); buckets.set(key, arr); return false;
}
setInterval(() => { const t = Date.now(); for (const [k, v] of buckets) if (!v.some(x => t - x < 3600e3)) buckets.delete(k); }, 600e3).unref();
const ip = req => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

/* ------------------------------------------------------------------ http utils */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}
function readBody(req, limit = 6e6) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(Object.assign(new Error('too large'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); } catch (e) { reject(Object.assign(new Error('bad json'), { code: 400 })); } });
    req.on('error', reject);
  });
}
const baseUrl = req => (process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')}://${req.headers.host}`).replace(/\/$/, '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SEC = {
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
};

/* ------------------------------------------------------------------ SEO injection */
function seoBlock(req, product) {
  const base = baseUrl(req); const s = db.settings; const pd = publicData();
  const first = pd.products.find(p => p.status === 'active');
  const lang = 'uz';
  const title = product ? `${product.name} — ${s.brand}` : `${s.brand} — Shokolad fabrikasi | Chocolate factory | Шоколадная фабрика`;
  const desc = product ? (product.desc.uz || product.desc.en) : (s.hero.lead.uz || s.hero.lead.en);
  const url = product ? `${base}/product/${product.slug}` : base + '/';
  const img = (product || first) ? base + (product || first).image : '';
  const org = {
    '@context': 'https://schema.org', '@type': 'Organization', name: s.brand, url: base, logo: base + '/assets/logo.svg',
    telephone: s.phone, email: s.email || undefined,
    address: { '@type': 'PostalAddress', streetAddress: 'Sputnik-17, 52a', addressLocality: 'Yangihayot', addressRegion: 'Tashkent Region', postalCode: '100102', addressCountry: 'UZ' },
    sameAs: Object.values(s.social || {}).filter(Boolean)
  };
  const graph = [org];
  if (product) graph.push({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: desc, image: img, brand: { '@type': 'Brand', name: s.brand }, category: product.category });
  else graph.push({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: pd.products.filter(p => p.status === 'active').map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/product/${p.slug}`, name: p.name })) });
  const ld = JSON.stringify(graph).replace(/</g, '\\u003c');
  return `<!--SEO-->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc.slice(0, 300))}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${product ? 'product' : 'website'}">
<meta property="og:site_name" content="${esc(s.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc.slice(0, 300))}">
<meta property="og:url" content="${esc(url)}">
${img ? `<meta property="og:image" content="${esc(img)}">\n<meta name="twitter:image" content="${esc(img)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" hreflang="${lang}" href="${esc(base)}/">
<script type="application/ld+json">${ld}</script>
<!--/SEO-->`;
}
function renderIndex(req, product) {
  let html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
  return html.replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, () => seoBlock(req, product));
}

/* ------------------------------------------------------------------ static */
function serveFile(req, res, file, cacheable) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return notFound(req, res);
    const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const ext = path.extname(file).toLowerCase();
    const headers = { ...SEC, 'Content-Type': MIME[ext] || 'application/octet-stream', ETag: etag, 'Cache-Control': cacheable ? 'public, max-age=604800, immutable' : 'no-cache' };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
    headers['Content-Length'] = st.size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}
function notFound(req, res) {
  const f = path.join(PUBLIC, '404.html');
  const body = fs.existsSync(f) ? fs.readFileSync(f) : 'Not found';
  res.writeHead(404, { ...SEC, 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}
function serveStatic(req, res, pathname) {
  let p = decodeURIComponent(pathname);
  if (p.includes('\0')) return notFound(req, res);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC + path.sep)) return notFound(req, res);
  serveFile(req, res, file, /^\/assets\/(uploads|products)\//.test(p));
}

/* ------------------------------------------------------------------ admin API */
const PUB_ROUTES = {};
function cleanProduct(b, old = {}) {
  const status = ['active', 'soon', 'hidden'].includes(b.status) ? b.status : 'active';
  const name = str(b.name, 80) || old.name || 'Product';
  return {
    id: old.id || uid(),
    slug: old.slug || slugify(name),
    name,
    tagline: i18n(b.tagline, 120), desc: i18n(b.desc, 1200),
    flavor: str(b.flavor, 80), weight: str(b.weight, 40), category: str(b.category, 60),
    image: imgPath(b.image) || old.image || '',
    color: color(b.color, '#c8892b'), color2: color(b.color2, '#2a1608'),
    status, badge: str(b.badge, 24),
    order: Number.isFinite(+b.order) ? +b.order : old.order || db.products.length + 1,
    createdAt: old.createdAt || now()
  };
}
function cleanNews(b, old = {}) {
  return {
    id: old.id || uid(), published: !!b.published,
    date: str(b.date, 40) || old.date || now(),
    title: i18n(b.title, 160), body: i18n(b.body, 3000), image: imgPath(b.image) || ''
  };
}
function cleanSettings(b) {
  const o = db.settings; const soc = b.social || {};
  return {
    brand: str(b.brand, 40) || o.brand,
    phone: str(b.phone, 30), email: str(b.email, 100), address: str(b.address, 200),
    mapUrl: safeUrl(b.mapUrl) || o.mapUrl, hours: i18n(b.hours, 80),
    social: { instagram: safeUrl(soc.instagram), telegram: safeUrl(soc.telegram), facebook: safeUrl(soc.facebook), youtube: safeUrl(soc.youtube) },
    hero: { title: i18n(b.hero && b.hero.title, 200), lead: i18n(b.hero && b.hero.lead, 400) },
    stats: (Array.isArray(b.stats) ? b.stats : []).slice(0, 6).map(s => ({ value: Math.max(0, Math.min(1e9, +s.value || 0)), suffix: str(s.suffix, 6), label: i18n(s.label, 60) })),
    exportRegions: (Array.isArray(b.exportRegions) ? b.exportRegions : []).slice(0, 10).map(x => str(x, 40)).filter(Boolean)
  };
}
function saveImage(dataUrl) {
  const m = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw Object.assign(new Error('Faqat webp/png/jpeg rasm'), { code: 400 });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4e6) throw Object.assign(new Error('Rasm 4MB dan oshmasin'), { code: 413 });
  const sig = buf.subarray(0, 12);
  const ok = (m[1] === 'png' && sig[0] === 0x89 && sig[1] === 0x50) || (m[1] === 'jpeg' && sig[0] === 0xff && sig[1] === 0xd8) || (m[1] === 'webp' && sig.toString('ascii', 0, 4) === 'RIFF' && sig.toString('ascii', 8, 12) === 'WEBP');
  if (!ok) throw Object.assign(new Error('Rasm fayli buzilgan'), { code: 400 });
  const name = `${Date.now().toString(36)}-${uid()}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  fs.writeFileSync(path.join(UPLOADS, name), buf);
  return '/assets/uploads/' + name;
}
function dropUpload(p) {
  if (p && p.startsWith('/assets/uploads/')) fs.unlink(path.join(UPLOADS, path.basename(p)), () => {});
}

async function adminApi(req, res, url) {
  const route = url.pathname.replace(/^\/api\/admin\/?/, '');
  const method = req.method;
  const clientIp = ip(req);

  if (route === 'status' && method === 'GET') return json(res, 200, { setup: !(db.auth && db.auth.hash), authed: isAuthed(req) });

  if (method !== 'GET' && req.headers['x-requested-with'] !== 'bs') return json(res, 403, { error: 'Forbidden' });

  if (route === 'setup' && method === 'POST') {
    if (db.auth && db.auth.hash) return json(res, 409, { error: 'Parol allaqachon o‘rnatilgan' });
    if (limited('setup:' + clientIp, 5, 600e3)) return json(res, 429, { error: 'Juda ko‘p urinish' });
    const b = await readBody(req, 5e3);
    if (str(b.password, 200).length < 8) return json(res, 400, { error: 'Parol kamida 8 belgi bo‘lsin' });
    const salt = crypto.randomBytes(16).toString('hex');
    db.auth = { ...(db.auth || {}), salt, hash: hashPw(b.password, salt), v: 0 };
    secret(); save(); setSession(req, res);
    return json(res, 200, { ok: true });
  }
  if (route === 'login' && method === 'POST') {
    if (limited('login:' + clientIp, 8, 600e3)) return json(res, 429, { error: 'Juda ko‘p urinish. 10 daqiqadan so‘ng qayta urinib ko‘ring' });
    const b = await readBody(req, 5e3);
    if (!db.auth || !db.auth.hash) return json(res, 400, { error: 'Avval parol o‘rnating' });
    const a = Buffer.from(hashPw(String(b.password || ''), db.auth.salt)), h = Buffer.from(db.auth.hash);
    if (a.length !== h.length || !crypto.timingSafeEqual(a, h)) return json(res, 401, { error: 'Parol noto‘g‘ri' });
    setSession(req, res); return json(res, 200, { ok: true });
  }
  if (route === 'logout' && method === 'POST') { res.setHeader('Set-Cookie', 'bs_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return json(res, 200, { ok: true }); }

  if (!isAuthed(req)) return json(res, 401, { error: 'Kirish talab qilinadi' });

  if (route === 'data' && method === 'GET') return json(res, 200, { settings: db.settings, products: db.products, news: db.news, messages: db.messages });

  if (route === 'password' && method === 'POST') {
    const b = await readBody(req, 5e3);
    const a = Buffer.from(hashPw(String(b.current || ''), db.auth.salt)), h = Buffer.from(db.auth.hash);
    if (a.length !== h.length || !crypto.timingSafeEqual(a, h)) return json(res, 401, { error: 'Joriy parol noto‘g‘ri' });
    if (str(b.next, 200).length < 8) return json(res, 400, { error: 'Yangi parol kamida 8 belgi bo‘lsin' });
    db.auth.salt = crypto.randomBytes(16).toString('hex'); db.auth.hash = hashPw(b.next, db.auth.salt);
    db.auth.v = (db.auth.v || 0) + 1; save(); setSession(req, res);
    return json(res, 200, { ok: true });
  }

  if (route === 'upload' && method === 'POST') {
    const b = await readBody(req, 6e6);
    return json(res, 200, { path: saveImage(b.dataUrl) });
  }

  if (route === 'settings' && method === 'PUT') {
    db.settings = cleanSettings(await readBody(req, 5e5)); save();
    return json(res, 200, db.settings);
  }

  // collections: products / news / messages
  const m = /^(products|news|messages)(?:\/([\w-]+))?(?:\/(up|down|read))?$/.exec(route);
  if (m) {
    const [, coll, id, act] = m;
    const list = db[coll];
    const idx = id ? list.findIndex(x => x.id === id) : -1;
    if (id && idx < 0) return json(res, 404, { error: 'Topilmadi' });

    if (coll === 'messages') {
      if (method === 'POST' && act === 'read') { list[idx].read = true; save(); return json(res, 200, list[idx]); }
      if (method === 'DELETE' && id) { list.splice(idx, 1); save(); return json(res, 200, { ok: true }); }
      return json(res, 405, { error: 'Method not allowed' });
    }
    if (method === 'POST' && !id) {
      const b = await readBody(req, 1e6);
      const item = coll === 'products' ? cleanProduct(b) : cleanNews(b);
      if (coll === 'products') { let s = item.slug, n = 2; while (list.some(x => x.slug === s)) s = item.slug + '-' + n++; item.slug = s; item.order = Math.max(0, ...list.map(x => x.order || 0)) + 1; }
      list.push(item); save(); return json(res, 201, item);
    }
    if (method === 'PUT' && id) {
      const b = await readBody(req, 1e6);
      const old = list[idx];
      const item = coll === 'products' ? cleanProduct(b, old) : cleanNews(b, old);
      if (old.image && old.image !== item.image) dropUpload(old.image);
      list[idx] = item; save(); return json(res, 200, item);
    }
    if (method === 'DELETE' && id) {
      dropUpload(list[idx].image); list.splice(idx, 1); save(); return json(res, 200, { ok: true });
    }
    if (method === 'POST' && id && (act === 'up' || act === 'down') && coll === 'products') {
      const sorted = [...list].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex(x => x.id === id), j = act === 'up' ? i - 1 : i + 1;
      if (j >= 0 && j < sorted.length) { [sorted[i], sorted[j]] = [sorted[j], sorted[i]]; sorted.forEach((x, k) => { x.order = k + 1; }); save(); }
      return json(res, 200, { ok: true });
    }
  }
  return json(res, 404, { error: 'Not found' });
}

/* ------------------------------------------------------------------ main router */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    for (const k in SEC) res.setHeader(k, SEC[k]);

    if (p.startsWith('/api/')) {
      if (p === '/api/public' && req.method === 'GET') return json(res, 200, publicData());
      if (p === '/api/contact' && req.method === 'POST') {
        if (limited('contact:' + ip(req), 5, 600e3)) return json(res, 429, { error: 'rate' });
        const b = await readBody(req, 2e4);
        if (b.website) return json(res, 200, { ok: true }); // honeypot
        const msg = { id: uid(), date: now(), read: false, name: str(b.name, 80), company: str(b.company, 100), contact: str(b.contact, 100), type: ['wholesale', 'export', 'private', 'other'].includes(b.type) ? b.type : 'other', msg: str(b.msg, 2000) };
        if (msg.name.length < 2 || msg.contact.length < 5) return json(res, 400, { error: 'invalid' });
        db.messages.unshift(msg); db.messages = db.messages.slice(0, 500); save();
        return json(res, 200, { ok: true });
      }
      if (p.startsWith('/api/admin')) return await adminApi(req, res, url);
      return json(res, 404, { error: 'Not found' });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }

    if (p === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': MIME['.txt'] });
      return res.end(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
    }
    if (p === '/sitemap.xml') {
      const base = baseUrl(req);
      const urls = ['/', ...publicData().products.filter(x => x.status === 'active').map(x => '/product/' + x.slug)];
      res.writeHead(200, { 'Content-Type': MIME['.xml'] });
      return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(base + u)}</loc></url>`).join('\n')}\n</urlset>\n`);
    }
    if (p === '/admin' || p === '/admin/') return serveFile(req, res, path.join(PUBLIC, 'admin', 'index.html'), false);

    if (p === '/' || p === '/index.html') {
      const html = renderIndex(req);
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
      return res.end(req.method === 'HEAD' ? undefined : html);
    }
    const pm = /^\/product\/([\w-]+)\/?$/.exec(p);
    if (pm) {
      const prod = publicData().products.find(x => x.slug === pm[1]);
      if (!prod) return notFound(req, res);
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
      return res.end(renderIndex(req, prod));
    }
    return serveStatic(req, res, p);
  } catch (e) {
    if (!res.headersSent) json(res, e.code && e.code < 600 ? e.code : 500, { error: e.code ? e.message : 'Server error' });
    if (!e.code) console.error(e);
  }
});
server.listen(PORT, () => console.log(`BabuSweet → http://localhost:${PORT}   admin → http://localhost:${PORT}/admin`));
