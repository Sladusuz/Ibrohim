(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* splash */
  const splash = $('#splash'), bar = $('#spBar');
  let p = 0, started = false;
  const tick = () => { p = Math.min(100, p + 14 + Math.random() * 16); bar.style.width = p + '%'; p < 100 ? setTimeout(tick, 70) : setTimeout(start, 200); };
  function start() { if (started) return; started = true; splash.classList.add('done'); setTimeout(() => splash.remove(), 1000); observe(); }
  tick(); setTimeout(start, 2200);

  /* real works (from the doctor's own Instagram posts) */
  const R = 'img/real/';
  const REELTXT = "Shifokorning Instagram reels'idan kadr. Operatsiya jarayoni va natijalar shu tarzda namoyish etiladi.";
  const WORKS = [
    { src: R + 'poster-otoplastika.jpg', t: "Otoplastika — plakat", cat: ['poster', 'quloq'], svc: 'Otoplastika', d: "Quloq shaklini tabiiy va estetik ko'rinishda tiklash: tabiiy va chiroyli natija, izsiz zamonaviy usul, 1 kunlik jarrohlik amaliyoti, qisqa reabilitatsiya, individual yondashuv." },
    { src: R + 'poster-quloq-info.jpg', t: "Otoplastika: maqsad va afzalliklar", cat: ['poster', 'quloq'], svc: 'Otoplastika', d: "Quloqlarning tashqariga chiqib turishini kamaytirish va shaklini estetik jihatdan yaxshilash. Minimal invaziv jarrohlik, qisqa tiklanish davri, doimiy natija." },
    { src: R + 't5.jpg', t: "Blefaroplastika — ko'z atrofini yoshartirish", cat: ['poster', 'koz'], svc: 'Blefaroplastika', reel: 1, d: "Charchoq belgilari kamayadi, tabiiy va xavfsiz natija, qayta tiklanish davri qisqa, tabiiy va jozibali ko'rinish." },
    { src: R + 't2.jpg', t: "Quloq: yaqin plan", cat: ['quloq'], svc: 'Otoplastika', reel: 1, d: REELTXT },
    { src: R + 't6.jpg', t: "Quloq — OLDIN (BEFORE)", cat: ['quloq'], svc: 'Otoplastika', reel: 1, d: REELTXT },
    { src: R + 't3.jpg', t: "Ptoz: tushgan qovoq", cat: ['koz'], svc: 'Ptoz operatsiyasi', reel: 1, d: "Qovoq tushib qolishi (ptoz) holati: ko'z ochilishi yaxshilanishi va nigohning ochiqroq bo'lishi maqsad qilinadi. " + REELTXT },
    { src: R + 't4.jpg', t: "Operatsiya xonasidan: ko'z atrofi", cat: ['koz', 'jarayon'], svc: 'Blefaroplastika', reel: 1, d: REELTXT },
    { src: R + 't1.jpg', t: "Operatsiya jarayoni", cat: ['jarayon'], svc: 'Konsultatsiya', reel: 1, d: REELTXT },
    { src: R + 't7.jpg', t: "Operatsiya jarayoni", cat: ['jarayon'], svc: 'Konsultatsiya', reel: 1, d: REELTXT },
    { src: R + 't8.jpg', t: "Natija (AFTER)", cat: ['jarayon'], svc: 'Konsultatsiya', reel: 1, d: REELTXT },
    { src: R + 't9.jpg', t: "Operatsiya jarayoni", cat: ['jarayon'], svc: 'Konsultatsiya', reel: 1, d: REELTXT }
  ];

  /* procedures (umumiy ma'lumot; aniq tavsiyani shifokor beradi) */
  const PROC = [
    { t: 'Blefaroplastika', tag: "Ko'z qovoqlari", img: R + 't5.jpg', icon: 'i-eye', works: [2, 6], sub: "Ko'z atrofini yoshartirish, charchoq va ortiqcha teridan xalos bo'lish",
      p: "Qovoqlardagi ortiqcha teri va yog' to'qimasini olib tashlab, nigohni ochiq va tabiiy qiladigan jarrohlik. Maqsad: yuz ifodasini saqlagan holda ko'z atrofiga dam olgan ko'rinish berish.",
      list: ["Charchoq belgilari kamayadi", "Tabiiy va xavfsiz natija", "Qayta tiklanish davri qisqa", "Tabiiy va jozibali ko'rinish"],
      how: ["Ko'rik, qovoqlar holati va maqsadni baholash", "Mahalliy og'riqsizlantirish (ba'zan sedatsiya bilan)", "Yuqori yoki pastki qovoqdagi ortiqcha teri va yog' olinadi", "Yupqa choklar; ular odatda bir necha kundan keyin olinadi"],
      who: ["Qovoqlarda ortiqcha teri bor", "Ko'z atrofida \"qopchalar\" va charchoq ko'rinishi", "Osilgan qovoq ko'rishga xalaqit beradi"],
      facts: [["Yuqori / pastki", "qovoqlar uchun"], ["1–2 hafta", "dastlabki tiklanish*"]] },
    { t: 'Ptoz operatsiyasi', tag: 'Tushgan qovoq', img: R + 't3.jpg', icon: 'i-eye', works: [5, 6], sub: "Yuqori qovoq tushib qolishini to'g'rilash, nigohni hushyor qilish",
      p: "Ptoz — yuqori qovoqning tushib qolishi. Operatsiya ko'z ochilishini yaxshilaydi va qarashni ochiqroq, hushyorroq qiladi. Bu funksiya ham, ko'rinish ham uchun muhim bo'lishi mumkin.",
      list: ["Ko'z ochilishi yaxshilanadi", "Nigoh yanada ochiq va hushyor", "Funksiya va ko'rinish birga tiklanadi"],
      how: ["Ptoz darajasi va qovoq mushagi kuchi baholanadi", "Usul holatga qarab tanlanadi", "Qovoq kerakli balandlikda mustahkamlanadi", "Dastlabki kunlarda shish va ko'karish normal; natija to'qima tiklangach ko'rinadi"],
      who: ["Bir yoki ikkala qovoq tushib turadi", "Ko'z to'liq ochilmaydi", "Tug'ma yoki yoshga bog'liq ptoz"],
      facts: [["Bir necha hafta", "shish pasayishi*"], ["Individual", "usul tanlanadi"]] },
    { t: 'Otoplastika', tag: 'Quloq shakli', img: R + 'poster-otoplastika.jpg', icon: 'i-ear', works: [0, 1, 3, 4], sub: "Quloq shaklini tabiiy va estetik ko'rinishga keltirish",
      p: "Turtib chiqqan yoki shakli nomutanosib quloqlarni tuzatadigan jarrohlik. Maqsad: quloq qorinishini tabiiy va simmetrik qilish hamda yuz bilan uyg'un ko'rinish yaratish.",
      list: ["Minimal invaziv jarrohlik", "Qisqa tiklanish davri", "Og'riq deyarli bo'lmaydi", "Doimiy estetik natija", "Psixologik holatni yaxshilash"],
      how: ["Quloq shakli va simmetriyasi baholanadi", "Odatda quloq orqasida kichik kesma qilinadi", "Tog'ay shakllantirilib, chok bilan yangi holatda mustahkamlanadi", "Dastlabki hafta bosh bog'lam yoki tasma tavsiya etiladi"],
      who: ["Turtib chiqqan quloqlar", "Shakli nomutanosib quloqlar", "Bolalar (quloq shakllangach) va kattalar"],
      facts: [["Bola va kattalar", "uchun mumkin"], ["1 kunlik", "jarrohlik amaliyoti"]] },
    { t: 'Rinoplastika', tag: 'Burun shakli', img: null, icon: 'i-nose', works: [], sub: "Burun shakli va nafas funksiyasini yaxshilash",
      p: "Burun shaklini yuz bilan uyg'unlashtiradigan, kerak bo'lsa nafasni ham yengillashtiradigan jarrohlik. Reja yuz tuzilmasi va sizning maqsadingizga qarab individual tuziladi.",
      list: ["Yuz bilan uyg'un shakl", "Nafas funksiyasini yaxshilash imkoni", "Individual reja"],
      how: ["Maqsad va yuz uyg'unligi baholanadi", "Ochiq yoki yopiq usul bilan burun suyagi va tog'ayi shakllantiriladi", "Burunga bog'lam yoki shina qo'yiladi", "Shish asta-sekin, bir necha oy ichida pasayadi"],
      who: ["Burun shakli yoqmaydi", "Burun to'sig'i egriligi tufayli nafas qiyin", "Jarohatdan keyingi deformatsiya"],
      facts: [["Bir yilgacha", "yakuniy shakllanish*"], ["Individual", "usul tanlanadi"]] },
    { t: 'SMAS lifting', tag: 'Yuz tarangligi', img: null, icon: 'i-lift', works: [], sub: "Yuz konturini chuqur qatlamda tortib mustahkamlash",
      p: "SMAS — teri ostidagi mushak-fastsiya qatlami. Lifting shu qatlamni ko'tarib mustahkamlaydi, shuning uchun natija faqat terini tortishga qaraganda tabiiyroq va barqarorroq bo'lishi mumkin.",
      list: ["Yuz konturi tarang bo'ladi", "Natija tabiiy ko'rinishda", "Chuqur qatlam bilan ishlash"],
      how: ["Yuz tuzilmasi va teri holati baholanadi", "Quloq oldi va soch chizig'i bo'ylab yashirin kesma", "SMAS qatlami ko'tarilib mustahkamlanadi", "Ortiqcha teri olinib, chok qo'yiladi"],
      who: ["Yonoq va jag' chizig'i tushgan", "Yuz konturi bo'shashgan", "Yengil usullar yetarli bo'lmaganda"],
      facts: [["2–3 hafta", "ijtimoiy tiklanish*"], ["Individual", "reja asosida"]] },
    { t: 'Face lift', tag: 'Yuz yoshartirish', img: null, icon: 'i-face', works: [], sub: "Yuz va bo'yindagi bo'shashgan to'qimalarni tortish",
      p: "Face lift — yuz va bo'yindagi bo'shashgan to'qima va ortiqcha terini tortib, yoshroq va yangiroq ko'rinish beradigan kompleks jarrohlik. Hajm va usul sizning holatingizga qarab belgilanadi.",
      list: ["Yuz va bo'yin konturi tiklanadi", "Yoshroq va yangi ko'rinish", "Individual usul tanlanadi"],
      how: ["Ko'rik, fotosuratlar va maqsadni muhokama qilish", "Kesmalar odatda quloq atrofi va soch chizig'ida", "To'qimalar tortilib mustahkamlanadi, ortiqcha teri olinadi", "Dastlabki hafta tinch rejim va bog'lam"],
      who: ["Bo'yin va jag' chizig'ida bo'shashish", "Chuqur burmalar", "Kompleks yoshartirish kerak bo'lganda"],
      facts: [["2–3 hafta", "ijtimoiy tiklanish*"], ["Bir necha oy", "yakuniy natija"]] },
    { t: 'Rekonstruktiv jarrohlik', tag: 'Tiklovchi', img: null, icon: 'i-heal', works: [], sub: "Jarohat, chandiq yoki nuqsondan keyin shakl va vazifani tiklash",
      p: "Jarohat, kuyish, o'sma olib tashlanishi yoki tug'ma nuqsondan keyin to'qimalarning shakli va vazifasini tiklaydigan jarrohlik. Ko'pincha bosqichma-bosqich rejalashtiriladi.",
      list: ["Shakl va funksiyani tiklash", "Bosqichli individual reja", "Tiklanish davrida nazorat"],
      how: ["Nuqson va funksiya baholanadi", "Bir yoki bir necha bosqichli reja tuziladi", "Mahalliy to'qimalar yoki ko'chirish usullari qo'llanishi mumkin", "Tiklanish va reabilitatsiya nazorati"],
      who: ["Jarohatdan keyingi nuqson", "Chandiq va deformatsiyalar", "Tug'ma nuqsonlar"],
      facts: [["Bosqichli", "davolash rejasi"], ["Individual", "yondashuv"]] }
  ];
  const REC = [
    ['Otoplastika', [["Operatsiya kuni", "Odatda bir kunlik tartibda; bosh bog'lam qo'yiladi."],
     ["Birinchi kunlar", "Shish, ko'karish va yengil noqulaylik bo'lishi mumkin. Dam olish muhim."],
     ["1–2 hafta", "Ko'pchilik ish yoki o'qishga qaytadi. Odatda tungi tasma tavsiya etiladi."],
     ["6–8 hafta", "To'liq tiklanish yaqinlashadi; quloqqa bosim tushuvchi sport cheklanadi."],
     ["Bir necha oy", "Shish yo'qolib, yakuniy natija o'z shaklini oladi."]]],
    ["Blefaroplastika / ptoz", [["Operatsiya kuni", "Qovoqlar sohasida jarrohlik, odatda bir kunlik tartibda; sovuq kompres."],
     ["Birinchi kunlar", "Shish, ko'karish, tarangligi va ko'rishning vaqtincha xiralashishi bo'lishi mumkin."],
     ["10–14 kun", "Ko'pchilik kundalik ishga qaytadi; ko'zni ishqalamaslik kerak."],
     ["Bir necha hafta", "Shish asta-sekin pasayadi, chok izlari yumshaydi."],
     ["Bir necha oy", "Natija yakuniy ko'rinishini oladi (ptozda ko'z ochilishi to'liq barqarorlashadi)."]]],
    ['Rinoplastika', [["Operatsiya kuni", "Burunda bog'lam yoki shina; shish bo'ladi."],
     ["Birinchi hafta", "Ko'karish va shish eng kuchli; shina odatda taxminan 1 haftada olinadi."],
     ["2–4 hafta", "Ko'pchilik kundalik hayotga qaytadi; jismoniy yuk cheklanadi."],
     ["Bir necha oy", "Shish asta-sekin pasayadi."],
     ["Bir yilgacha", "Yakuniy shakl to'liq shakllanishi mumkin."]]],
    ['SMAS / Face lift', [["Operatsiya kuni", "Bosh va yuz bog'lamda; ba'zan drenaj qo'yilishi mumkin."],
     ["Birinchi hafta", "Shish va ko'karish; tinch rejim, bosh ko'tarilgan holda dam olish."],
     ["2–3 hafta", "Ko'pchilik ishga qaytadi; choklar olingach faollik oshadi."],
     ["Bir necha oy", "Shish to'liq pasayadi, natija yakuniy ko'rinadi."]]]
  ];



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
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 1500;
    const fmt = v => sep ? v.toLocaleString('ru-RU').replace(/ /g, ' ') : v;
    const f = t => { const k = Math.min(1, (t - t0) / d); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  /* header */
  const hdr = $('#hdr'), menu = $('#menu'), burger = $('#burger'), dock = $('#dock');
  let lastY = 0, queued = false;
  const prog = $('#progress');
  const onScroll = () => {
    queued = false; const y = scrollY;
    const H = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${H > 0 ? y / H : 0})`;
    hdr.classList.toggle('shadow', y > 10);
    hdr.classList.toggle('hide', y > lastY && y > 500 && !menu.classList.contains('open'));
    lastY = y;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  const toggle = o => {
    burger.setAttribute('aria-expanded', o); menu.classList.toggle('open', o);
    document.body.style.overflow = o ? 'hidden' : ''; hdr.classList.remove('hide');
  };
  burger.onclick = () => toggle(burger.getAttribute('aria-expanded') !== 'true');
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));
  // scrollspy
  const links = $$('.mi'), secs = ['home', 'proc', 'works', 'doctor', 'recovery', 'faq', 'contact'];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(id => { const el = document.getElementById(id); el && spy.observe(el); });
  new IntersectionObserver(([e]) => dock.classList.toggle('hide', e.isIntersecting), { threshold: .15 }).observe($('#contact'));

  /* lightbox */
  const lb = $('#lb'); let lbi = 0; const sel = $('#svcSel');
  const REELB = '<span class="reel"><svg viewBox="0 0 24 24"><use href="#i-play"/></svg>REEL</span>';
  function openLb(i) {
    lbi = (i + WORKS.length) % WORKS.length; const w = WORKS[lbi];
    $('#lbImg').src = w.src; $('.lb-img').style.setProperty('--bgimg', `url(${w.src})`); $('#lbImg').alt = w.t; $('#lbT').textContent = w.t; $('#lbD').textContent = w.d;
    $('#lbTag').textContent = w.reel ? 'Instagram reels' : 'Instagram plakat';
    $('#lbBtn').dataset.svc = w.svc;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
  }
  const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
  $('#lbBg').onclick = closeLb; $('#lbX').onclick = closeLb;
  $('#lbPrev').onclick = () => openLb(lbi - 1); $('#lbNext').onclick = () => openLb(lbi + 1);
  $('#lbBtn').addEventListener('click', e => { sel.value = e.currentTarget.dataset.svc; closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); if (lb.classList.contains('open')) { if (e.key === 'ArrowRight') openLb(lbi + 1); if (e.key === 'ArrowLeft') openLb(lbi - 1); } });
  $$('.float').forEach(b => b.addEventListener('click', () => openLb(+b.dataset.w)));

  /* reel strip + posters */
  const stHTML = WORKS.map((w, i) => `<button class="st" data-i="${i}"><img src="${w.src}" alt="${w.t}" loading="lazy">${w.reel ? REELB : ''}</button>`).join('');
  $('#strip').innerHTML = stHTML + stHTML;
  $$('#strip .st').forEach(b => b.addEventListener('click', () => openLb(+b.dataset.i)));
  $('#posters').innerHTML = [0, 1, 2].map(i => `<button class="po" data-i="${i}"><img src="${WORKS[i].src}" alt="${WORKS[i].t}" loading="lazy"><span>${WORKS[i].t}</span></button>`).join('');
  $$('#posters .po').forEach(b => b.addEventListener('click', () => openLb(+b.dataset.i)));

  /* works */
  const grid = $('#wgrid');
  function renderWorks(f) {
    const list = WORKS.map((w, i) => [w, i]).filter(([w]) => f === 'all' || w.cat.includes(f));
    grid.innerHTML = list.map(([w, i], n) => `<button class="wc" style="--n:${n}" data-i="${i}"><img src="${w.src}" alt="${w.t}" loading="lazy">${w.reel ? REELB : ''}<span class="lab">${w.t}</span></button>`).join('');
    $$('.wc', grid).forEach(b => b.addEventListener('click', () => openLb(+b.dataset.i)));
  }
  renderWorks('all');
  $$('#wf button').forEach(b => b.addEventListener('click', () => { $$('#wf button').forEach(x => x.classList.toggle('on', x === b)); renderWorks(b.dataset.f); }));

  /* procedures: cards + detail */
  const cards = $('#cards'), pd = $('#pd');
  cards.innerHTML = PROC.map((d, i) => `<button class="pc pop" data-k="${i}">${d.img ? `<img src="${d.img}" alt="${d.t}" loading="lazy">` : `<div class="brand"><svg class="ic"><use href="#${d.icon}"/></svg></div>`}<span class="go"><svg class="ic" style="width:20px;height:20px"><use href="#i-arrow"/></svg></span><span class="tx"><span class="no">0${i + 1}</span><b>${d.t}</b><span class="s">${d.tag}</span></span></button>`).join('');
  const pcs = $$('.pc', cards);
  function setProc(k, scroll) {
    const d = PROC[k];
    pcs.forEach((b, i) => b.classList.toggle('on', i === k));
    $('#pdMedia').classList.toggle('contain', !!(d.img && d.img.includes('poster')));
    $('#pdMedia').innerHTML = d.img ? `<img src="${d.img}" alt="${d.t}">` : `<div class="brandart"><svg class="ic"><use href="#${d.icon}"/></svg><span class="script">Doctor Xushvaqtov</span><b>${d.t}</b></div>`;
    $('#pdTag').textContent = d.tag; $('#pdT').textContent = d.t; $('#pdSub').textContent = d.sub; $('#pdP').textContent = d.p;
    const li = arr => arr.map((x, i) => `<li style="--n:${i}">${x}</li>`).join('');
    $('#pdList').innerHTML = li(d.list); $('#pdHow').innerHTML = li(d.how); $('#pdFor').innerHTML = li(d.who);
    $('#pdFacts').innerHTML = d.facts.map(f => `<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('');
    $('#pdWorksWrap').style.display = d.works.length ? '' : 'none';
    $('#pdWorks').innerHTML = d.works.map(i => `<button data-i="${i}"><img src="${WORKS[i].src}" alt="${WORKS[i].t}"></button>`).join('');
    $$('#pdWorks button').forEach(b => b.addEventListener('click', () => openLb(+b.dataset.i)));
    $('#pdBtn').dataset.svc = d.t;
    pd.style.animation = 'none'; void pd.offsetWidth; pd.style.animation = '';
    if (scroll) pd.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  pcs.forEach((b, i) => b.addEventListener('click', () => setProc(i, true)));
  setProc(0, false);
  $('#pdBtn').addEventListener('click', e => { sel.value = e.currentTarget.dataset.svc; });
  // pop-in for cards
  pcs.forEach((b, i) => { b.classList.add('rv'); b.style.setProperty('--d', (i % 4) * .08 + 's'); });

  /* recovery */
  const rseg = $('#rseg');
  rseg.innerHTML = REC.map((r, i) => `<button data-k="${i}">${r[0]}</button>`).join('');
  const rb = $$('button', rseg);
  function renderRec(k) {
    rb.forEach((b, i) => b.classList.toggle('on', i === k));
    $('#tl').innerHTML = REC[k][1].map(([t, d], i) => `<li style="--i:${i}"><b>${t}</b><p>${d}</p></li>`).join('');
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
  $('#yr').textContent = new Date().getFullYear();
})();
