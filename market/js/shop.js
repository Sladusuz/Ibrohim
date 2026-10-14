(function () {
  'use strict';
  const C = window.BC.core, { esc, money, I } = C, $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];

  C.ready.then((D) => {
    const main = $('#main'), all = D.products, params = new URLSearchParams(location.search);
    const prices = all.map((p) => p.price).filter((n) => n > 0), PMIN = prices.length ? Math.floor(Math.min(...prices) / 10000) * 10000 : 0, PMAX = prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 1000000;
    const F = { cat: params.get('cat') || 'all', q: params.get('q') || '', sort: params.get('sort') || 'pop', min: +params.get('min') || PMIN, max: +params.get('max') || PMAX, stock: params.get('stock') === '1', sale: params.get('sale') === '1', fav: params.get('fav') === '1', color: params.get('color') || '' };
    if (!D.categories.find((c) => c.slug === F.cat)) F.cat = 'all';
    const colorMap = new Map(); all.forEach((p) => (p.colors || []).forEach((c) => { if (!colorMap.has(c.hex)) colorMap.set(c.hex, c.name); }));
    const sync = () => {
      const q = new URLSearchParams(); if (F.cat !== 'all') q.set('cat', F.cat); if (F.q) q.set('q', F.q); if (F.sort !== 'pop') q.set('sort', F.sort); if (F.min > PMIN) q.set('min', F.min); if (F.max < PMAX) q.set('max', F.max);
      if (F.stock) q.set('stock', 1); if (F.sale) q.set('sale', 1); if (F.fav) q.set('fav', 1); if (F.color) q.set('color', F.color); try { history.replaceState(null, '', 'shop.html' + (q.toString() ? '?' + q : '')); } catch { /* file:// da URL o'zgartirib bo'lmaydi */ }
    };

    main.innerHTML = `<div class="page"><div class="wrap">
      <div class="page-head"><div class="crumbs" data-r><a href="index.html">Bosh sahifa</a><i>/</i><span>Katalog</span></div><h1 data-split>Katalog</h1>
        <div class="searchbox" data-r>${I.search}<input id="q" type="search" placeholder="Model, brend yoki kategoriya" value="${esc(F.q)}" autocomplete="off" aria-label="Katalogdan qidirish"></div></div>
      <div class="shop"><aside class="filters card" id="filters" aria-label="Filtrlar">
        <div><h4>Kategoriya</h4><div class="f-list" id="fCats"></div></div>
        <div><h4>Narx</h4><div class="range"><div class="vals num"><span id="rMin"></span><span id="rMax"></span></div><div class="rs"><div class="tr"><i id="rFill"></i></div><input type="range" id="rLo" min="${PMIN}" max="${PMAX}" step="10000" value="${F.min}" aria-label="Minimal narx"><input type="range" id="rHi" min="${PMIN}" max="${PMAX}" step="10000" value="${F.max}" aria-label="Maksimal narx"></div></div></div>
        ${colorMap.size ? `<div><h4>Rang</h4><div class="swatches" id="fColors"></div></div>` : ''}
        <div><h4>Holat</h4><label class="tg"><span>Faqat mavjudlari</span><input type="checkbox" id="tStock" ${F.stock ? 'checked' : ''}><i class="sw"></i></label><label class="tg"><span>Chegirmadagilar</span><input type="checkbox" id="tSale" ${F.sale ? 'checked' : ''}><i class="sw"></i></label><label class="tg"><span>Sevimlilar</span><input type="checkbox" id="tFav" ${F.fav ? 'checked' : ''}><i class="sw"></i></label></div>
        <div style="display:grid;gap:10px"><button class="btn line block" id="fReset">Filtrlarni tozalash</button><button class="btn block fclose" id="fDone" style="display:none">Natijalarni ko'rish</button></div></aside>
      <div><div class="shop-top"><span class="cnt num" id="cnt"></span><div class="tools"><button class="btn line sm fbtn" id="fOpen">Filtrlar</button>
        <select class="sel" id="sort" aria-label="Saralash"><option value="pop">Ommabop</option><option value="cheap">Arzonroq</option><option value="exp">Qimmatroq</option><option value="sale">Chegirmalar</option><option value="new">Yangilari</option></select></div></div>
        <div class="grid" id="grid"></div></div></div></div></div>`;

    const dis = (p) => (p.old_price > p.price ? (p.old_price - p.price) / p.old_price : 0);
    const SORT = { pop: (a, b) => b.featured - a.featured || 0, cheap: (a, b) => a.price - b.price, exp: (a, b) => b.price - a.price, sale: (a, b) => dis(b) - dis(a), new: (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')) };
    const matches = (p) => { const cat = D.categories.find((c) => c.slug === F.cat);
      return (F.cat === 'all' || p.category_id === cat?.id) && p.price >= F.min && p.price <= F.max && (!F.stock || p.stock > 0) && (!F.sale || p.old_price > p.price) && (!F.fav || C.favs.has(p.id)) && (!F.color || (p.colors || []).some((c) => c.hex === F.color))
        && (!F.q || (p.title + ' ' + p.brand + ' ' + (C.catOf(p)?.name || '') + ' ' + (p.short || '')).toLowerCase().includes(F.q.toLowerCase())); };

    function drawFilters() {
      $('#fCats').innerHTML = [{ slug: 'all', name: 'Barchasi', id: null }, ...D.categories].map((c) => `<button class="f-opt ${F.cat === c.slug ? 'on' : ''}" data-cat="${esc(c.slug)}">${esc(c.name)}<small class="num">${c.id ? all.filter((p) => p.category_id === c.id).length : all.length}</small></button>`).join('');
      const fc = $('#fColors'); if (fc) fc.innerHTML = [...colorMap].map(([hex, name]) => `<button class="swatch" style="--c:${hex}" data-color="${hex}" aria-pressed="${F.color === hex}" aria-label="${esc(name)}" title="${esc(name)}"></button>`).join('');
      const lo = Math.min(F.min, F.max), hi = Math.max(F.min, F.max); $('#rMin').textContent = money(lo); $('#rMax').textContent = money(hi);
      const span = PMAX - PMIN || 1; $('#rFill').style.left = ((lo - PMIN) / span) * 100 + '%'; $('#rFill').style.right = (100 - ((hi - PMIN) / span) * 100) + '%';
    }
    function drawGrid() {
      const list = all.filter(matches).sort(SORT[F.sort] || SORT.pop);
      $('#cnt').textContent = `${list.length} ta mahsulot${F.q ? ` · "${F.q}"` : ''}`;
      $('#grid').innerHTML = list.length ? list.map(C.productCard).join('') : `<div class="empty">${BC.art('stroller', '#2b59ff')}<h3>Hech narsa topilmadi</h3><p>Filtrlarni o'zgartirib ko'ring yoki bizdan so'rang.</p><button class="btn" id="emptyReset">Filtrlarni tozalash</button></div>`;
      C.observe($('#grid')); sync();
    }
    const refresh = () => { drawFilters(); drawGrid(); };
    $('#sort').value = F.sort; refresh();

    $('#filters').addEventListener('click', (e) => {
      const cat = e.target.closest('[data-cat]'); if (cat) { F.cat = cat.dataset.cat; refresh(); return; }
      const col = e.target.closest('[data-color]'); if (col) { F.color = F.color === col.dataset.color ? '' : col.dataset.color; refresh(); return; }
    });
    $('#q').addEventListener('input', (e) => { F.q = e.target.value.trim(); drawGrid(); });
    $('#sort').addEventListener('change', (e) => { F.sort = e.target.value; drawGrid(); });
    ['Stock', 'Sale', 'Fav'].forEach((k) => $('#t' + k).addEventListener('change', (e) => { F[k.toLowerCase()] = e.target.checked; drawGrid(); }));
    const onRange = (e) => { let lo = +$('#rLo').value, hi = +$('#rHi').value; if (lo > hi) { if (e.target.id === 'rLo') { lo = hi; $('#rLo').value = lo; } else { hi = lo; $('#rHi').value = hi; } } F.min = lo; F.max = hi; drawFilters(); drawGrid(); };
    $('#rLo').addEventListener('input', onRange); $('#rHi').addEventListener('input', onRange);
    const reset = () => { Object.assign(F, { cat: 'all', q: '', sort: 'pop', min: PMIN, max: PMAX, stock: false, sale: false, fav: false, color: '' }); $('#q').value = ''; $('#sort').value = 'pop'; $('#rLo').value = PMIN; $('#rHi').value = PMAX; ['Stock', 'Sale', 'Fav'].forEach((k) => ($('#t' + k).checked = false)); refresh(); };
    $('#fReset').onclick = reset; document.addEventListener('click', (e) => { if (e.target.closest('#emptyReset')) reset(); });
    document.addEventListener('bc:fav', () => { if (F.fav) drawGrid(); });

    // mobil: filtrlar pastki oyna
    const fl = $('#filters'), mq = matchMedia('(max-width: 1100px)'), fdone = $('#fDone');
    const syncMq = () => { fdone.style.display = mq.matches ? '' : 'none'; }; mq.addEventListener('change', syncMq); syncMq();
    $('#fOpen').onclick = () => { fl.classList.add('on'); $('#scrim').classList.add('on'); C.lock(true); }; fdone.onclick = () => C.closeAll();
    document.addEventListener('bc:closeall', () => fl.classList.remove('on'));
  });
})();
