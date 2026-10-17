'use strict';
// Sotuv, joylash (subdomen), statistika, to'lov (Payme/Click) va AI yordamchini sinaydi (brauzersiz, tez).
// Ishga tushirish: node tools/e2e-features.js
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-feat-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const PORT = 3600 + Math.floor(Math.random() * 300), BASE = `http://localhost:${PORT}`;
const ADMIN = 'adm-pass-1', PAYME_KEY = 'payme-secret', CLICK = { serviceId: '1111', merchantId: '2222', secretKey: 'click-secret' };
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, extra === undefined ? '' : JSON.stringify(extra).slice(0, 200)); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}, t = ''; try { t = await r.text(); j = JSON.parse(t); } catch { /* html */ } return { s: r.status, j, t, r }; };
const onHost = (host, p, { method = 'GET', body, headers = {} } = {}) => new Promise((resolve, reject) => {
  const req = http.request({ host: 'localhost', port: PORT, path: p, method, headers: { Host: host, ...(body ? { 'content-type': 'application/json' } : {}), ...headers } }, (res) => { let t = ''; res.on('data', (c) => (t += c)); res.on('end', () => resolve({ s: res.statusCode, t, h: res.headers })); });
  req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end();
});
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');

(async () => {
  // AI uchun soxta Anthropic serveri
  const mock = http.createServer((req, res) => {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ content: [{ type: 'text', text: 'Mana javob:\n' + JSON.stringify({ template: 'salon', name: 'Lola Beauty', tagline: 'Go\'zallik sizniki', heroTitle: 'Soch emas, *kayfiyat* yaratamiz', heroText: 'Tajribali ustalar.', about: 'Biz *go\'zallik* ustalarimiz.', services: [{ title: 'Soch turmagi', text: 'Zamonaviy', price: '150 000' }, { title: 'Manikyur', text: 'Gel lak', price: 90000 }], faq: [{ q: 'Bron kerakmi?', a: 'Ha' }], phone: '+998 90 111 22 33', address: 'Toshkent' }) + '\nTugadi' }] }));
    });
  });
  await new Promise((r) => mock.listen(0, r)); const MOCK = `http://localhost:${mock.address().port}`;
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: ADMIN, ROOT_DOMAIN: 'example.test', PAYME_MERCHANT_ID: 'merchant1', PAYME_KEY, CLICK_SERVICE_ID: CLICK.serviceId, CLICK_MERCHANT_ID: CLICK.merchantId, CLICK_SECRET_KEY: CLICK.secretKey, ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_BASE_URL: MOCK }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await new Promise((r) => setTimeout(r, 250)); }
  try {
    const ph = '+99890' + String(Math.floor(1e6 + Math.random() * 9e6));
    const reg = await J('/api/auth/register', { method: 'POST', body: { name: 'Sotuvchi Test', phone: ph, password: 'secret12' } });
    const auth = { authorization: 'Bearer ' + reg.j.token };
    const al = await J('/api/admin/login', { method: 'POST', body: { password: ADMIN } });
    const cookie = (al.r.headers.get('set-cookie') || '').split(';')[0];
    const tpl = { v: 2, company: { name: 'Sinov Salon', logo: 'S' }, theme: { preset: 'rose', look: 'luxe' }, nav: {}, orders: { enabled: true, currency: "so'm" }, sections: [{ id: 'bosh', type: 'hero', enabled: true, layout: 'aurora', titleStart: 'Salom *dunyo*', text: 'Tavsif', image: '/img/p/salon-1.jpg', cta1Text: 'Bron', cta1Link: '#' }, { id: 'katalog', type: 'products', enabled: true, mode: 'cart', title: 'Katalog', items: [{ id: 'a1', name: 'Mahsulot', price: 50000, active: true }] }] };
    const cp = await J('/api/my/projects', { method: 'POST', headers: auth, body: { name: 'Sinov Salon', template: 'salon', data: tpl } });
    const pid = cp.j.project && cp.j.project.id; ok(!!pid, 'loyiha yaratildi');

    console.log('Narx va sotuv');
    const pr = await J('/api/pricing');
    ok(pr.j.templatePrice && pr.j.templatePrice.usd === 10, 'shablon narxi $10', pr.j.templatePrice);
    ok(pr.j.payMethods && pr.j.payMethods.payme && pr.j.payMethods.click, "to'lov usullari yoqilgan");
    ok((await J(`/api/my/projects/${pid}/export`, { headers: auth })).s === 402, "to'lovsiz yuklab olish rad etiladi");
    ok((await J(`/api/my/projects/${pid}/publish`, { method: 'POST', headers: auth, body: { slug: 'sinov-salon' } })).s === 402, "to'lovsiz joylash rad etiladi");
    ok((await J(`/api/my/projects/${pid}/export`)).s === 401, 'kirishsiz export rad etiladi');
    const manual = await J(`/api/my/projects/${pid}/checkout`, { method: 'POST', headers: auth, body: { method: 'manual' } });
    ok(manual.j.manual && manual.j.payment && manual.j.payment.usd === 10 && manual.j.payment.uzs === 128000, "qo'lda to'lov so'rovi (10$ = 128 000 so'm)", manual.j);
    const pays = await J('/api/admin/payments', { headers: { cookie } });
    ok(Array.isArray(pays.j) && pays.j.some((x) => x.projectId === pid && x.state === 'pending'), "adminda to'lov kutilmoqda");
    const paid = await J(`/api/admin/projects/${pid}`, { method: 'PUT', headers: { cookie }, body: { paid: true } });
    ok(paid.j.project && paid.j.project.paid, "admin to'lovni tasdiqladi");
    const ex = await J(`/api/my/projects/${pid}/export`, { headers: auth });
    ok(ex.s === 200 && /<title>Sinov Salon<\/title>/.test(ex.t) && /data:image\/jpeg;base64/.test(ex.t) && !/\/img\/p\/salon-1\.jpg/.test(ex.t), 'yuklab olingan HTML mustaqil (rasmlar ichiga joylangan)');

    console.log('Joylash (subdomen)');
    ok((await J(`/api/my/projects/${pid}/publish`, { method: 'POST', headers: auth, body: { slug: 'www' } })).s === 400, 'zahiradagi manzil rad etiladi');
    ok((await J(`/api/my/projects/${pid}/publish`, { method: 'POST', headers: auth, body: { slug: 'A_B' } })).s === 400, "noto'g'ri manzil rad etiladi");
    const pub = await J(`/api/my/projects/${pid}/publish`, { method: 'POST', headers: auth, body: { slug: 'sinov-salon' } });
    ok(pub.s === 200 && pub.j.project.url === 'https://sinov-salon.example.test', 'joylandi: ' + (pub.j.project || {}).url, pub.j);
    const reg2 = await J('/api/auth/register', { method: 'POST', body: { name: 'Boshqa', phone: '+99891' + String(Math.floor(1e6 + Math.random() * 9e6)), password: 'secret12' } });
    const cp2 = await J('/api/my/projects', { method: 'POST', headers: { authorization: 'Bearer ' + reg2.j.token }, body: { name: 'X', data: tpl } });
    await J(`/api/admin/projects/${cp2.j.project.id}`, { method: 'PUT', headers: { cookie }, body: { paid: true } });
    ok((await J(`/api/my/projects/${cp2.j.project.id}/publish`, { method: 'POST', headers: { authorization: 'Bearer ' + reg2.j.token }, body: { slug: 'sinov-salon' } })).s === 409, 'band manzil rad etiladi');
    const page = await onHost('sinov-salon.example.test', '/');
    ok(page.s === 200 && /<title>Sinov Salon<\/title>/.test(page.t) && /og:title/.test(page.t) && /manifest\.webmanifest/.test(page.t) && /__TENANT__/.test(page.t), 'subdomen sahifasi (SEO, PWA teglari bilan)');
    ok(page.t.includes('Salom *dunyo*') || page.t.includes('Salom'), "sayt ma'lumoti sahifada");
    const mf = await onHost('sinov-salon.example.test', '/manifest.webmanifest'); ok(mf.s === 200 && JSON.parse(mf.t).name === 'Sinov Salon', 'PWA manifest');
    ok((await onHost('sinov-salon.example.test', '/icon.svg')).s === 200 && (await onHost('sinov-salon.example.test', '/sw.js')).s === 200, 'PWA ikonka va service worker');
    ok(/Sitemap/.test((await onHost('sinov-salon.example.test', '/robots.txt')).t) && /<loc>/.test((await onHost('sinov-salon.example.test', '/sitemap.xml')).t), 'robots.txt va sitemap.xml');
    ok((await onHost('sinov-salon.example.test', '/admin')).s === 404 && (await onHost('sinov-salon.example.test', '/api/admin/orders')).s === 404, 'subdomenda admin yopiq');
    ok((await onHost('yoq-sayt.example.test', '/')).s === 404, "mavjud bo'lmagan subdomen 404");
    const img = await onHost('sinov-salon.example.test', '/img/p/salon-1.jpg'); ok(img.s === 200, 'rasm subdomendan beriladi');
    const mainPage = await onHost('example.test', '/'); ok(mainPage.s === 200 && !/__TENANT__/.test(mainPage.t), 'asosiy domen asosiy saytni beradi');

    console.log('Tenant buyurtmalari va statistika');
    const o = await onHost('sinov-salon.example.test', '/api/order', { method: 'POST', body: { type: 'order', name: 'Xaridor', phone: '+998901112233', items: [{ id: 'a1', name: 'Soxta', price: 1, qty: 2 }], shipping: 0 } });
    ok(o.s === 200 && JSON.parse(o.t).ok, 'subdomendan buyurtma qabul qilindi');
    const leads = await J('/api/my/leads', { headers: auth });
    ok(Array.isArray(leads.j) && leads.j.length === 1 && leads.j[0].total === 100000, 'egasi buyurtmani ko\'radi, narx server tomonidan tekshirildi (50 000 x 2)', leads.j);
    ok((await J('/api/my/leads', { headers: { authorization: 'Bearer ' + reg2.j.token } })).j.length === 0, "boshqa mijoz ko'ra olmaydi");
    const adminOrders = await J('/api/admin/orders', { headers: { cookie } });
    ok(Array.isArray(adminOrders.j) && !adminOrders.j.some((x) => x.tenant), 'tenant buyurtmalari asosiy admin ro\'yxatiga aralashmaydi');
    const st = await J(`/api/my/projects/${pid}/stats`, { headers: auth });
    ok(st.j.views >= 1 && st.j.orders === 1 && st.j.series.length === 30, 'statistika: tashrif va buyurtma', { v: st.j.views, o: st.j.orders });
    const bad = await onHost('sinov-salon.example.test', '/api/order', { method: 'POST', body: { type: 'order', name: 'A', phone: '1' } }); ok(bad.s === 400, 'noto\'g\'ri buyurtma rad etiladi');

    console.log("O'z domeni va Caddy 'ask'");
    const dm = await J(`/api/my/projects/${pid}/domain`, { method: 'POST', headers: auth, body: { domain: 'https://www.salonim.uz/' } });
    ok(dm.s === 200 && dm.j.project.customDomain === 'www.salonim.uz', "o'z domeni saqlandi");
    ok((await onHost('www.salonim.uz', '/')).s === 200, "o'z domenidan sayt ochiladi");
    ok((await J(`/api/my/projects/${pid}/domain`, { method: 'POST', headers: auth, body: { domain: 'sub.example.test' } })).s === 400, "asosiy domen o'z domeni sifatida rad etiladi");
    const ask = (d) => fetch(`${BASE}/_ask?domain=${encodeURIComponent(d)}`).then((r) => r.status);
    ok(await ask('sinov-salon.example.test') === 200 && await ask('www.salonim.uz') === 200 && await ask('example.test') === 200, "'ask': bizning domenlarga sertifikat beriladi");
    ok(await ask('yoq.example.test') === 404 && await ask('hacker.com') === 404, "'ask': begona domenlarga berilmaydi");

    console.log("Payme");
    const p2 = await J('/api/my/projects', { method: 'POST', headers: auth, body: { name: 'Payme sinov', data: tpl } });
    const pid2 = p2.j.project.id;
    const co = await J(`/api/my/projects/${pid2}/checkout`, { method: 'POST', headers: auth, body: { method: 'payme' } });
    const decoded = Buffer.from((co.j.payUrl || '').replace('https://checkout.paycom.uz/', ''), 'base64').toString();
    const orderId = co.j.payment && co.j.payment.id;
    ok(/^m=merchant1;ac\.order_id=[a-f0-9]+;a=12800000;/.test(decoded), 'Payme to\'lov havolasi (128 000 so\'m = 12 800 000 tiyin)', decoded);
    const rpc = (method, params, key = PAYME_KEY) => J('/api/pay/payme', { method: 'POST', headers: { authorization: 'Basic ' + Buffer.from('Paycom:' + key).toString('base64') }, body: { id: 1, method, params } });
    ok((await rpc('CheckPerformTransaction', {}, 'xato')).j.error.code === -32504, 'Payme: noto\'g\'ri kalit rad etiladi');
    ok((await rpc('CheckPerformTransaction', { amount: 1, account: { order_id: orderId } })).j.error.code === -31001, "Payme: noto'g'ri summa -31001");
    ok((await rpc('CheckPerformTransaction', { amount: 12800000, account: { order_id: 'yoq' } })).j.error.code === -31050, 'Payme: buyurtma topilmadi -31050');
    ok((await rpc('CheckPerformTransaction', { amount: 12800000, account: { order_id: orderId } })).j.result.allow === true, 'Payme: CheckPerformTransaction');
    const ct = await rpc('CreateTransaction', { id: 'tx1', time: Date.now(), amount: 12800000, account: { order_id: orderId } });
    ok(ct.j.result && ct.j.result.state === 1 && ct.j.result.transaction === orderId, 'Payme: CreateTransaction');
    ok((await rpc('CreateTransaction', { id: 'tx1', time: Date.now(), amount: 12800000, account: { order_id: orderId } })).j.result.state === 1, 'Payme: CreateTransaction takror (idempotent)');
    ok((await rpc('CreateTransaction', { id: 'tx2', time: Date.now(), amount: 12800000, account: { order_id: orderId } })).j.error.code === -31008, 'Payme: ikkinchi tranzaksiya rad etiladi');
    ok((await rpc('PerformTransaction', { id: 'tx1' })).j.result.state === 2, 'Payme: PerformTransaction');
    ok((await J(`/api/my/projects/${pid2}`, { headers: auth })).j.project.paid, "Payme: loyiha 'to'langan' bo'ldi");
    ok((await rpc('CheckTransaction', { id: 'tx1' })).j.result.state === 2, 'Payme: CheckTransaction');
    ok((await rpc('GetStatement', { from: 0, to: Date.now() + 1000 })).j.result.transactions.length >= 1, 'Payme: GetStatement');
    ok((await rpc('CancelTransaction', { id: 'tx1', reason: 5 })).j.result.state === -2, 'Payme: qaytarish (-2)');
    ok(!(await J(`/api/my/projects/${pid2}`, { headers: auth })).j.project.paid, "Payme: qaytarilgach 'to'langan' bekor bo'ldi");
    ok((await rpc('Yoq', {})).j.error.code === -32601, 'Payme: noma\'lum metod');

    console.log('Click');
    const p3 = await J('/api/my/projects', { method: 'POST', headers: auth, body: { name: 'Click sinov', data: tpl } });
    const pid3 = p3.j.project.id;
    const cc = await J(`/api/my/projects/${pid3}/checkout`, { method: 'POST', headers: auth, body: { method: 'click' } });
    const oid = cc.j.payment.id;
    ok(/my\.click\.uz\/services\/pay\?service_id=1111&merchant_id=2222&amount=128000&transaction_param=/.test(cc.j.payUrl), 'Click to\'lov havolasi', cc.j.payUrl);
    const sp = (extra) => { const f = { click_trans_id: '555', service_id: CLICK.serviceId, click_paydoc_id: '777', merchant_trans_id: oid, amount: '128000', action: '0', error: '0', error_note: 'Success', sign_time: '2026-10-17 12:00:00', ...extra }; const base = `${f.click_trans_id}${f.service_id}${CLICK.secretKey}${f.merchant_trans_id}`; f.sign_string = f.sign_string || (f.action === '1' ? md5(`${base}${f.merchant_prepare_id}${f.amount}${f.action}${f.sign_time}`) : md5(`${base}${f.amount}${f.action}${f.sign_time}`)); return f; };
    const post = (f) => fetch(BASE + '/api/pay/click', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(f).toString() }).then((r) => r.json());
    ok((await post(sp({ sign_string: 'x'.repeat(32) }))).error === -1, "Click: noto'g'ri imzo -1");
    ok((await post(sp({ amount: '1' }))).error === -2, "Click: noto'g'ri summa -2");
    ok((await post(sp({ merchant_trans_id: 'yoq' }))).error === -5, 'Click: buyurtma topilmadi -5');
    const prep = await post(sp({})); ok(prep.error === 0 && prep.merchant_prepare_id === oid, 'Click: Prepare');
    ok((await post(sp({ action: '1', merchant_prepare_id: 'noto\'g\'ri' }))).error === -6, 'Click: Complete (prepare id mos emas) -6');
    const comp = await post(sp({ action: '1', merchant_prepare_id: oid })); ok(comp.error === 0, 'Click: Complete');
    ok((await J(`/api/my/projects/${pid3}`, { headers: auth })).j.project.paid, "Click: loyiha 'to'langan' bo'ldi");
    ok((await post(sp({ action: '1', merchant_prepare_id: oid }))).error === -4, 'Click: takror to\'lov -4');

    console.log('AI yordamchi');
    const templates = [{ id: 'salon', name: "Go'zallik saloni", cat: 'Go\'zallik', tags: ['salon', 'soch'] }, { id: 'kompaniya', name: 'IT kompaniya', cat: 'Biznes', tags: ['it'] }];
    ok((await J('/api/ai/generate', { method: 'POST', body: { description: 'Chilonzorda salon', templates } })).s === 401, 'AI: kirishsiz rad etiladi');
    ok((await J('/api/ai/generate', { method: 'POST', headers: auth, body: { description: 'qisqa', templates } })).s === 400, 'AI: juda qisqa tavsif rad etiladi');
    const g = await J('/api/ai/generate', { method: 'POST', headers: auth, body: { description: "Chilonzorda go'zallik saloni, 5 ta usta, soch va manikyur", templates } });
    ok(g.j.ok && g.j.ai === true && g.j.result.template === 'salon' && g.j.result.name === 'Lola Beauty' && g.j.result.services.length === 2 && g.j.result.services[0].price === 150000 && g.j.result.faq.length === 1, 'AI: Claude javobi tozalanib qaytdi', g.j);
    const g2 = await J('/api/ai/generate', { method: 'POST', headers: auth, body: { description: "Dasturlash va IT kompaniya ochmoqchiman, \"Nexora\" nomli", templates: [templates[1], templates[0]] } });
    ok(g2.j.ok && g2.j.result.template && g2.j.ai === true, 'AI: ishlaydi');

    console.log('Sozlamalar');
    const set = await J('/api/admin/settings', { method: 'GET', headers: { cookie } });
    ok(set.j.ai.hasKey && set.j.payments.payme.hasKey && set.j.payments.click.hasSecret && !JSON.stringify(set.j).includes(PAYME_KEY) && !JSON.stringify(set.j).includes(CLICK.secretKey), 'sozlamalarda kalitlar yashirin (faqat bor/yo\'q)');
    const sv = await J('/api/admin/settings', { method: 'PUT', headers: { cookie }, body: { notify: {}, allowedOrigins: [], domains: ['mening-domenim.uz'], manualPay: 'Karta: 8600 0000 0000 0000', ai: { key: 'sk-xyz', model: '' }, payments: { payme: { merchantId: 'mm', key: '' }, click: { serviceId: '1', merchantId: '2', secretKey: '' } } } });
    ok(sv.j.ok, 'sozlamalar saqlandi');
    const set2 = await J('/api/admin/settings', { headers: { cookie } });
    ok(set2.j.domains[0] === 'mening-domenim.uz' && set2.j.manualPay.startsWith('Karta') && set2.j.payments.payme.merchantId === 'mm', 'sozlamalar qayta o\'qildi');
    const pr2 = await J('/api/admin/pricing', { method: 'PUT', headers: { cookie }, body: { currency: "so'm", plans: [], templatePrice: { usd: 12, rate: 13000 } } });
    ok(pr2.j.ok && (await J('/api/pricing')).j.templatePrice.usd === 12, 'shablon narxini admin o\'zgartira oladi');
  } catch (e) { fail++; console.log('  XATO', e.stack || e.message); }
  srv.kill(); mock.close();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
