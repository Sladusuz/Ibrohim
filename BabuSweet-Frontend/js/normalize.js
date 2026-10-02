/* Shared by the site and the admin: turns ANY input into a safe, complete data object (never throws). */
(function () {
  'use strict';
  var LANGS = ['uz', 'ru', 'en'];
  var STATUS = ['active', 'soon', 'hidden'];
  var DEF = {
    brand: 'BabuSweet', phone: '+998 33 623 33 13', email: '', domain: '',
    address: 'Yangihayot, Sputnik-17, 52a, 100102, Tashkent, Tashkent Region',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Sputnik-17%2C%2052a%2C%20Yangihayot%2C%20Tashkent'
  };
  function str(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max || 2000) : (typeof v === 'number' ? String(v) : ''); }
  function tri(o, max) { var r = {}; LANGS.forEach(function (l) { r[l] = str(o && o[l], max || 4000); }); return r; }
  function hex(v, d) { return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : d; }
  function slugify(s) {
    var x = String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    return x;
  }
  function uid() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
  function url(v) { v = str(v, 400).trim(); return /^https?:\/\//i.test(v) ? v : ''; }
  function arr(a) { return Array.isArray(a) ? a : []; }

  function normalize(d) {
    d = d && typeof d === 'object' ? d : {};
    var s = d.settings && typeof d.settings === 'object' ? d.settings : {};
    var soc = s.social && typeof s.social === 'object' ? s.social : {};
    var hero = s.hero && typeof s.hero === 'object' ? s.hero : {};
    var out = {
      _v: +d._v || 0,
      settings: {
        brand: str(s.brand, 40) || DEF.brand,
        phone: str(s.phone, 30) || DEF.phone,
        email: str(s.email, 120).trim(),
        domain: url(s.domain).replace(/\/+$/, ''),
        address: str(s.address, 240) || DEF.address,
        mapUrl: url(s.mapUrl) || DEF.mapUrl,
        hours: tri(s.hours, 100),
        social: { telegram: url(soc.telegram), instagram: url(soc.instagram), facebook: url(soc.facebook), youtube: url(soc.youtube) },
        hero: { title: tri(hero.title, 240), lead: tri(hero.lead, 500) },
        stats: arr(s.stats).slice(0, 6).map(function (x) { x = x || {}; return { value: Math.max(0, Math.min(1e9, +x.value || 0)), suffix: str(x.suffix, 6), label: tri(x.label, 80) }; }),
        exportRegions: arr(s.exportRegions).map(function (x) { return str(x, 40).trim(); }).filter(Boolean).slice(0, 10)
      },
      products: [], news: [], texts: { uz: {}, ru: {}, en: {} }
    };
    var slugs = {}, ids = {};
    arr(d.products).forEach(function (p, i) {
      if (!p || typeof p !== 'object') return;
      var name = str(p.name, 80).trim(); if (!name) return;
      var slug = slugify(p.slug) || slugify(name) || ('product-' + (i + 1)), base = slug, n = 2;
      while (slugs[slug]) slug = base + '-' + n++; slugs[slug] = 1;
      var id = str(p.id, 40) || uid(); while (ids[id]) id = uid(); ids[id] = 1;
      var c1 = hex(p.color, '#1f63ff');
      out.products.push({
        id: id, slug: slug, name: name, tagline: tri(p.tagline, 200), desc: tri(p.desc, 2000),
        flavor: str(p.flavor, 80), weight: str(p.weight, 40), category: str(p.category, 60),
        image: str(p.image, 3e6), thumb: str(p.thumb, 3e6), bg: !!p.bg,
        color: c1, color2: p.color2 ? hex(p.color2, '') : '',
        status: STATUS.indexOf(p.status) >= 0 ? p.status : 'active', badge: str(p.badge, 24),
        order: isFinite(+p.order) && p.order !== '' && p.order !== null ? +p.order : i + 1,
        createdAt: str(p.createdAt, 40) || new Date().toISOString()
      });
    });
    ids = {};
    arr(d.news).forEach(function (n) {
      if (!n || typeof n !== 'object') return;
      var t = tri(n.title, 200); if (!t.uz && !t.ru && !t.en) return;
      var id = str(n.id, 40) || uid(); while (ids[id]) id = uid(); ids[id] = 1;
      out.news.push({ id: id, published: n.published !== false && !!n.published, date: str(n.date, 40) || new Date().toISOString(), title: t, body: tri(n.body, 4000), image: str(n.image, 3e6) });
    });
    var tx = d.texts && typeof d.texts === 'object' ? d.texts : {};
    LANGS.forEach(function (l) {
      var src = tx[l] && typeof tx[l] === 'object' ? tx[l] : {};
      Object.keys(src).slice(0, 1000).forEach(function (k) { var v = str(src[k], 1500); if (/^[\w.]+$/.test(k) && v.trim()) out.texts[l][k] = v; });
    });
    return out;
  }
  window.BS_normalize = normalize;
  window.BS_slugify = slugify;
  window.BS_uid = uid;
  window.BS_DEFAULTS = DEF;
})();
