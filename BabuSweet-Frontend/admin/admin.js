/* BabuSweet admin — serversiz (faqat brauzer). Qoralama brauzerda saqlanadi; "Nashr" bo'limi orqali saytga chiqariladi. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app'), LANGS = ['uz', 'ru', 'en'], LS = 'bs_draft', GH = 'bs_gh';
  const tri = (a = '', b = '', c = '') => ({ uz: a, ru: b, en: c });
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const ST = { active: 'Faol', soon: 'Tez orada', hidden: 'Yashirin' };
  const clone = o => JSON.parse(JSON.stringify(o));
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------- state ---------- */
  const PUBLISHED = window.BS_DATA ? clone(window.BS_DATA) : { settings: {}, products: [], news: [] };
  let D, view = 'dash', hasDraft = false;
  (function init() {
    try { const raw = store.get(LS); if (raw) { const x = JSON.parse(raw); if (x && Array.isArray(x.products)) { D = x; hasDraft = true; } } } catch (e) { /* ignore */ }
    if (!D) D = clone(PUBLISHED);
    D.news = D.news || []; D.settings = D.settings || {};
  })();
  let tt;
  function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : ''); clearTimeout(tt); tt = setTimeout(() => { t.className = ''; }, 3600); }
  function persist() {
    hasDraft = true;
    if (!store.set(LS, JSON.stringify(D))) toast('Brauzer xotirasi to‘ldi — rasmlarni kichikroq qiling', true);
  }
  const fdate = d => d ? new Date(d).toLocaleDateString('uz-UZ', { dateStyle: 'medium' }) : '';
  const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-') || uid();

  /* ---------- shell ---------- */
  const NAV = [['dash', '◧', 'Boshqaruv'], ['products', '◈', 'Mahsulotlar'], ['news', '✎', 'Yangiliklar'], ['settings', '⚙', 'Sozlamalar'], ['publish', '🚀', 'Nashr qilish']];
  function shell() {
    app.innerHTML = `<div class="shell"><aside class="side" id="side">
      <div class="brand"><svg viewBox="0 0 64 64"><use href="#mark"/></svg>BabuSweet</div>
      ${NAV.map(([k, i, n]) => `<a data-v="${k}" class="${view === k ? 'on' : ''}"><span>${i}</span>${n}${k === 'publish' && hasDraft ? '<span class="badge">!</span>' : ''}</a>`).join('')}
      <div class="sp"></div><a href="../index.html" target="_blank" rel="noopener"><span>↗</span>Saytni ochish</a></aside>
      <main class="main"><div class="top"><div class="row"><button class="btn burger" id="bg" aria-label="Menu">☰</button><h2 id="vt"></h2></div><div class="row" id="va"></div></div><div id="view"></div></main></div>`;
    $('#side').addEventListener('click', e => { const a = e.target.closest('[data-v]'); if (a) { view = a.dataset.v; shell(); } });
    $('#bg').onclick = () => $('#side').classList.toggle('open');
    ({ dash, products, news, settings, publish })[view]();
  }
  const title = (t, actions = '') => { $('#vt').textContent = t; $('#va').innerHTML = actions; };

  /* ---------- helpers: dialog, tri fields, images ---------- */
  function dialog(html) {
    const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
    o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); });
    document.body.appendChild(o); return o;
  }
  function triField(name, label, val = {}, area = false) {
    return `<div class="fieldset" data-tri="${name}"><legend>${label}</legend>
      <div class="tabs">${LANGS.map((l, i) => `<button type="button" data-l="${l}" class="${i ? '' : 'on'}">${l.toUpperCase()}</button>`).join('')}</div>
      ${LANGS.map((l, i) => area ? `<textarea data-l="${l}" ${i ? 'hidden' : ''}>${esc(val[l] || '')}</textarea>` : `<input data-l="${l}" value="${esc(val[l] || '')}" ${i ? 'hidden' : ''}>`).join('')}</div>`;
  }
  function wireTri(root) {
    $$('[data-tri]', root).forEach(fs => $$('.tabs button', fs).forEach(b => b.onclick = () => {
      $$('.tabs button', fs).forEach(x => x.classList.toggle('on', x === b));
      $$('[data-l]:not(button)', fs).forEach(i => { i.hidden = i.dataset.l !== b.dataset.l; });
    }));
  }
  const readTri = (root, name) => Object.fromEntries(LANGS.map(l => [l, $(`[data-tri="${name}"] [data-l="${l}"]:not(button)`, root).value.trim()]));
  function fileToDataUrl(file, max = 1200) {
    return new Promise((res, rej) => {
      if (!/^image\//.test(file.type)) return rej(new Error('Faqat rasm fayli'));
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        let opaque = true;
        try { const w = c.width - 1, h = c.height - 1; opaque = [[0, 0], [w, 0], [0, h], [w, h]].every(([px, py]) => x.getImageData(px, py, 1, 1).data[3] > 250); } catch (e) { /* ignore */ }
        let d = c.toDataURL('image/webp', .88); if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/png');
        res({ d, opaque });
      };
      img.onerror = () => rej(new Error('Rasm o‘qib bo‘lmadi'));
      img.src = u;
    });
  }
  function imgField(root, getVal, setVal) {
    const pv = $('.pv', root), inp = $('input[type=file]', root);
    const paint = () => { const v = getVal(); pv.style.backgroundImage = v ? `url("${v.startsWith('data:') ? v : '../' + v}")` : ''; pv.style.backgroundSize = 'contain'; pv.style.backgroundRepeat = 'no-repeat'; pv.style.backgroundPosition = 'center'; };
    paint();
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try { const r = await fileToDataUrl(f); setVal(r.d, r.opaque); paint(); toast(r.opaque ? 'Rasm tayyor (fonli — "Rasm fonli" belgisi yoqildi)' : 'Rasm tayyor (shaffof fon)'); } catch (e) { toast(e.message, true); }
    };
  }
  const imgSrc = v => (v && !v.startsWith('data:') ? '../' + v : v || '');

  /* ---------- dashboard ---------- */
  function dash() {
    title('Boshqaruv paneli');
    const P = D.products;
    $('#view').innerHTML = `<div class="grid4">
      <div class="stat"><b>${P.filter(p => p.status === 'active').length}</b><span>Faol mahsulotlar</span></div>
      <div class="stat"><b>${P.filter(p => p.status === 'soon').length}</b><span>Tez orada chiqadi</span></div>
      <div class="stat"><b>${D.news.filter(n => n.published).length}</b><span>E’lon qilingan yangiliklar</span></div>
      <div class="stat"><b>${hasDraft ? 'Bor' : 'Yo‘q'}</b><span>Nashr qilinmagan o‘zgarish</span></div></div>
    <div class="card"><h3>Tezkor amallar</h3><div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn pri" data-go="products" data-new="1">+ Mahsulot qo‘shish</button><button class="btn" data-go="news" data-new="1">+ Yangilik</button><button class="btn" data-go="publish">🚀 Nashr qilish</button><a class="btn" href="../index.html" target="_blank" rel="noopener">Saytni ko‘rish ↗</a></div></div>
    <div class="card"><h3>Qanday ishlaydi?</h3><ol style="color:var(--mute);padding-left:20px;display:grid;gap:6px">
      <li>Mahsulot yoki yangilik qo‘shing / tahrirlang. O‘zgarishlar <b>shu brauzerda</b> saqlanadi (qoralama).</li>
      <li>“Saytni ko‘rish” ni bossangiz, qoralamani sayt ichida ko‘rasiz (faqat siz).</li>
      <li>“Nashr qilish” bo‘limida o‘zgarishlarni hamma uchun saytga chiqarasiz.</li></ol></div>`;
    $$('[data-go]').forEach(b => b.onclick = () => { view = b.dataset.go; shell(); if (b.dataset.new) (view === 'products' ? prodForm() : newsForm()); });
  }

  /* ---------- products ---------- */
  function products() {
    title('Mahsulotlar', '<button class="btn pri" id="addp">+ Mahsulot qo‘shish</button>');
    $('#addp').onclick = () => prodForm();
    const list = [...D.products].sort((a, b) => (a.order || 0) - (b.order || 0));
    $('#view').innerHTML = list.length ? `<div class="plist">${list.map((p, i) => `<div class="prow"><img src="${esc(imgSrc(p.image))}" alt="" loading="lazy">
      <div><h4>${esc(p.name)}<span class="tag ${p.status}">${ST[p.status]}</span></h4><small><span class="dot" style="background:${esc(p.color)}"></span>${esc(p.flavor || '')} ${p.weight ? '· ' + esc(p.weight) : ''}</small></div>
      <div class="acts"><button class="btn sm" data-mv="-1" data-id="${p.id}" ${i === 0 ? 'disabled' : ''} aria-label="Yuqoriga">↑</button><button class="btn sm" data-mv="1" data-id="${p.id}" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Pastga">↓</button><button class="btn sm" data-edit="${p.id}">Tahrirlash</button><button class="btn sm danger" data-del="${p.id}">O‘chirish</button></div></div>`).join('')}</div>` : '<div class="empty">Hozircha mahsulot yo‘q</div>';
    $$('[data-edit]').forEach(b => b.onclick = () => prodForm(D.products.find(p => p.id === b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = () => { if (!confirm('Mahsulot o‘chirilsinmi?')) return; D.products = D.products.filter(p => p.id !== b.dataset.del); persist(); shell(); toast('O‘chirildi'); });
    $$('[data-mv]').forEach(b => b.onclick = () => {
      const s = [...D.products].sort((a, c) => (a.order || 0) - (c.order || 0)), i = s.findIndex(x => x.id === b.dataset.id), j = i + +b.dataset.mv;
      if (j < 0 || j >= s.length) return; [s[i], s[j]] = [s[j], s[i]]; s.forEach((x, k) => { x.order = k + 1; }); persist(); shell();
    });
  }
  function prodForm(p = null) {
    const x = p || { name: '', tagline: tri(), desc: tri(), flavor: 'Sea Salt Caramel', weight: '', category: 'Chocolate Candies', image: '', color: '#e9b24a', color2: '', status: 'active', badge: '', bg: false };
    let image = x.image, bg = !!x.bg, changed = false;
    const o = dialog(`<h3>${p ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h3><form class="form" novalidate>
      <div class="cols"><label>Nomi<input name="name" value="${esc(x.name)}" required maxlength="80"></label>
      <label>Holati<select name="status">${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${x.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
      <div class="upl"><div class="pv"></div><label>Rasm — eng yaxshisi SHAFFOF fonli PNG/WebP (mahsulot fonsiz kesilgan)<input type="file" accept="image/*"></label></div>
      <label class="chk"><input type="checkbox" name="bg" ${x.bg ? 'checked' : ''}> Rasm fonli (shaffof emas) — yumaloq burchakli rasm sifatida ko‘rsatiladi</label>
      ${triField('tagline', 'Qisqa tavsif', x.tagline)}${triField('desc', 'To‘liq tavsif', x.desc, true)}
      <div class="cols3"><label>Ta’mi<input name="flavor" value="${esc(x.flavor)}"></label><label>Og‘irligi<input name="weight" value="${esc(x.weight)}" placeholder="masalan, 40 g"></label><label>Turi<input name="category" value="${esc(x.category)}"></label></div>
      <div class="cols3"><label>Asosiy rang (sahifa fon rangi)<input type="color" name="color" value="${esc(x.color || '#e9b24a')}"></label><label>To‘q rang (ixtiyoriy)<input type="color" name="color2" value="${esc(x.color2 || '#2a1608')}"></label><label>Belgi (Bestseller…)<input name="badge" value="${esc(x.badge)}" maxlength="24"></label></div>
      <div class="err" role="alert"></div>
      <div class="actions"><button type="button" class="btn" data-x>Bekor qilish</button><button class="btn pri" type="submit">Saqlash</button></div></form>`);
    wireTri(o); imgField(o, () => image, (v, opaque) => { image = v; changed = true; $('input[name=bg]', o).checked = opaque; });
    $('[data-x]', o).onclick = () => o.remove();
    $('form', o).addEventListener('submit', e => {
      e.preventDefault(); const f = e.target, err = $('.err', o);
      if (!f.name.value.trim()) { err.textContent = 'Nomini kiriting'; return; }
      if (!image) { err.textContent = 'Rasm yuklang'; return; }
      const data = { name: f.name.value.trim(), status: f.status.value, image, tagline: readTri(o, 'tagline'), desc: readTri(o, 'desc'), flavor: f.flavor.value.trim(), weight: f.weight.value.trim(), category: f.category.value.trim(), color: f.color.value, color2: f.color2.value, badge: f.badge.value.trim(), bg: f.bg.checked };
      if (changed) data.thumb = '';
      if (p) Object.assign(p, data);
      else {
        let slug = slugify(data.name), n = 2; while (D.products.some(q => q.slug === slug)) slug = slugify(data.name) + '-' + n++;
        D.products.push({ id: uid(), slug, order: Math.max(0, ...D.products.map(q => q.order || 0)) + 1, ...data });
      }
      persist(); o.remove(); shell(); toast('Saqlandi (qoralama)');
    });
  }

  /* ---------- news ---------- */
  function news() {
    title('Yangiliklar', '<button class="btn pri" id="addn">+ Yangilik</button>');
    $('#addn').onclick = () => newsForm();
    const list = [...D.news].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    $('#view').innerHTML = list.length ? `<div class="plist">${list.map(n => `<div class="prow" style="grid-template-columns:1fr auto"><div><h4>${esc(n.title.uz || n.title.en || '—')}<span class="tag ${n.published ? 'active' : 'hidden'}">${n.published ? 'E’lon qilingan' : 'Qoralama'}</span></h4><small>${fdate(n.date)}</small></div><div class="acts"><button class="btn sm" data-edit="${n.id}">Tahrirlash</button><button class="btn sm danger" data-del="${n.id}">O‘chirish</button></div></div>`).join('')}</div>` : '<div class="empty">Yangilik yo‘q</div>';
    $$('[data-edit]').forEach(b => b.onclick = () => newsForm(D.news.find(n => n.id === b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = () => { if (!confirm('O‘chirilsinmi?')) return; D.news = D.news.filter(n => n.id !== b.dataset.del); persist(); shell(); });
  }
  function newsForm(n = null) {
    const x = n || { title: tri(), body: tri(), published: true, image: '' }; let image = x.image || '';
    const o = dialog(`<h3>${n ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}</h3><form class="form" novalidate>
      ${triField('title', 'Sarlavha', x.title)}${triField('body', 'Matn', x.body, true)}
      <div class="upl"><div class="pv"></div><label>Rasm (ixtiyoriy)<input type="file" accept="image/*"></label></div>
      <label class="chk"><input type="checkbox" name="published" ${x.published ? 'checked' : ''}> Saytda e’lon qilish</label>
      <div class="err" role="alert"></div><div class="actions"><button type="button" class="btn" data-x>Bekor qilish</button><button class="btn pri" type="submit">Saqlash</button></div></form>`);
    wireTri(o); imgField(o, () => image, v => { image = v; });
    $('[data-x]', o).onclick = () => o.remove();
    $('form', o).addEventListener('submit', e => {
      e.preventDefault(); const err = $('.err', o), title = readTri(o, 'title');
      if (!title.uz && !title.en && !title.ru) { err.textContent = 'Sarlavha kiriting'; return; }
      const data = { title, body: readTri(o, 'body'), image, published: e.target.published.checked };
      if (n) Object.assign(n, data); else D.news.push({ id: uid(), date: new Date().toISOString(), ...data });
      persist(); o.remove(); shell(); toast('Saqlandi (qoralama)');
    });
  }

  /* ---------- settings ---------- */
  function settings() {
    title('Sayt sozlamalari');
    const s = D.settings, soc = s.social || {}, hero = s.hero || {};
    const stats = (s.stats && s.stats.length ? s.stats : [{}, {}, {}, {}]);
    $('#view').innerHTML = `<form class="form" id="sf" novalidate>
      <div class="card form"><h3>Aloqa</h3><div class="cols"><label>Brend nomi<input name="brand" value="${esc(s.brand)}"></label><label>Telefon<input name="phone" value="${esc(s.phone)}"></label></div>
      <div class="cols"><label>Email (forma shu manzilga yuboradi)<input name="email" type="email" value="${esc(s.email)}"></label><label>Xarita havolasi (Google Maps)<input name="mapUrl" value="${esc(s.mapUrl)}"></label></div>
      <label>Manzil<input name="address" value="${esc(s.address)}"></label>${triField('hours', 'Ish vaqti', s.hours || {})}</div>
      <div class="card form"><h3>Bosh sahifa matnlari</h3>${triField('htitle', 'Sarlavha', hero.title || {})}${triField('hlead', 'Qisqa matn', hero.lead || {}, true)}</div>
      <div class="card form"><h3>Ijtimoiy tarmoqlar (to‘liq havola)</h3><p style="color:var(--mute);font-size:.9rem">Telegram havolasi kiritilsa, aloqa formasi xabarni nusxalab Telegramni ochadi.</p><div class="cols"><label>Telegram<input name="telegram" value="${esc(soc.telegram)}" placeholder="https://t.me/…"></label><label>Instagram<input name="instagram" value="${esc(soc.instagram)}" placeholder="https://instagram.com/…"></label><label>Facebook<input name="facebook" value="${esc(soc.facebook)}"></label><label>YouTube<input name="youtube" value="${esc(soc.youtube)}"></label></div></div>
      <div class="card form"><h3>Raqamlar (sayt statistikasi)</h3>${stats.map((x, i) => `<div class="fieldset" data-stat="${i}"><legend>Raqam ${i + 1}</legend><div class="cols3"><label>Qiymat<input type="number" min="0" name="sv${i}" value="${x.value ?? 0}"></label><label>Qo‘shimcha (+, %, /7)<input name="ss${i}" value="${esc(x.suffix || '')}" maxlength="6"></label><span></span></div>${triField('sl' + i, 'Yozuv', x.label || {})}</div>`).join('')}</div>
      <div class="card form"><h3>Eksport yo‘nalishlari (globusda ko‘rinadi)</h3><label>Vergul bilan ajrating (masalan: Kazakhstan, Turkey, UAE)<input name="regions" value="${esc((s.exportRegions || []).join(', '))}"></label></div>
      <div class="actions"><button class="btn pri" type="submit">Saqlash</button></div></form>`;
    const root = $('#sf'); wireTri(root);
    root.addEventListener('submit', e => {
      e.preventDefault(); const f = e.target;
      D.settings = {
        brand: f.brand.value.trim() || 'BabuSweet', phone: f.phone.value.trim(), email: f.email.value.trim(), address: f.address.value.trim(), mapUrl: f.mapUrl.value.trim(),
        hours: readTri(root, 'hours'), social: { instagram: f.instagram.value.trim(), telegram: f.telegram.value.trim(), facebook: f.facebook.value.trim(), youtube: f.youtube.value.trim() },
        hero: { title: readTri(root, 'htitle'), lead: readTri(root, 'hlead') },
        stats: $$('[data-stat]', root).map((_, i) => ({ value: +f['sv' + i].value || 0, suffix: f['ss' + i].value.trim(), label: readTri(root, 'sl' + i) })),
        exportRegions: f.regions.value.split(',').map(x => x.trim()).filter(Boolean)
      };
      persist(); toast('Sozlamalar saqlandi (qoralama)');
    });
  }

  /* ---------- publish ---------- */
  const fileText = () => "/* BabuSweet sayt ma'lumotlari. Admin paneldan yaratilgan. */\nwindow.BS_DATA = " + JSON.stringify(D, null, 2) + ";\n";
  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  function publish() {
    title('Nashr qilish');
    let gh = {}; try { gh = JSON.parse(store.get(GH) || '{}'); } catch (e) { /* ignore */ }
    $('#view').innerHTML = `
      <div class="card"><h3>1. Ko‘rib chiqish</h3><p style="color:var(--mute);margin-bottom:12px">${hasDraft ? 'Sizda nashr qilinmagan o‘zgarishlar bor. Saytni ochsangiz, ularni (faqat shu brauzerda) ko‘rasiz.' : 'Hozircha nashr qilinmagan o‘zgarish yo‘q.'}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn pri" href="../index.html" target="_blank" rel="noopener">Qoralamani saytda ko‘rish ↗</a>${hasDraft ? '<button class="btn danger" id="reset">Qoralamani bekor qilish</button>' : ''}</div></div>
      <div class="card"><h3>2-usul. Faylni yuklab olish (eng oddiy)</h3><p style="color:var(--mute);margin-bottom:12px">Faylni yuklab oling va sayt papkasidagi <code>data/site-data.js</code> o‘rniga qo‘yib, hostingga qayta yuklang (Netlify’da papkani qayta tashlash kifoya).</p>
        <button class="btn pri" id="dl">⬇ site-data.js ni yuklab olish</button></div>
      <div class="card"><h3>3-usul. GitHub orqali avtomatik nashr</h3><p style="color:var(--mute);margin-bottom:12px">Sayt GitHub’dan Netlify/GitHub Pages’ga ulangan bo‘lsa, bir tugma bilan yangilanadi. Token faqat shu brauzerda saqlanadi. Token: GitHub → Settings → Developer settings → Fine-grained tokens → faqat shu repo, <b>Contents: Read and write</b>.</p>
        <form class="form" id="gf" novalidate><div class="cols"><label>Egasi (owner)<input name="owner" value="${esc(gh.owner || '')}" placeholder="sladusuz"></label><label>Repo<input name="repo" value="${esc(gh.repo || '')}" placeholder="Ibrohim"></label></div>
        <div class="cols"><label>Branch<input name="branch" value="${esc(gh.branch || 'main')}"></label><label>Fayl yo‘li<input name="path" value="${esc(gh.path || 'BabuSweet-Frontend/data/site-data.js')}"></label></div>
        <label>Token<input type="password" name="token" value="${esc(gh.token || '')}" autocomplete="off"></label>
        <label class="chk"><input type="checkbox" name="remember" ${gh.token ? 'checked' : ''}> Shu brauzerda eslab qolish</label>
        <div class="err" id="ge" role="alert"></div><div class="actions"><button class="btn pri" type="submit" id="gb">🚀 Nashr qilish</button></div></form></div>`;
    const r = $('#reset'); if (r) r.onclick = () => { if (!confirm('Barcha nashr qilinmagan o‘zgarishlar o‘chadi. Davom etasizmi?')) return; store.del(LS); location.reload(); };
    $('#dl').onclick = () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([fileText()], { type: 'text/javascript' })); a.download = 'site-data.js'; document.body.appendChild(a); a.click(); a.remove();
      toast('Yuklab olindi — data/site-data.js o‘rniga qo‘ying');
    };
    $('#gf').addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, err = $('#ge'), btn = $('#gb'); err.textContent = '';
      const o = { owner: f.owner.value.trim(), repo: f.repo.value.trim(), branch: f.branch.value.trim() || 'main', path: f.path.value.trim().replace(/^\/+/, ''), token: f.token.value.trim() };
      if (!o.owner || !o.repo || !o.path || !o.token) { err.textContent = 'Hamma maydonni to‘ldiring'; return; }
      store.set(GH, JSON.stringify(f.remember.checked ? o : { ...o, token: '' }));
      btn.disabled = true; btn.textContent = 'Yuborilmoqda…';
      try {
        const url = `https://api.github.com/repos/${encodeURIComponent(o.owner)}/${encodeURIComponent(o.repo)}/contents/${o.path.split('/').map(encodeURIComponent).join('/')}`;
        const h = { Authorization: 'Bearer ' + o.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
        const g = await fetch(url + '?ref=' + encodeURIComponent(o.branch), { headers: h });
        let sha; if (g.ok) sha = (await g.json()).sha; else if (g.status !== 404) throw new Error(g.status === 401 ? 'Token noto‘g‘ri yoki muddati tugagan' : g.status === 403 ? 'Token ruxsati yetarli emas' : 'GitHub xatosi: ' + g.status);
        const p = await fetch(url, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'BabuSweet admin: ma’lumotlar yangilandi', content: b64(fileText()), branch: o.branch, sha }) });
        if (!p.ok) throw new Error(p.status === 404 ? 'Repo yoki yo‘l topilmadi (token shu repoga ruxsat berganmi?)' : p.status === 409 || p.status === 422 ? 'Fayl o‘zgargan, sahifani yangilab qayta urining' : 'GitHub xatosi: ' + p.status);
        toast('Nashr qilindi! Hosting 1–2 daqiqada yangilaydi.');
      } catch (x) { err.textContent = x.message; }
      btn.disabled = false; btn.textContent = '🚀 Nashr qilish';
    });
  }

  shell();
})();
