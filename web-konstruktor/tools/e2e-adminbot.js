'use strict';
// Admin Telegram bot va admin mini ilovani sinaydi (Telegram soxta serveri bilan).
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-ab-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const PORT = 4900 + Math.floor(Math.random() * 90), BASE = `http://localhost:${PORT}`;
const TOKEN = '555555555:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw3', ADMIN = 'adm-bot-pass';
let pass = 0, fail = 0;
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 220)); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}; try { j = await r.json(); } catch { /* ignore */ } return { s: r.status, j, r }; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const calls = [];
  const mock = http.createServer((req, res) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { const m = /^\/bot([^/]+)\/(\w+)$/.exec(req.url); let body = {}; try { body = JSON.parse(b || '{}'); } catch { /* ignore */ } res.setHeader('content-type', 'application/json'); if (!m || m[1] !== TOKEN) return res.end(JSON.stringify({ ok: false, description: 'Unauthorized' })); calls.push({ method: m[2], body }); res.end(JSON.stringify({ ok: true, result: /^(sendMessage|copyMessage)$/.test(m[2]) ? { message_id: 5000 + calls.length } : true })); }); });
  await new Promise((r) => mock.listen(0, r));
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: ADMIN, TG_API_BASE: `http://localhost:${mock.address().port}`, PUBLIC_URL: 'https://example.test', TELEGRAM_BOT_TOKEN: TOKEN }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await wait(250); }
  const sent = (m, f) => calls.filter((c) => c.method === m && (!f || f(c.body)));
  const last = () => sent('sendMessage').slice(-1)[0];
  try {
    const al = await J('/api/admin/login', { method: 'POST', body: { password: ADMIN } }); const cookie = (al.r.headers.get('set-cookie') || '').split(';')[0];
    await wait(4600); // server ishga tushganda avto-ulanish
    console.log('Ulanish');
    ok(sent('setWebhook').length === 1 && /^https:\/\/example\.test\/api\/adminbot\/[a-f0-9]{32}$/.test(sent('setWebhook')[0].body.url), 'server ishga tushganda webhook avtomatik o\'rnatildi', sent('setWebhook')[0]);
    const mb = sent('setChatMenuButton').pop(); ok(mb && mb.body.menu_button.web_app.url === 'https://example.test/admin', "menyu tugmasi: admin mini ilova");
    const st0 = await J('/api/admin/settings', { headers: { cookie } }); ok(st0.j.adminBot.connected && st0.j.adminBot.hasToken && st0.j.adminBot.chats.length === 0, "sozlamalarda holat ko'rinadi", st0.j.adminBot);
    ok(!JSON.stringify(st0.j).includes(TOKEN), 'token sozlamalar javobida yo\'q');
    const secret = sent('setWebhook')[0].body.secret_token, hook = `/api/adminbot/${secret}`;
    const upd = (o) => J(hook, { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': secret }, body: o });
    ok((await J(`/api/adminbot/${'0'.repeat(32)}`, { method: 'POST', body: {} })).s === 403 && (await J(hook, { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'x' }, body: {} })).s === 403, "noto'g'ri kalit bilan webhook rad etiladi");
    const A = { id: 7001, first_name: 'Admin', username: 'boss' }, chat = { id: 7001, type: 'private' }, msg = (text, id = 1) => upd({ message: { message_id: id, chat, from: A, text } });
    const S = { id: 7002, first_name: 'Begona' }, sc = { id: 7002, type: 'private' };

    console.log('Kirish va xavfsizlik');
    await msg('/stats'); ok(/operator ulanmagan/.test(last().body.text) && !/Statistika/.test(last().body.text) && last().body.chat_id === 7001, 'kirmagan odamga admin buyruq bajarilmaydi (support sifatida qaraladi)');
    for (let i = 0; i < 14; i++) await msg('/orders'); ok(/Juda ko'p xabar/.test(last().body.text), 'kirmagan odamning spami cheklanadi');
    await msg('/login xato-parol', 11); ok(/Parol noto'g'ri/.test(last().body.text) && sent('deleteMessage', (b) => b.message_id === 11).length === 1, "noto'g'ri parol rad etildi, xabar chatdan o'chirildi");
    await msg('/stats'); ok(!/Statistika/.test(last().body.text), 'noto\'g\'ri parolda ham kirmaydi');
    await msg('/login ' + ADMIN, 12); ok(/Admin sifatida kirdingiz/.test(last().body.text) && sent('deleteMessage', (b) => b.message_id === 12).length === 1, 'to\'g\'ri parol bilan kirdi, parol xabari o\'chirildi');
    console.log('Mijoz yozishmasi (support)');
    const cm = (text, id) => upd({ message: { message_id: id, chat: sc, from: S, text } });
    const n0 = sent('sendMessage').length;
    await cm('/start', 21); ok(/yordam botiga/.test(last().body.text) && last().body.chat_id === 7002, 'mijozga /start salomlashuv');
    await cm('Salom, sayt narxi qancha?', 22);
    const toAdmin = sent('sendMessage', (b) => b.chat_id === 7001 && /Begona/.test(b.text) && /sayt narxi qancha/.test(b.text)).pop();
    ok(!!toAdmin, 'mijoz xabari adminga yetib bordi (ismi bilan)');
    const toCust = sent('sendMessage', (b) => b.chat_id === 7002 && /Start sayt/.test(b.text)).pop();
    ok(!!toCust && /2 500 000/.test(toCust.body.text) && /\$10/.test(toCust.body.text), 'bot narx savoliga o`zi javob berdi (paketlar va $10)', sent('sendMessage').slice(-3).map((c) => c.body.text));
    ok(sent('sendMessage', (b) => b.chat_id === 7001 && /Bot javobi/.test(b.text) && /Start sayt/.test(b.text)).length === 1, 'adminga bot javobi ko\'rsatildi');
    const headId = 5000 + calls.indexOf(calls.filter((c) => c.method === 'sendMessage' && c.body === toAdmin.body).pop()) + 1;
    await upd({ message: { message_id: 30, chat, from: A, text: 'Salom! 10$ dan boshlanadi.', reply_to_message: { message_id: headId } } });
    const back = sent('sendMessage', (b) => b.chat_id === 7002 && /Impro IT:/.test(b.text) && /10\$ dan boshlanadi/.test(b.text)).pop();
    ok(!!back, 'admin reply qilsa, javob mijozga qaytdi', sent('sendMessage').slice(-2).map((c) => c.body));
    const nb = sent('sendMessage').length; await upd({ message: { message_id: 31, chat, from: A, text: 'oddiy xabar' } });
    ok(sent('sendMessage').length === nb || !/Impro IT:/.test((last() || { body: { text: '' } }).body.text), 'oddiy admin xabari mijozga ketmaydi');
    await upd({ message: { message_id: 23, chat: sc, from: S, photo: [{ file_id: 'x' }], caption: 'rasm' } });
    ok(sent('copyMessage', (b) => b.chat_id === 7001 && b.from_chat_id === 7002).length === 1, 'mijoz rasmi adminga nusxalandi');
    const cust = (id, name, text, mid) => upd({ message: { message_id: mid, chat: { id, type: 'private' }, from: { id, first_name: name }, text } });
    await cust(7003, 'Aziz', 'Kvant kompyuterlar haqida gapirib bering', 40);
    ok(/mutaxassisga yubordim/.test(sent('sendMessage', (b) => b.chat_id === 7003).pop().body.text) && sent('sendMessage', (b) => b.chat_id === 7001 && /Operator kerak/.test(b.text)).length === 1, "bilmagan savol operatorga uzatildi (admin ogohlantirildi)");
    await cust(7004, 'Ivan', 'Сколько стоит сайт?', 41);
    ok(/Start sayt: от 2 500 000/.test(sent('sendMessage', (b) => b.chat_id === 7004).pop().body.text), "ruscha savolga ruscha javob");
    await cust(7005, 'John', 'How long does a website take?', 42);
    ok(/5–10/.test(sent('sendMessage', (b) => b.chat_id === 7005).pop().body.text), 'inglizcha savolga javob (muddatlar)');
    await cust(7006, 'Bek', "Operator bilan gaplashmoqchiman", 43);
    ok(/\+998 33 623 33 13/.test(sent('sendMessage', (b) => b.chat_id === 7006).pop().body.text) && sent('sendMessage', (b) => b.chat_id === 7001 && /Operator kerak/.test(b.text)).length === 2, "operator so'ralsa telefon beriladi va admin ogohlantiriladi");
    // operator reply -> bot 2 soat jim turadi
    const nB = sent('sendMessage', (b) => b.chat_id === 7002).length;
    await cm('Rahmat, yana bir savol: bot qancha turadi?', 44);
    ok(sent('sendMessage', (b) => b.chat_id === 7002).length === nB, 'operator javob bergan mijozga bot aralashmaydi (2 soat)');
    await msg('/auto off', 50); ok(/o'chirildi/.test(last().body.text), '/auto off');
    await cust(7007, 'Lola', 'narx qancha?', 51);
    ok(/qabul qilindi/.test(sent('sendMessage', (b) => b.chat_id === 7007).pop().body.text), "avtomatik javob o'chiq: faqat tasdiq yuboriladi");
    await msg('/auto on', 52); ok(/yoqildi/.test(last().body.text), '/auto on');
    const st1 = await J('/api/admin/settings', { headers: { cookie } }); ok(st1.j.adminBot.chats.length === 1 && st1.j.adminBot.chats[0].id === 7001, 'qurilma sozlamalarda ko\'rinadi');
    let bruteStop = false; for (let i = 0; i < 7; i++) { await upd({ message: { message_id: 50 + i, chat: sc, from: S, text: '/login noto\'g\'ri' + i } }); if (/Juda ko'p urinish/.test(last().body.text)) bruteStop = true; }
    ok(bruteStop, 'parol terish urinishlari cheklanadi (brute-force himoyasi)');
    await upd({ message: { message_id: 90, chat: sc, from: S, text: '/stats' } }); ok(!/Statistika/.test(last().body.text), 'begona odam bloklangan');
    ok((await upd({ callback_query: { id: 'x1', from: S, message: { chat: sc, message_id: 1 }, data: 'os:abc:bajarildi' } })).s === 200 && sent('answerCallbackQuery', (b) => b.callback_query_id === 'x1')[0].body.text === "Ruxsat yo'q", 'begona tugma bosa olmaydi');

    console.log('Buyruqlar');
    await msg('/stats'); ok(/Statistika/.test(last().body.text) && /Mijozlar/.test(last().body.text), '/stats');
    await msg('/panel'); ok(last().body.reply_markup.inline_keyboard[0][0].web_app.url === 'https://example.test/admin', '/panel: mini ilova tugmasi');
    await msg('/help'); ok(/\/panel/.test(last().body.text) && /\/payments/.test(last().body.text), '/help');

    console.log('Buyurtmalar');
    const reg = await J('/api/auth/register', { method: 'POST', body: { name: 'Mijoz Bir', phone: '+998901112233', password: 'secret12' } }); const auth = { authorization: 'Bearer ' + reg.j.token };
    const n2 = calls.length;
    const o = await J('/api/order', { method: 'POST', headers: auth, body: { type: 'message', name: 'Mijoz Bir', phone: '+998901112233', message: 'Salom, narx qancha?' } }); await wait(300);
    const notif = calls.slice(n2).find((c) => c.method === 'sendMessage' && c.body.chat_id === 7001 && /Xabar/.test(c.body.text));
    ok(o.s === 200 && notif && /Mijoz Bir/.test(notif.body.text) && /Salom, narx qancha/.test(notif.body.text) && notif.body.reply_markup.inline_keyboard.flat().some((b) => b.callback_data === `os:${o.j.id}:bajarildi`), 'yangi buyurtma adminga tugmalar bilan keldi', notif && notif.body);
    await upd({ callback_query: { id: 'c1', from: A, message: { chat, message_id: 33 }, data: `os:${o.j.id}:bajarildi` } });
    const ords = await J('/api/admin/orders', { headers: { cookie } }); ok(ords.j.find((x) => x.id === o.j.id).status === 'bajarildi', 'tugma orqali buyurtma holati o\'zgardi (Bajarildi)');
    ok(sent('editMessageText', (b) => b.message_id === 33 && /Bajarildi/.test(b.text)).length === 1, 'xabar yangilandi');
    await upd({ callback_query: { id: 'c1b', from: A, message: { chat, message_id: 33 }, data: `os:${o.j.id}:yangi` } }); ok((await J('/api/admin/orders', { headers: { cookie } })).j.find((x) => x.id === o.j.id).status === 'bajarildi', "noto'g'ri holatga o'tkazib bo'lmaydi");
    await msg('/orders'); ok(sent('sendMessage', (b) => b.chat_id === 7001 && /Buyurtma|Xabar/.test(b.text) && /#/.test(b.text)).length >= 2, '/orders');

    console.log("To'lov va loyihalar");
    const tpl = { v: 2, company: { name: 'Lola Salon' }, theme: {}, sections: [{ id: 'bosh', type: 'hero', enabled: true, layout: 'aurora', titleStart: 'Salom', text: 'x' }] };
    const cp = await J('/api/my/projects', { method: 'POST', headers: auth, body: { name: 'Lola Salon', template: 'salon', data: tpl } }); const pid = cp.j.project.id;
    const n3 = calls.length; await J(`/api/my/projects/${pid}/checkout`, { method: 'POST', headers: auth, body: { method: 'manual' } }); await wait(300);
    const pn = calls.slice(n3).find((c) => c.method === 'sendMessage' && c.body.chat_id === 7001 && /To'lov so'rovi/.test(c.body.text));
    ok(pn && /Lola Salon/.test(pn.body.text) && /\$10/.test(pn.body.text), "to'lov so'rovi adminga keldi"); const payId = pn.body.reply_markup.inline_keyboard[0][0].callback_data.split(':')[1];
    await upd({ callback_query: { id: 'p1', from: A, message: { chat, message_id: 40 }, data: `pa:${payId}` } }); ok(/tasdiqlaysizmi/.test(last().body.text), "to'lovni tasdiqlash tasdiq so'raydi");
    ok(!(await J(`/api/my/projects/${pid}`, { headers: auth })).j.project.paid, "tasdiqlanmaguncha to'lanmagan");
    await upd({ callback_query: { id: 'p2', from: A, message: { chat, message_id: 41 }, data: `pc:a:${payId}` } });
    ok((await J(`/api/my/projects/${pid}`, { headers: auth })).j.project.paid, "tasdiqlangach loyiha 'to'langan' bo'ldi");
    ok((await J(`/api/my/projects/${pid}/export`, { headers: auth })).s === 200, 'mijoz saytni yuklab ola oladi');
    await msg('/payments'); ok(/Kutilayotgan to'lov yo'q/.test(last().body.text), '/payments: kutilayotgani qolmadi');
    await msg('/projects'); ok(/Lola Salon/.test(last().body.text), '/projects');
    await msg('/narx lola 900000 so\'m'); ok(/900000 so'm/.test(last().body.text), '/narx: narx qo\'yildi');
    ok((await J(`/api/my/projects/${pid}`, { headers: auth })).j.project.price === "900000 so'm", 'narx mijozga ko\'rinadi');
    await msg('/narx yoqsayt 100'); ok(/topilmadi/.test(last().body.text), '/narx: topilmagan sayt');
    await msg('/mijoz 901112233'); ok(/Mijoz Bir/.test(last().body.text) && /Lola Salon/.test(last().body.text), '/mijoz');
    await msg('/mijoz 999999999'); ok(/topilmadi/.test(last().body.text), '/mijoz: topilmadi');
    const p2 = await J('/api/my/projects', { method: 'POST', headers: auth, body: { name: 'Ikkinchi', template: 'salon', data: tpl } });
    await upd({ callback_query: { id: 'p3', from: A, message: { chat, message_id: 42 }, data: `pc:p:${p2.j.project.id}` } });
    ok((await J(`/api/my/projects/${p2.j.project.id}`, { headers: auth })).j.project.paid, '/projects tugmasi orqali ham tasdiqlash ishlaydi');

    console.log('Mini ilova (admin panel)');
    const initData = (user, tok = TOKEN, authDate = Math.floor(Date.now() / 1000)) => { const p = new URLSearchParams({ auth_date: String(authDate), query_id: 'AAH', user: JSON.stringify(user) }); const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n'); const sec = crypto.createHmac('sha256', 'WebAppData').update(tok).digest(); p.set('hash', crypto.createHmac('sha256', sec).update(check).digest('hex')); return p.toString(); };
    const sess = (initD) => J('/api/adminbot/session', { method: 'POST', body: { initData: initD } });
    ok((await sess('')).s === 401, "initData'siz sessiya berilmaydi");
    ok((await sess(initData(A, 'boshqa:token'))).s === 401, 'soxta imzoli initData rad etiladi');
    ok((await sess(initData(A, TOKEN, Math.floor(Date.now() / 1000) - 7200))).s === 401, 'eskirgan initData rad etiladi');
    ok((await sess(initData(S))).s === 403, "kirmagan Telegram foydalanuvchi admin panelga kira olmaydi");
    const ss = await sess(initData(A)); const ck = (ss.r.headers.get('set-cookie') || '').split(';')[0];
    ok(ss.s === 200 && /^sid=/.test(ck) && /HttpOnly/.test(ss.r.headers.get('set-cookie')), 'admin foydalanuvchi uchun sessiya berildi (HttpOnly)');
    ok((await J('/api/admin/stats', { headers: { cookie: ck } })).s === 200, 'sessiya bilan admin API ishlaydi');
    const html = await fetch(BASE + '/admin').then((r) => r.text()); ok(/telegram-web-app\.js/.test(html), 'admin sahifasi Telegram mini ilovasini qo\'llab-quvvatlaydi');

    console.log('Brauzerda admin mini ilova');
    const b = await chromium.launch();
    const openAs = async (initD) => { const pg = await b.newPage({ viewport: { width: 390, height: 800 } }); await pg.addInitScript((d) => { window.Telegram = { WebApp: { initData: d, ready() {}, expand() {}, setHeaderColor() {} } }; }, initD); await pg.route('https://telegram.org/**', (r) => r.abort()); await pg.goto(BASE + '/admin', { waitUntil: 'load' }); return pg; };
    const pg1 = await openAs(initData(A)); await pg1.waitForSelector('#nav button', { timeout: 8000 }).catch(() => {});
    ok(await pg1.$('#nav button') !== null && await pg1.isHidden('#login'), 'Telegram ichida admin panel parolsiz ochildi');
    ok(await pg1.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), "telefon ekranida gorizontal scroll yo'q");
    await pg1.click('#nav button:has-text("Sozlamalar")'); await pg1.waitForSelector('#abConnect'); ok(/Bot ulangan/.test(await pg1.innerText('#pg')) && /Uzish/.test(await pg1.innerText('#pg')), 'sozlamalarda admin bot holati va qurilmalar ko\'rinadi');
    await pg1.click('#abConnect'); await pg1.waitForTimeout(800); ok(sent('setWebhook').length >= 2, "«Botni ulash» tugmasi webhook'ni qayta o'rnatadi", { n: sent('setWebhook').length, msg: await pg1.innerText('#pg').then((t) => t.slice(0, 80)).catch(() => '') });
    const pg2 = await openAs(initData(S)); await pg2.waitForTimeout(1500);
    ok(await pg2.isVisible('#login') && /Avval botda \/login/.test(await pg2.innerText('#le')), 'kirmagan foydalanuvchiga tushunarli xabar ko\'rsatiladi');
    await b.close();

    console.log('Chiqish va uzish');
    await msg('/logout'); ok(/Chiqdingiz/.test(last().body.text), '/logout');
    ok((await sess(initData(A))).s === 403, 'chiqqach mini ilova ham yopiladi');
    await msg('/stats'); ok(!/Statistika/.test(last().body.text), 'chiqqach buyruqlar ishlamaydi');
    await msg('/login ' + ADMIN, 70); await upd({ message: { message_id: 71, chat: { id: 7003, type: 'private' }, from: { id: 7003, first_name: 'Ikkinchi' }, text: '/login ' + ADMIN } });
    ok((await J('/api/admin/settings', { headers: { cookie } })).j.adminBot.chats.length === 2, 'ikkita qurilma ulangan');
    const rv = await J('/api/admin/adminbot/revoke', { method: 'POST', headers: { cookie }, body: { id: 7003 } }); ok(rv.j.status.chats.length === 1 && rv.j.status.chats[0].id === 7001, 'admin paneldan qurilmani uzish');
    ok((await J('/api/admin/adminbot/connect', { method: 'POST', headers: { cookie } })).j.ok === true && (await J('/api/admin/adminbot/connect', { method: 'POST' })).s === 401, 'qayta ulash faqat admin uchun');
  } catch (e) { fail++; console.log('  XATO', e.stack || e.message); }
  srv.kill(); mock.close();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
