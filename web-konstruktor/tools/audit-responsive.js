'use strict';
// Barcha shablon namunalarini 5 xil kenglikda tekshiradi: gorizontal siljish, ekrandan chiqib ketgan elementlar, buzuq rasm, mayda matn, kichik tugma.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ROOT = path.join(__dirname, '..', 'docs'), WIDTHS = [320, 360, 390, 768, 1024, 1440];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const only = process.argv[2] ? process.argv[2].split(',') : null;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const ids = fs.readdirSync(path.join(ROOT, 'demo')).filter((d) => fs.existsSync(path.join(ROOT, 'demo', d, 'index.html')) && (!only || only.includes(d)));
  const b = await chromium.launch(); const issues = [];
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 700 ? 800 : 900 }, isMobile: w < 700, hasTouch: w < 1000 });
    for (const id of ids) {
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
      await p.goto(`${base}/demo/${id}/`, { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(700);
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300)); });
      const r = await p.evaluate(() => {
        const W = innerWidth, out = { overflow: document.documentElement.scrollWidth - W, off: [], broken: 0, tiny: 0, small: 0 };
        const clipped = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (e !== el && /(hidden|auto|scroll|clip)/.test(s.overflowX) || s.position === 'fixed') return true; } return false; };
        document.querySelectorAll('body *').forEach((el) => {
          const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed' && el.getBoundingClientRect().width === 0) return;
          const b = el.getBoundingClientRect(); if (!b.width || !b.height) return;
          if (b.right > W + 2 && !clipped(el) && out.off.length < 4) out.off.push((el.className && String(el.className).split(' ')[0] || el.tagName.toLowerCase()) + ':' + Math.round(b.right - W));
          if (el.tagName === 'IMG' && el.complete && !el.naturalWidth) out.broken++;
          if ((el.tagName === 'A' || el.tagName === 'BUTTON') && (b.height < 30 || b.width < 30) && b.width < W && el.textContent.trim().length < 2 && !el.querySelector('img') && b.top > 0) out.tiny++;
          if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3) && parseFloat(s.fontSize) < 11) out.small++;
        });
        return out;
      });
      if (r.overflow > 1 || r.off.length || r.broken || errs.length) issues.push({ id, w, ...r, errs: errs.slice(0, 1) });
      await p.close();
    }
    await ctx.close(); process.stdout.write(`w${w} `);
  }
  console.log('\n' + ids.length + ' shablon x ' + WIDTHS.length + ' kenglik tekshirildi.'); const by = {};
  for (const i of issues) (by[i.id] = by[i.id] || []).push(`${i.w}px: ${i.overflow > 1 ? 'siljish ' + i.overflow + ' ' : ''}${i.off.length ? 'chiqqan[' + i.off.join(',') + '] ' : ''}${i.broken ? 'buzuq rasm ' + i.broken : ''}${i.errs.length ? 'xato: ' + i.errs[0] : ''}`);
  for (const [id, l] of Object.entries(by)) console.log(' ' + id + '\n   ' + l.join('\n   '));
  console.log(issues.length ? `\nMUAMMO: ${issues.length} ta` : '\nMuammo topilmadi.'); await b.close(); srv.close(); process.exit(issues.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
