'use strict';
// Saytdagi jonli chat oynasini sinaydi (brauzer, soxta Worker bilan): ochish, yuborish, javob, operator javobi, tarjima, mobil.
const http = require('http'), fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const DOCS = path.join(__dirname, '..', 'docs'), MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 200)); } };
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(DOCS, p); if (!f.startsWith(DOCS) || !fs.existsSync(f)) { r.statusCode = 404; return r.end('no'); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
  await new Promise((r) => srv.listen(0, r)); const BASE = `http://localhost:${srv.address().port}`;
  const b = await chromium.launch();
  for (const [lang, url, want] of [['uz', '/', { ph: /Savolingizni yozing/, hello: /Salom! Men Impro IT/ }], ['ru', '/ru/', { ph: /Напишите ваш вопрос/, hello: /Здравствуйте! Я помощник/ }]]) {
    console.log('Chat:', lang);
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = [], posts = []; let outbox = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.route('https://impro-bot.impro-6c9a2d.workers.dev/**', async (r) => {
      const req = r.request(), h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
      if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: h });
      if (req.method() === 'POST') { const j = JSON.parse(req.postData()); posts.push(j); return r.fulfill({ status: 200, headers: h, body: JSON.stringify({ ok: true, reply: 'Test javob: ' + j.text }) }); }
      const m = outbox; outbox = []; return r.fulfill({ status: 200, headers: h, body: JSON.stringify({ msgs: m }) });
    });
    await p.addInitScript(() => { sessionStorage.setItem('intro', '1'); window.__CHAT_POLL__ = 400; });
    await p.goto(BASE + url); await p.waitForSelector('.fb-b.chatb', { timeout: 8000 });
    ok(true, 'chat tugmasi suzuvchi tugmalar orasida ko\'rinadi');
    await p.click('.fb-b.chatb'); await p.waitForSelector('#chatw:not([hidden])');
    ok(want.hello.test(await p.innerText('#chatw .cw-m')), 'salomlashuv matni (' + lang + ')');
    ok(want.ph.test(await p.getAttribute('#chatw input', 'placeholder')), "yozuv joyi tilga mos (" + lang + ')');
    await p.fill('#chatw input', 'Narx qancha?'); await p.press('#chatw input', 'Enter');
    await p.waitForFunction(() => /Test javob: Narx qancha\?/.test(document.querySelector('#chatw .cw-m').innerText), null, { timeout: 5000 }).catch(() => {});
    ok(/Test javob: Narx qancha\?/.test(await p.innerText('#chatw .cw-m')) && posts.length === 1 && /^[A-Za-z0-9]{16,40}$/.test(posts[0].sid), 'xabar yuborildi, bot javobi ko\'rindi, sid to\'g\'ri');
    ok(await p.evaluate(() => /^[A-Za-z0-9]{16,40}$/.test(localStorage.getItem('impro_chat') || '')), 'sid brauzerda saqlanadi');
    outbox = ['Operator: salom, hozir bog\'lanaman'];
    await p.waitForFunction(() => /Operator: salom/.test(document.querySelector('#chatw .cw-m').innerText), null, { timeout: 5000 }).catch(() => {});
    ok(/Operator: salom/.test(await p.innerText('#chatw .cw-m')), 'operator javobi o\'zi chiqadi (so\'rov orqali)');
    await p.fill('#chatw input', '<b>x</b>'); await p.press('#chatw input', 'Enter'); await p.waitForTimeout(400);
    ok(!(await p.$('#chatw .cw-m b')), 'xabar matn sifatida ko\'rsatiladi (HTML ishlamaydi)');
    await p.click('#chatw .cw-x'); ok(await p.$eval('#chatw', (e) => e.hidden), 'yopiladi');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), "gorizontal siljish yo'q");
    ok(errs.length === 0, "konsolda xato yo'q", errs);
    await p.setViewportSize({ width: 390, height: 780 }); await p.click('.fb-b.chatb'); await p.waitForSelector('#chatw:not([hidden])');
    const bb = await p.$eval('#chatw', (e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, w: innerWidth }; });
    ok(bb.l >= 0 && bb.r <= bb.w, 'telefonda chat oynasi ekranga sig\'adi');
    await p.screenshot({ path: path.join(process.env.SHOT_DIR || require('os').tmpdir(), `chat-${lang}-m.png`) });
    await p.close();
  }
  await b.close(); srv.close();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
