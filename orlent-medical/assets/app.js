(function(){
var C=window.CLINIC,T=window.I18N,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var lang="uz";try{lang=localStorage.getItem("lang")||(navigator.language||"").slice(0,2)}catch(e){}
if(!T[lang])lang="uz";
function set(sel,v){var e=$(sel);if(e)e.textContent=v}
function render(){
 var t=T[lang];document.documentElement.lang=lang;document.title=t.title;$('meta[name=description]').content=t.desc;
 $('meta[property="og:title"]').content=t.title;$('meta[property="og:description"]').content=t.desc;
 $$("[data-t]").forEach(function(e){e.textContent=t[e.dataset.t]});
 $$("#menu a").forEach(function(a,i){a.textContent=t.nav[i]});
 var h=function(id,arr,fn){$(id).innerHTML=arr.map(fn).join("")};
 h("#sv",t.sv,function(x){return'<div class="card reveal in"><div class="ico">'+x[0]+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div>'});
 h("#pr",t.pr,function(x){return'<div class="prow"><span>'+x[0]+'</span><em>'+x[1]+'</em></div>'});
 h("#dr",t.dr,function(x){return'<div class="card doc"><div class="ava">🧑‍⚕️</div><h3>'+x[0]+'</h3><small>'+x[1]+'</small><p>'+x[2]+'</p></div>'});
 h("#wy",t.wy,function(x){return'<div class="card"><div class="ico">'+x[0]+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div>'});
 h("#ce",t.ce,function(x){return'<div class="card cert"><div class="ico">'+x[0]+'</div><h3 style="font-size:17px">'+x[1]+'</h3></div>'});
 h("#rv",t.rv,function(x){return'<div class="card rev"><div class="stars">★★★★★</div><p>“'+x[0]+'”</p><b>'+x[1]+'</b></div>'});
 h("#st",t.st,function(x,i){return'<div class="card step"><b>'+(i+1)+'</b><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div>'});
 h("#fq",t.fq,function(x){return'<details><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>'});
 $("#fs").innerHTML=t.svopt.map(function(o){return"<option>"+o+"</option>"}).join("");
 $("#ad").textContent=C.address[lang];
 $$(".lang button").forEach(function(b){b.classList.toggle("on",b.dataset.l===lang)});
}
$$(".lang button").forEach(function(b){b.onclick=function(){lang=b.dataset.l;try{localStorage.setItem("lang",lang)}catch(e){}render()}});
$("#burger").onclick=function(){$("#menu").classList.toggle("open")};
$$("#menu a").forEach(function(a){a.onclick=function(){$("#menu").classList.remove("open")}});
$$("[data-ph]").forEach(function(a){a.href="tel:"+C.phone;if(!a.hasAttribute("data-keep"))a.textContent=C.phoneView});
$$("[data-tg]").forEach(function(a){a.href="https://t.me/"+C.telegram});
$("#ig").href="https://instagram.com/"+C.instagram;
if(C.mapEmbed)$("#map").innerHTML='<iframe src="'+C.mapEmbed+'" width="100%" height="260" style="border:0" loading="lazy" allowfullscreen></iframe>';
$("#form").onsubmit=function(e){e.preventDefault();var f=e.target,msg="🆕 Orlent Medical\n👤 "+f.name.value+"\n📞 "+f.phone.value+"\n🩺 "+f.service.value+"\n💬 "+(f.note.value||"-");
 var done=function(){$("#ok").style.display="block";f.reset()};
 if(C.botToken&&C.chatId){fetch("https://api.telegram.org/bot"+C.botToken+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:C.chatId,text:msg})}).then(done)}
 else{try{navigator.clipboard.writeText(msg)}catch(x){}window.open("https://t.me/"+C.telegram,"_blank");done()}};
if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.12});$$(".reveal").forEach(function(e){io.observe(e)})}else $$(".reveal").forEach(function(e){e.classList.add("in")});
render();
})();
