# BabyCheer: Telegram Mini App do'koni va boti

Butunlay **Netlify**'da ishlaydi (alohida server kerak emas): do'kon sayti, API (Netlify Functions), bot (webhook) va
ma'lumotlar ombori (Netlify Blobs). Katalog, narxlar, ranglar, yetkazib berish qoidasi, kontaktlar va FAQ
[BabyCheer saytidan](https://github.com/Sladusuz/Market) olingan.

## Imkoniyatlar
**Do'kon (Mini App, chat yonidagi «Open» tugmasi):** bosh sahifa, kategoriyalar, qidiruv, saralash, filtr, sevimlilar,
mahsulot sahifasi (rang, soni, xususiyatlar), savat, buyurtma (Toshkent bo'ylab bepul / O'zbekiston bo'ylab yetkazib berish / olib ketish),
to'lov usullari, buyurtmalar tarixi va holat chizig'i, raqam bo'yicha kuzatish, FAQ va adminga xabar, tungi rejim.

**To'lov:** naqd, karta (qabul qilganda), onlayn Click/Payme (`PAYMENT_PROVIDER_TOKEN` berilsa, Telegram oynasida),
karta o'tkazmasi (`CARD_NUMBER` berilsa, chek rasmi botga yuboriladi, admin tasdiqlaydi).

**Bot:** `/start` do'konni ochadi; mijozga buyurtma va holat xabarlari; adminga yangi buyurtma, to'lov, chek va mijoz xabarlari
tugmalar bilan (✅ Tasdiqlash, 🚚 Yo'lda, 🎉 Yetkazildi, ❌ Bekor, 💰 To'langan).

**Admin panel (Mini App):** botga `/admin` yozing va «🔧 Admin panelni ochish» tugmasini bosing. Parol kerak emas, Telegram imzosi va
`ADMIN_IDS` tekshiriladi. Pastki menyu: **Bosh** (bugungi tushum, 7 kunlik grafik, yangi buyurtmalarni bir bosishda tasdiqlash, kam qolgan
mahsulotlar), **Buyurtmalar** (qidiruv, filtrlar, bitta tugma bilan keyingi bosqich: Tasdiqlash → Yo'lga chiqarish → Yetkazildi,
«⋯» menyusida to'lov va bekor qilish; holat o'zgarsa mijozga avtomatik xabar), **Mahsulotlar** (ro'yxatning o'zida ombor +/− va ko'rinish
tugmasi, qidiruv va kategoriya filtri, jonli ko'rinishli muharrir, nusxa olish, ko'p rasm, ranglar, xususiyatlar), **Sozlamalar**
(do'kon ma'lumotlari, yetkazish narxi, kategoriyalar, adminlar).

**Mijoz xabarlari:** mijoz botga yozgan hamma narsa (matn, rasm, ovoz, hujjat) hamma adminlarga ism, @username va ID bilan keladi.
Admin xabarga **reply (javob)** qilsa, javob mijozga yetadi (matn, rasm, ovoz). Mijozga birinchi xabarida «adminga yuborildi» deb tasdiq ketadi,
spamdan himoya: 10 daqiqada 15 tadan ko'p xabar yetkazilmaydi, guruh xabarlari yetkazilmaydi.

**Admin qo'shish:** asosiy admin (Netlify'dagi `ADMIN_IDS`) botda `/invite` yozadi yoki admin panel → Sozlamalar → «🔗 Yangi admin taklif qilish»
tugmasini bosadi. Chiqqan havolani yangi adminga yuboradi: u havolani bosib botni ochsa, avtomatik admin bo'ladi (havola 24 soat va bir marta ishlaydi).
Yangi admin mahsulot, buyurtma va sozlamalarni boshqaradi, lekin boshqa admin qo'sha olmaydi. `/admins` ro'yxat, `/removeadmin ID` olib tashlash, `/myid` har kim uchun o'z Telegram ID'si.

**Admin buyruqlari** (`ADMIN_IDS` dagilar uchun, `/admin` ro'yxatni ko'rsatadi): `/orders`, `/stats`, `/products`,
`/price id narx`, `/oldprice`, `/stock`, `/del`, `/addcat`, `/add` (rasm bilan), `/photo id`, `/set kalit qiymat`.
Mahsulot qo'shish: rasm yuboring va izohga yozing:
`/add Samokatlar | Nom | 300000 | 0 | 10 | Tavsif | Qizil, Ko'k`

Xavfsizlik: narx, ombor va yetkazish narxi serverda hisoblanadi; buyurtma Telegram `initData` imzosi bilan tekshiriladi;
ombor ETag bilan atomik yangilanadi (bir vaqtdagi buyurtmalar ombordan oshib ketmaydi); webhook maxfiy kalit bilan himoyalangan.

## Joylash (Netlify)
1. Netlify > **Add new site > Import from Git** (yoki mavjud saytda *Link repository*): repozitoriy `Sladusuz/Ibrohim`,
   branch `claude/optimistic-edison-wtqe1e`, **Base directory: `babycheer-shop`**. Qolganini `netlify.toml` o'zi biladi.
2. **Environment variables** (`.env.example` ga qarang): `BOT_TOKEN`, `ADMIN_IDS`, `WEBHOOK_SECRET` (+ ixtiyoriy to'lov qiymatlari).
3. Deploy tugagach webhook va «Open» tugmasini o'rnating (bir marta):
```
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" -d url=https://<sayt>.netlify.app/tg -d secret_token=<WEBHOOK_SECRET> -d drop_pending_updates=true
curl "https://api.telegram.org/bot<TOKEN>/setChatMenuButton" -H 'content-type: application/json' \
  -d '{"menu_button":{"type":"web_app","text":"Open","web_app":{"url":"https://<sayt>.netlify.app"}}}'
```

## Mahalliy ishga tushirish va testlar
```
npm install
npm test                      # 13 ta test: ombor, buyurtma, to'lov, webhook, admin buyruqlari
node test/devserver.mjs       # http://localhost:8788 (soxta Telegram, ma'lumotlar xotirada)
```
