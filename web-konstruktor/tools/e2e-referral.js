'use strict';
// Referal dasturini sinaydi: havola, chegirma, mukofot, bonus balans.
const { spawn } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const ROOT = path.join(__dirname, '..'), DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'impro-ref-'));
fs.copyFileSync(path.join(ROOT, 'data', 'site.json'), path.join(DATA, 'site.json'));
const PORT = 4300 + Math.floor(Math.random() * 300), BASE = `http://localhost:${PORT}`, ADMIN = 'adm-ref-1';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 200)); } };
const J = async (u, o = {}) => { const r = await fetch(BASE + u, { ...o, headers: { 'content-type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let j = {}; try { j = await r.json(); } catch { /* ignore */ } return { s: r.status, j, r }; };
const ph = () => '+99890' + String(Math.floor(1e6 + Math.random() * 9e6));
const tpl = { v: 2, company: { name: 'Ref Sinov', logo: 'R' }, theme: { preset: 'dark' }, nav: {}, orders: { enabled: false }, sections: [{ id: 'bosh', type: 'hero', enabled: true, titleStart: 'Salom', words: [], titleEnd: '', text: 'x', cta1Text: '', cta1Link: '', cta2Text: '', cta2Link: '' }] };
(async () => {
  const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT, DATA_DIR: DATA, ADMIN_PASSWORD: ADMIN, PUBLIC_URL: 'https://example.test' }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/healthz')).ok) break; } catch { /* wait */ } await new Promise((r) => setTimeout(r, 250)); }
  try {
    const A = await J('/api/auth/register', { method: 'POST', body: { name: 'Taklif Qiluvchi', phone: ph(), password: 'secret12' } });
    const ha = { authorization: 'Bearer ' + A.j.token };
    const r1 = await J('/api/my/referral', { headers: ha });
    ok(r1.s === 200 && /^[A-F0-9]{6}$/.test(r1.j.code) && r1.j.link.endsWith(`/yaratish.html?ref=${r1.j.code}`) && r1.j.discountPct === 20 && r1.j.rewardUsd === 3, 'referal havolasi va sozlamalar', r1.j);
    ok((await J('/api/my/referral', { headers: ha })).j.code === r1.j.code, 'kod barqaror');
    ok((await J('/api/my/referral')).s === 401, 'kirishsiz rad etiladi');
    ok(r1.j.next.usd === 10 && r1.j.next.pct === 0, 'taklifsiz mijozga chegirma yo\'q', r1.j.next);

    const B = await J('/api/auth/register', { method: 'POST', body: { name: 'Do\'st', phone: ph(), password: 'secret12', ref: r1.j.code.toLowerCase() } });
    const hb = { authorization: 'Bearer ' + B.j.token };
    const rb = await J('/api/my/referral', { headers: hb });
    ok(rb.j.next.pct === 20 && rb.j.next.usd === 8, "taklif qilingan mijozga 20% chegirma ($8)", rb.j.next);
    const C = await J('/api/auth/register', { method: 'POST', body: { name: 'Yolg\'on', phone: ph(), password: 'secret12', ref: 'ZZZZZZ' } });
    ok((await J('/api/my/referral', { headers: { authorization: 'Bearer ' + C.j.token } })).j.next.pct === 0, "noto'g'ri kod chegirma bermaydi");

    const cp = await J('/api/my/projects', { method: 'POST', headers: hb, body: { name: 'Ref Sinov', template: 'salon', data: tpl } });
    const pid = cp.j.project.id;
    const man = await J(`/api/my/projects/${pid}/checkout`, { method: 'POST', headers: hb, body: { method: 'manual' } });
    ok(man.j.manual && man.j.payment.usd === 8 && man.j.payment.uzs === 102400, "to'lov summasi chegirma bilan: $8 = 102 400 so'm", man.j.payment);
    const al = await J('/api/admin/login', { method: 'POST', body: { password: ADMIN } }), cookie = (al.r.headers.get('set-cookie') || '').split(';')[0];
    const pd = await J(`/api/admin/projects/${pid}`, { method: 'PUT', headers: { cookie }, body: { paid: true } });
    ok(pd.j.project && pd.j.project.paid && pd.j.project.paid.usd === 8, "admin tasdiqladi: to'langan summa $8", pd.j.project && pd.j.project.paid);
    const ra = await J('/api/my/referral', { headers: ha });
    ok(ra.j.credit === 3 && ra.j.invited === 1 && ra.j.rewarded === 1, "taklif qilgan mijozga $3 bonus berildi", ra.j);
    ok(ra.j.next.credit === 3 && ra.j.next.usd === 7, 'bonus keyingi narxdan ayriladi ($7)', ra.j.next);
    // ikkinchi xarid mukofotni takrorlamaydi
    const cp2 = await J('/api/my/projects', { method: 'POST', headers: hb, body: { name: 'Ref 2', template: 'salon', data: tpl } });
    await J(`/api/my/projects/${cp2.j.project.id}/checkout`, { method: 'POST', headers: hb, body: { method: 'manual' } });
    await J(`/api/admin/projects/${cp2.j.project.id}`, { method: 'PUT', headers: { cookie }, body: { paid: true } });
    ok((await J('/api/my/referral', { headers: ha })).j.credit === 3, "ikkinchi xaridda mukofot takrorlanmaydi");
    // bonusni ishlatish
    const cp3 = await J('/api/my/projects', { method: 'POST', headers: ha, body: { name: 'A sayt', template: 'salon', data: tpl } });
    const m3 = await J(`/api/my/projects/${cp3.j.project.id}/checkout`, { method: 'POST', headers: ha, body: { method: 'manual' } });
    ok(m3.j.payment.usd === 7, "bonus hisobga olindi: $7", m3.j.payment);
    await J(`/api/admin/projects/${cp3.j.project.id}`, { method: 'PUT', headers: { cookie }, body: { paid: true } });
    const r4 = await J('/api/my/referral', { headers: ha });
    ok(r4.j.credit === 0 && r4.j.next.usd === 10, 'bonus ishlatildi, balans 0', r4.j);
    // o'z-o'ziga taklif: ikki marta bir xil kod bilan sozlama
    const st = await J('/api/admin/settings', { headers: { cookie } });
    const put = await J('/api/admin/settings', { method: 'PUT', headers: { cookie }, body: { ...st.j, notify: {}, referral: { enabled: true, discountPct: 50, rewardUsd: 5 } } });
    ok((await J('/api/my/referral', { headers: ha })).j.discountPct === 50, 'admin referal sozlamasini o\'zgartira oladi', put.j);
  } catch (e) { fail++; console.log('  XATO', e.message); }
  srv.kill();
  console.log(`\nNatija: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
