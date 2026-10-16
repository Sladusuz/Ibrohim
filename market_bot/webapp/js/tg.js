/* Telegram Mini App integratsiyasi: to'liq ekran, mavzu, t.me havolalari. */
(function () {
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
    document.documentElement.classList.add('in-tg');
    if (tg.colorScheme && !localStorage.getItem('bc3_theme')) document.documentElement.dataset.theme = tg.colorScheme;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (bg && tg.setHeaderColor) { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); }
  } catch (e) { /* eski Telegram */ }

  // Telegram havolalari Telegram ichida ochiladi, boshqalari tashqi brauzerda
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.href;
    if (/^https:\/\/t\.me\//.test(href)) { e.preventDefault(); tg.openTelegramLink(href); }
    else if (/^https?:\/\//.test(href) && new URL(href).origin !== location.origin) { e.preventDefault(); tg.openLink(href); }
  }, true);

  // Orqaga tugmasi: ichki sahifadan bosh sahifaga/oldingisiga
  const isHome = /\/(index\.html)?$/.test(location.pathname);
  if (!isHome && tg.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => (history.length > 1 ? history.back() : (location.href = 'index.html')));
  }
})();
