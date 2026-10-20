// node video/kitprev.js v1  -> /tmp/kp-v1.png (har sahna o'rtasidan kadr)
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs=require('fs'),path=require('path'),cp=require('child_process');
(async()=>{const id=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+path.join(__dirname,'kit/kit.html')+'?v='+id);await p.waitForFunction(()=>window.__ready!==false,null,{timeout:60000});await p.waitForTimeout(500);
const ts=await p.evaluate(()=>TLK.scenes.map((s,i)=>{const e=i+1<TLK.scenes.length?TLK.scenes[i+1].start:TLK.end;return s.start+(e-s.start)*.72}));
fs.mkdirSync('/tmp/kp',{recursive:true});const fl=[];
for(let i=0;i<ts.length;i++){await p.evaluate(t=>window.__frame(t),ts[i]);await p.waitForTimeout(80);const f=`/tmp/kp/${id}-${i}.png`;await p.screenshot({path:f});fl.push(f)}
await b.close();cp.execSync(`python3 -c "
from PIL import Image
import sys
fl=sys.argv[1:]
c=4;rows=(len(fl)+c-1)//c;W,H=500,889
m=Image.new('RGB',(W*c,H*rows))
for i,f in enumerate(fl): m.paste(Image.open(f).resize((W,H)),((i%c)*W,(i//c)*H))
m.save('/tmp/kp-${id}.png')" ${fl.join(' ')}`);console.log('xato:',er.slice(0,3),'ts',ts.map(x=>x.toFixed(1)).join(' '))})();
