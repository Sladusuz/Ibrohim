'use strict';
// Yig'ish: shablon (konstruktor uchun), asosiy sahifa (server rejimi) va statik nashr (docs/).
// Ishga tushirish: node tools/build-static.js   (domen bilan: CNAME=sizning-domen.uz node tools/build-static.js)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..'), P = path.join(ROOT, 'public'), OUT = path.join(ROOT, 'docs');
const MARK = '/*__DATA__*/null';
const rd = (f) => fs.readFileSync(path.join(P, f), 'utf8');

const css = (rd('style.css') + '\n' + rd('motion.css')).replace(/\[data-theme=/g, '[data-site=');
const libs = ['icons.js', 'engine-core.js', 'sections.js', 'sections2.js', 'motion.js', 'brief.js'].map(rd).join('\n');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;700;800&family=Playfair+Display:wght@500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700&family=Instrument+Serif:ital@0;1&family=Unbounded:wght@500;600&display=swap" rel="stylesheet">';

// opts.account: config.js + auth.js ulanadi (asosiy sayt); opts.data: ma'lumot ichiga joylanadi
let DICT = {}; try { DICT = require('../public/i18n-dict.js'); } catch { /* lug'at hali yo'q */ }
const LANGS = [{ c: 'uz', u: '/' }, { c: 'ru', u: '/ru/' }, { c: 'en', u: '/en/' }];
const nrm = (v) => String(v).replace(/[ʻʼ’‘`´]/g, "'").replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const trSite = (site, lang) => {
  const out = JSON.parse(JSON.stringify(site)), d = DICT[lang] || {}, M = new Map(Object.keys(d).map((k) => [nrm(k), d[k]]));
  const walk = (o) => { for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { const t = M.get(nrm(v)); if (t) o[k] = t; } else if (v && typeof v === 'object') walk(v); } };
  walk(out); return out;
};
const TITLES = { uz: 'veb-sayt, mobil ilova va Telegram bot yaratish', ru: 'создание сайтов, мобильных приложений и Telegram-ботов', en: 'websites, mobile apps and Telegram bots' };
const LOC = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };
const DOMAIN = process.env.CNAME || 'improuzbekiston.uz';
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Bosh sahifa uchun SEO teglari (qidiruv tizimlari va Telegram/ijtimoiy tarmoqlar JavaScript'siz o'qiydi)
const seoHead = (site, lang = 'uz') => {
  const c = site.company || {}, ct = site.contacts || {}, hero = (site.sections || []).find((x) => x.type === 'hero') || {};
  const base = `https://${DOMAIN}/`, url = base + (lang === 'uz' ? '' : lang + '/'), desc = String(hero.text || c.tagline || '').slice(0, 200), title = `${c.name || 'Sayt'}: ${TITLES[lang]}`;
  const ld = { '@context': 'https://schema.org', '@type': 'Organization', name: c.name, url, logo: base + 'favicon.svg', description: desc, telephone: ct.phone || undefined, email: ct.email || undefined, address: ct.address ? { '@type': 'PostalAddress', streetAddress: ct.address, addressCountry: 'UZ' } : undefined };
  const fq = (site.sections || []).find((x) => x.type === 'faq' && x.enabled !== false);
  const faqLd = fq && (fq.items || []).length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: fq.items.map((i) => ({ '@type': 'Question', name: String(i.q).replace(/\*/g, ''), acceptedAnswer: { '@type': 'Answer', text: i.a } })) } : null;
  const verify = (process.env.GSC ? `<meta name="google-site-verification" content="${esc(process.env.GSC)}">` : '') + (process.env.YANDEX_VERIFY ? `<meta name="yandex-verification" content="${esc(process.env.YANDEX_VERIFY)}">` : '');
  return `${verify}<link rel="canonical" href="${url}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#0a0f1e"><meta property="og:type" content="website"><meta property="og:site_name" content="${esc(c.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="${LOC[lang]}">${LANGS.map((l) => `<link rel="alternate" hreflang="${l.c}" href="${base}${l.u.slice(1)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${base}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${base}img/og.jpg"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>${faqLd ? `<script type="application/ld+json">${JSON.stringify(faqLd).replace(/</g, '\\u003c')}</script>` : ''}`;
};
const page = ({ data, account, seo, lang = '' }) => `<!doctype html>
<html lang="${lang || 'uz'}" data-site="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sayt</title>
<meta name="description" content="">
${FONTS}
${seo || ''}${lang ? '<link rel="manifest" href="/manifest.webmanifest"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Impro IT"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="apple-touch-icon" href="/img/icon-512.png">' : ''}<style>${css}</style>
</head>
<body>
<div id="prog"></div><div class="aurora" id="aurora"><i></i><i></i><i></i></div><div class="gridbg" id="gridbg"></div><canvas id="bg"></canvas><div id="glow"></div>
<div id="app"><div class="boot"><span></span></div></div>
${account ? '<script src="/config.js"></script>' : ''}
${lang ? `<script>window.__LANGS__=${JSON.stringify({ cur: lang, list: LANGS })};</script>` : ''}
<script>window.__SITE__=${data};</script>
<script>${libs}</script>
${account ? '<script src="/auth.js"></script>' : ''}
${lang && lang !== 'uz' ? '<script src="/i18n-dict.js"></script><script src="/i18n.js"></script>' : ''}
<script>E.boot();</script>
${lang ? "<script>if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})</script>" : ''}
</body>
</html>`;

// 0) Admin panel DEMO sahifasi (namunaviy ma'lumot, serversiz ishlaydi)
fs.writeFileSync(path.join(P, 'admin-demo.html'), rd('admin.html').replace('<title>Admin panel</title>', '<title>Admin panel (demo)</title>').replace('<script src="/admin.js"></script>', '<script src="/admin-demo.js"></script>\n<script src="/admin.js"></script>').replace('<p>Davom etish uchun parolni kiriting.</p>', '<p>Demo rejimi.</p>'));
// 1) Shablon: konstruktor shundan tayyor sayt yasaydi (hisob va server yo'q, mustaqil)
fs.writeFileSync(path.join(P, 'shablon.html'), page({ data: MARK, account: false }));
// 2) Asosiy sahifa (server rejimi): ma'lumotni /api/site dan oladi
const siteData0 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8'));
fs.writeFileSync(path.join(P, 'index.html'), page({ data: 'null', account: true, seo: seoHead(siteData0, 'uz'), lang: 'uz' }));

// 3) Statik nashr (GitHub Pages va shu kabilar)
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8'));
const html = page({ data: JSON.stringify(site).replace(/</g, '\\u003c'), account: true, seo: seoHead(site, 'uz'), lang: 'uz' })
  .replace('<title>Sayt</title>', `<title>${String((site.company || {}).name || 'Sayt').replace(/</g, '')}</title>`);
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) { if (!['config.js', 'CNAME'].includes(f)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true }); }
fs.writeFileSync(path.join(OUT, 'index.html'), html);
// Ruscha va inglizcha bosh sahifalar (build vaqtida tarjima qilingan ma'lumot bilan)
for (const lang of ['ru', 'en']) {
  const ls = trSite(site, lang);
  const lh = page({ data: JSON.stringify(ls).replace(/</g, '\\u003c'), account: true, seo: seoHead(ls, lang), lang }).replace('<title>Sayt</title>', `<title>${String((ls.company || {}).name || 'Sayt').replace(/</g, '')}: ${TITLES[lang]}</title>`);
  for (const dir of [P, OUT]) { fs.mkdirSync(path.join(dir, lang), { recursive: true }); fs.writeFileSync(path.join(dir, lang, 'index.html'), lh); }
}
for (const f of ['yaratish.html', 'kabinet.html', 'bot.html', 'builder.js', 'editor.js', 'auth.js', 'templates.js', 'tpl-1.js', 'tpl-2.js', 'tpl-3.js', 'tpl-4.js', 'tpl-5.js', 'motion.js', 'i18n.js', 'i18n-dict.js', 'motion.css', 'icons.js', 'engine-core.js', 'sections.js', 'sections2.js', 'brief.js', 'ui.css', 'pricing.json', 'shablon.html', 'admin.js', 'admin-demo.js', 'admin-demo.html']) fs.copyFileSync(path.join(P, f), path.join(OUT, f));
if (!fs.existsSync(path.join(OUT, 'config.js'))) fs.copyFileSync(path.join(P, 'config.js'), path.join(OUT, 'config.js'));
if (process.env.RELAY) fs.writeFileSync(path.join(OUT, 'config.js'), fs.readFileSync(path.join(OUT, 'config.js'), 'utf8').replace(/window\.__RELAY__ = '[^']*';/, `window.__RELAY__ = '${String(process.env.RELAY).replace(/'/g, '')}';`));
if (!/__RELAY__/.test(fs.readFileSync(path.join(OUT, 'config.js'), 'utf8'))) fs.appendFileSync(path.join(OUT, 'config.js'), "\nwindow.__RELAY__ = '';\n");
fs.cpSync(path.join(P, 'img'), path.join(OUT, 'img'), { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
// Shablonlarning jonli namuna sahifalari: /demo/<id>/ (umumiy css va engine fayllari bilan, yengil)
global.window = {}; require('../public/templates.js');
for (const f of fs.readdirSync(P).filter((x) => /^tpl-.*\.js$/.test(x)).sort()) require('../public/' + f);
for (const dir of [P, OUT]) { fs.writeFileSync(path.join(dir, 'site.css'), css); fs.writeFileSync(path.join(dir, 'engine.bundle.js'), libs); }
const demoIds = [];
for (const t of window.TEMPLATES) {
  const d = window.getTemplate(t.id), json = JSON.stringify(d).replace(/</g, '\\u003c');
  const bar = `<div class="demobar"><span><b>Namuna:</b> ${esc(t.name)}</span><a class="btn sm" href="/yaratish.html?t=${esc(t.id)}">Shu shablonni tanlash</a><a class="dl" href="/yaratish.html">Barcha shablonlar</a></div>`;
  const html = `<!doctype html><html lang="uz" data-site="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.name)}: namunaviy sayt | Impro IT</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml">${FONTS}<link rel="stylesheet" href="/site.css"></head><body>
<div id="prog"></div><div class="aurora" id="aurora"><i></i><i></i><i></i></div><div class="gridbg" id="gridbg"></div><canvas id="bg"></canvas><div id="glow"></div>
<div id="app"><div class="boot"><span></span></div></div>${bar}
<script>window.__DEMO__=true;window.__SITE__=${json};</script><script src="/engine.bundle.js"></script><script>E.boot();</script></body></html>`;
  for (const dir of [P, OUT]) { fs.mkdirSync(path.join(dir, 'demo', t.id), { recursive: true }); fs.writeFileSync(path.join(dir, 'demo', t.id, 'index.html'), html); }
  demoIds.push(t.id);
}
// Huquqiy sahifalar, favicon, robots.txt, sitemap.xml, 404
const legal = require('./legal')({ site, domain: DOMAIN });
const MANIFEST = JSON.stringify({ name: 'Impro IT', short_name: 'Impro IT', description: 'Veb-sayt, mobil ilova va Telegram botlar. Sayt konstruktori.', start_url: '/', scope: '/', display: 'standalone', background_color: '#05070f', theme_color: '#05070f', lang: 'uz', icons: [{ src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] });
const SW = `// Impro IT: oflayn ishlash va tezkor takroriy yuklash (v${Date.now()})
const V = 'impro-${Date.now()}';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /^\\/(api|admin|app|kabinet)/.test(u.pathname)) return;
  const asset = /\\.(jpg|jpeg|png|webp|svg|woff2?)$/.test(u.pathname);
  if (asset) { e.respondWith(caches.open(V).then((c) => c.match(r).then((m) => m || fetch(r).then((n) => { if (n.ok) c.put(r, n.clone()); return n; })))); return; }
  e.respondWith(fetch(r).then((n) => { if (n.ok && (r.mode === 'navigate' || /\\.(js|css)$/.test(u.pathname))) { const c = n.clone(); caches.open(V).then((x) => x.put(r, c)); } return n; }).catch(() => caches.match(r).then((m) => m || caches.match('/'))));
});
`;
const FAV = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="45" font-size="38" font-weight="800" text-anchor="middle" fill="#04101c" font-family="Arial,sans-serif">I</text></svg>';
let blogPosts = []; try { blogPosts = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog.json'), 'utf8')); } catch { /* blog hali yo'q */ }
const blogFiles = blogPosts.length ? require('./blog')({ domain: DOMAIN, name: (site.company || {}).name, posts: blogPosts }) : {};
for (const dir of [P, OUT]) for (const [f, t] of Object.entries(blogFiles)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), t); }
const invFiles = require('./investor')({ domain: DOMAIN, site, templates: window.TEMPLATES, posts: blogPosts, relay: process.env.RELAY || '' });
for (const dir of [P, OUT]) for (const [f, t] of Object.entries(invFiles)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), t); }
const urls = ['', 'ru/', 'en/', 'investor/', 'ru/investor/', 'en/investor/', 'yaratish.html', 'bot.html', ...(blogPosts.length ? ['blog/', ...blogPosts.map((b) => `blog/${b.slug}/`)] : []), 'offerta.html', 'maxfiylik.html', 'qaytarish.html'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>https://${DOMAIN}/${u}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /kabinet\nDisallow: /api/\nSitemap: https://${DOMAIN}/sitemap.xml\n`;
const nf = `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sahifa topilmadi</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;font:16px/1.6 Inter,system-ui,sans-serif;background:#05070f;color:#eef1ff}h1{font-size:clamp(60px,14vw,140px);margin:0;letter-spacing:-.06em;background:linear-gradient(135deg,#22d3ee,#7c5cff);-webkit-background-clip:text;background-clip:text;color:transparent}p{color:#9aa6c4}a{display:inline-block;margin-top:14px;padding:12px 24px;border-radius:99px;background:#22d3ee;color:#04101c;font-weight:700;text-decoration:none}</style></head><body><div><h1>404</h1><p>Bunday sahifa topilmadi.</p><a href="/">Bosh sahifaga qaytish</a></div></body></html>`;
for (const dir of [P, OUT]) { fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), MANIFEST); fs.writeFileSync(path.join(dir, 'sw.js'), SW); }
for (const dir of [P, OUT]) { for (const [f, t] of Object.entries(legal)) fs.writeFileSync(path.join(dir, f), t); fs.writeFileSync(path.join(dir, 'favicon.svg'), FAV); fs.writeFileSync(path.join(dir, 'robots.txt'), robots); fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap); }
fs.writeFileSync(path.join(OUT, '404.html'), nf);
// Ilova (Capacitor) bilan bog'lash: native.js hamma sahifada, oddiy brauzerda hech narsa qilmaydi
fs.copyFileSync(path.join(__dirname, 'app-native.js'), path.join(OUT, 'native.js'));
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html') && e.name !== 'offline.html') { const h = fs.readFileSync(p, 'utf8'); if (!h.includes('/native.js') && h.includes('</body>')) fs.writeFileSync(p, h.replace('</body>', '<script src="/native.js" defer></script></body>')); } } })(OUT);
if (process.env.CNAME) fs.writeFileSync(path.join(OUT, 'CNAME'), process.env.CNAME + '\n');
console.log('public/shablon.html, public/index.html va docs/ tayyor');
