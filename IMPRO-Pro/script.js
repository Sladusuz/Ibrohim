(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- i18n ---------- */
  const I18N = {
    ru: {},
    uz: {
      'nav.services': 'Xizmatlar', 'nav.work': 'Ishlar', 'nav.process': 'Jarayon', 'nav.pricing': 'Narxlar', 'nav.faq': 'FAQ', 'nav.cta': 'Loyihani boshlash',
      'hero.pill': 'Yangi loyihalarni qabul qilamiz', 'hero.h1a': 'Sotadigan', 'hero.h1b': 'saytlar.',
      'hero.lead': "IMPRO — Toshkentdagi premium veb-ishlab chiqish studiyasi. Tez, chiroyli va konversiyaga yo'naltirilgan saytlar, do'konlar va veb-ilovalar yaratamiz.",
      'hero.cta1': 'Loyihani muhokama qilish →', 'hero.cta2': 'Ishlarni ko‘rish',
      'hero.t1': 'loyiha', 'hero.t2': 'mijoz', 'hero.t3': 'Lighthouse', 'hero.t4': 'kun ishga tushirishgacha', 'hero.f1': 'arizalar', 'hero.f2': 'yuklanish',
      'sv.eyebrow': 'Xizmatlar', 'sv.title': 'Biznesingizga onlaynda kerak bo‘lgan hamma narsa',
      'sv.1t': 'Lendinglar va korporativ saytlar', 'sv.1d': 'Sotuvchi struktura, premium dizayn, animatsiyalar va 1 soniyadan kam yuklanish.',
      'sv.2t': 'Internet-do‘konlar', 'sv.2d': 'Katalog, savat, Payme / Click to‘lovi va admin panel.',
      'sv.3t': 'Telegram-botlar', 'sv.3d': 'Buyurtmalar, bildirishnomalar va qo‘llab-quvvatlashni avtomatlashtirish.',
      'sv.4t': 'UI/UX dizayn', 'sv.4d': 'Bo‘lish yoqimli va xarid qilish oson interfeyslar.',
      'sv.5t': 'SEO va tezlik', 'sv.5d': 'Google va Yandex uchun optimallashtirish, Core Web Vitals yashil zonada.',
      'sv.6t': 'Veb-ilovalar va CRM', 'sv.6d': 'Kabinetlar, dashboardlar, integratsiyalar va API — g‘oyadan productiongacha.',
      'wk.eyebrow': 'Portfolio', 'wk.title': 'Haqiqiy loyihalar, haqiqiy natijalar', 'wk.1': 'Brend va sayt', 'wk.2': 'Maktab sayti', 'wk.3': 'Sizning loyihangiz — keyingisi',
      'pr.eyebrow': 'Jarayon', 'pr.title': 'G‘oyadan ishga tushirishgacha 4 qadamda',
      'pr.1t': 'Brif', 'pr.1d': 'Maqsad, auditoriya va raqobatchilarni o‘rganamiz. TZ va muddatni belgilaymiz.',
      'pr.2t': 'Dizayn', 'pr.2d': 'Prototip va vizual. Hammasini kelishib olamiz.',
      'pr.3t': 'Ishlab chiqish', 'pr.3d': 'Toza kod, adaptivlik, animatsiyalar, integratsiyalar va testlar.',
      'pr.4t': 'Ishga tushirish', 'pr.4d': 'Domen, hosting, SEO, analitika va relizdan keyingi yordam.',
      'pc.eyebrow': 'Narxlar', 'pc.title': 'Shaffof paketlar', 'pc.hot': 'Mashhur', 'pc.cta': 'Buyurtma berish',
      'pc.1p': '$150 dan', 'pc.2p': '$400 dan', 'pc.3p': '$900 dan',
      'pc.f1': '5 blokkacha lending', 'pc.f2': 'Barcha ekranlarga moslashuvchan', 'pc.f3': 'Arizalar Telegramga', 'pc.f4': 'Muddat: 3–5 kun',
      'pc.g1': 'Ko‘p sahifali sayt', 'pc.g2': 'Noyob dizayn va animatsiyalar', 'pc.g3': 'SEO va analitika', 'pc.g4': 'Admin panel', 'pc.g5': 'Muddat: 7–14 kun',
      'pc.h1': 'Do‘kon / veb-ilova', 'pc.h2': 'Payme / Click to‘lovi', 'pc.h3': 'Telegram-bot va CRM', 'pc.h4': '3 oy yordam',
      'ab.eyebrow': 'Asoschi', 'ab.title': 'Ibrohim Abdulboqiyev',
      'ab.p1': 'Toshkentlik full-stack dasturchi. IT sohasida 2024-yildan beri — 16 yoshdan raqamli mahsulotlar yarataman va IMPRO studiyasini boshqaraman.',
      'ab.p2': 'Falsafam: texnologiklik, estetika va mas’uliyat. Har bir sayt — mijoz shaxsiyatining aksi.',
      'fq.eyebrow': 'FAQ', 'fq.title': 'Ko‘p so‘raladigan savollar',
      'fq.1q': 'Sayt yaratish qancha vaqt oladi?', 'fq.1a': 'Lending — 3–5 kun, korporativ sayt — 1–2 hafta, do‘kon — 3 haftadan.',
      'fq.2q': 'To‘lov qanday amalga oshiriladi?', 'fq.2a': 'TZ kelishilgach 50% oldindan to‘lov, topshirilgach 50%. UZ kartalari va bank o‘tkazmasi.',
      'fq.3q': 'Ishga tushgandan keyin yordam bormi?', 'fq.3a': 'Ha. 30 kun ichida xatolarni bepul tuzatamiz va qo‘llab-quvvatlash paketlarini taklif qilamiz.',
      'fq.4q': 'Sayt telefonlarda ishlaydimi?', 'fq.4a': 'Albatta. Barcha saytlar adaptiv va Chrome, Safari, Firefox, Edge’da tekshiriladi.',
      'ct.eyebrow': 'Aloqa', 'ct.title': 'Loyiha haqida ayting — bir soatda javob beramiz', 'ct.addr': 'Toshkent, O‘zbekiston',
      'ct.name': 'Ism', 'ct.phone': 'Telefon yoki Telegram', 'ct.msg': 'Loyiha haqida', 'ct.send': 'Telegramga yuborish →',
      'ct.err': 'Ism va aloqa ma’lumotini to‘ldiring', 'ct.ok': 'Matn nusxalandi — Telegramda yuboring',
      'ft.rights': 'Barcha huquqlar himoyalangan.', 'ft.top': 'Yuqoriga ↑'
    },
    en: {
      'nav.services': 'Services', 'nav.work': 'Work', 'nav.process': 'Process', 'nav.pricing': 'Pricing', 'nav.faq': 'FAQ', 'nav.cta': 'Start a project',
      'hero.pill': 'Now accepting new projects', 'hero.h1a': 'Websites that', 'hero.h1b': 'sell.',
      'hero.lead': 'IMPRO is a premium web studio from Tashkent. We build fast, beautiful, conversion-focused websites, stores and web apps.',
      'hero.cta1': 'Discuss your project →', 'hero.cta2': 'See our work',
      'hero.t1': 'projects', 'hero.t2': 'clients', 'hero.t3': 'Lighthouse', 'hero.t4': 'days to launch', 'hero.f1': 'leads', 'hero.f2': 'load time',
      'sv.eyebrow': 'Services', 'sv.title': 'Everything your business needs online',
      'sv.1t': 'Landing & corporate sites', 'sv.1d': 'Selling structure, premium design, animations and sub-second load times.',
      'sv.2t': 'Online stores', 'sv.2d': 'Catalog, cart, Payme / Click payments and admin panel.',
      'sv.3t': 'Telegram bots', 'sv.3d': 'Automate orders, notifications and support.',
      'sv.4t': 'UI/UX design', 'sv.4d': 'Interfaces that are a pleasure to use and easy to buy from.',
      'sv.5t': 'SEO & speed', 'sv.5d': 'Google & Yandex optimisation, Core Web Vitals in the green.',
      'sv.6t': 'Web apps & CRM', 'sv.6d': 'Dashboards, portals, integrations and APIs — from idea to production.',
      'wk.eyebrow': 'Portfolio', 'wk.title': 'Real projects, real results', 'wk.1': 'Brand & website', 'wk.2': 'School website', 'wk.3': 'Your project is next',
      'pr.eyebrow': 'Process', 'pr.title': 'From idea to launch in 4 steps',
      'pr.1t': 'Brief', 'pr.1d': 'We study goals, audience and competitors, then lock scope and timeline.',
      'pr.2t': 'Design', 'pr.2d': 'Prototype and visuals. We align on every detail.',
      'pr.3t': 'Development', 'pr.3d': 'Clean code, responsive layout, animations, integrations and tests.',
      'pr.4t': 'Launch', 'pr.4d': 'Domain, hosting, SEO, analytics and post-release support.',
      'pc.eyebrow': 'Pricing', 'pc.title': 'Transparent packages', 'pc.hot': 'Popular', 'pc.cta': 'Order now',
      'pc.1p': 'from $150', 'pc.2p': 'from $400', 'pc.3p': 'from $900',
      'pc.f1': 'Landing up to 5 blocks', 'pc.f2': 'Responsive on all screens', 'pc.f3': 'Lead form to Telegram', 'pc.f4': 'Timeline: 3–5 days',
      'pc.g1': 'Multi-page website', 'pc.g2': 'Unique design & animations', 'pc.g3': 'SEO & analytics', 'pc.g4': 'Admin panel', 'pc.g5': 'Timeline: 7–14 days',
      'pc.h1': 'Store / web app', 'pc.h2': 'Payme / Click payments', 'pc.h3': 'Telegram bot & CRM', 'pc.h4': '3 months of support',
      'ab.eyebrow': 'Founder', 'ab.title': 'Ibrohim Abdulboqiyev',
      'ab.p1': 'Full-stack developer from Tashkent. In IT since 2024 — building digital products since age 16 and running the IMPRO studio.',
      'ab.p2': 'My philosophy: technology, aesthetics and responsibility. Every site reflects the personality of its client.',
      'fq.eyebrow': 'FAQ', 'fq.title': 'Frequently asked questions',
      'fq.1q': 'How long does a website take?', 'fq.1a': 'Landing — 3–5 days, corporate site — 1–2 weeks, store — from 3 weeks.',
      'fq.2q': 'How does payment work?', 'fq.2a': '50% upfront after the scope is agreed, 50% on delivery. UZ cards and bank transfer.',
      'fq.3q': 'Do you offer support after launch?', 'fq.3a': 'Yes. Bug fixes are free for 30 days, and we offer ongoing support plans.',
      'fq.4q': 'Will it work on phones?', 'fq.4a': 'Always. Every site is responsive and tested in Chrome, Safari, Firefox and Edge.',
      'ct.eyebrow': 'Contact', 'ct.title': "Tell us about your project — we'll reply within an hour", 'ct.addr': 'Tashkent, Uzbekistan',
      'ct.name': 'Name', 'ct.phone': 'Phone or Telegram', 'ct.msg': 'About the project', 'ct.send': 'Send to Telegram →',
      'ct.err': 'Please fill in your name and contact', 'ct.ok': 'Text copied — paste it in Telegram',
      'ft.rights': 'All rights reserved.', 'ft.top': 'Back to top ↑'
    }
  };
  const nodes = $$('[data-i18n]');
  nodes.forEach(n => { I18N.ru[n.dataset.i18n] = n.textContent; });
  Object.assign(I18N.ru, { 'ct.err': 'Заполните имя и контакт', 'ct.ok': 'Текст скопирован — вставьте его в Telegram' });
  let lang = 'ru';
  const t = k => (I18N[lang] && I18N[lang][k]) || I18N.ru[k] || '';
  function setLang(l, save = true) {
    if (!I18N[l]) l = 'ru';
    lang = l;
    document.documentElement.lang = l;
    nodes.forEach(n => { const v = t(n.dataset.i18n); if (v) n.textContent = v; });
    $$('#lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
    if (save) store.set('lang', l);
  }
  $('#lang').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); });
  setLang(store.get('lang') || 'ru', false);

  /* ---------- theme ---------- */
  $('#theme').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; store.set('theme', next);
  });

  /* ---------- nav ---------- */
  const nav = $('#nav'), links = $('#links'), burger = $('#burger'), bar = $('#progress');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); links.classList.toggle('open'); });
  links.addEventListener('click', e => { if (e.target.closest('a')) { burger.classList.remove('open'); links.classList.remove('open'); } });
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100 || 0) + '%';
    nav.classList.toggle('scrolled', h.scrollTop > 20);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#year').textContent = new Date().getFullYear();

  /* ---------- reveal + counters ---------- */
  const count = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1600;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- rotating headline ---------- */
  const words = {
    ru: ['продают.', 'впечатляют.', 'летают.', 'растут.'],
    uz: ['sotadi.', 'hayratga soladi.', 'uchadi.', 'o‘sadi.'],
    en: ['sell.', 'impress.', 'fly.', 'scale.']
  };
  const typed = $('#typed'); let wi = 0;
  if (!reduce) setInterval(() => {
    typed.style.transition = 'opacity .35s'; typed.style.opacity = 0;
    setTimeout(() => { wi = (wi + 1) % 4; typed.textContent = words[lang][wi]; typed.style.opacity = 1; }, 350);
  }, 2800);

  /* ---------- cursor glow, tilt, magnetic ---------- */
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const cur = $('#cursor');
  if (fine && !reduce) {
    addEventListener('pointermove', e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
        el.style.transform = `perspective(900px) rotateX(${((y / r.height) - .5) * -6}deg) rotateY(${((x / r.width) - .5) * 6}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    const mock = $('#mock'), win = $('.win', mock);
    mock.addEventListener('pointermove', e => {
      const r = mock.getBoundingClientRect();
      win.style.transform = `rotateY(${((e.clientX - r.left) / r.width - .5) * -22}deg) rotateX(${((e.clientY - r.top) / r.height - .5) * 14}deg)`;
    });
    mock.addEventListener('pointerleave', () => { win.style.transform = ''; });
  }

  /* ---------- particle network background ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor(innerWidth * innerHeight / 16000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  };
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const light = document.documentElement.dataset.theme === 'light', rgb = light ? '90,70,220' : '140,120,255';
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fillStyle = `rgba(${rgb},.8)`; ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 130) { ctx.strokeStyle = `rgba(${rgb},${(1 - d / 130) * .25})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
    if (!document.hidden) requestAnimationFrame(draw);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduce) requestAnimationFrame(draw); });
  if (reduce) { draw(); } else requestAnimationFrame(draw);

  /* ---------- contact form -> Telegram ---------- */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = (f.get('name') || '').trim(), contact = (f.get('contact') || '').trim();
    $$('input', form).forEach(i => i.classList.toggle('err', !i.value.trim()));
    if (!name || !contact) { note.textContent = t('ct.err'); return; }
    const text = `IMPRO\n👤 ${name}\n📞 ${contact}\n📝 ${(f.get('msg') || '').trim()}`;
    note.textContent = t('ct.ok');
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    open('https://web.telegram.org/a/#7873475468', '_blank', 'noopener');
    form.reset();
  });
})();
