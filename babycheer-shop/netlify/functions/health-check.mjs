// Har 10 daqiqada tizimni tekshiradi; ombor ishlamasa adminlarga Telegramda xabar yuboradi.
import * as shop from './lib/shop.js';
import { notifyAdmins } from './lib/tg.js';

export const config = { schedule: '*/10 * * * *' };

let lastAlert = 0; // nusxa ichida xotira: bir soatda bir martadan ko'p yozmaydi

export default async () => {
  const h = await shop.health();
  if (!h.ok && Date.now() - lastAlert > 60 * 60 * 1000) {
    lastAlert = Date.now();
    await notifyAdmins(`⚠️ <b>Do'kon ombori javob bermayapti</b>\n${h.error}\nBuyurtmalar vaqtincha qabul qilinmasligi mumkin. Netlify → Deploys → Trigger deploy bilan qayta ishga tushiring yoki menga yozing.`);
  }
  return new Response(JSON.stringify(h), { headers: { 'content-type': 'application/json' } });
};
