(function () {
  'use strict';
  const CFG = window.BC_CONFIG, CATS = window.BC_CATEGORIES, PRODUCTS = window.BC_PRODUCTS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bc_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bc_' + k, JSON.stringify(v)); } catch { /* xotira yo'q */ } },
  };
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const catOf = (id) => CATS.find((c) => c.id === id);

  const S = { cat: 'all', q: '', sort: 'pop', onlyFav: false, cart: store.get('cart', {}), favs: new Set(store.get('favs', [])), stage: 'cart' };
  // Saqlangan savatdan o'chirilgan mahsulotlarni tozalash
  Object.keys(S.cart).forEach((id) => { if (!byId(+id)) delete S.cart[id]; });

  /* ---------- sozlamalar ---------- */
  const tel = CFG.phone.replace(/\s/g, '');
  $('#topPhone').textContent = CFG.phone; $('#topPhone').href = 'tel:' + tel;
  $('#phoneTxt').textContent = CFG.phone;
  $('#tgChannel').href = CFG.telegramChannel; $('#igLink').href = CFG.instagram;
  ['#heroTg', '#tgFloat'].forEach((s) => ($(s).href = 'https://t.me/' + CFG.telegramAdmin));

  /* ---------- mavzu ---------- */
  $('#themeBtn').onclick = () => {
    const dark = document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', document.documentElement.dataset.theme);
  };
  const savedTheme = store.get('theme', null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  /* ---------- toast ---------- */
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    $('#toasts').append(t); setTimeout(() => t.remove(), 2700);
  }

  /* ---------- yulduzli osmon ---------- */
  (function sky() {
    const cv = $('#stars'), ctx = cv.getContext('2d');
    let w, h, stars = [], shoot = null, dpr = Math.min(devicePixelRatio || 1, 2);
    function size() {
      const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round(w * h / 5200) }, () => ({
        x: Math.random() * w, y: Math.random() * h * .85, r: Math.random() * 1.7 + .3,
        p: Math.random() * 6.28, s: Math.random() * 1.6 + .6, warm: Math.random() < .25,
      }));
    }
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = .35 + .65 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
        ctx.globalAlpha = a; ctx.fillStyle = s.warm ? '#ffd966' : '#fff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        if (s.r > 1.5) { ctx.globalAlpha = a * .5; ctx.fillRect(s.x - s.r * 3, s.y - .4, s.r * 6, .8); ctx.fillRect(s.x - .4, s.y - s.r * 3, .8, s.r * 6); }
      }
      if (!shoot && Math.random() < .004) shoot = { x: Math.random() * w * .7, y: Math.random() * h * .3, life: 0 };
      if (shoot) {
        shoot.life += 1; const k = shoot.life / 38, x = shoot.x + k * 260, y = shoot.y + k * 110;
        const g = ctx.createLinearGradient(x, y, x - 90, y - 38); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 1 - k * .6; ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 90, y - 38); ctx.stroke();
        if (shoot.life > 38) shoot = null;
      }
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(frame);
    }
    size(); addEventListener('resize', size); requestAnimationFrame(frame);
    if (reduce) frame(0);
    // oy sichqoncha bilan biroz suriladi
    const moon = $('#moon');
    if (!reduce && matchMedia('(pointer: fine)').matches) {
      addEventListener('pointermove', (e) => {
        const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
        moon.style.translate = `${-x * 36}px ${-y * 24}px`;
      });
    }
  })();

  /* ---------- hero mashinasi, ticker, hisoblagichlar ---------- */
  $('#heroCar').innerHTML = BCArt('car', '#FF5A6A');
  const tickerWords = ['Elektromobillar', 'Kalyaskalar', 'Velokalyaskalar', 'Mototsikllar', 'Samokatlar', 'Velosipedlar', 'Bepul yetkazib berish', 'Telegramda buyurtma'];
  $('#ticker').innerHTML = [...tickerWords, ...tickerWords].map((w) => `<span>${w}</span>`).join('');

  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    const fmt = (v) => dec ? v.toFixed(dec) : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    if (reduce) return (el.textContent = fmt(to));
    const t0 = performance.now(), dur = 1800;
    (function tick(t) {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  $$('[data-count]').forEach((el) => setTimeout(() => countUp(el), 600));

  /* ---------- kategoriyalar va filtr ---------- */
  function countIn(id) { return PRODUCTS.filter((p) => p.cat === id).length; }
  $('#catGrid').innerHTML = CATS.map((c) => `
    <button class="cat" data-cat="${c.id}" style="--c:${c.color}"><div class="art">${BCArt(c.art, c.color)}</div>
      <strong>${esc(c.name)}</strong><small>${countIn(c.id)} ta mahsulot</small></button>`).join('');
  function renderChips() {
    $('#chips').innerHTML = [{ id: 'all', name: 'Hammasi' }, ...CATS].map((c) =>
      `<button class="chip ${S.cat === c.id ? 'on' : ''}" data-cat="${c.id}">${esc(c.name)}</button>`).join('') +
      `<button class="chip ${S.onlyFav ? 'on' : ''}" data-fav-filter>Sevimlilar</button>`;
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]');
    if (c) { S.cat = c.dataset.cat; S.onlyFav = false; renderChips(); renderGrid(); $$('.cat').forEach((el) => el.classList.toggle('on', el.dataset.cat === S.cat));
      if (c.classList.contains('cat')) $('#catalog').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    if (e.target.closest('[data-fav-filter]')) { S.onlyFav = !S.onlyFav; renderChips(); renderGrid(); }
  });
  $('#q').addEventListener('input', (e) => { S.q = e.target.value.trim().toLowerCase(); renderGrid(); });
  $('#q').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#catalog').scrollIntoView({ behavior: 'smooth' }); });
  $('#sort').onchange = (e) => { S.sort = e.target.value; renderGrid(); };
  $('#favBtn').onclick = () => { S.onlyFav = true; S.cat = 'all'; renderChips(); renderGrid(); $('#catalog').scrollIntoView({ behavior: 'smooth' }); if (!S.favs.size) toast("Sevimlilar hali bo'sh. Yurakchani bosing"); };

  function filtered() {
    let a = PRODUCTS.filter((p) => (S.cat === 'all' || p.cat === S.cat) && (!S.onlyFav || S.favs.has(p.id)) &&
      (!S.q || (p.title + ' ' + (catOf(p.cat)?.name || '')).toLowerCase().includes(S.q)));
    const disc = (p) => (p.old > p.price ? (p.old - p.price) / p.old : 0);
    const sorts = { pop: (x, y) => y.sold - x.sold, cheap: (x, y) => x.price - y.price, exp: (x, y) => y.price - x.price, sale: (x, y) => disc(y) - disc(x) };
    return a.sort(sorts[S.sort]);
  }
  const heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 7 4.5c2 0 3.5 1.1 5 3 1.500-1.900 3-3 5-3 3.800 0 6 3.800 4.500 7.300C19.500 16.400 12 21 12 21z"/></svg>';
  function card(p) {
    const sale = p.old > p.price ? Math.round((1 - p.price / p.old) * 100) : 0;
    const img = p.images && p.images[0] ? `<img class="art" src="${esc(p.images[0])}" alt="${esc(p.title)}" style="object-fit:contain">` : `<div class="art">${BCArt(catOf(p.cat)?.art, p.color)}</div>`;
    return `<article class="card" data-id="${p.id}" style="--c:${p.color}">
      <div class="pic" data-open="${p.id}">${p.badge || sale ? `<span class="badge ${sale ? 'sale' : ''}">${sale ? '-' + sale + '%' : esc(p.badge)}</span>` : ''}
        <button class="fav ${S.favs.has(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Sevimlilarga qo'shish">${heart}</button>${img}</div>
      <div class="body"><h3 data-open="${p.id}">${esc(p.title)}</h3>
        <div class="meta"><span>★ <b>${p.rating}</b></span><span>${p.sold} ta sotilgan</span></div>
        <div class="price-row"><span class="price num">${money(p.price)}</span>${p.old > p.price ? `<s class="price-old num">${money(p.old)}</s>` : ''}</div>
        <button class="btn sun add" data-add="${p.id}">Savatga qo'shish</button></div></article>`;
  }
  function renderGrid() {
    const list = filtered();
    $('#grid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty">Hech narsa topilmadi. Boshqa so'z yoki kategoriyani sinab ko'ring.</div>`;
    $('#resultNote').textContent = `${list.length} ta mahsulot topildi${S.q ? ` "${S.q}" bo'yicha` : ''}`;
    $$('.card').forEach(bindTilt); revealAll($$('.card'));
  }
  function bindTilt(el) {
    if (reduce || !matchMedia('(pointer: fine)').matches) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 9 + 'deg');
      el.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 7 + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }

  /* ---------- sevimlilar, savat ---------- */
  const persist = () => { store.set('cart', S.cart); store.set('favs', [...S.favs]); };
  function badge(id, n) { const el = $(id); el.hidden = !n; el.textContent = n; }
  function updateBadges() {
    badge('#cartCount', Object.values(S.cart).reduce((a, b) => a + b, 0)); badge('#favCount', S.favs.size);
  }
  function addToCart(id, qty = 1, from) {
    S.cart[id] = (S.cart[id] || 0) + qty; persist(); updateBadges();
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    if (from && !reduce) fly(from, id);
    toast(`"${byId(id).title}" savatga qo'shildi`);
    if ($('#drawer').classList.contains('on')) renderDrawer();
  }
  function fly(fromEl, id) {
    const p = byId(id), r = (fromEl.closest('.card')?.querySelector('.art') || fromEl).getBoundingClientRect(), t = $('#cartBtn').getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'fly'; d.innerHTML = BCArt(catOf(p.cat)?.art, p.color);
    d.style.left = r.left + r.width / 2 - 45 + 'px'; d.style.top = r.top + r.height / 2 - 35 + 'px'; document.body.append(d);
    const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
    d.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: `translate(${dx * .5}px,${dy * .5 - 90}px) scale(.8) rotate(-12deg)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px,${dy}px) scale(.12) rotate(-25deg)`, opacity: .4 }], { duration: 850, easing: 'cubic-bezier(.5,0,.7,.4)' }).onfinish = () => d.remove();
  }
  function toggleFav(id, btn) {
    S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); persist(); updateBadges();
    $$(`[data-fav="${id}"]`).forEach((b) => b.classList.toggle('on', S.favs.has(id)));
    if (S.onlyFav && !S.favs.has(id)) renderGrid();
  }

  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]'); if (add) { addToCart(+add.dataset.add, 1, add); return; }
    const fav = e.target.closest('[data-fav]'); if (fav) { e.stopPropagation(); toggleFav(+fav.dataset.fav, fav); return; }
    const open = e.target.closest('[data-open]'); if (open) openModal(+open.dataset.open);
    const cp = e.target.closest('[data-copy]');
    if (cp) { const v = cp.dataset.copy; (navigator.clipboard?.writeText(v) || Promise.reject()).then(() => toast('Nusxalandi: ' + v), () => toast(v)); }
  });

  /* ---------- mahsulot oynasi ---------- */
  function openModal(id) {
    const p = byId(id), sale = p.old > p.price ? Math.round((1 - p.price / p.old) * 100) : 0;
    const img = p.images && p.images[0] ? `<img src="${esc(p.images[0])}" alt="${esc(p.title)}" style="object-fit:contain;max-height:320px">` : BCArt(catOf(p.cat)?.art, p.color);
    $('#modal').innerHTML = `<div class="sheet-wrap"><button class="x" data-close aria-label="Yopish">×</button><div class="sheet">
      <div class="pic" style="--c:${p.color}">${img}</div>
      <div class="info"><span class="meta"><span>${esc(catOf(p.cat)?.name || '')}</span><span>★ <b>${p.rating}</b></span><span>${p.sold} ta sotilgan</span></span>
        <h2>${esc(p.title)}</h2><div class="price-row"><span class="price num" style="font-size:30px">${money(p.price)}</span>${sale ? `<s class="price-old num">${money(p.old)}</s><span class="badge sale" style="position:static">-${sale}%</span>` : ''}</div>
        <p style="margin:0;color:var(--muted);font-weight:600">${esc(p.desc)}</p>
        <ul class="specs">${Object.entries(p.specs || {}).map(([k, v]) => `<li>${esc(k)}<b>${esc(v)}</b></li>`).join('')}</ul>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sun" style="flex:1" data-add="${p.id}" data-close>Savatga qo'shish</button>
          <a class="btn line" target="_blank" rel="noopener" href="https://t.me/${CFG.telegramAdmin}?text=${encodeURIComponent(`Assalomu alaykum! "${p.title}" (${money(p.price)}) bo'yicha buyurtma bermoqchiman.`)}">Telegramda so'rash</a></div>
      </div></div></div>`;
    $('#modal').classList.add('on'); $('#scrim').classList.add('on'); $('#modal').setAttribute('aria-hidden', 'false');
  }
  function closeAll() {
    $('#modal').classList.remove('on'); $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on');
    $('#drawer').setAttribute('aria-hidden', 'true'); $('#modal').setAttribute('aria-hidden', 'true');
  }
  $('#scrim').onclick = closeAll;
  $('#modal').addEventListener('click', (e) => { if (e.target === $('#modal') || e.target.closest('[data-close]')) setTimeout(closeAll, 30); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  /* ---------- savat paneli ---------- */
  $('#cartBtn').onclick = () => { S.stage = 'cart'; renderDrawer(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); };
  const lines = () => Object.entries(S.cart).map(([id, q]) => ({ p: byId(+id), q })).filter((l) => l.p);
  function totals() {
    const sub = lines().reduce((s, l) => s + l.p.price * l.q, 0);
    const fee = !sub || sub >= CFG.freeDeliveryFrom ? 0 : CFG.deliveryFee;
    return { sub, fee, total: sub + fee };
  }
  function renderDrawer() {
    const d = $('#drawer'), L = lines(), T = totals();
    const head = `<header><h2>${S.stage === 'form' ? 'Buyurtma' : 'Savat'}</h2><button class="icon-btn" data-close-drawer aria-label="Yopish">×</button></header>`;
    if (S.stage === 'done') { d.innerHTML = head + `<div class="list"><div class="done"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.500 4.500 4.500L19 7.500"/></svg></div>
      <h2>Buyurtma qabul qilindi</h2><p style="margin:0;color:var(--muted);font-weight:600">Buyurtma raqami <b class="num">#${S.last.id}</b>. Tasdiqlash uchun matnni Telegramdagi adminga yuboring, shunda buyurtma tezroq ishga tushadi.</p>
      <div class="msg-box">${esc(S.last.text)}</div>
      <a class="btn sun block" target="_blank" rel="noopener" href="https://t.me/${CFG.telegramAdmin}?text=${encodeURIComponent(S.last.text)}">Telegramda yuborish</a>
      <button class="btn line block" data-copy="${esc(S.last.text)}">Matnni nusxalash</button>
      <p style="margin:0;font-size:14px;color:var(--muted);font-weight:700">Yoki qo'ng'iroq qiling: <span class="num">${esc(CFG.phone)}</span></p></div></div>`; return; }
    if (!L.length) { d.innerHTML = head + `<div class="list"><div class="cart-empty">${BCArt('stroller', '#ffb800')}Savat hozircha bo'sh.<br>Yoqqan mahsulotni qo'shing.</div></div>`; return; }
    const left = Math.max(CFG.freeDeliveryFrom - T.sub, 0);
    const items = L.map(({ p, q }) => `<div class="line-item"><div class="thumb" style="--c:${p.color}">${BCArt(catOf(p.cat)?.art, p.color)}</div>
      <div><h4>${esc(p.title)}</h4><div class="num" style="font-weight:800;margin-bottom:6px">${money(p.price)}</div>
        <div class="qty"><button data-dec="${p.id}" aria-label="Kamaytirish">−</button><span class="num">${q}</span><button data-inc="${p.id}" aria-label="Ko'paytirish">+</button></div></div>
      <button class="rm" data-rm="${p.id}" aria-label="O'chirish">×</button></div>`).join('');
    const sums = `<div class="free-bar"><i style="width:${Math.min(T.sub / CFG.freeDeliveryFrom, 1) * 100}%"></i></div>
      <div class="free-note">${left ? `Bepul yetkazib berishgacha yana <b class="num">${money(left)}</b>` : 'Yetkazib berish bepul'}</div>`;
    if (S.stage === 'form') {
      d.innerHTML = head + `<form class="list form" id="orderForm" style="align-content:start"><input id="fName" placeholder="Ismingiz" required autocomplete="name"><input id="fPhone" type="tel" placeholder="Telefon: 90 123 45 67" required autocomplete="tel">
        <input id="fAddr" placeholder="Manzil (shahar, tuman, ko'cha, uy)" required autocomplete="street-address"><textarea id="fNote" rows="2" placeholder="Izoh (ixtiyoriy)"></textarea>
        <div class="sum"><span>Mahsulotlar (${L.length})</span><span class="num">${money(T.sub)}</span></div><div class="sum"><span>Yetkazib berish</span><span class="num">${T.fee ? money(T.fee) : 'Bepul'}</span></div>
        <div class="sum total"><span>Jami</span><span class="num">${money(T.total)}</span></div>
        <button class="btn sun block" type="submit">Buyurtma berish</button><button class="btn line block" type="button" data-back>Savatga qaytish</button></form>`;
      $('#orderForm').onsubmit = submitOrder; return;
    }
    d.innerHTML = head + `<div class="list">${items}</div><footer>${sums}<div class="sum total"><span>Jami</span><span class="num">${money(T.total)}</span></div><button class="btn sun block" data-checkout>Rasmiylashtirish</button></footer>`;
  }
  $('#drawer').addEventListener('click', (e) => {
    const g = (a) => e.target.closest(`[${a}]`);
    if (g('data-close-drawer')) closeAll();
    if (g('data-inc')) { S.cart[g('data-inc').dataset.inc]++; persist(); updateBadges(); renderDrawer(); }
    if (g('data-dec')) { const id = g('data-dec').dataset.dec; if (--S.cart[id] <= 0) delete S.cart[id]; persist(); updateBadges(); renderDrawer(); }
    if (g('data-rm')) { delete S.cart[g('data-rm').dataset.rm]; persist(); updateBadges(); renderDrawer(); }
    if (g('data-checkout')) { S.stage = 'form'; renderDrawer(); }
    if (g('data-back')) { S.stage = 'cart'; renderDrawer(); }
  });
  function submitOrder(e) {
    e.preventDefault();
    const phone = $('#fPhone').value.replace(/\D/g, '');
    if (phone.length < 9) return toast("Telefon raqamini to'liq kiriting");
    const L = lines(), T = totals(), orders = store.get('orders', []);
    const id = (orders.reduce((m, o) => Math.max(m, o.id), 1000) + 1);
    const o = { id, name: $('#fName').value.trim(), phone: '+998' + phone.slice(-9), address: $('#fAddr').value.trim(), note: $('#fNote').value.trim(),
      items: L.map((l) => ({ id: l.p.id, title: l.p.title, price: l.p.price, qty: l.q })), sub: T.sub, fee: T.fee, total: T.total, status: 'new', created: new Date().toISOString() };
    orders.unshift(o); store.set('orders', orders);
    const text = `Yangi buyurtma #${id}\n\n` + o.items.map((i, n) => `${n + 1}. ${i.title} x${i.qty} = ${money(i.price * i.qty)}`).join('\n') +
      `\n\nJami: ${money(o.total)}${o.fee ? ` (yetkazib berish ${money(o.fee)})` : ' (yetkazib berish bepul)'}\nIsm: ${o.name}\nTelefon: ${o.phone}\nManzil: ${o.address}${o.note ? '\nIzoh: ' + o.note : ''}`;
    S.last = { id, text }; S.cart = {}; persist(); updateBadges(); S.stage = 'done'; renderDrawer();
  }

  /* ---------- paydo bo'lish animatsiyasi ---------- */
  function revealAll(els) {
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      en.target.animate([{ opacity: 0, transform: 'translateY(34px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.9,.2,1)' });
    }), { threshold: .12 });
    els.forEach((el) => io.observe(el));
  }
  revealAll([...$$('.sec-head'), ...$$('.cat'), ...$$('.why > div'), ...$$('.community')]);

  renderChips(); renderGrid(); updateBadges();
})();
