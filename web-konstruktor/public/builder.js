'use strict';
// Mijoz uchun sayt konstruktori: hammasi brauzerda ishlaydi, serverga ma'lumot yuborilmaydi.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STORE_KEY = 'impro_builder_v1';
  const IMPRO_EMAIL = 'chempme@gmail.com';

  let D = null, tab = 'asosiy', previewReady = false, pt = null, st = null, quotaWarned = false;

  const store = {
    get() { try { return localStorage.getItem(STORE_KEY); } catch { return null; } },
    set(v) { try { localStorage.setItem(STORE_KEY, v); return true; } catch { return false; } },
    del() { try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ } },
  };
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); };
  const get = (p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), D);
  const set = (p, v) => { const ks = p.split('.'); let o = D; ks.slice(0, -1).forEach((k) => { if (o[k] == null) o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = v; changed(); };

  function changed() {
    clearTimeout(pt); pt = setTimeout(sendPreview, 200);
    clearTimeout(st); st = setTimeout(autosave, 500);
    const s = $('#st'); s.textContent = '● Saqlanmoqda…'; s.className = 'st dirty';
  }
  function autosave() {
    const ok = store.set(JSON.stringify(D));
    const s = $('#st');
    if (ok) { s.textContent = '● Avtomatik saqlandi'; s.className = 'st'; }
    else { s.textContent = '● Brauzerda saqlanmadi'; s.className = 'st bad'; if (!quotaWarned) { quotaWarned = true; toast('Brauzer xotirasi to\'ldi. Loyihani «Tayyor» bo\'limidan fayl qilib saqlang.'); } }
  }
  const cleanData = () => { const c = JSON.parse(JSON.stringify(D)); delete c.notify; c.features = { ...c.features, builder: false }; return c; };
  function sendPreview() { const f = $('#if'); if (previewReady && f.contentWindow) f.contentWindow.postMessage({ type: 'site', data: cleanData() }, location.origin); }
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.type === 'ready') { previewReady = true; if (D) sendPreview(); } });

  /* ---------- Maydon yasovchilar ---------- */
  const fText = (label, path, o = {}) => `<label class="f">${esc(label)}</label>${o.area ? `<textarea data-p="${path}" rows="${o.rows || 3}" ${o.max ? `maxlength="${o.max}"` : ''}>${esc(get(path) || '')}</textarea>` : `<input type="${o.type || 'text'}" data-p="${path}" value="${esc(get(path) ?? '')}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.max ? `maxlength="${o.max}"` : ''}>`}${o.hint ? `<div class="hint">${esc(o.hint)}</div>` : ''}`;
  const fLines = (label, path, hint) => `<label class="f">${esc(label)}</label><textarea data-p="${path}" data-k="lines" rows="4">${esc((get(path) || []).join('\n'))}</textarea>${hint ? `<div class="hint">${esc(hint)}</div>` : ''}`;
  const fToggle = (title, sub, path) => `<label class="sw"><span><b>${esc(title)}</b><small>${esc(sub)}</small></span><input type="checkbox" data-p="${path}" ${get(path) ? 'checked' : ''}><span class="tg"></span></label>`;
  const fImg = (label, path) => { const v = get(path); return `<label class="f">${esc(label)}</label><div class="img"><div class="pv" style="${v ? `background-image:url('${esc(v)}')` : ''}"></div><label>Rasm tanlash<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-up="${path}"></label>${v ? `<button class="b g s" data-act="clr" data-path="${path}">O'chirish</button>` : ''}</div>`; };
  const listHead = (title, path, i, n) => `<div class="hd"><b>${esc(title)}</b><div class="acts"><button data-act="up" data-path="${path}" data-i="${i}" ${i === 0 ? 'disabled' : ''} title="Yuqoriga">↑</button><button data-act="dn" data-path="${path}" data-i="${i}" ${i === n - 1 ? 'disabled' : ''} title="Pastga">↓</button><button class="x" data-act="del" data-path="${path}" data-i="${i}" title="O'chirish">✕</button></div></div>`;
  const NEW = {
    'services.items': () => ({ icon: 'star', title: 'Yangi xizmat', text: '' }),
    'process.steps': () => ({ title: 'Yangi qadam', text: '' }),
    stats: () => ({ value: 10, suffix: '+', label: 'Yangi ko\'rsatkich' }),
    'hero.trust': () => ({ value: '', label: '' }),
    products: () => ({ id: 'p' + Math.random().toString(36).slice(2, 8), name: 'Yangi mahsulot', price: 0, category: '', badge: '', description: '', image: '', active: true }),
  };
  const iconOpts = (cur) => Object.keys(window.ICONS).filter((k) => !['menu', 'x', 'arrow', 'check', 'mail', 'pin', 'clock', 'tel', 'insta'].includes(k)).map((k) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${k}</option>`).join('');

  /* ---------- Tayyorlik tekshiruvi ---------- */
  function checks() {
    const c = [];
    const name = (get('company.name') || '').trim();
    c.push([name && name !== 'Kompaniyangiz nomi', name && name !== 'Kompaniyangiz nomi' ? 'Kompaniya nomi kiritilgan' : 'Kompaniya nomini yozing («Asosiy» bo\'limi)']);
    c.push([!!get('contacts.phone'), get('contacts.phone') ? 'Telefon raqami kiritilgan' : 'Telefon raqamini yozing («Aloqa» bo\'limi)']);
    if (get('features.orders')) c.push([!!get('contacts.email'), get('contacts.email') ? 'Buyurtmalar ' + get('contacts.email') + ' ga tushadi' : 'Email yozing, aks holda buyurtmalar sizga kelmaydi («Aloqa» bo\'limi)']);
    if (get('features.catalog')) { const n = (D.products || []).filter((p) => p.active !== false).length; c.push([n > 0, n > 0 ? `Katalogda ${n} ta mahsulot bor` : 'Katalog bo\'sh. Mahsulot qo\'shing yoki katalogni o\'chiring']); }
    return c;
  }

  /* ---------- Bo'limlar ---------- */
  const TABS = [['asosiy', 'Asosiy'], ['bosh', 'Bosh sahifa'], ['xizmat', 'Xizmatlar'], ['jarayon', 'Jarayon'], ['katalog', 'Katalog'], ['aloqa', 'Aloqa'], ['tayyor', '✓ Tayyor']];
  function drawTabs() { $('#tabs').innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join(''); }
  const VIEWS = {
    asosiy: () => `<div class="steps"><div><b>1</b>Ma'lumotlarni kiriting (yuqoridagi bo'limlar)</div><div><b>2</b>O'ng tomonda saytingiz jonli ko'rinadi</div><div><b>3</b>«Tayyor» bo'limidan saytni yuklab oling</div></div>
      <h4>Kompaniya</h4>${fText('Kompaniya nomi', 'company.name', { max: 60 })}${fText('Logo harfi', 'company.logo', { max: 2, hint: '1–2 ta harf, logotip o\'rnida chiqadi' })}
      <h4>Ko'rinish uslubi</h4><div class="th">${[['dark', "Qorong'i", 'linear-gradient(135deg,#0a0f1e,#22d3ee)'], ['light', "Yorug'", 'linear-gradient(135deg,#eceefb,#4f46e5)'], ['warm', 'Issiq', 'linear-gradient(135deg,#1d130d,#ff8a3d)']].map(([k, l, g]) => `<button data-theme="${k}" class="${get('theme.preset') === k ? 'on' : ''}"><i style="background:${g}"></i>${l}</button>`).join('')}</div>
      <label class="f">Maxsus rang (ixtiyoriy)</label><div class="colors"><label><input type="color" data-p="theme.accent" value="${esc(get('theme.accent') || '#22d3ee')}"> Asosiy</label><label><input type="color" data-p="theme.accent2" value="${esc(get('theme.accent2') || '#7c5cff')}"> Qo'shimcha</label><button class="b g s" data-act="resetColors">Standart</button></div>
      <h4>Bo'limlarni yoqish / o'chirish</h4>
      ${fToggle('Katalog', 'Mahsulot yoki xizmatlar, rasm va narx bilan', 'features.catalog')}${fToggle('Buyurtma formasi va savat', 'Mijoz buyurtmasi sizning emailingizga tushadi', 'features.orders')}
      ${fToggle('Xizmatlar', 'Xizmatlar kartochkalari', 'features.services')}${fToggle('Jarayon', 'Qanday ishlashingiz bosqichlari', 'features.process')}${fToggle('Raqamlar', 'Animatsiyali ko\'rsatkichlar', 'features.stats')}${fToggle('Yuguruvchi lenta', 'Xizmat nomlari lentasi', 'features.marquee')}
      <h4>Effektlar</h4>${fToggle('Fon animatsiyalari', 'Harakatlanuvchi fon va yorug\'lik', 'features.effects')}${fToggle('Mavzu almashtirgich', 'Mehmon rangni o\'zi tanlay oladi', 'features.themeSwitcher')}`,
    bosh: () => `<h4>Asosiy ekran</h4>${fText('Yuqoridagi yozuv', 'hero.badge', { max: 80 })}${fText('Sarlavha boshi', 'hero.titleStart', { max: 80 })}${fLines('Almashib turadigan so\'zlar', 'hero.words', 'Har bir qatorga bitta so\'z. Bo\'sh qoldirsangiz o\'chadi.')}${fText('Sarlavha oxiri', 'hero.titleEnd', { max: 80 })}${fText('Tavsif', 'hero.text', { area: 1, max: 300 })}
      <div class="row2"><div>${fText('1-tugma matni', 'hero.cta1', { max: 40 })}</div><div>${fText('2-tugma matni', 'hero.cta2', { max: 40 })}</div></div>${fText('Menyudagi tugma', 'hero.navCta', { max: 40 })}
      <h4>O'ng tomondagi tasvir</h4><label class="f">Turi</label><select data-p="hero.visual"><option value="none" ${get('hero.visual') === 'none' ? 'selected' : ''}>Yo'q (faqat matn)</option><option value="image" ${get('hero.visual') === 'image' ? 'selected' : ''}>Rasm</option><option value="window" ${get('hero.visual') === 'window' ? 'selected' : ''}>Kod oynasi (IT kompaniya uchun)</option></select>
      ${get('hero.visual') === 'image' ? fImg('Rasm', 'hero.image') : ''}${get('hero.visual') === 'window' ? fLines('Oynadagi qatorlar', 'hero.windowLines') : ''}
      ${get('hero.visual') !== 'none' ? fLines('Suzuvchi yozuvlar (3 tagacha)', 'hero.chips', 'Har bir qatorga bittadan') : ''}
      <h4>Ishonch ko'rsatkichlari</h4>${(D.hero.trust || []).map((t, i) => `<div class="item">${listHead('Ko\'rsatkich ' + (i + 1), 'hero.trust', i, D.hero.trust.length)}<div class="row2"><div>${fText('Qiymat', `hero.trust.${i}.value`, { max: 20 })}</div><div>${fText('Yozuv', `hero.trust.${i}.label`, { max: 30 })}</div></div></div>`).join('')}<button class="addb" data-act="add" data-path="hero.trust">+ Qo'shish</button>
      <h4>Yuguruvchi lenta</h4>${fLines('Lentadagi so\'zlar', 'marquee')}
      <h4>Raqamlar</h4>${(D.stats || []).map((t, i) => `<div class="item">${listHead(t.label || 'Raqam', 'stats', i, D.stats.length)}<div class="row2"><div>${fText('Son', `stats.${i}.value`, { type: 'number' })}</div><div>${fText('Qo\'shimcha (+, %)', `stats.${i}.suffix`, { max: 10 })}</div></div>${fText('Yozuv', `stats.${i}.label`, { max: 40 })}</div>`).join('')}<button class="addb" data-act="add" data-path="stats">+ Qo'shish</button>`,
    xizmat: () => `${!get('features.services') ? '<p class="hint" style="margin-top:14px">Bu bo\'lim hozir o\'chirilgan. «Asosiy» bo\'limidan yoqing.</p>' : ''}<h4>Sarlavha</h4>${fText('Kichik yozuv', 'services.eyebrow', { max: 30 })}${fText('Sarlavha', 'services.title', { max: 100 })}${fText('Tavsif', 'services.text', { area: 1, max: 250 })}
      <h4>Xizmatlar</h4>${(D.services.items || []).map((it, i) => `<div class="item">${listHead(it.title || 'Xizmat', 'services.items', i, D.services.items.length)}<label class="f">Ikonka</label><select data-p="services.items.${i}.icon" data-rerender>${iconOpts(it.icon)}</select>${fText('Nomi', `services.items.${i}.title`, { max: 80 })}${fText('Tavsif', `services.items.${i}.text`, { area: 1, max: 300 })}</div>`).join('')}<button class="addb" data-act="add" data-path="services.items">+ Xizmat qo'shish</button>`,
    jarayon: () => `${!get('features.process') ? '<p class="hint" style="margin-top:14px">Bu bo\'lim hozir o\'chirilgan. «Asosiy» bo\'limidan yoqing.</p>' : ''}<h4>Sarlavha</h4>${fText('Kichik yozuv', 'process.eyebrow', { max: 30 })}${fText('Sarlavha', 'process.title', { max: 100 })}${fText('Tavsif', 'process.text', { area: 1, max: 250 })}
      <h4>Qadamlar</h4>${(D.process.steps || []).map((it, i) => `<div class="item">${listHead((i + 1) + '. ' + (it.title || 'Qadam'), 'process.steps', i, D.process.steps.length)}${fText('Nomi', `process.steps.${i}.title`, { max: 60 })}${fText('Tavsif', `process.steps.${i}.text`, { area: 1, max: 250 })}</div>`).join('')}<button class="addb" data-act="add" data-path="process.steps">+ Qadam qo'shish</button>`,
    katalog: () => `${!get('features.catalog') ? '<p class="hint" style="margin-top:14px">Katalog hozir o\'chirilgan, saytda ko\'rinmaydi. «Asosiy» bo\'limidan yoqing.</p>' : ''}<h4>Sarlavha</h4>${fText('Kichik yozuv', 'catalog.eyebrow', { max: 30 })}${fText('Sarlavha', 'catalog.title', { max: 100 })}${fText('Tavsif', 'catalog.text', { area: 1, max: 250 })}<div class="row2"><div>${fText('Valyuta', 'catalog.currency', { max: 12, hint: 'masalan: so\'m, $, ₽' })}</div><div>${fText('Menyudagi nomi', 'catalog.navLabel', { max: 20 })}</div></div>
      <h4>Mahsulotlar (${(D.products || []).length})</h4>${(D.products || []).map((p, i) => `<div class="item">${listHead(p.name || 'Mahsulot', 'products', i, D.products.length)}${fText('Nomi', `products.${i}.name`, { max: 120 })}<div class="row2"><div>${fText('Narxi', `products.${i}.price`, { type: 'number', hint: '0 = «Narxi kelishiladi»' })}</div><div>${fText('Kategoriya', `products.${i}.category`, { max: 60 })}</div></div>${fText('Belgi (ixtiyoriy)', `products.${i}.badge`, { max: 40, ph: 'masalan: YANGI yoki CHEGIRMA' })}${fText('Tavsif', `products.${i}.description`, { area: 1, max: 500 })}${fImg('Rasm', `products.${i}.image`)}${fToggle('Saytda ko\'rsatish', 'O\'chirsangiz mahsulot yashirinadi', `products.${i}.active`)}</div>`).join('')}<button class="addb" data-act="add" data-path="products">+ Mahsulot qo'shish</button>`,
    aloqa: () => `<h4>Sarlavha</h4>${fText('Kichik yozuv', 'contacts.eyebrow', { max: 30 })}${fText('Sarlavha', 'contacts.title', { max: 100 })}${fText('Tavsif', 'contacts.text', { area: 1, max: 250 })}
      <h4>Aloqa ma'lumotlari</h4>${fText('Telefon', 'contacts.phone', { max: 40, ph: '+998 90 123 45 67' })}${fText('Email', 'contacts.email', { max: 80, type: 'email', hint: 'Buyurtmalar shu emailga tushadi' })}${fText('Manzil', 'contacts.address', { max: 150 })}${fText('Ish vaqti', 'contacts.hours', { max: 80 })}${fText('Telegram', 'contacts.telegram', { max: 80, ph: '@username' })}${fText('Instagram', 'contacts.instagram', { max: 80, ph: '@username' })}${fText('Pastki yozuv', 'footer.text', { max: 120 })}`,
    tayyor: () => `<h4>Saytingiz holati</h4>${checks().map(([ok, t]) => `<div class="chk ${ok ? 'ok' : 'w'}"><span>${ok ? '✓' : '!'}</span><span>${esc(t)}</span></div>`).join('')}
      <h4>1. Tayyor saytni olish</h4><button class="b bigb" data-act="download">Saytni yuklab olish (.html)</button><div class="hint">Bitta fayl. Ikki marta bosib brauzerda oching yoki istalgan hostingga yuklang. Buyurtmalar emailingizga tushadi.</div>
      <h4>2. Impro IT ga yuborish</h4><p class="hint">Saytni sizning nomingizdan internetga joylab, domenga ulab beramiz.</p><button class="b g bigb" data-act="mail">Impro IT ga so'rov yuborish</button><div class="hint">Pochta ilovangiz ochiladi. Avval loyihani fayl qilib saqlab, xatga ilova qiling.</div>
      <h4>3. Loyihani saqlash</h4><p class="hint">Keyinroq davom ettirish yoki boshqa kompyuterda ochish uchun.</p><button class="b g bigb" data-act="exportJson">Loyihani yuklab olish (.json)</button><label class="b g bigb fileb">Loyihani ochish<input type="file" accept=".json,application/json" data-import></label>
      <h4>Qaytadan boshlash</h4><button class="b d bigb" data-act="reset">Hammasini tozalash</button>`,
  };
  function draw(keepScroll) { const p = $('#panel'); const sc = p.scrollTop; drawTabs(); p.innerHTML = VIEWS[tab](); if (keepScroll) p.scrollTop = sc; }

  /* ---------- Hodisalar ---------- */
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; draw(); });
  $('#panel').addEventListener('input', (e) => {
    const t = e.target; if (t.dataset.up || t.hasAttribute('data-import')) return;
    if (t.dataset.p) {
      let v = t.type === 'checkbox' ? t.checked : t.value;
      if (t.type === 'number') v = v === '' ? 0 : Number(v);
      if (t.dataset.k === 'lines') v = t.value.split('\n').map((x) => x.trim()).filter(Boolean);
      set(t.dataset.p, v);
      if (t.dataset.p === 'hero.visual' || t.dataset.rerender !== undefined) draw(true);
    }
  });
  $('#panel').addEventListener('change', async (e) => {
    const t = e.target;
    if (t.dataset.up && t.files[0]) { try { const url = await toDataUrl(t.files[0]); set(t.dataset.up, url); draw(true); toast('Rasm qo\'shildi'); } catch (er) { toast(er.message); } }
    if (t.hasAttribute('data-import') && t.files[0]) importJson(t.files[0]);
    if (t.matches('[data-p]') && t.type === 'checkbox') draw(true);
  });
  $('#panel').addEventListener('click', async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.theme) { set('theme.preset', t.dataset.theme); draw(true); return; }
    const a = t.dataset.act; if (!a) return;
    const path = t.dataset.path, i = +t.dataset.i;
    if (a === 'resetColors') { set('theme.accent', ''); set('theme.accent2', ''); draw(true); }
    if (a === 'clr') { set(path, ''); draw(true); }
    if (a === 'add') { const arr = get(path) || []; arr.push(NEW[path]()); set(path, arr); draw(true); }
    if (a === 'del') { if (!confirm('O\'chirilsinmi?')) return; const arr = get(path); arr.splice(i, 1); set(path, arr); draw(true); }
    if (a === 'up' || a === 'dn') { const arr = get(path), j = a === 'up' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; set(path, arr); draw(true); }
    if (a === 'download') downloadSite();
    if (a === 'exportJson') saveFile(slug() + '-loyiha.json', JSON.stringify(cleanData(), null, 2), 'application/json');
    if (a === 'mail') mailRequest();
    if (a === 'reset') { if (!confirm('Barcha kiritilgan ma\'lumot o\'chib, boshlang\'ich holatga qaytadi. Davom etasizmi?')) return; store.del(); await loadDefault(); draw(); sendPreview(); toast('Qaytadan boshlandi'); }
  });
  $$('.dev button').forEach((b) => b.addEventListener('click', () => { $$('.dev button').forEach((x) => x.classList.toggle('on', x === b)); $('#fr').classList.toggle('m', b.dataset.d === 'm'); }));
  $('#save').addEventListener('click', () => { tab = 'tayyor'; draw(); downloadSite(); });

  /* ---------- Fayllar ---------- */
  const slug = () => ((get('company.name') || 'sayt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sayt');
  function saveFile(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  async function downloadSite() {
    try {
      const r = await fetch('/shablon.html', { cache: 'no-store' }); if (!r.ok) throw new Error('shablon');
      const tpl = await r.text(); const MARK = '/*__DATA__*/null';
      if (!tpl.includes(MARK)) throw new Error('shablon');
      saveFile(slug() + '.html', tpl.replace(MARK, () => JSON.stringify(cleanData()).replace(/</g, '\\u003c')), 'text/html');
      toast('Sayt yuklab olindi');
    } catch { toast('Yuklab bo\'lmadi. Sahifani yangilab, qayta urinib ko\'ring.'); }
  }
  function importJson(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        if (!j || typeof j !== 'object' || !j.company || !j.hero) throw 0;
        D = normalize(j); autosave(); draw(); sendPreview(); toast('Loyiha ochildi');
      } catch { toast('Bu fayl loyiha fayli emas'); }
    };
    rd.readAsText(file);
  }
  function mailRequest() {
    const body = [`Salom! Men Impro IT konstruktorida sayt tayyorladim.`, '', `Kompaniya: ${get('company.name') || ''}`, `Telefon: ${get('contacts.phone') || ''}`, `Email: ${get('contacts.email') || ''}`, `Katalog: ${get('features.catalog') ? 'bor (' + (D.products || []).length + ' ta)' : 'yo\'q'}`, '', 'Saytni joylab, domenga ulab berishingizni so\'rayman. Loyiha faylini ilova qildim.'].join('\n');
    location.href = `mailto:${IMPRO_EMAIL}?subject=${encodeURIComponent('Sayt joylash so\'rovi: ' + (get('company.name') || ''))}&body=${encodeURIComponent(body)}`;
  }
  function toDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return reject(new Error('Faqat PNG, JPG, WEBP yoki GIF rasm'));
      const rd = new FileReader();
      rd.onerror = () => reject(new Error('Faylni o\'qib bo\'lmadi'));
      rd.onload = () => {
        if (file.type === 'image/gif') return file.size > 1.5e6 ? reject(new Error('GIF 1.5 MB dan oshmasin')) : resolve(rd.result);
        const img = new Image();
        img.onerror = () => reject(new Error('Rasm ochilmadi'));
        img.onload = () => {
          const k = Math.min(1, 1100 / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.82));
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }

  /* ---------- Boshlash ---------- */
  function normalize(d) {
    d.theme = d.theme || {}; d.features = d.features || {}; d.hero = d.hero || {}; d.catalog = d.catalog || {}; d.contacts = d.contacts || {};
    d.services = d.services || { items: [] }; d.process = d.process || { steps: [] }; d.footer = d.footer || {}; d.company = d.company || {};
    d.products = d.products || []; d.stats = d.stats || []; d.marquee = d.marquee || [];
    d.hero.trust = d.hero.trust || []; d.hero.words = d.hero.words || []; d.hero.chips = d.hero.chips || []; d.hero.windowLines = d.hero.windowLines || [];
    d.features.builder = false;
    return d;
  }
  async function loadDefault() {
    const r = await fetch('/builder-default.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('default');
    D = normalize(await r.json());
  }
  (async function init() {
    try {
      const saved = store.get();
      if (saved) { try { D = normalize(JSON.parse(saved)); } catch { D = null; } }
      if (!D) await loadDefault();
      $('#lm').textContent = 'I';
      draw(); sendPreview();
    } catch { $('#panel').innerHTML = '<p class="empty">Konstruktor yuklanmadi. Sahifani yangilab ko\'ring.</p>'; }
  })();
})();
