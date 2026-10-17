'use strict';
// Buyurtma anketasi: mijozning xohishlarini 6 bosqichda so'raydigan master.
// Ma'lumot saytdagi "brief" bo'limidan olinadi (admin paneldan tahrirlanadi).
(function () {
  const E = window.E; if (!E) return;
  const { $, $$, esc, text, icon, imgUrl } = E;
  const KEY = 'brief_draft_v2';
  const arr = (a) => (Array.isArray(a) ? a : []);
  const STEPS = [['Xizmat', 'globe'], ['Biznes', 'briefcase'], ['Imkoniyatlar', 'zap'], ['Dizayn', 'design'], ['Muddat', 'calendar'], ['Aloqa', 'phone']];
  const PALETTES = [['#4f46e5', '#06b6d4', '#ec4899'], ['#16a34a', '#84cc16', '#f59e0b'], ['#0b78d1', '#12b5a6', '#7c5cff'], ['#d4a64a', '#17110a', '#f0d28a'], ['#e8452c', '#111111', '#f3ede2'], ['#d6457a', '#f08aa8', '#c9a063']];
  let sec = null, B = null, root = null, step = 0, busy = false, keyFn = null;

  const fresh = () => ({ v: 2, service: '', bizName: '', field: '', about: '', site: '', goals: [], features: [], extraWish: '', style: '', palette: -1, refs: [], links: ['', '', ''], langs: [], budget: '', deadline: '', note: '', cname: '', cphone: '', cemail: '', method: '', time: '', agree: true });
  const svcs = () => arr(sec.services);
  const svc = () => svcs().find((s) => s.id === B.service);
  const feats = () => arr(sec.features).filter((f) => { const t = String(f.types || '').split(',').map((x) => x.trim()).filter(Boolean); return !t.length || (B.service && t.includes(B.service)); });
  const estimate = () => { const s = svc(); if (!s) return 0; return (Number(s.price) || 0) + feats().filter((f) => B.features.includes(f.name)).reduce((a, f) => a + (Number(f.price) || 0), 0); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ B, step })); } catch { /* ignore */ } };
  const clear = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };
  const tog = (a, v) => { const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); };

  /* ---------- Bosqichlar ---------- */
  const chips = (list, key, multi, cur) => `<div class="cps">${list.map((x) => `<button type="button" class="cp ${(multi ? cur.includes(x) : cur === x) ? 'on' : ''}" data-b="${key}" data-v="${esc(x)}">${text(x)}</button>`).join('')}</div>`;
  const fld = (key, label, val, o = {}) => `<div class="fld ${o.area ? 'ta' : ''}">${o.area ? `<textarea data-bi="${key}" rows="${o.rows || 3}" placeholder=" " maxlength="${o.max || 600}">${esc(val)}</textarea>` : `<input data-bi="${key}" value="${esc(val)}" placeholder=" " maxlength="${o.max || 120}" ${o.type ? `type="${o.type}"` : ''} ${o.list ? `list="${o.list}"` : ''} ${o.mode ? `inputmode="${o.mode}"` : ''} ${o.auto ? `autocomplete="${o.auto}"` : ''}>`}<label>${label}</label></div>`;
  const head = (t, d) => `<h3 class="bwtt">${t}</h3><p class="bd">${d}</p>`;

  function stepHtml(n) {
    if (n === 0) {
      return `${head('Qanday loyiha kerak?', "Xizmat turini tanlang. Keyingi bosqichlarda tafsilotlarni aniqlaymiz.")}<div class="opts">${svcs().map((s) => `<button type="button" class="opt ${B.service === s.id ? 'on' : ''}" data-b="svc" data-v="${esc(s.id)}"><span class="oi">${icon(s.icon)}</span><b>${text(s.name)}</b><small>${text(s.desc)}</small><span class="om">${Number(s.price) > 0 && sec.showEstimate !== false ? `<span class="op">${E.fmt(s.price)} dan</span>` : ''}${s.days ? `<span class="od">${icon('clock')} ${text(s.days)}</span>` : ''}</span><i class="ck">${icon('check')}</i></button>`).join('')}</div>`;
    }
    if (n === 1) {
      const fl = arr(sec.fieldsList).filter(Boolean);
      return `${head('Biznesingiz haqida', "Bu bizga sizga mos yechim va dizayn tanlashga yordam beradi.")}
        <div class="fgrid3">${fld('bizName', 'Kompaniya yoki brend nomi *', B.bizName, { auto: 'organization' })}${fld('field', 'Faoliyat sohasi', B.field, { list: 'bflds' })}</div>${fl.length ? `<datalist id="bflds">${fl.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}
        ${fld('about', "Biznesingiz haqida qisqacha (nima qilasiz, kimlarga?)", B.about, { area: 1, rows: 3, max: 600 })}
        ${fld('site', "Mavjud sayt yoki Instagram / Telegram havolasi (bo'lsa)", B.site, { max: 200 })}
        ${arr(sec.goals).length ? `<label class="bl2">Loyihadan asosiy maqsadingiz <small>(bir nechtasini tanlash mumkin)</small></label>${chips(arr(sec.goals), 'goal', true, B.goals)}` : ''}`;
    }
    if (n === 2) {
      const f = feats();
      return `${head('Qanday imkoniyatlar kerak?', f.length ? "Kerakli imkoniyatlarni belgilang. Narx avtomatik hisoblanadi." : "Imkoniyatlarni suhbatda birgalikda aniqlaymiz.")}
        ${f.length ? `<div class="cps big">${f.map((x) => `<button type="button" class="cp ${B.features.includes(x.name) ? 'on' : ''}" data-b="feat" data-v="${esc(x.name)}"><span class="cx">${icon('check')}</span>${text(x.name)}${Number(x.price) > 0 && sec.showEstimate !== false ? `<em>+ ${E.fmt(x.price)}</em>` : ''}</button>`).join('')}</div>` : ''}
        ${fld('extraWish', "Boshqa istaklaringiz yoki aytmoqchi bo'lgan narsalar", B.extraWish, { area: 1, rows: 4, max: 800 })}`;
    }
    if (n === 3) {
      const st = arr(sec.styles), refs = arr(sec.references).filter((r) => imgUrl(r.image));
      return `${head('Qanday ko\'rinish yoqadi?', "Uslub, ranglar va yoqqan namunalarni tanlang. Hech biri yoqmasa, o'tkazib yuboring.")}
        ${st.length ? `<label class="bl2">Dizayn uslubi</label><div class="stys">${st.map((s) => `<button type="button" class="sty ${B.style === s.name ? 'on' : ''}" data-b="style" data-v="${esc(s.name)}"><span class="sp" style="background:linear-gradient(135deg,${esc(/^#[0-9a-f]{3,8}$/i.test(s.c1) ? s.c1 : '#4f46e5')},${esc(/^#[0-9a-f]{3,8}$/i.test(s.c2) ? s.c2 : '#06b6d4')})"><b>Aa</b></span><span class="sn">${text(s.name)}</span><small>${text(s.desc)}</small><i class="ck">${icon('check')}</i></button>`).join('')}</div>` : ''}
        <label class="bl2">Ranglar</label><div class="pals">${PALETTES.map((p, i) => `<button type="button" class="pal ${B.palette === i ? 'on' : ''}" data-b="pal" data-v="${i}" aria-label="Ranglar ${i + 1}">${p.map((c) => `<i style="background:${c}"></i>`).join('')}</button>`).join('')}<button type="button" class="cp ${B.palette === 98 ? 'on' : ''}" data-b="pal" data-v="98">Logotipimdagi ranglar</button><button type="button" class="cp ${B.palette === 99 ? 'on' : ''}" data-b="pal" data-v="99">Maslahat bering</button></div>
        ${refs.length ? `<label class="bl2">Yoqqan namunalar <small>(3 tagacha)</small></label><div class="refs">${refs.map((r) => `<button type="button" class="ref ${B.refs.includes(r.name) ? 'on' : ''}" data-b="ref" data-v="${esc(r.name)}"><img src="${esc(imgUrl(r.image))}" alt="" loading="lazy"><span>${text(r.name)}</span><i class="ck">${icon('check')}</i></button>`).join('')}</div>` : ''}
        <label class="bl2">Yoqqan saytlar havolasi <small>(ixtiyoriy)</small></label><div class="lnks">${[0, 1, 2].map((i) => `<div class="fld"><input data-bl="${i}" value="${esc(B.links[i])}" placeholder=" " maxlength="200"><label>${i + 1}-sayt havolasi</label></div>`).join('')}</div>
        ${arr(sec.languages).length ? `<label class="bl2">Sayt tili</label>${chips(arr(sec.languages), 'lang', true, B.langs)}` : ''}`;
    }
    if (n === 4) {
      const e = estimate(), s = svc();
      return `${head('Muddat va byudjet', "Taxminiy ma'lumot ham yetadi. Aniq narxni suhbatdan keyin kelishamiz.")}
        ${arr(sec.budgets).length ? `<label class="bl2">Byudjetingiz</label>${chips(arr(sec.budgets), 'budget', false, B.budget)}` : ''}
        ${arr(sec.deadlines).length ? `<label class="bl2">Qachon tayyor bo'lishi kerak?</label>${chips(arr(sec.deadlines), 'deadline', false, B.deadline)}` : ''}
        ${fld('note', "Qo'shimcha izoh", B.note, { area: 1, rows: 3, max: 800 })}
        ${sec.showEstimate !== false && s ? `<div class="est"><div><small>Taxminiy narx</small><b>${e ? E.fmt(e) + ' dan' : 'Kelishiladi'}</b></div><div><small>Taxminiy muddat</small><b>${text(s.days || 'Kelishiladi')}</b></div><p>Bu taxminiy hisob. Aniq narx va muddat vazifani muhokama qilgach belgilanadi.</p></div>` : ''}`;
    }
    const u = window.Auth && window.Auth.user && window.Auth.user();
    if (u) { B.cname = B.cname || u.name || ''; B.cphone = B.cphone || u.phone || ''; }
    return `${head("Siz bilan qanday bog'lanamiz?", "Mutaxassisimiz tez orada aloqaga chiqadi va barcha savollarga javob beradi.")}
      <div class="fgrid3">${fld('cname', 'Ismingiz *', B.cname || (u && u.name) || '', { auto: 'name' })}${fld('cphone', 'Telefon raqamingiz *', B.cphone || (u && u.phone) || '', { mode: 'tel', auto: 'tel', max: 40 })}</div>
      ${fld('cemail', 'Email (ixtiyoriy)', B.cemail || (u && u.email) || '', { type: 'email', auto: 'email' })}
      ${arr(sec.methods).length ? `<label class="bl2">Qanday bog'lanish qulay?</label>${chips(arr(sec.methods), 'method', false, B.method)}` : ''}
      ${arr(sec.times).length ? `<label class="bl2">Qulay vaqt</label>${chips(arr(sec.times), 'time', false, B.time)}` : ''}
      <label class="agree"><input type="checkbox" data-bi="agree" ${B.agree ? 'checked' : ''}><span class="tg2"></span><span>Ma'lumotlarim so'rovni ko'rib chiqish uchun ishlatilishiga roziman</span></label>`;
  }

  /* ---------- Yon panel: jonli xulosa ---------- */
  function summary() {
    const s = svc(), f = feats().filter((x) => B.features.includes(x.name)), e = estimate();
    if (!s) return `<p class="bnone">Xizmat turini tanlang, xulosa shu yerda paydo bo'ladi.</p>`;
    return `<div class="sl"><small>Xizmat</small><b>${text(s.name)}</b></div>${B.bizName ? `<div class="sl"><small>Biznes</small><b>${text(B.bizName)}</b></div>` : ''}
      ${f.length ? `<div class="sl"><small>Imkoniyatlar</small><ul>${f.map((x) => `<li>${icon('check')}${text(x.name)}</li>`).join('')}</ul></div>` : ''}
      ${B.style ? `<div class="sl"><small>Uslub</small><b>${text(B.style)}</b></div>` : ''}
      ${sec.showEstimate !== false ? `<div class="sl tot"><small>Taxminiy narx</small><b>${e ? E.fmt(e) + ' dan' : 'Kelishiladi'}</b></div>` : ''}${s.days ? `<div class="sl"><small>Muddat</small><b>${text(s.days)}</b></div>` : ''}`;
  }
  function side() {
    return `<aside class="bws"><div class="bwh"><span class="mark">${text((E.state().company.logo || (E.state().company.name || 'S')[0]).slice(0, 2))}</span><div><b>Loyiha anketasi</b><small>${text(E.state().company.name)}</small></div></div>
      <ol class="bstp">${STEPS.map(([l, i], k) => `<li class="${k === step ? 'act' : ''} ${k < step ? 'done' : ''}" data-b="goto" data-v="${k}"><span>${k < step ? icon('check') : icon(i)}</span>${l}</li>`).join('')}</ol>
      <div class="bsm" id="bsum">${summary()}</div>${sec.promise ? `<div class="bpr">${icon('clock')}<span>${text(sec.promise)}</span></div>` : ''}</aside>`;
  }

  /* ---------- Chizish ---------- */
  function paint() {
    const last = step === STEPS.length - 1;
    $('#bwb').innerHTML = `<div class="bstep in">${stepHtml(step)}</div>`;
    $('#bwf').innerHTML = `<button type="button" class="bk" data-b="back" aria-label="Orqaga" ${step === 0 ? 'hidden' : ''}>${icon('left')}<span class="t">Orqaga</span></button><span class="berr" id="berr" role="alert"></span><div class="bmini">${sec.showEstimate !== false && svc() ? `<small>Taxminan</small><b>${estimate() ? E.fmt(estimate()) : '—'}</b>` : ''}</div><button type="button" class="btn nx" data-b="${last ? 'submit' : 'next'}">${last ? "So'rovni yuborish" : step === 0 ? 'Davom etish' : 'Keyingi'} ${icon(last ? 'send' : 'arrow')}</button>`;
    $('#bwp i').style.width = `${((step + 1) / STEPS.length) * 100}%`;
    $('#bwt').textContent = `${step + 1} / ${STEPS.length}: ${STEPS[step][0]}`;
    $$('.bstp li').forEach((li, k) => { li.className = `${k === step ? 'act' : ''} ${k < step ? 'done' : ''}`; li.firstElementChild.innerHTML = k < step ? icon('check') : icon(STEPS[k][1]); });
    $('#bsum').innerHTML = summary(); $('#bwb').scrollTop = 0; save();
    const f = $('#bwb input[data-bi], #bwb textarea'); if (f && step !== 0 && matchMedia('(min-width:700px)').matches) setTimeout(() => f.focus({ preventScroll: true }), 120);
  }
  function refreshSide() { $('#bsum').innerHTML = summary(); const m = $('.bmini'); if (m) m.innerHTML = sec.showEstimate !== false && svc() ? `<small>Taxminan</small><b>${estimate() ? E.fmt(estimate()) : '—'}</b>` : ''; save(); }

  function validate(n) {
    if (n === 0 && !B.service) return 'Iltimos, xizmat turini tanlang';
    if (n === 1 && B.bizName.trim().length < 2) return 'Kompaniya yoki brend nomini kiriting';
    if (n === 5) {
      if (B.cname.trim().length < 2) return 'Ismingizni kiriting';
      if (!/^[+\d][\d\s()\-]{6,}$/.test(B.cphone.trim())) return "Telefon raqamini to'g'ri kiriting (masalan, +998 90 123 45 67)";
      if (B.cemail.trim() && !/^\S+@\S+\.\S+$/.test(B.cemail.trim())) return "Email noto'g'ri";
      if (!B.agree) return 'Davom etish uchun rozilikni belgilang';
    }
    return '';
  }
  const err = (m) => { const e = $('#berr'); if (e) { e.textContent = m; e.classList.toggle('show', !!m); } };
  function go(n) { if (n < 0 || n >= STEPS.length) return; step = n; paint(); }

  /* ---------- Yuborish ---------- */
  function compose() {
    const s = svc(), ps = B.palette >= 0 && B.palette < 98 ? PALETTES[B.palette].join(', ') : B.palette === 98 ? 'Logotipdagi ranglar' : B.palette === 99 ? 'Maslahat kerak' : '';
    const f = feats().filter((x) => B.features.includes(x.name)).map((x) => x.name);
    const links = B.links.map((x) => x.trim()).filter(Boolean);
    const extra = {}; const put = (k, v) => { if (v && String(v).trim()) extra[k] = String(v).trim().slice(0, 600); };
    put('Xizmat', s && s.name); put('Biznes nomi', B.bizName); put('Soha', B.field); put('Biznes haqida', B.about); put('Mavjud sayt', B.site); put('Maqsadlar', B.goals.join(', '));
    put('Imkoniyatlar', f.join(', ')); put('Boshqa istaklar', B.extraWish); put('Dizayn uslubi', B.style); put('Ranglar', ps); put('Namunalar', B.refs.join(', ')); put('Yoqqan saytlar', links.join(' | '));
    put('Tillar', B.langs.join(', ')); put('Byudjet', B.budget); put('Muddat', B.deadline); put('Taxminiy narx', estimate() ? `${E.money(estimate())} ${E.cur()} dan` : ''); put('Email', B.cemail); put('Aloqa usuli', B.method); put('Qulay vaqt', B.time);
    return { type: 'brief', name: B.cname.trim(), phone: B.cphone.trim(), message: B.note.trim(), items: [], extra, shipping: 0 };
  }
  async function submit() {
    if (busy) return;
    for (let n = 0; n <= 5; n++) { const m = validate(n); if (m) { if (n !== step) go(n); err(m); return; } }
    if (E.isPreview) { err("Ko'rinish rejimi: so'rov yuborilmaydi"); return; }
    if (E.account && E.account.needAuth('brief')) {
      const u = await window.Auth.modal({ title: 'So\'rovni yuborish uchun kiring', text: "Hisobingiz bo'lmasa, ro'yxatdan o'ting. So'rovingiz va uning holati hisobingizda saqlanadi." });
      if (!u) { err('Yuborish uchun hisobga kirish kerak'); return; }
      B.cname = B.cname || u.name; B.cphone = B.cphone || u.phone;
    }
    busy = true; const btn = $('.nx'); if (btn) { btn.disabled = true; btn.textContent = 'Yuborilmoqda…'; }
    const payload = compose();
    try { const r = await E.send(payload); success(r, payload); }
    catch (e) {
      busy = false; const b2 = $('.nx'); if (b2) { b2.disabled = false; b2.innerHTML = `So'rovni yuborish ${icon('send')}`; }
      if (e.status === 401 && E.account && E.account.on()) { err('Seans tugagan. Qayta urinib, hisobga kiring.'); return; }
      err(e.message);
    }
  }
  function success(r, payload) {
    busy = false; clear();
    const S = E.state(), c = S.contacts || {}, tg = c.telegram ? String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '') : '';
    const id = r.id || Math.random().toString(36).slice(2, 8);
    const u = window.Auth && window.Auth.user && window.Auth.user();
    $('.bwin').classList.add('fin');
    $('.bwin').innerHTML = `<div class="bwok"><div class="tick">${icon('check')}</div><h2>${text(r.mail ? 'Deyarli tayyor!' : (sec.successTitle || "So'rovingiz qabul qilindi!"))}</h2>
      <p class="sub">${text(r.mail ? "Pochta ilovangiz ochildi. Xabarni yuborishni unutmang, shundan keyin biz siz bilan bog'lanamiz." : (sec.successText || "Tez orada siz bilan bog'lanamiz."))}</p>
      ${r.ok ? `<div class="ref2">Murojaat raqami: <b>#${esc(id)}</b></div>` : ''}
      <div class="nxt"><div><span>1</span><b>Aloqa</b><small>${text(sec.promise || 'Tez orada qo\'ng\'iroq qilamiz')}</small></div><div><span>2</span><b>Muhokama</b><small>Vazifa, narx va muddat kelishiladi</small></div><div><span>3</span><b>Ish boshlanadi</b><small>Har kuni hisobot beramiz</small></div></div>
      <div class="bwa">${c.phone ? `<a class="btn ghost" href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${icon('tel')} ${text(c.phone)}</a>` : ''}${tg ? `<a class="btn ghost" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">${icon('send')} Telegram</a>` : ''}${u && r.ok ? `<a class="btn ghost" href="/kabinet.html">${icon('user')} Kabinetim</a>` : ''}<button class="btn" data-b="close">Yopish</button></div></div>`;
  }

  /* ---------- Ochish / yopish ---------- */
  function close() {
    if (root) { root.remove(); root = null; }
    document.body.classList.remove('noscroll'); if (keyFn) { document.removeEventListener('keydown', keyFn); keyFn = null; }
  }
  function open(svcId) {
    sec = E.state().sections.find((s) => s.type === 'brief' && s.enabled !== false);
    if (!sec) { E.toast("Anketa hozircha mavjud emas"); return; }
    if (!svcs().length) { E.toast('Anketada xizmatlar kiritilmagan'); return; }
    B = fresh(); step = 0;
    try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && d.B && d.B.v === 2) { B = Object.assign(fresh(), d.B); if (!svc()) B.service = ''; step = Math.min(d.step || 0, 5); } } catch { /* ignore */ }
    if (svcId && svcs().some((s) => s.id === svcId)) { if (B.service !== svcId) { B.service = svcId; B.features = []; } if (step === 0) step = 1; }
    if (root) root.remove();
    root = document.createElement('div'); root.className = 'bw'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Buyurtma anketasi');
    root.innerHTML = `<div class="bwback" data-b="close"></div><div class="bwin">${side()}<section class="bwm"><header><div class="bwt" id="bwt"></div><div class="bwp" id="bwp"><i></i></div><button type="button" class="bx" data-b="close" aria-label="Yopish">${icon('x')}</button></header><div class="bwb" id="bwb"></div><footer class="bwf" id="bwf"></footer></section></div>`;
    document.body.appendChild(root); document.body.classList.add('noscroll'); paint();
    keyFn = (e) => { if (!root) return; if (e.key === 'Escape') close(); else if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); step === 5 ? submit() : next(); } };
    document.addEventListener('keydown', keyFn);
    root.addEventListener('click', onClick); root.addEventListener('input', onInput); root.addEventListener('change', onInput);
  }
  function next() { const m = validate(step); if (m) { err(m); return; } err(''); go(step + 1); }

  function onClick(e) {
    const t = e.target.closest('[data-b]'); if (!t) return;
    const k = t.dataset.b, v = t.dataset.v, one = (list, cur) => { $$(`[data-b="${k}"]`, root).forEach((x) => x.classList.toggle('on', x === t && cur)); };
    if (k === 'close') return close();
    if (k === 'next') return next();
    if (k === 'back') { err(''); return go(step - 1); }
    if (k === 'submit') return submit();
    if (k === 'goto') { const n = +v; if (n < step) go(n); else if (n === step + 1 || n <= step) { const m = validate(step); if (m) err(m); else go(n); } return; }
    err('');
    if (k === 'svc') { B.service = v; B.features = B.features.filter((x) => feats().some((f) => f.name === x)); one(null, true); refreshSide(); setTimeout(() => { if (root && step === 0) go(1); }, 260); return; }
    if (k === 'goal') { tog(B.goals, v); t.classList.toggle('on'); }
    if (k === 'feat') { tog(B.features, v); t.classList.toggle('on'); }
    if (k === 'lang') { tog(B.langs, v); t.classList.toggle('on'); }
    if (k === 'ref') { if (!B.refs.includes(v) && B.refs.length >= 3) { err('Eng ko\'pi bilan 3 ta namuna tanlash mumkin'); return; } tog(B.refs, v); t.classList.toggle('on'); }
    if (k === 'style') { B.style = B.style === v ? '' : v; one(null, !!B.style); }
    if (k === 'pal') { B.palette = B.palette === +v ? -1 : +v; $$('[data-b="pal"]', root).forEach((x) => x.classList.toggle('on', +x.dataset.v === B.palette)); }
    if (k === 'budget' || k === 'deadline' || k === 'method' || k === 'time') { B[k] = B[k] === v ? '' : v; one(null, !!B[k]); }
    refreshSide();
  }
  function onInput(e) {
    const t = e.target;
    if (t.dataset.bi) { B[t.dataset.bi] = t.type === 'checkbox' ? t.checked : t.value; if (t.dataset.bi === 'bizName') refreshSide(); else save(); }
    if (t.dataset.bl !== undefined) { B.links[+t.dataset.bl] = t.value; save(); }
    if (t.dataset.bi || t.dataset.bl !== undefined) err('');
  }

  E.actions['brief-open'] = (el) => open(el && el.dataset ? el.dataset.svc : '');
  E.openBrief = open;
})();
