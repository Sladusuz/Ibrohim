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

  if (!ready) {
    document.body.innerHTML = '<div class="auth"><div class="auth__card">' +
      '<h1>config.js to‘ldirilmagan</h1>' +
      '<p>Supabase → Project Settings → API bo‘limidan <b>Project URL</b> va <b>anon public</b> kalitini nusxalab, ' +
      '<code>config.js</code> fayliga qo‘ying. Keyin bu sahifani yangilang.</p></div></div>';
    return;
  }

  var sb = window.supabase.createClient(C.url, C.key, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

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

  /* ---------- kirish ---------- */
  sb.auth.getSession().then(function (r) {
    if (r.data.session) enter(r.data.session);
    else $('#auth').hidden = false;
  });

  $('#authForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var err = $('#authErr'), btn = $('button[type=submit]', ev.target);
    err.classList.remove('on');
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
    sb.auth.signOut().then(function () { location.reload(); });
  });

  function enter(session) {
    $('#shell').hidden = false;
    $('#who').textContent = session.user.email;
    $('#curl').textContent = location.pathname.replace(/^\//, '');
    reload();
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
})();
