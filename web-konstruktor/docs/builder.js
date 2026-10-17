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
  /* ---------- Sotib olish, yuklab olish va joylash ---------- */
  let payInfo = null, stats = null, busy = false;
  const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ');
  const tp = () => (pricing.templatePrice || { usd: 10, rate: 12800 });
  const paid = () => !!(P && P.paid);
  const contactBtns = () => {
    const c = (pricing.contacts || {}); const tel = c.phone || '+998 33 623 33 13';
    return `<a class="b g w" style="margin-top:8px" href="tel:${esc(String(tel).replace(/[^\d+]/g, ''))}">${icon('tel')} ${esc(tel)}</a>${c.telegram ? `<a class="b g w" style="margin-top:8px" target="_blank" rel="noopener" href="https://t.me/${esc(String(c.telegram).replace(/^@/, ''))}">Telegram: ${esc(c.telegram)}</a>` : ''}`;
  };
  function buyBox() {
    const price = `<div class="pricebox"><div><b>$${esc(String(tp().usd))}</b><span>bir martalik to'lov</span></div><small>≈ ${money(Math.round(tp().usd * tp().rate))} so'm</small></div>
      <ul class="incl"><li>Tayyor saytni yuklab olish (bitta mustaqil fayl)</li><li>Subdomenda joylash: <b>nomingiz.${esc(pricing.rootDomain || 'improuzbekiston.uz')}</b></li><li>O'z domeningizni ulash</li><li>Telefonga ilova kabi o'rnatiladi, Google uchun SEO sozlangan</li><li>Statistika va kelgan buyurtmalar kabinetda</li></ul>`;
    if (!useAcc) return `${price}<p class="hint">Sotib olish uchun biz bilan bog'laning, saytingizni darrov tayyorlab beramiz.</p>${contactBtns()}<button class="b g w" style="margin-top:8px" data-x="mail">Pochta orqali so'rov yuborish</button><div class="hint">Tayyor sayt faqat to'lovdan keyin beriladi. Oldindan ko'rish va tahrirlash bepul.</div>`;
    const pm = pricing.payMethods || {};
    if (payInfo && payInfo.manual) {
      const c = payInfo.contacts || {};
      return `${price}<div class="guide" style="margin-top:12px"><b>To'lov so'rovingiz qabul qilindi (#${esc(payInfo.payment.id)})</b><br>Summa: <b>$${esc(String(payInfo.payment.usd))}</b> (${money(payInfo.payment.uzs)} so'm).${payInfo.text ? `<br>${esc(payInfo.text)}` : ''}<br>To'lov qilgach, admin tasdiqlaydi va sayt ochiladi. ${c.phone ? `Aloqa: <b>${esc(c.phone)}</b>` : ''}${c.telegram ? `, <b>${esc(c.telegram)}</b>` : ''}</div><button class="b g w" style="margin-top:10px" data-x="recheck">To'lovni tekshirish</button>`;
    }
    return `${price}<div class="msg" id="buyMsg"></div>${pm.payme ? `<button class="b w" style="margin-top:8px;padding:14px" data-x="buy" data-m="payme">Payme orqali to'lash</button>` : ''}${pm.click ? `<button class="b w" style="margin-top:8px;padding:14px" data-x="buy" data-m="click">Click orqali to'lash</button>` : ''}<button class="b ${pm.payme || pm.click ? 'g' : ''} w" style="margin-top:8px;padding:14px" data-x="buy" data-m="manual">${pm.payme || pm.click ? "Boshqa usul (karta, Telegram)" : "Sotib olish"}</button><div class="hint">Oldindan ko'rish va tahrirlash bepul. To'lovdan keyin sayt yuklab olinadi yoki joylanadi.</div>`;
  }
  function ownBox() {
    const url = P.published ? (P.url || '') : '';
    const st = stats ? `<div class="guide" style="margin-top:10px">So'nggi 30 kunda: <b>${stats.views}</b> tashrif, <b>${stats.orders}</b> buyurtma.</div>` : '';
    return `<div class="chk ok"><span>✓</span><span><b>Sayt sotib olingan.</b> Endi yuklab olishingiz yoki joylashingiz mumkin.</span></div>
      <h4>1. Yuklab olish</h4><button class="b w" style="padding:14px" data-x="dl">${icon('download')} Saytni yuklab olish (.html)</button><div class="hint">Bitta fayl: istalgan hostingga yuklang (masalan, netlify.com/drop).</div>
      <h4>2. Subdomenda joylash</h4>${url ? `<div class="chk ok"><span>✓</span><span>Joylangan: <a href="${esc(url)}" target="_blank" rel="noopener"><b>${esc(url.replace(/^https?:\/\//, ''))}</b></a></span></div>${st}<button class="b g w" style="margin-top:8px" data-x="unpub">Joylashni to'xtatish</button>` : `<label class="f">Sayt manzili</label><div style="display:flex;gap:6px;align-items:center"><input id="slug" type="text" maxlength="30" placeholder="masalan, lola-salon" value="${esc(P.slug || '')}"><span class="hint" style="white-space:nowrap">.${esc(pricing.rootDomain || 'domen')}</span></div><div class="msg" id="pubMsg"></div><button class="b w" style="margin-top:8px;padding:12px" data-x="pub">Joylash</button>`}
      ${url ? `<h4>3. O'z domeningiz</h4><input id="cdom" type="text" placeholder="masalan, lolasalon.uz" value="${esc(P.customDomain || '')}"><div class="hint">Domen A yozuvini server IP manziliga yo'naltiring, so'ng shu yerga yozing. Aniq IP manzilni Impro IT dan so'rang.</div><div class="msg" id="domMsg"></div><button class="b g w" style="margin-top:8px" data-x="dom">Domenni saqlash</button>` : ''}`;
  }
  async function downloadPaid() {
    if (busy) return; busy = true;
    try {
      const r = await fetch(`${Auth.api || ''}/api/my/projects/${P.id}/export`, { headers: { Authorization: 'Bearer ' + Auth.token() } });
      if (!r.ok) { let m = ''; try { m = (await r.json()).error; } catch { /* ignore */ } throw new Error(m || 'Yuklab bo\'lmadi'); }
      const blob = await r.blob(), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = slug() + '.html'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { toast(e.message); } busy = false;
  }
  async function refreshProject() { try { const j = await Auth.request(`/api/my/projects/${P.id}`); P = j.project; } catch { /* ignore */ } }
  async function loadStats() { if (!useAcc || !paid() || !P.published) return; try { stats = await Auth.request(`/api/my/projects/${P.id}/stats`); ed.render(true); } catch { /* ignore */ } }
  async function waitPaid() {
    for (let i = 0; i < 25 && P && !paid(); i++) { await new Promise((r) => setTimeout(r, 3000)); await refreshProject(); }
    if (paid()) { toast("To'lov qabul qilindi! Rahmat."); if (ed) ed.render(true); }
  }
  async function buy(method) {
    const m = $('#buyMsg'); if (m) { m.className = 'msg'; m.textContent = ''; }
    try {
      await save();
      const j = await Auth.request(`/api/my/projects/${P.id}/checkout`, { method: 'POST', body: { method } });
      if (j.paid) { await refreshProject(); ed.render(true); return; }
      if (j.manual) { payInfo = j; ed.render(true); return; }
      if (j.payUrl) location.href = j.payUrl;
    } catch (e) { if (m) { m.className = 'msg bad'; m.textContent = e.message; } else toast(e.message); }
  }
  async function publish() {
    const m = $('#pubMsg'); m.className = 'msg'; m.textContent = '';
    try { await save(); const j = await Auth.request(`/api/my/projects/${P.id}/publish`, { method: 'POST', body: { slug: ($('#slug') || {}).value || '' } }); P = j.project; toast('Sayt joylandi!'); ed.render(true); loadStats(); }
    catch (e) { m.className = 'msg bad'; m.textContent = e.message; }
  }
  async function setDomain() {
    const m = $('#domMsg'); m.className = 'msg'; m.textContent = '';
    try { const j = await Auth.request(`/api/my/projects/${P.id}/domain`, { method: 'POST', body: { domain: ($('#cdom') || {}).value || '' } }); P = j.project; m.className = 'msg okk'; m.textContent = 'Saqlandi'; }
    catch (e) { m.className = 'msg bad'; m.textContent = e.message; }
  }
  const tayyor = {
    id: 'ready', label: '✓ Tayyor',
    render() {
      const sub = P && P.status !== 'qoralama';
      return `<h4>Saytingiz holati</h4>${checks().map(([ok, t]) => `<div class="chk ${ok ? 'ok' : 'w'}"><span>${ok ? '✓' : '!'}</span><span>${esc(t)}</span></div>`).join('')}
        <h4>Saytingizni oling</h4>${useAcc && paid() ? ownBox() : buyBox()}
        <h4>Impro IT ga topshirish</h4>${useAcc ? (sub ? submittedBox() : submitBox()) : `<p class="hint">Saytni sizning o'rningizga to'liq tayyorlab, joylab beramiz.</p><button class="b g w" data-x="mail">Pochta orqali so'rov yuborish</button>`}
        <h4>Loyihani saqlash</h4><p class="hint">Boshqa kompyuterda davom ettirish uchun (bepul).</p><button class="b g w" data-x="json">Loyiha faylini yuklab olish (.json)</button><label class="b g w" style="margin-top:8px;cursor:pointer">Loyiha faylini ochish<input type="file" accept=".json,application/json" data-import hidden></label>
        <h4>Boshqa shablon</h4><button class="b g w" data-x="tpl">Shablonni almashtirish</button><div class="hint">Sayt nomi va aloqa ma'lumotlari saqlanib qoladi.</div>`;
    },
    click(e) {
      const x = e.target.closest('[data-x]'); if (!x) return;
      const a = x.dataset.x;
      if (a === 'dl') downloadPaid();
      if (a === 'buy') buy(x.dataset.m);
      if (a === 'recheck') refreshProject().then(() => { if (paid()) toast("To'lov tasdiqlandi!"); else toast("Hali tasdiqlanmagan. To'lovdan keyin biroz kuting."); ed.render(true); });
      if (a === 'pub') publish();
      if (a === 'unpub') Auth.request(`/api/my/projects/${P.id}/publish`, { method: 'DELETE' }).then((j) => { P = j.project; stats = null; ed.render(true); }).catch((er) => toast(er.message));
      if (a === 'dom') setDomain();
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
  let catFilter = '', query = '';
  const norm = (v) => String(v || '').toLowerCase().replace(/[ʻʼ'’`]/g, '');
  function drawGallery() {
    const all = window.TEMPLATES, q = norm(query).trim();
    const hit = (t) => !q || norm([t.name, t.cat, t.desc, (t.tags || []).join(' ')].join(' ')).includes(q);
    const cats = ['', ...new Set(all.map((t) => t.cat))];
    $('#cats').innerHTML = cats.map((c) => `<button data-cat="${esc(c)}" class="${c === catFilter ? 'on' : ''}">${esc(c || 'Hammasi')}<small>${all.filter((t) => (!c || t.cat === c) && hit(t)).length}</small></button>`).join('');
    const list = all.filter((t) => (!catFilter || t.cat === catFilter) && hit(t));
    if ($('#nT')) $('#nT').textContent = all.length + '';
    $('#cnt').textContent = list.length ? `${list.length} ta shablon` : '';
    $('#tgrid').innerHTML = list.length ? list.map((t) => `<article class="tc"><div class="tci"><img src="${esc(t.thumb)}" alt="${esc(t.name)}" loading="lazy" onerror="this.remove()">${t.badge ? `<span class="bd">${esc(t.badge)}</span>` : ''}</div><div class="tcb"><small>${esc(t.cat)}</small><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="row"><button class="b g" data-prev="${t.id}">${icon('eye')} Ko'rish</button><button class="b" data-pick="${t.id}">Tanlash</button></div></div></article>`).join('') : `<div class="noRes" style="grid-column:1/-1"><b>Hech narsa topilmadi</b><p style="margin-top:6px">Boshqa so'z bilan qidirib ko'ring yoki <a href="#" data-cat="" style="color:var(--acc);font-weight:600">hammasini ko'rsating</a>.</p></div>`;
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
  /* ---------- AI yordamchi ---------- */
  const digitsOf = (v) => { const n = parseInt(String(v == null ? '' : v).replace(/[^\d]/g, ''), 10); return Number.isFinite(n) && n > 0 ? n : 0; };
  function localMatch(desc) {
    const d = ' ' + desc.toLowerCase().replace(/[ʻʼ'’`]/g, '') + ' '; let best = null, bs = 0;
    for (const t of window.TEMPLATES) {
      let sc = 0;
      for (const w of [t.id, t.name, t.cat, ...(t.tags || [])]) { const x = String(w || '').toLowerCase().replace(/[ʻʼ'’`]/g, '').trim(); if (x.length < 3) continue; if (d.includes(x)) sc += x.length > 4 ? 3 : 2; else if (x.length > 5 && d.includes(x.slice(0, x.length - 2))) sc += 1; }
      if (sc > bs) { bs = sc; best = t; }
    }
    const nm = /["«“]([^"»”]{2,40})["»”]/.exec(desc) || /\b([A-ZА-Я][\w'-]{2,20}(?:\s[A-ZА-Я][\w'-]{2,20})?)\s+(?:nomli|nomi|deb nomlangan)/.exec(desc);
    return { template: (best || window.TEMPLATES.find((t) => t.id === 'kompaniya') || window.TEMPLATES[0]).id, name: nm ? nm[1] : '' };
  }
  function applyAI(d, r) {
    if (r.name) { d.company.name = r.name; d.company.logo = r.name.trim()[0].toUpperCase(); }
    if (r.tagline) d.company.tagline = r.tagline;
    if (r.phone) d.contacts.phone = r.phone; if (r.address) d.contacts.address = r.address;
    const hero = d.sections.find((x) => x.type === 'hero');
    if (hero) { if (r.heroTitle) { hero.titleStart = r.heroTitle; hero.words = []; hero.titleEnd = ''; } if (r.heroText) hero.text = r.heroText; }
    if (r.about) { const st = d.sections.find((x) => x.type === 'statement'); if (st) st.text = r.about; else { const ab = d.sections.find((x) => x.type === 'about'); if (ab && 'text' in ab) ab.text = r.about; } }
    const list = d.sections.find((x) => ['services', 'features', 'bento', 'menu', 'products'].includes(x.type) && Array.isArray(x.items) && x.items.length);
    if (list && (r.services || []).length) {
      r.services.slice(0, list.items.length).forEach((sv, i) => {
        const it = list.items[i];
        if (list.type === 'menu' || list.type === 'products') { it.name = sv.title; if (sv.text) it.description = sv.text; if (sv.price) it.price = sv.price; if ('oldPrice' in it) it.oldPrice = 0; }
        else { it.title = sv.title; if (sv.text) it.text = sv.text; }
      });
    }
    const fq = d.sections.find((x) => x.type === 'faq');
    if (fq && (r.faq || []).length) fq.items = r.faq.map((f) => ({ q: f.q, a: f.a }));
    return d;
  }
  async function runAI() {
    const el = $('#aiq'), msg = $('#aiMsg'), btn = $('#aiGo'), desc = (el.value || '').trim();
    msg.className = 'msg'; if (desc.length < 8) { msg.className = 'msg bad'; msg.textContent = 'Biznesingiz haqida kamida bir jumla yozing'; el.focus(); return; }
    btn.disabled = true; msg.textContent = 'Sayt tayyorlanmoqda…';
    try {
      let res;
      if (useAcc) res = await Auth.request('/api/ai/generate', { method: 'POST', body: { description: desc, templates: window.TEMPLATES.map((t) => ({ id: t.id, name: t.name, cat: t.cat, tags: t.tags || [] })) } });
      else { const m = localMatch(desc); res = { ai: false, result: { template: m.template, name: m.name, services: [], faq: [] } }; }
      const r = res.result; if (!window.getTemplate(r.template)) throw new Error('Mos shablon topilmadi');
      $('#gallery').dataset.switch = '';
      await pick(r.template, r);
      toast(res.ai ? 'AI saytingizni tayyorladi. Endi xohlaganingizcha tahrirlang.' : "Mos shablon tanlandi. Matnlarni o'zingiz tahrirlang.");
    } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
    btn.disabled = false;
  }
  async function pick(id, ai) {
    const switching = $('#gallery').dataset.switch === '1' && D;
    const d = E.normalize(window.getTemplate(id)); delete d.account;
    if (ai) applyAI(d, ai);
    if (switching) {
      const o = D; d.company.name = o.company.name || d.company.name; d.company.logo = o.company.logo || d.company.logo; d.company.tagline = o.company.tagline || d.company.tagline; d.company.logoImage = o.company.logoImage || '';
      d.contacts = Object.assign({}, d.contacts, Object.fromEntries(Object.entries(o.contacts || {}).filter(([, v]) => v)));
      d.orders.currency = (o.orders && o.orders.currency) || d.orders.currency;
      tplId = id; D = d; dirty = true; showEditor(); changed(); toast("Shablon almashtirildi. Ma'lumotlaringiz saqlandi."); return;
    }
    try { await openData(d, id, null); } catch (e) { toast(e.message); }
  }
  async function openProject(id) {
    try {
      const wasPaid = new URLSearchParams(location.search).get('paid') === '1';
      const j = await Auth.request(`/api/my/projects/${id}`); await openData(E.normalize(j.data), j.project.template, j.project);
      if (wasPaid) { try { ed.setTab('ready'); } catch { /* ignore */ } if (!paid()) waitPaid(); }
      if (paid() && P.published) loadStats();
    } catch (e) { toast(e.message); showGallery(false); }
  }

  /* ---------- Hodisalar ---------- */
  document.addEventListener('input', (e) => { if (e.target.id === 'tq') { query = e.target.value; drawGallery(); } });
  document.addEventListener('click', (e) => { if (e.target.closest('#aiGo')) runAI(); });
  document.addEventListener('keydown', (e) => { if (e.target.id === 'aiq' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runAI(); });
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.cat !== undefined) { e.preventDefault(); catFilter = t.dataset.cat; if (!t.closest('#cats')) { query = ''; const q = $('#tq'); if (q) q.value = ''; } drawGallery(); }
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
