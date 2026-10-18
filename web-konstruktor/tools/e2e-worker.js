'use strict';
// Cloudflare Worker (yordam boti + forma relay) ni sinaydi: soxta Telegram, Claude va KV bilan.
const path = require('path');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 260)); } };
(async () => {
  require('./build-worker.js');
  const W = (await import(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs') + '?t=' + Date.now())).default;
  const calls = []; let n = 100, aiMode = false;
  globalThis.fetch = async (url, o) => {
    const u = String(url); let body = {}; try { body = o && o.body ? JSON.parse(o.body) : {}; } catch { body = {}; }
    if (o && o.body instanceof FormData) { const f = o.body.get('document'); body = { chat_id: Number(o.body.get('chat_id')), doc: f ? await f.text() : '' }; }
    if (u.includes('api.anthropic.com')) { return new Response(JSON.stringify({ content: [{ type: 'text', text: aiMode === 'handoff' ? 'Albatta, telefon raqamingizni yozing. [[HANDOFF]]' : "AI javob: Start sayt 2 500 000 so'mdan." }] }), { status: 200 }); }
    if (u.includes('/file/bot')) return new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 });
    if (u.includes('api.twilio.com')) { calls.push({ method: 'TWILIO', body: { url: u, h: o.headers, form: Object.fromEntries(new URLSearchParams(o.body)) } }); return new Response('{"sid":"CA1"}', { status: 201 }); }
    if (u.includes('api.day.app')) { calls.push({ method: 'BARK', body: JSON.parse(o.body) }); return new Response('{"code":200}', { status: 200 }); }
    if (u.includes('api.pushbullet.com')) { calls.push({ method: 'PB', body: { h: o.headers, j: JSON.parse(o.body) } }); return new Response('{}', { status: 200 }); }
    if (u.includes('ntfy.sh')) { calls.push({ method: 'PUSH', body: { url: u, h: o.headers, text: o.body } }); return new Response('{}', { status: 200 }); }
    if (u.includes('api.callmebot.com')) { calls.push({ method: 'CALL', body: { url: u } }); return new Response('ok', { status: 200 }); }
    const m = /bot([^/]+)\/(\w+)$/.exec(u); if (!m) return new Response('{}', { status: 404 });
    calls.push({ method: m[2], body });
    return new Response(JSON.stringify({ ok: true, result: /^(sendMessage|copyMessage)$/.test(m[2]) ? { message_id: ++n } : m[2] === 'getFile' ? { file_path: 'voice/x.ogg' } : true }), { status: 200 });
  };
  const kv = new Map();
  const env = { TG_TOKEN: '123:abc', WEBHOOK_SECRET: 'whsec_abcdefghijklmnop', SETUP_KEY: 'setupkey123', ADMIN_PASSWORD: 'pass-1234', ALLOW_ORIGIN: 'https://improuzbekiston.uz', STATE: { get: async (k) => (kv.has(k) ? kv.get(k).v : null), put: async (k, v, o) => { kv.set(k, { v, meta: o && o.metadata }); }, list: async ({ prefix }) => ({ keys: [...kv.entries()].filter(([k]) => k.startsWith(prefix)).map(([name, e]) => ({ name, metadata: e.meta })), list_complete: true }) } };
  const MODE = process.env.STORE === 'd1' ? 'd1' : 'kv';
  if (MODE === 'd1') { // haqiqiy SQLite (node:sqlite) bilan D1 ni taqlid qilamiz
    const { DatabaseSync } = require('node:sqlite'), sdb = new DatabaseSync(':memory:');
    env.DB = { prepare(sql) { const stt = sdb.prepare(sql); let args = []; const o = { bind(...a) { args = a; return o; }, async first() { return stt.get(...args) || null; }, async all() { return { results: stt.all(...args) }; }, async run() { return stt.run(...args); } }; return o; } };
    delete env.STATE;
  }
  const S = W.store(env);
  console.log('Saqlash rejimi:', MODE === 'd1' ? 'D1 (SQLite)' : 'KV');
  const pending = []; const ctx = { waitUntil: (p) => pending.push(p) };
  const hook = async (upd, sec = env.WEBHOOK_SECRET, hdr = env.WEBHOOK_SECRET) => { const r = await hookRaw(upd, sec, hdr); await Promise.all(pending.splice(0)); return r; };
  const hookRaw = (upd, sec, hdr) => W.fetch(new Request(`https://w.example/hook/${sec}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(hdr ? { 'X-Telegram-Bot-Api-Secret-Token': hdr } : {}) }, body: JSON.stringify(upd) }), env, ctx);
  const msg = (chat, text, id, extra) => hook({ message: { message_id: id, chat: { id: chat, type: 'private' }, from: { id: chat, first_name: 'U' + chat }, text, ...extra } });
  const sent = (chat, re) => calls.filter((c) => c.method === 'sendMessage' && c.body.chat_id === chat && (!re || re.test(c.body.text)));
  const lastTo = (chat) => sent(chat).slice(-1)[0];

  console.log('Webhook xavfsizligi');
  ok((await hook({}, 'xato')).status === 403 && (await hook({}, env.WEBHOOK_SECRET, 'xato')).status === 403 && (await hook({}, env.WEBHOOK_SECRET, '')).status === 403, "noto'g'ri yoki yo'q maxfiy kalit rad etiladi");
  ok((await hook({})).status === 200, "to'g'ri kalit qabul qilinadi");
  ok((await W.fetch(new Request('https://w.example/setup?key=x'), env, ctx)).status === 403, "/setup noto'g'ri kalit bilan rad etiladi");
  const su = await (await W.fetch(new Request('https://w.example/setup?key=setupkey123'), env, ctx)).json();
  const sw = calls.find((c) => c.method === 'setWebhook');
  ok(su.webhook && sw && sw.body.url === 'https://w.example/hook/whsec_abcdefghijklmnop' && sw.body.secret_token === env.WEBHOOK_SECRET && su.store === (process.env.STORE === 'd1' ? 'd1' : 'kv'), '/setup webhookni o\'rnatdi', su);

  console.log('Mijoz va operator');
  await msg(7002, '/start', 1); ok(/yordam botiga/.test(lastTo(7002).body.text), "mijozga salomlashuv");
  await msg(7002, 'narx qancha?', 2); ok(/Start sayt/.test(lastTo(7002).body.text) && /2 500 000/.test(lastTo(7002).body.text), "operator ulanmagan bo'lsa ham bot narxga o'zi javob beradi");
  await msg(7001, '/login xato', 3); ok(/Parol noto'g'ri/.test(lastTo(7001).body.text) && calls.some((c) => c.method === 'deleteMessage' && c.body.message_id === 3), "noto'g'ri parol rad etildi, xabar o'chirildi");
  await msg(7001, '/login pass-1234', 4); ok(/Admin sifatida kirdingiz/.test(lastTo(7001).body.text), "to'g'ri parol bilan admin bo'ldi");
  await msg(7002, 'Salom, sayt narxi qancha?', 5);
  const head = sent(7001, /Begona|U7002/).slice(-1)[0];
  ok(head && /sayt narxi qancha/.test(head.body.text), 'mijoz xabari adminga yetdi');
  const cr = sent(7002, /Start sayt/).slice(-1)[0];
  ok(cr && /2 500 000/.test(cr.body.text) && /\$10/.test(cr.body.text), 'bot narxga o\'zi javob berdi (qoidalar rejimi)');
  ok(sent(7001, /Bot javobi/).length === 1, 'admin bot javobini ko\'rdi');
  const headIdx = calls.indexOf(head), headId = 101 + calls.slice(0, headIdx + 1).filter((c) => /^(sendMessage|copyMessage)$/.test(c.method)).length - 1;
  await hook({ message: { message_id: 20, chat: { id: 7001, type: 'private' }, from: { id: 7001, first_name: 'A' }, text: "Salom! 10$ dan boshlanadi.", reply_to_message: { message_id: headId } } });
  ok(sent(7002, /Impro IT:/).some((c) => /10\$ dan boshlanadi/.test(c.body.text)), 'admin reply mijozga qaytdi');
  const c1 = sent(7002).length; await msg(7002, 'Rahmat, bot qancha turadi?', 6);
  ok(sent(7002).length === c1 && sent(7001, /bot qancha turadi/).length === 1, 'operator yozgandan keyin bot jim, xabar adminga boradi');
  await msg(7003, 'Kvant kompyuterlar haqida gapiring', 7);
  ok(/mutaxassisga yubordim/.test(lastTo(7003).body.text) && sent(7001, /Operator kerak/).length === 1, "bilmagan savol operatorga uzatildi");
  await msg(7004, 'Сколько стоит сайт?', 8); ok(/от 2 500 000/.test(lastTo(7004).body.text), 'ruscha javob');
  await msg(7001, '/auto off', 9); await msg(7005, 'narx qancha?', 10);
  ok(/qabul qilindi/.test(lastTo(7005).body.text) && !/Start sayt/.test(lastTo(7005).body.text), "/auto off: faqat tasdiq");
  await msg(7001, '/auto on', 11);
  await hook({ message: { message_id: 30, chat: { id: 7006, type: 'private' }, from: { id: 7006, first_name: 'P' }, photo: [{ file_id: 'x' }], caption: 'rasm' } });
  ok(calls.filter((c) => c.method === 'copyMessage' && c.body.chat_id === 7001 && c.body.from_chat_id === 7006).length === 1, 'mijoz rasmi adminga nusxalandi');
  let spam = 0; for (let i = 0; i < 14; i++) { await msg(7010, 'narx?', 40 + i); } ok(/Juda ko'p xabar/.test(lastTo(7010).body.text), 'spam cheklanadi');

  console.log('AI rejimi');
  env.ANTHROPIC_API_KEY = 'sk-test'; aiMode = 'ok';
  await msg(7020, 'Ilova qancha turadi?', 60); ok(/AI javob/.test(lastTo(7020).body.text), 'kalit bo\'lsa Claude javob beradi');
  aiMode = 'handoff'; await msg(7021, 'Murakkab loyiha bor', 61);
  ok(/telefon raqamingizni yozing/.test(lastTo(7021).body.text) && !/HANDOFF/.test(lastTo(7021).body.text) && sent(7001, /Operator kerak/).length === 2, 'AI handoff belgisi mijozga ko\'rinmaydi, admin ogohlantirildi');
  delete env.ANTHROPIC_API_KEY;

  console.log('Admin yordami');
  await msg(7001, 'salom, bu test', 120); ok(/Siz adminsiz/.test(lastTo(7001).body.text) && /\/test/.test(lastTo(7001).body.text), 'admin oddiy matn yozsa yo\'riqnoma oladi (jim qolmaydi)');
  const nCust = sent(7002).length; await msg(7001, '/test narx qancha?', 121);
  ok(/Mijoz ko'radigan javob/.test(lastTo(7001).body.text) && /Start sayt/.test(lastTo(7001).body.text) && sent(7002).length === nCust, "/test botning javobini adminga ko'rsatadi, mijozlarga yubormaydi");
  console.log('Sayt formasi (relay)');
  const post = (body, origin = 'https://improuzbekiston.uz', ip = '1.1.1.1') => W.fetch(new Request('https://w.example/', { method: 'POST', headers: { 'content-type': 'application/json', Origin: origin, 'CF-Connecting-IP': ip }, body: JSON.stringify(body) }), env, ctx);
  const r1 = await post({ type: 'message', name: 'Test Mijoz', phone: '+998901112233', message: '<b>salom</b>', site: 'Impro IT', page: 'https://improuzbekiston.uz/' });
  ok(r1.status === 200 && r1.headers.get('Access-Control-Allow-Origin') === 'https://improuzbekiston.uz', 'forma qabul qilindi (CORS to\'g\'ri)');
  const rl = sent(7001, /Test Mijoz/).slice(-1)[0]; ok(rl && /📞 \+998901112233/.test(rl.body.text) && /&lt;b&gt;salom/.test(rl.body.text), 'adminga yetdi, HTML ekranlandi');
  ok((await post({ name: 'A', phone: '1' })).status === 400, "ism/telefon noto'g'ri bo'lsa rad etiladi");
  ok((await post({ name: 'Test', phone: '+998901112233' }, 'https://evil.example')).status === 403, "begona sayt (Origin) rad etiladi");
  ok((await W.fetch(new Request('https://w.example/', { method: 'OPTIONS', headers: { Origin: 'https://improuzbekiston.uz' } }), env, ctx)).status === 204, 'CORS preflight');
  let last = 200; for (let i = 0; i < 9; i++) last = (await post({ name: 'Test', phone: '+998901112233' }, 'https://improuzbekiston.uz', '9.9.9.9')).status; ok(last === 429, 'bir IP dan ko\'p so\'rov cheklanadi');
  console.log('Hisobot va shoshilinch eslatmalar');
  const A1 = sent(7001).length;
  await msg(7050, 'Tezkorlik bilan sayt qilib bering', 140);
  const urgMsg = sent(7001, /SHOSHILINCH mijoz/).slice(-1)[0];
  ok(urgMsg && urgMsg.body.reply_markup.inline_keyboard[0][0].callback_data.startsWith('ok:'), 'shoshilinch so\'rov adminga 🔥 va tugma bilan yetdi');
  ok(/Shoshilinch ekaningizni qayd etdim/.test(lastTo(7050).body.text), 'mijozga shoshilinchlik qayd etilgani aytildi');
  const nu = sent(7001, /SHOSHILINCH mijoz/).length; await msg(7051, 'Sayt tezligi qancha?', 141); await msg(7052, 'Menga bugun narxni aytib bering', 142);
  ok(sent(7001, /SHOSHILINCH mijoz/).length === nu, "oddiy savollar ('sayt tezligi', 'bugun narx') shoshilinch emas");
  const safe = (t) => { const d = new Date(t + 5 * 3600e3); return d.getUTCHours() === 20 && d.getUTCMinutes() < 5 ? t + 10 * 60e3 : t; }; // 20:00-20:04 oynasi hisobotga tegishli (test vaqtga bog'liq bo'lmasligi uchun)
  const t0 = Date.now(); let nowR = t0 + 11 * 60e3; while (new Date(nowR + 5 * 3600e3).getUTCHours() < 7) nowR += 3600e3;
  const eslB = sent(7001, /Eslatma/).length; await W.tick(env, safe(nowR));
  ok(sent(7001, /Eslatma/).length > eslB && /Tezkorlik bilan sayt/.test(sent(7001, /Eslatma/).slice(-1)[0].body.text), '10 daqiqada javob berilmasa eslatma keladi');
  // admin reply shu mijozni yopadi
  const uHead = sent(7001, /Tezkorlik bilan sayt|7050/).slice(-1)[0];
  const idOf = (c) => 101 + calls.slice(0, calls.indexOf(c) + 1).filter((x) => /^(sendMessage|copyMessage)$/.test(x.method)).length - 1;
  const custHead = sent(7001, /💬 <b>U7050/).slice(-1)[0];
  await hook({ message: { message_id: 150, chat: { id: 7001, type: 'private' }, from: { id: 7001, first_name: 'A' }, text: 'Salom, hoziroq bog\'lanamiz', reply_to_message: { message_id: idOf(custHead) } } });
  ok(sent(7050, /hoziroq bog'lanamiz/).length === 1, 'admin javob berdi (mijozga yetdi)');
  const eslC = sent(7001, /Eslatma/).length; await W.tick(env, safe(nowR + 60 * 60e3 + 3600e3));
  ok(sent(7001, /Eslatma/).length === eslC, 'admin javob bergach eslatma to\'xtaydi');
  // tugma bilan yopish (forma orqali kelgan shoshilinch)
  const rUrg = await post({ type: 'brief', name: 'Forma Mijoz', phone: '+998909998877', message: 'Sayt kerak, tezkor qilib bering', extra: { Muddat: 'Shoshilinch (1 hafta)' } }, 'https://improuzbekiston.uz', '5.5.5.5');
  ok(rUrg.status === 200 && sent(7001, /SHOSHILINCH mijoz/).slice(-1)[0].body.text.includes('Forma Mijoz'), "forma orqali kelgan shoshilinch so'rov ham 🔥 bo'ldi");
  const fid = sent(7001, /Forma Mijoz/).filter((c) => /SHOSHILINCH/.test(c.body.text)).slice(-1)[0].body.reply_markup.inline_keyboard[0][0].callback_data;
  await hook({ callback_query: { id: 'cb1', data: fid, message: { message_id: 999, chat: { id: 7001 } }, from: { id: 7001 } } });
  ok(calls.some((c) => c.method === 'answerCallbackQuery' && c.body.text === 'Qayd etildi'), "tugma bosilganda qayd etildi");
  const eslD = sent(7001, /Forma Mijoz/).filter((c) => /Eslatma/.test(c.body.text)).length; await W.tick(env, safe(nowR + 5 * 3600e3));
  ok(sent(7001, /Forma Mijoz/).filter((c) => /Eslatma/.test(c.body.text)).length === eslD, 'tugma bosilgach eslatma yo\'q');
  await hook({ callback_query: { id: 'cb2', data: fid, message: { message_id: 999, chat: { id: 9999 } }, from: { id: 9999 } } });
  ok(calls.filter((c) => c.method === 'answerCallbackQuery').slice(-1)[0].body.text === "Ruxsat yo'q", "admin bo'lmagan odam tugmani bosa olmaydi");
  const td = new Date(Date.now() + 5 * 3600e3), at20 = Date.UTC(td.getUTCFullYear(), td.getUTCMonth(), td.getUTCDate(), 15, 1);
  const repB = sent(7001, /Kunlik hisobot/).length; await W.tick(env, at20);
  const rep = sent(7001, /Kunlik hisobot/).slice(-1)[0];
  ok(sent(7001, /Kunlik hisobot/).length === repB + 1 && /Mijoz suhbatlari/.test(rep.body.text) && /Saytdan so'rovlar: <b>\d+/.test(rep.body.text) && /Shoshilinch: <b>\d+/.test(rep.body.text), '20:00 da kunlik hisobot (uzbekcha) yuborildi', rep && rep.body.text);
  await W.tick(env, at20 + 120e3); ok(sent(7001, /Kunlik hisobot/).length === repB + 1, 'hisobot kuniga bir marta');
  await msg(7001, '/hisobot', 160); ok(/Kunlik hisobot/.test(lastTo(7001).body.text) && /Forma Mijoz/.test(lastTo(7001).body.text), '/hisobot buyrug\'i bugungi hisobotni beradi');
  console.log("Telegram qo'ng'irog'i (bepul)");
  const callsOf = () => calls.filter((c) => c.method === 'CALL');
  const c0 = callsOf().length; await msg(7060, 'Tezkor sayt kerak, hoziroq qilib bering', 170);
  ok(callsOf().length === c0, "CALL_USER sozlanmagan bo'lsa qo'ng'iroq qilinmaydi");
  env.CALL_USER = '+998901234567'; env.CALL_ANYTIME = '1'; await S.put('call:last', 0);
  await msg(7061, 'Tezkor sayt kerak, hoziroq qilib bering', 171);
  const cu1 = callsOf().slice(-1)[0]; const q = cu1 && new URL(cu1.body.url);
  ok(cu1 && q.hostname === 'api.callmebot.com' && cu1.body.url.includes('user=+998901234567&') && /Срочный клиент/.test(q.searchParams.get('text')) && q.searchParams.get('lang') === 'ru-RU-Standard-A' && q.searchParams.get('text').length <= 256, "shoshilinch mijozda qo'ng'iroq: matn, til va raqam to'g'ri");
  const k1 = callsOf().length; await msg(7062, 'Sayt tezligi qancha?', 172); ok(callsOf().length === k1, "oddiy savolda qo'ng'iroq yo'q");
  await S.put('call:last', 0); await msg(7001, '/qongiroq', 173); ok(callsOf().length === k1 + 1 && /Qo'ng'iroq yuborildi/.test(lastTo(7001).body.text), '/qongiroq sinov qo\'ng\'irog\'ini yuboradi');
  const td2 = new Date(Date.now() + 5 * 3600e3), at20b = Date.UTC(td2.getUTCFullYear(), td2.getUTCMonth(), td2.getUTCDate() + 1, 15, 1), cB = callsOf().length;
  await S.put('ul', []); await S.put('call:last', 0); await W.tick(env, at20b); const rc = callsOf().slice(-1)[0];
  ok(callsOf().length > cB && /Дневной отчёт/.test(new URL(rc.body.url).searchParams.get('text')), "kunlik hisobotda qo'ng'iroq ham qilinadi");
  delete env.CALL_ANYTIME; const cN = callsOf().length; await msg(7063, 'Tezkor sayt kerak, hoziroq qilib bering', 174);
  const hNow = new Date(Date.now() + 5 * 3600e3).getUTCHours(); ok((hNow >= 8 && hNow < 22) || callsOf().length === cN, "tunda (22:00-08:00) qo'ng'iroq qilinmaydi");
  delete env.CALL_USER;
  console.log('Telefon bildirishnomasi (ntfy, bepul)');
  const pushes = () => calls.filter((c) => c.method === 'PUSH');
  const p0 = pushes().length; await msg(7070, 'Tezkor sayt kerak, hoziroq qilib bering', 180); ok(pushes().length === p0, 'NTFY_TOPIC sozlanmagan bo\'lsa bildirishnoma yuborilmaydi');
  env.NTFY_TOPIC = 'impro-secret-topic-123'; env.CALL_ANYTIME = '1';
  await msg(7071, 'Tezkor sayt kerak, hoziroq qilib bering, mening raqamim +998901112233', 181);
  env.NTFY_TOKEN = 'tk_test'; await msg(7073, 'Tezkor sayt kerak, hoziroq qilib bering', 184); ok(pushes().slice(-1)[0].body.h.Authorization === 'Bearer tk_test', 'NTFY_TOKEN bo\'lsa ntfy akkaunti bilan yuboriladi (kvota IP ga bog\'liq emas)'); delete env.NTFY_TOKEN;
  const pu = pushes().slice(-1)[0];
  ok(pu && pu.body.url === 'https://ntfy.sh/impro-secret-topic-123' && pu.body.h.Priority === '5' && /^[\x20-\x7e]+$/.test(pu.body.h.Title) && pu.body.h.Click === 'https://t.me/improsupport_bot', 'shoshilinch mijozda ntfy: eng yuqori daraja, ASCII sarlavha, Telegramga havola', pu);
  ok(!/998901112233/.test(JSON.stringify(pu.body)), 'bildirishnomada telefon raqami va shaxsiy matn yo\'q');
  const p1 = pushes().length; await msg(7072, 'Sayt tezligi qancha?', 182); ok(pushes().length === p1, 'oddiy savolda bildirishnoma yo\'q');
  await msg(7001, '/qongiroq', 183); ok(pushes().length === p1 + 1 && /Sinov/.test(pushes().slice(-1)[0].body.h.Title), '/qongiroq telefon bildirishnomasini ham sinaydi');
  const td3 = new Date(Date.now() + 5 * 3600e3), at20c = Date.UTC(td3.getUTCFullYear(), td3.getUTCMonth(), td3.getUTCDate() + 2, 15, 1);
  const p2 = pushes().length; await W.tick(env, at20c); ok(pushes().length > p2 && /Kunlik hisobot/.test(pushes().slice(-1)[0].body.h.Title), 'kunlik hisobot telefonga ham yuboriladi');
  env.BARK_KEY = 'barkkey123'; await msg(7075, 'Tezkor sayt kerak, hoziroq qilib bering', 186); const bk = calls.filter((c) => c.method === 'BARK').slice(-1)[0];
  ok(bk && bk.body.device_key === 'barkkey123' && bk.body.level === 'critical' && bk.body.call === '1' && !/998/.test(JSON.stringify(bk.body)), 'Bark: shoshilinch mijozda critical + call=1 (qo\'ng\'iroqdek jiringlaydi), shaxsiy ma\'lumotsiz');
  await W.tick(env, safe(Date.now() + 3 * 3600e3)); delete env.BARK_KEY;
  env.PUSHBULLET_TOKEN = 'o.test'; const pbN = pushes().length; await msg(7074, 'Tezkor sayt kerak, hoziroq qilib bering', 185); const pb = calls.filter((c) => c.method === 'PB').slice(-1)[0];
  ok(pb && pb.body.h['Access-Token'] === 'o.test' && /Shoshilinch/.test(pb.body.j.title) && !/998/.test(pb.body.j.body) && pushes().length === pbN, 'Pushbullet tokeni bo\'lsa u orqali yuboriladi (ntfy chetlab o\'tiladi)'); delete env.PUSHBULLET_TOKEN;
  Object.assign(env, { TWILIO_SID: 'AC123', TWILIO_TOKEN: 'tok', TWILIO_FROM: '+15005550006', CALL_PHONE: '+998336233313' });
  await S.put('ul', []); const cmB = calls.filter((c) => c.method === 'CALL').length; await msg(7076, 'Tezkor sayt kerak, hoziroq qilib bering', 187);
  const tw = calls.filter((c) => c.method === 'TWILIO').slice(-1)[0];
  ok(tw && tw.body.url === 'https://api.twilio.com/2010-04-01/Accounts/AC123/Calls.json' && tw.body.h.Authorization === 'Basic ' + Buffer.from('AC123:tok').toString('base64') && tw.body.form.To === '+998336233313' && tw.body.form.From === '+15005550006' && /Срочный клиент/.test(tw.body.form.Twiml) , "Twilio: haqiqiy telefon qo'ng'irog'i (to'g'ri raqam, autentifikatsiya, matn)", tw && tw.body.form);
  ok(calls.filter((c) => c.method === 'CALL').length === cmB, 'Twilio bor bo\'lsa CallMeBot ishlatilmaydi');
  for (const k of ['TWILIO_SID', 'TWILIO_TOKEN', 'TWILIO_FROM', 'CALL_PHONE']) delete env[k];
  delete env.NTFY_TOPIC; delete env.CALL_ANYTIME;
  console.log('Yangi imkoniyatlar: menyu, telefon, bilim, mijozlar, ommaviy xabar');
  const cb = (chat, data, mid = 900) => hook({ callback_query: { id: 'cq' + Math.random(), data, from: { id: chat, first_name: 'U' + chat }, message: { message_id: mid, chat: { id: chat, type: 'private' } } } });
  await msg(7080, '/start', 190); const st0 = lastTo(7080);
  ok(/yordam botiga/.test(st0.body.text) && JSON.stringify(st0.body.reply_markup).includes('m:price') && JSON.stringify(st0.body.reply_markup).includes('m:human'), '/start tugmali menyu bilan');
  await cb(7080, 'm:price'); ok(/Start sayt/.test(lastTo(7080).body.text) && JSON.stringify(lastTo(7080).body.reply_markup).includes('m:time'), "menyu: 'Narxlar' tugmasi narxlarni ko'rsatadi");
  await cb(7080, 'm:time'); ok(/5–10/.test(lastTo(7080).body.text), "menyu: 'Muddatlar' tugmasi muddatlarni ko'rsatadi");
  await cb(7080, 'm:contact'); ok(/623 33 13/.test(lastTo(7080).body.text), "menyu: 'Aloqa' tugmasi kontaktlarni beradi");
  const hB = sent(7001, /Operator kerak/).length; await cb(7080, 'm:human'); ok(sent(7001, /Operator|operator/).length > hB, "menyu: 'Operator' tugmasi adminga uzatadi");
  await msg(7081, '90 123 45 67', 191);
  ok(/Rahmat! Raqamingizni qabul qildim/.test(lastTo(7081).body.text) && sent(7001, /Telefon qoldirdi: \+998901234567/).length === 1, "faqat telefon yozilsa: lead saqlanadi, mijozga rahmat, adminga raqam bilan ogohlantirish");
  await msg(7082, "Narx qancha? Raqamim +998 93 765 43 21", 192);
  ok(/Start sayt/.test(sent(7082).slice(-1)[0].body.text) && sent(7001, /Telefon qoldirdi: \+998937654321/).length === 1, "savol + telefon: bot javob beradi va raqam adminga yetadi");
  const botAns = sent(7082).slice(-1)[0]; ok(JSON.stringify(botAns.body.reply_markup).includes('fb:g'), "bot javobi ostida 👍/👎 tugmalari bor");
  await cb(7082, 'fb:g'); await cb(7082, 'fb:b');
  ok(calls.filter((c) => c.method === 'answerCallbackQuery' && /Rahmat! 👍/.test(c.body.text || '')).length >= 1, 'baholash qabul qilindi');
  await msg(7001, '/bilim Iyun oyida barcha saytlarga 20% chegirma', 193); ok(/Qo'shildi \(1\)/.test(lastTo(7001).body.text), "/bilim: ma'lumot qo'shildi");
  await msg(7083, "Iyun oyida chegirma bormi?", 194); ok(/20% chegirma/.test(sent(7083).slice(-1)[0].body.text), "bot yangi bilimni mijozga aytadi (qoidalar rejimi)");
  await msg(7001, '/bilim', 195); ok(/Iyun oyida barcha saytlarga/.test(lastTo(7001).body.text), "/bilim ro'yxati");
  await msg(7001, '/mijozlar', 196); ok(/Oxirgi mijozlar/.test(lastTo(7001).body.text) && /7083/.test(lastTo(7001).body.text) && /\+998901234567/.test(lastTo(7001).body.text), '/mijozlar: ro\'yxat, ID va telefon');
  await msg(7001, '/javob 7083 Aksiya haqida batafsil yozaman', 197); ok(sent(7083, /Impro IT:/).some((c) => /Aksiya haqida/.test(c.body.text)), '/javob ID bo\'yicha mijozga yubordi');
  const nb0 = sent(7084).length; await msg(7001, '/ban 7084', 198); await msg(7084, 'salom narx', 199); ok(sent(7084).length === nb0, '/ban: bloklangan mijozga bot javob bermaydi');
  await msg(7001, '/unban 7084', 200); await msg(7084, 'narx qancha?', 201); ok(sent(7084).length > nb0, '/unban: qaytadi');
  await msg(7001, '/xabar Yangi aksiya: bu hafta barcha saytlarga 20% chegirma!', 202);
  const bcm = lastTo(7001), bcd = bcm.body.reply_markup.inline_keyboard[0][0].callback_data;
  ok(/Ko'rib chiqing/.test(bcm.body.text) && bcd.startsWith('bc:'), "/xabar: avval ko'rib chiqish va tasdiq tugmasi");
  const n83 = sent(7083).length; await cb(9999, bcd); ok(sent(7083).length === n83, "admin bo'lmagan odam ommaviy xabarni tasdiqlay olmaydi");
  await cb(7001, bcd); ok(sent(7083).length > n83 && sent(7083).slice(-1)[0].body.text.includes('Yangi aksiya'), "tasdiqlangach mijozlarga yuboriladi");
  const n83b = sent(7083).length; await cb(7001, bcd); ok(sent(7083).length === n83b, 'bir xabar ikki marta yuborilmaydi');
  const d2 = new Date(Date.now() + 5 * 3600e3), off = d2.getUTCDay() === 0 || d2.getUTCHours() < 9 || d2.getUTCHours() >= 18;
  await msg(7085, 'Kvant kompyuterlar haqida gapiring', 203); ok(/ish vaqtidan tashqari/.test(lastTo(7085).body.text) === off, 'ish vaqtidan tashqari bo\'lsa mijozga ertalab javob berilishi aytiladi' + (off ? '' : ' (hozir ish vaqti: aytilmaydi)'));
  await msg(7001, '/hisobot', 204); ok(/👍 1 · 👎 1/.test(lastTo(7001).body.text), "hisobotda javob baholari ko'rinadi");
  console.log('Ovoz, tarjima, anketa, teglar, qayta aloqa, haftalik hisobot');
  let whisperFail = false;
  env.AI = { run: async (model, input) => {
    if (/whisper/.test(model)) { if (whisperFail) throw new Error('boom'); return { text: 'Salom, sayt narxi qancha turadi?' }; }
    if (/Translate/.test(input.messages[0].content)) return { response: 'TARJIMA: sayt qancha turadi' };
    return { response: 'AI javob: Start sayt 2 500 000 so\'mdan boshlanadi.' };
  } };
  await msg(7090, 'dummy', 300);
  const vm = (chat, mid, extra) => hook({ message: { message_id: mid, chat: { id: chat, type: 'private' }, from: { id: chat, first_name: 'V' + chat }, ...extra } });
  await vm(7091, 301, { voice: { file_id: 'f1', duration: 5, file_size: 2000 } });
  ok(sent(7001, /ovozli xabar/).slice(-1)[0] && /sayt narxi qancha turadi/.test(sent(7001, /ovozli xabar/).slice(-1)[0].body.text), 'ovozli xabar matnga aylantirildi va adminga ko\'rsatildi');
  ok(/Start sayt/.test(lastTo(7091).body.text), "bot ovozli savolga javob berdi");
  whisperFail = true; const cpB = calls.filter((c) => c.method === 'copyMessage').length;
  await vm(7092, 302, { voice: { file_id: 'f2', duration: 5, file_size: 2000 } });
  ok(calls.filter((c) => c.method === 'copyMessage').length === cpB + 1 && /qabul qilindi/.test(lastTo(7092).body.text), "matnga aylanmasa: ovoz adminga nusxalanadi, mijozga tasdiq");
  whisperFail = false;
  await msg(7093, 'Сколько стоит сайт?', 303);
  ok(/🌐 <i>TARJIMA: sayt qancha turadi/.test(sent(7001, /U7093/).slice(-1)[0].body.text), "ruscha xabar adminga o'zbekcha tarjima bilan boradi");
  // anketa
  const A0 = sent(7001).length;
  await msg(7094, '/anketa', 310); ok(JSON.stringify(lastTo(7094).body.reply_markup).includes('o:svc:0') && /1\/5/.test(lastTo(7094).body.text), '/anketa: 1/5 savol tugmalar bilan');
  await cb(7094, 'o:svc:2'); ok(/2\/5/.test(lastTo(7094).body.text), '2/5: biznes nomi');
  await msg(7094, 'Lola Beauty', 311); ok(/3\/5/.test(lastTo(7094).body.text) && JSON.stringify(lastTo(7094).body.reply_markup).includes('o:dl:0'), '3/5: muddat tugmalari');
  await cb(7094, 'o:dl:0'); ok(/4\/5/.test(lastTo(7094).body.text), '4/5: byudjet');
  await cb(7094, 'o:bd:1'); ok(/5\/5/.test(lastTo(7094).body.text), '5/5: telefon');
  await msg(7094, '123', 312); ok(/Raqam noto'g'ri/.test(lastTo(7094).body.text), "noto'g'ri raqam qayta so'raladi");
  ok(sent(7001).length === A0, 'anketa davomida har bir javob adminga uzatilmaydi (faqat yakunida)');
  await msg(7094, '90 111 22 33', 313);
  const an = sent(7001, /Yangi anketa/).slice(-1)[0];
  ok(an && /Telegram bot/.test(an.body.text) && /Lola Beauty/.test(an.body.text) && /Shoshilinch \(1 hafta\)/.test(an.body.text) && /\+998901112233/.test(an.body.text), "anketa yakunlandi: admin barcha ma'lumotni oldi");
  ok(/Anketa qabul qilindi/.test(lastTo(7094).body.text) && /Anketa: Telegram bot, Lola Beauty/.test(sent(7001, /SHOSHILINCH mijoz/).slice(-1)[0].body.text), 'mijozga tasdiq; shoshilinch muddat tanlansa 🔥 ham ketdi');
  await msg(7095, '/anketa', 314); await msg(7095, '/cancel', 315); ok(/bekor qilindi/.test(lastTo(7095).body.text), '/cancel anketani to\'xtatadi');
  // teglar va filtrli xabar
  await msg(7001, '/mijozlar #anketa', 320); ok(/7094/.test(lastTo(7001).body.text) && !/7093/.test(lastTo(7001).body.text) && /#anketa/.test(lastTo(7001).body.text), "/mijozlar #teg: faqat tegli mijozlar");
  await msg(7001, '/teg 7093 qiziqmadi', 321); ok(/#qiziqmadi/.test(lastTo(7001).body.text), '/teg qo\'shdi');
  await msg(7001, '/teg 7093 -qiziqmadi', 322); ok(!/#qiziqmadi/.test(lastTo(7001).body.text), "/teg -nom olib tashladi");
  await msg(7001, '/xabar #anketa Anketangiz uchun rahmat, tez orada qo\'ng\'iroq qilamiz', 323);
  const bcm2 = lastTo(7001); ok(/1 ta mijozga, #anketa/.test(bcm2.body.text), "/xabar #teg: faqat tegli mijozlar soni ko'rsatiladi");
  const n94 = sent(7094).length, n93 = sent(7093).length; await cb(7001, bcm2.body.reply_markup.inline_keyboard[0][0].callback_data);
  ok(sent(7094).length === n94 + 1 && sent(7093).length === n93, "ommaviy xabar faqat tegli mijozga yetdi");
  // qayta aloqa
  const officeAt = (from) => { let t = from; for (let i = 0; i < 24 * 8; i++, t += 3600e3) { const d = new Date(t + 5 * 3600e3); if (d.getUTCDay() !== 0 && d.getUTCHours() >= 10 && d.getUTCHours() < 17) return t; } };
  await msg(7096, 'Menga sayt kerak, raqamim 93 222 33 44', 330);
  await msg(7097, 'Narx qancha?', 331);
  await msg(7098, 'Menga sayt kerak, raqamim 93 333 44 55', 332); await msg(7001, '/javob 7098 Hozir qo\'ng\'iroq qilaman', 333);
  const fa = officeAt(Date.now() + 2 * 3600e3), nf96 = sent(7096).length, nf97 = sent(7097).length, nf98 = sent(7098).length; await W.tick(env, safe(fa));
  ok(sent(7096).length === nf96 + 1 && /Kutganingiz uchun rahmat/.test(lastTo(7096).body.text) && sent(7001, /1 soatdan beri javobsiz/).some((c) => /\+998932223344/.test(c.body.text)), "telefon qoldirgan va 1 soat javob olmagan mijozga avtomatik xabar + adminga eslatma");
  ok(sent(7098).length === nf98, 'operator javob bergan mijozga qayta aloqa yuborilmaydi');
  ok(sent(7097).length === nf97, 'narx so\'ragan mijozga 24 soatdan oldin yozilmaydi');
  const fb2 = officeAt(Date.now() + 26 * 3600e3); await W.tick(env, safe(fb2));
  ok(sent(7097).length === nf97 + 1 && /Sizga yordam kerakmi/.test(lastTo(7097).body.text), "narx so'ragan, telefon qoldirmagan mijozga 24 soatdan keyin yordam taklifi");
  const nf97b = sent(7097).length; await W.tick(env, safe(fb2 + 3600e3)); ok(sent(7097).length === nf97b, 'qayta aloqa bir marta yuboriladi');
  // haftalik
  await msg(7001, '/haftalik', 340);
  const wk = lastTo(7001).body.text; ok(/Haftalik hisobot/.test(wk) && /Eng ko'p so'ralgan mavzular/.test(wk) && /Narx: \d+/.test(wk), 'haftalik hisobot: mavzular statistikasi');
  ok(/javob bera olmagan savollar/.test(wk), "haftalik hisobot: bot javob bera olmagan savollar ro'yxati");
  let mon = Date.now(); for (let i = 0; i < 9; i++) { const d = new Date(mon + 5 * 3600e3); if (d.getUTCDay() === 1) break; mon += 864e5; }
  const dm = new Date(mon + 5 * 3600e3), mon0901 = Date.UTC(dm.getUTCFullYear(), dm.getUTCMonth(), dm.getUTCDate(), 4, 1);
  const wB = sent(7001, /Haftalik hisobot/).length; await W.tick(env, mon0901); await W.tick(env, mon0901 + 60e3);
  ok(sent(7001, /Haftalik hisobot/).length === wB + 1, 'dushanba 09:00 da haftalik hisobot avtomatik, bir marta');
  delete env.AI;
  console.log('Lidlar, loyiha, jamoa, qayta salomlashish, savol-javob bazasi, sayt chati');
  {
  env.AI = { run: async (model, input) => {
    if (/whisper/.test(model)) return { text: 'x' };
    const sys = input.messages[0].content, last = input.messages.slice(-1)[0].content;
    if (/Translate/.test(sys)) return { response: 'TARJIMA' };
    if (/javob loyihasini/.test(sys)) return { response: "Loyiha uchun avval qanday CRM kerakligini aniqlashtiramiz: soha va byudjetni ayting, telefon raqamingizni yozing." };
    if (/Murakkab/.test(last)) return { response: 'Telefon raqamingizni yozing, mutaxassis bog\'lanadi. [[HANDOFF]]' };
    return { response: 'AI javob: Start sayt 2 500 000 so\'mdan.' };
  } };
  // lidlar va eksport
  await msg(7001, '/lidlar', 400); const ld = lastTo(7001).body.text;
  ok(/Oxirgi lidlar/.test(ld) && /\+998901234567/.test(ld) && /#issiq/.test(ld) && /anketa/.test(ld), "/lidlar: telefon qoldirganlar, manba va issiqlik darajasi");
  const docB = calls.filter((c) => c.method === 'sendDocument').length; await msg(7001, '/eksport', 401);
  const dc = calls.filter((c) => c.method === 'sendDocument').slice(-1)[0];
  ok(calls.filter((c) => c.method === 'sendDocument').length === docB + 1 && dc.body.chat_id === 7001 && /^\ufeff?Sana,Ism,Telefon,Manba,Teg,Izoh/.test(dc.body.doc) && /\+998901112233/.test(dc.body.doc) && /Lola Beauty/.test(dc.body.doc), "/eksport: CSV fayl (sarlavha, telefonlar, anketa) yuborildi");
  // javob loyihasi
  await msg(7110, 'Murakkab loyiha bor, CRM kerak', 410);
  const dm = sent(7001, /Javob loyihasi/).slice(-1)[0];
  ok(dm && /aniqlashtiramiz/.test(dm.body.text) && dm.body.reply_markup.inline_keyboard[0][0].callback_data.startsWith('dr:'), "bot bilmagan savolda operatorga tayyor javob loyihasi tugma bilan keladi");
  const did = dm.body.reply_markup.inline_keyboard[0][0].callback_data;
  const nd = sent(7110).length; await cb(9999, did); ok(sent(7110).length === nd, "admin bo'lmaganlar loyihani yubora olmaydi");
  await cb(7001, did); ok(sent(7110).length === nd + 1 && /aniqlashtiramiz/.test(lastTo(7110).body.text) && /Impro IT:/.test(lastTo(7110).body.text), "'Yuborish' bosilganda loyiha mijozga ketdi");
  await cb(7001, did); ok(sent(7110).length === nd + 1, 'bitta loyiha ikki marta yuborilmaydi');
  await msg(7111, 'Murakkab loyiha: dasturiy ta\'minot', 411); const dm2 = sent(7001, /Javob loyihasi/).slice(-1)[0], nd2 = sent(7111).length;
  await cb(7001, dm2.body.reply_markup.inline_keyboard[0][1].callback_data); ok(sent(7111).length === nd2, "'Rad' bosilsa mijozga hech narsa ketmaydi");
  // jamoa: "Men oldim"
  await S.put('admins', [7001, 7500]);
  await msg(7501, 'Salom, narx haqida gaplashamiz', 420);
  const hd = sent(7001, /U7501/).slice(-1)[0], hdId = idOf(hd);
  ok(JSON.stringify(hd.body.reply_markup).includes('tk:7501'), "ikki admin bo'lsa xabar ostida 'Men oldim' tugmasi");
  await cb(7500, 'tk:7501'); ok(sent(7001, /mijozni oldi/).length >= 1, "'Men oldim': boshqa admin ogohlantirildi");
  const n501 = sent(7501).length; await hook({ message: { message_id: 421, chat: { id: 7001, type: 'private' }, from: { id: 7001, first_name: 'A' }, text: 'Men javob beraman', reply_to_message: { message_id: hdId } } });
  ok(sent(7001, /Bu mijozni .* olgan/).length >= 1 && sent(7501).length === n501, "boshqa xodim olgan mijozga javob yuborilmaydi (ogohlantirish)");
  const hd5 = sent(7500, /U7501/).slice(-1)[0];
  await hook({ message: { message_id: 422, chat: { id: 7500, type: 'private' }, from: { id: 7500, first_name: 'U7500' }, text: 'Salom, men javob beraman', reply_to_message: { message_id: idOf(hd5) } } });
  ok(sent(7501).length === n501 + 1 && /men javob beraman/.test(lastTo(7501).body.text), "mijozni olgan xodim javob bera oladi");
  await S.put('admins', [7001]);
  // qayta salomlashish
  await msg(7502, 'Salom, narx qancha?', 430); const r502 = await S.get('c:7502'); r502.lastT = Date.now() - 7 * 3600e3; await S.put('c:7502', r502, 7 * 86400);
  await msg(7502, 'Muddat qancha?', 431); ok(/^Yana salom, U7502!/.test(lastTo(7502).body.text), "qaytgan mijozga 'Yana salom, Ism!' deyiladi");
  // kechagi javobsiz savollar (10:00)
  const t1 = new Date(Date.now() + 5 * 3600e3), at10 = Date.UTC(t1.getUTCFullYear(), t1.getUTCMonth(), t1.getUTCDate() + 1, 5, 1);
  await S.put('ul', []); await W.tick(env, at10);
  ok(/Kechagi javobsiz savollar/.test(sent(7001, /Kechagi javobsiz/).slice(-1)[0] ? sent(7001, /Kechagi javobsiz/).slice(-1)[0].body.text : ''), "10:00 da kechagi javobsiz savollar ro'yxati keladi");
  // savol-javob bazasi va blog (qoidalar rejimi: AI o'chiq)
  const aiSave = env.AI; delete env.AI;
  await msg(7503, "Portfolio yoki ishlaringizni ko'rsata olasizmi?", 440); ok(/jonli namunalari/.test(lastTo(7503).body.text), "tayyor savol-javob bazasidan javob (portfolio)");
  await msg(7504, "Kichik biznes uchun SEO qadamlar haqida ma'lumot bering", 441); ok(/maqolamiz bor/.test(lastTo(7504).body.text) && /\/blog\/kichik-biznes-uchun-seo-10-qadam\//.test(lastTo(7504).body.text), "blog maqolasiga havola beradi");
  env.AI = aiSave;
  // sayt chati
  const OR = 'https://improuzbekiston.uz';
  const chatPost = (b, origin = OR, ip = '2.2.2.2') => W.fetch(new Request('https://w.example/chat', { method: 'POST', headers: { 'content-type': 'application/json', Origin: origin, 'CF-Connecting-IP': ip }, body: JSON.stringify(b) }), env, ctx);
  const chatGet = (sid, origin = OR) => W.fetch(new Request('https://w.example/chat?sid=' + sid, { headers: { Origin: origin } }), env, ctx);
  const SID1 = 'abcdefghij0123456789xyz1', SID2 = 'abcdefghij0123456789xyz2';
  const c1 = await chatPost({ sid: SID1, text: 'Narx qancha?' }); const j1 = await c1.json();
  ok(c1.status === 200 && /Start sayt/.test(j1.reply) && c1.headers.get('Access-Control-Allow-Origin') === OR, "sayt chati: mehmon savoliga bot javob beradi");
  const wh = sent(7001, /Sayt chati/).slice(-1)[0]; ok(wh && /Narx qancha/.test(wh.body.text), 'sayt chati xabari adminga Telegramda keldi');
  ok((await chatPost({ sid: SID1, text: 'x' }, 'https://evil.example')).status === 403, "begona sayt chatdan foydalana olmaydi");
  ok((await chatPost({ sid: 'qisqa', text: 'x' })).status === 400 && (await chatPost({ sid: SID1, text: '  ' })).status === 400, "noto'g'ri sid yoki bo'sh xabar rad etiladi");
  ok((await W.fetch(new Request('https://w.example/chat', { method: 'OPTIONS', headers: { Origin: OR } }), env, ctx)).status === 204, 'chat CORS preflight');
  const c2 = await chatPost({ sid: SID1, text: 'Telefonim 90 777 88 99' }); const j2 = await c2.json();
  ok(/Rahmat/.test(j2.reply) && sent(7001, /Sayt chati/).slice(-1)[0].body.text.includes('+998907778899'), "chatda telefon qoldirilsa: rahmat va adminga raqam");
  await msg(7001, '/lidlar', 450); ok(/\+998907778899/.test(lastTo(7001).body.text) && /chat/.test(lastTo(7001).body.text), "chatdan kelgan lid /lidlar da ko'rinadi (manba: chat)");
  const hdw = sent(7001, /Sayt chati/).slice(-1)[0];
  await hook({ message: { message_id: 451, chat: { id: 7001, type: 'private' }, from: { id: 7001, first_name: 'A' }, text: 'Salom! Hozir qo\'ng\'iroq qilaman', reply_to_message: { message_id: idOf(hdw) } } });
  const g1 = await (await chatGet(SID1)).json(), g2 = await (await chatGet(SID1)).json();
  ok(g1.msgs.length === 1 && /qo'ng'iroq qilaman/.test(g1.msgs[0]) && g2.msgs.length === 0, "operator javobi saytga yetdi (bir marta)");
  const c3 = await chatPost({ sid: SID1, text: 'Rahmat, yana savol: muddat?' }); const j3 = await c3.json();
  ok(j3.operator === true && j3.reply === '', 'operator yozgandan keyin bot sayt chatida jim');
  const c4 = await (await chatPost({ sid: SID2, text: 'Murakkab loyiha: CRM tizimi' })).json();
  ok(c4.handoff === true && /Telefon raqamingizni yozing/.test(c4.reply) && sent(7001, /Javob loyihasi.*sayt chati/s).length >= 1, "sayt chatida bilmagan savol: operatorga loyiha ketdi");
  const dmw = sent(7001, /Javob loyihasi/).slice(-1)[0]; await cb(7001, dmw.body.reply_markup.inline_keyboard[0][0].callback_data);
  const g3 = await (await chatGet(SID2)).json(); ok(g3.msgs.length === 1 && /aniqlashtiramiz/.test(g3.msgs[0]), "loyiha sayt mehmoniga yetib bordi");
  let lastS = 200; for (let i = 0; i < 22; i++) lastS = (await chatPost({ sid: 'rateLimitTest0123456789' + (i % 1), text: 'salom ' + i }, OR, '3.3.3.' + i)).status; ok(lastS === 429, 'bir mehmon ko\'p xabar yuborsa cheklanadi');
  await msg(7001, '/hisobot', 452); ok(/Javoblar: .*U7500 1/.test(lastTo(7001).body.text), "hisobotda xodimlar javoblari soni ko'rinadi");
  delete env.AI;
  }
  console.log('Workers AI (bepul)');
  const aiRuns = []; env.AI = { run: async (model, input) => { aiRuns.push(model); return { response: "Workers AI: SEO uchun sayt tayyor, qo'shimcha sozlash kerak bo'lishi mumkin." }; } };
  await msg(7040, 'Sayt SEO uchun yaxshimi?', 130); ok(/Workers AI: SEO/.test(lastTo(7040).body.text) && aiRuns.length === 1, "kalitsiz ham Workers AI mijoz savoliga javob beradi");
  delete env.AI;
  console.log('KV yozuv xatosi (fail-open)');
  const injectRL = (on) => { if (MODE === 'd1') { if (on) { env.DB._prepare = env.DB.prepare; env.DB.prepare = (sql) => { const o = env.DB._prepare(sql), b = o.bind; o.bind = (...a) => { const r = b(...a); if (/INSERT INTO kv/.test(sql) && String(a[0]).startsWith('rl:')) r.run = async () => { throw new Error('D1 write failed'); }; return r; }; return o; }; } else env.DB.prepare = env.DB._prepare; } else if (on) { env._put = env.STATE.put; env.STATE.put = async (k, v, o) => { if (k.startsWith('rl:')) throw new Error('KV put() limit exceeded'); return env._put(k, v, o); }; } else env.STATE.put = env._put; };
  injectRL(true);
  await msg(7030, "Qancha vaqtda tayyor bo'ladi?", 80); ok(/5–10/.test(lastTo(7030).body.text), "cheklash KV si ishlamasa ham mijozga javob beriladi");
  ok((await post({ name: 'Test Mijoz', phone: '+998901112233', message: 'x' }, 'https://improuzbekiston.uz', '7.7.7.7')).status === 200, "cheklash KV si ishlamasa ham forma qabul qilinadi (500 emas)");
  await hook({ message: { message_id: 91, chat: { id: 7032, type: 'private' }, from: { id: 7032, first_name: 'M' }, text: '/login pass-1234' } });
  ok(/Juda ko'p urinish/.test(lastTo(7032).body.text) && !JSON.stringify(await S.get('admins') || '').includes('7032'), "KV xatosida /login rad etiladi (fail-closed), admin bo'lmaydi");
  injectRL(false);
  await hook({ message: { message_id: 90, chat: { id: 7031, type: 'private' }, from: { id: 7031, first_name: 'L' }, text: '/login pass-1234' } });
  ok(calls.filter((c) => c.method === 'deleteMessage' && c.body.message_id === 90).length === 1, "/login xabari o'chirildi (webhook javobidan oldin)");
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('XATO', e); process.exit(1); });
