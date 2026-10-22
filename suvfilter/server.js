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
const CONTACT_PHONE = '+998 93 330 35 75';
const MENU = { inline_keyboard: [
  [{ text: '📝 Zayavka qoldirish', callback_data: 'apply' }],
  [{ text: 'ℹ️ Mahsulot haqida', callback_data: 'info' }, { text: '📞 Aloqa', callback_data: 'contact' }],
] };
const WELCOME =
  '💧 <b>Suv Filter Samarqand</b>\n\n' +
  '<b>Aura Cebilon</b> — suvni tozalashning yangi standarti.\n' +
  '🇩🇪 Original Germaniya texnologiyasi\n' +
  '💳 <b>Foizsiz muddatli to\'lov</b>\n' +
  '🚚 Samarqand · Toshkent · Qarshi\n\n' +
  'Zayavka qoldiring — tez orada o\'zimiz bog\'lanamiz 👇';
const INFO =
  '🚰 <b>Aura Cebilon Pro</b>\n' +
  'Zamonaviy suv tozalash apparati.\n\n' +
  '✅ Ko\'p bosqichli tozalash tizimi\n' +
  '✅ Hid, tuz va zang kabi aralashmalardan tozalaydi\n' +
  '✅ Ichimlikdan shirin, mazali suv\n' +
  '✅ Bolalar uchun xavfsiz\n' +
  '✅ Ixcham dizayn, oshxonaga mos\n' +
  '✅ Oson o\'rnatish va qulay foydalanish\n' +
  '✅ Original ehtiyot qismlar va xizmat ko\'rsatish\n\n' +
  '🎬 Demo xizmati mavjud: apparat ishlashini o\'zingiz ko\'ring.\n' +
  '💳 0% muddatli to\'lov';
const CONTACT =
  `📞 <b>Telefon:</b> ${CONTACT_PHONE}\n` +
  '📍 Samarqand · Toshkent · Qarshi\n' +
  '📸 Instagram: instagram.com/suv_filtir_samarqand\n' +
  '✈️ Kanal: t.me/auracebilonsamarqandpro';

const sessions = new Map(); // chat_id -> { step, name, phone }
const send = (chat_id, text, extra = {}) => tg('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const REMOVE_KB = { remove_keyboard: true };

async function sendWelcome(chat_id) {
  const photo = new Blob([fs.readFileSync(path.join(__dirname, 'public', 'product.jpg'))], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('chat_id', String(chat_id));
  form.append('caption', WELCOME);
  form.append('parse_mode', 'HTML');
  form.append('reply_markup', JSON.stringify(MENU));
  form.append('photo', photo, 'product.jpg');
  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: 'POST', body: form });
  if (!(await r.json()).ok) await send(chat_id, WELCOME, { reply_markup: MENU });
}

async function startApply(chat_id) {
  sessions.set(chat_id, { step: 'name' });
  await send(chat_id, '📝 <b>Zayavka</b>\n\nIsmingizni yozing:\n\n<i>Bekor qilish: /cancel</i>', { reply_markup: REMOVE_KB });
}

async function submit(chat_id, from, s, message) {
  sessions.delete(chat_id);
  const r = {
    id: db.nextId++, name: s.name, phone: s.phone, message, status: 'new',
    createdAt: new Date().toISOString(), sent: false, source: 'bot',
    tgUser: from.username ? '@' + from.username : '',
  };
  db.requests.push(r); save();
  r.sent = await notify(r).catch(() => false); save();
  await send(chat_id, `✅ <b>Rahmat, ${esc(s.name)}!</b>\n\nZayavkangiz qabul qilindi. Tez orada ${esc(s.phone)} raqamiga qo'ng'iroq qilamiz.`,
    { reply_markup: MENU });
}

async function onMessage(m) {
  const chat_id = m.chat.id, text = (m.text || '').trim();
  const [cmd, arg] = text.split(/\s+/);

  if (cmd === '/start' && arg === BIND_CODE) {
    if (!db.chats.includes(chat_id)) { db.chats.push(chat_id); save(); }
    return send(chat_id, '✅ Ulandi. Endi saytdan va botdan kelgan zayavkalar shu yerga keladi.\n/stop — o\'chirish');
  }
  if (cmd === '/stop' && db.chats.includes(chat_id)) {
    db.chats = db.chats.filter((c) => c !== chat_id); save();
    return send(chat_id, 'O\'chirildi.');
  }
  if (cmd === '/start' || cmd === '/menu') { sessions.delete(chat_id); return sendWelcome(chat_id); }
  if (cmd === '/cancel') { sessions.delete(chat_id); return send(chat_id, 'Bekor qilindi.', { reply_markup: MENU }); }

  const s = sessions.get(chat_id);
  if (!s) return send(chat_id, 'Quyidagi menyudan tanlang 👇', { reply_markup: MENU });

  if (s.step === 'name') {
    if (text.length < 2) return send(chat_id, 'Iltimos, ismingizni yozing.');
    s.name = text.slice(0, 100); s.step = 'phone';
    return send(chat_id, `Rahmat, <b>${esc(s.name)}</b>! Endi telefon raqamingizni yuboring:\n(pastdagi tugmani bosing yoki yozing, masalan +998 90 123 45 67)`, {
      reply_markup: { keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
    });
  }
  if (s.step === 'phone') {
    const phone = (m.contact?.phone_number || text).trim();
    if (phone.replace(/\D/g, '').length < 9) return send(chat_id, 'Raqam noto\'g\'ri. Qaytadan yozing, masalan +998 90 123 45 67');
    s.phone = phone.startsWith('+') || !/^998/.test(phone) ? phone.slice(0, 30) : '+' + phone.slice(0, 29);
    s.step = 'message';
    return send(chat_id, 'Qo\'shimcha xabaringiz bormi? (masalan: qaysi shaharda, qulay vaqt)\nYozing yoki o\'tkazib yuboring 👇', {
      reply_markup: { inline_keyboard: [[{ text: '⏭ O\'tkazib yuborish', callback_data: 'skip' }]] },
    });
  }
  if (s.step === 'message') return submit(chat_id, m.from, s, text.slice(0, 1000));
}

async function onCallback(q) {
  const chat_id = q.message.chat.id;
  await tg('answerCallbackQuery', { callback_query_id: q.id }).catch(() => {});
  if (q.data === 'apply') return startApply(chat_id);
  if (q.data === 'info') return send(chat_id, INFO, { reply_markup: { inline_keyboard: [[{ text: '📝 Zayavka qoldirish', callback_data: 'apply' }]] } });
  if (q.data === 'contact') return send(chat_id, CONTACT, { reply_markup: MENU });
  if (q.data === 'skip') {
    const s = sessions.get(chat_id);
    if (s && s.step === 'message') return submit(chat_id, q.from, s, '');
  }
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
poll();
