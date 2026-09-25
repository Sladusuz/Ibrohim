const { chromium } = require(process.env.PW);
const url = 'file://' + process.cwd() + '/index.html';
(async () => {
  const b = await chromium.launch();
  const dsf = 300 / 96; // 300 dpi
  for (const [v, w, h] of [['front', 94, 54], ['back', 94, 54], ['qr', 120, 150]]) {
    const pxw = Math.round(w * 96 / 25.4), pxh = Math.round(h * 96 / 25.4);
    const p = await b.newPage({ viewport: { width: pxw, height: pxh }, deviceScaleFactor: dsf });
    await p.goto(url + '?view=' + v); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: `out/bisraro-${v}.png`, clip: { x: 0, y: 0, width: pxw, height: pxh } });
    await p.close();
  }
  const p = await b.newPage(); await p.goto(url); await p.evaluate(() => { document.querySelector('[data-view=qr]').remove(); return document.fonts.ready; });
  await p.pdf({ path: 'out/bisraro-vizitka-print.pdf', width: '94mm', height: '54mm', printBackground: true, preferCSSPageSize: true });
  const q = await b.newPage(); await q.goto(url + '?view=qr'); await q.evaluate(() => document.fonts.ready);
  await q.pdf({ path: 'out/bisraro-qr-poster.pdf', width: '120mm', height: '150mm', printBackground: true, pageRanges: '1' });
  await b.close();
})();
