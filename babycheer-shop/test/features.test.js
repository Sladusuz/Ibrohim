import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHmac } from 'node:crypto';

const calls = [];
let mid = 1000;
const mock = http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    const isJson = (req.headers['content-type'] || '').includes('json');
    calls.push({ method: req.url.split('/').pop(), ...(b && isJson ? JSON.parse(b) : {}), __multipart: !isJson && !!b });
    res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: true, result: req.url.endsWith('/getMe') ? { username: 'testbot' } : /(sendMessage|copyMessage|sendPhoto|sendDocument)$/.test(req.url) ? { message_id: ++mid } : true }));
  });
});
await new Promise((r) => mock.listen(0, r));
Object.assign(process.env, { STORE_MEMORY: '1', BOT_TOKEN: '123456:TESTTOKEN', ADMIN_IDS: '999', WEBHOOK_SECRET: 'sec', TELEGRAM_API_BASE: `http://127.0.0.1:${mock.address().port}`, SHOP_URL: 'https://shop.test' });
const API = (await import('../netlify/functions/api.mjs')).default;
const BOT = (await import('../netlify/functions/bot.mjs')).default;
after(() => mock.close());

const initData = (id, extra = {}) => {
  const p = new URLSearchParams({ user: JSON.stringify({ id, first_name: 'Ali', last_name: 'Valiyev', ...extra }), auth_date: String(Math.floor(Date.now() / 1000)) });
  const check = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  p.set('hash', createHmac('sha256', createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest()).update(check).digest('hex'));
  return p.toString();
};
const call = (path, { method, body, id = 999 } = {}) =>
  API(new Request(`https://shop.test/api/${path}`, { method: method || (body ? 'POST' : 'GET'), body: body && JSON.stringify(body), headers: { 'x-tg-init-data': id ? initData(id) : '' } }));
const J = async (p, o) => (await call(p, o)).json();
const tgMsg = (from, text, extra = {}) => BOT(new Request('https://shop.test/tg', { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'sec' }, body: JSON.stringify({ update_id: 1, message: { message_id: 5, from: { id: from, first_name: 'Ali' }, chat: { id: from, type: 'private' }, text, ...extra } }) }));
const order = (id, over = {}) => call('order', { body: { name: 'Ali Valiyev', phone: '90 123 45 67', address: 'Toshkent, Chilonzor', delivery: 'courier', payment: 'cash', items: [{ id: 1, color: "Ko'k", qty: 1 }], ...over }, id });

test('promokod: foiz, minimal summa, limit, muddat va buyurtmaga qo\'llanishi', async () => {
  assert.equal((await call('admin/promo', { body: { code: 'ab' } })).status, 400);
  assert.equal((await call('admin/promo', { body: { code: 'YOZ10', percent: 10, amount: 5000 } })).status, 400); // ikkalasi birga mumkin emas
  assert.equal((await call('admin/promo', { body: { code: 'yoz10', percent: 10, max: 1 } })).status, 200);
  assert.equal((await call('admin/promo', { body: { code: 'OLD', percent: 10, expires: '2020-01-01' } })).status, 200);
  assert.equal((await call('admin/promo', { body: { code: 'BIG', amount: 1000, min: 99999999 } })).status, 200);
  assert.equal((await call('admin/promo', { body: { code: 'YOZ10', percent: 10 }, id: 111 })).status, 403);
  const items = [{ id: 1, qty: 1 }];
  const price = (await J('catalog')).products.find((p) => p.id === 1).price;
  const pv = await J('promo', { body: { code: 'yoz10', items }, id: 111 });
  assert.equal(pv.discount, Math.floor(price * 0.1));
  assert.match((await J('promo', { body: { code: 'OLD', items } })).error, /muddati/);
  assert.match((await J('promo', { body: { code: 'BIG', items } })).error, /dan yuqori/);
  assert.match((await J('promo', { body: { code: 'NOPE', items } })).error, /topilmadi/);
  const r = await J('order', { body: { name: 'Ali Valiyev', phone: '901234567', address: 'Toshkent, Chilonzor', delivery: 'courier', payment: 'cash', promo: 'yoz10', lang: 'ru', items: [{ id: 1, color: "Ko'k", qty: 1 }] }, id: 111 });
  assert.equal(r.order.discount, Math.floor(price * 0.1)); assert.equal(r.order.total, price - r.order.discount); assert.equal(r.order.lang, 'ru');
  assert.match(calls.filter((c) => c.method === 'sendMessage' && c.chat_id === 111).at(-1).text, /Заказ/); // mijozga ruscha xabar
  assert.match((await J('order', { body: { name: 'Ali V', phone: '901234567', address: 'Toshkent, Chilonzor', delivery: 'courier', payment: 'cash', promo: 'YOZ10', items: [{ id: 1, qty: 1 }] }, id: 112 })).error, /limiti/); // max 1
  // bekor qilinsa promokod ishlatilishi qaytadi
  await J('admin/order', { body: { id: r.order.id, status: 'cancelled' } });
  assert.equal((await J('promo', { body: { code: 'YOZ10', items } })).discount > 0, true);
});

test('banner: yaratish, tekshirish, katalogda faqat faollari', async () => {
  assert.equal((await call('admin/banner', { body: { title: '' } })).status, 400);
  assert.equal((await call('admin/banner', { body: { title: 'Aksiya', target_type: 'url', target: 'http://x' } })).status, 400);
  const b = (await J('admin/banner', { body: { title: 'Yozgi aksiya', text: 'Chegirma', color: 'orange', target_type: 'category', target: 1 } })).banner;
  assert.equal(b.color, 'orange'); assert.equal(b.target, '1');
  await J('admin/banner', { body: { title: 'Yashirin', active: false } });
  const cat = await J('catalog');
  assert.deepEqual(cat.banners.map((x) => x.title), ['Yozgi aksiya']);
  assert.equal((await J('admin/banner/delete', { body: { id: b.id } })).ok, true);
  assert.equal((await J('catalog')).banners.length, 0);
});

test('fikr: faqat yetkazilgan buyurtma uchun, bir marta; baho va moderatsiya', async () => {
  const r = await J('order', { body: { name: 'Vali Karimov', phone: '901112233', address: 'Toshkent, Yunusobod', delivery: 'courier', payment: 'cash', items: [{ id: 2, qty: 1 }] }, id: 120 });
  const rv = (body) => call('review', { body, id: 120 });
  assert.equal((await rv({ order_id: r.order.id, product_id: 2, rating: 5 })).status, 400); // hali yetkazilmagan
  await J('admin/order', { body: { id: r.order.id, status: 'delivered' } });
  assert.equal((await rv({ order_id: r.order.id, product_id: 2, rating: 9 })).status, 400);
  assert.equal((await rv({ order_id: r.order.id, product_id: 3, rating: 5 })).status, 400); // buyurtmada yo'q
  assert.equal((await call('review', { body: { order_id: r.order.id, product_id: 2, rating: 5 }, id: 121 })).status, 400); // boshqa odamniki
  assert.equal((await rv({ order_id: r.order.id, product_id: 2, rating: 4, text: 'Yaxshi' })).status, 200);
  assert.equal((await rv({ order_id: r.order.id, product_id: 2, rating: 5 })).status, 400); // ikkinchi marta
  assert.deepEqual((await J('orders', { id: 120 })).reviewed, [`${r.order.id}:2`]);
  const p = (await J('catalog')).products.find((x) => x.id === 2);
  assert.deepEqual(p.rating, { avg: 4, count: 1 }); assert.ok(p.sold >= 1);
  const list = (await J('reviews?pid=2')).reviews; assert.equal(list.length, 1); assert.equal(list[0].name, 'Vali K.');
  const adm = (await J('admin/state')).reviews; assert.equal(adm.length, 1);
  assert.equal((await J('admin/review/delete', { body: { pid: 2, id: list[0].id } })).ok, true);
  assert.equal((await J('catalog')).products.find((x) => x.id === 2).rating, null);
});

test('"mavjud bo\'lganda xabar bering": ombor 0 dan oshganda mijozga xabar boradi', async () => {
  await J('admin/product/patch', { body: { id: 4, stock: 0 } });
  assert.match((await J('notify', { body: { pid: 5 }, id: 130 })).error, /mavjud/); // mavjud mahsulotga obuna bo'lmaydi
  assert.equal((await J('notify', { body: { pid: 4 }, id: 130 })).ok, true);
  assert.equal((await J('notify', { body: { pid: 4 }, id: 130 })).ok, true); // takroriy bosish zararsiz
  await J('lang', { body: { lang: 'ru' }, id: 130 });
  const before = calls.length;
  await J('admin/product/patch', { body: { id: 4, stock: 3 } });
  const sent = calls.slice(before).filter((c) => c.method === 'sendMessage' && c.chat_id === 130);
  assert.equal(sent.length, 1); assert.match(sent[0].text, /в наличии/);
  await J('admin/product/patch', { body: { id: 4, stock: 5 } });
  assert.equal(calls.slice(before).filter((c) => c.method === 'sendMessage' && c.chat_id === 130).length, 1); // ikkinchi marta yuborilmaydi
});

test('ommaviy xabar va CSV eksport (faqat asosiy admin)', async () => {
  await tgMsg(140, '/start'); await tgMsg(141, '/start'); // mijozlar ro'yxatga olinadi
  assert.equal((await call('admin/broadcast/start', { body: { text: 'Salom' }, id: 111 })).status, 403);
  assert.equal((await call('admin/broadcast/start', { body: { text: 'a' } })).status, 400);
  const { total } = await J('admin/broadcast/start', { body: { text: 'Yangi aksiya <b>bor</b>', pid: 1 } });
  assert.ok(total >= 2);
  const before = calls.length;
  const r = await J('admin/broadcast/step', { body: {} });
  assert.equal(r.done, true); assert.equal(r.sent, total);
  const m = calls.slice(before).filter((c) => c.method === 'sendMessage' && [140, 141].includes(c.chat_id));
  assert.equal(m.length, 2); assert.ok(m[0].text.includes('&lt;b&gt;')); assert.match(m[0].reply_markup.inline_keyboard[0][0].web_app.url, /#\/p\/1$/);
  const c0 = calls.length;
  assert.equal((await J('admin/export', { body: {} })).ok, true);
  assert.ok(calls.slice(c0).some((c) => c.method === 'sendDocument' && c.__multipart));
  assert.equal((await call('admin/export', { body: {}, id: 111 })).status, 403);
});

test('bot: mahsulot havolasi, til almashtirish, ruscha xabarlar', async () => {
  let b = calls.length;
  await tgMsg(150, '/start p_1');
  const first = calls.slice(b).find((c) => /^send(Message|Photo)$/.test(c.method) && c.chat_id === 150);
  assert.match(first.text || first.caption, /so'm/); assert.equal(first.reply_markup.inline_keyboard[0][0].web_app.url, 'https://shop.test/#/p/1');
  b = calls.length; await tgMsg(150, '/ru');
  assert.match(calls.slice(b).find((c) => c.method === 'sendMessage').text, /Русский/);
  b = calls.length; await tgMsg(150, '/start');
  assert.match(calls.slice(b).find((c) => c.method === 'sendMessage' && c.chat_id === 150).text, /Здравствуйте/);
  b = calls.length; await tgMsg(150, '/start p_9999'); // yo'q mahsulot: oddiy start
  assert.match(calls.slice(b).find((c) => c.method === 'sendMessage' && c.chat_id === 150).text, /Здравствуйте/);
});

test('admin /video va /export buyruqlari; mahsulot: yosh va ruscha maydonlar, muddatli to\'lov', async () => {
  const b = calls.length;
  await tgMsg(999, '/video 1', { text: undefined, caption: '/video 1', video: { file_id: 'BAADVIDEOFILEID123456', file_size: 1000 } });
  assert.match(calls.slice(b).find((c) => c.method === 'sendMessage' && c.chat_id === 999).text, /videosi qo'shildi/);
  assert.equal((await J('catalog')).products.find((p) => p.id === 1).video, 'BAADVIDEOFILEID123456');
  await J('admin/product', { body: { id: 1, category_id: 1, title: 'Test', price: 100000, stock: 5, age_min: 2, age_max: 6, title_ru: 'Тест', video: null } });
  const p = (await J('catalog')).products.find((x) => x.id === 1);
  assert.equal(p.age_min, 2); assert.equal(p.title_ru, 'Тест'); assert.equal(p.video, null);
  assert.equal((await call('admin/product', { body: { id: 1, category_id: 1, title: 'Test', price: 100000, age_min: 9, age_max: 3 } })).status, 400);
  assert.equal((await call('admin/product', { body: { id: 1, category_id: 1, title: 'Test', price: 100000, age_min: 30 } })).status, 400);
  assert.equal((await call('admin/settings', { body: { installment: { enabled: true, months: 1 } } })).status, 400);
  const s = (await J('admin/settings', { body: { installment: { enabled: true, months: 9, markup: 12 } } })).settings;
  assert.deepEqual(s.installment, { enabled: true, months: 9, markup: 12 });
  assert.ok((await J('catalog')).settings.payments.some((m) => m.id === 'installment'));
  assert.equal((await J('order', { body: { name: 'Ali Valiyev', phone: '901234567', address: 'Toshkent, Chilonzor', delivery: 'courier', payment: 'installment', items: [{ id: 5, qty: 1 }] }, id: 160 })).order.payment, 'installment');
});
