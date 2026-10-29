(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  root.classList.add('js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var hasIO = 'IntersectionObserver' in window;



  /* ---------- Language (uz / ru) ---------- */
  var RU = (window.I18N && window.I18N.ru) || { map: {}, chat: null };
  var LANG = 'uz';
  try {
    var qm = /[?&]lang=(uz|ru)/.exec(location.search);
    LANG = qm ? qm[1] : (localStorage.getItem('lang') || 'uz');
    if (qm) localStorage.setItem('lang', LANG);
  } catch (e) { var qm2 = /[?&]lang=(uz|ru)/.exec(location.search); if (qm2) LANG = qm2[1]; }
  if (LANG !== 'ru') LANG = 'uz';
  root.setAttribute('lang', LANG);
  function tr(s) { return LANG === 'ru' && RU.map[s] !== undefined ? RU.map[s] : s; }
  function translateDOM() {
    $$('[data-ru]').forEach(function (el) {
      for (var i = 0; i < el.childNodes.length; i++) if (el.childNodes[i].nodeType === 3 && el.childNodes[i].nodeValue.trim()) { el.childNodes[i].nodeValue = el.getAttribute('data-ru'); break; }
    });
    var w = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) { var pe = n.parentElement; if (pe && !/^(SCRIPT|STYLE)$/.test(pe.tagName)) list.push(n); }
    list.forEach(function (n) {
      var raw = n.nodeValue, key = raw.replace(/\s+/g, ' ').trim();
      if (key && RU.map[key] !== undefined) { var v = RU.map[key]; n.nodeValue = (/^[.,;:!?]/.test(v) ? '' : raw.match(/^\s*/)[0]) + v + raw.match(/\s*$/)[0]; }
    });
    $$('[aria-label],[placeholder],[title],[alt]').forEach(function (el) {
      ['aria-label', 'placeholder', 'title', 'alt'].forEach(function (a) {
        var v = el.getAttribute(a); if (v && RU.map[v] !== undefined) el.setAttribute(a, RU.map[v]);
      });
    });
    d.title = tr(d.title);
    [['meta[name="description"]'], ['meta[property="og:title"]'], ['meta[property="og:description"]']].forEach(function (x) {
      var m = $(x[0]); if (m && RU.map[m.content] !== undefined) m.content = RU.map[m.content];
    });
  }
  if (LANG === 'ru') translateDOM();
  var quick = false;
  try { quick = sessionStorage.getItem('quick') === '1'; sessionStorage.removeItem('quick'); } catch (e) {}
  (function () {
    var btn = $('#langBtn'), menu = $('#langMenu'); if (!btn || !menu) return;
    var opts = $$('li', menu);
    function setLang(l) {
      if (l === LANG) { close(); return; }
      try { localStorage.setItem('lang', l); localStorage.setItem('lang-asked', '1'); sessionStorage.setItem('quick', '1'); } catch (e) {}
      if (/[?&]lang=/.test(location.search)) location.replace(location.pathname + (location.hash || ''));
      else location.reload();
    }
    function open() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); var cur = menu.querySelector('[aria-selected="true"]'); if (cur && fineInput) cur.focus(); }
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    var fineInput = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    btn.querySelector('use').setAttribute('href', '#flag-' + LANG);
    btn.querySelector('.lang__code').textContent = LANG.toUpperCase();
    opts.forEach(function (li) {
      li.setAttribute('aria-selected', li.getAttribute('data-lang') === LANG);
      li.addEventListener('click', function () { setLang(li.getAttribute('data-lang')); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLang(li.getAttribute('data-lang')); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var i = opts.indexOf(li) + (e.key === 'ArrowDown' ? 1 : -1); opts[(i + opts.length) % opts.length].focus(); }
      });
    });
    btn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden ? open() : close(); });
    d.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('#langSw')) close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
    /* one-time suggestion for Russian-speaking visitors */
    var tip = $('#langTip');
    try {
      var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).join(',').toLowerCase();
      var asked = localStorage.getItem('lang-asked') || localStorage.getItem('lang');
      if (tip && LANG === 'uz' && !asked && /(^|,)ru/.test(langs)) {
        setTimeout(function () { tip.hidden = false; }, 2600);
        $('#langTipGo').addEventListener('click', function () { setLang('ru'); });
        $('#langTipX').addEventListener('click', function () { tip.hidden = true; try { localStorage.setItem('lang-asked', '1'); } catch (e) {} });
      }
    } catch (e) {}
  })();

  /* ---------- Tashkent time helpers ---------- */
  var DAYN = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  var SLOT = { 1: [8, 14], 2: [13, 18], 3: [8, 14], 4: [13, 18], 5: [8, 14] };
  function nowTashkent() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: map[o.weekday], min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function openStatus() {
    var n = nowTashkent(), s = SLOT[n.day];
    if (s && n.min >= s[0] * 60 && n.min < s[1] * 60) return { open: true, text: LANG === 'ru' ? 'Сейчас приём открыт · до ' + pad(s[1]) + ':00' : 'Hozir qabul ochiq · ' + pad(s[1]) + ':00 gacha' };
    for (var i = 0; i < 8; i++) {
      var dd = (n.day + i) % 7, sl = SLOT[dd];
      if (!sl) continue;
      if (i === 0 && n.min >= sl[0] * 60) continue;
      if (LANG === 'ru') return { open: false, text: 'Сейчас закрыто · ' + (i === 0 ? 'сегодня' : i === 1 ? 'завтра' : ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'][dd]) + ' с ' + pad(sl[0]) + ':00' };
      return { open: false, text: 'Hozir yopiq · ' + (i === 0 ? 'bugun' : i === 1 ? 'ertaga' : DAYN[dd].toLowerCase()) + ' ' + pad(sl[0]) + ':00 dan' };
    }
    return { open: false, text: tr('Yunusobod, Toshkent') };
  }
  (function () {
    var tag = $('#openTag'), txt = $('#openTxt'); if (!tag) return;
    function upd() { var st = openStatus(); txt.textContent = st.text; tag.classList.toggle('closed', !st.open); }
    upd(); setInterval(upd, 60000);
  })();

  /* ---------- Split headings into words ---------- */
  function splitNode(node, state) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
          var w = d.createElement('span'); w.className = 'w';
          var i = d.createElement('span'); i.textContent = part; i.style.setProperty('--i', state.i++);
          w.appendChild(i); frag.appendChild(w);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) splitNode(n, state);
    });
  }
  var splits = $$('.split');
  splits.forEach(function (h) { h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()); splitNode(h, { i: 0 }); });

  /* ---------- Loader ---------- */
  var loader = $('#loader'), loaded = false;
  body.classList.add('is-loading');
  function start() {
    if (loaded) return; loaded = true;
    loader.classList.add('done');
    body.classList.remove('is-loading');
    setTimeout(function () {
      $$('.hero .split').forEach(function (h) { h.classList.add('in'); });
      $$('.hero .reveal').forEach(function (el) { el.classList.add('in'); });
      initReveal();
    }, quick ? 60 : 450);
    setTimeout(function () { loader.style.display = 'none'; }, quick ? 0 : 1300);
  }
  var t0 = Date.now();
  if (quick) loader.style.display = 'none';
  function ready() { setTimeout(start, Math.max(0, (reduce || quick ? 0 : 1300) - (Date.now() - t0))); }
  if (d.readyState === 'complete') ready(); else window.addEventListener('load', ready);
  setTimeout(start, 4000);

  /* ---------- Reveal on scroll ---------- */
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function count(el) {
    var to = +el.dataset.count, t = null, dur = 1800;
    if (reduce) { el.textContent = fmt(to); return; }
    requestAnimationFrame(function step(ts) {
      if (!t) t = ts;
      var p = Math.min((ts - t) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  var revInit = false;
  function initReveal() {
    if (revInit) return; revInit = true;
    var rev = $$('.reveal:not(.in), .split:not(.in), .week');
    rev.forEach(function (el, i) { if (el.classList.contains('reveal')) el.style.setProperty('--d', ((i % 3) * 0.09) + 's'); });
    $$('.day').forEach(function (el, i) { el.classList.add('reveal-d'); el.style.setProperty('--i', i); });
    if (hasIO && !reduce) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      rev.forEach(function (el) { io.observe(el); });
    } else rev.forEach(function (el) { el.classList.add('in'); });
    var cs = $$('[data-count]');
    if (hasIO) {
      var co = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
      }, { threshold: 0.6 });
      cs.forEach(function (c) { co.observe(c); });
    } else cs.forEach(count);
  }

  /* ---------- Header: hide on scroll down, progress bar ---------- */
  var header = $('#header'), prog = $('#progress'), lastY = 0, ticking = false, userScrolled = false;
  ['wheel', 'touchmove', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { userScrolled = true; }, { passive: true, once: true }); });
  var parallax = $$('[data-speed]');
  var blobs = $$('.blob');
  function onScroll() {
    var y = window.scrollY, h = root.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    header.classList.toggle('stuck', y > 20);
    var menuOpen = $('#nav').classList.contains('open');
    var settled = userScrolled;
    var dy = y - lastY;
    header.classList.toggle('hide', settled && y > 500 && dy > 4 && dy < 400 && !menuOpen);
    if (y < lastY - 4 || y < 500 || !settled) header.classList.remove('hide');
    lastY = y;
    if (!reduce) {
      parallax.forEach(function (el) { el.style.translate = '0 ' + (y * parseFloat(el.dataset.speed)) + 'px'; });
      if (y < 1400) blobs.forEach(function (b, i) { b.style.translate = '0 ' + (y * (i ? -.12 : .18)) + 'px'; });
      var ai = $('.about__img img'); if (ai) {
        var r = ai.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) ai.style.translate = '0 ' + ((r.top - window.innerHeight / 2) * -.06) + 'px';
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function setNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', tr(open ? 'Menyuni yopish' : 'Menyuni ochish'));
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  d.addEventListener('click', function (e) { if (!e.target.closest('.pill')) setNav(false); });

  /* ---------- Active link ---------- */
  var links = $$('.nav a[href^="#"]:not(.btn)');
  if (hasIO) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Tilt + glow + magnetic + cursor (pointer devices) ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      var max = +el.dataset.tilt || 6;
      el.addEventListener('pointerenter', function () { el.classList.add('tilt-on'); });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((x - .5) * max * 2) + 'deg');
        el.style.setProperty('--rx', ((.5 - y) * max * 2) + 'deg');
        el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
        var img = $('img', el); if (img && el.classList.contains('arch')) img.style.translate = ((x - .5) * -18) + 'px ' + ((y - .5) * -18) + 'px';
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
        var img = $('img', el); if (img && el.classList.contains('arch')) img.style.translate = '0 0';
      });
    });
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.translate = ((e.clientX - r.left - r.width / 2) * .22) + 'px ' + ((e.clientY - r.top - r.height / 2) * .32) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = '0 0'; });
    });
    /* hero mouse parallax */
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
      $$('.chip, .spin', hero).forEach(function (el, i) { el.style.translate = (x * (i + 1) * -16) + 'px ' + (y * (i + 1) * -16) + 'px'; });
    });
    /* cursor */
    var cur = $('#cursor'), cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    d.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
    (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    d.addEventListener('pointerover', function (e) { cur.classList.toggle('big', !!e.target.closest('a,button,summary,input,select,textarea,[data-tilt]')); });
  }

  /* ---------- Button ripple ---------- */
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) {
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) / 4, el = d.createElement('span');
      el.className = 'ripple'; el.style.width = el.style.height = s * 2 + 'px';
      el.style.left = (e.clientX - r.left - s) + 'px'; el.style.top = (e.clientY - r.top - s) + 'px';
      b.appendChild(el); setTimeout(function () { el.remove(); }, 700);
    });
  });

  /* ---------- Smooth FAQ accordion ---------- */
  $$('.acc details').forEach(function (det) {
    var sum = $('summary', det), anim = null;
    sum.addEventListener('click', function (e) {
      if (reduce || !det.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      var start = det.offsetHeight, opening = !det.open;
      if (opening) det.open = true;
      var end = opening ? det.scrollHeight : sum.offsetHeight + 0;
      det.style.overflow = 'hidden';
      anim = det.animate({ height: [start + 'px', end + 'px'] }, { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      anim.onfinish = function () { det.open = opening; det.style.overflow = ''; anim = null; };
    });
  });

  /* ---------- Schedule: highlight today ---------- */
  var today = String(nowTashkent().day);
  $$('.day').forEach(function (el) { if (el.dataset.d === today && !el.classList.contains('day--off')) el.classList.add('today'); });

  /* ---------- Booking form -> Telegram ---------- */
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
    ok = setErr(name, name.value.trim().length < 2 ? tr('Ismingizni kiriting') : '') && ok;
    ok = setErr(phone, phone.value.replace(/\D/g, '').length < 12 ? tr("Telefon raqamni to'liq kiriting") : '') && ok;
    ok = setErr(dateEl, !dateEl.value ? tr('Sanani tanlang') : '') && ok;
    if (!ok) { var bad = $('.bad input', form); if (bad) bad.focus(); return; }
    var text = tr("Assalomu alaykum! Qabulga yozilmoqchiman.") + "\n" +
      tr("Ism:") + " " + name.value.trim() + "\n" + tr("Telefon:") + " " + phone.value + "\n" + tr("Qabul turi:") + " " + $('#type').value + "\n" + tr("Sana:") + " " + dateEl.value +
      ($('#msg').value.trim() ? "\n" + tr("Izoh:") + " " + $('#msg').value.trim() : '');
    var url = 'https://t.me/' + TG + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
    note.innerHTML = tr('Telegram ochilmadimi?') + ' <a href="' + url + '" target="_blank" rel="noopener" style="color:var(--rose);font-weight:700">' + tr('Bu yerni bosing') + '</a> ' + tr("yoki +998 90 045 84 84 raqamiga qo'ng'iroq qiling.");
  });


  /* ---------- Support assistant ---------- */
  (function () {
    var fab = $('#chatFab'), box = $('#chat'), log = $('#chatLog'), form = $('#chatForm'), input = $('#chatInput'), hint = $('#chatHint');
    var started = false, busy = false;
    var PHONE = '+998900458484', PHONE_TXT = '+998 90 045 84 84', TGU = 'https://t.me/doctor_oyy', IG = 'https://instagram.com/doctor.oyy';
    var MAP = 'https://www.google.com/maps/dir/?api=1&destination=41.36758,69.311464';
    var DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    var HOURS = { 1: '08:00 – 14:00', 2: '13:00 – 18:00', 3: '08:00 – 14:00', 4: '13:00 – 18:00', 5: '08:00 – 14:00' };

    var A = {
      call: { t: "Qo'ng'iroq", ic: 'phone', href: 'tel:' + PHONE, pri: 1 },
      tg: { t: 'Telegram', ic: 'telegram', href: TGU },
      ig: { t: 'Instagram', ic: 'insta', href: IG },
      map: { t: "Yo'nalish olish", ic: 'pin', href: MAP, pri: 1 },
      book: { t: 'Qabulga yozilish', ic: 'cal', go: '#booking', pri: 1 },
      price: { t: 'Narxlar', ic: 'tag', topic: 'price' },
      hours: { t: 'Qabul vaqti', ic: 'clock', topic: 'hours' }
    };
    var T = {
      price: { icon: 'tag', label: 'Narx', q: 'Narx qancha?',
        a: "<b>Offlayn konsultatsiya:</b> 200 000 so'm<br><b>Onlayn konsultatsiya:</b> 300 000 so'm<br>Ikkala holatda ham 15 kun ichida qayta ko'rikdan o'tish imkoniyati bor.",
        acts: ['book', 'call'] },
      address: { icon: 'pin', label: 'Manzil', q: 'Manzil qayerda?',
        a: "<b>Toshkent sh., Yunusobod tumani, 17-kvartal.</b><br>Quyidagi tugma orqali xaritada yo'nalishni oching.", acts: ['map', 'call'] },
      hours: { icon: 'clock', label: 'Qabul vaqti', q: 'Qabul vaqti qanday?', a: function () {
          var n = nowTashkent().day, today = HOURS[n] ? 'Bugun (' + DAYS[n].toLowerCase() + ') qabul: <b>' + HOURS[n] + '</b>.' : 'Bugun (' + DAYS[n].toLowerCase() + ') dam olish kuni.';
          return '<b>Dushanba, chorshanba, juma:</b> 08:00 – 14:00<br><b>Seshanba, payshanba:</b> 13:00 – 18:00<br><b>Shanba, yakshanba:</b> dam olish<br><br>' + today; },
        acts: ['book', 'call'] },
      online: { icon: 'video', label: 'Onlayn konsultatsiya', q: 'Onlayn konsultatsiya haqida',
        a: "Onlayn konsultatsiya narxi — <b>300 000 so'm</b>. Yozilgach, kelishilgan vaqtda Telegram orqali video yoki chat aloqasi o'rnatiladi. 15 kun ichida qayta ko'rik imkoniyati bor.", acts: ['book', 'tg'] },
      about: { icon: 'user', label: 'Shifokor haqida', q: 'Shifokor haqida',
        a: "<b>Dr. Oyimxon Mirsadikova</b> — ayollar shifokori, <b>6 yillik</b> klinik tajribaga ega. Qabul shoshilmasdan, batafsil suhbatdan boshlanadi va davolash rejasi tushunarli tilda tushuntiriladi.", acts: ['book', 'ig'] },
      booking: { icon: 'cal', label: 'Yozilish', q: 'Qabulga yozilmoqchiman',
        a: "Qabulga yozilishning 3 usuli: sayt formasi (Telegram orqali yuboriladi), qo'ng'iroq yoki Telegram. Offlayn — 200 000 so'm, onlayn — 300 000 so'm.", acts: ['book', 'call', 'tg'] },
      contact: { icon: 'phone', label: 'Aloqa', q: "Aloqa ma'lumotlari",
        a: "<b>Telefon:</b> " + PHONE_TXT + "<br><b>Telegram:</b> @doctor_oyy<br><b>Instagram:</b> @doctor.oyy", acts: ['call', 'tg', 'ig'] },
      derma: { a: "Ko'rik paytida <b>dermatoskop</b> yordam beradi — u teri va undagi o'simtalarni (xol va boshqalar) kattalashtirib ko'rsatadi. Uning yordamida o'simtalarning <b>xavfli yoki xavfsiz</b> ekanini dastlabki baholash mumkin. Yakuniy tashxisni shifokor ko'rikdan so'ng qo'yadi. Kabinetda yuzma-yuz qabulda qo'llaniladi.", acts: ['book', 'call'] },
      medical: { a: "Tashxis va davolashni faqat shifokor ko'rikdan so'ng belgilaydi, shuning uchun bu savolga bu yerda javob bera olmayman. Shifokor bilan batafsil gaplashish uchun qabulga yoziling.", acts: ['book', 'call'] },
      urgent: { a: "<b>Shoshilinch holatda</b> kutmang — darhol <b>103</b> tez yordamga qo'ng'iroq qiling yoki eng yaqin shifoxonaga murojaat qiling.", acts: [] },
      hello: { a: "Assalomu alaykum! Qanday yordam bera olaman? Mavzuni tanlang yoki savolingizni yozing.", acts: [] },
      thanks: { a: "Arzimaydi! Yana savolingiz bo'lsa, yozing. Salomat bo'ling! 🌸", acts: ['book'] },
      fallback: { a: "Savolingizni to'liq tushunmadim. Quyidagi mavzulardan birini tanlang yoki shifokor/administrator bilan bevosita bog'laning.", acts: ['call', 'tg'], menu: true }
    };
    var KEYS = [
      ['derma', /dermatoskop|dermatoscop|dermoskop|dermatoskopiya|lupa|kattalashtir|дерматоскоп|дерматоскоп|лупа/],
      ['urgent', /shoshilinch|tez yordam|zudlik|qon ket|hushidan|nafas ol.*qiyin|быстр|срочн|скора[яй]|экстренн|шошилинч/],
      ['price', /narx|necha pul|qancha|\bso'?m\b|tolov|to'?lov|pul|puli|arzon|qimmat|стоимост|цена|сколько|нарх|канча|қанча|сўм/],
      ['address', /manzil|qayerda|qaerda|joylash|lokatsiya|location|xarita|map|yo'?l|mo'?ljal|kvartal|yunusobod|qanday borish|адрес|где|карта|манзил|қаерда|хариста/],
      ['hours', /понедельник|вторник|сред[аы]|четверг|пятниц|суббот|воскресень|выходн|часы|график|расписани|vaqt|soat|ish tartib|qachon|kun(i|lari)?\b|dushanba|seshanba|chorshanba|payshanba|juma|shanba|yakshanba|dam olish|ochiq|график|время|когда|режим|вақт|соат|қачон/],
      ['online', /onlayn|online|video|zoom|masofa|uydan|интернет|онлайн|видео|дистанц/],
      ['about', /shifokor|doktor|doctor|oyimxon|tajriba|\bkim\b|mutaxassis|ixtisos|врач|доктор|опыт|шифокор|тажриба/],
      ['booking', /yoz(il|ish|moq|aman)|qabul(ga)?|navbat|bron|bron qil|записа|запись|прием|приём|ёзил|қабул|навбат/],
      ['contact', /aloqa|telefon|raqam|nomer|номер|telegram|instagram|insta|\btg\b|bog'?lan|связ|телефон|алоқа|контакт|call/],
      ['medical', /og'?ri|og'?riq|qorin|bosh og|kasal|tashxis|davol|dori|analiz|tahlil|homilad|hayz|bosim|simptom|belgi|bolalar|bepusht|bolasi|ogriq|боль|болезн|диагноз|лечени|симптом|анализ|беременн|огриқ|касал|ташхис|даво/],
      ['thanks', /rahmat|raxmat|rahm|tashakkur|spasibo|спасибо|рахмат|thanks|thank/],
      ['hello', /^(salom|assalom|hello|hi|hey|привет|здравствуй|салом|ассалом|aleykum|alaykum|алейкум|қалайсиз|qalaysiz|yaxshimisiz)/]
    ];
    var WELCOME = 'Salom! 👋 Men <b>Dr. Oyimxon Mirsadikova</b> saytining yordamchisiman. Savolingizni yozing yoki quyidagi mavzulardan tanlang.<small>Bu tibbiy maslahat emas. Tashxis faqat shifokor ko\'rigida qo\'yiladi.</small>';
    if (LANG === 'ru' && RU.chat) {
      var RC = RU.chat;
      Object.keys(RC.A).forEach(function (k) { A[k].t = RC.A[k]; });
      Object.keys(RC.T).forEach(function (k) { var o = RC.T[k]; Object.keys(o).forEach(function (f) { T[k][f] = o[f]; }); });
      T.hours.a = function () {
        var n = nowTashkent().day;
        return RC.hoursA + (HOURS[n] ? RC.todayOpen.replace('{d}', RC.DAYS[n]).replace('{h}', HOURS[n]) : RC.todayOff.replace('{d}', RC.DAYS[n]));
      };
      WELCOME = RC.welcome;
    }
    function norm(s) { return s.toLowerCase().replace(/[’‘`ʻʼ]/g, "'").replace(/\s+/g, ' ').trim(); }
    function detect(s) {
      s = norm(s);
      for (var i = 0; i < KEYS.length; i++) if (KEYS[i][1].test(s)) return KEYS[i][0];
      return 'fallback';
    }

    function scroll() { log.scrollTop = log.scrollHeight; }
    function add(cls, html) { var m = d.createElement('div'); m.className = 'msg ' + cls; m.innerHTML = html; log.appendChild(m); scroll(); return m; }
    function ico(n) { return '<svg class="ic"><use href="#i-' + n + '"/></svg>'; }
    function actsHtml(keys) {
      if (!keys || !keys.length) return '';
      return '<div class="acts">' + keys.map(function (k) {
        var a = A[k];
        if (a.href) return '<a class="' + (a.pri ? 'pri' : '') + '" href="' + a.href + '"' + (a.href.indexOf('tel:') ? ' target="_blank" rel="noopener"' : '') + '>' + ico(a.ic) + a.t + '</a>';
        if (a.go) return '<button type="button" class="' + (a.pri ? 'pri' : '') + '" data-go="' + a.go + '">' + ico(a.ic) + a.t + '</button>';
        return '<button type="button" data-topic="' + a.topic + '">' + ico(a.ic) + a.t + '</button>';
      }).join('') + '</div>';
    }
    function menuHtml() {
      var order = ['price', 'address', 'hours', 'online', 'about', 'booking', 'contact'];
      return '<div class="qr">' + order.map(function (k) { return '<button type="button" data-topic="' + k + '">' + ico(T[k].icon) + T[k].label + '</button>'; }).join('') +
        '<button type="button" data-topic="telegram">' + ico('telegram') + 'Telegram</button></div>';
    }
    function bot(html, delay, cb) {
      busy = true;
      var tp = add('msg--bot', '<span class="typing"><i></i><i></i><i></i></span>');
      setTimeout(function () { tp.className = 'msg msg--bot'; tp.innerHTML = html; scroll(); busy = false; if (cb) cb(); next(); }, reduce ? 0 : delay);
    }
    function answer(key) {
      var t = T[key]; if (!t) return;
      var txt = typeof t.a === 'function' ? t.a() : t.a;
      bot(txt + actsHtml(t.acts) + (t.menu ? '<div style="margin-top:12px">' + menuHtml() + '</div>' : ''), 650 + Math.min(txt.length * 3, 700));
    }
    var queue = [];
    function ask(text, key) {
      if (busy) { queue.push([text, key]); return; }
      add('msg--me', ''); log.lastChild.textContent = text;
      answer(key || detect(text));
    }
    function next() { if (queue.length) { var q = queue.shift(); ask(q[0], q[1]); } }
    function welcome() {
      started = true;
      add('msg--bot', WELCOME);
      add('msg--menu', menuHtml());
    }
    function openChat(o) {
      var open = o === undefined ? box.hidden : o;
      box.hidden = !open;
      fab.classList.toggle('open', open); body.classList.toggle('chat-open', open);
      fab.setAttribute('aria-expanded', open); fab.setAttribute('aria-label', tr(open ? 'Yordamchini yopish' : 'Yordamchini ochish'));
      hint.classList.remove('show'); hintDone = true;
      if (open) { if (!started) welcome(); if (fine) setTimeout(function () { input.focus(); }, 300); }
    }
    var hintDone = false;
    fab.addEventListener('click', function () { openChat(); });
    $('#chatClose').addEventListener('click', function () { openChat(false); fab.focus(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) openChat(false); });
    log.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.go) {
        var el = $(b.dataset.go); if (!el) return;
        if (window.innerWidth <= 640) openChat(false);
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      var k = b.dataset.topic; if (!k) return;
      if (k === 'telegram') { ask('Telegram', 'contact'); return; }
      ask(T[k].q, k);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v) return;
      input.value = ''; ask(v);
    });
    setTimeout(function () { if (!hintDone && box.hidden) { hint.classList.add('show'); setTimeout(function () { hint.classList.remove('show'); }, 6000); } }, 9000);
  })();

  $('#year').textContent = new Date().getFullYear();
})();
