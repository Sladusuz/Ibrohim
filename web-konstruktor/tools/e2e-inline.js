'use strict';
// Konstruktor: saytdagi matn ustiga bosib to'g'ridan-to'g'ri tahrirlash (kompyuter va telefon).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 240)); } };
const ROOT = path.join(__dirname, '..', 'docs'), MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, vp, mobile] of [['kompyuter', { width: 1360, height: 860 }, false], ['telefon', { width: 390, height: 800 }, true]]) {
    console.log(name);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 }); await ctx.route('**/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: "window.__API__='';window.__RELAY__='';" }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + '/yaratish.html', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.tc'); await p.locator('.tc').nth(2).locator('button').first().click(); await p.waitForSelector('#tabs button'); await p.waitForTimeout(2500);
    if (mobile) { await p.click('#mvt [data-v=view]'); await p.waitForTimeout(900); }
    ok(await p.locator('#edt.on').count() === 1, 'tahrirlash tugmasi yoqilgan');
    const fr = p.frameLocator('#if'); const frame = p.frames().find((f) => f.url().includes('shablon.html'));
    await frame.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    const target = await frame.evaluate(() => { const h = [...document.querySelectorAll('[data-sec] h2, [data-sec] .sub, [data-sec] p')].find((e) => e.offsetParent && e.textContent.trim().length > 8 && e.children.length === 0); if (!h) return null; h.setAttribute('data-test', '1'); return h.textContent.trim(); });
    ok(!!target, 'sayt ichida bosiladigan matn topildi', target);
    await frame.locator('[data-test="1"]').scrollIntoViewIfNeeded(); await frame.locator('[data-test="1"]').click({ force: true }); await p.waitForTimeout(500);
    ok(await frame.locator('.ied-sheet textarea').count() === 1, 'matn bosilganda tahrirlash oynasi ochildi'); const cur = await frame.locator('.ied-sheet textarea').inputValue(); ok(cur.replace(/\*/g, '').trim() === target.trim(), 'oynada joriy matn ko\'rinadi', cur);
    await frame.locator('.ied-sheet textarea').fill('Yangi sarlavha: sinov matni'); await frame.locator('.ied-sheet .ok').click(); await p.waitForTimeout(900);
    const now = await frame.evaluate(() => document.body.innerText); ok(/Yangi sarlavha: sinov matni/.test(now), 'sayt matni o\'zgardi (jonli)');
    ok(await frame.locator('.ied-sheet').count() === 0, 'oyna yopildi');
    const saved = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => /impro/.test(k) && /draft|site|builder/.test(k)) || '') || '{}'); } catch { return {}; } });
    // eksport ma'lumotida ham o'zgargan
    ok((await p.evaluate(() => JSON.stringify(Object.keys(localStorage).map((k) => localStorage.getItem(k)))).catch(() => '')).includes('Yangi sarlavha: sinov matni'), 'o\'zgarish brauzerda saqlandi');
    // havola bosilsa sahifa almashmaydi
    const navBefore = frame.url(); await frame.evaluate(() => { const a = [...document.querySelectorAll('a[href]')].find((x) => x.offsetParent); if (a) a.click(); }); await p.waitForTimeout(400); ok(frame.url() === navBefore, 'tahrirlash rejimida havola sahifani almashtirmaydi');
    // o'chirish: oddiy ko'rinish
    await p.click('#edt'); await p.waitForTimeout(300); await frame.locator('[data-test="1"]').click({ force: true }).catch(() => {}); await p.waitForTimeout(300); ok(await frame.locator('.ied-sheet').count() === 0, "tahrirlash o'chiq: oyna ochilmaydi");
    ok(errs.length === 0, 'JS xato yo\'q', errs); await ctx.close();
  }
  await b.close(); srv.close(); console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
