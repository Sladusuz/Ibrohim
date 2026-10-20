'use strict';
// Huquqiy sahifalar (oferta, maxfiylik, qaytarish): to'lov tizimlari (Payme, Click) shularni talab qiladi.
// DIQQAT: bu umumiy namuna matn. Yuridik shaxs rekvizitlarini to'ldiring va yurist bilan tekshiring.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = function legalPages({ site, domain }) {
  const c = site.contacts || {}, name = (site.company && site.company.name) || 'Impro IT';
  const L = site.legal || {};
  const entity = L.entity || `${name} (yuridik shaxs/YaTT nomi shu yerga yoziladi)`;
  const req = [['Tashkilot', entity], ['STIR (INN)', L.inn || '[STIR raqami]'], ['Manzil', L.address || c.address || '[manzil]'], ['Telefon', c.phone || ''], ['Email', c.email || ''], ['Bank rekvizitlari', L.bank || "[hisob raqami, bank, MFO]"]].filter(([, v]) => v);
  const reqHtml = `<table>${req.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
  const url = `https://${domain}`;
  const docs = {
    offerta: { title: 'Ommaviy oferta', h: [
      ['1. Umumiy qoidalar', `Ushbu hujjat ${esc(name)} (keyingi o'rinlarda «Ijrochi») tomonidan ${url} saytida ko'rsatiladigan xizmatlar va raqamli mahsulotlarga nisbatan ommaviy oferta hisoblanadi. Saytda buyurtma berish, ro'yxatdan o'tish yoki to'lov qilish ushbu shartlarni to'liq qabul qilishni (aksept) bildiradi.`],
      ['2. Xizmat va mahsulotlar', `Ijrochi quyidagilarni taqdim etadi: veb-sayt, onlayn do'kon, mobil ilova va Telegram bot ishlab chiqish; tayyor sayt shablonlarini sozlash va sotish (raqamli mahsulot); sayt joylash (hosting), domen ulash va texnik yordam; Telegram bot konstruktori. Xizmatlarning tarkibi, narxi va muddati saytda yoki buyurtma anketasida alohida ko'rsatiladi.`],
      ['3. Narx va to\'lov', `Narxlar saytda so'mda yoki AQSH dollarida ko'rsatiladi. Dollardagi narx to'lov kuni ${esc(name)} belgilagan kurs bo'yicha so'mga o'giriladi. To'lov Payme, Click yoki bank kartasiga o'tkazma orqali amalga oshiriladi. To'lov qabul qilingandan keyin buyurtma bajarilishi boshlanadi (raqamli mahsulot uchun: darhol).`],
      ['4. Tayyor sayt shabloni (raqamli mahsulot)', `Mijoz shablonni bepul sozlaydi va oldindan ko'radi. To'lovdan keyin tayyor saytni fayl sifatida yuklab olish, ${esc(domain)} subdomenida joylash va o'z domenini ulash imkoniyati ochiladi. Shablon dizayni va kodi mualliflik huquqi bilan himoyalangan; mijozga o'z biznesi uchun foydalanish huquqi beriladi, qayta sotish yoki shablon sifatida tarqatish taqiqlanadi. Shablondagi fotosuratlar erkin litsenziyali (CC0) manbalardan olingan.`],
      ['5. Individual loyihalar', `Murakkab loyihalar (sayt, ilova, bot) bo'yicha aniq narx, muddat va ish hajmi anketa va suhbat natijasida kelishiladi hamda yozma yoki elektron tarzda tasdiqlanadi.`],
      ['6. Tomonlarning majburiyatlari', `Ijrochi xizmatni kelishilgan hajm va muddatda bajaradi, mijoz ma'lumotlarini uchinchi shaxslarga bermaydi. Mijoz to'g'ri ma'lumot taqdim etadi, saytga joylangan matn, rasm va logotiplar uchun huquqlarga ega ekanini kafolatlaydi, qonunga zid kontent joylamaydi.`],
      ['7. Mas\'uliyat', `Ijrochi mijoz joylagan kontent, uchinchi tomon xizmatlari (Telegram, to'lov tizimlari, hosting) uzilishlari va mijozning noto'g'ri harakatlari uchun javobgar emas. Ijrochining javobgarligi mijoz to'lagan summa bilan cheklanadi.`],
      ['8. Nizolar', `Nizolar muzokaralar yo'li bilan hal etiladi, kelishuvga erishilmasa, O'zbekiston Respublikasi qonunchiligiga muvofiq sudda ko'riladi.`],
      ['9. Rekvizitlar', reqHtml],
    ] },
    maxfiylik: { title: 'Maxfiylik siyosati', h: [
      ['1. Qanday ma\'lumotlar yig\'iladi', `Ro'yxatdan o'tishda: ism, telefon raqami, email (ixtiyoriy). Buyurtma va arizalarda: ism, telefon, manzil, izoh. Sayt yaratishda: siz kiritgan matn va rasmlar. Telegram bot konstruktorida: bot tokeni (faqat serverda, shifrlanmagan holda ko'rsatilmaydi). Texnik ma'lumotlar: sahifa ko'rishlar soni.`],
      ['2. Nima uchun ishlatiladi', `Buyurtmani bajarish, siz bilan bog'lanish, to'lovni tasdiqlash, hisobingizni yuritish va xizmat sifatini oshirish uchun. Ma'lumotlaringiz reklama maqsadida uchinchi shaxslarga sotilmaydi.`],
      ['3. Uchinchi tomonlar', `Faqat zarur hollarda: to'lov tizimlari (Payme, Click), Telegram (xabarnomalar va bot), hosting provayderi, AI yordamchi ishlatilsa — biznes tavsifi matni sun'iy intellekt xizmatiga yuboriladi.`],
      ['4. Saqlash va xavfsizlik', `Parollar qaytarib bo'lmaydigan shifrlangan (hash) holda saqlanadi. Ma'lumotlar serverda saqlanadi, muntazam zaxira nusxa olinadi. Ma'lumotlarni ishlatish O'zbekiston Respublikasining shaxsga doir ma'lumotlar to'g'risidagi qonunchiligiga muvofiq amalga oshiriladi.`],
      ['5. Cookie va brauzer xotirasi', `Sayt hisobga kirishni, savatni va tanlangan mavzuni eslab qolish uchun brauzer xotirasidan (localStorage) foydalanadi. Ba'zi saytlarda mijoz o'z xohishiga ko'ra statistika vositalarini (Google Analytics, Yandex Metrika, Meta Pixel) yoqishi mumkin.`],
      ['6. Sizning huquqlaringiz', `Ma'lumotlaringizni ko'rish, tuzatish yoki o'chirishni so'rash huquqiga egasiz: ${esc(c.email || '')} ${esc(c.phone || '')} orqali murojaat qiling. Hisobingizni kabinetdan o'zingiz ham o'chira olasiz.`],
      ['7. Aloqa', reqHtml],
    ] },
    qaytarish: { title: "To'lov va qaytarish shartlari", h: [
      ['1. To\'lov usullari', `Payme, Click yoki bank kartasiga o'tkazma. To'lov qabul qilinganda mijozga tasdiq ko'rsatiladi (qo'lda o'tkazmada administrator tasdiqlaydi, odatda ish vaqtida bir necha soat ichida).`],
      ['2. Tayyor sayt shabloni', `Tayyor saytni yuklab olishdan yoki joylashdan **oldin** pul qaytarish so'rovi qabul qilinadi (to'lovdan keyin 3 kun ichida). Sayt yuklab olingan yoki joylangan bo'lsa, raqamli mahsulot topshirilgan hisoblanadi va to'lov qaytarilmaydi, texnik nosozlik bundan mustasno: nosozlikni bepul tuzatamiz yoki pulni qaytaramiz.`],
      ['3. Individual loyihalar', `Ish boshlanmagan bo'lsa, to'lov to'liq qaytariladi. Ish boshlangan bo'lsa, bajarilgan qismga mutanosib summa ushlab qolinadi. Aniq shartlar shartnomada belgilanadi.`],
      ['4. Qanday qaytariladi', `${esc(c.email || '')} manziliga yoki ${esc(c.phone || '')} raqamiga murojaat qiling: ism, telefon va buyurtma raqamini yozing. Qaytarish to'lov qilingan usul orqali, odatda 3–10 ish kuni ichida amalga oshiriladi.`],
      ['5. Aloqa', reqHtml],
    ] },
  };
  const page = (slug, d) => `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.title)} · ${esc(name)}</title><meta name="description" content="${esc(d.title)}: ${esc(name)} xizmatlari shartlari. Veb-sayt, Telegram bot va mobil ilova buyurtmalari uchun amal qiladi."><meta property="og:image" content="${url}/img/og.jpg"><meta property="og:title" content="${esc(d.title)} · ${esc(name)}"><meta property="og:type" content="website"><link rel="canonical" href="${url}/${slug}.html"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>:root{color-scheme:light dark;--bg:#f8f5ee;--ink:#15110a;--muted:#6b6355;--line:#e6dfd0;--acc:#8a6a2c}@media(prefers-color-scheme:dark){:root{--bg:#0a0a0b;--ink:#efe9dc;--muted:#9b958a;--line:#2a2824;--acc:#e6d3a3}}
*{box-sizing:border-box}body{margin:0;font:16px/1.7 Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--ink)}header{border-bottom:1px solid var(--line)}header div,main{max-width:820px;margin:auto;padding:16px 22px}header a{font-weight:800;text-decoration:none;color:var(--ink)}main{padding-bottom:70px}h1{font-size:clamp(28px,5vw,40px);letter-spacing:-.03em;margin:26px 0 6px}h2{font-size:19px;margin:30px 0 6px}p{color:var(--muted);margin:0 0 8px}table{border-collapse:collapse;width:100%;margin-top:6px}th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);font-size:15px;vertical-align:top}th{width:38%;color:var(--muted);font-weight:600}nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:34px;font-size:14px}nav a{color:var(--acc)}.note{margin-top:30px;padding:12px 14px;border:1px dashed var(--line);border-radius:12px;font-size:13.5px;color:var(--muted)}h1,h2{font-family:'Instrument Serif',Georgia,serif;font-weight:400}</style></head>
<body><header><div><a href="/">${esc(name)}</a></div></header><main><h1>${esc(d.title)}</h1><p style="font-size:14px">Oxirgi yangilanish: ${new Date().toISOString().slice(0, 10)}</p>${d.h.map(([h, t]) => `<h2>${h}</h2>${/^<table/.test(t) ? t : `<p>${t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')}</p>`}`).join('')}<nav><a href="/offerta.html">Ommaviy oferta</a><a href="/maxfiylik.html">Maxfiylik siyosati</a><a href="/qaytarish.html">To'lov va qaytarish</a><a href="/">Bosh sahifa</a></nav></main></body></html>`;
  return Object.fromEntries(Object.entries(docs).map(([slug, d]) => [slug + '.html', page(slug, d)]));
};
