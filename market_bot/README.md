# BabyCheer Telegram do'koni

[BabyCheer saytining](https://github.com/Sladusuz/Market) Telegram-bot versiyasi: xuddi shu kategoriyalar, mahsulotlar,
ranglar, narxlar, yetkazib berish qoidasi (1 000 000 so'mdan yuqori bepul, aks holda 40 000), 6 oy kafolat, FAQ va kontaktlar.
Ma'lumotlar `seed_data.py` da (saytning `js/seed.js` idan olingan), birinchi ishga tushishda bazaga yoziladi.

## Imkoniyatlar
- **Mijoz:** katalog → mahsulot (rang tanlash, eski/yangi narx, ombor) → savat → buyurtma (ism, telefon, yetkazish, manzil, to'lov, izoh);
  buyurtmalarim, buyurtmani raqam+telefon bilan kuzatish (`BC-1001`), qidiruv, aloqa, FAQ, adminga xabar yozish.
- **To'lov usullari:**
  | Usul | Qachon yoqiladi |
  |---|---|
  | 💵 Naqd (qabul qilganda) | doim |
  | 💳 Karta, terminal orqali (qabul qilganda) | doim |
  | 📲 Onlayn (Click / Payme / Uzum, Telegram Payments) | `PAYMENT_PROVIDER_TOKEN` berilsa |
  | 🏦 Karta o'tkazmasi + chek rasmi | `CARD_NUMBER` berilsa |
- **Admin (`/admin`):** buyurtmalar va holatlar (yangi / tasdiqlandi / yo'lda / yetkazildi / bekor; bekor qilinsa ombor qaytadi),
  to'lovni tasdiqlash, mahsulot qo'shish/narx/ombor/rasm/o'chirish, kategoriya, `/set kalit qiymat` (telefon, yetkazish narxi va h.k.).
  Yangi buyurtma, to'lov, chek va mijoz xabarlari adminlarga avtomatik keladi.
- Narx, ombor va yetkazish narxi serverda (`db.create_order`) hisoblanadi, saytdagi `place_order()` kabi.

## Ishga tushirish
1. @BotFather orqali bot yarating, tokenni oling.
2. `cp .env.example .env`, `BOT_TOKEN` va `ADMIN_IDS` ni to'ldiring.
3. Onlayn to'lov uchun: @BotFather → `/mybots` → bot → **Payments** → Click yoki Payme ni ulang, tokenni `PAYMENT_PROVIDER_TOKEN` ga yozing.
   Karta o'tkazmasi uchun `CARD_NUMBER` (va `CARD_OWNER`) ni yozing.
4. `pip install -r requirements.txt && python bot.py`

Mahsulot rasmlari: `/admin` → Mahsulotlar → mahsulot → 🖼 Rasm.
