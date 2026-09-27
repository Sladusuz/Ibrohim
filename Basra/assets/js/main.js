(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Counters ----------
   * Numbers are formatted with plain String(), never toLocaleString()/
   * Intl.NumberFormat with grouping — that is what turns "2023" into "2,023".
   */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;

    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var value = Math.round(target * easeOutCubic(progress));
      el.textContent = String(value);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".num[data-count]");
  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- Typed text ---------- */
  var typedEl = document.getElementById("typedText");
  var phrases = ["Arab tili", "Arab Kids", "Ingliz tili", "English Kids", "Maktabga tayyorlov"];
  if (typedEl) {
    var pIndex = 0, cIndex = 0, deleting = false;
    (function typeLoop() {
      var word = phrases[pIndex];
      if (!deleting) {
        cIndex++;
        typedEl.textContent = word.slice(0, cIndex);
        if (cIndex === word.length) {
          deleting = true;
          return setTimeout(typeLoop, 1400);
        }
      } else {
        cIndex--;
        typedEl.textContent = word.slice(0, cIndex);
        if (cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
        }
      }
      setTimeout(typeLoop, deleting ? 45 : 90);
    })();
  }

  /* ---------- Cursor glow ---------- */
  var glow = document.getElementById("cursorGlow");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;
  if (glow && !isTouch && !reduceMotion) {
    window.addEventListener("mousemove", function (e) {
      glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    }, { passive: true });
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.06 + "px," + y * 0.18 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0,0)";
      });
    });

    /* ---------- Tilt cards ---------- */
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(600px) rotateX(" + (-y * 8) + "deg) rotateY(" + (x * 8) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(600px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ---------- Floating particles ---------- */
  var particleHost = document.getElementById("particles");
  if (particleHost) {
    var count = window.innerWidth < 640 ? 16 : 32;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.animationDuration = (12 + Math.random() * 14) + "s";
      p.style.animationDelay = (Math.random() * -20) + "s";
      p.style.opacity = String(0.2 + Math.random() * 0.4);
      particleHost.appendChild(p);
    }
  }

  /* ---------- Constellation canvas ---------- */
  var canvas = document.getElementById("constellation");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dots = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initDots() {
      var n = window.innerWidth < 640 ? 30 : 55;
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      dots.forEach(function (d) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > window.innerWidth) d.vx *= -1;
        if (d.y < 0 || d.y > window.innerHeight) d.vy *= -1;
      });
      for (var i = 0; i < dots.length; i++) {
        for (var j = i + 1; j < dots.length; j++) {
          var dx = dots[i].x - dots[j].x;
          var dy = dots[i].y - dots[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = "rgba(232,199,133," + (1 - dist / 140) * 0.25 + ")";
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(232,199,133,0.6)";
        ctx.beginPath();
        ctx.arc(dots[i].x, dots[i].y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    initDots();
    tick();
    window.addEventListener("resize", function () { resize(); initDots(); });
  }
})();
