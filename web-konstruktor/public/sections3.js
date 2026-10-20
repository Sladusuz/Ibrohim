'use strict';
// Vizitka (link-in-bio) bo'limlari: profil kartasi, yo'nalishlar, narx ro'yxati, galereya, sharhlar, manzil.
// "vcard" bo'limi bor sayt vizitka rejimida chiqadi (menyu va katta footer yo'q), dizayn vcard.design orqali tanlanadi.
(function () {
  const E = window.E;
  const { esc, text, imgUrl, linkUrl, icon } = E;
  const F = E.F;
  const arr = (a) => (Array.isArray(a) ? a : []);
  const define = (type, def) => { E.sections[type] = def; E.order.push(type); };
  const rich = (v) => E.rich(v);

  E.vcDesigns = {
    emerald: "Zumrad: qorong'i yashil + oltin",
    midnight: "Yarim tun: ko'k neon",
    rose: 'Atirgul: nafis och pushti',
    gold: 'Oltin: qora + premium',
    clinic: 'Klinika: toza oq-feruza',
    sunset: 'Quyosh botishi: iliq gradient',
    mono: 'Minimal: oq-qora muharrir',
    ocean: "Dengiz: och ko'k",
    neon: 'Neon: binafsha-pushti',
    sand: 'Qum: iliq bej + terakota',
  };

  /* ---- Ijtimoiy tarmoqlar: tur -> ikonka, nom, havola ---- */
  const strip = (v) => String(v || '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?[^/]+\//i, '').replace(/\/+$/, '');
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const SOC = {
    instagram: ['insta', 'Instagram', (v) => 'https://instagram.com/' + strip(v)],
    telegram: ['telegram', 'Telegram', (v) => 'https://t.me/' + strip(v)],
    whatsapp: ['whatsapp', 'WhatsApp', (v) => 'https://wa.me/' + digits(v)],
    youtube: ['youtube', 'YouTube', (v) => (/^@/.test(String(v).trim()) ? 'https://youtube.com/' + String(v).trim() : 'https://youtube.com/' + strip(v))],
    tiktok: ['tiktok', 'TikTok', (v) => 'https://tiktok.com/@' + strip(v)],
    facebook: ['facebook', 'Facebook', (v) => 'https://facebook.com/' + strip(v)],
    linkedin: ['linkedin', 'LinkedIn', (v) => 'https://linkedin.com/in/' + strip(v)],
    twitter: ['twitter', 'X (Twitter)', (v) => 'https://x.com/' + strip(v)],
    link: ['globe', 'Sayt', (v) => (/^https?:\/\//i.test(String(v).trim()) ? String(v).trim() : 'https://' + String(v).trim())],
    tel: ['tel', 'Telefon', (v) => 'tel:' + String(v).replace(/[^\d+]/g, '')],
    mail: ['mail', 'Email', (v) => 'mailto:' + String(v).trim()],
    pin: ['pin', 'Xarita', (v) => (/^https?:\/\//i.test(String(v).trim()) ? String(v).trim() : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(String(v).trim()))],
  };
  const socOpts = Object.keys(SOC).map((k) => [k, SOC[k][1]]);
  const socHref = (kind, v) => { const d = SOC[kind] || SOC.link; const x = String(v || '').trim(); if (!x) return ''; try { return linkUrl(d[2](x)); } catch { return ''; } };
  const ext = (h) => (/^https?:/i.test(h) ? ' target="_blank" rel="noopener"' : '');
  // Havola kartasi/tugma uchun: to'liq havola, @nom, telefon raqam yoki sayt manzili
  const smart = (u) => { const x = String(u || '').trim(); if (!x) return ''; const l = linkUrl(x); if (l) return l; if (/^(t\.me|wa\.me|instagram\.com|youtube\.com|youtu\.be|facebook\.com|tiktok\.com|linkedin\.com|maps\.google|goo\.gl)\//i.test(x) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(x)) return 'https://' + x; if (/^\+?[\d\s()-]{7,}$/.test(x)) return 'tel:' + x.replace(/[^\d+]/g, ''); return ''; };

  const HEAD = [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 80, hint: "So'zni *yulduzcha* ichiga olsangiz, nafis kursiv bo'ladi." })];
  const head = (sec) => (sec.title || sec.eyebrow ? `<div class="vch">${sec.eyebrow ? `<span class="vce">${text(sec.eyebrow)}</span>` : ''}${sec.title ? `<h2>${rich(sec.title)}</h2>` : ''}</div>` : '');
  const sect = (sec, cls, inner) => `<section class="vcs ${cls}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}">${inner}</section>`;
  const stars = (n) => '★★★★★'.slice(0, Math.max(1, Math.min(5, Number(n) || 5)));

  /* =============== PROFIL KARTASI =============== */
  define('vcard', {
    label: 'Vizitka: profil kartasi', icon: 'user', desc: "Logotip, nom, tavsif, ko'rsatkichlar, havola kartalari va tarmoq ikonkalari",
    fields: [
      F.sel('design', 'Dizayn', Object.keys(E.vcDesigns).map((k) => [k, E.vcDesigns[k]]), { hint: "Rangni o'zgartirish: Sozlamalar → mavzu rangi." }),
      F.text('badge', 'Yuqoridagi yozuv', { max: 60 }), F.img('logoImage', 'Logotip yoki rasm'), F.text('logoText', 'Logotip harfi (rasm bo\'lmasa)', { max: 2 }), F.tog('verified', 'Tasdiqlangan belgisi'),
      F.text('name', 'Nomi', { max: 40 }), F.text('sub', 'Qo\'shimcha nom (qiya yozuv)', { max: 40 }), F.text('role', 'Qisqa yo\'nalish', { max: 60 }), F.area('text', 'Tavsif', { max: 320, rows: 3 }),
      F.list('stats', "Ko'rsatkichlar", { title: 'label', fields: [F.icon('icon', 'Ikonka'), F.num('value', 'Son'), F.text('suffix', 'Qo\'shimcha (+, %)', { max: 10 }), F.text('label', 'Yozuv', { max: 24 })], add: () => ({ icon: 'star', value: 10, suffix: '+', label: 'Yangi' }), max: 3 }),
      F.list('pills', 'Kichik yozuvlar (ish vaqti, shahar...)', { title: 'label', fields: [F.icon('icon', 'Ikonka'), F.text('label', 'Yozuv', { max: 30 })], add: () => ({ icon: 'clock', label: '9:00 – 20:00' }), max: 4 }),
      F.list('links', 'Havola kartalari', { title: 'title', fields: [F.icon('icon', 'Ikonka'), F.text('title', 'Nomi', { max: 40 }), F.text('sub', 'Pastki yozuv', { max: 60 }), F.text('url', 'Havola, @nom yoki telefon', { max: 200 })], add: () => ({ icon: 'link', title: 'Yangi havola', sub: '', url: '' }), max: 10 }),
      F.list('socials', 'Ijtimoiy tarmoq ikonkalari', { title: 'kind', fields: [F.sel('kind', 'Tarmoq', socOpts), F.text('url', '@nom, raqam yoki havola', { max: 200 })], add: () => ({ kind: 'instagram', url: '' }), max: 8 }),
      F.text('ctaText', 'Asosiy tugma matni', { max: 40 }), F.text('ctaLink', 'Asosiy tugma havolasi (@nom, telefon, havola)', { max: 200 }),
    ],
    defaults: () => ({
      design: 'emerald', badge: 'Toshkent · 2020 yildan buyon', logoImage: '', logoText: 'N', verified: true, name: 'Nomingiz', sub: 'Yo\'nalishingiz', role: 'Asosiy xizmat', text: 'Kompaniyangiz yoki o\'zingiz haqingizda qisqa va aniq tavsif yozing.',
      stats: [{ icon: 'medal', value: 2020, suffix: '', label: 'Yildan buyon' }, { icon: 'users', value: 500, suffix: '+', label: 'Mijoz' }, { icon: 'compass', value: 5, suffix: '', label: 'Yo\'nalish' }],
      pills: [{ icon: 'clock', label: '9:00 – 20:00' }, { icon: 'calendar', label: 'Har kuni' }, { icon: 'pin', label: 'Toshkent' }],
      links: [{ icon: 'tel', title: 'Qo\'ng\'iroq qilish', sub: '+998 90 123 45 67', url: '+998901234567' }, { icon: 'telegram', title: 'Telegram', sub: '@nomingiz', url: 't.me/nomingiz' }, { icon: 'insta', title: 'Instagram', sub: '@nomingiz', url: 'instagram.com/nomingiz' }],
      socials: [{ kind: 'instagram', url: '@nomingiz' }, { kind: 'telegram', url: '@nomingiz' }, { kind: 'whatsapp', url: '+998901234567' }],
      ctaText: 'Bog\'lanish', ctaLink: '+998901234567',
    }),
    render(sec) {
      let n = 0; const st = () => `style="--i:${n++}"`;
      const av = imgUrl(sec.logoImage) ? `<img src="${esc(imgUrl(sec.logoImage))}" alt="${esc(sec.name || '')}">` : `<span>${text(String(sec.logoText || (sec.name || 'S')[0]).slice(0, 2))}</span>`;
      const stats = arr(sec.stats).filter((x) => x && x.label).slice(0, 3);
      const pills = arr(sec.pills).filter((x) => x && x.label);
      const links = arr(sec.links).filter((x) => x && x.title);
      const socs = arr(sec.socials).filter((x) => x && socHref(x.kind, x.url));
      const cta = sec.ctaText ? smart(sec.ctaLink) : '';
      return `<section class="vcs vcard" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="vcbg" aria-hidden="true"><i></i><i></i><i></i></div>
        ${sec.badge ? `<div class="vcbadge" ${st()}><b></b>${text(sec.badge)}</div>` : ''}
        <div class="vcav" ${st()}><div class="vcring"><div class="vcin">${av}</div></div>${sec.verified ? `<em class="vcver" aria-label="Tasdiqlangan">${icon('check')}</em>` : ''}</div>
        <div class="vcid" ${st()}>${sec.name ? `<h1>${text(sec.name)}</h1>` : ''}${sec.sub ? `<p class="vcsub">${text(sec.sub)}</p>` : ''}${sec.role ? `<p class="vcrole">${text(sec.role)}</p>` : ''}</div>
        ${sec.text ? `<p class="vcbio" ${st()}>${text(sec.text)}</p>` : ''}
        ${stats.length ? `<div class="vcstats c${stats.length}" ${st()}>${stats.map((x) => `<div class="vcst"><span class="vci">${icon(x.icon)}</span><b data-count="${Number(x.value) || 0}" data-suf="${esc(x.suffix || '')}" data-plain="1">${Number(x.value) || 0}${text(x.suffix)}</b><small>${text(x.label)}</small></div>`).join('')}</div>` : ''}
        ${pills.length ? `<div class="vcpills" ${st()}>${pills.map((x) => `<span>${icon(x.icon)}${text(x.label)}</span>`).join('')}</div>` : ''}
        ${cta ? `<a class="vccta" ${st()} href="${esc(cta)}"${ext(cta)}>${text(sec.ctaText)}<span>${icon('arrow')}</span></a>` : ''}
        ${links.length ? `<div class="vcdiv" ${st()}><i></i>${icon('leaf')}<i></i></div><div class="vclinks">${links.map((x) => { const h = smart(x.url); const tag = h ? 'a' : 'div'; return `<${tag} class="vcl" ${st()}${h ? ` href="${esc(h)}"${ext(h)}` : ''}><span class="vci">${icon(x.icon)}</span><span class="vct"><b>${text(x.title)}</b>${x.sub ? `<small>${text(x.sub)}</small>` : ''}</span><span class="vca">${icon('arrow')}</span></${tag}>`; }).join('')}</div>` : ''}
        ${socs.length ? `<div class="vcsoc" ${st()}>${socs.map((x) => { const h = socHref(x.kind, x.url); return `<a href="${esc(h)}"${ext(h)} aria-label="${esc(SOC[x.kind] ? SOC[x.kind][1] : '')}">${icon((SOC[x.kind] || SOC.link)[0])}</a>`; }).join('')}</div>` : ''}
      </section>`;
    },
  });

  /* =============== YO'NALISHLAR (ikonkali kartalar) =============== */
  define('vcsvc', {
    label: "Vizitka: yo'nalishlar", icon: 'grid', desc: "Ikonkali kartochkalar: yo'nalish, xizmat yoki afzallik",
    fields: [...HEAD, F.list('items', 'Kartochkalar', { title: 'title', fields: [F.icon('icon', 'Ikonka'), F.text('title', 'Nomi', { max: 40 }), F.text('text', 'Qisqa tavsif', { max: 80 })], add: () => ({ icon: 'star', title: 'Yangi xizmat', text: '' }), max: 12 })],
    defaults: () => ({ eyebrow: '', title: "Yo'nalishlarimiz", items: [{ icon: 'book', title: 'Birinchi yo\'nalish', text: 'Qisqa tavsif' }, { icon: 'users', title: 'Ikkinchi yo\'nalish', text: 'Qisqa tavsif' }, { icon: 'star', title: 'Uchinchi yo\'nalish', text: 'Qisqa tavsif' }, { icon: 'zap', title: 'To\'rtinchi yo\'nalish', text: 'Qisqa tavsif' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && x.title); if (!it.length) return '';
      return sect(sec, 'vsvc', `${head(sec)}<div class="vcgrid n${it.length}">${it.map((x, i) => `<div class="vcc" style="--i:${i}"><span class="vci">${icon(x.icon)}</span><b>${text(x.title)}</b>${x.text ? `<small>${text(x.text)}</small>` : ''}</div>`).join('')}</div>`);
    },
  });

  /* =============== NARXLAR RO'YXATI =============== */
  define('vclist', {
    label: "Vizitka: narxlar ro'yxati", icon: 'percent', desc: "Xizmat nomi, qisqa izoh va narx (menyu, prays-list)",
    fields: [...HEAD, F.list('items', 'Qatorlar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 50 }), F.text('desc', 'Izoh', { max: 80 }), F.text('price', 'Narx', { max: 30 })], add: () => ({ name: 'Yangi xizmat', desc: '', price: '100 000' }), max: 20 })],
    defaults: () => ({ eyebrow: 'Narxlar', title: 'Xizmatlar *narxi*', items: [{ name: 'Birinchi xizmat', desc: 'Qisqa izoh', price: '100 000' }, { name: 'Ikkinchi xizmat', desc: 'Qisqa izoh', price: '150 000' }, { name: 'Uchinchi xizmat', desc: 'Qisqa izoh', price: '250 000' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && x.name); if (!it.length) return '';
      return sect(sec, 'vlist', `${head(sec)}<div class="vcrows">${it.map((x, i) => `<div class="vcrow" style="--i:${i}"><span class="vcn"><b>${text(x.name)}</b>${x.desc ? `<small>${text(x.desc)}</small>` : ''}</span>${x.price ? `<span class="vcp">${text(x.price)}</span>` : ''}</div>`).join('')}</div>`);
    },
  });

  /* =============== GALEREYA =============== */
  define('vcgal', {
    label: 'Vizitka: galereya', icon: 'image', desc: "Yonga suriladigan rasmlar",
    fields: [...HEAD, F.list('items', 'Rasmlar', { title: 'caption', fields: [F.img('image', 'Rasm'), F.text('caption', 'Yozuv', { max: 50 })], add: () => ({ image: '', caption: '' }), max: 12 })],
    defaults: () => ({ eyebrow: 'Galereya', title: 'Ishlarimizdan *lavhalar*', items: [{ image: '', caption: 'Birinchi' }, { image: '', caption: 'Ikkinchi' }, { image: '', caption: 'Uchinchi' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && imgUrl(x.image)); if (!it.length) return '';
      return sect(sec, 'vgal', `${head(sec)}<div class="vcscroll">${it.map((x, i) => `<figure style="--i:${i}"><img src="${esc(imgUrl(x.image))}" alt="${esc(x.caption || '')}" loading="lazy">${x.caption ? `<figcaption>${text(x.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`);
    },
  });

  /* =============== SHARHLAR =============== */
  define('vcrev', {
    label: 'Vizitka: sharhlar', icon: 'quote', desc: 'Mijozlar fikri',
    fields: [...HEAD, F.list('items', 'Sharhlar', { title: 'name', fields: [F.area('text', 'Sharh', { max: 220, rows: 3 }), F.text('name', 'Ism', { max: 40 }), F.text('role', 'Kimligi', { max: 50 }), F.num('stars', 'Yulduz (1–5)')], add: () => ({ text: 'Juda yoqdi!', name: 'Mijoz', role: '', stars: 5 }), max: 8 })],
    defaults: () => ({ eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: 'Juda yoqdi! Hammasi tez va sifatli bajarildi.', name: 'Mijoz ismi', role: 'Mijoz', stars: 5 }, { text: 'Tavsiya qilaman, ishonchli jamoa.', name: 'Mijoz ismi', role: 'Mijoz', stars: 5 }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && x.text); if (!it.length) return '';
      return sect(sec, 'vrev', `${head(sec)}<div class="vcrevs">${it.map((x, i) => `<blockquote style="--i:${i}"><div class="vcs5" aria-label="${esc(String(x.stars || 5))} yulduz">${stars(x.stars)}</div><p>${text(x.text)}</p><footer><b>${text(x.name)}</b>${x.role ? `<small>${text(x.role)}</small>` : ''}</footer></blockquote>`).join('')}</div>`);
    },
  });

  /* =============== MANZIL =============== */
  define('vcmap', {
    label: 'Vizitka: manzil', icon: 'pin', desc: "Manzil, mo'ljal va xaritada ochish tugmasi",
    fields: [...HEAD, F.text('address', 'Manzil', { max: 140 }), F.text('hint', "Mo'ljal", { max: 100 }), F.text('hours', 'Ish vaqti', { max: 60 }), F.text('buttonText', 'Tugma matni', { max: 30 }), F.text('buttonLink', "Xarita havolasi (bo'sh qolsa, manzildan yasaladi)", { max: 300 })],
    defaults: () => ({ eyebrow: '', title: 'Bizning *manzil*', address: "Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi 10", hint: "Mo'ljal: metro bekati yonida", hours: 'Har kuni 9:00 – 20:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    render(sec) {
      if (!sec.address) return '';
      const h = smart(sec.buttonLink) || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(sec.address));
      return sect(sec, 'vmap', `${head(sec)}<div class="vcmapc"><span class="vci">${icon('pin')}</span><div class="vct"><b>${text(sec.address)}</b>${sec.hint ? `<small>${text(sec.hint)}</small>` : ''}${sec.hours ? `<small class="vch2">${icon('clock')}${text(sec.hours)}</small>` : ''}</div></div>${sec.buttonText ? `<a class="vccta ghost" href="${esc(h)}" target="_blank" rel="noopener">${text(sec.buttonText)}<span>${icon('arrow')}</span></a>` : ''}`);
    },
  });
})();
