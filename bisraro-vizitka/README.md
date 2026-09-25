# BISRARO — vizitka va QR kod

QR kod `http://bisraro.uz/contacts` ga olib boradi (xatoga chidamlilik darajasi H, markazida "B" belgisi).

`out/` papkasi:
- `bisraro-vizitka-print.pdf` — bosmaxona uchun: 2 bet (old va orqa tomon), 94×54 mm (90×50 mm + 2 mm bleed)
- `bisraro-front.png`, `bisraro-back.png` — 300 dpi rasm
- `bisraro-qr.png`, `bisraro-qr-poster.pdf` — "SKANERLANG" ramkali alohida QR (120×150 mm)
- `bisraro-qr-oddiy.svg` / `.png` — faqat QR kod (istalgan joyga qo'yish uchun, SVG kattalashtirganda xira bo'lmaydi)

Qayta yaratish: `python3 build.py && PW=$(npm root -g)/playwright node render.js && PW=$(npm root -g)/playwright node plain.js`
Dizayn — `design.html`, havola — `make_qr.py` dagi `URL`.
