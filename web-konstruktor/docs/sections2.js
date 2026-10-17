'use strict';
// Yangi avlod bo'limlari: bayonot, bento, xizmatlar ro'yxati, gorizontal vitrina, logolar,
// rasm+matn qatorlari, video, xarita, oldin/keyin. sections.js dan keyin yuklanadi.
(function () {
  const E = window.E;
  const { esc, text, imgUrl, linkUrl, icon } = E;
  const F = E.F;
  const HEAD = [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 100, hint: "So'zni *yulduzcha* ichiga olsangiz, nafis kursiv bo'ladi." }), F.area('text', 'Tavsif', { max: 300, rows: 2 })];
  const define = (type, def) => { E.sections[type] = def; E.order.push(type); };
  const arr = (a) => (Array.isArray(a) ? a : []);
  const btn = (t, l, cls) => (t ? `<a class="btn ${cls || ''}" href="${esc(linkUrl(l) || '#')}">${text(t)}<span class="bi">${icon('arrow')}</span></a>` : '');
  const rich = (v) => E.rich(v);
  const num2 = (i) => String(i + 1).padStart(2, '0');
  const mkLink = (u) => esc(linkUrl(u) || '#');

  /* =============== BAYONOT (scroll bilan yonadigan katta matn) =============== */
  define('statement', {
    label: 'Katta bayonot', icon: 'quote', desc: "Katta matn: sahifa aylantirilganda so'zlar birma-bir yonadi",
    fields: [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.area('text', 'Matn', { max: 420, rows: 4, hint: "So'zni *yulduzcha* ichiga olsangiz, nafis kursiv bo'ladi." }),
      F.text('author', 'Muallif (ixtiyoriy)', { max: 60 }), F.text('role', 'Lavozimi', { max: 80 }), F.img('image', 'Muallif rasmi'), F.text('buttonText', 'Tugma matni', { max: 40 }), F.link('buttonLink', 'Tugma havolasi')],
    defaults: () => ({ eyebrow: 'Biz haqimizda', text: "Biz oddiy *saytlar* emas, mijozlaringizni egaga aylantiradigan *raqamli tajriba* yaratamiz.", author: '', role: '', image: '', buttonText: '', buttonLink: '#' }),
    render(sec) {
      if (!sec.text) return '';
      const parts = String(sec.text).split(/(\*[^*]+\*)/).filter(Boolean).map((seg) => {
        const em = /^\*[^*]+\*$/.test(seg); const raw = em ? seg.slice(1, -1) : seg; const w = raw.split(/\s+/).filter(Boolean).map((x) => `<span class="stw">${text(x)}</span>`).join(' ');
        return em ? `<em>${w}</em>` : (/^\s/.test(raw) ? ' ' : '') + w + (/\s$/.test(raw) ? ' ' : '');
      }).join('');
      const foot = (sec.author || sec.buttonText) ? `<div class="st-foot">${sec.author ? `<div class="who">${imgUrl(sec.image) ? E.img(sec.image, sec.author) : ''}<span><b>${text(sec.author)}</b>${text(sec.role)}</span></div>` : ''}${btn(sec.buttonText, sec.buttonLink, 'ghost')}</div>` : '';
      return E.wrap(sec, `${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span><br><br>` : ''}<p class="statement">${parts}</p>${foot}`);
    },
  });

  /* =============== BENTO =============== */
  define('bento', {
    label: 'Bento to\'r', icon: 'grid', desc: "Turli o'lchamli zamonaviy kartochkalar: matn, rasm, katta raqam",
    fields: [...HEAD, F.list('items', 'Kartochkalar', {
      title: 'title', fields: [
        F.sel('kind', "Turi", [['text', 'Ikonka + matn'], ['image', 'Rasm fonida'], ['stat', 'Katta raqam'], ['hl', "Rangli ajratilgan"]]),
        F.sel('size', "O'lcham", [['s', 'Kichik'], ['m', "O'rta"], ['l', 'Katta'], ['w', 'Keng'], ['f', "To'liq qator"]]), F.tog('tall', "Balandroq (2 qator)"),
        F.text('title', 'Sarlavha', { max: 70 }), F.area('text', 'Matn', { max: 220, rows: 2 }), F.text('value', 'Katta raqam / so\'z', { max: 14, show: (it) => ['stat', 'hl'].includes(it.kind) }),
        F.icon('icon', 'Ikonka', { show: (it) => ['text', 'hl'].includes(it.kind) }), F.img('image', 'Rasm', { show: (it) => it.kind === 'image' }), F.link('link', 'Havola (ixtiyoriy)')],
      add: () => ({ kind: 'text', size: 'm', tall: false, title: 'Yangi kartochka', text: '', value: '', icon: 'star', image: '', link: '' }), max: 12 })],
    defaults: () => ({ eyebrow: 'Imkoniyatlar', title: 'Hammasi *bir joyda*', text: '', items: [
      { kind: 'image', size: 'w', tall: false, title: 'Birinchi imkoniyat', text: 'Qisqa tavsif', value: '', icon: 'star', image: '', link: '' },
      { kind: 'stat', size: 's', tall: false, title: 'mamnun mijoz', text: '', value: '500+', icon: 'star', image: '', link: '' },
      { kind: 'text', size: 'm', tall: false, title: 'Tez va sifatli', text: 'Qisqa tavsif', value: '', icon: 'zap', image: '', link: '' },
      { kind: 'hl', size: 'm', tall: false, title: 'Maxsus taklif', text: 'Qisqa tavsif', value: '24/7', icon: 'shield', image: '', link: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const cell = (x, i) => {
        const k = x.kind || 'text', tag = linkUrl(x.link) ? 'a' : 'div', href = linkUrl(x.link) ? ` href="${esc(linkUrl(x.link))}"` : '';
        const cls = `bn ${esc(x.size || 'm')} ${x.tall ? 't' : ''} ${k === 'image' ? 'img' : k === 'hl' ? 'hl' : ''} rv t3`;
        const body = k === 'image' ? `${E.img(x.image, x.title)}<div class="bt"><h3>${text(x.title)}</h3>${x.text ? `<p>${text(x.text)}</p>` : ''}</div>`
          : `${k === 'text' || k === 'hl' ? (x.icon && k === 'text' ? `<div class="bic">${icon(x.icon)}</div>` : '') : ''}${(k === 'stat' || k === 'hl') && x.value ? `<div class="big">${text(x.value)}</div>` : ''}<h3>${text(x.title)}</h3>${x.text ? `<p>${text(x.text)}</p>` : ''}`;
        return `<${tag}${href} class="${cls}" style="--d:${(i % 4) * 0.07}s">${body}</${tag}>`;
      };
      return E.wrap(sec, `${E.head(sec)}<div class="bento">${it.map(cell).join('')}</div>`);
    },
  });

  /* =============== XIZMATLAR RO'YXATI =============== */
  define('services', {
    label: 'Xizmatlar ro\'yxati', icon: 'layers', desc: "Katta raqamlangan ro'yxat: ustiga borilsa rasm paydo bo'ladi",
    fields: [...HEAD, F.list('items', 'Xizmatlar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 60 }), F.area('text', 'Tavsif', { max: 260, rows: 2 }), F.lines('tags', 'Teglar', { hint: 'Har qatorga bittadan' }), F.img('image', "Ustiga borilganda ko'rinadigan rasm"), F.link('link', 'Havola (ixtiyoriy)')], add: () => ({ title: 'Yangi xizmat', text: '', tags: [], image: '', link: '' }), max: 10 })],
    defaults: () => ({ eyebrow: 'Xizmatlar', title: 'Biz *nima* qilamiz', text: '', items: [{ title: 'Birinchi xizmat', text: 'Qisqa tavsif.', tags: ['Teg'], image: '', link: '' }, { title: 'Ikkinchi xizmat', text: 'Qisqa tavsif.', tags: [], image: '', link: '' }, { title: 'Uchinchi xizmat', text: 'Qisqa tavsif.', tags: [], image: '', link: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const row = (x, i) => { const l = linkUrl(x.link); const tag = l ? 'a' : 'div'; const tg = arr(x.tags).filter(Boolean);
        return `<${tag} class="srv rv" ${l ? `href="${esc(l)}"` : ''} ${imgUrl(x.image) ? `data-img="${esc(imgUrl(x.image))}"` : ''} style="--d:${(i % 5) * 0.06}s"><span class="n">${num2(i)}</span><div><h3>${text(x.title)}</h3>${tg.length ? `<div class="tags">${tg.map((t) => `<span>${text(t)}</span>`).join('')}</div>` : ''}</div><p>${text(x.text)}</p><span class="go">${icon('arrow')}</span></${tag}>`; };
      return E.wrap(sec, `${E.head(sec)}<div class="srvs">${it.map(row).join('')}<div class="srv-pv"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></div></div>`);
    },
  });

  /* =============== VITRINA (gorizontal scroll) =============== */
  define('showcase', {
    label: 'Gorizontal vitrina', icon: 'image', desc: "Sahifa aylantirilganda yonga siljiydigan katta kartochkalar (ishlar, mahsulotlar)",
    fields: [...HEAD, F.list('items', 'Kartochkalar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 60 }), F.text('tag', 'Kichik yozuv', { max: 50 }), F.img('image', 'Rasm'), F.link('link', 'Havola (ixtiyoriy)')], add: () => ({ title: 'Yangi', tag: '', image: '', link: '' }), max: 12 })],
    defaults: () => ({ eyebrow: 'Portfolio', title: 'Tanlangan *ishlar*', text: '', items: [{ title: 'Birinchi ish', tag: 'Kategoriya', image: '', link: '' }, { title: 'Ikkinchi ish', tag: 'Kategoriya', image: '', link: '' }, { title: 'Uchinchi ish', tag: 'Kategoriya', image: '', link: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const card = (x, i) => { const l = linkUrl(x.link); const tag = l ? 'a' : 'div'; return `<${tag} class="hsc t3" ${l ? `href="${esc(l)}"` : ''} data-cursor="Ko'rish">${imgUrl(x.image) ? E.img(x.image, x.title) : ''}<span class="no">${num2(i)} / ${num2(it.length - 1)}</span><div class="in2"><div><h3>${text(x.title)}</h3><small>${text(x.tag)}</small></div><span class="go">${icon('arrow')}</span></div></${tag}>`; };
      return `<section class="sec s-showcase hs" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="hs-pin"><div class="hs-track"><div class="hs-intro">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}</div>${it.map(card).join('')}</div><div class="hs-bar"><i></i></div></div></section>`;
    },
  });

  /* =============== LOGOLAR =============== */
  define('logos', {
    label: 'Hamkorlar lentasi', icon: 'award', desc: "Mijoz va hamkor nomlari yoki logolari: yuguruvchi lenta",
    fields: [F.text('title', 'Kichik sarlavha', { max: 80 }), F.list('items', 'Hamkorlar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.img('image', 'Logo (ixtiyoriy)')], add: () => ({ name: 'Brend', image: '' }), max: 16 })],
    defaults: () => ({ title: 'Bizga ishonishadi', items: [{ name: 'Brend A', image: '' }, { name: 'Brend B', image: '' }, { name: 'Brend C', image: '' }, { name: 'Brend D', image: '' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && (x.name || imgUrl(x.image))); if (!it.length) return '';
      const row = `<span>${it.map((x) => (imgUrl(x.image) ? `<img src="${esc(imgUrl(x.image))}" alt="${esc(x.name)}">` : '') + (x.name ? text(x.name) : '')).join('</span><span>')}</span>`;
      return `<section class="sec s-logos logos" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap">${sec.title ? `<div class="logos-t">${text(sec.title)}</div>` : ''}</div><div class="mq"><div class="track">${row}${row}${row}${row}</div></div></section>`;
    },
  });

  /* =============== RASM + MATN QATORLARI =============== */
  define('split', {
    label: 'Rasm + matn qatorlari', icon: 'layers', desc: "Navbat bilan chap/o'ngda katta rasm va matn; rasm sekin ochiladi",
    fields: [...HEAD, F.list('items', 'Qatorlar', { title: 'title', fields: [F.text('label', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 90 }), F.area('text', 'Matn', { max: 400, rows: 3 }), F.lines('bullets', 'Punktlar', { hint: 'Har qatorga bittadan' }), F.img('image', 'Rasm'), F.text('buttonText', 'Tugma matni', { max: 40 }), F.link('buttonLink', 'Tugma havolasi')], add: () => ({ label: '', title: 'Yangi qator', text: '', bullets: [], image: '', buttonText: '', buttonLink: '#' }), max: 8 })],
    defaults: () => ({ eyebrow: '', title: '', text: '', items: [{ label: '01', title: 'Birinchi *afzallik*', text: 'Batafsil tavsif.', bullets: ['Birinchi punkt', 'Ikkinchi punkt'], image: '', buttonText: '', buttonLink: '#' }, { label: '02', title: 'Ikkinchi afzallik', text: 'Batafsil tavsif.', bullets: [], image: '', buttonText: '', buttonLink: '#' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const row = (x, i) => `<div class="sprow ${i % 2 ? 'rev' : ''}"><div class="spm imr">${imgUrl(x.image) ? `<img data-par="0.07" src="${esc(imgUrl(x.image))}" alt="${esc(x.title)}" loading="lazy">` : ''}</div><div class="spt rv">${x.label ? `<span class="snum">${text(x.label)}</span>` : ''}<h3 class="big" data-split>${rich(x.title)}</h3>${x.text ? `<p>${text(x.text)}</p>` : ''}${arr(x.bullets).filter(Boolean).length ? `<ul>${arr(x.bullets).filter(Boolean).map((b) => `<li><i>${icon('check')}</i>${text(b)}</li>`).join('')}</ul>` : ''}${btn(x.buttonText, x.buttonLink, 'ghost')}</div></div>`;
      return E.wrap(sec, `${E.head(sec)}${it.map(row).join('')}`);
    },
  });

  /* =============== VIDEO =============== */
  define('video', {
    label: 'Video', icon: 'eye', desc: "Katta video oynasi: YouTube, Vimeo yoki o'zingiz yuklagan mp4",
    fields: [...HEAD, F.text('url', 'Video havolasi', { max: 300, ph: 'https://www.youtube.com/watch?v=…', hint: 'YouTube, Vimeo yoki .mp4 fayl manzili' }), F.img('poster', 'Muqova rasmi'), F.text('caption', 'Video ustidagi yozuv', { max: 80 })],
    defaults: () => ({ eyebrow: 'Video', title: 'Ish jarayonimizni *ko\'ring*', text: '', url: '', poster: '', caption: 'Ko\'rish' }),
    render(sec) {
      return E.wrap(sec, `${E.head(sec)}<div class="vid rv" data-cursor="Play">${imgUrl(sec.poster) ? E.img(sec.poster, sec.title) : ''}${sec.caption ? `<span class="vcap">${text(sec.caption)}</span>` : ''}<button class="vplay" data-act="video" data-src="${esc(sec.url || '')}" aria-label="Videoni ochish"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button></div>`);
    },
  });

  /* =============== XARITA =============== */
  define('map', {
    label: 'Xarita va manzil', icon: 'pin', desc: "Google xaritasi, manzil, ish vaqti va telefon kartochkalari",
    fields: [...HEAD, F.text('query', 'Xarita qidiruvi', { max: 200, ph: 'Toshkent, Amir Temur ko\'chasi 1', hint: 'Manzil yoki koordinata (41.31,69.28). Bo\'sh bo\'lsa, aloqa manzili olinadi.' }), F.num('zoom', 'Masshtab (10–18)', { min: 10, max: 18 })],
    defaults: () => ({ eyebrow: 'Manzil', title: 'Bizni *toping*', text: '', query: '', zoom: 15 }),
    render(sec, S) {
      const c = S.contacts || {}; const q = String(sec.query || c.address || '').trim();
      const z = Math.max(10, Math.min(18, Number(sec.zoom) || 15));
      const frame = q ? `<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Xarita" src="https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed"></iframe>` : '<div class="ph" style="height:100%;min-height:420px;display:grid;place-items:center;color:var(--muted)">Manzil kiritilmagan</div>';
      const cards = [];
      if (c.address) cards.push(['Manzil', text(c.address)]);
      if (c.hours) cards.push(['Ish vaqti', text(c.hours)]);
      if (c.phone) cards.push(['Telefon', `<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${text(c.phone)}</a>`]);
      if (c.email) cards.push(['Email', `<a href="mailto:${esc(c.email)}">${text(c.email)}</a>`]);
      return E.wrap(sec, `${E.head(sec)}<div class="mapg"><div class="mapf rv">${frame}</div><div class="mapi">${cards.map(([k, v], i) => `<div class="mi rv" style="--d:${i * 0.08}s"><small>${k}</small><b>${v}</b></div>`).join('')}${q ? `<a class="btn" href="https://maps.google.com/maps?q=${encodeURIComponent(q)}" target="_blank" rel="noopener">Yo'nalish olish<span class="bi">${icon('arrow')}</span></a>` : ''}</div></div>`);
    },
  });

  /* =============== OLDIN / KEYIN =============== */
  define('compare', {
    label: 'Oldin / keyin', icon: 'refresh', desc: "Ikki rasm: slayder bilan solishtiriladi (natijalar, ta'mir, go'zallik)",
    fields: [...HEAD, F.img('before', 'Oldin (rasm)'), F.img('after', 'Keyin (rasm)'), F.text('labelBefore', 'Chap yozuv', { max: 20 }), F.text('labelAfter', "O'ng yozuv", { max: 20 })],
    defaults: () => ({ eyebrow: 'Natija', title: 'Oldin va *keyin*', text: '', before: '', after: '', labelBefore: 'Oldin', labelAfter: 'Keyin' }),
    render(sec) {
      if (!imgUrl(sec.before) || !imgUrl(sec.after)) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="cmp rv" tabindex="0" role="slider" aria-label="Oldin va keyin" aria-valuemin="0" aria-valuemax="100" data-cursor="Suring">${E.img(sec.before, sec.labelBefore)}${E.img(sec.after, sec.labelAfter, 'af')}<span class="lb1">${text(sec.labelBefore)}</span><span class="lb2">${text(sec.labelAfter)}</span><i class="hd"></i></div>`);
    },
  });
})();
