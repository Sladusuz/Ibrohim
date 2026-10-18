# Impro IT: iOS/Android ilova (Capacitor)

Sayt (`docs/`) ilova ichiga oflayn paketlanadi + native imkoniyatlar (`tools/app-native.js`): tebranish, ulashish, oflayn ogohlantirish, status bar, splash, tizim ilovalarida havola ochish.

Bundle ID: `uz.improuzbekiston.app` · Nomi: Impro IT

## Sizdan kerak (men qila olmaydigan qadamlar)
1. **Apple Developer Program** (99$/yil): developer.apple.com → Enroll. Tasdiqlanishi 1–2 kun.
2. **App Store Connect → Users and Access → Integrations → App Store Connect API → Generate key** (rol: App Manager). `Key ID`, `Issuer ID` va `.p8` faylni oling.
3. App Store Connect → My Apps → **+ New App**: nomi *Impro IT*, Bundle ID `uz.improuzbekiston.app`, til: Uzbek/Russian/English.
4. GitHub → Settings → Secrets and variables → Actions ga qo'shing: `APPSTORE_KEY_ID`, `APPSTORE_ISSUER_ID`, `APPLE_TEAM_ID` (developer.apple.com → Membership), `APPSTORE_KEY_P8` (`base64 -i AuthKey_XXXX.p8` natijasi).
5. Actions → **iOS → TestFlight** → Run workflow. ~15 daqiqada build TestFlight'ga tushadi, iPhone'da TestFlight ilovasi orqali sinaysiz.
6. App Store Connect'da skrinshotlar, tavsif, maxfiylik havolasi (`https://improuzbekiston.uz/maxfiylik.html`) ni to'ldirib «Submit for Review».

## Review uchun eslatma (Guideline 4.2)
Apple oddiy "sayt o'rami"ni rad etadi. Shuning uchun sayt ilovaga oflayn paketlangan va native funksiyalar bor. Review notes'da yozing: *"App bundles a full offline site builder catalog (32 templates) and uses native haptics, share sheet, offline handling."* Push-bildirishnomalar keyingi versiyada (APNs kaliti kerak).

## Mahalliy yig'ish (Mac'da)
```
cd web-konstruktor/app && npm ci && node ../tools/app-web.js && npx cap sync ios && npx cap open ios
```
