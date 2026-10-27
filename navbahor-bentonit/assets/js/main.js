(function () {
  'use strict';

  // Aloqa ma'lumotlari — o'zingiznikiga almashtiring
  var CONTACT = {
    phone: '',            // masalan: '+998901234567'
    email: '',            // masalan: 'info@navbahor-bentonit.uz'
    phoneLabel: '+998 __ ___ __ __',
    emailLabel: 'info@example.uz'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Sticky header
  var header = $('#header'), totop = $('#totop');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-solid', y > 20);
    totop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = $('#burger'), nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Reveal + counters + chart
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n, mode) {
    var s = String(Math.round(n));
    return mode === 'space' ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  }
  function count(el) {
    var target = +el.dataset.count, mode = el.dataset.fmt;
    if (reduce) { el.textContent = fmt(target, mode); return; }
    var start = null, dur = 1600;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, mode);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // Boshlang'ich holat (JS o'chiq bo'lsa ham yakuniy qiymat ko'rinsin)
  $$('[data-count]').forEach(function (el) { el.textContent = fmt(+el.dataset.count, el.dataset.fmt); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal, .chart').forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { count(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { el.textContent = '0'; co.observe(el); });
  } else {
    $$('.reveal, .chart').forEach(function (el) { el.classList.add('is-in'); });
  }

  // Aloqa havolalari
  $$('[data-contact]').forEach(function (a) {
    var k = a.dataset.contact;
    if (k === 'phone' && CONTACT.phone) { a.href = 'tel:' + CONTACT.phone; a.textContent = CONTACT.phone; }
    else if (k === 'email' && CONTACT.email) { a.href = 'mailto:' + CONTACT.email; a.textContent = CONTACT.email; }
    else { a.removeAttribute('href'); a.style.cursor = 'default'; }
  });

  // Forma: e-pochta mijozi orqali yuboriladi (backend talab qilinmaydi)
  var form = $('#form'), msg = $('#formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form), ok = true;
    ['name', 'phone'].forEach(function (n) {
      var f = form.elements[n], bad = !String(d.get(n) || '').trim();
      f.classList.toggle('err', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.textContent = 'Iltimos, ism va telefon raqamini kiriting.'; return; }
    var body = [
      'Ism/Tashkilot: ' + d.get('name'),
      'Telefon: ' + d.get('phone'),
      'Qo\'llanish sohasi: ' + d.get('use'),
      'Hajm (tonna): ' + (d.get('qty') || '—'),
      '', d.get('msg') || ''
    ].join('\n');
    if (CONTACT.email) {
      window.location.href = 'mailto:' + CONTACT.email +
        '?subject=' + encodeURIComponent('Bentonit bo\'yicha so\'rov') +
        '&body=' + encodeURIComponent(body);
      msg.textContent = 'E-pochta dasturingiz ochildi. Xabarni yuboring — tez orada javob beramiz.';
    } else {
      msg.textContent = 'Aloqa e-pochtasi hali sozlanmagan (assets/js/main.js → CONTACT.email).';
    }
  });

  $('#year').textContent = new Date().getFullYear();
})();
