# BISRARO — vizitka, logo va QR kod

QR kod `http://bisraro.uz/contacts` ga olib boradi (xatoga chidamlilik darajasi H, markazida "B" belgisi).

## `out/` papkasi

10 ta rang varianti — har birida `bisraro-vizitka-print.pdf` (bosmaxona uchun: 2 bet, 94×54 mm = 90×50 mm + 2 mm bleed)
va 600 dpi `bisraro-front.png` / `bisraro-back.png`:

1. `1-shokolad-oltin/` — to'q shokolad va oltin
2. `2-oq-oltin/` — oq fon va oltin
3. `3-zumrad-oltin/` — zumrad yashil va oltin
4. `4-bordo-rose-gold/` — bordo va rose gold
5. `5-tungi-kok-shampan/` — tungi ko'k va shampan oltin
6. `6-terrakota-mis/` — terrakota va mis
7. `7-binafsha-oltin/` — binafsha va oltin
8. `8-firuza-oltin/` — Samarqand firuzasi va oltin
9. `9-grafit-kumush/` — grafit va kumush
10. `10-och-pushti-rose-gold/` — och pushti fon va rose gold

Boshqa fayllar:
- `bisraro-5-variant.png`, `bisraro-5-variant-2.png` — 1–5 va 6–10 variantlar bir rasmda (tanlash uchun)
- `bisraro-logo.png` — asl logo, oq fondan tozalangan, aniq doira shaklida, shaffof fon (1200×1200). Vizitkalarda shu ishlatiladi
- `bisraro-logo-vektor.svg` — logoning qayta chizilgan vektor nusxasi (asl logoga yaqin, lekin aynan o'zi emas)
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

- Dizayn — `design.html`, ranglar — `design.html` dagi `.t-…` bloklari va `themes.json` / `themes2.json`
- Logo — `logo-original.webp` (asl fayl) → `python3 prep_logo.py` → `logo-bisraro.png`; havola — `make_qr.py` dagi `URL`
