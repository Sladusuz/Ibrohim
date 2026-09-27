(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- floating particles ---------- */
  const particleHost = document.getElementById("particles");
  if (particleHost && !reduceMotion) {
    const COUNT = 26;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      const size = 2.5 + Math.random() * 4.5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
      const duration = 10 + Math.random() * 14;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `${Math.random() * duration}s`;
      particleHost.appendChild(p);
    }
  }

  /* ---------- constellation canvas (hero backdrop) ---------- */
  const canvas = document.getElementById("constellation");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr;
    let points = [];
    const N = window.innerWidth < 560 ? 24 : 40;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      points = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 1 + Math.random() * 1.4,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(246,226,184,${0.14 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251,243,231,0.55)";
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    resize();
    seed();
    tick();
    window.addEventListener("resize", () => { resize(); seed(); });
  }

  /* ---------- cursor glow (desktop only) ---------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      glow.classList.add("active");
    });
    window.addEventListener("pointerleave", () => glow.classList.remove("active"));
  }

  /* ---------- avatar subtle 3D tilt ---------- */
  const avatar = document.querySelector(".avatar");
  const avatarWrap = document.querySelector(".avatar-wrap");
  if (avatar && avatarWrap && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    avatarWrap.addEventListener("mousemove", (e) => {
      const rect = avatarWrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      avatar.style.transform = `perspective(400px) rotateX(${py * -14}deg) rotateY(${px * 14}deg) scale(1.04)`;
    });
    avatarWrap.addEventListener("mouseleave", () => {
      avatar.style.transform = "";
    });
  }

  /* ---------- magnetic buttons + spotlight vars ---------- */
  const magnetic = document.querySelectorAll("[data-magnetic]");
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  magnetic.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);
      if (isFinePointer) {
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `translate(${px * 8}px, ${py * 6}px)`;
      }
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* ---------- course card tilt + spotlight ---------- */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);
      if (isFinePointer) {
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(600px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) translateY(-2px)`;
      }
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* ---------- scroll / entrance reveal with stagger ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  let staggerIndex = 0;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.transitionDelay = `${Math.min(staggerIndex * 65, 520)}ms`;
        staggerIndex++;
        el.classList.add("in-view");
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- animated count-up stats ---------- */
  const counters = document.querySelectorAll(".num[data-count]");
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 1200;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(ease(p) * target).toLocaleString("uz-UZ");
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => countIO.observe(el));

  /* ---------- typewriter tagline ---------- */
  const typedTarget = document.getElementById("typedText");
  if (typedTarget) {
    const phrases = ["Arab tili", "Arab Kids", "Ingliz tili", "English Kids", "Maktabga tayyorlov"];
    let phraseIdx = 0, charIdx = 0, deleting = false;
    function step() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        typedTarget.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) { deleting = true; setTimeout(step, 1300); return; }
      } else {
        charIdx--;
        typedTarget.textContent = current.slice(0, charIdx);
        if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
      }
      setTimeout(step, deleting ? 35 : 65);
    }
    step();
  }

  /* ---------- ripple effect on interactive cards ---------- */
  document.querySelectorAll(".link-btn, .course-card, .map-cta").forEach((el) => {
    el.style.position = el.style.position || "relative";
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.2;
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
})();
