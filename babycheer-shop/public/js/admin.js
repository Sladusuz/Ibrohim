/* BabyCheer admin paneli (Telegram Mini App). Kirish: Telegram imzosi + ADMIN_IDS. */
(function () {
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
  const haptic = (t) => { try { tg && tg.HapticFeedback && (t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : t === 'err' ? tg.HapticFeedback.notificationOccurred('error') : tg.HapticFeedback.impactOccurred('light')); } catch { /* */ } };

  const fmtDate = (v) => { const d = new Date(v), p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const STATUS = { new: ['🆕 Yangi', 'brand'], confirmed: ['✅ Tasdiqlandi', 'ok'], shipping: ["🚚 Yo'lda", 'warn'], delivered: ['🎉 Yetkazildi', 'ok'], cancelled: ['❌ Bekor', 'bad'] };
  const PALETTE = { "Ko'k": '#2b59ff', Qizil: '#e5262b', Oq: '#eef0f4', Qora: '#1b1d24', Yashil: '#12a66b', Pushti: '#f0589f', Sariq: '#f5b800', "To'q sariq": '#ff7a1a', Zangori: '#10a5b8', Kulrang: '#7d8594' };
  const ICONS = { car: 'Mashina', stroller: 'Kalyaska', trike: 'Velokalyaska', moto: 'Mototsikl', scooter: 'Samokat' };
  const PAY = { cash: 'Naqd', card: 'Karta (qabul qilganda)', online: 'Onlayn', transfer: "Karta o'tkazmasi" };

  const A = { data: null, tab: 'orders', filter: 'all', q: '' };

  async function api(path, body, raw, type) {
    const res = await fetch('/api/' + path, {
      method: body || raw ? 'POST' : 'GET',
      headers: { 'x-tg-init-data': (tg && tg.initData) || '', ...(raw ? { 'content-type': type } : body ? { 'content-type': 'application/json' } : {}) },
      body: raw || (body ? JSON.stringify(body) : undefined),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(j.error || 'Server xatosi'); e.status = res.status; throw e; }
    return j;
  }
  let toastT;
  function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(() => (t.className = ''), 2600); }
  const confirmBox = (msg) => new Promise((res) => (tg && tg.showConfirm ? tg.showConfirm(msg, res) : res(confirm(msg))));

  const cat = (id) => A.data.categories.find((c) => c.id === Number(id));
  const imgsOf = (p) => (p.images && p.images.length ? p.images : p.photo ? [p.photo] : []);
  const imgTag = (id) => `<img src="/photo/${esc(id)}" alt="" loading="lazy" decoding="async" onload="this.classList.add('ld');this.parentNode.classList.add('done')">`;
  const media = (p, idx = 0) => {
    const hex = (p.colors[0] || {}).hex || '#2b59ff', icon = (cat(p.category_id) || {}).icon || 'car', im = imgsOf(p)[idx];
    return `<div class="media${im ? ' ph' : ''}" style="--tint:${hex}" data-icon="${esc(icon)}" data-hex="${esc(hex)}">${im ? imgTag(im) : window.BC.art(icon, hex)}</div>`;
  };
  document.addEventListener('error', (e) => { // rasm yuklanmasa illyustratsiya
    const im = e.target, m = im && im.tagName === 'IMG' && im.closest('.media');
    if (m) { m.classList.remove('ph'); m.classList.add('done'); m.innerHTML = window.BC.art(m.dataset.icon || 'car', m.dataset.hex || '#2b59ff'); }
  }, true);

  // ---------- chizish ----------
  function draw() {
    if (!A.data) return;
    const d = A.data, today = new Date().toDateString();
    const live = d.orders.filter((o) => o.status !== 'cancelled');
    const low = d.products.filter((p) => p.active && p.stock <= 3).length;
    $('#top').innerHTML = `<div class="a-head"><div class="logo"><i>🔧</i>Admin</div><span class="top-sp"></span><button class="icon-btn tgl" data-theme-toggle aria-label="Kun va tun rejimi"><svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><svg class="moon" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></button><button class="icon-btn" data-reload aria-label="Yangilash"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg></button></div>`;
    const stats = `<div class="stats"><div class="stat"><small>Bugungi buyurtma</small><b class="num">${d.orders.filter((o) => new Date(o.created_at).toDateString() === today).length}</b></div>
      <div class="stat"><small>Yangi (kutilmoqda)</small><b class="num">${d.orders.filter((o) => o.status === 'new').length}</b></div>
      <div class="stat"><small>Tushum (oxirgi ${d.orders.length} ta)</small><b class="num">${money(live.reduce((s, o) => s + o.total, 0))}</b></div>
      <div class="stat ${low ? 'warn' : ''}"><small>Kam qolgan (≤3)</small><b class="num">${low} ta</b></div></div>`;
    const tabs = [['orders', 'Buyurtmalar'], ['products', 'Mahsulotlar'], ['settings', 'Sozlamalar']];
    $('#view').innerHTML = `${stats}<div class="seg">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${A.tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="body"></div>`;
    ({ orders: drawOrders, products: drawProducts, settings: drawSettings })[A.tab]();
  }

  function drawOrders() {
    const f = A.filter, list = A.data.orders.filter((o) => f === 'all' || o.status === f);
    const chips = [['all', 'Hammasi'], ...Object.entries(STATUS).map(([k, v]) => [k, v[0]])];
    $('#body').innerHTML = `<div class="chips" style="margin-top:6px">${chips.map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-filter="${k}">${l}${k !== 'all' ? ` ${A.data.orders.filter((o) => o.status === k).length}` : ''}</button>`).join('')}</div>` +
      (list.length ? list.map(orderCard).join('') : '<div class="empty"><div class="em">📦</div><b>Buyurtma yo\'q</b></div>');
  }
  const orderCard = (o) => `<div class="acard"><div class="top"><b>${esc(o.no)}</b><span class="pill ${STATUS[o.status][1]}">${STATUS[o.status][0]}</span></div>
      <div class="sub">${fmtDate(o.created_at)}</div>
      <div class="who">${esc(o.name)} · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></div>
      <div class="sub">${o.delivery === 'courier' ? '🚚 ' + esc(o.address) : '🏬 Olib ketadi'}${o.comment ? `<br>💬 ${esc(o.comment)}` : ''}</div>
      <div class="sub" style="margin-top:4px">To'lov: ${esc(PAY[o.payment] || o.payment)} ${o.paid ? '<span class="pill ok">✅ to\'langan</span>' : '<span class="pill warn">to\'lanmagan</span>'}</div>
      <div class="items">${o.items.map((i) => `<div class="oline"><span>${esc(i.title)}${i.color ? ` · ${esc(i.color)}` : ''} × ${i.qty}</span><b class="num">${money(i.price * i.qty)}</b></div>`).join('')}
        <div class="oline"><span>Yetkazish</span><b>${o.delivery_fee ? money(o.delivery_fee) : 'bepul'}</b></div><div class="oline"><span><b>Jami</b></span><b class="num">${money(o.total)}</b></div></div>
      <div class="btns">${[['confirmed', '✅ Tasdiqlash'], ['shipping', "🚚 Yo'lda"], ['delivered', '🎉 Yetkazildi']].map(([k, l]) => `<button class="btn ghost ${o.status === k ? 'cur' : ''}" data-st="${o.id}:${k}">${l}</button>`).join('')}
        <button class="btn bad ${o.status === 'cancelled' ? 'cur' : ''}" data-st="${o.id}:cancelled">❌ Bekor</button>
        <button class="btn ${o.paid ? 'ghost' : 'ok'} full" data-paid="${o.id}:${o.paid ? 0 : 1}">${o.paid ? "↩️ To'lanmagan deb belgilash" : "💰 To'langan deb belgilash"}</button></div></div>`;

  function drawProducts() {
    const q = A.q.trim().toLowerCase(), list = A.data.products.filter((p) => !q || p.title.toLowerCase().includes(q));
    $('#body').innerHTML = `<label class="search" style="margin-top:6px"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="pq" type="search" placeholder="Mahsulot qidirish..." value="${esc(A.q)}"></label>
      <button class="btn add-fab" data-edit="new">➕ Yangi mahsulot</button>` +
      list.map((p) => `<button class="prow ${p.active ? '' : 'off'}" data-edit="${p.id}">${media(p)}<div><h3>${esc(p.title)}</h3><small>${esc((cat(p.category_id) || {}).name || '—')}${p.active ? '' : ' · yashirin'}</small><div class="price"><b class="num">${money(p.price)}</b>${p.old_price > p.price ? `<s class="num">${money(p.old_price)}</s>` : ''}</div></div>
        <span class="pill ${p.stock === 0 ? 'bad' : p.stock <= 3 ? 'warn' : 'ok'}">${p.stock} ta</span></button>`).join('');
    const pq = $('#pq'); let t; pq.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { A.q = e.target.value; const pos = e.target.selectionStart; drawProducts(); const n = $('#pq'); n.focus(); n.setSelectionRange(pos, pos); }, 250); });
  }

  function drawSettings() {
    const s = A.data.settings, fld = (k, l, t = 'text') => `<label class="fld"><span>${l}</span><input data-set="${k}" type="${t}" value="${esc(s[k])}"></label>`;
    $('#body').innerHTML = `<div class="fs"><h3>Do'kon sozlamalari</h3>${fld('name', "Do'kon nomi")}${fld('phone', 'Telefon', 'tel')}${fld('telegram', 'Telegram (@siz)')}${fld('channel', 'Telegram kanal havolasi')}${fld('instagram', 'Instagram havolasi')}
        <div class="row2c"><label class="fld"><span>Bepul yetkazish (so'mdan)</span><input data-set="freeFrom" inputmode="numeric" value="${esc(s.freeFrom)}"></label><label class="fld"><span>Yetkazish narxi</span><input data-set="deliveryFee" inputmode="numeric" value="${esc(s.deliveryFee)}"></label></div>
        ${fld('warrantyMonths', 'Kafolat (oy)')}<button class="btn block" id="saveSet">Saqlash</button></div>
      <div class="fs"><h3>Kategoriyalar</h3><div id="cats">${A.data.categories.map(catRow).join('')}</div><button class="btn ghost block" id="addCat">➕ Kategoriya qo'shish</button></div>
      <div class="fs"><h3>To'lov usullari</h3><div class="card hint" style="font-size:13px">Yoqilgan: ${A.data.payments.map((p) => `<b>${esc(p.label)}</b>`).join(', ')}.<br>Onlayn (Click/Payme) va karta o'tkazmasi Netlify'dagi <code>PAYMENT_PROVIDER_TOKEN</code> va <code>CARD_NUMBER</code> o'zgaruvchilari bilan yoqiladi.</div></div>`;
  }
  const catRow = (c) => `<div class="catrow" data-cat="${c.id}"><input value="${esc(c.name)}" data-cn><select data-ci>${Object.entries(ICONS).map(([k, v]) => `<option value="${k}" ${c.icon === k ? 'selected' : ''}>${v}</option>`).join('')}</select><button class="btn sm" data-csave="${c.id}">✓</button><button class="btn sm bad" data-cdel="${c.id}">🗑</button></div>`;

  // ---------- mahsulot muharriri ----------
  function openEditor(id) {
    const isNew = id === 'new';
    const p = isNew ? { category_id: A.data.categories[0] && A.data.categories[0].id, title: '', price: '', old_price: 0, stock: 1, badge: '', short: '', description: '', colors: [], specs: {}, photo: null, featured: false, active: true }
      : JSON.parse(JSON.stringify(A.data.products.find((x) => x.id === Number(id))));
    const st = { ...p, specs: Object.entries(p.specs || {}), colors: [...(p.colors || [])], images: imgsOf(p) };
    const sheet = $('#sheet'); sheet.hidden = false; document.body.style.overflow = 'hidden';
    const fld = (k, l, ex = '', tag = 'input') => `<label class="fld"><span>${l}</span><${tag} data-f="${k}" ${ex}${tag === 'input' ? ` value="${esc(st[k] ?? '')}"` : ''}>${tag === 'textarea' ? esc(st[k] || '') + '</textarea>' : ''}</label>`;
    const draw2 = () => {
      sheet.innerHTML = `<div class="sheet-bar"><button class="back" data-close aria-label="Yopish"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><h2>${isNew ? 'Yangi mahsulot' : 'Tahrirlash'}</h2></div>
        <div class="fs" style="margin-top:6px"><h3>Rasmlar (${st.images.length}/6)</h3><div class="imgs">${st.images.map((id, i) => `<div class="it"><div class="media ph" data-icon="car" data-hex="#2b59ff">${imgTag(id)}</div><button class="x" data-irm="${i}" aria-label="O'chirish">✕</button>${i === 0 ? '<span class="main">Asosiy</span>' : `<button class="mk" data-imain="${i}">Asosiy qilish</button>`}</div>`).join('')}${st.images.length < 6 ? '<button class="add" id="pick">📷<br>Rasm qo\'shish</button>' : ''}</div><input id="file" type="file" accept="image/*" multiple hidden></div>
        <div class="fs"><h3>Asosiy</h3>${fld('title', 'Nomi', 'autocomplete="off"')}<label class="fld"><span>Kategoriya</span><select data-f="category_id">${A.data.categories.map((c) => `<option value="${c.id}" ${c.id === Number(st.category_id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <div class="row2c">${fld('price', "Narxi (so'm)", 'inputmode="numeric"')}${fld('old_price', 'Eski narx (0 = yo\'q)', 'inputmode="numeric"')}</div>
          <div class="row2c">${fld('stock', 'Omborda (ta)', 'inputmode="numeric"')}${fld('badge', 'Belgi (Yangi, Chegirma...)')}</div>
          ${fld('short', 'Qisqa tavsif')}${fld('description', 'To\'liq tavsif', 'rows="4"', 'textarea')}</div>
        <div class="fs"><h3>Ranglar</h3><div class="presets">${Object.entries(PALETTE).map(([n, h]) => `<button data-preset="${esc(n)}"><i style="background:${h}"></i>${esc(n)}</button>`).join('')}</div>
          ${st.colors.map((c, i) => `<div class="crow"><input type="color" value="${esc(c.hex)}" data-chex="${i}"><input type="text" value="${esc(c.name)}" data-cname="${i}" placeholder="Rang nomi"><button class="x" data-crm="${i}">✕</button></div>`).join('')}
          <button class="btn ghost sm" data-cadd>➕ Rang qo'shish</button></div>
        <div class="fs"><h3>Xususiyatlar</h3>${st.specs.map(([k, v], i) => `<div class="srow"><input value="${esc(k)}" data-sk="${i}" placeholder="Nomi (Yosh)"><input value="${esc(v)}" data-sv="${i}" placeholder="Qiymati (3-8 yosh)"><button class="x" data-srm="${i}">✕</button></div>`).join('')}
          <button class="btn ghost sm" data-sadd>➕ Xususiyat qo'shish</button></div>
        <div class="togs"><label>Bosh sahifada «Mashhur»<span class="switch"><input type="checkbox" data-f="featured" ${st.featured ? 'checked' : ''}></span></label><label>Do'konda ko'rinsin<span class="switch"><input type="checkbox" data-f="active" ${st.active ? 'checked' : ''}></span></label></div>
        <div id="serr"></div>
        <div class="sheet-foot">${isNew ? '' : '<button class="btn bad" id="del">🗑</button>'}<button class="btn grow" id="save">Saqlash</button></div>`;
    };
    // matn maydonlarini holatga yig'ish (qayta chizishdan oldin)
    const collect = () => {
      $$('[data-f]', sheet).forEach((el) => { st[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; });
      $$('[data-sk]', sheet).forEach((el) => { st.specs[el.dataset.sk][0] = el.value; });
      $$('[data-sv]', sheet).forEach((el) => { st.specs[el.dataset.sv][1] = el.value; });
      $$('[data-cname]', sheet).forEach((el) => { st.colors[el.dataset.cname].name = el.value; });
      $$('[data-chex]', sheet).forEach((el) => { st.colors[el.dataset.chex].hex = el.value; });
    };
    const close = () => { sheet.hidden = true; sheet.innerHTML = ''; document.body.style.overflow = ''; };
    draw2();
    sheet.onclick = async (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.close !== undefined) return close();
      if (t.id === 'pick') return $('#file').click();
      if (t.dataset.irm) { collect(); st.images.splice(Number(t.dataset.irm), 1); return draw2(); }
      if (t.dataset.imain) { collect(); const [x] = st.images.splice(Number(t.dataset.imain), 1); st.images.unshift(x); return draw2(); }
      if (t.dataset.preset) { collect(); st.colors.push({ name: t.dataset.preset, hex: PALETTE[t.dataset.preset] }); return draw2(); }
      if (t.dataset.cadd !== undefined) { collect(); st.colors.push({ name: '', hex: '#2b59ff' }); return draw2(); }
      if (t.dataset.crm) { collect(); st.colors.splice(Number(t.dataset.crm), 1); return draw2(); }
      if (t.dataset.sadd !== undefined) { collect(); st.specs.push(['', '']); return draw2(); }
      if (t.dataset.srm) { collect(); st.specs.splice(Number(t.dataset.srm), 1); return draw2(); }
      if (t.id === 'del') {
        if (!(await confirmBox(`«${st.title}» o'chirilsinmi? Buyurtmalar tarixi saqlanadi.`))) return;
        try { await api('admin/product/delete', { id: p.id }); A.data.products = A.data.products.filter((x) => x.id !== p.id); close(); draw(); toast("O'chirildi 🗑"); haptic('ok'); } catch (err) { toast(err.message, true); }
        return;
      }
      if (t.id === 'save') {
        collect();
        const specs = {}; st.specs.forEach(([k, v]) => { if (k.trim() && v.trim()) specs[k.trim()] = v.trim(); });
        t.disabled = true;
        try {
          const { product } = await api('admin/product', { id: isNew ? undefined : p.id, category_id: st.category_id, title: st.title, price: st.price, old_price: st.old_price || 0, stock: st.stock || 0, badge: st.badge, short: st.short, description: st.description, colors: st.colors.filter((c) => c.name.trim()), specs, images: st.images, featured: st.featured, active: st.active });
          const i = A.data.products.findIndex((x) => x.id === product.id); i >= 0 ? (A.data.products[i] = product) : A.data.products.push(product);
          close(); draw(); toast('Saqlandi ✅'); haptic('ok');
        } catch (err) { $('#serr').innerHTML = `<div class="alert">${esc(err.message)}</div>`; haptic('err'); t.disabled = false; }
      }
    };
    sheet.onchange = async (e) => {
      if (e.target.id !== 'file' || !e.target.files.length) return;
      collect();
      const files = [...e.target.files].slice(0, 6 - st.images.length);
      let ok = 0;
      for (const [i, f] of files.entries()) {
        try {
          toast(`Rasm yuklanmoqda ${i + 1}/${files.length}...`);
          const blob = await shrink(f, 1200, 0.82);
          st.images.push((await api('admin/upload', null, blob, 'image/jpeg')).photo); ok++;
        } catch (err) { toast(err.message, true); }
      }
      if (ok) { draw2(); toast(ok > 1 ? `${ok} ta rasm yuklandi ✅` : 'Rasm yuklandi ✅'); }
    };
  }

  function shrink(file, max, q) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => (b ? res(b) : rej(new Error('Rasmni qayta ishlab bo\'lmadi'))), 'image/jpeg', q);
      };
      img.onerror = () => rej(new Error("Rasmni o'qib bo'lmadi"));
      img.src = url;
    });
  }

  // ---------- hodisalar ----------
  document.addEventListener('click', async (e) => {
    const t = e.target, b = (s) => t.closest(s);
    let el;
    if ((el = b('[data-tab]'))) { A.tab = el.dataset.tab; return draw(); }
    if ((el = b('[data-filter]'))) { A.filter = el.dataset.filter; return drawOrders(); }
    if (b('[data-theme-toggle]')) { try { localStorage.setItem('bc.theme', JSON.stringify(cur() === 'dark' ? 'light' : 'dark')); } catch { /* */ } theme(true); haptic(); return; }
    if (b('[data-reload]')) { await load(true); return toast('Yangilandi'); }
    if ((el = b('[data-edit]'))) return openEditor(el.dataset.edit);
    if ((el = b('[data-st]'))) {
      const [id, status] = el.dataset.st.split(':');
      if (status === 'cancelled' && !(await confirmBox('Buyurtma bekor qilinsinmi? Mahsulotlar omborga qaytadi.'))) return;
      return orderAction({ id: Number(id), status });
    }
    if ((el = b('[data-paid]'))) { const [id, v] = el.dataset.paid.split(':'); return orderAction({ id: Number(id), paid: v === '1' }); }
    if (b('#saveSet')) {
      const body = {}; $$('[data-set]').forEach((i) => { body[i.dataset.set] = i.value; });
      try { A.data.settings = (await api('admin/settings', body)).settings; toast('Saqlandi ✅'); haptic('ok'); } catch (err) { toast(err.message, true); haptic('err'); }
      return;
    }
    if (b('#addCat')) { $('#cats').insertAdjacentHTML('beforeend', catRow({ id: '', name: '', icon: 'car' })); return; }
    if ((el = b('[data-csave]'))) {
      const row = el.closest('.catrow');
      try { await api('admin/category', { id: el.dataset.csave || undefined, name: $('[data-cn]', row).value, icon: $('[data-ci]', row).value }); await load(true); toast('Saqlandi ✅'); } catch (err) { toast(err.message, true); }
      return;
    }
    if ((el = b('[data-cdel]'))) {
      if (!el.dataset.cdel) return el.closest('.catrow').remove();
      if (!(await confirmBox("Kategoriya o'chirilsinmi?"))) return;
      try { await api('admin/category/delete', { id: el.dataset.cdel }); await load(true); toast("O'chirildi 🗑"); } catch (err) { toast(err.message, true); }
    }
  });
  async function orderAction(body) {
    try {
      const { order } = await api('admin/order', body);
      const i = A.data.orders.findIndex((o) => o.id === order.id); if (i >= 0) A.data.orders[i] = order;
      draw(); haptic('ok'); toast(body.status ? 'Holat yangilandi, mijozga xabar ketdi' : "To'lov holati yangilandi");
    } catch (err) { toast(err.message, true); haptic('err'); }
  }

  async function load(keep) {
    try { A.data = await api('admin/state'); draw(); }
    catch (e) {
      if (keep) return toast(e.message, true);
      $('#view').innerHTML = e.status === 403 ? '<div class="empty"><div class="em">🔒</div><b>Ruxsat yo\'q</b>Bu bo\'lim faqat adminlar uchun</div>'
        : `<div class="empty"><div class="em">📡</div><b>Yuklab bo'lmadi</b>${esc(e.message)}<div style="margin-top:16px"><button class="btn" onclick="location.reload()">Qayta urinish</button></div></div>`;
    }
  }

  const pref = () => { try { return JSON.parse(localStorage.getItem('bc.theme')); } catch { return null; } };
  const cur = () => pref() || (tg && tg.colorScheme ? (tg.colorScheme === 'dark' ? 'dark' : 'light') : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function theme(animate) {
    const root = document.documentElement;
    if (animate === true) { root.classList.add('theming'); setTimeout(() => root.classList.remove('theming'), 600); }
    root.dataset.theme = cur();
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    try { if (tg) { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); } } catch { /* */ }
  }
  if (tg) { try { tg.ready(); tg.expand(); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); tg.onEvent('themeChanged', () => { if (!pref()) theme(true); }); } catch { /* */ } }
  theme();

  if (!(tg && tg.initData)) {
    $('#top').innerHTML = '<div class="logo"><i>🔧</i>Admin</div>';
    $('#view').innerHTML = '<div class="empty"><div class="em">🔐</div><b>Telegram ichida oching</b>Botga <code>/admin</code> yozing va «Admin panelni ochish» tugmasini bosing</div>';
  } else {
    $('#view').innerHTML = '<div class="skel" style="height:90px"></div><div class="skel" style="height:300px;margin-top:14px"></div>';
    load();
  }
})();
