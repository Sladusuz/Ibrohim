'use strict';
// Mijoz konstruktori: shablon tanlash -> tahrirlash -> yuklab olish yoki Impro IT ga yuborish.
// Hisob (server) bo'lsa loyihalar bazada saqlanadi; bo'lmasa brauzerda (localStorage).
(function () {
  const E = window.E, Auth = window.Auth;
  const { esc } = E;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = (n) => window.svgIcon(n);
  const IMPRO_EMAIL = 'chempme@gmail.com';
  const LOCAL_KEY = 'impro_builder_v2';
  const useAcc = !!(Auth && Auth.enabled);
  const STATUS = { qoralama: 'Qoralama', yuborilgan: 'Yuborilgan', korilmoqda: "Ko'rib chiqilmoqda", narx: 'Narx belgilandi', joylandi: 'Joylandi', bekor: 'Bekor qilindi' };

  let D = null, P = null, tplId = '', ed = null, previewReady = false, pt = null, st = null, pricing = { plans: [] }, myProjects = [], dirty = false, saving = false;
  const ls = { get() { try { return localStorage.getItem(LOCAL_KEY); } catch { return null; } }, set(v) { try { localStorage.setItem(LOCAL_KEY, v); return true; } catch { return false; } }, del() { try { localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ } } };
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2800); };
  const status = (txt, cls) => { const s = $('#st'); s.textContent = '● ' + txt; s.className = 'st ' + (cls || ''); };
  const slug = () => ((D.company.name || 'sayt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sayt');
  const clean = () => { const c = JSON.parse(JSON.stringify(D)); delete c.notify; c.account = { enabled: false }; return c; };
  const tplName = (id) => ((window.TEMPLATES.find((t) => t.id === id) || {}).name) || id || '';

  /* ---------- Ko'rinish (jonli) ---------- */
  function sendPreview() { const f = $('#if'); if (previewReady && f.contentWindow && D) f.contentWindow.postMessage({ type: 'site', data: clean() }, '*'); }
  addEventListener('message', (e) => { if (e.data && e.data.type === 'ready' && e.source === $('#if').contentWindow) { previewReady = true; sendPreview(); } });
  // Ishonchlilik uchun: iframe yuklanishi bilan ham ma'lumot yuboriladi (ready xabari erta kelib qolsa)
  $('#if').addEventListener('load', () => { previewReady = true; sendPreview(); });

  /* ---------- Saqlash ---------- */
  function changed() {
    dirty = true; status('Saqlanmoqda…', 'dirty');
    clearTimeout(pt); pt = setTimeout(sendPreview, 180);
    clearTimeout(st); st = setTimeout(save, useAcc && P ? 1400 : 500);
  }
  async function save() {
    if (!D) return;
    ls.set(JSON.stringify({ tplId, D, pid: P && P.id }));
    if (!(useAcc && P)) { dirty = false; status('Brauzerda saqlandi'); return; }
    if (saving) { clearTimeout(st); st = setTimeout(save, 800); return; }
    saving = true;
    try {
      const j = await Auth.request(`/api/my/projects/${P.id}`, { method: 'PUT', body: { data: clean(), name: D.company.name, template: tplId } });
      P = j.project; dirty = false; status('Hisobingizda saqlandi');
    } catch (e) { status(e.status === 401 ? 'Qayta kiring' : 'Saqlanmadi', 'bad'); if (e.status !== 401) toast(e.message); }
    saving = false;
  }
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Rasm ---------- */
  function toDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return reject(new Error('Faqat PNG, JPG, WEBP yoki GIF rasm'));
      const rd = new FileReader(); rd.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
      rd.onload = () => {
        if (file.type === 'image/gif') return file.size > 1.5e6 ? reject(new Error('GIF 1.5 MB dan oshmasin')) : resolve(rd.result);
        const img = new Image(); img.onerror = () => reject(new Error('Rasm ochilmadi'));
        img.onload = () => { const k = Math.min(1, 1200 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); resolve(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.82)); };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }
  // Shablon rasmlarini (/img/...) faylga joylash: yuklab olingan sayt mustaqil ishlashi uchun
  async function inlineImages(data) {
    const urls = new Set(); (function walk(o) { if (typeof o === 'string') { if (/^\/img\/.+\.svg$/.test(o)) urls.add(o); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); })(data);
    const map = {};
    await Promise.all([...urls].map(async (u) => { try { const r = await fetch(u); if (!r.ok) return; const t = await r.text(); map[u] = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(t))); } catch { /* ignore */ } }));
    return JSON.parse(JSON.stringify(data, (k, v) => (typeof v === 'string' && map[v] ? map[v] : v)));
  }
  function saveFile(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  async function downloadSite() {
    try {
      const r = await fetch('/shablon.html', { cache: 'no-store' }); if (!r.ok) throw new Error('x');
      const tpl = await r.text(), MARK = '/*__DATA__*/null'; if (!tpl.includes(MARK)) throw new Error('x');
      const data = await inlineImages(clean());
      saveFile(slug() + '.html', tpl.replace(MARK, () => JSON.stringify(data).replace(/</g, '\\u003c')), 'text/html');
      toast('Sayt yuklab olindi');
    } catch { toast("Yuklab bo'lmadi. Sahifani yangilab, qayta urinib ko'ring."); }
  }
  async function exportJson() { saveFile(slug() + '-loyiha.json', JSON.stringify(await inlineImages(clean()), null, 2), 'application/json'); }
  function importJson(file) {
    const rd = new FileReader();
    rd.onload = async () => {
      try { const j = JSON.parse(rd.result); if (!j || !Array.isArray(j.sections) || !j.company) throw 0; await openData(E.normalize(j), j.template || 'kompaniya'); toast('Loyiha ochildi'); }
      catch { toast('Bu fayl loyiha fayli emas'); }
    };
    rd.readAsText(file);
  }

  /* ---------- Narxlar va yuborish ---------- */
  async function loadPricing() {
    try { const r = await fetch((Auth && Auth.api) + '/api/pricing'); if (r.ok) { pricing = await r.json(); return; } } catch { /* ignore */ }
    try { const r = await fetch('/pricing.json'); if (r.ok) pricing = await r.json(); } catch { /* ignore */ }
  }
  let chosenPlan = '';
  function checks() {
    const c = [], name = (D.company.name || '').trim();
    c.push([name && name !== 'Kompaniyangiz nomi', name ? 'Sayt nomi kiritilgan' : "Sayt nomini yozing («Sayt» bo'limi)"]);
    c.push([!!D.contacts.phone, D.contacts.phone ? 'Telefon raqami kiritilgan' : "Telefon raqamini yozing («Aloqa» bo'limi)"]);
    c.push([!!D.contacts.email, D.contacts.email ? `Xabarlar ${D.contacts.email} ga tushadi` : "Email yozing, aks holda yuborilgan xabarlar sizga kelmaydi («Aloqa» bo'limi)"]);
    const sec = D.sections.filter((s) => s.enabled !== false).length; c.push([sec >= 3, `Saytda ${sec} ta bo'lim ko'rinadi`]);
    return c;
  }
  const tayyor = {
    id: 'ready', label: '✓ Tayyor',
    render() {
      const sub = P && P.status !== 'qoralama';
      return `<h4>Saytingiz holati</h4>${checks().map(([ok, t]) => `<div class="chk ${ok ? 'ok' : 'w'}"><span>${ok ? '✓' : '!'}</span><span>${esc(t)}</span></div>`).join('')}
        <h4>1. Tayyor saytni olish</h4><button class="b w" style="padding:14px" data-x="download">${icon('download')} Saytni yuklab olish (.html)</button><div class="hint">Bitta fayl. Brauzerda oching yoki istalgan hostingga yuklang. Buyurtma va xabarlar emailingizga yuboriladi.</div>
        <div class="guide"><b>Internetga qanday joylash?</b><ol><li>netlify.com/drop sahifasini oching</li><li>Yuklab olingan faylni (index.html deb nomlab) sudrab tashlang</li><li>Tayyor havolani oling, o'z domeningizni keyin ulaysiz</li></ol></div>
        <h4>2. Impro IT ga topshirish</h4>${useAcc ? (sub ? submittedBox() : submitBox()) : `<p class="hint">Saytingizni joylab, domenga ulab beramiz.</p><button class="b g w" data-x="mail">Pochta orqali so'rov yuborish</button><div class="hint">Avval loyihani fayl qilib saqlab, xatga ilova qiling.</div>`}
        <h4>3. Loyihani saqlash</h4><p class="hint">Boshqa kompyuterda davom ettirish uchun.</p><button class="b g w" data-x="json">Loyiha faylini yuklab olish (.json)</button><label class="b g w" style="margin-top:8px;cursor:pointer">Loyiha faylini ochish<input type="file" accept=".json,application/json" data-import hidden></label>
        <h4>Boshqa shablon</h4><button class="b g w" data-x="tpl">Shablonni almashtirish</button><div class="hint">Sayt nomi va aloqa ma'lumotlari saqlanib qoladi.</div>`;
    },
    click(e) {
      const x = e.target.closest('[data-x]'); if (!x) return;
      const a = x.dataset.x;
      if (a === 'download') downloadSite();
      if (a === 'json') exportJson();
      if (a === 'mail') mailRequest();
      if (a === 'tpl') showGallery(true);
      if (a === 'submit') submitProject();
      if (a === 'plan') { chosenPlan = x.dataset.id; ed.render(true); }
    },
    change(e) { if (e.target.hasAttribute('data-import') && e.target.files[0]) importJson(e.target.files[0]); },
  };
  function planCards() {
    const ps = pricing.plans || []; if (!ps.length) return '';
    return `<div class="plans">${ps.map((p) => `<div class="plan2 ${p.popular ? 'pop' : ''}" ${useAcc ? `data-x="plan" data-id="${esc(p.id)}" style="cursor:pointer;${chosenPlan === p.id ? 'outline:2px solid var(--acc)' : ''}"` : ''}><b>${esc(p.name)}</b><div class="pr">${esc(p.price)} ${p.price && /\d/.test(p.price) ? esc(pricing.currency || '') : ''}<small>${esc(p.period || '')}</small></div><ul>${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  }
  function submitBox() {
    return `<p class="hint">Tarifni tanlang va so'rov yuboring. Biz siz bilan bog'lanamiz.</p>${planCards()}<label class="f">Izoh (ixtiyoriy)</label><textarea id="subNote" rows="3" maxlength="800" placeholder="Domen nomi, qo'shimcha istaklar..."></textarea><div class="msg" id="subMsg"></div><button class="b w" style="margin-top:10px;padding:14px" data-x="submit">So'rovni yuborish</button>`;
  }
  function submittedBox() {
    return `<div class="chk ok"><span>✓</span><span><b>So'rov yuborilgan</b>. Holat: <b>${esc(STATUS[P.status] || P.status)}</b></span></div>${P.price ? `<div class="guide" style="margin-top:10px"><b>Impro IT narxi: ${esc(P.price)}</b></div>` : ''}${P.adminNote ? `<div class="guide">${esc(P.adminNote)}</div>` : ''}<p class="hint">Sayt o'zgartirilsa ham, so'rov ma'lumotlari yangilanib turadi.</p>`;
  }
  async function submitProject() {
    const m = $('#subMsg'); m.className = 'msg'; m.textContent = '';
    if (!chosenPlan && (pricing.plans || []).length) { m.className = 'msg bad'; m.textContent = 'Avval tarifni tanlang'; return; }
    try {
      await save();
      const plan = (pricing.plans || []).find((p) => p.id === chosenPlan);
      const j = await Auth.request(`/api/my/projects/${P.id}/submit`, { method: 'POST', body: { plan: plan ? plan.name : '', note: ($('#subNote') || {}).value || '' } });
      P = j.project; toast("So'rov yuborildi! Tez orada bog'lanamiz."); ed.render(true);
    } catch (e) { m.className = 'msg bad'; m.textContent = e.message; }
  }
  function mailRequest() {
    const body = ['Salom! Men Impro IT konstruktorida sayt tayyorladim.', '', `Sayt: ${D.company.name || ''}`, `Shablon: ${tplName(tplId)}`, `Telefon: ${D.contacts.phone || ''}`, `Email: ${D.contacts.email || ''}`, '', "Saytni joylab, domenga ulab berishingizni so'rayman. Loyiha faylini ilova qildim."].join('\n');
    location.href = `mailto:${IMPRO_EMAIL}?subject=${encodeURIComponent("Sayt joylash so'rovi: " + (D.company.name || ''))}&body=${encodeURIComponent(body)}`;
  }

  /* ---------- Galereya ---------- */
  let catFilter = '';
  function drawGallery() {
    const cats = ['', ...new Set(window.TEMPLATES.map((t) => t.cat))];
    $('#cats').innerHTML = cats.map((c) => `<button data-cat="${esc(c)}" class="${c === catFilter ? 'on' : ''}">${esc(c || 'Hammasi')}</button>`).join('');
    $('#tgrid').innerHTML = window.TEMPLATES.filter((t) => !catFilter || t.cat === catFilter).map((t) => `<article class="tc"><div class="tci"><img src="${esc(t.thumb)}" alt="${esc(t.name)}" loading="lazy" onerror="this.remove()">${t.badge ? `<span class="bd">${esc(t.badge)}</span>` : ''}</div><div class="tcb"><small>${esc(t.cat)}</small><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="row"><button class="b g" data-prev="${t.id}">${icon('eye')} Ko'rish</button><button class="b" data-pick="${t.id}">Tanlash</button></div></div></article>`).join('');
    // davom ettirish / mening saytlarim
    const r = $('#resume'); r.hidden = true; r.innerHTML = '';
    if (useAcc && myProjects.length) {
      r.hidden = false; r.innerHTML = `<div class="rbox"><h4 style="margin:0 0 10px">Mening saytlarim</h4><div class="mine">${myProjects.map((p) => `<div class="pcard2"><div><b>${esc(p.name)}</b><span>${esc(tplName(p.template))} · ${esc(STATUS[p.status] || p.status)}</span></div><div class="row"><button class="b s" data-open="${p.id}">Tahrirlash</button><button class="b g s" data-del="${p.id}" title="O'chirish">✕</button></div></div>`).join('')}</div></div>`;
    } else if (!useAcc) {
      let saved = null; try { saved = JSON.parse(ls.get() || 'null'); } catch { saved = null; }
      if (saved && saved.D) { r.hidden = false; r.innerHTML = `<div class="rbox flex"><div><b>Saqlangan loyiha: ${esc((saved.D.company || {}).name || 'Nomsiz')}</b><span>${esc(tplName(saved.tplId))}. Davom ettirishingiz mumkin.</span></div><button class="b" data-resume="1">Davom ettirish</button></div>`; }
    }
  }
  function showGallery(fromEditor) {
    $('#gallery').hidden = false; $('#editor').hidden = true; $('#tbar').hidden = true; $('#gbar').hidden = false; document.body.dataset.mode = 'gallery';
    $('#gallery').dataset.switch = fromEditor ? '1' : '';
    drawGallery();
  }
  function showEditor() {
    $('#gallery').hidden = true; $('#editor').hidden = false; $('#tbar').hidden = false; $('#gbar').hidden = true; document.body.dataset.mode = 'editor';
    if (!ed) {
      ed = window.Editor.create({
        root: $('#panel'), tabsEl: $('#tabs'), data: () => D, onChange: changed, upload: toDataUrl, toast, focus: (id) => { const f = $('#if'); if (f.contentWindow) f.contentWindow.postMessage({ type: 'focus', id }, '*'); },
        extraTabs: [tayyor], startTab: 'sections', account: false,
      });
    } else ed.setTab('sections');
    sendPreview();
  }
  function previewModal(id) {
    const d = window.getTemplate(id), t = window.TEMPLATES.find((x) => x.id === id);
    const w = document.createElement('div'); w.className = 'modalx';
    w.innerHTML = `<div class="mx wide"><div class="pvh"><b>${esc(t.name)}</b><div style="display:flex;gap:8px"><button class="b" data-pick="${id}">Shu shablonni tanlash</button><button class="b g" data-closep>Yopish</button></div></div><iframe src="/shablon.html?preview=1" title="Ko'rish"></iframe></div>`;
    document.body.appendChild(w);
    const f = w.querySelector('iframe'), onmsg = (e) => { if (e.source === f.contentWindow && e.data && e.data.type === 'ready') f.contentWindow.postMessage({ type: 'site', data: d }, '*'); };
    addEventListener('message', onmsg); f.addEventListener('load', () => f.contentWindow.postMessage({ type: 'site', data: d }, '*'));
    w.addEventListener('click', (e) => { if (e.target.closest('[data-closep]') || e.target === w) { removeEventListener('message', onmsg); w.remove(); } if (e.target.closest('[data-pick]')) { removeEventListener('message', onmsg); w.remove(); pick(id); } });
  }

  /* ---------- Loyiha yaratish / ochish ---------- */
  async function openData(data, tid, project) {
    D = data; tplId = tid || D.template || ''; P = project || null; dirty = false;
    if (useAcc && !P) {
      const j = await Auth.request('/api/my/projects', { method: 'POST', body: { template: tplId, name: D.company.name, data: clean() } });
      P = j.project; myProjects.unshift(P);
    }
    ls.set(JSON.stringify({ tplId, D, pid: P && P.id })); status(useAcc ? 'Hisobingizda saqlandi' : 'Brauzerda saqlandi'); showEditor();
    $('#ttl').textContent = D.company.name || ''; history.replaceState(null, '', useAcc && P ? `?p=${P.id}` : location.pathname);
  }
  async function pick(id) {
    const switching = $('#gallery').dataset.switch === '1' && D;
    const d = E.normalize(window.getTemplate(id)); delete d.account;
    if (switching) {
      const o = D; d.company.name = o.company.name || d.company.name; d.company.logo = o.company.logo || d.company.logo; d.company.tagline = o.company.tagline || d.company.tagline; d.company.logoImage = o.company.logoImage || '';
      d.contacts = Object.assign({}, d.contacts, Object.fromEntries(Object.entries(o.contacts || {}).filter(([, v]) => v)));
      d.orders.currency = (o.orders && o.orders.currency) || d.orders.currency;
      tplId = id; D = d; dirty = true; showEditor(); changed(); toast("Shablon almashtirildi. Ma'lumotlaringiz saqlandi."); return;
    }
    try { await openData(d, id, null); } catch (e) { toast(e.message); }
  }
  async function openProject(id) {
    try { const j = await Auth.request(`/api/my/projects/${id}`); await openData(E.normalize(j.data), j.project.template, j.project); }
    catch (e) { toast(e.message); showGallery(false); }
  }

  /* ---------- Hodisalar ---------- */
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.cat !== undefined) { catFilter = t.dataset.cat; drawGallery(); }
    if (t.dataset.prev) previewModal(t.dataset.prev);
    if (t.dataset.pick && !t.closest('.modalx')) pick(t.dataset.pick);
    if (t.dataset.open) openProject(t.dataset.open);
    if (t.dataset.resume) { try { const s = JSON.parse(ls.get()); await openData(E.normalize(s.D), s.tplId, null); } catch { toast('Ochib bo\'lmadi'); } }
    if (t.dataset.del && confirm("Bu sayt o'chirilsinmi? Qaytarib bo'lmaydi.")) { try { await Auth.request(`/api/my/projects/${t.dataset.del}`, { method: 'DELETE' }); myProjects = myProjects.filter((p) => p.id !== t.dataset.del); drawGallery(); toast("O'chirildi"); } catch (er) { toast(er.message); } }
    if (t.id === 'btnTpl') showGallery(true);
    if (t.id === 'btnDone') { ed.setTab('ready'); }
    if (t.id === 'btnOut') { Auth.logout(); location.reload(); }
    if (t.closest('.dev') && t.dataset.d) { $$('.dev button').forEach((x) => x.classList.toggle('on', x === t)); $('#fr').classList.toggle('m', t.dataset.d === 'm'); }
  });

  /* ---------- Boshlash ---------- */
  async function userBar() {
    const u = Auth && Auth.user(); const g = $('#gbar');
    g.innerHTML = (u ? `<a class="b g s" href="/kabinet.html">${icon('user')} ${esc(String(u.name).split(' ')[0])}</a><button class="b g s" id="btnOut">Chiqish</button>` : '') + '<a class="b g s" href="/">← Bosh sahifa</a>';
  }
  (async function init() {
    await loadPricing();
    if (useAcc) {
      await Auth.init();
      if (!Auth.user()) {
        $('#gallery').hidden = true; $('#gbar').innerHTML = '<a class="b g s" href="/">← Bosh sahifa</a>';
        const u = await Auth.modal({ closable: false, title: 'Sayt yaratish uchun kiring', text: "Hisob ochsangiz, saytlaringiz saqlanadi va istalgan qurilmadan davom ettira olasiz." });
        if (!u) return;
      }
      userBar();
      try { myProjects = await Auth.request('/api/my/projects'); } catch { myProjects = []; }
    }
    const q = new URLSearchParams(location.search);
    if (useAcc && q.get('p')) return openProject(q.get('p'));
    showGallery(false);
    if (q.get('t') && window.getTemplate(q.get('t'))) pick(q.get('t'));
  })();
})();
