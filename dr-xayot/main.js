(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  // split headings into words
  $$('.split').forEach(el => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t.trim()) return frag.append(t);
          const w = document.createElement('span');
          w.className = 'w';
          w.innerHTML = `<span style="--i:${i++}">${t}</span>`;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  });

  // loader
  const loader = $('#loader'), num = $('#loadNum');
  let p = 0;
  const tick = () => {
    p = Math.min(100, p + 3 + Math.random() * 5);
    num.textContent = Math.floor(p);
    p < 100 ? setTimeout(tick, 40) : setTimeout(start, 250);
  };
  let started = false;
  function start() {
    if (started) return; started = true;
    loader.classList.add('done');
    document.body.classList.add('ready');
    setTimeout(observe, 300);
  }
  tick();
  setTimeout(start, 4000);

  // reveal + counters
  function observe() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(count);
      if (e.target.matches('[data-count]')) count(e.target);
      io.unobserve(e.target);
    }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal,.split').forEach((el, i) => {
      if (el.classList.contains('reveal')) el.style.setProperty('--d', (el.closest('.hero') ? i * .08 : 0) + 's');
      io.observe(el);
    });
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 1800;
    const fmt = v => sep ? v.toLocaleString('ru-RU').replace(/ /g, ' ') : v;
    const f = t => {
      const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(to * e));
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  // nav, progress, dock
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
    if (!reduce && innerWidth > 0) {
      const s = $('#strip'), sr = s.parentElement.getBoundingClientRect();
      const prog2 = (innerHeight - sr.top) / (innerHeight + sr.height);
      const max = Math.max(0, s.scrollWidth - innerWidth);
      s.style.transform = `translateX(${-max * Math.max(0, Math.min(1, prog2))}px)`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // mobile menu
  const burger = $('#burger'), links = $('#links');
  const toggle = o => {
    burger.setAttribute('aria-expanded', o);
    links.classList.toggle('open', o);
    document.body.style.overflow = o ? 'hidden' : '';
    nav.classList.remove('hide');
  };
  burger.onclick = () => toggle(burger.getAttribute('aria-expanded') !== 'true');
  $$('a', links).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  // services accordion
  const panels = $$('.panel');
  const act = p => panels.forEach(x => x.classList.toggle('active', x === p));
  panels.forEach(p => {
    p.addEventListener('click', () => act(p));
    p.addEventListener('focus', () => act(p));
    p.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), act(p)));
    if (fine) p.addEventListener('mouseenter', () => act(p));
  });

  // tooth lab
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

  // tilt
  if (fine && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
    // magnetic + cursor
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
    $$('a,button,.panel,summary,input,select').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }

  // studio
  const SC = [
    ["Implant o'rnatish", "Yo'qolgan tish ildizi o'rniga titan vint o'rnatiladi, ustiga esa tabiiy ko'rinishdagi qoplama (koronka) qo'yiladi.", ["Tekshiruv va reja", "Implant o'rnatish", "Koronka"]],
    ["Plomba qo'yish", "Kariesli qism tozalanadi, kovak maxsus material bilan to'ldiriladi va yorug'lik nuri bilan qotiriladi.", ["Kariesni tozalash", "Kovakni to'ldirish", "Nur bilan qotirish"]],
    ["Professional tozalash (chistka)", "Ultratovush yordamida tish toshi va karash olinadi, tishlar silliq va toza bo'lib qoladi.", ["Ultratovush bilan tozalash", "Karash va toshni olish", "Silliqlash"]],
    ["Tish sug'urish", "Mahalliy og'riqsizlantirishdan so'ng tish ehtiyotkorlik bilan chiqariladi. Tiklanish bo'yicha tavsiyalar beriladi.", ["Og'riqsizlantirish", "Ehtiyotkor sug'urish", "Tiklanish bo'yicha tavsiya"]],
    ["Protez va koronka", "Yo'qolgan yoki shikastlangan tishlar o'rniga chiroyli va qulay qoplama yoki ko'prik o'rnatiladi.", ["Tayyorlash va o'lchov", "Protezni yasash", "O'rnatish va moslash"]],
    ["Tishni oqartirish", "Tozalashdan keyin maxsus gel va yorug'lik yordamida tishlar bir necha tonga ochiladi.", ["Tozalash", "Gel va nur", "Natijani saqlash"]]
  ];
  const stage = $('#studioStage'), scs = $$('.sc', stage), tabs = $$('#tabs button'), si = $('#stepInfo');
  let cur = 0;
  const play = () => { stage.classList.remove('play'); void stage.offsetWidth; stage.classList.add('play'); };
  const show = k => {
    cur = k;
    tabs.forEach((t, i) => t.classList.toggle('on', i === k));
    scs.forEach((s, i) => s.classList.toggle('on', i === k));
    const [t, d, l] = SC[k];
    $('#siT').textContent = t; $('#siP').textContent = d;
    $('#siL').innerHTML = l.map(x => `<li>${x}</li>`).join('');
    si.classList.remove('swap'); void si.offsetWidth; si.classList.add('swap');
    play();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }));
  $('#replay').addEventListener('click', play);
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { play(); o.disconnect(); } }, { threshold: .35 }).observe(stage);

  // before / after
  const ba = $('#ba'), baR = $('#baR');
  baR.addEventListener('input', () => ba.style.setProperty('--x', baR.value + '%'));
  if (!reduce) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    let t0 = performance.now();
    (function a(t) { const k = (t - t0) / 1800; if (k > 1) return; const v = 50 + Math.sin(k * Math.PI * 2) * 30 * (1 - k); ba.style.setProperty('--x', v + '%'); baR.value = v; requestAnimationFrame(a); })(t0);
  }, { threshold: .6 }).observe(ba);

  // form → telegram
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

  // particle field
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [], mx = -999, my = -999, vis = true;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, W * H / 15000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
  }
  size(); addEventListener('resize', size);
  addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
  const link = innerWidth < 700 ? 90 : 130;
  (function draw() {
    requestAnimationFrame(draw);
    if (!vis || reduce) return;
    ctx.clearRect(0, 0, W, H);
    for (const a of pts) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      const dx = a.x - mx, dy = a.y - my, d = Math.hypot(dx, dy);
      if (d < 120) { a.x += dx / d * 1.2; a.y += dy / d * 1.2; }
      ctx.fillStyle = 'rgba(94,234,212,.7)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < link) { ctx.strokeStyle = `rgba(94,234,212,${(1 - d / link) * .22})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
  })();
})();
