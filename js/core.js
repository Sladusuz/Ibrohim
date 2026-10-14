/*
 * BabyCheer yadro: har bir sahifada ishlaydigan umumiy qism.
 * navigatsiya, footer, savat, qidiruv, tema, silliq skroll, animatsiya dvigateli, sahifalararo o'tish.
 */
(function () {
  'use strict';
  const { api, util } = window.BC;
  const { money, esc, normPhone } = util;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bc3_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bc3_' + k, JSON.stringify(v)); } catch { /* xotira yo'q */ } },
  };
  const sess = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* */ } }, del: (k) => { try { sessionStorage.removeItem(k); } catch { /* */ } } };

  const CAT_STYLE = { elektromobil: ['#2b59ff', 'car'], kalyaska: ['#14b8a6', 'stroller'], velokalyaska: ['#f59e0b', 'trike'], mototsikl: ['#ef4444', 'moto'], samokat: ['#8b5cf6', 'scooter'] };
  const PALETTE = ['#2b59ff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9'];
  const ARTS = ['car', 'stroller', 'trike', 'moto', 'scooter'];
  const D = { categories: [], products: [], settings: {} };
  const I = {
    arr: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.500-4.600-9.500-9.200C1 8.300 3.200 4.500 7 4.500c2 0 3.500 1.100 5 3 1.500-1.900 3-3 5-3 3.800 0 6 3.800 4.500 7.300C19.500 16.400 12 21 12 21z" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.500"/><path d="m20 20-3.800-3.800"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.200 11.500H6.200z"/><path d="M9 8V6.500a3 3 0 0 1 6 0V8"/></svg>',
    moon: '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z"/></svg>',
    sun: '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600 7 7M17 17l1.400 1.400M5.600 18.400 7 17M17 7l1.400-1.400"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.900 4.200 18.700 19.300c-.2 1-.9 1.300-1.700.8l-4.800-3.600-2.300 2.300c-.3.300-.5.500-1 .5l.4-4.900 8.900-8c.4-.3-.1-.5-.6-.2L6.600 13 1.900 11.500c-1-.3-1-1 .2-1.500L20.400 2.900c.8-.3 1.600.2 1.500 1.300z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r="1" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.300 1.800.6 2.800.7a2 2 0 0 1 1.700 2z"/></svg>',
  };
  const catStyle = (c, i = 0) => { const s = CAT_STYLE[c?.slug]; return { color: s ? s[0] : PALETTE[i % PALETTE.length], art: s ? s[1] : ARTS[i % ARTS.length] }; };
  const catOf = (p) => D.categories.find((c) => c.id === p.category_id);
  const artType = (p) => catStyle(catOf(p), D.categories.indexOf(catOf(p))).art;
  const prodById = (id) => D.products.find((p) => p.id === id);
  const pColor = (p) => (p.colors && p.colors[0] && p.colors[0].hex) || p.color || '#2b59ff';
  const priceTxt = (n) => (n > 0 ? money(n) : "Narxni so'rang");
  const prodUrl = (id) => 'product.html?id=' + encodeURIComponent(id);
  const media = (p, color) => (p.images && p.images[0] ? `<img src="${esc(p.images[0])}" alt="${esc(p.title)}" loading="lazy" decoding="async" data-fb="${artType(p)}" data-fc="${color || pColor(p)}" onerror="BC.core.imgFail(this)">` : BC.art(artType(p), color || pColor(p)));
  const imgFail = (el) => { el.onerror = null; const w = document.createElement('div'); w.innerHTML = BC.art(el.dataset.fb || 'car', el.dataset.fc); const a = w.firstChild; el.closest('.pc')?.classList.remove('photo'); el.replaceWith(a); };
  const tgLink = (text) => `https://t.me/${(D.settings.telegram || 'babycheer_admin').replace('@', '')}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  /* ====================== toast ====================== */
  function toast(msg, err) { const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg; $('#toasts').append(t); setTimeout(() => t.remove(), 3300); }

  /* ====================== silliq skroll ====================== */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  }
  const scrollTo = (t, o = {}) => {
    if (lenis) return lenis.scrollTo(t, { immediate: !!o.immediate, offset: o.offset ?? -96, duration: 1.3 });
    const y = typeof t === 'number' ? t : t.getBoundingClientRect().top + scrollY + (o.offset ?? -96); window.scrollTo({ top: y, behavior: o.immediate ? 'auto' : 'smooth' });
  };
  const lock = (on) => { if (lenis) (on ? lenis.stop() : lenis.start()); document.documentElement.style.overflow = on && !lenis ? 'hidden' : ''; };

  /* ====================== ma'lumot (kesh bilan) ====================== */
  async function loadData() {
    let cached = null; try { cached = JSON.parse(sess.get('bc3_cat') || 'null'); } catch { /* */ }
    const fresh = () => api.catalog().then((c) => { Object.assign(D, c); sess.set('bc3_cat', JSON.stringify({ t: Date.now(), c })); return c; });
    if (api.mode === 'live' && cached && Date.now() - cached.t < 20000) { Object.assign(D, cached.c); fresh().catch(() => {}); return; }
    await fresh();
  }

  /* ====================== savat ====================== */
  const cart = {
    items: store.get('cart', []),
    save() { store.set('cart', this.items); updateBadge(); },
    key: (i) => i.id + '|' + (i.color || ''),
    lines() { return this.items.map((i) => ({ ...i, p: prodById(i.id) })).filter((l) => l.p); },
    count() { return this.lines().reduce((s, l) => s + l.qty, 0); },
    qtyOf(id) { return this.items.filter((i) => i.id === id).reduce((s, i) => s + i.qty, 0); },
    totals(delivery = 'courier') {
      const sub = this.lines().reduce((s, l) => s + l.p.price * l.qty, 0), free = D.settings.freeFrom ?? 1000000;
      const fee = delivery === 'courier' && sub && sub < free ? D.settings.deliveryFee ?? 40000 : 0; return { sub, fee, total: sub + fee, free };
    },
    add(id, color, qty = 1) {
      const p = prodById(id); if (!p) return false;
      if (this.qtyOf(id) + qty > p.stock) { toast(p.stock ? `Omborda faqat ${p.stock} ta qolgan` : "Bu mahsulot hozir sotuvda yo'q", true); return false; }
      const ex = this.items.find((i) => i.id === id && (i.color || '') === (color || '')); ex ? (ex.qty += qty) : this.items.push({ id, color: color || '', qty }); this.save(); return true;
    },
    setQty(key, qty) {
      const it = this.items.find((i) => this.key(i) === key); if (!it) return; const p = prodById(it.id);
      const others = this.qtyOf(it.id) - it.qty; if (qty > p.stock - others) { toast(`Omborda faqat ${p.stock} ta qolgan`, true); return; }
      it.qty = qty; if (it.qty <= 0) this.items = this.items.filter((i) => i !== it); this.save();
    },
    remove(key) { this.items = this.items.filter((i) => this.key(i) !== key); this.save(); },
    clear() { this.items = []; this.save(); },
  };
  function updateBadge() { const el = $('#cartCount'); if (!el) return; const n = cart.count(); el.hidden = !n; el.textContent = n; }
  const favs = { ids: new Set(store.get('favs', [])), has(id) { return this.ids.has(id); }, toggle(id) { this.ids.has(id) ? this.ids.delete(id) : this.ids.add(id); store.set('favs', [...this.ids]); return this.ids.has(id); } };
  const colorName = (p, hex) => ((p.colors || []).find((c) => c.hex === hex) || {}).name || '';

  function addToCart(id, opts = {}) {
    const p = prodById(id); if (!p) return;
    const color = opts.color ?? (p.colors && p.colors[0] ? p.colors[0].name : '');
    if (!cart.add(id, color, opts.qty || 1)) return;
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    if (opts.from && !reduce) fly(opts.from, p, opts.hex);
    toast(`Savatga qo'shildi: ${p.title}`); if ($('#drawer').classList.contains('on')) renderDrawer();
  }
  function fly(from, p, hex) {
    const a = from.getBoundingClientRect(), b = $('#cartBtn').getBoundingClientRect(), d = document.createElement('div'); d.className = 'fly'; d.innerHTML = media(p, hex); document.body.append(d);
    const sx = a.left + a.width / 2 - 32, sy = a.top + a.height / 2 - 32, ex = b.left + b.width / 2 - 32, ey = b.top + b.height / 2 - 32;
    d.animate([{ transform: `translate(${sx}px,${sy}px) scale(1)`, opacity: 1 }, { transform: `translate(${(sx + ex) / 2}px,${Math.min(sy, ey) - 140}px) scale(1.15) rotate(-10deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(${ex}px,${ey}px) scale(.2) rotate(-20deg)`, opacity: 0.2 }], { duration: 900, easing: 'cubic-bezier(.45,0,.25,1)' }).onfinish = () => d.remove();
  }

  /* ====================== mahsulot kartochkasi ====================== */
  function productCard(p) {
    const c = pColor(p), sale = p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0, cat = catOf(p), photo = !!(p.images && p.images[0]);
    const stock = p.stock <= 0 ? '<span class="pc-stock out">Sotuvda yo\'q</span>' : p.stock <= 3 ? `<span class="pc-stock low">Oxirgi ${p.stock} ta</span>` : '<span class="pc-stock">Mavjud</span>';
    const cols = (p.colors || []).slice(0, 4), more = (p.colors || []).length - cols.length;
    return `<article class="pc ${photo ? 'photo' : ''}" data-tilt data-r style="--c:${c}">
      <div class="pc-media">${sale ? `<span class="tag sale">-${sale}%</span>` : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}<div class="pc-art">${media(p)}</div><a class="pc-link" href="${prodUrl(p.id)}" aria-label="${esc(p.title)}"></a>
        <button class="pc-fav ${favs.has(p.id) ? 'on' : ''}" data-fav="${esc(p.id)}" aria-label="Sevimlilarga qo'shish">${I.heart}</button>
        <div class="pc-quick"><button class="btn sm block" data-add="${esc(p.id)}" ${p.stock <= 0 ? 'disabled' : ''}>Savatga qo'shish</button></div></div>
      <div class="pc-body"><div class="pc-top"><span class="pc-cat">${esc(cat?.name || '')}</span>${stock}</div>
        <h3><a href="${prodUrl(p.id)}">${esc(p.title)}</a></h3><p class="pc-short">${esc(p.short || '')}</p>
        <div class="pc-foot"><div class="price num">${priceTxt(p.price)}${sale ? `<s>${money(p.old_price)}</s>` : ''}</div>${cols.length > 1 ? `<div class="dots" style="--c:${c}">${cols.map((x) => `<i style="--c:${x.hex}" title="${esc(x.name)}"></i>`).join('')}${more > 0 ? `<em>+${more}</em>` : ''}</div>` : ''}</div></div></article>`;
  }

  /* ====================== navigatsiya va footer ====================== */
  const NAV = [['index.html', 'Bosh sahifa', 'home'], ['shop.html', 'Katalog', 'shop'], ['about.html', 'Biz haqimizda', 'about'], ['contact.html', "Bog'lanish", 'contact']];
  function buildChrome(page) {
    const s = D.settings, nav = document.createElement('header'); nav.className = 'nav'; nav.id = 'nav';
    nav.innerHTML = `<a class="logo" href="index.html" aria-label="BabyCheer bosh sahifa"><img src="img/logo.png" alt="" width="42" height="42"><span>Baby<b>Cheer</b></span></a>
      <nav class="nav-links" id="navLinks" aria-label="Asosiy">${NAV.map(([h, l, k]) => `<a href="${h}" class="${page === k || (page === 'product' && k === 'shop') ? 'on' : ''}">${l}</a>`).join('')}<i class="nav-pill" id="navPill"></i></nav>
      <div class="nav-act"><button class="ib" id="searchBtn" aria-label="Qidirish (/)">${I.search}</button><button class="ib" id="themeBtn" aria-label="Rejimni almashtirish">${I.moon}${I.sun}</button>
        <button class="ib cart-ib" id="cartBtn" aria-label="Savat">${I.bag}<span class="count num" id="cartCount" hidden>0</span></button>
        <a class="btn sm" href="${tgLink()}" target="_blank" rel="noopener">Telegram</a><button class="ib burger" id="burger" aria-label="Menyu" aria-expanded="false"><span></span><span></span></button></div>`;
    document.body.prepend(nav);
    const menu = document.createElement('div'); menu.className = 'menu'; menu.id = 'menu'; menu.setAttribute('aria-hidden', 'true');
    menu.innerHTML = `<nav>${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav><div class="mc"><span class="num">${esc(s.phone || '')}</span><span>@${esc((s.telegram || '').replace('@', ''))}</span></div>`; document.body.append(menu);
    const prog = document.createElement('div'); prog.className = 'progress'; prog.id = 'progress'; document.body.prepend(prog);
    const extra = document.createElement('div');
    extra.innerHTML = `<div class="sov" id="sov" aria-hidden="true"><div class="wrap sov-in"><div class="sov-top"><span>Qidiruv</span><button class="ib" id="sovClose" aria-label="Yopish">✕</button></div><input id="sovInput" type="search" placeholder="Nima qidiryapsiz?" autocomplete="off" aria-label="Qidiruv so'zi"><div class="sov-res" id="sovRes"></div></div></div>
      <div class="scrim" id="scrim"></div><aside class="drawer" id="drawer" aria-label="Savat" aria-hidden="true"></aside><div id="toasts" aria-live="polite"></div>
      <button class="totop" id="totop" aria-label="Yuqoriga"><svg viewBox="0 0 54 54"><circle class="bg" cx="27" cy="27" r="24"/><circle class="fg" id="totopFg" cx="27" cy="27" r="24" stroke-dasharray="151" stroke-dashoffset="151"/></svg><svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>`;
    while (extra.firstChild) document.body.append(extra.firstChild);
    const f = document.createElement('footer'); f.className = 'footer';
    f.innerHTML = `<div class="wrap"><div class="f-top"><div><a class="logo" href="index.html"><img src="img/logo.png" alt="" width="42" height="42"><span>Baby<b>Cheer</b></span></a><p>Bolalar uchun tanlab olingan mobil texnika: elektromobil, kalyaska, velokalyaska, mototsikl va samokat. Sifat, kafolat va tez yetkazib berish.</p>
      <div class="social"><a href="${esc(s.channel || '#')}" target="_blank" rel="noopener" aria-label="Telegram guruh">${I.tg}</a><a href="${esc(s.instagram || '#')}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><a href="tel:${esc((s.phone || '').replace(/\s/g, ''))}" aria-label="Qo'ng'iroq">${I.phone}</a></div></div>
      <div><h4>Do'kon</h4><a class="l" href="shop.html">Barcha mahsulotlar</a>${D.categories.slice(0, 4).map((c) => `<a class="l" href="shop.html?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}<a class="l" href="order.html">Buyurtmani kuzatish</a></div>
      <div><h4>Kompaniya</h4><a class="l" href="about.html">Biz haqimizda</a><a class="l" href="contact.html">Bog'lanish</a><a class="l num" href="tel:${esc((s.phone || '').replace(/\s/g, ''))}">${esc(s.phone || '')}</a><a class="l" href="${tgLink()}" target="_blank" rel="noopener">@${esc((s.telegram || '').replace('@', ''))}</a></div></div></div>
      <div class="f-word" aria-hidden="true">BabyCheer</div><div class="f-bot"><div class="wrap"><span>© ${new Date().getFullYear()} BabyCheer. Barcha huquqlar himoyalangan.</span><span>${api.mode === 'demo' ? "Demo rejim: ma'lumotlar shu brauzerda saqlanadi" : 'Narx va mavjudlik buyurtma vaqtida tasdiqlanadi'}</span></div></div>`;
    document.body.append(f);
  }

  /* ====================== savat paneli ====================== */
  function openDrawer() { renderDrawer(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); lock(true); }
  function closeAll() { ['#drawer', '#scrim', '#sov', '#menu'].forEach((s) => $(s)?.classList.remove('on')); $('#drawer')?.setAttribute('aria-hidden', 'true'); $('#burger')?.setAttribute('aria-expanded', 'false'); lock(false); document.dispatchEvent(new Event('bc:closeall')); }
  function renderDrawer() {
    const L = cart.lines(), T = cart.totals(), left = Math.max(T.free - T.sub, 0), n = cart.count();
    $('#drawer').innerHTML = `<div class="dh"><h2>Savat<sup class="num">${n}</sup></h2><button class="ib" data-close aria-label="Yopish">✕</button></div>` + (L.length ? `
      <div class="dl" data-lenis-prevent>${L.map((l, i) => { const p = l.p, hex = (p.colors || []).find((c) => c.name === l.color)?.hex || pColor(p), k = cart.key(l);
        return `<div class="ci" style="--c:${hex};animation-delay:${i * 60}ms"><a class="th" href="${prodUrl(p.id)}">${media(p, hex)}</a><div><h4>${esc(p.title)}</h4>${l.color ? `<div class="meta"><i class="dot" style="--c:${hex}"></i>${esc(l.color)}</div>` : ''}
          <div class="r"><div class="mini"><button data-dec="${esc(k)}" aria-label="Kamaytirish">−</button><span class="num">${l.qty}</span><button data-inc="${esc(k)}" aria-label="Ko'paytirish">+</button></div><b class="num">${priceTxt(p.price * l.qty)}</b></div><button class="rm" data-rm="${esc(k)}">O'chirish</button></div></div>`; }).join('')}</div>
      <div class="df"><div class="fbar"><i style="width:${clamp(T.sub / T.free, 0, 1) * 100}%"></i></div><p class="fnote">${left ? `Bepul yetkazib berishgacha yana <b class="num">${money(left)}</b>` : 'Yetkazib berish sizga bepul'}</p>
        <div class="row2 t"><span>Jami</span><span class="num">${money(T.sub)}</span></div><a class="btn block" href="checkout.html">Rasmiylashtirish ${I.arr}</a></div>`
      : `<div class="dl"><div class="dempty">${BC.art('stroller', '#2b59ff')}<p>Savatingiz hozircha bo'sh.<br>Yoqqan modelni qo'shing.</p><a class="btn" href="shop.html">Katalogga o'tish ${I.arr}</a></div></div>`);
  }

  /* ====================== qidiruv oynasi ====================== */
  function openSearch() { $('#sov').classList.add('on'); $('#sov').setAttribute('aria-hidden', 'false'); $('#sov').setAttribute('data-lenis-prevent', ''); lock(true); setTimeout(() => $('#sovInput').focus(), 80); drawSearch(''); }
  function drawSearch(q) {
    q = q.trim().toLowerCase();
    const list = (q ? D.products.filter((p) => (p.title + ' ' + p.brand + ' ' + (catOf(p)?.name || '')).toLowerCase().includes(q)) : D.products.filter((p) => p.featured)).slice(0, 7);
    $('#sovRes').innerHTML = (q ? '' : '<p class="fnote" style="margin:0 0 6px 8px">Ommabop modellar</p>') + (list.length ? list.map((p) => `<a class="sr-i" href="${prodUrl(p.id)}" style="--c:${pColor(p)}"><div class="th">${media(p)}</div><div><b>${esc(p.title)}</b><small>${esc(catOf(p)?.name || '')}</small></div><span class="price num">${priceTxt(p.price)}</span></a>`).join('') : '<p class="fnote" style="padding:24px 8px">Hech narsa topilmadi. Boshqa so\'z bilan urinib ko\'ring.</p>')
      + (q ? `<a class="link" style="margin:22px 8px" href="shop.html?q=${encodeURIComponent(q)}">Katalogda barcha natijalar ${I.arr}</a>` : '');
  }

  /* ====================== animatsiya dvigateli ====================== */
  const REV = { up: [{ opacity: 0, transform: 'translateY(46px)' }, { opacity: 1, transform: 'none' }], fade: [{ opacity: 0 }, { opacity: 1 }], scale: [{ opacity: 0, transform: 'scale(.92) translateY(30px)' }, { opacity: 1, transform: 'none' }], left: [{ opacity: 0, transform: 'translateX(-50px)' }, { opacity: 1, transform: 'none' }], right: [{ opacity: 0, transform: 'translateX(50px)' }, { opacity: 1, transform: 'none' }] };
  const seen = new WeakSet();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; const el = e.target; io.unobserve(el); el.classList.add('in');
    if (el.dataset.count !== undefined) countUp(el);
    if (el.hasAttribute('data-split')) splitIn(el);
    else if (el.hasAttribute('data-r') && !reduce) el.animate(REV[el.dataset.r] || REV.up, { duration: 1000, delay: +(el.dataset.d || 0), easing: 'cubic-bezier(.22,.9,.24,1)', fill: 'backwards' });
  }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }) : null;
  function splitWords(el) {
    if (el.dataset.splitDone) return; el.dataset.splitDone = '1';
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) { const frag = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach((t) => { if (!t) return; if (/^\s+$/.test(t)) frag.append(' '); else { const w = document.createElement('span'); w.className = 'w'; w.innerHTML = '<span>' + esc(t) + '</span>'; frag.append(w); } }); n.replaceWith(frag); } else if (n.nodeType === 1) walk(n);
    }); walk(el);
  }
  function splitIn(el) { splitWords(el); if (reduce) return; $$('.w > span', el).forEach((s, i) => s.animate([{ transform: 'translateY(112%) rotate(4deg)' }, { transform: 'none' }], { duration: 1000, delay: i * 55 + +(el.dataset.d || 0), easing: 'cubic-bezier(.22,.9,.24,1)', fill: 'backwards' })); }
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '', f = (v) => (dec ? v.toFixed(dec) : util.num(v)) + suf;
    if (reduce) { el.textContent = f(to); return; } const t0 = performance.now();
    (function tick(t) { const k = clamp((t - t0) / 2000, 0, 1); el.textContent = f(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); })(t0);
  }
  // Ekrandan chiqqan bo'limlarning cheksiz animatsiyalarini to'xtatish (tezlik uchun)
  const pauseIO = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('off', !e.isIntersecting)), { rootMargin: '80px 0px' }) : null;
  const paused = new WeakSet();
  function observe(scope = document) {
    if (pauseIO) $$('.hero,.cta,.band,.marquee,.emblem,.feat,.story-card,.photo-card,.proc', scope).forEach((el) => { if (!paused.has(el)) { paused.add(el); pauseIO.observe(el); } });
    $$('[data-r],[data-count],[data-in],[data-split]', scope).forEach((el, i) => {
      if (seen.has(el)) return; seen.add(el); if (el.hasAttribute('data-r') && el.dataset.d === undefined) { const sib = [...(el.parentElement?.children || [])].filter((x) => x.hasAttribute('data-r')); el.dataset.d = String(Math.min(sib.indexOf(el), 6) * 80); }
      if (el.hasAttribute('data-split')) splitWords(el); io ? io.observe(el) : (el.dataset.count !== undefined && countUp(el));
    });
    if (fine && !reduce) {
      $$('[data-mag]', scope).forEach((b) => { if (b._m) return; b._m = 1; b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; }); b.addEventListener('pointerleave', () => { b.style.transform = ''; }); });
    }
  }
  if (fine && !reduce) {
    let pe = null, raf = 0;
    const run = () => {
      raf = 0; const e = pe; if (!e) return; const tg = e.target;
      const t = tg.closest?.('[data-tilt]'); if (t) {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; t.style.setProperty('--mx', x * 100 + '%'); t.style.setProperty('--my', y * 100 + '%');
        const amt = +(t.dataset.tilt || 5); t.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * amt}deg) rotateY(${(x - 0.5) * amt * 1.3}deg) translateY(-4px)`;
      }
      const b = tg.closest?.('.btn'); if (b) { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', e.clientX - r.left + 'px'); b.style.setProperty('--my', e.clientY - r.top + 'px'); }
    };
    document.addEventListener('pointermove', (e) => { pe = e; if (!raf) raf = requestAnimationFrame(run); }, { passive: true });
    document.addEventListener('pointerout', (e) => { const t = e.target.closest?.('[data-tilt]'); if (t && !t.contains(e.relatedTarget)) t.style.transform = ''; });
  }

  /* ====================== skroll effektlari ====================== */
  let lastY = 0, vel = 0, ticking = false, pxEls = null, mqEl = null, mqAnim = null, mqT = 0; const nav = () => $('#nav');
  function tick() {
    ticking = false; const y = scrollY, dy = y - lastY; lastY = y; vel = vel * 0.8 + dy * 0.2;
    const max = document.documentElement.scrollHeight - innerHeight || 1, k = clamp(y / max, 0, 1);
    const pr = $('#progress'); if (pr) pr.style.transform = `scaleX(${k})`;
    const n = nav(); if (n) { n.classList.toggle('hide', y > 500 && dy > 6 && !$('#menu').classList.contains('on')); if (dy < -6 || y < 200) n.classList.remove('hide'); }
    const t = $('#totop'); if (t) { t.classList.toggle('on', y > 700); const f = $('#totopFg'); if (f) f.style.strokeDashoffset = 151 * (1 - k); }
    if (!reduce) {
      if (mqEl === null) mqEl = $('.marquee .track') || false;
      if (mqEl && y < 2400) { if (!mqAnim) mqAnim = mqEl.getAnimations()[0]; if (mqAnim) mqAnim.playbackRate = 1 + clamp(Math.abs(vel) * 0.3, 0, 6); }
      if (pxEls === null) pxEls = $$('[data-px]');
      pxEls.forEach((el) => { const r = el.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return; el.style.transform = `translate3d(0,${((r.top + r.height / 2 - innerHeight / 2) * -parseFloat(el.dataset.px)).toFixed(1)}px,0)`; });
    }
    document.dispatchEvent(new CustomEvent('bc:scroll', { detail: { y, dy, vel } }));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }

  /* ====================== sahifalararo o'tish (parda) ====================== */
  const curtain = () => $('#curtain');
  function leave(href) {
    const c = curtain(); if (!c || reduce) { location.href = href; return; }
    c.className = 'curtain simple idle'; void c.offsetWidth; c.className = 'curtain simple cover'; sess.set('bc_nav', '1');
    setTimeout(() => { location.href = href; }, 520);
  }
  function revealPage(minMs) {
    const c = curtain(); if (!c) return Promise.resolve();
    return new Promise((res) => setTimeout(() => { c.classList.remove('cover', 'idle'); c.classList.add('up'); sess.del('bc_nav'); setTimeout(() => { c.remove(); res(); }, 900); }, minMs));
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const h = a.getAttribute('href'); if (!h || a.target === '_blank' || a.hasAttribute('download') || /^(#|mailto:|tel:|https?:|javascript:)/i.test(h)) return;
    if (!/\.html(\?|#|$)/.test(h) && !/^\/?$/.test(h)) return; e.preventDefault(); closeAll(); leave(h);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) { const c = document.getElementById('curtain'); if (c) c.remove(); sess.del('bc_nav'); } });

  /* ====================== umumiy bosishlar ====================== */
  document.addEventListener('click', (e) => {
    const t = (s) => e.target.closest(s);
    if (t('[data-close]')) closeAll();
    const add = t('[data-add]'); if (add) { e.preventDefault(); addToCart(add.dataset.add, { from: add.closest('.pc')?.querySelector('.pc-art') || add }); return; }
    const fav = t('[data-fav]'); if (fav) { e.preventDefault(); const on = favs.toggle(fav.dataset.fav); $$(`[data-fav="${CSS.escape(fav.dataset.fav)}"]`).forEach((b) => b.classList.toggle('on', on)); toast(on ? "Sevimlilarga qo'shildi" : 'Sevimlilardan olib tashlandi'); document.dispatchEvent(new CustomEvent('bc:fav')); return; }
    const inc = t('[data-inc]'); if (inc) { const l = cart.items.find((i) => cart.key(i) === inc.dataset.inc); l && cart.setQty(inc.dataset.inc, l.qty + 1); renderDrawer(); document.dispatchEvent(new Event('bc:cart')); return; }
    const dec = t('[data-dec]'); if (dec) { const l = cart.items.find((i) => cart.key(i) === dec.dataset.dec); l && cart.setQty(dec.dataset.dec, l.qty - 1); renderDrawer(); document.dispatchEvent(new Event('bc:cart')); return; }
    const rm = t('[data-rm]'); if (rm) { cart.remove(rm.dataset.rm); renderDrawer(); document.dispatchEvent(new Event('bc:cart')); return; }
    const cp = t('[data-copy]'); if (cp) { const v = cp.dataset.copy; (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Nusxalandi: ' + v), () => toast(v)); return; }
  });

  function wire(page) {
    $('#cartBtn').onclick = openDrawer; $('#scrim').onclick = closeAll; $('#searchBtn').onclick = openSearch; $('#sovClose').onclick = closeAll;
    $('#totop').onclick = () => scrollTo(0, { offset: 0 });
    $('#burger').onclick = () => { const on = !$('#menu').classList.contains('on'); $('#menu').classList.toggle('on', on); $('#burger').setAttribute('aria-expanded', on); $('#menu').setAttribute('aria-hidden', !on); lock(on); };
    $('#themeBtn').onclick = () => { const r = document.documentElement, dark = r.dataset.theme === 'dark' || (!r.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); r.dataset.theme = dark ? 'light' : 'dark'; store.set('theme', r.dataset.theme); };
    $('#sovInput').addEventListener('input', (e) => drawSearch(e.target.value));
    $('#sovInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.value.trim()) leave('shop.html?q=' + encodeURIComponent(e.target.value.trim())); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll(); const typing = /input|textarea|select/i.test(document.activeElement?.tagName || '');
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openSearch(); }
    });
    // nav pill
    const links = $('#navLinks'), pill = $('#navPill'), on = () => $('a.on', links);
    const move = (a) => { if (!a) { pill.style.opacity = 0; return; } pill.style.opacity = 1; pill.style.left = a.offsetLeft + 'px'; pill.style.width = a.offsetWidth + 'px'; };
    $$('a', links).forEach((a) => a.addEventListener('pointerenter', () => move(a))); links.addEventListener('pointerleave', () => move(on()));
    requestAnimationFrame(() => move(on())); addEventListener('resize', () => move(on()));
    addEventListener('scroll', onScroll, { passive: true }); tick();
  }

  /* ====================== ishga tushirish ====================== */
  let readyRes; const ready = new Promise((r) => { readyRes = r; });
  async function init(page) {
    const intro = !sess.get('bc_seen'), t0 = performance.now();
    const c = curtain();
    let barTimer = null; const bar = c && $('.bar i', c);
    if (c && bar) { let w = 8; barTimer = setInterval(() => { w = Math.min(w + 4 + Math.random() * 9, 90); bar.style.width = w + '%'; }, 90); }
    try { await loadData(); }
    catch (err) {
      clearInterval(barTimer); const m = $('main'); if (c) { c.classList.remove('cover', 'idle'); c.classList.add('up'); }
      if (m) m.innerHTML = `<div class="wrap page"><div class="empty"><h3>Ma'lumotlarni yuklab bo'lmadi</h3><p>${esc(err.message || '')}</p><button class="btn" onclick="location.reload()">Qayta urinish</button></div></div>`; return;
    }
    cart.items = cart.items.filter((i) => prodById(i.id)); store.set('cart', cart.items);
    buildChrome(page); updateBadge(); wire(page); observe(document);
    document.dispatchEvent(new Event('bc:data')); readyRes(D);
    const wait = intro ? Math.max(0, 1500 - (performance.now() - t0)) : 120; if (bar) bar.style.width = '100%'; clearInterval(barTimer);
    sess.set('bc_seen', '1'); await revealPage(reduce ? 0 : wait);
    document.dispatchEvent(new Event('bc:shown'));
  }

  window.BC.core = { imgFail, init, ready, data: D, cart, favs, toast, scrollTo, lock, observe, productCard, media, artType, catOf, catStyle, pColor, priceTxt, prodUrl, prodById, tgLink, colorName, addToCart, openDrawer, closeAll, leave, I, reduce, fine, clamp, store, onScroll: () => tick(), lenis: () => lenis, esc, money, normPhone };
})();
