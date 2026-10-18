'use strict';
// Telefonda (390x800) har bir shablonning funksiyalarini tekshiradi: burger-menyu, havolalar, savat, tezkor ko'rish, galereya, modal oynalar.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ROOT = path.join(__dirname, '..', 'docs');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const only = process.argv[2] ? process.argv[2].split(',') : null; const bad = []; const stat = { burger: 0, nav: 0, cart: 0, qv: 0, lb: 0, brief: 0, menu: 0, shop: 0, proj: 0 };
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const ids = fs.readdirSync(path.join(ROOT, 'demo')).filter((d) => fs.existsSync(path.join(ROOT, 'demo', d, 'index.html')) && (!only || only.includes(d)));
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route('**/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: "window.__API__='';window.__RELAY__='';" }));
  for (const id of ids) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.dismiss().catch(() => {}));
    const fail = (m) => bad.push(`${id}: ${m}`); const vis = (s) => p.locator(s).first().isVisible().catch(() => false); const fits = async (s) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return true; const r = e.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1; }, s);
    await p.goto(`${base}/demo/${id}/`, { waitUntil: 'load' }); await p.waitForTimeout(900);
    // 1) burger menyu
    const bg = p.locator('[data-act=burger]').first();
    if (await bg.count()) { stat.burger++; await bg.tap(); await p.waitForTimeout(450); const open = await p.evaluate(() => { const l = [...document.querySelectorAll('nav a,header a,.mnav a,.menu a')].filter((a) => a.offsetParent && a.getBoundingClientRect().width > 40 && a.getBoundingClientRect().top >= 0 && a.getBoundingClientRect().top < innerHeight); return l.length; }); if (open < 2) fail('burger-menyu ochilmadi yoki havolalar ko\'rinmadi'); else {
      stat.nav++; const y0 = await p.evaluate(() => scrollY); const lk = await p.evaluate(() => { const a = [...document.querySelectorAll('a[href^="#"]')].filter((x) => x.offsetParent && x.getAttribute('href').length > 1 && x.getAttribute('href') !== '#top' && document.querySelector(x.getAttribute('href')))[0]; return a ? a.getAttribute('href') : null; });
      if (lk) { await p.locator(`a[href="${lk}"]`).first().tap().catch(() => {}); await p.waitForTimeout(900); const y1 = await p.evaluate(() => scrollY); if (y1 === y0) fail('menyu havolasi sahifani siljitmadi (' + lk + ')'); } } await p.evaluate(() => scrollTo(0, 0)); }
    // 2) savat
    const add = p.locator('[data-act=add]').first();
    if (await add.count()) { stat.cart++; await add.scrollIntoViewIfNeeded().catch(() => {}); await add.tap().catch(() => {}); await p.waitForTimeout(500); const co = p.locator('[data-act=cart-open]').first(); await co.tap().catch(() => {}); await p.waitForTimeout(600);
      if (!(await vis('.drawer'))) fail('savat paneli ochilmadi'); else { if (!(await fits('.drawer'))) fail('savat paneli ekrandan chiqib ketgan'); const inc = p.locator('[data-act=inc]').first(); if (await inc.count()) { await inc.tap().catch(() => {}); await p.waitForTimeout(250); } const ck = p.locator('[data-act=checkout]').first(); if (await ck.count()) { await ck.tap().catch(() => {}); await p.waitForTimeout(600); const ok2 = await p.evaluate(() => { const f = [...document.querySelectorAll('.modal,.dlg,.sheet,[role=dialog],form')].filter((e) => e.offsetParent); return f.length > 0 && document.documentElement.scrollWidth <= innerWidth + 1; }); if (!ok2) fail('buyurtma oynasi/shakli noto\'g\'ri ko\'rinadi'); } }
      await p.keyboard.press('Escape'); await p.evaluate(() => { document.querySelectorAll('[data-act=cart-close],[data-act=close]').forEach((e) => e.click()); }); await p.waitForTimeout(300); }
    // 3) tezkor ko'rish
    const qv = p.locator('[data-act=qv]').first(); if (await qv.count()) { stat.qv++; await qv.scrollIntoViewIfNeeded().catch(() => {}); await qv.tap().catch(() => {}); await p.waitForTimeout(500); if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) fail("tezkor ko'rish gorizontal siljitadi"); await p.evaluate(() => document.querySelectorAll('[data-act=close]').forEach((e) => e.click())); await p.waitForTimeout(250); }
    // 4) galereya (lightbox)
    const lb = p.locator('[data-act=lb]').first(); if (await lb.count()) { stat.lb++; await lb.scrollIntoViewIfNeeded().catch(() => {}); await lb.tap().catch(() => {}); await p.waitForTimeout(500); const lbOk = await p.evaluate(() => { const i = document.querySelector('.lb img'); if (!i || !i.offsetParent) return false; const r = i.getBoundingClientRect(); return r.width > 50 && r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1; }); if (!lbOk) fail('galereya oynasi ochilmadi yoki ekrandan chiqdi'); await p.evaluate(() => document.querySelectorAll('[data-act=close],[data-act=lb-close]').forEach((e) => e.click())); await p.keyboard.press('Escape'); await p.waitForTimeout(250); }
    // 5) loyiha, menyu, kategoriya filtri
    for (const [k, sel] of [['proj', '[data-act=proj-tag]'], ['menu', '[data-act=menu-cat]'], ['shop', '[data-act=shop-cat]']]) { const els = p.locator(sel); if (await els.count() > 1) { stat[k]++; await els.nth(1).scrollIntoViewIfNeeded().catch(() => {}); await els.nth(1).tap().catch(() => {}); await p.waitForTimeout(350); if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) fail(k + ' filtri sahifani kengaytirdi'); } }
    // 6) brief oynasi
    const br = p.locator('[data-act=brief-open]').first(); if (await br.count()) { stat.brief++; await br.scrollIntoViewIfNeeded().catch(() => {}); await br.tap().catch(() => {}); await p.waitForTimeout(700); const ok3 = await p.evaluate(() => { const m = [...document.querySelectorAll('[class*=brief],[class*=modal],dialog')].find((e) => e.offsetParent && getComputedStyle(e).position === 'fixed'); if (!m) return null; const r = m.getBoundingClientRect(); return r.width <= innerWidth + 1 && r.height <= innerHeight + 2; }); if (ok3 === false) fail('brief oynasi ekranga sig\'mayapti'); }
    // 7) umumiy: gorizontal siljish, JS xato
    if (errs.length) fail('JS xato: ' + errs[0]);
    await p.close(); process.stdout.write('.');
  }
  console.log(`\n${ids.length} shablon tekshirildi (telefon 390px). Funksiyalar: ${Object.entries(stat).map(([k, v]) => k + ' ' + v).join(', ')}`);
  console.log(bad.length ? 'MUAMMOLAR (' + bad.length + '):\n' + bad.join('\n') : 'Muammo topilmadi.'); await b.close(); srv.close(); process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
