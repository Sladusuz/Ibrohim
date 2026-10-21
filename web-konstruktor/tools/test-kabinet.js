const http=require('http'),fs=require('fs'),path=require('path');const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const src=fs.readFileSync('/tmp/kabshot.js','utf8');const STUB=eval('`'+src.match(/const STUB=`([\s\S]*?)`;/)[1]+'`');
const P='/home/user/impro/public';const MIME={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');let f=path.join(P,decodeURIComponent(u.pathname));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,async()=>{const port=srv.address().port;const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/auth.js',r=>r.fulfill({contentType:'application/javascript',body:STUB}));
await p.goto(`http://localhost:${port}/kabinet.html`);await p.waitForSelector('.hero');await p.waitForTimeout(800);
await p.evaluate(()=>{window.__nav=document.querySelector('#bnav');window.__btn=document.querySelector('#bnav button[data-t="orders"]')});
const res=[];
for(const t of ['orders','leads','prof','sites','orders','sites','leads','prof']){
  await p.evaluate(()=>window.scrollTo(0,300));
  await p.tap(`#bnav button[data-t="${t}"]`);await p.waitForTimeout(250);
  res.push(await p.evaluate((t)=>({t,y:Math.round(scrollY),docH:document.documentElement.scrollHeight,vh:innerHeight,vw:innerWidth,sameNav:window.__nav===document.querySelector('#bnav'),sameBtn:window.__btn===document.querySelector('#bnav button[data-t="orders"]'),on:document.querySelector('#bnav button.on')?.dataset.t,scale:visualViewport.scale}),t));
}
console.log(res.map(r=>JSON.stringify(r)).join('\n'));console.log('xatolar',errs);
await b.close();srv.close()});
