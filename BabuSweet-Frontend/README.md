# BabuSweet — frontend (serversiz, ko'p sahifali)

Node.js kerak emas. Oddiy HTML/CSS/JS fayllar.

## Sahifalar
| Fayl | Nima |
|---|---|
| `index.html` | Bosh sahifa |
| `catalog.html` | Katalog (qidiruv, filtr) |
| `product.html?p=<slug>` | Mahsulot sahifasi |
| `about.html` | Biz haqimizda |
| `export.html` | Eksport va hamkorlik |
| `news.html` | Yangiliklar |
| `contact.html` | Aloqa |
| `admin/index.html` | **Admin panel** (login bilan) |

## Ko'rish
`index.html` ni brauzerda oching. Admin: `admin/index.html`.

## Admin panel
Kirish: login va parol so'raladi. Parol ochiq saqlanmaydi (PBKDF2-SHA256 hash, `admin/config.js`). 5 marta xato kiritilsa 5 daqiqaga qulflanadi, 30 daqiqa harakatsizlikdan so'ng avtomatik chiqadi.

Bo'limlar:
- **Boshqaruv** — statistika va "tayyorlik tekshiruvi" (nima yetishmayotganini ko'rsatadi).
- **Mahsulotlar** — qo'shish, tahrirlash, nusxa, yashirish, o'chirish, tartiblash (sudrab yoki ↑↓), qidirish; rasm yuklash (avtomatik kichraytiriladi), jonli ko'rinish.
- **Yangiliklar** — qo'shish, tahrirlash, e'lon qilish/yashirish.
- **Matnlar** — saytdagi HAR BIR yozuvni (uz/ru/en) tahrirlash; "↺" bilan asl holiga qaytarish.
- **Sozlamalar** — telefon, manzil, ish vaqti, ijtimoiy tarmoqlar, raqamlar, eksport yo'nalishlari, sayt domeni (Google uchun).
- **Nashr va zaxira** — nashr qilish, zaxira nusxa olish/tiklash.
- **Xavfsizlik** — parolni almashtirish.

Admin'dagi o'zgarishlar avval **qoralama** bo'ladi (faqat shu brauzerda ko'rinadi). Hamma uchun chiqarish: "Nashr va zaxira" bo'limi.

## Nashr qilish
1. **GitHub orqali (tavsiya)**: sayt repoda bo'lib Netlify/GitHub Pages ulangan bo'lsa, admin'dan bir tugma bilan yangilanadi. Rasmlar fayl bo'lib yuklanadi, `sitemap.xml` va `robots.txt` avtomatik yangilanadi. Token: GitHub → Settings → Developer settings → Fine-grained tokens → faqat shu repo → *Contents: Read and write*.
2. **Fayl orqali**: `site-data.js` ni yuklab oling → `data/site-data.js` o'rniga qo'ying → hostingga qayta yuklang.

## Google va xavfsizlik
- Admin Google'dan yashirilgan: `noindex` meta, `robots.txt`, `_headers` (Netlify), `admin/.htaccess` (Apache). Saytda admin'ga hech qanday havola yo'q.
- Serversiz saytda login brauzer ichida tekshiriladi, shuning uchun **kuchli parol** qo'ying. Muhimi: admin'ga kirgan begona odam ham **hamma ko'radigan saytni o'zgartira olmaydi** — nashr faqat sizning GitHub tokeningiz yoki fayl almashtirish orqali bo'ladi.
- Qo'shimcha himoya: Netlify "Password protection" yoki Cloudflare Access'ni `/admin/*` ga yoqing, yoki `admin` papkasini boshqa nomga o'zgartiring.
- Domen tayyor bo'lgach, Admin → Sozlamalar → "Domen" ni kiriting va nashr qiling — sitemap va canonical avtomatik to'g'rilanadi. So'ng Google Search Console'ga `sitemap.xml` ni yuboring.

## Parolni almashtirish
Admin → Xavfsizlik. Boshqa kompyuterlarda ham amal qilishi uchun ko'rsatilgan kodni `admin/config.js` ga qo'yib, saytga qayta yuklang.

## Sahifalarni qayta yaratish (ixtiyoriy)
Sahifalar `tools/build.py` orqali yaratilgan (`python3 tools/build.py`). Oddiy foydalanish uchun kerak emas.
