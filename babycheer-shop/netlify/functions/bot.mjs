import * as shop from './lib/shop.js';
import { api, safe, notifyAdmins, allAdminIds, isAdminId, isOwnerId, ownerIds, esc } from './lib/tg.js';
import * as admins from './lib/admins.js';
import * as store from './lib/store.js';
import { adminOrderKb, customerOrderKb, openShopKb, inlineKb, shopUrl, statusMessage } from './lib/botui.js';

export const config = { path: '/tg' };

const isAdmin = (id) => isAdminId(id);
const send = (chat_id, text, extra = {}) => safe('sendMessage', { chat_id, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...extra });

const ADMIN_HELP = `🔧 <b>Admin buyruqlari</b>

/orders: oxirgi buyurtmalar (holat va to'lov tugmalari bilan)
/stats: buyurtmalar soni va tushum
/products: mahsulotlar ro'yxati (id, narx, ombor)
/price <i>id narx</i>: narxni o'zgartirish
/oldprice <i>id narx</i>: eski narx (0 = chegirmasiz)
/stock <i>id son</i>: ombor
/del <i>id</i>: mahsulotni o'chirish
/addcat <i>Nom</i>: yangi kategoriya
/add: yangi mahsulot. Rasm bilan yuboring, izohga:
<code>/add Kategoriya | Nom | narx | eski narx | ombor | tavsif | rang1, rang2</code>
/photo <i>id</i>: mahsulot rasmini almashtirish (rasm izohiga yozing)
/invite: yangi admin taklif havolasi · /admins · /removeadmin <i>ID</i> (faqat asosiy admin)
/myid: Telegram ID raqamingiz
/set <i>kalit qiymat</i>: sozlama (phone, telegram, regionFee, channel, instagram)`;

export default async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  const secret = process.env.WEBHOOK_SECRET;
  // kalit sozlanmagan bo'lsa ham rad etiladi: aks holda har kim soxta (admin nomidan) update yubora olardi
  if (!secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) return new Response('forbidden', { status: 403 });
  let update;
  try { update = await req.json(); } catch { return new Response('bad request', { status: 400 }); }
  try {
    const ctx = { url: shopUrl(req) };
    if (update.message) await onMessage(update.message, ctx);
    else if (update.callback_query) await onCallback(update.callback_query, ctx);
    else if (update.pre_checkout_query) await onPreCheckout(update.pre_checkout_query);
  } catch (e) {
    console.error(e);
    const chat = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    if (chat) await send(chat, "⚠️ Vaqtincha xatolik yuz berdi. Iltimos, bir necha soniyadan keyin qayta urinib ko'ring.");
  }
  return new Response('ok'); // doim 200: Telegram xabarni qayta-qayta yuborib ketmasin
};

// ---------- mijoz xabarlari adminlarga ----------
const recentMsgs = new Map(); // spamdan himoya: 10 daqiqada 15 tadan ko'p xabar yetkazilmaydi
const lastAck = new Map();

async function relayToAdmins(m, ctx) {
  const u = m.from, now = Date.now();
  const arr = (recentMsgs.get(u.id) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (arr.length >= 15) {
    if (arr.length === 15) { arr.push(now); recentMsgs.set(u.id, arr); await send(m.chat.id, "⏳ Juda ko'p xabar yubordingiz. Birozdan keyin yozing."); }
    return;
  }
  arr.push(now); recentMsgs.set(u.id, arr);
  const who = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Mijoz';
  const head = `💬 <b>Mijoz xabari</b>\n👤 ${esc(who)}${u.username ? ` @${esc(u.username)}` : ''} · ID <code>${u.id}</code>`;
  const body = m.text ? `\n\n${esc(m.text)}` : m.caption ? `\n\n${esc(m.caption)}` : '';
  const hint = '\n\n<i>↩️ Javob berish uchun shu xabarga reply qiling</i>';
  await Promise.allSettled((await allAdminIds()).map(async (aid) => {
    const h = await send(aid, head + (m.text ? body : '') + hint);
    if (h && h.message_id) await store.put(`fwd:${aid}:${h.message_id}`, u.id);
    if (!m.text) { // rasm, ovoz, hujjat va h.k.: asl xabarning nusxasi
      const c = await safe('copyMessage', { chat_id: aid, from_chat_id: m.chat.id, message_id: m.message_id });
      if (c && c.message_id) await store.put(`fwd:${aid}:${c.message_id}`, u.id);
    }
  }));
  if (now - (lastAck.get(u.id) || 0) > 10 * 60 * 1000) {
    lastAck.set(u.id, now);
    await send(m.chat.id, "✅ Xabaringiz adminga yuborildi. Tez orada javob beramiz.", { reply_markup: openShopKb(ctx.url) });
  }
}

/** Admin mijoz xabariga reply qilsa, javob mijozga yetadi. */
async function adminReply(m) {
  const uid = await store.get(`fwd:${m.chat.id}:${m.reply_to_message.message_id}`);
  if (!uid) return false;
  const r = await safe('copyMessage', { chat_id: uid, from_chat_id: m.chat.id, message_id: m.message_id });
  await send(m.chat.id, r ? '✅ Javob mijozga yuborildi' : "⚠️ Yuborib bo'lmadi (mijoz botni to'xtatgan bo'lishi mumkin)");
  return true;
}

// ---------- xabarlar ----------
async function onMessage(m, ctx) {
  const chat = m.chat.id;
  if (m.successful_payment) return onPaid(m);
  const text = (m.text || m.caption || '').trim();
  const [cmdRaw, ...rest] = text.split(/\s+/);
  const cmd = cmdRaw.startsWith('/') ? cmdRaw.split('@')[0].toLowerCase() : '';
  const arg = text.slice(cmdRaw.length).trim();

  if (m.reply_to_message && (await isAdmin(m.from.id)) && (await adminReply(m))) return;

  if (m.photo && m.reply_to_message && /BC-\d+/.test(m.reply_to_message.text || '') && !(await isAdmin(m.from.id))) return onReceipt(m);

  if (cmd === '/myid') return send(chat, `Sizning Telegram ID raqamingiz: <code>${m.from.id}</code>`);

  if (cmd === '/start' && arg.startsWith('adm_')) { // admin taklif havolasi
    const r = await admins.acceptInvite(arg.slice(4), m.from);
    if (!r.ok) return send(chat, `⚠️ ${esc(r.reason)}`);
    await notifyAdmins(`👤 <b>Yangi admin qo'shildi</b>: ${esc(r.name)} (<code>${m.from.id}</code>)`);
    return send(chat, "✅ <b>Siz admin bo'ldingiz!</b>\nMahsulot qo'shish, tahrirlash va buyurtmalarni boshqarish uchun pastdagi tugmani bosing 👇\n\nBuyruqlar ro'yxati: /admin",
      { reply_markup: inlineKb([[['🔧 Admin panelni ochish', `${ctx.url}/admin.html`]]]) });
  }

  if (cmd === '/start' || cmd === '/shop') {
    await safe('setChatMenuButton', { chat_id: chat, menu_button: { type: 'web_app', text: 'Open', web_app: { url: ctx.url } } });
    const { settings: s } = await shop.getCatalog();
    return send(chat,
      `Assalomu alaykum, ${esc(m.from.first_name || '')}! 👋\n\n<b>${esc(s.name)}</b>: bolalar elektromobili, kalyaska, velokalyaska, mototsikl va samokatlar.\n` +
      `🚚 Toshkent bo'ylab yetkazib berish bepul · 📦 butun O'zbekiston bo'ylab yetkazib beramiz\n\nDo'konni ochish uchun pastdagi <b>Open</b> tugmasini yoki shu tugmani bosing 👇`,
      { reply_markup: openShopKb(ctx.url) });
  }
  if (cmd === '/orders' && !(await isAdmin(m.from.id))) {
    const list = await shop.userOrders(m.from.id);
    if (!list.length) return send(chat, 'Sizda hali buyurtma yo\'q.', { reply_markup: openShopKb(ctx.url) });
    for (const o of list.slice(0, 5)) await send(chat, shop.orderText(o), { reply_markup: customerOrderKb(o) });
    return;
  }
  if (cmd === '/help' || cmd === '/contact') {
    const { settings: s } = await shop.getCatalog();
    return send(chat, `☎️ <b>${esc(s.name)}</b>\nTelefon: ${esc(s.phone)}\nTelegram: @${esc(s.telegram)}\nKanal: ${esc(s.channel)}\nInstagram: ${esc(s.instagram)}`);
  }

  const admin = await isAdmin(m.from.id);
  if (cmd && admin) {
    const handled = await adminCommand(cmd, arg, m, ctx);
    if (handled !== false) return;
  }
  if (admin) {
    if (!cmd && !m.photo) return send(chat, "Do'konni ochish uchun tugmani bosing 👇", { reply_markup: openShopKb(ctx.url) });
    return;
  }
  if (m.chat.type && m.chat.type !== 'private') return; // guruhlardagi xabarlar yetkazilmaydi
  return relayToAdmins(m, ctx); // oddiy foydalanuvchi: xabar adminlarga boradi
}

// ---------- mijoz: chek ----------
async function onReceipt(m) {
  const no = /BC-(\d+)/.exec(m.reply_to_message.text)[1];
  const o = await shop.getOrder(Number(no) - 1000);
  if (!o || o.user_id !== m.from.id) return send(m.chat.id, 'Buyurtma topilmadi.');
  await Promise.allSettled((await allAdminIds()).map((id) => safe('sendPhoto', {
    chat_id: id, photo: m.photo.at(-1).file_id, parse_mode: 'HTML',
    caption: `🧾 <b>To'lov cheki</b>\n\n${shop.orderText(o)}`.slice(0, 1020), reply_markup: adminOrderKb(o),
  })));
  return send(m.chat.id, 'Chek yuborildi ✅ Operator tekshirib, to\'lovni tasdiqlaydi.');
}

// ---------- to'lov ----------
async function onPreCheckout(q) {
  const id = Number(String(q.invoice_payload).split(':')[1]);
  const o = await shop.getOrder(id);
  const ok = !!o && !o.paid && o.status !== 'cancelled' && o.total * 100 === q.total_amount;
  await safe('answerPreCheckoutQuery', { pre_checkout_query_id: q.id, ok, ...(ok ? {} : { error_message: "Buyurtma topilmadi yoki allaqachon to'langan." }) });
}

async function onPaid(m) {
  const id = Number(String(m.successful_payment.invoice_payload).split(':')[1]);
  const o = await shop.markPaid(id);
  await Promise.allSettled([
    send(m.chat.id, `✅ To'lov qabul qilindi. Buyurtma ${shop.orderNo(id)} uchun rahmat!`),
    notifyAdmins(`💰 <b>Onlayn to'lov qabul qilindi</b>\n\n${shop.orderText(o)}`, { reply_markup: adminOrderKb(o) }),
  ]);
}

// ---------- tugmalar ----------
async function onCallback(q, ctx) {
  const [kind, idRaw, extra] = String(q.data).split(':');
  const id = Number(idRaw);
  const answer = (text, alert = false) => safe('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: alert });

  if (kind === 'rc') {
    const o = await shop.getOrder(id);
    if (!o || o.user_id !== q.from.id || o.paid) return answer('Kerak emas', true);
    await send(q.message.chat.id, `🧾 <b>${shop.orderNo(id)}</b> uchun chek rasmini shu xabarga <b>javob (reply)</b> qilib yuboring.`, { reply_markup: { force_reply: true, selective: true } });
    return answer();
  }

  if (!(await isAdmin(q.from.id))) return answer('Ruxsat yo\'q', true);
  if (kind !== 'st' && kind !== 'pay') return answer();
  const o = kind === 'st' ? await shop.setStatus(id, extra) : await shop.markPaid(id);
  const edit = q.message.photo
    ? { method: 'editMessageCaption', params: { caption: shop.orderText(o).slice(0, 1020) } }
    : { method: 'editMessageText', params: { text: shop.orderText(o) } };
  await safe(edit.method, { chat_id: q.message.chat.id, message_id: q.message.message_id, parse_mode: 'HTML', reply_markup: adminOrderKb(o), ...edit.params });
  await send(o.user_id, kind === 'st' ? statusMessage(o) : `💰 Buyurtma ${shop.orderNo(o.id)} uchun to'lov tasdiqlandi. Rahmat!`);
  return answer(kind === 'st' ? 'Yangilandi' : "To'langan deb belgilandi");
}

// ---------- admin buyruqlari ----------
const num = (s) => (/^\d+$/.test(String(s).replace(/\s/g, '')) ? Number(String(s).replace(/\s/g, '')) : null);
const chunk = (lines, max = 3500) => lines.reduce((acc, l) => { const last = acc.at(-1); if (last && (last + '\n' + l).length < max) acc[acc.length - 1] = last + '\n' + l; else acc.push(l); return acc; }, []);

async function adminCommand(cmd, arg, m, ctx) {
  const chat = m.chat.id;
  const reply = (t, extra) => send(chat, t, extra);

  if (cmd === '/invite' || cmd === '/admins' || cmd === '/removeadmin') {
    if (!isOwnerId(m.from.id)) return reply("⛔ Adminlarni faqat asosiy admin boshqara oladi.");
    if (cmd === '/invite') {
      const link = await admins.createInvite(m.from.id);
      return reply(`🔗 <b>Admin taklif havolasi</b> (24 soat, bir marta ishlaydi)\n\n${esc(link)}\n\nShuni yangi adminga yuboring: havolani bosib botni ochsa, avtomatik admin bo'ladi.`);
    }
    if (cmd === '/admins') {
      const list = await admins.listAdmins();
      return reply(`👥 <b>Adminlar</b>\n\n⭐ Asosiy: ${ownerIds().map((i) => `<code>${i}</code>`).join(', ')}\n` + (list.length ? list.map((a) => `• ${esc(a.name)}${a.username ? ` @${esc(a.username)}` : ''} (<code>${a.id}</code>)`).join('\n') : "Qo'shilgan adminlar yo'q.") + "\n\nOlib tashlash: <code>/removeadmin ID</code>\nYangi admin: /invite");
    }
    const ok = await admins.removeAdmin(Number(arg));
    return reply(ok ? `✅ Admin olib tashlandi: <code>${esc(arg)}</code>` : "Admin topilmadi (asosiy adminni olib tashlab bo'lmaydi).");
  }
  if (cmd === '/admin') {
    await reply("🔧 <b>Admin panel</b>\nMahsulot qo'shish, tahrirlash, rasm yuklash, buyurtmalarni tasdiqlash va sozlamalar bitta joyda 👇",
      { reply_markup: inlineKb([[['🔧 Admin panelni ochish', `${ctx.url}/admin.html`]]]) });
    return reply(ADMIN_HELP);
  }
  if (cmd === '/orders') {
    const list = await shop.recentOrders(10);
    if (!list.length) return reply("Buyurtma yo'q.");
    for (const o of list) await reply(shop.orderText(o), { reply_markup: adminOrderKb(o) });
    return;
  }
  if (cmd === '/stats') {
    const list = await shop.recentOrders(50);
    const ok = list.filter((o) => o.status !== 'cancelled');
    const byStatus = Object.entries(shop.STATUSES).map(([k, v]) => `${v}: ${list.filter((o) => o.status === k).length}`).join('\n');
    return reply(`📊 <b>Oxirgi ${list.length} ta buyurtma</b>\n${byStatus}\n\nTushum (bekorlarsiz): <b>${shop.money(ok.reduce((s, o) => s + o.total, 0))}</b>\nTo'langan: ${ok.filter((o) => o.paid).length} ta`);
  }
  if (cmd === '/products') {
    const c = await shop.getCatalog();
    const lines = c.products.filter((p) => p.active).map((p) => `<b>${p.id}</b> · ${esc(p.title)} · ${shop.money(p.price)}${p.old_price ? ` (eski ${shop.money(p.old_price)})` : ''} · ombor: ${p.stock}${p.photo ? ' 🖼' : ''}`);
    for (const part of chunk(lines)) await reply(part);
    return;
  }
  if (cmd === '/price' || cmd === '/oldprice' || cmd === '/stock') {
    const [id, val] = arg.split(/\s+/);
    const n = num(val);
    if (!num(id) || n === null || (cmd === '/price' && n < 1)) return reply(`Format: <code>${cmd} id son</code>`);
    const field = cmd === '/price' ? 'price' : cmd === '/oldprice' ? 'old_price' : 'stock';
    let title = null;
    await shop.updateCatalog((c) => { const p = c.products.find((x) => x.id === Number(id) && x.active); if (p) { p[field] = n; title = p.title; } return c; });
    return reply(title ? `✅ ${esc(title)}: ${field} = ${n}` : 'Mahsulot topilmadi.');
  }
  if (cmd === '/del') {
    let title = null;
    await shop.updateCatalog((c) => { const p = c.products.find((x) => x.id === Number(arg) && x.active); if (p) { p.active = false; title = p.title; } return c; });
    return reply(title ? `🗑 «${esc(title)}» o'chirildi` : 'Mahsulot topilmadi.');
  }
  if (cmd === '/addcat') {
    if (arg.length < 2) return reply('Format: <code>/addcat Nom</code>');
    await shop.updateCatalog((c) => {
      if (c.categories.some((x) => x.name.toLowerCase() === arg.toLowerCase())) return c;
      c.categories.push({ id: c.nextCategoryId++, slug: arg.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: arg, icon: 'car', sort: 99 });
      return c;
    });
    return reply(`✅ Kategoriya: ${esc(arg)}`);
  }
  if (cmd === '/add') {
    const parts = arg.split('|').map((x) => x.trim());
    const [catName, title, price, old, stock, desc = '', colors = ''] = parts;
    if (parts.length < 5 || !title || !num(price) || num(old) === null || num(stock) === null) {
      return reply('Format:\n<code>/add Kategoriya | Nom | narx | eski narx | ombor | tavsif | rang1, rang2</code>\n(rasm bilan yuboring; eski narx yo\'q bo\'lsa 0)');
    }
    let added = null, err = null;
    await shop.updateCatalog((c) => {
      const cat = c.categories.find((x) => x.name.toLowerCase() === catName.toLowerCase() || x.slug === catName.toLowerCase());
      if (!cat) { err = `Kategoriya topilmadi: ${catName}. Mavjud: ${c.categories.map((x) => x.name).join(', ')}`; return c; }
      const list = colors.split(',').map((x) => x.trim()).filter(Boolean).map((name) => ({ name, hex: shop.COLOR_HEX[name] || '#7d8594' }));
      added = { id: c.nextProductId++, category_id: cat.id, title, brand: 'BabyCheer', price: num(price), old_price: num(old), stock: num(stock), badge: '', featured: false, short: desc, description: desc, specs: {}, colors: list, photo: m.photo ? m.photo.at(-1).file_id : null, images: m.photo ? [m.photo.at(-1).file_id] : [], active: true, sort: 100 + c.nextProductId };
      c.products.push(added);
      return c;
    });
    return reply(err ? `⚠️ ${esc(err)}` : `✅ «${esc(added.title)}» qo'shildi (id ${added.id})`);
  }
  if (cmd === '/photo') {
    if (!m.photo || !num(arg)) return reply('Rasm yuboring va izohiga yozing: <code>/photo id</code>');
    let title = null;
    await shop.updateCatalog((c) => { const p = c.products.find((x) => x.id === Number(arg) && x.active); if (p) { const fid = m.photo.at(-1).file_id; p.photo = fid; p.images = [fid, ...shop.imagesOf(p).slice(1)]; title = p.title; } return c; });
    return reply(title ? `🖼 «${esc(title)}» rasmi yangilandi` : 'Mahsulot topilmadi.');
  }
  if (cmd === '/set') {
    const [key, ...v] = arg.split(/\s+/);
    const val = v.join(' ');
    const numeric = ['regionFee'];
    const allowed = [...numeric, 'phone', 'telegram', 'channel', 'instagram', 'name'];
    if (!allowed.includes(key) || !val || (numeric.includes(key) && num(val) === null)) return reply(`Format: <code>/set kalit qiymat</code>\nKalitlar: ${allowed.join(', ')}`);
    await shop.updateCatalog((c) => { c.settings[key] = numeric.includes(key) ? num(val) : val; return c; });
    return reply(`✅ ${key} = ${esc(val)}`);
  }
  return false;
}
