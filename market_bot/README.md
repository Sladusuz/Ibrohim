# Telegram market bot

Katalog, savat, buyurtma (naqd to'lov) va admin panelli do'kon boti.

## Ishga tushirish
1. @BotFather orqali bot yarating va tokenni oling.
2. `cp .env.example .env` va `BOT_TOKEN`, `ADMIN_IDS` ni to'ldiring.
3. `pip install -r requirements.txt`
4. `python bot.py`

## Foydalanish
- Mijoz: `/start` → Katalog → Savat → Buyurtma berish (ism, telefon, manzil).
- Admin: `/admin` → kategoriya/mahsulot qo'shish, o'chirish, buyurtmalar va ularning holatini o'zgartirish.
  Yangi buyurtma adminlarga avtomatik keladi, holat o'zgarsa mijozga xabar ketadi.
