/*
 * BabyCheer 3D: protsedurali bolalar elektromobili (three.js).
 *   const v = BC.car3d.create(container, { model: 'single', color: '#2b59ff', driveIn: true });
 *   v.setColor('#e5262b');  v.setModel('double');  v.view({ yaw, pitch, zoom, x, y });  v.destroy();
 * WebGL bo'lmasa create() null qaytaradi: sahifa SVG rasmga o'tadi.
 */
(function () {
  'use strict';
  const T = window.THREE;
  window.BC = window.BC || {};
  if (!T) { window.BC.car3d = { supported: false, create: () => null }; return; }

  const VARIANTS = {
    single: { L: 3.4, H: 1.62, W: 1.5, wr: 0.31, wx: 1.0, cl: 0.2, belt: 0.84, seats: 1 },
    double: { L: 4.0, H: 1.66, W: 1.9, wr: 0.33, wx: 1.2, cl: 0.2, belt: 0.88, seats: 2 },
    suv: { L: 3.8, H: 2.08, W: 1.75, wr: 0.46, wx: 1.12, cl: 0.34, belt: 1.22, seats: 2, suv: true },
  };

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ease = { out4: (t) => 1 - Math.pow(1 - t, 4), io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) };

  /* ---------- yordamchi teksturalar ---------- */
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  const shadowTex = () => canvasTex(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,.62)'); r.addColorStop(0.55, 'rgba(0,0,0,.24)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const plateTex = (txt) => canvasTex(256, 72, (g, w, h) => {
    g.fillStyle = '#f4f4f1'; g.beginPath(); g.roundRect ? g.roundRect(2, 2, w - 4, h - 4, 10) : g.rect(2, 2, w - 4, h - 4); g.fill();
    g.strokeStyle = '#1a2036'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#1a2036'; g.font = '700 34px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2);
  });
  const decalTex = () => canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = 'rgba(255,255,255,.96)'; g.font = '800 70px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BabyCheer', w / 2, h / 2 + 4);
  });

  /* ---------- atrof-muhit yoritishi (kuzgu aks uchun) ---------- */
  function makeEnv(renderer) {
    const pm = new T.PMREMGenerator(renderer), s = new T.Scene();
    s.add(new T.Mesh(new T.BoxGeometry(24, 12, 24), new T.MeshBasicMaterial({ color: new T.Color(0.42, 0.46, 0.55), side: T.BackSide })));
    const panel = (w, h, x, y, z, rx, ry, k) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k * 1.04), side: T.DoubleSide, toneMapped: false }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
    };
    panel(12, 8, 0, 5.8, 0, Math.PI / 2, 0, 2.2);   // yuqori softbox
    panel(16, 1.4, -1, 5.6, -3.2, Math.PI / 2, 0, 9);  // uzun yaltiroq chiziq (kapot/tom)
    panel(7, 1.2, 2.5, 5.6, 3.4, Math.PI / 2, 0, 6);
    panel(8, 3.4, -9, 3, 0, 0, Math.PI / 2, 2.2);    // chap
    panel(8, 3.4, 9, 3, 0, 0, -Math.PI / 2, 2.2);    // o'ng
    panel(10, 3, 0, 2.4, -10, 0, 0, 2.2);            // orqa
    panel(10, 2.4, 0, 1.6, 10, 0, Math.PI, 1.4);     // old
    const tex = pm.fromScene(s, 0.03).texture; pm.dispose(); return tex;
  }

  /* ---------- mashina geometriyasi ---------- */
  function lowerShape(p) {
    const { L, cl, wr, wx, belt } = p, h = L / 2, ar = wr + 0.09, t0 = Math.asin(Math.min((wr - cl) / ar, 0.98)), dx = ar * Math.cos(t0);
    const s = new T.Shape();
    s.moveTo(-h + 0.22, cl);
    s.lineTo(-wx - dx, cl); s.absarc(-wx, wr, ar, Math.PI + t0, -t0, true);
    s.lineTo(wx - dx, cl); s.absarc(wx, wr, ar, Math.PI + t0, -t0, true);
    s.lineTo(h - 0.22, cl);
    s.quadraticCurveTo(h, cl, h, cl + 0.22);
    s.lineTo(h, belt - 0.34);
    s.quadraticCurveTo(h, belt - 0.2, h - 0.2, belt - 0.16);
    s.quadraticCurveTo(h * 0.55, belt - 0.1, h * 0.2, belt + 0.05);
    s.lineTo(-h * 0.62, belt + 0.06);
    s.quadraticCurveTo(-h + 0.1, belt + 0.07, -h, belt - 0.14);
    s.lineTo(-h, cl + 0.22);
    s.quadraticCurveTo(-h, cl, -h + 0.22, cl);
    return s;
  }
  function cabinPts(p) {
    const h = p.L / 2, yb = p.belt + 0.05;
    return { x0: h * 0.2, x1: h * 0.0, x2: -h * 0.38, x3: -h * 0.64, yb, H: p.H };
  }
  function cabinShape(p) {
    const { x0, x1, x2, x3, yb, H } = cabinPts(p), c = new T.Shape();
    c.moveTo(x3, yb); c.lineTo(x0, yb); c.lineTo(x1 + 0.06, H - 0.02); c.quadraticCurveTo(x1, H, x1 - 0.1, H);
    c.lineTo(x2 + 0.12, H); c.quadraticCurveTo(x2, H, x2 - 0.1, H - 0.12); c.lineTo(x3, yb);
    return c;
  }
  function extrude(shape, depth, bevel, seg = 6) {
    const g = new T.ExtrudeGeometry(shape, { depth: Math.max(depth - bevel * 2, 0.01), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: seg, curveSegments: 28 });
    g.translate(0, 0, -(depth - bevel * 2) / 2); g.computeVertexNormals(); return g;
  }
  const box = (w, h, d, mat) => new T.Mesh(new T.BoxGeometry(w, h, d), mat);

  function buildWheel(r, brand, mats) {
    const g = new T.Group(), tw = 0.3;
    const tire = new T.Mesh(new T.CylinderGeometry(r, r, tw, 48), mats.tire); tire.rotation.x = Math.PI / 2; g.add(tire);
    [-1, 1].forEach((k) => {
      const tr = new T.Mesh(new T.TorusGeometry(r * 0.8, r * 0.12, 16, 48), mats.tire); tr.position.z = k * tw * 0.42; g.add(tr);
      const disc = new T.Mesh(new T.CylinderGeometry(r * 0.64, r * 0.64, 0.02, 40), mats.rim); disc.rotation.x = Math.PI / 2; disc.position.z = k * tw * 0.46; g.add(disc);
      for (let i = 0; i < 5; i++) {
        const sp = box(r * 0.62, r * 0.11, 0.035, mats.rimDark); sp.position.z = k * (tw * 0.46 + 0.02); sp.rotation.z = (i / 5) * Math.PI * 2; sp.position.x = Math.cos(sp.rotation.z) * r * 0.3; sp.position.y = Math.sin(sp.rotation.z) * r * 0.3; g.add(sp);
      }
      const hub = new T.Mesh(new T.CylinderGeometry(r * 0.16, r * 0.16, 0.06, 24), mats.hub); hub.rotation.x = Math.PI / 2; hub.position.z = k * (tw * 0.46 + 0.035); g.add(hub);
    });
    return g;
  }

  function buildCar(model, ctx) {
    const p = VARIANTS[model] || VARIANTS.single, { L, H, W, wr, wx, cl, belt } = p, h = L / 2, M = ctx.mats;
    const car = new T.Group(), body = new T.Group(); car.add(body);
    const cp = cabinPts(p), Wc = W * 0.8, yb = cp.yb;

    // pastki kuzov
    const low = new T.Mesh(extrude(lowerShape(p), W, 0.1), M.body); body.add(low);
    // tubi (qora)
    const under = box(L * 0.82, 0.07, W * 0.78, M.dark); under.position.set(0, cl + 0.01, 0); body.add(under);
    // kabina oynasi
    const glass = new T.Mesh(extrude(cabinShape(p), Wc, 0.05, 3), M.glass); glass.renderOrder = 3; body.add(glass);
    // tom va ustunlar
    const roof = box(cp.x1 - cp.x2 + 0.1, 0.07, Wc + 0.05, M.body); roof.position.set((cp.x1 + cp.x2) / 2 - 0.02, H - 0.025, 0); body.add(roof);
    const pillar = (xa, ya, xb, yb2, z) => {
      const len = Math.hypot(xb - xa, yb2 - ya), m = box(len, 0.07, 0.06, M.body);
      m.position.set((xa + xb) / 2, (ya + yb2) / 2, z); m.rotation.z = Math.atan2(yb2 - ya, xb - xa); body.add(m);
    };
    [-1, 1].forEach((k) => {
      const z = k * (Wc / 2 + 0.01);
      pillar(cp.x0, yb, cp.x1, H - 0.02, z); pillar(cp.x3, yb, cp.x2 - 0.06, H - 0.08, z);
      const bp = box(0.06, H - yb, 0.06, M.body); bp.position.set((cp.x1 + cp.x2) / 2 - 0.15, (H + yb) / 2, z); body.add(bp);
    });
    // salon
    const dash = box(0.5, 0.16, Wc - 0.12, M.interior); dash.position.set(cp.x0 - 0.2, yb + 0.12, 0); body.add(dash);
    const seatZ = p.seats === 1 ? [0] : [-W * 0.23, W * 0.23];
    seatZ.forEach((z) => {
      const base = box(0.6, 0.14, 0.52, M.interior); base.position.set(-0.28, yb + 0.1, z); body.add(base);
      const back = box(0.12, 0.62, 0.52, M.interior); back.position.set(-0.6, yb + 0.4, z); back.rotation.z = 0.14; body.add(back);
      const wheel = new T.Mesh(new T.TorusGeometry(0.17, 0.028, 10, 28), M.dark); wheel.position.set(cp.x0 - 0.42, yb + 0.4, z); wheel.rotation.y = Math.PI / 2; wheel.rotation.x = -0.4; body.add(wheel);
    });
    // faralar
    [-1, 1].forEach((k) => {
      const z = k * (W / 2 - 0.3);
      const lamp = new T.Mesh(new T.SphereGeometry(0.1, 24, 14), M.lamp); lamp.scale.set(0.3, 0.5, 2.3); lamp.position.set(h - 0.015, belt - 0.2, z); body.add(lamp);
      const rear = box(0.05, 0.12, 0.38, M.tail); rear.position.set(-h + 0.02, belt - 0.2, k * (W / 2 - 0.28)); body.add(rear);
      const mir = box(0.14, 0.1, 0.18, M.body); mir.position.set(cp.x0 - 0.02, yb + 0.1, k * (W / 2 + 0.07)); body.add(mir);
      const stalk = box(0.05, 0.05, 0.1, M.dark); stalk.position.set(cp.x0 - 0.02, yb + 0.07, k * (W / 2 - 0.0)); body.add(stalk);
    });
    const drl = box(0.03, 0.03, W * 0.46, M.lamp); drl.position.set(h - 0.005, belt - 0.2, 0); body.add(drl);
    const tailBar = box(0.03, 0.03, W * 0.5, M.tail); tailBar.position.set(-h + 0.005, belt - 0.2, 0); body.add(tailBar);
    const intake = box(0.05, 0.1, W * 0.5, M.dark); intake.position.set(h - 0.01, cl + 0.26, 0); body.add(intake);
    const bump = box(0.12, 0.08, W * 0.8, M.dark); bump.position.set(h - 0.035, cl + 0.06, 0); body.add(bump);
    const rbump = box(0.1, 0.07, W * 0.78, M.dark); rbump.position.set(-h + 0.035, cl + 0.06, 0); body.add(rbump);

    // nomer belgisi va yozuv
    const fp = new T.Mesh(new T.PlaneGeometry(0.46, 0.13), new T.MeshBasicMaterial({ map: ctx.plate })); fp.position.set(h + 0.012, cl + 0.42, 0); fp.rotation.y = Math.PI / 2; body.add(fp);
    const rp = new T.Mesh(new T.PlaneGeometry(0.46, 0.13), new T.MeshBasicMaterial({ map: ctx.plate })); rp.position.set(-h - 0.012, cl + 0.42, 0); rp.rotation.y = -Math.PI / 2; body.add(rp);
    [-1, 1].forEach((k) => {
      const d = new T.Mesh(new T.PlaneGeometry(0.9, 0.225), new T.MeshBasicMaterial({ map: ctx.decal, transparent: true, depthWrite: false }));
      d.position.set(-0.05, belt - 0.32, k * (W / 2 + 0.003)); d.rotation.y = k > 0 ? 0 : Math.PI; body.add(d);
    });
    // eshik chiziqlari va tutqichlar
    [-1, 1].forEach((k) => {
      [cp.x0 - 0.12, (cp.x1 + cp.x2) / 2 - 0.15, cp.x2 - 0.2].forEach((x) => { const l = box(0.014, belt - cl - 0.2, 0.01, M.dark); l.position.set(x, (belt + cl) / 2 + 0.05, k * (W / 2 + 0.004)); body.add(l); });
      const hd = box(0.16, 0.035, 0.02, M.dark); hd.position.set((cp.x1 + cp.x2) / 2 - 0.42, belt - 0.14, k * (W / 2 + 0.01)); body.add(hd);
    });
    // yon chiziq
    [-1, 1].forEach((k) => { const st = box(L * 0.78, 0.028, 0.01, M.stripe); st.position.set(0.02, belt - 0.07, k * (W / 2 + 0.004)); body.add(st); });

    // SUV: bagaj va zaxira g'ildirak
    if (p.suv) {
      const rack = new T.Group();
      [-1, 1].forEach((k) => { const r = box(cp.x1 - cp.x2 - 0.1, 0.035, 0.035, M.dark); r.position.set((cp.x1 + cp.x2) / 2, H + 0.06, k * (Wc / 2 - 0.1)); rack.add(r); });
      for (let i = 0; i < 4; i++) { const r = box(0.035, 0.035, Wc - 0.1, M.dark); r.position.set(cp.x2 + 0.15 + i * ((cp.x1 - cp.x2 - 0.3) / 3), H + 0.06, 0); rack.add(r); const leg = box(0.03, 0.06, 0.03, M.dark); leg.position.set(r.position.x, H + 0.03, Wc / 2 - 0.1); rack.add(leg); const leg2 = leg.clone(); leg2.position.z = -(Wc / 2 - 0.1); rack.add(leg2); }
      body.add(rack);
      const spare = buildWheel(wr * 0.8, ctx.brand, M); spare.rotation.y = Math.PI / 2; spare.position.set(-h - 0.2, belt - 0.02, 0); body.add(spare);
    }

    // g'ildiraklar
    const wheels = [];
    [[-wx, -1], [-wx, 1], [wx, -1], [wx, 1]].forEach(([x, k]) => {
      const w = buildWheel(wr, ctx.brand, M); w.position.set(x, wr, k * (W / 2 - 0.2)); car.add(w); wheels.push(w);
    });
    car.userData = { wheels, body, p, lamps: [M.lamp, M.tail] };
    return car;
  }

  /* ====================== Viewer ====================== */
  function create(container, opts = {}) {
    let renderer;
    try {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;
      renderer = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return null; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cv = renderer.domElement; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;outline:none';
    cv.setAttribute('aria-label', '3D elektromobil: sichqoncha bilan aylantiring'); cv.tabIndex = 0;
    container.appendChild(cv);
    renderer.setClearColor(0x000000, 0); renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; renderer.outputColorSpace = T.SRGBColorSpace;

    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 100);
    scene.environment = makeEnv(renderer);
    const hemi = new T.HemisphereLight(0xffffff, 0x8e99b0, 0.35); scene.add(hemi);
    const key = new T.DirectionalLight(0xffffff, 0.7); key.position.set(3, 6, 4); scene.add(key);

    const brand = new T.Color(opts.accent || '#2b59ff');
    const bodyCol = new T.Color(opts.color || '#2b59ff');
    const mats = {
      body: new T.MeshPhysicalMaterial({ color: bodyCol, metalness: 0.22, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.7 }),
      glass: new T.MeshPhysicalMaterial({ color: 0x08101c, metalness: 0.2, roughness: 0.04, transparent: true, opacity: 0.5, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false }),
      dark: new T.MeshStandardMaterial({ color: 0x14171f, roughness: 0.5, metalness: 0.2 }),
      interior: new T.MeshStandardMaterial({ color: 0x151822, roughness: 0.75 }),
      stripe: new T.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.4 }),
      tire: new T.MeshStandardMaterial({ color: 0x0c0d11, roughness: 0.92 }),
      rim: new T.MeshStandardMaterial({ color: 0xd8dde6, metalness: 1, roughness: 0.22 }),
      rimDark: new T.MeshStandardMaterial({ color: 0xaab2c0, metalness: 1, roughness: 0.3 }),
      hub: new T.MeshStandardMaterial({ color: brand, metalness: 0.5, roughness: 0.3 }),
      lamp: new T.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xfff0c8, emissiveIntensity: 1.3, roughness: 0.2 }),
      tail: new T.MeshStandardMaterial({ color: 0xff2d3a, emissive: 0xff1424, emissiveIntensity: 1.0, roughness: 0.3 }),
    };
    const ctx = { mats, brand, plate: plateTex('BABYCHEER'), decal: decalTex() };

    const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.9 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.003; shadow.renderOrder = 0; scene.add(shadow);

    let car = null, model = opts.model || 'single', visible = true, alive = true, last = performance.now(), force = 3; const minDt = 1000 / (opts.fps || 45);
    const cur = { yaw: opts.yaw ?? 0.62, pitch: opts.pitch ?? 0.13, zoom: opts.zoom ?? 1, x: 0, y: 0.62, z: 0 };
    const tgt = { ...cur }; let drag = null, vel = 0, idle = 0, auto = opts.autorotate !== false && !reduce, userAuto = auto, damp = opts.damp ?? 0.09;
    const tweens = []; let drive = null;

    function setup() {
      if (car) { scene.remove(car); car.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
      car = buildCar(model, ctx); scene.add(car);
      const p = VARIANTS[model] || VARIANTS.single; shadow.scale.set(p.L * 1.28, p.W * 1.5, 1); shadow.scale.y = p.W * 1.5; resize();
    }
    function fitDist() {
      const p = VARIANTS[model] || VARIANTS.single, asp = cam.aspect, vf = T.MathUtils.degToRad(cam.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * asp);
      const needW = (p.L * 1.18) / 2 / Math.tan(hf / 2), needH = (p.H * 1.9) / 2 / Math.tan(vf / 2);
      return Math.max(needW, needH);
    }
    function resize() {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 ? 1.25 : 1.6)); renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix(); force = 3;
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null; ro && ro.observe(container);

    function place() {
      const d = fitDist() * cur.zoom, cp = Math.cos(cur.pitch);
      cam.position.set(cur.x + d * Math.sin(cur.yaw) * cp, cur.y + d * Math.sin(cur.pitch), cur.z + d * Math.cos(cur.yaw) * cp);
      cam.lookAt(cur.x, cur.y, cur.z);
    }

    /* o'zaro ta'sir */
    cv.addEventListener('pointerdown', (e) => { if (!opts.interactive) return; drag = { x: e.clientX, y: e.clientY, yaw: tgt.yaw, pitch: tgt.pitch, id: e.pointerId }; vel = 0; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', (e) => {
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; const ny = drag.yaw - dx * 0.0085; vel = ny - tgt.yaw; tgt.yaw = ny; tgt.pitch = clamp(drag.pitch + dy * 0.004, 0.02, 0.55); idle = 0; }
      else if (opts.parallax && !reduce) { const r = cv.getBoundingClientRect(); tgt.px = ((e.clientX - r.left) / r.width - 0.5); tgt.py = ((e.clientY - r.top) / r.height - 0.5); }
    });
    const end = () => { if (!drag) return; drag = null; cv.style.cursor = opts.interactive ? 'grab' : ''; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', () => { if (!drag) { tgt.px = 0; tgt.py = 0; } });
    cv.addEventListener('keydown', (e) => { if (!opts.interactive) return; if (e.key === 'ArrowLeft') tgt.yaw -= 0.15; if (e.key === 'ArrowRight') tgt.yaw += 0.15; });
    if (opts.interactive) cv.style.cursor = 'grab';

    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }) : null; io && io.observe(container);

    /* animatsiya yordamchisi */
    function tween(ms, fn, easing = ease.io3) { const t0 = performance.now(); tweens.push({ t0, ms, fn, easing }); }
    function runTweens(now) { for (let i = tweens.length - 1; i >= 0; i--) { const t = tweens[i], k = clamp((now - t.t0) / t.ms, 0, 1); t.fn(t.easing(k)); if (k >= 1) tweens.splice(i, 1); } }

    function frame(now) {
      if (!alive) return; requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      if (now - last < minDt - 2) return;
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const hadT = tweens.length > 0; runTweens(now);
      let moving = hadT || !!drive || !!drag;
      if (drive) {
        const k = clamp((now - drive.t0) / drive.ms, 0, 1), e = ease.out4(k), x = drive.from * (1 - e); const dx = x - car.position.x; car.position.x = x;
        car.userData.wheels.forEach((w) => { w.rotation.z -= dx / ((VARIANTS[model] || VARIANTS.single).wr) * -1; });
        car.userData.body.rotation.z = Math.sin(k * Math.PI) * 0.018 * (1 - k * 0.3); shadow.position.x = x;
        if (k >= 1) { drive = null; car.userData.body.rotation.z = 0; shadow.position.x = 0; opts.onArrive && opts.onArrive(); }
      }
      if (!drag) {
        if (Math.abs(vel) > 0.0002) { tgt.yaw += vel; vel *= 0.94; idle = 0; moving = true; } else { idle += dt; }
        if (userAuto && idle > 1.6) { moving = true; if (opts.sway) tgt.yaw += Math.sin(now / 2600) * 0.0016; else tgt.yaw += 0.0035; }
      }
      const k = 1 - Math.pow(1 - damp, dt * 60); let d = 0;
      for (const key of ['yaw', 'pitch', 'zoom', 'x', 'y', 'z']) { const df = tgt[key] - cur[key]; d += Math.abs(df); cur[key] += df * k; }
      const ox = (tgt.px || 0) * 0.3, oy = (tgt.py || 0) * 0.12; const dpx = ox - (cur.px || 0), dpy = oy - (cur.py || 0); d += Math.abs(dpx) + Math.abs(dpy); cur.px = (cur.px || 0) + dpx * k; cur.py = (cur.py || 0) + dpy * k;
      if (!moving && d < 0.0004 && force <= 0) return; if (force > 0) force--;
      const sy = cur.yaw, sp = cur.pitch; cur.yaw += cur.px; cur.pitch += cur.py; place(); cur.yaw = sy; cur.pitch = sp;
      renderer.render(scene, cam);
    }

    setup();
    if (opts.driveIn && !reduce) {
      drive = { t0: performance.now() + (opts.driveDelay || 0), ms: opts.driveMs || 2600, from: -((VARIANTS[model] || VARIANTS.single).L * 2.2 + 5) };
      car.position.x = drive.from; shadow.position.x = drive.from;
    }
    requestAnimationFrame(frame);

    const api = {
      canvas: cv, supported: true,
      setColor(hex, animate = true) {
        const to = new T.Color(hex);
        if (!animate || reduce) { mats.body.color.copy(to); return; }
        const from = mats.body.color.clone(); tween(700, (e) => mats.body.color.copy(from).lerp(to, e));
      },
      setAccent(hex) { mats.hub.color.set(hex); },
      setModel(m) { if (m === model || !VARIANTS[m]) return; model = m; setup(); force = 3; },
      view(v, snap) { Object.assign(tgt, v); if (snap) Object.assign(cur, v); force = 2; },
      glow(k) { mats.lamp.emissiveIntensity = 1.3 + k * 2.4; mats.tail.emissiveIntensity = 1 + k * 1.6; force = 2; },
      autoRotate(on) { userAuto = on && !reduce; },
      spin(turns = 1, ms = 1400) { const y0 = tgt.yaw; tween(ms, (e) => { tgt.yaw = y0 + e * Math.PI * 2 * turns; }); },
      destroy() { alive = false; ro && ro.disconnect(); io && io.disconnect(); renderer.dispose(); cv.remove(); },
    };
    return api;
  }

  window.BC.car3d = { supported: true, create, variants: Object.keys(VARIANTS) };
})();
