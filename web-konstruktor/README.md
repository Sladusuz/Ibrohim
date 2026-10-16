# Impro IT: sayt konstruktori va platforma

Bitta loyiha ichida:

- **Impro IT sayti** (animatsiyali, 8 ta kasbiy shablon vitrinasi, paketlar va buyurtma)
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

Muhit o'zgaruvchilari: `PORT`, `DATA_DIR` (ma'lumotlar papkasi), `ADMIN_PASSWORD`, `ALLOWED_ORIGINS` (boshqa domendagi saytlar, vergul bilan), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Internetga chiqarish
- **Server (to'liq):** Node.js ishlaydigan VPS yoki hosting. Docker: `docker build -t impro . && docker run -p 3000:3000 -v impro-data:/data impro`. Render uchun `render.yaml` tayyor.
  HTTPS uchun Nginx yoki Caddy orqasiga qo'ying. **`DATA_DIR` papkasini zaxiralang**: mijozlar, buyurtmalar, saytlar va rasmlar shu yerda.
- **Statik nashr (GitHub Pages):** `node tools/build-static.js` `docs/` papkasini yig'adi. Bunda sayt, shablonlar va konstruktor ishlaydi, lekin **hisob, buyurtmalar bazasi va admin panel ishlamaydi** (ular server talab qiladi).
  Server joylangach, `docs/config.js` ga `window.__API__ = 'https://sizning-server.uz';` yozing va admin paneldagi *Sozlamalar → Boshqa domenlardagi saytlar* ga sayt manzilini qo'shing: shunda statik sayt hisob va buyurtmalar uchun serverdan foydalanadi.

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
public/sections.js           20 ta bo'lim turi (ko'rinishi va tahrirlash maydonlari)
public/templates.js          8 ta kasbiy shablon
public/editor.js             umumiy tahrirlagich
public/builder.js, yaratish.html   konstruktor
public/kabinet.html, auth.js       mijoz kabineti
public/admin.html, admin.js        admin panel
data/site.json               Impro IT sayti ma'lumoti
```
