/* BabuSweet — front-end. Progressive: content is usable without GSAP/Lenis/API. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = window.BS_I18N || { uz: {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const safeHref = u => (/^(https?:\/\/|\/|tel:|mailto:)/i.test(u || '') ? u : '#');

  let G = null, ST = null, lenis = null, mm = null;
  let lang = 'uz', DATA = null;
  const t = k => (I[lang] && I[lang][k]) || I.uz[k] || '';
  const L = o => (o && (o[lang] || o.uz || o.en || o.ru)) || '';

  /* ---------------------------------------------------------------- data */
  const FALLBACK = { settings: { brand: 'BabuSweet', phone: '+998 33 623 33 13', address: 'Yangihayot, Sputnik-17, 52a, 100102, Tashkent, Tashkent Region', hours: {}, social: {}, hero: {}, stats: [], exportRegions: [] }, products: [], news: [] };
  async function loadData() {
    for (const u of ['/api/public', '/data/public.json']) {
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 6000);
        const r = await fetch(u, { signal: ctl.signal, cache: 'no-cache' }); clearTimeout(to);
        if (r.ok) { const d = await r.json(); if (d && Array.isArray(d.products)) return d; }
      } catch (e) { /* try next */ }
    }
    return FALLBACK;
  }

  /* ---------------------------------------------------------------- i18n */
  function applyStatic() {
    document.documentElement.lang = lang;
    $$('[data-t]').forEach(n => { const v = t(n.dataset.t); if (v) n.textContent = v; });
    $$('#lang button').forEach(b => { const on = b.dataset.lang === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }

  /* ---------------------------------------------------------------- render */
  const active = () => DATA.products.filter(p => p.status !== 'hidden');
  function renderSettings() {
    const s = DATA.settings;
    $('#heroTitle').textContent = L(s.hero && s.hero.title) || '';
    $('#heroLead').textContent = L(s.hero && s.hero.lead) || '';
    const tel = (s.phone || '').replace(/[^\d+]/g, '');
    $$('.js-phone').forEach(a => { a.textContent = s.phone; a.href = 'tel:' + tel; });
    const addr = $('#addrLink'); addr.textContent = s.address; addr.href = safeHref(s.mapUrl);
    $('#hours').textContent = L(s.hours) || '';
    $('#hours').closest('li').hidden = !L(s.hours);
    const em = $('#emailRow'); em.hidden = !s.email;
    if (s.email) { const a = $('#emailLink'); a.textContent = s.email; a.href = 'mailto:' + s.email; }
    const soc = $('#socials'); soc.innerHTML = '';
    Object.entries(s.social || {}).forEach(([k, u]) => { if (u) { const a = el('a', '', esc(k[0].toUpperCase() + k.slice(1))); a.href = safeHref(u); a.target = '_blank'; a.rel = 'noopener noreferrer'; soc.appendChild(a); } });
    document.title = (s.brand || 'BabuSweet') + ' — ' + (lang === 'ru' ? 'Шоколадная фабрика' : lang === 'en' ? 'Chocolate factory' : 'Shokolad fabrikasi');
    // marquee
    const words = [s.brand || 'BabuSweet', 'Real Chocolate Inside', 'Sea Salt Caramel', 'Export Quality', 'Made in Uzbekistan'];
    const m = $('#marquee1'); m.innerHTML = '';
    for (let r = 0; r < 4; r++) words.forEach(w => m.appendChild(el('span', '', esc(w))));
    // stats
    const sg = $('#stats'); sg.innerHTML = '';
    (s.stats || []).slice(0, 4).forEach(x => {
      const d = el('div', 'stat rv'); d.innerHTML = `<b data-n="${+x.value || 0}" data-s="${esc(x.suffix || '')}">${+x.value || 0}${esc(x.suffix || '')}</b><span>${esc(L(x.label))}</span>`; sg.appendChild(d);
    });
    // regions + orbit
    const regs = (s.exportRegions && s.exportRegions.length ? s.exportRegions : ['Central Asia', 'CIS', 'Middle East', 'Europe']).slice(0, 8);
    const ul = $('#regions'); ul.innerHTML = ''; regs.forEach(r => ul.appendChild(el('li', '', esc(r))));
    buildOrbit(regs);
  }

  function buildOrbit(regs) {
    const NS = 'http://www.w3.org/2000/svg', cx = 200, cy = 200;
    let h = `<svg viewBox="0 0 400 400"><circle class="ring" cx="${cx}" cy="${cy}" r="70"/><circle class="ring" cx="${cx}" cy="${cy}" r="130"/><circle class="ring" cx="${cx}" cy="${cy}" r="185"/><g class="orbit-spin">`;
    regs.forEach((r, i) => {
      const a = (i / regs.length) * Math.PI * 2 - Math.PI / 2, rad = i % 2 ? 130 : 178;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      h += `<line class="route" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><circle class="pulse" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" style="animation-delay:${(i * .35).toFixed(2)}s"/><circle class="node" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`;
    });
    h += '</g>';
    h += `<circle cx="${cx}" cy="${cy}" r="38" fill="url(#hubg)"/><defs><linearGradient id="hubg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#a8721a"/></linearGradient></defs><text class="hub-t" x="${cx}" y="${cy + 4}" text-anchor="middle">TASHKENT</text></svg>`;
    $('#orbit').innerHTML = h;
  }

  function productCard(p) {
    const soon = p.status === 'soon';
    const a = el('article', 'pcard-prod' + (soon ? ' is-soon' : ''));
    a.tabIndex = 0; a.setAttribute('role', 'button'); a.dataset.slug = p.slug; a.style.setProperty('--c', p.color || '#e9b24a');
    a.dataset.c1 = p.color || '#e9b24a'; a.dataset.c2 = p.color2 || '#2a1608';
    const badge = soon ? `<span class="pbadge soon">${esc(t('prod.soon'))}</span>` : (p.badge ? `<span class="pbadge">${esc(p.badge)}</span>` : '');
    a.innerHTML = `<div class="pimg">${badge}<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" draggable="false"></div>
      <div class="pmeta"><div><h3>${esc(p.name)}</h3><small>${esc(L(p.tagline) || p.flavor)}</small></div><span class="pmore" aria-hidden="true">→</span></div>`;
    return a;
  }
  function renderProducts() {
    const rail = $('#rail'); rail.innerHTML = '';
    const list = active();
    list.forEach(p => rail.appendChild(productCard(p)));
    $('#ptotal').textContent = String(list.length).padStart(2, '0');
    $('#products').hidden = !list.length;
    renderHeroFan(list.filter(p => p.status === 'active').slice(0, 5));
  }
  function renderHeroFan(list) {
    const st = $('#heroStage'); st.innerHTML = '';
    const n = list.length; if (!n) return;
    list.forEach((p, i) => {
      const d = el('div', 'fan'); d.innerHTML = `<img src="${esc(p.image)}" alt="" decoding="async" ${i === 0 ? 'fetchpriority="high"' : ''}>`;
      const o = i - (n - 1) / 2; d.dataset.o = o; d.dataset.i = i;
      d.style.transform = `translateX(${o * 62}%) translateY(${Math.abs(o) * 8 - 6}%) rotate(${o * 9}deg)`;
      d.style.zIndex = 10 - Math.round(Math.abs(o) * 2);
      st.appendChild(d);
    });
  }
  function renderNews() {
    const g = $('#newsGrid'); g.innerHTML = '';
    const items = [...DATA.news];
    DATA.products.filter(p => p.status === 'soon').forEach(p => items.push({ id: 'soon-' + p.id, soon: p, date: p.createdAt, title: { uz: p.name, ru: p.name, en: p.name }, body: p.tagline, image: p.image }));
    $('#news').hidden = !items.length;
    items.forEach(n => {
      const c = el('article', 'ncard rv');
      const d = n.date ? new Date(n.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      c.innerHTML = `<div class="ncard-img">${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy" decoding="async">` : ''}</div><div class="ncard-body"><time>${esc(n.soon ? t('prod.soon') : d)}</time><h3>${esc(L(n.title))}</h3><p>${esc(L(n.body))}</p></div>`;
      g.appendChild(c);
    });
  }

  /* ---------------------------------------------------------------- modal */
  const modal = $('#modal'); let lastFocus = null;
  function openProduct(slug, push = true) {
    const p = DATA.products.find(x => x.slug === slug); if (!p) return;
    lastFocus = document.activeElement;
    $('#mImg').src = p.image; $('#mImg').alt = p.name;
    $('#mCat').textContent = p.category || '';
    $('#mTitle').textContent = p.name;
    $('#mTag').textContent = p.status === 'soon' ? t('prod.soon') : (L(p.tagline) || '');
    $('#mDesc').textContent = L(p.desc);
    const meta = $('#mMeta'); meta.innerHTML = '';
    [['m.flavor', p.flavor], ['m.weight', p.weight], ['m.cat', p.category]].forEach(([k, v]) => { if (v) meta.insertAdjacentHTML('beforeend', `<dt>${esc(t(k))}</dt><dd>${esc(v)}</dd>`); });
    $('#mCta').style.display = p.status === 'soon' ? 'none' : '';
    modal.hidden = false; document.body.classList.add('noscroll'); if (lenis) lenis.stop();
    requestAnimationFrame(() => { modal.classList.add('open'); $('.modal-x', modal).focus(); });
    if (push) history.pushState({ p: slug }, '', '/product/' + slug);
  }
  function closeModal(pop = false) {
    if (modal.hidden) return;
    modal.classList.remove('open');
    setTimeout(() => { modal.hidden = true; }, 450);
    document.body.classList.remove('noscroll'); if (lenis) lenis.start();
    if (!pop && /^\/product\//.test(location.pathname)) history.pushState({}, '', '/');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab' && !modal.hidden) { const f = $$('button,a[href]', modal).filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  addEventListener('popstate', () => { const m = /^\/product\/([\w-]+)/.exec(location.pathname); if (m) openProduct(m[1], false); else closeModal(true); });

  // product click / keyboard (drag-safe)
  let down = null;
  $('#rail').addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  $('#rail').addEventListener('click', e => {
    const c = e.target.closest('.pcard-prod'); if (!c) return;
    if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return;
    openProduct(c.dataset.slug);
  });
  $('#rail').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('pcard-prod')) { e.preventDefault(); openProduct(e.target.dataset.slug); } });

  /* ---------------------------------------------------------------- form */
  const form = $('#form'), note = $('#formNote');
  $$('[data-type]').forEach(a => a.addEventListener('click', () => { $('#fType').value = a.dataset.type; }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form), name = (f.get('name') || '').trim(), contact = (f.get('contact') || '').trim();
    ['name', 'contact'].forEach(n => form.elements[n].classList.toggle('err', !(f.get(n) || '').trim()));
    note.classList.remove('bad');
    if (name.length < 2 || contact.length < 5) { note.textContent = t('f.err'); note.classList.add('bad'); return; }
    const btn = $('button[type=submit]', form); btn.disabled = true; note.textContent = t('f.sending');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(f)) });
      if (!r.ok) throw new Error(r.status);
      note.textContent = t('f.ok'); form.reset();
    } catch (err) { note.textContent = t('f.fail'); note.classList.add('bad'); }
    btn.disabled = false;
  });

  /* ---------------------------------------------------------------- menu / header */
  const header = $('#header'), burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    burger.classList.toggle('open', open); menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('noscroll', open); if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  $('#lang').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); });
  function setLang(l) { if (!I[l]) return; lang = l; store.set('lang', l); applyStatic(); renderSettings(); renderProducts(); renderNews(); build(); }

  function anchorScroll(e) {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const tgt = $(id); if (!tgt) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(tgt, { offset: -40, duration: 1.6 }); else tgt.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', anchorScroll);

  /* ---------------------------------------------------------------- dust canvas */
  const cv = $('#dust'), cx2 = cv.getContext('2d'); let parts = [], dw = 0, dh = 0, mx = -999, my = -999, dustOn = true;
  function dustInit() {
    const dpr = Math.min(devicePixelRatio || 1, 2); dw = innerWidth; dh = innerHeight;
    cv.width = dw * dpr; cv.height = dh * dpr; cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(70, Math.floor(dw * dh / 24000));
    parts = Array.from({ length: n }, () => ({ x: Math.random() * dw, y: Math.random() * dh, r: Math.random() * 1.8 + .4, vy: -(Math.random() * .25 + .05), vx: (Math.random() - .5) * .12, a: Math.random() * .6 + .2, tw: Math.random() * 6 }));
  }
  function dustTick() {
    if (!dustOn) return;
    cx2.clearRect(0, 0, dw, dh);
    for (const p of parts) {
      p.y += p.vy; p.x += p.vx; p.tw += .03;
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d < 120 && d > 0) { p.x += dx / d * 1.4; p.y += dy / d * 1.4; }
      if (p.y < -5) { p.y = dh + 5; p.x = Math.random() * dw; }
      if (p.x < -5) p.x = dw + 5; if (p.x > dw + 5) p.x = -5;
      cx2.globalAlpha = p.a * (.55 + .45 * Math.sin(p.tw));
      cx2.fillStyle = '#ffe29a'; cx2.beginPath(); cx2.arc(p.x, p.y, p.r, 0, 6.283); cx2.fill();
    }
    requestAnimationFrame(dustTick);
  }
  if (!reduce) {
    dustInit(); addEventListener('resize', () => { clearTimeout(dustInit.t); dustInit.t = setTimeout(dustInit, 200); });
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => { dustOn = !document.hidden; if (dustOn) requestAnimationFrame(dustTick); });
    requestAnimationFrame(dustTick);
  } else cv.remove();

  /* ---------------------------------------------------------------- animation (GSAP) */
  let ctxAnim = null;
  function killAnim() { if (mm) { mm.revert(); mm = null; } if (ST) ST.getAll().forEach(s => s.kill()); document.documentElement.classList.remove('is-anim'); }

  function build() {
    if (!G || !ST) { finishNoAnim(); return; }
    killAnim();
    document.documentElement.classList.add('is-anim');
    const prods = $('#products');
    mm = G.matchMedia();

    mm.add('(min-width: 1021px) and (prefers-reduced-motion: no-preference)', () => {
      // pinned horizontal showcase
      prods.classList.remove('native');
      const rail = $('#rail'), pin = $('#productsPin'), n = $$('.pcard-prod', rail).length;
      if (n > 1) {
        const dist = () => Math.max(0, rail.scrollWidth - innerWidth);
        const tw = G.to(rail, { x: () => -dist(), ease: 'none', scrollTrigger: {
          trigger: prods, start: 'top top', end: () => '+=' + (dist() + innerHeight * .6), pin: pin, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => { $('#pprog').style.transform = `scaleX(${self.progress})`; const i = Math.min(n, Math.floor(self.progress * n * .999) + 1); $('#pcur').textContent = String(i).padStart(2, '0'); setAccent(i - 1); }
        } });
        $$('.pcard-prod .pimg img', rail).forEach(img => G.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.pcard-prod'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
      } else { prods.classList.add('native'); }
      return () => { };
    });
    mm.add('(max-width: 1020px), (prefers-reduced-motion: reduce)', () => {
      prods.classList.add('native');
      const rail = $('#rail');
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) setAccent($$('.pcard-prod', rail).indexOf(en.target)); }), { root: rail, threshold: .6 });
      $$('.pcard-prod', rail).forEach(c => io.observe(c));
      return () => io.disconnect();
    });

    if (!reduce) {
      // split reveal for statement
      const stm = $('#statement');
      if (!stm.dataset.split || stm.dataset.lang !== lang) {
        const words = stm.textContent.trim().split(/\s+/);
        stm.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
        stm.dataset.split = 1; stm.dataset.lang = lang;
      }
      const ws = $$('.w', stm);
      ST.create({ trigger: stm, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: s => { const k = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('lit', i < k)); } });

      // generic reveals
      $$('.rv, .h2, .kicker, .pcard, .step, .cinfo li, .form').forEach(n => {
        if (n.closest('.products-pin') || n.closest('.hero')) return;
        G.fromTo(n, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 90%', once: true } });
      });
      // steps line draw
      const path = $('#stepsPath');
      if (path) { path.style.strokeDashoffset = 1000; G.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 70%', end: 'bottom 70%', scrub: true } }); }
      // counters
      $$('#stats b').forEach(b => {
        const end = +b.dataset.n || 0, suf = b.dataset.s || '', o = { v: 0 };
        ST.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => G.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v) + suf; } }) });
      });
      // hero parallax on scroll
      G.to('.hero-stage', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      G.to('.hero-copy', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true } });
      G.to('.footer-word', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
      // marquee speed from scroll velocity
      const mt = $('#marquee1');
      ST.create({ trigger: document.body, start: 0, end: 'max', onUpdate: s => { const v = Math.min(Math.abs(s.getVelocity()) / 1200, 4); mt.style.animationDuration = Math.max(10, 38 - v * 8) + 's'; } });
    }
    nav();
    ST.refresh();
  }
  function finishNoAnim() {
    document.documentElement.classList.remove('is-anim');
    $('#products').classList.add('native');
    $$('#stats b').forEach(b => { b.textContent = (+b.dataset.n || 0) + (b.dataset.s || ''); });
    $('#steps path') && ($('#stepsPath').style.strokeDashoffset = 0);
    $$('.statement-text .w').forEach(w => w.classList.add('lit'));
  }

  function setAccent(i) {
    const c = $$('.pcard-prod', $('#rail'))[i]; if (!c) return;
    const p = $('#products'); p.style.setProperty('--accent', c.dataset.c1); p.style.setProperty('--accent2', c.dataset.c2);
    $('.hero-glow').style.background = `radial-gradient(circle,${c.dataset.c1}38,transparent 60%)`;
    if (!matchMedia('(min-width:1021px)').matches) $('#pcur').textContent = String(i + 1).padStart(2, '0');
  }

  function nav() {
    const links = $$('.nav a'); const map = links.map(a => [a, $(a.getAttribute('href'))]).filter(x => x[1]);
    map.forEach(([a, sec]) => ST.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('active', s.isActive) }));
  }

  /* ---------------------------------------------------------------- hero intro + pointer fx */
  function heroIntro() {
    const word = $('.word-line'), fans = $$('.fan');
    if (!G || reduce) return;
    const tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(word, { yPercent: 120, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.5 }, 0)
      .from('.hero .kicker', { y: 30, opacity: 0, duration: 1 }, .2)
      .from('#heroTitle,#heroLead', { y: 40, opacity: 0, duration: 1.1, stagger: .12 }, .5)
      .from('.hero-cta', { y: 40, opacity: 0, duration: 1 }, .7)
      .from(fans, { y: 220, rotate: i => (i - 2) * 40, opacity: 0, duration: 1.8, stagger: .12 }, .1);
    // idle floating
    tl.eventCallback('onComplete', () => fans.forEach((f, i) => G.to(f, { y: i % 2 ? 14 : -14, duration: 3 + i * .4, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    // pointer parallax
    if (fine) {
      const st = $('#heroStage');
      addEventListener('pointermove', e => {
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        G.to(st, { rotateY: nx * 16, rotateX: -ny * 12, transformPerspective: 1400, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      }, { passive: true });
      void st;
    }
  }

  function pointerFx() {
    if (!fine || reduce || !G) return;
    const cur = $('#cursor'), lab = $('span', cur);
    const xs = G.quickTo(cur, 'x', { duration: .25, ease: 'power3' }), ys = G.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { cur.classList.add('on'); xs(e.clientX); ys(e.clientY); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    document.addEventListener('pointerover', e => {
      const card = e.target.closest('.pcard-prod'), link = e.target.closest('a,button,.lang');
      cur.classList.toggle('big', !!card); cur.classList.toggle('link', !card && !!link);
      if (card) lab.textContent = t('prod.more');
    });
    // magnetic buttons
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); G.to(b, { '--bx': (e.clientX - r.left - r.width / 2) * .25 + 'px', '--by': (e.clientY - r.top - r.height / 2) * .35 + 'px', duration: .5, ease: 'power3.out' }); });
      b.addEventListener('pointerleave', () => G.to(b, { '--bx': '0px', '--by': '0px', duration: .9, ease: 'elastic.out(1,.4)' }));
    });
    // tilt cards
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px'); G.to(c, { rotateY: (x / r.width - .5) * 8, rotateX: -(y / r.height - .5) * 8, transformPerspective: 900, duration: .6, ease: 'power3.out' }); });
      c.addEventListener('pointerleave', () => G.to(c, { rotateX: 0, rotateY: 0, duration: .9, ease: 'power3.out' }));
    });
  }

  /* ---------------------------------------------------------------- loader + boot */
  function runLoader(done) {
    const bar = $('#loaderBar'), num = $('#loaderNum'), loader = $('#loader');
    let p = 0, target = 0, finished = false;
    const imgs = $$('img').filter(i => !i.complete).slice(0, 8);
    let loaded = 0; const total = imgs.length || 1;
    const step = () => { loaded++; target = Math.max(target, Math.min(100, Math.round(loaded / total * 100))); };
    imgs.forEach(i => { i.addEventListener('load', step, { once: true }); i.addEventListener('error', step, { once: true }); });
    if (!imgs.length) target = 100;
    const t0 = performance.now();
    (function tick(now) {
      const minDone = now - t0 > (reduce ? 100 : 1300);
      p += (Math.min(target, minDone ? 100 : 92) - p) * .12 + .15;
      p = Math.min(p, 100);
      num.textContent = Math.round(p); bar.style.transform = `scaleX(${p / 100})`;
      if ((p >= 99.5 && minDone && target >= 100) || now - t0 > 5000) { if (!finished) { finished = true; num.textContent = 100; bar.style.transform = 'scaleX(1)'; setTimeout(() => { loader.classList.add('done'); document.documentElement.classList.remove('is-loading'); done(); }, 250); } return; }
      requestAnimationFrame(tick);
    })(t0);
    setTimeout(() => { if (!finished) target = 100; }, 3500);
  }

  async function boot() {
    lang = I[store.get('lang')] ? store.get('lang') : ((navigator.language || 'uz').toLowerCase().startsWith('ru') ? 'ru' : (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'uz');
    $('#year').textContent = new Date().getFullYear();
    DATA = await loadData();
    applyStatic(); renderSettings(); renderProducts(); renderNews();
    G = window.gsap; ST = window.ScrollTrigger;
    if (G && ST) {
      G.registerPlugin(ST);
      if (window.Lenis && !reduce) {
        lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, syncTouch: false });
        lenis.on('scroll', ST.update);
        G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0);
      }
      ST.config({ ignoreMobileResize: true });
    }
    // scroll progress + header
    let lastY = 0;
    const sb = $('#scrollbar');
    const onScroll = () => {
      const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      sb.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      header.classList.toggle('stuck', y > 30);
      header.classList.toggle('hide', y > lastY + 6 && y > 400 && !menu.classList.contains('open'));
      if (y < lastY - 6) header.classList.remove('hide');
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    build();
    pointerFx();
    runLoader(() => {
      heroIntro();
      const m = /^\/product\/([\w-]+)/.exec(location.pathname); if (m) openProduct(m[1], false);
      if (ST) setTimeout(() => ST.refresh(), 300);
    });
    addEventListener('load', () => ST && ST.refresh());
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ST && ST.refresh(), 250); });
  }

  const start = () => boot().catch(err => { console.error(err); document.documentElement.classList.remove('is-loading', 'is-anim'); $('#loader').classList.add('done'); });
  // scripts are deferred: GSAP/Lenis are ready by DOMContentLoaded
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
