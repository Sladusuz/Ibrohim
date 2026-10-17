'use strict';
// Go'zallik va salomatlik shablonlari: salon, barber, klinika, stomatolog, yoga, fitness, hayvon.
(function () {
  const { add, sec, P } = window.TplKit;
  const NOTRADE = { orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 } };

  /* =================== SALON =================== */
  add({
    id: 'salon', name: "Go'zallik saloni", cat: "Go'zallik va salomatlik", icon: 'scissors', badge: 'Ommabop',
    tags: ['salon', "go'zallik", 'soch', 'manikyur', 'makiyaj', 'салон', 'красота', 'beauty', 'spa', 'parikmaxer'],
    look: 'luxe',
    desc: "Go'zallik saloni uchun: nafis foto-hero, xizmatlar narxi, oldin/keyin, ustalar va onlayn yozilish.",
    build: () => ({
      v: 2, template: 'salon',
      company: { name: 'Lola Beauty', logo: 'L', tagline: "Soch, tirnoq va yuz uchun g'amxo'rlik: o'zingizni yangidan kashf eting." },
      theme: { preset: 'rose', accent: '', accent2: '', look: 'luxe', motion: true, font: 'luxe', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Yozilish', ctaLink: '#yozilish', search: false },
      announce: { enabled: true, text: "Birinchi tashrif uchun -15% chegirma: «YANGI» so'zini ayting", link: '#yozilish' },
      ...NOTRADE,
      contacts: { phone: '+998 90 321 45 67', email: 'salom@lolabeauty.uz', address: "Toshkent, Mirobod tumani, Taras Shevchenko ko'chasi 24", hours: 'Har kuni 9:00 – 21:00', telegram: '@lolabeauty_uz', instagram: '@lola.beauty.uz' },
      footer: { text: "Sizni go'zal ko'rishdan xursandmiz.", links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: "Toshkentdagi premium salon", titleStart: "Soch emas, *kayfiyat* yaratamiz", words: [], titleEnd: '', text: "Tajribali ustalar, sifatli professional mahsulotlar va sizga mos yondashuv: har tashrif yangi nafosat.", cta1Text: 'Yozilish', cta1Link: '#yozilish', cta2Text: 'Narxlar', cta2Link: '#narx', visual: 'image', image: P('salon', 2), image2: P('salon', 5), spinText: 'Lola Beauty • 8 yillik tajriba • ', chips: ['4.9 mijoz bahosi', '12 usta', '5000+ mamnun mijoz'], windowLines: [], collage: [], trust: [] }),
        sec('lenta', 'marquee', { items: ['Soch turmagi', 'Bo\'yash', 'Manikyur', 'Pedikyur', 'Makiyaj', 'Qosh va kiprik', 'Yuz parvarishi'] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Falsafamiz', text: "Go'zallik shoshilmaydi. Biz sizning *uslubingizni* tinglaymiz va uni *eng yaxshi* ko'rinishga olib chiqamiz.", author: 'Lola Rahimova', role: 'Salon asoschisi, art-direktor', image: P('odam', 1), buttonText: '', buttonLink: '#' }),
        sec('narx', 'menu', { navLabel: 'Narxlar', eyebrow: 'Xizmatlar', title: 'Narxlar va *xizmatlar*', text: "Aniq va shaffof narxlar. Usta darajasiga qarab biroz farq qilishi mumkin.", mode: 'none', items: [
          { id: 's1', name: 'Ayollar soch turmagi', price: 150000, category: 'Soch', tag: 'Hit', description: "Maslahat, yuvish, turmak va yakuniy ukladka. 60 daqiqa.", image: P('salon', 1), active: true },
          { id: 's2', name: "Soch bo'yash (balayaj)", price: 650000, category: 'Soch', tag: '', description: "Premium bo'yoq, tonirovka va parvarish niqobi. 3–4 soat.", image: P('salon', 2), active: true },
          { id: 's3', name: 'Keratin tiklash', price: 450000, category: 'Soch', tag: '', description: "Sochni chuqur tiklash va yaltiroqlik. 2 soat.", image: P('salon', 4), active: true },
          { id: 's4', name: "Manikyur + gel-lak", price: 160000, category: 'Tirnoq', tag: 'Ommabop', description: "Apparat manikyur, shakllantirish va 3 haftalik gel-lak.", image: P('salon', 3), active: true },
          { id: 's5', name: 'Pedikyur', price: 180000, category: 'Tirnoq', tag: '', description: "Klassik yoki apparat pedikyur, lak bilan.", image: P('salon', 5), active: true },
          { id: 's6', name: 'Kechki makiyaj', price: 250000, category: 'Makiyaj', tag: '', description: "Bayram yoki to'y uchun professional makiyaj.", image: P('salon', 6), active: true },
          { id: 's7', name: 'Soch turmagi (to\'y)', price: 400000, category: 'Makiyaj', tag: 'Yangi', description: "Kelin va yaqinlari uchun murakkab turmak.", image: P('salon', 1), active: true }] }),
        sec('oldin', 'compare', { navLabel: '', eyebrow: 'Natija', title: "Oldin va *keyin*", text: "Slayderni suring: ustalarimiz ishining farqini ko'ring.", before: P('salon', 4), after: P('salon', 2), labelBefore: 'Oldin', labelAfter: 'Keyin' }),
        sec('afzal', 'bento', { eyebrow: 'Nima uchun biz', title: "Har bir *tashrif* bayram", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Yoqimli muhit', text: "Shinam zal, choy va yoqimli musiqa.", value: '', icon: 'heart', image: P('salon', 1), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'yillik tajriba', text: '', value: '8+', icon: 'award', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Premium mahsulotlar', text: "Faqat sertifikatlangan, sochga mehribon brendlar.", value: '', icon: 'leaf', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: "Sovg'a sertifikati", text: "Yaqinlaringizga go'zallikni sovg'a qiling.", value: '100 000+', icon: 'gift', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Bolalar uchun burchak', text: '', value: '', icon: 'star', image: P('salon', 3), link: '' }] }),
        sec('usta', 'team', { navLabel: 'Ustalar', eyebrow: 'Jamoa', title: "Bizning *ustalar*", text: "Har biri o'z yo'nalishining mutaxassisi.", items: [
          { name: 'Zilola Karimova', role: "Top-stilist, kolorist", image: P('odam', 1), text: "10 yillik tajriba, balayaj va murakkab bo'yash." },
          { name: 'Nigora Aliyeva', role: "Manikyur ustasi", image: P('odam', 8), text: "Nail-art va apparat manikyur bo'yicha." },
          { name: 'Sevara Tursunova', role: 'Vizajist', image: P('odam', 6), text: "Kundalik va kechki makiyaj, to'y obrazlari." },
          { name: 'Dilshod Yusupov', role: "Barber-stilist", image: P('odam', 4), text: "Erkaklar va bolalar soch turmagi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *aytganidek*", text: '', layout: 'wall', items: [
          { text: "Zilola sochimni shunday bo'yadiki, hamma kimning qo'li ekanini so'raydi!", name: 'Malika Abdullayeva', role: 'Doimiy mijoz', image: P('odam', 3), stars: 5 },
          { text: "Manikyur 4 hafta turdi, lak ham sifatli. Muhit juda yoqimli.", name: 'Kamola Sodiqova', role: 'Mijoz', image: P('odam', 6), stars: 5 },
          { text: "To'yimda makiyaj va soch turmagini shu yerda qildirdim, juda mamnunman.", name: 'Gulnora Ismoilova', role: 'Kelin', image: P('odam', 8), stars: 5 },
          { text: "Narxlar halol, ustalar e'tiborli. Singlimni ham olib keldim.", name: 'Barno Qodirova', role: 'Mijoz', image: P('odam', 1), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Oldindan yozilish shartmi?", a: "Ha, tavsiya etamiz. Telefon yoki sayt orqali istalgan qulay vaqtga yozilishingiz mumkin." },
          { q: "Qaysi mahsulotlardan foydalanasizlar?", a: "Faqat professional, sertifikatlangan brendlar: sochga zararsiz va uzoq muddatli natija beradi." },
          { q: "Kechikib qolsam nima bo'ladi?", a: "15 daqiqagacha kutamiz. Kechikish bo'lsa, iltimos, oldindan xabar bering." },
          { q: "Sovg'a sertifikati bormi?", a: "Ha, 100 000 so'mdan boshlab istalgan summaga sertifikat tayyorlaymiz." },
          { q: "Bo'yash qancha vaqt oladi?", a: "Sochingiz uzunligiga qarab 2 dan 4 soatgacha. Maslahatda aniq vaqtni aytamiz." }] }),
        sec('yozilish', 'contact', { navLabel: 'Yozilish', eyebrow: 'Onlayn yozilish', title: "O'zingizga *vaqt* ajrating", text: "Xizmat va qulay vaqtni tanlang, administrator tasdiqlash uchun qo'ng'iroq qiladi.", form: 'booking', serviceOptions: ['Soch turmagi', "Soch bo'yash", 'Manikyur / pedikyur', 'Makiyaj', 'Keratin', "To'y obrazi"], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== BARBER =================== */
  add({
    id: 'barber', name: 'Barbershop', cat: "Go'zallik va salomatlik", icon: 'scissors', badge: '',
    tags: ['barber', 'barbershop', 'soch olish', 'soqol', 'erkaklar', 'парикмахерская', 'барбершоп', 'haircut', 'beard'],
    look: 'cinema',
    desc: "Erkaklar soch salonlari uchun: qorong'i kinematik ko'rinish, xizmatlar narxi, barberlar va bron.",
    build: () => ({
      v: 2, template: 'barber',
      company: { name: 'IRON Barber', logo: 'I', tagline: "Erkaklar uchun klassik soch va soqol xizmati." },
      theme: { preset: 'gold', accent: '', accent2: '', look: 'cinema', motion: true, font: 'wide', radius: 'sharp', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: 'Bron qilish', ctaLink: '#bron', search: false },
      announce: { enabled: false, text: '', link: '' },
      ...NOTRADE,
      contacts: { phone: '+998 93 555 12 12', email: 'info@ironbarber.uz', address: "Toshkent, Yunusobod tumani, Bog'ishamol ko'chasi 12", hours: 'Har kuni 10:00 – 22:00', telegram: '@ironbarber', instagram: '@iron.barber.uz' },
      footer: { text: 'Haqiqiy erkaklar uchun.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: 'Est. 2018 • Toshkent', titleStart: "Erkak *uslubi* tafsilotda", words: [], titleEnd: '', text: "Klassik soch olish, issiq sochiq bilan soqol parvarishi va jim, sokin muhit. Bir tashrifda yangi siz.", cta1Text: 'Bron qilish', cta1Link: '#bron', cta2Text: 'Narxlar', cta2Link: '#narx', visual: 'none', image: P('barber', 1), trust: [{ value: '4.9', label: 'Google bahosi' }, { value: '8', label: 'barber' }, { value: '30k+', label: 'soch olingan' }] }),
        sec('lenta', 'marquee', { items: ['Fade', 'Klassik soch', 'Soqol dizayni', "Issiq sochiq", "Xavfli ustara", "Bolalar soch turmagi", "Kamuflyaj"] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Manifest', text: "Biz shoshilmaymiz. Har bir *chiziq*, har bir *kesish* aniq. Siz stulda o'tirasiz, qolganini ustaga qoldirasiz.", author: '', role: '', image: '', buttonText: '', buttonLink: '#' }),
        sec('narx', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Narxlar va *xizmatlar*", text: '', items: [
          { title: 'Erkaklar soch olish', text: "Maslahat, yuvish, soch olish va ukladka. 150 000 so'm, 45 daqiqa.", tags: ["150 000 so'm", '45 daq'], image: P('barber', 5), link: '#bron' },
          { title: 'Soqol dizayni', text: "Shakllantirish, issiq sochiq va parvarish moyi. 100 000 so'm.", tags: ["100 000 so'm", '30 daq'], image: P('barber', 4), link: '#bron' },
          { title: 'Soch + soqol kombo', text: "To'liq obraz: tejamli narx. 220 000 so'm.", tags: ["220 000 so'm", '75 daq'], image: P('barber', 6), link: '#bron' },
          { title: 'Xavfli ustara bilan qirish', text: "Klassik hammom ritualidagi to'liq qirish. 120 000 so'm.", tags: ["120 000 so'm", '40 daq'], image: P('barber', 2), link: '#bron' },
          { title: 'Bolalar soch turmagi', text: "12 yoshgacha bolalar uchun. 90 000 so'm.", tags: ["90 000 so'm", '30 daq'], image: P('barber', 3), link: '#bron' }] }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: "Ish *joyimiz*", text: '', layout: 'masonry', items: [
          { image: P('barber', 1), caption: '' }, { image: P('barber', 5), caption: '' }, { image: P('barber', 3), caption: '' }, { image: P('barber', 4), caption: '' }, { image: P('barber', 6), caption: '' }, { image: P('barber', 2), caption: '' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 8, suffix: ' yil', label: 'bozorda' }, { value: 30, suffix: 'k+', label: 'mijoz' }, { value: 8, suffix: '', label: 'barber' }, { value: 98, suffix: '%', label: 'qaytib keladi' }] }),
        sec('jamoa', 'team', { navLabel: 'Barberlar', eyebrow: 'Jamoa', title: "Bizning *barberlar*", text: '', items: [
          { name: 'Aziz Normatov', role: 'Bosh barber', image: P('odam', 2), text: "10 yillik tajriba, fade va klassik uslub." },
          { name: 'Rustam Hasanov', role: 'Barber', image: P('odam', 5), text: "Soqol dizayni va xavfli ustara ustasi." },
          { name: 'Sanjar Ergashev', role: 'Barber', image: P('odam', 4), text: "Zamonaviy fade va bolalar soch turmagi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *fikri*", text: '', layout: 'grid', items: [
          { text: "Eng yaxshi barber Toshkentda. Aziz aka qo'li ravon, muhit zo'r.", name: 'Javlon Rustamov', role: 'Doimiy mijoz', image: P('odam', 5), stars: 5 },
          { text: "Issiq sochiq bilan qirish haqiqiy rohat. Har oy kelaman.", name: 'Behzod Tursunov', role: 'Mijoz', image: P('odam', 2), stars: 5 },
          { text: "Soat aniq, navbat yo'q. Bron qilib kelish juda qulay.", name: 'Otabek Aliyev', role: 'Mijoz', image: P('odam', 4), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Bronsiz kelsa bo'ladimi?", a: "Bo'sh vaqt bo'lsa, qabul qilamiz. Lekin bron qilsangiz, kutmaysiz." },
          { q: "To'lov qanday?", a: "Naqd, karta, Payme va Click orqali." },
          { q: "Bolalarni olib kelsa bo'ladimi?", a: "Albatta, 3 yoshdan boshlab bolalar soch turmagi bor." },
          { q: "Qancha oldin kelish kerak?", a: "Bron vaqtidan 5 daqiqa oldin kelishingiz kifoya." }] }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Bron', title: "Stulingiz *tayyor*", text: "Xizmat va vaqtni tanlang. Biz tasdiqlash uchun qo'ng'iroq qilamiz.", form: 'booking', serviceOptions: ['Soch olish', 'Soqol dizayni', 'Soch + soqol kombo', 'Xavfli ustara', 'Bolalar soch turmagi'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Bron qilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== KLINIKA =================== */
  add({
    id: 'klinika', name: 'Tibbiyot markazi', cat: "Go'zallik va salomatlik", icon: 'heart', badge: '',
    tags: ['klinika', 'tibbiyot', 'shifokor', 'doktor', 'poliklinika', 'клиника', 'медицина', 'clinic', 'medical', 'health'],
    look: 'luxe',
    desc: "Klinika va tibbiyot markazlari uchun: ishonchli, toza ko'rinish, shifokorlar, xizmatlar va qabulga yozilish.",
    build: () => ({
      v: 2, template: 'klinika',
      company: { name: 'MedLife Clinic', logo: 'M', tagline: "Oilangiz salomatligi ishonchli qo'llarda." },
      theme: { preset: 'ocean', accent: '', accent2: '', look: 'cinema', motion: true, font: 'modern', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Qabulga yozilish', ctaLink: '#qabul', search: false },
      announce: { enabled: true, text: "Bepul birlamchi maslahat: yangi bemorlar uchun", link: '#qabul' },
      ...NOTRADE,
      contacts: { phone: '+998 71 200 33 44', email: 'info@medlife.uz', address: "Toshkent, Shayxontohur tumani, Navoiy ko'chasi 45", hours: 'Dush–Shan 8:00 – 20:00', telegram: '@medlife_uz', instagram: '@medlife.uz' },
      footer: { text: 'Litsenziya № 0123456. Maslahat uchun shifokorga murojaat qiling.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: "Zamonaviy diagnostika va davolash", titleStart: "*Sog'lik* eng katta boylikdir", words: [], titleEnd: '', text: "Tajribali shifokorlar, zamonaviy uskunalar va har bir bemorga shaxsiy e'tibor: bir joyda, qulay vaqtda.", cta1Text: 'Qabulga yozilish', cta1Link: '#qabul', cta2Text: 'Xizmatlar', cta2Link: '#xizmat', visual: 'image', image: P('klinika', 2), image2: P('klinika', 3), spinText: 'MedLife • 15 yillik ishonch • ', chips: ['40+ shifokor', '24/7 tez yordam', 'Tahlil 1 kunda'], windowLines: [], collage: [], trust: [] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 15, suffix: ' yil', label: 'faoliyat' }, { value: 40, suffix: '+', label: 'mutaxassis shifokor' }, { value: 120, suffix: 'k+', label: 'davolangan bemor' }, { value: 98, suffix: '%', label: 'mamnun bemor' }] }),
        sec('xizmat', 'bento', { navLabel: 'Xizmatlar', eyebrow: 'Yo\'nalishlar', title: "Barcha *yo'nalishlar* bir joyda", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Terapiya va kardiologiya', text: "Yurak va qon tomir tekshiruvi, EKG, EXO-KG.", value: '', icon: 'heart', image: P('klinika', 6), link: '#qabul' },
          { kind: 'stat', size: 's', tall: false, title: 'turdagi tahlil', text: '', value: '300+', icon: 'check', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Pediatriya', text: "Bolalar shifokori, emlash va doimiy kuzatuv.", value: '', icon: 'users', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Tez yordam', text: "Shoshilinch holatlar uchun doimiy navbatchilik.", value: '24/7', icon: 'shield', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'UZI va diagnostika', text: "Ekspert darajasidagi apparatlar.", value: '', icon: 'eye', image: P('klinika', 1), link: '' }] }),
        sec('narx', 'menu', { navLabel: 'Narxlar', eyebrow: 'Narxlar', title: "Shaffof *narxlar*", text: "Asosiy xizmatlar narxi. Aniq tashxisga qarab o'zgarishi mumkin.", mode: 'none', items: [
          { id: 'k1', name: 'Terapevt qabuli', price: 120000, category: 'Konsultatsiya', tag: '', description: "Dastlabki ko'rik va tavsiyalar. 30 daqiqa.", image: P('klinika', 2), active: true },
          { id: 'k2', name: 'Kardiolog qabuli + EKG', price: 220000, category: 'Konsultatsiya', tag: 'Ommabop', description: "Shifokor ko'rigi va elektrokardiogramma.", image: P('klinika', 3), active: true },
          { id: 'k3', name: 'Pediatr qabuli', price: 100000, category: 'Konsultatsiya', tag: '', description: "Bolalar shifokori, 0–16 yosh.", image: P('klinika', 6), active: true },
          { id: 'k4', name: 'Umumiy qon tahlili', price: 45000, category: 'Tahlillar', tag: '', description: "Natija shu kunning o'zida.", image: P('klinika', 5), active: true },
          { id: 'k5', name: "Qalqonsimon bez gormonlari", price: 160000, category: 'Tahlillar', tag: '', description: "TTG, T3, T4 majmuasi.", image: P('klinika', 4), active: true },
          { id: 'k6', name: 'Qorin bo\'shlig\'i UZI', price: 150000, category: 'Diagnostika', tag: '', description: "Ekspert darajasidagi UZI tekshiruvi.", image: P('klinika', 1), active: true },
          { id: 'k7', name: 'Check-up (to\'liq)', price: 890000, category: 'Diagnostika', tag: 'Tavsiya', description: "20+ tahlil, 3 shifokor ko'rigi, UZI va EKG.", image: P('klinika', 2), active: true }] }),
        sec('nega', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Shifokor sizga *vaqt* ajratadi", text: "Har bir qabul 30 daqiqadan kam emas: so'rab-surishtirish, ko'rik va aniq reja.", bullets: ['Navbatsiz, vaqtga yozilgan qabul', 'Elektron tibbiy karta', 'Natijalar telefoningizda'], image: P('klinika', 6), buttonText: 'Qabulga yozilish', buttonLink: '#qabul' }] }),
        sec('jamoa', 'team', { navLabel: 'Shifokorlar', eyebrow: 'Shifokorlar', title: "Tajribali *mutaxassislar*", text: '', items: [
          { name: 'Dr. Akmal Sobirov', role: 'Kardiolog, tibbiyot fanlari nomzodi', image: P('odam', 7), text: "20 yillik tajriba, yurak kasalliklari." },
          { name: 'Dr. Feruza Nazarova', role: 'Terapevt', image: P('odam', 3), text: "Oilaviy shifokor, profilaktika." },
          { name: 'Dr. Shahlo Karimova', role: 'Pediatr', image: P('odam', 6), text: "Bolalar salomatligi va emlash." },
          { name: 'Dr. Bekzod Aliyev', role: 'Nevrolog', image: P('odam', 5), text: "Bosh og'rig'i, uyqu va asab tizimi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Bemorlar *fikri*", text: '', layout: 'grid', items: [
          { text: "Shifokor juda e'tiborli, hamma narsani tushuntirib berdi. Navbat ham bo'lmadi.", name: 'Nilufar Qosimova', role: 'Bemor', image: P('odam', 1), stars: 5 },
          { text: "Bolamni har yili shu yerda tekshiramiz. Pediatr ajoyib.", name: 'Murod Sattorov', role: 'Ota-ona', image: P('odam', 4), stars: 5 },
          { text: "Tahlil natijalari ertasi kuniyoq telefonimga keldi, juda qulay.", name: 'Gulbahor Yusupova', role: 'Bemor', image: P('odam', 8), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Qabulga qanday yozilaman?", a: "Saytdagi formani to'ldiring yoki qo'ng'iroq qiling. Administrator vaqtni tasdiqlaydi." },
          { q: "Tahlil natijalari qachon tayyor?", a: "Ko'pchilik tahlillar shu kuni, murakkablari 2–3 kunda tayyor bo'ladi." },
          { q: "Sug'urta polisi qabul qilinadimi?", a: "Ha, bir qator sug'urta kompaniyalari bilan hamkorlik qilamiz." },
          { q: "Bolalar uchun alohida shifokor bormi?", a: "Ha, pediatr, bolalar nevrologi va LOR-shifokori qabul qiladi." },
          { q: "Uyga shifokor chaqirish mumkinmi?", a: "Ha, Toshkent bo'ylab uyga shifokor chiqaramiz. Telefon orqali buyurtma bering." }] }),
        sec('qabul', 'contact', { navLabel: 'Yozilish', eyebrow: 'Qabulga yozilish', title: "Shifokorga *yoziling*", text: "Yo'nalishni tanlang, administrator 15 daqiqa ichida bog'lanadi.", form: 'booking', serviceOptions: ['Terapevt', 'Kardiolog', 'Pediatr', 'Nevrolog', 'Tahlillar', 'UZI', 'Check-up'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== STOMATOLOG =================== */
  add({
    id: 'stomatolog', name: 'Stomatologiya', cat: "Go'zallik va salomatlik", icon: 'star', badge: 'Yangi',
    tags: ['stomatolog', 'tish', 'dantist', 'stomatologiya', 'стоматология', 'зубы', 'dental', 'dentist', 'tabassum'],
    look: 'cinema',
    desc: "Stomatologiya klinikasi uchun: yorqin va do'stona ko'rinish, oldin/keyin, narx paketlari va bron.",
    build: () => ({
      v: 2, template: 'stomatolog',
      company: { name: 'Oq Tabassum', logo: 'T', tagline: "Og'riqsiz davolash va chiroyli tabassum." },
      theme: { preset: 'fresh', accent: '', accent2: '', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Qabulga yozilish', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Dastlabki ko'rik va maslahat: bepul", link: '#bron' },
      ...NOTRADE,
      contacts: { phone: '+998 78 150 20 20', email: 'salom@oqtabassum.uz', address: "Samarqand, Registon ko'chasi 18", hours: 'Har kuni 9:00 – 20:00', telegram: '@oqtabassum', instagram: '@oq.tabassum' },
      footer: { text: "Tabassumingiz biz uchun muhim.", links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: "Og'riqsiz stomatologiya", titleStart: "Sog'lom tishlar, *ishonchli* tabassum", words: [], titleEnd: '', text: "Zamonaviy uskunalar, behushlikning eng yangi usullari va bolalar uchun alohida e'tibor. Qo'rquvsiz keling.", cta1Text: 'Qabulga yozilish', cta1Link: '#bron', cta2Text: 'Narxlar', cta2Link: '#narx', visual: 'image', image: P('stomatolog', 6), image2: P('stomatolog', 5), spinText: 'Oq Tabassum • Kafolat 3 yil • ', chips: ["Og'riqsiz", 'Kafolat 3 yil', 'Bolalar uchun'], windowLines: [], collage: [], trust: [] }),
        sec('lenta', 'marquee', { items: ['Davolash', 'Implantatsiya', 'Tish oqartirish', 'Breketlar', 'Protezlash', 'Bolalar stomatologiyasi', 'Tozalash'] }),
        sec('xizmat', 'features', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Davolashdan *estetikagacha*", text: '', layout: 'bento', items: [
          { icon: 'shield', title: 'Davolash va plomba', text: "Karies, pulpit, zamonaviy fotopolimer plombalar." },
          { icon: 'star', title: 'Tish oqartirish', text: "Bir tashrifda 8 tonga oqartirish, emalga zarar yetkazmasdan." },
          { icon: 'award', title: 'Implantatsiya', text: "Premium implantlar, umrbod kafolat." },
          { icon: 'heart', title: 'Bolalar stomatologiyasi', text: "O'yin shaklidagi qabul, qo'rquvsiz davolash." },
          { icon: 'zap', title: 'Breket va aligner', text: "Tishlarni tekislash: ko'rinmas aligner ham mavjud." },
          { icon: 'check', title: 'Professional tozalash', text: "Ultratovush, Air Flow, poliroval." }] }),
        sec('oldin', 'compare', { navLabel: 'Natija', eyebrow: 'Farqni his qiling', title: "Eski klinika va *Oq Tabassum*", text: "Slayderni suring: biz qo'rquv emas, qulaylik yaratamiz.", before: P('stomatolog', 4), after: P('stomatolog', 1), labelBefore: 'An\'anaviy klinika', labelAfter: 'Oq Tabassum' }),
        sec('narx', 'pricing', { navLabel: 'Narxlar', eyebrow: 'Narxlar', title: "Aniq *paketlar*", text: "Yashirin to'lovlarsiz: narx davolashdan oldin kelishiladi.", items: [
          { name: 'Gigiyena', price: "250 000 so'm", period: '1 tashrif', features: ["Ultratovush tozalash", "Air Flow", "Poliroval va ftorlash", "Gigiyena bo'yicha maslahat"], popular: false, cta: 'Tanlash' },
          { name: 'Oqartirish', price: "1 800 000 so'm", period: '1 tashrif', features: ["Professional tozalash", "Zoom oqartirish", "Sezgirlikni kamaytirish", "Uyda parvarish to'plami"], popular: true, cta: 'Tanlash' },
          { name: 'Implant', price: "5 500 000 so'm", period: 'bitta tish', features: ["3D tomografiya", "Premium implant", "Toj (sirkoniy)", "Umrbod kafolat"], popular: false, cta: 'Tanlash' }] }),
        sec('jamoa', 'team', { navLabel: 'Shifokorlar', eyebrow: 'Jamoa', title: "Qo'li *yengil* shifokorlar", text: '', items: [
          { name: 'Dr. Shaxzod Rahimov', role: 'Bosh shifokor, implantolog', image: P('odam', 5), text: "12 yillik tajriba, 2000+ implant." },
          { name: 'Dr. Madina Karimova', role: "Bolalar stomatologi", image: P('odam', 1), text: "Bolalar bilan til topishuvchi mutaxassis." },
          { name: 'Dr. Jahongir Umarov', role: 'Ortodont', image: P('odam', 2), text: "Breket va alignerlar bilan tishlarni to'g'rilash." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *tabassumi*", text: '', layout: 'wall', items: [
          { text: "Hayotimda birinchi marta tish davolatganda og'rimadi. Rahmat!", name: 'Zarina Aliyeva', role: 'Mijoz', image: P('odam', 8), stars: 5 },
          { text: "O'g'lim stomatologdan qo'rqardi, endi o'zi 'bugun boramizmi?' deydi.", name: 'Rustam Karimov', role: 'Ota-ona', image: P('odam', 4), stars: 5 },
          { text: "Oqartirishdan keyin tishlarim yaltirab ketdi, natijaga juda xursandman.", name: 'Sabina Yusupova', role: 'Mijoz', image: P('odam', 6), stars: 5 },
          { text: "Implant qo'ydirdim, 3 oy o'tdi, o'z tishimdek.", name: 'Anvar Tursunov', role: 'Mijoz', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Davolash og'riqlimi?", a: "Zamonaviy behushlik ishlatamiz, jarayonni his qilmaysiz." },
          { q: "Kafolat bormi?", a: "Plomba va toj uchun 3 yil, implant uchun umrbod kafolat beramiz." },
          { q: "Bolalarni nechchi yoshdan olib kelish mumkin?", a: "3 yoshdan. Birinchi tashrif o'yin shaklida, davolashsiz o'tadi." },
          { q: "Bo'lib to'lash mumkinmi?", a: "Ha, implant va breketlar uchun 6–12 oylik bo'lib to'lash mavjud." },
          { q: "Tish oqartirish zararlimi?", a: "Yo'q, xavfsiz tarkib va shifokor nazorati ostida o'tkaziladi." }] }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Bron', title: "Tabassumingizga *vaqt* ajrating", text: "Qulay vaqtni tanlang, administrator tasdiqlash uchun qo'ng'iroq qiladi.", form: 'booking', serviceOptions: ['Dastlabki ko\'rik', 'Davolash', 'Tozalash', 'Oqartirish', 'Implantatsiya', 'Breketlar', 'Bolalar stomatologi'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== YOGA VA SPA =================== */
  add({
    id: 'yoga', name: 'Yoga va spa', cat: "Go'zallik va salomatlik", icon: 'leaf', badge: '',
    tags: ['yoga', 'spa', 'massaj', 'meditatsiya', 'pilates', 'йога', 'спа', 'wellness', 'relax'],
    look: 'luxe',
    desc: "Yoga studiyasi va spa uchun: sokin nafis dizayn, dars jadvali, abonementlar va yozilish.",
    build: () => ({
      v: 2, template: 'yoga',
      company: { name: 'Nafas Studio', logo: 'N', tagline: "Tana, nafas va ong uyg'unligi." },
      theme: { preset: 'minimal', accent: '#6f8f72', accent2: '#c9a27a', look: 'luxe', motion: true, font: 'luxe', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'minimal', cta: 'Yozilish', ctaLink: '#yozilish', search: false },
      announce: { enabled: false, text: '', link: '' },
      ...NOTRADE,
      contacts: { phone: '+998 97 700 11 22', email: 'namaste@nafas.uz', address: "Toshkent, Mirzo Ulug'bek tumani, Mustaqillik ko'chasi 9", hours: 'Har kuni 7:00 – 21:00', telegram: '@nafas_studio', instagram: '@nafas.studio' },
      footer: { text: 'Namaste.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: 'Yoga • Meditatsiya • Spa', titleStart: "Nafas oling. *Sekinlashing.* Qaytib keling.", words: [], titleEnd: '', text: "Shahar shovqinidan uzoqda, yoga darslari va spa-ritualari bilan tanangiz va ongingizga dam bering.", cta1Text: 'Birinchi darsga yozilish', cta1Link: '#yozilish', cta2Text: 'Jadval', cta2Link: '#jadval', visual: 'none', image: P('yoga', 2), trust: [{ value: '25+', label: 'haftalik dars' }, { value: '8', label: 'ustoz' }, { value: '4.9', label: 'mijoz bahosi' }] }),
        sec('biz', 'statement', { navLabel: 'Falsafa', eyebrow: 'Falsafamiz', text: "Biz mukammallikni emas, *muvozanatni* o'rgatamiz. Har dars: *sekin*, mehribon va o'zingiz uchun.", author: 'Madina Hamidova', role: 'Studiya asoschisi, yoga ustozi', image: P('odam', 6), buttonText: '', buttonLink: '#' }),
        sec('uslub', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: 'Yoga', title: "Tanani *uyg'oting*", text: "Hatha, vinyasa va yin-yoga: boshlovchilar va tajribalilar uchun guruhlar.", bullets: ["Boshlovchilar guruhi", 'Kichik guruhlar (10 kishigacha)', 'Mat va jihozlar bepul'], image: P('yoga', 3), buttonText: 'Jadvalni ko\'rish', buttonLink: '#jadval' },
          { label: 'Spa', title: "Ongga *dam* bering", text: "Massaj, aromaterapiya va issiq toshlar bilan to'liq tiklanish seanslari.", bullets: ['Klassik va issiq tosh massaji', 'Aromaterapiya', 'Choy marosimi'], image: P('yoga', 6), buttonText: 'Spa uchun yozilish', buttonLink: '#yozilish' }] }),
        sec('jadval', 'menu', { navLabel: 'Jadval', eyebrow: 'Dars jadvali', title: "Haftalik *jadval*", text: "Barcha darslar 60–75 daqiqa.", mode: 'none', items: [
          { id: 'y1', name: 'Hatha yoga', price: 90000, category: 'Dush • Chor • Juma', tag: '08:00', description: "Sokin boshlanish: asanalar va nafas. Boshlovchilar uchun.", image: P('yoga', 1), active: true },
          { id: 'y2', name: 'Vinyasa flow', price: 110000, category: 'Dush • Chor • Juma', tag: '19:00', description: "Harakat va nafas uyg'unligi, faolroq dars.", image: P('yoga', 4), active: true },
          { id: 'y3', name: 'Yin yoga', price: 100000, category: 'Sesh • Pay', tag: '20:00', description: "Chuqur cho'zilish va tinchlanish.", image: P('yoga', 2), active: true },
          { id: 'y4', name: 'Meditatsiya', price: 70000, category: 'Sesh • Pay', tag: '07:30', description: "Ertalabki nafas va diqqat mashqlari.", image: P('yoga', 3), active: true },
          { id: 'y5', name: 'Klassik massaj', price: 280000, category: 'Spa', tag: '60 daq', description: "Bo'yin, yelka va orqa uchun chuqur massaj.", image: P('yoga', 6), active: true },
          { id: 'y6', name: 'Issiq tosh terapiyasi', price: 380000, category: 'Spa', tag: '75 daq', description: "Vulqon toshlari va aromamoylar bilan.", image: P('yoga', 5), active: true }] }),
        sec('abonement', 'pricing', { navLabel: 'Abonement', eyebrow: 'Abonementlar', title: "O'zingizga *mos* tarif", text: '', items: [
          { name: 'Birinchi dars', price: "50 000 so'm", period: '1 dars', features: ['Istalgan yoga darsi', 'Mat va jihozlar', 'Ustoz bilan suhbat'], popular: false, cta: 'Yozilish' },
          { name: '8 dars', price: "620 000 so'm", period: '1 oy', features: ['Haftada 2 marta', 'Barcha yo\'nalishlar', 'Spa seansida -10%'], popular: true, cta: 'Yozilish' },
          { name: 'Cheksiz', price: "980 000 so'm", period: '1 oy', features: ['Istalgan dars, istalgan vaqt', '1 ta bepul massaj', 'Meditatsiya klubi'], popular: false, cta: 'Yozilish' }] }),
        sec('galereya', 'gallery', { navLabel: '', eyebrow: 'Studiya', title: "Muhit *haqida*", text: '', layout: 'masonry', items: [
          { image: P('yoga', 3), caption: '' }, { image: P('yoga', 5), caption: '' }, { image: P('yoga', 4), caption: '' }, { image: P('yoga', 1), caption: '' }, { image: P('yoga', 6), caption: '' }, { image: P('yoga', 2), caption: '' }] }),
        sec('jamoa', 'team', { navLabel: 'Ustozlar', eyebrow: 'Ustozlar', title: "Sizni *yo'naltiradiganlar*", text: '', items: [
          { name: 'Madina Hamidova', role: 'Hatha va yin yoga', image: P('odam', 6), text: "RYT-500 sertifikat, 9 yillik tajriba." },
          { name: 'Sardor Aliyev', role: 'Vinyasa va meditatsiya', image: P('odam', 5), text: "Hindistonda o'qigan, nafas texnikalari mutaxassisi." },
          { name: 'Gulchehra Nazarova', role: 'Massaj terapevti', image: P('odam', 8), text: "Sertifikatlangan, 7 yillik tajriba." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mehmonlar *aytishicha*", text: '', layout: 'grid', items: [
          { text: "Uch oy ichida uyqum yaxshilandi, yelkamdagi og'riq yo'qoldi.", name: 'Dilfuza Karimova', role: 'Abonement egasi', image: P('odam', 1), stars: 5 },
          { text: "Boshlovchilarga juda mehribon. O'zimni hech qachon yomon his qilmadim.", name: 'Aziza Rahimova', role: 'Yangi a\'zo', image: P('odam', 3), stars: 5 },
          { text: "Issiq tosh terapiyasidan keyin o'zimni yangidan tug'ilgandek his qildim.", name: 'Shaxnoza Aliyeva', role: 'Mehmon', image: P('odam', 8), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Hech qachon yoga qilmaganman, bo'ladimi?", a: "Albatta. Boshlovchilar guruhimiz bor, ustoz har bir harakatni tushuntiradi." },
          { q: "Nima olib kelish kerak?", a: "Qulay kiyim va suv. Mat, blok va kamar studiyada bor." },
          { q: "Darsni bekor qilsa bo'ladimi?", a: "Ha, darsdan 6 soat oldin xabar bersangiz, dars abonementda qoladi." },
          { q: "Homiladorlar uchun dars bormi?", a: "Ha, prenatal yoga haftada 2 marta o'tkaziladi." }] }),
        sec('yozilish', 'contact', { navLabel: 'Yozilish', eyebrow: 'Yozilish', title: "Birinchi *qadamni* qo'ying", text: "Dars yoki spa-seansni tanlang, biz sizga javob beramiz.", form: 'booking', serviceOptions: ['Hatha yoga', 'Vinyasa flow', 'Yin yoga', 'Meditatsiya', 'Massaj', 'Issiq tosh terapiyasi'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== FITNES =================== */
  add({
    id: 'fitness', name: 'Fitnes klub', cat: "Go'zallik va salomatlik", icon: 'zap', badge: 'Ommabop',
    tags: ['fitnes', 'fitness', 'sport zal', 'trenajor', 'gym', 'фитнес', 'спортзал', 'trener', 'bodybuilding'],
    look: 'cinema',
    desc: "Fitnes klub va sport zallar uchun: qorong'i, kuchli ko'rinish, treynerlar, abonementlar va bepul sinov.",
    build: () => ({
      v: 2, template: 'fitness',
      company: { name: 'POWER GYM', logo: 'P', tagline: "Chegarangizdan oshing. Har kuni." },
      theme: { preset: 'dark', accent: '#c6f432', accent2: '#ff5a1f', look: 'cinema', motion: true, font: 'wide', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Bepul sinov', ctaLink: '#sinov', search: false },
      announce: { enabled: true, text: "Bu hafta ro'yxatdan o'tganlarga birinchi hafta bepul", link: '#sinov' },
      ...NOTRADE,
      contacts: { phone: '+998 99 800 10 10', email: 'join@powergym.uz', address: "Toshkent, Chilonzor tumani, Bunyodkor shoh ko'chasi 33", hours: 'Har kuni 6:00 – 24:00', telegram: '@powergym_uz', instagram: '@power.gym.uz' },
      footer: { text: 'No pain, no gain.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: '24/7 • 2 000 m² zal', titleStart: "Kuchli *tana*, kuchli ruh", words: [], titleEnd: '', text: "Zamonaviy trenajorlar, shaxsiy treynerlar va guruh mashg'ulotlari. Bugun boshlang: birinchi mashg'ulot bepul.", cta1Text: 'Bepul sinov', cta1Link: '#sinov', cta2Text: 'Abonementlar', cta2Link: '#narx', visual: 'none', image: P('fitness', 2), trust: [{ value: '3500+', label: 'a\'zo' }, { value: '25', label: 'trener' }, { value: '60+', label: 'guruh dars/hafta' }] }),
        sec('lenta', 'marquee', { items: ['Kuch', 'Kardio', 'Crossfit', 'Boks', 'Yoga', 'Funksional', 'Sauna', 'Shaxsiy trener'] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 3500, suffix: '+', label: 'faol a\'zo' }, { value: 25, suffix: '', label: 'sertifikatli trener' }, { value: 2000, suffix: ' m²', label: 'mashg\'ulot maydoni' }, { value: 24, suffix: '/7', label: 'ochiq' }] }),
        sec('imkon', 'bento', { navLabel: 'Imkoniyatlar', eyebrow: 'Klubimiz', title: "Natija uchun *hamma narsa*", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Erkin og\'irliklar zali', text: "Gantellar, shtangalar va 40+ trenajor.", value: '', icon: 'zap', image: P('fitness', 5), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'dars haftasiga', text: '', value: '60+', icon: 'calendar', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Sauna va dush', text: "Mashg'ulotdan keyin tiklaning: barcha tariflarda.", value: '', icon: 'sun', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Birinchi hafta', text: "Yangi a'zolar uchun bepul sinov davri.", value: 'BEPUL', icon: 'gift', image: '', link: '#sinov' },
          { kind: 'image', size: 'm', tall: false, title: 'Guruh darslari', text: "Boks, kross-fit, yoga va boshqalar.", value: '', icon: 'users', image: P('fitness', 4), link: '' }] }),
        sec('galereya', 'gallery', { navLabel: '', eyebrow: 'Zal', title: "Bizning *maydon*", text: '', layout: 'masonry', items: [
          { image: P('fitness', 1), caption: '' }, { image: P('fitness', 3), caption: '' }, { image: P('fitness', 6), caption: '' }, { image: P('fitness', 2), caption: '' }, { image: P('fitness', 5), caption: '' }, { image: P('fitness', 4), caption: '' }] }),
        sec('jamoa', 'team', { navLabel: 'Treynerlar', eyebrow: 'Treynerlar', title: "Natijaga *yetaklaydiganlar*", text: '', items: [
          { name: 'Bobur Xolmatov', role: 'Bosh trener, bodybuilding', image: P('odam', 2), text: "MS darajasidagi sportchi, 12 yillik tajriba." },
          { name: 'Nilufar Saidova', role: 'Fitnes va yoga treneri', image: P('odam', 8), text: "Ozish va tana shakllanishi bo'yicha mutaxassis." },
          { name: 'Jasur Oripov', role: 'Boks va kross-fit', image: P('odam', 4), text: "Boks bo'yicha respublika chempioni." },
          { name: 'Dilnoza Rahimova', role: 'Guruh darslari', image: P('odam', 6), text: "Funksional va aerobika darslari." }] }),
        sec('narx', 'pricing', { navLabel: 'Abonement', eyebrow: 'Abonementlar', title: "Tarifni *tanlang*", text: "Yillik abonementlarda 25% gacha tejash.", items: [
          { name: 'Start', price: "350 000 so'm", period: '1 oy', features: ["Trenajor zali", "Dush va shkaf", "Dastlabki yo'riqnoma"], popular: false, cta: 'Boshlash' },
          { name: 'Pro', price: "550 000 so'm", period: '1 oy', features: ["Trenajor + guruh darslari", "Sauna", "Oyiga 2 ta shaxsiy trening"], popular: true, cta: 'Boshlash' },
          { name: 'Elite', price: "950 000 so'm", period: '1 oy', features: ["Hamma xizmatlar", "8 ta shaxsiy trening", "Ovqatlanish rejasi", "Parkovka"], popular: false, cta: 'Boshlash' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Natijalar *gapiradi*", text: '', layout: 'wall', items: [
          { text: "4 oyda 14 kg ozdim. Bobur trener meni qo'yib yubormadi!", name: 'Sherzod Aminov', role: 'A\'zo, 1 yil', image: P('odam', 5), stars: 5 },
          { text: "Eng yaxshi jihozlar va tozalik. Kechasi ham ishlaydi, menga ayni muddao.", name: 'Kamila Ergasheva', role: 'A\'zo', image: P('odam', 8), stars: 5 },
          { text: "Guruh darslari juda energiyali, har safar kelgim keladi.", name: 'Otabek Mirzayev', role: 'A\'zo', image: P('odam', 4), stars: 5 },
          { text: "Boks darslari ajoyib. Trener professional va talabchan.", name: 'Aziz Tursunov', role: 'A\'zo', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Bepul sinov qanday o'tadi?", a: "Formani to'ldiring, treyner zalni ko'rsatadi va sizga dastlabki mashg'ulotni o'tkazadi." },
          { q: "Boshlovchi uchun mosmi?", a: "Ha. Har bir yangi a'zoga yo'riqnoma va shaxsiy reja tuzib beramiz." },
          { q: "Abonementni muzlatsa bo'ladimi?", a: "Ha, Pro va Elite tariflarda 30 kungacha muzlatish mumkin." },
          { q: "Parkovka bormi?", a: "Ha, klub oldida bepul parkovka mavjud." }] }),
        sec('sinov', 'contact', { navLabel: 'Bepul sinov', eyebrow: 'Bepul sinov', title: "Birinchi mashg'ulot *bepul*", text: "Raqamingizni qoldiring, treynerimiz qulay vaqtni kelishish uchun bog'lanadi.", form: 'booking', serviceOptions: ['Trenajor zali', 'Guruh darslari', 'Boks', 'Kross-fit', 'Shaxsiy trener'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Sinovga yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== HAYVON / VETERINARIYA =================== */
  add({
    id: 'hayvon', name: 'Veterinariya va zoo-servis', cat: "Go'zallik va salomatlik", icon: 'heart', badge: '',
    tags: ['veterinar', 'veterinariya', 'hayvon', 'it', 'mushuk', 'zoo', 'ветеринар', 'зоосервис', 'vet', 'pet', 'grooming'],
    look: 'luxe',
    desc: "Veterinariya klinikasi va zoo-servis uchun: iliq, do'stona dizayn, xizmatlar, shifokorlar va bron.",
    build: () => ({
      v: 2, template: 'hayvon',
      company: { name: 'Do\'st Vet', logo: 'D', tagline: "Sevimli do'stingiz salomatligi uchun mehr bilan." },
      theme: { preset: 'warm', accent: '', accent2: '', look: 'luxe', motion: true, font: 'soft', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Qabulga yozilish', ctaLink: '#bron', search: false },
      announce: { enabled: false, text: '', link: '' },
      ...NOTRADE,
      contacts: { phone: '+998 91 444 55 66', email: 'salom@dostvet.uz', address: "Toshkent, Yakkasaroy tumani, Bobur ko'chasi 7", hours: 'Har kuni 9:00 – 21:00, tez yordam 24/7', telegram: '@dostvet_uz', instagram: '@dost.vet' },
      footer: { text: "Har bir hayvon mehrga loyiq.", links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: 'Veterinar • Grooming • Mehmonxona', titleStart: "Sizning *do'stingiz* ishonchli qo'llarda", words: [], titleEnd: '', text: "Mushuk, it va boshqa uy hayvonlari uchun tibbiy yordam, grooming va qulay mehmonxona: bir joyda, mehr bilan.", cta1Text: 'Qabulga yozilish', cta1Link: '#bron', cta2Text: 'Xizmatlar', cta2Link: '#xizmat', visual: 'image', image: P('hayvon', 2), image2: P('hayvon', 4), spinText: "Do'st Vet • 24/7 tez yordam • ", chips: ['24/7 tez yordam', 'Uyga chiqish', "Qo'rquvsiz qabul"], windowLines: [], collage: [], trust: [] }),
        sec('lenta', 'marquee', { items: ['Emlash', 'Tekshiruv', 'Grooming', 'Jarrohlik', 'Laboratoriya', 'Mehmonxona', 'Uyga chaqirish'] }),
        sec('xizmat', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Ular uchun *eng yaxshisi*", text: '', items: [
          { title: 'Veterinar qabuli', text: "Ko'rik, tashxis va davolash rejasi. 100 000 so'mdan.", tags: ["100 000 so'm", '30 daq'], image: P('hayvon', 1), link: '#bron' },
          { title: 'Emlash va chip', text: "Import emlar, pasport va chiplash. 120 000 so'mdan.", tags: ['Pasport', 'Chip'], image: P('hayvon', 4), link: '#bron' },
          { title: 'Grooming', text: "Yuvish, qirqish, tirnoq va quloq parvarishi. 150 000 so'mdan.", tags: ['Mushuk', 'It'], image: P('hayvon', 6), link: '#bron' },
          { title: 'Jarrohlik va sterilizatsiya', text: "Zamonaviy behushlik va nazorat. 450 000 so'mdan.", tags: ['Behushlik', 'Nazorat'], image: P('hayvon', 2), link: '#bron' },
          { title: 'Hayvonlar mehmonxonasi', text: "Safar paytida g'amxo'rlik. Kuniga 80 000 so'm.", tags: ['24/7', 'Video'], image: P('hayvon', 5), link: '#bron' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 9, suffix: ' yil', label: 'tajriba' }, { value: 15000, suffix: '+', label: 'davolangan hayvon' }, { value: 12, suffix: '', label: 'veterinar' }, { value: 24, suffix: '/7', label: 'tez yordam' }] }),
        sec('nega', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Qo'rquvsiz va *mehribon* qabul", text: "Hayvonlar stressini kamaytirish uchun alohida kutish zonalari va yumshoq yondashuv.", bullets: ["Mushuk va itlar uchun alohida xona", "Ko'chib yuruvchi shifokor (uyga)", "Onlayn tibbiy karta"], image: P('hayvon', 3), buttonText: 'Qabulga yozilish', buttonLink: '#bron' }] }),
        sec('jamoa', 'team', { navLabel: 'Shifokorlar', eyebrow: 'Jamoa', title: "Bizning *veterinarlar*", text: '', items: [
          { name: 'Dr. Alisher Mirzayev', role: 'Bosh veterinar, jarroh', image: P('odam', 5), text: "12 yillik tajriba, murakkab jarrohlik." },
          { name: 'Dr. Dildora Karimova', role: 'Terapevt, mushuklar mutaxassisi', image: P('odam', 1), text: "Mushuklar kasalliklari va profilaktika." },
          { name: 'Sevinch Aliyeva', role: 'Grooming ustasi', image: P('odam', 8), text: "Barcha zotlar uchun professional parvarish." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Egalari *aytishicha*", text: '', layout: 'grid', items: [
          { text: "Mushugim ko'rikdan qo'rqardi, bu yerda hatto o'ynab ketdi. Rahmat!", name: 'Nargiza Yusupova', role: 'Mushuk egasi', image: P('odam', 3), stars: 5 },
          { text: "Tez yordam chaqirdim, 25 daqiqada keldi va itimni qutqardi.", name: 'Rustam Aliyev', role: 'It egasi', image: P('odam', 4), stars: 5 },
          { text: "Grooming ustasi juda mehribon, mening pugim endi doim shu yerga yuguradi.", name: 'Malika Rahimova', role: 'Mijoz', image: P('odam', 6), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Emlash qaysi yoshdan boshlanadi?", a: "Kuchuk va mushuk bolalari uchun odatda 8 haftalikdan. Shifokor jadval tuzib beradi." },
          { q: "Uyga shifokor chaqirish mumkinmi?", a: "Ha, Toshkent bo'ylab. Chaqiruv narxi 150 000 so'mdan." },
          { q: "Tez yordam ishlaydimi?", a: "Ha, 24/7. Telefon orqali bog'laning, darhol yordam beramiz." },
          { q: "Qaysi hayvonlarni qabul qilasizlar?", a: "Mushuk, it, quyon, hamster, qushlar va boshqa mayda uy hayvonlari." },
          { q: "Mehmonxonaga nima olib kelish kerak?", a: "Sevimli o'yinchoq, oziq-ovqat va emlash pasporti kifoya, qolganini biz tayyorlaymiz." }] }),
        sec('bron', 'contact', { navLabel: 'Yozilish', eyebrow: 'Qabulga yozilish', title: "Do'stingizga *vaqt* ajrating", text: "Xizmatni tanlang, administrator tasdiqlash uchun qo'ng'iroq qiladi.", form: 'booking', serviceOptions: ['Veterinar qabuli', 'Emlash', 'Grooming', 'Jarrohlik', 'Mehmonxona', 'Uyga chaqirish'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });
})();
