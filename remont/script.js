(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const wide = matchMedia('(min-width: 901px)');
  const root = document.documentElement;
  const hasIO = 'IntersectionObserver' in window;

  $('#year').textContent = new Date().getFullYear();

  /* ================= reveal on scroll ================= */
  const items = $$('[data-r]');
  if (hasIO && !reduce) {
    root.classList.add('js');
    items.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-r'));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 90 + 'ms');
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    items.forEach(el => io.observe(el));
    setTimeout(() => items.forEach(el => el.classList.add('in')), 9000);
  }

  /* ================= counters ================= */
  const fmt = n => n.toLocaleString('en').replace(/,/g, ' ');
  if (hasIO && !reduce) {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
      (function tick(t) {
        const p = clamp((t - t0) / 1800);
        el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 3)))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => co.observe(el));
  }

  /* ================= statement words ================= */
  const stmt = $('#stmt');
  const hlRe = /^(orzuingizdagi|uyni|sifat|muddat\.?|kalitni)$/i;
  stmt.innerHTML = stmt.textContent.trim().split(/\s+/).map(w => '<span class="w' + (hlRe.test(w) ? ' hl' : '') + '">' + w + '</span>').join(' ');
  const words = $$('.w', stmt);
  let wordsOn = -1;
  const updWords = () => {
    const r = stmt.getBoundingClientRect(), vh = innerHeight;
    const n = reduce ? words.length : Math.round(clamp((vh * .86 - r.top) / (r.height + vh * .42)) * words.length);
    if (n === wordsOn) return;
    wordsOn = n;
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  };

  /* ================= timeline ================= */
  const tl = $('#tl'), tlIts = $$('.tl__it');
  const updTl = () => {
    const r = tl.getBoundingClientRect(), vh = innerHeight;
    tl.style.setProperty('--tp', clamp((vh * .55 - r.top) / r.height).toFixed(3));
    tlIts.forEach(it => { const b = it.getBoundingClientRect(); it.classList.toggle('on', b.top + b.height / 2 < vh * .62); });
  };

  /* ================= one scroll handler ================= */
  const nav = $('#nav'), bar = $('#progress'), mbar = $('#mbar'), contact = $('#aloqa');
  const menu = $('#menu'), burger = $('#burger');
  let lastY = scrollY, ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 30);
    nav.classList.toggle('hide', y > lastY + 4 && y > 520 && !menu.classList.contains('open'));
    if (y < lastY - 4) nav.classList.remove('hide');
    lastY = y;
    if (mbar) mbar.classList.toggle('hide', contact.getBoundingClientRect().top < innerHeight * .5);
    updWords(); updTl();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } });
  frame();

  /* ================= scroll spy ================= */
  const spyLinks = $$('[data-s]');
  const setActive = id => spyLinks.forEach(a => a.classList.toggle('act', a.dataset.s === id));
  if (hasIO) {
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section || e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-section]').forEach(s => spy.observe(s));
  }

  /* ================= menu ================= */
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('lock', open);
    if (open) nav.classList.remove('hide');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  matchMedia('(min-width: 1101px)').addEventListener('change', e => e.matches && setMenu(false));

  /* ================= hero: light follows pointer ================= */
  const hero = $('#hero'), spot = $('#spot'), imgDark = $('#imgDark'), imgLit = $('#imgLit'), imgFull = $('#imgFull');
  const NAT = [2400, 1266];
  let W = 0, H = 0, D = 360, ox = 0, oy = 0, cx = 0, cy = 0, tx = 0, ty = 0, lastInput = -1e9, heroVisible = true, raf = 0;
  const layout = () => {
    const r = hero.getBoundingClientRect(); W = r.width; H = r.height;
    const s = Math.max(W / NAT[0], H / NAT[1]), iw = NAT[0] * s, ih = NAT[1] * s;
    ox = (W - iw) / 2; oy = (H - ih) / 2;
    [imgDark, imgFull, imgLit].forEach(im => { im.style.width = iw + 'px'; im.style.height = ih + 'px'; });
    [imgDark, imgFull].forEach(im => { im.style.left = ox + 'px'; im.style.top = oy + 'px'; });
    imgLit.style.left = '0px'; imgLit.style.top = '0px';
    D = Math.round(clamp(Math.min(W, H) * .62, 260, 560));
    spot.style.setProperty('--d', D + 'px');
    if (!cx && !cy) { cx = tx = W * .68; cy = ty = H * .46; }
    place();
  };
  const place = () => {
    spot.style.transform = 'translate3d(' + (cx - D / 2) + 'px,' + (cy - D / 2) + 'px,0)';
    imgLit.style.transform = 'translate3d(' + (ox - (cx - D / 2)) + 'px,' + (oy - (cy - D / 2)) + 'px,0)';
  };
  const loop = t => {
    raf = 0;
    if (!heroVisible || reduce) return;
    if (t - lastInput > 2200) {
      tx = W * (.5 + .34 * Math.sin(t * .00042));
      ty = H * (.5 + .2 * Math.sin(t * .0006 + 1.3));
    }
    cx += (tx - cx) * .12; cy += (ty - cy) * .12;
    place();
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && heroVisible && !reduce) raf = requestAnimationFrame(loop); };
  const aim = e => {
    const r = hero.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top; lastInput = performance.now(); kick();
  };
  hero.addEventListener('pointermove', aim);
  hero.addEventListener('pointerdown', aim);
  new ResizeObserver(layout).observe(hero);
  if (hasIO) new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; if (heroVisible) kick(); }).observe(hero);
  layout(); kick();

  const lightBtn = $('#lightBtn'), hintTxt = $('#hint span');
  if (!fine) hintTxt.textContent = 'Barmog\'ingiz bilan suring';
  const setLights = on => {
    hero.classList.toggle('on-lights', on);
    lightBtn.setAttribute('aria-pressed', on);
    $('span', lightBtn).textContent = on ? 'Yoritishni o\'chirish' : 'Yoritishni yoqish';
  };
  // the full-light image is only needed once lights go on: fetch it after the page is idle or on first click
  let fullLoaded = false;
  const loadFull = () => { if (fullLoaded) return; fullLoaded = true; imgFull.src = matchMedia('(max-width: 900px)').matches ? imgFull.dataset.srcM : imgFull.dataset.src; };
  addEventListener('load', () => setTimeout(loadFull, 2500), { once: true });
  lightBtn.addEventListener('click', () => { loadFull(); setLights(!hero.classList.contains('on-lights')); });
  if (reduce) { loadFull(); setLights(true); }

  /* ================= lazy background for the feature block ================= */
  const feat = $('.feature');
  const setBg = () => feat.style.setProperty('--fbg', 'url(' + feat.dataset.bg + ')');
  if (hasIO) { const bo = new IntersectionObserver(es => { if (es[0].isIntersecting) { setBg(); bo.disconnect(); } }, { rootMargin: '600px 0px' }); bo.observe(feat); } else setBg();

  /* ================= service panels ================= */
  const pns = $$('.pn');
  const pick = p => pns.forEach(x => x.classList.toggle('on', x === p));
  pns.forEach(p => {
    p.addEventListener('click', () => pick(p));
    p.addEventListener('focus', () => pick(p));
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p); } });
    p.addEventListener('mouseenter', () => { if (fine && wide.matches) pick(p); });
  });

  /* ================= style compare slider ================= */
  const cmp = $('#cmp'), cmpBar = $('#cmpBar');
  const setP = v => { v = clamp(v, 2, 98); cmp.style.setProperty('--p', v + '%'); cmpBar.setAttribute('aria-valuenow', Math.round(v)); return v; };
  let dragging = false, pNow = 50;
  const fromX = x => { const r = cmp.getBoundingClientRect(); pNow = setP((x - r.left) / r.width * 100); };
  cmp.addEventListener('pointerdown', e => { dragging = true; cmp.setPointerCapture(e.pointerId); fromX(e.clientX); });
  cmp.addEventListener('pointermove', e => { if (dragging) fromX(e.clientX); });
  ['pointerup', 'pointercancel'].forEach(t => cmp.addEventListener(t, () => { dragging = false; }));
  cmpBar.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') pNow = setP(pNow - 5);
    else if (e.key === 'ArrowRight') pNow = setP(pNow + 5);
    else return;
    e.preventDefault();
  });
  if (hasIO && !reduce) {
    const demo = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return; demo.disconnect();
      const t0 = performance.now(), path = [[0, 50], [.3, 24], [.65, 76], [1, 50]];
      (function tick(t) {
        if (dragging) return;
        const p = clamp((t - t0) / 2200); let i = 0; while (i < path.length - 2 && p > path[i + 1][0]) i++;
        const a = path[i], b = path[i + 1], k = clamp((p - a[0]) / (b[0] - a[0])), e = k * k * (3 - 2 * k);
        pNow = setP(a[1] + (b[1] - a[1]) * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: .6 });
    demo.observe(cmp);
  }

  /* ================= gallery + lightbox ================= */
  const cards = $$('.g');
  $$('#chips button').forEach(b => b.addEventListener('click', () => {
    $$('#chips button').forEach(x => x.classList.toggle('on', x === b));
    cards.forEach(g => {
      const show = b.dataset.f === 'all' || g.dataset.c === b.dataset.f;
      g.classList.toggle('off', !show);
      if (show) { g.style.animation = 'none'; void g.offsetWidth; g.style.animation = ''; }
    });
  }));
  const lb = $('#lb'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let lbList = [], lbI = 0;
  const lbShow = i => {
    lbI = (i + lbList.length) % lbList.length;
    const g = lbList[lbI];
    lbImg.src = g.dataset.full; lbImg.alt = $('img', g).alt;
    lbCap.textContent = [...$('figcaption', g).childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
  };
  const lbClose = () => lb.classList.remove('open');
  cards.forEach(g => g.addEventListener('click', () => {
    lbList = cards.filter(c => !c.classList.contains('off'));
    lbShow(lbList.indexOf(g)); lb.classList.add('open');
  }));
  $('.lb__x', lb).addEventListener('click', lbClose);
  $('.lb__p', lb).addEventListener('click', e => { e.stopPropagation(); lbShow(lbI - 1); });
  $('.lb__n', lb).addEventListener('click', e => { e.stopPropagation(); lbShow(lbI + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { lbClose(); setMenu(false); }
    if (lb.classList.contains('open')) { if (e.key === 'ArrowRight') lbShow(lbI + 1); if (e.key === 'ArrowLeft') lbShow(lbI - 1); }
  });
  let sx = 0;
  lb.addEventListener('pointerdown', e => { sx = e.clientX; });
  lb.addEventListener('pointerup', e => { const dx = e.clientX - sx; if (Math.abs(dx) > 60) lbShow(lbI + (dx < 0 ? 1 : -1)); });

  /* ================= quiz -> Telegram ================= */
  const quiz = $('#quiz'), steps = $$('.q__s', quiz), qBar = $('#qBar'), qStep = $('#qStep'), qNote = $('#qNote');
  const qBack = $('#qBack'), qNext = $('#qNext'), area = $('#area'), areaOut = $('#areaOut');
  let qi = 0;
  const syncArea = () => { areaOut.textContent = area.value; area.style.setProperty('--v', ((area.value - area.min) / (area.max - area.min) * 100) + '%'); };
  area.addEventListener('input', syncArea); syncArea();
  const qShow = i => {
    qi = i; qNote.textContent = '';
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    qBar.style.transform = 'scaleX(' + (i + 1) / steps.length + ')';
    qStep.textContent = (i + 1) + ' / ' + steps.length;
    qBack.hidden = i === 0;
    $('span', qNext).textContent = i === steps.length - 1 ? 'Telegram orqali yuborish' : 'Keyingisi';
  };
  qBack.addEventListener('click', () => qShow(qi - 1));
  const send = () => {
    const f = quiz.elements, name = f.name.value.trim(), phone = f.phone.value.trim();
    const okN = name.length > 1, okP = phone.replace(/\D/g, '').length >= 9;
    f.name.classList.toggle('invalid', !okN); f.phone.classList.toggle('invalid', !okP);
    if (!okN || !okP) { qNote.textContent = 'Iltimos, ism va telefon raqamingizni to\'g\'ri kiriting.'; return; }
    const msg = 'Assalomu alaykum! VIP REMONT saytidan hisob-kitob so\'rovi.\nRemont turi: ' + f.type.value + '\nMaydon: ' + f.area.value + ' m²\nUslub: ' + f.uslub.value + '\nIsm: ' + name + '\nTelefon: ' + phone;
    const w = window.open('https://t.me/vip_remont_uz?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    qNote.textContent = w ? 'Telegram ochildi. Xabarni yuboring, tez orada javob beramiz.' : 'Telegram ochilmadi. Iltimos, +998 91 994 17 17 raqamiga qo\'ng\'iroq qiling.';
  };
  qNext.addEventListener('click', () => qi < steps.length - 1 ? qShow(qi + 1) : send());
  quiz.addEventListener('submit', e => { e.preventDefault(); qNext.click(); });
  qShow(0);

  /* ================= spotlight cards ================= */
  $$('.sp').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ================= desktop: cursor + magnetic buttons ================= */
  if (fine && !reduce) {
    const cur = $('#cur'), ring = $('b', cur); let mx = -100, my = -100, rx = -100, ry = -100;
    document.body.classList.add('has-cur');
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      rx += (mx - rx) * .2; ry += (my - ry) * .2;
      cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + (rx - mx) + 'px,' + (ry - my) + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      const d = e.target.closest('[data-cur]');
      if (d) { ring.textContent = d.dataset.cur; cur.classList.add('big'); cur.classList.remove('link'); }
      else { ring.textContent = ''; cur.classList.remove('big'); cur.classList.toggle('link', !!e.target.closest('a,button,summary,label,input,.cmp__bar')); }
    });
    $$('.mag').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = 'translate3d(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3) + 'px,0)'; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
})();
