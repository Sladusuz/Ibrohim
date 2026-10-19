import * as store from './store.js';
import { SEED_SETTINGS, SEED_CATEGORIES, SEED_PRODUCTS, COLOR_HEX, FAQ } from './seed.js';
import { AGES, RU_CATEGORIES, RU_PRODUCTS, FAQ_RU, DEFAULT_INSTALLMENT } from './seed_extra.js';
import { esc, botUsername } from './tg.js';

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
// mijozga ruscha xabarlar uchun yorliqlar (admin xabarlari doim o'zbekcha)
export const STATUSES_RU = { new: '🆕 Новый', confirmed: '✅ Подтверждён', shipping: '🚚 В пути', delivered: '🎉 Доставлен', cancelled: '❌ Отменён' };
const DELIVERY_RU = { courier: '🚚 По Ташкенту (бесплатно)', region: '📦 По Узбекистану', pickup: '🏬 Самовывоз (бесплатно)' };
export const PAY_LABEL = { cash: 'Naqd', card: 'Karta (terminal)', online: 'Onlayn (Click / Payme)', transfer: "Karta o'tkazmasi", installment: "Muddatli to'lov" };
const PAY_RU = { cash: 'Наличные', card: 'Карта (терминал)', online: 'Онлайн (Click / Payme)', transfer: 'Перевод на карту', installment: 'Рассрочка' };
export const langOf = (code) => (String(code || '').toLowerCase().startsWith('ru') ? 'ru' : 'uz');

/** Yoqilgan to'lov usullari. Onlayn va o'tkazma faqat sozlangan bo'lsa chiqadi. */
export function paymentMethods(settings) {
  const list = [
    { id: 'cash', label: 'Naqd', hint: 'Qabul qilganda' },
    { id: 'card', label: 'Karta', hint: 'Qabul qilganda, terminal orqali' },
  ];
  if (process.env.PAYMENT_PROVIDER_TOKEN) list.push({ id: 'online', label: 'Onlayn (Click / Payme)', hint: 'Telegram ichida to\'lang' });
  if (process.env.CARD_NUMBER) list.push({ id: 'transfer', label: "Karta o'tkazmasi", hint: "Kartaga o'tkazib, chekni yuborasiz" });
  if (settings && settings.installment && settings.installment.enabled) list.push({ id: 'installment', label: "Muddatli to'lov", hint: "Operator siz bilan bog'lanib shartlarni kelishadi" });
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
  if (!c.settings.installment) { c.settings.installment = { ...DEFAULT_INSTALLMENT }; changed = true; }
  if (!Array.isArray(c.banners)) { c.banners = []; changed = true; }
  if (!Array.isArray(c.promos)) { c.promos = []; changed = true; }
  const seedById = Object.fromEntries(SEED_PRODUCTS.map((p) => [p.id, p]));
  for (const cat of c.categories) {
    if (!('name_ru' in cat)) { cat.name_ru = SEED_CATEGORIES.find((x) => x.id === cat.id)?.name === cat.name ? RU_CATEGORIES[cat.id] || '' : ''; changed = true; }
  }
  for (const p of c.products) { // ruscha matn va yosh: faqat o'zgartirilmagan boshlang'ich mahsulotlarga
    const same = seedById[p.id] && seedById[p.id].title === p.title;
    if (!('age_min' in p)) { const a = (same && AGES[p.id]) || [null, null]; p.age_min = a[0]; p.age_max = a[1]; changed = true; }
    if (typeof p.sold !== 'number') { p.sold = 0; changed = true; }
    if (!('title_ru' in p)) { const r = same ? RU_PRODUCTS[p.id] : null; p.title_ru = r ? r[0] : ''; p.short_ru = r ? r[1] : ''; p.description_ru = r ? r[2] : ''; changed = true; }
  }
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
  const ratings = (await store.get('ratings').catch(() => null)) || {};
  return {
    settings: { ...c.settings, payments: paymentMethods(c.settings), botUsername: await botUsername() },
    categories: [...c.categories].sort((a, b) => a.sort - b.sort),
    products: c.products.filter((p) => p.active).sort((a, b) => a.sort - b.sort).map((p) => ({
      ...p, images: imagesOf(p), rating: ratings[p.id] && ratings[p.id].count ? { avg: Math.round((ratings[p.id].sum / ratings[p.id].count) * 10) / 10, count: ratings[p.id].count } : null,
    })),
    banners: (c.banners || []).filter((x) => x.active !== false),
    faq: FAQ,
    faq_ru: FAQ_RU,
  };
}

// ---------- promokod ----------
export function checkPromo(c, code, subtotal) {
  const key = String(code || '').trim().toUpperCase();
  if (!key) return null;
  const p = (c.promos || []).find((x) => String(x.code).toUpperCase() === key);
  if (!p || p.active === false) throw new ShopError('Promokod topilmadi');
  if (p.expires && new Date(p.expires).getTime() < Date.now()) throw new ShopError('Promokod muddati tugagan');
  if (p.max && (p.uses || 0) >= p.max) throw new ShopError('Promokod limiti tugagan');
  if (p.min && subtotal < p.min) throw new ShopError(`Promokod ${money(p.min)} dan yuqori buyurtmalarga amal qiladi`);
  const raw = p.percent ? Math.floor((subtotal * p.percent) / 100) : Number(p.amount) || 0;
  return { promo: p, discount: Math.max(0, Math.min(raw, subtotal)) };
}

/** Savatdagi mahsulotlar uchun promokod chegirmasini (server narxlari bo'yicha) hisoblaydi. */
export async function promoPreview(code, items) {
  const c = await getCatalog();
  const sub = (Array.isArray(items) ? items : []).reduce((s, it) => {
    const p = c.products.find((x) => x.id === Number(it.id) && x.active);
    return s + (p ? p.price * Math.max(1, Math.floor(Number(it.qty) || 1)) : 0);
  }, 0);
  const r = checkPromo(c, code, sub);
  return r ? { code: r.promo.code, discount: r.discount, subtotal: sub } : null;
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
  const req = Array.isArray(d.items) ? d.items : [];
  if (!req.length || req.length > 50) throw new ShopError("Savat bo'sh");

  let lines = [];
  let fee = 0;
  let discount = 0;
  let promoCode = '';
  // ombor tekshiruvi va ayirish bitta atomik yozuvda (bir vaqtdagi buyurtmalar ombordan oshib ketmaydi)
  await updateCatalog((c) => {
    lines = []; discount = 0; promoCode = '';
    if (!paymentMethods(c.settings).some((m) => m.id === payment)) throw new ShopError("To'lov usulini tanlang");
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
    for (const [pid, qty] of perProduct) { const p = c.products.find((x) => x.id === pid); p.stock -= qty; p.sold = (p.sold || 0) + qty; }
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
    fee = deliveryFee(c.settings, sub, delivery);
    const pr = d.promo ? checkPromo(c, d.promo, sub) : null; // yaroqsiz promokod xato beradi, ombor o'zgarmaydi
    if (pr) { discount = pr.discount; promoCode = pr.promo.code; pr.promo.uses = (pr.promo.uses || 0) + 1; }
    return c;
  });

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const counter = await store.update('counter', (c) => ({ n: (c?.n || 0) + 1 }), { n: 0 });
  const order = {
    id: counter.n, user_id: user.id, name, phone, address, comment, delivery, payment, paid: false,
    items: lines, subtotal, delivery_fee: fee, discount, promo: promoCode, total: Math.max(0, subtotal + fee - discount), status: 'new', created_at: new Date().toISOString(),
    lang: d.lang === 'ru' ? 'ru' : 'uz',
  };
  await store.put(`order:${order.id}`, order);
  await store.update(`uorders:${user.id}`, (a) => [order.id, ...a].slice(0, 50), []);
  await store.update('recent', (a) => [order.id, ...a].slice(0, 200), []);
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
  let back = [];
  if (status === 'cancelled' && was !== 'cancelled') back = await restock(o, +1);
  if (status !== 'cancelled' && was === 'cancelled') await restock(o, -1);
  o.status = status;
  await store.put(`order:${id}`, o);
  return back.length ? { ...o, __back: back } : o; // __back: yana mavjud bo'lgan mahsulotlar (saqlanmaydi)
}

/** Bekor qilinsa ombor va sotilgan soni qaytadi (sign=+1), tiklansa qayta ayriladi (sign=-1). Yana mavjud bo'lganlar ro'yxatini qaytaradi. */
async function restock(o, sign) {
  const back = [];
  await updateCatalog((c) => {
    back.length = 0;
    for (const l of o.items) {
      const p = c.products.find((x) => x.id === l.id);
      if (!p) continue;
      const was = p.stock;
      p.stock = Math.max(0, p.stock + sign * l.qty);
      p.sold = Math.max(0, (p.sold || 0) - sign * l.qty);
      if (sign > 0 && was === 0 && p.stock > 0) back.push(p.id);
    }
    if (o.promo) { const pr = (c.promos || []).find((x) => x.code === o.promo); if (pr) pr.uses = Math.max(0, (pr.uses || 0) - sign); }
    return c;
  });
  return back;
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
export function orderText(o, lang = 'uz') {
  const ru = lang === 'ru';
  const pay = (ru ? PAY_RU : PAY_LABEL)[o.payment] || o.payment;
  const items = o.items.map((i) => `• ${esc(i.title)}${i.color ? ` (${esc(i.color)})` : ''} × ${i.qty} = ${money(i.price * i.qty)}`).join('\n');
  const ship = o.delivery_fee ? money(o.delivery_fee) : o.delivery === 'region' ? (ru ? 'стоимость сообщит оператор' : 'narxi operator bilan kelishiladi') : ru ? 'бесплатно' : 'bepul';
  return (
    `<b>${ru ? 'Заказ' : 'Buyurtma'} ${orderNo(o.id)}</b> · ${(ru ? STATUSES_RU : STATUSES)[o.status]}\n` +
    `👤 ${esc(o.name)} · 📞 ${o.phone}\n` +
    `${(ru ? DELIVERY_RU : DELIVERY)[o.delivery]}${o.address ? `: ${esc(o.address)}` : ''}\n` +
    `${ru ? 'Оплата' : "To'lov"}: ${esc(pay)}${o.paid ? (ru ? ' · ✅ оплачено' : " · ✅ to'langan") : ''}\n` +
    (o.comment ? `💬 ${esc(o.comment)}\n` : '') +
    `\n${items}\n\n${ru ? 'Доставка' : 'Yetkazish'}: ${ship}\n` +
    (o.discount ? `${ru ? 'Скидка' : 'Chegirma'} (${esc(o.promo)}): −${money(o.discount)}\n` : '') +
    `<b>${ru ? 'Итого' : 'Jami'}: ${money(o.total)}</b>`
  );
}

export function invoicePrices(o) {
  const prices = o.items.map((i) => ({ label: `${i.title} × ${i.qty}`.slice(0, 60), amount: i.price * i.qty * 100 }));
  if (o.delivery_fee) prices.push({ label: 'Yetkazib berish / Доставка', amount: o.delivery_fee * 100 });
  if (o.discount) prices.push({ label: `Chegirma / Скидка (${o.promo})`.slice(0, 60), amount: -o.discount * 100 });
  return prices;
}

export { COLOR_HEX };

/** Tizim sog'ligi: ombor o'qiladimi. */
export async function health() {
  const t = Date.now();
  try { await store.get('counter'); return { ok: true, ms: Date.now() - t }; }
  catch (e) { return { ok: false, ms: Date.now() - t, error: `${e && e.name}: ${String((e && e.message) || e).slice(0, 200)}` }; }
}
