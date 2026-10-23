(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* loader */
  const loader = $('#loader'), bar = $('#ldBar');
  let p = 0, started = false;
  const tick = () => {
    p = Math.min(100, p + 10 + Math.random() * 14);
    bar.style.width = p + '%';
    p < 100 ? setTimeout(tick, 70) : setTimeout(start, 250);
  };
  function start() {
    if (started) return; started = true;
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1000);
    observe();
  }
  tick(); setTimeout(start, 2500);

  /* reveal + counters */
  function observe() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(count);
      if (e.target.matches('[data-count]')) count(e.target);
      io.unobserve(e.target);
    }), { threshold: .12 });
    $$('.pop').forEach(el => io.observe(el));
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 1400;
    const fmt = v => sep ? v.toLocaleString('ru-RU').replace(/ /g, ' ') : v;
    const f = t => {
      const k = Math.min(1, (t - t0) / d);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  /* nav + progress */
  const nav = $('#nav'), prog = $('#progress'), links = $('#links'), dock = $('#dock');
  let lastY = 0, queued = false;
  const onScroll = () => {
    queued = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('hide', y > lastY && y > 300 && !links.classList.contains('open'));
    lastY = y;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  new IntersectionObserver(([e]) => dock.classList.toggle('hide', e.isIntersecting), { threshold: .25 }).observe($('#contact'));

  /* menu */
  const burger = $('#burger');
  const toggle = o => {
    burger.setAttribute('aria-expanded', o);
    links.classList.toggle('open', o);
    document.body.style.overflow = o ? 'hidden' : '';
    nav.classList.remove('hide');
  };
  burger.onclick = () => toggle(burger.getAttribute('aria-expanded') !== 'true');
  $$('a', links).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  /* problems */
  const D = [
    ['Kariyes', 'Plomba', 'img/smile.jpg', "Emal yemirilishidan boshlanadi. Dastlab qora dog' yoki shirinlikka sezgirlik bo'lishi mumkin. Erta davolansa, tishni to'liq saqlab qolish oson."],
    ['Gingivit', 'Professional tozalash', 'img/tools.jpg', "Milkning yallig'lanishi: qizarish, shish va cho'tkalaganda qonash. Odatda professional tozalash va to'g'ri gigiena bilan ortga qaytadi."],
    ['Parodontit', 'Davolash', 'img/xray.jpg', "Tishni ushlab turuvchi to'qimalarning yallig'lanishi. Tishlar qimirlashi va milk pasayishiga olib kelishi mumkin. Kechiktirmang."],
    ['Tish toshi va sarg\'ayish', 'Tozalash va oqartirish', 'img/smile_after.jpg', "Karash vaqt o'tib qotib, toshga aylanadi va uni uy sharoitida olib bo'lmaydi. Professional tozalash va oqartirish yechim bo'ladi."],
    ['Tish yo\'qolgan', 'Implant yoki protez', 'img/scan.jpg', "Bo'sh joy qo'shni tishlarning siljishiga va chaynash buzilishiga olib kelishi mumkin. Implant yoki protez variantlarini shifokor holatga qarab tanlaydi."]
  ];
  const ans = $('#answer');
  $$('#chips button').forEach(b => b.addEventListener('click', () => {
    $$('#chips button').forEach(x => x.classList.toggle('on', x === b));
    const [t, tag, img, d] = D[b.dataset.k];
    $('#ansT').textContent = t; $('#ansTag').textContent = tag; $('#ansP').textContent = d; $('#ansImg').src = img;
    ans.classList.remove('swap'); void ans.offsetWidth; ans.classList.add('swap');
  }));

  /* before / after */
  const ba = $('#ba'), baR = $('#baR');
  baR.addEventListener('input', () => ba.style.setProperty('--x', baR.value + '%'));
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    const t0 = performance.now();
    (function a(t) { const k = (t - t0) / 1800; if (k > 1) return; const v = 50 + Math.sin(k * Math.PI * 2) * 30 * (1 - k); ba.style.setProperty('--x', v + '%'); baR.value = v; requestAnimationFrame(a); })(t0);
  }, { threshold: .6 }).observe(ba);

  /* form → telegram */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = f.get('name').trim(), phone = f.get('phone').trim();
    const okPhone = phone.replace(/\D/g, '').length >= 9;
    form.name.classList.toggle('bad', !name);
    form.phone.classList.toggle('bad', !okPhone);
    if (!name || !okPhone) { note.style.color = '#e0392b'; note.textContent = "Iltimos, ism va telefon raqamini to'g'ri kiriting."; return; }
    const msg = `Assalomu alaykum, Dr. Xayot! Qabulga yozilmoqchiman.\nIsm: ${name}\nTelefon: ${phone}\nXizmat: ${f.get('svc')}`;
    note.style.color = ''; note.textContent = 'Telegram ochilmoqda…';
    open('https://t.me/dr_xayot?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  $('#yr').textContent = new Date().getFullYear();
})();
