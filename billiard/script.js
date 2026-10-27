document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* nav */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
$('#burger').addEventListener('click', () => nav.classList.toggle('open'));
$$('#menu a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

/* reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .1 });
$$('.sec-head,.model,.parts li,.calc,.svc>div,.steps li,details,.contacts,.form,.g').forEach(el => { el.classList.add('reveal'); io.observe(el); });

/* hero slideshow */
const slides = $$('.slide');
let si = 0;
if (slides.length > 1) setInterval(() => {
  slides[si].classList.remove('on');
  si = (si + 1) % slides.length;
  slides[si].classList.add('on');
}, 5500);

/* lightbox */
const imgs = $$('.g img').map(i => ({ src: i.getAttribute('src'), alt: i.alt }));
const lb = $('#lb'), lbImg = $('img', lb);
let li = 0;
const show = i => { li = (i + imgs.length) % imgs.length; lbImg.src = imgs[li].src; lbImg.alt = imgs[li].alt; lb.classList.add('on'); };
$$('.g').forEach(g => g.addEventListener('click', () => show(+g.dataset.i)));
$('.lb-x').addEventListener('click', () => lb.classList.remove('on'));
$('.lb-p').addEventListener('click', e => { e.stopPropagation(); show(li - 1); });
$('.lb-n').addEventListener('click', e => { e.stopPropagation(); show(li + 1); });
lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('on'); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('on')) return;
  if (e.key === 'Escape') lb.classList.remove('on');
  if (e.key === 'ArrowLeft') show(li - 1);
  if (e.key === 'ArrowRight') show(li + 1);
});

/* preselect model */
$$('[data-model]').forEach(b => b.addEventListener('click', () => { $('#model').value = b.dataset.model; }));

/* i18n */
const RU = {
  logo1: 'Бильярд', logo2: 'Производство',
  n_models: 'Столы', n_calc: 'Калькулятор', n_services: 'Услуги', n_gallery: 'Галерея', n_faq: 'Вопросы', n_contact: 'Контакты',
  h_tag: 'Самарканд · доставка по всему Узбекистану',
  h_h1: 'Стол, где начинается <em>игра</em>',
  h_p: 'Снукерные и бильярдные столы мы производим сами в Самарканде. Дизайн выбираете вы, доставку и установку делаем мы.',
  h_b1: 'Заказать', h_b2: 'Подобрать стол для комнаты',
  f1: 'футов, размеры', f2b: 'Своё', f2: 'производство', f3b: 'Доставка', f3: 'и установка', f4b: 'Свой', f4: 'цвет и дизайн',
  m_eb: 'Каталог', m_h: 'Три основных <em>стиля</em>',
  m_p: 'Это самые заказываемые варианты. Если нужен другой цвет, ножки или декор, изготовим под ваш интерьер.',
  chip1: 'Чаще всего выбирают', chip2: 'Современный', chip3: 'Минимализм',
  m1p: 'Рама в чёрном лаке, золотистая резная панель и золотые ножки с резьбой. Отлично смотрится в клубах, VIP-залах и ресторанах.',
  m2p: 'Белый лак и серебристый узор. Даёт чистый, лёгкий вид светлым интерьерам, кафе и домашним бильярдным.',
  m3p: 'Квадратные ножки-колонны и чёрно-белый контраст. Для современных интерьеров с чёткими линиями.',
  d_type: 'Тип', d_size: 'Размер', d_frame: 'Рама', d_legs: 'Ножки',
  m1f: 'Чёрный лак', m1l: 'Золотые, резные', m2f: 'Белый лак', m2l: 'Белые, рифлёные', m3f: 'Чёрный лак', m3l: 'Белые, квадратные',
  ask: 'Узнать цену',
  a_eb: 'Из чего состоит качество', a_h: 'Хороший стол определяет то, что <em>внутри</em>',
  a_p: 'Качество игры зависит от скрытых деталей: прочности рамы, ровности плиты и натяжения сукна.',
  p1: 'Прочная рама', p1s: 'Она не должна терять форму годами, поэтому собираем её основательно.',
  p2: 'Ровная плита', p2s: 'Игровая поверхность лежит на каменной плите и выставляется по уровню.',
  p3: 'Профессиональное сукно', p3s: 'Сукно натягивается ровно, чтобы шар катился прямо и с одинаковой скоростью.',
  p4: 'Регулируемые опоры', p4s: 'Даже на неровном полу стол можно выставить строго горизонтально.',
  p5: 'Лузы и углы', p5s: 'Кожаные или сетчатые лузы и металлические накладки подбираются под интерьер.',
  c_eb: 'Калькулятор', c_h: 'Какой стол <em>поместится</em> в вашу комнату?',
  c_p: 'Введите размеры комнаты. Вокруг стола нужно место для кия, его мы и посчитаем.',
  c_note: 'Результат приблизительный. Точные размеры подтвердим по телефону.',
  c_len: 'Длина комнаты, м', c_wid: 'Ширина комнаты, м',
  s_eb: 'Услуги', s_h: 'От заказа <em>до первой партии</em>',
  s1: 'Производство', s1p: 'Раму, плиту, борта и декор делаем в собственном цехе.',
  s2: 'Доставка', s2p: 'Привезём в Самарканд и во все области Узбекистана.',
  s3: 'Установка', s3p: 'Мастера соберут стол на месте, выставят по уровню и натянут сукно.',
  s4: 'Аксессуары', s4p: 'Кии, шары, треугольник, мел и освещение в одном месте.',
  s5: 'Замена сукна', s5p: 'Обновим изношенное сукно, восстановим борта и лузы.',
  s6: 'Проект клуба', s6p: 'Подскажем план зала, расстановку столов и освещение.',
  g_eb: 'Галерея', g_h: 'Столы, <em>установленные</em> клиентам', g_p: 'Нажмите на фото, чтобы увеличить.',
  g_ig: 'Больше работ в Instagram →',
  pr_eb: 'Процесс', pr_h: 'Как мы <em>работаем</em>',
  st1: 'Звонок', st1p: 'Рассказываете о комнате и задаче.',
  st2: 'Выбор', st2p: 'Согласуем модель, цвет и цену.',
  st3: 'Производство', st3p: 'Стол изготавливается по вашему заказу.',
  st4: 'Доставка', st4p: 'Аккуратно привозим по адресу.',
  st5: 'Установка', st5p: 'Собираем и выставляем. Можно играть.',
  q_eb: 'Вопросы и ответы', q_h: 'Частые <em>вопросы</em>',
  q1: 'Сколько места нужно для стола?', q1a: 'Для снукерного стола 12 футов нужна комната не меньше примерно 6,5 × 4,5 м. Для комфортной игры лучше больше. Калькулятор выше всё посчитает.',
  q2: 'Есть ли доставка и установка?', q2a: 'Да, обе услуги есть. Цена зависит от адреса, поэтому позвоните и уточните.',
  q3: 'Можно выбрать цвет и дизайн?', q3a: 'Да. Цвет рамы, форму ножек, цвет сукна и узор выбираете вы.',
  q4: 'Ремонтируете старые столы?', q4a: 'Да. Меняем сукно, восстанавливаем борта и лузы, заново регулируем стол.',
  q5: 'Доставляете в другие области?', q5a: 'Да, доставляем по всему Узбекистану.',
  k_eb: 'Контакты', k_h: 'Закажите или получите <em>консультацию</em>',
  k_p: 'Позвоните или заполните форму. Быстро ответим в Telegram.',
  k_tel: 'Телефон', k_copy: 'Копировать', k_addr: 'Адрес', k_addrv: 'Самарканд, Узбекистан', k_msg: 'Написать',
  k_name: 'Ваше имя', k_phone: 'Телефон', k_model: 'Модель', k_other: 'Другое / индивидуальный дизайн',
  k_text: 'Сообщение', k_ph: 'Размер, город, пожелания',
  k_send: 'Отправить в Telegram', k_hint: 'После нажатия откроется Telegram с готовым сообщением.'
};
$$('[data-t]').forEach(el => { el.dataset.uz = el.innerHTML; });
$$('[data-tp]').forEach(el => { el.dataset.uzp = el.placeholder; });
let lang = 'uz';
function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  $$('[data-t]').forEach(el => { el.innerHTML = l === 'ru' && RU[el.dataset.t] ? RU[el.dataset.t] : el.dataset.uz; });
  $$('[data-tp]').forEach(el => { el.placeholder = l === 'ru' ? RU[el.dataset.tp] : el.dataset.uzp; });
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  try { localStorage.setItem('lang', l); } catch (e) {}
  calc();
}
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* room calculator (approximate outer table sizes, metres) */
const T = { 12: [3.85, 1.95], 10: [3.30, 1.73], 9: [2.95, 1.62] };
const MIN = 1.25, COMF = 1.5;
let size = 12;
const fmt = n => n.toFixed(1).replace('.', lang === 'ru' ? ',' : ',');
function calc() {
  const L = Math.max(parseFloat($('#rl').value) || 0, parseFloat($('#rw').value) || 0);
  const W = Math.min(parseFloat($('#rl').value) || 0, parseFloat($('#rw').value) || 0);
  const [tl, tw] = T[size];
  const minL = tl + 2 * MIN, minW = tw + 2 * MIN, cL = tl + 2 * COMF, cW = tw + 2 * COMF;
  const v = $('#verdict');
  let cls, txt;
  if (L >= cL && W >= cW) { cls = 'ok'; txt = lang === 'ru' ? 'Стол ' + size + ' фт поместится свободно' : size + ' futlik stol erkin sig\'adi'; }
  else if (L >= minL && W >= minW) { cls = 'mid'; txt = lang === 'ru' ? 'Поместится, но в некоторых ударах будет тесно' : 'Sig\'adi, lekin ba\'zi zarbalarda torroq bo\'ladi'; }
  else { cls = 'no'; txt = lang === 'ru' ? 'Для этого стола комната мала' : 'Bu stol uchun xona kichik'; }
  v.className = 'verdict ' + cls; v.textContent = txt;
  $('#need').innerHTML = lang === 'ru'
    ? `Размер стола (снаружи): около <b>${fmt(tl)} × ${fmt(tw)} м</b><br>Минимум для комнаты: <b>${fmt(minL)} × ${fmt(minW)} м</b><br>Комфортно: <b>${fmt(cL)} × ${fmt(cW)} м</b>`
    : `Stol o'lchami (tashqi): taxminan <b>${fmt(tl)} × ${fmt(tw)} m</b><br>Xona uchun minimum: <b>${fmt(minL)} × ${fmt(minW)} m</b><br>Qulay o'ynash uchun: <b>${fmt(cL)} × ${fmt(cW)} m</b>`;
  const rin = $('#roomIn');
  const scale = Math.min(100 / Math.max(L, 1), 100 / Math.max(W, 1));
  rin.style.aspectRatio = (Math.max(L, 1) / Math.max(W, 1)).toFixed(3);
  const ts = $('#roomTable');
  ts.style.width = Math.min(95, tl / Math.max(L, .1) * 100) + '%';
  ts.style.height = Math.min(95, tw / Math.max(W, .1) * 100) + '%';
  ts.style.borderColor = cls === 'no' ? '#b33' : '#3a2a12';
}
$$('#sizes button').forEach(b => b.addEventListener('click', () => {
  size = +b.dataset.size;
  $$('#sizes button').forEach(x => x.classList.toggle('on', x === b));
  calc();
}));
['rl', 'rw'].forEach(id => $('#' + id).addEventListener('input', calc));

/* copy phone */
$('#copy').addEventListener('click', async e => {
  const b = e.currentTarget, old = b.textContent;
  try { await navigator.clipboard.writeText('+998888885582'); b.textContent = '✓'; } catch (err) { b.textContent = '+998888885582'; }
  setTimeout(() => { b.textContent = old; }, 1800);
});

/* form -> Telegram */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = `Assalomu alaykum! Buyurtma:\nIsm: ${f.get('name')}\nTelefon: ${f.get('phone')}\nModel: ${f.get('model')}\nXabar: ${f.get('msg') || '-'}`;
  window.open('https://t.me/+998888885582?text=' + encodeURIComponent(text), '_blank', 'noopener');
});

$('#yr').textContent = new Date().getFullYear();
let saved = null;
try { saved = localStorage.getItem('lang'); } catch (e) {}
if (saved === 'ru') setLang('ru'); else calc();
