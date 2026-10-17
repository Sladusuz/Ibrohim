'use strict';
// Sayt dvigateli: yadro (mavzular, savat, oynalar, formalar, effektlar).
// Bo'limlar (hero, products, gallery...) sections.js da ro'yxatdan o'tadi.
(function () {
  const E = (window.E = { sections: {}, actions: {}, changes: {}, inputs: {}, hooks: {}, order: [] });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const text = (v) => esc(v == null ? '' : v);
  const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ');
  const imgUrl = (u) => (/^(https?:\/\/|\/(?!\/)|data:image\/(png|jpeg|webp|gif|svg\+xml)[;,])/i.test(String(u || '')) ? String(u) : '');
  const linkUrl = (u) => { u = String(u || '').trim(); return /^(#|\/(?!\/)|https?:\/\/|tel:|mailto:)/i.test(u) ? u : ''; };
  const icon = (n) => (window.svgIcon ? window.svgIcon(n) : '');
  const isPreview = new URLSearchParams(location.search).has('preview');
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };
  Object.assign(E, { $, $$, esc, text, money, imgUrl, linkUrl, icon, isPreview, store });

  /* ---------- Ro'yxatlar (editor ham foydalanadi) ---------- */
  E.themes = {
    dark: { label: "Qorong'i neon", dark: true, sw: ['#0a0f1e', '#22d3ee'] },
    light: { label: "Yorug' indigo", dark: false, sw: ['#eceefb', '#4f46e5'] },
    warm: { label: 'Issiq amber', dark: true, sw: ['#1d130d', '#ff8a3d'] },
    minimal: { label: 'Minimal oq-qora', dark: false, sw: ['#ffffff', '#111111'] },
    fresh: { label: 'Yangi yashil', dark: false, sw: ['#f4f8f1', '#16a34a'] },
    rose: { label: 'Nafis atirgul', dark: false, sw: ['#fdf4f5', '#d6457a'] },
    gold: { label: 'Premium oltin', dark: true, sw: ['#0d0c0a', '#d4a64a'] },
    ocean: { label: 'Dengiz ko\'k', dark: false, sw: ['#f0f7fc', '#0b78d1'] },
  };
  E.fonts = { modern: 'Zamonaviy', display: "Ko'rkam (sarlavha)", luxe: 'Hashamatli (nafis serif)', wide: 'Keng (zamonaviy)', editorial: 'Klassik (serif)', geometric: 'Geometrik', soft: 'Yumshoq', mono: 'Texnik' };
  E.looks = { classic: 'Klassik (sodda)', cinema: 'Kinematik (animatsiyali)', luxe: 'Hashamatli (nafis)' };
  E.radii = { sharp: 'Qirrali', soft: 'Yumshoq', round: 'Yumaloq' };
  E.navStyles = { pill: 'Suzuvchi', bar: 'Klassik panel', minimal: 'Minimal' };
  E.bgs = { full: "To'liq (animatsiyali)", aurora: 'Yumshoq nur', plain: 'Sodda' };

  /* ---------- Holat ---------- */
  let S = null, cart = {}, itemMap = {}, timers = [], observers = [];
  const mouse = { x: -999, y: -999 };
  E.state = () => S;

  E.normalize = function (d) {
    d = d && typeof d === 'object' ? d : {};
    d.company = Object.assign({ name: 'Sayt', logo: '' }, d.company);
    d.theme = Object.assign({ preset: 'dark', accent: '', accent2: '', font: 'modern', radius: 'soft', bg: 'full', heads: 'left', switcher: false, look: 'classic', motion: true }, d.theme);
    d.nav = Object.assign({ style: 'pill', cta: '', ctaLink: '#', search: false }, d.nav);
    d.announce = Object.assign({ enabled: false, text: '', link: '' }, d.announce);
    d.orders = Object.assign({ enabled: true, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 }, d.orders);
    d.account = Object.assign({ enabled: false, requireOrder: true, requireBooking: false }, d.account);
    d.contacts = d.contacts || {};
    d.footer = Object.assign({ text: '', links: [] }, d.footer);
    d.sections = (Array.isArray(d.sections) ? d.sections : []).filter((s) => s && typeof s === 'object' && s.type);
    return d;
  };
  const on = (sec) => sec.enabled !== false;
  const cur = () => (S.orders && S.orders.currency) || '';
  E.fmt = (n) => `${money(n)}${cur() ? ' ' + esc(cur()) : ''}`;
  E.cur = cur;

  /* ---------- Mavzu ---------- */
  const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function applyTheme() {
    const root = document.documentElement, t = S.theme;
    const saved = isPreview ? null : store.get('theme');
    const preset = t.switcher && E.themes[saved] ? saved : t.preset;
    root.dataset.site = E.themes[preset] ? preset : 'dark';
    const hex = /^#[0-9a-f]{6}$/i;
    for (const [k, v] of [['--acc', t.accent], ['--acc2', t.accent2]]) { if (hex.test(v || '')) root.style.setProperty(k, v); else root.style.removeProperty(k); }
    if (hex.test(t.accent || '') && !hex.test(t.accent2 || '')) root.style.setProperty('--acc2', t.accent);
    if (hex.test(t.accent || '')) root.style.setProperty('--on', lum(t.accent) > 0.58 ? '#0b1220' : '#ffffff'); else root.style.removeProperty('--on');
    const look = E.looks[t.look] ? t.look : 'classic', mo = t.motion !== false;
    let seen = false; try { seen = sessionStorage.getItem('intro') === '1'; } catch { /* ignore */ }
    const intro = !isPreview && mo && look !== 'classic' && !seen && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.className = `font-${E.fonts[t.font] ? t.font : 'modern'} rad-${E.radii[t.radius] ? t.radius : 'soft'} bg-${E.bgs[t.bg] ? t.bg : 'full'} heads-${t.heads === 'center' ? 'center' : 'left'} look-${look}${mo ? ' mo-on' : ''}${intro ? ' intro-on' : ''}${isPreview ? ' preview' : ''}`;
    if (intro) setTimeout(() => root.classList.remove('intro-on'), 3200);
  }
  function setMeta() {
    document.title = S.company.name || 'Sayt';
    const m = $('meta[name=description]');
    const hero = S.sections.find((s) => s.type === 'hero');
    if (m) m.content = (hero && hero.text) || S.company.tagline || '';
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#4f46e5';
    const letter = esc((S.company.logo || (S.company.name || 'S')[0] || 'S').slice(0, 2));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='${acc}'/><text x='32' y='44' font-size='34' font-weight='800' text-anchor='middle' fill='#fff' font-family='Arial'>${letter}</text></svg>`;
    let l = $('link[rel=icon]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  /* ---------- Savat ---------- */
  function collectItems() {
    itemMap = {};
    for (const sec of S.sections) {
      if (!on(sec) || !['products', 'menu'].includes(sec.type) || (sec.mode || 'cart') !== 'cart') continue;
      for (const p of sec.items || []) if (p && p.id && p.active !== false) itemMap[p.id] = { p, sec };
    }
  }
  E.cartable = () => S.orders.enabled && Object.keys(itemMap).length > 0;
  E.item = (id) => itemMap[id] && itemMap[id].p;
  function loadCart() {
    try { cart = JSON.parse(store.get('cart') || '{}') || {}; } catch { cart = {}; }
    for (const id of Object.keys(cart)) { const q = parseInt(cart[id], 10); if (!itemMap[id] || !(q > 0)) delete cart[id]; else cart[id] = Math.min(99, q); }
  }
  const saveCart = () => store.set('cart', JSON.stringify(cart));
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartLines = () => Object.keys(cart).filter((id) => itemMap[id]).map((id) => ({ p: itemMap[id].p, qty: cart[id] }));
  const subtotal = () => cartLines().reduce((a, i) => a + (Number(i.p.price) || 0) * i.qty, 0);
  function shipping() {
    const o = S.orders, sub = subtotal();
    if (!o.deliveryFee) return 0;
    return o.freeShipFrom && sub >= o.freeShipFrom ? 0 : Number(o.deliveryFee) || 0;
  }
  E.cartLines = cartLines; E.subtotal = subtotal;
  E.maxQty = (p) => (p.stock === '' || p.stock == null || Number(p.stock) < 0 ? 99 : Math.max(0, Math.min(99, Number(p.stock))));
  E.addToCart = function (id, qty = 1) {
    const it = E.item(id); if (!it) return false;
    const max = E.maxQty(it);
    if (max <= 0) { E.toast('Afsuski, mahsulot tugagan'); return false; }
    const q = Math.min(max, (cart[id] || 0) + qty);
    if (q === (cart[id] || 0)) { E.toast(`Omborda faqat ${max} dona bor`); return false; }
    cart[id] = q; saveCart(); renderCart(); return true;
  };
  function renderCart() {
    const n = $('#cartN'); if (n) { n.textContent = cartCount() || ''; n.dataset.v = cartCount(); }
    const list = $('#cartList'); if (list) {
      const lines = cartLines();
      list.innerHTML = lines.length ? lines.map(({ p, qty }) => `<div class="it"><div class="th">${imgUrl(p.image) ? `<img src="${esc(imgUrl(p.image))}" alt="">` : `<div class="ph">${text((p.name || '?')[0])}</div>`}</div>
        <div><b>${text(p.name)}</b><small>${p.price > 0 ? E.fmt(p.price) : 'Narxi kelishiladi'}</small><div class="qty"><button data-act="dec" data-id="${esc(p.id)}" aria-label="Kamaytirish">−</button><span>${qty}</span><button data-act="inc" data-id="${esc(p.id)}" aria-label="Ko'paytirish">+</button></div></div>
        <button class="rm" data-act="rm" data-id="${esc(p.id)}" aria-label="O'chirish">${icon('x')}</button></div>`).join('') : `<div class="cempty">${icon('cart')}<p>Savat bo'sh</p><span>Mahsulotlarni tanlab, savatga qo'shing.</span></div>`;
      const foot = $('#cartFoot'), sub = subtotal(), ship = shipping(), o = S.orders;
      let prog = '';
      if (lines.length && o.deliveryFee && o.freeShipFrom) {
        const left = Math.max(0, o.freeShipFrom - sub), pct = Math.min(100, Math.round((sub / o.freeShipFrom) * 100));
        prog = `<div class="ship"><span>${left > 0 ? `Bepul yetkazib berishgacha yana <b>${E.fmt(left)}</b>` : '<b>Bepul yetkazib berish!</b>'}</span><div class="bar"><i style="width:${pct}%"></i></div></div>`;
      }
      foot.innerHTML = lines.length ? `${prog}<div class="tl"><span>Mahsulotlar</span><span>${E.fmt(sub)}</span></div>${o.deliveryFee ? `<div class="tl"><span>Yetkazib berish</span><span>${ship ? E.fmt(ship) : 'Bepul'}</span></div>` : ''}<div class="tl big"><span>Jami</span><span>${E.fmt(sub + ship)}</span></div><button class="btn full" data-act="checkout">Buyurtmani rasmiylashtirish ${icon('arrow')}</button>` : '';
    }
    $$('[data-cartsum]').forEach((el) => {
      const lines = cartLines(), sub = subtotal(), ship = shipping();
      el.innerHTML = lines.length ? `<div class="sum"><b>Savatda:</b> ${lines.map((i) => `${text(i.p.name)} ×${i.qty}`).join(', ')}<div class="sumt">Jami: <b>${E.fmt(sub + ship)}</b>${ship ? ` <small>(yetkazib berish ${E.fmt(ship)})</small>` : ''} · <a data-act="cart-open">o'zgartirish</a></div></div>` : '<div class="sum">Savat bo\'sh. Mahsulotni tanlab, savatga qo\'shing yoki xabar qoldiring.</div>';
    });
  }
  E.renderCart = renderCart;

  /* ---------- Oyna va xabar ---------- */
  E.openModal = function (html, cls) {
    const m = $('#modal'); if (!m) return;
    m.className = 'modal open ' + (cls || '');
    m.innerHTML = `<div class="mback" data-act="close"></div><div class="mbox" role="dialog" aria-modal="true">${html}<button class="mclose" data-act="close" aria-label="Yopish">${icon('x')}</button></div>`;
    document.body.classList.add('noscroll');
    const f = $('.mbox [data-focus]', m) || $('.mclose', m); if (f) f.focus({ preventScroll: true });
  };
  E.closeModal = function () { const m = $('#modal'); if (!m) return; m.className = 'modal'; m.innerHTML = ''; document.body.classList.remove('noscroll'); E.modalKey = null; };
  E.toast = function (msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(E.toast.t); E.toast.t = setTimeout(() => t.classList.remove('show'), 2200);
  };
  const openCart = (v) => { $('#drawer')?.classList.toggle('open', v); $('#shade')?.classList.toggle('open', v); document.body.classList.toggle('noscroll', v); };

  /* ---------- Yordamchi: bo'lim qobig'i va sarlavha ---------- */
  E.wrap = (sec, inner, cls) => `<section class="sec s-${esc(sec.type)} ${cls || ''}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap">${inner}</div></section>`;
  E.rich = (v) => text(v).replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  E.head = (sec, extra) => (sec.title || sec.eyebrow || sec.text) ? `<div class="sh rv">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}${sec.title ? `<h2>${E.rich(sec.title)}</h2>` : ''}${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}${extra || ''}</div>` : '';
  E.price = (p) => {
    const price = Number(p.price) || 0, old = Number(p.oldPrice) || 0;
    if (!price) return '<span class="amount na">Narxi kelishiladi</span>';
    const off = old > price ? Math.round((1 - price / old) * 100) : 0;
    return `<span class="amount">${E.fmt(price)}</span>${old > price ? `<span class="oldrow"><s class="old">${E.fmt(old)}</s><span class="off">−${off}%</span></span>` : ''}`;
  };
  E.img = (u, alt, cls) => (imgUrl(u) ? `<img class="${cls || ''}" src="${esc(imgUrl(u))}" alt="${esc(alt || '')}" loading="lazy">` : '');
  E.initial = (n) => text((String(n || '?').trim()[0] || '?').toUpperCase());

  /* ---------- Chrome: e'lon, menyu, pastki qism ---------- */
  function announceHtml() {
    const a = S.announce; if (!a.enabled || !a.text) return '';
    const l = linkUrl(a.link);
    return `<div class="announce">${l ? `<a href="${esc(l)}">${text(a.text)} ${icon('arrow')}</a>` : `<span>${text(a.text)}</span>`}</div>`;
  }
  const accOn = () => !!(S && S.account && S.account.enabled && window.Auth && window.Auth.enabled && !isPreview);
  function accountBtn() {
    if (!accOn()) return '';
    const u = window.Auth.user();
    return u ? `<a class="btn sm ghost acc" href="/kabinet.html" title="Mening kabinetim">${icon('user')}<span>${text(String(u.name).split(' ')[0])}</span></a>` : `<button class="btn sm ghost acc" data-act="login">${icon('user')}<span>Kirish</span></button>`;
  }
  const needAuth = (kind) => accOn() && !window.Auth.user() && (((kind === 'order' || kind === 'brief') && S.account.requireOrder !== false) || (kind === 'booking' && S.account.requireBooking));
  function fillUser() {
    const u = accOn() && window.Auth.user(); if (!u) return;
    $$('form[data-kind]').forEach((f) => { if (f.elements.name && !f.elements.name.value) f.elements.name.value = u.name || ''; if (f.elements.phone && !f.elements.phone.value) f.elements.phone.value = u.phone || ''; });
  }
  E.account = { on: accOn, needAuth, fill: fillUser };
  function refreshNav() { const n = $('#nav'); if (!n || !S) return; const was = n.classList.contains('scrolled'); n.outerHTML = navHtml(); if (was) $('#nav').classList.add('scrolled'); renderCart(); fillUser(); }
  function navHtml() {
    const links = S.sections.filter((s) => on(s) && s.navLabel).slice(0, 7).map((s) => `<a href="#${esc(s.id)}">${text(s.navLabel)}</a>`);
    const hasShop = S.sections.some((s) => on(s) && s.type === 'products');
    const search = S.nav.search && hasShop ? `<label class="nsearch">${icon('search')}<input id="navSearch" data-inp="navsearch" type="search" placeholder="Mahsulot qidirish…" autocomplete="off"></label>` : '';
    const cartBtn = E.cartable() ? `<button class="icon-btn" data-act="cart-open" aria-label="Savat">${icon('cart')}<span class="n" id="cartN" data-v="${cartCount()}">${cartCount() || ''}</span></button>` : '';
    const acc = accountBtn();
    const cta = S.nav.cta ? `<a class="btn sm" href="${esc(linkUrl(S.nav.ctaLink) || '#')}">${text(S.nav.cta)}</a>` : '';
    const logo = S.company.logoImage && imgUrl(S.company.logoImage) ? `<img class="mimg" src="${esc(imgUrl(S.company.logoImage))}" alt="">` : `<span class="mark">${text((S.company.logo || (S.company.name || 'S')[0]).slice(0, 2))}</span>`;
    return `<header class="nav nav-${esc(S.nav.style)}" id="nav"><a class="logo" href="#top">${logo}<span class="lname">${text(S.company.name)}</span></a>
      <nav class="links" id="links">${links.join('')}</nav>
      <div class="nav-r">${search}${cartBtn}${acc}${cta}<button class="icon-btn burger" data-act="burger" aria-label="Menyu">${icon('menu')}</button></div></header>`;
  }
  function footerHtml() {
    const c = S.contacts, f = S.footer;
    const links = (f.links || []).filter((l) => l && l.label && linkUrl(l.url));
    const soc = [];
    if (c.telegram) { const u = String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); soc.push(`<a href="https://t.me/${esc(u)}" target="_blank" rel="noopener" aria-label="Telegram">${icon('send')}</a>`); }
    if (c.instagram) { const u = String(c.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, ''); soc.push(`<a href="https://instagram.com/${esc(u)}" target="_blank" rel="noopener" aria-label="Instagram">${icon('insta')}</a>`); }
    if (c.email) soc.push(`<a href="mailto:${esc(c.email)}" aria-label="Email">${icon('mail')}</a>`);
    if (c.phone) soc.push(`<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}" aria-label="Telefon">${icon('tel')}</a>`);
    return `<footer><div class="wrap fgrid"><div class="fbrand"><a class="logo" href="#top"><span class="mark">${text((S.company.logo || (S.company.name || 'S')[0]).slice(0, 2))}</span><span class="lname">${text(S.company.name)}</span></a>${S.company.tagline ? `<p>${text(S.company.tagline)}</p>` : ''}</div>
      ${links.length ? `<div class="flinks">${links.map((l) => `<a href="${esc(linkUrl(l.url))}">${text(l.label)}</a>`).join('')}</div>` : ''}
      ${soc.length ? `<div class="fsoc">${soc.join('')}</div>` : ''}</div>
      <div class="fmark" aria-hidden="true">${text(S.company.name)}</div><div class="wrap fcopy"><span>© ${new Date().getFullYear()} ${text(S.company.name)}. ${text(f.text)}</span></div></footer>`;
  }
  function chromeEnd() {
    const drawer = E.cartable() ? `<div class="shade" id="shade" data-act="cart-close"></div><aside class="drawer" id="drawer" aria-label="Savat"><div class="dh"><h3>Savat</h3><button class="icon-btn" data-act="cart-close" aria-label="Yopish">${icon('x')}</button></div><div class="items" id="cartList"></div><div id="cartFoot"></div></aside>` : '';
    const sw = S.theme.switcher ? `<div class="sw">${Object.keys(E.themes).slice(0, 3).map((k) => `<button data-act="theme" data-t="${k}" class="${k === document.documentElement.dataset.site ? 'on' : ''}">${text(E.themes[k].label.split(' ')[0])}</button>`).join('')}</div>` : '';
    return `${drawer}<div class="modal" id="modal"></div><div class="toast" id="toast" role="status"></div>${sw}`;
  }

  /* ---------- Asosiy render ---------- */
  E.render = function (data) {
    S = E.normalize(JSON.parse(JSON.stringify(data)));
    S.sections.forEach((s, i) => { if (!s.id) s.id = `${s.type}-${i}`; });
    collectItems(); loadCart(); applyTheme(); setMeta();
    const body = S.sections.filter(on).map((sec) => { const def = E.sections[sec.type]; if (!def) return ''; try { return def.render(sec, S); } catch (e) { console.error('section', sec.type, e); return ''; } }).join('');
    $('#app').innerHTML = `${announceHtml()}${navHtml()}<main id="top">${body}</main>${footerHtml()}${chromeEnd()}`;
    $('#app').dataset.nav = S.nav.style;
    document.body.classList.toggle('has-announce', !!$('.announce'));
    renderCart(); initEffects(); fillUser(); if (E.hooks.afterRender) E.hooks.afterRender();
  };

  /* ---------- Formalar ---------- */
  E.prefill = function (msg) {
    const f = $('#contactForm'); if (!f) return false;
    const ta = f.querySelector('[name=message]'); if (ta && msg) { ta.value = msg; ta.dispatchEvent(new Event('input')); }
    f.closest('section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => (f.querySelector('[name=name]') || f).focus({ preventScroll: true }), 500);
    return true;
  };
  const KIND_TITLE = { booking: 'Yangi ariza: ', order: 'Yangi buyurtma: ', brief: "Yangi loyiha so'rovi: ", message: 'Yangi xabar: ' };
  // Pochta orqali yuborish (server bo'lmaganda zaxira yo'l)
  E.mailto = function (payload) {
    const email = (S.contacts && S.contacts.email) || '';
    if (!email) throw new Error("Xabar yuborilmadi. Iltimos, telefon orqali bog'laning.");
    const L = [`Ism: ${payload.name}`, `Telefon: ${payload.phone}`, ...Object.entries(payload.extra || {}).map(([k, v]) => `${k}: ${v}`)];
    if ((payload.items || []).length) L.push('Buyurtma: ' + payload.items.map((i) => `${i.name} x${i.qty}`).join(', '), `Jami: ${money(payload.items.reduce((a, i) => a + i.price * i.qty, 0) + (payload.shipping || 0))} ${cur()}`);
    if (payload.message) L.push('', payload.message);
    location.href = `mailto:${email}?subject=${encodeURIComponent((KIND_TITLE[payload.type] || KIND_TITLE.message) + payload.name)}&body=${encodeURIComponent(L.join('\n'))}`;
  };
  // Serverga yuborish; server bo'lmasa pochtaga o'tadi. Natija: {ok, id} yoki {mail:true}
  E.send = async function (payload) {
    const embedded = !!window.__SITE__;
    const API = String(window.__API__ || '').replace(/\/$/, '');
    const viaServer = !!(window.Auth && window.Auth.enabled);
    if (embedded && !API && !viaServer) { E.mailto(payload); return { mail: true }; }
    try {
      let j;
      if (viaServer) j = await window.Auth.request('/api/order', { method: 'POST', body: payload });
      else {
        const r = await fetch(API + '/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        j = await r.json().catch(() => ({}));
        if (!r.ok) { const er = new Error(j.error || "Xatolik yuz berdi. Qayta urinib ko'ring."); er.status = r.status; throw er; }
      }
      return { ok: true, id: j.id };
    } catch (e) {
      if (e.status) throw e;
      if (embedded) { E.mailto(payload); return { mail: true }; }
      throw e;
    }
  };

  async function submitForm(form) {
    const msg = $('.fmsg', form), btn = form.querySelector('button[type=submit]');
    // Savat bo'sh bo'lsa, buyurtma formasi oddiy xabar sifatida yuboriladi
    const kind = form.dataset.kind === 'order' && !cartLines().length ? 'message' : form.dataset.kind;
    const val = (n) => ((form.elements[n] && form.elements[n].value) || '').trim();
    msg.className = 'fmsg';
    const name = val('name'), phone = val('phone');
    if (name.length < 2) { msg.className = 'fmsg bad'; msg.textContent = 'Ismingizni kiriting'; form.elements.name.focus(); return; }
    if (!/^[+\d][\d\s()\-]{6,}$/.test(phone)) { msg.className = 'fmsg bad'; msg.textContent = "Telefon raqamini to'g'ri kiriting (masalan, +998 90 123 45 67)"; form.elements.phone.focus(); return; }
    const extra = {};
    $$('[data-label]', form).forEach((el) => { const v = (el.value || '').trim(); if (v && el.name && !el.closest('[hidden]')) extra[el.dataset.label] = v; });
    const addr = form.querySelector('[data-addr]');
    if (kind === 'order' && addr && !addr.hidden && !val('address')) { msg.className = 'fmsg bad'; msg.textContent = 'Yetkazib berish manzilini kiriting'; form.elements.address.focus(); return; }
    const items = kind === 'order' ? cartLines().map((i) => ({ id: i.p.id, name: i.p.name, price: Number(i.p.price) || 0, qty: i.qty })) : [];
    const payload = { type: kind, name, phone, message: val('message'), items, extra, shipping: kind === 'order' ? shipping() : 0 };
    if (isPreview) { msg.textContent = "Ko'rinish rejimi: xabar yuborilmaydi."; return; }
    if (needAuth(kind)) {
      window.Auth.modal({ title: kind === 'order' ? 'Buyurtma berish uchun kiring' : 'Yozilish uchun kiring', text: "Hisobingiz bo'lmasa, ro'yxatdan o'ting. Buyurtmalaringiz hisobingizda saqlanadi." }).then((u) => { if (u) { fillUser(); submitForm(form); } });
      return;
    }
    btn.disabled = true;
    const done = () => {
      if (kind === 'order') { cart = {}; saveCart(); renderCart(); }
      const box = form.parentElement; box.innerHTML = `<div class="ok"><div class="tick">${icon('check')}</div><h3>${kind === 'booking' ? "Arizangiz qabul qilindi" : kind === 'order' ? 'Buyurtmangiz qabul qilindi' : 'Xabaringiz yuborildi'}</h3><p class="sub">Tez orada siz bilan bog'lanamiz.</p></div>`;
    };
    try {
      const r = await E.send(payload);
      if (r.mail) { msg.textContent = "Pochta ilovangiz ochiladi. Xabarni yuborishni unutmang yoki qo'ng'iroq qiling."; btn.disabled = false; } else done();
    } catch (e) {
      if (e.status === 401 && accOn()) { btn.disabled = false; window.Auth.modal({ title: 'Hisobingizga kiring', text: "Buyurtma uchun hisob kerak. Kiring yoki ro'yxatdan o'ting." }).then((u) => { if (u) { fillUser(); submitForm(form); } }); return; }
      msg.className = 'fmsg bad'; msg.textContent = e.message; btn.disabled = false;
    }
  }

  /* ---------- Effektlar ---------- */
  function initEffects() {
    timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = [];
    observers.forEach((o) => o.disconnect()); observers = [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$('.rv').forEach((e) => (isPreview ? e.classList.add('in') : io.observe(e))); observers.push(io);
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const t = +e.target.dataset.count || 0, suf = e.target.dataset.suf || '', s = performance.now();
      (function f(n) { const p = Math.min(1, (n - s) / 1600); e.target.textContent = Math.round(t * (1 - Math.pow(1 - p, 4))).toLocaleString('ru-RU').replace(/ /g, ' ') + suf; if (p < 1) requestAnimationFrame(f); })(s);
    }), { threshold: 0.6 });
    $$('[data-count]').forEach((e) => co.observe(e)); observers.push(co);
    const tw = $('#tw'); const words = tw ? (tw.dataset.words || '').split('|').filter(Boolean) : [];
    if (tw && words.length) {
      if (isPreview) tw.textContent = words[0]; else {
        let wi = 0, ci = 0, del = false;
        (function tick() { const w = words[wi % words.length]; tw.textContent = w.slice(0, ci);
          if (!del && ci === w.length) { del = true; timers.push(setTimeout(tick, 1600)); return; }
          if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
          ci += del ? -1 : 1; timers.push(setTimeout(tick, del ? 45 : 95)); })();
      }
    }
    $$('[data-until]').forEach((el) => {
      const end = Date.parse(el.dataset.until); if (!(end > 0)) { el.hidden = true; return; }
      const pad = (n) => String(n).padStart(2, '0');
      const tick = () => { let d = Math.max(0, end - Date.now()); const days = Math.floor(d / 864e5); d -= days * 864e5; const h = Math.floor(d / 36e5); d -= h * 36e5; const m = Math.floor(d / 6e4); const s = Math.floor((d - m * 6e4) / 1e3);
        el.innerHTML = `<div><b>${days}</b><span>kun</span></div><div><b>${pad(h)}</b><span>soat</span></div><div><b>${pad(m)}</b><span>daqiqa</span></div><div><b>${pad(s)}</b><span>soniya</span></div>`; };
      tick(); timers.push(setInterval(tick, 1000));
    });
    $$('.tilt').forEach((v) => { const w = v.firstElementChild; if (!w) return; v.addEventListener('pointermove', (e) => { const r = v.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; w.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg)`; }); v.addEventListener('pointerleave', () => (w.style.transform = '')); });
    onScroll();
  }
  function onScroll() {
    const h = document.body.scrollHeight - innerHeight; const p = $('#prog'); if (p) p.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    const n = $('#nav'); if (n) n.classList.toggle('scrolled', scrollY > 24);
  }

  /* ---------- Hodisalar (bir marta ulanadi) ---------- */
  E.actions['close'] = () => E.closeModal();
  E.actions['cart-open'] = () => openCart(true);
  E.actions['cart-close'] = () => openCart(false);
  E.actions['add'] = (el) => { if (E.addToCart(el.dataset.id)) { const old = el.innerHTML; el.innerHTML = icon('check') + ' Qo\'shildi'; el.classList.add('added'); setTimeout(() => { el.innerHTML = old; el.classList.remove('added'); }, 1200); E.toast('Savatga qo\'shildi'); } };
  E.actions['inc'] = (el) => { E.addToCart(el.dataset.id); };
  E.actions['dec'] = (el) => { const id = el.dataset.id; if ((cart[id] || 0) <= 1) delete cart[id]; else cart[id]--; saveCart(); renderCart(); };
  E.actions['rm'] = (el) => { delete cart[el.dataset.id]; saveCart(); renderCart(); };
  E.actions['checkout'] = () => {
    openCart(false); const f = $('#contactForm'); if (!f) { E.toast('Buyurtma formasi yoqilmagan'); return; }
    if (f.dataset.kind !== 'order') { const L = cartLines(); E.prefill('Buyurtma: ' + L.map((i) => `${i.p.name} x${i.qty}`).join(', ') + ` (jami ${E.fmt(subtotal() + shipping())})`.replace(/<[^>]*>/g, '')); return; }
    f.closest('section').scrollIntoView({ behavior: 'smooth' });
  };
  E.actions['burger'] = () => $('#links').classList.toggle('open');
  E.actions['theme'] = (el) => { store.set('theme', el.dataset.t); document.documentElement.dataset.site = el.dataset.t; $$('.sw button').forEach((b) => b.classList.toggle('on', b === el)); };
  E.actions['login'] = () => { window.Auth.modal({}); };
  E.actions['prefill'] = (el) => { E.closeModal(); E.prefill(el.dataset.msg || ''); };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && E.actions[el.dataset.act]) { if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault(); E.actions[el.dataset.act](el, e); return; }
    const bo = e.target.closest('a[href="#brief-open"]'); if (bo && E.actions['brief-open']) { e.preventDefault(); $('#links') && $('#links').classList.remove('open'); E.actions['brief-open'](bo, e); return; }
    const a = e.target.closest('#links a'); if (a) $('#links').classList.remove('open');
  });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-chg]'); if (el && E.changes[el.dataset.chg]) E.changes[el.dataset.chg](el, e); });
  document.addEventListener('input', (e) => { const el = e.target.closest('[data-inp]'); if (el && E.inputs[el.dataset.inp]) E.inputs[el.dataset.inp](el, e); });
  document.addEventListener('submit', (e) => { if (e.target.matches('form[data-kind]')) { e.preventDefault(); submitForm(e.target); } });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if ($('#modal.open')) E.closeModal(); else openCart(false); }
    if (E.modalKey && $('#modal.open')) E.modalKey(e);
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointermove', (e) => { const g = $('#glow'); if (g) { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; } mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }
    const b = e.target.closest && e.target.closest('.mag'); if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px,${(e.clientY - r.top - r.height / 2) * 0.24}px)`; }
  });
  document.addEventListener('pointerout', (e) => { const b = e.target.closest && e.target.closest('.mag'); if (b) b.style.transform = ''; });

  /* ---------- Fon: harakatlanuvchi tarmoq ---------- */
  function startNetwork() {
    const cv = $('#bg'); if (!cv) return; const cx = cv.getContext('2d'); let P = [];
    const size = () => { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); P = Array.from({ length: Math.min(80, Math.floor(innerWidth / 16)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 })); };
    addEventListener('resize', size); size();
    (function draw() {
      if (document.documentElement.classList.contains('bg-full')) {
        cx.clearRect(0, 0, innerWidth, innerHeight);
        const col = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#22d3ee'; cx.fillStyle = col; cx.strokeStyle = col;
        for (const p of P) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > innerWidth) p.vx *= -1; if (p.y < 0 || p.y > innerHeight) p.vy *= -1; const dx = mouse.x - p.x, dy = mouse.y - p.y; if (Math.hypot(dx, dy) < 160) { p.x -= dx * 0.004; p.y -= dy * 0.004; } cx.globalAlpha = 0.7; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 7); cx.fill(); }
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y); if (d < 130) { cx.globalAlpha = (1 - d / 130) * 0.22; cx.beginPath(); cx.moveTo(P[i].x, P[i].y); cx.lineTo(P[j].x, P[j].y); cx.stroke(); } }
      } else cx.clearRect(0, 0, innerWidth, innerHeight);
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Yuklash (faqat sayt sahifasida) ---------- */
  E.boot = function () {
    startNetwork();
    if (window.Auth && window.Auth.enabled) { window.Auth.onChange(refreshNav); window.Auth.init(); }
    if (window.__SITE__) return E.render(window.__SITE__);
    if (isPreview) {
      addEventListener('message', (e) => {
        if (e.source !== parent || !e.data) return;
        if (e.data.type === 'site') E.render(e.data.data);
        if (e.data.type === 'focus') { const el = document.getElementById(e.data.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
      parent.postMessage({ type: 'ready' }, '*'); return;
    }
    const API = String(window.__API__ || '').replace(/\/$/, '');
    fetch(API + '/api/site').then((r) => { if (!r.ok) throw 0; return r.json(); }).then(E.render)
      .catch(() => { $('#app').innerHTML = '<div class="err"><h2>Sayt vaqtincha ishlamayapti</h2><p>Iltimos, birozdan so\'ng qayta urinib ko\'ring.</p></div>'; });
  };
})();
