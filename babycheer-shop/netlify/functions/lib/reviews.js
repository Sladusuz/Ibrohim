// Mijoz fikrlari va baholari: faqat yetkazilgan buyurtmadagi mahsulotga, bir marta.
import * as store from './store.js';
import { ShopError, getOrder } from './shop.js';

const publicReview = (r) => ({ id: r.id, name: r.name, rating: r.rating, text: r.text, at: r.at });

export async function addReview(user, { order_id, product_id, rating, text }) {
  const oid = Number(order_id), pid = Number(product_id), stars = Math.round(Number(rating));
  if (!(stars >= 1 && stars <= 5)) throw new ShopError('Bahoni tanlang (1–5)');
  const o = await getOrder(oid);
  if (!o || o.user_id !== user.id) throw new ShopError('Buyurtma topilmadi');
  if (o.status !== 'delivered') throw new ShopError('Fikr faqat yetkazilgan buyurtma uchun qoldiriladi');
  const line = o.items.find((i) => i.id === pid);
  if (!line) throw new ShopError("Bu mahsulot buyurtmada yo'q");
  const key = `${oid}:${pid}`;
  if (((await store.get(`urev:${user.id}`)) || []).includes(key)) throw new ShopError('Siz bu mahsulotga allaqachon baho bergansiz');
  const first = String(o.name || '').trim().split(/\s+/);
  const review = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), pid, oid, uid: user.id,
    name: first[0] + (first[1] ? ` ${first[1][0]}.` : ''), rating: stars, text: String(text || '').trim().slice(0, 500), at: new Date().toISOString(),
  };
  await store.update('urev:' + user.id, (l) => [...l, key], []);
  await store.update(`reviews:${pid}`, (l) => [review, ...l].slice(0, 100), []);
  await store.update('ratings', (m) => { const e = (m[pid] ||= { sum: 0, count: 0 }); e.sum += stars; e.count += 1; return m; }, {});
  await store.update('reviews:recent', (l) => [{ ...review, title: line.title }, ...l].slice(0, 100), []);
  return review;
}

export async function productReviews(pid) {
  const list = (await store.get(`reviews:${Number(pid)}`)) || [];
  return list.slice(0, 20).map(publicReview);
}

export const userReviewed = async (uid) => (await store.get(`urev:${uid}`)) || [];

export async function recentReviews() {
  return (await store.get('reviews:recent')) || [];
}

/** Adminlar nomaqbul fikrni o'chiradi; baho qayta hisoblanadi. */
export async function deleteReview(pid, id) {
  pid = Number(pid);
  let removed = false;
  const list = await store.update(`reviews:${pid}`, (l) => { const n = l.filter((r) => r.id !== id); removed = n.length < l.length; return n; }, []);
  if (!removed) return false;
  await store.update('ratings', (m) => { m[pid] = { sum: list.reduce((s, r) => s + r.rating, 0), count: list.length }; return m; }, {});
  await store.update('reviews:recent', (l) => l.filter((r) => r.id !== id), []);
  return true;
}
