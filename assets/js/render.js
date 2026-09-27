/*
 * Sahifani window.SITE_CONTENT (assets/js/data.js) asosida to'ldiradi.
 * Bu skript boshqa barcha vendor skriptlardan (AOS, Isotope, Swiper, ...)
 * OLDIN ishga tushishi shart, chunki ular sahifa DOM'ida tayyor
 * elementlarni kutadi. Shu sababli u index.html'da <main> dan keyin,
 * lekin vendor <script>lardan oldin ulangan.
 */
(function () {
  "use strict";

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // Admin panelda tayyorlangan qoralama (agar shu brauzerda saqlangan bo'lsa)
  // asosiy kontent ustidan ustunlik qiladi — shu orqali nashr qilishdan oldin
  // o'zgarishlarni jonli saytda ko'rish mumkin.
  function loadContent() {
    const base = window.SITE_CONTENT || {};
    try {
      const draft = localStorage.getItem("impro_content_draft");
      if (draft) return JSON.parse(draft);
    } catch { /* localStorage yo'q yoki buzuq JSON — asosiy kontentga qaytamiz */ }
    return base;
  }

  const content = loadContent();
  window.__RENDERED_CONTENT__ = content;

  function set(sel, value) {
    const el = document.querySelector(sel);
    if (el) el.textContent = value;
  }

  function html(sel, value) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = value;
  }

  // --- Meta / favicon ---
  document.title = content.site.name + " — Portfolio";
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = content.site.favicon;
  const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (touchIcon) touchIcon.href = content.site.favicon;

  // --- Header ---
  set(".sitename1", content.site.name);
  html("#navmenu ul", content.nav.map((item, i) =>
    `<li><a href="${esc(item.href)}" class="${i === 0 ? "active" : ""}">${esc(item.label)}</a></li>`
  ).join(""));

  // --- Hero ---
  const heroLogo = document.querySelector(".hero-logo-float");
  if (heroLogo) heroLogo.src = content.site.logo;
  set("#hero h2", content.hero.heading);
  const typedEl = document.querySelector("#hero .typed");
  if (typedEl) typedEl.setAttribute("data-typed-items", content.hero.typed.join(","));

  // --- About ---
  const a = content.about;
  const aboutPhoto = document.querySelector(".about-photo");
  if (aboutPhoto) aboutPhoto.src = a.photo;
  html("#about .about-info", `
    <p><strong>Имя: </strong> <span>${esc(a.name)}</span></p>
    <p><strong>Профиль: </strong> <span>${esc(a.profile)}</span></p>
    <p><strong>Email: </strong> <span>${esc(a.email)}</span></p>
    <p><strong>Телефон: </strong> <span>${esc(a.phone)}</span></p>
  `);
  set("#about .skills-content h5", a.skillsTitle);
  html("#about .skills-content", `<h5>${esc(a.skillsTitle)}</h5>` + a.skills.map((sk) => `
    <div class="progress">
      <span class="skill"><span>${esc(sk.name)}</span> <i class="val">${esc(sk.value)}%</i></span>
      <div class="progress-bar-wrap">
        <div class="progress-bar" role="progressbar" aria-valuenow="${esc(sk.value)}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>
  `).join(""));
  set("#about .about-me h4", a.title);
  html("#about .about-me", `<h4>${esc(a.title)}</h4>` + a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join(""));

  // --- Services ---
  const s = content.services;
  set("#services .section-title h2", s.title);
  set("#services .section-title p", s.subtitle);
  html("#services .row.gy-4", s.items.map((it, i) => `
    <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${100 + i * 100}">
      <div class="service-item position-relative">
        <div class="icon"><i class="bi ${esc(it.icon)}" style="font-size: 2rem;"></i></div>
        <a href="#" class="stretched-link"><h3>${esc(it.title)}</h3></a>
        <p>${esc(it.text)}</p>
      </div>
    </div>
  `).join(""));

  // --- Stats ---
  html("#stats .row.gy-4", content.stats.map((st) => `
    <div class="col-lg-3 col-md-6">
      <div class="stats-item text-center w-100 h-100">
        <span data-purecounter-start="0" data-purecounter-end="${esc(st.end)}" data-purecounter-duration="0" class="purecounter">${esc(st.end)}</span>
        <p>${esc(st.label)}</p>
      </div>
    </div>
  `).join(""));

  // --- Portfolio ---
  const p = content.portfolio;
  set("#portfolio .section-title h2", p.title);
  set("#portfolio .section-title p", p.subtitle);
  html("#portfolio .isotope-container", p.items.map((it, i) => `
    <div class="col-lg-4 col-md-6 portfolio-item isotope-item">
      <img src="${esc(it.image)}" class="img-fluid" alt="">
      <div class="portfolio-info">
        <h4>${esc(it.title)}</h4>
        <a href="${esc(it.image)}" title="${esc(it.title)}" data-gallery="portfolio-gallery-${i}" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
        ${it.link ? `<a href="${esc(it.link)}" title="More Details" target="_blank" rel="noopener" class="details-link"><i class="bi bi-link-45deg"></i></a>` : ""}
      </div>
    </div>
  `).join(""));

  // --- Testimonials ---
  html("#testimonials .swiper-wrapper", content.testimonials.map((t) => `
    <div class="swiper-slide">
      <div class="testimonial-item">
        <img src="${esc(t.image)}" class="testimonial-img" alt="">
        <h3>${esc(t.name)}</h3>
        <div class="stars">${'<i class="bi bi-star-fill"></i>'.repeat(t.stars)}</div>
        <p>
          <i class="bi bi-quote quote-icon-left"></i>
          <span>"${esc(t.text)}"</span>
          <i class="bi bi-quote quote-icon-right"></i>
        </p>
      </div>
    </div>
  `).join(""));

  // --- Contact ---
  set("#contact .section-title p", "Контакты для связи с компанией " + content.footer.company);
  const c = content.contact;
  const infoItems = document.querySelectorAll("#contact .info-item p");
  if (infoItems[0]) infoItems[0].textContent = c.address;
  if (infoItems[1]) infoItems[1].textContent = c.phone;
  if (infoItems[2]) infoItems[2].textContent = c.email;

  // --- Footer ---
  html("#footer .copyright", `<p>© <strong class="px-1 sitename">Компания</strong> <span>${esc(content.footer.company)}</span> <span>Все права защищены</span></p>`);
  const socials = content.footer.socials;
  const socialHtml = [
    socials.telegram ? `<a href="${esc(socials.telegram)}" target="_blank" rel="noopener"><i class="bi bi-telegram"></i></a>` : "",
    socials.instagram ? `<a href="${esc(socials.instagram)}" target="_blank" rel="noopener"><i class="bi bi-instagram"></i></a>` : "",
    socials.facebook ? `<a href="${esc(socials.facebook)}" target="_blank" rel="noopener"><i class="bi bi-facebook"></i></a>` : "",
  ].join("");
  html("#footer .social-links", socialHtml);
})();
