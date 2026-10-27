document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menu = $('#menu');
$('#burger').addEventListener('click', () => menu.classList.toggle('open'));
$$('#menu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

// gallery lightbox
const lb = $('#lb'), lbImg = $('img', lb);
$$('.g').forEach(g => g.addEventListener('click', () => { lbImg.src = g.dataset.src; lb.classList.add('on'); }));
lb.addEventListener('click', () => lb.classList.remove('on'));
addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('on'));

// pre-select model from card buttons
$$('[data-model]').forEach(b => b.addEventListener('click', () => { $('#model').value = b.dataset.model; }));

// form -> Telegram
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = `Assalomu alaykum! Buyurtma:\nIsm: ${f.get('name')}\nTelefon: ${f.get('phone')}\nModel: ${f.get('model')}\nXabar: ${f.get('msg') || '-'}`;
  window.open('https://t.me/+998888885582?text=' + encodeURIComponent(text), '_blank', 'noopener');
});

$('#yr').textContent = new Date().getFullYear();
