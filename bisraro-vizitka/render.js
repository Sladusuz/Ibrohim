// Har bir tomonni 600 dpi PNG qilib chiqaradi; PDF'lar make_pdf.py da shu rasmlardan yig'iladi
// (brauzer PDF'idagi gradientli matn telefon PDF ko'rgichlarida buzilib ko'rinadi).
const { chromium } = require(process.env.PW);
const url = 'file://' + process.cwd() + '/index.html';
(async () => {
  const b = await chromium.launch();
  const dsf = 600 / 96;
  for (const [v, w, h] of [['front', 94, 54], ['back', 94, 54], ['qr', 120, 150]]) {
    const pxw = w * 96 / 25.4, pxh = h * 96 / 25.4;
    const p = await b.newPage({ viewport: { width: Math.ceil(pxw), height: Math.ceil(pxh) }, deviceScaleFactor: dsf });
    await p.goto(url + '?view=' + v); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: `out/bisraro-${v}.png`, clip: { x: 0, y: 0, width: pxw, height: pxh } });
    await p.close();
  }
  await b.close();
})();
