/* BabyCheer admin paneli v2 (Telegram Mini App). Kirish: Telegram imzosi + ADMIN_IDS. */
(function () {
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
  const spaced = (v) => String(v ?? '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const digits = (v) => String(v ?? '').replace(/\D/g, '');
  const p2 = (n) => String(n).padStart(2, '0');
  const fmtDate = (v) => { const d = new Date(v); return `${p2(d.getDate())}.${p2(d.getMonth() + 1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`; };
  const ago = (v) => { const m = Math.max(0, Math.round((Date.now() - new Date(v)) / 60000)); return m < 1 ? 'hozir' : m < 60 ? `${m} daq oldin` : m < 1440 ? `${Math.round(m / 60)} soat oldin` : `${Math.round(m / 1440)} kun oldin`; };
  const haptic = (t) => { try { tg && tg.HapticFeedback && (t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : t === 'err' ? tg.HapticFeedback.notificationOccurred('error') : tg.HapticFeedback.impactOccurred('light')); } catch { /* */ } };
  const LS = { get(k, d) { try { const v = localStorage.getItem('bc.' + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('bc.' + k, JSON.stringify(v)); } catch { /* */ } } };

  const ICON = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    orders: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    reload: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  };
  const svg = (n, cls = '') => `<svg ${cls ? `class="${cls}" ` : ''}viewBox="0 0 24 24">${ICON[n]}</svg>`;
  const STATUS = { new: ['🆕 Yangi', 'brand'], confirmed: ['✅ Tasdiqlandi', 'ok'], shipping: ["🚚 Yo'lda", 'warn'], delivered: ['🎉 Yetkazildi', 'ok'], cancelled: ['❌ Bekor', 'bad'] };
  const NEXT = { new: ['confirmed', '✅ Tasdiqlash'], confirmed: ['shipping', "🚚 Yo'lga chiqarish"], shipping: ['delivered', '🎉 Yetkazildi'] };
  const PALETTE = { "Ko'k": '#2b59ff', Qizil: '#e5262b', Oq: '#eef0f4', Qora: '#1b1d24', Yashil: '#12a66b', Pushti: '#f0589f', Sariq: '#f5b800', "To'q sariq": '#ff7a1a', Zangori: '#10a5b8', Kulrang: '#7d8594' };
  const ICONS = { car: 'Mashina', stroller: 'Kalyaska', trike: 'Velokalyaska', moto: 'Mototsikl', scooter: 'Samokat' };
  const PAY = { cash: 'Naqd', card: 'Karta (qabul qilganda)', online: 'Onlayn', transfer: "Karta o'tkazmasi" };
  const DELIV = { courier: "🚚 Toshkent bo'ylab", region: "📦 O'zbekiston bo'ylab", pickup: '🏬 Olib ketish' };
  const TABS = [['home', 'Bosh', 'home'], ['orders', 'Buyurtmalar', 'orders'], ['products', 'Mahsulotlar', 'bag'], ['settings', 'Sozlamalar', 'gear']];

  const A = { data: null, tab: LS.get('atab', 'home'), ofilter: 'all', oq: '', pcat: 'all', pq: '', open: new Set() };
  const stockTimers = {};

  async function api(path, body, raw, type) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch('/api/' + path, {
        method: body || raw ? 'POST' : 'GET',
        headers: { 'x-tg-init-data': (tg && tg.initData) || '', ...(raw ? { 'content-type': type } : body ? { 'content-type': 'application/json' } : {}) },
        body: raw || (body ? JSON.stringify(body) : undefined), signal: ctl.signal,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { const e = new Error(j.error || 'Server xatosi'); e.status = res.status; throw e; }
      return j;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('Internet sekin yoki uzildi');
      if (e instanceof TypeError) throw new Error("Internetga ulanib bo'lmadi");
      throw e;
    } finally { clearTimeout(timer); }
  }
  let toastT;
  function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(() => (t.className = ''), 2600); }
  const confirmBox = (msg) => new Promise((res) => (tg && tg.showConfirm ? tg.showConfirm(msg, res) : res(confirm(msg))));

  const cat = (id) => A.data.categories.find((c) => c.id === Number(id));
  const imgsOf = (p) => (p.images && p.images.length ? p.images : p.photo ? [p.photo] : []);
  const imgTag = (id) => `<img src="/photo/${esc(id)}" alt="" loading="lazy" decoding="async" onload="this.classList.add('ld');this.parentNode.classList.add('done')">`;
  const media = (p, idx = 0) => {
    const hex = (p.colors && p.colors[0] || {}).hex || '#2b59ff', icon = (cat(p.category_id) || {}).icon || 'car', im = imgsOf(p)[idx];
    return `<div class="media${im ? ' ph' : ''}" style="--tint:${hex}" data-icon="${esc(icon)}" data-hex="${esc(hex)}">${im ? imgTag(im) : window.BC.art(icon, hex)}</div>`;
  };
  document.addEventListener('error', (e) => {
    const im = e.target, m = im && im.tagName === 'IMG' && im.closest('.media');
    if (m) { m.classList.remove('ph'); m.classList.add('done'); m.innerHTML = window.BC.art(m.dataset.icon || 'car', m.dataset.hex || '#2b59ff'); }
  }, true);

  // ================= umumiy chizish =================
  const newCount = () => A.data.orders.filter((o) => o.status === 'new').length;
  function drawTop() {
    const d = new Date(), days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    $('#top').innerHTML = `<div class="a-top"><div class="logo"><i>🔧</i></div><div class="ttl"><b>Admin panel</b><small>${days[d.getDay()]}, ${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}</small></div>
      <a class="icon-btn" href="/" aria-label="Do'konni ko'rish" style="font-size:18px">🛍</a>
      <button class="icon-btn tgl" data-theme-toggle aria-label="Kun va tun rejimi">${svg('sun', 'sun')}${svg('moon', 'moon')}</button>
      <button class="icon-btn" data-reload aria-label="Yangilash">${svg('reload')}</button></div>`;
  }
  function drawTabs() {
    const n = A.data ? newCount() : 0;
    $('#tabs').innerHTML = TABS.map(([k, l, ic]) => `<a href="#" data-tab="${k}" class="${A.tab === k ? 'on' : ''}">${svg(ic)}${l}${k === 'orders' && n ? `<span class="badge">${n}</span>` : ''}</a>`).join('');
  }
  function draw() {
    if (!A.data) return;
    drawTop(); drawTabs();
    $('#fab').hidden = A.tab !== 'products';
    $('#view').innerHTML = '<div id="body"></div>';
    ({ home: drawHome, orders: drawOrders, products: drawProducts, settings: drawSettings })[A.tab]();
  }
  function go(tab, opts = {}) {
    A.tab = tab; LS.set('atab', tab);
    if (opts.ofilter) A.ofilter = opts.ofilter;
    if (opts.pcat) A.pcat = opts.pcat;
    draw(); window.scrollTo(0, 0);
  }

  // ================= BOSH SAHIFA =================
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  function drawHome() {
    const d = A.data, now = new Date(), live = d.orders.filter((o) => o.status !== 'cancelled');
    const today = live.filter((o) => sameDay(o.created_at, now));
    const rev = today.reduce((s, o) => s + o.total, 0);
    const fresh = d.orders.filter((o) => o.status === 'new'), shipping = d.orders.filter((o) => o.status === 'shipping').length;
    const low = d.products.filter((p) => p.active && p.stock <= 3).sort((a, b) => a.stock - b.stock);
    const user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
    // oxirgi 7 kun
    const wd = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'];
    const days = Array.from({ length: 7 }, (_, i) => { const x = new Date(now); x.setDate(now.getDate() - (6 - i)); const os = live.filter((o) => sameDay(o.created_at, x)); return { label: wd[x.getDay()], n: os.length, sum: os.reduce((s, o) => s + o.total, 0), today: i === 6 }; });
    const max = Math.max(1, ...days.map((x) => x.n));
    $('#body').innerHTML = `
      <section class="a-hero"><div class="hi">Salom${user.first_name ? ', ' + esc(user.first_name) : ''}! 👋</div><small>Bugungi tushum</small><div class="big num">${money(rev)}</div>
        <div class="pills"><span>📦 ${today.length} ta buyurtma</span><span>🆕 ${fresh.length} ta yangi</span><span>🚚 ${shipping} ta yo'lda</span></div></section>
      <div class="kpis">
        <button class="kpi ${fresh.length ? 'hot' : ''}" data-go="orders:new"><span class="go">›</span><div class="ic">🆕</div><small>Yangi buyurtmalar</small><b class="num">${fresh.length}</b></button>
        <button class="kpi" data-go="orders:all"><span class="go">›</span><div class="ic">💰</div><small>Tushum (oxirgi ${d.orders.length} ta)</small><b class="num" style="font-size:17px">${money(live.reduce((s, o) => s + o.total, 0))}</b></button>
        <button class="kpi ${low.length ? 'hot' : ''}" data-go="products:low"><span class="go">›</span><div class="ic">⚠️</div><small>Kam qolgan (≤3)</small><b class="num">${low.length} ta</b></button>
        <button class="kpi" data-go="products:all"><span class="go">›</span><div class="ic">🛍</div><small>Mahsulotlar</small><b class="num">${d.products.filter((p) => p.active).length} / ${d.products.length}</b></button>
      </div>
      <section class="a-sec"><h2>Oxirgi 7 kun</h2><div class="acard" style="margin-top:0"><div class="bars">${days.map((x) => `<div class="bc ${x.today ? 'today' : ''}"><em>${x.n || ''}</em><i style="height:${Math.max(4, (x.n / max) * 100)}%"></i><span>${x.label}</span></div>`).join('')}</div>
        <div class="sub" style="margin-top:8px;text-align:center">Haftalik tushum: <b>${money(days.reduce((s, x) => s + x.sum, 0))}</b> · ${days.reduce((s, x) => s + x.n, 0)} ta buyurtma</div></div></section>
      <section class="a-sec"><h2>Diqqat talab qiladi</h2><div class="acard" style="margin-top:0">
        ${fresh.slice(0, 3).map((o) => `<div class="lrow"><div class="tx"><b>${esc(o.no)} · ${esc(o.name)}</b><small>${money(o.total)} · ${ago(o.created_at)}</small></div><button class="btn sm ok" data-st="${o.id}:confirmed">✅ Tasdiqlash</button></div>`).join('')}
        ${low.slice(0, 4).map((p) => `<div class="lrow"><div class="tx"><b>${esc(p.title)}</b><small>${p.stock === 0 ? '❌ Tugagan' : '⚠️ Kam qoldi'}</small></div>${stepper(p)}</div>`).join('')}
        ${!fresh.length && !low.length ? '<div class="empty-s">Hammasi joyida 🎉</div>' : ''}</div></section>
      <section class="a-sec"><h2>Tezkor amallar</h2><div class="quick">
        <button data-act="newproduct"><i>➕</i>Yangi mahsulot</button><button data-go="orders:all"><i>📦</i>Buyurtmalar</button>
        ${d.owner ? '<button data-act="invite"><i>🔗</i>Admin taklif qilish</button>' : '<button data-go="settings"><i>⚙️</i>Sozlamalar</button>'}<a href="/" class="quick-a"><button style="width:100%"><i>🛍</i>Do'konni ko'rish</button></a></div></section>`;
  }
  const stepper = (p) => `<div class="stepper" data-stp="${p.id}"><button data-stk="${p.id}:-1" aria-label="Kamaytirish">−</button><span class="num" data-stkv="${p.id}">${p.stock}</span><button data-stk="${p.id}:1" aria-label="Ko'paytirish">+</button></div>`;

  // ================= BUYURTMALAR =================
  function orderMatches(o, q) {
    const t = q.trim().toLowerCase(); if (!t) return true;
    return [o.no, o.name, o.phone, o.address, ...o.items.map((i) => i.title)].join(' ').toLowerCase().includes(t);
  }
  function drawOrders() {
    const f = A.ofilter, all = A.data.orders;
    const chips = [['all', 'Hammasi', all.length], ...Object.entries(STATUS).map(([k, v]) => [k, v[0], all.filter((o) => o.status === k).length])];
    const list = all.filter((o) => (f === 'all' || o.status === f) && orderMatches(o, A.oq));
    $('#body').innerHTML = `<label class="search" style="margin-top:4px">${svg('search')}<input id="oq" type="search" placeholder="Raqam, ism, telefon yoki mahsulot..." value="${esc(A.oq)}" autocomplete="off"></label>
      <div class="chips sticky">${chips.map(([k, l, n]) => `<button class="chip ${f === k ? 'on' : ''}" data-ofilter="${k}">${l} <b>${n}</b></button>`).join('')}</div>
      <div id="olist">${list.length ? list.map(orderCard).join('') : `<div class="empty"><div class="em">📦</div><b>Buyurtma topilmadi</b>${A.oq ? "Qidiruvni o'zgartirib ko'ring" : "Bu holatda buyurtma yo'q"}</div>`}</div>`;
    const q = $('#oq'); let t; q.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { A.oq = e.target.value; const pos = e.target.selectionStart; drawOrders(); const n = $('#oq'); n.focus(); n.setSelectionRange(pos, pos); }, 250); });
  }
  function orderCard(o) {
    const nx = NEXT[o.status], open = A.open.has(o.id), cnt = o.items.reduce((s, i) => s + i.qty, 0);
    return `<div class="acard st-${o.status}" data-oid="${o.id}"><div class="top"><b>${esc(o.no)}</b><span class="pill ${STATUS[o.status][1]}">${STATUS[o.status][0]}</span></div>
      <div class="sub">${fmtDate(o.created_at)} · ${ago(o.created_at)}</div>
      <div class="who"><div class="av">${esc((o.name || '?').trim().charAt(0).toUpperCase())}</div><div class="tx"><b>${esc(o.name)}</b><span class="sub">${esc(o.phone)}</span></div><a class="call" href="tel:${esc(o.phone)}" aria-label="Qo'ng'iroq">📞</a></div>
      <div class="meta">${esc(DELIV[o.delivery] || o.delivery)}${o.address ? ': ' + esc(o.address) : ''}${o.comment ? `<br>💬 ${esc(o.comment)}` : ''}<br>To'lov: ${esc(PAY[o.payment] || o.payment)} ${o.paid ? '<span class="pill ok">✅ to\'langan</span>' : '<span class="pill warn">to\'lanmagan</span>'}</div>
      <button class="items-toggle" data-exp="${o.id}"><span>${cnt} ta mahsulot · ${money(o.total)}</span><span>${open ? '▲' : '▼'}</span></button>
      ${open ? `<div class="items">${o.items.map((i) => `<div class="oline"><span>${esc(i.title)}${i.color ? ` · ${esc(i.color)}` : ''} × ${i.qty}</span><b class="num">${money(i.price * i.qty)}</b></div>`).join('')}
        <div class="oline"><span>Yetkazish</span><b>${o.delivery_fee ? money(o.delivery_fee) : o.delivery === 'region' ? 'narxi kelishiladi' : 'bepul'}</b></div><div class="oline"><span><b>Jami</b></span><b class="num">${money(o.total)}</b></div></div>` : ''}
      <div class="acts">${nx ? `<button class="btn grow" data-st="${o.id}:${nx[0]}">${nx[1]}</button>` : o.status === 'cancelled' ? `<button class="btn grow ghost" data-st="${o.id}:new">♻️ Qayta tiklash</button>` : `<button class="btn grow ghost" data-more="${o.id}">Batafsil amallar</button>`}
        ${!o.paid && o.status !== 'cancelled' ? `<button class="btn ok" data-paid="${o.id}:1" aria-label="To'langan">💰</button>` : ''}<button class="btn more" data-more="${o.id}" aria-label="Boshqa amallar">⋯</button></div></div>`;
  }
  function openActions({ title, sub, items }) {
    A.actions = items;
    $('#apanel').innerHTML = `<div class="grab"></div><h3>${esc(title)}</h3>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}<div class="opts2">${items.map((it, i) => `<button class="${it.cls || ''}" data-ai="${i}">${it.label}</button>`).join('')}</div>`;
    $('#asheet').classList.add('on');
  }
  const closeActions = () => $('#asheet').classList.remove('on');
  function orderMenu(id) {
    const o = A.data.orders.find((x) => x.id === id); if (!o) return;
    const text = `${o.no}\n${o.name} · ${o.phone}\n${DELIV[o.delivery] || ''}${o.address ? ': ' + o.address : ''}\n${o.items.map((i) => `• ${i.title}${i.color ? ` (${i.color})` : ''} × ${i.qty} = ${money(i.price * i.qty)}`).join('\n')}\nJami: ${money(o.total)}`;
    openActions({
      title: o.no, sub: `${o.name} · ${money(o.total)}`,
      items: [
        ...Object.entries(STATUS).map(([k, v]) => ({ label: v[0], cls: o.status === k ? 'cur' : k === 'cancelled' ? 'danger' : '', run: () => orderAction({ id, status: k }, k === 'cancelled') })),
        { label: o.paid ? "↩️ To'lanmagan deb belgilash" : "💰 To'langan deb belgilash", run: () => orderAction({ id, paid: !o.paid }) },
        { label: '📋 Buyurtmani nusxalash', run: async () => { try { await navigator.clipboard.writeText(text); toast('Nusxalandi ✅'); } catch { toast('Nusxalab bo\'lmadi', true); } } },
      ],
    });
  }
  async function orderAction(body, needConfirm) {
    if (needConfirm && !(await confirmBox('Buyurtma bekor qilinsinmi? Mahsulotlar omborga qaytadi va mijozga xabar boradi.'))) return;
    if (body.status && body.status !== 'cancelled' && body.status !== 'new') { /* mijozga xabar ketadi */ }
    try {
      const { order } = await api('admin/order', body);
      const i = A.data.orders.findIndex((o) => o.id === order.id); if (i >= 0) A.data.orders[i] = order;
      if (body.status === 'cancelled') await load(true); else draw();
      haptic('ok'); toast(body.status ? 'Holat yangilandi, mijozga xabar ketdi ✅' : "To'lov holati yangilandi ✅");
    } catch (err) { toast(err.message, true); haptic('err'); }
  }

  // ================= MAHSULOTLAR =================
  function drawProducts() {
    const d = A.data, q = A.pq.trim().toLowerCase(), f = A.pcat;
    const list = d.products.filter((p) => (f === 'all' || (f === 'low' && p.active && p.stock <= 3) || (f === 'hidden' && !p.active) || String(p.category_id) === String(f)) && (!q || p.title.toLowerCase().includes(q)));
    const chips = [['all', 'Hammasi'], ['low', '⚠️ Kam qolgan'], ['hidden', '👁 Yashirin'], ...d.categories.map((c) => [String(c.id), c.name])];
    $('#body').innerHTML = `<label class="search" style="margin-top:4px">${svg('search')}<input id="pq" type="search" placeholder="Mahsulot qidirish..." value="${esc(A.pq)}" autocomplete="off"></label>
      <div class="chips sticky">${chips.map(([k, l]) => `<button class="chip ${String(f) === k ? 'on' : ''}" data-pcat="${k}">${esc(l)}</button>`).join('')}</div>
      ${list.length ? list.map(prodRow).join('') : '<div class="empty"><div class="em">🛍</div><b>Mahsulot topilmadi</b>Pastdagi + tugmasi bilan yangisini qo\'shing</div>'}`;
    const pq = $('#pq'); let t; pq.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { A.pq = e.target.value; const pos = e.target.selectionStart; drawProducts(); const n = $('#pq'); n.focus(); n.setSelectionRange(pos, pos); }, 250); });
  }
  const prodRow = (p) => `<div class="prow2 ${p.active ? '' : 'off'}" data-prow="${p.id}"><button class="media-btn" data-edit="${p.id}" style="padding:0">${media(p)}</button>
      <button class="tx" data-edit="${p.id}"><h3>${esc(p.title)}</h3><small>${esc((cat(p.category_id) || {}).name || '—')}${p.active ? '' : ' · yashirin'}</small><div class="pr num">${money(p.price)}${p.old_price > p.price ? ` <small><s>${money(p.old_price)}</s></small>` : ''}</div></button>
      <div class="ctl">${stepper(p)}<label class="vis">Ko'rinsin <span class="switch"><input type="checkbox" data-tog="${p.id}" ${p.active ? 'checked' : ''}></span></label></div></div>`;
  function patchStock(id, delta) {
    const p = A.data.products.find((x) => x.id === id); if (!p) return;
    p.stock = Math.max(0, p.stock + delta);
    $$(`[data-stkv="${id}"]`).forEach((el) => (el.textContent = p.stock)); haptic();
    clearTimeout(stockTimers[id]);
    stockTimers[id] = setTimeout(async () => { try { await api('admin/product/patch', { id, stock: p.stock }); } catch (e) { toast(e.message, true); load(true); } }, 500);
  }

  // ================= SOZLAMALAR =================
  const admRow = (a) => `<div class="lrow"><div class="tx"><b>${a.owner ? '⭐ Asosiy admin' : esc(a.name || 'Admin')}${a.username ? ` @${esc(a.username)}` : ''}</b><small>ID ${esc(a.id)}</small></div>${a.owner ? '' : `<button class="btn sm bad" data-arm="${esc(a.id)}">Olib tashlash</button>`}</div>`;
  const catRow = (c) => `<div class="catrow" data-cat="${c.id}"><input value="${esc(c.name)}" data-cn placeholder="Nomi"><select data-ci>${Object.entries(ICONS).map(([k, v]) => `<option value="${k}" ${c.icon === k ? 'selected' : ''}>${v}</option>`).join('')}</select><button class="btn sm" data-csave="${c.id}" aria-label="Saqlash">✓</button><button class="btn sm bad" data-cdel="${c.id}" aria-label="O'chirish">🗑</button></div>`;
  function drawSettings() {
    const s = A.data.settings, fld = (k, l, t = 'text') => `<label class="fld"><span>${l}</span><input data-set="${k}" type="${t}" value="${esc(s[k] ?? '')}"></label>`;
    $('#body').innerHTML = `<section class="ecard"><h3>🏪 Do'kon ma'lumotlari</h3>${fld('name', "Do'kon nomi")}${fld('phone', 'Telefon', 'tel')}${fld('telegram', 'Telegram (@siz)')}${fld('channel', 'Telegram kanal havolasi')}${fld('instagram', 'Instagram havolasi')}
        <label class="fld"><span>O'zbekiston bo'ylab yetkazish narxi (so'm; 0 = operator kelishadi). Toshkent bo'ylab doim bepul</span><input data-set="regionFee" data-num inputmode="numeric" value="${esc(spaced(s.regionFee ?? 0))}"></label>
        <button class="btn block" id="saveSet" style="margin-bottom:10px">Saqlash</button></section>
      <section class="ecard"><h3>🗂 Kategoriyalar</h3><div id="cats">${A.data.categories.map(catRow).join('')}</div><button class="btn ghost block" id="addCat" style="margin-bottom:10px">➕ Kategoriya qo'shish</button></section>
      <section class="ecard"><h3>👥 Adminlar</h3>${A.data.owner ? `<div id="adm">${A.data.admins.map(admRow).join('')}</div><div id="invbox"></div><button class="btn block" id="invite" style="margin-bottom:10px">🔗 Yangi admin taklif qilish</button>
        <p class="sub" style="font-size:12px;margin:0 2px 10px">Havolani yangi adminga yuboring: uni bossa, bot ochiladi va u avtomatik admin bo'ladi. Havola 24 soat va bir marta ishlaydi.</p>` : '<p class="sub" style="margin:0 2px 12px">Adminlarni faqat asosiy admin qo\'sha va olib tashlay oladi.</p>'}</section>
      <section class="ecard"><h3>💳 To'lov usullari</h3><p class="sub" style="margin:0 2px 12px">Yoqilgan: ${A.data.payments.map((p) => `<b>${esc(p.label)}</b>`).join(', ')}.<br>Onlayn (Click/Payme) va karta o'tkazmasi Netlify'dagi <code>PAYMENT_PROVIDER_TOKEN</code> va <code>CARD_NUMBER</code> o'zgaruvchilari bilan yoqiladi.</p></section>`;
  }

  // ================= MAHSULOT MUHARRIRI =================
  function openEditor(id, dup) {
    const isNew = id === 'new' || !!dup;
    const src = dup || (isNew ? null : A.data.products.find((x) => x.id === Number(id)));
    const base = src ? JSON.parse(JSON.stringify(src)) : { category_id: A.data.categories[0] && A.data.categories[0].id, title: '', price: '', old_price: 0, stock: 1, badge: '', short: '', description: '', colors: [], specs: {}, images: [], featured: false, active: true };
    if (dup) { base.title = base.title + ' (nusxa)'; base.images = [...imgsOf(src)]; }
    const st = { ...base, specs: Object.entries(base.specs || {}), colors: [...(base.colors || [])], images: imgsOf(base) };
    let dirty = false;
    const sheet = $('#sheet'); sheet.hidden = false; document.body.style.overflow = 'hidden'; $('#fab').hidden = true;
    const pct = () => { const p = digits(st.price), o = digits(st.old_price); return o && p && Number(o) > Number(p) ? Math.round((1 - p / o) * 100) : 0; };
    const preview = () => `<article class="pcard"><div style="position:relative">${media({ ...st, colors: st.colors })}${pct() ? `<span class="tag sale">−${pct()}%</span>` : st.badge ? `<span class="tag">${esc(st.badge)}</span>` : ''}${Number(digits(st.stock)) === 0 ? '<span class="tag out">Tugagan</span>' : ''}</div>
      <div class="pbody"><h3>${esc(st.title || 'Mahsulot nomi')}</h3><div class="short">${esc(st.short || 'Qisqa tavsif')}</div><div class="price"><b class="num">${money(Number(digits(st.price)) || 0)}</b></div><div class="pfoot"><span class="sub">${pct() ? `<s class="num">${esc(spaced(st.old_price))}</s>` : '<em>✓ Mavjud</em>'}</span></div></div></article>`;
    const fld = (k, l, ex = '', tag = 'input') => `<label class="fld"><span>${l}</span><${tag} data-f="${k}" ${ex}${tag === 'input' ? ` value="${esc(st[k] ?? '')}"` : ''}>${tag === 'textarea' ? esc(st[k] || '') + '</textarea>' : ''}</label>`;
    const draw2 = () => {
      sheet.innerHTML = `<div class="sheet-bar"><button class="back" data-close aria-label="Orqaga">${svg('back')}</button><h2>${isNew ? (dup ? 'Nusxa' : 'Yangi mahsulot') : 'Tahrirlash'}</h2><button class="btn" id="save">Saqlash</button></div>
        <div class="pvwrap"><small>👁 Do'konda shunday ko'rinadi</small><div id="pv">${preview()}</div></div>
        <section class="ecard"><h3>📷 Rasmlar <span class="hint" style="font-weight:700;font-size:12px">${st.images.length}/6</span></h3><div class="imgs">${st.images.map((im, i) => `<div class="it"><div class="media ph" data-icon="car" data-hex="#2b59ff">${imgTag(im)}</div><button class="x" data-irm="${i}" aria-label="O'chirish">✕</button>${i === 0 ? '<span class="main">Asosiy</span>' : `<button class="mk" data-imain="${i}">Asosiy qilish</button>`}</div>`).join('')}${st.images.length < 6 ? '<button class="add" id="pick">📷<br>Rasm qo\'shish</button>' : ''}</div><input id="file" type="file" accept="image/*" multiple hidden></section>
        <section class="ecard"><h3>📝 Asosiy</h3>${fld('title', 'Nomi', 'autocomplete="off"')}<label class="fld"><span>Kategoriya</span><select data-f="category_id">${A.data.categories.map((c) => `<option value="${c.id}" ${c.id === Number(st.category_id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>${fld('short', 'Qisqa tavsif')}${fld('description', "To'liq tavsif", 'rows="4"', 'textarea')}</section>
        <section class="ecard"><h3>💰 Narx va ombor</h3><div class="row2c">${fld('price', "Narxi (so'm)", 'inputmode="numeric" data-num')}${fld('old_price', "Eski narx (0 = yo'q)", 'inputmode="numeric" data-num')}</div><div class="row2c">${fld('stock', 'Omborda (ta)', 'inputmode="numeric" data-num')}${fld('badge', 'Belgi (Yangi, Chegirma...)')}</div></section>
        <section class="ecard"><h3>🎨 Ranglar</h3><div class="presets">${Object.entries(PALETTE).map(([n, h]) => `<button data-preset="${esc(n)}"><i style="background:${h}"></i>${esc(n)}</button>`).join('')}</div>
          ${st.colors.map((c, i) => `<div class="crow"><input type="color" value="${esc(c.hex)}" data-chex="${i}"><input type="text" value="${esc(c.name)}" data-cname="${i}" placeholder="Rang nomi"><button class="x" data-crm="${i}">✕</button></div>`).join('')}
          <button class="btn ghost sm" data-cadd style="margin-bottom:10px">➕ Rang qo'shish</button></section>
        <section class="ecard"><h3>📋 Xususiyatlar</h3>${st.specs.map(([k, v], i) => `<div class="srow"><input value="${esc(k)}" data-sk="${i}" placeholder="Nomi (Yosh)"><input value="${esc(v)}" data-sv="${i}" placeholder="Qiymati (3-8 yosh)"><button class="x" data-srm="${i}">✕</button></div>`).join('')}
          <button class="btn ghost sm" data-sadd style="margin-bottom:10px">➕ Xususiyat qo'shish</button></section>
        <section class="ecard"><h3>👁 Ko'rinish</h3><div class="togs"><label>Bosh sahifada «Mashhur»<span class="switch"><input type="checkbox" data-f="featured" ${st.featured ? 'checked' : ''}></span></label><label>Do'konda ko'rinsin<span class="switch"><input type="checkbox" data-f="active" ${st.active ? 'checked' : ''}></span></label></div></section>
        <div id="serr"></div>
        <div class="sheet-foot">${isNew ? '' : '<button class="btn bad sq" id="del" aria-label="O\'chirish">🗑</button><button class="btn ghost sq" id="dup" aria-label="Nusxa">📄</button>'}<button class="btn grow" id="save2">Saqlash</button></div>`;
    };
    const collect = () => {
      $$('[data-f]', sheet).forEach((el) => { st[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; });
      $$('[data-sk]', sheet).forEach((el) => { st.specs[el.dataset.sk][0] = el.value; });
      $$('[data-sv]', sheet).forEach((el) => { st.specs[el.dataset.sv][1] = el.value; });
      $$('[data-cname]', sheet).forEach((el) => { st.colors[el.dataset.cname].name = el.value; });
      $$('[data-chex]', sheet).forEach((el) => { st.colors[el.dataset.chex].hex = el.value; });
    };
    const close = () => { sheet.hidden = true; sheet.innerHTML = ''; document.body.style.overflow = ''; $('#fab').hidden = A.tab !== 'products'; };
    const tryClose = async () => { if (dirty && !(await confirmBox("Saqlanmagan o'zgarishlar yo'qoladi. Yopilsinmi?"))) return; close(); };
    const save = async (btn) => {
      collect();
      const specs = {}; st.specs.forEach(([k, v]) => { if (k.trim() && v.trim()) specs[k.trim()] = v.trim(); });
      $$('#save,#save2').forEach((b) => (b.disabled = true));
      try {
        const { product } = await api('admin/product', { id: isNew ? undefined : base.id, category_id: st.category_id, title: st.title, price: digits(st.price), old_price: digits(st.old_price) || 0, stock: digits(st.stock) || 0, badge: st.badge, short: st.short, description: st.description, colors: st.colors.filter((c) => c.name.trim()), specs, images: st.images, featured: st.featured, active: st.active });
        const i = A.data.products.findIndex((x) => x.id === product.id); i >= 0 ? (A.data.products[i] = product) : A.data.products.push(product);
        dirty = false; close(); draw(); toast('Saqlandi ✅'); haptic('ok');
      } catch (err) { $('#serr').innerHTML = `<div class="alert">${esc(err.message)}</div>`; $('#serr').scrollIntoView({ block: 'center', behavior: 'smooth' }); haptic('err'); $$('#save,#save2').forEach((b) => (b.disabled = false)); }
    };
    draw2();
    // jonli ko'rinish va avtomatik formatlash
    sheet.oninput = (e) => {
      dirty = true;
      const el = e.target;
      if (el.matches('[data-num]')) { el.value = spaced(el.value); }
      if (el.dataset.f) st[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value;
      const pv = $('#pv'); if (pv) { collect(); pv.innerHTML = preview(); }
    };
    sheet.onclick = async (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.close !== undefined) return tryClose();
      if (t.id === 'pick') return $('#file').click();
      if (t.dataset.irm) { collect(); dirty = true; st.images.splice(Number(t.dataset.irm), 1); return draw2(); }
      if (t.dataset.imain) { collect(); dirty = true; const [x] = st.images.splice(Number(t.dataset.imain), 1); st.images.unshift(x); return draw2(); }
      if (t.dataset.preset) { collect(); dirty = true; st.colors.push({ name: t.dataset.preset, hex: PALETTE[t.dataset.preset] }); return draw2(); }
      if (t.dataset.cadd !== undefined) { collect(); dirty = true; st.colors.push({ name: '', hex: '#2b59ff' }); return draw2(); }
      if (t.dataset.crm) { collect(); dirty = true; st.colors.splice(Number(t.dataset.crm), 1); return draw2(); }
      if (t.dataset.sadd !== undefined) { collect(); dirty = true; st.specs.push(['', '']); return draw2(); }
      if (t.dataset.srm) { collect(); dirty = true; st.specs.splice(Number(t.dataset.srm), 1); return draw2(); }
      if (t.id === 'dup') { collect(); close(); return openEditor('new', { ...base, ...st, specs: Object.fromEntries(st.specs.filter(([k]) => k)), id: undefined }); }
      if (t.id === 'del') {
        if (!(await confirmBox(`«${st.title}» o'chirilsinmi? Buyurtmalar tarixi saqlanadi.`))) return;
        try { await api('admin/product/delete', { id: base.id }); A.data.products = A.data.products.filter((x) => x.id !== base.id); dirty = false; close(); draw(); toast("O'chirildi 🗑"); haptic('ok'); } catch (err) { toast(err.message, true); }
        return;
      }
      if (t.id === 'save' || t.id === 'save2') return save(t);
    };
    sheet.onchange = async (e) => {
      if (e.target.id === 'file' && e.target.files.length) {
        collect(); dirty = true;
        const files = [...e.target.files].slice(0, 6 - st.images.length); let ok = 0;
        for (const [i, f] of files.entries()) {
          try { toast(`Rasm yuklanmoqda ${i + 1}/${files.length}...`); const blob = await shrink(f, 1200, 0.82); st.images.push((await api('admin/upload', null, blob, 'image/jpeg')).photo); ok++; } catch (err) { toast(err.message, true); }
        }
        if (ok) { draw2(); toast(ok > 1 ? `${ok} ta rasm yuklandi ✅` : 'Rasm yuklandi ✅'); }
        return;
      }
      if (e.target.type === 'color' || e.target.tagName === 'SELECT') { dirty = true; const pv = $('#pv'); if (pv) { collect(); pv.innerHTML = preview(); } }
    };
    if (tg && tg.BackButton) { /* orqaga tugmasi sheet ichida ishlamaydi */ }
  }
  function shrink(file, max, q) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => (b ? res(b) : rej(new Error("Rasmni qayta ishlab bo'lmadi"))), 'image/jpeg', q);
      };
      img.onerror = () => rej(new Error("Rasmni o'qib bo'lmadi"));
      img.src = url;
    });
  }

  // ================= hodisalar =================
  document.addEventListener('click', async (e) => {
    const t = e.target, b = (s) => t.closest(s);
    let el;
    if (b('#asheet') && !b('#apanel')) return closeActions();
    if ((el = b('[data-ai]'))) { const it = A.actions[Number(el.dataset.ai)]; closeActions(); if (it) await it.run(); return; }
    if ((el = b('[data-tab]'))) { e.preventDefault(); haptic(); return go(el.dataset.tab); }
    if (b('[data-theme-toggle]')) { LS.set('theme', cur() === 'dark' ? 'light' : 'dark'); theme(true); haptic(); return; }
    if (b('[data-reload]')) { await load(true); return toast('Yangilandi ✅'); }
    if ((el = b('[data-go]'))) { const [tab, f] = el.dataset.go.split(':'); return go(tab, tab === 'orders' ? { ofilter: f || 'all' } : tab === 'products' ? { pcat: f || 'all' } : {}); }
    if ((el = b('[data-ofilter]'))) { A.ofilter = el.dataset.ofilter; return drawOrders(); }
    if ((el = b('[data-pcat]'))) { A.pcat = el.dataset.pcat; return drawProducts(); }
    if ((el = b('[data-exp]'))) { const id = Number(el.dataset.exp); A.open.has(id) ? A.open.delete(id) : A.open.add(id); const y = window.scrollY; drawOrders(); window.scrollTo(0, y); return; }
    if ((el = b('[data-st]'))) { const [id, status] = el.dataset.st.split(':'); return orderAction({ id: Number(id), status }, status === 'cancelled'); }
    if ((el = b('[data-paid]'))) { const [id, v] = el.dataset.paid.split(':'); return orderAction({ id: Number(id), paid: v === '1' }); }
    if ((el = b('[data-more]'))) return orderMenu(Number(el.dataset.more));
    if ((el = b('[data-stk]'))) { const [id, d] = el.dataset.stk.split(':').map(Number); return patchStock(id, d); }
    if (b('#fab') || b('[data-act=newproduct]')) return openEditor('new');
    if ((el = b('[data-edit]'))) return openEditor(el.dataset.edit);
    if (b('[data-act=invite]') || b('#invite')) {
      try {
        const { link } = await api('admin/invite', {});
        if (A.tab !== 'settings') go('settings');
        $('#invbox').innerHTML = `<div class="acard" style="margin:0 0 10px"><b>Taklif havolasi</b><div class="meta"><code style="word-break:break-all;font-size:12px">${esc(link)}</code></div><div class="acts"><button class="btn grow ghost" data-copy="${esc(link)}">📋 Nusxa</button><button class="btn grow" data-share="${esc(link)}">✈️ Yuborish</button></div></div>`;
        haptic('ok');
      } catch (err) { toast(err.message, true); haptic('err'); }
      return;
    }
    if ((el = b('[data-copy]'))) { try { await navigator.clipboard.writeText(el.dataset.copy); toast('Nusxalandi ✅'); } catch { toast(el.dataset.copy); } return; }
    if ((el = b('[data-share]'))) {
      const url = 'https://t.me/share/url?url=' + encodeURIComponent(el.dataset.share) + '&text=' + encodeURIComponent("BabyCheer do'koniga admin bo'lish uchun havola:");
      tg && tg.openTelegramLink ? tg.openTelegramLink(url) : window.open(url, '_blank'); return;
    }
    if ((el = b('[data-arm]'))) {
      if (!(await confirmBox('Bu adminni olib tashlaysizmi?'))) return;
      try { await api('admin/admin/remove', { id: Number(el.dataset.arm) }); await load(true); toast('Admin olib tashlandi'); } catch (err) { toast(err.message, true); }
      return;
    }
    if (b('#saveSet')) {
      const body = {}; $$('[data-set]').forEach((i) => { body[i.dataset.set] = i.dataset.set === 'regionFee' ? digits(i.value) || '0' : i.value; });
      try { A.data.settings = (await api('admin/settings', body)).settings; toast('Saqlandi ✅'); haptic('ok'); } catch (err) { toast(err.message, true); haptic('err'); }
      return;
    }
    if (b('#addCat')) { $('#cats').insertAdjacentHTML('beforeend', catRow({ id: '', name: '', icon: 'car' })); return; }
    if ((el = b('[data-csave]'))) {
      const row = el.closest('.catrow');
      try { await api('admin/category', { id: el.dataset.csave || undefined, name: $('[data-cn]', row).value, icon: $('[data-ci]', row).value }); await load(true); toast('Saqlandi ✅'); haptic('ok'); } catch (err) { toast(err.message, true); }
      return;
    }
    if ((el = b('[data-cdel]'))) {
      if (!el.dataset.cdel) return el.closest('.catrow').remove();
      if (!(await confirmBox("Kategoriya o'chirilsinmi?"))) return;
      try { await api('admin/category/delete', { id: el.dataset.cdel }); await load(true); toast("O'chirildi 🗑"); } catch (err) { toast(err.message, true); }
    }
  });
  document.addEventListener('input', (e) => { const el = e.target; if (el.matches && el.matches('[data-num]') && !el.closest('#sheet')) el.value = spaced(el.value); });
  document.addEventListener('change', async (e) => {
    const el = e.target.closest && e.target.closest('[data-tog]'); if (!el) return;
    const id = Number(el.dataset.tog), p = A.data.products.find((x) => x.id === id); if (!p) return;
    try { await api('admin/product/patch', { id, active: el.checked }); p.active = el.checked; el.closest('.prow2').classList.toggle('off', !p.active); haptic('ok'); toast(p.active ? "Do'konda ko'rinadi ✅" : 'Yashirildi'); }
    catch (err) { el.checked = !el.checked; toast(err.message, true); }
  });

  async function load(keep) {
    try { A.data = await api('admin/state'); draw(); }
    catch (e) {
      if (keep) return toast(e.message, true);
      $('#view').innerHTML = e.status === 403 ? '<div class="empty"><div class="em">🔒</div><b>Ruxsat yo\'q</b>Bu bo\'lim faqat adminlar uchun</div>'
        : `<div class="empty"><div class="em">📡</div><b>Yuklab bo'lmadi</b>${esc(e.message)}<div style="margin-top:16px"><button class="btn" onclick="location.reload()">Qayta urinish</button></div></div>`;
    }
  }

  const pref = () => LS.get('theme', null);
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
    $('#top').innerHTML = '<div class="a-top"><div class="logo"><i>🔧</i></div><div class="ttl"><b>Admin panel</b></div></div>';
    $('#view').innerHTML = '<div class="empty"><div class="em">🔐</div><b>Telegram ichida oching</b>Botga <code>/admin</code> yozing va «Admin panelni ochish» tugmasini bosing</div>';
  } else {
    $('#view').innerHTML = '<div class="skel" style="height:150px;border-radius:28px"></div><div class="skel" style="height:90px;margin-top:12px"></div><div class="skel" style="height:200px;margin-top:12px"></div>';
    load();
  }
})();
