import * as shop from './lib/shop.js';
import { api, safe, notifyAdmins, verifyInitData, esc } from './lib/tg.js';
import { adminOrderKb, customerOrderKb } from './lib/botui.js';
import { adminApi } from './lib/admin.js';

export const config = { path: '/api/*' };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (msg, status = 400) => json({ error: msg }, status);

const publicOrder = (o) => ({
  id: o.id, no: shop.orderNo(o.id), status: o.status, paid: o.paid, payment: o.payment, delivery: o.delivery, address: o.address,
  created_at: o.created_at, subtotal: o.subtotal, fee: o.delivery_fee, total: o.total, items: o.items,
});

export default async (req) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, '');
  let user = null;
  try { user = verifyInitData(req.headers.get('x-tg-init-data') || ''); } catch { /* noto'g'ri imzo = mehmon */ }
  try {
    if (req.method === 'GET' && route === 'health') {
      const h = await shop.health();
      return json(h, h.ok ? 200 : 503);
    }

    if (route.startsWith('admin/')) return await adminApi(route, req, user);

    if (req.method === 'GET' && route === 'catalog') {
      const res = json(await shop.publicCatalog());
      // CDN 15 soniya yangi saqlaydi, undan keyin eskisini berib fonda yangilaydi; xato bo'lsa 1 kungacha eski nusxa
      res.headers.set('netlify-cdn-cache-control', 'public, max-age=15, stale-while-revalidate=120, stale-if-error=86400');
      return res;
    }

    if (req.method === 'GET' && route === 'orders') {
      if (!user) return fail("Telegram ichida oching", 401);
      return json({ orders: (await shop.userOrders(user.id)).map(publicOrder) });
    }

    if (req.method === 'GET' && route === 'track') {
      const o = await shop.findOrder(url.searchParams.get('no') || '', url.searchParams.get('phone') || '');
      return json({ order: o ? publicOrder(o) : null });
    }

    if (req.method === 'POST' && route === 'order') {
      if (!user) return fail("Buyurtma berish uchun do'konni Telegram ichida oching.", 401);
      const o = await shop.createOrder(user, await req.json());
      const out = { order: publicOrder(o) };
      let text = `✅ Buyurtma <b>${shop.orderNo(o.id)}</b> qabul qilindi! Operator tez orada telefon orqali tasdiqlaydi.\n\n${shop.orderText(o)}`;
      if (o.payment === 'online') {
        out.invoice_url = await api('createInvoiceLink', {
          title: `Buyurtma ${shop.orderNo(o.id)}`, description: 'BabyCheer: buyurtma uchun to\'lov', payload: `order:${o.id}`,
          provider_token: process.env.PAYMENT_PROVIDER_TOKEN, currency: 'UZS', prices: shop.invoicePrices(o),
        }).catch((e) => { console.warn(e.message); return null; });
      }
      if (o.payment === 'transfer') {
        out.transfer = { card: process.env.CARD_NUMBER, owner: process.env.CARD_OWNER || '' };
        text += `\n\n🏦 Karta: <code>${esc(process.env.CARD_NUMBER)}</code>${process.env.CARD_OWNER ? ` (${esc(process.env.CARD_OWNER)})` : ''}\nIzohga <b>${shop.orderNo(o.id)}</b> yozing, so'ng «Chek yuborish» tugmasini bosing.`;
      }
      await Promise.allSettled([
        safe('sendMessage', { chat_id: user.id, text, parse_mode: 'HTML', reply_markup: customerOrderKb(o) }),
        notifyAdmins(`🔔 <b>Yangi buyurtma</b>\n\n${shop.orderText(o)}`, { reply_markup: adminOrderKb(o) }),
      ]);
      return json(out);
    }

    if (req.method === 'POST' && route === 'pay') {
      if (!user) return fail('Telegram ichida oching', 401);
      const o = await shop.getOrder(Number((await req.json()).id));
      if (!o || o.user_id !== user.id || o.payment !== 'online' || o.paid || o.status === 'cancelled') return fail("To'lash mumkin emas");
      const invoice_url = await api('createInvoiceLink', {
        title: `Buyurtma ${shop.orderNo(o.id)}`, description: "BabyCheer: buyurtma uchun to'lov", payload: `order:${o.id}`,
        provider_token: process.env.PAYMENT_PROVIDER_TOKEN, currency: 'UZS', prices: shop.invoicePrices(o),
      });
      return json({ invoice_url });
    }

    if (req.method === 'POST' && route === 'message') {
      const d = await req.json();
      const name = String(d.name || '').trim().slice(0, 80), phone = shop.normPhone(d.phone), text = String(d.message || '').trim().slice(0, 1000);
      if (name.length < 2) return fail('Ismingizni kiriting');
      if (!phone) return fail("Telefon raqami noto'g'ri");
      if (text.length < 3) return fail('Xabarni yozing');
      await notifyAdmins(`✉️ <b>Mijoz xabari</b>\n${esc(name)} · ${phone}${user ? ` · id ${user.id}` : ''}\n\n${esc(text)}`);
      return json({ ok: true });
    }

    return fail('Topilmadi', 404);
  } catch (e) {
    if (e instanceof shop.ShopError) return fail(e.message);
    if (e instanceof SyntaxError) return fail("Noto'g'ri so'rov");
    console.error(e);
    // diagnostika: faqat maxfiy kalit bilan so'ralganda xato tafsiloti qaytadi
    const dbg = process.env.WEBHOOK_SECRET;
    if (dbg && req.headers.get('x-debug') === dbg) return json({ error: 'debug', detail: String((e && e.stack) || e).slice(0, 1500) }, 500);
    return fail('Server xatosi, birozdan keyin urinib ko\'ring', 500);
  }
};
