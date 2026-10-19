import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHmac } from 'node:crypto';

const calls = [];
const mock = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const method = req.url.split('/').pop();
    calls.push({ method, ...(body ? JSON.parse(body) : {}) });
    res.setHeader('content-type', 'application/json');
    if (method === 'createInvoiceLink') return res.end(JSON.stringify({ ok: true, result: 'https://t.me/$inv' }));
    res.end(JSON.stringify({ ok: true, result: true }));
  });
});
await new Promise((r) => mock.listen(0, r));

process.env.STORE_MEMORY = '1';
process.env.BOT_TOKEN = '123456:TESTTOKEN';
process.env.ADMIN_IDS = '999';
process.env.WEBHOOK_SECRET = 'sec';
process.env.PAYMENT_PROVIDER_TOKEN = 'prov';
process.env.CARD_NUMBER = '8600 1111 2222 3333';
process.env.CARD_OWNER = 'Test Owner';
process.env.TELEGRAM_API_BASE = `http://127.0.0.1:${mock.address().port}`;

const API = (await import('../netlify/functions/api.mjs')).default;
const BOT = (await import('../netlify/functions/bot.mjs')).default;
const shop = await import('../netlify/functions/lib/shop.js');

const initData = (id) => {
  const p = new URLSearchParams({ user: JSON.stringify({ id, first_name: 'Ali' }), auth_date: String(Math.floor(Date.now() / 1000)) });
  const check = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  p.set('hash', createHmac('sha256', createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest()).update(check).digest('hex'));
  return p.toString();
};
const call = (path, { method = 'GET', body, id } = {}) =>
  API(new Request(`https://shop.test/api/${path}`, { method, body: body && JSON.stringify(body), headers: { 'x-tg-init-data': id ? initData(id) : '' } }));
const hook = (update, secret = 'sec') =>
  BOT(new Request('https://shop.test/tg', { method: 'POST', body: JSON.stringify(update), headers: { 'x-telegram-bot-api-secret-token': secret } }));
const sent = (m) => calls.filter((c) => c.method === m);
const order = { name: 'Ali', phone: '90 123 45 67', delivery: 'courier', address: 'Toshkent, Chilonzor 5', payment: 'cash', items: [{ id: 2, qty: 1, color: 'Qizil' }] };

after(() => mock.close());

test('katalog, imzosiz buyurtma rad etiladi', async () => {
  const c = await (await call('catalog')).json();
  assert.equal(c.products.length, 10);
  assert.deepEqual(c.settings.payments.map((p) => p.id), ['cash', 'card', 'online', 'transfer']);
  assert.equal(c.faq.length, 5);
  assert.equal((await call('order', { method: 'POST', body: order })).status, 401);
  assert.equal((await call('orders')).status, 401);
});

test('buyurtma: mijozga va adminga xabar, ro\'yxatda ko\'rinadi', async () => {
  calls.length = 0;
  const r = await call('order', { method: 'POST', body: order, id: 111 });
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.order.no, 'BC-1001');
  assert.equal(j.order.total, 2450000);
  assert.ok(sent('sendMessage').some((c) => c.chat_id === 111 && c.text.includes('BC-1001')));
  assert.ok(sent('sendMessage').some((c) => c.chat_id === 999 && c.text.includes('Yangi buyurtma') && c.reply_markup.inline_keyboard.length === 3));
  const mine = await (await call('orders', { id: 111 })).json();
  assert.equal(mine.orders.length, 1);
  assert.equal((await (await call('orders', { id: 222 })).json()).orders.length, 0);
  const t = await (await call('track?no=bc-1001&phone=901234567')).json();
  assert.equal(t.order.status, 'new');
});

test('onlayn to\'lov: invoice havolasi; o\'tkazma: karta ma\'lumoti', async () => {
  const on = await (await call('order', { method: 'POST', body: { ...order, payment: 'online' }, id: 111 })).json();
  assert.equal(on.invoice_url, 'https://t.me/$inv');
  const inv = sent('createInvoiceLink').at(-1);
  assert.equal(inv.currency, 'UZS');
  assert.equal(inv.prices[0].amount, 2450000 * 100);
  const tr = await (await call('order', { method: 'POST', body: { ...order, payment: 'transfer' }, id: 111 })).json();
  assert.equal(tr.transfer.card, '8600 1111 2222 3333');
});

test('webhook: maxfiy kalit, /start, pre_checkout, to\'lov', async () => {
  assert.equal((await hook({}, 'wrong')).status, 403);
  const keep = process.env.WEBHOOK_SECRET; delete process.env.WEBHOOK_SECRET;
  assert.equal((await hook({}, 'undefined')).status, 403); // kalit sozlanmagan = rad
  process.env.WEBHOOK_SECRET = keep;
  calls.length = 0;
  await hook({ message: { chat: { id: 111 }, from: { id: 111, first_name: 'Ali' }, text: '/start' } });
  assert.ok(sent('setChatMenuButton').some((c) => c.menu_button.text === 'Open' && c.menu_button.web_app.url === 'https://shop.test'));
  assert.ok(sent('sendMessage').at(-1).reply_markup.inline_keyboard[0][0].web_app);
  const o = await shop.getOrder(2); // onlayn buyurtma
  await hook({ pre_checkout_query: { id: 'q1', invoice_payload: 'order:2', total_amount: o.total * 100 } });
  assert.equal(sent('answerPreCheckoutQuery').at(-1).ok, true);
  await hook({ pre_checkout_query: { id: 'q2', invoice_payload: 'order:2', total_amount: 5 } });
  assert.equal(sent('answerPreCheckoutQuery').at(-1).ok, false);
  await hook({ message: { chat: { id: 111 }, from: { id: 111 }, successful_payment: { invoice_payload: 'order:2' } } });
  assert.equal((await shop.getOrder(2)).paid, true);
  assert.ok(sent('sendMessage').some((c) => c.chat_id === 999 && c.text.includes("Onlayn to'lov")));
});

test('admin tugmalari: holat, to\'lov; oddiy foydalanuvchi ruxsatsiz', async () => {
  calls.length = 0;
  const cb = (from, data) => ({ callback_query: { id: 'c', from: { id: from }, data, message: { chat: { id: from }, message_id: 7 } } });
  await hook(cb(111, 'st:1:confirmed'));
  assert.equal((await shop.getOrder(1)).status, 'new');
  assert.ok(sent('answerCallbackQuery').at(-1).show_alert);
  await hook(cb(999, 'st:1:confirmed'));
  assert.equal((await shop.getOrder(1)).status, 'confirmed');
  assert.ok(sent('sendMessage').some((c) => c.chat_id === 111 && c.text.includes('Tasdiqlandi')));
  assert.ok(sent('editMessageText').length === 1);
  await hook(cb(999, 'pay:1'));
  assert.equal((await shop.getOrder(1)).paid, true);
});

test('chek: reply orqali adminga yetadi', async () => {
  calls.length = 0;
  await hook({ message: { chat: { id: 111 }, from: { id: 111 }, photo: [{ file_id: 'a' }, { file_id: 'FILEID123456' }], reply_to_message: { text: 'BC-1003 uchun chek' } } });
  const p = sent('sendPhoto')[0];
  assert.equal(p.chat_id, 999);
  assert.equal(p.photo, 'FILEID123456');
  assert.ok(p.caption.includes('BC-1003'));
});

test('admin buyruqlari: narx, ombor, qo\'shish, rasm, sozlama, ro\'yxat', async () => {
  const say = (text, extra = {}) => hook({ message: { chat: { id: 999 }, from: { id: 999 }, ...(extra.photo ? { caption: text } : { text }), ...extra } });
  calls.length = 0;
  await say('/price 9 400000'); await say('/stock 9 77'); await say('/oldprice 9 500000');
  let p = (await shop.getCatalog()).products.find((x) => x.id === 9);
  assert.deepEqual([p.price, p.stock, p.old_price], [400000, 77, 500000]);
  await say('/add Samokatlar | Yangi samokat | 300 000 | 0 | 5 | Zo\'r samokat | Qizil, Ko\'k', { photo: [{ file_id: 'PHOTOID1234567' }] });
  p = (await shop.getCatalog()).products.find((x) => x.id === 11);
  assert.equal(p.title, 'Yangi samokat'); assert.equal(p.price, 300000); assert.equal(p.photo, 'PHOTOID1234567'); assert.equal(p.colors[0].hex, '#e5262b');
  await say('/photo 11', { photo: [{ file_id: 'NEWPHOTO1234567' }] });
  assert.equal((await shop.getCatalog()).products.find((x) => x.id === 11).photo, 'NEWPHOTO1234567');
  await say('/set regionFee 50000');
  assert.equal((await shop.getCatalog()).settings.regionFee, 50000);
  await say('/add Yo\'q kategoriya | X | 1 | 0 | 1');
  assert.ok(sent('sendMessage').at(-1).text.includes('Kategoriya topilmadi'));
  await say('/del 11');
  assert.equal((await shop.publicCatalog()).products.some((x) => x.id === 11), false);
  await say('/products'); await say('/stats'); await say('/orders'); await say('/admin');
  assert.ok(sent('sendMessage').length >= 8);
  // oddiy foydalanuvchi admin buyrug'ini bajara olmaydi
  await hook({ message: { chat: { id: 111 }, from: { id: 111 }, text: '/price 9 1' } });
  assert.equal((await shop.getCatalog()).products.find((x) => x.id === 9).price, 400000);
});
