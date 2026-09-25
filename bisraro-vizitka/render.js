// Har bir rang varianti uchun old/orqa tomonni 600 dpi PNG qilib chiqaradi.
// PDF'lar make_pdf.py da shu rasmlardan yig'iladi (brauzer PDF'idagi gradientli
// matn telefon PDF ko'rgichlarida buzilib ko'rinadi).
const fs = require('fs');
const { chromium } = require(process.env.PW);
const url = 'file://' + process.cwd() + '/index.html';
const themes = [].concat(...['themes.json', 'themes2.json'].map(f => JSON.parse(fs.readFileSync(f, 'utf8'))));
(async () => {
  const b = await chromium.launch();
  const dsf = 600 / 96;
  const shot = async (q, w, h, path) => {
    const pxw = w * 96 / 25.4, pxh = h * 96 / 25.4;
    const p = await b.newPage({ viewport: { width: Math.ceil(pxw), height: Math.ceil(pxh) }, deviceScaleFactor: dsf });
    await p.goto(url + '?' + q); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path, clip: { x: 0, y: 0, width: pxw, height: pxh } });
    await p.close();
  };
  for (const t of themes) {
    fs.mkdirSync('out/' + t.dir, { recursive: true });
    for (const v of ['front', 'back']) await shot(`view=${v}&theme=${t.id}`, 94, 54, `out/${t.dir}/bisraro-${v}.png`);
  }
  await shot('view=qr&theme=cocoa', 120, 150, 'out/bisraro-qr.png');
  await b.close();
})();
