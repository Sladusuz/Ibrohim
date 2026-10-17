'use strict';
// Portfolio, turizm, to'y, musiqa, startap, ilova, organik shablonlari.
(function () {
  const { add, sec, P } = window.TplKit;
  const NO_ORD = { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 };
  const NO_ANN = { enabled: false, text: '', link: '' };
  const FT = (t) => ({ text: t || 'Barcha huquqlar himoyalangan.', links: [] });

  /* =================== 1. DIZAYNER =================== */
  add({
    id: 'dizayner', name: 'Portfolio: dizayner', cat: 'Portfolio', icon: 'design', badge: 'Ommabop',
    tags: ['dizayner', 'portfolio', 'ui', 'ux', 'grafik', 'brend', 'designer', 'дизайнер', 'портфолио'],
    look: 'cinema',
    desc: "Dizayner va kreativ mutaxassis uchun: katta sarlavha, ishlar vitrinasi, xizmatlar va aloqa.",
    build: () => ({
      v: 2, template: 'dizayner',
      company: { name: 'Malika Studio', logo: 'M', tagline: "Brend, interfeys va chop etish dizayni. Toshkentdan butun dunyoga." },
      theme: { preset: 'minimal', accent: '#ff5a36', accent2: '', look: 'cinema', motion: true, font: 'editorial', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'minimal', cta: 'Loyiha muhokamasi', ctaLink: '#aloqa', search: false },
      announce: NO_ANN, orders: NO_ORD,
      contacts: { phone: '+998 90 311 22 33', email: 'salom@malika.studio', address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 12", hours: 'Dush–Juma, 10:00–19:00', telegram: '@malika_studio', instagram: '@malika.studio' },
      footer: FT('Malika Studio. Hamma narsa qo\'lda chizilgan.'),
      sections: [
        sec('bosh', 'hero', { layout: 'editorial', badge: 'Yangi loyihalar uchun bandman: 2026', titleStart: "G'oyalarga *shakl* beraman", words: [], titleEnd: '', text: "Mustaqil dizayner Malika Yusupova. Brend, veb-sayt va ilova interfeyslarini ishlab chiqaman: chiroyli va ishlaydigan.", cta1Text: 'Loyiha muhokamasi', cta1Link: '#aloqa', cta2Text: 'Ishlarni ko\'rish', cta2Link: '#ishlar', visual: 'none', image: '', inlineImgs: [{ image: P('dizayner', 2) }, { image: P('dizayner', 4) }, { image: P('dizayner', 5) }], trust: [{ value: '80+', label: 'loyiha' }, { value: '7 yil', label: 'tajriba' }, { value: '30', label: 'mamnun brend' }] }),
        sec('lenta', 'marquee', { items: ['Brend shaxsiyat', 'UI/UX dizayn', 'Logotip', 'Qadoqlash', 'Veb-dizayn', 'Illyustratsiya'] }),
        sec('ishlar', 'showcase', { navLabel: 'Ishlar', eyebrow: 'Portfolio', title: "Tanlangan *ishlar*", text: "Oxirgi yillardagi sevimli loyihalarim.", items: [
          { title: 'Nur Cosmetics', tag: 'Brend shaxsiyat', image: P('dizayner', 2), link: '' },
          { title: 'Fargona Bank', tag: 'Mobil ilova UI', image: P('dizayner', 3), link: '' },
          { title: 'Soya Cafe', tag: 'Logotip va menyu', image: P('dizayner', 4), link: '' },
          { title: 'Atlas Fashion', tag: 'Onlayn do\'kon', image: P('dizayner', 1), link: '' },
          { title: 'Binokor Group', tag: 'Arxitektura vizualizatsiyasi', image: P('dizayner', 6), link: '' },
          { title: 'Daftar', tag: 'Qadoqlash', image: P('dizayner', 5), link: '' }] }),
        sec('biz', 'statement', { navLabel: 'Men haqimda', eyebrow: 'Men haqimda', text: "Dizayn bu bezak emas, bu *muammo yechimi*. Har bir chiziq mijozingiz *e'tiborini* pulga aylantirishi kerak deb hisoblayman.", author: 'Malika Yusupova', role: 'Dizayner va art-direktor', image: P('odam', 8), buttonText: 'Bog\'lanish', buttonLink: '#aloqa' }),
        sec('xizmat', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Nima *qilaman*", text: '', items: [
          { title: 'Brend shaxsiyat', text: "Logotip, ranglar, shrift va brendbuk: bozorda ajralib turish uchun.", tags: ['Logotip', 'Brendbuk', 'Ranglar'], image: P('dizayner', 2), link: '#aloqa' },
          { title: 'Veb va ilova dizayni', text: "Foydalanuvchi yo'li, prototip va tayyor Figma maketlari.", tags: ['Figma', 'UX', 'UI'], image: P('dizayner', 3), link: '#aloqa' },
          { title: 'Qadoqlash va chop etish', text: "Qadoq, vizitka, menyu, katalog: bosmaxonaga tayyor fayllar.", tags: ['Qadoq', 'Poligrafiya'], image: P('dizayner', 5), link: '#aloqa' },
          { title: 'Art-direksiya', text: "Reklama kampaniyasi, ijtimoiy tarmoqlar va vizual uslub nazorati.", tags: ['Kampaniya', 'SMM'], image: P('dizayner', 4), link: '#aloqa' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 80, suffix: '+', label: 'tugallangan loyiha' }, { value: 7, suffix: ' yil', label: 'tajriba' }, { value: 30, suffix: '+', label: 'doimiy mijoz' }, { value: 12, suffix: '', label: 'dizayn mukofoti' }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: "Qanday *ishlayman*", text: '', layout: 'grid', items: [
          { title: 'Tanishuv', text: "Maqsad, auditoriya va byudjetni birga aniqlaymiz. Bepul, 30 daqiqa." },
          { title: 'Tadqiqot va g\'oya', text: "Raqobatchilarni o'rganaman, 2–3 yo'nalishda eskizlar tayyorlayman." },
          { title: 'Dizayn', text: "Tanlangan yo'nalishni sayqallayman, har bosqichda fikringizni olaman." },
          { title: 'Topshirish', text: "Barcha fayllar, qo'llanma va 30 kunlik bepul tuzatishlar bilan." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *aytadi*", text: '', layout: 'grid', items: [
          { text: "Malika brendimizni noldan yaratdi. Savdo ikki oyda 40 foizga oshdi.", name: 'Nilufar Saidova', role: 'Nur Cosmetics, asoschi', image: P('odam', 1), stars: 5 },
          { text: "Ilova dizayni juda qulay chiqdi, foydalanuvchilar sharhlarida maqtashmoqda.", name: 'Sardor Aliyev', role: 'Fargona Bank, mahsulot rahbari', image: P('odam', 4), stars: 5 },
          { text: "Muddatga aniq amal qildi va har bir tafsilotga e'tibor berdi.", name: 'Bobur Yusupov', role: 'Soya Cafe, egasi', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Logotip narxi qancha?", a: "Logotip paketi 1 500 000 so'mdan boshlanadi. Brendbuk bilan to'liq shaxsiyat 4 500 000 so'mdan." },
          { q: "Loyiha qancha vaqt oladi?", a: "Logotip 1–2 hafta, veb-sayt dizayni 2–4 hafta. Aniq muddat suhbatdan keyin aytiladi." },
          { q: "Tahrirlar necha marta mumkin?", a: "Har bosqichda 3 martagacha bepul tahrir kiritiladi." },
          { q: "Manba fayllarni olamanmi?", a: "Ha, to'lovdan keyin barcha manba fayllar (Figma, AI, PSD) sizga topshiriladi." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: "Keling, *birga* yaratamiz", text: "Loyihangiz haqida qisqacha yozing: 24 soat ichida javob beraman.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Xabar yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 2. DASTURCHI =================== */
  add({
    id: 'dasturchi', name: 'Portfolio: dasturchi', cat: 'Portfolio', icon: 'terminal', badge: '',
    tags: ['dasturchi', 'developer', 'programmer', 'portfolio', 'frontend', 'backend', 'разработчик', 'программист'],
    look: 'cinema',
    desc: "Dasturchi uchun qorong'i portfolio: ko'nikmalar, loyihalar, tajriba va aloqa.",
    build: () => ({
      v: 2, template: 'dasturchi',
      company: { name: 'Jasur.dev', logo: 'J', tagline: "Full-stack dasturchi. Tez, toza va ishonchli kod." },
      theme: { preset: 'dark', accent: '#22d3a5', accent2: '#6366f1', look: 'cinema', motion: true, font: 'mono', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: 'Bog\'lanish', ctaLink: '#aloqa', search: false },
      announce: { enabled: true, text: "Yangi loyihalar uchun ochiqman: freelance va masofaviy ish", link: '#aloqa' }, orders: NO_ORD,
      contacts: { phone: '+998 93 555 12 12', email: 'jasur@jasur.dev', address: "Toshkent, IT Park", hours: 'Dush–Shan, 9:00–20:00', telegram: '@jasur_dev', instagram: '' },
      footer: FT('Kod bilan yozilgan, qahva bilan sug\'orilgan.'),
      sections: [
        sec('bosh', 'hero', { layout: 'aurora', fx: 'aurora', badge: '> available for work_', titleStart: "Kodni *san'atga* aylantiraman", words: [], titleEnd: '', text: "Jasur Tursunov, full-stack dasturchi. React, Node.js va Python bilan veb-ilovalar, API va Telegram botlar yarataman.", cta1Text: 'Loyiha taklif qilish', cta1Link: '#aloqa', cta2Text: 'Loyihalarim', cta2Link: '#loyihalar', visual: 'image', image: P('dasturchi', 2), trust: [{ value: '60+', label: 'loyiha' }, { value: '6 yil', label: 'tajriba' }, { value: '99%', label: 'o\'z vaqtida' }] }),
        sec('texno', 'marquee', { items: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Docker', 'Telegram API'] }),
        sec('biz', 'statement', { navLabel: 'Men haqimda', eyebrow: 'Men haqimda', text: "Men shunchaki kod yozmayman, *biznes muammolarini* hal qilaman. Har bir qator *tezlik*, xavfsizlik va kelajakdagi o'sish uchun yoziladi.", author: 'Jasur Tursunov', role: 'Full-stack dasturchi', image: P('odam', 5), buttonText: '', buttonLink: '#' }),
        sec('konikma', 'skills', { navLabel: "Ko'nikmalar", eyebrow: "Ko'nikmalar", title: "Texnologik *arsenal*", text: "Har kuni ishlatadigan va chuqur biladigan vositalarim.", layout: 'bars', items: [
          { name: 'JavaScript / TypeScript', level: 95 }, { name: 'React / Next.js', level: 92 }, { name: 'Node.js / Express', level: 90 }, { name: 'Python / FastAPI', level: 80 }, { name: 'PostgreSQL / Redis', level: 85 }, { name: 'Docker / CI/CD', level: 75 }] }),
        sec('loyihalar', 'projects', { navLabel: 'Loyihalar', eyebrow: 'Portfolio', title: "Tanlangan *loyihalar*", text: '', layout: 'grid', filters: true, items: [
          { title: 'Baraka Market', tags: "Veb, React", year: '2026', image: P('elektronika', 2), description: "Onlayn do'kon: katalog, savat, Payme va Click to'lovlari. 3 oyda savdo 2.4 barobar o'sdi.", link: '', linkText: '' },
          { title: 'Oltin Non Bot', tags: "Bot, Python", year: '2025', image: P('ilova', 5), description: "Telegram orqali non buyurtmasi va yetkazib berish: kuniga 400 dan ortiq buyurtma.", link: '', linkText: '' },
          { title: 'FitZone CRM', tags: "Veb, Node.js", year: '2025', image: P('dasturchi', 1), description: "Fitnes klub uchun a'zolik, to'lov va davomat boshqaruv tizimi.", link: '', linkText: '' },
          { title: 'Logistik API', tags: "API, Docker", year: '2024', image: P('dasturchi', 4), description: "Yuk kuzatuvi uchun yuqori yuklamali REST API: sekundiga 2000 so'rov.", link: '', linkText: '' }] }),
        sec('tajriba', 'timeline', { navLabel: 'Tajriba', eyebrow: 'Tajriba', title: "Mening *yo'lim*", text: '', items: [
          { period: '2024 – hozir', title: 'Senior Full-stack dasturchi', place: 'Nexora, Toshkent', text: "Jamoani boshqarish, arxitektura va 15 dan ortiq mijoz loyihalari." },
          { period: '2022 – 2024', title: 'Backend dasturchi', place: 'PayTech Uzbekistan', text: "To'lov tizimi integratsiyalari va mikroservislar." },
          { period: '2020 – 2022', title: 'Frontend dasturchi', place: 'Freelance', text: "Biznes saytlari, landing sahifalar va onlayn do'konlar." },
          { period: '2016 – 2020', title: 'Axborot texnologiyalari bakalavri', place: 'TATU, Toshkent', text: "Algoritmlar, ma'lumotlar bazasi va dasturiy injiniring." }] }),
        sec('faq', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Qanday loyihalar bilan ishlaysiz?", a: "Veb-ilovalar, onlayn do'konlar, Telegram botlar, API va avtomatlashtirish tizimlari." },
          { q: "Narx qanday hisoblanadi?", a: "Soatbay yoki loyiha uchun qat'iy narx. Texnik topshiriqni ko'rib, 1 kun ichida taklif beraman." },
          { q: "Loyihadan keyin yordam berasizmi?", a: "Ha, har loyihaga 3 oy bepul texnik yordam kiradi." },
          { q: "Masofaviy ishlaysizmi?", a: "Ha, butun dunyo bo'ylab mijozlar bilan Zoom va Telegram orqali ishlayman." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: "Keling, *yaratamiz*", text: "Loyiha g'oyangizni yozing. 24 soat ichida javob beraman.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 3. FOTOGRAF =================== */
  add({
    id: 'fotograf', name: 'Portfolio: fotograf', cat: 'Portfolio', icon: 'camera', badge: '',
    tags: ['fotograf', 'foto', 'photographer', 'suratga olish', 'fotosessiya', 'фотограф'],
    look: 'cinema',
    desc: "Fotograf uchun: to'liq ekranli foto, galereya, paketlar va fotosessiyaga yozilish.",
    build: () => ({
      v: 2, template: 'fotograf',
      company: { name: 'Lens & Light', logo: 'L', tagline: "Lahzalarni abadiylashtiramiz. To'y, portret va tijorat suratlari." },
      theme: { preset: 'warm', accent: '#e0a458', accent2: '', look: 'cinema', motion: true, font: 'modern', radius: 'sharp', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: 'Sessiyaga yozilish', ctaLink: '#bron', search: false },
      announce: NO_ANN, orders: NO_ORD,
      contacts: { phone: '+998 91 700 88 99', email: 'foto@lenslight.uz', address: "Toshkent, Mirobod tumani, Taraqqiyot ko'chasi 5", hours: 'Har kuni 9:00 – 21:00', telegram: '@lenslight_uz', instagram: '@lenslight.uz' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: 'Fotosessiyalar 2026 uchun yozilish ochiq', titleStart: "Har bir kadr, *hikoya*", words: [], titleEnd: '', text: "Professional fotograf: portret, to'y, oilaviy va tijorat suratlari. Tabiiy yorug'lik va samimiy lahzalar.", cta1Text: 'Sessiyaga yozilish', cta1Link: '#bron', cta2Text: 'Ishlarni ko\'rish', cta2Link: '#galereya', visual: 'none', image: P('fotograf', 2), trust: [{ value: '500+', label: 'fotosessiya' }, { value: '9 yil', label: 'tajriba' }, { value: '4.9', label: 'mijozlar bahosi' }] }),
        sec('lenta', 'marquee', { items: ['Portret', "To'y", 'Oilaviy', 'Tijorat', 'Sayohat', 'Mahsulot'] }),
        sec('biz', 'statement', { navLabel: 'Men haqimda', eyebrow: 'Men haqimda', text: "Foto bu *yorug'lik* bilan yozilgan hikoya. Men qo'g'irchoq kabi pozalarni emas, *haqiqiy his-tuyg'ularni* suratga olaman.", author: 'Akmal Rustamov', role: 'Fotograf', image: P('odam', 2), buttonText: '', buttonLink: '#' }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: "Tanlangan *kadrlar*", text: '', layout: 'masonry', items: [
          { image: P('fotograf', 1), caption: 'Shahar ritmi' }, { image: P('fotograf', 6), caption: 'Sayohat lahzalari' }, { image: P('fotograf', 3), caption: 'Ko\'cha suratlari' }, { image: P('toy', 3), caption: "To'y kuni" }, { image: P('fotograf', 5), caption: 'Plyonka estetikasi' }, { image: P('toy', 2), caption: 'Quyosh botganda' }, { image: P('turizm', 3), caption: 'Tog\' cho\'qqisida' }, { image: P('fotograf', 4), caption: 'Kafe burchagi' }] }),
        sec('turlar', 'showcase', { navLabel: 'Yo\'nalishlar', eyebrow: 'Yo\'nalishlar', title: "Nima *suratga olaman*", text: '', items: [
          { title: "To'y suratlari", tag: "Kun bo'yi", image: P('toy', 6), link: '#bron' },
          { title: 'Portret sessiya', tag: 'Studiya yoki ochiq havo', image: P('fotograf', 6), link: '#bron' },
          { title: 'Sayohat va tabiat', tag: 'Peyzaj', image: P('fotograf', 2), link: '#bron' },
          { title: 'Tijorat va mahsulot', tag: 'Brendlar uchun', image: P('fotograf', 3), link: '#bron' }] }),
        sec('narx', 'pricing', { navLabel: 'Paketlar', eyebrow: 'Narxlar', title: "Fotosessiya *paketlari*", text: "Hammasi rang korreksiya va onlayn galereya bilan.", items: [
          { name: 'Mini', price: "600 000 so'm", period: '1 soat', features: ['1 soatlik sessiya', '20 ta tahrirlangan foto', 'Onlayn galereya', '1 ta lokatsiya'], popular: false, cta: 'Tanlash' },
          { name: 'Standart', price: "1 500 000 so'm", period: '3 soat', features: ['3 soatlik sessiya', '60 ta tahrirlangan foto', '2 ta lokatsiya', 'Bosma 5 ta foto sovg\'a'], popular: true, cta: 'Tanlash' },
          { name: "To'y", price: "5 500 000 so'm", period: 'kun bo\'yi', features: ['10 soatgacha suratga olish', '400 ta tahrirlangan foto', 'Foto-kitob', 'Ikkinchi fotograf'], popular: false, cta: 'Tanlash' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *fikri*", text: '', layout: 'grid', items: [
          { text: "To'yimiz suratlari go'zal chiqdi. Har bir kadrda his bor.", name: 'Zarina va Otabek', role: "To'y sessiyasi", image: P('odam', 8), stars: 5 },
          { text: "Birinchi marta suratga tushishdan uyalmadim. Akmal juda yengil muhit yaratadi.", name: 'Kamola Ergasheva', role: 'Portret sessiya', image: P('odam', 6), stars: 5 },
          { text: "Mahsulot suratlari tufayli onlayn savdomiz sezilarli o'sdi.", name: 'Rustam Nazarov', role: 'Tijorat suratlari', image: P('odam', 4), stars: 5 }] }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Sessiyaga yozilish', title: "Sanani *band qiling*", text: "Sana va turini tanlang, tasdiqlash uchun qo'ng'iroq qilaman.", form: 'booking', serviceOptions: ['Portret sessiya', "To'y suratlari", 'Oilaviy sessiya', 'Tijorat / mahsulot', 'Sayohat'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 4. TURIZM =================== */
  add({
    id: 'turizm', name: 'Turagentlik', cat: 'Tadbir va turizm', icon: 'globe', badge: 'Ommabop',
    tags: ['turizm', 'turagentlik', 'sayohat', 'tur', 'travel', 'tour', 'туризм', 'путешествия', 'visa'],
    look: 'cinema',
    desc: "Turagentlik uchun: sarguzashtli bosh ekran, turlar narxlari, yo'nalishlar va so'rov formasi.",
    build: () => ({
      v: 2, template: 'turizm',
      company: { name: 'Silk Road Travel', logo: 'S', tagline: "Dunyoni biz bilan kashf eting. Ishonchli turlar, halol narxlar." },
      theme: { preset: 'ocean', accent: '', accent2: '', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Tur tanlash', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Yozgi turlarga erta bron: 15% chegirma", link: '#turlar' }, orders: NO_ORD,
      contacts: { phone: '+998 71 205 30 30', email: 'tur@silkroad.uz', address: "Toshkent, Shayxontohur tumani, Navoiy ko'chasi 30", hours: 'Har kuni 9:00 – 20:00', telegram: '@silkroad_travel', instagram: '@silkroad.travel' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: '2026 mavsumi: turlar ochiq', titleStart: "Orzuingizdagi *sayohat* shu yerdan boshlanadi", words: [], titleEnd: '', text: "Dengiz, tog' va madaniy turlar: aviachiptadan mehmonxonagacha, vizadan transferga qadar hammasini biz tashkil qilamiz.", cta1Text: 'Tur tanlash', cta1Link: '#turlar', cta2Text: "Bepul maslahat", cta2Link: '#bron', visual: 'none', image: P('turizm', 4), trust: [{ value: '15 000+', label: 'sayyoh' }, { value: '40+', label: 'yo\'nalish' }, { value: '4.9', label: 'baho' }] }),
        sec('lenta', 'marquee', { items: ['Turkiya', 'BAA', 'Misr', 'Maldiv', 'Tailand', 'Gruziya', 'Qirg\'iziston', 'Malayziya'] }),
        sec('turlar', 'menu', { navLabel: 'Turlar', eyebrow: 'Turlar', title: "Mashhur *turlar*", text: "Narxlar bir kishi uchun, aviachipta bilan.", mode: 'none', items: [
          { id: 't1', name: 'Antalya: hammasi kiritilgan', price: 6900000, category: '', description: "7 kecha, 5 yulduzli mehmonxona, ovqat va transfer.", tag: 'Hit', image: P('turizm', 1), active: true },
          { id: 't2', name: 'Dubay: shahar va cho\'l', price: 8400000, category: '', description: "5 kecha, ekskursiyalar, safari va Burj Xalifa.", tag: '', image: P('turizm', 4), active: true },
          { id: 't3', name: "Chimyon va Chorvoq", price: 1200000, category: '', description: "2 kunlik tog' dam olishi: transport, mehmonxona va gid.", tag: 'Yangi', image: P('turizm', 6), active: true },
          { id: 't4', name: 'Issiqko\'l sayohati', price: 3600000, category: '', description: "4 kecha, tog' ko'llari va Qirg'iziston madaniyati.", tag: '', image: P('turizm', 2), active: true },
          { id: 't5', name: 'Gruziya: Tbilisi va Batumi', price: 7500000, category: '', description: "6 kecha, vino tur va tarixiy joylar.", tag: '', image: P('turizm', 3), active: true },
          { id: 't6', name: "Buyuk ipak yo'li", price: 2900000, category: '', description: "Samarqand, Buxoro va Xiva: 5 kunlik madaniy sayohat.", tag: 'Mahalliy', image: P('turizm', 5), active: true }] }),
        sec('yonalish', 'bento', { navLabel: "Yo'nalishlar", eyebrow: "Yo'nalishlar", title: "Qayerga *uchamiz*?", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Tropik orollar', text: "Moviy suv va oq qum", value: '', icon: 'sun', image: P('turizm', 1), link: '#bron' },
          { kind: 'stat', size: 's', tall: false, title: "yo'nalish", text: '', value: '40+', icon: 'globe', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: "Tog'lar", text: "Toza havo va sarguzasht", value: '', icon: 'pin', image: P('turizm', 3), link: '#bron' },
          { kind: 'hl', size: 'm', tall: false, title: 'Viza yordami', text: "Hujjatlar bizdan, xotirjamlik sizdan.", value: '100%', icon: 'shield', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Sokin ko\'llar', text: 'Tabiat bag\'rida dam', value: '', icon: 'leaf', image: P('turizm', 6), link: '#bron' }] }),
        sec('afzallik', 'features', { eyebrow: 'Nega biz', title: "Xotirjam *sayohat* qiling", text: '', layout: 'grid', items: [
          { icon: 'shield', title: 'Kafolatlangan bron', text: "Shartnoma asosida ishlaymiz, barcha xizmatlar sug'urtalangan." },
          { icon: 'dollar', title: 'Yashirin to\'lovlar yo\'q', text: "Narx oldindan aniq: keyin qo'shimcha to'lov so'ralmaydi." },
          { icon: 'support', title: '24/7 yordam', text: "Sayohat davomida har doim aloqadamiz." },
          { icon: 'award', title: '12 yillik tajriba', text: "Minglab mamnun sayyohlar bizni tavsiya qiladi." }] }),
        sec('galereya', 'gallery', { eyebrow: 'Galereya', title: "Mijozlarimiz *ko'rgan* joylar", text: '', layout: 'masonry', items: [
          { image: P('turizm', 1), caption: '' }, { image: P('turizm', 3), caption: '' }, { image: P('turizm', 2), caption: '' }, { image: P('turizm', 4), caption: '' }, { image: P('turizm', 6), caption: '' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Sayyohlar *aytadi*", text: '', layout: 'wall', items: [
          { text: "Antalyada dam oldik, hammasi aytilganidek. Transfer ham o'z vaqtida kutib oldi.", name: 'Dilnoza Rahimova', role: 'Antalya turi', image: P('odam', 1), stars: 5 },
          { text: "Birinchi marta chet elga chiqdik, viza masalasida juda yordam berishdi.", name: 'Jasur Tursunov', role: 'Dubay turi', image: P('odam', 5), stars: 5 },
          { text: "Issiqko'l sayohati oilamiz uchun eng yaxshi dam olish bo'ldi.", name: 'Madina Qodirova', role: "Issiqko'l turi", image: P('odam', 3), stars: 5 },
          { text: "Narxlar boshqalarga qaraganda arzonroq, xizmat esa a'lo darajada.", name: 'Bobur Yusupov', role: 'Gruziya turi', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Tur narxiga nimalar kiradi?", a: "Aviachipta, mehmonxona, transfer va ko'rsatilgan ovqat. Har bir tur tavsifida to'liq ro'yxat bor." },
          { q: "Viza yordami bormi?", a: "Ha, hujjatlarni tayyorlash va topshirishda to'liq yordam beramiz." },
          { q: "Bronni bekor qilsam pul qaytariladimi?", a: "Jo'nashdan 14 kun oldin bekor qilinsa, to'lov to'liq qaytariladi." },
          { q: "Bolalar uchun chegirma bormi?", a: "2 yoshgacha bepul, 12 yoshgacha 30 foizgacha chegirma beriladi." }] }),
        sec('bron', 'contact', { navLabel: 'So\'rov', eyebrow: 'Tur so\'rovi', title: "Sayohatingizni *rejalashtiramiz*", text: "Yo'nalish va sanani yozing, menejerimiz 15 daqiqada javob beradi.", form: 'booking', serviceOptions: ["Dengiz dam olishi", "Tog' turi", 'Madaniy sayohat', 'Viza yordami', "Individual tur"], askGuests: true, askAddress: false, payOptions: [], submitText: "So'rov yuborish", mapUrl: '' }),
      ],
    }),
  });

  /* =================== 5. TO'Y =================== */
  add({
    id: 'toy', name: "To'y va tadbirlar", cat: 'Tadbir va turizm', icon: 'heart', badge: 'Yangi',
    tags: ['toy', "to'y", 'tadbir', 'bayram', 'wedding', 'event', 'banket', 'свадьба', 'мероприятие', 'nikoh'],
    look: 'luxe',
    desc: "To'y va tadbirlar tashkilotchisi uchun: romantik dizayn, paketlar, galereya va bron.",
    build: () => ({
      v: 2, template: 'toy',
      company: { name: 'Gulnoz Events', logo: 'G', tagline: "Eng baxtli kuningizni bizga ishoning. Nikoh va bayramlar tashkilotchisi." },
      theme: { preset: 'rose', accent: '#c58a6b', accent2: '', look: 'luxe', motion: true, font: 'luxe', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Sanani band qilish', ctaLink: '#bron', search: false },
      announce: NO_ANN, orders: NO_ORD,
      contacts: { phone: '+998 90 888 77 66', email: 'toy@gulnoz.uz', address: "Toshkent, Yakkasaroy tumani, Bobur ko'chasi 44", hours: 'Har kuni 10:00 – 20:00', telegram: '@gulnoz_events', instagram: '@gulnoz.events' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: "To'y mavsumi 2026: sanalar band bo'lmoqda", titleStart: "Sevgi hikoyangiz, *go'zal* tadbirda", words: [], titleEnd: '', text: "Nikoh, to'y va yubileylarni boshidan oxirigacha tashkil qilamiz: zal, bezak, taom, musiqa va fotograf.", cta1Text: 'Sanani band qilish', cta1Link: '#bron', cta2Text: 'Paketlar', cta2Link: '#paket', visual: 'none', image: P('toy', 3), trust: [{ value: '400+', label: "o'tkazilgan to'y" }, { value: '9 yil', label: 'tajriba' }, { value: '5.0', label: 'juftliklar bahosi' }] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Biz haqimizda', text: "Har bir to'y *takrorlanmas* hikoya. Biz sizning orzuyingizni *tafsilotlargacha* o'ylab, tashvishsiz bayramga aylantiramiz.", author: 'Gulnoza Karimova', role: 'Asoschi va bosh tashkilotchi', image: P('odam', 8), buttonText: '', buttonLink: '#' }),
        sec('xizmat', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Siz uchun *nima* qilamiz", text: '', items: [
          { title: "To'y tashkil qilish", text: "Rejalashtirishdan oxirgi mehmon ketguncha: hammasi bir qo'lda.", tags: ['Reja', 'Koordinator'], image: P('toy', 1), link: '#bron' },
          { title: 'Bezak va floristika', text: "Zal bezagi, gul kompozitsiyalari va fotozona.", tags: ['Gullar', 'Dekor'], image: P('toy', 4), link: '#bron' },
          { title: 'Taom va xizmat', text: "Banket menyusi, ofitsiantlar va shampan minorasi.", tags: ['Menyu', 'Banket'], image: P('toy', 5), link: '#bron' },
          { title: 'Foto va video', text: "Nikoh kuni suratga olish va qisqa filmlar.", tags: ['Foto', 'Video'], image: P('toy', 6), link: '#bron' }] }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: "Baxtli *lahzalar*", text: '', layout: 'masonry', items: [
          { image: P('toy', 1), caption: '' }, { image: P('toy', 3), caption: '' }, { image: P('toy', 5), caption: '' }, { image: P('toy', 2), caption: '' }, { image: P('toy', 6), caption: '' }, { image: P('toy', 4), caption: '' }] }),
        sec('paket', 'pricing', { navLabel: 'Paketlar', eyebrow: 'Paketlar', title: "O'zingizga *mos* paket", text: "Narxlar 100 kishilik tadbir uchun. Individual hisob-kitob ham mumkin.", items: [
          { name: 'Nikoh', price: "12 000 000 so'm", period: '', features: ['Zal bezagi', 'Tadbir koordinatori', 'Fotograf (4 soat)', 'Gul kompozitsiyalari'], popular: false, cta: 'Tanlash' },
          { name: "To'liq to'y", price: "35 000 000 so'm", period: '', features: ['Zal va to\'liq bezak', 'Banket menyusi', 'Foto va video', 'Musiqa va boshlovchi', 'Mehmonlar uchun transfer'], popular: true, cta: 'Tanlash' },
          { name: 'Premium', price: "75 000 000 so'm", period: '', features: ['Hashamatli bezak', 'Shaxsiy menejer', 'Dron suratga olish', 'Qo\'shiqchi va shou dastur', 'Fotokitob'], popular: false, cta: 'Tanlash' }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: "Qanday *ishlaymiz*", text: '', layout: 'stack', items: [
          { title: 'Tanishuv va g\'oya', text: "Uchrashib, orzuyingiz, byudjet va sanalarni muhokama qilamiz." },
          { title: 'Reja va konsepsiya', text: "Moodboard, zal, menyu va ishtirokchilar bo'yicha aniq reja tuzamiz." },
          { title: 'Tayyorgarlik', text: "Barcha yetkazib beruvchilar bilan kelishamiz, har bosqichni sizga ko'rsatamiz." },
          { title: 'Bayram kuni', text: "Siz dam olasiz va xursand bo'lasiz, qolganini jamoamiz bajaradi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Juftliklar *aytadi*", text: '', layout: 'wall', items: [
          { text: "To'yimiz ertakdagidek bo'ldi. Mehmonlar hanuz maqtashadi.", name: 'Zarina va Otabek', role: "To'y 2025", image: P('odam', 8), stars: 5 },
          { text: "Biz hech narsa haqida o'ylamadik, hamma narsa muammosiz o'tdi.", name: 'Kamola va Sardor', role: 'Nikoh 2025', image: P('odam', 6), stars: 5 },
          { text: "Bezak va gul kompozitsiyalari kutganimizdan ham chiroyli chiqdi.", name: 'Madina Qodirova', role: 'Yubiley', image: P('odam', 1), stars: 5 },
          { text: "Jamoa har bir tafsilotga e'tibor berdi. Chin dildan tavsiya qilamiz.", name: 'Bobur Yusupov', role: "Qiz to'yi", image: P('odam', 4), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "To'ydan qancha oldin band qilish kerak?", a: "Mavsum vaqtida 4–6 oy oldin, boshqa vaqtda 1–2 oy oldin yozilishni tavsiya etamiz." },
          { q: "Zalni siz topib berasizmi?", a: "Ha, hamkor zallarimiz bor, shuningdek siz tanlagan zalda ham ishlaymiz." },
          { q: "Oldindan to'lov qancha?", a: "Sanani band qilish uchun umumiy summaning 20 foizi to'lanadi." },
          { q: "Shaharlardan tashqarida ham ishlaysizmi?", a: "Ha, butun O'zbekiston bo'ylab tadbirlar o'tkazamiz." }] }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Band qilish', title: "Sanani *band qiling*", text: "Sana, mehmonlar soni va tadbir turini yozing, 1 kun ichida taklif yuboramiz.", form: 'booking', serviceOptions: ["To'y", 'Nikoh', 'Yubiley', "Tug'ilgan kun", 'Korporativ tadbir'], askGuests: true, askAddress: false, payOptions: [], submitText: 'Band qilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 6. MUSIQA / DJ =================== */
  add({
    id: 'musiqa', name: 'DJ va musiqachi', cat: 'Portfolio', icon: 'star', badge: '',
    tags: ['dj', 'musiqa', 'musiqachi', 'qo\'shiqchi', 'konsert', 'music', 'band', 'диджей', 'музыка'],
    look: 'cinema',
    desc: "DJ, qo'shiqchi va guruhlar uchun: qorong'i neon dizayn, videolar, chiqishlar va bron.",
    build: () => ({
      v: 2, template: 'musiqa',
      company: { name: 'DJ Orbit', logo: 'O', tagline: "Raqs maydonini yondiramiz. To'ylar, klublar va festivallar." },
      theme: { preset: 'dark', accent: '#c026d3', accent2: '#22d3ee', look: 'cinema', motion: true, font: 'wide', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Chiqishga taklif', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Yangi mix chiqdi: Orbit Sessions Vol. 7", link: '#video' }, orders: NO_ORD,
      contacts: { phone: '+998 97 400 50 50', email: 'book@djorbit.uz', address: "Toshkent, Mirzo Ulug'bek tumani", hours: 'Har kuni 12:00 – 24:00', telegram: '@dj_orbit', instagram: '@dj.orbit' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: '2026 mavsumi: sanalar ochiq', titleStart: "Musiqa *sizni* tark etmaydi", words: [], titleEnd: '', text: "DJ Orbit: elektron musiqa, to'y dasturlari va klub kechalari. 300 dan ortiq chiqish, har safar yangi energiya.", cta1Text: 'Chiqishga taklif', cta1Link: '#bron', cta2Text: 'Mixlarni tinglash', cta2Link: '#video', visual: 'none', image: P('musiqa', 1), trust: [{ value: '300+', label: 'chiqish' }, { value: '8 yil', label: 'sahnada' }, { value: '50K', label: 'tinglovchi' }] }),
        sec('lenta', 'marquee', { items: ['House', 'Techno', 'Deep', 'Afro', 'Live set', "To'y dasturi", 'Klublar', 'Festivallar'] }),
        sec('video', 'video', { navLabel: 'Video', eyebrow: 'Jonli', title: "Mixlarni *tinglang*", text: "Oxirgi chiqishlardan eng yaxshi daqiqalar.", url: '', poster: P('musiqa', 5), caption: 'Orbit Sessions Vol. 7' }),
        sec('chiqish', 'showcase', { navLabel: 'Chiqishlar', eyebrow: 'Sahna', title: "Unutilmas *kechalar*", text: '', items: [
          { title: 'Sahna shousi', tag: 'Festival', image: P('musiqa', 2), link: '' },
          { title: 'Klub kechasi', tag: 'Toshkent', image: P('musiqa', 3), link: '' },
          { title: 'Ochiq osmon ostida', tag: 'Open air', image: P('musiqa', 4), link: '' },
          { title: 'DJ set', tag: 'Vinil', image: P('musiqa', 5), link: '' },
          { title: 'Studiya', tag: 'Yangi treklar', image: P('musiqa', 6), link: '' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 300, suffix: '+', label: 'chiqish' }, { value: 12, suffix: '', label: 'shahar' }, { value: 50, suffix: 'K', label: 'obunachi' }, { value: 8, suffix: ' yil', label: 'tajriba' }] }),
        sec('xizmat', 'features', { eyebrow: 'Xizmatlar', title: "Qayerda *chalaman*", text: '', layout: 'grid', items: [
          { icon: 'heart', title: "To'ylar", text: "Mehmonlar yoshiga qarab musiqa va raqs dasturi." },
          { icon: 'star', title: 'Klublar', text: "Premium ovoz va yorug'lik bilan klub setlari." },
          { icon: 'users', title: 'Korporativ kechalar', text: "Brend tadbirlari va yilnoma bayramlari uchun." },
          { icon: 'zap', title: "Shaxsiy kechalar", text: "Tug'ilgan kun va yopiq partilar." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *fikri*", text: '', layout: 'grid', items: [
          { text: "To'yimizda raqs maydoni soat 3 gacha bo'sh qolmadi. Rahmat!", name: 'Nilufar va Aziz', role: "To'y 2025", image: P('odam', 8), stars: 5 },
          { text: "Klubimizda eng yaxshi kechalardan biri bo'ldi. Mehmonlar hanuz so'rashadi.", name: 'Sherzod Umarov', role: 'Klub egasi', image: P('odam', 5), stars: 5 },
          { text: "Professional, o'z vaqtida va juda iste'dodli. Tavsiya qilamiz.", name: 'Madina Qodirova', role: 'Event agentlik', image: P('odam', 6), stars: 5 }] }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Chiqishga taklif', title: "Sanani *band qiling*", text: "Tadbir turi va sanani yozing, 24 soat ichida narx bilan javob beramiz.", form: 'booking', serviceOptions: ["To'y", 'Klub kechasi', 'Korporativ tadbir', "Tug'ilgan kun", 'Festival'], askGuests: true, askAddress: false, payOptions: [], submitText: 'Taklif yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 7. STARTAP / SAAS =================== */
  add({
    id: 'startap', name: 'Startap / SaaS landing', cat: 'Biznes', icon: 'zap', badge: 'Yangi',
    tags: ['startap', 'saas', 'landing', 'mahsulot', 'startup', 'product', 'crm', 'стартап', 'сервис'],
    look: 'cinema',
    desc: "Startap va SaaS mahsulot uchun: nurli bosh ekran, imkoniyatlar, 3 ta tarif va FAQ.",
    build: () => ({
      v: 2, template: 'startap',
      company: { name: 'Flowly', logo: 'F', tagline: "Jamoangiz vazifalarini bir joyda boshqaring." },
      theme: { preset: 'light', accent: '#5b5bf0', accent2: '#06b6d4', look: 'cinema', motion: true, font: 'modern', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Bepul boshlash', ctaLink: '#narx', search: false },
      announce: { enabled: true, text: "Yangi: AI yordamchi endi barcha tariflarda", link: '#imkon' }, orders: NO_ORD,
      contacts: { phone: '+998 78 150 00 15', email: 'hello@flowly.uz', address: "Toshkent, IT Park", hours: 'Dush–Juma, 9:00–18:00', telegram: '@flowly_uz', instagram: '@flowly.uz' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'aurora', fx: 'aurora', badge: 'Yangi: AI yordamchi', titleStart: "Ishlaringiz *oqimga* tushadi", words: [], titleEnd: '', text: "Flowly bilan loyihalar, vazifalar va jamoani bitta ekranda boshqaring. 14 kun bepul, karta shart emas.", cta1Text: 'Bepul boshlash', cta1Link: '#narx', cta2Text: "Imkoniyatlar", cta2Link: '#imkon', visual: 'image', image: P('elektronika', 2), trust: [{ value: '12 000+', label: 'jamoa' }, { value: '4.9', label: 'baho' }, { value: '99.9%', label: 'ish vaqti' }] }),
        sec('logo', 'logos', { title: 'Bizga yetakchi jamoalar ishonadi', items: [{ name: 'Nexora', image: '' }, { name: 'PayTech', image: '' }, { name: 'Baraka', image: '' }, { name: 'Uzum', image: '' }, { name: 'Logix', image: '' }, { name: 'Oltin Non', image: '' }, { name: 'FitZone', image: '' }] }),
        sec('imkon', 'bento', { navLabel: 'Imkoniyatlar', eyebrow: 'Imkoniyatlar', title: "Hammasi *bir* joyda", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Vazifalar taxtasi', text: "Kanban, ro'yxat va kalendar ko'rinishlari.", value: '', icon: 'layers', image: P('startap', 2), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'tezroq bajariladi', text: '', value: '3x', icon: 'zap', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'AI yordamchi', text: "Vazifalarni o'zi rejalaydi va xulosa yozadi.", value: '', icon: 'zap', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Integratsiyalar', text: "Telegram, Google, Slack va 50+ xizmat.", value: '50+', icon: 'cloud', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Jamoaviy ishlash', text: "Izohlar va real vaqt rejimi.", value: '', icon: 'users', image: P('startap', 3), link: '' }] }),
        sec('biz', 'statement', { eyebrow: 'Maqsadimiz', text: "Jamoalar *tartibsizlikda* emas, *oqimda* ishlashi kerak. Flowly kundalik tashvishni olib tashlab, asosiy ishga joy qoldiradi.", author: '', role: '', image: '', buttonText: '', buttonLink: '#' }),
        sec('jarayon', 'process', { navLabel: 'Qanday ishlaydi', eyebrow: 'Boshlash', title: "3 qadamda *tayyor*", text: '', layout: 'grid', items: [
          { title: "Ro'yxatdan o'ting", text: "30 soniyada, karta ma'lumotisiz." },
          { title: 'Jamoani taklif qiling', text: "Havola yuboring: hamkasblar bir bosishda qo'shiladi." },
          { title: 'Ishni boshlang', text: "Shablonlardan tanlang yoki o'z jarayoningizni yarating." }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 12000, suffix: '+', label: 'faol jamoa' }, { value: 2, suffix: ' mln+', label: 'bajarilgan vazifa' }, { value: 40, suffix: '%', label: 'vaqt tejaladi' }, { value: 99, suffix: '.9%', label: 'ish vaqti' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Jamoalar *sevadi*", text: '', layout: 'wall', items: [
          { text: "Flowly dan keyin yig'ilishlar yarmiga qisqardi. Hamma nima qilayotganini ko'radi.", name: 'Aziz Karimov', role: 'Nexora, CEO', image: P('odam', 1), stars: 5 },
          { text: "Eng yaxshi tomoni oddiyligi. Jamoa bir kunda o'rgandi.", name: 'Dilnoza Rahimova', role: 'PayTech, COO', image: P('odam', 3), stars: 5 },
          { text: "AI yordamchi haftasiga 5 soat tejaydi. Narxiga arziydi.", name: 'Jasur Tursunov', role: 'Logix, CTO', image: P('odam', 5), stars: 5 },
          { text: "Integratsiyalar juda qulay: Telegram bilan bog'lash 1 daqiqa.", name: 'Madina Qodirova', role: 'Baraka, marketing', image: P('odam', 6), stars: 5 }] }),
        sec('narx', 'pricing', { navLabel: 'Narxlar', eyebrow: 'Narxlar', title: "Oddiy va *shaffof* narx", text: "14 kun bepul sinab ko'ring. Istalgan vaqtda bekor qiling.", items: [
          { name: 'Start', price: "0 so'm", period: '/oy', features: ['5 tagacha foydalanuvchi', '3 ta loyiha', 'Kanban va ro\'yxat', 'Email yordam'], popular: false, cta: 'Bepul boshlash' },
          { name: 'Jamoa', price: "89 000 so'm", period: '/foydalanuvchi, oy', features: ['Cheksiz loyiha', 'AI yordamchi', '50+ integratsiya', 'Hisobotlar va tahlil', 'Ustuvor yordam'], popular: true, cta: 'Sinab ko\'rish' },
          { name: 'Biznes', price: "Kelishiladi", period: '', features: ['SSO va xavfsizlik', 'Shaxsiy menejer', 'Maxsus integratsiya', 'SLA kafolati'], popular: false, cta: "Bog'lanish" }] }),
        sec('savol', 'faq', { navLabel: 'FAQ', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Bepul sinov davrida nimalar mavjud?", a: "14 kun davomida Jamoa tarifining barcha imkoniyatlari ochiq, karta ma'lumoti talab qilinmaydi." },
          { q: "Ma'lumotlarim xavfsizmi?", a: "Ha, barcha ma'lumotlar shifrlanadi va har kuni zaxira nusxasi olinadi." },
          { q: "Boshqa dasturdan ko'chirib o'tish mumkinmi?", a: "Ha, Trello, Asana va Excel dan bir bosishda import qilasiz." },
          { q: "Tarifni keyin o'zgartirsam bo'ladimi?", a: "Istalgan vaqtda yuqoriga yoki pastga o'tishingiz mumkin." },
          { q: "To'lov qanday amalga oshiriladi?", a: "Payme, Click va bank kartalari orqali, shuningdek korxonalar uchun hisob-faktura bilan." }] }),
        sec('chaqiriq', 'cta', { fx: true, eyebrow: 'Tayyormisiz?', title: "Bugunoq *oqimga* tushing", text: "14 kun bepul. Karta shart emas.", buttonText: 'Bepul boshlash', buttonLink: '#aloqa', countdownTo: '', image: '' }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: "Savolingiz bormi? *Yozing*", text: "Demo ko'rsatamiz va savollaringizga javob beramiz.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 8. ILOVA =================== */
  add({
    id: 'ilova', name: 'Mobil ilova landing', cat: 'Biznes', icon: 'phone', badge: '',
    tags: ['ilova', 'mobil', 'app', 'android', 'ios', 'yuklab olish', 'приложение', 'mobile app'],
    look: 'cinema',
    desc: "Mobil ilovani taqdim etish uchun: imkoniyatlar, ekranlar, raqamlar va yuklab olish.",
    build: () => ({
      v: 2, template: 'ilova',
      company: { name: 'Yo\'lda', logo: 'Y', tagline: "Shahar bo'ylab harakatlanishning yangi usuli." },
      theme: { preset: 'fresh', accent: '#7c3aed', accent2: '#ec4899', look: 'cinema', motion: true, font: 'geometric', radius: 'round', bg: 'plain', heads: 'center', switcher: false },
      nav: { style: 'pill', cta: 'Yuklab olish', ctaLink: '#yuklash', search: false },
      announce: NO_ANN, orders: NO_ORD,
      contacts: { phone: '+998 78 777 11 22', email: 'hello@yolda.uz', address: "Toshkent, Mirobod tumani, Amir Temur ko'chasi 15", hours: 'Har kuni 8:00 – 22:00', telegram: '@yolda_app', instagram: '@yolda.app' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: "App Store va Google Play'da", titleStart: "Shahar *qo'lingizda*", words: [], titleEnd: '', text: "Yo'lda ilovasi bilan taksi, jamoat transporti va yo'l harakatini bir joyda kuzating. Vaqtni tejang, jonli xaritadan foydalaning.", cta1Text: 'Yuklab olish', cta1Link: '#yuklash', cta2Text: 'Imkoniyatlar', cta2Link: '#imkon', visual: 'image', image: P('ilova', 3), image2: P('ilova', 6), spinText: 'Yo\'lda • Yo\'lda • ', chips: ['4.8 reyting', '1 mln+ yuklab olish', 'Bepul'], trust: [] }),
        sec('lenta', 'marquee', { items: ['Jonli xarita', 'Tez taksi', 'Avtobus jadvali', 'Metro yo\'nalishi', 'Offline rejim', 'Qulay to\'lov'] }),
        sec('imkon', 'features', { navLabel: 'Imkoniyatlar', eyebrow: 'Imkoniyatlar', title: "Nega *Yo'lda*?", text: '', layout: 'bento', items: [
          { icon: 'pin', title: 'Jonli xarita', text: "Transport harakati real vaqtda ko'rinadi." },
          { icon: 'zap', title: 'Tez buyurtma', text: "Taksi 2 bosishda, o'rtacha 3 daqiqada keladi." },
          { icon: 'card', title: 'Qulay to\'lov', text: "Payme, Click va karta orqali bir tegishda." },
          { icon: 'bell', title: 'Aqlli bildirishnoma', text: "Transport kelishidan oldin eslatamiz." },
          { icon: 'shield', title: 'Xavfsizlik', text: "Haydovchilar tekshirilgan, safar kuzatiladi." },
          { icon: 'cloud', title: 'Offline rejim', text: "Internet yo'q joyda ham yo'nalishlar ishlaydi." }] }),
        sec('ekran', 'showcase', { navLabel: 'Ekranlar', eyebrow: 'Ilova ichida', title: "Ekranlarga *nazar* soling", text: '', items: [
          { title: 'Asosiy xarita', tag: 'Real vaqt', image: P('ilova', 1), link: '' },
          { title: 'Taksi buyurtmasi', tag: '2 bosishda', image: P('ilova', 2), link: '' },
          { title: "To'lov", tag: 'Karta va hamyon', image: P('ilova', 4), link: '' },
          { title: 'Yo\'nalishlar', tag: 'Avtobus va metro', image: P('ilova', 5), link: '' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 1, suffix: ' mln+', label: 'yuklab olish' }, { value: 4.8, suffix: '/5', label: 'ilova reytingi' }, { value: 12, suffix: '', label: 'shahar' }, { value: 3, suffix: ' daq', label: "o'rtacha kutish" }] }),
        sec('jarayon', 'process', { navLabel: 'Qanday ishlaydi', eyebrow: 'Boshlash', title: "3 qadamda *tayyor*", text: '', layout: 'grid', items: [
          { title: 'Yuklab oling', text: "App Store yoki Google Play dan bepul o'rnating." },
          { title: "Raqamni kiriting", text: "SMS kod orqali 20 soniyada ro'yxatdan o'ting." },
          { title: "Yo'lga chiqing", text: "Manzilni belgilang va qulay yo'nalishni tanlang." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Foydalanuvchilar *fikri*", text: '', layout: 'grid', items: [
          { text: "Har kuni ishga ketishda ishlataman. Avtobus qachon kelishini aniq ko'rsatadi.", name: 'Dilnoza Rahimova', role: 'Foydalanuvchi', image: P('odam', 1), stars: 5 },
          { text: "Taksi tez keladi, to'lov esa juda qulay. Boshqa ilovaga qaytmayman.", name: 'Jasur Tursunov', role: 'Foydalanuvchi', image: P('odam', 5), stars: 5 },
          { text: "Offline rejim ayniqsa metroda juda qo'l keladi.", name: 'Madina Qodirova', role: 'Talaba', image: P('odam', 6), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Ilova bepulmi?", a: "Ha, yuklab olish va foydalanish bepul. Faqat taksi xizmati uchun to'lanadi." },
          { q: "Qaysi shaharlarda ishlaydi?", a: "Hozir 12 ta shaharda: Toshkent, Samarqand, Buxoro, Andijon va boshqalar." },
          { q: "Qaysi qurilmalar qo'llab-quvvatlanadi?", a: "iOS 14+ va Android 8+." },
          { q: "To'lov xavfsizmi?", a: "Ha, barcha to'lovlar shifrlangan kanal orqali, karta ma'lumotlari saqlanmaydi." }] }),
        sec('yuklash', 'cta', { fx: true, eyebrow: 'Hoziroq boshlang', title: "Ilovani *bepul* yuklab oling", text: "App Store va Google Play da. Ro'yxatdan o'tish 20 soniya.", buttonText: 'Yuklab olish', buttonLink: '#aloqa', countdownTo: '', image: '' }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: "Savolingiz *bormi*?", text: "Yordam jamoamiz har kuni 8:00 dan 22:00 gacha aloqada.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 9. ORGANIK =================== */
  add({
    id: 'organik', name: 'Fermer va organik mahsulotlar', cat: 'Savdo', icon: 'leaf', badge: 'Yangi',
    tags: ['organik', 'fermer', 'ferma', 'tabiiy', 'mahsulot', 'meva', 'sabzavot', 'organic', 'farm', 'фермер', 'органик'],
    look: 'cinema',
    desc: "Fermer xo'jaligi va organik mahsulotlar do'koni: savat, buyurtma va tabiiylik hikoyasi.",
    build: () => ({
      v: 2, template: 'organik',
      company: { name: 'Yashil Dala', logo: 'Y', tagline: "Fermadan to'g'ridan-to'g'ri stolingizga. Tabiiy va yangi." },
      theme: { preset: 'fresh', accent: '#3f9b4f', accent2: '', look: 'cinema', motion: true, font: 'soft', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Buyurtma berish', ctaLink: '#katalog', search: false },
      announce: { enabled: true, text: "300 000 so'mdan ortiq buyurtmaga yetkazib berish bepul", link: '#katalog' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 300000, deliveryFee: 25000 },
      contacts: { phone: '+998 90 222 33 44', email: 'ferma@yashildala.uz', address: "Toshkent viloyati, Zangiota tumani", hours: 'Har kuni 8:00 – 20:00', telegram: '@yashildala', instagram: '@yashil.dala' },
      footer: FT(),
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: 'Har kuni yangi hosil', titleStart: "Haqiqiy *ta'm* fermadan keladi", words: [], titleEnd: '', text: "Kimyoviy o'g'itlarsiz yetishtirilgan meva, sabzavot va asal. Ertalab terib, kechgacha eshigingizgacha yetkazamiz.", cta1Text: 'Buyurtma berish', cta1Link: '#katalog', cta2Text: 'Fermamiz haqida', cta2Link: '#jarayon', visual: 'none', image: P('organik', 5), trust: [{ value: '100%', label: 'organik' }, { value: '24 soat', label: 'terishdan yetkazishgacha' }, { value: '3000+', label: 'oila' }] }),
        sec('lenta', 'marquee', { items: ['Organik', 'Kimyoviy o\'g\'itsiz', 'Yangi hosil', 'Mahalliy ferma', 'Tez yetkazish', 'Sertifikatlangan'] }),
        sec('katalog', 'products', { navLabel: 'Katalog', eyebrow: 'Katalog', title: "Bugungi *hosil*", text: "Har kuni ertalab yangi terilgan mahsulotlar. Buyurtma bering.", mode: 'cart', buttonText: 'Savatga', columns: '4', search: true, filters: true, sort: true, items: [
          { id: 'o1', name: 'Qizil olma (1 kg)', price: 18000, oldPrice: 0, category: 'Mevalar', badge: 'Yangi', description: "Shirin va xushbo'y, bog'dan yangi terilgan.", image: P('organik', 5), stock: 120, active: true },
          { id: 'o2', name: 'Apelsin (1 kg)', price: 26000, oldPrice: 32000, category: 'Mevalar', badge: '-20%', description: "Sersuv va vitaminli, tabiiy pishgan.", image: P('organik', 6), stock: 80, active: true },
          { id: 'o3', name: 'Shirin makkajo\'xori (5 dona)', price: 15000, oldPrice: 0, category: 'Sabzavotlar', badge: '', description: "Dalada pishgan, qaynatishga tayyor.", image: P('organik', 4), stock: 60, active: true },
          { id: 'o4', name: 'Pomidor (1 kg)', price: 14000, oldPrice: 0, category: 'Sabzavotlar', badge: '', description: "Issiqxonasiz, quyoshda pishgan.", image: P('market', 3), stock: 90, active: true },
          { id: 'o5', name: 'Mavsumiy rezavorlar (500 g)', price: 38000, oldPrice: 0, category: 'Mevalar', badge: 'Hit', description: "Qulupnay, malina va smorodina aralashmasi.", image: P('market', 6), stock: 40, active: true },
          { id: 'o6', name: 'Qishloq asali (1 kg)', price: 95000, oldPrice: 0, category: 'Asal va quruq mevalar', badge: '', description: "Tog' o'tlaridan, sun'iy qo'shimchalarsiz.", image: P('market', 4), stock: 35, active: true },
          { id: 'o7', name: 'Mevalar savati', price: 120000, oldPrice: 145000, category: 'Savatlar', badge: 'Sovg\'a', description: "5 xil mavsumiy meva: sovg'a uchun ideal.", image: P('market', 2), stock: 25, active: true },
          { id: 'o8', name: 'Sabzavot qutisi (5 kg)', price: 85000, oldPrice: 0, category: 'Savatlar', badge: '', description: "Haftalik oila uchun 7 xil sabzavot.", image: P('market', 5), stock: 50, active: true }] }),
        sec('jarayon', 'split', { navLabel: 'Fermamiz', eyebrow: 'Fermadan stolgacha', title: '', text: '', items: [
          { label: '01', title: "Tuproq va *mehnat*", text: "Mahsulotlar o'z fermamizda, kimyoviy o'g'itsiz, an'anaviy usulda yetishtiriladi.", bullets: ['Organik o\'g\'it', 'Qo\'lda yig\'ish', 'Sertifikatlangan'], image: P('organik', 3), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Ertalab terib, kechqurun *yetkazamiz*", text: "Mahsulot terilgan kunning o'zida sovutgichli mashinada sizga yetib boradi.", bullets: ['24 soat ichida yetkazish', 'Sovutgichli transport', 'Yangilik kafolati'], image: P('organik', 4), buttonText: 'Buyurtma berish', buttonLink: '#katalog' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 3000, suffix: '+', label: 'doimiy mijoz' }, { value: 40, suffix: ' gektar', label: 'ferma maydoni' }, { value: 100, suffix: '%', label: 'tabiiy' }, { value: 24, suffix: ' soat', label: 'yetkazish' }] }),
        sec('qadam', 'process', { eyebrow: 'Qanday ishlaydi', title: "Buyurtmadan *eshikkacha*", text: '', layout: 'grid', items: [
          { title: 'Tanlang', text: "Katalogdan kerakli mahsulotlarni savatga soling." },
          { title: 'Terib olamiz', text: "Buyurtmangiz ertalab fermamizda yangi terib tayyorlanadi." },
          { title: 'Qadoqlaymiz', text: "Ekologik qadoqda va sovuq zanjirda saqlanadi." },
          { title: 'Yetkazamiz', text: "Kuryer belgilangan vaqtda eshigingizgacha olib keladi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlarimiz *aytadi*", text: '', layout: 'wall', items: [
          { text: "Olmaning ta'mi bolalikdagidek. Bolalarim boshqa do'kondan olishimizga yo'l qo'ymaydi.", name: 'Dilnoza Rahimova', role: 'Doimiy mijoz', image: P('odam', 1), stars: 5 },
          { text: "Sabzavot qutisi har hafta eshigimga keladi, juda qulay va yangi.", name: 'Madina Qodirova', role: 'Doimiy mijoz', image: P('odam', 6), stars: 5 },
          { text: "Asal haqiqiy. Sertifikatlarini ko'rsatishdi, endi faqat shu yerdan olaman.", name: 'Jasur Tursunov', role: 'Mijoz', image: P('odam', 5), stars: 5 },
          { text: "Restoranim uchun ulgurji olaman. Sifat doimiy barqaror.", name: 'Bobur Yusupov', role: 'Restoran egasi', image: P('odam', 4), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Mahsulotlar haqiqatan organikmi?", a: "Ha, mahsulotlar kimyoviy o'g'itsiz yetishtiriladi. Sertifikatlar so'rov bo'yicha ko'rsatiladi." },
          { q: "Yetkazib berish qancha turadi?", a: "25 000 so'm, 300 000 so'mdan yuqori buyurtmaga bepul." },
          { q: "Qachon yetkaziladi?", a: "Ertalab 11:00 gacha berilgan buyurtmalar o'sha kuni, undan keyin ertasi kuni." },
          { q: "Ulgurji sotib olsa bo'ladimi?", a: "Ha, restoran va do'konlar uchun alohida narxlar bor. Biz bilan bog'laning." }] }),
        sec('aloqa', 'contact', { navLabel: 'Buyurtma', eyebrow: 'Buyurtma', title: "Buyurtmani *rasmiylashtiring*", text: "Savatdagi mahsulotlar uchun manzil va telefon raqamingizni qoldiring.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Payme', 'Click'], submitText: 'Buyurtma berish', mapUrl: '' }),
      ],
    }),
  });
})();
