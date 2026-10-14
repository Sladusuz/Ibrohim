/* Namunaviy ma'lumotlar (demo rejim va seed.sql uchun). Narxlar va xususiyatlar namunaviy: admin paneldan haqiqiylarini kiriting. */
(function () {
  const C = {
    blue: { name: "Ko'k", hex: '#2b59ff' }, red: { name: 'Qizil', hex: '#e5262b' }, white: { name: 'Oq', hex: '#eef0f4' }, black: { name: 'Qora', hex: '#1b1d24' },
    green: { name: 'Yashil', hex: '#12a66b' }, pink: { name: 'Pushti', hex: '#f0589f' }, yellow: { name: 'Sariq', hex: '#f5b800' }, orange: { name: "To'q sariq", hex: '#ff7a1a' }, teal: { name: 'Zangori', hex: '#10a5b8' }, grey: { name: 'Kulrang', hex: '#7d8594' },
  };
  const cols = (...k) => k.map((x) => C[x]);

  window.BC_SEED = {
    settings: {
      name: 'BabyCheer', phone: '+998 99 114 90 99', telegram: 'babycheer_admin',
      channel: 'https://t.me/+9CWZLTOE7KczZjky', instagram: 'https://instagram.com/babycheer_shop',
      freeFrom: 1000000, deliveryFee: 40000, warrantyMonths: 6,
    },
    categories: [
      { id: 'c-car', slug: 'elektromobil', name: 'Elektromobillar', sort: 1 },
      { id: 'c-stroller', slug: 'kalyaska', name: 'Kalyaskalar', sort: 2 },
      { id: 'c-trike', slug: 'velokalyaska', name: 'Velokalyaskalar', sort: 3 },
      { id: 'c-moto', slug: 'mototsikl', name: 'Mototsikllar', sort: 4 },
      { id: 'c-scooter', slug: 'samokat', name: 'Samokatlar', sort: 5 },
    ],
    products: [
      { id: 'p-sport', category_id: 'c-car', title: 'Sport elektromobil, 2 kishilik', brand: 'BabyCheer', price: 4600000, old_price: 0, stock: 5, badge: 'Yangi', featured: true, model3d: '',
        images: ['img/products/sport-1.jpg', 'img/products/sport-4.jpg', 'img/products/sport-3.jpg', 'img/products/sport-2.jpg'],
        colors: [{ name: 'Metallik kulrang', hex: '#6f7f86' }], short: 'Karbon uslubidagi sport dizayn, LED yoritish va spoyler.',
        description: "Sport avtomobil uslubidagi 2 kishilik elektromobil: karbon tolaga o'xshash kapot, katta orqa spoyler, keng g'ildirak kamarlari, LED faralar va pastki LED yoritish. Salonda xavfsizlik kamarlari, qizil sport rul va musiqa paneli bor.",
        specs: { "O'rindiq": '2 ta (yonma-yon)', Xavfsizlik: 'Xavfsizlik kamarlari', Yoritish: 'LED fara va pastki yoritish', "Qo'shimcha": 'Orqa spoyler, musiqa paneli', Kafolat: '6 oy' } },
      { id: 'p-car1', category_id: 'c-car', title: '1 kishilik elektromobil', brand: 'BabyCheer', price: 2450000, old_price: 2790000, stock: 14, badge: 'Eng ommabop', featured: true, model3d: 'single',
        colors: cols('blue', 'red', 'white', 'black', 'green', 'pink'), short: 'Pult, LED chiroq va musiqa. 2 yoshdan.',
        description: "Pult bilan boshqariladigan, ikki rejimli (bola o'zi haydaydi yoki ota-ona pult bilan boshqaradi) bolalar elektromobili. Xavfsizlik kamari, yumshoq o'rindiq, LED chiroqlar va Bluetooth orqali musiqa.",
        specs: { Yosh: '2-6 yosh', Batareya: '12V 7Ah', Tezlik: '3-5 km/soat', "Yuk ko'tarish": '30 kg gacha', Boshqaruv: "Pedal va ota-ona pulti", Kafolat: '6 oy' }, images: [] },
      { id: 'p-car2', category_id: 'c-car', title: '2 kishilik elektromobil', brand: 'BabyCheer', price: 3950000, old_price: 0, stock: 8, badge: 'Yangi', featured: true, model3d: 'double',
        colors: cols('red', 'blue', 'white', 'black', 'yellow'), short: "Ikki o'rindiq, 4 motor, Bluetooth.",
        description: "Ikki bola uchun keng salon, to'rt motorli yuritma va ota-ona pulti. Notekis yo'llarda ham barqaror: amortizatsiyali g'ildiraklar va kuchli konstruksiya.",
        specs: { Yosh: '3-8 yosh', Batareya: '24V 10Ah', Tezlik: '3-7 km/soat', "Yuk ko'tarish": '60 kg gacha', Motor: '4 ta', Kafolat: '6 oy' }, images: [] },
      { id: 'p-car3', category_id: 'c-car', title: 'Jip uslubidagi elektromobil', brand: 'BabyCheer', price: 3290000, old_price: 3690000, stock: 6, badge: 'Chegirma', featured: true, model3d: 'suv',
        colors: cols('green', 'black', 'white', 'orange'), short: "Katta g'ildirak, bagajli tom, 2 o'rindiq.",
        description: "Katta g'ildirakli jip: tomda bagaj, orqada zaxira g'ildirak va yuqori yo'l tirqishi. Hovli va parkda sayr qilish uchun.",
        specs: { Yosh: '3-7 yosh', Batareya: '12V 10Ah', Tezlik: '3-6 km/soat', "Yuk ko'tarish": '40 kg gacha', Kafolat: '6 oy' }, images: [] },
      { id: 'p-str1', category_id: 'c-stroller', title: 'Dron kalyaska 3/1', brand: 'BabyCheer', price: 2150000, old_price: 2490000, stock: 11, badge: '', featured: true, model3d: '',
        colors: cols('grey', 'black', 'teal', 'pink'), short: 'Beshik, yurish bloki va avtokreslo.',
        description: "Uchta modulli (beshik, yurish bloki, avtokreslo) universal kalyaska. Katta g'ildiraklar va amortizatsiya shahar va yo'l uchun mos.",
        specs: { Yosh: '0-3 yosh', Ogirligi: '9.5 kg', Tarkibi: '3 ta modul', Kafolat: '6 oy' }, images: [] },
      { id: 'p-str2', category_id: 'c-stroller', title: 'Yengil sayohat kalyaskasi', brand: 'BabyCheer', price: 890000, old_price: 0, stock: 20, badge: '', featured: false, model3d: '',
        colors: cols('black', 'blue', 'red'), short: "Bir qo'l bilan yig'iladi, 6 kg.",
        description: "Samolyot va avtomobil bagajiga sig'adigan ixcham kalyaska.", specs: { Yosh: '6 oy - 3 yosh', Ogirligi: '6 kg', Yigilishi: "Bir qo'l bilan", Kafolat: '6 oy' }, images: [] },
      { id: 'p-trk1', category_id: 'c-trike', title: 'Velokalyaska 5/1', brand: 'BabyCheer', price: 1390000, old_price: 1590000, stock: 17, badge: 'Chegirma', featured: true, model3d: '',
        colors: cols('green', 'pink', 'blue', 'orange'), short: 'Soyabon, savat, ota-ona tutqichi.',
        description: "Ota-ona boshqaradigan tutqich, soyabon, xavfsizlik kamari va savat. Bola o'sgani sari oddiy velosipedga aylanadi.",
        specs: { Yosh: '1-5 yosh', Ogirligi: '7 kg', "Yuk ko'tarish": '25 kg gacha', Rejimlar: '5 xil' }, images: [] },
      { id: 'p-mot1', category_id: 'c-moto', title: 'Bolalar elektromototsikli', brand: 'BabyCheer', price: 1690000, old_price: 1890000, stock: 9, badge: '', featured: true, model3d: '',
        colors: cols('red', 'black', 'blue', 'white'), short: "Ovoz, chiroq, yordamchi g'ildirak.",
        description: "Ovozli va chiroqli elektromototsikl, yordamchi g'ildiraklar bilan barqaror. Pedal bilan ishga tushadi.",
        specs: { Yosh: '2-5 yosh', Batareya: '6V 4.5Ah', Tezlik: '3 km/soat', "Yuk ko'tarish": '25 kg gacha' }, images: [] },
      { id: 'p-scr1', category_id: 'c-scooter', title: "Samokat, 3 g'ildirakli", brand: 'BabyCheer', price: 390000, old_price: 0, stock: 30, badge: '', featured: false, model3d: '',
        colors: cols('orange', 'teal', 'pink', 'green'), short: 'Balandligi sozlanadi, alyuminiy.',
        description: "Balandligi sozlanadigan, keng taxtali va tormozli samokat.", specs: { Yosh: '3-8 yosh', Ogirligi: '2.4 kg', "Yuk ko'tarish": '50 kg gacha', Material: 'Alyuminiy' }, images: [] },
      { id: 'p-scr2', category_id: 'c-scooter', title: "Samokat, yorug' g'ildirakli", brand: 'BabyCheer', price: 450000, old_price: 520000, stock: 25, badge: '', featured: false, model3d: '',
        colors: cols('pink', 'blue', 'yellow'), short: "Harakatda yonadigan LED g'ildiraklar.",
        description: "LED g'ildiraklar, yig'iladigan konstruksiya.", specs: { Yosh: '4-10 yosh', Ogirligi: '3 kg', "Yuk ko'tarish": '60 kg gacha', Material: 'Alyuminiy' }, images: [] },
    ],
  };
  window.BC_SEED.products.forEach((p) => { p.color = p.colors[0].hex; });
})();
