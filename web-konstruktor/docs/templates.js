'use strict';
// Kasbiy shablonlar: har biri to'liq sayt ma'lumoti (company, theme, sections ...) beradi.
// Konstruktor shulardan birini tanlatadi, mijoz hammasini o'zgartira oladi.
(function () {
  const I = (p) => `/img/t/${p}.svg`;
  const T = [];
  const add = (t) => T.push(t);
  const sec = (id, type, o) => Object.assign({ id, type, enabled: true, navLabel: '' }, o);

  /* ---------- API ---------- */
  // Boshqa fayllar (tpl-*.js) TplKit.add orqali o'z shablonlarini qo'shadi; bir xil id eskisini almashtiradi.
  const T_BY = {};
  window.TEMPLATES = [];
  const rebuild = () => { window.TEMPLATES.length = 0; T.forEach((t) => { T_BY[t.id] = t; window.TEMPLATES.push({ id: t.id, name: t.name, cat: t.cat, icon: t.icon, desc: t.desc, badge: t.badge || '', tags: t.tags || [], look: t.look || '', thumb: `/img/tpl/${t.id}.jpg` }); }); };
  const reg = (t) => { const i = T.findIndex((x) => x.id === t.id); if (i >= 0) T[i] = t; else T.push(t); rebuild(); };
  rebuild();
  window.TplKit = { add: reg, sec, remove: (id) => { const i = T.findIndex((x) => x.id === id); if (i >= 0) { T.splice(i, 1); rebuild(); } }, P: (topic, n) => `/img/p/${topic}-${n}.jpg` };
  window.getTemplate = (id) => { const t = T_BY[id]; return t ? t.build() : null; };
})();
