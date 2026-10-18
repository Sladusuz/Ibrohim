'use strict';
// Admin panelni Telegram bot orqali boshqarish. Faqat /login bilan kirgan chatlar buyruq bera oladi.
// Xavfsizlik: parol faqat /login da so'raladi (xabar darrov o'chiriladi), urinishlar cheklanadi, o'chirish amallari yo'q,
// to'lovni tasdiqlash tasdiq tugmasi bilan.
const crypto = require('crypto');

module.exports = function makeAdminBot({ db, pay, tg, readJSON, writeJSON, F, newId, checkPassword, baseUrl, limited, siteUrl }) {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/[  ]/g, ' ');
  const token = () => process.env.TELEGRAM_BOT_TOKEN || (db.settings().notify || {}).telegramBotToken || '';
  const cfg = () => Object.assign({ secret: '', chats: [] }, db.settings().adminBot);
  const saveCfg = (c) => { const st = db.settings(); st.adminBot = c; writeJSON(F('settings.json'), st); };
  const call = (m, p) => tg(token(), m, p).catch(() => null);
  const say = (chat, text, extra) => call('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });
  const authed = (chat) => cfg().chats.some((c) => c.id === chat);
  // Mijozlar bilan yozishma (support): mijoz xabari adminlarga boradi, admin "reply" qilsa mijozga qaytadi
  const SUP = () => readJSON(F('support.json'), { map: {}, chats: {} });
  const saveSup = (d) => { const k = Object.keys(d.map); if (k.length > 800) for (const x of k.slice(0, k.length - 800)) delete d.map[x]; writeJSON(F('support.json'), d); };
  const who = (m) => [m.from && m.from.first_name, m.from && m.from.last_name, m.from && m.from.username && '@' + m.from.username].filter(Boolean).join(' ') || 'Mijoz';
  async function supportIn(m) {
    const chat = m.chat.id, text = (m.text || '').trim();
    if (text === '/start' || text === '/help') {
      return say(chat, "👋 <b>Impro IT</b> yordam botiga xush kelibsiz!\n\nSavolingizni shu yerga yozing: mutaxassisimiz tez orada javob beradi. Rasm yoki fayl ham yuborishingiz mumkin.", { reply_markup: { inline_keyboard: [[{ text: "🌐 Saytni o'zim yarataman", url: baseUrl() + '/yaratish.html' }], [{ text: '🤖 Telegram bot yaratish', url: baseUrl() + '/bot.html' }]] } });
    }
    if (limited(String(chat), 'sup', 12, 600e3)) return say(chat, "Juda ko'p xabar yuborildi. Birozdan so'ng yozing.");
    const admins = cfg().chats; if (!admins.length) return say(chat, "Hozir operator ulanmagan. Iltimos, +998 33 623 33 13 raqamiga qo'ng'iroq qiling.");
    const d = SUP(); d.chats[chat] = { name: who(m), at: new Date().toISOString() };
    for (const a of admins) {
      const head = await call('sendMessage', { chat_id: a.id, parse_mode: 'HTML', text: `💬 <b>${esc(who(m))}</b> <code>${chat}</code>\nJavob berish uchun shu xabarga <b>reply</b> qiling.` + (m.text ? `\n\n${esc(text.slice(0, 3500))}` : '') });
      if (head) d.map[a.id + ':' + head.message_id] = chat;
      if (!m.text) { const cp = await call('copyMessage', { chat_id: a.id, from_chat_id: chat, message_id: m.message_id, reply_to_message_id: head && head.message_id }); if (cp) d.map[a.id + ':' + cp.message_id] = chat; }
    }
    saveSup(d);
    return say(chat, '✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.');
  }
  async function supportOut(m) { // admin reply -> mijoz
    const d = SUP(), to = d.map[m.chat.id + ':' + m.reply_to_message.message_id]; if (!to) return false;
    if (m.text) await say(to, `💬 <b>Impro IT:</b>\n${esc(m.text)}`);
    else await call('copyMessage', { chat_id: to, from_chat_id: m.chat.id, message_id: m.message_id });
    await call('setMessageReaction', { chat_id: m.chat.id, message_id: m.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] });
    return true;
  }
  const OS = { yangi: 'Yangi', jarayonda: 'Jarayonda', bajarildi: 'Bajarildi', bekor: 'Bekor' };
  const TYPE = { order: 'Buyurtma', booking: 'Ariza', message: 'Xabar', brief: "Loyiha so'rovi" };

  async function connect() {
    if (!token()) throw new Error("Telegram bot tokeni kiritilmagan (Sozlamalar → Telegram xabarnoma)");
    const base = baseUrl(); if (!/^https:\/\//.test(base)) throw new Error('Webhook uchun HTTPS manzil kerak. Server domen va sertifikat bilan ishlaganda ulang.');
    const c = cfg(); if (!c.secret) c.secret = crypto.randomBytes(16).toString('hex');
    await tg(token(), 'setWebhook', { url: `${base}/api/adminbot/${c.secret}`, secret_token: c.secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
    await call('setMyCommands', { commands: [{ command: 'stats', description: 'Statistika' }, { command: 'orders', description: 'Oxirgi buyurtmalar' }, { command: 'projects', description: 'Mijoz saytlari' }, { command: 'payments', description: "Kutilayotgan to'lovlar" }, { command: 'panel', description: 'Admin panelni ochish' }, { command: 'help', description: 'Yordam' }] });
    await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Admin panel', web_app: { url: `${base}/admin` } } });
    c.connectedAt = new Date().toISOString(); saveCfg(c); return { url: `${base}/api/adminbot/${c.secret}` };
  }
  const status = () => { const c = cfg(); return { hasToken: !!token(), connected: !!c.connectedAt, chats: c.chats.map((x) => ({ id: x.id, name: x.name, at: x.at })) }; };
  function revoke(id) { const c = cfg(); c.chats = c.chats.filter((x) => x.id !== id); saveCfg(c); }

  /* ---------- Ko'rinishlar ---------- */
  const orderText = (o) => `${o.type === 'order' ? '🛒' : o.type === 'booking' ? '📅' : o.type === 'brief' ? '📝' : '✉️'} <b>${TYPE[o.type] || 'Buyurtma'} #${o.id}</b> · ${esc(OS[o.status] || o.status)}\n👤 ${esc(o.name)}\n📞 ${esc(o.phone)}${(o.items || []).length ? '\n' + o.items.map((i) => `• ${esc(i.name)} × ${i.qty}`).join('\n') : ''}${o.total ? `\n💰 ${money(o.total)}` : ''}${o.message ? '\n💬 ' + esc(String(o.message).slice(0, 300)) : ''}${Object.entries(o.extra || {}).slice(0, 8).map(([k, v]) => `\n${esc(k)}: ${esc(String(v).slice(0, 80))}`).join('')}`;
  const orderKb = (o) => ({ inline_keyboard: [[{ text: '⏳ Jarayonda', callback_data: `os:${o.id}:jarayonda` }, { text: '✅ Bajarildi', callback_data: `os:${o.id}:bajarildi` }], [{ text: '❌ Bekor', callback_data: `os:${o.id}:bekor` }, { text: '📞 Qo\'ng\'iroq', url: `https://t.me/+${String(o.phone).replace(/\D/g, '')}` }]].map((r) => r.filter((b) => !b.url || String(o.phone).replace(/\D/g, '').length >= 9)) });
  const projText = (p, user) => `🌐 <b>${esc(p.name)}</b> [${esc(p.template || '')}]\n👤 ${user ? esc(user.name) + ' · ' + esc(user.phone) : '—'}\nHolat: ${esc(p.status)}${p.plan ? ' · ' + esc(p.plan) : ''}${p.price ? '\n💵 ' + esc(p.price) : ''}\n${p.paid ? "✅ To'langan $" + p.paid.usd : "⏳ To'lanmagan"}${p.published ? '\n🔗 ' + esc(siteUrl(p)) : ''}`;

  /* ---------- Tashqi hodisalar: yangi buyurtma, so'rov, to'lov ---------- */
  function notifyOrder(o) { for (const c of cfg().chats) say(c.id, orderText(o), { reply_markup: orderKb(o) }); }
  function notifyText(text, kb) { for (const c of cfg().chats) say(c.id, text, kb ? { reply_markup: kb } : undefined); }
  function notifyPayment(p, meta, user) { notifyText(`💳 <b>To'lov so'rovi</b> #${p.id}\n${esc(meta ? meta.name : '')}\n${user ? esc(user.name) + ' · ' + esc(user.phone) : ''}\n$${p.usd} = ${money(p.uzs)} so'm (${esc(p.method)})`, { inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: `pa:${p.id}` }]] }); }

  /* ---------- Kiruvchi xabarlar ---------- */
  async function handle(upd) {
    if (upd.callback_query) return callback(upd.callback_query);
    const m = upd.message; if (!m || !m.chat || m.chat.type !== 'private') return;
    if (!m.text) { if (authed(m.chat.id)) { if (m.reply_to_message) await supportOut(m); return; } return supportIn(m); }
    const chat = m.chat.id, text = m.text.trim(), cmd = (text.split(/\s+/)[0] || '').replace(/@\w+$/, '').toLowerCase(), arg = text.slice(text.split(/\s+/)[0].length).trim();
    if (cmd === '/login') {
      call('deleteMessage', { chat_id: chat, message_id: m.message_id }); // parol chatda qolmasin
      if (authed(chat)) return say(chat, 'Siz allaqachon kirgansiz. /help');
      if (limited(String(chat), 'abl', 5, 900e3) || limited('all', 'abl', 30, 3600e3)) return say(chat, "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining.");
      if (!checkPassword(arg)) return say(chat, "❌ Parol noto'g'ri.");
      const c = cfg(); c.chats.push({ id: chat, name: [m.from && m.from.first_name, m.from && m.from.username && '@' + m.from.username].filter(Boolean).join(' '), at: new Date().toISOString() }); saveCfg(c);
      return say(chat, "✅ <b>Admin sifatida kirdingiz.</b>\nBuyruqlar: /panel /stats /orders /projects /payments /narx /mijoz /logout\nYangi buyurtmalar shu yerga tugmalar bilan keladi.");
    }
    if (!authed(chat)) return supportIn(m);
    if (m.reply_to_message && !text.startsWith('/') && await supportOut(m)) return;
    if (cmd === '/panel') return say(chat, '🛠 Admin panelni Telegram ichida oching:', { reply_markup: { inline_keyboard: [[{ text: 'Admin panel', web_app: { url: `${baseUrl()}/admin` } }]] } });
    if (cmd === '/logout') { revoke(chat); return say(chat, 'Chiqdingiz. Qayta kirish uchun /login.'); }
    if (cmd === '/start' || cmd === '/help') return say(chat, "<b>Admin buyruqlari</b>\n/panel — admin panel (mini ilova)\n/stats — statistika\n/orders — oxirgi buyurtmalar\n/projects — mijoz saytlari\n/payments — kutilayotgan to'lovlar\n/narx SAYT NARX — masalan <code>/narx lola 900000 so'm</code>\n/mijoz TELEFON — mijoz kartochkasi\n/logout — chiqish");
    if (cmd === '/stats') {
      const os = db.orders().filter((o) => !o.tenant && !o.bot), pr = db.projects(), day = dayStart();
      return say(chat, `📊 <b>Statistika</b>\nBuyurtmalar: <b>${os.length}</b> (yangi: ${os.filter((o) => o.status === 'yangi').length}, bugun: ${os.filter((o) => Date.parse(o.date) >= day).length})\nMijozlar: <b>${db.users().length}</b>\nSaytlar: <b>${pr.length}</b> (sotilgan: ${pr.filter((p) => p.paid).length}, joylangan: ${pr.filter((p) => p.published).length})\nDaromad: <b>$${pr.filter((p) => p.paid).reduce((a, p) => a + (p.paid.usd || 0), 0)}</b>\nBuyurtma summasi: <b>${money(os.filter((o) => o.status !== 'bekor').reduce((a, o) => a + (o.total || 0), 0))}</b>`);
    }
    if (cmd === '/orders') {
      const os = db.orders().filter((o) => !o.tenant && !o.bot).slice(0, 5);
      if (!os.length) return say(chat, "Hali buyurtma yo'q.");
      for (const o of os) await say(chat, orderText(o), { reply_markup: orderKb(o) }); return;
    }
    if (cmd === '/projects') {
      const users = Object.fromEntries(db.users().map((u) => [u.id, u])); const ps = db.projects().filter((p) => p.status !== 'qoralama' || p.paid).slice(0, 6);
      if (!ps.length) return say(chat, "Hali yuborilgan sayt yo'q.");
      for (const p of ps) await say(chat, projText(p, users[p.userId]), p.paid ? undefined : { reply_markup: { inline_keyboard: [[{ text: "✅ To'lovni tasdiqlash", callback_data: `pp:${p.id}` }]] } }); return;
    }
    if (cmd === '/payments') {
      const prj = Object.fromEntries(db.projects().map((p) => [p.id, p])), users = Object.fromEntries(db.users().map((u) => [u.id, u]));
      const ps = pay.list().filter((p) => p.state === 'pending').slice(0, 8);
      if (!ps.length) return say(chat, "Kutilayotgan to'lov yo'q.");
      for (const p of ps) await say(chat, `💳 #${p.id} ${esc((prj[p.projectId] || {}).name || '')}\n${esc((users[p.userId] || {}).name || '')} · $${p.usd} (${esc(p.method)})`, { reply_markup: { inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: `pa:${p.id}` }]] } }); return;
    }
    if (cmd === '/narx') {
      const m2 = /^(\S+)\s+(.{1,60})$/.exec(arg); if (!m2) return say(chat, "Format: <code>/narx SAYT NARX</code>, masalan <code>/narx lola 900000 so'm</code>");
      const all = db.projects(), q = m2[1].toLowerCase(), hit = all.filter((p) => p.id === q || String(p.name).toLowerCase().includes(q));
      if (hit.length !== 1) return say(chat, hit.length ? `Bir nechta sayt topildi (${hit.map((p) => esc(p.name)).join(', ')}). Aniqroq yozing.` : 'Sayt topilmadi.');
      hit[0].price = m2[2]; hit[0].updatedAt = new Date().toISOString(); db.saveProjects(all); return say(chat, `✅ ${esc(hit[0].name)} uchun narx: <b>${esc(m2[2])}</b> (mijozga ko'rinadi)`);
    }
    if (cmd === '/mijoz') {
      const d = arg.replace(/\D/g, '').slice(-9); if (d.length < 7) return say(chat, 'Format: <code>/mijoz 901234567</code>');
      const u = db.users().find((x) => String(x.phone).replace(/\D/g, '').slice(-9) === d); if (!u) return say(chat, 'Mijoz topilmadi.');
      const os = db.orders().filter((o) => o.userId === u.id), ps = db.projects().filter((p) => p.userId === u.id);
      return say(chat, `👤 <b>${esc(u.name)}</b>\n📞 ${esc(u.phone)}${u.email ? '\n✉️ ' + esc(u.email) : ''}\nRo'yxatdan o'tgan: ${esc(String(u.createdAt).slice(0, 10))}\nBuyurtmalar: ${os.length}\nSaytlar: ${ps.map((p) => esc(p.name) + (p.paid ? ' ✅' : '')).join(', ') || '—'}`);
    }
    return say(chat, "Buyruq tushunilmadi. /help");
  }
  const dayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

  async function callback(q) {
    const chat = q.message && q.message.chat.id, ans = (text) => call('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: false });
    if (!chat || !authed(chat)) return ans('Ruxsat yo\'q');
    const [k, a, b] = String(q.data || '').split(':');
    if (k === 'os') {
      const all = db.orders(), o = all.find((x) => x.id === a); if (!o || !OS[b] || b === 'yangi') return ans('Topilmadi');
      o.status = b; db.saveOrders(all);
      await call('editMessageText', { chat_id: chat, message_id: q.message.message_id, text: orderText(o), parse_mode: 'HTML', reply_markup: orderKb(o) }); return ans(`Holat: ${OS[b]}`);
    }
    if (k === 'pp' || k === 'pa') { // tasdiqlash so'raladi
      return say(chat, `⚠️ To'lovni tasdiqlaysizmi? Mijozga saytni yuklab olish va joylash ochiladi.`, { reply_markup: { inline_keyboard: [[{ text: '✅ Ha, tasdiqlash', callback_data: `pc:${k === 'pp' ? 'p' : 'a'}:${a}` }, { text: 'Bekor', callback_data: 'no' }]] } }).then(() => ans());
    }
    if (k === 'pc') {
      let pm;
      if (a === 'p') { // loyiha bo'yicha
        const meta = db.projects().find((x) => x.id === b); if (!meta) return ans('Topilmadi');
        const tp = db.pricing().templatePrice || { usd: 10, rate: 12800 };
        pm = pay.list().find((x) => x.projectId === meta.id && x.state !== 'refunded') || pay.create({ projectId: meta.id, userId: meta.userId, usd: tp.usd, rate: tp.rate, method: 'manual' });
      } else pm = pay.list().find((x) => x.id === b);
      if (!pm) return ans('Topilmadi');
      pay.setPaid(pm.id, true, 'telegram');
      await call('editMessageText', { chat_id: chat, message_id: q.message.message_id, text: "✅ To'lov tasdiqlandi. Mijozga sayt ochildi." }); return ans('Tasdiqlandi');
    }
    if (k === 'no') { await call('editMessageText', { chat_id: chat, message_id: q.message.message_id, text: 'Bekor qilindi.' }); return ans(); }
    return ans();
  }
  return { connect, status, revoke, handle, notifyOrder, notifyText, notifyPayment, cfg };
};
