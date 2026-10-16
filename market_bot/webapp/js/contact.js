(function () {
  'use strict';
  const C = window.BC.core, api = window.BC.api, { esc, I, normPhone } = C, $ = (s, el = document) => el.querySelector(s);

  C.ready.then((D) => {
    const s = D.settings, tg = (s.telegram || '').replace('@', ''), tel = (s.phone || '').replace(/\s/g, '');
    const card = (href, ico, label, val, copy, ext) => `<div class="cc" data-r><span class="ico">${ico}</span><span><small>${label}</small><strong>${esc(val)}</strong></span>${copy ? `<button class="btn line xs copy" data-copy="${esc(copy)}">Nusxalash</button>` : ''}<a class="cc-a" href="${href}" ${ext ? 'target="_blank" rel="noopener"' : ''} aria-label="${esc(label)}"></a></div>`;
    $('#main').innerHTML = `<div class="page"><div class="wrap">
      <div class="page-head"><div class="crumbs" data-r><a href="index.html">Bosh sahifa</a><i>/</i><span>Bog'lanish</span></div><h1 data-split>Gaplashamiz</h1><p>Yoshi va qiziqishiga mos modelni tanlashda yordam beramiz. Eng tez javob Telegramda.</p></div>
      <div class="contact"><div class="ccards">
        ${card(`tel:${esc(tel)}`, I.phone, 'Telefon', s.phone || '', s.phone || '')}
        ${card(C.tgLink(), I.tg, 'Telegram (buyurtma)', '@' + tg, '@' + tg, true)}
        ${card(esc(s.channel || '#'), I.tg, 'Telegram guruh', "Hamjamiyatga qo'shiling", '', true)}
        ${card(esc(s.instagram || '#'), I.ig, 'Instagram', '@babycheer_shop', '@babycheer_shop', true)}</div>
        <form class="cform card" id="cf" novalidate data-r><h3>Xabar qoldiring</h3><p>Raqamingizni qoldiring, operator o'zi bog'lanadi.</p>
          <label class="fld" id="f-n"><input id="n" placeholder=" " autocomplete="name"><span>Ismingiz</span><div class="em"></div></label>
          <label class="fld" id="f-p"><input id="p" type="tel" placeholder=" " autocomplete="tel" inputmode="tel"><span>Telefon (90 123 45 67)</span><div class="em"></div></label>
          <label class="fld" id="f-m"><textarea id="m" placeholder=" " rows="4"></textarea><span>Xabaringiz</span><div class="em"></div></label><div id="cfr"></div>
          <button class="btn" type="submit" id="cfb">Yuborish ${I.arr}</button></form></div></div></div>`;
    const me = C.store.get('me', {}); if (me.name) $('#n').value = me.name; if (me.phone) $('#p').value = me.phone;
    const setErr = (id, msg) => { const f = $('#f-' + id); f.classList.toggle('err', !!msg); $('.em', f).textContent = msg || ''; return !msg; };
    $('#cf').addEventListener('input', (e) => e.target.closest('.fld')?.classList.remove('err'));
    $('#cf').addEventListener('submit', async (e) => {
      e.preventDefault(); $('#cfr').innerHTML = '';
      const name = $('#n').value.trim(), phone = $('#p').value, msg = $('#m').value.trim();
      if (![setErr('n', name.length < 2 ? 'Ismingizni kiriting' : ''), setErr('p', normPhone(phone) ? '' : "Telefon raqamini to'liq kiriting"), setErr('m', msg.length < 3 ? 'Xabarni yozing' : '')].every(Boolean)) return;
      const b = $('#cfb'); b.disabled = true; b.firstChild.textContent = 'Yuborilmoqda... ';
      try { await api.sendMessage({ name, phone, message: msg }); C.store.set('me', { ...me, name, phone: normPhone(phone) }); $('#cf').innerHTML = `<div style="text-align:center;padding:40px 10px;display:grid;gap:16px;justify-items:center"><svg class="ring" viewBox="0 0 120 120" fill="none" stroke="var(--ok)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" style="width:110px;height:110px"><circle cx="60" cy="60" r="54"/><path d="m36 62 17 17 31-36"/></svg><h3 style="font-size:30px">Xabaringiz yuborildi</h3><p style="color:var(--muted);max-width:340px">Rahmat, ${esc(name)}! Operator tez orada ${esc(normPhone(phone))} raqamiga bog'lanadi.</p><a class="btn line" href="shop.html">Katalogni ko'rish ${I.arr}</a></div>`; }
      catch (err) { $('#cfr').innerHTML = `<div class="alert">${esc(err.message)}</div>`; b.disabled = false; b.firstChild.textContent = 'Yuborish '; }
    });
    C.observe($('#main'));
  });
})();
