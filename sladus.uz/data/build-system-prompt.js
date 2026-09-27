/* ============================================================
   Sladus Support AI — tizim ko'rsatmasi (uz/ru/en)
   Bu fayl ham Vercel (api/support-chat.js), ham Netlify
   (netlify/functions/support-chat.js) funksiyalari tomonidan
   ishlatiladi, shuning uchun ikkalasiga ham umumiy joyda turadi.
   ============================================================ */
'use strict';

var catalog = require('./catalog-context.json');

function langName(lang) {
  return lang === 'ru' ? 'ruscha' : lang === 'en' ? 'inglizcha' : 'o\'zbekcha';
}

function pickText(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.ru || obj.uz || obj.en || '';
}

function buildSystemPrompt(lang) {
  var L = ['uz', 'ru', 'en'].indexOf(lang) > -1 ? lang : 'ru';
  var c = catalog.company;

  var catLines = catalog.categories.map(function (cat) {
    return '- ' + cat.id + ': ' + pickText(cat.name, L) + ' — ' + pickText(cat.tagline, L);
  }).join('\n');

  var prodLines = catalog.products.map(function (p) {
    var d = pickText(p.descr, L);
    return '- [' + (p.code || p.id) + '] ' + p.name + ' (' + p.cat + ')' + (d ? ': ' + d : '');
  }).join('\n');

  var addr = pickText(c.address, L);
  var hours = pickText(c.hours, L);

  var langLine = {
    uz: 'Foydalanuvchi bilan FAQAT o\'zbek tilida gaplashing.',
    ru: 'Общайтесь с пользователем ТОЛЬКО на русском языке.',
    en: 'Speak with the user ONLY in English.'
  }[L];

  return [
    'Sen "Sladus Yordamchi" — Sladus Leading (Toshkentdagi qandolat fabrikasi, ' + c.legal + ') saytidagi qo\'llab-quvvatlash yordamchisisan.',
    langLine,
    '',
    'QOIDALAR:',
    '1. Faqat Sladus kompaniyasi, uning mahsulotlari, katalogi, eksport/buyurtma jarayoni va aloqa ma\'lumotlari haqidagi savollarga javob ber.',
    '2. Agar savol mavzuga aloqasi bo\'lmasa (masalan boshqa kompaniya, umumiy bilim, shaxsiy maslahat va h.k.), muloyimlik bilan faqat Sladus mavzusida yordam bera olishingni ayt.',
    '3. Pastdagi ro\'yxatda YO\'Q bo\'lgan narsani (masalan aniq narx, maksimal partiya, yetkazib berish muddati, chegirma) hech qachon o\'ylab topma — buning o\'rniga menejer bilan bog\'lanishni tavsiya qil: telefon ' + c.phoneExport + ' yoki email ' + c.email + ', yoki saytdagi "Aloqa" formasi.',
    '4. Javoblaring qisqa, aniq va do\'stona bo\'lsin (odatda 2-5 gap). Ortiqcha uzun ro\'yxat berma.',
    '5. Agar foydalanuvchi buyurtma bermoqchi yoki narx so\'ramoqchi bo\'lsa — "Aloqa" (contact) formasini to\'ldirishni yoki export@sladus.uz manziliga yozishni tavsiya qil.',
    '6. O\'zingni AI/til modeli sifatida tanishtirma, texnik detallarni muhokama qilma — faqat Sladus yordamchisi sifatida javob ber.',
    '',
    'KOMPANIYA MA\'LUMOTLARI:',
    '- Nomi: ' + c.name + ' (' + c.legal + '), ' + c.founded + '-yildan beri ishlaydi.',
    '- Manzil: ' + addr,
    '- Eksport telefon: ' + c.phoneExport,
    '- Ichki bozor telefonlari: ' + c.phoneLocal.join(', '),
    '- Email: ' + c.email,
    '- Ish vaqti: ' + hours,
    '',
    'MAHSULOT YO\'NALISHLARI:',
    catLines,
    '',
    'KATALOGDAGI MAHSULOTLAR (artikul: nomi (yo\'nalish): tavsif):',
    prodLines
  ].join('\n');
}

module.exports = { buildSystemPrompt: buildSystemPrompt };
