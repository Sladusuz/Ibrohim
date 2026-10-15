# Sladus — sayt va yashirin boshqaruv paneli

Statik sayt (Netlify / Vercel) + Supabase bazasi.
Build qayta qilish shart emas: panelda o'zgartirsangiz, saytda darhol ko'rinadi.

---

## Panelning manzili

```
sizningsayt.uz/panel-fa0717685948.html
```

Bu manzil **saytning hech bir joyida ko'rsatilmagan** — menyuda ham, footerda ham,
sitemap'da ham yo'q. Qidiruv tizimlariga `noindex` qo'yilgan va `robots.txt` da yopilgan.

**Manzilni brauzer xatcho'plariga saqlang.** Uni hech kimga bermang.

Agar manzil boshqalarga ma'lum bo'lib qolsa: fayl nomidagi `fa0717685948` qismini
boshqa tasodifiy harflarga almashtiring, so'ng `robots.txt`, `_headers` va
`vercel.json` fayllarida ham yangi nomni yozing.

### Mahalliy (Supabase'siz) admin panel

```
sizningsayt.uz/admin-56a7e0dcc2af.html
```

Bu — Supabase ulanmagan holatda ham ishlaydigan, brauzer xotirasida saqlaydigan
qo'shimcha panel (login: `Ibrohim`, standart parol: `ibrohim123`). **Birinchi
kirishdan so'ng darhol Sozlamalar bo'limidan parolni almashtiring** — panel buni
qizil ogohlantirish bilan eslatib turadi. Bu ham `robots.txt`, `_headers` va
`vercel.json` orqali qidiruv tizimlaridan yopilgan, manzili tasodifiy harflardan
iborat va 5 marta xato urinishdan keyin vaqtincha bloklanadi.

**Muhim:** bu panelning himoyasi faqat brauzer darajasida (server tekshiruvi yo'q),
shuning uchun uni chinakam maxfiy deb hisoblamang — asosiy, kuchli himoyalangan
panel doim yuqoridagi Supabase-ga ulangan `panel-fa0717685948.html` bo'lishi kerak.

---

## O'rnatish — 6 qadam

### 1. Supabase loyihasi
[supabase.com](https://supabase.com) → **New project** → nom: `sladus` → region: **Frankfurt**.

### 2. Baza
SQL Editor → `supabase/01-schema.sql` ni to'liq qo'ying → **Run**.
Keyin `supabase/02-seed.sql` → **Run** (30 ta mahsulot tushadi).

### 3. O'zingizni admin qilib yozing
SQL Editor'da bitta qator bajaring — **o'z emailingiz bilan**:

```sql
insert into admins (email, note) values ('sizning@email.uz', 'Bosh admin');
```

Bu eng muhim qadam. Shu ro'yxatda bo'lmagan hech kim — hatto ro'yxatdan o'tgan
foydalanuvchi ham — mahsulotlarni o'zgartira olmaydi.

### 4. Kalitlar
Project Settings → **API** → `Project URL` va `anon public` kalitini
`config.js` fayliga yozing.

```js
window.SLADUS_CONFIG = {
  url: 'https://abcdefgh.supabase.co',
  key: 'eyJhbGciOi...'
};
```

`anon` kalit ochiq bo'lishi normal — u bilan faqat o'qish mumkin.

### 5. Foydalanuvchi yarating
Authentication → **Users** → **Add user** → 3-qadamdagi email va kuchli parol.
«Auto Confirm User» ni yoqing.

Keyin Authentication → **Providers** → **Email** → `Allow new users to sign up`
ni **o'chiring**. Shunda begona odam ro'yxatdan o'ta olmaydi.

### 6. Deploy
Barcha fayllarni Netlify yoki Vercel'ga yuklang. `_headers` (Netlify) va
`vercel.json` (Vercel) xavfsizlik sarlavhalarini avtomatik qo'yadi.

---

## Support sahifasi va AI yordamchi

Saytda `/support.html` sahifasi bor: tez-tez so'raladigan savollar, to'liq PDF
katalogni yuklab olish tugmasi (`assets/catalog/Sladus-Katalog-2026.pdf`) va
mahsulotlar bo'yicha savollarga javob beradigan AI chat vidjeti.

AI yordamchi Anthropic (Claude) API orqali ishlaydi, lekin API kaliti **faqat
serverda** turadi — brauzer kodida hech qachon ko'rinmaydi. Buning uchun serverless
funksiya ishlatiladi:

- Vercel uchun: `api/support-chat.js`
- Netlify uchun: `netlify/functions/support-chat.js` (+ `netlify.toml` orqali
  `/api/support-chat` manziliga yo'naltiriladi, shunda frontend kodi ikkala
  hostingda ham o'zgarishsiz ishlaydi)

### Sozlash

1. [console.anthropic.com](https://console.anthropic.com) da API kalit oling.
2. Hosting sozlamalarida muhit o'zgaruvchisi (environment variable) qo'shing:
   - Vercel: Project → Settings → Environment Variables → `ANTHROPIC_API_KEY`
   - Netlify: Site settings → Environment variables → `ANTHROPIC_API_KEY`
3. Qayta deploy qiling. Kalit qo'yilmagan bo'lsa, chat vidjeti buni aniq
   xabar bilan ko'rsatadi (foydalanuvchiga API xatoligi emas, tushunarli xabar
   chiqadi).

Yordamchi faqat Sladus mahsulotlari, katalogi va aloqa ma'lumotlari haqida javob
beradi (`data/build-system-prompt.js` da belgilangan) — narx yoki aniq buyurtma
so'ralganda «Aloqa» formasiga yo'naltiradi. Mahsulotlar ro'yxati
`data/catalog-context.json` faylida saqlanadi; yangi mahsulot turkumi qo'shilganda
shu faylni ham qo'lda yangilang.

## Sayt tarkibi

| Sahifa | Nima bor |
|---|---|
| `index.html` | Video hero, eksport yo'nalishlari yuguruvchi satri, 4 ta bo'lim paneli, tavsiya etilgan 8 ta mahsulot, ustunlar, 17 mamlakat, mukofotlar, so'rov formasi |
| `catalog.html` | Qidiruv, bo'lim filtri, 4 xil saralash, manzilga yoziladigan holat |
| `product.html` | Tarkib, ozuqaviy qiymat, saqlash sharti, quti o'lchami, TN VED, o'xshash mahsulotlar, Product JSON-LD |
| `about.html` | Tarix, ko'rsatkichlar, ish tamoyillari, muhim bosqichlar, mukofotlar |
| `contact.html` | Aloqa ma'lumotlari, Google xarita, so'rov formasi |
| `support.html` | Tez-tez so'raladigan savollar, PDF katalogni yuklab olish, AI yordamchi |

Uch til: **uz / ru / en**. Til header'dagi tugmadan almashadi va eslab qolinadi.
Manzilga `?lang=uz` qo'shib ham ochish mumkin.

---

## Panelda nima bor

| Bo'lim | Imkoniyat |
|---|---|
| **Boshqaruv** | 4 ta ko'rsatkich, yo'nalishlar bo'yicha ustunli diagramma, oxirgi so'rovlar |
| **Mahsulotlar** | Qo'shish, tahrirlash, o'chirish, nusxa olish, qidiruv, filtr |
| **Jonli ko'rinish** | Forma to'ldirilayotganda kartaning saytdagi ko'rinishi yonida turadi |
| **Rasm** | Sudrab tashlab yuklash yoki URL. Supabase Storage'ga tushadi, 5 MB gacha |
| **Tillar** | Har bir matn uchun uz / ru / en tab'lari |
| **Holat** | «Yashirilgan» — saytda ko'rinmaydi, lekin o'chmaydi |
| **Tartib** | Kichik raqamli mahsulot oldinda turadi |
| **Yo'nalishlar** | Yangi bo'lim, rang tanlash (malina / oltin / pista / anbar) |
| **So'rovlar** | Murojaatlar, o'qilgan belgisi, CSV yuklab olish |
| **Sozlamalar** | Parol almashtirish, JSON eksport / import |

Tezkor tugmalar: **Esc** — oynani yopish, **Ctrl+S** — saqlash.

---

## Xavfsizlik

1. **Panel manzili yashirin** — saytda havola yo'q, `noindex`, `robots.txt` da yopiq.
2. **Admin ro'yxati** — `admins` jadvalidagi email'gina yoza oladi (`is_admin()` funksiyasi).
3. **RLS** — barcha jadvalda yoqilgan. Katalogni hamma o'qiydi, faqat admin yozadi.
4. **So'rovlar** — har kim yubora oladi, faqat admin o'qiy oladi.
5. **Rasm** — faqat admin yuklaydi, tur va hajm bazada cheklangan.
6. **Sarlavhalar** — HSTS, X-Frame-Options, nosniff, Referrer-Policy qo'yilgan.
7. **Ro'yxatdan o'tish** — Supabase'da o'chirib qo'yiladi (5-qadam).
8. **Mahalliy admin panel** (`admin-56a7e0dcc2af.html`) — tasodifiy nomlangan,
   qidiruv tizimlaridan yopilgan, 5 marta xato urinishdan keyin vaqtincha
   bloklanadi va 15 daqiqa harakatsizlikdan so'ng avtomatik chiqadi. Standart
   parol o'zgartirilmagan bo'lsa, panel buni doim ko'rinadigan qizil ogohlantirish
   bilan eslatadi.
9. **AI yordamchi kaliti** — `ANTHROPIC_API_KEY` faqat serverless funksiyada
   (hosting muhit o'zgaruvchisi sifatida) turadi, brauzer kodiga hech qachon
   qo'shilmaydi.

---

## Muhim maslahatlar

**Rasmlar.** Hozir rasmlar eski `sladus.uz` manzillarini ko'rsatadi. Eski sayt
yopilsa ular yo'qoladi. Har bir mahsulotni ochib rasmni panel orqali qayta
yuklab chiqing — shunda hammasi o'z bazangizda bo'ladi.

**Zaxira nusxa.** Oyiga bir marta Sozlamalar → Eksport bosing va JSON faylni saqlang.

**Baza uxlab qolishi.** Supabase bepul rejasida 7 kun tegilmasa loyiha uxlaydi.
Sayt har kuni ochilsa bunday bo'lmaydi.

**Sayt Supabase'siz ham ishlaydi.** `config.js` to'ldirilmagan bo'lsa,
sayt `assets/js/seed.js` dagi nusxadan ishlaydi — hech qachon bo'sh sahifa chiqmaydi.

---

## Eski saytda topilgan va to'g'rilangan xatolar

1. `ligt.html` — sarlavha «SLADUS LIGHT», ichida «SLADUS KOKO»
2. `akshok.html` — sarlavhada «SWEET LIGHT» (boshqa mahsulot nomi)
3. `sweetligt.html` — «Наименования товара: SLADUS ANOSH»
4. `rosse.html` — «SLADUS Coffetto» deb takrorlangan
5. `slstick.html` — «**е**коративная» (Д harfi yo'q) va rasm topdrop bilan bir xil
6. `drop.html` — TN VED kodi: `19042099008sladus top drops light`
7. `about.html` — statistika raqamlari bo'sh edi
8. Bosh sahifa — «Декоративная» tavsifi «С начинкой» matnining nusxasi
9. Menyu — «Драже» tugmasi «С начинкой» sahifasiga olib borardi
10. Footer — «Sladus Lead**i**n» (g harfi yo'q, hamma sahifada)
11. Manzil — «S**p**unik-17» → «Sputnik-17»
12. Meta-teglar bo'sh, title'lar takrorlanardi
13. Sayt faqat rus tilida edi — uz va en qo'shildi
