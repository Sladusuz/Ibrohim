(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* splash */
  const splash = $('#splash'), bar = $('#spBar');
  let p = 0, started = false;
  const tick = () => { p = Math.min(100, p + 12 + Math.random() * 16); bar.style.width = p + '%'; p < 100 ? setTimeout(tick, 70) : setTimeout(start, 200); };
  function start() { if (started) return; started = true; splash.classList.add('done'); setTimeout(() => splash.remove(), 900); }
  tick(); setTimeout(start, 2200);

  /* data (umumiy ma'lumot; aniq tavsiyani shifokor beradi) */
  const PROC = [
    { t: 'Blefaroplastika', tag: "Ko'z qovoqlari", img: 'img/eye.jpg', sub: "Ko'z atrofini yoshartirish, charchoq va ortiqcha teridan xalos bo'lish",
      p: "Qovoqlardagi ortiqcha teri va yog' to'qimasini olib tashlab, nigohni ochiq va tabiiy qiladigan jarrohlik. Maqsad: yuz ifodasini saqlagan holda ko'z atrofiga dam olgan ko'rinish berish.",
      list: ["Charchoq belgilari kamayadi", "Tabiiy va xavfsiz natija", "Qayta tiklanish davri qisqa", "Tabiiy va jozibali ko'rinish"],
      how: ["Ko'rik, qovoqlar holati va maqsadni baholash", "Mahalliy og'riqsizlantirish (ba'zan sedatsiya bilan)", "Yuqori yoki pastki qovoqdagi ortiqcha teri va yog' olinadi", "Yupqa choklar; ular odatda bir necha kundan keyin olinadi"],
      who: ["Qovoqlarda ortiqcha teri bor", "Ko'z atrofida \"qopchalar\" va charchoq ko'rinishi", "Osilgan qovoq ko'rishga xalaqit beradi"],
      facts: [["Yuqori / pastki", "qovoqlar uchun"], ["1–2 hafta", "dastlabki tiklanish*"]] },
    { t: 'Ptoz operatsiyasi', tag: 'Tushgan qovoq', img: 'img/eye2.jpg', sub: "Yuqori qovoq tushib qolishini to'g'rilash, nigohni hushyor qilish",
      p: "Ptoz — yuqori qovoqning tushib qolishi. Operatsiya ko'z ochilishini yaxshilaydi va qarashni ochiqroq, hushyorroq qiladi. Bu funksiya ham, ko'rinish ham uchun muhim bo'lishi mumkin.",
      list: ["Ko'z ochilishi yaxshilanadi", "Nigoh yanada ochiq va hushyor", "Funksiya va ko'rinish birga tiklanadi"],
      how: ["Ptoz darajasi va qovoq mushagi kuchi baholanadi", "Usul (masalan, mushakni qisqartirish yoki boshqa usul) holatga qarab tanlanadi", "Qovoq kerakli balandlikda mustahkamlanadi", "Dastlabki kunlarda shish va ko'karish normal; natija to'qima tiklangach ko'rinadi"],
      who: ["Bir yoki ikkala qovoq tushib turadi", "Ko'z to'liq ochilmaydi", "Tug'ma yoki yoshga bog'liq ptoz"],
      facts: [["Bir necha hafta", "shish pasayishi*"], ["Individual", "usul tanlanadi"]] },
    { t: 'Otoplastika', tag: 'Quloq shakli', img: 'img/ears.jpg', sub: "Quloq shaklini tabiiy va estetik ko'rinishga keltirish",
      p: "Turtib chiqqan yoki shakli nomutanosib quloqlarni tuzatadigan jarrohlik. Maqsad: quloq qorinishini tabiiy va simmetrik qilish hamda yuz bilan uyg'un ko'rinish yaratish.",
      list: ["Minimal invaziv jarrohlik", "Qisqa tiklanish davri", "Og'riq deyarli bo'lmaydi", "Doimiy estetik natija", "Psixologik holatni yaxshilash"],
      how: ["Quloq shakli va simmetriyasi baholanadi", "Odatda quloq orqasida kichik kesma qilinadi", "Tog'ay shakllantirilib, chok bilan yangi holatda mustahkamlanadi", "Dastlabki hafta bosh bog'lam yoki tasma tavsiya etiladi"],
      who: ["Turtib chiqqan quloqlar", "Shakli nomutanosib quloqlar", "Bolalar (quloq shakllangach) va kattalar"],
      facts: [["Bola va kattalar", "uchun mumkin"], ["1 kunlik", "jarrohlik amaliyoti"]] },
    { t: 'Rinoplastika', tag: 'Burun shakli', img: 'img/face.jpg', sub: "Burun shakli va nafas funksiyasini yaxshilash",
      p: "Burun shaklini yuz bilan uyg'unlashtiradigan, kerak bo'lsa nafasni ham yengillashtiradigan jarrohlik. Reja yuz tuzilmasi va sizning maqsadingizga qarab individual tuziladi.",
      list: ["Yuz bilan uyg'un shakl", "Nafas funksiyasini yaxshilash imkoni", "Individual reja"],
      how: ["Maqsad va yuz uyg'unligi baholanadi", "Ochiq yoki yopiq usul bilan burun suyagi va tog'ayi shakllantiriladi", "Burunga bog'lam yoki shina qo'yiladi", "Shish asta-sekin, bir necha oy ichida pasayadi"],
      who: ["Burun shakli yoqmaydi", "Burun to'sig'i egriligi tufayli nafas qiyin", "Jarohatdan keyingi deformatsiya"],
      facts: [["Bir yilgacha", "yakuniy shakllanish*"], ["Individual", "usul tanlanadi"]] },
    { t: 'SMAS lifting', tag: 'Yuz tarangligi', img: 'img/woman.jpg', sub: "Yuz konturini chuqur qatlamda tortib mustahkamlash",
      p: "SMAS — teri ostidagi mushak-fastsiya qatlami. Lifting shu qatlamni ko'tarib mustahkamlaydi, shuning uchun natija faqat terini tortishga qaraganda tabiiyroq va barqarorroq bo'lishi mumkin.",
      list: ["Yuz konturi tarang bo'ladi", "Natija tabiiy ko'rinishda", "Chuqur qatlam bilan ishlash"],
      how: ["Yuz tuzilmasi va teri holati baholanadi", "Quloq oldi va soch chizig'i bo'ylab yashirin kesma", "SMAS qatlami ko'tarilib mustahkamlanadi", "Ortiqcha teri olinib, chok qo'yiladi"],
      who: ["Yonoq va jag' chizig'i tushgan", "Yuz konturi bo'shashgan", "Yengil usullar yetarli bo'lmaganda"],
      facts: [["2–3 hafta", "ijtimoiy tiklanish*"], ["Individual", "reja asosida"]] },
    { t: 'Face lift', tag: 'Yuz yoshartirish', img: 'img/portrait-bw.jpg', sub: "Yuz va bo'yindagi bo'shashgan to'qimalarni tortish",
      p: "Face lift — yuz va bo'yindagi bo'shashgan to'qima va ortiqcha terini tortib, yoshroq va yangiroq ko'rinish beradigan kompleks jarrohlik. Hajm va usul sizning holatingizga qarab belgilanadi.",
      list: ["Yuz va bo'yin konturi tiklanadi", "Yoshroq va yangi ko'rinish", "Individual usul tanlanadi"],
      how: ["Ko'rik, fotosuratlar va maqsadni muhokama qilish", "Kesmalar odatda quloq atrofi va soch chizig'ida", "To'qimalar tortilib mustahkamlanadi, ortiqcha teri olinadi", "Dastlabki hafta tinch rejim va bog'lam"],
      who: ["Bo'yin va jag' chizig'ida bo'shashish", "Chuqur burmalar", "Kompleks yoshartirish kerak bo'lganda"],
      facts: [["2–3 hafta", "ijtimoiy tiklanish*"], ["Bir necha oy", "yakuniy natija"]] },
    { t: 'Rekonstruktiv jarrohlik', tag: 'Tiklovchi', img: 'img/surgery-blue.jpg', sub: "Jarohat, chandiq yoki nuqsondan keyin shakl va vazifani tiklash",
      p: "Jarohat, kuyish, o'sma olib tashlanishi yoki tug'ma nuqsondan keyin to'qimalarning shakli va vazifasini tiklaydigan jarrohlik. Ko'pincha bosqichma-bosqich rejalashtiriladi.",
      list: ["Shakl va funksiyani tiklash", "Bosqichli individual reja", "Tiklanish davrida nazorat"],
      how: ["Nuqson va funksiya baholanadi", "Bir yoki bir necha bosqichli reja tuziladi", "Mahalliy to'qimalar yoki ko'chirish usullari qo'llanishi mumkin", "Tiklanish va reabilitatsiya nazorati"],
      who: ["Jarohatdan keyingi nuqson", "Chandiq va deformatsiyalar", "Tug'ma nuqsonlar"],
      facts: [["Bosqichli", "davolash rejasi"], ["Individual", "yondashuv"]] }
  ];
  const mk = (i, extra) => { const d = PROC[i]; return [d.t, d.img, d.sub + '. ' + d.p, d.list, d.t, ...(extra || [])]; };
  const STORY = {
    blefaro: mk(0), ptoz: mk(1), otoplastika: mk(2), rino: mk(3), lift: mk(5), rekon: mk(6),
    tiklanish: ['Tiklanish', 'img/care.jpg', "Tiklanish muolajaga bog'liq: otoplastika va blefaroplastikada odatda 1–2 hafta dastlabki tiklanish, rinoplastika va face liftda shish uzoqroq pasayadi. \"Reja\" bo'limida har biri uchun umumiy xarita bor.", ["Birinchi kunlar: shish va ko'karish", "1–2 hafta: ko'pchilik ishga qaytadi (muolajaga qarab)", "Yakuniy natija: bir necha oy"], 'Konsultatsiya'],
    xavfsiz: ['Xavfsizlik va shaffoflik', 'img/or-lights.jpg', "Har bir jarrohlikda xavf bo'lishi mumkin. Shuning uchun qaror ko'rik va ochiq suhbatdan keyin qabul qilinadi, hech qanday va'dasiz.", ["Ko'rikdan oldin va'da yo'q", "Xavf va imkoniyatlar tushuntiriladi", "Natija individual"], 'Konsultatsiya']
  };
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
  const seg = $('#seg'), pd = $('#pd');
  seg.innerHTML = PROC.map((d, i) => `<button data-k="${i}">${d.t}</button>`).join('');
  const segBtns = $$('button', seg);
  function setProc(k) {
    const d = PROC[k];
    segBtns.forEach((b, i) => b.classList.toggle('on', i === k));
    $('#pdImg').src = d.img; $('#pdImg').alt = d.t; $('#pdTag').textContent = d.tag;
    $('#pdT').textContent = d.t; $('#pdSub').textContent = d.sub; $('#pdP').textContent = d.p;
    $('#pdList').innerHTML = d.list.map((x, i) => `<li style="--n:${i}">${x}</li>`).join('');
    $('#pdHow').innerHTML = d.how.map((x, i) => `<li style="--n:${i}">${x}</li>`).join('');
    $('#pdFor').innerHTML = d.who.map((x, i) => `<li style="--n:${i}">${x}</li>`).join('');
    $('#pdFacts').innerHTML = d.facts.map(f => `<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('');
    $('#pdBtn').dataset.svc = d.t;
    const act = segBtns[k]; if (act) seg.scrollTo({ left: act.offsetLeft - 18, behavior: 'smooth' });
    pd.style.animation = 'none'; void pd.offsetWidth; pd.style.animation = '';
  }
  segBtns.forEach((b, i) => b.addEventListener('click', () => setProc(i)));
  setProc(0);
  $$('[data-go]').forEach(a => a.addEventListener('click', () => setProc(+a.dataset.go)));
  $('#pdBtn').addEventListener('click', e => { sel.value = e.currentTarget.dataset.svc; });

  /* recovery */
  let recK = 0;
  const rseg = $('#rseg');
  rseg.innerHTML = REC.map((r, i) => `<button data-k="${i}">${r[0]}</button>`).join('');
  const rb = $$('button', rseg);
  function renderRec(k) {
    recK = k; rb.forEach((b, i) => b.classList.toggle('on', i === k));
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
