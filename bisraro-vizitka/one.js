// Bitta variantni tez ko'rish uchun: node one.js <theme> <view> <out.png>
const { chromium } = require(process.env.PW);
(async () => { const b = await chromium.launch();
  const pxw = 94 * 96 / 25.4, pxh = 54 * 96 / 25.4;
  const p = await b.newPage({ viewport: { width: Math.ceil(pxw), height: Math.ceil(pxh) }, deviceScaleFactor: 600 / 96 });
  await p.goto('file://' + process.cwd() + `/index.html?view=${process.argv[3]}&theme=${process.argv[2]}&lang=${process.argv[5]||"uz"}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await p.screenshot({ path: process.argv[4], clip: { x: 0, y: 0, width: pxw, height: pxh } }); await b.close(); })();
