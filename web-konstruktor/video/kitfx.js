// node video/kitfx.js v1 -> kit/tl/v1.fx.json (audio voqealari)
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs=require('fs'),path=require('path');
(async()=>{const id=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.join(__dirname,'kit/kit.html')+'?v='+id);await p.waitForTimeout(400);
fs.writeFileSync(path.join(__dirname,'kit/tl/'+id+'.fx.json'),JSON.stringify(await p.evaluate(()=>window.__events())));await b.close()})();
