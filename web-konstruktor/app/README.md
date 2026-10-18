# Impro IT: iOS/Android ilova (Capacitor)

Ilova **jonli sayt `improuzbekiston.uz` ga ulangan** (`server.url`): saytda nima o'zgarsa (narx, shablon, tarjima, blog), ilova ham shu zahoti o'zgaradi, ilovani qayta yuklash shart emas. Sayt ichidagi `native.js` ilova ichida native imkoniyatlarni yoqadi (tebranish, ulashish, oflayn ogohlantirish, status bar, tizim ilovalarida havola ochish); oddiy brauzerda hech narsa qilmaydi. Internet yo'q bo'lsa `offline.html` ko'rsatiladi.

Bundle ID: `uz.improuzbekiston.app` · Nomi: Impro IT

## Sizdan kerak (men qila olmaydigan qadamlar)
1. **Apple Developer Program** (99$/yil): developer.apple.com → Enroll. Tasdiqlanishi 1–2 kun.
2. **App Store Connect → Users and Access → Integrations → App Store Connect API → Generate key** (rol: App Manager). `Key ID`, `Issuer ID` va `.p8` faylni oling.
3. App Store Connect → My Apps → **+ New App**: nomi *Impro IT*, Bundle ID `uz.improuzbekiston.app`, til: Uzbek/Russian/English.
4. GitHub → Settings → Secrets and variables → Actions ga qo'shing: `APPSTORE_KEY_ID`, `APPSTORE_ISSUER_ID`, `APPLE_TEAM_ID` (developer.apple.com → Membership), `APPSTORE_KEY_P8` (`base64 -i AuthKey_XXXX.p8` natijasi).
5. Actions → **iOS → TestFlight** → Run workflow. ~15 daqiqada build TestFlight'ga tushadi, iPhone'da TestFlight ilovasi orqali sinaysiz.
6. App Store Connect'da skrinshotlar, tavsif, maxfiylik havolasi (`https://improuzbekiston.uz/maxfiylik.html`) ni to'ldirib «Submit for Review».

## Review uchun eslatma (Guideline 4.2)
Ilova jonli saytni ochgani uchun Apple uni "sayt o'rami" deb rad etishi mumkin (4.2). Himoya: native tebranish, ulashish, oflayn holat, mijoz uchun maxsus tajriba. Review notes'da yozing: *"Client app for Impro IT: browse 32 industry website templates, build and customize a site, chat with support, uses native haptics, share sheet, system link handling and offline state."* Rad etilsa, push-bildirishnoma (APNs kaliti kerak) va oflayn katalogni qo'shamiz.

## Mahalliy yig'ish (Mac'da)
```
cd web-konstruktor/app && npm ci && node ../tools/app-web.js && npx cap sync ios && npx cap open ios
```
