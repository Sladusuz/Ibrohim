(function () {
  'use strict';
  const C = window.BC.core, api = window.BC.api, { esc, money, I, normPhone } = C, $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];

  C.ready.then((D) => {
    const main = $('#main'), L = () => C.cart.lines();
    if (!L().length) {
      main.innerHTML = `<div class="page"><div class="wrap"><div class="empty">${BC.art('stroller', '#2b59ff')}<h3>Savat bo'sh</h3><p>Buyurtma berish uchun avval mahsulot qo'shing.</p><a class="btn" href="shop.html">Katalogga o'tish ${I.arr}</a></div></div></div>`; return;
    }
    const me = C.store.get('me', {}), fld = (id, label, extra = '', tag = 'input', val = '') => `<label class="fld" id="f-${id}"><${tag} id="${id}" placeholder=" " ${extra}>${tag === 'textarea' ? `${esc(val)}</textarea>` : ''}<span>${label}</span><div class="em"></div></label>`;
    main.innerHTML = `<div class="page"><div class="wrap">
      <div class="page-head"><div class="crumbs" data-r><a href="index.html">Bosh sahifa</a><i>/</i><span>Buyurtma</span></div><h1 data-split>Buyurtmani rasmiylashtirish</h1></div>
      <form class="co" id="coForm" novalidate><div>
        <div class="fs" data-r><h3><b>1</b>Aloqa</h3>${fld('name', 'Ismingiz', `autocomplete="name" value="${esc(me.name || '')}" required`)}${fld('phone', 'Telefon (90 123 45 67)', `type="tel" inputmode="tel" autocomplete="tel" value="${esc(me.phone || '')}" required`)}</div>
        <div class="fs" data-r><h3><b>2</b>Yetkazib berish</h3><div class="opts"><label class="opt"><input type="radio" name="delivery" value="courier" checked><div><b>Kuryer</b><span>Manzilingizgacha</span></div></label><label class="opt"><input type="radio" name="delivery" value="pickup"><div><b>Olib ketish</b><span>Bepul</span></div></label></div>
          <div id="addrWrap">${fld('address', "Manzil: shahar, tuman, ko'cha, uy", `autocomplete="street-address" value="${esc(me.address || '')}"`)}</div></div>
        <div class="fs" data-r><h3><b>3</b>To'lov</h3><div class="opts"><label class="opt"><input type="radio" name="payment" value="cash" checked><div><b>Naqd</b><span>Qabul qilganda</span></div></label><label class="opt"><input type="radio" name="payment" value="card"><div><b>Karta</b><span>Qabul qilganda terminal orqali</span></div></label></div>${fld('comment', 'Izoh (ixtiyoriy)', 'rows="3"', 'textarea')}</div>
        <div id="coErr"></div></div>
        <aside class="sum card" id="sum" data-r></aside></form></div></div>`;

    const delivery = () => $('#coForm').delivery.value;
    function sum() {
      const T = C.cart.totals(delivery()), lines = L();
      $('#sum').innerHTML = `<h3>Sizning buyurtmangiz</h3>${lines.map((l) => { const hex = (l.p.colors || []).find((c) => c.name === l.color)?.hex || C.pColor(l.p); return `<div class="sl" style="--c:${hex}"><div class="th">${C.media(l.p, hex)}</div><div><b>${esc(l.p.title)}</b><small class="num">${l.color ? `<i class="dot" style="--c:${hex}"></i>${esc(l.color)} · ` : ''}${l.qty} × ${C.priceTxt(l.p.price)}</small></div><b class="num">${C.priceTxt(l.p.price * l.qty)}</b></div>`; }).join('')}
        <div class="row2"><span>Mahsulotlar</span><span class="num">${money(T.sub)}</span></div><div class="row2"><span>Yetkazib berish</span><span class="num">${T.fee ? money(T.fee) : 'Bepul'}</span></div>
        <div class="row2 t"><span>Jami</span><span class="num">${money(T.total)}</span></div><button class="btn block" type="submit" id="placeBtn">Buyurtmani tasdiqlash ${I.arr}</button>
        <p class="secure"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.500-3.200 7.800-8 9-4.800-1.200-8-4.500-8-9V6z"/><path d="m8.500 12 2.500 2.500 4.500-5"/></svg>Narx va ombor serverda tekshiriladi. To'lov mahsulot qabul qilinganda.</p>`;
    }
    sum();
    const form = $('#coForm');
    form.addEventListener('change', (e) => { if (e.target.name === 'delivery') { $('#addrWrap').style.display = delivery() === 'pickup' ? 'none' : ''; sum(); } });
    form.addEventListener('input', (e) => e.target.closest('.fld')?.classList.remove('err'));
    document.addEventListener('bc:cart', () => { if (!L().length) location.reload(); else sum(); });
    const setErr = (id, msg) => { const f = $('#f-' + id); f.classList.toggle('err', !!msg); $('.em', f).textContent = msg || ''; return !msg; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); $('#coErr').innerHTML = '';
      const name = $('#name').value.trim(), phone = $('#phone').value, addr = $('#address').value.trim();
      const ok = [setErr('name', name.length < 2 ? 'Ismingizni kiriting' : ''), setErr('phone', normPhone(phone) ? '' : "Telefon raqamini to'liq kiriting"), setErr('address', delivery() === 'courier' && addr.length < 5 ? 'Manzilni kiriting' : '')].every(Boolean);
      if (!ok) { const el = $('.fld.err'); el && C.scrollTo(el, { offset: -140 }); return; }
      const btn = $('#placeBtn'); btn.disabled = true; btn.firstChild.textContent = 'Yuborilmoqda... ';
      try {
        const lines = L(), res = await api.placeOrder({ name, phone, address: addr, comment: $('#comment').value, delivery: delivery(), payment: form.payment.value, items: lines.map((l) => ({ id: l.p.id, qty: l.qty, color: l.color })) });
        C.store.set('me', { name, phone: normPhone(phone), address: addr });
        try { sessionStorage.setItem('bc_last', JSON.stringify({ no: res.no, total: res.total, fee: res.fee, name, phone: normPhone(phone), items: lines.map((l) => ({ title: l.p.title, qty: l.qty, price: l.p.price, color: l.color })) })); } catch { /* */ }
        C.cart.clear(); try { sessionStorage.removeItem('bc3_cat'); } catch { /* */ } C.leave('order.html?no=' + encodeURIComponent(res.no));
      } catch (err) { $('#coErr').innerHTML = `<div class="alert">${esc(err.message)}</div>`; btn.disabled = false; btn.firstChild.textContent = 'Buyurtmani tasdiqlash '; C.toast(err.message, true); }
    });
    C.observe(main);
  });
})();
