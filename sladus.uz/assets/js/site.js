/* ============================================================
   Sladus — saytning mantiqi
   ============================================================ */
(function () {
  'use strict';

  var B = window.BRAND, I = window.I18N;
  var LANGS = ['uz', 'ru', 'en'];
  var DATA = { products: [], categories: [] };

  /* ---------- til ---------- */
  function mem(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }
  function detect() {
    var u = new URLSearchParams(location.search).get('lang');
    if (u && LANGS.indexOf(u) > -1) { mem('sl.lang', u); return u; }
    var s = mem('sl.lang');
    if (s && LANGS.indexOf(s) > -1) return s;
    var n = (navigator.language || 'ru').slice(0, 2).toLowerCase();
    return n === 'uz' ? 'uz' : n === 'en' ? 'en' : 'ru';
  }
  var L = detect();

  function t(k, v) {
    var s = (I[L] && I[L][k]) || (I.ru && I.ru[k]) || k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function loc(o) {
    if (o == null) return '';
    if (typeof o === 'string') return o;
    return o[L] || o.ru || o.uz || o.en || '';
  }

  /* ---------- yordamchilar ---------- */
  function e(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function href(page, p) {
    var q = new URLSearchParams(p || {});
    q.set('lang', L);
    return page + '?' + q.toString();
  }
  function cat(id) {
    for (var i = 0; i < DATA.categories.length; i++) if (DATA.categories[i].id === id) return DATA.categories[i];
    return null;
  }
  function colorOf(id) {
    var c = cat(id);
    return 'c-' + ((c && c.color) || 'brand');
  }

  var SVG = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 16.9v2.6a2 2 0 01-2.2 2 19.6 19.6 0 01-8.5-3 19.3 19.3 0 01-6-6A19.6 19.6 0 012.3 4 2 2 0 014.3 2h2.6a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/></svg>',
    srch: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>'
  };

  /* ---------- header / footer ---------- */
  function header(active) {
    var items = [['index.html', t('nav.home')], ['about.html', t('nav.about')],
                 ['catalog.html', t('nav.catalog')], ['support.html', t('nav.support')], ['contact.html', t('nav.contact')]];
    var nav = items.map(function (n) {
      return '<li><a href="' + href(n[0]) + '"' + (n[0] === active ? ' aria-current="page"' : '') + '>' + e(n[1]) + '</a></li>';
    }).join('');
    var langs = LANGS.map(function (l) {
      return '<button type="button" data-l="' + l + '" role="option" aria-selected="' + (l === L) + '">' + e(I[l]['lang.name']) + '</button>';
    }).join('');

    return '<a class="skip" href="#main">' + e(t('nav.home')) + '</a>' +
      '<header class="hdr" id="hdr"><div class="wrap hdr__in">' +
        '<a class="logo" href="' + href('index.html') + '">' +
          '<img src="' + B.company.logo + '" alt="Sladus" width="110" height="36">' +
          '<span><b>Sladus</b><span>LEADING</span></span></a>' +
        '<nav class="nav" id="nav"><ul>' + nav +
          '<li class="only-sm"><a href="' + href('contact.html') + '">' + e(t('nav.quote')) + '</a></li></ul></nav>' +
        '<div class="hdr__tools">' +
          '<div class="lang" id="lang"><button class="lang__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="' + e(t('a11y.lang')) + '">' + L +
            '<svg width="10" height="7" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M1 1l5 5 5-5" stroke-linecap="round"/></svg></button>' +
            '<div class="lang__pop" role="listbox">' + langs + '</div></div>' +
          '<a class="btn btn--fill btn--sm hide-sm" href="' + href('contact.html') + '">' + e(t('nav.quote')) + '</a>' +
          '<button class="burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="' + e(t('a11y.menu')) + '"><i></i></button>' +
        '</div></div></header>';
  }

  function footer() {
    var C = B.company;
    var cats = DATA.categories.map(function (c) {
      return '<li><a href="' + href('catalog.html', { cat: c.id }) + '">' + e(loc(c.name)) + '</a></li>';
    }).join('');
    var local = C.phoneLocal.map(function (p) {
      return '<li><a href="tel:' + p.replace(/\s/g, '') + '">' + e(p) + '</a></li>';
    }).join('');

    return '<footer class="ftr"><div class="wrap"><div class="ftr__g">' +
      '<div class="ftr__logo"><img src="' + C.logo + '" alt="Sladus Leading" width="120" height="40"><p>' + e(t('footer.about')) + '</p></div>' +
      '<div><h3>' + e(t('footer.nav')) + '</h3><ul>' +
        '<li><a href="' + href('index.html') + '">' + e(t('nav.home')) + '</a></li>' +
        '<li><a href="' + href('about.html') + '">' + e(t('nav.about')) + '</a></li>' +
        '<li><a href="' + href('catalog.html') + '">' + e(t('nav.catalog')) + '</a></li>' +
        '<li><a href="' + href('support.html') + '">' + e(t('nav.support')) + '</a></li>' +
        '<li><a href="' + href('contact.html') + '">' + e(t('nav.contact')) + '</a></li></ul></div>' +
      '<div><h3>' + e(t('footer.cats')) + '</h3><ul>' + cats + '</ul></div>' +
      '<div><h3>' + e(t('footer.contacts')) + '</h3><ul>' +
        '<li>' + e(loc(C.address)) + '</li>' +
        '<li><a href="tel:' + C.phoneExport.replace(/\s/g, '') + '">' + e(C.phoneExport) + '</a> · ' + e(t('contact.callexp')) + '</li>' +
        local +
        '<li><a href="mailto:' + C.email + '">' + C.email + '</a></li>' +
        '<li>' + e(loc(C.hours)) + '</li></ul></div>' +
      '</div><div class="ftr__b">' +
        '<span>© ' + new Date().getFullYear() + ' ' + e(C.legal) + '. ' + e(t('footer.rights')) + '</span>' +
        '<span>' + e(loc(C.address)) + '</span>' +
      '</div></div></footer>' +
      '<button class="up" id="up" type="button" aria-label="' + e(t('top')) + '">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  }

  function chrome() {
    var burger = $('.burger'), nav = $('#nav'), hdr = $('#hdr');
    if (burger) burger.addEventListener('click', function () {
      var o = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!o));
      nav.classList.toggle('open', !o);
    });

    var lang = $('#lang');
    if (lang) {
      var lb = $('.lang__btn', lang);
      lb.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var o = lang.classList.toggle('open');
        lb.setAttribute('aria-expanded', String(o));
      });
      $$('[data-l]', lang).forEach(function (b) {
        b.addEventListener('click', function () {
          mem('sl.lang', b.dataset.l);
          var u = new URL(location.href);
          u.searchParams.set('lang', b.dataset.l);
          location.href = u.toString();
        });
      });
      document.addEventListener('click', function () {
        lang.classList.remove('open'); lb.setAttribute('aria-expanded', 'false');
      });
    }

    var up = $('#up');
    function sc() {
      var y = window.scrollY;
      if (hdr) hdr.classList.toggle('stuck', y > 10);
      if (up) up.classList.toggle('on', y > 700);
    }
    window.addEventListener('scroll', sc, { passive: true });
    sc();
    if (up) up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
      }, { rootMargin: '0px 0px -6% 0px' });
      $$('.rv').forEach(function (n) { io.observe(n); });
    } else $$('.rv').forEach(function (n) { n.classList.add('in'); });
  }

  /* ---------- kartochka ---------- */
  function card(p) {
    var c = cat(p.cat);
    return '<a class="card ' + colorOf(p.cat) + '" href="' + href('product.html', { id: p.id }) + '">' +
      '<div class="card__ph"><img src="' + e(p.img) + '" alt="' + e(p.name) + '" loading="lazy" width="420" height="336">' +
        (c ? '<span class="card__cat">' + e(loc(c.name)) + '</span>' : '') + '</div>' +
      '<div class="card__b"><h3>' + e(p.name) + '</h3><p>' + e(loc(p.descr)) + '</p>' +
        '<div class="card__f num"><span>' + e(t('p.net')) + ': <b>' + e(p.pack.net) + '</b></span>' +
        '<span>' + e(p.nutrition.kcal) + ' kcal</span></div></div></a>';
  }

  /* ---------- forma ---------- */
  function formHtml() {
    function f(n, lab, ty, req) {
      return '<div class="fld"><label for="f-' + n + '">' + e(lab) + (req ? ' *' : '') + '</label>' +
        '<input id="f-' + n + '" name="' + n + '" type="' + ty + '"' + (req ? ' required' : '') + '><em></em></div>';
    }
    return '<form class="form" id="qf" novalidate>' +
      '<div class="note note--ok" data-ok>' + e(t('form.ok')) + '</div>' +
      '<div class="note note--bad" data-bad>' + e(t('form.err')) + '</div>' +
      '<div class="frow">' + f('name', t('form.name'), 'text', 1) + f('company', t('form.company'), 'text') + '</div>' +
      '<div class="frow">' + f('phone', t('form.phone'), 'tel', 1) + f('email', t('form.email'), 'email', 1) + '</div>' +
      f('country', t('form.country'), 'text') +
      '<div class="fld"><label for="f-message">' + e(t('form.message')) + '</label><textarea id="f-message" name="message"></textarea></div>' +
      '<button class="btn btn--fill btn--wide" type="submit">' + e(t('form.send')) + '</button>' +
      '<p class="fnote">' + e(B.company.email) + ' · ' + e(B.company.phoneExport) + '</p></form>';
  }

  function wireForm(pre) {
    var f = $('#qf');
    if (!f) return;
    if (pre) { var m = $('#f-message'); if (m && !m.value) m.value = pre; }

    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = $('[data-ok]', f), bad = $('[data-bad]', f), valid = true;
      ok.classList.remove('on'); bad.classList.remove('on');
      $$('.fld', f).forEach(function (x) { x.classList.remove('bad'); });

      function no(inp, msg) {
        valid = false;
        var w = inp.closest('.fld');
        w.classList.add('bad');
        $('em', w).textContent = msg;
      }
      var nm = $('#f-name', f), ph = $('#f-phone', f), em = $('#f-email', f);
      if (!nm.value.trim()) no(nm, t('form.required'));
      if (!ph.value.trim()) no(ph, t('form.required'));
      else if (ph.value.replace(/\D/g, '').length < 9) no(ph, t('form.phonebad'));
      if (!em.value.trim()) no(em, t('form.required'));
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) no(em, t('form.emailbad'));
      if (!valid) { bad.classList.add('on'); return; }

      var btn = $('button[type=submit]', f), lab = btn.textContent;
      btn.disabled = true; btn.textContent = t('form.sending');

      var data = {};
      new FormData(f).forEach(function (v, k) { data[k] = v; });

      window.Store.send(data).then(function () {
        f.reset(); ok.classList.add('on');
        ok.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }).catch(function () {
        bad.classList.add('on');
      }).then(function () {
        btn.disabled = false; btn.textContent = lab;
      });
    });
  }

  /* ================= sahifalar ================= */

  function home() {
    var C = B.company, P = DATA.products, years = new Date().getFullYear() - C.founded;

    $('#hero').innerHTML =
      '<div class="hero__bg"><video autoplay muted loop playsinline poster="' + C.photo1 + '">' +
        '<source src="' + C.video + '" type="video/mp4"></video></div>' +
      '<div class="wrap hero__in">' +
        '<span class="hero__tag"><span>' + e(t('hero.badgetxt')) + '</span><b>' + e(t('hero.badge')) + '</b></span>' +
        '<h1>' + e(t('hero.t1')) + ' <em>' + e(t('hero.t2')) + '</em></h1>' +
        '<p class="hero__lead">' + e(t('hero.lead2')) + '</p>' +
        '<div class="hero__act">' +
          '<a class="btn btn--fill" href="' + href('catalog.html') + '">' + e(t('hero.cta1')) + '</a>' +
          '<a class="btn btn--onDark" href="' + href('contact.html') + '">' + e(t('hero.cta2')) + '</a>' +
        '</div></div>' +
      '<div class="ticker"><div class="ticker__row" id="tick"></div></div>' +
      '<div class="wrap"><div class="figures num">' +
        fig(years + '+', t('stat.years')) + fig(P.length + '+', t('stat.sku')) +
        fig(B.countries.length, t('stat.countries')) + fig('12+', t('stat.regions')) +
      '</div></div>';

    function fig(n, l) { return '<div><b>' + e(n) + '</b><span>' + e(l) + '</span></div>'; }

    var names = B.countries.map(function (c) { return '<span>' + e(loc(c)) + '</span>'; }).join('');
    $('#tick').innerHTML = names + names;

    $('#ranges').innerHTML = DATA.categories.map(function (c) {
      var n = P.filter(function (p) { return p.cat === c.id; }).length;
      return '<a class="range rv c-' + e(c.color || 'brand') + '" href="' + href('catalog.html', { cat: c.id }) + '">' +
        '<img src="' + e(c.img) + '" alt="" loading="lazy" width="420" height="520">' +
        '<span class="range__n">' + n + ' ' + e(t('cat.count')) + '</span>' +
        '<h3>' + e(loc(c.name)) + '</h3><p>' + e(loc(c.tagline)) + '</p>' +
        '<span class="range__go">' + e(t('cat.view')) + '<i>→</i></span></a>';
    }).join('');

    // Har yo'nalishdan 2 tadan, keyin bo'sh joyni qolganlari bilan to'ldiramiz
    var picks = [], seen = {};
    DATA.categories.forEach(function (c) {
      P.filter(function (p) { return p.cat === c.id; }).slice(0, 2).forEach(function (p) {
        if (!seen[p.id]) { seen[p.id] = 1; picks.push(p); }
      });
    });
    for (var i = 0; i < P.length && picks.length < 8; i++) {
      if (!seen[P[i].id]) { seen[P[i].id] = 1; picks.push(P[i]); }
    }
    $('#feat').innerHTML = picks.slice(0, 8).map(card).join('');

    $('#pillars').innerHTML =
      pill('c-brand', '01', t('why.q.t'), t('why.q.d')) +
      pill('c-gold', '02', t('why.i.t'), t('why.i.d')) +
      pill('c-mint', '03', t('why.p.t'), t('why.p.d')) +
      pill('c-amber', '04', t('why.pr.t'), t('why.pr.d'));
    function pill(cl, n, h, p) {
      return '<div class="' + cl + '"><span class="pillars__n">' + n + '</span><h3>' + e(h) + '</h3><p>' + e(p) + '</p></div>';
    }

    $('#geo').innerHTML = B.countries.map(function (c) {
      return '<span><b>' + e(c.code) + '</b>' + e(loc(c)) + '</span>';
    }).join('');

    $('#awards').innerHTML = B.awards.map(function (a) {
      return '<article class="award rv"><img src="' + e(a.img) + '" alt="' + e(a.title) + '" loading="lazy" width="300" height="400">' +
        '<div class="award__b"><span>' + e(a.year) + '</span><h3>' + e(a.title) + '</h3><p>' + e(loc(a.text)) + '</p></div></article>';
    }).join('');

    $('#cta').innerHTML = '<div><h2>' + e(t('cta.title')) + '</h2><p>' + e(t('cta.lead')) + '</p></div>' +
      '<a class="btn btn--dark" href="' + href('contact.html') + '">' + e(t('cta.btn')) + '</a>';

    txt('#rTitle', t('range.title')); txt('#rLead', t('range.lead'));
    txt('#fTitle', t('feat.title')); txt('#fLead', t('feat.lead'));
    var fa = $('#fAll'); fa.textContent = t('feat.all'); fa.href = href('catalog.html');
    txt('#pTitle', t('why.title'));
    txt('#gTitle', t('export.title')); txt('#gLead', t('export.lead'));
    txt('#aTitle', t('awards.title')); txt('#aLead', t('awards.lead'));
    txt('#formTitle', t('form.title'));
    $('#formBox').innerHTML = formHtml();
    wireForm('');
  }
  function txt(s, v) { var n = $(s); if (n) n.textContent = v; }

  function about() {
    var C = B.company, P = DATA.products, years = new Date().getFullYear() - C.founded;
    $('#phead').innerHTML = '<div class="wrap"><nav class="crumb"><a href="' + href('index.html') + '">' + e(t('nav.home')) +
      '</a><span>/</span><span>' + e(t('about.h1')) + '</span></nav><h1>' + e(t('about.h1')) + '</h1><p>' + e(t('about.p1')) + '</p></div>';

    $('#story').innerHTML =
      '<div><h2 style="font-size:var(--t-2xl)">' + e(t('about.story')) + '</h2>' +
      '<p style="color:var(--mute);margin-top:1.1rem">' + e(t('about.p1')) + '</p>' +
      '<p style="color:var(--mute);margin-top:1rem">' + e(t('about.p2')) + '</p>' +
      '<div class="tags mt"><span class="tag tag--c c-brand">' + C.founded + '</span>' +
      '<span class="tag">' + e(C.legal) + '</span><span class="tag">' + P.length + '+ ' + e(t('cat.count')) + '</span></div></div>' +
      '<img src="' + C.photo2 + '" alt="Sladus Produce" loading="lazy" width="620" height="465" style="border-radius:var(--r-l);width:100%;aspect-ratio:4/3;object-fit:cover">';

    $('#figs').innerHTML = '<div class="figures num" style="border-top:0">' +
      '<div><b>' + years + '+</b><span>' + e(t('stat.years')) + '</span></div>' +
      '<div><b>' + P.length + '+</b><span>' + e(t('stat.sku')) + '</span></div>' +
      '<div><b>' + B.countries.length + '</b><span>' + e(t('stat.countries')) + '</span></div>' +
      '<div><b>12+</b><span>' + e(t('stat.regions')) + '</span></div></div>';

    $('#pillars').innerHTML =
      '<div class="c-brand"><span class="pillars__n">01</span><h3>' + e(t('why.q.t')) + '</h3><p>' + e(t('why.q.d')) + '</p></div>' +
      '<div class="c-gold"><span class="pillars__n">02</span><h3>' + e(t('why.i.t')) + '</h3><p>' + e(t('why.i.d')) + '</p></div>' +
      '<div class="c-mint"><span class="pillars__n">03</span><h3>' + e(t('why.p.t')) + '</h3><p>' + e(t('why.p.d')) + '</p></div>' +
      '<div class="c-amber"><span class="pillars__n">04</span><h3>' + e(t('why.pr.t')) + '</h3><p>' + e(t('why.pr.d')) + '</p></div>';

    var TL = {
      uz: [['2010', 'Fabrika ishga tushdi', '«Sladus Produce» qandolat fabrikasi Toshkentda ish boshladi.'],
           ['2015', 'Assortiment 50 turga yetdi', 'Draje, ichlikli konfet va dekorativ sepma yo‘nalishlari shakllandi.'],
           ['2020', '«MEHR-SAXOVAT» nishoni', 'Prezident Farmoni bilan ta’sis etilgan ko‘krak nishoni bilan taqdirlandik.'],
           ['2024', '17 davlatga eksport', 'MDH, Yaqin Sharq va Osiyo bozorlariga doimiy yetkazib berish yo‘lga qo‘yildi.']],
      ru: [['2010', 'Запуск фабрики', 'Кондитерская фабрика «Sladus Produce» начала работу в Ташкенте.'],
           ['2015', 'Ассортимент — 50 видов', 'Сформированы направления драже, конфет с начинкой и декоративных посыпок.'],
           ['2020', 'Знак «MEHR-SAXOVAT»', 'Награждение нагрудным знаком, учреждённым Указом Президента.'],
           ['2024', 'Экспорт в 17 стран', 'Налажены регулярные поставки в СНГ, на Ближний Восток и в Азию.']],
      en: [['2010', 'The factory opens', 'Sladus Produce starts confectionery production in Tashkent.'],
           ['2015', 'Range reaches 50 lines', 'Dragee, filled sweets and decorative toppings take shape as ranges.'],
           ['2020', '“MEHR-SAXOVAT” badge', 'Awarded the badge established by Presidential Decree.'],
           ['2024', 'Export to 17 countries', 'Regular shipments across the CIS, the Middle East and Asia.']]
    };
    $('#tl').innerHTML = (TL[L] || TL.ru).map(function (r) {
      return '<li><b class="num">' + e(r[0]) + '</b><h3>' + e(r[1]) + '</h3><p>' + e(r[2]) + '</p></li>';
    }).join('');

    $('#awards').innerHTML = B.awards.map(function (a) {
      return '<article class="award rv"><img src="' + e(a.img) + '" alt="' + e(a.title) + '" loading="lazy" width="300" height="400">' +
        '<div class="award__b"><span>' + e(a.year) + '</span><h3>' + e(a.title) + '</h3><p>' + e(loc(a.text)) + '</p></div></article>';
    }).join('');

    txt('#pTitle', t('about.valtitle')); txt('#tlTitle', t('about.tl'));
    txt('#aTitle', t('awards.title')); txt('#aLead', t('awards.lead'));
  }

  function catalog() {
    var P = DATA.products, params = new URLSearchParams(location.search);
    var st = { cat: params.get('cat') || 'all', q: params.get('q') || '', sort: 'az' };

    $('#phead').innerHTML = '<div class="wrap"><nav class="crumb"><a href="' + href('index.html') + '">' + e(t('nav.home')) +
      '</a><span>/</span><span>' + e(t('cat.h1')) + '</span></nav><h1>' + e(t('cat.h1')) + '</h1><p>' + e(t('cat.lead')) + '</p>' +
      '<a class="btn btn--onDark btn--sm" style="margin-top:1.1rem" href="assets/catalog/Sladus-Katalog-2026.pdf" download>' + e(t('support.dl.btn')) + '</a></div>';

    var chips = '<button class="chip c-brand" type="button" data-c="all" aria-pressed="' + (st.cat === 'all') + '">' + e(t('cat.all')) + '</button>' +
      DATA.categories.map(function (c) {
        return '<button class="chip c-' + e(c.color || 'brand') + '" type="button" data-c="' + e(c.id) + '" aria-pressed="' +
          (c.id === st.cat) + '"><i></i>' + e(loc(c.name)) + '</button>';
      }).join('');

    $('#filters').innerHTML =
      '<div class="filters__top"><div class="srch">' + SVG.srch +
        '<input type="search" id="qq" placeholder="' + e(t('cat.search')) + '" aria-label="' + e(t('cat.search')) + '" value="' + e(st.q) + '"></div>' +
        '<select class="sel" id="sort" aria-label="' + e(t('cat.sort')) + '">' +
          '<option value="az">' + e(t('cat.sort.az')) + '</option><option value="za">' + e(t('cat.sort.za')) + '</option>' +
          '<option value="kcal">' + e(t('cat.sort.kcal')) + '</option><option value="kcald">' + e(t('cat.sort.kcald')) + '</option>' +
        '</select></div>' +
      '<div class="chips">' + chips + '</div><div class="count" id="cnt"></div>';

    function draw() {
      var list = P.slice();
      if (st.cat !== 'all') list = list.filter(function (p) { return p.cat === st.cat; });
      var s = st.q.trim().toLowerCase();
      if (s) list = list.filter(function (p) {
        return (p.name + ' ' + loc(p.descr) + ' ' + loc(p.composition) + ' ' + (p.code || '')).toLowerCase().indexOf(s) > -1;
      });
      list.sort(function (a, b) {
        if (st.sort === 'az') return a.name.localeCompare(b.name);
        if (st.sort === 'za') return b.name.localeCompare(a.name);
        if (st.sort === 'kcal') return a.nutrition.kcal - b.nutrition.kcal;
        return b.nutrition.kcal - a.nutrition.kcal;
      });
      $('#cnt').textContent = list.length + ' ' + t('cat.found');

      if (!list.length) {
        $('#grid').innerHTML = '<div class="blank"><h3>' + e(t('cat.empty.t')) + '</h3><p>' + e(t('cat.empty.d')) +
          '</p><button class="btn btn--line" type="button" id="rst">' + e(t('cat.reset')) + '</button></div>';
        $('#rst').addEventListener('click', function () {
          st.cat = 'all'; st.q = ''; $('#qq').value = '';
          $$('[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === 'all')); });
          draw();
        });
      } else $('#grid').innerHTML = list.map(card).join('');

      var u = new URL(location.href);
      u.searchParams.set('cat', st.cat);
      st.q ? u.searchParams.set('q', st.q) : u.searchParams.delete('q');
      history.replaceState(null, '', u);
    }

    $$('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.cat = b.dataset.c;
        $$('[data-c]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        draw();
      });
    });
    var tm;
    $('#qq').addEventListener('input', function (ev) {
      clearTimeout(tm);
      tm = setTimeout(function () { st.q = ev.target.value; draw(); }, 170);
    });
    $('#sort').addEventListener('change', function (ev) { st.sort = ev.target.value; draw(); });
    draw();
  }

  function product() {
    var id = new URLSearchParams(location.search).get('id');
    var p = DATA.products.filter(function (x) { return x.id === id; })[0];

    if (!p) {
      $('#main').innerHTML = '<section class="sec"><div class="wrap blank"><h3>' + e(t('cat.empty.t')) + '</h3>' +
        '<p>' + e(t('cat.empty.d')) + '</p><a class="btn btn--fill" href="' + href('catalog.html') + '">' + e(t('p.back')) + '</a></div></section>';
      return;
    }

    document.title = p.name + ' — Sladus Leading';
    var c = cat(p.cat), cn = c ? loc(c.name) : '', cl = colorOf(p.cat);
    var md = $('meta[name=description]');
    if (md) md.setAttribute('content', p.name + ' — ' + loc(p.descr) + '. ' + t('p.net') + ': ' + p.pack.net + ', ' + t('p.tnved') + ': ' + p.pack.tnved + '.');

    $('#phead').className = 'phead ' + cl;
    $('#phead').innerHTML = '<div class="wrap"><nav class="crumb">' +
      '<a href="' + href('index.html') + '">' + e(t('nav.home')) + '</a><span>/</span>' +
      '<a href="' + href('catalog.html') + '">' + e(t('cat.h1')) + '</a><span>/</span>' +
      '<a href="' + href('catalog.html', { cat: p.cat }) + '">' + e(cn) + '</a></nav>' +
      '<h1>' + e(p.name) + '</h1><p>' + e(loc(p.descr)) + '</p></div>';

    $('#pd').className = 'wrap pd ' + cl;
    $('#pd').innerHTML =
      '<div class="pd__ph"><img src="' + e(p.img) + '" alt="' + e(p.name) + '" width="720" height="720"></div><div>' +
      '<div class="tags"><span class="tag tag--c">' + e(cn) + '</span>' +
        '<span class="tag num">' + e(t('p.code')) + ' ' + e(p.code) + '</span>' +
        '<span class="tag num">' + e(p.pack.net) + '</span></div>' +
      '<div class="blk"><h2>' + e(t('p.composition')) + '</h2><p>' + e(loc(p.composition)) + '</p>' +
        '<p style="margin-top:.8rem">' + e(t('p.storagev', { t: p.storage.t, rh: p.storage.rh })) + '.</p></div>' +
      '<div class="blk"><h2>' + e(t('p.nutrition')) + '</h2><div class="nutri num">' +
        nu(p.nutrition.protein + ' g', t('p.protein')) + nu(p.nutrition.fat + ' g', t('p.fat')) +
        nu(p.nutrition.carbs + ' g', t('p.carbs')) + nu(p.nutrition.kcal, t('p.kcal')) + '</div></div>' +
      '<div class="blk"><h2>' + e(t('p.supply')) + '</h2><table class="spec num"><tbody>' +
        rw(t('p.packtype'), loc(B.pack)) + rw(t('p.size'), p.pack.size) +
        rw(t('p.volume'), p.pack.volume + ' m³') + rw(t('p.net'), p.pack.net) +
        rw(t('p.pcs'), p.pack.pcs) + rw(t('p.tnved'), p.pack.tnved) + '</tbody></table></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:.7rem">' +
        '<a class="btn btn--fill" href="' + href('contact.html', { product: p.name }) + '">' + e(t('p.order')) + '</a>' +
        '<a class="btn btn--line" href="' + href('catalog.html', { cat: p.cat }) + '">' + e(t('p.back')) + '</a></div></div>';

    function nu(v, l) { return '<div><b>' + e(v) + '</b><span>' + e(l) + '</span></div>'; }
    function rw(k, v) { return '<tr><th>' + e(k) + '</th><td>' + e(v) + '</td></tr>'; }

    var rel = DATA.products.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4);
    if (rel.length) { txt('#relTitle', t('p.related')); $('#relGrid').innerHTML = rel.map(card).join(''); }
    else { var rs = $('#rel'); if (rs) rs.remove(); }

    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product',
      name: p.name, image: p.img, description: loc(p.descr), sku: p.code,
      brand: { '@type': 'Brand', name: 'Sladus Leading' },
      manufacturer: { '@type': 'Organization', name: B.company.legal }
    });
    document.head.appendChild(ld);
  }

  function contact() {
    var C = B.company;
    $('#phead').innerHTML = '<div class="wrap"><nav class="crumb"><a href="' + href('index.html') + '">' + e(t('nav.home')) +
      '</a><span>/</span><span>' + e(t('contact.h1')) + '</span></nav><h1>' + e(t('contact.h1')) + '</h1><p>' + e(t('form.lead')) + '</p></div>';

    function it(ic, h, b) { return '<div class="info__i">' + ic + '<div><h3>' + e(h) + '</h3><p>' + b + '</p></div></div>'; }

    $('#info').innerHTML = '<div class="info">' +
      it(SVG.pin, t('contact.addr'), e(loc(C.address))) +
      it(SVG.phone, t('contact.callexp'), '<a href="tel:' + C.phoneExport.replace(/\s/g, '') + '">' + e(C.phoneExport) + '</a>') +
      it(SVG.phone, t('contact.calllocal'), C.phoneLocal.map(function (x) {
        return '<a href="tel:' + x.replace(/\s/g, '') + '">' + e(x) + '</a>';
      }).join('<br>')) +
      it(SVG.mail, t('contact.email'), '<a href="mailto:' + C.email + '">' + C.email + '</a>') +
      it(SVG.clock, t('contact.hours'), e(loc(C.hours))) +
      '</div><div class="map"><iframe src="' + C.map + '" loading="lazy" title="Sladus Produce" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>';

    $('#formBox').innerHTML = '<h2 style="font-size:var(--t-2xl);margin-bottom:1.6rem">' + e(t('form.title')) + '</h2>' + formHtml();
    wireForm(new URLSearchParams(location.search).get('product') || '');
  }

  function support() {
    $('#phead').innerHTML = '<div class="wrap"><nav class="crumb"><a href="' + href('index.html') + '">' + e(t('nav.home')) +
      '</a><span>/</span><span>' + e(t('support.h1')) + '</span></nav><h1>' + e(t('support.h1')) + '</h1><p>' + e(t('support.lead')) + '</p></div>';

    $('#dl').innerHTML = '<div class="dlcard">' +
      '<div class="dlcard__ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg></div>' +
      '<div class="dlcard__t"><h3>' + e(t('support.dl.title')) + '</h3><p>' + e(t('support.dl.desc')) + '</p></div>' +
      '<a class="btn btn--fill btn--sm" href="assets/catalog/Sladus-Katalog-2026.pdf" download>' + e(t('support.dl.btn')) + '</a>' +
    '</div>';

    var qs = [1, 2, 3, 4, 5].map(function (n) {
      return '<details class="faq__item"><summary>' + e(t('support.faq.q' + n)) + '</summary><p>' + e(t('support.faq.a' + n)) + '</p></details>';
    }).join('');
    $('#faq').innerHTML = '<div class="faq"><h2>' + e(t('support.faq.title')) + '</h2>' + qs + '</div>';

    if (window.SladusChat) window.SladusChat.mount($('#chat'), L, t);
  }

  /* ---------- ishga tushirish ---------- */
  function run() {
    document.documentElement.lang = L;
    var page = document.body.dataset.page;
    var map = { home: 'index.html', about: 'about.html', catalog: 'catalog.html', product: 'catalog.html', contact: 'contact.html', support: 'support.html' };

    var h = document.getElementById('hdrSlot'); if (h) h.outerHTML = header(map[page] || '');
    var f = document.getElementById('ftrSlot'); if (f) f.outerHTML = footer();

    try {
      if (page === 'home') home();
      else if (page === 'about') about();
      else if (page === 'catalog') catalog();
      else if (page === 'product') product();
      else if (page === 'contact') contact();
      else if (page === 'support') support();
    } catch (err) {
      if (window.console) console.error('Sladus:', err);
    }
    chrome();
  }

  window.Store.load().then(function (d) {
    DATA = d;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  });
})();
