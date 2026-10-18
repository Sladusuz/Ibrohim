/* ---------- Buyurtma boti (@improuzbekiston_bot): buyurtma va to'lov faqat shu yerda; @improsupport_bot faqat yordam uchun ---------- */
const ORDER_ON = (env) => !!env.ORDER_BOT_TOKEN;
const orderEnv = (env) => ({ ...env, TG_TOKEN: env.ORDER_BOT_TOKEN, MAIN: env.MAIN || env });
const AE = (env) => env.MAIN || env; // admin xabarlari doim asosiy (yordam) bot orqali ketadi
const payEnv = (env) => (ORDER_ON(env) ? orderEnv(env) : env); // to'lov hisob-fakturalari buyurtma bot orqali yaratiladi
const ORDER_USER = (env) => String(env.ORDER_BOT_USERNAME || 'improuzbekiston_bot').replace(/^@/, '');
const ORDER_LINK = (env, start) => `https://t.me/${ORDER_USER(env)}${start ? '?start=' + start : ''}`;
const SUPPORT_LINK = 'https://t.me/improsupport_bot';
const owners = (env) => String(env.TG_CHAT || '').split(',').map((x) => Number(x.trim())).filter(Boolean); // faqat ega: Mini App/panel
const isOwner = async (env, st, id) => { const o = owners(env); return o.length ? o.includes(Number(id)) : (await adminsOf(env, st)).includes(Number(id)); };
const ORDER_MENU = { inline_keyboard: [[{ text: '📝 Buyurtma berish', callback_data: 'm:order' }, { text: '💰 Tariflar', callback_data: 'm:tar' }], [{ text: "💳 To'lov qilish", callback_data: 'm:pay' }, { text: '📞 Aloqa', callback_data: 'm:contact' }], [{ text: '💬 Savol berish (yordam boti)', url: SUPPORT_LINK }], [{ text: '🌐 Sayt yaratish', url: 'https://improuzbekiston.uz/yaratish.html' }, { text: '🤖 Bot yaratish', url: 'https://improuzbekiston.uz/bot.html' }]] };
const tariffsText = () => `💰 <b>Tariflar</b>\n\n${calcServices().map((x, i) => `${i + 1}. <b>${esc(x.name)}</b> — ${fmtSum(x.price)} so'm${x.days ? ' · ' + esc(x.days) : ''}`).join('\n')}\n\n🌐 O'zingiz shablondan yarating: $10\n🤖 Telegram bot: $15, katalog +$20, mini ilova +$20\n\nXizmatni tanlang, buyurtma qoldiring va shu yerning o'zida to'lang:`;
const tariffsKb = () => ({ inline_keyboard: [...calcServices().map((x, i) => [{ text: `${x.name} — ${fmtSum(x.price)}`, callback_data: 'o:svc:' + i }]), [{ text: '📝 Boshqa xizmat / maslahat', callback_data: 'm:order' }]] });
async function orderWelcome(env, st, chat, m, payload) {
  const rec = (await st.get('c:' + chat)) || { hist: [] }; rec.name = rec.name || (m ? who(m) : ''); rec.orderBot = 1;
  if (payload && !rec.src && /^[\w-]{1,30}$/.test(payload) && !/^(order|svc\d+|pay_[\w]+|tar)$/.test(payload)) { rec.src = payload.toLowerCase(); await ev(st, { k: 'start', c: chat, n: rec.name, x: 'ob:' + rec.src }); }
  await saveRec(st, chat, rec); await ev(st, { k: 'ostart', c: chat, n: rec.name, x: payload || '' });
  return say(env, chat, `👋 <b>Impro IT</b> buyurtma botiga xush kelibsiz!\n\nBu yerda xizmatni tanlab buyurtma berasiz, summani ko'rasiz va darrov to'laysiz. To'lovdan keyin buyurtmangiz qabul qilinadi va mutaxassisimiz siz bilan bog'lanadi.\n\nSavollaringiz bo'lsa — yordam botiga yozing: @improsupport_bot`, { reply_markup: ORDER_MENU });
}
async function resendInvoice(env, st, chat, payId) {
  const p = await st.get('po:' + String(payId).replace(/[^\w]/g, '')); if (!p) return say(env, chat, "Buyurtma topilmadi. Yangidan buyurtma bering: /buyurtma");
  if (p.state === 'paid') return say(env, chat, `✅ #${p.id} buyurtma allaqachon to'langan. Rahmat!`);
  if (p.state !== 'pending') return say(env, chat, "Bu to'lov muddati o'tgan. Yangidan buyurtma bering: /buyurtma");
  if (p.chat && p.chat !== chat) return say(env, chat, "Bu to'lov boshqa foydalanuvchiga tegishli.");
  const r = await tg(env, 'sendInvoice', { chat_id: chat, ...gpParams(env, p, String(p.note || '').slice(0, 32) || "Impro IT: to'lov") });
  if (!r) return say(env, chat, `Kartaga o'tkazing: ${env.CARD_INFO ? '\n\n' + esc(env.CARD_INFO) + '\n' : ''}\nSumma: <b>${sum(p.uzs)} so'm</b>. Izohga <b>#${p.id}</b> yozing va chekni yuboring.`);
  return r;
}
async function orderCallback(env, st, q) {
  const chat = q.message && q.message.chat && q.message.chat.id, d = String(q.data || ''), ans = (t) => tg(env, 'answerCallbackQuery', { callback_query_id: q.id, ...(t ? { text: t } : {}) });
  if (!chat) return ans();
  const rec = () => st.get('c:' + chat).then((r) => r || { hist: [], name: who({ from: q.from }) });
  if (d === 'm:order') { await ans(); return flowStart(env, st, chat, await rec()); }
  if (d === 'm:pay') { await ans(); return startPay(env, st, chat, await rec()); }
  if (d === 'm:tar') { await ans(); await ev(st, { k: 'otar', c: chat, n: who({ from: q.from }), x: '' }); return say(env, chat, tariffsText(), { reply_markup: tariffsKb() }); }
  if (d === 'm:contact') { await ans(); const c = SITE.contacts || {}; return say(env, chat, `📞 <b>Aloqa</b>\n${c.phone ? 'Telefon: ' + esc(c.phone) + '\n' : ''}${c.telegram ? 'Telegram: ' + esc(c.telegram) + '\n' : ''}${c.address ? 'Manzil: ' + esc(c.address) + '\n' : ''}${c.hours ? 'Ish vaqti: ' + esc(c.hours) : ''}\n\nSavol uchun: @improsupport_bot`, { reply_markup: ORDER_MENU }); }
  const oc = /^o:(svc|dl|bd):(\d+)$/.exec(d); if (oc) { await ans(); return flowCallback(env, st, q, oc[1], oc[2]); }
  const ps = /^ps:([\w]+)$/.exec(d); if (ps) { await ans(); return resendInvoice(env, st, chat, ps[1]); }
  return ans();
}
const env0b = (env) => env.MAIN || env;
async function handleOrderUpdate(env0, upd) {
  ENV_REF = env0; const env = orderEnv(env0), st = store(env0);
  if (upd.pre_checkout_query) return gpPreCheckout(env, upd.pre_checkout_query);
  if (upd.message && upd.message.successful_payment) return gpPaid(env, upd.message);
  if (upd.callback_query) return orderCallback(env, st, upd.callback_query);
  const m = upd.message; if (!m || !m.chat || m.chat.type !== 'private') return;
  const chat = m.chat.id, text = (m.text || '').trim();
  if (await limited(st, 'ob' + chat, 25, 600)) return say(env, chat, "Juda ko'p xabar yuborildi. Birozdan so'ng yozing.");
  if (await st.get('ban:' + chat)) return;
  const sm = /^\/start(?:@\w+)?(?:\s+([\w-]{1,40}))?$/.exec(text);
  if (sm) {
    const pl = sm[1] || '', rec = (await st.get('c:' + chat)) || { hist: [], name: who(m) };
    const pmo = /^(?:svc(\d+)_|promo_)([A-Za-z0-9-]{3,20})$/.exec(pl); if (pmo) { const code = pmo[2].toUpperCase(), pr = await st.get('promo:' + code); if (pr && pr.pct) { rec.promo = code; await saveRec(st, chat, rec); } if (pmo[1] === undefined) { await orderWelcome(env, st, chat, m, ''); return say(env, chat, pr && pr.pct ? `🎁 Promo-kod <b>${esc(code)}</b> qabul qilindi: −${pr.pct}% chegirma!` : "Promo-kod topilmadi yoki muddati o'tgan."); } return handleOrderUpdate(env0b(env), { message: { ...m, text: '/start svc' + pmo[1] } }); }
    const svc = /^svc(\d+)$/.exec(pl); if (svc && calcServices()[Number(svc[1])]) { await orderWelcome(env, st, chat, m, pl); const r2 = (await st.get('c:' + chat)) || rec; r2.flow = { step: 'svc', d: {} }; await saveRec(st, chat, r2); return flowCallback(env, st, { message: { chat: { id: chat } }, from: m.from }, 'svc', svc[1]); }
    if (pl === 'order') { await orderWelcome(env, st, chat, m, pl); return flowStart(env, st, chat, (await st.get('c:' + chat)) || rec); }
    if (pl === 'tar') { await orderWelcome(env, st, chat, m, pl); return say(env, chat, tariffsText(), { reply_markup: tariffsKb() }); }
    const pm = /^pay_([\w]+)$/.exec(pl); if (pm) return resendInvoice(env, st, chat, pm[1]);
    return orderWelcome(env, st, chat, m, pl);
  }
  if (text === '/help' || text === '/menu') return say(env, chat, 'Menyu:', { reply_markup: ORDER_MENU });
  const rec = (await st.get('c:' + chat)) || { hist: [], name: who(m) };
  if (text === '/buyurtma' || text === '/anketa') return flowStart(env, st, chat, rec);
  if (text === '/tolov') return startPay(env, st, chat, rec);
  const pc = /^\/promo(?:@\w+)?\s+([A-Za-z0-9_-]{3,20})$/.exec(text); if (pc) { const code = pc[1].toUpperCase(), pr = await st.get('promo:' + code); if (!pr || !pr.pct) return say(env, chat, "Promo-kod topilmadi yoki muddati o'tgan."); rec.promo = code; await saveRec(st, chat, rec); return say(env, chat, `🎁 Promo-kod <b>${esc(code)}</b> qabul qilindi: −${pr.pct}% chegirma. Endi buyurtma bering:`, { reply_markup: ORDER_MENU }); }
  if (text === '/tariflar') { await ev(st, { k: 'otar', c: chat, n: who(m), x: '' }); return say(env, chat, tariffsText(), { reply_markup: tariffsKb() }); }
  if (text === '/cancel' && !rec.flow) return say(env, chat, 'Bekor qilinadigan narsa yo\'q.', { reply_markup: ORDER_MENU });
  if (rec.flow && m.text) return flowText(env, st, m, rec);
  return say(env, chat, "Buyurtma berish uchun tugmani bosing. Savollaringiz bo'lsa — yordam botiga yozing: @improsupport_bot", { reply_markup: ORDER_MENU });
}
