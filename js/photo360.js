/*
 * Foto 360: bir mahsulotning turli tomondan olingan rasmlari bo'yicha aylantirib ko'rish.
 *   const v = BC.photo360.create(container, { images: [...], labels: ['Old','Yon','Orqa','Tepa'], onChange: (i) => {} });
 *   v.goTo(2); v.setPos(1.4) /* skroll bilan boshqarish uchun, kasr qiymat *\/ ; v.destroy();
 * Rasmlar orasida silliq o'tish (crossfade + yengil siljish). Sichqoncha/barmoq bilan suriladi.
 */
(function () {
  'use strict';
  window.BC = window.BC || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mod = (n, m) => ((n % m) + m) % m;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** URL rasmi yuklanadimi? (mavjud bo'lmasa false) */
  function probe(url, ms = 4500) {
    return new Promise((res) => { const i = new Image(); const t = setTimeout(() => res(false), ms); i.onload = () => { clearTimeout(t); res(true); }; i.onerror = () => { clearTimeout(t); res(false); }; i.src = url; });
  }

  function create(container, opts = {}) {
    const imgs = (opts.images || []).filter(Boolean), N = imgs.length; if (N < 2) return null;
    const labels = opts.labels || ['Old', 'Yon', 'Orqa', 'Tepa', 'Salon', 'Detal'];
    const root = document.createElement('div'); root.className = 'p360' + (opts.interactive === false ? ' static' : ''); root.tabIndex = 0; root.setAttribute('role', 'group'); root.setAttribute('aria-label', '360 daraja ko\'rinish: chapga yoki o\'ngga suring');
    root.innerHTML = imgs.map((u, i) => `<img class="f" src="${esc(u)}" alt="${esc(opts.alt || 'Mahsulot')}, ${esc(labels[i] || '')}" draggable="false" ${i ? 'loading="eager"' : 'fetchpriority="high"'} decoding="async">`).join('')
      + (opts.ui === false ? '' : `<span class="p360-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.700"/><path d="M21 4v5h-5"/></svg>360°</span>
        <span class="p360-label" aria-live="polite"></span><span class="p360-dots">${imgs.map((_, i) => `<i data-i="${i}"></i>`).join('')}</span>`);
    container.appendChild(root);
    const fr = [...root.querySelectorAll('.f')], lab = root.querySelector('.p360-label'), dots = [...root.querySelectorAll('.p360-dots i')];
    let pos = 0, target = 0, drag = null, idle = 0, alive = true, visible = true, last = performance.now(), cur = -1, auto = opts.autoplay !== false && !reduce, hold = 0;

    function render() {
      for (let i = 0; i < N; i++) {
        let d = i - pos; if (d > N / 2) d -= N; if (d < -N / 2) d += N;
        const a = Math.abs(d), o = Math.max(0, 1 - a * 1.25), el = fr[i];
        el.style.opacity = o.toFixed(3); el.style.zIndex = o > 0.5 ? 2 : 1;
        el.style.transform = o ? `translate3d(${(d * 9).toFixed(2)}%,0,0) scale(${(1 + a * 0.07).toFixed(3)})` : '';
        el.style.visibility = o ? 'visible' : 'hidden';
      }
      const k = mod(Math.round(pos), N); if (k !== cur) { cur = k; if (lab) lab.textContent = labels[k] || ''; dots.forEach((d2, i) => d2.classList.toggle('on', i === k)); opts.onChange && opts.onChange(k); }
    }
    function loop(now) {
      if (!alive) return; requestAnimationFrame(loop); const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!visible || document.hidden) return;
      if (!drag) {
        const diff = ((target - pos + N * 1.5) % N) - N / 2; // eng qisqa yo'nalish
        if (Math.abs(diff) > 0.0008) { pos = mod(pos + diff * (1 - Math.pow(0.0009, dt)), N); render(); } else if (pos !== target) { pos = target; render(); }
        idle += dt; if (auto && idle > 3.2 && !hold) { target = mod(Math.round(target) + 1, N); idle = 2.2; }
      }
    }
    render();

    const w = () => root.clientWidth || 1;
    root.addEventListener('pointerdown', (e) => { if (opts.interactive === false || e.button) return; drag = { x: e.clientX, p: pos, id: e.pointerId, moved: false }; root.setPointerCapture(e.pointerId); root.classList.add('grab'); idle = 0; });
    root.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; pos = mod(drag.p - (dx / w()) * 1.6 * (N > 3 ? 1 : 1.4), N); target = pos; render(); idle = 0; });
    const end = () => { if (!drag) return; const moved = drag.moved; drag = null; root.classList.remove('grab'); target = mod(Math.round(pos), N); idle = 0; if (moved) root.dataset.dragged = '1', setTimeout(() => delete root.dataset.dragged, 60); };
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
    root.addEventListener('click', (e) => { if (root.dataset.dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
    root.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { target = mod(Math.round(target) + 1, N); idle = 0; e.preventDefault(); } if (e.key === 'ArrowLeft') { target = mod(Math.round(target) - 1, N); idle = 0; e.preventDefault(); } });
    root.addEventListener('mouseenter', () => { hold = 1; }); root.addEventListener('mouseleave', () => { hold = 0; idle = 0; });
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { visible = es[0].isIntersecting; }) : null; io && io.observe(root);
    requestAnimationFrame(loop);

    return {
      el: root, count: N,
      goTo(i) { target = mod(i, N); idle = 0; },
      setPos(p, snap) { pos = target = mod(p, N); if (snap !== false) render(); hold = 1; },
      autoplay(on) { auto = on && !reduce; },
      index() { return cur; },
      destroy() { alive = false; io && io.disconnect(); root.remove(); },
    };
  }
  window.BC.photo360 = { create, probe };
})();
