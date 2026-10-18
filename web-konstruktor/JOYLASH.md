# Joylash qo'llanmasi (hisob, baza va admin panel ishlashi uchun)

Hisob (login/ro'yxat), mijoz ma'lumotlari bazasi va admin panel **server** talab qiladi. Eng ishonchli va qulay yo'l: arzon **VPS** (virtual server) va **bitta buyruq**.
Server joylangach, butun sayt (asosiy sahifa, konstruktor, kabinet, admin) shu serverdan ishlaydi, GitHub Pages kerak bo'lmaydi.

## A yo'li: VPS + bitta buyruq (tavsiya etiladi)

**1. VPS oling.** Ubuntu 22.04 yoki 24.04, 1 GB xotira yetadi (@HOST, Hetzner, DigitalOcean va boshqalar). Hosting sizga **IP manzil** va `root` paroli (yoki SSH kalit) beradi.

**2. Domenni serverga yo'naltiring** (@HOST paneli → DNS-менеджер → Редактор зон). `improuzbekiston.uz` uchun:
- `@` dagi 4 ta eski A yozuvini (GitHub: 185.199.108–111.153) **o'chiring**, o'rniga bitta A yozuv qo'shing: `@` → **VPS IP manzili**.
- `www` dagi CNAME (`sladusuz.github.io`) ni **o'chiring**, o'rniga A yozuv: `www` → **VPS IP manzili**.
- **Mijozlar subdomenlari uchun** yana bitta A yozuv: `*` (yulduzcha) → **VPS IP manzili**. Shunda `lola-salon.improuzbekiston.uz` kabi manzillar ishlaydi (sertifikat avtomatik olinadi).
- `mail`, `ftp`, `MX`, `TXT` yozuvlariga **tegmang** (pochta uchun).
- Saqlang. DNS yangilanishi 5 daqiqadan bir necha soatgacha davom etadi.

**3. Serverga kiring va buyruqni bajaring.** Kompyuteringizda terminal (Windows: PowerShell) oching:
```
ssh root@VPS_IP
```
Keyin serverda bitta buyruq:
```
curl -fsSL https://raw.githubusercontent.com/Sladusuz/impro/main/deploy/install.sh | bash -s -- improuzbekiston.uz
```
2–4 daqiqada hammasi o'rnatiladi: Node.js, avtomatik HTTPS (Caddy), xizmat, xavfsizlik devori va har kuni zaxira nusxa.
Oxirida ekranda **admin paroli** chiqadi (u serverda `/root/impro-admin-parol.txt` faylida ham turadi).

**4. Tekshiring.**
- Sayt: https://improuzbekiston.uz
- Admin: https://improuzbekiston.uz/admin (parol: o'rnatish oxirida chiqqan)
- Admin panelda: **Sozlamalar** → parolni o'zgartiring, Telegram xabarnomani ulang.

**5. GitHub Pages ni o'chiring** (ixtiyoriy, tartib uchun): repo → Settings → Pages → *Unpublish site*.

### Keyin
- **Sotuv va to'lov:** admin → *Sozlamalar* da Payme/Click kalitlarini kiriting (yoki qo'lda to'lov ko'rsatmasini yozing), *Narxlar* da shablon narxini ($10) belgilang. Mijoz to'lagach sayt yuklab olish va subdomenda joylash ochiladi. Qo'lda to'lovni admin → *Mijoz saytlari* da «To'langan deb belgilash» bilan tasdiqlaysiz.
- **Payme** kassa sozlamasida Endpoint URL: `https://improuzbekiston.uz/api/pay/payme` (hisob maydoni `order_id`). **Click** da Prepare/Complete URL: `https://improuzbekiston.uz/api/pay/click`. Avval ularning sinov (sandbox) muhitida tekshiring.
- **Admin Telegram bot va mini ilova:** @BotFather'dan bot oling (yangi token). Serverda: `echo 'TELEGRAM_BOT_TOKEN=TOKEN' | sudo tee -a /etc/impro.env && sudo systemctl restart impro`. Bot o'zi ulanadi (HTTPS domen kerak). Telegramda botni oching va `/login ADMIN_PAROLI` yozing (parol xabari darrov o'chiriladi). Shundan keyin: yangi buyurtmalar tugmalar bilan keladi, `/panel` yoki bot menyusidagi **Admin panel** tugmasi admin panelni Telegram ichida ochadi (parol so'ramaydi). Qurilmani admin panel → Sozlamalar dan uzish mumkin. **Tokenni hech kimga yubormang va chatga yozmang.**
- **AI yordamchi:** admin → *Sozlamalar* → AI bo'limiga Claude API kalitini kiriting.
- Eski o'rnatish bo'lsa, subdomenlar uchun Caddy sozlamasi yangilanishi kerak: `sudo bash /opt/impro/deploy/install.sh improuzbekiston.uz` ni qayta ishga tushiring (ma'lumotlarga tegmaydi).
- **Yangilash:** `sudo bash /opt/impro/deploy/update.sh` (ma'lumotlar saqlanib qoladi)
- **Loglar:** `journalctl -u impro -f`
- **Qayta ishga tushirish:** `sudo systemctl restart impro`
- **Zaxira nusxa:** har kuni 03:00 da `/var/backups/impro` ga (oxirgi 14 kun). Boshqa joyga ham nusxa oling.
- **Tiklash:** `sudo systemctl stop impro && sudo tar xzf /var/backups/impro/impro-SANA.tar.gz -C /var/lib/impro && sudo chown -R impro:impro /var/lib/impro && sudo systemctl start impro`

## B yo'li: Render.com (serverni o'zingiz sozlamasdan)
1. https://render.com/deploy?repo=https://github.com/Sladusuz/impro ni oching, Render hisobiga kiring.
2. `ADMIN_PASSWORD` maydoniga admin parolini yozing, tasdiqlang. **Doimiy disk uchun pullik tarif (Starter) kerak**; bepul tarifda ma'lumotlar server qayta ishga tushganda o'chib ketadi, shuning uchun hisoblar uchun yaramaydi.
3. Render bergan manzilda (`https://....onrender.com`) sayt va `/admin` ochiladi.
4. Domenni ulash: Render → Settings → Custom Domains → `improuzbekiston.uz`. Render ko'rsatgan DNS yozuvlarini @HOST paneliga kiriting (A va CNAME).

## Statik sayt serverga qanday ulanadi (faqat boshqa joyda turgan sayt uchun)
Agar sayt GitHub Pages da qolsa va server alohida manzilda bo'lsa: `docs/config.js` ga `window.__API__ = 'https://server-manzili';` yozing va admin paneldagi *Sozlamalar → Boshqa domenlardagi saytlar* ga sayt manzilini qo'shing. A yo'lida bu kerak emas.

## Qo'shimcha sozlamalar (yangi imkoniyatlar)

- **Yordam boti (support) va admin bot:** `TELEGRAM_BOT_TOKEN` ni serverning env faylida saqlang (`/etc/impro.env` yoki `.env`), repoga yozmang. Botga `/login PAROL` yozing: shundan so'ng sizga so'rovlar keladi. Mijozlar botga yozsa, xabar sizga boradi; siz xabarga *reply* qilsangiz, javob mijozga qaytadi.
- **Server bo'lmaganda (GitHub Pages):** so'rovlarni Telegramga yetkazish uchun `worker/README.md` bo'yicha Cloudflare Worker o'rnating va `RELAY=https://...workers.dev node tools/build-static.js` bilan quring.
- **Referal dasturi:** `data/settings.json` → `referral: { enabled, discountPct (20), rewardUsd (3) }` yoki admin sozlamalari API orqali.
- **Statistika va qidiruv:** `GA=G-XXXX YM=12345678 node tools/make-site.js`, `GSC=... YANDEX_VERIFY=... node tools/build-static.js`.
- **Blog:** maqolalar `tools/blog.json` da; qo'shgandan keyin `node tools/build-static.js`.
- **Botning avtomatik javobi:** mijoz savoliga bot o'zi javob beradi (uz/ru/en). `ANTHROPIC_API_KEY` bo'lsa Claude (AI) javob beradi, bo'lmasa qoidalar asosida (narx, muddat, $10 shablon, bot, to'lov, aloqa). Bilmasa yoki operator so'ralsa, sizga "⚠️ Operator kerak" keladi. Siz xabarga reply qilsangiz, bot shu mijoz bilan 2 soat jim turadi. Botda `/auto on|off` bilan yoqish/o'chirish.
- **Serversiz bot (Cloudflare Worker):** `worker/README.md` ga qarang. Test: `node tools/e2e-worker.js`.
