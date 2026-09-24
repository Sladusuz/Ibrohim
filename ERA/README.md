# ERA — sayt + zayavkalar admin paneli

Poyabzal va charm buyumlarni tozalash/tiklash ustaxonasi uchun sayt:

- **Hero** — skroll bilan boshqariladigan animatsiya: eskirgan tufli cho'tka → maxsus salfetka va ko'pik → krem → polirovka bilan ideal holga keladi.
- **Oldin / keyin** — surib taqqoslanadigan rasmlar.
- **Sumka** — eskirgan sumka gubka → mo'yqalam → salfetka bilan yangidek holga keladi.
- **Zayavka formasi** — buyum turi, xizmat, ism, telefon, filial, rasm (3 tagacha).
- **Admin panel** (`/admin`) — barcha zayavkalar, holat (Yangi / Jarayonda / Bajarildi / Bekor), izoh, rasmlar, qidiruv, filial filtri, Excel (CSV) eksport, yangi zayavka kelganda bildirishnoma.

## Ishga tushirish

**Eng oson yo'l:** Windows'da `ishga-tushirish.bat` (birinchi marta Node.js ni o'zi yuklab oladi — hech narsa o'rnatish shart emas), Mac'da `ishga-tushirish-mac.command` faylini ikki marta bosing — sayt va admin panel brauzerda o'zi ochiladi. Ochilgan qora oynani yopmang.

Terminal orqali:

Faqat [Node.js](https://nodejs.org) 18+ kerak (qo'shimcha paket o'rnatish shart emas).

```bash
cd ERA
node server.js
```

- Sayt: http://localhost:3000
- Admin panel: http://localhost:3000/admin

Admin panelga kirish: login **eratashkent**, parol **era2026**. Saytni internetga chiqarganda parolni serverda `ADMIN_PASSWORD` (va xohlasangiz `ADMIN_USER`) orqali almashtirish tavsiya etiladi:

```bash
ADMIN_USER="eratashkent" ADMIN_PASSWORD="yangi-kuchli-parol" node server.js
```

## Sozlamalar (environment)

| O'zgaruvchi | Tavsif |
|---|---|
| `PORT` | Port (standart `3000`) |
| `ADMIN_USER` | Admin login (standart `eratashkent`) |
| `ADMIN_PASSWORD` | Admin parol (standart `era2026`) |
| `DATA_DIR` | Zayavkalar (`leads.json`) va rasmlar saqlanadigan papka (standart `./data`) |
| `TRUST_PROXY=1` | nginx yoki hosting proksisi ortida ishlaganda |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Har bir yangi zayavkani Telegram'ga ham yuborish (ixtiyoriy) |

## Internetga joylash

Server doimiy disk talab qiladi (zayavkalar `data/` papkasida saqlanadi):

- **VPS** (masalan, Ubuntu): `node server.js` ni `pm2` yoki `systemd` bilan ishga tushiring, oldiga nginx + HTTPS (Let's Encrypt) qo'ying va `TRUST_PROXY=1` bering.
- **Render / Railway / Fly.io**: "Web service" sifatida `npm start` bilan; albatta **persistent disk** ulang va `DATA_DIR` ni o'sha diskka yo'naltiring — aks holda qayta ishga tushganda zayavkalar o'chib ketadi.

`data/` papkasidan muntazam zaxira nusxa (backup) oling.

## Tahrirlash

- Telefon, email, manzillar: `public/index.html` (qidiring: `+998`, `eratashkent@gmail.com`, `Аккурган`, `Осиё`) va `public/js/site.js` dagi `PHONE_FALLBACK`.
- Filiallar ro'yxati server tomonida ham tekshiriladi: `server.js` dagi `BRANCHES`.
- Rasmlar: `public/assets/`. Hozirgilari — Unsplash'dan olingan namuna rasmlar (bepul litsenziya) asosida kompyuterda generatsiya qilingan "oldin" holatlari. O'z studiya suratlaringiz bilan almashtirsangiz yanada ishonchli bo'ladi. `tools/gen_assets.py` — ularni yaratgan skript (Python + Pillow + NumPy).
