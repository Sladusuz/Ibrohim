'use strict';
// Yuqori panel: telefonda havolalar burger-menyuga yig'iladi (yaratish, kabinet, bot sahifalari).
(function () {
  const h = document.querySelector('header.top'); if (!h) return;
  const mark = () => h.querySelectorAll('.tb').forEach((t) => t.classList.toggle('nv', !t.querySelector('.dev')));
  mark(); const b = document.createElement('button'); b.type = 'button'; b.className = 'burger'; b.setAttribute('aria-label', 'Menyu'); b.setAttribute('aria-expanded', 'false'); b.innerHTML = '<i></i><i></i><i></i>'; h.appendChild(b);
  const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICO = { home: S('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'), bot: S('<path d="M22 3L2 11l7 3 3 7 3-5 7-13z"/><path d="M9 14l13-11"/>'), out: S('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>'), plus: S('<path d="M12 5v14M5 12h14"/>'), spark: S('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'), site: S('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/>') };
  const CH = '<svg class="mch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  const decorate = () => {
    h.querySelectorAll('.tb.nv').forEach((tb) => {
      let k = 0;
      tb.querySelectorAll('.b').forEach((el) => {
        el.style.setProperty('--k', k++);
        if (el.dataset.dec) return; el.dataset.dec = '1';
        const href = el.getAttribute('href') || '', raw = el.textContent.replace(/^[←→\s]+/, '').trim();
        let ic = ICO.spark, sub = '', cls = '';
        if (/kabinet/.test(href)) { ic = esc1((raw[0] || '?').toUpperCase()); sub = "Kabinetga o'tish: saytlar va buyurtmalar"; cls = 'mprof'; }
        else if (/bot\.html/.test(href)) { ic = ICO.bot; sub = 'Telegram sotuv botini yarating'; }
        else if (href === '/' || /^\/(index\.html)?$/.test(href)) { ic = ICO.home; sub = 'Asosiy sahifaga qaytish'; }
        else if (/yaratish/.test(href)) { ic = ICO.plus; sub = "Shablon tanlab, o'zingiz yarating"; }
        else if (/chiqish/i.test(raw)) { ic = ICO.out; sub = 'Hisobdan chiqish'; cls = 'mout'; }
        if (cls) el.classList.add(cls);
        el.innerHTML = `<i class="mi">${ic}</i><span class="ml"><b>${esc1(raw)}</b>${sub ? `<small>${sub}</small>` : ''}</span>${CH}`;
      });
      if (!tb.querySelector('.mfoot')) { const f = document.createElement('div'); f.className = 'mfoot'; f.innerHTML = 'Impro IT · <a href="https://improuzbekiston.uz">improuzbekiston.uz</a><br>Savol bo\'lsa: <a href="https://t.me/improsupport_bot" target="_blank" rel="noopener">@improsupport_bot</a>'; tb.appendChild(f); }
    });
  };
  function esc1(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const set = (on) => { if (on) { decorate(); h.style.setProperty('--thh', h.offsetHeight + 'px'); } h.classList.toggle('open', on); document.body.classList.toggle('menu-open', on); b.setAttribute('aria-expanded', String(on)); };
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
