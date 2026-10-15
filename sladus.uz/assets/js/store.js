/* ============================================================
   Sladus — ma'lumot qatlami
   Supabase sozlangan bo'lsa — undan, bo'lmasa seed.js dan oladi.
   Shu sababli sayt har qanday holatda ishlaydi.
   ============================================================ */
window.Store = (function () {
  'use strict';

  var C = window.SLADUS_CONFIG || {};
  var live = C.url && C.url.indexOf('XXXX') === -1 && C.key && C.key.indexOf('XXXX') === -1;
  var BASE = live ? C.url.replace(/\/$/, '') + '/rest/v1' : null;

  var cache = { products: null, categories: null };
  var LOCAL_KEY = 'sladus_admin_v1';
  var MSG_KEY = 'sladus_messages_v1';

  function head() {
    return { apikey: C.key, Authorization: 'Bearer ' + C.key, 'Content-Type': 'application/json' };
  }

  function seed() {
    return window.SLADUS_SEED || { products: [], categories: [] };
  }

  /* Supabase ulanmagan holatda mahalliy admin panel shu manzilga yozadi,
     sayt sahifalari birinchi navbatda shu yerdan o'qiydi. */
  function localData() {
    try {
      var raw = window.localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (d && Array.isArray(d.products) && d.products.length) return d;
    } catch (e) { /* localStorage yo'q yoki buzilgan — seed'ga qaytamiz */ }
    return null;
  }

  function load() {
    if (cache.products) return Promise.resolve(cache);
    if (!live) {
      var local = live ? null : localData();
      if (local) {
        cache = {
          products: local.products,
          categories: (local.categories && local.categories.length) ? local.categories : seed().categories,
          offline: true,
          localAdmin: true
        };
        return Promise.resolve(cache);
      }
      cache = { products: seed().products, categories: seed().categories, offline: true };
      return Promise.resolve(cache);
    }
    return Promise.all([
      fetch(BASE + '/products?select=*&active=eq.true&order=sort.asc,name.asc', { headers: head() }),
      fetch(BASE + '/categories?select=*&order=sort.asc', { headers: head() })
    ]).then(function (rs) {
      if (!rs[0].ok || !rs[1].ok) throw new Error('rest');
      return Promise.all([rs[0].json(), rs[1].json()]);
    }).then(function (d) {
      if (!d[0].length) throw new Error('empty');
      cache = { products: d[0], categories: d[1].length ? d[1] : seed().categories };
      return cache;
    }).catch(function () {
      cache = { products: seed().products, categories: seed().categories, offline: true };
      return cache;
    });
  }

  /* Supabase ulanmagan holatda ariza (contact forma) yuborilganda
     xabar shu brauzer xotirasiga tushadi — mahalliy admin panel shu yerdan o'qiydi. */
  function readLocalMessages() {
    try {
      var raw = window.localStorage.getItem(MSG_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeLocalMessages(arr) {
    try { window.localStorage.setItem(MSG_KEY, JSON.stringify(arr)); } catch (e) { /* xotira yo'q */ }
  }

  function makeId() {
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function send(data) {
    var clean = {
      name: (data.name || '').slice(0, 120),
      company: (data.company || '').slice(0, 120),
      phone: (data.phone || '').slice(0, 40),
      email: (data.email || '').slice(0, 120),
      country: (data.country || '').slice(0, 80),
      message: (data.message || '').slice(0, 3000)
    };
    if (!live) {
      if (!clean.name.trim()) return Promise.reject(new Error('invalid'));
      var arr = readLocalMessages();
      arr.unshift(Object.assign({ id: makeId(), is_read: false, created_at: new Date().toISOString() }, clean));
      writeLocalMessages(arr);
      return Promise.resolve(true);
    }
    return fetch(BASE + '/messages', {
      method: 'POST',
      headers: Object.assign(head(), { Prefer: 'return=minimal' }),
      body: JSON.stringify(clean)
    }).then(function (r) { if (!r.ok) throw new Error('send'); return true; });
  }

  function getMessages() {
    return readLocalMessages().sort(function (a, b) {
      return String(b.created_at).localeCompare(String(a.created_at));
    });
  }

  function markMessageRead(id) {
    var arr = readLocalMessages();
    arr.forEach(function (m) { if (m.id === id) m.is_read = true; });
    writeLocalMessages(arr);
  }

  function markAllMessagesRead() {
    var arr = readLocalMessages();
    arr.forEach(function (m) { m.is_read = true; });
    writeLocalMessages(arr);
  }

  function deleteMessage(id) {
    writeLocalMessages(readLocalMessages().filter(function (m) { return m.id !== id; }));
  }

  function clearCache() { cache = { products: null, categories: null }; }

  return {
    load: load,
    send: send,
    isLive: function () { return live; },
    LOCAL_KEY: LOCAL_KEY,
    MSG_KEY: MSG_KEY,
    getMessages: getMessages,
    markMessageRead: markMessageRead,
    markAllMessagesRead: markAllMessagesRead,
    deleteMessage: deleteMessage,
    clearCache: clearCache
  };
})();
