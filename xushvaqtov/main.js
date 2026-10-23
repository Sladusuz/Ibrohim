(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* loader */
  const loader = $('#loader'), bar = $('#ldBar');
  let p = 0, started = false;
  const tick = () => {
    p = Math.min(100, p + 9 + Math.random() * 14);
    bar.style.width = p + '%';
    p < 100 ? setTimeout(tick, 70) : setTimeout(start, 250);
  };
  function start() {
    if (started) return; started = true;
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1200);
    observe();
  }
  tick(); setTimeout(start, 2500);

  /* reveal + counters */
  function observe() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(count);
      io.unobserve(e.target);
    }), { threshold: .12 });
    $$('.rv').forEach(el => io.observe(el));
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 1600;
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
  new IntersectionObserver(([e]) => dock.classList.toggle('hide', e.isIntersecting), { threshold: .2 }).observe($('#contact'));

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

  /* preselect service from buttons */
  const sel = $('#svcSel');
  $$('[data-svc]').forEach(b => b.addEventListener('click', () => { sel.value = b.dataset.svc; }));

  /* explorer */
  const D = [
    ['Otoplastika', 'Quloq shaklini tuzatish', 'img/or2.jpg', "Turtib chiqqan yoki nomutanosib quloqlar uchun otoplastika ko'riladi. Maqsad: quloqni tabiiy va simmetrik shaklga keltirish hamda yuz bilan uyg'unlikka erishish."],
    ['Blefaroplastika', 'Osilgan qovoqlar', 'img/facial.jpg', "Qovoqlardagi ortiqcha teri ko'zni kichik va charchagan ko'rsatishi mumkin. Blefaroplastika bunday ortiqcha to'qimani olib, ko'z atrofini yengillashtiradi."],
    ['Blefaroplastika', 'Charchagan ko\'rinish', 'img/skin.jpg', "Ko'z atrofidagi \"qop\"lar va ortiqcha teri doim charchagan ko'rinish beradi. Blefaroplastika ko'z atrofini yoshartirishga qaratilgan."],
    ['Yuz-jag\' jarrohligi', 'Yuz va jag\' sohasi', 'img/surgeons.jpg', "Yuz-jag' sohasidagi muammolar uchun ko'rik va jarrohlik konsultatsiyasi kerak bo'ladi. Dr. Xushvaqtov yuz-jag' jarrohi sifatida ham qabul qiladi."],
    ['Konsultatsiya', 'Birga aniqlaymiz', 'img/consult.jpg', "Qaysi yo'nalish kerakligini bilmasangiz, bepul konsultatsiyaga yoziling: shifokor holatingizni ko'rib, mos variantlarni tushuntiradi."]
  ];
  const ans = $('#answer');
  const setAns = k => {
    const [tag, t, img, d] = D[k];
    $('#ansTag').textContent = tag; $('#ansT').textContent = t; $('#ansP').textContent = d; $('#ansImg').src = img;
    $('#ansBtn').dataset.svc = tag === 'Konsultatsiya' ? 'Konsultatsiya' : tag;
  };
  setAns(0);
  $$('#chips button').forEach(b => b.addEventListener('click', () => {
    $$('#chips button').forEach(x => x.classList.toggle('on', x === b));
    setAns(b.dataset.k);
    ans.classList.remove('swap'); void ans.offsetWidth; ans.classList.add('swap');
  }));
  $('#ansBtn').addEventListener('click', e => { sel.value = e.currentTarget.dataset.svc; });

  /* recovery timeline (general information) */
  const R = [
    [["Operatsiya kuni", "Muolaja odatda amublator (bir kunlik) tarzda o'tkaziladi; bosh bog'lamda bo'ladi."],
     ["Birinchi kunlar", "Shish, ko'karish va yengil noqulaylik bo'lishi mumkin. Dam olish va shifokor ko'rsatmalariga amal qilish muhim."],
     ["1–2 hafta", "Ko'pchilik ish yoki o'qishga qaytadi. Odatda tungi bog'lam yoki bosh tasmasi tavsiya etiladi."],
     ["6–8 hafta", "To'liq tiklanish yaqinlashadi; quloqqa bosim tushuvchi faol sport cheklanadi."],
     ["Bir necha oy", "Shish to'liq yo'qolib, yakuniy natija o'z shaklini oladi."]],
    [["Operatsiya kuni", "Qovoqlar sohasida jarrohlik, odatda bir kunlik tartibda. Ko'z atrofi sovuq kompres bilan parvarishlanadi."],
     ["Birinchi kunlar", "Shish, ko'karish, qovoq tarangligi va ko'rishning vaqtincha xiralashishi bo'lishi mumkin."],
     ["10–14 kun", "Ko'pchilik kundalik ishga qaytadi; ko'zni ishqalamaslik va og'ir jismoniy yuklamadan saqlanish kerak."],
     ["Bir necha hafta", "Shish asta-sekin pasayadi, tikuv izlari yumshaydi."],
     ["Bir necha oy", "Natija yakuniy ko'rinishini oladi."]]
  ];
  const tl = $('#tl');
  const render = k => {
    tl.innerHTML = R[k].map(([t, d], i) => `<li style="--i:${i}"><b>${t}</b><p>${d}</p></li>`).join('');
  };
  render(0);
  $$('#rtabs button').forEach(b => b.addEventListener('click', () => {
    $$('#rtabs button').forEach(x => x.classList.toggle('on', x === b));
    render(+b.dataset.k);
  }));

  /* form → telegram */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = f.get('name').trim(), phone = f.get('phone').trim();
    const okPhone = phone.replace(/\D/g, '').length >= 9;
    form.name.classList.toggle('bad', !name);
    form.phone.classList.toggle('bad', !okPhone);
    if (!name || !okPhone) { note.style.color = '#d9483b'; note.textContent = "Iltimos, ism va telefon raqamini to'g'ri kiriting."; return; }
    const msg = `Assalomu alaykum, Dr. Xushvaqtov! Bepul konsultatsiyaga yozilmoqchiman.\nIsm: ${name}\nTelefon: ${phone}\nYo'nalish: ${f.get('svc')}`;
    note.style.color = ''; note.textContent = 'Telegram ochilmoqda…';
    open('https://t.me/dr_xushvaqtov1?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  $('#yr').textContent = new Date().getFullYear();
})();
