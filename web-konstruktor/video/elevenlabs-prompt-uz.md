# ElevenLabs uchun prompt: Impro IT sotuv videosi (37 soniya)

## 1. Sozlama
- **Model:** **Eleven v3** (o'zbek tilini qo'llaydi; eski Multilingual v2 o'zbekchani qo'llamasligi mumkin, avval o'zbekcha bitta jumla bilan sinab ko'ring).
- **Til:** Uzbek (matnni lotin yozuvida kiriting).
- **Ovoz turi:** Voice Library'dan o'zbekcha yoki aksentsiz, **chuqur, ishonchli, erkak, 28–40 yosh, tezkor reklama diktori**. Yoki **Voice Design**'ga quyidagini yozing:

```
Uzbek-speaking male voice, 30-35 years old, deep warm confident tone, a modern
startup founder who speaks fast but clearly, slightly urgent at the start, then
energetic and optimistic. Clean studio quality, close microphone, no echo.
Natural Tashkent accent, crisp consonants.
```
- **Voice settings:** Stability **35–45%** (jonli, emotsional), Similarity **75%**, Style **30–40%**, Speaker boost **yoqilgan**, Speed **1.05–1.10**.
- **Chiqarish:** WAV/MP3 44.1 kHz. Har sahnani **alohida** yarating (7 ta bo'lak), keyin vaqt jadvali bo'yicha joylang.

## 2. Matn: har sahna uchun (v3 teglari bilan)
Oyna sekundlari videodagi joyi. O'qish tezligi oynaga sig'adigan qilib qisqartirilgan.

| № | Boshlanishi | Oyna | Matn (ElevenLabs'ga yopishtiring) |
|---|---|---|---|
| 1 | 0:00.45 | 2.6 s | `[whispers] Tun. [pause] [sighs] Siz uxlayapsiz.` |
| 2 | 0:03.40 | 4.6 s | `[serious] Mijoz yozadi. Javob yo'q. [short pause] [firmly] U ketadi, raqobatchiga.` |
| 3 | 0:08.80 | 1.8 s | `[confident] Siz uxlaysiz. [pause] [excited] Bot sotadi!` |
| 4 | 0:11.40 | 8.0 s | `[energetic] Bot ikki soniyada javob beradi, buyurtma oladi, to'lovni qabul qiladi, [short pause] va sizga qo'ng'iroq qiladi.` |
| 5 | 0:20.40 | 6.8 s | `[upbeat] Saytni o'zingiz yarating: o'ttiz ikki shablon. [short pause] Matn ustiga bosing, shu zahoti o'zgaradi.` |
| 6 | 0:28.10 | 3.8 s | `[confident] Agentlikda ikki yarim million. [short pause] [excited] Bizda, o'n dollar.` |
| 7 | 0:32.70 | 3.3 s | `[warm] Bugun boshlang. [short pause] [clearly] improuzbekiston nuqta uz.` |

Teglar ishlamasa (model qo'llamasa), ularni olib tashlang, faqat matn va tinish belgilari qoladi.

### Bitta uzun "prompt" ko'rinishi (agar bitta fayl xohlasangiz)
```
[whispers] Tun. [pause 0.4s] Siz uxlayapsiz. [pause 0.6s]
[serious] Mijoz yozadi. Javob yo'q. U ketadi, raqobatchiga. [pause 0.8s]
[confident] Siz uxlaysiz. [pause] [excited] Bot sotadi! [pause 0.6s]
[energetic] Bot ikki soniyada javob beradi, buyurtma oladi, to'lovni qabul qiladi, va sizga qo'ng'iroq qiladi. [pause 0.6s]
[upbeat] Saytni o'zingiz yarating: o'ttiz ikki shablon. Matn ustiga bosing, shu zahoti o'zgaradi. [pause 0.6s]
[confident] Agentlikda ikki yarim million. [excited] Bizda, o'n dollar. [pause 0.5s]
[warm] Bugun boshlang. improuzbekiston nuqta uz.
```
Bitta fayl bo'lsa, vaqtlarni video muharririda (CapCut, DaVinci) sahna chegaralariga qirqib moslang.

## 3. Talaffuz bo'yicha maslahat
- "improuzbekiston.uz" ni **"improuzbekiston nuqta uz"** deb yozing, aks holda harflab o'qiydi.
- Raqamlarni so'z bilan yozing (**"o'ttiz ikki"**, **"o'n dollar"**): shunda ovoz tabiiy o'qiydi.
- Apostrof muammo qilsa: `o'` o'rniga `o‘` (U+2018) yoki `oʻ` (U+02BB) ni sinab ko'ring.
- Qo'shiq ohangi chiqsa: Stability'ni 55% ga oshiring.

## 4. Ovozni videoga qo'yish (ixtiyoriy buyruq)
Videodagi musiqa `video/out/music.wav`, ovoz bo'laklari `v1.wav ... v7.wav` bo'lsa:
```bash
ffmpeg -i video/out/impro-reklama.mp4 -i v1.wav -i v2.wav -i v3.wav -i v4.wav -i v5.wav -i v6.wav -i v7.wav \
 -filter_complex "[0:a]volume=0.5[m];[1:a]adelay=450|450[a1];[2:a]adelay=3400|3400[a2];[3:a]adelay=8800|8800[a3];[4:a]adelay=11400|11400[a4];[5:a]adelay=20400|20400[a5];[6:a]adelay=28100|28100[a6];[7:a]adelay=32700|32700[a7];[m][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:normalize=0,alimiter=limit=0.95[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k impro-reklama-elevenlabs.mp4
```

## 5. Ixtiyoriy: ElevenLabs Sound Effects va Music (videodagi sintetik tovushlar o'rniga)
**Sound Effects** (har birini alohida yarating):
1. `Phone notification ding, soft glassy chime, single, close mic` (0.5–2 s, 5 marta har xil balandlikda)
2. `Deep cinematic impact hit with long sub-bass tail, dark` (3.3 s va 32.4 s)
3. `Fast whoosh transition, rising airy sweep, 0.5 seconds` (o'tishlar)
4. `Cash register ka-ching with sparkle and coins, bright` (17.0 s)
5. `Old-school phone ringing twice, clean, modern ringtone` (17.7 s)
6. `Keyboard typing fast, soft mechanical keys, 1.2 seconds` (25 s)

**Music** (Eleven Music yoki boshqa):
```
Modern cinematic tech-commercial track, 120 BPM, A minor. 0:00-0:08 dark tense
ambient with ticking clock and heartbeat, building riser. At 0:08 a powerful
drop into bright energetic electronic groove with punchy kick, claps, plucky
arpeggio and warm bass. Confident, optimistic, premium startup feeling.
Ends with a clean resolved chord at 0:35. No vocals. 37 seconds total.
```

## 6. Ruscha va inglizcha variant (xohlasangiz)
**RU:** `[whispers] Ночь. [pause] Вы спите. [serious] Клиент пишет. Ответа нет. Он уходит — к конкуренту. [excited] Вы спите. Бот продаёт! [energetic] Бот отвечает за две секунды, принимает заказ, берёт оплату и звонит вам. [upbeat] Сайт — сами: тридцать два шаблона, нажмите на текст — и он меняется. [confident] В агентстве — два с половиной миллиона. У нас — десять долларов. [warm] Начните сегодня: improuzbekiston точка uz.`

**EN:** `[whispers] Night. [pause] You're asleep. [serious] A customer writes. No reply. They leave, for your competitor. [excited] You sleep. The bot sells! [energetic] The bot replies in two seconds, takes the order, accepts payment, and calls you. [upbeat] Build the site yourself: thirty-two templates, tap the text and it changes. [confident] An agency charges two and a half million. We charge ten dollars. [warm] Start today: improuzbekiston dot u z.`

> Eslatma: ElevenLabs imkoniyatlari (model nomlari, teglar, o'zbek tili qo'llovi) tez yangilanadi. Avval qisqa test jumla bilan tekshirib, keyin hammasini yarating.
