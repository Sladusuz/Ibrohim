/* BabyCheer: Telegram Mini App do'koni. Vanilla JS, build qadamisiz. */
(function () {
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTg = !!(tg && tg.initData);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('bc.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bc.' + k, JSON.stringify(v)); } catch { /* xotira yo'q */ } },
  };
  const SS = {
    get(k) { try { return JSON.parse(sessionStorage.getItem('bc.' + k) || 'null'); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem('bc.' + k, JSON.stringify(v)); } catch { /* */ } },
  };
  const haptic = (t = 'light') => { try { tg && tg.HapticFeedback && (t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : t === 'err' ? tg.HapticFeedback.notificationOccurred('error') : tg.HapticFeedback.impactOccurred(t)); } catch { /* */ } };

  // ---------- til (UZ / RU) ----------
  const I18N = window.BC.i18n;
  const tgLang = (((tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {}).language_code || navigator.language || '').toLowerCase();
  const S = { lang: LS.get('lang', null) || (tgLang.startsWith('ru') ? 'ru' : 'uz') };
  const ru = () => S.lang === 'ru';
  const t = (k, ...a) => {
    let s = I18N[S.lang][k]; if (s === undefined) s = I18N.uz[k]; if (s === undefined) s = k;
    if (typeof s !== 'string') return s;
    a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); });
    return s;
  };
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + t('som');
  const loc = (o, f) => (ru() && o[f + '_ru'] ? o[f + '_ru'] : o[f]);
  const pname = (p) => loc(p, 'title'), cname = (c) => (ru() && c.name_ru ? c.name_ru : c.name);
  const colorName = (n) => (ru() ? I18N.ru.colors[n] || n : n);
  const specKey = (k) => (ru() ? I18N.ru.specKeys[k] || k : k);
  const specVal = (v) => (ru() ? I18N.ru.specVals.reduce((s, [re, to]) => s.replace(re, to), String(v)) : v);
  const badgeName = (b) => (ru() ? I18N.ru.badges[b] || b : b);
  const payInfo = (m) => { const x = I18N[S.lang]['pm_' + m.id]; return x ? { label: x[0], hint: x[1] } : { label: m.label, hint: m.hint || '' }; };

  const ICON = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    bag: '<circle cx="9" cy="20.5" r="1.4"/><circle cx="18" cy="20.5" r="1.4"/><path d="M2.5 3h2.4l2.7 11.6a2 2 0 0 0 2 1.55h8.2a2 2 0 0 0 1.95-1.55L21 7.5H6.1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24">${ICON[n]}</svg>`;

  // ---------- holat ----------
  Object.assign(S, { data: null, cart: LS.get('cart', []), favs: LS.get('favs', []), me: LS.get('me', {}), notify: LS.get('notify', []), shop: { cat: '', q: '', sort: 'pop', stock: false, fav: false, age: '', price: '' }, lastList: '#/shop' });
  const saveCart = () => { LS.set('cart', S.cart); drawTabs(); };

  async function api(path, body) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
    try {
      const res = await fetch('/api/' + path, {
        method: body ? 'POST' : 'GET',
        headers: { 'content-type': 'application/json', 'x-tg-init-data': (tg && tg.initData) || '' },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctl.signal,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || t('serverErr'));
      return j;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error(t('slowNet'));
      if (e instanceof TypeError) throw new Error(t('noNet'));
      throw e;
    } finally { clearTimeout(timer); }
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
    return `<div class="media${im ? ' ph' : ''}" style="--tint:${hex}" data-icon="${esc((cat(p.category_id) || {}).icon || 'car')}" data-hex="${esc(hex)}">${im ? imgTag(im, pname(p)) : artOf(p, color)}</div>`;
  };
  const videoSlide = (p) => `<div class="media vid done"><video src="/vid/${esc(p.video)}" controls playsinline preload="metadata"></video></div>`;
  // mahsulot sahifasi galereyasi: 2+ rasm yoki video bo'lsa surib ko'riladigan karusel
  const gallery = (p, color) => {
    const n = imgsOf(p).length + (p.video ? 1 : 0);
    if (n < 2) return media(p, color);
    return `<div class="car" id="car">${imgsOf(p).map((_, i) => media(p, color, i)).join('')}${p.video ? videoSlide(p) : ''}${!imgsOf(p).length ? media(p, color) : ''}</div><div class="dots" id="dots">${Array.from({ length: n }, (_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
  };
  // rasm yuklanmasa (404, uzilish) illyustratsiyaga qaytadi: singan ikonka ko'rinmaydi
  document.addEventListener('error', (e) => {
    const im = e.target, m = im && im.tagName === 'IMG' && im.closest('.media');
    if (m) { m.classList.remove('ph'); m.classList.add('done'); m.innerHTML = window.BC.art(m.dataset.icon || 'car', m.dataset.hex || '#2b59ff'); }
  }, true);
  const favBtn = (id) => `<button class="fav ${S.favs.includes(id) ? 'on' : ''}" data-fav="${id}" aria-label="${esc(t('fav'))}">${svg('heart')}</button>`;
  const stars = (avg) => '★★★★★'.slice(0, Math.round(avg)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(avg));
  const tagOf = (p) => (p.stock ? (pct(p) ? `<span class="tag sale">−${pct(p)}%</span>` : p.badge ? `<span class="tag">${esc(badgeName(p.badge))}</span>` : '') : `<span class="tag out">${t('soldOut')}</span>`);
  const card = (p) => `<article class="pcard" data-go="#/p/${p.id}">
      <div style="position:relative">${media(p)}${tagOf(p)}${favBtn(p.id)}${p.stock && p.stock <= 3 ? `<span class="low">${t('lastN', p.stock)}</span>` : ''}</div>
      <div class="pbody"><h3>${esc(pname(p))}</h3>${p.rating ? `<div class="rate"><span>★</span> ${p.rating.avg.toFixed(1)} <i>(${p.rating.count})</i></div>` : `<div class="short">${esc(loc(p, 'short'))}</div>`}
      <div class="price"><b class="num">${money(p.price)}</b></div>
      <div class="pfoot"><span class="sub">${p.old_price > p.price ? `<s class="num">${money(p.old_price).replace(' ' + t('som'), '')}</s>` : p.stock ? `<em>${t('available')}</em>` : t('notSold')}</span>${p.stock ? `<button class="qa" data-quick="${p.id}" aria-label="${esc(t('addToCart'))}">${svg('bag')}</button>` : ''}</div></div></article>`;

  // ---------- savat ----------
  function lines() {
    return S.cart.map((l, i) => ({ ...l, i, p: prod(l.id) })).filter((l) => l.p && l.p.stock > 0).map((l) => ({ ...l, qty: Math.min(l.qty, l.p.stock) }));
  }
  const regionFee = () => Math.max(0, Number(S.data.settings.regionFee) || 0);
  const deliveryText = (d, fee) => (d === 'region' && !fee ? t('deliveryAsk') : fee ? money(fee) : t('free'));
  function totals(delivery = 'courier', discount = 0) {
    const sub = lines().reduce((s, l) => s + l.p.price * l.qty, 0);
    const fee = delivery === 'region' ? regionFee() : 0; // Toshkent bo'ylab va olib ketish: bepul
    const disc = Math.min(discount, sub);
    return { sub, fee, disc, total: Math.max(0, sub + fee - disc) };
  }
  const cartCount = () => lines().reduce((s, l) => s + l.qty, 0);
  let holdBump = false;
  const cartLink = () => $('#tabs a[href="#/cart"]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bumpCart() {
    const a = cartLink(); if (!a) return;
    a.classList.remove('ring'); void a.offsetWidth; a.classList.add('ring'); setTimeout(() => a.classList.remove('ring'), 700);
    const b = $('.badge', a); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }
  // mahsulot rasmi yoy bo'ylab savat ikonkasiga uchib boradi
  function flyToCart(src) {
    const icon = $('svg', cartLink() || document.body), ok = cartLink() && icon && src && !reduceMotion && icon.getBoundingClientRect().width > 0;
    if (!ok) return bumpCart();
    const s = src.getBoundingClientRect(), tt = icon.getBoundingClientRect(), size = 64;
    const sx = s.left + s.width / 2, sy = s.top + Math.min(s.height / 2, 120), dx = tt.left + tt.width / 2 - sx, dy = tt.top + tt.height / 2 - sy;
    const el = document.createElement('div'); el.className = 'fly'; el.innerHTML = src.innerHTML;
    el.style.cssText = `left:${sx - size / 2}px;top:${sy - size / 2}px;width:${size}px;height:${size}px`;
    document.body.append(el);
    const anim = el.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${Math.min(dy * 0.5, 0) - 110}px) scale(.85) rotate(160deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.18) rotate(360deg)`, opacity: .35 },
    ], { duration: 780, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = () => { el.remove(); bumpCart(); };
    anim.oncancel = () => el.remove();
  }
  function addToCart(id, color, qty = 1, fromEl = null) {
    const p = prod(id);
    const ex = S.cart.find((l) => l.id === id && l.color === color);
    const have = ex ? ex.qty : 0;
    if (!p || have + qty > p.stock) { toast(t('onlyN', p ? p.stock : 0), true); haptic('err'); return false; }
    ex ? (ex.qty += qty) : S.cart.push({ id, color, qty });
    holdBump = !!fromEl && !reduceMotion; saveCart(); holdBump = false; haptic('medium');
    if (fromEl) flyToCart(fromEl);
    return true;
  }

  // ---------- umumiy UI ----------
  let toastT;
  function toast(msg, bad) {
    const el = $('#toast'); el.textContent = msg; el.className = 'on' + (bad ? ' bad' : '');
    clearTimeout(toastT); toastT = setTimeout(() => (el.className = ''), 2400);
  }
  const TABS = [['#/', 'home', 'tabHome', 'home'], ['#/shop', 'shop', 'tabShop', 'grid'], ['#/cart', 'cart', 'tabCart', 'bag'], ['#/orders', 'orders', 'tabOrders', 'box'], ['#/info', 'info', 'tabInfo', 'info']];
  let curTab = 'home';
  let prevN = 0;
  function drawTabs() {
    const n = S.data ? cartCount() : 0;
    const up = n > prevN && !holdBump; prevN = n;
    const nav = $('#tabs'); nav.setAttribute('aria-label', t('menuLabel'));
    nav.innerHTML = TABS.map(([h, k, label, ic]) => `<a href="${h}" class="${curTab === k ? 'on' : ''}">${svg(ic)}${t(label)}${k === 'cart' && n ? `<span class="badge${up ? ' bump' : ''}">${n}</span>` : ''}</a>`).join('');
  }
  const themeBtn = () => `<button class="icon-btn tgl" data-theme-toggle aria-label="${esc(t('themeLabel'))}"><svg class="sun" viewBox="0 0 24 24">${ICON.sun}</svg><svg class="moon" viewBox="0 0 24 24">${ICON.moon}</svg></button>`;
  const langBtn = () => `<button class="icon-btn lang" data-lang-toggle aria-label="Til / Язык">${t('langBtn')}</button>`;
  function setTop(v) {
    const top = $('#top');
    if (v.home) {
      top.innerHTML = `<div class="logo"><i>🚗</i>BabyCheer</div><span class="top-sp"></span>
        <a class="icon-btn" href="#/shop?q=" aria-label="${esc(t('search'))}">${svg('search')}</a>
        <a class="icon-btn" href="#/shop?fav=1" aria-label="${esc(t('favs'))}">${svg('heart')}</a>${langBtn()}${themeBtn()}`;
    } else {
      top.innerHTML = `<button class="back" data-back aria-label="${esc(t('back'))}">${svg('back')}</button><div class="top-title">${esc(v.title || '')}</div>${v.right || ''}${langBtn()}${themeBtn()}`;
    }
  }
  function setCta(c) {
    const el = $('#cta');
    if (!c) { el.className = ''; el.innerHTML = ''; document.body.classList.remove('has-cta'); return; }
    el.className = 'on'; document.body.classList.add('has-cta');
    el.innerHTML = `<div class="cta-in">${c.info ? `<div class="cta-info"><small>${esc(c.info[0])}</small><b class="num">${esc(c.info[1])}</b></div>` : ''}${c.second ? `<button class="btn ghost" id="ctaBtn2">${esc(c.second.text)}</button>` : ''}<button class="btn grow ${c.cls || ''}" id="ctaBtn" ${c.disabled ? 'disabled' : ''}>${esc(c.text)}</button></div>`;
    $('#ctaBtn').onclick = c.onClick;
    if (c.second) $('#ctaBtn2').onclick = c.second.onClick;
  }
  function goBack(fallback) {
    if (history.length > 1) history.back(); else location.hash = fallback || '#/';
  }

  // ---------- sahifalar ----------
  const TINTS = ['#2b59ff', '#ff7a1a', '#12a66b', '#f0589f', '#10a5b8', '#8b5cf6'];
  const views = [];
  const route = (re, fn) => views.push([re, fn]);

  const bannerHref = (b) => (b.target_type === 'category' ? `#/shop?cat=${b.target}` : b.target_type === 'product' ? `#/p/${b.target}` : b.target_type === 'url' ? b.target : '');
  const banners = (list) => (list.length ? `<div class="bns">${list.map((b) => { const h = bannerHref(b); return `<a class="bn ${esc(b.color || 'blue')}" ${h ? `href="${esc(h)}"` : ''}><b>${esc(loc(b, 'title'))}</b>${loc(b, 'text') ? `<small>${esc(loc(b, 'text'))}</small>` : ''}</a>`; }).join('')}</div>` : '');

  route(/^\/$/, () => {
    const d = S.data, sale = d.products.filter((p) => pct(p) > 0 && p.stock), hot = d.products.filter((p) => p.featured && p.stock);
    const maxOff = Math.max(0, ...d.products.filter((p) => p.stock).map(pct));
    return {
      home: true, tab: 'home',
      html: `<section class="hero"><span class="hero-chip">${maxOff ? t('heroSale', maxOff) : t('heroNew')}</span><h1>${t('heroTitle')}</h1><p>${t('heroText')}</p>
          <a class="btn" href="#/shop">${t('openCatalog')}</a><div class="hero-art">${window.BC.art('car', '#ffb800')}</div></section>
        ${banners(d.banners || [])}
        <div class="perks"><div class="perk"><b>🚚</b>${t('perkTas')}</div><div class="perk"><b>📦</b>${t('perkUz')}</div><div class="perk"><b>💳</b>${t('perkPay')}</div></div>
        <section class="sec"><div class="sec-h"><h2>${t('categories')}</h2></div><div class="cats">${d.categories.map((c, i) => {
          const n = d.products.filter((p) => p.category_id === c.id).length, tint = TINTS[i % TINTS.length];
          return `<button class="cat" style="--c:${tint}" data-go="#/shop?cat=${c.id}"><b>${esc(cname(c))}</b><small>${t('nProducts', n)}</small>${window.BC.art(c.icon || 'car', tint)}</button>`;
        }).join('')}</div></section>
        ${sale.length ? `<section class="sec"><div class="sec-h"><h2>${t('sales')}</h2><a href="#/shop?sort=sale">${t('all')}</a></div><div class="hscroll">${sale.map(card).join('')}</div></section>` : ''}
        ${hot.length ? `<section class="sec"><div class="sec-h"><h2>${t('hot')}</h2><a href="#/shop">${t('all')}</a></div><div class="hscroll">${hot.map(card).join('')}</div></section>` : ''}
        <section class="sec"><div class="sec-h"><h2>${t('allProducts')}</h2></div><div class="grid">${d.products.slice(0, 8).map(card).join('')}</div></section>`,
    };
  });

  const SORTS = { pop: 'sortPop', 'price-asc': 'sortAsc', 'price-desc': 'sortDesc', sale: 'sortSale' };
  const AGE_B = { 0: [0, 2], 3: [3, 5], 6: [6, 8], 9: [9, 18] };
  const PRICE_B = { 1: [0, 500000], 2: [500000, 1500000], 3: [1500000, 3000000], 4: [3000000, Infinity] };
  function filtered() {
    const f = S.shop, ab = AGE_B[f.age], pb = PRICE_B[f.price];
    let list = S.data.products.filter((p) => (!f.cat || p.category_id === Number(f.cat)) && (!f.stock || p.stock > 0) && (!f.fav || S.favs.includes(p.id)));
    if (ab) list = list.filter((p) => (p.age_min != null || p.age_max != null) && (p.age_min ?? 0) <= ab[1] && (p.age_max ?? 18) >= ab[0]);
    if (pb) list = list.filter((p) => p.price >= pb[0] && p.price < pb[1]);
    const q = f.q.trim().toLowerCase();
    if (q) list = list.filter((p) => [p.title, p.title_ru, p.short, p.short_ru, p.description, p.description_ru].join(' ').toLowerCase().includes(q));
    if (f.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (f.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (f.sort === 'sale') list.sort((a, b) => pct(b) - pct(a));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.sold || 0) - (a.sold || 0) || a.sort - b.sort);
    return list;
  }
  route(/^\/shop$/, (m, qs) => {
    S.shop = { cat: qs.get('cat') || '', q: qs.get('q') || '', sort: qs.get('sort') || 'pop', stock: qs.get('stock') === '1', fav: qs.get('fav') === '1', age: qs.get('age') || '', price: qs.get('price') || '' };
    S.lastList = '#' + (location.hash.slice(1) || '/shop');
    const f = S.shop;
    return {
      title: t('catalog'), tab: 'shop',
      html: `<label class="search">${svg('search')}<input id="q" type="search" placeholder="${esc(t('searchPh'))}" value="${esc(f.q)}" autocomplete="off" enterkeyhint="search"></label>
        <div class="chips"><button class="chip ${!f.cat && !f.fav ? 'on' : ''}" data-cat="">${t('all')}</button><button class="chip ${f.fav ? 'on' : ''}" data-cat="fav">${t('favChip')}</button>${S.data.categories.map((c) => `<button class="chip ${String(c.id) === f.cat ? 'on' : ''}" data-cat="${c.id}">${esc(cname(c))}</button>`).join('')}</div>
        <div class="chips ages"><button class="chip sm ${!f.age ? 'on' : ''}" data-age="">${t('ageAll')}</button>${Object.keys(AGE_B).map((k) => `<button class="chip sm ${f.age === k ? 'on' : ''}" data-age="${k}">${t('age' + k)}</button>`).join('')}</div>
        <div class="toolbar"><select id="sort" aria-label="${esc(t('sortLabel'))}">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${f.sort === k ? 'selected' : ''}>${t(v)}</option>`).join('')}</select>
        <select id="price" aria-label="${esc(t('price'))}"><option value="">${t('priceAll')}</option>${Object.keys(PRICE_B).map((k) => `<option value="${k}" ${f.price === k ? 'selected' : ''}>${t('price' + k)}</option>`).join('')}</select>
        <label class="switch"><input type="checkbox" id="stock" ${f.stock ? 'checked' : ''}>${t('inStock')}</label></div>
        <div id="plist"></div>`,
      mount() {
        const sync = () => {
          const p = new URLSearchParams();
          if (f.cat) p.set('cat', f.cat); if (f.q) p.set('q', f.q); if (f.sort !== 'pop') p.set('sort', f.sort); if (f.stock) p.set('stock', '1'); if (f.fav) p.set('fav', '1'); if (f.age) p.set('age', f.age); if (f.price) p.set('price', f.price);
          history.replaceState(null, '', '#/shop' + (p.toString() ? '?' + p : '')); S.lastList = location.hash;
          drawList();
        };
        const drawList = () => {
          const list = filtered();
          $('#plist').innerHTML = list.length ? `<div class="grid">${list.map(card).join('')}</div>`
            : `<div class="empty"><div class="em">${f.fav ? '❤️' : '🔍'}</div><b>${f.fav ? t('noFavs') : t('nothing')}</b>${f.fav ? t('noFavsHint') : t('nothingHint')}</div>`;
        };
        drawList();
        let tm; $('#q').addEventListener('input', (e) => { clearTimeout(tm); tm = setTimeout(() => { f.q = e.target.value; sync(); }, 200); });
        $('#sort').addEventListener('change', (e) => { f.sort = e.target.value; sync(); });
        $('#price').addEventListener('change', (e) => { f.price = e.target.value; sync(); });
        $('#stock').addEventListener('change', (e) => { f.stock = e.target.checked; sync(); });
        $$('[data-cat]').forEach((c) => c.addEventListener('click', () => {
          const v = c.dataset.cat; f.fav = v === 'fav'; f.cat = v === 'fav' ? '' : v;
          $$('[data-cat]').forEach((x) => x.classList.toggle('on', x === c)); sync(); haptic('light');
        }));
        $$('[data-age]').forEach((c) => c.addEventListener('click', () => {
          f.age = c.dataset.age; $$('[data-age]').forEach((x) => x.classList.toggle('on', x === c)); sync(); haptic('light');
        }));
        if (qs.has('q') && !f.q) $('#q').focus();
      },
    };
  });

  // mahsulotga fikrlar: ro'yxat va (yetkazilgan buyurtma bo'lsa) baho berish formasi
  async function loadReviews(p, focus) {
    const box = $('#rvs'); if (!box) return;
    let list = [], orderId = null;
    try { list = (await api('reviews?pid=' + p.id)).reviews; } catch { /* ro'yxat bo'sh */ }
    if (inTg) {
      try {
        const { orders, reviewed } = await api('orders');
        const o = orders.find((x) => x.status === 'delivered' && x.items.some((i) => i.id === p.id) && !reviewed.includes(`${x.id}:${p.id}`));
        if (o) orderId = o.id;
      } catch { /* forma ko'rinmaydi */ }
    }
    if (!$('#rvs')) return; // foydalanuvchi boshqa sahifaga o'tib ketgan
    const date = (v) => fmtDate(v).slice(0, 5);
    box.innerHTML = (list.length ? list.map((r) => `<div class="rv"><div class="rvh"><b>${esc(r.name)}</b><span class="stars">${stars(r.rating)}</span><small>${date(r.at)}</small></div>${r.text ? `<p>${esc(r.text)}</p>` : ''}</div>`).join('') : `<div class="hint" style="padding:4px 2px">${t('noReviews')}</div>`)
      + (orderId ? `<form class="card rform" id="rform"><h3>${t('rateTitle')}</h3><div class="pick" id="pick">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-label="${esc(t('rateStar', n))}">★</button>`).join('')}</div>
          <label class="fld"><span>${t('rateText')}</span><textarea id="rtext" rows="2" maxlength="500"></textarea></label><button class="btn block">${t('rateSend')}</button><div id="rerr"></div></form>` : '');
    if (orderId) {
      let val = 0;
      $$('#pick button').forEach((b) => b.addEventListener('click', () => { val = Number(b.dataset.star); $$('#pick button').forEach((x) => x.classList.toggle('on', Number(x.dataset.star) <= val)); haptic('light'); }));
      $('#rform').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (!val) { $('#rerr').innerHTML = `<div class="alert">${t('rateFirst')}</div>`; haptic('err'); return; }
        try {
          await api('review', { order_id: orderId, product_id: p.id, rating: val, text: $('#rtext').value });
          toast(t('rateThanks')); haptic('ok'); load(true).catch(() => {}); loadReviews(p);
        } catch (e) { $('#rerr').innerHTML = `<div class="alert">${esc(e.message)}</div>`; haptic('err'); }
      });
    }
    if (focus && orderId) $('#rform').scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  route(/^\/p\/(\d+)$/, (m, qs) => {
    const p = prod(m[1]);
    if (!p) return { title: t('notFound'), tab: 'shop', html: `<div class="empty"><div class="em">😕</div><b>${t('productNotFound')}</b></div>` };
    const st = { color: p.colors[0] ? p.colors[0].name : '', qty: 1 };
    const s = S.data.settings, c = cat(p.category_id), bot = s.botUsername, inst = s.installment;
    const rel = S.data.products.filter((x) => x.category_id === p.category_id && x.id !== p.id && x.stock).slice(0, 6);
    const inCart = () => (S.cart.find((l) => l.id === p.id && l.color === st.color) || {}).qty || 0;
    const drawCta = () => {
      if (!p.stock) {
        const on = S.notify.includes(p.id);
        return setCta({ text: on ? t('notifyOn') : t('notifyMe'), disabled: on, onClick: async () => {
          if (!inTg) { toast(t('notifyTg'), true); return; }
          try { await api('notify', { pid: p.id }); S.notify.push(p.id); LS.set('notify', S.notify); toast(t('notifyDone')); haptic('ok'); drawCta(); } catch (e) { toast(e.message, true); haptic('err'); }
        } });
      }
      const n = inCart();
      setCta({
        text: n ? t('inCartMore', n) : t('addToCart'),
        onClick: () => { if (addToCart(p.id, st.color, st.qty, $('#gal .media'))) { toast(t('addedToCart')); drawCta(); } },
        second: { text: t('buyNow'), onClick: () => { const ex = S.cart.find((l) => l.id === p.id && l.color === st.color); if (ex || addToCart(p.id, st.color, st.qty)) location.hash = '#/checkout'; } },
      });
    };
    const monthly = inst && inst.enabled ? Math.ceil((p.price * (1 + (inst.markup || 0) / 100)) / inst.months) : 0;
    return {
      title: c ? cname(c) : t('product'), tab: 'shop', cta: true,
      right: bot ? `<button class="icon-btn" data-share="${p.id}" aria-label="${esc(t('share'))}">${svg('share')}</button>` : '',
      html: `<div class="gallery" id="gal">${gallery(p, st.color)}${favBtn(p.id)}${tagOf(p)}</div>
        <div class="pt"><h1>${esc(pname(p))}</h1>
          <div class="row"><span class="big num">${money(p.price)}</span>${p.old_price > p.price ? `<s class="num">${money(p.old_price)}</s><span class="pill bad">−${pct(p)}%</span>` : ''}</div>
          <div class="row">${p.stock ? `<span class="pill ok">${p.stock <= 5 ? t('inStockN', p.stock) : t('available')}</span>` : `<span class="pill bad">${t('notSold')}</span>`}<span class="pill brand">${t('tashFree')}</span>${(p.sold || 0) >= 1 ? `<span class="pill warn">${t('soldN', p.sold)}</span>` : ''}${p.rating ? `<a class="pill gold" href="#/p/${p.id}?review=0" data-scroll="#rvs">★ ${p.rating.avg.toFixed(1)} · ${p.rating.count}</a>` : ''}</div>
          ${p.old_price > p.price ? `<div class="save">${t('youSave', money(p.old_price - p.price))}</div>` : ''}
          ${monthly ? `<div class="inst"><b>${t('instTitle')}</b><span>${t('instLine', `<em class="num">${money(monthly)}</em>`, inst.months)}</span><small>${t('instNote')}</small></div>` : ''}
          <p class="hint" style="margin:12px 0 0">${esc(loc(p, 'description') || loc(p, 'short'))}</p></div>
        ${p.colors.length > 1 ? `<section class="sec"><div class="sec-h"><h2>${t('color')}</h2><span class="hint" id="cname">${esc(colorName(st.color))}</span></div><div class="swatches">${p.colors.map((c2) => `<button class="sw ${c2.name === st.color ? 'on' : ''}" data-color="${esc(c2.name)}"><i style="background:${esc(c2.hex)}"></i>${esc(colorName(c2.name))}</button>`).join('')}</div></section>` : ''}
        ${p.stock ? `<section class="sec"><div class="sec-h"><h2>${t('qty')}</h2><div class="stepper"><button data-q="-1" aria-label="${esc(t('less'))}">−</button><span id="qv" class="num">1</span><button data-q="1" aria-label="${esc(t('more'))}">+</button></div></div></section>` : ''}
        ${Object.keys(p.specs || {}).length ? `<section class="sec"><div class="sec-h"><h2>${t('specs')}</h2></div><div class="card specs">${Object.entries(p.specs).map(([k, v]) => `<div><span>${esc(specKey(k))}</span><b>${esc(specVal(v))}</b></div>`).join('')}</div></section>` : ''}
        <div class="trust"><div><b>🚚</b>${t('trustTash')}</div><div><b>📦</b>${t('trustUz')}</div><div><b>💳</b>${t('trustPay')}</div></div>
        <div class="note"><span style="font-size:22px">🚚</span><div><b>${t('deliveryTitle')}</b>${t('deliveryNote', regionFee() ? t('deliveryRegionFee', money(regionFee())) : t('deliveryRegionAsk'))}</div></div>
        <section class="sec" id="rsec"><div class="sec-h"><h2>${t('reviews')}</h2></div><div id="rvs"><div class="skel" style="height:64px"></div></div></section>
        ${rel.length ? `<section class="sec"><div class="sec-h"><h2>${t('related')}</h2></div><div class="hscroll">${rel.map(card).join('')}</div></section>` : ''}`,
      mount() {
        drawCta();
        const car = $('#car');
        if (car) car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / car.clientWidth); $$('#dots i').forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
        $$('.sw').forEach((b) => b.addEventListener('click', () => {
          st.color = b.dataset.color; $$('.sw').forEach((x) => x.classList.toggle('on', x === b)); $('#cname').textContent = colorName(st.color);
          if (!imgsOf(p).length && $('#gal .media:not(.vid)')) $('#gal .media:not(.vid)').outerHTML = media(p, st.color); haptic('light'); drawCta();
        }));
        $$('[data-q]').forEach((b) => b.addEventListener('click', () => {
          st.qty = Math.max(1, Math.min(p.stock, st.qty + Number(b.dataset.q))); $('#qv').textContent = st.qty; haptic('light'); drawCta();
        }));
        loadReviews(p, qs.get('review') === '1');
      },
    };
  });

  route(/^\/cart$/, () => {
    const L = lines(), T = totals();
    if (!L.length) return { title: t('cart'), tab: 'cart', html: `<div class="empty"><div class="em">🛒</div><b>${t('cartEmpty')}</b>${t('cartEmptyHint')}<div style="margin-top:18px"><a class="btn" href="#/shop">${t('toCatalog')}</a></div></div>` };
    return {
      title: t('cart'), tab: 'cart',
      right: `<button class="icon-btn" data-clear aria-label="${esc(t('clear'))}" style="font-size:12px;width:auto;padding:0 12px;font-weight:700">${t('clear')}</button>`,
      html: `${L.map((l) => `<div class="card line">${media(l.p, l.color)}<div><h3>${esc(pname(l.p))}</h3>
          <div class="meta">${l.color ? `<i style="background:${esc(hexOf(l.p, l.color))}"></i>${esc(colorName(l.color))}` : ''}</div>
          <div class="ctl"><div class="stepper"><button data-cq="${l.i}:-1">−</button><span class="num">${l.qty}</span><button data-cq="${l.i}:1">+</button></div><b class="num">${money(l.p.price * l.qty)}</b></div>
          <button class="del" data-cdel="${l.i}">${t('remove')}</button></div></div>`).join('')}
        <div class="note" style="margin-top:14px"><span style="font-size:22px">🚚</span><div><b>${t('note1')}</b>${t('note2')}</div></div>
        <div class="card sum"><div class="r"><span class="hint">${t('products', cartCount())}</span><span class="num">${money(T.sub)}</span></div>
          <div class="r"><span class="hint">${t('deliveryTash')}</span><span class="num">${t('free')}</span></div><div class="r t"><span>${t('total')}</span><span class="num">${money(T.total)}</span></div></div>`,
      mount() { setCta({ info: [t('total'), money(T.total)], text: t('placeOrder'), onClick: () => (location.hash = '#/checkout') }); },
    };
  });

  route(/^\/checkout$/, () => {
    if (!lines().length) { location.hash = '#/cart'; return { title: '', html: '', tab: 'cart' }; }
    const me = S.me, tgUser = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
    const pays = S.data.settings.payments;
    const f = { delivery: 'courier', payment: pays[0].id, promo: null };
    const fld = (id, label, val, extra = '', tag = 'input') => `<label class="fld" id="f-${id}"><span>${label}</span><${tag} id="${id}" ${extra}${tag === 'input' ? ` value="${esc(val)}"` : ''}>${tag === 'textarea' ? esc(val) + '</textarea>' : ''}<div class="em"></div></label>`;
    return {
      title: t('order'), tab: 'cart', cta: true, noTabs: true,
      html: `${inTg ? '' : `<div class="alert">${t('openInTg')}</div>`}
        <div class="fs"><h3><b>1</b>${t('s1')}</h3>${fld('name', t('yourName'), me.name || [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '), 'autocomplete="name" enterkeyhint="next"')}${fld('phone', t('phone'), me.phone || '', 'type="tel" inputmode="tel" placeholder="90 123 45 67" autocomplete="tel"')}</div>
        <div class="fs"><h3><b>2</b>${t('s2')}</h3><div class="opts">
          <label class="opt"><input type="radio" name="delivery" value="courier" checked><div><b>${t('dCourier')}</b><small>${t('dCourierHint')}</small></div></label>
          <label class="opt"><input type="radio" name="delivery" value="region"><div><b>${t('dRegion')}</b><small>${regionFee() ? esc(t('dRegionFee', money(regionFee()))) : t('dRegionAsk')}</small></div></label>
          <label class="opt"><input type="radio" name="delivery" value="pickup"><div><b>${t('dPickup')}</b><small>${t('dFree')}</small></div></label></div>
          <div id="addrWrap" style="margin-top:10px">${fld('address', t('address'), me.address || '', 'rows="2" autocomplete="street-address"', 'textarea')}<button type="button" class="btn sm ghost" id="locBtn">${t('myLocation')}</button></div></div>
        <div class="fs"><h3><b>3</b>${t('s3')}</h3><div class="opts">${pays.map((m, k) => { const pi = payInfo(m); return `<label class="opt"><input type="radio" name="payment" value="${esc(m.id)}" ${k === 0 ? 'checked' : ''}><div><b>${esc(pi.label)}</b><small>${esc(pi.hint)}</small></div></label>`; }).join('')}</div>
          <div style="margin-top:10px">${fld('comment', t('comment'), '', 'rows="2"', 'textarea')}</div></div>
        <div class="fs"><h3><b>4</b>${t('s4')}</h3><div class="promo"><input id="promo" placeholder="${esc(t('promoPh'))}" autocomplete="off" autocapitalize="characters" maxlength="20"><button type="button" class="btn sm ghost" id="promoBtn">${t('promoApply')}</button></div><div id="pmsg" class="hint pmsg"></div><div class="card sum" id="osum"></div></div><div id="cerr"></div>`,
      mount() {
        const drawSum = () => {
          const T = totals(f.delivery, f.promo ? f.promo.discount : 0);
          $('#osum').innerHTML = `${lines().map((l) => `<div class="r"><span>${esc(pname(l.p))}${l.color ? ` · ${esc(colorName(l.color))}` : ''} × ${l.qty}</span><span class="num">${money(l.p.price * l.qty)}</span></div>`).join('')}
            <div class="r"><span class="hint">${t('deliveryWord')}</span><span class="num">${deliveryText(f.delivery, T.fee)}</span></div>
            ${T.disc ? `<div class="r disc"><span>${t('promoDiscount', esc(f.promo.code))}</span><span class="num">−${money(T.disc)}</span></div>` : ''}<div class="r t"><span>${t('total')}</span><span class="num">${money(T.total)}</span></div>`;
          return T;
        };
        let T = drawSum();
        const setErr = (id, msg) => { const el = $('#f-' + id); el.classList.toggle('err', !!msg); $('.em', el).textContent = msg || ''; return !msg; };
        const cta = (busy) => setCta({ info: [t('total'), money(T.total)], text: busy ? t('sending') : f.payment === 'online' ? t('payAndOrder') : t('confirmOrder'), disabled: busy, onClick: submit });
        cta(false);
        $$('input[name=delivery]').forEach((r) => r.addEventListener('change', () => { f.delivery = r.value; $('#addrWrap').style.display = r.value === 'pickup' ? 'none' : ''; T = drawSum(); cta(false); }));
        $$('input[name=payment]').forEach((r) => r.addEventListener('change', () => { f.payment = r.value; cta(false); }));
        $('#phone').addEventListener('input', (e) => e.target.closest('.fld').classList.remove('err'));
        $('#locBtn').addEventListener('click', () => {
          if (!navigator.geolocation) { toast(t('locFail'), true); return; }
          navigator.geolocation.getCurrentPosition((pos) => {
            const link = `https://maps.google.com/?q=${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`, a = $('#address');
            a.value = (a.value.trim() ? a.value.trim() + '\n' : '') + link; $('#f-address').classList.remove('err'); toast(t('locOk')); haptic('ok');
          }, () => { toast(t('locFail'), true); haptic('err'); }, { timeout: 10000, maximumAge: 60000 });
        });
        $('#promoBtn').addEventListener('click', async () => {
          const code = $('#promo').value.trim(), msgEl = $('#pmsg');
          if (!code) { f.promo = null; msgEl.className = 'hint pmsg bad'; msgEl.textContent = t('promoEmpty'); T = drawSum(); cta(false); return; }
          try {
            const r = await api('promo', { code, items: lines().map((l) => ({ id: l.id, qty: l.qty })) });
            f.promo = { code: r.code, discount: r.discount }; msgEl.className = 'hint pmsg ok'; msgEl.textContent = t('promoOk', money(r.discount)); haptic('ok');
          } catch (e) { f.promo = null; msgEl.className = 'hint pmsg bad'; msgEl.textContent = e.message; haptic('err'); }
          T = drawSum(); cta(false);
        });
        async function submit() {
          $('#cerr').innerHTML = '';
          const name = $('#name').value.trim(), phone = $('#phone').value.trim(), address = $('#address').value.trim();
          const digits = phone.replace(/\D/g, '');
          const ok = [setErr('name', name.length < 2 ? t('errName') : ''), setErr('phone', digits.length < 9 ? t('errPhone') : ''), setErr('address', f.delivery !== 'pickup' && address.length < 5 ? t('errAddr') : '')].every(Boolean);
          if (!ok) { haptic('err'); const e = $('.fld.err'); e && e.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
          cta(true);
          try {
            const res = await api('order', { name, phone, address, comment: $('#comment').value, delivery: f.delivery, payment: f.payment, lang: S.lang, promo: f.promo ? f.promo.code : '', items: lines().map((l) => ({ id: l.id, color: l.color, qty: l.qty })) });
            S.me = { name, phone, address }; LS.set('me', S.me);
            S.cart = []; saveCart(); haptic('ok');
            SS.set('last', { ...res.order, transfer: res.transfer || null, invoice_url: res.invoice_url || null });
            const refresh = async () => { try { await load(true); } catch { /* */ } };
            refresh();
            location.hash = '#/done/' + res.order.id;
            if (res.invoice_url && tg && tg.openInvoice) tg.openInvoice(res.invoice_url, (status) => { if (status === 'paid') { const l = SS.get('last'); if (l) { l.paid = true; SS.set('last', l); } toast(t('paidOk')); render(); } });
          } catch (e) {
            $('#cerr').innerHTML = `<div class="alert">${esc(e.message)}</div>`; haptic('err'); cta(false); toast(e.message, true);
          }
        }
      },
    };
  });

  const fmtDate = (v) => { const d = new Date(v), p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const FLOW = ['new', 'confirmed', 'shipping', 'delivered'];
  const STATUS_CLS = { new: 'brand', confirmed: 'ok', shipping: 'warn', delivered: 'ok', cancelled: 'bad' };
  const timeline = (o) => {
    if (o.status === 'cancelled') return '';
    const idx = FLOW.indexOf(o.status);
    return `<div class="tl">${FLOW.map((k, i) => `<div class="${i <= idx ? 'done' : ''}"><i></i>${t('fl_' + k)}</div>`).join('')}</div>`;
  };
  const orderCard = (o, extra = '') => `<div class="card ocard"><div class="ohead"><b>${esc(o.no)}</b><span class="pill ${STATUS_CLS[o.status]}">${t('st_' + o.status)}</span></div>
      <div class="hint" style="font-size:12px;margin-top:2px">${fmtDate(o.created_at)}${o.paid ? t('paidTag') : ''}</div>
      ${timeline(o)}${o.items.map((i) => `<div class="oline"><span>${esc(i.title)}${i.color ? ` · ${esc(colorName(i.color))}` : ''} × ${i.qty}</span><b class="num">${money(i.price * i.qty)}</b></div>`).join('')}
      ${o.discount ? `<div class="oline disc"><span>${t('promoDiscount', esc(o.promo || ''))}</span><b class="num">−${money(o.discount)}</b></div>` : ''}
      <div class="oline" style="border-top:1px dashed var(--line);margin-top:6px;padding-top:10px"><span>${o.fee ? t('totalFee', money(o.fee)) : t('total')}</span><b class="num">${money(o.total)}</b></div>${extra}</div>`;

  route(/^\/done\/(\d+)$/, (m) => {
    const o = SS.get('last');
    if (!o || o.id !== Number(m[1])) { location.hash = '#/orders'; return { title: '', html: '', tab: 'orders' }; }
    const tr = o.transfer ? `<div class="card ocard"><h3 style="font-size:17px">${t('cardTransfer')}</h3><div class="copy"><code>${esc(o.transfer.card)}</code><button class="btn sm ghost" data-copy="${esc(o.transfer.card)}">${t('copy')}</button></div>
        ${o.transfer.owner ? `<div class="oline"><span>${t('owner')}</span><b>${esc(o.transfer.owner)}</b></div>` : ''}<div class="oline"><span>${t('amount')}</span><b class="num">${money(o.total)}</b></div>
        <p class="hint" style="margin:8px 0 0;font-size:13px">${t('receiptHint', esc(o.no))}</p></div>` : '';
    const pay = o.payment === 'online' && !o.paid ? `<button class="btn block ok" style="margin-top:12px" data-pay="${o.id}">${t('payNow')}</button>` : '';
    return {
      title: t('acceptedTitle'), tab: 'orders', noTabs: true,
      html: `<div class="ok-wrap"><div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div><svg class="check" viewBox="0 0 120 120" fill="none" stroke="#12a66b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="60" r="54"/><path d="m36 62 17 17 31-36"/></svg>
        <div class="hint">${t('orderNo')}</div><div class="ok-no num">${esc(o.no)}</div><div class="hint">${t('acceptedText')}</div></div>
        ${orderCard(o, pay)}${tr}
        <div style="display:grid;gap:10px;margin-top:16px"><a class="btn block" href="#/orders">${t('myOrders')}</a><a class="btn block ghost" href="#/shop">${t('keepShopping')}</a></div>`,
    };
  });

  route(/^\/orders$/, () => ({
    title: t('orders'), tab: 'orders',
    html: `<div id="olist">${[1, 2].map(() => '<div class="skel" style="height:150px;margin-top:12px"></div>').join('')}</div>
      <section class="sec"><div class="sec-h"><h2>${t('trackTitle')}</h2></div><form id="trk" class="card"><label class="fld"><span>${t('orderNum')}</span><input id="tno" placeholder="BC-1001" autocomplete="off"></label>
        <label class="fld"><span>${t('phone')}</span><input id="tph" type="tel" placeholder="90 123 45 67"></label><button class="btn block">${t('check')}</button><div id="tres"></div></form></section>`,
    async mount() {
      const box = $('#olist');
      if (!inTg) box.innerHTML = `<div class="empty"><div class="em">📦</div><b>${t('ordersHere')}</b>${t('ordersHereHint')}</div>`;
      else try {
        const { orders, reviewed } = await api('orders');
        const extra = (o) => {
          let h = o.payment === 'online' && !o.paid && o.status !== 'cancelled' ? `<button class="btn block ok" style="margin-top:12px" data-pay="${o.id}">${t('pay')}</button>` : '';
          if (o.status === 'delivered') {
            const todo = o.items.filter((i) => !reviewed.includes(`${o.id}:${i.id}`));
            if (todo.length) h += `<div class="rlinks">${todo.map((i) => `<a class="btn sm ghost" href="#/p/${i.id}?review=1">${t('rateBtn')} · ${esc(i.title)}</a>`).join('')}</div>`;
          }
          return h;
        };
        box.innerHTML = orders.length ? orders.map((o) => orderCard(o, extra(o))).join('')
          : `<div class="empty"><div class="em">📦</div><b>${t('noOrders')}</b>${t('noOrdersHint')}<div style="margin-top:18px"><a class="btn" href="#/shop">${t('toCatalog')}</a></div></div>`;
      } catch (e) { box.innerHTML = `<div class="alert">${esc(e.message)}</div>`; }
      $('#trk').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        try {
          const { order } = await api('track?no=' + encodeURIComponent($('#tno').value) + '&phone=' + encodeURIComponent($('#tph').value));
          $('#tres').innerHTML = order ? orderCard(order) : `<div class="alert">${t('trackNone')}</div>`;
        } catch (e) { $('#tres').innerHTML = `<div class="alert">${esc(e.message)}</div>`; }
      });
    },
  }));

  route(/^\/info$/, () => {
    const s = S.data.settings, tel = s.phone.replace(/[^\d+]/g, ''), faq = (ru() && S.data.faq_ru && S.data.faq_ru.length ? S.data.faq_ru : S.data.faq);
    return {
      title: t('info'), tab: 'info',
      html: `<div class="links"><a class="lnk" href="tel:${esc(tel)}"><i>📞</i>${esc(s.phone)}</a><a class="lnk" href="https://t.me/${esc(s.telegram)}"><i>💬</i>@${esc(s.telegram)}</a>
          <a class="lnk" href="${esc(s.channel)}"><i>📣</i>${t('tgChannel')}</a><a class="lnk" href="${esc(s.instagram)}"><i>📷</i>Instagram</a></div>
        <section class="sec"><div class="sec-h"><h2>${t('faq')}</h2></div>${faq.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
        <section class="sec"><div class="sec-h"><h2>${t('writeUs')}</h2></div><form id="msg" class="card"><label class="fld"><span>${t('yourName')}</span><input id="mn" autocomplete="name"></label>
          <label class="fld"><span>${t('phone')}</span><input id="mp" type="tel" placeholder="90 123 45 67"></label><label class="fld"><span>${t('message')}</span><textarea id="mt" rows="3"></textarea></label>
          <button class="btn block">${t('send')}</button><div id="mres"></div></form></section>`,
      mount() {
        $('#mn').value = S.me.name || ''; $('#mp').value = S.me.phone || '';
        $('#msg').addEventListener('submit', async (ev) => {
          ev.preventDefault();
          try { await api('message', { name: $('#mn').value, phone: $('#mp').value, message: $('#mt').value }); $('#mt').value = ''; toast(t('msgSent')); haptic('ok'); $('#mres').innerHTML = ''; }
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

  function setLang(lang) {
    S.lang = lang; LS.set('lang', lang); document.documentElement.lang = lang;
    if (inTg) api('lang', { lang }).catch(() => {});
    render(); haptic('medium');
  }

  // ---------- hodisalar ----------
  document.addEventListener('click', async (e) => {
    const tt = e.target;
    const fav = tt.closest('[data-fav]');
    if (fav) {
      e.stopPropagation(); e.preventDefault();
      const id = Number(fav.dataset.fav), i = S.favs.indexOf(id);
      i >= 0 ? S.favs.splice(i, 1) : S.favs.push(id); LS.set('favs', S.favs); haptic('light');
      $$(`[data-fav="${id}"]`).forEach((b) => { b.classList.toggle('on', i < 0); if (i < 0) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 600); } });
      if (S.shop.fav && /^#\/shop/.test(location.hash)) render();
      return;
    }
    if (tt.closest('[data-theme-toggle]')) { LS.set('theme', currentTheme() === 'dark' ? 'light' : 'dark'); applyTheme(true); haptic('medium'); return; }
    if (tt.closest('[data-lang-toggle]')) { setLang(ru() ? 'uz' : 'ru'); return; }
    const sh = tt.closest('[data-share]');
    if (sh) {
      const p = prod(Number(sh.dataset.share)), bot = S.data.settings.botUsername; if (!p || !bot) return;
      const link = `https://t.me/${bot}?start=p_${p.id}`, url = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`${pname(p)}: ${money(p.price)}`);
      if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank');
      return;
    }
    const sc = tt.closest('[data-scroll]');
    if (sc) { e.preventDefault(); const el = $(sc.dataset.scroll); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const qa = tt.closest('[data-quick]');
    if (qa) {
      e.stopPropagation(); e.preventDefault();
      const p = prod(Number(qa.dataset.quick)), color = p && p.colors[0] ? p.colors[0].name : '';
      if (p && addToCart(p.id, color, 1, qa.closest('.pcard') && $('.media', qa.closest('.pcard')))) { const html = qa.innerHTML; qa.classList.add('ok'); qa.innerHTML = svg('check'); toast(t('addedItem', `${pname(p)}${color ? ` (${colorName(color)})` : ''}`)); setTimeout(() => { qa.classList.remove('ok'); qa.innerHTML = html; }, 900); }
      return;
    }
    const back = tt.closest('[data-back]'); if (back) return goBack(/^#\/p\//.test(location.hash) ? S.lastList : '#/');
    const go = tt.closest('[data-go]'); if (go) { location.hash = go.dataset.go; return; }
    const cq = tt.closest('[data-cq]');
    if (cq) {
      const [i, d] = cq.dataset.cq.split(':').map(Number), l = S.cart[i], p = l && prod(l.id);
      if (!l || !p) return;
      if (d > 0 && l.qty + 1 > p.stock) { toast(t('onlyN', p.stock), true); return; }
      l.qty += d; if (l.qty <= 0) S.cart.splice(i, 1); saveCart(); haptic('light'); render(); return;
    }
    const cd = tt.closest('[data-cdel]'); if (cd) { S.cart.splice(Number(cd.dataset.cdel), 1); saveCart(); haptic('light'); render(); return; }
    if (tt.closest('[data-clear]')) { S.cart = []; saveCart(); render(); return; }
    const cp = tt.closest('[data-copy]');
    if (cp) { try { await navigator.clipboard.writeText(cp.dataset.copy); toast(t('copied')); } catch { toast(cp.dataset.copy); } return; }
    const pay = tt.closest('[data-pay]');
    if (pay) {
      try {
        const { invoice_url } = await api('pay', { id: Number(pay.dataset.pay) });
        if (tg && tg.openInvoice) tg.openInvoice(invoice_url, (s) => { if (s === 'paid') { toast(t('paidOk')); haptic('ok'); setTimeout(render, 600); } });
        else location.href = invoice_url;
      } catch (err) { toast(err.message, true); }
      return;
    }
    // tashqi havolalar Telegram ichida ochiladi
    const a = tt.closest('a[href]');
    if (a && tg && /^https?:\/\//.test(a.href) && new URL(a.href).origin !== location.origin) {
      e.preventDefault();
      /^https:\/\/t\.me\//.test(a.href) ? tg.openTelegramLink(a.href) : tg.openLink(a.href);
    }
  });

  // ---------- Telegram va ishga tushirish ----------
  const themePref = () => LS.get('theme', null);
  const currentTheme = () => themePref() || (tg && tg.colorScheme ? (tg.colorScheme === 'dark' ? 'dark' : 'light') : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function applyTheme(animate) {
    const root = document.documentElement;
    if (animate === true) { root.classList.add('theming'); setTimeout(() => root.classList.remove('theming'), 600); }
    root.dataset.theme = currentTheme();
    const cs = getComputedStyle(root), bg = cs.getPropertyValue('--bg').trim();
    try { if (tg) { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); tg.setBottomBarColor && tg.setBottomBarColor(cs.getPropertyValue('--card').trim()); } } catch { /* eski versiya */ }
    const m = $('meta[name=theme-color]'); if (m) m.content = bg;
  }
  if (tg) {
    try { tg.ready(); tg.expand(); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); tg.onEvent('themeChanged', () => { if (!themePref()) applyTheme(true); }); if (tg.BackButton) tg.BackButton.onClick(() => goBack('#/')); } catch { /* */ }
  }
  applyTheme();
  document.documentElement.lang = S.lang;
  // t.me/<bot>/<app>?startapp=p_<id> havolasi: to'g'ridan-to'g'ri mahsulotga
  try {
    const sp = tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param, mm = /^p_(\d+)$/.exec(sp || '');
    if (mm && !location.hash) location.hash = '#/p/' + mm[1];
  } catch { /* */ }

  async function load(silent) {
    let data = null, err = null;
    for (let i = 0; i < 3 && !data; i++) { // vaqtinchalik uzilishlarda 3 marta urinadi
      try { data = await api('catalog'); } catch (e) { err = e; if (i < 2) await new Promise((r) => setTimeout(r, 600 * (i + 1))); }
    }
    if (data) LS.set('catalog', data);
    else {
      data = LS.get('catalog', null); // internet bo'lmasa oxirgi ko'rilgan katalog
      if (!data) throw err;
      if (!silent) toast(t('staleCache'), true);
    }
    S.data = data;
    S.cart = S.cart.filter((l) => data.products.some((p) => p.id === l.id));
    if (!silent) render(); else drawTabs();
  }
  $('#view').innerHTML = '<div class="skel" style="height:220px;border-radius:26px"></div><div class="grid" style="margin-top:16px">' + '<div class="skel" style="height:210px"></div>'.repeat(4) + '</div>';
  let retries = 0;
  function start() {
    load().catch((e) => {
      const auto = retries++ < 6; // 6 marta har 4 soniyada o'zi qayta urinadi
      $('#view').innerHTML = `<div class="empty"><div class="em">📡</div><b>${t('loadFail')}</b>${esc(e.message)}${auto ? `<br><small>${t('autoRetry')}</small>` : ''}<div style="margin-top:18px"><button class="btn" id="retryBtn">${t('retry')}</button></div></div>`;
      $('#retryBtn').onclick = () => { retries = 0; start(); };
      if (auto) setTimeout(() => { if ($('#retryBtn')) start(); }, 4000);
    });
  }
  start();
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.data && /^#\/(p|cart|checkout)/.test(location.hash) === false) load(true).catch(() => {}); });
})();
