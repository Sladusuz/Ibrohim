# WebCompany.uz

O'zbekistondagi IT-kompaniya uchun professional korporativ veb-sayt: animatsiyali marketing sahifalari, portfolio, xizmatlar va murojaatlarni boshqarish uchun to'liq admin panel.

## Texnologiyalar

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
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
