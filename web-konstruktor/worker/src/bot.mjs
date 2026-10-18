// Impro IT: Cloudflare Worker. Ikki vazifa:
//  1) Telegram yordam boti (webhook): mijoz savoliga avtomatik javob (AI yoki qoidalar), murakkab savol adminga uzatiladi.
//  2) Statik saytdagi forma so'rovlarini Telegram'ga yetkazish (POST /).
// Holat (yozishmalar, adminlar) KV (STATE) da saqlanadi. Bu fayl tools/build-worker.js bilan yig'iladi: makeAssistant, SITE, PRICING shu yerga kiritiladi.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const KIND = { order: '🛒 Yangi buyurtma', booking: '📅 Yangi ariza', message: '✉️ Yangi xabar', brief: "📝 Yangi loyiha so'rovi" };

/* ---------- Holat (KV yoki xotira) ---------- */
const MEM = new Map();
const store = (env) => env.STATE
  ? { get: async (k) => { const v = await env.STATE.get(k); if (v == null) return null; try { return JSON.parse(v); } catch { return null; } }, put: (k, v, ttl) => env.STATE.put(k, JSON.stringify(v), ttl ? { expirationTtl: Math.max(60, Math.floor(ttl)) } : undefined) }
  : { get: async (k) => { const e = MEM.get(k); if (!e) return null; if (e.x && e.x < Date.now()) { MEM.delete(k); return null; } return e.v; }, put: async (k, v, ttl) => { MEM.set(k, { v, x: ttl ? Date.now() + ttl * 1000 : 0 }); } };
// Hisoblagich: oyna ichida max martadan oshsa true
// KV yozuv chegarasi (bir kalitga ~1/soniya) yoki xato bo'lsa cheklash o'chadi (fail-open): mijozga javob har holda boradi
// failClosed: parol urinishlari kabi muhim cheklovlarda KV xatosi bo'lsa ham rad etiladi
async function limited(st, key, max, sec, failClosed) { try { const now = Date.now(), r = (await st.get('rl:' + key)) || { n: 0, t: now }; if (now - r.t > sec * 1000) { r.n = 0; r.t = now; } r.n++; await st.put('rl:' + key, r, sec); return r.n > max; } catch { return !!failClosed; } }
const tEq = (a, b) => { a = String(a); b = String(b); if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

/* ---------- Telegram ---------- */
async function tg(env, method, params) {
  const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params || {}) });
  const j = await r.json().catch(() => ({}));
  return j.ok ? j.result : null;
}
const say = (env, chat, text, extra) => tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });
const adminsOf = async (env, st) => [...new Set([...(await st.get('admins')) || [], ...String(env.TG_CHAT || '').split(',').map((x) => Number(x.trim())).filter(Boolean)])];
const who = (m) => [m.from && m.from.first_name, m.from && m.from.last_name, m.from && m.from.username && '@' + m.from.username].filter(Boolean).join(' ') || 'Mijoz';
const assistantOf = (env) => makeAssistant({ getSettings: () => ({ ai: { key: env.ANTHROPIC_API_KEY || '', model: env.AI_MODEL || '' } }), getSite: () => SITE, getPricing: () => PRICING });

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
  const map = {};
  for (const a of admins) {
    const head = await say(env, a, `💬 <b>${esc(who(m))}</b> <code>${chat}</code>\nJavob berish uchun shu xabarga <b>reply</b> qiling.` + (m.text ? `\n\n${esc(text.slice(0, 3500))}` : ''));
    if (head) map[a + ':' + head.message_id] = chat;
    if (!m.text) { const cp = await tg(env, 'copyMessage', { chat_id: a, from_chat_id: chat, message_id: m.message_id, reply_to_message_id: head && head.message_id }); if (cp) map[a + ':' + cp.message_id] = chat; }
  }
  const saveMap = () => Promise.all(Object.entries(map).map(([k, v]) => st.put('m:' + k, v, 30 * 86400)));
  if ((await st.get('hu:' + chat)) || (await st.get('auto')) === 'off' || !m.text) { await st.put('c:' + chat, rec, 7 * 86400); await saveMap(); if (!(await st.get('hu:' + chat))) await say(env, chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.' + (admins.length ? '' : `\nShoshilinch bo'lsa: ${(SITE.contacts || {}).phone || ''}`)); return; }
  let a = null;
  try { a = await assistantOf(env).answer({ text, history: (await limited(st, 'ai', 400, 3600)) ? [] : rec.hist }); } catch { a = null; }
  if (!a || !a.text) { await st.put('c:' + chat, rec, 7 * 86400); await saveMap(); return say(env, chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.'); }
  rec.hist = [...rec.hist, { r: 'u', t: text.slice(0, 600) }, { r: 'a', t: a.text.slice(0, 900) }].slice(-12);
  await st.put('c:' + chat, rec, 7 * 86400);
  await say(env, chat, esc(a.text));
  for (const ad of admins) { const n = await tg(env, 'sendMessage', { chat_id: ad, parse_mode: 'HTML', text: `🤖 <b>Bot javobi</b> ${a.handoff ? '⚠️ <b>Operator kerak</b>' : '✅'}${a.ai ? '' : ' (qoida)'}:\n${esc(a.text.slice(0, 1500))}`, ...(a.handoff ? {} : { disable_notification: true }) }); if (n) map[ad + ':' + n.message_id] = chat; }
  await saveMap();
}
// Admin reply -> mijoz
async function supportOut(env, st, m) {
  const to = await st.get('m:' + m.chat.id + ':' + m.reply_to_message.message_id); if (!to) return false;
  await st.put('hu:' + to, 1, 2 * 3600); // operator yozdi: 2 soat bot jim turadi
  if (m.text) await say(env, to, `💬 <b>Impro IT:</b>\n${esc(m.text)}`); else await tg(env, 'copyMessage', { chat_id: to, from_chat_id: m.chat.id, message_id: m.message_id });
  await tg(env, 'setMessageReaction', { chat_id: m.chat.id, message_id: m.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] });
  return true;
}

async function handleUpdate(env, upd) {
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
  if (cmd === '/test') { // admin botni mijoz sifatida sinab ko'radi (hech kimga yuborilmaydi)
    if (!arg) return say(env, chat, 'Format: <code>/test narx qancha?</code>');
    let a = null; try { a = await assistantOf(env).answer({ text: arg.slice(0, 800), history: [] }); } catch { a = null; }
    return say(env, chat, a && a.text ? `🧪 <b>Mijoz ko'radigan javob</b>${a.ai ? '' : ' (qoida)'}${a.handoff ? ' ⚠️ operatorga uzatiladi' : ''}:\n\n${esc(a.text)}` : 'Javob olinmadi.');
  }
  const help = "<b>Siz adminsiz.</b> Mijoz xabarlari va sayt so'rovlari shu yerga keladi.\n• Mijozga javob: uning xabariga <b>reply</b> qiling\n• /test savol — botning mijozga javobini sinash\n• /auto on|off — avtomatik javob\n• /logout — chiqish\n\nBotni mijoz sifatida sinash uchun boshqa Telegram akkauntdan yozing yoki /test dan foydalaning.";
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
  const res = await Promise.all(admins.map((a) => say(env, a, L.join('\n').slice(0, 4000)).then((r) => !!r)));
  if (!res.some(Boolean)) return new Response('Yuborilmadi', { status: 502, headers: cors });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/setup' && env.SETUP_KEY) { // bir marta ochiladi: webhook o'rnatadi
      if (!tEq(url.searchParams.get('key') || '', env.SETUP_KEY)) return new Response('no', { status: 403 });
      if (!env.WEBHOOK_SECRET || !env.TG_TOKEN) return new Response('TG_TOKEN va WEBHOOK_SECRET kerak', { status: 400 });
      const w = await tg(env, 'setWebhook', { url: `${url.origin}/hook/${env.WEBHOOK_SECRET}`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message'], drop_pending_updates: false });
      await tg(env, 'setMyCommands', { commands: [{ command: 'start', description: 'Boshlash' }] });
      const me = await tg(env, 'getMe', {});
      return new Response(JSON.stringify({ webhook: !!w, bot: me && me.username, kv: !!env.STATE, ai: !!env.ANTHROPIC_API_KEY }), { headers: { 'content-type': 'application/json' } });
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
  handleUpdate,
};
