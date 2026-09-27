/* ============================================================
   Sladus — Support AI chat vidjeti
   Faqat support.html sahifasida ishlaydi. Backend: /api/support-chat
   (Vercel yoki Netlify serverless funksiyasi — Anthropic kaliti
   faqat serverda, brauzerda hech qachon ko'rinmaydi).
   ============================================================ */
window.SladusChat = (function () {
  'use strict';

  var ENDPOINT = '/api/support-chat';
  var MAX_LEN = 800;

  function e(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function mount(root, lang, t) {
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = '1';

    var history = []; /* { role, content } — faqat shu sahifa sessiyasi davomida xotirada turadi */

    root.innerHTML =
      '<div class="chatw">' +
        '<div class="chatw__h"><span class="chatw__dot"></span>' +
          '<div><h3>' + e(t('support.chat.title')) + '</h3><p>' + e(t('support.chat.sub')) + '</p></div>' +
        '</div>' +
        '<div class="chatw__body" id="chatBody"></div>' +
        '<p class="chatw__disc">' + e(t('support.chat.disclaimer')) + '</p>' +
        '<form class="chatw__f" id="chatForm">' +
          '<input type="text" id="chatInput" maxlength="' + MAX_LEN + '" autocomplete="off" placeholder="' + e(t('support.chat.placeholder')) + '">' +
          '<button type="submit" aria-label="' + e(t('support.chat.placeholder')) + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
          '</button>' +
        '</form>' +
      '</div>';

    var body = root.querySelector('#chatBody');
    var form = root.querySelector('#chatForm');
    var input = root.querySelector('#chatInput');

    function addBubble(role, text) {
      var d = document.createElement('div');
      d.className = 'chatw__msg ' + (role === 'user' ? 'chatw__msg--user' : role === 'err' ? 'chatw__msg--err' : 'chatw__msg--bot');
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
      return d;
    }

    function addTyping() {
      var d = document.createElement('div');
      d.className = 'chatw__typing';
      d.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
      return d;
    }

    addBubble('bot', t('support.chat.greeting'));

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      addBubble('user', msg);
      history.push({ role: 'user', content: msg });

      var typing = addTyping();
      var btn = form.querySelector('button');
      input.disabled = true; btn.disabled = true;

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, lang: lang })
      }).then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, data: data }; });
      }).then(function (res) {
        typing.remove();
        if (!res.ok || !res.data || !res.data.reply) {
          addBubble('err', (res.data && res.data.error) || t('support.chat.error'));
          return;
        }
        addBubble('bot', res.data.reply);
        history.push({ role: 'assistant', content: res.data.reply });
      }).catch(function () {
        typing.remove();
        addBubble('err', t('support.chat.error'));
      }).then(function () {
        input.disabled = false; btn.disabled = false; input.focus();
      });
    });
  }

  return { mount: mount };
})();
