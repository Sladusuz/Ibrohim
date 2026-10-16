'use strict';
// Impro IT asosiy sayti ma'lumotini yaratadi: data/site.json
const fs = require('fs');
const path = require('path');
global.window = {};
require('../public/templates.js');
const d = window.getTemplate('kompaniya');
d.template = 'impro';
d.company = { name: 'Impro IT', logo: 'I', tagline: 'Veb-sayt, mobil ilova va Telegram botlar. Tez, sifatli, kafolat bilan.' };
d.theme = Object.assign(d.theme, { preset: 'dark', font: 'modern', radius: 'round', bg: 'full', switcher: true });
d.nav = { style: 'pill', cta: 'Bepul maslahat', ctaLink: '#aloqa', search: false };
d.account = { enabled: true, requireOrder: true, requireBooking: false };
d.orders = { enabled: true, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 };
d.contacts = { phone: '+998 33 623 33 13', email: 'chempme@gmail.com', address: "Toshkent, Amir Temur ko'chasi 1", hours: 'Dush–Shan, 9:00–18:00', telegram: '', instagram: '' };
d.footer = { text: 'Barcha huquqlar himoyalangan.', links: [{ label: 'Sayt yaratish', url: '/yaratish.html' }, { label: 'Kabinet', url: '/kabinet.html' }] };
const hero = d.sections.find((s) => s.type === 'hero');
Object.assign(hero, { titleStart: 'Biznesingiz uchun', titleEnd: 'yaratamiz', text: "Impro IT: veb-sayt, mobil ilova va Telegram botlarni g'oyadan ishga tushirishgacha tez, sifatli va kafolat bilan tayyorlaymiz. Yoki saytingizni o'zingiz yarating.", cta1Text: 'Saytni o\'zim yarataman', cta1Link: '/yaratish.html', cta2Text: 'Xizmatlarni ko\'rish', cta2Link: '#xizmat' });
const out = [];
for (const s of d.sections) {
  if (s.type === 'pricing') continue;
  out.push(s);
  if (s.id === 'xizmat') {
    out.push({ id: 'shablon', type: 'cards', enabled: true, navLabel: 'Shablonlar', eyebrow: 'Tayyor shablonlar', title: "Kasbingizga mos sayt, bir necha daqiqada", text: "Shablonni tanlang, ma'lumotlaringizni kiriting va tayyor saytni yuklab oling. Hammasi o'zbek tilida.",
      items: window.TEMPLATES.map((t) => ({ title: t.name, badge: t.badge || t.cat, text: t.desc, image: t.thumb, link: `/yaratish.html?t=${t.id}` })) });
    out.push({ id: 'yaratish', type: 'cta', enabled: true, navLabel: 'Sayt yaratish', eyebrow: 'Sayt konstruktori', title: "Saytingizni o'zingiz yarating", text: "Hisob oching, shablonni tanlang va tahrirlang. Saytlaringiz hisobingizda saqlanadi, istalgan qurilmadan davom ettirasiz.", buttonText: 'Yaratishni boshlash', buttonLink: '/yaratish.html', countdownTo: '', image: '' });
  }
  if (s.id === 'jarayon') {
    out.push({ id: 'narx', type: 'products', enabled: true, navLabel: 'Narxlar', eyebrow: 'Narxlar', title: 'Tayyor paketlar', text: 'Narxlar oldindan aniq. Tanlang va buyurtma bering.', mode: 'cart', buttonText: 'Buyurtma', columns: '3', search: false, filters: true, sort: false, items: [
      { id: 'start', name: 'Start sayt', price: 2500000, oldPrice: 0, category: 'Veb-sayt', badge: '', description: '5 sahifagacha vizitka sayt, mobilga moslashgan, aloqa formasi bilan.', image: '/img/t/kompaniya/p-start.svg', stock: '', active: true },
      { id: 'dokon', name: "Onlayn do'kon", price: 6900000, oldPrice: 0, category: 'Veb-sayt', badge: "ENG KO'P TANLANADI", description: "Katalog, savat, admin panel va Telegram xabarnoma bilan to'liq do'kon.", image: '/img/t/kompaniya/p-dokon.svg', stock: '', active: true },
      { id: 'bot', name: 'Telegram bot', price: 3200000, oldPrice: 0, category: 'Bot', badge: '', description: 'Buyurtma va so\'rov qabul qiluvchi tayyor bot, admin xabarnomasi bilan.', image: '/img/t/kompaniya/p-bot.svg', stock: '', active: true },
      { id: 'ilova', name: 'Mobil ilova', price: 15000000, oldPrice: 0, category: 'Ilova', badge: '', description: "iOS va Android uchun ilova: dizayn, ishlab chiqish va e'lon qilish.", image: '/img/t/kompaniya/p-ilova.svg', stock: '', active: true },
      { id: 'dizayn', name: 'UI/UX dizayn', price: 1800000, oldPrice: 0, category: 'Dizayn', badge: '', description: 'Sayt yoki ilova uchun zamonaviy interfeys dizayni va prototip.', image: '/img/t/kompaniya/p-dizayn.svg', stock: '', active: true },
      { id: 'yordam', name: 'Oylik texnik yordam', price: 900000, oldPrice: 0, category: 'Xizmat', badge: '', description: 'Yangilash, xavfsizlik, zaxira nusxa va tezkor tuzatishlar.', image: '/img/t/kompaniya/p-yordam.svg', stock: '', active: true },
    ] });
  }
}
d.sections = out;
Object.assign(d.sections.find((s) => s.type === 'contact'), { form: 'order', askAddress: false, payOptions: [], submitText: 'Yuborish' });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'site.json'), JSON.stringify(d, null, 2));
console.log('data/site.json yaratildi:', d.sections.map((s) => s.id).join(', '));
