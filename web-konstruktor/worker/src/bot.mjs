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
async function ev(st, e) { try { await st.put(`ev:${dkey()}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, 1, 3 * 86400, { t: Date.now(), k: e.k, c: e.c || 0, n: String(e.n || '').slice(0, 40), p: String(e.p || '').slice(0, 25), x: String(e.x || '').replace(/\s+/g, ' ').slice(0, 110) }); } catch { /* hisobot ixtiyoriy */ } }
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
  return { keys, msg: n('msg'), bot: n('bot'), chats: new Set(keys.filter((e) => e.k === 'msg').map((e) => e.c)).size, leads: keys.filter((e) => e.k === 'lead'), hand: keys.filter((e) => e.k === 'handoff'), urg: keys.filter((e) => e.k === 'urgent') };
}
async function report(env, st, day) {
  const keys = (await st.list(`ev:${day}:`)).map((k) => k.metadata).filter(Boolean).sort((a, b) => a.t - b.t);
  const n = (k) => keys.filter((e) => e.k === k).length, chats = new Set(keys.filter((e) => e.k === 'msg').map((e) => e.c));
  const leads = keys.filter((e) => e.k === 'lead'), hand = keys.filter((e) => e.k === 'handoff'), urg = keys.filter((e) => e.k === 'urgent');
  let openU = 0; for (const id of (await st.get('ul')) || []) { const u = await st.get('u:' + id); if (u && !u.done) openU++; }
  const row = (e) => `• ${hm(e.t)} ${esc(e.n || 'Mijoz')}${e.p ? ' ' + esc(e.p) : ''}${e.x ? ' — «' + esc(e.x.slice(0, 70)) + '»' : ''}`;
  const L = [`📊 <b>Kunlik hisobot</b> · ${day.split('-').reverse().join('.')}`, '',
    `💬 Mijoz suhbatlari: <b>${chats.size}</b> (xabarlar: ${n('msg')})`, `🤖 Bot o'zi javob bergan: <b>${n('bot')}</b>`, `⚠️ Operator kerak bo'lgan: <b>${hand.length}</b>`, `📝 Saytdan so'rovlar: <b>${leads.length}</b>`, `🔥 Shoshilinch: <b>${urg.length}</b>${openU ? ` (javobsiz: ${openU})` : ''}`];
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
const assistantOf = (env) => makeAssistant({ getSettings: () => ({ ai: { key: env.ANTHROPIC_API_KEY || '', model: env.AI_MODEL || '' } }), getSite: () => SITE, getPricing: () => PRICING, workersAi: env.AI });

/* ---------- Mijoz xabari ---------- */
async function supportIn(env, st, m) {
  const chat = m.chat.id, text = (m.text || '').trim();
  if (text === '/start' || text === '/help') {
    return say(env, chat, "👋 <b>Impro IT</b> yordam botiga xush kelibsiz!\n\nSavolingizni shu yerga yozing: bot darrov javob beradi, murakkab savollarni mutaxassisimiz o'zi hal qiladi. Rasm yoki fayl ham yuborishingiz mumkin.", { reply_markup: { inline_keyboard: [[{ text: "🌐 Saytni o'zim yarataman", url: 'https://improuzbekiston.uz/yaratish.html' }], [{ text: '🤖 Telegram bot yaratish', url: 'https://improuzbekiston.uz/bot.html' }]] } });
  }
  if (await limited(st, 'c' + chat, 12, 600)) return say(env, chat, "Juda ko'p xabar yuborildi. Birozdan so'ng yozing.");
  const admins = await adminsOf(env, st);
  const rec = (await st.get('c:' + chat)) || { hist: [] };
  rec.name = who(m);
  const urgent = !!m.text && isUrgent(text);
  await ev(st, { k: 'msg', c: chat, n: who(m), x: m.text ? text : '[fayl/rasm]' });
  const map = {};
  for (const a of admins) {
    const head = await say(env, a, `💬 <b>${esc(who(m))}</b> <code>${chat}</code>\nJavob berish uchun shu xabarga <b>reply</b> qiling.` + (m.text ? `\n\n${esc(text.slice(0, 3500))}` : ''));
    if (head) map[a + ':' + head.message_id] = chat;
    if (!m.text) { const cp = await tg(env, 'copyMessage', { chat_id: a, from_chat_id: chat, message_id: m.message_id, reply_to_message_id: head && head.message_id }); if (cp) map[a + ':' + cp.message_id] = chat; }
  }
  const saveMap = () => Promise.all(Object.entries(map).map(([k, v]) => st.put('m:' + k, v, 30 * 86400)));
  if ((await st.get('hu:' + chat)) || (await st.get('auto')) === 'off' || !m.text) { await st.put('c:' + chat, rec, 7 * 86400); await saveMap(); if (urgent) await raiseUrgent(env, st, { chat, name: who(m), text }); if (!(await st.get('hu:' + chat))) await say(env, chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.' + (admins.length ? '' : `\nShoshilinch bo'lsa: ${(SITE.contacts || {}).phone || ''}`)); return; }
  let a = null;
  try { a = await assistantOf(env).answer({ text, history: (await limited(st, 'ai', 400, 3600)) ? [] : rec.hist }); } catch { a = null; }
  if (!a || !a.text) { await st.put('c:' + chat, rec, 7 * 86400); await saveMap(); if (urgent) await raiseUrgent(env, st, { chat, name: who(m), text }); return say(env, chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.'); }
  rec.hist = [...rec.hist, { r: 'u', t: text.slice(0, 600) }, { r: 'a', t: a.text.slice(0, 900) }].slice(-12);
  await st.put('c:' + chat, rec, 7 * 86400);
  await ev(st, { k: a.handoff ? 'handoff' : 'bot', c: chat, n: who(m), x: text });
  const lg = makeAssistantDetect(env)(text), URGLINE = { uz: "\n\n🔥 Shoshilinch ekaningizni qayd etdim: mutaxassisimiz tez orada bog'lanadi.", ru: '\n\n🔥 Отметил срочность: специалист свяжется с вами в ближайшее время.', en: '\n\n🔥 Marked as urgent: a specialist will contact you shortly.' };
  await say(env, chat, esc(a.text) + (urgent ? URGLINE[lg] || URGLINE.uz : ''));
  for (const ad of admins) { const n = await tg(env, 'sendMessage', { chat_id: ad, parse_mode: 'HTML', text: `🤖 <b>Bot javobi</b> ${a.handoff ? '⚠️ <b>Operator kerak</b>' : '✅'}${a.ai ? '' : ' (qoida)'}:\n${esc(a.text.slice(0, 1500))}`, ...(a.handoff ? {} : { disable_notification: true }) }); if (n) map[ad + ':' + n.message_id] = chat; }
  await saveMap();
  if (urgent) await raiseUrgent(env, st, { chat, name: who(m), text });
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
  const chat = q.message && q.message.chat && q.message.chat.id, id = /^ok:(\w+)$/.exec(q.data || '');
  if (!chat || !id || !(await adminsOf(env, st)).includes(chat)) return tg(env, 'answerCallbackQuery', { callback_query_id: q.id, text: "Ruxsat yo'q" });
  const u = await st.get('u:' + id[1]); if (u) { u.done = 1; await st.put('u:' + id[1], u, 2 * 86400); }
  await tg(env, 'answerCallbackQuery', { callback_query_id: q.id, text: 'Qayd etildi' });
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
  const help = "<b>Siz adminsiz.</b> Mijoz xabarlari va sayt so'rovlari shu yerga keladi.\n• Mijozga javob: uning xabariga <b>reply</b> qiling\n• /hisobot — bugungi hisobot (/hisobot kecha)\n• /qongiroq — sinov qo'ng'irog'i\n• /test savol — botning mijozga javobini sinash\n• /auto on|off — avtomatik javob\n• /logout — chiqish\n\nBotni mijoz sifatida sinash uchun boshqa Telegram akkauntdan yozing yoki /test dan foydalaning.";
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
