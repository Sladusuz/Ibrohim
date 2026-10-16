'use strict';
// Kasbiy shablonlar: har biri to'liq sayt ma'lumoti (company, theme, sections ...) beradi.
// Konstruktor shulardan birini tanlatadi, mijoz hammasini o'zgartira oladi.
(function () {
  const I = (p) => `/img/t/${p}.svg`;
  const T = [];
  const add = (t) => T.push(t);
  const sec = (id, type, o) => Object.assign({ id, type, enabled: true, navLabel: '' }, o);

  /* =================== 1. ONLAYN MARKET =================== */
  add({
    id: 'market', name: 'Onlayn market', cat: 'Savdo', icon: 'cart', badge: 'Eng ommabop',
    desc: "Do'kon va market uchun: katalog, qidiruv, chegirmalar, savat va yetkazib berish.",
    build: () => ({
      v: 2, template: 'market',
      company: { name: 'Baraka Market', logo: 'B', tagline: "Sifatli mahsulotlar, hamyonbop narxlar va tez yetkazib berish." },
      theme: { preset: 'fresh', accent: '', accent2: '', font: 'soft', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: "Bog'lanish", ctaLink: '#aloqa', search: true },
      announce: { enabled: true, text: "Bepul yetkazib berish: 300 000 so'mdan yuqori buyurtmalarga", link: '#katalog' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 300000, deliveryFee: 25000 },
      contacts: { phone: '+998 71 200 00 00', email: 'info@barakamarket.uz', address: "Toshkent sh., Chilonzor tumani, 12-kvartal", hours: 'Har kuni 9:00 – 21:00', telegram: '@barakamarket', instagram: '@barakamarket' },
      footer: { text: 'Barcha huquqlar himoyalangan.', links: [{ label: 'Katalog', url: '#katalog' }, { label: 'Savol-javob', url: '#savol' }, { label: 'Aloqa', url: '#aloqa' }] },
      sections: [
        sec('bosh', 'hero', { layout: 'shop', badge: 'Yangi mavsum', titleStart: 'Sevimli', words: ['texnika', 'kiyim', "sovg'a", 'xaridlar'], titleEnd: 'bir joyda', text: "Sifatli mahsulotlar, hamyonbop narxlar va kunlik yetkazib berish. Tanlang, savatga soling va buyurtma bering.", cta1Text: 'Xarid qilish', cta1Link: '#katalog', cta2Text: 'Chegirmalar', cta2Link: '#aksiya', visual: 'collage', image: '', windowLines: [], chips: ['−30% chegirma', 'Kunlik yetkazish', 'Kafolat bilan'],
          collage: [{ image: I('market/h1'), title: 'Charm sumka', price: '389 000' }, { image: I('market/h2'), title: 'Simsiz quloqchin', price: '549 000' }, { image: I('market/h3'), title: 'Sport poyabzal', price: '420 000' }],
          trust: [{ value: '12 000+', label: 'mamnun mijoz' }, { value: '2 kun', label: 'ichida yetkazish' }, { value: '4.9', label: 'reyting' }] }),
        sec('afzallik', 'features', { eyebrow: '', title: '', text: '', layout: 'strip', items: [{ icon: 'truck', title: 'Tez yetkazish', text: "Toshkent bo'ylab 1–2 kun" }, { icon: 'shield', title: 'Kafolat', text: 'Barcha mahsulotga kafolat' }, { icon: 'card', title: "Qulay to'lov", text: 'Naqd yoki karta orqali' }, { icon: 'refresh', title: 'Qaytarish', text: '14 kun ichida qaytarish' }] }),
        sec('kategoriya', 'categories', { navLabel: '', eyebrow: 'Kategoriyalar', title: 'Nima izlayapsiz?', text: '', items: [{ name: 'Elektronika', image: I('market/c-elektronika') }, { name: 'Kiyim', image: I('market/c-kiyim') }, { name: "Uy-ro'zg'or", image: I('market/c-uy') }, { name: "Sovg'alar", image: I('market/c-sovga') }] }),
        sec('katalog', 'products', { navLabel: 'Katalog', eyebrow: 'Katalog', title: 'Mashhur mahsulotlar', text: 'Eng ko\'p sotilayotgan va yangi mahsulotlar.', mode: 'cart', buttonText: '', columns: '4', search: true, filters: true, sort: true, items: [
          { id: 'telefon', name: 'Smartfon X12 Pro', price: 5490000, oldPrice: 6200000, category: 'Elektronika', badge: 'TOP', description: "6.7 dyuymli ekran, 128 GB xotira, 5000 mAh batareya.", image: I('market/p-phone'), stock: 8, active: true },
          { id: 'quloqchin', name: 'Simsiz quloqchin Air', price: 549000, oldPrice: 0, category: 'Elektronika', badge: 'YANGI', description: "Shovqinni bostirish, 30 soat ishlash, tez zaryadlash.", image: I('market/p-headphones'), stock: '', active: true },
          { id: 'soat', name: 'Aqlli soat Fit 3', price: 890000, oldPrice: 1100000, category: 'Elektronika', badge: '', description: "Yurak urishi, qadam hisoblagich va 7 kunlik batareya.", image: I('market/p-watch'), stock: 3, active: true },
          { id: 'noutbuk', name: 'Noutbuk Slim 14', price: 7900000, oldPrice: 0, category: 'Elektronika', badge: '', description: "14 dyuym, 16 GB RAM, 512 GB SSD, yengil korpus.", image: I('market/p-laptop'), stock: 5, active: true },
          { id: 'futbolka', name: 'Paxta futbolka Classic', price: 129000, oldPrice: 159000, category: 'Kiyim', badge: '', description: "100% paxta, yumshoq va nafas oluvchi mato.", image: I('market/p-shirt'), stock: '', active: true },
          { id: 'krossovka', name: 'Sport krossovka Run', price: 420000, oldPrice: 520000, category: 'Kiyim', badge: 'CHEGIRMA', description: "Yengil taglik, kundalik yurish va yugurish uchun.", image: I('market/p-shoe'), stock: '', active: true },
          { id: 'sumka', name: 'Charm sumka Milano', price: 389000, oldPrice: 0, category: 'Kiyim', badge: '', description: "Tabiiy charm, keng ichki bo'linmalar.", image: I('market/p-bag'), stock: 0, active: true },
          { id: 'krujka', name: 'Keramik krujka', price: 59000, oldPrice: 0, category: "Uy-ro'zg'or", badge: '', description: "350 ml, issiq ichimliklar uchun, idish yuvish mashinasida yuviladi.", image: I('market/p-cup'), stock: '', active: true },
          { id: 'termos', name: "Termos butilka 750 ml", price: 149000, oldPrice: 189000, category: "Uy-ro'zg'or", badge: '', description: "12 soat issiq, 24 soat sovuq saqlaydi.", image: I('market/p-bottle'), stock: '', active: true },
          { id: 'quti', name: 'Saqlash qutilari (3 dona)', price: 99000, oldPrice: 0, category: "Uy-ro'zg'or", badge: '', description: "Kiyim va mayda narsalar uchun qulay qutilar to'plami.", image: I('market/p-box'), stock: '', active: true },
          { id: 'sovga', name: "Sovg'a to'plami Premium", price: 249000, oldPrice: 0, category: "Sovg'alar", badge: 'YANGI', description: "Chiroyli qadoqda, bayram uchun tayyor to'plam.", image: I('market/p-gift'), stock: '', active: true },
          { id: 'pomada', name: "Mat pomada Rouge", price: 79000, oldPrice: 99000, category: "Sovg'alar", badge: '', description: "Uzoq saqlanadigan, yumshoq mat qoplama.", image: I('market/p-lipstick'), stock: '', active: true },
        ] }),
        sec('aksiya', 'cta', { navLabel: 'Aksiya', eyebrow: 'Hafta aksiyasi', title: 'Barcha elektronikaga −20% chegirma', text: 'Taklif cheklangan muddatga amal qiladi. Ulgurib qoling!', buttonText: 'Elektronikani ko\'rish', buttonLink: '#katalog', countdownTo: '2026-12-31', image: I('market/banner') }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlarimiz fikri', text: '', items: [{ text: "Buyurtma ertasigayoq yetib keldi, qadoqlash juda sifatli. Rahmat!", name: 'Madina A.', role: 'Toshkent', image: I('market/a1'), stars: 5 }, { text: "Narxlar boshqa joydagidan arzon, kafolat ham bor. Doimiy xarid qilaman.", name: 'Jasur T.', role: 'Samarqand', image: I('market/a2'), stars: 5 }, { text: "Qaytarish jarayoni juda oson bo'ldi, operatorlar yordam berishdi.", name: 'Dilnoza R.', role: 'Buxoro', image: I('market/a3'), stars: 4 }] }),
        sec('savol', 'faq', { navLabel: 'Savol-javob', eyebrow: 'Savollar', title: "Ko'p so'raladigan savollar", text: '', items: [{ q: 'Yetkazib berish qancha vaqt oladi?', a: "Toshkent bo'ylab 1–2 kun, viloyatlarga 3–5 kun ichida yetkazamiz." }, { q: "To'lovni qanday amalga oshiraman?", a: "Naqd pul yoki karta orqali, mahsulotni qabul qilganingizda to'laysiz." }, { q: 'Mahsulotni qaytarish mumkinmi?', a: "Ha, 14 kun ichida mahsulot ko'rinishi va qadog'i saqlangan bo'lsa, qaytarib olamiz." }, { q: 'Kafolat qanday beriladi?', a: "Elektronikaga 12 oygacha, boshqa tovarlarga ishlab chiqaruvchi kafolati amal qiladi." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: 'Savolingiz bormi?', text: "Buyurtma bering yoki bizga yozing, tez orada aloqaga chiqamiz.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Karta orqali'], submitText: 'Buyurtma berish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 2. PORTFOLIO: DIZAYNER =================== */
  add({
    id: 'dizayner', name: 'Portfolio: dizayner', cat: 'Portfolio', icon: 'design',
    desc: "Grafik dizayner, rassom va ijodkorlar uchun: katta tipografiya va loyihalar galereyasi.",
    build: () => ({
      v: 2, template: 'dizayner',
      company: { name: 'Nilufar Studio', logo: 'N', tagline: 'Brending va grafik dizayn' },
      theme: { preset: 'minimal', accent: '', accent2: '', font: 'editorial', radius: 'sharp', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'minimal', cta: 'Hamkorlik', ctaLink: '#aloqa', search: false },
      announce: { enabled: false, text: '', link: '' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 90 123 45 67', email: 'salom@nilufar.studio', address: 'Toshkent', hours: 'Dush–Juma, 10:00–18:00', telegram: '@nilufar_design', instagram: '@nilufar.design' },
      footer: { text: 'Hamma ishlar mualliflik huquqi bilan himoyalangan.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'center', badge: 'Yangi loyihalar uchun bo\'shman', titleStart: 'Men brend va', words: ['logotip', 'qadoq', 'veb-sayt'], titleEnd: 'dizaynerman', text: "Bizneslarga o'zini ko'rsatishga yordam beraman: aniq g'oya, kuchli vizual til va e'tibor bilan ishlangan har bir detal.", cta1Text: "Ishlarni ko'rish", cta1Link: '#portfolio', cta2Text: 'Bog\'lanish', cta2Link: '#aloqa', visual: 'image', image: I('dizayner/hero'), windowLines: [], chips: [], collage: [], trust: [{ value: '8+ yil', label: 'tajriba' }, { value: '140+', label: 'loyiha' }, { value: '32', label: 'doimiy mijoz' }] }),
        sec('lenta', 'marquee', { items: ['Brending', 'Logotip', 'Qadoqlash', 'Veb-dizayn', 'Illyustratsiya', 'Poster'] }),
        sec('portfolio', 'projects', { navLabel: 'Ishlar', eyebrow: 'Portfolio', title: 'Tanlangan loyihalar', text: "So'nggi yillarda bajargan ishlarimdan namunalar.", layout: 'masonry', filters: true, items: [
          { title: 'Nur Cafe brendi', tags: 'Brending, Logotip', year: '2025', image: I('dizayner/p1'), description: "Yangi kafe uchun to'liq brend: logotip, ranglar palitrasi, menyu va ijtimoiy tarmoq dizayni. Maqsad: iliq va zamonaviy muhit.", link: '', linkText: '' },
          { title: 'Festival afishasi', tags: 'Poster', year: '2025', image: I('dizayner/p2'), description: "Musiqa festivali uchun poster seriyasi. Yorqin ranglar va geometrik shakllar.", link: '', linkText: '' },
          { title: 'Eko-do\'kon veb-sayti', tags: 'Veb', year: '2024', image: I('dizayner/p3'), description: "Tabiiy mahsulotlar do'koni uchun sayt dizayni: oddiy navigatsiya va tez buyurtma.", link: '', linkText: '' },
          { title: 'Lola choy qadog\'i', tags: 'Qadoq, Brending', year: '2024', image: I('dizayner/p4'), description: "Premium choy uchun qadoq dizayni va etiketka tizimi.", link: '', linkText: '' },
          { title: 'Fit-trek ilovasi', tags: 'Veb, Ilova', year: '2024', image: I('dizayner/p5'), description: "Sport ilovasi uchun UI/UX: onboarding, statistika va mashqlar ekrani.", link: '', linkText: '' },
          { title: 'Mira klinikasi logotipi', tags: 'Logotip, Brending', year: '2023', image: I('dizayner/p6'), description: "Xususiy klinika uchun ishonchli va yumshoq logotip.", link: '', linkText: '' },
        ] }),
        sec('men', 'about', { navLabel: 'Men haqimda', eyebrow: 'Men haqimda', title: "Dizayn men uchun muammoni yechish san'ati", text: "Sakkiz yildan beri brend va raqamli mahsulotlar ustida ishlayman. Har bir loyihani mijoz bilan suhbatdan boshlayman: biznesingizni, auditoriyangizni va maqsadingizni tushunmasdan chizmayman.", image: I('dizayner/about'), imageSide: 'left', points: ['Har bir loyiha uchun shaxsiy yondashuv', "Aniq muddat va shaffof narx", 'Tayyor fayllar: Figma, PDF, SVG'], ctaText: '', ctaLink: '#' }),
        sec('xizmat', 'features', { navLabel: '', eyebrow: 'Xizmatlar', title: 'Nimalar qilaman', text: '', layout: 'grid', items: [{ icon: 'design', title: 'Brending', text: "Logotip, ranglar, shrift va brend qo'llanmasi." }, { icon: 'globe', title: 'Veb-dizayn', text: "Landing, korporativ sayt va onlayn do'kon dizayni." }, { icon: 'package', title: 'Qadoqlash', text: "Mahsulot qadog'i va etiketka dizayni." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Fikrlar', title: 'Mijozlar nima deydi', text: '', items: [{ text: "Nilufar bilan ishlash juda yoqdi. G'oya aniq, muddat o'z vaqtida, natija kutganimizdan yaxshi.", name: 'Aziz Karimov', role: 'Nur Cafe asoschisi', image: I('dizayner/a1'), stars: 5 }, { text: "Brendimiz endi haqiqatan ham o'zimizga o'xshaydi. Tavsiya qilaman!", name: 'Sevara Yo\'ldosheva', role: 'Lola Tea', image: I('dizayner/a2'), stars: 5 }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: 'Birga ishlaymizmi?', text: "Loyihangiz haqida qisqacha yozing, 24 soat ichida javob beraman.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 3. PORTFOLIO: DASTURCHI =================== */
  add({
    id: 'dasturchi', name: 'Portfolio: dasturchi', cat: 'Portfolio', icon: 'code',
    desc: "Dasturchi va IT mutaxassislar uchun: kod oynasi, ko'nikmalar, loyihalar va tajriba.",
    build: () => ({
      v: 2, template: 'dasturchi',
      company: { name: 'Sardor.dev', logo: 'S', tagline: 'Full-stack dasturchi' },
      theme: { preset: 'dark', accent: '', accent2: '', font: 'mono', radius: 'soft', bg: 'full', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Ish taklifi', ctaLink: '#aloqa', search: false },
      announce: { enabled: false, text: '', link: '' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 90 123 45 67', email: 'sardor@example.dev', address: 'Toshkent / masofaviy', hours: '', telegram: '@sardor_dev', instagram: '' },
      footer: { text: 'Qahva va kod bilan yaratildi.', links: [{ label: 'GitHub', url: 'https://github.com' }] },
      sections: [
        sec('bosh', 'hero', { layout: 'split', badge: 'Yangi loyihalar uchun ochiqman', titleStart: 'Men', words: ['veb-ilova', 'Telegram bot', 'API', 'SaaS'], titleEnd: 'yarataman', text: "Sardor, full-stack dasturchi. G'oyangizni tez, barqaror va kengaytiriladigan mahsulotga aylantiraman.", cta1Text: 'Loyihalarim', cta1Link: '#loyiha', cta2Text: "Bog'lanish", cta2Link: '#aloqa', visual: 'window', image: '', windowLines: ['// Sardor.dev', 'const dasturchi = {', '  ism: "Sardor",', '  stek: ["TypeScript", "Node", "React"],', '  tajriba: "6 yil",', '  holat: "ish qidiryapman",', '};', 'yarat(dasturchi.stek); // ✓'], chips: ['6 yil tajriba', '40+ loyiha', 'Open source'], collage: [], trust: [{ value: '40+', label: 'loyiha' }, { value: '6 yil', label: 'tajriba' }, { value: '12', label: 'mijoz' }] }),
        sec('lenta', 'marquee', { items: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Telegram Bot API', 'Python'] }),
        sec('konikma', 'skills', { navLabel: "Ko'nikmalar", eyebrow: "Ko'nikmalar", title: 'Texnologiyalar', text: 'Kundalik ishlatadigan asboblarim.', layout: 'bars', items: [{ name: 'TypeScript / JavaScript', level: 94 }, { name: 'React / Next.js', level: 90 }, { name: 'Node.js / Express', level: 88 }, { name: 'PostgreSQL / Redis', level: 80 }, { name: 'Docker / CI-CD', level: 74 }, { name: 'Python', level: 70 }] }),
        sec('loyiha', 'projects', { navLabel: 'Loyihalar', eyebrow: 'Loyihalar', title: "So'nggi ishlarim", text: '', layout: 'grid', filters: true, items: [
          { title: 'Analitika paneli', tags: 'React, Node', year: '2025', image: I('dasturchi/p1'), description: "Savdo ma'lumotlarini real vaqtda ko'rsatuvchi boshqaruv paneli: grafiklar, filtrlar va eksport.", link: 'https://github.com', linkText: 'GitHub' },
          { title: 'Onlayn kurs platformasi', tags: 'Next.js, PostgreSQL', year: '2025', image: I('dasturchi/p2'), description: "Video darslar, to'lov va sertifikat beruvchi platforma.", link: '', linkText: '' },
          { title: 'Fitnes ilovasi', tags: 'React Native', year: '2024', image: I('dasturchi/p3'), description: "Mashqlar va ovqatlanish rejasi uchun mobil ilova.", link: '', linkText: '' },
          { title: 'CRM tizimi', tags: 'Node, React', year: '2024', image: I('dasturchi/p4'), description: "Mijozlar bazasi, vazifalar va hisobotlar bilan kichik biznes uchun CRM.", link: '', linkText: '' },
          { title: 'Restoran buyurtma boti', tags: 'Telegram Bot, Node', year: '2023', image: I('dasturchi/p5'), description: "Telegram orqali buyurtma, to'lov va yetkazib berishni kuzatish boti.", link: '', linkText: '' },
          { title: 'Kuryer ilovasi', tags: 'React Native', year: '2023', image: I('dasturchi/p6'), description: "Kuryerlar uchun xarita va buyurtmalarni boshqarish ilovasi.", link: '', linkText: '' },
        ] }),
        sec('tajriba', 'timeline', { navLabel: 'Tajriba', eyebrow: 'Tajriba', title: "Ish yo'lim", text: '', items: [{ period: '2024 – hozir', title: 'Senior dasturchi', place: 'Tech Solutions, masofaviy', text: "Mahsulot arxitekturasi, jamoani yetaklash va kod sifati uchun javobgar." }, { period: '2021 – 2024', title: 'Full-stack dasturchi', place: 'Nova IT, Toshkent', text: "10 dan ortiq mijoz loyihalari: veb-ilovalar, botlar va integratsiyalar." }, { period: '2019 – 2021', title: 'Frontend dasturchi', place: 'Startap', text: "Interfeyslar va dizayn tizimi ustida ishladim." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: 'Keling, gaplashamiz', text: "Loyiha yoki ish taklifi bo'lsa, yozing. Odatda 1 kun ichida javob beraman.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 4. PORTFOLIO: FOTOGRAF =================== */
  add({
    id: 'fotograf', name: 'Portfolio: fotograf', cat: 'Portfolio', icon: 'camera',
    desc: "Fotograf, videograf va ijodiy studiyalar uchun: to'liq ekran rasm, galereya, tariflar va bron.",
    build: () => ({
      v: 2, template: 'fotograf',
      company: { name: 'Lens Studio', logo: 'L', tagline: "Fotograf va videograf" },
      theme: { preset: 'gold', accent: '', accent2: '', font: 'editorial', radius: 'sharp', bg: 'plain', heads: 'center', switcher: false },
      nav: { style: 'minimal', cta: 'Bron qilish', ctaLink: '#bron', search: false },
      announce: { enabled: false, text: '', link: '' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 93 555 11 22', email: 'lens@example.uz', address: 'Toshkent, Mirobod tumani', hours: 'Har kuni, oldindan kelishuv bilan', telegram: '@lens_studio', instagram: '@lens.studio' },
      footer: { text: 'Barcha suratlar mualliflik huquqi bilan himoyalangan.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'image', badge: 'Bron ochiq', titleStart: 'Yorug\'lik, lahza va', words: ['his-tuyg\'u', 'xotira', 'go\'zallik'], titleEnd: 'suratlarda', text: "Portret, to'y, oilaviy va tijorat suratlari. Har bir kadr sizning hikoyangizni aytadi.", cta1Text: 'Galereyani ko\'rish', cta1Link: '#galereya', cta2Text: 'Sessiyani bron qilish', cta2Link: '#bron', visual: 'none', image: I('fotograf/hero'), windowLines: [], chips: [], collage: [], trust: [{ value: '9 yil', label: 'tajriba' }, { value: '600+', label: 'sessiya' }] }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: 'Tanlangan kadrlar', text: 'Bosib kattalashtiring va ko\'ring.', layout: 'masonry', items: [
          { image: I('fotograf/g1'), caption: "Tog'lar tongi" }, { image: I('fotograf/g2'), caption: 'Shahar kechasi' }, { image: I('fotograf/g3'), caption: "To'lqinlar" }, { image: I('fotograf/g4'), caption: 'Diafragma' }, { image: I('fotograf/g5'), caption: 'Shafaq' }, { image: I('fotograf/g6'), caption: 'Bokeh' }, { image: I('fotograf/g7'), caption: 'Ritm' }, { image: I('fotograf/g8'), caption: 'Binafsha osmon' }, { image: I('fotograf/g9'), caption: "Yashil vodiy" }] }),
        sec('men', 'about', { navLabel: 'Men haqimda', eyebrow: 'Fotograf haqida', title: 'Kadr ortidagi inson', text: "To'qqiz yildan beri odamlar va joylarning ruhini suratga olaman. Tabiiy yorug'lik va samimiy lahzalarni yaxshi ko'raman. Sessiya oldidan har doim tanishib olamiz, shunda siz o'zingizni erkin his qilasiz.", image: I('fotograf/about'), imageSide: 'right', points: ['Tabiiy yorug\'lik va samimiy kadrlar', 'Retush bilan 7 kun ichida topshirish', 'Studiya va tashqarida suratga olish'], ctaText: 'Bron qilish', ctaLink: '#bron' }),
        sec('tarif', 'pricing', { navLabel: 'Tariflar', eyebrow: 'Narxlar', title: 'Sessiya tariflari', text: '', items: [{ name: 'Mini', price: '400 000 so\'m', period: '1 soat', features: ['20 ta retush qilingan surat', 'Bitta joy', 'Onlayn galereya'], popular: false, cta: 'Tanlash' }, { name: 'Standart', price: '900 000 so\'m', period: '2 soat', features: ['50 ta retush qilingan surat', 'Ikki joy', 'Onlayn galereya', 'Bosma fotokitob (10 bet)'], popular: true, cta: 'Tanlash' }, { name: "To'liq kun", price: '2 500 000 so\'m', period: '8 soat', features: ['200+ retush qilingan surat', 'Cheksiz joy', 'Video lavha (1 daqiqa)', 'Fotokitob (30 bet)'], popular: false, cta: 'Tanlash' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Fikrlar', title: 'Mijozlarimiz', text: '', items: [{ text: "To'y suratlarimiz juda tabiiy chiqdi. Har safar ko'rganimizda xursand bo'lamiz.", name: 'Malika va Bobur', role: "To'y sessiyasi", image: I('fotograf/a1'), stars: 5 }, { text: "Portret sessiyasi qiziqarli o'tdi, o'zimni juda erkin his qildim. Natijadan hayratdaman.", name: 'Kamola S.', role: 'Portret', image: I('fotograf/a2'), stars: 5 }] }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Bron qilish', title: 'Sessiyaga yoziling', text: "Sana va xizmatni tanlang, tasdiqlash uchun o'zim qo'ng'iroq qilaman.", form: 'booking', serviceOptions: ['Portret sessiyasi', "To'y", 'Oilaviy sessiya', 'Mahsulot suratlari', 'Boshqa'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Bron qilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 5. KOMPANIYA / IT AGENTLIK =================== */
  add({
    id: 'kompaniya', name: 'IT kompaniya / agentlik', cat: 'Biznes', icon: 'briefcase',
    desc: "Xizmat ko'rsatuvchi kompaniya uchun: xizmatlar, jarayon, tariflar, savol-javob va aloqa.",
    build: () => ({
      v: 2, template: 'kompaniya',
      company: { name: 'Nova IT', logo: 'N', tagline: "Raqamli yechimlar studiyasi" },
      theme: { preset: 'dark', accent: '', accent2: '', font: 'modern', radius: 'round', bg: 'full', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Bepul maslahat', ctaLink: '#aloqa', search: false },
      announce: { enabled: false, text: '', link: '' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 90 123 45 67', email: 'info@nova.uz', address: "Toshkent, Amir Temur ko'chasi 1", hours: 'Dush–Shan, 9:00–18:00', telegram: '@nova_it', instagram: '' },
      footer: { text: 'Barcha huquqlar himoyalangan.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'split', badge: 'Yangi loyihalar uchun ochiqmiz', titleStart: 'Biznesingiz uchun', words: ['veb-sayt', 'mobil ilova', 'Telegram bot', "onlayn do'kon"], titleEnd: 'yaratamiz', text: "Veb-sayt, mobil ilova va Telegram botlarni g'oyadan ishga tushirishgacha tez, sifatli va kafolat bilan tayyorlaymiz.", cta1Text: 'Loyihani boshlash', cta1Link: '#aloqa', cta2Text: "Xizmatlarni ko'rish", cta2Link: '#xizmat', visual: 'window', image: '', windowLines: ["// Sizning g'oyangiz", 'const loyiha = {', '  mijoz: "Sizning biznesingiz",', '  tezlik: "2 haftada tayyor",', '  sifat: "kafolatlangan",', '};', 'ishgaTushir(loyiha); // ✓ tayyor'], chips: ['Savdo +240%', '0.8s yuklanish', '24/7 yordam'], collage: [], trust: [{ value: '120+', label: 'loyiha' }, { value: '8 yil', label: 'tajriba' }, { value: '4.9/5', label: 'mijoz bahosi' }] }),
        sec('lenta', 'marquee', { items: ['Veb-saytlar', 'Mobil ilovalar', 'Telegram botlar', 'UI/UX dizayn', 'CRM tizimlar', "Onlayn do'konlar"] }),
        sec('raqam', 'stats', { items: [{ value: 120, suffix: '+', label: 'Bajarilgan loyiha' }, { value: 60, suffix: '+', label: 'Doimiy mijozlar' }, { value: 8, suffix: ' yil', label: 'Bozordagi tajriba' }, { value: 99, suffix: '%', label: 'Mamnun mijozlar' }] }),
        sec('xizmat', 'features', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: 'Raqamli biznes uchun hamma narsa', text: "G'oyadan tayyor mahsulotgacha butun jarayonni o'z zimmamizga olamiz.", layout: 'bento', items: [{ icon: 'code', title: "Veb-sayt va onlayn do'kon", text: "Tezkor, qidiruv tizimlariga moslashgan, admin paneli bor saytlar. Katalog, savat va to'lov integratsiyasi bilan." }, { icon: 'phone', title: 'Mobil ilovalar', text: 'iOS va Android uchun zamonaviy ilovalar.' }, { icon: 'send', title: 'Telegram botlar', text: "Buyurtma, to'lov va mijozlar bilan aloqani avtomatlashtiring." }, { icon: 'design', title: 'UI/UX dizayn', text: "Ko'rinishi chiroyli, ishlatishi oson interfeyslar." }, { icon: 'shield', title: 'Xavfsizlik va hosting', text: "Barqaror server va ma'lumotlar himoyasi." }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: 'Qanday ishlaymiz', text: "To'rt oddiy qadam, har bosqichda siz bilan aloqadamiz.", items: [{ title: "Bog'lanish", text: 'Talabingizni eshitamiz va aniq reja tuzamiz.' }, { title: 'Dizayn', text: "Ko'rinishni tayyorlab, sizga tasdiqlatamiz." }, { title: 'Ishlab chiqish', text: 'Tez va xatosiz quramiz, har kuni hisobot.' }, { title: 'Ishga tushirish', text: "Joylashtiramiz va doimiy qo'llab-quvvatlaymiz." }] }),
        sec('narx', 'pricing', { navLabel: 'Narxlar', eyebrow: 'Narxlar', title: 'Aniq narx, yashirin to\'lovsiz', text: '', items: [{ name: 'Start', price: "2.5 mln so'm", period: 'bir martalik', features: ['5 sahifagacha vizitka sayt', 'Mobilga moslashgan', 'Aloqa formasi', '1 oy yordam'], popular: false, cta: 'Tanlash' }, { name: 'Biznes', price: "6.9 mln so'm", period: 'bir martalik', features: ['Katalog va savat', 'Admin panel', 'Telegram xabarnoma', '3 oy yordam'], popular: true, cta: 'Tanlash' }, { name: 'Pro', price: 'Kelishilgan', period: '', features: ['Mobil ilova yoki CRM', 'Maxsus funksiyalar', 'Shaxsiy menejer', '12 oy yordam'], popular: false, cta: "Bog'lanish" }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlar fikri', text: '', items: [{ text: "Saytimiz 2 haftada tayyor bo'ldi, buyurtmalar ikki baravar oshdi.", name: 'Akmal R.', role: "Do'kon egasi", image: I('kompaniya/a1'), stars: 5 }, { text: "Telegram bot ishimizni ancha yengillashtirdi. Jamoa juda mas'uliyatli.", name: 'Gulnora S.', role: 'Restoran menejeri', image: I('kompaniya/a2'), stars: 5 }, { text: "Hamma narsa aniq va shaffof. Muddat va narx so'zsiz bajarildi.", name: 'Rustam K.', role: 'Direktor', image: I('kompaniya/a3'), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan savollar", text: '', items: [{ q: 'Sayt qancha vaqtda tayyor bo\'ladi?', a: "Vizitka sayt 3–5 kun, onlayn do'kon 2–3 hafta ichida tayyor bo'ladi." }, { q: 'Tayyor saytni o\'zim tahrirlay olamimi?', a: "Ha, admin panel orqali matn, narx va rasmlarni o'zingiz o'zgartirasiz." }, { q: 'Domen va hostingni siz olib berasizmi?', a: "Ha, domen va hostingni ulab beramiz. Xohlasangiz o'zingiznikini ham ishlatamiz." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: 'Loyihangiz bormi? Muhokama qilamiz', text: "Raqamingizni qoldiring, 15 daqiqada aloqaga chiqamiz.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 6. RESTORAN / KAFE =================== */
  add({
    id: 'restoran', name: 'Restoran / kafe', cat: 'Xizmat', icon: 'utensils', badge: 'Yangi',
    desc: "Restoran va kafe uchun: menyu kategoriyalar bilan, galereya va stol bron qilish.",
    build: () => ({
      v: 2, template: 'restoran',
      company: { name: 'Dasturxon', logo: 'D', tagline: "Milliy va yevropa oshxonasi" },
      theme: { preset: 'gold', accent: '', accent2: '', font: 'editorial', radius: 'soft', bg: 'aurora', heads: 'center', switcher: false },
      nav: { style: 'pill', cta: 'Stol band qilish', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Dam olish kunlari oilaviy brunch: 10:00 – 14:00", link: '#bron' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 71 233 44 55', email: 'bron@dasturxon.uz', address: "Toshkent, Yunusobod tumani, Amir Temur ko'chasi 108", hours: 'Har kuni 11:00 – 23:00', telegram: '@dasturxon_uz', instagram: '@dasturxon.uz' },
      footer: { text: 'Mazali va samimiy muhit.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'image', badge: 'Har kuni 11:00 dan 23:00 gacha', titleStart: 'Mazali taomlar,', words: ['iliq muhit', 'samimiy xizmat', 'unutilmas lahza'], titleEnd: '', text: "An'anaviy retseptlar va zamonaviy yondashuv. Oila, do'stlar va bayramlar uchun qulay joy.", cta1Text: 'Stol band qilish', cta1Link: '#bron', cta2Text: 'Menyuni ko\'rish', cta2Link: '#menyu', visual: 'none', image: I('restoran/hero'), windowLines: [], chips: [], collage: [], trust: [{ value: '12 yil', label: 'xizmatda' }, { value: '4.8', label: 'reyting' }, { value: '120', label: "o'rin" }] }),
        sec('biz', 'about', { navLabel: 'Biz haqimizda', eyebrow: 'Biz haqimizda', title: 'Oshxonamiz ruhi', text: "Taomlarimiz har kuni yangi mahsulotlardan tayyorlanadi. Bosh oshpazimiz an'anaviy retseptlarga zamonaviy ohang beradi, shuning uchun har bir taom o'zgacha ta'mga ega.", image: I('restoran/about'), imageSide: 'left', points: ['Har kuni yangi mahsulotlar', "Oshpazning maxsus retseptlari", "Katta zal va yopiq oilaviy xonalar"], ctaText: '', ctaLink: '#' }),
        sec('menyu', 'menu', { navLabel: 'Menyu', eyebrow: 'Menyu', title: 'Bizning menyu', text: 'Mavsumga qarab menyu yangilanib turadi.', mode: 'none', items: [
          { id: 'm1', name: 'Yangi bahor salati', price: 38000, category: 'Salatlar', description: 'Bodring, pomidor, ko\'katlar, zaytun moyi va limon sousi.', tag: '', image: I('restoran/m5'), active: true },
          { id: 'm2', name: 'Achichuk', price: 25000, category: 'Salatlar', description: 'Pomidor, piyoz va rayhon, an\'anaviy usulda.', tag: '', image: '', active: true },
          { id: 'm3', name: 'Sezar salati', price: 52000, category: 'Salatlar', description: 'Tovuq filesi, parmezan, krutonlar va maxsus sous.', tag: 'Mashhur', image: '', active: true },
          { id: 'm4', name: "Qo'y go'shtli palov", price: 68000, category: 'Asosiy taomlar', description: "Qozonda damlangan, mayiz va no'xat bilan.", tag: 'Mashhur', image: I('restoran/m1'), active: true },
          { id: 'm5', name: 'Lag\'mon', price: 48000, category: 'Asosiy taomlar', description: "Qo'lda cho'zilgan lag'mon, sabzavotlar va go'sht.", tag: '', image: I('restoran/m4'), active: true },
          { id: 'm6', name: "Grill stek", price: 145000, category: 'Asosiy taomlar', description: "Mol go'shti, kartoshka pyure va qo'ziqorin sousi.", tag: 'Yangi', image: I('restoran/m8'), active: true },
          { id: 'm7', name: 'Dumbul somsa (3 dona)', price: 36000, category: 'Asosiy taomlar', description: "Tandirda pishirilgan, go'shtli.", tag: '', image: '', active: true },
          { id: 'm8', name: 'Pishirilgan honim', price: 34000, category: 'Shirinliklar', description: 'Yong\'oq va asal bilan.', tag: '', image: '', active: true },
          { id: 'm9', name: 'Chizkeyk', price: 42000, category: 'Shirinliklar', description: "Klassik yoki mavsumiy mevali variant.", tag: '', image: I('restoran/m7'), active: true },
          { id: 'm10', name: 'Qora choy (choynak)', price: 15000, category: 'Ichimliklar', description: "Limon yoki asal bilan.", tag: '', image: '', active: true },
          { id: 'm11', name: 'Kofe latte', price: 28000, category: 'Ichimliklar', description: "Yangi maydalangan don.", tag: '', image: I('restoran/m6'), active: true },
          { id: 'm12', name: 'Uy limonadi', price: 24000, category: 'Ichimliklar', description: "Limon, yalpiz va muz.", tag: '', image: '', active: true },
        ] }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: 'Muhit va taomlar', text: '', layout: 'grid', items: [{ image: I('restoran/g1'), caption: 'Palov' }, { image: I('restoran/g2'), caption: 'Kechki muhit' }, { image: I('restoran/g3'), caption: 'Salat' }, { image: I('restoran/g4'), caption: "Bayram dasturxoni" }, { image: I('restoran/g5'), caption: 'Interyer' }, { image: I('restoran/g6'), caption: 'Shirinliklar' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mehmonlarimiz fikri', text: '', items: [{ text: "Palovi juda mazali, xizmat ko'rsatish a'lo darajada. Oilam bilan tez-tez kelamiz.", name: 'Otabek N.', role: 'Doimiy mehmon', image: I('restoran/a1'), stars: 5 }, { text: "Tug'ilgan kunimni shu yerda nishonladim, hamma narsa mukammal bo'ldi.", name: 'Zarina M.', role: 'Mehmon', image: I('restoran/a2'), stars: 5 }, { text: "Qulay joylashuv, shinam muhit va mazali taomlar.", name: 'Sherzod B.', role: 'Mehmon', image: I('restoran/a3'), stars: 5 }] }),
        sec('bron', 'contact', { navLabel: 'Stol band qilish', eyebrow: 'Bron', title: 'Stol band qiling', text: "Sana, vaqt va mehmonlar sonini tanlang. Bronni telefon orqali tasdiqlaymiz.", form: 'booking', serviceOptions: ['Asosiy zal', 'Oilaviy xona', 'Terassa', 'Bayram / banket'], askGuests: true, askAddress: false, payOptions: [], submitText: 'Bron qilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 7. GO'ZALLIK SALONI =================== */
  add({
    id: 'salon', name: "Go'zallik saloni", cat: 'Xizmat', icon: 'scissors', badge: 'Yangi',
    desc: "Salon, barbershop va spa uchun: xizmatlar narxi, ustalar, galereya va onlayn yozilish.",
    build: () => ({
      v: 2, template: 'salon',
      company: { name: 'Lola Beauty', logo: 'L', tagline: "Go'zallik va parvarish studiyasi" },
      theme: { preset: 'rose', accent: '', accent2: '', font: 'editorial', radius: 'round', bg: 'aurora', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Yozilish', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Birinchi tashrifga −15% chegirma", link: '#bron' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 90 777 12 34', email: 'salom@lolabeauty.uz', address: "Toshkent, Mirzo Ulug'bek tumani, 5-uy", hours: 'Har kuni 9:00 – 20:00', telegram: '@lola_beauty', instagram: '@lola.beauty' },
      footer: { text: 'Siz go\'zalliksiz!', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'split', badge: 'Onlayn yozilish ochiq', titleStart: "O'zingizga", words: ['vaqt ajrating', 'g\'amxo\'rlik qiling', 'porlang'], titleEnd: '', text: "Soch, tirnoq va yuz parvarishi bir joyda. Tajribali ustalar, sifatli kosmetika va iliq muhit.", cta1Text: 'Yozilish', cta1Link: '#bron', cta2Text: 'Narxlar', cta2Link: '#narx', visual: 'image', image: I('salon/hero'), windowLines: [], chips: ['Sertifikatli ustalar', 'Premium kosmetika', 'Qulay vaqt'], collage: [], trust: [{ value: '5 yil', label: 'tajriba' }, { value: '3 500+', label: 'mijoz' }, { value: '4.9', label: 'reyting' }] }),
        sec('afzallik', 'features', { eyebrow: '', title: '', text: '', layout: 'strip', items: [{ icon: 'award', title: 'Sertifikatli ustalar', text: 'Doimiy malaka oshirish' }, { icon: 'heart', title: 'Premium kosmetika', text: 'Xavfsiz va sifatli brendlar' }, { icon: 'clock', title: 'Qulay vaqt', text: 'Kechgacha ishlaymiz' }, { icon: 'shield', title: 'Gigiena', text: 'Asboblar har safar sterillanadi' }] }),
        sec('narx', 'menu', { navLabel: 'Narxlar', eyebrow: 'Xizmatlar', title: 'Xizmatlar va narxlar', text: '', mode: 'none', items: [
          { id: 's1', name: 'Soch olish (ayollar)', price: 120000, category: 'Soch', description: "Maslahat va yuvish bilan.", tag: '60 daqiqa', image: '', active: true },
          { id: 's2', name: "Soch bo'yash", price: 380000, category: 'Soch', description: "Bir rangli, premium bo'yoq.", tag: '2–3 soat', image: '', active: true },
          { id: 's3', name: 'Soch ukladkasi', price: 150000, category: 'Soch', description: "Kundalik yoki bayram ukladkasi.", tag: '45 daqiqa', image: '', active: true },
          { id: 's4', name: 'Klassik manikyur', price: 90000, category: 'Tirnoq', description: "Tirnoq shakllantirish va parvarish.", tag: '45 daqiqa', image: '', active: true },
          { id: 's5', name: 'Gel-lak bilan manikyur', price: 140000, category: 'Tirnoq', description: "Uzoq saqlanadigan qoplama.", tag: '90 daqiqa', image: '', active: true },
          { id: 's6', name: 'Pedikyur', price: 160000, category: 'Tirnoq', description: "To'liq parvarish va qoplama.", tag: '75 daqiqa', image: '', active: true },
          { id: 's7', name: 'Yuz tozalash', price: 220000, category: 'Yuz', description: "Chuqur tozalash va namlantirish.", tag: '60 daqiqa', image: '', active: true },
          { id: 's8', name: 'Qosh shakllantirish', price: 70000, category: 'Yuz', description: "Shakl berish va bo'yash.", tag: '30 daqiqa', image: '', active: true },
        ] }),
        sec('usta', 'team', { navLabel: 'Ustalar', eyebrow: 'Jamoa', title: 'Bizning ustalar', text: '', items: [{ name: 'Lola Karimova', role: 'Bosh stilist', image: I('salon/t1'), text: "10 yillik tajriba, murakkab bo'yash." }, { name: 'Madina Ergasheva', role: 'Manikyur ustasi', image: I('salon/t2'), text: 'Nail-art va gel-lak mutaxassisi.' }, { name: 'Nodira Saidova', role: 'Kosmetolog', image: I('salon/t3'), text: "Yuz parvarishi va terapiya." }, { name: 'Sabina Olimova', role: 'Vizajist', image: I('salon/t4'), text: "Kunduzgi va bayram makiyaji." }] }),
        sec('galereya', 'gallery', { navLabel: 'Ishlarimiz', eyebrow: 'Galereya', title: 'Ishlarimizdan namunalar', text: '', layout: 'masonry', items: [{ image: I('salon/g1'), caption: 'Gul uslubi' }, { image: I('salon/g2'), caption: 'Nafis rang' }, { image: I('salon/g3'), caption: 'Bokeh' }, { image: I('salon/g4'), caption: 'Pastel' }, { image: I('salon/g5'), caption: 'Oltin soyalar' }, { image: I('salon/g6'), caption: 'Yumshoq to\'lqin' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlarimiz fikri', text: '', items: [{ text: "Juda tajribali ustalar. Rangni aynan xohlaganimdek qilib berishdi.", name: 'Shahlo A.', role: 'Mijoz', image: I('salon/a1'), stars: 5 }, { text: "Muhit shinam, xizmat tez. Manikyur bir oy turdi, hozir ham chiroyli.", name: 'Dildora M.', role: 'Mijoz', image: I('salon/a2'), stars: 5 }, { text: "Birinchi marta keldim, endi doimiy mijozman!", name: 'Feruza K.', role: 'Mijoz', image: I('salon/a3'), stars: 5 }] }),
        sec('bron', 'contact', { navLabel: 'Yozilish', eyebrow: 'Onlayn yozilish', title: 'Qulay vaqtni tanlang', text: "Xizmat va vaqtni tanlang, administrator tasdiqlash uchun qo'ng'iroq qiladi.", form: 'booking', serviceOptions: ['Soch olish', "Soch bo'yash", 'Manikyur', 'Pedikyur', 'Yuz parvarishi', 'Makiyaj'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== 8. TA'LIM MARKAZI =================== */
  add({
    id: 'talim', name: "O'quv markaz", cat: "Ta'lim", icon: 'graduation', badge: 'Yangi',
    desc: "Kurs va o'quv markazlari uchun: kurslar, o'qituvchilar, natijalar va ro'yxatdan o'tish.",
    build: () => ({
      v: 2, template: 'talim',
      company: { name: 'Bilim Academy', logo: 'B', tagline: "Zamonaviy kasblarni o'rganing" },
      theme: { preset: 'ocean', accent: '', accent2: '', font: 'geometric', radius: 'soft', bg: 'aurora', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: "Ro'yxatdan o'tish", ctaLink: '#royxat', search: false },
      announce: { enabled: true, text: "Yangi guruhlar 1-noyabrdan: oldindan yoziling va 10% chegirma oling", link: '#royxat' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 71 244 55 66', email: 'info@bilim.academy', address: "Toshkent, Shayxontohur tumani, 18-uy", hours: 'Dush–Shan, 9:00–19:00', telegram: '@bilim_academy', instagram: '@bilim.academy' },
      footer: { text: 'Bilim — kelajak kaliti.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'split', badge: "Qabul ochiq", titleStart: "Kelajak kasbini", words: ["bugun o'rganing", 'bizdan boshlang', 'amaliyot bilan'], titleEnd: '', text: "Dasturlash, dizayn, marketing va chet tillari bo'yicha amaliy kurslar. Tajribali ustozlar va ishga joylashishda yordam.", cta1Text: "Kurslarni ko'rish", cta1Link: '#kurs', cta2Text: "Ro'yxatdan o'tish", cta2Link: '#royxat', visual: 'image', image: I('talim/hero'), windowLines: [], chips: ['Amaliy loyihalar', 'Sertifikat', 'Ish bilan yordam'], collage: [], trust: [{ value: '2 400+', label: 'bitiruvchi' }, { value: '18', label: 'kurs' }, { value: '92%', label: 'ishga joylashgan' }] }),
        sec('raqam', 'stats', { items: [{ value: 2400, suffix: '+', label: 'Bitiruvchilar' }, { value: 18, suffix: '', label: 'Yo\'nalishlar' }, { value: 35, suffix: '', label: "Tajribali o'qituvchi" }, { value: 92, suffix: '%', label: 'Ishga joylashganlar' }] }),
        sec('kurs', 'products', { navLabel: 'Kurslar', eyebrow: 'Kurslar', title: 'Yo\'nalishni tanlang', text: "Har bir kurs amaliy loyiha bilan yakunlanadi.", mode: 'inquiry', buttonText: 'Yozilish', columns: '3', search: false, filters: true, sort: false, items: [
          { id: 'k1', name: 'Frontend dasturlash', price: 1500000, oldPrice: 1800000, category: 'Dasturlash', badge: 'TOP', description: "HTML, CSS, JavaScript va React. Davomiyligi: 5 oy.", image: I('talim/c1'), stock: '', active: true },
          { id: 'k2', name: 'Ingliz tili (IELTS)', price: 900000, oldPrice: 0, category: 'Tillar', badge: '', description: "Boshlang'ichdan 7.0 gacha. Davomiyligi: 6 oy.", image: I('talim/c2'), stock: '', active: true },
          { id: 'k3', name: 'Grafik dizayn', price: 1200000, oldPrice: 0, category: 'Dizayn', badge: 'YANGI', description: "Photoshop, Illustrator va Figma. Davomiyligi: 4 oy.", image: I('talim/c3'), stock: '', active: true },
          { id: 'k4', name: 'Digital marketing', price: 1100000, oldPrice: 0, category: 'Marketing', badge: '', description: "SMM, target reklama va analitika. Davomiyligi: 3 oy.", image: I('talim/c4'), stock: '', active: true },
          { id: 'k5', name: 'Maktab uchun tayyorlov', price: 600000, oldPrice: 0, category: 'Tillar', badge: '', description: "Matematika, ona tili va mantiq. Davomiyligi: 8 oy.", image: I('talim/c5'), stock: '', active: true },
          { id: 'k6', name: 'Video montaj', price: 1000000, oldPrice: 1200000, category: 'Dizayn', badge: '', description: "Premiere Pro va After Effects. Davomiyligi: 3 oy.", image: I('talim/c6'), stock: '', active: true },
        ] }),
        sec('nega', 'features', { navLabel: '', eyebrow: 'Afzalliklar', title: 'Nega aynan biz?', text: '', layout: 'grid', items: [{ icon: 'users', title: 'Kichik guruhlar', text: "Har bir o'quvchiga e'tibor: guruhda 8 tagacha talaba." }, { icon: 'briefcase', title: 'Amaliy loyihalar', text: "Real loyihalar ustida ishlab, portfolio yig'asiz." }, { icon: 'award', title: 'Sertifikat', text: "Kurs yakunida rasmiy sertifikat beriladi." }] }),
        sec('ustoz', 'team', { navLabel: "O'qituvchilar", eyebrow: 'Ustozlar', title: "O'qituvchilarimiz", text: '', items: [{ name: 'Bobur Aliyev', role: 'Frontend mentor', image: I('talim/t1'), text: "7 yillik tajriba, xalqaro kompaniyalarda ishlagan." }, { name: 'Nigora Rahimova', role: 'Dizayn mentor', image: I('talim/t2'), text: "Brending va UI/UX bo'yicha mutaxassis." }, { name: 'Javohir Qodirov', role: 'Marketing mentor', image: I('talim/t3'), text: "100+ loyiha uchun reklama strategiyasi." }] }),
        sec('jarayon', 'process', { navLabel: '', eyebrow: "Qanday o'qiladi", title: "O'qish jarayoni", text: '', items: [{ title: "Sinov darsi", text: "Bepul dars: yo'nalishni sinab ko'rasiz." }, { title: 'Guruhga qo\'shilish', text: "Qulay jadvalni tanlaysiz." }, { title: 'Amaliyot', text: "Haftalik topshiriq va loyihalar." }, { title: 'Ishga yordam', text: "Rezyume va suhbatga tayyorlash." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Bitiruvchilar fikri", text: '', items: [{ text: "Kursdan keyin 2 oyda ishga kirdim. Mentorlar doim yordamga tayyor edi.", name: 'Sanjar T.', role: 'Frontend dasturchi', image: I('talim/a1'), stars: 5 }, { text: "Dizayn kursi juda amaliy bo'ldi, portfolioni shu yerda yig'dim.", name: 'Kamola R.', role: 'Dizayner', image: I('talim/a2'), stars: 5 }, { text: "IELTS 7.0 oldim, ustozlarga rahmat!", name: 'Ulug\'bek N.', role: 'Talaba', image: I('talim/a3'), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan savollar", text: '', items: [{ q: "Kursni boshlash uchun tajriba kerakmi?", a: "Yo'q, kurslarimiz noldan boshlanadi." }, { q: "To'lovni bo'lib to'lasam bo'ladimi?", a: "Ha, 3 oygacha bo'lib to'lash imkoniyati mavjud." }, { q: "Dars qaysi vaqtda o'tiladi?", a: "Kunduzgi va kechki guruhlar bor, jadval o'quvchi bilan kelishiladi." }] }),
        sec('royxat', 'contact', { navLabel: "Ro'yxatdan o'tish", eyebrow: "Ro'yxatdan o'tish", title: 'Bepul sinov darsiga yoziling', text: "Kurs va qulay vaqtni tanlang, menejerimiz siz bilan bog'lanadi.", form: 'booking', serviceOptions: ['Frontend dasturlash', 'Ingliz tili (IELTS)', 'Grafik dizayn', 'Digital marketing', 'Maktab uchun tayyorlov', 'Video montaj'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* ---------- API ---------- */
  const T_BY = Object.fromEntries(T.map((t) => [t.id, t]));
  window.TEMPLATES = T.map((t) => ({ id: t.id, name: t.name, cat: t.cat, icon: t.icon, desc: t.desc, badge: t.badge || '', thumb: `/img/tpl/${t.id}.jpg` }));
  window.getTemplate = (id) => { const t = T_BY[id]; return t ? t.build() : null; };
})();
