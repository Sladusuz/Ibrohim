# BabyCheer: do'kon + admin panel

Node.js serversiz, toza frontend (HTML/CSS/JS). Ma'lumotlar bazasi sifatida bepul **Supabase** ishlatiladi.
Mijoz saytda buyurtma beradi, u admin panelga **real vaqtda** tushadi.

## Sahifalar

| Fayl | Nima |
|---|---|
| `index.html` | Bosh sahifa: 360°/3D ko'rinish, kolleksiyalar, skroll-hikoya, mahsulotlar, FAQ |
| `shop.html` | Katalog: kategoriya, narx, rang, mavjudlik, sevimlilar, saralash, qidiruv |
| `product.html?id=...` | Mahsulot: 360° yoki 3D, rang tanlash, xususiyatlar, savatga |
| `checkout.html` | Buyurtma berish |
| `order.html` | Buyurtma qabul qilindi + holatni kuzatish |
| `about.html`, `contact.html` | Biz haqimizda, bog'lanish (xabar adminga tushadi) |
| `setup.html` | Supabase ulashni bosqichma-bosqich tekshiruvchi sahifa |
| `admin/` | Admin panel: boshqaruv, **analitika**, buyurtmalar, mahsulotlar, kategoriyalar, xabarlar, sozlamalar |

```
js/config.js        Supabase kalitlari shu yerga yoziladi
js/api.js           ma'lumotlar qatlami (Supabase yoki demo)
js/car3d.js         3D mashina (three.js)        js/photo360.js  rasmlardan 360° ko'rinish
supabase/schema.sql jadvallar, xavfsizlik, buyurtma funksiyasi     supabase/seed.sql  namunaviy mahsulotlar
vendor/             three.js, Lenis, Supabase (CDN kerak emas)
```

## Demo rejim

`js/config.js` bo'sh bo'lsa sayt demo rejimda ishlaydi: ma'lumotlar faqat shu brauzerda saqlanadi, admin paroli `admin123`,
analitikani ko'rsatish uchun namunaviy buyurtmalar bor (Sozlamalar bo'limidan o'chiriladi).
Ochish: `index.html` ni brauzerda oching yoki `python3 -m http.server`.
Mijozlar buyurtmasi boshqa qurilmadan admin panelga tushishi uchun quyidagi ulanish kerak.

## 1. Supabase ulash (bir marta, ~5 daqiqa)

> Osonroq yo'l: **`setup.html`** sahifasini oching. U SQL ni nusxalaydi, kalitlaringizni tekshiradi va tayyor `config.js` matnini beradi.

1. https://supabase.com da bepul loyiha yarating.
2. **SQL Editor** da `supabase/schema.sql` ni to'liq qo'yib **Run** bosing. (Ixtiyoriy: keyin `seed.sql`.)
3. **Project Settings > API** dan `Project URL` va `anon public` kalitni `js/config.js` ga yozing.

## 2. Admin foydalanuvchi

1. Supabase **Authentication > Users > Add user** (email + parol, "Auto Confirm" yoqilgan).
2. Foydalanuvchining `UID` sini nusxalab, **SQL Editor** da bajaring:

```sql
insert into admins(user_id) values ('SHU_YERGA_UID');
```

3. `/admin/` sahifasiga shu email va parol bilan kiring.

## 3. Joylashtirish

Papkani istalgan statik hostingga yuklang: Netlify (drag & drop), Vercel, Cloudflare Pages, GitHub Pages. Build qadami yo'q.

## Mahsulot rasmlari va 360° ko'rinish

- Admin panel > Mahsulotlar > Tahrirlash > **Rasmlar**: rasm yuklang (avtomatik siqiladi).
- **3 ta va undan ko'p rasm** bo'lsa, saytda 360° ko'rinish paydo bo'ladi (sichqoncha/barmoq bilan suriladi). Tartib: **Old, Yon, Orqa, Tepa**.
- Rasm bo'lmasa, mahsulot illyustratsiya bilan ko'rinadi; "3D model" tanlansa, mashina 3D da aylanadi.
- Bosh sahifadagi katta ko'rinish `featured` belgilangan va 3+ rasmli mahsulotdan olinadi (hozir: `img/products/` papkasidagi sport elektromobil).

## Analitika

Admin > Analitika: davr (bugun, 7/30/90 kun, 12 oy, barchasi yoki o'zingiz tanlagan sana), guruhlash (kun/oy/yil),
oldingi davr bilan taqqoslash, mahsulot bo'yicha sotilgan dona va daromad, kategoriya va rang ulushi,
eng yaxshi mijozlar, hafta kunlari, to'lov/yetkazish. Jadvallarni CSV ga yuklash mumkin.

## Xavfsizlik

- `anon` kalit ochiq bo'lishi normal. Himoya Row Level Security orqali: mijoz faqat mahsulotlarni ko'ra oladi.
- Buyurtma `place_order()` funksiyasi orqali beriladi: narx, ombor va yetkazib berish narxi **serverda** hisoblanadi.
- Buyurtmalar, xabarlar, mahsulot tahriri va rasm yuklash faqat `admins` jadvalidagi foydalanuvchiga ruxsat etilgan.
- Hech qachon `service_role` kalitni saytga qo'ymang.

## Keyingi qadamlar (ixtiyoriy)

- Yangi buyurtma haqida Telegramga xabar: Supabase **Database Webhooks** + Edge Function (bot tokeni serverda qoladi).
- Click/Payme to'lovi: alohida Edge Function orqali.
