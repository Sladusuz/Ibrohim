(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;

  // split headings into words for the mask reveal
  $$('.split').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
    $$('.w > span', el).forEach((s, i) => (s.style.transitionDelay = i * 70 + 'ms'));
  });

  // reveal on scroll (hidden state only applies after this flag is set)
  root.classList.add('anim');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .split').forEach((el, i) => {
    if (el.classList.contains('rv') && !el.style.transitionDelay) el.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(el);
  });

  // count-up
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const to = +e.target.dataset.count, t0 = performance.now(), d = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / d, 1);
      e.target.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => co.observe(el));

  // nav, progress bar
  const nav = $('#nav'), bar = $('#progress');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('hide', y > lastY && y > 400 && !$('#links').classList.contains('open'));
    lastY = y;
    timeline();
  };
  addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const burger = $('#burger'), links = $('#links');
  const setMenu = o => { links.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // stroke timeline: fill line and light stages by scroll position
  const tl = $('#tl'), fill = $('#tlFill'), stages = $$('.stage');
  function timeline() {
    if (!tl) return;
    const r = tl.getBoundingClientRect(), mid = innerHeight * 0.55;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    fill.style.height = p * 100 + '%';
    stages.forEach(s => {
      const b = s.getBoundingClientRect();
      s.classList.toggle('active', b.top < mid && b.bottom > innerHeight * 0.2 || b.top < mid);
    });
  }

  // accordion
  $$('.acc__i').forEach(it => $('.acc__q', it).addEventListener('click', () => {
    const open = !it.classList.contains('open');
    $$('.acc__i').forEach(o => { o.classList.remove('open'); $('.acc__q', o).setAttribute('aria-expanded', false); });
    if (open) { it.classList.add('open'); $('.acc__q', it).setAttribute('aria-expanded', true); }
  }));

  // copy phone
  const cp = $('#copy');
  cp.addEventListener('click', async () => {
    const num = '+998930868425';
    try { await navigator.clipboard.writeText(num); cp.textContent = 'Nusxalandi ✓'; }
    catch (_) {
      const r = document.createRange(); r.selectNodeContents($('.phone__n'));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Raqamni belgilang';
    }
    setTimeout(() => (cp.textContent = 'Nusxalash'), 2000);
  });

  $('#yr').textContent = new Date().getFullYear();

  // spotlight follow (cards, steps)
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px');
    el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  if (fine && !reduce) {
    // cursor glow
    const cur = $('#cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    (function loop() { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();

    // 3D tilt
    $$('.tilt').forEach(el => {
      const max = +el.dataset.tilt || 6;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
      });
      el.addEventListener('pointerleave', () => (el.style.transform = ''));
    });

    // magnetic buttons
    $$('.magnet').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => (el.style.transform = ''));
    });
  }

  // neural network background (neuroplasticity)
  const cv = $('#neural'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 }, running = !document.hidden;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(80, W / 17));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const L = 140;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 150) { a.x += dx / d * 1.2; a.y += dy / d * 1.2; }
      }
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < L) {
          ctx.strokeStyle = `rgba(69,227,193,${(1 - d / L) * 0.22})`;
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(69,227,193,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
  }
  function frame() { if (running) draw(); if (!reduce) requestAnimationFrame(frame); }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('visibilitychange', () => (running = !document.hidden));
  frame(); if (reduce) draw();

  onScroll();
})();
