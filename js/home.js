(function () {
  'use strict';
  const C = window.BC.core, { esc, money, I, clamp, reduce } = C, $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  C.ready.then(async (D) => {
    const s = D.settings, main = $('#main'), all = D.products;
    // Haqiqiy foto 360: kamida 3 ta rasmli mahsulot va rasmlar yuklanadi
    let photo = all.find((p) => (p.images || []).length >= 3 && (p.images || []).length <= 8 && p.featured) || all.find((p) => (p.images || []).length >= 3);
    if (photo && !(window.BC.photo360 && (await BC.photo360.probe(photo.images[0])))) photo = null;
    const VL = ['Old', 'Yon', 'Orqa', 'Tepa', 'Salon', 'Detal'];
    const models = all.filter((p) => p.model3d && ['single', 'double', 'suv'].includes(p.model3d)).slice(0, 3);
    const items = models.length ? models : all.filter((p) => p.featured).slice(0, 3).concat(all).slice(0, 3);
    const first = items[0] || all[0];
    const st = { i: 0, c: 0, hex: first ? C.pColor(first) : '#2b59ff' };
    const warranty = s.warrantyMonths || 6;
    const specOf = (p, k) => (p && p.specs && p.specs[k]) || '';
    const photoSpecs = ['Karbon uslubidagi kapot', 'LED yoritish', 'Katta orqa spoyler'];
    const heroSpecs = [specOf(first, 'Batareya') && `${specOf(first, 'Batareya')} batareya`, specOf(first, 'Tezlik') || '3-5 km/soat', 'Ota-ona pulti'].filter(Boolean);

    const stepHtml = (a) => a.map((x, i) => `<div class="st ${i ? '' : 'on'}"><span class="idx">${x[0]}</span><h2>${x[1]}</h2><p>${x[2]}</p><ul>${x[3].map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('');
    const storySteps = photo ? stepHtml([
      ['Old tomondan', 'Sport avtomobil xarakteri.', "Karbon uslubidagi kapot, o'tkir LED faralar va past, keng old bamper. Mashina to'xtab turganda ham tezkor ko'rinadi.", ['Karbon kapot', 'LED faralar', 'Keng bamper']],
      ['Yon tomondan', 'Past profil, keng g\'ildirak.', "Katta qotishma disklar, g'ildirak kamarlari va pastki LED yoritish. Qorong'ida ham chiroyli ko'rinadi.", ['Qotishma disk', 'Pastki LED', 'Past profil']],
      ['Orqa tomondan', 'Haqiqiy spoyler.', "Katta orqa qanot va LED orqa chiroqlar. Dizayn oxirigacha o'ylangan.", ['Orqa spoyler', 'LED chiroq', 'Diffuzor']],
      ['Salon', 'Bolaga qulay, sizga xotirjam.', "Ikki o'rindiq, xavfsizlik kamarlari, qizil sport rul va musiqa paneli. Hammasi qo'l ostida.", ["2 o'rindiq", 'Xavfsizlik kamari', 'Musiqa paneli']],
    ]) : stepHtml([
      ['Xavfsizlik', 'Bola haydaydi, nazorat sizda.', "Mustahkam kuzov, xavfsizlik kamari va ota-ona pulti. Bola faqat siz ruxsat bergan tezlikda va yo'nalishda yuradi.", ['Xavfsizlik kamari', 'Ota-ona pulti', specOf(first, 'Yosh') || '2 yoshdan']],
      ['Quvvat va chiroqlar', 'Kuchli, ammo ehtiyotkor.', `${specOf(first, 'Batareya') ? `${specOf(first, 'Batareya')} batareya` : 'Zaryadlanuvchi batareya'}${specOf(first, 'Tezlik') ? `, tezlik ${specOf(first, 'Tezlik')}` : ''}. Old va orqa LED chiroqlar kechqurun ham yaqqol ko'rinadi.`, [specOf(first, 'Batareya') || 'Batareya', specOf(first, 'Tezlik') || 'Past tezlik', 'LED chiroqlar']],
      ['Boshqaruv', 'Ikki rejim, bitta quvonch.', "Bola pedal bilan o'zi haydaydi, kichkintoylarni esa siz pult orqali yo'naltirasiz. Musiqa va signal bilan qiziqarliroq.", ['Pedal', 'Pult', 'Bluetooth musiqa']],
    ]);
    main.innerHTML = `
    <section class="hero" id="hero">
      <div class="hero-bg"><i class="blob b1"></i><i class="blob b2"></i><div class="grid-lines"></div><div class="hero-word" aria-hidden="true">BABYCHEER</div></div>
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <span class="eyebrow"><i></i>${photo ? "Yangi: 360° ko'rinishda aylantiring" : "Yangi: 3D da aylantirib ko'ring"}</span>
          <h1><span class="l" style="--d:0"><span>Bolalikni</span></span><span class="l" style="--d:.12"><span class="grad-text">harakatga</span></span><span class="l" style="--d:.24"><span>keltiring.</span></span></h1>
          <p class="lead">Elektromobil, kalyaska, velokalyaska va mototsikllar. Sinovdan o'tgan modellar, ${warranty} oylik kafolat va butun O'zbekiston bo'ylab yetkazib berish.</p>
          <div class="hero-cta"><a class="btn" href="shop.html" data-mag>Katalogni ko'rish ${I.arr}</a><a class="btn glass" href="${C.tgLink()}" target="_blank" rel="noopener" data-mag>Telegramda yozish</a></div>
          <div class="hero-trust"><div><b class="num" data-count="${all.length}">0</b><span>model katalogda</span></div><div><b class="num" data-count="7600" data-suf="+">0</b><span>ota-ona Telegramda</span></div><div><b class="num" data-count="${warranty}" data-suf=" oy">0</b><span>rasmiy kafolat</span></div></div>
        </div>
        <div class="hero-stage ${photo ? 'is-photo' : ''}" id="heroStage"><div class="stage-ring"></div><div class="stage3d" id="stage3d"></div>
          ${(photo ? photoSpecs : heroSpecs).map((t, k) => `<span class="spec s${k + 1}"><i></i>${esc(t)}</span>`).join('')}
          <div class="hint"><svg viewBox="0 0 40 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h32M28 4l8 8-8 8"/></svg>Suring va aylantiring</div></div>
      </div>
      <div class="cfg ${photo ? 'views' : ''}" id="cfg" aria-label="${photo ? "Ko'rish burchagi" : 'Mashina sozlagich'}">
        ${photo ? `<div class="models" id="cfgModels" role="tablist">${photo.images.slice(0, 6).map((_, k) => `<button role="tab" class="${k ? '' : 'on'}" data-v="${k}">${VL[k]}</button>`).join('')}</div>
          <div class="mid"><div class="cn">Model<b>${esc(photo.title)}</b></div></div>`
        : `<div class="models" id="cfgModels" role="tablist">${items.map((p, k) => `<button role="tab" class="${k ? '' : 'on'}" data-m="${k}">${esc(p.title.replace(' elektromobil', '').replace('Jip uslubidagi', 'Jip'))}</button>`).join('')}</div>
          <div class="mid"><div class="cn">Rang<b id="cfgName"></b></div><div class="swatches" id="cfgSw"></div></div>`}
        <div class="go"><div class="price num" id="cfgPrice"></div><a class="btn sm" id="cfgGo" href="#">Batafsil ${I.arr}</a></div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="track" id="mq"></div></div>

    <section class="sec" id="collections"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow"><i></i>Kolleksiyalar</span><h2 data-split>Harakatning har bir turi</h2></div><p data-r>Yoshi va qiziqishiga qarab tanlang. Har bir bo'limda sinovdan o'tgan modellar.</p></div>
      <div class="cols">${D.categories.map((c, i) => { const cs = C.catStyle(c, i); return `<a class="col" href="shop.html?cat=${esc(c.slug)}" data-tilt="3" data-r style="--c:${cs.color}"><div><h3>${esc(c.name)}</h3><small>${all.filter((p) => p.category_id === c.id).length} ta model</small></div><span class="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span>${BC.art(cs.art, cs.color)}</a>`; }).join('')}</div>
    </div></section>

    <section class="story" id="story" aria-label="Mashina haqida"><div class="story-pin"><div class="wrap" style="display:contents">
      <div class="story-copy" id="storyCopy" style="margin-left:max(20px,calc((100vw - 1280px)/2 + 20px))">${storySteps}</div>
      <div class="story-stage" id="storyStage"><div class="story-rail" id="storyRail"><i class="on"></i><i></i><i></i></div><div class="story-bar"><i id="storyBar"></i></div></div></div></div></section>

    <section class="sec" id="products"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow"><i></i>Katalog</span><h2 data-split>Eng ko'p tanlanganlar</h2></div><a class="link" href="shop.html">Barcha mahsulotlar ${I.arr}</a></div>
      <div class="chips" id="homeChips" style="margin-bottom:30px"></div><div class="grid" id="homeGrid"></div>
    </div></section>

    <section class="sec" id="why"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow"><i></i>Ishonch</span><h2 data-split>Xotirjam tanlov uchun</h2></div><p data-r>Narx va ombor qoldig'i buyurtma vaqtida tizimda tekshiriladi. Hech qanday yashirin to'lov yo'q.</p></div>
      <div class="feats">
        <div class="feat big" data-r data-in><div><h3>${warranty} oylik rasmiy kafolat</h3><p>Har bir mahsulotga kafolat. Muammo bo'lsa, Telegram orqali yozing, tezda yordam beramiz.</p></div><div class="vis"><svg class="shield" viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 10 20 26v30c0 28 17 46 40 54 23-8 40-26 40-54V26z"/><path d="m40 60 14 14 28-30"/></svg></div></div>
        <div class="feat" data-r><div><h3>Tez yetkazib berish</h3><p>Butun O'zbekiston bo'ylab. ${esc(money(s.freeFrom ?? 1000000))} dan yuqori buyurtmalarda bepul.</p></div><div class="vis"><svg class="truck" viewBox="0 0 120 70" fill="none"><rect x="4" y="12" width="68" height="40" rx="8" fill="var(--brand)"/><path d="M72 24h24l16 16v12H72z" fill="var(--brand-2)"/><path d="M80 30h12l8 9H80z" fill="#fff" opacity=".85"/><g class="wh" style="transform-box:fill-box;transform-origin:center"><circle cx="28" cy="56" r="10" fill="#10162e"/><circle cx="28" cy="56" r="4" fill="#cdd6f4"/></g><g class="wh" style="transform-box:fill-box;transform-origin:center"><circle cx="92" cy="56" r="10" fill="#10162e"/><circle cx="92" cy="56" r="4" fill="#cdd6f4"/></g></svg></div></div>
        <div class="feat" data-r><div><h3>Telegramda yordam</h3><p>Savolingizga ${esc((s.telegram || '').replace('@', ''))} orqali javob beramiz.</p></div><div class="vis"><div class="bubble"><span>Qizil rangi bormi?</span><span>Ha, ombordan yuboramiz</span></div></div></div>
      </div>
    </div></section>

    <section class="sec"><div class="wrap"><div class="band" data-r>
      <div><b class="num" data-count="${all.length}">0</b><span>model: elektromobildan samokatgacha</span></div>
      <div><b class="num" data-count="7600" data-suf="+">0</b><span>ota-ona Telegram hamjamiyatimizda</span></div>
      <div><b class="num" data-count="${warranty}" data-suf=" oy">0</b><span>har bir mahsulotga rasmiy kafolat</span></div></div></div></section>

    <section class="sec"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow"><i></i>Qanday ishlaydi</span><h2 data-split>Besh qadamda eshigingizgacha</h2></div></div>
      <div class="proc" data-in><div class="line"><i></i></div>
        ${[['Tanlang', 'Katalogdan modelni toping, rangini 3D da ko\'ring.'], ['Buyurtma bering', 'Ism, telefon va manzilni kiriting.'], ['Tasdiqlash', 'Operator siz bilan bog\'lanadi.'], ['Yetkazish', 'Eshigingizgacha olib boramiz.'], ['Kafolat', `${warranty} oy davomida yordam.`]].map(([h, p], i) => `<div class="p-step" style="--i:${i}" data-r><div class="n">${i + 1}</div><div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}</div>
    </div></section>

    <section class="sec"><div class="wrap faq">
      <div class="l"><span class="eyebrow"><i></i>Savollar</span><h2 style="font-size:clamp(34px,4.6vw,64px);margin-top:18px" data-split>Ko'p so'raladigan savollar</h2><p>Javob topmadingizmi? Bizga yozing, bir necha daqiqada javob beramiz.</p><a class="btn" href="contact.html">Savol berish ${I.arr}</a></div>
      <div class="acc" data-r>${[
        ['Elektromobil necha yoshdan?', "Modelga qarab 2 yoshdan 8 yoshgacha. Har bir mahsulot sahifasida aniq yosh va yuk ko'tarish ko'rsatilgan."],
        ['Yetkazib berish qancha turadi?', `Butun O'zbekiston bo'ylab yetkazamiz. ${money(s.freeFrom ?? 1000000)} dan yuqori buyurtmalarda bepul, qolganida ${money(s.deliveryFee ?? 40000)}. Muddatni operator buyurtmani tasdiqlaganda aytadi.`],
        ["To'lov qanday amalga oshiriladi?", "Mahsulotni qabul qilganda naqd yoki karta orqali to'laysiz. Oldindan to'lov talab qilinmaydi."],
        ['Kafolat nimani qamrab oladi?', `Barcha mahsulotlarga ${warranty} oylik kafolat beriladi. Ishlab chiqarish nuqsonlari bepul bartaraf etiladi.`],
        ["Rangni keyin o'zgartirsa bo'ladimi?", "Buyurtma tasdiqlanishidan oldin Telegram yoki telefon orqali rangni o'zgartirish mumkin."],
        ['Buyurtmani qanday kuzataman?', "Buyurtma raqami va telefon raqamingiz bilan \"Buyurtmani kuzatish\" sahifasida holatni ko'rasiz."]].map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${q}<i></i></summary><div class="bd">${a}</div></details>`).join('')}</div>
    </div></section>

    <section class="sec"><div class="wrap"><div class="cta" data-r>
      <h2>Bolangiz uchun to'g'ri tanlovni birga qilamiz.</h2><p>Telegramda yozing yoki qo'ng'iroq qiling. Yoshi va qiziqishiga mos modelni tavsiya qilamiz.</p>
      <div class="row"><a class="btn wh2" href="${C.tgLink()}" target="_blank" rel="noopener" data-mag>Telegramda yozish ${I.arr}</a><a class="btn glass" href="tel:${esc((s.phone || '').replace(/\s/g, ''))}" data-mag>${esc(s.phone || '')}</a></div>
      <div class="road" aria-hidden="true"><div class="drive">${BC.art('car', st.hex)}</div></div></div></div></section>`;

    /* ---------- marquee ---------- */
    const words = [...D.categories.map((c) => c.name), `${warranty} oy kafolat`, 'Bepul yetkazib berish', 'Telegramda buyurtma', '3D ko\'rinish'];
    $('#mq').innerHTML = [...words, ...words, ...words].map((w, i) => `<span style="${i % 2 ? 'color:transparent;-webkit-text-stroke:1.4px var(--ink)' : ''}">${esc(w)}</span>`).join('');

    /* ---------- mahsulot ro'yxati ---------- */
    let hc = 'all';
    const drawHome = () => {
      const cat = D.categories.find((c) => c.slug === hc), list = all.filter((p) => hc === 'all' || p.category_id === cat?.id).sort((a, b) => b.featured - a.featured).slice(0, 8);
      $('#homeChips').innerHTML = [{ slug: 'all', name: 'Hammasi' }, ...D.categories].map((c) => `<button class="chip ${hc === c.slug ? 'on' : ''}" data-hc="${esc(c.slug)}">${esc(c.name)}</button>`).join('');
      $('#homeGrid').innerHTML = list.map(C.productCard).join('') || '<div class="empty">Bu bo\'limda hozircha mahsulot yo\'q.</div>'; C.observe($('#homeGrid'));
    };
    $('#homeChips').addEventListener('click', (e) => { const b = e.target.closest('[data-hc]'); if (b) { hc = b.dataset.hc; drawHome(); } }); drawHome();

    /* ---------- 3D sozlagich (foto bo'lmasa) ---------- */
    let hv = null, sv = null;
    function initCars() {
    const car3d = window.BC.car3d && window.BC.car3d.supported; const accent = '#2b59ff';
    const cur = () => items[st.i];
    function setTint(hex) { root.style.setProperty('--tint', hex); }
    function applyColor(hex, from) {
      st.hex = hex; setTint(hex); hv && hv.setColor(hex); sv && sv.setColor(hex);
      if (!hv) { const f = $('#stage3d .art-fallback'); if (f) f.innerHTML = BC.art(C.artType(cur()), hex); }
      if (from && !reduce) { const r = $('#hero').getBoundingClientRect(), b = from.getBoundingClientRect(), d = document.createElement('i'); d.className = 'ripple'; const size = Math.hypot(innerWidth, innerHeight) * 2;
        d.style.cssText = `width:${size}px;height:${size}px;left:${b.left + b.width / 2 - r.left - size / 2}px;top:${b.top + b.height / 2 - r.top - size / 2}px`; $('#hero').append(d);
        d.animate([{ transform: 'scale(0)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 0 }], { duration: 1300, easing: 'cubic-bezier(.22,.9,.24,1)' }).onfinish = () => d.remove(); }
      const dr = $('.cta .drive'); if (dr) dr.innerHTML = BC.art('car', hex);
    }
    function drawCfg() {
      const p = cur(), cols = p.colors && p.colors.length ? p.colors : [{ name: '', hex: C.pColor(p) }];
      $('#cfgSw').innerHTML = cols.map((c, k) => `<button class="swatch" style="--c:${c.hex}" data-sw="${k}" aria-pressed="${k === st.c}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join('');
      $('#cfgName').textContent = (cols[st.c] || cols[0]).name; $('#cfgPrice').innerHTML = `${C.priceTxt(p.price)}`; $('#cfgGo').href = C.prodUrl(p.id);
      $$('#cfgModels button').forEach((b, k) => b.classList.toggle('on', k === st.i));
    }
    $('#cfgModels').addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return; st.i = +b.dataset.m; st.c = 0; const p = cur(); drawCfg();
      if (hv && p.model3d) { hv.setModel(p.model3d); hv.spin(0.6, 1100); } if (sv && p.model3d) sv.setModel(p.model3d); applyColor(((p.colors || [])[0] || {}).hex || C.pColor(p));
    });
    $('#cfgSw').addEventListener('click', (e) => { const b = e.target.closest('[data-sw]'); if (!b) return; st.c = +b.dataset.sw; const p = cur(), col = (p.colors || [])[st.c]; if (!col) return; drawCfg(); applyColor(col.hex, $(`[data-sw="${st.c}"]`)); });
    drawCfg(); setTint(st.hex);

    const stage = $('#stage3d');
    if (car3d && first && first.model3d) {
      hv = BC.car3d.create(stage, { model: first.model3d, color: st.hex, accent, interactive: true, driveIn: true, driveDelay: 1500, driveMs: 2800, sway: true, parallax: true, yaw: 0.72, pitch: 0.12, zoom: 1.28 });
      const mk = () => { sv = BC.car3d.create($('#storyStage'), { model: cur().model3d || first.model3d, color: st.hex, accent, interactive: false, autorotate: false, damp: 0.07, yaw: 1.0, pitch: 0.12, zoom: 1.32, fps: 40 }); C.onScroll(); };
      if ('IntersectionObserver' in window) { const lo = new IntersectionObserver((es) => { if (es[0].isIntersecting) { lo.disconnect(); mk(); } }, { rootMargin: '150% 0px' }); lo.observe($('#story')); } else mk();
    }
    if (!hv) { stage.innerHTML = `<div class="art-fallback">${BC.art(C.artType(first || {}), st.hex)}</div>`; $('.hint')?.remove(); }
    if (!car3d || !first || !first.model3d) { const sec = $('#story'); sec.style.height = 'auto'; $('.story-pin', sec).style.position = 'static'; $('.story-pin', sec).style.height = 'auto'; $('#storyStage').innerHTML = `<div class="art-fallback" style="position:absolute;inset:8%;display:grid;place-items:center">${BC.art(C.artType(first || {}), st.hex)}</div>`; }
    }

    function initStory3d() {
    const SHOTS = [{ yaw: 0.05, pitch: 0.06, zoom: 1.3, y: 0.7, g: 0 }, { yaw: -2.5, pitch: 0.22, zoom: 1.25, y: 0.62, g: 1 }, { yaw: -0.7, pitch: 1.05, zoom: 1.4, y: 0.4, g: 0.3 }];
    const stEls = $$('#storyCopy .st'), rail = $$('#storyRail i'); let lastStep = -1;
    function story() {
      if (!sv) return; const sec = $('#story'), r = sec.getBoundingClientRect(), p = clamp(-r.top / (sec.offsetHeight - innerHeight || 1), 0, 1);
      const f = p * (SHOTS.length - 1), i = Math.min(Math.floor(f), SHOTS.length - 2), k = f - i, e = k * k * (3 - 2 * k), a = SHOTS[i], b = SHOTS[i + 1], L = (x, y) => x + (y - x) * e;
      sv.view({ yaw: L(a.yaw, b.yaw), pitch: L(a.pitch, b.pitch), zoom: L(a.zoom, b.zoom), y: L(a.y, b.y) }); sv.glow(L(a.g, b.g));
      const step = Math.min(Math.round(f), 2); if (step !== lastStep) { lastStep = step; stEls.forEach((s2, n) => s2.classList.toggle('on', n === step)); rail.forEach((d, n) => d.classList.toggle('on', n === step)); }
      $('#storyBar').style.transform = `scaleX(${p})`;
    }
    document.addEventListener('bc:scroll', story); story();
    }

    /* ---------- foto 360 rejimi ---------- */
    function initPhoto() {
      const N = Math.min(photo.images.length, 6), imgs = photo.images.slice(0, N), alt = photo.title;
      // hero
      const st3 = $('#stage3d'); st3.innerHTML = '<div class="photo-glow"></div><div class="photo-card" id="heroCard"></div>';
      const btns = $$('#cfgModels [data-v]'); let hp = null;
      hp = BC.photo360.create($('#heroCard'), { images: imgs, labels: VL, alt, onChange: (k) => btns.forEach((b, n) => b.classList.toggle('on', n === k)) });
      $('#cfgModels').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b && hp) hp.goTo(+b.dataset.v); });
      $('#cfgPrice').textContent = C.priceTxt(photo.price); $('#cfgGo').href = C.prodUrl(photo.id);
      // hikoya
      const host = $('#storyStage'); host.insertAdjacentHTML('afterbegin', '<div class="photo-card story-card" id="storyCard"></div>');
      const sp = BC.photo360.create($('#storyCard'), { images: imgs, labels: VL, alt, interactive: false, autoplay: false, ui: false });
      const stEls = $$('#storyCopy .st'), rail = $('#storyRail'); rail.innerHTML = stEls.map((_, n) => `<i class="${n ? '' : 'on'}"></i>`).join(''); const dots = $$('i', rail); let last = -1;
      function story() {
        const sec = $('#story'), r = sec.getBoundingClientRect(), p = clamp(-r.top / (sec.offsetHeight - innerHeight || 1), 0, 1);
        sp && sp.setPos(p * (N - 1)); const step = Math.min(Math.round(p * (stEls.length - 1)), stEls.length - 1);
        if (step !== last) { last = step; stEls.forEach((e2, n) => e2.classList.toggle('on', n === step)); dots.forEach((d, n) => d.classList.toggle('on', n === step)); }
        $('#storyBar').style.transform = `scaleX(${p})`;
      }
      document.addEventListener('bc:scroll', story); story();
    }

    if (photo) initPhoto(); else { initCars(); initStory3d(); }

    /* ---------- hero parallax: mashina bilan so'z ---------- */
    document.addEventListener('bc:scroll', (e) => { const y = e.detail.y; if (y > 1200) return; const w = $('.hero-copy'); if (w && !reduce) w.style.transform = `translate3d(0,${y * -0.05}px,0)`; });

    C.observe(main);
    document.addEventListener('bc:shown', () => { C.onScroll(); });
  });
})();
