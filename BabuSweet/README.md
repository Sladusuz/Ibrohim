# BabuSweet

## Ishga tushirish (kompyuterda)
1. Node.js o'rnating (18 yoki yangi): https://nodejs.org
2. Papka ichida terminal oching va yozing:  `node server.js`
3. Brauzerda oching:
   - Sayt:  http://localhost:3000
   - Admin: http://localhost:3000/admin   (birinchi kirishda o'zingiz parol yaratasiz)

Boshqa port kerak bo'lsa:  `PORT=8080 node server.js`  (Windows PowerShell: `$env:PORT=8080; node server.js`)

## Telefonda ko'rish
Kompyuter va telefon bir Wi-Fi'da bo'lsin. Kompyuterning IP manzilini toping (masalan 192.168.1.20) va telefonda `http://192.168.1.20:3000` oching.

## Ma'lumotlar
- Mahsulotlar, yangiliklar, xabarlar: `data/db.json` (avtomatik yaratiladi)
- Yuklangan rasmlar: `public/assets/uploads/`
- Admin'dagi har bir o'zgarish saytda darhol ko'rinadi.

## Internetga chiqarish
Node serveri ishlaydigan joy kerak (VPS, Render, Railway, Fly.io). Netlify/GitHub Pages'da faqat sayt ko'rinadi, admin ishlamaydi.
`SITE_URL=https://sizning-domen.uz node server.js` — Google uchun to'g'ri manzillar (sitemap, canonical) shu bilan chiqadi.
