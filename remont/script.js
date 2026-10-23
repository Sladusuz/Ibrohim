(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 901px) and (hover:hover)');
  const root = document.documentElement;

  $('#year').textContent = new Date().getFullYear();

  /* ---- reveal on scroll (IntersectionObserver + CSS transitions) ---- */
  const items = $$('[data-r]');
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('js');
    items.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-r'));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 90 + 'ms');
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    items.forEach(el => io.observe(el));
    setTimeout(() => items.forEach(el => el.classList.add('in')), 8000); // safety net
  }

  /* ---- counters ---- */
  const fmt = n => n.toLocaleString('en').replace(/,/g, ' ');
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = fmt(v) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }), { threshold: .6 });
    counters.forEach(el => co.observe(el));
  }

  /* ---- nav, progress, hero parallax (one passive scroll handler, rAF throttled) ---- */
  const nav = $('#nav'), bar = $('#progress'), mbar = $('#mbar'), contact = $('#aloqa'), heroBg = $('#heroBg'), hero = $('#hero');
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
    if (mbar && contact) mbar.classList.toggle('hide', contact.getBoundingClientRect().top < innerHeight * .55);
    if (!reduce && desktop.matches && y < innerHeight * 1.2) heroBg.style.transform = 'translate3d(0,' + (y * .18).toFixed(1) + 'px,0)';
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* ---- mobile menu ---- */
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
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeLb(); } });
  matchMedia('(min-width: 1101px)').addEventListener('change', e => e.matches && setMenu(false));

  /* ---- hero slideshow ---- */
  const arch = $$('#arch img'), dots = $$('#dots i');
  let cur = 0, timer;
  const show = i => { arch[cur].classList.remove('on'); dots[cur].classList.remove('on'); cur = i; arch[cur].classList.add('on'); dots[cur].classList.add('on'); };
  const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((cur + 1) % arch.length), 4600); };
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : play());
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es[0].isIntersecting ? play() : clearInterval(timer)).observe(hero);
  else play();

  /* ---- services ---- */
  const svc = $$('.svc__item'), stage = $$('.svc__stage img');
  const pick = it => {
    svc.forEach(s => s.classList.toggle('on', s === it));
    stage.forEach((im, i) => im.classList.toggle('on', i === +it.dataset.img));
  };
  svc.forEach(it => {
    it.addEventListener('click', () => pick(it));
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(it); } });
    it.addEventListener('mouseenter', () => desktop.matches && pick(it));
  });

  /* ---- style tabs ---- */
  const tabs = $$('[role=tab]'), panels = $$('[role=tabpanel]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    panels.forEach(p => { const on = p.id === t.getAttribute('aria-controls'); p.hidden = !on; p.classList.toggle('on', on); });
  }));

  /* ---- carousel (native scroll-snap + buttons + mouse drag + progress) ---- */
  const car = $('#car'), carBar = $('#carBar');
  const step = () => (car.querySelector('.slide').offsetWidth + 16);
  $('#prev').addEventListener('click', () => car.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#next').addEventListener('click', () => car.scrollBy({ left: step(), behavior: 'smooth' }));
  car.addEventListener('keydown', e => { if (e.key === 'ArrowRight') car.scrollBy({ left: step(), behavior: 'smooth' }); if (e.key === 'ArrowLeft') car.scrollBy({ left: -step(), behavior: 'smooth' }); });
  let cTick = false;
  const prog = () => { cTick = false; const m = car.scrollWidth - car.clientWidth; carBar.style.transform = 'scaleX(' + Math.max(.12, m > 0 ? (car.scrollLeft / m) : 1) + ')'; };
  car.addEventListener('scroll', () => { if (!cTick) { cTick = true; requestAnimationFrame(prog); } }, { passive: true });
  prog();
  let down = false, sx = 0, sl = 0, moved = false;
  car.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = car.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; car.classList.add('drag'); } car.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; car.classList.remove('drag'); });

  /* ---- lightbox ---- */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  function closeLb() { lb.classList.remove('open'); }
  $$('.slide').forEach(s => s.addEventListener('click', () => { if (moved) { moved = false; return; } lbImg.src = s.dataset.full; lbImg.alt = $('img', s).alt; lb.classList.add('open'); }));
  lb.addEventListener('click', closeLb);

  /* ---- contact form -> Telegram with prefilled text ---- */
  const form = $('#form'), note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form)), okName = d.name.trim().length > 1, okPhone = d.phone.replace(/\D/g, '').length >= 9;
    form.elements.name.classList.toggle('invalid', !okName);
    form.elements.phone.classList.toggle('invalid', !okPhone);
    if (!okName || !okPhone) { note.textContent = 'Iltimos, ism va telefon raqamingizni to\'g\'ri kiriting.'; return; }
    const text = 'Assalomu alaykum! VIP REMONT saytidan murojaat.\nIsm: ' + d.name + '\nTelefon: ' + d.phone + '\nXizmat: ' + d.type + (d.msg.trim() ? '\nXabar: ' + d.msg : '');
    const url = 'https://t.me/vip_remont_uz?text=' + encodeURIComponent(text);
    const w = window.open(url, '_blank', 'noopener');
    note.textContent = w ? 'Telegram ochildi. Xabarni yuboring, tez orada javob beramiz.' : 'Telegram ochilmadi. Iltimos, +998 91 994 17 17 raqamiga qo\'ng\'iroq qiling.';
  });
})();
