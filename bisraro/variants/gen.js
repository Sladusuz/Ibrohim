const fs=require('fs');
const T=[
{n:'1-espresso-oltin',name:'Espresso & Shampan oltin',bg:'#0F0A07',bg2:'#1B120C',card:'#22170F',tx:'#F6EBDD',mut:'rgba(246,235,221,.68)',ac:'#D9B66A',ac2:'#F2DCA0',on:'#1A120B',line:'rgba(217,182,106,.25)',glow:'rgba(217,182,106,.18)',serif:'Fraunces',lay:'split'},
{n:'2-fildan-suyagi-kakao',name:'Fil suyagi & Kakao (yorug\' editorial)',bg:'#FAF4EA',bg2:'#F0E4D2',card:'#FFFFFF',tx:'#2E1A10',mut:'rgba(46,26,16,.68)',ac:'#8A4B2A',ac2:'#B97A4E',on:'#FFF8F0',line:'rgba(46,26,16,.15)',glow:'rgba(185,122,78,.25)',serif:'Fraunces',lay:'center'},
{n:'3-zumrad-oltin',name:'Zumrad yashil & Oltin',bg:'#08241D',bg2:'#0E332A',card:'#12402F',tx:'#EEF3E6',mut:'rgba(238,243,230,.7)',ac:'#D4B35E',ac2:'#EED58F',on:'#08241D',line:'rgba(212,179,94,.28)',glow:'rgba(212,179,94,.16)',serif:'Cormorant Garamond',lay:'split'},
{n:'4-bordo-roz-oltin',name:'Bordo (qizil vino) & Roz-oltin',bg:'#2C0A15',bg2:'#3E1021',card:'#4A1628',tx:'#FBEDE8',mut:'rgba(251,237,232,.7)',ac:'#E3A98E',ac2:'#F6D2BF',on:'#2C0A15',line:'rgba(227,169,142,.28)',glow:'rgba(227,169,142,.18)',serif:'Playfair Display',lay:'center'},
{n:'5-pushti-kakao',name:'Nozik pushti & Kakao (zamonaviy)',bg:'#F7E3DB',bg2:'#F1D2C7',card:'#FFF7F3',tx:'#3A1E14',mut:'rgba(58,30,20,.7)',ac:'#5A2A1A',ac2:'#9A5A3E',on:'#FFF4EE',line:'rgba(58,30,20,.16)',glow:'rgba(154,90,62,.22)',serif:'Fraunces',lay:'split'},
];
const prods=[['bisraro-liya','Bisraro Liya'],['sladus-duo','Sladus Duo'],['dorro','Dorro'],['bunibi-larus','Bunibi Larus']];
const awards=['prodexpo-2023-oltin-medal','prodexpo-2023-laureat-diplomi','f-istanbul-plaketa'];
for(const t of T){
const gl=t.serif.replace(/ /g,'+');
const hero=t.lay==='split'?`
<div class="c hero split"><div><p class="k">Healthy Food Production • 2016-yildan</p><h1>Shokolad <em>san'ati.</em><br>O'zbekistondan dunyoga.</h1><p class="sub">Zamonaviy texnologiya va sifatli xomashyo asosida tayyorlangan premium shokolad mahsulotlari.</p><div class="b"><a class="btn f">Katalogni ko'rish</a><a class="btn">Biz haqimizda</a></div>
<div class="st"><div><b>Oltin medal</b><span>ProdExpo 2023</span></div><div><b>2016</b><span>Tashkil topgan</span></div><div><b>10+</b><span>Mahsulot turi</span></div></div></div>
<div class="vis"><div class="halo"></div><img class="p1" src="../img/mahsulot/bisraro-liya.webp"><img class="p2" src="../img/mahsulot/sladus-duo.webp"></div></div>`:`
<div class="c hero cen"><p class="k">Healthy Food Production • 2016-yildan</p><h1>Shokolad <em>san'ati.</em><br>O'zbekistondan dunyoga.</h1><p class="sub">Zamonaviy texnologiya va sifatli xomashyo asosida tayyorlangan premium shokolad mahsulotlari.</p><div class="b"><a class="btn f">Katalogni ko'rish</a><a class="btn">Biz haqimizda</a></div>
<div class="vis3"><img src="../img/mahsulot/sladus-duo.webp"><img class="mid" src="../img/mahsulot/bisraro-liya.webp"><img src="../img/mahsulot/dorro.webp"></div></div>`;
fs.writeFileSync(t.n+'.html',`<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BISRARO — ${t.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${gl}:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0}body{background:${t.bg};color:${t.tx};font-family:Manrope,sans-serif;line-height:1.6}
.c{max-width:1360px;margin:auto;padding:0 48px}a{color:inherit}
header .c{display:flex;align-items:center;justify-content:space-between;height:88px}
header img{height:46px;display:block}nav{display:flex;gap:34px;font-size:14px;font-weight:500;color:${t.mut}}
.btn{display:inline-block;padding:15px 30px;border-radius:999px;border:1px solid ${t.ac};font-weight:600;font-size:14px;color:${t.ac}}
.btn.f{background:linear-gradient(135deg,${t.ac},${t.ac2});color:${t.on};border-color:transparent;box-shadow:0 10px 30px ${t.glow}}
.hero{padding-top:36px;padding-bottom:70px}.k{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:${t.ac};font-weight:600}
h1{font-family:'${t.serif}',serif;font-weight:500;font-size:84px;line-height:1.02;margin:22px 0;letter-spacing:-.01em}h1 em{color:${t.ac};font-style:italic}
.sub{max-width:520px;color:${t.mut};font-size:17px;margin-bottom:34px}.b{display:flex;gap:14px}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}
.st{display:flex;gap:44px;margin-top:52px;padding-top:26px;border-top:1px solid ${t.line}}.st b{display:block;font-family:'${t.serif}',serif;font-size:28px;color:${t.ac};font-weight:500}.st span{font-size:13px;color:${t.mut}}
.vis{position:relative;height:560px}.halo{position:absolute;inset:40px 0 0 40px;border-radius:50%;background:radial-gradient(circle,${t.glow},transparent 68%);}
.vis img{position:absolute;filter:drop-shadow(0 30px 40px rgba(0,0,0,.35))}.p1{width:380px;right:90px;top:20px;transform:rotate(-6deg)}.p2{width:300px;right:-10px;bottom:10px;transform:rotate(7deg)}
.cen{text-align:center}.cen .sub{margin:0 auto 34px}.cen .b{justify-content:center}.cen h1{font-size:92px}
.vis3{display:flex;justify-content:center;align-items:flex-end;gap:10px;margin-top:40px}.vis3 img{width:300px;filter:drop-shadow(0 26px 34px rgba(0,0,0,.35))}.vis3 .mid{width:360px;margin-bottom:24px}
.band{background:${t.bg2};padding:70px 0}.h2{font-family:'${t.serif}',serif;font-size:44px;font-weight:500;margin:10px 0 36px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}.card{background:${t.card};border:1px solid ${t.line};border-radius:22px;padding:22px;text-align:center}
.card img{width:100%;height:210px;object-fit:contain}.card h3{font-family:'${t.serif}',serif;font-weight:500;font-size:22px;margin-top:12px}.card p{font-size:13px;color:${t.mut}}
.aw{display:flex;gap:20px;align-items:center;margin-top:46px}.aw img{height:110px;border-radius:12px}.aw span{color:${t.mut};font-size:14px;margin-left:10px}
</style></head><body>
<header><div class="c"><img src="../img/bisraro-logo.webp" alt="BISRARO" style="${t.bg[1]>'a'||t.n[0]=='2'||t.n[0]=='5'?'':''}"><nav><a>Bosh sahifa</a><a>Biz haqimizda</a><a>Katalog</a><a>Yutuqlarimiz</a><a>Kontakt</a></nav><a class="btn f">Hamkorlik uchun</a></div></header>
${hero}
<section class="band"><div class="c"><p class="k">Katalog</p><h2 class="h2">Mashhur mahsulotlar</h2><div class="g4">${prods.map(p=>`<div class="card"><img src="../img/mahsulot/${p[0]}.webp"><h3>${p[1]}</h3><p>Premium shokolad</p></div>`).join('')}</div>
<div class="aw">${awards.map(a=>`<img src="../img/mukofot/${a}.webp">`).join('')}<span>ProdExpo 2023 — oltin medal va laureat diplomi</span></div></div></section>
</body></html>`);}
