(function () {
  'use strict';
  const { api, util } = window.BC;
  const { money, num, esc } = util;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const A = { orders: [], products: [], categories: [], messages: [], settings: {}, user: null, tab: 'dashboard', ofilter: 'all', oq: '', pq: '',
    an: { range: '30', from: '', to: '', group: 'day', status: 'live', sort: 'revenue', dir: -1, q: '' } };
  let unsub = null; const fresh = new Set();

  const STATUS = [['new', 'Yangi'], ['confirmed', 'Tasdiqlangan'], ['shipping', "Yo'lda"], ['delivered', 'Yetkazilgan'], ['cancelled', 'Bekor qilingan']];
  const sLabel = (s) => (STATUS.find((x) => x[0] === s) || [s, s])[1];
  const pill = (s) => `<span class="pill s-${s}">${esc(sLabel(s))}</span>`;
  const fmtDate = (d) => new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const imgSrc = (u) => (/^(https?:|data:|\/)/.test(u) ? u : '../' + u);
  const ic = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = {
    dash: ic('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
    an: ic('<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>'),
    orders: ic('<path d="M6 3h12l2 5v13H4V8z"/><path d="M4 8h16M9 12h6"/>'),
    products: ic('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
    cats: ic('<path d="M4 6h16M4 12h16M4 18h10"/>'),
    msg: ic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    set: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900 7 7M17 17l2.100 2.100M4.900 19.100 7 17M17 7l2.100-2.100"/>'),
    out: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'), menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'), moon: ic('<path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z"/>'), ext: ic('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  };
  const slugify = (s) => s.toLowerCase().replace(/['’`ʻ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kategoriya-' + Date.now().toString(36);
  const catOf = (id) => A.categories.find((c) => c.id === id);
  const catName = (id) => (catOf(id) || {}).name || 'Boshqa';
  const prodOf = (id) => A.products.find((p) => p.id === id);
  const thumb = (p) => { const c = (p && p.colors && p.colors[0] && p.colors[0].hex) || '#2b59ff'; return `<div class="th" style="--c:${c}">${p && p.images && p.images[0] ? `<img src="${esc(imgSrc(p.images[0]))}" alt="">` : BC.art(artOf(p), c)}</div>`; };
  const artOf = (p) => ({ elektromobil: 'car', kalyaska: 'stroller', velokalyaska: 'trike', mototsikl: 'moto', samokat: 'scooter' }[(catOf(p?.category_id) || {}).slug] || 'car');
  const PAL = ['#2b59ff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#84cc16'];

  /* ====================== yordamchilar ====================== */
  function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; $('#toasts').append(t); setTimeout(() => t.remove(), 3400); }
  function beep() { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.setValueAtTime(.001, c.currentTime); g.gain.exponentialRampToValueAtTime(.2, c.currentTime + .02); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .5); o.start(); o.stop(c.currentTime + .5); } catch { /* ovoz ixtiyoriy */ } }
  function ask(title, text, ok = "O'chirish") {
    return new Promise((res) => {
      const d = document.createElement('div'); d.className = 'dlg'; d.innerHTML = `<div role="alertdialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="r"><button class="btn out" data-n>Bekor qilish</button><button class="btn bad" data-y>${esc(ok)}</button></div></div>`;
      d.onclick = (e) => { if (e.target === d || e.target.closest('[data-n]')) { d.remove(); res(false); } if (e.target.closest('[data-y]')) { d.remove(); res(true); } }; document.body.append(d); $('[data-n]', d).focus();
    });
  }
  async function guard(fn) { try { return { ok: true, v: await fn() }; } catch (e) { toast(e.message || 'Xatolik yuz berdi'); return { ok: false }; } }
  const themeToggle = () => { const r = document.documentElement, dark = r.dataset.theme === 'dark' || (!r.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); r.dataset.theme = dark ? 'light' : 'dark'; try { localStorage.setItem('bc3_atheme', JSON.stringify(r.dataset.theme)); } catch { /* */ } };
  const compact = (n) => (n >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + ' mlrd' : n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' mln' : n >= 1e3 ? Math.round(n / 1e3) + ' ming' : String(n));

  /* ====================== kirish ====================== */
  function loginView() {
    app.innerHTML = `<div class="login"><form id="lf" novalidate><img src="../img/logo.png" alt=""><span class="lbl">BabyCheer</span><h1>Admin panel</h1>
      <label class="fld"><span>Email</span><input id="em" type="email" autocomplete="username" required value="${api.mode === 'demo' ? 'admin@babycheer.uz' : ''}"></label>
      <label class="fld"><span>Parol</span><input id="pw" type="password" autocomplete="current-password" required></label><div id="le"></div>
      <button class="btn" type="submit">Kirish</button>
      ${api.mode === 'demo' ? '<div class="hint"><b>Demo rejim.</b> Supabase hali ulanmagan: ma\'lumotlar shu brauzerda saqlanadi. Demo parol: <b>admin123</b></div>' : ''}</form></div>`;
    $('#lf').onsubmit = async (e) => {
      e.preventDefault(); const b = $('button', e.target); b.disabled = true; $('#le').innerHTML = '';
      try { A.user = await api.admin.login($('#em').value.trim(), $('#pw').value); await start(); } catch (err) { $('#le').innerHTML = `<div class="err">${esc(err.message)}</div>`; b.disabled = false; }
    };
  }

  /* ====================== maket ====================== */
  const NAV = [['dashboard', 'Boshqaruv', ICON.dash], ['analytics', 'Analitika', ICON.an], ['orders', 'Buyurtmalar', ICON.orders], ['products', 'Mahsulotlar', ICON.products], ['categories', 'Kategoriyalar', ICON.cats], ['messages', 'Xabarlar', ICON.msg], ['settings', 'Sozlamalar', ICON.set]];
  function shell() {
    app.innerHTML = `<div class="shell"><aside class="side" id="side"><div class="side-in"><div class="brand"><img src="../img/logo.png" alt=""><div>BabyCheer<small>ADMIN PANEL</small></div></div><nav class="menu" id="menu"></nav><div class="grow"></div>
      <div class="foot"><a href="../index.html" target="_blank" rel="noopener">${ICON.ext}<span>Saytni ochish</span></a><button id="lo">${ICON.out}<span>Chiqish</span></button><p class="lbl" style="padding:6px 14px 0;word-break:break-all;text-transform:none;letter-spacing:0">${esc(A.user?.email || '')}</p></div></div></aside>
      <div class="main"><div class="top"><button class="ib burger" id="burger" aria-label="Menyu">${ICON.menu}</button><h1 id="ttl"></h1><div class="sp"></div><span class="live ${api.mode === 'demo' ? 'demo' : ''}"><i></i>${api.mode === 'demo' ? 'Demo rejim' : 'Jonli'}</span><button class="ib" id="th" aria-label="Rejim">${ICON.moon}</button></div><div id="page"></div></div></div>
      <div class="scrim" id="scrim"></div><aside class="panel" id="panel" aria-hidden="true"></aside>`;
    $('#th').onclick = themeToggle; $('#lo').onclick = async () => { unsub && unsub(); await api.admin.logout(); A.user = null; loginView(); };
    $('#burger').onclick = () => $('#side').classList.toggle('on'); $('#scrim').onclick = closePanel;
  }
  function nav() {
    const nO = A.orders.filter((o) => o.status === 'new').length, nM = A.messages.filter((m) => !m.handled).length;
    $('#menu').innerHTML = NAV.map(([id, l, i]) => `<a href="#/${id}" class="${A.tab === id ? 'on' : ''}">${i}<span>${l}</span>${id === 'orders' && nO ? `<span class="bd num">${nO}</span>` : ''}${id === 'messages' && nM ? `<span class="bd num">${nM}</span>` : ''}</a>`).join('');
    $('#ttl').textContent = (NAV.find((x) => x[0] === A.tab) || NAV[0])[1];
  }
  function openPanel(html, wide) { const p = $('#panel'); p.innerHTML = html; p.classList.toggle('wide', !!wide); p.classList.add('on'); $('#scrim').classList.add('on'); p.setAttribute('aria-hidden', 'false'); }
  function closePanel() { $('#panel').classList.remove('on'); $('#scrim').classList.remove('on'); $('#panel').setAttribute('aria-hidden', 'true'); }

  const loadOrders = async () => { A.orders = await api.admin.orders(); };
  const loadProducts = async () => { A.products = await api.admin.products(); };
  const loadCats = async () => { A.categories = await api.admin.categories(); };
  const loadMsgs = async () => { A.messages = await api.admin.messages(); };

  /* ====================== BOSHQARUV ====================== */
  const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const sameDay = (a, b) => dayStart(a).getTime() === dayStart(b).getTime();
  function dashboard() {
    const live = A.orders.filter((o) => o.status !== 'cancelled'), sum = (a) => a.reduce((s, o) => s + o.total, 0), now = new Date();
    const tod = A.orders.filter((o) => sameDay(o.created_at, now)), counts = Object.fromEntries(STATUS.map(([s]) => [s, A.orders.filter((o) => o.status === s).length])), tot = A.orders.length || 1;
    const days = Array.from({ length: 14 }, (_, i) => { const d = dayStart(now); d.setDate(d.getDate() - (13 - i)); return { d, v: 0, n: 0 }; });
    live.forEach((o) => { const x = days.find((k) => sameDay(k.d, o.created_at)); if (x) { x.v += o.total; x.n++; } });
    const low = A.products.filter((p) => p.active !== false && p.stock <= 3).sort((a, b) => a.stock - b.stock).slice(0, 6);
    return `<div class="kpis"><div class="kpi hot"><span class="lbl">Umumiy daromad</span><b class="num">${money(sum(live))}</b><small>${live.length} ta faol buyurtma</small></div>
      <div class="kpi"><span class="lbl">Bugun</span><b class="num">${tod.length}</b><small>${money(sum(tod.filter((o) => o.status !== 'cancelled')))}</small></div>
      <div class="kpi"><span class="lbl">Yangi buyurtmalar</span><b class="num">${counts.new}</b><small>javob kutmoqda</small></div>
      <div class="kpi"><span class="lbl">O'rtacha chek</span><b class="num">${money(live.length ? sum(live) / live.length : 0)}</b><small>bekor qilinganlarsiz</small></div></div>
      <div class="dash"><div class="card"><h3>Daromad, oxirgi 14 kun</h3><p class="sub">Batafsil hisobot uchun <a href="#/analytics" style="color:var(--brand);font-weight:800">Analitika</a> bo'limiga o'ting</p>${chartSvg(days.map((d) => ({ label: String(d.d.getDate()), title: d.d.toLocaleDateString('ru-RU'), v: d.v, n: d.n, q: 0 })), 'dash')}</div>
        <div class="card"><h3>Holatlar</h3><p class="sub">Barcha buyurtmalar bo'yicha</p><div class="bars">${STATUS.map(([s, l]) => `<div class="brow"><div class="h"><span>${l}</span><b class="num">${counts[s]}</b></div><div class="track"><i style="width:${(counts[s] / tot) * 100}%"></i></div></div>`).join('')}</div></div></div>
      <div class="dash3"><div class="card"><h3>So'nggi buyurtmalar</h3><p class="sub">Eng yangi 6 ta</p><div class="list">${A.orders.slice(0, 6).map((o) => `<a class="li" href="#/orders" data-open-order="${esc(o.id)}"><div><b>${esc(o.no)}</b><small>${esc(o.name)} · ${fmtDate(o.created_at)}</small></div><div style="text-align:right"><b class="num">${money(o.total)}</b><br>${pill(o.status)}</div></a>`).join('') || '<div class="empty">Buyurtmalar yo\'q</div>'}</div></div>
        <div class="card"><h3>Ombor kam qolgan</h3><p class="sub">3 tadan kam</p><div class="list">${low.length ? low.map((p) => `<div class="li"><div class="pcell">${thumb(p)}<div><b>${esc(p.title)}</b><small>${esc(catName(p.category_id))}</small></div></div><span class="pill ${p.stock ? 's-confirmed' : 's-cancelled'} num">${p.stock} ta</span></div>`).join('') : '<div class="empty">Hammasi yetarli</div>'}</div></div>
        <div class="card"><h3>Yangi xabarlar</h3><p class="sub">Javob kutayotganlar</p><div class="list">${A.messages.filter((m) => !m.handled).slice(0, 4).map((m) => `<a class="li" href="#/messages"><div><b>${esc(m.name)}</b><small>${esc(m.message.slice(0, 48))}${m.message.length > 48 ? '...' : ''}</small></div><span class="mut num" style="font-size:12px">${fmtDate(m.created_at)}</span></a>`).join('') || '<div class="empty">Yangi xabar yo\'q</div>'}</div></div></div>`;
  }

  /* ====================== grafik (SVG) ====================== */
  function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  /** pts: [{label,title,v,n,q}] v=daromad (ustun), n=buyurtmalar (chiziq) */
  function chartSvg(pts, id) {
    const W = 920, H = 320, L = 62, R = 44, T = 20, B = 40, cw = W - L - R, ch = H - T - B, n = pts.length || 1, mx = niceMax(Math.max(...pts.map((p) => p.v), 1)), mn = Math.max(...pts.map((p) => p.n), 1), nmx = Math.max(mn, 1) < 5 ? 5 : niceMax(mn);
    const bw = cw / n, bar = Math.min(bw * 0.62, 46), x = (i) => L + bw * i + bw / 2, y = (v) => T + ch - (v / mx) * ch, yn = (v) => T + ch - (v / nmx) * ch;
    const skip = Math.ceil(n / 14), grid = [0, 0.25, 0.5, 0.75, 1].map((k) => `<line class="gl" x1="${L}" x2="${W - R}" y1="${T + ch * (1 - k)}" y2="${T + ch * (1 - k)}"/><text x="${L - 10}" y="${T + ch * (1 - k) + 4}" text-anchor="end">${compact(mx * k)}</text><text x="${W - R + 10}" y="${T + ch * (1 - k) + 4}">${Math.round(nmx * k)}</text>`).join('');
    const bars = pts.map((p, i) => `<g data-i="${i}"><rect class="hit" x="${L + bw * i}" y="${T}" width="${bw}" height="${ch}"/><rect class="bar ${p.v ? '' : 'zero'}" x="${x(i) - bar / 2}" y="${y(p.v) - (p.v ? 0 : -ch + 2)}" width="${bar}" height="${p.v ? T + ch - y(p.v) : 2}" rx="${Math.min(bar / 2.2, 8)}"/>${i % skip === 0 ? `<text x="${x(i)}" y="${H - 14}" text-anchor="middle">${esc(p.label)}</text>` : ''}</g>`).join('');
    const line = pts.length > 1 ? `<path class="ln" d="${pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${yn(p.n).toFixed(1)}`).join('')}"/>` + (n <= 40 ? pts.map((p, i) => `<circle class="pt" cx="${x(i).toFixed(1)}" cy="${yn(p.n).toFixed(1)}" r="3.5"/>`).join('') : '') : '';
    return `<div class="chartbox" id="cb-${id}"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Daromad va buyurtmalar grafigi"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f90ff"/><stop offset="1" stop-color="#2b59ff"/></linearGradient></defs>${grid}${bars}${line}</svg><div class="tip" id="tip-${id}"></div>
      <div class="legend"><span><i style="background:linear-gradient(#6f90ff,#2b59ff)"></i>Daromad</span><span><i style="background:var(--violet);border-radius:50%"></i>Buyurtmalar soni</span></div></div>`;
  }
  function bindChart(id, pts) {
    const box = $('#cb-' + id); if (!box) return; const tip = $('#tip-' + id), svg = $('svg', box);
    box.addEventListener('pointermove', (e) => {
      const g = e.target.closest('g[data-i]'); if (!g) { tip.classList.remove('on'); return; } const p = pts[+g.dataset.i], r = svg.getBoundingClientRect(), br = g.querySelector('.hit').getBoundingClientRect();
      tip.innerHTML = `<b>${esc(p.title)}</b><div><span>Daromad</span><b style="margin:0" class="num">${money(p.v)}</b></div><div><span>Buyurtmalar</span><b style="margin:0" class="num">${p.n} ta</b></div>${p.q !== undefined && p.q !== 0 ? `<div><span>Sotilgan dona</span><b style="margin:0" class="num">${p.q} ta</b></div>` : ''}`;
      const bx = box.getBoundingClientRect(); let left = br.left - bx.left + br.width / 2 - 85; left = Math.max(0, Math.min(left, bx.width - 175)); tip.style.left = left + 'px'; tip.style.top = Math.max(br.top - bx.top - 90, 0) + 'px'; tip.classList.add('on');
    }); box.addEventListener('pointerleave', () => tip.classList.remove('on'));
  }

  /* ====================== ANALITIKA ====================== */
  const RANGES = [['today', 'Bugun'], ['7', '7 kun'], ['30', '30 kun'], ['90', '90 kun'], ['365', '12 oy'], ['all', 'Barchasi'], ['custom', 'Davr tanlash']];
  const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const DAYS = ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Yak'];
  function anRange() {
    const a = A.an, end = new Date(); end.setHours(23, 59, 59, 999); let from;
    if (a.range === 'custom') { from = a.from ? new Date(a.from + 'T00:00:00') : dayStart(new Date(Date.now() - 29 * 864e5)); const t = a.to ? new Date(a.to + 'T23:59:59') : end; return { from, to: t }; }
    if (a.range === 'all') { const min = A.orders.reduce((m, o) => Math.min(m, new Date(o.created_at).getTime()), Date.now()); return { from: dayStart(min), to: end }; }
    const n = a.range === 'today' ? 1 : +a.range; from = dayStart(new Date(Date.now() - (n - 1) * 864e5)); return { from, to: end };
  }
  const inc = (o, st) => (st === 'all' ? true : st === 'delivered' ? o.status === 'delivered' : o.status !== 'cancelled');
  function agg(orders, group, from, to) {
    const key = (d) => (group === 'year' ? String(d.getFullYear()) : group === 'month' ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    const label = (d) => (group === 'year' ? String(d.getFullYear()) : group === 'month' ? `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
    const title = (d) => (group === 'year' ? `${d.getFullYear()} yil` : group === 'month' ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }));
    const map = new Map(), cur = new Date(from); if (group === 'month') cur.setDate(1); if (group === 'year') { cur.setMonth(0, 1); }
    let guard2 = 0; while (cur <= to && guard2++ < 800) { map.set(key(cur), { label: label(cur), title: title(cur), v: 0, n: 0, q: 0 }); if (group === 'year') cur.setFullYear(cur.getFullYear() + 1); else if (group === 'month') cur.setMonth(cur.getMonth() + 1); else cur.setDate(cur.getDate() + 1); }
    orders.forEach((o) => { const b = map.get(key(new Date(o.created_at))); if (b) { b.v += o.total; b.n++; b.q += o.items.reduce((s, i) => s + i.qty, 0); } });
    return [...map.values()];
  }
  function analytics() {
    const a = A.an, { from, to } = anRange(), span = to - from, ms = to.getTime() - from.getTime();
    const inRange = A.orders.filter((o) => { const t = new Date(o.created_at); return t >= from && t <= to; });
    const prevOrders = a.range === 'all' ? [] : A.orders.filter((o) => { const t = new Date(o.created_at).getTime(); return t >= from.getTime() - ms - 1 && t < from.getTime(); });
    const sel = inRange.filter((o) => inc(o, a.status)), prev = prevOrders.filter((o) => inc(o, a.status));
    const k = (arr) => { const r = arr.reduce((s, o) => s + o.total, 0), u = arr.reduce((s, o) => s + o.items.reduce((q, i) => q + i.qty, 0), 0); return { rev: r, ord: arr.length, units: u, avg: arr.length ? r / arr.length : 0 }; };
    const K = k(sel), P = k(prev), canceled = inRange.filter((o) => o.status === 'cancelled').length, cancelPct = inRange.length ? (canceled / inRange.length) * 100 : 0;
    const dl = (cur, old) => (a.range === 'all' || !old ? '' : (() => { const p = ((cur - old) / old) * 100; return `<span class="delta ${p < 0 ? 'dn' : ''}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toFixed(0)}%</span>`; })());
    const days = Math.ceil(span / 864e5); if (!A._grpTouched) a.group = days > 400 ? 'year' : days > 75 ? 'month' : 'day';
    const pts = agg(sel, a.group, from, to);
    // mahsulotlar
    const pm = new Map(); sel.forEach((o) => o.items.forEach((i) => { const p = pm.get(i.id || i.title) || { id: i.id, title: i.title, qty: 0, rev: 0, orders: new Set() }; p.qty += i.qty; p.rev += i.qty * i.price; p.orders.add(o.id); pm.set(i.id || i.title, p); }));
    let rows = [...pm.values()].map((p) => ({ ...p, ord: p.orders.size, prod: prodOf(p.id) })); const totalRev = rows.reduce((s, r) => s + r.rev, 0), totalQty = rows.reduce((s, r) => s + r.qty, 0);
    if (a.q) rows = rows.filter((r) => r.title.toLowerCase().includes(a.q.toLowerCase()));
    const sk = { revenue: 'rev', qty: 'qty', orders: 'ord', title: 'title' }[a.sort]; rows.sort((x, y) => (sk === 'title' ? x.title.localeCompare(y.title) * a.dir : (x[sk] - y[sk]) * a.dir));
    // kategoriyalar, ranglar, mijozlar, hafta kunlari
    const cm = new Map(); rows.forEach((r) => { const n = catName(r.prod?.category_id); cm.set(n, (cm.get(n) || 0) + r.rev); }); const cats = [...cm].sort((x, y) => y[1] - x[1]);
    const colm = new Map(); sel.forEach((o) => o.items.forEach((i) => { if (i.color) colm.set(i.color, (colm.get(i.color) || 0) + i.qty); })); const colors = [...colm].sort((x, y) => y[1] - x[1]).slice(0, 6); const hexOf = (n) => { for (const p of A.products) { const c = (p.colors || []).find((x) => x.name === n); if (c) return c.hex; } return '#9aa3b8'; };
    const cu = new Map(); sel.forEach((o) => { const c = cu.get(o.phone) || { name: o.name, phone: o.phone, n: 0, s: 0 }; c.n++; c.s += o.total; cu.set(o.phone, c); }); const custs = [...cu.values()].sort((x, y) => y.s - x.s).slice(0, 6);
    const wd = Array.from({ length: 7 }, () => ({ v: 0, n: 0 })); sel.forEach((o) => { const d = (new Date(o.created_at).getDay() + 6) % 7; wd[d].v += o.total; wd[d].n++; }); const wmax = Math.max(...wd.map((x) => x.v), 1);
    const pay = { cash: sel.filter((o) => o.payment !== 'card').length, card: sel.filter((o) => o.payment === 'card').length }, dlv = { courier: sel.filter((o) => o.delivery !== 'pickup').length, pickup: sel.filter((o) => o.delivery === 'pickup').length };
    const donut = (items) => { const tot = items.reduce((s, x) => s + x[1], 0) || 1; let off = 0; const R = 56, C2 = 2 * Math.PI * R; return `<svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="${R}" stroke="var(--surface-2)"/>${items.map(([, v], i) => { const len = (v / tot) * C2, el = `<circle cx="75" cy="75" r="${R}" stroke="${PAL[i % PAL.length]}" stroke-dasharray="${Math.max(len - 3, 0)} ${C2}" stroke-dashoffset="${-off}"/>`; off += len; return el; }).join('')}</svg>`; };
    const arrow = (c) => (a.sort === c ? (a.dir === -1 ? ' ↓' : ' ↑') : '');

    return `<div class="tools"><div class="chips">${RANGES.map(([r, l]) => `<button class="chip ${a.range === r ? 'on' : ''}" data-range="${r}">${l}</button>`).join('')}</div>
        ${a.range === 'custom' ? `<input class="in" type="date" id="anFrom" value="${esc(a.from || from.toISOString().slice(0, 10))}" style="max-width:160px"><input class="in" type="date" id="anTo" value="${esc(a.to || to.toISOString().slice(0, 10))}" style="max-width:160px">` : ''}
        <div style="flex:1"></div><div class="seg" aria-label="Guruhlash">${[['day', 'Kunlar'], ['month', 'Oylar'], ['year', 'Yillar']].map(([g, l]) => `<button class="${a.group === g ? 'on' : ''}" data-group="${g}">${l}</button>`).join('')}</div>
        <select class="in" id="anStatus" style="max-width:220px" aria-label="Holat filtri"><option value="live" ${a.status === 'live' ? 'selected' : ''}>Bekor qilinmaganlar</option><option value="delivered" ${a.status === 'delivered' ? 'selected' : ''}>Faqat yetkazilganlar</option><option value="all" ${a.status === 'all' ? 'selected' : ''}>Hammasi</option></select></div>
      <div class="kpis"><div class="kpi hot"><span class="lbl">Daromad</span><b class="num">${money(K.rev)}</b><small>${dl(K.rev, P.rev)} ${a.range === 'all' ? 'butun davr' : 'oldingi davrga nisbatan'}</small></div>
        <div class="kpi"><span class="lbl">Buyurtmalar</span><b class="num">${num(K.ord)}</b><small>${dl(K.ord, P.ord)} ${canceled ? `bekor: ${canceled} (${cancelPct.toFixed(0)}%)` : 'bekor qilinmagan'}</small></div>
        <div class="kpi"><span class="lbl">Sotilgan dona</span><b class="num">${num(K.units)}</b><small>${dl(K.units, P.units)} ${rows.length} xil mahsulot</small></div>
        <div class="kpi"><span class="lbl">O'rtacha chek</span><b class="num">${money(K.avg)}</b><small>${dl(K.avg, P.avg)} bir buyurtmaga</small></div></div>
      <div class="card" style="margin-bottom:14px"><h3>${a.group === 'year' ? 'Yillik' : a.group === 'month' ? 'Oylik' : 'Kunlik'} sotuv dinamikasi</h3><p class="sub">${from.toLocaleDateString('ru-RU')} - ${to.toLocaleDateString('ru-RU')} · ustun ustiga olib boring</p>${chartSvg(pts, 'an')}</div>
      <div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:end;margin-bottom:14px"><div><h3>Mahsulotlar bo'yicha sotuv</h3><p class="sub" style="margin:0">Qaysi mahsulotdan nechta sotilgan va qancha daromad keltirgan</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><input class="in" id="anQ" placeholder="Mahsulot qidirish" value="${esc(a.q)}" style="width:220px;height:40px"><button class="btn out sm" id="anCsv">CSV yuklash</button></div></div>
        <div class="tbl-wrap" style="box-shadow:none;border-radius:20px"><table><thead><tr><th style="width:44px">#</th><th class="s ${a.sort === 'title' ? 'on' : ''}" data-sort="title">Mahsulot${arrow('title')}</th><th>Kategoriya</th><th class="s ${a.sort === 'qty' ? 'on' : ''}" data-sort="qty">Sotilgan dona${arrow('qty')}</th><th class="s ${a.sort === 'orders' ? 'on' : ''}" data-sort="orders">Buyurtma${arrow('orders')}</th><th class="s ${a.sort === 'revenue' ? 'on' : ''}" data-sort="revenue">Daromad${arrow('revenue')}</th><th style="min-width:150px">Ulushi</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td><span class="rank ${i < 3 ? 'g' : ''} num">${i + 1}</span></td><td><div class="pcell">${thumb(r.prod || { title: r.title })}<div><b>${esc(r.title)}</b>${r.prod ? '' : '<small>o\'chirilgan mahsulot</small>'}</div></div></td><td>${esc(catName(r.prod?.category_id))}</td><td class="num"><b>${num(r.qty)}</b> ta</td><td class="num">${r.ord}</td><td class="num"><b>${money(r.rev)}</b></td><td><div class="track"><i style="width:${rows[0] && rows[0].rev ? (r.rev / Math.max(...rows.map((x) => x.rev))) * 100 : 0}%"></i></div><small class="mut num">${totalRev ? ((r.rev / totalRev) * 100).toFixed(1) : 0}%</small></td></tr>`).join('')}</tbody>
        ${rows.length ? `<tfoot><tr><td></td><td>Jami</td><td></td><td class="num">${num(totalQty)} ta</td><td class="num">${sel.length}</td><td class="num">${money(totalRev)}</td><td></td></tr></tfoot>` : ''}</table>${rows.length ? '' : '<div class="empty">Tanlangan davrda sotuv yo\'q</div>'}</div></div>
      <div class="dash2"><div class="card"><h3>Kategoriyalar ulushi</h3><p class="sub">Daromad bo'yicha</p><div class="donut"><div style="position:relative">${donut(cats.length ? cats : [['-', 1]])}</div><div class="dleg">${cats.map(([n, v], i) => `<div><span><i class="dotc" style="--c:${PAL[i % PAL.length]}"></i>${esc(n)}</span><em class="num">${totalRev ? ((v / totalRev) * 100).toFixed(0) : 0}% · ${compact(v)}</em></div>`).join('') || '<span class="mut">Ma\'lumot yo\'q</span>'}</div></div></div>
        <div class="card"><h3>Eng ko'p tanlangan ranglar</h3><p class="sub">Sotilgan dona bo'yicha</p><div class="bars">${colors.map(([n, q]) => `<div class="brow"><div class="h"><span><i class="dotc" style="--c:${hexOf(n)}"></i>${esc(n)}</span><b class="num">${q} ta</b></div><div class="track"><i style="width:${(q / colors[0][1]) * 100}%;background:${hexOf(n)}"></i></div></div>`).join('') || '<span class="mut">Rang ma\'lumoti yo\'q</span>'}</div></div></div>
      <div class="dash3"><div class="card"><h3>Eng yaxshi mijozlar</h3><p class="sub">Xarid summasi bo'yicha</p><div class="list">${custs.map((c, i) => `<div class="li"><div><b>${i + 1}. ${esc(c.name)}</b><small class="num">${esc(c.phone)} · ${c.n} ta buyurtma</small></div><b class="num">${compact(c.s)}</b></div>`).join('') || '<div class="empty">Ma\'lumot yo\'q</div>'}</div></div>
        <div class="card"><h3>Hafta kunlari</h3><p class="sub">Qaysi kunda ko'proq sotiladi</p><div class="bars">${wd.map((x, i) => `<div class="brow"><div class="h"><span>${DAYS[i]}</span><b class="num">${x.n} ta · ${compact(x.v)}</b></div><div class="track"><i style="width:${(x.v / wmax) * 100}%"></i></div></div>`).join('')}</div></div>
        <div class="card"><h3>To'lov va yetkazish</h3><p class="sub">Buyurtmalar soni</p><div class="bars"><div class="brow"><div class="h"><span>Naqd</span><b class="num">${pay.cash}</b></div><div class="track"><i style="width:${(pay.cash / (sel.length || 1)) * 100}%"></i></div></div><div class="brow"><div class="h"><span>Karta</span><b class="num">${pay.card}</b></div><div class="track"><i style="width:${(pay.card / (sel.length || 1)) * 100}%"></i></div></div>
          <div class="brow" style="margin-top:8px"><div class="h"><span>Kuryer</span><b class="num">${dlv.courier}</b></div><div class="track"><i style="width:${(dlv.courier / (sel.length || 1)) * 100}%;background:var(--violet)"></i></div></div><div class="brow"><div class="h"><span>Olib ketish</span><b class="num">${dlv.pickup}</b></div><div class="track"><i style="width:${(dlv.pickup / (sel.length || 1)) * 100}%;background:var(--violet)"></i></div></div></div></div></div>`;
  }
  function bindAnalytics() {
    const { from, to } = anRange(); const a = A.an, sel = A.orders.filter((o) => { const t = new Date(o.created_at); return t >= from && t <= to && inc(o, a.status); });
    bindChart('an', agg(sel, a.group, from, to));
  }

  /* ====================== BUYURTMALAR ====================== */
  function orders() {
    const q = A.oq.toLowerCase(), list = A.orders.filter((o) => (A.ofilter === 'all' || o.status === A.ofilter) && (!q || (o.no + o.name + o.phone).toLowerCase().includes(q)));
    return `<div class="tools"><input class="in" id="oq" placeholder="Qidirish: raqam, ism, telefon" value="${esc(A.oq)}"><div class="chips">${[['all', 'Hammasi'], ...STATUS].map(([s, l]) => `<button class="chip ${A.ofilter === s ? 'on' : ''}" data-of="${s}">${l} <small class="num">${s === 'all' ? A.orders.length : A.orders.filter((o) => o.status === s).length}</small></button>`).join('')}</div><div style="flex:1"></div><button class="btn out sm" id="csv">CSV yuklash</button></div>
      <div class="tbl-wrap"><table><thead><tr><th>Raqam</th><th>Mijoz</th><th>Mahsulotlar</th><th>Jami</th><th>Yetkazish / to'lov</th><th>Holat</th><th>Sana</th></tr></thead><tbody>
      ${list.slice(0, 200).map((o) => `<tr class="click ${fresh.has(o.id) ? 'fresh' : ''}" data-open-order="${esc(o.id)}"><td><b>${esc(o.no)}</b></td><td><b>${esc(o.name)}</b><br><span class="mut num" style="font-size:13px">${esc(o.phone)}</span></td><td>${esc(o.items.map((i) => i.title + ' ×' + i.qty).join(', ').slice(0, 60))}</td><td class="num"><b>${money(o.total)}</b></td><td>${o.delivery === 'pickup' ? 'Olib ketish' : 'Kuryer'}<br><span class="mut" style="font-size:13px">${o.payment === 'card' ? 'Karta' : 'Naqd'}</span></td><td>${pill(o.status)}</td><td class="mut num">${fmtDate(o.created_at)}</td></tr>`).join('')}</tbody></table>
      ${list.length ? (list.length > 200 ? `<div class="empty">Dastlabki 200 ta ko'rsatilmoqda. Qidiruvdan foydalaning.</div>` : '') : '<div class="empty">Buyurtmalar topilmadi</div>'}</div>`;
  }
  function orderPanel(id) {
    const o = A.orders.find((x) => String(x.id) === String(id)); if (!o) return;
    openPanel(`<div class="ph"><div><span class="lbl">Buyurtma</span><h2>${esc(o.no)}</h2></div><button class="ib" data-close aria-label="Yopish">✕</button></div>
      <div class="pb"><div><span class="lbl">Holat</span><div class="flow" style="margin-top:10px">${STATUS.map(([s, l]) => `<button class="${o.status === s ? 'cur' : ''}" data-setst="${s}">${l}</button>`).join('')}</div></div>
      <div class="card" style="padding:8px 22px"><div class="kv"><div><span>Mijoz</span><span>${esc(o.name)}</span></div><div><span>Telefon</span><span class="num"><a href="tel:${esc(o.phone)}" style="color:var(--brand)">${esc(o.phone)}</a></span></div>
        <div><span>Yetkazish</span><span>${o.delivery === 'pickup' ? 'Olib ketish' : 'Kuryer'}</span></div>${o.delivery === 'courier' ? `<div><span>Manzil</span><span>${esc(o.address)}</span></div>` : ''}
        <div><span>To'lov</span><span>${o.payment === 'card' ? 'Karta (qabul qilganda)' : 'Naqd'}</span></div>${o.comment ? `<div><span>Izoh</span><span>${esc(o.comment)}</span></div>` : ''}<div><span>Sana</span><span class="num">${fmtDate(o.created_at)}</span></div></div></div>
      <div class="card" style="padding:8px 22px"><div class="kv">${o.items.map((i) => `<div><span>${esc(i.title)}${i.color ? ` · ${esc(i.color)}` : ''} × ${i.qty}</span><span class="num">${money(i.price * i.qty)}</span></div>`).join('')}
        <div><span>Yetkazib berish</span><span class="num">${o.delivery_fee ? money(o.delivery_fee) : 'Bepul'}</span></div><div><span><b>Jami</b></span><span class="num"><b>${money(o.total)}</b></span></div></div></div></div>
      <div class="pf"><button class="btn bad sm" data-delorder="${esc(o.id)}">O'chirish</button><a class="btn out sm" target="_blank" rel="noopener" href="https://t.me/${esc((A.settings.telegram || '').replace('@', ''))}">Telegram</a></div>`);
    $('#panel').dataset.oid = o.id;
  }

  /* ====================== MAHSULOTLAR ====================== */
  function products() {
    const q = A.pq.toLowerCase(), list = A.products.filter((p) => !q || (p.title + p.brand).toLowerCase().includes(q));
    return `<div class="tools"><input class="in" id="pq" placeholder="Qidirish" value="${esc(A.pq)}"><div style="flex:1"></div><button class="btn" id="newp">+ Yangi mahsulot</button></div>
      <div class="tbl-wrap"><table><thead><tr><th>Mahsulot</th><th>Kategoriya</th><th>Narx</th><th>Ombor</th><th>Faol</th><th></th></tr></thead><tbody>
      ${list.map((p) => `<tr><td><div class="pcell">${thumb(p)}<div><b>${esc(p.title)}</b><small>${esc(p.brand || '')}${p.featured ? ' · tanlangan' : ''}${(p.images || []).length >= 3 ? ' · 360°' : p.model3d ? ' · 3D' : ''}</small></div></div></td><td>${esc(catName(p.category_id))}</td>
        <td class="num"><b>${p.price ? money(p.price) : '—'}</b>${p.old_price > p.price ? `<br><span class="mut" style="text-decoration:line-through;font-size:13px">${money(p.old_price)}</span>` : ''}</td>
        <td><span class="pill ${p.stock <= 0 ? 's-cancelled' : p.stock <= 3 ? 's-confirmed' : 's-delivered'} num">${p.stock} ta</span></td><td><button class="sw ${p.active !== false ? 'on' : ''}" data-toggle="${esc(p.id)}" aria-label="Sotuvda"></button></td>
        <td><div class="acts"><button class="btn out sm" data-editp="${esc(p.id)}">Tahrirlash</button><button class="btn out sm" data-delp="${esc(p.id)}" aria-label="O'chirish">✕</button></div></td></tr>`).join('')}</tbody></table>
      ${list.length ? '' : `<div class="empty">Mahsulotlar yo'q. "Yangi mahsulot" tugmasini bosing.</div>`}</div>`;
  }
  function productPanel(id) {
    const p = id ? prodOf(id) : null;
    const st = { images: [...(p?.images || [])], specs: Object.entries(p?.specs || {}), colors: (p?.colors || []).map((c) => ({ ...c })) };
    const imgs = () => `${st.images.map((u, i) => `<div class="im"><img src="${esc(imgSrc(u))}" alt="">${i < 6 ? `<span class="mk">${['Old', 'Yon', 'Orqa', 'Tepa', 'Salon', 'Detal'][i]}</span>` : ''}<button type="button" data-rmimg="${i}" aria-label="O'chirish">✕</button></div>`).join('')}<label class="add-im" title="Rasm yuklash">+<input type="file" id="fimg" accept="image/*" multiple></label>`;
    const specs = () => st.specs.map(([k, v], i) => `<div class="row3"><input data-sk="${i}" placeholder="Nomi (Yosh)" value="${esc(k)}"><input data-sv="${i}" placeholder="Qiymati (2-6 yosh)" value="${esc(v)}"><button type="button" class="ib" data-rmspec="${i}" aria-label="O'chirish">✕</button></div>`).join('');
    const cols = () => st.colors.map((c, i) => `<div class="colrow"><input type="color" data-ch="${i}" value="${esc(c.hex)}" aria-label="Rang"><input type="text" data-cn="${i}" placeholder="Rang nomi (Qizil)" value="${esc(c.name)}"><button type="button" class="ib" data-rmcol="${i}" aria-label="O'chirish">✕</button></div>`).join('');
    openPanel(`<form id="pf" style="display:contents" novalidate><div class="ph"><h2>${p ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h2><button type="button" class="ib" data-close aria-label="Yopish">✕</button></div>
      <div class="pb"><label class="fld"><span>Nomi</span><input id="p_title" required value="${esc(p?.title || '')}"></label>
        <label class="fld"><span>Qisqa tavsif (kartochkada)</span><input id="p_short" value="${esc(p?.short || '')}" maxlength="90"></label>
        <label class="fld"><span>To'liq tavsif</span><textarea id="p_desc">${esc(p?.description || '')}</textarea></label>
        <div class="grid2"><label class="fld"><span>Kategoriya</span><select id="p_cat"><option value="">Tanlanmagan</option>${A.categories.map((c) => `<option value="${esc(c.id)}" ${p?.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <label class="fld"><span>Brend</span><input id="p_brand" value="${esc(p?.brand ?? 'BabyCheer')}"></label></div>
        <div class="grid3"><label class="fld"><span>Narx (so'm)</span><input id="p_price" type="number" min="0" step="1000" value="${p?.price ?? ''}" required></label>
          <label class="fld"><span>Eski narx</span><input id="p_old" type="number" min="0" step="1000" value="${p?.old_price || ''}"></label>
          <label class="fld"><span>Ombor (dona)</span><input id="p_stock" type="number" min="0" value="${p?.stock ?? 1}"></label></div>
        <div class="grid2"><label class="fld"><span>Yorliq (Yangi, Hit...)</span><input id="p_badge" value="${esc(p?.badge || '')}" maxlength="20"></label>
          <label class="fld"><span>3D model (rasm bo'lmaganda)</span><select id="p_3d">${[['', "Yo'q"], ['single', '1 kishilik mashina'], ['double', '2 kishilik mashina'], ['suv', 'Jip']].map(([v, l]) => `<option value="${v}" ${(p?.model3d || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
        <div style="display:flex;gap:26px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="p_feat" ${p?.featured ? 'checked' : ''}>Bosh sahifada ko'rsatish</label><label class="chk"><input type="checkbox" id="p_act" ${p?.active === false ? '' : 'checked'}>Sotuvda</label></div>
        <div><span class="lbl">Rasmlar</span><div class="imgs" id="imgs" style="margin-top:10px">${imgs()}</div><p class="mut" style="font-size:13px;margin:10px 0 0">3 ta va undan ko'p rasm yuklasangiz, saytda <b>360° ko'rinish</b> paydo bo'ladi. Tartib: Old, Yon, Orqa, Tepa. Rasmlar avtomatik siqiladi.</p></div>
        <div><span class="lbl">Ranglar</span><div id="cols" style="margin:10px 0 8px">${cols()}</div><button type="button" class="btn out sm" id="addcol">+ Rang qo'shish</button></div>
        <div><span class="lbl">Xususiyatlar</span><div id="specs" style="margin:10px 0 8px">${specs()}</div><button type="button" class="btn out sm" id="addspec">+ Xususiyat qo'shish</button></div><div id="pe"></div></div>
      <div class="pf"><button type="button" class="btn out" data-close>Bekor qilish</button><button class="btn" type="submit">Saqlash</button></div></form>`, true);
    const sync = () => { $$('[data-sk]').forEach((el) => { st.specs[+el.dataset.sk][0] = el.value; }); $$('[data-sv]').forEach((el) => { st.specs[+el.dataset.sv][1] = el.value; }); $$('[data-ch]').forEach((el) => { st.colors[+el.dataset.ch].hex = el.value; }); $$('[data-cn]').forEach((el) => { st.colors[+el.dataset.cn].name = el.value; }); };
    const redraw = () => { $('#imgs').innerHTML = imgs(); bindImg(); $('#specs').innerHTML = specs(); $('#cols').innerHTML = cols(); };
    const bindImg = () => { $('#fimg').onchange = async (e) => { const files = [...e.target.files]; if (!files.length) return; toast('Rasm yuklanmoqda...'); sync(); for (const f of files) { const r = await guard(() => api.admin.upload(f)); if (r.ok) st.images.push(r.v); } redraw(); }; };
    bindImg();
    $('#panel').onclick = (e) => {
      const r = e.target.closest('[data-rmimg]'); if (r) { sync(); st.images.splice(+r.dataset.rmimg, 1); redraw(); }
      const s = e.target.closest('[data-rmspec]'); if (s) { sync(); st.specs.splice(+s.dataset.rmspec, 1); redraw(); }
      const c = e.target.closest('[data-rmcol]'); if (c) { sync(); st.colors.splice(+c.dataset.rmcol, 1); redraw(); }
      if (e.target.closest('#addspec')) { sync(); st.specs.push(['', '']); redraw(); }
      if (e.target.closest('#addcol')) { sync(); st.colors.push({ name: '', hex: '#2b59ff' }); redraw(); }
      if (e.target.closest('[data-close]')) closePanel();
    };
    $('#pf').onsubmit = async (e) => {
      e.preventDefault(); sync(); $('#pe').innerHTML = '';
      const title = $('#p_title').value.trim(), price = Math.round(+$('#p_price').value);
      if (title.length < 2) return ($('#pe').innerHTML = '<div class="err">Mahsulot nomini kiriting</div>');
      if (!(price >= 0)) return ($('#pe').innerHTML = '<div class="err">Narxni kiriting</div>');
      const colors = st.colors.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), hex: c.hex }));
      const payload = { ...(p ? { id: p.id } : {}), title, short: $('#p_short').value.trim(), description: $('#p_desc').value.trim(), category_id: $('#p_cat').value || null, brand: $('#p_brand').value.trim(), price,
        old_price: Math.round(+$('#p_old').value) || 0, stock: Math.max(Math.round(+$('#p_stock').value) || 0, 0), badge: $('#p_badge').value.trim(), model3d: $('#p_3d').value, featured: $('#p_feat').checked, active: $('#p_act').checked,
        specs: Object.fromEntries(st.specs.filter(([k, v]) => k.trim() && v.trim()).map(([k, v]) => [k.trim(), v.trim()])), images: st.images, colors, color: (colors[0] || {}).hex || '#2b59ff' };
      const b = $('button[type=submit]', e.target); b.disabled = true; const r = await guard(() => api.admin.saveProduct(payload)); b.disabled = false; if (!r.ok) return;
      await loadProducts(); closePanel(); toast('Mahsulot saqlandi'); show();
    };
  }

  /* ====================== KATEGORIYALAR, XABARLAR, SOZLAMALAR ====================== */
  function categories() {
    return `<div class="card" style="margin-bottom:14px"><h3>Yangi kategoriya</h3><p class="sub">Saytdagi kolleksiyalar shu yerdan boshqariladi</p><form id="ncf" class="grid3" style="grid-template-columns:2fr 1fr auto;align-items:end"><label class="fld"><span>Nomi</span><input id="nc_name" required placeholder="Masalan: Avtokreslolar"></label><label class="fld"><span>Tartib</span><input id="nc_sort" type="number" value="${A.categories.length + 1}"></label><button class="btn" type="submit">Qo'shish</button></form></div>
      <div class="tbl-wrap"><table><thead><tr><th>Nomi</th><th>Tartib</th><th>Mahsulotlar</th><th></th></tr></thead><tbody>
      ${A.categories.map((c) => `<tr><td><input class="in" data-cn="${esc(c.id)}" value="${esc(c.name)}"></td><td style="width:120px"><input class="in num" type="number" data-cs="${esc(c.id)}" value="${c.sort}"></td><td class="num">${A.products.filter((p) => p.category_id === c.id).length}</td>
        <td><div class="acts"><button class="btn out sm" data-savec="${esc(c.id)}">Saqlash</button><button class="btn out sm" data-delc="${esc(c.id)}" aria-label="O'chirish">✕</button></div></td></tr>`).join('')}</tbody></table></div>`;
  }
  function messages() {
    const list = A.messages;
    return `<div style="display:grid;gap:12px;max-width:860px">${list.map((m) => `<div class="msg ${m.handled ? '' : 'new'}"><div class="t"><div><b style="font:700 18px var(--font-d)">${esc(m.name)}</b> <a class="num" href="tel:${esc(m.phone)}" style="color:var(--brand);font-weight:800;margin-left:8px">${esc(m.phone)}</a></div><span class="mut num" style="font-size:13px">${fmtDate(m.created_at)}</span></div>
      <p>${esc(m.message)}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ${m.handled ? 'out' : ''}" data-handle="${esc(m.id)}" data-v="${m.handled ? 0 : 1}">${m.handled ? 'Qayta ochish' : 'Javob berildi'}</button><a class="btn out sm" href="tel:${esc(m.phone)}">Qo'ng'iroq</a><button class="btn out sm" data-delm="${esc(m.id)}">O'chirish</button></div></div>`).join('') || '<div class="card empty">Xabarlar yo\'q</div>'}</div>`;
  }
  function settings() {
    const s = A.settings, f = (id, l, v, extra = '') => `<label class="fld"><span>${l}</span><input id="${id}" value="${esc(v ?? '')}" ${extra}></label>`;
    return `<form class="card" id="sf" style="max-width:780px;display:grid;gap:16px"><h3 style="margin:0">Do'kon ma'lumotlari</h3><div class="grid2">${f('s_phone', 'Telefon', s.phone)}${f('s_tg', 'Telegram admin (@siz)', s.telegram)}</div>${f('s_ch', 'Telegram guruh havolasi', s.channel)}${f('s_ig', 'Instagram havolasi', s.instagram)}
      <div class="grid3">${f('s_free', "Bepul yetkazish (so'mdan)", s.freeFrom, 'type="number" min="0"')}${f('s_fee', "Yetkazish narxi (so'm)", s.deliveryFee, 'type="number" min="0"')}${f('s_war', 'Kafolat (oy)', s.warrantyMonths ?? 6, 'type="number" min="0"')}</div><div id="se"></div><div><button class="btn" type="submit">Saqlash</button></div></form>
      ${api.mode === 'demo' ? `<div class="card" style="max-width:780px;margin-top:14px"><h3>Demo rejim</h3><p class="mut" style="margin:6px 0 16px">Ma'lumotlar faqat shu brauzerda saqlanadi, namunaviy buyurtmalar analitikani ko'rsatish uchun qo'yilgan. Haqiqiy buyurtmalar boshqa qurilmadan kelishi uchun Supabase ulang: setup.html sahifasi bosqichma-bosqich yo'l ko'rsatadi.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn out sm" id="purge">Namunaviy buyurtmalarni o'chirish</button><button class="btn bad sm" id="reset">Hammasini tiklash</button></div></div>` : ''}`;
  }

  /* ====================== chizish va hodisalar ====================== */
  const VIEWS = { dashboard, analytics, orders, products, categories, messages, settings };
  function show() {
    const pg = $('#page'); nav();
    pg.innerHTML = `${api.mode === 'demo' && A.tab === 'dashboard' ? '<div class="banner"><span><b>Demo rejim.</b> Ma\'lumotlar faqat shu brauzerda saqlanadi, mijozlar buyurtmasi boshqa qurilmadan bu yerga tushmaydi. Ulash 5 daqiqa oladi.</span><a class="btn sm" href="../setup.html">Ulashni boshlash</a></div>' : ''}<div class="view">${(VIEWS[A.tab] || dashboard)()}</div>`;
    if (A.tab === 'analytics') bindAnalytics();
    if (A.tab === 'dashboard') { const days = Array.from({ length: 14 }, (_, i) => { const d = dayStart(new Date()); d.setDate(d.getDate() - (13 - i)); return { d, v: 0, n: 0 }; }); A.orders.filter((o) => o.status !== 'cancelled').forEach((o) => { const x = days.find((k) => sameDay(k.d, o.created_at)); if (x) { x.v += o.total; x.n++; } }); bindChart('dash', days.map((d) => ({ label: String(d.d.getDate()), title: d.d.toLocaleDateString('ru-RU'), v: d.v, n: d.n, q: 0 }))); }
  }
  function route() { const t = (location.hash.replace(/^#\//, '') || 'dashboard').split('?')[0]; A.tab = VIEWS[t] ? t : 'dashboard'; closePanel(); $('#side')?.classList.remove('on'); show(); window.scrollTo(0, 0); }

  document.addEventListener('click', async (e) => {
    if (!A.user) return; const t = (s) => e.target.closest(s);
    if (t('[data-close]')) closePanel();
    const oo = t('[data-open-order]'); if (oo) { if (oo.tagName === 'A') e.preventDefault(); orderPanel(oo.dataset.openOrder); return; }
    const of = t('[data-of]'); if (of) { A.ofilter = of.dataset.of; show(); return; }
    const rg = t('[data-range]'); if (rg) { A.an.range = rg.dataset.range; A._grpTouched = false; show(); return; }
    const gp = t('[data-group]'); if (gp) { A.an.group = gp.dataset.group; A._grpTouched = true; show(); return; }
    const so = t('[data-sort]'); if (so) { const k = so.dataset.sort; A.an.dir = A.an.sort === k ? -A.an.dir : (k === 'title' ? 1 : -1); A.an.sort = k; show(); return; }
    const st = t('[data-setst]'); if (st) { const id = $('#panel').dataset.oid; const r = await guard(() => api.admin.setStatus(id, st.dataset.setst)); if (!r.ok) return; await loadOrders(); await loadProducts(); show(); orderPanel(id); toast('Holat yangilandi'); return; }
    const dor = t('[data-delorder]'); if (dor && (await ask("Buyurtmani o'chirish", "Bu amalni qaytarib bo'lmaydi."))) { await guard(() => api.admin.deleteOrder(dor.dataset.delorder)); await loadOrders(); closePanel(); show(); toast("Buyurtma o'chirildi"); return; }
    if (t('#newp')) { productPanel(null); return; }
    const ep = t('[data-editp]'); if (ep) { productPanel(ep.dataset.editp); return; }
    const dp = t('[data-delp]'); if (dp && (await ask("Mahsulotni o'chirish", "Mahsulot katalogdan butunlay o'chiriladi. Vaqtincha olib qo'yish uchun \"Sotuvda\" tugmasidan foydalaning."))) { await guard(() => api.admin.deleteProduct(dp.dataset.delp)); await loadProducts(); show(); toast("Mahsulot o'chirildi"); return; }
    const tg = t('[data-toggle]'); if (tg) { const p = prodOf(tg.dataset.toggle); const r = await guard(() => api.admin.saveProduct({ ...p, active: p.active === false })); if (r.ok) { await loadProducts(); show(); } return; }
    const sc = t('[data-savec]'); if (sc) { const id = sc.dataset.savec, c = catOf(id); const r = await guard(() => api.admin.saveCategory({ ...c, name: $(`[data-cn="${CSS.escape(id)}"]`).value.trim(), sort: +$(`[data-cs="${CSS.escape(id)}"]`).value || 0 })); if (r.ok) { await loadCats(); show(); toast('Saqlandi'); } return; }
    const dc = t('[data-delc]'); if (dc && (await ask("Kategoriyani o'chirish", "Mahsulotlar o'chmaydi, faqat kategoriyasiz qoladi."))) { await guard(() => api.admin.deleteCategory(dc.dataset.delc)); await loadCats(); await loadProducts(); show(); return; }
    const hd = t('[data-handle]'); if (hd) { await guard(() => api.admin.setHandled(hd.dataset.handle, hd.dataset.v === '1')); await loadMsgs(); show(); return; }
    const dm = t('[data-delm]'); if (dm && (await ask("Xabarni o'chirish", "Xabar butunlay o'chiriladi."))) { await guard(() => api.admin.deleteMessage(dm.dataset.delm)); await loadMsgs(); show(); return; }
    if (t('#purge') && (await ask("Namunaviy buyurtmalar", "Barcha namunaviy (demo) buyurtma va xabarlar o'chadi. Siz kiritganlari qoladi.", "O'chirish"))) { await api.admin.purgeDemo(); await Promise.all([loadOrders(), loadMsgs()]); show(); toast("Namunaviy ma'lumotlar o'chirildi"); return; }
    if (t('#reset') && (await ask('Demo tiklash', "Barcha demo buyurtma va o'zgarishlar o'chadi.", 'Tiklash'))) { Object.keys(localStorage).filter((k) => k.startsWith('bc3_') && !k.includes('theme')).forEach((k) => localStorage.removeItem(k)); location.reload(); return; }
    if (t('#csv')) { csv('buyurtmalar.csv', [['Raqam', 'Sana', 'Ism', 'Telefon', 'Manzil', 'Mahsulotlar', 'Jami', 'Holat']].concat(A.orders.map((o) => [o.no, o.created_at, o.name, o.phone, o.address, o.items.map((i) => `${i.title}${i.color ? ' (' + i.color + ')' : ''} x${i.qty}`).join('; '), o.total, sLabel(o.status)]))); return; }
    if (t('#anCsv')) { const rows = $$('.card tbody tr', $('#page')).filter((r) => r.children.length === 7); csv('mahsulot-sotuvi.csv', [['#', 'Mahsulot', 'Kategoriya', 'Sotilgan dona', 'Buyurtma', 'Daromad']].concat(rows.map((r) => [r.children[0].textContent.trim(), r.children[1].querySelector('b').textContent, r.children[2].textContent, r.children[3].textContent.replace(/\D/g, ''), r.children[4].textContent, r.children[5].textContent.replace(/\D/g, '')]))); }
  });
  function csv(name, rows) {
    const body = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const keepFocus = (id) => { const i = $('#' + id), pos = i.selectionStart; show(); const n = $('#' + id); n.focus(); n.setSelectionRange(pos, pos); };
  document.addEventListener('input', (e) => { if (e.target.id === 'oq') { A.oq = e.target.value; keepFocus('oq'); } if (e.target.id === 'pq') { A.pq = e.target.value; keepFocus('pq'); } if (e.target.id === 'anQ') { A.an.q = e.target.value; keepFocus('anQ'); } });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'anStatus') { A.an.status = e.target.value; show(); }
    if (e.target.id === 'anFrom') { A.an.from = e.target.value; A._grpTouched = false; show(); } if (e.target.id === 'anTo') { A.an.to = e.target.value; A._grpTouched = false; show(); }
  });
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'ncf') { e.preventDefault(); const name = $('#nc_name').value.trim(); if (!name) return; const r = await guard(() => api.admin.saveCategory({ name, slug: slugify(name), sort: +$('#nc_sort').value || 0 })); if (r.ok) { await loadCats(); show(); toast("Kategoriya qo'shildi"); } }
    if (e.target.id === 'sf') {
      e.preventDefault(); const v = (id) => $('#' + id).value.trim();
      const s = { ...A.settings, phone: v('s_phone'), telegram: v('s_tg').replace('@', ''), channel: v('s_ch'), instagram: v('s_ig'), freeFrom: Math.max(+v('s_free') || 0, 0), deliveryFee: Math.max(+v('s_fee') || 0, 0), warrantyMonths: Math.max(+v('s_war') || 0, 0) };
      const r = await guard(() => api.admin.saveSettings(s)); if (r.ok) { A.settings = s; toast('Sozlamalar saqlandi'); }
    }
  });
  window.addEventListener('hashchange', () => A.user && route()); addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  async function start() {
    shell(); await Promise.all([loadOrders(), loadProducts(), loadCats(), loadMsgs(), api.admin.settings().then((s) => { A.settings = s; })]); route();
    unsub && unsub();
    unsub = api.admin.onChange(async (what) => {
      if (what === 'messages') { const before = A.messages.length; await loadMsgs(); if (A.messages.length > before) { toast(`Yangi xabar: ${A.messages[0].name}`); beep(); } if (A.tab === 'messages' || A.tab === 'dashboard') show(); else nav(); return; }
      const before = new Set(A.orders.map((o) => String(o.id))); await loadOrders(); await loadProducts();
      const added = A.orders.filter((o) => !before.has(String(o.id))); added.forEach((o) => fresh.add(o.id)); setTimeout(() => fresh.clear(), 6000);
      if (added.length) { toast(`Yangi buyurtma: ${added[0].no} · ${money(added[0].total)}`); beep(); }
      if (['orders', 'dashboard', 'analytics'].includes(A.tab)) show(); else nav();
    });
  }
  (async () => { try { A.user = await api.admin.session(); } catch { A.user = null; } A.user ? start() : loginView(); })();
})();
