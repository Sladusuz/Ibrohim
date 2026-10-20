'use strict';
const TLK=window.TLK,SP=window.SPECS[VID];
const px=(n)=>n+'px';
const mk=(tag,cls,st,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(st)Object.assign(e.style,st);if(html!=null)e.innerHTML=html;return e};
const rich=(s)=>String(s).replace(/\*([^*]+)\*/g,'<span class="lime">$1</span>').replace(/_([^_]+)_/g,'<span class="red">$1</span>').replace(/\^([^^]+)\^/g,'<span class="vio">$1</span>').replace(/~([^~]+)~/g,'<span class="sk">$1</span>').replace(/\n/g,'<br>');
const ev=[];// audio uchun voqealar
function T0(sc,at,d=0){const w=sc.words;if(at==null)return sc.start+d;let i=at;if(typeof at==='string'){const q=at.toLowerCase();i=sc.sw.findIndex((x)=>x.toLowerCase().startsWith(q));if(i<0)i=0}if(i>=w.length)i=w.length-1;return w[Math.max(0,i)]+d}
const popT=(el,u,a,d=.5,o={})=>{const s0=o.s0==null?.7:o.s0,p=E.sp(seg(u,a,a+d));S(el,{opacity:clamp(seg(u,a,a+.08)),transform:`translate(${(o.x||0)*(1-p)}px,${(o.y||0)*(1-p)}px) scale(${s0+(1-s0)*p}) rotate(${(o.r||0)*(1-p)}deg)`})};
const slamT=(el,u,a,d=.3,rot=0)=>{const p=E.o5(seg(u,a,a+d));S(el,{opacity:clamp(seg(u,a,a+.06)),transform:`rotate(${rot}deg) scale(${2.2-1.2*p})`})};
const place=(e,o)=>{S(e,{left:px(o.x||0),top:px(o.y||0)});if(o.w)e.style.width=px(o.w);if(o.h)e.style.height=px(o.h);return e};
const ENT=(o,def)=>Object.assign({},def||{},o.from||{});
// ---------------- qatlam yasovchilar: har biri {el, upd(t)} qaytaradi (t = absolyut vaqt)
const B={};
B.text=(o,sc,A,O)=>{const e=place(mk('div','tx',{fontSize:px(o.size||120),color:o.color||'#fff',textAlign:o.align||'left',letterSpacing:px(o.ls==null?-(o.size||120)*.03:o.ls),fontWeight:o.weight||800,lineHeight:o.lh||.98,transformOrigin:o.origin||'50% 50%'},rich(o.text)),o);if(o.w)e.style.width=px(o.w);
  const sk=e.querySelector('.sk'),sa=o.strike!=null?T0(sc,o.strike):null;
  return{el:e,upd(t){const u=t-A;if(o.slam)slamT(e,u,0,.3,o.rot||0);else popT(e,u,0,.5,ENT(o,{y:o.dy==null?40:o.dy,s0:.92}));if(sk)sk.style.setProperty('--s',sa==null?0:E.o3(seg(t,sa,sa+.35)));if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.pill=(o,sc,A,O)=>{const e=place(mk('div','pill',{fontSize:px(o.size||50),padding:o.pad||'20px 44px',background:o.bg||'#fff',color:o.fg||'#0a0c1c',border:o.border||'none',boxShadow:o.sh||'none'},rich(o.text)),o);if(o.rot)e.dataset.rot=o.rot;if(o.center){e.style.transform='translateX(-50%)'}return{el:e,upd(t){const u=t-A;popT(e,u,0,.45,ENT(o,{x:o.dx==null?-200:o.dx,s0:.85,r:o.rot||0}));if(o.rot)e.style.transform+=` rotate(${o.rot}deg)`;if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.photo=(o,sc,A,O)=>{const e=place(mk('div','fr',{borderRadius:px(o.r==null?60:o.r)}),o);const i=mk('div','ph',{backgroundImage:`url(${o.src})`,backgroundPosition:o.pos||'50% 25%'});e.appendChild(i);
  const ga=o.gray!=null?T0(sc,o.gray):null;
  return{el:e,upd(t){const u=t-A;const p=E.o5(seg(u,0,.7));S(e,{opacity:clamp(seg(u,0,.18)),transform:`translate(${(o.dx||0)*(1-p)}px,${(o.dy==null?60:o.dy)*(1-p)}px) scale(${.92+.08*p}) rotate(${(o.rot||0)*(1-p)}deg)`});S(i,{transform:`scale(${1.02+.1*seg(u,0,6)})`,filter:ga!=null&&t>=ga?`grayscale(${seg(t,ga,ga+.3)}) brightness(${1-.4*seg(t,ga,ga+.3)})`:'none'});if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.phone=(o,sc,A,O)=>{const w=o.w||520,h=o.h||1080,e=place(mk('div','phn',{width:px(w),height:px(h)}),o);const scr=mk('div','scr',{backgroundImage:`url(${o.img})`,backgroundSize:'100% auto',backgroundPositionY:'0px'});e.appendChild(scr);e.appendChild(mk('div','nt'));
  const iw=o.iw||780,k=(w-32)/iw,sc2=o.sc||[0,0],dur=Math.max(1,(o.sd||(sc.end-A)));
  return{el:e,upd(t){const u=t-A;const p=E.o5(seg(u,0,.8));S(e,{opacity:clamp(seg(u,0,.18)),transform:`translate(${(o.dx||0)*(1-p)}px,${(o.dy==null?900:o.dy)*(1-p)}px) perspective(2200px) rotateY(${(o.ry==null?-12:o.ry)*(1-p)+Math.sin(u*1.3)*3}deg) rotate(${(o.rot||0)+Math.sin(u)*1.2}deg) scale(${.95+.05*p})`});scr.style.backgroundPositionY=px(-k*(sc2[0]+(sc2[1]-sc2[0])*E.io(seg(u,.5,dur))));if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.2))}}};
B.chat=(o,sc,A,O)=>{const e=place(mk('div','tg',{height:px(o.h||900)}),o);const hd=mk('div','hd',null,`<i>${o.head&&o.head.ico||'🤖'}</i><div><b>${o.head&&o.head.name||'Bot'}</b><span>${o.head&&o.head.sub||'bot'}</span></div>`);const bd=mk('div','bd');e.appendChild(hd);e.appendChild(bd);
  const items=o.msgs.map((m)=>{const rw=mk('div','rw '+(m.me?'me':'bot'));const g=mk('div','mg '+(m.me?'me':'bot'),{fontSize:px(m.size||41)},rich(m.text)+`<small>${m.time||'02:14'}${m.me?' ✓✓':''}</small>`);rw.appendChild(g);let ty=null;if(!m.me){ty=mk('div','ty',null,'•••');rw.appendChild(ty)}bd.appendChild(rw);let bt=null;if(m.btns){bt=mk('div','mb');m.btns.forEach((x)=>bt.appendChild(mk('span',null,null,x)));bd.appendChild(bt)}return{m,rw,g,ty,bt,at:T0(sc,m.at)}});
  return{el:e,upd(t){const u=t-A;popT(e,u,0,.5,{y:120,s0:.94});items.forEach((it)=>{const lu=t-it.at;const vis=lu>=0;S(it.g,{opacity:vis?clamp(seg(lu,0,.1)):0,transform:vis?`scale(${.85+.15*E.sp(seg(lu,0,.35))})`:'scale(.85)',transformOrigin:it.m.me?'100% 100%':'0% 100%'});if(it.ty)S(it.ty,{opacity:(!vis&&lu>-.7)?1:0});if(it.bt)S(it.bt,{opacity:lu>.35?clamp(seg(lu,.35,.55)):0})});if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.2))}}};
B.list=(o,sc,A,O)=>{const e=mk('div','abs');const rows=o.items.map((it,i)=>{const r=mk('div','row',{left:px(o.x||0),top:px((o.y||0)+i*(o.gap||300)),width:px(o.w||900),minHeight:px((o.gap||300)-60),fontSize:px(o.size||72),background:it.bg||(o.bg||'rgba(255,255,255,.1)'),color:it.fg||'#fff',borderColor:it.bc||'rgba(255,255,255,.28)'},`<i style="${it.ib?'background:'+it.ib:''}">${it.ico||'✓'}</i><span>${rich(it.t)}</span>`);e.appendChild(r);return{r,at:T0(sc,it.at),i}});
  return{el:e,upd(t){rows.forEach((x)=>{const u=t-x.at;popT(x.r,u,0,.45,{x:x.i%2?400:-400,s0:.92});if(O!=null)x.r.style.opacity=Math.min(+x.r.style.opacity,1-seg(t,O,O+.18))})}}};
B.cards=(o,sc,A,O)=>{const e=mk('div','abs');const cols=o.cols||2,cw=((o.w||960)-(cols-1)*(o.gap||24))/cols;const cs=o.items.map((it,i)=>{const c=mk('div','card',{left:px((o.x||0)+(i%cols)*(cw+(o.gap||24))),top:px((o.y||0)+Math.floor(i/cols)*((o.ch||360)+(o.gap||24))),width:px(cw),height:px(o.ch||360),background:it.bg||'rgba(255,255,255,.09)'},`<i>${it.ico}</i><b>${rich(it.t)}</b><span>${rich(it.s||'')}</span>`);e.appendChild(c);return{c,at:T0(sc,it.at),i}});
  return{el:e,upd(t){cs.forEach((x)=>{popT(x.c,t-x.at,0,.5,{y:70,s0:.85,r:x.i%2?3:-3});if(O!=null)x.c.style.opacity=Math.min(+x.c.style.opacity,1-seg(t,O,O+.18))})}}};
B.num=(o,sc,A,O)=>{const e=place(mk('div','tx',{fontSize:px(o.size||300),color:o.color||'var(--lime)',textAlign:o.align||'center',letterSpacing:px(-(o.size||300)*.04),textShadow:o.glow?'0 0 90px rgba(200,255,58,.55)':'none'}),o);const f=o.fmt||((n)=>fmt(n));
  return{el:e,upd(t){const u=t-A;const p=E.o3(seg(u,0,o.dur||1.1));e.textContent=(o.pre||'')+f((o.from||0)+((o.to)-(o.from||0))*p)+(o.suf||'');const sp=E.sp(seg(u,0,.6));S(e,{opacity:clamp(seg(u,0,.1)),transform:`scale(${(.5+.5*sp)*(1+.03*Math.sin(u*9)*(o.pulse?1:0))})`});if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.btn=(o,sc,A,O)=>{const e=place(mk('div','pill',{fontSize:px(o.size||64),display:'flex',alignItems:'center',justifyContent:'center',borderRadius:px(o.r||90),background:o.bg||'var(--lime)',color:o.fg||'#0a0c1c',boxShadow:'0 30px 100px -10px rgba(200,255,58,.6)'},rich(o.text)),o);e.style.height=px(o.h||170);
  return{el:e,upd(t){const u=t-A;popT(e,u,0,.55,{y:100,s0:.85});e.style.filter=`brightness(${1+.07*Math.sin(u*8)*seg(u,.5,8)})`;if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.ring=(o,sc,A,O)=>{const e=place(mk('div','abs',{width:'560px',height:'560px'}),o);e.innerHTML=`<svg width="560" height="560" viewBox="0 0 560 560" style="position:absolute;inset:0;transform:rotate(-90deg)"><circle cx="280" cy="280" r="250" stroke="rgba(255,255,255,.14)" stroke-width="26" fill="none"/><circle id="arc" cx="280" cy="280" r="250" stroke="#c8ff3a" stroke-width="26" fill="none" stroke-linecap="round" stroke-dasharray="1571" stroke-dashoffset="1571"/></svg><div class="nd" style="left:0;right:0;top:150px;font-size:170px;line-height:1" id="rt"></div><div class="nd" style="left:0;right:0;top:350px;font-size:50px;color:#c9cdf5" id="rl"></div>`;const arc=e.querySelector('#arc'),rt=e.querySelector('#rt'),rl=e.querySelector('#rl');const d=o.dur||3;
  return{el:e,upd(t){const u=t-A;const p=E.o3(seg(u,.2,d));arc.setAttribute('stroke-dashoffset',String(1571*(1-p)));const rem=Math.max(0,Math.round((o.secs||300)*(1-p)));rt.textContent=p>=.995?'✓':Math.floor(rem/60)+':'+String(rem%60).padStart(2,'0');rl.textContent=p>=.995?(o.done||'TAYYOR'):(o.label||'daqiqa');popT(e,u,0,.5,{s0:.7});if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.flow=(o,sc,A,O)=>{const e=mk('div','abs');const n=o.nodes.length,vert=o.vert!==false,gap=o.gap||300,sz=o.size||150,fs=o.fs||44;const ns=o.nodes.map((nd,i)=>{const cx=vert?(o.x||540):(o.x||540)-(n-1)*gap/2+i*gap,y=vert?(o.y||0)+i*gap:(o.y||0);const w=vert?660:gap;const d=mk('div','nd',{left:px(cx-w/2),top:px(y),width:px(w),fontSize:px(fs)},`<i style="width:${sz}px;height:${sz}px;font-size:${sz*.52}px;background:${nd.bg||'rgba(255,255,255,.12)'}">${nd.ico}</i>${rich(nd.t)}`);e.appendChild(d);let ar=null;if(i<n-1){ar=mk('div','nd',{left:px(vert?cx-330:cx+gap/2-40),top:px(vert?y+sz+fs*(nd.t.split('\n').length)*1.25+6:y+sz/2-44),width:vert?'660px':'80px',fontSize:'70px',color:'var(--lime)'},vert?'↓':'→');e.appendChild(ar)}return{d,ar,at:T0(sc,nd.at)}});
  return{el:e,upd(t){ns.forEach((x,i)=>{popT(x.d,t-x.at,0,.5,{y:vert?60:0,x:vert?0:60,s0:.85});if(x.ar)x.ar.style.opacity=t>x.at+.3?clamp(seg(t,x.at+.3,x.at+.5)):0;if(O!=null)x.d.style.opacity=Math.min(+x.d.style.opacity,1-seg(t,O,O+.18))})}}};
B.notif=(o,sc,A,O)=>{const e=place(mk('div','nt2',{width:px(o.w||760)}),o);e.innerHTML=`<i>${o.ico||'🔔'}</i><div><b>${rich(o.t)}</b><span>${o.s||''}</span></div>`;return{el:e,upd(t){popT(e,t-A,0,.5,{x:o.dx==null?400:o.dx,s0:.9});if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
B.logo=(o,sc,A,O)=>{const e=place(mk('img',null,{width:px(o.w||220),height:px(o.w||220),borderRadius:px((o.w||220)*.26),border:'4px solid #c8ff3a',boxShadow:'0 0 100px rgba(200,255,58,.5)',position:'absolute'}),o);e.src='../assets/logo-mark.png';return{el:e,upd(t){popT(e,t-A,0,.6,{s0:.4,r:-10});if(O!=null)e.style.opacity=Math.min(+e.style.opacity,1-seg(t,O,O+.18))}}};
// ---------------- sahnalar
const sceneEls=[];const scs=L('scs');
SP.scenes.forEach((s,i)=>{const t=TLK.scenes[i];const sc=Object.assign({},t,{sw:t.sw});const el=mk('div','sc');el.id='s'+i;scs.appendChild(el);
  const bg=s.bg||{};const bgw=mk('div','L');const PAL=[['rgba(122,92,255,.38)','rgba(200,255,58,.14)'],['rgba(42,171,238,.34)','rgba(122,92,255,.2)'],['rgba(255,77,150,.3)','rgba(122,92,255,.2)'],['rgba(200,255,58,.2)','rgba(42,171,238,.22)']];const pl=PAL[(bg.c1?0:i)%4];
  bgw.style.background=`radial-gradient(1000px 1000px at 15% 12%,${bg.c1||pl[0]},transparent 70%),radial-gradient(1000px 1000px at 90% 62%,${bg.c2||pl[1]},transparent 70%),linear-gradient(${(bg.grad||['#0b0f2a','#05070f'])[0]},${(bg.grad||['#0b0f2a','#05070f'])[1]})`;
  el.appendChild(bgw);
  const layers=(s.L||[]).map((o)=>{const A=T0(sc,o.at,o.d||0);const O=o.out!=null?T0(sc,o.out):null;const b=B[o.k](o,sc,A,O);b.d=b.el.style.display;b.el.style.display='none';b.A=A;b.O=O;el.appendChild(b.el);ev.push({t:A,k:o.k});return b});
  sceneEls.push({el,sc,layers,s,bgw})});
ev.push(...TLK.scenes.map((x)=>({t:x.start,k:'scene'})));
window.__events=()=>ev.concat((SP.scenes||[]).map((s,i)=>s.shake!=null?{t:T0(sceneEls[i].sc,s.shake),k:'shake'}:null).filter(Boolean));
function caps(t){let c=null;for(const x of TLK.caps){if(t>=x[1]&&t<x[2]+.05){c=x;break}}const el=L('capt');if(!c){el.innerHTML='';return}
  const wl=c[0].split(' '),n=wl.length,dur=c[2]-c[1];let html='',state=false;
  wl.forEach((w,i)=>{if(w.startsWith('*'))state=true;const t0=c[1]+dur*(i/n)*.5;const clean=w.replace(/\*/g,'');if(t>=t0)html+=`<span class="${state?'k':''}" style="transform:scale(${1+.28*Math.max(0,1-(t-t0)*7)})">${clean}</span>`;if(w.endsWith('*'))state=false});
  el.innerHTML=html}
function frame(t){
  if(Math.floor(t*24)!==frame.lg){frame.lg=Math.floor(t*24);grain(t)}
  S(L('pg'),{width:(t/TLK.end*100)+'%'});
  let fl=0,shx=0,shy=0;
  sceneEls.forEach((x,i)=>{const a=x.sc.start,b=(i+1<sceneEls.length?sceneEls[i+1].sc.start:TLK.end);const on=t>=a&&t<b+.15;x.el.style.display=on?'block':'none';if(!on)return;
    const u=t-a;S(x.el,{opacity:clamp(seg(u,0,.1)),transform:`scale(${1+.03*(1-E.o3(seg(u,0,.3)))})`});
    if(x.bgw.bg){S(x.bgw.bg,{transform:`scale(${1.4+.06*seg(u,0,6)})`})}
    if(i>0&&x.s.flash!==false)fl=Math.max(fl,1-Math.abs(t-a)/.1);
    if(x.s.shake!=null){const s=shake(t,T0(x.sc,x.s.shake));shx+=s[0];shy+=s[1]}
    x.layers.forEach((l)=>{const show=t>=l.A-.02&&(l.O==null||t<l.O+.25);l.el.style.display=show?l.d:'none';if(show)l.upd(t)})});
  S(L('flash'),{display:fl>0?'block':'none',opacity:Math.max(0,fl)*.7});S(L('scs'),{transform:`translate(${shx}px,${shy}px)`});
  caps(t)}
window.__frame=frame;frame(0);

// rasmlarni oldindan yuklash (display:none ichida ular yuklanmaydi)
window.__ready=false;(function(){const urls=new Set();document.querySelectorAll('[style*="url("]').forEach((e)=>{const m=e.getAttribute('style').match(/url\(([^)]+)\)/);if(m)urls.add(m[1].replace(/["']/g,''))});document.querySelectorAll('img').forEach((i)=>urls.add(i.getAttribute('src')));
Promise.all([...urls].map((u)=>new Promise((r)=>{const im=new Image();im.onload=im.onerror=()=>{(im.decode?im.decode():Promise.resolve()).then(r,r)};im.src=u}))).then(()=>{window.__ready=true})})();
