// Admin API (/api/admin/*): faqat ADMIN_IDS dagi Telegram foydalanuvchilar.
import { randomBytes } from 'node:crypto';
import * as shop from './shop.js';
import * as store from './store.js';
import { safe, isAdminId, isOwnerId, ownerIds } from './tg.js';
import * as admins from './admins.js';
import { statusMessage } from './botui.js';
import * as reviews from './reviews.js';
import * as engage from './engage.js';
import { msg } from './msgs.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const bad = (msg, status = 400) => json({ error: msg }, status);

const int = (v, min = 0, max = 1e10) => {
  const n = Number(String(v).replace(/\s/g, ''));
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const text = (v, max) => String(v ?? '').trim().slice(0, max);
const ICONS = ['car', 'stroller', 'trike', 'moto', 'scooter'];
const BANNER_COLORS = ['blue', 'orange', 'green', 'pink', 'purple'];
const age = (v) => { if (v === '' || v == null) return null; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 && n <= 18 ? n : undefined; };

export const isAdmin = (user) => !!user && isAdminId(user.id);

const fullOrder = (o) => ({ ...o, no: shop.orderNo(o.id) });

export async function adminApi(route, req, user) {
  if (!(await isAdmin(user))) return bad('Ruxsat yo\'q', 403);
  const owner = isOwnerId(user.id);
  const body = req.method === 'POST' && route !== 'admin/upload' ? await req.json().catch(() => null) : null;

  if (req.method === 'GET' && route === 'admin/state') {
    const c = await shop.getCatalog();
    return json({
      settings: c.settings,
      categories: [...c.categories].sort((a, b) => a.sort - b.sort),
      products: [...c.products].sort((a, b) => a.sort - b.sort),
      orders: (await shop.recentOrders(100)).map(fullOrder),
      payments: shop.paymentMethods(c.settings),
      banners: c.banners || [], promos: c.promos || [],
      reviews: await reviews.recentReviews().catch(() => []),
      owner,
      admins: owner ? [...ownerIds().map((id) => ({ id, owner: true, name: id === user.id ? 'Siz' : '' })), ...(await admins.listAdmins())] : undefined,
    });
  }

  if (req.method === 'POST' && route === 'admin/upload') {
    const type = (req.headers.get('content-type') || '').split(';')[0];
    if (!/^image\/(jpeg|png|webp)$/.test(type)) return bad('Faqat JPEG, PNG yoki WEBP rasm');
    const bytes = new Uint8Array(await req.arrayBuffer());
    if (!bytes.length || bytes.length > 3_000_000) return bad('Rasm hajmi 3 MB dan oshmasin');
    const id = 'img_' + randomBytes(9).toString('base64url');
    await store.putBinary(id, bytes, type);
    return json({ photo: id });
  }

  if (req.method !== 'POST' || !body) return bad('Topilmadi', 404);

  if (route === 'admin/invite') {
    if (!owner) return bad("Adminlarni faqat asosiy admin qo'sha oladi", 403);
    return json({ link: await admins.createInvite(user.id) });
  }
  if (route === 'admin/admin/remove') {
    if (!owner) return bad("Adminlarni faqat asosiy admin olib tashlay oladi", 403);
    return (await admins.removeAdmin(body.id)) ? json({ ok: true }) : bad('Admin topilmadi (asosiy adminni olib tashlab bo\'lmaydi)');
  }

  if (route === 'admin/product') {
    const title = text(body.title, 120), price = int(body.price, 1), old = int(body.old_price ?? 0), stock = int(body.stock ?? 0);
    if (title.length < 2) return bad('Nomini kiriting');
    if (price === null) return bad("Narx noto'g'ri");
    if (old === null) return bad("Eski narx noto'g'ri");
    if (stock === null) return bad("Ombor soni noto'g'ri");
    const colors = (Array.isArray(body.colors) ? body.colors : []).slice(0, 20)
      .map((c) => ({ name: text(c.name, 30), hex: /^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : '#7d8594' })).filter((c) => c.name);
    const specs = {};
    for (const [k, v] of Object.entries(body.specs && typeof body.specs === 'object' ? body.specs : {}).slice(0, 20)) {
      const key = text(k, 40), val = text(v, 120);
      if (key && val) specs[key] = val;
    }
    const rawImages = Array.isArray(body.images) ? body.images : body.photo ? [body.photo] : [];
    const images = [...new Set(rawImages.map(String))].slice(0, 6);
    if (images.some((id) => !/^[\w-]{10,200}$/.test(id))) return bad("Rasm noto'g'ri");
    const photo = images[0] || null;
    const amin = age(body.age_min), amax = age(body.age_max);
    if (amin === undefined || amax === undefined) return bad("Yosh 0 dan 18 gacha bo'lsin");
    if (amin != null && amax != null && amin > amax) return bad("Yosh oralig'i noto'g'ri");
    let saved = null, err = null;
    const back = [];
    await shop.updateCatalog((c) => {
      back.length = 0;
      const cat = c.categories.find((x) => x.id === Number(body.category_id));
      if (!cat) { err = 'Kategoriyani tanlang'; return c; }
      const fields = {
        category_id: cat.id, title, price, old_price: old, stock, colors, specs, photo, images,
        badge: text(body.badge, 24), short: text(body.short, 160), description: text(body.description, 2000),
        featured: !!body.featured, active: body.active !== false, age_min: amin, age_max: amax,
        title_ru: text(body.title_ru, 120), short_ru: text(body.short_ru, 160), description_ru: text(body.description_ru, 2000),
      };
      if (body.video === null) fields.video = null; // video botdan /video buyrug'i bilan qo'shiladi
      const p = body.id ? c.products.find((x) => x.id === Number(body.id)) : null;
      if (body.id && !p) { err = 'Mahsulot topilmadi'; return c; }
      if (p) { if (p.stock === 0 && fields.stock > 0 && fields.active) back.push(p.id); Object.assign(p, fields); }
      else { saved = { id: c.nextProductId++, brand: 'BabyCheer', sort: 100 + c.nextProductId, sold: 0, ...fields }; c.products.push(saved); }
      saved = p || saved;
      return c;
    });
    if (!err && back.length) await engage.fireBackInStock(back);
    return err ? bad(err) : json({ product: saved });
  }

  if (route === 'admin/product/patch') { // ro'yxatdan tezkor o'zgartirish: ombor, narx, ko'rinish
    const id = Number(body.id), upd = {};
    if ('stock' in body) { const n = int(body.stock); if (n === null) return bad("Ombor soni noto'g'ri"); upd.stock = n; }
    if ('price' in body) { const n = int(body.price, 1); if (n === null) return bad("Narx noto'g'ri"); upd.price = n; }
    if ('active' in body) upd.active = !!body.active;
    let saved = null, was = null;
    await shop.updateCatalog((c) => { const p = c.products.find((x) => x.id === id); if (p) { was = p.stock; Object.assign(p, upd); saved = p; } return c; });
    if (saved && was === 0 && saved.stock > 0 && saved.active) await engage.fireBackInStock([id]);
    return saved ? json({ product: saved }) : bad('Mahsulot topilmadi');
  }

  if (route === 'admin/product/delete') {
    let found = false;
    await shop.updateCatalog((c) => { const n = c.products.length; c.products = c.products.filter((p) => p.id !== Number(body.id)); found = c.products.length < n; return c; });
    return found ? json({ ok: true }) : bad('Mahsulot topilmadi');
  }

  if (route === 'admin/category') {
    const name = text(body.name, 40);
    if (name.length < 2) return bad('Nomini kiriting');
    const icon = ICONS.includes(body.icon) ? body.icon : 'car';
    let saved = null, err = null;
    await shop.updateCatalog((c) => {
      if (c.categories.some((x) => x.name.toLowerCase() === name.toLowerCase() && x.id !== Number(body.id))) { err = 'Bunday kategoriya bor'; return c; }
      const cat = body.id ? c.categories.find((x) => x.id === Number(body.id)) : null;
      if (body.id && !cat) { err = 'Kategoriya topilmadi'; return c; }
      const name_ru = text(body.name_ru, 40);
      if (cat) Object.assign(cat, { name, icon, name_ru });
      else c.categories.push({ id: c.nextCategoryId++, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, name_ru, icon, sort: 50 + c.nextCategoryId });
      saved = cat || c.categories.at(-1);
      return c;
    });
    return err ? bad(err) : json({ category: saved });
  }

  if (route === 'admin/category/delete') {
    let err = null;
    await shop.updateCatalog((c) => {
      if (c.products.some((p) => p.category_id === Number(body.id))) { err = "Kategoriyada mahsulot bor: avval ularni ko'chiring yoki o'chiring"; return c; }
      c.categories = c.categories.filter((x) => x.id !== Number(body.id));
      return c;
    });
    return err ? bad(err) : json({ ok: true });
  }

  if (route === 'admin/order') {
    const id = int(body.id, 1);
    let o;
    try {
      o = await shop.getOrder(id);
      if (!o) return bad('Buyurtma topilmadi', 404);
      if (body.status && body.status !== o.status) {
        o = await shop.setStatus(id, body.status);
        await safe('sendMessage', { chat_id: o.user_id, text: statusMessage(o) });
        if (o.__back) await engage.fireBackInStock(o.__back);
      }
      if (typeof body.paid === 'boolean' && body.paid !== o.paid) {
        o = body.paid ? await shop.markPaid(id) : await shop.setPaid(id, false);
        if (o.paid) await safe('sendMessage', { chat_id: o.user_id, text: msg(o.lang).paidOk(shop.orderNo(o.id)) });
      }
    } catch (e) {
      if (e instanceof shop.ShopError) return bad(e.message);
      throw e;
    }
    return json({ order: fullOrder(o) });
  }

  if (route === 'admin/banner') {
    const title = text(body.title, 60);
    if (title.length < 2) return bad('Sarlavhani kiriting');
    const ttype = ['none', 'category', 'product', 'url'].includes(body.target_type) ? body.target_type : 'none';
    let target = '';
    if (ttype === 'url') { target = text(body.target, 300); if (!/^https:\/\//.test(target)) return bad('Havola https:// bilan boshlansin'); }
    else if (ttype !== 'none') { target = String(int(body.target, 1) ?? ''); if (!target) return bad('Mahsulot/kategoriyani tanlang'); }
    let saved = null, err = null;
    await shop.updateCatalog((c) => {
      c.banners ||= [];
      const row = { title, text: text(body.text, 140), title_ru: text(body.title_ru, 60), text_ru: text(body.text_ru, 140), color: BANNER_COLORS.includes(body.color) ? body.color : 'blue', target_type: ttype, target, active: body.active !== false };
      const cur = body.id ? c.banners.find((x) => x.id === Number(body.id)) : null;
      if (body.id && !cur) { err = 'Banner topilmadi'; return c; }
      if (cur) Object.assign(cur, row);
      else { if (c.banners.length >= 10) { err = "Bannerlar 10 tadan oshmasin"; return c; } c.nextBannerId ||= 1; c.banners.push({ id: c.nextBannerId++, ...row }); }
      saved = cur || c.banners.at(-1);
      return c;
    });
    return err ? bad(err) : json({ banner: saved });
  }
  if (route === 'admin/banner/delete') {
    let found = false;
    await shop.updateCatalog((c) => { const n = (c.banners || []).length; c.banners = (c.banners || []).filter((x) => x.id !== Number(body.id)); found = c.banners.length < n; return c; });
    return found ? json({ ok: true }) : bad('Banner topilmadi');
  }

  if (route === 'admin/promo') {
    const code = String(body.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return bad("Kod 3–20 ta lotin harf yoki raqam bo'lsin");
    const percent = int(body.percent || 0, 0, 90), amount = int(body.amount || 0), min = int(body.min || 0), max = int(body.max || 0);
    if (percent === null || amount === null || min === null || max === null) return bad("Qiymatlar noto'g'ri");
    if (!percent && !amount) return bad('Foiz (1–90) yoki summani kiriting');
    if (percent && amount) return bad('Faqat bittasini kiriting: foiz yoki summa');
    let expires = null;
    if (body.expires) { const d = new Date(`${String(body.expires).slice(0, 10)}T23:59:59`); if (Number.isNaN(d.getTime())) return bad("Sana noto'g'ri"); expires = d.toISOString(); }
    let saved = null;
    await shop.updateCatalog((c) => {
      c.promos ||= [];
      const cur = c.promos.find((x) => String(x.code).toUpperCase() === code);
      const row = { code, percent, amount, min, max, expires, active: body.active !== false };
      if (cur) Object.assign(cur, row); else c.promos.push({ ...row, uses: 0 });
      saved = cur || c.promos.at(-1);
      return c;
    });
    return json({ promo: saved });
  }
  if (route === 'admin/promo/delete') {
    let found = false;
    await shop.updateCatalog((c) => { const n = (c.promos || []).length; c.promos = (c.promos || []).filter((x) => String(x.code).toUpperCase() !== String(body.code).toUpperCase()); found = c.promos.length < n; return c; });
    return found ? json({ ok: true }) : bad('Promokod topilmadi');
  }

  if (route === 'admin/review/delete') {
    return (await reviews.deleteReview(body.pid, String(body.id))) ? json({ ok: true }) : bad('Fikr topilmadi');
  }

  if (route === 'admin/broadcast/start' || route === 'admin/broadcast/step' || route === 'admin/export') {
    if (!owner) return bad("Bu amalni faqat asosiy admin bajara oladi", 403);
    try {
      if (route === 'admin/broadcast/start') return json(await engage.startBroadcast(user.id, body));
      if (route === 'admin/broadcast/step') return json(await engage.stepBroadcast(20));
      return json({ ok: true, count: await engage.sendOrdersCsv(user.id) });
    } catch (e) {
      if (e instanceof shop.ShopError) return bad(e.message);
      throw e;
    }
  }

  if (route === 'admin/settings') {
    const numeric = { regionFee: [0, 1e8] };
    const strings = { name: 40, phone: 30, telegram: 60, channel: 200, instagram: 200 };
    const patch = {};
    for (const [k, [min, max]] of Object.entries(numeric)) if (k in body) { const n = int(body[k], min, max); if (n === null) return bad(`${k}: noto'g'ri son`); patch[k] = n; }
    for (const [k, max] of Object.entries(strings)) if (k in body) { const v = text(body[k], max); if (!v) return bad(`${k} bo'sh bo'lmasin`); patch[k] = k === 'telegram' ? v.replace(/^@/, '') : v; }
    if (body.installment && typeof body.installment === 'object') {
      const months = int(body.installment.months ?? 6, 2, 24), markup = int(body.installment.markup ?? 0, 0, 100);
      if (months === null || markup === null) return bad("Muddatli to'lov: 2–24 oy, ustama 0–100%");
      patch.installment = { enabled: !!body.installment.enabled, months, markup };
    }
    let out;
    await shop.updateCatalog((c) => { Object.assign(c.settings, patch); out = c.settings; return c; });
    return json({ settings: out });
  }

  return bad('Topilmadi', 404);
}
