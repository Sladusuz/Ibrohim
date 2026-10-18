// Impro IT: Cloudflare Worker. Ikki vazifa:
//  1) Telegram yordam boti (webhook): mijoz savoliga avtomatik javob (AI yoki qoidalar), murakkab savol adminga uzatiladi.
//  2) Statik saytdagi forma so'rovlarini Telegram'ga yetkazish (POST /).
// Holat (yozishmalar, adminlar) KV (STATE) da saqlanadi. Bu fayl tools/build-worker.js bilan yig'iladi: makeAssistant, SITE, PRICING shu yerga kiritiladi.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const KIND = { order: '🛒 Yangi buyurtma', booking: '📅 Yangi ariza', message: '✉️ Yangi xabar', brief: "📝 Yangi loyiha so'rovi" };

/* ---------- Holat (KV yoki xotira) ---------- */
const MEM = new Map();
const store = (env) => env.STATE
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
  return { good: n('good'), bad: n('bad'), keys, msg: n('msg'), bot: n('bot'), chats: new Set(keys.filter((e) => e.k === 'msg').map((e) => e.c)).size, leads: keys.filter((e) => e.k === 'lead'), hand: keys.filter((e) => e.k === 'handoff'), urg: keys.filter((e) => e.k === 'urgent') };
}
async function report(env, st, day) {
  const keys = (await st.list(`ev:${day}:`)).map((k) => k.metadata).filter(Boolean).sort((a, b) => a.t - b.t);
  const n = (k) => keys.filter((e) => e.k === k).length, chats = new Set(keys.filter((e) => e.k === 'msg').map((e) => e.c));
  const leads = keys.filter((e) => e.k === 'lead'), hand = keys.filter((e) => e.k === 'handoff'), urg = keys.filter((e) => e.k === 'urgent');
  let openU = 0; for (const id of (await st.get('ul')) || []) { const u = await st.get('u:' + id); if (u && !u.done) openU++; }
  const row = (e) => `• ${hm(e.t)} ${esc(e.n || 'Mijoz')}${e.p ? ' ' + esc(e.p) : ''}${e.x ? ' — «' + esc(e.x.slice(0, 70)) + '»' : ''}`;
  const L = [`📊 <b>Kunlik hisobot</b> · ${day.split('-').reverse().join('.')}`, '',
    `💬 Mijoz suhbatlari: <b>${chats.size}</b> (xabarlar: ${n('msg')})`, `🤖 Bot o'zi javob bergan: <b>${n('bot')}</b>`, `⚠️ Operator kerak bo'lgan: <b>${hand.length}</b>`, `📝 Saytdan so'rovlar: <b>${leads.length}</b>`, `🔥 Shoshilinch: <b>${urg.length}</b>${openU ? ` (javobsiz: ${openU})` : ''}`,
    ...(n('good') + n('bad') ? [`👍 ${n('good')} · 👎 ${n('bad')} (bot javoblari baholari)`] : [])];
  if (leads.length) L.push('', "<b>Saytdan kelgan so'rovlar:</b>", ...leads.slice(-8).map(row));
  if (urg.length) L.push('', '<b>Shoshilinch mijozlar:</b>', ...urg.slice(-5).map(row));
  if (hand.length) L.push('', "<b>Operator kerak bo'lgan savollar:</b>", ...hand.slice(-5).map(row));
  if (!keys.length) L.push('', "Bugun yangi xabar yoki so'rov bo'lmadi.");
  return L.join('\n').slice(0, 4000);
}
// Cron (har 5 daqiqada): shoshilinch eslatmalar va 20:00 da kunlik hisobot
async function tick(env, now = Date.now()) {
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
    const rec = (await st.get('c:' + it.c)) || {};
    if ((await st.get('hu:' + it.c)) || (await st.get('ban:' + it.c)) || (it.k === 'price' && rec.phone)) continue; // endi kerak emas
    if (!isOffice(now)) { left.push(it); continue; } // ish vaqtigacha kutamiz
    const lg = rec.lang || 'uz'; await say(env, it.c, FOLLOW[it.k][lg] || FOLLOW[it.k].uz);
    if (it.k === 'ph') for (const a of admins) await say(env, a, `⏰ <b>Mijoz telefon qoldirgan, 1 soatdan beri javobsiz</b>\n👤 ${esc(it.n || 'Mijoz')} · 📞 ${esc(it.p || rec.phone || '')}\nBog'laning yoki xabariga <b>reply</b> qiling.`);
    if (it.k === 'ph') await pushPhone(env, 'Javobsiz mijoz', 'Telefon qoldirgan mijozga 1 soatdan beri javob berilmadi. Telegramni oching.', 4, 'alarm_clock');
  }
  if (left.length !== fl.length) await st.put('fl', left);
  if (h === 9 && mi < 5 && tz(now).getUTCDay() === 1 && !(await st.get('repw:' + dkey(now)))) { await st.put('repw:' + dkey(now), 1, 2 * 86400); const wt = await weekly(env, st, now); for (const a of admins) await say(env, a, wt); }
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
const MENU = { inline_keyboard: [[{ text: '💰 Narxlar', callback_data: 'm:price' }, { text: '⏱ Muddatlar', callback_data: 'm:time' }], [{ text: '🌐 Sayt yaratish', url: 'https://improuzbekiston.uz/yaratish.html' }, { text: '🤖 Bot yaratish', url: 'https://improuzbekiston.uz/bot.html' }], [{ text: '📞 Aloqa', callback_data: 'm:contact' }, { text: '👤 Operator', callback_data: 'm:human' }], [{ text: '📝 Buyurtma berish (anketa)', callback_data: 'm:order' }]] };
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
const FOLLOW = { ph: { uz: "⏳ Kutganingiz uchun rahmat! Mutaxassisimiz tez orada siz bilan bog'lanadi.", ru: '⏳ Спасибо за ожидание! Специалист скоро свяжется с вами.', en: '⏳ Thank you for waiting! A specialist will contact you shortly.' }, price: { uz: "👋 Sizga yordam kerakmi? Telefon raqamingizni yozib qoldiring, mutaxassisimiz bepul maslahat beradi.", ru: '👋 Нужна помощь? Оставьте номер телефона, специалист бесплатно проконсультирует.', en: '👋 Need help? Leave your phone number and a specialist will give you a free consultation.' } };
// Anketa (suhbat): xizmat → nom → muddat → byudjet → telefon
const SERVICES = ['Veb-sayt', "Onlayn do'kon", 'Telegram bot', 'Mobil ilova', 'UI/UX dizayn', 'Boshqa'], DEADLINES = ['Shoshilinch (1 hafta)', '2–3 hafta', '1 oy', 'Shoshilmayman'], BUDGETS = ["1–3 mln so'm", "3–7 mln so'm", "7–15 mln so'm", "15 mln so'mdan ko'p", 'Maslahat kerak'];
const kbOf = (p, arr) => ({ inline_keyboard: arr.map((x, i) => [{ text: x, callback_data: `o:${p}:${i}` }]) });
async function flowStart(env, st, chat, rec) {
  rec.flow = { step: 'svc', d: {} }; await saveRec(st, chat, rec);
  return say(env, chat, '📝 <b>Buyurtma anketasi</b> (5 ta qisqa savol, bekor qilish: /cancel)\n\n1/5. Qanday xizmat kerak?', { reply_markup: kbOf('svc', SERVICES) });
}
async function flowFinish(env, st, chat, rec, name) {
  const d = rec.flow.d; rec.flow = null; rec.phone = d.ph; addTag(rec, 'anketa'); addTag(rec, 'issiq'); await saveRec(st, chat, rec);
  const txt = `📝 <b>Yangi anketa (bot)</b>\n👤 ${esc(name)}${chat ? ` <code>${chat}</code>` : ''}\n🔧 ${esc(d.svc)}\n🏢 ${esc(d.name)}\n⏱ ${esc(d.dl)}\n💰 ${esc(d.bd)}\n📞 <b>${esc(d.ph)}</b>`;
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
  const top = TOP.map(([t, re]) => [t, msgs.filter((e) => re.test(e.x)).length]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const unans = all.filter((e) => e.k === 'handoff' && e.x && !/^telefon:/.test(e.x)).slice(-6);
  const L = [`📈 <b>Haftalik hisobot</b> · ${dkey(now - 6 * 864e5).split('-').reverse().join('.')} – ${dkey(now).split('-').reverse().join('.')}`, '',
    `👥 Mijozlar: <b>${chats.size}</b> (xabarlar: ${msgs.length})`, `🤖 Bot o'zi javob bergan: <b>${n('bot') + n('menu')}</b>`, `⚠️ Operator kerak bo'lgan: <b>${n('handoff')}</b>`, `📝 So'rovlar va telefonlar: <b>${n('lead')}</b>`, `🔥 Shoshilinch: <b>${n('urgent')}</b>`, ...(n('good') + n('bad') ? [`👍 ${n('good')} · 👎 ${n('bad')}`] : [])];
  if (top.length) L.push('', '<b>Eng ko\'p so\'ralgan mavzular:</b>', ...top.map(([t, c]) => `• ${t}: ${c}`));
  if (unans.length) L.push('', "<b>Bot javob bera olmagan savollar</b> (<code>/bilim</code> bilan o'rgating):", ...unans.map((e) => `• «${esc(String(e.x).slice(0, 80))}»`));
  if (!all.length) L.push('', "Bu hafta ma'lumot yo'q.");
  return L.join('\n').slice(0, 4000);
}
async function supportIn(env, st, m) {
  const chat = m.chat.id; let text = (m.text || '').trim();
  if (text === '/start' || text === '/help') {
    return say(env, chat, "👋 <b>Impro IT</b> yordam botiga xush kelibsiz!\n\nSavolingizni shu yerga yozing (o'zbek, rus yoki ingliz tilida): bot darrov javob beradi, murakkab savollarni mutaxassisimiz o'zi hal qiladi. Rasm yoki fayl ham yuborishingiz mumkin. Tez javob uchun quyidagi tugmalardan foydalaning:", { reply_markup: MENU });
  }
  if (await limited(st, 'c' + chat, 12, 600)) return say(env, chat, "Juda ko'p xabar yuborildi. Birozdan so'ng yozing.");
  if (await st.get('ban:' + chat)) return;
  const admins = await adminsOf(env, st);
  const rec = (await st.get('c:' + chat)) || { hist: [] };
  if (text === '/anketa') return flowStart(env, st, chat, rec);
  if (rec.flow && m.text) return flowText(env, st, m, rec);
  if ((m.voice || m.audio) && !m.text) { const tr = await transcribe(env, m); if (tr) { m = { ...m, text: tr, _voice: true }; text = tr; } }
  rec.name = who(m);
  const urgent = !!m.text && isUrgent(text);
  const ph = m.text ? findPhone(text) : null, lang0 = makeAssistantDetect(env)(text);
  rec.lang = lang0;
  const tl = m.text && lang0 !== 'uz' ? await translateUz(env, text) : '';
  if (urgent) addTag(rec, 'shoshilinch');
  if (ph) { addTag(rec, 'issiq'); if (!(await st.get('hu:' + chat))) await scheduleFollow(st, { c: chat, k: 'ph', due: Date.now() + 3600e3, n: who(m), p: ph.phone }); }
  if (m.text && /narx|qancha|price|cost|цена|стоим|сколько/i.test(text) && !rec.phone && !ph && !rec.fuPrice) { rec.fuPrice = 1; await scheduleFollow(st, { c: chat, k: 'price', due: Date.now() + 24 * 3600e3, n: who(m) }); }
  if (ph) { rec.phone = ph.phone; await ev(st, { k: 'lead', c: chat, n: who(m), p: ph.phone, x: ph.rest || 'telefon qoldirdi' }); }
  await ev(st, { k: 'msg', c: chat, n: who(m), x: m.text ? text : '[fayl/rasm]' });
  const map = {};
  for (const a of admins) {
    const head = await say(env, a, `💬 <b>${esc(who(m))}</b> <code>${chat}</code>${m._voice ? '\n🎤 <i>ovozli xabar (matnga aylantirildi)</i>' : ''}${ph ? `\n📞 <b>Telefon qoldirdi: ${esc(ph.phone)}</b>` : rec.phone ? `\n📞 ${esc(rec.phone)}` : ''}\nJavob berish uchun shu xabarga <b>reply</b> qiling.` + (m.text ? `\n\n${esc(text.slice(0, 3500))}` : '') + (tl ? `\n\n🌐 <i>${esc(tl)}</i>` : ''));
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
  const lg = makeAssistantDetect(env)(text), URGLINE = { uz: "\n\n🔥 Shoshilinch ekaningizni qayd etdim: mutaxassisimiz tez orada bog'lanadi.", ru: '\n\n🔥 Отметил срочность: специалист свяжется с вами в ближайшее время.', en: '\n\n🔥 Marked as urgent: a specialist will contact you shortly.' };
  await say(env, chat, esc(a.text) + (urgent ? URGLINE[lg] || URGLINE.uz : '') + (a.handoff && !isOffice() ? OFFLINE[lg] || OFFLINE.uz : ''), a.handoff ? undefined : { reply_markup: FEEDBACK });
  for (const ad of admins) { const n = await tg(env, 'sendMessage', { chat_id: ad, parse_mode: 'HTML', text: `🤖 <b>Bot javobi</b> ${a.handoff ? '⚠️ <b>Operator kerak</b>' : '✅'}${a.ai ? '' : ' (qoida)'}:\n${esc(a.text.slice(0, 1500))}`, ...(a.handoff ? {} : { disable_notification: true }) }); if (n) map[ad + ':' + n.message_id] = chat; }
  await saveMap();
  if (urgent) await raiseUrgent(env, st, { chat, name: who(m), phone: rec.phone, text });
}
// Admin reply -> mijoz
async function supportOut(env, st, m) {
  const to = await st.get('m:' + m.chat.id + ':' + m.reply_to_message.message_id); if (!to) return false;
  await st.put('hu:' + to, 1, 2 * 3600); // operator yozdi: 2 soat bot jim turadi
  await closeUrgentOf(st, to);
  if (m.text) await say(env, to, `💬 <b>Impro IT:</b>\n${esc(m.text)}`); else await tg(env, 'copyMessage', { chat_id: to, from_chat_id: m.chat.id, message_id: m.message_id });
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
  if (d === 'm:order') { await ans(); return flowStart(env, st, chat, (await st.get('c:' + chat)) || { hist: [], name: who({ from: q.from }) }); }
  const oc = /^o:(svc|dl|bd):(\d+)$/.exec(d);
  if (oc) { await ans(); return flowCallback(env, st, q, oc[1], oc[2]); }
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
    const mm = /^(\d+)\s+([\s\S]{1,3500})$/.exec(arg); if (!mm) return say(env, chat, 'Format: <code>/javob 123456 Salom, ...</code>');
    const to = Number(mm[1]), r = await say(env, to, `💬 <b>Impro IT:</b>\n${esc(mm[2])}`);
    if (r) { await st.put('hu:' + to, 1, 2 * 3600); await closeUrgentOf(st, to); }
    return say(env, chat, r ? '✅ Yuborildi.' : "Yuborilmadi (mijoz botni bloklagan yoki ID noto'g'ri).");
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
  const help = "<b>Siz adminsiz.</b> Mijoz xabarlari va sayt so'rovlari shu yerga keladi.\n• Mijozga javob: uning xabariga <b>reply</b> qiling\n• /hisobot — bugungi hisobot (/hisobot kecha), /haftalik — haftalik hisobot\n• /teg ID issiq — mijozga teg; /mijozlar #issiq; /xabar #issiq matn\n• /mijozlar — oxirgi mijozlar, /javob ID matn — ID bo'yicha javob\n• /bilim matn — botni o'rgatish (aksiya, narx...), /bilim — ro'yxat\n• /xabar matn — mijozlarga ommaviy xabar (tasdiq bilan)\n• /ban ID, /unban ID — bloklash\n• /qongiroq — sinov qo'ng'irog'i\n• /test savol — botning mijozga javobini sinash\n• /auto on|off — avtomatik javob\n• /logout — chiqish\n\nBotni mijoz sifatida sinash uchun boshqa Telegram akkauntdan yozing yoki /test dan foydalaning.";
  if (cmd === '/start' || cmd === '/help') return say(env, chat, help);
  if (!m.reply_to_message) return say(env, chat, help); // admin oddiy matn yozdi: nima qilish kerakligini ko'rsatamiz
}

/* ---------- Statik saytdan kelgan so'rov ---------- */
async function relay(req, env) {
  const origin = req.headers.get('Origin') || '', allow = String(env.ALLOW_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!allow.length) allow.push('https://improuzbekiston.uz', 'https://www.improuzbekiston.uz'); // sozlanmagan bo'lsa ham begona saytlarga yopiq
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
  await ev(st, { k: 'lead', n: name, p: phone, x: p.message || Object.values(p.extra || {}).filter(Boolean).slice(0, 3).join(', ') });
  const urgentLead = isUrgent(flat) || /shoshilinch/i.test(JSON.stringify(p.extra || {}));
  const res = await Promise.all(admins.map((a) => say(env, a, L.join('\n').slice(0, 4000)).then((r) => !!r)));
  if (!res.some(Boolean)) return new Response('Yuborilmadi', { status: 502, headers: cors });
  if (urgentLead) await raiseUrgent(env, st, { chat: 0, name, phone, text: p.message || flat });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/setup' && env.SETUP_KEY) { // bir marta ochiladi: webhook o'rnatadi
      if (!tEq(url.searchParams.get('key') || '', env.SETUP_KEY)) return new Response('no', { status: 403 });
      if (!env.WEBHOOK_SECRET || !env.TG_TOKEN) return new Response('TG_TOKEN va WEBHOOK_SECRET kerak', { status: 400 });
      const w = await tg(env, 'setWebhook', { url: `${url.origin}/hook/${env.WEBHOOK_SECRET}`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message', 'callback_query'], drop_pending_updates: false });
      await tg(env, 'setMyCommands', { commands: [{ command: 'start', description: 'Boshlash' }] });
      const me = await tg(env, 'getMe', {});
      return new Response(JSON.stringify({ webhook: !!w, bot: me && me.username, kv: !!env.STATE, ai: env.ANTHROPIC_API_KEY ? 'claude' : env.AI ? 'workers-ai' : false }), { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname.startsWith('/hook/')) {
      if (req.method !== 'POST' || !env.WEBHOOK_SECRET || !tEq(url.pathname.slice(6), env.WEBHOOK_SECRET) || !tEq(req.headers.get('X-Telegram-Bot-Api-Secret-Token') || '', env.WEBHOOK_SECRET)) return new Response('no', { status: 403 });
      let upd; try { upd = await req.json(); } catch { return new Response('ok'); }
      const work = handleUpdate(env, upd).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
      return new Response('ok');
    }
    return relay(req, env);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(tick(env)); },
  handleUpdate, tick, report,
};
