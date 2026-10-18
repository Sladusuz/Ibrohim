# Telegram yordam boti va sayt so'rovlari: Cloudflare Worker (serversiz)

Bitta Worker ikki ishni bajaradi:
1. **@improsupport_bot** mijoz savollariga o'zi javob beradi (Claude AI yoki tayyor qoidalar), murakkab savolni sizga uzatadi.
2. Statik saytdagi forma so'rovlarini (anketa, aloqa) Telegram'ga yetkazadi.

Bot tokeni, parol va API kalit faqat Worker'ning maxfiy o'zgaruvchilarida turadi, repoda yoki saytda emas.

## O'rnatish (taxminan 10 daqiqa, bepul)

1. **cloudflare.com** da hisob oching → *Workers & Pages* → *Create* → *Hello World* → nom: `impro-bot` → *Deploy* → *Edit code* →
   butun kodni o'chirib, **`worker/dist/worker.mjs`** faylidagi kodni qo'ying → *Deploy*.
2. **KV:** *Storage & Databases → KV → Create* (nom: `impro-state`). So'ng Worker → *Settings → Bindings → Add → KV namespace*: o'zgaruvchi nomi **`STATE`**, `impro-state` ni tanlang.
3. **Worker → Settings → Variables and Secrets** (Secret turida):
   - `TG_TOKEN`: @BotFather bergan bot tokeni
   - `WEBHOOK_SECRET`: tasodifiy uzun matn (harf va raqam, 20+ belgi)
   - `SETUP_KEY`: yana bitta tasodifiy matn
   - `ADMIN_PASSWORD`: o'zingiz uchun parol (botda `/login` uchun)
   - `ANTHROPIC_API_KEY`: (ixtiyoriy) Claude API kaliti; bo'lmasa bot qoidalar bo'yicha javob beradi
   - `ALLOW_ORIGIN`: `https://improuzbekiston.uz,https://www.improuzbekiston.uz` (oddiy o'zgaruvchi)
4. Brauzerda bir marta oching: `https://impro-bot.<hisobingiz>.workers.dev/setup?key=SETUP_KEY`. Javobda `"webhook":true` va bot nomi chiqishi kerak.
5. Telegram'da **@improsupport_bot** ga `/login ADMIN_PASSWORD` yozing: shundan so'ng mijoz xabarlari va sayt so'rovlari sizga keladi.
6. Saytni Worker bilan bog'lang: `RELAY=https://impro-bot.<hisobingiz>.workers.dev node tools/build-static.js` (yoki `docs/config.js` dagi `window.__RELAY__`).

## Ishlatish
- Mijoz botga yozadi → bot javob beradi, nusxasi sizga keladi. Murakkab savolda "⚠️ Operator kerak" belgisi bilan.
- Siz mijoz xabariga **reply** qilsangiz, javob mijozga ketadi va bot shu mijoz bilan 2 soat jim turadi.
- `/auto off` va `/auto on`: avtomatik javobni o'chirish/yoqish.

## Yangilash
Sayt matni yoki narxlar o'zgarsa bot bilimlari ham yangilanishi kerak: `node tools/build-worker.js` va yangi `dist/worker.mjs` ni qayta joylang.

Server (VDS) ulansa, Worker kerak emas: server aynan shu ishlarni o'zi bajaradi.
