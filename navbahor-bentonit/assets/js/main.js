(function () {
  'use strict';

  /* ===== Sozlamalar: o'zingizniki bilan almashtiring ===== */
  var CONTACT = {
    phone: '',      // '+998901234567'
    email: '',      // 'info@navbahor-bentonit.uz'
    telegram: ''    // 'navbahor_bentonit' (@ siz)
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var G = window.gsap, ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var hasGsap = !!(G && ST);
  if (hasGsap) G.registerPlugin(ST);

  /* ================= i18n ================= */
  var LANGS = ['uz', 'ru', 'en'];
  var lang = 'uz';
  var t = function (k) { var d = window.I18N[lang]; return (d && d[k]) || window.I18N.uz[k] || k; };

  function detectLang() {
    var q = /[?&]lang=(uz|ru|en)/.exec(location.search);
    if (q) return q[1];
    try { var s = localStorage.getItem('nb-lang'); if (s && LANGS.indexOf(s) > -1) return s; } catch (e) {}
    var n = (navigator.language || 'uz').slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) > -1 ? n : 'uz';
  }

  function applyLang(l, silent) {
    lang = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    document.title = t('meta.title');
    var md = $('meta[name=description]'); if (md) md.content = t('meta.desc');
    $$('#lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    $('#lang').style.setProperty('--i', LANGS.indexOf(l));
    try { localStorage.setItem('nb-lang', l); } catch (e) {}
    renderCfg(!silent);
    buildStatement();
    drawMapLabels = true;
    if (hasGsap) { clearTimeout(applyLang._t); applyLang._t = setTimeout(function () { ST.refresh(); }, 120); }
  }
  $$('#lang button').forEach(function (b) {
    b.addEventListener('click', function () { if (b.dataset.lang !== lang) applyLang(b.dataset.lang); });
  });

  /* ================= header / menu / progress ================= */
  var hdr = $('#hdr'), nav = $('#nav'), burger = $('#burger'), prog = $('#progress');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    hdr.classList.toggle('solid', y > 40);
    var menuOpen = nav.classList.contains('open');
    hdr.classList.toggle('hide', y > 500 && y > lastY + 6 && !menuOpen);
    if (y < lastY - 4) hdr.classList.remove('hide');
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function setMenu(o) { nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLb(); } });

  // aktiv menyu
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('a', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { $$('a', nav).forEach(function (a) { a.classList.remove('act'); }); if (links[e.target.id]) links[e.target.id].classList.add('act'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ================= cursor / magnetic / spotlight ================= */
  if (fine) {
    var cur = $('#cursor'), dot = $('i', cur), ring = $('b', cur);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; cur.classList.add('on'); });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    (function loop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)' + (cur.classList.contains('hov') ? ' scale(1.7)' : '');
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      cur.classList.toggle('hov', !!e.target.closest('a,button,summary,.spot,.dest li,input,select,textarea,[data-cursor]'));
    });
    // magnetic
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }
  document.addEventListener('mousemove', function (e) {
    var s = e.target.closest && e.target.closest('.spot');
    if (!s) return;
    var r = s.getBoundingClientRect();
    s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    s.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // hero tilt
  var vis = $('#tilt');
  if (vis && fine && !reduce) {
    var hero = $('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = vis.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = (e.clientX - cx) / innerWidth, dy = (e.clientY - cy) / innerHeight;
      vis.style.setProperty('--ry', (dx * 18) + 'deg');
      vis.style.setProperty('--rx', (-dy * 18) + 'deg');
      $('.orb', vis).style.setProperty('--rx', (-dy * 14) + 'deg');
      $('.orb', vis).style.setProperty('--ry', (dx * 14) + 'deg');
    });
    hero.addEventListener('mouseleave', function () {
      $('.orb', vis).style.setProperty('--rx', '0deg'); $('.orb', vis).style.setProperty('--ry', '0deg');
    });
  }

  /* ================= hero dust canvas ================= */
  (function dust() {
    var c = $('#dust'); if (!c) return;
    var x = c.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), P = [], mouse = { x: -999, y: -999 }, run = true, tt = 0;
    var cols = ['227,169,72', '245,203,131', '53,194,176', '236,229,214'];
    function size() {
      W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(170, W * H / 9000));
      P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, a: Math.random() * .55 + .15, c: cols[(Math.random() * 4) | 0], s: Math.random() * .6 + .25, z: Math.random() });
    }
    size(); addEventListener('resize', size);
    c.parentNode.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    c.parentNode.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { run = e[0].isIntersecting; }).observe(c);
    function frame() {
      requestAnimationFrame(frame);
      if (!run) return;
      tt += .004; x.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], ang = Math.sin(p.x * .0021 + tt * 1.3) * 1.6 + Math.cos(p.y * .003 - tt) * 1.2;
        p.x += Math.cos(ang) * p.s * (.5 + p.z) + .12; p.y += Math.sin(ang) * p.s * (.5 + p.z) - .06;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d = dx * dx + dy * dy;
        if (d < 19600) { var f = (1 - Math.sqrt(d) / 140) * 3.2; p.x += dx * f * .02 * 6; p.y += dy * f * .02 * 6; }
        if (p.x > W + 10) p.x = -10; if (p.x < -10) p.x = W + 10; if (p.y > H + 10) p.y = -10; if (p.y < -10) p.y = H + 10;
        x.beginPath(); x.fillStyle = 'rgba(' + p.c + ',' + p.a + ')'; x.arc(p.x, p.y, p.r * (.6 + p.z), 0, 6.2832); x.fill();
      }
    }
    if (reduce) { run = true; frame(); } else frame();
  })();

  /* ================= statement (scroll-highlight words) ================= */
  var stTween = null;
  function buildStatement() {
    var el = $('#statement'); if (!el) return;
    var txt = t('about.statement');
    el.innerHTML = '';
    txt.split(' ').forEach(function (w, i, a) {
      var s = document.createElement('span'); s.className = 'w'; s.textContent = w; el.appendChild(s);
      if (i < a.length - 1) el.appendChild(document.createTextNode(' '));
    });
    if (stTween) { stTween.scrollTrigger && stTween.scrollTrigger.kill(); stTween.kill(); stTween = null; }
    if (hasGsap && !reduce) {
      stTween = G.to($$('.w', el), { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: .4 } });
    } else { $$('.w', el).forEach(function (w) { w.style.opacity = 1; }); }
  }

  /* ================= configurator ================= */
  var CFG = { use: 'drill', pack: 'bag', term: 'EXW' };
  var USE = {
    drill: { rows: [['prm.moist', 'val.order'], ['prm.frac', 'val.order'], ['prm.swell', 'val.lab'], ['prm.visc', 'val.lab'], ['prm.filt', 'val.lab']] },
    build: { rows: [['prm.moist', 'val.order'], ['prm.frac', 'val.order'], ['prm.swell', 'val.lab']] },
    ind: { rows: [['prm.moist', 'val.order'], ['prm.frac', 'val.order'], ['prm.comp', 'val.lab']] },
    custom: { rows: [['prm.spec', 'val.contract'], ['prm.moist', 'val.contract'], ['prm.frac', 'val.contract']] }
  };
  function renderCfg(animate) {
    var u = USE[CFG.use];
    $('#cfgT').textContent = t('prod.' + CFG.use + '.t');
    $('#cfgP').textContent = t('prod.' + CFG.use + '.p');
    var tb = $('#cfgRows'); tb.innerHTML = '';
    u.rows.forEach(function (r, i) {
      var tr = document.createElement('tr');
      if (animate) tr.style.animationDelay = (i * 70) + 'ms'; else tr.style.animation = 'none';
      tr.innerHTML = '<th scope="row"></th><td></td>';
      tr.children[0].textContent = t(r[0]); tr.children[1].textContent = t(r[1]);
      tb.appendChild(tr);
    });
    $('#cfgSum').textContent = t('prod.u.' + CFG.use) + ' · ' + t('pack.' + CFG.pack) + ' · ' + CFG.term;
    $$('#useTabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.use === CFG.use)); });
    $$('#packTabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.pack === CFG.pack)); });
    $$('#termTabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.term === CFG.term)); });
    var f = $('#form');
    if (f) { f.elements.use.value = CFG.use; f.elements.pack.value = CFG.pack; f.elements.terms.value = CFG.term; }
  }
  $('#useTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { CFG.use = b.dataset.use; renderCfg(true); } });
  $('#packTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { CFG.pack = b.dataset.pack; renderCfg(false); } });
  $('#termTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { CFG.term = b.dataset.term; renderCfg(false); } });
  ['use', 'pack', 'terms'].forEach(function (n) {
    $('#form').elements[n].addEventListener('change', function (e) { CFG[n === 'terms' ? 'term' : n] = e.target.value; renderCfg(false); });
  });

  /* ================= export map ================= */
  var drawMapLabels = true;
  (function worldMap() {
    var c = $('#map'), L = window.LAND; if (!c || !L) return;
    var x = c.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), run = false, T = 0, grow = 0, active = null;
    var proj = function (lon, lat) { return [(lon - L.lon0) / (L.lon1 - L.lon0), (L.lat0 - lat) / (L.lat0 - L.lat1)]; };
    var ORIGIN = proj(65.4, 40.1);
    var DEST = [
      { k: 'ca', p: proj(76.9, 43.2), dx: 12, dy: -10, lift: .55 },
      { k: 'ru', p: proj(37.6, 55.75), dx: 0, dy: -16, lift: .2, al: 'center' },
      { k: 'tr', p: proj(29, 41), dx: 0, dy: 26, lift: .22, al: 'center' },
      { k: 'me', p: proj(55.3, 25.2), dx: 0, dy: 26, lift: .3, al: 'center' },
      { k: 'cn', p: proj(121.5, 31.2), dx: 0, dy: 26, lift: .2, al: 'center' },
      { k: 'in', p: proj(72.9, 19.1), dx: 14, dy: 8, lift: .25 },
      { k: 'eu', p: proj(10, 53.5), dx: 0, dy: -16, lift: .16, al: 'center' }
    ];
    function size() { W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    function pos(p) { return [p[0] * W, p[1] * H]; }
    function ctrl(a, b, lift) { var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]); return [mx, my - d * lift]; }
    function bez(a, q, b, s) { var u = 1 - s; return [u * u * a[0] + 2 * u * s * q[0] + s * s * b[0], u * u * a[1] + 2 * u * s * q[1] + s * s * b[1]]; }
    function frame() {
      requestAnimationFrame(frame);
      if (!run) return;
      T += .016; if (grow < 1) grow = Math.min(1, grow + .012);
      x.clearRect(0, 0, W, H);
      var cw = W / L.w, ch = H / L.h, rad = Math.max(.9, cw * .36), o = pos(ORIGIN);
      for (var r = 0; r < L.h; r++) {
        var row = L.rows[r];
        for (var col = 0; col < L.w; col++) {
          if (row.charCodeAt(col) !== 49) continue;
          var px = (col + .5) * cw, py = (r + .5) * ch;
          var wave = .5 + .5 * Math.sin(col * .35 + r * .22 - T * 1.4);
          var near = Math.hypot(px - o[0], py - o[1]) / W;
          x.fillStyle = 'rgba(236,229,214,' + (.14 + wave * .1 + Math.max(0, .2 - near) * .5) + ')';
          x.beginPath(); x.arc(px, py, rad, 0, 6.2832); x.fill();
        }
      }
      // arcs
      DEST.forEach(function (d, i) {
        var b = pos(d.p), q = ctrl(o, b, d.lift), on = active === d.k, prog = Math.max(0, Math.min(1, grow * 2.6 - i * .14));
        var g = x.createLinearGradient(o[0], o[1], b[0], b[1]); g.addColorStop(0, 'rgba(227,169,72,' + (on ? 1 : .75) + ')'); g.addColorStop(1, 'rgba(53,194,176,' + (on ? 1 : .8) + ')');
        x.strokeStyle = g; x.lineWidth = on ? 2.4 : 1.3; x.beginPath();
        for (var s = 0; s <= 48; s++) { var pt = bez(o, q, b, s / 48 * prog); s ? x.lineTo(pt[0], pt[1]) : x.moveTo(pt[0], pt[1]); }
        x.stroke();
        if (prog >= 1) {
          var pp = bez(o, q, b, (T * .22 + i * .17) % 1);
          x.fillStyle = on ? '#fff' : 'rgba(245,203,131,.95)'; x.beginPath(); x.arc(pp[0], pp[1], on ? 3.4 : 2.4, 0, 6.2832); x.fill();
          var ph = (T * .7 + i * .4) % 1;
          x.strokeStyle = 'rgba(53,194,176,' + (.55 * (1 - ph)) + ')'; x.lineWidth = 1.2; x.beginPath(); x.arc(b[0], b[1], 4 + ph * 14, 0, 6.2832); x.stroke();
          x.fillStyle = on ? '#7be3d3' : '#35c2b0'; x.beginPath(); x.arc(b[0], b[1], on ? 5 : 3.6, 0, 6.2832); x.fill();
          x.font = (on ? '600 ' : '500 ') + Math.max(11, Math.min(14, W / 82)) + 'px Manrope,sans-serif'; x.textAlign = d.al || 'left';
          x.fillStyle = on ? '#fff' : 'rgba(236,229,214,.78)'; x.fillText(t('exp.d.' + d.k), b[0] + d.dx, b[1] + d.dy);
        }
      });
      // origin
      var pr = (T * .9) % 1;
      x.fillStyle = 'rgba(227,169,72,' + (.28 * (1 - pr)) + ')'; x.beginPath(); x.arc(o[0], o[1], 8 + pr * 26, 0, 6.2832); x.fill();
      x.fillStyle = '#e3a948'; x.beginPath(); x.arc(o[0], o[1], 6, 0, 6.2832); x.fill();
      x.strokeStyle = '#0b0e0d'; x.lineWidth = 2; x.stroke();
      x.font = '700 ' + Math.max(12, Math.min(16, W / 70)) + 'px Unbounded,Manrope,sans-serif'; x.textAlign = 'right'; x.fillStyle = '#f5cb83';
      x.fillText(t('exp.origin'), o[0] - 10, o[1] + 30);
    }
    frame();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { run = e[0].isIntersecting; if (run && reduce) grow = 1; }, { threshold: .1 }).observe(c);
    else run = true;
    if (reduce) grow = 1;
    // chips <-> arcs
    $$('#dest li').forEach(function (li) {
      li.addEventListener('mouseenter', function () { active = li.dataset.d; $$('#dest li').forEach(function (l) { l.classList.toggle('on', l === li); }); });
      li.addEventListener('mouseleave', function () { active = null; li.classList.remove('on'); });
    });
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, hit = null;
      DEST.forEach(function (d) { var b = pos(d.p); if (Math.hypot(mx - b[0], my - b[1]) < 26) hit = d.k; });
      active = hit; $$('#dest li').forEach(function (l) { l.classList.toggle('on', l.dataset.d === hit); });
    });
    c.addEventListener('mouseleave', function () { active = null; $$('#dest li').forEach(function (l) { l.classList.remove('on'); }); });
  })();

  /* ================= FAQ (smooth) ================= */
  $$('#faqList details').forEach(function (d) {
    var s = $('summary', d), body = $('.faq__a', d);
    s.addEventListener('click', function (e) {
      if (!hasGsap || reduce) return;
      e.preventDefault();
      if (d.open) {
        G.to(body, { height: 0, duration: .45, ease: 'power3.inOut', onComplete: function () { d.open = false; body.style.height = ''; } });
      } else {
        $$('#faqList details[open]').forEach(function (o) { if (o !== d) { var ob = $('.faq__a', o); G.to(ob, { height: 0, duration: .35, onComplete: function () { o.open = false; ob.style.height = ''; } }); } });
        d.open = true; G.fromTo(body, { height: 0 }, { height: 'auto', duration: .55, ease: 'power3.out' });
      }
    });
  });

  /* ================= lightbox ================= */
  var lb = $('#lb');
  function closeLb() { if (lb) lb.hidden = true; }
  $$('.gal__i').forEach(function (b) { b.addEventListener('click', function () { $('img', lb).src = b.dataset.src; lb.hidden = false; }); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb__x')) closeLb(); });

  /* ================= form ================= */
  var CH = { 'contact': 1 };
  $$('[data-contact]').forEach(function (el) {
    var k = el.dataset.contact;
    if (k === 'phone' && CONTACT.phone) { el.innerHTML = '<a href="tel:' + CONTACT.phone + '">' + CONTACT.phone + '</a>'; }
    if (k === 'email' && CONTACT.email) { el.innerHTML = '<a href="mailto:' + CONTACT.email + '">' + CONTACT.email + '</a>'; }
  });
  function buildMsg() {
    var f = $('#form').elements, v = function (n) { return (f[n].value || '').trim() || '—'; };
    var useTxt = $('option[value="' + f.use.value + '"]', f.use).textContent, packTxt = $('option[value="' + f.pack.value + '"]', f.pack).textContent;
    return ['Navbahor Bentonit', '',
      t('f.name') + ': ' + v('name'), t('f.phone') + ': ' + v('phone'),
      t('f.use') + ': ' + useTxt, t('f.pack') + ': ' + packTxt, t('f.terms') + ': ' + f.terms.value,
      t('f.qty') + ': ' + v('qty'), t('f.dest') + ': ' + v('dest'), '', (f.msg.value || '').trim()].join('\n');
  }
  function copy(text) {
    return new Promise(function (res) {
      function fb() { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); res(); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(res, fb); else fb();
    });
  }
  var msgEl = $('#formMsg');
  $('#copyBtn').addEventListener('click', function () { copy(buildMsg()).then(function () { msgEl.textContent = t('f.copied'); }); });
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = $('#form').elements, bad = !f.name.value.trim() || !f.phone.value.trim();
    f.name.classList.toggle('err', !f.name.value.trim()); f.phone.classList.toggle('err', !f.phone.value.trim());
    if (bad) { msgEl.textContent = t('f.err'); return; }
    var text = buildMsg();
    copy(text).then(function () {
      if (CONTACT.telegram) { window.open('https://t.me/' + CONTACT.telegram + '?text=' + encodeURIComponent(text), '_blank', 'noopener'); msgEl.textContent = t('f.tg'); }
      else if (CONTACT.email) { location.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Navbahor Bentonit') + '&body=' + encodeURIComponent(text); msgEl.textContent = t('f.mail'); }
      else msgEl.textContent = t('f.nochan');
    });
  });
  $('#year').textContent = new Date().getFullYear();

  /* ================= GSAP animatsiyalar ================= */
  function counters() {
    $$('[data-count]').forEach(function (el) {
      var end = +el.dataset.count, sp = el.dataset.fmt === 'sp';
      var fmt = function (n) { n = Math.round(n); return sp ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n); };
      var o = { v: 0 }; el.textContent = fmt(0);
      ST.create({ trigger: el, start: 'top 98%', once: true, onEnter: function () { G.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v); } }); } });
    });
  }

  function intro() {
    if (!hasGsap || reduce) return;
    var tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hdr__in', { yPercent: -100, opacity: 0, duration: 1 }, 0)
      .from('.hero__eb', { opacity: 0, y: 20, duration: .9 }, .1)
      .from('.hero__h .ln>span', { yPercent: 115, duration: 1.4, stagger: .12 }, .15)
      .from('.hero__lead', { opacity: 0, y: 30, duration: 1 }, .6)
      .from('.hero__cta .btn', { opacity: 0, y: 30, duration: 1, stagger: .1 }, .75)
      .from('.chips li', { opacity: 0, y: 20, duration: .8, stagger: .08 }, .95)
      .from('.hero__vis .orb', { scale: .6, opacity: 0, duration: 1.6 }, .3)
      .from('.ring', { opacity: 0, scale: .85, duration: 1.8 }, .4)
      .from('.float', { opacity: 0, scale: .8, y: 30, duration: 1, stagger: .15 }, 1.1)
      .from('.stats>div', { opacity: 0, y: 30, duration: 1, stagger: .1 }, 1.0);
  }

  function scrollAnims() {
    // reveals
    var els = $$('[data-reveal]');
    G.set(els, { opacity: 0, y: 46 });
    ST.batch(els, { start: 'top 90%', once: true, onEnter: function (b) { G.to(b, { opacity: 1, y: 0, duration: 1, stagger: .09, ease: 'expo.out', overwrite: true }); } });
    setTimeout(function () { els.forEach(function (el) { if (+G.getProperty(el, 'opacity') === 0 && el.getBoundingClientRect().top < innerHeight) G.to(el, { opacity: 1, y: 0, duration: .6 }); }); }, 4500);

    // bars
    ST.create({ trigger: '#bars', start: 'top 80%', once: true, onEnter: function () { $('#bars').classList.add('in'); } });

    // timeline
    G.from('#tl li', { scrollTrigger: { trigger: '#tl', start: 'top 82%' }, opacity: 0, y: 40, stagger: .12, duration: .9, ease: 'expo.out' });

    // gallery parallax
    $$('.gal__i img').forEach(function (img) {
      G.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentNode, scrub: true } });
      img.style.height = '116%'; img.style.marginTop = '-8%';
    });

    // hero parallax out
    G.to('.hero__txt', { yPercent: 14, opacity: .3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.hero__vis', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // process pin
    var mm = G.matchMedia();
    mm.add('(min-width: 901px)', function () {
      var track = $('#procTrack'), bar = $('#procBar');
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
      G.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: {
        trigger: '#procPin', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (s) { bar.style.transform = 'scaleX(' + s.progress + ')'; }
      } });
    });
    mm.add('(max-width: 900px)', function () {
      $$('.pcard,.ppanel--img').forEach(function (c) { G.from(c, { opacity: 0, y: 36, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%', once: true } }); });
    });
  }

  /* ================= boot ================= */
  applyLang(detectLang(), true);
  if (hasGsap) { counters(); }

  var loader = $('#loader'), ln = $('#loaderN'), lbar = $('#loaderBar');
  function start() {
    loader.classList.add('done');
    setTimeout(function () { loader.remove(); }, 1300);
    if (hasGsap) { scrollAnims(); intro(); }
    if (location.hash) { var tgt = $(location.hash); if (tgt) setTimeout(function () { tgt.scrollIntoView(); }, 50); }
  }
  var done = false;
  function finish() { if (done) return; done = true; start(); }
  if (reduce || !hasGsap) { ln.textContent = '100'; setTimeout(finish, 120); }
  else {
    var o = { v: 0 };
    G.to(o, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: function () { ln.textContent = Math.round(o.v); lbar.style.width = o.v + '%'; }, onComplete: function () { setTimeout(finish, 150); } });
  }
  setTimeout(finish, 4000);
})();
