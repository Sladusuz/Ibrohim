(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- plain behaviours (work without GSAP) ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  const closeMenu = () => { burger.classList.remove('open'); links.classList.remove('open'); };
  burger.addEventListener('click', () => { burger.classList.toggle('open'); links.classList.toggle('open'); });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));

  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY && y > 500 && !links.classList.contains('open'));
    $('#mbar').classList.toggle('hide', document.querySelector('#aloqa').getBoundingClientRect().top < innerHeight * .6);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#progress').style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  // lightbox
  const lb = $('#lightbox'), lbImg = $('img', lb);
  $$('.b').forEach(f => f.addEventListener('click', () => { lbImg.src = f.dataset.full; lb.classList.add('open'); }));
  lb.addEventListener('click', () => lb.classList.remove('open'));
  addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('open'));

  // contact form -> Telegram deep link (pre-filled message)
  const form = $('#form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const name = form.elements.name, phone = form.elements.phone;
    name.classList.toggle('invalid', !d.name.trim());
    phone.classList.toggle('invalid', d.phone.replace(/\D/g, '').length < 9);
    if (!d.name.trim() || d.phone.replace(/\D/g, '').length < 9) {
      $('#formNote').textContent = 'Iltimos, ism va telefon raqamingizni to\'g\'ri kiriting.';
      return;
    }
    const text = `Assalomu alaykum! VIP REMONT saytidan murojaat.\nIsm: ${d.name}\nTelefon: ${d.phone}\nXizmat: ${d.type}` + (d.msg.trim() ? `\nXabar: ${d.msg}` : '');
    window.open(`https://t.me/vip_remont_uz?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    $('#formNote').textContent = 'Rahmat! Telegram ochildi — xabarni yuboring, tez orada javob beramiz.';
  });

  // custom cursor
  if (fine) {
    const cur = $('#cursor'); let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    document.body.classList.add('has-cursor');
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    (function loop() { cx += (x - cx) * .18; cy += (y - cy) * .18; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => cur.classList.toggle('hover', !!e.target.closest('a,button,summary,.b,.card,input,select,textarea')));
  }

  // card spotlight + 3D tilt
  $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
      if (hasGsap) gsap.to(c, { rotationY: (px - .5) * 10, rotationX: (.5 - py) * 10, duration: .5, ease: 'power2.out', transformPerspective: 900 });
    });
    c.addEventListener('mouseleave', () => hasGsap && gsap.to(c, { rotationX: 0, rotationY: 0, duration: .8, ease: 'power3.out' }));
  });

  // split headings into words (kept as plain text nodes + <em>)
  $$('.split').forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) f.append(' ');
          else { const w = document.createElement('span'); w.className = 'w'; w.innerHTML = `<span>${t}</span>`; f.append(w); }
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  });

  /* ---------- GSAP choreography ---------- */
  const loader = $('#loader');
  if (!hasGsap || reduce) {
    loader.remove();
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || ''));
    return;
  }

  document.documentElement.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);

  // smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: .09, wheelMultiplier: .95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -40, duration: 1.6 });
    }));
  }

  // set initial states
  gsap.set('.hero__title .word', { yPercent: 115, rotate: 4 });
  gsap.set('.split .w>span', { yPercent: 115 });
  gsap.set('.hero .reveal', { opacity: 0, y: 40 });
  gsap.set('.nav', { yPercent: -100 });

  // preloader
  const num = $('#loaderNum'), bar = $('#loaderBar'), prog = { v: 0 };
  const intro = () => {
    gsap.timeline()
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' })
      .to('#heroImg', { scale: 1, duration: 2.4, ease: 'power3.out' }, '<.2')
      .to('.hero__title .word', { yPercent: 0, rotate: 0, duration: 1.3, stagger: .12, ease: 'power4.out' }, '<.4')
      .to('.nav', { yPercent: 0, duration: 1, ease: 'power3.out' }, '<.2')
      .to('.hero .reveal', { opacity: 1, y: 0, duration: 1, stagger: .12, ease: 'power3.out' }, '<.3')
      .add(() => loader.remove())
      .add(initScroll);
  };
  const t0 = performance.now();
  const loadDone = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r));
  gsap.to(prog, { v: 100, duration: 1.8, ease: 'power2.inOut', onUpdate() { const v = Math.round(prog.v); num.textContent = v; bar.style.width = v + '%'; },
    onComplete: () => loadDone.then(intro) });

  function initScroll() {
    // hero parallax
    gsap.to('#heroImg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#hero', start: '30% top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__glow.g1', { y: 200, scrollTrigger: { trigger: '#hero', scrub: true } });

    // headings
    $$('.split').forEach(h => gsap.to($$('.w>span', h), { yPercent: 0, duration: 1.1, stagger: .06, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%' } }));

    // generic reveals (batched, so siblings stagger)
    ScrollTrigger.batch('.reveal:not(.hero .reveal)', { start: 'top 88%', onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: .1, ease: 'power3.out', overwrite: true }) });
    ScrollTrigger.batch('.reveal-img', { start: 'top 90%', onEnter: els => gsap.to(els, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, stagger: .12, ease: 'power4.out' }) });

    // image parallax
    $$('[data-parallax]').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } }));
    $$('.b img').forEach(img => gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom 40%', scrub: true } }));

    // counters
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('en').replace(/,/g, ' ') + suf }) });
    });

    // process line draws as you scroll
    gsap.to('#stepsFill', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 70%', scrub: true } });

    // marquee speeds up with scroll velocity
    const track = $('.marquee__track');
    ScrollTrigger.create({ onUpdate: s => { const v = Math.min(Math.abs(s.getVelocity()) / 400, 6); track.style.animationDuration = Math.max(38 - v * 5, 10) + 's'; } });

    // magnetic buttons
    if (fine) $$('.magnetic').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });

    ScrollTrigger.refresh();
  }

  // safety: never leave the page locked behind the loader
  setTimeout(() => { if (document.body.contains(loader) && prog.v >= 100) loadDone.then(() => {}); }, 6000);
})();
