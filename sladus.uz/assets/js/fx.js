/* ============================================================
   Sladus — harakat qatlami (WebGL sahna + GSAP rejissurasi)
   Ma'lumotlarga tegmaydi: site.js sahifani chizib bo'lgach (sladus:ready)
   tayyor DOM ustidan ishlaydi. Kutubxona yuklanmasa ham sayt to'liq
   ko'rinadi — hamma narsa "boshlang'ich holatda ochiq".
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var page = document.body.getAttribute('data-page') || '';
  var isHome = page === 'home';
  var hasG = !!(window.gsap && window.ScrollTrigger);
  var small = innerWidth < 760;
  var LANG = document.documentElement.lang || 'ru';
  var CUR_LABEL = { ru: 'СМОТРЕТЬ', uz: 'KO‘RISH', en: 'VIEW' }[LANG] || 'VIEW';
  var P = 0, vel = 0, lenis = null, opened = false, cbs = [], booted = false;

  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function whenOpen(fn) { opened ? fn() : cbs.push(fn); }
  function open() { opened = true; cbs.splice(0).forEach(function (f) { try { f(); } catch (e) { /* bir animatsiya xatosi boshqalarni to'xtatmasin */ } }); }
  function clearHold() { document.documentElement.classList.remove('ld-on'); }

  /* ---------- qatlamlar ---------- */
  function mount() {
    var b = document.body, h = '';
    h += '<canvas id="gl" aria-hidden="true"></canvas><div class="vig"></div><div class="prog" id="prog"></div><div id="ct"></div>';
    if (fine) h += '<div id="cu"><span>' + CUR_LABEL + '</span></div>';
    b.insertAdjacentHTML('afterbegin', h);
    if (window.gsap) gsap.set('#ct', { yPercent: 100, y: 0 });
  }

  /* ============================================================
     WebGL: yaltiroq draje olami. Kamera scroll bilan uchadi.
     ============================================================ */
  var G = { intro: { v: 1 } };
  function cosmos() {
    var cv = $('#gl');
    if (!window.THREE || !cv) return;
    var T = window.THREE, r;
    try { r = new T.WebGLRenderer({ canvas: cv, antialias: !small, powerPreference: 'high-performance' }); } catch (e) { cv.remove(); return; }
    r.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.4 : 1.75));
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = .95;

    var scene = new T.Scene(), base = new T.Color(0x0c0709);
    scene.background = base.clone(); scene.fog = new T.FogExp2(0x0c0709, isHome ? .021 : .032);
    var cam = new T.PerspectiveCamera(48, 1, .1, 260);
    function lin(h) { return new T.Color(h).convertSRGBToLinear(); }

    /* studiya muhiti: glazurning haqiqiy aksi uchun */
    var env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(60, 60, 60), new T.MeshBasicMaterial({ color: 0x1a0f12, side: T.BackSide })));
    [[0xffffff, [0, 22, 0], [26, 1, 26]], [0xff3d6e, [-24, 4, 6], [1, 16, 22]], [0x2fe0a8, [24, -3, -6], [1, 14, 20]],
     [0xffbe3b, [0, -4, 26], [24, 12, 1]], [0xffffff, [0, 6, -26], [30, 10, 1]]].forEach(function (l) {
      var m = new T.Mesh(new T.BoxGeometry(l[2][0], l[2][1], l[2][2]), new T.MeshBasicMaterial({ color: l[0] }));
      m.material.color.multiplyScalar(.85); m.position.set(l[1][0], l[1][1], l[1][2]); env.add(m);
    });
    var pm = new T.PMREMGenerator(r); scene.environment = pm.fromScene(env, .04).texture; pm.dispose();

    var key = new T.DirectionalLight(0xffffff, .55); scene.add(key); scene.add(key.target);
    var pl1 = new T.PointLight(0xff3d6e, 28, 40), pl2 = new T.PointLight(0x2fe0a8, 20, 40); scene.add(pl1, pl2);

    /* glazurdagi mayda notekislik (haqiqiy draje yuzasi) */
    var bc = document.createElement('canvas'); bc.width = bc.height = 256;
    var bx = bc.getContext('2d'), id = bx.createImageData(256, 256);
    for (var q = 0; q < id.data.length; q += 4) { var v = 118 + Math.random() * 20; id.data[q] = id.data[q + 1] = id.data[q + 2] = v; id.data[q + 3] = 255; }
    bx.putImageData(id, 0, 0); bx.filter = 'blur(1.4px)'; bx.drawImage(bc, 0, 0);
    var bump = new T.CanvasTexture(bc); bump.wrapS = bump.wrapT = T.RepeatWrapping; bump.repeat.set(3, 3);

    var pal = [0xff3d6e, 0xffbe3b, 0x2fe0a8, 0xff7a30, 0xfff3e4, 0x8b1a3c, 0x4a2a1c].map(lin);
    var N = isHome ? (small ? 110 : 280) : (small ? 50 : 120), geo = new T.SphereGeometry(1, small ? 24 : 40, small ? 18 : 30);
    var mat = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .2, metalness: .02, clearcoat: 1, clearcoatRoughness: .07, envMapIntensity: .7, bumpMap: bump, bumpScale: .35 });
    var im = new T.InstancedMesh(geo, mat, N); scene.add(im);
    var D = [], dm = new T.Object3D(), zFar = isHome ? -135 : -80;
    for (var i = 0; i < N; i++) {
      var a = Math.random() * 6.283, rad = (isHome ? 3.8 : 6.2) + Math.pow(Math.random(), .65) * 16, sz = .3 + Math.pow(Math.random(), 2.4) * (isHome ? 1.05 : .75);
      D.push({ z: 6 - Math.random() * (6 - zFar), s: sz, ph: Math.random() * 6.283, sp: .3 + Math.random() * .6, a: a, rad: rad,
               rx: Math.random() * 6.28, ry: Math.random() * 6.28, sx: (Math.random() - .5) * .9, sy: (Math.random() - .5) * .9 });
      im.setColorAt(i, pal[(Math.random() * pal.length) | 0]);
    }
    im.instanceColor.needsUpdate = true;

    /* asosiy sahifa uchun katta draje */
    var hero = new T.Group(), hm, ring, ring2, sats = [];
    if (isHome) {
      scene.add(hero);
      hm = new T.Mesh(new T.SphereGeometry(1.9, 72, 56), new T.MeshPhysicalMaterial({ color: lin(0xff3d6e), roughness: .14, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: .8, bumpMap: bump, bumpScale: .25 }));
      hm.scale.y = .86; hero.add(hm);
      ring = new T.Mesh(new T.TorusGeometry(3.1, .05, 16, 160), new T.MeshBasicMaterial({ color: 0xfff3e4, transparent: true, opacity: .5 })); ring.rotation.x = 1.2; hero.add(ring);
      ring2 = ring.clone(); ring2.scale.setScalar(1.28); ring2.rotation.set(.5, .6, 0); ring2.material = ring.material.clone(); ring2.material.opacity = .26; hero.add(ring2);
      sats = [0xffbe3b, 0x2fe0a8, 0xff7a30].map(function (c, k) {
        var s = new T.Mesh(new T.SphereGeometry(.38 + k * .08, 32, 24), new T.MeshPhysicalMaterial({ color: lin(c), roughness: .14, clearcoat: 1, envMapIntensity: .8 }));
        s.scale.y = .84; hero.add(s); return s;
      });
      hero.position.set(small ? 1.2 : 4.3, small ? 3.4 : .4, -3); if (small) hero.userData.k = .7;
    }

    function size() { var w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); small = w < 760; }
    size(); addEventListener('resize', size);
    var mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    addEventListener('pointermove', function (e) { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });

    var stops = [0xff3d6e, 0xffbe3b, 0x2fe0a8, 0xff7a30, 0xff3d6e].map(lin), tint = new T.Color();
    function colorAt(p) { var f = Math.min(.9999, p) * 4, k = Math.floor(f); return tint.copy(stops[k]).lerp(stops[k + 1], f - k); }
    var on = true, t0 = performance.now(), camZ = 6, run = true;
    new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(cv);
    document.addEventListener('visibilitychange', function () { run = !document.hidden; });
    var depth = isHome ? 128 : 58;

    function draw(still) {
      var t = still ? 4 : (performance.now() - t0) / 1000;
      mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05;
      camZ += ((6 - P * depth) - camZ) * (still ? 1 : .12);
      cam.position.set(Math.sin(P * 7) * 1.4 + mouse.sx * 1.4, -Math.cos(P * 5) * .8 - mouse.sy * .9, camZ);
      cam.lookAt(cam.position.x * .4 + mouse.sx * .8, cam.position.y * .4, camZ - 10);
      cam.rotation.z += Math.sin(P * 9) * .04 + vel * .0007;
      var c = colorAt(P);
      scene.background.copy(base).lerp(c, .07); scene.fog.color.copy(scene.background);
      pl1.color.copy(c); pl1.position.set(cam.position.x - 6, cam.position.y + 4, camZ + 2);
      pl2.position.set(cam.position.x + 6, cam.position.y - 3, camZ + 1);
      key.position.set(cam.position.x + 5, cam.position.y + 8, camZ + 6); key.target.position.set(cam.position.x, cam.position.y, camZ - 8); key.target.updateMatrixWorld();
      var st = still ? 1 : 1 + Math.min(2, Math.abs(vel) * .04);
      for (var i = 0; i < N; i++) {
        var d = D[i], a = d.a + t * .04 * d.sp * (d.rad < 8 ? 1.6 : .6);
        dm.position.set(Math.cos(a) * d.rad, Math.sin(a) * d.rad * .62 + Math.sin(t * d.sp + d.ph) * .5, d.z);
        dm.rotation.set(d.rx + t * d.sx, d.ry + t * d.sy, 0);
        dm.scale.set(d.s, d.s * .8, d.s * st); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
      if (isHome) {
        hero.rotation.y = t * .25 + mouse.sx * .5; hero.rotation.x = mouse.sy * .3;
        hm.rotation.y = t * .3; ring.rotation.z = t * .4; ring2.rotation.y = -t * .3;
        sats.forEach(function (s, k) { var q = t * (.7 + k * .25) + k * 2.1; s.position.set(Math.cos(q) * (3.1 + k * .4), Math.sin(q * 1.3) * 1.6, Math.sin(q) * (3.1 + k * .4)); });
        var hs = Math.max(.001, G.intro.v * Math.max(0, 1 - P * 16)); hero.scale.setScalar(hs * (small ? .7 : 1)); hero.visible = hs > .01;
        hm.material.color.copy(c).multiplyScalar(.6);
      }
      r.render(scene, cam);
    }
    if (reduce) { draw(true); addEventListener('scroll', function () { draw(true); }, { passive: true }); addEventListener('resize', function () { draw(true); }); return; }
    (function frame() { requestAnimationFrame(frame); if (on && run) draw(false); })();
  }

  /* ---------- yordamchilar ---------- */
  function splitEl(el) {
    var chars = [], units = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var wd = document.createElement('span'); wd.className = 'wd';
            w.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; wd.appendChild(s); chars.push(s); });
            frag.appendChild(wd);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') {
          if (c.classList.contains('g')) units.push(c); else walk(c);
        }
      });
    })(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return { chars: chars, units: units };
  }
  function countUp(el) {
    var m = /^([\d.,]+)(.*)$/.exec(el.textContent.trim());
    if (!m) return;
    var raw = m[1].replace(',', '.'), n = parseFloat(raw), dec = (raw.split('.')[1] || '').length, suf = m[2], o = { v: 0 };
    if (isNaN(n)) return;
    el.textContent = (0).toFixed(dec) + suf;
    whenOpen(function () {
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(o, { v: n, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = o.v.toFixed(dec) + suf; } });
      } });
    });
  }

  /* ---------- GSAP rejissurasi ---------- */
  function choreography() {
    if (!hasG) return;
    gsap.registerPlugin(ScrollTrigger);

    /* sarlavhalar: harf-harf */
    $$('.hero h1, .phead h1, .head h2, .cta h2, .blk h2, .faq h2').forEach(function (h) {
      var s = splitEl(h), isHero = h.closest('.hero');
      if (s.chars.length) gsap.set(s.chars, { yPercent: 118, rotate: 7 }); if (s.units.length) gsap.set(s.units, { yPercent: 118 });
      var go = function () {
        if (s.chars.length) gsap.to(s.chars, { yPercent: 0, rotate: 0, duration: 1.3, stagger: isHero ? .03 : .018, ease: 'expo.out', clearProps: 'transform' });
        if (s.units.length) gsap.to(s.units, { yPercent: 0, duration: 1.3, delay: .25, ease: 'expo.out', clearProps: 'transform' });
      };
      if (isHero || h.closest('.phead')) whenOpen(go);
      else ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { whenOpen(go); } });
    });

    /* manifest: so'zma-so'z yorishadi */
    var mt = $('.man__t');
    if (mt) {
      var ws = [];
      (function walk(n) {
        Array.prototype.slice.call(n.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var f = document.createDocumentFragment();
            c.nodeValue.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span'); s.className = 'w'; s.textContent = w; f.appendChild(s); ws.push(s);
            });
            n.replaceChild(f, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(mt);
      if (!reduce && ws.length) {
        gsap.set(ws, { opacity: .14 });
        gsap.to(ws, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: '.man', start: 'top 72%', end: 'bottom 62%', scrub: true } });
      }
    }

    /* gorizontal yo'nalishlar */
    var hz = $('#hz'), tr = $('#ranges');
    if (hz && tr) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', function () {
        hz.classList.add('hz--pin');
        gsap.to(tr, { x: function () { return -(tr.scrollWidth - innerWidth); }, ease: 'none',
          scrollTrigger: { trigger: hz, start: 'top top', end: function () { return '+=' + (tr.scrollWidth - innerWidth + innerHeight * .35); }, pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
        return function () { hz.classList.remove('hz--pin'); };
      });
    }

    /* bloklar paydo bo'lishi */
    var sel = '.card, .award, .pillars > div, .tl li, .info__i, .faq__item, .form, .nutri > div, .blk, .dlcard, .chatw, .pd__ph, .cta, .geo span, .figures > div, .hero__tag, .crumb, #story > *, .map, .count, .filters > *';
    var items = $$(sel).filter(function (e) { return !e.closest('#ranges'); });
    if (items.length) gsap.set(items, { opacity: 0, y: 46 });
    if (items.length) ScrollTrigger.batch(items, {
      start: 'top 92%', once: true, interval: .08, batchMax: 8,
      onEnter: function (els) { whenOpen(function () { gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: .07, ease: 'expo.out', overwrite: true, clearProps: 'transform,opacity' }); }); }
    });

    /* raqamlar */
    $$('.figures b, .nutri b').forEach(countUp);

    /* yo'nalish rasmlari parallaksi */
    $$('#story img, .award img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* footer */
    var fb = $('.ftr__big');
    if (fb) gsap.from(fb, { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: fb, start: 'top 105%', end: 'bottom 85%', scrub: true } });

    addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  }

  /* ---------- scroll, kursor, magnit, tilt ---------- */
  function smooth() {
    if (window.Lenis && hasG && !reduce) {
      lenis = new Lenis({ lerp: .09, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    $$('.chatw__body, .lang__pop').forEach(function (e) { e.setAttribute('data-lenis-prevent', ''); });
    var burger = $('.burger');
    if (burger) burger.addEventListener('click', function () {
      var o = burger.getAttribute('aria-expanded') === 'true';
      if (lenis) o ? lenis.stop() : lenis.start();
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { if (lenis) lenis.start(); }); });
    document.addEventListener('click', function (e) {
      var up = e.target.closest && e.target.closest('#up');
      if (up && lenis) { e.stopImmediatePropagation(); lenis.scrollTo(0, { duration: 1.6 }); }
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) {
        var t = $(a.getAttribute('href'));
        if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: 'smooth' }); }
      }
    }, true);
  }

  var mqx = 0, lastY = scrollY, lastDir = 0, hdr = null;
  function loop() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight, dy = y - lastY;
    vel += (dy - vel) * .1; lastY = y;
    P = h > 0 ? Math.max(0, Math.min(1, y / h)) : 0;
    var pg = $('#prog'); if (pg) pg.style.transform = 'scaleX(' + P + ')';
    if (hdr) {
      if (y > 220 && dy > 4 && !$('.nav.open')) hdr.classList.add('hide');
      else if (dy < -4 || y < 120) hdr.classList.remove('hide');
    }
    var mq = $('#mqt');
    if (mq && !reduce) {
      mqx -= 1.5 + Math.abs(vel) * .3; var w = mq.scrollWidth / 4; if (mqx < -w) mqx += w;
      mq.style.transform = 'translateX(' + mqx + 'px) skewX(' + Math.max(-12, Math.min(12, -vel * .4)) + 'deg)';
    }
    requestAnimationFrame(loop);
  }

  function interactions() {
    if (!fine || reduce) return;
    var cu = $('#cu');
    if (cu && hasG) {
      var xs = gsap.quickSetter(cu, 'x', 'px'), ys = gsap.quickSetter(cu, 'y', 'px'), cx = 0, cy = 0, tx = 0, ty = 0;
      addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
      gsap.ticker.add(function () { cx += (tx - cx) * .22; cy += (ty - cy) * .22; xs(cx); ys(cy); });
      document.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest('.range, .card')) cu.classList.add('big'); });
      document.addEventListener('pointerout', function (e) { if (e.target.closest && e.target.closest('.range, .card') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.range, .card'))) cu.classList.remove('big'); });
    }
    if (!hasG) return;
    /* magnit */
    document.addEventListener('pointermove', function (e) {
      var m = e.target.closest && e.target.closest('.btn, .up, .logo');
      if (m) {
        var b = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - b.left - b.width / 2) * .28, y: (e.clientY - b.top - b.height / 2) * .4, duration: .4, ease: 'power3.out', overwrite: 'auto' });
        m._mag = true;
      }
      $$('.btn, .up, .logo').forEach(function (n) { if (n._mag && n !== m) { n._mag = false; gsap.to(n, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.45)', overwrite: 'auto' }); } });
    }, { passive: true });
    /* 3D tilt */
    var cur = null, TS = '.card, .award, .pd__ph';
    function reset(n) { gsap.to(n, { rotationX: 0, rotationY: 0, scale: 1, duration: .8, ease: 'elastic.out(1,.5)', overwrite: 'auto' }); }
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest(TS);
      if (cur && cur !== t) { reset(cur); cur = null; }
      if (!t) return; cur = t;
      var b = t.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      gsap.to(t, { rotationY: (x - .5) * 18, rotationX: (.5 - y) * 18, scale: 1.03, transformPerspective: 1000, duration: .45, ease: 'power2.out', overwrite: 'auto' });
      t.style.setProperty('--mx', x * 100 + '%'); t.style.setProperty('--my', y * 100 + '%');
    }, { passive: true });
  }

  /* ---------- sahifalar orasidagi parda ---------- */
  function transitions() {
    var ct = $('#ct');
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || !hasG || reduce || !ct) return;
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download') || /^(mailto|tel|javascript):/i.test(h)) return;
      var u; try { u = new URL(a.href, location.href); } catch (er) { return; }
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search && u.hash)) return;
      e.preventDefault();
      gsap.to(ct, { y: 0, yPercent: 0, duration: .65, ease: 'expo.inOut', onComplete: function () { ss('sl.nav', '1'); location.href = a.href; } });
      setTimeout(function () { location.href = a.href; }, 2500);
    });
    addEventListener('pageshow', function (e) { if (e.persisted && ct) gsap.set(ct, { yPercent: 100 }); });
  }

  /* ---------- ishga tushirish ---------- */
  function intro() {
    var ct = $('#ct'), first = !ss('sl.ld'), nav = ss('sl.nav');
    ss('sl.nav', null);
    if (!hasG || reduce) { var l0 = $('#ld'); if (l0) l0.remove(); clearHold(); G.intro.v = 1; open(); return; }
    if (first) {
      ss('sl.ld', '1');
      var ld = document.createElement('div'); ld.id = 'ld'; ld.innerHTML = '<b id="ldn">0</b><small>SLADUS · LEADING</small>';
      document.body.appendChild(ld); clearHold();
      G.intro.v = isHome ? 0 : 1;
      var o = { v: 0 }, n = $('#ldn');
      gsap.to(o, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: function () { n.textContent = Math.round(o.v); }, onComplete: function () {
        gsap.to(ld, { yPercent: -100, duration: 1, ease: 'expo.inOut', onComplete: function () { ld.remove(); } });
        open(); if (isHome) gsap.to(G.intro, { v: 1, duration: 2.2, ease: 'elastic.out(1,.6)', delay: .2 });
      } });
    } else if (nav) {
      gsap.set(ct, { yPercent: 0 }); clearHold();
      gsap.to(ct, { yPercent: -100, duration: .9, ease: 'expo.inOut', delay: .1, onComplete: function () { gsap.set(ct, { yPercent: 100 }); } });
      setTimeout(open, 450);
    } else { clearHold(); open(); }
  }

  function ready() {
    if (booted) return; booted = true;
    hdr = $('#hdr');
    smooth(); choreography(); interactions(); transitions(); intro();
    document.addEventListener('sladus:redraw', function () {
      if (!hasG) return;
      var cards = $$('#grid .card');
      gsap.from(cards, { y: 40, opacity: 0, duration: .7, stagger: .035, ease: 'expo.out', clearProps: 'transform,opacity' });
      setTimeout(function () { ScrollTrigger.refresh(); }, 80);
    });
    requestAnimationFrame(loop);
  }

  mount();
  cosmos();
  setTimeout(function () { clearHold(); if (!booted) open(); }, 6000);
  if (window.SL_READY) ready(); else document.addEventListener('sladus:ready', ready);
})();
