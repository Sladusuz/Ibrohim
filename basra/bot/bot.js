'use strict';
const path = require('path');
const { loadEnv, Store, esc, normPhone, fmtPhone, isWorkingNow, shuffle, csvCell } = require('./lib');
const { COURSES, TIMES, AUDIENCE, LETTERS } = require('./content');

loadEnv(path.join(__dirname, '.env'));

const CFG = {
  token: process.env.BOT_TOKEN || '',
  api: process.env.TG_API || 'https://api.telegram.org',
  webapp: (process.env.WEBAPP_URL || 'https://basraedu.netlify.app').replace(/\/$/, ''),
  phone: process.env.PHONE || '+998958331100',
  instagram: process.env.INSTAGRAM || 'https://www.instagram.com/basra_edu/',
  adminSecret: process.env.ADMIN_SECRET || '',
  envAdmins: (process.env.ADMIN_IDS || '').split(',').map((x) => parseInt(x, 10)).filter(Boolean),
  db: process.env.DB_FILE || path.join(__dirname, 'data', 'db.json')
};

const store = new Store(CFG.db);
const db = store.data;
const byId = (id) => COURSES.find((c) => c.id === id);
const timeName = (id) => (TIMES.find((t) => t.id === id) || {}).name || '—';
const audName = (id) => (AUDIENCE.find((a) => a.id === id) || {}).name || '—';

/* ====================== Telegram API ====================== */
async function api(method, params) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let res;
    try {
      res = await fetch(`${CFG.api}/bot${CFG.token}/${method}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params || {})
      });
    } catch (e) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    const j = await res.json().catch(() => ({}));
    if (j.ok) { return j.result; }
    if (j.error_code === 429) { await sleep(((j.parameters && j.parameters.retry_after) || 1) * 1000 + 100); continue; }
    const err = new Error(`${method}: ${j.description || res.status}`);
    err.code = j.error_code;
    throw err;
  }
  throw new Error(`${method}: tarmoq xatosi`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function send(chat, text, extra) {
  try {
    return await api('sendMessage', Object.assign({ chat_id: chat, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }, extra || {}));
  } catch (e) {
    if (e.code === 403) { const u = db.users[chat]; if (u) { u.blocked = true; store.save(); } }
    else { log('send xato:', e.message); }
    return null;
  }
}
async function edit(q, text, markup) {
  try {
    await api('editMessageText', { chat_id: q.message.chat.id, message_id: q.message.message_id, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_markup: markup || { inline_keyboard: [] } });
  } catch (e) { if (!/not modified/.test(e.message)) { log('edit xato:', e.message); } }
}
const answer = (q, text, alert) => api('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: !!alert }).catch(() => {});
function log() { console.log(new Date().toISOString(), ...arguments); }

/* ====================== Klaviaturalar ====================== */
const BTN = {
  reg: '📝 Darsga yozilish', courses: '📚 Kurslar', alpha: '🔤 Arab alifbosi', quiz: '🎯 Harf testi',
  contact: '📞 Aloqa', about: 'ℹ️ Markaz haqida', site: '🌐 Mini ilova'
};
const appUrl = (hash) => `${CFG.webapp}/?tg=1${hash ? '#' + hash : ''}`;

function mainMenu() {
  return {
    keyboard: [
      [{ text: BTN.reg, web_app: { url: appUrl('royxat') } }],
      [{ text: BTN.courses }, { text: BTN.alpha, web_app: { url: appUrl('alifbo') } }],
      [{ text: BTN.quiz }, { text: BTN.contact }],
      [{ text: BTN.about }, { text: BTN.site, web_app: { url: appUrl('') } }]
    ],
    resize_keyboard: true, is_persistent: true, input_field_placeholder: 'Menyudan tanlang…'
  };
}
const kbRows = (items, prefix, per) => {
  const rows = [];
  for (let i = 0; i < items.length; i += per) { rows.push(items.slice(i, i + per).map((x) => ({ text: x.label || x.name, callback_data: prefix + x.id }))); }
  return rows;
};
const cancelRow = [{ text: '✖️ Bekor qilish', callback_data: 'cancel' }];

/* ====================== Foydalanuvchi va sessiya ====================== */
function touch(from, chat) {
  const id = from.id;
  let u = db.users[id];
  if (!u) { u = db.users[id] = { id, joined: Date.now(), nudged: false }; }
  u.name = [from.first_name, from.last_name].filter(Boolean).join(' ');
  u.username = from.username || '';
  u.last = Date.now();
  u.blocked = false;
  u.chat = chat;
  store.save();
  return u;
}
const isAdmin = (id) => CFG.envAdmins.includes(id) || db.admins.includes(id);
const session = (id) => db.sessions[id];
const setSession = (id, s) => { if (s) { db.sessions[id] = s; } else { delete db.sessions[id]; } store.save(); };

/* ====================== Ro'yxatdan o'tish ====================== */
function leadCard(l) {
  const c = byId(l.course);
  return [
    `🆕 <b>Yangi ariza #${l.id}</b>`,
    `📚 Kurs: <b>${esc(c ? c.name : l.course)}</b>`,
    `👤 Kim uchun: ${esc(audName(l.audience))}`,
    `🙋 Ism: <b>${esc(l.name)}</b>${l.age ? ' (' + esc(l.age) + ')' : ''}`,
    `📞 Telefon: <b>${esc(fmtPhone(l.phone))}</b>`,
    `🕘 Qulay vaqt: ${esc(timeName(l.time))}`,
    l.username ? `✈️ Telegram: @${esc(l.username)}` : `✈️ Telegram ID: <code>${l.uid}</code>`,
    `📍 Manba: ${l.source === 'miniapp' ? 'mini ilova' : 'bot'}`,
    `📌 Holat: ${statusLabel(l.status)}`
  ].join('\n');
}
const statusLabel = (s) => ({ new: '🟡 yangi', done: '✅ bog’lanildi', spam: '🚫 spam' }[s] || s);
const leadButtons = (l) => ({ inline_keyboard: [
  [{ text: '✅ Bog’landim', callback_data: `L:${l.id}:done` }, { text: '🚫 Spam', callback_data: `L:${l.id}:spam` }],
  [{ text: '✈️ Telegramda yozish', url: `https://t.me/${l.username || ''}` }].filter(() => !!l.username)
].filter((r) => r.length) });

async function saveLead(from, data, source) {
  const dup = db.leads.find((l) => l.uid === from.id && l.phone === data.phone && l.course === data.course && Date.now() - l.at < 10 * 60 * 1000);
  if (dup) { return dup; }
  const l = {
    id: ++db.seq, at: Date.now(), uid: from.id, username: from.username || '', source,
    course: data.course, audience: data.audience || 'adult', name: data.name, age: data.age || '',
    phone: data.phone, time: data.time || 'any', status: 'new'
  };
  db.leads.push(l);
  store.save();
  const admins = Array.from(new Set(CFG.envAdmins.concat(db.admins)));
  for (const a of admins) { await send(a, leadCard(l), { reply_markup: leadButtons(l) }); }
  return l;
}
async function thankYou(chat, l) {
  const c = byId(l.course);
  const when = isWorkingNow()
    ? 'Tez orada administratorimiz sizga qo’ng’iroq qiladi.'
    : 'Hozir ish vaqtidan tashqari (9:00–20:00). Ertaga ish vaqti boshlanishi bilan sizga qo’ng’iroq qilamiz.';
  await send(chat, `✅ <b>Arizangiz qabul qilindi!</b>\n\n📚 ${esc(c ? c.name : '')}\n🙋 ${esc(l.name)}\n📞 ${esc(fmtPhone(l.phone))}\n\n${when}\n\nShu orada <b>Arab alifbosi</b> bilan tanishib chiqing 👇`, { reply_markup: mainMenu() });
}

function startRegistration(chat, uid, courseId) {
  const s = { step: courseId ? 'audience' : 'course', data: courseId ? { course: courseId } : {} };
  setSession(uid, s);
  return askStep(chat, uid);
}
async function askStep(chat, uid) {
  const s = session(uid);
  if (!s) { return; }
  switch (s.step) {
    case 'course':
      return send(chat, '📚 Qaysi kursga yozilmoqchisiz?', { reply_markup: { inline_keyboard: kbRows(COURSES.map((c) => ({ id: 'rc:' + c.id, label: `${c.emoji} ${c.name}` })), '', 1).concat([cancelRow]) } });
    case 'audience':
      return send(chat, '👤 Kurs kim uchun?', { reply_markup: { inline_keyboard: [AUDIENCE.map((a) => ({ text: a.name, callback_data: 'ra:' + a.id })), cancelRow] } });
    case 'name':
      return send(chat, s.data.audience === 'child' ? '🙋 Bolaning <b>ism-familiyasini</b> yozing:' : '🙋 <b>Ism-familiyangizni</b> yozing:', { reply_markup: { remove_keyboard: true } });
    case 'age':
      return send(chat, '🎂 Bolaning <b>yoshi</b> nechida? (masalan: 6)', { reply_markup: { inline_keyboard: [cancelRow] } });
    case 'phone':
      return send(chat, '📞 <b>Telefon raqamingizni</b> yuboring. Pastdagi tugmani bosing yoki raqamni yozing (masalan: 95 833 11-00).', { reply_markup: { keyboard: [[{ text: '📱 Raqamimni yuborish', request_contact: true }], [{ text: '✖️ Bekor qilish' }]], resize_keyboard: true, one_time_keyboard: true } });
    case 'time':
      return send(chat, '🕘 Qaysi vaqtda bog’lanishimiz qulay?', { reply_markup: { inline_keyboard: kbRows(TIMES, 'rt:', 2).concat([cancelRow]) } });
    case 'confirm': {
      const d = s.data;
      const c = byId(d.course);
      return send(chat, `Ma’lumotlarni tekshiring:\n\n📚 ${esc(c.name)}\n👤 ${esc(audName(d.audience))}\n🙋 ${esc(d.name)}${d.age ? ' (' + esc(d.age) + ' yosh)' : ''}\n📞 ${esc(fmtPhone(d.phone))}\n🕘 ${esc(timeName(d.time))}`, { reply_markup: { inline_keyboard: [[{ text: '✅ Yuborish', callback_data: 'rok' }, { text: '✖️ Bekor', callback_data: 'cancel' }]] } });
    }
  }
}
async function onRegText(m, s) {
  const chat = m.chat.id, uid = m.from.id;
  const text = (m.text || '').trim();
  if (text === '✖️ Bekor qilish') { return cancel(chat, uid); }
  if (s.step === 'name') {
    if (text.length < 2 || text.length > 60) { return send(chat, 'Iltimos, ismni to’g’ri yozing (2–60 belgi).'); }
    s.data.name = text; s.step = s.data.audience === 'child' ? 'age' : 'phone';
  } else if (s.step === 'age') {
    const a = parseInt(text, 10);
    if (!(a >= 2 && a <= 18)) { return send(chat, 'Yoshni raqam bilan yozing (2 dan 18 gacha).'); }
    s.data.age = String(a); s.step = 'phone';
  } else if (s.step === 'phone') {
    const p = m.contact ? (normPhone(m.contact.phone_number) || '+' + String(m.contact.phone_number).replace(/\D/g, '')) : normPhone(text);
    if (!p) { return send(chat, 'Raqam noto’g’ri. Masalan: <code>95 833 11-00</code> yoki <code>+998958331100</code>'); }
    s.data.phone = p; s.step = 'time';
    await send(chat, '👍', { reply_markup: { remove_keyboard: true } });
  } else { return send(chat, 'Yuqoridagi tugmalardan birini tanlang 👆'); }
  setSession(uid, s);
  return askStep(chat, uid);
}
async function cancel(chat, uid) {
  setSession(uid, null);
  return send(chat, 'Bekor qilindi. Asosiy menyu 👇', { reply_markup: mainMenu() });
}

/* ====================== Bo'limlar ====================== */
async function sendWelcome(chat, name, payload) {
  const hi = `Assalomu alaykum${name ? ', <b>' + esc(name) + '</b>' : ''}! 👋\n\n<b>Basra Ta’lim Markazi</b> botiga xush kelibsiz.\n\n🕌 Arab tili\n🇬🇧 Ingliz tili\n🧒 Bolalar uchun Arab Kids va English Kids\n🎒 Maktabga tayyorlov\n\n⏰ Ish vaqti: <b>9:00 – 20:00</b>\n\nPastdagi menyudan kerakli bo’limni tanlang yoki darsga hoziroq yoziling 👇`;
  await send(chat, hi, { reply_markup: mainMenu() });
  if (payload === 'royxat') { return startRegistration(chat, chat); }
}
function coursesList() {
  return { inline_keyboard: COURSES.map((c) => [{ text: `${c.emoji} ${c.name} · ${c.who}`, callback_data: 'c:' + c.id }]) };
}
const aboutText = () => `<b>Basra Ta’lim Markazi</b>\n\nBiz arab va ingliz tilini bolalar va kattalar uchun o’rgatamiz. Maktabga tayyorlov kurslari bolalarni maktab hayotiga oldindan tayyorlaydi.\n\n✔️ Ikki til — bir markazda\n✔️ Harfdan suhbatgacha olib boradigan ustozlar\n✔️ Bolalar va kattalar uchun alohida dastur\n✔️ Qulay ish vaqti: 9:00 – 20:00\n\n📸 Instagram: @basra_edu`;
const contactText = () => `📞 <b>Aloqa</b>\n\nTelefon: <b>${esc(fmtPhone(CFG.phone.replace(/\s/g, '')))}</b>\nIsh vaqti: <b>9:00 – 20:00</b>\nInstagram: @basra_edu`;
const contactMarkup = () => ({ inline_keyboard: [[{ text: '📝 Darsga yozilish', callback_data: 'reg' }], [{ text: '📸 Instagram', url: CFG.instagram }, { text: '🌐 Sayt', url: CFG.webapp }]] });

/* ====================== Harf testi ====================== */
function quizQuestion(round) {
  const correct = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const wrong = shuffle(LETTERS.filter((l) => l.g !== correct.g)).slice(0, 3);
  const opts = shuffle([correct].concat(wrong));
  return { correct: correct.g, opts };
}
async function quizAsk(chat, uid, s) {
  const q = quizQuestion(s.round);
  s.q = q.correct;
  setSession(uid, s);
  return send(chat, `🎯 <b>Savol ${s.round}/5</b>\n\nBu harf qaysi?\n\n<b>${q.correct}</b>`, {
    reply_markup: { inline_keyboard: [q.opts.map((o) => ({ text: o.n, callback_data: `q:${o.g}` }))] }
  });
}
async function quizStart(chat, uid) {
  return quizAsk(chat, uid, { step: 'quiz', round: 1, score: 0 });
}
async function onQuiz(q, g) {
  const chat = q.message.chat.id, uid = q.from.id;
  const s = session(uid);
  if (!s || s.step !== 'quiz') { return answer(q, 'Test tugagan. Qayta boshlang.'); }
  const ok = g === s.q;
  const L = LETTERS.find((l) => l.g === s.q);
  if (ok) { s.score++; }
  await answer(q, ok ? '✅ To’g’ri!' : `❌ To’g’ri javob: ${L.n}`);
  await edit(q, `${ok ? '✅' : '❌'} <b>${L.g}</b> — ${esc(L.n)} (${esc(L.m)})`);
  if (s.round >= 5) {
    setSession(uid, null);
    const msg = s.score >= 4 ? 'Ajoyib natija! 🏆' : s.score >= 2 ? 'Yaxshi boshlanish! 👏' : 'Hammasi oldinda, birga o’rganamiz! 💪';
    return send(chat, `🏁 <b>Natija: ${s.score}/5</b>\n${msg}\n\nArab tilini noldan, ustoz bilan o’rganmoqchimisiz?`, { reply_markup: { inline_keyboard: [[{ text: '📝 Darsga yozilish', callback_data: 'reg' }], [{ text: '🔁 Yana urinish', callback_data: 'quiz' }]] } });
  }
  s.round++;
  return quizAsk(chat, uid, s);
}

/* ====================== Admin ====================== */
function stats() {
  const day = Date.now() - 86400000, week = Date.now() - 7 * 86400000;
  const users = Object.values(db.users);
  const by = {};
  db.leads.forEach((l) => { by[l.course] = (by[l.course] || 0) + 1; });
  return `📊 <b>Statistika</b>\n\n👥 Foydalanuvchilar: <b>${users.length}</b> (bugun +${users.filter((u) => u.joined > day).length}, hafta +${users.filter((u) => u.joined > week).length})\n📝 Arizalar: <b>${db.leads.length}</b> (bugun ${db.leads.filter((l) => l.at > day).length}, hafta ${db.leads.filter((l) => l.at > week).length})\n🟡 Yangi: ${db.leads.filter((l) => l.status === 'new').length}\n\n` + COURSES.map((c) => `${c.emoji} ${c.name}: ${by[c.id] || 0}`).join('\n');
}
async function onAdminCommand(m, cmd, arg) {
  const chat = m.chat.id;
  if (cmd === '/stats') { return send(chat, stats()); }
  if (cmd === '/leads') {
    const list = db.leads.filter((l) => l.status === 'new').slice(-10);
    if (!list.length) { return send(chat, 'Yangi arizalar yo’q 🎉'); }
    for (const l of list) { await send(chat, leadCard(l), { reply_markup: leadButtons(l) }); }
    return;
  }
  if (cmd === '/export') {
    const head = ['id', 'sana', 'kurs', 'kim_uchun', 'ism', 'yosh', 'telefon', 'vaqt', 'username', 'manba', 'holat'];
    const rows = db.leads.map((l) => [l.id, new Date(l.at + 5 * 3600000).toISOString().replace('T', ' ').slice(0, 16), (byId(l.course) || {}).name, audName(l.audience), l.name, l.age, l.phone, timeName(l.time), l.username, l.source, l.status].map(csvCell).join(','));
    const csv = '﻿' + head.join(',') + '\n' + rows.join('\n');
    const fd = new FormData();
    fd.append('chat_id', String(chat));
    fd.append('document', new Blob([csv], { type: 'text/csv' }), 'arizalar.csv');
    const r = await fetch(`${CFG.api}/bot${CFG.token}/sendDocument`, { method: 'POST', body: fd }).catch(() => null);
    return r && r.ok ? null : send(chat, 'Faylni yuborib bo’lmadi.');
  }
  if (cmd === '/broadcast') {
    if (!arg) { return send(chat, 'Foydalanish: <code>/broadcast Xabar matni</code>\nHTML belgilar (&lt;b&gt;) ishlaydi.'); }
    setSession(m.from.id, { step: 'bc', text: arg });
    const n = Object.values(db.users).filter((u) => !u.blocked).length;
    return send(chat, `📣 Xabar <b>${n}</b> ta foydalanuvchiga yuboriladi:\n\n${arg}`, { reply_markup: { inline_keyboard: [[{ text: '✅ Yuborish', callback_data: 'bc:go' }, { text: '✖️ Bekor', callback_data: 'cancel' }]] } });
  }
  return send(chat, '🛠 <b>Admin buyruqlari</b>\n\n/stats — statistika\n/leads — yangi arizalar\n/export — arizalar CSV\n/broadcast matn — hammaga xabar');
}
async function runBroadcast(chat, text) {
  const users = Object.values(db.users).filter((u) => !u.blocked);
  let ok = 0;
  for (const u of users) { if (await send(u.id, text)) { ok++; } await sleep(50); }
  return send(chat, `📣 Yuborildi: ${ok}/${users.length}`);
}

/* ====================== Yangilanishlarni qayta ishlash ====================== */
async function onMessage(m) {
  if (m.chat.type !== 'private') { return; }
  const chat = m.chat.id, uid = m.from.id;
  const u = touch(m.from, chat);

  if (m.web_app_data) {
    let d;
    try { d = JSON.parse(m.web_app_data.data); } catch (e) { return send(chat, 'Ma’lumotni o’qib bo’lmadi. Iltimos, qayta urinib ko’ring.'); }
    const phone = normPhone(d.phone), name = String(d.name || '').trim().slice(0, 60);
    if (!byId(d.course) || !phone || name.length < 2) { return send(chat, 'Ma’lumotlar to’liq emas. Iltimos, formani qayta to’ldiring.', { reply_markup: mainMenu() }); }
    const l = await saveLead(m.from, { course: d.course, audience: d.audience === 'child' ? 'child' : 'adult', name, age: String(d.age || '').slice(0, 3), phone, time: TIMES.find((t) => t.id === d.time) ? d.time : 'any' }, 'miniapp');
    return thankYou(chat, l);
  }

  const text = (m.text || '').trim();
  const s = session(uid);

  if (text.startsWith('/')) {
    const [raw, ...rest] = text.split(/\s+/);
    const cmd = raw.split('@')[0].toLowerCase();
    const arg = text.slice(raw.length).trim();
    if (cmd === '/start') { setSession(uid, null); return sendWelcome(chat, m.from.first_name, arg); }
    if (cmd === '/menu' || cmd === '/help') { setSession(uid, null); return send(chat, 'Asosiy menyu 👇', { reply_markup: mainMenu() }); }
    if (cmd === '/cancel') { return cancel(chat, uid); }
    if (cmd === '/register') { return startRegistration(chat, uid); }
    if (cmd === '/courses') { return send(chat, '📚 <b>Kurslarimiz</b>', { reply_markup: coursesList() }); }
    if (cmd === '/quiz') { return quizStart(chat, uid); }
    if (cmd === '/contact') { return send(chat, contactText(), { reply_markup: contactMarkup() }); }
    if (cmd === '/admin') {
      if (CFG.adminSecret && arg === CFG.adminSecret && !isAdmin(uid)) { db.admins.push(uid); store.save(); return send(chat, '✅ Siz admin bo’ldingiz. Arizalar shu yerga keladi.\n\n/stats /leads /export /broadcast'); }
      if (!isAdmin(uid)) { return send(chat, 'Bu buyruq faqat adminlar uchun.'); }
      return onAdminCommand(m, '/admin', '');
    }
    if (['/stats', '/leads', '/export', '/broadcast'].includes(cmd)) {
      if (!isAdmin(uid)) { return send(chat, 'Bu buyruq faqat adminlar uchun.'); }
      return onAdminCommand(m, cmd, arg);
    }
    return send(chat, 'Noma’lum buyruq. /menu');
  }

  if (s && s.step && ['name', 'age', 'phone'].includes(s.step)) { return onRegText(m, s); }
  if (m.contact && s && s.step === 'phone') { return onRegText(m, s); }
  if (text === '✖️ Bekor qilish') { return cancel(chat, uid); }

  if (text === BTN.courses) { return send(chat, '📚 <b>Kurslarimiz</b>\nBirini tanlang:', { reply_markup: coursesList() }); }
  if (text === BTN.quiz) { return quizStart(chat, uid); }
  if (text === BTN.contact) { return send(chat, contactText(), { reply_markup: contactMarkup() }); }
  if (text === BTN.about) { return send(chat, aboutText(), { reply_markup: { inline_keyboard: [[{ text: '📚 Kurslar', callback_data: 'courses' }, { text: '📝 Yozilish', callback_data: 'reg' }]] } }); }

  // Erkin matn: savolni administratorga uzatamiz
  if (text) {
    const admins = Array.from(new Set(CFG.envAdmins.concat(db.admins)));
    for (const a of admins) { await send(a, `💬 <b>Savol</b> — ${esc(u.name)}${u.username ? ' (@' + esc(u.username) + ')' : ''} <code>${uid}</code>\n\n${esc(text)}`); }
    return send(chat, isWorkingNow() ? 'Savolingiz administratorga yuborildi. Tez orada javob beramiz 🙌\nShoshilinch bo’lsa: ' + esc(fmtPhone(CFG.phone)) : 'Savolingiz qabul qilindi. Ish vaqti (9:00–20:00) boshlanishi bilan javob beramiz 🙌', { reply_markup: mainMenu() });
  }
}

async function onCallback(q) {
  const chat = q.message.chat.id, uid = q.from.id;
  touch(q.from, chat);
  const d = q.data || '';
  if (d === 'cancel') { setSession(uid, null); await answer(q); await edit(q, 'Bekor qilindi.'); return send(chat, 'Asosiy menyu 👇', { reply_markup: mainMenu() }); }
  if (d === 'reg') { await answer(q); return startRegistration(chat, uid); }
  if (d === 'quiz') { await answer(q); return quizStart(chat, uid); }
  if (d === 'courses') { await answer(q); return send(chat, '📚 <b>Kurslarimiz</b>', { reply_markup: coursesList() }); }
  if (d.startsWith('c:')) {
    const c = byId(d.slice(2));
    if (!c) { return answer(q); }
    await answer(q);
    return edit(q, `${c.emoji} <b>${esc(c.name)}</b>\n👥 ${esc(c.who)} uchun\n\n${esc(c.text)}\n\n⏰ Ish vaqti: 9:00 – 20:00`, { inline_keyboard: [[{ text: '📝 Shu kursga yozilish', callback_data: 'rc:' + c.id }], [{ text: '⬅️ Barcha kurslar', callback_data: 'courses2' }]] });
  }
  if (d === 'courses2') { await answer(q); return edit(q, '📚 <b>Kurslarimiz</b>', coursesList()); }
  if (d.startsWith('rc:')) {
    if (!byId(d.slice(3))) { return answer(q); }
    await answer(q);
    await edit(q, `📚 Tanlandi: <b>${esc(byId(d.slice(3)).name)}</b>`);
    return startRegistration(chat, uid, d.slice(3));
  }
  if (d.startsWith('q:')) { return onQuiz(q, d.slice(2)); }
  const s = session(uid);
  if (d.startsWith('ra:') && s && s.step === 'audience') {
    s.data.audience = d.slice(3); s.step = 'name'; setSession(uid, s);
    await answer(q); await edit(q, `👤 ${esc(audName(s.data.audience))}`);
    return askStep(chat, uid);
  }
  if (d.startsWith('rt:') && s && s.step === 'time') {
    s.data.time = d.slice(3); s.step = 'confirm'; setSession(uid, s);
    await answer(q); await edit(q, `🕘 ${esc(timeName(s.data.time))}`);
    return askStep(chat, uid);
  }
  if (d === 'rok' && s && s.step === 'confirm') {
    setSession(uid, null);
    await answer(q); await edit(q, '📨 Yuborilmoqda…');
    const l = await saveLead(q.from, s.data, 'bot');
    return thankYou(chat, l);
  }
  if (d.startsWith('L:') && isAdmin(uid)) {
    const [, id, st] = d.split(':');
    const l = db.leads.find((x) => x.id === +id);
    if (!l) { return answer(q, 'Topilmadi'); }
    l.status = st; store.save();
    await answer(q, statusLabel(st));
    return edit(q, leadCard(l), leadButtons(l));
  }
  if (d === 'bc:go' && isAdmin(uid) && s && s.step === 'bc') {
    setSession(uid, null);
    await answer(q); await edit(q, '📣 Yuborilmoqda…');
    return runBroadcast(chat, s.text);
  }
  return answer(q);
}

async function handle(u) {
  try {
    if (u.message) { await onMessage(u.message); }
    else if (u.callback_query) { await onCallback(u.callback_query); }
  } catch (e) { log('handler xato:', e.stack || e.message); }
}

/* ====================== Eslatma: ariza qoldirmaganlarga 1 marta ====================== */
async function nudge() {
  const now = Date.now();
  const leadUids = new Set(db.leads.map((l) => l.uid));
  for (const u of Object.values(db.users)) {
    if (u.nudged || u.blocked || leadUids.has(u.id) || isAdmin(u.id)) { continue; }
    if (now - u.joined < 24 * 3600000 || now - u.joined > 5 * 24 * 3600000) { continue; }
    u.nudged = true; store.save();
    await send(u.chat, '👋 Assalomu alaykum! Basra Ta’lim Markazida hali darsga yozilmadingizmi?\nBir daqiqada ariza qoldiring — administrator sizga qo’ng’iroq qiladi.', { reply_markup: { inline_keyboard: [[{ text: '📝 Darsga yozilish', callback_data: 'reg' }]] } });
    await sleep(100);
  }
}

/* ====================== Sozlash va ishga tushirish ====================== */
async function setup() {
  const me = await api('getMe');
  log('Bot:', '@' + me.username);
  await api('deleteWebhook', { drop_pending_updates: false }).catch(() => {});
  await api('setMyCommands', { commands: [
    { command: 'start', description: 'Botni boshlash' },
    { command: 'menu', description: 'Asosiy menyu' },
    { command: 'register', description: 'Darsga yozilish' },
    { command: 'courses', description: 'Kurslar' },
    { command: 'quiz', description: 'Arab harflari testi' },
    { command: 'contact', description: 'Aloqa' },
    { command: 'cancel', description: 'Bekor qilish' }
  ] }).catch((e) => log(e.message));
  await api('setMyShortDescription', { short_description: 'Basra Ta’lim Markazi: arab va ingliz tili, maktabga tayyorlov. 9:00–20:00' }).catch(() => {});
  await api('setMyDescription', { description: 'Basra Ta’lim Markazi rasmiy boti.\n\n🕌 Arab tili · 🇬🇧 Ingliz tili · 🧒 Bolalar kurslari · 🎒 Maktabga tayyorlov\n\nKurslar bilan tanishing, arab alifbosini o’rganing va bir daqiqada darsga yoziling.' }).catch(() => {});
  await api('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Basra', web_app: { url: appUrl('') } } }).catch((e) => log('menu button:', e.message));
}

let running = true;
async function main() {
  if (!CFG.token) { console.error('BOT_TOKEN topilmadi. .env faylga yozing (.env.example ga qarang).'); process.exit(1); }
  await setup();
  setInterval(() => nudge().catch((e) => log(e.message)), 3600 * 1000);
  const stop = () => { running = false; store.flush(); process.exit(0); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
  let offset = 0;
  while (running) {
    try {
      const ups = await api('getUpdates', { offset, timeout: 30, allowed_updates: ['message', 'callback_query'] });
      for (const u of ups) { offset = u.update_id + 1; await handle(u); }
    } catch (e) { log('polling xato:', e.message); await sleep(3000); }
  }
}
if (require.main === module) { main(); }
module.exports = { handle, db, CFG, api };
