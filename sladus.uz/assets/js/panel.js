/* ============================================================
   Sladus — boshqaruv paneli
   Supabase bilan ishlaydi. Yozish faqat tizimga kirgan
   administratorga ruxsat etilgan (RLS + admins jadvali).
   ============================================================ */
(function () {
  'use strict';

  var C = window.SLADUS_CONFIG || {};
  var ready = C.url && C.url.indexOf('XXXX') === -1 && C.key && C.key.indexOf('XXXX') === -1;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var sb = ready ? window.supabase.createClient(C.url, C.key, {
    auth: { persistSession: true, autoRefreshToken: true }
  }) : null;

  var P = [], K = [], M = [];
  var COLORS = [
    { id: 'brand', name: 'Malina' }, { id: 'gold', name: 'Oltin' },
    { id: 'mint', name: 'Pista' }, { id: 'amber', name: 'Anbar' }
  ];

  function toast(msg, bad) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('bad', !!bad);
    t.classList.add('on');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('on'); }, 2900);
  }
  function ok(r) { if (r.error) throw new Error(r.error.message); return r.data; }
  function catOf(id) { for (var i = 0; i < K.length; i++) if (K[i].id === id) return K[i]; return null; }
  function catName(id) { var c = catOf(id); return c ? (c.name && (c.name.uz || c.name.ru)) || c.id : '—'; }
  function catColor(id) { var c = catOf(id); return 'c-' + ((c && c.color) || 'brand'); }
  var slug = function (s) {
    return String(s).toLowerCase().replace(/[‘’']/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  /* ---------- mahalliy kirish (Supabase ulanmagan holat uchun) ----------
     admin-56a7e0dcc2af.html bilan bir xil standart login/parol. */
  var DEFAULT_USER = 'Ibrohim', DEFAULT_PASS = 'ibrohim123';
  var LS_USER = 'sladus_panel_user', LS_PASS = 'sladus_panel_pass';
  var LS_FAILS = 'sladus_panel_fails', LS_LOCK_UNTIL = 'sladus_panel_lock_until';
  var SESSION_KEY = 'sladus_panel_session';
  function currentUser() { return localStorage.getItem(LS_USER) || DEFAULT_USER; }
  function currentPass() { return localStorage.getItem(LS_PASS) || DEFAULT_PASS; }
  function usingDefaultPass() { return !localStorage.getItem(LS_PASS); }
  function getFails() { return parseInt(localStorage.getItem(LS_FAILS) || '0', 10) || 0; }
  function setFails(n) { localStorage.setItem(LS_FAILS, String(n)); }
  function lockUntil() { return parseInt(localStorage.getItem(LS_LOCK_UNTIL) || '0', 10) || 0; }
  function isLocked() { return Date.now() < lockUntil(); }
  function lockRemainingSec() { return Math.max(0, Math.ceil((lockUntil() - Date.now()) / 1000)); }
  function registerFail() {
    var n = getFails() + 1;
    if (n >= 5) { localStorage.setItem(LS_LOCK_UNTIL, String(Date.now() + 60000)); setFails(0); }
    else setFails(n);
  }
  function tryLocalLogin(u, p) {
    if (u === currentUser() && p === currentPass()) { setFails(0); return true; }
    registerFail();
    return false;
  }
  function isLocalLoggedIn() { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } }
  function localLogin() { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* xotira yo'q */ } }
  function localLogout() { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* xotira yo'q */ } }

  /* ---------- kirish ---------- */
  $('#authForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var err = $('#authErr'), btn = $('button[type=submit]', ev.target);
    err.classList.remove('on');

    if (!ready) {
      if (isLocked()) {
        err.textContent = 'Ko‘p noto‘g‘ri urinish. ' + lockRemainingSec() + ' soniyadan keyin qayta urining.';
        err.classList.add('on');
        return;
      }
      if (tryLocalLogin($('#em').value.trim(), $('#pw').value)) {
        localLogin();
        $('#auth').hidden = true;
        enterLocalMode();
      } else {
        err.textContent = 'Login yoki parol noto‘g‘ri.';
        err.classList.add('on');
      }
      return;
    }

    btn.disabled = true;
    sb.auth.signInWithPassword({ email: $('#em').value.trim(), password: $('#pw').value })
      .then(function (r) {
        btn.disabled = false;
        if (r.error) {
          err.textContent = r.error.message === 'Invalid login credentials'
            ? 'Email yoki parol noto‘g‘ri.' : r.error.message;
          err.classList.add('on');
          return;
        }
        $('#auth').hidden = true;
        enter(r.data.session);
      });
  });

  $('#out').addEventListener('click', function (ev) {
    ev.preventDefault();
    if (!ready) { localLogout(); location.reload(); return; }
    sb.auth.signOut().then(function () { location.reload(); });
  });

  function enter(session) {
    $('#shell').hidden = false;
    $('#who').textContent = session.user.email;
    $('#curl').textContent = location.pathname.replace(/^\//, '');
    reload();
    initTexts();
  }

  /* Supabase sozlanmagan bo'lsa — login admin-56a7e0dcc2af.html bilan bir xil
     (mahalliy, shu brauzerda). Faqat «Matnlar» va «Sozlamalar» ishlaydi,
     boshqa bo'limlar (Mahsulotlar, Yo'nalishlar, So'rovlar) Supabase talab qiladi. */
  function enterLocalMode() {
    $('#shell').hidden = false;
    $('#who').textContent = currentUser() + ' (mahalliy)';
    $('#curl').textContent = location.pathname.replace(/^\//, '');
    $$('#rail button').forEach(function (b) {
      var active = b.dataset.v === 'texts', allowed = active || b.dataset.v === 'set';
      b.setAttribute('aria-current', String(active));
      if (!allowed) { b.disabled = true; b.title = 'Bu bo‘lim uchun Supabase ulanishi kerak (config.js)'; }
    });
    $$('.pane-view').forEach(function (v) { v.classList.toggle('on', v.id === 'v-texts'); });
    initTexts();
    renderLocalSecurityNotice();
  }

  function renderLocalSecurityNotice() {
    var w = $('#defPassWarn');
    if (usingDefaultPass()) {
      w.textContent = '⚠ Standart parol hali o‘zgartirilmagan (login: ' + DEFAULT_USER + ', parol: ' + DEFAULT_PASS +
        '). Buni pastdagi «Parolni almashtirish» orqali albatta o‘zgartiring.';
      w.classList.add('on');
    } else {
      w.classList.remove('on'); w.textContent = '';
    }
    $('#pwuWrap').hidden = false;
    $('#pwu').value = currentUser();
  }

  function reload() {
    return Promise.all([
      sb.from('products').select('*').order('sort').order('name'),
      sb.from('categories').select('*').order('sort'),
      sb.from('messages').select('*').order('created_at', { ascending: false })
    ]).then(function (r) {
      P = ok(r[0]) || []; K = ok(r[1]) || []; M = ok(r[2]) || [];
      drawDash(); drawFilter(); drawItems(); drawCats(); drawMsgs();
    }).catch(function (e) { toast('Yuklanmadi: ' + e.message, true); });
  }

  /* ---------- navigatsiya ---------- */
  $$('#rail button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#rail button').forEach(function (x) { x.setAttribute('aria-current', String(x === b)); });
      $$('.pane-view').forEach(function (v) { v.classList.toggle('on', v.id === 'v-' + b.dataset.v); });
      window.scrollTo({ top: 0 });
    });
  });
  function go(v) { var b = $('#rail [data-v="' + v + '"]'); if (b) b.click(); }

  /* ---------- boshqaruv ---------- */
  function drawDash() {
    var unread = M.filter(function (m) { return !m.is_read; }).length;
    var hidden = P.filter(function (p) { return p.active === false; }).length;

    $('#kpis').innerHTML =
      kpi('c-brand', P.length, 'jami mahsulot') +
      kpi('c-gold', K.length, 'yo‘nalish') +
      kpi('c-mint', M.length, 'so‘rov') +
      kpi('c-amber', hidden, 'yashirilgan');
    function kpi(c, n, l) { return '<div class="kpi ' + c + '"><b>' + n + '</b><span>' + l + '</span></div>'; }

    var u = $('#unread');
    u.hidden = !unread;
    u.textContent = unread;

    $('#split').innerHTML = K.length ? K.map(function (c) {
      var n = P.filter(function (p) { return p.cat === c.id; }).length;
      var pct = P.length ? Math.round(n / P.length * 100) : 0;
      return '<div class="c-' + esc(c.color || 'brand') + '" style="margin-bottom:.9rem">' +
        '<div style="display:flex;justify-content:space-between;font-size:var(--t-sm);margin-bottom:.35rem">' +
        '<span class="dot">' + esc(catName(c.id)) + '</span><b>' + n + '</b></div>' +
        '<div style="height:8px;border-radius:99px;background:var(--shell-2);overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:var(--c);border-radius:99px"></div></div></div>';
    }).join('') : '<div class="nothing"><b>Yo‘nalish yo‘q</b><p>Avval yo‘nalish qo‘shing.</p></div>';

    $('#recent').innerHTML = M.length ? M.slice(0, 4).map(function (m) {
      return '<div class="msg' + (m.is_read ? '' : ' new') + '"><div class="msg__h"><b>' + esc(m.name) + '</b>' +
        '<span style="font-size:var(--t-xs);color:var(--mute)">' + new Date(m.created_at).toLocaleString() + '</span></div>' +
        '<div class="msg__m">' + (m.phone ? '<a href="tel:' + esc(m.phone) + '">' + esc(m.phone) + '</a>' : '') +
        (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' : '') + '</div></div>';
    }).join('') : '<div class="nothing"><b>So‘rov yo‘q</b><p>Saytdagi formadan kelgan murojaatlar shu yerda ko‘rinadi.</p></div>';
  }

  /* ---------- mahsulotlar ---------- */
  function drawFilter() {
    $('#cf').innerHTML = '<option value="">Barcha yo‘nalishlar</option>' +
      K.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(catName(c.id)) + '</option>'; }).join('');
  }

  function drawItems() {
    var s = $('#q').value.trim().toLowerCase(), cf = $('#cf').value;
    var list = P.filter(function (p) {
      return (!cf || p.cat === cf) &&
        (!s || (p.name + ' ' + (p.code || '') + ' ' + ((p.descr && p.descr.ru) || '')).toLowerCase().indexOf(s) > -1);
    });
    $('#icount').textContent = 'Jami ' + P.length + ' ta, ko‘rsatilmoqda ' + list.length + ' ta';

    $('#rows').innerHTML = list.length ? list.map(function (p) {
      return '<tr class="' + catColor(p.cat) + '">' +
        '<td><img class="th" src="' + esc(p.img) + '" alt="" loading="lazy"></td>' +
        '<td class="nm"><b>' + esc(p.name) + '</b><span>' + esc((p.descr && (p.descr.uz || p.descr.ru)) || '') + '</span></td>' +
        '<td><span class="dot">' + esc(catName(p.cat)) + '</span></td>' +
        '<td class="num">' + esc((p.pack && p.pack.net) || '') + '</td>' +
        '<td class="num">' + esc((p.nutrition && p.nutrition.kcal) || '') + '</td>' +
        '<td>' + (p.active === false ? '<span class="pillbadge pillbadge--off">Yashirin</span>' : '<span class="pillbadge pillbadge--on">Faol</span>') + '</td>' +
        '<td><div class="acts">' +
          ib('e', p.id, 'Tahrirlash', '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>') +
          ib('c', p.id, 'Nusxa olish', '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>') +
          ib('d', p.id, 'O‘chirish', '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', 'ib--x') +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="7"><div class="nothing"><b>Hech narsa topilmadi</b><p>Boshqa so‘z bilan qidiring yoki filtrni tozalang.</p></div></td></tr>';

    function ib(a, id, title, path, cls) {
      return '<button class="ib ' + (cls || '') + '" data-' + a + '="' + esc(id) + '" title="' + title + '" aria-label="' + title + '">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + path + '</svg></button>';
    }

    $$('[data-e]').forEach(function (b) {
      b.onclick = function () { openItem(find(b.dataset.e)); };
    });
    $$('[data-c]').forEach(function (b) {
      b.onclick = function () {
        var src = find(b.dataset.c), cp = JSON.parse(JSON.stringify(src));
        cp.id = ''; cp.name = src.name + ' 2';
        openItem(cp, true);
      };
    });
    $$('[data-d]').forEach(function (b) {
      b.onclick = function () {
        var p = find(b.dataset.d);
        if (!confirm('«' + p.name + '» butunlay o‘chirilsinmi?\n\nAgar vaqtincha yashirmoqchi bo‘lsangiz, tahrirlashda «Yashirilgan» ni tanlang.')) return;
        sb.from('products').delete().eq('id', p.id).then(function (r) {
          if (r.error) return toast(r.error.message, true);
          toast('O‘chirildi'); reload();
        });
      };
    });
    function find(id) { return P.filter(function (x) { return x.id === id; })[0]; }
  }

  $('#q').addEventListener('input', drawItems);
  $('#cf').addEventListener('change', drawItems);

  /* ---------- forma qurish ---------- */
  function ml(label, key, val, area) {
    var v = val || {}, uid = key.replace(/\./g, '_');
    function tag(l) {
      return area ? '<textarea name="' + key + '.' + l + '" rows="4">' + esc(v[l] || '') + '</textarea>'
                  : '<input name="' + key + '.' + l + '" value="' + esc(v[l] || '') + '">';
    }
    return '<div class="fld"><label>' + esc(label) + '</label>' +
      '<div class="tabs" data-tabs="' + uid + '">' +
        '<button type="button" data-t="uz" aria-selected="true">O‘zbekcha</button>' +
        '<button type="button" data-t="ru" aria-selected="false">Русский</button>' +
        '<button type="button" data-t="en" aria-selected="false">English</button></div>' +
      '<div class="pane on" data-p="' + uid + '-uz">' + tag('uz') + '</div>' +
      '<div class="pane" data-p="' + uid + '-ru">' + tag('ru') + '</div>' +
      '<div class="pane" data-p="' + uid + '-en">' + tag('en') + '</div></div>';
  }
  function inp(label, name, val, hint) {
    return '<div class="fld"><label>' + esc(label) + '</label><input name="' + name + '" value="' +
      esc(val == null ? '' : val) + '">' + (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</div>';
  }
  function wireTabs(root) {
    $$('[data-tabs]', root).forEach(function (bar) {
      var uid = bar.dataset.tabs;
      $$('button', bar).forEach(function (b) {
        b.onclick = function () {
          $$('button', bar).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
          $$('[data-p^="' + uid + '-"]', root).forEach(function (p) {
            p.classList.toggle('on', p.dataset.p === uid + '-' + b.dataset.t);
          });
        };
      });
    });
  }
  function toObj(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      var pt = k.split('.');
      if (pt.length === 1) o[k] = v;
      else { o[pt[0]] = o[pt[0]] || {}; o[pt[0]][pt[1]] = v; }
    });
    return o;
  }

  /* ---------- rasm ---------- */
  function wireDrop(onDone) {
    var d = $('#drop'), f = $('#file'), pv = $('#pv'), u = $('#imgu');
    if (!d) return;
    d.onclick = function () { f.click(); };
    u.oninput = function () { pv.src = u.value; onDone && onDone(); };
    f.onchange = function () { up(f.files[0]); };
    ['dragover', 'dragenter'].forEach(function (ev) {
      d.addEventListener(ev, function (e2) { e2.preventDefault(); d.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      d.addEventListener(ev, function (e2) { e2.preventDefault(); d.classList.remove('over'); });
    });
    d.addEventListener('drop', function (e2) { if (e2.dataTransfer.files[0]) up(e2.dataTransfer.files[0]); });

    function up(file) {
      if (!file) return;
      if (!/^image\//.test(file.type)) return toast('Bu rasm fayli emas', true);
      if (file.size > 5 * 1024 * 1024) return toast('Rasm 5 MB dan katta', true);
      d.innerHTML = '<b>Yuklanmoqda…</b>';
      var ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      var path = new Date().toISOString().slice(0, 10) + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext;
      sb.storage.from('products').upload(path, file, { cacheControl: '31536000', upsert: false })
        .then(function (r) {
          if (r.error) { d.innerHTML = '<b>Yuklanmadi</b>' + esc(r.error.message); return toast(r.error.message, true); }
          var url = sb.storage.from('products').getPublicUrl(path).data.publicUrl;
          u.value = url; pv.src = url;
          d.innerHTML = '<b>Rasm yuklandi ✓</b>Boshqasini tanlash uchun bosing';
          onDone && onDone();
          toast('Rasm yuklandi');
        });
    }
  }

  /* ---------- mahsulot modali ---------- */
  var editId = null;

  function openItem(p, copy) {
    p = p || { descr: {}, composition: {}, storage: {}, nutrition: {}, pack: {} };
    editId = copy ? null : (p.id || null);
    $('#pmT').textContent = editId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot';

    $('#pfb').innerHTML =
      '<div class="grp ' + catColor(p.cat) + '" id="gMain"><h3>Asosiy</h3>' +
        '<div class="g2">' + inp('Nomi *', 'name', p.name) + inp('Artikul', 'code', p.code, 'Masalan: 2.19') + '</div>' +
        '<div class="g2"><div class="fld"><label>Yo‘nalish *</label><select name="cat" id="selCat">' +
          K.map(function (c) {
            return '<option value="' + esc(c.id) + '"' + (c.id === p.cat ? ' selected' : '') + '>' + esc(catName(c.id)) + '</option>';
          }).join('') + '</select></div>' +
        inp('Havola nomi (id)', 'id', p.id, 'Bo‘sh qoldirsangiz nomdan yaratiladi') + '</div>' +
        '<div class="g2">' + inp('Tartib raqami', 'sort', p.sort == null ? 0 : p.sort, 'Kichik raqam oldinda') +
        '<div class="fld"><label>Holati</label><select name="active">' +
          '<option value="1"' + (p.active !== false ? ' selected' : '') + '>Saytda ko‘rinadi</option>' +
          '<option value="0"' + (p.active === false ? ' selected' : '') + '>Yashirilgan</option></select></div></div>' +
      '</div>' +

      '<div class="grp"><h3>Rasm va ko‘rinishi</h3><div class="pick">' +
        '<div class="preview"><div class="preview__lab">Saytdagi ko‘rinishi</div><div id="prev"></div></div>' +
        '<div><div class="drop" id="drop"><b>Rasmni shu yerga tashlang</b>yoki bosib kompyuterdan tanlang · JPG, PNG, WEBP · 5 MB gacha</div>' +
        '<input type="file" id="file" accept="image/*" hidden>' +
        '<div class="fld"><label>Yoki rasm manzili (URL)</label><input name="img" id="imgu" value="' + esc(p.img || '') + '"></div>' +
        '<img id="pv" alt="" style="display:none">' +
        '</div></div></div>' +

      '<div class="grp"><h3>Matnlar</h3>' + ml('Qisqa tavsif', 'descr', p.descr) + ml('Tarkibi', 'composition', p.composition, 1) + '</div>' +

      '<div class="grp"><h3>Saqlash sharti</h3><div class="g2">' +
        inp('Harorat', 'storage.t', p.storage && p.storage.t, 'Masalan: 18±3°C') +
        inp('Nisbiy namlik', 'storage.rh', p.storage && p.storage.rh, 'Masalan: 75%') + '</div></div>' +

      '<div class="grp"><h3>100 g dagi ozuqaviy qiymati</h3><div class="g4">' +
        inp('Oqsil, g', 'nutrition.protein', p.nutrition && p.nutrition.protein) +
        inp('Yog‘, g', 'nutrition.fat', p.nutrition && p.nutrition.fat) +
        inp('Uglevod, g', 'nutrition.carbs', p.nutrition && p.nutrition.carbs) +
        inp('Kaloriya, kcal', 'nutrition.kcal', p.nutrition && p.nutrition.kcal) + '</div></div>' +

      '<div class="grp"><h3>Qadoq va yetkazib berish</h3><div class="g3">' +
        inp('Quti o‘lchami', 'pack.size', p.pack && p.pack.size, '31×22×12') +
        inp('Quti hajmi, m³', 'pack.volume', p.pack && p.pack.volume) +
        inp('Netto vazni', 'pack.net', p.pack && p.pack.net, '2 kg') + '</div><div class="g2">' +
        inp('1 kg dagi dona', 'pack.pcs', p.pack && p.pack.pcs, '350 ± 3%') +
        inp('TN VED kodi', 'pack.tnved', p.pack && p.pack.tnved) + '</div></div>';

    wireTabs($('#pfb'));
    wireDrop(preview);

    $('#selCat').addEventListener('change', function () {
      $('#gMain').className = 'grp ' + catColor(this.value);
      preview();
    });
    $$('#pfb input[name="name"], #pfb [name="descr.uz"], #pfb [name="pack.net"], #pfb [name="nutrition.kcal"]')
      .forEach(function (i) { i.addEventListener('input', preview); });

    preview();
    open($('#pm'));
    setTimeout(function () { var n = $('#pfb input[name="name"]'); if (n) n.focus(); }, 80);

    function preview() {
      var f = toObj($('#pf'));
      var cl = catColor(f.cat);
      $('#prev').innerHTML = '<div class="card ' + cl + '" style="pointer-events:none">' +
        '<div class="card__ph"><img src="' + esc(f.img || '') + '" alt=""><span class="card__cat">' + esc(catName(f.cat)) + '</span></div>' +
        '<div class="card__b"><h3>' + esc(f.name || 'Mahsulot nomi') + '</h3>' +
        '<p>' + esc((f.descr && f.descr.uz) || 'Qisqa tavsif') + '</p>' +
        '<div class="card__f num"><span>Netto: <b>' + esc((f.pack && f.pack.net) || '—') + '</b></span>' +
        '<span>' + esc((f.nutrition && f.nutrition.kcal) || '—') + ' kcal</span></div></div></div>';
    }
  }

  $('#add').onclick = function () { openItem(null); };
  $('#quick').onclick = function () { go('items'); openItem(null); };

  $('#pf').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = toObj(ev.target);
    if (!f.name || !f.name.trim()) return toast('Nomi kiritilmagan', true);
    if (!f.cat) return toast('Yo‘nalish tanlanmagan', true);

    var id = slug(f.id || f.name) || ('p' + Date.now());
    if (!editId && P.some(function (x) { return x.id === id; })) {
      return toast('«' + id + '» id allaqachon band. Boshqa havola nomi kiriting.', true);
    }
    var n = function (v) { return (v === '' || v == null || isNaN(v)) ? 0 : Number(v); };

    var row = {
      id: id, cat: f.cat, name: f.name.trim(), code: f.code || '', img: f.img || '',
      descr: f.descr || {}, composition: f.composition || {}, storage: f.storage || {},
      nutrition: {
        protein: n(f.nutrition && f.nutrition.protein), fat: n(f.nutrition && f.nutrition.fat),
        carbs: n(f.nutrition && f.nutrition.carbs), kcal: n(f.nutrition && f.nutrition.kcal)
      },
      pack: f.pack || {}, active: f.active === '1', sort: n(f.sort)
    };

    var btn = $('button[type=submit]', ev.target);
    btn.disabled = true;
    var chain = (editId && editId !== id)
      ? sb.from('products').delete().eq('id', editId)
      : Promise.resolve({});
    chain.then(function () { return sb.from('products').upsert(row); })
      .then(function (r) {
        btn.disabled = false;
        if (r.error) return toast(r.error.message, true);
        close($('#pm')); toast('Saqlandi'); reload();
      })
      .catch(function (e2) { btn.disabled = false; toast(e2.message, true); });
  });

  /* ---------- yo'nalishlar ---------- */
  function drawCats() {
    $('#crows').innerHTML = K.length ? K.map(function (c) {
      return '<tr class="c-' + esc(c.color || 'brand') + '">' +
        '<td><img class="th" src="' + esc(c.img) + '" alt="" loading="lazy"></td>' +
        '<td class="nm"><b>' + esc(catName(c.id)) + '</b><span>' + esc((c.tagline && c.tagline.uz) || '') + '</span></td>' +
        '<td><span class="pillbadge">' + esc(c.id) + '</span></td>' +
        '<td><span class="dot">' + esc((COLORS.filter(function (x) { return x.id === (c.color || 'brand'); })[0] || {}).name || '') + '</span></td>' +
        '<td class="num">' + P.filter(function (p) { return p.cat === c.id; }).length + '</td>' +
        '<td><div class="acts">' +
        '<button class="ib" data-ce="' + esc(c.id) + '" aria-label="Tahrirlash"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>' +
        '<button class="ib ib--x" data-cd="' + esc(c.id) + '" aria-label="O‘chirish"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="6"><div class="nothing"><b>Yo‘nalish yo‘q</b><p>Birinchi bo‘limni qo‘shing.</p></div></td></tr>';

    $$('[data-ce]').forEach(function (b) {
      b.onclick = function () { openCat(catOf(b.dataset.ce)); };
    });
    $$('[data-cd]').forEach(function (b) {
      b.onclick = function () {
        var n = P.filter(function (p) { return p.cat === b.dataset.cd; }).length;
        if (n) return alert('Bu yo‘nalishda ' + n + ' ta mahsulot bor.\nAvval ularni boshqa yo‘nalishga o‘tkazing.');
        if (!confirm('Yo‘nalish o‘chirilsinmi?')) return;
        sb.from('categories').delete().eq('id', b.dataset.cd).then(function (r) {
          if (r.error) return toast(r.error.message, true);
          toast('O‘chirildi'); reload();
        });
      };
    });
  }

  var editCat = null;
  function openCat(c) {
    c = c || { name: {}, tagline: {}, descr: {} };
    editCat = c.id || null;
    $('#cmT').textContent = editCat ? 'Yo‘nalishni tahrirlash' : 'Yangi yo‘nalish';
    $('#cfb').innerHTML =
      '<div class="g2">' + inp('ID (lotin harflarida) *', 'id', c.id, 'Masalan: draje') +
      inp('Tartib raqami', 'sort', c.sort == null ? 0 : c.sort) + '</div>' +
      '<div class="g2"><div class="fld"><label>Rangi</label><select name="color">' +
        COLORS.map(function (x) {
          return '<option value="' + x.id + '"' + ((c.color || 'brand') === x.id ? ' selected' : '') + '>' + x.name + '</option>';
        }).join('') + '</select><span class="hint">Katalogdagi belgilar shu rangda bo‘ladi.</span></div>' +
      inp('Rasm manzili', 'img', c.img) + '</div>' +
      ml('Nomi', 'name', c.name) + ml('Qisqa izoh', 'tagline', c.tagline) + ml('To‘liq tavsif', 'descr', c.descr, 1);
    wireTabs($('#cfb'));
    open($('#cm'));
  }

  $('#addc').onclick = function () { openCat(null); };

  $('#cf2').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = toObj(ev.target), id = slug(f.id);
    if (!id) return toast('ID kiritilmagan', true);
    var row = {
      id: id, name: f.name || {}, tagline: f.tagline || {}, descr: f.descr || {},
      img: f.img || '', color: f.color || 'brand', sort: Number(f.sort) || 0
    };
    var chain = (editCat && editCat !== id)
      ? sb.from('categories').delete().eq('id', editCat) : Promise.resolve({});
    chain.then(function () { return sb.from('categories').upsert(row); })
      .then(function (r) {
        if (r.error) return toast(r.error.message, true);
        close($('#cm')); toast('Saqlandi'); reload();
      });
  });

  /* ---------- so'rovlar ---------- */
  function drawMsgs() {
    var unread = M.filter(function (m) { return !m.is_read; }).length;
    $('#mcount').textContent = M.length + ' ta so‘rov, ' + unread + ' tasi o‘qilmagan';
    $('#mlist').innerHTML = M.length ? M.map(function (m) {
      return '<article class="msg' + (m.is_read ? '' : ' new') + '">' +
        '<div class="msg__h"><b>' + esc(m.name) + (m.company ? ' · ' + esc(m.company) : '') + '</b><div class="acts">' +
          (m.is_read ? '' : '<button class="ib" data-mr="' + esc(m.id) + '" aria-label="O‘qilgan">✓</button>') +
          '<button class="ib ib--x" data-md="' + esc(m.id) + '" aria-label="O‘chirish">×</button></div></div>' +
        '<div class="msg__m"><span>' + new Date(m.created_at).toLocaleString() + '</span>' +
          (m.phone ? '<a href="tel:' + esc(m.phone) + '">' + esc(m.phone) + '</a>' : '') +
          (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' : '') +
          (m.country ? '<span>' + esc(m.country) + '</span>' : '') + '</div>' +
        (m.message ? '<p>' + esc(m.message) + '</p>' : '') + '</article>';
    }).join('') : '<div class="box"><div class="box__b"><div class="nothing"><b>So‘rov yo‘q</b><p>Saytdagi formadan kelgan murojaatlar shu yerda to‘planadi.</p></div></div></div>';

    $$('[data-mr]').forEach(function (b) {
      b.onclick = function () { sb.from('messages').update({ is_read: true }).eq('id', b.dataset.mr).then(reload); };
    });
    $$('[data-md]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm('So‘rov o‘chirilsinmi?')) return;
        sb.from('messages').delete().eq('id', b.dataset.md).then(function () { toast('O‘chirildi'); reload(); });
      };
    });
  }

  $('#allread').onclick = function () {
    sb.from('messages').update({ is_read: true }).eq('is_read', false).then(reload);
  };

  $('#csv').onclick = function () {
    if (!M.length) return toast('So‘rov yo‘q', true);
    var cols = ['created_at', 'name', 'company', 'phone', 'email', 'country', 'message'];
    var csv = '\uFEFF' + cols.join(';') + '\n' + M.map(function (m) {
      return cols.map(function (c) { return '"' + String(m[c] == null ? '' : m[c]).replace(/"/g, '""') + '"'; }).join(';');
    }).join('\n');
    dl(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'sladus-sorovlar.csv');
  };

  /* ---------- sozlamalar ---------- */
  $('#pwf').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = $('#pwn').value;

    if (!ready) {
      var u = $('#pwu').value.trim();
      if (!u) return toast('Login bo‘sh bo‘lmasin', true);
      if (v) {
        if (v.length < 10 || !/[0-9]/.test(v) || !/[A-Za-zА-Яа-я]/.test(v)) {
          return toast('Parol kamida 10 belgi bo‘lsin va harf bilan raqamni birga o‘z ichiga olsin', true);
        }
        localStorage.setItem(LS_PASS, v);
      }
      localStorage.setItem(LS_USER, u);
      $('#who').textContent = u + ' (mahalliy)';
      ev.target.reset(); renderLocalSecurityNotice();
      toast('Kirish ma’lumotlari yangilandi');
      return;
    }

    if (v.length < 10) return toast('Kamida 10 belgi bo‘lsin', true);
    if (!/[0-9]/.test(v) || !/[A-ZА-Я]/.test(v)) return toast('Raqam va katta harf qo‘shing', true);
    sb.auth.updateUser({ password: v }).then(function (r) {
      if (r.error) return toast(r.error.message, true);
      ev.target.reset(); toast('Parol almashtirildi');
    });
  });

  $('#exp').onclick = function () {
    dl(new Blob([JSON.stringify({ categories: K, products: P }, null, 2)], { type: 'application/json' }),
       'sladus-' + new Date().toISOString().slice(0, 10) + '.json');
  };

  $('#imp').onchange = function (ev) {
    var f = ev.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var db = JSON.parse(r.result);
        if (!Array.isArray(db.products)) throw new Error('Fayl formati noto‘g‘ri');
        if (!confirm(db.products.length + ' ta mahsulot yuklanadi.\nBir xil id bo‘lsa ustiga yoziladi. Davom etamizmi?')) return;
        var pre = Array.isArray(db.categories) && db.categories.length
          ? sb.from('categories').upsert(db.categories) : Promise.resolve({});
        pre.then(function () { return sb.from('products').upsert(db.products); })
          .then(function (res) {
            if (res.error) return toast(res.error.message, true);
            toast(db.products.length + ' ta mahsulot yuklandi'); reload();
          });
      } catch (e2) { toast(e2.message, true); }
    };
    r.readAsText(f);
    ev.target.value = '';
  };

  function dl(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- matnlar ---------- */
  var TEXT_GROUPS = [
    { title: 'Bosh sahifa — sarlavha (Hero)', keys: ['hero.badge', 'hero.badgetxt', 'hero.kicker', 'hero.title', 'hero.t1', 'hero.t2', 'hero.lead', 'hero.lead2', 'hero.cta1', 'hero.cta2', 'hero.scroll'] },
    { title: 'Statistika raqamlari', keys: ['stat.years', 'stat.sku', 'stat.countries', 'stat.regions'] },
    { title: 'Mahsulot yo‘nalishlari (bosh sahifa)', keys: ['range.title', 'range.lead', 'cat.title', 'cat.lead', 'cat.count', 'cat.view'] },
    { title: 'Ko‘p so‘raladigan mahsulotlar', keys: ['feat.title', 'feat.lead', 'feat.all'] },
    { title: 'Nega Sladus', keys: ['why.title', 'why.q.t', 'why.q.d', 'why.i.t', 'why.i.d', 'why.p.t', 'why.p.d', 'why.pr.t', 'why.pr.d'] },
    { title: 'Eksport xaritasi', keys: ['export.title', 'export.lead', 'export.cta'] },
    { title: 'Yutuqlar (sarlavha)', keys: ['awards.title', 'awards.lead'] },
    { title: 'Hamkorlik taklifi', keys: ['cta.title', 'cta.lead', 'cta.btn'] },
    { title: 'Narx so‘rash formasi', keys: ['form.title', 'form.lead', 'form.name', 'form.company', 'form.phone', 'form.email', 'form.country', 'form.interest', 'form.message', 'form.send', 'form.sending', 'form.ok', 'form.err', 'form.required', 'form.emailbad', 'form.phonebad'] },
    { title: 'Katalog sahifasi', keys: ['cat.h1', 'cat.search', 'cat.all', 'cat.sort', 'cat.sort.az', 'cat.sort.za', 'cat.sort.kcal', 'cat.sort.kcald', 'cat.found', 'cat.empty.t', 'cat.empty.d', 'cat.reset', 'cat.details'] },
    { title: 'Mahsulot kartasi', keys: ['p.back', 'p.composition', 'p.nutrition', 'p.protein', 'p.fat', 'p.carbs', 'p.kcal', 'p.supply', 'p.packtype', 'p.size', 'p.volume', 'p.net', 'p.pcs', 'p.tnved', 'p.code', 'p.storage', 'p.storagev', 'p.order', 'p.related'] },
    { title: 'Kompaniya haqida (matn)', keys: ['about.h1', 'about.story', 'about.p1', 'about.p2', 'about.valtitle', 'about.tl'] },
    { title: 'Aloqa (yorliqlar)', keys: ['contact.h1', 'contact.addr', 'contact.callexp', 'contact.calllocal', 'contact.email', 'contact.hours', 'contact.map'] },
    { title: 'Yordam va FAQ', keys: ['support.h1', 'support.lead', 'support.dl.title', 'support.dl.desc', 'support.dl.btn', 'support.faq.title', 'support.faq.q1', 'support.faq.a1', 'support.faq.q2', 'support.faq.a2', 'support.faq.q3', 'support.faq.a3', 'support.faq.q4', 'support.faq.a4', 'support.faq.q5', 'support.faq.a5', 'support.chat.title', 'support.chat.sub', 'support.chat.placeholder', 'support.chat.greeting', 'support.chat.disclaimer', 'support.chat.error'] },
    { title: 'Pastki qism (footer)', keys: ['footer.about', 'footer.nav', 'footer.cats', 'footer.contacts', 'footer.rights', 'footer.admin'] },
    { title: 'Navigatsiya va umumiy', keys: ['nav.home', 'nav.about', 'nav.catalog', 'nav.export', 'nav.contact', 'nav.quote', 'nav.support', 'ticker.pre', 'lang.name', 'a11y.menu', 'a11y.lang', 'top'] }
  ];

  var textsInited = false, countriesDraft = [], awardsDraft = [];

  function i18nField(key) {
    var uid = 'i_' + key.replace(/[^a-z0-9]/gi, '_');
    var sample = String((window.I18N.uz && window.I18N.uz[key]) || '');
    var area = sample.length > 46 || /<br|\n/.test(sample);
    function tag(l) {
      var v = (window.I18N[l] && window.I18N[l][key]) || '';
      return area
        ? '<textarea data-ikey="' + esc(key) + '" data-ilang="' + l + '" rows="3">' + esc(v) + '</textarea>'
        : '<input data-ikey="' + esc(key) + '" data-ilang="' + l + '" value="' + esc(v) + '">';
    }
    return '<div class="fld"><label><code>' + esc(key) + '</code></label>' +
      '<div class="tabs" data-tabs="' + uid + '">' +
        '<button type="button" data-t="uz" aria-selected="true">O‘zbekcha</button>' +
        '<button type="button" data-t="ru" aria-selected="false">Русский</button>' +
        '<button type="button" data-t="en" aria-selected="false">English</button></div>' +
      '<div class="pane on" data-p="' + uid + '-uz">' + tag('uz') + '</div>' +
      '<div class="pane" data-p="' + uid + '-ru">' + tag('ru') + '</div>' +
      '<div class="pane" data-p="' + uid + '-en">' + tag('en') + '</div></div>';
  }

  function renderTextGroups() {
    $('#txtGroups').innerHTML = TEXT_GROUPS.map(function (g) {
      return '<details class="box" style="margin-bottom:1.2rem"><summary class="box__h"><h2>' + esc(g.title) + '</h2></summary>' +
        '<div class="box__b">' + g.keys.map(i18nField).join('') + '</div></details>';
    }).join('');
    wireTabs($('#txtGroups'));
  }

  function renderCompany() {
    var c = window.BRAND.company || {};
    function f(label, key, val) {
      return '<div class="fld"><label>' + esc(label) + '</label><input data-co="' + key + '" value="' + esc(val == null ? '' : val) + '"></div>';
    }
    function ml3(label, key, obj) {
      obj = obj || {};
      var uid = 'co_' + key;
      return '<div class="fld"><label>' + esc(label) + '</label>' +
        '<div class="tabs" data-tabs="' + uid + '">' +
          '<button type="button" data-t="uz" aria-selected="true">O‘zbekcha</button>' +
          '<button type="button" data-t="ru" aria-selected="false">Русский</button>' +
          '<button type="button" data-t="en" aria-selected="false">English</button></div>' +
        '<div class="pane on" data-p="' + uid + '-uz"><input data-co="' + key + '" data-lang="uz" value="' + esc(obj.uz || '') + '"></div>' +
        '<div class="pane" data-p="' + uid + '-ru"><input data-co="' + key + '" data-lang="ru" value="' + esc(obj.ru || '') + '"></div>' +
        '<div class="pane" data-p="' + uid + '-en"><input data-co="' + key + '" data-lang="en" value="' + esc(obj.en || '') + '"></div></div>';
    }
    $('#txtCompany').innerHTML =
      '<div class="g2">' + f('Kompaniya nomi', 'name', c.name) + f('Yuridik nomi', 'legal', c.legal) + '</div>' +
      '<div class="g2">' + f('Tashkil topgan yil', 'founded', c.founded) + f('Email', 'email', c.email) + '</div>' +
      '<div class="g2">' + f('Eksport telefoni', 'phoneExport', c.phoneExport) +
        '<div class="fld"><label>Ichki bozor telefonlari (har birini alohida qatorga)</label>' +
        '<textarea data-co="phoneLocal" rows="2">' + esc((c.phoneLocal || []).join('\n')) + '</textarea></div></div>' +
      ml3('Manzil', 'address', c.address) + ml3('Ish vaqti', 'hours', c.hours);
    wireTabs($('#txtCompany'));
  }

  function syncCountriesFromDOM() {
    $$('#txtCountries [data-crow]').forEach(function (row) {
      var i = Number(row.dataset.crow), c = countriesDraft[i];
      if (!c) return;
      ['code', 'uz', 'ru', 'en'].forEach(function (f) {
        var el = row.querySelector('[data-cf="' + f + '"]');
        if (el) c[f] = el.value;
      });
    });
  }
  function paintCountries() {
    $('#txtCountries').innerHTML = countriesDraft.length ? countriesDraft.map(function (c, i) {
      return '<div class="g2" data-crow="' + i + '" style="grid-template-columns:70px 1fr 1fr 1fr 34px;align-items:end;margin-bottom:.6rem">' +
        '<div class="fld"><label>Kod</label><input data-cf="code" value="' + esc(c.code || '') + '" maxlength="3"></div>' +
        '<div class="fld"><label>O‘zbekcha</label><input data-cf="uz" value="' + esc(c.uz || '') + '"></div>' +
        '<div class="fld"><label>Русский</label><input data-cf="ru" value="' + esc(c.ru || '') + '"></div>' +
        '<div class="fld"><label>English</label><input data-cf="en" value="' + esc(c.en || '') + '"></div>' +
        '<button class="ib ib--x" type="button" data-crm="' + i + '" title="O‘chirish" aria-label="O‘chirish">×</button></div>';
    }).join('') : '<p class="hint">Davlat qo‘shilmagan.</p>';
    $$('#txtCountries [data-crm]').forEach(function (b) {
      b.onclick = function () { syncCountriesFromDOM(); countriesDraft.splice(Number(b.dataset.crm), 1); paintCountries(); };
    });
  }
  $('#ctryAdd').addEventListener('click', function () {
    syncCountriesFromDOM();
    countriesDraft.push({ code: '', uz: '', ru: '', en: '' });
    paintCountries();
  });

  function syncAwardsFromDOM() {
    $$('#txtAwards [data-arow]').forEach(function (row) {
      var i = Number(row.dataset.arow), a = awardsDraft[i];
      if (!a) return;
      a.img = row.querySelector('[data-af="img"]').value;
      a.title = row.querySelector('[data-af="title"]').value;
      a.year = row.querySelector('[data-af="year"]').value;
      a.text = a.text || {};
      ['uz', 'ru', 'en'].forEach(function (l) {
        var el = row.querySelector('[data-af="text_' + l + '"]');
        if (el) a.text[l] = el.value;
      });
    });
  }
  function paintAwards() {
    $('#txtAwards').innerHTML = awardsDraft.length ? awardsDraft.map(function (a, i) {
      var t = a.text || {};
      return '<div class="grp" data-arow="' + i + '" style="border:1px solid var(--hair);border-radius:var(--r-m);padding:1rem;margin-bottom:.9rem">' +
        '<div class="g3">' +
          '<div class="fld"><label>Rasm manzili</label><input data-af="img" value="' + esc(a.img || '') + '"></div>' +
          '<div class="fld"><label>Nomi</label><input data-af="title" value="' + esc(a.title || '') + '"></div>' +
          '<div class="fld"><label>Yil</label><input data-af="year" value="' + esc(a.year || '') + '"></div></div>' +
        '<div class="fld"><label>Tavsif</label>' +
          '<div class="tabs" data-tabs="aw' + i + '">' +
            '<button type="button" data-t="uz" aria-selected="true">O‘zbekcha</button>' +
            '<button type="button" data-t="ru" aria-selected="false">Русский</button>' +
            '<button type="button" data-t="en" aria-selected="false">English</button></div>' +
          '<div class="pane on" data-p="aw' + i + '-uz"><textarea data-af="text_uz" rows="2">' + esc(t.uz || '') + '</textarea></div>' +
          '<div class="pane" data-p="aw' + i + '-ru"><textarea data-af="text_ru" rows="2">' + esc(t.ru || '') + '</textarea></div>' +
          '<div class="pane" data-p="aw' + i + '-en"><textarea data-af="text_en" rows="2">' + esc(t.en || '') + '</textarea></div></div>' +
        '<button class="btn btn--line btn--sm" type="button" data-arm="' + i + '" style="margin-top:.6rem">O‘chirish</button></div>';
    }).join('') : '<p class="hint">Mukofot qo‘shilmagan.</p>';
    wireTabs($('#txtAwards'));
    $$('#txtAwards [data-arm]').forEach(function (b) {
      b.onclick = function () { syncAwardsFromDOM(); awardsDraft.splice(Number(b.dataset.arm), 1); paintAwards(); };
    });
  }
  $('#awardAdd').addEventListener('click', function () {
    syncAwardsFromDOM();
    awardsDraft.push({ img: '', title: '', year: '', text: { uz: '', ru: '', en: '' } });
    paintAwards();
  });

  function initTexts() {
    if (textsInited) return;
    textsInited = true;
    $('#txtMode').textContent = ready
      ? 'O‘zgarish «Saqlash» bilan shu brauzerda darhol qo‘llanadi. Barcha tashrif buyuruvchilarga ko‘rsatish uchun pastdagi «Saytga qo‘llash» bo‘limidan fayllarni yuklab, hosting’ga joylashtiring.'
      : 'Supabase ulanmagani uchun Mahsulotlar / Yo‘nalishlar / So‘rovlar bo‘limlari yopiq — faqat Matnlar ishlaydi. O‘zgarish «Saqlash» bilan shu brauzerda darhol ko‘rinadi; barchaga ko‘rsatish uchun pastdagi «Saytga qo‘llash» bo‘limidan fayllarni yuklab, hosting’ga joylashtiring.';
    renderCompany();
    renderTextGroups();
    countriesDraft = JSON.parse(JSON.stringify(window.BRAND.countries || []));
    awardsDraft = JSON.parse(JSON.stringify(window.BRAND.awards || []));
    paintCountries();
    paintAwards();
  }

  function collectI18n() {
    var out = { uz: {}, ru: {}, en: {} };
    $$('#txtGroups [data-ikey]').forEach(function (el) { out[el.dataset.ilang][el.dataset.ikey] = el.value; });
    return out;
  }
  function collectCompany() {
    var out = {};
    $$('#txtCompany [data-co]').forEach(function (el) {
      var k = el.dataset.co;
      if (el.dataset.lang) { out[k] = out[k] || {}; out[k][el.dataset.lang] = el.value; }
      else if (k === 'phoneLocal') out[k] = el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      else out[k] = el.value;
    });
    return out;
  }

  $('#txtSave').addEventListener('click', function () {
    syncCountriesFromDOM();
    syncAwardsFromDOM();
    var payload = { i18n: collectI18n(), brand: { company: collectCompany(), countries: countriesDraft, awards: awardsDraft } };
    try {
      localStorage.setItem('sladus_texts_v1', JSON.stringify(payload));
      Object.assign(window.BRAND.company, payload.brand.company);
      window.BRAND.countries = payload.brand.countries;
      window.BRAND.awards = payload.brand.awards;
      ['uz', 'ru', 'en'].forEach(function (l) { Object.assign(window.I18N[l], payload.i18n[l]); });
      toast('Saqlandi — saytni shu brauzerda ochib tekshiring');
    } catch (e) { toast('Saqlab bo‘lmadi: ' + e.message, true); }
  });

  $('#txtReset').addEventListener('click', function () {
    if (!confirm('Barcha saqlangan matn o‘zgarishlari o‘chirilib, standart holatga qaytariladimi?')) return;
    try { localStorage.removeItem('sladus_texts_v1'); } catch (e) { /* xotira yo'q */ }
    location.reload();
  });

  $('#dlI18n').addEventListener('click', function () {
    syncCountriesFromDOM(); syncAwardsFromDOM();
    var data = collectI18n();
    ['uz', 'ru', 'en'].forEach(function (l) { data[l] = Object.assign({}, window.I18N[l], data[l]); });
    var body = '/* Sladus — interfeys tarjimalari (uz / ru / en) */\n\nconst I18N = ' +
      JSON.stringify(data, null, 2) + ';\n\nif (typeof window !== \'undefined\') window.I18N = I18N;\n';
    dl(new Blob([body], { type: 'text/javascript;charset=utf-8' }), 'i18n.js');
  });

  $('#dlBrand').addEventListener('click', function () {
    syncCountriesFromDOM(); syncAwardsFromDOM();
    var b = JSON.parse(JSON.stringify(window.BRAND));
    Object.assign(b.company, collectCompany());
    b.countries = countriesDraft;
    b.awards = awardsDraft;
    dl(new Blob(['window.BRAND=' + JSON.stringify(b, null, 1) + ';\n'], { type: 'text/javascript;charset=utf-8' }), 'brand.js');
  });

  /* ---------- modal ---------- */
  function open(m) { m.classList.add('on'); document.body.style.overflow = 'hidden'; }
  function close(m) { m.classList.remove('on'); document.body.style.overflow = ''; }
  $$('[data-x]').forEach(function (b) { b.onclick = function () { close(b.closest('.mdl')); }; });
  $$('.mdl').forEach(function (m) {
    m.addEventListener('click', function (ev) { if (ev.target === m) close(m); });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') $$('.mdl.on').forEach(close);
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 's' && $('.mdl.on')) {
      ev.preventDefault();
      var form = $('form', $('.mdl.on'));
      if (form) form.requestSubmit();
    }
  });

  /* ---------- ishga tushirish ---------- */
  if (ready) {
    sb.auth.getSession().then(function (r) {
      if (r.data.session) enter(r.data.session);
      else $('#auth').hidden = false;
    }).catch(function () { $('#auth').hidden = false; });
  } else {
    $('label[for="em"]').textContent = 'Login';
    $('#em').type = 'text';
    if (isLocalLoggedIn()) enterLocalMode();
    else $('#auth').hidden = false;
  }
})();
