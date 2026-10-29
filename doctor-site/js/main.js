(function () {
  'use strict';
  var d = document;
  d.documentElement.classList.add('js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav */
  var burger = $('#burger'), nav = $('#nav');
  function setNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  d.addEventListener('click', function (e) { if (!e.target.closest('.pill')) setNav(false); });

  /* Active link */
  var links = $$('.nav a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* Reveal */
  var rev = $$('.reveal');
  rev.forEach(function (el, i) { el.style.setProperty('--d', ((i % 3) * 0.08) + 's'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  /* Highlight today in schedule */
  var today = String(new Date().getDay());
  $$('.day').forEach(function (el) {
    if (el.dataset.d === today && !el.classList.contains('day--off')) el.classList.add('today');
  });

  /* Booking form -> Telegram */
  var TG = 'doctor_oyy';
  var form = $('#bookingForm'), dateEl = $('#date'), phone = $('#phone'), note = $('#formNote');
  var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  dateEl.min = t.toISOString().slice(0, 10);

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
    var name = $('#name'), ok = true;
    ok = setErr(name, name.value.trim().length < 2 ? 'Ismingizni kiriting' : '') && ok;
    ok = setErr(phone, phone.value.replace(/\D/g, '').length < 12 ? "Telefon raqamni to'liq kiriting" : '') && ok;
    ok = setErr(dateEl, !dateEl.value ? 'Sanani tanlang' : '') && ok;
    if (!ok) { var bad = $('.bad input', form); if (bad) bad.focus(); return; }

    var text = "Assalomu alaykum! Qabulga yozilmoqchiman.\n" +
      "Ism: " + name.value.trim() + "\n" +
      "Telefon: " + phone.value + "\n" +
      "Qabul turi: " + $('#type').value + "\n" +
      "Sana: " + dateEl.value +
      ($('#msg').value.trim() ? "\nIzoh: " + $('#msg').value.trim() : '');
    var url = 'https://t.me/' + TG + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
    note.innerHTML = 'Telegram ochilmadimi? <a href="' + url + '" target="_blank" rel="noopener" style="color:var(--rose);font-weight:700">Bu yerni bosing</a> yoki +998 90 045 84 84 raqamiga qo\'ng\'iroq qiling.';
  });

  $('#year').textContent = new Date().getFullYear();
})();
