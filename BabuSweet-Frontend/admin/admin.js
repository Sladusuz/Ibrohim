/* BabuSweet admin — serverless. Login (hashed), draft in the browser, publish via GitHub or file. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const norm = window.BS_normalize, slugify = window.BS_slugify, uid = window.BS_uid;
  const I18N = window.BS_I18N || { uz: {}, ru: {}, en: {} };
  const LANGS = ['uz', 'ru', 'en'];
  const app = $('#app');
  const K = { draft: 'bs_draft', auth: 'bs_auth', fail: 'bs_fail', pw: 'bs_pw', gh: 'bs_gh' };
  const IDLE_MS = 30 * 60 * 1000, MAX_FAIL = 5, LOCK_MS = 5 * 60 * 1000;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    sget: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    sdel: k => { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const tri = (a = '', b = '', c = '') => ({ uz: a, ru: b, en: c });
  const ST = { active: 'Faol', soon: 'Tez orada', hidden: 'Yashirin' };

  /* ======================================================== toasts / dialogs / errors */
  function toast(msg, type) {
    const box = $('#toasts'), t = document.createElement('div'); t.className = 'toast' + (type ? ' ' + type : ''); t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.remove(), type === 'bad' ? 6500 : 3400);
  }
  function openDialog(html, opt = {}) {
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<div class="dlg ${opt.size || ''}" role="dialog" aria-modal="true">${html}</div>`;
    const prevFocus = document.activeElement;
    const api = { el: o, box: o.firstChild, close() { o.remove(); document.removeEventListener('keydown', onKey, true); if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) { /* ignore */ } }, tryClose() { if (opt.guard && !opt.guard()) return; api.close(); } };
    function onKey(e) { if (e.key === 'Escape' && document.body.lastElementChild === o) { e.stopPropagation(); api.tryClose(); } }
    document.addEventListener('keydown', onKey, true);
    o.addEventListener('mousedown', e => { if (e.target === o) api.tryClose(); });
    document.body.appendChild(o);
    const f = $('input:not([type=hidden]),textarea,select,button', api.box); if (f && !opt.noFocus) setTimeout(() => f.focus(), 30);
    return api;
  }
  function confirmBox({ title, text, ok = 'Ha', danger = false }) {
    return new Promise(res => {
      const d = openDialog(`<h3>${esc(title)}</h3><p style="color:var(--mute);margin-bottom:6px">${esc(text || '')}</p><div class="actions" style="position:static;background:none"><button class="btn" data-n>Bekor qilish</button><button class="btn ${danger ? 'danger' : 'pri'}" data-y>${esc(ok)}</button></div>`, { size: 'sm', noFocus: true, guard: () => { res(false); return true; } });
      $('[data-n]', d.el).onclick = () => { d.close(); res(false); };
      $('[data-y]', d.el).onclick = () => { d.close(); res(true); };
      $('[data-n]', d.el).focus();
    });
  }
  window.addEventListener('error', e => { console.error(e.error || e.message); toast('Kutilmagan xato: ' + (e.message || 'noma’lum') + ' — sahifani yangilang.', 'bad'); });
  window.addEventListener('unhandledrejection', e => { console.error(e.reason); toast('Xato: ' + ((e.reason && e.reason.message) || 'noma’lum'), 'bad'); });
  const guarded = fn => async (...a) => { try { return await fn(...a); } catch (e) { console.error(e); toast(e.message || 'Xato yuz berdi', 'bad'); } };

  /* ======================================================== crypto: PBKDF2-SHA256 (WebCrypto, with pure-JS fallback) */
  const hex2u8 = h => Uint8Array.from((h.match(/../g) || []).map(x => parseInt(x, 16)));
  const u82hex = u => [...u].map(b => b.toString(16).padStart(2, '0')).join('');
  const K256 = [], H256 = [];
  (function () { let n = 2, c = 0; while (c < 64) { let p = true; for (let i = 2; i * i <= n; i++) if (n % i === 0) { p = false; break; } if (p) { K256[c] = Math.floor((Math.cbrt(n) % 1) * 4294967296) >>> 0; if (c < 8) H256[c] = Math.floor((Math.sqrt(n) % 1) * 4294967296) >>> 0; c++; } n++; } })();
  function sha256(msg) {
    const l = msg.length, nb = ((l + 9 + 63) >> 6), buf = new Uint8Array(nb * 64); buf.set(msg); buf[l] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(buf.length - 4, (l * 8) >>> 0); dv.setUint32(buf.length - 8, Math.floor(l * 8 / 4294967296));
    const h = H256.slice(), w = new Uint32Array(64);
    for (let o = 0; o < buf.length; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) { const a = w[i - 15], b = w[i - 2]; w[i] = (w[i - 16] + (((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3)) + w[i - 7] + (((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10))) >>> 0; }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K256[i] + w[i]) >>> 0;
        const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0; h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
    }
    const out = new Uint8Array(32), ov = new DataView(out.buffer); h.forEach((v, i) => ov.setUint32(i * 4, v)); return out;
  }
  function hmac(key, msg) {
    if (key.length > 64) key = sha256(key);
    const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(96);
    for (let i = 0; i < 64; i++) { const k = key[i] || 0; ip[i] = k ^ 0x36; op[i] = k ^ 0x5c; }
    ip.set(msg, 64); op.set(sha256(ip), 64); return sha256(op);
  }
  function pbkdf2Fallback(pw, salt, iter) {
    const s1 = new Uint8Array(salt.length + 4); s1.set(salt); s1[salt.length + 3] = 1;
    let u = hmac(pw, s1); const t = u.slice();
    for (let i = 1; i < iter; i++) { u = hmac(pw, u); for (let j = 0; j < 32; j++) t[j] ^= u[j]; }
    return t;
  }
  async function pbkdf2hex(secret, saltHex, iter) {
    const enc = new TextEncoder().encode(secret), salt = hex2u8(saltHex);
    if (window.crypto && crypto.subtle) {
      try { const key = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']); return u82hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256))); } catch (e) { /* fallback */ }
    }
    await new Promise(r => setTimeout(r, 20));
    return u82hex(pbkdf2Fallback(enc, salt, iter));
  }
  async function sha256hex(str) { return u82hex(sha256(new TextEncoder().encode(str))); }
  window.__bsAdminTest = { pbkdf2Fallback: (s, saltHex, it) => u82hex(pbkdf2Fallback(new TextEncoder().encode(s), hex2u8(saltHex), it)), sha256hex };
  const safeEq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

  /* ======================================================== auth */
  const cred = () => { try { const o = JSON.parse(store.get(K.pw) || 'null'); if (o && o.hash && o.salt && o.login) return o; } catch (e) { /* ignore */ } return window.BS_ADMIN; };
  const isAuthed = () => { try { const a = JSON.parse(store.sget(K.auth) || 'null'); return !!(a && a.t && Date.now() - a.t < IDLE_MS); } catch (e) { return false; } };
  const touch = () => { if (isAuthed()) store.sset(K.auth, JSON.stringify({ t: Date.now(), k: uid() })); };
  function lockInfo() { try { const f = JSON.parse(store.get(K.fail) || '{}'); if (f.until && f.until > Date.now()) return Math.ceil((f.until - Date.now()) / 60000); } catch (e) { /* ignore */ } return 0; }
  function loginScreen(msg) {
    app.innerHTML = `<div class="login-wrap"><form class="login" id="lf" novalidate autocomplete="on">
      <div class="brand"><svg viewBox="0 0 64 64"><use href="#mark"/></svg>BabuSweet</div>
      <div><h1>Admin panelga kirish</h1><p class="sub">Davom etish uchun login va parolni kiriting.</p></div>
      <label class="f"><span>Login</span><input type="text" name="login" autocomplete="username" autocapitalize="none" spellcheck="false" required autofocus></label>
      <label class="f"><span>Parol</span><div class="pw"><input type="password" name="pw" autocomplete="current-password" required><button type="button" id="tg" aria-label="Parolni ko‘rsatish">Ko‘rsat</button></div></label>
      <div class="err" id="le" role="alert">${esc(msg || '')}</div>
      <button class="btn pri" type="submit" id="lb">Kirish</button></form></div>`;
    $('#tg').onclick = () => { const i = $('input[name=pw]'), s = i.type === 'password'; i.type = s ? 'text' : 'password'; $('#tg').textContent = s ? 'Yashir' : 'Ko‘rsat'; };
    const lk = lockInfo(); if (lk) $('#le').textContent = `Ko‘p marta xato kiritildi. ${lk} daqiqadan so‘ng qayta urinib ko‘ring.`;
    $('#lf').addEventListener('submit', guarded(async e => {
      e.preventDefault(); const f = e.target, err = $('#le'), btn = $('#lb');
      const lk2 = lockInfo(); if (lk2) { err.textContent = `Qulflangan. ${lk2} daqiqadan so‘ng urinib ko‘ring.`; return; }
      const user = f.login.value.trim().toLowerCase(), pw = f.pw.value;
      if (!user || !pw) { err.textContent = 'Login va parolni kiriting'; return; }
      btn.disabled = true; btn.textContent = 'Tekshirilmoqda…';
      const c = cred(); let ok = false;
      try { const h = await pbkdf2hex(user + ':' + pw, c.salt, c.iter); ok = user === String(c.login).toLowerCase() && safeEq(h, c.hash); } catch (x) { err.textContent = 'Tekshirishda xato'; btn.disabled = false; btn.textContent = 'Kirish'; return; }
      if (ok) { store.del(K.fail); store.sset(K.auth, JSON.stringify({ t: Date.now(), k: uid() })); start(); return; }
      let fl = {}; try { fl = JSON.parse(store.get(K.fail) || '{}'); } catch (x) { /* ignore */ }
      fl.n = (fl.n || 0) + 1; if (fl.n >= MAX_FAIL) { fl.until = Date.now() + LOCK_MS; fl.n = 0; } store.set(K.fail, JSON.stringify(fl));
      err.textContent = fl.until ? `Ko‘p marta xato kiritildi. 5 daqiqaga qulflandi.` : `Login yoki parol noto‘g‘ri (${MAX_FAIL - fl.n} urinish qoldi).`;
      f.pw.value = ''; f.pw.focus(); btn.disabled = false; btn.textContent = 'Kirish';
    }));
  }
  function logout(msg) { store.sdel(K.auth); loginScreen(msg); }
  ['click', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { if (isAuthed()) touch(); }, { passive: true }));
  setInterval(() => { if (!$('.shell')) return; if (!isAuthed()) logout('Xavfsizlik uchun 30 daqiqa harakatsizlikdan so‘ng chiqarildingiz.'); }, 20000);

  /* ======================================================== data / draft */
  const PUBLISHED = norm(window.BS_DATA || {});
  let D = null;
  function loadDraft() {
    try { const raw = store.get(K.draft); if (raw) { const x = norm(JSON.parse(raw)); if (x._v && x._v === PUBLISHED._v) { store.del(K.draft); return null; } return x; } } catch (e) { console.warn('draft broken', e); }
    return null;
  }
  let saveFailed = false;
  function persist() {
    try { localStorage.setItem(K.draft, JSON.stringify(D)); saveFailed = false; } catch (e) { saveFailed = true; toast('Brauzer xotirasi to‘ldi! Kichikroq rasm yuklang yoki avval "Nashr qilish" qiling. Hozirgi o‘zgarish saqlanmadi.', 'bad'); }
    refreshStatus();
  }
  const sigOf = o => { const c = clone(norm(o)); c._v = 0; return JSON.stringify(c); };
  const isDirty = () => sigOf(D) !== sigOf(PUBLISHED);
  function refreshStatus() {
    const s = $('#status'); if (!s) return;
    const d = isDirty(); s.classList.toggle('dirty', d); $('span', s).textContent = d ? 'Nashr qilinmagan o‘zgarishlar bor' : 'Hammasi nashr qilingan';
    const b = $('#pubBadge'); if (b) b.hidden = !d;
  }
  const draftBytes = () => (store.get(K.draft) || '').length * 2;

  /* ======================================================== images */
  function loadImage(file) {
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => { URL.revokeObjectURL(u); res(im); };
      im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Rasm ochilmadi. HEIC bo‘lsa, uni PNG yoki JPG ga aylantiring.')); };
      im.src = u;
    });
  }
  async function processImage(file, { maxMain = 1100, maxThumb = 560 } = {}) {
    if (!file) throw new Error('Fayl tanlanmadi');
    if (!/^image\/(png|jpe?g|webp|avif|gif)$/i.test(file.type)) throw new Error('Faqat PNG, JPG yoki WebP rasm yuklang');
    if (file.size > 15e6) throw new Error('Rasm hajmi 15 MB dan oshmasin');
    const im = await loadImage(file); if (!im.width || !im.height) throw new Error('Rasm o‘lchami noto‘g‘ri');
    const draw = max => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k)); c.getContext('2d', { willReadFrequently: true }).drawImage(im, 0, 0, c.width, c.height); return c; };
    const big = draw(maxMain); const ctx = big.getContext('2d', { willReadFrequently: true });
    let opaque = true;
    try { const w = big.width - 1, h = big.height - 1; opaque = [[0, 0], [w, 0], [0, h], [w, h], [w >> 1, 0], [w >> 1, h], [0, h >> 1], [w, h >> 1]].every(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] > 250); } catch (e) { /* ignore */ }
    const enc = (c, q) => { let d = c.toDataURL('image/webp', q); if (!d.startsWith('data:image/webp')) d = opaque ? c.toDataURL('image/jpeg', q) : c.toDataURL('image/png'); return d; };
    let main = enc(big, .86); if (main.length > 900e3) main = enc(big, .72); if (main.length > 1.3e6) main = enc(draw(800), .7);
    return { main, thumb: enc(draw(maxThumb), .84), opaque };
  }

  /* ======================================================== form helpers */
  const fld = (label, inner, name, hint) => `<label class="f"><span>${label}</span>${inner}${hint ? `<span class="hint">${hint}</span>` : ''}<span class="fe" data-err="${name || ''}"></span></label>`;
  function triField(name, label, val = {}, area = false, rows = 3) {
    return `<div class="fieldset" data-tri="${name}"><legend>${label}</legend>
      <div class="tabs">${LANGS.map((l, i) => `<button type="button" data-l="${l}" class="${i ? '' : 'on'}${(val[l] || '').trim() ? ' filled' : ''}">${l.toUpperCase()}</button>`).join('')}</div>
      ${LANGS.map((l, i) => area ? `<textarea data-l="${l}" rows="${rows}" ${i ? 'hidden' : ''}>${esc(val[l] || '')}</textarea>` : `<input type="text" data-l="${l}" value="${esc(val[l] || '')}" ${i ? 'hidden' : ''}>`).join('')}</div>`;
  }
  function wireTri(root) {
    $$('[data-tri]', root).forEach(fs => {
      $$('.tabs button', fs).forEach(b => b.onclick = () => { $$('.tabs button', fs).forEach(x => x.classList.toggle('on', x === b)); $$('[data-l]:not(button)', fs).forEach(i => { i.hidden = i.dataset.l !== b.dataset.l; }); const v = $(`[data-l="${b.dataset.l}"]:not(button)`, fs); if (v) v.focus(); });
      $$('[data-l]:not(button)', fs).forEach(i => i.addEventListener('input', () => { const b = $(`.tabs [data-l="${i.dataset.l}"]`, fs); b.classList.toggle('filled', !!i.value.trim()); }));
    });
  }
  const readTri = (root, name) => Object.fromEntries(LANGS.map(l => [l, $(`[data-tri="${name}"] [data-l="${l}"]:not(button)`, root).value.trim()]));
  function setErr(root, name, msg) { const e = $(`[data-err="${name}"]`, root), i = $(`[name="${name}"]`, root); if (e) e.textContent = msg || ''; if (i) i.classList.toggle('bad', !!msg); return !msg; }
  function clearErrs(root) { $$('[data-err]', root).forEach(e => { e.textContent = ''; }); $$('.bad', root).forEach(i => i.classList.remove('bad')); }
  function focusFirstBad(root) { const b = $('.bad', root) || $('[data-err]:not(:empty)', root); if (b) { if (b.scrollIntoView) b.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (b.focus) b.focus(); } }
  const urlOk = v => !v || /^https?:\/\/[^\s]+\.[^\s]{2,}/i.test(v);
  const fdate = d => { try { return d ? new Date(d).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; } catch (e) { return ''; } };
  const imgSrc = v => (!v ? '' : /^(data:|https?:)/.test(v) ? v : '../' + v);

  /* ======================================================== shell / router */
  const VIEWS = [['dash', '◧', 'Boshqaruv'], ['products', '◈', 'Mahsulotlar'], ['news', '✎', 'Yangiliklar'], ['texts', 'Aa', 'Matnlar'], ['settings', '⚙', 'Sozlamalar'], ['publish', '🚀', 'Nashr va zaxira'], ['security', '🔒', 'Xavfsizlik']];
  let view = 'dash', viewState = {};
  const viewFns = {};
  function route() { const h = (location.hash || '').slice(1); view = VIEWS.some(v => v[0] === h) ? h : 'dash'; renderView(); }
  function shell() {
    app.innerHTML = `<div class="shell"><aside class="side" id="side">
      <div class="brand"><svg viewBox="0 0 64 64"><use href="#mark"/></svg><div>BabuSweet<small>Admin</small></div></div>
      ${VIEWS.map(([k, i, n]) => `<a class="nav-i" data-v="${k}" href="#${k}"><span class="ic">${i}</span>${n}${k === 'publish' ? '<span class="badge" id="pubBadge" hidden>!</span>' : ''}</a>`).join('')}
      <div class="sp"></div>
      <a class="nav-i" href="../index.html" target="_blank" rel="noopener"><span class="ic">↗</span>Saytni ochish</a>
      <button class="nav-i" id="lo"><span class="ic">⏻</span>Chiqish</button></aside>
      <main class="main"><div class="top"><div class="row"><button class="btn icon burger" id="bg" aria-label="Menu">☰</button><h2 id="vt"></h2></div><div class="row"><span class="status" id="status"><i></i><span></span></span><span class="row" id="va"></span></div></div><div id="view"></div></main></div>`;
    $('#bg').onclick = () => $('#side').classList.toggle('open');
    $('#side').addEventListener('click', e => { if (e.target.closest('a[data-v]')) $('#side').classList.remove('open'); });
    $('#lo').onclick = () => logout('Siz tizimdan chiqdingiz.');
    refreshStatus();
  }
  function renderView() {
    if (!$('.shell')) return;
    $$('.nav-i[data-v]').forEach(a => a.classList.toggle('on', a.dataset.v === view));
    const v = $('#view'); v.innerHTML = ''; $('#va').innerHTML = '';
    try { viewFns[view](); } catch (e) { console.error(e); v.innerHTML = `<div class="card"><h3>Bu bo‘limni ochishda xato</h3><p class="lead">${esc(e.message)}</p><button class="btn pri" onclick="location.reload()">Sahifani yangilash</button></div>`; }
    refreshStatus(); window.scrollTo(0, 0);
  }
  const setTitle = (t, actions = '') => { $('#vt').textContent = t; $('#va').innerHTML = actions; };
  const go = v => { if (location.hash === '#' + v) renderView(); else location.hash = v; };
  window.addEventListener('hashchange', () => { if (isAuthed()) route(); });

  /* ======================================================== DASHBOARD */
  viewFns.dash = () => {
    setTitle('Boshqaruv paneli');
    const P = D.products, S = D.settings, used = draftBytes(), pct = Math.min(100, Math.round(used / 5e6 * 100));
    const active = P.filter(p => p.status === 'active');
    const items = [];
    const add = (ok, text, view, act) => items.push({ ok, text, view, act });
    add(!!S.phone, 'Telefon raqami kiritilgan', 'settings', 'Sozlamalar');
    add(!!(S.social.telegram || S.email) ? true : 'warn', S.social.telegram || S.email ? 'Aloqa formasi xabarni ' + (S.social.telegram ? 'Telegram' : 'email') + ' orqali yuboradi' : 'Telegram havolasi yoki email kiritilmagan — forma faqat xabarni nusxalaydi', 'settings', 'Kiritish');
    add(!!S.domain ? true : 'warn', S.domain ? 'Sayt manzili (domen): ' + S.domain : 'Sayt manzili (domen) kiritilmagan — Google uchun kerak (sitemap, canonical)', 'settings', 'Kiritish');
    add(active.length > 0, active.length + ' ta faol mahsulot', 'products', 'Mahsulotlar');
    const noImg = P.filter(p => !p.image).length; add(noImg === 0, noImg ? noImg + ' ta mahsulotda rasm yo‘q' : 'Barcha mahsulotlarda rasm bor', 'products', 'Ko‘rish');
    const noDesc = active.filter(p => !p.desc.uz.trim()).length; add(noDesc === 0 ? true : 'warn', noDesc ? noDesc + ' ta faol mahsulotda o‘zbekcha tavsif yo‘q' : 'Faol mahsulotlarda tavsif bor', 'products', 'Tahrirlash');
    const noTr = active.filter(p => !p.desc.ru.trim() || !p.desc.en.trim()).length; add(noTr === 0 ? true : 'warn', noTr ? noTr + ' ta mahsulotda rus/ingliz tavsifi yo‘q' : 'Rus va ingliz tavsiflari to‘liq', 'products', 'Tahrirlash');
    add(pct < 80 ? true : (pct < 95 ? 'warn' : false), `Brauzer xotirasi: ${pct}% band`, 'publish', 'Nashr qilish');
    add(isDirty() ? 'warn' : true, isDirty() ? 'Nashr qilinmagan o‘zgarishlar bor — saytda hali ko‘rinmaydi' : 'Saytdagi ma’lumotlar bilan bir xil', 'publish', 'Nashr qilish');
    $('#view').innerHTML = `<div class="grid4">
      <div class="stat"><b>${active.length}</b><span>Faol mahsulotlar</span></div>
      <div class="stat"><b>${P.filter(p => p.status === 'soon').length}</b><span>Tez orada chiqadi</span></div>
      <div class="stat"><b>${D.news.filter(n => n.published).length}</b><span>E’lon qilingan yangiliklar</span></div>
      <div class="stat"><b>${Object.values(D.texts).reduce((a, o) => a + Object.keys(o).length, 0)}</b><span>O‘zgartirilgan matnlar</span></div></div>
    <div class="card"><h3>Tezkor amallar</h3><p class="lead">Eng ko‘p ishlatiladigan amallar.</p><div class="row">
      <button class="btn pri" data-go="products" data-new="1">+ Mahsulot qo‘shish</button><button class="btn" data-go="news" data-new="1">+ Yangilik</button><button class="btn" data-go="texts">Matnlarni tahrirlash</button><a class="btn" href="../index.html" target="_blank" rel="noopener">Saytni ko‘rish ↗</a></div></div>
    <div class="card"><h3>Tayyorlik tekshiruvi</h3><p class="lead">Sayt to‘liq va xatosiz ishlashi uchun tekshiruv ro‘yxati.</p><ul class="check">${items.map(i => `<li class="${i.ok === true ? '' : i.ok === 'warn' ? 'warn' : 'bad'}"><b>${i.ok === true ? '✓' : '!'}</b><span style="flex:1">${esc(i.text)}</span>${i.ok !== true ? `<a data-go="${i.view}">${esc(i.act)} →</a>` : ''}</li>`).join('')}</ul></div>
    <div class="card"><h3>Brauzer xotirasi</h3><p class="lead">Qoralama shu brauzerda saqlanadi (taxminan 5 MB). Rasmlar ko‘p bo‘lsa, nashr qiling.</p><div class="meter ${pct > 90 ? 'bad' : pct > 70 ? 'warn' : ''}"><i style="width:${Math.max(2, pct)}%"></i></div><small style="color:var(--mute)">${(used / 1e6).toFixed(2)} MB / 5 MB</small></div>`;
    $$('[data-go]').forEach(b => b.onclick = () => { const v = b.dataset.go; go(v); if (b.dataset.new) setTimeout(() => (v === 'products' ? productForm() : newsForm()), 60); });
  };

  /* ======================================================== PRODUCTS */
  viewFns.products = () => {
    setTitle('Mahsulotlar', '<button class="btn pri" id="addp">+ Mahsulot qo‘shish</button>');
    $('#addp').onclick = () => productForm();
    $('#view').innerHTML = `<div class="bar"><input type="search" id="pq" placeholder="Qidirish…" aria-label="Qidirish" value="${esc(viewState.pq || '')}"><select id="pf" style="width:auto" aria-label="Holat"><option value="all">Barcha holatlar</option>${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${viewState.pf === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div class="plist" id="plist"></div><p class="hint" id="phint" style="color:var(--mute);font-size:.85rem;margin-top:12px"></p>`;
    const draw = () => {
      const q = ($('#pq').value || '').trim().toLowerCase(), f = $('#pf').value; viewState.pq = q; viewState.pf = f;
      const all = [...D.products].sort((a, b) => a.order - b.order), filtering = !!q || f !== 'all';
      const list = all.filter(p => (f === 'all' || p.status === f) && (!q || (p.name + ' ' + p.flavor + ' ' + p.slug).toLowerCase().includes(q)));
      const box = $('#plist');
      box.innerHTML = list.length ? list.map(p => { const i = all.indexOf(p); return `<div class="prow" data-id="${esc(p.id)}" ${filtering ? '' : 'draggable="true"'}>
        <div class="grip" title="Sudrab tartiblash">${filtering ? '' : '⋮⋮'}</div>
        <div class="thumb" style="--c:${esc(p.color)};--c2:${esc(p.color2 || '#111')}">${p.image ? `<img src="${esc(imgSrc(p.thumb || p.image))}" alt="">` : ''}</div>
        <div><h4>${esc(p.name)}<span class="tag ${p.status}">${ST[p.status]}</span></h4><small><span class="dot" style="background:${esc(p.color)}"></span>${esc([p.flavor, p.weight].filter(Boolean).join(' · '))} · <code>${esc(p.slug)}</code></small></div>
        <div class="acts">${filtering ? '' : `<button class="btn sm icon" data-mv="-1" ${i === 0 ? 'disabled' : ''} aria-label="Yuqoriga">↑</button><button class="btn sm icon" data-mv="1" ${i === all.length - 1 ? 'disabled' : ''} aria-label="Pastga">↓</button>`}
        <button class="btn sm" data-act="edit">Tahrirlash</button><button class="btn sm" data-act="toggle">${p.status === 'hidden' ? 'Ko‘rsatish' : 'Yashirish'}</button><button class="btn sm" data-act="dup">Nusxa</button><button class="btn sm danger" data-act="del">O‘chirish</button></div></div>`; }).join('') : `<div class="empty">${all.length ? 'Hech narsa topilmadi' : 'Hozircha mahsulot yo‘q. “+ Mahsulot qo‘shish” tugmasini bosing.'}</div>`;
      $('#phint').textContent = filtering ? 'Tartibni o‘zgartirish uchun qidiruv va filtrni tozalang.' : (all.length > 1 ? 'Tartibni o‘zgartirish: qatorni sudrang yoki ↑ ↓ tugmalarini bosing. Saytda mahsulotlar shu tartibda chiqadi.' : '');
    };
    draw();
    $('#pq').addEventListener('input', draw); $('#pf').addEventListener('change', draw);
    const box = $('#plist');
    box.addEventListener('click', guarded(async e => {
      const row = e.target.closest('.prow'); if (!row) return; const p = D.products.find(x => x.id === row.dataset.id); if (!p) return;
      const mv = e.target.closest('[data-mv]'), act = e.target.closest('[data-act]');
      if (mv) { const s = [...D.products].sort((a, b) => a.order - b.order), i = s.indexOf(p), j = i + +mv.dataset.mv; if (j < 0 || j >= s.length) return; [s[i], s[j]] = [s[j], s[i]]; s.forEach((x, k) => { x.order = k + 1; }); persist(); draw(); return; }
      if (!act) return;
      if (act.dataset.act === 'edit') productForm(p);
      if (act.dataset.act === 'toggle') { p.status = p.status === 'hidden' ? 'active' : 'hidden'; persist(); draw(); toast(p.status === 'hidden' ? 'Mahsulot saytdan yashirildi (nashr qilgach)' : 'Mahsulot faol qilindi'); }
      if (act.dataset.act === 'dup') { const c = clone(p); c.id = uid(); c.name = p.name + ' (nusxa)'; c.slug = uniqueSlug(slugify(c.name)); c.order = Math.max(0, ...D.products.map(x => x.order)) + 1; c.status = 'hidden'; D.products.push(c); persist(); draw(); toast('Nusxa yaratildi (yashirin holatda)'); }
      if (act.dataset.act === 'del') { if (await confirmBox({ title: 'Mahsulot o‘chirilsinmi?', text: `“${p.name}” butunlay o‘chiriladi.`, ok: 'O‘chirish', danger: true })) { D.products = D.products.filter(x => x.id !== p.id); D.products.sort((a, b) => a.order - b.order).forEach((x, k) => { x.order = k + 1; }); persist(); draw(); toast('O‘chirildi'); } }
    }));
    let dragId = null;
    box.addEventListener('dragstart', e => { const r = e.target.closest('.prow'); if (!r) return; dragId = r.dataset.id; r.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); } catch (x) { /* ignore */ } });
    box.addEventListener('dragend', () => { dragId = null; $$('.prow', box).forEach(r => r.classList.remove('dragging', 'over')); });
    box.addEventListener('dragover', e => { const r = e.target.closest('.prow'); if (!r || !dragId) return; e.preventDefault(); $$('.prow', box).forEach(x => x.classList.toggle('over', x === r && x.dataset.id !== dragId)); });
    box.addEventListener('drop', e => {
      const r = e.target.closest('.prow'); if (!r || !dragId || r.dataset.id === dragId) return; e.preventDefault();
      const s = [...D.products].sort((a, b) => a.order - b.order), from = s.findIndex(x => x.id === dragId), to = s.findIndex(x => x.id === r.dataset.id);
      if (from < 0 || to < 0) return; const [m] = s.splice(from, 1); s.splice(to, 0, m); s.forEach((x, k) => { x.order = k + 1; }); persist(); draw();
    });
  };
  const uniqueSlug = (base, selfId) => { let s = base || 'product', n = 2; while (D.products.some(p => p.slug === s && p.id !== selfId)) s = (base || 'product') + '-' + n++; return s; };

  function productForm(p) {
    const isNew = !p;
    const x = p ? clone(p) : { id: uid(), slug: '', name: '', tagline: tri(), desc: tri(), flavor: 'Sea Salt Caramel', weight: '', category: 'Chocolate Candies', image: '', thumb: '', bg: false, color: '#1f63ff', color2: '', status: 'active', badge: '', order: 0, createdAt: new Date().toISOString() };
    let slugTouched = !isNew, busy = false;
    const d = openDialog(`<h3>${isNew ? 'Yangi mahsulot' : 'Mahsulotni tahrirlash'}</h3><form id="pf" novalidate><div class="dlg-grid"><div class="stack">
      <div class="cols">${fld('Nomi *', `<input type="text" name="name" maxlength="80" value="${esc(x.name)}" autocomplete="off">`, 'name')}${fld('Holati', `<select name="status">${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${x.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>`, 'status')}</div>
      ${fld('Sahifa manzili (slug)', `<input type="text" name="slug" maxlength="60" value="${esc(x.slug)}" autocomplete="off" spellcheck="false">`, 'slug', 'Faqat lotin harf, raqam va “-”. Nomdan avtomatik yaratiladi.')}
      <div><div class="lb" style="font-size:.74rem;font-weight:800;color:var(--mute);letter-spacing:.07em;text-transform:uppercase;margin-bottom:6px">Rasm *</div><div class="drop" id="drop"><input type="file" accept="image/png,image/jpeg,image/webp" id="file" aria-label="Rasm tanlash"><div id="dropc"></div></div><span class="fe" data-err="image"></span>
        <label class="chk" style="margin-top:10px"><input type="checkbox" name="bg" ${x.bg ? 'checked' : ''}> Rasm fonli (shaffof emas) — yumaloq burchakli rasm sifatida ko‘rsatiladi</label></div>
      ${triField('tagline', 'Qisqa tavsif', x.tagline)}${triField('desc', 'To‘liq tavsif', x.desc, true, 4)}
      <div class="cols3">${fld('Ta’mi', `<input type="text" name="flavor" maxlength="80" value="${esc(x.flavor)}">`, 'flavor')}${fld('Og‘irligi', `<input type="text" name="weight" maxlength="40" value="${esc(x.weight)}" placeholder="masalan, 40 g">`, 'weight')}${fld('Turi', `<input type="text" name="category" maxlength="60" value="${esc(x.category)}">`, 'category')}</div>
      <div class="cols3">${fld('Asosiy rang', `<input type="color" name="color" value="${esc(x.color)}">`, 'color', 'Sahifa fon rangi')}${fld('To‘q rang (ixtiyoriy)', `<input type="color" name="color2" value="${esc(x.color2 || '#0a1a5a')}">`, 'color2')}${fld('Belgi', `<input type="text" name="badge" maxlength="24" value="${esc(x.badge)}" placeholder="Bestseller">`, 'badge')}</div>
      <label class="chk"><input type="checkbox" name="autoc2" ${x.color2 ? '' : 'checked'}> To‘q rangni avtomatik tanlash</label>
    </div><aside><div class="pvhead">Katalogda ko‘rinishi</div><div class="pvcard" id="pv"><div class="im"><img id="pvi" alt=""></div><h5 id="pvn"></h5><p id="pvm"></p></div></aside></div>
    <div class="err" id="fe" role="alert"></div><div class="actions"><button type="button" class="btn" data-x>Bekor qilish</button><button class="btn pri" type="submit" id="sv">Saqlash</button></div></form>`, {
      size: '', guard: () => !changed() || window.confirm('Saqlanmagan o‘zgarishlar bor. Chiqishni xohlaysizmi?')
    });
    const form = $('#pf', d.el); wireTri(form);
    const snap = () => JSON.stringify([form.name.value, form.status.value, form.slug.value, form.flavor.value, form.weight.value, form.category.value, form.color.value, form.badge.value, form.bg.checked, x.image.length, readTri(form, 'tagline'), readTri(form, 'desc')]);
    const initial = snap(); function changed() { return snap() !== initial; }
    const darken = c => { const m = /^#(..)(..)(..)$/.exec(c); if (!m) return '#111'; return '#' + [1, 2, 3].map(i => Math.round(parseInt(m[i], 16) * .3).toString(16).padStart(2, '0')).join(''); };
    const paintDrop = () => { $('#dropc').innerHTML = x.image ? `<img src="${esc(imgSrc(x.image))}" alt=""><small>Boshqa rasm tanlash uchun bosing yoki tashlang</small>` : `<strong>Rasmni shu yerga tashlang yoki bosing</strong><small>Eng yaxshisi: shaffof fonli PNG yoki WebP (mahsulot fonsiz). JPG ham bo‘ladi.</small>`; };
    const paintPv = () => { const c = form.color.value, c2 = form.autoc2.checked ? darken(c) : form.color2.value; const pv = $('#pv', d.el); pv.style.setProperty('--c', c); pv.style.setProperty('--c2', c2); $('#pvi', d.el).src = imgSrc(x.thumb || x.image) || 'data:,'; $('#pvn', d.el).textContent = form.name.value || 'Mahsulot nomi'; $('#pvm', d.el).textContent = [form.flavor.value, form.weight.value].filter(Boolean).join(' · '); form.color2.disabled = form.autoc2.checked; };
    paintDrop(); paintPv();
    form.name.addEventListener('input', () => { if (!slugTouched) form.slug.value = uniqueSlug(slugify(form.name.value), x.id); paintPv(); });
    form.slug.addEventListener('input', () => { slugTouched = true; });
    ['color', 'color2', 'autoc2', 'flavor', 'weight'].forEach(n => form[n].addEventListener('input', paintPv));
    const handle = guarded(async file => {
      if (!file || busy) return; busy = true; $('#sv', d.el).disabled = true; $('#dropc').innerHTML = '<strong>Rasm tayyorlanmoqda…</strong>';
      try { const r = await processImage(file); x.image = r.main; x.thumb = r.thumb; form.bg.checked = r.opaque; setErr(form, 'image', ''); toast(r.opaque ? 'Rasm yuklandi (fonli — “Rasm fonli” belgisi yoqildi)' : 'Rasm yuklandi (shaffof fon ✓)'); }
      catch (e) { setErr(form, 'image', e.message); toast(e.message, 'bad'); }
      finally { busy = false; $('#sv', d.el).disabled = false; paintDrop(); paintPv(); }
    });
    $('#file', d.el).addEventListener('change', e => { handle(e.target.files[0]); e.target.value = ''; });
    const drop = $('#drop', d.el);
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => handle(e.dataTransfer.files[0]));
    $('[data-x]', d.el).onclick = () => d.tryClose();
    form.addEventListener('submit', guarded(async e => {
      e.preventDefault(); if (busy) return; clearErrs(form); $('#fe', d.el).textContent = '';
      let ok = true; const name = form.name.value.trim(); let slug = slugify(form.slug.value);
      if (!name) ok = setErr(form, 'name', 'Mahsulot nomini kiriting') && ok;
      if (!slug) { slug = uniqueSlug(slugify(name), x.id); form.slug.value = slug; }
      if (D.products.some(q => q.slug === slug && q.id !== x.id)) ok = setErr(form, 'slug', 'Bu manzil band. Boshqasini kiriting') && ok;
      if (!x.image) { const e2 = $('[data-err=image]', form); e2.textContent = 'Rasm yuklang'; ok = false; }
      if (!ok) { $('#fe', d.el).textContent = 'Iltimos, qizil bilan belgilangan maydonlarni to‘ldiring.'; focusFirstBad(form); return; }
      const data = { ...x, name, slug, status: form.status.value, tagline: readTri(form, 'tagline'), desc: readTri(form, 'desc'), flavor: form.flavor.value.trim(), weight: form.weight.value.trim(), category: form.category.value.trim(), color: form.color.value, color2: form.autoc2.checked ? '' : form.color2.value, badge: form.badge.value.trim(), bg: form.bg.checked };
      if (isNew) { data.order = Math.max(0, ...D.products.map(q => q.order)) + 1; D.products.push(data); } else { const i = D.products.findIndex(q => q.id === x.id); if (i < 0) D.products.push(data); else D.products[i] = data; }
      persist(); if (saveFailed) { if (isNew) D.products.pop(); return; }
      d.close(); if (view === 'products') renderView(); toast(isNew ? 'Mahsulot qo‘shildi ✓' : 'Mahsulot saqlandi ✓');
    }));
  }

  /* ======================================================== NEWS */
  viewFns.news = () => {
    setTitle('Yangiliklar', '<button class="btn pri" id="addn">+ Yangilik</button>');
    $('#addn').onclick = () => newsForm();
    const list = [...D.news].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $('#view').innerHTML = list.length ? `<div class="plist" id="nlist">${list.map(n => `<div class="prow" style="grid-template-columns:92px 1fr auto" data-id="${esc(n.id)}"><div class="thumb">${n.image ? `<img src="${esc(imgSrc(n.image))}" alt="" style="object-fit:cover;padding:0">` : ''}</div><div><h4>${esc(n.title.uz || n.title.ru || n.title.en)}<span class="tag ${n.published ? 'active' : 'hidden'}">${n.published ? 'E’lon qilingan' : 'Qoralama'}</span></h4><small>${fdate(n.date)}</small></div><div class="acts"><button class="btn sm" data-act="edit">Tahrirlash</button><button class="btn sm" data-act="toggle">${n.published ? 'Yashirish' : 'E’lon qilish'}</button><button class="btn sm danger" data-act="del">O‘chirish</button></div></div>`).join('')}</div>` : '<div class="empty">Yangilik yo‘q. “+ Yangilik” tugmasini bosing.</div>';
    const box = $('#nlist'); if (!box) return;
    box.addEventListener('click', guarded(async e => {
      const row = e.target.closest('.prow'), act = e.target.closest('[data-act]'); if (!row || !act) return; const n = D.news.find(x => x.id === row.dataset.id); if (!n) return;
      if (act.dataset.act === 'edit') newsForm(n);
      if (act.dataset.act === 'toggle') { n.published = !n.published; persist(); renderView(); }
      if (act.dataset.act === 'del' && await confirmBox({ title: 'Yangilik o‘chirilsinmi?', text: n.title.uz || n.title.en, ok: 'O‘chirish', danger: true })) { D.news = D.news.filter(x => x.id !== n.id); persist(); renderView(); toast('O‘chirildi'); }
    }));
  };
  function newsForm(n) {
    const isNew = !n; const x = n ? clone(n) : { id: uid(), published: true, date: new Date().toISOString(), title: tri(), body: tri(), image: '' }; let busy = false;
    const dval = (x.date || '').slice(0, 10);
    const d = openDialog(`<h3>${isNew ? 'Yangi yangilik' : 'Yangilikni tahrirlash'}</h3><form id="nf" novalidate><div class="stack">
      ${triField('title', 'Sarlavha *', x.title)}<span class="fe" data-err="title"></span>${triField('body', 'Matn', x.body, true, 5)}
      <div class="cols">${fld('Sana', `<input type="date" name="date" value="${esc(dval)}">`, 'date')}<label class="chk" style="align-self:end;padding-bottom:12px"><input type="checkbox" name="published" ${x.published ? 'checked' : ''}> Saytda e’lon qilish</label></div>
      <div><div class="drop" id="drop"><input type="file" accept="image/png,image/jpeg,image/webp" id="file" aria-label="Rasm"><div id="dropc"></div></div><div class="row" style="margin-top:8px"><button type="button" class="btn sm" id="rmimg" hidden>Rasmni olib tashlash</button></div></div>
    </div><div class="err" id="fe" role="alert"></div><div class="actions"><button type="button" class="btn" data-x>Bekor qilish</button><button class="btn pri" type="submit" id="sv">Saqlash</button></div></form>`, { guard: () => !changed() || window.confirm('Saqlanmagan o‘zgarishlar bor. Chiqishni xohlaysizmi?') });
    const form = $('#nf', d.el); wireTri(form);
    const snap = () => JSON.stringify([readTri(form, 'title'), readTri(form, 'body'), form.date.value, form.published.checked, x.image.length]); const initial = snap(); function changed() { return snap() !== initial; }
    const paint = () => { $('#dropc').innerHTML = x.image ? `<img src="${esc(imgSrc(x.image))}" alt=""><small>Almashtirish uchun bosing</small>` : '<strong>Rasm (ixtiyoriy) — tashlang yoki bosing</strong><small>PNG, JPG yoki WebP</small>'; $('#rmimg', d.el).hidden = !x.image; }; paint();
    const handle = guarded(async f => { if (!f || busy) return; busy = true; $('#sv', d.el).disabled = true; $('#dropc').innerHTML = '<strong>Tayyorlanmoqda…</strong>'; try { const r = await processImage(f, { maxMain: 900 }); x.image = r.main; } catch (e) { toast(e.message, 'bad'); } finally { busy = false; $('#sv', d.el).disabled = false; paint(); } });
    $('#file', d.el).addEventListener('change', e => { handle(e.target.files[0]); e.target.value = ''; });
    const drop = $('#drop', d.el); ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); })); ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); })); drop.addEventListener('drop', e => handle(e.dataTransfer.files[0]));
    $('#rmimg', d.el).onclick = () => { x.image = ''; paint(); };
    $('[data-x]', d.el).onclick = () => d.tryClose();
    form.addEventListener('submit', guarded(async e => {
      e.preventDefault(); if (busy) return; const title = readTri(form, 'title'); const te = $('[data-err=title]', form); te.textContent = '';
      if (!title.uz && !title.ru && !title.en) { te.textContent = 'Kamida bitta tilda sarlavha kiriting'; return; }
      const data = { ...x, title, body: readTri(form, 'body'), published: form.published.checked, date: form.date.value ? new Date(form.date.value + 'T12:00:00').toISOString() : x.date };
      if (isNew) D.news.push(data); else { const i = D.news.findIndex(q => q.id === x.id); if (i < 0) D.news.push(data); else D.news[i] = data; }
      persist(); d.close(); if (view === 'news') renderView(); toast('Yangilik saqlandi ✓');
    }));
  }

  /* ======================================================== TEXTS */
  const GROUPS = { nav: 'Menyu', ft: 'Sahifa pastki qismi', skip: 'Maxsus', hero: 'Bosh sahifa — birinchi ekran', sc: 'Bosh sahifa — kolleksiya', ab: 'Bosh sahifa — qisqa matn', st: 'Raqamlar', par: 'Hamkorlik yo‘nalishlari', news: 'Yangiliklar (bosh sahifa)', cta: 'Aloqaga chaqiruv', cat: 'Katalog sahifasi', pr: 'Mahsulot sahifasi', about: 'Biz haqimizda', val: 'Qadriyatlar', fac: 'Ishlab chiqarish bosqichlari', loc: 'Fabrika manzili bloki', ex: 'Eksport sahifasi', faq: 'Savol-javoblar', nw: 'Yangiliklar sahifasi', ct: 'Aloqa sahifasi', f: 'Aloqa formasi' };
  viewFns.texts = () => {
    setTitle('Sayt matnlari');
    const keys = Object.keys(I18N.uz), groups = {};
    keys.forEach(k => { const g = k.split('.')[0]; (groups[g] = groups[g] || []).push(k); });
    const cnt = Object.values(D.texts).reduce((a, o) => a + Object.keys(o).length, 0);
    $('#view').innerHTML = `<div class="card"><h3>Barcha matnlarni tahrirlash</h3><p class="lead">Saytdagi har bir yozuvni shu yerdan o‘zgartiring (uchala tilda). Bo‘sh qoldirsangiz yoki “↺” bossangiz, asl matn qaytadi. O‘zgarishlar avtomatik saqlanadi (qoralama). Mahsulot va yangilik matnlari alohida bo‘limlarda; bosh sahifa sarlavhasi va aloqa ma’lumotlari “Sozlamalar” da.</p><div class="bar" style="margin:0"><input type="search" id="tq" placeholder="Matn yoki kalit bo‘yicha qidirish…" aria-label="Qidirish"><span class="status"><span id="tcnt">${cnt}</span>&nbsp;ta o‘zgartirilgan</span></div></div><div id="tg"></div>`;
    const tg = $('#tg');
    Object.keys(groups).forEach(g => {
      const det = document.createElement('details'); det.className = 'tgroup'; det.dataset.g = g;
      det.innerHTML = `<summary>${esc(GROUPS[g] || g)}<span>${groups[g].length} ta matn</span></summary>` + groups[g].map(k => `<div class="trow" data-k="${esc(k)}"><div class="k"><span><code>${esc(k)}</code></span><button type="button" data-reset hidden>↺ Asl holiga</button></div><div class="ins">${LANGS.map(l => `<div><div class="lb">${l.toUpperCase()}</div><textarea data-l="${l}" rows="2" placeholder="${esc(I18N[l][k] || '')}" aria-label="${esc(k)} ${l}">${esc((D.texts[l] && D.texts[l][k]) || '')}</textarea></div>`).join('')}</div></div>`).join('');
      tg.appendChild(det);
    });
    const mark = row => { const k = row.dataset.k; const ed = LANGS.some(l => D.texts[l][k]); row.classList.toggle('edited', ed); $('[data-reset]', row).hidden = !ed; };
    $$('.trow', tg).forEach(mark);
    let tm; const upd = () => { $('#tcnt').textContent = Object.values(D.texts).reduce((a, o) => a + Object.keys(o).length, 0); };
    tg.addEventListener('input', e => {
      const ta = e.target.closest('textarea'); if (!ta) return; const row = ta.closest('.trow'), k = row.dataset.k, l = ta.dataset.l, v = ta.value.trim();
      if (!v || v === (I18N[l][k] || '').trim()) delete D.texts[l][k]; else D.texts[l][k] = ta.value.slice(0, 1500);
      mark(row); upd(); clearTimeout(tm); tm = setTimeout(persist, 350);
    });
    tg.addEventListener('click', e => { const b = e.target.closest('[data-reset]'); if (!b) return; const row = b.closest('.trow'), k = row.dataset.k; LANGS.forEach(l => { delete D.texts[l][k]; $(`textarea[data-l="${l}"]`, row).value = ''; }); mark(row); upd(); persist(); });
    $('#tq').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      $$('.tgroup', tg).forEach(det => {
        let any = false;
        $$('.trow', det).forEach(row => { const k = row.dataset.k; const hay = (k + ' ' + LANGS.map(l => (I18N[l][k] || '') + ' ' + ((D.texts[l] && D.texts[l][k]) || '')).join(' ')).toLowerCase(); const m = !q || hay.includes(q); row.hidden = !m; if (m) any = true; });
        det.hidden = !any; if (q) det.open = any;
      });
    });
  };

  /* ======================================================== SETTINGS */
  viewFns.settings = () => {
    setTitle('Sozlamalar');
    const s = D.settings, soc = s.social, stats = s.stats.length ? s.stats : [{}, {}, {}, {}];
    $('#view').innerHTML = `<form id="sf" novalidate class="stack">
      <div class="card"><h3>Aloqa ma’lumotlari</h3><div class="stack"><div class="cols">${fld('Telefon *', `<input type="text" name="phone" value="${esc(s.phone)}" autocomplete="off">`, 'phone')}${fld('Email', `<input type="email" name="email" value="${esc(s.email)}" autocomplete="off">`, 'email', 'Aloqa formasi shu manzilga xabar tayyorlaydi')}</div>
      ${fld('Manzil *', `<input type="text" name="address" value="${esc(s.address)}">`, 'address')}${fld('Xarita havolasi (Google Maps)', `<input type="url" name="mapUrl" value="${esc(s.mapUrl)}" placeholder="https://…">`, 'mapUrl')}${triField('hours', 'Ish vaqti', s.hours)}</div></div>
      <div class="card"><h3>Sayt manzili (Google uchun)</h3><p class="lead">Domen kiritilsa, nashr paytida <code>sitemap.xml</code>, <code>robots.txt</code> avtomatik yangilanadi va har sahifaga to‘g‘ri “canonical” manzil qo‘yiladi.</p>${fld('Domen', `<input type="url" name="domain" value="${esc(s.domain)}" placeholder="https://babusweet.uz">`, 'domain')}</div>
      <div class="card"><h3>Bosh sahifa matnlari</h3><div class="stack">${triField('htitle', 'Asosiy sarlavha', s.hero.title)}${triField('hlead', 'Qisqa matn', s.hero.lead, true, 2)}</div></div>
      <div class="card"><h3>Ijtimoiy tarmoqlar</h3><p class="lead">To‘liq havola (https://…). Telegram kiritilsa, aloqa formasi xabarni nusxalab Telegramni ochadi.</p><div class="cols">${fld('Telegram', `<input type="url" name="telegram" value="${esc(soc.telegram)}" placeholder="https://t.me/…">`, 'telegram')}${fld('Instagram', `<input type="url" name="instagram" value="${esc(soc.instagram)}" placeholder="https://instagram.com/…">`, 'instagram')}${fld('Facebook', `<input type="url" name="facebook" value="${esc(soc.facebook)}">`, 'facebook')}${fld('YouTube', `<input type="url" name="youtube" value="${esc(soc.youtube)}">`, 'youtube')}</div></div>
      <div class="card"><h3>Raqamlar (statistika)</h3><p class="lead">Sayt va “Biz haqimizda” sahifasida ko‘rinadi. Haqiqiy raqamlarni kiriting.</p><div class="stack">${stats.map((x, i) => `<div class="fieldset" data-stat="${i}"><legend>Raqam ${i + 1}</legend><div class="cols">${fld('Qiymat', `<input type="number" min="0" name="sv${i}" value="${x.value ?? 0}">`, 'sv' + i)}${fld('Qo‘shimcha (+, %, /7)', `<input type="text" name="ss${i}" maxlength="6" value="${esc(x.suffix || '')}">`, 'ss' + i)}</div>${triField('sl' + i, 'Yozuv', x.label || {})}</div>`).join('')}</div></div>
      <div class="card"><h3>Eksport yo‘nalishlari</h3>${fld('Vergul bilan ajrating', `<input type="text" name="regions" value="${esc(s.exportRegions.join(', '))}" placeholder="Kazakhstan, Turkey, UAE">`, 'regions', 'Globusda ko‘rinadi (eng ko‘pi bilan 10 ta)')}</div>
      <div class="err" id="fe" role="alert"></div><div class="row"><button class="btn pri" type="submit">Saqlash</button><button class="btn" type="button" id="rs">Bekor qilish</button></div></form>`;
    const f = $('#sf'); wireTri(f);
    $('#rs').onclick = () => renderView();
    f.addEventListener('submit', guarded(async e => {
      e.preventDefault(); clearErrs(f); $('#fe').textContent = ''; let ok = true;
      const phone = f.phone.value.trim(); if (phone.replace(/\D/g, '').length < 7) ok = setErr(f, 'phone', 'Telefon raqamini to‘g‘ri kiriting') && ok;
      const email = f.email.value.trim(); if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) ok = setErr(f, 'email', 'Email noto‘g‘ri') && ok;
      if (!f.address.value.trim()) ok = setErr(f, 'address', 'Manzilni kiriting') && ok;
      ['mapUrl', 'domain', 'telegram', 'instagram', 'facebook', 'youtube'].forEach(n => { const v = f[n].value.trim(); if (!urlOk(v)) ok = setErr(f, n, 'To‘liq havola kiriting: https://…') && ok; });
      $$('[data-stat]', f).forEach((_, i) => { const v = f['sv' + i].value; if (v !== '' && (isNaN(+v) || +v < 0)) ok = setErr(f, 'sv' + i, 'Musbat son kiriting') && ok; });
      if (!ok) { $('#fe').textContent = 'Iltimos, xatolarni tuzating.'; focusFirstBad(f); return; }
      D.settings = { ...D.settings, phone, email, address: f.address.value.trim(), mapUrl: f.mapUrl.value.trim() || D.settings.mapUrl, domain: f.domain.value.trim().replace(/\/+$/, ''), hours: readTri(f, 'hours'),
        social: { telegram: f.telegram.value.trim(), instagram: f.instagram.value.trim(), facebook: f.facebook.value.trim(), youtube: f.youtube.value.trim() },
        hero: { title: readTri(f, 'htitle'), lead: readTri(f, 'hlead') },
        stats: $$('[data-stat]', f).map((_, i) => ({ value: +f['sv' + i].value || 0, suffix: f['ss' + i].value.trim(), label: readTri(f, 'sl' + i) })),
        exportRegions: f.regions.value.split(',').map(v => v.trim()).filter(Boolean).slice(0, 10) };
      persist(); toast('Sozlamalar saqlandi ✓');
    }));
  };

  /* ======================================================== PUBLISH / BACKUP */
  const fileText = data => "/* BabuSweet sayt ma'lumotlari. Admin paneldan yaratilgan. */\nwindow.BS_DATA = " + JSON.stringify(data, null, 2) + ";\n";
  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  function diffSummary() {
    const out = [], a = new Map(PUBLISHED.products.map(p => [p.id, p])), b = new Map(D.products.map(p => [p.id, p]));
    const add = [...b.keys()].filter(k => !a.has(k)).length, del = [...a.keys()].filter(k => !b.has(k)).length, mod = [...b.keys()].filter(k => a.has(k) && JSON.stringify(a.get(k)) !== JSON.stringify(b.get(k))).length;
    if (add) out.push(`${add} ta mahsulot qo‘shildi`); if (del) out.push(`${del} ta mahsulot o‘chirildi`); if (mod) out.push(`${mod} ta mahsulot o‘zgartirildi`);
    const na = new Map(PUBLISHED.news.map(p => [p.id, p])), nb = new Map(D.news.map(p => [p.id, p]));
    const nch = [...nb.keys()].filter(k => !na.has(k) || JSON.stringify(na.get(k)) !== JSON.stringify(nb.get(k))).length + [...na.keys()].filter(k => !nb.has(k)).length; if (nch) out.push(`${nch} ta yangilik o‘zgardi`);
    if (JSON.stringify(PUBLISHED.settings) !== JSON.stringify(D.settings)) out.push('Sozlamalar o‘zgardi');
    if (JSON.stringify(PUBLISHED.texts) !== JSON.stringify(D.texts)) out.push('Matnlar o‘zgardi');
    return out;
  }
  function downloadBlob(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  viewFns.publish = () => {
    setTitle('Nashr qilish va zaxira');
    let gh = {}; try { gh = JSON.parse(store.get(K.gh) || '{}'); } catch (e) { /* ignore */ }
    const diff = diffSummary();
    $('#view').innerHTML = `
    <div class="card"><h3>1. Nima o‘zgardi?</h3>${diff.length ? `<ul class="check">${diff.map(t => `<li class="warn"><b>•</b><span>${esc(t)}</span></li>`).join('')}</ul>` : '<p class="lead">Nashr qilinmagan o‘zgarish yo‘q — saytdagi ma’lumotlar bilan bir xil.</p>'}
      <div class="row" style="margin-top:14px"><a class="btn pri" href="../index.html" target="_blank" rel="noopener">Qoralamani saytda ko‘rish ↗</a>${diff.length ? '<button class="btn danger" id="reset">Qoralamani bekor qilish</button>' : ''}</div>
      <p class="lead" style="margin:12px 0 0">Qoralama faqat shu brauzerda ko‘rinadi. Hamma uchun chiqarish uchun pastdagi usullardan birini tanlang.</p></div>
    <div class="card"><h3>2. GitHub orqali avtomatik nashr (tavsiya etiladi)</h3><p class="lead">Sayt GitHub’dan Netlify/GitHub Pages’ga ulangan bo‘lsa, bir tugma bilan yangilanadi: rasmlar alohida fayl bo‘lib yuklanadi, <code>sitemap.xml</code> va <code>robots.txt</code> ham yangilanadi (domen kiritilgan bo‘lsa). Bitta commit — bitta yangilanish.<br>Token: GitHub → Settings → Developer settings → Fine-grained tokens → faqat shu repo → <b>Contents: Read and write</b>. Token faqat shu brauzerda saqlanadi.</p>
      <form id="gf" novalidate class="stack"><div class="cols">${fld('Egasi (owner)', `<input type="text" name="owner" value="${esc(gh.owner || '')}" placeholder="sladusuz" autocomplete="off">`, 'owner')}${fld('Repo', `<input type="text" name="repo" value="${esc(gh.repo || '')}" placeholder="Ibrohim" autocomplete="off">`, 'repo')}</div>
      <div class="cols">${fld('Branch', `<input type="text" name="branch" value="${esc(gh.branch || 'main')}" autocomplete="off">`, 'branch')}${fld('Ma’lumot fayli yo‘li', `<input type="text" name="path" value="${esc(gh.path || 'BabuSweet-Frontend/data/site-data.js')}" autocomplete="off">`, 'path', 'Sayt papkasi repoda qayerda bo‘lsa, shunga mos')}</div>
      ${fld('Token', `<input type="password" name="token" value="${esc(gh.token || '')}" autocomplete="off">`, 'token')}
      <label class="chk"><input type="checkbox" name="remember" ${gh.token ? 'checked' : ''}> Tokenni shu brauzerda eslab qolish</label>
      <div class="row"><button class="btn" type="button" id="gt">Ulanishni tekshirish</button><button class="btn ok" type="submit" id="gb">🚀 Nashr qilish</button></div><div class="msgbox" id="gm" hidden></div></form></div>
    <div class="card"><h3>3. Faylni yuklab olish</h3><p class="lead">GitHub ishlatmasangiz: faylni yuklab oling, sayt papkasidagi <code>data/site-data.js</code> o‘rniga qo‘ying va hostingga qayta yuklang. (Bu faylda rasmlar ichiga joylangan bo‘ladi.)</p><button class="btn pri" id="dl">⬇ site-data.js ni yuklab olish</button></div>
    <div class="card"><h3>Zaxira nusxa</h3><p class="lead">Barcha ma’lumotlarni (mahsulotlar, yangiliklar, matnlar, sozlamalar) bitta faylga saqlang yoki avvalgi zaxirani tiklang.</p><div class="row"><button class="btn" id="bk">⬇ Zaxira nusxa olish</button><label class="btn" style="cursor:pointer">⬆ Zaxirani tiklash<input type="file" id="rf" accept=".json,.js,application/json" hidden></label></div><div class="msgbox" id="bm" hidden></div></div>`;
    const rs = $('#reset'); if (rs) rs.onclick = guarded(async () => { if (await confirmBox({ title: 'Qoralama bekor qilinsinmi?', text: 'Nashr qilinmagan barcha o‘zgarishlar o‘chadi.', ok: 'Bekor qilish', danger: true })) { store.del(K.draft); D = clone(PUBLISHED); refreshStatus(); renderView(); toast('Qoralama bekor qilindi'); } });
    $('#dl').onclick = () => { const dd = norm(D); dd._v = Date.now(); downloadBlob('site-data.js', fileText(dd), 'text/javascript'); D._v = dd._v; persist(); toast('Yuklab olindi — data/site-data.js o‘rniga qo‘ying'); };
    $('#bk').onclick = () => { const dd = norm(D); downloadBlob('babusweet-zaxira-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(dd), 'application/json'); toast('Zaxira nusxa yuklab olindi'); };
    $('#rf').addEventListener('change', guarded(async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return; const m = $('#bm'); m.hidden = false; m.className = 'msgbox';
      let txt = await f.text(); txt = txt.trim(); const i = txt.indexOf('{'), j = txt.lastIndexOf('}'); if (i < 0 || j < i) { m.className = 'msgbox bad'; m.textContent = 'Fayl formati noto‘g‘ri'; return; }
      let obj; try { obj = JSON.parse(txt.slice(i, j + 1)); } catch (x) { m.className = 'msgbox bad'; m.textContent = 'Faylni o‘qib bo‘lmadi (JSON xato)'; return; }
      const nd = norm(obj); if (!nd.products.length && !nd.news.length) { m.className = 'msgbox bad'; m.textContent = 'Faylda mahsulot yoki yangilik topilmadi'; return; }
      if (!(await confirmBox({ title: 'Zaxira tiklansinmi?', text: `${nd.products.length} ta mahsulot, ${nd.news.length} ta yangilik. Joriy qoralama almashtiriladi.`, ok: 'Tiklash' }))) { m.hidden = true; return; }
      D = nd; persist(); toast('Zaxira tiklandi ✓'); renderView();
    }));
    const gf = $('#gf'), gm = $('#gm');
    const readGh = () => { const o = { owner: gf.owner.value.trim(), repo: gf.repo.value.trim(), branch: gf.branch.value.trim() || 'main', path: gf.path.value.trim().replace(/^\/+/, ''), token: gf.token.value.trim() }; return o; };
    const ghv = o => { clearErrs(gf); let ok = true; if (!o.owner) ok = setErr(gf, 'owner', 'Kiriting') && ok; if (!o.repo) ok = setErr(gf, 'repo', 'Kiriting') && ok; if (!o.path) ok = setErr(gf, 'path', 'Kiriting') && ok; if (!o.token) ok = setErr(gf, 'token', 'Tokenni kiriting') && ok; return ok; };
    const msg = (t, c) => { gm.hidden = false; gm.className = 'msgbox ' + (c || ''); gm.textContent = t; };
    $('#gt').onclick = guarded(async () => { const o = readGh(); if (!ghv(o)) return; msg('Tekshirilmoqda…'); try { const r = await gh_api(o, `/repos/${enc(o.owner)}/${enc(o.repo)}`); msg(`Ulandi ✓ ${r.full_name} — yozish huquqi: ${r.permissions && r.permissions.push ? 'bor' : 'YO‘Q (token ruxsatini tekshiring)'}`, r.permissions && r.permissions.push ? 'ok' : 'bad'); } catch (e) { msg(e.message, 'bad'); } });
    gf.addEventListener('submit', guarded(async e => {
      e.preventDefault(); const o = readGh(); if (!ghv(o)) return;
      store.set(K.gh, JSON.stringify(gf.remember.checked ? o : { ...o, token: '' }));
      if (!(await confirmBox({ title: 'Saytga nashr qilinsinmi?', text: 'O‘zgarishlar hamma uchun chiqariladi (1–2 daqiqada).', ok: 'Nashr qilish' }))) return;
      const btn = $('#gb'); btn.disabled = true; msg('Tayyorlanmoqda…');
      try { const r = await ghPublish(o, t => msg(t)); msg(`Nashr qilindi ✓ (${r.files} ta fayl, commit ${r.sha.slice(0, 7)}). Hosting 1–2 daqiqada yangilaydi.`, 'ok'); toast('Nashr qilindi ✓'); refreshStatus(); }
      catch (x) { msg(x.message, 'bad'); } finally { btn.disabled = false; }
    }));
  };
  const enc = encodeURIComponent;
  async function gh_api(o, path, method = 'GET', body) {
    let r; try { r = await fetch('https://api.github.com' + path, { method, headers: { Authorization: 'Bearer ' + o.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); } catch (e) { throw new Error('Internetga ulanib bo‘lmadi. Aloqani tekshiring.'); }
    if (r.status === 401) throw new Error('Token noto‘g‘ri yoki muddati tugagan.');
    if (r.status === 403) throw new Error('Token ruxsati yetarli emas (Contents: Read and write kerak) yoki limitga yetildi.');
    if (r.status === 404) throw new Error('Repo, branch yoki yo‘l topilmadi. Egasi/repo/branch nomini va token shu repoga ruxsati borligini tekshiring.');
    if (r.status === 409 || r.status === 422) throw new Error('GitHub o‘zgarishni qabul qilmadi (konflikt). Sahifani yangilab qayta urinib ko‘ring.');
    if (!r.ok) throw new Error('GitHub xatosi: ' + r.status);
    return r.status === 204 ? {} : r.json();
  }
  async function ghPublish(o, say) {
    const data = norm(D); data._v = Date.now();
    const base = /data\/site-data\.js$/.test(o.path) ? o.path.replace(/data\/site-data\.js$/, '') : o.path.replace(/[^/]*$/, '');
    const files = []; const seen = new Map();
    const ext = d => (d.startsWith('data:image/webp') ? 'webp' : d.startsWith('data:image/png') ? 'png' : 'jpg');
    const toFile = async d => { if (!/^data:image\//.test(d)) return d; if (seen.has(d)) return seen.get(d); const h = (await sha256hex(d)).slice(0, 12), p = `assets/uploads/${h}.${ext(d)}`; files.push({ path: base + p, content: d.split(',')[1], enc: 'base64' }); seen.set(d, p); return p; };
    say('Rasmlar tayyorlanmoqda…');
    for (const p of data.products) { p.image = await toFile(p.image); p.thumb = await toFile(p.thumb); }
    for (const n of data.news) n.image = await toFile(n.image);
    files.push({ path: o.path, content: b64(fileText(data)), enc: 'base64' });
    if (data.settings.domain) {
      const dom = data.settings.domain, pages = ['', 'catalog.html', 'about.html', 'export.html', 'news.html', 'contact.html'];
      const urls = pages.map(p => dom + '/' + p).concat(data.products.filter(p => p.status === 'active').map(p => dom + '/product.html?p=' + enc(p.slug)));
      files.push({ path: base + 'sitemap.xml', content: b64('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n') + '\n</urlset>\n'), enc: 'base64' });
      files.push({ path: base + 'robots.txt', content: b64(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${dom}/sitemap.xml\n`), enc: 'base64' });
    }
    const rp = `/repos/${enc(o.owner)}/${enc(o.repo)}`;
    say('GitHub bilan bog‘lanilmoqda…'); const ref = await gh_api(o, `${rp}/git/ref/heads/${o.branch.split('/').map(enc).join('/')}`); const headSha = ref.object.sha;
    const commit = await gh_api(o, `${rp}/git/commits/${headSha}`);
    const tree = []; let i = 0;
    for (const f of files) { say(`Yuklanmoqda ${++i}/${files.length}…`); const bl = await gh_api(o, `${rp}/git/blobs`, 'POST', { content: f.content, encoding: f.enc }); tree.push({ path: f.path, mode: '100644', type: 'blob', sha: bl.sha }); }
    say('Commit yaratilmoqda…');
    const nt = await gh_api(o, `${rp}/git/trees`, 'POST', { base_tree: commit.tree.sha, tree });
    const nc = await gh_api(o, `${rp}/git/commits`, 'POST', { message: 'BabuSweet admin: sayt ma’lumotlari yangilandi', tree: nt.sha, parents: [headSha] });
    await gh_api(o, `${rp}/git/refs/heads/${o.branch.split('/').map(enc).join('/')}`, 'PATCH', { sha: nc.sha });
    D._v = data._v; persist();
    return { files: files.length, sha: nc.sha };
  }

  /* ======================================================== SECURITY */
  viewFns.security = () => {
    setTitle('Xavfsizlik');
    const c = cred();
    $('#view').innerHTML = `
    <div class="card"><h3>Parolni almashtirish</h3><p class="lead">Hozirgi login: <b>${esc(c.login)}</b>. Yangi parol kamida 8 belgi bo‘lsin (harf + raqam tavsiya etiladi).</p>
      <form id="pwf" novalidate class="stack" style="max-width:480px">${fld('Login', `<input type="text" name="login" value="${esc(c.login)}" autocomplete="username" autocapitalize="none">`, 'login')}${fld('Joriy parol', `<input type="password" name="cur" autocomplete="current-password">`, 'cur')}${fld('Yangi parol', `<input type="password" name="nw" autocomplete="new-password">`, 'nw')}${fld('Yangi parolni takrorlang', `<input type="password" name="nw2" autocomplete="new-password">`, 'nw2')}
      <div class="err" id="fe" role="alert"></div><button class="btn pri" type="submit" style="justify-self:start">Almashtirish</button></form><div id="pwres"></div></div>
    <div class="card"><h3>Google va begona kishilardan himoya</h3><ul class="check">
      <li><b>✓</b><span>Admin sahifasi Google’dan yashirilgan (<code>noindex</code>, <code>robots.txt</code>, <code>_headers</code>) va saytda hech qaysi havola unga olib bormaydi.</span></li>
      <li><b>✓</b><span>Parol ochiq saqlanmaydi (PBKDF2-SHA256 hash). 5 marta xato kiritilsa 5 daqiqaga qulflanadi. 30 daqiqa harakatsizlikdan so‘ng avtomatik chiqadi.</span></li>
      <li><b>✓</b><span>Muhimi: admin’ga kirgan begona odam <b>hamma ko‘radigan saytni o‘zgartira olmaydi</b> — nashr faqat sizning GitHub tokeningiz (yoki fayl almashtirish) orqali bo‘ladi.</span></li>
      <li class="warn"><b>!</b><span>Serversiz saytda login brauzer ichida tekshiriladi, shuning uchun kuchli parol qo‘ying. Qo‘shimcha himoya: Netlify “Password protection” yoki Cloudflare Access’ni <code>/admin/*</code> yo‘liga yoqing, yoki <code>admin</code> papkasini boshqa nomga o‘zgartiring (sayt ichidagi yo‘llar o‘zgarmaydi).</span></li></ul></div>
    <div class="card"><h3>Seans</h3><p class="lead">Xavfsizlik uchun umumiy kompyuterda ishlagan bo‘lsangiz, albatta chiqing.</p><button class="btn danger" id="lo2">Chiqish</button></div>`;
    $('#lo2').onclick = () => logout('Siz tizimdan chiqdingiz.');
    const f = $('#pwf');
    f.addEventListener('submit', guarded(async e => {
      e.preventDefault(); clearErrs(f); $('#fe').textContent = ''; let ok = true; const login = f.login.value.trim().toLowerCase();
      if (login.length < 3 || /\s|:/.test(login)) ok = setErr(f, 'login', 'Login kamida 3 belgi, bo‘sh joy va “:” siz') && ok;
      if (!f.cur.value) ok = setErr(f, 'cur', 'Joriy parolni kiriting') && ok;
      if (f.nw.value.length < 8) ok = setErr(f, 'nw', 'Kamida 8 belgi') && ok;
      else if (f.nw.value === f.cur.value) ok = setErr(f, 'nw', 'Yangi parol joriyidan farq qilsin') && ok;
      if (f.nw2.value !== f.nw.value) ok = setErr(f, 'nw2', 'Parollar mos emas') && ok;
      if (!ok) { focusFirstBad(f); return; }
      const cur = cred(), ch = await pbkdf2hex(String(cur.login).toLowerCase() + ':' + f.cur.value, cur.salt, cur.iter);
      if (!safeEq(ch, cur.hash)) { setErr(f, 'cur', 'Joriy parol noto‘g‘ri'); return; }
      const salt = u82hex(crypto.getRandomValues(new Uint8Array(16))), iter = 150000, hash = await pbkdf2hex(login + ':' + f.nw.value, salt, iter);
      const rec = { login, iter, salt, hash }; if (!store.set(K.pw, JSON.stringify(rec))) { toast('Saqlab bo‘lmadi', 'bad'); return; }
      $('#pwres').innerHTML = `<div class="msgbox ok">Parol almashtirildi ✓ (shu brauzer uchun).</div><p class="lead" style="margin-top:12px">Parol <b>boshqa brauzer/kompyuterda ham</b> amal qilishi uchun <code>admin/config.js</code> faylini shu bilan almashtiring va saytga qayta yuklang:</p><div class="hashbox">window.BS_ADMIN = ${esc(JSON.stringify(rec))};</div>`;
      f.reset(); f.login.value = login; toast('Parol almashtirildi ✓');
    }));
  };

  /* ======================================================== boot */
  function start() {
    if (!window.BS_ADMIN || !window.BS_ADMIN.hash) { app.innerHTML = '<div class="boot">Sozlama fayli (config.js) topilmadi.</div>'; return; }
    if (!isAuthed()) { loginScreen(); return; }
    D = loadDraft() || clone(PUBLISHED);
    shell(); route();
  }
  window.addEventListener('beforeunload', e => { if (saveFailed) { e.preventDefault(); e.returnValue = ''; } });
  start();
})();
