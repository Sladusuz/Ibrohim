(function(){
var C=window.CLINIC,T=window.I18N,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var lang="uz";try{lang=localStorage.getItem("lang")||(navigator.language||"").slice(0,2)}catch(e){}
if(!T[lang])lang="uz";
var ic=function(n){return'<svg class="i" aria-hidden="true"><use href="#i-'+n+'"/></svg>'};
var SV=["ear","nose","throat","steth","wave","baby"],WY=["target","shield","heart","zap"],TR=["wave","user","shield","steth"],CE=["file","award","shield"];
function render(){
 var t=T[lang];document.documentElement.lang=lang;document.title=t.title;$('meta[name=description]').content=t.desc;
 $('meta[property="og:title"]').content=t.title;$('meta[property="og:description"]').content=t.desc;
 $$("[data-t]").forEach(function(e){e.textContent=t[e.dataset.t]});
 $$(".menu a,.drawer a.l").forEach(function(a){var i=["#services","#doctors","#prices","#reviews","#faq","#contact"].indexOf(a.getAttribute("href"));a.textContent=t.nav[i]});
 $("#fnav").innerHTML=t.nav.map(function(n,i){return'<a href="'+["#services","#doctors","#prices","#reviews","#faq","#contact"][i]+'">'+n+'</a>'}).join("");
 var h=function(id,arr,fn){$(id).innerHTML=arr.map(fn).join("")};
 h("#tr",t.tr,function(x,i){return'<div>'+ic(TR[i])+'<span>'+x+'</span></div>'});
 h("#sv",t.sv,function(x,i){return'<article class="card svc reveal"><div class="ico">'+ic(SV[i])+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></article>'});
 h("#pr",t.pr,function(x){return'<div class="prow"><span>'+x[0]+'</span><em>'+x[1]+'</em></div>'});
 h("#dr",t.dr,function(x){return'<article class="card doc reveal"><div class="ava">'+ic("user")+'</div><h3>'+x[0]+'</h3><small>'+x[1]+'</small><p>'+x[2]+'</p></article>'});
 h("#wy",t.wy,function(x,i){return'<article class="card reveal"><div class="ico">'+ic(WY[i])+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></article>'});
 h("#ce",t.ce,function(x,i){return'<div class="card cert"><div class="ico">'+ic(CE[i])+'</div><h3>'+x[1]+'</h3></div>'});
 h("#rv",t.rv,function(x){return'<article class="card rev"><div class="stars">'+ic("star").repeat(5)+'</div><p>“'+x[0]+'”</p><div class="who"><span>'+ic("user")+'</span>'+x[1]+'</div></article>'});
 h("#st",t.st,function(x,i){return'<article class="card step reveal"><b>'+(i+1)+'</b><h3>'+x[0]+'</h3><p>'+x[1]+'</p></article>'});
 h("#fq",t.fq,function(x){return'<details><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>'});
 $("#fs").innerHTML=t.svopt.map(function(o){return"<option>"+o+"</option>"}).join("");
 $("#ad").textContent=C.address[lang];
 $$(".lang button").forEach(function(b){b.classList.toggle("on",b.dataset.l===lang)});
 $$("[data-ph]").forEach(function(a){a.href="tel:"+C.phone;var s=a.querySelector("span:not([data-t])");if(s)s.textContent=C.phoneView});
 observe();
}
var io=null;function observe(){var els=$$(".reveal:not(.in)");if(!("IntersectionObserver"in window)){els.forEach(function(e){e.classList.add("in")});return}
 if(!io)io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.08,rootMargin:"0px 0px -4% 0px"});els.forEach(function(e){io.observe(e)})}
$$(".lang button").forEach(function(b){b.onclick=function(){lang=b.dataset.l;try{localStorage.setItem("lang",lang)}catch(e){}render()}});
var dr=$("#drawer"),bg=$("#burger");
function tog(o){dr.classList.toggle("open",o);bg.setAttribute("aria-expanded",o);bg.innerHTML='<svg class="i"><use href="#i-'+(o?"x":"menu")+'"/></svg>';document.body.style.overflow=o?"hidden":""}
bg.onclick=function(){tog(!dr.classList.contains("open"))};
$$("#drawer a").forEach(function(a){a.addEventListener("click",function(){tog(false)})});
window.addEventListener("resize",function(){if(innerWidth>1080)tog(false)});
$$("[data-tg]").forEach(function(a){a.href="https://t.me/"+C.telegram;a.target="_blank";a.rel="noopener"});
$("#ig").href=$("#ig2").href="https://instagram.com/"+C.instagram;
if(C.mapEmbed)$("#map").innerHTML='<iframe src="'+C.mapEmbed+'" width="100%" height="260" style="border:0" loading="lazy" allowfullscreen title="Map"></iframe>';
var hd=$("#hdr");function sc(){hd.classList.toggle("sc",scrollY>8)}addEventListener("scroll",sc,{passive:true});sc();
$("#form").onsubmit=function(e){e.preventDefault();var f=e.target,msg="Orlent Medical\n"+f.name.value+"\n"+f.phone.value+"\n"+f.service.value+"\n"+(f.note.value||"-");
 var done=function(){$("#ok").style.display="block";f.reset()};
 if(C.botToken&&C.chatId){fetch("https://api.telegram.org/bot"+C.botToken+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:C.chatId,text:msg})}).then(done)}
 else{try{navigator.clipboard.writeText(msg)}catch(x){}window.open("https://t.me/"+C.telegram,"_blank");done()}};
render();
})();
