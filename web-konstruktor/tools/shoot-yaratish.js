const http=require('http'),fs=require('fs'),path=require('path');const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const src=fs.readFileSync('/tmp/kabshot.js','utf8');const STUB=eval('`'+src.match(/const STUB=`([\s\S]*?)`;/)[1]+'`').replace("return [{id:'a1',name:'TurboGarage'","return [{id:'d1',name:'Nova Events',status:'qoralama',template:'vz-tadbir',updatedAt:'2026-10-21T14:21:00'},{id:'d2',name:'Nova Events',status:'qoralama',template:'vz-tadbir',updatedAt:'2026-10-21T14:21:30'},{id:'d3',name:'Nova Events',status:'qoralama',template:'vz-tadbir',updatedAt:'2026-10-21T14:22:00'},{id:'a1',name:'TurboGarage'");
const P='/home/user/impro/public';const MIME={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');let f=path.join(P,decodeURIComponent(u.pathname));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,async()=>{const port=srv.address().port;const b=await chromium.launch();
for(const [name,vp,mob] of [['m',{width:390,height:844},true],['d',{width:1280,height:900},false]]){
 const c=await b.newContext({viewport:vp,deviceScaleFactor:2,isMobile:mob,hasTouch:mob});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 await p.route('**/auth.js',r=>r.fulfill({contentType:'application/javascript',body:STUB}));
 await p.goto(`http://localhost:${port}/yaratish.html`);await p.waitForSelector('.tc');await p.waitForTimeout(1200);
 await p.screenshot({path:`/tmp/yr-${name}-1.png`});
 await p.evaluate(()=>{document.querySelector('#gallery').scrollTo(0,640)});await p.waitForTimeout(300);await p.screenshot({path:`/tmp/yr-${name}-2.png`});
 await p.click('[data-grp="vizitka"]');await p.waitForTimeout(600);await p.evaluate(()=>{document.querySelector('#gallery').scrollTo(0,520)});await p.waitForTimeout(400);await p.screenshot({path:`/tmp/yr-${name}-3.png`});
 console.log(name,er.slice(0,3));await c.close()}
await b.close();srv.close()});
