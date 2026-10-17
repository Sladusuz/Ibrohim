import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHmac } from 'node:crypto';

const calls = [];
const mock = http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    calls.push({ method: req.url.split('/').pop(), ...(b ? JSON.parse(b) : {}) });
    res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: true, result: true }));
  });
});
await new Promise((r) => mock.listen(0, r));
Object.assign(process.env, { STORE_MEMORY: '1', BOT_TOKEN: '123456:TESTTOKEN', ADMIN_IDS: '999', WEBHOOK_SECRET: 'sec', TELEGRAM_API_BASE: `http://127.0.0.1:${mock.address().port}` });
const API = (await import('../netlify/functions/api.mjs')).default;
const PHOTO = (await import('../netlify/functions/photo.mjs')).default;
const BOT = (await import('../netlify/functions/bot.mjs')).default;
after(() => mock.close());

const initData = (id) => {
  const p = new URLSearchParams({ user: JSON.stringify({ id, first_name: 'T' }), auth_date: String(Math.floor(Date.now() / 1000)) });
  const check = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  p.set('hash', createHmac('sha256', createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest()).update(check).digest('hex'));
  return p.toString();
};
const call = (path, { method = 'GET', body, id = 999, raw, type } = {}) =>
  API(new Request(`https://shop.test/api/${path}`, { method, body: raw ?? (body && JSON.stringify(body)), headers: { 'x-tg-init-data': id ? initData(id) : '', ...(type ? { 'content-type': type } : {}) } }));
const J = async (p, o) => (await call(p, o)).json();

test('admin API faqat adminlar uchun', async () => {
  assert.equal((await call('admin/state', { id: 111 })).status, 403);
  assert.equal((await call('admin/state', { id: 0 })).status, 403);
  assert.equal((await call('admin/product', { method: 'POST', body: { title: 'x' }, id: 111 })).status, 403);
  const s = await J('admin/state');
  assert.equal(s.products.length, 10); assert.equal(s.categories.length, 5); assert.ok(Array.isArray(s.orders));
});

test('mahsulot: qo\'shish, tahrirlash, yashirish, o\'chirish', async () => {
  const base = { category_id: 5, title: 'Yangi samokat', price: '300 000', old_price: 350000, stock: 7, badge: 'Yangi', short: 'Qisqa', description: 'Uzun tavsif', colors: [{ name: 'Qizil', hex: '#e5262b' }, { name: '', hex: 'x' }], specs: { Yosh: '3-8', '': 'bo\'sh' } };
  const r = await call('admin/product', { method: 'POST', body: base });
  assert.equal(r.status, 200);
  const p = (await r.json()).product;
  assert.equal(p.price, 300000); assert.equal(p.colors.length, 1); assert.deepEqual(p.specs, { Yosh: '3-8' }); assert.equal(p.id, 11);
  assert.ok((await shopCatalog()).products.some((x) => x.id === 11));
  const e = await J('admin/product', { method: 'POST', body: { ...base, id: 11, price: 250000, stock: 3, featured: true } });
  assert.equal(e.product.price, 250000); assert.equal(e.product.featured, true);
  await J('admin/product', { method: 'POST', body: { ...base, id: 11, active: false } });
  assert.equal((await shopCatalog()).products.some((x) => x.id === 11), false); // yashirilgan: do'konda ko'rinmaydi
  assert.equal((await J('admin/state')).products.some((x) => x.id === 11), true); // admin ko'radi
  assert.equal((await call('admin/product', { method: 'POST', body: { ...base, price: 0 } })).status, 400);
  assert.equal((await call('admin/product', { method: 'POST', body: { ...base, category_id: 999 } })).status, 400);
  assert.equal((await call('admin/product', { method: 'POST', body: { ...base, id: 777 } })).status, 400);
  assert.equal((await call('admin/product/delete', { method: 'POST', body: { id: 11 } })).status, 200);
  assert.equal((await call('admin/product/delete', { method: 'POST', body: { id: 11 } })).status, 400);
});

test('rasm yuklash va /photo orqali berish', async () => {
  assert.equal((await call('admin/upload', { method: 'POST', raw: 'x', type: 'text/plain' })).status, 400);
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
  const { photo } = await J('admin/upload', { method: 'POST', raw: png, type: 'image/png' });
  assert.match(photo, /^img_[\w-]{10,}$/);
  const r = await PHOTO(new Request(`https://shop.test/photo/${photo}`));
  assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await r.arrayBuffer()), png);
  const e = await J('admin/product', { method: 'POST', body: { id: 1, category_id: 1, title: 'Sport elektromobil, 2 kishilik', price: 4600000, photo } });
  assert.equal(e.product.photo, photo);
  assert.equal((await call('admin/upload', { method: 'POST', raw: png, type: 'image/png', id: 111 })).status, 403);
});

test('bir nechta rasm: birinchisi asosiy, 6 tadan oshmaydi, eski photo ham ishlaydi', async () => {
  const up = async () => (await J('admin/upload', { method: 'POST', raw: Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex'), type: 'image/png' })).photo;
  const [a, b, c] = [await up(), await up(), await up()];
  const base = { id: 3, category_id: 1, title: '2 kishilik elektromobil', price: 3950000 };
  let p = (await J('admin/product', { method: 'POST', body: { ...base, images: [b, a, b, c] } })).product;
  assert.deepEqual(p.images, [b, a, c]); assert.equal(p.photo, b); // takror olib tashlanadi, birinchisi asosiy
  assert.deepEqual((await J('catalog')).products.find((x) => x.id === 3).images, [b, a, c]);
  p = (await J('admin/product', { method: 'POST', body: { ...base, images: Array.from({ length: 9 }, (_, i) => `img_abcdefghij${i}`) } })).product;
  assert.equal(p.images.length, 6);
  p = (await J('admin/product', { method: 'POST', body: { ...base, photo: a } })).product; // eski format
  assert.deepEqual(p.images, [a]);
  assert.equal((await call('admin/product', { method: 'POST', body: { ...base, images: ['../x'] } })).status, 400);
  p = (await J('admin/product', { method: 'POST', body: { ...base, images: [] } })).product;
  assert.equal(p.photo, null); assert.deepEqual((await J('catalog')).products.find((x) => x.id === 3).images, []);
});

test('kategoriya va sozlamalar', async () => {
  const c = (await J('admin/category', { method: 'POST', body: { name: "O'yinchoqlar", icon: 'trike' } })).category;
  assert.equal(c.icon, 'trike');
  assert.equal((await call('admin/category', { method: 'POST', body: { name: "o'yinchoqlar" } })).status, 400);
  assert.equal((await J('admin/category', { method: 'POST', body: { id: c.id, name: 'Yangi nom', icon: 'zzz' } })).category.icon, 'car');
  assert.equal((await call('admin/category/delete', { method: 'POST', body: { id: 1 } })).status, 400); // ichida mahsulot bor
  assert.equal((await call('admin/category/delete', { method: 'POST', body: { id: c.id } })).status, 200);
  const s = (await J('admin/settings', { method: 'POST', body: { deliveryFee: '50 000', freeFrom: 1500000, phone: '+998 90 000 00 00', telegram: '@newadmin' } })).settings;
  assert.deepEqual([s.deliveryFee, s.freeFrom, s.phone, s.telegram], [50000, 1500000, '+998 90 000 00 00', 'newadmin']);
  assert.equal((await call('admin/settings', { method: 'POST', body: { deliveryFee: 'abc' } })).status, 400);
  assert.equal((await J('catalog')).settings.deliveryFee, 50000);
});

test('buyurtmani admin panelidan tasdiqlash va to\'langan deb belgilash', async () => {
  const o = (await J('order', { method: 'POST', id: 111, body: { name: 'Ali', phone: '901234567', delivery: 'pickup', payment: 'cash', items: [{ id: 6, qty: 1 }] } })).order;
  calls.length = 0;
  const r = await J('admin/order', { method: 'POST', body: { id: o.id, status: 'confirmed', paid: true } });
  assert.equal(r.order.status, 'confirmed'); assert.equal(r.order.paid, true);
  assert.ok(calls.some((c) => c.method === 'sendMessage' && c.chat_id === 111 && c.text.includes('Tasdiqlandi')));
  assert.ok(calls.some((c) => c.method === 'sendMessage' && c.chat_id === 111 && c.text.includes("to'lov tasdiqlandi")));
  const stock = (await shopCatalog()).products.find((p) => p.id === 6).stock;
  await J('admin/order', { method: 'POST', body: { id: o.id, status: 'cancelled' } });
  assert.equal((await shopCatalog()).products.find((p) => p.id === 6).stock, stock + 1); // bekor: ombor qaytadi
  assert.equal((await J('admin/order', { method: 'POST', body: { id: o.id, paid: false } })).order.paid, false);
  assert.equal((await call('admin/order', { method: 'POST', body: { id: 99999, status: 'confirmed' } })).status, 404);
  assert.equal((await call('admin/order', { method: 'POST', body: { id: o.id, status: 'zzz' } })).status, 400);
});

test('/admin buyrug\'i admin panel tugmasini yuboradi', async () => {
  calls.length = 0;
  const hook = (from) => BOT(new Request('https://shop.test/tg', { method: 'POST', body: JSON.stringify({ message: { chat: { id: from }, from: { id: from }, text: '/admin' } }), headers: { 'x-telegram-bot-api-secret-token': 'sec' } }));
  await hook(999);
  const btn = calls.find((c) => c.method === 'sendMessage' && c.reply_markup?.inline_keyboard?.[0]?.[0]?.web_app);
  assert.equal(btn.reply_markup.inline_keyboard[0][0].web_app.url, 'https://shop.test/admin.html');
  calls.length = 0; await hook(111);
  assert.equal(calls.some((c) => c.reply_markup?.inline_keyboard?.[0]?.[0]?.web_app), false); // oddiy foydalanuvchiga yo'q
});

async function shopCatalog() { return J('catalog'); }

test('ombor uzilsa: katalog eski nusxadan beriladi, health 503, buyurtma xato; tiklangach hammasi ishlaydi', async () => {
  assert.equal((await call('catalog')).status, 200);               // oxirgi yaxshi nusxa xotirada
  assert.equal((await J('health')).ok, true);
  process.env.STORE_FAIL = '1';
  try {
    const cat = await call('catalog');
    assert.equal(cat.status, 200);                                  // ombor ishlamasa ham do'kon bo'sh emas
    assert.ok((await cat.json()).products.length >= 5);
    const h = await call('health'); assert.equal(h.status, 503);
    assert.match((await h.json()).error, /boom/);                   // sababi ko'rinadi
    const ord = await call('order', { method: 'POST', id: 111, body: { name: 'Ali', phone: '901234567', delivery: 'pickup', payment: 'cash', items: [{ id: 6, qty: 1 }] } });
    assert.equal(ord.status, 500);                                  // buyurtma yozilmaydi, lekin server qulamaydi
    assert.ok((await ord.json()).error);
  } finally { delete process.env.STORE_FAIL; }
  assert.equal((await call('health')).status, 200);                 // tiklandi
  const ok = await call('order', { method: 'POST', id: 111, body: { name: 'Ali', phone: '901234567', delivery: 'pickup', payment: 'cash', items: [{ id: 6, qty: 1 }] } });
  assert.equal(ok.status, 200);
});
