/* Admin panel: orders, products, customers, Telegram bot setup. Works in a browser and inside the Telegram Mini App. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const imgSrc = u => (u && !/^(\/|https?:|data:)/.test(u) ? '/' + u : u || '');
const money = n => String(Math.round(n * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' $';
const ss = { get(k) { try { return sessionStorage.getItem(k) || ''; } catch { return ''; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } }, del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } } };
const ST = { new: 'Yangi', confirmed: 'Tasdiqlandi', shipped: 'Yuborildi', done: 'Bajarildi', cancelled: 'Bekor qilindi' };
const CATS = { table: 'Stollar', balls: 'Sharlar', cues: 'Kiyular', acc: 'Aksessuarlar' };
const LANGS = ['uz', 'ru', 'en'];
const S = { token: ss.get('bl_admin_token'), tab: 'orders', orders: [], products: [], users: [], status: null, tg: null, filter: 'all', q: '', cat: 'all', loaded: {} };

/* ---------- API ---------- */
async function api(path, opt = {}) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), opt.timeout || 15000);
  try {
    const r = await fetch('/api' + path, { method: opt.method || (opt.body !== undefined || opt.raw ? 'POST' : 'GET'), headers: { authorization: 'Bearer ' + S.token, ...(opt.raw ? { 'content-type': opt.raw.type } : opt.body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: opt.raw ? opt.raw.blob : opt.body !== undefined ? JSON.stringify(opt.body) : undefined, signal: ctl.signal });
    let data = null; try { data = await r.json(); } catch { /* none */ }
    if (r.status === 401) { logout(true); return { ok: false, status: 401, data }; }
    return { ok: r.ok, status: r.status, data };
  } catch { return { ok: false, status: 0, data: null }; } finally { clearTimeout(t); }
}
function toast(m, bad) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); } el.textContent = m; el.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2600); }
function logout(expired) { S.token = ''; ss.del('bl_admin_token'); render(expired ? 'Sessiya tugadi. Qayta kiring.' : ''); }

/* ---------- login ---------- */
function loginView(msg) {
  $('#app').innerHTML = `<form class="login" id="lf"><h1>Admin panel</h1><p class="muted">Bilyard Ishlab Chiqarish</p>${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    <input type="password" id="pw" placeholder="Parol" autocomplete="current-password" required><button class="btn gold" type="submit">Kirish</button><a class="muted" href="../">← Do'konga qaytish</a></form>`;
  $('#lf').onsubmit = async e => {
    e.preventDefault(); const b = $('button', e.target); b.disabled = true;
    const r = await api('/admin/login', { body: { password: $('#pw').value } });
    b.disabled = false;
    if (r.ok && r.data.token) { S.token = r.data.token; ss.set('bl_admin_token', S.token); S.loaded = {}; render(); return; }
    const er = r.data && r.data.error;
    loginView(r.status === 503 ? "Server sozlanmagan: Netlify'da ADMIN_PASSWORD o'rnating." : r.status === 429 ? "Juda ko'p urinish. 15 daqiqadan keyin qayta urining." : er === 'credentials' ? "Parol noto'g'ri." : "Server bilan aloqa yo'q.");
  };
}

/* ---------- shell ---------- */
const ICON = {
  orders: '<path d="M6 3h12l2 5v13H4V8z"/><path d="M4 8h16M9 12h6"/>',
  products: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M16 4a3.5 3.5 0 010 7M18 14c3 .5 4 3 4 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};
function shell() {
  const newN = S.orders.filter(o => o.status === 'new').length;
  const tabs = [['orders', 'Buyurtmalar'], ['products', 'Mahsulotlar'], ['users', 'Mijozlar'], ['settings', 'Sozlamalar']];
  $('#app').innerHTML = `<div class="top"><b>Admin</b><nav class="nav" id="nav">${tabs.map(([k, n]) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''}"><svg viewBox="0 0 24 24">${ICON[k]}</svg><span>${n}</span>${k === 'orders' && newN ? `<i class="cnt">${newN}</i>` : ''}</button>`).join('')}</nav><span class="sp"></span><a href="../">Do'kon</a><button id="lo">Chiqish</button></div><main id="main"></main>`;
  $$('#nav button').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; render(); });
  $('#lo').onclick = () => logout();
}
async function ensure(tab, force) {
  if (S.loaded[tab] && !force) return true;
  const map = { orders: ['/admin/orders', 'orders'], products: ['/admin/products', 'products'], users: ['/admin/users', 'users'] };
  if (tab === 'settings') {
    const [a, b] = await Promise.all([api('/admin/status'), api('/admin/telegram')]);
    if (a.ok) S.status = a.data; if (b.ok) S.tg = b.data; S.loaded.settings = true; return a.ok;
  }
  const [path, key] = map[tab];
  const r = await api(path);
  if (!r.ok) { if (r.status !== 401) toast("Ma'lumot yuklanmadi. Internetni tekshiring.", true); return false; }
  S[key] = r.data; S.loaded[tab] = true; return true;
}
async function render(msg) {
  if (!S.token) { loginView(msg); return; }
  if (!S.loaded.orders) { const r = await api('/admin/orders'); if (!r.ok) { if (r.status !== 401) { $('#app').innerHTML = `<p class="boot">Server bilan aloqa yo'q. <button class="btn" onclick="location.reload()">Qayta urinish</button></p>`; } return; } S.orders = r.data; S.loaded.orders = true; }
  shell();
  const ok = await ensure(S.tab);
  if (!ok) { $('#main').innerHTML = `<p class="muted">Yuklanmadi. <button class="btn sm" id="rt">Qayta urinish</button></p>`; $('#rt').onclick = () => render(); return; }
  shell(); const m = $('#main');
  ({ orders: viewOrders, products: viewProducts, users: viewUsers, settings: viewSettings })[S.tab](m);
}

/* ---------- orders ---------- */
function viewOrders(m) {
  const list = S.orders.filter(o => S.filter === 'all' || o.status === S.filter);
  const cnt = k => S.orders.filter(o => k === 'all' || o.status === k).length;
  m.innerHTML = `<h1>Buyurtmalar</h1><div class="bar"><div class="chips">${['all', ...Object.keys(ST)].map(k => `<button data-f="${k}" class="${S.filter === k ? 'on' : ''}">${k === 'all' ? 'Barchasi' : ST[k]} (${cnt(k)})</button>`).join('')}</div><span class="sp"></span><button class="btn sm" id="rf">↻ Yangilash</button></div>
  ${list.length ? list.map(orderCard).join('') : '<p class="muted card">Buyurtma yo\'q.</p>'}`;
  $$('[data-f]', m).forEach(b => b.onclick = () => { S.filter = b.dataset.f; viewOrders(m); });
  $('#rf', m).onclick = async () => { await ensure('orders', true); render(); toast('Yangilandi'); };
  $$('[data-st]', m).forEach(b => b.onclick = async () => {
    b.disabled = true;
    const r = await api('/admin/orders/' + b.dataset.k, { method: 'PATCH', body: { status: b.dataset.st } });
    if (r.ok) { const i = S.orders.findIndex(o => o.key === b.dataset.k); if (i >= 0) S.orders[i] = r.data; render(); toast(ST[b.dataset.st]); } else { b.disabled = false; toast('Xatolik', true); }
  });
  $$('[data-del-order]', m).forEach(b => armDelete(b, async () => { const r = await api('/admin/orders/' + b.dataset.delOrder, { method: 'DELETE' }); if (r.ok) { S.orders = S.orders.filter(o => o.key !== b.dataset.delOrder); render(); toast("O'chirildi"); } else toast('Xatolik', true); }));
}
function orderCard(o) {
  const u = o.user || {}, d = new Date(o.ts);
  return `<article class="card"><div class="o-head"><b>${esc(o.id)}</b><span class="pill s-${esc(o.status)}">${esc(ST[o.status] || o.status)}</span><span class="muted">${esc(d.toLocaleDateString('uz-UZ'))} ${esc(d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }))}</span><span class="sp"></span><span class="o-tot">${o.total ? esc(money(o.total)) : ''}${o.quote ? ' + kelishiladi' : ''}</span></div>
  <div class="o-cust"><span>👤 <b>${esc(u.name)}</b></span>${u.phone ? `<a href="tel:+${esc(u.phone)}">📞 +${esc(u.phone)}</a>` : ''}${u.tg ? `<a href="https://t.me/${esc(u.tg)}" target="_blank" rel="noopener">✈️ @${esc(u.tg)}</a>` : ''}<span>📍 ${esc([o.city, o.address].filter(Boolean).join(', ') || '—')}</span></div>
  ${o.note ? `<p class="muted">📝 ${esc(o.note)}</p>` : ''}
  <ul class="o-items">${(o.items || []).map(i => `<li><span>${esc(i.name)}${i.variant ? ' (' + esc(i.variant) + ')' : ''} × ${i.qty}</span><b>${i.price ? esc(i.priceMax ? i.price + '–' + i.priceMax + ' $' : money(i.price * i.qty)) : 'kelishiladi'}</b></li>`).join('')}</ul>
  <div class="o-act">${Object.keys(ST).filter(k => k !== o.status).map(k => `<button class="btn sm ${k === 'confirmed' || k === 'done' ? 'dark' : ''}" data-st="${k}" data-k="${esc(o.key)}">${ST[k]}</button>`).join('')}<button class="btn sm bad" data-del-order="${esc(o.key)}">O'chirish</button></div></article>`;
}
function armDelete(btn, fn) {
  let armed = false, t;
  btn.addEventListener('click', () => {
    if (!armed) { armed = true; btn.classList.add('arm'); const old = btn.textContent; btn.textContent = 'Aniqmi?'; t = setTimeout(() => { armed = false; btn.classList.remove('arm'); btn.textContent = old; }, 3000); return; }
    clearTimeout(t); fn();
  });
}

/* ---------- products ---------- */
const slug = s => String(s || '').toLowerCase().replace(/[ʻ'’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'p-' + Math.random().toString(36).slice(2, 8);
async function saveProducts(list, msg) {
  const r = await api('/admin/products', { method: 'PUT', body: list, timeout: 30000 });
  if (r.ok) { S.products = list; toast(msg || 'Saqlandi ✓'); return true; }
  toast(r.status === 413 ? 'Juda katta' : 'Saqlanmadi. Qayta urinib ko\'ring.', true); return false;
}
function pPrice(p) { if (p.variants && p.variants.length) { const m = Math.min(...p.variants.map(v => v.price ?? Infinity)); return Number.isFinite(m) ? money(m) + ' dan' : '—'; } return p.price != null ? (p.priceMax ? money(p.price) + ' – ' + money(p.priceMax) : money(p.price)) : '—'; }
function viewProducts(m) {
  const q = S.q.toLowerCase();
  const list = S.products.filter(p => (S.cat === 'all' || p.cat === S.cat) && (!q || JSON.stringify(p.name).toLowerCase().includes(q) || p.id.includes(q)));
  m.innerHTML = `<h1>Mahsulotlar <span class="muted">(${S.products.length})</span></h1>
  <div class="bar"><input id="pq" placeholder="Nomi bo'yicha qidirish" value="${esc(S.q)}" style="max-width:260px"><div class="chips">${['all', ...Object.keys(CATS)].map(k => `<button data-c="${k}" class="${S.cat === k ? 'on' : ''}">${k === 'all' ? 'Barchasi' : CATS[k]}</button>`).join('')}</div><span class="sp"></span><button class="btn gold" id="np">+ Yangi mahsulot</button></div>
  <div class="card">${list.length ? list.map(p => `<div class="row ${p.active === false ? 'off' : ''}"><img class="thumb" src="${esc(imgSrc((p.images || [])[0]))}" alt="" onerror="this.style.visibility='hidden'"><div><div class="n">${esc((p.name && p.name.uz) || p.id)}</div><div class="m"><span class="pill">${esc(CATS[p.cat] || p.cat)}</span><span class="muted">${esc(pPrice(p))}</span>${p.active === false ? '<span class="pill s-cancelled">Yashirin</span>' : ''}</div></div><div class="a"><button class="sw ${p.active !== false ? 'on' : ''}" data-tg="${esc(p.id)}" aria-label="Faol"></button><button class="btn sm" data-ed="${esc(p.id)}">Tahrirlash</button></div></div>`).join('') : '<p class="muted">Mahsulot topilmadi.</p>'}</div>`;
  $('#pq', m).oninput = e => { S.q = e.target.value; viewProducts(m); const i = $('#pq', m); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $$('[data-c]', m).forEach(b => b.onclick = () => { S.cat = b.dataset.c; viewProducts(m); });
  $('#np', m).onclick = () => editor(null);
  $$('[data-ed]', m).forEach(b => b.onclick = () => editor(S.products.find(p => p.id === b.dataset.ed)));
  $$('[data-tg]', m).forEach(b => b.onclick = async () => { const next = S.products.map(p => p.id === b.dataset.tg ? { ...p, active: p.active === false } : p); if (await saveProducts(next)) viewProducts(m); });
}
const blank = () => ({ id: '', cat: 'acc', sort: (Math.max(0, ...S.products.map(p => p.sort || 0)) + 10), active: true, badge: {}, name: {}, desc: {}, info: {}, unit: { uz: 'dona', ru: 'шт.', en: 'pc' }, specs: { uz: [], ru: [], en: [] }, price: null, priceMax: null, variants: [], images: [] });
function editor(src) {
  const isNew = !src;
  const p = JSON.parse(JSON.stringify(src || blank()));
  const ov = document.createElement('div'); ov.className = 'overlay';
  const tri = (key, label, ta, ph) => `<div class="f"><span>${label}</span><div class="tri">${LANGS.map(l => `<label>${l.toUpperCase()}${ta ? `<textarea data-k="${key}.${l}" rows="${ta}" placeholder="${esc(ph || '')}">${esc(key.startsWith('specs') ? (p.specs[l] || []).map(r => r.join(': ')).join('\n') : (p[key] && p[key][l]) || '')}</textarea>` : `<input data-k="${key}.${l}" value="${esc((p[key] && p[key][l]) || '')}">`}</label>`).join('')}</div></div>`;
  const draw = () => {
    ov.innerHTML = `<div class="panel"><header><button type="button" id="cl">✕</button><b>${isNew ? 'Yangi mahsulot' : esc((p.name && p.name.uz) || p.id)}</b></header>
    <form id="pf" novalidate>
      ${tri('name', 'Nomi *', 0)}
      ${tri('desc', 'Qisqa tavsif (kartada ko\'rinadi)', 2)}
      <div class="grid2"><label class="f"><span>Bo'lim</span><select data-k="cat">${Object.entries(CATS).map(([k, n]) => `<option value="${k}" ${p.cat === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="f"><span>Tartib raqami (kichik — yuqorida)</span><input type="number" data-k="sort" value="${esc(p.sort)}"></label></div>
      <fieldset><legend>Narx (USD, $)</legend><div class="grid2"><label class="f"><span>Narx</span><input type="number" step="0.01" min="0" data-k="price" value="${p.price ?? ''}" placeholder="bo'sh = kelishiladi"></label><label class="f"><span>Gacha (diapazon uchun)</span><input type="number" step="0.01" min="0" data-k="priceMax" value="${p.priceMax ?? ''}" placeholder="ixtiyoriy"></label></div>
      <p class="muted">Variantlar bo'lsa (masalan Standart / Optim), narx variantlardan olinadi.</p>
      <div id="vars">${(p.variants || []).map((v, i) => `<div class="var"><input data-v="${i}.name" placeholder="Variant nomi" value="${esc(v.name && v.name.uz)}"><input data-v="${i}.price" type="number" step="0.01" placeholder="Narx" value="${v.price ?? ''}"><input data-v="${i}.priceMax" type="number" step="0.01" placeholder="Gacha" value="${v.priceMax ?? ''}"><button type="button" class="btn sm bad" data-rv="${i}">×</button></div>`).join('')}</div><button type="button" class="btn sm" id="av">+ Variant qo'shish</button></fieldset>
      <fieldset><legend>Rasmlar (birinchisi asosiy)</legend><div class="imgs">${(p.images || []).map((u, i) => `<figure class="${i === 0 ? 'main' : ''}"><img src="${esc(imgSrc(u))}" alt=""><figcaption>${i ? `<button type="button" data-mk="${i}">asosiy</button>` : '<button type="button" disabled>asosiy</button>'}<button type="button" data-ri="${i}">×</button></figcaption></figure>`).join('')}</div>
      <input type="file" id="up" accept="image/*" multiple><p class="muted" id="upst">Rasm avtomatik kichraytiriladi va tez ochiladigan formatga o'tkaziladi.</p></fieldset>
      ${tri('info', 'Batafsil tavsif (mahsulot oynasida)', 4)}
      ${tri('specs', 'Xususiyatlar — har qatorda "Nomi: qiymati"', 5, 'Uzunligi: 161 sm')}
      <div class="grid2">${tri('unit', 'Birlik (dona, to\'plam…)', 0)}${tri('badge', 'Belgi (Yangi, Mashhur…) — ixtiyoriy', 0)}</div>
      <label class="f" style="grid-auto-flow:column;justify-content:start;align-items:center;gap:10px"><input type="checkbox" data-k="active" ${p.active !== false ? 'checked' : ''} style="width:auto"><span>Saytda ko'rsatilsin</span></label>
      ${isNew ? '' : `<button type="button" class="btn bad" id="dp">Mahsulotni o'chirish</button>`}
    </form><div class="save"><button class="btn" type="button" id="cn">Bekor qilish</button><button class="btn gold" type="button" id="sv">Saqlash</button></div></div>`;
    wire();
  };
  const collect = () => {
    $$('[data-k]', ov).forEach(el => {
      const k = el.dataset.k;
      const val = el.type === 'checkbox' ? el.checked : el.value;
      if (k.includes('.')) {
        const [a, l] = k.split('.');
        if (a === 'specs') p.specs[l] = String(val).split('\n').map(x => { const i = x.indexOf(':'); return i > 0 ? [x.slice(0, i).trim(), x.slice(i + 1).trim()] : null; }).filter(r => r && r[0] && r[1]);
        else { p[a] = p[a] || {}; p[a][l] = String(val).trim(); }
      } else if (k === 'price' || k === 'priceMax') p[k] = val === '' ? null : Number(val);
      else if (k === 'sort') p.sort = Number(val) || 0;
      else p[k] = val;
    });
    $$('[data-v]', ov).forEach(el => { const [i, f] = el.dataset.v.split('.'); const v = p.variants[+i]; if (!v) return; if (f === 'name') v.name = { uz: el.value.trim(), ru: el.value.trim(), en: el.value.trim() }; else v[f] = el.value === '' ? null : Number(el.value); });
  };
  const close = () => ov.remove();
  const wire = () => {
    $('#cl', ov).onclick = close; $('#cn', ov).onclick = close;
    $('#av', ov).onclick = () => { collect(); p.variants.push({ name: { uz: '' }, price: null, priceMax: null }); draw(); };
    $$('[data-rv]', ov).forEach(b => b.onclick = () => { collect(); p.variants.splice(+b.dataset.rv, 1); draw(); });
    $$('[data-mk]', ov).forEach(b => b.onclick = () => { collect(); const [x] = p.images.splice(+b.dataset.mk, 1); p.images.unshift(x); draw(); });
    $$('[data-ri]', ov).forEach(b => b.onclick = () => { collect(); p.images.splice(+b.dataset.ri, 1); draw(); });
    $('#up', ov).onchange = async e => {
      collect(); const st = $('#upst', ov); const files = [...e.target.files];
      for (let i = 0; i < files.length; i++) {
        st.textContent = `Yuklanmoqda ${i + 1}/${files.length}…`;
        const blob = await shrink(files[i]);
        if (!blob) { toast("Rasm o'qilmadi", true); continue; }
        const r = await api('/admin/image', { raw: { type: blob.type, blob }, timeout: 40000 });
        if (r.ok && r.data.url) p.images.push(r.data.url); else toast(r.status === 413 ? 'Rasm juda katta' : 'Rasm yuklanmadi', true);
      }
      draw();
    };
    const dp = $('#dp', ov); if (dp) armDelete(dp, async () => { if (await saveProducts(S.products.filter(x => x.id !== p.id), "O'chirildi")) { close(); viewProducts($('#main')); } });
    $('#sv', ov).onclick = async () => {
      collect();
      if (!(p.name.uz || '').trim()) { toast('Nomini (UZ) kiriting', true); return; }
      if (p.price != null && !(p.price >= 0)) { toast("Narx noto'g'ri", true); return; }
      p.variants = p.variants.filter(v => v.name && v.name.uz);
      if (isNew) { p.id = slug(p.name.uz); let n = 2; const base = p.id; while (S.products.some(x => x.id === p.id)) p.id = base + '-' + n++; }
      const next = isNew ? [...S.products, p] : S.products.map(x => x.id === p.id ? p : x);
      const b = $('#sv', ov); b.disabled = true;
      if (await saveProducts(next)) { close(); viewProducts($('#main')); } else b.disabled = false;
    };
  };
  draw(); document.body.appendChild(ov);
}
async function shrink(file) {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const max = 1400, k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    let blob = await new Promise(r => c.toBlob(r, 'image/webp', .82));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
    return blob && blob.size < 2.9 * 1024 * 1024 ? blob : null;
  } catch { return null; }
}

/* ---------- customers ---------- */
function viewUsers(m) {
  const q = S.q.toLowerCase();
  const list = S.users.filter(u => !q || (u.name + u.phone + u.username + u.city).toLowerCase().includes(q));
  m.innerHTML = `<h1>Mijozlar <span class="muted">(${S.users.length})</span></h1><div class="bar"><input id="uq" placeholder="Ism, telefon yoki @username" value="${esc(S.q)}" style="max-width:300px"><span class="sp"></span><button class="btn sm" id="ru">↻ Yangilash</button></div>
  ${list.length ? list.map(u => `<article class="card"><div class="o-head"><b>${esc(u.name)}</b><span class="pill">${u.tg ? 'Telegram' : 'Sayt'}</span><span class="sp"></span><span class="muted">${esc(new Date(u.createdAt).toLocaleDateString('uz-UZ'))}</span></div>
  <div class="o-cust">${u.phone ? `<a href="tel:+${esc(u.phone)}">📞 +${esc(u.phone)}</a>` : '<span class="muted">📞 —</span>'}${u.username ? `<a href="https://t.me/${esc(u.username)}" target="_blank" rel="noopener">✈️ @${esc(u.username)}</a>` : ''}<span>📍 ${esc(u.city || '—')}</span><span>🛒 Buyurtmalar: <b>${u.orders}</b></span></div>
  <div class="o-act">${u.tg ? '' : `<input type="text" placeholder="Yangi parol (6+ belgi)" data-pw="${esc(u.id.replace('user-', ''))}" style="max-width:220px"><button class="btn sm" data-rp="${esc(u.id.replace('user-', ''))}">Parolni almashtirish</button>`}<button class="btn sm bad" data-du="${esc(u.id.replace('user-', ''))}">O'chirish</button></div></article>`).join('') : '<p class="muted card">Mijoz yo\'q.</p>'}`;
  $('#uq', m).oninput = e => { S.q = e.target.value; viewUsers(m); const i = $('#uq', m); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $('#ru', m).onclick = async () => { await ensure('users', true); render(); };
  $$('[data-rp]', m).forEach(b => b.onclick = async () => { const v = $(`[data-pw="${b.dataset.rp}"]`, m).value; if (v.length < 6) { toast('Kamida 6 belgi', true); return; } const r = await api('/admin/users/' + b.dataset.rp, { method: 'PATCH', body: { password: v } }); toast(r.ok ? 'Parol almashtirildi ✓' : 'Xatolik', !r.ok); });
  $$('[data-du]', m).forEach(b => armDelete(b, async () => { const r = await api('/admin/users/' + b.dataset.du, { method: 'DELETE' }); if (r.ok) { S.users = S.users.filter(u => u.id !== 'user-' + b.dataset.du); viewUsers(m); toast("O'chirildi"); } else toast('Xatolik', true); }));
}

/* ---------- settings ---------- */
function viewSettings(m) {
  const st = S.status || {}, tg = S.tg || {};
  const ln = st.lastNotify;
  m.innerHTML = `<h1>Sozlamalar</h1>
  <section class="card"><h3>Holat</h3><div class="kv"><b>Ma'lumotlar bazasi</b><span class="${st.storage === 'blobs' ? 'ok' : 'no'}">${st.storage === 'blobs' ? 'Netlify Blobs ✓' : 'Vaqtinchalik xotira (faqat test)'}</span><b>Telegram bot</b><span class="${tg.token ? 'ok' : 'no'}">${tg.token ? '@' + esc(tg.bot || '…') + ' ulangan ✓' : "TELEGRAM_BOT_TOKEN o'rnatilmagan"}</span><b>Webhook</b><span class="${tg.webhook ? 'ok' : 'no'}">${tg.webhook ? 'Ulangan ✓' : 'Ulanmagan'}</span><b>Xabar qabul qiluvchilar</b><span>${(tg.admins || []).length ? tg.admins.map(esc).join(', ') : '—'}${tg.chatId ? ' · chat ' + esc(tg.chatId) : ''}</span><b>Oxirgi bildirishnoma</b><span>${ln ? (ln.ok ? '<i class="ok">Yetkazildi ✓</i> ' : '<i class="no">Xato: ' + esc(ln.error || '?') + '</i> ') + esc(new Date(ln.ts).toLocaleString('uz-UZ')) : '—'}</span></div></section>
  <section class="card"><h3>Telegram botni ulash</h3>
    <p class="muted">1) Botga o'tib <b>/start</b> bosing. 2) Quyidagi tugma botni do'konga ulaydi: webhook, "Do'kon" tugmasi, nomi va buyruqlar. 3) Botga <b>admin parolini</b> yuboring — bot sizni admin qiladi va shu yerning havolasini beradi.</p>
    <div class="o-act"><button class="btn gold" id="tsetup" ${tg.token ? '' : 'disabled'}>Botni sozlash</button><button class="btn" id="ttest" ${tg.token ? '' : 'disabled'}>Test xabar yuborish</button></div>
    ${tg.chats && tg.chats.length ? `<p class="muted" style="margin-top:12px">Botga yozgan chatlar (qabul qiluvchi sifatida tanlash mumkin):</p>${tg.chats.map(c => `<div class="o-act"><span>${esc(c.name || c.type)} <code>${esc(c.id)}</code></span><button class="btn sm" data-chat="${esc(c.id)}">Tanlash</button></div>`).join('')}` : ''}
    <div class="grid2" style="margin-top:12px"><label class="f"><span>Bildirishnoma chat ID (guruh uchun)</span><input id="chat" value="${esc(tg.chatId || '')}" placeholder="masalan -100123456789"></label><div class="f"><span>&nbsp;</span><button class="btn" id="schat">Saqlash</button></div></div></section>
  <section class="card"><h3>Zaxira nusxa</h3><p class="muted">Mahsulotlar ro'yxatini yuklab oling yoki qaytaring. Xavfsizlik uchun vaqti-vaqti bilan nusxa saqlang.</p>
    <div class="o-act"><button class="btn" id="bk">Yuklab olish (JSON)</button><label class="btn" style="cursor:pointer">JSON yuklash<input type="file" id="bkin" accept="application/json" hidden></label><button class="btn bad" id="rs">Boshlang'ich ro'yxatga qaytarish</button></div></section>
  <section class="card"><h3>Xavfsizlik</h3><p class="muted">Admin paroli Netlify'dagi <code>ADMIN_PASSWORD</code> o'zgaruvchisida saqlanadi. O'zgartirish uchun uni Netlify'da yangilab, saytni qayta deploy qiling.</p></section>`;
  $('#tsetup', m).onclick = async e => { const b = e.target; b.disabled = true; const r = await api('/admin/telegram/setup', { body: {}, timeout: 30000 }); b.disabled = false; toast(r.ok && r.data.ok ? 'Bot sozlandi ✓' : 'Xatolik: ' + ((r.data && r.data.webhook && r.data.webhook.description) || 'tekshiring'), !(r.ok && r.data.ok)); await ensure('settings', true); viewSettings(m); };
  $('#ttest', m).onclick = async () => { const r = await api('/admin/telegram/test', { body: {} }); toast(r.ok ? 'Test xabar yuborildi ✓' : 'Yuborilmadi: ' + ((r.data && r.data.error) || "chat yo'q — botga admin parolini yuboring"), !r.ok); };
  const saveChat = async id => { const r = await api('/admin/telegram', { body: { chatId: id } }); toast(r.ok ? 'Saqlandi ✓' : 'Xatolik', !r.ok); await ensure('settings', true); viewSettings(m); };
  $('#schat', m).onclick = () => saveChat($('#chat', m).value);
  $$('[data-chat]', m).forEach(b => b.onclick = () => saveChat(b.dataset.chat));
  $('#bk', m).onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S.products, null, 1)], { type: 'application/json' })); a.download = 'products-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); };
  $('#bkin', m).onchange = async e => { try { const list = JSON.parse(await e.target.files[0].text()); if (!Array.isArray(list)) throw new Error('bad'); if (await saveProducts(list, `${list.length} ta mahsulot tiklandi ✓`)) { await ensure('products', true); } } catch { toast("Fayl noto'g'ri", true); } };
  armDelete($('#rs', m), async () => { try { const list = await (await fetch('../data/products.json', { cache: 'no-cache' })).json(); if (await saveProducts(list, 'Boshlang\'ich ro\'yxat tiklandi ✓')) await ensure('products', true); } catch { toast('Yuklanmadi', true); } });
}

/* ---------- boot ---------- */
setInterval(async () => { if (!S.token || document.hidden || S.tab !== 'orders' || document.querySelector('.overlay')) return; const before = S.orders.filter(o => o.status === 'new').length; const r = await api('/admin/orders'); if (r.ok) { S.orders = r.data; if (r.data.filter(o => o.status === 'new').length > before) toast('🆕 Yangi buyurtma!'); render(); } }, 45000);
try { const wa = window.Telegram && window.Telegram.WebApp; if (wa) { wa.ready(); wa.expand(); } } catch { /* ignore */ }
render();
})();
