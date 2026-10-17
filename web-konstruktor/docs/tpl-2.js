'use strict';
// Savdo va xizmat shablonlari: market, elektronika, kiyim, gul, mebel, kafe, fastfood.
(function () {
  const { add, sec, P } = window.TplKit;
  const pr = (id, name, price, oldPrice, category, badge, description, image) => ({ id, name, price, oldPrice, category, badge, description, image, stock: '', active: true });
  const mi = (id, name, price, category, tag, description, image) => ({ id, name, price, category, tag, description, image, active: true });

  /* =================== ONLAYN MARKET =================== */
  add({
    id: 'market', name: 'Onlayn market', cat: 'Savdo', icon: 'cart', badge: 'Eng ommabop',
    tags: ['market', "do'kon", 'oziq-ovqat', 'meva', 'sabzavot', 'savat', 'магазин', 'продукты', 'grocery', 'shop', 'supermarket'],
    look: 'cinema',
    desc: "Oziq-ovqat va uy-ro'zg'or do'koni: kategoriyalar, qidiruv, savat va tez yetkazib berish.",
    build: () => ({
      v: 2, template: 'market',
      company: { name: 'Baraka Market', logo: 'B', tagline: "Yangi, arzon va eshigingizgacha. Har kuni fermerdan to'g'ridan-to'g'ri." },
      theme: { preset: 'fresh', accent: '', accent2: '', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Buyurtma berish', ctaLink: '#buyurtma', search: true },
      announce: { enabled: true, text: "300 000 so'mdan ortiq buyurtmaga yetkazib berish bepul", link: '#katalog' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 300000, deliveryFee: 15000 },
      contacts: { phone: '+998 71 200 11 22', email: 'buyurtma@baraka-market.uz', address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 24", hours: 'Har kuni 8:00 – 23:00', telegram: '@baraka_market', instagram: '@baraka.market' },
      footer: { text: 'Yangi mahsulotlar, halol narxlar.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: 'Bugun ertalab terilgan', titleStart: "Eng *yangi* mahsulotlar eshigingizda", words: [], titleEnd: '', text: "Meva, sabzavot va kundalik mahsulotlar: 2 soat ichida yetkazamiz. Narxlar bozor narxida, sifat kafolatlangan.", cta1Text: 'Xarid qilish', cta1Link: '#katalog', cta2Text: 'Kategoriyalar', cta2Link: '#kategoriya', visual: 'none', image: P('market', 2), image2: P('market', 5), spinText: 'yangi · mazali · arzon · ', chips: ['2 soatda yetkazish', "100% yangi", "Bepul yetkazish"], trust: [{ value: '5000+', label: 'mahsulot' }, { value: '2 soat', label: 'yetkazish' }, { value: '4.9', label: 'mijoz bahosi' }] }),
        sec('lenta', 'marquee', { items: ['Yangi mevalar', 'Fermer sabzavotlari', 'Bepul yetkazish', 'Halol narx', "Organik mahsulotlar", 'Har kuni 8:00 – 23:00'] }),
        sec('kategoriya', 'categories', { navLabel: 'Kategoriyalar', eyebrow: 'Bo\'limlar', title: 'Nima *kerak* bo\'lsa, shu yerda', text: '', items: [
          { name: 'Mevalar', image: P('market', 4) }, { name: 'Sabzavotlar', image: P('market', 3) }, { name: 'Rezavorlar', image: P('market', 6) }, { name: 'Fermer mahsuloti', image: P('organik', 3) }] }),
        sec('katalog', 'products', { navLabel: 'Katalog', eyebrow: 'Katalog', title: "Bugungi *tanlov*", text: "Savatga qo'shing va buyurtmani rasmiylashtiring. Narx 1 kg uchun.", mode: 'cart', buttonText: "Savatga", columns: '4', search: true, filters: true, sort: true, items: [
          pr('banan', 'Ekvador banani', 24900, 28900, 'Mevalar', 'Chegirma', "Pishgan, shirin, 1 kg.", P('market', 1)),
          pr('olma', "Qizil olma (Semerenko)", 18900, 0, 'Mevalar', 'Hit', "Qirsillagan, mo'l sharbatli, 1 kg.", P('organik', 5)),
          pr('apelsin', 'Apelsin (Misr)', 22900, 26000, 'Mevalar', '', "Yupqa po'stli, vitaminga boy, 1 kg.", P('organik', 6)),
          pr('qalampir', "Achchiq qalampir", 14900, 0, 'Sabzavotlar', '', "Yangi uzilgan, 500 g.", P('market', 3)),
          pr('makkajoxori', "Shirin makkajo'xori", 9900, 0, 'Sabzavotlar', 'Yangi', "Qaynatishga tayyor, 3 dona.", P('organik', 4)),
          pr('qulupnay', "Qulupnay va rezavorlar", 49900, 59900, 'Rezavorlar', 'Chegirma', "Mavsumiy rezavor aralashmasi, 500 g.", P('market', 6)),
          pr('meva-savat', "Oilaviy meva savati", 129000, 149000, 'Mevalar', 'Tavsiya', "6 xil mavsumiy meva, taxminan 5 kg.", P('market', 4)),
          pr('fermer-sabzavot', "Fermer sabzavot to'plami", 79000, 0, 'Fermer mahsuloti', '', "Pomidor, bodring, piyoz, sabzi, 4 kg.", P('organik', 2))] }),
        sec('stat', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 5000, suffix: '+', label: 'turdagi mahsulot' }, { value: 120, suffix: '+', label: 'fermer hamkor' }, { value: 45, suffix: ' daq', label: "o'rtacha yetkazish" }, { value: 98, suffix: '%', label: 'mamnun mijoz' }] }),
        sec('afzallik', 'bento', { navLabel: 'Afzalliklar', eyebrow: 'Nega Baraka', title: "Do'konga bormasdan, *sifatni* tanlang", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Fermerdan to\'g\'ridan-to\'g\'ri', text: "Vositachisiz: mahsulot bugun terilib, bugun sizda.", value: '', icon: 'leaf', image: P('organik', 1), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'daqiqada yetkazamiz', text: '', value: '45', icon: 'truck', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Qaytarish kafolati', text: "Mahsulot yoqmasa, pulini qaytaramiz.", value: '', icon: 'shield', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Bepul yetkazish', text: "300 000 so'mdan ortiq buyurtmaga.", value: '0 so\'m', icon: 'gift', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Eng yangi mahsulot', text: "Har ertalab yangilanadi.", value: '', icon: 'star', image: P('organik', 2), link: '' }] }),
        sec('qadam', 'process', { navLabel: '', eyebrow: 'Qanday ishlaydi', title: "Buyurtma *3 qadamda*", text: '', layout: 'grid', items: [
          { title: 'Tanlang', text: "Katalogdan kerakli mahsulotlarni savatga soling." },
          { title: 'Buyurtma bering', text: "Manzil va to'lov usulini ko'rsating, 1 daqiqa kifoya." },
          { title: 'Qabul qiling', text: "Kuryer 2 soat ichida eshigingizgacha olib keladi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Xaridorlar *aytishicha*', text: '', layout: 'grid', items: [
          { text: "Mevalar bozordagidan yangi. Kuryer 40 daqiqada keltirdi.", name: 'Gulnora Sattorova', role: 'Doimiy xaridor', image: P('odam', 1), stars: 5 },
          { text: "Narxlar qulay, savat juda sodda. Haftalik xaridni shu yerdan qilaman.", name: 'Rustam Nazarov', role: 'Xaridor', image: P('odam', 2), stars: 5 },
          { text: "Fermer sabzavot to'plami zo'r! Oilamiz juda mamnun.", name: 'Malika Yusupova', role: 'Xaridor', image: P('odam', 8), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Yetkazib berish qancha turadi?", a: "Buyurtma 300 000 so'mdan oshsa bepul, aks holda 15 000 so'm. Shahar bo'ylab o'rtacha 45 daqiqa." },
          { q: "Qanday to'lov usullari bor?", a: "Naqd pul, Payme, Click va karta orqali to'lash mumkin." },
          { q: "Mahsulot sifatsiz chiqsa nima qilaman?", a: "Kuryer oldida ko'rib chiqing. Keyin ham aniqlansa, almashtirib beramiz yoki pulni qaytaramiz." },
          { q: "Ish vaqtingiz qanday?", a: "Har kuni 8:00 dan 23:00 gacha, bayram kunlari ham ishlaymiz." },
          { q: "Ulgurji xarid qilsa bo'ladimi?", a: "Ha, restoran va do'konlar uchun ulgurji narxlar bor. Qo'ng'iroq qiling." }] }),
        sec('aksiya', 'cta', { fx: true, eyebrow: 'Hafta aksiyasi', title: "Birinchi buyurtmaga *-15%* chegirma", text: "Promokod: BARAKA15. Savatga qo'shib, yetkazib berishni bepul oling.", buttonText: 'Xarid qilish', buttonLink: '#katalog', countdownTo: '2026-12-31T23:59:00', image: '' }),
        sec('buyurtma', 'contact', { navLabel: 'Aloqa', eyebrow: 'Buyurtma', title: "Buyurtma *bering*", text: "Ma'lumotlaringizni qoldiring, operator 5 daqiqada tasdiqlash uchun qo'ng'iroq qiladi.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Payme', 'Click', 'Karta orqali'], submitText: 'Buyurtmani yuborish', mapUrl: '' }),
      ],
    }),
  });

  /* =================== ELEKTRONIKA DO'KONI (qorong'i, texno) =================== */
  add({
    id: 'elektronika', name: "Elektronika do'koni", cat: 'Savdo', icon: 'zap', badge: '',
    tags: ['elektronika', 'telefon', 'noutbuk', 'gadjet', 'texnika', 'электроника', 'смартфон', 'electronics', 'gadgets', 'laptop'],
    look: 'cinema',
    desc: "Telefon, noutbuk va gadjetlar do'koni: aurora hero, chegirmalar, taymer va savat.",
    build: () => ({
      v: 2, template: 'elektronika',
      company: { name: 'Texnomart Pro', logo: 'T', tagline: "Original texnika, rasmiy kafolat, muddatli to'lov." },
      theme: { preset: 'dark', accent: '#3b82f6', accent2: '#22d3ee', look: 'cinema', motion: true, font: 'wide', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Katalogga', ctaLink: '#katalog', search: true },
      announce: { enabled: true, text: "Muddatli to'lov 0%: 12 oygacha, birinchi to'lovsiz", link: '#aksiya' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 2000000, deliveryFee: 30000 },
      contacts: { phone: '+998 78 150 77 00', email: 'savdo@texnomart-pro.uz', address: "Toshkent, Shayxontohur tumani, Navoiy ko'chasi 45", hours: 'Har kuni 9:00 – 21:00', telegram: '@texnomart_pro', instagram: '@texnomart.pro' },
      footer: { text: 'Rasmiy kafolat. Original mahsulotlar.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'aurora', fx: 'aurora', badge: "Yangi avlod texnikasi keldi", titleStart: "Texnika, *kelajak* qo'lingizda", words: [], titleEnd: '', text: "Smartfon, noutbuk va aksessuarlar: 100% original, 12 oygacha muddatli to'lov va shu kuni yetkazish.", cta1Text: 'Katalogni ochish', cta1Link: '#katalog', cta2Text: 'Chegirmalar', cta2Link: '#aksiya', visual: 'none', image: P('elektronika', 1), trust: [{ value: '10 000+', label: 'mahsulot' }, { value: '2 yil', label: 'kafolat' }, { value: '0%', label: "muddatli to'lov" }] }),
        sec('brend', 'logos', { title: 'Rasmiy distribyutor', items: [{ name: 'Apple', image: '' }, { name: 'Samsung', image: '' }, { name: 'Xiaomi', image: '' }, { name: 'Lenovo', image: '' }, { name: 'ASUS', image: '' }, { name: 'Sony', image: '' }, { name: 'JBL', image: '' }] }),
        sec('katalog', 'products', { navLabel: 'Katalog', eyebrow: 'Katalog', title: "Eng *ommabop* qurilmalar", text: "Narxlar so'mda, barcha mahsulotlarga rasmiy kafolat beriladi.", mode: 'cart', buttonText: 'Savatga', columns: '4', search: true, filters: true, sort: true, items: [
          pr('tel-pro', 'Smartfon Nova X Pro 256 GB', 8990000, 10490000, 'Smartfonlar', '-14%', "6,7\" AMOLED, 50 MP kamera, 5000 mAh.", P('elektronika', 4)),
          pr('noutbuk', 'Noutbuk Zenbook 14 OLED', 12900000, 14500000, 'Noutbuklar', 'Hit', "Core Ultra 7, 16 GB RAM, 512 GB SSD.", P('elektronika', 2)),
          pr('planshet', 'Planshet Tab S9 FE', 5490000, 6200000, 'Planshetlar', '', "10,9\" ekran, S Pen qalam bilan.", P('elektronika', 6)),
          pr('quloqchin', 'Simsiz quloqchin AirBuds 3', 1190000, 1490000, 'Aksessuarlar', '-20%', "Shovqinni yo'qotish, 30 soat ish vaqti.", P('elektronika', 5)),
          pr('gaming', 'Gaming noutbuk Predator 16', 18900000, 0, 'Noutbuklar', 'Yangi', "RTX 4060, 165 Hz ekran, 32 GB RAM.", P('dasturchi', 2)),
          pr('tel-lite', 'Smartfon Nova Lite 128 GB', 2790000, 3190000, 'Smartfonlar', '', "Kundalik foydalanish uchun ideal.", P('ilova', 3)),
          pr('soat', 'Aqlli soat Fit Watch 5', 1590000, 1890000, 'Aksessuarlar', '', "Yurak urishi, uyqu va GPS.", P('ilova', 5)),
          pr('ultrabook', 'Ultrabook AirBook 13', 9990000, 0, 'Noutbuklar', '', "M-chip, 18 soatgacha ishlaydi.", P('elektronika', 3))] }),
        sec('aksiya', 'cta', { fx: true, eyebrow: 'Qora juma erta keldi', title: "Hamma texnikaga *-25%* gacha", text: "Aksiya tugashiga oz qoldi. Muddatli to'lov 0% bilan birga.", buttonText: 'Aksiyani ko\'rish', buttonLink: '#katalog', countdownTo: '2026-11-27T23:59:00', image: '' }),
        sec('afzallik', 'bento', { navLabel: 'Afzalliklar', eyebrow: 'Nega biz', title: "Texnikani *ishonch* bilan oling", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Rasmiy kafolat', text: "2 yilgacha servis va almashtirish.", value: '', icon: 'shield', image: P('elektronika', 3), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'oygacha muddatli to\'lov', text: '', value: '12', icon: 'card', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Trade-in', text: "Eski qurilmangizni topshiring, yangisiga chegirma oling.", value: '', icon: 'refresh', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Shu kuni yetkazish', text: "Toshkent bo'ylab 3 soat ichida.", value: '3 soat', icon: 'truck', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Bepul sozlash', text: "Ma'lumotlarni ko'chirib beramiz.", value: '', icon: 'settings', image: P('dasturchi', 3), link: '' }] }),
        sec('stat', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 10000, suffix: '+', label: 'mahsulot omborda' }, { value: 50, suffix: 'K+', label: 'mamnun xaridor' }, { value: 12, suffix: ' filial', label: "O'zbekiston bo'ylab" }, { value: 2, suffix: ' yil', label: 'rasmiy kafolat' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Xaridorlar *fikri*', text: '', layout: 'wall', items: [
          { text: "Noutbukni ertasi kuni olib kelishdi, hammasi sozlab berilgan edi.", name: 'Sherzod Abdullayev', role: 'Dasturchi', image: P('odam', 5), stars: 5 },
          { text: "Muddatli to'lov bir kunda rasmiylashdi. Hech qanday yashirin foiz yo'q.", name: 'Nilufar Ergasheva', role: 'Dizayner', image: P('odam', 6), stars: 5 },
          { text: "Narxlar boshqa joydan arzon, kafolat esa haqiqiy.", name: 'Akmal Rahmonov', role: 'Tadbirkor', image: P('odam', 4), stars: 5 },
          { text: "Eski telefonimni trade-in qilib, yangisini yarim narxda oldim.", name: 'Zarina Hasanova', role: 'Marketolog', image: P('odam', 3), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Mahsulotlar original va kafolatlimi?", a: "Ha, barcha mahsulotlar rasmiy distribyutordan, 1–2 yil kafolat bilan." },
          { q: "Muddatli to'lov qanday rasmiylashtiriladi?", a: "Pasport va telefon raqami yetarli. Javob 15 daqiqada, 3–12 oyga 0% bilan." },
          { q: "Yetkazib berish bormi?", a: "Toshkent bo'ylab 3 soat ichida, 2 mln so'mdan ortiq buyurtmaga bepul. Viloyatlarga 1–3 kunda." },
          { q: "Mahsulotni qaytarish mumkinmi?", a: "14 kun ichida, qadoqi va chek saqlangan bo'lsa, to'liq pul qaytariladi." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Buyurtma', title: "Buyurtma *bering*", text: "Raqamingizni qoldiring, menejer buyurtmani tasdiqlash uchun bog'lanadi.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Karta orqali', "Muddatli to'lov", 'Payme'], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });


  /* =================== KIYIM BUTIGI (minimal, editorial) =================== */
  add({
    id: 'kiyim', name: 'Kiyim butigi', cat: 'Savdo', icon: 'star', badge: '',
    tags: ['kiyim', 'butik', 'moda', 'fashion', 'одежда', 'бутик', 'clothing', 'style', 'libos'],
    look: 'luxe',
    desc: "Moda butigi va kiyim brendi uchun: editorial hero, kolleksiyalar vitrinasi va savat.",
    build: () => ({
      v: 2, template: 'kiyim',
      company: { name: 'MAISON NUR', logo: 'M', tagline: "Sokin hashamat. Har kuni uchun nafis kiyimlar." },
      theme: { preset: 'minimal', accent: '#1a1a1a', accent2: '#b08d57', look: 'luxe', motion: true, font: 'editorial', radius: 'sharp', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'minimal', cta: "Xarid qilish", ctaLink: '#katalog', search: false },
      announce: { enabled: true, text: "Yangi kolleksiya Kuz–Qish 2026 sotuvda", link: '#katalog' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 800000, deliveryFee: 25000 },
      contacts: { phone: '+998 90 888 12 34', email: 'salom@maison-nur.uz', address: "Toshkent, Mirobod tumani, Taras Shevchenko ko'chasi 12", hours: 'Har kuni 10:00 – 21:00', telegram: '@maison_nur', instagram: '@maison.nur' },
      footer: { text: 'Maison Nur. Toshkentda yaratilgan.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'editorial', badge: 'Kuz–Qish 2026', titleStart: "Uslub — bu *sokin* ishonch", words: [], titleEnd: '', text: "Toza chiziqlar, tabiiy matolar va vaqt sinovidan o'tadigan fasonlar. Kolleksiyani butikda yoki onlayn kashf eting.", cta1Text: 'Kolleksiyani ko\'rish', cta1Link: '#katalog', cta2Text: 'Butikka tashrif', cta2Link: '#aloqa', visual: 'none', image: P('kiyim', 3), inlineImgs: [{ image: P('kiyim', 1) }, { image: P('kiyim', 4) }, { image: P('kiyim', 6) }], trust: [] }),
        sec('manifest', 'statement', { navLabel: 'Brend', eyebrow: 'Falsafamiz', text: "Biz ko'p emas, *to'g'ri* kiyim yaratamiz. Har bir buyum *sifatli mato* va qo'l mehnati bilan tikiladi.", author: 'Nurjahon Aliyeva', role: 'Asoschi va bosh dizayner', image: P('odam', 8), buttonText: '', buttonLink: '#' }),
        sec('kolleksiya', 'showcase', { navLabel: 'Kolleksiyalar', eyebrow: 'Kolleksiyalar', title: "Mavsumning *tanlovi*", text: "Uch yo'nalish, bitta uslub.", items: [
          { title: 'Kundalik minimalizm', tag: 'Ayollar', image: P('kiyim', 2), link: '#katalog' },
          { title: 'Ofis eleganti', tag: 'Erkaklar', image: P('kiyim', 5), link: '#katalog' },
          { title: 'Kechki libos', tag: 'Maxsus', image: P('salon', 2), link: '#katalog' },
          { title: 'Tabiiy matolar', tag: 'Linen & paxta', image: P('kiyim', 6), link: '#katalog' }] }),
        sec('katalog', 'products', { navLabel: 'Katalog', eyebrow: 'Yangi kelganlar', title: "Siz uchun *tanlanganlar*", text: "O'lcham va rangni savatda tanlaysiz.", mode: 'cart', buttonText: 'Savatga', columns: '3', search: false, filters: true, sort: true, items: [
          pr('kofta', "Merino jun kardigan", 689000, 0, 'Ayollar', 'Yangi', "100% merino jun, erkin kesim.", P('kiyim', 1)),
          pr('koylak', "Oq paxta ko'ylak", 429000, 0, 'Erkaklar', '', "Klassik yoqa, yumshoq paxta.", P('kiyim', 5)),
          pr('palto', "Uzun yarim jun palto", 1890000, 2290000, 'Ayollar', '-17%', "Ikki tomonlama, oq-bej rang.", P('kiyim', 3)),
          pr('shim', "Linen keng shim", 519000, 0, 'Ayollar', '', "Yengil, yozgi kunlar uchun.", P('kiyim', 2)),
          pr('kostyum', "Erkaklar kostyumi", 2490000, 2990000, 'Erkaklar', 'Sale', "Ikki tugmali, qora-kulrang.", P('kiyim', 4)),
          pr('libos', "Ipak midi libos", 1290000, 0, 'Ayollar', 'Tavsiya', "Tabiiy ipak, qimmatbaho tushish.", P('salon', 2))] }),
        sec('uslub', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Matoda *sifat*, tikuvda mehr", text: "Italiya va Turkiyadan olingan tabiiy matolar, Toshkent atelyesida qo'l ostida tikiladi.", bullets: ["100% tabiiy matolar", "Cheklangan seriya", "Individual o'lcham"], image: P('kiyim', 4), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Shaxsiy *stilist* xizmati", text: "Garderobingizni birga tuzamiz: rang, fason va ob-havoga mos tavsiyalar. Butikda bepul.", bullets: ["45 daqiqalik uchrashuv", "Rangtavsiya", "Bepul tuzatish"], image: P('kiyim', 6), buttonText: "Stilistga yozilish", buttonLink: '#aloqa' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlar *so\'zi*', text: '', layout: 'grid', items: [
          { text: "Matosi ajoyib, o'lchami aynan mos tushdi. Butikdagi xizmat esa alohida.", name: 'Kamola Ismoilova', role: 'Mijoz', image: P('odam', 1), stars: 5 },
          { text: "Palto uch mavsumdan beri yangiday. Sifat uchun to'laganingizga arziydi.", name: 'Dildora Karimova', role: 'Mijoz', image: P('odam', 6), stars: 5 },
          { text: "Kostyumni 2 kunda moslab berishdi. Hamma meni maqtayapti.", name: 'Otabek Sodiqov', role: 'Mijoz', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "O'lcham mos kelmasa-chi?", a: "14 kun ichida almashtirib beramiz yoki pulni qaytaramiz, buyum kiyilmagan bo'lsa." },
          { q: "Yetkazib berish qancha vaqt oladi?", a: "Toshkent bo'ylab 1–2 kun, viloyatlarga 2–4 kun. 800 000 so'mdan ortiq buyurtmaga bepul." },
          { q: "Individual tikuv qilasizmi?", a: "Ha, atelyemizda individual o'lcham bo'yicha tikamiz. Muddat 7–10 kun." },
          { q: "Kiyimni qanday parvarish qilish kerak?", a: "Har bir buyumga parvarish yo'riqnomasi ilova qilinadi. Tabiiy matolar uchun yumshoq yuvish tavsiya etiladi." }] }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Buyurtma va aloqa', title: "Butikka *xush kelibsiz*", text: "Buyurtma bering yoki stilistga yoziling, biz bilan bog'laning.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Karta orqali', 'Payme', 'Click'], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });


  /* =================== GUL DO'KONI (atirgul, yumshoq) =================== */
  add({
    id: 'gul', name: "Gul do'koni", cat: 'Savdo', icon: 'heart', badge: '',
    tags: ['gul', 'buket', 'gullar', 'sovga', 'yetkazish', 'цветы', 'букет', 'flowers', 'florist', 'bouquet'],
    look: 'cinema',
    desc: "Gul do'koni va florist studiyasi uchun: buketlar, savat va tezkor yetkazib berish.",
    build: () => ({
      v: 2, template: 'gul',
      company: { name: 'Gulbahor', logo: 'G', tagline: "Har bir gul, bir tabassum. Toshkent bo'ylab 60 daqiqada yetkazamiz." },
      theme: { preset: 'rose', accent: '', accent2: '', look: 'cinema', motion: true, font: 'soft', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Buket tanlash', ctaLink: '#buketlar', search: false },
      announce: { enabled: true, text: "Bugun soat 18:00 gacha buyurtma qilsangiz, kechqurun yetkazamiz", link: '#buketlar' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 500000, deliveryFee: 25000 },
      contacts: { phone: '+998 71 244 55 66', email: 'salom@gulbahor.uz', address: "Toshkent, Yakkasaroy tumani, Shota Rustaveli ko'chasi 31", hours: 'Har kuni 8:00 – 22:00', telegram: '@gulbahor_uz', instagram: '@gulbahor.uz' },
      footer: { text: "Sevgi bilan terilgan buketlar.", links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'photo', badge: 'Har kuni yangi gullar', titleStart: "Gullar *tilida* so'zlang", words: [], titleEnd: '', text: "Qo'lda terilgan buketlar, mavsumiy gullar va sovg'a to'plamlari. Yetkazib berish 60 daqiqada, ochiqcha bilan birga.", cta1Text: 'Buket tanlash', cta1Link: '#buketlar', cta2Text: 'Yetkazib berish', cta2Link: '#yetkazish', visual: 'none', image: P('gul', 3), image2: P('gul', 2), spinText: 'sevgi · mehr · bahor · ', chips: ['60 daqiqada yetkazish', 'Yangi gullar', 'Bepul ochiqcha'], trust: [{ value: '8000+', label: 'buket' }, { value: '4.9', label: 'baho' }, { value: '7 yil', label: 'tajriba' }] }),
        sec('lenta', 'marquee', { items: ['Atirgul', 'Pion', 'Lola', 'Orxideya', 'Rafaello', 'Tul\'pan', 'Gortenziya'] }),
        sec('buketlar', 'products', { navLabel: 'Buketlar', eyebrow: 'Buketlar', title: "Eng *sevimli* buketlar", text: "Har bir buket yangi gullardan, buyurtma kuni teriladi.", mode: 'cart', buttonText: 'Savatga', columns: '3', search: false, filters: true, sort: true, items: [
          pr('pion', "Pion va atirgul buketi", 489000, 0, 'Buketlar', 'Hit', "21 ta pushti pion va atirgul, ipak lenta.", P('gul', 2)),
          pr('lola', "Pushti lolalar", 259000, 299000, 'Buketlar', '-13%', "25 ta bahor lolalari, qog'oz o'ramda.", P('gul', 5)),
          pr('oq', "Oq gullar kompozitsiyasi", 359000, 0, 'Buketlar', '', "Tozalik va nafislik: oq atirgul, gipsofila.", P('gul', 6)),
          pr('aralash', "Rang-barang bahor buketi", 329000, 0, 'Buketlar', 'Yangi', "Mavsumiy gullar aralashmasi, 15 dona.", P('gul', 3)),
          pr('savat', "Gul savatchasi", 599000, 699000, "Sovg'a to'plami", '', "Savatchada gullar, shokolad va ochiqcha.", P('gul', 1)),
          pr('vitrina', "Premium atirgul quti", 849000, 0, 'Qutilar', 'Premium', "35 ta ekvador atirgullari, shlyapa qutida.", P('gul', 4))] }),
        sec('yetkazish', 'features', { navLabel: 'Yetkazish', eyebrow: 'Yetkazib berish', title: "Gul *o'z vaqtida* yetib boradi", text: "Sevimli odamingiz kutadigan soatda.", layout: 'bento', items: [
          { icon: 'truck', title: '60 daqiqada', text: "Toshkent bo'ylab shoshilinch yetkazib berish." },
          { icon: 'clock', title: 'Aniq vaqtda', text: "Siz belgilagan soatda, 30 daqiqalik oraliqda." },
          { icon: 'gift', title: 'Bepul ochiqcha', text: "Iliq so'zlaringizni qo'lyozmada yozamiz." },
          { icon: 'camera', title: 'Foto hisobot', text: "Buketni topshirishdan oldin suratini yuboramiz." }] }),
        sec('joy', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Har bir buket *qo'lda* teriladi", text: "Florist-dizaynerlarimiz mavsumiy gullarni tanlab, har bir buketni individual yig'adi.", bullets: ["Bugungi yangi gullar", "Individual kompozitsiya", "Gullar 7 kun turadi"], image: P('gul', 4), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Tadbir va to'ylar uchun *bezak*", text: "To'y, tug'ilgan kun va korporativ tadbirlar uchun gul bezagi va kompozitsiyalar.", bullets: ["Arka va stollar bezagi", "Kelin buketi", "Bepul maslahat"], image: P('toy', 1), buttonText: "Maslahat olish", buttonLink: '#aloqa' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlar *aytishicha*', text: '', layout: 'grid', items: [
          { text: "Buket suratdagidan ham chiroyli chiqdi. Rafiqam xursand bo'ldi!", name: 'Bekzod Ismoilov', role: 'Mijoz', image: P('odam', 5), stars: 5 },
          { text: "Aniq vaqtda yetkazishdi, gullar 10 kun turdi. Rahmat!", name: 'Shahlo Ergasheva', role: 'Mijoz', image: P('odam', 8), stars: 5 },
          { text: "To'yimizni Gulbahor bezadi. Hamma mehmonlar hayratda.", name: 'Madina Rasulova', role: 'Kelin', image: P('odam', 1), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Buketni qancha vaqtda yetkazasiz?", a: "Toshkent bo'ylab 60–90 daqiqada. Belgilangan vaqtga ham yetkazamiz." },
          { q: "Gullar qancha turadi?", a: "To'g'ri parvarishda 7–10 kun. Har bir buketga oziqlantiruvchi paketcha ilova qilamiz." },
          { q: "Buketni o'zgartirish mumkinmi?", a: "Albatta: rang, gul turi va o'ramni xohishingizcha o'zgartiramiz." },
          { q: "Qanday to'lov usullari bor?", a: "Naqd, Payme, Click va karta orqali. Qabul qilinganda ham to'lash mumkin." }] }),
        sec('aksiya', 'cta', { fx: true, eyebrow: '8-mart arafasida', title: "Ayol *bayrami* uchun oldindan buyurtma", text: "Narxlar o'zgarmaydi, bayram kuni belgilangan vaqtda yetkazamiz.", buttonText: 'Buyurtma berish', buttonLink: '#aloqa', countdownTo: '2027-03-07T23:59:00', image: '' }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Buyurtma', title: "Buyurtma *bering*", text: "Manzil va vaqtni yozing, florist tasdiqlash uchun qo'ng'iroq qiladi.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Payme', 'Click', 'Karta orqali'], submitText: 'Buyurtma berish', mapUrl: '' }),
      ],
    }),
  });


  /* =================== MEBEL SALON (issiq, hashamatli) =================== */
  add({
    id: 'mebel', name: 'Mebel salon', cat: 'Savdo', icon: 'home', badge: '',
    tags: ['mebel', 'divan', 'interer', 'salon', 'uy', 'мебель', 'диван', 'интерьер', 'furniture', 'interior', 'sofa'],
    look: 'luxe',
    desc: "Mebel salon va interer studiyasi uchun: kolleksiyalar, katalog, solishtirish va buyurtma anketasi.",
    build: () => ({
      v: 2, template: 'mebel',
      company: { name: 'Uyg\'un Mebel', logo: 'U', tagline: "Uyingizga iliqlik va nafislik olib keluvchi mebellar." },
      theme: { preset: 'warm', accent: '', accent2: '', look: 'luxe', motion: true, font: 'editorial', radius: 'soft', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'bar', cta: 'Loyiha so\'rash', ctaLink: '#anketa', search: false },
      announce: { enabled: true, text: "Salonimizga tashrif buyuring: dizayner maslahati bepul", link: '#aloqa' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 71 255 90 90', email: 'salon@uygun-mebel.uz', address: "Toshkent, Mirzo Ulug'bek tumani, Buyuk Ipak Yo'li 77", hours: 'Har kuni 10:00 – 20:00', telegram: '@uygun_mebel', instagram: '@uygun.mebel' },
      footer: { text: "Uyg'un Mebel. 2012 yildan beri sizning uyingiz uchun.", links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: '2012 yildan beri', titleStart: "Uy — bu *his* qilinadigan joy", words: [], titleEnd: '', text: "Italiya va Turkiya fabrikalari mebellari hamda o'zimizning ustaxonamiz buyurtmalari. Dizayner uyingizni noldan jihozlaydi.", cta1Text: "Kolleksiyalarni ko'rish", cta1Link: '#kolleksiya', cta2Text: "Loyiha so'rash", cta2Link: '#anketa', visual: 'none', image: P('mebel', 2), trust: [{ value: '12 yil', label: 'tajriba' }, { value: '3000+', label: 'jihozlangan uy' }, { value: '5 yil', label: 'kafolat' }] }),
        sec('manifest', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Falsafamiz', text: "Mebel faqat o'tirish uchun emas. U *oilangiz kayfiyatini* belgilaydi, va har bir tafsilot *uzoq yillar* xizmat qilishi kerak.", author: 'Farhod Ergashev', role: 'Asoschi va bosh dizayner', image: P('odam', 5), buttonText: '', buttonLink: '#' }),
        sec('kolleksiya', 'showcase', { navLabel: 'Kolleksiyalar', eyebrow: 'Kolleksiyalar', title: "Har bir *xona* uchun", text: "Uslubingizga mos yo'nalishni tanlang.", items: [
          { title: 'Skandinav yengilligi', tag: 'Yashash xonasi', image: P('mebel', 1), link: '#katalog' },
          { title: 'Loft va g\'isht', tag: 'Zamonaviy', image: P('mebel', 4), link: '#katalog' },
          { title: 'Klassik kutubxona', tag: 'Kabinet', image: P('mebel', 5), link: '#katalog' },
          { title: 'Terrasa va bog\'', tag: 'Ochiq havo', image: P('mebel', 6), link: '#katalog' }] }),
        sec('katalog', 'products', { navLabel: 'Katalog', eyebrow: 'Katalog', title: "Eng *sevilgan* modellar", text: "Narx va mavjudligini bilish uchun so'rov qoldiring: dizayner bog'lanadi.", mode: 'inquiry', buttonText: "Narxni bilish", columns: '3', search: false, filters: true, sort: true, items: [
          pr('divan', "Burchakli divan «Milano»", 14900000, 16900000, 'Divanlar', 'Hit', "Yumshoq velyur, o'zgaruvchan modul, 3 rang.", P('mebel', 2)),
          pr('kreslo', "Kreslo «Savanna»", 4290000, 0, 'Kreslolar', 'Yangi', "Naqshli mato, yog'och oyoqlar.", P('mebel', 3)),
          pr('divan2', "Uch o'rinli divan «Oslo»", 11500000, 0, 'Divanlar', '', "Yengil to'q kulrang, chuqur o'rindiq.", P('mebel', 1)),
          pr('loft', "Loft yashash xonasi to'plami", 23900000, 27500000, "To'plamlar", 'Aksiya', "Divan, jurnal stoli, tokcha va torsher.", P('mebel', 4)),
          pr('kutubxona', "Kutubxona tokchasi «Klassik»", 8900000, 0, 'Tokchalar', '', "Massiv yong'oq, shisha eshiklar.", P('mebel', 5)),
          pr('terrasa', "Terrasa divani «Bog'»", 9700000, 0, 'Divanlar', '', "Suvga chidamli mato, alyuminiy karkas.", P('mebel', 6))] }),
        sec('uslub', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Dizayner *noldan* jihozlaydi", text: "O'lchov, 3D loyiha va mebel tanlash: butun jarayonni bitta mutaxassis olib boradi.", bullets: ["Uyda bepul o'lchov", "3D vizualizatsiya", "Byudjetga moslash"], image: P('mebel', 4), buttonText: "Loyiha so'rash", buttonLink: '#anketa' },
          { label: '02', title: "Yetkazish va *yig'ish* bizdan", text: "Mebelni belgilangan kunda olib kelib, bir kunda yig'ib beramiz.", bullets: ["Qavatgacha ko'tarish", "Qadoqni olib ketish", "5 yillik kafolat"], image: P('mebel', 6), buttonText: '', buttonLink: '#' }] }),
        sec('solishtirish', 'compare', { eyebrow: 'Uslub tanlash', title: "Skandinav yoki *loft*?", text: "Slayderni suring va ikki xil kayfiyatni solishtiring.", before: P('mebel', 1), after: P('mebel', 4), labelBefore: 'Skandinav', labelAfter: 'Loft' }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', text: '', layout: 'grid', items: [
          { text: "Butun uyni bitta salondan jihozladik. Dizayner har narsani o'ylab qo'ygan edi.", name: 'Jamshid Mirzayev', role: 'Uy egasi', image: P('odam', 4), stars: 5 },
          { text: "Divan suratdagidan ham chiroyli. 7 kunda yetkazib, yig'ib berishdi.", name: 'Sevara Aliyeva', role: 'Mijoz', image: P('odam', 3), stars: 5 },
          { text: "Narx va sifat mutanosib. Kafolat bo'yicha hech qanday muammo bo'lmadi.", name: 'Azamat Rustamov', role: 'Mijoz', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Buyurtma qancha vaqtda tayyor bo'ladi?", a: "Omborda bor modellar 3–7 kunda, buyurtma bo'yicha 20–45 kunda yetkaziladi." },
          { q: "Muddatli to'lov bormi?", a: "Ha, 12 oygacha foizsiz bo'lib to'lash mumkin." },
          { q: "Mebelni o'z o'lchamimga moslab bera olasizmi?", a: "Ha, ustaxonamiz individual o'lcham va rang bo'yicha buyurtma qabul qiladi." },
          { q: "Kafolat qancha?", a: "Karkasga 5 yil, mato va mexanizmlarga 2 yil." }] }),
        sec('anketa', 'brief', { navLabel: 'Loyiha', eyebrow: 'Loyihangizni boshlaymiz', title: "Uyingizni *birga* jihozlaymiz", text: "2 daqiqalik anketa: xona, uslub va byudjetni tanlang. Dizayner siz bilan bog'lanadi.", buttonText: 'Anketani to\'ldirish', promise: "Dizayner 1 soat ichida bog'lanadi", showEstimate: true,
          usp: ["Dizayner maslahati bepul", "Uyda o'lchov va 3D loyiha", "Yetkazish va yig'ish narxga kiritilgan"],
          services: [
            { id: 'yashash', name: 'Yashash xonasi', desc: "Divan, kreslo, jurnal stoli, tokcha", icon: 'home', price: 12000000, days: '2–4 hafta' },
            { id: 'yotoq', name: 'Yotoqxona', desc: "Karavot, shkaf, tumba", icon: 'heart', price: 15000000, days: '3–5 hafta' },
            { id: 'oshxona', name: 'Oshxona', desc: "Oshxona garniturasi va ovqat stoli", icon: 'utensils', price: 18000000, days: '4–6 hafta' }],
          features: [
            { name: "3D vizualizatsiya", price: 500000, types: '' },
            { name: "Yetkazish va yig'ish", price: 300000, types: '' },
            { name: "Eski mebelni olib ketish", price: 200000, types: 'yashash,yotoq' }],
          styles: [
            { name: 'Skandinav', desc: "Yorug' va yengil", c1: '#e9e4da', c2: '#8a8f7c' },
            { name: 'Loft', desc: "G'isht va metall", c1: '#3a3330', c2: '#b4693a' },
            { name: 'Klassik', desc: "Yong'oq va charm", c1: '#4b3426', c2: '#c9a45c' }],
          goals: ["Yangi uy jihozlash", "Bitta xonani yangilash", "Ofis jihozlash", "Sovg'a / maslahat"],
          budgets: ["10 mln so'mgacha", "10–30 mln so'm", "30–70 mln so'm", "70 mln so'mdan ko'p", "Maslahat kerak"],
          deadlines: ["Shoshilinch (1–2 hafta)", "1 oy", "2–3 oy", "Shoshilmayman"],
          successTitle: "So'rovingiz qabul qilindi!", successText: "Dizayner ish vaqtida 1 soat ichida, boshqa vaqtda keyingi kuni ertalab siz bilan bog'lanadi." }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Salonimiz', title: "Salonga *tashrif* buyuring", text: "Savolingiz bo'lsa yozing: bepul maslahat beramiz va namunalarni ko'rsatamiz.", form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' }),
      ],
    }),
  });


  /* =================== KAFE VA QANDOLAT (shinam, iliq) =================== */
  add({
    id: 'kafe', name: 'Kafe va qandolat', cat: 'Xizmat', icon: 'coffee', badge: '',
    tags: ['kafe', 'qahva', 'qandolat', 'nonvoyxona', 'desert', 'kofe', 'кофейня', 'кафе', 'пекарня', 'coffee', 'bakery', 'cafe'],
    look: 'luxe',
    desc: "Qahvaxona va qandolatxona uchun: katta foto, menyu, galereya va stol bron qilish.",
    build: () => ({
      v: 2, template: 'kafe',
      company: { name: 'Qahva & Non', logo: 'Q', tagline: "Yangi qovurilgan qahva va issiq pishiriqlar. Har kuni ertalab." },
      theme: { preset: 'minimal', accent: '#a9532a', accent2: '#e0a458', look: 'luxe', motion: true, font: 'luxe', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Stol band qilish', ctaLink: '#bron', search: false },
      announce: { enabled: true, text: "Har kuni 8:00 – 11:00: qahva + kruassan 35 000 so'm", link: '#menyu' },
      orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },
      contacts: { phone: '+998 71 207 33 11', email: 'salom@qahvanon.uz', address: "Toshkent, Mirzo Ulug'bek tumani, Oybek ko'chasi 19", hours: 'Har kuni 8:00 – 22:00', telegram: '@qahvanon_uz', instagram: '@qahva.non' },
      footer: { text: 'Issiq qahva, iliq suhbat.', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'cinema', badge: 'Har kuni 8:00 dan 22:00 gacha', titleStart: "Har ertalab *qahva* va non", words: [], titleEnd: '', text: "O'zimiz qovurgan qahva donalari, ertalab pishgan kruassan va uyda tayyorlangan shirinliklar. Ishga shoshilmang: bir piyola vaqt ajrating.", cta1Text: 'Stol band qilish', cta1Link: '#bron', cta2Text: "Menyuni ko'rish", cta2Link: '#menyu', visual: 'none', image: P('kafe', 1), trust: [{ value: '4.9', label: 'mehmonlar bahosi' }, { value: '40+', label: 'xil shirinlik' }, { value: '8 yil', label: 'sizlar bilan' }] }),
        sec('lenta', 'marquee', { items: ['Yangi qovurilgan qahva', 'Kruassan', 'Cheesecake', 'Tiramisu', 'Matcha', 'Nonushta', 'Uy pishiriqlari'] }),
        sec('biz', 'statement', { navLabel: 'Biz haqimizda', eyebrow: 'Hikoyamiz', text: "Biz uchun qahva — bu *kichik bayram*. Har bir piyola *mehr* va diqqat bilan, har bir pishiriq esa *ertalab* qo'lda tayyorlanadi.", author: 'Dilshod Nazarov', role: 'Barista va asoschi', image: P('odam', 2), buttonText: '', buttonLink: '#' }),
        sec('menyu', 'menu', { navLabel: 'Menyu', eyebrow: 'Menyu', title: "Bizning *sevimlilar*", text: 'Qahva, nonushta va shirinliklar: har kuni yangi tayyorlanadi.', mode: 'none', items: [
          mi('latte', 'Latte', 32000, 'Qahva', 'Hit', "Espresso, bug'langan sut va yumshoq ko'pik.", P('kafe', 4)),
          mi('kapuchino', 'Kapuchino', 30000, 'Qahva', '', "Klassik retsept: espresso, sut va qalin ko'pik.", P('kafe', 5)),
          mi('flat', 'Flat white', 34000, 'Qahva', '', "Qo'sh espresso va ipaksimon sut.", P('kafe', 1)),
          mi('kruassan', 'Kruassan sariyog\'li', 22000, 'Pishiriqlar', 'Yangi', "Fransuz sariyog'idan, har kuni ertalab.", P('qandolat', 4)),
          mi('maffin', "Qovoq urug'li maffin", 18000, 'Pishiriqlar', '', "Uyda pishirilgan, yengil va mazali.", P('qandolat', 6)),
          mi('kapkeyk', "Qulupnayli kapkeyk", 26000, 'Shirinliklar', '', "Pushti krem, yengil biskvit.", P('qandolat', 5)),
          mi('tort', "Tort «Napoleon»", 38000, 'Shirinliklar', 'Tavsiya', "Qatlama xamir va vanilli krem.", P('qandolat', 3)),
          mi('non', "Hunarmand non", 16000, 'Pishiriqlar', '', "Tabiiy xamirturush, tandirda pishadi.", P('qandolat', 2))] }),
        sec('joy', 'split', { eyebrow: '', title: '', text: '', items: [
          { label: '01', title: "Donadan *piyolagacha*", text: "Qahva donalarini Efiopiya va Braziliyadan keltirib, o'zimiz qovuramiz: har hafta yangi partiya.", bullets: ["O'zimizning qovurilgan", "Alternativ usullar: V60, aeropress", "Donni uyga olib ketish"], image: P('kafe', 6), buttonText: '', buttonLink: '#' },
          { label: '02', title: "Tadbir va *yig'ilishlar* uchun", text: "Do'stlar davrasi, tug'ilgan kun yoki biznes uchrashuv: 20 kishigacha alohida zalimiz bor.", bullets: ["Bepul Wi-Fi", "Tort buyurtma qilish", "Alohida zal"], image: P('kafe', 3), buttonText: 'Stol band qilish', buttonLink: '#bron' }] }),
        sec('galereya', 'gallery', { navLabel: 'Galereya', eyebrow: 'Galereya', title: "Bizning *muhit*", text: '', layout: 'masonry', items: [
          { image: P('kafe', 2), caption: '' }, { image: P('qandolat', 1), caption: '' }, { image: P('kafe', 4), caption: '' }, { image: P('qandolat', 5), caption: '' }, { image: P('kafe', 5), caption: '' }, { image: P('qandolat', 6), caption: '' }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Mehmonlar *aytishicha*', text: '', layout: 'wall', items: [
          { text: "Toshkentdagi eng yaxshi latte shu yerda. Muhit juda shinam.", name: 'Aziza Karimova', role: 'Doimiy mehmon', image: P('odam', 1), stars: 5 },
          { text: "Kruassan har kuni yangi, ishdan oldin kelmasam bo'lmaydi.", name: 'Sanjar Umarov', role: 'Doimiy mehmon', image: P('odam', 4), stars: 5 },
          { text: "Tug'ilgan kunga tort buyurtma qildim, hamma yoqtirdi.", name: 'Feruza Aliyeva', role: 'Mehmon', image: P('odam', 6), stars: 5 },
          { text: "Ish uchrashuvlari uchun ideal: tinch va Wi-Fi tez.", name: 'Anvar Yusupov', role: 'Tadbirkor', image: P('odam', 5), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Stolni oldindan band qilish kerakmi?", a: "Dam olish kunlari tavsiya etamiz. Hafta ichida odatda bo'sh joy bo'ladi." },
          { q: "Tort buyurtma qilsa bo'ladimi?", a: "Ha, 1 kun oldin buyurtma bering. Narxi 280 000 so'mdan boshlanadi." },
          { q: "Sutsiz yoki glyutensiz variantlar bormi?", a: "Ha, o'simlik suti (bodom, ovsyanka) va glyutensiz desertlar mavjud." },
          { q: "Yetkazib berish xizmati bormi?", a: "Ha, Toshkent bo'ylab Yandex Go va Express24 orqali." }] }),
        sec('manzil', 'map', { navLabel: 'Manzil', eyebrow: 'Manzil', title: 'Bizni *toping*', text: '', query: "Toshkent, Mirzo Ulug'bek tumani, Oybek ko'chasi 19", zoom: 15 }),
        sec('bron', 'contact', { navLabel: 'Bron', eyebrow: 'Stol band qilish', title: "Stolingiz *kutmoqda*", text: "Sana va vaqtni tanlang, tasdiqlash uchun qo'ng'iroq qilamiz.", form: 'booking', serviceOptions: ['Oddiy stol', 'Deraza oldidagi stol', 'Tadbir zali', "Tort buyurtma"], askGuests: true, askAddress: false, payOptions: [], submitText: 'Band qilish', mapUrl: '' }),
      ],
    }),
  });


  /* =================== FAST-FOOD VA YETKAZIB BERISH (jasur, energiyali) =================== */
  add({
    id: 'fastfood', name: 'Fast-food va yetkazib berish', cat: 'Xizmat', icon: 'truck', badge: '',
    tags: ['fastfood', 'burger', 'pitsa', 'yetkazib berish', 'taom', 'фастфуд', 'бургер', 'пицца', 'доставка', 'delivery', 'pizza'],
    look: 'cinema',
    desc: "Fast-food, pitsa va yetkazib berish xizmati uchun: yorqin dizayn, savat va 30 daqiqalik yetkazish.",
    build: () => ({
      v: 2, template: 'fastfood',
      company: { name: 'Burger Bro', logo: 'B', tagline: "Issiq, shirali, tez. 30 daqiqada eshigingizda." },
      theme: { preset: 'dark', accent: '#ff4d1a', accent2: '#ffc21a', look: 'cinema', motion: true, font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false },
      nav: { style: 'pill', cta: 'Buyurtma berish', ctaLink: '#menyu', search: false },
      announce: { enabled: true, text: "2 ta burger olsangiz, kola sovg'a! Promokod: BRO2", link: '#menyu' },
      orders: { enabled: true, currency: "so'm", freeShipFrom: 150000, deliveryFee: 12000 },
      contacts: { phone: '+998 78 777 30 30', email: 'bro@burgerbro.uz', address: "Toshkent, Yunusobod tumani, Ahmad Donish ko'chasi 8", hours: 'Har kuni 10:00 – 03:00', telegram: '@burgerbro_uz', instagram: '@burger.bro.uz' },
      footer: { text: 'Burger Bro. Ishtaha bilan!', links: [] },
      sections: [
        sec('bosh', 'hero', { layout: 'shop', badge: "30 daqiqada yetkazamiz yoki bepul", titleStart: "Ochlik? *Burger Bro* yo'lda!", words: [], titleEnd: '', text: "Qo'lda shakllangan kotlet, yangi bulochka va uy sousi. Pitsa, kombo va ichimliklar: hammasi issiq holda.", cta1Text: 'Menyuga o\'tish', cta1Link: '#menyu', cta2Text: 'Kombo to\'plamlar', cta2Link: '#kombo', visual: 'collage', image: P('fastfood', 2), collage: [
          { image: P('fastfood', 1), title: 'Double Bro burger', price: "49 000 so'm" },
          { image: P('fastfood', 6), title: 'Margarita pitsa', price: "69 000 so'm" },
          { image: P('fastfood', 3), title: 'Pepperoni pitsa', price: "79 000 so'm" }], trust: [{ value: '30 daq', label: 'yetkazish' }, { value: '4.8', label: 'baho' }, { value: '10:00–03:00', label: 'ish vaqti' }] }),
        sec('lenta', 'marquee', { items: ['Burgerlar', 'Pitsa', 'Kombo', 'Tovuq qanotlari', 'Kartoshka fri', 'Ichimliklar', '30 daqiqada', 'Tun bo\'yi ochiq'] }),
        sec('hit', 'showcase', { eyebrow: 'Hit mahsulotlar', title: "Eng *sevimli* uchlik", text: '', items: [
          { title: 'BBQ Grill burger', tag: "45 000 so'm", image: P('fastfood', 4), link: '#menyu' },
          { title: 'Pitsa 4 xil pishloq', tag: "85 000 so'm", image: P('fastfood', 5), link: '#menyu' },
          { title: 'Chizburger', tag: "35 000 so'm", image: P('fastfood', 2), link: '#menyu' },
          { title: 'Pepperoni pitsa', tag: "79 000 so'm", image: P('fastfood', 3), link: '#menyu' }] }),
        sec('menyu', 'menu', { navLabel: 'Menyu', eyebrow: 'Menyu', title: "Nimani *xohlaysiz*?", text: "Savatga qo'shing, manzilni yozing, qolganini bizga qo'yib bering.", mode: 'cart', items: [
          mi('double', 'Double Bro burger', 49000, 'Burgerlar', 'Hit', "Ikki kotlet, cheddar, tuzlangan bodring, uy sousi.", ''),
          mi('chizburger', 'Chizburger', 35000, 'Burgerlar', '', "Mol go'shti kotleti, ikki qavat pishloq.", ''),
          mi('bbq', 'BBQ Grill burger', 45000, 'Burgerlar', 'Yangi', "Olovda pishgan kotlet, BBQ sousi, qovurilgan piyoz.", ''),
          mi('margarita', 'Pitsa Margarita 32 sm', 69000, 'Pitsalar', '', "Pomidor sousi, mozzarella, rayhon.", ''),
          mi('pepperoni', 'Pitsa Pepperoni 32 sm', 79000, 'Pitsalar', 'Hit', "Pepperoni, mozzarella va maxsus sous.", ''),
          mi('sirli', 'Pitsa 4 xil pishloq 32 sm', 85000, 'Pitsalar', '', "Mozzarella, cheddar, parmezan, dor-blyu.", ''),
          mi('kartoshka', 'Kartoshka fri', 18000, "Qo'shimcha", '', "Qarsildoq, pishloq sousi bilan.", ''),
          mi('qanot', 'Tovuq qanotlari (8 ta)', 42000, "Qo'shimcha", 'Achchiq', "Achchiq marinadda, ranch sousi bilan.", '')] }),
        sec('kombo', 'bento', { navLabel: 'Kombo', eyebrow: 'Kombo to\'plamlar', title: "Kombo bilan *arzonroq*", text: '', items: [
          { kind: 'image', size: 'w', tall: false, title: 'Bro kombo: burger + fri + kola', text: "99 000 o'rniga 79 000 so'm.", value: '', icon: 'star', image: P('fastfood', 1), link: '' },
          { kind: 'stat', size: 's', tall: false, title: 'tejaysiz', text: '', value: '-20%', icon: 'percent', image: '', link: '' },
          { kind: 'hl', size: 'm', tall: false, title: 'Oilaviy kombo', text: "2 pitsa + 4 ta ichimlik + kartoshka fri.", value: '199 000', icon: 'users', image: '', link: '' },
          { kind: 'text', size: 'm', tall: false, title: 'Do\'stlar kombosi', text: "4 ta burger, 2 fri va 4 ta kola bir qutida.", value: '', icon: 'gift', image: '', link: '' },
          { kind: 'image', size: 'm', tall: false, title: 'Pitsa kechasi', text: "Seshanba: 2-pitsa sovg'a.", value: '', icon: 'zap', image: P('fastfood', 5), link: '' }] }),
        sec('stat', 'stats', { eyebrow: '', title: '', text: '', items: [{ value: 30, suffix: ' daq', label: "o'rtacha yetkazish" }, { value: 200, suffix: 'K+', label: 'yetkazilgan buyurtma' }, { value: 4, suffix: '.8', label: 'o\'rtacha baho' }, { value: 17, suffix: ' soat', label: 'har kuni ochiq' }] }),
        sec('yetkazish', 'process', { navLabel: 'Yetkazish', eyebrow: 'Qanday ishlaydi', title: "Buyurtma *3 qadamda*", text: '', layout: 'grid', items: [
          { title: 'Tanlang', text: "Menyudan burger, pitsa yoki kombo tanlab savatga soling." },
          { title: 'Buyurtma bering', text: "Manzilni yozing, to'lov usulini tanlang." },
          { title: 'Mazasini suring', text: "Kuryer 30 daqiqada issiq holda yetkazadi." }] }),
        sec('fikr', 'testimonials', { eyebrow: 'Sharhlar', title: 'Ular *maqtashmoqda*', text: '', layout: 'grid', items: [
          { text: "Burger issiq va juda sershira keldi. 25 daqiqada yetkazishdi!", name: 'Jahongir Qodirov', role: 'Mijoz', image: P('odam', 4), stars: 5 },
          { text: "Pepperoni pitsa Toshkentdagi eng yaxshisi. Kombo ham juda hamyonbop.", name: 'Aziza Normatova', role: 'Mijoz', image: P('odam', 6), stars: 5 },
          { text: "Kechasi soat 2 da ham ishlashadi, jonimizga oro kirdi.", name: 'Behzod Aliyev', role: 'Talaba', image: P('odam', 2), stars: 5 }] }),
        sec('savol', 'faq', { navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [
          { q: "Yetkazib berish qancha turadi?", a: "150 000 so'mdan ortiq buyurtmaga bepul, aks holda 12 000 so'm." },
          { q: "30 daqiqada yetib kelmasa nima bo'ladi?", a: "Buyurtma uchun kechikkanda kola yoki fri sovg'a qilamiz." },
          { q: "To'lov usullari qanday?", a: "Naqd, Payme, Click yoki kuryerga karta orqali." },
          { q: "Halol mahsulotlarmi?", a: "Ha, barcha go'sht mahsulotlari halol sertifikatlangan." }] }),
        sec('aksiya', 'cta', { fx: true, eyebrow: 'Maxsus taklif', title: "Birinchi buyurtmaga *-20%*", text: "Promokod: BRO20. Ilova yoki sayt orqali buyurtma bering.", buttonText: 'Buyurtma berish', buttonLink: '#menyu', countdownTo: '2026-12-31T23:59:00', image: '' }),
        sec('aloqa', 'contact', { navLabel: 'Aloqa', eyebrow: 'Buyurtma', title: "Buyurtma *bering*", text: "Telefon va manzilni qoldiring, operator 2 daqiqada bog'lanadi.", form: 'order', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Payme', 'Click', 'Karta orqali'], submitText: 'Buyurtma berish', mapUrl: '' }),
      ],
    }),
  });

})();
