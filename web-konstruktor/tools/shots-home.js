'use strict';
// Bosh sahifa galereyasi uchun yuqori sifatli skrinshotlar: desktop (2x) va telefon (3x). Ishlatish: node tools/shots-home.js
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ROOT = path.join(__dirname, '..', 'docs'), OUT = path.join(__dirname, '..', 'public', 'img', 'home'), TMP = process.env.SHOT_TMP || '/tmp/shots-home';
const IDS = ['barber', 'fitness', 'kiyim', 'klinika', 'kompaniya', 'restoran', 'rieltor', 'stomatolog'];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end('no'); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  fs.mkdirSync(TMP, { recursive: true }); await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [kind, vp, dsf] of [['d', { width: 1440, height: 900 }, 2], ['m', { width: 390, height: 844 }, 3]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dsf, isMobile: kind === 'm', hasTouch: kind === 'm' });
    for (const id of IDS) {
      const p = await ctx.newPage(); await p.goto(`${base}/demo/${id}/`, { waitUntil: 'networkidle' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); const imgs = [...document.images]; imgs.forEach((i) => { i.loading = 'eager'; }); await Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); })))); });
      await p.addStyleTag({ content: '.demobar{display:none!important}' }); await p.waitForTimeout(4500); // kirish animatsiyalari tugasin
      const bad = await p.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src.slice(-40)));
      await p.screenshot({ path: `${TMP}/${id}-${kind}.png` }); console.log(id, kind, bad.length ? 'BUZUQ RASM: ' + bad.join(', ') : 'ok'); await p.close();
    }
    await ctx.close();
  }
  await b.close(); srv.close();
  execFileSync('python3', ['-c', `
from PIL import Image
import glob,os
for f in glob.glob('${TMP}/*.png'):
    n=os.path.basename(f)[:-4]; im=Image.open(f).convert('RGB')
    im.save('${OUT}/'+n+'.webp','WEBP',quality=84,method=6)
    print(n, im.size, os.path.getsize('${OUT}/'+n+'.webp')//1024,'KB')
`], { stdio: 'inherit' });
})().catch((e) => { console.error(e); process.exit(1); });
