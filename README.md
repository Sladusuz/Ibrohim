# IMPRO — Portfolio Website

Animatsiyali portfolio sayt + admin panel. Kontent (impro loyihasidagi haqiqiy
ma'lumotlar — https://improuz-seven.vercel.app/) `data/content.json` faylida
saqlanadi va admin panel orqali brauzerdan tahrirlanadi (kod yozmasdan).

## Texnologiyalar

- **Frontend:** DevFolio (BootstrapMade) shabloni asosida — Bootstrap 5, AOS
  scroll-animatsiyalari, Typed.js, Swiper, GLightbox, Isotope, PureCounter,
  ustiga qo'shilgan qo'shimcha CSS/JS animatsiyalar (`assets/css/animations.css`,
  `assets/js/enhance.js`): scroll-progress bar, hero logotipning suzib
  yurishi, portfolio kartalarining sichqoncha bo'yicha egilishi va h.k.
- **Backend:** Node.js + Express, EJS shablonlashtirish (sahifa har so'rovda
  `data/content.json`dan render qilinadi).
- **Admin panel:** `/admin` — login qilib, saytning barcha bo'limlarini
  (Hero, Men haqimda, Xizmatlar, Statistika, Portfolio, Sharhlar, Aloqa,
  Footer) tahrirlash, rasm yuklash va parolni almashtirish mumkin.

## Ishga tushirish

```bash
npm install
cp .env.example .env   # kerak bo'lsa ADMIN_USERNAME / ADMIN_PASSWORD ni o'zgartiring
npm start
```

Sayt: http://localhost:3000
Admin panel: http://localhost:3000/admin

Standart admin login/parol (`.env.example`dagi qiymatlar): `admin` / `impro2024`.
Birinchi marta ishga tushganda shu ma'lumotlar bilan `data/admin.json` avtomatik
yaratiladi (parol hash qilib saqlanadi). **Ishga tushirgach admin paneldagi
"Parol" bo'limidan darhol parolni almashtiring.**

## Loyiha tuzilishi

```
server.js            Express server
routes/auth.js        Login/logout
routes/admin.js        Kontentni o'qish/yozish, rasm yuklash, parol almashtirish
middleware/auth.js      Sessiya tekshiruvi
utils/auth.js          Parol hash (scrypt) va sessiya token (HMAC)
utils/content.js       content.json bilan ishlash
views/index.ejs         Frontend sahifa shabloni
data/content.json       Saytning barcha matn/rasm/link kontenti
public/assets/          CSS, JS, rasm va vendor kutubxonalar
public/admin/           Admin panel (login + dashboard, vanilla JS)
```

## Production'ga chiqarish

- `NODE_ENV=production` qiling — session cookie faqat HTTPS orqali yuboriladi.
- `data/` papkasini (ayniqsa `content.json`, `admin.json`) va
  `public/assets/img/uploads/` papkasini har doim saqlanadigan diskda saqlang
  (masalan Render/Railway/VPS + persistent volume). Vercel kabi serverless
  muhitlarda fayl yozish vaqtinchalik bo'lgani uchun Node server VPS yoki
  shunga o'xshash doimiy muhitda ishga tushirilishi tavsiya etiladi.
