(function () {
  "use strict";

  const PASS_KEY = "impro_admin_password";
  const DRAFT_KEY = "impro_content_draft";
  const SESSION_KEY = "impro_admin_logged_in";
  const DEFAULT_PASSWORD = "impro2024";

  let content = null;
  let activeTab = "publish";

  const TABS = [
    { key: "publish", label: "Nashr qilish" },
    { key: "site", label: "Sayt" },
    { key: "hero", label: "Hero" },
    { key: "about", label: "Men haqimda" },
    { key: "services", label: "Xizmatlar" },
    { key: "stats", label: "Statistika" },
    { key: "portfolio", label: "Portfolio" },
    { key: "testimonials", label: "Sharhlar" },
    { key: "contact", label: "Aloqa" },
    { key: "footer", label: "Footer" },
    { key: "security", label: "Parol" },
  ];

  const loginScreen = document.getElementById("loginScreen");
  const dashboard = document.getElementById("dashboard");
  const panelRoot = document.getElementById("panelRoot");
  const tabNav = document.getElementById("tabNav");

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  function setByPath(obj, path, value) {
    const keys = path.split(".");
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
  }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function showToast(msg, isError) {
    const t = document.createElement("div");
    t.className = "toast";
    if (isError) t.style.borderColor = "#ff5c5c";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  function loadContent() {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) return JSON.parse(draft);
    } catch { /* ignore corrupt draft */ }
    return JSON.parse(JSON.stringify(window.SITE_CONTENT));
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
  }

  function getStoredPassword() {
    return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;
  }

  // admin/index.html sayt ildizidan bir daraja pastda joylashgan, shu sababli
  // data.js'dagi "assets/..." kabi ildizga nisbiy yo'llarni ko'rsatish uchun
  // "../" qo'shamiz. Yangi yuklangan rasmlar data: URI bo'lgani uchun o'zgarmaydi.
  function previewSrc(path) {
    if (!path || path.startsWith("data:") || path.startsWith("http")) return path;
    return "../" + path;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function boot() {
    content = loadContent();
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      showDashboard();
    } else {
      loginScreen.classList.remove("hidden");
    }
  }

  function showDashboard() {
    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    buildTabs();
    renderTab();
  }

  function buildTabs() {
    tabNav.innerHTML = TABS.map((t) =>
      `<button class="tab-btn${t.key === activeTab ? " active" : ""}" data-tab="${t.key}">${t.label}</button>`
    ).join("");
  }

  tabNav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    activeTab = btn.dataset.tab;
    buildTabs();
    renderTab();
  });

  function renderTab() {
    const renderers = {
      publish: renderPublish, site: renderSite, hero: renderHero, about: renderAbout,
      services: renderServices, stats: renderStats, portfolio: renderPortfolio,
      testimonials: renderTestimonials, contact: renderContact, footer: renderFooter,
      security: renderSecurity,
    };
    panelRoot.innerHTML = renderers[activeTab]();
    panelRoot.querySelectorAll("[data-upload-path]").forEach((input) => {
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const dataUrl = await fileToDataUrl(file);
          setByPath(content, input.dataset.uploadPath, dataUrl);
          saveDraft();
          renderTab();
          showToast("Rasm qo'shildi (qoralamaga saqlandi)");
        } catch {
          showToast("Rasmni o'qib bo'lmadi", true);
        }
      });
    });
  }

  panelRoot.addEventListener("input", (e) => {
    const path = e.target.dataset.path;
    if (!path) return;
    setByPath(content, path, e.target.value);
  });

  panelRoot.addEventListener("change", (e) => {
    const path = e.target.dataset.path;
    if (path) { saveDraft(); return; }
    if (e.target.id === "typedWords") {
      content.hero.typed = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
      saveDraft();
    }
  });

  panelRoot.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("[data-save]");
    if (saveBtn) { saveDraft(); showToast("Qoralama saqlandi ✓"); return; }

    const addBtn = e.target.closest("[data-add]");
    if (addBtn) { handleAdd(addBtn.dataset.add); saveDraft(); renderTab(); return; }

    const delBtn = e.target.closest("[data-remove]");
    if (delBtn) {
      const [arrPath, idx] = delBtn.dataset.remove.split("|");
      getByPath(content, arrPath).splice(Number(idx), 1);
      saveDraft();
      renderTab();
      return;
    }

    if (e.target.closest("#exportBtn")) { exportDataJs(); return; }
    if (e.target.closest("#discardBtn")) { discardDraft(); return; }
  });

  function handleAdd(key) {
    const blanks = {
      skill: () => content.about.skills.push({ name: "Yangi ko'nikma", value: 50 }),
      paragraph: () => content.about.paragraphs.push("Yangi paragraf..."),
      service: () => content.services.items.push({ icon: "bi-stars", title: "Yangi xizmat", text: "" }),
      stat: () => content.stats.push({ end: "0", label: "Yangi ko'rsatkich" }),
      portfolio: () => content.portfolio.items.push({ image: "assets/img/logo.png", title: "Yangi loyiha", link: "" }),
      testimonial: () => content.testimonials.push({ name: "Mijoz", image: "assets/img/logo1.jpg", stars: 5, text: "" }),
    };
    if (blanks[key]) blanks[key]();
  }

  function exportDataJs() {
    const body = `window.SITE_CONTENT = ${JSON.stringify(content, null, 2)};\n`;
    const blob = new Blob([body], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("data.js yuklab olindi — assets/js/data.js ni shu fayl bilan almashtiring");
  }

  function discardDraft() {
    if (!confirm("Barcha saqlanmagan o'zgarishlar bekor qilinsinmi? Sayt asl (data.js) holatiga qaytadi.")) return;
    localStorage.removeItem(DRAFT_KEY);
    content = loadContent();
    renderTab();
    showToast("Qoralama tozalandi");
  }

  const saveRow = `<div class="actions-row"><button class="btn-primary" style="width:auto" data-save>Saqlash (qoralama)</button></div>`;

  function renderPublish() {
    return `
      <h2>Nashr qilish</h2>
      <div class="publish-bar">
        <p>
          Sayt to'liq statik (server yo'q), shuning uchun bu paneldagi o'zgarishlar
          avval faqat <strong>shu brauzerda qoralama</strong> sifatida saqlanadi.
          Hamma tashrif buyuruvchilar uchun o'zgarishlarni chiqarish uchun:
          1) "data.js yuklab olish" tugmasini bosing, 2) yuklangan faylni
          <code>assets/js/data.js</code> o'rniga qo'ying, 3) saytni qayta yuklang
          (deploy qiling).
        </p>
        <div class="row-buttons">
          <button class="btn-primary" style="width:auto" id="exportBtn">data.js yuklab olish</button>
          <a class="btn-sm" href="../index.html" target="_blank" style="text-decoration:none; display:inline-flex; align-items:center;">Saytni ko'rish (qoralama bilan)</a>
          <button class="btn-sm danger" id="discardBtn">Qoralamani bekor qilish</button>
        </div>
      </div>
      <p class="note">Qoralama shu brauzer xotirasida (localStorage) saqlanadi — boshqa qurilma yoki
        brauzerda ko'rinmaydi, faqat "data.js yuklab olish" orqali chiqargan o'zgarishlar hammaga ko'rinadi.</p>
    `;
  }

  function renderSite() {
    const s = content.site;
    return `
      <h2>Sayt sozlamalari</h2>
      <label>Sayt nomi</label>
      <input type="text" data-path="site.name" value="${esc(s.name)}">
      <label>Logo</label>
      <img class="img-preview" src="${esc(previewSrc(s.logo))}">
      <input type="file" accept="image/*" data-upload-path="site.logo">
      <label>Favicon</label>
      <img class="img-preview" src="${esc(previewSrc(s.favicon))}">
      <input type="file" accept="image/*" data-upload-path="site.favicon">
      ${saveRow}
    `;
  }

  function renderHero() {
    const h = content.hero;
    return `
      <h2>Hero bo'limi</h2>
      <label>Sarlavha</label>
      <textarea data-path="hero.heading">${esc(h.heading)}</textarea>
      <label>Aylanuvchi so'zlar (vergul bilan)</label>
      <input type="text" id="typedWords" value="${esc(h.typed.join(", "))}">
      ${saveRow}
    `;
  }

  function renderAbout() {
    const a = content.about;
    const skills = a.skills.map((sk, i) => `
      <div class="card-item">
        <div class="row-head">
          <strong>Ko'nikma #${i + 1}</strong>
          <button class="btn-sm danger" data-remove="about.skills|${i}">O'chirish</button>
        </div>
        <div class="grid-2">
          <div><label>Nomi</label><input type="text" data-path="about.skills.${i}.name" value="${esc(sk.name)}"></div>
          <div><label>Foiz (0-100)</label><input type="number" min="0" max="100" data-path="about.skills.${i}.value" value="${esc(sk.value)}"></div>
        </div>
      </div>
    `).join("");

    const paragraphs = a.paragraphs.map((p, i) => `
      <div class="card-item">
        <div class="row-head">
          <strong>Paragraf #${i + 1}</strong>
          <button class="btn-sm danger" data-remove="about.paragraphs|${i}">O'chirish</button>
        </div>
        <textarea data-path="about.paragraphs.${i}">${esc(p)}</textarea>
      </div>
    `).join("");

    return `
      <h2>Men haqimda</h2>
      <label>Rasm</label>
      <img class="img-preview" src="${esc(previewSrc(a.photo))}">
      <input type="file" accept="image/*" data-upload-path="about.photo">
      <div class="grid-2">
        <div><label>Ism</label><input type="text" data-path="about.name" value="${esc(a.name)}"></div>
        <div><label>Profil / kasb</label><input type="text" data-path="about.profile" value="${esc(a.profile)}"></div>
        <div><label>Email</label><input type="text" data-path="about.email" value="${esc(a.email)}"></div>
        <div><label>Telefon</label><input type="text" data-path="about.phone" value="${esc(a.phone)}"></div>
      </div>

      <h3 style="margin-top:26px;">Ko'nikmalar</h3>
      ${skills}
      <button class="add-btn" data-add="skill">+ Ko'nikma qo'shish</button>

      <h3 style="margin-top:26px;">"Men haqimda" matni</h3>
      <label>Bo'lim sarlavhasi</label>
      <input type="text" data-path="about.title" value="${esc(a.title)}">
      ${paragraphs}
      <button class="add-btn" data-add="paragraph">+ Paragraf qo'shish</button>
      ${saveRow}
    `;
  }

  function renderServices() {
    const s = content.services;
    const items = s.items.map((it, i) => `
      <div class="card-item">
        <div class="row-head">
          <strong>Xizmat #${i + 1}</strong>
          <button class="btn-sm danger" data-remove="services.items|${i}">O'chirish</button>
        </div>
        <div class="grid-2">
          <div><label>Ikonka (bootstrap-icons class, masalan bi-stars)</label><input type="text" data-path="services.items.${i}.icon" value="${esc(it.icon)}"></div>
          <div><label>Sarlavha</label><input type="text" data-path="services.items.${i}.title" value="${esc(it.title)}"></div>
        </div>
        <label>Matn</label>
        <textarea data-path="services.items.${i}.text">${esc(it.text)}</textarea>
      </div>
    `).join("");

    return `
      <h2>Xizmatlar</h2>
      <div class="grid-2">
        <div><label>Bo'lim sarlavhasi</label><input type="text" data-path="services.title" value="${esc(s.title)}"></div>
        <div><label>Bo'lim tavsifi</label><input type="text" data-path="services.subtitle" value="${esc(s.subtitle)}"></div>
      </div>
      ${items}
      <button class="add-btn" data-add="service">+ Xizmat qo'shish</button>
      ${saveRow}
    `;
  }

  function renderStats() {
    const items = content.stats.map((st, i) => `
      <div class="card-item">
        <div class="row-head">
          <strong>Ko'rsatkich #${i + 1}</strong>
          <button class="btn-sm danger" data-remove="stats|${i}">O'chirish</button>
        </div>
        <div class="grid-2">
          <div><label>Qiymat (masalan 20+ yoki 30)</label><input type="text" data-path="stats.${i}.end" value="${esc(st.end)}"></div>
          <div><label>Nomi</label><input type="text" data-path="stats.${i}.label" value="${esc(st.label)}"></div>
        </div>
      </div>
    `).join("");
    return `<h2>Statistika</h2>${items}<button class="add-btn" data-add="stat">+ Ko'rsatkich qo'shish</button>${saveRow}`;
  }

  function renderPortfolio() {
    const p = content.portfolio;
    const items = p.items.map((it, i) => `
      <div class="card-item">
        <div class="row-head">
          <strong>Loyiha #${i + 1}</strong>
          <button class="btn-sm danger" data-remove="portfolio.items|${i}">O'chirish</button>
        </div>
        <img class="img-preview" src="${esc(previewSrc(it.image))}">
        <input type="file" accept="image/*" data-upload-path="portfolio.items.${i}.image">
        <div class="grid-2">
          <div><label>Nomi</label><input type="text" data-path="portfolio.items.${i}.title" value="${esc(it.title)}"></div>
          <div><label>Havola (URL)</label><input type="url" data-path="portfolio.items.${i}.link" value="${esc(it.link)}"></div>
        </div>
      </div>
    `).join("");

    return `
      <h2>Portfolio</h2>
      <div class="grid-2">
        <div><label>Bo'lim sarlavhasi</label><input type="text" data-path="portfolio.title" value="${esc(p.title)}"></div>
        <div><label>Bo'lim tavsifi</label><input type="text" data-path="portfolio.subtitle" value="${esc(p.subtitle)}"></div>
      </div>
      ${items}
      <button class="add-btn" data-add="portfolio">+ Loyiha qo'shish</button>
      ${saveRow}
    `;
  }

  function renderTestimonials() {
    const items = content.testimonials.map((t, i) => `
      <div class="card-item">
        <div class="row-head">
          <strong>Sharh #${i + 1}</strong>
          <button class="btn-sm danger" data-remove="testimonials|${i}">O'chirish</button>
        </div>
        <img class="img-preview" src="${esc(previewSrc(t.image))}">
        <input type="file" accept="image/*" data-upload-path="testimonials.${i}.image">
        <div class="grid-2">
          <div><label>Ism</label><input type="text" data-path="testimonials.${i}.name" value="${esc(t.name)}"></div>
          <div><label>Yulduzlar (1-5)</label><input type="number" min="1" max="5" data-path="testimonials.${i}.stars" value="${esc(t.stars)}"></div>
        </div>
        <label>Sharh matni</label>
        <textarea data-path="testimonials.${i}.text">${esc(t.text)}</textarea>
      </div>
    `).join("");
    return `<h2>Mijozlar sharhi</h2>${items}<button class="add-btn" data-add="testimonial">+ Sharh qo'shish</button>${saveRow}`;
  }

  function renderContact() {
    const c = content.contact;
    return `
      <h2>Aloqa ma'lumotlari</h2>
      <label>Manzil</label>
      <input type="text" data-path="contact.address" value="${esc(c.address)}">
      <div class="grid-2">
        <div><label>Telefon</label><input type="text" data-path="contact.phone" value="${esc(c.phone)}"></div>
        <div><label>Email</label><input type="text" data-path="contact.email" value="${esc(c.email)}"></div>
      </div>
      ${saveRow}
    `;
  }

  function renderFooter() {
    const f = content.footer;
    return `
      <h2>Footer va ijtimoiy tarmoqlar</h2>
      <label>Kompaniya nomi</label>
      <input type="text" data-path="footer.company" value="${esc(f.company)}">
      <div class="grid-2">
        <div><label>Telegram</label><input type="text" data-path="footer.socials.telegram" value="${esc(f.socials.telegram)}"></div>
        <div><label>Instagram</label><input type="text" data-path="footer.socials.instagram" value="${esc(f.socials.instagram)}"></div>
        <div><label>Facebook</label><input type="text" data-path="footer.socials.facebook" value="${esc(f.socials.facebook)}"></div>
      </div>
      ${saveRow}
    `;
  }

  function renderSecurity() {
    return `
      <h2>Parolni almashtirish</h2>
      <form id="pwForm">
        <label>Joriy parol</label>
        <input type="password" id="curPw" required>
        <label>Yangi parol (kamida 6 belgi)</label>
        <input type="password" id="newPw" minlength="6" required>
        <button type="submit" class="btn-primary" style="width:auto;">Parolni yangilash</button>
      </form>
      <p class="note">Bu parol faqat shu brauzerda saqlanadi (localStorage). Boshqa
        brauzer yoki qurilmadan kirsangiz, standart yoki avval o'sha yerda o'rnatilgan parol ishlatiladi.</p>
    `;
  }

  panelRoot.addEventListener("submit", (e) => {
    if (e.target.id !== "pwForm") return;
    e.preventDefault();
    const curPw = document.getElementById("curPw").value;
    const newPw = document.getElementById("newPw").value;
    if (curPw !== getStoredPassword()) {
      showToast("Joriy parol noto'g'ri", true);
      return;
    }
    localStorage.setItem(PASS_KEY, newPw);
    showToast("Parol yangilandi ✓");
    e.target.reset();
  });

  // Login
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const errBox = document.getElementById("loginError");
    errBox.classList.add("hidden");
    if (password === getStoredPassword()) {
      sessionStorage.setItem(SESSION_KEY, "1");
      showDashboard();
    } else {
      errBox.textContent = "Parol noto'g'ri";
      errBox.classList.remove("hidden");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    dashboard.classList.add("hidden");
    loginScreen.classList.remove("hidden");
  });

  boot();
})();
