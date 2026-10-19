import * as store from './store.js';
import { SEED_SETTINGS, SEED_CATEGORIES, SEED_PRODUCTS, COLOR_HEX, FAQ } from './seed.js';
import { esc } from './tg.js';

export const STATUSES = {
  new: '🆕 Yangi',
  confirmed: '✅ Tasdiqlandi',
  shipping: '🚚 Yetkazilmoqda',
  delivered: '🎉 Yetkazildi',
  cancelled: '❌ Bekor qilindi',
};
// courier = Toshkent shahri bo'ylab (bepul), region = butun O'zbekiston bo'ylab, pickup = olib ketish
export const DELIVERY = { courier: "🚚 Toshkent bo'ylab (bepul)", region: "📦 O'zbekiston bo'ylab", pickup: '🏬 Olib ketish (bepul)' };
export const needsAddress = (d) => d === 'courier' || d === 'region';

/** Yoqilgan to'lov usullari. Onlayn va o'tkazma faqat sozlangan bo'lsa chiqadi. */
export function paymentMethods() {
  const list = [
    { id: 'cash', label: 'Naqd', hint: 'Qabul qilganda' },
    { id: 'card', label: 'Karta', hint: 'Qabul qilganda, terminal orqali' },
  ];
  if (process.env.PAYMENT_PROVIDER_TOKEN) list.push({ id: 'online', label: 'Onlayn (Click / Payme)', hint: 'Telegram ichida to\'lang' });
  if (process.env.CARD_NUMBER) list.push({ id: 'transfer', label: "Karta o'tkazmasi", hint: "Kartaga o'tkazib, chekni yuborasiz" });
  return list;
}

export const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
export const orderNo = (id) => `BC-${1000 + id}`;
export const normPhone = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  return d.length >= 9 ? '+998' + d.slice(-9) : '';
};

export class ShopError extends Error {}

/** Mahsulot rasmlari: yangi `images` ro'yxati yoki eski bitta `photo`. */
export const imagesOf = (p) => (Array.isArray(p.images) && p.images.length ? p.images : p.photo ? [p.photo] : []);

// ---------- katalog ----------
export async function getCatalog() {
  let c = await store.get('catalog');
  if (!c) {
    c = { settings: SEED_SETTINGS, categories: SEED_CATEGORIES, products: SEED_PRODUCTS, nextProductId: 11, nextCategoryId: 6 };
    await store.update('catalog', (cur) => cur ?? c);
    c = await store.get('catalog');
  }
  if (normalizeCatalog(c)) { // eski qoidalar (kafolat, 1 mln chegarasi) bazadan ham bir marta tozalanadi
    try { await store.update('catalog', (cur) => { if (cur) normalizeCatalog(cur); return cur; }); } catch (e) { console.warn('katalog moslash yozilmadi:', e.message); }
  }
  return c;
}

export const updateCatalog = (fn) => store.update('catalog', async (cur) => fn(cur ?? (await getCatalog())));

export function deliveryFee(settings, subtotal, delivery) {
  return delivery === 'region' ? Math.max(0, Number(settings.regionFee) || 0) : 0; // Toshkent va olib ketish: bepul
}

/** Eski ma'lumotni yangi qoidalarga moslaydi: kafolat va "1 mln dan bepul" olib tashlanadi. */
export function normalizeCatalog(c) {
  let changed = false;
  for (const k of ['freeFrom', 'deliveryFee', 'warrantyMonths']) if (k in c.settings) { delete c.settings[k]; changed = true; }
  if (typeof c.settings.regionFee !== 'number') { c.settings.regionFee = 0; changed = true; }
  for (const p of c.products) for (const k of Object.keys(p.specs || {})) if (/^kafolat$/i.test(k)) { delete p.specs[k]; changed = true; }
  return changed;
}

let lastGood = null; // oxirgi muvaffaqiyatli o'qilgan katalog: ombor vaqtincha ishlamasa, do'kon bo'sh qolmaydi

export async function publicCatalog() {
  let c;
  try { c = await getCatalog(); lastGood = c; } catch (e) {
    if (!lastGood) throw e;
    console.warn('katalog: ombor javob bermadi, oxirgi nusxa berildi:', e.message);
    c = lastGood;
  }
  return {
    settings: { ...c.settings, payments: paymentMethods() },
    categories: [...c.categories].sort((a, b) => a.sort - b.sort),
    products: c.products.filter((p) => p.active).sort((a, b) => a.sort - b.sort).map((p) => ({ ...p, images: imagesOf(p) })),
    faq: FAQ,
  };
}

// ---------- buyurtma ----------
export async function createOrder(user, d) {
  const name = String(d.name || '').trim().slice(0, 80);
  const phone = normPhone(d.phone);
  const delivery = d.delivery;
  const address = delivery === 'pickup' ? '' : String(d.address || '').trim().slice(0, 250);
  const comment = String(d.comment || '').trim().slice(0, 300);
  if (name.length < 2) throw new ShopError('Ismingizni kiriting');
  if (!phone) throw new ShopError("Telefon raqami noto'g'ri");
  if (!DELIVERY[delivery]) throw new ShopError('Yetkazish usulini tanlang');
  if (needsAddress(delivery) && address.length < 5) throw new ShopError('Manzilni kiriting');
  const payment = d.payment;
  if (!paymentMethods().some((m) => m.id === payment)) throw new ShopError("To'lov usulini tanlang");
  const req = Array.isArray(d.items) ? d.items : [];
  if (!req.length || req.length > 50) throw new ShopError("Savat bo'sh");

  let lines = [];
  let fee = 0;
  // ombor tekshiruvi va ayirish bitta atomik yozuvda (bir vaqtdagi buyurtmalar ombordan oshib ketmaydi)
  await updateCatalog((c) => {
    lines = [];
    const merged = new Map();
    for (const it of req) {
      const k = `${it.id}|${it.color || ''}`;
      merged.set(k, { id: Number(it.id), color: it.color || '', qty: (merged.get(k)?.qty || 0) + Math.floor(Number(it.qty)) });
    }
    const perProduct = new Map();
    for (const it of merged.values()) {
      const p = c.products.find((x) => x.id === it.id && x.active);
      if (!p || !(it.qty >= 1)) throw new ShopError('Mahsulot topilmadi');
      perProduct.set(p.id, (perProduct.get(p.id) || 0) + it.qty);
      if (perProduct.get(p.id) > p.stock) throw new ShopError(`«${p.title}» omborda yetarli emas (qoldi: ${p.stock})`);
      const color = p.colors.some((x) => x.name === it.color) ? it.color : p.colors[0]?.name || '';
      lines.push({ id: p.id, title: p.title, color, price: p.price, qty: it.qty });
    }
    for (const [pid, qty] of perProduct) c.products.find((x) => x.id === pid).stock -= qty;
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
    fee = deliveryFee(c.settings, sub, delivery);
    return c;
  });

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const counter = await store.update('counter', (c) => ({ n: (c?.n || 0) + 1 }), { n: 0 });
  const order = {
    id: counter.n, user_id: user.id, name, phone, address, comment, delivery, payment, paid: false,
    items: lines, subtotal, delivery_fee: fee, total: subtotal + fee, status: 'new', created_at: new Date().toISOString(),
  };
  await store.put(`order:${order.id}`, order);
  await store.update(`uorders:${user.id}`, (a) => [order.id, ...a].slice(0, 50), []);
  await store.update('recent', (a) => [order.id, ...a].slice(0, 50), []);
  return order;
}

export const getOrder = (id) => store.get(`order:${id}`);

export async function userOrders(userId) {
  const ids = (await store.get(`uorders:${userId}`)) || [];
  return (await Promise.all(ids.slice(0, 20).map(getOrder))).filter(Boolean);
}

export async function recentOrders(limit = 10) {
  const ids = (await store.get('recent')) || [];
  return (await Promise.all(ids.slice(0, limit).map(getOrder))).filter(Boolean);
}

export async function findOrder(no, phone) {
  const m = /^BC-(\d+)$/i.exec(String(no).trim());
  if (!m) return null;
  const o = await getOrder(Number(m[1]) - 1000);
  return o && normPhone(o.phone) === normPhone(phone) ? o : null;
}

export async function setStatus(id, status) {
  if (!STATUSES[status]) throw new ShopError("Noto'g'ri holat");
  const o = await getOrder(id);
  if (!o) throw new ShopError('Buyurtma topilmadi');
  const was = o.status;
  if (status === 'cancelled' && was !== 'cancelled') await restock(o, +1);
  if (status !== 'cancelled' && was === 'cancelled') await restock(o, -1);
  o.status = status;
  await store.put(`order:${id}`, o);
  return o;
}

async function restock(o, sign) {
  await updateCatalog((c) => {
    for (const l of o.items) {
      const p = c.products.find((x) => x.id === l.id);
      if (p) p.stock = Math.max(0, p.stock + sign * l.qty);
    }
    return c;
  });
}

export const setPaid = async (id, paid) => { const o = await getOrder(id); if (!o) throw new ShopError('Buyurtma topilmadi'); o.paid = !!paid; await store.put(`order:${id}`, o); return o; };

export async function markPaid(id) {
  const o = await getOrder(id);
  if (!o) throw new ShopError('Buyurtma topilmadi');
  o.paid = true;
  await store.put(`order:${id}`, o);
  return o;
}

// ---------- matnlar ----------
export function orderText(o) {
  const pay = paymentMethods().find((m) => m.id === o.payment)?.label || o.payment;
  const items = o.items.map((i) => `• ${esc(i.title)}${i.color ? ` (${esc(i.color)})` : ''} × ${i.qty} = ${money(i.price * i.qty)}`).join('\n');
  return (
    `<b>Buyurtma ${orderNo(o.id)}</b> · ${STATUSES[o.status]}\n` +
    `👤 ${esc(o.name)} · 📞 ${o.phone}\n` +
    `${DELIVERY[o.delivery]}${o.address ? `: ${esc(o.address)}` : ''}\n` +
    `To'lov: ${esc(pay)}${o.paid ? ' · ✅ to\'langan' : ''}\n` +
    (o.comment ? `💬 ${esc(o.comment)}\n` : '') +
    `\n${items}\n\nYetkazish: ${o.delivery_fee ? money(o.delivery_fee) : o.delivery === 'region' ? 'narxi operator bilan kelishiladi' : 'bepul'}\n<b>Jami: ${money(o.total)}</b>`
  );
}

export function invoicePrices(o) {
  const prices = o.items.map((i) => ({ label: `${i.title} × ${i.qty}`.slice(0, 60), amount: i.price * i.qty * 100 }));
  if (o.delivery_fee) prices.push({ label: 'Yetkazib berish', amount: o.delivery_fee * 100 });
  return prices;
}

export { COLOR_HEX };

/** Tizim sog'ligi: ombor o'qiladimi. */
export async function health() {
  const t = Date.now();
  try { await store.get('counter'); return { ok: true, ms: Date.now() - t }; }
  catch (e) { return { ok: false, ms: Date.now() - t, error: `${e && e.name}: ${String((e && e.message) || e).slice(0, 200)}` }; }
}
