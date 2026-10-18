/* Ilova ichidagi (iOS/Android) native imkoniyatlar: faqat Capacitor ichida ishlaydi, oddiy saytda hech narsa qilmaydi */
(function () {
  var C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = C.Plugins || {}, d = document.documentElement; d.classList.add('native');
  var st = document.createElement('style');
  st.textContent = 'html.native body{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}html.native .tgfab,html.native [data-install]{display:none!important}#nbar{position:fixed;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:99999;padding:10px 14px;border-radius:14px;background:#141b30;color:#eef1ff;font:14px/1.4 system-ui;text-align:center;box-shadow:0 8px 30px #0008;display:none}#nshare{position:fixed;left:14px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:9999;width:46px;height:46px;border-radius:50%;border:0;background:#ffffff1a;color:#eef1ff;font-size:20px;backdrop-filter:blur(10px)}';
  document.head.appendChild(st);
  try { if (P.StatusBar) { P.StatusBar.setStyle({ style: 'DARK' }); } } catch (e) {}
  try { if (P.SplashScreen) P.SplashScreen.hide(); } catch (e) {}
  // Teginish: yengil tebranish
  document.addEventListener('click', function (e) { if (e.target.closest('a,button,.btn,[role=button]')) { try { P.Haptics && P.Haptics.impact({ style: 'LIGHT' }); } catch (x) {} } }, true);
  // Oflayn ogohlantirish
  var bar = document.createElement('div'); bar.id = 'nbar'; bar.textContent = "Internet yo'q: ba'zi funksiyalar (chat, so'rov yuborish) ishlamaydi"; document.body.appendChild(bar);
  var upd = function () { bar.style.display = navigator.onLine ? 'none' : 'block'; }; addEventListener('online', upd); addEventListener('offline', upd); upd();
  // Ulashish tugmasi (native share sheet)
  if (P.Share) { var b = document.createElement('button'); b.id = 'nshare'; b.setAttribute('aria-label', 'Ulashish'); b.textContent = '⤴'; b.onclick = function () { P.Share.share({ title: 'Impro IT', text: 'Biznesingiz uchun sayt va Telegram bot: Impro IT', url: 'https://improuzbekiston.uz/', dialogTitle: 'Ulashish' }).catch(function () {}); }; document.body.appendChild(b); }
  // Tashqi havolalar (Telegram, WhatsApp, telefon) tizim ilovasida ochilsin
  document.addEventListener('click', function (e) { var a = e.target.closest('a[href]'); if (!a) return; var h = a.getAttribute('href'); if (/^(https?:)?\/\/(t\.me|wa\.me|instagram\.com)/.test(h) || /^(tel|mailto):/.test(h)) { e.preventDefault(); window.open(h, '_system'); } }, true);
})();
