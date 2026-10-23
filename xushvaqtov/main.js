(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* splash */
  const splash = $('#splash'), bar = $('#spBar');
  let p = 0, started = false;
  const tick = () => { p = Math.min(100, p + 12 + Math.random() * 16); bar.style.width = p + '%'; p < 100 ? setTimeout(tick, 70) : setTimeout(start, 200); };
  function start() { if (started) return; started = true; splash.classList.add('done'); setTimeout(() => splash.remove(), 900); }
  tick(); setTimeout(start, 2200);

  /* data */
  const PROC = [
    { t: 'Otoplastika', tag: 'Quloq shakli', img: 'img/ears.jpg', sub: "Quloq shaklini tabiiy va estetik ko'rinishga keltirish",
      p: "Turtib chiqqan yoki shakli nomutanosib quloqlarni tuzatadigan jarrohlik. Maqsad: quloq qorinishini tabiiy va simmetrik qilish hamda yuz bilan uyg'un ko'rinish yaratish.",
      list: ["Minimal invaziv jarrohlik", "Qisqa tiklanish davri", "Og'riq deyarli bo'lmaydi", "Doimiy estetik natija", "Psixologik holatni yaxshilash"],
      facts: [["Bola va kattalar", "uchun mumkin"], ["1 kunlik", "jarrohlik amaliyoti"]] },
    { t: 'Blefaroplastika', tag: "Ko'z atrofi", img: 'img/eye.jpg', sub: "Ko'z atrofini yoshartirish, charchoq va ortiqcha teridan xalos bo'lish",
      p: "Qovoqlardagi ortiqcha teri va \"qop\"larni olib tashlaydigan, ko'z atrofiga yangi va dam olgan ko'rinish beradigan jarrohlik.",
      list: ["Charchoq belgilari kamayadi", "Tabiiy va xavfsiz natija", "Qayta tiklanish davri qisqa", "Tabiiy va jozibali ko'rinish"],
      facts: [["Yuqori / pastki", "qovoqlar uchun"], ["Individual", "reja asosida"]] },
    { t: "Yuz-jag' jarrohligi", tag: 'Konsultatsiya', img: 'img/face.jpg', sub: "Yuz va jag' sohasi bo'yicha jarrohlik konsultatsiyasi",
      p: "Dr. Xushvaqtov plastik jarroh va yuz-jag' jarrohi sifatida ishlaydi. Yuz-jag' sohasidagi muammo bo'yicha ko'rik va maslahat uchun yozilishingiz mumkin.",
      list: ["Ko'rik va ochiq suhbat", "Holatingizga mos reja", "Operatsiyadan keyingi nazorat"],
      facts: [["Bepul", "dastlabki suhbat"], ["Individual", "yondashuv"]] }
  ];
  const STORY = {
    otoplastika: ['Otoplastika', 'img/ears.jpg', "Turtib chiqqan quloqlarni tabiiy shaklga keltirish. Minimal invaziv, qisqa tiklanish davri va doimiy natija.", ["Bola va kattalar uchun", "Qisqa tiklanish davri", "Tabiiy va simmetrik natija"], 'Otoplastika'],
    blefaro: ['Blefaroplastika', 'img/eye.jpg', "Qovoqlardagi ortiqcha teri va charchoq belgilarini kamaytirish. Tabiiy va xavfsiz natija maqsad qilinadi.", ["Charchoq belgilari kamayadi", "Tabiiy ko'rinish", "Qisqa tiklanish davri"], 'Blefaroplastika'],
    yuz: ["Yuz-jag' jarrohligi", 'img/face.jpg', "Yuz va jag' sohasi bo'yicha ko'rik, maslahat va individual reja.", ["Ochiq suhbat", "Individual reja", "Nazorat"], "Yuz-jag' jarrohligi"],
    tiklanish: ['Tiklanish', 'img/care.jpg', "Operatsiyadan keyin nima kutilishi muolajaga bog'liq. \"Reja\" bo'limida otoplastika va blefaroplastika uchun umumiy xarita bor.", ["Birinchi kunlar: shish va ko'karish", "1–2 hafta: ko'pchilik ishga qaytadi", "Yakuniy natija: bir necha oy"], 'Konsultatsiya'],
    xavfsiz: ['Xavfsizlik va shaffoflik', 'img/or-lights.jpg', "Har bir jarrohlikda xavf bo'lishi mumkin. Shuning uchun qaror ko'rik va ochiq suhbatdan keyin qabul qilinadi, hech qanday va'dasiz.", ["Ko'rikdan oldin va'da yo'q", "Xavf va imkoniyatlar tushuntiriladi", "Natija individual"], 'Konsultatsiya'],
    savol: ['Savol-javob', 'img/scan-consult.jpg', "Savollaringiz bo'lsa, bepul konsultatsiyada shifokordan to'g'ridan-to'g'ri so'rang yoki \"Reja\" bo'limidagi savol-javobni ko'ring.", ["Telefon: +998 90 002 50 06", "Telegram: @dr_xushvaqtov1", "Instagram: @doctor_xushvaqtov"], 'Konsultatsiya']
  };
  const REC = [
    [["Operatsiya kuni", "Muolaja odatda bir kunlik tartibda o'tkaziladi; bosh bog'lamda bo'ladi."],
     ["Birinchi kunlar", "Shish, ko'karish va yengil noqulaylik bo'lishi mumkin. Dam olish va shifokor ko'rsatmalariga amal qilish muhim."],
     ["1–2 hafta", "Ko'pchilik ish yoki o'qishga qaytadi. Odatda tungi bog'lam yoki bosh tasmasi tavsiya etiladi."],
     ["6–8 hafta", "To'liq tiklanish yaqinlashadi; quloqqa bosim tushuvchi faol sport cheklanadi."],
     ["Bir necha oy", "Shish to'liq yo'qolib, yakuniy natija o'z shaklini oladi."]],
    [["Operatsiya kuni", "Qovoqlar sohasida jarrohlik, odatda bir kunlik tartibda. Ko'z atrofi sovuq kompres bilan parvarishlanadi."],
     ["Birinchi kunlar", "Shish, ko'karish, qovoq tarangligi va ko'rishning vaqtincha xiralashishi bo'lishi mumkin."],
     ["10–14 kun", "Ko'pchilik kundalik ishga qaytadi; ko'zni ishqalamaslik va og'ir yuklamadan saqlanish kerak."],
     ["Bir necha hafta", "Shish asta-sekin pasayadi, tikuv izlari yumshaydi."],
     ["Bir necha oy", "Natija yakuniy ko'rinishini oladi."]]
  ];

  /* router */
  const VIEWS = ['home', 'proc', 'plan', 'doctor', 'contact'];
  const tabs = $$('#tabs a'), pill = $('#pill');
  let current = null;
  function show(v) {
    if (!VIEWS.includes(v)) v = 'home';
    if (v === current) return; current = v;
    $$('.view').forEach(el => el.classList.toggle('on', el.dataset.v === v));
    tabs.forEach(a => a.classList.toggle('on', a.dataset.v === v));
    pill.style.setProperty('--i', VIEWS.indexOf(v));
    const el = $('#v-' + v);
    [...el.children].forEach((c, i) => c.style.setProperty('--n', Math.min(i, 8)));
    scrollTo(0, 0);
    $$('[data-count]', el).forEach(count);
    if (v === 'plan') renderRec(recK);
    document.title = (v === 'home' ? '' : $('#v-' + v + ' .page-t')?.textContent + ' · ') + 'Dr. Anvar Xushvaqtov — Plastik jarroh';
  }
  const route = () => show((location.hash.replace('#/', '') || 'home').split('?')[0]);
  addEventListener('hashchange', route);
  route(); if (!current) show('home');

  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 1400;
    const fmt = v => sep ? v.toLocaleString('ru-RU').replace(/ /g, ' ') : v;
    const f = t => { const k = Math.min(1, (t - t0) / d); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  /* procedures */
  const seg = $('#seg'), segBtns = $$('button', seg), pd = $('#pd');
  function setProc(k) {
    const d = PROC[k];
    segBtns.forEach((b, i) => b.classList.toggle('on', i === k));
    seg.style.setProperty('--i', k);
    $('#pdImg').src = d.img; $('#pdImg').alt = d.t; $('#pdTag').textContent = d.tag;
    $('#pdT').textContent = d.t; $('#pdSub').textContent = d.sub; $('#pdP').textContent = d.p;
    $('#pdList').innerHTML = d.list.map((x, i) => `<li style="--n:${i}">${x}</li>`).join('');
    $('#pdFacts').innerHTML = d.facts.map(f => `<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('');
    $('#pdBtn').dataset.svc = d.t;
    pd.classList.remove('swap'); pd.style.animation = 'none'; void pd.offsetWidth; pd.style.animation = '';
  }
  segBtns.forEach((b, i) => b.addEventListener('click', () => setProc(i)));
  setProc(0);
  $$('[data-go]').forEach(a => a.addEventListener('click', () => setProc(+a.dataset.go)));
  $$('#pdBtn').forEach(b => b.addEventListener('click', () => { sel.value = b.dataset.svc; }));

  /* recovery */
  let recK = 0;
  const rseg = $('#rseg'), rb = $$('button', rseg);
  function renderRec(k) {
    recK = k; rb.forEach((b, i) => b.classList.toggle('on', i === k)); rseg.style.setProperty('--i', k);
    $('#tl').innerHTML = REC[k].map(([t, d], i) => `<li style="--i:${i}"><b>${t}</b><p>${d}</p></li>`).join('');
  }
  rb.forEach((b, i) => b.addEventListener('click', () => renderRec(i)));
  renderRec(0);

  /* checklist */
  const boxes = $$('#todo input');
  const saved = (() => { try { return JSON.parse(localStorage.getItem('dx-todo') || '[]'); } catch (e) { return []; } })();
  const upd = () => {
    const n = boxes.filter(b => b.checked).length;
    $('#meter').style.width = (n / boxes.length * 100) + '%';
    $('#meterT').textContent = n === boxes.length ? "Hammasi tayyor. Konsultatsiyaga yozilishingiz mumkin!" : `${n} / ${boxes.length} tayyor`;
    try { localStorage.setItem('dx-todo', JSON.stringify(boxes.map(b => b.checked))); } catch (e) {}
  };
  boxes.forEach((b, i) => { b.checked = !!saved[i]; b.addEventListener('change', upd); });
  upd();

  /* sheet */
  const sheet = $('#sheet'), sel = $('#svcSel');
  const open = k => {
    const [t, img, d, list, svc] = STORY[k];
    $('#shT').textContent = t; $('#shImg').src = img; $('#shP').textContent = d;
    $('#shL').innerHTML = list.map((x, i) => `<li style="--n:${i}">${x}</li>`).join('');
    $('#shBtn').dataset.svc = svc;
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
  };
  const close = () => { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); };
  $$('#stories button').forEach(b => b.addEventListener('click', () => open(b.dataset.s)));
  $('#shBg').onclick = close; $('#shX').onclick = close;
  $('#shBtn').addEventListener('click', e => { sel.value = e.currentTarget.dataset.svc; close(); });
  addEventListener('keydown', e => e.key === 'Escape' && close());

  /* form → telegram */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = f.get('name').trim(), phone = f.get('phone').trim();
    const okPhone = phone.replace(/\D/g, '').length >= 9;
    form.name.classList.toggle('bad', !name); form.phone.classList.toggle('bad', !okPhone);
    if (!name || !okPhone) { note.style.color = '#d9483b'; note.textContent = "Iltimos, ism va telefon raqamini to'g'ri kiriting."; return; }
    const msg = `Assalomu alaykum, Dr. Xushvaqtov! Bepul konsultatsiyaga yozilmoqchiman.\nIsm: ${name}\nTelefon: ${phone}\nYo'nalish: ${f.get('svc')}`;
    note.style.color = ''; note.textContent = 'Telegram ochilmoqda…';
    window.open('https://t.me/dr_xushvaqtov1?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();
