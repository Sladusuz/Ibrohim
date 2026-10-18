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
    const m = /bot([^/]+)\/(\w+)$/.exec(u); if (m) { let b = {}; try { b = JSON.parse(o.body); } catch { /* */ } tgc.push({ method: m[2], body: b }); return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } })); }
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
  const pend = [], ctx = { waitUntil: (p) => pend.push(p) };
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
  console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
