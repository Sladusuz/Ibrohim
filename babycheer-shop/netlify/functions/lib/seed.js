// BabyCheer sayti (Sladusuz/Market, js/seed.js) ma'lumotlari. Narxlar saytdagi namunaviy narxlar:
// haqiqiylarini botda /price, /stock, /add buyruqlari bilan almashtiring.
const C = {
  "Ko'k": '#2b59ff', Qizil: '#e5262b', Oq: '#eef0f4', Qora: '#1b1d24', Yashil: '#12a66b', Pushti: '#f0589f',
  Sariq: '#f5b800', "To'q sariq": '#ff7a1a', Zangori: '#10a5b8', Kulrang: '#7d8594', 'Metallik kulrang': '#6f7f86',
};
export const COLOR_HEX = C;
const cols = (...n) => n.map((name) => ({ name, hex: C[name] }));

export const SEED_SETTINGS = {
  name: 'BabyCheer',
  phone: '+998 99 114 90 99',
  telegram: 'babycheer_admin',
  channel: 'https://t.me/+9CWZLTOE7KczZjky',
  instagram: 'https://instagram.com/babycheer_shop',
  regionFee: 0, // viloyatlarga yetkazish narxi (0 = operator bilan kelishiladi); Toshkent bo'ylab bepul
  installment: { enabled: false, months: 6, markup: 0 }, // muddatli to'lov hisoblagichi (admin panelda yoqiladi)
};

export const SEED_CATEGORIES = [
  { id: 1, slug: 'elektromobil', name: 'Elektromobillar', icon: 'car', sort: 1 },
  { id: 2, slug: 'kalyaska', name: 'Kalyaskalar', icon: 'stroller', sort: 2 },
  { id: 3, slug: 'velokalyaska', name: 'Velokalyaskalar', icon: 'trike', sort: 3 },
  { id: 4, slug: 'mototsikl', name: 'Mototsikllar', icon: 'moto', sort: 4 },
  { id: 5, slug: 'samokat', name: 'Samokatlar', icon: 'scooter', sort: 5 },
];

const P = (id, category_id, title, price, old_price, stock, badge, featured, short, description, specs, colors) => ({
  id, category_id, title, brand: 'BabyCheer', price, old_price, stock, badge, featured, short, description, specs, colors,
  photo: null, active: true, sort: id,
});

export const SEED_PRODUCTS = [
  P(1, 1, 'Sport elektromobil, 2 kishilik', 4600000, 0, 5, 'Yangi', true,
    'Karbon uslubidagi sport dizayn, LED yoritish va spoyler.',
    "Sport avtomobil uslubidagi 2 kishilik elektromobil: karbon tolaga o'xshash kapot, katta orqa spoyler, keng g'ildirak kamarlari, LED faralar va pastki LED yoritish. Salonda xavfsizlik kamarlari, qizil sport rul va musiqa paneli bor.",
    { "O'rindiq": '2 ta (yonma-yon)', Xavfsizlik: 'Xavfsizlik kamarlari', Yoritish: 'LED fara va pastki yoritish', "Qo'shimcha": 'Orqa spoyler, musiqa paneli' },
    cols('Metallik kulrang')),
  P(2, 1, '1 kishilik elektromobil', 2450000, 2790000, 14, 'Eng ommabop', true,
    'Pult, LED chiroq va musiqa. 2 yoshdan.',
    "Pult bilan boshqariladigan, ikki rejimli (bola o'zi haydaydi yoki ota-ona pult bilan boshqaradi) bolalar elektromobili. Xavfsizlik kamari, yumshoq o'rindiq, LED chiroqlar va Bluetooth orqali musiqa.",
    { Yosh: '2-6 yosh', Batareya: '12V 7Ah', Tezlik: '3-5 km/soat', "Yuk ko'tarish": '30 kg gacha', Boshqaruv: 'Pedal va ota-ona pulti' },
    cols("Ko'k", 'Qizil', 'Oq', 'Qora', 'Yashil', 'Pushti')),
  P(3, 1, '2 kishilik elektromobil', 3950000, 0, 8, 'Yangi', true,
    "Ikki o'rindiq, 4 motor, Bluetooth.",
    "Ikki bola uchun keng salon, to'rt motorli yuritma va ota-ona pulti. Notekis yo'llarda ham barqaror: amortizatsiyali g'ildiraklar va kuchli konstruksiya.",
    { Yosh: '3-8 yosh', Batareya: '24V 10Ah', Tezlik: '3-7 km/soat', "Yuk ko'tarish": '60 kg gacha', Motor: '4 ta' },
    cols('Qizil', "Ko'k", 'Oq', 'Qora', 'Sariq')),
  P(4, 1, 'Jip uslubidagi elektromobil', 3290000, 3690000, 6, 'Chegirma', true,
    "Katta g'ildirak, bagajli tom, 2 o'rindiq.",
    "Katta g'ildirakli jip: tomda bagaj, orqada zaxira g'ildirak va yuqori yo'l tirqishi. Hovli va parkda sayr qilish uchun.",
    { Yosh: '3-7 yosh', Batareya: '12V 10Ah', Tezlik: '3-6 km/soat', "Yuk ko'tarish": '40 kg gacha' },
    cols('Yashil', 'Qora', 'Oq', "To'q sariq")),
  P(5, 2, 'Dron kalyaska 3/1', 2150000, 2490000, 11, '', true,
    'Beshik, yurish bloki va avtokreslo.',
    "Uchta modulli (beshik, yurish bloki, avtokreslo) universal kalyaska. Katta g'ildiraklar va amortizatsiya shahar va yo'l uchun mos.",
    { Yosh: '0-3 yosh', "Og'irligi": '9.5 kg', Tarkibi: '3 ta modul' },
    cols('Kulrang', 'Qora', 'Zangori', 'Pushti')),
  P(6, 2, 'Yengil sayohat kalyaskasi', 890000, 0, 20, '', false,
    "Bir qo'l bilan yig'iladi, 6 kg.",
    "Samolyot va avtomobil bagajiga sig'adigan ixcham kalyaska.",
    { Yosh: '6 oy - 3 yosh', "Og'irligi": '6 kg', "Yig'ilishi": "Bir qo'l bilan" },
    cols('Qora', "Ko'k", 'Qizil')),
  P(7, 3, 'Velokalyaska 5/1', 1390000, 1590000, 17, 'Chegirma', true,
    "Soyabon, savat, ota-ona tutqichi.",
    "Ota-ona boshqaradigan tutqich, soyabon, xavfsizlik kamari va savat. Bola o'sgani sari oddiy velosipedga aylanadi.",
    { Yosh: '1-5 yosh', "Og'irligi": '7 kg', "Yuk ko'tarish": '25 kg gacha', Rejimlar: '5 xil' },
    cols('Yashil', 'Pushti', "Ko'k", "To'q sariq")),
  P(8, 4, 'Bolalar elektromototsikli', 1690000, 1890000, 9, '', true,
    "Ovoz, chiroq, yordamchi g'ildirak.",
    "Ovozli va chiroqli elektromototsikl, yordamchi g'ildiraklar bilan barqaror. Pedal bilan ishga tushadi.",
    { Yosh: '2-5 yosh', Batareya: '6V 4.5Ah', Tezlik: '3 km/soat', "Yuk ko'tarish": '25 kg gacha' },
    cols('Qizil', 'Qora', "Ko'k", 'Oq')),
  P(9, 5, "Samokat, 3 g'ildirakli", 390000, 0, 30, '', false,
    'Balandligi sozlanadi, alyuminiy.',
    'Balandligi sozlanadigan, keng taxtali va tormozli samokat.',
    { Yosh: '3-8 yosh', "Og'irligi": '2.4 kg', "Yuk ko'tarish": '50 kg gacha', Material: 'Alyuminiy' },
    cols("To'q sariq", 'Zangori', 'Pushti', 'Yashil')),
  P(10, 5, "Samokat, yorug' g'ildirakli", 450000, 520000, 25, '', false,
    "Harakatda yonadigan LED g'ildiraklar.",
    "LED g'ildiraklar, yig'iladigan konstruksiya.",
    { Yosh: '4-10 yosh', "Og'irligi": '3 kg', "Yuk ko'tarish": '60 kg gacha', Material: 'Alyuminiy' },
    cols('Pushti', "Ko'k", 'Sariq')),
];

export const FAQ = [
  ['Elektromobil necha yoshdan?', "Modelga qarab 2 yoshdan 8 yoshgacha. Har bir mahsulotda aniq yosh va yuk ko'tarish ko'rsatilgan."],
  ['Yetkazib berish qanday?', "Toshkent shahri bo'ylab yetkazib berish bepul. Butun O'zbekiston bo'ylab ham yetkazib beramiz: narxi va muddatini operator buyurtmani tasdiqlaganda aytadi."],
  ["To'lov qanday amalga oshiriladi?", "Qabul qilganda naqd yoki karta orqali, shuningdek Telegram ichida onlayn yoki karta o'tkazmasi orqali oldindan to'lash mumkin."],
  ["Rangni keyin o'zgartirsa bo'ladimi?", "Buyurtma tasdiqlanishidan oldin Telegram yoki telefon orqali rangni o'zgartirish mumkin."],
  ['Buyurtmani qanday kuzataman?', "«Buyurtmalar» bo'limida har bir buyurtma holati ko'rinadi, o'zgarsa bot sizga xabar yuboradi."],
];
