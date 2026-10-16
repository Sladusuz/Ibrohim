# Impro IT — sayt konstruktori

Tayyor, animatsiyali sayt + oddiy admin panel. Dasturlash bilmasdan ham sozlanadi.

## Ishga tushirish
1. Kompyuterga **Node.js 18+** o'rnating (https://nodejs.org).
2. Shu papkada: `node server.js` (Windows: `start.bat` ustiga ikki marta bosing).
3. Sayt: http://localhost:3000 · Admin panel: http://localhost:3000/admin
4. **Birinchi ishga tushirishda admin paroli terminalda chiqadi.** Uni yozib oling va admin paneldagi «Xavfsizlik» bo'limidan o'zgartiring.
   (Oldindan belgilash uchun: `ADMIN_PASSWORD=sizningparol node server.js`)

Port o'zgartirish: `PORT=8080 node server.js`.

## Admin panelda nimalar qilinadi
- **Asosiy:** kompaniya nomi, uslub (Qorong'i / Yorug' / Issiq), maxsus rang, bo'limlarni yoqish/o'chirish (katalog, buyurtma formasi, xizmatlar, jarayon, raqamlar, lenta, fon effektlari).
- **Bosh sahifa, Xizmatlar, Jarayon, Aloqa:** barcha matnlar.
- **Katalog:** mahsulot qo'shish, rasm yuklash (avtomatik kichraytiriladi), narx, kategoriya, belgi, yashirish.
- **Buyurtmalar:** kelgan buyurtmalar, holatini o'zgartirish.
- O'ng tomonda sayt **jonli ko'rinadi**; tayyor bo'lgach **Saqlash** (yoki Ctrl+S).

Katalog o'chirilsa, savat va narxlar saytda ko'rinmaydi. Buyurtma formasi o'chirilsa, faqat aloqa ma'lumotlari qoladi.
Admin panelni butunlay o'chirish: `data/site.json` da `features.admin` ni `false` qiling.

## Telegramga buyurtma xabari (ixtiyoriy)
@BotFather orqali bot yarating, tokenni va o'z chat ID'ingizni admin panel → Aloqa → «Buyurtma xabarnomasi» ga kiriting.

## Yangi mijoz uchun
Papkani nusxalang, `data/site.json` ni admin panel orqali sozlang (yoki faylni to'g'ridan-to'g'ri tahrirlang), `data/secret.json`, `data/orders.json` va `data/uploads/` dagi fayllarni o'chiring.

## Internetga chiqarish
Node.js ishlaydigan har qanday hosting/VPS yetadi (`node server.js`). HTTPS uchun Nginx yoki Caddy orqasiga qo'ying.
Muhim: `data/` papkasini zaxiralang — sayt ma'lumoti, buyurtmalar va rasmlar shu yerda.

## Tuzilma
```
server.js          — server (tashqi kutubxonasiz)
public/            — sayt (index.html, style.css, app.js) va admin panel (admin.html, admin.js)
data/site.json     — butun sayt ma'lumoti
data/orders.json   — buyurtmalar (avtomatik)
data/uploads/      — yuklangan rasmlar
```
