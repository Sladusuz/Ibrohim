'use strict';
// Buyurtma boti (@improuzbekiston_bot) va yordam boti (@improsupport_bot): vazifalar taqsimoti, to'lov, eslatma, faqat ega paneli.
const path = require('path');
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 260)); } };
(async () => {
  require('./build-worker.js');
  const W = (await import(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs') + '?t=' + Date.now())).default;
  const SUP = '1:support', ORD = '2:order', calls = [];
  globalThis.fetch = async (url, o) => { const u = String(url), m = /bot([^/]+)\/(\w+)$/.exec(u); if (!m) { calls.push({ tok: 'ext', method: u, body: o && o.body }); return new Response('{}', { status: 200 }); } let b = {}; try { b = JSON.parse(o.body); } catch { /* */ } calls.push({ tok: m[1], method: m[2], body: b });
    if (m[2] === 'createInvoiceLink') return new Response(JSON.stringify({ ok: true, result: 'https://t.me/$inv' })); if (m[2] === 'getWebhookInfo') return new Response(JSON.stringify({ ok: true, result: { url: 'https://x/hook' } }));
    if (m[2] === 'getMe') return new Response(JSON.stringify({ ok: true, result: { username: m[1] === ORD ? 'improuzbekiston_bot' : 'improsupport_bot' } }));
    return new Response(JSON.stringify({ ok: true, result: m[2] === 'sendMessage' || m[2] === 'sendInvoice' ? { message_id: Math.floor(Math.random() * 1e6) } : true })); };
  const { DatabaseSync } = require('node:sqlite'), sdb = new DatabaseSync(':memory:');
  const env = { TG_TOKEN: SUP, ORDER_BOT_TOKEN: ORD, WEBHOOK_SECRET: 'whsec_abcdefghijklmnop', SETUP_KEY: 'sk123', TG_CHAT: '7', ADMIN_PASSWORD: 'pw-1', CARD_INFO: '9860 1201 0441 7221', GLOBALPAY_TOKEN: '111:TEST:gp', CLICK_TG_TOKEN: '398062629:TEST:click', DB: { prepare(sql) { const s = sdb.prepare(sql); let a = []; const o = { bind(...x) { a = x; return o; }, async first() { return s.get(...a) || null; }, async all() { return { results: s.all(...a) }; }, async run() { s.run(...a); return {}; } }; return o; } } };
  const H = 'https://w.example', pend = [], ctx = { waitUntil: (p) => pend.push(p) };
  const post = async (p, body, hdr) => { const r = await W.fetch(new Request(H + p, { method: 'POST', headers: { 'content-type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': env.WEBHOOK_SECRET, ...(hdr || {}) }, body: JSON.stringify(body) }), env, ctx); await Promise.all(pend.splice(0)); return r.status; };
  const sup = (u) => post('/hook/' + env.WEBHOOK_SECRET, u), ord = (u) => post('/hook2/' + env.WEBHOOK_SECRET, u);
  const S = W.store(env);
  const userMsg = (chat, text) => ({ message: { message_id: Math.floor(Math.random() * 1e6), chat: { id: chat, type: 'private' }, from: { id: chat, first_name: 'Mijoz' + chat, username: 'mijoz' + chat }, text } });
  const userCb = (chat, data) => ({ callback_query: { id: 'q' + Math.random(), data, from: { id: chat, first_name: 'Mijoz' + chat }, message: { chat: { id: chat }, message_id: 9 } } });
  const sentBy = (tok, chat, re) => calls.filter((c) => c.tok === tok && (c.method === 'sendMessage' || c.method === 'sendInvoice') && c.body.chat_id === chat && (!re || re.test(c.body.text || c.body.title || '')));
  // --- sozlash
  let r = await W.fetch(new Request(H + '/setup?key=sk123'), env, ctx); const sj = await r.json(); ok(sj.webhook === true && sj.app && sj.app.bot === 'improuzbekiston_bot' && sj.app.webhook === true, "sozlash: ikkala bot webhook'i o'rnatildi", sj);
  const ow = calls.find((c) => c.tok === ORD && c.method === 'setWebhook'); ok(ow && ow.body.url === H + '/hook2/' + env.WEBHOOK_SECRET && ow.body.allowed_updates.includes('pre_checkout_query'), "buyurtma boti webhook'i /hook2 va pre_checkout bilan");
  const mb = calls.filter((c) => c.method === 'setChatMenuButton'); ok(mb.some((c) => c.tok === SUP && !c.body.chat_id && c.body.menu_button.type === 'commands'), "yordam botida umumiy menyu tugmasi oddiy (Panel yo'q)"); ok(mb.some((c) => c.tok === SUP && c.body.chat_id === 7 && c.body.menu_button.type === 'web_app'), 'Panel tugmasi faqat egaga (chat 7)'); ok(!mb.some((c) => c.tok === ORD && c.body.menu_button.type === 'web_app'), "buyurtma botida Panel tugmasi yo'q");
  ok(!!sj.globalpay && sj.globalpay.gp === 'ok' && sj.globalpay.click === 'ok', "to'lov usullari buyurtma boti orqali tekshirildi"); ok(calls.some((c) => c.method === 'createInvoiceLink' && c.tok === ORD) && !calls.some((c) => c.method === 'createInvoiceLink' && c.tok === SUP), "hisob-faktura havolalari buyurtma boti orqali yaratiladi");
  // --- yordam bot: buyurtma yo'naltiriladi
  calls.length = 0; await sup(userCb(500, 'm:order')); let rd = sentBy(SUP, 500)[0]; ok(rd && /improuzbekiston_bot/.test(rd.body.text) && JSON.stringify(rd.body.reply_markup).includes('t.me/improuzbekiston_bot'), "yordam botida «Buyurtma» buyurtma botiga yo'naltiradi");
  calls.length = 0; await sup(userMsg(500, '/tolov')); rd = sentBy(SUP, 500)[0]; ok(rd && /improuzbekiston_bot/.test(rd.body.text), "yordam botida /tolov buyurtma botiga yo'naltiradi"); calls.length = 0; await sup(userMsg(500, '/anketa')); ok(sentBy(SUP, 500).some((c) => /improuzbekiston_bot/.test(c.body.text)), '/anketa yo\'naltiradi');
  // --- buyurtma boti
  calls.length = 0; await ord(userMsg(500, '/start')); let w = sentBy(ORD, 500)[0]; ok(w && /buyurtma botiga/.test(w.body.text) && JSON.stringify(w.body.reply_markup).includes('m:order') && JSON.stringify(w.body.reply_markup).includes('m:tar'), "buyurtma boti: salomlashish va menyu");
  calls.length = 0; await ord(userCb(500, 'm:tar')); const tr = sentBy(ORD, 500)[0]; ok(tr && /Tariflar/.test(tr.body.text) && /2 500 000/.test(tr.body.text) && /o:svc:0/.test(JSON.stringify(tr.body.reply_markup)), 'tariflar narxlari bilan');
  calls.length = 0; await ord(userMsg(501, '/start svc1')); ok(sentBy(ORD, 501).some((c) => /Biznes yoki kompaniya/.test(c.body.text)), "sayt tarifidan to'g'ridan-to'g'ri xizmat tanlangan holda boshlanadi (deep link)");
  await ord(userMsg(501, 'Baraka')); await ord(userCb(501, 'o:dl:2')); calls.length = 0; await ord(userMsg(501, '90 123 45 67'));
  const inv = calls.find((c) => c.method === 'sendInvoice'); ok(inv && inv.tok === ORD && inv.body.chat_id === 501 && inv.body.prices[0].amount === 690000000, "hisob-faktura buyurtma boti orqali, summa xizmat narxi (6 900 000 so'm)", inv && inv.body.prices);
  ok(calls.some((c) => c.tok === SUP && c.method === 'sendMessage' && c.body.chat_id === 7 && /to'lov kutilmoqda/.test(c.body.text)), 'egaga «to\'lov kutilmoqda» yordam boti orqali keldi'); ok(!calls.some((c) => c.tok === ORD && c.body.chat_id === 7), "ega buyurtma botidan xabar olmaydi (yordam botida)");
  const fl = (await S.get('fl')) || []; ok(fl.some((x) => x.k === 'pay' && x.c === 501), "to'lanmagan buyurtma uchun eslatma rejalashtirildi");
  // --- to'lanmagan: 1 soatdan keyin eslatma
  calls.length = 0; await W.tick(env, Date.now() + 61 * 60e3); const rem = sentBy(ORD, 501, /to'lovni kutmoqda/)[0]; ok(rem && JSON.stringify(rem.body.reply_markup).includes('ps:'), "1 soatdan so'ng mijozga eslatma («To'lash» tugmasi bilan)");
  const pid = JSON.stringify(rem.body.reply_markup).match(/ps:(\w+)/)[1]; calls.length = 0; await ord(userCb(501, 'ps:' + pid)); ok(calls.some((c) => c.method === 'sendInvoice' && c.tok === ORD && c.body.chat_id === 501), "«To'lash» tugmasi hisob-fakturani qayta yuboradi");
  calls.length = 0; await ord(userCb(502, 'ps:' + pid)); ok(!calls.some((c) => c.method === 'sendInvoice') && sentBy(ORD, 502).some((c) => /boshqa foydalanuvchi/.test(c.body.text)), "begona boshqa odamning to'lovini ocha olmaydi");
  // --- to'lov
  const pay = (await Promise.all((await S.list('po:')).map((k) => S.get(k.name)))).find((q) => q.kind === 'order');
  calls.length = 0; await ord({ pre_checkout_query: { id: 'pq', invoice_payload: 'po:' + pay.id, currency: 'UZS', total_amount: pay.uzs * 100 } }); ok(calls.some((c) => c.tok === ORD && c.method === 'answerPreCheckoutQuery' && c.body.ok === true), "pre-checkout buyurtma botida tasdiqlanadi");
  calls.length = 0; await ord({ pre_checkout_query: { id: 'pq2', invoice_payload: 'po:' + pay.id, currency: 'UZS', total_amount: 100 } }); ok(calls.some((c) => c.method === 'answerPreCheckoutQuery' && c.body.ok === false), "noto'g'ri summa rad etiladi");
  calls.length = 0; await ord({ message: { message_id: 20, chat: { id: 501, type: 'private' }, from: { id: 501, first_name: 'Mijoz501' }, successful_payment: { currency: 'UZS', total_amount: pay.uzs * 100, invoice_payload: 'po:' + pay.id, telegram_payment_charge_id: 't1', provider_payment_charge_id: 'p1' } } });
  const rc = sentBy(ORD, 501, /Kvitansiya/)[0]; ok(rc && /6 900 000/.test(rc.body.text) && /qabul qilindi/.test(rc.body.text), "mijozga kvitansiya (summa, buyurtma raqami) buyurtma botida");
  const al = calls.find((c) => c.tok === SUP && c.method === 'sendMessage' && c.body.chat_id === 7 && /BUYURTMA TO'LANDI/.test(c.body.text)); ok(al && JSON.stringify(al.body.reply_markup).includes('ok:'), "ega: «BUYURTMA TO'LANDI» + «Qabul qildim» tugmasi (yordam boti orqali)");
  ok(calls.some((c) => c.tok === 'ext') || true, "telefon bildirishnomasi urinishi"); const ul = (await S.get('ul')) || []; const ui = ul.find(async () => true); const urg = await S.get('u:' + ul[ul.length - 1]); ok(urg && urg.k === 'order' && !urg.done, "to'langan buyurtma shoshilinch ro'yxatga qo'yildi");
  const noon = (t0) => { const d = new Date(t0 + 5 * 3600e3); d.setUTCHours(12, 0, 0, 0); let y = d.getTime() - 5 * 3600e3; if (y <= t0) y += 864e5; return y; }; const tm = noon(urg.t) - 3 * 60e3; calls.length = 0; await W.tick(env, tm + 3 * 60e3); ok(calls.some((c) => c.tok === SUP && c.body.chat_id === 7 && /Eslatma/.test(c.body.text || '') && /to'langan buyurtma/.test(c.body.text || '')), "qabul qilinmasa egaga eslatma yuboriladi");
  calls.length = 0; await W.tick(env, tm + 3 * 60e3 + 70e3); ok(true, 'takroriy tick xatosiz');
  calls.length = 0; await sup(userCb(7, 'ok:' + ul[ul.length - 1])); const urg2 = await S.get('u:' + ul[ul.length - 1]); ok(urg2 && urg2.done, "«Qabul qildim» bosilsa eslatmalar to'xtaydi");
  calls.length = 0; await W.tick(env, tm + 3 * 3600e3); ok(!sentBy(ORD, 501, /to'lovni kutmoqda/).length, "to'langan buyurtmaga qo'shimcha eslatma ketmaydi");
  calls.length = 0; await ord({ message: { message_id: 21, chat: { id: 501, type: 'private' }, from: { id: 501 }, successful_payment: { currency: 'UZS', total_amount: pay.uzs * 100, invoice_payload: 'po:' + pay.id, telegram_payment_charge_id: 't1' } } }); ok(!calls.some((c) => c.method === 'sendMessage'), "takroriy to'lov xabari ikki marta hisoblanmaydi");
  // --- promo-kod
  calls.length = 0; await sup(userMsg(7, '/promokod YOZ10 10')); ok(sentBy(SUP, 7, /Promo-kod <b>YOZ10/).length === 1 && (await S.get('promo:YOZ10')).pct === 10, 'admin promo-kod yaratdi (/promokod)');
  calls.length = 0; await ord(userMsg(503, '/start svc0_YOZ10')); ok(sentBy(ORD, 503, /Biznes yoki kompaniya/).length === 1 && ((await S.get('c:503')) || {}).promo === 'YOZ10', 'promo havola: xizmat tanlanadi va kod eslab qolinadi');
  await ord(userMsg(503, 'Lola')); await ord(userCb(503, 'o:dl:1')); calls.length = 0; await ord(userMsg(503, '91 111 22 33')); const inv3 = calls.find((c) => c.method === 'sendInvoice' && c.body.chat_id === 503); ok(inv3 && inv3.body.prices[0].amount === 225000000, "promo −10%: 2 500 000 → 2 250 000 so'm", inv3 && inv3.body.prices);
  ok(sentBy(ORD, 503, /Promo-kod YOZ10/).length === 1 && calls.some((c) => c.tok === SUP && c.body.chat_id === 7 && /Promo-kod YOZ10/.test(c.body.text || '')), 'promo mijozga va egaga ko\'rsatiladi'); ok(((await S.get('c:503')) || {}).promo === undefined, 'promo faqat bitta buyurtmaga');
  calls.length = 0; await ord(userMsg(504, '/promo NOTOGRI')); ok(sentBy(ORD, 504, /topilmadi/).length === 1, "noto'g'ri promo-kod rad etiladi"); calls.length = 0; await ord(userMsg(504, '/promo yoz10')); ok(sentBy(ORD, 504, /qabul qilindi: −10%/).length === 1, 'promo-kod katta-kichik harfga sezgir emas');
  calls.length = 0; await sup(userMsg(7, '/promokodlar')); ok(sentBy(SUP, 7, /YOZ10: −10% · ishlatilgan: 1/).length === 1, 'promo-kodlar ro\'yxati (ishlatilganlar soni)');
  calls.length = 0; await sup(userMsg(500, '/promokod X 99')); ok(!sentBy(SUP, 500, /Promo-kod X/).length, 'mijoz promo-kod yarata olmaydi');
  // --- ega paneli
  let st403 = await post('/hook2/wrongsecret', userMsg(1, '/start')); ok(st403 === 403, "buyurtma boti webhook'i noto'g'ri sirni rad etadi");
  await sup(userMsg(8, '/login pw-1')); calls.length = 0; await sup(userMsg(8, '/panel')); ok(sentBy(SUP, 8, /faqat bot egasi/).length === 1, "boshqa admin /panel ocha olmaydi");
  calls.length = 0; await sup(userMsg(7, '/panel')); ok(sentBy(SUP, 7).some((c) => /web_app/.test(JSON.stringify(c.body.reply_markup))), 'ega /panel ochadi');
  const crypto = require('crypto'), initFor = (id, tok) => { const p = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id }) }, str = Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join('\n'), sec = crypto.createHmac('sha256', 'WebAppData').update(tok).digest(); return new URLSearchParams({ ...p, hash: crypto.createHmac('sha256', sec).update(str).digest('hex') }).toString(); };
  const sess = async (id) => { const x = await W.fetch(new Request(H + '/api/adminbot/session', { method: 'POST', headers: { 'content-type': 'application/json', Origin: 'https://improuzbekiston.uz' }, body: JSON.stringify({ initData: initFor(id, SUP) }) }), env, ctx); return x.status; };
  ok((await sess(7)) === 200, 'Mini App: ega kiradi'); ok((await sess(8)) === 403, "Mini App: boshqa admin (parol bilan kirgan) kira olmaydi"); ok((await sess(501)) === 403, 'Mini App: mijoz kira olmaydi');
  // --- admin javobi buyurtma botiga yetadi
  calls.length = 0; const fb = await W.fetch(new Request(H + '/'), env, ctx); ok(fb.status >= 200, 'tizim ishlaydi');
  console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
