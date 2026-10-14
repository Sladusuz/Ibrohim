(function () {
  'use strict';
  const C = window.BC.core, { esc, money, I, reduce } = C, $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  C.ready.then(async (D) => {
    const main = $('#main'), id = new URLSearchParams(location.search).get('id'), p = C.prodById(id), s = D.settings;
    if (!p) {
      main.innerHTML = `<div class="page"><div class="wrap"><div class="empty">${BC.art('stroller', '#2b59ff')}<h3>Mahsulot topilmadi</h3><p>Bu mahsulot sotuvdan olingan yoki havola noto'g'ri.</p><a class="btn" href="shop.html">Katalogga qaytish ${I.arr}</a></div></div></div>`; return;
    }
    const cat = C.catOf(p), cols = p.colors && p.colors.length ? p.colors : [{ name: '', hex: C.pColor(p) }], sale = p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
    const imgs = p.images || [], use360 = imgs.length >= 3 && !!window.BC.photo360 && (await BC.photo360.probe(imgs[0])), use3d = !use360 && !!(p.model3d && window.BC.car3d && window.BC.car3d.supported), warranty = s.warrantyMonths || 6;
    const st = { c: Math.min(+new URLSearchParams(location.search).get('c') || 0, cols.length - 1), q: 1, img: 0 };
    document.title = `${p.title} | BabyCheer`; $('meta[name="description"]')?.setAttribute('content', p.short || p.description.slice(0, 150));
    const rel = D.products.filter((x) => x.category_id === p.category_id && x.id !== p.id).concat(D.products.filter((x) => x.category_id !== p.category_id && x.id !== p.id)).slice(0, 4);
    const ic = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

    main.innerHTML = `<div class="page"><div class="wrap">
      <div class="crumbs" style="margin-bottom:26px" data-r><a href="index.html">Bosh sahifa</a><i>/</i><a href="shop.html">Katalog</a><i>/</i>${cat ? `<a href="shop.html?cat=${esc(cat.slug)}">${esc(cat.name)}</a><i>/</i>` : ''}<span>${esc(p.title)}</span></div>
      <div class="pdp"><div class="pstage"><div class="main ${use360 ? 'photo' : ''}" id="pmain" style="--c:${cols[st.c].hex}">
          ${sale ? `<span class="tag sale">-${sale}%</span>` : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}
          ${use360 ? '<div id="p360host" style="position:absolute;inset:0"></div>' : use3d ? `<div class="v3d" id="v3d"></div><span class="badge3d"><i></i>3D ko'rinish</span><div class="rot" id="rot"><button data-v="front">Old</button><button data-v="side">Yon</button><button data-v="rear">Orqa</button><button data-v="top">Tepa</button></div>`
            : imgs.length ? `<img class="ph" id="phImg" src="${esc(imgs[0])}" alt="${esc(p.title)}">` : `<div id="pArt">${BC.art(C.artType(p), cols[st.c].hex)}</div>`}
        </div>${imgs.length > 1 ? `<div class="thumbs" id="thumbs">${imgs.map((u, k) => `<button class="${k ? '' : 'on'}" ${use360 ? 'data-v' : 'data-img'}="${k}" aria-label="${use360 ? ['Old', 'Yon', 'Orqa', 'Tepa', 'Salon', 'Detal'][k] || 'Rasm ' + (k + 1) : 'Rasm ' + (k + 1)}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>` : ''}</div>
        <div class="pinfo"><div data-r>${p.brand ? `<span class="brand-l">${esc(p.brand)}</span>` : ''}<h1 style="margin-top:12px">${esc(p.title)}</h1></div>
          <p class="lead" data-r>${esc(p.short || p.description)}</p>
          <div class="pr" data-r><span class="price num">${C.priceTxt(p.price)}</span>${sale ? `<s class="num">${money(p.old_price)}</s><span class="save">Tejaysiz: ${money(p.old_price - p.price)}</span>` : ''}</div>
          ${cols.length > 1 || cols[0].name ? `<div data-r><div class="opt-h"><span>Rang</span><b id="cName">${esc(cols[st.c].name)}</b></div><div class="swatches" id="pSw">${cols.map((c, k) => `<button class="swatch" style="--c:${c.hex}" data-sw="${k}" aria-pressed="${k === st.c}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join('')}</div></div>` : ''}
          <div class="buy" id="buy" data-r><div class="qty"><button data-q="-1" aria-label="Kamaytirish">−</button><span class="num" id="qv">1</span><button data-q="1" aria-label="Ko'paytirish">+</button></div><button class="btn" id="addBtn" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? "Sotuvda yo'q" : "Savatga qo'shish"}</button></div>
          <button class="btn dark block" id="buyNow" ${p.stock <= 0 ? 'disabled' : ''} data-r>Hozir buyurtma berish ${I.arr}</button>
          <div class="perks" data-r><div class="perk">${ic('<path d="M12 3l8 3v6c0 4.500-3.200 7.800-8 9-4.800-1.200-8-4.500-8-9V6z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>')}<span>${warranty} oy kafolat<small>Rasmiy</small></span></div>
            <div class="perk">${ic('<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6.500" cy="17.500" r="2"/><circle cx="17.500" cy="17.500" r="2"/>')}<span>Yetkazib berish<small>${esc(money(s.freeFrom ?? 1000000))} dan bepul</small></span></div>
            <div class="perk">${ic('<path d="M3 12a9 9 0 1 0 3-6.700M3 4v5h5"/>')}<span>Omborda<small class="num">${p.stock > 0 ? p.stock + ' ta mavjud' : 'tugagan'}</small></span></div>
            <a class="perk" href="${C.tgLink(`Assalomu alaykum! "${p.title}" haqida savolim bor.`)}" target="_blank" rel="noopener">${ic('<path d="m21 3-9.500 18-2.500-7.500L1.500 11z"/><path d="m21 3-12 10.500"/>')}<span>Savol bormi?<small>Telegramda yozing</small></span></a></div>
          <div class="acc" data-r><details open><summary>Tavsif<i></i></summary><div class="bd">${esc(p.description)}</div></details>
            ${Object.keys(p.specs || {}).length ? `<details open><summary>Xususiyatlari<i></i></summary><div class="bd"><table class="table">${Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div></details>` : ''}
            <details><summary>Yetkazib berish va to'lov<i></i></summary><div class="bd">Butun O'zbekiston bo'ylab yetkazamiz. ${esc(money(s.freeFrom ?? 1000000))} dan yuqori buyurtmalarda bepul, qolganida ${esc(money(s.deliveryFee ?? 40000))}. To'lov mahsulotni qabul qilganda: naqd yoki karta orqali.</div></details></div></div></div>
      ${rel.length ? `<div class="rel"><h2 data-split>Sizga yoqishi mumkin</h2><div class="grid">${rel.map(C.productCard).join('')}</div></div>` : ''}</div></div>
      <div class="buybar" id="buybar"><div class="price num">${C.priceTxt(p.price)}</div><button class="btn sm" id="barAdd" ${p.stock <= 0 ? 'disabled' : ''}>Savatga qo'shish</button></div>`;

    /* ---------- 3D va rang ---------- */
    let v = null, pv = null; const pm = $('#pmain');
    if (use360) {
      const th = $$('#thumbs [data-v]');
      pv = BC.photo360.create($('#p360host'), { images: imgs.slice(0, 6), alt: p.title, onChange: (k) => th.forEach((b, n) => b.classList.toggle('on', n === k)) });
      $('#thumbs')?.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b && pv) pv.goTo(+b.dataset.v); });
    }
    if (use3d) {
      v = BC.car3d.create($('#v3d'), { model: p.model3d, color: cols[st.c].hex, interactive: true, driveIn: true, driveMs: 1800, driveDelay: 900, sway: true, yaw: 0.72, pitch: 0.12, parallax: true });
      if (!v) { $('#v3d').outerHTML = `<div id="pArt">${BC.art(C.artType(p), cols[st.c].hex)}</div>`; $('.badge3d')?.remove(); $('#rot')?.remove(); }
    }
    const ANG = { front: { yaw: 1.05, pitch: 0.12 }, side: { yaw: 0.0, pitch: 0.05 }, rear: { yaw: -2.5, pitch: 0.2 }, top: { yaw: -0.7, pitch: 1.0 } };
    $('#rot')?.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b && v) { v.autoRotate(false); v.view(ANG[b.dataset.v]); setTimeout(() => v.autoRotate(true), 4000); } });
    const setColor = (k) => {
      st.c = k; const c = cols[k]; pm.style.setProperty('--c', c.hex); root.style.setProperty('--tint', c.hex); v && v.setColor(c.hex);
      const art = $('#pArt'); if (art) art.innerHTML = BC.art(C.artType(p), c.hex); $('#cName') && ($('#cName').textContent = c.name); $$('#pSw .swatch').forEach((b, i) => b.setAttribute('aria-pressed', i === k));
    };
    root.style.setProperty('--tint', cols[st.c].hex);
    $('#pSw')?.addEventListener('click', (e) => { const b = e.target.closest('[data-sw]'); if (b) setColor(+b.dataset.sw); });
    $('#thumbs')?.addEventListener('click', (e) => { const b = e.target.closest('[data-img]'); if (!b) return; $$('#thumbs button').forEach((x) => x.classList.toggle('on', x === b)); const im = $('#phImg') || pm.appendChild(Object.assign(document.createElement('img'), { className: 'ph', id: 'phImg', alt: p.title })); im.src = imgs[+b.dataset.img]; });

    /* ---------- miqdor va savat ---------- */
    const maxQ = () => Math.max(p.stock - C.cart.qtyOf(p.id), 1);
    $('#buy').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (!b) return; st.q = C.clamp(st.q + +b.dataset.q, 1, maxQ()); $('#qv').textContent = st.q; });
    const add = (from) => { C.addToCart(p.id, { color: cols[st.c].name, qty: st.q, hex: cols[st.c].hex, from }); st.q = 1; $('#qv').textContent = 1; };
    $('#addBtn').onclick = (e) => add(pm); $('#barAdd').onclick = () => add(pm);
    $('#buyNow').onclick = () => { if (C.cart.add(p.id, cols[st.c].name, st.q)) C.leave('checkout.html'); };
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { $('#buybar').classList.toggle('on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }).observe($('#buy'));

    // oxirgi ko'rilganlar
    const rv = C.store.get('recent', []).filter((x) => x !== p.id); rv.unshift(p.id); C.store.set('recent', rv.slice(0, 8));
    C.observe(main);
  });
})();
