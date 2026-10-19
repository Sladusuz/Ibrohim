const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), seg=(t,a,b)=>clamp((t-a)/(b-a));
const E={o3:(x)=>1-Math.pow(1-x,3),o5:(x)=>1-Math.pow(1-x,5),io:(x)=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,back:(x)=>{const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)},sp:(x)=>{if(x<=0)return 0;if(x>=1)return 1;return 1-Math.exp(-7*x)*Math.cos(14*x)}};
const rng=(s)=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const fmt=(n)=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const S=(el,o)=>{if(!el)return;for(const k in o)el.style[k]=o[k]};
const vis=(el,t,a,b,fi=.12,fo=.12)=>{const o=Math.min(seg(t,a,a+fi),1-seg(t,b-fo,b));el.style.opacity=o;el.style.display=o<=0?'none':'block';return o};

const L=(id)=>document.getElementById(id);
const typeIn=(s,p)=>s.slice(0,Math.floor(s.length*clamp(p)));
const gc=document.getElementById('grain'),gx=gc?gc.getContext('2d'):null;
function grain(t){if(!gx)return;const id=gx.createImageData(270,480),d=id.data,r=rng(Math.floor(t*24)+3);for(let i=0;i<d.length;i+=4){const v=r()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}gx.putImageData(id,0,0)}
// tez aurora: blur filtrsiz (radial gradient)
function aurora(t,calm){[['au0',200,300,0.37,'216,180,106'],['au1',700,1100,0.23,'106,76,255'],['au2',300,1500,0.31,'255,77,109']].forEach(([id,x,y,f,c],i)=>{const e=L(id);if(!e)return;S(e,{left:(x+Math.sin(t*f*2+i)*220-450)+'px',top:(y+Math.cos(t*f*2.3+i)*260-450)+'px',opacity:calm?(i==2?.5:.14):.65})})}
