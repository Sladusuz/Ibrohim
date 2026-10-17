/* BabyCheer: Telegram Mini App do'koni. Vanilla JS, build qadamisiz. */
(function () {
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTg = !!(tg && tg.initData);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('bc.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bc.' + k, JSON.stringify(v)); } catch { /* xotira yo'q */ } },
  };
  const SS = {
    get(k) { try { return JSON.parse(sessionStorage.getItem('bc.' + k) || 'null'); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem('bc.' + k, JSON.stringify(v)); } catch { /* */ } },
  };
  const haptic = (t = 'light') => { try { tg && tg.HapticFeedback && (t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : t === 'err' ? tg.HapticFeedback.notificationOccurred('error') : tg.HapticFeedback.impactOccurred(t)); } catch { /* */ } };

  const ICON = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    bag: '<path d="M6 7h12l1 13H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    heart: '<path d="M12 20s-7-4.6-9.3-9.2C1.2 7.7 3 4.5 6.3 4.5c2 0 3.2 1 3.7 1.8.5-.8 1.7-1.8 3.7-1.8 3.3 0 5.100 3.200 3.600 6.300C19 15.400 12 20 12 20z"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24">${ICON[n]}</svg>`;

  // ---------- holat ----------
  const S = { data: null, cart: LS.get('cart', []), favs: LS.get('favs', []), me: LS.get('me', {}), shop: { cat: '', q: '', sort: 'pop', stock: false, fav: false }, lastList: '#/shop' };
  const saveCart = () => { LS.set('cart', S.cart); drawTabs(); };

  async function api(path, body) {
    const res = await fetch('/api/' + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'content-type': 'application/json', 'x-tg-init-data': (tg && tg.initData) || '' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'Server xatosi');
    return j;
  }

  // ---------- katalog yordamchilari ----------
  const prod = (id) => S.data.products.find((p) => p.id === Number(id));
  const cat = (id) => S.data.categories.find((c) => c.id === Number(id));
  const pct = (p) => (p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0);
  const hexOf = (p, color) => (p.colors.find((c) => c.name === color) || p.colors[0] || { hex: '#2b59ff' }).hex;
  const imgsOf = (p) => (p.images && p.images.length ? p.images : p.photo ? [p.photo] : []);
  const artOf = (p, color) => window.BC.art((cat(p.category_id) || {}).icon || 'car', hexOf(p, color));
  const imgTag = (id, alt) => `<img src="/photo/${esc(id)}" alt="${esc(alt)}" loading="lazy" decoding="async" onload="this.classList.add('ld');this.parentNode.classList.add('done')">`;
  const media = (p, color, idx = 0) => {
    const hex = hexOf(p, color), im = imgsOf(p)[idx];
    return `<div class="media${im ? ' ph' : ''}" style="--tint:${hex}" data-icon="${esc((cat(p.category_id) || {}).icon || 'car')}" data-hex="${esc(hex)}">${im ? imgTag(im, p.title) : artOf(p, color)}</div>`;
  };
  // mahsulot sahifasi galereyasi: 2+ rasm bo'lsa surib ko'riladigan karusel
  const gallery = (p, color) => {
    const n = imgsOf(p).length;
    if (n < 2) return media(p, color);
    return `<div class="car" id="car">${imgsOf(p).map((_, i) => media(p, color, i)).join('')}</div><div class="dots" id="dots">${imgsOf(p).map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
  };
  // rasm yuklanmasa (404, uzilish) illyustratsiyaga qaytadi: singan ikonka ko'rinmaydi
  document.addEventListener('error', (e) => {
    const im = e.target, m = im && im.tagName === 'IMG' && im.closest('.media');
    if (m) { m.classList.remove('ph'); m.classList.add('done'); m.innerHTML = window.BC.art(m.dataset.icon || 'car', m.dataset.hex || '#2b59ff'); }
  }, true);
  const favBtn = (id) => `<button class="fav ${S.favs.includes(id) ? 'on' : ''}" data-fav="${id}" aria-label="Sevimli">${svg('heart')}</button>`;
  const card = (p) => `<article class="pcard" data-go="#/p/${p.id}">
      <div style="position:relative">${media(p)}${p.stock ? (pct(p) ? `<span class="tag sale">−${pct(p)}%</span>` : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : '') : '<span class="tag out">Tugagan</span>'}${favBtn(p.id)}${p.stock && p.stock <= 3 ? `<span class="low">Oxirgi ${p.stock} ta</span>` : ''}${p.stock ? `<button class="qa" data-quick="${p.id}" aria-label="Savatga qo'shish">+</button>` : ''}</div>
      <div class="pbody"><h3>${esc(p.title)}</h3><div class="short">${esc(p.short)}</div>
      <div class="price"><b class="num">${money(p.price)}</b>${p.old_price > p.price ? `<s class="num">${money(p.old_price)}</s>` : ''}</div></div></article>`;

  // ---------- savat ----------
  function lines() {
    return S.cart.map((l, i) => ({ ...l, i, p: prod(l.id) })).filter((l) => l.p && l.p.stock > 0).map((l) => ({ ...l, qty: Math.min(l.qty, l.p.stock) }));
  }
  function totals(delivery = 'courier') {
    const sub = lines().reduce((s, l) => s + l.p.price * l.qty, 0);
    const { freeFrom, deliveryFee } = S.data.settings;
    const fee = delivery === 'courier' && sub > 0 && sub < freeFrom ? deliveryFee : 0;
    return { sub, fee, total: sub + fee, freeFrom };
  }
  const cartCount = () => lines().reduce((s, l) => s + l.qty, 0);
  function addToCart(id, color, qty = 1) {
    const p = prod(id);
    const ex = S.cart.find((l) => l.id === id && l.color === color);
    const have = ex ? ex.qty : 0;
    if (!p || have + qty > p.stock) { toast(`Omborda atigi ${p ? p.stock : 0} ta bor`, true); haptic('err'); return false; }
    ex ? (ex.qty += qty) : S.cart.push({ id, color, qty });
    saveCart(); haptic('medium');
    return true;
  }

  // ---------- umumiy UI ----------
  let toastT;
  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = 'on' + (bad ? ' bad' : '');
    clearTimeout(toastT); toastT = setTimeout(() => (t.className = ''), 2400);
  }
  const TABS = [['#/', 'home', 'Asosiy', 'home'], ['#/shop', 'shop', 'Katalog', 'grid'], ['#/cart', 'cart', 'Savat', 'bag'], ['#/orders', 'orders', 'Buyurtmalar', 'box'], ['#/info', 'info', "Ma'lumot", 'info']];
  let curTab = 'home';
  let prevN = 0;
  function drawTabs() {
    const n = S.data ? cartCount() : 0;
    const up = n > prevN; prevN = n;
    $('#tabs').innerHTML = TABS.map(([h, k, label, ic]) => `<a href="${h}" class="${curTab === k ? 'on' : ''}">${svg(ic)}${label}${k === 'cart' && n ? `<span class="badge${up ? ' bump' : ''}">${n}</span>` : ''}</a>`).join('');
  }
  function setTop(v) {
    const top = $('#top');
    if (v.home) {
      top.innerHTML = `<div class="logo"><i>🚗</i>BabyCheer</div><span class="top-sp"></span>
        <a class="icon-btn" href="#/shop?q=" aria-label="Qidirish">${svg('search')}</a>
        <a class="icon-btn" href="#/shop?fav=1" aria-label="Sevimlilar">${svg('heart')}</a>`;
    } else {
      top.innerHTML = `<button class="back" data-back aria-label="Orqaga">${svg('back')}</button><div class="top-title">${esc(v.title || '')}</div>${v.right || ''}`;
    }
  }
  function setCta(c) {
    const el = $('#cta');
    if (!c) { el.className = ''; el.innerHTML = ''; document.body.classList.remove('has-cta'); return; }
    el.className = 'on'; document.body.classList.add('has-cta');
    el.innerHTML = `<div class="cta-in">${c.info ? `<div class="cta-info"><small>${esc(c.info[0])}</small><b class="num">${esc(c.info[1])}</b></div>` : ''}<button class="btn grow ${c.cls || ''}" id="ctaBtn" ${c.disabled ? 'disabled' : ''}>${esc(c.text)}</button></div>`;
    $('#ctaBtn').onclick = c.onClick;
  }
  function goBack(fallback) {
    if (history.length > 1) history.back(); else location.hash = fallback || '#/';
  }

  // ---------- sahifalar ----------
  const TINTS = ['#2b59ff', '#ff7a1a', '#12a66b', '#f0589f', '#10a5b8', '#8b5cf6'];
  const views = [];
  const route = (re, fn) => views.push([re, fn]);

  route(/^\/$/, () => {
    const d = S.data, sale = d.products.filter((p) => pct(p) > 0 && p.stock), hot = d.products.filter((p) => p.featured && p.stock);
    const s = d.settings, maxOff = Math.max(0, ...d.products.filter((p) => p.stock).map(pct));
    return {
      home: true, tab: 'home',
      html: `<section class="hero"><span class="hero-chip">${maxOff ? `🔥 Chegirmalar −${maxOff}% gacha` : '✨ Yangi kolleksiya'}</span><h1>Bolalikni harakatga keltiring</h1><p>Elektromobil, kalyaska, velokalyaska va samokatlar.</p>
          <a class="btn" href="#/shop">Katalogni ochish</a><div class="hero-art">${window.BC.art('car', '#ffb800')}</div></section>
        <div class="perks"><div class="perk"><b>${s.warrantyMonths} oy</b>kafolat</div><div class="perk"><b>🚚</b>butun O'zbekiston</div><div class="perk"><b>${s.freeFrom >= 1e6 ? (s.freeFrom / 1e6).toLocaleString('uz-UZ', { maximumFractionDigits: 1 }) + ' mln' : Math.round(s.freeFrom / 1e3) + ' ming'}+</b>dan yetkazish bepul</div></div>
        <section class="sec"><div class="sec-h"><h2>Kategoriyalar</h2></div><div class="cats">${d.categories.map((c, i) => {
          const n = d.products.filter((p) => p.category_id === c.id).length, tint = TINTS[i % TINTS.length];
          return `<button class="cat" style="--c:${tint}" data-go="#/shop?cat=${c.id}"><b>${esc(c.name)}</b><small>${n} ta mahsulot</small>${window.BC.art(c.icon || 'car', tint)}</button>`;
        }).join('')}</div></section>
        ${sale.length ? `<section class="sec"><div class="sec-h"><h2>🔥 Chegirmalar</h2><a href="#/shop?sort=sale">Hammasi</a></div><div class="hscroll">${sale.map(card).join('')}</div></section>` : ''}
        ${hot.length ? `<section class="sec"><div class="sec-h"><h2>⭐ Mashhur</h2><a href="#/shop">Hammasi</a></div><div class="hscroll">${hot.map(card).join('')}</div></section>` : ''}
        <section class="sec"><div class="sec-h"><h2>Barcha mahsulotlar</h2></div><div class="grid">${d.products.slice(0, 8).map(card).join('')}</div></section>`,
    };
  });

  const SORTS = { pop: 'Mashhurlari', 'price-asc': 'Arzonlari', 'price-desc': 'Qimmatlari', sale: 'Chegirmalar' };
  function filtered() {
    const f = S.shop;
    let list = S.data.products.filter((p) => (!f.cat || p.category_id === Number(f.cat)) && (!f.stock || p.stock > 0) && (!f.fav || S.favs.includes(p.id)));
    const q = f.q.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.title + ' ' + p.short + ' ' + p.description).toLowerCase().includes(q));
    if (f.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (f.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (f.sort === 'sale') list.sort((a, b) => pct(b) - pct(a));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort);
    return list;
  }
  route(/^\/shop$/, (m, qs) => {
    S.shop = { cat: qs.get('cat') || '', q: qs.get('q') || '', sort: qs.get('sort') || 'pop', stock: qs.get('stock') === '1', fav: qs.get('fav') === '1' };
    S.lastList = '#' + (location.hash.slice(1) || '/shop');
    const f = S.shop;
    return {
      title: 'Katalog', tab: 'shop',
      html: `<label class="search">${svg('search')}<input id="q" type="search" placeholder="Mahsulot qidirish..." value="${esc(f.q)}" autocomplete="off" enterkeyhint="search"></label>
        <div class="chips"><button class="chip ${!f.cat && !f.fav ? 'on' : ''}" data-cat="">Hammasi</button><button class="chip ${f.fav ? 'on' : ''}" data-cat="fav">❤️ Sevimlilar</button>${S.data.categories.map((c) => `<button class="chip ${String(c.id) === f.cat ? 'on' : ''}" data-cat="${c.id}">${esc(c.name)}</button>`).join('')}</div>
        <div class="toolbar"><select id="sort" aria-label="Saralash">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${f.sort === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <label class="switch"><input type="checkbox" id="stock" ${f.stock ? 'checked' : ''}>Mavjudlari</label></div>
        <div id="plist"></div>`,
      mount() {
        const sync = () => {
          const p = new URLSearchParams();
          if (f.cat) p.set('cat', f.cat); if (f.q) p.set('q', f.q); if (f.sort !== 'pop') p.set('sort', f.sort); if (f.stock) p.set('stock', '1'); if (f.fav) p.set('fav', '1');
          history.replaceState(null, '', '#/shop' + (p.toString() ? '?' + p : '')); S.lastList = location.hash;
          drawList();
        };
        const drawList = () => {
          const list = filtered();
          $('#plist').innerHTML = list.length ? `<div class="grid">${list.map(card).join('')}</div>`
            : `<div class="empty"><div class="em">${f.fav ? '❤️' : '🔍'}</div><b>${f.fav ? "Sevimlilar yo'q" : 'Hech narsa topilmadi'}</b>${f.fav ? 'Yurakcha tugmasini bosib mahsulot saqlang' : "Boshqa so'z yoki filtrni sinab ko'ring"}</div>`;
        };
        drawList();
        let t; $('#q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { f.q = e.target.value; sync(); }, 200); });
        $('#sort').addEventListener('change', (e) => { f.sort = e.target.value; sync(); });
        $('#stock').addEventListener('change', (e) => { f.stock = e.target.checked; sync(); });
        $$('.chip').forEach((c) => c.addEventListener('click', () => {
          const v = c.dataset.cat; f.fav = v === 'fav'; f.cat = v === 'fav' ? '' : v;
          $$('.chip').forEach((x) => x.classList.toggle('on', x === c)); sync(); haptic('light');
        }));
        if (qs.has('q') && !f.q) $('#q').focus();
      },
    };
  });

  route(/^\/p\/(\d+)$/, (m) => {
    const p = prod(m[1]);
    if (!p) return { title: 'Topilmadi', tab: 'shop', html: '<div class="empty"><div class="em">😕</div><b>Mahsulot topilmadi</b></div>' };
    const st = { color: p.colors[0] ? p.colors[0].name : '', qty: 1 };
    const s = S.data.settings, c = cat(p.category_id);
    const rel = S.data.products.filter((x) => x.category_id === p.category_id && x.id !== p.id && x.stock).slice(0, 6);
    const inCart = () => (S.cart.find((l) => l.id === p.id && l.color === st.color) || {}).qty || 0;
    const drawCta = () => {
      if (!p.stock) return setCta({ text: 'Sotuvda yo\'q', disabled: true, cls: 'ghost' });
      const n = inCart();
      setCta({
        info: ['Narxi', money(p.price * st.qty)],
        text: n ? `Savatda ${n} ta · yana qo'shish` : "Savatga qo'shish",
        onClick: () => { if (addToCart(p.id, st.color, st.qty)) { toast("Savatga qo'shildi ✅"); drawCta(); } },
      });
    };
    return {
      title: c ? c.name : 'Mahsulot', tab: 'shop', cta: true,
      html: `<div class="gallery" id="gal">${gallery(p, st.color)}${favBtn(p.id)}${p.stock ? (pct(p) ? `<span class="tag sale">−${pct(p)}%</span>` : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : '') : '<span class="tag out">Tugagan</span>'}</div>
        <div class="pt"><h1>${esc(p.title)}</h1>
          <div class="row"><span class="big num">${money(p.price)}</span>${p.old_price > p.price ? `<s class="num">${money(p.old_price)}</s><span class="pill bad">−${pct(p)}%</span>` : ''}</div>
          <div class="row">${p.stock ? `<span class="pill ok">✓ Mavjud${p.stock <= 5 ? `: ${p.stock} ta qoldi` : ''}</span>` : '<span class="pill bad">Sotuvda yo\'q</span>'}<span class="pill brand">${s.warrantyMonths} oy kafolat</span></div>
          ${p.old_price > p.price ? `<div class="save">🎉 Tejaysiz: ${money(p.old_price - p.price)}</div>` : ''}
          <p class="hint" style="margin:12px 0 0">${esc(p.description || p.short)}</p></div>
        ${p.colors.length > 1 ? `<section class="sec"><div class="sec-h"><h2>Rang</h2><span class="hint" id="cname">${esc(st.color)}</span></div><div class="swatches">${p.colors.map((c2) => `<button class="sw ${c2.name === st.color ? 'on' : ''}" data-color="${esc(c2.name)}"><i style="background:${esc(c2.hex)}"></i>${esc(c2.name)}</button>`).join('')}</div></section>` : ''}
        ${p.stock ? `<section class="sec"><div class="sec-h"><h2>Soni</h2><div class="stepper"><button data-q="-1" aria-label="Kamaytirish">−</button><span id="qv" class="num">1</span><button data-q="1" aria-label="Ko'paytirish">+</button></div></div></section>` : ''}
        ${Object.keys(p.specs || {}).length ? `<section class="sec"><div class="sec-h"><h2>Xususiyatlar</h2></div><div class="card specs">${Object.entries(p.specs).map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div></section>` : ''}
        <div class="trust"><div><b>🛡️</b>${s.warrantyMonths} oy<br>kafolat</div><div><b>🚚</b>Butun O'zbekiston<br>bo'ylab</div><div><b>💳</b>Qulay<br>to'lov</div></div>
        <div class="note"><span style="font-size:22px">🚚</span><div><b>Yetkazib berish</b>${money(s.freeFrom)} dan yuqori buyurtmalarda bepul, qolganida ${money(s.deliveryFee)}.</div></div>
        ${rel.length ? `<section class="sec"><div class="sec-h"><h2>O'xshash mahsulotlar</h2></div><div class="hscroll">${rel.map(card).join('')}</div></section>` : ''}`,
      mount() {
        drawCta();
        const car = $('#car');
        if (car) car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / car.clientWidth); $$('#dots i').forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
        $$('.sw').forEach((b) => b.addEventListener('click', () => {
          st.color = b.dataset.color; $$('.sw').forEach((x) => x.classList.toggle('on', x === b)); $('#cname').textContent = st.color;
          if (!imgsOf(p).length) $('#gal .media').outerHTML = media(p, st.color); haptic('light'); drawCta();
        }));
        $$('[data-q]').forEach((b) => b.addEventListener('click', () => {
          st.qty = Math.max(1, Math.min(p.stock, st.qty + Number(b.dataset.q))); $('#qv').textContent = st.qty; haptic('light'); drawCta();
        }));
      },
    };
  });

  route(/^\/cart$/, () => {
    const L = lines(), T = totals();
    if (!L.length) return { title: 'Savat', tab: 'cart', html: `<div class="empty"><div class="em">🛒</div><b>Savat bo'sh</b>Mahsulot tanlash uchun katalogni oching<div style="margin-top:18px"><a class="btn" href="#/shop">Katalogga o'tish</a></div></div>` };
    const left = Math.max(0, T.freeFrom - T.sub);
    return {
      title: 'Savat', tab: 'cart',
      right: `<button class="icon-btn" data-clear aria-label="Tozalash" style="font-size:12px;width:auto;padding:0 12px;font-weight:700">Tozalash</button>`,
      html: `${L.map((l) => `<div class="card line">${media(l.p, l.color)}<div><h3>${esc(l.p.title)}</h3>
          <div class="meta">${l.color ? `<i style="background:${esc(hexOf(l.p, l.color))}"></i>${esc(l.color)}` : ''}</div>
          <div class="ctl"><div class="stepper"><button data-cq="${l.i}:-1">−</button><span class="num">${l.qty}</span><button data-cq="${l.i}:1">+</button></div><b class="num">${money(l.p.price * l.qty)}</b></div>
          <button class="del" data-cdel="${l.i}">O'chirish</button></div></div>`).join('')}
        <div class="card free">${left ? `<b>Bepul yetkazishgacha <span class="num">${money(left)}</span> qoldi</b>` : '<b>🎉 Yetkazib berish bepul!</b>'}<div class="bar" style="--p:${Math.min(100, (T.sub / T.freeFrom) * 100)}%"><i style="width:${Math.min(100, (T.sub / T.freeFrom) * 100)}%"></i></div></div>
        <div class="card sum"><div class="r"><span class="hint">Mahsulotlar (${cartCount()} ta)</span><span class="num">${money(T.sub)}</span></div>
          <div class="r"><span class="hint">Kuryer</span><span class="num">${T.fee ? money(T.fee) : 'Bepul'}</span></div><div class="r t"><span>Jami</span><span class="num">${money(T.total)}</span></div></div>`,
      mount() { setCta({ info: ['Jami', money(T.total)], text: 'Buyurtma berish', onClick: () => (location.hash = '#/checkout') }); },
    };
  });

  route(/^\/checkout$/, () => {
    if (!lines().length) { location.hash = '#/cart'; return { title: '', html: '', tab: 'cart' }; }
    const me = S.me, tgUser = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
    const pays = S.data.settings.payments;
    const f = { delivery: 'courier', payment: pays[0].id };
    const fld = (id, label, val, extra = '', tag = 'input') => `<label class="fld" id="f-${id}"><span>${label}</span><${tag} id="${id}" ${extra}${tag === 'input' ? ` value="${esc(val)}"` : ''}>${tag === 'textarea' ? esc(val) + '</textarea>' : ''}<div class="em"></div></label>`;
    return {
      title: 'Buyurtma', tab: 'cart', cta: true, noTabs: true,
      html: `${inTg ? '' : '<div class="alert">Buyurtma berish uchun do\'konni Telegram ichida, botdagi «Open» tugmasi orqali oching.</div>'}
        <div class="fs"><h3><b>1</b>Aloqa</h3>${fld('name', 'Ismingiz', me.name || [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '), 'autocomplete="name" enterkeyhint="next"')}${fld('phone', 'Telefon', me.phone || '', 'type="tel" inputmode="tel" placeholder="90 123 45 67" autocomplete="tel"')}</div>
        <div class="fs"><h3><b>2</b>Yetkazib berish</h3><div class="opts">
          <label class="opt"><input type="radio" name="delivery" value="courier" checked><div><b>🚚 Kuryer</b><small>Manzilingizgacha</small></div></label>
          <label class="opt"><input type="radio" name="delivery" value="pickup"><div><b>🏬 Olib ketish</b><small>Bepul</small></div></label></div>
          <div id="addrWrap" style="margin-top:10px">${fld('address', "Manzil: shahar, tuman, ko'cha, uy", me.address || '', 'rows="2" autocomplete="street-address"', 'textarea')}</div></div>
        <div class="fs"><h3><b>3</b>To'lov</h3><div class="opts">${pays.map((m, k) => `<label class="opt"><input type="radio" name="payment" value="${esc(m.id)}" ${k === 0 ? 'checked' : ''}><div><b>${esc(m.label)}</b><small>${esc(m.hint || '')}</small></div></label>`).join('')}</div>
          <div style="margin-top:10px">${fld('comment', 'Izoh (ixtiyoriy)', '', 'rows="2"', 'textarea')}</div></div>
        <div class="fs"><h3><b>4</b>Buyurtmangiz</h3><div class="card sum" id="osum"></div></div><div id="cerr"></div>`,
      mount() {
        const drawSum = () => {
          const T = totals(f.delivery);
          $('#osum').innerHTML = `${lines().map((l) => `<div class="r"><span>${esc(l.p.title)}${l.color ? ` · ${esc(l.color)}` : ''} × ${l.qty}</span><span class="num">${money(l.p.price * l.qty)}</span></div>`).join('')}
            <div class="r"><span class="hint">Yetkazish</span><span class="num">${T.fee ? money(T.fee) : 'Bepul'}</span></div><div class="r t"><span>Jami</span><span class="num">${money(T.total)}</span></div>`;
          return T;
        };
        let T = drawSum();
        const setErr = (id, msg) => { const el = $('#f-' + id); el.classList.toggle('err', !!msg); $('.em', el).textContent = msg || ''; return !msg; };
        const payLabel = () => (pays.find((x) => x.id === f.payment) || {}).label;
        const cta = (busy) => setCta({ info: ['Jami', money(T.total)], text: busy ? 'Yuborilmoqda...' : f.payment === 'online' ? "To'lash va buyurtma berish" : 'Buyurtmani tasdiqlash', disabled: busy, onClick: submit });
        cta(false);
        $$('input[name=delivery]').forEach((r) => r.addEventListener('change', () => { f.delivery = r.value; $('#addrWrap').style.display = r.value === 'pickup' ? 'none' : ''; T = drawSum(); cta(false); }));
        $$('input[name=payment]').forEach((r) => r.addEventListener('change', () => { f.payment = r.value; cta(false); }));
        $('#phone').addEventListener('input', (e) => e.target.closest('.fld').classList.remove('err'));
        async function submit() {
          $('#cerr').innerHTML = '';
          const name = $('#name').value.trim(), phone = $('#phone').value.trim(), address = $('#address').value.trim();
          const digits = phone.replace(/\D/g, '');
          const ok = [setErr('name', name.length < 2 ? 'Ismingizni kiriting' : ''), setErr('phone', digits.length < 9 ? "Telefon raqamini to'liq kiriting" : ''), setErr('address', f.delivery === 'courier' && address.length < 5 ? 'Manzilni kiriting' : '')].every(Boolean);
          if (!ok) { haptic('err'); const e = $('.fld.err'); e && e.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
          cta(true);
          try {
            const res = await api('order', { name, phone, address, comment: $('#comment').value, delivery: f.delivery, payment: f.payment, items: lines().map((l) => ({ id: l.id, color: l.color, qty: l.qty })) });
            S.me = { name, phone, address }; LS.set('me', S.me);
            S.cart = []; saveCart(); haptic('ok');
            SS.set('last', { ...res.order, transfer: res.transfer || null, invoice_url: res.invoice_url || null });
            const refresh = async () => { try { await load(true); } catch { /* */ } };
            refresh();
            location.hash = '#/done/' + res.order.id;
            if (res.invoice_url && tg && tg.openInvoice) tg.openInvoice(res.invoice_url, (status) => { if (status === 'paid') { const l = SS.get('last'); if (l) { l.paid = true; SS.set('last', l); } toast("To'lov qabul qilindi ✅"); render(); } });
          } catch (e) {
            $('#cerr').innerHTML = `<div class="alert">${esc(e.message)}</div>`; haptic('err'); cta(false); toast(e.message, true);
          }
        }
      },
    };
  });

  const fmtDate = (v) => { const d = new Date(v), p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const FLOW = [['new', 'Qabul qilindi'], ['confirmed', 'Tasdiqlandi'], ['shipping', "Yo'lda"], ['delivered', 'Yetkazildi']];
  const STATUS = { new: ['Yangi', 'brand'], confirmed: ['Tasdiqlandi', 'ok'], shipping: ['Yetkazilmoqda', 'warn'], delivered: ['Yetkazildi', 'ok'], cancelled: ['Bekor qilindi', 'bad'] };
  const timeline = (o) => {
    if (o.status === 'cancelled') return '';
    const idx = FLOW.findIndex((f) => f[0] === o.status);
    return `<div class="tl">${FLOW.map((f, i) => `<div class="${i <= idx ? 'done' : ''}"><i></i>${f[1]}</div>`).join('')}</div>`;
  };
  const orderCard = (o, extra = '') => `<div class="card ocard"><div class="ohead"><b>${esc(o.no)}</b><span class="pill ${STATUS[o.status][1]}">${STATUS[o.status][0]}</span></div>
      <div class="hint" style="font-size:12px;margin-top:2px">${fmtDate(o.created_at)}${o.paid ? ' · ✅ to\'langan' : ''}</div>
      ${timeline(o)}${o.items.map((i) => `<div class="oline"><span>${esc(i.title)}${i.color ? ` · ${esc(i.color)}` : ''} × ${i.qty}</span><b class="num">${money(i.price * i.qty)}</b></div>`).join('')}
      <div class="oline" style="border-top:1px dashed var(--line);margin-top:6px;padding-top:10px"><span>Jami${o.fee ? ` (yetkazish ${money(o.fee)})` : ''}</span><b class="num">${money(o.total)}</b></div>${extra}</div>`;

  route(/^\/done\/(\d+)$/, (m) => {
    const o = SS.get('last');
    if (!o || o.id !== Number(m[1])) { location.hash = '#/orders'; return { title: '', html: '', tab: 'orders' }; }
    const tr = o.transfer ? `<div class="card ocard"><h3 style="font-size:17px">🏦 Karta o'tkazmasi</h3><div class="copy"><code>${esc(o.transfer.card)}</code><button class="btn sm ghost" data-copy="${esc(o.transfer.card)}">Nusxa</button></div>
        ${o.transfer.owner ? `<div class="oline"><span>Egasi</span><b>${esc(o.transfer.owner)}</b></div>` : ''}<div class="oline"><span>Summa</span><b class="num">${money(o.total)}</b></div>
        <p class="hint" style="margin:8px 0 0;font-size:13px">To'lagach, bot chatida «🧾 Chek yuborish» tugmasini bosib, chek rasmini yuboring. Izohga <b>${esc(o.no)}</b> yozing.</p></div>` : '';
    const pay = o.payment === 'online' && !o.paid ? `<button class="btn block ok" style="margin-top:12px" data-pay="${o.id}">💳 Hozir to'lash</button>` : '';
    return {
      title: 'Buyurtma qabul qilindi', tab: 'orders', noTabs: true,
      html: `<div class="ok-wrap"><div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div><svg class="check" viewBox="0 0 120 120" fill="none" stroke="#12a66b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="60" r="54"/><path d="m36 62 17 17 31-36"/></svg>
        <div class="hint">Buyurtma raqami</div><div class="ok-no num">${esc(o.no)}</div><div class="hint">Operator tez orada telefon orqali tasdiqlaydi.<br>Holat o'zgarsa bot sizga xabar yuboradi.</div></div>
        ${orderCard(o, pay)}${tr}
        <div style="display:grid;gap:10px;margin-top:16px"><a class="btn block" href="#/orders">Buyurtmalarim</a><a class="btn block ghost" href="#/shop">Xaridni davom ettirish</a></div>`,
    };
  });

  route(/^\/orders$/, () => ({
    title: 'Buyurtmalar', tab: 'orders',
    html: `<div id="olist">${[1, 2].map(() => '<div class="skel" style="height:150px;margin-top:12px"></div>').join('')}</div>
      <section class="sec"><div class="sec-h"><h2>Raqam bo'yicha qidirish</h2></div><form id="trk" class="card"><label class="fld"><span>Buyurtma raqami</span><input id="tno" placeholder="BC-1001" autocomplete="off"></label>
        <label class="fld"><span>Telefon raqami</span><input id="tph" type="tel" placeholder="90 123 45 67"></label><button class="btn block">Tekshirish</button><div id="tres"></div></form></section>`,
    async mount() {
      const box = $('#olist');
      if (!inTg) box.innerHTML = '<div class="empty"><div class="em">📦</div><b>Buyurtmalaringiz shu yerda</b>Ro\'yxatni ko\'rish uchun do\'konni Telegram ichida oching</div>';
      else try {
        const { orders } = await api('orders');
        box.innerHTML = orders.length ? orders.map((o) => orderCard(o, o.payment === 'online' && !o.paid && o.status !== 'cancelled' ? `<button class="btn block ok" style="margin-top:12px" data-pay="${o.id}">💳 To'lash</button>` : '')).join('')
          : '<div class="empty"><div class="em">📦</div><b>Hali buyurtma yo\'q</b>Birinchi buyurtmangizni bering<div style="margin-top:18px"><a class="btn" href="#/shop">Katalogga o\'tish</a></div></div>';
      } catch (e) { box.innerHTML = `<div class="alert">${esc(e.message)}</div>`; }
      $('#trk').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        try {
          const { order } = await api('track?no=' + encodeURIComponent($('#tno').value) + '&phone=' + encodeURIComponent($('#tph').value));
          $('#tres').innerHTML = order ? orderCard(order) : '<div class="alert">Buyurtma topilmadi. Raqam va telefonni tekshiring.</div>';
        } catch (e) { $('#tres').innerHTML = `<div class="alert">${esc(e.message)}</div>`; }
      });
    },
  }));

  route(/^\/info$/, () => {
    const s = S.data.settings, tel = s.phone.replace(/[^\d+]/g, '');
    return {
      title: "Ma'lumot", tab: 'info',
      html: `<div class="links"><a class="lnk" href="tel:${esc(tel)}"><i>📞</i>${esc(s.phone)}</a><a class="lnk" href="https://t.me/${esc(s.telegram)}"><i>💬</i>@${esc(s.telegram)}</a>
          <a class="lnk" href="${esc(s.channel)}"><i>📣</i>Telegram kanal</a><a class="lnk" href="${esc(s.instagram)}"><i>📷</i>Instagram</a></div>
        <section class="sec"><div class="sec-h"><h2>Savollar</h2></div>${S.data.faq.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
        <section class="sec"><div class="sec-h"><h2>Bizga yozing</h2></div><form id="msg" class="card"><label class="fld"><span>Ismingiz</span><input id="mn" autocomplete="name"></label>
          <label class="fld"><span>Telefon</span><input id="mp" type="tel" placeholder="90 123 45 67"></label><label class="fld"><span>Xabar</span><textarea id="mt" rows="3"></textarea></label>
          <button class="btn block">Yuborish</button><div id="mres"></div></form></section>`,
      mount() {
        $('#mn').value = S.me.name || ''; $('#mp').value = S.me.phone || '';
        $('#msg').addEventListener('submit', async (ev) => {
          ev.preventDefault();
          try { await api('message', { name: $('#mn').value, phone: $('#mp').value, message: $('#mt').value }); $('#mt').value = ''; toast('Xabaringiz yuborildi ✅'); haptic('ok'); $('#mres').innerHTML = ''; }
          catch (e) { $('#mres').innerHTML = `<div class="alert">${esc(e.message)}</div>`; haptic('err'); }
        });
      },
    };
  });

  // ---------- router ----------
  function render() {
    if (!S.data) return;
    const [path, query] = (location.hash.slice(1) || '/').split('?');
    let v = null;
    for (const [re, fn] of views) { const m = re.exec(path); if (m) { v = fn(m, new URLSearchParams(query || '')); break; } }
    if (!v) { location.hash = '#/'; return; }
    $('#toast').className = '';
    curTab = v.tab || 'home';
    document.body.classList.toggle('no-tabs', !!v.noTabs);
    setTop(v); drawTabs();
    $('#view').innerHTML = v.html;
    setCta(null);
    v.mount && v.mount();
    window.scrollTo(0, 0);
    if (tg && tg.BackButton) {
      if (v.home) tg.BackButton.hide(); else tg.BackButton.show();
    }
  }
  window.addEventListener('hashchange', render);

  // ---------- hodisalar ----------
  document.addEventListener('click', async (e) => {
    const t = e.target;
    const fav = t.closest('[data-fav]');
    if (fav) {
      e.stopPropagation(); e.preventDefault();
      const id = Number(fav.dataset.fav), i = S.favs.indexOf(id);
      i >= 0 ? S.favs.splice(i, 1) : S.favs.push(id); LS.set('favs', S.favs); haptic('light');
      $$(`[data-fav="${id}"]`).forEach((b) => b.classList.toggle('on', i < 0));
      if (S.shop.fav && /^#\/shop/.test(location.hash)) render();
      return;
    }
    const qa = t.closest('[data-quick]');
    if (qa) {
      e.stopPropagation(); e.preventDefault();
      const p = prod(Number(qa.dataset.quick)), color = p && p.colors[0] ? p.colors[0].name : '';
      if (p && addToCart(p.id, color, 1)) { qa.classList.add('ok'); qa.textContent = '✓'; toast(`${p.title}${color ? ` (${color})` : ''}: savatga qo'shildi ✅`); setTimeout(() => { qa.classList.remove('ok'); qa.textContent = '+'; }, 900); }
      return;
    }
    const back = t.closest('[data-back]'); if (back) return goBack(/^#\/p\//.test(location.hash) ? S.lastList : '#/');
    const go = t.closest('[data-go]'); if (go) { location.hash = go.dataset.go; return; }
    const cq = t.closest('[data-cq]');
    if (cq) {
      const [i, d] = cq.dataset.cq.split(':').map(Number), l = S.cart[i], p = l && prod(l.id);
      if (!l || !p) return;
      if (d > 0 && l.qty + 1 > p.stock) { toast(`Omborda atigi ${p.stock} ta bor`, true); return; }
      l.qty += d; if (l.qty <= 0) S.cart.splice(i, 1); saveCart(); haptic('light'); render(); return;
    }
    const cd = t.closest('[data-cdel]'); if (cd) { S.cart.splice(Number(cd.dataset.cdel), 1); saveCart(); haptic('light'); render(); return; }
    if (t.closest('[data-clear]')) { S.cart = []; saveCart(); render(); return; }
    const cp = t.closest('[data-copy]');
    if (cp) { try { await navigator.clipboard.writeText(cp.dataset.copy); toast('Nusxalandi ✅'); } catch { toast(cp.dataset.copy); } return; }
    const pay = t.closest('[data-pay]');
    if (pay) {
      try {
        const { invoice_url } = await api('pay', { id: Number(pay.dataset.pay) });
        if (tg && tg.openInvoice) tg.openInvoice(invoice_url, (s) => { if (s === 'paid') { toast("To'lov qabul qilindi ✅"); haptic('ok'); setTimeout(render, 600); } });
        else location.href = invoice_url;
      } catch (err) { toast(err.message, true); }
      return;
    }
    // tashqi havolalar Telegram ichida ochiladi
    const a = t.closest('a[href]');
    if (a && tg && /^https?:\/\//.test(a.href) && new URL(a.href).origin !== location.origin) {
      e.preventDefault();
      /^https:\/\/t\.me\//.test(a.href) ? tg.openTelegramLink(a.href) : tg.openLink(a.href);
    }
  });

  // ---------- Telegram va ishga tushirish ----------
  function applyTheme() {
    const dark = tg && tg.colorScheme ? tg.colorScheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    try { if (tg) { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); tg.setBottomBarColor && tg.setBottomBarColor(getComputedStyle(document.documentElement).getPropertyValue('--card').trim()); } } catch { /* eski versiya */ }
    const m = $('meta[name=theme-color]'); if (m) m.content = bg;
  }
  if (tg) {
    try { tg.ready(); tg.expand(); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); tg.onEvent('themeChanged', applyTheme); if (tg.BackButton) tg.BackButton.onClick(() => goBack('#/')); } catch { /* */ }
  }
  applyTheme();

  async function load(silent) {
    const data = await api('catalog');
    S.data = data;
    S.cart = S.cart.filter((l) => data.products.some((p) => p.id === l.id));
    if (!silent) render(); else drawTabs();
  }
  $('#view').innerHTML = '<div class="skel" style="height:220px;border-radius:26px"></div><div class="grid" style="margin-top:16px">' + '<div class="skel" style="height:210px"></div>'.repeat(4) + '</div>';
  load().catch((e) => {
    $('#view').innerHTML = `<div class="empty"><div class="em">📡</div><b>Yuklab bo'lmadi</b>${esc(e.message)}<div style="margin-top:18px"><button class="btn" onclick="location.reload()">Qayta urinish</button></div></div>`;
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.data && /^#\/(p|cart|checkout)/.test(location.hash) === false) load(true).catch(() => {}); });
})();
