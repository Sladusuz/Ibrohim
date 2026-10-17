'use strict';
// Shablonlarning kichik rasmlarini (img/tpl/<id>.jpg) Playwright yordamida suratga oladi.
// Ishga tushirish: node tools/shoot-thumbs.js   (Playwright va Chromium o'rnatilgan bo'lishi kerak)
const http = require('http');
const fs = require('fs');
const path = require('path');
const P = path.join(__dirname, '..', 'public');
const OUT = path.join(P, 'img', 'tpl');
fs.mkdirSync(OUT, { recursive: true });
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const TPL_FILES = fs.readdirSync(P).filter((f) => /^tpl-.*\.js$/.test(f)).sort().map((f) => `<script src="/${f}"></script>`).join('');
const H = `<!doctype html><html lang="uz" data-site="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>t</title><meta name="description" content=""><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/motion.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;700;800&family=Playfair+Display:wght@500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700&family=Instrument+Serif:ital@0;1&family=Unbounded:wght@500;600&display=swap" rel="stylesheet"></head><body><div class="aurora" id="aurora"><i></i><i></i><i></i></div><div class="gridbg"></div><canvas id="bg"></canvas><div id="glow"></div><div id="app"></div><script src="/icons.js"></script><script src="/engine-core.js"></script><script src="/sections.js"></script><script src="/sections2.js"></script><script src="/motion.js"></script><script src="/templates.js"></script>${TPL_FILES}<script>window.__SITE__=getTemplate(new URLSearchParams(location.search).get('t'));E.boot();</script></body></html>`;
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); if (u.pathname === '/_t.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(H); }
  const f = path.join(P, decodeURIComponent(u.pathname)); if (!f.startsWith(P) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
srv.listen(0, async () => {
  const port = srv.address().port; const b = await chromium.launch();
  const probe = await b.newPage(); await probe.goto(`http://localhost:${port}/_t.html?t=x`); const ids = process.argv[2] ? process.argv.slice(2) : await probe.evaluate(() => window.TEMPLATES.map((t) => t.id)); await probe.close();
  for (const id of ids) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.goto(`http://localhost:${port}/_t.html?t=${id}`); await p.waitForSelector('.hero'); await p.waitForTimeout(4200);
    await p.screenshot({ path: path.join(OUT, id + '.jpg'), type: 'jpeg', quality: 78, clip: { x: 0, y: 0, width: 1280, height: 800 } });
    await p.close(); console.log('rasm:', id);
  }
  await b.close(); srv.close();
});
