'use strict';
// Bot konstruktori (Worker): bot ulash, katalog/savat/buyurtma, mini ilova, egasiga xabar, xabar yuborish, admin ko'rinishi.
const path = require('path'), crypto = require('crypto');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 260)); } };
(async () => {
  require('./build-worker.js');
  const W = (await import(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs') + '?t=' + Date.now())).default;
  const BT = '111222333:TESTtokenTESTtokenTESTtokenTEST12', calls = []; let badToken = false;
  globalThis.fetch = async (url, o) => { const u = String(url), m = /bot([^/]+)\/(\w+)$/.exec(u); if (!m) return new Response('{}', { status: 404 }); let b = {}; try { b = JSON.parse(o.body); } catch { /* */ } calls.push({ tok: m[1], method: m[2], body: b });
    if (m[1] === BT && badToken) return new Response(JSON.stringify({ ok: false, description: 'Unauthorized' }), { status: 401 });
    if (m[2] === 'getMe') return new Response(JSON.stringify({ ok: true, result: { id: 8643479892, username: 'baraka_test_bot', first_name: 'Baraka' } }));
    return new Response(JSON.stringify({ ok: true, result: m[2] === 'sendMessage' ? { message_id: 1 } : true })); };
  const { DatabaseSync } = require('node:sqlite'), sdb = new DatabaseSync(':memory:');
  const env = { TG_TOKEN: '1:a', WEBHOOK_SECRET: 'whsec_abcdefghijklmnop', TG_CHAT: '7', ADMIN_PASSWORD: 'x', DB: { prepare(sql) { const s = sdb.prepare(sql); let a = []; const o = { bind(...x) { a = x; return o; }, async first() { return s.get(...a) || null; }, async all() { return { results: s.all(...a) }; }, async run() { s.run(...a); return {}; } }; return o; } } };
  const H = 'https://w.example', pend = [], ctx = { waitUntil: (p) => pend.push(p) };
  const api = async (method, p, body, tok, hdr) => { const r = await W.fetch(new Request(H + p, { method, headers: { 'content-type': 'application/json', Origin: 'https://improuzbekiston.uz', ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(hdr || {}) }, body: body ? JSON.stringify(body) : undefined }), env, ctx); await Promise.all(pend.splice(0)); let j = null, t = ''; try { t = await r.clone().text(); j = JSON.parse(t); } catch { /* */ } return { s: r.status, j, t }; };
  let r = await api('POST', '/api/auth/register', { name: "Do'kon egasi", phone: '+998901230000', password: 'secret12' }); const tok = r.j.token, uid = r.j.user.id;
  r = await api('POST', '/api/my/bots', { token: 'xato', name: 'X' }, tok); ok(r.s === 400 && /Token noto'g'ri/.test(r.j.error), "noto'g'ri token rad etiladi");
  r = await api('POST', '/api/my/bots', { token: BT, name: 'Baraka Market' }, tok); ok(r.s === 200 && r.j.bot && r.j.bot.username === 'baraka_test_bot' && r.j.webhook === true, 'bot ulandi (getMe + setWebhook)', r.j);
  const bot = r.j.bot, sw = calls.find((c) => c.method === 'setWebhook'); ok(sw && sw.tok === BT && sw.body.url.startsWith(`${H}/api/tg/${bot.id}/`) && sw.body.secret_token, 'webhook manzili to\'g\'ri', sw && sw.body.url); const secret = sw.body.secret_token;
  ok(!r.t.includes(BT), 'token javobda ochiq ko\'rinmaydi'); ok(r.j.bot.claimLink.includes('?start='), 'egalik havolasi bor');
  r = await api('POST', '/api/my/bots', { token: BT, name: 'Dublikat' }, tok); ok(r.s === 400 && /allaqachon/.test(r.j.error), 'takroriy bot rad etiladi');
  const cfg = { title: 'Baraka Market', welcome: 'Xush kelibsiz!', currency: "so'm", contact: { phone: '+998 90 111 22 33', address: 'Toshkent', hours: '9-18' }, buttons: [{ text: '🛍 Katalog', type: 'catalog' }, { text: '📞 Aloqa', type: 'contact' }, { text: 'Narx', type: 'text', value: 'Narxlar katalogda' }], replies: [{ keyword: 'yetkazib', answer: 'Yetkazib berish bepul' }], miniApp: { enabled: true, title: "Do'kon", accent: '#16a34a' }, products: [{ id: 'p1', name: 'Olma', price: 12000, category: 'Meva', active: true }, { id: 'p2', name: 'Nok', price: 18000, category: 'Meva', active: true }, { id: 'p3', name: 'Sut', price: 9000, category: 'Sut', active: true }, { id: 'p4', name: 'Yashirin', price: 1, category: 'Sut', active: false }] };
  r = await api('PUT', '/api/my/bots/' + bot.id, { config: cfg }, tok); ok(r.s === 200 && r.j.config.products.length === 4, 'sozlamalar saqlandi');
  ok(calls.some((c) => c.method === 'setChatMenuButton' && c.body.menu_button && c.body.menu_button.type === 'web_app' && c.body.menu_button.web_app.url === `${H}/app/${bot.id}`), 'mini ilova menyu tugmasi o\'rnatildi');
  // webhook
  const hook = async (upd, sec = secret, hdr = secret) => { const x = await api('POST', `/api/tg/${bot.id}/${sec}`, upd, null, hdr ? { 'X-Telegram-Bot-Api-Secret-Token': hdr } : {}); return x; };
  r = await hook({ message: { message_id: 1, chat: { id: 500, type: 'private' }, from: { id: 500, first_name: 'Mijoz', username: 'mijoz1' }, text: '/start' } }, 'a'.repeat(32)); ok(r.s === 403, 'noto\'g\'ri sir rad etiladi');
  const msg = (text, extra) => hook({ message: { message_id: Math.floor(Math.random() * 1e6), chat: { id: 500, type: 'private' }, from: { id: 500, first_name: 'Mijoz', username: 'mijoz1' }, text, ...extra } }), cb = (data) => hook({ callback_query: { id: 'q' + Math.random(), data, from: { id: 500, first_name: 'Mijoz', username: 'mijoz1' }, message: { chat: { id: 500 }, message_id: 9 } } });
  const sent = () => calls.filter((c) => c.tok === BT && c.method === 'sendMessage' && c.body.chat_id === 500);
  calls.length = 0; await msg('/start'); ok(sent().some((c) => /Xush kelibsiz/.test(c.body.text) && c.body.reply_markup.keyboard.length >= 2), '/start: salomlashish va menyu');
  ok(sent()[0].body.reply_markup.keyboard[0][0].web_app, 'menyuda mini ilova tugmasi');
  calls.length = 0; await msg('🛍 Katalog'); const kb1 = JSON.stringify(sent().slice(-1)[0].body.reply_markup); ok(/c0/.test(kb1) && /c1/.test(kb1) && !/Yashirin/.test(kb1), 'katalog: kategoriyalar (yashirin mahsulot chiqmaydi)');
  calls.length = 0; await cb('c0'); const kb2 = JSON.stringify(sent().slice(-1)[0].body.reply_markup); ok(/Olma — 12 000/.test(kb2) && /Nok/.test(kb2), 'kategoriya: mahsulotlar narxi bilan');
  calls.length = 0; await cb('vp1'); ok(sent().some((c) => /Olma/.test(c.body.text) && /ap1/.test(JSON.stringify(c.body.reply_markup))), 'mahsulot kartochkasi');
  await cb('ap1'); await cb('ap1'); await cb('ap2'); calls.length = 0; await cb('b'); ok(/Olma × 2 = 24 000/.test(sent().slice(-1)[0].body.text) && /Jami: 42 000/.test(sent().slice(-1)[0].body.text), 'savat: 2 ta olma + nok = 42 000');
  calls.length = 0; await cb('o'); ok(sent().some((c) => /Telefon raqamingiz/.test(c.body.text)), 'buyurtma: telefon so\'raydi');
  await msg('abc'); ok(sent().some((c) => /to'g'ri yozing/.test(c.body.text)), 'noto\'g\'ri telefon qayta so\'raladi');
  calls.length = 0; await msg('+998901112233'); ok(sent().some((c) => /izoh/.test(c.body.text)), 'buyurtma: izoh so\'raydi');
  // egasini ulash
  await hook({ message: { message_id: 77, chat: { id: 900, type: 'private' }, from: { id: 900, first_name: 'Ega' }, text: '/start ' + bot.claim } }); r = await api('GET', '/api/my/bots/' + bot.id, null, tok); ok(r.j.ownerLinked === true, 'bot egasi ulandi (claim)');
  calls.length = 0; await msg('Eshik oldiga'); const ownerMsg = calls.find((c) => c.method === 'sendMessage' && c.body.chat_id === 900 && /Yangi buyurtma/.test(c.body.text));
  ok(ownerMsg && /Mijoz|mijoz1/.test(ownerMsg.body.text) && /42 000/.test(ownerMsg.body.text) && /Eshik oldiga/.test(ownerMsg.body.text), 'egasiga buyurtma xabari keldi'); ok(sent().some((c) => /qabul qilindi/.test(c.body.text)), 'mijozga tasdiq');
  r = await api('GET', '/api/my/bots/' + bot.id + '/orders', null, tok); ok(r.j.length === 1 && r.j[0].total === 42000 && r.j[0].items.length === 2, 'egasi buyurtmalarni ko\'radi');
  r = await api('GET', '/api/my/bots', null, tok); ok(r.j[0].orders === 1 && r.j[0].subscribers >= 1, 'ro\'yxatda buyurtmalar va obunachilar soni');
  calls.length = 0; await msg('yetkazib berasizmi?'); ok(sent().some((c) => /bepul/.test(c.body.text)), 'avto-javob (kalit so\'z)'); calls.length = 0; await msg('📞 Aloqa'); ok(sent().some((c) => /90 111 22 33/.test(c.body.text)), 'aloqa tugmasi');
  calls.length = 0; await msg('nimadir'); ok(sent().some((c) => /tushunmadim/.test(c.body.text)), 'tushunarsiz xabar: zaxira javob');
  // mini ilova
  const initFor = (id, tk) => { const p = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id, first_name: 'Web', username: 'webuser' }) }, str = Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join('\n'), sec = crypto.createHmac('sha256', 'WebAppData').update(tk).digest(); return new URLSearchParams({ ...p, hash: crypto.createHmac('sha256', sec).update(str).digest('hex') }).toString(); };
  const page = await W.fetch(new Request(`${H}/app/${bot.id}`), env, ctx); const html = await page.text(); ok(page.status === 200 && html.includes(`window.__BOT__="${bot.id}"`), 'mini ilova sahifasi ochiladi');
  r = await api('GET', `/api/app/${bot.id}/config`); ok(r.j.products.length === 3 && r.j.accent === '#16a34a' && !r.t.includes('Yashirin') && !r.t.includes(BT), 'mini ilova konfiguratsiyasi (yashirin mahsulotsiz, tokensiz)');
  r = await api('POST', `/api/app/${bot.id}/order`, { initData: 'soxta', name: 'Ali', phone: '+998901112233', items: [{ id: 'p3', qty: 1 }] }); ok(r.s === 401, 'mini ilova: soxta initData rad etiladi');
  calls.length = 0; r = await api('POST', `/api/app/${bot.id}/order`, { initData: initFor(600, BT), name: 'Ali Valiyev', phone: '+998901112244', note: 'tez', items: [{ id: 'p3', qty: 3 }, { id: 'p4', qty: 1 }, { id: 'zzz', qty: 1 }] }); ok(r.s === 200 && r.j.total === 27000, 'mini ilova: buyurtma (yashirin va noma\'lum mahsulot hisobga olinmaydi)', r.j);
  ok(calls.some((c) => c.method === 'sendMessage' && c.body.chat_id === 900 && /27 000/.test(c.body.text) && /@webuser/.test(c.body.text)), 'mini ilova buyurtmasi egasiga yetdi');
  r = await api('POST', `/api/app/${bot.id}/order`, { initData: initFor(600, BT), name: 'Ali', phone: '1', items: [{ id: 'p3', qty: 1 }] }); ok(r.s === 400, 'mini ilova: telefon tekshiriladi');
  // boshqa foydalanuvchi va admin
  r = await api('POST', '/api/auth/register', { name: 'Begona', phone: '+998901239999', password: 'secret12' }); const tok2 = r.j.token;
  r = await api('GET', '/api/my/bots/' + bot.id, null, tok2); ok(r.s === 404, 'begona botni ko\'ra olmaydi'); r = await api('DELETE', '/api/my/bots/' + bot.id, null, tok2); ok(r.s === 404, 'begona botni o\'chira olmaydi');
  r = await api('POST', '/api/admin/login', { password: 'x' }); const at = r.j.token; r = await api('GET', '/api/admin/bots', null, at); ok(r.j.length === 1 && r.j[0].owner === "Do'kon egasi" && r.j[0].orders === 2 && r.j[0].miniApp === true && !r.t.includes(BT), 'admin: botlar ro\'yxati');
  r = await api('GET', '/api/admin/orders', null, at); ok(r.j.length === 0, 'bot buyurtmalari platforma buyurtmalariga aralashmaydi');
  r = await api('GET', '/api/admin/stats', null, at); ok(r.j.orders.total === 0, 'statistikada bot buyurtmalari yo\'q');
  // xabar yuborish (navbat)
  await msg('/start'); r = await api('POST', '/api/my/bots/' + bot.id + '/broadcast', { text: 'Aksiya! 20% chegirma' }, tok); ok(r.s === 200 && r.j.total >= 1, 'xabar navbatga qo\'yildi', r.j);
  calls.length = 0; await W.tick(env); ok(calls.some((c) => c.tok === BT && c.method === 'sendMessage' && c.body.chat_id === 500 && /Aksiya/.test(c.body.text)), 'navbatdagi xabar obunachiga yuborildi (tick)'); ok(calls.some((c) => c.method === 'sendMessage' && c.body.chat_id === 900 && /Xabar yuborildi/.test(c.body.text)), 'egasiga yakuniy hisobot');
  // token bekor qilinsa
  badToken = true; r = await api('POST', '/api/my/bots/' + bot.id + '/connect', {}, tok); ok(r.s === 400 && /Ulanmadi/.test(r.j.error), 'token yaroqsiz bo\'lsa tushunarli xato'); badToken = false;
  r = await api('POST', '/api/my/bots/' + bot.id + '/connect', {}, tok); ok(r.s === 200 && r.j.webhook === true, 'qayta ulash');
  r = await api('DELETE', '/api/my/bots/' + bot.id, null, tok); ok(r.s === 200 && calls.some((c) => c.method === 'deleteWebhook'), 'bot o\'chirildi (webhook uzildi)'); r = await api('GET', '/api/my/bots', null, tok); ok(r.j.length === 0, 'ro\'yxat bo\'sh');
  const pg2 = await W.fetch(new Request(`${H}/app/${bot.id}`), env, ctx); ok(pg2.status === 404, 'o\'chirilgan bot mini ilovasi ochilmaydi');
  console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
