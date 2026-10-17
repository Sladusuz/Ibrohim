'use strict';
// Impro IT asosiy sayti ma'lumotini yaratadi: data/site.json
const fs = require('fs');
const path = require('path');
global.window = {};
require('../public/templates.js');
for (const f of fs.readdirSync(path.join(__dirname, '..', 'public')).filter((x) => /^tpl-.*\.js$/.test(x)).sort()) require('../public/' + f);
const d = window.getTemplate('kompaniya');
d.template = 'impro';
d.company = { name: 'Impro IT', logo: 'I', tagline: 'Veb-sayt, mobil ilova va Telegram botlar. Tez, sifatli, kafolat bilan.' };
d.theme = Object.assign(d.theme, { preset: 'dark', font: 'display', radius: 'round', bg: 'plain', look: 'cinema', motion: true, switcher: false });
d.nav = { style: 'pill', cta: 'Bepul maslahat', ctaLink: '#brief-open', search: false };
d.account = { enabled: true, requireOrder: true, requireBooking: false };
d.orders = { enabled: true, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 };
d.contacts = { phone: '+998 33 623 33 13', email: 'chempme@gmail.com', address: "Toshkent, Amir Temur ko'chasi 1", hours: 'Dush–Shan, 9:00–18:00', telegram: '', instagram: '' };
d.footer = { text: 'Barcha huquqlar himoyalangan.', links: [{ label: 'Sayt yaratish', url: '/yaratish.html' }, { label: 'Kabinet', url: '/kabinet.html' }] };
const hero = d.sections.find((s) => s.type === 'hero');
Object.assign(hero, { image: '/img/tpl/restoran.jpg', badge: "Yangi loyihalar uchun ochiqmiz", titleStart: 'Biznesingiz uchun *kelajak* saytlari', words: [], titleEnd: '', text: "Impro IT: veb-sayt, mobil ilova va Telegram botlarni g'oyadan ishga tushirishgacha tez, sifatli va kafolat bilan tayyorlaymiz. Xohlasangiz, saytni o'zingiz ham yarata olasiz.", cta1Text: 'Loyihani buyurtma qilish', cta1Link: '#brief-open', cta2Text: "Saytni o'zim yarataman", cta2Link: '/yaratish.html' });
const out = [];
for (const s of d.sections) {
  if (s.type === 'pricing') continue;
  out.push(s);
  if (s.id === 'xizmat') {
    const tb = (s.items || []).find((x) => /Telegram bot/i.test(x.title)); if (tb) { tb.link = '/bot.html'; tb.text = "Buyurtma, bron va to'lovlarni avtomatlashtiring. O'zingiz ham bot yaratishingiz mumkin: katalog va mini do'kon bilan."; }
    out.push({ id: 'shablon', type: 'showcase', enabled: true, navLabel: 'Shablonlar', eyebrow: 'Tayyor shablonlar', title: "Kasbingizga mos sayt, *bir necha daqiqada*", text: "Shablonni tanlang, ma'lumotlaringizni kiriting va tayyor saytni yuklab oling. Hammasi o'zbek tilida.",
      items: window.TEMPLATES.slice(0, 14).map((t) => ({ title: t.name, tag: t.cat, image: t.thumb, link: `/yaratish.html?t=${t.id}` })) });
    out.push({ id: 'yaratish', type: 'cta', fx: true, enabled: true, navLabel: 'Sayt yaratish', eyebrow: 'Sayt konstruktori', title: "Saytingizni *o'zingiz* yarating", text: "Hisob oching, shablonni tanlang va tahrirlang. Saytlaringiz hisobingizda saqlanadi, istalgan qurilmadan davom ettirasiz.", buttonText: 'Yaratishni boshlash', buttonLink: '/yaratish.html', countdownTo: '', image: '' });
    out.push({ id: 'botsec', type: 'cta', fx: true, enabled: true, navLabel: 'Telegram bot', eyebrow: 'Bot konstruktori', title: "Telegram *botingizni* o'zingiz yarating", text: "Token kiriting: bot darrov ishlaydi. Katalog, savat, buyurtmalar va Telegram ichidagi mini do'kon. Kod yozish shart emas.", buttonText: 'Bot yaratishni boshlash', buttonLink: '/bot.html', countdownTo: '', image: '' });
  }
  if (s.id === 'jarayon') {
    out.push({ id: 'narx', type: 'products', enabled: true, navLabel: 'Narxlar', eyebrow: 'Narxlar', title: 'Tayyor paketlar', text: 'Narxlar oldindan aniq. Tanlang va buyurtma bering.', mode: 'brief', buttonText: 'Buyurtma', columns: '3', search: false, filters: true, sort: false, items: [
      { id: 'start', name: 'Start sayt', price: 2500000, oldPrice: 0, category: 'Veb-sayt', badge: '', description: '5 sahifagacha vizitka sayt, mobilga moslashgan, aloqa formasi bilan.', image: '/img/p/dasturchi-2.jpg', stock: '', active: true },
      { id: 'dokon', name: "Onlayn do'kon", price: 6900000, oldPrice: 0, category: 'Veb-sayt', badge: "ENG KO'P TANLANADI", description: "Katalog, savat, admin panel va Telegram xabarnoma bilan to'liq do'kon.", image: '/img/p/elektronika-2.jpg', stock: '', active: true },
      { id: 'bot', name: 'Telegram bot', price: 3200000, oldPrice: 0, category: 'Bot', badge: '', description: 'Buyurtma va so\'rov qabul qiluvchi tayyor bot, admin xabarnomasi bilan.', image: '/img/p/ilova-3.jpg', stock: '', active: true },
      { id: 'ilova', name: 'Mobil ilova', price: 15000000, oldPrice: 0, category: 'Ilova', badge: '', description: "iOS va Android uchun ilova: dizayn, ishlab chiqish va e'lon qilish.", image: '/img/p/ilova-2.jpg', stock: '', active: true },
      { id: 'dizayn', name: 'UI/UX dizayn', price: 1800000, oldPrice: 0, category: 'Dizayn', badge: '', description: 'Sayt yoki ilova uchun zamonaviy interfeys dizayni va prototip.', image: '/img/p/dizayner-2.jpg', stock: '', active: true },
      { id: 'yordam', name: 'Oylik texnik yordam', price: 900000, oldPrice: 0, category: 'Xizmat', badge: '', description: 'Yangilash, xavfsizlik, zaxira nusxa va tezkor tuzatishlar.', image: '/img/p/startap-2.jpg', stock: '', active: true },
    ] });
  }
}
const bi = out.findIndex((s) => s.id === 'narx');
out.splice(bi + 1, 0, {
  id: 'brief', type: 'brief', enabled: true, navLabel: 'Buyurtma', eyebrow: 'Loyihani boshlang', title: 'Xohishlaringizni ayting, biz amalga oshiramiz',
  text: "3 daqiqalik anketa: nima kerakligini, qanday ko'rinish yoqishini va qancha byudjet borligini aytasiz. Qolganini biz hal qilamiz va tez orada aloqaga chiqamiz.",
  buttonText: "Anketani to'ldirish", promise: "15 daqiqada aloqaga chiqamiz", showEstimate: true,
  usp: ["Bepul maslahat va g'oyalar: mutaxassis sizga eng mos yechimni tanlab beradi", "Aniq narx va muddat suhbatdan keyin, shartnoma bilan", "Natijaga kafolat va ishga tushgandan keyin ham yordam"],
  services: [
    { id: 'start', name: 'Vizitka / korporativ sayt', desc: 'Kompaniyangiz yoki xizmatingizni tanishtiruvchi 5 sahifagacha sayt', icon: 'globe', price: 2500000, days: '5–10 kun' },
    { id: 'dokon', name: "Onlayn do'kon", desc: "Katalog, savat, buyurtma va admin panel bilan to'liq do'kon", icon: 'cart', price: 6900000, days: '2–3 hafta' },
    { id: 'bot', name: 'Telegram bot', desc: "Buyurtma, to'lov va mijozlar bilan aloqani avtomatlashtirish", icon: 'send', price: 3200000, days: '1–2 hafta' },
    { id: 'ilova', name: 'Mobil ilova', desc: "iOS va Android uchun ilova: dizayn, ishlab chiqish, e'lon qilish", icon: 'phone', price: 15000000, days: '1–2 oy' },
    { id: 'dizayn', name: 'UI/UX dizayn', desc: 'Sayt yoki ilova uchun zamonaviy interfeys va prototip', icon: 'design', price: 1800000, days: '1–2 hafta' },
    { id: 'yordam', name: 'Texnik yordam', desc: "Mavjud saytni yangilash, xavfsizlik va tezkor tuzatishlar", icon: 'tool', price: 900000, days: 'Oyiga' },
  ],
  features: [
    { name: 'Admin panel', price: 800000, types: 'start,dokon,bot' }, { name: "Ko'p tillilik (uz/ru/en)", price: 600000, types: 'start,dokon,ilova' },
    { name: 'SEO sozlash va Google ro\'yxati', price: 500000, types: 'start,dokon' }, { name: "Onlayn to'lov (Click, Payme)", price: 900000, types: 'dokon,bot,ilova' },
    { name: 'Telegram xabarnoma', price: 200000, types: 'start,dokon' }, { name: "Mijozlar hisobi (login/ro'yxat)", price: 1200000, types: 'dokon,ilova' },
    { name: 'Blog va yangiliklar', price: 500000, types: 'start' }, { name: 'Onlayn bron / yozilish', price: 700000, types: 'start,bot,ilova' },
    { name: 'Chat va qo\'ng\'iroq tugmalari', price: 150000, types: 'start,dokon' }, { name: 'Analitika (Google, Meta Pixel)', price: 300000, types: 'start,dokon' },
    { name: "Mahsulotlarni Excel'dan yuklash", price: 400000, types: 'dokon' }, { name: 'Push-xabarnomalar', price: 600000, types: 'ilova' },
    { name: 'Logotip va brend uslubi', price: 700000, types: '' }, { name: 'Domen va hosting 1 yil', price: 350000, types: 'start,dokon' }, { name: 'Matn va rasmlarni tayyorlash', price: 500000, types: '' },
  ],
  styles: [
    { name: 'Zamonaviy neon', desc: "Qorong'i, animatsiyali", c1: '#22d3ee', c2: '#7c5cff' }, { name: 'Toza va yorug\'', desc: 'Oq fon, aniq', c1: '#4f46e5', c2: '#06b6d4' }, { name: 'Minimal', desc: 'Oq-qora, tipografiya', c1: '#111111', c2: '#e8452c' },
    { name: 'Premium', desc: 'Qora va oltin', c1: '#d4a64a', c2: '#17110a' }, { name: 'Tabiiy yashil', desc: 'Yangi va samimiy', c1: '#16a34a', c2: '#84cc16' }, { name: 'Iliq va mayin', desc: 'Pastel ranglar', c1: '#d6457a', c2: '#f08aa8' },
  ],
  references: window.TEMPLATES.map((t) => ({ name: t.name, image: t.thumb })),
  goals: ["Ko'proq mijoz jalb qilish", "Onlayn sotuvni yo'lga qo'yish", 'Brend va ishonchni oshirish', 'Jarayonlarni avtomatlashtirish', "Raqobatchilardan ajralib turish"],
  budgets: ["1–3 mln so'm", "3–7 mln so'm", "7–15 mln so'm", "15 mln so'mdan ko'p", "Maslahat kerak"], deadlines: ['Shoshilinch (1 hafta)', '2–3 hafta', '1 oy', 'Shoshilmayman'],
  languages: ["O'zbekcha", 'Ruscha', 'Inglizcha'], methods: ['Telefon', 'Telegram', 'WhatsApp', 'Email'], times: ['9:00–12:00', '12:00–17:00', '17:00–20:00', 'Istalgan vaqt'],
  fieldsList: ['Savdo', 'Restoran / kafe', "Ta'lim", 'Tibbiyot', "Go'zallik", 'Qurilish', 'Transport', "Xizmat ko'rsatish", 'IT', "Ishlab chiqarish", "Ko'chmas mulk"],
  successTitle: "So'rovingiz qabul qilindi!", successText: "Mutaxassisimiz ish vaqtida 15–30 daqiqa ichida, boshqa vaqtda keyingi ish kuni ertalab siz bilan bog'lanadi. Ko'rishguncha!",
});
d.sections = out;
Object.assign(d.sections.find((s) => s.type === 'contact'), { form: 'message', askAddress: false, payOptions: [], submitText: 'Yuborish', title: 'Savolingiz bormi?', text: "Qisqa savol bo'lsa, shu yerga yozing. Loyiha buyurtma qilmoqchi bo'lsangiz, yuqoridagi anketani to'ldiring." });
for (const id of ['biz', 'yaratish']) { const x = d.sections.find((q) => q.id === id); if (x) x.navLabel = ''; } // menyu 7 tadan oshmasin
// Namunaviy (to'qima) portfolio va sharhlar haqiqiy ma'lumot kiritilguncha o'chirib qo'yiladi (admin paneldan yoqiladi)
for (const id of ['ishlar', 'fikr']) { const x = d.sections.find((q) => q.id === id); if (x) x.enabled = false; }
fs.writeFileSync(path.join(__dirname, '..', 'data', 'site.json'), JSON.stringify(d, null, 2));
console.log('data/site.json yaratildi:', d.sections.map((s) => s.id).join(', '));
