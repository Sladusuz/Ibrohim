# BISRARO — vizitka, logo va QR kod

QR kod `http://bisraro.uz/contacts` ga olib boradi (xatoga chidamlilik darajasi H, markazida "B" belgisi).

## `out/` papkasi

5 ta rang varianti — har birida `bisraro-vizitka-print.pdf` (bosmaxona uchun: 2 bet, 94×54 mm = 90×50 mm + 2 mm bleed)
va 600 dpi `bisraro-front.png` / `bisraro-back.png`:

1. `1-shokolad-oltin/` — to'q shokolad va oltin
2. `2-oq-oltin/` — oq fon va oltin
3. `3-zumrad-oltin/` — zumrad yashil va oltin
4. `4-bordo-rose-gold/` — bordo va rose gold
5. `5-tungi-kok-shampan/` — tungi ko'k va shampan oltin

Boshqa fayllar:
- `bisraro-5-variant.png` — hamma variantlar bir rasmda (tanlash uchun)
- `bisraro-logo.svg` / `bisraro-logo.png` — logo (SVG vektor, shriftlar ichiga joylangan; PNG 3000×3000, shaffof fon)
- `bisraro-qr.png`, `bisraro-qr-poster.pdf` — "SKANERLANG" ramkali alohida QR (120×150 mm)
- `bisraro-qr-oddiy.svg` / `.png` — faqat QR kod

PDF'lar 600 dpi rasmlardan yig'iladi — telefonda ham, bosmaxonada ham bir xil ko'rinadi.

## Qayta yaratish

```
python3 build.py
PW=$(npm root -g)/playwright node render.js
python3 make_pdf.py
PW=$(npm root -g)/playwright node plain.js
```

- Dizayn — `design.html`, ranglar — `design.html` dagi `.t-…` bloklari va `themes.json`
- Logo — `logo-bisraro.svg`, havola — `make_qr.py` dagi `URL`
