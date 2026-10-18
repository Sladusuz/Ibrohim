// Impro IT: Cloudflare Worker. Ikki vazifa:
//  1) Telegram yordam boti (webhook): mijoz savoliga avtomatik javob (AI yoki qoidalar), murakkab savol adminga uzatiladi.
//  2) Statik saytdagi forma so'rovlarini Telegram'ga yetkazish (POST /).
// Holat (yozishmalar, adminlar) KV (STATE) da saqlanadi. Bu fayl tools/build-worker.js bilan yig'iladi: makeAssistant, SITE, PRICING shu yerga kiritiladi.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const KIND = { order: '🛒 Yangi buyurtma', booking: '📅 Yangi ariza', message: '✉️ Yangi xabar', brief: "📝 Yangi loyiha so'rovi" };

/* ---------- Holat (KV yoki xotira) ---------- */
const MEM = new Map();
// Saqlash: Cloudflare D1 (kuniga 100 000 yozuv, bepul) -> KV (kuniga 1000 yozuv) -> xotira. Hammasi bir xil interfeys: get/put/list.
let D1READY = false;
const d1store = (env) => {
  const db = env.DB, init = async () => { if (!D1READY) { await db.prepare('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, exp INTEGER DEFAULT 0, meta TEXT)').run(); D1READY = true; } };
  return {
    get: async (k) => { await init(); const r = await db.prepare('SELECT v, exp FROM kv WHERE k = ?1').bind(k).first(); if (!r || (r.exp && r.exp < Date.now())) return null; try { return JSON.parse(r.v); } catch { return null; } },
    put: async (k, v, ttl, meta) => { await init(); await db.prepare('INSERT INTO kv (k, v, exp, meta) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(k) DO UPDATE SET v = excluded.v, exp = excluded.exp, meta = excluded.meta').bind(k, JSON.stringify(v), ttl ? Date.now() + Math.floor(ttl * 1000) : 0, meta ? JSON.stringify(meta) : null).run(); },
    list: async (prefix) => { await init(); const r = await db.prepare('SELECT k, meta FROM kv WHERE k >= ?1 AND k < ?2 AND (exp = 0 OR exp > ?3) ORDER BY k DESC LIMIT 3000').bind(prefix, prefix + '\uffff', Date.now()).all(); return (r.results || []).map((x) => ({ name: x.k, metadata: x.meta ? JSON.parse(x.meta) : undefined })); },
    gc: async () => { await init(); await db.prepare('DELETE FROM kv WHERE exp > 0 AND exp < ?1').bind(Date.now()).run(); },
  };
};
const store = (env) => env.DB ? d1store(env) : env.STATE
  ? { get: async (k) => { const v = await env.STATE.get(k); if (v == null) return null; try { return JSON.parse(v); } catch { return null; } },
      put: (k, v, ttl, meta) => env.STATE.put(k, JSON.stringify(v), { ...(ttl ? { expirationTtl: Math.max(60, Math.floor(ttl)) } : {}), ...(meta ? { metadata: meta } : {}) }),
      list: async (prefix) => { const out = []; let cursor; do { const r = await env.STATE.list({ prefix, cursor, limit: 1000 }); out.push(...r.keys); cursor = r.list_complete ? undefined : r.cursor; } while (cursor && out.length < 3000); return out; } }
  : { get: async (k) => { const e = MEM.get(k); if (!e) return null; if (e.x && e.x < Date.now()) { MEM.delete(k); return null; } return e.v; },
      put: async (k, v, ttl, meta) => { MEM.set(k, { v, m: meta, x: ttl ? Date.now() + ttl * 1000 : 0 }); },
      list: async (prefix) => [...MEM.entries()].filter(([k, e]) => k.startsWith(prefix) && !(e.x && e.x < Date.now())).map(([name, e]) => ({ name, metadata: e.m })) };
// Hisoblagich: oyna ichida max martadan oshsa true
// KV yozuv chegarasi (bir kalitga ~1/soniya) yoki xato bo'lsa cheklash o'chadi (fail-open): mijozga javob har holda boradi
// failClosed: parol urinishlari kabi muhim cheklovlarda KV xatosi bo'lsa ham rad etiladi
async function limited(st, key, max, sec, failClosed) { try { const now = Date.now(), r = (await st.get('rl:' + key)) || { n: 0, t: now }; if (now - r.t > sec * 1000) { r.n = 0; r.t = now; } r.n++; await st.put('rl:' + key, r, sec); return r.n > max; } catch { return !!failClosed; } }
const tEq = (a, b) => { a = String(a); b = String(b); if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

/* ---------- Kunlik hisobot va shoshilinch eslatmalar ---------- */
const APP_ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost']; // iOS/Android ilova (Capacitor)
const TZ = 5 * 3600e3; // Toshkent UTC+5
const tz = (t = Date.now()) => new Date(t + TZ);
const dkey = (t = Date.now()) => tz(t).toISOString().slice(0, 10);
const hm = (t) => tz(t).toISOString().slice(11, 16);
// Hodisa yozuvi: har biri alohida kalit (yozuv to'qnashuvi bo'lmaydi), ma'lumot metadata'da
async function ev(st, e) { try { await st.put(`ev:${dkey()}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, 1, 9 * 86400, { t: Date.now(), k: e.k, c: e.c || 0, n: String(e.n || '').slice(0, 40), p: String(e.p || '').slice(0, 25), x: String(e.x || '').replace(/\s+/g, ' ').slice(0, 110) }); } catch { /* hisobot ixtiyoriy */ } }
const URG = /(?<![\p{L}])(tezkor\p{L}*|shoshilinch\p{L}*|zudlik\p{L}*|hoziroq|bugun|ertagayoq|ertaga|tez|срочн\p{L}*|быстрее|сегодня|завтра|urgent\p{L}*|asap|as soon as|today|tomorrow)(?![\p{L}])/iu;
const WANT = /(qilib ber\p{L}*|yasab ber\p{L}*|yarat\p{L}*|ochib ber\p{L}*|tayyorla\p{L}*|kerak|buyurtma|сделайт\p{L}*|создайт\p{L}*|нужен|нужна|нужно|закаж\p{L}*|need|build|make|create|order)/iu;
const isUrgent = (t) => URG.test(t) && WANT.test(t);
// Telegram ovozli qo'ng'iroq (bepul, CallMeBot): CALL_USER = telefon (+998...) yoki @username. Tunda (22:00-08:00) va kuniga 8 martadan ortiq qo'ng'iroq qilinmaydi.
// Haqiqiy telefon qo'ng'irog'i (Twilio): TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM (Twilio raqami), CALL_PHONE (+998...). Sinov hisobida faqat tasdiqlangan raqamga qo'ng'iroq qilinadi.
async function twilioCall(env, text) {
  if (!env.TWILIO_SID || !env.TWILIO_TOKEN || !env.TWILIO_FROM || !env.CALL_PHONE) return false;
  const say = String(text).replace(/[<>&]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  const twiml = `<Response><Pause length="1"/><Say language="ru-RU" voice="Polly.Tatyana">${say}</Say><Pause length="1"/><Say language="ru-RU" voice="Polly.Tatyana">${say}</Say></Response>`;
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Calls.json`, { method: 'POST', headers: { Authorization: 'Basic ' + btoa(env.TWILIO_SID + ':' + env.TWILIO_TOKEN), 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ To: env.CALL_PHONE, From: env.TWILIO_FROM, Twiml: twiml, Timeout: '40' }).toString(), signal: AbortSignal.timeout(20000) });
    if (!r.ok) await store(env).put('diag:twilio', { status: r.status, body: (await r.text().catch(() => '')).slice(0, 300), t: Date.now() }, 7 * 86400).catch(() => {});
    return r.ok;
  } catch { return false; }
}
async function callOwner(env, st, text, now = Date.now()) {
  if (env.TWILIO_SID) { // haqiqiy qo'ng'iroq birinchi o'rinda (tunda 22:00-08:00 va kuniga 8 martadan ortiq emas)
    const h = tz(now).getUTCHours(); if ((h < 8 || h >= 22) && !env.CALL_ANYTIME) return false;
    if (await limited(st, 'tcall:' + dkey(now), 8, 86400, true)) return false;
    return twilioCall(env, text);
  }
  const to = String(env.CALL_USER || '').trim(); if (!to) return false;
  const h = tz(now).getUTCHours(); if ((h < 8 || h >= 22) && !env.CALL_ANYTIME) return false;
  if (await limited(st, 'call:' + dkey(now), 8, 86400, true)) return false;
  try { const last = await st.get('call:last'); if (last && now - last < 70000) return false; await st.put('call:last', now, 600); } catch { /* CallMeBot: bir foydalanuvchiga 65 soniyada ikki qo'ng'iroq mumkin emas */ }
  try { const r = await fetch(`http://api.callmebot.com/start.php?user=${to.replace(/[^+@\w]/g, '')}&text=${encodeURIComponent(String(text).replace(/\s+/g, ' ').trim().slice(0, 250))}&lang=${encodeURIComponent(env.CALL_LANG || 'ru-RU-Standard-A')}&rpt=2&cc=no`, { signal: AbortSignal.timeout(20000) }); return r.ok; } catch { return false; }
}
// Telefonga kuchli bildirishnoma (bepul, ntfy.sh): NTFY_TOPIC = maxfiy mavzu nomi. Ilovada shu mavzuga obuna bo'linadi; Priority 5 telefonni ovozli jiringlatadi.
// Shaxsiy ma'lumot (telefon, matn) yuborilmaydi: faqat ogohlantirish, tafsilot Telegramda.
async function pushPhone(env, title, text, priority = 5, tags = 'rotating_light') {
  let sent = false;
  if (env.BARK_KEY) { // Bark (iPhone, bepul): level=critical + call=1 telefon qo'ng'irog'iday jiringlaydi (jim rejim va Focus'ni ham chetlab o'tadi)
    try {
      const lvl = priority >= 5 ? 'critical' : priority === 4 ? 'timeSensitive' : 'active';
      const r = await fetch('https://api.day.app/push', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ device_key: env.BARK_KEY, title: String(title), body: String(text), group: 'Impro IT', level: lvl, ...(priority >= 5 ? { volume: 10, call: '1' } : {}), url: 'https://t.me/improsupport_bot' }), signal: AbortSignal.timeout(15000) });
      sent = r.ok; if (!r.ok) await store(env).put('diag:bark', { status: r.status, body: (await r.text().catch(() => '')).slice(0, 200), t: Date.now() }, 7 * 86400).catch(() => {});
    } catch { /* boshqa kanallarga o'tamiz */ }
  }
  if (env.PUSHBULLET_TOKEN) { // Pushbullet (bepul akkaunt tokeni): ntfy.sh Cloudflare IP'larini cheklagani uchun muqobil
    try { const r = await fetch('https://api.pushbullet.com/v2/pushes', { method: 'POST', headers: { 'Access-Token': env.PUSHBULLET_TOKEN, 'content-type': 'application/json' }, body: JSON.stringify({ type: 'note', title: String(title), body: String(text) }), signal: AbortSignal.timeout(15000) }); sent = r.ok; if (!r.ok) await store(env).put('diag:pushbullet', { status: r.status, body: (await r.text().catch(() => '')).slice(0, 200), t: Date.now() }, 7 * 86400).catch(() => {}); } catch { /* ntfy ga o'tamiz */ }
  }
  const t = String(env.NTFY_TOPIC || '').trim(); if (!t) return sent;
  if (sent) return true;
  const diag = (v) => store(env).put('diag:push', { ...v, t: Date.now() }, 7 * 86400).catch(() => {});
  try { const r = await fetch('https://ntfy.sh/' + encodeURIComponent(t), { method: 'POST', headers: { Title: String(title).replace(/[^\x20-\x7e]/g, ''), Priority: String(priority), Tags: tags, Click: 'https://t.me/improsupport_bot', ...(env.NTFY_TOKEN ? { Authorization: 'Bearer ' + env.NTFY_TOKEN } : {}) }, body: text, signal: AbortSignal.timeout(15000) }); if (!r.ok) await diag({ status: r.status, body: (await r.text().catch(() => '')).slice(0, 200) }); return r.ok; } catch (e) { await diag({ err: String(e && e.message).slice(0, 200) }); return false; }
}
const spell = (p) => String(p || '').replace(/\D/g, '').split('').join(' '); // telefon raqamini raqam-raqam o'qitish uchun
const REMIND = [1, 3, 6, 10, 15, 25, 40, 60, 90, 120]; // daqiqalarda: javob berilmaguncha tez-tez eslatiladi (cron har daqiqada) // daqiqalarda: javob berilmasa takroriy eslatma
async function raiseUrgent(env, st, { chat, name, phone, text }) {
  const id = Date.now().toString(36), u = { c: chat || 0, n: name || '', p: phone || '', x: String(text || '').slice(0, 300), t: Date.now(), r: 0, done: 0 };
  await st.put('u:' + id, u, 2 * 86400);
  await st.put('ul', [...((await st.get('ul')) || []), id].slice(-50));
  await ev(st, { k: 'urgent', c: chat, n: name, p: phone, x: text });
  for (const a of await adminsOf(env, st)) await say(env, a, `🔥 <b>SHOSHILINCH mijoz!</b>\n👤 ${esc(name || 'Mijoz')}${phone ? ' · 📞 ' + esc(phone) : ''}${chat ? ` · <code>${chat}</code>` : ''}\n\n${esc(u.x)}\n\n${chat ? 'Javob berish uchun mijoz xabariga <b>reply</b> qiling. ' : ''}Javob berilmasa, eslatib turaman.`, { reply_markup: { inline_keyboard: [[{ text: "✅ Ko'rdim, hal qilaman", callback_data: 'ok:' + id }]] } });
  await pushPhone(env, 'Shoshilinch mijoz!', `Shoshilinch mijoz keldi${name ? ': ' + name : ''}. Telegramni oching.`, 5);
  await callOwner(env, st, `Внимание! Срочный клиент. ${name || ''}. ${phone ? 'Телефон ' + spell(phone) + '. ' : ''}Откройте Телеграм.`);
  return id;
}
async function closeUrgentOf(st, chat) { for (const id of (await st.get('ul')) || []) { const u = await st.get('u:' + id); if (u && !u.done && u.c === chat) { u.done = 1; await st.put('u:' + id, u, 2 * 86400); } } }
async function stats(st, day) {
  const keys = (await st.list(`ev:${day}:`)).map((k) => k.metadata).filter(Boolean).sort((a, b) => a.t - b.t);
  const n = (k) => keys.filter((e) => e.k === k).length;
  return { rp: keys.filter((e) => e.k === 'reply').reduce((o, e) => { o[e.n] = (o[e.n] || 0) + 1; return o; }, {}), good: n('good'), bad: n('bad'), keys, msg: n('msg'), bot: n('bot'), chats: new Set(keys.filter((e) => e.k === 'msg').map((e) => e.c)).size, leads: keys.filter((e) => e.k === 'lead'), hand: keys.filter((e) => e.k === 'handoff'), urg: keys.filter((e) => e.k === 'urgent') };
}
async function report(env, st, day) {
  const keys = (await st.list(`ev:${day}:`)).map((k) => k.metadata).filter(Boolean).sort((a, b) => a.t - b.t);
  const n = (k) => keys.filter((e) => e.k === k).length, chats = new Set(keys.filter((e) => e.k === 'msg').map((e) => e.c));
  const leads = keys.filter((e) => e.k === 'lead'), hand = keys.filter((e) => e.k === 'handoff'), urg = keys.filter((e) => e.k === 'urgent');
  let openU = 0; for (const id of (await st.get('ul')) || []) { const u = await st.get('u:' + id); if (u && !u.done) openU++; }
  const rp = keys.filter((e) => e.k === 'reply').reduce((o, e) => { o[e.n] = (o[e.n] || 0) + 1; return o; }, {});
  const row = (e) => `• ${hm(e.t)} ${esc(e.n || 'Mijoz')}${e.p ? ' ' + esc(e.p) : ''}${e.x ? ' — «' + esc(e.x.slice(0, 70)) + '»' : ''}`;
  const L = [`📊 <b>Kunlik hisobot</b> · ${day.split('-').reverse().join('.')}`, '',
    `💬 Mijoz suhbatlari: <b>${chats.size}</b> (xabarlar: ${n('msg')})`, `🤖 Bot o'zi javob bergan: <b>${n('bot')}</b>`, `⚠️ Operator kerak bo'lgan: <b>${hand.length}</b>`, `📝 Saytdan so'rovlar: <b>${leads.length}</b>`, `🔥 Shoshilinch: <b>${urg.length}</b>${openU ? ` (javobsiz: ${openU})` : ''}`,
    ...(n('good') + n('bad') ? [`👍 ${n('good')} · 👎 ${n('bad')} (bot javoblari baholari)`] : []),
    ...(Object.keys(rp).length ? ['👨‍💼 Javoblar: ' + Object.entries(rp).map(([k, v]) => `${esc(k)} ${v}`).join(' · ')] : [])];
  const srcs = Object.entries(keys.filter((e) => e.k === 'start' && e.x).reduce((o, e) => { o[e.x] = (o[e.x] || 0) + 1; return o; }, {}));
  if (srcs.length) L.push('🔗 Manbalar: ' + srcs.map(([k, v]) => `${esc(k)} ${v}`).join(' · '));
  if (leads.length) L.push('', "<b>Saytdan kelgan so'rovlar:</b>", ...leads.slice(-8).map(row));
  if (urg.length) L.push('', '<b>Shoshilinch mijozlar:</b>', ...urg.slice(-5).map(row));
  if (hand.length) L.push('', "<b>Operator kerak bo'lgan savollar:</b>", ...hand.slice(-5).map(row));
  if (!keys.length) L.push('', "Bugun yangi xabar yoki so'rov bo'lmadi.");
  return L.join('\n').slice(0, 4000);
}
// Cron (har 5 daqiqada): shoshilinch eslatmalar va 20:00 da kunlik hisobot
async function tick(env, now = Date.now()) {
  ENV_REF = env;
  const st = store(env), admins = await adminsOf(env, st); if (!admins.length) return;
  const h = tz(now).getUTCHours(), mi = tz(now).getUTCMinutes(), keep = [];
  for (const id of (await st.get('ul')) || []) {
    const u = await st.get('u:' + id); if (!u || u.done) continue; keep.push(id);
    const age = (now - u.t) / 60000, due = REMIND[u.r];
    if (due === undefined) { u.done = 2; await st.put('u:' + id, u, 2 * 86400); continue; }
    if (age >= due && h >= 7) { // tunda (00:00-07:00) bezovta qilmaymiz
      for (const a of admins) await say(env, a, `⏰ <b>Eslatma:</b> shoshilinch mijozga ${Math.round(age)} daqiqadan beri javob berilmadi\n👤 ${esc(u.n || 'Mijoz')}${u.p ? ' · 📞 ' + esc(u.p) : ''}\n${esc(u.x.slice(0, 200))}`, { reply_markup: { inline_keyboard: [[{ text: "✅ Ko'rdim", callback_data: 'ok:' + id }]] } });
      await pushPhone(env, 'Eslatma: javobsiz mijoz', `Shoshilinch mijozga ${Math.round(age)} daqiqadan beri javob berilmadi. Telegramni oching.`, u.r >= 2 ? 5 : 4, 'alarm_clock');
      if (u.r === 1) await callOwner(env, st, `Напоминание. Срочному клиенту не ответили ${Math.round(age)} минут. ${u.n || ''}. ${u.p ? 'Телефон ' + spell(u.p) + '.' : ''}`, now);
      u.r++; await st.put('u:' + id, u, 2 * 86400);
    }
  }
  if (keep.length !== ((await st.get('ul')) || []).length) await st.put('ul', keep); // KV yozuv kvotasini tejash: faqat o'zgarsa
  const fl = (await st.get('fl')) || [], left = [];
  for (const it of fl) {
    if (it.due > now) { left.push(it); continue; }
    if (it.k === 'bs') { await say(env, it.c, "🙌 Uchrashuv qanday o'tdi? Fikringiz biz uchun muhim:", { reply_markup: { inline_keyboard: [[{ text: '👍 Yaxshi', callback_data: 'bs:g' }, { text: '👎 Yaxshimas', callback_data: 'bs:b' }], [{ text: '📄 Taklif tayyorlang', callback_data: 'bs:o' }]] } }); continue; }
    if (it.k === 'bk') { if (now - it.at < 3600e3) { left.push({ c: it.c, k: 'bs', due: it.at + 2 * 3600e3, n: it.n, p: it.p }); await say(env, it.c, `⏰ <b>Eslatma:</b> bugun ${esc(it.lab)} da uchrashuvimiz bor. Kutib qolamiz!`); for (const a of admins) await say(env, a, `⏰ <b>1 soatdan so'ng uchrashuv</b>: ${esc(it.n || 'Mijoz')} · 📞 ${esc(it.p || '')} · ${esc(it.lab)}`); await pushPhone(env, 'Uchrashuv 1 soatdan so\'ng', `${it.n || 'Mijoz'} ${it.p || ''} ${it.lab}`, 4, 'calendar'); } continue; }
    const rec = (await st.get('c:' + it.c)) || {};
    if ((await st.get('hu:' + it.c)) || (await st.get('ban:' + it.c)) || (it.k === 'price' && rec.phone)) continue; // endi kerak emas
    if (!isOffice(now)) { left.push(it); continue; } // ish vaqtigacha kutamiz
    const lg = rec.lang || 'uz'; await say(env, it.c, FOLLOW[it.k][lg] || FOLLOW[it.k].uz);
    if (it.k === 'ph') for (const a of admins) await say(env, a, `⏰ <b>Mijoz telefon qoldirgan, 1 soatdan beri javobsiz</b>\n👤 ${esc(it.n || 'Mijoz')} · 📞 ${esc(it.p || rec.phone || '')}\nBog'laning yoki xabariga <b>reply</b> qiling.`);
    if (it.k === 'ph') await pushPhone(env, 'Javobsiz mijoz', 'Telefon qoldirgan mijozga 1 soatdan beri javob berilmadi. Telegramni oching.', 4, 'alarm_clock');
  }
  if (JSON.stringify(left) !== JSON.stringify(fl)) await st.put('fl', left);
  if (st.gc && !(await st.get('gc:' + dkey(now)))) { await st.put('gc:' + dkey(now), 1, 2 * 86400); await st.gc().catch(() => {}); } // eskirgan yozuvlarni tozalash (kuniga bir marta)
  if (h === 9 && mi < 5 && tz(now).getUTCDay() === 1 && !(await st.get('repw:' + dkey(now)))) { await st.put('repw:' + dkey(now), 1, 2 * 86400); const wt = await weekly(env, st, now); for (const a of admins) await say(env, a, wt); }
  if (mi % 30 === 0 && !(await st.get('hlc:' + Math.floor(now / 1800e3)))) { await st.put('hlc:' + Math.floor(now / 1800e3), 1, 3600); await health(env, st, admins, now); }
  if (h === 8 && mi < 5 && !(await st.get('bak:' + dkey(now)))) { await st.put('bak:' + dkey(now), 1, 2 * 86400); await backup(env, st, admins); }
  if (h === 11 && mi < 5 && tz(now).getUTCDay() === 3 && env.CHANNEL_ID && !(await st.get('chw:' + dkey(now)))) { await st.put('chw:' + dkey(now), 1, 2 * 86400); await channelPost(env, st); }
  if (h === 10 && mi < 5 && !(await st.get('dig:' + dkey(now)))) { // ertalabki xulosa: kechagi javobsiz savollar
    await st.put('dig:' + dkey(now), 1, 2 * 86400);
    const ys = (await st.list(`ev:${dkey(now - 864e5)}:`)).map((k) => k.metadata).filter((e) => e && e.k === 'handoff' && e.x && !/^telefon:/.test(e.x)).slice(-8);
    if (ys.length) { const t = `📋 <b>Kechagi javobsiz savollar</b> (${ys.length})\n` + ys.map((e) => `• ${esc(e.n || 'Mijoz')}: «${esc(String(e.x).slice(0, 90))}»`).join('\n') + '\n\nBotni o\'rgatish: <code>/oqit 1 javob</code>'; for (const a of admins) await say(env, a, t); }
  }
  if (h === 20 && mi < 5 && !(await st.get('rep:' + dkey(now)))) { await st.put('rep:' + dkey(now), 1, 2 * 86400); const txt = await report(env, st, dkey(now)); for (const a of admins) await say(env, a, txt); const S = await stats(st, dkey(now)); await pushPhone(env, 'Kunlik hisobot', `Suhbatlar: ${S.chats}, saytdan so'rovlar: ${S.leads.length}, shoshilinch: ${S.urg.length}, operator kerak: ${S.hand.length}. Batafsil Telegramda.`, 3, 'bar_chart'); await callOwner(env, st, `Дневной отчёт. Диалогов ${S.chats}. Заявок с сайта ${S.leads.length}. Срочных ${S.urg.length}. Нужен оператор ${S.hand.length}. Подробности в Телеграме.`, now); }
}

/* ---------- Telegram ---------- */
async function tg(env, method, params) {
  const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params || {}) });
  const j = await r.json().catch(() => ({}));
  return j.ok ? j.result : null;
}
const say = (env, chat, text, extra) => tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });
const adminsOf = async (env, st) => [...new Set([...(await st.get('admins')) || [], ...String(env.TG_CHAT || '').split(',').map((x) => Number(x.trim())).filter(Boolean)])];
const who = (m) => [m.from && m.from.first_name, m.from && m.from.last_name, m.from && m.from.username && '@' + m.from.username].filter(Boolean).join(' ') || 'Mijoz';
const makeAssistantDetect = (env) => assistantOf(env).detect;
const makeAssistantQuick = (env, extra) => assistantOf(env, extra).quick;
const assistantOf = (env, extra = []) => makeAssistant({ getExtra: () => extra, getSettings: () => ({ ai: { key: env.ANTHROPIC_API_KEY || '', model: env.AI_MODEL || '' } }), getSite: () => SITE, getPricing: () => PRICING, workersAi: env.AI });

/* ---------- Mijoz xabari ---------- */
const saveRec = (st, chat, rec) => st.put('c:' + chat, rec, 7 * 86400, { n: String(rec.name || '').slice(0, 40), t: Date.now(), p: rec.phone || '', g: (rec.tags || []).join(',').slice(0, 60) });
const isOffice = (now = Date.now()) => { const d = tz(now), h = d.getUTCHours(), w = d.getUTCDay(); return w !== 0 && h >= 9 && h < 18; }; // Dush-Shan 9:00-18:00
const OFFLINE = { uz: "\n\n🕘 Hozir ish vaqtidan tashqari: mutaxassisimiz ish vaqtida (Dush–Shan 9:00–18:00) javob beradi.", ru: '\n\n🕘 Сейчас нерабочее время: специалист ответит в рабочие часы (Пн–Сб 9:00–18:00).', en: '\n\n🕘 We are outside working hours now: a specialist will reply during office hours (Mon–Sat 9:00–18:00).' };
const THANKS_PHONE = { uz: "✅ Rahmat! Raqamingizni qabul qildim, mutaxassisimiz tez orada siz bilan bog'lanadi.", ru: '✅ Спасибо! Номер получил, специалист скоро свяжется с вами.', en: '✅ Thank you! I received your number, a specialist will contact you shortly.' };
function findPhone(text) {
  const m = /(?:\+?998[\s-]?)?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}(?!\d)/.exec(text); if (!m) return null;
  const d = m[0].replace(/\D/g, ''), n = d.length === 9 ? '998' + d : d;
  return /^998\d{9}$/.test(n) ? { phone: '+' + n, rest: (text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length)).replace(/[\s,.;:!?()+-]+/g, ' ').trim() } : null;
}
const MENU = { inline_keyboard: [[{ text: '💰 Narxlar', callback_data: 'm:price' }, { text: '⏱ Muddatlar', callback_data: 'm:time' }], [{ text: '🌐 Sayt yaratish', url: 'https://improuzbekiston.uz/yaratish.html' }, { text: '🤖 Bot yaratish', url: 'https://improuzbekiston.uz/bot.html' }], [{ text: '📞 Aloqa', callback_data: 'm:contact' }, { text: '👤 Operator', callback_data: 'm:human' }], [{ text: '🎯 Menga mos sayt tanlang', callback_data: 'm:site' }, { text: '📅 Uchrashuv', callback_data: 'm:book' }, { text: '🧮 Narx hisobi', callback_data: 'm:calc' }], [{ text: '📝 Buyurtma berish (anketa)', callback_data: 'm:order' }]] };
const FEEDBACK = { inline_keyboard: [[{ text: '👍', callback_data: 'fb:g' }, { text: '👎', callback_data: 'fb:b' }]] };
/* ---------- Ovoz, tarjima, anketa, teglar, qayta aloqa ---------- */
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
// Ovozli xabarni matnga aylantirish (Workers AI Whisper): bo'lmasa '' qaytadi va xabar adminga nusxalanadi
async function transcribe(env, m) {
  const f = m.voice || m.audio; if (!env.AI || !f || (f.duration || 0) > 90 || (f.file_size || 0) > 2.5e6) return '';
  try {
    const g = await tg(env, 'getFile', { file_id: f.file_id}); if (!g || !g.file_path) return '';
    const r = await fetch(`https://api.telegram.org/file/bot${env.TG_TOKEN}/${g.file_path}`); if (!r.ok) return '';
    const buf = new Uint8Array(await r.arrayBuffer());
    let out; try { out = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: b64(buf) }); } catch { out = await env.AI.run('@cf/openai/whisper', { audio: [...buf] }); }
    return String((out && out.text) || '').trim().slice(0, 800);
  } catch { return ''; }
}
// Rus/ingliz tilidagi mijoz xabarini adminga o'zbekcha ko'rsatish
async function translateUz(env, text) {
  if (!env.AI || !text) return '';
  try { const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{ role: 'system', content: "Translate the user's message into Uzbek (Latin script). Output ONLY the translation, nothing else." }, { role: 'user', content: String(text).slice(0, 500) }], max_tokens: 200, temperature: 0 }); return String((r && r.response) || '').trim().slice(0, 400); } catch { return ''; }
}
const addTag = (rec, tag) => { rec.tags = [...new Set([...(rec.tags || []), tag])].slice(0, 6); };
// Qayta aloqa navbati: {c, k: 'ph'|'price', due, n, p}
async function scheduleFollow(st, it) { try { const l = ((await st.get('fl')) || []).filter((x) => !(x.c === it.c && x.k === it.k)); l.push(it); await st.put('fl', l.slice(-100)); } catch { /* ixtiyoriy */ } }
const FOLLOW = { ph: { uz: "⏳ Kutganingiz uchun rahmat! Mutaxassisimiz tez orada siz bilan bog'lanadi.", ru: '⏳ Спасибо за ожидание! Специалист скоро свяжется с вами.', en: '⏳ Thank you for waiting! A specialist will contact you shortly.' }, bld: { uz: "👋 Saytingizni tayyorlashda yordam kerakmi? Telefon raqamingizni yozing yoki «📅 Uchrashuv» ni bosing, mutaxassisimiz yordam beradi.", ru: '👋 Нужна помощь с сайтом? Напишите номер телефона, специалист поможет.', en: '👋 Need help with your site? Leave your phone number and a specialist will help.' }, price: { uz: "👋 Sizga yordam kerakmi? Telefon raqamingizni yozib qoldiring, mutaxassisimiz bepul maslahat beradi.", ru: '👋 Нужна помощь? Оставьте номер телефона, специалист бесплатно проконсультирует.', en: '👋 Need help? Leave your phone number and a specialist will give you a free consultation.' } };
// Anketa (suhbat): xizmat → nom → muddat → byudjet → telefon
const SERVICES = ['Veb-sayt', "Onlayn do'kon", 'Telegram bot', 'Mobil ilova', 'UI/UX dizayn', 'Boshqa'], DEADLINES = ['Shoshilinch (1 hafta)', '2–3 hafta', '1 oy', 'Shoshilmayman'], BUDGETS = ["1–3 mln so'm", "3–7 mln so'm", "7–15 mln so'm", "15 mln so'mdan ko'p", 'Maslahat kerak'];
const kbOf = (p, arr) => ({ inline_keyboard: arr.map((x, i) => [{ text: x, callback_data: `o:${p}:${i}` }]) });
async function flowStart(env, st, chat, rec) {
  rec.flow = { step: 'svc', d: {} }; await saveRec(st, chat, rec);
  return say(env, chat, '📝 <b>Buyurtma anketasi</b> (5 ta qisqa savol, bekor qilish: /cancel)\n\n1/5. Qanday xizmat kerak?', { reply_markup: kbOf('svc', SERVICES) });
}
async function flowFinish(env, st, chat, rec, name) {
  const d = rec.flow.d; rec.flow = null; rec.phone = d.ph; const tmp = leadTemp({ phone: true, anketa: true, urgent: /^Shoshilinch/.test(d.dl), budget: d.bd }); addTag(rec, 'anketa'); addTag(rec, tmp); await saveRec(st, chat, rec);
  await saveLead(st, { c: chat, n: name, p: d.ph, s: 'anketa', x: `${d.svc}; ${d.name}; ${d.dl}; ${d.bd}`, g: tmp, r: rec.src });
  const txt = `📝 <b>Yangi anketa (bot)</b> #${tmp}\n👤 ${esc(name)}${chat ? ` <code>${chat}</code>` : ''}\n🔧 ${esc(d.svc)}\n🏢 ${esc(d.name)}\n⏱ ${esc(d.dl)}\n💰 ${esc(d.bd)}\n📞 <b>${esc(d.ph)}</b>`;
  await ev(st, { k: 'lead', c: chat, n: name, p: d.ph, x: `anketa: ${d.svc}, ${d.dl}` });
  const map = {};
  for (const a of await adminsOf(env, st)) { const h = await say(env, a, txt + '\n\nJavob berish uchun shu xabarga <b>reply</b> qiling.', { reply_markup: { inline_keyboard: [[{ text: `📞 ${d.ph}`, url: 'https://t.me/' + d.ph }]] } }); if (h) map[a + ':' + h.message_id] = chat; }
  await Promise.all(Object.entries(map).map(([k, v]) => st.put('m:' + k, v, 30 * 86400)));
  if (/^Shoshilinch/.test(d.dl)) await raiseUrgent(env, st, { chat, name, phone: d.ph, text: `Anketa: ${d.svc}, ${d.name}, ${d.dl}` });
  await scheduleFollow(st, { c: chat, k: 'ph', due: Date.now() + 3600e3, n: name, p: d.ph });
  return say(env, chat, '✅ Anketa qabul qilindi! Mutaxassisimiz tez orada bog\'lanadi.' + (isOffice() ? '' : OFFLINE.uz));
}
async function flowText(env, st, m, rec) {
  const chat = m.chat.id, text = (m.text || '').trim(), f = rec.flow;
  if (text === '/cancel') { rec.flow = null; await saveRec(st, chat, rec); return say(env, chat, "Anketa bekor qilindi. Savolingizni yozishingiz mumkin.", { reply_markup: MENU }); }
  if (f.step === 'site') return siteProposal(env, st, chat, rec, text);
  if (f.step === 'bkph') { const p = findPhone(text); if (!p) return say(env, chat, "Raqam noto'g'ri. Masalan: <code>90 123 45 67</code>"); rec.phone = p.phone; rec.flow = null; return bookFinish(env, st, chat, rec, who(m), f.ymd, f.hh); }
  if (f.step === 'name') { f.d.name = text.slice(0, 80); f.step = 'dl'; await saveRec(st, chat, rec); return say(env, chat, '3/5. Qachon tayyor bo\'lishi kerak?', { reply_markup: kbOf('dl', DEADLINES) }); }
  if (f.step === 'ph') {
    const p = findPhone(text); if (!p) return say(env, chat, "Raqam noto'g'ri. Iltimos, masalan shunday yozing: <code>90 123 45 67</code>");
    f.d.ph = p.phone; return flowFinish(env, st, chat, rec, who(m));
  }
  return say(env, chat, 'Iltimos, yuqoridagi tugmalardan birini tanlang (yoki /cancel).');
}
async function flowCallback(env, st, q, p, i) {
  const chat = q.message.chat.id, rec = (await st.get('c:' + chat)) || { hist: [] }, f = rec.flow;
  if (!f) return say(env, chat, "Anketa yopilgan. Qayta boshlash: /anketa");
  const n = Number(i);
  if (p === 'svc' && f.step === 'svc' && SERVICES[n]) { f.d.svc = SERVICES[n]; f.step = 'name'; await saveRec(st, chat, rec); return say(env, chat, '2/5. Biznes yoki kompaniyangiz nomi? (yozib yuboring)'); }
  if (p === 'dl' && f.step === 'dl' && DEADLINES[n]) { f.d.dl = DEADLINES[n]; f.step = 'bd'; await saveRec(st, chat, rec); return say(env, chat, '4/5. Taxminiy byudjet?', { reply_markup: kbOf('bd', BUDGETS) }); }
  if (p === 'bd' && f.step === 'bd' && BUDGETS[n]) { f.d.bd = BUDGETS[n]; f.step = 'ph'; await saveRec(st, chat, rec); return say(env, chat, '5/5. Telefon raqamingizni yozing (masalan <code>90 123 45 67</code>):'); }
}
// Haftalik hisobot: o'tgan 7 kun
async function weekly(env, st, now = Date.now()) {
  const all = []; for (let i = 0; i < 7; i++) all.push(...(await st.list(`ev:${dkey(now - i * 864e5)}:`)).map((k) => k.metadata).filter(Boolean));
  const n = (k) => all.filter((e) => e.k === k).length, msgs = all.filter((e) => e.k === 'msg'), chats = new Set(msgs.map((e) => e.c));
  const TOP = [['Narx', /narx|qancha|price|cost|цена|стоим|сколько/i], ['Muddat', /muddat|vaqt|срок|когда|deadline|how long/i], ['Telegram bot', /bot|бот/i], ['Sayt / shablon', /sayt|shablon|сайт|шаблон|site|template/i], ['Mobil ilova', /ilova|приложен|app/i], ["To'lov", /to'?lov|payme|click|оплат|pay/i], ['Domen / hosting', /domen|hosting|домен/i], ['SEO / Google', /seo|google|qidiruv/i]];
  const wrp = Object.entries(all.filter((e) => e.k === 'reply').reduce((o, e) => { o[e.n] = (o[e.n] || 0) + 1; return o; }, {}));
  const top = TOP.map(([t, re]) => [t, msgs.filter((e) => re.test(e.x)).length]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const unans = all.filter((e) => e.k === 'handoff' && e.x && !/^telefon:/.test(e.x)).slice(-6);
  const L = [`📈 <b>Haftalik hisobot</b> · ${dkey(now - 6 * 864e5).split('-').reverse().join('.')} – ${dkey(now).split('-').reverse().join('.')}`, '',
    `👥 Mijozlar: <b>${chats.size}</b> (xabarlar: ${msgs.length})`, `🤖 Bot o'zi javob bergan: <b>${n('bot') + n('menu')}</b>`, `⚠️ Operator kerak bo'lgan: <b>${n('handoff')}</b>`, `📝 So'rovlar va telefonlar: <b>${n('lead')}</b>`, `🔥 Shoshilinch: <b>${n('urgent')}</b>`, ...(n('good') + n('bad') ? [`👍 ${n('good')} · 👎 ${n('bad')}`] : []), ...(wrp.length ? ['👨‍💼 Javoblar: ' + wrp.map(([k, v]) => `${esc(k)} ${v}`).join(' · ')] : [])];
  if (top.length) L.push('', '<b>Eng ko\'p so\'ralgan mavzular:</b>', ...top.map(([t, c]) => `• ${t}: ${c}`));
  if (unans.length) L.push('', "<b>Bot javob bera olmagan savollar</b> (<code>/bilim</code> bilan o'rgating):", ...unans.map((e) => `• «${esc(String(e.x).slice(0, 80))}»`));
  if (!all.length) L.push('', "Bu hafta ma'lumot yo'q.");
  return L.join('\n').slice(0, 4000);
}
/* ---------- Lidlar bazasi, eksport, javob loyihasi, jamoa, sayt chati ---------- */
// Lid: doimiy saqlanadi (TTL yo'q). s = manba: bot | anketa | sayt | chat
async function saveLead(st, l) {
  try {
    const t = Date.now(), id = t.toString(36) + Math.random().toString(36).slice(2, 5);
    await st.put('lead:' + id, { ...l, t }, 0, { t, n: String(l.n || '').slice(0, 40), p: String(l.p || '').slice(0, 25), s: l.s || '', x: String(l.x || '').replace(/\s+/g, ' ').slice(0, 160), g: l.g || '', r: l.r || '' });
  } catch { /* lid saqlanmasa ham mijozga javob ketadi */ }
  if (ENV_REF) await notifyExtra(ENV_REF, 'lead', { ...l, t: Date.now() });
}
// Mijoz "isitma darajasi": telefon + anketa + shoshilinch + byudjet bo'yicha ballar
const leadTemp = ({ phone, anketa, urgent, budget }) => { const sc = (phone ? 2 : 0) + (anketa ? 2 : 0) + (urgent ? 2 : 0) + (/7–15|15 mln/.test(budget || '') ? 2 : /3–7/.test(budget || '') ? 1 : 0); return sc >= 4 ? 'issiq' : sc >= 2 ? 'iliq' : 'sovuq'; };
const csvCell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
async function sendDoc(env, chat, name, text, caption) {
  const fd = new FormData(); fd.append('chat_id', String(chat)); if (caption) fd.append('caption', caption);
  fd.append('document', new Blob(['﻿' + text], { type: 'text/csv' }), name);
  try { const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendDocument`, { method: 'POST', body: fd }); return r.ok; } catch { return false; }
}
const leadRow = (k) => { const m = k.metadata || {}; return { t: m.t || 0, n: m.n || '', p: m.p || '', s: m.s || '', x: m.x || '', g: m.g || '', r: m.r || '' }; };
async function listLeads(st) { return (await st.list('lead:')).map(leadRow).sort((a, b) => b.t - a.t); }
// Javob loyihasi: bot bilmagan savolga operator uchun tayyor matn (tasdiqlansa mijozga ketadi)
async function offerDraft(env, st, admins, { to, name, text, hist, extra, label }) {
  let dr = ''; try { dr = await assistantOf(env, extra).draft({ text, history: hist || [] }); } catch { dr = ''; }
  if (!dr) return;
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
  await st.put('dr:' + id, { to, text: dr }, 86400);
  for (const a of admins) await say(env, a, `📝 <b>Javob loyihasi</b> → ${esc(name || 'Mijoz')}${label ? ' (' + label + ')' : ''}:\n\n${esc(dr)}\n\n<i>Yuborish tugmasini bosing yoki o'zingiz yozing (xabarga reply).</i>`, { reply_markup: { inline_keyboard: [[{ text: '✅ Yuborish', callback_data: 'dr:' + id }, { text: '🗑 Rad', callback_data: 'dx:' + id }]] } });
}
// Mijozga operator nomidan xabar (Telegram yoki sayt chati)
async function deliver(env, st, to, text, asAdmin) {
  if (String(to).startsWith('web:')) { const sid = String(to).slice(4), box = (await st.get('wo:' + sid)) || []; box.push({ t: Date.now(), text }); await st.put('wo:' + sid, box.slice(-20), 3600); await st.put('hu:' + to, 1, 2 * 3600); return true; }
  const r = await say(env, to, `💬 <b>Impro IT:</b>\n${esc(text)}`);
  if (r) { await st.put('hu:' + to, 1, 2 * 3600); await closeUrgentOf(st, to); }
  if (asAdmin) await ev(st, { k: 'reply', c: 0, n: asAdmin, x: '' });
  return !!r;
}
const adminName = (q) => who({ from: q.from || q }) || 'Admin';
// Sayt chati API (CORS: faqat ruxsat etilgan saytlar)
async function chatApi(req, env) {
  const origin = req.headers.get('Origin') || '', allow = String(env.ALLOW_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!allow.length) allow.push('https://improuzbekiston.uz', 'https://www.improuzbekiston.uz'); allow.push(...APP_ORIGINS);
  const okOrigin = allow.includes(origin), cors = { 'Access-Control-Allow-Origin': okOrigin ? origin : 'null', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!okOrigin) return new Response("Ruxsat yo'q", { status: 403, headers: cors });
  const st = store(env), url = new URL(req.url), SID = /^[A-Za-z0-9]{16,40}$/;
  if (req.method === 'GET') { // operator javoblarini olish
    const sid = url.searchParams.get('sid') || ''; if (!SID.test(sid)) return json({ error: 'sid' }, 400);
    const box = (await st.get('wo:' + sid)) || []; if (box.length) await st.put('wo:' + sid, [], 3600);
    return json({ msgs: box.map((x) => x.text) });
  }
  if (req.method !== 'POST') return new Response("Ruxsat yo'q", { status: 405, headers: cors });
  let b; try { b = await req.json(); } catch { return json({ error: "Noto'g'ri so'rov" }, 400); }
  const sid = String(b.sid || ''), text = String(b.text || '').trim().slice(0, 500);
  if (!SID.test(sid) || !text) return json({ error: "Noto'g'ri so'rov" }, 400);
  if (await limited(st, 'wip:' + (req.headers.get('CF-Connecting-IP') || 'x'), 40, 600) || await limited(st, 'wsid:' + sid, 20, 600)) return json({ error: "Juda ko'p xabar. Birozdan so'ng yozing." }, 429);
  const key = 'web:' + sid, tag = 'W' + sid.slice(0, 5), admins = await adminsOf(env, st);
  const rec = (await st.get('wc:' + sid)) || { hist: [], name: 'Sayt mehmoni ' + tag };
  const ph = findPhone(text), urgent = isUrgent(text), lang = makeAssistantDetect(env)(text), extra = (await st.get('kb')) || [];
  await ev(st, { k: 'msg', c: tag, n: rec.name, x: text });
  if (ph) { rec.phone = ph.phone; const g = leadTemp({ phone: true, urgent }); await ev(st, { k: 'lead', c: tag, n: rec.name, p: ph.phone, x: ph.rest || 'telefon qoldirdi' }); await saveLead(st, { c: key, n: rec.name, p: ph.phone, s: 'chat', x: ph.rest || text, g }); }
  const map = {};
  for (const a of admins) { const h = await say(env, a, `🌐 <b>Sayt chati</b> <code>${tag}</code>${ph ? `\n📞 <b>Telefon qoldirdi: ${esc(ph.phone)}</b>` : rec.phone ? `\n📞 ${esc(rec.phone)}` : ''}\nJavob berish uchun shu xabarga <b>reply</b> qiling.\n\n${esc(text)}`); if (h) map[a + ':' + h.message_id] = key; }
  await Promise.all(Object.entries(map).map(([k, v]) => st.put('m:' + k, v, 30 * 86400)));
  if (urgent) await raiseUrgent(env, st, { chat: 0, name: rec.name, phone: rec.phone, text });
  if (await st.get('hu:' + key)) { await st.put('wc:' + sid, rec, 2 * 86400); return json({ ok: true, reply: '', operator: true }); }
  if (ph && ph.rest.replace(/[^\p{L}]/gu, '').length < 12) { await st.put('wc:' + sid, rec, 2 * 86400); await ev(st, { k: 'handoff', c: tag, n: rec.name, x: 'telefon: ' + ph.phone }); return json({ ok: true, reply: (THANKS_PHONE[lang] || THANKS_PHONE.uz) + (isOffice() ? '' : OFFLINE[lang] || OFFLINE.uz) }); }
  let a = null; try { a = await assistantOf(env, extra).answer({ text, history: rec.hist }); } catch { a = null; }
  if (!a || !a.text) { await st.put('wc:' + sid, rec, 2 * 86400); return json({ ok: true, reply: '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.' }); }
  rec.hist = [...rec.hist, { r: 'u', t: text.slice(0, 600) }, { r: 'a', t: a.text.slice(0, 900) }].slice(-12);
  await st.put('wc:' + sid, rec, 2 * 86400);
  await ev(st, { k: a.handoff ? 'handoff' : 'bot', c: tag, n: rec.name, x: text });
  if (a.handoff) await offerDraft(env, st, admins, { to: key, name: rec.name, text, hist: rec.hist, extra, label: 'sayt chati' });
  return json({ ok: true, reply: a.text + (a.handoff && !isOffice() ? OFFLINE[lang] || OFFLINE.uz : ''), handoff: !!a.handoff });
}
async function supportIn(env, st, m) {
  const chat = m.chat.id; let text = (m.text || '').trim();
  const sm = /^\/start(?:@\w+)?\s+([\w-]{1,30})$/.exec(text);
  if (sm) { const r0 = (await st.get('c:' + chat)) || { hist: [] }; if (!r0.src) { r0.src = sm[1].toLowerCase(); r0.name = who(m); await saveRec(st, chat, r0); await ev(st, { k: 'start', c: chat, n: who(m), x: r0.src }); } if (sm[1].toLowerCase() === 'eslatma' && !(await st.get('c:' + chat + ':bld'))) { await st.put('c:' + chat + ':bld', 1, 7 * 86400); await scheduleFollow(st, { c: chat, k: 'bld', due: Date.now() + 24 * 3600e3, n: who(m) }); } text = '/start'; }
  if (text === '/start' || text === '/help') {
    return say(env, chat, "👋 <b>Impro IT</b> yordam botiga xush kelibsiz!\n\nSavolingizni shu yerga yozing (o'zbek, rus yoki ingliz tilida): bot darrov javob beradi, murakkab savollarni mutaxassisimiz o'zi hal qiladi. Rasm yoki fayl ham yuborishingiz mumkin. Tez javob uchun quyidagi tugmalardan foydalaning:", { reply_markup: MENU });
  }
  if (await limited(st, 'c' + chat, 12, 600)) return say(env, chat, "Juda ko'p xabar yuborildi. Birozdan so'ng yozing.");
  if (await st.get('ban:' + chat)) return;
  if (m.text && !text.startsWith('/') && (isSpam(text) || await limited(st, 'dup' + chat + ':' + text.slice(0, 40), 3, 600))) {
    const sk = ((await st.get('sp:' + chat)) || 0) + 1; await st.put('sp:' + chat, sk, 86400); await ev(st, { k: 'spam', c: chat, n: who(m), x: text });
    if (sk >= 2) await st.put('ban:' + chat, 1, 86400);
    return sk >= 2 ? undefined : say(env, chat, "Bu xabar spam deb belgilandi. Savolingiz bo'lsa, oddiy tilda yozing.");
  }
  const admins = await adminsOf(env, st);
  const rec = (await st.get('c:' + chat)) || { hist: [] };
  if (text === '/anketa') return flowStart(env, st, chat, rec);
  if (text === '/sayt') return siteAsk(env, st, chat, rec);
  if (text === '/uchrashuv') return bookStart(env, st, chat);
  if (rec.flow && m.text) return flowText(env, st, m, rec);
  if ((m.voice || m.audio) && !m.text) { const tr = await transcribe(env, m); if (tr) { m = { ...m, text: tr, _voice: true }; text = tr; } }
  rec.name = who(m); const prevT = rec.lastT; rec.lastT = Date.now();
  const urgent = !!m.text && isUrgent(text);
  const ph = m.text ? findPhone(text) : null, lang0 = makeAssistantDetect(env)(text);
  rec.lang = lang0;
  const tl = m.text && lang0 !== 'uz' ? await translateUz(env, text) : '';
  if (urgent) addTag(rec, 'shoshilinch');
  if (ph) { if (!(await st.get('hu:' + chat))) await scheduleFollow(st, { c: chat, k: 'ph', due: Date.now() + 3600e3, n: who(m), p: ph.phone }); }
  if (m.text && /narx|qancha|price|cost|цена|стоим|сколько/i.test(text) && !rec.phone && !ph && !rec.fuPrice) { rec.fuPrice = 1; await scheduleFollow(st, { c: chat, k: 'price', due: Date.now() + 24 * 3600e3, n: who(m) }); }
  if (ph) { rec.phone = ph.phone; const tmp = leadTemp({ phone: true, urgent }); addTag(rec, tmp); await ev(st, { k: 'lead', c: chat, n: who(m), p: ph.phone, x: ph.rest || 'telefon qoldirdi' }); await saveLead(st, { c: chat, n: who(m), p: ph.phone, s: 'bot', x: ph.rest || 'telefon qoldirdi', g: tmp, r: rec.src }); }
  await ev(st, { k: 'msg', c: chat, n: who(m), x: m.text ? text : '[fayl/rasm]' });
  const map = {};
  for (const a of admins) {
    const head = await say(env, a, `💬 <b>${esc(who(m))}</b> <code>${chat}</code>${m._voice ? '\n🎤 <i>ovozli xabar (matnga aylantirildi)</i>' : ''}${ph ? `\n📞 <b>Telefon qoldirdi: ${esc(ph.phone)}</b>` : rec.phone ? `\n📞 ${esc(rec.phone)}` : ''}\nJavob berish uchun shu xabarga <b>reply</b> qiling.` + (m.text ? `\n\n${esc(text.slice(0, 3500))}` : '') + (tl ? `\n\n🌐 <i>${esc(tl)}</i>` : ''), admins.length > 1 ? { reply_markup: { inline_keyboard: [[{ text: '✅ Men oldim', callback_data: 'tk:' + chat }]] } } : undefined);
    if (head) map[a + ':' + head.message_id] = chat;
    if (!m.text) { const cp = await tg(env, 'copyMessage', { chat_id: a, from_chat_id: chat, message_id: m.message_id, reply_to_message_id: head && head.message_id }); if (cp) map[a + ':' + cp.message_id] = chat; }
  }
  const saveMap = () => Promise.all(Object.entries(map).map(([k, v]) => st.put('m:' + k, v, 30 * 86400)));
  if (ph && ph.rest.replace(/[^\p{L}]/gu, '').length < 12) { // faqat telefon raqami: rahmat deymiz va operatorga uzatamiz
    await saveRec(st, chat, rec); await saveMap(); await ev(st, { k: 'handoff', c: chat, n: who(m), x: 'telefon: ' + ph.phone });
    if (urgent) await raiseUrgent(env, st, { chat, name: who(m), phone: ph.phone, text });
    return say(env, chat, (THANKS_PHONE[lang0] || THANKS_PHONE.uz) + (isOffice() ? '' : OFFLINE[lang0] || OFFLINE.uz));
  }
  if ((await st.get('hu:' + chat)) || (await st.get('auto')) === 'off' || !m.text) { await saveRec(st, chat, rec); await saveMap(); if (urgent) await raiseUrgent(env, st, { chat, name: who(m), phone: rec.phone, text }); if (!(await st.get('hu:' + chat))) await say(env, chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.' + (admins.length ? '' : `\nShoshilinch bo'lsa: ${(SITE.contacts || {}).phone || ''}`)); return; }
  let a = null;
  const extra = (await st.get('kb')) || [];
  try { a = await assistantOf(env, extra).answer({ text, history: (await limited(st, 'ai', 400, 3600)) ? [] : rec.hist }); } catch { a = null; }
  if (!a || !a.text) { await saveRec(st, chat, rec); await saveMap(); if (urgent) await raiseUrgent(env, st, { chat, name: who(m), phone: rec.phone, text }); return say(env, chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.'); }
  rec.hist = [...rec.hist, { r: 'u', t: text.slice(0, 600) }, { r: 'a', t: a.text.slice(0, 900) }].slice(-12);
  await saveRec(st, chat, rec);
  await ev(st, { k: a.handoff ? 'handoff' : 'bot', c: chat, n: who(m), x: text });
  if (a.handoff && text.length > 8 && !findPhone(text)) await unqAdd(st, text);
  const lg = makeAssistantDetect(env)(text), URGLINE = { uz: "\n\n🔥 Shoshilinch ekaningizni qayd etdim: mutaxassisimiz tez orada bog'lanadi.", ru: '\n\n🔥 Отметил срочность: специалист свяжется с вами в ближайшее время.', en: '\n\n🔥 Marked as urgent: a specialist will contact you shortly.' };
  const fn = String(rec.name || '').split(' ')[0], back = prevT && Date.now() - prevT > 6 * 3600e3 && fn.length > 1 && /\p{L}/u.test(fn) ? ({ uz: `Yana salom, ${fn}! 👋\n`, ru: `С возвращением, ${fn}! 👋\n`, en: `Welcome back, ${fn}! 👋\n` }[lg] || '') : '';
  await say(env, chat, esc(back) + esc(a.text) + (urgent ? URGLINE[lg] || URGLINE.uz : '') + (a.handoff && !isOffice() ? OFFLINE[lg] || OFFLINE.uz : ''), a.handoff ? undefined : { reply_markup: FEEDBACK });
  for (const ad of admins) { const n = await tg(env, 'sendMessage', { chat_id: ad, parse_mode: 'HTML', text: `🤖 <b>Bot javobi</b> ${a.handoff ? '⚠️ <b>Operator kerak</b>' : '✅'}${a.ai ? '' : ' (qoida)'}:\n${esc(a.text.slice(0, 1500))}`, ...(a.handoff ? {} : { disable_notification: true }) }); if (n) map[ad + ':' + n.message_id] = chat; }
  await saveMap();
  if (a.handoff) await offerDraft(env, st, admins, { to: chat, name: who(m), text, hist: rec.hist, extra });
  if (urgent) await raiseUrgent(env, st, { chat, name: who(m), phone: rec.phone, text });
}
// Admin reply -> mijoz
async function supportOut(env, st, m) {
  const to = await st.get('m:' + m.chat.id + ':' + m.reply_to_message.message_id); if (!to) return false;
  const me = who(m), own = await st.get('own:' + to), web = String(to).startsWith('web:');
  if (own && own.a !== m.chat.id) { await say(env, m.chat.id, `⚠️ Bu mijozni <b>${esc(own.n)}</b> olgan. Baribir yuborish uchun: <code>/javob ${to} matn</code>`); return true; }
  await st.put('own:' + to, { a: m.chat.id, n: me }, 2 * 3600);
  if (m.text) await deliver(env, st, to, m.text, me);
  else if (web) { await say(env, m.chat.id, "Sayt chatiga fayl yuborib bo'lmaydi, matn yozing."); return true; }
  else { await st.put('hu:' + to, 1, 2 * 3600); await closeUrgentOf(st, to); await tg(env, 'copyMessage', { chat_id: to, from_chat_id: m.chat.id, message_id: m.message_id }); await ev(st, { k: 'reply', c: 0, n: me, x: '' }); }
  await tg(env, 'setMessageReaction', { chat_id: m.chat.id, message_id: m.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] });
  return true;
}
async function handleCallback(env, st, q) {
  const chat = q.message && q.message.chat && q.message.chat.id, d = String(q.data || ''), ans = (text) => tg(env, 'answerCallbackQuery', { callback_query_id: q.id, ...(text ? { text } : {}) });
  if (!chat) return ans();
  const isAdmin = (await adminsOf(env, st)).includes(chat), mm = /^m:(price|time|contact|human)$/.exec(d);
  if (mm) { // mijoz menyusi
    await ans();
    if (mm[1] === 'human') return supportIn(env, st, { chat: q.message.chat, from: q.from, message_id: q.message.message_id, text: 'Operator bilan gaplashmoqchiman' });
    const qs = { price: 'narx qancha?', time: "qancha vaqtda tayyor bo'ladi? muddat", contact: 'aloqa telefon manzil' };
    const r = makeAssistantQuick(env, (await st.get('kb')) || [])(qs[mm[1]]);
    await ev(st, { k: 'menu', c: chat, n: who({ from: q.from }), x: mm[1] });
    return say(env, chat, esc(r.text), { reply_markup: MENU });
  }
  if (d === 'fb:g' || d === 'fb:b') { // javobni baholash
    await ev(st, { k: d === 'fb:g' ? 'good' : 'bad', c: chat, n: who({ from: q.from }), x: '' }); await ans(d === 'fb:g' ? 'Rahmat! 👍' : 'Fikringiz uchun rahmat, yaxshilaymiz');
    return tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: d === 'fb:g' ? '👍 Rahmat!' : '👎 Qayd etildi', callback_data: 'noop' }]] } });
  }
  if (d === 'm:site') { await ans(); return siteAsk(env, st, chat, (await st.get('c:' + chat)) || { hist: [], name: who({ from: q.from }) }); }
  if (d === 'm:book') { await ans(); return bookStart(env, st, chat); }
  const bkm = /^bk:(\d{8}):(\d+)$/.exec(d);
  if (bkm) {
    const [, ymd, hs] = bkm, hh = Number(hs); if (!SLOT_HOURS.includes(hh)) return ans();
    const rec = (await st.get('c:' + chat)) || { hist: [] }; rec.name = who({ from: q.from });
    if (await st.get('slot:' + ymd + ':' + hh)) { await ans('Bu vaqt band'); return bookStart(env, st, chat); }
    await st.put('slot:' + ymd + ':' + hh, chat, 10 * 86400); await ans('Tanlandi');
    if (rec.phone) return bookFinish(env, st, chat, rec, rec.name, ymd, hh);
    rec.flow = { step: 'bkph', ymd, hh, d: {} }; await saveRec(st, chat, rec);
    return say(env, chat, `📅 ${slotLabel(ymd, hh)}. Bog'lanish uchun telefon raqamingizni yozing (masalan <code>90 123 45 67</code>):`);
  }
  if (d === 'm:calc') { await ans(); return calcStart(env, st, chat, (await st.get('c:' + chat)) || { hist: [], name: who({ from: q.from }) }); }
  const clm = /^cl:(\d+|go)$/.exec(d); if (clm) { await ans(); return calcCallback(env, st, q, clm[1]); }
  const bsm = /^bs:([gbo])$/.exec(d);
  if (bsm) {
    await ans('Rahmat!'); const nm = who({ from: q.from }), rec = (await st.get('c:' + chat)) || {};
    await ev(st, { k: bsm[1] === 'b' ? 'bad' : 'good', c: chat, n: nm, x: 'uchrashuv' });
    if (bsm[1] !== 'g') for (const a of await adminsOf(env, st)) await say(env, a, bsm[1] === 'o' ? `📄 <b>Taklif so'raldi</b>: ${esc(nm)} <code>${chat}</code> ${esc(rec.phone || '')}` : `👎 <b>Uchrashuv yoqmadi</b>: ${esc(nm)} <code>${chat}</code> ${esc(rec.phone || '')}. Bog'lanib ko'ring.`);
    return say(env, chat, bsm[1] === 'o' ? "✅ Taklif tayyorlab, tez orada yuboramiz." : bsm[1] === 'b' ? "Fikringiz uchun rahmat. Kamchiliklarni to'g'rilaymiz, siz bilan bog'lanamiz." : 'Rahmat! Savolingiz bo\'lsa, yozing 🙂');
  }
  if (d === 'm:order') { await ans(); return flowStart(env, st, chat, (await st.get('c:' + chat)) || { hist: [], name: who({ from: q.from }) }); }
  const oc = /^o:(svc|dl|bd):(\d+)$/.exec(d);
  if (oc) { await ans(); return flowCallback(env, st, q, oc[1], oc[2]); }
  const tk = /^tk:(\d+)$/.exec(d);
  if (tk) { // jamoa: "Men oldim"
    if (!isAdmin) return ans("Ruxsat yo'q");
    const nm = who({ from: q.from }) || 'Admin', cur = await st.get('own:' + tk[1]);
    if (cur && cur.a !== chat) return ans(`Bu mijozni ${cur.n} olgan`);
    await st.put('own:' + tk[1], { a: chat, n: nm }, 2 * 3600); await ev(st, { k: 'take', c: 0, n: nm, x: tk[1] }); await ans('Siz oldingiz');
    for (const a of await adminsOf(env, st)) if (a !== chat) await say(env, a, `👤 <b>${esc(nm)}</b> mijozni oldi (<code>${tk[1]}</code>). Javob bermang.`);
    return tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: '👤 Siz oldingiz', callback_data: 'noop' }]] } });
  }
  const dd = /^(dr|dx):(\w+)$/.exec(d);
  if (dd) { // javob loyihasi: yuborish yoki rad etish
    if (!isAdmin) return ans("Ruxsat yo'q");
    const job = await st.get('dr:' + dd[2]); if (!job) return ans('Muddati tugagan yoki allaqachon ishlangan');
    await st.put('dr:' + dd[2], null, 60);
    if (dd[1] === 'dx') { await ans("Rad etildi"); return tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: '🗑 Rad etildi', callback_data: 'noop' }]] } }); }
    const nm = who({ from: q.from }) || 'Admin', own = await st.get('own:' + job.to);
    if (own && own.a !== chat) { await ans(`Bu mijozni ${own.n} olgan`); return; }
    const okd = await deliver(env, st, job.to, job.text, nm); await st.put('own:' + job.to, { a: chat, n: nm }, 2 * 3600);
    if (String(job.to).startsWith('web:')) await ev(st, { k: 'reply', c: 0, n: nm, x: '' });
    await ans(okd ? 'Yuborildi' : 'Yuborilmadi');
    return tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: okd ? '✅ Yuborildi' : '❌ Yuborilmadi', callback_data: 'noop' }]] } });
  }
  const bc = /^bc:(\w+)$/.exec(d);
  if (bc) { // ommaviy xabarni tasdiqlash (faqat admin)
    if (!isAdmin) return ans("Ruxsat yo'q");
    const job = await st.get('bc:' + bc[1]); if (!job) return ans('Muddati tugagan');
    await st.put('bc:' + bc[1], null, 60); await ans('Yuborilmoqda…');
    let ok = 0; for (const cid of job.to.slice(0, 45)) { if (await st.get('ban:' + cid)) continue; if (await say(env, cid, esc(job.text))) ok++; }
    await ev(st, { k: 'bc', c: 0, n: 'xabar', x: job.text.slice(0, 60) });
    return say(env, chat, `📣 Yuborildi: <b>${ok}</b> ta mijozga${job.to.length > 45 ? ` (cheklov: bir marta 45 ta; qolgan ${job.to.length - 45} ta uchun /xabar ni qayta yuboring)` : ''}.`);
  }
  const id = /^ok:(\w+)$/.exec(d);
  if (!id || !isAdmin) return ans("Ruxsat yo'q");
  const u = await st.get('u:' + id[1]); if (u) { u.done = 1; await st.put('u:' + id[1], u, 2 * 86400); }
  await ans('Qayd etildi');
  await tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: "✅ Ko'rildi", callback_data: 'noop' }]] } });
}
async function handleUpdate(env, upd) {
  ENV_REF = env;
  if (upd && upd.callback_query) return handleCallback(env, store(env), upd.callback_query);
  const m = upd && upd.message; if (!m || !m.chat || m.chat.type !== 'private') return;
  const st = store(env), chat = m.chat.id, text = (m.text || '').trim();
  const cmd = (text.split(/\s+/)[0] || '').replace(/@\w+$/, '').toLowerCase(), arg = text.slice((text.split(/\s+/)[0] || '').length).trim();
  if (cmd === '/login') {
    await tg(env, 'deleteMessage', { chat_id: chat, message_id: m.message_id }); // parol chatda qolmasin (so'rov tugaguncha kutiladi)
    if (!env.ADMIN_PASSWORD) return say(env, chat, "Admin paroli sozlanmagan (ADMIN_PASSWORD).");
    if (await limited(st, 'l' + chat, 5, 900, true) || await limited(st, 'lall', 30, 3600, true)) return say(env, chat, "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining.");
    if (!tEq(arg, env.ADMIN_PASSWORD)) return say(env, chat, "❌ Parol noto'g'ri.");
    const list = (await st.get('admins')) || []; if (!list.includes(chat)) { list.push(chat); await st.put('admins', list); }
    return say(env, chat, "✅ <b>Admin sifatida kirdingiz.</b>\nMijoz xabarlari va sayt so'rovlari shu yerga keladi. Mijozga javob berish uchun xabarga <b>reply</b> qiling.\n/auto on|off — avtomatik javob\n/logout — chiqish");
  }
  const admins = await adminsOf(env, st);
  if (!admins.includes(chat)) return supportIn(env, st, m);
  if (cmd === '/logout') { await st.put('admins', ((await st.get('admins')) || []).filter((x) => x !== chat)); return say(env, chat, 'Chiqdingiz. Qayta kirish uchun /login.'); }
  if (cmd === '/auto') {
    if (/^(on|yoq|yoqish|1)$/i.test(arg)) await st.put('auto', 'on'); else if (/^(off|o'?chir|ochir|0)$/i.test(arg)) await st.put('auto', 'off');
    else return say(env, chat, `Avtomatik javob: <b>${(await st.get('auto')) === 'off' ? "o'chiq" : 'yoqilgan'}</b>\n/auto on yoki /auto off`);
    return say(env, chat, (await st.get('auto')) === 'off' ? "🤖 Avtomatik javob o'chirildi. Mijozlarga faqat siz javob berasiz." : '🤖 Avtomatik javob yoqildi. Murakkab savollar sizga uzatiladi.');
  }
  if (m.reply_to_message && !text.startsWith('/') && await supportOut(env, st, m)) return;
  if (m.reply_to_message && !text && await supportOut(env, st, m)) return;
  if (cmd === '/mijozlar') {
    const flt = arg.replace(/^#/, '').toLowerCase().trim(), ks = (await st.list('c:')).map((k) => ({ id: k.name.slice(2), ...(k.metadata || {}) })).filter((k) => !flt || String(k.g || '').split(',').includes(flt)).sort((a, b) => (b.t || 0) - (a.t || 0)).slice(0, 12);
    return say(env, chat, ks.length ? `👥 <b>Oxirgi mijozlar</b> (7 kun${flt ? ', #' + esc(flt) : ''})\n` + ks.map((k) => `• <b>${esc(k.n || 'Mijoz')}</b> <code>${k.id}</code>${k.p ? ' · ' + esc(k.p) : ''}${k.g ? ' · ' + String(k.g).split(',').map((x) => '#' + esc(x)).join(' ') : ''} · ${hm(k.t || 0)}`).join('\n') + '\n\nJavob: <code>/javob ID matn</code> · Teg: <code>/teg ID issiq</code>' : "Hozircha mijoz yo'q.");
  }
  if (cmd === '/teg') {
    const mm = /^(\d+)\s+(-?)#?([\p{L}\p{N}_]{2,20})$/u.exec(arg); if (!mm) return say(env, chat, 'Format: <code>/teg 123456 issiq</code> (olib tashlash: <code>/teg 123456 -issiq</code>)');
    const rec = await st.get('c:' + mm[1]); if (!rec) return say(env, chat, 'Mijoz topilmadi (7 kundan oldin yozgan bo\'lishi mumkin).');
    if (mm[2]) rec.tags = (rec.tags || []).filter((x) => x !== mm[3].toLowerCase()); else addTag(rec, mm[3].toLowerCase());
    await saveRec(st, Number(mm[1]), rec); return say(env, chat, `🏷 ${esc(rec.name || mm[1])}: ${(rec.tags || []).map((x) => '#' + esc(x)).join(' ') || 'teg yo\'q'}`);
  }
  if (cmd === '/haftalik') return say(env, chat, await weekly(env, st));
  if (cmd === '/javob') {
    const mm = /^(web:[A-Za-z0-9]{16,40}|\d+)\s+([\s\S]{1,3500})$/.exec(arg); if (!mm) return say(env, chat, 'Format: <code>/javob 123456 Salom, ...</code>');
    const to = /^\d+$/.test(mm[1]) ? Number(mm[1]) : mm[1], me = who(m), r = await deliver(env, st, to, mm[2], me);
    if (r) await st.put('own:' + to, { a: chat, n: me }, 2 * 3600);
    return say(env, chat, r ? '✅ Yuborildi.' : "Yuborilmadi (mijoz botni bloklagan yoki ID noto'g'ri).");
  }
  if (cmd === '/lidlar') {
    const ls = (await listLeads(st)).slice(0, 15);
    return say(env, chat, ls.length ? `🎯 <b>Oxirgi lidlar</b> (jami baza: /eksport)\n` + ls.map((l) => `• ${hm(l.t)} <b>${esc(l.n || 'Mijoz')}</b> ${esc(l.p)}${l.g ? ' #' + esc(l.g) : ''} · ${esc(l.s)}${l.x ? '\n   <i>' + esc(l.x.slice(0, 90)) + '</i>' : ''}`).join('\n') : "Hozircha lid yo'q.");
  }
  if (cmd === '/eksport') {
    const ls = await listLeads(st); if (!ls.length) return say(env, chat, "Eksport qilish uchun lid yo'q.");
    const csv = ['Sana,Ism,Telefon,Manba,Teg,Izoh', ...ls.map((l) => [new Date(l.t + TZ).toISOString().replace('T', ' ').slice(0, 16), l.n, l.p, l.s, l.g, l.x].map(csvCell).join(','))].join('\n');
    return (await sendDoc(env, chat, `lidlar-${dkey()}.csv`, csv, `🎯 Lidlar: ${ls.length} ta`)) ? undefined : say(env, chat, 'Fayl yuborilmadi.');
  }
  if (cmd === '/ban' || cmd === '/unban') {
    const to = Number(arg.trim()); if (!to) return say(env, chat, `Format: <code>${cmd} 123456</code>`);
    if (cmd === '/ban') await st.put('ban:' + to, 1); else await st.put('ban:' + to, null, 60);
    return say(env, chat, cmd === '/ban' ? `🚫 ${to} bloklandi (bot unga javob bermaydi).` : `✅ ${to} blokdan chiqarildi.`);
  }
  if (cmd === '/bilim') { // botni o'rgatish: qo'shimcha ma'lumotlar (aksiya, yangi narx, manzil va h.k.)
    const kb = (await st.get('kb')) || [], del = /^(?:o'?chir|del|delete)\s+(\d+)$/i.exec(arg);
    if (!arg) return say(env, chat, kb.length ? '🧠 <b>Bot bilimlari</b>\n' + kb.map((x, i) => `${i + 1}. ${esc(x)}`).join('\n') + "\n\nO'chirish: <code>/bilim ochir 2</code>" : "🧠 Qo'shimcha bilim yo'q.\nQo'shish: <code>/bilim Iyun oyida barcha saytlarga 20% chegirma</code>");
    if (del) { const n = Number(del[1]); if (!kb[n - 1]) return say(env, chat, "Bunday raqam yo'q."); kb.splice(n - 1, 1); await st.put('kb', kb); return say(env, chat, "🗑 O'chirildi."); }
    if (kb.length >= 30) return say(env, chat, "Eng ko'pi bilan 30 ta (keraksizini o'chiring).");
    kb.push(arg.slice(0, 400)); await st.put('kb', kb);
    return say(env, chat, `✅ Qo'shildi (${kb.length}). Endi bot mijozlarga shu ma'lumotni ham aytadi.`);
  }
  if (cmd === '/xabar') { // so'nggi mijozlarga ommaviy xabar (tasdiq bilan)
    const tm = /^#([\p{L}\p{N}_]+)\s+([\s\S]+)$/u.exec(arg), body = tm ? tm[2] : arg, tag = tm ? tm[1].toLowerCase() : '';
    if (!body) return say(env, chat, "Format: <code>/xabar Matn...</code> yoki <code>/xabar #issiq Matn...</code> (so'nggi 7 kundagi mijozlarga)");
    const to = (await st.list('c:')).filter((k) => !tag || String((k.metadata || {}).g || '').split(',').includes(tag)).map((k) => Number(k.name.slice(2))).filter(Boolean), id = Date.now().toString(36);
    await st.put('bc:' + id, { text: body.slice(0, 1500), to }, 1800);
    return say(env, chat, `📣 <b>Ko'rib chiqing</b> (${to.length} ta mijozga${tag ? ', #' + esc(tag) : ''} ketadi):\n\n${esc(body.slice(0, 1500))}`, { reply_markup: { inline_keyboard: [[{ text: `✅ Yuborish (${Math.min(to.length, 45)})`, callback_data: 'bc:' + id }]] } });
  }
  if (cmd === '/uchrashuvlar') { const bs = (await st.list('book:')).map((k) => k.metadata).filter((x) => x && x.at > Date.now() - 3600e3).sort((a, b) => a.at - b.at); return say(env, chat, bs.length ? '📅 <b>Uchrashuvlar</b>\n' + bs.map((x) => `• ${slotLabel(dkey(x.at).replace(/-/g, ''), tz(x.at).getUTCHours())} ${esc(x.n)} ${esc(x.p)}`).join('\n') : "Kelgusi uchrashuvlar yo'q."); }
  if (cmd === '/havola') {
    const nm = arg.toLowerCase().replace(/[^\w-]/g, '').slice(0, 30); const me = await tg(env, 'getMe', {}); const bot = (me && me.username) || 'improsupport_bot';
    if (nm) return say(env, chat, `🔗 <b>${esc(nm)}</b> manbasi uchun havola:\nhttps://t.me/${bot}?start=${nm}\nBu havola orqali kelganlar hisobotda ko'rinadi.`);
    const cnt = {}; for (let i = 0; i < 7; i++) for (const k of await st.list(`ev:${dkey(Date.now() - i * 864e5)}:`)) { const e = k.metadata; if (e && e.k === 'start' && e.x) cnt[e.x] = (cnt[e.x] || 0) + 1; }
    return say(env, chat, 'Format: <code>/havola instagram</code>\n\n' + (Object.keys(cnt).length ? '📈 7 kun manbalari: ' + Object.entries(cnt).map(([k, v]) => `${esc(k)} ${v}`).join(' · ') : "Hozircha manba bo'yicha mijoz yo'q."));
  }
  if (cmd === '/panel') { if (!ENV_ORIGIN) return say(env, chat, 'Panel manzili hali aniqlanmadi, /setup ni oching.'); return say(env, chat, '📱 Admin panelini oching:', { reply_markup: { inline_keyboard: [[{ text: '📊 Panel', web_app: { url: ENV_ORIGIN + '/app' } }]] } }); }
  if (cmd === '/zaxira') return say(env, chat, (await backup(env, st, [chat])) ? '💾 Zaxira yuborildi.' : 'Zaxira yuborilmadi.');
  if (cmd === '/oqit') {
    const q = (await st.get('unq')) || [], mm = /^(\d+)\s+([\s\S]{3,380})$/.exec(arg);
    if (mm) { const t = q[Number(mm[1]) - 1]; if (!t) return say(env, chat, "Bunday raqam yo'q."); const kb = (await st.get('kb')) || []; if (kb.length >= 30) return say(env, chat, "Bilim 30 taga to'lgan, /bilim bilan keraksizini o'chiring."); kb.push(('Savol: ' + t + ' Javob: ' + mm[2]).slice(0, 400)); await st.put('kb', kb); q.splice(Number(mm[1]) - 1, 1); await st.put('unq', q); return say(env, chat, "✅ O'rgandim. Keyingi safar shu savolga o'zim javob beraman."); }
    if (/^o'?chir\s+(\d+)$/i.test(arg)) { q.splice(Number(/(\d+)/.exec(arg)[1]) - 1, 1); await st.put('unq', q); return say(env, chat, "🗑 Olib tashlandi."); }
    return say(env, chat, q.length ? '🎓 <b>Bot javob bera olmagan savollar</b>\n' + q.map((x, i) => `${i + 1}. ${esc(x)}`).join('\n') + '\n\nO\'rgatish: <code>/oqit 1 Javob matni</code>\nOlib tashlash: <code>/oqit ochir 1</code>' : "Hozircha javobsiz savol yo'q.");
  }
  if (cmd === '/xatolar') { const ks = (await st.list('err:')).map((k) => k.metadata).filter(Boolean).sort((a, b) => b.t - a.t).slice(0, 12); return say(env, chat, ks.length ? '🐞 <b>Sayt xatolari</b> (14 kun)\n' + ks.map((e) => `• ×${e.n} ${esc(e.m.slice(0, 90))}\n   ${esc(e.u.slice(-60))}`).join('\n') : "✅ Saytda xato qayd etilmagan."); }
  if (cmd === '/kanal') return say(env, chat, '📣 ' + (await channelPost(env, st)));
  if (cmd === '/qongiroq') {
    const pushed = await pushPhone(env, 'Sinov', "Bu Impro IT botining sinov bildirishnomasi. Telefon ovozli ogohlantirish ishlayapti.", 5, 'white_check_mark');
    if (!env.CALL_USER) return say(env, chat, pushed ? '📱 Telefonga sinov bildirishnomasi yuborildi (ntfy ilovasini tekshiring).' : "Telefon bildirishnomasi sozlanmagan (NTFY_TOPIC).");
    if (false) return say(env, chat, "Qo'ng'iroq sozlanmagan. Telegram raqamingizni (CALL_USER) kiritish va @CallMeBot_txtbot ga /start yozish kerak.");
    const okc = await callOwner(env, st, 'Тестовый звонок. Бот Импро ай ти работает.');
    return say(env, chat, (pushed ? '📱 Telefonga bildirishnoma yuborildi. ' : '') + (okc ? "📞 Qo'ng'iroq yuborildi. Telegram qo'ng'irog'i kelishini kuting." : "Qo'ng'iroq yuborilmadi (tun 22:00-08:00, kunlik limit yoki @CallMeBot ruxsati yo'q)."));
  }
  if (cmd === '/hisobot') return say(env, chat, await report(env, st, /kecha/i.test(arg) ? dkey(Date.now() - 86400e3) : dkey()));
  if (cmd === '/test') { // admin botni mijoz sifatida sinab ko'radi (hech kimga yuborilmaydi)
    if (!arg) return say(env, chat, 'Format: <code>/test narx qancha?</code>');
    let a = null; try { a = await assistantOf(env).answer({ text: arg.slice(0, 800), history: [] }); } catch { a = null; }
    return say(env, chat, a && a.text ? `🧪 <b>Mijoz ko'radigan javob</b>${a.ai ? '' : ' (qoida)'}${a.handoff ? ' ⚠️ operatorga uzatiladi' : ''}:\n\n${esc(a.text)}` : 'Javob olinmadi.');
  }
  const help = "<b>Siz adminsiz.</b> Mijoz xabarlari va sayt so'rovlari shu yerga keladi.\n• Mijozga javob: uning xabariga <b>reply</b> qiling\n• /hisobot — bugungi hisobot (/hisobot kecha), /haftalik — haftalik hisobot\n• /lidlar — oxirgi lidlar, /eksport — barcha lidlar (CSV fayl)\n• /teg ID issiq — mijozga teg; /mijozlar #issiq; /xabar #issiq matn\n• /mijozlar — oxirgi mijozlar, /javob ID matn — ID bo'yicha javob\n• /bilim matn — botni o'rgatish (aksiya, narx...), /bilim — ro'yxat\n• /xabar matn — mijozlarga ommaviy xabar (tasdiq bilan)\n• /ban ID, /unban ID — bloklash\n• /xatolar — saytdagi xatolar ro'yxati\n• /oqit — botni javobsiz savollar bo'yicha o'rgatish, /zaxira — ma'lumot zaxirasi (har kuni 08:00 o'zi ham keladi)\n• /panel — Mini App paneli, /uchrashuvlar — band qilingan uchrashuvlar\n• /havola nom — manba havolasi, /kanal — kanalga blog post\n• /qongiroq — sinov qo'ng'irog'i\n• /test savol — botning mijozga javobini sinash\n• /auto on|off — avtomatik javob\n• /logout — chiqish\n\nBotni mijoz sifatida sinash uchun boshqa Telegram akkauntdan yozing yoki /test dan foydalaning.";
  if (cmd === '/start' || cmd === '/help') return say(env, chat, help);
  if (!m.reply_to_message) return say(env, chat, help); // admin oddiy matn yozdi: nima qilish kerakligini ko'rsatamiz
}

/* ---------- Statik saytdan kelgan so'rov ---------- */
async function relay(req, env) {
  const origin = req.headers.get('Origin') || '', allow = String(env.ALLOW_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!allow.length) allow.push('https://improuzbekiston.uz', 'https://www.improuzbekiston.uz'); allow.push(...APP_ORIGINS); // sozlanmagan bo'lsa ham begona saytlarga yopiq
  const okOrigin = allow.includes(origin);
  const cors = { 'Access-Control-Allow-Origin': okOrigin ? origin || '*' : 'null', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST' || !okOrigin) return new Response("Ruxsat yo'q", { status: 403, headers: cors });
  const st = store(env);
  if (await limited(st, 'ip:' + (req.headers.get('CF-Connecting-IP') || 'x'), 8, 600)) return new Response("Juda ko'p so'rov", { status: 429, headers: cors });
  let p; try { p = await req.json(); } catch { return new Response("Noto'g'ri so'rov", { status: 400, headers: cors }); }
  const name = String(p.name || '').trim().slice(0, 80), phone = String(p.phone || '').trim().slice(0, 40);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 7) return new Response('Ism va telefon kerak', { status: 400, headers: cors });
  const L = [`<b>${KIND[p.type] || KIND.message}</b>${p.site ? ' · ' + esc(p.site) : ''}`, `👤 ${esc(name)}`, `📞 ${esc(phone)}`];
  for (const [k, v] of Object.entries(p.extra || {}).slice(0, 30)) if (v) L.push(`• ${esc(String(k).slice(0, 40))}: ${esc(String(v).slice(0, 300))}`);
  if (Array.isArray(p.items) && p.items.length) L.push('🧾 ' + p.items.slice(0, 20).map((i) => `${esc(String(i.name).slice(0, 60))} ×${Number(i.qty) || 1}`).join(', '));
  if (p.message) L.push('', esc(String(p.message).slice(0, 1500)));
  if (p.page) L.push('', `🔗 ${esc(String(p.page).slice(0, 200))}`);
  const admins = await adminsOf(env, st);
  const flat = [p.message, ...Object.values(p.extra || {}).map(String)].join(' ');
  const lx = p.message || Object.values(p.extra || {}).filter(Boolean).slice(0, 3).join(', ');
  await ev(st, { k: 'lead', n: name, p: phone, x: lx });
  const urgentLead = isUrgent(flat) || /shoshilinch/i.test(JSON.stringify(p.extra || {}));
  await saveLead(st, { n: name, p: phone, s: 'sayt', x: lx, g: leadTemp({ phone: true, anketa: p.type === 'brief', urgent: urgentLead, budget: JSON.stringify(p.extra || {}) }) });
  const res = await Promise.all(admins.map((a) => say(env, a, L.join('\n').slice(0, 4000)).then((r) => !!r)));
  if (!res.some(Boolean)) return new Response('Yuborilmadi', { status: 502, headers: cors });
  if (urgentLead) await raiseUrgent(env, st, { chat: 0, name, phone, text: p.message || flat });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
}

/* ---------- Sayt loyihasi, uchrashuv, mini ilova, manbalar, kanal, himoya ---------- */
let ENV_REF = null, ENV_ORIGIN = '';
// Tashqi xizmatlar (ixtiyoriy): Google Sheets (Apps Script) va email (Resend)
async function notifyExtra(env, kind, o) {
  try {
    if (env.SHEETS_URL && kind === 'lead') await fetch(env.SHEETS_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sana: new Date(o.t + TZ).toISOString().replace('T', ' ').slice(0, 16), ism: o.n, telefon: o.p, manba: o.s, teg: o.g, havola: o.r || '', izoh: o.x }), signal: AbortSignal.timeout(10000) });
    if (env.RESEND_KEY && env.EMAIL_TO) await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + env.RESEND_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ from: env.EMAIL_FROM || 'Impro IT Bot <onboarding@resend.dev>', to: [env.EMAIL_TO], subject: kind === 'urgent' ? '🔥 Shoshilinch mijoz' : `Yangi lid: ${o.n || ''} ${o.p || ''}`, html: `<p><b>${esc(o.n || '')}</b> ${esc(o.p || '')}</p><p>${esc(o.x || '')}</p><p>Manba: ${esc(o.s || '')}${o.g ? ' #' + esc(o.g) : ''}</p>` }), signal: AbortSignal.timeout(10000) });
  } catch { /* ixtiyoriy xizmat xatosi asosiy ishni to'xtatmaydi */ }
}
// Shablon tanlash: biznes tavsifi bo'yicha eng mos shablon
function pickTemplate(text) {
  const d = ' ' + String(text || '').toLowerCase().replace(/[ʻʼ'’`]/g, '') + ' ', list = SITE.templates || []; let best = null, bs = 0;
  for (const t of list) { let s = 0; for (const w of [t.id, t.name, t.cat, ...(t.tags || [])]) { const x = String(w || '').toLowerCase().replace(/[ʻʼ'’`]/g, '').trim(); if (x.length < 3) continue; if (d.includes(x)) s += x.length > 4 ? 3 : 2; else if (x.length > 5 && d.includes(x.slice(0, x.length - 2))) s += 1; } if (s > bs) { bs = s; best = t; } }
  return best || list.find((t) => t.id === 'kompaniya') || list[0] || null;
}
async function siteAsk(env, st, chat, rec) { rec.flow = { step: 'site', d: {} }; await saveRec(st, chat, rec); return say(env, chat, "🎯 <b>Biznesingizni qisqa yozing</b> (masalan: «stomatologiya klinikasi» yoki «gul do'koni»), men eng mos sayt shablonini tanlab beraman. Bekor qilish: /cancel"); }
async function siteProposal(env, st, chat, rec, text) {
  const t = pickTemplate(text); rec.flow = null; addTag(rec, 'sayt-qiziqish'); await saveRec(st, chat, rec);
  if (!t) return say(env, chat, "Hozir shablon topilmadi. Mutaxassisimiz yordam beradi: savolingizni yozing.");
  await ev(st, { k: 'menu', c: chat, n: rec.name, x: 'site:' + t.id });
  return say(env, chat, `🌐 <b>Sizga mos shablon: ${esc(t.name)}</b> (${esc(t.cat)})\n${esc(t.desc || '')}\n\n1) Jonli namuna: https://improuzbekiston.uz/demo/${t.id}/\n2) O'zingiz sozlash (matn, rasm, ranglar bepul): https://improuzbekiston.uz/yaratish.html?t=${t.id}\n\nTayyor saytni yuklab olish yoki e'lon qilish uchun bir martalik $10. Biz tayyorlab berishimizni xohlasangiz, telefon raqamingizni yozing.`, { reply_markup: { inline_keyboard: [[{ text: '👀 Namuna', url: `https://improuzbekiston.uz/demo/${t.id}/` }, { text: "🛠 O'zim sozlayman", url: `https://improuzbekiston.uz/yaratish.html?t=${t.id}` }]] } });
}
// Uchrashuv band qilish: Du–Sha, 10/12/15/17 (Toshkent), keyingi 3 ish kuni
const SLOT_HOURS = [10, 12, 15, 17], DOW = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'];
const slotAt = (ymd, hh) => Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8), hh - 5, 0);
const slotLabel = (ymd, hh) => `${DOW[new Date(slotAt(ymd, hh) + TZ).getUTCDay()]} ${ymd.slice(6, 8)}.${ymd.slice(4, 6)} ${String(hh).padStart(2, '0')}:00`;
async function freeSlots(st, now = Date.now()) {
  const out = [];
  for (let i = 0; i < 8 && out.length < 12; i++) {
    const t = now + i * 864e5, d = tz(t); if (d.getUTCDay() === 0) continue;
    const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
    for (const hh of SLOT_HOURS) { if (slotAt(ymd, hh) < now + 2 * 3600e3) continue; if (await st.get('slot:' + ymd + ':' + hh)) continue; out.push([ymd, hh]); if (out.length >= 12) break; }
  }
  return out;
}
async function bookStart(env, st, chat) {
  const sl = await freeSlots(st); if (!sl.length) return say(env, chat, "Hozircha bo'sh vaqt yo'q. Telefon raqamingizni yozing, o'zimiz bog'lanamiz.");
  const rows = []; for (let i = 0; i < sl.length; i += 2) rows.push(sl.slice(i, i + 2).map(([y, h]) => ({ text: slotLabel(y, h), callback_data: `bk:${y}:${h}` })));
  return say(env, chat, '📅 <b>Uchrashuv uchun qulay vaqtni tanlang</b> (Toshkent vaqti, ~15–20 daqiqa, bepul maslahat):', { reply_markup: { inline_keyboard: rows } });
}
async function bookFinish(env, st, chat, rec, name, ymd, hh) {
  const at = slotAt(ymd, hh), id = at.toString(36), lab = slotLabel(ymd, hh);
  await st.put('book:' + id + ':' + chat, { c: chat, n: name, p: rec.phone, at }, 0, { t: Date.now(), at, n: String(name).slice(0, 40), p: rec.phone || '', c: chat });
  addTag(rec, 'uchrashuv'); await saveRec(st, chat, rec);
  await saveLead(st, { c: chat, n: name, p: rec.phone, s: 'uchrashuv', x: lab, g: 'issiq', r: rec.src });
  for (const a of await adminsOf(env, st)) await say(env, a, `📅 <b>Yangi uchrashuv</b>\n👤 ${esc(name)} <code>${chat}</code>\n🕒 <b>${lab}</b> (Toshkent)\n📞 ${esc(rec.phone || '')}`, { reply_markup: { inline_keyboard: [[{ text: `📞 ${rec.phone}`, url: 'https://t.me/' + rec.phone }]] } });
  await scheduleFollow(st, { c: chat, k: 'bk', due: at - 3600e3, n: name, p: rec.phone, at, lab });
  return say(env, chat, `✅ <b>Uchrashuv band qilindi: ${lab}</b>\nBir soat oldin eslatib qo'yamiz. Mutaxassisimiz siz bilan ${esc(rec.phone || 'telefon')} orqali bog'lanadi.`);
}
// Telegram Mini App (admin paneli): initData HMAC tekshiruvi
async function verifyInit(env, initData) {
  try {
    const p = new URLSearchParams(initData), hash = p.get('hash'); if (!hash) return null; p.delete('hash');
    const str = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n'), enc = new TextEncoder();
    const hmac = async (key, data) => new Uint8Array(await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(data)));
    const hex = [...(await hmac(await hmac(enc.encode('WebAppData'), env.TG_TOKEN), str))].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (!tEq(hex, hash) || Date.now() / 1000 - Number(p.get('auth_date') || 0) > 86400) return null;
    return JSON.parse(p.get('user') || 'null');
  } catch { return null; }
}
const APP_HTML = `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Impro IT panel</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>
:root{--bg:var(--tg-theme-bg-color,#0b1020);--ink:var(--tg-theme-text-color,#eef1ff);--mut:var(--tg-theme-hint-color,#9aa6c4);--card:var(--tg-theme-secondary-bg-color,#141b30);--acc:var(--tg-theme-button-color,#22d3ee);--on:var(--tg-theme-button-text-color,#04101c)}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--ink);padding:0 0 70px}
header{padding:16px 16px 6px}h1{font-size:20px;margin:0}small,.m{color:var(--mut)}.tabs{display:flex;gap:6px;padding:8px 12px;overflow:auto;position:sticky;top:0;background:var(--bg);z-index:2}
.tabs button{border:0;background:var(--card);color:var(--ink);padding:8px 14px;border-radius:99px;font:inherit;white-space:nowrap}.tabs button.on{background:var(--acc);color:var(--on)}
main{padding:8px 12px}.card{background:var(--card);border-radius:14px;padding:12px 14px;margin:8px 0}.row{display:flex;justify-content:space-between;gap:10px}.kpi{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kpi .card{margin:0}.kpi b{font-size:26px;display:block}
.bars{display:flex;align-items:flex-end;gap:6px;height:90px;margin-top:8px}.bars i{flex:1;background:var(--acc);border-radius:5px 5px 0 0;min-height:3px;position:relative}.bars i span{position:absolute;bottom:-18px;left:0;right:0;text-align:center;font-size:10px;color:var(--mut);font-style:normal}
input,button.b{font:inherit}input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #8884;background:transparent;color:var(--ink)}button.b{border:0;background:var(--acc);color:var(--on);padding:10px 16px;border-radius:10px;margin-top:8px}.t{display:inline-block;font-size:12px;padding:1px 8px;border-radius:99px;background:#22d3ee33;margin-right:4px}a{color:var(--acc)}
</style></head><body><header><h1>Impro IT panel</h1><small id="sub">Yuklanmoqda…</small></header><div class="tabs" id="tabs"></div><main id="main"></main><script>
const tg=window.Telegram&&Telegram.WebApp;if(tg){tg.ready();tg.expand()}
const $=(s)=>document.querySelector(s),esc=(s)=>String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const api=async(action,data)=>{const r=await fetch('/api/app',{method:'POST',headers:{'Content-Type':'application/json','X-Init-Data':(tg&&tg.initData)||''},body:JSON.stringify({action,...(data||{})})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Xato');return j};
const TABS=[['sum','Umumiy'],['leads','Lidlar'],['cust','Mijozlar'],['book','Uchrashuv'],['kb','Bilim']];let tab='sum';
function tabs(){$('#tabs').innerHTML=TABS.map(([k,t])=>'<button class="'+(k===tab?'on':'')+'" data-t="'+k+'">'+t+'</button>').join('')}
const date=(t)=>new Date(t+5*3600e3).toISOString().slice(5,16).replace('T',' ');
async function show(){tabs();const m=$('#main');m.innerHTML='<p class="m">Yuklanmoqda…</p>';try{
if(tab==='sum'){const j=await api('summary');const mx=Math.max(1,...j.days.map((d)=>d.n));m.innerHTML='<div class="kpi">'+[['Mijozlar (bugun)',j.today.chats],['Lidlar (bugun)',j.today.leads],['Shoshilinch (bugun)',j.today.urgent],['Bot javoblari',j.today.bot],['7 kun: mijozlar',j.week.chats],['7 kun: lidlar',j.week.leads]].map((x)=>'<div class="card"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div><div class="card"><small>Oxirgi 7 kun: xabarlar</small><div class="bars">'+j.days.map((d)=>'<i style="height:'+Math.round(d.n/mx*100)+'%"><span>'+d.d+'</span></i>').join('')+'</div><div style="height:18px"></div></div>'+(j.src.length?'<div class="card"><small>Manbalar</small>'+j.src.map((s)=>'<div class="row"><span>'+esc(s[0])+'</span><b>'+s[1]+'</b></div>').join('')+'</div>':'')}
else if(tab==='leads'){const j=await api('leads');m.innerHTML='<input id="q" placeholder="Qidirish (ism, telefon, izoh)…"><div id="ls"></div>';const draw=()=>{const q=$('#q').value.toLowerCase();$('#ls').innerHTML=j.leads.filter((l)=>!q||JSON.stringify(l).toLowerCase().includes(q)).map((l)=>'<div class="card"><div class="row"><b>'+esc(l.n||'Mijoz')+'</b><small>'+date(l.t)+'</small></div><div><a href="tel:'+esc(l.p)+'">'+esc(l.p)+'</a> '+(l.g?'<span class="t">#'+esc(l.g)+'</span>':'')+'<span class="t">'+esc(l.s)+'</span></div><small>'+esc(l.x)+'</small></div>').join('')||'<p class="m">Hech narsa yo\\'q</p>'};$('#q').oninput=draw;draw()}
else if(tab==='cust'){const j=await api('customers');m.innerHTML=j.customers.map((c)=>'<div class="card"><div class="row"><b>'+esc(c.n||'Mijoz')+'</b><small>'+date(c.t)+'</small></div><small>ID '+esc(c.id)+(c.p?' · '+esc(c.p):'')+'</small><div>'+String(c.g||'').split(',').filter(Boolean).map((x)=>'<span class="t">#'+esc(x)+'</span>').join('')+'</div></div>').join('')||'<p class="m">Mijoz yo\\'q</p>'}
else if(tab==='book'){const j=await api('bookings');m.innerHTML=j.bookings.map((b)=>'<div class="card"><div class="row"><b>'+date(b.at)+'</b><small>Toshkent</small></div>'+esc(b.n)+' · <a href="tel:'+esc(b.p)+'">'+esc(b.p)+'</a></div>').join('')||'<p class="m">Kelgusi uchrashuvlar yo\\'q</p>'}
else if(tab==='kb'){const j=await api('kb');m.innerHTML='<div class="card"><small>Botga yangi ma\\'lumot o\\'rgatish (aksiya, narx, manzil…)</small><input id="kbt" maxlength="400" placeholder="Masalan: Iyun oyida barcha saytlarga 20% chegirma"><button class="b" id="kba">Qo\\'shish</button></div>'+j.kb.map((x,i)=>'<div class="card row"><span>'+esc(x)+'</span><button class="b" data-d="'+(i+1)+'" style="margin:0;padding:6px 10px">×</button></div>').join('');$('#kba').onclick=async()=>{const v=$('#kbt').value.trim();if(v){await api('kb_add',{text:v});show()}};m.querySelectorAll('[data-d]').forEach((b)=>b.onclick=async()=>{await api('kb_del',{n:+b.dataset.d});show()})}
$('#sub').textContent='Tayyor'}catch(e){m.innerHTML='<div class="card">'+esc(e.message)+'<br><small>Bu panel faqat adminlar uchun, Telegram ichida oching.</small></div>';$('#sub').textContent='Xato'}}
$('#tabs').onclick=(e)=>{const b=e.target.closest('button');if(b){tab=b.dataset.t;show()}};show();
</script></body></html>`;
async function appApi(req, env) {
  const st = store(env), json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  const u = await verifyInit(env, req.headers.get('X-Init-Data') || ''); if (!u || !(await adminsOf(env, st)).includes(Number(u.id))) return json({ error: "Ruxsat yo'q" }, 403);
  let b = {}; try { b = await req.json(); } catch { /* bo'sh */ }
  const now = Date.now();
  if (b.action === 'summary') {
    const day = async (t) => (await st.list(`ev:${dkey(t)}:`)).map((k) => k.metadata).filter(Boolean);
    const days = []; let week = [], today = [];
    for (let i = 6; i >= 0; i--) { const ev7 = await day(now - i * 864e5); week = week.concat(ev7); if (i === 0) today = ev7; days.push({ d: dkey(now - i * 864e5).slice(8), n: ev7.filter((e) => e.k === 'msg').length }); }
    const agg = (a) => ({ chats: new Set(a.filter((e) => e.k === 'msg').map((e) => e.c)).size, leads: a.filter((e) => e.k === 'lead').length, urgent: a.filter((e) => e.k === 'urgent').length, bot: a.filter((e) => e.k === 'bot' || e.k === 'menu').length });
    const src = Object.entries(week.filter((e) => e.k === 'start' && e.x).reduce((o, e) => { o[e.x] = (o[e.x] || 0) + 1; return o; }, {})).sort((a, c) => c[1] - a[1]).slice(0, 8);
    return json({ today: agg(today), week: agg(week), days, src });
  }
  if (b.action === 'leads') return json({ leads: (await listLeads(st)).slice(0, 100) });
  if (b.action === 'customers') return json({ customers: (await st.list('c:')).map((k) => ({ id: k.name.slice(2), ...(k.metadata || {}) })).sort((a, c) => (c.t || 0) - (a.t || 0)).slice(0, 60) });
  if (b.action === 'bookings') return json({ bookings: (await st.list('book:')).map((k) => k.metadata).filter((m) => m && m.at > now - 3600e3).sort((a, c) => a.at - c.at).slice(0, 50) });
  if (b.action === 'kb') return json({ kb: (await st.get('kb')) || [] });
  if (b.action === 'kb_add') { const kb = (await st.get('kb')) || [], t = String(b.text || '').trim().slice(0, 400); if (!t || kb.length >= 30) return json({ error: 'Matn bo\'sh yoki 30 ta to\'lgan' }, 400); kb.push(t); await st.put('kb', kb); return json({ ok: true }); }
  if (b.action === 'kb_del') { const kb = (await st.get('kb')) || [], n = Number(b.n); if (!kb[n - 1]) return json({ error: 'Topilmadi' }, 404); kb.splice(n - 1, 1); await st.put('kb', kb); return json({ ok: true }); }
  return json({ error: 'Noma\'lum amal' }, 400);
}
// Spam: ko'p havola, kazino/kripto/stavka so'zlari yoki bir xil matn takrori
const SPAMW = /casino|kazino|казино|crypto|kripto|крипт|bitcoin|forex|форекс|stavk|ставк|1xbet|заработ|инвестиц|18\+/i;
const isSpam = (text) => ((text.match(/(?:https?:\/\/|t\.me\/|www\.)\S+/gi) || []).length >= 2) || SPAMW.test(text);
// Kanalga blog post: yangi (hali yuborilmagan) maqola
async function channelPost(env, st) {
  if (!env.CHANNEL_ID) return 'CHANNEL_ID sozlanmagan';
  for (const b of SITE.blog || []) {
    if (await st.get('chp:' + b.slug)) continue;
    const r = await tg(env, 'sendMessage', { chat_id: env.CHANNEL_ID, parse_mode: 'HTML', text: `📰 <b>${esc(b.title)}</b>\n\n${esc(b.desc || '')}\n\n👉 https://improuzbekiston.uz/blog/${b.slug}/\n\n🌐 Sayt yaratish: https://improuzbekiston.uz/yaratish.html` });
    if (!r) return 'Yuborilmadi (bot kanalga admin qilinganmi?)';
    await st.put('chp:' + b.slug, 1, 0); return 'Yuborildi: ' + b.title;
  }
  return "Yangi maqola yo'q";
}


// Zaxira: lidlar CSV + mijozlar/bilim JSON adminlarga fayl bo'lib boradi
async function backup(env, st, admins) {
  const ls = await listLeads(st), cs = (await st.list('c:')).map((k) => ({ id: k.name.slice(2), ...(k.metadata || {}) })), kb = (await st.get('kb')) || [];
  const csv = ['Sana,Ism,Telefon,Manba,Teg,Havola,Izoh', ...ls.map((l) => [new Date(l.t + TZ).toISOString().replace('T', ' ').slice(0, 16), l.n, l.p, l.s, l.g, l.r, l.x].map(csvCell).join(','))].join('\n');
  let ok = 0;
  for (const a of admins) { if (await sendDoc(env, a, `zaxira-lidlar-${dkey()}.csv`, csv, `💾 Zaxira: ${ls.length} lid, ${cs.length} mijoz, ${kb.length} bilim`)) ok++; await sendDoc(env, a, `zaxira-baza-${dkey()}.json`, JSON.stringify({ kb, customers: cs, leads: ls }, null, 1)); }
  return ok;
}
// Javobsiz savollar: bot o'rganishi uchun (/oqit)
async function unqAdd(st, text) { try { const q = ((await st.get('unq')) || []).filter((x) => x !== text.slice(0, 200)); q.push(text.slice(0, 200)); await st.put('unq', q.slice(-20)); } catch { /* ixtiyoriy */ } }
// Narx kalkulyatori: saytdagi xizmatlar narxlaridan yig'iladi
const calcServices = () => { const sec = (SITE.sections || []).find((x) => (x.services || []).length); return sec ? sec.services : []; };
const fmtSum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const calcKb = (sel) => { const sv = calcServices(); return { inline_keyboard: [...sv.map((x, i) => [{ text: (sel.includes(i) ? '✅ ' : '▫️ ') + x.name + ' — ' + fmtSum(x.price), callback_data: 'cl:' + i }]), [{ text: '🧮 Hisoblash', callback_data: 'cl:go' }]] }; };
async function calcStart(env, st, chat, rec) { rec.calc = []; await saveRec(st, chat, rec); return say(env, chat, '🧮 <b>Narx kalkulyatori</b>\nKerakli xizmatlarni belgilang, so\'ng «Hisoblash» ni bosing:', { reply_markup: calcKb([]) }); }
async function calcCallback(env, st, q, arg) {
  const chat = q.message.chat.id, rec = (await st.get('c:' + chat)) || { hist: [], name: who({ from: q.from }) }, sv = calcServices(), sel = rec.calc || [];
  if (arg === 'go') {
    if (!sel.length) return say(env, chat, 'Avval kamida bitta xizmatni belgilang.');
    const pick = sel.map((i) => sv[i]).filter(Boolean), tot = pick.reduce((a, x) => a + (Number(x.price) || 0), 0);
    addTag(rec, 'kalkulyator'); rec.calc = []; await saveRec(st, chat, rec); await ev(st, { k: 'menu', c: chat, n: rec.name, x: 'calc:' + tot });
    return say(env, chat, '🧮 <b>Taxminiy hisob</b>\n' + pick.map((x) => `• ${esc(x.name)}: ${fmtSum(x.price)} so'mdan (${esc(x.days || '')})`).join('\n') + `\n\n💰 <b>Jami: ${fmtSum(tot)} so'mdan</b>\nAniq narx loyiha hajmiga bog'liq. Bepul maslahat uchun uchrashuv band qiling yoki telefon raqamingizni yozing.`, { reply_markup: { inline_keyboard: [[{ text: '📅 Uchrashuv', callback_data: 'm:book' }]] } });
  }
  const i = Number(arg); if (!sv[i]) return;
  rec.calc = sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]; await saveRec(st, chat, rec);
  return tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: calcKb(rec.calc) });
}
// Sog'liq nazorati: webhook yo'qolsa yoki Telegram xato bersa adminga xabar (6 soatda bir marta), imkon bo'lsa o'zi tuzatadi
async function health(env, st, admins, now) {
  try {
    const wi = await tg(env, 'getWebhookInfo', {}); let problem = '';
    if (!wi) problem = 'Telegram bilan aloqa yo\'q (token noto\'g\'ri bo\'lishi mumkin)';
    else if (!wi.url) { const o = await st.get('origin'); if (o && env.WEBHOOK_SECRET) { const r = await tg(env, 'setWebhook', { url: o + '/hook/' + env.WEBHOOK_SECRET, secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message', 'callback_query'] }); problem = r ? '' : 'Webhook yo\'q edi, tiklashga urinildi: bo\'lmadi'; if (r) await st.put('hl:healed', now, 86400); } else problem = 'Webhook o\'rnatilmagan: /setup ni oching'; }
    else if (wi.last_error_date && now / 1000 - wi.last_error_date < 600) problem = 'Telegram yetkazishda xato: ' + String(wi.last_error_message || '').slice(0, 120);
    if (!problem) { await st.put('hl:ok', now, 3600); return; }
    if (await st.get('hl:alert')) return; await st.put('hl:alert', 1, 6 * 3600);
    for (const a of admins) await say(env, a, '🩺 <b>Bot sog\'ligi: muammo</b>\n' + esc(problem));
    await pushPhone(env, 'Bot muammosi', problem, 4, 'warning');
  } catch { /* nazorat o'zi bot ishini to'xtatmasin */ }
}

// Sayt xatolari: brauzerdan keladi, takrorlari sanaladi, yangisi adminga xabar bo'ladi
const hash36 = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
async function errApi(req, env) {
  const origin = req.headers.get('Origin') || '', allow = String(env.ALLOW_ORIGIN || 'https://improuzbekiston.uz,https://www.improuzbekiston.uz').split(',').map((x) => x.trim()).concat(APP_ORIGINS), okO = allow.includes(origin);
  const cors = { 'Access-Control-Allow-Origin': okO ? origin : 'null', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST' || !okO) return new Response('no', { status: 403, headers: cors });
  const st = store(env);
  if (await limited(st, 'eip:' + (req.headers.get('CF-Connecting-IP') || 'x'), 15, 3600) || await limited(st, 'eall', 300, 3600)) return new Response('limit', { status: 429, headers: cors });
  const raw = await req.text(); if (raw.length > 400000) return new Response('big', { status: 413, headers: cors });
  let p; try { p = JSON.parse(raw); } catch { return new Response('bad', { status: 400, headers: cors }); }
  const m = String(p.m || '').slice(0, 300); if (!m) return new Response('bad', { status: 400, headers: cors });
  const key = 'err:' + hash36(m + '|' + (p.s || '') + '|' + (p.l || 0)), cur = await st.get(key), now = Date.now(), page = String(p.u || '').slice(0, 200);
  const rec = cur || { m, s: String(p.s || '').slice(0, 200), l: Number(p.l) || 0, st: String(p.st || '').slice(0, 500), u: page, ua: String(p.ua || '').slice(0, 120), w: Number(p.w) || 0, h: Number(p.h) || 0, c: Number(p.c) || 0, sec: String(p.sec || '').slice(0, 120), el: String(p.el || '').slice(0, 160), lang: String(p.lang || '').slice(0, 5), f: now, n: 0 };
  rec.n++; rec.t = now; rec.u = page || rec.u;
  await st.put(key, rec, 14 * 86400, { t: now, m: m.slice(0, 120), u: page.slice(0, 90), n: rec.n, s: String(rec.s).slice(-60), l: rec.l });
  if (rec.n === 1) {
    const cap = `🐞 <b>Saytda xato</b>\n<b>${esc(m)}</b>\n\n📄 Sahifa: ${esc(page)}\n🧩 Fayl: ${esc(rec.s.slice(-80) || '—')}${rec.l ? ` · qator ${rec.l}${rec.c ? ':' + rec.c : ''}` : ''}\n📍 Ekran joyi: ${esc(rec.sec || '—')}${rec.el ? `\n🔗 Element: <code>${esc(rec.el)}</code>` : ''}\n📱 ${esc(rec.ua.slice(0, 70))} · ${rec.w}×${rec.h}${rec.lang ? ' · ' + esc(rec.lang) : ''}${rec.st ? `\n\n<code>${esc(rec.st.slice(0, 380))}</code>` : ''}`.slice(0, 1020);
    let img = null; const mm = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(p.img || ''));
    if (mm && mm[1].length < 300000) { try { const bin = atob(mm[1]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); img = new Blob([u8], { type: 'image/jpeg' }); } catch { img = null; } }
    for (const a of await adminsOf(env, st)) {
      let ok = false;
      if (img) { const fd = new FormData(); fd.append('chat_id', String(a)); fd.append('caption', cap); fd.append('parse_mode', 'HTML'); fd.append('photo', img, 'xato.jpg'); try { const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendPhoto`, { method: 'POST', body: fd }); ok = !!((await r.json().catch(() => ({}))).ok); } catch { ok = false; } }
      if (!ok) await say(env, a, cap, { disable_notification: true });
    }
  }
  return new Response('ok', { status: 200, headers: cors });
}

// Ommaviy jonli ko'rsatkichlar (faqat yig'ma sonlar, shaxsiy ma'lumotsiz): investor sahifasi uchun
async function statsApi(req, env) {
  const origin = req.headers.get('Origin') || '', allow = String(env.ALLOW_ORIGIN || 'https://improuzbekiston.uz,https://www.improuzbekiston.uz').split(',').map((x) => x.trim()).concat(APP_ORIGINS);
  const cors = { 'Access-Control-Allow-Origin': allow.includes(origin) ? origin : 'https://improuzbekiston.uz', Vary: 'Origin', 'Cache-Control': 'public, max-age=300', 'Content-Type': 'application/json' };
  const st = store(env); if (await limited(st, 'sip:' + (req.headers.get('CF-Connecting-IP') || 'x'), 30, 600)) return new Response('{}', { status: 429, headers: cors });
  const days = []; let all = [];
  for (let i = 6; i >= 0; i--) { const t = Date.now() - i * 864e5, ev7 = (await st.list(`ev:${dkey(t)}:`)).map((k) => k.metadata).filter(Boolean); all = all.concat(ev7); days.push({ d: dkey(t).slice(8) + '.' + dkey(t).slice(5, 7), n: ev7.filter((e) => e.k === 'msg').length }); }
  return new Response(JSON.stringify({ chats: new Set(all.filter((e) => e.k === 'msg').map((e) => e.c)).size, leads: all.filter((e) => e.k === 'lead').length, bot: all.filter((e) => e.k === 'bot' || e.k === 'menu').length, days }), { headers: cors });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url); ENV_ORIGIN = url.origin;
    if (url.pathname === '/setup' && env.SETUP_KEY) { // bir marta ochiladi: webhook o'rnatadi
      if (!tEq(url.searchParams.get('key') || '', env.SETUP_KEY)) return new Response('no', { status: 403 });
      if (!env.WEBHOOK_SECRET || !env.TG_TOKEN) return new Response('TG_TOKEN va WEBHOOK_SECRET kerak', { status: 400 });
      try { await store(env).put('origin', url.origin); } catch { /* ixtiyoriy */ }
      const wr = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/setWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: `${url.origin}/hook/${env.WEBHOOK_SECRET}`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message', 'callback_query'], drop_pending_updates: false }) }), wj = await wr.json().catch(() => ({})), w = wj.ok ? wj.result : null;
      await tg(env, 'setChatMenuButton', { chat_id: Number(String(env.TG_CHAT || '').split(',')[0]) || undefined, menu_button: { type: 'web_app', text: 'Panel', web_app: { url: url.origin + '/app' } } });
      await tg(env, 'setMyCommands', { commands: [{ command: 'start', description: 'Boshlash' }] });
      const me = await tg(env, 'getMe', {});
      return new Response(JSON.stringify({ webhook: !!w, ...(w ? {} : { error: wj.description || 'noma\'lum' }), bot: me && me.username, store: env.DB ? 'd1' : env.STATE ? 'kv' : 'xotira', ai: env.ANTHROPIC_API_KEY ? 'claude' : env.AI ? 'workers-ai' : false }), { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname.startsWith('/hook/')) {
      if (req.method !== 'POST' || !env.WEBHOOK_SECRET || !tEq(url.pathname.slice(6), env.WEBHOOK_SECRET) || !tEq(req.headers.get('X-Telegram-Bot-Api-Secret-Token') || '', env.WEBHOOK_SECRET)) return new Response('no', { status: 403 });
      let upd; try { upd = await req.json(); } catch { return new Response('ok'); }
      const work = handleUpdate(env, upd).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
      return new Response('ok');
    }
    if (url.pathname === '/app' && req.method === 'GET') return new Response(APP_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    if (url.pathname === '/api/app' && req.method === 'POST') return appApi(req, env);
    if (url.pathname === '/stats' && req.method === 'GET') return statsApi(req, env);
    if (url.pathname === '/err') return errApi(req, env);
    if (url.pathname === '/errors' && env.SETUP_KEY && tEq(url.searchParams.get('key') || '', env.SETUP_KEY)) { const ks = (await store(env).list('err:')).map((k) => k.metadata).filter(Boolean).sort((a, b) => b.t - a.t).slice(0, 50); return new Response(JSON.stringify(ks), { headers: { 'content-type': 'application/json' } }); }
    if (url.pathname === '/chat') return chatApi(req, env);
    return relay(req, env);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(tick(env)); },
  handleUpdate, tick, report, store,
};
