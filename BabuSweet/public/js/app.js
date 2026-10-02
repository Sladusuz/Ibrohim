/* BabuSweet front-end. Progressive: the page is fully usable without GSAP/Lenis/the API. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = window.BS_I18N || { uz: {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const safeHref = u => (/^(https?:\/\/|\/|tel:|mailto:)/i.test(u || '') ? u : '#');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let G = null, ST = null, lenis = null, ctx = null;
  let lang = 'uz', DATA = null, LIST = [];
  const t = k => (I[lang] && I[lang][k]) || I.uz[k] || '';
  const L = o => (o && (o[lang] || o.uz || o.en || o.ru)) || '';

  /* ------------------------------------------------------------ data */
  const FALLBACK = { settings: { brand: 'BabuSweet', phone: '+998 33 623 33 13', address: 'Yangihayot, Sputnik-17, 52a, 100102, Tashkent, Tashkent Region', hours: {}, social: {}, hero: {}, stats: [], exportRegions: [] }, products: [], news: [] };
  async function loadData() {
    for (const u of ['/api/public', '/data/public.json']) {
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 6000);
        const r = await fetch(u, { signal: ctl.signal, cache: 'no-cache' }); clearTimeout(to);
        if (r.ok) { const d = await r.json(); if (d && Array.isArray(d.products)) return d; }
      } catch (e) { /* next */ }
    }
    return FALLBACK;
  }

  /* ------------------------------------------------------------ colour from product photo */
  const hex = a => '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  function sampleEdge(img) {
    try {
      const S = 28, c = document.createElement('canvas'); c.width = c.height = S;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, S, S);
      const d = x.getImageData(0, 0, S, S).data; let r = 0, g = 0, b = 0, n = 0;
      for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) {
        if (xx > 2 && xx < S - 3 && y > 2 && y < S - 3) continue;
        const i = (y * S + xx) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      }
      return [r / n, g / n, b / n];
    } catch (e) { return null; }
  }
  function preload(list, onTick) {
    return Promise.all(list.map(p => new Promise(res => {
      const im = new Image(); im.decoding = 'async';
      const done = () => { if (im.naturalWidth) { const c = sampleEdge(im); if (c) { p._c = hex(c); p._c2 = hex(c.map(v => v * .42)); } } onTick && onTick(); res(); };
      im.onload = done; im.onerror = () => { onTick && onTick(); res(); }; im.src = p.image;
      setTimeout(res, 7000);
    })));
  }
  const pc = p => p._c || p.color || '#1f63ff';
  const pc2 = p => p._c2 || p.color2 || '#0a1a5a';

  /* ------------------------------------------------------------ i18n + settings */
  function applyStatic() {
    root.lang = lang;
    $$('[data-t]').forEach(n => { const v = t(n.dataset.t); if (v) n.textContent = v; });
    $$('#lang button').forEach(b => { const on = b.dataset.lang === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('#badgeText').textContent = t('hero.badge');
  }
  function renderSettings() {
    const s = DATA.settings;
    $('#heroTitle').textContent = L(s.hero && s.hero.title) || '';
    $('#heroLead').textContent = L(s.hero && s.hero.lead) || '';
    const tel = (s.phone || '').replace(/[^\d+]/g, '');
    $$('.js-phone').forEach(a => { a.textContent = s.phone; a.href = 'tel:' + tel; });
    const addr = $('#addrLink'); addr.textContent = s.address; addr.href = safeHref(s.mapUrl);
    $('#hours').textContent = L(s.hours) || ''; $('#hours').closest('li').hidden = !L(s.hours);
    const em = $('#emailRow'); em.hidden = !s.email;
    if (s.email) { const a = $('#emailLink'); a.textContent = s.email; a.href = 'mailto:' + s.email; }
    const soc = $('#socials'); soc.innerHTML = '';
    Object.entries(s.social || {}).forEach(([k, u]) => { if (u) { const a = el('a', '', esc(k)); a.href = safeHref(u); a.target = '_blank'; a.rel = 'noopener noreferrer'; soc.appendChild(a); } });
    soc.hidden = !soc.children.length;
    document.title = (s.brand || 'BabuSweet') + ' — ' + (lang === 'ru' ? 'Шоколадная фабрика' : lang === 'en' ? 'Chocolate factory' : 'Shokolad fabrikasi');
    const words = [s.brand || 'BabuSweet', 'Real Chocolate Inside', 'Sea Salt Caramel', 'Export Quality', 'Made in Uzbekistan'];
    const m = $('#bigMarq'); m.innerHTML = '';
    for (let r = 0; r < 4; r++) words.forEach(w => m.appendChild(el('span', '', esc(w))));
    const sg = $('#stats'); sg.innerHTML = '';
    (s.stats || []).slice(0, 4).forEach(x => {
      const d = el('div', 'stat'); d.innerHTML = `<b data-n="${+x.value || 0}" data-s="${esc(x.suffix || '')}">${+x.value || 0}${esc(x.suffix || '')}</b><span>${esc(L(x.label))}</span>`; sg.appendChild(d);
    });
    const regs = (s.exportRegions && s.exportRegions.length ? s.exportRegions : ['Central Asia', 'CIS', 'Middle East', 'Europe']).slice(0, 8);
    const ul = $('#regions'); ul.innerHTML = ''; regs.forEach(r => ul.appendChild(el('li', '', esc(r))));
    DATA._regs = regs;
  }

  /* ------------------------------------------------------------ hero */
  const SPRITES = {
    chunk: '<svg viewBox="0 0 64 64"><path d="M9 24 30 6l25 8 4 25-19 20-27-8z" fill="#3a1b0d"/><path d="M30 6l25 8-14 14-24-4z" fill="#8b5230"/><path d="M41 28 55 14l4 25-19 20z" fill="#24100a"/></svg>',
    drop: '<svg viewBox="0 0 64 64"><path d="M32 4C32 4 12 28 12 41a20 20 0 0 0 40 0C52 28 32 4 32 4z" fill="#f2a526"/><ellipse cx="24" cy="38" rx="5" ry="9" fill="#ffe08a" opacity=".8"/></svg>',
    salt: '<svg viewBox="0 0 64 64"><path d="M32 4 58 30 32 60 6 30z" fill="#f4f8ff"/><path d="M32 4 58 30H6z" fill="#fff"/><path d="M32 60 58 30 32 34z" fill="#c9d6ee"/></svg>',
    star: '<svg viewBox="0 0 64 64"><path d="M32 2c2 16 6 28 30 30-24 2-28 14-30 30-2-16-6-28-30-30C26 30 30 18 32 2z" fill="#fff"/></svg>'
  };
  const FLOAT_DEFS = [[6, 14, 66, 1.0, 'chunk', 11], [86, 10, 54, .6, 'drop', 8], [92, 56, 70, 1.2, 'chunk', 13], [4, 66, 52, .8, 'salt', 9], [78, 84, 60, 1.0, 'drop', 10], [18, 88, 44, .5, 'star', 7], [50, 2, 40, .4, 'star', 6], [68, 22, 34, .7, 'salt', 12], [30, 4, 48, .9, 'drop', 9]];
  let hero = { cur: -1, timer: null, vis: true, imgs: [], list: [] };
  function buildHero() {
    hero.list = LIST.filter(p => p.status === 'active'); if (!hero.list.length) hero.list = LIST;
    const st = $('#hpStack'), dots = $('#heroDots'), fl = $('#floaters');
    st.innerHTML = ''; dots.innerHTML = ''; fl.innerHTML = '';
    hero.imgs = hero.list.map((p, i) => {
      const im = el('img', 'hp-img'); im.src = p.image; im.alt = ''; im.decoding = 'async'; im.draggable = false; if (i === 0) im.fetchPriority = 'high'; st.appendChild(im);
      const d = el('button', 'dot'); d.type = 'button'; d.style.setProperty('--dc', pc(p)); d.setAttribute('aria-label', p.name); d.onclick = () => { heroGo(i); heroTimer(); }; dots.appendChild(d);
      return im;
    });
    FLOAT_DEFS.forEach(([x, y, s, z, k, d]) => { const f = el('div', 'fl', SPRITES[k]); f.style.cssText = `--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s`; f.dataset.z = z; fl.appendChild(f); });
    hero.cur = -1; heroGo(0);
    $('#heroDots').parentElement.hidden = hero.list.length < 2;
  }
  function heroGo(i) {
    if (!hero.imgs.length) return;
    i = (i + hero.imgs.length) % hero.imgs.length; if (i === hero.cur) return;
    const prev = hero.imgs[hero.cur], next = hero.imgs[i], p = hero.list[i];
    if (prev) { prev.classList.remove('on'); prev.classList.add('out'); setTimeout(() => prev.classList.remove('out'), 1400); }
    requestAnimationFrame(() => next.classList.add('on'));
    hero.cur = i;
    const h = $('.hero'); h.style.setProperty('--hc', pc(p)); if (hero.vis) root.style.setProperty('--hc', pc(p));
    $$('#heroDots .dot').forEach((d, k) => d.classList.toggle('on', k === i));
    const nm = $('#heroName'); nm.textContent = p.name;
    if (G && !reduce) G.fromTo(nm, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'expo.out' });
  }
  function heroTimer() { clearInterval(hero.timer); if (hero.list.length > 1) hero.timer = setInterval(() => { if (hero.vis && !document.hidden) heroGo(hero.cur + 1); }, 4800); }

  /* ------------------------------------------------------------ showcase */
  const lastWord = n => { const w = String(n).trim().split(/\s+/); return w.length > 1 ? w[w.length - 1] : w[0]; };
  function buildShow() {
    const box = $('#chapters'); box.innerHTML = '';
    LIST.forEach((p, i) => {
      const soon = p.status === 'soon', badge = soon ? t('sc.soon') : p.badge;
      const a = el('article', 'ch' + (soon ? ' is-soon' : '')); a.dataset.i = i; a.dataset.slug = p.slug; a.style.setProperty('--c', pc(p)); a.style.setProperty('--c2', pc2(p));
      a.innerHTML = `<div class="ch-word" aria-hidden="true"><em>${esc(lastWord(p.name))}</em></div>
        <div class="ch-imgwrap" data-cursor="Boom"><span class="ch-ring"></span><div class="ch-img"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" draggable="false"></div></div>
        ${badge ? `<span class="ch-badge">${esc(badge)}</span>` : ''}
        <div class="ch-info"><p class="ch-n">${String(i + 1).padStart(2, '0')} — ${esc(t('sc.chapter'))}</p><h3>${esc(p.name)}</h3><p class="ch-tag">${esc(L(p.tagline))}</p>
        <ul class="chips">${[p.flavor, p.weight, p.category].filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <button class="btn btn-w" type="button" data-open="${esc(p.slug)}"><span>${esc(t('sc.details'))}</span><i class="arr">→</i></button></div>`;
      box.appendChild(a);
    });
    $('#stotal').textContent = String(LIST.length).padStart(2, '0');
    const nav = $('#showNav'); nav.innerHTML = '';
    LIST.forEach((p, i) => { const li = el('li'); li.title = p.name; li.dataset.i = i; nav.appendChild(li); });
    $('#products').hidden = !LIST.length;
  }

  /* ------------------------------------------------------------ news */
  function renderNews() {
    const g = $('#newsGrid'); g.innerHTML = '';
    const items = [...DATA.news];
    LIST.filter(p => p.status === 'soon').forEach(p => items.push({ soon: 1, date: p.createdAt, title: { uz: p.name, ru: p.name, en: p.name }, body: p.tagline, image: p.image }));
    $('#news').hidden = !items.length;
    items.forEach(n => {
      const c = el('article', 'ncard');
      const d = n.date ? new Date(n.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      c.innerHTML = `<div class="ncard-img">${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy" decoding="async">` : ''}</div><div class="ncard-body"><time>${esc(n.soon ? t('prod.soon') : d)}</time><h3>${esc(L(n.title))}</h3><p>${esc(L(n.body))}</p></div>`;
      g.appendChild(c);
    });
  }

  /* ------------------------------------------------------------ chocolate burst engine (canvas) */
  const fx = $('#fx'), fc = fx.getContext('2d'); let FW = 0, FH = 0, parts = [], fxRun = false;
  function fxSize() { const d = Math.min(devicePixelRatio || 1, 2); FW = innerWidth; FH = innerHeight; fx.width = FW * d; fx.height = FH * d; fc.setTransform(d, 0, 0, d, 0, 0); }
  fxSize(); addEventListener('resize', fxSize);
  function spawn(x, y, vx, vy, kind, size, life) {
    const pts = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * 6.283, r = .65 + Math.random() * .45; return [Math.cos(a) * r, Math.sin(a) * r]; });
    parts.push({ x, y, vx, vy, kind, s: size, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .3, life, max: life, pts });
  }
  function burst(x, y, n = 64, spread = 1) {
    if (reduce) return;
    const kinds = ['chunk', 'chunk', 'chunk', 'drop', 'drop', 'salt', 'salt', 'star'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, sp = (3 + Math.random() * 13) * spread;
      spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 5, kinds[(Math.random() * kinds.length) | 0], 5 + Math.random() * 15, 90 + Math.random() * 90);
    }
    runFx();
  }
  function rain(n = 36) {
    if (reduce) return;
    const kinds = ['chunk', 'drop', 'salt', 'star'];
    for (let i = 0; i < n; i++) spawn(Math.random() * FW, -30 - Math.random() * 300, (Math.random() - .5) * 2, 4 + Math.random() * 6, kinds[(Math.random() * 4) | 0], 6 + Math.random() * 14, 200);
    runFx();
  }
  function runFx() { if (!fxRun) { fxRun = true; requestAnimationFrame(fxTick); } }
  function fxTick() {
    fc.clearRect(0, 0, FW, FH);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.vy += .32; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      if (p.life <= 0 || p.y > FH + 60) { parts.splice(i, 1); continue; }
      fc.save(); fc.globalAlpha = clamp(p.life / 40, 0, 1); fc.translate(p.x, p.y); fc.rotate(p.rot);
      const s = p.s;
      if (p.kind === 'chunk') {
        fc.beginPath(); p.pts.forEach(([a, b], k) => k ? fc.lineTo(a * s, b * s) : fc.moveTo(a * s, b * s)); fc.closePath();
        fc.fillStyle = '#3a1b0d'; fc.fill(); fc.fillStyle = 'rgba(190,120,70,.55)'; fc.beginPath(); fc.moveTo(-s * .5, -s * .5); fc.lineTo(s * .4, -s * .6); fc.lineTo(0, 0); fc.closePath(); fc.fill();
      } else if (p.kind === 'drop') {
        fc.beginPath(); fc.moveTo(0, -s); fc.quadraticCurveTo(s, s * .2, 0, s); fc.quadraticCurveTo(-s, s * .2, 0, -s); fc.fillStyle = '#f2a526'; fc.fill();
        fc.fillStyle = 'rgba(255,240,170,.8)'; fc.beginPath(); fc.ellipse(-s * .3, s * .2, s * .15, s * .35, 0, 0, 6.28); fc.fill();
      } else if (p.kind === 'salt') {
        fc.fillStyle = '#f4f8ff'; fc.fillRect(-s * .4, -s * .4, s * .8, s * .8);
      } else {
        fc.fillStyle = '#fff'; fc.beginPath(); fc.moveTo(0, -s); fc.quadraticCurveTo(0, 0, s, 0); fc.quadraticCurveTo(0, 0, 0, s); fc.quadraticCurveTo(0, 0, -s, 0); fc.quadraticCurveTo(0, 0, 0, -s); fc.fill();
      }
      fc.restore();
    }
    if (parts.length && !document.hidden) requestAnimationFrame(fxTick); else fxRun = false;
  }

  /* ------------------------------------------------------------ tilt + parallax loop */
  let nx = 0, ny = 0, tx = 0, ty = 0, hasPtr = false;
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; hasPtr = true; nx = e.clientX / innerWidth - .5; ny = e.clientY / innerHeight - .5; }, { passive: true });
  function tiltLoop(now) {
    if (!reduce) {
      const sx = hasPtr ? nx : Math.sin(now / 2600) * .26, sy = hasPtr ? ny : Math.cos(now / 3100) * .16;
      tx += (sx - tx) * .07; ty += (sy - ty) * .07;
      const ry = (tx * 22).toFixed(2) + 'deg', rx = (-ty * 16).toFixed(2) + 'deg';
      const ht = $('#hpTilt'); if (ht) { ht.style.setProperty('--rx', rx); ht.style.setProperty('--ry', ry); }
      $$('.ch-img').forEach(c => { c.style.setProperty('--rx', rx); c.style.setProperty('--ry', ry); });
      $$('.fl').forEach(f => { const z = +f.dataset.z || .5; f.style.transform = `translate3d(${(-tx * z * 70).toFixed(1)}px,${(-ty * z * 70).toFixed(1)}px,0)`; });
      $$('.ht em').forEach((e, i) => { if (!e.dataset.lock) e.style.translate = `${(tx * (i ? 26 : -26)).toFixed(1)}px 0`; });
    }
    requestAnimationFrame(tiltLoop);
  }

  /* ------------------------------------------------------------ globe */
  const GEO = { 'central asia': [43.2, 76.9], cis: [55.7, 37.6], 'middle east': [25.2, 55.3], europe: [52.5, 13.4], russia: [55.7, 37.6], kazakhstan: [51.1, 71.4], turkey: [41, 28.9], uae: [25.2, 55.3], china: [39.9, 116.4], india: [28.6, 77.2], usa: [38.9, -77], germany: [52.5, 13.4], 'asia': [22, 114], africa: [6.5, 3.4] };
  function geoFor(name) {
    const k = String(name).toLowerCase().trim(); if (GEO[k]) return GEO[k];
    let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return [-35 + (h % 1000) / 1000 * 85, -150 + ((h >> 8) % 1000) / 1000 * 300];
  }
  const glb = { run: false, vis: false, regs: [], pts: [], phi: 1.3, w: 0, raf: 0, t0: 0 };
  function globeInit() {
    const cv = $('#globe'); if (!cv) return; glb.cv = cv; glb.ctx = cv.getContext('2d');
    glb.pts = []; const N = 2300, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; glb.pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth; cv.width = w * d; cv.height = w * d; glb.ctx.setTransform(d, 0, 0, d, 0, 0); glb.w = w; };
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => { glb.vis = es[0].isIntersecting; if (glb.vis && !glb.run) { glb.run = true; glb.t0 = performance.now(); requestAnimationFrame(globeTick); } }, { threshold: .05 }).observe(cv);
  }
  const ll = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  function globeTick(now) {
    if (!glb.vis || document.hidden) { glb.run = false; return; }
    const c = glb.ctx, W = glb.w, R = W * .42, cx = W / 2, cy = W / 2;
    const el0 = (now - glb.t0) / 1000; glb.phi = -1.21 + Math.sin(el0 * .22) * .8; const cp = Math.cos(glb.phi), sp = Math.sin(glb.phi), tilt = .42, ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = v => { let [x, y, z] = v; const x1 = x * cp + z * sp, z1 = -x * sp + z * cp; const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct; return [cx + x1 * R, cy - y2 * R, z2]; };
    const col = getComputedStyle(root).getPropertyValue('--hc').trim() || '#1f63ff';
    c.clearRect(0, 0, W, W);
    const g = c.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.25); g.addColorStop(0, col + '55'); g.addColorStop(.7, col + '18'); g.addColorStop(1, 'transparent');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R * 1.25, 0, 6.283); c.fill();
    c.fillStyle = '#fff';
    for (const p of glb.pts) { const q = proj(p); const a = q[2] > 0 ? .25 + q[2] * .6 : .05; c.globalAlpha = a; c.fillRect(q[0], q[1], q[2] > 0 ? 2 : 1.2, q[2] > 0 ? 2 : 1.2); }
    c.globalAlpha = 1;
    const home = ll(41.3, 69.3), elapsed = (now - glb.t0) / 1000;
    glb.regs.forEach((r, i) => {
      const dest = ll(r[0], r[1]), prog = clamp(((elapsed * .35 - i * .18) % 2.2), 0, 1.4);
      const dot = Math.acos(clamp(home[0] * dest[0] + home[1] * dest[1] + home[2] * dest[2], -1, 1)) || .01, steps = 48;
      c.beginPath(); let started = false, head = null;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps; if (u > Math.min(prog, 1)) break;
        const a = Math.sin((1 - u) * dot) / Math.sin(dot), b = Math.sin(u * dot) / Math.sin(dot), lift = 1 + Math.sin(u * Math.PI) * .22;
        const v = [(a * home[0] + b * dest[0]) * lift, (a * home[1] + b * dest[1]) * lift, (a * home[2] + b * dest[2]) * lift];
        const q = proj(v); head = q; if (q[2] < -.15) { started = false; continue; } if (!started) { c.moveTo(q[0], q[1]); started = true; } else c.lineTo(q[0], q[1]);
      }
      c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.globalAlpha = .85; c.stroke(); c.globalAlpha = 1;
      if (head && head[2] > 0) { c.fillStyle = '#fff'; c.beginPath(); c.arc(head[0], head[1], 3.5, 0, 6.283); c.fill(); }
      const q = proj(dest); if (q[2] > 0) { const pr = (elapsed * 1.2 + i) % 1; c.strokeStyle = '#fff'; c.globalAlpha = 1 - pr; c.beginPath(); c.arc(q[0], q[1], 3 + pr * 14, 0, 6.283); c.stroke(); c.globalAlpha = 1; c.fillStyle = col; c.beginPath(); c.arc(q[0], q[1], 4.5, 0, 6.283); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); }
    });
    const h = proj(home); if (h[2] > -.1) { const pr = (elapsed * .8) % 1; c.strokeStyle = '#fff'; c.globalAlpha = 1 - pr; c.beginPath(); c.arc(h[0], h[1], 6 + pr * 22, 0, 6.283); c.stroke(); c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.arc(h[0], h[1], 6, 0, 6.283); c.fill(); }
    requestAnimationFrame(globeTick);
  }

  /* ------------------------------------------------------------ modal */
  const modal = $('#modal'); let lastFocus = null;
  function openProduct(slug, push = true) {
    const p = DATA.products.find(x => x.slug === slug); if (!p) return;
    lastFocus = document.activeElement;
    $('#mImg').src = p.image; $('#mImg').alt = p.name;
    $('#mCat').textContent = p.category || ''; $('#mTitle').textContent = p.name;
    $('#mTag').textContent = p.status === 'soon' ? t('prod.soon') : (L(p.tagline) || ''); $('#mDesc').textContent = L(p.desc);
    const meta = $('#mMeta'); meta.innerHTML = '';
    [['m.flavor', p.flavor], ['m.weight', p.weight], ['m.cat', p.category]].forEach(([k, v]) => { if (v) meta.insertAdjacentHTML('beforeend', `<dt>${esc(t(k))}</dt><dd>${esc(v)}</dd>`); });
    $('#mCta').style.display = p.status === 'soon' ? 'none' : '';
    modal.hidden = false; document.body.classList.add('noscroll'); if (lenis) lenis.stop();
    requestAnimationFrame(() => { modal.classList.add('open'); $('.modal-x', modal).focus(); });
    if (push) history.pushState({ p: slug }, '', '/product/' + slug);
  }
  function closeModal(pop = false) {
    if (modal.hidden) return;
    modal.classList.remove('open'); setTimeout(() => { modal.hidden = true; }, 450);
    document.body.classList.remove('noscroll'); if (lenis && !$('#menu').classList.contains('open')) lenis.start();
    if (!pop && /^\/product\//.test(location.pathname)) history.pushState({}, '', '/');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab' && !modal.hidden) { const f = $$('button,a[href]', modal).filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  addEventListener('popstate', () => { const m = /^\/product\/([\w-]+)/.exec(location.pathname); if (m) openProduct(m[1], false); else closeModal(true); });
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { openProduct(o.dataset.open); return; }
    const w = e.target.closest('.ch-imgwrap'); if (w) { const r = w.getBoundingClientRect(); burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 80, 1.1); return; }
    const hp = e.target.closest('#heroProd'); if (hp) burst(e.clientX, e.clientY, 60, 1);
  });

  /* ------------------------------------------------------------ form */
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
      note.textContent = t('f.ok'); form.reset(); const b = btn.getBoundingClientRect(); burst(b.left + b.width / 2, b.top, 50, 1);
    } catch (err) { note.textContent = t('f.fail'); note.classList.add('bad'); }
    btn.disabled = false;
  });

  /* ------------------------------------------------------------ chrome: header, menu, lang, anchors */
  const header = $('#header'), burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    burger.classList.toggle('open', open); menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('noscroll', open); if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  $('#lang').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); });
  function setLang(l) { if (!I[l] || l === lang) return; lang = l; store.set('lang', l); renderAll(false); }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return; const tgt = $(id); if (!tgt) return; e.preventDefault();
    if (lenis) lenis.scrollTo(tgt, { offset: 0, duration: 1.8 }); else tgt.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------ GSAP scenes */
  function splitText(elm) {
    const text = elm.textContent.trim(); elm.setAttribute('aria-label', text); elm.textContent = '';
    text.split(/\s+/).forEach((w, wi, arr) => {
      const wd = el('span', 'wd'); wd.setAttribute('aria-hidden', 'true');
      [...w].forEach(ch => { const c = el('span', 'sc'); c.innerHTML = '<i>' + esc(ch) + '</i>'; wd.appendChild(c); });
      elm.appendChild(wd); if (wi < arr.length - 1) elm.appendChild(document.createTextNode(' '));
    });
    return $$('.sc>i', elm);
  }
  function killAnim() { if (ctx) { ctx.revert(); ctx = null; } root.classList.remove('is-anim'); }

  function build() {
    if (!G || !ST || reduce) { finishNoAnim(); return; }
    killAnim(); root.classList.add('is-anim');
    ctx = G.context(() => {
      /* pinned product universe */
      const chs = $$('.ch'), n = chs.length;
      if (n > 0) {
        const step = 1.5, prog = $('#sprog'), cur = $('#scur'), navs = $$('#showNav li');
        let idx = -1;
        const setIdx = i => {
          if (i === idx) return; const first = idx < 0; idx = i;
          cur.textContent = String(i + 1).padStart(2, '0'); navs.forEach((x, k) => x.classList.toggle('on', k === i));
          root.style.setProperty('--hc', pc(LIST[i]));
          if (!first) { burst(innerWidth / 2, innerHeight * .52, 70, 1.15); rain(26); }
        };
        if (n > 1) {
          G.set(chs.slice(1), { clipPath: 'circle(0% at 50% 62%)' });
          const tl = G.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
            trigger: '#products', start: 'top top', end: () => '+=' + Math.round((n - 1) * innerHeight * 1.15), pin: '#showPin', scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: s => { prog.style.transform = `scaleX(${s.progress})`; setIdx(clamp(Math.round(s.progress * (n - 1)), 0, n - 1)); }
          } });
          for (let i = 1; i < n; i++) {
            const pos = (i - 1) * step, cur = chs[i], pv = chs[i - 1];
            tl.fromTo(cur, { clipPath: 'circle(0% at 50% 62%)' }, { clipPath: 'circle(150% at 50% 62%)', duration: 1, ease: 'power2.inOut' }, pos)
              .fromTo($('.ch-imgwrap', cur), { scale: .45, rotation: -16, yPercent: 26 }, { scale: 1, rotation: 0, yPercent: 0, duration: 1.1, ease: 'power3.out' }, pos + .25)
              .fromTo($('.ch-word em', cur), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'power3.out' }, pos + .2)
              .fromTo([...$('.ch-info', cur).children, $('.ch-badge', cur)].filter(Boolean), { y: 70, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, duration: .6, ease: 'power3.out' }, pos + .55)
              .to($('.ch-imgwrap', pv), { scale: 1.3, rotation: 12, opacity: 0, duration: 1, ease: 'power2.in' }, pos)
              .to($('.ch-info', pv), { opacity: 0, y: -50, duration: .5 }, pos)
              .to($('.ch-word em', pv), { yPercent: -60, opacity: 0, duration: 1 }, pos);
          }
          tl.to({}, { duration: step - 1 + .3 });
        } else setIdx(0);
        setIdx(0);
      }
      /* headings */
      $$('.split').forEach(h => { const chars = splitText(h); G.from(chars, { yPercent: 118, stagger: .02, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } }); });
      /* reveals */
      [['.kicker'], ['.lead'], ['.stat'], ['.prow a'], ['.ncard'], ['.regions li'], ['.cinfo li'], ['.form'], ['.bigphone'], ['.fstep p']].forEach(([s]) => $$(s).forEach((n, i) => G.from(n, { y: 60, opacity: 0, duration: 1.1, delay: (i % 4) * .06, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 92%', once: true } })));
      /* factory */
      $$('.fstep').forEach(s => ST.create({ trigger: s, start: 'top 68%', end: 'bottom 32%', onToggle: x => s.classList.toggle('on', x.isActive) }));
      /* counters */
      $$('#stats b').forEach(b => { const end = +b.dataset.n || 0, suf = b.dataset.s || '', o = { v: 0 }; b.textContent = '0' + suf; ST.create({ trigger: b, start: 'top 92%', once: true, onEnter: () => G.to(o, { v: end, duration: 2.4, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v) + suf; } }) }); });
      /* marquee skew by velocity */
      const track = $('#bigMarq'), sk = G.quickTo(track, 'skewX', { duration: .5, ease: 'power3' }); let skT;
      ST.create({ trigger: document.body, start: 0, end: 'max', onUpdate: s => { sk(clamp(s.getVelocity() / -260, -14, 14)); clearTimeout(skT); skT = setTimeout(() => sk(0), 120); } });
      /* hero parallax out */
      G.to('.hero-type', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      G.to('.hero-prod', { yPercent: -8, scale: .92, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      G.to('.footer-word', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
      ['.bigmarq', '.factory'].forEach(s => { const e = $(s); if (e) ST.create({ trigger: e, start: 'top 40px', end: 'bottom 40px', onToggle: x => header.classList.toggle('light', x.isActive) }); });
      ST.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: s => { hero.vis = s.isActive; if (s.isActive && hero.list[hero.cur]) root.style.setProperty('--hc', pc(hero.list[hero.cur])); } });
    });
    ST.refresh();
  }
  function finishNoAnim() {
    killAnim();
    $$('#stats b').forEach(b => { b.textContent = (+b.dataset.n || 0) + (b.dataset.s || ''); });
    $$('.fstep').forEach(s => s.classList.add('on'));
  }

  function heroIntro() {
    if (!G || reduce) return;
    G.from('.ht em', { yPercent: 115, duration: 1.5, stagger: .14, ease: 'expo.out' });
    G.from('#hpTilt', { scale: .4, rotation: -20, opacity: 0, duration: 1.8, ease: 'expo.out', delay: .15 });
    G.from('.fl', { scale: 0, opacity: 0, duration: 1.2, stagger: .08, ease: 'back.out(2)', delay: .5 });
    G.from('.hero-meta > *', { y: 50, opacity: 0, duration: 1.1, stagger: .12, ease: 'expo.out', delay: .7 });
    G.from('.hero-pick, .badge', { opacity: 0, scale: .6, duration: 1, ease: 'expo.out', delay: .9 });
    burst(innerWidth / 2, innerHeight / 2, 90, 1.3);
  }

  /* ------------------------------------------------------------ pointer fx */
  function pointerFx() {
    if (!fine || reduce || !G) return;
    const cur = $('#cursor'), lab = $('span', cur);
    const xs = G.quickTo(cur, 'x', { duration: .22, ease: 'power3' }), ys = G.quickTo(cur, 'y', { duration: .22, ease: 'power3' });
    addEventListener('pointermove', e => { cur.classList.add('on'); xs(e.clientX); ys(e.clientY); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    document.addEventListener('pointerover', e => {
      const d = e.target.closest('[data-cursor]'), link = e.target.closest('a,button,.dot,.lang');
      cur.classList.toggle('big', !!d); cur.classList.toggle('link', !d && !!link); if (d) lab.textContent = d.dataset.cursor;
    });
    document.addEventListener('pointermove', e => {
      const b = e.target.closest('.magnetic'); if (!b) return; const r = b.getBoundingClientRect();
      G.to(b, { '--bx': (e.clientX - r.left - r.width / 2) * .3 + 'px', '--by': (e.clientY - r.top - r.height / 2) * .4 + 'px', duration: .5, ease: 'power3.out', overwrite: 'auto' });
    });
    document.addEventListener('pointerout', e => { const b = e.target.closest('.magnetic'); if (b && !b.contains(e.relatedTarget)) G.to(b, { '--bx': '0px', '--by': '0px', duration: .9, ease: 'elastic.out(1,.4)', overwrite: 'auto' }); });
  }

  /* ------------------------------------------------------------ render pipeline */
  function renderAll(first) {
    killAnim();
    applyStatic(); renderSettings();
    LIST = DATA.products.filter(p => p.status !== 'hidden');
    buildHero(); buildShow(); renderNews();
    glb.regs = (DATA._regs || []).map(geoFor);
    $('#year').textContent = new Date().getFullYear();
    build();
    if (!first) { ST && ST.refresh(); heroTimer(); }
  }

  function runLoader(total, progressRef, done) {
    const num = $('#loaderNum'), loader = $('#loader'); let shown = 0, finished = false; const t0 = performance.now();
    const cols = LIST.map(pc); let ci = 0;
    const cyc = setInterval(() => { if (cols.length) root.style.setProperty('--hc', cols[ci++ % cols.length]); }, 420);
    (function tick(now) {
      const target = total ? progressRef.v / total * 100 : 100, minDone = now - t0 > (reduce ? 50 : 1700);
      shown += (Math.min(target, minDone ? 100 : 94) - shown) * .1 + .12; shown = Math.min(shown, 100);
      num.textContent = Math.round(shown);
      if ((shown >= 99.4 && minDone) || now - t0 > 7000) {
        if (finished) return; finished = true; num.textContent = 100; clearInterval(cyc);
        setTimeout(() => { loader.classList.add('done'); root.classList.remove('is-loading'); done(); }, 250); return;
      }
      requestAnimationFrame(tick);
    })(t0);
  }

  async function boot() {
    const nl = (navigator.language || '').toLowerCase();
    lang = I[store.get('lang')] ? store.get('lang') : (nl.startsWith('ru') ? 'ru' : nl.startsWith('en') ? 'en' : 'uz');
    DATA = await loadData();
    G = window.gsap; ST = window.ScrollTrigger;
    if (G && ST) {
      G.registerPlugin(ST);
      if (window.Lenis && !reduce) {
        lenis = new window.Lenis({ duration: 1.2, smoothWheel: true, syncTouch: false });
        lenis.on('scroll', ST.update); G.ticker.add(tm => lenis.raf(tm * 1000)); G.ticker.lagSmoothing(0);
      }
      ST.config({ ignoreMobileResize: true });
    }
    const visible = DATA.products.filter(p => p.status !== 'hidden');
    LIST = visible;
    const ref = { v: 0 };
    runLoader(visible.length, ref, () => { heroIntro(); const m = /^\/product\/([\w-]+)/.exec(location.pathname); if (m) openProduct(m[1], false); });
    await preload(visible, () => { ref.v++; });
    renderAll(true); heroTimer();
    globeInit(); pointerFx(); requestAnimationFrame(tiltLoop);
    new IntersectionObserver(es => { hero.vis = es[0].isIntersecting; }, { threshold: .15 }).observe($('.hero'));

    let lastY = 0; const pb = $('#pbar');
    const onScroll = () => {
      const y = scrollY, max = root.scrollHeight - innerHeight;
      pb.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      header.classList.toggle('hide', y > lastY + 6 && y > 500 && !menu.classList.contains('open')); if (y < lastY - 6) header.classList.remove('hide'); lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST && ST.refresh());
    addEventListener('load', () => ST && ST.refresh());
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ST && ST.refresh(), 250); });
  }

  const start = () => boot().catch(err => { console.error(err); root.classList.remove('is-loading', 'is-anim'); $('#loader').classList.add('done'); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
