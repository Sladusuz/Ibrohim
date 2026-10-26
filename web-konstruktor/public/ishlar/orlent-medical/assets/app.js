(function(){
var C=window.CLINIC,T=window.I18N,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var lang="uz";try{lang=localStorage.getItem("lang")||(navigator.language||"").slice(0,2)}catch(e){}
if(!T[lang])lang="uz";
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
var G=!!(window.gsap&&window.ScrollTrigger)&&!reduce;
var ic=function(n,c){return'<svg class="i'+(c?" "+c:"")+'" aria-hidden="true"><use href="#i-'+n+'"/></svg>'};
var SV=["ear","nose","throat","steth","wave","baby"],WY=["target","shield","heart","zap"],CE=["file","award","shield"],HM=["zap","target","heart"];
var ANCH=["#services","#doctors","#prices","#reviews","#faq","#contact"];
if(G){gsap.registerPlugin(ScrollTrigger);document.documentElement.classList.add("gsap-on")}

function split(el){var words=el.textContent.trim().split(/\s+/);el.innerHTML=words.map(function(w){return'<span class="w"><span>'+w+'</span></span>'}).join(" ")}

function render(first){
 var t=T[lang];document.documentElement.lang=lang;document.title=t.title;$('meta[name=description]').content=t.desc;
 $('meta[property="og:title"]').content=t.title;$('meta[property="og:description"]').content=t.desc;
 $$("[data-t]").forEach(function(e){e.textContent=t[e.dataset.t]});
 $$("[data-split]").forEach(split);
 $$(".menu a,.drawer a.l").forEach(function(a){a.textContent=t.nav[ANCH.indexOf(a.getAttribute("href"))]});
 $("#fnav").innerHTML=t.nav.map(function(n,i){return'<a href="'+ANCH[i]+'">'+n+'</a>'}).join("");
 var h=function(id,arr,fn){$(id).innerHTML=arr.map(fn).join("")};
 h("#hm",t.hm,function(x,i){return'<li>'+ic(HM[i])+x+'</li>'});
 var mq=t.sv.map(function(x){return'<span>'+x[1]+ic("star")+'</span>'}).join("");$("#mq").innerHTML=mq+mq;
 h("#sv",t.sv,function(x,i){return'<article class="card svc spot tilt reveal"><span class="num">0'+(i+1)+'</span><div class="ico">'+ic(SV[i])+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p><a class="go" href="#contact">'+t.more+ic("up")+'</a></article>'});
 h("#wy",t.wy,function(x,i){return'<article class="wi reveal"><div class="ico">'+ic(WY[i])+'</div><div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div><b>0'+(i+1)+'</b></article>'});
 h("#stats",t.stats,function(x){var n=/^\d+$/.test(x[0]);return'<div class="stat reveal"><b'+(n?' data-count="'+x[0]+'"':'')+'>'+x[0]+'</b><span>'+x[1]+'</span></div>'});
 h("#dr",t.dr,function(x){return'<article class="card doc spot tilt reveal"><div class="ph">'+ic("user")+'<em>'+t.dr_ph+'</em></div><div class="bd"><h3>'+x[0]+'</h3><small>'+x[1]+'</small><p>'+x[2]+'</p></div></article>'});
 h("#ce",t.ce,function(x,i){return'<div class="card cert spot reveal"><div class="ico">'+ic(CE[i])+'</div><h3>'+x[1]+'</h3></div>'});
 h("#pr",t.pr,function(x){return'<div class="prow"><span>'+x[0]+'</span><em>'+x[1]+'</em></div>'});
 var rv=t.rv.concat(t.rv).concat(t.rv).concat(t.rv);
 h("#rv",rv,function(x){return'<article class="card rev">'+ic("quote","q")+'<div class="stars">'+ic("star").repeat(5)+'</div><p>“'+x[0]+'”</p><div class="who"><span>'+ic("user")+'</span>'+x[1]+'</div></article>'});
 h("#st",t.st,function(x,i){return'<article class="step reveal"><b>'+(i+1)+'</b><div class="card-in"><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div></article>'});
 h("#fq",t.fq,function(x){return'<details class="reveal"><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>'});
 $("#fs").innerHTML=t.svopt.map(function(o){return"<option>"+o+"</option>"}).join("");
 $("#ad").textContent=C.address[lang];
 $$(".lang button").forEach(function(b){b.classList.toggle("on",b.dataset.l===lang)});
 $$("[data-ph]").forEach(function(a){a.href="tel:"+C.phone;var s=a.querySelector("span:not([data-t])");if(s)s.textContent=C.phoneView});
 bindFx();
 if(G)scrollFx(first);
}

/* ---------- pointer effects ---------- */
function bindFx(){
 $$(".spot").forEach(function(c){if(c._s)return;c._s=1;c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px")})});
 if(!G||!fine)return;
 $$(".tilt").forEach(function(c){if(c._t)return;c._t=1;
  c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(c,{rotationY:x*9,rotationX:-y*9,transformPerspective:900,duration:.5,ease:"power2.out",overwrite:"auto"})});
  c.addEventListener("pointerleave",function(){gsap.to(c,{rotationX:0,rotationY:0,duration:.8,ease:"elastic.out(1,.6)",overwrite:"auto"})})});
 $$(".mag").forEach(function(b){if(b._m)return;b._m=1;
  b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.28,y:(e.clientY-r.top-r.height/2)*.4,duration:.4,ease:"power3.out"})});
  b.addEventListener("pointerleave",function(){gsap.to(b,{x:0,y:0,duration:.9,ease:"elastic.out(1,.5)"})})});
}
if(G&&fine){
 var cur=$("#cur");document.body.classList.add("has-cur");
 var qx=gsap.quickTo(cur,"x",{duration:.35,ease:"power3"}),qy=gsap.quickTo(cur,"y",{duration:.35,ease:"power3"});
 addEventListener("pointermove",function(e){qx(e.clientX);qy(e.clientY)},{passive:true});
 document.addEventListener("pointerover",function(e){cur.classList.toggle("big",!!e.target.closest("a,button,summary,.gal figure,.tilt"))});
 var hv=$(".hvis");if(hv){$(".hero").addEventListener("pointermove",function(e){var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;gsap.to(".blob",{x:x*-18,y:y*-14,duration:1,ease:"power2.out"});gsap.to(".glass",{x:x*26,y:y*20,duration:1.2,ease:"power2.out"});gsap.to(".badge-rot",{x:x*-30,y:y*-22,duration:1.2,ease:"power2.out"})})}
}

/* ---------- scroll effects ---------- */
function scrollFx(first){
 ScrollTrigger.getAll().forEach(function(t){t.kill()});
 ScrollTrigger.batch(".reveal",{start:"top 90%",once:true,onEnter:function(els){gsap.fromTo(els,{y:46,opacity:0},{y:0,opacity:1,duration:1,stagger:.12,ease:"power3.out",overwrite:"auto"})}});
 $$("[data-par]").forEach(function(el){gsap.fromTo(el,{yPercent:-7},{yPercent:7,ease:"none",scrollTrigger:{trigger:el.parentElement,start:"top bottom",end:"bottom top",scrub:true}})});
 $$("[data-count]").forEach(function(el){var end=+el.dataset.count,o={v:0};el.textContent="0";ScrollTrigger.create({trigger:el,start:"top 92%",once:true,onEnter:function(){gsap.to(o,{v:end,duration:1.8,ease:"power2.out",onUpdate:function(){el.textContent=Math.round(o.v)}})}})});
 var sl=$(".sline");if(sl&&getComputedStyle(sl).display!=="none"){gsap.fromTo(sl,{"--p":0},{"--p":1,ease:"none",scrollTrigger:{trigger:"#st",start:"top 75%",end:"bottom 70%",scrub:true}})}
 gsap.utils.toArray(".svc,.doc").forEach(function(){});
 if(!first)ScrollTrigger.refresh();
}

/* ---------- intro ---------- */
function intro(){
 var pl=$("#pl");
 if(!G){pl.style.display="none";return}
 gsap.set(".hero .pill,.hero .lead,.hero .cta,.hmeta li,.blob,.glass,.badge-rot,.scrollhint",{opacity:0});
 var tl=gsap.timeline({defaults:{ease:"power4.out"}});
 tl.to(pl,{opacity:0,duration:.7,delay:.25,onComplete:function(){pl.style.display="none"}})
  .from(".hero .w>span",{yPercent:115,duration:1.15,stagger:.08},"-=.35")
  .to(".hero .pill,.hero .lead,.hero .cta,.hmeta li,.scrollhint",{opacity:1,y:0,duration:.9,stagger:.1,startAt:{y:28}},"-=.8")
  .to(".blob",{opacity:1,scale:1,duration:1.5,startAt:{scale:.82}},"-=1.1")
  .to(".glass,.badge-rot",{opacity:1,scale:1,duration:.9,stagger:.15,ease:"back.out(1.7)",startAt:{scale:.5}},"-=.8");
}

/* ---------- ui ---------- */
$$(".lang button").forEach(function(b){b.onclick=function(){lang=b.dataset.l;try{localStorage.setItem("lang",lang)}catch(e){}render(false)}});
var dr=$("#drawer"),bg=$("#burger"),hd=$("#hdr");
function tog(o){dr.classList.toggle("open",o);bg.setAttribute("aria-expanded",o);bg.innerHTML=ic(o?"x":"menu");document.body.style.overflow=o?"hidden":""}
bg.onclick=function(){tog(!dr.classList.contains("open"))};
$$("#drawer a").forEach(function(a){a.addEventListener("click",function(){tog(false)})});
addEventListener("resize",function(){if(innerWidth>1080)tog(false)});
$$("[data-tg]").forEach(function(a){a.href="https://t.me/"+C.telegram;a.target="_blank";a.rel="noopener"});
$("#ig").href=$("#ig2").href="https://instagram.com/"+C.instagram;
if(C.mapQuery){var q=encodeURIComponent(C.mapQuery);$("#map").classList.add("live");$("#map").innerHTML='<iframe src="https://www.google.com/maps?q='+q+'&output=embed" width="100%" height="280" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="Map"></iframe>';$("#route").href="https://www.google.com/maps/search/?api=1&query="+q}
var pr=$("#prog");function sc(){var y=scrollY;hd.classList.toggle("sc",y>30);var m=document.documentElement.scrollHeight-innerHeight;pr.style.transform="scaleX("+(m>0?y/m:0)+")"}
addEventListener("scroll",sc,{passive:true});sc();
var lb=$("#lb"),lbi=$("img",lb);
document.addEventListener("click",function(e){var f=e.target.closest(".gal figure");if(f){lbi.src=$("img",f).src;lb.classList.add("on")}else if(lb.classList.contains("on"))lb.classList.remove("on")});
addEventListener("keydown",function(e){if(e.key==="Escape"){lb.classList.remove("on");tog(false)}});
$("#form").onsubmit=function(e){e.preventDefault();var f=e.target,msg="Orlent Medical\n"+f.name.value+"\n"+f.phone.value+"\n"+f.service.value+"\n"+(f.note.value||"-");
 var done=function(){$("#ok").style.display="block";f.reset()};
 if(C.botToken&&C.chatId){fetch("https://api.telegram.org/bot"+C.botToken+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:C.chatId,text:msg})}).then(done)}
 else{try{navigator.clipboard.writeText(msg)}catch(x){}window.open("https://t.me/"+C.telegram,"_blank");done()}};

render(true);
var started=false;function go(){if(started)return;started=true;intro();if(G){ScrollTrigger.refresh()}}
if(document.readyState==="complete")go();else addEventListener("load",go);
setTimeout(go,3500);
})();
