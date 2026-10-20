'use strict';
// Umumiy tahrirlagich: bo'limlar sxemasidan (sections.js) avtomatik forma yasaydi.
// Konstruktor (mijoz) ham, admin panel (egasi) ham shuni ishlatadi.
(function () {
  const E = window.E;
  const { esc } = E;
  const icon = (n) => window.svgIcon(n);
  const uid = () => 'i' + Math.random().toString(36).slice(2, 8);
  const iconNames = () => Object.keys(window.ICONS).filter((k) => !['menu', 'x', 'arrow', 'check', 'plus', 'minus', 'trash', 'left', 'right', 'down', 'search', 'external', 'eye', 'edit', 'settings', 'bell', 'inbox', 'download', 'filter', 'grid', 'database', 'quote', 'help', 'home', 'user'].includes(k));
  const ICON_LABEL = { code: 'Kod', phone: 'Telefon', send: 'Yuborish', design: 'Dizayn', shield: 'Himoya', zap: 'Tezlik', chart: 'Grafik', cart: 'Savat', cloud: 'Bulut', support: 'Yordam', globe: 'Dunyo', star: 'Yulduz', users: 'Odamlar', heart: 'Yurak', tool: 'Asbob', truck: 'Yetkazish', mail: 'Pochta', pin: 'Joy', clock: 'Vaqt', tel: 'Qo\'ng\'iroq', insta: 'Instagram', calendar: 'Kalendar', gift: 'Sovg\'a', percent: 'Chegirma', award: 'Mukofot', camera: 'Kamera', image: 'Rasm', scissors: 'Qaychi', coffee: 'Kofe', book: 'Kitob', terminal: 'Terminal', layers: 'Qatlamlar', package: 'Quti', card: 'Karta', refresh: 'Aylanish', github: 'GitHub', briefcase: 'Portfel', utensils: 'Taom', graduation: 'Ta\'lim', leaf: 'Barg', sun: 'Quyosh', dollar: 'Pul' };
  Object.assign(ICON_LABEL, window.ICON_LABEL_X || {});

  window.Editor = {
    create(opts) {
      const root = opts.root, tabsEl = opts.tabsEl;
      let tab = opts.startTab || 'sections', editing = -1, adding = false;
      const open = new Set();
      const D = () => opts.data();
      const get = (p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), D());
      const set = (p, v, quiet) => { const ks = p.split('.'); let o = D(); for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = v; if (!quiet) opts.onChange(p); };
      const sections = () => (D().sections = D().sections || []);
      const extra = () => (opts.extraTabs || []).find((t) => t.id === tab);

      /* ---------- Maydonlar ---------- */
      function field(f, base, obj) {
        if (f.show && !f.show(obj)) return '';
        const p = `${base}.${f.k}`, v = obj[f.k], L = `<label class="f">${esc(f.label || '')}</label>`, H = f.hint ? `<div class="hint">${esc(f.hint)}</div>` : '';
        switch (f.t) {
          case 'text': return `${L}<input type="text" data-p="${p}" value="${esc(v ?? '')}" ${f.max ? `maxlength="${f.max}"` : ''} ${f.ph ? `placeholder="${esc(f.ph)}"` : ''}>${H}`;
          case 'area': return `${L}<textarea data-p="${p}" rows="${f.rows || 3}" ${f.max ? `maxlength="${f.max}"` : ''}>${esc(v ?? '')}</textarea>${H}`;
          case 'num': return `${L}<input type="number" data-p="${p}" data-num ${f.blank ? 'data-blank' : ''} value="${v === '' || v == null ? '' : esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''}>${H}`;
          case 'sel': return `${L}<select data-p="${p}" data-re>${f.options.map(([k, l]) => `<option value="${esc(k)}" ${String(v) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${H}`;
          case 'tog': return `<label class="sw"><span><b>${esc(f.label)}</b>${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</span><input type="checkbox" data-p="${p}" data-re ${v !== false && v ? 'checked' : ''}><span class="tg"></span></label>`;
          case 'lines': return `${L}<textarea data-p="${p}" data-k="lines" rows="4">${esc((Array.isArray(v) ? v : []).join('\n'))}</textarea>${H}`;
          case 'icon': return `${L}<div class="iconsel"><span class="ip">${icon(v)}</span><select data-p="${p}" data-re>${iconNames().map((k) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(ICON_LABEL[k] || k)}</option>`).join('')}</select></div>`;
          case 'link': return `${L}<input type="text" data-p="${p}" list="lnk" value="${esc(v ?? '')}" placeholder="#bo'lim yoki https://…" maxlength="300">${H}`;
          case 'img': return `${L}<div class="img"><div class="pv" style="${v ? `background-image:url('${esc(v)}')` : ''}"></div><label class="upl">Rasm tanlash<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-up="${p}"></label>${v ? `<button class="b g s" data-act="clr" data-path="${p}">O'chirish</button>` : ''}</div>${H}`;
          case 'list': {
            const arr = Array.isArray(v) ? v : [], n = arr.length;
            return `<div class="lst"><div class="lh"><b>${esc(f.label)}</b><span>${n}</span></div>${arr.map((it, i) => {
              const ip = `${p}.${i}`, isOpen = open.has(ip), title = String(it[f.item.title] || '').trim();
              return `<div class="item ${isOpen ? 'open' : ''}"><div class="ihd" data-act="toggle" data-key="${ip}"><i>${icon('down')}</i><b>${esc(title.slice(0, 44) || '(nomsiz)')}</b><div class="acts"><button data-act="up" data-path="${p}" data-i="${i}" ${i === 0 ? 'disabled' : ''} title="Yuqoriga">↑</button><button data-act="dn" data-path="${p}" data-i="${i}" ${i === n - 1 ? 'disabled' : ''} title="Pastga">↓</button><button class="x" data-act="del" data-path="${p}" data-i="${i}" title="O'chirish">✕</button></div></div>${isOpen ? `<div class="ibody">${f.item.fields.map((ff) => field(ff, ip, it)).join('')}</div>` : ''}</div>`;
            }).join('')}${(() => { const mx = f.max || f.item.max || 0; return !mx || n < mx ? `<button class="addb" data-act="add" data-path="${p}" data-field="${esc(f.k)}">+ Qo'shish</button>` : ''; })()}</div>`;
          }
          default: return '';
        }
      }
      const fields = (list, base, obj) => list.map((f) => field(f, base, obj)).join('');

      /* ---------- Sahifalar (tablar) ---------- */
      const SITE_F = [
        { k: 'name', t: 'text', label: 'Kompaniya / sayt nomi', max: 60 }, { k: 'logo', t: 'text', label: 'Logo harfi', max: 2, hint: "1–2 ta harf, logotip o'rnida chiqadi" },
        { k: 'tagline', t: 'area', label: 'Qisqa shior', max: 140, rows: 2, hint: 'Pastki qismda ko\'rinadi' }, { k: 'logoImage', t: 'img', label: 'Logotip rasmi (ixtiyoriy)', hint: 'Yuklasangiz harf o\'rniga shu ko\'rinadi' },
      ];
      const NAV_F = [
        { k: 'style', t: 'sel', label: 'Menyu ko\'rinishi', options: Object.entries(E.navStyles) }, { k: 'cta', t: 'text', label: 'Menyudagi tugma matni', max: 30, hint: "Bo'sh qoldirsangiz tugma ko'rinmaydi" },
        { k: 'ctaLink', t: 'link', label: 'Tugma havolasi' }, { k: 'search', t: 'tog', label: 'Menyuda qidiruv', hint: 'Katalog bo\'lsa, mahsulot qidirish maydoni' },
      ];
      const ANA_F = [{ k: 'ga', t: 'text', label: 'Google Analytics (G-XXXXXXXXXX)', max: 20 }, { k: 'ym', t: 'text', label: 'Yandex Metrika raqami', max: 14 }, { k: 'fb', t: 'text', label: 'Meta Pixel ID', max: 20 }];
      const ANN_F = [{ k: 'enabled', t: 'tog', label: "Yuqori e'lon qatori", hint: 'Aksiya yoki muhim xabar uchun' }, { k: 'text', t: 'text', label: "E'lon matni", max: 140 }, { k: 'link', t: 'link', label: 'Havola (ixtiyoriy)' }];
      const ACC_F = [{ k: 'enabled', t: 'tog', label: "Mijoz hisobi (kirish / ro'yxatdan o'tish)", hint: "Faqat server ulangan bo'lsa ishlaydi. Mijoz ma'lumotlari bazada saqlanadi." }, { k: 'requireOrder', t: 'tog', label: 'Buyurtma uchun hisob talab qilish' }, { k: 'requireBooking', t: 'tog', label: "Bron / yozilish uchun hisob talab qilish" }];
      const FOOT_F = [{ k: 'text', t: 'text', label: 'Pastki yozuv', max: 140 }, { k: 'links', t: 'list', label: 'Pastki havolalar', item: { title: 'label', fields: [{ k: 'label', t: 'text', label: 'Nomi', max: 30 }, { k: 'url', t: 'link', label: 'Havola' }], add: () => ({ label: 'Havola', url: '#' }) }, max: 6 }];
      const CONTACT_F = [
        { k: 'phone', t: 'text', label: 'Telefon', max: 40, ph: '+998 90 123 45 67' }, { k: 'email', t: 'text', label: 'Email', max: 80, hint: 'Buyurtma va xabarlar shu emailga tushadi' },
        { k: 'address', t: 'text', label: 'Manzil', max: 160 }, { k: 'hours', t: 'text', label: 'Ish vaqti', max: 80 },
        { k: 'telegram', t: 'text', label: 'Telegram', max: 80, ph: '@username' }, { k: 'instagram', t: 'text', label: 'Instagram', max: 80, ph: '@username' }, { k: 'whatsapp', t: 'text', label: 'WhatsApp (raqam)', max: 30, ph: '+998901234567' },
      ];
      const ORD_F = [
        { k: 'enabled', t: 'tog', label: 'Savat va buyurtma', hint: "Yoqilsa, katalogdagi mahsulotlar savatga qo'shiladi" },
        { k: 'currency', t: 'text', label: 'Valyuta', max: 12, hint: "masalan: so'm, $, ₽" }, { k: 'deliveryFee', t: 'num', label: 'Yetkazib berish narxi', min: 0, hint: '0 = yetkazib berish pullik emas' },
        { k: 'freeShipFrom', t: 'num', label: 'Bepul yetkazish chegarasi', min: 0, hint: 'Shu summadan yuqori buyurtmada yetkazish bepul (0 = o\'chiq)' },
      ];

      function tabSite() {
        const d = D();
        return `<h4>Sayt</h4>${fields(SITE_F, 'company', d.company || (d.company = {}))}<h4>Menyu</h4>${fields(NAV_F, 'nav', d.nav || (d.nav = {}))}<h4>Statistika (ixtiyoriy)</h4>${fields(ANA_F, 'analytics', d.analytics || (d.analytics = {}))}<h4>E'lon qatori</h4>${fields(ANN_F, 'announce', d.announce || (d.announce = {}))}${opts.account ? `<h4>Mijoz hisobi</h4>${fields(ACC_F, 'account', d.account || (d.account = {}))}` : ''}<h4>Pastki qism</h4>${fields(FOOT_F, 'footer', d.footer || (d.footer = {}))}`;
      }
      function tabDesign() {
        const t = D().theme || (D().theme = {});
        const sw = Object.entries(E.themes).map(([k, th]) => `<button data-act="theme" data-t="${k}" class="${t.preset === k ? 'on' : ''}" title="${esc(th.label)}"><i style="background:linear-gradient(135deg,${th.sw[0]} 50%,${th.sw[1]} 50%)"></i>${esc(th.label)}</button>`).join('');
        return `<h4>Rang mavzusi</h4><div class="th">${sw}</div>
          <label class="f">Maxsus rang (ixtiyoriy)</label><div class="colors"><label><input type="color" data-p="theme.accent" data-color value="${esc(t.accent || '#4f46e5')}"> Asosiy</label><label><input type="color" data-p="theme.accent2" data-color value="${esc(t.accent2 || '#06b6d4')}"> Qo'shimcha</label><button class="b g s" data-act="resetColors">Standart</button></div>
          <h4>Shrift va shakl</h4>${fields([{ k: 'font', t: 'sel', label: 'Shrift uslubi', options: Object.entries(E.fonts) }, { k: 'radius', t: 'sel', label: 'Burchaklar', options: Object.entries(E.radii) }, { k: 'heads', t: 'sel', label: 'Sarlavhalar joylashuvi', options: [['left', 'Chapda'], ['center', 'Markazda']] }], 'theme', t)}
          <h4>Fon va effektlar</h4>${fields([{ k: 'look', t: 'sel', label: 'Umumiy uslub', options: Object.entries(E.looks), hint: 'Kinematik: katta sarlavhalar, animatsiyalar, nurli fon, maxsus kursor' }, { k: 'motion', t: 'tog', label: 'Animatsiyalar yoqilgan' }, { k: 'fab', t: 'tog', label: 'Suzuvchi aloqa tugmalari', hint: "Telefon, Telegram va 'Bepul maslahat' tugmalari ekranning pastida doim ko'rinadi" }, { k: 'bg', t: 'sel', label: 'Fon uslubi', options: Object.entries(E.bgs) }, { k: 'switcher', t: 'tog', label: 'Mavzu almashtirgich', hint: 'Mehmon qorong\'i/yorug\' rangni o\'zi tanlay oladi' }], 'theme', t)}`;
      }
      function tabContacts() { const d = D(); return `<h4>Aloqa ma'lumotlari</h4>${fields(CONTACT_F, 'contacts', d.contacts || (d.contacts = {}))}`; }
      function tabOrders() { const d = D(); return `<h4>Savat va yetkazish</h4>${fields(ORD_F, 'orders', d.orders || (d.orders = {}))}`; }

      const summary = (s) => String(s.title || s.titleStart || (s.items && s.items[0] && (s.items[0].name || s.items[0].title || s.items[0].q || s.items[0].label)) || '').slice(0, 60);
      function tabSections() {
        const secs = sections();
        if (adding) {
          return `<button class="back" data-act="sec-back">${icon('left')} Bo'limlar</button><h4>Qaysi bo'lim qo'shamiz?</h4><div class="lib">${E.order.map((t) => { const d = E.sections[t]; return `<button class="libc" data-act="sec-new" data-type="${t}"><span class="sic">${icon(d.icon)}</span><b>${esc(d.label)}</b><small>${esc(d.desc)}</small></button>`; }).join('')}</div>`;
        }
        if (editing >= 0 && secs[editing]) {
          const s = secs[editing], def = E.sections[s.type];
          if (!def) { editing = -1; return tabSections(); }
          return `<button class="back" data-act="sec-back">${icon('left')} Bo'limlar</button><div class="eh"><div><span class="sic">${icon(def.icon)}</span><b>${esc(def.label)}</b></div><div class="acts"><button data-act="sec-dup" data-i="${editing}" title="Nusxa olish">⧉</button><button class="x" data-act="sec-del" data-i="${editing}" title="O'chirish">✕</button></div></div>
            ${field({ k: 'navLabel', t: 'text', label: 'Menyudagi nomi', max: 24, hint: "Bo'sh qoldirsangiz menyuda ko'rinmaydi" }, `sections.${editing}`, s)}${fields(def.fields, `sections.${editing}`, s)}`;
        }
        return `<h4>Sahifa bo'limlari</h4><p class="hint">Bosib tahrirlang, tugma bilan yoqing/o'chiring, ↑↓ bilan tartibini o'zgartiring.</p>${secs.map((s, i) => {
          const def = E.sections[s.type] || { label: s.type, icon: 'star' };
          return `<div class="srow ${s.enabled === false ? 'off' : ''}"><span class="sic">${icon(def.icon)}</span><button class="sname" data-act="sec-edit" data-i="${i}"><b>${esc(def.label)}</b><small>${esc(summary(s)) || '&nbsp;'}</small></button><label class="sw mini" title="Yoqish / o'chirish"><input type="checkbox" data-secen="${i}" ${s.enabled !== false ? 'checked' : ''}><span class="tg"></span></label><div class="acts"><button data-act="sec-up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button><button data-act="sec-dn" data-i="${i}" ${i === secs.length - 1 ? 'disabled' : ''}>↓</button></div></div>`;
        }).join('')}<button class="addb" data-act="sec-add-open">+ Bo'lim qo'shish</button>`;
      }

      const CORE = [['sections', "Bo'limlar", tabSections], ['design', 'Dizayn', tabDesign], ['site', 'Sayt', tabSite], ['contacts', 'Aloqa', tabContacts], ['orders', 'Buyurtma', tabOrders]];
      function render(keep) {
        const sc = root.scrollTop;
        const ex = opts.extraTabs || [];
        tabsEl.innerHTML = [...CORE.map(([k, l]) => [k, l]), ...ex.map((t) => [t.id, t.label])].map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('');
        const core = CORE.find((c) => c[0] === tab);
        const anchors = sections().map((s) => `<option value="#${esc(s.id)}">${esc((E.sections[s.type] || {}).label || s.type)}</option>`).join('');
        root.innerHTML = (core ? core[2]() : (extra() ? extra().render() : '')) + `<datalist id="lnk">${anchors}</datalist>`;
        if (keep) root.scrollTop = sc; else root.scrollTop = 0;
        if (extra() && extra().bind) extra().bind(root);
      }

      /* ---------- Hodisalar ---------- */
      tabsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; editing = -1; adding = false; render(); if (opts.onTab) opts.onTab(tab); });
      root.addEventListener('input', (e) => {
        const t = e.target; if (t.dataset.up || !t.dataset.p) return;
        let v = t.type === 'checkbox' ? t.checked : t.value;
        if (t.dataset.num !== undefined) { if (v === '') v = t.dataset.blank !== undefined ? '' : 0; else { v = Number(v); if (t.min !== '' && v < Number(t.min)) v = Number(t.min); if (t.max !== '' && v > Number(t.max)) v = Number(t.max); } }
        if (t.dataset.k === 'lines') v = t.value.split('\n').map((x) => x.trim()).filter(Boolean);
        if (t.type === 'color') { t.dataset.touched = '1'; }
        set(t.dataset.p, v);
      });
      root.addEventListener('change', async (e) => {
        const t = e.target;
        if (t.dataset.up && t.files[0]) { try { const url = await opts.upload(t.files[0]); set(t.dataset.up, url); render(true); opts.toast && opts.toast('Rasm qo\'shildi'); } catch (er) { opts.toast && opts.toast(er.message); } return; }
        if (t.dataset.secen !== undefined) { sections()[+t.dataset.secen].enabled = t.checked; opts.onChange('sections'); render(true); return; }
        if (t.dataset.re !== undefined && t.dataset.p) { render(true); return; }
        if (extra() && extra().change) extra().change(e);
      });
      function secPrev(i) { if (opts.focus && sections()[i]) opts.focus(sections()[i].id); }
      root.addEventListener('click', (e) => {
        const el = e.target.closest('[data-act]');
        if (!el) { if (extra() && extra().click) extra().click(e); return; }
        const a = el.dataset.act, path = el.dataset.path, i = +el.dataset.i;
        const arrOf = (p) => get(p);
        if (a === 'toggle') { if (e.target.closest('.acts')) return; const k = el.dataset.key; open.has(k) ? open.delete(k) : open.add(k); render(true); return; }
        if (a === 'theme') { set('theme.preset', el.dataset.t); render(true); return; }
        if (a === 'resetColors') { set('theme.accent', ''); set('theme.accent2', ''); render(true); return; }
        if (a === 'clr') { set(path, ''); render(true); return; }
        if (a === 'add') {
          const parts = path.split('.'); const arr = arrOf(path) || [];
          // ro'yxat tavsifini topamiz
          let def = null;
          if (parts[0] === 'sections') { const s = sections()[+parts[1]]; const sd = E.sections[s.type]; def = sd.fields.find((x) => x.k === parts[2]); }
          else if (path === 'footer.links') def = FOOT_F[1];
          const item = def.item.add(); if (def.item.idKey && !item[def.item.idKey]) item[def.item.idKey] = uid();
          arr.push(item); set(path, arr); open.add(`${path}.${arr.length - 1}`); render(true); return;
        }
        if (a === 'del') { if (!confirm("O'chirilsinmi?")) return; const arr = arrOf(path); arr.splice(i, 1); open.clear(); set(path, arr); render(true); return; }
        if (a === 'up' || a === 'dn') { const arr = arrOf(path), j = a === 'up' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; open.clear(); set(path, arr); render(true); return; }
        const secs = sections();
        if (a === 'sec-edit') { editing = i; open.clear(); render(); secPrev(i); return; }
        if (a === 'sec-back') { editing = -1; adding = false; render(); return; }
        if (a === 'sec-add-open') { adding = true; render(); return; }
        if (a === 'sec-new') {
          const type = el.dataset.type, def = E.sections[type], s = Object.assign({ id: `${type}-${Math.random().toString(36).slice(2, 6)}`, type, enabled: true, navLabel: '' }, def.defaults());
          const ci = secs.map((x) => x.type).lastIndexOf('contact'); if (ci >= 0 && type !== 'contact') secs.splice(ci, 0, s); else secs.push(s);
          adding = false; editing = secs.indexOf(s); open.clear(); opts.onChange('sections'); render(); secPrev(editing); return;
        }
        if (a === 'sec-del') { if (!confirm("Bo'lim o'chirilsinmi?")) return; secs.splice(i, 1); editing = -1; opts.onChange('sections'); render(); return; }
        if (a === 'sec-dup') { const c = JSON.parse(JSON.stringify(secs[i])); c.id = `${c.type}-${Math.random().toString(36).slice(2, 6)}`; (c.items || []).forEach((it) => { if (it && it.id) it.id = uid(); }); secs.splice(i + 1, 0, c); editing = i + 1; opts.onChange('sections'); render(); return; }
        if (a === 'sec-up' || a === 'sec-dn') { const j = a === 'sec-up' ? i - 1 : i + 1; if (j < 0 || j >= secs.length) return; [secs[i], secs[j]] = [secs[j], secs[i]]; opts.onChange('sections'); render(true); return; }
        if (extra() && extra().click) extra().click(e);
      });

      render();
      return { render, setTab(t) { tab = t; editing = -1; adding = false; render(); }, get tab() { return tab; } };
    },
  };
})();
