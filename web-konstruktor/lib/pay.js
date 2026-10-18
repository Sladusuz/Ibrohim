'use strict';
// Shablon sotuvi uchun to'lovlar: Payme (JSON-RPC Merchant API) va Click (Prepare/Complete).
// Sozlamalar: settings.json -> payments { payme: { merchantId, key }, click: { serviceId, merchantId, secretKey } }
// To'lov holati: pending -> paid -> refunded. Qo'lda (kartaga o'tkazma) to'lovni admin tasdiqlaydi.
const crypto = require('crypto');

module.exports = function makePay({ readJSON, writeJSON, file, newId, getSettings, onPaid, onRefund }) {
  const list = () => readJSON(file, []);
  const save = (v) => writeJSON(file, v.slice(0, 50000));
  const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
  const tEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
  const cfg = () => { const p = (getSettings().payments) || {}; return { payme: Object.assign({}, p.payme), click: Object.assign({}, p.click) }; };
  const env = (k) => process.env[k] || '';
  const paymeCfg = () => { const c = cfg().payme; return { merchantId: env('PAYME_MERCHANT_ID') || c.merchantId || '', key: env('PAYME_KEY') || c.key || '' }; };
  const clickCfg = () => { const c = cfg().click; return { serviceId: env('CLICK_SERVICE_ID') || c.serviceId || '', merchantId: env('CLICK_MERCHANT_ID') || c.merchantId || '', secretKey: env('CLICK_SECRET_KEY') || c.secretKey || '' }; };
  const methods = () => ({ payme: !!(paymeCfg().merchantId && paymeCfg().key), click: !!(clickCfg().serviceId && clickCfg().merchantId && clickCfg().secretKey) });

  function create({ projectId, userId, usd, rate, method, credit, pct }) {
    const uzs = Math.round(Number(usd) * Number(rate));
    const p = { id: newId(5), kind: 'template', projectId, userId, usd: Number(usd), uzs, method, state: 'pending', createdAt: new Date().toISOString(), tx: null, click: null, credit: credit || 0, pct: pct || 0 };
    const all = list(); all.unshift(p); save(all);
    return p;
  }
  function checkoutUrl(p, returnUrl) {
    if (p.method === 'payme') {
      const c = paymeCfg();
      const data = `m=${c.merchantId};ac.order_id=${p.id};a=${p.uzs * 100};c=${returnUrl};l=uz`;
      return 'https://checkout.paycom.uz/' + Buffer.from(data).toString('base64');
    }
    if (p.method === 'click') {
      const c = clickCfg();
      return `https://my.click.uz/services/pay?service_id=${encodeURIComponent(c.serviceId)}&merchant_id=${encodeURIComponent(c.merchantId)}&amount=${p.uzs}&transaction_param=${p.id}&return_url=${encodeURIComponent(returnUrl)}`;
    }
    return '';
  }
  const markPaid = (all, p, method, ref) => { p.state = 'paid'; p.paidAt = new Date().toISOString(); if (method) p.method = method; if (ref) p.ref = ref; save(all); onPaid(p); };

  /* ---------------- Payme ---------------- */
  const E = (code, ru, uz, en, data) => ({ code, message: { ru, uz, en }, data });
  const ERR = {
    auth: E(-32504, 'Недостаточно привилегий', 'Ruxsat yetarli emas', 'Insufficient privilege'),
    method: E(-32601, 'Метод не найден', 'Metod topilmadi', 'Method not found'),
    order: E(-31050, 'Заказ не найден', 'Buyurtma topilmadi', 'Order not found', 'order_id'),
    amount: E(-31001, 'Неверная сумма', "Noto'g'ri summa", 'Wrong amount'),
    cant: E(-31008, 'Невозможно выполнить операцию', "Amalni bajarib bo'lmaydi", 'Unable to complete operation'),
    notfound: E(-31003, 'Транзакция не найдена', 'Tranzaksiya topilmadi', 'Transaction not found'),
    nocancel: E(-31007, 'Заказ выполнен. Невозможно отменить', "Buyurtma bajarilgan, bekor qilib bo'lmaydi", 'Order completed, cannot cancel'),
  };
  const TIMEOUT = 12 * 3600e3;
  const txView = (p) => ({ create_time: p.tx.createTime, perform_time: p.tx.performTime || 0, cancel_time: p.tx.cancelTime || 0, transaction: p.id, state: p.tx.state, reason: p.tx.reason == null ? null : p.tx.reason });

  function payme(body, authHeader) {
    const id = body && body.id;
    const reply = (result) => ({ result, id });
    const fail = (e, data) => ({ error: data ? { ...e, data } : e, id });
    const c = paymeCfg();
    const m = /^Basic\s+(\S+)$/.exec(authHeader || '');
    const cred = m ? Buffer.from(m[1], 'base64').toString('utf8') : '';
    if (!c.key || !tEq(cred, `Paycom:${c.key}`)) return fail(ERR.auth);
    const method = body.method, params = body.params || {};
    const all = list();
    const byOrder = (oid) => all.find((x) => x.id === String(oid || '') && x.kind === 'template');
    const byTx = (tid) => all.find((x) => x.tx && x.tx.id === tid);
    const checkOrder = (prm) => {
      const p = byOrder(prm.account && prm.account.order_id);
      if (!p) return { e: fail(ERR.order, 'order_id') };
      if (p.state === 'paid' || p.state === 'refunded') return { e: fail(ERR.cant) };
      if (Number(prm.amount) !== p.uzs * 100) return { e: fail(ERR.amount) };
      return { p };
    };
    switch (method) {
      case 'CheckPerformTransaction': { const r = checkOrder(params); return r.e || reply({ allow: true }); }
      case 'CreateTransaction': {
        const ex = byTx(params.id);
        if (ex) { if (ex.tx.state !== 1) return fail(ERR.cant); if (Date.now() - ex.tx.createTime > TIMEOUT) { ex.tx.state = -1; ex.tx.reason = 4; ex.tx.cancelTime = Date.now(); save(all); return fail(ERR.cant); } return reply(txView(ex)); }
        const r = checkOrder(params); if (r.e) return r.e;
        if (r.p.tx && r.p.tx.state === 1) return fail(ERR.cant);
        r.p.tx = { id: params.id, time: params.time, state: 1, createTime: Date.now() }; save(all);
        return reply(txView(r.p));
      }
      case 'PerformTransaction': {
        const p = byTx(params.id); if (!p) return fail(ERR.notfound);
        if (p.tx.state === 1) {
          if (Date.now() - p.tx.createTime > TIMEOUT) { p.tx.state = -1; p.tx.reason = 4; p.tx.cancelTime = Date.now(); save(all); return fail(ERR.cant); }
          p.tx.state = 2; p.tx.performTime = Date.now(); markPaid(all, p, 'payme', params.id);
          return reply(txView(p));
        }
        if (p.tx.state === 2) return reply(txView(p));
        return fail(ERR.cant);
      }
      case 'CancelTransaction': {
        const p = byTx(params.id); if (!p) return fail(ERR.notfound);
        if (p.tx.state === 1) { p.tx.state = -1; p.tx.reason = params.reason; p.tx.cancelTime = Date.now(); save(all); return reply(txView(p)); }
        if (p.tx.state === 2) { p.tx.state = -2; p.tx.reason = params.reason; p.tx.cancelTime = Date.now(); p.state = 'refunded'; save(all); onRefund(p); return reply(txView(p)); }
        return reply(txView(p));
      }
      case 'CheckTransaction': { const p = byTx(params.id); return p ? reply(txView(p)) : fail(ERR.notfound); }
      case 'GetStatement': {
        const from = Number(params.from) || 0, to = Number(params.to) || Date.now();
        const tx = all.filter((x) => x.tx && x.tx.createTime >= from && x.tx.createTime <= to).map((p) => ({ id: p.tx.id, time: p.tx.time, amount: p.uzs * 100, account: { order_id: p.id }, ...txView(p) }));
        return reply({ transactions: tx });
      }
      default: return fail(ERR.method);
    }
  }

  /* ---------------- Click ---------------- */
  function click(f) {
    const c = clickCfg();
    const out = (o) => ({ click_trans_id: f.click_trans_id, merchant_trans_id: f.merchant_trans_id, ...o });
    const action = Number(f.action);
    const base = `${f.click_trans_id}${f.service_id}${c.secretKey}${f.merchant_trans_id}`;
    const sign = action === 1 ? md5(`${base}${f.merchant_prepare_id}${f.amount}${f.action}${f.sign_time}`) : md5(`${base}${f.amount}${f.action}${f.sign_time}`);
    if (!c.secretKey || String(f.service_id) !== String(c.serviceId) || !tEq(String(f.sign_string || '').toLowerCase(), sign)) return out({ error: -1, error_note: 'SIGN CHECK FAILED!' });
    const all = list(), p = all.find((x) => x.id === String(f.merchant_trans_id || '') && x.kind === 'template');
    if (!p) return out({ error: -5, error_note: 'User does not exist' });
    if (Math.abs(Number(f.amount) - p.uzs) > 0.01) return out({ error: -2, error_note: 'Incorrect parameter amount' });
    if (action === 0) {
      if (p.state === 'paid') return out({ error: -4, error_note: 'Already paid' });
      if (p.click && p.click.cancelled) return out({ error: -9, error_note: 'Transaction cancelled' });
      p.click = { transId: f.click_trans_id, prepareId: p.id, state: 'prepared' }; save(all);
      return out({ merchant_prepare_id: p.id, error: 0, error_note: 'Success' });
    }
    if (action === 1) {
      if (!p.click || String(f.merchant_prepare_id) !== String(p.click.prepareId)) return out({ error: -6, error_note: 'Transaction does not exist' });
      if (p.state === 'paid') return out({ merchant_prepare_id: p.id, merchant_confirm_id: p.id, error: -4, error_note: 'Already paid' });
      if (Number(f.error) < 0) { p.click.cancelled = true; save(all); return out({ merchant_prepare_id: p.id, merchant_confirm_id: p.id, error: -9, error_note: 'Transaction cancelled' }); }
      markPaid(all, p, 'click', f.click_paydoc_id);
      return out({ merchant_prepare_id: p.id, merchant_confirm_id: p.id, error: 0, error_note: 'Success' });
    }
    return out({ error: -3, error_note: 'Action not found' });
  }

  // Qo'lda tasdiqlash (admin) yoki bekor qilish
  function setPaid(id, paid, ref) {
    const all = list(), p = all.find((x) => x.id === id); if (!p) return null;
    if (paid && p.state !== 'paid') markPaid(all, p, p.method || 'manual', ref || 'admin');
    if (!paid && p.state === 'paid') { p.state = 'refunded'; save(all); onRefund(p); }
    return p;
  }
  return { list, save, create, checkoutUrl, payme, click, methods, setPaid };
};
