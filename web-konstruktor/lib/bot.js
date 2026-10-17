'use strict';
// Telegram bot konstruktori: mijoz o'z botining tokenini kiritadi, bot platformamizda ishlaydi (webhook).
// Imkoniyatlar: menyu tugmalari, katalog va savat, buyurtma, avto-javoblar, xabar yuborish, mini ilova (Web App) do'koni.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const API = () => (process.env.TG_API_BASE || 'https://api.telegram.org').replace(/\/$/, '');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const cut = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/[\u00a0\u202f]/g, ' ');
const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : d);

async function tg(token, method, params) {
  const r = await fetch(`${API()}/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params || {}), signal: AbortSignal.timeout(15000) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(j.description || 'Telegram xatosi');
  return j.result;
}

module.exports = function makeBots({ F, readJSON, writeJSON, newId, getOrders, saveOrders, baseUrl, notify }) {
  const file = F('bots.json');
  const dataDir = path.join(path.dirname(file), 'botdata');
  fs.mkdirSync(dataDir, { recursive: true });
  const list = () => readJSON(file, []);
  const save = (v) => writeJSON(file, v);
  const find = (id) => list().find((b) => b.id === id);
  const stFile = (id) => path.join(dataDir, String(id).replace(/[^a-f0-9]/g, '') + '.json');
  const readState = (id) => readJSON(stFile(id), { users: {} });
  const writeState = (id, st) => writeJSON(stFile(id), st);

  /* ---------- Sozlamalarni tozalash ---------- */
  const defaults = (name) => ({
    title: name || 'Mening do\'konim', welcome: `Assalomu alaykum! ${name || 'Botimiz'}ga xush kelibsiz.\nQuyidagi tugmalardan birini tanlang.`, about: '', currency: "so'm", fallback: "Savolingizni tushunmadim. Menyudan tanlang yoki /menu ni bosing.",
    contact: { phone: '', address: '', hours: '' },
    buttons: [{ text: '🛍 Katalog', type: 'catalog', value: '' }, { text: '📞 Aloqa', type: 'contact', value: '' }],
    products: [], replies: [], miniApp: { enabled: false, title: '', accent: '#2f80ed' },
  });
  function clean(c, prev) {
    const d = Object.assign(defaults(), prev || {}); c = c && typeof c === 'object' ? c : {};
    const out = {
      title: cut(c.title != null ? c.title : d.title, 60), welcome: cut(c.welcome != null ? c.welcome : d.welcome, 1500), about: cut(c.about != null ? c.about : d.about, 1500), currency: cut(c.currency != null ? c.currency : d.currency, 12) || "so'm", fallback: cut(c.fallback != null ? c.fallback : d.fallback, 400),
      contact: { phone: cut((c.contact || d.contact).phone, 40), address: cut((c.contact || d.contact).address, 200), hours: cut((c.contact || d.contact).hours, 100) },
      buttons: (Array.isArray(c.buttons) ? c.buttons : d.buttons).slice(0, 10).map((b) => ({ text: cut(b && b.text, 30), type: ['text', 'url', 'catalog', 'webapp', 'contact', 'about'].includes(b && b.type) ? b.type : 'text', value: cut(b && b.value, 1500) })).filter((b) => b.text),
      products: (Array.isArray(c.products) ? c.products : d.products).slice(0, 120).map((p) => ({ id: cut(p && p.id, 20) || newId(3), name: cut(p && p.name, 100), price: Math.max(0, Math.round(Number(p && p.price) || 0)), description: cut(p && p.description, 500), image: /^\/uploads\/[\w.-]+$/.test((p && p.image) || '') || /^https:\/\/[^\s"'<>]+$/.test((p && p.image) || '') ? String(p.image).slice(0, 300) : '', category: cut(p && p.category, 40), active: !p || p.active !== false })).filter((p) => p.name),
      replies: (Array.isArray(c.replies) ? c.replies : d.replies).slice(0, 40).map((r) => ({ keyword: cut(r && r.keyword, 40).toLowerCase(), answer: cut(r && r.answer, 1200) })).filter((r) => r.keyword && r.answer),
      miniApp: { enabled: !!((c.miniApp || d.miniApp).enabled), title: cut((c.miniApp || d.miniApp).title, 40), accent: hex((c.miniApp || d.miniApp).accent, '#2f80ed') },
    };
    const seen = new Set(); out.products.forEach((p) => { while (seen.has(p.id)) p.id = newId(3); seen.add(p.id); });
    return out;
  }
  const pub = (b) => ({ id: b.id, name: b.name, username: b.username, status: b.status, tokenHint: b.token ? '••••' + b.token.slice(-4) : '', config: b.config, claim: b.claim, ownerLinked: !!b.ownerChat, webhook: !!b.webhookOk, createdAt: b.createdAt, appUrl: `${baseUrl()}/app/${b.id}`, link: `https://t.me/${b.username}`, claimLink: `https://t.me/${b.username}?start=${b.claim}` });

  /* ---------- Yaratish / ulash ---------- */
  async function connect(b) {
    const base = baseUrl(); const warn = [];
    if (!/^https:\/\//.test(base)) { b.webhookOk = false; return { webhook: false, warn: "Webhook uchun HTTPS manzil kerak. Server domen va sertifikat bilan ishlaganda bot avtomatik ulanadi." }; }
    await tg(b.token, 'setWebhook', { url: `${base}/api/tg/${b.id}/${b.secret}`, secret_token: b.secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
    try { await tg(b.token, 'setMyCommands', { commands: [{ command: 'start', description: 'Boshlash' }, { command: 'menu', description: 'Menyu' }, { command: 'shop', description: 'Katalog' }, { command: 'cart', description: 'Savat' }, { command: 'contact', description: 'Aloqa' }] }); } catch (e) { warn.push(e.message); }
    try { await tg(b.token, 'setChatMenuButton', b.config.miniApp.enabled ? { menu_button: { type: 'web_app', text: cut(b.config.miniApp.title, 16) || "Do'kon", web_app: { url: `${base}/app/${b.id}` } } } : { menu_button: { type: 'commands' } }); } catch (e) { warn.push(e.message); }
    b.webhookOk = true; return { webhook: true, warn: warn.join('; ') };
  }
  async function create(userId, token, name) {
    token = String(token || '').trim();
    if (!/^\d{6,12}:[\w-]{30,50}$/.test(token)) throw new Error("Token noto'g'ri. @BotFather bergan token shu ko'rinishda bo'ladi: 123456789:AA...");
    if (list().some((x) => x.token === token)) throw new Error('Bu bot allaqachon ulangan');
    let me; try { me = await tg(token, 'getMe'); } catch { throw new Error("Token ishlamadi. @BotFather da tokenni qayta tekshiring."); }
    const b = { id: newId(6), userId, token, secret: crypto.randomBytes(16).toString('hex'), claim: newId(4), username: me.username || '', name: cut(name, 60) || me.first_name || me.username, status: 'faol', ownerChat: 0, webhookOk: false, createdAt: new Date().toISOString(), config: clean(defaults(cut(name, 60) || me.first_name)) };
    b.config = clean({ title: b.name, welcome: defaults(b.name).welcome }, b.config);
    let res = { webhook: false, warn: '' }; try { res = await connect(b); } catch (e) { res = { webhook: false, warn: e.message }; }
    const all = list(); all.unshift(b); save(all);
    return { bot: pub(b), ...res };
  }
  async function reconnect(b) { const res = await connect(b); const all = list(); const i = all.findIndex((x) => x.id === b.id); all[i] = b; save(all); return res; }
  async function remove(b) { try { await tg(b.token, 'deleteWebhook', { drop_pending_updates: true }); } catch { /* ignore */ } save(list().filter((x) => x.id !== b.id)); try { fs.unlinkSync(stFile(b.id)); } catch { /* ignore */ } }
  function update(b, cfg) { const all = list(), x = all.find((q) => q.id === b.id); x.config = clean(cfg, x.config); save(all); return x; }
  const subscribers = (id) => Object.keys(readState(id).users).length;

  /* ---------- Buyurtma (bot ichidan ham, mini ilovadan ham) ---------- */
  function placeOrder(b, { items, name, phone, note, tgUser }) {
    const byId = Object.fromEntries(b.config.products.filter((p) => p.active).map((p) => [p.id, p]));
    const lines = (Array.isArray(items) ? items : []).map((i) => { const p = byId[String(i && i.id)]; const qty = Math.min(99, Math.max(1, parseInt(i && i.qty, 10) || 1)); return p ? { id: p.id, name: p.name, price: p.price, qty } : null; }).filter(Boolean);
    if (!lines.length) throw new Error("Savat bo'sh");
    const total = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const order = { id: newId(4), date: new Date().toISOString(), userId: '', bot: b.id, type: 'order', name: cut(name, 100) || (tgUser && (tgUser.first_name || tgUser.username)) || 'Telegram mijoz', phone: cut(phone, 40), message: cut(note, 600), items: lines, extra: tgUser ? { Telegram: tgUser.username ? '@' + tgUser.username : String(tgUser.id) } : {}, shipping: 0, total, status: 'yangi', note: '' };
    const all = getOrders(); all.unshift(order); saveOrders(all.slice(0, 50000));
    const text = `🛍 <b>Yangi buyurtma #${order.id}</b>\n👤 ${esc(order.name)}${order.extra.Telegram ? ' (' + esc(order.extra.Telegram) + ')' : ''}\n📞 ${esc(order.phone)}\n\n${lines.map((l) => `• ${esc(l.name)} × ${l.qty} = ${money(l.price * l.qty)}`).join('\n')}\n\n<b>Jami: ${money(total)} ${esc(b.config.currency)}</b>${order.message ? '\n💬 ' + esc(order.message) : ''}`;
    if (b.ownerChat) tg(b.token, 'sendMessage', { chat_id: b.ownerChat, text, parse_mode: 'HTML' }).catch(() => {});
    return order;
  }

  /* ---------- Mini ilova: initData tekshiruvi ---------- */
  function verifyInitData(b, initData, maxAge) {
    try {
      const p = new URLSearchParams(String(initData || '')); const hash = p.get('hash'); if (!hash) return null; p.delete('hash');
      const check = [...p.entries()].sort(([a], [c]) => (a < c ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
      const secret = crypto.createHmac('sha256', 'WebAppData').update(b.token).digest();
      const calc = crypto.createHmac('sha256', secret).update(check).digest('hex');
      if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
      if (Date.now() / 1000 - Number(p.get('auth_date') || 0) > (maxAge || 86400)) return null;
      return JSON.parse(p.get('user') || 'null');
    } catch { return null; }
  }
  const publicConfig = (b) => ({ title: b.config.miniApp.title || b.config.title, shop: b.config.title, currency: b.config.currency, accent: b.config.miniApp.accent, about: b.config.about, contact: b.config.contact, enabled: b.config.miniApp.enabled, products: b.config.products.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name, price: p.price, description: p.description, image: p.image, category: p.category })) });

  /* ---------- Bot mantiqi (webhook) ---------- */
  const mainKeyboard = (b) => {
    const rows = []; let row = [];
    for (const btn of b.config.buttons) { row.push(btn.type === 'webapp' ? { text: btn.text, web_app: { url: `${baseUrl()}/app/${b.id}` } } : { text: btn.text }); if (row.length === 2) { rows.push(row); row = []; } }
    if (row.length) rows.push(row);
    if (b.config.miniApp.enabled && !b.config.buttons.some((x) => x.type === 'webapp')) rows.unshift([{ text: "🛍 " + (cut(b.config.miniApp.title, 20) || "Do'kon"), web_app: { url: `${baseUrl()}/app/${b.id}` } }]);
    return { keyboard: rows, resize_keyboard: true, is_persistent: true };
  };

  async function handle(b, upd) {
    const T = (m, p) => tg(b.token, m, p).catch(() => null);
    const say = (chat, text, extra) => T('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', ...extra });
    const st = readState(b.id); const u = (id, from) => (st.users[id] = Object.assign({ name: '', username: '', joined: new Date().toISOString(), cart: {}, step: '' }, st.users[id], from ? { name: cut(from.first_name, 60), username: cut(from.username, 40) } : {}));
    const cats = () => [...new Set(b.config.products.filter((p) => p.active).map((p) => p.category || 'Mahsulotlar'))];
    const prod = (id) => b.config.products.find((p) => p.id === id && p.active);
    const cartLines = (us) => Object.keys(us.cart).map((id) => ({ p: prod(id), qty: us.cart[id] })).filter((x) => x.p);
    const cartText = (us) => { const L = cartLines(us); if (!L.length) return null; return `🧺 <b>Savatingiz</b>\n\n${L.map((x) => `• ${esc(x.p.name)} × ${x.qty} = ${money(x.p.price * x.qty)}`).join('\n')}\n\n<b>Jami: ${money(L.reduce((a, x) => a + x.p.price * x.qty, 0))} ${esc(b.config.currency)}</b>`; };
    const showCart = (chat, us) => { const t = cartText(us); return t ? say(chat, t, { reply_markup: { inline_keyboard: [[{ text: '✅ Buyurtma berish', callback_data: 'o' }, { text: '🗑 Tozalash', callback_data: 'x' }], [{ text: '🛍 Davom etish', callback_data: 'k' }]] } }) : say(chat, "Savatingiz bo'sh. Katalogdan tanlang.", { reply_markup: { inline_keyboard: [[{ text: '🛍 Katalog', callback_data: 'k' }]] } }); };
    const showCatalog = (chat) => {
      const c = cats(); if (!c.length) return say(chat, "Katalog hozircha bo'sh.");
      if (c.length === 1) return showCategory(chat, 0);
      return say(chat, '🛍 <b>Katalog</b>\nBo\'limni tanlang:', { reply_markup: { inline_keyboard: c.map((n, i) => [{ text: n, callback_data: 'c' + i }]) } });
    };
    const showCategory = (chat, i) => { const c = cats(); const name = c[i]; const ps = b.config.products.filter((p) => p.active && (p.category || 'Mahsulotlar') === name).slice(0, 40); return say(chat, `<b>${esc(name)}</b>`, { reply_markup: { inline_keyboard: ps.map((p) => [{ text: `${p.name} — ${money(p.price)}`, callback_data: 'v' + p.id }]) } }); };
    const showProduct = async (chat, p) => {
      const cap = `<b>${esc(p.name)}</b>\n${p.description ? esc(p.description) + '\n' : ''}\n💰 ${money(p.price)} ${esc(b.config.currency)}`;
      const kb = { inline_keyboard: [[{ text: '➕ Savatga qo\'shish', callback_data: 'a' + p.id }], [{ text: '🧺 Savat', callback_data: 'b' }, { text: '⬅ Orqaga', callback_data: 'k' }]] };
      const img = p.image ? (/^\//.test(p.image) ? baseUrl() + p.image : p.image) : '';
      if (img) { const r = await T('sendPhoto', { chat_id: chat, photo: img, caption: cap, parse_mode: 'HTML', reply_markup: kb }); if (r) return r; }
      return say(chat, cap, { reply_markup: kb });
    };
    const contactText = () => { const c = b.config.contact; const L = [c.phone && `📞 ${esc(c.phone)}`, c.address && `📍 ${esc(c.address)}`, c.hours && `🕒 ${esc(c.hours)}`].filter(Boolean); return L.length ? L.join('\n') : "Aloqa ma'lumoti hali kiritilmagan."; };
    const menu = (chat, text) => say(chat, text || 'Menyu', { reply_markup: mainKeyboard(b) });
    const finishOrder = async (chat, us, from) => {
      try {
        const o = placeOrder(b, { items: Object.keys(us.cart).map((id) => ({ id, qty: us.cart[id] })), name: us.name, phone: us.phone, note: us.note, tgUser: { id: from.id, username: from.username, first_name: from.first_name } });
        us.cart = {}; us.step = ''; us.note = '';
        await say(chat, `✅ <b>Buyurtmangiz qabul qilindi!</b> #${o.id}\nJami: ${money(o.total)} ${esc(b.config.currency)}\nTez orada siz bilan bog'lanamiz.`, { reply_markup: mainKeyboard(b) });
      } catch (e) { us.step = ''; await say(chat, esc(e.message), { reply_markup: mainKeyboard(b) }); }
    };

    /* --- callback tugmalar --- */
    if (upd.callback_query) {
      const q = upd.callback_query, chat = q.message && q.message.chat.id, from = q.from; if (!chat) return;
      const us = u(chat, from); const d = String(q.data || ''); const kind = d[0], arg = d.slice(1);
      let toast = '';
      if (kind === 'k') await showCatalog(chat);
      else if (kind === 'c') await showCategory(chat, Number(arg) || 0);
      else if (kind === 'v') { const p = prod(arg); if (p) await showProduct(chat, p); }
      else if (kind === 'a') { const p = prod(arg); if (p) { us.cart[p.id] = Math.min(99, (us.cart[p.id] || 0) + 1); toast = `Savatga qo'shildi (${us.cart[p.id]})`; } }
      else if (kind === 'b') await showCart(chat, us);
      else if (kind === 'x') { us.cart = {}; toast = 'Savat tozalandi'; await say(chat, 'Savat tozalandi.'); }
      else if (kind === 'o') {
        if (!cartLines(us).length) toast = "Savat bo'sh";
        else { us.step = 'phone'; await say(chat, '📱 Telefon raqamingizni yuboring (tugmani bosing yoki yozing):', { reply_markup: { keyboard: [[{ text: '📱 Raqamni ulashish', request_contact: true }], [{ text: '❌ Bekor qilish' }]], resize_keyboard: true, one_time_keyboard: true } }); }
      }
      writeState(b.id, st); await T('answerCallbackQuery', { callback_query_id: q.id, text: toast || undefined }); return;
    }

    const m = upd.message; if (!m || !m.chat || m.chat.type !== 'private') return;
    const chat = m.chat.id, from = m.from || {}; const us = u(chat, from); const text = String(m.text || '').trim();
    const owner = b.ownerChat && chat === b.ownerChat;

    if (/^\/start\b/.test(text)) {
      const payload = text.split(/\s+/)[1] || '';
      if (payload && payload === b.claim) {
        const all = list(), x = all.find((q) => q.id === b.id); x.ownerChat = chat; save(all); b.ownerChat = chat;
        await say(chat, "✅ <b>Siz bot egasi sifatida ulandingiz.</b> Yangi buyurtmalar shu yerga keladi.\n\nBuyruqlar:\n/stats — statistika\n/orders — oxirgi buyurtmalar\n/broadcast MATN — barcha obunachilarga xabar", { reply_markup: mainKeyboard(b) }); writeState(b.id, st); return;
      }
      await menu(chat, b.config.welcome); writeState(b.id, st); return;
    }
    if (owner && /^\/stats\b/.test(text)) { const os = getOrders().filter((o) => o.bot === b.id); await say(chat, `📊 Obunachilar: <b>${Object.keys(st.users).length}</b>\nBuyurtmalar: <b>${os.length}</b>\nJami summa: <b>${money(os.reduce((a, o) => a + (o.total || 0), 0))} ${esc(b.config.currency)}</b>`); return; }
    if (owner && /^\/orders\b/.test(text)) { const os = getOrders().filter((o) => o.bot === b.id).slice(0, 5); await say(chat, os.length ? os.map((o) => `#${o.id} ${esc(o.name)} ${esc(o.phone)} — ${money(o.total)} ${esc(b.config.currency)}`).join('\n') : "Hali buyurtma yo'q."); return; }
    if (owner && /^\/broadcast\b/.test(text)) {
      const msg = text.replace(/^\/broadcast\s*/, ''); if (!msg) { await say(chat, 'Matnni yozing: /broadcast Salom!'); return; }
      const n = await broadcast(b, msg); await say(chat, `📣 Yuborildi: ${n.sent} ta, xato: ${n.failed} ta.`); return;
    }
    if (m.contact && us.step === 'phone') { us.phone = cut(m.contact.phone_number, 30); us.name = us.name || cut(m.contact.first_name, 60); us.step = 'note'; await say(chat, "💬 Manzil yoki izoh yozing (o'tkazib yuborish uchun /skip):", { reply_markup: { remove_keyboard: true } }); writeState(b.id, st); return; }
    if (us.step === 'phone') {
      if (/bekor/i.test(text)) { us.step = ''; await menu(chat, 'Bekor qilindi.'); writeState(b.id, st); return; }
      if (/^[+\d][\d\s()\-]{6,}$/.test(text)) { us.phone = text.slice(0, 30); us.step = 'note'; await say(chat, "💬 Manzil yoki izoh yozing (o'tkazib yuborish uchun /skip):", { reply_markup: { remove_keyboard: true } }); } else await say(chat, "Telefon raqamini to'g'ri yozing (masalan, +998 90 123 45 67) yoki tugmani bosing.");
      writeState(b.id, st); return;
    }
    if (us.step === 'note') { us.note = /^\/skip\b/.test(text) ? '' : text.slice(0, 500); await finishOrder(chat, us, from); writeState(b.id, st); return; }
    if (/^\/menu\b/.test(text)) { await menu(chat, 'Menyu'); writeState(b.id, st); return; }
    if (/^\/(shop|catalog)\b/.test(text)) { await showCatalog(chat); return; }
    if (/^\/cart\b/.test(text)) { await showCart(chat, us); return; }
    if (/^\/contact\b/.test(text)) { await say(chat, contactText()); return; }

    const btn = b.config.buttons.find((x) => x.text === text);
    if (btn) {
      if (btn.type === 'catalog') await showCatalog(chat);
      else if (btn.type === 'contact') await say(chat, contactText());
      else if (btn.type === 'about') await say(chat, esc(b.config.about || b.config.welcome));
      else if (btn.type === 'url') await say(chat, esc(btn.text), { reply_markup: { inline_keyboard: [[{ text: '🔗 Ochish', url: /^https?:\/\//.test(btn.value) ? btn.value : 'https://t.me' }]] } });
      else if (btn.type === 'webapp') await say(chat, esc(btn.text), { reply_markup: { inline_keyboard: [[{ text: '🛍 Ochish', web_app: { url: `${baseUrl()}/app/${b.id}` } }]] } });
      else await say(chat, esc(btn.value || btn.text));
      writeState(b.id, st); return;
    }
    const low = text.toLowerCase(); const rep = b.config.replies.find((r) => low.includes(r.keyword));
    await say(chat, esc(rep ? rep.answer : b.config.fallback), { reply_markup: mainKeyboard(b) }); writeState(b.id, st);
  }

  async function broadcast(b, text) {
    const st = readState(b.id); let sent = 0, failed = 0; const ids = Object.keys(st.users);
    for (let i = 0; i < ids.length; i++) { try { await tg(b.token, 'sendMessage', { chat_id: Number(ids[i]), text: String(text).slice(0, 3500), parse_mode: 'HTML' }); sent++; } catch { failed++; } if (i % 20 === 19) await new Promise((r) => setTimeout(r, 1100)); }
    return { sent, failed };
  }

  return { list, find, create, update, reconnect, remove, handle, broadcast, placeOrder, verifyInitData, publicConfig, subscribers, pub, clean, tg };
};
