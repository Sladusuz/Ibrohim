'use strict';
// Ilova uchun veb-qatlamni yig'adi: docs/ → app/www (sayt ilova ichida oflayn paketlanadi) + native.js
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'docs'), OUT = path.join(__dirname, '..', 'app', 'www');
fs.rmSync(OUT, { recursive: true, force: true }); fs.cpSync(SRC, OUT, { recursive: true });
for (const f of ['sw.js', 'CNAME', '404.html', 'robots.txt', 'sitemap.xml']) fs.rmSync(path.join(OUT, f), { force: true });
fs.copyFileSync(path.join(__dirname, 'app-native.js'), path.join(OUT, 'native.js'));
let n = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) { let h = fs.readFileSync(p, 'utf8'); h = h.replace(/<script[^>]*>[^<]*serviceWorker[^<]*<\/script>/g, ''); if (!h.includes('/native.js')) h = h.replace('</body>', '<script src="/native.js"></script></body>'); fs.writeFileSync(p, h); n++; } } })(OUT);
console.log(`app/www tayyor: ${n} ta sahifa`);
