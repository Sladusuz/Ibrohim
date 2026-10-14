(function () {
  'use strict';
  const C = window.BC.core, api = window.BC.api, { esc, money, I, normPhone, reduce } = C, $ = (s, el = document) => el.querySelector(s);

  C.ready.then((D) => {
    const main = $('#main'), qs = new URLSearchParams(location.search), no = (qs.get('no') || '').trim();
    let last = null; try { last = JSON.parse(sessionStorage.getItem('bc_last') || 'null'); } catch { /* */ }
    const mine = last && last.no === no ? last : null;
    const FLOW = [['new', 'Qabul qilindi'], ['confirmed', 'Tasdiqlandi'], ['shipping', "Yo'lda"], ['delivered', 'Yetkazildi']];

    main.innerHTML = `<div class="page"><div class="wrap">
      ${mine ? `<div class="ok-wrap"><svg class="ring" viewBox="0 0 120 120" fill="none" stroke="var(--ok)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="60" r="54"/><path d="m36 62 17 17 31-36"/></svg>
        <span class="eyebrow"><i style="background:var(--ok)"></i>Buyurtma qabul qilindi</span><div class="ok-no num" data-split>${esc(no)}</div>
        <p style="color:var(--muted);max-width:480px;font-size:18px;font-weight:500">${esc(mine.name)}, rahmat! Operator <b class="num" style="color:var(--ink)">${esc(mine.phone)}</b> raqamiga tez orada qo'ng'iroq qiladi.</p>
        <div class="card track" style="width:min(560px,100%)" data-r>${mine.items.map((i) => `<div class="row2"><span>${esc(i.title)}${i.color ? ` · ${esc(i.color)}` : ''} × ${i.qty}</span><b class="num" style="color:var(--ink)">${money(i.price * i.qty)}</b></div>`).join('')}${mine.fee ? `<div class="row2"><span>Yetkazib berish</span><b class="num" style="color:var(--ink)">${money(mine.fee)}</b></div>` : ''}<div class="row2 t"><span>Jami</span><span class="num">${money(mine.total)}</span></div></div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center" data-r><a class="btn" href="shop.html">Xaridni davom ettirish ${I.arr}</a><a class="btn glass" target="_blank" rel="noopener" href="${C.tgLink(`Assalomu alaykum! ${no} raqamli buyurtmam bo'yicha yozyapman.`)}">Telegramda yozish</a></div>
        <p class="fnote" style="max-width:420px">Buyurtma raqamini saqlab qo'ying: holatni shu sahifada kuzatasiz.</p></div>`
      : `<div class="page-head" style="padding-bottom:20px"><div class="crumbs"><a href="index.html">Bosh sahifa</a><i>/</i><span>Kuzatish</span></div><h1 data-split>Buyurtmani kuzatish</h1><p>Buyurtma raqami va telefon raqamingizni kiriting.</p></div>`}
      <div style="display:grid;justify-items:center;gap:20px;margin-top:${mine ? '56px' : '0'}">
        <form id="trForm" class="card track" novalidate style="gap:14px"><h3 style="font-size:26px">${mine ? 'Holatni tekshirish' : 'Buyurtma ma\'lumotlari'}</h3>
          <label class="fld" id="f-tno"><input id="tno" placeholder=" " value="${esc(no)}" autocomplete="off"><span>Buyurtma raqami (BC-1001)</span><div class="em"></div></label>
          <label class="fld" id="f-tph"><input id="tph" type="tel" placeholder=" " value="${esc(mine ? mine.phone : (C.store.get('me', {}).phone || ''))}" autocomplete="tel"><span>Buyurtmadagi telefon raqami</span><div class="em"></div></label>
          <button class="btn" type="submit">Tekshirish ${I.arr}</button></form><div id="trRes" style="width:100%;display:grid;justify-items:center"></div></div></div></div>`;

    function show(o) {
      const idx = FLOW.findIndex((f) => f[0] === o.status), cancelled = o.status === 'cancelled';
      $('#trRes').innerHTML = `<div class="card track" data-r><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><b class="num" style="font:800 30px var(--font-d);letter-spacing:-.04em">${esc(o.no)}</b><span class="pill">${new Date(o.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
        ${cancelled ? '<div class="alert">Buyurtma bekor qilingan. Savollar bo\'lsa, bizga yozing.</div>' : `<div class="tl" id="tl"><div class="f" id="tlf"></div>${FLOW.map((f, i) => `<div class="${i <= idx ? 'done' : ''}"><i></i>${f[1]}</div>`).join('')}</div>`}
        ${(o.items || []).map((i) => `<div class="row2"><span>${esc(i.title)}${i.color ? ` · ${esc(i.color)}` : ''} × ${i.qty}</span><b class="num" style="color:var(--ink)">${money(i.price * i.qty)}</b></div>`).join('')}<div class="row2 t"><span>Jami</span><span class="num">${money(o.total)}</span></div></div>`;
      const f = $('#tlf'); if (f) requestAnimationFrame(() => { f.style.width = `calc(${Math.max(idx, 0) / (FLOW.length - 1)} * 75%)`; }); C.observe($('#trRes'));
    }
    async function run() {
      const n = $('#tno').value.trim(), ph = $('#tph').value, e1 = !n, e2 = !normPhone(ph);
      $('#f-tno').classList.toggle('err', e1); $('#f-tno .em').textContent = e1 ? 'Raqamni kiriting' : ''; $('#f-tph').classList.toggle('err', e2); $('#f-tph .em').textContent = e2 ? "Telefon raqamini to'liq kiriting" : ''; if (e1 || e2) return;
      $('#trRes').innerHTML = '<p class="fnote">Tekshirilmoqda...</p>';
      try { const o = await api.trackOrder(n, ph); if (!o) { $('#trRes').innerHTML = '<div class="alert">Buyurtma topilmadi. Raqam va telefonni tekshiring.</div>'; return; } show(o); }
      catch (err) { $('#trRes').innerHTML = `<div class="alert">${esc(err.message)}</div>`; }
    }
    $('#trForm').addEventListener('submit', (e) => { e.preventDefault(); run(); });
    $('#trForm').addEventListener('input', (e) => e.target.closest('.fld')?.classList.remove('err'));
    if (mine) run();
    C.observe(main);

    // tabrik konfetti
    if (mine && !reduce) document.addEventListener('bc:shown', () => confetti(), { once: true });
    function confetti() {
      const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.append(cv); const g = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; g.scale(dpr, dpr); const cols = ['#2b59ff', '#ff5a36', '#ffb800', '#0fa968', '#ec4899', '#8b5cf6'];
      const ps = Array.from({ length: 160 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.34, vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 16 - 4, r: Math.random() * 7 + 4, c: cols[(Math.random() * cols.length) | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, t: 0 }));
      let f = 0; (function step() { g.clearRect(0, 0, innerWidth, innerHeight); ps.forEach((p) => { p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - f / 150); g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); }); if (++f < 150) requestAnimationFrame(step); else cv.remove(); })();
    }
  });
})();
