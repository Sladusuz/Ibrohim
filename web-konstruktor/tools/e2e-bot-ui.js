'use strict';
// Bot konstruktori va mini ilova interfeysini brauzerda sinaydi (Telegram soxta serveri bilan).
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-botui-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const SHOTS = process.env.SHOTS || os.tmpdir();
const PORT = 4500 + Math.floor(Math.random() * 300), BASE = `http://localhost:${PORT}`;
const TOKEN = '987654321:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw2';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : String(x).slice(0, 200)); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}; try { j = await r.json(); } catch { /* ignore */ } return { s: r.status, j }; };
(async () => {
  const mock = http.createServer((req, res) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { const m = /^\/bot([^/]+)\/(\w+)$/.exec(req.url); res.setHeader('content-type', 'application/json'); if (!m || m[1] !== TOKEN) return res.end(JSON.stringify({ ok: false, description: 'Unauthorized' })); res.end(JSON.stringify(m[2] === 'getMe' ? { ok: true, result: { id: 987654321, username: 'demo_shop_bot', first_name: 'Demo' } } : { ok: true, result: true })); }); });
  await new Promise((r) => mock.listen(0, r));
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: 'x-admin-1', TG_API_BASE: `http://localhost:${mock.address().port}`, PUBLIC_URL: 'https://example.test' }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await new Promise((r) => setTimeout(r, 250)); }
  const b = await chromium.launch(); const errs = [];
  try {
    const ph = '+99890' + String(Math.floor(1e6 + Math.random() * 9e6));
    const reg = await J('/api/auth/register', { method: 'POST', body: { name: 'UI Egasi', phone: ph, password: 'secret12' } });
    const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|40[0137]|telegram\.org/.test(m.text())) errs.push(m.text().slice(0, 140)); });
    await page.addInitScript(([t, u]) => { try { localStorage.setItem('impro_tok', t); localStorage.setItem('impro_user', JSON.stringify(u)); } catch (e) { /* */ } }, [reg.j.token, reg.j.user]);
    await page.goto(BASE + '/bot.html', { waitUntil: 'load' }); await page.waitForSelector('#newBot');
    await page.screenshot({ path: path.join(SHOTS, 'bot-1-list.png') });
    console.log('Ulash');
    await page.click('#newBot'); await page.fill('#tok', 'xato'); await page.click('#wgo'); await page.waitForTimeout(600);
    ok(/Token noto'g'ri/.test(await page.innerText('#wm')), "noto'g'ri token xabari ko'rsatiladi");
    await page.fill('#tok', TOKEN); await page.fill('#bn', "Demo do'kon"); await page.click('#wgo');
    await page.waitForSelector('#panel', { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(500);
    ok(/Bot serverga ulangan/.test(await page.innerText('#panel')) && /@demo_shop_bot/.test(await page.innerText('.side')), 'bot ulandi, muharrir ochildi');
    const claim = await page.getAttribute('#panel a[href*="start="]', 'href'); ok(/t\.me\/demo_shop_bot\?start=[a-f0-9]+/.test(claim || ''), 'egasi sifatida ulanish havolasi bor', claim);
    await page.screenshot({ path: path.join(SHOTS, 'bot-2-link.png') });
    console.log('Sozlash');
    await page.click('[data-t="main"]'); await page.fill('[data-p="welcome"]', 'Xush kelibsiz, Demo do\'konga!'); await page.fill('[data-p="contact.phone"]', '+998 90 111 22 33');
    ok(/Xush kelibsiz, Demo/.test(await page.innerText('.phone')), "jonli ko'rinishda salomlashuv yangilandi");
    await page.click('[data-t="menu"]'); await page.click('[data-add="buttons"]'); await page.fill('[data-p="buttons.2.text"]', '🎁 Aksiya'); await page.fill('[data-p="buttons.2.value"]', 'Bugun -20%');
    ok(/Aksiya/.test(await page.innerText('.phone')), "yangi menyu tugmasi ko'rinishda paydo bo'ldi");
    await page.click('[data-t="cat"]');
    for (const [n, name, price, cat] of [[0, 'Pitsa', 65000, 'Taomlar'], [1, 'Cola', 9000, 'Ichimliklar']]) {
      await page.click('[data-add="products"]'); await page.fill(`[data-p="products.${n}.name"]`, name); await page.fill(`[data-p="products.${n}.price"]`, String(price)); await page.fill(`[data-p="products.${n}.category"]`, cat);
    }
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64'); fs.writeFileSync(path.join(SHOTS, 'p.png'), png);
    await page.setInputFiles('[data-up="0"]', path.join(SHOTS, 'p.png')); await page.waitForTimeout(1200);
    ok(/uploads\//.test(await page.getAttribute('.pimg', 'style') || ''), 'mahsulot rasmi yuklandi');
    await page.click('[data-t="app"]'); await page.click('label.sw:has-text("Mini ilovani yoqish")'); await page.waitForTimeout(300);
    ok(await page.$('.phone iframe') !== null, "mini ilova yoqilganda jonli ko'rinish paydo bo'ldi");
    await page.click('[data-a="save"]'); await page.waitForTimeout(1200);
    const bots = await J('/api/my/bots', { headers: { authorization: 'Bearer ' + reg.j.token } }); const cfg = bots.j[0].config;
    ok(cfg.welcome.startsWith('Xush kelibsiz') && cfg.buttons.length === 3 && cfg.products.length === 2 && cfg.products[0].name === 'Pitsa' && cfg.products[0].price === 65000 && cfg.miniApp.enabled && /uploads/.test(cfg.products[0].image), 'hamma o\'zgarishlar serverda saqlandi', JSON.stringify(cfg).slice(0, 160));
    await page.click('[data-t="rep"]'); await page.click('[data-add="replies"]'); await page.fill('[data-p="replies.0.keyword"]', 'narx'); await page.fill('[data-p="replies.0.answer"]', 'Menyuda'); await page.click('[data-a="save"]'); await page.waitForTimeout(900);
    ok((await J('/api/my/bots', { headers: { authorization: 'Bearer ' + reg.j.token } })).j[0].config.replies.length === 1, 'avto-javob saqlandi');
    await page.click('[data-t="msg"]'); await page.waitForTimeout(600); ok(/obunachi/i.test(await page.innerText('#panel')), 'xabar yuborish bo\'limi');
    await page.screenshot({ path: path.join(SHOTS, 'bot-3-editor.png') });
    await page.click('[data-t="cat"]'); await page.screenshot({ path: path.join(SHOTS, 'bot-4-catalog.png') });

    console.log('Mini ilova');
    const id = bots.j[0].id; const mp = await b.newPage({ viewport: { width: 390, height: 780 } });
    mp.on('pageerror', (e) => errs.push('mini: ' + e.message));
    await mp.goto(`${BASE}/app/${id}?preview=1`, { waitUntil: 'load' }); await mp.waitForSelector('.pc', { timeout: 8000 });
    ok((await mp.$$('.pc')).length === 2 && /Pitsa/.test(await mp.innerText('body')) && /65\s000/.test(await mp.innerText('body')), 'mahsulotlar va narxlar ko\'rinadi');
    await mp.screenshot({ path: path.join(SHOTS, 'bot-5-miniapp.png') });
    await mp.click('.pc:has-text("Pitsa") .add'); await mp.click('.pc:has-text("Pitsa") [data-p]'); await mp.click('.pc:has-text("Cola") .add');
    ok(/Savat · 3 ta/.test(await mp.innerText('.bar')) && /139\s000/.test(await mp.innerText('.bar')), 'savat paneli: 3 ta, 139 000');
    await mp.click('[data-cart]'); await mp.waitForSelector('.sh'); await mp.fill('#fn', 'Test Mijoz'); await mp.fill('#fp', '+998901112233'); await mp.screenshot({ path: path.join(SHOTS, 'bot-6-cart.png') });
    await mp.click('#send'); await mp.waitForTimeout(700);
    ok(/Telegram ichida oching/.test(await mp.innerText('#err')), 'Telegramsiz buyurtma berilmaydi (xavfsizlik)');
    await mp.click('.sh [data-m]'); await mp.waitForTimeout(200);
    ok(await mp.$('.sh') !== null, 'savatda miqdor o\'zgartirish ishlaydi');
    const dark = await b.newPage({ viewport: { width: 390, height: 780 }, colorScheme: 'dark' }); await dark.goto(`${BASE}/app/${id}?preview=1`); await dark.waitForSelector('.pc');
    ok(await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "mobil ekranda gorizontal scroll yo'q");
    console.log('Admin');
    const ap = await b.newPage({ viewport: { width: 1440, height: 900 } }); ap.on('pageerror', (e) => errs.push('admin: ' + e.message));
    await ap.goto(BASE + '/admin', { waitUntil: 'load' }); await ap.fill('#pw', 'x-admin-1'); await ap.click('#lf button'); await ap.waitForSelector('#nav button');
    await ap.click('#nav button:has-text("Telegram botlar")'); await ap.waitForSelector('.tbl');
    ok(/demo_shop_bot/.test(await ap.innerText('#pg')) && /Ishlayapti/.test(await ap.innerText('#pg')), "adminda bot ko'rinadi");
    ok(errs.length === 0, "konsolda xato yo'q" + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  } catch (e) { fail++; console.log('  XATO', e.stack || e.message); }
  await b.close(); srv.kill(); mock.close();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
