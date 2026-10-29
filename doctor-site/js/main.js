(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  try {
    var saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');
  } catch (e) {}
  $('#themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* Header scroll state + back to top */
  var header = $('#header'), totop = $('#totop');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-stuck', y > 10);
    totop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* Mobile nav */
  var burger = $('#burger'), nav = $('#nav');
  function setNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 860) setNav(false); });

  /* Active link on scroll */
  var links = $$('.nav a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* Reveal on scroll */
  var rev = $$('.reveal');
  rev.forEach(function (el, i) { el.style.setProperty('--d', ((i % 4) * 0.08) + 's'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  /* Counters */
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function count(el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1600;
    if (reduce) { el.textContent = fmt(to) + suf; return; }
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(count);

  /* Review slider */
  var track = $('#sliderTrack'), slides = $$('.review', track), dots = $('#dots'), idx = 0, timer;
  slides.forEach(function (_, i) {
    var b = d.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', (i + 1) + '-sharh');
    b.addEventListener('click', function () { go(i); restart(); });
    dots.appendChild(b);
  });
  function paint() { $$('button', dots).forEach(function (b, i) { b.classList.toggle('on', i === idx); }); }
  function go(i) {
    idx = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[idx].offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    paint();
  }
  track.addEventListener('scroll', function () {
    var w = track.clientWidth, n = Math.round(track.scrollLeft / w);
    if (n !== idx && n >= 0 && n < slides.length) { idx = n; paint(); }
  }, { passive: true });
  $('#prev').addEventListener('click', function () { go(idx - 1); restart(); });
  $('#next').addEventListener('click', function () { go(idx + 1); restart(); });
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 7000); }
  paint(); restart();
  $('#slider').addEventListener('mouseenter', function () { clearInterval(timer); });
  $('#slider').addEventListener('mouseleave', restart);

  /* Booking form */
  var form = $('#bookingForm'), dateEl = $('#date'), phone = $('#phone');
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateEl.min = today.toISOString().slice(0, 10);

  phone.addEventListener('input', function () {
    var v = phone.value.replace(/\D/g, '');
    if (v.indexOf('998') === 0) v = v.slice(3);
    v = v.slice(0, 9);
    var out = '+998';
    if (v.length) out += ' ' + v.slice(0, 2);
    if (v.length > 2) out += ' ' + v.slice(2, 5);
    if (v.length > 5) out += ' ' + v.slice(5, 7);
    if (v.length > 7) out += ' ' + v.slice(7, 9);
    phone.value = v.length ? out : '';
  });

  function setErr(input, msg) {
    var f = input.closest('.field'); f.classList.toggle('bad', !!msg);
    var s = $('.err', f); if (s) s.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#name');
    var ok = true;
    ok = setErr(name, name.value.trim().length < 3 ? "Ism-familiyani kiriting" : '') && ok;
    ok = setErr(phone, phone.value.replace(/\D/g, '').length < 12 ? "Telefon raqamni to'liq kiriting" : '') && ok;
    ok = setErr(dateEl, !dateEl.value ? 'Sanani tanlang' : '') && ok;
    if (!ok) { var bad = $('.bad input', form); if (bad) bad.focus(); return; }

    /* TODO: haqiqiy yuborish — o'z backend/Telegram bot/Formspree manzilingizni shu yerga ulang. */
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    try { console.info('Booking request:', data); } catch (e) {}

    $('#formOk').hidden = false;
    form.reset();
    setTimeout(function () { $('#formOk').hidden = true; }, 6000);
  });

  $('#year').textContent = new Date().getFullYear();
})();
