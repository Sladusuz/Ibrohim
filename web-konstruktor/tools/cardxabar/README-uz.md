# CardXabar tinglovchisi: kartaga to'lov o'zi tasdiqlanadi

Mijoz kartaga pul o'tkazadi, @CardXabarBot sizga xabar yuboradi, bu skript xabarni o'qib, mos to'lovni **o'zi tasdiqlaydi** (yoki sizga aytadi).

## Qanday ishlaydi
1. Skript sizning Telegram hisobingiz orqali @CardXabarBot bilan yozishmani tinglaydi.
2. Yangi **kirim** xabari kelsa, summani o'qiydi.
3. Saytning admin API'sidan kutilayotgan (pending) to'lovlarni oladi va **aynan shu summaga** mos birini qidiradi.
4. Mos to'lov **bitta** bo'lsa: loyihani "To'langan" qiladi (mijozga sayt ochiladi) va sizga Telegramda xabar yuboradi.
5. Mos to'lov yo'q yoki bir nechta bo'lsa: hech narsani o'zgartirmaydi, sizga "qo'lda tekshiring" deb yozadi.

## Xavfsizlik (muhim)
- Skript **faqat sizning kompyuteringizda** ishlaydi. Telegram kodi, `api_id`, `api_hash` va `.session` faylini **hech kimga bermang** (menga ham).
- `.session` fayli Telegram hisobingizga to'liq kirish beradi. Uni ochiq joyga yuklamang. Mumkin bo'lsa, alohida (ikkinchi) Telegram hisobdan foydalaning.
- Admin parolini faqat o'zingizning kompyuteringizdagi muhit o'zgaruvchisiga yozing.

## O'rnatish (bir marta)
1. Python 3.9+ o'rnating, so'ng: `pip install telethon requests`
2. https://my.telegram.org → "API development tools" → ilova yarating → **api_id** va **api_hash** oling.
3. Muhit o'zgaruvchilarini kiriting (Windows: `set`, Mac/Linux: `export`):
   ```
   TG_API_ID=1234567
   TG_API_HASH=abcdef...
   ADMIN_PASSWORD=<admin-panel-parolingiz>
   NOTIFY_BOT_TOKEN=<xabar yuboriladigan bot tokeni>     (ixtiyoriy)
   NOTIFY_CHAT_ID=<sizning chat id>                        (ixtiyoriy)
   ```
4. Birinchi ishga tushirish: `python listener.py` → Telegram telefon raqamingiz va kelgan kodni **o'zingiz** kiritasiz. Keyingi safar so'ramaydi.

## Qo'llab-quvvatlanadigan xabar formati
Sizning namunangiz bo'yicha moslangan:
```
🟢 Perevod na kartu
➕ 1 000.00 UZS      ← kirim summasi (➖ bo'lsa chiqim, e'tiborsiz)
💳 ***8066           ← karta oxirgi 4 raqami (boshqa karta bo'lsa e'tiborsiz)
🕓 21.10.26 23:19    ← vaqt (Toshkent), to'lov so'rovidan oldingi xabarlar e'tiborga olinmaydi
💵 15 132.41 UZS     ← qoldiq (o'qilmaydi)
```
Karta tekshiruvi: `CARD_LAST4` (standart `8066`).

## Xabar formatini sinash (Telegramsiz)
Kelgan xabaringizni qavs ichiga qo'yib tekshiring (karta raqamini o'chirib):
```
python listener.py --test "➕ 150 037.00 UZS\n💳 ***8066"
```
Natija `{'kind': 'in', 'amount': 150037, 'last4': '8066', ...}` bo'lsa, o'qiy oladi (`in` = kirim). Boshqacha chiqsa, xabar namunasini yuboring, formatni moslab beraman.
Xom xabarlarni ko'rish uchun: `DEBUG=1 python listener.py`.

## Doimiy ishlatish
Skript ishlab turishi kerak (kompyuter yoqiq bo'lsin yoki arzon VPS'da):
- Linux: `nohup python listener.py > log.txt 2>&1 &`  yoki systemd xizmati.
- Windows: Task Scheduler yoki `start /min python listener.py`.

## Sozlamalar
| O'zgaruvchi | Ma'nosi | Standart |
|---|---|---|
| `AUTO_CONFIRM=0` | Avtomatik tasdiqlamaydi, faqat xabar beradi | 1 |
| `MATCH_WINDOW_HOURS` | to'lov so'rovi yaratilgandan keyin necha soat ichida tushgan pul hisoblanadi | 72 |
| `CARD_LAST4` | Qaysi karta (oxirgi 4 raqam) kirimlari hisobga olinadi | 8066 |
| `CARD_BOT` | Bot nomi | CardXabarBot |
| `IMPRO_API` | Server manzili | impro-bot workers.dev |

## Cheklov
Bir xil summali bir nechta kutilayotgan to'lov bo'lsa, skript tanlamaydi, sizga aytadi. To'liq aniqlik uchun serverda har buyurtmaga noyob summa (masalan 150 037 so'm) berish kerak. Buning uchun Cloudflare Worker'ni qayta joylash lozim (yangi API token kerak).
