'use strict';
// Brauzerda: AI yordamchi, sotib olish, yuklab olish, joylash, kabinet va admin sozlamalarini sinaydi.
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-ui-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const PORT = 3900 + Math.floor(Math.random() * 90), BASE = `http://localhost:${PORT}`, ADMIN = 'ui-admin-1';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : String(x).slice(0, 160)); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}; try { j = await r.json(); } catch { /* ignore */ } return { s: r.status, j, r }; };
(async () => {
  const mock = http.createServer((req, res) => { req.resume(); req.on('end', () => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify({ template: 'salon', name: 'Lola Beauty', tagline: "Go'zallik sizniki", heroTitle: 'Soch emas, *kayfiyat* yaratamiz', heroText: 'Tajribali ustalar sizni kutmoqda.', about: "Biz *go'zallik* ustalarimiz.", services: [{ title: 'Soch turmagi', text: 'Zamonaviy', price: 150000 }], faq: [{ q: 'Bron kerakmi?', a: 'Ha, oldindan.' }] }) }] })); }); });
  await new Promise((r) => mock.listen(0, r));
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: ADMIN, ROOT_DOMAIN: 'example.test', PAYME_MERCHANT_ID: 'm1', PAYME_KEY: 'k1', ANTHROPIC_API_KEY: 'x', ANTHROPIC_BASE_URL: `http://localhost:${mock.address().port}` }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await new Promise((r) => setTimeout(r, 250)); }
  const b = await chromium.launch(); const errs = [];
  try {
    const ph = '+99890' + String(Math.floor(1e6 + Math.random() * 9e6));
    const reg = await J('/api/auth/register', { method: 'POST', body: { name: 'UI Mijoz', phone: ph, password: 'secret12' } });
    const al = await J('/api/admin/login', { method: 'POST', body: { password: ADMIN } }); const cookie = (al.r.headers.get('set-cookie') || '').split(';')[0];
    const page = await b.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|40[37]/.test(m.text())) errs.push(m.text().slice(0, 140)); });
    await page.addInitScript(([t, u]) => { try { localStorage.setItem('impro_tok', t); localStorage.setItem('impro_user', JSON.stringify(u)); sessionStorage.setItem('intro', '1'); } catch (e) { /* xato sahifasi */ } }, [reg.j.token, reg.j.user]);
    await page.goto(BASE + '/yaratish.html', { waitUntil: 'load' }); await page.waitForSelector('.tc');
    await page.locator('.tc').first().locator('button').first().click(); await page.waitForSelector('#tabs button', { timeout: 15000 }); await page.waitForTimeout(1500);
    console.log('Sotib olish');
    await page.click('#tabs button:has-text("Tayyor")'); await page.waitForTimeout(500);
    const panel = await page.innerText('#panel');
    ok(/\$10/.test(panel) && /128\s*000/.test(panel), "narx ko'rinadi: $10 (≈128 000 so'm)");
    ok(!(await page.$('[data-x="dl"]')), "to'lovsiz yuklab olish tugmasi yo'q");
    ok(await page.$('[data-x="buy"][data-m="payme"]') !== null, 'Payme tugmasi bor (sozlangan)');
    await page.route('https://checkout.paycom.uz/**', (r) => r.abort()); let payUrl = '';
    page.on('request', (r) => { if (r.url().startsWith('https://checkout.paycom.uz/')) payUrl = r.url(); });
    await page.click('[data-x="buy"][data-m="payme"]'); await page.waitForTimeout(1200);
    ok(/checkout\.paycom\.uz\//.test(payUrl) && /ac\.order_id=/.test(Buffer.from(payUrl.split('.uz/')[1] || '', 'base64').toString()), 'Payme to\'lov sahifasiga yo\'naltirildi', payUrl);
    await page.goto(BASE + '/yaratish.html', { waitUntil: 'load' });
    await page.waitForSelector('.pcard2 [data-open]'); await page.click('.pcard2 [data-open]'); await page.waitForSelector('#tabs button');
    await page.click('#tabs button:has-text("Tayyor")');
    await page.click('[data-x="buy"][data-m="manual"]'); await page.waitForSelector('[data-x="recheck"]', { timeout: 5000 }).catch(() => {});
    ok(await page.$('[data-x="recheck"]') !== null && /To'lov so'rovingiz qabul qilindi/.test(await page.innerText('#panel')), "qo'lda to'lov ko'rsatmasi chiqdi");
    const projects = await J('/api/admin/projects', { headers: { cookie } }); const pid = projects.j[0].id;
    await J(`/api/admin/projects/${pid}`, { method: 'PUT', headers: { cookie }, body: { paid: true } });
    await page.click('[data-x="recheck"]'); await page.waitForSelector('[data-x="dl"]', { timeout: 6000 }).catch(() => {});
    ok(await page.$('[data-x="dl"]') !== null, "admin tasdiqlagach yuklab olish ochildi");
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }).catch(() => null), page.click('[data-x="dl"]')]);
    let html = ''; if (dl) html = fs.readFileSync(await dl.path(), 'utf8');
    ok(dl && /<title>Lola Beauty<\/title>/.test(html) && /data:image\/jpeg;base64/.test(html), 'tayyor sayt (mustaqil .html) yuklab olindi', dl ? html.slice(0, 80) : 'download yo\'q');

    console.log('Joylash');
    await page.fill('#slug', 'lola-beauty'); await page.click('[data-x="pub"]'); await page.waitForSelector('a[href*="lola-beauty.example.test"]', { timeout: 6000 }).catch(() => {});
    ok(await page.$('a[href="https://lola-beauty.example.test"]') !== null, 'sayt subdomenda joylandi: lola-beauty.example.test');
    const site = await new Promise((res) => http.get({ host: 'localhost', port: PORT, path: '/', headers: { Host: 'lola-beauty.example.test' } }, (r) => { let t = ''; r.on('data', (c) => (t += c)); r.on('end', () => res({ s: r.statusCode, t })); }));
    ok(site.s === 200 && /Lola Beauty/.test(site.t), 'subdomen sahifasi ochiladi');
    await page.waitForTimeout(500);

    console.log('Kabinet');
    const kb = await b.newPage({ viewport: { width: 1200, height: 800 } }); kb.on('pageerror', (e) => errs.push('kabinet: ' + e.message));
    await kb.addInitScript(([t, u]) => { localStorage.setItem('impro_tok', t); localStorage.setItem('impro_user', JSON.stringify(u)); }, [reg.j.token, reg.j.user]);
    await kb.goto(BASE + '/kabinet.html', { waitUntil: 'load' }); await kb.waitForSelector('.cardk');
    const ktxt = await kb.innerText('#main');
    ok(/To'langan/.test(ktxt) && /lola-beauty\.example\.test/.test(ktxt), "kabinetda 'To'langan' va sayt manzili ko'rinadi");
    ok(await kb.$('button[data-t="leads"]') !== null, "'Sayt buyurtmalari' bo'limi bor");

    console.log('Admin');
    const ap = await b.newPage({ viewport: { width: 1440, height: 900 } }); ap.on('pageerror', (e) => errs.push('admin: ' + e.message));
    await ap.goto(BASE + '/admin', { waitUntil: 'load' }); await ap.fill('#pw', ADMIN); await ap.click('#lf button'); await ap.waitForSelector('#nav button');
    await ap.click('#nav button:has-text("Sozlamalar")'); await ap.waitForSelector('#pmid');
    ok(await ap.$('#cksec') !== null && await ap.$('#aikey') !== null && await ap.$('#sdom') !== null && await ap.$('#smp') !== null, "sozlamalarda Payme, Click, AI, domen maydonlari bor");
    await ap.fill('#smp', 'Karta: 8600 1111 2222 3333'); await ap.fill('#ckser', '777'); await ap.click('#saveSet'); await ap.waitForTimeout(800);
    const st = await J('/api/admin/settings', { headers: { cookie } });
    ok(st.j.manualPay === 'Karta: 8600 1111 2222 3333' && st.j.payments.click.serviceId === '777', 'sozlamalar admin paneldan saqlandi');
    await ap.click('#nav button:has-text("Narxlar")'); await ap.waitForSelector('#tpusd');
    await ap.fill('#tpusd', '15'); await ap.click('#savePlans'); await ap.waitForTimeout(800);
    ok((await J('/api/pricing')).j.templatePrice.usd === 15, 'shablon narxi admin paneldan o\'zgartirildi');
    await ap.click('#nav button:has-text("Mijoz saytlari")'); await ap.waitForSelector('.rowc');
    ok(/To'langan \$10/.test(await ap.innerText('#plist')) && /Joylangan: lola-beauty/.test(await ap.innerText('#plist')), "adminda 'To'langan' va 'Joylangan' belgilari ko'rinadi");
    await ap.click('#nav button:has-text("Boshqaruv")'); await ap.waitForSelector('.kpi');
    ok(/shablon sotuvlari/i.test(await ap.innerText('#pg')), 'boshqaruv panelida sotuvlar ko\'rsatkichi bor');
    ok(errs.length === 0, "konsolda xato yo'q" + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  } catch (e) { fail++; console.log('  XATO', e.stack || e.message); }
  await b.close(); srv.kill(); mock.close();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
