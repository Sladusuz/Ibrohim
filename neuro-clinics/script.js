(function(){
  var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  // preloader
  addEventListener('load',function(){setTimeout(function(){$('#preloader').classList.add('hide')},500)});
  setTimeout(function(){$('#preloader').classList.add('hide')},3000);
  $('#yr').textContent=new Date().getFullYear();

  // nav, progress, steps line
  var nav=$('#nav'),prog=$('#progress'),fill=$('#lineFill');
  function onScroll(){
    var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    nav.classList.toggle('scrolled',y>30);
    prog.style.width=(y/h*100)+'%';
    var st=$('.steps');
    if(st){var r=st.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.75-r.top)/(r.height+120)));fill.style.width=(p*100)+'%'}
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // mobile menu
  var burger=$('#burger'),links=$('#links');
  burger.onclick=function(){burger.classList.toggle('open');links.classList.toggle('open')};
  $$('a',links).forEach(function(a){a.onclick=function(){burger.classList.remove('open');links.classList.remove('open')}});

  // reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  $$('.reveal').forEach(function(el){io.observe(el)});

  // cursor glow + tilt
  var glow=$('#cursorGlow');
  addEventListener('pointermove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
  if(!reduce&&matchMedia('(hover:hover)').matches){
    $$('[data-tilt]').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        el.style.transform='perspective(800px) rotateY('+((x-.5)*10)+'deg) rotateX('+((.5-y)*10)+'deg)';
        el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%');
      });
      el.addEventListener('pointerleave',function(){el.style.transform=''});
    });
  }

  // spine vertebrae
  var sp=$('#spine');
  for(var i=0;i<18;i++){var v=document.createElement('div');v.className='vert';var t=i/17;v.style.width=(34+Math.sin(t*Math.PI)*26)+'px';v.style.marginLeft=(Math.sin(t*5)*10)+'px';sp.appendChild(v)}

  // neural network canvas
  var c=$('#neural'),x=c.getContext('2d'),pts=[],W,H,mouse={x:-999,y:-999};
  function size(){W=c.width=c.offsetWidth*devicePixelRatio;H=c.height=c.offsetHeight*devicePixelRatio;var n=Math.min(90,Math.floor(c.offsetWidth/14));pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.5*devicePixelRatio,vy:(Math.random()-.5)*.5*devicePixelRatio})}
  size();addEventListener('resize',size);
  c.parentNode.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();mouse.x=(e.clientX-r.left)*devicePixelRatio;mouse.y=(e.clientY-r.top)*devicePixelRatio});
  var D=150*devicePixelRatio;
  function neural(){
    x.clearRect(0,0,W,H);
    pts.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      x.beginPath();x.arc(p.x,p.y,2*devicePixelRatio,0,7);x.fillStyle='rgba(90,190,255,.8)';x.fill();
    });
    for(var i=0;i<pts.length;i++){
      for(var j=i+1;j<pts.length;j++){
        var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.hypot(dx,dy);
        if(d<D){x.strokeStyle='rgba(60,160,255,'+(1-d/D)*.35+')';x.lineWidth=devicePixelRatio;x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.stroke()}
      }
      var md=Math.hypot(pts[i].x-mouse.x,pts[i].y-mouse.y);
      if(md<D*1.4){x.strokeStyle='rgba(56,210,255,'+(1-md/(D*1.4))*.6+')';x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(mouse.x,mouse.y);x.stroke()}
    }
    if(!reduce)requestAnimationFrame(neural);
  }
  neural();

  // EEG canvas
  var e=$('#eegCanvas'),g=e.getContext('2d'),eh=$('#hz'),t0=0,vis=false;
  new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(e);
  function eeg(){
    requestAnimationFrame(eeg);if(!vis)return;
    var w=e.width=e.offsetWidth*devicePixelRatio,h=e.height=e.offsetHeight*devicePixelRatio;
    t0+=.03;
    var ch=4;
    for(var k=0;k<ch;k++){
      var base=h*(k+.5)/ch,amp=h/ch*.32;
      g.beginPath();
      for(var i=0;i<w;i+=2){
        var u=i/w*14+t0*(1+k*.15)+k*3;
        var y=base+amp*(Math.sin(u*2.1)*.55+Math.sin(u*5.3+k)*.25+Math.sin(u*11.7)*.12+(Math.sin(u*.9+k)>.97?1.2:0)*Math.sin(u*40));
        i?g.lineTo(i,y):g.moveTo(i,y);
      }
      g.strokeStyle=['#38d2ff','#1e90ff','#6a7cff','#2dff9b'][k];g.lineWidth=1.8*devicePixelRatio;g.shadowColor=g.strokeStyle;g.shadowBlur=8;g.stroke();
    }
    eh.textContent=(9.6+Math.sin(t0*.6)*.6).toFixed(1);
  }
  eeg();

  // form → Telegram share
  var f=$('#form'),note=$('#formNote');
  f.addEventListener('submit',function(ev){
    ev.preventDefault();var ok=true;
    ['name','phone'].forEach(function(n){var i=f.elements[n];var bad=i.value.trim().length<(n==='phone'?7:2);i.classList.toggle('err',bad);if(bad)ok=false});
    if(!ok){note.textContent='Iltimos, ism va telefon raqamni to\'g\'ri kiriting.';return}
    var d=f.elements,text='NEURO CLINICS — yangi so\'rov\nIsm: '+d.name.value+'\nTelefon: '+d.phone.value+'\nXizmat: '+d.service.value+(d.msg.value?'\nIzoh: '+d.msg.value:'');
    if(location.protocol.indexOf('http')===0){try{fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})}catch(_){}}
    window.open('https://t.me/share/url?url=%20&text='+encodeURIComponent(text),'_blank');
    note.textContent='Rahmat! So\'rovingiz tayyor — Telegram orqali yuboring.';f.reset();
  });
})();
