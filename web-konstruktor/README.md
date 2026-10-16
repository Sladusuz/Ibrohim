# Impro IT: sayt konstruktori va platforma

Bitta loyiha ichida:

- **Impro IT sayti** (animatsiyali, 8 ta kasbiy shablon vitrinasi, paketlar va buyurtma)
- **Buyurtma anketasi**: mijozning xohishlarini 6 bosqichda so'raydigan master (xizmat, biznes, imkoniyatlar, dizayn, muddat/byudjet, aloqa), jonli taxminiy narx, qoralamani saqlash va «tez orada aloqaga chiqamiz» sahifasi. Hamma matn, xizmat va narx admin paneldan tahrirlanadi
- **Sayt konstruktori** (`/yaratish.html`): mijoz shablonni tanlaydi, hammasini tahrirlaydi va yuklab oladi yoki sizga topshiradi
- **Mijoz kabineti** (`/kabinet.html`): ro'yxatdan o'tish / kirish, saytlari va buyurtmalari (istalgan qurilmadan)
- **Admin panel** (`/admin`): boshqaruv, buyurtmalar, mijoz saytlari, mijozlar, narxlar, asosiy sayt tahrirlagichi, sozlamalar

## Shablonlar (kasblar bo'yicha)
Onlayn market · Portfolio (dizayner, dasturchi, fotograf) · IT kompaniya · Restoran/kafe · Go'zallik saloni · O'quv markaz.
Har birining o'z mavzusi, shrifti va bo'limlari bor; hammasi konstruktorda tahrirlanadi (matn, rasm, narx, rang, bo'lim qo'shish/o'chirish/tartiblash).

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
- `node tools/shoot-thumbs.js`: shablon rasmlarini suratga oladi (Playwright kerak)
- `node tools/build-static.js`: `public/shablon.html`, `public/index.html` va `docs/` ni yig'adi. **`public/` dagi dvigatel fayllari o'zgargach shuni ishga tushiring.**

## Tuzilma
```
server.js                    server (tashqi kutubxonasiz)
public/engine-core.js        sayt dvigateli (savat, formalar, effektlar)
public/sections.js           21 ta bo'lim turi (ko'rinishi va tahrirlash maydonlari)
public/brief.js              buyurtma anketasi (master)
public/templates.js          8 ta kasbiy shablon
public/editor.js             umumiy tahrirlagich
public/builder.js, yaratish.html   konstruktor
public/kabinet.html, auth.js       mijoz kabineti
public/admin.html, admin.js        admin panel
data/site.json               Impro IT sayti ma'lumoti
```
