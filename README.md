# IMPRO — Portfolio Website

To'liq statik (server yo'q, Node yo'q, React yo'q — faqat HTML/CSS/JavaScript)
animatsiyali portfolio sayt + brauzerda ishlaydigan admin panel. Kontent
(https://improuz-seven.vercel.app/ — haqiqiy IMPRO loyihasidan olingan
ma'lumotlar) `assets/js/data.js` faylida oddiy JavaScript obyekti sifatida
saqlanadi.

## Qanday ochish

Hech qanday o'rnatish, `npm install` yoki server kerak emas:

- **Eng oddiy usul:** `index.html` faylini shunchaki ikki marta bosib, brauzerda oching.
- **Yoki:** loyihani istalgan statik hostingga (Netlify, Vercel — static mode,
  GitHub Pages, oddiy hosting/cPanel) papkani bo'lgancha yuklab qo'ying.

Admin panel: `admin/index.html` (yoki saytdan `admin/` papkaga o'tish).
Standart parol: `impro2024`.

## Loyiha tuzilishi

```
index.html              Asosiy sahifa (statik HTML)
assets/
  css/main.css            Asosiy shablon uslubi (DevFolio)
  css/animations.css       Qo'shimcha animatsiyalar (scroll-progress, hover effektlar va h.k.)
  js/data.js                Saytning barcha matni/rasm-yo'llari/linklari (JS obyekt)
  js/render.js               data.js'ni sahifaga joylashtiradi (server shart emas)
  js/main.js                 Shablonning asosiy skripti (AOS, Isotope, Swiper, Typed.js ...)
  js/enhance.js               Qo'shimcha animatsiya effektlari
  img/, vendor/                Rasmlar va kutubxonalar (Bootstrap, AOS va h.k.)
admin/
  index.html              Admin panel (login + boshqaruv paneli)
  admin.js                 Admin panel mantiqi (to'liq client-side)
  admin.css                 Admin panel uslubi
```

## Admin panel qanday ishlaydi (muhim!)

Sayt **to'liq statik** bo'lgani uchun (hech qanday backend/server yo'q), admin
paneldagi tahrirlar avval faqat **shu brauzer xotirasida (localStorage)**
qoralama sifatida saqlanadi — boshqa qurilma yoki tashrif buyuruvchilarga
avtomatik ko'rinmaydi.

O'zgarishlarni haqiqatan ham nashr qilish (hammaga ko'rinishi) uchun:

1. Admin panelning **"Nashr qilish"** bo'limiga o'ting.
2. **"data.js yuklab olish"** tugmasini bosing — yangilangan kontent bilan
   `data.js` fayli kompyuteringizga yuklanadi.
3. Shu faylni loyihadagi `assets/js/data.js` o'rniga qo'ying.
4. Saytni qayta yuklang / qayta deploy qiling (masalan Netlify'ga papkani
   qayta tashlang).

Tahrirlash paytida **"Saytni ko'rish (qoralama bilan)"** havolasi orqali
o'zgarishlarni nashr qilishdan oldin, xuddi shu brauzerda, jonli ko'rib
chiqishingiz mumkin.

### Rasm qo'shish

Admin paneldagi rasm maydonlariga fayl tanlaganingizda, rasm avtomatik
ravishda matn ko'rinishiga (base64) o'giriladi va to'g'ridan-to'g'ri
`data.js` ichida saqlanadi — alohida rasm fayllarini serverga yuklashning
hojati yo'q. Katta hajmdagi rasmlarni oldindan siqib olish tavsiya etiladi.

### Xavfsizlik haqida eslatma

Admin panel paroli faqat qulaylik uchun — sahifa manba kodida ko'rinadi va
haqiqiy xavfsizlikni ta'minlamaydi (chunki server yo'q, tekshiruvni ham
faqat brauzer tomonida bajarish mumkin). Agar chinakam himoyalangan,
serverga ulangan admin panel kerak bo'lsa, aytib qo'ying — Node.js/Express
asosidagi versiyasi ham qilib berilgan (parol hash qilinadi, sessiya
tokeni bilan himoyalangan), lekin u ishlashi uchun serverni ishga tushirish
(`npm install && npm start`) kerak bo'ladi.
