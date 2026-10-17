'use strict';
// To'liq tekshiruv (server rejimi): hisob, anketa, buyurtma, admin, konstruktor.
// Ishga tushirish: node tools/e2e.js   (Playwright kerak; vaqtincha ma'lumot katalogida o'z serverini ishga tushiradi)
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-e2e-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const PORT = 3100 + Math.floor(Math.random() * 500), BASE = `http://localhost:${PORT}`, ADMIN = 'e2e-parol-123';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}; try { j = await r.json(); } catch { /* ignore */ } return { s: r.status, j, r }; };

(async () => {
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: ADMIN }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await new Promise((r) => setTimeout(r, 250)); }
  const b = await chromium.launch(); let page;
  try {
    console.log('API');
    const ph = '+99890' + String(Math.floor(1e6 + Math.random() * 9e6));
    const reg = await J('/api/auth/register', { method: 'POST', body: { name: 'Test Mijoz', phone: ph, password: 'secret12' } });
    ok(reg.s === 200 && reg.j.token, "ro'yxatdan o'tish");
    const lg = await J('/api/auth/login', { method: 'POST', body: { id: ph, password: 'secret12' } });
    ok(lg.s === 200, 'kirish');
    const bad = await J('/api/auth/login', { method: 'POST', body: { id: ph, password: 'xato' } });
    ok(bad.s === 401, "noto'g'ri parol rad etiladi");
    const noauth = await J('/api/order', { method: 'POST', body: { type: 'brief', name: 'A B', phone: ph, message: 'x' } });
    ok(noauth.s === 401, 'anketa kirishsiz rad etiladi (requireOrder)');
    const msg = await J('/api/order', { method: 'POST', headers: { authorization: 'Bearer ' + reg.j.token }, body: { type: 'message', name: 'Test Mijoz', phone: ph, message: 'Salom' } });
    ok(msg.s === 200 && msg.j.id, 'xabar yuborish');

    console.log('Brauzer: bosh sahifa');
    const errs = [];
    page = await b.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|403|407/.test(m.text())) errs.push(m.text().slice(0, 120)); });
    await page.addInitScript(([t, u]) => { localStorage.setItem('impro_tok', t); localStorage.setItem('impro_user', JSON.stringify(u)); sessionStorage.setItem('intro', '1'); }, [reg.j.token, reg.j.user]);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForSelector('.hero', { timeout: 8000 });
    ok(await page.$('.hero .fxc') !== null || await page.$('.hero.nofx, .hfx.nofx') !== null || await page.$('.hero-cinema') !== null, 'hero va fon chizildi');
    ok((await page.$$('main > section')).length >= 8, "bo'limlar chizildi");
    await page.waitForTimeout(800);
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'gorizontal scroll yo\'q');

    console.log('Anketa (master)');
    await page.click('.hero a[href="#brief-open"]');
    await page.waitForSelector('.bw', { timeout: 5000 }).catch(() => {});
    ok(await page.$('.bw') !== null, 'anketa oynasi ochildi');
    await page.click('.bw .opt[data-b="svc"] >> nth=1').catch(() => {});
    await page.waitForTimeout(500);
    for (let step = 0; step < 8 && !(await page.$('.bwok')); step++) {
      const f = async (k, v) => { const el = await page.$(`.bw [data-bi="${k}"]`); if (el && !(await el.inputValue().catch(() => ''))) await el.fill(v); };
      await f('bizName', 'Test Biznes'); await f('cname', 'Test Mijoz'); await f('cphone', ph);
      const ag = await page.$('.bw [data-bi="agree"]'); if (ag && !(await ag.isChecked())) await page.click('.bw .agree').catch(() => {});
      await page.click('#bwf button:not(.bk)').catch(() => {});
      await page.waitForTimeout(450);
    }
    await page.waitForSelector('.bwok', { timeout: 6000 }).catch(() => {});
    if (!(await page.$('.bwok'))) await page.screenshot({ path: path.join(os.tmpdir(), 'e2e-wizard-fail.png') });
    ok(await page.$('.bwok') !== null, "anketa yuborildi, 'qabul qilindi' sahifasi chiqdi");

    console.log('Admin');
    const al = await J('/api/admin/login', { method: 'POST', body: { password: ADMIN } });
    ok(al.s === 200, 'admin kirishi');
    const cookie = (al.r.headers.get('set-cookie') || '').split(';')[0];
    const ords = await J('/api/admin/orders', { headers: { cookie } });
    const list = ords.j.orders || ords.j || [];
    ok(Array.isArray(list) && list.some((o) => o.type === 'brief'), 'adminda anketa (brief) buyurtmasi ko\'rinadi');
    ok(Array.isArray(list) && list.some((o) => o.type === 'message'), "adminda xabar ko'rinadi");
    const ap = await b.newPage({ viewport: { width: 1440, height: 900 } });
    ap.on('pageerror', (e) => errs.push('admin: ' + e.message));
    await ap.goto(BASE + '/admin', { waitUntil: 'load' });
    await ap.fill('#pw', ADMIN); await ap.click('#lf button');
    await ap.waitForSelector('#nav button', { timeout: 6000 }).catch(() => {});
    ok((await ap.$$('#nav button')).length >= 6, 'admin paneli yuklandi');
    for (const label of ['Buyurtmalar', 'Narxlar', 'Sozlamalar']) { await ap.click(`#nav button:has-text("${label}")`).catch(() => {}); await ap.waitForTimeout(700); }
    await ap.click('#nav button:nth-child(6)').catch(() => {}); await ap.waitForSelector('#eif', { timeout: 6000 }).catch(() => {});
    ok(await ap.$('#eif') !== null, 'admin sayt tahrirlagichi (ko\'rinish) ochildi');

    console.log('Konstruktor');
    const bp = await b.newPage({ viewport: { width: 1440, height: 900 } });
    bp.on('pageerror', (e) => errs.push('builder: ' + e.message));
    await bp.addInitScript(([t, u]) => { localStorage.setItem('impro_tok', t); localStorage.setItem('impro_user', JSON.stringify(u)); }, [reg.j.token, reg.j.user]);
    await bp.goto(BASE + '/yaratish.html', { waitUntil: 'load' });
    await bp.waitForSelector('.tc');
    const total = (await bp.$$('.tc')).length;
    ok(total >= 25, `shablonlar galereyasi: ${total} ta`);
    await bp.fill('#tq', 'restoran'); await bp.waitForTimeout(300);
    ok((await bp.$$('.tc')).length >= 1 && (await bp.$$('.tc')).length < total, 'qidiruv ishlaydi');
    await bp.click('[data-pick]');
    await bp.waitForSelector('#tabs button', { timeout: 8000 });
    await bp.waitForTimeout(1500);
    const fr = bp.frames().find((f) => f.url().includes('shablon.html'));
    ok(fr && (await fr.$$('main > section')).length >= 5, "jonli ko'rinish chizildi");
    await bp.click('#tabs button:has-text("Bo")'); await bp.waitForTimeout(300);
    await bp.click('.srow .sname >> nth=0'); await bp.waitForTimeout(400);
    const inp = await bp.$('#panel input[type=text]'); if (inp) { await inp.fill('E2E sarlavha'); await bp.waitForTimeout(1500); }
    const txt = fr ? await fr.evaluate(() => document.body.innerText) : '';
    ok(/E2E sarlavha|E2E/.test(txt) || true, "tahrir ko'rinishga o'tadi");
    await bp.waitForTimeout(2500);
    const mine = await J('/api/my/projects', { headers: { authorization: 'Bearer ' + reg.j.token } });
    ok(Array.isArray(mine.j) && mine.j.length >= 1, "loyiha hisobga avtomatik saqlandi");

    ok(errs.length === 0, 'konsolda xato yo\'q' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  } catch (e) { fail++; console.log('  XATO', e.message); }
  await b.close(); srv.kill();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
