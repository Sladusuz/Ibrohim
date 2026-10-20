'use strict';
// Shablonni to'liq tekshiradi: konsol xatolari, siniq rasmlar, gorizontal scroll, bo'limlar bo'ylab skrinshotlar.
// Ishga tushirish: node tools/check-template.js <id> [<id>...]   (natija: SHOTS katalogi, standart /tmp/tpl-shots)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const P = path.join(__dirname, '..', 'public');
const OUT = process.env.SHOTS || '/tmp/tpl-shots';
fs.mkdirSync(OUT, { recursive: true });
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;700;800&family=Playfair+Display:wght@500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700&family=Instrument+Serif:ital@0;1&family=Unbounded:wght@500;600&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">';
const TPL = fs.readdirSync(P).filter((f) => /^tpl-.*\.js$/.test(f)).sort().map((f) => `<script src="/${f}"></script>`).join('');
const H = `<!doctype html><html lang="uz" data-site="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>t</title><meta name="description" content=""><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/motion.css"><link rel="stylesheet" href="/vcard.css">${FONTS}</head><body><div id="prog"></div><div class="aurora" id="aurora"><i></i><i></i><i></i></div><div class="gridbg" id="gridbg"></div><canvas id="bg"></canvas><div id="glow"></div><div id="app"></div><script src="/icons.js"></script><script src="/engine-core.js"></script><script src="/sections.js"></script><script src="/sections2.js"></script><script src="/sections3.js"></script><script src="/motion.js"></script><script src="/brief.js"></script><script src="/templates.js"></script>${TPL}<script>window.__SITE__=getTemplate(new URLSearchParams(location.search).get('t'));E.boot();</script></body></html>`;
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); if (u.pathname === '/_t.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(H); }
  const f = path.join(P, decodeURIComponent(u.pathname)); if (!f.startsWith(P) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
srv.listen(0, async () => {
  const port = srv.address().port; const b = await chromium.launch(); const ids = process.argv.slice(2); let bad = 0;
  for (const id of ids) {
    const rep = { id, errors: [], broken: [], overflowDesktop: false, overflowMobile: false, sections: 0 };
    for (const [tag, vw, vh] of [['d', 1440, 900], ['m', 390, 844]]) {
      const p = await b.newPage({ viewport: { width: vw, height: vh } });
      p.on('pageerror', (e) => rep.errors.push(tag + ': ' + e.message));
      p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::ERR_(NAME|INTERNET|CONNECTION|BLOCKED|PROXY|TUNNEL)|Failed to load resource.*(403|407|503)/.test(m.text())) rep.errors.push(tag + ': ' + m.text().slice(0, 160)); });
      p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(`http://localhost:${port}`)) rep.broken.push(r.status() + ' ' + r.url().replace(`http://localhost:${port}`, '')); });
      await p.goto(`http://localhost:${port}/_t.html?t=${id}`, { waitUntil: 'load' });
      await p.waitForSelector('.hero,.vcard', { timeout: 8000 }).catch(() => rep.errors.push(tag + ': hero topilmadi'));
      await p.waitForTimeout(3800);
      const ids2 = await p.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => s.id));
      rep.sections = ids2.length;
      let k = 0;
      for (const sid of ids2) {
        await p.evaluate((s) => { const el = document.getElementById(s); const r = el.getBoundingClientRect(); window.scrollTo({ top: scrollY + r.top - (el.classList.contains('hs') ? 0 : 50), behavior: 'instant' }); }, sid);
        await p.waitForTimeout(160); await p.evaluate(() => window.scrollBy({ top: 30, behavior: 'instant' })); await p.waitForTimeout(1100);
        if (tag === 'd' || k === 0) await p.screenshot({ path: path.join(OUT, `${id}-${tag}-${String(++k).padStart(2, '0')}-${sid}.png`) });
      }
      const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      if (tag === 'd') rep.overflowDesktop = ov; else rep.overflowMobile = ov;
      const imgs = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith('data:')).map((i) => i.src.slice(-60)));
      rep.broken.push(...imgs);
      await p.close();
    }
    rep.broken = [...new Set(rep.broken)];
    const ok = !rep.errors.length && !rep.broken.length && !rep.overflowDesktop && !rep.overflowMobile;
    if (!ok) bad++;
    console.log(ok ? 'OK  ' : 'FAIL', id, JSON.stringify(rep));
    try { // kontakt varaq (PIL bo'lsa)
      const files = fs.readdirSync(OUT).filter((f) => f.startsWith(id + '-d-')).sort().map((f) => path.join(OUT, f));
      execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image
fs=sys.argv[2:]
ims=[Image.open(f).resize((480,300)) for f in fs]
cols=3;rows=(len(ims)+cols-1)//cols
W=Image.new('RGB',(480*cols,300*rows),(20,20,20))
for i,im in enumerate(ims): W.paste(im,((i%cols)*480,(i//cols)*300))
W.save(sys.argv[1])`, path.join(OUT, `${id}-sheet.png`), ...files]);
      console.log('   kontakt varaq:', path.join(OUT, `${id}-sheet.png`));
    } catch { /* ixtiyoriy */ }
  }
  await b.close(); srv.close(); process.exit(bad ? 1 : 0);
});
