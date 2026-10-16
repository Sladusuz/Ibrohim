'use strict';
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let D = null, dirty = false, tab = 'asosiy', orders = [], previewReady = false, pt = null;

  const api = async (method, url, body) => {
    const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && url !== '/api/admin/login') { showLogin(); throw new Error('Qayta kiring'); }
    if (!r.ok) throw new Error(j.error || 'Xatolik');
    return j;
  };
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); };
  const get = (p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), D);
  const set = (p, v) => { const ks = p.split('.'); let o = D; ks.slice(0, -1).forEach((k) => { if (o[k] == null) o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = v; changed(); };
  function changed() {
    dirty = true; const s = $('#st'); s.textContent = '● Saqlanmagan o\'zgarish bor'; s.className = 'st dirty';
    clearTimeout(pt); pt = setTimeout(sendPreview, 200);
  }
  function sendPreview() { const f = $('#if'); if (previewReady && f.contentWindow) f.contentWindow.postMessage({ type: 'site', data: { ...D, notify: undefined } }, location.origin); }
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.type === 'ready') { previewReady = true; if (D) sendPreview(); } });
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Kirish ---------- */
  function showLogin() { $('#login').hidden = false; setTimeout(() => $('#pw').focus(), 50); }
  $('#lf').addEventListener('submit', async (e) => {
    e.preventDefault(); $('#le').textContent = '';
    try { await api('POST', '/api/admin/login', { password: $('#pw').value }); $('#pw').value = ''; $('#login').hidden = true; await load(); }
    catch (er) { $('#le').textContent = er.message; }
  });

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

  /* ---------- Bo'limlar (tablar) ---------- */
  const TABS = [['asosiy', 'Asosiy'], ['bosh', 'Bosh sahifa'], ['xizmat', 'Xizmatlar'], ['jarayon', 'Jarayon'], ['katalog', 'Katalog'], ['aloqa', 'Aloqa'], ['buyurtma', 'Buyurtmalar'], ['xavfsiz', 'Xavfsizlik']];
  function drawTabs() {
    const nw = orders.filter((o) => o.status === 'yangi').length;
    $('#tabs').innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${l}${k === 'buyurtma' && nw ? `<span class="cnt">${nw}</span>` : ''}</button>`).join('');
  }
  const VIEWS = {
    asosiy: () => `<h4>Kompaniya</h4>${fText('Kompaniya nomi', 'company.name', { max: 60 })}${fText('Logo harfi', 'company.logo', { max: 2, hint: '1–2 ta harf, logotip o\'rnida chiqadi' })}
      <h4>Ko'rinish uslubi</h4><div class="th">${[['dark', "Qorong'i", 'linear-gradient(135deg,#0a0f1e,#22d3ee)'], ['light', "Yorug'", 'linear-gradient(135deg,#eceefb,#4f46e5)'], ['warm', 'Issiq', 'linear-gradient(135deg,#1d130d,#ff8a3d)']].map(([k, l, g]) => `<button data-theme="${k}" class="${get('theme.preset') === k ? 'on' : ''}"><i style="background:${g}"></i>${l}</button>`).join('')}</div>
      <label class="f">Maxsus rang (ixtiyoriy)</label><div class="colors"><label><input type="color" data-p="theme.accent" value="${esc(get('theme.accent') || '#22d3ee')}"> Asosiy</label><label><input type="color" data-p="theme.accent2" value="${esc(get('theme.accent2') || '#7c5cff')}"> Qo'shimcha</label><button class="b g s" data-act="resetColors">Standart</button></div>
      <h4>Bo'limlarni yoqish / o'chirish</h4>
      ${fToggle('Katalog', 'Mahsulot yoki xizmatlar, rasm va narx bilan', 'features.catalog')}${fToggle('Buyurtma formasi va savat', 'Mijoz buyurtma yoki so\'rov yuboradi', 'features.orders')}
      ${fToggle('Xizmatlar', 'Xizmatlar kartochkalari', 'features.services')}${fToggle('Jarayon', 'Qanday ishlashingiz bosqichlari', 'features.process')}${fToggle('Raqamlar', 'Animatsiyali ko\'rsatkichlar', 'features.stats')}${fToggle('Yuguruvchi lenta', 'Xizmat nomlari lentasi', 'features.marquee')}
      <h4>Effektlar</h4>${fToggle('Fon animatsiyalari', 'Harakatlanuvchi fon va yorug\'lik', 'features.effects')}${fToggle('Mavzu almashtirgich', 'Mehmon rangni o\'zi tanlay oladi', 'features.themeSwitcher')}`,
    bosh: () => `<h4>Asosiy ekran</h4>${fText('Yuqoridagi yozuv', 'hero.badge', { max: 80 })}${fText('Sarlavha boshi', 'hero.titleStart', { max: 80 })}${fLines('Almashib turadigan so\'zlar', 'hero.words', 'Har bir qatorga bitta so\'z. Bo\'sh qoldirsangiz o\'chadi.')}${fText('Sarlavha oxiri', 'hero.titleEnd', { max: 80 })}${fText('Tavsif', 'hero.text', { area: 1, max: 300 })}
      <div class="row2"><div>${fText('1-tugma matni', 'hero.cta1', { max: 40 })}</div><div>${fText('2-tugma matni', 'hero.cta2', { max: 40 })}</div></div>${fText('Menyudagi tugma', 'hero.navCta', { max: 40 })}
      <h4>O'ng tomondagi tasvir</h4><label class="f">Turi</label><select data-p="hero.visual"><option value="window" ${get('hero.visual') === 'window' ? 'selected' : ''}>Kod oynasi (IT kompaniya uchun)</option><option value="image" ${get('hero.visual') === 'image' ? 'selected' : ''}>Rasm</option><option value="none" ${get('hero.visual') === 'none' ? 'selected' : ''}>Yo'q (faqat matn)</option></select>
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
      <h4>Aloqa ma'lumotlari</h4>${fText('Telefon', 'contacts.phone', { max: 40 })}${fText('Email', 'contacts.email', { max: 80 })}${fText('Manzil', 'contacts.address', { max: 150 })}${fText('Ish vaqti', 'contacts.hours', { max: 80 })}${fText('Telegram', 'contacts.telegram', { max: 80, ph: '@username' })}${fText('Instagram', 'contacts.instagram', { max: 80, ph: '@username' })}${fText('Pastki yozuv', 'footer.text', { max: 120 })}
      <h4>Buyurtma xabarnomasi (Telegram)</h4><p class="hint">Yangi buyurtma kelganda Telegramga xabar boradi. @BotFather orqali bot yarating, tokenni va o'z chat ID'ingizni kiriting.</p>${fText('Bot tokeni', 'notify.telegramBotToken', { max: 120 })}${fText('Chat ID', 'notify.telegramChatId', { max: 40 })}`,
    buyurtma: () => `<h4>Buyurtmalar (${orders.length})</h4>${!get('features.orders') ? '<p class="hint">Buyurtma formasi o\'chirilgan, yangi buyurtma kelmaydi.</p>' : ''}${orders.length ? orders.map((o) => `<div class="ord"><div class="h"><span>#${esc(o.id)}</span><span>${new Date(o.date).toLocaleString('uz-UZ')}</span></div><b>${esc(o.name)}</b> · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>${o.items.length ? `<ul>${o.items.map((i) => `<li>${esc(i.name)} × ${i.qty}</li>`).join('')}</ul>${o.total ? `<div><b>Jami: ${Number(o.total).toLocaleString('ru-RU')} ${esc(get('catalog.currency') || '')}</b></div>` : ''}` : ''}${o.message ? `<div style="margin-top:6px;color:var(--muted)">${esc(o.message)}</div>` : ''}<div class="a"><select data-ost="${esc(o.id)}">${[['yangi', 'Yangi'], ['jarayonda', 'Jarayonda'], ['bajarildi', 'Bajarildi'], ['bekor', 'Bekor qilindi']].map(([k, l]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select><button class="b d s" data-odel="${esc(o.id)}">O'chirish</button></div></div>`).join('') : '<div class="empty">Hozircha buyurtma yo\'q</div>'}`,
    xavfsiz: () => `<h4>Parolni o'zgartirish</h4><label class="f">Yangi parol</label><input type="password" id="np" placeholder="Kamida 6 belgi" autocomplete="new-password"><button class="b" style="margin-top:12px" data-act="pw">Parolni saqlash</button><h4>Seans</h4><button class="b g" data-act="logout">Chiqish</button>
      <h4>Eslatma</h4><p class="hint">Admin panelni butunlay o'chirish uchun <b>data/site.json</b> faylida <b>features.admin</b> ni <b>false</b> qiling va serverni qayta ishga tushiring.</p>`,
  };
  function draw(keepScroll) {
    const p = $('#panel'); const sc = p.scrollTop;
    drawTabs(); p.innerHTML = VIEWS[tab](); if (keepScroll) p.scrollTop = sc;
  }

  /* ---------- Hodisalar ---------- */
  $('#tabs').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab;
    if (tab === 'buyurtma') { try { orders = await api('GET', '/api/admin/orders'); } catch { /* ignore */ } }
    draw();
  });
  $('#panel').addEventListener('input', (e) => {
    const t = e.target; if (t.dataset.up) return;
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
    if (t.dataset.up && t.files[0]) {
      try { const url = await upload(t.files[0]); set(t.dataset.up, url); draw(true); toast('Rasm yuklandi'); } catch (er) { toast(er.message); }
    }
    if (t.dataset.ost) { try { await api('PUT', '/api/admin/orders', { id: t.dataset.ost, status: t.value }); const o = orders.find((x) => x.id === t.dataset.ost); if (o) o.status = t.value; drawTabs(); toast('Holat yangilandi'); } catch (er) { toast(er.message); } }
    if (t.matches('[data-p]') && (t.type === 'checkbox')) draw(true);
  });
  $('#panel').addEventListener('click', async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.theme) { set('theme.preset', t.dataset.theme); draw(true); return; }
    if (t.dataset.odel) { if (!confirm('Buyurtma o\'chirilsinmi?')) return; try { await api('DELETE', '/api/admin/orders?id=' + encodeURIComponent(t.dataset.odel)); orders = orders.filter((o) => o.id !== t.dataset.odel); draw(true); } catch (er) { toast(er.message); } return; }
    const a = t.dataset.act; if (!a) return;
    const path = t.dataset.path, i = +t.dataset.i;
    if (a === 'resetColors') { set('theme.accent', ''); set('theme.accent2', ''); draw(true); }
    if (a === 'clr') { set(path, ''); draw(true); }
    if (a === 'add') { const arr = get(path) || []; arr.push(NEW[path]()); set(path, arr); draw(true); }
    if (a === 'del') { if (!confirm('O\'chirilsinmi?')) return; const arr = get(path); arr.splice(i, 1); set(path, arr); draw(true); }
    if (a === 'up' || a === 'dn') { const arr = get(path), j = a === 'up' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; set(path, arr); draw(true); }
    if (a === 'pw') { const v = $('#np').value; try { await api('POST', '/api/admin/password', { password: v }); $('#np').value = ''; toast('Parol o\'zgartirildi'); } catch (er) { toast(er.message); } }
    if (a === 'logout') { await api('POST', '/api/admin/logout', {}).catch(() => {}); dirty = false; location.reload(); }
  });
  $$('.dev button').forEach((b) => b.addEventListener('click', () => { $$('.dev button').forEach((x) => x.classList.toggle('on', x === b)); $('#fr').classList.toggle('m', b.dataset.d === 'm'); }));
  $('#save').addEventListener('click', save);
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
  async function save() {
    const b = $('#save'); b.disabled = true; b.textContent = 'Saqlanmoqda…';
    try { await api('PUT', '/api/admin/site', D); dirty = false; const s = $('#st'); s.textContent = '● Saqlandi'; s.className = 'st'; toast('Saqlandi ✓'); }
    catch (e) { const s = $('#st'); s.textContent = '● Saqlanmadi'; s.className = 'st bad'; toast(e.message); }
    b.disabled = false; b.textContent = 'Saqlash';
  }

  /* ---------- Rasm yuklash (avtomatik kichraytirish) ---------- */
  function upload(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return reject(new Error('Faqat PNG, JPG, WEBP yoki GIF rasm'));
      const rd = new FileReader();
      rd.onerror = () => reject(new Error('Faylni o\'qib bo\'lmadi'));
      rd.onload = () => {
        const send = (data) => api('POST', '/api/admin/upload', { data }).then((j) => resolve(j.url)).catch(reject);
        if (file.type === 'image/gif') { if (file.size > 4.5e6) return reject(new Error('GIF 4 MB dan oshmasin')); return send(rd.result); }
        const img = new Image();
        img.onerror = () => reject(new Error('Rasm ochilmadi'));
        img.onload = () => {
          const max = 1600, k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          send(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.86));
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }

  /* ---------- Boshlash ---------- */
  async function load() {
    D = await api('GET', '/api/admin/site');
    D.theme = D.theme || {}; D.features = D.features || {}; D.hero = D.hero || {}; D.notify = D.notify || {}; D.catalog = D.catalog || {}; D.contacts = D.contacts || {}; D.services = D.services || { items: [] }; D.process = D.process || { steps: [] };
    D.products = D.products || []; D.stats = D.stats || []; D.marquee = D.marquee || []; D.footer = D.footer || {}; D.company = D.company || {};
    D.hero.trust = D.hero.trust || []; D.hero.words = D.hero.words || []; D.hero.chips = D.hero.chips || []; D.hero.windowLines = D.hero.windowLines || [];
    try { orders = await api('GET', '/api/admin/orders'); } catch { orders = []; }
    $('#lm').textContent = (D.company.logo || 'I').slice(0, 2); dirty = false;
    draw(); sendPreview();
  }
  api('GET', '/api/admin/site').then(() => load()).catch(() => showLogin());
})();
