/* ERA — scroll-driven restoration canvas.
 * Draws a stack of stage images (worn → … → restored). Each stage reveals the next
 * image through a mask painted along a tool path, while the tool itself (brush,
 * cloth, dauber, sponge, paint brush) is drawn on top at the current path point.
 * Everything is a pure function of progress p (0..1), so scrolling back works. */
(function () {
  "use strict";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const range = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const hash = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  const MS = 4; // mask downscale

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  /* ---------------- paths (image px) ---------------- */
  function pathRows(roi, rows, step) {
    const pts = [];
    for (let r = 0; r < rows; r++) {
      const y = roi.y + roi.h * (r + .5) / rows;
      const n = Math.ceil(roi.w / step);
      for (let i = 0; i <= n; i++) {
        const t = r % 2 ? 1 - i / n : i / n;
        pts.push({ x: roi.x + roi.w * t, y: y + Math.sin(i * .45) * roi.h * .04 });
      }
    }
    return pts;
  }
  function pathCols(roi, cols, step) {
    const pts = [];
    for (let c = 0; c < cols; c++) {
      const n = Math.ceil(roi.h / step);
      for (let i = 0; i <= n; i++) {
        const t = c % 2 ? 1 - i / n : i / n;
        pts.push({ x: roi.x + roi.w * (c + .5 + (i / n - .5) * .5) / cols, y: roi.y + roi.h * t });
      }
    }
    return pts;
  }
  function pathCircles(roi, rows, loops, rad, step) {
    const pts = [];
    for (let r = 0; r < rows; r++) {
      const yc = roi.y + roi.h * (r + .5) / rows;
      const len = roi.w + loops * Math.PI * 2 * rad;
      const n = Math.ceil(len / step);
      for (let i = 0; i <= n; i++) {
        let t = i / n;
        const th = t * loops * Math.PI * 2;
        if (r % 2) t = 1 - t;
        pts.push({ x: roi.x + rad + (roi.w - 2 * rad) * t + Math.cos(th) * rad, y: yc + Math.sin(th) * rad * .75 });
      }
    }
    return pts;
  }

  /* ---------------- tools (drawn around contact point 0,0) ---------------- */
  function shadow(c, w, h, a) {
    c.save(); c.scale(1, h / w);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, w);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, w, 0, Math.PI * 2); c.fill(); c.restore();
  }
  function woodGrad(c, y0, y1, light) {
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, light ? "#c48a52" : "#b07844"); g.addColorStop(.45, "#8a5630"); g.addColorStop(1, "#5a331a");
    return g;
  }
  const TOOLS = {
    brush(c, t) {
      shadow(c, 140, 18, .45);
      // bristles
      for (let i = 0; i < 64; i++) {
        const x = -112 + i * 3.55, j = hash(i, 3);
        c.strokeStyle = i % 3 ? "#2b211a" : "#46372b";
        c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(x, -50); c.lineTo(x + (j - .5) * 5 + Math.sin(t * 9 + i) * 1.5, -2 - j * 5); c.stroke();
      }
      c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(-118, -54, 236, 6);
      // wooden block
      rr(c, -128, -112, 256, 64, 30); c.fillStyle = woodGrad(c, -112, -48, true); c.fill();
      c.save(); c.clip();
      c.strokeStyle = "rgba(255,230,200,.10)"; c.lineWidth = 2;
      for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-130, -100 + k * 9); c.bezierCurveTo(-40, -106 + k * 9 + (k % 2 ? 6 : -4), 40, -94 + k * 9, 130, -100 + k * 9 + (k % 2 ? -3 : 4)); c.stroke(); }
      const hl = c.createLinearGradient(0, -112, 0, -90); hl.addColorStop(0, "rgba(255,255,255,.28)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = hl; c.fillRect(-128, -112, 256, 24);
      c.restore();
      c.font = "800 19px Manrope, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillStyle = "rgba(45,22,8,.55)"; c.fillText("E R A", 0, -79);
      c.fillStyle = "rgba(255,220,180,.16)"; c.fillText("E R A", 0, -78);
    },
    cloth(c, t, o) {
      shadow(c, 130, 16, .4);
      const wet = o && o.wet;
      const g = c.createLinearGradient(-120, -170, 100, 10);
      g.addColorStop(0, wet ? "#e4ecf1" : "#f6efe4"); g.addColorStop(.6, wet ? "#b9c6cf" : "#dccbb6"); g.addColorStop(1, wet ? "#8c9aa4" : "#b39d85");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-118, -6);
      c.bezierCurveTo(-138, -60, -120, -118, -84, -140);
      c.bezierCurveTo(-60, -176, -8, -150, 8, -178);
      c.bezierCurveTo(30, -206, 86, -170, 96, -134);
      c.bezierCurveTo(126, -118, 140, -60, 120, -24);
      c.bezierCurveTo(116, -4, 80, 4, 40, 0);
      c.bezierCurveTo(0, -4, -60, 6, -118, -6);
      c.closePath(); c.fill();
      // hanging corner
      c.beginPath(); c.moveTo(96, -40); c.bezierCurveTo(140, -30, 170, 10, 176, 40); c.bezierCurveTo(150, 30, 120, 14, 104, 4); c.closePath();
      c.fillStyle = wet ? "#aab7c0" : "#cdb9a2"; c.fill();
      // folds
      c.strokeStyle = wet ? "rgba(60,80,95,.35)" : "rgba(110,85,60,.35)"; c.lineWidth = 3; c.lineCap = "round";
      const folds = [[-90, -120, -50, -60, -70, -20], [-30, -150, 0, -90, -20, -30], [30, -160, 60, -100, 40, -40], [80, -120, 100, -70, 80, -30]];
      folds.forEach(f => { c.beginPath(); c.moveTo(f[0], f[1]); c.quadraticCurveTo(f[2] + Math.sin(t * 3) * 3, f[3], f[4], f[5]); c.stroke(); });
      c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 2;
      folds.forEach(f => { c.beginPath(); c.moveTo(f[0] + 6, f[1] + 4); c.quadraticCurveTo(f[2] + 6, f[3], f[4] + 6, f[5]); c.stroke(); });
      // ERA tag
      c.save(); c.translate(-70, -40); c.rotate(-.2);
      const tg = c.createLinearGradient(0, 0, 40, 18); tg.addColorStop(0, "#e0355f"); tg.addColorStop(1, "#b0308f");
      rr(c, 0, 0, 44, 18, 4); c.fillStyle = tg; c.fill();
      c.font = "800 10px Manrope, Arial, sans-serif"; c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ERA", 22, 9.5);
      c.restore();
    },
    dauber(c) {
      shadow(c, 60, 12, .45);
      // head
      c.save(); c.translate(0, -30);
      const hg = c.createRadialGradient(-8, -10, 4, 0, 0, 38);
      hg.addColorStop(0, "#6a4126"); hg.addColorStop(.7, "#3a2416"); hg.addColorStop(1, "#1f140c");
      c.fillStyle = hg; c.beginPath(); c.ellipse(0, 0, 36, 32, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(160,90,45,.8)"; c.beginPath(); c.ellipse(0, 24, 26, 9, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 14, Math.sin(a) * 12); c.lineTo(Math.cos(a) * 34, Math.sin(a) * 30); c.stroke(); }
      c.restore();
      // ferrule
      const fg = c.createLinearGradient(-22, 0, 22, 0);
      fg.addColorStop(0, "#7c7f86"); fg.addColorStop(.35, "#e9ebef"); fg.addColorStop(.7, "#a4a8b0"); fg.addColorStop(1, "#5e6168");
      rr(c, -24, -88, 48, 30, 5); c.fillStyle = fg; c.fill();
      // handle
      rr(c, -17, -210, 34, 126, 16); c.fillStyle = woodGrad(c, -210, -84); c.fill();
      c.fillStyle = "rgba(255,255,255,.2)"; rr(c, -11, -204, 6, 110, 3); c.fill();
    },
    sponge(c, t) {
      shadow(c, 110, 16, .3);
      const g = c.createLinearGradient(0, -96, 0, 0);
      g.addColorStop(0, "#ffd66e"); g.addColorStop(1, "#e3a332");
      rr(c, -96, -92, 192, 88, 26); c.fillStyle = g; c.fill();
      c.save(); c.clip();
      for (let i = 0; i < 46; i++) {
        const x = -90 + hash(i, 1) * 180, y = -86 + hash(i, 2) * 78, r = 2 + hash(i, 3) * 5;
        c.fillStyle = "rgba(150,90,10,.35)"; c.beginPath(); c.ellipse(x, y, r, r * .7, 0, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(-96, -92, 192, 14);
      c.restore();
      // foam cap
      for (let i = 0; i < 16; i++) {
        const x = -88 + i * 11.5 + Math.sin(t * 5 + i) * 2, r = 9 + hash(i, 5) * 9;
        c.fillStyle = "rgba(255,255,255,.92)"; c.beginPath(); c.arc(x, -2 - hash(i, 6) * 6, r, 0, Math.PI * 2); c.fill();
      }
    },
    paint(c, t, o) {
      shadow(c, 40, 8, .35);
      c.save(); c.rotate(-.55);
      const col = (o && o.color) || "#b4521e";
      const bg = c.createLinearGradient(0, 0, 0, -56);
      bg.addColorStop(0, col); bg.addColorStop(.5, col); bg.addColorStop(1, "#d9c7a8");
      c.fillStyle = bg;
      c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(-14, -14, -13, -42, -11, -56); c.lineTo(11, -56); c.bezierCurveTo(13, -42, 14, -14, 0, 2); c.fill();
      const fg = c.createLinearGradient(-12, 0, 12, 0);
      fg.addColorStop(0, "#7c7f86"); fg.addColorStop(.4, "#eceef2"); fg.addColorStop(1, "#6a6d74");
      rr(c, -12, -96, 24, 42, 4); c.fillStyle = fg; c.fill();
      const hg = c.createLinearGradient(-10, 0, 10, 0);
      hg.addColorStop(0, "#111"); hg.addColorStop(.45, "#3a3a3e"); hg.addColorStop(1, "#0c0c0c");
      c.fillStyle = hg; c.beginPath(); c.moveTo(-10, -96); c.lineTo(-6, -300); c.quadraticCurveTo(0, -312, 6, -300); c.lineTo(10, -96); c.fill();
      c.fillStyle = "#e0355f"; c.fillRect(-9.5, -120, 19, 8);
      c.restore();
    }
  };

  function sparkle(c, x, y, s, a) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.translate(x, y);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 1.4);
    g.addColorStop(0, "rgba(255,245,225,.9)"); g.addColorStop(1, "rgba(255,245,225,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, s * 1.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff";
    c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill();
    c.restore();
  }

  const FX = {
    dust(c, pts, k, U) {
      const L = 34;
      for (let i = Math.max(0, Math.floor(k) - L); i <= k; i++) {
        const age = k - i;
        for (let j = 0; j < 5; j++) {
          const h1 = hash(i, j), h2 = hash(i, j + 9), h3 = hash(i, j + 17);
          const p = pts[i];
          const x = p.x + (h1 - .5) * 90 * U + (h2 - .5) * 5 * U * age;
          const y = p.y - 10 * U - (1 + h3 * 2.4) * U * age + .045 * U * age * age;
          const a = (1 - age / L) * .75;
          c.fillStyle = `rgba(214,196,170,${a})`;
          c.beginPath(); c.arc(x, y, (1 + h3 * 2.6) * U, 0, Math.PI * 2); c.fill();
        }
      }
    },
    foam(c, pts, k, U) {
      const L = 70;
      for (let i = Math.max(0, Math.floor(k) - L); i <= k; i++) {
        const age = k - i;
        for (let j = 0; j < 2; j++) {
          const h1 = hash(i, j + 3), h2 = hash(i, j + 5), h3 = hash(i, j + 8);
          const p = pts[i];
          const x = p.x + (h1 - .5) * 70 * U, y = p.y + (h2 - .5) * 40 * U;
          const r = (3 + h3 * 8) * U * (.5 + .5 * Math.min(1, age / 8));
          const a = Math.min(1, age / 3) * (1 - age / L);
          c.fillStyle = `rgba(255,255,255,${.16 * a})`; c.strokeStyle = `rgba(255,255,255,${.6 * a})`; c.lineWidth = U;
          c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke();
          c.fillStyle = `rgba(255,255,255,${.8 * a})`; c.beginPath(); c.arc(x - r * .35, y - r * .35, r * .2, 0, Math.PI * 2); c.fill();
        }
      }
    },
    cream(c, pts, k, U, eng) {
      // wet sheen left behind the dauber, clipped to the item so it never shows in the air
      const i1 = Math.floor(k), i0 = Math.max(0, i1 - 46);
      if (i1 - i0 < 2) return;
      eng.masked(c, 1, s => {
        s.lineCap = s.lineJoin = "round";
        [[30, .12], [14, .2]].forEach(([w, a]) => {
          s.strokeStyle = `rgba(255,205,150,${a})`; s.lineWidth = w * U;
          s.beginPath(); s.moveTo(pts[i0].x, pts[i0].y);
          for (let i = i0 + 1; i <= i1; i++) s.lineTo(pts[i].x, pts[i].y);
          s.stroke();
        });
      });
      for (let i = i0; i <= i1; i += 3) if (hash(i, 7) > .65) sparkle(c, pts[i].x + (hash(i, 8) - .5) * 30 * U, pts[i].y + (hash(i, 9) - .5) * 16 * U, 6 * U, (1 - (i1 - i) / 46) * .6);
    },
    sparkle(c, pts, k, U) {
      const L = 26;
      for (let i = Math.max(0, Math.floor(k) - L); i <= k; i++) {
        if (hash(i, 1) < .55) continue;
        const age = k - i, p = pts[i];
        sparkle(c, p.x + (hash(i, 2) - .5) * 120 * U, p.y + (hash(i, 3) - .5) * 60 * U, (6 + hash(i, 4) * 10) * U, Math.sin(Math.PI * age / L));
      }
    }
  };

  function Restore(canvas, opt) {
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.o = Object.assign({ holdStart: .05, holdEnd: .1, fit: "cover", pad: 1.2, focusY: .5, bg: "#0c0b0a", tool: 1 }, opt);
    this.p = 0; this.target = 0; this.raf = 0; this.visible = true; this.imgs = []; this.ready = false;
  }

  Restore.prototype.load = function (onEach) {
    const self = this;
    const all = this.o.mask ? this.o.images.concat([this.o.mask]) : this.o.images;
    return Promise.all(all.map(src => new Promise(res => {
      const im = new Image();
      im.onload = () => { onEach && onEach(); res(im); };
      im.onerror = () => { onEach && onEach(); res(null); };
      im.src = src;
    }))).then(imgs => {
      if (self.o.mask) self.maskImg = imgs.pop();
      self.imgs = imgs;
      const base = imgs.find(Boolean);
      if (!base) return self;
      self.W = base.naturalWidth; self.H = base.naturalHeight;
      const W = self.W, H = self.H, o = self.o;
      self.roi = { x: o.roi.x * W, y: o.roi.y * H, w: o.roi.w * W, h: o.roi.h * H };
      self.U = self.roi.w / 700;
      self.stages = o.stages.map(s => {
        const r = s.r * W, step = r * .33;
        const pts = s.path === "rows" ? pathRows(self.roi, s.n, step)
          : s.path === "cols" ? pathCols(self.roi, s.n, step)
          : pathCircles(self.roi, s.n, s.loops, s.rad * W, step);
        return Object.assign({}, s, { r, pts });
      });
      self.mask = document.createElement("canvas");
      self.mask.width = Math.ceil(W / MS); self.mask.height = Math.ceil(H / MS);
      self.mctx = self.mask.getContext("2d");
      self.tmp = document.createElement("canvas");
      self.tmp.width = W; self.tmp.height = H;
      self.tctx = self.tmp.getContext("2d");
      self.stamp = document.createElement("canvas");
      self.stamp.width = self.stamp.height = 64;
      const sc = self.stamp.getContext("2d"), g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.55, "rgba(255,255,255,.85)"); g.addColorStop(1, "rgba(255,255,255,0)");
      sc.fillStyle = g; sc.fillRect(0, 0, 64, 64);
      // edge colours for filling space outside the photo (given in options: reading pixels back
      // would throw on file:// pages, where every image taints the canvas)
      self.edgeTop = o.edgeTop || "#000"; self.edgeBottom = o.edgeBottom || self.edgeTop;
      if (self.maskImg) {
        self.sh = document.createElement("canvas");
        self.sh.width = self.maskImg.naturalWidth; self.sh.height = self.maskImg.naturalHeight;
        self.shc = self.sh.getContext("2d");
      }
      self.born = performance.now();
      self.ready = true;
      self.resize();
      return self;
    });
  };

  Restore.prototype.resize = function () {
    if (!this.ready) return;
    const r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.max(1, Math.round(r.width * dpr)); this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.cw = this.cv.width; this.ch = this.cv.height;
    const W = this.W, H = this.H, roi = this.roi, o = this.o, cw = this.cw, ch = this.ch;
    let k = o.fit === "contain" ? Math.min(cw / W, ch / H) : Math.max(cw / W, ch / H);
    const need = roi.w * o.pad;
    if (need * k > cw) k = cw / need;
    const cx = roi.x + roi.w / 2, cy = roi.y + roi.h / 2;
    let ox = cw / 2 - cx * k, oy = ch * o.focusY - cy * k;
    ox = W * k >= cw ? clamp(ox, cw - W * k, 0) : (cw - W * k) / 2;
    if (H * k >= ch) oy = clamp(oy, ch - H * k, 0);
    this.k = k; this.ox = ox; this.oy = oy;
    this.draw(this.p, performance.now());
  };

  Restore.prototype.set = function (p) {
    this.target = clamp(p, 0, 1);
    this.kick();
  };
  Restore.prototype.kick = function () {
    if (!this.raf && this.ready) this.raf = requestAnimationFrame(this.tick.bind(this));
  };
  Restore.prototype.tick = function (now) {
    this.raf = 0;
    const gap = this.target - this.p;
    this.p = Math.abs(gap) < .0004 ? this.target : this.p + gap * .12;
    const busy = this.draw(this.p, now);
    const idle = this.p >= 1 - this.o.holdEnd; // sparkles + sheen keep moving in the final state
    if (this.p !== this.target || busy || (idle && this.visible)) this.kick();
  };

  Restore.prototype.stageQ = function (p) {
    const o = this.o, n = this.stages.length, a = o.holdStart, b = 1 - o.holdEnd;
    return this.stages.map((s, i) => range(p, a + (b - a) * i / n, a + (b - a) * (i + 1) / n));
  };

  Restore.prototype.toolPos = function (st, q) {
    const pts = st.pts, fi = q * (pts.length - 1), i0 = Math.min(pts.length - 2, Math.floor(fi)), f = fi - i0;
    const a = pts[i0], b = pts[i0 + 1];
    return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), fi, a, b };
  };

  // light band swept across the item only (clipped by the item mask), added with "lighter"
  Restore.prototype.sheen = function (c, pos, alpha, width, ang) {
    if (!this.maskImg || alpha <= 0) return;
    const s = this.shc, w = this.sh.width, h = this.sh.height;
    s.globalCompositeOperation = "source-over"; s.clearRect(0, 0, w, h);
    s.save(); s.translate(w * pos, h / 2); s.rotate(ang || .5);
    const bw = w * (width || .16), g = s.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, "rgba(255,240,220,0)"); g.addColorStop(.5, "rgba(255,240,220,1)"); g.addColorStop(1, "rgba(255,240,220,0)");
    s.fillStyle = g; s.fillRect(-bw, -h * 2, bw * 2, h * 4); s.restore();
    s.globalCompositeOperation = "destination-in"; s.drawImage(this.maskImg, 0, 0, w, h);
    c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = alpha; c.drawImage(this.sh, 0, 0, this.W, this.H); c.restore();
  };

  // draw with fn (in image coords) onto the scratch canvas, keep only what lies on the item, add with "lighter"
  Restore.prototype.masked = function (c, alpha, fn) {
    if (!this.maskImg) return;
    const s = this.shc, w = this.sh.width, h = this.sh.height;
    s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = "source-over"; s.clearRect(0, 0, w, h);
    s.save(); s.scale(w / this.W, h / this.H); fn(s); s.restore();
    s.globalCompositeOperation = "destination-in"; s.drawImage(this.maskImg, 0, 0, w, h);
    c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = alpha; c.drawImage(this.sh, 0, 0, this.W, this.H); c.restore();
  };

  Restore.prototype.draw = function (p, now) {
    if (!this.ready || !this.cw) return false;
    const c = this.ctx, W = this.W, H = this.H, o = this.o, roi = this.roi, U = this.U;
    const qs = this.stageQ(p), n = qs.length;
    let cur = 0; while (cur < n && qs[cur] >= 1) cur++;
    const active = cur < n && qs[cur] > 0;
    let busy = false;

    // stage completed → flash
    if (this.lastCur !== undefined && cur > this.lastCur) { this.flashAt = now; if (o.onStage) o.onStage(cur); }
    this.lastCur = cur;

    // ---- camera: push in and follow the tool while working, pull back when done
    const rcx = roi.x + roi.w / 2, rcy = roi.y + roi.h / 2;
    let tz = 1, tx = rcx, ty = rcy, tp = null;
    if (active) {
      tp = this.toolPos(this.stages[cur], qs[cur]);
      tz = o.zoom || 1.2; tx = lerp(rcx, tp.x, .42); ty = lerp(rcy, tp.y, .3);
    }
    const intro = clamp((now - this.born) / 1800, 0, 1), ie = 1 - Math.pow(1 - intro, 3);
    tz += (1 - ie) * .12;
    if (this.cz === undefined) { this.cz = tz; this.cx = tx; this.cy = ty; this.lt = now; }
    const dt = clamp((now - this.lt) / 16.7, 0, 4); this.lt = now;
    const e = 1 - Math.pow(1 - .06, dt);
    this.cz += (tz - this.cz) * e; this.cx += (tx - this.cx) * e; this.cy += (ty - this.cy) * e;
    if (Math.abs(tz - this.cz) > .001 || Math.abs(tx - this.cx) > .5 || Math.abs(ty - this.cy) > .5 || intro < 1) busy = true;
    const K = this.k * this.cz, sfx = this.ox + rcx * this.k, sfy = this.oy + rcy * this.k;
    const OX = sfx - this.cx * K, OY = sfy - this.cy * K;

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
    c.fillStyle = this.edgeTop; c.fillRect(0, 0, this.cw, this.ch / 2 + 1);
    c.fillStyle = this.edgeBottom; c.fillRect(0, this.ch / 2, this.cw, this.ch / 2);
    c.setTransform(K, 0, 0, K, OX, OY);

    const baseImg = this.imgs[cur] || this.imgs[0];
    if (baseImg) c.drawImage(baseImg, 0, 0, W, H);

    if (active && this.imgs[cur + 1]) {
      const st = this.stages[cur], q = qs[cur], m = this.mctx;
      m.clearRect(0, 0, this.mask.width, this.mask.height);
      const kk = q * (st.pts.length - 1), r = st.r / MS;
      for (let i = 0; i <= kk; i++) { const pt = st.pts[i]; m.drawImage(this.stamp, pt.x / MS - r, pt.y / MS - r, r * 2, r * 2); }
      if (q > .8) { m.globalAlpha = Math.pow((q - .8) / .2, 1.3); m.fillStyle = "#fff"; m.fillRect(0, 0, this.mask.width, this.mask.height); m.globalAlpha = 1; }
      const t = this.tctx;
      t.globalCompositeOperation = "copy"; t.drawImage(this.mask, 0, 0, W, H);
      t.globalCompositeOperation = "source-in"; t.drawImage(this.imgs[cur + 1], 0, 0, W, H);
      t.globalCompositeOperation = "source-over";
      c.drawImage(this.tmp, 0, 0);
    }

    // feather photo edges into the fill colour
    const fe = H * .14;
    { const g = c.createLinearGradient(0, 0, 0, fe); g.addColorStop(0, this.edgeTop); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(-W, -H, W * 3, H + fe); }
    { const g = c.createLinearGradient(0, H - fe, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, this.edgeBottom); c.fillStyle = g; c.fillRect(-W, H - fe, W * 3, H + fe); }

    // ---- spotlight: darken around, warm glow at the tool
    const lx = tp ? tp.x : rcx, ly = tp ? tp.y : rcy;
    const spot = active ? clamp(Math.min(qs[cur] / .08, (1 - qs[cur]) / .08), 0, 1) : 0;
    this.spot = this.spot === undefined ? spot : this.spot + (spot - this.spot) * e;
    if (this.spot > .01) {
      busy = busy || Math.abs(spot - this.spot) > .01;
      const R = roi.w * .9, g = c.createRadialGradient(lx, ly, R * .15, lx, ly, R * 1.6);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${(o.dim || .45) * this.spot})`);
      c.fillStyle = g; c.fillRect(-W, -H, W * 3, H * 3);
      c.save(); c.globalCompositeOperation = "lighter";
      const g2 = c.createRadialGradient(lx, ly, 0, lx, ly, roi.w * .32);
      g2.addColorStop(0, `rgba(255,190,130,${.16 * this.spot})`); g2.addColorStop(1, "rgba(255,190,130,0)");
      c.fillStyle = g2; c.fillRect(lx - roi.w, ly - roi.w, roi.w * 2, roi.w * 2); c.restore();
    }

    // ---- sheen: follows the polishing cloth, flashes when a stage completes, loops at the end
    if (active && this.stages[cur].sheen) this.sheen(c, clamp((tp.x - roi.x) / roi.w, 0, 1) * .8 + .1, .22 * spot, .1);
    if (this.flashAt) {
      const f = (now - this.flashAt) / 1100;
      if (f < 1) { this.sheen(c, -.2 + f * 1.4, .55 * Math.sin(Math.PI * f), .2); busy = true; }
    }
    const fin = range(p, 1 - o.holdEnd * .9, 1);
    if (fin > 0) {
      const loop = ((now / 1000) % 3.4) / 3.4;
      this.sheen(c, -.3 + loop * 1.6, .38 * fin * Math.sin(Math.PI * clamp(loop * 1.25, 0, 1)), .18);
    }

    // ---- particles + tool
    if (active) {
      const st = this.stages[cur], q = qs[cur], pts = st.pts, fi = tp.fi;
      let x = tp.x, y = tp.y;
      if (st.fx && FX[st.fx]) FX[st.fx](c, pts, fi, U, this);
      const env = clamp(Math.min(q / .06, (1 - q) / .06), 0, 1);
      if (env > 0 && TOOLS[st.tool]) {
        const dx = tp.b.x - tp.a.x, dy = tp.b.y - tp.a.y, len = Math.hypot(dx, dy) || 1;
        const ang = (dx / len) * -.1 + (dy / len) * .08 + Math.sin(fi * .8) * .05 + (st.tilt || 0);
        if (st.tool === "brush") x += Math.sin(fi * 1.6) * 14 * U;
        y -= (1 - env) * 160 * U;
        c.save(); c.globalAlpha = env; c.translate(x, y); c.rotate(ang);
        const s = U * (st.size || 1) * o.tool; c.scale(s, s);
        TOOLS[st.tool](c, fi * .1, st);
        c.restore();
      }
    }

    // ---- final sparkles
    if (fin > 0 && o.sparkles) {
      const tt = now / 1000;
      o.sparkles.forEach((sp, i) => {
        const tw = .5 + .5 * Math.sin(tt * 2.2 + i * 1.7);
        sparkle(c, roi.x + sp[0] * roi.w, roi.y + sp[1] * roi.h, (10 + sp[2] * 12) * U * (.6 + .4 * tw), fin * tw);
      });
    }

    // ---- intro: rise out of darkness
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (intro < 1) { c.fillStyle = `rgba(0,0,0,${(1 - ie) * .92})`; c.fillRect(0, 0, this.cw, this.ch); }
    if (o.onDraw) o.onDraw(p, qs, cur);
    return busy;
  };

  window.Restore = Restore;
})();
