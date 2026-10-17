'use strict';
// Bo'limlar kutubxonasi: har bir bo'lim ko'rinishi (render) va tahrirlash maydonlari (fields) shu yerda.
(function () {
  const E = window.E;
  const { $, $$, esc, text, imgUrl, linkUrl, icon } = E;

  /* ---------- Maydon sxemasi yordamchilari (editor shundan forma yasaydi) ---------- */
  const F = {
    text: (k, label, o) => ({ k, t: 'text', label, ...o }),
    area: (k, label, o) => ({ k, t: 'area', label, ...o }),
    num: (k, label, o) => ({ k, t: 'num', label, ...o }),
    sel: (k, label, options, o) => ({ k, t: 'sel', label, options, ...o }),
    tog: (k, label, o) => ({ k, t: 'tog', label, ...o }),
    img: (k, label, o) => ({ k, t: 'img', label, ...o }),
    lines: (k, label, o) => ({ k, t: 'lines', label, ...o }),
    icon: (k, label, o) => ({ k, t: 'icon', label, ...o }),
    link: (k, label, o) => ({ k, t: 'link', label, ...o }),
    list: (k, label, item, o) => ({ k, t: 'list', label, item, ...o }),
  };
  E.F = F;
  const HEAD = [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 100 }), F.area('text', 'Tavsif', { max: 300, rows: 2 })];
  const uid = () => 'i' + Math.random().toString(36).slice(2, 8);
  const define = (type, def) => { E.sections[type] = def; E.order.push(type); };
  const arr = (a) => (Array.isArray(a) ? a : []);
  const split = (s, d, ins) => {
    let i = 0; const imgs = arr(ins).filter((x) => x && imgUrl(x.image));
    const total = String(s || '').replace(/\*/g, '').split(/\s+/).filter(Boolean).length;
    const at = imgs.map((_, j) => Math.max(1, Math.round((total * (j + 1)) / (imgs.length + 1))));
    const word = (w) => { const k = i++; let h = `<span class="w"><span style="animation-delay:${(d + k * 0.08).toFixed(2)}s">${text(w)}</span></span>`; const j = at.indexOf(k + 1); if (j >= 0) h += `<span class="ipill" style="--pd:${(d + k * 0.08 + 0.5).toFixed(2)}s"><img src="${esc(imgUrl(imgs[j].image))}" alt=""></span>`; return h; };
    return String(s || '').split(/(\*[^*]+\*)/).filter(Boolean).map((seg) => { const em = /^\*[^*]+\*$/.test(seg); const t = em ? seg.slice(1, -1) : seg; const h = t.split(/\s+/).filter(Boolean).map(word).join(' '); const out = em ? `<em>${h}</em>` : h; return (!em && /^\s/.test(t) ? ' ' : '') + out + (!em && /\s$/.test(t) ? ' ' : ''); }).join('').replace(/\s+/g, ' ');
  };
  const btn = (t, l, cls) => (t ? `<a class="btn ${cls || ''}" href="${esc(linkUrl(l) || '#')}">${text(t)}<span class="bi">${icon('arrow')}</span></a>` : '');

  /* =============== HERO =============== */
  define('hero', {
    label: 'Bosh ekran', icon: 'star', desc: 'Sahifa boshidagi katta sarlavha va tugmalar',
    fields: [
      F.sel('layout', 'Ko\'rinish', [['aurora', 'Aurora: animatsion fon, markazda (tavsiya)'], ['cinema', 'Kinematik: to\'liq rasm yoki video'], ['photo', 'Katta foto + matn'], ['editorial', 'Muharrir: so\'zlar orasida rasmlar'], ['split', 'Matn + tasvir'], ['center', 'Markazda'], ['image', 'To\'liq rasm foni (sodda)'], ['shop', 'Do\'kon (mahsulotlar kollaji)']]),
      F.text('badge', 'Yuqoridagi yozuv', { max: 80 }), F.text('titleStart', 'Sarlavha boshi', { max: 80 }),
      F.lines('words', 'Almashib turadigan so\'zlar', { hint: 'Har bir qatorga bitta so\'z. Bo\'sh qoldirsangiz o\'chadi.' }),
      F.text('titleEnd', 'Sarlavha oxiri', { max: 80 }), F.area('text', 'Tavsif', { max: 320, rows: 3 }),
      F.text('cta1Text', '1-tugma matni', { max: 40 }), F.link('cta1Link', '1-tugma havolasi'),
      F.text('cta2Text', '2-tugma matni', { max: 40 }), F.link('cta2Link', '2-tugma havolasi'),
      F.sel('visual', 'O\'ng tomondagi tasvir', [['none', 'Yo\'q'], ['image', 'Rasm'], ['window', 'Kod oynasi'], ['collage', 'Mahsulotlar kollaji']], { show: (s) => ['split', 'center'].includes(s.layout) }),
      F.sel('fx', 'Fon animatsiyasi', [['aurora', 'Nur oqimi'], ['waves', "To'lqinlar"]], { show: (s) => s.layout === 'aurora' }),
      F.img('image', 'Rasm', { hint: 'Aurora: pastdagi katta rasm (ixtiyoriy). Kinematik: fon rasmi. Foto: asosiy foto.', show: (s) => ['image', 'cinema', 'photo', 'aurora'].includes(s.layout) || ((s.layout === 'split' || s.layout === 'center') && s.visual === 'image') }),
      F.text('video', 'Fon videosi (mp4 havolasi)', { max: 300, hint: 'Ixtiyoriy. Yuklangan mp4 faylning manzili.', show: (s) => s.layout === 'cinema' }),
      F.img('image2', 'Ikkinchi kichik rasm', { show: (s) => s.layout === 'photo' }),
      F.text('spinText', 'Aylanuvchi yozuv', { max: 40, show: (s) => s.layout === 'photo' }),
      F.list('inlineImgs', "So'zlar orasidagi rasmlar (3 tagacha)", { title: 'image', fields: [F.img('image', 'Rasm')], add: () => ({ image: '' }), max: 3 }, { show: (s) => s.layout === 'editorial' }),
      F.lines('windowLines', 'Oynadagi qatorlar', { show: (s) => s.layout === 'split' && s.visual === 'window' }),
      F.lines('chips', 'Suzuvchi yozuvlar (3 tagacha)', { show: (s) => s.layout === 'photo' || (['split', 'shop'].includes(s.layout) && s.visual !== 'none') }),
      F.list('collage', 'Kollaj kartochkalari', { title: 'title', fields: [F.img('image', 'Rasm'), F.text('title', 'Nomi', { max: 60 }), F.text('price', 'Narx matni', { max: 30 })], add: () => ({ image: '', title: 'Mahsulot', price: '' }), max: 3 }, { show: (s) => s.layout === 'shop' || s.visual === 'collage' }),
      F.list('trust', 'Ishonch ko\'rsatkichlari', { title: 'value', fields: [F.text('value', 'Qiymat', { max: 20 }), F.text('label', 'Yozuv', { max: 30 })], add: () => ({ value: '', label: '' }), max: 4 }),
    ],
    defaults: () => ({ layout: 'aurora', fx: 'aurora', video: '', image2: '', spinText: '', inlineImgs: [], badge: 'Yangi', titleStart: 'Sarlavhangizni', words: ['shu yerga'], titleEnd: 'yozing', text: 'Kompaniyangiz haqida qisqa va aniq tavsif.', cta1Text: 'Boshlash', cta1Link: '#', cta2Text: '', cta2Link: '#', visual: 'none', image: '', windowLines: [], chips: [], collage: [], trust: [] }),
    render(sec) {
      const words = arr(sec.words).filter(Boolean), layout = sec.layout || 'split';
      const h1 = `<h1>${split(sec.titleStart, 0.1)}${words.length ? `<br><span class="grad type"><span id="tw" data-words="${esc(words.join('|'))}"></span><i class="caret"></i></span> ` : ' '}${split(sec.titleEnd, 0.45)}</h1>`;
      const trust = arr(sec.trust).filter((t) => t.value || t.label);
      const copy = `${sec.badge ? `<div class="pill"><b></b>${text(sec.badge)}</div>` : ''}${h1}${sec.text ? `<p class="lead">${text(sec.text)}</p>` : ''}
        <div class="cta">${btn(sec.cta1Text, sec.cta1Link, 'mag')}${btn(sec.cta2Text, sec.cta2Link, 'ghost mag')}</div>
        ${trust.length ? `<div class="trust">${trust.map((t) => `<div><b>${text(t.value)}</b>${text(t.label)}</div>`).join('')}</div>` : ''}`;
      const chips = arr(sec.chips).filter(Boolean).slice(0, 3);
      const chipH = chips.map((c, i) => `<div class="chip ${'abc'[i]}"><em>${icon(['chart', 'zap', 'check'][i])}</em>${text(c)}</div>`).join('');
      const collage = arr(sec.collage).slice(0, 3);
      const collageH = `<div class="collage">${collage.map((c, i) => `<figure class="cc c${i}">${E.img(c.image, c.title)}<figcaption><b>${text(c.title)}</b>${c.price ? `<span>${text(c.price)}</span>` : ''}</figcaption></figure>`).join('')}</div>`;
      let vis = '';
      const v = layout === 'shop' ? 'collage' : sec.visual;
      if (layout === 'split' || layout === 'shop' || layout === 'center') {
        if (v === 'window' && layout === 'split') vis = `<div class="vis tilt"><div class="win"><div class="bar"><i></i><i></i><i></i></div><pre>${arr(sec.windowLines).slice(0, 12).map((l, i) => `<span class="l" style="animation-delay:${(1 + i * 0.3).toFixed(1)}s">${codeLine(l)}</span>`).join('')}</pre><div class="chart">${[35, 55, 42, 70, 60, 88, 100].map((x, i) => `<i style="height:${x}%;animation-delay:${(1.2 + i * 0.1).toFixed(1)}s"></i>`).join('')}</div></div>${chipH}</div>`;
        else if (v === 'image' && imgUrl(sec.image)) vis = `<div class="vis"><div class="imgwin">${E.img(sec.image, '')}</div>${layout === 'center' ? '' : chipH}</div>`;
        else if (v === 'collage' && collage.length) vis = `<div class="vis">${collageH}${chipH}</div>`;
      }
      const head = (cls) => `<section class="sec s-hero hero hero-${cls}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"`;
      const h1x = (ins) => `<h1>${split(sec.titleStart, 0.1, ins)}${words.length ? `<br><span class="grad type"><span id="tw" data-words="${esc(words.join('|'))}"></span><i class="caret"></i></span> ` : ' '}${split(sec.titleEnd, 0.45)}</h1>`;
      const bare = (ins) => `${sec.badge ? `<div class="pill"><b></b>${text(sec.badge)}</div>` : ''}${h1x(ins)}${sec.text ? `<p class="lead">${text(sec.text)}</p>` : ''}<div class="cta">${btn(sec.cta1Text, sec.cta1Link, 'mag')}${btn(sec.cta2Text, sec.cta2Link, 'ghost mag')}</div>`;
      const trustH = trust.length ? `<div class="trust">${trust.map((t) => `<div><b>${text(t.value)}</b>${text(t.label)}</div>`).join('')}</div>` : '';
      if (layout === 'aurora' || layout === 'editorial') {
        const shot = layout === 'aurora' && imgUrl(sec.image) ? `<div class="hshot imr"><img data-par="0.05" src="${esc(imgUrl(sec.image))}" alt=""></div>` : '';
        return `${head(layout)}><div class="hfx" data-fx="${sec.fx === 'waves' ? 'waves' : 'aurora'}"><div class="hveil"></div></div><div class="wrap hero-in"><div class="hcopy">${bare(layout === 'editorial' ? sec.inlineImgs : null)}${trustH}</div>${shot}</div>${shot ? '' : '<i class="hscroll"></i>'}</section>`;
      }
      if (layout === 'cinema') {
        const vid = /^(https?:\/\/|\/)[^\s"'<>]+\.(mp4|webm)(\?.*)?$/i.test(sec.video || '') ? `<video src="${esc(sec.video)}" ${imgUrl(sec.image) ? `poster="${esc(imgUrl(sec.image))}"` : ''} muted loop playsinline autoplay></video>` : '';
        return `${head('cinema')}><div class="hbg2">${vid || E.img(sec.image, '')}</div><div class="wrap hero-in"><div class="hcopy">${bare()}</div>${trustH}</div><i class="hscroll"></i></section>`;
      }
      if (layout === 'photo') {
        const ch = arr(sec.chips).filter(Boolean).slice(0, 3).map((c, i) => `<div class="chip ${'abc'[i]}"><em>${icon(['star', 'zap', 'check'][i])}</em>${text(c)}</div>`).join('');
        const spin = sec.spinText ? `<div class="spin"><svg viewBox="0 0 120 120"><defs><path id="sp${esc(sec.id)}" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#sp${esc(sec.id)}">${text((sec.spinText + ' • ').repeat(3))}</textPath></text></svg><b>${icon('arrow')}</b></div>` : '';
        const photo = `<div class="hphoto"><div class="frame">${imgUrl(sec.image) ? `<img data-par="0.06" src="${esc(imgUrl(sec.image))}" alt="">` : ''}</div>${spin}${ch}${imgUrl(sec.image2) ? `<div class="imgb"><img src="${esc(imgUrl(sec.image2))}" alt=""></div>` : ''}</div>`;
        return `${head('photo')}><div class="wrap hero-in"><div class="hcopy">${bare()}${trustH}</div>${photo}</div></section>`;
      }
      if (layout === 'image') {
        return `<section class="sec s-hero hero hero-image" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="hbg">${E.img(sec.image, '')}</div><div class="wrap hero-in"><div class="hcopy">${copy}</div></div></section>`;
      }
      if (layout === 'center') {
        return `<section class="sec s-hero hero hero-center" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap"><div class="hcopy">${copy}</div>${vis}</div></section>`;
      }
      return `<section class="sec s-hero hero hero-${layout} ${vis ? '' : 'solo'}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap hero-in"><div class="hcopy">${copy}</div>${vis}</div></section>`;
    },
  });
  function codeLine(s) {
    let h = esc(s);
    h = h.replace(/(\/\/.*)$/, '<span class="c">$1</span>').replace(/(&quot;.*?&quot;)/g, '<span class="s">$1</span>').replace(/\b(const|let|var|function|return|import|from)\b/g, '<span class="k">$1</span>');
    return h;
  }

  /* =============== MARQUEE =============== */
  define('marquee', {
    label: 'Yuguruvchi lenta', icon: 'zap', desc: 'Xizmat yoki brend nomlari lentasi',
    fields: [F.lines('items', 'Lentadagi so\'zlar')],
    defaults: () => ({ items: ['Birinchi', 'Ikkinchi', 'Uchinchi'] }),
    render(sec) {
      const it = arr(sec.items).filter(Boolean); if (!it.length) return '';
      const row = `<span>${it.map(text).join('</span><span>')}</span>`;
      return `<section class="sec s-marquee" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="mq"><div class="track">${row}${row}${row}${row}</div></div></section>`;
    },
  });

  /* =============== STATS =============== */
  define('stats', {
    label: 'Raqamlar', icon: 'chart', desc: 'Animatsiyali ko\'rsatkichlar',
    fields: [F.list('items', 'Ko\'rsatkichlar', { title: 'label', fields: [F.num('value', 'Son'), F.text('suffix', 'Qo\'shimcha (+, %)', { max: 10 }), F.text('label', 'Yozuv', { max: 40 })], add: () => ({ value: 10, suffix: '+', label: 'Yangi ko\'rsatkich' }), max: 6 })],
    defaults: () => ({ items: [{ value: 100, suffix: '+', label: 'Mijoz' }, { value: 5, suffix: ' yil', label: 'Tajriba' }, { value: 24, suffix: '/7', label: 'Aloqa' }] }),
    render(sec) {
      const it = arr(sec.items).filter((s) => s.label); if (!it.length) return '';
      return E.wrap(sec, `<div class="stats rv">${it.map((s) => `<div class="stat"><b data-count="${Number(s.value) || 0}" data-suf="${esc(s.suffix || '')}">0${text(s.suffix)}</b><span>${text(s.label)}</span></div>`).join('')}</div>`, 'tight');
    },
  });

  /* =============== FEATURES =============== */
  define('features', {
    label: 'Xizmatlar / afzalliklar', icon: 'grid', desc: 'Ikonkali kartochkalar: xizmat, afzallik yoki shartlar',
    fields: [...HEAD, F.sel('layout', 'Joylashuv', [['bento', 'Katta + kichik kartochkalar'], ['grid', 'Teng kartochkalar'], ['strip', 'Ixcham qator (afzalliklar uchun)']]),
      F.list('items', 'Kartochkalar', { title: 'title', fields: [F.icon('icon', 'Ikonka'), F.text('title', 'Nomi', { max: 80 }), F.area('text', 'Tavsif', { max: 300, rows: 2 })], add: () => ({ icon: 'star', title: 'Yangi xizmat', text: '' }) })],
    defaults: () => ({ eyebrow: 'Xizmatlar', title: 'Biz nima qilamiz', text: '', layout: 'grid', items: [{ icon: 'star', title: 'Birinchi xizmat', text: 'Qisqa tavsif.' }, { icon: 'zap', title: 'Ikkinchi xizmat', text: 'Qisqa tavsif.' }, { icon: 'shield', title: 'Uchinchi xizmat', text: 'Qisqa tavsif.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const lay = sec.layout || 'grid';
      const cls = (i) => (lay === 'bento' ? (it.length >= 4 && i === 0 ? 'c4' : it.length === 1 ? 'c6' : it.length === 2 ? 'c3' : 'c2') : '');
      return E.wrap(sec, `${E.head(sec)}<div class="fgrid2 f-${esc(lay)}">${it.map((x, i) => `<div class="card ${cls(i)} rv" style="--d:${(i % 4) * 0.08}s"><div class="ic">${icon(x.icon)}</div><div class="ft"><h3>${text(x.title)}</h3><p>${text(x.text)}</p></div></div>`).join('')}</div>`, lay === 'strip' ? 'tight' : '');
    },
  });

  /* =============== PROCESS =============== */
  define('process', {
    label: 'Jarayon', icon: 'refresh', desc: 'Qanday ishlashingiz: qadamlar',
    fields: [...HEAD, F.sel('layout', "Ko'rinish", [['grid', 'Yonma-yon kartochkalar'], ['stack', 'Ustma-ust yig\'iladigan (katta)']]), F.list('items', 'Qadamlar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 60 }), F.area('text', 'Tavsif', { max: 250, rows: 2 })], add: () => ({ title: 'Yangi qadam', text: '' }), max: 8 })],
    defaults: () => ({ eyebrow: 'Jarayon', title: 'Qanday ishlaymiz', text: '', items: [{ title: 'Bog\'lanish', text: 'Arizangizni qabul qilamiz.' }, { title: 'Kelishuv', text: 'Shartlarni kelishamiz.' }, { title: 'Bajarish', text: 'Ishni o\'z vaqtida topshiramiz.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      if (sec.layout === 'stack') return E.wrap(sec, `${E.head(sec)}<div class="steps stack">${it.map((s, i) => `<div class="step" style="--i:${i}"><div class="num">${String(i + 1).padStart(2, '0')}</div><h3>${text(s.title)}</h3><p>${text(s.text)}</p></div>`).join('')}</div>`);
      return E.wrap(sec, `${E.head(sec)}<div class="steps">${it.map((s, i) => `<div class="step rv" style="--d:${i * 0.1}s"><div class="num">${i + 1}</div><h3>${text(s.title)}</h3><p>${text(s.text)}</p></div>`).join('')}</div>`);
    },
  });

  /* =============== ABOUT =============== */
  define('about', {
    label: 'Biz haqimizda', icon: 'users', desc: 'Rasm, matn va afzalliklar ro\'yxati',
    fields: [...HEAD, F.img('image', 'Rasm'), F.sel('imageSide', 'Rasm joylashuvi', [['left', 'Chapda'], ['right', 'O\'ngda']]), F.lines('points', 'Ro\'yxat (har qatorga bittadan)'), F.text('ctaText', 'Tugma matni', { max: 40 }), F.link('ctaLink', 'Tugma havolasi')],
    defaults: () => ({ eyebrow: 'Biz haqimizda', title: 'Biz kimmiz', text: 'Kompaniyangiz haqida batafsil yozing: tarixi, qadriyatlari va mijozlarga nima beradi.', image: '', imageSide: 'left', points: ['Birinchi afzallik', 'Ikkinchi afzallik', 'Uchinchi afzallik'], ctaText: '', ctaLink: '#' }),
    render(sec) {
      const img = imgUrl(sec.image) ? `<div class="aimg rv">${E.img(sec.image, sec.title)}</div>` : '';
      return E.wrap(sec, `<div class="about ${sec.imageSide === 'right' ? 'rev' : ''} ${img ? '' : 'noimg'}">${img}<div class="atx rv">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}
        ${arr(sec.points).filter(Boolean).length ? `<ul class="pts">${arr(sec.points).filter(Boolean).map((p) => `<li>${icon('check')}<span>${text(p)}</span></li>`).join('')}</ul>` : ''}${sec.ctaText ? `<div class="ctaw">${btn(sec.ctaText, sec.ctaLink)}</div>` : ''}</div></div>`);
    },
  });

  /* =============== PRODUCTS (do'kon / kurslar / paketlar) =============== */
  const shop = {};
  const productFields = [
    F.text('name', 'Nomi', { max: 120 }), F.num('price', 'Narxi', { hint: '0 = «Narxi kelishiladi»' }), F.num('oldPrice', 'Eski narx (chegirma uchun)', { hint: 'Narxdan katta bo\'lsa chegirma foizi ko\'rinadi' }),
    F.text('category', 'Kategoriya', { max: 60 }), F.text('badge', 'Belgi (ixtiyoriy)', { max: 30, ph: 'YANGI, CHEGIRMA, TOP' }), F.area('description', 'Tavsif', { max: 600, rows: 3 }),
    F.img('image', 'Rasm'), F.num('stock', 'Ombordagi soni', { hint: 'Bo\'sh qoldirsangiz cheksiz. 0 = «Tugagan»', blank: true }), F.tog('active', 'Saytda ko\'rsatish'),
  ];
  define('products', {
    label: 'Mahsulotlar / katalog', icon: 'cart', desc: 'Do\'kon: qidiruv, kategoriya, savat. Kurs va paketlar uchun ham',
    fields: [...HEAD, F.sel('mode', 'Tugma vazifasi', [['cart', 'Savatga qo\'shish (buyurtma)'], ['inquiry', 'So\'rov qoldirish (kurs, xizmat)'], ['brief', 'Buyurtma anketasini ochish (loyiha so\'rovi)']]), F.text('buttonText', 'Tugma matni', { max: 30, ph: 'Savatga' }),
      F.sel('columns', 'Ustunlar', [['3', '3 ta'], ['4', '4 ta'], ['2', '2 ta']]), F.tog('search', 'Qidiruv'), F.tog('filters', 'Kategoriya tugmalari'), F.tog('sort', 'Saralash'),
      F.list('items', 'Mahsulotlar', { title: 'name', fields: productFields, add: () => ({ id: uid(), name: 'Yangi mahsulot', price: 0, oldPrice: 0, category: '', badge: '', description: '', image: '', stock: '', active: true }), idKey: 'id' })],
    defaults: () => ({ eyebrow: 'Katalog', title: 'Mahsulotlar', text: 'Tanlang va buyurtma bering.', mode: 'cart', buttonText: '', columns: '3', search: true, filters: true, sort: true, items: [{ id: uid(), name: 'Birinchi mahsulot', price: 100000, oldPrice: 0, category: 'Asosiy', badge: 'YANGI', description: 'Mahsulot haqida qisqa tavsif.', image: '', stock: '', active: true }, { id: uid(), name: 'Ikkinchi mahsulot', price: 250000, oldPrice: 300000, category: 'Asosiy', badge: '', description: 'Mahsulot haqida qisqa tavsif.', image: '', stock: '', active: true }, { id: uid(), name: 'Uchinchi mahsulot', price: 0, oldPrice: 0, category: 'Qo\'shimcha', badge: '', description: 'Narxi kelishiladi.', image: '', stock: '', active: true }] }),
    render(sec) {
      const items = arr(sec.items).filter((p) => p.active !== false); if (!items.length) return '';
      const cats = [...new Set(items.map((p) => p.category).filter(Boolean))];
      const st = (shop[sec.id] = shop[sec.id] || { q: '', cat: '', sort: '' });
      const tools = (sec.search || (sec.filters && cats.length > 1) || sec.sort) ? `<div class="shop-tools rv">
        ${sec.search ? `<label class="tsearch">${icon('search')}<input data-inp="shopq" data-sec="${esc(sec.id)}" type="search" placeholder="Qidirish…" value="${esc(st.q)}" autocomplete="off"></label>` : ''}
        ${sec.filters && cats.length > 1 ? `<div class="chips" data-chips="${esc(sec.id)}"><button data-act="shop-cat" data-sec="${esc(sec.id)}" data-cat="" class="${st.cat ? '' : 'on'}">Hammasi</button>${cats.map((c) => `<button data-act="shop-cat" data-sec="${esc(sec.id)}" data-cat="${esc(c)}" class="${st.cat === c ? 'on' : ''}">${text(c)}</button>`).join('')}</div>` : ''}
        ${sec.sort ? `<select class="tsort" data-chg="shopsort" data-sec="${esc(sec.id)}" aria-label="Saralash"><option value="">Saralash</option><option value="asc">Arzonroq</option><option value="desc">Qimmatroq</option><option value="sale">Chegirmalar</option><option value="name">Nomi bo'yicha</option></select>` : ''}</div>` : '';
      return E.wrap(sec, `${E.head(sec)}${tools}<div class="pgrid cols-${esc(sec.columns || '3')}" id="grid-${esc(sec.id)}">${cards(sec)}</div><div class="pempty" id="empty-${esc(sec.id)}" hidden>${icon('search')}<p>Hech narsa topilmadi</p><span>Boshqa so'z yoki kategoriyani sinab ko'ring.</span></div>`);
    },
  });
  function filtered(sec) {
    const st = shop[sec.id] || {}; let it = arr(sec.items).filter((p) => p.active !== false);
    if (st.q) { const q = st.q.toLowerCase(); it = it.filter((p) => `${p.name} ${p.category || ''} ${p.description || ''}`.toLowerCase().includes(q)); }
    if (st.cat) it = it.filter((p) => p.category === st.cat);
    if (st.sort === 'asc') it = it.slice().sort((a, b) => (a.price || 1e15) - (b.price || 1e15));
    if (st.sort === 'desc') it = it.slice().sort((a, b) => (b.price || 0) - (a.price || 0));
    if (st.sort === 'sale') it = it.filter((p) => p.oldPrice > p.price && p.price > 0);
    if (st.sort === 'name') it = it.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return it;
  }
  function stockNote(p) { const s = p.stock; if (s === '' || s == null || Number(s) < 0) return ''; const n = Number(s); return n <= 0 ? '<span class="stk out">Tugagan</span>' : n <= 5 ? `<span class="stk low">Oxirgi ${n} dona</span>` : ''; }
  function actionBtn(sec, p, big) {
    const out = E.maxQty(p) <= 0 && (sec.mode || 'cart') === 'cart';
    if (out) return `<button class="btn ${big ? '' : 'sm'} dis" disabled>Tugagan</button>`;
    if ((sec.mode || 'cart') === 'brief') return `<button class="btn ${big ? '' : 'sm'}" data-act="brief-open" data-svc="${esc(p.id)}" data-name="${esc(p.name)}">${text(sec.buttonText || 'Buyurtma')} ${icon('arrow')}</button>`;
    if ((sec.mode || 'cart') === 'inquiry') return `<button class="btn ${big ? '' : 'sm'}" data-act="inq" data-name="${esc(p.name)}">${text(sec.buttonText || 'So\'rov qoldirish')}</button>`;
    return `<button class="btn ${big ? '' : 'sm'}" data-act="add" data-id="${esc(p.id)}">${icon('cart')} ${text(sec.buttonText || 'Savatga')}</button>`;
  }
  function cards(sec) {
    return filtered(sec).map((p, i) => {
      const off = p.oldPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
      return `<article class="pcard in ${p.badge ? 'pop' : ''}" style="--d:${(i % 6) * 0.05}s"><div class="pimg" data-act="qv" data-sec="${esc(sec.id)}" data-id="${esc(p.id)}">${imgUrl(p.image) ? E.img(p.image, p.name) : `<div class="ph">${E.initial(p.name)}</div>`}
        <div class="bdg">${p.badge ? `<span class="badge">${text(p.badge)}</span>` : ''}${off ? `<span class="badge sale">−${off}%</span>` : ''}</div><span class="qvb">${icon('eye')} Tezkor ko'rish</span></div>
        <div class="pb">${p.category ? `<span class="tag">${text(p.category)}</span>` : ''}<h3>${text(p.name)}</h3>${p.description ? `<p>${text(p.description)}</p>` : '<p></p>'}${stockNote(p)}
        <div class="prow"><div class="pr">${E.price(p)}</div>${actionBtn(sec, p)}</div></div></article>`;
    }).join('');
  }
  function refreshGrid(secId) {
    const sec = E.state().sections.find((s) => s.id === secId); if (!sec) return;
    const g = $('#grid-' + secId); if (!g) return;
    g.innerHTML = cards(sec); const none = !g.children.length; g.hidden = none; const em = $('#empty-' + secId); if (em) em.hidden = !none;
  }
  E.actions['shop-cat'] = (el) => { const id = el.dataset.sec; (shop[id] = shop[id] || {}).cat = el.dataset.cat; $$(`[data-chips="${id}"] button`).forEach((b) => b.classList.toggle('on', b === el)); refreshGrid(id); };
  E.changes['shopsort'] = (el) => { const id = el.dataset.sec; (shop[id] = shop[id] || {}).sort = el.value; refreshGrid(id); };
  E.inputs['shopq'] = (el) => { const id = el.dataset.sec; (shop[id] = shop[id] || {}).q = el.value.trim(); refreshGrid(id); };
  E.inputs['navsearch'] = (el) => {
    const sec = E.state().sections.find((s) => s.type === 'products' && s.enabled !== false); if (!sec) return;
    (shop[sec.id] = shop[sec.id] || {}).q = el.value.trim(); (shop[sec.id]).cat = ''; refreshGrid(sec.id);
    const si = $(`[data-inp="shopq"][data-sec="${sec.id}"]`); if (si) si.value = el.value; $$(`[data-chips="${sec.id}"] button`).forEach((b, i) => b.classList.toggle('on', i === 0));
    const s = document.getElementById(sec.id); if (s && el.value && s.getBoundingClientRect().top > innerHeight * 0.6) s.scrollIntoView({ behavior: 'smooth' });
  };
  E.actions['inq'] = (el) => { E.closeModal(); E.prefill(`Qiziqish: ${el.dataset.name}`); };
  E.actions['qv'] = (el) => {
    const sec = E.state().sections.find((s) => s.id === el.dataset.sec); const p = sec && arr(sec.items).find((x) => x.id === el.dataset.id); if (!p) return;
    const cart = (sec.mode || 'cart') === 'cart' && E.maxQty(p) > 0;
    E.openModal(`<div class="qv"><div class="qimg">${imgUrl(p.image) ? E.img(p.image, p.name) : `<div class="ph">${E.initial(p.name)}</div>`}${p.badge ? `<span class="badge">${text(p.badge)}</span>` : ''}</div>
      <div class="qinfo">${p.category ? `<span class="tag">${text(p.category)}</span>` : ''}<h3>${text(p.name)}</h3><div class="qprice">${E.price(p)}</div>${p.description ? `<p>${text(p.description)}</p>` : ''}${stockNote(p)}
      <div class="qrow">${cart ? `<div class="qty big"><button data-act="qv-dec" aria-label="Kamaytirish">−</button><span id="qvq">1</span><button data-act="qv-inc" aria-label="Ko'paytirish">+</button></div>` : ''}${cart ? `<button class="btn" data-focus data-act="qv-add" data-id="${esc(p.id)}">${icon('cart')} ${text(sec.buttonText || 'Savatga')}</button>` : actionBtn(sec, p, true)}</div></div></div>`, 'wide');
  };
  const qvn = () => $('#qvq');
  E.actions['qv-inc'] = () => { const n = qvn(); n.textContent = Math.min(99, +n.textContent + 1); };
  E.actions['qv-dec'] = () => { const n = qvn(); n.textContent = Math.max(1, +n.textContent - 1); };
  E.actions['qv-add'] = (el) => { if (E.addToCart(el.dataset.id, +qvn().textContent)) { E.closeModal(); E.toast('Savatga qo\'shildi'); } };

  /* =============== CATEGORIES =============== */
  define('categories', {
    label: 'Kategoriya kartochkalari', icon: 'layers', desc: 'Rasmli kategoriyalar: bosilsa katalog filtrlanadi',
    fields: [...HEAD, F.list('items', 'Kategoriyalar', { title: 'name', fields: [F.text('name', 'Kategoriya nomi (katalogdagi bilan bir xil)', { max: 60 }), F.img('image', 'Rasm')], add: () => ({ name: 'Yangi kategoriya', image: '' }), max: 8 })],
    defaults: () => ({ eyebrow: '', title: 'Kategoriyalar', text: '', items: [{ name: 'Asosiy', image: '' }, { name: 'Qo\'shimcha', image: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const target = E.state().sections.find((s) => s.type === 'products' && s.enabled !== false);
      return E.wrap(sec, `${E.head(sec)}<div class="cats">${it.map((c, i) => `<a class="cat rv" style="--d:${(i % 5) * 0.06}s" href="${target ? '#' + esc(target.id) : '#'}" data-act="catgo" data-cat="${esc(c.name)}">${imgUrl(c.image) ? E.img(c.image, c.name) : `<div class="ph">${E.initial(c.name)}</div>`}<span>${text(c.name)}</span></a>`).join('')}</div>`);
    },
  });
  E.actions['catgo'] = (el, e) => {
    const sec = E.state().sections.find((s) => s.type === 'products' && s.enabled !== false); if (!sec) return;
    e.preventDefault(); (shop[sec.id] = shop[sec.id] || {}).cat = el.dataset.cat; (shop[sec.id]).q = '';
    $$(`[data-chips="${sec.id}"] button`).forEach((b) => b.classList.toggle('on', b.dataset.cat === el.dataset.cat));
    const si = $(`[data-inp="shopq"][data-sec="${sec.id}"]`); if (si) si.value = '';
    refreshGrid(sec.id); document.getElementById(sec.id).scrollIntoView({ behavior: 'smooth' });
  };

  /* =============== MENU (restoran, salon narxlari) =============== */
  const menuCat = {};
  define('menu', {
    label: 'Menyu / narxlar ro\'yxati', icon: 'utensils', desc: 'Restoran menyusi yoki salon xizmatlari narxi, kategoriya bo\'yicha',
    fields: [...HEAD, F.sel('mode', 'Tugma vazifasi', [['cart', 'Savatga qo\'shish (buyurtma)'], ['none', 'Faqat ko\'rsatish']]),
      F.list('items', 'Pozitsiyalar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 100 }), F.num('price', 'Narxi'), F.text('category', 'Kategoriya', { max: 60 }), F.area('description', 'Tavsif (tarkibi, davomiyligi)', { max: 300, rows: 2 }), F.text('tag', 'Belgi (ixtiyoriy)', { max: 24, ph: 'Achchiq, Yangi, 60 daqiqa' }), F.img('image', 'Rasm'), F.tog('active', 'Ko\'rsatish')], add: () => ({ id: uid(), name: 'Yangi pozitsiya', price: 0, category: 'Asosiy', description: '', tag: '', image: '', active: true }), idKey: 'id' })],
    defaults: () => ({ eyebrow: 'Menyu', title: 'Bizning menyu', text: '', mode: 'none', items: [{ id: uid(), name: 'Birinchi taom', price: 40000, category: 'Asosiy', description: 'Tarkibi: ...', tag: '', image: '', active: true }, { id: uid(), name: 'Ikkinchi taom', price: 55000, category: 'Asosiy', description: 'Tarkibi: ...', tag: 'Yangi', image: '', active: true }] }),
    render(sec) {
      const items = arr(sec.items).filter((p) => p.active !== false); if (!items.length) return '';
      const cats = [...new Set(items.map((p) => p.category || 'Boshqa'))];
      const cur = menuCat[sec.id] && cats.includes(menuCat[sec.id]) ? menuCat[sec.id] : cats[0];
      return E.wrap(sec, `${E.head(sec)}${cats.length > 1 ? `<div class="chips rv" data-menutabs="${esc(sec.id)}">${cats.map((c) => `<button data-act="menu-cat" data-sec="${esc(sec.id)}" data-cat="${esc(c)}" class="${c === cur ? 'on' : ''}">${text(c)}</button>`).join('')}</div>` : ''}<div class="menu" id="menu-${esc(sec.id)}">${menuRows(sec, cur)}</div>`);
    },
  });
  function menuRows(sec, cat) {
    return arr(sec.items).filter((p) => p.active !== false && (p.category || 'Boshqa') === cat).map((p) => `<div class="mrow in">${imgUrl(p.image) ? `<div class="mimg2">${E.img(p.image, p.name)}</div>` : ''}<div class="mtx"><div class="mt"><b>${text(p.name)}</b><i></i><span class="mp">${p.price > 0 ? E.fmt(p.price) : ''}</span></div>${p.description ? `<p>${text(p.description)}</p>` : ''}${p.tag ? `<span class="mtag">${text(p.tag)}</span>` : ''}</div>${(sec.mode || 'cart') === 'cart' && p.price > 0 ? `<button class="addc" data-act="add" data-id="${esc(p.id)}" aria-label="Savatga qo'shish">${icon('plus')}</button>` : ''}</div>`).join('');
  }
  E.actions['menu-cat'] = (el) => { const id = el.dataset.sec; menuCat[id] = el.dataset.cat; $$(`[data-menutabs="${id}"] button`).forEach((b) => b.classList.toggle('on', b === el)); const sec = E.state().sections.find((s) => s.id === id); $('#menu-' + id).innerHTML = menuRows(sec, el.dataset.cat); };

  /* =============== GALLERY + LIGHTBOX =============== */
  define('gallery', {
    label: 'Galereya', icon: 'image', desc: 'Rasmlar: bosilsa kattalashadi',
    fields: [...HEAD, F.sel('layout', 'Ko\'rinish', [['masonry', 'Turli o\'lchamli'], ['grid', 'Teng kvadratlar']]), F.list('items', 'Rasmlar', { title: 'caption', fields: [F.img('image', 'Rasm'), F.text('caption', 'Izoh', { max: 100 })], add: () => ({ image: '', caption: '' }) })],
    defaults: () => ({ eyebrow: 'Galereya', title: 'Ishlarimizdan namunalar', text: '', layout: 'masonry', items: [{ image: '', caption: 'Birinchi rasm' }, { image: '', caption: 'Ikkinchi rasm' }, { image: '', caption: 'Uchinchi rasm' }] }),
    render(sec) {
      const all = arr(sec.items); if (!all.length) return '';
      let n = -1;
      return E.wrap(sec, `${E.head(sec)}<div class="gal g-${esc(sec.layout || 'masonry')}">${all.map((x, i) => imgUrl(x.image) ? `<button class="gi rv" style="--d:${(i % 6) * 0.05}s" data-act="lb" data-sec="${esc(sec.id)}" data-i="${++n}" aria-label="${esc(x.caption || 'Rasm')}">${E.img(x.image, x.caption)}${x.caption ? `<span>${text(x.caption)}</span>` : ''}</button>` : `<div class="gi rv" style="--d:${(i % 6) * 0.05}s"><div class="ph">${E.initial(x.caption)}</div></div>`).join('')}</div>`);
    },
  });
  function showLb(secId, i) {
    const sec = E.state().sections.find((s) => s.id === secId); const it = arr(sec && sec.items).filter((x) => imgUrl(x.image)); if (!it.length) return;
    i = (i + it.length) % it.length; const x = it[i];
    E.openModal(`<div class="lb"><img src="${esc(imgUrl(x.image))}" alt="${esc(x.caption || '')}">${x.caption ? `<p>${text(x.caption)}</p>` : ''}${it.length > 1 ? `<button class="lbn prev" data-act="lb" data-sec="${esc(secId)}" data-i="${i - 1}" aria-label="Oldingi">${icon('left')}</button><button class="lbn next" data-act="lb" data-sec="${esc(secId)}" data-i="${i + 1}" aria-label="Keyingi">${icon('right')}</button>` : ''}</div>`, 'lbox');
    E.modalKey = (e) => { if (e.key === 'ArrowLeft') showLb(secId, i - 1); if (e.key === 'ArrowRight') showLb(secId, i + 1); };
  }
  E.actions['lb'] = (el) => showLb(el.dataset.sec, +el.dataset.i);

  /* =============== PROJECTS (portfolio) =============== */
  const projTag = {};
  define('projects', {
    label: 'Loyihalar (portfolio)', icon: 'briefcase', desc: 'Ishlaringiz: rasm, teglar, batafsil oyna',
    fields: [...HEAD, F.sel('layout', 'Ko\'rinish', [['grid', 'Teng kartochkalar'], ['masonry', 'Turli o\'lchamli (rasmga qarab)']]), F.tog('filters', 'Teg bo\'yicha filtr'),
      F.list('items', 'Loyihalar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 100 }), F.text('tags', 'Teglar (vergul bilan)', { max: 120, ph: 'Brending, Veb, Logo' }), F.text('year', 'Yil', { max: 10 }), F.img('image', 'Rasm'), F.area('description', 'Tavsif', { max: 800, rows: 4 }), F.text('link', 'Havola', { max: 200, ph: 'https://…' }), F.text('linkText', 'Havola matni', { max: 30, ph: 'Saytni ochish' })], add: () => ({ title: 'Yangi loyiha', tags: '', year: String(new Date().getFullYear()), image: '', description: '', link: '', linkText: '' }) })],
    defaults: () => ({ eyebrow: 'Portfolio', title: 'Tanlangan loyihalar', text: '', layout: 'grid', filters: true, items: [{ title: 'Birinchi loyiha', tags: 'Veb', year: '2025', image: '', description: 'Loyiha haqida: vazifa, yechim va natija.', link: '', linkText: '' }, { title: 'Ikkinchi loyiha', tags: 'Dizayn', year: '2025', image: '', description: 'Loyiha haqida: vazifa, yechim va natija.', link: '', linkText: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const tags = [...new Set(it.flatMap((p) => String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean)))];
      const cur = projTag[sec.id] && tags.includes(projTag[sec.id]) ? projTag[sec.id] : '';
      return E.wrap(sec, `${E.head(sec)}${sec.filters && tags.length > 1 ? `<div class="chips rv" data-ptags="${esc(sec.id)}"><button data-act="proj-tag" data-sec="${esc(sec.id)}" data-tag="" class="${cur ? '' : 'on'}">Hammasi</button>${tags.map((t) => `<button data-act="proj-tag" data-sec="${esc(sec.id)}" data-tag="${esc(t)}" class="${t === cur ? 'on' : ''}">${text(t)}</button>`).join('')}</div>` : ''}<div class="proj p-${esc(sec.layout || 'grid')}" id="proj-${esc(sec.id)}">${projCards(sec, cur)}</div>`);
    },
  });
  function projCards(sec, tag) {
    return arr(sec.items).map((p, i) => ({ p, i })).filter(({ p }) => !tag || String(p.tags || '').split(',').map((t) => t.trim()).includes(tag)).map(({ p, i }) => `<article class="pj in" data-act="proj" data-sec="${esc(sec.id)}" data-i="${i}" tabindex="0">${imgUrl(p.image) ? E.img(p.image, p.title) : `<div class="ph">${E.initial(p.title)}</div>`}<div class="pjo"><div><h3>${text(p.title)}</h3><span>${text(String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean).join(' · '))}${p.year ? ` · ${text(p.year)}` : ''}</span></div><i class="pja">${icon('external')}</i></div></article>`).join('');
  }
  E.actions['proj-tag'] = (el) => { const id = el.dataset.sec; projTag[id] = el.dataset.tag; $$(`[data-ptags="${id}"] button`).forEach((b) => b.classList.toggle('on', b === el)); const sec = E.state().sections.find((s) => s.id === id); $('#proj-' + id).innerHTML = projCards(sec, el.dataset.tag); };
  E.actions['proj'] = (el) => {
    const sec = E.state().sections.find((s) => s.id === el.dataset.sec); const p = sec && arr(sec.items)[+el.dataset.i]; if (!p) return;
    const l = linkUrl(p.link);
    E.openModal(`<div class="pd">${imgUrl(p.image) ? `<div class="pdi">${E.img(p.image, p.title)}</div>` : ''}<div class="pdt"><span class="tag">${text(String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean).join(' · '))}${p.year ? ` · ${text(p.year)}` : ''}</span><h3>${text(p.title)}</h3><p>${text(p.description).replace(/\n/g, '<br>')}</p>${l ? `<a class="btn" data-focus href="${esc(l)}" target="_blank" rel="noopener">${text(p.linkText || 'Ochish')} ${icon('external')}</a>` : ''}</div></div>`, 'wide');
  };

  /* =============== SKILLS =============== */
  define('skills', {
    label: 'Ko\'nikmalar', icon: 'zap', desc: 'Ko\'nikma darajalari: chiziqlar yoki teglar',
    fields: [...HEAD, F.sel('layout', 'Ko\'rinish', [['bars', 'Chiziqlar'], ['tags', 'Teglar']]), F.list('items', 'Ko\'nikmalar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.num('level', 'Daraja (0–100)', { min: 0, max: 100 })], add: () => ({ name: 'Yangi ko\'nikma', level: 80 }) })],
    defaults: () => ({ eyebrow: 'Ko\'nikmalar', title: 'Nimalarni bilaman', text: '', layout: 'bars', items: [{ name: 'Birinchi', level: 90 }, { name: 'Ikkinchi', level: 80 }, { name: 'Uchinchi', level: 70 }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const body = sec.layout === 'tags' ? `<div class="tagsw">${it.map((s, i) => `<span class="stag rv" style="--d:${(i % 8) * 0.04}s">${text(s.name)}</span>`).join('')}</div>` : `<div class="bars">${it.map((s, i) => `<div class="bar2 rv" style="--d:${(i % 6) * 0.06}s"><div class="bl"><b>${text(s.name)}</b><span>${Math.max(0, Math.min(100, Number(s.level) || 0))}%</span></div><div class="bt"><i style="--lv:${Math.max(0, Math.min(100, Number(s.level) || 0))}%"></i></div></div>`).join('')}</div>`;
      return E.wrap(sec, `${E.head(sec)}${body}`);
    },
  });

  /* =============== TIMELINE =============== */
  define('timeline', {
    label: 'Tajriba / vaqt chizig\'i', icon: 'clock', desc: 'Ish tajribasi, ta\'lim yoki kompaniya tarixi',
    fields: [...HEAD, F.list('items', 'Bosqichlar', { title: 'title', fields: [F.text('period', 'Davr', { max: 30, ph: '2022 – hozir' }), F.text('title', 'Lavozim / nomi', { max: 100 }), F.text('place', 'Joy', { max: 100 }), F.area('text', 'Tavsif', { max: 400, rows: 3 })], add: () => ({ period: '', title: 'Yangi bosqich', place: '', text: '' }) })],
    defaults: () => ({ eyebrow: 'Tajriba', title: 'Yo\'lim', text: '', items: [{ period: '2023 – hozir', title: 'Lavozim', place: 'Kompaniya', text: 'Nima bilan shug\'ullandim.' }, { period: '2020 – 2023', title: 'Oldingi lavozim', place: 'Kompaniya', text: 'Nima bilan shug\'ullandim.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="tl2">${it.map((t, i) => `<div class="ti rv" style="--d:${(i % 4) * 0.07}s"><div class="tp">${text(t.period)}</div><div class="td"></div><div class="tc"><h3>${text(t.title)}</h3>${t.place ? `<span class="tplace">${text(t.place)}</span>` : ''}${t.text ? `<p>${text(t.text)}</p>` : ''}</div></div>`).join('')}</div>`);
    },
  });

  /* =============== TEAM =============== */
  define('team', {
    label: 'Jamoa / ustalar', icon: 'users', desc: 'Odamlar: rasm, lavozim, qisqa tavsif',
    fields: [...HEAD, F.list('items', 'Odamlar', { title: 'name', fields: [F.text('name', 'Ism', { max: 60 }), F.text('role', 'Lavozim', { max: 80 }), F.img('image', 'Rasm'), F.area('text', 'Qisqa tavsif', { max: 200, rows: 2 })], add: () => ({ name: 'Yangi xodim', role: '', image: '', text: '' }) })],
    defaults: () => ({ eyebrow: 'Jamoa', title: 'Bizning jamoa', text: '', items: [{ name: 'Ism Familiya', role: 'Lavozim', image: '', text: '' }, { name: 'Ism Familiya', role: 'Lavozim', image: '', text: '' }, { name: 'Ism Familiya', role: 'Lavozim', image: '', text: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="team">${it.map((p, i) => `<div class="tm rv" style="--d:${(i % 4) * 0.07}s"><div class="tph">${imgUrl(p.image) ? E.img(p.image, p.name) : `<div class="ph">${E.initial(p.name)}</div>`}</div><h3>${text(p.name)}</h3>${p.role ? `<span class="role">${text(p.role)}</span>` : ''}${p.text ? `<p>${text(p.text)}</p>` : ''}</div>`).join('')}</div>`);
    },
  });

  /* =============== PRICING (tariflar) =============== */
  define('pricing', {
    label: 'Tariflar', icon: 'dollar', desc: 'Narx rejalari: xizmat paketlari, tanlansa so\'rov formasi ochiladi',
    fields: [...HEAD, F.list('items', 'Tariflar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 60 }), F.text('price', 'Narx', { max: 40, ph: '500 000 so\'m' }), F.text('period', 'Davr', { max: 30, ph: 'oyiga, bir martalik' }), F.lines('features', 'Nimalar kiradi (har qatorga bittadan)'), F.tog('popular', 'Tavsiya etiladi'), F.text('cta', 'Tugma matni', { max: 30, ph: 'Tanlash' })], add: () => ({ name: 'Yangi tarif', price: '', period: '', features: [], popular: false, cta: 'Tanlash' }) })],
    defaults: () => ({ eyebrow: 'Narxlar', title: 'Tariflar', text: '', items: [{ name: 'Start', price: '500 000 so\'m', period: '', features: ['Birinchi imkoniyat', 'Ikkinchi imkoniyat'], popular: false, cta: 'Tanlash' }, { name: 'Standart', price: '1 000 000 so\'m', period: '', features: ['Hammasi Start dagidek', 'Qo\'shimcha imkoniyat'], popular: true, cta: 'Tanlash' }, { name: 'Premium', price: '2 000 000 so\'m', period: '', features: ['Hammasi Standart dagidek', 'Shaxsiy menejer'], popular: false, cta: 'Tanlash' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="plans">${it.map((p, i) => `<div class="plan rv ${p.popular ? 'pop' : ''}" style="--d:${i * 0.08}s">${p.popular ? '<span class="badge">TAVSIYA</span>' : ''}<h3>${text(p.name)}</h3><div class="pamount">${text(p.price)}${p.period ? `<small>${text(p.period)}</small>` : ''}</div><ul>${arr(p.features).filter(Boolean).map((f) => `<li>${icon('check')}<span>${text(f)}</span></li>`).join('')}</ul><button class="btn ${p.popular ? '' : 'ghost'}" data-act="inq" data-name="Tarif: ${esc(p.name)}">${text(p.cta || 'Tanlash')}</button></div>`).join('')}</div>`);
    },
  });

  /* =============== TESTIMONIALS =============== */
  define('testimonials', {
    label: 'Mijozlar fikri', icon: 'quote', desc: 'Sharhlar: matn, ism, rasm, reyting',
    fields: [...HEAD, F.sel('layout', "Ko'rinish", [['grid', 'Kartochkalar'], ['wall', 'Harakatlanuvchi devor']]), F.list('items', 'Sharhlar', { title: 'name', fields: [F.area('text', 'Sharh', { max: 400, rows: 3 }), F.text('name', 'Ism', { max: 60 }), F.text('role', 'Kim ekani', { max: 80 }), F.img('image', 'Rasm'), F.num('stars', 'Reyting (1–5)', { min: 0, max: 5 })], add: () => ({ text: '', name: 'Mijoz ismi', role: '', image: '', stars: 5 }) })],
    defaults: () => ({ eyebrow: 'Sharhlar', title: 'Mijozlar nima deydi', text: '', items: [{ text: 'Juda yoqdi! Hammasi tez va sifatli bajarildi.', name: 'Mijoz ismi', role: 'Mijoz', image: '', stars: 5 }, { text: 'Tavsiya qilaman, ishonchli jamoa.', name: 'Mijoz ismi', role: 'Mijoz', image: '', stars: 5 }, { text: 'Narx va sifat mos keldi.', name: 'Mijoz ismi', role: 'Mijoz', image: '', stars: 5 }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      if (sec.layout === 'wall') {
        const one = (t) => `<figure class="tt">${Number(t.stars) > 0 ? `<div class="stars">${Array.from({ length: Math.min(5, Number(t.stars)) }, () => icon('star')).join('')}</div>` : ''}<blockquote>${text(t.text)}</blockquote><figcaption><div class="av">${imgUrl(t.image) ? E.img(t.image, t.name) : E.initial(t.name)}</div><div><b>${text(t.name)}</b>${t.role ? `<span>${text(t.role)}</span>` : ''}</div></figcaption></figure>`;
        const half = Math.ceil(it.length / 2), a = it.slice(0, half), b = it.slice(half).length ? it.slice(half) : it;
        const row = (list) => `<div class="row">${list.concat(list, list, list).map(one).join('')}</div>`;
        return `<section class="sec s-testimonials" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap">${E.head(sec)}</div><div class="wall">${row(a)}${row(b)}</div></section>`;
      }
      return E.wrap(sec, `${E.head(sec)}<div class="tst">${it.map((t, i) => `<figure class="tt rv" style="--d:${(i % 3) * 0.08}s">${Number(t.stars) > 0 ? `<div class="stars" aria-label="${Number(t.stars)} yulduz">${Array.from({ length: Math.min(5, Number(t.stars)) }, () => icon('star')).join('')}</div>` : ''}<blockquote>${text(t.text)}</blockquote><figcaption><div class="av">${imgUrl(t.image) ? E.img(t.image, t.name) : E.initial(t.name)}</div><div><b>${text(t.name)}</b>${t.role ? `<span>${text(t.role)}</span>` : ''}</div></figcaption></figure>`).join('')}</div>`);
    },
  });

  /* =============== FAQ =============== */
  define('faq', {
    label: 'Savol-javoblar', icon: 'help', desc: 'Ko\'p so\'raladigan savollar',
    fields: [...HEAD, F.list('items', 'Savollar', { title: 'q', fields: [F.text('q', 'Savol', { max: 160 }), F.area('a', 'Javob', { max: 600, rows: 3 })], add: () => ({ q: 'Yangi savol?', a: '' }) })],
    defaults: () => ({ eyebrow: 'Savollar', title: 'Ko\'p so\'raladigan savollar', text: '', items: [{ q: 'Birinchi savol?', a: 'Javob shu yerda.' }, { q: 'Ikkinchi savol?', a: 'Javob shu yerda.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `<div class="faqw">${E.head(sec)}<div class="faq">${it.map((f, i) => `<details class="fi rv" style="--d:${(i % 5) * 0.05}s"><summary>${text(f.q)}<i>${icon('plus')}</i></summary><p>${text(f.a).replace(/\n/g, '<br>')}</p></details>`).join('')}</div></div>`);
    },
  });

  /* =============== CTA =============== */
  define('cta', {
    label: 'Taklif banneri', icon: 'gift', desc: 'Chiroyli banner: aksiya, taymer va tugma',
    fields: [F.text('eyebrow', 'Kichik yozuv', { max: 40 }), F.text('title', 'Sarlavha', { max: 120 }), F.area('text', 'Tavsif', { max: 300, rows: 2 }), F.text('buttonText', 'Tugma matni', { max: 40 }), F.link('buttonLink', 'Tugma havolasi'), F.text('countdownTo', 'Taymer tugash sanasi', { max: 30, ph: '2026-12-31', hint: 'Bo\'sh qoldirsangiz taymer ko\'rinmaydi. Format: YYYY-MM-DD' }), F.img('image', 'Rasm (ixtiyoriy)'), F.tog('fx', 'Animatsion nurli fon')],
    defaults: () => ({ fx: false, eyebrow: 'Maxsus taklif', title: 'Aksiya davom etmoqda', text: 'Taklifdan foydalanib qoling.', buttonText: 'Ko\'rish', buttonLink: '#', countdownTo: '', image: '' }),
    render(sec) {
      const until = sec.countdownTo ? (/^\d{4}-\d{2}-\d{2}$/.test(sec.countdownTo) ? sec.countdownTo + 'T23:59:59' : sec.countdownTo) : '';
      if (sec.fx) return E.wrap(sec, `<div class="ctab fxb rv"><div class="hfx" data-fx="aurora"></div><div class="ctx">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub" style="margin-inline:auto">${text(sec.text)}</p>` : ''}${until ? `<div class="count" data-until="${esc(until)}"></div>` : ''}<div style="margin-top:24px">${btn(sec.buttonText, sec.buttonLink, 'mag')}</div></div></div>`, 'tight');
      return E.wrap(sec, `<div class="ctab rv ${imgUrl(sec.image) ? 'hasimg' : ''}"><div class="ctx">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}${until ? `<div class="count" data-until="${esc(until)}"></div>` : ''}${btn(sec.buttonText, sec.buttonLink, 'mag')}</div>${imgUrl(sec.image) ? `<div class="cimg">${E.img(sec.image, '')}</div>` : ''}</div>`, 'tight');
    },
  });

  /* =============== CARDS (havolali kartochkalar / shablonlar vitrinasi) =============== */
  define('cards', {
    label: 'Havolali kartochkalar', icon: 'layers', desc: 'Rasmli kartochkalar: bosilsa havolaga o\'tadi',
    fields: [...HEAD, F.list('items', 'Kartochkalar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 80 }), F.text('badge', 'Belgi', { max: 24 }), F.area('text', 'Tavsif', { max: 200, rows: 2 }), F.img('image', 'Rasm'), F.link('link', 'Havola')], add: () => ({ title: 'Yangi', badge: '', text: '', image: '', link: '#' }) })],
    defaults: () => ({ eyebrow: '', title: 'Tanlang', text: '', items: [{ title: 'Birinchi', badge: '', text: '', image: '', link: '#' }, { title: 'Ikkinchi', badge: '', text: '', image: '', link: '#' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="lcards">${it.map((c, i) => `<a class="lc rv" style="--d:${(i % 4) * 0.07}s" href="${esc(linkUrl(c.link) || '#')}"><div class="lci">${imgUrl(c.image) ? E.img(c.image, c.title) : `<div class="ph">${E.initial(c.title)}</div>`}${c.badge ? `<span class="badge">${text(c.badge)}</span>` : ''}</div><div class="lct"><h3>${text(c.title)}</h3>${c.text ? `<p>${text(c.text)}</p>` : ''}<span class="more">Ko'rish ${icon('arrow')}</span></div></a>`).join('')}</div>`);
    },
  });


  /* =============== BRIEF (buyurtma anketasi) =============== */
  const SVC_ICONS = ['globe', 'cart', 'send', 'phone', 'design', 'tool', 'code', 'zap', 'shield', 'chart', 'users', 'star'];
  define('brief', {
    label: 'Buyurtma anketasi', icon: 'edit', desc: "Mijozning xohishlarini bosqichma-bosqich so'raydigan anketa: xizmat, imkoniyatlar, dizayn, byudjet va aloqa",
    fields: [...HEAD, F.text('buttonText', 'Tugma matni', { max: 40, ph: "Anketani to'ldirish" }), F.text('promise', "Va'da (tugma ostida)", { max: 120, ph: "15 daqiqada aloqaga chiqamiz" }),
      F.lines('usp', 'Afzalliklar (har qatorga bittadan)'), F.tog('showEstimate', "Taxminiy narxni ko'rsatish"),
      F.list('services', 'Xizmat turlari', { title: 'name', fields: [F.text('name', 'Nomi', { max: 60 }), F.text('desc', 'Qisqa tavsif', { max: 120 }), F.icon('icon', 'Ikonka'), F.num('price', "Boshlang'ich narx", { min: 0, hint: "Taxminiy narx hisobi uchun" }), F.text('days', 'Muddat', { max: 30, ph: '5–10 kun' })], add: () => ({ id: uid(), name: 'Yangi xizmat', desc: '', icon: 'star', price: 0, days: '' }), idKey: 'id' }),
      F.list('features', 'Qo\'shimcha imkoniyatlar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 60 }), F.num('price', "Qo'shimcha narx", { min: 0 }), F.text('types', 'Qaysi xizmatlar uchun (id lar, vergul bilan)', { max: 120, hint: "Bo'sh qoldirsangiz hammasi uchun ko'rinadi" })], add: () => ({ name: 'Yangi imkoniyat', price: 0, types: '' }) }),
      F.list('styles', 'Dizayn uslublari', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.text('desc', 'Tavsif', { max: 80 }), F.text('c1', '1-rang', { max: 9, ph: '#4f46e5' }), F.text('c2', '2-rang', { max: 9, ph: '#06b6d4' })], add: () => ({ name: 'Yangi uslub', desc: '', c1: '#4f46e5', c2: '#06b6d4' }) }),
      F.list('references', 'Namuna saytlar (rasm bilan)', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.img('image', 'Rasm')], add: () => ({ name: 'Namuna', image: '' }) }),
      F.lines('goals', 'Maqsadlar'), F.lines('budgets', 'Byudjet variantlari'), F.lines('deadlines', 'Muddat variantlari'), F.lines('languages', 'Sayt tillari'), F.lines('methods', "Aloqa usullari"), F.lines('times', 'Qulay vaqtlar'), F.lines('fieldsList', 'Faoliyat sohalari (tavsiyalar)'),
      F.text('successTitle', 'Muvaffaqiyat sarlavhasi', { max: 80 }), F.area('successText', 'Muvaffaqiyat matni', { max: 300, rows: 3 })],
    defaults: () => ({ eyebrow: 'Loyihani boshlang', title: 'Xohishlaringizni ayting, biz amalga oshiramiz', text: "3 daqiqalik anketa: nima kerakligini, qanday ko'rinishni va qancha byudjetni tanlaysiz. Qolganini biz hal qilamiz.", buttonText: "Anketani to'ldirish", promise: '15 daqiqada aloqaga chiqamiz', showEstimate: true,
      usp: ["Aniq narx va muddat: suhbatdan keyin shartnoma", "Bepul maslahat va g'oyalar", "Natijaga kafolat"],
      services: [{ id: 'sayt', name: 'Veb-sayt', desc: 'Vizitka, korporativ yoki landing sahifa', icon: 'globe', price: 2500000, days: '5–10 kun' }, { id: 'dokon', name: "Onlayn do'kon", desc: "Katalog, savat va to'lov bilan", icon: 'cart', price: 6900000, days: '2–3 hafta' }, { id: 'bot', name: 'Telegram bot', desc: 'Buyurtma va aloqani avtomatlashtirish', icon: 'send', price: 3200000, days: '1–2 hafta' }],
      features: [{ name: 'Admin panel', price: 800000, types: '' }, { name: "Ko'p tillilik", price: 500000, types: '' }, { name: 'SEO sozlash', price: 400000, types: 'sayt,dokon' }],
      styles: [{ name: 'Zamonaviy', desc: 'Toza va yorqin', c1: '#4f46e5', c2: '#06b6d4' }, { name: 'Minimal', desc: 'Oq-qora, aniq', c1: '#111111', c2: '#e8452c' }, { name: 'Premium', desc: 'Qora va oltin', c1: '#d4a64a', c2: '#17110a' }],
      references: [], goals: ["Ko'proq mijoz jalb qilish", 'Onlayn sotuvni yo\'lga qo\'yish', 'Brend va ishonchni oshirish', 'Jarayonlarni avtomatlashtirish'],
      budgets: ["1–3 mln so'm", "3–7 mln so'm", "7–15 mln so'm", "15 mln so'mdan ko'p", "Maslahat kerak"], deadlines: ['Shoshilinch (1 hafta)', '2–3 hafta', '1 oy', 'Shoshilmayman'], languages: ["O'zbekcha", 'Ruscha', 'Inglizcha'],
      methods: ['Telefon', 'Telegram', 'WhatsApp', 'Email'], times: ['9:00–12:00', '12:00–17:00', '17:00–20:00', 'Istalgan vaqt'], fieldsList: ['Savdo', 'Restoran / kafe', "Ta'lim", 'Tibbiyot', "Go'zallik", 'Qurilish', 'Transport', 'Xizmat ko\'rsatish', 'IT'],
      successTitle: "So'rovingiz qabul qilindi!", successText: "Mutaxassisimiz ish vaqtida 15–30 daqiqa ichida, boshqa vaqtda keyingi ish kuni ertalab siz bilan bog'lanadi." }),
    render(sec) {
      const usp = arr(sec.usp).filter(Boolean);
      const steps = [['edit', "Anketa to'ldirasiz", '3 daqiqa'], ['tel', "Biz aloqaga chiqamiz", sec.promise || '15–30 daqiqa'], ['check', 'Narx va muddat kelishiladi', 'Bepul maslahat'], ['zap', 'Ish boshlanadi', "Har kuni hisobot"]];
      return E.wrap(sec, `<div class="briefb rv"><div class="bfl">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}
        ${usp.length ? `<ul class="pts">${usp.map((u) => `<li>${icon('check')}<span>${text(u)}</span></li>`).join('')}</ul>` : ''}
        <div class="bcta"><button class="btn mag" data-act="brief-open">${text(sec.buttonText || "Anketani to'ldirish")} ${icon('arrow')}</button>${sec.promise ? `<span class="prom">${icon('clock')} ${text(sec.promise)}</span>` : ''}</div></div>
        <div class="bsteps2">${steps.map(([i, t, d], k) => `<div class="bs2"><span class="n">${k + 1}</span><div><b>${text(t)}</b><small>${text(d)}</small></div><em>${icon(i)}</em></div>`).join('')}</div></div>`, 'tight');
    },
  });

  /* =============== CONTACT =============== */
  define('contact', {
    label: 'Aloqa va forma', icon: 'mail', desc: 'Aloqa ma\'lumotlari va xabar / bron / buyurtma formasi',
    fields: [...HEAD, F.sel('form', 'Forma turi', [['message', 'Oddiy xabar'], ['booking', 'Bron / yozilish (sana va vaqt bilan)'], ['order', 'Buyurtma (savat bilan)'], ['none', 'Forma yo\'q (faqat aloqa)']]),
      F.lines('serviceOptions', 'Xizmat ro\'yxati (bron uchun)', { show: (s) => s.form === 'booking', hint: 'Har bir qatorga bitta xizmat' }), F.tog('askGuests', 'Mehmonlar sonini so\'rash', { show: (s) => s.form === 'booking' }),
      F.tog('askAddress', 'Yetkazib berish manzilini so\'rash', { show: (s) => s.form === 'order' }), F.lines('payOptions', 'To\'lov usullari', { show: (s) => s.form === 'order', hint: 'Har bir qatorga bittadan' }),
      F.text('submitText', 'Tugma matni', { max: 40 }), F.text('mapUrl', 'Xarita havolasi', { max: 300, ph: 'https://maps.google.com/…' })],
    defaults: () => ({ eyebrow: 'Aloqa', title: 'Biz bilan bog\'laning', text: 'Raqamingizni qoldiring, tez orada aloqaga chiqamiz.', form: 'message', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Karta orqali'], submitText: '', mapUrl: '' }),
    render(sec, S) {
      const c = S.contacts || {}, rows = [];
      if (c.phone) rows.push(['tel', `<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${text(c.phone)}</a>`, 'Telefon']);
      if (c.email) rows.push(['mail', `<a href="mailto:${esc(c.email)}">${text(c.email)}</a>`, 'Email']);
      if (c.address) rows.push(['pin', text(c.address), 'Manzil']);
      if (c.hours) rows.push(['clock', text(c.hours), 'Ish vaqti']);
      if (c.telegram) { const u = String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); rows.push(['send', `<a href="https://t.me/${esc(u)}" target="_blank" rel="noopener">@${text(u)}</a>`, 'Telegram']); }
      if (c.instagram) { const u = String(c.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, ''); rows.push(['insta', `<a href="https://instagram.com/${esc(u)}" target="_blank" rel="noopener">@${text(u)}</a>`, 'Instagram']); }
      const form = sec.form || 'message';
      const info = `<div><span class="eyebrow">${text(sec.eyebrow)}</span><h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}<ul class="info">${rows.map(([i, h, l]) => `<li><em>${icon(i)}</em><span><small>${l}</small>${h}</span></li>`).join('')}</ul>${linkUrl(sec.mapUrl) ? `<a class="btn ghost sm" href="${esc(linkUrl(sec.mapUrl))}" target="_blank" rel="noopener">${icon('pin')} Xaritada ko'rish</a>` : ''}</div>`;
      const sel = (n, l, opts, label) => `<div class="fld sel"><select name="${n}" data-label="${esc(label || l)}">${opts.map((o) => `<option>${text(o)}</option>`).join('')}</select><label>${l}</label></div>`;
      const today = new Date().toISOString().slice(0, 10);
      let fields = `<div class="fld"><input name="name" placeholder=" " maxlength="100" autocomplete="name"><label>Ismingiz</label></div><div class="fld"><input name="phone" placeholder=" " maxlength="40" inputmode="tel" autocomplete="tel"><label>Telefon raqamingiz</label></div>`;
      if (form === 'booking') {
        const so = arr(sec.serviceOptions).filter(Boolean);
        fields += `${so.length ? sel('service', 'Xizmat', so, 'Xizmat') : ''}<div class="row2"><div class="fld dt"><input type="date" name="date" min="${today}" data-label="Sana"><label>Sana</label></div><div class="fld dt"><input type="time" name="time" data-label="Vaqt"><label>Vaqt</label></div></div>${sec.askGuests ? sel('guests', 'Mehmonlar soni', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], 'Mehmonlar soni') : ''}`;
      }
      if (form === 'order') {
        const pay = arr(sec.payOptions).filter(Boolean);
        fields += `${sec.askAddress ? `${sel('delivery', 'Qabul qilish usuli', ['Yetkazib berish', 'Olib ketish'], 'Qabul qilish usuli')}<div class="fld" data-addr><textarea name="address" rows="2" placeholder=" " data-label="Manzil"></textarea><label>Yetkazib berish manzili</label></div>` : ''}${pay.length ? sel('pay', 'To\'lov usuli', pay, 'To\'lov usuli') : ''}`;
      }
      fields += `<div class="fld"><textarea name="message" rows="3" placeholder=" "></textarea><label>${form === 'order' ? 'Izoh (ixtiyoriy)' : form === 'booking' ? 'Qo\'shimcha izoh' : 'Xabaringiz'}</label></div>`;
      const submit = sec.submitText || (form === 'booking' ? 'Yozilish' : form === 'order' ? 'Buyurtma berish' : 'Yuborish');
      const formH = form === 'none' ? '' : `<div class="fbox"><form id="contactForm" data-kind="${esc(form)}" novalidate>${form === 'order' ? '<div data-cartsum></div>' : ''}${fields}<div class="fmsg" role="alert"></div><button class="btn full" type="submit">${text(submit)} ${icon('arrow')}</button></form></div>`;
      return E.wrap(sec, `<div class="cbox rv ${form === 'none' ? 'one' : ''}">${info}${formH}</div>`);
    },
  });
  // Buyurtma formasida: "Olib ketish" tanlansa manzil maydoni yashirinadi
  document.addEventListener('change', (e) => {
    const s = e.target; if (!s || s.name !== 'delivery') return;
    const a = s.form.querySelector('[data-addr]'); if (a) a.hidden = s.value === 'Olib ketish';
  });
})();
