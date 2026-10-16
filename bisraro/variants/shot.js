const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});
for(const f of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){await pg.goto('file://'+process.cwd()+'/'+f,{waitUntil:'networkidle'});await pg.waitForTimeout(800);await pg.screenshot({path:'/tmp/claude-0/-home-user-Ibrohim/247212e8-8362-52bd-9679-64d935086726/scratchpad/'+f.replace('.html','.png'),fullPage:true});console.log(f)}
await b.close()})();
