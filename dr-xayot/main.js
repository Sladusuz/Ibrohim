(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = !!window.gsap && !!window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .09, wheelMultiplier: .95 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && $(id);
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: -10, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- split words (headings) ---------- */
  function splitWords(el, cls = 'w') {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t.trim()) return frag.append(t);
          const w = document.createElement('span');
          w.className = cls;
          if (cls === 'w' && el.classList.contains('split')) w.innerHTML = `<span style="--i:${i++}">${t}</span>`; else w.textContent = t;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  }
  $$('.split').forEach(el => splitWords(el));

  /* ---------- loader ---------- */
  const loader = $('#loader'), num = $('#loadNum');
  let p = 0, started = false;
  const tick = () => {
    p = Math.min(100, p + 3 + Math.random() * 5);
    num.textContent = Math.floor(p);
    p < 100 ? setTimeout(tick, 38) : setTimeout(start, 250);
  };
  function start() {
    if (started) return; started = true;
    loader.classList.add('done');
    document.body.classList.add('ready');
    setTimeout(observe, 350);
    setTimeout(() => hasGsap && ScrollTrigger.refresh(), 1200);
  }
  tick();
  setTimeout(start, 4500);

  /* ---------- reveal + counters ---------- */
  function observe() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('.arch', e.target).forEach(a => a.classList.add('in'));
      $$('[data-count]', e.target).forEach(count);
      if (e.target.matches('[data-count]')) count(e.target);
      io.unobserve(e.target);
    }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal,.split,.arch-wrap').forEach((el, i) => {
      if (el.closest('.hx')) { el.style.setProperty('--d', (.7 + i * .1) + 's'); setTimeout(() => el.classList.add('in'), 50); return; }
      io.observe(el);
    });
    // hero counters start immediately
    $$('.hx [data-count]').forEach(el => setTimeout(() => count(el), 900));
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 2000;
    const fmt = v => sep ? v.toLocaleString('ru-RU').replace(/ /g, ' ') : v;
    const f = t => {
      const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(to * e));
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  /* ---------- nav / progress / dock ---------- */
  const nav = $('#nav'), prog = $('#progress'), dock = $('#dock'), steps = $('#steps');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('solid', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 400 && !$('#links').classList.contains('open'));
    lastY = y;
    const c = $('#contact').getBoundingClientRect();
    dock.classList.toggle('hide', c.top < innerHeight * .6 && c.bottom > 0);
    const r = steps.getBoundingClientRect();
    steps.style.setProperty('--p', Math.max(0, Math.min(100, (innerHeight * .65 - r.top) / r.height * 100)) + '%');
    const s = $('#strip');
    if (s && !reduce) {
      const sr = s.parentElement.getBoundingClientRect();
      const k = (innerHeight - sr.top) / (innerHeight + sr.height);
      const max = Math.max(0, s.scrollWidth - innerWidth);
      s.style.transform = `translateX(${-max * Math.max(0, Math.min(1, k))}px)`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), links = $('#links');
  const toggle = o => {
    burger.setAttribute('aria-expanded', o);
    links.classList.toggle('open', o);
    document.body.style.overflow = o ? 'hidden' : '';
    if (lenis) o ? lenis.stop() : lenis.start();
    nav.classList.remove('hide');
  };
  burger.onclick = () => toggle(burger.getAttribute('aria-expanded') !== 'true');
  $$('a', links).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  /* ---------- GSAP: manifesto, parallax, horizontal services ---------- */
  const mani = $('#mani');
  if (mani) splitWords(mani, 'w');
  if (hasGsap && !reduce) {
    const words = $$('#mani .w');
    gsap.to(words, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: mani, start: 'top 82%', end: 'bottom 55%', scrub: true } });
    gsap.to('.arch img', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.arch', start: 'top bottom', end: 'bottom top', scrub: true } });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const track = $('#svcTrack'), bar = $('#svcProg');
      const dist = () => track.scrollWidth - document.documentElement.clientWidth + 40;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#services', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => bar.style.transform = `scaleX(${s.progress})` }
      });
    });
  } else {
    $$('#mani .w').forEach(w => w.style.opacity = 1);
  }
  // play scene animations when a card is in view
  const scIO = new IntersectionObserver(es => es.forEach(e => {
    const sc = e.target;
    if (e.isIntersecting) { sc.classList.remove('play'); void sc.offsetWidth; sc.classList.add('play'); }
    else sc.classList.remove('play');
  }), { threshold: .6 });
  $$('.sv-scene').forEach(s => scIO.observe(s));

  /* ---------- 3D tooth ---------- */
  initGL().catch(err => { console.warn('WebGL off', err); const g = $('#gl'); g && g.remove(); });
  async function initGL() {
    const cv = $('#gl');
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
    camera.position.z = 14;

    // studio-like environment for glossy reflections
    const pm = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshBasicMaterial({ color: 0x0b1019, side: THREE.BackSide })));
    const panel = (w, h, x, y, z, c, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(10, 4, 0, 10, 3, 0xffffff, 7); panel(4, 10, -10, 1, 3, 0xffffff, 3.2);
    panel(4, 10, 10, 0, 2, 0xdfe8ff, 2.6); panel(12, 3, 0, -9, 1, 0xffffff, 1.6); panel(6, 6, 0, 2, -10, 0xe8c27a, 1.2);
    scene.environment = pm.fromScene(env, .03).texture;

    // tooth: extruded silhouette with deep bevel
    const P = (x, y) => [(x - 100) * .02, (120 - y) * .02];
    const sh = new THREE.Shape();
    sh.moveTo(...P(100, 20));
    const C = (a, b, c, d, e, f) => sh.bezierCurveTo(...P(a, b), ...P(c, d), ...P(e, f));
    C(60, 0, 20, 25, 25, 80); C(28, 120, 45, 140, 50, 190); C(53, 220, 72, 225, 78, 190);
    C(82, 165, 90, 150, 100, 150); C(110, 150, 118, 165, 122, 190); C(128, 225, 147, 220, 150, 190);
    C(155, 140, 172, 120, 175, 80); C(180, 25, 140, 0, 100, 20);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: .9, bevelEnabled: true, bevelThickness: .55, bevelSize: .5, bevelSegments: 14, curveSegments: 56 });
    geo.center();
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xfbf9f4, roughness: .2, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: .5, envMapIntensity: 1.1 });
    const tooth = new THREE.Mesh(geo, mat);
    const rig = new THREE.Group();
    rig.add(tooth);

    // orbit rings + sparks
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: .55 });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(3.9, .012, 12, 220), ringMat);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(4.7, .008, 12, 220), new THREE.MeshBasicMaterial({ color: 0x6aa7ff, transparent: true, opacity: .4 }));
    r1.rotation.x = 1.15; r2.rotation.set(1.9, .4, .3);
    rig.add(r1, r2);
    const N = 140, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 3.4, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * .8, r * Math.sin(b) * Math.sin(a)], i * 3);
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sparks = new THREE.Points(pg, new THREE.PointsMaterial({ size: .07, color: 0x9ff5e6, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
    rig.add(sparks);
    scene.add(rig);

    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-4, 6, 8); scene.add(key);
    const mint = new THREE.PointLight(0x5eead4, 14, 30); mint.position.set(5, -2, 5); scene.add(mint);
    const blue = new THREE.PointLight(0x6aa7ff, 12, 30); blue.position.set(-6, 3, -2); scene.add(blue);

    // state driven by sections (data-gl="x,y,scale,rotY")
    const st = { x: .5, y: 0, s: 0, ry: -.4 };
    const parse = el => {
      const m = innerWidth < 900 && el.dataset.glm ? el.dataset.glm : el.dataset.gl;
      const [x, y, s, ry] = m.split(',').map(Number); return { x, y, s, ry };
    };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; });

    let W = 1, H = 1, halfW = 1, halfH = 1;
    const size = () => {
      W = innerWidth; H = innerHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      halfH = Math.tan(camera.fov * Math.PI / 360) * camera.position.z; halfW = halfH * camera.aspect;
    };
    size(); addEventListener('resize', size);

    const targets = $$('[data-gl]');
    let current = null;
    const go = el => {
      if (current === el) return; current = el;
      const t = parse(el);
      if (hasGsap) gsap.to(st, { ...t, duration: 1.6, ease: 'power3.inOut', overwrite: true });
      else Object.assign(st, t);
    };
    if (hasGsap) targets.forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 45%', onToggle: s => s.isActive && go(el) }));
    go(targets[0]);
    addEventListener('resize', () => { const c = current; current = null; if (c) go(c); });

    // only render while the transparent sections are on screen
    let vis = true;
    const vio = new IntersectionObserver(es => { vis = es.some(e => e.isIntersecting) || vis && false; }, { threshold: 0 });
    const live = new Set();
    new IntersectionObserver(es => es.forEach(e => { e.isIntersecting ? live.add(e.target) : live.delete(e.target); vis = live.size > 0; }), { threshold: 0 })
      .observe(targets[0]);
    const io2 = new IntersectionObserver(es => es.forEach(e => { e.isIntersecting ? live.add(e.target) : live.delete(e.target); vis = live.size > 0; }));
    targets.forEach(t => io2.observe(t));

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      if (!vis) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
      const base = (innerWidth < 900 ? .46 : .52) * halfH * 2 / 5.2;
      const s = Math.max(.0001, st.s * base * (1 + Math.sin(t * .9) * .015));
      rig.scale.setScalar(s);
      rig.position.set(st.x * halfW, st.y * halfH + Math.sin(t * .8) * .12 * (halfH / 4), 0);
      rig.rotation.y = st.ry + Math.sin(t * .5) * .3 + mouse.x * .5 + scrollY * .0016;
      rig.rotation.x = .08 + mouse.y * .22 + Math.sin(t * .7) * .04;
      rig.rotation.z = Math.sin(t * .4) * .04 - .05;
      r1.rotation.z = t * .35; r2.rotation.z = -t * .22;
      sparks.rotation.y = t * .06; sparks.rotation.x = t * .02;
      mint.position.x = 5 + Math.sin(t * .8) * 2; blue.position.y = 3 + Math.cos(t * .6) * 2;
      renderer.render(scene, camera);
    });
  }

  /* ---------- tooth lab ---------- */
  const data = [
    ['Kariyes', "Emal yemirilishidan boshlanadi. Dastlab qora dog' yoki shirinlikka sezgirlik bo'lishi mumkin. Erta davolansa, tishni to'liq saqlab qolish oson."],
    ['Gingivit', "Milkning yallig'lanishi: qizarish, shish va cho'tkalaganda qonash. Odatda professional tozalash va to'g'ri gigiena bilan ortga qaytadi."],
    ['Parodontit', "Tishni ushlab turuvchi to'qimalarning yallig'lanishi. Tishlar qimirlashi va milk pasayishiga olib kelishi mumkin — kechiktirmang."],
    ['Tish toshi', "Karash vaqt o'tib qotib, toshga aylanadi va uni uy sharoitida olib bo'lmaydi. Milk kasalliklarining asosiy sababi — professional tozalash yechim."]
  ];
  const info = $('#info');
  $$('.hot').forEach(b => b.addEventListener('click', () => {
    $$('.hot').forEach(x => x.classList.toggle('on', x === b));
    const [t, d] = data[b.dataset.k];
    $('#infoT').textContent = t; $('#infoP').textContent = d;
    info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
  }));

  /* ---------- before / after ---------- */
  const ba = $('#ba'), baR = $('#baR');
  baR.addEventListener('input', () => ba.style.setProperty('--x', baR.value + '%'));
  if (!reduce) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    const t0 = performance.now();
    (function a(t) { const k = (t - t0) / 1800; if (k > 1) return; const v = 50 + Math.sin(k * Math.PI * 2) * 30 * (1 - k); ba.style.setProperty('--x', v + '%'); baR.value = v; requestAnimationFrame(a); })(t0);
  }, { threshold: .6 }).observe(ba);

  /* ---------- tilt / magnetic / cursor ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
    const cur = $('#cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    $$('a,button,summary,input,select,.sv').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }

  /* ---------- form → telegram ---------- */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = f.get('name').trim(), phone = f.get('phone').trim();
    const okPhone = phone.replace(/\D/g, '').length >= 9;
    form.name.classList.toggle('bad', !name);
    form.phone.classList.toggle('bad', !okPhone);
    if (!name || !okPhone) { note.style.color = '#ff9a9a'; note.textContent = "Iltimos, ism va telefon raqamini to'g'ri kiriting."; return; }
    const msg = `Assalomu alaykum, Dr. Xayot! Qabulga yozilmoqchiman.\nIsm: ${name}\nTelefon: ${phone}\nXizmat: ${f.get('svc')}`;
    note.style.color = ''; note.textContent = 'Telegram ochilmoqda…';
    open('https://t.me/dr_xayot?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  $('#yr').textContent = new Date().getFullYear();
})();
