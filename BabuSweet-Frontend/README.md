# BabuSweet — frontend (serversiz, ko'p sahifali)

Node.js kerak emas. Oddiy HTML/CSS/JS fayllar.

## Sahifalar
| Fayl | Nima |
|---|---|
| `index.html` | Bosh sahifa (hero, kolleksiya sahnasi, hamkorlik, yangiliklar) |
| `catalog.html` | Katalog — qidiruv va filtr |
| `product.html?p=<slug>` | Mahsulot sahifasi (har mahsulot uchun) |
| `about.html` | Biz haqimizda, ishlab chiqarish |
| `export.html` | Eksport va hamkorlik (3D globus) |
| `news.html` | Yangiliklar |
| `contact.html` | Aloqa va forma |
| `admin/index.html` | Admin panel |

## Ko'rish
`index.html` ni brauzerda oching. Admin: `admin/index.html`.

## Admin
1. Mahsulot / yangilik / sozlamalarni o'zgartiring — bular shu brauzerda **qoralama** bo'lib saqlanadi, saytda (shu brauzerda) darhol ko'rinadi.
2. Hamma uchun chiqarish: Admin → **Nashr qilish**
   - `site-data.js` ni yuklab oling → `data/site-data.js` o'rniga qo'ying → hostingga qayta yuklang, yoki
   - GitHub repo Netlify/GitHub Pages'ga ulangan bo'lsa — bir tugma bilan.
3. Mahsulot rasmi: **shaffof fonli PNG/WebP** yuklang (mahsulot fonsiz kesilgan). Fonli rasm yuklansa, admin buni o'zi aniqlab, rasmni yumaloq burchakli qilib ko'rsatadi.

## Hostingga joylash
Papkani Netlify (netlify.com/drop) yoki GitHub Pages'ga tashlang.

## Google (SEO)
`robots.txt` va `sitemap.xml` ichidagi `YOUR-DOMAIN.uz` ni o'z domeningizga almashtiring, so'ng Google Search Console'ga `sitemap.xml` ni yuboring.

## Sahifalarni qayta yaratish (ixtiyoriy)
Sahifalar `tools/build.py` orqali yaratilgan (`python3 tools/build.py`). Oddiy foydalanish uchun kerak emas.
