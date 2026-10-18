'use strict';
// Ilova jonli saytga ulangan (server.url = improuzbekiston.uz): sayt yangilansa, ilova ham darrov yangilanadi.
// www/ da faqat internet yo'q paytda ko'rsatiladigan offline.html bor.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'app', 'www');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const off = (t) => `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Impro IT</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;background:#05070f;color:#eef1ff;font:16px/1.6 -apple-system,system-ui,sans-serif;padding:24px}.l{width:72px;height:72px;border-radius:20px;margin:0 auto 18px;background:linear-gradient(135deg,#22d3ee,#7c5cff);display:grid;place-items:center;color:#04101c;font:800 44px Arial}h1{font-size:22px;margin:0 0 8px}p{color:#9aa6c4;margin:0 0 22px}button{border:0;border-radius:12px;padding:13px 26px;background:linear-gradient(90deg,#22d3ee,#7c5cff);color:#04101c;font:700 16px inherit}</style></head><body><div><div class="l">I</div><h1>Internet yo'q</h1><p>Aloqa tiklangach, ilova avtomatik ochiladi.<br>Нет интернета · No internet</p><button onclick="location.href='capacitor://localhost/'.replace('capacitor://localhost/','https://improuzbekiston.uz/')">Qayta urinish / Повторить / Retry</button></div><script>addEventListener('online',()=>location.href='https://improuzbekiston.uz/')</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'offline.html'), off());
fs.writeFileSync(path.join(OUT, 'index.html'), off());
console.log('app/www tayyor (offline.html); ilova jonli sayt bilan ishlaydi');
