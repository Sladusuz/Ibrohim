'use strict';
// Kinematik qatlam: WebGL fon, matn animatsiyalari, parallax, gorizontal scroll, kursor, kirish animatsiyasi.
// Hech qanday tashqi kutubxonasiz. E.hooks.afterRender orqali har renderdan keyin ishga tushadi.
(function () {
  const E = window.E; if (!E) return;
  const { $, $$ } = E;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const root = document.documentElement;
  const moOn = () => root.classList.contains('mo-on') && !reduce;
  let cleanups = [], items = [], rafId = 0, lastY = scrollY, vel = 0;

  /* ---------- Rang yordamchisi ---------- */
  function rgb(cssVar) {
    const s = document.createElement('i'); s.style.cssText = `position:absolute;visibility:hidden;color:var(${cssVar})`; document.body.appendChild(s);
    const m = getComputedStyle(s).color.match(/[\d.]+/g) || [0, 0, 0]; s.remove();
    return [m[0] / 255, m[1] / 255, m[2] / 255];
  }

  /* ---------- WebGL fon (akvarel-nur) ---------- */
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1,c2,c3,bg;uniform float k;uniform float mode;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  float T=t*.07;
  vec2 q=vec2(fbm(p*1.2+vec2(0.,T)),fbm(p*1.2+vec2(5.2,1.3)-T));
  vec2 w=vec2(fbm(p*1.5+2.*q+vec2(1.7,9.2)+T*1.3),fbm(p*1.5+2.*q+vec2(8.3,2.8)-T));
  float f=fbm(p*1.3+2.4*w);
  vec2 mp=(m*r-.5*r)/min(r.x,r.y);
  float md=length(p-mp);
  vec3 col=bg;
  if(mode<.5){
    col=mix(bg,c1,smoothstep(.25,.9,f)*k);
    col=mix(col,c2,smoothstep(.3,1.,length(q))*.75*k);
    col=mix(col,c3,smoothstep(.55,1.,w.x)*.55*k);
    float rib=pow(abs(sin((f*6.+w.y*3.)+T*3.)),12.);
    col+=c1*rib*.18*k;
  }else{
    float bands=smoothstep(.0,.9,abs(sin(f*9.+T*4.)));
    col=mix(bg,mix(c1,c2,uv.x),bands*.5*k);
    col=mix(col,c3,smoothstep(.6,1.,q.x)*.4*k);
  }
  col+=mix(c1,c3,.4)*.32*k*exp(-md*2.6);
  col*=1.-.4*smoothstep(.2,1.1,length(uv-.5)*1.4);
  col+=(h(gl_FragCoord.xy+t)-.5)*.022;
  gl_FragColor=vec4(col,1.);
}`;
  function startFx(host) {
    const cv = document.createElement('canvas'); cv.className = 'fxc'; host.prepend(cv);
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { host.classList.add('nofx'); return () => {}; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { host.classList.add('nofx'); return () => {}; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const u = { r: U('r'), t: U('t'), m: U('m'), c1: U('c1'), c2: U('c2'), c3: U('c3'), bg: U('bg'), k: U('k'), mode: U('mode') };
    let w = 0, h = 0, run = true, vis = false, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, t0 = performance.now(), last = 0;
    const dark = lumOf(rgb('--bg')) < 0.5;
    const paint = () => {
      const c1 = rgb('--acc'), c2 = rgb('--acc2'), c3 = rgb('--acc3'), bg = rgb('--bg');
      gl.uniform3fv(u.c1, c1); gl.uniform3fv(u.c2, c2); gl.uniform3fv(u.c3, c3); gl.uniform3fv(u.bg, bg);
      gl.uniform1f(u.k, dark ? 0.85 : 0.4); gl.uniform1f(u.mode, host.dataset.fx === 'waves' ? 1 : 0);
    };
    const size = () => { const sc = Math.min(devicePixelRatio || 1, 1.5) * 0.55; w = Math.max(2, Math.round(host.clientWidth * sc)); h = Math.max(2, Math.round(host.clientHeight * sc)); cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(u.r, w, h); };
    const frame = (now) => {
      if (!run) return; requestAnimationFrame(frame);
      if (!vis || document.hidden) return;
      if (now - last < 32) return; last = now;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      gl.uniform1f(u.t, reduce ? 12 : (now - t0) / 1000); gl.uniform2f(u.m, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const mv = (e) => { const r = host.getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width, 0, 1); ty = clamp(1 - (e.clientY - r.top) / r.height, 0, 1); };
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: 0 }); io.observe(host);
    const ro = new ResizeObserver(size); ro.observe(host);
    addEventListener('pointermove', mv, { passive: true });
    size(); paint(); requestAnimationFrame(frame);
    host.classList.add('fx-ready');
    const repaint = () => paint(); addEventListener('fx-repaint', repaint);
    return () => { run = false; io.disconnect(); ro.disconnect(); removeEventListener('pointermove', mv); removeEventListener('fx-repaint', repaint); const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); cv.remove(); };
  }
  const lumOf = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

  /* ---------- Matnni so'zlarga bo'lish ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const o = document.createElement('span'); o.className = 'wm';
          const s = document.createElement('span'); s.className = 'wi'; s.style.transitionDelay = (i * 0.05).toFixed(2) + 's'; s.textContent = p;
          o.appendChild(s); frag.appendChild(o); i++;
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.classList.contains('wm')) walk(c);
    });
    walk(el); el.classList.add('spl');
  }

  /* ---------- Scroll hisoblari ---------- */
  const reg = (el, fn, opts) => {
    const o = Object.assign({ el, fn, vis: true }, opts);
    items.push(o);
    const io = new IntersectionObserver((es) => { o.vis = es[0].isIntersecting; if (o.vis) schedule(); }, { rootMargin: '20% 0px 20% 0px' });
    io.observe((opts && opts.watch) || el); cleanups.push(() => io.disconnect());
    return o;
  };
  const schedule = () => { if (!rafId) rafId = requestAnimationFrame(tick); };
  function tick() {
    rafId = 0;
    const y = scrollY, vh = innerHeight; vel += ((y - lastY) - vel) * 0.25; lastY = y;
    for (const o of items) if (o.vis) o.fn(o.el, vh, y, vel);
    if (Math.abs(vel) > 0.15) schedule(); else vel = 0;
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { items.forEach((o) => o.onResize && o.onResize()); schedule(); });

  function setupScroll() {
    // Parallax
    $$('[data-par]').forEach((el) => {
      const sp = parseFloat(el.dataset.par) || 0.12;
      reg(el, (e, vh) => { const r = e.parentElement.getBoundingClientRect(); const c = r.top + r.height / 2 - vh / 2; e.style.setProperty('--py', clamp(-c * sp, -r.height * 0.068, r.height * 0.068).toFixed(1) + 'px'); }, { watch: el.parentElement });
    });
    // Hero chuqurligi
    $$('.hero').forEach((el) => reg(el, (e, vh, y) => { const r = e.getBoundingClientRect(); e.style.setProperty('--hp', clamp(-r.top / (r.height * 0.9), 0, 1).toFixed(3)); }));
    // Bayonot: so'zlar yonib boradi
    $$('.statement').forEach((el) => {
      const ws = $$('.stw', el); if (!ws.length) return;
      reg(el, (e, vh) => { const r = e.getBoundingClientRect(); const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.35), 0, 1.05); const n = Math.floor(p * ws.length * 1.04); ws.forEach((w, i) => w.classList.toggle('lit', i < n)); });
    });
    // Gorizontal scroll
    $$('.hs').forEach((hs) => {
      const pin = $('.hs-pin', hs), track = $('.hs-track', hs); if (!pin || !track) return;
      const off = () => matchMedia('(max-width:820px)').matches || reduce;
      const measure = () => { if (off()) { hs.style.height = ''; track.style.transform = ''; hs.classList.add('hs-off'); return; } hs.classList.remove('hs-off'); hs.style.height = (track.scrollWidth - pin.clientWidth + innerHeight * 0.9) + 'px'; };
      const o = reg(hs, (e, vh) => { if (off()) return; const r = e.getBoundingClientRect(); const max = track.scrollWidth - pin.clientWidth; const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1); track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`; const bar = $('.hs-bar i', hs); if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`; }, { onResize: measure });
      measure(); setTimeout(measure, 600); $$('img', hs).forEach((im) => im.addEventListener('load', measure)); void o;
    });
    // Marquee tezlashishi
    $$('.mq .track').forEach((tr) => {
      const a = tr.getAnimations && tr.getAnimations()[0]; if (!a) return;
      reg(tr, () => { a.playbackRate = 1 + Math.min(5, Math.abs(vel) * 0.3); }, {});
      const t = setInterval(() => { if (Math.abs(vel) < 0.2 && a.playbackRate !== 1) a.playbackRate += (1 - a.playbackRate) * 0.2; }, 120); cleanups.push(() => clearInterval(t));
    });
  }

  /* ---------- Kursor (faqat sichqonchali qurilmalarda) ---------- */
  let cur = null;
  function setupCursor() {
    if (!fine || E.isPreview || cur) return;
    const dot = document.createElement('div'); dot.className = 'cur-dot'; const ring = document.createElement('div'); ring.className = 'cur-ring'; ring.innerHTML = '<span></span>';
    document.body.append(dot, ring); cur = { dot, ring };
    let x = -100, y = -100, rx = -100, ry = -100, shown = false;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!shown) { shown = true; root.classList.add('cur-on'); rx = x; ry = y; } dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; root.classList.remove('cur-on'); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const lab = t.closest('[data-cursor]');
      ring.classList.toggle('hov', !!t.closest('a,button,summary,label,[data-act],input,textarea,select,.hs-track'));
      ring.classList.toggle('lab', !!lab); $('span', ring).textContent = lab ? lab.dataset.cursor : '';
    });
    document.addEventListener('pointerdown', () => ring.classList.add('down')); document.addEventListener('pointerup', () => ring.classList.remove('down'));
    (function loop() { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  }

  /* ---------- Sichqoncha bilan o'ynash: 3D qiya, xizmatlar ro'yxati rasmi ---------- */
  addEventListener('pointermove', (e) => {
    if (!moOn()) return;
    const t3 = e.target.closest && e.target.closest('.t3');
    if (t3) { const r = t3.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; t3.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg'); t3.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg'); t3.style.setProperty('--gx', (px + 0.5) * 100 + '%'); t3.style.setProperty('--gy', (py + 0.5) * 100 + '%'); }
    const sv = e.target.closest && e.target.closest('.srvs');
    if (sv) { const pv = $('.srv-pv', sv); const row = e.target.closest('.srv'); if (pv) { const r = sv.getBoundingClientRect(); pv.style.transform = `translate(${e.clientX - r.left + 28}px,${e.clientY - r.top - 110}px)`; if (row && row.dataset.img) { const im = $('img', pv); if (im.getAttribute('src') !== row.dataset.img) im.src = row.dataset.img; pv.classList.add('on'); } else pv.classList.remove('on'); } }
  }, { passive: true });
  addEventListener('pointerout', (e) => {
    const t3 = e.target.closest && e.target.closest('.t3'); if (t3 && !t3.contains(e.relatedTarget)) { t3.style.setProperty('--rx', '0deg'); t3.style.setProperty('--ry', '0deg'); }
    const sv = e.target.closest && e.target.closest('.srvs'); if (sv && !sv.contains(e.relatedTarget)) { const pv = $('.srv-pv', sv); if (pv) pv.classList.remove('on'); }
  });

  /* ---------- Oldin/keyin slayderi ---------- */
  document.addEventListener('pointerdown', (e) => {
    const c = e.target.closest && e.target.closest('.cmp'); if (!c) return;
    const set = (ev) => { const r = c.getBoundingClientRect(); c.style.setProperty('--p', clamp(((ev.clientX - r.left) / r.width) * 100, 0, 100).toFixed(1) + '%'); };
    set(e); c.setPointerCapture && c.setPointerCapture(e.pointerId);
    const mv = (ev) => set(ev), up = () => { c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); };
    c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up);
  });
  document.addEventListener('keydown', (e) => {
    const c = e.target.closest && e.target.closest('.cmp'); if (!c || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const v = parseFloat(getComputedStyle(c).getPropertyValue('--p')) || 50; c.style.setProperty('--p', clamp(v + (e.key === 'ArrowLeft' ? -5 : 5), 0, 100) + '%');
  });

  /* ---------- Video ---------- */
  E.actions['video'] = (el) => {
    const src = el.dataset.src || ''; const box = el.closest('.vid'); if (!box) return;
    let yt = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/), vm = src.match(/vimeo\.com\/(\d+)/);
    let h = '';
    if (yt) h = `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>`;
    else if (vm) h = `<iframe src="https://player.vimeo.com/video/${vm[1]}?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
    else if (/^(https?:\/\/|\/)[^\s"'<>]+\.(mp4|webm|mov)(\?.*)?$/i.test(src)) h = `<video src="${E.esc(src)}" controls autoplay playsinline></video>`;
    if (h) { box.classList.add('playing'); box.insertAdjacentHTML('beforeend', h); }
  };

  /* ---------- Kirish animatsiyasi ---------- */
  function intro() {
    if (!root.classList.contains('intro-on') || $('.intro')) return;
    try { sessionStorage.setItem('intro', '1'); } catch { /* ignore */ }
    const c = E.state().company || {};
    const d = document.createElement('div'); d.className = 'intro';
    d.innerHTML = `<div class="il"><span class="im">${E.text((c.logo || (c.name || 'S')[0]).slice(0, 2))}</span><b>${E.text(c.name || '')}</b></div><i class="ib"></i>`;
    document.body.appendChild(d);
    setTimeout(() => d.classList.add('out'), 1050); setTimeout(() => { d.remove(); root.classList.remove('intro-on'); }, 1900);
  }

  /* ---------- Asosiy ishga tushirish ---------- */
  function init() {
    cleanups.forEach((f) => { try { f(); } catch { /* ignore */ } }); cleanups = []; items = [];
    const on = moOn();
    if (!on) { $$('.sh').forEach((e) => e.classList.add('in')); return; }
    // Sarlavhalarni so'zma-so'z ochish
    $$('.sh h2,[data-split]').forEach((h) => { if (!h.classList.contains('spl')) splitWords(h); });
    if (E.isPreview) $$('.spl').forEach((h) => h.classList.add('in'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
      $$('.spl').forEach((h) => io.observe(h)); cleanups.push(() => io.disconnect());
    }
    // WebGL fon
    $$('[data-fx]').forEach((h) => { const stop = startFx(h); cleanups.push(stop); });
    // Rasm ochilishi
    if (!E.isPreview) {
      const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } }), { threshold: 0.18 });
      $$('.imr').forEach((h) => io2.observe(h)); cleanups.push(() => io2.disconnect());
    } else $$('.imr').forEach((h) => h.classList.add('in'));
    setupScroll(); setupCursor(); intro(); schedule();
  }
  const prev = E.hooks.afterRender;
  E.hooks.afterRender = () => { if (prev) prev(); init(); };
  E.motion = { init, startFx };
})();
