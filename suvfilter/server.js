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
    (r.message ? `💬 <b>Xabar:</b> ${esc(r.message)}\n` : '') +
    `\n🕒 ${new Date(r.createdAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Samarkand' })}`;
  const results = await Promise.allSettled(
    db.chats.map((chat_id) => tg('sendMessage', { chat_id, text, parse_mode: 'HTML' }))
  );
  const ok = results.some((x) => x.status === 'fulfilled');
  results.filter((x) => x.status === 'rejected').forEach((x) => console.error('Telegram:', x.reason.message));
  return ok;
}

let offset = 0;
async function poll() {
  for (;;) {
    try {
      const updates = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['message'] });
      for (const u of updates) {
        offset = u.update_id + 1;
        const m = u.message;
        if (!m || !m.text) continue;
        const [cmd, arg] = m.text.trim().split(/\s+/);
        if (cmd.startsWith('/start')) {
          if (arg === BIND_CODE) {
            if (!db.chats.includes(m.chat.id)) { db.chats.push(m.chat.id); save(); }
            await tg('sendMessage', { chat_id: m.chat.id, text: '✅ Ulandi. Endi saytdan kelgan zayavkalar shu yerga keladi.\n/stop — o\'chirish' });
          } else {
            await tg('sendMessage', { chat_id: m.chat.id, text: 'Bu bot saytdan kelgan zayavkalarni qabul qilish uchun. Ulanish uchun admin kodi kerak.' });
          }
        } else if (cmd === '/stop' && db.chats.includes(m.chat.id)) {
          db.chats = db.chats.filter((c) => c !== m.chat.id); save();
          await tg('sendMessage', { chat_id: m.chat.id, text: 'O\'chirildi.' });
        }
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
