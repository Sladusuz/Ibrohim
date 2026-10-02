/* BabuSweet front-end — multi-page, serverless. Every page works without GSAP/Lenis (animation is progressive). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = window.BS_I18N || { uz: {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;
  const PAGE = document.body.dataset.page;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    sget: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const safeHref = u => (/^(https?:\/\/|\/|tel:|mailto:)/i.test(u || '') ? u : '#');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const qs = new URLSearchParams(location.search);

  let G = null, ST = null, lenis = null, ctx = null;
  let lang = 'uz', DATA = null, LIST = [];
  const t = k => (I[lang] && I[lang][k]) || I.uz[k] || '';
  const L = o => (o && (o[lang] || o.uz || o.en || o.ru)) || '';

  /* ------------------------------------------------------------ data */
  const FALLBACK = { settings: { brand: 'BabuSweet', phone: '+998 33 623 33 13', address: 'Yangihayot, Sputnik-17, 52a, 100102, Tashkent, Tashkent Region', hours: {}, social: {}, hero: {}, stats: [], exportRegions: [] }, products: [], news: [] };
  function loadData() {
    const norm = window.BS_normalize || (x => x);
    let d = null, draft = false;
    const live = norm(window.BS_DATA || {});
    try {
      const raw = localStorage.getItem('bs_draft');
      if (raw) {
        const x = norm(JSON.parse(raw));
        if (x._v && x._v === live._v) { localStorage.removeItem('bs_draft'); } // draft was published -> live data is current
        else if (x.products.length || x.news.length || Object.keys(x.settings).length) { d = x; draft = true; }
      }
    } catch (e) { /* ignore broken draft */ }
    if (!d) d = live;
    LANGS_KEYS.forEach(l => { if (I[l] && d.texts && d.texts[l]) Object.assign(I[l], d.texts[l]); });
    d.products = d.products.filter(p => p.status !== 'hidden').sort((a, b) => (a.order || 0) - (b.order || 0));
    d.news = d.news.filter(n => n.published).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    d._draft = draft;
    return d;
  }
  const LANGS_KEYS = ['uz', 'ru', 'en'];
  const absUrl = path => { const dom = DATA && DATA.settings && DATA.settings.domain; if (/^(https?:|data:)/.test(path)) return path; try { return dom ? dom + '/' + String(path).replace(/^\//, '') : new URL(path, location.href).href; } catch (e) { return path; } };
  function canonicalTags() {
    const dom = DATA.settings.domain; if (!dom) return;
    const file = location.pathname.split('/').pop() || 'index.html';
    const page = file === 'index.html' ? '' : file, q = PAGE === 'product' && qs.get('p') ? '?p=' + encodeURIComponent(qs.get('p')) : '';
    const href = dom + '/' + page + q;
    let l = $('link[rel=canonical]'); if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); } l.href = href;
    let u = $('meta[property="og:url"]'); if (!u) { u = document.createElement('meta'); u.setAttribute('property', 'og:url'); document.head.appendChild(u); } u.content = href;
    const og = $('meta[property="og:image"]'); if (og && !/^https?:/.test(og.content) && !/^data:/.test(og.content)) og.content = dom + '/' + og.content.replace(/^\//, '');
  }
  const hex2rgb = h => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [31, 99, 255]; };
  const pc = p => (p && p.color) || '#1f63ff';
  const pc2 = p => { if (p && p.color2) return p.color2; const [r, g, b] = hex2rgb(pc(p)); return '#' + [r, g, b].map(v => Math.round(v * .3).toString(16).padStart(2, '0')).join(''); };
  const imgOf = (p, thumb) => (thumb && p.thumb) || p.image;
  const lastWord = n => { const w = String(n).trim().split(/\s+/); return w.length > 1 ? w[w.length - 1] : w[0]; };
  const prodUrl = p => 'product.html?p=' + encodeURIComponent(p.slug);

  /* ------------------------------------------------------------ static text + settings */
  function applyStatic() {
    root.lang = lang;
    $$('[data-t]').forEach(n => { const v = t(n.dataset.t); if (v) n.textContent = v; });
    $$('[data-tp]').forEach(n => { n.placeholder = t(n.dataset.tp); });
    $$('#lang button').forEach(b => { const on = b.dataset.lang === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    const bt = $('#badgeText'); if (bt) bt.textContent = t('hero.badge');
  }
  function renderSettings() {
    const s = DATA.settings;
    const tel = (s.phone || '').replace(/[^\d+]/g, '');
    $$('.js-phone').forEach(a => { if (!a.classList.contains('call')) a.textContent = s.phone; else { const sp = $('.call-t', a); if (sp) sp.textContent = s.phone; } a.href = 'tel:' + tel; });
    $$('.js-address').forEach(a => { a.textContent = s.address; });
    const ht = $('#heroTitle'); if (ht) ht.textContent = L(s.hero && s.hero.title) || ht.textContent;
    const hl = $('#heroLead'); if (hl) hl.textContent = L(s.hero && s.hero.lead) || '';
    const hrs = $('#hours'); if (hrs) { hrs.textContent = L(s.hours) || ''; $('#hoursRow').hidden = !L(s.hours); }
    const em = $('#emailRow'); if (em) { em.hidden = !s.email; if (s.email) { const a = $('#emailLink'); a.textContent = s.email; a.href = 'mailto:' + s.email; } }
    const ml = $('#mapLink'); if (ml) ml.href = safeHref(s.mapUrl);
    const soc = $('#socials');
    if (soc) { soc.innerHTML = ''; Object.entries(s.social || {}).forEach(([k, u]) => { if (u) { const a = el('a', '', esc(k)); a.href = safeHref(u); a.target = '_blank'; a.rel = 'noopener noreferrer'; soc.appendChild(a); } }); soc.hidden = !soc.children.length; }
    document.title = document.title; // title is per page (static) or set by product page
    const mq = $('#bigMarq');
    if (mq) { const words = [s.brand || 'BabuSweet', 'Real Chocolate Inside', 'Sea Salt Caramel', 'Export Quality', 'Made in Uzbekistan']; mq.innerHTML = ''; for (let r = 0; r < 4; r++) words.forEach(w => mq.appendChild(el('span', '', esc(w)))); }
    const sg = $('#stats');
    if (sg) { sg.innerHTML = ''; (s.stats || []).slice(0, 4).forEach(x => { const d = el('div', 'stat'); d.innerHTML = `<b data-n="${+x.value || 0}" data-s="${esc(x.suffix || '')}">${+x.value || 0}${esc(x.suffix || '')}</b><span>${esc(L(x.label))}</span>`; sg.appendChild(d); }); }
    const regs = (s.exportRegions && s.exportRegions.length ? s.exportRegions : ['Central Asia', 'CIS', 'Middle East', 'Europe']).slice(0, 8);
    const ul = $('#regions'); if (ul) { ul.innerHTML = ''; regs.forEach(r => ul.appendChild(el('li', '', esc(r)))); }
    DATA._regs = regs;
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------ product card */
  function cardHTML(p) {
    const soon = p.status === 'soon', badge = soon ? t('cat.soon') : p.badge;
    const meta = [p.flavor, p.weight].filter(Boolean).join(' · ');
    return `<a class="pcard${soon ? ' is-soon' : ''}${p.bg ? ' has-bg' : ''}" href="${esc(prodUrl(p))}" style="--c:${esc(pc(p))};--c2:${esc(pc2(p))}" data-slug="${esc(p.slug)}">
      ${badge ? `<span class="pc-badge">${esc(badge)}</span>` : ''}
      <span class="pc-img"><img src="${esc(imgOf(p, true))}" alt="${esc(p.name)}" loading="lazy" decoding="async" draggable="false"></span>
      <span class="pc-info"><span><h3>${esc(p.name)}</h3><p>${esc(meta || L(p.tagline))}</p></span><i class="pc-go" aria-hidden="true">→</i></span></a>`;
  }
  const renderCards = (host, list) => { host.innerHTML = list.map(cardHTML).join(''); };

  /* ------------------------------------------------------------ chocolate burst engine (canvas) */
  const fx = $('#fx'), fc = fx.getContext('2d'); let FW = 0, FH = 0, parts = [], fxRun = false;
  function fxSize() { const d = Math.min(devicePixelRatio || 1, 2); FW = innerWidth; FH = innerHeight; fx.width = FW * d; fx.height = FH * d; fc.setTransform(d, 0, 0, d, 0, 0); }
  fxSize(); addEventListener('resize', fxSize);
  function spawn(x, y, vx, vy, kind, size, life) {
    const pts = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * 6.283, r = .65 + Math.random() * .45; return [Math.cos(a) * r, Math.sin(a) * r]; });
    parts.push({ x, y, vx, vy, kind, s: size, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .3, life, pts });
  }
  function burst(x, y, n = 64, spread = 1) {
    if (reduce) return;
    const kinds = ['chunk', 'chunk', 'chunk', 'drop', 'drop', 'salt', 'salt', 'star'];
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = (3 + Math.random() * 13) * spread; spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 5, kinds[(Math.random() * kinds.length) | 0], 5 + Math.random() * 15, 90 + Math.random() * 90); }
    runFx();
  }
  function rain(n = 30) {
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
      fc.save(); fc.globalAlpha = clamp(p.life / 40, 0, 1); fc.translate(p.x, p.y); fc.rotate(p.rot); const s = p.s;
      if (p.kind === 'chunk') {
        fc.beginPath(); p.pts.forEach(([a, b], k) => k ? fc.lineTo(a * s, b * s) : fc.moveTo(a * s, b * s)); fc.closePath(); fc.fillStyle = '#3a1b0d'; fc.fill();
        fc.fillStyle = 'rgba(190,120,70,.55)'; fc.beginPath(); fc.moveTo(-s * .5, -s * .5); fc.lineTo(s * .4, -s * .6); fc.lineTo(0, 0); fc.closePath(); fc.fill();
      } else if (p.kind === 'drop') {
        fc.beginPath(); fc.moveTo(0, -s); fc.quadraticCurveTo(s, s * .2, 0, s); fc.quadraticCurveTo(-s, s * .2, 0, -s); fc.fillStyle = '#f2a526'; fc.fill();
        fc.fillStyle = 'rgba(255,240,170,.8)'; fc.beginPath(); fc.ellipse(-s * .3, s * .2, s * .15, s * .35, 0, 0, 6.28); fc.fill();
      } else if (p.kind === 'salt') { fc.fillStyle = '#f4f8ff'; fc.fillRect(-s * .4, -s * .4, s * .8, s * .8); }
      else { fc.fillStyle = '#fff'; fc.beginPath(); fc.moveTo(0, -s); fc.quadraticCurveTo(0, 0, s, 0); fc.quadraticCurveTo(0, 0, 0, s); fc.quadraticCurveTo(0, 0, -s, 0); fc.quadraticCurveTo(0, 0, 0, -s); fc.fill(); }
      fc.restore();
    }
    if (parts.length && !document.hidden) requestAnimationFrame(fxTick); else fxRun = false;
  }

  /* ------------------------------------------------------------ 3D tilt + floaters parallax loop */
  let nx = 0, ny = 0, tx = 0, ty = 0, hasPtr = false;
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; hasPtr = true; nx = e.clientX / innerWidth - .5; ny = e.clientY / innerHeight - .5; }, { passive: true });
  function tiltLoop(now) {
    if (!reduce) {
      const sx = hasPtr ? nx : Math.sin(now / 2600) * .26, sy = hasPtr ? ny : Math.cos(now / 3100) * .16;
      tx += (sx - tx) * .07; ty += (sy - ty) * .07;
      const ry = (tx * 20).toFixed(2) + 'deg', rx = (-ty * 14).toFixed(2) + 'deg';
      ['#stageTilt', '#showTilt', '#pdpTilt'].forEach(s => { const e = $(s); if (e) { e.style.setProperty('--rx', rx); e.style.setProperty('--ry', ry); } });
      $$('.fl').forEach(f => { const z = +f.dataset.z || .5; f.style.transform = `translate3d(${(-tx * z * 70).toFixed(1)}px,${(-ty * z * 70).toFixed(1)}px,0)`; });
    }
    requestAnimationFrame(tiltLoop);
  }

  /* ------------------------------------------------------------ image swap (shared by hero + showcase) */
  function swapImgs(imgs, from, to, dir) {
    imgs.forEach((im, k) => { if (k !== from && k !== to) { if (G) G.killTweensOf(im); im.style.visibility = 'hidden'; } });
    const next = imgs[to], prev = from >= 0 ? imgs[from] : null;
    if (!G || reduce || !prev || prev === next) {
      imgs.forEach((im, k) => { if (G) { G.killTweensOf(im); G.set(im, { clearProps: 'all' }); } im.style.visibility = k === to ? 'visible' : 'hidden'; im.style.opacity = 1; });
      return;
    }
    G.killTweensOf([prev, next]);
    G.set(next, { visibility: 'visible', opacity: 0, x: dir * 240, y: 60, rotation: dir * 14, scale: .8 });
    G.to(prev, { x: -dir * 220, y: -70, rotation: -dir * 16, opacity: 0, scale: .84, duration: .55, ease: 'power3.in', onComplete: () => { prev.style.visibility = 'hidden'; } });
    G.to(next, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.05, ease: 'back.out(1.3)', delay: .22 });
  }

  /* ------------------------------------------------------------ SPRITES for floaters */
  const SPRITES = {
    chunk: '<svg viewBox="0 0 64 64"><path d="M9 24 30 6l25 8 4 25-19 20-27-8z" fill="#3a1b0d"/><path d="M30 6l25 8-14 14-24-4z" fill="#8b5230"/><path d="M41 28 55 14l4 25-19 20z" fill="#24100a"/></svg>',
    drop: '<svg viewBox="0 0 64 64"><path d="M32 4C32 4 12 28 12 41a20 20 0 0 0 40 0C52 28 32 4 32 4z" fill="#f2a526"/><ellipse cx="24" cy="38" rx="5" ry="9" fill="#ffe08a" opacity=".8"/></svg>',
    salt: '<svg viewBox="0 0 64 64"><path d="M32 4 58 30 32 60 6 30z" fill="#f4f8ff"/><path d="M32 4 58 30H6z" fill="#fff"/><path d="M32 60 58 30 32 34z" fill="#c9d6ee"/></svg>',
    star: '<svg viewBox="0 0 64 64"><path d="M32 2c2 16 6 28 30 30-24 2-28 14-30 30-2-16-6-28-30-30C26 30 30 18 32 2z" fill="#fff"/></svg>'
  };
  const FLOAT_DEFS = [[2, 10, 62, 1.0, 'chunk', 11], [88, 70, 66, 1.1, 'chunk', 13], [8, 76, 46, .8, 'salt', 9], [76, 4, 52, .7, 'drop', 8], [94, 36, 40, .6, 'star', 7], [24, 2, 38, .5, 'star', 6], [60, 88, 50, .9, 'drop', 10], [40, 92, 34, .7, 'salt', 12]];

  /* ============================================================ PAGES */
  const hero = { list: [], cur: -1, timer: null, vis: true, imgs: [] };
  function heroBuild() {
    const stack = $('#stageStack'); if (!stack) return;
    hero.list = LIST.filter(p => p.status === 'active'); if (!hero.list.length) hero.list = LIST;
    stack.innerHTML = ''; $('#picks').innerHTML = ''; $('#floaters').innerHTML = '';
    hero.imgs = hero.list.map((p, i) => {
      const im = el('img'); im.src = p.image; im.alt = p.name; im.decoding = 'async'; im.draggable = false; im.style.visibility = 'hidden'; if (i === 0) im.fetchPriority = 'high'; stack.appendChild(im);
      const b = el('button', 'pick', `<img src="${esc(imgOf(p, true))}" alt="" draggable="false"><span>${esc(lastWord(p.name))}</span><i></i>`); b.type = 'button'; b.setAttribute('aria-label', p.name);
      b.onclick = () => { heroGo(i); heroTimer(); }; $('#picks').appendChild(b); return im;
    });
    FLOAT_DEFS.forEach(([x, y, s, z, k, d]) => { const f = el('div', 'fl', SPRITES[k]); f.style.cssText = `--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s`; f.dataset.z = z; $('#floaters').appendChild(f); });
    $('#picker').hidden = hero.list.length < 2;
    hero.cur = -1; heroGo(0, true);
  }
  function heroGo(i, first) {
    if (!hero.imgs.length) return;
    i = (i + hero.imgs.length) % hero.imgs.length; if (i === hero.cur && !first) return;
    const from = hero.cur, dir = i > from || (from === hero.imgs.length - 1 && i === 0) ? 1 : -1;
    hero.cur = i; const p = hero.list[i];
    $('.hero').style.setProperty('--hc', pc(p)); if (hero.vis) root.style.setProperty('--hc', pc(p));
    swapImgs(hero.imgs, first ? -1 : from, i, dir);
    $$('#picks .pick').forEach((b, k) => { b.classList.remove('on'); if (k === i) { void b.offsetWidth; b.classList.add('on'); } });
  }
  function heroTimer() { clearInterval(hero.timer); if (hero.list.length > 1) hero.timer = setInterval(() => { if (hero.vis && !document.hidden) heroGo(hero.cur + 1); }, 5400); }
  function heroIntro() {
    if (!G || reduce || !hero.imgs.length) return;
    const first = hero.imgs[0];
    const tl = G.timeline();
    tl.from('.hero-copy > *', { y: 60, opacity: 0, stagger: .1, duration: 1.1, ease: 'expo.out', clearProps: 'all' }, .1)
      .from('#disk', { scale: 0, duration: 1.4, ease: 'elastic.out(1,.6)' }, 0)
      .from(first, { y: -420, rotation: -26, opacity: 0, duration: 1.5, ease: 'back.out(1.15)' }, .25)
      .from('.fl', { scale: 0, opacity: 0, stagger: .06, duration: .9, ease: 'back.out(2)', clearProps: 'opacity' }, .8)
      .from('.pick', { y: 30, opacity: 0, stagger: .07, duration: .8, ease: 'expo.out', clearProps: 'all' }, .9)
      .add(() => { const r = $('#stage').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * .6, 70, 1.15); }, 1.3);
  }

  /* ---- home showcase (pinned, discrete transitions) */
  const sh = { i: -1, imgs: [] };
  function showBuild() {
    const stack = $('#showStack'); if (!stack) return;
    stack.innerHTML = ''; $('#showNav').innerHTML = '';
    sh.imgs = LIST.map((p, i) => {
      const im = el('img'); im.src = p.image; im.alt = p.name; im.decoding = 'async'; im.loading = 'lazy'; im.draggable = false; im.style.visibility = 'hidden'; stack.appendChild(im);
      const li = el('li'); li.title = p.name; li.onclick = () => { if (ST && ST.getAll().length) { const tr = sh.st; if (tr) window.scrollTo({ top: tr.start + (i + .5) / LIST.length * (tr.end - tr.start), behavior: 'smooth' }); } }; $('#showNav').appendChild(li);
      return im;
    });
    $('#stotal').textContent = String(LIST.length).padStart(2, '0');
    renderCards($('#showGrid'), LIST);
    $('#products').hidden = !LIST.length;
    sh.i = -1;
  }
  function showGo(i, first) {
    const p = LIST[i]; if (!p) return;
    const from = sh.i, dir = i >= from ? 1 : -1; sh.i = i;
    $('#showPin').style.setProperty('--sc', pc(p)); root.style.setProperty('--hc', pc(p));
    $('#scur').textContent = String(i + 1).padStart(2, '0');
    $$('#showNav li').forEach((x, k) => x.classList.toggle('on', k === i));
    $('#sN').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(LIST.length).padStart(2, '0');
    $('#sName').textContent = p.name; $('#sTag').textContent = L(p.tagline) || L(p.desc);
    $('#sChips').innerHTML = [p.flavor, p.weight, p.status === 'soon' ? t('sc.soon') : p.category].filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('');
    $('#sMore').href = prodUrl(p); $('#showWordT').textContent = lastWord(p.name);
    swapImgs(sh.imgs, first ? -1 : from, i, dir);
    if (G && !reduce) {
      G.killTweensOf(['#showWordT', '#sN', '#sName', '#sTag', '#sChips', '#showInfo .btns']);
      G.fromTo('#showWordT', { yPercent: dir * 90, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out' });
      G.fromTo(['#sN', '#sName', '#sTag', '#sChips', '#showInfo .btns'], { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, duration: .75, ease: 'power3.out', delay: .1 });
      if (!first) { const r = $('#showStage').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 46, 1); }
    }
  }
  function showAnim() {
    const n = LIST.length; if (!n) return;
    const prog = $('#sprog');
    if (n > 1) {
      sh.st = ST.create({ trigger: '#products', start: 'top top', end: () => '+=' + Math.round(n * innerHeight * .85), pin: '#showPin', anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: s => { prog.style.transform = `scaleX(${s.progress})`; const idx = clamp(Math.floor(s.progress * n), 0, n - 1); if (idx !== sh.i) showGo(idx); } });
    }
    showGo(0, true);
  }

  /* ---- catalog */
  const cat = { q: '', f: 'all' };
  function catRender(animate) {
    const q = cat.q.trim().toLowerCase();
    const list = LIST.filter(p => (cat.f === 'all' || p.status === cat.f) && (!q || (p.name + ' ' + p.flavor + ' ' + L(p.tagline) + ' ' + L(p.desc)).toLowerCase().includes(q)));
    renderCards($('#pgrid'), list);
    $('#count').textContent = list.length; $('#empty').hidden = list.length > 0;
    $$('#filters .fchip').forEach(b => b.classList.toggle('on', b.dataset.f === cat.f));
    if (animate && G && !reduce) { G.from('#pgrid .pcard', { y: 60, opacity: 0, scale: .94, stagger: .06, duration: .8, ease: 'expo.out', clearProps: 'transform,opacity', overwrite: 'auto' }); }
    cardTilt();
  }
  function catOnce() {
    if (qs.get('f') && /^(all|active|soon)$/.test(qs.get('f'))) cat.f = qs.get('f');
    $('#q').addEventListener('input', e => { cat.q = e.target.value; catRender(true); });
    $('#filters').addEventListener('click', e => { const b = e.target.closest('.fchip'); if (b) { cat.f = b.dataset.f; catRender(true); } });
  }

  /* ---- product page */
  function setMeta(sel, attr, val) { const m = $(sel); if (m) m.setAttribute(attr, val); }
  function productRender() {
    const slug = qs.get('p'); const p = LIST.find(x => x.slug === slug) || (!slug ? null : null);
    if (!p) { $('.pdp-grid').hidden = true; $('#pdpNF').hidden = false; $('#moreSec').hidden = !LIST.length; renderCards($('#moreGrid'), LIST); document.title = t('pr.nf.t') + ' — BabuSweet'; return; }
    $('.pdp-grid').hidden = false; $('#pdpNF').hidden = true;
    const c = pc(p); $('#pdp').style.setProperty('--pc', c); root.style.setProperty('--hc', c);
    $('#pdpName').textContent = p.name; $('#pdpTag').textContent = L(p.tagline); $('#pdpDesc').textContent = L(p.desc);
    $('#pdpCat').textContent = p.category || ''; $('#pdpWordT').textContent = lastWord(p.name);
    const im = $('#pdpImg'); im.src = p.image; im.alt = p.name; im.className = p.bg ? 'has-bg' : '';
    const soon = p.status === 'soon'; $('#pdpSoon').hidden = !soon;
    const sp = $('#pdpSpecs'); sp.innerHTML = '';
    [['pr.flavor', p.flavor], ['pr.weight', p.weight], ['pr.category', p.category], ['pr.status', soon ? t('pr.s.soon') : t('pr.s.active')]].forEach(([k, v]) => { if (v) sp.insertAdjacentHTML('beforeend', `<dt>${esc(t(k))}</dt><dd>${esc(v)}</dd>`); });
    $('#pdpAsk').href = 'contact.html?product=' + encodeURIComponent(p.slug) + '&type=wholesale'; $('#pdpAsk').hidden = soon;
    const title = p.name + ' — BabuSweet', desc = L(p.desc) || L(p.tagline);
    document.title = title; setMeta('meta[name=description]', 'content', desc); setMeta('meta[property="og:title"]', 'content', title); setMeta('meta[property="og:description"]', 'content', desc);
    if (!/^data:/.test(p.image)) setMeta('meta[property="og:image"]', 'content', absUrl(p.image));
    try {
      const old = $('#ld-product'); if (old) old.remove(); const s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-product';
      s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: desc, category: p.category, image: /^data:/.test(p.image) ? undefined : absUrl(p.image), brand: { '@type': 'Brand', name: 'BabuSweet' } });
      document.head.appendChild(s);
    } catch (e) { /* ignore */ }
    const others = LIST.filter(x => x.slug !== p.slug); $('#moreSec').hidden = !others.length; renderCards($('#moreGrid'), others);
    cardTilt();
  }

  /* ---- news */
  function newsRender() {
    const g = $('#newsGrid'); if (!g) return; g.innerHTML = '';
    let items = [...DATA.news];
    if (PAGE === 'news') LIST.filter(p => p.status === 'soon').forEach(p => items.push({ soon: p, date: p.createdAt, title: { uz: p.name, ru: p.name, en: p.name }, body: p.tagline }));
    if (PAGE === 'home') items = items.slice(0, 3);
    const sec = $('#newsSec'); if (sec) sec.hidden = !items.length;
    const em = $('#empty'); if (em) em.hidden = items.length > 0;
    items.forEach(n => {
      const c = el('article', 'ncard'); const sp = n.soon;
      const d = n.date ? new Date(n.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const style = sp ? ` style="--c:${esc(pc(sp))};--c2:${esc(pc2(sp))}"` : '';
      const im = sp ? `<img class="cut" src="${esc(sp.image)}" alt="" loading="lazy">` : (n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy" decoding="async">` : '');
      c.innerHTML = `<div class="ncard-img"${style}>${im}</div><div class="ncard-body"><time>${esc(sp ? t('news.soon') : d)}</time><h3>${esc(L(n.title))}</h3><p>${esc(L(n.body))}</p></div>`;
      g.appendChild(c);
    });
  }

  /* ---- contact form */
  function contactRender() {
    const sel = $('#fProduct'); if (!sel) return;
    const keep = sel.value || qs.get('product') || '';
    sel.innerHTML = `<option value="">${esc(t('f.none'))}</option>` + LIST.filter(p => p.status === 'active').map(p => `<option value="${esc(p.slug)}">${esc(p.name)}</option>`).join('');
    sel.value = keep;
    const ty = qs.get('type'); if (ty && /^(wholesale|export|private|other)$/.test(ty) && !$('#fType').dataset.set) { $('#fType').value = ty; $('#fType').dataset.set = 1; }
  }
  function contactOnce() {
    const form = $('#form'), note = $('#formNote');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(form), name = (f.get('name') || '').trim(), contact = (f.get('contact') || '').trim();
      ['name', 'contact'].forEach(n => form.elements[n].classList.toggle('err', !(f.get(n) || '').trim()));
      note.classList.remove('bad');
      if (name.length < 2 || contact.length < 5) { note.textContent = t('f.err'); note.classList.add('bad'); return; }
      if (f.get('website')) return;
      const btn = $('button[type=submit]', form); btn.disabled = true; note.textContent = t('f.sending');
      const S = DATA.settings || {};
      const typeName = { wholesale: t('f.t1'), export: t('f.t2'), private: t('f.t3'), other: t('f.t4') }[f.get('type')] || '';
      const prod = LIST.find(p => p.slug === f.get('product'));
      const text = ['BabuSweet — ' + typeName, prod ? prod.name : '', name + ((f.get('company') || '').trim() ? ' — ' + f.get('company').trim() : ''), contact, (f.get('msg') || '').trim()].filter(Boolean).join('\n');
      const tg = S.social && S.social.telegram, mail = S.email; let ok = false;
      try { if (navigator.clipboard) { await navigator.clipboard.writeText(text); ok = true; } } catch (err) { /* ignore */ }
      if (tg) { window.open(tg, '_blank', 'noopener'); note.textContent = ok ? t('f.copied') : t('f.ok2'); }
      else if (mail) { location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('BabuSweet — ' + typeName) + '&body=' + encodeURIComponent(text); note.textContent = t('f.ok2'); }
      else { note.textContent = ok ? t('f.callcopied') : t('f.call'); const ph = (S.phone || '').replace(/[^\d+]/g, ''); if (ph && matchMedia('(pointer:coarse)').matches) location.href = 'tel:' + ph; }
      form.reset(); const b = btn.getBoundingClientRect(); burst(b.left + b.width / 2, b.top, 50, 1); btn.disabled = false;
    });
  }

  /* ---- globe */
  const GEO = { 'central asia': [43.2, 76.9], cis: [55.7, 37.6], 'middle east': [25.2, 55.3], europe: [52.5, 13.4], russia: [55.7, 37.6], kazakhstan: [51.1, 71.4], turkey: [41, 28.9], uae: [25.2, 55.3], china: [39.9, 116.4], india: [28.6, 77.2], usa: [38.9, -77], germany: [52.5, 13.4], asia: [22, 114], africa: [6.5, 3.4] };
  function geoFor(name) { const k = String(name).toLowerCase().trim(); if (GEO[k]) return GEO[k]; let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return [-35 + (h % 1000) / 1000 * 85, -150 + ((h >> 8) % 1000) / 1000 * 300]; }
  const glb = { run: false, vis: false, regs: [], pts: [], w: 0, t0: 0 };
  function globeInit() {
    const cv = $('#globe'); if (!cv) return; glb.cv = cv; glb.ctx = cv.getContext('2d');
    const N = 2300, ga = Math.PI * (3 - Math.sqrt(5)); glb.pts = [];
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; glb.pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth; cv.width = w * d; cv.height = w * d; glb.ctx.setTransform(d, 0, 0, d, 0, 0); glb.w = w; };
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => { glb.vis = es[0].isIntersecting; if (glb.vis && !glb.run) { glb.run = true; glb.t0 = performance.now(); requestAnimationFrame(globeTick); } }, { threshold: .05 }).observe(cv);
  }
  const ll = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  function globeTick(now) {
    if (!glb.vis || document.hidden) { glb.run = false; return; }
    const c = glb.ctx, W = glb.w, R = W * .42, cx = W / 2, cy = W / 2, el0 = (now - glb.t0) / 1000;
    const phi = -1.21 + Math.sin(el0 * .22) * .8, cp = Math.cos(phi), sp = Math.sin(phi), tilt = .42, ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = v => { const [x, y, z] = v; const x1 = x * cp + z * sp, z1 = -x * sp + z * cp; return [cx + x1 * R, cy - (y * ct - z1 * st) * R, y * st + z1 * ct]; };
    const col = getComputedStyle(root).getPropertyValue('--hc').trim() || '#1f63ff';
    c.clearRect(0, 0, W, W);
    const g = c.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.25); g.addColorStop(0, col + '66'); g.addColorStop(.7, col + '1c'); g.addColorStop(1, 'transparent');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R * 1.25, 0, 6.283); c.fill(); c.fillStyle = '#fff';
    for (const p of glb.pts) { const q = proj(p); c.globalAlpha = q[2] > 0 ? .25 + q[2] * .6 : .05; c.fillRect(q[0], q[1], q[2] > 0 ? 2 : 1.2, q[2] > 0 ? 2 : 1.2); }
    c.globalAlpha = 1;
    const home = ll(41.3, 69.3);
    glb.regs.forEach((r, i) => {
      const dest = ll(r[0], r[1]), prog = clamp(((el0 * .35 - i * .18) % 2.2), 0, 1.4);
      const dot = Math.acos(clamp(home[0] * dest[0] + home[1] * dest[1] + home[2] * dest[2], -1, 1)) || .01, steps = 48;
      c.beginPath(); let started = false, head = null;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps; if (u > Math.min(prog, 1)) break;
        const a = Math.sin((1 - u) * dot) / Math.sin(dot), b = Math.sin(u * dot) / Math.sin(dot), lift = 1 + Math.sin(u * Math.PI) * .22;
        const q = proj([(a * home[0] + b * dest[0]) * lift, (a * home[1] + b * dest[1]) * lift, (a * home[2] + b * dest[2]) * lift]); head = q;
        if (q[2] < -.15) { started = false; continue; } if (!started) { c.moveTo(q[0], q[1]); started = true; } else c.lineTo(q[0], q[1]);
      }
      c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.globalAlpha = .85; c.stroke(); c.globalAlpha = 1;
      if (head && head[2] > 0) { c.fillStyle = '#fff'; c.beginPath(); c.arc(head[0], head[1], 3.5, 0, 6.283); c.fill(); }
      const q = proj(dest);
      if (q[2] > 0) { const pr = (el0 * 1.2 + i) % 1; c.strokeStyle = '#fff'; c.globalAlpha = 1 - pr; c.beginPath(); c.arc(q[0], q[1], 3 + pr * 14, 0, 6.283); c.stroke(); c.globalAlpha = 1; c.fillStyle = col; c.beginPath(); c.arc(q[0], q[1], 4.5, 0, 6.283); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); }
    });
    const h = proj(home);
    if (h[2] > -.1) { const pr = (el0 * .8) % 1; c.strokeStyle = '#fff'; c.globalAlpha = 1 - pr; c.beginPath(); c.arc(h[0], h[1], 6 + pr * 22, 0, 6.283); c.stroke(); c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.arc(h[0], h[1], 6, 0, 6.283); c.fill(); }
    requestAnimationFrame(globeTick);
  }

  /* ============================================================ chrome */
  const header = $('#header'), burger = $('#burger'), menu = $('#menu'), curtain = $('#curtain');
  function setMenu(open) {
    burger.classList.toggle('open', open); menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('noscroll', open); if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  $('#lang').addEventListener('click', e => { const b = e.target.closest('button'); if (b && I[b.dataset.lang] && b.dataset.lang !== lang) { lang = b.dataset.lang; store.set('lang', lang); renderPage(false); } });

  // anchors + page transitions
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const h = a.getAttribute('href') || '';
    if (h.startsWith('#')) { if (h.length < 2) return; const tg = $(h); if (!tg) return; e.preventDefault(); if (lenis) lenis.scrollTo(tg, { duration: 1.6 }); else tg.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (/^(https?:|mailto:|tel:)/i.test(h) || !/\.html(\?|#|$)|^index$/.test(h)) return;
    if (reduce) return;
    e.preventDefault(); curtain.classList.add('cover'); const url = a.href;
    setTimeout(() => { location.href = url; }, 480); setTimeout(() => curtain.classList.remove('cover'), 4000);
  });
  addEventListener('pageshow', () => curtain.classList.remove('cover'));

  /* card tilt (pointer) — pure CSS vars, no GSAP conflict */
  function cardTilt() {
    if (!fine || reduce) return;
    $$('.pcard').forEach(c => {
      if (c._t) return; c._t = 1;
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; const im = $('.pc-img img', c); if (im) im.style.translate = `${(x * 18).toFixed(1)}px ${(y * 12).toFixed(1)}px`; });
      c.addEventListener('pointerleave', () => { const im = $('.pc-img img', c); if (im) im.style.translate = ''; });
    });
  }

  /* ============================================================ GSAP scenes (shared) */
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
  function animate() {
    if (!G || !ST || reduce) { staticFinish(); return; }
    root.classList.add('is-anim');
    ctx = G.context(() => {
      if (PAGE === 'home') { showAnim(); const stm = $('#statement'); const words = stm.textContent.trim().split(/\s+/); stm.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' '); const ws = $$('.w', stm); ST.create({ trigger: stm, start: 'top 80%', end: 'bottom 50%', scrub: true, onUpdate: s => { const k = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('lit', i < k)); } }); }
      // headings
      $$('.split').forEach(h => { const chars = splitText(h); G.from(chars, { yPercent: 118, stagger: .02, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 92%', once: true } }); });
      // generic reveals
      ['.kicker', '.lead', '.story-p', '.stat', '.prow a', '.ncard', '.val', '.xsteps li', '.qa', '.regions li', '.cinfo li', '.form', '.map', '.bigphone', '.cta-sec .btn', '.toolbar', '.specs'].forEach(sel => $$(sel).forEach((n, i) => {
        if (n.closest('.hero,.show-pin,.pdp-info,.phero .wrap > .kicker')) return;
        G.from(n, { y: 60, opacity: 0, duration: 1.1, delay: (i % 4) * .06, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: n, start: 'top 93%', once: true } });
      }));
      // factory steps
      $$('.fstep').forEach(s => ST.create({ trigger: s, start: 'top 68%', end: 'bottom 32%', onToggle: x => s.classList.toggle('on', x.isActive) }));
      // counters
      $$('#stats b').forEach(b => { const end = +b.dataset.n || 0, suf = b.dataset.s || '', o = { v: 0 }; b.textContent = '0' + suf; ST.create({ trigger: b, start: 'top 92%', once: true, onEnter: () => G.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v) + suf; } }) }); });
      // marquee skew
      const track = $('#bigMarq'); if (track) { const sk = G.quickTo(track, 'skewX', { duration: .5, ease: 'power3' }); let skT; ST.create({ trigger: document.body, start: 0, end: 'max', onUpdate: s => { sk(clamp(s.getVelocity() / -260, -14, 14)); clearTimeout(skT); skT = setTimeout(() => sk(0), 120); } }); }
      // hero parallax out (home)
      if (PAGE === 'home') { G.to('.hero-copy', { yPercent: -12, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); G.to('.stage', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); G.to('.hero-word', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); }
      // tilt cards (values)
      if (fine) $$('.val').forEach(c => { c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px'); G.to(c, { rotationY: (x / r.width - .5) * 8, rotationX: -(y / r.height - .5) * 8, transformPerspective: 900, duration: .6, ease: 'power3.out' }); }); c.addEventListener('pointerleave', () => G.to(c, { rotationX: 0, rotationY: 0, duration: .9, ease: 'power3.out' })); });
      // header light/dark
      $$('[data-header="light"]').forEach(s => ST.create({ trigger: s, start: 'top 40px', end: 'bottom 40px', onToggle: x => header.classList.toggle('light', x.isActive) }));
      // footer word
      const fw = $('.footer-word'); if (fw) G.from(fw, { yPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 40%', scrub: true } });
      // product page intro / pdp parallax
      if (PAGE === 'product' && !$('.pdp-grid').hidden) {
        G.from('#pdpImg', { x: 260, rotation: 16, opacity: 0, scale: .8, duration: 1.4, ease: 'back.out(1.25)', delay: .15 });
        G.from('#pdpInfo > *', { y: 50, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out', delay: .1, clearProps: 'transform,opacity' });
        G.from('#pdpWordT', { yPercent: 100, duration: 1.3, ease: 'expo.out' });
        G.to('#pdpWordT', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '#pdp', start: 'top top', end: 'bottom top', scrub: true } });
      }
    });
    ST.refresh();
  }
  function staticFinish() {
    killAnim();
    $$('#stats b').forEach(b => { b.textContent = (+b.dataset.n || 0) + (b.dataset.s || ''); });
    $$('.fstep').forEach(s => s.classList.add('on'));
    const stm = $('#statement'); if (stm) stm.style.opacity = 1;
    if (PAGE === 'home' && LIST.length) { /* fallback grid is visible */ }
  }

  /* ============================================================ pointer fx (cursor, magnetic, stage click) */
  function pointerFx() {
    document.addEventListener('click', e => {
      const st = e.target.closest('#stage,#showStage,#pdpStage'); if (st && !e.target.closest('a,button')) burst(e.clientX, e.clientY, 64, 1.05);
    });
    if (!fine || reduce || !G) return;
    const cur = $('#cursor'), lab = $('span', cur);
    const xs = G.quickTo(cur, 'x', { duration: .22, ease: 'power3' }), ys = G.quickTo(cur, 'y', { duration: .22, ease: 'power3' });
    addEventListener('pointermove', e => { cur.classList.add('on'); xs(e.clientX); ys(e.clientY); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    document.addEventListener('pointerover', e => { const d = e.target.closest('[data-cursor]'), link = e.target.closest('a,button,.pick,.lang,summary'); cur.classList.toggle('big', !!d); cur.classList.toggle('link', !d && !!link); if (d) lab.textContent = d.dataset.cursor; });
    document.addEventListener('pointermove', e => { const b = e.target.closest('.magnetic'); if (!b) return; const r = b.getBoundingClientRect(); G.to(b, { '--bx': (e.clientX - r.left - r.width / 2) * .3 + 'px', '--by': (e.clientY - r.top - r.height / 2) * .4 + 'px', duration: .5, ease: 'power3.out', overwrite: 'auto' }); });
    document.addEventListener('pointerout', e => { const b = e.target.closest('.magnetic'); if (b && !b.contains(e.relatedTarget)) G.to(b, { '--bx': '0px', '--by': '0px', duration: .9, ease: 'elastic.out(1,.4)', overwrite: 'auto' }); });
  }

  /* ============================================================ render pipeline */
  function seoExtras() {
    let pill = $('#draftPill');
    if (DATA._draft) {
      if (!pill) { pill = el('button', '', 'QORALAMA REJIMI — faqat siz ko‘rasiz · o‘chirish'); pill.id = 'draftPill'; pill.type = 'button'; pill.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:900;background:#fff;color:#000;border-radius:99px;padding:10px 18px;font:800 .68rem Manrope,sans-serif;letter-spacing:.1em;box-shadow:0 10px 40px rgba(0,0,0,.4)'; pill.onclick = () => { try { localStorage.removeItem('bs_draft'); } catch (e) { /* ignore */ } location.reload(); }; document.body.appendChild(pill); }
    } else if (pill) pill.remove();
    if (PAGE === 'home' || PAGE === 'catalog') {
      try {
        const old = $('#ld-list'); if (old) old.remove(); const s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-list';
        s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: LIST.filter(p => p.status === 'active').map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.name, description: L(p.desc), category: p.category, brand: { '@type': 'Brand', name: 'BabuSweet' } } })) });
        document.head.appendChild(s);
      } catch (e) { /* ignore */ }
    }
  }
  function renderPage(first) {
    killAnim();
    LIST = DATA.products;
    applyStatic(); renderSettings(); seoExtras(); canonicalTags();
    if (PAGE === 'home') { heroBuild(); showBuild(); newsRender(); }
    if (PAGE === 'catalog') catRender(false);
    if (PAGE === 'product') productRender();
    if (PAGE === 'news') newsRender();
    if (PAGE === 'contact') contactRender();
    if (PAGE === 'export') glb.regs = (DATA._regs || []).map(geoFor);
    animate();
    if (!first) { if (ST) ST.refresh(); if (PAGE === 'home') heroTimer(); }
  }

  function runLoader(done) {
    const loader = $('#loader'), num = $('#loaderNum');
    if (PAGE !== 'home' || store.sget('bs_seen') || reduce) { root.classList.remove('is-loading'); store.sset('bs_seen', '1'); done(); return; }
    store.sset('bs_seen', '1');
    const t0 = performance.now(); let shown = 0, finished = false, imgsReady = false;
    const first = LIST.slice(0, 2).map(p => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = p.image; setTimeout(res, 3500); }));
    Promise.all(first).then(() => { imgsReady = true; });
    const cols = LIST.map(pc); let ci = 0; const cyc = setInterval(() => { if (cols.length) root.style.setProperty('--hc', cols[ci++ % cols.length]); }, 380);
    (function tick(now) {
      const minDone = now - t0 > 1500;
      shown += (Math.min(imgsReady ? 100 : 88, minDone ? 100 : 94) - shown) * .1 + .15; shown = Math.min(shown, 100); num.textContent = Math.round(shown);
      if ((shown >= 99.4 && minDone && imgsReady) || now - t0 > 6000) {
        if (finished) return; finished = true; num.textContent = 100; clearInterval(cyc);
        setTimeout(() => { loader.classList.add('done'); setTimeout(() => root.classList.remove('is-loading'), 1000); done(); }, 220); return;
      }
      requestAnimationFrame(tick);
    })(t0);
  }

  function boot() {
    const nl = (navigator.language || '').toLowerCase();
    lang = I[store.get('lang')] ? store.get('lang') : (nl.startsWith('ru') ? 'ru' : nl.startsWith('en') ? 'en' : 'uz');
    DATA = loadData(); LIST = DATA.products;
    G = window.gsap; ST = window.ScrollTrigger;
    if (G && ST) {
      G.registerPlugin(ST);
      if (window.Lenis && !reduce) { lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, syncTouch: false }); lenis.on('scroll', ST.update); G.ticker.add(tm => lenis.raf(tm * 1000)); G.ticker.lagSmoothing(0); }
      ST.config({ ignoreMobileResize: true });
    }
    if (LIST[0]) root.style.setProperty('--hc', pc(LIST[0]));
    // one-time listeners
    if (PAGE === 'catalog') catOnce();
    if (PAGE === 'contact') contactOnce();
    if (PAGE === 'export') globeInit();
    if (PAGE === 'home') new IntersectionObserver(es => { hero.vis = es[0].isIntersecting; if (hero.vis && hero.list[hero.cur]) root.style.setProperty('--hc', pc(hero.list[hero.cur])); }, { threshold: .2 }).observe($('.hero'));
    renderPage(true);
    pointerFx(); requestAnimationFrame(tiltLoop);
    runLoader(() => { if (PAGE === 'home') { heroIntro(); heroTimer(); } if (ST) setTimeout(() => ST.refresh(), 400); });
    let lastY = 0; const pb = $('#pbar');
    addEventListener('scroll', () => {
      const y = scrollY, max = root.scrollHeight - innerHeight; pb.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      header.classList.toggle('hide', y > lastY + 6 && y > 500 && !menu.classList.contains('open')); if (y < lastY - 6) header.classList.remove('hide'); lastY = y;
    }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST && ST.refresh());
    addEventListener('load', () => ST && ST.refresh());
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ST && ST.refresh(), 250); });
  }
  const start = () => { try { boot(); } catch (err) { console.error(err); root.classList.remove('is-loading', 'is-anim'); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
