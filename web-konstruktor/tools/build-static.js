'use strict';
// Yig'ish: shablon (konstruktor uchun), asosiy sahifa (server rejimi) va statik nashr (docs/).
// Ishga tushirish: node tools/build-static.js   (domen bilan: CNAME=sizning-domen.uz node tools/build-static.js)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..'), P = path.join(ROOT, 'public'), OUT = path.join(ROOT, 'docs');
const MARK = '/*__DATA__*/null';
const rd = (f) => fs.readFileSync(path.join(P, f), 'utf8');

const css = rd('style.css').replace(/\[data-theme=/g, '[data-site=');
const libs = ['icons.js', 'engine-core.js', 'sections.js', 'brief.js'].map(rd).join('\n');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;700;800&family=Playfair+Display:wght@500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">';

// opts.account: config.js + auth.js ulanadi (asosiy sayt); opts.data: ma'lumot ichiga joylanadi
const page = ({ data, account }) => `<!doctype html>
<html lang="uz" data-site="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sayt</title>
<meta name="description" content="">
${FONTS}
<style>${css}</style>
</head>
<body>
<div id="prog"></div><div class="aurora" id="aurora"><i></i><i></i><i></i></div><div class="gridbg" id="gridbg"></div><canvas id="bg"></canvas><div id="glow"></div>
<div id="app"><div class="boot"><span></span></div></div>
${account ? '<script src="/config.js"></script>' : ''}
<script>window.__SITE__=${data};</script>
<script>${libs}</script>
${account ? '<script src="/auth.js"></script>' : ''}
<script>E.boot();</script>
</body>
</html>`;

// 1) Shablon: konstruktor shundan tayyor sayt yasaydi (hisob va server yo'q, mustaqil)
fs.writeFileSync(path.join(P, 'shablon.html'), page({ data: MARK, account: false }));
// 2) Asosiy sahifa (server rejimi): ma'lumotni /api/site dan oladi
fs.writeFileSync(path.join(P, 'index.html'), page({ data: 'null', account: true }));

// 3) Statik nashr (GitHub Pages va shu kabilar)
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8'));
const html = page({ data: JSON.stringify(site).replace(/</g, '\\u003c'), account: true })
  .replace('<title>Sayt</title>', `<title>${String((site.company || {}).name || 'Sayt').replace(/</g, '')}</title>`);
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) { if (!['config.js', 'CNAME'].includes(f)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true }); }
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const f of ['yaratish.html', 'kabinet.html', 'builder.js', 'editor.js', 'auth.js', 'templates.js', 'icons.js', 'engine-core.js', 'sections.js', 'brief.js', 'ui.css', 'pricing.json', 'shablon.html']) fs.copyFileSync(path.join(P, f), path.join(OUT, f));
if (!fs.existsSync(path.join(OUT, 'config.js'))) fs.copyFileSync(path.join(P, 'config.js'), path.join(OUT, 'config.js'));
fs.cpSync(path.join(P, 'img'), path.join(OUT, 'img'), { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
if (process.env.CNAME) fs.writeFileSync(path.join(OUT, 'CNAME'), process.env.CNAME + '\n');
console.log('public/shablon.html, public/index.html va docs/ tayyor');
