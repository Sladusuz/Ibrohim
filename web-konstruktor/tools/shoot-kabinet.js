const http=require('http'),fs=require('fs'),path=require('path');const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const P='/home/user/impro/public';const MIME={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');let f=path.join(P,decodeURIComponent(u.pathname));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const STUB=`window.Auth={enabled:true,init:async()=>{},user:()=>({name:'Ibrohim Abdulboqiyev',phone:'+998 90 123 45 67',email:'ibrohim@mail.uz'}),modal:async()=>({}),logout(){},_set(){},request:async(p)=>{
if(p.includes('projects'))return [{id:'a1',name:'TurboGarage',status:'qoralama',template:'avtoservis',updatedAt:'2026-10-20T02:52:00',paid:false,published:false},{id:'a2',name:'Lola Beauty',status:'joylandi',template:'salon',updatedAt:'2026-10-18T11:20:00',paid:true,published:true,url:'https://lola.improuzbekiston.uz',price:"1 500 000 so'm",adminNote:'Domen ulandi'},{id:'a3',name:'Royal Barber',status:'narx',template:'barber',updatedAt:'2026-10-15T09:00:00',price:"2 500 000 so'm"}];
if(p.includes('orders'))return [{id:'1042',status:'jarayonda',date:'2026-10-19T14:05:00',type:'brief',message:'Korporativ sayt kerak',extra:{Xizmat:'Korporativ sayt','Biznes nomi':'TurboGarage'},total:2500000}];
if(p.includes('leads'))return [{id:'77',name:'Sevara A.',phone:'+998 97 678 90 12',site:'lola',date:'2026-10-20T10:12:00',type:'booking',items:[{name:'Soch bo\\'yash',qty:1}],total:350000}];
if(p.includes('referral'))return {enabled:true,discountPct:10,rewardUsd:3,link:'https://improuzbekiston.uz/?ref=IBR123',invited:4,rewarded:1,credit:3};return {}}};`;
srv.listen(0,async()=>{const port=srv.address().port;const b=await chromium.launch();
for(const [name,vp] of [['m',{width:390,height:844}],['d',{width:1280,height:900}]]){
 const c=await b.newContext({viewport:vp,deviceScaleFactor:2});const p=await c.newPage();await p.route('**/auth.js',r=>r.fulfill({contentType:'application/javascript',body:STUB}));
 await p.goto(`http://localhost:${port}/kabinet.html`);await p.waitForSelector('.hero');await p.waitForTimeout(900);
 for(const t of ['sites','orders','leads','prof']){await p.click(`[data-t="${t}"]`);await p.waitForTimeout(300);await p.screenshot({path:`/tmp/kab-${name}-${t}.png`,fullPage:true})}
 await c.close()}
await b.close();srv.close();console.log('ok')});
