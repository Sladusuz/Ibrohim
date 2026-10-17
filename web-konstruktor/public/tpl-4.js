'use strict';
// Shablonlar: talim, til, avtoservis, qurilish, rieltor, yurist, logistika
(function () {
  const { add, sec, P } = window.TplKit;
  const ord = (cur) => ({ enabled: false, currency: cur || "so'm", freeShipFrom: 0, deliveryFee: 0 });
  const ann = (text, link) => text ? { enabled: true, text, link: link || '' } : { enabled: false, text: '', link: '' };

  /* =================== O'QUV MARKAZ =================== */
  add({
    id: 'talim', name: "O'quv markaz", cat: "Ta'lim", icon: 'graduation', badge: 'Ommabop',
    tags: ["o'quv markaz", 'kurs', "ta'lim", 'maktab', 'repetitor', 'учебный центр', 'курсы', 'education', 'academy', 'course'],
    look: 'cinema',
    desc: "O'quv markaz va kurslar uchun: kurslar katalogi, ustozlar, jarayon va bepul sinov darsi.",
    build: () => ({
      v: 2, template: 'talim',
      company: { name: 'Bilim Akademiya', logo: 'B', tagline: "Kelajak kasbini bugun o'rganing: amaliy kurslar, tajribali ustozlar." },
      theme: { preset: 'light', accent: '#4f46e5', accent2: '#06b6d4', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Bepul sinov darsi', ctaLink: '#yozilish', search: false },
      announce: ann("Yangi guruhlar 1-noyabrdan: birinchi dars bepul", '#yozilish'),
      orders: ord(),
      contacts: { phone: '+998 71 205 11 22', email: 'info@bilim-akademiya.uz', address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 24", hours: 'Dush–Shan, 9:00 – 20:00', telegram: '@bilim_akademiya', instagram: '@bilim.akademiya' },
      footer: { text: "Bilim Akademiya. Barcha huquqlar himoyalangan.", links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'aurora', fx: 'aurora', badge: "Qabul ochiq: yangi guruhlar", titleStart: "Bilim bilan *kelajakni* quring", words: [], titleEnd: '', text: "Dasturlash, dizayn, marketing va IELTS: amaliy loyihalar, shaxsiy mentor va ishga joylashishda yordam.", cta1Text: 'Bepul sinov darsi', cta1Link: '#yozilish', cta2Text: "Kurslarni ko'rish", cta2Link: '#kurslar', visual: 'image', image: P('talim', 2), trust: [{ value: '5 000+', label: 'bitiruvchi' }, { value: '92%', label: 'ishga joylashgan' }, { value: '4.9', label: 'talaba bahosi' }] }),
        sec('lenta', 'marquee', { items: ['Dasturlash', 'Grafik dizayn', 'SMM va marketing', 'IELTS', 'Matematika', 'Buxgalteriya', 'Robototexnika'] }),
        sec('kurslar', 'products', { navLabel: 'Kurslar', eyebrow: 'Kurslar', title: "O'zingizga *mos* kursni tanlang", text: "Har bir kurs amaliy loyiha va sertifikat bilan yakunlanadi.", mode: 'inquiry', buttonText: 'Kursga yozilish', columns: '3', search: false, filters: true, sort: false, items: [
          { id: 'k1', name: 'Frontend dasturlash', price: 1500000, oldPrice: 0, category: 'IT', badge: 'Hit', description: "HTML, CSS, JavaScript va React. 6 oy, haftasiga 3 dars.", image: P('dasturchi', 6), stock: '', active: true },
          { id: 'k2', name: 'Grafik dizayn', price: 1200000, oldPrice: 0, category: 'IT', badge: '', description: "Photoshop, Illustrator va Figma. 4 oy, portfolio bilan.", image: P('talim', 3), stock: '', active: true },
          { id: 'k3', name: 'SMM va marketing', price: 1100000, oldPrice: 1300000, category: 'Biznes', badge: 'Aksiya', description: "Instagram, Telegram va targetli reklama. 3 oy.", image: P('startap', 5), stock: '', active: true },
          { id: 'k4', name: 'IELTS tayyorlov', price: 1400000, oldPrice: 0, category: 'Til', badge: '', description: "Speaking, Writing, Listening, Reading. 3 oy, mock testlar bilan.", image: P('talim', 5), stock: '', active: true },
          { id: 'k5', name: 'Matematika (DTM)', price: 900000, oldPrice: 0, category: 'Maktab', badge: '', description: "Oliy o'quv yurtiga kirish imtihoniga tizimli tayyorgarlik.", image: P('talim', 6), stock: '', active: true },
          { id: 'k6', name: 'Buxgalteriya 1C', price: 1000000, oldPrice: 0, category: 'Biznes', badge: 'Yangi', description: "1C dasturi, soliq hisoboti va amaliy keyslar. 3 oy.", image: P('talim', 4), stock: '', active: true }] }),
        sec('nega', 'bento', { eyebrow: 'Nega biz', title: "O'qish *zerikarli* bo'lmasligi kerak", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Kichik guruhlar', text: "Bir guruhda 10 tadan ortiq talaba yo'q: ustoz har kimga vaqt ajratadi.", value: '', icon: 'users', image: P('talim', 2), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'ishga joylashgan', text: '', value: '92%', icon: 'star', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Amaliy loyihalar', text: "Har oy real loyiha: portfolio tayyor bo'lib chiqasiz.", value: '', icon: 'code', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: "Bepul sinov darsi", text: "Qaror qilishdan oldin darsga qatnashing.", value: '0 so\'m', icon: 'gift', image: '', link: '#yozilish' },
          { kind: 'image', size: 'm', tall: false, title: "Qulay o'quv xonalari", text: "Zamonaviy kompyuterlar va tez internet.", value: '', icon: 'home', image: P('talim', 1), link: '' }] }),
        sec('ustozlar', 'team', { navLabel: 'Ustozlar', eyebrow: 'Ustozlar', title: "Siz *o'rganadigan* insonlar", text: "Hammasi o'z sohasida ishlayotgan amaliyotchilar.", items: [
          { name: 'Nodira Saidova', role: 'IELTS ustozi, 8.0 band', image: P('odam', 1), text: "10 yillik tajriba, 600+ talaba." },
          { name: 'Jasur Ergashev', role: 'Senior frontend dasturchi', image: P('odam', 2), text: "Yirik IT kompaniyalarda ishlagan." },
          { name: 'Malika Yusupova', role: 'Dizayner va mentor', image: P('odam', 8), text: "50+ brend uchun dizayn yaratgan." },
          { name: 'Sardor Alimov', role: 'Matematika ustozi', image: P('odam', 5), text: "DTM bo'yicha 120+ yuqori ball." }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: "Qanday o'qiymiz", title: "To'rt qadamda *natijagacha*", text: '', layout: 'stack', items: [
          { title: 'Bepul sinov darsi', text: "Ustoz bilan tanishasiz, kurs va darajangizni aniqlaymiz." },
          { title: 'Guruh va jadval', text: "Sizga qulay vaqtda guruh tanlaymiz, shartnoma tuzamiz." },
          { title: 'Amaliyot va mentor', text: "Har hafta topshiriq, har oy loyiha, doimiy fikr-mulohaza." },
          { title: 'Sertifikat va ish', text: "Yakuniy loyihani himoya qilasiz va hamkor kompaniyalarga tavsiya olasiz." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Bitiruvchilar *aytganidek*", text: '', layout: 'wall', items: [
          { text: "Olti oyda noldan frontendchi bo'ldim. Hozir IT kompaniyada ishlayman.", name: 'Aziza Normatova', role: 'Frontend dasturchi', image: P('odam', 3), stars: 5 },
          { text: "IELTS dan 7.0 oldim. Speaking darslari juda foydali bo'ldi.", name: 'Bobur Karimov', role: 'Talaba', image: P('odam', 4), stars: 5 },
          { text: "Qizim matematikani yaxshi ko'rib qoldi. Ustozlar sabrli va talabchan.", name: 'Gulnora Rahimova', role: 'Ota-ona', image: P('odam', 6), stars: 5 },
          { text: "Dizayn kursidan keyin birinchi buyurtmamni oldim. Rahmat!", name: 'Otabek Tursunov', role: 'Frilanser dizayner', image: P('odam', 7), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Sinov darsi haqiqatan bepulmi?", a: "Ha, birinchi dars to'liq bepul va hech qanday majburiyat yo'q." },
          { q: "Darslar qaysi vaqtda o'tiladi?", a: "Ertalab, tushdan keyin va kechki guruhlar bor. Ish va maktab jadvaliga moslaymiz." },
          { q: "To'lovni bo'lib to'lasa bo'ladimi?", a: "Ha, oyma-oy to'lov va 3 oygacha bo'lib to'lash imkoniyati mavjud." },
          { q: "Sertifikat beriladimi?", a: "Kursni muvaffaqiyatli yakunlaganlarga akademiya sertifikati beriladi." },
          { q: "Onlayn o'qish mumkinmi?", a: "Ha, barcha kurslar offlayn va onlayn formatda mavjud." }] }),
        sec('yozilish', 'contact', { navLabel: 'Yozilish', eyebrow: 'Bepul sinov darsi', title: "Birinchi darsni *bepul* sinab ko'ring", text: "Ma'lumotlaringizni qoldiring: menejer qulay vaqtni kelishish uchun qo'ng'iroq qiladi.", form: 'booking', serviceOptions: ['Frontend dasturlash', 'Grafik dizayn', 'SMM va marketing', 'IELTS tayyorlov', 'Matematika (DTM)', 'Buxgalteriya 1C'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== TIL KURSLARI =================== */
  add({
    id: 'til', name: 'Til kurslari', cat: "Ta'lim", icon: 'globe', badge: '',
    tags: ['til', 'ingliz tili', 'rus tili', 'koreys tili', 'language', 'english', 'языки', 'курсы'],
    look: 'cinema',
    desc: "Ingliz, rus va koreys tili maktabi: darajalar, narxlar, o'sish yo'li va yozilish.",
    build: () => ({
      v: 2, template: 'til',
      company: { name: 'Lingvo Hub', logo: 'L', tagline: "Tilni gapirib o'rganing: yangi til, yangi imkoniyatlar." },
      theme: { preset: 'fresh', accent: '', accent2: '', look: 'cinema', motion: true, font: 'soft', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: 'Darajani aniqlash', ctaLink: '#bron', search: false },
      announce: ann("Daraja aniqlash testi bepul", '#bron'),
      orders: ord(),
      contacts: { phone: '+998 78 150 33 44', email: 'salom@lingvohub.uz', address: "Toshkent, Mirobod tumani, Oybek ko'chasi 40", hours: 'Har kuni 8:00 – 21:00', telegram: '@lingvohub', instagram: '@lingvo.hub' },
      footer: { text: 'Lingvo Hub. Til o\'rganish quvonchli bo\'lsin.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: "Ingliz · Rus · Koreys tillari", titleStart: "Tilni *gapirib* o'rganing", words: [], titleEnd: '', text: "Birinchi darsdanoq gapirasiz. Kichik guruhlar, ona tili darajasidagi ustozlar va sizga mos tezlik.", cta1Text: 'Darajani aniqlash', cta1Link: '#bron', cta2Text: 'Narxlar', cta2Link: '#narx', visual: 'image', image: P('til', 3), image2: P('til', 5), chips: ['A1 dan C1 gacha', 'IELTS · TOPIK', 'Ona tili ustozlari'], spinText: 'GAPIRING • TINGLANG • YOZING • ', trust: [{ value: '3 000+', label: "o'quvchi" }, { value: '7.5', label: "o'rtacha IELTS" }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 3000, suffix: '+', label: "o'quvchi" }, { value: 12, suffix: '', label: 'mohir ustoz' }, { value: 95, suffix: '%', label: 'imtihondan o\'tdi' }, { value: 6, suffix: ' yil', label: 'tajriba' }] }),
        sec('tillar', 'features', { navLabel: 'Tillar', eyebrow: 'Yo\'nalishlar', title: "Qaysi tilni *tanlaysiz?*", text: '', layout: 'grid', items: [
          { icon: 'globe', title: 'Ingliz tili', text: "General English, IELTS, biznes ingliz tili va bolalar uchun guruhlar." },
          { icon: 'book', title: 'Rus tili', text: "Noldan so'zlashuv darajasigacha, shuningdek TRKI imtihoniga tayyorlov." },
          { icon: 'star', title: 'Koreys tili', text: "TOPIK imtihoni, ish va o'qish uchun Koreyaga tayyorgarlik." },
          { icon: 'users', title: 'Speaking club', text: "Haftada ikki marta erkin suhbat: qo'rquvni yengasiz." }] }),
        sec('daraja', 'timeline', { navLabel: "O'sish yo'li", eyebrow: "Yo'l xaritasi", title: "Noldan *erkin* so'zlashgacha", text: '', items: [
          { period: '1–2 oy', title: 'A1: Boshlang\'ich', place: 'Ingliz tili', text: "Salomlashish, tanishuv, kundalik iboralar. Birinchi oydayoq gapira boshlaysiz." },
          { period: '3–5 oy', title: 'A2: Elementar', place: 'Ingliz tili', text: "Sayohat, xarid, ish haqida oddiy suhbat va qisqa matnlar." },
          { period: '6–9 oy', title: 'B1: O\'rta daraja', place: 'Ingliz tili', text: "Fikringizni erkin bildirasiz, filmlar va maqolalarni tushunasiz." },
          { period: '10–14 oy', title: 'B2: Yuqori o\'rta', place: 'Ingliz tili', text: "Ish va o'qish uchun yetarli daraja, IELTS 6.5+ ga tayyorsiz." }] }),
        sec('narx', 'pricing', { navLabel: 'Narxlar', eyebrow: 'Narxlar', title: "Sizga mos *format*", text: "Barcha narxlar oyiga. Birinchi dars bepul.", items: [
          { name: 'Guruh', price: "500 000 so'm", period: '/oy', features: ['8–10 kishilik guruh', 'Haftada 3 dars', 'Darslik bilan', 'Speaking club'], popular: false, cta: 'Tanlash' },
          { name: 'Mini-guruh', price: "850 000 so'm", period: '/oy', features: ['4–5 kishilik guruh', 'Haftada 3 dars', 'Ona tili ustozi', 'Haftalik test', 'Speaking club'], popular: true, cta: 'Tanlash' },
          { name: 'Individual', price: "1 800 000 so'm", period: '/oy', features: ['Shaxsiy ustoz', 'Jadvalni o\'zingiz tanlaysiz', 'Maqsadga mos dastur', 'Onlayn yoki offlayn'], popular: false, cta: 'Tanlash' }] }),
        sec('ustoz', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Gapirishdan *qo'rqmaysiz*", text: "Darsning 70 foizi suhbat. Xato qilish tabiiy, ustozlarimiz buni qo'llab-quvvatlaydi.", bullets: ["Kichik guruhlar", "Haftalik speaking club", "Real hayotiy vaziyatlar"], image: P('til', 4), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Imtihonga *aniq* tayyorlanasiz", text: "IELTS, TOPIK va TRKI uchun maxsus dasturlar. Har oy sinov imtihoni va tahlil.", bullets: ["Mock testlar", "Ustoz tahlili", "Natijaga kafolat"], image: P('til', 6), buttonText: "Yozilish", buttonLink: '#bron' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "O'quvchilar *fikri*", text: '', layout: 'grid', items: [
          { text: "Besh oyda IELTS 7.0 oldim. Ustozim har bir xatoni sabr bilan tushuntirdi.", name: 'Zilola Karimova', role: 'IELTS 7.0', image: P('odam', 8), stars: 5 },
          { text: "Koreys tilini noldan boshladim, hozir Seulda ishlayapman.", name: 'Doniyor Aliyev', role: 'TOPIK 4', image: P('odam', 4), stars: 5 },
          { text: "Speaking club juda foydali. Do'stlar ham orttirdim.", name: 'Madina Yo\'ldosheva', role: 'Talaba', image: P('odam', 6), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Boshlang'ich darajam qanday ekanini qanday bilaman?", a: "Bepul daraja aniqlash testi 20 daqiqa davom etadi, natijani ustoz tushuntiradi." },
          { q: "Bolalar uchun guruhlar bormi?", a: "Ha, 7 yoshdan boshlab o'yin shaklidagi darslar mavjud." },
          { q: "Darslar necha minut?", a: "Har bir dars 90 daqiqa, haftada 3 marta." },
          { q: "Onlayn o'qish mumkinmi?", a: "Ha, Zoom orqali jonli darslar va yozuvlarni qayta ko'rish imkoniyati bor." },
          { q: "Mashg'ulot o'tkazib yuborsam-chi?", a: "Dars yozuvi yuboriladi va ustoz bilan qo'shimcha mashg'ulot belgilash mumkin." }] }),
        sec('bron', 'contact', { navLabel: 'Yozilish', eyebrow: 'Yozilish', title: "Darajangizni *bepul* aniqlang", text: "Raqamingizni qoldiring: test va birinchi dars vaqtini kelishamiz.", form: 'booking', serviceOptions: ['Ingliz tili', 'Rus tili', 'Koreys tili', 'IELTS tayyorlov', 'Bolalar guruhi', 'Individual dars'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== AVTOSERVIS =================== */
  add({
    id: 'avtoservis', name: 'Avtoservis', cat: 'Xizmat', icon: 'tool', badge: '',
    tags: ['avtoservis', 'avto', 'mashina', 'ta\'mir', 'texnik xizmat', 'автосервис', 'car service', 'garage', 'sto'],
    look: 'cinema',
    desc: "Avtoservis va STO uchun: kuchli bosh ekran, xizmat narxlari, jarayon va onlayn yozilish.",
    build: () => ({
      v: 2, template: 'avtoservis',
      company: { name: 'TurboGarage', logo: 'T', tagline: "Mashinangiz ishonchli qo'llarda. Diagnostika, ta'mir, texnik xizmat." },
      theme: { preset: 'warm', accent: '#ff5a1f', accent2: '', look: 'cinema', motion: true, font: 'wide', radius: 'sharp', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: 'Yozilish', ctaLink: '#bron', search: false },
      announce: ann("Kompyuter diagnostikasi: birinchi tashrif 50% arzon", '#bron'),
      orders: ord(),
      contacts: { phone: '+998 90 777 12 12', email: 'service@turbogarage.uz', address: "Toshkent, Sergeli tumani, Yangi Sergeli ko'chasi 15", hours: 'Har kuni 8:00 – 20:00', telegram: '@turbogarage', instagram: '@turbo.garage' },
      footer: { text: 'TurboGarage. Ishonch va sifat.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: "Har kuni 8:00 dan 20:00 gacha", titleStart: "Mashinangiz *haydashga* tayyor", words: [], titleEnd: '', text: "Zamonaviy uskunalar, sertifikatlangan ustalar va ishga 12 oygacha kafolat. Narxni ish boshlanishidan oldin aytamiz.", cta1Text: 'Servisga yozilish', cta1Link: '#bron', cta2Text: 'Narxlar', cta2Link: '#narx', visual: 'none', image: P('avtoservis', 2), trust: [{ value: '15 000+', label: 'ta\'mirlangan avto' }, { value: '12 oy', label: 'kafolat' }, { value: '4.9', label: 'mijozlar bahosi' }] }),
        sec('lenta', 'marquee', { items: ['Diagnostika', 'Dvigatel', "Yog' almashtirish", 'Tormoz tizimi', 'Kuzov ta\'miri', 'Konditsioner', 'Shinomontaj'] }),
        sec('xizmat', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Nima *qilamiz*", text: '', items: [
          { title: 'Kompyuter diagnostikasi', text: "Barcha tizimlar bo'yicha to'liq tekshiruv va xatolar hisoboti.", tags: ['100 000 so\'mdan', '30 daqiqa'], image: P('avtoservis', 1), link: '#bron' },
          { title: 'Dvigatel ta\'miri', text: "Kapital va joriy ta'mir, tarqatish mexanizmi, prokladkalar.", tags: ['1 500 000 so\'mdan', 'Kafolat'], image: P('avtoservis', 6), link: '#bron' },
          { title: "Texnik xizmat va yog'", text: "Moy, filtrlar, svechalar va to'liq tekshiruv ro'yxati.", tags: ['250 000 so\'mdan', '1 soat'], image: P('avtoservis', 3), link: '#bron' },
          { title: 'Kuzov va bo\'yoq', text: "Qirilishlarni tuzatish, polirovka, to'liq bo'yash.", tags: ['400 000 so\'mdan'], image: P('avtoservis', 4), link: '#bron' },
          { title: 'Elektrika va akkumulyator', text: "Elektr tizimi diagnostikasi, akkumulyator va generator.", tags: ['150 000 so\'mdan'], image: P('avtoservis', 5), link: '#bron' }] }),
        sec('narx', 'menu', { navLabel: 'Narxlar', eyebrow: 'Narxlar', title: "Aniq va *halol* narxlar", text: "Ish boshlanishidan oldin narxni kelishamiz: yashirin to'lovlar yo'q.", mode: 'none', items: [
          { id: 'n1', name: 'Kompyuter diagnostikasi', price: 100000, category: 'Diagnostika', description: "Barcha tizimlarni skanerlash, xatolarni o'qish.", tag: 'Hit', image: '', active: true },
          { id: 'n2', name: 'Yurish qismi diagnostikasi', price: 80000, category: 'Diagnostika', description: "Amortizator, richag va tayanchlar tekshiruvi.", tag: '', image: '', active: true },
          { id: 'n3', name: "Moy va filtr almashtirish", price: 250000, category: 'Texnik xizmat', description: "Dvigatel moyi, moy va havo filtri (materialsiz).", tag: '', image: '', active: true },
          { id: 'n4', name: 'To\'liq texnik xizmat', price: 650000, category: 'Texnik xizmat', description: "Barcha suyuqlik va filtrlar, svecha, 40 punktli tekshiruv.", tag: 'Tavsiya', image: '', active: true },
          { id: 'n5', name: 'Tormoz kolodkalari', price: 180000, category: 'Ta\'mir', description: "Old yoki orqa kolodkalarni almashtirish.", tag: '', image: '', active: true },
          { id: 'n6', name: 'Tarqatish mexanizmi (GRM)', price: 900000, category: 'Ta\'mir', description: "Tasma, rolik va nasos almashtirish.", tag: '', image: '', active: true },
          { id: 'n7', name: 'Konditsioner to\'ldirish', price: 220000, category: 'Ta\'mir', description: "Freon bilan to'ldirish va sizib chiqishni tekshirish.", tag: '', image: '', active: true },
          { id: 'n8', name: 'Polirovka', price: 450000, category: 'Kuzov', description: "To'liq kuzov polirovkasi va himoya qoplamasi.", tag: '', image: '', active: true }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 15000, suffix: '+', label: "ta'mirlangan avtomobil" }, { value: 14, suffix: '', label: 'usta-mutaxassis' }, { value: 12, suffix: ' oy', label: 'ishga kafolat' }, { value: 98, suffix: '%', label: 'qayta murojaat' }] }),
        sec('nega', 'bento', { eyebrow: 'Afzalliklar', title: "Nega *aynan* biz", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Zamonaviy uskunalar', text: "Nemis va yapon diagnostika stendlari, original ehtiyot qismlar.", value: '', icon: 'settings', image: P('avtoservis', 1), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'kafolat muddati', text: '', value: '12 oy', icon: 'shield', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Halol hisobot', text: "Almashtirilgan eski qismlarni qaytarib beramiz.", value: '', icon: 'check', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Bepul evakuator', text: "Murakkab ta'mir uchun mashinangizni olib kelamiz.", value: '0 so\'m', icon: 'truck', image: '', link: '#bron' },
          { kind: 'image', size: 'm', tall: false, title: 'Real vaqtda foto-hisobot', text: "Ish jarayoni suratlari Telegramga.", value: '', icon: 'camera', image: P('avtoservis', 2), link: '' }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: "Qanday *ishlaymiz*", text: '', layout: 'stack', items: [
          { title: 'Qabul va diagnostika', text: "Muammoni eshitamiz, mashinani skanerdan o'tkazamiz." },
          { title: 'Narx va kelishuv', text: "Ishlar ro'yxati va aniq narxni siz tasdiqlaysiz." },
          { title: "Ta'mir", text: "Sertifikatlangan ustalar original qismlar bilan ishlaydi." },
          { title: 'Topshirish va kafolat', text: "Sinov haydovi, hisobot va 12 oygacha kafolat varaqasi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *ishonchi*", text: '', layout: 'grid', items: [
          { text: "Boshqa servisda topolmagan muammoni bir soatda aniqlashdi. Narx ham halol.", name: 'Rustam Sobirov', role: 'Chevrolet Malibu egasi', image: P('odam', 2), stars: 5 },
          { text: "Tarqatish mexanizmini kelishilgan muddatda va kafolat bilan almashtirishdi.", name: 'Anvar Xolmatov', role: 'Kia K5 egasi', image: P('odam', 5), stars: 5 },
          { text: "Foto-hisobot juda qulay: ish jarayonini telefondan kuzatdim.", name: 'Dilshod Qodirov', role: 'Hyundai Sonata egasi', image: P('odam', 4), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Ta'mir qancha vaqt oladi?", a: "Texnik xizmat 1–2 soat, murakkab ishlar 1–3 kun. Aniq muddatni diagnostikadan keyin aytamiz." },
          { q: "Kafolat beriladimi?", a: "Ha, bajarilgan ishga 12 oygacha, qismlarga ishlab chiqaruvchi kafolati beriladi." },
          { q: "O'z ehtiyot qismimni olib kelsam bo'ladimi?", a: "Mumkin, lekin kafolat faqat ish haqiga tegishli bo'ladi." },
          { q: "Qaysi markalar bilan ishlaysiz?", a: "Chevrolet, Kia, Hyundai, Toyota, BYD, Chery va boshqa ko'pchilik markalar." }] }),
        sec('bron', 'contact', { navLabel: 'Yozilish', eyebrow: 'Servisga yozilish', title: "Navbatsiz *yoziling*", text: "Qulay kun va vaqtni tanlang: ustalarimiz sizni kutadi.", form: 'booking', serviceOptions: ['Kompyuter diagnostikasi', "Moy va texnik xizmat", "Dvigatel ta'miri", "Tormoz tizimi", "Kuzov va bo'yoq", 'Konditsioner', 'Boshqa'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== QURILISH VA TA'MIRLASH =================== */
  add({
    id: 'qurilish', name: "Qurilish va ta'mirlash", cat: "Ko'chmas mulk va qurilish", icon: 'home', badge: '',
    tags: ['qurilish', "ta'mirlash", 'remont', 'uy qurish', 'pudrat', 'строительство', 'ремонт', 'construction', 'renovation'],
    look: 'cinema',
    desc: "Qurilish va ta'mirlash kompaniyasi: loyihalar, oldin/keyin, jarayon va smeta so'rovi.",
    build: () => ({
      v: 2, template: 'qurilish',
      company: { name: 'Mustahkam Qurilish', logo: 'M', tagline: "Uy, ofis va tijorat obyektlari: loyihadan kalitgacha." },
      theme: { preset: 'minimal', accent: '#e8780c', accent2: '', look: 'cinema', motion: true, font: 'geometric', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Smeta olish', ctaLink: '#smeta', search: false },
      announce: ann("Bepul o'lchov va dastlabki smeta: 24 soat ichida", '#smeta'),
      orders: ord(),
      contacts: { phone: '+998 71 244 90 90', email: 'info@mustahkam.uz', address: "Toshkent, Yakkasaroy tumani, Shota Rustaveli ko'chasi 12", hours: 'Dush–Shan, 9:00 – 18:00', telegram: '@mustahkam_qurilish', instagram: '@mustahkam.qurilish' },
      footer: { text: 'Mustahkam Qurilish. Ishonchli poydevor.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: "Litsenziyalangan pudratchi", titleStart: "Ishonch bilan *quramiz*, vaqtida topshiramiz", words: [], titleEnd: '', text: "Uy qurish, to'liq ta'mirlash va tijorat obyektlari. Shartnoma, qat'iy muddat va 5 yillik kafolat.", cta1Text: 'Smeta olish', cta1Link: '#smeta', cta2Text: 'Loyihalar', cta2Link: '#loyiha', visual: 'none', image: P('qurilish', 3), trust: [{ value: '240+', label: 'topshirilgan obyekt' }, { value: '5 yil', label: 'kafolat' }, { value: '12 yil', label: 'bozorda' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 240, suffix: '+', label: 'obyekt topshirildi' }, { value: 12, suffix: ' yil', label: 'tajriba' }, { value: 60, suffix: '+', label: 'usta va muhandis' }, { value: 98, suffix: '%', label: 'muddatga rioya' }] }),
        sec('xizmat', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Nimalarni *quramiz*", text: '', items: [
          { title: 'Uy-joy qurilishi', text: "Hovli uylari va kottejlar: poydevordan tom yopishgacha, kalit topshirish bilan.", tags: ['Loyiha', 'Pudrat'], image: P('qurilish', 5), link: '#smeta' },
          { title: "To'liq ta'mirlash", text: "Kvartira va uylar uchun dizayn-loyihadan tayyor interyergacha.", tags: ['Dizayn', "Ta'mir"], image: P('rieltor', 4), link: '#smeta' },
          { title: 'Tijorat obyektlari', text: "Ofis, do'kon va restoranlar: tez va hisobli ish.", tags: ['Ofis', "Do'kon"], image: P('qurilish', 6), link: '#smeta' },
          { title: 'Tom va fasad', text: "Tom yopish, issiqlik izolyatsiyasi va fasad pardozi.", tags: ['Tom', 'Fasad'], image: P('rieltor', 5), link: '#smeta' }] }),
        sec('loyiha', 'showcase', { navLabel: 'Loyihalar', eyebrow: 'Portfolio', title: "Bizning *ishlar*", text: "Oxirgi yillardagi ishlarimizdan namunalar.", items: [
          { title: 'Zamonaviy kottej, Qibray', tag: '320 m² · 2023', image: P('rieltor', 1), link: '' },
          { title: 'Turar-joy majmuasi', tag: '12 qavat · 2024', image: P('qurilish', 2), link: '' },
          { title: 'Loft uslubidagi kvartira', tag: '86 m² · 2024', image: P('rieltor', 4), link: '' },
          { title: 'Biznes markaz', tag: '8 000 m² · 2022', image: P('qurilish', 6), link: '' },
          { title: 'Oilaviy uy, Chirchiq', tag: '210 m² · 2023', image: P('rieltor', 6), link: '' }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: "Ish *qanday* boradi", text: '', layout: 'stack', items: [
          { title: "O'lchov va smeta", text: "Muhandisimiz obyektga boradi, 24 soatda aniq smeta tayyorlaymiz." },
          { title: 'Shartnoma va loyiha', text: "Narx, muddat va jadvalni shartnomaga yozamiz: keyin o'zgarmaydi." },
          { title: 'Qurilish', text: "Haftalik hisobot va foto-nazorat. Siz doim jarayondan xabardorsiz." },
          { title: 'Topshirish va kafolat', text: "Birgalikda ko'rik, kamchiliklarni bartaraf etish va 5 yillik kafolat." }] }),
        sec('nega', 'bento', { eyebrow: 'Afzalliklar', title: "Nega *bizga* ishonishadi", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Qat\'iy nazorat', text: "Har bosqichda texnik nazoratchi sifatni tekshiradi.", value: '', icon: 'shield', image: P('qurilish', 4), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'kafolat', text: '', value: '5 yil', icon: 'shield', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Qat\'iy narx', text: "Shartnomadagi narx ish davomida oshmaydi.", value: '', icon: 'dollar', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Bepul smeta', text: "Yo'l-yo'riq va dastlabki hisob-kitob.", value: '0 so\'m', icon: 'gift', image: '', link: '#smeta' },
          { kind: 'image', size: 'm', tall: false, title: 'Sifatli materiallar', text: "Faqat sertifikatlangan yetkazib beruvchilar.", value: '', icon: 'package', image: P('qurilish', 1), link: '' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *fikri*", text: '', layout: 'grid', items: [
          { text: "Uyimizni kelishilgan muddatdan 10 kun oldin topshirishdi. Sifatidan juda mamnunmiz.", name: 'Akmal Yo\'ldoshev', role: 'Uy egasi, Qibray', image: P('odam', 5), stars: 5 },
          { text: "Smeta aniq chiqdi, ish davomida hech qanday qo'shimcha to'lov so'ralmadi.", name: 'Nilufar Hasanova', role: 'Kvartira egasi', image: P('odam', 1), stars: 5 },
          { text: "Ofisimizni 6 haftada qurib berishdi. Professional jamoa.", name: 'Timur Abdullayev', role: 'Kompaniya direktori', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Smeta qancha vaqtda tayyor bo'ladi?", a: "O'lchovdan keyin 24–48 soat ichida batafsil smeta beramiz." },
          { q: "Ta'mirlash 1 m² narxi qancha?", a: "Kosmetik ta'mir 400 000 so'mdan, kapital ta'mir 1 200 000 so'mdan, dizayn bilan 2 000 000 so'mdan." },
          { q: "To'lov qanday amalga oshiriladi?", a: "Bosqichma-bosqich: avans 30%, qolgani ish bosqichlari bo'yicha." },
          { q: "Kafolat beriladimi?", a: "Ha, qurilish ishlariga 5 yil, pardoz ishlariga 2 yil kafolat." }] }),
        sec('smeta', 'contact', { navLabel: 'Smeta', eyebrow: 'Smeta so\'rovi', title: "Loyihangiz uchun *bepul* smeta", text: "Obyekt haqida qisqacha yozing: muhandis 1 ish kuni ichida bog'lanadi.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: "Smeta so'rash", mapUrl: '' }),
      ],
    }),
  });

  /* =================== KO'CHMAS MULK AGENTLIGI =================== */
  add({
    id: 'rieltor', name: "Ko'chmas mulk agentligi", cat: "Ko'chmas mulk va qurilish", icon: 'home', badge: 'Yangi',
    tags: ["ko'chmas mulk", 'rieltor', 'kvartira', 'uy', 'sotish', 'ijara', 'недвижимость', 'real estate', 'agency'],
    look: 'luxe',
    desc: "Rieltorlik agentligi uchun: obyektlar katalogi, raqamlar, jamoa va ko'rikka yozilish.",
    build: () => ({
      v: 2, template: 'rieltor',
      company: { name: 'Uyim Estate', logo: 'U', tagline: "Orzuingizdagi uyni topishda ishonchli hamroh." },
      theme: { preset: 'light', accent: '#b8893b', accent2: '', look: 'luxe', motion: true, font: 'luxe', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'minimal', cta: "Ko'rikka yozilish", ctaLink: '#aloqa', search: false },
      announce: ann("Yangi obyektlar: Yunusobod va Mirzo Ulug'bek tumanlarida", '#obyektlar'),
      orders: ord('$'),
      contacts: { phone: '+998 71 200 77 88', email: 'info@uyim-estate.uz', address: "Toshkent, Mirzo Ulug'bek tumani, Mustaqillik 88", hours: 'Har kuni 9:00 – 19:00', telegram: '@uyim_estate', instagram: '@uyim.estate' },
      footer: { text: 'Uyim Estate. Har bir uy: yangi boshlanish.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: "Toshkent bo'yicha 400+ obyekt", titleStart: "Orzuingizdagi *uy* sizni kutmoqda", words: [], titleEnd: '', text: "Kvartira, hovli uy va tijorat maydonlari: sotib olish, sotish va ijara. Hujjatlar va xavfsiz bitim bizdan.", cta1Text: "Obyektlarni ko'rish", cta1Link: '#obyektlar', cta2Text: "Ko'rikka yozilish", cta2Link: '#aloqa', visual: 'image', image: P('rieltor', 1), image2: P('rieltor', 3), chips: ['Yuridik tozalik', '0% yashirin to\'lov', 'Ko\'rik 24 soatda'], spinText: 'UYIM ESTATE • ISHONCH • ', trust: [{ value: '1 200+', label: 'bitim' }, { value: '9 yil', label: 'tajriba' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 1200, suffix: '+', label: 'yopilgan bitim' }, { value: 9, suffix: ' yil', label: 'bozorda' }, { value: 400, suffix: '+', label: 'faol obyekt' }, { value: 97, suffix: '%', label: 'mamnun mijoz' }] }),
        sec('obyektlar', 'products', { navLabel: 'Obyektlar', eyebrow: 'Obyektlar', title: "Tanlangan *obyektlar*", text: "Har biri yuridik jihatdan tekshirilgan va shaxsan ko'rib chiqilgan.", mode: 'inquiry', buttonText: "Ko'rikka yozilish", columns: '3', search: false, filters: true, sort: true, items: [
          { id: 'o1', name: 'Zamonaviy uy, Qibray', price: 185000, oldPrice: 0, category: 'Hovli uylar', badge: 'Yangi', description: "320 m², 5 xona, 8 sotix hovli, garaj va yopiq hovuz.", image: P('rieltor', 1), stock: '', active: true },
          { id: 'o2', name: 'Premium kvartira, Yunusobod', price: 98000, oldPrice: 105000, category: 'Kvartiralar', badge: 'Narx tushdi', description: "112 m², 3 xona, yangi ta'mir, oshxona-studiya.", image: P('rieltor', 2), stock: '', active: true },
          { id: 'o3', name: 'Qulay kvartira, Chilonzor', price: 56000, oldPrice: 0, category: 'Kvartiralar', badge: '', description: "68 m², 2 xona, metroga 5 daqiqa, mebel bilan.", image: P('rieltor', 3), stock: '', active: true },
          { id: 'o4', name: 'Loft, Mirobod', price: 120000, oldPrice: 0, category: 'Kvartiralar', badge: 'Hit', description: "90 m², g'isht devorli loft, baland shiftlar, markaz.", image: P('rieltor', 4), stock: '', active: true },
          { id: 'o5', name: 'Kottej, Chirchiq', price: 142000, oldPrice: 0, category: 'Hovli uylar', badge: '', description: "210 m², 4 xona, 6 sotix, tabiat qo'ynida.", image: P('rieltor', 5), stock: '', active: true },
          { id: 'o6', name: "Yangi uylar majmuasi, Sergeli", price: 42000, oldPrice: 0, category: 'Yangi binolar', badge: '', description: "58 m² dan, topshirish 2026, bo'lib to'lash mavjud.", image: P('rieltor', 6), stock: '', active: true }] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Falsafamiz', text: "Biz uy sotmaymiz, biz *ishonch* quramiz. Har bir bitim: shaffof hujjatlar, halol narx va *xotirjam* qaror.", author: 'Laylo Yusupova', role: 'Agentlik asoschisi', image: P('odam', 8), buttonText: '', buttonLink: '#' }),
        sec('jamoa', 'team', { navLabel: 'Jamoa', eyebrow: 'Jamoa', title: "Sizning *rieltorlaringiz*", text: "Har bir mijozga alohida mutaxassis biriktiriladi.", items: [
          { name: 'Laylo Yusupova', role: 'Bosh rieltor', image: P('odam', 8), text: "9 yil, 500+ bitim." },
          { name: 'Sardor Karimov', role: 'Yangi binolar bo\'yicha mutaxassis', image: P('odam', 4), text: "Quruvchilar bilan to'g'ridan-to'g'ri." },
          { name: 'Zarina Ahmedova', role: 'Ijara bo\'limi boshlig\'i', image: P('odam', 1), text: "Xavfsiz ijara shartnomalari." },
          { name: 'Otabek Rustamov', role: 'Yurist', image: P('odam', 5), text: "Hujjatlar tozaligi uchun javob beradi." }] }),
        sec('nega', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Bitim *xavfsiz* o'tadi", text: "Yuristlarimiz obyekt hujjatlarini tekshiradi va notarial bitimni birga kuzatadi.", bullets: ["Hujjatlar tekshiruvi", "Notarial rasmiylashtirish", "Bank ipotekasi bo'yicha yordam"], image: P('rieltor', 6), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Sotuvchilar uchun *tez* natija", text: "Professional suratga olish, reklama va tayyor xaridorlar bazasi bilan obyektingizni o'rtacha 28 kunda sotamiz.", bullets: ["Bepul baholash", "Foto va video", "Xaridorlar bazasi"], image: P('rieltor', 2), buttonText: 'Obyektni baholash', buttonLink: '#aloqa' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *aytganidek*", text: '', layout: 'grid', items: [
          { text: "Uyimizni 3 haftada sotishdi, narx kutganimizdan yuqori chiqdi.", name: 'Gulnora Tursunova', role: 'Sotuvchi', image: P('odam', 3), stars: 5 },
          { text: "Hujjatlar bilan hech qanday muammo bo'lmadi. Hammasini yurist tekshirdi.", name: 'Bekzod Aliyev', role: 'Xaridor', image: P('odam', 2), stars: 5 },
          { text: "Ijaraga kvartirani bir kunda topib berishdi. Tavsiya qilaman.", name: 'Malika Normatova', role: 'Ijarachi', image: P('odam', 6), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Xizmat haqi qancha?", a: "Xaridor uchun xizmat bepul. Sotuvchi uchun bitim summasining 2% miqdorida." },
          { q: "Ipoteka bo'yicha yordam berasizmi?", a: "Ha, hamkor banklar bilan ariza berishda va hujjatlarni yig'ishda yordam beramiz." },
          { q: "Obyektni qanday baholaysiz?", a: "Bozor tahlili va shaxsiy ko'rik asosida bepul baholab beramiz." },
          { q: "Ko'rikka qachon borish mumkin?", a: "Ariza qoldirgan kunning o'zida yoki ertasi kuni, sizga qulay vaqtda." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: "Ko'rikka yozilish", title: "Uyingizni *birga* topamiz", text: "Qiziqtirgan obyekt yoki xohishingizni yozing: rieltor shu kuni bog'lanadi.", form: 'booking', serviceOptions: ['Sotib olish', 'Sotish', 'Ijaraga olish', 'Ijaraga berish', 'Obyektni baholash'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== YURIDIK FIRMA =================== */
  add({
    id: 'yurist', name: 'Yuridik firma', cat: 'Biznes', icon: 'shield', badge: '',
    tags: ['yurist', 'advokat', 'huquq', 'yuridik', 'maslahat', 'юрист', 'адвокат', 'law', 'lawyer', 'legal'],
    look: 'luxe',
    desc: "Yuridik firma va advokatlar uchun: amaliyot yo'nalishlari, jamoa va maslahatga yozilish.",
    build: () => ({
      v: 2, template: 'yurist',
      company: { name: 'Haqiqat & Hamkorlar', logo: 'H', tagline: "Huquqingiz himoyasida: biznes, oila va mulk bo'yicha yuridik xizmat." },
      theme: { preset: 'gold', accent: '', accent2: '', look: 'luxe', motion: true, font: 'editorial', radius: 'sharp', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'minimal', cta: 'Maslahat olish', ctaLink: '#aloqa', search: false },
      announce: ann("Birinchi konsultatsiya: 30 daqiqa bepul", '#aloqa'),
      orders: ord(),
      contacts: { phone: '+998 71 233 10 10', email: 'office@haqiqat-law.uz', address: "Toshkent, Shayxontohur tumani, Navoiy ko'chasi 5, 4-qavat", hours: 'Dush–Juma, 9:00 – 18:00', telegram: '@haqiqat_law', instagram: '@haqiqat.law' },
      footer: { text: 'Haqiqat & Hamkorlar. Maxfiylik kafolatlanadi.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: "Advokatlik birlashmasi · 2011 yildan", titleStart: "Huquqingiz *to'g'ri* qo'llarda", words: [], titleEnd: '', text: "Biznes, mulk, oila va jinoyat ishlari bo'yicha ishonchli himoya. Har bir mijoz uchun alohida strategiya va to'liq maxfiylik.", cta1Text: 'Maslahat olish', cta1Link: '#aloqa', cta2Text: "Yo'nalishlar", cta2Link: '#yonalish', visual: 'none', image: P('yurist', 6), trust: [{ value: '1 800+', label: 'yutilgan ish' }, { value: '14 yil', label: 'tajriba' }, { value: '96%', label: 'ijobiy natija' }] }),
        sec('lenta', 'marquee', { items: ['Korporativ huquq', 'Mulk nizolari', 'Oilaviy huquq', 'Shartnomalar', 'Soliq nizolari', 'Meros', 'Sud himoyasi'] }),
        sec('yonalish', 'services', { navLabel: "Yo'nalishlar", eyebrow: "Amaliyot yo'nalishlari", title: "Qaysi *masalada* yordam beramiz", text: '', items: [
          { title: 'Biznes va korporativ huquq', text: "Kompaniya ochish, shartnomalar, qo'shilish va yutib olish, intellektual mulk.", tags: ['3 000 000 so\'mdan'], image: P('yurist', 2), link: '#aloqa' },
          { title: 'Ko\'chmas mulk va qurilish', text: "Bitimlarni tekshirish, ro'yxatdan o'tkazish, mulk bo'yicha nizolar.", tags: ['2 000 000 so\'mdan'], image: P('yurist', 3), link: '#aloqa' },
          { title: 'Oilaviy huquq va meros', text: "Ajrim, aliment, mol-mulk bo'linishi, vasiyatnoma va meros ishlari.", tags: ['1 500 000 so\'mdan'], image: P('yurist', 4), link: '#aloqa' },
          { title: "Sud va arbitraj", text: "Fuqarolik, iqtisodiy va ma'muriy ishlarda sudda vakillik.", tags: ['5 000 000 so\'mdan'], image: P('yurist', 5), link: '#aloqa' },
          { title: 'Soliq va litsenziya', text: "Soliq tekshiruvlari, nizolar, litsenziya va ruxsatnomalar olish.", tags: ['2 500 000 so\'mdan'], image: P('startap', 3), link: '#aloqa' }] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Tamoyilimiz', text: "Biz *va'da* bermaymiz: biz ishni *tahlil qilamiz*, haqiqatni aytamiz va mijoz manfaatini oxirigacha himoya qilamiz.", author: 'Rustam Qodirov', role: 'Boshqaruvchi hamkor, advokat', image: P('odam', 2), buttonText: '', buttonLink: '#' }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 1800, suffix: '+', label: 'yutilgan ish' }, { value: 14, suffix: ' yil', label: 'amaliyot' }, { value: 12, suffix: '', label: 'advokat va yurist' }, { value: 96, suffix: '%', label: 'ijobiy natija' }] }),
        sec('jamoa', 'team', { navLabel: 'Jamoa', eyebrow: 'Jamoa', title: "Sizning *himoyachilaringiz*", text: '', items: [
          { name: 'Rustam Qodirov', role: 'Boshqaruvchi hamkor', image: P('odam', 2), text: "Biznes va korporativ huquq, 14 yillik tajriba." },
          { name: 'Nigora Ismoilova', role: 'Oilaviy huquq advokati', image: P('odam', 1), text: "Murakkab oilaviy nizolar va meros ishlari." },
          { name: 'Davron Hakimov', role: 'Sud ishlari advokati', image: P('odam', 5), text: "400+ ishda sudda vakillik." },
          { name: 'Feruza Saidova', role: 'Soliq yuristi', image: P('odam', 3), text: "Soliq nizolari va audit." }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Hamkorlik', title: "Ish *qanday* boshlanadi", text: '', layout: 'grid', items: [
          { title: 'Murojaat', text: "Vaziyatingizni qisqacha bayon qiling: 24 soat ichida javob beramiz." },
          { title: 'Konsultatsiya', text: "Hujjatlarni ko'rib chiqamiz va yo'l xaritasini taklif qilamiz." },
          { title: 'Shartnoma', text: "Narx va natija mezonlari oldindan, yozma ravishda." },
          { title: 'Himoya', text: "Ish yakuniga qadar muntazam hisobot beramiz." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *ishonchi*", text: '', layout: 'grid', items: [
          { text: "Shartnoma nizosini sudgacha olib bormay, muzokara orqali hal qilishdi.", name: 'Anvar Mirzayev', role: 'Savdo kompaniyasi direktori', image: P('odam', 4), stars: 5 },
          { text: "Meros ishida sabr bilan hamma narsani tushuntirishdi, natija bizning foydamizga.", name: 'Dilfuza Karimova', role: 'Mijoz', image: P('odam', 8), stars: 5 },
          { text: "Soliq nizosida jarimani to'liq bekor qildirishdi. Rahmat.", name: 'Sherzod Nazarov', role: 'Tadbirkor', image: P('odam', 7), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Birinchi konsultatsiya bepulmi?", a: "Ha, dastlabki 30 daqiqalik suhbat bepul va hech qanday majburiyat yo'q." },
          { q: "Ma'lumotlarim maxfiy saqlanadimi?", a: "Advokatlik sirri qonun bilan himoyalangan. Barcha hujjatlar qat'iy maxfiy saqlanadi." },
          { q: "Xizmat narxi qanday belgilanadi?", a: "Ish murakkabligiga qarab belgilangan summa yoki soatbay to'lov. Shartnomada oldindan kelishiladi." },
          { q: "Onlayn maslahat mumkinmi?", a: "Ha, Zoom, Telegram yoki telefon orqali masofadan ham maslahat beramiz." },
          { q: "Ishni yutishga kafolat berasizmi?", a: "Natijaga halol baho beramiz va kafolatsiz va'dalar bermaymiz, lekin barcha huquqiy vositalarni qo'llaymiz." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Konsultatsiya', title: "Muammoingizni *ishonib* aytishingiz mumkin", text: "Qisqacha yozing: advokatimiz 24 soat ichida bog'lanadi. Barcha ma'lumotlar maxfiy.", form: 'booking', serviceOptions: ['Biznes va korporativ', "Ko'chmas mulk", 'Oilaviy huquq va meros', 'Sud va arbitraj', 'Soliq va litsenziya', 'Boshqa masala'], askGuests: false, askAddress: false, payOptions: [], submitText: 'Konsultatsiyaga yozilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== YUK TASHISH VA LOGISTIKA =================== */
  add({
    id: 'logistika', name: 'Yuk tashish va logistika', cat: 'Biznes', icon: 'truck', badge: '',
    tags: ['logistika', 'yuk tashish', 'transport', 'fura', 'konteyner', 'логистика', 'грузоперевозки', 'logistics', 'cargo', 'freight'],
    look: 'cinema',
    desc: "Yuk tashish va logistika kompaniyasi: yo'nalishlar, raqamlar, jarayon va narx so'rovi.",
    build: () => ({
      v: 2, template: 'logistika',
      company: { name: 'SilkRoad Cargo', logo: 'S', tagline: "Yukingiz yo'lda: O'zbekistondan butun dunyoga." },
      theme: { preset: 'ocean', accent: '', accent2: '', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: "Narx so'rash", ctaLink: '#narx', search: false },
      announce: ann("Xitoy: Toshkent konteyner yo'nalishi har hafta", '#narx'),
      orders: ord(),
      contacts: { phone: '+998 71 207 55 66', email: 'cargo@silkroad.uz', address: "Toshkent viloyati, Qibray tumani, Logistika markazi", hours: 'Dush–Shan, 8:00 – 19:00', telegram: '@silkroad_cargo', instagram: '@silkroad.cargo' },
      footer: { text: 'SilkRoad Cargo. Vaqtida va butun yetkazamiz.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: "Xalqaro va mahalliy yuk tashish", titleStart: "Yukingiz *vaqtida* manzilga yetadi", words: [], titleEnd: '', text: "Avto, temir yo'l, dengiz va havo orqali yuk tashish. Bojxona rasmiylashtiruvi va real vaqtdagi kuzatuv bilan.", cta1Text: "Narx so'rash", cta1Link: '#narx', cta2Text: 'Xizmatlar', cta2Link: '#xizmat', visual: 'none', image: P('logistika', 1), trust: [{ value: '40+', label: 'davlat' }, { value: '99%', label: 'o\'z vaqtida' }, { value: '24/7', label: 'dispetcher' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 12000, suffix: '+', label: 'yetkazilgan yuk' }, { value: 40, suffix: '+', label: 'davlat yo\'nalishi' }, { value: 150, suffix: '+', label: 'transport vositasi' }, { value: 99, suffix: '%', label: 'o\'z vaqtida' }] }),
        sec('xizmat', 'bento', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: "Yukingiz uchun *to'liq* yechim", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Avtomobil tashish', text: "Fura va refrijeratorlar bilan O'zbekiston, MDH va Yevropaga.", value: '', icon: 'truck', image: P('logistika', 3), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'transport vositasi', text: '', value: '150+', icon: 'truck', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Dengiz va konteyner', text: "Xitoy, Turkiya va Hindistondan konteynerlar.", value: '', icon: 'globe', image: P('logistika', 2), link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Bojxona', text: "Hujjatlar va rasmiylashtirish bizdan.", value: '1 kun', icon: 'check', image: '', link: '#narx' },
          { kind: 'text', size: 'm', tall: false, title: 'Ombor va saqlash', text: "Toshkentda 12 000 m² zamonaviy ombor.", value: '', icon: 'package', image: '', link: '' }] }),
        sec('yonalish', 'showcase', { navLabel: "Yo'nalishlar", eyebrow: "Yo'nalishlar", title: "Eng *faol* yo'nalishlar", text: '', items: [
          { title: 'Xitoy: Toshkent', tag: '12–18 kun · avto/temir yo\'l', image: P('logistika', 4), link: '' },
          { title: 'Turkiya: Toshkent', tag: '7–10 kun · avto', image: P('logistika', 1), link: '' },
          { title: 'Rossiya: O\'zbekiston', tag: '5–7 kun · fura', image: P('logistika', 3), link: '' },
          { title: 'Yevropa: O\'zbekiston', tag: '10–14 kun', image: P('logistika', 5), link: '' },
          { title: 'Shahar ichida', tag: 'Shu kuni', image: P('logistika', 6), link: '' }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: "Yuk qanday *yetkaziladi*", text: '', layout: 'stack', items: [
          { title: 'Ariza va hisob-kitob', text: "Yuk, yo'nalish va muddatni aytasiz: 1 soatda narx taklif qilamiz." },
          { title: 'Hujjat va yuklash', text: "Shartnoma, bojxona hujjatlari va yukni qadoqlab yuklaymiz." },
          { title: "Yo'lda kuzatuv", text: "GPS orqali yukning joylashuvini real vaqtda ko'rasiz." },
          { title: 'Yetkazish va topshirish', text: "Yuk qabul qilinadi, hujjatlar va akt topshiriladi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: "Mijozlar *fikri*", text: '', layout: 'wall', items: [
          { text: "Xitoydan konteyner aytilgan kunning o'zida keldi. Hujjatlar hammasi tartibda.", name: 'Javlon Rahimov', role: "Import kompaniyasi egasi", image: P('odam', 5), stars: 5 },
          { text: "Real vaqtdagi kuzatuv juda qulay, mijozlarimga aniq vaqt aytaman.", name: 'Sevara Ibragimova', role: "Savdo menejeri", image: P('odam', 3), stars: 5 },
          { text: "Sovutgichli furalar bilan mevalarni Rossiyaga muammosiz yetkazdilar.", name: 'Bahodir Xudoyberdiev', role: "Eksportchi", image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Narx qanday hisoblanadi?", a: "Yuk hajmi, og'irligi, yo'nalish va tezlikka qarab. So'rovdan keyin 1 soatda aniq narx beramiz." },
          { q: "Yuk sug'urtalanadimi?", a: "Ha, yukni to'liq qiymatida sug'urtalash imkoniyati mavjud." },
          { q: "Bojxona rasmiylashtiruvini qilasizmi?", a: "Ha, hujjatlar tayyorlash va bojxona ruxsatini to'liq o'z zimmamizga olamiz." },
          { q: "Kichik yuklarni ham tashiysizmi?", a: "Ha, 50 kg dan boshlab yig'ma yuklar xizmati mavjud." }] }),
        sec('chaqiriq', 'cta', { fx: true, eyebrow: 'Yukingiz tayyormi?', title: "Birinchi yetkazishda *10% chegirma*", text: "Yangi mijozlarimiz uchun maxsus taklif.", buttonText: "Narx so'rash", buttonLink: '#narx', countdownTo: '', image: '' }),
        sec('narx', 'contact', { navLabel: 'Narx', eyebrow: "Narx so'rovi", title: "Yuk uchun *aniq* narx oling", text: "Qayerdan qayerga va nima tashish kerakligini yozing: dispetcher 1 soat ichida javob beradi.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: "Narx so'rash", mapUrl: '' }),
      ],
    }),
  });
})();
