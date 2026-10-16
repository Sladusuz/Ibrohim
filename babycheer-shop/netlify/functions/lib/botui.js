import { STATUSES, orderNo } from './shop.js';

export const shopUrl = (req) => (process.env.SHOP_URL || new URL(req.url).origin).replace(/\/$/, '');

export const inlineKb = (rows) => ({ inline_keyboard: rows.map((r) => r.map(([text, cb]) => (cb.startsWith('http') ? { text, web_app: { url: cb } } : { text, callback_data: cb }))) });

export const openShopKb = (url) => inlineKb([[["🛍 Do'konni ochish", url]]]);

/** Adminga: holat va to'lov tugmalari. */
export function adminOrderKb(o) {
  const rows = [
    [['✅ Tasdiqlash', `st:${o.id}:confirmed`], ["🚚 Yo'lda", `st:${o.id}:shipping`]],
    [['🎉 Yetkazildi', `st:${o.id}:delivered`], ['❌ Bekor', `st:${o.id}:cancelled`]],
  ];
  if (!o.paid) rows.push([["💰 To'langan deb belgilash", `pay:${o.id}`]]);
  return inlineKb(rows);
}

/** Mijozga: to'lanmagan o'tkazma buyurtmasi uchun chek tugmasi. */
export function customerOrderKb(o) {
  if (o.paid || o.status === 'cancelled' || o.payment !== 'transfer') return undefined;
  return inlineKb([[['🧾 Chek yuborish', `rc:${o.id}`]]]);
}

export const statusMessage = (o) => `Buyurtma ${orderNo(o.id)} holati: ${STATUSES[o.status]}`;
