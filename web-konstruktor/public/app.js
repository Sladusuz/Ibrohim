'use strict';
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => Number(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const safeUrl = (u) => (/^(https?:\/\/|\/(?!\/)|data:image\/(png|jpeg|webp|gif|svg\+xml)[;,])/i.test(u || '') ? u : '');
  const isPreview = new URLSearchParams(location.search).has('preview');
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };

  let S = null;            // sayt ma'lumoti
  let cart = {};           // {productId: qty}
  let timers = [];         // render uchun taymerlar
  let observers = [];
  const mouse = { x: -999, y: -999 };

  const on = (k) => !!(S.features && S.features[k]);
  const text = (v) => esc(v || '');

  /* ---------- Savat ---------- */
  function loadCart() {
    try { cart = JSON.parse(store.get('cart') || '{}') || {}; } catch { cart = {}; }
    cleanCart();
  }
  function cleanCart() {
    const ids = new Set((S.products || []).map((p) => p.id));
    for (const id of Object.keys(cart)) {
      const q = parseInt(cart[id], 10);
      if (!ids.has(id) || !(q > 0)) delete cart[id]; else cart[id] = Math.min(99, q);
    }
  }
  const saveCart = () => { store.set('cart', JSON.stringify(cart)); };
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = () => (S.products || []).filter((p) => cart[p.id]).map((p) => ({ p, qty: cart[p.id] }));
  const cartTotal = () => cartItems().reduce((a, i) => a + i.p.price * i.qty, 0);

  /* ---------- Rang va mavzu ---------- */
  function applyTheme() {
    const root = document.documentElement;
    const saved = isPreview ? null : store.get('theme');
    const preset = ['dark', 'light', 'warm'].includes(saved) && on('themeSwitcher') ? saved : (S.theme && S.theme.preset) || 'dark';
    root.dataset.theme = ['dark', 'light', 'warm'].includes(preset) ? preset : 'dark';
    const hex = /^#[0-9a-f]{6}$/i;
    const t = S.theme || {};
    for (const [k, v] of [['--acc', t.accent], ['--acc2', t.accent2]]) {
      if (hex.test(v || '')) root.style.setProperty(k, v); else root.style.removeProperty(k);
    }
    if (hex.test(t.accent || '') && !hex.test(t.accent2 || '')) root.style.setProperty('--acc2', t.accent);
    const ink = hex.test(t.accent || '') ? (lum(t.accent) > 0.55 ? '#06101c' : '#ffffff') : '';
    if (ink) root.style.setProperty('--on', ink); else root.style.removeProperty('--on');
    root.classList.toggle('calm', !on('effects'));
    root.classList.toggle('preview', isPreview);
  }
  function lum(h) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function setMeta() {
    const c = S.company || {};
    document.title = c.name || 'Sayt';
    let m = $('meta[name=description]'); if (m) m.content = (S.hero && S.hero.text) || '';
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#22d3ee';
    const letter = esc((c.logo || (c.name || 'S')[0] || 'S').slice(0, 2));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='${acc}'/><text x='32' y='44' font-size='34' font-weight='800' text-anchor='middle' fill='#fff' font-family='Arial'>${letter}</text></svg>`;
    let l = $('link[rel=icon]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  /* ---------- Bo'limlar ---------- */
  function codeLine(s) {
    let h = esc(s);
    h = h.replace(/(\/\/.*)$/, '<span class="c">$1</span>');
    h = h.replace(/(&quot;.*?&quot;)/g, '<span class="s">$1</span>');
    h = h.replace(/\b(const|let|var|function|return)\b/g, '<span class="k">$1</span>');
    return h;
  }
  function navHtml() {
    const links = [];
    if (on('services') && (S.services.items || []).length) links.push(['xizmat', S.services.eyebrow || 'Xizmatlar']);
    if (on('process') && (S.process.steps || []).length) links.push(['jarayon', S.process.eyebrow || 'Jarayon']);
    if (on('catalog') && (S.products || []).length) links.push(['katalog', S.catalog.navLabel || S.catalog.eyebrow || 'Katalog']);
    links.push(['aloqa', (S.contacts && S.contacts.eyebrow) || 'Aloqa']);
    const showCart = on('catalog') && on('orders') && (S.products || []).length;
    return `<header class="nav"><a class="logo" href="#top"><span class="mark">${text((S.company.logo || (S.company.name || 'S')[0]).slice(0, 2))}</span>${text(S.company.name)}</a>
      <nav class="links" id="links">${links.map(([id, l]) => `<a href="#${id}">${text(l)}</a>`).join('')}</nav>
      <div class="nav-r">${showCart ? `<button class="icon-btn" id="cartBtn" aria-label="Savat">${svgIcon('cart')}<span class="n" id="cartN" data-v="${cartCount()}">${cartCount() || ''}</span></button>` : ''}
      <a class="btn sm" href="#aloqa">${text(S.hero.navCta || 'Bog\'lanish')}</a>
      <button class="icon-btn burger" id="burger" aria-label="Menyu">${svgIcon('menu')}</button></div></header>`;
  }
  function heroHtml() {
    const h = S.hero || {};
    const words = (h.words || []).filter(Boolean);
    const split = (s, d) => (s || '').split(/\s+/).filter(Boolean).map((w, i) => `<span class="w"><span style="animation-delay:${(d + i * 0.1).toFixed(1)}s">${text(w)}</span></span>`).join(' ');
    let visual = '';
    const chips = (h.chips || []).filter(Boolean).slice(0, 3);
    const chipIcons = ['chart', 'zap', 'check'];
    const chipHtml = chips.map((c, i) => `<div class="chip ${'abc'[i]}"><em>${svgIcon(chipIcons[i])}</em>${text(c)}</div>`).join('');
    if (h.visual === 'window') {
      const lines = (h.windowLines || []).slice(0, 12);
      visual = `<div class="vis"><div class="win" id="win"><div class="bar"><i></i><i></i><i></i></div><pre>${lines.map((l, i) => `<span class="l" style="animation-delay:${(1 + i * 0.3).toFixed(1)}s">${codeLine(l)}</span>`).join('')}</pre>
        <div class="chart">${[35, 55, 42, 70, 60, 88, 100].map((v, i) => `<i style="height:${v}%;animation-delay:${(1.2 + i * 0.1).toFixed(1)}s"></i>`).join('')}</div></div>${chipHtml}</div>`;
    } else if (h.visual === 'image' && safeUrl(h.image)) {
      visual = `<div class="vis"><div class="imgwin"><img src="${esc(safeUrl(h.image))}" alt=""></div>${chipHtml}</div>`;
    }
    const trust = (h.trust || []).filter((t) => t.value || t.label);
    return `<section class="hero" id="top"><div class="wrap hero-in ${visual ? '' : 'solo'}"><div>
      ${h.badge ? `<div class="pill"><b></b>${text(h.badge)}</div>` : ''}
      <h1>${split(h.titleStart, 0.1)}${words.length ? `<br><span class="grad type"><span id="tw"></span><i class="caret"></i></span>` : ' '}${split(h.titleEnd, 0.5)}</h1>
      ${h.text ? `<p class="lead">${text(h.text)}</p>` : ''}
      <div class="cta">${h.cta1 ? `<a class="btn mag" href="#${on('catalog') ? 'katalog' : 'aloqa'}">${text(h.cta1)} ${svgIcon('arrow')}</a>` : ''}${h.cta2 ? `<a class="btn ghost mag" href="#${on('services') ? 'xizmat' : 'aloqa'}">${text(h.cta2)}</a>` : ''}</div>
      ${trust.length ? `<div class="trust">${trust.map((t) => `<div><b>${text(t.value)}</b>${text(t.label)}</div>`).join('')}</div>` : ''}
    </div>${visual}</div></section>`;
  }
  function marqueeHtml() {
    const items = (S.marquee || []).filter(Boolean);
    if (!on('marquee') || !items.length) return '';
    const row = `<span>${items.map(text).join('</span><span>')}</span>`;
    return `<div class="mq"><div class="track">${row}${row}${row}${row}</div></div>`;
  }
  function statsHtml() {
    const st = (S.stats || []).filter((s) => s.label);
    if (!on('stats') || !st.length) return '';
    return `<section class="sec" style="padding:70px 0 0"><div class="wrap"><div class="stats rv">${st.map((s) => `<div class="stat"><b data-count="${Number(s.value) || 0}" data-suf="${esc(s.suffix || '')}">0${text(s.suffix)}</b><span>${text(s.label)}</span></div>`).join('')}</div></div></section>`;
  }
  function servicesHtml() {
    const sv = S.services || {}; const items = sv.items || [];
    if (!on('services') || !items.length) return '';
    // Oddiy va chiroyli taqsimot: 1-kartochka keng, qolganlari 2 ustun
    const cls = (i) => (items.length >= 4 && i === 0 ? 'c4' : items.length === 1 ? 'c6' : items.length === 2 ? 'c3' : 'c2');
    return `<section class="sec" id="xizmat"><div class="wrap"><span class="eyebrow rv">${text(sv.eyebrow)}</span><h2 class="rv">${text(sv.title)}</h2>${sv.text ? `<p class="sub rv">${text(sv.text)}</p>` : ''}
      <div class="bento">${items.map((it, i) => `<div class="card ${cls(i)} rv" style="--d:${(i % 3) * 0.1}s"><div class="ic">${svgIcon(it.icon)}</div><h3>${text(it.title)}</h3><p>${text(it.text)}</p></div>`).join('')}</div></div></section>`;
  }
  function processHtml() {
    const p = S.process || {}; const steps = p.steps || [];
    if (!on('process') || !steps.length) return '';
    return `<section class="sec" id="jarayon"><div class="wrap center"><span class="eyebrow rv">${text(p.eyebrow)}</span><h2 class="rv">${text(p.title)}</h2>${p.text ? `<p class="sub rv">${text(p.text)}</p>` : ''}
      <div class="steps">${steps.map((s, i) => `<div class="step rv" style="--d:${i * 0.1}s"><div class="num">${i + 1}</div><h3>${text(s.title)}</h3><p>${text(s.text)}</p></div>`).join('')}</div></div></section>`;
  }
  function prodCard(p) {
    const cur = (S.catalog && S.catalog.currency) || '';
    const img = safeUrl(p.image);
    const canBuy = on('orders');
    return `<article class="prod rv ${p.badge ? 'pop' : ''}" data-cat="${esc(p.category || '')}">
      ${p.badge ? `<span class="badge">${text(p.badge)}</span>` : ''}
      <div class="pimg">${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy">` : `<div class="ph">${text((p.name || '?')[0])}</div>`}</div>
      <div class="pb">${p.category ? `<span class="tag">${text(p.category)}</span>` : ''}<h3>${text(p.name)}</h3>${p.description ? `<p>${text(p.description)}</p>` : '<p></p>'}
      <div class="prow"><div class="amount">${p.price > 0 ? `${money(p.price)}<small>${text(cur)}</small>` : '<span style="font-size:17px">Narxi kelishiladi</span>'}</div>
      ${canBuy ? `<button class="btn sm" data-add="${esc(p.id)}">${svgIcon('cart')} Savatga</button>` : `<a class="btn sm ghost" href="#aloqa">Bog'lanish</a>`}</div></div></article>`;
  }
  function catalogHtml() {
    const c = S.catalog || {}; const ps = S.products || [];
    if (!on('catalog') || !ps.length) return '';
    const cats = [...new Set(ps.map((p) => p.category).filter(Boolean))];
    return `<section class="sec" id="katalog"><div class="wrap"><span class="eyebrow rv">${text(c.eyebrow)}</span><h2 class="rv">${text(c.title)}</h2>${c.text ? `<p class="sub rv">${text(c.text)}</p>` : ''}
      ${cats.length > 1 ? `<div class="filters rv" id="filters"><button class="on" data-cat="">Hammasi</button>${cats.map((x) => `<button data-cat="${esc(x)}">${text(x)}</button>`).join('')}</div>` : ''}
      <div class="price" id="grid">${ps.map(prodCard).join('')}</div></div></section>`;
  }
  function contactHtml() {
    const c = S.contacts || {};
    const rows = [];
    if (c.phone) rows.push(['tel', `<a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${text(c.phone)}</a>`]);
    if (c.email) rows.push(['mail', `<a href="mailto:${esc(c.email)}">${text(c.email)}</a>`]);
    if (c.address) rows.push(['pin', text(c.address)]);
    if (c.hours) rows.push(['clock', text(c.hours)]);
    if (c.telegram) { const u = c.telegram.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); rows.push(['send', `<a href="https://t.me/${esc(u)}" target="_blank" rel="noopener">@${text(u)}</a>`]); }
    if (c.instagram) { const u = c.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, ''); rows.push(['insta', `<a href="https://instagram.com/${esc(u)}" target="_blank" rel="noopener">@${text(u)}</a>`]); }
    const form = on('orders');
    return `<section class="sec" id="aloqa"><div class="wrap"><div class="cta-box rv ${form ? '' : 'one'}"><div><span class="eyebrow">${text(c.eyebrow)}</span><h2>${text(c.title)}</h2>${c.text ? `<p class="sub">${text(c.text)}</p>` : ''}
      <ul class="info">${rows.map(([i, h]) => `<li><em>${svgIcon(i)}</em><span>${h}</span></li>`).join('')}</ul></div>
      ${form ? `<div id="formBox"></div>` : ''}</div></div></section>`;
  }
  function formHtml() {
    const items = on('catalog') ? cartItems() : [];
    const cur = (S.catalog && S.catalog.currency) || '';
    const sum = items.length ? `<div class="sum"><b>Savatda:</b> ${items.map((i) => `${text(i.p.name)} ×${i.qty}`).join(', ')}${cartTotal() ? ` — <b>${money(cartTotal())} ${text(cur)}</b>` : ''} · <a id="openCart">o'zgartirish</a></div>` : '';
    return `<form id="orderForm" novalidate>${sum}
      <div class="fld"><input name="name" placeholder=" " required maxlength="100" autocomplete="name"><label>Ismingiz</label></div>
      <div class="fld"><input name="phone" placeholder=" " required maxlength="40" inputmode="tel" autocomplete="tel"><label>Telefon raqamingiz</label></div>
      <div class="fld"><textarea name="message" rows="3" placeholder=" " maxlength="1000"></textarea><label>${items.length ? 'Izoh (ixtiyoriy)' : 'Loyiha haqida'}</label></div>
      <div class="msg" id="formMsg" role="alert"></div>
      <button class="btn" type="submit">${items.length ? 'Buyurtma berish' : 'Yuborish'} ${svgIcon('arrow')}</button></form>`;
  }
  function drawerHtml() {
    if (!(on('catalog') && on('orders'))) return '';
    return `<div class="shade" id="shade"></div><aside class="drawer" id="drawer" aria-label="Savat"><div class="dh"><h3>Savat</h3><button class="icon-btn" id="closeCart" aria-label="Yopish">${svgIcon('x')}</button></div><div class="items" id="cartList"></div><div id="cartFoot"></div></aside>`;
  }
  function footerHtml() {
    return `<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${text(S.company.name)}. ${text((S.footer && S.footer.text) || '')}</span></div></footer>`;
  }
  function switcherHtml() {
    if (!on('themeSwitcher')) return '';
    const cur = document.documentElement.dataset.theme;
    return `<div class="sw">${[['dark', "Qorong'i"], ['light', "Yorug'"], ['warm', 'Issiq']].map(([k, l]) => `<button data-t="${k}" class="${k === cur ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }

  /* ---------- Savat interfeysi ---------- */
  function renderCart() {
    const n = $('#cartN'); if (n) { n.textContent = cartCount() || ''; n.dataset.v = cartCount(); }
    const list = $('#cartList'); if (!list) return;
    const cur = (S.catalog && S.catalog.currency) || '';
    const items = cartItems();
    list.innerHTML = items.length ? items.map(({ p, qty }) => `<div class="it"><div class="th">${safeUrl(p.image) ? `<img src="${esc(safeUrl(p.image))}" alt="">` : `<div class="ph">${text(p.name[0])}</div>`}</div>
      <div><b>${text(p.name)}</b><small>${p.price > 0 ? money(p.price) + ' ' + text(cur) : 'Narxi kelishiladi'}</small><div class="qty"><button data-dec="${esc(p.id)}" aria-label="Kamaytirish">−</button><span>${qty}</span><button data-inc="${esc(p.id)}" aria-label="Ko'paytirish">+</button></div></div>
      <button class="rm" data-rm="${esc(p.id)}" aria-label="O'chirish">${svgIcon('x')}</button></div>`).join('') : `<p class="empty">Savat bo'sh. Katalogdan tanlang.</p>`;
    const foot = $('#cartFoot');
    foot.innerHTML = items.length ? `${cartTotal() ? `<div class="tot"><span>Jami</span><span>${money(cartTotal())} ${text(cur)}</span></div>` : ''}<button class="btn" style="width:100%" id="checkout">Buyurtmani rasmiylashtirish ${svgIcon('arrow')}</button>` : '';
    const box = $('#formBox');
    if (box && !box.dataset.done) { const keep = box.querySelector('form') ? Object.fromEntries(new FormData(box.querySelector('form'))) : null; box.innerHTML = formHtml(); if (keep) for (const k in keep) { const f = box.querySelector(`[name=${k}]`); if (f) f.value = keep[k]; } }
  }
  const openCart = (v) => { $('#drawer')?.classList.toggle('open', v); $('#shade')?.classList.toggle('open', v); };
  function changeCart(id, d) {
    const q = (cart[id] || 0) + d;
    if (q <= 0) delete cart[id]; else cart[id] = Math.min(99, q);
    saveCart(); renderCart();
  }

  async function submitOrder(form) {
    const msg = $('#formMsg'); const btn = form.querySelector('button[type=submit]');
    const name = form.name.value.trim(), phone = form.phone.value.trim();
    msg.className = 'msg';
    if (name.length < 2) { msg.className = 'msg bad'; msg.textContent = 'Ismingizni kiriting'; return; }
    if (!/^[+\d][\d\s()\-]{6,}$/.test(phone)) { msg.className = 'msg bad'; msg.textContent = "Telefon raqamini to'g'ri kiriting (masalan, +998 90 123 45 67)"; return; }
    if (isPreview || window.__SITE__) { msg.textContent = "Namuna rejimi: buyurtma yuborilmaydi. Haqiqiy saytda u adminga tushadi."; return; }
    btn.disabled = true;
    try {
      const r = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, message: form.message.value, items: Object.entries(on('catalog') ? cart : {}).map(([id, qty]) => ({ id, qty })) }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Xatolik yuz berdi. Qayta urinib ko\'ring.');
      cart = {}; saveCart();
      const box = $('#formBox'); box.dataset.done = '1';
      box.innerHTML = `<div class="ok"><div class="tick">${svgIcon('check')}</div><h3>Rahmat! So'rovingiz qabul qilindi</h3><p class="sub" style="margin:auto">Tez orada siz bilan bog'lanamiz.</p></div>`;
      renderCart();
    } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; btn.disabled = false; }
  }

  /* ---------- Animatsiyalar ---------- */
  function initEffects() {
    timers.forEach(clearTimeout); timers = []; observers.forEach((o) => o.disconnect()); observers = [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$('.rv').forEach((e) => (isPreview ? e.classList.add('in') : io.observe(e))); observers.push(io);
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const t = +e.target.dataset.count, suf = e.target.dataset.suf || '', s = performance.now();
      (function f(n) { const p = Math.min(1, (n - s) / 1800); e.target.textContent = Math.round(t * (1 - Math.pow(1 - p, 4))) + suf; if (p < 1) requestAnimationFrame(f); })(s);
    }), { threshold: 0.6 });
    $$('[data-count]').forEach((e) => co.observe(e)); observers.push(co);
    const words = ((S.hero && S.hero.words) || []).filter(Boolean); const tw = $('#tw');
    if (tw && words.length) {
      let wi = 0, ci = 0, del = false;
      if (isPreview) { tw.textContent = words[0]; } else {
        (function tick() { const w = words[wi % words.length]; tw.textContent = w.slice(0, ci);
          if (!del && ci === w.length) { del = true; timers.push(setTimeout(tick, 1600)); return; }
          if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
          ci += del ? -1 : 1; timers.push(setTimeout(tick, del ? 45 : 95)); })();
      }
    }
    const win = $('#win');
    if (win) { const v = win.parentElement; v.addEventListener('pointermove', (e) => { const r = v.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; win.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`; }); v.addEventListener('pointerleave', () => (win.style.transform = '')); }
  }

  /* ---------- Asosiy render ---------- */
  function render(data) {
    S = data;
    S.company = S.company || {}; S.hero = S.hero || {}; S.catalog = S.catalog || {}; S.contacts = S.contacts || {}; S.services = S.services || {}; S.process = S.process || {};
    S.products = (S.products || []).filter((p) => p.active !== false).map((p) => ({ ...p, price: Number(p.price) || 0 }));
    loadCart(); applyTheme(); setMeta();
    $('#app').innerHTML = navHtml() + heroHtml() + marqueeHtml() + statsHtml() + servicesHtml() + processHtml() + catalogHtml() + contactHtml() + footerHtml() + drawerHtml() + switcherHtml();
    $('#aurora').style.display = ''; renderCart(); initEffects();
  }

  /* ---------- Hodisalar (bir marta ulanadi) ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button,a,[data-add]'); if (!t) return;
    if (t.dataset.add) { changeCart(t.dataset.add, 1); t.innerHTML = svgIcon('check') + ' Qo\'shildi'; setTimeout(() => { t.innerHTML = svgIcon('cart') + ' Savatga'; }, 1200); return; }
    if (t.id === 'cartBtn') return openCart(true);
    if (t.id === 'closeCart' || t.id === 'shade') return openCart(false);
    if (t.id === 'openCart') return openCart(true);
    if (t.id === 'checkout') { openCart(false); $('#aloqa')?.scrollIntoView(); return; }
    if (t.dataset.inc) return changeCart(t.dataset.inc, 1);
    if (t.dataset.dec) return changeCart(t.dataset.dec, -1);
    if (t.dataset.rm) { delete cart[t.dataset.rm]; saveCart(); return renderCart(); }
    if (t.id === 'burger') return $('#links').classList.toggle('open');
    if (t.closest('#links') && t.tagName === 'A') $('#links').classList.remove('open');
    if (t.closest('#filters') && t.dataset.cat !== undefined) {
      $$('#filters button').forEach((b) => b.classList.toggle('on', b === t));
      $$('#grid .prod').forEach((c) => { c.style.display = !t.dataset.cat || c.dataset.cat === t.dataset.cat ? '' : 'none'; });
    }
    if (t.closest('.sw') && t.dataset.t) { store.set('theme', t.dataset.t); document.documentElement.dataset.theme = t.dataset.t; $$('.sw button').forEach((b) => b.classList.toggle('on', b === t)); }
  });
  document.addEventListener('submit', (e) => { if (e.target.id === 'orderForm') { e.preventDefault(); submitOrder(e.target); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openCart(false); });
  addEventListener('scroll', () => { const h = document.body.scrollHeight - innerHeight; $('#prog').style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%'; }, { passive: true });
  addEventListener('pointermove', (e) => { const g = $('#glow'); g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }
    const b = e.target.closest && e.target.closest('.mag'); if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`; }
  });
  document.addEventListener('pointerout', (e) => { const b = e.target.closest && e.target.closest('.mag'); if (b) b.style.transform = ''; });

  /* ---------- Fon: harakatlanuvchi tarmoq ---------- */
  const cv = $('#bg'), cx = cv.getContext('2d'); let P = [];
  function size() {
    const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0);
    P = Array.from({ length: Math.min(80, Math.floor(innerWidth / 16)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 }));
  }
  addEventListener('resize', size); size();
  (function draw() {
    if (!document.documentElement.classList.contains('calm')) {
      cx.clearRect(0, 0, innerWidth, innerHeight);
      const col = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#22d3ee';
      cx.fillStyle = col; cx.strokeStyle = col;
      for (const p of P) {
        p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > innerWidth) p.vx *= -1; if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y; if (Math.hypot(dx, dy) < 160) { p.x -= dx * 0.004; p.y -= dy * 0.004; }
        cx.globalAlpha = 0.7; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 7); cx.fill();
      }
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
        if (d < 130) { cx.globalAlpha = (1 - d / 130) * 0.22; cx.beginPath(); cx.moveTo(P[i].x, P[i].y); cx.lineTo(P[j].x, P[j].y); cx.stroke(); }
      }
    }
    requestAnimationFrame(draw);
  })();

  /* ---------- Yuklash ---------- */
  if (window.__SITE__) {
    render(window.__SITE__);
  } else if (isPreview) {
    addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.type === 'site') render(e.data.data); });
    parent.postMessage({ type: 'ready' }, location.origin);
  } else {
    fetch('/api/site').then((r) => { if (!r.ok) throw 0; return r.json(); }).then(render)
      .catch(() => { $('#app').innerHTML = '<div class="err"><h2>Sayt vaqtincha ishlamayapti</h2><p>Iltimos, birozdan so\'ng qayta urinib ko\'ring.</p></div>'; });
  }
})();
