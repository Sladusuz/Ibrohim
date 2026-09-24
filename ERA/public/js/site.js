(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const PHONE_FALLBACK = '<a href="tel:+9987788888">+998 778 88 88</a> yoki <a href="https://t.me/erashoemaker" target="_blank" rel="noopener">Telegram</a>';

  /* ---------- viewport height in px (iOS URL bar) ---------- */
  let lastW = innerWidth, vh = innerHeight;
  function setVh(force) {
    const h = Math.max(1, innerHeight);
    if (!force && innerWidth === lastW && Math.abs(h - vh) < 120) return false;
    vh = h; lastW = innerWidth;
    document.documentElement.style.setProperty("--vh", h + "px");
    return true;
  }
  setVh(true);

  /* ---------- restoration canvases ---------- */
  const shoe = new Restore($("#shoeCanvas"), {
    images: [0, 1, 2, 3, 4].map(i => `assets/shoe-${i}.jpg`),
    mask: "assets/shoe-mask.png",
    roi: { x: .265, y: .315, w: .47, h: .315 },
    pad: 1.22, focusY: .5, edgeTop: "#211d19", edgeBottom: "#0c0b0a", zoom: 1.28, dim: .55,
    stages: [
      { tool: "brush", path: "rows", n: 4, r: .05, fx: "dust", size: 1 },
      { tool: "cloth", path: "cols", n: 9, r: .05, fx: "foam", wet: true, size: .78 },
      { tool: "dauber", path: "circles", n: 2, loops: 7, rad: .03, r: .05, fx: "cream", size: .9 },
      { tool: "cloth", path: "circles", n: 2, loops: 5, rad: .045, r: .06, fx: "sparkle", size: .8, sheen: true }
    ],
    sparkles: [[.12, .72, .6], [.3, .62, 1], [.58, .52, .8], [.7, .78, .5], [.82, .25, .7], [.45, .35, .4], [.22, .45, .5]],
    onStage: i => bigStage("#shoeBig", i),
    onDraw: stepsUI("#shoeSteps", "#shoeChip", (p, active) => {
      $(".hero-head").classList.toggle("is-away", p > .035);
      bigStage("#shoeBig", active, p > .035 && p < .92);
      $("#shoeFinal").classList.toggle("is-on", p > .92);
      $("#shoeSteps").classList.toggle("is-hidden", p > .92);
      $("#scrollHint").style.opacity = p > .01 ? 0 : 1;
    })
  });
  const bag = new Restore($("#bagCanvas"), {
    images: [0, 1, 2, 3].map(i => `assets/bag-${i}.jpg`),
    mask: "assets/bag-mask.png",
    roi: { x: .03, y: .27, w: .94, h: .66 },
    fit: "cover", pad: 1.06, focusY: .54, holdStart: .06, holdEnd: .12, tool: 1.15,
    edgeTop: "#cececb", edgeBottom: "#d4d5d5", zoom: 1.22, dim: .28,
    stages: [
      { tool: "sponge", path: "rows", n: 5, r: .065, fx: "foam" },
      { tool: "paint", path: "cols", n: 8, r: .065, color: "#c2561d", size: 1.1 },
      { tool: "cloth", path: "circles", n: 3, loops: 5, rad: .05, r: .07, fx: "sparkle", sheen: true }
    ],
    sparkles: [[.15, .3, .7], [.4, .18, 1], [.7, .4, .6], [.85, .15, .8], [.3, .7, .5], [.62, .75, .7]],
    onStage: i => bigStage("#bagBig", i),
    onDraw: stepsUI("#bagSteps", "#bagChip", (p, active) => {
      $("#bagDone").classList.toggle("is-on", p > .9);
      bigStage("#bagBig", active, p > .04 && p < .9);
      const st = $(".bag-stage");
      st.style.transform = `perspective(1400px) rotateY(${((.5 - p) * 9).toFixed(2)}deg) rotateX(${(Math.sin(p * Math.PI) * 3).toFixed(2)}deg) translateY(${(-Math.sin(p * Math.PI) * 10).toFixed(1)}px)`;
    })
  });

  // big kinetic stage number + title
  const bigState = {};
  function bigStage(sel, i, show) {
    const el = $(sel); if (!el) return;
    const steps = $$(".step b", el.closest(".sticky"));
    i = Math.min(i, steps.length - 1);
    if (show !== undefined) el.classList.toggle("is-on", show);
    if (bigState[sel] === i) return;
    bigState[sel] = i;
    const title = steps[i].textContent.replace(/^\d+\.\s*/, "");
    el.classList.remove("swap"); void el.offsetWidth;
    $(".n", el).textContent = String(i + 1).padStart(2, "0");
    $(".t", el).textContent = title;
    $(".of", el).textContent = "/ " + String(steps.length).padStart(2, "0");
    el.classList.add("swap");
  }

  function stepsUI(stepsSel, chipSel, extra) {
    const steps = $$(".step", $(stepsSel)), bars = steps.map(s => $(".bar i", s)), dots = $$(".dots i", $(stepsSel));
    const chip = $(chipSel), em = $("em", chip), bef = $(".before", chip), aft = $(".after", chip);
    let last = "";
    return (p, qs, cur) => {
      const active = Math.min(cur, qs.length - 1);
      const pct = Math.round(qs.reduce((a, b) => a + b, 0) / qs.length * 100);
      const key = active + "|" + pct + "|" + qs.map(q => q.toFixed(3)).join();
      extra && extra(p, active);
      if (key === last) return;
      last = key;
      steps.forEach((s, i) => {
        s.classList.toggle("is-on", i === active && pct < 100);
        s.classList.toggle("is-done", qs[i] >= 1);
        bars[i].style.transform = `scaleX(${qs[i]})`;
      });
      dots.forEach((d, i) => d.classList.toggle("is-on", i === active));
      em.textContent = pct + "%";
      bef.classList.toggle("is-on", pct < 100);
      aft.classList.toggle("is-on", pct >= 100);
    };
  }

  const scrollies = [[$("#shoeScrolly"), shoe], [$("#bagScrolly"), bag]];
  function onScroll() {
    const y = scrollY || pageYOffset;
    scrollies.forEach(([el, r]) => {
      const top = el.offsetTop, len = el.offsetHeight - vh;
      if (y < top - vh || y > top + len + vh) return; // off-screen
      r.set(clamp((y - top) / len, 0, 1));
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  function relayout(force) {
    if (!setVh(force) && !force) return;
    shoe.resize(); bag.resize(); onScroll();
  }
  addEventListener("resize", () => { if (setVh(false)) relayout(true); else { shoe.resize(); bag.resize(); } });
  addEventListener("orientationchange", () => setTimeout(() => relayout(true), 200));

  if ("IntersectionObserver" in window) {
    scrollies.forEach(([el, r]) => new IntersectionObserver(es => { r.visible = es[0].isIntersecting; if (r.visible) r.kick(); }).observe(el));
  }

  /* ---------- preloader ---------- */
  const boot = $("#boot"), bootBar = $("#bootBar"), bootPct = $("#bootPct");
  const total = 9; let got = 0;
  const tick = () => { got++; const f = Math.min(1, got / total); bootBar.style.transform = `scaleX(${f})`; bootPct.textContent = "YUKLANMOQDA " + Math.round(f * 100) + "%"; };
  let started = false;
  function start() {
    if (started) return; started = true;
    boot.classList.add("done"); document.body.classList.add("is-ready");
    shoe.resize(); bag.resize(); onScroll();
  }
  Promise.all([shoe.load(tick), bag.load(tick)]).then(start, start);
  setTimeout(start, 10000);

  /* ---------- before / after sliders ---------- */
  $$("[data-compare]").forEach(fig => {
    const input = $("input", fig);
    input.style.pointerEvents = "none";
    const setX = v => { v = clamp(v, 0, 100); fig.style.setProperty("--x", v + "%"); input.value = v; };
    let down = false, sx = 0, sy = 0, dragging = false;
    const fromEvent = e => { const r = fig.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    fig.addEventListener("pointerdown", e => { down = true; dragging = e.pointerType === "mouse"; sx = e.clientX; sy = e.clientY; if (dragging) { setX(fromEvent(e)); fig.setPointerCapture(e.pointerId); } });
    fig.addEventListener("pointermove", e => {
      if (!down) return;
      if (!dragging) { // touch: only take over for horizontal drags so vertical page scroll still works
        if (Math.abs(e.clientX - sx) > 8 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) { dragging = true; fig.setPointerCapture(e.pointerId); }
        else if (Math.abs(e.clientY - sy) > 8) { down = false; return; }
      }
      if (dragging) setX(fromEvent(e));
    });
    const up = e => { if (down && !dragging && e.type === "pointerup") setX(fromEvent(e)); down = dragging = false; };
    fig.addEventListener("pointerup", up); fig.addEventListener("pointercancel", up);
    input.addEventListener("input", () => setX(+input.value));
    fig.addEventListener("click", () => input.focus({ preventScroll: true }));
    fig._hint = () => {
      const t0 = performance.now(), D = 1800;
      const step = now => { const t = clamp((now - t0) / D, 0, 1); setX(50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t)); if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
  });

  /* ---------- split headings into words for a staggered rise ---------- */
  let wi = 0;
  function splitWords(el) {
    let n = 0;
    const walk = (node, grad) => Array.from(node.childNodes).forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(" "); return; }
          const w = document.createElement("span"), inner = document.createElement("span");
          w.className = "w"; inner.className = "wi" + (grad ? " grad-text" : "");
          inner.style.transitionDelay = (n++ * 70) + "ms";
          inner.textContent = part; w.append(inner); frag.append(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== "BR") {
        const g = ch.classList.contains("grad-text");
        if (g) ch.classList.remove("grad-text");
        walk(ch, grad || g);
      }
    });
    walk(el, false);
    wi += n;
  }
  $$(".h2, .hero-head h1").forEach(splitWords);

  /* ---------- 3D tilt on cards ---------- */
  if (matchMedia("(hover: hover)").matches) {
    $$(".svc, .ccard, .how li").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
        card.style.setProperty("--mx", (x + .5) * 100 + "%"); card.style.setProperty("--my", (y + .5) * 100 + "%");
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- reveal on scroll + slider hint + counters ---------- */
  const fmt = (n, dec) => dec ? n.toFixed(dec).replace(".", ",") : String(Math.round(n));
  function countUp(el) {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || "", t0 = performance.now();
    const step = now => { const t = clamp((now - t0) / 1100, 0, 1), e = 1 - Math.pow(1 - t, 3); el.textContent = fmt(to * e, dec) + suf; if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target); e.target.classList.add("is-in");
      const c = e.target.matches("[data-compare]") ? e.target : $("[data-compare]", e.target);
      if (c && c._hint) setTimeout(c._hint, 350);
    }), { threshold: .18 });
    $$(".reveal, .h2").forEach(el => io.observe(el));
    const nums = $$("#stats strong");
    nums.forEach(el => el.textContent = fmt(0, +el.dataset.dec || 0) + (el.dataset.suffix || ""));
    const so = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { so.disconnect(); nums.forEach(countUp); } }, { threshold: .4 });
    so.observe($("#stats"));
    // active nav link
    const links = $$(".nav-links a");
    const no = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(a => { const s = $(a.getAttribute("href")); if (s) no.observe(s); });
  } else {
    $$(".reveal").forEach(el => el.classList.add("is-in"));
  }

  /* ---------- lead form ---------- */
  const form = $("#leadForm"), card = $("#formCard"), phone = $("#phone"), nameI = $("#name");
  const err = $("#formError"), btn = $("#submitBtn"), thumbs = $("#thumbs"), fileI = $("#photos"), drop = $("#drop");
  let photos = [];

  function fmtPhone(v) {
    let d = v.replace(/\D/g, "");
    if ("998".startsWith(d)) d = "998";
    else if (!d.startsWith("998")) d = "998" + d;
    d = d.slice(0, 12);
    const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
    return "+" + p.join(" ");
  }
  const phoneOk = () => phone.value.replace(/\D/g, "").length === 12;
  phone.addEventListener("focus", () => { if (!phone.value) phone.value = "+998 "; });
  phone.addEventListener("blur", () => { if (phone.value.replace(/\D/g, "") === "998") phone.value = ""; });
  phone.addEventListener("input", () => { phone.value = fmtPhone(phone.value); $("#f-phone").classList.remove("err"); progress(); });
  nameI.addEventListener("input", () => { $("#f-name").classList.remove("err"); progress(); });

  function progress() {
    const bars = $$(".fprogress i");
    bars[0].classList.toggle("is-on", !!form.querySelector("[name=item]:checked"));
    bars[1].classList.toggle("is-on", !!form.querySelector("[name=services]:checked"));
    bars[2].classList.toggle("is-on", nameI.value.trim().length >= 2 && phoneOk());
    bars[3].classList.toggle("is-on", !!form.querySelector("[name=branch]:checked") && bars[2].classList.contains("is-on"));
  }
  form.addEventListener("change", progress);
  progress();

  function compress(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const max = 1280, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let q = .82, out = c.toDataURL("image/jpeg", q);
        while (out.length > 1.4e6 && q > .4) { q -= .12; out = c.toDataURL("image/jpeg", q); }
        res(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("bad image")); };
      img.src = url;
    });
  }
  function renderThumbs() {
    thumbs.innerHTML = "";
    photos.forEach((src, i) => {
      const f = document.createElement("figure"), im = document.createElement("img"), b = document.createElement("button");
      im.src = src; im.alt = ""; b.type = "button"; b.textContent = "×"; b.setAttribute("aria-label", "Rasmni o'chirish");
      b.onclick = () => { photos.splice(i, 1); renderThumbs(); };
      f.append(im, b); thumbs.append(f);
    });
  }
  async function addFiles(list) {
    for (const f of Array.from(list)) {
      if (photos.length >= 3) break;
      if (!/^image\//.test(f.type)) continue;
      try { photos.push(await compress(f)); } catch (e) { /* skip unreadable file */ }
    }
    renderThumbs();
  }
  fileI.addEventListener("change", () => { addFiles(fileI.files); fileI.value = ""; });
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", e => { e.preventDefault(); addFiles(e.dataTransfer.files); });

  function showErr(html) { err.innerHTML = html; err.classList.add("is-on"); }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    err.classList.remove("is-on");
    let bad = false;
    if (nameI.value.trim().length < 2) { $("#f-name").classList.add("err"); bad = true; }
    if (!phoneOk()) { $("#f-phone").classList.add("err"); bad = true; }
    if (bad) { (bad && nameI.value.trim().length < 2 ? nameI : phone).focus(); return; }
    const data = {
      item: form.querySelector("[name=item]:checked").value,
      services: $$("[name=services]:checked", form).map(i => i.value),
      name: nameI.value.trim(),
      phone: "+" + phone.value.replace(/\D/g, ""),
      branch: form.querySelector("[name=branch]:checked").value,
      time: $("#time").value,
      brand: $("#brand").value.trim(),
      comment: $("#comment").value.trim(),
      photos,
      website: $("#website").value
    };
    if (location.protocol === "file:") {
      showErr("Sayt hozir fayl sifatida ochilgan. Zayavkalar admin panelga tushishi uchun saytni server orqali ishga tushiring (<b>node server.js</b>). Hozircha bog'lanish: " + PHONE_FALLBACK);
      return;
    }
    btn.classList.add("is-loading"); btn.disabled = true;
    try {
      const res = await fetch("api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || "Server xatosi");
      $("#leadNum").textContent = "Zayavka № " + String(out.id).padStart(4, "0");
      card.classList.add("is-sent");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (ex) {
      showErr((ex.message && ex.message !== "Failed to fetch" ? ex.message + ". " : "Internet aloqasini tekshiring. ") + "Yoki bizga to'g'ridan-to'g'ri yozing: " + PHONE_FALLBACK);
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  });
  $("#againBtn").addEventListener("click", () => {
    form.reset(); photos = []; renderThumbs(); progress();
    card.classList.remove("is-sent");
  });
})();
