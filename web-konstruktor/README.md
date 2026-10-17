# Impro IT: sayt konstruktori va platforma

Bitta loyiha ichida:

- **Impro IT sayti** (kinematik animatsiyali, 30+ kasbiy shablon vitrinasi, paketlar va buyurtma anketasi)
- **Buyurtma anketasi**: mijozning xohishlarini 6 bosqichda so'raydigan master (xizmat, biznes, imkoniyatlar, dizayn, muddat/byudjet, aloqa), jonli taxminiy narx, qoralamani saqlash va «tez orada aloqaga chiqamiz» sahifasi. Hamma matn, xizmat va narx admin paneldan tahrirlanadi
- **Sayt konstruktori** (`/yaratish.html`): mijoz shablonni tanlaydi, hammasini tahrirlaydi va yuklab oladi yoki sizga topshiradi
- **Mijoz kabineti** (`/kabinet.html`): ro'yxatdan o'tish / kirish, saytlari va buyurtmalari (istalgan qurilmadan)
- **Admin panel** (`/admin`): boshqaruv, buyurtmalar, mijoz saytlari, mijozlar, narxlar, asosiy sayt tahrirlagichi, sozlamalar

## Shablonlar (kasblar bo'yicha)
30 dan ortiq tayyor shablon: onlayn market, elektronika, kiyim, gul, mebel, kafe, fast-food, restoran, go'zallik saloni, barbershop, klinika, stomatologiya, yoga/spa, fitnes, veterinariya, o'quv markaz, til kurslari, avtoservis, qurilish, ko'chmas mulk, yuridik firma, logistika, portfolio (dizayner, dasturchi, fotograf), turizm, to'y/tadbir, DJ/musiqachi, startap, mobil ilova, organik mahsulotlar, IT kompaniya.
Galereyada qidiruv va kategoriya filtri bor. Har birining o'z uslubi (kinematik yoki hashamatli), rang to'plami, shrifti, hero ko'rinishi va haqiqiy fotolari bor; hammasi konstruktorda tahrirlanadi.
Fotolar `public/img/p/` da (CC0, StockSnap manbasidan; `tools/fetch-photos.js`). Yangi shablon yozish: `tools/TEMPLATE-GUIDE.md`.

## Dizayn tizimi
`public/motion.js` va `public/motion.css`: WebGL nurli fon, so'zma-so'z ochiladigan sarlavhalar, parallax, gorizontal vitrina, maxsus kursor, kirish animatsiyasi. Sayt sozlamalarida "Umumiy uslub" (Klassik / Kinematik / Hashamatli) va "Animatsiyalar" yoqish-o'chirish bor. Hero ko'rinishlari: aurora, kinematik (foto/video), katta foto, muharrir. Yangi bo'limlar: bayonot, bento, xizmatlar ro'yxati, vitrina, hamkorlar, rasm+matn, video, xarita, oldin/keyin.

## Sotuv, joylash va to'lov (server rejimida)
- **Shablon sotuvi:** mijoz shablonni bepul sozlaydi, tayyor sayt **$10** (admin *Narxlar* da o'zgartiriladi). To'lovdan keyin: tayyor sayt (mustaqil .html) yuklab olinadi yoki **nomi.sizning-domeningiz** manzilida joylanadi, o'z domeni ulanadi.
- **To'lov:** Payme va Click (webhooklar `/api/pay/payme`, `/api/pay/click`) yoki qo'lda tasdiqlash (admin *Mijoz saytlari* → «To'langan deb belgilash»). Kalitlar admin *Sozlamalar* da. Sandbox'da avval sinang.
- **Subdomenlar:** `ROOT_DOMAIN` + DNS'da `*` A yozuvi; Caddy sertifikatni talab bo'yicha oladi (`/_ask` faqat bizning domenlarga ruxsat beradi).
- **Joylangan saytda:** SEO teglari, `robots.txt`, `sitemap.xml`, PWA (telefonga ilova kabi o'rnatiladi), tashrif/buyurtma statistikasi, kelgan buyurtmalar mijoz kabinetida («Sayt buyurtmalari»).
- **AI yordamchi:** biznes tavsifidan shablon tanlaydi va matnlarni yozadi (Claude API kaliti kerak; kalitsiz faqat shablon tanlaydi).
- Statik nashrda (GitHub Pages) hisob, to'lov va joylash ishlamaydi: tayyor sayt faqat to'lovdan keyin beriladi, shuning uchun savdo uchun server kerak.

## Ishga tushirish (to'liq imkoniyatlar bilan)
1. **Node.js 18+** o'rnating.
2. `node server.js`  (Windows: `start.bat`)
3. Sayt: http://localhost:3000 · Admin: http://localhost:3000/admin
4. **Birinchi ishga tushishda admin paroli terminalda chiqadi.** Yozib oling va admin paneldan o'zgartiring.
   Oldindan belgilash: `ADMIN_PASSWORD=parol node server.js`

Muhit o'zgaruvchilari: `PORT`, `DATA_DIR` (ma'lumotlar papkasi), `ADMIN_PASSWORD`, `ALLOWED_ORIGINS` (boshqa domendagi saytlar, vergul bilan), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TRUST_PROXY=1` (Caddy/Nginx/Render orqasida).

## Internetga chiqarish
**To'liq qo'llanma: [JOYLASH.md](JOYLASH.md).** Qisqacha: Ubuntu VPS da bitta buyruq:
```
curl -fsSL https://raw.githubusercontent.com/Sladusuz/impro/main/deploy/install.sh | sudo bash -s -- sizning-domen.uz
```
U Node.js, avtomatik HTTPS (Caddy), xizmat, xavfsizlik devori va kunlik zaxira nusxani o'rnatadi.
Boshqa yo'llar: Docker (`Dockerfile`), Render (`render.yaml`, doimiy disk bilan).
**Statik nashr (GitHub Pages):** `node tools/build-static.js` `docs/` ni yig'adi. Bunda sayt, shablonlar va konstruktor ishlaydi, lekin **hisob, baza va admin panel ishlamaydi** (ular server talab qiladi).

## Mijoz hisoblari va ma'lumotlar
Ro'yxatdan o'tish telefon yoki email bilan. Parollar `scrypt` bilan shifrlanadi. Mijoz saytlari serverda saqlanadi va istalgan qurilmadan ochiladi.
Ma'lumotlar `DATA_DIR` ichidagi JSON fayllarda (`users.json`, `orders.json`, `projects.json`, `projects/`, `uploads/`). Katta yuk uchun keyinchalik haqiqiy ma'lumotlar bazasiga (PostgreSQL) o'tkazish mumkin.

## Asboblar
- `node tools/make-site.js`: Impro IT asosiy sayti ma'lumotini (`data/site.json`) shablonlardan qayta yaratadi
- `node tools/gen-images.js`: namunaviy rasmlarni yaratadi
- `node tools/shoot-thumbs.js [id...]`: shablon rasmlarini suratga oladi (Playwright kerak)
- `node tools/check-template.js <id>`: shablonni to'liq tekshiradi (xatolar, siniq rasmlar, mobil)
- `node tools/e2e.js`, `e2e-features.js`, `e2e-ui.js`: butun platformani sinaydi (hisob, anketa, admin, konstruktor; sotuv, subdomen, Payme/Click, AI)
- `node tools/build-static.js`: `public/shablon.html`, `public/index.html` va `docs/` ni yig'adi. **`public/` dagi dvigatel fayllari o'zgargach shuni ishga tushiring.**

## Tuzilma
```
server.js                    server (tashqi kutubxonasiz)
public/engine-core.js        sayt dvigateli (savat, formalar, effektlar)
public/sections.js, sections2.js   30 ta bo'lim turi (ko'rinishi va tahrirlash maydonlari)
public/motion.js, motion.css       kinematik animatsiya qatlami
public/img/p/                      haqiqiy fotolar kutubxonasi
public/brief.js              buyurtma anketasi (master)
public/templates.js, tpl-*.js      shablonlar (30+)
public/editor.js             umumiy tahrirlagich
public/builder.js, yaratish.html   konstruktor
public/kabinet.html, auth.js       mijoz kabineti
public/admin.html, admin.js        admin panel
data/site.json               Impro IT sayti ma'lumoti
```
