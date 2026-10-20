// ---- WebGL sahna: aurora shader, 3D telefonlar halqasi, noutbuk, zarralar; skroll bilan boshqariladi ----
(function () {
  var root = document.documentElement;
  if (typeof THREE === 'undefined' || reduce) { root.classList.add('nogl'); return; }
  var cv = $('#gl'), ren;
  try { ren = new THREE.WebGLRenderer({ canvas: cv, antialias: !narrow, alpha: false, powerPreference: 'high-performance' }); } catch (e) { root.classList.add('nogl'); return; }
  var dprMax = Math.min(devicePixelRatio || 1, narrow ? 1.25 : 1.4), qual = 1; ren.setPixelRatio(dprMax); ren.setClearColor(0x0a0a0b, 1);
  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100), mx = 0, my = 0, tmx = 0, tmy = 0;
  var aniso = Math.min(4, ren.capabilities.getMaxAnisotropy());
  function resize() { var w = innerWidth, h = innerHeight; ren.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); bg.uniforms.res.value.set(w, h); }
  // fon: oqib turuvchi aurora
  var bg = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { t: { value: 0 }, res: { value: new THREE.Vector2(1, 1) }, m: { value: new THREE.Vector2() }, k: { value: 1 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999,1.);}',
    fragmentShader: 'precision highp float;uniform float t;uniform vec2 res;uniform vec2 m;uniform float k;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}void main(){vec2 p=(vUv-.5)*vec2(res.x/res.y,1.);float q=fbm(p*1.6+vec2(t*.05,-t*.03)+m*.15);float r=fbm(p*2.4+q*2.+vec2(-t*.04,t*.06));vec3 c1=vec3(.78,.66,.42),c2=vec3(.16,.2,.34),c3=vec3(.95,.88,.72);vec3 col=mix(c2,c1,smoothstep(.3,.8,q));col=mix(col,c3,smoothstep(.55,.95,r)*.55);float vig=smoothstep(1.2,.15,length(p*vec2(.85,1.1)));float it=(.07+.2*r*q)*vig*k;gl_FragColor=vec4(vec3(.036,.036,.04)+col*it,1.);}' });
  var bgm = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bg); bgm.frustumCulled = false; bgm.renderOrder = -10; scene.add(bgm);
  // qurilma materiali (yumaloq burchak + ramka + yaltiroq)
  var DEV_FS = 'uniform sampler2D map;uniform float asp;uniform float rad;uniform float alpha;uniform float bz;varying vec2 vUv;float sd(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}void main(){vec2 p=(vUv-.5)*vec2(asp,1.);float d=sd(p,vec2(asp,1.)*.5,rad);if(d>0.)discard;vec3 tex=texture2D(map,vUv).rgb;float e=smoothstep(-bz,-bz+.004,d);vec3 bez=vec3(.075,.072,.07)+.45*smoothstep(-.005,0.,d)*vec3(.85,.76,.55);vec3 col=mix(tex,bez,e);col+=.08*smoothstep(.25,1.,vUv.x*.55+vUv.y*.5)*(1.-e);gl_FragColor=vec4(col,alpha);}';
  var DEV_VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  var loader = new THREE.TextureLoader();
  function tex(src) { var t = loader.load(src); t.anisotropy = aniso; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
  function dev(src, w, h, rad, bz) { var m = new THREE.ShaderMaterial({ transparent: true, side: THREE.FrontSide, vertexShader: DEV_VS, fragmentShader: DEV_FS, uniforms: { map: { value: tex(src) }, asp: { value: w / h }, rad: { value: rad }, alpha: { value: 1 }, bz: { value: bz } } }); return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); }
  var ids = window.__IDS || [], ring = new THREE.Group(), PH = 3.5, PW = PH * 9 / 19.5, R = 4.6, phones = [];
  ids.forEach(function (id, i) { var a = i / ids.length * Math.PI * 2, p = dev('/img/home/' + id + '-m.webp', PW, PH, 0.085, 0.022); p.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); p.rotation.y = a; p.userData.a = a; ring.add(p); phones.push(p); });
  scene.add(ring);
  var lap = dev('/img/home/' + (ids[0] || 'restoran') + '-d.webp', 6.6, 4.125, 0.035, 0.03); lap.visible = false; scene.add(lap);
  var lapTex = ids.map(function (id) { return tex('/img/home/' + id + '-d.webp'); });
  // zarralar
  var N = narrow ? 300 : 700, pos = new Float32Array(N * 3), i;
  for (i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 26; pos[i * 3 + 1] = (Math.random() - .5) * 16; pos[i * 3 + 2] = (Math.random() - .5) * 18 - 2; }
  var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var pm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, s: { value: 1 } }, vertexShader: 'uniform float t;uniform float s;varying float a;void main(){vec3 p=position;p.y+=sin(t*.3+p.x)*.3;p.x+=cos(t*.2+p.y)*.2;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=s*(2.5+mod(position.x*7.,2.))*(9./-mv.z);a=.25+.5*fract(position.z*3.1);gl_Position=projectionMatrix*mv;}', fragmentShader: 'varying float a;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(.93,.85,.68),a*.7*smoothstep(.5,.1,d));}' });
  var pts = new THREE.Points(pg, pm); pts.frustumCulled = false; scene.add(pts);
  // kalit kadrlar: s = hero*0.18 + hikoya*0.82
  var KF = [
    { s: 0, ry: 0, x: 0, y: -2.2, z: -4.4, sc: 1, ra: 1, cz: 9.6, cy: .6, la: 0, ls: .7, lx: 0, ly: -1, lr: -.4 },
    { s: .18, ry: .55, x: 0, y: -1.6, z: -3.8, sc: 1, ra: 1, cz: 9, cy: .4, la: 0, ls: .7, lx: 0, ly: -1, lr: -.4 },
    { s: .385, ry: 1.9, x: 2.9, y: -.1, z: -2.8, sc: 1.02, ra: 1, cz: 8.4, cy: 0, la: 0, ls: .7, lx: 0, ly: -1, lr: -.4 },
    { s: .59, ry: 3.45, x: 2.9, y: .15, z: -2, sc: 1, ra: 1, cz: 8.9, cy: .5, la: 0, ls: .75, lx: 0, ly: -1, lr: -.4 },
    { s: .77, ry: 4.7, x: 3.6, y: 3.1, z: -3.2, sc: .55, ra: .5, cz: 9.4, cy: .2, la: 1, ls: 1, lx: 1.9, ly: -.15, lr: -.3 },
    { s: 1, ry: 5.6, x: 3.8, y: 4.4, z: -4, sc: .42, ra: .12, cz: 8.8, cy: 0, la: 1, ls: 1.05, lx: 1.5, ly: 0, lr: -.12 }
  ], keys = ['ry', 'x', 'y', 'z', 'sc', 'ra', 'cz', 'cy', 'la', 'ls', 'lx', 'ly', 'lr'];
  var cur = {}, tgt = {}; keys.forEach(function (k) { cur[k] = KF[0][k]; });
  function ease(x) { return x * x * (3 - 2 * x); }
  function target(s) { var a = KF[0], b = KF[KF.length - 1], j; for (j = 0; j < KF.length - 1; j++) { if (s >= KF[j].s && s <= KF[j + 1].s) { a = KF[j]; b = KF[j + 1]; break; } } var f = a === b ? 0 : ease(Math.max(0, Math.min(1, (s - a.s) / (b.s - a.s)))); keys.forEach(function (k) { tgt[k] = a[k] + (b[k] - a[k]) * f; }); }
  addEventListener('pointermove', function (e) { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  var rw = innerWidth, rh = innerHeight, rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (innerWidth === rw && Math.abs(innerHeight - rh) < 170) return; rw = innerWidth; rh = innerHeight; resize(); }, 140); }); resize();
  var t0 = performance.now(), lapIdx = -1, hidden = false;
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; });
  var lt = performance.now(), acc = 0, cnt = 0, slow = 0, dead = false, fr = 0;
  function frame() {
    if (dead) return; requestAnimationFrame(frame); if (hidden) return;
    var tn = performance.now(), dt = tn - lt; lt = tn;
    if (dt < 300 && ++cnt >= 45) {
      var avg = acc / cnt; acc = 0; cnt = 0;
      if (avg > 27 && qual > .55) { qual *= .8; ren.setPixelRatio(Math.max(.55, dprMax * qual)); resize(); slow = 0; }
      else if (avg > 55) { if (++slow >= 3) { dead = true; root.classList.add('nogl'); try { ren.dispose(); } catch (e) { /* ignore */ } return; } }
      else slow = 0;
    } else if (dt < 300) acc += dt;
    var spp = window.__SP || { hero: 0, q: 0, after: false };
    if (spp.after && (fr++ & 1)) return;
    var now = (performance.now() - t0) / 1000, sp = window.__SP || { hero: 0, q: 0, after: false }, s = sp.hero * .18 + sp.q * .82;
    target(s); keys.forEach(function (k) { cur[k] += (tgt[k] - cur[k]) * .075; });
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    var drift = now * .06, sc = cur.sc * (narrow ? .78 : 1);
    ring.rotation.y = cur.ry + drift + mx * .35; ring.position.set(narrow ? 0 : cur.x, cur.y + (narrow ? (sp.hero >= 1 || sp.q > 0 ? 1.3 : 0.1) : 0), cur.z); ring.scale.setScalar(sc); ring.rotation.x = -my * .08;
    phones.forEach(function (p, i) { p.position.y = Math.sin(now * .8 + i * 1.3) * .09; p.material.uniforms.alpha.value = cur.ra; });
    ring.visible = cur.ra > .02;
    if (narrow && sp.q <= 0) ring.visible = false;
    cam.position.set(mx * .5, cur.cy - my * .35, cur.z * 0 + cur.cz + (narrow ? 2.2 : 0)); cam.lookAt(0, 0, 0);
    lap.visible = cur.la > .02; lap.material.uniforms.alpha.value = Math.min(1, cur.la); lap.position.set(narrow ? 0 : cur.lx, cur.ly + (narrow ? 1.2 : 0), 0.2); lap.rotation.set(-my * .1, cur.lr + mx * .25, 0); lap.scale.setScalar(cur.ls * (narrow ? .5 : 1));
    if (lap.visible) { var li = Math.floor(now / 2.2) % lapTex.length; if (li !== lapIdx && lapTex[li]) { lapIdx = li; lap.material.uniforms.map.value = lapTex[li]; } }
    bg.uniforms.t.value = now; bg.uniforms.m.value.set(mx, -my); bg.uniforms.k.value = sp.after ? .5 : 1;
    pm.uniforms.t.value = now; pm.uniforms.s.value = ren.getPixelRatio();
    pts.rotation.y = now * .012 + mx * .05;
    ren.render(scene, cam);
  }
  frame();
})();
