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

// Muharrir (telefon): Tahrirlash / Ko'rish almashtirgich
(function () {
  const m = document.getElementById('mvt'); if (!m) return; document.body.dataset.view = 'edit';
  m.addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (!b) return; document.body.dataset.view = b.dataset.v; m.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); try { navigator.vibrate && navigator.vibrate(8); } catch { /* ixtiyoriy */ } });
  new MutationObserver(() => { if (document.body.dataset.mode !== 'editor') { document.body.dataset.view = 'edit'; m.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', i === 0)); } }).observe(document.body, { attributes: true, attributeFilter: ['data-mode'] });
})();
