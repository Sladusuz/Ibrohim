# WebCompany.uz

O'zbekistondagi IT-kompaniya uchun professional korporativ veb-sayt: animatsiyali marketing sahifalari, portfolio, xizmatlar va murojaatlarni boshqarish uchun to'liq admin panel. Sayt **o'zbek, rus va ingliz** tillarida ishlaydi (`/`, `/ru`, `/en`).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sladusuz/WebCompany&env=JWT_SECRET,ADMIN_EMAIL,ADMIN_PASSWORD&envDescription=Admin%20panel%20uchun%20maxfiy%20kalit%20va%20login%20ma%27lumotlari&project-name=webcompany&repository-name=webcompany)

> Vercel'dagi tez ko'rish (preview) uchun tugma bosing. **Diqqat:** Vercel serverless bo'lgani uchun SQLite yozuvlari (yangi murojaatlar, admin orqali kiritilgan o'zgarishlar) build'lar orasida saqlanib qolmaydi — faqat ko'rib chiqish uchun mos. To'liq ishlaydigan (yozish ham saqlanadigan) versiya uchun quyidagi "Joylashtirish" bo'limiga qarang.

## Texnologiyalar

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **next-intl** — 3 tilli lokalizatsiya (uz/ru/en)
- **Tailwind CSS v4** — dizayn tizimi
- **Framer Motion** — sahifa va komponent animatsiyalari
- **Prisma + SQLite** — ma'lumotlar bazasi (Admin, Project, Service, Message, Testimonial, Setting)
- **jose + bcryptjs** — admin autentifikatsiyasi (JWT sessiya cookie)
- **Zod** — server tomonidagi validatsiya

## Ishga tushirish

```bash
npm install
npx prisma migrate dev   # ma'lumotlar bazasini yaratish
npx tsx prisma/seed.ts   # namunaviy ma'lumotlar va admin foydalanuvchi
npm run dev
```

Saytni ko'rish: [http://localhost:3000](http://localhost:3000)

Admin panelga kirish: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

`.env` faylidagi standart admin login ma'lumotlari:

```
ADMIN_EMAIL="admin@webcompany.uz"
ADMIN_PASSWORD="WebCompany2026!"
```

**Muhim:** productionga chiqarishdan oldin `.env` faylidagi `JWT_SECRET`, `ADMIN_EMAIL` va `ADMIN_PASSWORD` qiymatlarini albatta o'zgartiring, so'ng `npx tsx prisma/seed.ts` ni qayta ishga tushiring.

## Admin panel imkoniyatlari

- **Boshqaruv paneli** — umumiy statistika (murojaatlar, loyihalar, xizmatlar)
- **Murojaatlar** — mijozlardan kelgan xabarlarni ko'rish, holatini o'zgartirish, o'chirish
- **Portfolio** — loyihalarni qo'shish/tahrirlash/o'chirish, rasm yuklash
- **Xizmatlar** — xizmatlarni qo'shish/tahrirlash/o'chirish
- **Sozlamalar** — sayt nomi, aloqa ma'lumotlari, ijtimoiy tarmoqlar va statistikani tahrirlash

## Loyihani tekshirish

```bash
npm run lint
npm run build
```

## Joylashtirish (deploy)

Ma'lumotlar bazasi SQLite fayl sifatida saqlanadi (`prisma/dev.db`). Bu lokal ishlash yoki doimiy diskli hosting (masalan, **Railway**, **Render**, **Fly.io**, o'z VPS/Docker konteyneringiz) uchun mukammal ishlaydi.

**Vercel kabi serverless platformalarga** to'g'ridan-to'g'ri joylashtirilsa, fayl tizimi har bir so'rovda qayta tiklanishi mumkinligi sababli SQLite yozuvlari (yangi murojaatlar, admin orqali qo'shilgan loyihalar) doimiy saqlanmaydi. Vercelda ishlatish uchun ikkita yo'l bor:

1. **Tavsiya etiladi:** Railway / Render / Fly.io kabi doimiy diskli platformaga joylashtiring — hech qanday o'zgarishsiz ishlaydi.
2. Vercel ishlatmoqchi bo'lsangiz, `prisma/schema.prisma`dagi `provider = "sqlite"` ni bepul bulutli Postgres (masalan, [Neon](https://neon.tech) yoki [Supabase](https://supabase.com)) uchun `provider = "postgresql"` ga o'zgartirib, `DATABASE_URL` muhit o'zgaruvchisini shunga mos sozlash kifoya.
