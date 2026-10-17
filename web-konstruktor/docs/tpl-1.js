'use strict';
// Namunaviy shablonlar (sifat me'yori): restoran, IT kompaniya.
(function () {
  const { add, sec, P } = window.TplKit;

  /* =================== RESTORAN / KAFE (hashamatli, kinematik) =================== */
  add({
    id: 'restoran', name: 'Restoran / kafe', cat: 'Xizmat', icon: 'utensils', badge: 'Yangi',
    tags: ['restoran', 'kafe', 'taom', 'oshxona', 'menyu', 'bron', 'stol', 'ресторан', 'кафе', 'restaurant', 'food'],
    look: 'luxe',
    desc: "Restoran va kafe uchun: to'liq ekranli foto, menyu, galereya va stol bron qilish.",
    build: () => ({
      v: 2, template: 'restoran',
      company: { name: 'Dasturxon', logo: 'D', tagline: "Milliy va yevropa oshxonasi. Har bir taom, bir hikoya." },
      theme: { preset: 'gold', accent: '', accent2: '', look: 'luxe', motion: true, font: 'luxe', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Stol band qilish', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Dam olish kunlari oilaviy brunch: 10:00 – 14:00", link: '#bron' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 71 233 44 55', email: 'bron@dasturxon.uz', address: "Toshkent, Yunusobod tumani, Amir Temur ko'chasi 108", hours: 'Har kuni 11:00 – 23:00', telegram: '@dasturxon_uz', instagram: '@dasturxon.uz' },
      footer: { text: 'Mazali va samimiy muhit.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: 'Har kuni 11:00 dan 23:00 gacha', titleStart: 'Mazali *lahzalar* shu yerda boshlanadi', words: [], titleEnd: '', text: "An'anaviy retseptlar, zamonaviy yondashuv. Oila, do'stlar va bayramlar uchun eng yaxshi dasturxon.", cta1Text: 'Stol band qilish', cta1Link: '#bron', cta2Text: "Menyuni ko'rish", cta2Link: '#menyu', visual: 'none', image: P('restoran', 1), trust: [{ value: '4.9', label: 'mehmonlar bahosi' }, { value: '12 yil', label: 'tajriba' }, { value: '180+', label: "o'rin" }] }),
        sec('lenta', 'marquee', { items: ['Milliy taomlar', "Yevropa oshxonasi", 'Maxsus tadbirlar', 'Bayram stollari', 'Brunch'] }),
        sec('bizhaqimizda', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Hikoyamiz', text: "Biz taomni shunchaki tayyorlamaymiz, uni *his qilamiz*. Har bir retsept bobolarimizdan, har bir mehmon esa *oilamizdan* biri.", author: 'Alisher Karimov', role: 'Bosh oshpaz va asoschi', image: P('odam', 1), buttonText: '', buttonLink: '#' }),
        sec('afzallik', 'bento', { eyebrow: 'Nima uchun biz', title: 'Har bir tafsilot *e\'tibor*ga loyiq', text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Yangi mahsulotlar', text: "Har kuni ertalab fermerlardan to'g'ridan-to'g'ri.", value: '', icon: 'leaf', image: P('restoran', 2), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'taom menyuda', text: '', value: '120+', icon: 'star', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Ochiq oshxona', text: "Oshpazlar ishini stolingizdan turib kuzating.", value: '', icon: 'eye', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Tug\'ilgan kun sovg\'asi', text: 'Bayram stoliga desert va sham bepul.', value: '0 so\'m', icon: 'gift', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Maxsus zallar', text: "20 kishidan 150 kishigacha.", value: '', icon: 'users', image: P('restoran', 3), link: '' }] }),
        sec('menyu', 'menu', { navLabel: 'Menyu', eyebrow: 'Menyu', title: 'Tanlangan *taomlar*', text: 'Mavsumiy mahsulotlardan tayyorlangan eng sevimli taomlarimiz.', mode: 'none', items: [
          { id: 'osh', name: "Bayramona osh", price: 78000, category: 'Issiq taomlar', tag: 'Hit', description: "Devzira guruch, qo'zi go'shti, sarimsoq va bedana tuxumi.", image: P('restoran', 4), active: true },
          { id: 'lagmon', name: "Qo'lda cho'zilgan lag'mon", price: 59000, category: 'Issiq taomlar', tag: '', description: "Uy sharoitida tayyorlangan xamir, mol go'shti va yangi sabzavotlar.", image: P('restoran', 5), active: true },
          { id: 'steyk', name: 'Ribay steyk', price: 189000, category: 'Issiq taomlar', tag: 'Shef tavsiyasi', description: "Marmar mol go'shti, qovurilgan sabzavotlar va qora murch sousi.", image: P('restoran', 6), active: true },
          { id: 'sezar', name: 'Sezar salati', price: 52000, category: 'Salatlar', tag: '', description: "Tovuq filesi, parmezan, krutonlar va uy sousi.", image: P('fastfood', 1), active: true },
          { id: 'yunon', name: 'Yunon salati', price: 46000, category: 'Salatlar', tag: '', description: "Pomidor, bodring, feta pishlog'i va zaytun.", image: P('organik', 1), active: true },
          { id: 'chizkeyk', name: "Chizkeyk Nyu-York", price: 42000, category: 'Shirinliklar', tag: '', description: "Qaymoqli pishloq, qulupnay mussi va pechenye asosi.", image: P('qandolat', 1), active: true },
          { id: 'medovik', name: 'Medovik', price: 36000, category: 'Shirinliklar', tag: '', description: "Asalli qatlamlar va yengil smetana kremi.", image: P('qandolat', 2), active: true }] }),
        sec('jarayon', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Oshxona *ko'z oldingizda*", text: "Ochiq oshxona va tandirda pishgan non: ishtaha avval ko'zdan boshlanadi.", bullets: ["Tandirda yangi non", "Shef bilan tanishuv", "Mavsumiy maxsus menyu"], image: P('restoran', 2), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Tadbirlar uchun *mukammal* joy", text: "To'y, yubiley, korporativ kechalar: menyu, bezak va xizmatni biz tashkil qilamiz.", bullets: ["150 kishigacha zal", "Individual menyu", "Bezak va musiqa"], image: P('toy', 1), buttonText: "Tadbir uchun so'rov", buttonLink: '#bron' }] }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: 'Muhit va *taomlar*', text: '', layout: 'masonry', items: [
          { image: P('restoran', 1), caption: '' }, { image: P('restoran', 3), caption: '' }, { image: P('kafe', 1), caption: '' }, { image: P('restoran', 5), caption: '' }, { image: P('qandolat', 3), caption: '' }, { image: P('restoran', 6), caption: '' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mehmonlar *aytganidek*', text: '', layout: 'wall', items: [
          { text: "Osh bolaligimdagi ta'mni esladi. Xizmat ham a'lo darajada.", name: 'Dilnoza Rahimova', role: 'Mehmon', image: P('odam', 2), stars: 5 },
          { text: "Tug'ilgan kunni shu yerda nishonladik. Hammasi mukammal tashkil qilingan edi.", name: 'Jasur Tursunov', role: 'Mehmon', image: P('odam', 3), stars: 5 },
          { text: "Steyk Toshkentdagi eng yaxshilaridan biri. Albatta yana kelamiz.", name: 'Sardor Aliyev', role: 'Mehmon', image: P('odam', 4), stars: 5 },
          { text: "Ichki muhit juda shinam, bolalar uchun alohida burchak ham bor.", name: 'Madina Qodirova', role: 'Mehmon', image: P('odam', 5), stars: 5 },
          { text: "Korporativ kechamizni shu yerda o'tkazdik, jamoa hayratda.", name: 'Bobur Yusupov', role: 'Mehmon', image: P('odam', 6), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Stolni oldindan band qilish shartmi?", a: "Dam olish kunlari va bayram oldidan band qilishni tavsiya etamiz. Hafta ichida ko'pincha bo'sh joy bo'ladi." },
          { q: "Bolalar uchun menyu bormi?", a: "Ha, bolalar menyusi va alohida o'yin burchagi mavjud." },
          { q: "Tadbirlar uchun zal narxi qancha?", a: "Narx mehmonlar soni va menyuga bog'liq. Arizani qoldiring, menejer hisoblab beradi." },
          { q: "Yetkazib berish xizmati bormi?", a: "Ha, shahar bo'ylab 45 daqiqada yetkazamiz. Buyurtma uchun telefon orqali bog'laning." }] }),
        sec('tadbir', 'cta', { fx: true, eyebrow: 'Maxsus tadbir', title: "Bayramingiz *biz bilan* unutilmas bo'ladi", text: "To'y, yubiley yoki korporativ kecha uchun individual taklif tayyorlaymiz.", buttonText: "Taklif so'rash", buttonLink: '#bron', countdownTo: '', image: '' }),
        sec('manzil', 'map', { navLabel: 'Manzil', eyebrow: 'Manzil', title: 'Bizni *toping*', text: '', query: "Toshkent, Yunusobod tumani, Amir Temur ko'chasi 108", zoom: 15 }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Stol band qilish', title: 'Joyingizni *oldindan* band qiling', text: "Sana va vaqtni tanlang, tasdiqlash uchun menejerimiz qo'ng'iroq qiladi.", form: 'booking', serviceOptions: ['Oddiy stol', 'Oilaviy stol', 'Tadbir / banket', 'VIP xona'], askGuests: true, askAddress: false, payOptions: [], submitText: 'Band qilish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== IT KOMPANIYA / AGENTLIK (kinematik, qorong'i) =================== */
  add({
    id: 'kompaniya', name: 'IT kompaniya / agentlik', cat: 'Biznes', icon: 'code', badge: 'Ommabop',
    tags: ['it', 'kompaniya', 'agentlik', 'studiya', 'startap', 'dasturlash', 'veb', 'company', 'agency', 'startup', 'компания', 'студия'],
    look: 'cinema',
    desc: "Kompaniya, agentlik va startaplar uchun: nurli animatsion fon, xizmatlar, ishlar va anketa.",
    build: () => ({
      v: 2, template: 'kompaniya',
      company: { name: 'Nexora', logo: 'N', tagline: "Raqamli mahsulotlarni g'oyadan ishga tushirishgacha yaratamiz." },
      theme: { preset: 'dark', accent: '', accent2: '', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Loyihani boshlash', ctaLink: '#aloqa', search: false },
      announce: { enabled: false, text: '', link: '' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 90 123 45 67', email: 'hello@nexora.uz', address: "Toshkent, Mirzo Ulug'bek tumani, IT Park", hours: 'Dush–Juma, 9:00–18:00', telegram: '@nexora_uz', instagram: '@nexora.uz' },
      footer: { text: 'Barcha huquqlar himoyalangan.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'aurora', fx: 'aurora', badge: "Yangi loyihalar uchun ochiqmiz", titleStart: "Biznesingiz uchun *kelajak* mahsulotlari", words: [], titleEnd: '', text: "Veb-sayt, mobil ilova va avtomatlashtirish: strategiya, dizayn va kodni bir jamoada, kafolat bilan.", cta1Text: 'Loyihani boshlash', cta1Link: '#aloqa', cta2Text: 'Ishlarimiz', cta2Link: '#ishlar', visual: 'none', image: P('dasturchi', 1), trust: [{ value: '120+', label: 'loyiha' }, { value: '8 yil', label: 'tajriba' }, { value: '4.9/5', label: 'mijoz bahosi' }] }),
        sec('texno', 'marquee', { items: ['React', 'Node.js', 'Flutter', 'Telegram bot', 'Payme', 'Click', 'Figma', 'Python'] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Biz haqimizda', text: "Biz oddiy *saytlar* emas, mijozlaringizni egaga aylantiradigan *raqamli tajriba* yaratamiz. Har bir piksel va har bir harakat sizning biznesingiz uchun ishlaydi.", author: '', role: '', image: '', buttonText: '', buttonLink: '#' }),
        sec('xizmat', 'services', { navLabel: 'Xizmatlar', eyebrow: 'Xizmatlar', title: 'Biz *nima* qilamiz', text: '', items: [
          { title: 'Veb-saytlar', text: "Vizitka, korporativ sayt va landing sahifalar: tez, chiroyli va qidiruvga tayyor.", tags: ['Dizayn', 'Kod', 'SEO'], image: P('dasturchi', 2), link: '#aloqa' },
          { title: "Onlayn do'konlar", text: "Katalog, savat, to'lov tizimlari, ombor va qulay admin panel.", tags: ['Payme', 'Click', 'Admin'], image: P('elektronika', 1), link: '#aloqa' },
          { title: 'Telegram botlar', text: "Buyurtma, bron va to'lovlarni avtomatlashtiring, mijozlar bilan 24/7 muloqot.", tags: ['Bot', 'CRM'], image: P('ilova', 1), link: '#aloqa' },
          { title: 'Mobil ilovalar', text: "iOS va Android uchun zamonaviy, tez va qulay ilovalar.", tags: ['Flutter', 'iOS', 'Android'], image: P('ilova', 2), link: '#aloqa' },
          { title: 'UI/UX dizayn', text: "Foydalanuvchi sevadigan interfeys, prototip va dizayn tizimi.", tags: ['Figma', 'Brend'], image: P('dizayner', 1), link: '#aloqa' }] }),
        sec('ishlar', 'showcase', { navLabel: 'Ishlar', eyebrow: 'Portfolio', title: 'Tanlangan *ishlar*', text: "Oxirgi loyihalarimizdan namunalar.", items: [
          { title: 'Baraka Market', tag: "Onlayn do'kon", image: P('market', 1), link: '' }, { title: 'Oltin Non', tag: 'Telegram bot', image: P('qandolat', 1), link: '' }, { title: 'FitZone', tag: 'Mobil ilova', image: P('fitness', 1), link: '' }, { title: 'Sifat Auto', tag: 'Korporativ sayt', image: P('avtoservis', 1), link: '' }, { title: 'Nur Clinic', tag: 'Bron tizimi', image: P('klinika', 1), link: '' }] }),
        sec('raqam', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 120, suffix: '+', label: 'bajarilgan loyiha' }, { value: 8, suffix: ' yil', label: 'bozorda' }, { value: 45, suffix: '+', label: 'jamoa a\'zosi' }, { value: 98, suffix: '%', label: 'mamnun mijoz' }] }),
        sec('jarayon', 'process', { navLabel: 'Jarayon', eyebrow: 'Jarayon', title: 'Qanday *ishlaymiz*', text: '', layout: 'stack', items: [
          { title: 'Tahlil va maqsad', text: "Biznesingiz, auditoriya va raqobatchilarni o'rganib, aniq reja tuzamiz." },
          { title: 'Dizayn va prototip', text: "Kod yozishdan oldin ko'rinish va foydalanuvchi yo'lini tasdiqlaymiz." },
          { title: 'Ishlab chiqish', text: "Tez, xavfsiz va kengayadigan kod. Har hafta natijani ko'rsatamiz." },
          { title: "Ishga tushirish va yordam", text: "Testdan o'tkazib, joylaymiz va keyin ham yonida bo'lamiz." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlar *nima* deydi', text: '', layout: 'wall', items: [
          { text: "Do'konimiz savdosi uch oyda 2.4 barobar oshdi. Jamoa juda professional.", name: 'Aziz Karimov', role: 'Baraka Market, direktor', image: P('odam', 1), stars: 5 },
          { text: "Telegram bot buyurtmalarni o'zi qabul qiladi, menejerlar yukdan qutuldi.", name: 'Dilnoza Rahimova', role: 'Oltin Non, asoschi', image: P('odam', 2), stars: 5 },
          { text: "Muddatga aniq amal qilishdi, har bosqichda aloqada bo'lishdi.", name: 'Jasur Tursunov', role: 'FitZone, hammuassis', image: P('odam', 3), stars: 5 },
          { text: "Dizayn bizni raqobatchilardan ajratib turadi. Mijozlar maqtashmoqda.", name: 'Madina Qodirova', role: 'Nur Clinic, marketing', image: P('odam', 4), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Loyiha qancha vaqtda tayyor bo'ladi?", a: "Vizitka sayt 1–2 hafta, onlayn do'kon 3–5 hafta, mobil ilova 2–3 oy. Aniq muddat suhbatdan keyin shartnomada belgilanadi." },
          { q: "Narx qanday hisoblanadi?", a: "Loyiha hajmiga qarab. Anketani to'ldirsangiz, 1 kun ichida aniq narx va muddat bilan taklif yuboramiz." },
          { q: "Tayyor saytga kafolat berasizmi?", a: "Ha, 6 oy bepul texnik yordam va xatolarni tuzatish kafolati beramiz." },
          { q: "Mavjud saytni yangilab bera olasizmi?", a: "Albatta: dizaynni yangilash, tezlashtirish va yangi funksiyalar qo'shish ham qilamiz." }] }),
        sec('chaqiriq', 'cta', { fx: true, eyebrow: 'Boshlaymizmi?', title: "G'oyangizni *birga* ishga tushiramiz", text: "Bepul maslahat oling: 15 daqiqada javob beramiz.", buttonText: 'Loyihani boshlash', buttonLink: '#aloqa', countdownTo: '', image: '' }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Aloqa', title: "Loyihangiz haqida *gapirib bering*", text: "Raqamingizni qoldiring, mutaxassisimiz 15 daqiqada aloqaga chiqadi.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });
})();
