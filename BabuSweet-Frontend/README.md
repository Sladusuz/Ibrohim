# BabuSweet — frontend (serversiz)

Node.js kerak emas. Bu oddiy HTML/CSS/JS fayllar.

## Ko'rish
- `index.html` ni brauzerda ikki marta bosib oching — sayt ishlaydi.
- Admin: `admin/index.html` ni oching.

## Admin qanday ishlaydi
1. Admin'da mahsulot / yangilik / sozlamalarni o'zgartiring — bular **shu brauzerda qoralama** bo'lib saqlanadi.
2. `index.html` ni shu brauzerda ochsangiz, qoralamani ko'rasiz (pastda "QORALAMA REJIMI" belgisi chiqadi).
3. Hamma uchun chiqarish ("Admin → Nashr qilish"):
   - **Fayl usuli:** `site-data.js` ni yuklab oling → `data/site-data.js` o'rniga qo'ying → hostingga qayta yuklang.
   - **GitHub usuli:** repo Netlify/GitHub Pages'ga ulangan bo'lsa, admin'dan bir tugma bilan yangilanadi.

## Hostingga joylash
Butun papkani Netlify (netlify.com/drop), GitHub Pages yoki istalgan hostingga tashlang. Server shart emas.

## Google (SEO)
- Domen tayyor bo'lgach `robots.txt` va `sitemap.xml` dagi `https://YOUR-DOMAIN.uz` ni o'z domeningizga almashtiring.
- Google Search Console'ga `sitemap.xml` ni yuboring.

## Eslatma
- Aloqa formasi serversiz ishlaydi: xabarni nusxalab Telegram (Sozlamalar → Telegram havolasi) yoki email (mailto) ochadi.
- Admin sahifasi ochiq turadi, lekin sayt ma'lumotini faqat fayl almashtirgan yoki GitHub tokeni bor kishi o'zgartira oladi.
