'use strict';
// Konstruktor ko'rinishida (preview): saytdagi matn ustiga bosib to'g'ridan-to'g'ri tahrirlash. Rasm ustiga bosilsa, tahrirlash paneli shu bo'limni ochadi.
(function () {
  if (!new URLSearchParams(location.search).has('preview')) return;
  let on = false, LD = null, sheet = null;
  const st = document.createElement('style');
  st.textContent = '.ied-on [data-ied]{outline:2px dashed #c8a86acc;outline-offset:3px;cursor:text!important;border-radius:4px}.ied-on a,.ied-on button{cursor:text}.ied-on img{cursor:pointer}.ied-sheet{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#fffdf9;color:#15110a;border-top:1px solid #e6dfd0;box-shadow:0 -18px 50px #15110a40;padding:14px 14px calc(14px + env(safe-area-inset-bottom));font:15px/1.4 -apple-system,Segoe UI,Roboto,Inter,sans-serif;animation:iedup .18s ease-out}@keyframes iedup{from{transform:translateY(30px);opacity:0}}.ied-sheet small{display:block;color:#6b6355;font-weight:600;margin-bottom:6px}.ied-sheet textarea{width:100%;box-sizing:border-box;border:1.5px solid #c8a86a;border-radius:12px;padding:12px;font:16px/1.4 inherit;font-family:inherit;color:#15110a;background:#fff;resize:none;outline:0;min-height:56px;max-height:38vh}.ied-sheet .r{display:flex;gap:8px;margin-top:10px}.ied-sheet button{flex:1;border:0;border-radius:12px;padding:13px;font:700 15px inherit;font-family:inherit;cursor:pointer}.ied-sheet .ok{background:linear-gradient(135deg,#e6d3a3,#c8a86a);color:#15110a}.ied-sheet .no{background:#efe8d8;color:#15110a}.ied-sheet .hint{font-size:12px;color:#6b6355;margin-top:6px}';
  document.head.appendChild(st);
  const norm = (s) => String(s == null ? '' : s).replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  const SKIP = /^(id|type|layout|fx|icon|ic|image\d*|logoImage|link|href|url|video|accent|color|bg|theme|tag|kind|size|enabled|anchor|key|slug|lang|template|font|shape|radius|spinText|price|value|qty)$/i, URLISH = /^(https?:|\/|#|data:|mailto:|tel:)/i;
  function leaves(o, base, out) {
    if (typeof o === 'string') { if (o && o.length <= 1500 && !URLISH.test(o)) out.push({ path: base, value: o }); } else if (Array.isArray(o)) o.forEach((v, i) => leaves(v, base.concat(i), out));
    else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (!SKIP.test(k)) leaves(o[k], base.concat(k), out); }
    return out;
  }
  function pool(el) {
    if (!LD) return [];
    const sec = el.closest('[data-sec]'); let scope = [];
    if (sec) { const i = (LD.sections || []).findIndex((s) => s.id === sec.dataset.sec); if (i > -1) scope = leaves(LD.sections[i], ['sections', i], []); }
    return scope.concat(leaves({ company: LD.company, announce: LD.announce, footer: LD.footer, nav: LD.nav, contacts: LD.contacts }, [], []));
  }
  function findText(el) {
    const p = pool(el);
    for (let n = el, d = 0; n && n !== document.body && d < 5; n = n.parentElement, d++) {
      const t = norm(n.textContent); if (!t || t.length > 700) continue;
      const hit = p.find((l) => norm(l.value) === t); if (hit) return { el: n, leaf: hit };
    }
    return null;
  }
  function bgUrl(el) { const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(el).backgroundImage || ''); return m ? m[1] : ''; }
  function findImage(el) {
    for (let n = el, d = 0; n && n !== document.body && d < 4; n = n.parentElement, d++) { const u = n.tagName === 'IMG' ? (n.currentSrc || n.src) : bgUrl(n); if (u) return n; }
    return null;
  }
  function closeSheet() { if (sheet) { sheet.remove(); sheet = null; parent.postMessage({ type: 'iedsheet', open: false }, '*'); } }
  function openSheet(hit) {
    closeSheet(); const el = hit.el; el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const lines = hit.leaf.value.split('\n').length, ta = document.createElement('textarea'); ta.value = hit.leaf.value; ta.rows = Math.min(6, Math.max(2, lines));
    sheet = document.createElement('div'); sheet.className = 'ied-sheet'; sheet.innerHTML = '<small>Matnni o\'zgartiring</small><div class="r"><button class="no" type="button">Bekor</button><button class="ok" type="button">Saqlash</button></div><div class="hint">*so\'z* — qiya (ajratilgan) ko\'rinadi</div>';
    sheet.insertBefore(ta, sheet.querySelector('.r')); document.body.appendChild(sheet); parent.postMessage({ type: 'iedsheet', open: true }, '*');
    const save = () => { const v = ta.value.slice(0, 1500); closeSheet(); if (v !== hit.leaf.value) parent.postMessage({ type: 'edit', path: hit.leaf.path, value: v }, '*'); };
    sheet.querySelector('.ok').onclick = save; sheet.querySelector('.no').onclick = closeSheet;
    ta.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save(); });
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 60);
  }
  addEventListener('message', (e) => {
    if (e.source !== parent || !e.data) return;
    if (e.data.type === 'site') { LD = e.data.data; if (on) setTimeout(mark, 80); }
    if (e.data.type === 'editmode') { on = !!e.data.on; document.documentElement.classList.toggle('ied-on', on); if (!on) closeSheet(); else mark(); }
  });
  // tahrirlanadigan joylarni belgilash (kompyuterda ko'rinadi)
  function mark() {
    document.querySelectorAll('[data-ied]').forEach((n) => n.removeAttribute('data-ied'));
    if (!on || !LD) return; let c = 0;
    document.querySelectorAll('h1,h2,h3,h4,p,li,span,a,button,small,b,em,strong,label').forEach((n) => { if (c > 400 || n.closest('.ied-sheet') || n.children.length > 3 || !n.textContent.trim()) return; const h = findText(n); if (h && h.el === n) { n.setAttribute('data-ied', ''); c++; } });
  }
  document.addEventListener('click', (e) => {
    if (!on || e.target.closest('.ied-sheet')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const t = findText(e.target);
    if (t) return openSheet(t);
    const im = findImage(e.target);
    if (im) { const sec = im.closest('[data-sec]'); parent.postMessage({ type: 'opensec', sec: sec ? sec.dataset.sec : '', why: 'image' }, '*'); return; }
    const sec = e.target.closest('[data-sec]'); if (sec && e.target.textContent.trim()) parent.postMessage({ type: 'opensec', sec: sec.dataset.sec, why: 'text' }, '*');
  }, true);
  document.addEventListener('submit', (e) => { if (on) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  window.__ied = { findText };
  parent.postMessage({ type: 'iedready' }, '*');
})();
