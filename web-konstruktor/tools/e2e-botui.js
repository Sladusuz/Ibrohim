'use strict';
// bot.html: telefonda bot yaratish, narx va to'lov bloki. Worker (D1/SQLite) + docs/ bitta mahalliy serverda.
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 240)); } };
(async () => {
  require('./build-worker.js');
  const W = (await import(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs') + '?t=' + Date.now())).default; const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, o) => { const m = /bot([^/]+)\/(\w+)$/.exec(String(url)); if (m) return new Response(JSON.stringify({ ok: true, result: m[2] === 'getMe' ? { username: 'demo_shop_bot', first_name: 'Demo' } : true })); return realFetch(url, o); };
  const { DatabaseSync } = require('node:sqlite'), sdb = new DatabaseSync(':memory:');
  const env = { TG_TOKEN: '1:a', WEBHOOK_SECRET: 'whsec_abcdefghijklmnop', TG_CHAT: '7', ADMIN_PASSWORD: 'x', CARD_INFO: '9860 1201 0441 7221', DB: { prepare(sql) { const s = sdb.prepare(sql); let a = []; const o = { bind(...x) { a = x; return o; }, async first() { return s.get(...a) || null; }, async all() { return { results: s.all(...a) }; }, async run() { s.run(...a); return {}; } }; return o; } } };
  const ROOT = path.join(__dirname, '..', 'docs'), MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
  const srv = http.createServer(async (q, r) => {
    const chunks = []; for await (const c of q) chunks.push(c); const pth = q.url.split('?')[0];
    if (pth.startsWith('/api/') || /^\/app(\/|$)/.test(pth) || pth.startsWith('/uploads/')) { const res = await W.fetch(new Request('http://localhost:' + srv.address().port + q.url, { method: q.method, headers: q.headers, body: ['GET', 'HEAD'].includes(q.method) ? undefined : Buffer.concat(chunks) }), env, { waitUntil() {} }); r.writeHead(res.status, Object.fromEntries(res.headers)); return r.end(Buffer.from(await res.arrayBuffer())); }
    let f = decodeURIComponent(pth); if (f.endsWith('/')) f += 'index.html'; f = path.join(ROOT, f); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise((r) => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route('**/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: `window.__API__='${base}';window.__RELAY__='';` }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + '/bot.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  await p.getByText("Ro'yxatdan o'tish", { exact: true }).first().click(); await p.waitForTimeout(400);
  await p.fill('input[name=name]', 'Bot Egasi'); await p.fill('input[name=phone]', '+998901112299'); await p.fill('input[name=password]', 'secret12'); await p.locator('form button[type=submit], form .b').last().click(); await p.waitForTimeout(2000);
  ok(/Narx: oddiy bot \$15/.test(await p.locator('body').innerText()), "bosh sahifada narx yozilgan (oddiy $15, katalog +$20, mini ilova +$20)");
  await p.click('#newBot, #newBot2'); await p.fill('#tok', '111222333:TESTtokenTESTtokenTESTtokenTEST12'); await p.fill('#bn', 'Demo Shop'); await p.click('#wgo'); await p.waitForSelector('#panel', { timeout: 8000 });
  const txt = await p.locator('#panel').innerText(); ok(/Narx va to'lov/i.test(txt) && /\$15/.test(txt) && /Asosiy bot/.test(txt), "bot yaratilgach narx va to'lov bloki chiqadi ($15)");
  ok(await p.locator('[data-a=botbuy][data-m=manual]').count() === 1, "to'lov tugmasi bor");
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "telefonda gorizontal siljish yo'q"); await p.screenshot({ path: '/tmp/botui-1.png' });
  await p.click('[data-a=botbuy][data-m=manual]'); await p.waitForTimeout(1200); const t2 = await p.locator('#panel').innerText(); ok(/9860 1201 0441 7221/.test(t2) && /So'rovingiz qabul qilindi/.test(t2), "kartaga o'tkazma ma'lumoti chiqdi"); await p.screenshot({ path: '/tmp/botui-2.png' });
  ok(errs.length === 0, 'JS xato yo\'q', errs); await b.close(); srv.close(); console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
