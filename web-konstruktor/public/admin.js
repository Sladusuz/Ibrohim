'use strict';
// Egasining admin paneli: boshqaruv, buyurtmalar, mijoz saytlari, mijozlar, narxlar, sayt tahrirlagichi, sozlamalar.
(function () {
  const E = window.E, { esc } = E;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = (n) => window.svgIcon(n);
  const PS = { qoralama: 'Qoralama', yuborilgan: 'Yuborilgan', korilmoqda: "Ko'rib chiqilmoqda", narx: 'Narx belgilandi', joylandi: 'Joylandi', bekor: 'Bekor qilindi' };
  const OS = { yangi: 'Yangi', jarayonda: 'Jarayonda', bajarildi: 'Bajarildi', bekor: 'Bekor qilindi' };
  const OT = { order: 'Buyurtma', brief: "Loyiha so'rovi", booking: 'Ariza', message: 'Xabar' };
  const TPL = { market: 'Onlayn market', dizayner: 'Portfolio: dizayner', dasturchi: 'Portfolio: dasturchi', fotograf: 'Portfolio: fotograf', kompaniya: 'IT kompaniya', restoran: 'Restoran / kafe', salon: "Go'zallik saloni", talim: "O'quv markaz" };
  const fdate = (d) => { const t = new Date(d); if (isNaN(t)) return d || ''; const p = (n) => String(n).padStart(2, '0'); return `${p(t.getDate())}.${p(t.getMonth() + 1)}.${t.getFullYear()} ${p(t.getHours())}:${p(t.getMinutes())}`; };
  const sum = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ');
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); };
  const pg = $('#pg');
  const st = { page: 'dash', stats: null, orders: [], projects: [], users: [], pricing: null, site: null, settings: null, of: { q: '', s: '', t: '' }, pf: { q: '', s: '' }, uq: '', siteDirty: false, ed: null, previewReady: false };

  const API = String(window.__API__ || '').replace(/\/$/, ''), tokGet = () => { try { return localStorage.getItem('impro_adm') || ''; } catch { return ''; } }, tokSet = (v) => { try { v ? localStorage.setItem('impro_adm', v) : localStorage.removeItem('impro_adm'); } catch { /* ignore */ } };
  async function api(method, url, body) {
    const h = { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(tokGet() ? { Authorization: 'Bearer ' + tokGet() } : {}) };
    const r = await fetch(API + url, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && url !== '/api/admin/login') { showLogin(); throw new Error('Qayta kiring'); }
    if (!r.ok) throw new Error(j.error || 'Xatolik');
    if (url === '/api/admin/login' && j.token) tokSet(j.token);
    if (url === '/api/admin/logout') tokSet('');
    return j;
  }
  function showLogin() { $('#login').hidden = false; $('#app').hidden = true; setTimeout(() => $('#pw').focus(), 50); }
  $('#lf').addEventListener('submit', async (e) => {
    e.preventDefault(); $('#le').textContent = '';
    try { await api('POST', '/api/admin/login', { password: $('#pw').value.trim() }); $('#pw').value = ''; $('#login').hidden = true; await start(); } catch (er) { $('#le').textContent = er.message; }
  });
  $('#out').addEventListener('click', async () => { await api('POST', '/api/admin/logout', {}).catch(() => {}); st.siteDirty = false; location.reload(); });

  /* ---------- Menyu ---------- */
  const NAV = [['dash', 'Boshqaruv', 'chart'], ['orders', 'Buyurtmalar', 'inbox'], ['projects', 'Mijoz saytlari', 'globe'], ['users', 'Mijozlar', 'users'], ['bots', 'Telegram botlar', 'send'], ['prices', 'Narxlar', 'dollar'], ['site', 'Sayt', 'edit'], ['settings', 'Sozlamalar', 'settings']];
  function drawNav() {
    const s = st.stats; const bd = { orders: s ? s.orders.new : 0, projects: s ? s.projects.submitted : 0 };
    $('#nav').innerHTML = NAV.map(([k, l, i]) => `<button class="ni ${st.page === k ? 'on' : ''}" data-go="${k}">${icon(i)}<span>${l}</span>${bd[k] ? `<span class="bd">${bd[k]}</span>` : ''}</button>`).join('');
  }
  async function refreshStats() { try { st.stats = await api('GET', '/api/admin/stats'); drawNav(); } catch { /* ignore */ } }
  $('#nav').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

  async function go(page) {
    if (st.page === 'site' && st.siteDirty && page !== 'site' && !confirm("Saytdagi saqlanmagan o'zgarishlar yo'qoladi. Davom etasizmi?")) return;
    if (st.page === 'site') st.siteDirty = false;
    st.page = page; drawNav(); pg.className = ''; pg.innerHTML = '<div class="empty2">Yuklanmoqda…</div>'; $('#pa').innerHTML = '';
    try { await P[page].load(); } catch (e) { pg.innerHTML = `<div class="empty2">${esc(e.message)}</div>`; return; }
    $('#pt').textContent = P[page].title; P[page].render(); refreshStats();
  }

  /* =============== BOSHQARUV =============== */
  function chart(s) {
    const keys = [['orders', 'Buyurtmalar', '#4f46e5'], ['projects', 'Sayt so\'rovlari', '#06b6d4'], ['users', 'Yangi mijozlar', '#f59e0b']];
    const max = Math.max(3, ...keys.flatMap(([k]) => s[k].series));
    const W = 640, H = 190, pl = 28, pb = 24, gw = (W - pl) / 14, bw = Math.min(11, gw / 3.4);
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); return d.getDate(); });
    let g = ''; for (let i = 0; i <= 3; i++) { const y = 8 + ((H - pb - 8) / 3) * i; g += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="#e8ebf3"/><text x="0" y="${y + 4}" font-size="10" fill="#94a3b8">${Math.round(max - (max / 3) * i)}</text>`; }
    let bars = ''; days.forEach((d, i) => { keys.forEach(([k, , c], j) => { const v = s[k].series[i], h = ((H - pb - 8) * v) / max; bars += `<rect x="${(pl + i * gw + gw / 2 - bw * 1.5 + j * bw + j).toFixed(1)}" y="${(H - pb - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="2.5" fill="${c}"><title>${d}: ${v}</title></rect>`; }); bars += `<text x="${(pl + i * gw + gw / 2).toFixed(1)}" y="${H - 6}" font-size="10" text-anchor="middle" fill="#94a3b8">${d}</text>`; });
    return `<div class="chartw">${keys.map(([k, l, c]) => `<label><i style="background:${c}"></i>${l}: <b>${s[k].series.reduce((a, b) => a + b, 0)}</b></label>`).join('')}</div><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="So'nggi 14 kun">${g}${bars}</svg>`;
  }
  const P = {
    dash: {
      title: 'Boshqaruv paneli',
      async load() { const [s, o, p] = await Promise.all([api('GET', '/api/admin/stats'), api('GET', '/api/admin/orders'), api('GET', '/api/admin/projects')]); st.stats = s; st.orders = o; st.projects = p; },
      render() {
        const s = st.stats;
        pg.innerHTML = `<div class="kpis"><div class="kpi ${s.revenue && s.revenue.usd ? 'hot' : ''}"><small>Shablon sotuvlari</small><b>$${esc(s.revenue ? s.revenue.usd : 0)}</b><span>${s.projects.paid || 0} ta sotilgan, ${s.projects.published || 0} ta joylangan</span></div><div class="kpi ${s.orders.new ? 'hot' : ''}"><small>Yangi buyurtmalar</small><b>${s.orders.new}</b><span>Jami: ${s.orders.total} ta</span></div><div class="kpi"><small>Buyurtmalar summasi</small><b>${sum(s.orders.sum)}</b><span>so'm (bekor qilinmaganlar)</span></div><div class="kpi"><small>Mijozlar</small><b>${s.users.total}</b><span>ro'yxatdan o'tgan</span></div><div class="kpi ${s.projects.submitted ? 'hot' : ''}"><small>Yangi sayt so'rovlari</small><b>${s.projects.submitted}</b><span>Jami loyiha: ${s.projects.total} ta</span></div></div>
          <div class="grid2"><div class="card"><h3>So'nggi 14 kun</h3>${chart(s)}</div><div class="card"><h3>Oxirgi buyurtmalar</h3>${st.orders.length ? `<table class="tbl"><tbody>${st.orders.slice(0, 6).map((o) => `<tr><td><b>${esc(o.name)}</b><div style="color:var(--muted);font-size:12px">${esc(fdate(o.date))}</div></td><td style="text-align:right">${o.total ? sum(o.total) : ''}<br><span class="pill s-${esc(o.status)}">${esc(OS[o.status] || o.status)}</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty2" style="padding:30px">Hozircha buyurtma yo\'q</div>'}<button class="b g s" data-go2="orders" style="margin-top:10px">Hammasini ko'rish</button></div></div>
          <div class="card" style="margin-top:14px"><h3>Mijozlarning sayt so'rovlari</h3>${st.projects.filter((p) => p.status !== 'qoralama').length ? `<table class="tbl"><thead><tr><th>Sayt</th><th>Mijoz</th><th>Tarif</th><th>Holat</th></tr></thead><tbody>${st.projects.filter((p) => p.status !== 'qoralama').slice(0, 6).map((p) => `<tr><td><b>${esc(p.name)}</b><div style="color:var(--muted);font-size:12px">${esc(TPL[p.template] || p.template)}</div></td><td>${p.user ? esc(p.user.name) + '<div style="color:var(--muted);font-size:12px">' + esc(p.user.phone) + '</div>' : ''}</td><td>${esc(p.plan || '-')}</td><td><span class="pill s-${esc(p.status)}">${esc(PS[p.status] || p.status)}</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty2" style="padding:30px">Hozircha so\'rov yo\'q</div>'}<button class="b g s" data-go2="projects" style="margin-top:10px">Hammasini ko'rish</button></div>`;
      },
    },

    /* =============== BUYURTMALAR =============== */
    orders: {
      title: 'Buyurtmalar',
      async load() { st.orders = await api('GET', '/api/admin/orders'); },
      render() {
        $('#pa').innerHTML = '<a class="b g s" href="/api/admin/orders.csv">' + icon('download') + ' CSV yuklab olish</a>';
        const cnt = (s) => (s ? st.orders.filter((o) => o.status === s).length : st.orders.length);
        pg.innerHTML = `<div class="bar2"><input type="search" id="oq" placeholder="Ism, telefon yoki # bo'yicha qidirish" value="${esc(st.of.q)}"><div class="chips">${[['', 'Hammasi'], ...Object.entries(OS)].map(([k, l]) => `<button data-of="${k}" class="${st.of.s === k ? 'on' : ''}">${l} (${cnt(k)})</button>`).join('')}</div><div class="chips">${[['', 'Barcha turlar'], ...Object.entries(OT)].map(([k, l]) => `<button data-ot="${k}" class="${st.of.t === k ? 'on' : ''}">${l}</button>`).join('')}</div></div><div id="olist"></div>`;
        P.orders.list();
      },
      list() {
        const q = st.of.q.toLowerCase(), l = st.orders.filter((o) => (!st.of.s || o.status === st.of.s) && (!st.of.t || o.type === st.of.t) && (!q || `${o.name} ${o.phone} ${o.id} ${o.userName || ''}`.toLowerCase().includes(q)));
        $('#olist').innerHTML = l.length ? l.map((o) => `<div class="rowc" data-oid="${esc(o.id)}"><div class="top2"><div><b>#${esc(o.id)}</b> <span class="pill s-${esc(o.status)}">${esc(OS[o.status] || o.status)}</span> ${o.type !== 'order' ? `<span class="pill ${o.type === 'brief' ? 's-narx' : 's-qoralama'}">${esc(OT[o.type] || o.type)}</span>` : ''}<div class="meta">${esc(fdate(o.date))}</div></div><div style="text-align:right"><b style="font-size:17px">${o.total ? sum(o.total) + " so'm" : ''}</b></div></div>
          <div style="margin-top:8px"><b>${esc(o.name)}</b> · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>${o.userName ? ` <span class="meta">(hisob: ${esc(o.userName)})</span>` : ' <span class="meta">(mehmon)</span>'}</div>
          ${(o.items || []).length ? `<div style="margin-top:6px;font-size:13.5px">${o.items.map((i) => `${esc(i.name)} × ${i.qty}`).join(', ')}${o.shipping ? ` <span class="meta">+ yetkazish ${sum(o.shipping)}</span>` : ''}</div>` : ''}
          ${o.type === 'brief' ? `<div class="briefx">${Object.entries(o.extra || {}).map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : Object.entries(o.extra || {}).map(([k, v]) => `<div class="meta">${esc(k)}: <b style="color:var(--ink)">${esc(v)}</b></div>`).join('')}${o.message ? `<div style="margin-top:6px;color:var(--muted)">${o.type === 'brief' ? '<b style="color:var(--ink)">Izoh:</b> ' : ''}${esc(o.message)}</div>` : ''}
          <div class="ed"><div><label>Holat</label><select data-ost>${Object.entries(OS).map(([k, l2]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${l2}</option>`).join('')}</select></div><div style="grid-column:span 2"><label>Ichki izoh (mijozga ko'rinmaydi)</label><input type="text" data-onote value="${esc(o.note || '')}" maxlength="300"></div><div><button class="b d s" data-odel>O'chirish</button></div></div></div>`).join('') : '<div class="empty2">Buyurtma topilmadi</div>';
      },
    },

    /* =============== MIJOZ SAYTLARI =============== */
    projects: {
      title: 'Mijoz saytlari',
      async load() { st.projects = await api('GET', '/api/admin/projects'); },
      render() {
        const cnt = (s) => (s ? st.projects.filter((o) => o.status === s).length : st.projects.length);
        pg.innerHTML = `<div class="bar2"><input type="search" id="pq" placeholder="Sayt nomi yoki mijoz bo'yicha qidirish" value="${esc(st.pf.q)}"><div class="chips">${[['', 'Hammasi'], ...Object.entries(PS)].map(([k, l]) => `<button data-pf="${k}" class="${st.pf.s === k ? 'on' : ''}">${l} (${cnt(k)})</button>`).join('')}</div></div><div id="plist"></div>`;
        P.projects.list();
      },
      list() {
        const q = st.pf.q.toLowerCase(), l = st.projects.filter((p) => (!st.pf.s || p.status === st.pf.s) && (!q || `${p.name} ${p.user ? p.user.name + p.user.phone : ''}`.toLowerCase().includes(q)));
        $('#plist').innerHTML = l.length ? l.map((p) => `<div class="rowc" data-pid="${esc(p.id)}"><div class="top2"><div><b style="font-size:16px">${esc(p.name)}</b> <span class="pill s-${esc(p.status)}">${esc(PS[p.status] || p.status)}</span>${p.paid ? ` <span class="pill s-joylandi">To'langan $${esc(p.paid.usd)}</span>` : ''}${p.published ? ` <span class="pill s-yuborilgan">Joylangan: ${esc(p.slug)}${p.customDomain ? ' · ' + esc(p.customDomain) : ''}</span>` : ''}<div class="meta">${esc(TPL[p.template] || p.template || '')} · Yangilangan: ${esc(fdate(p.updatedAt))}${p.submittedAt ? ' · Yuborilgan: ' + esc(fdate(p.submittedAt)) : ''}</div></div><div class="acts2"><button class="b s" data-pview>${icon('eye')} Ko'rish</button><button class="b g s" data-pdl>${icon('download')} .html</button><button class="b g s" data-pjson>.json</button></div></div>
          <div style="margin-top:8px">${p.user ? `<b>${esc(p.user.name)}</b> · <a href="tel:${esc(p.contactPhone || p.user.phone)}">${esc(p.contactPhone || p.user.phone)}</a>${p.user.email ? ' · ' + esc(p.user.email) : ''}` : '<span class="meta">Mijoz o\'chirilgan</span>'}</div>
          ${p.plan ? `<div class="meta" style="margin-top:4px">Tanlangan tarif: <b style="color:var(--ink)">${esc(p.plan)}</b></div>` : ''}${p.note ? `<div style="margin-top:4px;color:var(--muted)">Mijoz izohi: ${esc(p.note)}</div>` : ''}
          <div class="ed w2"><div><label>Holat</label><select data-pst>${Object.entries(PS).map(([k, l2]) => `<option value="${k}" ${p.status === k ? 'selected' : ''}>${l2}</option>`).join('')}</select></div><div><label>Narx (mijozga ko'rinadi)</label><input type="text" data-ppr value="${esc(p.price || '')}" maxlength="60" placeholder="masalan: 900 000 so'm"></div><div><label>Mijozga izoh</label><input type="text" data-pnote value="${esc(p.adminNote || '')}" maxlength="300" placeholder="Masalan: 3 kunda tayyor bo'ladi"></div><div class="acts2"><button class="b s" data-psave>Saqlash</button><button class="b g s" data-ppaid>${p.paid ? "To'lovni bekor qilish" : "To'langan deb belgilash"}</button><button class="b d s" data-pdel>O'chirish</button></div></div></div>`).join('') : '<div class="empty2">Hozircha loyiha yo\'q</div>';
      },
    },

    /* =============== MIJOZLAR =============== */
    users: {
      title: 'Mijozlar',
      async load() { st.users = await api('GET', '/api/admin/users'); },
      render() {
        pg.innerHTML = `<div class="bar2"><input type="search" id="uq" placeholder="Ism, telefon yoki email" value="${esc(st.uq)}"><span class="meta" style="color:var(--muted)">Jami: ${st.users.length}</span></div><div class="card" style="padding:6px 10px"><div id="ulist"></div></div>`;
        P.users.list();
      },
      list() {
        const q = st.uq.toLowerCase(), l = st.users.filter((u) => !q || `${u.name} ${u.phone} ${u.email}`.toLowerCase().includes(q));
        $('#ulist').innerHTML = l.length ? `<table class="tbl"><thead><tr><th>Ism</th><th>Telefon</th><th>Email</th><th>Ro'yxatdan o'tgan</th><th>Saytlar</th><th>Buyurtma</th><th></th></tr></thead><tbody>${l.map((u) => `<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.phone)}</td><td>${esc(u.email || '-')}</td><td>${esc(fdate(u.createdAt))}</td><td>${u.projects}</td><td>${u.orders}</td><td><button class="b g s" data-uopen="${esc(u.id)}">Ochish</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty2" style="border:0">Mijoz topilmadi</div>';
      },
    },

    /* =============== TELEGRAM BOTLAR =============== */
    bots: {
      title: 'Telegram botlar',
      async load() { st.bots = await api('GET', '/api/admin/bots'); },
      render() {
        const l = st.bots || [];
        pg.innerHTML = l.length ? `<div class="card" style="padding:6px 10px"><table class="tbl"><thead><tr><th>Bot</th><th>Egasi</th><th>Obunachi</th><th>Buyurtma</th><th>Holat</th><th>Yaratilgan</th><th></th></tr></thead><tbody>${l.map((b) => `<tr><td><b>${esc(b.name)}</b><div class="meta" style="color:var(--muted);font-size:12px">@${esc(b.username)}${b.miniApp ? ' · mini ilova' : ''}</div></td><td>${esc(b.owner || '-')}<div class="meta" style="color:var(--muted);font-size:12px">${esc(b.phone || '')}</div></td><td>${b.subscribers}</td><td>${b.orders}</td><td><span class="pill ${b.webhook ? 's-joylandi' : 's-yuborilgan'}">${b.webhook ? 'Ishlayapti' : 'Ulanmagan'}</span></td><td>${esc(fdate(b.createdAt))}</td><td><button class="b d s" data-bdel="${esc(b.id)}">O'chirish</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty2">Hali bot ulanmagan</div>';
      },
    },

    /* =============== NARXLAR =============== */
    prices: {
      title: 'Narxlar',
      async load() { [st.pricing, st.site] = await Promise.all([api('GET', '/api/admin/pricing'), api('GET', '/api/admin/site')]); },
      render() {
        const pr = st.pricing;
        const prod = [];
        (st.site.sections || []).forEach((s, si) => { if (['products', 'menu'].includes(s.type)) (s.items || []).forEach((p, pi) => prod.push({ s, si, p, pi })); });
        pg.innerHTML = `<div class="form1" style="max-width:980px"><div class="card"><h3>Saytdagi mahsulot va paketlar narxi</h3><p class="hint" style="margin:-6px 0 10px">Asosiy saytdagi mahsulot narxlarini shu yerda tez tuzating. «Saqlash» bosilgach sayt darrov yangilanadi.</p>${prod.length ? `<table class="tbl"><thead><tr><th>Nomi</th><th>Narx</th><th>Eski narx</th><th>Ombor</th><th>Ko'rinadi</th></tr></thead><tbody>${prod.map(({ s, p, si, pi }) => `<tr data-si="${si}" data-pi="${pi}"><td><b>${esc(p.name)}</b><div class="meta" style="color:var(--muted);font-size:12px">${esc(s.title || '')}${p.category ? ' · ' + esc(p.category) : ''}</div></td><td><input type="number" min="0" data-f="price" value="${esc(p.price)}" style="width:130px"></td><td><input type="number" min="0" data-f="oldPrice" value="${esc(p.oldPrice || 0)}" style="width:130px"></td><td><input type="number" min="0" data-f="stock" value="${p.stock === '' || p.stock == null ? '' : esc(p.stock)}" placeholder="cheksiz" style="width:100px"></td><td><label class="sw mini"><input type="checkbox" data-f="active" ${p.active !== false ? 'checked' : ''}><span class="tg"></span></label></td></tr>`).join('')}</tbody></table><div class="mx2" id="pm1"></div><button class="b" id="saveProd">Mahsulot narxlarini saqlash</button>` : '<div class="empty2">Saytda mahsulot yo\'q</div>'}</div>
          ${(st.site.sections || []).map((s, si) => (s.type === 'brief' ? `<div class="card"><h3>Buyurtma anketasi narxlari</h3><p class="hint" style="margin:-6px 0 10px">Mijoz anketada xizmat va imkoniyat tanlaganda «taxminiy narx» shu qiymatlardan hisoblanadi.</p><table class="tbl"><thead><tr><th>Xizmat</th><th>Boshlang'ich narx</th><th>Muddat</th></tr></thead><tbody>${(s.services || []).map((x, i) => `<tr data-bsi="${si}" data-bk="services" data-bix="${i}"><td><b>${esc(x.name)}</b></td><td><input type="number" min="0" data-bf="price" value="${esc(x.price || 0)}" style="width:140px"></td><td><input type="text" data-bf="days" value="${esc(x.days || '')}" style="width:130px" maxlength="30"></td></tr>`).join('')}</tbody></table><table class="tbl" style="margin-top:14px"><thead><tr><th>Qo'shimcha imkoniyat</th><th>Narxi</th></tr></thead><tbody>${(s.features || []).map((x, i) => `<tr data-bsi="${si}" data-bk="features" data-bix="${i}"><td><b>${esc(x.name)}</b></td><td><input type="number" min="0" data-bf="price" value="${esc(x.price || 0)}" style="width:140px"></td></tr>`).join('')}</tbody></table><div class="mx2" id="pm3"></div><button class="b" id="saveBrief">Anketa narxlarini saqlash</button></div>` : '')).join('')}
          <div class="card"><h3>Shablon narxi (tayyor saytni sotish)</h3><p class="hint" style="margin:-6px 0 10px">Mijoz shablonni sozlagandan keyin shu narxda sotib oladi: yuklab olish, subdomenda joylash va o'z domenini ulash ochiladi. To'lov Payme/Click orqali yoki qo'lda tasdiqlanadi.</p><div class="g2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label class="f" style="margin-top:0">Narx (AQSH dollari)</label><input type="number" id="tpusd" min="0" step="1" value="${esc((pr.templatePrice || {}).usd == null ? 10 : pr.templatePrice.usd)}"></div><div><label class="f" style="margin-top:0">Kurs (1 $ = necha so'm)</label><input type="number" id="tprate" min="1000" step="50" value="${esc((pr.templatePrice || {}).rate || 12800)}"></div></div></div>
          <div class="card"><h3>Konstruktor tariflari</h3><p class="hint" style="margin:-6px 0 10px">Mijoz saytini sizga topshirayotganda ko'radigan tariflar (joylash, domen, to'liq xizmat).</p>
          <div class="fx" style="margin-top:0"><label>Valyuta</label><input type="text" id="pcur" value="${esc(pr.currency || "so'm")}" maxlength="12" style="max-width:160px"></div><div id="plans">${pr.plans.map((p, i) => planHtml(p, i)).join('')}</div><button class="addb" id="addPlan">+ Tarif qo'shish</button><div class="mx2" id="pm2"></div><button class="b" id="savePlans">Tariflarni saqlash</button></div></div>`;
      },
    },

    /* =============== SAYT TAHRIRLAGICHI =============== */
    site: {
      title: 'Asosiy sayt',
      async load() { st.site = await api('GET', '/api/admin/site'); st.previewReady = false; st.siteDirty = false; },
      render() {
        pg.className = 'flush';
        $('#pa').innerHTML = '<span class="dirty" id="sst" hidden>● Saqlanmagan o\'zgarish bor</span><a class="b g s" href="/" target="_blank" rel="noopener">Saytni ochish ↗</a><button class="b" id="saveSite">Saqlash</button>';
        pg.innerHTML = `<div class="side" style="width:420px"><div class="tabs" id="etabs"></div><div class="panel" id="epanel"></div></div><div class="prev"><div class="fr" id="efr"><div class="fb"><i></i><i></i><i></i><s>Sayt ko'rinishi (jonli)</s></div><iframe class="pv" id="eif" src="/shablon.html?preview=1" title="Ko'rinish"></iframe></div></div>`;
        st.ed = window.Editor.create({
          root: $('#epanel'), tabsEl: $('#etabs'), data: () => st.site, account: true, startTab: 'sections', toast,
          onChange: () => { st.siteDirty = true; $('#sst').hidden = false; clearTimeout(st.pt); st.pt = setTimeout(sendPrev, 180); },
          upload: uploadImg, focus: (id) => { const f = $('#eif'); if (f && f.contentWindow) f.contentWindow.postMessage({ type: 'focus', id }, '*'); },
        });
        const ef = $('#eif'); ef.addEventListener('load', () => { st.previewReady = true; sendPrev(); });
        sendPrev();
      },
    },

    /* =============== SOZLAMALAR =============== */
    settings: {
      title: 'Sozlamalar',
      async load() { st.settings = await api('GET', '/api/admin/settings'); },
      render() {
        const s = st.settings;
        pg.innerHTML = `<div class="form1"><div class="card"><h3>Telegram xabarnoma</h3><p class="hint" style="margin:-6px 0 4px">Yangi buyurtma, ariza, sayt so'rovi va yangi mijoz haqida Telegramga xabar keladi. @BotFather orqali bot yarating.</p><div class="fx"><label>Bot tokeni</label><input type="text" id="tgt" value="${esc((s.notify || {}).telegramBotToken || '')}" maxlength="120"></div><div class="fx"><label>Chat ID</label><input type="text" id="tgc" value="${esc((s.notify || {}).telegramChatId || '')}" maxlength="40"></div></div>
          <div class="card"><h3>Boshqa domenlardagi saytlar</h3><p class="hint" style="margin:-6px 0 4px">Sayt boshqa joyda (masalan, GitHub Pages) turgan bo'lsa, uning manzilini shu yerga yozing (har qatorga bittadan). Shunda o'sha sayt hisob va buyurtmalar uchun shu serverdan foydalanadi.</p><textarea id="ao" rows="3" placeholder="https://improuzbekiston.uz">${esc((s.allowedOrigins || []).join('\n'))}</textarea>${s.envAllowed ? `<div class="hint">Muhit sozlamasidan: ${esc(s.envAllowed)}</div>` : ''}<div class="fx"><label>Statik saytdagi config.js shunday bo'lsin:</label><div class="code">window.__API__ = '${esc(location.origin)}';</div></div></div>
          <div class="card"><h3>Telegram admin bot va mini ilova</h3><p class="hint" style="margin:-6px 0 4px">Admin panelni Telegramdan boshqaring: buyurtmalar tugmalar bilan keladi, holatni o'zgartirasiz, to'lovni tasdiqlaysiz, <b>Admin panel</b> mini ilovasi telefonda ochiladi. Yuqoridagi bot tokeni ishlatiladi. Token serverda <code>TELEGRAM_BOT_TOKEN</code> sifatida ham berilishi mumkin; HTTPS domen bo'lsa bot server ishga tushganda o'zi ulanadi.</p>
            <div class="chk ${(s.adminBot || {}).connected ? 'ok' : 'w'}" style="display:flex;gap:8px;font-size:13px"><span>${(s.adminBot || {}).connected ? '✓' : '!'}</span><span>${(s.adminBot || {}).connected ? 'Bot ulangan. Telegramda botingizni oching va <b>/login PAROL</b> yozing (xabar darrov o\'chiriladi).' : (s.adminBot || {}).hasToken ? 'Token bor, lekin bot hali ulanmagan. «Botni ulash» ni bosing.' : 'Avval yuqorida bot tokenini kiriting va saqlang.'}</span></div>
            ${((s.adminBot || {}).chats || []).length ? `<div style="margin-top:8px">${s.adminBot.chats.map((c) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line)"><span><b>${esc(c.name || c.id)}</b> <span class="meta" style="color:var(--muted);font-size:12px">${esc(fdate(c.at))}</span></span><button class="b d s" data-abrev="${esc(c.id)}">Uzish</button></div>`).join('')}</div>` : ''}
            <div style="margin-top:10px"><button class="b" id="abConnect" ${(s.adminBot || {}).hasToken ? '' : 'disabled'}>Botni ulash</button></div><div class="mx2" id="abm"></div></div>
          <div class="card"><h3>Domen va joylash</h3><p class="hint" style="margin:-6px 0 4px">Mijozlar saytlari <b>nomi.sizning-domeningiz</b> manzilida chiqadi. Domenni shu yerga yozing (har qatorga bittadan) va DNS'da <b>*</b> (yulduzcha) A yozuvini server IP'siga yo'naltiring.${s.envDomain ? ` Muhit sozlamasidan: <b>${esc(s.envDomain)}</b>` : ''}</p><textarea id="sdom" rows="2" placeholder="improuzbekiston.uz">${esc((s.domains || []).join('\n'))}</textarea><div class="fx"><label>Qo'lda to'lov uchun ko'rsatma (karta raqami, Telegram...)</label><textarea id="smp" rows="2" maxlength="600" placeholder="Karta: 8600 ... (Ism Familiya). To'lovdan keyin chekni Telegramga yuboring.">${esc(s.manualPay || '')}</textarea></div></div>
          <div class="card"><h3>Onlayn to'lov: Payme</h3><p class="hint" style="margin:-6px 0 4px">merchant.paycom.uz da kassa oching. «Endpoint URL» ga quyidagini yozing: <b>${esc((s.webhooks || {}).payme || '')}</b> (to'lov hisobi maydoni: <b>order_id</b>).</p><div class="fx"><label>Merchant ID</label><input type="text" id="pmid" value="${esc(s.payments.payme.merchantId)}"></div><div class="fx"><label>Kalit (KEY)</label><input type="password" id="pmkey" autocomplete="new-password" placeholder="${s.payments.payme.hasKey ? '•••••• saqlangan (o\'zgartirish uchun yangisini yozing)' : 'Kalit'}"></div></div>
          <div class="card"><h3>Onlayn to'lov: Click</h3><p class="hint" style="margin:-6px 0 4px">merchant.click.uz da xizmat oching. Prepare va Complete URL: <b>${esc((s.webhooks || {}).click || '')}</b></p><div class="fx"><label>Service ID</label><input type="text" id="ckser" value="${esc(s.payments.click.serviceId)}"></div><div class="fx"><label>Merchant ID</label><input type="text" id="ckmer" value="${esc(s.payments.click.merchantId)}"></div><div class="fx"><label>Secret key</label><input type="password" id="cksec" autocomplete="new-password" placeholder="${s.payments.click.hasSecret ? '•••••• saqlangan (o\'zgartirish uchun yangisini yozing)' : 'Secret key'}"></div></div>
          <div class="card"><h3>AI yordamchi (Claude)</h3><p class="hint" style="margin:-6px 0 4px">Mijoz biznesini yozsa, tizim mos shablonni tanlab matnlarni o'zi yozadi. Kalit <b>console.anthropic.com</b> dan olinadi. Kalitsiz ham ishlaydi (faqat shablon tanlaydi).</p><div class="fx"><label>Claude API kaliti ${s.ai.hasKey ? '(saqlangan)' : ''}</label><input type="password" id="aikey" autocomplete="new-password" placeholder="${s.ai.hasKey ? '•••••• saqlangan' : 'sk-ant-...'}"></div><div class="fx"><label>Model (ixtiyoriy)</label><input type="text" id="aimodel" value="${esc(s.ai.model || '')}" placeholder="claude-sonnet-5-5"></div></div>
          <div class="mx2" id="sm"></div><button class="b" id="saveSet">Sozlamalarni saqlash</button>
          <div class="card" style="margin-top:18px"><h3>Admin parolini o'zgartirish</h3><div class="fx" style="margin-top:0"><label>Yangi parol</label><input type="password" id="np" placeholder="Kamida 6 belgi" autocomplete="new-password"></div><div class="mx2" id="pwm"></div><button class="b g" id="savePw">Parolni yangilash</button></div>
          <div class="card"><h3>Ma'lumotlar</h3><p class="hint" style="margin:0">Barcha ma'lumot (mijozlar, buyurtmalar, saytlar, rasmlar) serverdagi <b>data</b> papkasida saqlanadi. Uni muntazam zaxiralab turing.</p></div></div>`;
      },
    },
  };
  const planHtml = (p, i) => `<div class="plan3" data-i="${i}"><div class="g2"><div><label class="f" style="margin-top:0">Nomi</label><input type="text" data-pf2="name" value="${esc(p.name)}" maxlength="60"></div><div><label class="f" style="margin-top:0">Narx</label><input type="text" data-pf2="price" value="${esc(p.price)}" maxlength="40" placeholder="250 000 yoki Bepul"></div><div><label class="f" style="margin-top:0">Davr</label><input type="text" data-pf2="period" value="${esc(p.period || '')}" maxlength="40" placeholder="bir martalik"></div></div><label class="f">Nimalar kiradi (har qatorga bittadan)</label><textarea data-pf2="features" rows="3">${esc((p.features || []).join('\n'))}</textarea><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><label class="sw mini" style="gap:8px"><input type="checkbox" data-pf2="popular" ${p.popular ? 'checked' : ''}><span class="tg"></span><span style="font-weight:600;font-size:13px">Tavsiya etiladi</span></label><div class="acts"><button data-plan-up="${i}" ${i === 0 ? 'disabled' : ''}>↑</button><button data-plan-dn="${i}">↓</button><button class="x" data-plan-del="${i}">✕</button></div></div></div>`;

  /* ---------- Sayt tahrirlagichi: ko'rinish va rasm ---------- */
  function sendPrev() { const f = $('#eif'); if (st.previewReady && f && f.contentWindow) f.contentWindow.postMessage({ type: 'site', data: st.site }, '*'); }
  addEventListener('message', (e) => { const f = $('#eif'); if (f && e.source === f.contentWindow && e.data && e.data.type === 'ready') { st.previewReady = true; sendPrev(); } });
  function uploadImg(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return reject(new Error('Faqat PNG, JPG, WEBP yoki GIF rasm'));
      const rd = new FileReader(); rd.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
      rd.onload = () => {
        const send = (data) => api('POST', '/api/admin/upload', { data }).then((j) => resolve(j.url)).catch(reject);
        if (file.type === 'image/gif') return file.size > 4.5e6 ? reject(new Error('GIF 4 MB dan oshmasin')) : send(rd.result);
        const img = new Image(); img.onerror = () => reject(new Error('Rasm ochilmadi'));
        img.onload = () => { const k = Math.min(1, 1600 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); send(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.86)); };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }
  addEventListener('beforeunload', (e) => { if (st.siteDirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Mijoz saytini ko'rish / yuklab olish ---------- */
  async function projData(id) { const j = await api('GET', '/api/admin/projects/' + id); return j; }
  async function inline(data) {
    const urls = new Set(); (function walk(o) { if (typeof o === 'string') { if (/^\/img\/.+\.svg$/.test(o)) urls.add(o); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); })(data);
    const map = {}; await Promise.all([...urls].map(async (u) => { try { const r = await fetch(u); if (r.ok) map[u] = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(await r.text()))); } catch { /* ignore */ } }));
    return JSON.parse(JSON.stringify(data, (k, v) => (typeof v === 'string' && map[v] ? map[v] : v)));
  }
  function saveFile(name, text, type) { const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
  const slug = (n) => (String(n || 'sayt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sayt');
  async function viewProject(id) {
    const j = await projData(id); if (!j.data) return toast("Loyiha ma'lumoti topilmadi");
    const w = document.createElement('div'); w.className = 'modalx';
    w.innerHTML = `<div class="mx wide"><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--line)"><b>${esc(j.project.name)}</b><button class="b g s" data-close>Yopish</button></div><iframe sandbox="allow-scripts" src="/shablon.html?preview=1" style="flex:1;border:0;width:100%" title="Ko'rish"></iframe></div>`;
    document.body.appendChild(w);
    const f = w.querySelector('iframe'), onmsg = (e) => { if (e.source === f.contentWindow && e.data && e.data.type === 'ready') f.contentWindow.postMessage({ type: 'site', data: j.data }, '*'); };
    addEventListener('message', onmsg); f.addEventListener('load', () => f.contentWindow.postMessage({ type: 'site', data: j.data }, '*'));
    w.addEventListener('click', (e) => { if (e.target === w || e.target.closest('[data-close]')) { removeEventListener('message', onmsg); w.remove(); } });
  }
  async function downloadProject(id) {
    const j = await projData(id); if (!j.data) return toast("Loyiha ma'lumoti topilmadi");
    const r = await fetch('/shablon.html', { cache: 'no-store' }), tpl = await r.text(), MARK = '/*__DATA__*/null';
    const d = await inline(j.data); d.account = { enabled: false };
    saveFile(slug(j.project.name) + '.html', tpl.replace(MARK, () => JSON.stringify(d).replace(/</g, '\\u003c')), 'text/html'); toast('Yuklab olindi');
  }
  async function userModal(id) {
    const j = await api('GET', '/api/admin/users/' + id), u = j.user;
    const w = document.createElement('div'); w.className = 'modalx';
    w.innerHTML = `<div class="mx" style="width:min(720px,100%)"><div style="display:flex;justify-content:space-between;gap:10px"><div><h3>${esc(u.name)}</h3><p>${esc(u.phone)}${u.email ? ' · ' + esc(u.email) : ''}<br>Ro'yxatdan o'tgan: ${esc(fdate(u.createdAt))}</p></div><button class="b g s" data-close style="align-self:flex-start">Yopish</button></div>
      <h4>Saytlari (${j.projects.length})</h4>${j.projects.map((p) => `<div class="rowc"><b>${esc(p.name)}</b> <span class="pill s-${esc(p.status)}">${esc(PS[p.status] || p.status)}</span><div class="meta">${esc(TPL[p.template] || p.template || '')} · ${esc(fdate(p.updatedAt))}</div></div>`).join('') || '<p class="hint">Yo\'q</p>'}
      <h4>Buyurtmalari (${j.orders.length})</h4>${j.orders.map((o) => `<div class="rowc"><b>#${esc(o.id)}</b> <span class="pill s-${esc(o.status)}">${esc(OS[o.status] || o.status)}</span> ${o.total ? sum(o.total) + " so'm" : ''}<div class="meta">${esc(fdate(o.date))} · ${(o.items || []).map((i) => esc(i.name) + ' × ' + i.qty).join(', ')}</div></div>`).join('') || '<p class="hint">Yo\'q</p>'}
      <div style="margin-top:16px"><button class="b d s" data-udel="${esc(u.id)}">Hisobni o'chirish</button></div></div>`;
    document.body.appendChild(w);
    w.addEventListener('click', async (e) => {
      if (e.target === w || e.target.closest('[data-close]')) w.remove();
      const d = e.target.closest('[data-udel]'); if (d && confirm("Hisob va uning barcha saytlari o'chiriladi. Davom etasizmi?")) { try { await api('DELETE', '/api/admin/users/' + d.dataset.udel); w.remove(); toast("O'chirildi"); go('users'); } catch (er) { toast(er.message); } }
    });
  }

  /* ---------- Hodisalar ---------- */
  pg.addEventListener('click', async (e) => {
    const t = e.target.closest('button,a'); if (!t) return;
    const ar = e.target.closest('[data-abrev]'); if (ar && confirm('Bu qurilma admin botdan uziladi. Davom etasizmi?')) { try { const j = await api('POST', '/api/admin/adminbot/revoke', { id: ar.dataset.abrev }); st.settings.adminBot = j.status; P.settings.render(); toast('Uzildi'); } catch (er) { toast(er.message); } return; }
    if (e.target.closest('#abConnect')) { const m = $('#abm'); m.className = 'mx2'; m.textContent = 'Ulanmoqda…'; try { const j = await api('POST', '/api/admin/adminbot/connect', {}); st.settings.adminBot = j.status; P.settings.render(); toast('Bot ulandi'); } catch (er) { m.className = 'mx2 bad'; m.textContent = er.message; } return; }
    const bd = e.target.closest('[data-bdel]'); if (bd && confirm("Bot platformadan o'chiriladi (webhook uziladi). Davom etasizmi?")) { try { await api('DELETE', '/api/admin/bots/' + bd.dataset.bdel); st.bots = st.bots.filter((b) => b.id !== bd.dataset.bdel); P.bots.render(); toast("O'chirildi"); } catch (er) { toast(er.message); } return; }
    try {
      if (t.dataset.go2) return go(t.dataset.go2);
      if (t.dataset.of !== undefined) { st.of.s = t.dataset.of; return P.orders.render(); }
      if (t.dataset.ot !== undefined) { st.of.t = t.dataset.ot; return P.orders.render(); }
      if (t.dataset.pf !== undefined) { st.pf.s = t.dataset.pf; return P.projects.render(); }
      if (t.dataset.uopen) return userModal(t.dataset.uopen);
      const oc = t.closest('[data-oid]'), pc = t.closest('[data-pid]');
      if (t.hasAttribute('data-odel') && oc && confirm("Buyurtma o'chirilsinmi?")) { await api('DELETE', '/api/admin/orders?id=' + encodeURIComponent(oc.dataset.oid)); st.orders = st.orders.filter((o) => o.id !== oc.dataset.oid); P.orders.render(); toast("O'chirildi"); refreshStats(); return; }
      if (pc) {
        const id = pc.dataset.pid;
        if (t.hasAttribute('data-pview')) return viewProject(id);
        if (t.hasAttribute('data-pdl')) return downloadProject(id);
        if (t.hasAttribute('data-pjson')) { const j = await projData(id); return saveFile(slug(j.project.name) + '-loyiha.json', JSON.stringify(await inline(j.data), null, 2), 'application/json'); }
        if (t.hasAttribute('data-pdel') && confirm("Loyiha o'chirilsinmi? Qaytarib bo'lmaydi.")) { await api('DELETE', '/api/admin/projects/' + id); st.projects = st.projects.filter((p) => p.id !== id); P.projects.render(); toast("O'chirildi"); refreshStats(); return; }
        if (t.hasAttribute('data-ppaid')) { const cur = st.projects.find((p) => p.id === id); if (!confirm(cur && cur.paid ? "To'lov bekor qilinsinmi? Sayt joylashdan chiqariladi." : "Mijoz to'lovni amalga oshirganini tasdiqlaysizmi? Unga sayt yuklab olish va joylash ochiladi.")) return; const j = await api('PUT', '/api/admin/projects/' + id, { paid: !(cur && cur.paid) }); const i = st.projects.findIndex((p) => p.id === id); if (i >= 0) st.projects[i] = Object.assign({}, st.projects[i], j.project); P.projects.list(); toast('Saqlandi'); return; }
        if (t.hasAttribute('data-psave')) { const j = await api('PUT', '/api/admin/projects/' + id, { status: $('[data-pst]', pc).value, price: $('[data-ppr]', pc).value, adminNote: $('[data-pnote]', pc).value }); const i = st.projects.findIndex((p) => p.id === id); st.projects[i] = { ...st.projects[i], ...j.project }; toast('Saqlandi'); P.projects.render(); refreshStats(); return; }
      }
      if (t.id === 'saveProd') {
        const site = st.site; $$('tr[data-si]').forEach((tr) => { const it = site.sections[+tr.dataset.si].items[+tr.dataset.pi]; $$('[data-f]', tr).forEach((inp) => { const k = inp.dataset.f; if (k === 'active') it.active = inp.checked; else if (k === 'stock') it.stock = inp.value === '' ? '' : Math.max(0, Number(inp.value)); else it[k] = Math.max(0, Number(inp.value) || 0); }); });
        await api('PUT', '/api/admin/site', site); const m = $('#pm1'); m.className = 'mx2 okk'; m.textContent = 'Narxlar saqlandi, sayt yangilandi'; toast('Saqlandi'); return;
      }
      if (t.id === 'saveBrief') {
        $$('tr[data-bsi]').forEach((tr) => { const it = st.site.sections[+tr.dataset.bsi][tr.dataset.bk][+tr.dataset.bix]; $$('[data-bf]', tr).forEach((inp) => { const k = inp.dataset.bf; it[k] = k === 'price' ? Math.max(0, Number(inp.value) || 0) : inp.value; }); });
        await api('PUT', '/api/admin/site', st.site); const m = $('#pm3'); m.className = 'mx2 okk'; m.textContent = 'Anketa narxlari saqlandi'; toast('Saqlandi'); return;
      }
      if (t.id === 'addPlan') { st.pricing.plans.push({ id: '', name: 'Yangi tarif', price: '', period: '', popular: false, features: [] }); return P.prices.render(); }
      if (t.hasAttribute('data-plan-del')) { st.pricing.plans.splice(+t.dataset.planDel, 1); return P.prices.render(); }
      if (t.hasAttribute('data-plan-up') || t.hasAttribute('data-plan-dn')) { const i = +(t.dataset.planUp ?? t.dataset.planDn), j = t.hasAttribute('data-plan-up') ? i - 1 : i + 1, a = st.pricing.plans; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; return P.prices.render(); }
      if (t.id === 'savePlans') { st.pricing.currency = $('#pcur').value; st.pricing.templatePrice = { usd: Number($('#tpusd').value), rate: Number($('#tprate').value) }; await api('PUT', '/api/admin/pricing', st.pricing); st.pricing = await api('GET', '/api/admin/pricing'); const m = $('#pm2'); m.className = 'mx2 okk'; m.textContent = 'Tariflar saqlandi'; toast('Saqlandi'); return; }
      if (t.id === 'saveSet') { const m = $('#sm'); try { await api('PUT', '/api/admin/settings', { notify: { telegramBotToken: $('#tgt').value, telegramChatId: $('#tgc').value }, allowedOrigins: $('#ao').value.split('\n').map((x) => x.trim()).filter(Boolean), domains: $('#sdom').value.split('\n').map((x) => x.trim()).filter(Boolean), manualPay: $('#smp').value, ai: { key: $('#aikey').value, model: $('#aimodel').value }, payments: { payme: { merchantId: $('#pmid').value, key: $('#pmkey').value }, click: { serviceId: $('#ckser').value, merchantId: $('#ckmer').value, secretKey: $('#cksec').value } } }); st.settings = await api('GET', '/api/admin/settings'); P.settings.render(); m.className = 'mx2 okk'; m.textContent = 'Saqlandi'; toast('Saqlandi'); } catch (er) { m.className = 'mx2 bad'; m.textContent = er.message; } return; }
      if (t.id === 'savePw') { const m = $('#pwm'); try { await api('POST', '/api/admin/password', { password: $('#np').value }); m.className = 'mx2 okk'; m.textContent = "Parol o'zgartirildi"; $('#np').value = ''; } catch (er) { m.className = 'mx2 bad'; m.textContent = er.message; } return; }
    } catch (er) { toast(er.message); }
  });
  $('#pa').addEventListener('click', async (e) => {
    if (e.target.id === 'saveSite') { try { await api('PUT', '/api/admin/site', st.site); st.siteDirty = false; $('#sst').hidden = true; toast('Sayt saqlandi'); } catch (er) { toast(er.message); } }
  });
  pg.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'oq') { st.of.q = t.value; P.orders.list(); } if (t.id === 'pq') { st.pf.q = t.value; P.projects.list(); } if (t.id === 'uq') { st.uq = t.value; P.users.list(); }
    const pl = t.closest('.plan3'); if (pl && t.dataset.pf2) { const p = st.pricing.plans[+pl.dataset.i], k = t.dataset.pf2; p[k] = k === 'popular' ? t.checked : k === 'features' ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value; }
  });
  pg.addEventListener('change', async (e) => {
    const t = e.target, oc = t.closest('[data-oid]');
    if (oc && t.hasAttribute('data-ost')) { try { await api('PUT', '/api/admin/orders', { id: oc.dataset.oid, status: t.value }); const o = st.orders.find((x) => x.id === oc.dataset.oid); o.status = t.value; toast('Holat yangilandi'); P.orders.render(); refreshStats(); } catch (er) { toast(er.message); } }
    if (oc && t.hasAttribute('data-onote')) { try { await api('PUT', '/api/admin/orders', { id: oc.dataset.oid, note: t.value }); st.orders.find((x) => x.id === oc.dataset.oid).note = t.value; toast('Izoh saqlandi'); } catch (er) { toast(er.message); } }
  });

  async function start() { $('#app').hidden = false; await refreshStats(); await go(st.page); setInterval(refreshStats, 60000); }
  const tgApp = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData ? window.Telegram.WebApp : null;
  if (tgApp) { try { tgApp.ready(); tgApp.expand(); document.documentElement.classList.add('tgapp'); } catch (e) { /* ignore */ } }
  api('GET', '/api/admin/stats').then(() => start()).catch(async () => {
    if (!tgApp) return showLogin();
    try { await fetch(API + '/api/adminbot/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData: tgApp.initData }) }).then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Kirish rad etildi'); if (j.token) tokSet(j.token); }); $('#login').hidden = true; await start(); }
    catch (er) { showLogin(); $('#le').textContent = er.message + '. Yoki parolni kiriting.'; }
  });
})();
