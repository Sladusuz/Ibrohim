const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { PORT = 3000, TELEGRAM_BOT_TOKEN, BIND_CODE, ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET } = process.env;
for (const k of ['TELEGRAM_BOT_TOKEN', 'BIND_CODE', 'ADMIN_USER', 'ADMIN_PASSWORD', 'SESSION_SECRET']) {
  if (!process.env[k]) { console.error(`.env da ${k} yo'q`); process.exit(1); }
}

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const STATUSES = ['new', 'progress', 'done'];

// ---------- storage ----------
let db = { requests: [], chats: [], nextId: 1 };
try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) }; } catch {}
function save() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 2));
  fs.renameSync(DB_FILE + '.tmp', DB_FILE);
}

// ---------- telegram ----------
const tg = async (method, body) => {
  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.description);
  return j.result;
};
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

async function notify(r) {
  const text =
    `🆕 <b>Yangi zayavka #${r.id}</b>\n\n` +
    `👤 <b>Ism:</b> ${esc(r.name)}\n` +
    `📞 <b>Telefon:</b> ${esc(r.phone)}\n` +
    (r.tgUser ? `✈️ <b>Telegram:</b> ${esc(r.tgUser)}\n` : '') +
    `📍 <b>Manba:</b> ${r.source === 'bot' ? 'Telegram bot' : 'Sayt'}\n` +
    (r.message ? `💬 <b>Xabar:</b> ${esc(r.message)}\n` : '') +
    `\n🕒 ${new Date(r.createdAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Samarkand' })}`;
  const results = await Promise.allSettled(
    db.chats.map((chat_id) => tg('sendMessage', { chat_id, text, parse_mode: 'HTML' }))
  );
  const ok = results.some((x) => x.status === 'fulfilled');
  results.filter((x) => x.status === 'rejected').forEach((x) => console.error('Telegram:', x.reason.message));
  return ok;
}

// ---------- bot dialog ----------
const PHONE = '+998 93 330 35 75';
const BOT_LINE = '━━━━━━━━━━━━━━━━';
const bar = (n, total) => '▰'.repeat(n) + '▱'.repeat(total - n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const KB = { keyboard: [
  [{ text: '📝 Zayavka' }, { text: '🚰 Mahsulot' }],
  [{ text: '💧 Suv testi' }, { text: '💳 To\'lov' }],
  [{ text: '📞 Aloqa' }, { text: '❓ Savollar' }],
], resize_keyboard: true, is_persistent: true, input_field_placeholder: 'Menyudan tanlang 👇' };
const MAIN = { inline_keyboard: [
  [{ text: '📝 Zayavka qoldirish', callback_data: 'apply' }],
  [{ text: '🚰 Mahsulot', callback_data: 'info:0' }, { text: '💧 Suv testi', callback_data: 'quiz' }],
  [{ text: '💳 0% to\'lov', callback_data: 'pay' }, { text: '📞 Aloqa', callback_data: 'contact' }],
] };
const APPLY_BTN = [{ text: '📝 Zayavka qoldirish', callback_data: 'apply' }];

const WELCOME =
  '💧 <b>SUV FILTER SAMARQAND</b>\n' + BOT_LINE + '\n' +
  '✨ <b>Aura Cebilon Pro</b>\n<i>Suvni tozalashning yangi standarti</i>\n\n' +
  '🇩🇪 Original Germaniya texnologiyasi\n' +
  '💳 <b>0% — foizsiz muddatli to\'lov</b>\n' +
  '🎬 Demo xizmati\n' +
  '🚚 Samarqand · Toshkent · Qarshi\n' + BOT_LINE + '\n' +
  'Toza suv — butun oila salomatligi 💙\nQuyidan tanlang 👇';

const PAGES = [
  '🚰 <b>Aura Cebilon Pro</b>  <code>1/4</code>\n' + BOT_LINE + '\n' +
  'Zamonaviy suv tozalash apparati.\n\n' +
  '🌀 Ko\'p bosqichli tozalash tizimi\n🏠 Ixcham dizayn — oshxonaga mos\n⚙️ Oson o\'rnatish va qulay foydalanish',
  '🧪 <b>Tozalash sifati</b>  <code>2/4</code>\n' + BOT_LINE + '\n' +
  '✅ Begona hid\n✅ Tuz aralashmalari\n✅ Zang va sariq tus\n\n' +
  '😋 Natija: ichimlikdan shirin, mazali suv.\n👶 Bolalar uchun xavfsiz.',
  '🇩🇪 <b>Texnologiya</b>  <code>3/4</code>\n' + BOT_LINE + '\n' +
  'Original Germaniya texnologiyasi.\n\n' +
  '🔧 Original ehtiyot qismlar\n🛠 Xizmat ko\'rsatish\n🎬 Demo: apparat ishlashini o\'zingiz ko\'rasiz',
  '💳 <b>Shartlar</b>  <code>4/4</code>\n' + BOT_LINE + '\n' +
  '💰 <b>0%</b> — foizsiz muddatli to\'lov\n🚚 Yetkazib berish: Samarqand, Toshkent, Qarshi\n\n' +
  `Aniq narx va shartlar uchun: <b>${PHONE}</b>`,
];
const pageKb = (i) => ({ inline_keyboard: [
  [{ text: '◀️', callback_data: `info:${(i + 3) % 4}` }, { text: `${i + 1} / 4`, callback_data: 'noop' }, { text: '▶️', callback_data: `info:${(i + 1) % 4}` }],
  APPLY_BTN, [{ text: '🏠 Menyu', callback_data: 'menu' }],
] });

const PAY =
  '💳 <b>FOIZSIZ MUDDATLI TO\'LOV</b>\n' + BOT_LINE + '\n' +
  '💰 Ustama foiz: <b>0%</b>\n' +
  '🚚 Yetkazib berish: Samarqand · Toshkent · Qarshi\n' +
  '🎬 Avval demo — keyin qaror\n\n' +
  `Aniq shartlar va narxni operator aytadi:\n📞 <b>${PHONE}</b>`;

const CONTACT =
  '📞 <b>ALOQA</b>\n' + BOT_LINE + '\n' +
  `☎️ <b>${PHONE}</b>\n📍 Samarqand · Toshkent · Qarshi\n\n` +
  '📸 instagram.com/suv_filtir_samarqand\n✈️ t.me/auracebilonsamarqandpro';

const FAQ = [
  ['💳 To\'lov qanday?', 'Foizsiz muddatli to\'lov mavjud. Aniq shartlarni operator tushuntiradi.'],
  ['🚚 Qayerga yetkazasiz?', 'Samarqand, Toshkent va Qarshi bo\'ylab.'],
  ['🎬 Sinab ko\'rsa bo\'ladimi?', 'Ha, demo xizmatimiz bor — apparat ishlashini o\'zingiz ko\'rasiz.'],
  ['⚙️ O\'rnatish qiyinmi?', 'Aura Cebilon oson o\'rnatiladi va foydalanish qulay.'],
  ['💰 Narxi qancha?', `Aniq narx uchun ${PHONE} raqamiga qo'ng'iroq qiling yoki zayavka qoldiring.`],
];
const faqKb = { inline_keyboard: [...FAQ.map(([q], i) => [{ text: q, callback_data: `faq:${i}` }]), [{ text: '🏠 Menyu', callback_data: 'menu' }]] };

const PROBLEMS = ['🤢 Noxush hid', '🧂 Tuzli suv', '🟠 Zang / sariq tus', '🌫 Loyqa', '🫖 Idishda oq qatlam', '😕 Mazasi yoqmaydi'];
const quizKb = (set) => ({ inline_keyboard: [
  ...PROBLEMS.map((p, i) => [{ text: (set.has(i) ? '✅ ' : '⬜ ') + p, callback_data: `qz:${i}` }]),
  [{ text: '🔍 Natijani ko\'rish', callback_data: 'qzdone' }],
] });
const QUIZ_HEAD = '💧 <b>SUV TESTI</b>\n' + BOT_LINE + '\nSuvingizda qanday muammo bor? Hammasini belgilang 👇';

const sessions = new Map(); // chat_id -> { step, name, phone, message, problems }
const quiz = new Map();     // chat_id -> Set
const send = (chat_id, text, extra = {}) => tg('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const typing = (chat_id) => tg('sendChatAction', { chat_id, action: 'typing' }).catch(() => {});
// edit text messages in place; photo messages (welcome card) get a fresh message instead
const show = async (q, text, reply_markup) => {
  const m = q.message;
  if (m.photo) return send(m.chat.id, text, { reply_markup });
  try { await tg('editMessageText', { chat_id: m.chat.id, message_id: m.message_id, text, parse_mode: 'HTML', reply_markup }); }
  catch (e) { if (!/not modified/i.test(e.message)) await send(m.chat.id, text, { reply_markup }); }
};

async function sendWelcome(chat_id) {
  await typing(chat_id);
  const pro = path.join(__dirname, 'public', 'product-pro.png');
  const hasPro = fs.existsSync(pro);
  const file = hasPro ? pro : path.join(__dirname, 'public', 'product.jpg');
  const form = new FormData();
  form.append('chat_id', String(chat_id));
  form.append('caption', WELCOME);
  form.append('parse_mode', 'HTML');
  form.append('reply_markup', JSON.stringify(MAIN));
  form.append('photo', new Blob([fs.readFileSync(file)], { type: hasPro ? 'image/png' : 'image/jpeg' }), hasPro ? 'p.png' : 'p.jpg');
  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: 'POST', body: form });
  if (!(await r.json()).ok) await send(chat_id, WELCOME, { reply_markup: MAIN });
  await send(chat_id, 'Pastdagi menyu har doim yoningizda 👇', { reply_markup: KB });
}

const stepCard = (n, title, body) => `📝 <b>ZAYAVKA</b>  ${bar(n, 3)} <code>${n}/3</code>\n${BOT_LINE}\n<b>${title}</b>\n${body}\n\n<i>Bekor qilish: /cancel</i>`;

async function startApply(chat_id, prefill = '') {
  sessions.set(chat_id, { step: 'name', message: prefill });
  await send(chat_id, stepCard(1, '👤 Ismingiz?', 'Ismingizni yozing.'), { reply_markup: { remove_keyboard: true } });
}

const summary = (s) =>
  `🧾 <b>ZAYAVKANI TEKSHIRING</b>\n${BOT_LINE}\n👤 <b>${esc(s.name)}</b>\n📞 <b>${esc(s.phone)}</b>\n` +
  (s.message ? `💬 ${esc(s.message)}\n` : '') + `${BOT_LINE}\nHammasi to'g'rimi?`;
const confirmKb = { inline_keyboard: [[{ text: '✅ Yuborish', callback_data: 'confirm' }, { text: '✏️ Qaytadan', callback_data: 'apply' }], [{ text: '✖️ Bekor qilish', callback_data: 'cancel' }]] };

async function finish(chat_id, from) {
  const s = sessions.get(chat_id); if (!s) return;
  sessions.delete(chat_id);
  const wait = await send(chat_id, '⏳ Zayavka yuborilmoqda...\n▱▱▱▱▱');
  const r = { id: db.nextId++, name: s.name, phone: s.phone, message: s.message || '', status: 'new', createdAt: new Date().toISOString(), sent: false, source: 'bot', tgUser: from.username ? '@' + from.username : '' };
  db.requests.push(r); save();
  for (const n of [2, 4]) { await sleep(350); await tg('editMessageText', { chat_id, message_id: wait.message_id, text: `⏳ Zayavka yuborilmoqda...\n${bar(n, 5)}` }).catch(() => {}); }
  r.sent = await notify(r).catch(() => false); save();
  await tg('editMessageText', { chat_id, message_id: wait.message_id, parse_mode: 'HTML',
    text: `🎉 <b>Zayavka #${r.id} qabul qilindi!</b>\n▰▰▰▰▰\n\nRahmat, <b>${esc(s.name)}</b>! Tez orada <b>${esc(s.phone)}</b> raqamiga qo'ng'iroq qilamiz.\n\n💧 Toza suv — sog'lom oila!` }).catch(() => {});
  await send(chat_id, 'Yana nimadir kerakmi? 👇', { reply_markup: KB });
}

const MENU_TEXT = { '📝 Zayavka': 'apply', '🚰 Mahsulot': 'info', '💧 Suv testi': 'quiz', '💳 To\'lov': 'pay', '📞 Aloqa': 'contact', '❓ Savollar': 'faq' };

async function route(chat_id, action, q) {
  const reply = q ? (t, kb) => show(q, t, kb) : (t, kb) => send(chat_id, t, { reply_markup: kb });
  switch (action) {
    case 'apply': return startApply(chat_id);
    case 'info': return reply(PAGES[0], pageKb(0));
    case 'pay': return reply(PAY, { inline_keyboard: [APPLY_BTN, [{ text: '🏠 Menyu', callback_data: 'menu' }]] });
    case 'contact': return reply(CONTACT, { inline_keyboard: [[{ text: '✈️ Telegram kanal', url: 'https://t.me/auracebilonsamarqandpro' }], APPLY_BTN] });
    case 'faq': return reply('❓ <b>KO\'P SO\'RALADIGAN SAVOLLAR</b>\n' + BOT_LINE + '\nSavolni tanlang 👇', faqKb);
    case 'quiz': quiz.set(chat_id, new Set()); return reply(QUIZ_HEAD, quizKb(new Set()));
    case 'menu': return q ? show(q, '🏠 <b>ASOSIY MENYU</b>\nNima qilamiz? 👇', MAIN) : sendWelcome(chat_id);
  }
}

async function onMessage(m) {
  const chat_id = m.chat.id, text = (m.text || '').trim();
  const [cmd, arg] = text.split(/\s+/);

  if (cmd === '/start' && arg === BIND_CODE) {
    if (!db.chats.includes(chat_id)) { db.chats.push(chat_id); save(); }
    return send(chat_id, '✅ <b>Ulandi!</b>\nEndi sayt va botdan kelgan zayavkalar shu yerga keladi.\n\n/stop — o\'chirish');
  }
  if (cmd === '/stop' && db.chats.includes(chat_id)) {
    db.chats = db.chats.filter((c) => c !== chat_id); save();
    return send(chat_id, 'O\'chirildi.');
  }
  if (cmd === '/start') { sessions.delete(chat_id); return sendWelcome(chat_id); }
  if (cmd === '/menu') { sessions.delete(chat_id); return route(chat_id, 'menu'); }
  if (cmd === '/cancel') { sessions.delete(chat_id); return send(chat_id, '✖️ Bekor qilindi.', { reply_markup: KB }); }
  if (MENU_TEXT[text]) { sessions.delete(chat_id); await typing(chat_id); return route(chat_id, MENU_TEXT[text]); }

  const s = sessions.get(chat_id);
  if (!s) return send(chat_id, 'Menyudan tanlang 👇', { reply_markup: MAIN });

  if (s.step === 'name') {
    if (text.length < 2) return send(chat_id, 'Iltimos, ismingizni yozing 🙂');
    s.name = text.slice(0, 100); s.step = 'phone';
    return send(chat_id, stepCard(2, `📞 Telefon raqamingiz, ${esc(s.name)}?`, 'Tugmani bosing yoki yozing: <code>+998 90 123 45 67</code>'), {
      reply_markup: { keyboard: [[{ text: '📱 Raqamimni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
    });
  }
  if (s.step === 'phone') {
    const phone = (m.contact?.phone_number || text).trim();
    if (phone.replace(/\D/g, '').length < 9) return send(chat_id, '🤔 Raqam to\'g\'ri emas. Qaytadan yozing: <code>+998 90 123 45 67</code>');
    s.phone = (phone.startsWith('+') || !/^998/.test(phone) ? phone : '+' + phone).slice(0, 30);
    s.step = 'message';
    return send(chat_id, stepCard(3, '💬 Qo\'shimcha xabar', 'Masalan: qaysi shahar, qulay vaqt. Yozing yoki o\'tkazib yuboring.'), {
      reply_markup: { inline_keyboard: [[{ text: '⏭ O\'tkazib yuborish', callback_data: 'skip' }]] },
    });
  }
  if (s.step === 'message') {
    s.message = [s.message, text].filter(Boolean).join(' | ').slice(0, 1000); s.step = 'confirm';
    return send(chat_id, summary(s), { reply_markup: confirmKb });
  }
  if (s.step === 'confirm') return send(chat_id, 'Pastdagi tugmalardan birini bosing 👇', { reply_markup: confirmKb });
}

async function onCallback(q) {
  const chat_id = q.message.chat.id, d = q.data;
  await tg('answerCallbackQuery', { callback_query_id: q.id }).catch(() => {});
  if (d === 'noop') return;
  if (d.startsWith('info:')) { const i = +d.split(':')[1]; return show(q, PAGES[i], pageKb(i)); }
  if (d.startsWith('faq:')) {
    const [qq, aa] = FAQ[+d.split(':')[1]];
    return show(q, `<b>${qq}</b>\n${BOT_LINE}\n${aa}`, { inline_keyboard: [[{ text: '◀️ Savollar', callback_data: 'faq' }], APPLY_BTN] });
  }
  if (d.startsWith('qz:')) {
    const set = quiz.get(chat_id) || new Set(), i = +d.split(':')[1];
    set.has(i) ? set.delete(i) : set.add(i); quiz.set(chat_id, set);
    return show(q, QUIZ_HEAD, quizKb(set));
  }
  if (d === 'qzdone') {
    const set = quiz.get(chat_id) || new Set();
    if (!set.size) return tg('answerCallbackQuery', { callback_query_id: q.id, text: 'Avval kamida bitta muammoni belgilang', show_alert: true }).catch(() => {});
    const list = [...set].map((i) => PROBLEMS[i]);
    const note = set.size === 1 ? 'Aura Cebilon ko\'p bosqichli tozalash bilan bunga yechim bo\'la oladi.'
      : 'Bir nechta muammo bor — ko\'p bosqichli tizim aynan shunday suv uchun.';
    return show(q, `🔍 <b>NATIJA</b>\n${BOT_LINE}\nMuammolar: <code>${bar(set.size, 6)}</code> ${set.size}/6\n\n${list.join('\n')}\n\n💡 ${note}\n🎬 Demo ko'rsatamiz, maslahat bepul!`,
      { inline_keyboard: [[{ text: '✅ Bepul maslahat olish', callback_data: 'qzapply' }], [{ text: '🏠 Menyu', callback_data: 'menu' }]] });
  }
  if (d === 'qzapply') {
    const set = quiz.get(chat_id) || new Set();
    return startApply(chat_id, set.size ? 'Suv muammolari: ' + [...set].map((i) => PROBLEMS[i].replace(/^\S+\s/, '')).join(', ') : '');
  }
  if (d === 'skip') {
    const s = sessions.get(chat_id);
    if (s && s.step === 'message') { s.step = 'confirm'; return show(q, summary(s), confirmKb); }
    return;
  }
  if (d === 'confirm') return finish(chat_id, q.from);
  if (d === 'cancel') { sessions.delete(chat_id); return show(q, '✖️ Bekor qilindi.', { inline_keyboard: [APPLY_BTN] }); }
  return route(chat_id, d, q);
}

async function setupBot() {
  await tg('setMyCommands', { commands: [
    { command: 'start', description: '💧 Bosh menyu' },
    { command: 'menu', description: '🏠 Menyuni ochish' },
    { command: 'cancel', description: '✖️ Zayavkani bekor qilish' },
  ] }).catch(() => {});
  await tg('setMyShortDescription', { short_description: '💧 Aura Cebilon Pro — toza suv. 0% to\'lov. Zayavka qoldiring!' }).catch(() => {});
  await tg('setMyDescription', { description: 'Suv Filter Samarqand 💧\n\nAura Cebilon Pro — suvni tozalashning yangi standarti. Original Germaniya texnologiyasi, foizsiz muddatli to\'lov, demo xizmati.\n\nBoshlash uchun START ni bosing 👇' }).catch(() => {});
}

let offset = 0;
async function poll() {
  for (;;) {
    try {
      const updates = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
      for (const u of updates) {
        offset = u.update_id + 1;
        try {
          if (u.callback_query) await onCallback(u.callback_query);
          else if (u.message && (u.message.text || u.message.contact)) await onMessage(u.message);
        } catch (e) { console.error('Handler:', e.message); }
      }
    } catch (e) {
      console.error('Poll:', e.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// ---------- auth ----------
const sign = (v) => crypto.createHmac('sha256', SESSION_SECRET).update(v).digest('hex');
const safeEq = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const makeToken = () => { const exp = String(Date.now() + 7 * 864e5); return `${exp}.${sign(exp)}`; };
const validToken = (t) => {
  if (!t) return false;
  const [exp, sig] = t.split('.');
  return sig && safeEq(sig, sign(exp)) && Number(exp) > Date.now();
};
const cookie = (req, name) =>
  (req.headers.cookie || '').split(/;\s*/).map((c) => c.split('=')).find(([k]) => k === name)?.[1];
const requireAuth = (req, res, next) =>
  validToken(cookie(req, 'sid')) ? next() : res.status(401).json({ error: 'Kirish kerak' });

// simple per-IP rate limiter
const hits = new Map();
const limit = (max, windowMs) => (req, res, next) => {
  const key = req.path + req.ip, now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return res.status(429).json({ error: 'Juda ko\'p urinish. Keyinroq urinib ko\'ring.' });
  arr.push(now); hits.set(key, arr); next();
};

// ---------- app ----------
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/requests', limit(5, 10 * 60e3), async (req, res) => {
  const { name, phone, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot
  const n = String(name || '').trim().slice(0, 100);
  const p = String(phone || '').trim().slice(0, 30);
  const msg = String(message || '').trim().slice(0, 1000);
  if (n.length < 2 || p.replace(/\D/g, '').length < 9)
    return res.status(400).json({ error: 'Ism va telefon raqamini to\'g\'ri kiriting' });
  const r = { id: db.nextId++, name: n, phone: p, message: msg, status: 'new', createdAt: new Date().toISOString(), sent: false };
  db.requests.push(r); save();
  r.sent = await notify(r).catch(() => false); save();
  res.json({ ok: true });
});

app.post('/api/login', limit(10, 15 * 60e3), (req, res) => {
  const { user, password } = req.body || {};
  if (safeEq(String(user || ''), ADMIN_USER) && safeEq(String(password || ''), ADMIN_PASSWORD)) {
    res.setHeader('Set-Cookie', `sid=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 86400}`);
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' });
});
app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/admin/requests', requireAuth, (req, res) => {
  res.json({ requests: [...db.requests].reverse(), chats: db.chats.length, bindCode: BIND_CODE });
});
app.patch('/api/admin/requests/:id', requireAuth, (req, res) => {
  const r = db.requests.find((x) => x.id === Number(req.params.id));
  if (!r || !STATUSES.includes(req.body?.status)) return res.status(400).json({ error: 'Xato' });
  r.status = req.body.status; save(); res.json({ ok: true });
});
app.delete('/api/admin/requests/:id', requireAuth, (req, res) => {
  db.requests = db.requests.filter((x) => x.id !== Number(req.params.id)); save(); res.json({ ok: true });
});
app.post('/api/admin/test', requireAuth, async (req, res) => {
  if (!db.chats.length) return res.status(400).json({ error: 'Hech qaysi chat ulanmagan' });
  try {
    await Promise.all(db.chats.map((chat_id) => tg('sendMessage', { chat_id, text: '✅ Test xabar: admin paneldan.' })));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}  |  admin: /admin.html`));
setupBot();
poll();
