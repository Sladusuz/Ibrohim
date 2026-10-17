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
