// Admin API (/api/admin/*): faqat ADMIN_IDS dagi Telegram foydalanuvchilar.
import { randomBytes } from 'node:crypto';
import * as shop from './shop.js';
import * as store from './store.js';
import { safe, adminIds } from './tg.js';
import { statusMessage } from './botui.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const bad = (msg, status = 400) => json({ error: msg }, status);

const int = (v, min = 0, max = 1e10) => {
  const n = Number(String(v).replace(/\s/g, ''));
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const text = (v, max) => String(v ?? '').trim().slice(0, max);
const ICONS = ['car', 'stroller', 'trike', 'moto', 'scooter'];

export const isAdmin = (user) => !!user && adminIds().includes(user.id);

const fullOrder = (o) => ({ ...o, no: shop.orderNo(o.id) });

export async function adminApi(route, req, user) {
  if (!isAdmin(user)) return bad('Ruxsat yo\'q', 403);
  const body = req.method === 'POST' && route !== 'admin/upload' ? await req.json().catch(() => null) : null;

  if (req.method === 'GET' && route === 'admin/state') {
    const c = await shop.getCatalog();
    return json({
      settings: c.settings,
      categories: [...c.categories].sort((a, b) => a.sort - b.sort),
      products: [...c.products].sort((a, b) => a.sort - b.sort),
      orders: (await shop.recentOrders(50)).map(fullOrder),
      payments: shop.paymentMethods(),
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
    const photo = body.photo ? String(body.photo) : null;
    if (photo && !/^[\w-]{10,200}$/.test(photo)) return bad("Rasm noto'g'ri");
    let saved = null, err = null;
    await shop.updateCatalog((c) => {
      const cat = c.categories.find((x) => x.id === Number(body.category_id));
      if (!cat) { err = 'Kategoriyani tanlang'; return c; }
      const fields = {
        category_id: cat.id, title, price, old_price: old, stock, colors, specs, photo,
        badge: text(body.badge, 24), short: text(body.short, 160), description: text(body.description, 2000),
        featured: !!body.featured, active: body.active !== false,
      };
      const p = body.id ? c.products.find((x) => x.id === Number(body.id)) : null;
      if (body.id && !p) { err = 'Mahsulot topilmadi'; return c; }
      if (p) Object.assign(p, fields);
      else { saved = { id: c.nextProductId++, brand: 'BabyCheer', sort: 100 + c.nextProductId, ...fields }; c.products.push(saved); }
      saved = p || saved;
      return c;
    });
    return err ? bad(err) : json({ product: saved });
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
      if (cat) Object.assign(cat, { name, icon });
      else c.categories.push({ id: c.nextCategoryId++, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, icon, sort: 50 + c.nextCategoryId });
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
      }
      if (typeof body.paid === 'boolean' && body.paid !== o.paid) {
        o = body.paid ? await shop.markPaid(id) : await shop.setPaid(id, false);
        if (o.paid) await safe('sendMessage', { chat_id: o.user_id, text: `💰 Buyurtma ${shop.orderNo(o.id)} uchun to'lov tasdiqlandi. Rahmat!` });
      }
    } catch (e) {
      if (e instanceof shop.ShopError) return bad(e.message);
      throw e;
    }
    return json({ order: fullOrder(o) });
  }

  if (route === 'admin/settings') {
    const numeric = { freeFrom: [0, 1e9], deliveryFee: [0, 1e8], warrantyMonths: [0, 120] };
    const strings = { name: 40, phone: 30, telegram: 60, channel: 200, instagram: 200 };
    const patch = {};
    for (const [k, [min, max]] of Object.entries(numeric)) if (k in body) { const n = int(body[k], min, max); if (n === null) return bad(`${k}: noto'g'ri son`); patch[k] = n; }
    for (const [k, max] of Object.entries(strings)) if (k in body) { const v = text(body[k], max); if (!v) return bad(`${k} bo'sh bo'lmasin`); patch[k] = k === 'telegram' ? v.replace(/^@/, '') : v; }
    let out;
    await shop.updateCatalog((c) => { Object.assign(c.settings, patch); out = c.settings; return c; });
    return json({ settings: out });
  }

  return bad('Topilmadi', 404);
}
