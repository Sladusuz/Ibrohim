(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');
  const LANGS = ['uz', 'ru', 'en'];
  let D = null, view = 'dash';

  /* ---------- api ---------- */
  async function api(path, method = 'GET', body) {
    const r = await fetch('/api/admin/' + path, { method, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'bs' }, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (r.status === 401 && path !== 'login') { D = null; boot(); throw new Error(j.error || 'Sessiya tugadi'); }
    if (!r.ok) throw new Error(j.error || 'Xatolik: ' + r.status);
    return j;
  }
  let tt;
  function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : ''); clearTimeout(tt); tt = setTimeout(() => { t.className = ''; }, 3200); }
  const guard = fn => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message, true); } };

  /* ---------- boot / auth ---------- */
  async function boot() {
    const s = await fetch('/api/admin/status').then(r => r.json()).catch(() => ({}));
    if (s.setup) return authScreen(true);
    if (!s.authed) return authScreen(false);
    D = await api('data'); shell();
  }
  function authScreen(setup) {
    app.innerHTML = `<div class="center"><form class="box" id="af" novalidate>
      <div class="brand"><svg viewBox="0 0 64 64"><use href="/assets/logo.svg#mark"/></svg>BabuSweet Admin</div>
      <h1>${setup ? 'Parol yarating' : 'Kirish'}</h1>
      <p>${setup ? 'Birinchi marta kirish. Admin paneli uchun kuchli parol o‘rnating (kamida 8 belgi).' : 'Davom etish uchun parolni kiriting.'}</p>
      <label>Parol<input type="password" name="pw" autocomplete="${setup ? 'new-password' : 'current-password'}" required autofocus></label>
      ${setup ? '<label>Parolni takrorlang<input type="password" name="pw2" autocomplete="new-password" required></label>' : ''}
      <div class="err" id="ae" role="alert"></div>
      <button class="btn pri" type="submit">${setup ? 'Yaratish' : 'Kirish'}</button></form></div>`;
    $('#af').addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, err = $('#ae'); err.textContent = '';
      if (setup && f.pw.value !== f.pw2.value) { err.textContent = 'Parollar mos emas'; return; }
      try { await api(setup ? 'setup' : 'login', 'POST', { password: f.pw.value }); boot(); } catch (x) { err.textContent = x.message; }
    });
  }

  /* ---------- shell ---------- */
  const NAV = [['dash', '◧', 'Boshqaruv'], ['products', '◈', 'Mahsulotlar'], ['news', '✎', 'Yangiliklar'], ['messages', '✉', 'Xabarlar'], ['settings', '⚙', 'Sozlamalar'], ['security', '🔒', 'Xavfsizlik']];
  function shell() {
    const unread = D.messages.filter(m => !m.read).length;
    app.innerHTML = `<div class="shell"><aside class="side" id="side">
      <div class="brand"><svg viewBox="0 0 64 64"><use href="/assets/logo.svg#mark"/></svg>BabuSweet</div>
      ${NAV.map(([k, i, n]) => `<a data-v="${k}" class="${view === k ? 'on' : ''}"><span>${i}</span>${n}${k === 'messages' && unread ? `<span class="badge">${unread}</span>` : ''}</a>`).join('')}
      <div class="sp"></div>
      <a href="/" target="_blank" rel="noopener"><span>↗</span>Saytni ochish</a>
      <a id="logout"><span>⏻</span>Chiqish</a></aside>
      <main class="main"><div class="top"><div class="row"><button class="btn burger" id="bg" aria-label="Menu">☰</button><h2 id="vt"></h2></div><div class="row" id="va"></div></div><div id="view"></div></main></div>`;
    $('#side').addEventListener('click', e => { const a = e.target.closest('[data-v]'); if (a) { view = a.dataset.v; $('#side').classList.remove('open'); shell(); } });
    $('#bg').onclick = () => $('#side').classList.toggle('open');
    $('#logout').onclick = guard(async () => { await api('logout', 'POST'); D = null; boot(); });
    ({ dash, products, news, messages, settings, security })[view]();
  }
  const title = (t, actions = '') => { $('#vt').textContent = t; $('#va').innerHTML = actions; };
  const fdate = d => d ? new Date(d).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  /* ---------- dashboard ---------- */
  function dash() {
    title('Boshqaruv paneli');
    const P = D.products, unread = D.messages.filter(m => !m.read).length;
    $('#view').innerHTML = `<div class="grid4">
      <div class="stat"><b>${P.filter(p => p.status === 'active').length}</b><span>Faol mahsulotlar</span></div>
      <div class="stat"><b>${P.filter(p => p.status === 'soon').length}</b><span>Tez orada chiqadi</span></div>
      <div class="stat"><b>${D.news.filter(n => n.published).length}</b><span>E’lon qilingan yangiliklar</span></div>
      <div class="stat"><b>${unread}</b><span>O‘qilmagan xabarlar</span></div></div>
      <div class="card"><h3>Tezkor amallar</h3><div class="row" style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn pri" data-go="products" data-new="1">+ Mahsulot qo‘shish</button><button class="btn" data-go="news" data-new="1">+ Yangilik</button><button class="btn" data-go="messages">Xabarlarni ko‘rish</button><a class="btn" href="/" target="_blank" rel="noopener">Saytni ko‘rish ↗</a></div></div>
      <div class="card"><h3>So‘nggi xabarlar</h3>${D.messages.slice(0, 4).map(m => `<p style="margin:6px 0"><b>${esc(m.name)}</b> · ${esc(m.contact)} <small style="color:var(--mute)">· ${fdate(m.date)}</small></p>`).join('') || '<p style="color:var(--mute)">Hozircha xabar yo‘q</p>'}</div>
      <div class="card"><h3>Qanday ishlaydi?</h3><p style="color:var(--mute)">Bu yerda qilingan har bir o‘zgarish saqlanishi bilan saytda ko‘rinadi — sahifani yangilash kifoya. Yangi mahsulot qo‘shsangiz, u saytdagi kolleksiyada avtomatik paydo bo‘ladi. “Tez orada” holatidagi mahsulot saytda “Tez orada” belgisi bilan ko‘rsatiladi.</p></div>`;
    $$('[data-go]').forEach(b => b.onclick = () => { view = b.dataset.go; shell(); if (b.dataset.new) (view === 'products' ? prodForm() : newsForm()); });
  }

  /* ---------- image upload (client-side resize -> webp) ---------- */
  function fileToDataUrl(file, max = 1400) {
    return new Promise((res, rej) => {
      if (!/^image\//.test(file.type)) return rej(new Error('Faqat rasm fayli'));
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        let d = c.toDataURL('image/webp', .86); if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/jpeg', .86);
        res(d);
      };
      img.onerror = () => rej(new Error('Rasm o‘qib bo‘lmadi'));
      img.src = u;
    });
  }
  function imgField(root, getVal, setVal) {
    const pv = $('.pv', root), inp = $('input[type=file]', root);
    const paint = () => { pv.style.backgroundImage = getVal() ? `url("${getVal()}")` : ''; };
    paint();
    inp.onchange = guard(async () => {
      const f = inp.files[0]; if (!f) return;
      const { path } = await api('upload', 'POST', { dataUrl: await fileToDataUrl(f) });
      setVal(path); paint(); toast('Rasm yuklandi');
    });
  }

  /* ---------- i18n inputs ---------- */
  function triField(name, label, val = {}, area = false) {
    return `<div class="fieldset" data-tri="${name}"><legend>${label}</legend>
      <div class="tabs">${LANGS.map((l, i) => `<button type="button" data-l="${l}" class="${i ? '' : 'on'}">${l.toUpperCase()}</button>`).join('')}</div>
      ${LANGS.map((l, i) => area ? `<textarea data-l="${l}" ${i ? 'hidden' : ''}>${esc(val[l] || '')}</textarea>` : `<input data-l="${l}" value="${esc(val[l] || '')}" ${i ? 'hidden' : ''}>`).join('')}</div>`;
  }
  function wireTri(root) {
    $$('[data-tri]', root).forEach(fs => $$('.tabs button', fs).forEach(b => b.onclick = () => {
      $$('.tabs button', fs).forEach(x => x.classList.toggle('on', x === b));
      $$('[data-l]:not(button)', fs).forEach(i => { i.hidden = i.dataset.l !== b.dataset.l; });
    }));
  }
  const readTri = (root, name) => Object.fromEntries(LANGS.map(l => [l, $(`[data-tri="${name}"] [data-l="${l}"]:not(button)`, root).value]));
  function dialog(html) {
    const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
    o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); });
    document.body.appendChild(o); return o;
  }

  /* ---------- products ---------- */
  const ST = { active: 'Faol', soon: 'Tez orada', hidden: 'Yashirin' };
  function products() {
    title('Mahsulotlar', '<button class="btn pri" id="addp">+ Mahsulot qo‘shish</button>');
    $('#addp').onclick = () => prodForm();
    const list = [...D.products].sort((a, b) => a.order - b.order);
    $('#view').innerHTML = list.length ? `<div class="plist">${list.map((p, i) => `<div class="prow"><img src="${esc(p.image)}" alt="" loading="lazy">
      <div><h4>${esc(p.name)}<span class="tag ${p.status}">${ST[p.status]}</span></h4><small><span class="dot" style="background:${esc(p.color)}"></span>${esc(p.flavor || '')} ${p.weight ? '· ' + esc(p.weight) : ''}</small></div>
      <div class="acts"><button class="btn sm" data-mv="up" data-id="${p.id}" ${i === 0 ? 'disabled' : ''} aria-label="Yuqoriga">↑</button><button class="btn sm" data-mv="down" data-id="${p.id}" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Pastga">↓</button><button class="btn sm" data-edit="${p.id}">Tahrirlash</button><button class="btn sm danger" data-del="${p.id}">O‘chirish</button></div></div>`).join('')}</div>` : '<div class="empty">Hozircha mahsulot yo‘q</div>';
    $$('[data-edit]').forEach(b => b.onclick = () => prodForm(D.products.find(p => p.id === b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = guard(async () => { if (!confirm('Mahsulot o‘chirilsinmi?')) return; await api('products/' + b.dataset.del, 'DELETE'); await reload(); toast('O‘chirildi'); }));
    $$('[data-mv]').forEach(b => b.onclick = guard(async () => { await api(`products/${b.dataset.id}/${b.dataset.mv}`, 'POST'); await reload(); }));
  }
  const reload = async () => { D = await api('data'); shell(); };
  function prodForm(p = null) {
    const x = p || { name: '', tagline: {}, desc: {}, flavor: 'Sea Salt Caramel', weight: '', category: 'Chocolate Candies', image: '', color: '#e9b24a', color2: '#2a1608', status: 'active', badge: '' };
    let image = x.image;
    const o = dialog(`<h3>${p ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h3><form class="form" novalidate>
      <div class="cols"><label>Nomi<input name="name" value="${esc(x.name)}" required maxlength="80"></label>
      <label>Holati<select name="status">${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${x.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
      <div class="upl"><div class="pv"></div><label>Rasm (kvadrat tavsiya etiladi)<input type="file" accept="image/*"></label></div>
      ${triField('tagline', 'Qisqa tavsif', x.tagline)}${triField('desc', 'To‘liq tavsif', x.desc, true)}
      <div class="cols3"><label>Ta’mi<input name="flavor" value="${esc(x.flavor)}"></label><label>Og‘irligi<input name="weight" value="${esc(x.weight)}" placeholder="masalan, 40 g"></label><label>Turi<input name="category" value="${esc(x.category)}"></label></div>
      <div class="cols3"><label>Asosiy rang<input type="color" name="color" value="${esc(x.color)}"></label><label>Fon rangi (to‘q)<input type="color" name="color2" value="${esc(x.color2)}"></label><label>Belgi (Bestseller…)<input name="badge" value="${esc(x.badge)}" maxlength="24"></label></div>
      <div class="err" role="alert"></div>
      <div class="actions"><button type="button" class="btn" data-x>Bekor qilish</button><button class="btn pri" type="submit">Saqlash</button></div></form>`);
    wireTri(o); imgField(o, () => image, v => { image = v; });
    $('[data-x]', o).onclick = () => o.remove();
    $('form', o).addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, err = $('.err', o);
      if (!f.name.value.trim()) { err.textContent = 'Nomini kiriting'; return; }
      if (!image) { err.textContent = 'Rasm yuklang'; return; }
      const body = { name: f.name.value, status: f.status.value, image, tagline: readTri(o, 'tagline'), desc: readTri(o, 'desc'), flavor: f.flavor.value, weight: f.weight.value, category: f.category.value, color: f.color.value, color2: f.color2.value, badge: f.badge.value };
      const btn = $('[type=submit]', f); btn.disabled = true;
      try { await api(p ? 'products/' + p.id : 'products', p ? 'PUT' : 'POST', body); o.remove(); await reload(); toast('Saqlandi — saytda ko‘rinadi'); } catch (x2) { err.textContent = x2.message; btn.disabled = false; }
    });
  }

  /* ---------- news ---------- */
  function news() {
    title('Yangiliklar', '<button class="btn pri" id="addn">+ Yangilik</button>');
    $('#addn').onclick = () => newsForm();
    const list = [...D.news].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    $('#view').innerHTML = list.length ? `<div class="plist">${list.map(n => `<div class="prow" style="grid-template-columns:1fr auto"><div><h4>${esc(n.title.uz || n.title.en || '—')}<span class="tag ${n.published ? 'active' : 'hidden'}">${n.published ? 'E’lon qilingan' : 'Qoralama'}</span></h4><small>${fdate(n.date)}</small></div><div class="acts"><button class="btn sm" data-edit="${n.id}">Tahrirlash</button><button class="btn sm danger" data-del="${n.id}">O‘chirish</button></div></div>`).join('')}</div>` : '<div class="empty">Yangilik yo‘q</div>';
    $$('[data-edit]').forEach(b => b.onclick = () => newsForm(D.news.find(n => n.id === b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = guard(async () => { if (!confirm('O‘chirilsinmi?')) return; await api('news/' + b.dataset.del, 'DELETE'); await reload(); }));
  }
  function newsForm(n = null) {
    const x = n || { title: {}, body: {}, published: true, image: '' }; let image = x.image;
    const o = dialog(`<h3>${n ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}</h3><form class="form" novalidate>
      ${triField('title', 'Sarlavha', x.title)}${triField('body', 'Matn', x.body, true)}
      <div class="upl"><div class="pv"></div><label>Rasm (ixtiyoriy)<input type="file" accept="image/*"></label></div>
      <label class="chk"><input type="checkbox" name="published" ${x.published ? 'checked' : ''}> Saytda e’lon qilish</label>
      <div class="err" role="alert"></div><div class="actions"><button type="button" class="btn" data-x>Bekor qilish</button><button class="btn pri" type="submit">Saqlash</button></div></form>`);
    wireTri(o); imgField(o, () => image, v => { image = v; });
    $('[data-x]', o).onclick = () => o.remove();
    $('form', o).addEventListener('submit', async e => {
      e.preventDefault(); const err = $('.err', o); const title = readTri(o, 'title');
      if (!title.uz.trim() && !title.en.trim() && !title.ru.trim()) { err.textContent = 'Sarlavha kiriting'; return; }
      try { await api(n ? 'news/' + n.id : 'news', n ? 'PUT' : 'POST', { title, body: readTri(o, 'body'), image, published: e.target.published.checked, date: n ? n.date : undefined }); o.remove(); await reload(); toast('Saqlandi'); } catch (x2) { err.textContent = x2.message; }
    });
  }

  /* ---------- messages ---------- */
  const TYPES = { wholesale: 'Ulgurji', export: 'Eksport', private: 'Private label', other: 'Boshqa' };
  function messages() {
    title('Xabarlar');
    $('#view').innerHTML = D.messages.length ? D.messages.map(m => `<div class="msg ${m.read ? '' : 'unread'}"><header><b>${esc(m.name)}${m.company ? ' · ' + esc(m.company) : ''}</b><time>${fdate(m.date)}</time></header>
      <div class="meta"><span>${esc(TYPES[m.type] || m.type)}</span><a href="${/^[+\d\s()-]+$/.test(m.contact) ? 'tel:' + esc(m.contact.replace(/[^\d+]/g, '')) : '#'}">${esc(m.contact)}</a></div>
      ${m.msg ? `<p>${esc(m.msg)}</p>` : ''}<div class="acts">${m.read ? '' : `<button class="btn sm" data-r="${m.id}">O‘qildi</button>`}<button class="btn sm danger" data-d="${m.id}">O‘chirish</button></div></div>`).join('') : '<div class="empty">Xabarlar yo‘q</div>';
    $$('[data-r]').forEach(b => b.onclick = guard(async () => { await api(`messages/${b.dataset.r}/read`, 'POST'); await reload(); }));
    $$('[data-d]').forEach(b => b.onclick = guard(async () => { if (!confirm('O‘chirilsinmi?')) return; await api('messages/' + b.dataset.d, 'DELETE'); await reload(); }));
  }

  /* ---------- settings ---------- */
  function settings() {
    title('Sayt sozlamalari');
    const s = D.settings; const soc = s.social || {};
    $('#view').innerHTML = `<form class="form" id="sf" novalidate>
      <div class="card form"><h3>Aloqa</h3><div class="cols"><label>Brend nomi<input name="brand" value="${esc(s.brand)}"></label><label>Telefon<input name="phone" value="${esc(s.phone)}"></label></div>
      <div class="cols"><label>Email<input name="email" type="email" value="${esc(s.email)}"></label><label>Xarita havolasi (Google Maps)<input name="mapUrl" value="${esc(s.mapUrl)}"></label></div>
      <label>Manzil<input name="address" value="${esc(s.address)}"></label>${triField('hours', 'Ish vaqti', s.hours)}</div>
      <div class="card form"><h3>Bosh sahifa matnlari</h3>${triField('htitle', 'Sarlavha', s.hero.title)}${triField('hlead', 'Qisqa matn', s.hero.lead, true)}</div>
      <div class="card form"><h3>Ijtimoiy tarmoqlar (to‘liq havola)</h3><div class="cols"><label>Instagram<input name="instagram" value="${esc(soc.instagram)}" placeholder="https://instagram.com/…"></label><label>Telegram<input name="telegram" value="${esc(soc.telegram)}" placeholder="https://t.me/…"></label><label>Facebook<input name="facebook" value="${esc(soc.facebook)}"></label><label>YouTube<input name="youtube" value="${esc(soc.youtube)}"></label></div></div>
      <div class="card form"><h3>Raqamlar (sayt statistikasi)</h3>${(s.stats.length ? s.stats : [{}, {}, {}, {}]).map((x, i) => `<div class="fieldset" data-stat="${i}"><legend>Raqam ${i + 1}</legend><div class="cols3"><label>Qiymat<input type="number" min="0" name="sv${i}" value="${x.value ?? 0}"></label><label>Qo‘shimcha (+, %, /7)<input name="ss${i}" value="${esc(x.suffix || '')}" maxlength="6"></label><span></span></div>${triField('sl' + i, 'Yozuv', x.label || {})}</div>`).join('')}</div>
      <div class="card form"><h3>Eksport yo‘nalishlari</h3><label>Vergul bilan ajrating<input name="regions" value="${esc((s.exportRegions || []).join(', '))}"></label></div>
      <div class="err" role="alert" id="se"></div><div class="actions"><button class="btn pri" type="submit">Saqlash</button></div></form>`;
    const root = $('#sf'); wireTri(root);
    root.addEventListener('submit', guard(async e => {
      e.preventDefault(); const f = e.target;
      const stats = $$('[data-stat]', root).map((_, i) => ({ value: +f['sv' + i].value || 0, suffix: f['ss' + i].value, label: readTri(root, 'sl' + i) }));
      const body = { brand: f.brand.value, phone: f.phone.value, email: f.email.value, address: f.address.value, mapUrl: f.mapUrl.value, hours: readTri(root, 'hours'), social: { instagram: f.instagram.value, telegram: f.telegram.value, facebook: f.facebook.value, youtube: f.youtube.value }, hero: { title: readTri(root, 'htitle'), lead: readTri(root, 'hlead') }, stats, exportRegions: f.regions.value.split(',').map(x => x.trim()).filter(Boolean) };
      await api('settings', 'PUT', body); await reload(); toast('Sozlamalar saqlandi');
    }));
  }

  /* ---------- security ---------- */
  function security() {
    title('Xavfsizlik');
    $('#view').innerHTML = `<form class="box card form" id="pf" style="max-width:460px" novalidate><h3>Parolni almashtirish</h3>
      <label>Joriy parol<input type="password" name="cur" autocomplete="current-password" required></label>
      <label>Yangi parol (kamida 8 belgi)<input type="password" name="nw" autocomplete="new-password" required></label>
      <div class="err" role="alert"></div><button class="btn pri" type="submit">Almashtirish</button></form>`;
    $('#pf').addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, err = $('.err', f);
      try { await api('password', 'POST', { current: f.cur.value, next: f.nw.value }); f.reset(); err.textContent = ''; toast('Parol almashtirildi'); } catch (x) { err.textContent = x.message; }
    });
  }

  boot();
})();
