'use strict';
/* Soxta Telegram serveri bilan botni sinash: haqiqiy tokenga ehtiyoj yo'q. */
const http = require('http');
const assert = require('assert');
const os = require('os');
const path = require('path');

const sent = [];
const srv = http.createServer((req, res) => {
  let b = '';
  req.on('data', (c) => (b += c));
  req.on('end', () => {
    const method = req.url.split('/').pop();
    let p = {}; try { p = JSON.parse(b); } catch (e) { /* multipart */ }
    sent.push({ method, p });
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, result: method === 'getMe' ? { username: 'test_bot' } : { message_id: 1 } }));
  });
});

srv.listen(0, async () => {
  process.env.TG_API = 'http://127.0.0.1:' + srv.address().port;
  process.env.BOT_TOKEN = 'TEST';
  process.env.DB_FILE = path.join(os.tmpdir(), 'basra-test-' + Date.now() + '.json');
  process.env.ADMIN_SECRET = 'sirli';
  const bot = require('../bot');
  const texts = (chat) => sent.filter((s) => s.method === 'sendMessage' && s.p.chat_id === chat).map((s) => s.p.text);
  const user = { id: 111, first_name: 'Ali', username: 'ali' };
  const admin = { id: 999, first_name: 'Admin' };
  const msg = (from, text, extra) => bot.handle({ update_id: 1, message: Object.assign({ chat: { id: from.id, type: 'private' }, from, text }, extra || {}) });
  const cb = (from, data) => bot.handle({ update_id: 2, callback_query: { id: 'x', from, data, message: { chat: { id: from.id }, message_id: 5 } } });

  await msg(admin, '/admin sirli');
  assert(bot.db.admins.includes(999), 'admin bo‘lmadi');

  await msg(user, '/start');
  assert(texts(111).some((t) => t.includes('xush kelibsiz')));

  // bot ichida ro'yxatdan o'tish
  await cb(user, 'reg');
  await cb(user, 'rc:arabkids');
  await cb(user, 'ra:child');
  await msg(user, 'Vali Aliyev');
  await msg(user, '7');
  await msg(user, '95 833 11 00');
  await cb(user, 'rt:evening');
  await cb(user, 'rok');
  assert.strictEqual(bot.db.leads.length, 1);
  const l = bot.db.leads[0];
  assert.strictEqual(l.phone, '+998958331100');
  assert.strictEqual(l.course, 'arabkids');
  assert(texts(999).some((t) => t.includes('Yangi ariza')), 'admin xabar olmadi');

  // mini ilovadan
  await msg(user, '', { web_app_data: { data: JSON.stringify({ course: 'english', audience: 'adult', name: 'Sardor', phone: '901234567', time: 'day' }) } });
  assert.strictEqual(bot.db.leads.length, 2);
  // noto'g'ri raqam
  await msg(user, '', { web_app_data: { data: JSON.stringify({ course: 'english', name: 'X', phone: '123' }) } });
  assert.strictEqual(bot.db.leads.length, 2);
  // XSS/HTML
  await msg(user, '', { web_app_data: { data: JSON.stringify({ course: 'arab', name: '<b>Hack</b>', phone: '+998901112233' }) } });
  assert(texts(999).some((t) => t.includes('&lt;b&gt;Hack')), 'HTML ekranlanmadi');

  // holat va statistika
  await cb(admin, 'L:1:done');
  assert.strictEqual(bot.db.leads[0].status, 'done');
  await msg(admin, '/stats');
  assert(texts(999).some((t) => t.includes('Statistika')));
  await msg(user, '/stats');
  assert(texts(111).some((t) => t.includes('faqat adminlar')));

  // test
  await msg(user, '🎯 Harf testi');
  for (let i = 0; i < 5; i++) { const s = bot.db.sessions[111]; await cb(user, 'q:' + s.q); }
  assert(texts(111).some((t) => t.includes('Natija: 5/5')), 'quiz tugamadi');

  // erkin savol
  await msg(user, 'Narxi qancha?');
  assert(texts(999).some((t) => t.includes('Narxi qancha')));

  console.log('Barcha testlar o‘tdi ✅');
  srv.close(); process.exit(0);
});
