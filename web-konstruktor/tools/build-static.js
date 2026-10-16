'use strict';
// Statik nashr (GitHub Pages va shu kabilar) va konstruktor shabloni uchun yig'ish.
// Ishga tushirish: node tools/build-static.js   (domen uchun: CNAME=sizning-domen.uz node tools/build-static.js)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const P = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'docs');
const MARK = '/*__DATA__*/null';

const css = fs.readFileSync(path.join(P, 'style.css'), 'utf8')
  .replace('[data-theme=dark]{--bg', 'html,[data-site=dark]{--bg').replace(/\[data-theme=/g, '[data-site=')
  + '\n:root{color-scheme:dark}[data-site=light]{color-scheme:light}';
const js = fs.readFileSync(path.join(P, 'app.js'), 'utf8').replace(/dataset\.theme/g, 'dataset.site');
const icons = fs.readFileSync(path.join(P, 'icons.js'), 'utf8');

const page = (data) => `<!doctype html>
<html lang="uz" data-site="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sayt</title>
<meta name="description" content="">
<style>${css}</style>
</head>
<body>
<div id="prog"></div><div class="aurora" id="aurora"><i></i><i></i><i></i></div><div class="gridbg" id="gridbg"></div><canvas id="bg"></canvas><div id="glow"></div>
<div id="app"><div class="boot"><span></span></div></div>
<script>window.__SITE__=${data};window.__MAILTO__=window.__SITE__?((window.__SITE__.contacts&&window.__SITE__.contacts.email)||''):undefined;</script>
<script>${icons}</script>
<script>${js}</script>
</body>
</html>`;

// 1) Shablon: konstruktor shu fayldan tayyor sayt yasaydi
fs.writeFileSync(path.join(P, 'shablon.html'), page(MARK));

// 2) Asosiy sayt: ma'lumot ichiga joylanadi
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8'));
delete site.notify;
site.features.builder = true;
for (const p of site.products) {
  if (p.image && p.image.startsWith('/img/')) p.image = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(P, p.image.slice(1))).toString('base64');
}
const index = page(JSON.stringify(site).replace(/</g, '\\u003c'));
const title = (site.company.name || 'Sayt').replace(/</g, '');
const html = index.replace('<title>Sayt</title>', `<title>${title}</title>`).replace('<meta name="description" content="">', `<meta name="description" content="${String(site.hero.text || '').replace(/"/g, '&quot;')}">`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const f of ['yaratish.html', 'builder.js', 'icons.js', 'builder-default.json', 'shablon.html']) fs.copyFileSync(path.join(P, f), path.join(OUT, f));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
if (process.env.CNAME) fs.writeFileSync(path.join(OUT, 'CNAME'), process.env.CNAME + '\n');
console.log('docs/ va public/shablon.html tayyor');
