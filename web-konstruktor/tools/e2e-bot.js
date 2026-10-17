'use strict';
// Telegram bot konstruktorini sinaydi: ulash, webhook, menyu, katalog, savat, buyurtma, avto-javob, xabar yuborish, mini ilova.
// Telegram o'rniga soxta (mock) server ishlatiladi.
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-bot-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const PORT = 4100 + Math.floor(Math.random() * 300), BASE = `http://localhost:${PORT}`;
const TOKEN = '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw1';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 220)); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}; try { j = await r.json(); } catch { /* ignore */ } return { s: r.status, j, r }; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const calls = []; // mock Telegram
  const mock = http.createServer((req, res) => {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      const m = /^\/bot([^/]+)\/(\w+)$/.exec(req.url); let body = {}; try { body = JSON.parse(b || '{}'); } catch { /* ignore */ }
      res.setHeader('content-type', 'application/json');
      if (!m || m[1] !== TOKEN) return res.end(JSON.stringify({ ok: false, description: 'Unauthorized' }));
      calls.push({ method: m[2], body });
      if (m[2] === 'getMe') return res.end(JSON.stringify({ ok: true, result: { id: 123456789, username: 'baraka_test_bot', first_name: 'Baraka' } }));
      res.end(JSON.stringify({ ok: true, result: true }));
    });
  });
  await new Promise((r) => mock.listen(0, r));
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: 'adm-bot-1', TG_API_BASE: `http://localhost:${mock.address().port}`, PUBLIC_URL: 'https://example.test' }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await wait(250); }
  const sent = (method, f) => calls.filter((c) => c.method === method && (!f || f(c.body)));
  try {
    const ph = '+99890' + String(Math.floor(1e6 + Math.random() * 9e6));
    const reg = await J('/api/auth/register', { method: 'POST', body: { name: 'Bot Egasi', phone: ph, password: 'secret12' } });
    const auth = { authorization: 'Bearer ' + reg.j.token };
    const al = await J('/api/admin/login', { method: 'POST', body: { password: 'adm-bot-1' } }); const cookie = (al.r.headers.get('set-cookie') || '').split(';')[0];

    console.log('Ulash');
    ok((await J('/api/my/bots', { method: 'POST' , body: { token: 'noto\'g\'ri' } })).s === 401, 'kirishsiz rad etiladi');
    ok((await J('/api/my/bots', { method: 'POST', headers: auth, body: { token: 'abc' } })).s === 400, "noto'g'ri token formati rad etiladi");
    ok((await J('/api/my/bots', { method: 'POST', headers: auth, body: { token: '123456789:' + 'x'.repeat(35) } })).s === 400, 'Telegram rad etgan token xato beradi');
    const cr = await J('/api/my/bots', { method: 'POST', headers: auth, body: { token: TOKEN, name: "Baraka do'koni" } });
    ok(cr.s === 200 && cr.j.bot && cr.j.bot.username === 'baraka_test_bot' && cr.j.webhook === true, 'bot ulandi, webhook o\'rnatildi', cr.j);
    ok(!JSON.stringify(cr.j).includes(TOKEN) && cr.j.bot.tokenHint === '••••' + TOKEN.slice(-4), 'token javobda ko\'rsatilmaydi (faqat oxirgi 4 belgi)');
    const bot = cr.j.bot; const wh = sent('setWebhook')[0];
    ok(wh && wh.body.url.startsWith('https://example.test/api/tg/' + bot.id + '/') && wh.body.secret_token && wh.body.url.endsWith(wh.body.secret_token), 'webhook manzili va maxfiy kalit to\'g\'ri', wh && wh.body);
    ok(sent('setMyCommands').length === 1, 'bot buyruqlari o\'rnatildi');
    ok((await J('/api/my/bots', { method: 'POST', headers: auth, body: { token: TOKEN } })).s === 400, 'takroriy token rad etiladi');
    const secret = wh.body.secret_token, hook = `/api/tg/${bot.id}/${secret}`;
    const upd = (o) => J(hook, { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': secret }, body: o });
    ok((await J(`/api/tg/${bot.id}/${'0'.repeat(32)}`, { method: 'POST', body: {} })).s === 403, 'noto\'g\'ri maxfiy kalit bilan webhook rad etiladi');
    ok((await J(hook, { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'x' }, body: {} })).s === 403, 'noto\'g\'ri sarlavha kaliti rad etiladi');

    console.log('Sozlash');
    const cfg = { title: "Baraka do'koni", welcome: 'Salom! Baraka do\'koniga xush kelibsiz.', about: 'Sifatli mahsulotlar.', currency: "so'm", fallback: 'Tushunmadim.',
      contact: { phone: '+998 71 200 00 00', address: 'Toshkent', hours: '9:00–21:00' },
      buttons: [{ text: '🛍 Katalog', type: 'catalog', value: '' }, { text: '📞 Aloqa', type: 'contact', value: '' }, { text: 'ℹ️ Yetkazib berish', type: 'text', value: 'Toshkent bo\'ylab bepul' }, { text: '🌐 Sayt', type: 'url', value: 'https://example.com' }],
      products: [{ id: 'p1', name: 'Olma', price: 15000, description: 'Yangi olma', image: '', category: 'Mevalar', active: true }, { id: 'p2', name: 'Anor', price: 25000, description: '', image: '', category: 'Mevalar', active: true }, { id: 'p3', name: 'Sut', price: 12000, description: '', image: '', category: 'Ichimliklar', active: true }, { id: 'p4', name: 'Yashirin', price: 1, description: '', image: '', category: 'Mevalar', active: false }],
      replies: [{ keyword: 'narx', answer: 'Narxlar katalogda' }], miniApp: { enabled: true, title: "Do'kon", accent: '#16a34a' } };
    const put = await J('/api/my/bots/' + bot.id, { method: 'PUT', headers: auth, body: { config: cfg } });
    ok(put.s === 200 && put.j.config.products.length === 4 && put.j.config.miniApp.enabled, 'sozlamalar saqlandi');
    const menuBtn = sent('setChatMenuButton').pop();
    ok(menuBtn && menuBtn.body.menu_button.type === 'web_app' && menuBtn.body.menu_button.web_app.url === `https://example.test/app/${bot.id}`, 'mini ilova menyu tugmasi o\'rnatildi', menuBtn && menuBtn.body);
    const other = await J('/api/auth/register', { method: 'POST', body: { name: 'Begona', phone: '+99891' + String(Math.floor(1e6 + Math.random() * 9e6)), password: 'secret12' } });
    ok((await J('/api/my/bots/' + bot.id, { headers: { authorization: 'Bearer ' + other.j.token } })).s === 404, 'boshqa mijoz botni ko\'ra olmaydi');
    ok((await J('/api/my/bots/' + bot.id, { method: 'PUT', headers: { authorization: 'Bearer ' + other.j.token }, body: { config: {} } })).s === 404, 'boshqa mijoz botni o\'zgartira olmaydi');

    console.log('Bot ichida (mijoz)');
    const U = { id: 5001, first_name: 'Aziz', username: 'aziz_u' }, chat = { id: 5001, type: 'private' };
    let n0 = calls.length; await upd({ message: { chat, from: U, text: '/start' } });
    let ms = sent('sendMessage').slice(-1)[0];
    ok(ms && ms.body.chat_id === 5001 && /xush kelibsiz/.test(ms.body.text) && ms.body.reply_markup.keyboard.flat().some((b) => b.text === '🛍 Katalog') && ms.body.reply_markup.keyboard.flat().some((b) => b.web_app), '/start: salom va menyu (mini ilova tugmasi bilan)', ms && ms.body);
    n0 = calls.length; await upd({ message: { chat, from: U, text: '🛍 Katalog' } });
    ms = sent('sendMessage').slice(-1)[0];
    ok(ms.body.reply_markup.inline_keyboard.flat().map((b) => b.text).join() === 'Mevalar,Ichimliklar', 'katalog: kategoriyalar (yashirin mahsulot ko\'rinmaydi)', ms.body.reply_markup);
    await upd({ callback_query: { id: 'c1', from: U, message: { chat }, data: 'c0' } });
    ms = sent('sendMessage').slice(-1)[0];
    ok(ms.body.reply_markup.inline_keyboard.flat().map((b) => b.text).join('|') === 'Olma — 15 000|Anor — 25 000', 'kategoriya: mahsulotlar va narxlar', ms.body.reply_markup);
    await upd({ callback_query: { id: 'c2', from: U, message: { chat }, data: 'vp1' } });
    ms = sent('sendMessage').slice(-1)[0]; ok(/Olma/.test(ms.body.text) && /15 000/.test(ms.body.text), 'mahsulot kartochkasi');
    await upd({ callback_query: { id: 'c3', from: U, message: { chat }, data: 'ap1' } }); await upd({ callback_query: { id: 'c4', from: U, message: { chat }, data: 'ap1' } }); await upd({ callback_query: { id: 'c5', from: U, message: { chat }, data: 'ap2' } });
    ok(sent('answerCallbackQuery').slice(-3).map((c) => c.body.text).join('|') === "Savatga qo'shildi (1)|Savatga qo'shildi (2)|Savatga qo'shildi (1)", 'savatga qo\'shish (2 ta olma, 1 ta anor)');
    await upd({ callback_query: { id: 'c6', from: U, message: { chat }, data: 'ap4' } }); // yashirin
    await upd({ message: { chat, from: U, text: '/cart' } }); ms = sent('sendMessage').slice(-1)[0];
    ok(/Olma × 2 = 30 000/.test(ms.body.text) && /Anor × 1 = 25 000/.test(ms.body.text) && /Jami: 55 000/.test(ms.body.text) && !/Yashirin/.test(ms.body.text), 'savat: summa to\'g\'ri, yashirin mahsulot qo\'shilmaydi', ms.body.text);
    await upd({ callback_query: { id: 'c7', from: U, message: { chat }, data: 'o' } }); ms = sent('sendMessage').slice(-1)[0];
    ok(/Telefon/.test(ms.body.text) && ms.body.reply_markup.keyboard[0][0].request_contact, 'buyurtma: telefon so\'raladi (kontakt tugmasi bilan)');
    await upd({ message: { chat, from: U, text: 'xato' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/to'g'ri yozing/.test(ms.body.text), 'noto\'g\'ri telefon qayta so\'raladi');
    await upd({ message: { chat, from: U, contact: { phone_number: '+998901234567', first_name: 'Aziz' } } }); ms = sent('sendMessage').slice(-1)[0]; ok(/Manzil/.test(ms.body.text), 'kontakt qabul qilindi, manzil so\'raladi');
    await upd({ message: { chat, from: U, text: 'Chilonzor 5-kvartal' } });
    ms = sent('sendMessage').slice(-1)[0]; ok(/Buyurtmangiz qabul qilindi/.test(ms.body.text) && /55 000/.test(ms.body.text), 'buyurtma qabul qilindi');
    const ords = await J(`/api/my/bots/${bot.id}/orders`, { headers: auth });
    ok(ords.j.length === 1 && ords.j[0].total === 55000 && ords.j[0].phone === '+998901234567' && ords.j[0].message === 'Chilonzor 5-kvartal' && ords.j[0].extra.Telegram === '@aziz_u', 'buyurtma bazada, narx serverda hisoblangan', ords.j[0]);
    await upd({ message: { chat, from: U, text: '/cart' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/bo'sh/.test(ms.body.text), 'buyurtmadan keyin savat tozalandi');
    await upd({ message: { chat, from: U, text: '📞 Aloqa' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/200 00 00/.test(ms.body.text) && /Toshkent/.test(ms.body.text), 'aloqa tugmasi');
    await upd({ message: { chat, from: U, text: 'ℹ️ Yetkazib berish' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/bepul/.test(ms.body.text), 'matnli tugma');
    await upd({ message: { chat, from: U, text: '🌐 Sayt' } }); ms = sent('sendMessage').slice(-1)[0]; ok(ms.body.reply_markup.inline_keyboard[0][0].url === 'https://example.com', 'havola tugmasi');
    await upd({ message: { chat, from: U, text: 'Narxlar qancha?' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/Narxlar katalogda/.test(ms.body.text), 'avto-javob (kalit so\'z)');
    await upd({ message: { chat, from: U, text: 'qwerty' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/Tushunmadim/.test(ms.body.text), 'tushunilmagan xabarga javob');
    n0 = calls.length; await upd({ message: { chat, from: U, text: '/stats' } }); ok(!/Obunachilar/.test(JSON.stringify(calls.slice(n0))), 'egasi bo\'lmagan odam /stats ni ko\'ra olmaydi');
    n0 = calls.length; await upd({ message: { chat: { id: -100, type: 'group' }, from: U, text: '/start' } }); ok(calls.length === n0, 'guruh xabarlariga javob berilmaydi');

    console.log('Egasi');
    const O = { id: 9001, first_name: 'Egasi' }, oc = { id: 9001, type: 'private' };
    await J(hook, { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': secret }, body: { message: { chat: oc, from: O, text: '/start ' + bot.claim } } });
    ms = sent('sendMessage').slice(-1)[0]; ok(ms.body.chat_id === 9001 && /egasi sifatida ulandingiz/.test(ms.body.text), 'egasi claim kodi bilan ulandi');
    ok((await J('/api/my/bots/' + bot.id, { headers: auth })).j.ownerLinked === true, 'kabinetda egasi ulangani ko\'rinadi');
    await upd({ message: { chat: oc, from: O, text: '/stats' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/Obunachilar: <b>2<\/b>/.test(ms.body.text) && /Buyurtmalar: <b>1<\/b>/.test(ms.body.text), '/stats', ms.body.text);
    await upd({ message: { chat: oc, from: O, text: '/orders' } }); ms = sent('sendMessage').slice(-1)[0]; ok(/Aziz|Aziz/.test(ms.body.text) && /55 000/.test(ms.body.text), '/orders');
    n0 = calls.length; await upd({ message: { chat: oc, from: O, text: '/broadcast Yangi mahsulotlar keldi!' } }); await wait(200);
    const bc = calls.slice(n0).filter((c) => c.method === 'sendMessage' && c.body.text === 'Yangi mahsulotlar keldi!').map((c) => c.body.chat_id).sort();
    ok(bc.join() === '5001,9001', '/broadcast: barcha obunachilarga yuborildi', bc);
    const via = await J(`/api/my/bots/${bot.id}/broadcast`, { method: 'POST', headers: auth, body: { text: 'Chegirma!' } }); await wait(200);
    ok(via.s === 200 && via.j.total === 2 && sent('sendMessage', (b) => b.text === 'Chegirma!').length === 2, 'kabinetdan xabar yuborish');

    console.log('Mini ilova');
    const cfgApp = await J(`/api/app/${bot.id}/config`);
    ok(cfgApp.s === 200 && cfgApp.j.products.length === 3 && !JSON.stringify(cfgApp.j).includes(TOKEN) && cfgApp.j.accent === '#16a34a', 'mini ilova sozlamalari ochiq (yashirin mahsulot va token yo\'q)');
    const html = await fetch(`${BASE}/app/${bot.id}`).then((r) => r.text()); ok(/window\.__BOT__="[a-f0-9]+"/.test(html) && /telegram-web-app\.js/.test(html), 'mini ilova sahifasi ochiladi');
    ok((await fetch(`${BASE}/app/ffffffffffff`)).status === 404, 'mavjud bo\'lmagan do\'kon 404');
    const initData = (user, tok = TOKEN, authDate = Math.floor(Date.now() / 1000)) => { const p = new URLSearchParams({ auth_date: String(authDate), query_id: 'AAH', user: JSON.stringify(user) }); const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n'); const sec = crypto.createHmac('sha256', 'WebAppData').update(tok).digest(); p.set('hash', crypto.createHmac('sha256', sec).update(check).digest('hex')); return p.toString(); };
    const order = (body) => J(`/api/app/${bot.id}/order`, { method: 'POST', body });
    ok((await order({ items: [{ id: 'p1', qty: 1 }], name: 'Test', phone: '+998901112233' })).s === 401, 'initData\'siz buyurtma rad etiladi');
    ok((await order({ initData: initData(U, 'boshqa:token'), items: [{ id: 'p1', qty: 1 }], name: 'Test', phone: '+998901112233' })).s === 401, 'soxta imzoli initData rad etiladi');
    ok((await order({ initData: initData(U, TOKEN, 1000), items: [{ id: 'p1', qty: 1 }], name: 'Test', phone: '+998901112233' })).s === 401, 'eskirgan initData rad etiladi');
    ok((await order({ initData: initData(U), items: [], name: 'Test', phone: '+998901112233' })).s === 400, "bo'sh savat rad etiladi");
    ok((await order({ initData: initData(U), items: [{ id: 'p1', qty: 1 }], name: 'T', phone: '+998901112233' })).s === 400, 'qisqa ism rad etiladi');
    n0 = calls.length;
    const okOrd = await order({ initData: initData(U), items: [{ id: 'p3', qty: 3 }, { id: 'p4', qty: 5 }, { id: 'yoq', qty: 1 }], name: 'Aziz', phone: '+998901234567', note: 'Eshik oldiga' });
    ok(okOrd.s === 200 && okOrd.j.total === 36000, "mini ilovadan buyurtma: narx serverda hisoblandi, yashirin va noma'lum mahsulotlar hisobga olinmadi", okOrd.j);
    await wait(150);
    ok(sent('sendMessage', (b) => b.chat_id === 9001 && /Yangi buyurtma/.test(b.text) && /Sut × 3/.test(b.text)).length === 1, 'egasiga buyurtma haqida Telegram xabari bordi');
    ok(sent('sendMessage', (b) => b.chat_id === 5001 && /Buyurtmangiz qabul qilindi/.test(b.text)).length >= 1, 'mijozga tasdiq xabari bordi');
    const ords2 = await J(`/api/my/bots/${bot.id}/orders`, { headers: auth }); ok(ords2.j.length === 2 && ords2.j[0].message === 'Eshik oldiga', 'buyurtmalar kabinetda');
    ok(!(await J('/api/admin/orders', { headers: { cookie } })).j.some((o) => o.bot), 'bot buyurtmalari asosiy admin buyurtmalariga aralashmaydi');
    ok(!(await J('/api/my/orders', { headers: auth })).j.some((o) => o.bot), 'mijozning shaxsiy buyurtmalariga aralashmaydi');

    console.log('Admin va o\'chirish');
    const ab = await J('/api/admin/bots', { headers: { cookie } }); ok(ab.j.length === 1 && ab.j[0].subscribers === 2 && ab.j[0].orders === 2 && !JSON.stringify(ab.j).includes(TOKEN), 'adminda botlar ro\'yxati (token yo\'q)', ab.j);
    const up = await J('/api/my/upload', { method: 'POST', headers: auth, body: { data: 'data:image/png;base64,iVBORw0KGgo=' } }); ok(up.s === 200 && /^\/uploads\//.test(up.j.url), 'rasm yuklash');
    ok((await J('/api/my/upload', { method: 'POST', headers: auth, body: { data: 'data:text/html;base64,PGI+' } })).s === 400, 'rasm bo\'lmagan fayl rad etiladi');
    const del = await J('/api/my/bots/' + bot.id, { method: 'DELETE', headers: auth }); ok(del.s === 200 && sent('deleteWebhook').length === 1, 'bot o\'chirildi, webhook uzildi');
    ok((await fetch(`${BASE}/app/${bot.id}`)).status === 404 && (await upd({ message: { chat, from: U, text: '/start' } })).s === 403, "o'chirilgach mini ilova va webhook ishlamaydi");
  } catch (e) { fail++; console.log('  XATO', e.stack || e.message); }
  srv.kill(); mock.close();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
