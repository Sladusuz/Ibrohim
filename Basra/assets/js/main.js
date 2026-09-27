(() => {
  "use strict";

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- floating particles ---------- */
  const particleHost = document.getElementById("particles");
  if (particleHost) {
    const COUNT = 22;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      const size = 3 + Math.random() * 5;
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

  /* ---------- scroll / entrance reveal with stagger ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  let staggerIndex = 0;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.transitionDelay = `${Math.min(staggerIndex * 70, 560)}ms`;
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
    const phrases = [
      "Arab tili",
      "Arab Kids",
      "Ingliz tili",
      "English Kids",
      "Maktabga tayyorlov",
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function step() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        typedTarget.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(step, 1300);
          return;
        }
      } else {
        charIdx--;
        typedTarget.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
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
