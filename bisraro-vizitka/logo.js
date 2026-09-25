const fs=require('fs'); const { chromium } = require(process.env.PW);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: +(process.argv[3]||1) });
  fs.writeFileSync('logo-test.built.html', fs.readFileSync('logo-test.html','utf8').replace('%%LOGO%%', fs.readFileSync('logo-bisraro.svg','utf8')));
  await p.goto('file://' + process.cwd() + '/logo-test.built.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await p.evaluate(() => document.body.style.background='transparent');
  await p.screenshot({ path: process.argv[2], omitBackground: true }); await b.close(); })();
