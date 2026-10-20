'use strict';
// Vizitka shablonlari: galereya, oldindan ko'rish, vizitka rejimi, inline tahrirlash (kompyuter va telefon).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 240)); } };
const ROOT = path.join(__dirname, '..', 'docs'), MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const IDS = ['vz-talim', 'vz-dasturchi', 'vz-salon', 'vz-barber', 'vz-klinika', 'vz-fitnes', 'vz-fotograf', 'vz-yurist', 'vz-tadbir', 'vz-kafe'];
  for (const [name, vp, mobile] of [['kompyuter', { width: 1360, height: 860 }, false], ['telefon', { width: 390, height: 800 }, true]]) {
    console.log(name);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 }); await ctx.route('**/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: "window.__API__='';window.__DEMO__=0;" }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + '/yaratish.html', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.tc');
    const cnt = await p.evaluate((ids) => ids.filter((i) => window.TEMPLATES.some((t) => t.id === i && t.cat === 'Vizitka')).length, IDS); ok(cnt === 10, '10 ta vizitka shabloni galereyada', cnt);
    ok(await p.locator('#grp [data-grp=vizitka]').count() === 1 && await p.locator('.tc.vz').count() === 0, 'Vizitkalar alohida bo\'lim (asosiy ro\'yxatda aralashmagan)');
    await p.locator('#grp [data-grp=vizitka]').click(); await p.waitForTimeout(400);
    ok(await p.locator('.tc.vz').count() === 10 && await p.locator('#cats').evaluate((e) => e.hidden), 'Vizitkalar bo\'limi: 10 ta telefon-karta, kategoriya qatori yo\'q', await p.locator('.tc.vz').count());
    await p.locator('.tc[data-id="vz-talim"] button').first().click(); await p.waitForSelector('#tabs button'); await p.waitForTimeout(2600);
    if (mobile) { await p.click('#mvt [data-v=view]'); await p.waitForTimeout(900); }
    const frame = p.frames().find((f) => f.url().includes('shablon.html'));
    ok(await frame.locator('.vcard').count() === 1, 'oldindan ko\'rishda vizitka chiqdi');
    ok(await frame.evaluate(() => document.documentElement.classList.contains('card-mode') && document.documentElement.classList.contains('vcd-emerald')), 'vizitka rejimi va dizayn klassi');
    ok(await frame.locator('#nav').count() === 0, 'menyu (nav) yo\'q: vizitka rejimi');
    ok(await frame.locator('.vcl').count() >= 3 && await frame.locator('.vcsoc a').count() >= 3, 'havola kartalari va tarmoq ikonkalari bor');
    ok(await frame.evaluate(() => [...document.querySelectorAll('.vcsoc a')].every((a) => /^(https:\/\/(instagram\.com|t\.me|youtube\.com|wa\.me|tiktok\.com)|tel:|mailto:|https:\/\/www\.google)/.test(a.href))), 'tarmoq havolalari to\'g\'ri yasalgan', await frame.evaluate(() => [...document.querySelectorAll('.vcsoc a')].map((a) => a.href)));
    ok(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'gorizontal scroll yo\'q');
    // tahrirlash: ism ustiga bosish
    if (!mobile || true) { const edt = p.locator('#edt'); if (await edt.count() && !(await p.locator('#edt.on').count())) await edt.click(); await p.waitForTimeout(300);
      await frame.locator('.vcid h1').scrollIntoViewIfNeeded(); await frame.locator('.vcid h1').click({ force: true }); await p.waitForTimeout(500);
      ok(await frame.locator('.ied-sheet textarea').count() === 1, 'ism ustiga bosilganda tahrirlash oynasi ochildi');
      await frame.locator('.ied-sheet textarea').fill('Yangi Nom'); await frame.locator('.ied-sheet .ok').click(); await p.waitForTimeout(900);
      ok((await frame.locator('.vcid h1').innerText()).trim() === 'Yangi Nom', 'ism jonli o\'zgardi'); }
    // muharrir: yangi ikonkalar ro'yxatda
    const hasIcons = await p.evaluate(() => ['telegram', 'whatsapp', 'youtube', 'tiktok', 'facebook', 'linkedin'].every((k) => !!window.ICONS[k]));
    ok(hasIcons, 'yangi brend ikonkalari ICONS da bor');
    ok(errs.length === 0, 'JS xato yo\'q', errs); await ctx.close();
  }
  await b.close(); srv.close(); console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
