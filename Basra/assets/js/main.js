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

  /* ---------- i18n: uz / ru / en ---------- */
  const I18N = {
    uz: {
      brandSub: "Ta'lim Markazi",
      tagline: "Farzandingiz kelajagi uchun mustahkam poydevor — tajribali ustozlar bilan Arab va Ingliz tillarini qiziqarli metodikada o'rganing.",
      chipDaily: "Har kuni",
      chipCity: "Toshkent",
      linkCallT: "Qo'ng'iroq qilish",
      linkTelegramT: "Telegram kanali",
      linkYoutubeS: "Darslar va natijalar",
      linkLocationT: "Manzil",
      coursesTitle: "Yo'nalishlarimiz",
      courseArabT: "Arab tili",
      courseArabS: "Nutq, yozuv va grammatika",
      courseArabKidsS: "Kichkintoylar uchun",
      courseEngT: "Ingliz tili",
      courseEngS: "Zamonaviy metodika",
      courseEngKidsS: "O'yin orqali til o'rganish",
      coursePrepT: "Maktabga tayyorlov",
      coursePrepS: "Bilim va ko'nikmalar asosi",
      locationTitle: "Manzilimiz",
      mapLandmark: "Mo'ljal: Hasan qori masjidi ro'parasi",
      mapCta: "Yo'nalish olish →",
      footBrand: "Basra Ta'lim Markazi",
      footRights: "Barcha huquqlar himoyalangan",
      typed: ["Arab tili", "Arab Kids", "Ingliz tili", "English Kids", "Maktabga tayyorlov"],
    },
    ru: {
      brandSub: "Учебный центр",
      tagline: "Прочный фундамент для будущего вашего ребёнка — изучайте арабский и английский языки с опытными преподавателями по увлекательной методике.",
      chipDaily: "Ежедневно",
      chipCity: "Ташкент",
      linkCallT: "Позвонить",
      linkTelegramT: "Telegram-канал",
      linkYoutubeS: "Уроки и результаты",
      linkLocationT: "Адрес",
      coursesTitle: "Наши направления",
      courseArabT: "Арабский язык",
      courseArabS: "Речь, письмо и грамматика",
      courseArabKidsS: "Для малышей",
      courseEngT: "Английский язык",
      courseEngS: "Современная методика",
      courseEngKidsS: "Изучение языка через игру",
      coursePrepT: "Подготовка к школе",
      coursePrepS: "Основа знаний и навыков",
      locationTitle: "Наш адрес",
      mapLandmark: "Ориентир: напротив мечети Хасан кори",
      mapCta: "Проложить маршрут →",
      footBrand: "Basra — Учебный центр",
      footRights: "Все права защищены",
      typed: ["Арабский язык", "Arab Kids", "Английский язык", "English Kids", "Подготовка к школе"],
    },
    en: {
      brandSub: "Education Center",
      tagline: "A strong foundation for your child's future — learn Arabic and English with experienced teachers through an engaging methodology.",
      chipDaily: "Daily",
      chipCity: "Tashkent",
      linkCallT: "Call us",
      linkTelegramT: "Telegram channel",
      linkYoutubeS: "Lessons & results",
      linkLocationT: "Location",
      coursesTitle: "Our Programs",
      courseArabT: "Arabic",
      courseArabS: "Speaking, writing & grammar",
      courseArabKidsS: "For little ones",
      courseEngT: "English",
      courseEngS: "Modern methodology",
      courseEngKidsS: "Learning through play",
      coursePrepT: "School Preparation",
      coursePrepS: "Foundation of knowledge & skills",
      locationTitle: "Our Location",
      mapLandmark: "Landmark: opposite Hasan qori mosque",
      mapCta: "Get directions →",
      footBrand: "Basra Education Center",
      footRights: "All rights reserved",
      typed: ["Arabic", "Arab Kids", "English", "English Kids", "School Prep"],
    },
  };

  let currentLang = "uz";
  try { currentLang = localStorage.getItem("basra_lang") || "uz"; } catch (e) { /* private mode */ }
  if (!I18N[currentLang]) currentLang = "uz";

  const langButtons = document.querySelectorAll(".lang-btn");
  const langThumb = document.getElementById("langThumb");
  const i18nEls = document.querySelectorAll("[data-i18n]");

  function paintLang(lang) {
    const dict = I18N[lang];
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.documentElement.lang = lang;
    langButtons.forEach((btn, i) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("active", active);
      if (active && langThumb) langThumb.style.transform = `translateX(${i * 54}px)`;
    });
  }

  function setLang(lang, { fade = true } = {}) {
    if (!I18N[lang] || lang === currentLang) { paintLang(lang); return; }
    currentLang = lang;
    try { localStorage.setItem("basra_lang", lang); } catch (e) { /* private mode */ }
    if (fade && !reduceMotion) {
      document.body.classList.add("content-fading");
      setTimeout(() => {
        paintLang(lang);
        resetTyped();
        document.body.classList.remove("content-fading");
      }, 190);
    } else {
      paintLang(lang);
      resetTyped();
    }
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  paintLang(currentLang);

  /* ---------- typewriter tagline (language-aware) ---------- */
  const typedTarget = document.getElementById("typedText");
  let typedPhraseIdx = 0, typedCharIdx = 0, typedDeleting = false;
  function resetTyped() { typedPhraseIdx = 0; typedCharIdx = 0; typedDeleting = false; if (typedTarget) typedTarget.textContent = ""; }
  if (typedTarget) {
    function step() {
      const phrases = I18N[currentLang].typed;
      const current = phrases[typedPhraseIdx % phrases.length];
      if (!typedDeleting) {
        typedCharIdx++;
        typedTarget.textContent = current.slice(0, typedCharIdx);
        if (typedCharIdx === current.length) { typedDeleting = true; setTimeout(step, 1300); return; }
      } else {
        typedCharIdx--;
        typedTarget.textContent = current.slice(0, typedCharIdx);
        if (typedCharIdx === 0) { typedDeleting = false; typedPhraseIdx = (typedPhraseIdx + 1) % phrases.length; }
      }
      setTimeout(step, typedDeleting ? 35 : 65);
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
