(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const STATUS = { new: "Yangi", progress: "Jarayonda", done: "Bajarildi", cancelled: "Bekor qilingan" };
  const POLL_MS = 15000;

  let leads = [], filter = "all", openId = null, knownMax = -1, pollT = 0, sound = false;
  try { sound = localStorage.getItem("era-sound") === "1"; } catch (e) { /* storage blocked */ }

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "class") el.className = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    kids.flat().forEach(c => c != null && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  }
  const svg = id => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); const u = document.createElementNS("http://www.w3.org/2000/svg", "use"); u.setAttribute("href", "#" + id); s.append(u); return s; };

  // LOCAL = no server.js behind this page (file://, Go Live, static hosting): use ERA_STORE
  let LOCAL = false;
  let memAuth = false;
  const setAuth = v => { memAuth = v; try { v ? sessionStorage.setItem("era-admin", "1") : sessionStorage.removeItem("era-admin"); } catch (e) { /* storage blocked */ } };
  const localAuthed = () => { try { return sessionStorage.getItem("era-admin") === "1"; } catch (e) { return memAuth; } };
  function localApi(path, opt) {
    const method = (opt && opt.method) || "GET", body = opt && opt.body ? JSON.parse(opt.body) : {};
    const cfg = ERA_CONFIG.admin;
    if (path === "/login") {
      const ok = String(body.username || "").trim().toLowerCase() === cfg.user.trim().toLowerCase() && String(body.password || "").trim() === cfg.pass.trim();
      if (!ok) throw new Error("Login yoki parol noto'g'ri");
      setAuth(true); return { ok: true };
    }
    if (path === "/logout") { setAuth(false); return { ok: true }; }
    if (!localAuthed()) { showLogin(); throw new Error("auth"); }
    if (path === "/me") return { ok: true };
    if (path === "/leads") {
      const leads = ERA_STORE.read(), counts = { all: leads.length };
      ["new", "progress", "done", "cancelled"].forEach(s => (counts[s] = leads.filter(l => l.status === s).length));
      return { ok: true, leads, counts };
    }
    const m = /^\/leads\/(\d+)$/.exec(path);
    if (m && method === "PATCH") {
      const patch = {};
      if (body.status !== undefined) patch.status = body.status;
      if (body.note !== undefined) patch.note = String(body.note).slice(0, 2000);
      return { ok: true, lead: ERA_STORE.update(+m[1], patch) };
    }
    if (m && method === "DELETE") { ERA_STORE.remove(+m[1]); return { ok: true }; }
    throw new Error("Topilmadi");
  }

  // NETLIFY = static site on Netlify: leads come from Netlify Forms via the Netlify API.
  // Statuses / notes are kept in this browser (Netlify submissions have no such fields).
  let NETLIFY = false, nfMap = {};
  const NF_TOKEN = "era-nf-token", NF_META = "era-nf-meta";
  const nfToken = () => { try { return localStorage.getItem(NF_TOKEN) || ""; } catch (e) { return ""; } };
  const nfSite = () => (ERA_CONFIG.netlify && ERA_CONFIG.netlify.siteId) || location.hostname;
  const nfMeta = () => { try { return JSON.parse(localStorage.getItem(NF_META) || "{}"); } catch (e) { return {}; } };
  async function nf(path, opt) {
    const res = await fetch("https://api.netlify.com/api/v1" + path, Object.assign({}, opt, { headers: { Authorization: "Bearer " + nfToken() } }));
    if (res.status === 401) { try { localStorage.removeItem(NF_TOKEN); } catch (e) { /* ignore */ } throw new Error("Netlify token noto'g'ri yoki muddati o'tgan"); }
    if (res.status === 404) throw new Error("Netlify'da \"" + nfSite() + "\" sayti topilmadi");
    if (!res.ok) throw new Error("Netlify xatosi: " + res.status);
    return res.status === 204 ? {} : res.json();
  }
  const fileUrl = v => !v ? "" : typeof v === "string" ? v : (v.url || "");
  async function netlifyApi(path, opt) {
    const method = (opt && opt.method) || "GET", body = opt && opt.body ? JSON.parse(opt.body) : {};
    if (path === "/login" || path === "/logout" || path === "/me") {
      const out = localApi(path, opt);
      if (path !== "/logout" && !nfToken()) { if (path === "/me") { showLogin(); throw new Error("auth"); } }
      return out;
    }
    if (!localAuthed()) { showLogin(); throw new Error("auth"); }
    if (path === "/leads") {
      const subs = await nf("/sites/" + encodeURIComponent(nfSite()) + "/submissions?per_page=100");
      const meta = nfMeta(); nfMap = {};
      const leads = subs.filter(s => !s.form_name || s.form_name === "zayavka").map(s => {
        const d = s.data || {}, m = meta[s.id] || {};
        nfMap[s.number] = s.id;
        return {
          id: s.number, sid: s.id, createdAt: s.created_at, status: m.status || "new", note: m.note || "",
          name: d.name || s.name || "—", phone: d.phone || "", item: d.item || "Boshqa", brand: d.brand || "",
          services: String(d.services || "").split(",").map(x => x.trim()).filter(Boolean),
          branch: d.branch || "", time: d.time || "", comment: d.comment || "",
          photos: ["photo1", "photo2", "photo3"].map(k => fileUrl(d[k])).filter(Boolean)
        };
      });
      const counts = { all: leads.length };
      ["new", "progress", "done", "cancelled"].forEach(k => (counts[k] = leads.filter(l => l.status === k).length));
      return { ok: true, leads, counts };
    }
    const m = /^\/leads\/(\d+)$/.exec(path), sid = m && nfMap[m[1]];
    if (m && !sid) throw new Error("Topilmadi");
    if (m && method === "PATCH") {
      const meta = nfMeta(); meta[sid] = Object.assign(meta[sid] || {}, body.status !== undefined ? { status: body.status } : {}, body.note !== undefined ? { note: String(body.note).slice(0, 2000) } : {});
      localStorage.setItem(NF_META, JSON.stringify(meta));
      const l = leads.find(x => x.id === +m[1]);
      return { ok: true, lead: Object.assign({}, l, meta[sid]) };
    }
    if (m && method === "DELETE") {
      await nf("/submissions/" + sid, { method: "DELETE" });
      const meta = nfMeta(); delete meta[sid]; localStorage.setItem(NF_META, JSON.stringify(meta));
      return { ok: true };
    }
    throw new Error("Topilmadi");
  }

  async function api(path, opt) {
    if (NETLIFY) return netlifyApi(path, opt);
    if (LOCAL) return localApi(path, opt);
    const res = await fetch("/api/admin" + path, Object.assign({ credentials: "same-origin", headers: { "Content-Type": "application/json" } }, opt));
    if (res.status === 401 && path !== "/login") { showLogin(); throw new Error("auth"); }
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || "Xatolik");
    return out;
  }

  const pad = n => String(n).padStart(2, "0");
  function when(iso) {
    const d = new Date(iso), diff = (Date.now() - d) / 1000;
    const abs = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const rel = diff < 60 ? "hozirgina" : diff < 3600 ? Math.floor(diff / 60) + " daqiqa oldin" : diff < 86400 ? Math.floor(diff / 3600) + " soat oldin" : Math.floor(diff / 86400) + " kun oldin";
    return { abs, rel };
  }
  const shortBranch = b => (b || "").split(" — ")[0];

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("is-on"), 3200);
  }
  function beep() {
    if (!sound) return;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [0, .16].forEach((d, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = i ? 1180 : 880; o.type = "sine";
        g.gain.setValueAtTime(.0001, ac.currentTime + d); g.gain.exponentialRampToValueAtTime(.2, ac.currentTime + d + .02); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d + .25);
        o.connect(g).connect(ac.destination); o.start(ac.currentTime + d); o.stop(ac.currentTime + d + .3);
      });
    } catch (e) { /* audio unavailable */ }
  }

  /* ---------------- auth ---------------- */
  function showLogin() {
    clearTimeout(pollT);
    $("#app").hidden = true; $("#login").hidden = false; closeDrawer();
    setTimeout(() => ($("#user").value ? $("#pw") : $("#user")).focus(), 50);
  }
  function showApp() {
    $("#login").hidden = true; $("#app").hidden = false;
    load(true);
  }
  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("#loginBtn"); btn.disabled = true; $("#loginErr").textContent = "";
    try {
      if (NETLIFY) {
        const tok = $("#nfTok").value.trim();
        if (tok) { try { localStorage.setItem(NF_TOKEN, tok); } catch (e) { /* ignore */ } }
        if (!nfToken()) { $("#tokRow").hidden = false; throw new Error("Netlify token kiriting (bir marta)"); }
      }
      await api("/login", { method: "POST", body: JSON.stringify({ username: $("#user").value, password: $("#pw").value }) });
      if (NETLIFY) await nf("/sites/" + encodeURIComponent(nfSite())); // check token + site once
      $("#pw").value = ""; $("#nfTok").value = ""; $("#tokRow").hidden = true; showApp();
    }
    catch (ex) { if (NETLIFY && !nfToken()) $("#tokRow").hidden = false; $("#loginErr").textContent = /fetch|network|load/i.test(ex.message) ? "Server bilan aloqa yo'q. \"node server.js\" ishga tushirilganini tekshiring." : ex.message; }
    finally { btn.disabled = false; }
  });
  $("#logoutBtn").addEventListener("click", async () => { try { await api("/logout", { method: "POST" }); } catch (e) { /* ignore */ } showLogin(); });

  /* ---------------- data ---------------- */
  async function load(first) {
    clearTimeout(pollT);
    try {
      const out = await api("/leads");
      const max = out.leads.reduce((m, l) => Math.max(m, l.id), 0);
      const fresh = knownMax >= 0 ? out.leads.filter(l => l.id > knownMax).map(l => l.id) : [];
      knownMax = max; leads = out.leads;
      Object.keys(out.counts).forEach(k => { const el = $(`[data-c="${k}"]`); if (el) el.textContent = out.counts[k]; });
      const nNew = out.counts.new || 0;
      document.title = (nNew ? `(${nNew}) ` : "") + "ERA Admin — Zayavkalar";
      render(fresh);
      if (fresh.length && !first) { toast(`🆕 ${fresh.length} ta yangi zayavka`); beep(); }
      if (openId != null) { const l = leads.find(x => x.id === openId); if (l) fillDrawer(l, true); }
      $("#live").classList.remove("off"); $("#liveTxt").textContent = "Jonli";
    } catch (e) {
      if (e.message === "auth") return;
      $("#live").classList.add("off"); $("#liveTxt").textContent = "Aloqa yo'q";
    }
    pollT = setTimeout(load, POLL_MS);
  }

  function visible() {
    const q = $("#q").value.trim().toLowerCase(), br = $("#branchF").value;
    return leads.filter(l =>
      (filter === "all" || l.status === filter) &&
      (!br || shortBranch(l.branch) === br) &&
      (!q || [l.name, l.phone, l.comment, l.note, l.brand, l.item, String(l.id)].join(" ").toLowerCase().includes(q)));
  }

  function render(fresh) {
    const rows = $("#rows"); rows.textContent = "";
    const list = visible();
    $("#empty").hidden = list.length > 0;
    $("#empty b").textContent = leads.length ? "Hech narsa topilmadi" : "Hozircha zayavka yo'q";
    $("#subline").textContent = leads.length ? `${list.length} ta ko'rsatilmoqda · jami ${leads.length}` : "Saytdan kelgan barcha murojaatlar";
    list.forEach(l => {
      const w = when(l.createdAt);
      const tr = h("tr", { class: fresh && fresh.includes(l.id) ? "fresh" : "", onclick: () => openDrawer(l.id) },
        h("td", { class: "num", text: "#" + String(l.id).padStart(4, "0") }),
        h("td", { class: "when" }, h("b", { text: w.rel }), h("span", { text: w.abs })),
        h("td", { class: "who" }, h("b", { text: l.name }), h("a", { href: "tel:" + l.phone, text: l.phone, onclick: e => e.stopPropagation() })),
        h("td", { class: "what" }, h("b", { text: l.item + (l.brand ? " · " + l.brand : "") }), h("span", { text: l.services.join(", ") || "—" })),
        h("td", { class: "br", text: shortBranch(l.branch) }),
        h("td", { class: "phc" }, l.photos.length ? h("span", { class: "ph" }, svg("i-cam"), String(l.photos.length)) : h("span", { class: "ph", text: "—" })),
        h("td", { class: "st" }, h("span", { class: "pill " + l.status, text: STATUS[l.status] }))
      );
      rows.append(tr);
    });
  }

  $$(".kpi").forEach(k => k.addEventListener("click", () => { filter = k.dataset.s; $$(".kpi").forEach(x => x.classList.toggle("is-on", x === k)); render(); }));
  $("#q").addEventListener("input", () => render());
  $("#branchF").addEventListener("change", () => render());
  const sb = $("#soundBtn");
  const syncSound = () => sb.setAttribute("aria-pressed", String(sound));
  sb.addEventListener("click", () => { sound = !sound; try { localStorage.setItem("era-sound", sound ? "1" : "0"); } catch (e) { /* ignore */ } syncSound(); if (sound) beep(); toast(sound ? "Ovozli bildirishnoma yoqildi" : "Ovoz o'chirildi"); });
  syncSound();

  /* ---------------- drawer ---------------- */
  function openDrawer(id) {
    const l = leads.find(x => x.id === id); if (!l) return;
    openId = id; fillDrawer(l);
    $("#scrim").hidden = false; $("#drawer").classList.add("is-open"); $("#drawer").setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    openId = null; $("#scrim").hidden = true; $("#drawer").classList.remove("is-open"); $("#drawer").setAttribute("aria-hidden", "true");
  }
  function fillDrawer(l, keepNote) {
    const w = when(l.createdAt);
    $("#dNum").textContent = `Zayavka #${String(l.id).padStart(4, "0")} · ${w.abs}`;
    $("#dName").textContent = l.name;
    $("#dPhone").textContent = l.phone;
    $("#dCall").href = "tel:" + l.phone;
    $("#dTg").href = "https://t.me/" + l.phone.replace(/[^\d+]/g, "");
    $$("#dStatus button").forEach(b => b.classList.toggle("is-on", b.dataset.s === l.status));
    const facts = $("#dFacts"); facts.textContent = "";
    [["Buyum", l.item], ["Brend / model", l.brand || "—"], ["Xizmatlar", l.services.join(", ") || "—", true], ["Filial", l.branch, true], ["Qulay vaqt", l.time], ["Holat", STATUS[l.status]], ["Mijoz izohi", l.comment || "—", true]]
      .forEach(([k, v, wide]) => facts.append(h("div", { class: wide ? "wide" : "" }, h("dt", { text: k }), h("dd", { text: v }))));
    const ph = $("#dPhotos"); ph.textContent = "";
    $("#dPhotosWrap").hidden = !l.photos.length;
    l.photos.forEach(f => { const src = /^(data:image\/|https?:)/.test(f) ? f : "/api/admin/photo/" + encodeURIComponent(f); ph.append(h("a", { href: src, target: "_blank", rel: "noopener" }, h("img", { src, alt: "Mijoz yuborgan rasm", loading: "lazy" }))); });
    if (!keepNote || document.activeElement !== $("#dNote")) $("#dNote").value = l.note || "";
    $("#dNoteMsg").textContent = "";
  }
  async function patch(data, msg) {
    if (openId == null) return;
    try {
      const out = await api("/leads/" + openId, { method: "PATCH", body: JSON.stringify(data) });
      const i = leads.findIndex(x => x.id === openId); leads[i] = out.lead;
      fillDrawer(out.lead, true); toast(msg); load();
    } catch (e) { if (e.message !== "auth") toast("Xatolik: " + e.message); }
  }
  $$("#dStatus button").forEach(b => b.addEventListener("click", () => patch({ status: b.dataset.s }, "Holat: " + STATUS[b.dataset.s])));
  $("#dNoteSave").addEventListener("click", () => patch({ note: $("#dNote").value }, "Izoh saqlandi"));
  $("#dDelete").addEventListener("click", async () => {
    if (openId == null || !confirm("Zayavkani butunlay o'chirasizmi? Bu amalni qaytarib bo'lmaydi.")) return;
    try { await api("/leads/" + openId, { method: "DELETE" }); closeDrawer(); toast("Zayavka o'chirildi"); load(); }
    catch (e) { if (e.message !== "auth") toast("Xatolik: " + e.message); }
  });
  $("#dClose").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("#app").hidden) load(); });

  /* ---------------- boot ---------------- */
  // CSV in browser mode is built here instead of by the server
  function csvLocal() {
    const cols = [["id", "№"], ["createdAt", "Sana"], ["status", "Holat"], ["name", "Ism"], ["phone", "Telefon"], ["item", "Buyum"], ["brand", "Brend"], ["services", "Xizmatlar"], ["branch", "Filial"], ["time", "Qulay vaqt"], ["comment", "Izoh"], ["note", "Admin izohi"]];
    const cell = v => { let s = Array.isArray(v) ? v.join(", ") : String(v == null ? "" : v); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    const csv = "\ufeff" + [cols.map(c => cell(c[1])).join(",")].concat(leads.map(l => cols.map(c => cell(c[0] === "status" ? STATUS[l.status] : l[c[0]])).join(","))).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "era-zayavkalar-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.append(a); a.click(); a.remove();
  }
  $("#csvBtn").addEventListener("click", e => { if (LOCAL || NETLIFY) { e.preventDefault(); csvLocal(); } });
  addEventListener("storage", e => { if (LOCAL && e.key === "era-leads" && !$("#app").hidden) load(); });

  async function detect() {
    if (location.protocol === "file:") return "local";
    try { const r = await fetch("/api/admin/me", { credentials: "same-origin" }); await r.json(); return "server"; }
    catch (e) { /* no JSON API here: static page */ }
    return /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) ? "local" : "netlify";
  }
  detect().then(mode => {
    LOCAL = mode === "local"; NETLIFY = mode === "netlify";
    const txt = LOCAL ? "Brauzer rejimi: server ishlamayapti, zayavkalar shu brauzerda saqlanadi."
      : NETLIFY ? "Netlify rejimi: zayavkalar Netlify Forms'dan olinadi." : "";
    if (txt) $(".head > div").append(h("p", { class: "mode-note", text: txt }));
    if (NETLIFY && !nfToken()) $("#tokRow").hidden = false;
    return api("/me").then(showApp, showLogin);
  });
})();
