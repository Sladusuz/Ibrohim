const fs=require('fs'); const { chromium } = require(process.env.PW);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2048, height: 2048 } });
  await p.setContent('<style>body{margin:0}svg{width:2048px;height:2048px;display:block}</style>' + fs.readFileSync('out/bisraro-qr-oddiy.svg','utf8'));
  await p.screenshot({ path: 'out/bisraro-qr-oddiy.png', omitBackground: true }); await b.close(); })();
