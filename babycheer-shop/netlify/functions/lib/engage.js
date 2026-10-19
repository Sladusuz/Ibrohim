// Mijozlar bilan aloqa: foydalanuvchilar ro'yxati, til, "mavjud bo'lganda xabar bering", ommaviy xabar, CSV eksport.
import * as store from './store.js';
import { safe, apiForm, esc } from './tg.js';
import { ShopError, getCatalog, recentOrders, orderNo, money } from './shop.js';

const known = new Set(); // bu nusxada allaqachon ro'yxatga olinganlar (ortiqcha yozuvlarni oldini oladi)

export async function trackUser(user) {
  if (!user || known.has(user.id)) return;
  known.add(user.id);
  await store.update('users', (l) => (l.includes(user.id) ? l : [...l, user.id]), []);
}

export const getLang = async (uid) => (await store.get(`lang:${uid}`)) || null;
export const setLang = (uid, lang) => store.put(`lang:${uid}`, lang === 'ru' ? 'ru' : 'uz');

let shopUrl = null;
export async function rememberShopUrl(url) {
  if (!url || shopUrl === url) return;
  shopUrl = url;
  await store.put('meta', { url });
}
export async function getShopUrl() {
  shopUrl ??= process.env.SHOP_URL || (await store.get('meta'))?.url || null;
  return shopUrl;
}

// ---------- "mavjud bo'lganda xabar bering" ----------
export async function subscribeNotify(user, pid) {
  const c = await getCatalog();
  const p = c.products.find((x) => x.id === Number(pid) && x.active);
  if (!p) throw new ShopError('Mahsulot topilmadi');
  if (p.stock > 0) throw new ShopError('Mahsulot hozir mavjud');
  await store.update(`notify:${p.id}`, (l) => (l.includes(user.id) ? l : [...l, user.id].slice(-500)), []);
  return true;
}

export async function fireBackInStock(pids) {
  if (!pids || !pids.length) return 0;
  const url = await getShopUrl(), c = await getCatalog();
  let sent = 0;
  for (const pid of pids) {
    const ids = (await store.get(`notify:${pid}`)) || [];
    const p = c.products.find((x) => x.id === pid);
    if (!ids.length || !p || !p.active || p.stock <= 0) continue;
    await store.put(`notify:${pid}`, []);
    for (const uid of ids.slice(0, 200)) {
      const ru = (await getLang(uid)) === 'ru';
      const title = ru && p.title_ru ? p.title_ru : p.title;
      await safe('sendMessage', {
        chat_id: uid, parse_mode: 'HTML',
        text: ru ? `✅ <b>${esc(title)}</b> снова в наличии!\n${money(p.price)}` : `✅ <b>${esc(title)}</b> yana mavjud!\n${money(p.price)}`,
        ...(url ? { reply_markup: { inline_keyboard: [[{ text: ru ? '🛍 Открыть' : "🛍 Ko'rish", web_app: { url: `${url}/#/p/${pid}` } }]] } } : {}),
      });
      sent++;
    }
  }
  return sent;
}

// ---------- ommaviy xabar (admin panel bo'laklab yuboradi: 20 tadan) ----------
export async function startBroadcast(by, { text, text_ru, pid }) {
  const t = String(text || '').trim();
  if (t.length < 3 || t.length > 1000) throw new ShopError("Xabar 3–1000 belgi bo'lsin");
  const ids = (await store.get('users')) || [];
  if (!ids.length) throw new ShopError("Hali mijozlar yo'q: ular botga yozganda ro'yxatga olinadi");
  const job = { id: Date.now(), by, text: t, text_ru: String(text_ru || '').trim().slice(0, 1000), pid: pid ? Number(pid) : null, ids, i: 0, sent: 0, failed: 0 };
  await store.put('bc:job', job);
  return { total: ids.length };
}

export async function stepBroadcast(limit = 20) {
  const job = await store.get('bc:job');
  if (!job) throw new ShopError("Faol ommaviy xabar yo'q");
  const url = await getShopUrl();
  const batch = job.ids.slice(job.i, job.i + limit);
  const results = await Promise.all(batch.map(async (uid) => {
    const ru = (await getLang(uid)) === 'ru' && job.text_ru;
    const r = await safe('sendMessage', {
      chat_id: uid, parse_mode: 'HTML', text: esc(ru ? job.text_ru : job.text),
      ...(job.pid && url ? { reply_markup: { inline_keyboard: [[{ text: ru ? '🛍 Открыть' : "🛍 Ko'rish", web_app: { url: `${url}/#/p/${job.pid}` } }]] } } : {}),
    });
    return !!r;
  }));
  job.i += batch.length; job.sent += results.filter(Boolean).length; job.failed += results.filter((x) => !x).length;
  const done = job.i >= job.ids.length;
  await store.put('bc:job', done ? { ...job, ids: [] } : job);
  return { total: job.ids.length || job.i, i: job.i, sent: job.sent, failed: job.failed, done };
}

// ---------- CSV eksport ----------
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export function ordersCsv(orders) {
  const head = ['Raqam', 'Sana', 'Holat', "To'langan", 'Ism', 'Telefon', 'Yetkazish', 'Manzil', "To'lov", 'Mahsulotlar', 'Yetkazish narxi', 'Chegirma', 'Promokod', 'Jami'];
  const rows = orders.map((o) => [orderNo(o.id), o.created_at, o.status, o.paid ? 'ha' : "yo'q", o.name, o.phone, o.delivery, o.address, o.payment, o.items.map((i) => `${i.title}${i.color ? ` (${i.color})` : ''} x${i.qty}`).join(' | '), o.delivery_fee, o.discount || 0, o.promo || '', o.total]);
  return '﻿' + [head, ...rows].map((r) => r.map(q).join(';')).join('\r\n');
}

export async function sendOrdersCsv(chatId) {
  const orders = await recentOrders(200);
  if (!orders.length) throw new ShopError("Buyurtma yo'q");
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('caption', `📊 Buyurtmalar hisoboti (${orders.length} ta)`);
  form.append('document', new Blob([ordersCsv(orders)], { type: 'text/csv' }), `buyurtmalar-${new Date().toISOString().slice(0, 10)}.csv`);
  await apiForm('sendDocument', form);
  return orders.length;
}
