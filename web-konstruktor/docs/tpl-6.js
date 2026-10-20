'use strict';
// Vizitka (link-in-bio) shablonlari: 10 ta turli dizayn. Har biri bitta "vcard" bo'limi + ixtiyoriy yo'nalish, narx, galereya, sharh, manzil bo'limlari.
// Dizayn (vcard.design) va rang (Sozlamalar → mavzu rangi) hamda ikonkalar mijoz tomonidan erkin o'zgartiriladi.
(function () {
  const { add, sec, P } = window.TplKit;
  const mk = (o) => add({
    id: o.id, name: o.name, cat: 'Vizitka', icon: o.icon, badge: o.badge || 'Yangi', tags: ['vizitka', 'visitka', 'link', 'linktree', 'bio', 'instagram', 'taqdimot', 'vizit', 'визитка', 'card', ...o.tags], look: 'vcard',
    desc: o.desc,
    build: () => ({
      v: 2, template: o.id,
      company: { name: o.brand, logo: o.logoText || o.brand[0], tagline: o.tagline || '' },
      theme: { preset: o.dark ? 'dark' : 'light', accent: '', accent2: '', look: 'classic', motion: true, font: 'modern', radius: 'round', bg: 'plain', heads: 'center', switcher: false },
      nav: { style: 'pill', cta: '', ctaLink: '#', search: false },
      announce: { enabled: false, text: '', link: '' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: o.phone, telegram: o.tg, instagram: o.ig },
      footer: { text: o.foot || 'Barcha huquqlar himoyalangan.', links: [] },
      sections: o.sections(),
    }),
  });
  const card = (o) => sec('profil', 'vcard', Object.assign({ verified: true, socials: [], pills: [] }, o));
  const L = (icon, title, sub, url) => ({ icon, title, sub, url });
  const S = (kind, url) => ({ kind, url });
  const I = (icon, title, text) => ({ icon, title, text });
  const R = (name, desc, price) => ({ name, desc, price });

  /* 1. Ta'lim markazi */
  mk({ id: 'vz-talim', name: "Vizitka: ta'lim markazi", icon: 'graduation', dark: true, tags: ["ta'lim", 'kurs', "o'quv markazi", 'til', 'maktab', 'репетитор'], desc: "O'quv markazi, kurs va ustozlar uchun: logotip, yo'nalishlar, ijtimoiy tarmoqlar va manzil bitta kartada.", brand: "Nur Ta'lim Markazi", logoText: 'N', tagline: "Bilim sari ishonchli qadam", phone: '+998 90 123 45 67', tg: '@nurtalim', ig: '@nurtalim',
    sections: () => [
      card({ design: 'emerald', badge: "Toshkent · 2021 yildan buyon", logoText: 'N', name: 'Nur', sub: "Ta'lim Markazi", role: 'Ingliz va Arab tillari', text: "Farzandingiz kelajagi uchun mustahkam poydevor: tajribali ustozlar bilan tillarni qiziqarli metodikada o'rganing.",
        stats: [{ icon: 'medal', value: 2021, suffix: '', label: 'Yildan buyon' }, { icon: 'graduation', value: 1200, suffix: '+', label: "O'quvchilar" }, { icon: 'compass', value: 5, suffix: '', label: "Yo'nalish" }],
        pills: [{ icon: 'clock', label: '9:00 – 20:00' }, { icon: 'calendar', label: 'Har kuni' }, { icon: 'pin', label: 'Toshkent' }],
        links: [L('tel', "Qo'ng'iroq qilish", '+998 90 123 45 67', '+998901234567'), L('telegram', 'Telegram kanali', 't.me/nurtalim', 't.me/nurtalim'), L('insta', 'Instagram', '@nurtalim', 'instagram.com/nurtalim'), L('youtube', 'YouTube', 'Darslar va natijalar', 'youtube.com/@nurtalim')],
        socials: [S('instagram', '@nurtalim'), S('telegram', '@nurtalim'), S('youtube', '@nurtalim'), S('whatsapp', '+998901234567')], ctaText: 'Kursga yozilish', ctaLink: '+998901234567' }),
      sec('yonalish', 'vcsvc', { eyebrow: '', title: "Yo'nalishlarimiz", items: [I('translate', 'Arab tili', 'Nutq, yozuv va grammatika'), I('baby', 'Arab Kids', 'Kichkintoylar uchun'), I('book', 'Ingliz tili', 'Zamonaviy metodika'), I('smile', 'English Kids', "O'yin orqali til o'rganish"), I('graduation', 'Maktabga tayyorlov', 'Bilim va ko\'nikmalar asosi')] }),
      sec('galereya', 'vcgal', { eyebrow: 'Galereya', title: 'Darslarimizdan *lavhalar*', items: [{ image: P('talim', 2), caption: 'Guruh darsi' }, { image: P('talim', 3), caption: 'Ijodiy mashg\'ulot' }, { image: P('talim', 5), caption: 'Yozma ishlar' }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Bizning *manzil*', address: "Toshkent shahri, Lutfiy 4-berk ko'chasi, 2-uy", hint: "Mo'ljal: masjid ro'parasi", hours: 'Har kuni 9:00 – 20:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });

  /* 2. Dasturchi / freelancer */
  mk({ id: 'vz-dasturchi', name: 'Vizitka: dasturchi / freelancer', icon: 'code', dark: true, tags: ['dasturchi', 'programmist', 'freelancer', 'it', 'portfolio', 'frilanser'], desc: "Dasturchi va freelancerlar uchun shaxsiy vizitka: portfolio, GitHub, Telegram va xizmat narxlari.", brand: 'Jasur Karimov', logoText: 'J', tagline: 'Full-stack dasturchi', phone: '+998 91 234 56 78', tg: '@jasur_dev', ig: '@jasur.dev',
    sections: () => [
      card({ design: 'midnight', badge: 'Toshkent · Masofaviy ishlayman', logoImage: P('odam', 5), name: 'Jasur Karimov', sub: 'Full-stack dasturchi', role: 'Veb · Telegram bot · Mobil ilova', text: 'Biznesingiz uchun tez, chiroyli va ishonchli raqamli mahsulotlar yarataman: g\'oyadan ishga tushirishgacha.',
        stats: [{ icon: 'code', value: 6, suffix: ' yil', label: 'Tajriba' }, { icon: 'briefcase', value: 80, suffix: '+', label: 'Loyiha' }, { icon: 'zap', value: 24, suffix: '/7', label: 'Aloqa' }],
        pills: [{ icon: 'globe', label: 'jasur.dev' }, { icon: 'clock', label: 'Javob: 1 soat ichida' }],
        links: [L('globe', 'Portfolio sayt', 'Ishlarim va keyslar', 'jasur.dev'), L('github', 'GitHub', 'github.com/jasurdev', 'github.com/jasurdev'), L('telegram', 'Telegram', '@jasur_dev', 't.me/jasur_dev'), L('linkedin', 'LinkedIn', 'Tajriba va tavsiyalar', 'linkedin.com/in/jasurdev'), L('download', 'CV yuklab olish', 'PDF, 2 sahifa', 'jasur.dev/cv.pdf')],
        socials: [S('telegram', '@jasur_dev'), S('instagram', '@jasur.dev'), S('linkedin', 'jasurdev'), S('mail', 'jasur@example.uz')], ctaText: 'Loyihani muhokama qilish', ctaLink: 't.me/jasur_dev' }),
      sec('xizmat', 'vcsvc', { eyebrow: 'Xizmatlar', title: 'Nima *qilaman*', items: [I('globe', 'Veb-sayt', 'Landing va korporativ'), I('send', 'Telegram bot', "Savdo va avtomatlashtirish"), I('phone', 'Mobil ilova', 'iOS va Android'), I('design', 'UI/UX dizayn', 'Interfeys va prototip')] }),
      sec('narx', 'vclist', { eyebrow: 'Narxlar', title: 'Taxminiy *narxlar*', items: [R('Vizitka sayt', '1 sahifa, tez topshirish', "1 500 000 so'm"), R('Korporativ sayt', "5–8 sahifa, admin panel bilan", "5 000 000 so'm"), R('Telegram bot', "Buyurtma va to'lov bilan", "2 500 000 so'm")] }),
      sec('sharh', 'vcrev', { eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: "Aytilgan muddatda topshirdi, sayt juda tez ishlaydi. Tavsiya qilaman.", name: 'Dilnoza R.', role: 'Do\'kon egasi', stars: 5 }, { text: "Telegram bot buyurtmalarni 2 barobar oshirdi. Rahmat!", name: 'Sardor A.', role: 'Restoran menejeri', stars: 5 }] }),
    ] });

  /* 3. Go'zallik saloni */
  mk({ id: 'vz-salon', name: "Vizitka: go'zallik saloni", icon: 'scissors', dark: false, tags: ['salon', "go'zallik", 'beauty', 'makiyaj', 'manikyur', 'sartarosh', 'soch'], desc: "Salon, makiyaj va manikyur ustalari uchun: onlayn yozilish, narxlar, ishlar galereyasi va sharhlar.", brand: 'Lola Beauty', logoText: 'L', tagline: "Go'zallik — sizning kayfiyatingiz", phone: '+998 93 345 67 89', tg: '@lolabeauty', ig: '@lola.beauty',
    sections: () => [
      card({ design: 'rose', badge: "Toshkent · Beauty studio", logoText: 'L', name: 'Lola', sub: 'Beauty Studio', role: "Soch · Manikyur · Makiyaj", text: "Har bir mijozga alohida e'tibor: sizning uslubingizga mos go'zallik xizmatlari, qulay muhit va sifatli materiallar.",
        stats: [{ icon: 'heart', value: 3000, suffix: '+', label: 'Mijoz' }, { icon: 'award', value: 8, suffix: ' yil', label: 'Tajriba' }, { icon: 'sparkle', value: 15, suffix: '+', label: 'Xizmat' }],
        pills: [{ icon: 'clock', label: '10:00 – 20:00' }, { icon: 'pin', label: 'Mirzo Ulug\'bek' }],
        links: [L('calendar', 'Onlayn yozilish', 'Telegram orqali, 1 daqiqada', 't.me/lolabeauty'), L('tel', "Qo'ng'iroq qilish", '+998 93 345 67 89', '+998933456789'), L('insta', 'Instagram', 'Ishlarimiz va yangiliklar', 'instagram.com/lola.beauty'), L('tiktok', 'TikTok', 'Qisqa videolar', 'tiktok.com/@lola.beauty')],
        socials: [S('instagram', '@lola.beauty'), S('telegram', '@lolabeauty'), S('tiktok', 'lola.beauty'), S('whatsapp', '+998933456789')], ctaText: 'Yozilish', ctaLink: 't.me/lolabeauty' }),
      sec('narx', 'vclist', { eyebrow: 'Narxlar', title: 'Xizmatlar *narxi*', items: [R('Soch turmagi', 'Bayram va kundalik', "120 000 so'm"), R('Manikyur + gel-lak', 'Ko\'rinish va mustahkamlik', "90 000 so'm"), R('Soch bo\'yash', 'Tabiiy ranglar, balayazh', "350 000 so'm"), R('Makiyaj', 'Kechki va to\'y', "250 000 so'm"), R('Pedikyur', 'Spa parvarish', "110 000 so'm")] }),
      sec('galereya', 'vcgal', { eyebrow: 'Ishlarimiz', title: 'Natijalar *o\'zi gapiradi*', items: [{ image: P('salon', 2), caption: 'Rang va uslub' }, { image: P('salon', 3), caption: 'Manikyur' }, { image: P('salon', 4), caption: 'Soch parvarishi' }, { image: P('salon', 6), caption: 'Turmak' }] }),
      sec('sharh', 'vcrev', { eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: "Ajoyib muhit va juda mohir ustalar. Har safar xursand bo'lib chiqaman!", name: 'Madina Y.', role: 'Doimiy mijoz', stars: 5 }, { text: "Soch bo'yashni aynan o'zim xohlagandek qilishdi. Rahmat!", name: 'Zarina K.', role: 'Mijoz', stars: 5 }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Bizni *toping*', address: "Toshkent shahri, Mirzo Ulug'bek tumani, Buyuk Ipak Yo'li 45", hint: "Mo'ljal: Kamolon bozori yonida", hours: 'Har kuni 10:00 – 20:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });

  /* 4. Barbershop */
  mk({ id: 'vz-barber', name: 'Vizitka: barbershop', icon: 'scissors', dark: true, tags: ['barbershop', 'barber', 'sartarosh', 'soqol', 'erkaklar'], desc: "Barbershop va erkaklar saloni uchun: premium qora-oltin dizayn, narxlar va yozilish.", brand: 'Royal Barber', logoText: 'R', tagline: 'Erkaklar uchun haqiqiy uslub', phone: '+998 94 456 78 90', tg: '@royalbarber', ig: '@royal.barber.uz',
    sections: () => [
      card({ design: 'gold', badge: "Toshkent · Erkaklar saloni", logoText: 'R', name: 'Royal', sub: 'Barber Shop', role: 'Soch · Soqol · Parvarish', text: "Klassik texnika va zamonaviy uslub. Har bir tashrif — dam olish va ishonch bilan chiqish.",
        stats: [{ icon: 'scissors', value: 7, suffix: ' yil', label: 'Tajriba' }, { icon: 'users', value: 5000, suffix: '+', label: 'Mijoz' }, { icon: 'crown', value: 6, suffix: '', label: 'Usta' }],
        pills: [{ icon: 'clock', label: '10:00 – 22:00' }, { icon: 'calendar', label: 'Har kuni' }],
        links: [L('calendar', 'Navbatga yozilish', 'Telegram orqali', 't.me/royalbarber'), L('tel', "Qo'ng'iroq qilish", '+998 94 456 78 90', '+998944567890'), L('insta', 'Instagram', 'Ishlarimiz', 'instagram.com/royal.barber.uz'), L('pin', 'Manzil', 'Xaritada ochish', 'Toshkent, Yunusobod, Amir Temur ko\'chasi 100')],
        socials: [S('instagram', '@royal.barber.uz'), S('telegram', '@royalbarber'), S('tiktok', 'royal.barber.uz')], ctaText: 'Navbat olish', ctaLink: 't.me/royalbarber' }),
      sec('narx', 'vclist', { eyebrow: 'Narxlar', title: 'Xizmat *narxlari*', items: [R('Soch olish', 'Klassik yoki zamonaviy', "90 000 so'm"), R('Soqol shakllantirish', "Issiq sochiq va parvarish", "60 000 so'm"), R('Soch + soqol', 'Eng ommabop', "140 000 so'm"), R('Royal paket', 'Soch, soqol, yuz parvarishi', "220 000 so'm"), R('Bolalar uchun', '12 yoshgacha', "70 000 so'm")] }),
      sec('galereya', 'vcgal', { eyebrow: 'Salon', title: 'Bizning *muhit*', items: [{ image: P('barber', 1), caption: 'Klassik kreslo' }, { image: P('barber', 3), caption: 'Ustalar asbobi' }, { image: P('barber', 4), caption: 'Soqol parvarishi' }, { image: P('barber', 5), caption: 'Aniq chiziqlar' }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Bizni *toping*', address: "Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 100", hint: "Mo'ljal: Yunusobod metrosi yonida", hours: 'Har kuni 10:00 – 22:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });

  /* 5. Klinika */
  mk({ id: 'vz-klinika', name: 'Vizitka: klinika / shifokor', icon: 'pulse', dark: false, tags: ['klinika', 'shifokor', 'stomatolog', 'tibbiyot', 'doktor', 'poliklinika', 'vrach'], desc: "Klinika, stomatologiya va shifokorlar uchun: qabulga yozilish, xizmatlar va narxlar, toza va ishonchli dizayn.", brand: 'Salomat Klinika', logoText: 'S', tagline: "Sog'lig'ingiz — bizning ishimiz", phone: '+998 71 200 30 40', tg: '@salomatklinika', ig: '@salomat.klinika',
    sections: () => [
      card({ design: 'clinic', badge: 'Toshkent · Ko\'p tarmoqli klinika', logoText: 'S', name: 'Salomat', sub: 'Klinika', role: 'Tajribali shifokorlar · Zamonaviy diagnostika', text: "Bir joyda: shifokor ko'rigi, tahlillar va davolash. Qabulga onlayn yoziling, navbatsiz.",
        stats: [{ icon: 'users', value: 15000, suffix: '+', label: 'Bemor' }, { icon: 'award', value: 12, suffix: ' yil', label: 'Tajriba' }, { icon: 'pulse', value: 20, suffix: '+', label: 'Shifokor' }],
        pills: [{ icon: 'clock', label: '8:00 – 21:00' }, { icon: 'calendar', label: 'Dushanba – Shanba' }],
        links: [L('calendar', 'Qabulga yozilish', 'Onlayn, 1 daqiqada', '+998712003040'), L('telegram', 'Telegram', 'Savollar va natijalar', 't.me/salomatklinika'), L('insta', 'Instagram', 'Yangiliklar va maslahatlar', 'instagram.com/salomat.klinika'), L('globe', 'Sayt', 'salomat-klinika.uz', 'salomat-klinika.uz')],
        socials: [S('instagram', '@salomat.klinika'), S('telegram', '@salomatklinika'), S('whatsapp', '+998712003040'), S('mail', 'info@salomat-klinika.uz')], ctaText: 'Shifokorga yozilish', ctaLink: '+998712003040' }),
      sec('yonalish', 'vcsvc', { eyebrow: "Yo'nalishlar", title: 'Bizning *shifokorlar*', items: [I('heart', 'Terapevt', 'Umumiy ko\'rik'), I('pulse', 'Kardiolog', 'Yurak va qon bosimi'), I('baby', 'Pediatr', 'Bolalar salomatligi'), I('tooth', 'Stomatolog', 'Tish davolash'), I('shield', 'Tahlillar', 'Laboratoriya'), I('eye', 'Diagnostika', 'UZI, EKG')] }),
      sec('narx', 'vclist', { eyebrow: 'Narxlar', title: 'Xizmatlar *narxi*', items: [R('Terapevt konsultatsiyasi', '30 daqiqa', "150 000 so'm"), R('Kardiolog + EKG', "Ko'rik va tekshiruv", "280 000 so'm"), R('Umumiy qon tahlili', 'Natija shu kuni', "90 000 so'm"), R('UZI tekshiruvi', 'Qorin bo\'shlig\'i', "180 000 so'm")] }),
      sec('sharh', 'vcrev', { eyebrow: 'Sharhlar', title: 'Bemorlar *fikri*', items: [{ text: "Shifokorlar e'tiborli, navbat kutmadim. Hammasi tushunarli tushuntirildi.", name: 'Dilshod T.', role: 'Bemor', stars: 5 }, { text: "Bolamni xotirjam qabul qilishdi. Rahmat butun jamoaga!", name: 'Nigora S.', role: 'Ota-ona', stars: 5 }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Bizni *toping*', address: "Toshkent shahri, Shayxontohur tumani, Navoiy ko'chasi 25", hint: "Mo'ljal: Alisher Navoiy metrosi", hours: 'Dushanba – Shanba 8:00 – 21:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });

  /* 6. Fitnes / yoga */
  mk({ id: 'vz-fitnes', name: 'Vizitka: fitnes / yoga', icon: 'dumbbell', dark: true, tags: ['fitnes', 'fitness', 'sport', 'yoga', 'zal', 'trener', 'gym'], desc: "Sport zali, yoga studiyasi va trenerlar uchun: jonli iliq gradient, abonementlar va sinov darsi.", brand: 'Energy Fit', logoText: 'E', tagline: 'Harakat — hayot', phone: '+998 95 567 89 01', tg: '@energyfit', ig: '@energy.fit.uz',
    sections: () => [
      card({ design: 'sunset', badge: 'Toshkent · Fitnes klub', logoText: 'E', name: 'Energy', sub: 'Fit Club', role: 'Trenajyor · Yoga · Kardio', text: "Zamonaviy zal, tajribali trenerlar va qulay jadval. Birinchi sinov darsi — bepul.",
        stats: [{ icon: 'dumbbell', value: 1200, suffix: '+', label: "A'zolar" }, { icon: 'users', value: 12, suffix: '', label: 'Trener' }, { icon: 'sun', value: 7, suffix: '/7', label: 'Haftada' }],
        pills: [{ icon: 'clock', label: '6:00 – 23:00' }, { icon: 'pin', label: 'Chilonzor' }],
        links: [L('zap', 'Bepul sinov darsi', 'Hoziroq yoziling', 't.me/energyfit'), L('tel', "Qo'ng'iroq qilish", '+998 95 567 89 01', '+998955678901'), L('insta', 'Instagram', 'Mashqlar va natijalar', 'instagram.com/energy.fit.uz'), L('telegram', 'Telegram kanali', 'Aksiyalar', 't.me/energyfit')],
        socials: [S('instagram', '@energy.fit.uz'), S('telegram', '@energyfit'), S('youtube', '@energyfit'), S('tiktok', 'energy.fit.uz')], ctaText: 'Sinov darsiga yozilish', ctaLink: 't.me/energyfit' }),
      sec('yonalish', 'vcsvc', { eyebrow: "Yo'nalishlar", title: 'Nima *taklif qilamiz*', items: [I('dumbbell', 'Trenajyor zali', 'Zamonaviy uskunalar'), I('flower', 'Yoga', 'Tinchlik va moslashuvchanlik'), I('pulse', 'Kardio', 'Yurak va chidamlilik'), I('target', 'Shaxsiy trener', 'Maqsadga mos dastur')] }),
      sec('narx', 'vclist', { eyebrow: 'Abonementlar', title: 'Tariflar', items: [R('1 oy', 'Cheksiz tashrif', "350 000 so'm"), R('3 oy', 'Eng foydali', "900 000 so'm"), R('Yoga (8 dars)', 'Guruh mashg\'uloti', "250 000 so'm")] }),
      sec('galereya', 'vcgal', { eyebrow: 'Klub', title: 'Bizning *zal*', items: [{ image: P('fitness', 1), caption: 'Zamonaviy zal' }, { image: P('fitness', 3), caption: 'Guruh mashg\'uloti' }, { image: P('fitness', 4), caption: 'Kuch mashqlari' }, { image: P('yoga', 3), caption: 'Yoga studiyasi' }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Bizni *toping*', address: "Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi 5", hint: "Mo'ljal: Bunyodkor stadioni yonida", hours: 'Har kuni 6:00 – 23:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });

  /* 7. Fotograf / dizayner */
  mk({ id: 'vz-fotograf', name: 'Vizitka: fotograf / dizayner', icon: 'camera', dark: false, tags: ['fotograf', 'foto', 'dizayner', 'videograf', 'kreativ', 'studiya', 'portfolio'], desc: "Fotograf, dizayner va ijodkorlar uchun: minimal oq-qora uslub, portfolio galereya va paketlar.", brand: 'Dilshod Studio', logoText: 'D', tagline: 'Lahzalarni abadiylashtiraman', phone: '+998 97 678 90 12', tg: '@dilshod_studio', ig: '@dilshod.studio',
    sections: () => [
      card({ design: 'mono', badge: "Toshkent · Fotograf va videograf", logoImage: P('odam', 4), name: 'Dilshod', sub: 'Studio', role: "To'y · Portret · Mahsulot", text: "Tabiiy yorug'lik, samimiy kadrlar va tez topshirish. Har bir loyiha uchun alohida g'oya.",
        stats: [{ icon: 'camera', value: 10, suffix: ' yil', label: 'Tajriba' }, { icon: 'heart', value: 300, suffix: '+', label: "To'y" }, { icon: 'image', value: 50, suffix: 'k', label: 'Kadr' }],
        pills: [{ icon: 'clock', label: 'Javob: 2 soat ichida' }, { icon: 'pin', label: 'Toshkent va viloyatlar' }],
        links: [L('image', 'Portfolio', 'Eng yaxshi ishlarim', 'dilshod.studio'), L('telegram', 'Buyurtma berish', 'Telegram orqali', 't.me/dilshod_studio'), L('insta', 'Instagram', '@dilshod.studio', 'instagram.com/dilshod.studio'), L('link', 'Behance', 'Dizayn loyihalar', 'behance.net/dilshod')],
        socials: [S('instagram', '@dilshod.studio'), S('telegram', '@dilshod_studio'), S('youtube', '@dilshodstudio'), S('tiktok', 'dilshod.studio')], ctaText: 'Suratga tushish', ctaLink: 't.me/dilshod_studio' }),
      sec('galereya', 'vcgal', { eyebrow: 'Portfolio', title: 'Tanlangan *ishlar*', items: [{ image: P('fotograf', 1), caption: 'Reportaj' }, { image: P('fotograf', 2), caption: 'Tabiat' }, { image: P('fotograf', 6), caption: 'Portret' }, { image: P('fotograf', 5), caption: 'Retro' }, { image: P('fotograf', 4), caption: 'Hayot lavhalari' }] }),
      sec('narx', 'vclist', { eyebrow: 'Paketlar', title: 'Foto *paketlar*', items: [R('Portret seansi', '1 soat, 30 ta retush', "400 000 so'm"), R('Mahsulot suratlari', '20 ta kadr', "1 200 000 so'm"), R("To'y kuni", "Butun kun, albom bilan", "3 500 000 so'm")] }),
      sec('sharh', 'vcrev', { eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: "To'yimizning har bir lahzasini shunchalik chiroyli olibdi! Rahmat.", name: 'Aziza va Jamshid', role: "To'y", stars: 5 }, { text: "Mahsulot suratlari sotuvimizni sezilarli oshirdi.", name: 'Gulnora M.', role: "Onlayn do'kon", stars: 5 }] }),
    ] });

  /* 8. Yurist / konsalting */
  mk({ id: 'vz-yurist', name: 'Vizitka: yurist / konsalting', icon: 'briefcase', dark: false, tags: ['yurist', 'advokat', 'konsalting', 'maslahat', 'buxgalter', 'huquq', 'юрист'], desc: "Yurist, advokat va konsultantlar uchun: bepul maslahat tugmasi, xizmatlar va ishonchli ko'k dizayn.", brand: 'Adolat Yuridik Markazi', logoText: 'A', tagline: 'Huquqingiz himoyasida', phone: '+998 71 210 20 30', tg: '@adolat_yurist', ig: '@adolat.yurist',
    sections: () => [
      card({ design: 'ocean', badge: 'Toshkent · Yuridik xizmatlar', logoText: 'A', name: 'Adolat', sub: 'Yuridik Markazi', role: 'Biznes · Oila · Ko\'chmas mulk', text: "Murakkab huquqiy masalalarni oddiy tilda tushuntiramiz va ishingizni oxirigacha olib boramiz. Birinchi maslahat — bepul.",
        stats: [{ icon: 'scale', value: 12, suffix: ' yil', label: 'Tajriba' }, { icon: 'award', value: 900, suffix: '+', label: 'Ish' }, { icon: 'users', value: 2500, suffix: '+', label: 'Mijoz' }],
        pills: [{ icon: 'clock', label: '9:00 – 18:00' }, { icon: 'calendar', label: 'Dushanba – Juma' }],
        links: [L('send', 'Bepul maslahat olish', 'Telegram orqali yozing', 't.me/adolat_yurist'), L('tel', "Qo'ng'iroq qilish", '+998 71 210 20 30', '+998712102030'), L('globe', 'Sayt', 'adolat-yurist.uz', 'adolat-yurist.uz'), L('mail', 'Email', 'info@adolat-yurist.uz', 'mailto:info@adolat-yurist.uz')],
        socials: [S('telegram', '@adolat_yurist'), S('instagram', '@adolat.yurist'), S('linkedin', 'adolat-yurist'), S('whatsapp', '+998712102030')], ctaText: 'Bepul maslahat', ctaLink: 't.me/adolat_yurist' }),
      sec('yonalish', 'vcsvc', { eyebrow: 'Xizmatlar', title: "Qanday *yordam beramiz*", items: [I('building', 'Biznes yuristi', "Ro'yxatdan o'tkazish, litsenziya"), I('heart', 'Oilaviy ishlar', 'Nikoh, ajrim, meros'), I('home', "Ko'chmas mulk", 'Oldi-sotdi, hujjatlar'), I('pen', 'Shartnomalar', 'Tuzish va tekshirish')] }),
      sec('narx', 'vclist', { eyebrow: 'Narxlar', title: 'Taxminiy *narxlar*', items: [R('Birinchi maslahat', '20 daqiqa', 'Bepul'), R('Shartnoma tuzish', 'Tekshirish bilan', "400 000 so'm"), R('Sudda ishtirok', 'Bir majlis uchun', "2 000 000 so'm")] }),
      sec('sharh', 'vcrev', { eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: "Tez, aniq va tushunarli yordam berishdi. Ishimiz yutuq bilan yakunlandi.", name: 'Rustam B.', role: 'Tadbirkor', stars: 5 }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Ofisimiz *manzili*', address: "Toshkent shahri, Mirobod tumani, Shahrisabz ko'chasi 12", hint: "Mo'ljal: Mustaqillik maydoni yaqinida", hours: 'Dushanba – Juma 9:00 – 18:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });

  /* 9. Tadbir / DJ / studiya */
  mk({ id: 'vz-tadbir', name: 'Vizitka: tadbir / DJ / studiya', icon: 'music', dark: true, tags: ['tadbir', 'dj', 'musiqa', "to'y", 'event', 'konsert', 'studiya', 'ko\'ngilochar'], desc: "Tadbir tashkilotchilari, DJ va ko'ngilochar studiyalar uchun: neon rang, videolar va tez buyurtma.", brand: 'Nova Events', logoText: 'N', tagline: "Esda qoladigan tadbirlar", phone: '+998 98 789 01 23', tg: '@nova_events', ig: '@nova.events.uz',
    sections: () => [
      card({ design: 'neon', badge: "Toshkent · Tadbirlar studiyasi", logoText: 'N', name: 'Nova', sub: 'Events', role: "To'y · Korporativ · Konsert", text: "G'oyadan ijrogacha: sahna, ovoz, yorug'lik va ko'ngilochar dastur. Tadbiringiz esda qolsin.",
        stats: [{ icon: 'music', value: 400, suffix: '+', label: 'Tadbir' }, { icon: 'users', value: 50, suffix: 'k', label: 'Mehmon' }, { icon: 'star', value: 9, suffix: ' yil', label: 'Tajriba' }],
        pills: [{ icon: 'calendar', label: 'Band qilish: 2 hafta oldin' }, { icon: 'pin', label: "Butun O'zbekiston" }],
        links: [L('send', 'Tadbirga buyurtma', 'Telegram orqali', 't.me/nova_events'), L('tel', "Qo'ng'iroq qilish", '+998 98 789 01 23', '+998987890123'), L('youtube', 'YouTube', 'Tadbirlardan videolar', 'youtube.com/@novaevents'), L('insta', 'Instagram', 'Yangi tadbirlar', 'instagram.com/nova.events.uz')],
        socials: [S('instagram', '@nova.events.uz'), S('telegram', '@nova_events'), S('youtube', '@novaevents'), S('tiktok', 'nova.events.uz')], ctaText: 'Tadbirni band qilish', ctaLink: 't.me/nova_events' }),
      sec('yonalish', 'vcsvc', { eyebrow: 'Formatlar', title: 'Nimani *tashkil qilamiz*', items: [I('heart', "To'y marosimi", 'Dastur va bezak'), I('briefcase', 'Korporativ', 'Jamoa va taqdimot'), I('gift', "Tug'ilgan kun", 'Bolalar va kattalar'), I('music', 'Konsert', 'Sahna va ovoz')] }),
      sec('galereya', 'vcgal', { eyebrow: 'Tadbirlar', title: 'Bizning *ishlar*', items: [{ image: P('toy', 1), caption: "To'y zali" }, { image: P('musiqa', 1), caption: 'Konsert' }, { image: P('toy', 4), caption: 'Ochiq havoda' }, { image: P('musiqa', 5), caption: 'DJ chiqishi' }] }),
      sec('sharh', 'vcrev', { eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: "Korporativimiz a'lo o'tdi, hamma xursand. Tashkil etish juda professional.", name: 'Behzod S.', role: 'HR menejer', stars: 5 }, { text: "To'yimizdagi dastur va ovoz sifati ajoyib edi!", name: 'Malika va Otabek', role: "To'y", stars: 5 }] }),
    ] });

  /* 10. Kafe / qandolat */
  mk({ id: 'vz-kafe', name: 'Vizitka: kafe / qandolatxona', icon: 'coffee', dark: false, tags: ['kafe', 'qahva', 'restoran', 'qandolat', 'menyu', 'taom', 'pishiriq', 'non'], desc: "Kafe, qandolatxona va oshxonalar uchun: iliq bej dizayn, menyu narxlari va stol band qilish.", brand: 'Baraka Kafe', logoText: 'B', tagline: 'Issiq qahva, mazali lahzalar', phone: '+998 99 890 12 34', tg: '@baraka_kafe', ig: '@baraka.kafe',
    sections: () => [
      card({ design: 'sand', badge: "Toshkent · Kafe va qandolat", logoText: 'B', name: 'Baraka', sub: 'Kafe', role: 'Qahva · Desert · Nonushta', text: "Har kuni yangi pishiriqlar, xushbo'y qahva va samimiy muhit. Do'stlar va oila bilan keling.",
        stats: [{ icon: 'coffee', value: 25, suffix: '+', label: 'Taom' }, { icon: 'users', value: 8, suffix: 'k', label: 'Mehmon' }, { icon: 'clock', value: 12, suffix: ' soat', label: 'Ochiq' }],
        pills: [{ icon: 'clock', label: '8:00 – 22:00' }, { icon: 'pin', label: 'Yunusobod' }],
        links: [L('utensils', 'Menyuni ko\'rish', 'Narxlar bilan', '#menyu'), L('tel', 'Stol band qilish', '+998 99 890 12 34', '+998998901234'), L('telegram', 'Buyurtma berish', 'Yetkazib berish', 't.me/baraka_kafe'), L('insta', 'Instagram', 'Yangi desertlar', 'instagram.com/baraka.kafe')],
        socials: [S('instagram', '@baraka.kafe'), S('telegram', '@baraka_kafe'), S('whatsapp', '+998998901234'), S('pin', 'Toshkent, Yunusobod, Amir Temur ko\'chasi 50')], ctaText: 'Stol band qilish', ctaLink: '+998998901234' }),
      sec('menyu', 'vclist', { eyebrow: 'Menyu', title: 'Sevimli *taomlar*', items: [R('Kapuchino', 'Yangi maydalangan qahva', "28 000 so'm"), R('Kruassan', 'Sariyog\'li, issiq', "22 000 so'm"), R('Chizkeyk', 'Qulupnay sousi bilan', "38 000 so'm"), R('Nonushta to\'plami', 'Tuxum, avokado, non, choy', "65 000 so'm"), R('Uy limonadi', 'Yalpiz va limon', "25 000 so'm")] }),
      sec('galereya', 'vcgal', { eyebrow: 'Kafe', title: 'Bizning *muhit*', items: [{ image: P('kafe', 1), caption: 'Latte art' }, { image: P('kafe', 4), caption: 'Nonushta' }, { image: P('qandolat', 3), caption: 'Desertlar' }, { image: P('kafe', 2), caption: 'Interyer' }] }),
      sec('manzil', 'vcmap', { eyebrow: '', title: 'Bizni *toping*', address: "Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 50", hint: "Mo'ljal: bog' ro'parasida", hours: 'Har kuni 8:00 – 22:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    ] });
})();
