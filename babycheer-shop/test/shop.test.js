import { test, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.STORE_MEMORY = '1';
process.env.CARD_NUMBER = '8600 0000 0000 0000';
const shop = await import('../netlify/functions/lib/shop.js');
const store = await import('../netlify/functions/lib/store.js');
const user = { id: 111 };
const base = { name: 'Ali', phone: '90 123 45 67', delivery: 'courier', address: 'Toshkent, Chilonzor', payment: 'cash', items: [{ id: 2, qty: 2, color: 'Qizil' }] };

before(() => store._resetMemory());

test('katalog Market ma\'lumotlari bilan to\'ladi', async () => {
  const c = await shop.publicCatalog();
  assert.equal(c.categories.length, 5);
  assert.equal(c.products.length, 10);
  assert.equal(c.settings.regionFee, 0);
  assert.equal('freeFrom' in c.settings || 'warrantyMonths' in c.settings, false);
  assert.equal(JSON.stringify(c).toLowerCase().includes('kafolat'), false, 'kafolat hech qayerda yo\'q');
  assert.deepEqual(c.settings.payments.map((p) => p.id), ['cash', 'card', 'transfer']);
});

test('buyurtma: narx serverda, ombor kamayadi, Toshkent bo\'ylab yetkazish bepul', async () => {
  const o = await shop.createOrder(user, { ...base, items: [{ id: 2, qty: 2, color: 'Qizil', price: 1 }] });
  assert.equal(o.total, 4900000);
  assert.equal(o.delivery_fee, 0);
  assert.equal(shop.orderNo(o.id), 'BC-1001');
  assert.equal((await shop.getCatalog()).products.find((p) => p.id === 2).stock, 12);
});

test("yetkazish: Toshkent va olib ketish bepul, O'zbekiston bo'ylab narx sozlanadi (0 = kelishiladi)", async () => {
  const cheap = { id: 9, qty: 1, color: 'Pushti' };
  const a = await shop.createOrder(user, { ...base, items: [cheap] });
  assert.equal(a.delivery_fee, 0); assert.equal(a.total, 390000);                       // arzon buyurtma ham Toshkentda bepul
  const r0 = await shop.createOrder(user, { ...base, delivery: 'region', address: 'Samarqand, Registon 1', items: [cheap] });
  assert.equal(r0.delivery_fee, 0); assert.match(shop.orderText(r0), /kelishiladi/);     // viloyat: narx hali kelishilmagan
  await shop.updateCatalog((c) => { c.settings.regionFee = 30000; return c; });
  const r1 = await shop.createOrder(user, { ...base, delivery: 'region', address: 'Samarqand, Registon 1', items: [cheap] });
  assert.equal(r1.delivery_fee, 30000); assert.equal(r1.total, 420000);
  assert.deepEqual(shop.invoicePrices(r1).at(-1), { label: 'Yetkazib berish', amount: 3000000 });
  const b = await shop.createOrder(user, { ...base, delivery: 'pickup', address: '', items: [{ id: 9, qty: 1 }] });
  assert.equal(b.delivery_fee, 0);
  assert.equal(b.items[0].color, "To'q sariq"); // noma'lum rang -> birinchi rang
  await assert.rejects(() => shop.createOrder(user, { ...base, delivery: 'region', address: '', items: [cheap] }), /Manzil/);
  await assert.rejects(() => shop.createOrder(user, { ...base, delivery: 'zzz', items: [cheap] }), /Yetkazish/);
  await shop.updateCatalog((c) => { c.settings.regionFee = 0; return c; });
});

test('ombordan ortiq va noto\'g\'ri ma\'lumot rad etiladi', async () => {
  await assert.rejects(() => shop.createOrder(user, { ...base, items: [{ id: 1, qty: 99 }] }), /omborda yetarli emas/);
  await assert.rejects(() => shop.createOrder(user, { ...base, phone: '12' }), /Telefon/);
  await assert.rejects(() => shop.createOrder(user, { ...base, payment: 'online' }), /To'lov/); // token yo'q
  await assert.rejects(() => shop.createOrder(user, { ...base, items: [] }), /Savat/);
  await assert.rejects(() => shop.createOrder(user, { ...base, items: [{ id: 999, qty: 1 }] }), /topilmadi/);
});

test('bir vaqtdagi buyurtmalar ombordan oshib ketmaydi', async () => {
  const stock = (await shop.getCatalog()).products.find((p) => p.id === 4).stock; // 6
  const tries = await Promise.allSettled(Array.from({ length: stock + 4 }, () => shop.createOrder(user, { ...base, items: [{ id: 4, qty: 1 }] })));
  assert.equal(tries.filter((t) => t.status === 'fulfilled').length, stock);
  assert.equal((await shop.getCatalog()).products.find((p) => p.id === 4).stock, 0);
});

test('bekor qilinsa ombor qaytadi; kuzatish raqam+telefon bilan', async () => {
  const before = (await shop.getCatalog()).products.find((p) => p.id === 2).stock;
  await shop.setStatus(1, 'cancelled');
  assert.equal((await shop.getCatalog()).products.find((p) => p.id === 2).stock, before + 2);
  await shop.setStatus(1, 'cancelled');
  assert.equal((await shop.getCatalog()).products.find((p) => p.id === 2).stock, before + 2); // ikki marta qaytmaydi
  assert.ok(await shop.findOrder('bc-1001', '+998 90 123 45 67'));
  assert.equal(await shop.findOrder('BC-1001', '991112233'), null);
  assert.ok((await shop.userOrders(111)).length >= 3);
  assert.ok(shop.orderText(await shop.getOrder(1)).includes('BC-1001'));
});

test("eski ma'lumot (kafolat, 1 mln chegarasi) avtomatik tozalanadi", async () => {
  store._resetMemory();
  const seed = await import('../netlify/functions/lib/seed.js');
  const old = { settings: { ...seed.SEED_SETTINGS, freeFrom: 1000000, deliveryFee: 40000, warrantyMonths: 6 }, categories: seed.SEED_CATEGORIES, products: seed.SEED_PRODUCTS.map((p) => ({ ...p, specs: { ...p.specs, Kafolat: '6 oy' } })), nextProductId: 11, nextCategoryId: 6 };
  delete old.settings.regionFee;
  await store.put('catalog', old);
  const c = await shop.publicCatalog();
  assert.equal(JSON.stringify(c).toLowerCase().includes('kafolat'), false);
  assert.equal(c.settings.regionFee, 0); assert.equal('freeFrom' in c.settings, false);
  const saved = await store.get('catalog');                                                // bazadan ham tozalangan
  assert.equal(JSON.stringify(saved).toLowerCase().includes('kafolat'), false); assert.equal('deliveryFee' in saved.settings, false);
});
