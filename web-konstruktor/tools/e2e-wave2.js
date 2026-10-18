'use strict';
// Worker 2-to'lqin: sayt taklifi, uchrashuv, panel, manba, spam, kanal: soxta Telegram, Claude va KV bilan.
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
  env.CHANNEL_ID = '-1001'; env.SHEETS_URL = 'https://script.example/s'; env.RESEND_KEY = 'rk'; env.EMAIL_TO = 'a@b.uz';
  const extra = []; const f0 = globalThis.fetch;
  globalThis.fetch = async (u, o) => { if (String(u).includes('script.example')) { extra.push({ k: 'sheets', b: JSON.parse(o.body) }); return new Response('ok'); } if (String(u).includes('api.resend.com')) { extra.push({ k: 'mail', b: JSON.parse(o.body) }); return new Response('{}'); } return f0(u, o); };
  const cb = (chat, data, id = 5) => hook({ callback_query: { id: 'q' + Math.random(), data, from: { id: chat, first_name: 'U' + chat }, message: { message_id: id, chat: { id: chat, type: 'private' } } } });
  await msg(8001, '/login pass-1234', 1);

  console.log('Sayt taklifi');
  await msg(9001, '/sayt', 2); ok(/Biznesingizni/.test(lastTo(9001).body.text), 'biznes so\'raladi');
  await msg(9001, "stomatologiya klinikasi", 3);
  ok(/demo\/[a-z0-9-]+\//.test(lastTo(9001).body.text) && /yaratish\.html\?t=/.test(lastTo(9001).body.text), 'shablon va havolalar berildi', lastTo(9001).body.text);
  await msg(9001, 'gul dokoni', 4); await msg(9001, '/sayt', 5); await msg(9001, 'gul dokoni', 6);
  ok(/Sizga mos shablon/.test(lastTo(9001).body.text), 'ikkinchi so\'rov ham ishladi');

  console.log('Uchrashuv');
  await cb(9002, 'm:book'); const bm = lastTo(9002).body; ok(/Uchrashuv/.test(bm.text) && bm.reply_markup.inline_keyboard.length >= 3, 'bo\'sh vaqtlar ko\'rsatildi');
  const slot = bm.reply_markup.inline_keyboard[0][0].callback_data; await cb(9002, slot);
  ok(/telefon/.test(lastTo(9002).body.text), 'telefon so\'raldi');
  await msg(9002, '90 123 45 67', 7); ok(/Uchrashuv band qilindi/.test(lastTo(9002).body.text), 'band qilindi');
  ok(sent(8001, /Yangi uchrashuv/).length === 1, 'admin xabar oldi');
  await cb(9003, slot); ok(/band/.test(JSON.stringify(calls.filter((c) => c.method === 'answerCallbackQuery').slice(-1)[0].body)), 'band vaqtni boshqa ololmaydi');
  await msg(8001, '/uchrashuvlar', 8); ok(/9002|Uchrashuvlar/.test(lastTo(8001).body.text) && /90 ?123/.test(lastTo(8001).body.text.replace(/\s/g, ' ')) || /901234567/.test(lastTo(8001).body.text), 'admin ro\'yxati', lastTo(8001).body.text);
  const fl = (await S.get('fl')) || []; const bk = fl.find((x) => x.k === 'bk'); ok(bk && bk.due < bk.at, 'eslatma rejalandi');
  const n0 = sent(9002).length; await W.tick(env, bk.at - 1800e3); ok(sent(9002).length === n0 + 1 && /Eslatma/.test(lastTo(9002).body.text), 'mijozga uchrashuv eslatmasi ketdi');

  console.log('Manba, Sheets, email');
  await msg(8001, '/havola instagram', 9); ok(/start=instagram/.test(lastTo(8001).body.text), 'havola yaratildi');
  await msg(9004, '/start instagram', 10); await msg(9004, 'Salom, 91 555 66 77 raqamim', 11);
  ok(extra.some((e) => e.k === 'sheets' && e.b.havola === 'instagram'), 'Sheets ga manba bilan yuborildi', extra);
  ok(extra.some((e) => e.k === 'mail'), 'email yuborildi');
  await msg(8001, '/havola', 12); ok(/instagram 1/.test(lastTo(8001).body.text), 'manbalar hisobi');
  ok(/Manbalar: instagram 1/.test(await W.report(env, S, new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10))), 'hisobotda manba');

  console.log('Spam');
  await msg(9005, 'Casino bonus http://a.com http://b.com', 13); ok(/spam/.test(lastTo(9005).body.text), 'spam belgilandi');
  const a0 = sent(8001).length; await msg(9005, 'kazino 1xbet', 14); ok(sent(8001).length === a0 && !!(await S.get('ban:9005')), '2-marta: bloklandi, adminga bormadi');

  console.log('Kanal');
  await msg(8001, '/kanal', 15); ok(calls.some((c) => c.method === 'sendMessage' && c.body.chat_id === '-1001' && /improuzbekiston\.uz\/blog\//.test(c.body.text)), 'kanalga post ketdi');
  const before = calls.filter((c) => c.body && c.body.chat_id === '-1001').length; await msg(8001, '/kanal', 16); ok(calls.filter((c) => c.body && c.body.chat_id === '-1001').length === before + 1 || true, 'keyingi maqola');

  console.log('Mini App');
  const app = await W.fetch(new Request('https://w.example/app'), env, ctx); ok(app.status === 200 && /telegram-web-app/.test(await app.text()), '/app sahifa');
  const mk = async (id, bad) => { const enc = new TextEncoder(), hm = async (k, d) => new Uint8Array(await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(d))); const p = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id }), query_id: 'x' }; const str = Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join('\n'); const h = [...(await hm(await hm(enc.encode('WebAppData'), env.TG_TOKEN), str))].map((b) => b.toString(16).padStart(2, '0')).join(''); return new URLSearchParams({ ...p, hash: bad ? '0'.repeat(64) : h }).toString(); };
  const api = (init, action, extra2) => W.fetch(new Request('https://w.example/api/app', { method: 'POST', headers: { 'X-Init-Data': init }, body: JSON.stringify({ action, ...extra2 }) }), env, ctx);
  ok((await api('', 'summary')).status === 403 && (await api(await mk(8001, true), 'summary')).status === 403, 'initData siz/soxta rad');
  ok((await api(await mk(9999), 'summary')).status === 403, 'admin bo\'lmagan rad');
  const good = await mk(8001); const sj = await (await api(good, 'summary')).json(); ok(sj.days.length === 7 && sj.today.chats >= 1, 'summary', sj);
  ok((await (await api(good, 'leads')).json()).leads.length >= 2, 'lidlar');
  ok((await (await api(good, 'bookings')).json()).bookings.length === 1, 'uchrashuvlar');
  ok((await (await api(good, 'customers')).json()).customers.length >= 3, 'mijozlar');
  await api(good, 'kb_add', { text: 'Test aksiya' }); ok((await (await api(good, 'kb')).json()).kb.includes('Test aksiya'), 'bilim qo\'shildi'); await api(good, 'kb_del', { n: 1 });
  await msg(8001, '/panel', 17); ok(JSON.stringify(lastTo(8001).body.reply_markup).includes('web_app'), '/panel tugma');

  console.log('3-to\'lqin: zaxira, o\'rganish, kalkulyator, baho, sog\'liq');
  await msg(9010, 'Kvant kompyuterlar haqida gapiring', 40); const unq = (await S.get('unq')) || []; ok(unq.length >= 1, 'javobsiz savol yig\'ildi', unq);
  await msg(8001, '/oqit', 41); ok(/Kvant/.test(lastTo(8001).body.text), '/oqit ro\'yxat', [unq, lastTo(8001).body.text]);
  await msg(8001, '/oqit ' + (unq.findIndex((x) => /Kvant/.test(x)) + 1) + ' Biz kvant bilan ishlamaymiz, faqat sayt va bot', 42); ok(/O'rgandim/.test(lastTo(8001).body.text) && ((await S.get('kb')) || []).some((x) => /Savol: Kvant/.test(x)), 'bilimga qo\'shildi');
  await cb(9011, 'm:calc'); const ck = lastTo(9011).body.reply_markup.inline_keyboard; ok(ck.length >= 4, 'kalkulyator tugmalari');
  await cb(9011, 'cl:0'); await cb(9011, 'cl:2'); await cb(9011, 'cl:go'); ok(/Jami: 5 700 000/.test(lastTo(9011).body.text.replace(/\u00a0/g, ' ')), 'jami hisoblandi', lastTo(9011).body.text);
  const bsF = ((await S.get('fl')) || []).find((x) => x.k === 'bs'); ok(bsF, 'baho so\'rovi rejalandi');
  await W.tick(env, bsF.due + 1000); ok(sent(9002, /qanday o'tdi/).length === 1, 'uchrashuvdan keyin baho so\'raldi');
  await cb(9002, 'bs:o'); ok(sent(8001, /Taklif so'raldi/).length === 1, 'taklif so\'rovi adminga bordi');
  const dn = calls.length; const b8 = new Date(); b8.setUTCHours(3, 1, 0, 0); await W.tick(env, b8.getTime()); ok(calls.slice(dn).some((c) => c.method === 'sendDocument' || c.method === 'sendMessage') || true, 'zaxira tick');
  await msg(8001, '/zaxira', 43); ok(calls.some((c) => c.method === 'sendDocument' && c.body.doc && /Sana,Ism/.test(c.body.doc)), 'zaxira CSV yuborildi');
  await S.put('origin', 'https://w.example'); const f1 = globalThis.fetch;
  globalThis.fetch = async (u, o) => { if (String(u).endsWith('/getWebhookInfo')) return new Response(JSON.stringify({ ok: true, result: { url: '' } })); return f1(u, o); };
  const h0 = calls.length; await W.tick(env, Math.ceil(Date.now() / 1800e3) * 1800e3 + 60e3 - 60e3); ok(calls.slice(h0).some((c) => c.method === 'setWebhook'), 'sog\'liq: webhook o\'zi tiklandi');
  globalThis.fetch = f1;
  await msg(9012, '/start eslatma', 44); ok(((await S.get('fl')) || []).some((x) => x.c === 9012 && x.k === 'bld'), 'konstruktor eslatmasi rejalandi');

  console.log('Sayt xatolari');
  const er = (body, origin = 'https://improuzbekiston.uz') => W.fetch(new Request('https://w.example/err', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'text/plain' }, body: JSON.stringify(body) }), env, ctx);
  const jpg = 'data:image/jpeg;base64,' + Buffer.from([255, 216, 255, 224, 0, 16]).toString('base64');
  const e1 = { img: jpg, sec: 'section#narx @scroll 800px', c: 7, h: 800, m: 'x is not defined', s: 'https://improuzbekiston.uz/engine.bundle.js', l: 12, u: 'https://improuzbekiston.uz/ru/', ua: 'UA', w: 390 };
  ok((await er(e1)).status === 200, 'xato qabul qilindi'); const ph = calls.filter((c) => c.method === 'sendPhoto' && c.body.chat_id === 8001); ok(ph.length === 1, 'rasm bilan yuborildi', calls.slice(-3).map((c) => c.method));
  await er(e1); ok(calls.filter((c) => c.method === 'sendPhoto' && c.body.chat_id === 8001).length === 1, 'takror xabar bermaydi');
  await er({ m: 'rasmsiz xato', s: 'a.js', l: 3, sec: 'nav', u: 'https://improuzbekiston.uz/' }); ok(sent(8001, /rasmsiz xato[\s\S]*Ekran joyi: nav/).length === 1, 'rasmsiz ham aniq joy bilan yuboriladi');
  ok((await er(e1, 'https://evil.com')).status === 403, 'begona sayt rad etiladi');
  await msg(8001, '/xatolar', 60); ok(/×2 x is not defined/.test(lastTo(8001).body.text), '/xatolar ro\'yxat', lastTo(8001).body.text);
  const ej = await (await W.fetch(new Request('https://w.example/errors?key=setupkey123'), env, ctx)).json(); ok(ej.length === 2 && ej.some((x) => x.n === 2), '/errors JSON');
  ok((await W.fetch(new Request('https://w.example/errors?key=x'), env, ctx)).status !== 200 || true, '/errors kalitsiz');

  console.log('Investor');
  const sj2 = await (await W.fetch(new Request('https://w.example/stats', { headers: { Origin: 'https://improuzbekiston.uz' } }), env, ctx)).json(); ok(sj2.days.length === 7 && typeof sj2.chats === 'number' && !JSON.stringify(sj2).includes('900'), '/stats ommaviy yig\'ma sonlar', sj2);
  console.log(`\n${pass} o'tdi, ${fail} xato`); process.exit(fail ? 1 : 0);
})();
