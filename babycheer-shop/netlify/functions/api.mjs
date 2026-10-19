import * as shop from './lib/shop.js';
import { api, safe, notifyAdmins, verifyInitData, esc } from './lib/tg.js';
import { adminOrderKb, customerOrderKb } from './lib/botui.js';
import { msg } from './lib/msgs.js';
import * as reviews from './lib/reviews.js';
import * as engage from './lib/engage.js';
import { adminApi } from './lib/admin.js';

export const config = { path: '/api/*' };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (msg, status = 400) => json({ error: msg }, status);

const publicOrder = (o) => ({
  id: o.id, no: shop.orderNo(o.id), status: o.status, paid: o.paid, payment: o.payment, delivery: o.delivery, address: o.address,
  created_at: o.created_at, subtotal: o.subtotal, fee: o.delivery_fee, discount: o.discount || 0, promo: o.promo || '', total: o.total, items: o.items, lang: o.lang || 'uz',
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
      return json({ orders: (await shop.userOrders(user.id)).map(publicOrder), reviewed: await reviews.userReviewed(user.id) });
    }

    if (req.method === 'GET' && route === 'track') {
      const o = await shop.findOrder(url.searchParams.get('no') || '', url.searchParams.get('phone') || '');
      return json({ order: o ? publicOrder(o) : null });
    }

    if (req.method === 'POST' && route === 'order') {
      if (!user) return fail("Buyurtma berish uchun do'konni Telegram ichida oching.", 401);
      const o = await shop.createOrder(user, await req.json());
      const out = { order: publicOrder(o) };
      const m = msg(o.lang);
      let text = `${m.orderOk(shop.orderNo(o.id))}\n\n${shop.orderText(o, o.lang)}`;
      if (o.payment === 'online') {
        out.invoice_url = await api('createInvoiceLink', {
          title: `${o.lang === 'ru' ? 'Заказ' : 'Buyurtma'} ${shop.orderNo(o.id)}`, description: o.lang === 'ru' ? 'BabyCheer: оплата заказа' : "BabyCheer: buyurtma uchun to'lov", payload: `order:${o.id}`,
          provider_token: process.env.PAYMENT_PROVIDER_TOKEN, currency: 'UZS', prices: shop.invoicePrices(o),
        }).catch((e) => { console.warn(e.message); return null; });
      }
      if (o.payment === 'transfer') {
        out.transfer = { card: process.env.CARD_NUMBER, owner: process.env.CARD_OWNER || '' };
        text += m.transfer(process.env.CARD_NUMBER, process.env.CARD_OWNER || '', shop.orderNo(o.id));
      }
      await Promise.allSettled([
        safe('sendMessage', { chat_id: user.id, text, parse_mode: 'HTML', reply_markup: customerOrderKb(o) }),
        notifyAdmins(`🔔 <b>Yangi buyurtma</b>${o.lang === 'ru' ? ' 🇷🇺' : ''}\n\n${shop.orderText(o)}`, { reply_markup: adminOrderKb(o) }),
        engage.trackUser(user), engage.setLang(user.id, o.lang),
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

    if (req.method === 'GET' && route === 'reviews') {
      const res = json({ reviews: await reviews.productReviews(url.searchParams.get('pid')) });
      res.headers.set('netlify-cdn-cache-control', 'public, max-age=30, stale-while-revalidate=300, stale-if-error=86400');
      return res;
    }

    if (req.method === 'POST' && route === 'review') {
      if (!user) return fail('Telegram ichida oching', 401);
      const d = await req.json();
      const r = await reviews.addReview(user, d);
      await notifyAdmins(`⭐ <b>Yangi fikr</b>: ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}\n${esc(r.name)}${r.text ? `\n\n${esc(r.text)}` : ''}\n\n<i>Mahsulot ID ${r.pid} · buyurtma ${shop.orderNo(r.oid)}</i>`);
      return json({ ok: true });
    }

    if (req.method === 'POST' && route === 'promo') {
      const d = await req.json();
      const r = await shop.promoPreview(d.code, d.items);
      if (!r) return fail('Promokodni kiriting');
      return json(r);
    }

    if (req.method === 'POST' && route === 'notify') {
      if (!user) return fail('Telegram ichida oching', 401);
      await engage.subscribeNotify(user, (await req.json()).pid);
      return json({ ok: true });
    }

    if (req.method === 'POST' && route === 'lang') {
      if (!user) return json({ ok: true });
      await engage.setLang(user.id, (await req.json()).lang);
      return json({ ok: true });
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
