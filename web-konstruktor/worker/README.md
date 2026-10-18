# So'rovlarni Telegram'ga yetkazish (statik sayt uchun)

Sayt GitHub Pages'da turganda serveri yo'q, shuning uchun so'rovlar shu kichik Cloudflare Worker orqali Telegram'ga boradi.
Bot tokeni saytda emas, faqat Worker'da (maxfiy) saqlanadi.

1. cloudflare.com'da bepul hisob oching → Workers & Pages → Create Worker → `relay.js` ichidagi kodni qo'ying → Deploy.
2. Worker → Settings → Variables:
   - `TG_TOKEN` (Secret): @BotFather bergan bot tokeni
   - `TG_CHAT`: sizning chat ID raqamingiz (botga /start yozing, ID ni so'rang)
   - `ALLOW_ORIGIN`: `https://improuzbekiston.uz,https://www.improuzbekiston.uz`
3. Worker manzilini (masalan `https://impro-relay.sizning-nom.workers.dev`) `public/config.js` dagi `window.__RELAY__` ga yozing yoki `RELAY=... node tools/build-static.js` bilan quring.

Server (VDS) ulangandan keyin Worker kerak emas: so'rovlar to'g'ridan-to'g'ri serverga tushadi.
