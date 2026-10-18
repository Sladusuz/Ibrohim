'use strict';
// Platforma API (Worker): hisob, loyiha, joylash, buyurtma, to'lov. STORE=d1 bilan SQLite.
const path = require('path'), fs = require('fs');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 260)); } };
(async () => {
  require('./build-worker.js');
  const W = (await import(path.join(__dirname, '..', 'worker', 'dist', 'worker.mjs') + '?t=' + Date.now())).default;
  const tgc = [];
  globalThis.fetch = async (url, o) => {
    const u = String(url);
    if (u.endsWith('/shablon.html')) return new Response(fs.readFileSync(path.join(__dirname, '..', 'docs', 'shablon.html'), 'utf8'), { status: 200 });
    const m = /bot([^/]+)\/(\w+)$/.exec(u); if (m) { let b = {}; try { b = JSON.parse(o.body); } catch { /* */ } tgc.push({ method: m[2], body: b }); return new Response(JSON.stringify({ ok: true, result: m[2] === 'createInvoiceLink' ? 'https://t.me/$inv123' : { message_id: 1 } })); }
    return new Response('{}', { status: 404 });
  };
  const kv = new Map();
  const env = { TG_TOKEN: '1:a', WEBHOOK_SECRET: 'whsec_abcdefghijklmnop', TG_CHAT: '7', ADMIN_PASSWORD: 'x', SITE_ORIGIN: 'https://improuzbekiston.uz', CARD_INFO: '9860 1201 0441 7221',
    STATE: { get: async (k) => (kv.has(k) ? kv.get(k).v : null), put: async (k, v, o) => { kv.set(k, { v, m: o && o.metadata }); }, list: async ({ prefix }) => ({ keys: [...kv.entries()].filter(([k]) => k.startsWith(prefix)).map(([name, x]) => ({ name, metadata: x.m })), list_complete: true }), delete: async (k) => { kv.delete(k); } } };
  const MODE = process.env.STORE === 'd1' ? 'd1' : 'kv';
  if (MODE === 'd1') {
    const { DatabaseSync } = require('node:sqlite'), sdb = new DatabaseSync(':memory:');
    env.DB = { prepare(sql) { const s = sdb.prepare(sql); let a = []; const o = { bind(...x) { a = x; return o; }, async first() { return s.get(...a) || null; }, async all() { return { results: s.all(...a) }; }, async run() { s.run(...a); return {}; } }; return o; } };
    delete env.STATE;
  }
  console.log('Rejim:', MODE);
  const S0 = W.store(env); const pend = [], ctx = { waitUntil: (p) => pend.push(p) };
  const H = 'https://w.example', api = async (method, p, body, tok, hdr) => { const r = await W.fetch(new Request(H + p, { method, headers: { 'content-type': 'application/json', Origin: 'https://improuzbekiston.uz', ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(hdr || {}) }, body: body ? JSON.stringify(body) : undefined }), env, ctx); await Promise.all(pend.splice(0)); let j = null, t = ''; try { t = await r.clone().text(); j = JSON.parse(t); } catch { /* */ } return { s: r.status, j, t, h: r.headers }; };
  let r = await api('GET', '/api/pricing'); ok(r.s === 200 && r.j.templatePrice && r.h.get('access-control-allow-origin') === 'https://improuzbekiston.uz', 'pricing + CORS', r.j);
  r = await api('POST', '/api/auth/register', { name: 'A', phone: '1', password: '123' }); ok(r.s === 400, 'noto\'g\'ri royxat rad');
  r = await api('POST', '/api/auth/register', { name: 'Ali Valiyev', phone: '+998 90 123 45 67', email: 'ali@x.uz', password: 'secret12' }); ok(r.s === 200 && r.j.token && r.j.user.name === 'Ali Valiyev' && !r.t.includes('hash'), 'royxatdan otish', r.j);
  const tok = r.j.token, me0 = r.j.user; ok(tgc.some((c) => c.method === 'sendMessage' && /Yangi mijoz/.test(c.body.text)), 'admin ga xabar');
  r = await api('POST', '/api/auth/register', { name: 'Ali 2', phone: '90 123 45 67', password: 'secret12' }); ok(r.s === 409, 'takroriy telefon 409');
  r = await api('POST', '/api/auth/login', { id: '901234567', password: 'bad' }); ok(r.s === 401, 'noto\'g\'ri parol 401');
  r = await api('POST', '/api/auth/login', { id: 'ALI@x.uz', password: 'secret12' }); ok(r.s === 200 && r.j.token, 'email bilan kirish');
  r = await api('POST', '/api/auth/login', { id: '+998901234567', password: 'secret12' }); ok(r.s === 200, 'telefon bilan kirish');
  r = await api('GET', '/api/me'); ok(r.s === 401, 'tokensiz 401'); r = await api('GET', '/api/me', null, tok); ok(r.s === 200 && r.j.user.email === 'ali@x.uz', '/me');
  r = await api('POST', '/api/me/password', { old: 'secret12', password: 'newsecret1' }, tok); ok(r.s === 200, 'parol almashtirish');
  r = await api('POST', '/api/auth/login', { id: 'ali@x.uz', password: 'newsecret1' }); ok(r.s === 200, 'yangi parol bilan kirish');
  const data = { company: { name: 'Gul Do\'kon </script>', tagline: 'Gullar' }, sections: [{ type: 'hero', text: 'Salom *dunyo*' }, { type: 'products', items: [] }], theme: {} };
  r = await api('POST', '/api/my/projects', { name: 'Gul', template: 'gul', data }, tok); ok(r.s === 200 && r.j.project.id && r.j.project.paid === false, 'loyiha yaratish (tolovsiz)', r.j); const pid = r.j.project.id;
  r = await api('GET', '/api/my/projects', null, tok); ok(r.j.length === 1 && r.j[0].name === 'Gul', 'loyihalar royxati', r.j);
  r = await api('GET', '/api/my/projects/' + pid, null, tok); ok(r.j.data.sections.length === 2, 'loyihani olish');
  data.sections[0].text = 'Yangi matn'; r = await api('PUT', '/api/my/projects/' + pid, { data, name: 'Gul 2' }, tok); ok(r.s === 200 && r.j.project.name === 'Gul 2', 'saqlash');
  r = await api('POST', '/api/my/projects/' + pid + '/publish', { slug: 'gul-dokon' }, tok); ok(r.s === 402, 'tolovsiz joylash 402');
  r = await api('GET', '/api/my/projects/' + pid + '/export', null, tok); ok(r.s === 402, 'tolovsiz eksport 402');
  tgc.length = 0; r = await api('POST', '/api/my/projects/' + pid + '/paid', {}, tok); ok(r.s === 200 && tgc.some((c) => c.method === 'sendMessage' && /to'lov qildim/i.test(c.body.text) && JSON.stringify(c.body.reply_markup).includes('pp:')), 'tolov qildim: adminga tasdiqlash tugmasi');
  { const cb = tgc.filter((c) => c.method === 'sendMessage').map((c) => c.body.reply_markup && c.body.reply_markup.inline_keyboard[0][0].callback_data).find(Boolean); await W.handleUpdate(env, { callback_query: { id: 'cq1', data: cb, from: { id: 7 }, message: { chat: { id: 7 }, message_id: 9 } } }); r = await api('GET', '/api/my/projects/' + pid, null, tok); ok(r.j.project.paid === true, 'admin tugmasi bilan tolov tasdiqlandi (pp:)'); const { sid } = {}; await S0.put('pr:' + me0.id + ':' + pid, { ...r.j.project, paid: false }, 0, { ...r.j.project, paid: false }); }
  r = await api('POST', '/api/my/projects/' + pid + '/checkout', { method: 'card' }, tok); ok(r.s === 200 && r.j.manual && r.j.payment.uzs === 128000, 'tolov sorovi (karta)', r.j);
  ok(tgc.some((c) => c.method === 'sendMessage' && /sotib olish/.test(c.body.text) && JSON.stringify(c.body.reply_markup).includes('pp:')), 'adminga tasdiqlash tugmasi');
  { const S = W.store(env), k = 'pr:' + me0.id + ':' + pid, m = await S.get(k); m.paid = true; await S.put(k, m, 0, m); }
  r = await api('POST', '/api/my/projects/' + pid + '/publish', { slug: 'admin' }, tok); ok(r.s === 400, 'zahiralangan manzil rad');
  r = await api('POST', '/api/my/projects/' + pid + '/publish', { slug: 'gul-dokon' }, tok); ok(r.s === 200 && /\/s\/gul-dokon$/.test(r.j.project.url), 'joylash', r.j);
  const pg = await W.fetch(new Request(H + '/s/gul-dokon'), env, ctx); const html = await pg.text(); ok(pg.status === 200 && html.includes('Yangi matn') && !html.includes('</script>","tagline') && html.includes('window.__TENANT__'), 'saytni ochish', html.slice(0, 120));
  r = await api('POST', '/api/auth/register', { name: 'Boshqa', phone: '+998931112233', password: 'secret12' }); const tok2 = r.j.token;
  r = await api('POST', '/api/my/projects', { name: 'X', data }, tok2); const pid2 = r.j.project.id; { const S = W.store(env), u2 = (await api('GET', '/api/me', null, tok2)).j.user, k = 'pr:' + u2.id + ':' + pid2, m = await S.get(k); m.paid = true; await S.put(k, m, 0, m); }
  r = await api('POST', '/api/my/projects/' + pid2 + '/publish', { slug: 'gul-dokon' }, tok2); ok(r.s === 409, 'band manzil 409');
  r = await api('GET', '/api/my/projects/' + pid, null, tok2); ok(r.s === 404, 'begona loyiha 404');
  r = await api('POST', '/api/order', { type: 'order', name: 'Mijoz', phone: '+998901112233', items: [{ id: 'a', name: 'Atirgul', price: 15000, qty: 2 }] }, null, { Referer: 'https://w.example/s/gul-dokon' }); ok(r.s === 200 && r.j.ok, 'sayt buyurtmasi');
  r = await api('GET', '/api/my/leads', null, tok); ok(r.j.length === 1 && r.j[0].total === 30000 && r.j[0].site === 'Gul 2', 'leadlar egasida', r.j);
  r = await api('GET', '/api/my/leads', null, tok2); ok(r.j.length === 0, 'leadlar begonada yoq');
  r = await api('GET', '/api/my/projects/' + pid + '/stats', null, tok); ok(r.s === 200 && r.j.views >= 1 && r.j.orders === 1, 'statistika', r.j);
  r = await api('GET', '/api/my/projects/' + pid + '/export', null, tok); ok(r.s === 200 && r.t.includes('Yangi matn'), 'eksport');
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  r = await api('POST', '/api/my/upload', { data: png }, tok); ok(r.s === 200 && /\/uploads\/\w+\.png$/.test(r.j.url), 'rasm yuklash'); const up = await W.fetch(new Request(r.j.url.replace(/^https?:\/\/[^/]+/, H)), env, ctx); ok(up.status === 200 && up.headers.get('content-type') === 'image/png', 'rasm berish');
  r = await api('POST', '/api/my/projects/' + pid + '/submit', { plan: 'Standart', note: 'tez' }, tok); ok(r.s === 200 && r.j.project.plan === 'Standart' && r.j.project.submittedAt, 'buyurtma yuborish');
  r = await api('DELETE', '/api/my/projects/' + pid + '/publish', null, tok); const pg2 = await W.fetch(new Request(H + '/s/gul-dokon'), env, ctx); ok(r.s === 200 && pg2.status === 404, 'joylashni bekor qilish');
  r = await api('DELETE', '/api/my/projects/' + pid, null, tok); r = await api('GET', '/api/my/projects', null, tok); ok(r.j.length === 0, 'loyihani ochirish');
  { // Telegram to'lovlari: GlobalPay va Click (provider_token)
    env.GLOBALPAY_TOKEN = '111:TEST:gp'; env.CLICK_TG_TOKEN = '398062629:TEST:click';
    r = await api('GET', '/api/pricing'); ok(r.j.payMethods.globalpay && r.j.payMethods.clicktg, 'tolov usullari: globalpay va clicktg');
    r = await api('POST', '/api/auth/register', { name: 'To\'lovchi', phone: '+998941112233', password: 'secret12' }); const pt = r.j.token, puid = r.j.user.id;
    r = await api('POST', '/api/my/projects', { name: 'P', data }, pt); const ppid = r.j.project.id;
    for (const [mth, tok] of [['globalpay', '111:TEST:gp'], ['clicktg', '398062629:TEST:click']]) { tgc.length = 0; r = await api('POST', '/api/my/projects/' + ppid + '/checkout', { method: mth }, pt); const c = tgc.find((q) => q.method === 'createInvoiceLink'); ok(r.s === 200 && r.j.payUrl === 'https://t.me/$inv123' && c && c.body.provider_token === tok && c.body.currency === 'UZS' && c.body.prices[0].amount === 12800000, 'checkout ' + mth, c && c.body); }
    const S = W.store(env), poKeys = (await S.list('po:')), pay = (await Promise.all(poKeys.map((k) => S.get(k.name)))).find((q) => q.projectId === ppid);
    tgc.length = 0; await W.handleUpdate(env, { pre_checkout_query: { id: 'q1', invoice_payload: 'po:' + pay.id, currency: 'UZS', total_amount: pay.uzs * 100 } }); ok(tgc.some((c) => c.method === 'answerPreCheckoutQuery' && c.body.ok === true), 'pre_checkout: togri summa qabul');
    tgc.length = 0; await W.handleUpdate(env, { pre_checkout_query: { id: 'q2', invoice_payload: 'po:' + pay.id, currency: 'UZS', total_amount: 5 } }); ok(tgc.some((c) => c.method === 'answerPreCheckoutQuery' && c.body.ok === false), 'pre_checkout: notogri summa rad');
    r = await api('POST', '/api/my/projects/' + ppid + '/publish', { slug: 'tolov-test' }, pt); ok(r.s === 402, 'tolovdan oldin joylab bolmaydi');
    tgc.length = 0; await W.handleUpdate(env, { message: { message_id: 5, chat: { id: 555, type: 'private' }, from: { id: 555, first_name: 'Tolovchi' }, successful_payment: { currency: 'UZS', total_amount: pay.uzs * 100, invoice_payload: 'po:' + pay.id, telegram_payment_charge_id: 'tc1', provider_payment_charge_id: 'pc1' } } });
    r = await api('POST', '/api/my/projects/' + ppid + '/publish', { slug: 'tolov-test' }, pt); ok(r.s === 200, 'tolovdan keyin joylash ochiladi', r.j);
    ok(tgc.some((c) => c.method === 'sendMessage' && /GlobalPay|to'lov qabul/i.test(c.body.text)), 'adminga va mijozga xabar');
    tgc.length = 0; await W.handleUpdate(env, { message: { message_id: 6, chat: { id: 555, type: 'private' }, from: { id: 555 }, successful_payment: { currency: 'UZS', total_amount: pay.uzs * 100, invoice_payload: 'po:' + pay.id, telegram_payment_charge_id: 'tc1' } } }); ok(!tgc.some((c) => c.method === 'sendMessage'), 'takroriy tolov ikki marta hisoblanmaydi');
    delete env.GLOBALPAY_TOKEN; delete env.CLICK_TG_TOKEN;
  }
  { // veb admin panel: /api/admin/*
    r = await api('GET', '/api/admin/stats'); ok(r.s === 401, 'admin: tokensiz 401');
    r = await api('POST', '/api/admin/login', { password: 'wrong' }); ok(r.s === 401, 'admin: noto\'g\'ri parol');
    r = await api('POST', '/api/admin/login', { password: 'x' }); ok(r.s === 200 && r.j.token, 'admin: kirish'); const at = r.j.token;
    r = await api('GET', '/api/admin/stats', null, at); ok(r.s === 200 && r.j.users.total >= 2 && r.j.orders.series.length === 14, 'admin: statistika', r.j);
    r = await api('GET', '/api/admin/users', null, at); ok(r.j.length >= 2 && r.j[0].projects !== undefined, 'admin: mijozlar');
    const adm = r.j.find((u) => u.name === 'Ali Valiyev'); r = await api('GET', '/api/admin/users/' + adm.id, null, at); ok(r.s === 200 && r.j.user.name === 'Ali Valiyev', 'admin: mijoz tafsiloti');
    r = await api('POST', '/api/order', { type: 'brief', name: 'Asosiy sayt mijozi', phone: '+998909998877', message: 'Sayt kerak' }); ok(r.s === 200, 'asosiy sayt buyurtmasi');
    r = await api('GET', '/api/admin/orders', null, at); ok(r.j.length === 1 && r.j[0].type === 'brief' && !r.j[0]._k, 'admin: buyurtmalar (tenantsiz)', r.j); const oid = r.j[0].id;
    r = await api('PUT', '/api/admin/orders', { id: oid, status: 'jarayonda', note: 'qongiroq qilindi' }, at); r = await api('GET', '/api/admin/orders', null, at); ok(r.j[0].status === 'jarayonda' && r.j[0].note === 'qongiroq qilindi', 'admin: buyurtma holati');
    r = await api('GET', '/api/admin/orders.csv', null, at); ok(r.s === 200 && r.t.includes('Asosiy sayt mijozi'), 'admin: csv');
    r = await api('GET', '/api/admin/projects', null, at); ok(r.j.length >= 1 && r.j[0].user && r.j[0].user.name, 'admin: loyihalar', r.j); const pj = r.j.find((p) => p.name === 'X');
    r = await api('PUT', '/api/admin/projects/' + pj.id, { status: 'narx', price: '300$', adminNote: 'izoh', paid: false }, at); ok(r.s === 200 && r.j.project.paid === null && r.j.project.status === 'narx', 'admin: loyiha yangilash');
    r = await api('GET', '/api/admin/projects/' + pj.id, null, at); ok(r.j.data && r.j.data.sections, 'admin: loyiha malumoti');
    r = await api('PUT', '/api/admin/projects/' + pj.id, { paid: true }, at); ok(r.j.project.paid && r.j.project.paid.usd === 10, 'admin: tolov tasdiqi');
    r = await api('GET', '/api/admin/site', null, at); ok(r.s === 200 && Array.isArray(r.j.sections), 'admin: sayt');
    r = await api('PUT', '/api/admin/pricing', { currency: "so'm", plans: [{ name: 'Standart', price: '1 mln', features: ['a'] }], templatePrice: { usd: 12, rate: 13000 } }, at); r = await api('GET', '/api/pricing'); ok(r.j.plans.length === 1 && r.j.templatePrice.usd === 12, 'admin: narxlar ommaviy API ga tushadi', r.j.templatePrice);
    r = await api('GET', '/api/admin/settings', null, at); ok(r.s === 200 && r.j.payments && r.j.manualPay, 'admin: sozlamalar');
    r = await api('PUT', '/api/admin/settings', { manualPay: 'Humo 1111' }, at); r = await api('GET', '/api/pricing'); ok(r.j.manualPay === 'Humo 1111', 'admin: karta rekviziti');
    r = await api('POST', '/api/admin/password', { password: 'yangi-parol' }, at); r = await api('POST', '/api/admin/login', { password: 'x' }); ok(r.s === 401, 'admin: eski parol ishlamaydi'); r = await api('POST', '/api/admin/login', { password: 'yangi-parol' }); ok(r.s === 200, 'admin: yangi parol');
    r = await api('POST', '/api/admin/logout', {}, r.j.token); r = await api('GET', '/api/admin/stats', null, at); ok(r.s === 200, 'admin: boshqa sessiya saqlanadi');
    r = await api('DELETE', '/api/admin/users/' + adm.id, null, at); r = await api('POST', '/api/auth/login', { id: 'ali@x.uz', password: 'newsecret1' }); ok(r.s === 401, 'admin: mijozni ochirish');
  }
  { // admin Mini App: ikkinchi bot tokeni bilan imzolangan initData
    const crypto = require('crypto'), sign = (tokn, uid) => { const p = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: uid }) }, str = Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join('\n'), sec = crypto.createHmac('sha256', 'WebAppData').update(tokn).digest(); return new URLSearchParams({ ...p, hash: crypto.createHmac('sha256', sec).update(str).digest('hex') }).toString(); };
    env.APP_BOT_TOKEN = '999:second'; const app = async (init, action, extra) => (await api('POST', '/api/app', { action, ...(extra || {}) }, null, { 'X-Init-Data': init }));
    r = await app(sign('999:second', 7), 'users'); ok(r.s === 200 && r.j.total >= 1, 'panel: hisoblar (2-bot imzosi)', r.j);
    r = await app(sign('1:a', 7), 'projects'); ok(r.s === 200 && r.j.projects.length >= 1 && r.j.projects[0].owner, 'panel: loyihalar');
    r = await app(sign('999:second', 99), 'users'); ok(r.s === 403, 'panel: admin emas 403');
    r = await app(sign('bad:tok', 7), 'users'); ok(r.s === 403, 'panel: noto\'g\'ri imzo 403');
    r = await api('POST', '/api/adminbot/session', { initData: sign('999:second', 7) }); ok(r.s === 200 && r.j.token, 'panel: Mini App orqali admin kirishi'); const mt = r.j.token;
    r = await api('GET', '/api/admin/stats', null, mt); ok(r.s === 200, 'panel: Mini App tokeni bilan statistika');
    r = await api('POST', '/api/adminbot/session', { initData: sign('999:second', 99) }); ok(r.s === 403, 'panel: admin emas kirmaydi');
    const pr = (await app(sign('1:a', 7), 'projects')).j.projects[0]; r = await app(sign('1:a', 7), 'markpaid', { owner: pr.userId, id: pr.id }); ok(r.s === 200, 'panel: tolovni tasdiqlash');
    r = await app(sign('1:a', 7), 'porders'); ok(r.s === 200 && Array.isArray(r.j.orders), 'panel: buyurtmalar');
  }
  console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
