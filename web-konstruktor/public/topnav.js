'use strict';
// Yuqori panel: telefonda havolalar burger-menyuga yig'iladi (yaratish, kabinet, bot sahifalari).
(function () {
  const h = document.querySelector('header.top'); if (!h) return;
  const mark = () => h.querySelectorAll('.tb').forEach((t) => t.classList.toggle('nv', !t.querySelector('.dev')));
  mark(); const b = document.createElement('button'); b.type = 'button'; b.className = 'burger'; b.setAttribute('aria-label', 'Menyu'); b.setAttribute('aria-expanded', 'false'); b.innerHTML = '<i></i><i></i><i></i>'; h.appendChild(b);
  const set = (on) => { h.classList.toggle('open', on); b.setAttribute('aria-expanded', String(on)); };
  b.addEventListener('click', (e) => { e.stopPropagation(); mark(); set(!h.classList.contains('open')); });
  document.addEventListener('click', (e) => { if (h.classList.contains('open') && !e.target.closest('.tb.nv')) set(false); else if (e.target.closest('.tb.nv .b')) setTimeout(() => set(false), 50); });
  window.addEventListener('resize', () => { if (innerWidth > 720) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();
