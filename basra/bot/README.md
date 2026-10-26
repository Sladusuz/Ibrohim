# Basra Ta’lim Markazi — Telegram bot + mini ilova

Bot: **@basratalm_bot** · Mini ilova: `../index.html` (sayt, Netlify’da joylashadi)

## Imkoniyatlar
- **Mini ilova** (bot menyu tugmasi, «Darsga yozilish», «Arab alifbosi») — sayt Telegram ichida ochiladi, ariza formasi to’g’ridan-to’g’ri botga yuboriladi.
- **Darsga yozilish** — mini ilovada yoki bot ichida bosqichma-bosqich (kurs → kim uchun → ism → yosh → telefon → qulay vaqt → tasdiq).
- **Kurslar** ro’yxati va har bir kurs sahifasi, «Shu kursga yozilish» tugmasi bilan.
- **Harf testi** — 5 savollik arab harflari viktorinasi, oxirida ro’yxatdan o’tishga taklif.
- **Aloqa / Markaz haqida**, ish vaqtidan tashqarida mos javob.
- Erkin yozilgan savollar administratorga uzatiladi.
- 24 soatdan keyin ariza qoldirmaganlarga **bir marta** eslatma.
- **Admin**: yangi arizalar kartochkasi (✅ Bog’landim / 🚫 Spam), `/stats`, `/leads`, `/export` (CSV), `/broadcast`.

## Ishga tushirish
```bash
cd basra/bot
cp .env.example .env     # BOT_TOKEN va boshqalarni to’ldiring
node bot.js              # Node 18+ yetarli, paket o’rnatish shart emas
npm test                 # soxta Telegram serveri bilan sinov
```
Doimiy ishlashi uchun serverda `pm2 start bot.js --name basra-bot` yoki systemd/Docker ishlating (bot long polling ishlatadi, domen kerak emas).

## Admin bo’lish
1. `.env` ga `ADMIN_SECRET=ixtiyoriy_sirli_soz` yozing (yoki `ADMIN_IDS=123456789`).
2. Botga `/admin ixtiyoriy_sirli_soz` yuboring — arizalar shu chatga kela boshlaydi.

## Mini ilovani yoqish
1. `index.html` ni `https://basraedu.netlify.app` ga qayta joylang (Telegram mini ilova faqat HTTPS qabul qiladi).
2. Bot allaqachon menyu tugmasini shu manzilga yo’naltirgan (`WEBAPP_URL`). Domen o’zgarsa, `.env` ni yangilab botni qayta ishga tushiring.
3. Ixtiyoriy: @BotFather → `/newapp` orqali ham mini ilova havolasi (`t.me/basratalm_bot/app`) yaratish mumkin.

## Xavfsizlik
- Token faqat `.env` da turadi (`.gitignore` da). Repoga yozmang.
- Token chatda/ommaviy joyda ko’rinib qolgan bo’lsa, @BotFather → `/revoke` bilan almashtiring.
- Ma’lumotlar `data/db.json` da saqlanadi (arizalar, foydalanuvchilar) — zaxira nusxasini oling.
