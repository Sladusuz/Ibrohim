'use strict';
// Telegram Mini App (/app): mobil ko'rinish, tezlik, ish oqimi. Soxta Telegram + SQLite (D1) bilan Worker mahalliy serverda ishga tushiriladi.
const path = require('path'), http = require('http'), crypto = require('crypto');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 240)); } };
(async () => {
  require('./build-worker.js');
  const W = (await import(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs') + '?t=' + Date.now())).default;
  const realFetch = globalThis.fetch, tgc = [];
  globalThis.fetch = async (url, o) => { const m = /bot([^/]+)\/(\w+)$/.exec(String(url)); if (m) { let b = {}; try { b = JSON.parse(o.body); } catch { /* */ } tgc.push({ method: m[2], body: b }); return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } })); } return realFetch(url, o); };
  const { DatabaseSync } = require('node:sqlite'), sdb = new DatabaseSync(':memory:');
  const env = { TG_TOKEN: '1:a', WEBHOOK_SECRET: 'whsec_abcdefghijklmnop', TG_CHAT: '7', ADMIN_PASSWORD: 'x', DB: { prepare(sql) { const s = sdb.prepare(sql); let a = []; const o = { bind(...x) { a = x; return o; }, async first() { return s.get(...a) || null; }, async all() { return { results: s.all(...a) }; }, async run() { s.run(...a); return {}; } }; return o; } } };
  const srv = http.createServer(async (q, r) => { const chunks = []; for await (const c of q) chunks.push(c); const body = Buffer.concat(chunks); const res = await W.fetch(new Request('http://localhost:' + srv.address().port + q.url, { method: q.method, headers: q.headers, body: ['GET', 'HEAD'].includes(q.method) ? undefined : body }), env, { waitUntil() {} }); r.writeHead(res.status, Object.fromEntries(res.headers)); r.end(Buffer.from(await res.arrayBuffer())); });
  await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const api = async (m, p, b, tok) => { const r = await realFetch(base + p, { method: m, headers: { 'content-type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: b ? JSON.stringify(b) : undefined }); return r.json(); };
  // namunaviy ma'lumotlar
  const names = ['Aziz Karimov', 'Dilnoza Rahimova', 'Jasur Tursunov', 'Madina Qodirova'];
  const toks = []; for (let i = 0; i < names.length; i++) { const r = await api('POST', '/api/auth/register', { name: names[i], phone: '+99890' + (1000000 + i * 1111), email: i % 2 ? 'a' + i + '@x.uz' : '', password: 'secret12' }); toks.push(r.token); }
  for (let i = 0; i < 3; i++) { const p = await api('POST', '/api/my/projects', { name: 'Sayt ' + (i + 1), data: { company: { name: 'S' }, sections: [{ type: 'hero' }] } }, toks[i]); await api('POST', '/api/my/projects/' + p.project.id + '/submit', { plan: 'Standart' }, toks[i]); }
  for (let i = 0; i < 6; i++) await api('POST', '/api/order', { type: i % 2 ? 'order' : 'brief', name: names[i % 4], phone: '+998901112233', message: i % 2 ? '' : 'Sayt va bot kerak', items: i % 2 ? [{ id: 'a', name: 'Smartfon', price: 1500000, qty: 1 }] : [] });
  const initFor = (id, tok) => { const p = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id }) }, str = Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join('\n'), sec = crypto.createHmac('sha256', 'WebAppData').update(tok).digest(); return new URLSearchParams({ ...p, hash: crypto.createHmac('sha256', sec).update(str).digest('hex') }).toString(); };
  const stub = (init) => `window.Telegram={WebApp:{initData:${JSON.stringify(init)},ready(){},expand(){},disableVerticalSwipes(){},setHeaderColor(){},showConfirm(m,cb){cb(true)},openLink(){},HapticFeedback:{impactOccurred(){},notificationOccurred(){}}}};`;
  const b = await chromium.launch();
  const open = async (init, vp) => { const ctx = await b.newContext({ viewport: vp || { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await ctx.route('https://telegram.org/**', (r) => r.fulfill({ contentType: 'text/javascript', body: stub(init) })); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.errs = errs; const t0 = Date.now(); await p.goto(base + '/app', { waitUntil: 'domcontentloaded' }); p.t0 = t0; return p; };
  // 1) admin
  let p = await open(initFor(7, '1:a')); await p.waitForSelector('.kpi', { timeout: 8000 }); const ttfv = Date.now() - p.t0;
  ok(ttfv < 3000, "birinchi ko'rinish tez (" + ttfv + ' ms)'); ok((await p.locator('.kpi').count()) === 4, '4 ta KPI kartochkasi');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "gorizontal scroll yo'q (390px)");
  ok(await p.evaluate(() => [...document.querySelectorAll('nav button')].every((x) => x.getBoundingClientRect().height >= 44)), 'pastki menyu tugmalari >= 44px (bosish qulay)');
  await p.screenshot({ path: '/tmp/ma-dash.png' });
  await p.click('nav [data-t=orders]'); await p.waitForSelector('#m .item', { timeout: 6000 }); ok((await p.locator('#m .item').count()) === 6, 'buyurtmalar ro\'yxati (6)');
  const stBefore = await p.locator('#m .pill').first().innerText(); await p.screenshot({ path: '/tmp/ma-orders.png' });
  await p.click('#m [data-st]'); await p.click('#shc [data-ns$="|bajarildi"]'); await p.waitForTimeout(400); ok((await p.locator('#m .pill.done').count()) >= 1, 'holat o\'zgartirildi (optimistik)');
  const ordersNow = await api('POST', '/api/admin/login', { password: 'x' }).then((l) => api('GET', '/api/admin/orders', null, l.token)); ok(ordersNow.some((o) => o.status === 'bajarildi'), 'holat serverda saqlandi');
  await p.click('#ch [data-f=bajarildi]'); ok((await p.locator('#m .item').count()) === 1, 'filtr: Bajarildi');
  await p.click('nav [data-t=sites]'); await p.waitForSelector('#m .item', { timeout: 6000 }); ok((await p.locator('#m [data-paid]').count()) === 3, 'saytlar: 3 ta to\'lanmagan'); await p.screenshot({ path: '/tmp/ma-sites.png' });
  await p.click('#m [data-paid]'); await p.waitForTimeout(900); ok((await p.locator('#m [data-paid]').count()) === 2, "to'lov tasdiqlandi (2 ta qoldi)");
  await p.click('nav [data-t=cust]'); await p.waitForSelector('#m .item', { timeout: 6000 }); ok((await p.locator('#m .item').count()) === 4, 'mijozlar (4)');
  await p.fill('#q', 'madina'); await p.waitForTimeout(200); ok((await p.locator('#m .item').count()) === 1, 'mijoz qidiruvi'); await p.screenshot({ path: '/tmp/ma-cust.png' });
  await p.click('nav [data-t=leads]'); await p.waitForTimeout(1200); ok(!(await p.locator('#m .err').count()), 'lidlar bo\'limi xatosiz ochiladi');
  // keshdan tez ochilish
  const p2t = Date.now(); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('#m .item, #m .empty, #m .seg', { timeout: 4000 }); ok(Date.now() - p2t < 1500, 'qayta ochilishda kesh tufayli tez (' + (Date.now() - p2t) + ' ms)');
  ok(p.errs.length === 0, 'JS xatolari yo\'q', p.errs); await p.context().close();
  // 2) admin emas
  p = await open(initFor(999, '1:a')); await p.waitForSelector('.err', { timeout: 6000 }); ok(/adminlar uchun/.test(await p.locator('.err').innerText()), 'admin emas: rad etiladi'); await p.context().close();
  // 3) brauzerda (Telegramsiz)
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.route('https://telegram.org/**', (r) => r.fulfill({ contentType: 'text/javascript', body: 'window.Telegram={WebApp:{initData:""}}' })); const pg = await ctx.newPage(); await pg.goto(base + '/app'); ok(/Telegram ichida/.test(await pg.locator('#m').innerText()), 'Telegramsiz: tushuntirish chiqadi'); await ctx.close(); }
  await b.close(); srv.close(); console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
