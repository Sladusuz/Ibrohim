const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#year').textContent = new Date().getFullYear();

/* header */
const header = $('#top');
const onScroll = () => header.classList.toggle('solid', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = $('#burger'), nav = $('#nav');
const setMenu = (o) => { nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
burger.onclick = () => setMenu(!nav.classList.contains('open'));
$$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

/* reveal on scroll + counters */
$$('.reveal').forEach((el, i) => el.style.setProperty('--d', (i % 4) * 0.08 + 's'));
const countUp = (el) => {
  const to = +el.dataset.count; if (reduce || !to) { el.textContent = to; return; }
  const t0 = performance.now();
  const step = (t) => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); $$('[data-count]', e.target).forEach(countUp); io.unobserve(e.target);
}), { threshold: 0.15 });
$$('.reveal').forEach((el) => io.observe(el));

/* bubbles canvas */
(() => {
  const c = $('#bubbles'), ctx = c.getContext('2d'); if (reduce) return;
  let w, h, bubbles = [], run = true;
  const size = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
  const make = (init) => ({ x: Math.random() * w, y: init ? Math.random() * h : h + 20, r: 2 + Math.random() * 9, v: 0.3 + Math.random() * 0.9, d: Math.random() * 6 });
  size(); addEventListener('resize', size);
  bubbles = Array.from({ length: Math.min(40, Math.floor(innerWidth / 25)) }, () => make(true));
  new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run) loop(); }).observe(c);
  function loop() {
    if (!run) return;
    ctx.clearRect(0, 0, w, h);
    for (const b of bubbles) {
      b.y -= b.v; b.d += 0.02; b.x += Math.sin(b.d) * 0.4;
      if (b.y < -20) Object.assign(b, make(false));
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283);
      ctx.strokeStyle = 'rgba(160,230,255,.5)'; ctx.fillStyle = 'rgba(160,230,255,.08)'; ctx.lineWidth = 1.2; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .2, 0, 6.283); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* 3D tilt on product */
(() => {
  const t = $('#tilt'), box = t.parentElement;
  if (reduce || matchMedia('(hover: none)').matches) return;
  box.addEventListener('mousemove', (e) => {
    const r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    t.style.animation = 'none'; t.style.transform = `perspective(700px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.03)`;
  });
  box.addEventListener('mouseleave', () => { t.style.transform = ''; t.style.animation = ''; });
})();

/* before / after */
const ba = $('#ba'), baRange = $('#baRange');
baRange.oninput = () => ba.style.setProperty('--pos', baRange.value + '%');

/* water quiz */
const opts = $$('#opts input'), bar = $('#meterBar'), txt = $('#resultText'), qbtn = $('#quizBtn');
const note = [
  'Muammolarni belgilang — natija shu yerda chiqadi.',
  'Aura Cebilon ko\'p bosqichli tozalash orqali shu muammoni hal qilishga yordam beradi.',
  'Bir nechta muammo bor — ko\'p bosqichli tizim aynan shunday suv uchun mos.',
  'Suv sifati e\'tibor talab qiladi. Mutaxassisimiz sizga eng to\'g\'ri yechimni aytadi.',
];
const quizUpdate = () => {
  const n = opts.filter((o) => o.checked).length;
  bar.style.width = Math.min(100, n * 18) + '%';
  txt.textContent = note[n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3];
  qbtn.disabled = !n;
};
opts.forEach((o) => o.addEventListener('change', quizUpdate));
qbtn.onclick = () => {
  const list = opts.filter((o) => o.checked).map((o) => o.value).join(', ');
  $('#msg').value = 'Suvdagi muammolar: ' + list + '. Maslahat kerak.';
  $('#apply').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  setTimeout(() => $('#form [name=name]').focus({ preventScroll: true }), 600);
};

/* phone mask */
const phone = $('#phone');
const fmt = (v) => {
  let d = v.replace(/\D/g, ''); if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return '+998' + (p.length ? ' ' + p.join(' ') : '');
};
phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+998 '; });
phone.addEventListener('input', () => { phone.value = fmt(phone.value); });
phone.addEventListener('blur', () => { if (phone.value.replace(/\D/g, '').length <= 3) phone.value = ''; });

/* form submit */
const form = $('#form'), st = $('#status');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('button', form); btn.disabled = true; st.className = ''; st.textContent = 'Yuborilmoqda...';
  try {
    const r = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error);
    form.reset(); st.className = 'ok'; st.textContent = '✅ Rahmat! Zayavkangiz qabul qilindi, tez orada bog\'lanamiz.';
  } catch (err) { st.className = 'err'; st.textContent = err.message || 'Xatolik. Qayta urinib ko\'ring.'; }
  btn.disabled = false;
});

/* chat assistant (client-side FAQ) */
(() => {
  const box = $('#chatbox'), msgs = $('#msgs'), quick = $('#quick'), input = $('#chatInput');
  const TEL = '<a href="tel:+998933303575">+998 93 330 35 75</a>';
  const A = {
    tolov: 'Foizsiz muddatli to\'lov mavjud 💳. Aniq shartlarni operator tushuntiradi: ' + TEL,
    yetkazish: 'Samarqand, Toshkent va Qarshi bo\'ylab yetkazib beramiz 🚚',
    demo: 'Demo xizmatimiz bor 🎬 — apparat ishlashini o\'zingiz ko\'rishingiz mumkin. Zayavka qoldiring, kelishamiz.',
    ornatish: 'Aura Cebilon oson o\'rnatiladi ⚙️ va foydalanish qulay. Batafsil: ' + TEL,
    narx: 'Aniq narx va to\'lov jadvali uchun qo\'ng\'iroq qiling: ' + TEL + ' yoki <a href="#apply">zayavka qoldiring</a>.',
    mahsulot: 'Aura Cebilon Pro — ko\'p bosqichli tozalash, hid/tuz/zang aralashmalaridan tozalaydi, mazali va bolalar uchun xavfsiz suv beradi. Dizayni ixcham 🏠',
    aloqa: 'Telefon: ' + TEL + '<br>Telegram bot: <a href="https://t.me/suvfiltersamarqand_bot">@suvfiltersamarqand_bot</a><br>Instagram: <a href="https://instagram.com/suv_filtir_samarqand">suv_filtir_samarqand</a>',
    zayavka: 'Zayavka qoldirish uchun <a href="#apply">shu yerga bosing</a> yoki Telegram botdan foydalaning 📝',
  };
  const rules = [
    [/(to'?lov|tulov|muddat|foiz|bo'?lib|rassrochka|kredit)/i, 'tolov'],
    [/(yetkaz|dostavka|shahar|toshkent|qarshi|samarqand|viloyat)/i, 'yetkazish'],
    [/(demo|ko'?rsat|sina|tekshir)/i, 'demo'],
    [/(o'?rnat|montaj|qur)/i, 'ornatish'],
    [/(narx|qancha|pul|so'?m|necha|summa)/i, 'narx'],
    [/(filtr|apparat|cebilon|aura|mahsulot|xususiyat|nima)/i, 'mahsulot'],
    [/(aloqa|telefon|raqam|nomer|manzil|adres|instagram|telegram)/i, 'aloqa'],
    [/(zayavka|buyurtma|olmoq|sotib|xohlayman|kerak)/i, 'zayavka'],
  ];
  const add = (html, who) => { const d = document.createElement('div'); d.className = 'm ' + who; d.innerHTML = html; msgs.append(d); msgs.scrollTop = msgs.scrollHeight; };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const reply = (key) => { const t = document.createElement('div'); t.className = 'm bot'; t.textContent = '...'; msgs.append(t); msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => { t.innerHTML = A[key] || 'Bu savol bo\'yicha operator aniq javob beradi: ' + TEL + ' yoki <a href="#apply">zayavka qoldiring</a>.'; msgs.scrollTop = msgs.scrollHeight; }, 450); };
  const chips = [['To\'lov', 'tolov'], ['Narx', 'narx'], ['Yetkazish', 'yetkazish'], ['Demo', 'demo'], ['Aloqa', 'aloqa']];
  chips.forEach(([l, k]) => { const b = document.createElement('button'); b.textContent = l; b.onclick = () => { add(l, 'me'); reply(k); }; quick.append(b); });
  const open = (o) => { box.hidden = !o; if (o && !msgs.children.length) add('Salom! 👋 Men Suv Filter yordamchisiman. Savolingizni yozing yoki pastdagi tugmalardan tanlang.', 'bot'); if (o) input.focus(); };
  $('#chatOpen').onclick = () => open(box.hidden);
  $('#chatClose').onclick = () => open(false);
  $('#chatForm').onsubmit = (e) => {
    e.preventDefault(); const v = input.value.trim(); if (!v) return;
    add(esc(v), 'me'); input.value = '';
    const hit = rules.find(([re]) => re.test(v)); reply(hit ? hit[1] : null);
  };
  addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
})();
