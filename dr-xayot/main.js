(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* split words */
  function splitWords(el, mode) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t.trim()) return frag.append(t);
          const w = document.createElement('span');
          w.className = 'w';
          if (mode === 'mask') w.innerHTML = `<span style="--i:${i++}">${t}</span>`;
          else { w.textContent = t; w.style.setProperty('--i', i++); }
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  }
  $$('.split').forEach(el => splitWords(el, 'mask'));
  $$('.mani').forEach(el => splitWords(el, 'fade'));

  /* loader */
  const loader = $('#loader'), num = $('#loadNum');
  let p = 0, started = false;
  const tick = () => {
    p = Math.min(100, p + 6 + Math.random() * 8);
    num.textContent = Math.floor(p);
    p < 100 ? setTimeout(tick, 40) : setTimeout(start, 200);
  };
  function start() {
    if (started) return; started = true;
    loader.classList.add('done');
    document.body.classList.add('ready');
    setTimeout(() => loader.remove(), 1200);
    observe();
  }
  tick();
  setTimeout(start, 3000);

  /* reveal + counters */
  function observe() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('.arch', e.target).forEach(a => a.classList.add('in'));
      $$('[data-count]', e.target).forEach(count);
      if (e.target.matches('[data-count]')) count(e.target);
      io.unobserve(e.target);
    }), { threshold: .12 });
    $$('.reveal,.split,.arch-wrap,.mani').forEach((el, i) => {
      if (el.closest('.hx')) { el.style.setProperty('--d', (.5 + i * .08) + 's'); setTimeout(() => { el.classList.add('in'); $$('[data-count]', el).forEach(count); }, 60); return; }
      io.observe(el);
    });
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, sep = 'sep' in el.dataset, t0 = performance.now(), d = 1400;
    const fmt = v => sep ? v.toLocaleString('ru-RU').replace(/ /g, ' ') : v;
    const f = t => {
      const k = Math.min(1, (t - t0) / d);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  /* nav + progress (no layout reads) */
  const nav = $('#nav'), prog = $('#progress'), links = $('#links'), dock = $('#dock');
  let lastY = 0, tick2 = false;
  const onScroll = () => {
    tick2 = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('solid', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 400 && !links.classList.contains('open'));
    lastY = y;
  };
  addEventListener('scroll', () => { if (!tick2) { tick2 = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  new IntersectionObserver(([e]) => dock.classList.toggle('hide', e.isIntersecting), { threshold: .25 }).observe($('#contact'));

  /* mobile menu */
  const burger = $('#burger');
  const toggle = o => {
    burger.setAttribute('aria-expanded', o);
    links.classList.toggle('open', o);
    document.body.style.overflow = o ? 'hidden' : '';
    nav.classList.remove('hide');
  };
  burger.onclick = () => toggle(burger.getAttribute('aria-expanded') !== 'true');
  $$('a', links).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  /* services: native horizontal scroll + arrows */
  const track = $('#svcTrack'), bar = $('#svcProg');
  const step = () => (track.firstElementChild?.getBoundingClientRect().width || 400) + 24;
  $('#svNext').onclick = () => track.scrollBy({ left: step(), behavior: 'smooth' });
  $('#svPrev').onclick = () => track.scrollBy({ left: -step(), behavior: 'smooth' });
  let st2 = false;
  track.addEventListener('scroll', () => {
    if (st2) return; st2 = true;
    requestAnimationFrame(() => { st2 = false; const m = track.scrollWidth - track.clientWidth; bar.style.transform = `scaleX(${m > 0 ? track.scrollLeft / m : 0})`; });
  }, { passive: true });

  /* play scene animations only while visible */
  const scIO = new IntersectionObserver(es => es.forEach(e => {
    const sc = e.target;
    if (e.isIntersecting) { sc.classList.remove('play'); void sc.offsetWidth; sc.classList.add('play'); }
    else sc.classList.remove('play');
  }), { threshold: .6 });
  $$('.sv-scene').forEach(s => scIO.observe(s));

  /* tooth lab */
  const data = [
    ['Kariyes', "Emal yemirilishidan boshlanadi. Dastlab qora dog' yoki shirinlikka sezgirlik bo'lishi mumkin. Erta davolansa, tishni to'liq saqlab qolish oson."],
    ['Gingivit', "Milkning yallig'lanishi: qizarish, shish va cho'tkalaganda qonash. Odatda professional tozalash va to'g'ri gigiena bilan ortga qaytadi."],
    ['Parodontit', "Tishni ushlab turuvchi to'qimalarning yallig'lanishi. Tishlar qimirlashi va milk pasayishiga olib kelishi mumkin — kechiktirmang."],
    ['Tish toshi', "Karash vaqt o'tib qotib, toshga aylanadi va uni uy sharoitida olib bo'lmaydi. Milk kasalliklarining asosiy sababi — professional tozalash yechim."]
  ];
  const info = $('#info');
  $$('.hot').forEach(b => b.addEventListener('click', () => {
    $$('.hot').forEach(x => x.classList.toggle('on', x === b));
    const [t, d] = data[b.dataset.k];
    $('#infoT').textContent = t; $('#infoP').textContent = d;
    info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
  }));

  /* before / after */
  const ba = $('#ba'), baR = $('#baR');
  baR.addEventListener('input', () => ba.style.setProperty('--x', baR.value + '%'));

  /* form → telegram */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = f.get('name').trim(), phone = f.get('phone').trim();
    const okPhone = phone.replace(/\D/g, '').length >= 9;
    form.name.classList.toggle('bad', !name);
    form.phone.classList.toggle('bad', !okPhone);
    if (!name || !okPhone) { note.style.color = '#ff9a9a'; note.textContent = "Iltimos, ism va telefon raqamini to'g'ri kiriting."; return; }
    const msg = `Assalomu alaykum, Dr. Xayot! Qabulga yozilmoqchiman.\nIsm: ${name}\nTelefon: ${phone}\nXizmat: ${f.get('svc')}`;
    note.style.color = ''; note.textContent = 'Telegram ochilmoqda…';
    open('https://t.me/dr_xayot?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  $('#yr').textContent = new Date().getFullYear();
})();
