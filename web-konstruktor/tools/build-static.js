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
  return `<link rel="canonical" href="${url}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#0a0f1e"><meta property="og:type" content="website"><meta property="og:site_name" content="${esc(c.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="${LOC[lang]}">${LANGS.map((l) => `<link rel="alternate" hreflang="${l.c}" href="${base}${l.u.slice(1)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${base}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${base}img/og.jpg"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
};
const page = ({ data, account, seo, lang = '' }) => `<!doctype html>
<html lang="${lang || 'uz'}" data-site="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sayt</title>
<meta name="description" content="">
${FONTS}
${seo || ''}<style>${css}</style>
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
fs.cpSync(path.join(P, 'img'), path.join(OUT, 'img'), { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
// Huquqiy sahifalar, favicon, robots.txt, sitemap.xml, 404
const legal = require('./legal')({ site, domain: DOMAIN });
const FAV = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="45" font-size="38" font-weight="800" text-anchor="middle" fill="#04101c" font-family="Arial,sans-serif">I</text></svg>';
const urls = ['', 'ru/', 'en/', 'yaratish.html', 'bot.html', 'offerta.html', 'maxfiylik.html', 'qaytarish.html'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>https://${DOMAIN}/${u}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /kabinet\nDisallow: /api/\nSitemap: https://${DOMAIN}/sitemap.xml\n`;
const nf = `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sahifa topilmadi</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;font:16px/1.6 Inter,system-ui,sans-serif;background:#05070f;color:#eef1ff}h1{font-size:clamp(60px,14vw,140px);margin:0;letter-spacing:-.06em;background:linear-gradient(135deg,#22d3ee,#7c5cff);-webkit-background-clip:text;background-clip:text;color:transparent}p{color:#9aa6c4}a{display:inline-block;margin-top:14px;padding:12px 24px;border-radius:99px;background:#22d3ee;color:#04101c;font-weight:700;text-decoration:none}</style></head><body><div><h1>404</h1><p>Bunday sahifa topilmadi.</p><a href="/">Bosh sahifaga qaytish</a></div></body></html>`;
for (const dir of [P, OUT]) { for (const [f, t] of Object.entries(legal)) fs.writeFileSync(path.join(dir, f), t); fs.writeFileSync(path.join(dir, 'favicon.svg'), FAV); fs.writeFileSync(path.join(dir, 'robots.txt'), robots); fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap); }
fs.writeFileSync(path.join(OUT, '404.html'), nf);
if (process.env.CNAME) fs.writeFileSync(path.join(OUT, 'CNAME'), process.env.CNAME + '\n');
console.log('public/shablon.html, public/index.html va docs/ tayyor');
