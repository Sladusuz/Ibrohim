/* ---------- Telegram bot konstruktori (Cloudflare Worker): mijoz o'z botining tokenini kiritadi, bot shu yerda ishlaydi ---------- */
const tbCut = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const tbMoney = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const tbHex = (v, d) => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : d);
const tbEsc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
async function tbTg(token, method, params) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params || {}) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(j.description || 'Telegram xatosi');
  return j.result;
}
const tbDefaults = (name) => ({ title: name || "Mening do'konim", welcome: `Assalomu alaykum! ${name || 'Botimiz'}ga xush kelibsiz.\nQuyidagi tugmalardan birini tanlang.`, about: '', currency: "so'm", fallback: "Savolingizni tushunmadim. Menyudan tanlang yoki /menu ni bosing.", contact: { phone: '', address: '', hours: '' }, buttons: [{ text: '🛍 Katalog', type: 'catalog', value: '' }, { text: '📞 Aloqa', type: 'contact', value: '' }], products: [], replies: [], miniApp: { enabled: false, title: '', accent: '#2f80ed' } });
function tbClean(c, prev) {
  const d = Object.assign(tbDefaults(), prev || {}); c = c && typeof c === 'object' ? c : {};
  const out = {
    title: tbCut(c.title != null ? c.title : d.title, 60), welcome: tbCut(c.welcome != null ? c.welcome : d.welcome, 1500), about: tbCut(c.about != null ? c.about : d.about, 1500), currency: tbCut(c.currency != null ? c.currency : d.currency, 12) || "so'm", fallback: tbCut(c.fallback != null ? c.fallback : d.fallback, 400),
    contact: { phone: tbCut((c.contact || d.contact).phone, 40), address: tbCut((c.contact || d.contact).address, 200), hours: tbCut((c.contact || d.contact).hours, 100) },
    buttons: (Array.isArray(c.buttons) ? c.buttons : d.buttons).slice(0, 10).map((b) => ({ text: tbCut(b && b.text, 30), type: ['text', 'url', 'catalog', 'webapp', 'contact', 'about'].includes(b && b.type) ? b.type : 'text', value: tbCut(b && b.value, 1500) })).filter((b) => b.text),
    products: (Array.isArray(c.products) ? c.products : d.products).slice(0, 120).map((p) => ({ id: tbCut(p && p.id, 20) || pRnd(3), name: tbCut(p && p.name, 100), price: Math.max(0, Math.round(Number(p && p.price) || 0)), description: tbCut(p && p.description, 500), image: /^\/uploads\/[\w.-]+$/.test((p && p.image) || '') || /^https:\/\/[^\s"'<>]+$/.test((p && p.image) || '') ? String(p.image).slice(0, 300) : '', category: tbCut(p && p.category, 40), active: !p || p.active !== false })).filter((p) => p.name),
    replies: (Array.isArray(c.replies) ? c.replies : d.replies).slice(0, 40).map((r) => ({ keyword: tbCut(r && r.keyword, 40).toLowerCase(), answer: tbCut(r && r.answer, 1200) })).filter((r) => r.keyword && r.answer),
    miniApp: { enabled: !!((c.miniApp || d.miniApp).enabled), title: tbCut((c.miniApp || d.miniApp).title, 40), accent: tbHex((c.miniApp || d.miniApp).accent, '#2f80ed') },
  };
  const seen = new Set(); out.products.forEach((p) => { while (seen.has(p.id)) p.id = pRnd(3); seen.add(p.id); });
  return out;
}
const tbPub = (b, origin) => ({ id: b.id, name: b.name, username: b.username, status: b.status, tokenHint: b.token ? '••••' + b.token.slice(-4) : '', config: b.config, claim: b.claim, ownerLinked: !!b.ownerChat, webhook: !!b.webhookOk, createdAt: b.createdAt, appUrl: `${origin}/app/${b.id}`, link: `https://t.me/${b.username}`, claimLink: `https://t.me/${b.username}?start=${b.claim}` });
const tbPublicConfig = (b) => ({ title: b.config.miniApp.title || b.config.title, shop: b.config.title, currency: b.config.currency, accent: b.config.miniApp.accent, about: b.config.about, contact: b.config.contact, enabled: b.config.miniApp.enabled, products: b.config.products.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name, price: p.price, description: p.description, image: p.image, category: p.category })) });
const tbGet = (st, id) => st.get('tb:' + String(id).replace(/[^a-f0-9]/g, ''));
async function tbSave(st, b) { await st.put('tb:' + b.id, b, 0, { u: b.userId, n: String(b.name || '').slice(0, 40), un: b.username || '', s: b.status, t: Date.parse(b.createdAt) || Date.now() }); }
async function tbSubs(st, id) { return (await st.list('tbu:' + id + ':')).length; }
async function tbOrdersOf(st, id) { return (await st.list('o:')).filter((k) => k.metadata && k.metadata.bt === id); }
async function tbConnect(b, origin) {
  const warn = []; if (!/^https:\/\//.test(origin)) { b.webhookOk = false; return { webhook: false, warn: 'Webhook uchun HTTPS manzil kerak' }; }
  await tbTg(b.token, 'setWebhook', { url: `${origin}/api/tg/${b.id}/${b.secret}`, secret_token: b.secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
  try { await tbTg(b.token, 'setMyCommands', { commands: [{ command: 'start', description: 'Boshlash' }, { command: 'menu', description: 'Menyu' }, { command: 'shop', description: 'Katalog' }, { command: 'cart', description: 'Savat' }, { command: 'contact', description: 'Aloqa' }] }); } catch (e) { warn.push(e.message); }
  try { await tbTg(b.token, 'setChatMenuButton', b.config.miniApp.enabled ? { menu_button: { type: 'web_app', text: tbCut(b.config.miniApp.title, 16) || "Do'kon", web_app: { url: `${origin}/app/${b.id}` } } } : { menu_button: { type: 'commands' } }); } catch (e) { warn.push(e.message); }
  b.webhookOk = true; return { webhook: true, warn: warn.join('; ') };
}
async function tbCreate(env, st, userId, token, name, origin) {
  token = String(token || '').trim();
  if (!/^\d{6,12}:[\w-]{30,50}$/.test(token)) throw new Error("Token noto'g'ri. @BotFather bergan token shu ko'rinishda bo'ladi: 123456789:AA...");
  for (const k of await st.list('tb:')) { const o = await st.get(k.name); if (o && o.token === token) throw new Error('Bu bot allaqachon ulangan'); }
  let me; try { me = await tbTg(token, 'getMe'); } catch { throw new Error("Token ishlamadi. @BotFather da tokenni qayta tekshiring."); }
  const b = { id: pRnd(6), userId, token, secret: pRnd(16), claim: pRnd(4), username: me.username || '', name: tbCut(name, 60) || me.first_name || me.username, status: 'faol', ownerChat: 0, webhookOk: false, createdAt: new Date().toISOString() };
  b.config = tbClean({ title: b.name, welcome: tbDefaults(b.name).welcome }, null);
  let res = { webhook: false, warn: '' }; try { res = await tbConnect(b, origin); } catch (e) { res = { webhook: false, warn: e.message }; }
  await tbSave(st, b); return { bot: tbPub(b, origin), ...res };
}
async function tbRemove(st, b) { try { await tbTg(b.token, 'deleteWebhook', { drop_pending_updates: true }); } catch { /* ixtiyoriy */ } for (const k of await st.list('tbu:' + b.id + ':')) await st.put(k.name, null, 60); await st.put('tb:' + b.id, null, 60); }
// Buyurtma (bot ichidan ham, mini ilovadan ham)
async function tbPlaceOrder(st, b, { items, name, phone, note, tgUser }) {
  const byId = Object.fromEntries(b.config.products.filter((p) => p.active).map((p) => [p.id, p]));
  const lines = (Array.isArray(items) ? items : []).slice(0, 60).map((i) => { const p = byId[String(i && i.id)]; const qty = Math.min(99, Math.max(1, parseInt(i && i.qty, 10) || 1)); return p ? { id: p.id, name: p.name, price: p.price, qty } : null; }).filter(Boolean);
  if (!lines.length) throw new Error("Savat bo'sh");
  const total = lines.reduce((a, l) => a + l.price * l.qty, 0), id = pRnd(4), nm = tbCut(name, 100) || (tgUser && (tgUser.first_name || tgUser.username)) || 'Telegram mijoz', ph = tbCut(phone, 40);
  const order = { id, date: new Date().toISOString(), userId: '', bot: b.id, type: 'order', name: nm, phone: ph, message: tbCut(note, 600), items: lines, extra: tgUser && tgUser.username ? { Telegram: '@' + tgUser.username } : {}, shipping: 0, total, status: 'yangi' };
  await st.put('o:' + Date.now().toString(36) + id, order, 90 * 86400, { t: Date.now(), n: nm.slice(0, 40), p: ph.slice(0, 25), ty: 'order', tn: '', bt: b.id, u: '', s: 'yangi', tt: total });
  const text = `🛍 <b>Yangi buyurtma #${id}</b>\n👤 ${tbEsc(nm)}${order.extra.Telegram ? ' (' + tbEsc(order.extra.Telegram) + ')' : ''}\n📞 ${tbEsc(ph)}\n\n${lines.map((l) => `• ${tbEsc(l.name)} × ${l.qty} = ${tbMoney(l.price * l.qty)}`).join('\n')}\n\n<b>Jami: ${tbMoney(total)} ${tbEsc(b.config.currency)}</b>${order.message ? '\n💬 ' + tbEsc(order.message) : ''}`;
  if (b.ownerChat) tbTg(b.token, 'sendMessage', { chat_id: b.ownerChat, text, parse_mode: 'HTML' }).catch(() => {});
  return order;
}
async function tbVerify(b, initData) {
  try {
    const p = new URLSearchParams(String(initData || '')), hash = p.get('hash'); if (!hash) return null; p.delete('hash');
    const str = [...p.entries()].sort(([a], [c]) => (a < c ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n'), enc = new TextEncoder();
    const hmac = async (key, data) => new Uint8Array(await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(data)));
    const calc = pHex(await hmac(await hmac(enc.encode('WebAppData'), b.token), str));
    if (!tEq(calc, hash) || Date.now() / 1000 - Number(p.get('auth_date') || 0) > 86400) return null;
    return JSON.parse(p.get('user') || 'null');
  } catch { return null; }
}
const tbKeyboard = (b, origin) => {
  const rows = []; let row = [];
  for (const btn of b.config.buttons) { row.push(btn.type === 'webapp' ? { text: btn.text, web_app: { url: `${origin}/app/${b.id}` } } : { text: btn.text }); if (row.length === 2) { rows.push(row); row = []; } }
  if (row.length) rows.push(row);
  if (b.config.miniApp.enabled && !b.config.buttons.some((x) => x.type === 'webapp')) rows.unshift([{ text: '🛍 ' + (tbCut(b.config.miniApp.title, 20) || "Do'kon"), web_app: { url: `${origin}/app/${b.id}` } }]);
  return { keyboard: rows, resize_keyboard: true, is_persistent: true };
};
// Webhook: mijoz botiga kelgan xabar
async function tbHandle(env, st, b, upd, origin) {
  const T = (m, p) => tbTg(b.token, m, p).catch(() => null), say = (chat, text, extra) => T('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', ...extra });
  const getU = async (chat, from) => { const o = (await st.get(`tbu:${b.id}:${chat}`)) || { name: '', username: '', joined: new Date().toISOString(), cart: {}, step: '' }; if (from) { o.name = tbCut(from.first_name, 60); o.username = tbCut(from.username, 40); } return o; };
  const putU = (chat, u) => st.put(`tbu:${b.id}:${chat}`, u, 0, { t: Date.parse(u.joined) || Date.now(), n: u.name });
  const cats = () => [...new Set(b.config.products.filter((p) => p.active).map((p) => p.category || 'Mahsulotlar'))];
  const prod = (id) => b.config.products.find((p) => p.id === id && p.active);
  const cartLines = (u) => Object.keys(u.cart).map((id) => ({ p: prod(id), qty: u.cart[id] })).filter((x) => x.p);
  const cartText = (u) => { const L = cartLines(u); if (!L.length) return null; return `🧺 <b>Savatingiz</b>\n\n${L.map((x) => `• ${tbEsc(x.p.name)} × ${x.qty} = ${tbMoney(x.p.price * x.qty)}`).join('\n')}\n\n<b>Jami: ${tbMoney(L.reduce((a, x) => a + x.p.price * x.qty, 0))} ${tbEsc(b.config.currency)}</b>`; };
  const showCart = (chat, u) => { const t = cartText(u); return t ? say(chat, t, { reply_markup: { inline_keyboard: [[{ text: '✅ Buyurtma berish', callback_data: 'o' }, { text: '🗑 Tozalash', callback_data: 'x' }], [{ text: '🛍 Davom etish', callback_data: 'k' }]] } }) : say(chat, "Savat bo'sh. Katalogdan tanlang.", { reply_markup: tbKeyboard(b, origin) }); };
  const showCategory = (chat, i) => { const name = cats()[i], ps = b.config.products.filter((p) => p.active && (p.category || 'Mahsulotlar') === name).slice(0, 40); return say(chat, `<b>${tbEsc(name || 'Katalog')}</b>`, { reply_markup: { inline_keyboard: [...ps.map((p) => [{ text: `${p.name} — ${tbMoney(p.price)}`, callback_data: 'v' + p.id }]), [{ text: '🧺 Savat', callback_data: 'b' }]] } }); };
  const showCatalog = (chat) => { const c = cats(); if (!c.length) return say(chat, "Katalog hozircha bo'sh."); if (c.length === 1) return showCategory(chat, 0); return say(chat, "🛍 <b>Katalog</b>\nBo'limni tanlang:", { reply_markup: { inline_keyboard: c.map((n, i) => [{ text: n, callback_data: 'c' + i }]) } }); };
  const showProduct = async (chat, p) => {
    const cap = `<b>${tbEsc(p.name)}</b>\n${p.description ? tbEsc(p.description) + '\n' : ''}\n💰 ${tbMoney(p.price)} ${tbEsc(b.config.currency)}`, kb = { inline_keyboard: [[{ text: "➕ Savatga qo'shish", callback_data: 'a' + p.id }], [{ text: '🧺 Savat', callback_data: 'b' }, { text: '⬅ Orqaga', callback_data: 'k' }]] }, img = p.image ? (/^\//.test(p.image) ? origin + p.image : p.image) : '';
    if (img) { const r = await T('sendPhoto', { chat_id: chat, photo: img, caption: cap, parse_mode: 'HTML', reply_markup: kb }); if (r) return r; }
    return say(chat, cap, { reply_markup: kb });
  };
  const contactText = () => { const c = b.config.contact, L = [c.phone && `📞 ${tbEsc(c.phone)}`, c.address && `📍 ${tbEsc(c.address)}`, c.hours && `🕒 ${tbEsc(c.hours)}`].filter(Boolean); return L.length ? L.join('\n') : "Aloqa ma'lumoti hali kiritilmagan."; };
  const menu = (chat, text) => say(chat, text || 'Menyu', { reply_markup: tbKeyboard(b, origin) });
  const finishOrder = async (chat, u, from) => {
    try { const o = await tbPlaceOrder(st, b, { items: Object.keys(u.cart).map((id) => ({ id, qty: u.cart[id] })), name: u.name, phone: u.phone, note: u.note, tgUser: { id: from.id, username: from.username, first_name: from.first_name } }); u.cart = {}; u.step = ''; u.note = ''; await say(chat, `✅ <b>Buyurtmangiz qabul qilindi!</b> #${o.id}\nJami: ${tbMoney(o.total)} ${tbEsc(b.config.currency)}\nTez orada siz bilan bog'lanamiz.`, { reply_markup: tbKeyboard(b, origin) }); } catch (e) { u.step = ''; await say(chat, tbEsc(e.message), { reply_markup: tbKeyboard(b, origin) }); }
  };
  if (upd.callback_query) {
    const q = upd.callback_query, chat = q.message && q.message.chat.id, from = q.from; if (!chat) return;
    const u = await getU(chat, from), d = String(q.data || ''), kind = d[0], arg = d.slice(1); let toast = '';
    if (kind === 'k') await showCatalog(chat); else if (kind === 'c') await showCategory(chat, Number(arg) || 0);
    else if (kind === 'v') { const p = prod(arg); if (p) await showProduct(chat, p); }
    else if (kind === 'a') { const p = prod(arg); if (p) { u.cart[p.id] = Math.min(99, (u.cart[p.id] || 0) + 1); toast = `Savatga qo'shildi (${u.cart[p.id]})`; } }
    else if (kind === 'b') await showCart(chat, u);
    else if (kind === 'x') { u.cart = {}; toast = 'Savat tozalandi'; await say(chat, 'Savat tozalandi.'); }
    else if (kind === 'o') { if (!cartLines(u).length) toast = "Savat bo'sh"; else { u.step = 'phone'; await say(chat, '📱 Telefon raqamingizni yuboring (tugmani bosing yoki yozing):', { reply_markup: { keyboard: [[{ text: '📱 Raqamni ulashish', request_contact: true }], [{ text: '❌ Bekor qilish' }]], resize_keyboard: true, one_time_keyboard: true } }); } }
    await putU(chat, u); await T('answerCallbackQuery', { callback_query_id: q.id, text: toast || undefined }); return;
  }
  const m = upd.message; if (!m || !m.chat || m.chat.type !== 'private') return;
  const chat = m.chat.id, from = m.from || {}, u = await getU(chat, from), text = String(m.text || '').trim(), owner = b.ownerChat && chat === b.ownerChat;
  if (/^\/start\b/.test(text)) {
    const payload = text.split(/\s+/)[1] || '';
    if (payload && payload === b.claim) { b.ownerChat = chat; await tbSave(st, b); await say(chat, "✅ <b>Siz bot egasi sifatida ulandingiz.</b> Yangi buyurtmalar shu yerga keladi.\n\nBuyruqlar:\n/stats — statistika\n/orders — oxirgi buyurtmalar\n/broadcast MATN — barcha obunachilarga xabar", { reply_markup: tbKeyboard(b, origin) }); }
    await menu(chat, b.config.welcome); await putU(chat, u); return;
  }
  if (owner && /^\/stats\b/.test(text)) { const os = await tbOrdersOf(st, b.id); await say(chat, `📊 Obunachilar: <b>${await tbSubs(st, b.id)}</b>\nBuyurtmalar: <b>${os.length}</b>\nJami summa: <b>${tbMoney(os.reduce((a, o) => a + (o.metadata.tt || 0), 0))} ${tbEsc(b.config.currency)}</b>`); return; }
  if (owner && /^\/orders\b/.test(text)) { const ks = (await tbOrdersOf(st, b.id)).sort((a, c) => (a.name < c.name ? 1 : -1)).slice(0, 5), L = []; for (const k of ks) { const o = await st.get(k.name); if (o) L.push(`#${o.id} ${tbEsc(o.name)} ${tbEsc(o.phone)} — ${tbMoney(o.total)} ${tbEsc(b.config.currency)}`); } await say(chat, L.length ? L.join('\n') : "Hali buyurtma yo'q."); return; }
  if (owner && /^\/broadcast\b/.test(text)) { const msg = text.replace(/^\/broadcast\s*/, ''); if (!msg) { await say(chat, 'Matnni yozing: /broadcast Salom!'); return; } const n = await tbBroadcastStart(st, b, msg); await say(chat, `📣 Navbatga qo'yildi: ${n} ta obunachi. Xabarlar daqiqada ~40 tadan yuboriladi.`); return; }
  if (m.contact && u.step === 'phone') { u.phone = tbCut(m.contact.phone_number, 30); u.name = u.name || tbCut(m.contact.first_name, 60); u.step = 'note'; await say(chat, "💬 Manzil yoki izoh yozing (o'tkazib yuborish uchun /skip):", { reply_markup: { remove_keyboard: true } }); await putU(chat, u); return; }
  if (u.step === 'phone') {
    if (/bekor/i.test(text)) { u.step = ''; await menu(chat, 'Bekor qilindi.'); await putU(chat, u); return; }
    if (/^[+\d][\d\s()\-]{6,}$/.test(text)) { u.phone = text.slice(0, 30); u.step = 'note'; await say(chat, "💬 Manzil yoki izoh yozing (o'tkazib yuborish uchun /skip):", { reply_markup: { remove_keyboard: true } }); } else await say(chat, "Telefon raqamni to'g'ri yozing (masalan <code>90 123 45 67</code>) yoki tugmani bosing.");
    await putU(chat, u); return;
  }
  if (u.step === 'note') { u.note = /^\/skip\b/.test(text) ? '' : text.slice(0, 500); await finishOrder(chat, u, from); await putU(chat, u); return; }
  if (/^\/menu\b/.test(text)) { await menu(chat, 'Menyu'); await putU(chat, u); return; }
  if (/^\/(shop|catalog)\b/.test(text)) { await showCatalog(chat); await putU(chat, u); return; }
  if (/^\/cart\b/.test(text)) { await showCart(chat, u); return; }
  if (/^\/contact\b/.test(text)) { await say(chat, contactText()); return; }
  const btn = b.config.buttons.find((x) => x.text === text);
  if (btn) {
    if (btn.type === 'catalog') await showCatalog(chat); else if (btn.type === 'contact') await say(chat, contactText()); else if (btn.type === 'about') await say(chat, tbEsc(b.config.about || b.config.welcome));
    else if (btn.type === 'url') await say(chat, tbEsc(btn.text), { reply_markup: { inline_keyboard: [[{ text: '🔗 Ochish', url: /^https?:\/\//.test(btn.value) ? btn.value : 'https://t.me' }]] } });
    else if (btn.type === 'webapp') await say(chat, tbEsc(btn.text), { reply_markup: { inline_keyboard: [[{ text: '🛍 Ochish', web_app: { url: `${origin}/app/${b.id}` } }]] } });
    else await say(chat, tbEsc(btn.value || btn.text));
    await putU(chat, u); return;
  }
  const low = text.toLowerCase(), rep = b.config.replies.find((r) => low.includes(r.keyword));
  await say(chat, tbEsc(rep ? rep.answer : b.config.fallback), { reply_markup: tbKeyboard(b, origin) }); await putU(chat, u);
}
// Xabar yuborish: navbat bilan (Cloudflare 50 so'rov chegarasi), har daqiqada ~40 ta
async function tbBroadcastStart(st, b, text) { const ids = (await st.list('tbu:' + b.id + ':')).map((k) => Number(k.name.split(':')[2])); await st.put('tbj:' + b.id + ':' + Date.now().toString(36), { bot: b.id, text: String(text).slice(0, 3500), ids, i: 0, sent: 0, failed: 0 }, 2 * 86400); return ids.length; }
async function tbBroadcastTick(env) {
  const st = store(env), jobs = await st.list('tbj:'); if (!jobs.length) return;
  for (const k of jobs.slice(0, 2)) {
    const j = await st.get(k.name); if (!j) continue; const b = await tbGet(st, j.bot); if (!b) { await st.put(k.name, null, 60); continue; }
    const end = Math.min(j.ids.length, j.i + 20);
    for (; j.i < end; j.i++) { try { await tbTg(b.token, 'sendMessage', { chat_id: j.ids[j.i], text: j.text, parse_mode: 'HTML' }); j.sent++; } catch { j.failed++; } }
    if (j.i >= j.ids.length) { await st.put(k.name, null, 60); if (b.ownerChat) await tbTg(b.token, 'sendMessage', { chat_id: b.ownerChat, text: `📣 Xabar yuborildi: ${j.sent} ta, xato: ${j.failed} ta.` }).catch(() => {}); } else await st.put(k.name, j, 2 * 86400);
  }
}
// Marshrutlar: /api/my/bots*, /api/tg/*, /api/app/<id>/*, /app/<id>
async function tbMyApi(req, env, ctx, st, J, body, me, pn, origin) {
  const route = `${req.method} ${pn}`;
  const mine = async () => { const out = []; for (const k of await st.list('tb:')) if (k.metadata && k.metadata.u === me.id) { const b = await st.get(k.name); if (b) out.push(b); } return out; };
  if (route === 'GET /api/my/bots') { const os = (await st.list('o:')).map((k) => k.metadata).filter((m) => m && m.bt); return J(await Promise.all((await mine()).map(async (b) => ({ ...tbPub(b, origin), subscribers: await tbSubs(st, b.id), orders: os.filter((m) => m.bt === b.id).length })))); }
  if (route === 'POST /api/my/bots') {
    if (await limited(st, 'botcreate' + me.id, 10, 3600)) return J({ error: "Juda ko'p urinish. Keyinroq urinib ko'ring." }, 429);
    if ((await mine()).length >= 5) return J({ error: 'Botlar soni chegarasi (5)' }, 400);
    const b = await body(4096); try { return J(await tbCreate(env, st, me.id, b.token, pStr(b.name, 60), origin)); } catch (e) { return J({ error: e.message }, 400); }
  }
  const bm = /^\/api\/my\/bots\/([a-f0-9]{6,24})(?:\/(connect|broadcast|orders))?$/.exec(pn); if (!bm) return null;
  const bot = await tbGet(st, bm[1]); if (!bot || bot.userId !== me.id) return J({ error: 'Bot topilmadi' }, 404); const act = bm[2] || '';
  if (!act && req.method === 'GET') return J({ ...tbPub(bot, origin), subscribers: await tbSubs(st, bot.id) });
  if (!act && req.method === 'PUT') { const b = await body(1024 * 1024); bot.config = tbClean(b.config, bot.config); let r = { webhook: !!bot.webhookOk }; try { r = await tbConnect(bot, origin); } catch (e) { r = { webhook: false, warn: e.message }; } await tbSave(st, bot); return J({ ...tbPub(bot, origin), ...r }); }
  if (!act && req.method === 'DELETE') { await tbRemove(st, bot); return J({ ok: true }); }
  if (act === 'connect' && req.method === 'POST') { try { const r = await tbConnect(bot, origin); await tbSave(st, bot); return J({ ...r, bot: tbPub(bot, origin) }); } catch (e) { return J({ error: 'Ulanmadi: ' + e.message }, 400); } }
  if (act === 'broadcast' && req.method === 'POST') { if (await limited(st, 'broadcast' + me.id, 6, 3600)) return J({ error: 'Soatiga 6 ta xabar yuborish mumkin' }, 429); const b = await body(8192), text = pStr(b.text, 3000); if (text.length < 2) return J({ error: 'Xabar matnini yozing' }, 400); return J({ ok: true, total: await tbBroadcastStart(st, bot, text) }); }
  if (act === 'orders' && req.method === 'GET') { const ks = (await tbOrdersOf(st, bot.id)).sort((a, c) => (a.name < c.name ? 1 : -1)).slice(0, 100), out = []; for (const k of ks) { const o = await st.get(k.name); if (o) out.push(o); } return J(out); }
  return null;
}
async function tbPublicApi(req, env, ctx, url, J, body) {
  const st = store(env), pn = url.pathname, origin = url.origin;
  const tw = /^\/api\/tg\/([a-f0-9]{6,24})\/([a-f0-9]{16,64})$/.exec(pn);
  if (tw && req.method === 'POST') {
    const b = await tbGet(st, tw[1]); if (!b || !tEq(b.secret, tw[2]) || (req.headers.get('X-Telegram-Bot-Api-Secret-Token') && !tEq(req.headers.get('X-Telegram-Bot-Api-Secret-Token'), b.secret))) return J({ error: "Ruxsat yo'q" }, 403);
    let upd; try { upd = await req.json(); } catch { return J({ ok: true }); }
    const work = tbHandle(env, st, b, upd, origin).catch(() => {}); if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work; return J({ ok: true });
  }
  const ap = /^\/api\/app\/([a-f0-9]{6,24})\/(config|order)$/.exec(pn);
  if (ap) {
    const b = await tbGet(st, ap[1]); if (!b || b.status !== 'faol') return J({ error: "Do'kon topilmadi" }, 404);
    if (ap[2] === 'config' && req.method === 'GET') return J(tbPublicConfig(b));
    if (ap[2] === 'order' && req.method === 'POST') {
      if (await limited(st, 'apporder' + b.id + (req.headers.get('CF-Connecting-IP') || ''), 12, 600)) return J({ error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." }, 429);
      const x = await body(64 * 1024), user = await tbVerify(b, x.initData); if (!user) return J({ error: "Buyurtma berish uchun do'konni Telegram ichida oching" }, 401);
      const name = pStr(x.name, 100), phone = pStr(x.phone, 40); if (name.length < 2) return J({ error: 'Ismingizni kiriting' }, 400); if (!pGoodPhone(phone)) return J({ error: "Telefon raqamini to'g'ri kiriting" }, 400);
      try { const o = await tbPlaceOrder(st, b, { items: x.items, name, phone, note: x.note, tgUser: user }); return J({ ok: true, id: o.id, total: o.total }); } catch (e) { return J({ error: e.message }, 400); }
    }
  }
  return null;
}
async function tbMiniApp(env, url) {
  const m = /^\/app\/([a-f0-9]{6,24})\/?$/.exec(url.pathname); if (!m) return null;
  const b = await tbGet(store(env), m[1]); if (!b || b.status !== 'faol') return new Response("Do'kon topilmadi", { status: 404 });
  return new Response(MINIAPP_HTML.replace('/*__BOT__*/', `window.__BOT__=${JSON.stringify(b.id)};`), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' } });
}
