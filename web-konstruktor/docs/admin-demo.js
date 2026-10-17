'use strict';
// Admin panel DEMO rejimi: server o'rniga brauzer ichidagi namunaviy ma'lumot ishlatiladi.
// Hamma narsani bosib ko'rish mumkin; o'zgarishlar faqat shu sahifa ochiq turguncha saqlanadi.
(function () {
  const realFetch = window.fetch.bind(window);
  const now = Date.now(), D = 864e5, H = 36e5;
  const iso = (ms) => new Date(now - ms).toISOString();
  const rid = () => Math.random().toString(16).slice(2, 10);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const users = [
    { id: 'u1', name: 'Aziz Karimov', phone: '+998 90 123 45 67', email: 'aziz@baraka.uz', createdAt: iso(21 * D) },
    { id: 'u2', name: 'Dilnoza Rahimova', phone: '+998 91 234 56 78', email: 'dilnoza@lola.uz', createdAt: iso(14 * D) },
    { id: 'u3', name: 'Jasur Tursunov', phone: '+998 93 345 67 89', email: '', createdAt: iso(9 * D) },
    { id: 'u4', name: 'Madina Qodirova', phone: '+998 94 456 78 90', email: 'madina@clinic.uz', createdAt: iso(6 * D) },
    { id: 'u5', name: 'Bobur Yusupov', phone: '+998 95 567 89 01', email: 'bobur@gym.uz', createdAt: iso(3 * D) },
    { id: 'u6', name: 'Sevara Ahmedova', phone: '+998 97 678 90 12', email: '', createdAt: iso(1 * D) },
  ];
  const uname = Object.fromEntries(users.map((u) => [u.id, u.name]));
  const briefExtra = { Xizmat: "Onlayn do'kon", 'Biznes nomi': 'Baraka Market', Soha: 'Savdo', 'Imkoniyatlar': "Admin panel, Onlayn to'lov (Click, Payme), Telegram xabarnoma", Uslub: 'Zamonaviy neon', 'Taxminiy narx': "9 200 000 so'm dan", Muddat: '1 oy', 'Aloqa usuli': 'Telegram', 'Qulay vaqt': '12:00–17:00' };
  const orders = [
    { id: 'a1b2c3d4', date: iso(25 * 60e3), type: 'brief', name: 'Aziz Karimov', phone: '+998 90 123 45 67', userId: 'u1', message: "Do'konimiz uchun sayt va Telegram bot kerak. Raqobatchilardan ajralib turadigan dizayn xohlaymiz.", items: [], extra: briefExtra, shipping: 0, total: 0, status: 'yangi', note: '' },
    { id: 'b2c3d4e5', date: iso(2 * H), type: 'booking', name: 'Dilnoza Rahimova', phone: '+998 91 234 56 78', userId: 'u2', message: "Tushlikka stol band qilmoqchiman", items: [], extra: { Xizmat: 'Oilaviy stol', Sana: '2026-10-20', Vaqt: '19:00', Mehmonlar: '6' }, shipping: 0, total: 0, status: 'yangi', note: '' },
    { id: 'c3d4e5f6', date: iso(5 * H), type: 'order', name: 'Jasur Tursunov', phone: '+998 93 345 67 89', userId: 'u3', message: '', items: [{ id: 'p1', name: 'Smartfon X12 Pro', price: 5490000, qty: 1 }, { id: 'p2', name: 'Simsiz quloqchin Air', price: 549000, qty: 2 }], extra: { Manzil: 'Toshkent, Chilonzor 12', "To'lov": 'Karta orqali' }, shipping: 25000, total: 6613000, status: 'jarayonda', note: "Ertaga 14:00 da yetkazish" },
    { id: 'd4e5f6a7', date: iso(1 * D + 3 * H), type: 'message', name: 'Madina Qodirova', phone: '+998 94 456 78 90', userId: 'u4', message: "Klinika uchun bron tizimi qancha turadi?", items: [], extra: {}, shipping: 0, total: 0, status: 'bajarildi', note: "Narx aytildi, 3 kunda javob beradi" },
    { id: 'e5f6a7b8', date: iso(1 * D + 9 * H), type: 'order', name: 'Bobur Yusupov', phone: '+998 95 567 89 01', userId: 'u5', message: '', items: [{ id: 'p3', name: 'Paxta futbolka Classic', price: 129000, qty: 3 }], extra: { Manzil: "Samarqand, Registon ko'chasi 4", "To'lov": 'Naqd pul' }, shipping: 25000, total: 412000, status: 'bajarildi', note: '' },
    { id: 'f6a7b8c9', date: iso(2 * D), type: 'brief', name: 'Sevara Ahmedova', phone: '+998 97 678 90 12', userId: 'u6', message: "Salonimiz uchun yozilish tizimi bor sayt kerak.", items: [], extra: { Xizmat: 'Vizitka / korporativ sayt', 'Biznes nomi': 'Lola Beauty', Soha: "Go'zallik", 'Taxminiy narx': "3 600 000 so'm dan", Muddat: '2–3 hafta', 'Aloqa usuli': 'Telefon' }, shipping: 0, total: 0, status: 'jarayonda', note: '' },
    { id: 'a7b8c9d0', date: iso(3 * D), type: 'order', name: 'Dilnoza Rahimova', phone: '+998 91 234 56 78', userId: 'u2', message: '', items: [{ id: 'p4', name: 'Aqlli soat Fit 3', price: 890000, qty: 1 }], extra: { Manzil: 'Toshkent, Yunusobod', "To'lov": 'Karta orqali' }, shipping: 0, total: 890000, status: 'bekor', note: 'Mijoz fikridan qaytdi' },
    { id: 'b8c9d0e1', date: iso(4 * D), type: 'message', name: 'Jasur Tursunov', phone: '+998 93 345 67 89', userId: 'u3', message: 'Salom, saytni qachon boshlaymiz?', items: [], extra: {}, shipping: 0, total: 0, status: 'bajarildi', note: '' },
  ];
  const projects = [
    { id: 'p100001', userId: 'u2', name: 'Lola Beauty', template: 'salon', status: 'joylandi', plan: "To'liq xizmat", price: "1 200 000 so'm", note: 'Domen lolabeauty.uz', adminNote: 'Tayyor, joylandi', createdAt: iso(13 * D), updatedAt: iso(2 * D), submittedAt: iso(10 * D), contactPhone: '+998 91 234 56 78', paid: { at: iso(10 * D), usd: 10, uzs: 128000, method: 'payme', paymentId: 'x1' }, published: true, slug: 'lola-beauty', customDomain: 'lolabeauty.uz' },
    { id: 'p100002', userId: 'u4', name: 'MedLife Clinic', template: 'klinika', status: 'narx', plan: 'Joylash va domen', price: "900 000 so'm", note: '', adminNote: '3 kunda tayyor bo\'ladi', createdAt: iso(5 * D), updatedAt: iso(1 * D), submittedAt: iso(4 * D), contactPhone: '+998 94 456 78 90', paid: { at: iso(4 * D), usd: 10, uzs: 128000, method: 'click', paymentId: 'x2' }, published: true, slug: 'medlife', customDomain: '' },
    { id: 'p100003', userId: 'u5', name: 'Power Gym', template: 'fitness', status: 'yuborilgan', plan: "To'liq xizmat", price: '', note: "Reklama uchun landing ham kerak", adminNote: '', createdAt: iso(3 * D), updatedAt: iso(3 * H), submittedAt: iso(3 * H), contactPhone: '+998 95 567 89 01', paid: null, published: false, slug: '', customDomain: '' },
    { id: 'p100004', userId: 'u1', name: 'Baraka Market', template: 'market', status: 'korilmoqda', plan: "To'liq xizmat", price: '', note: "Mahsulotlar 300 ta bo'ladi", adminNote: '', createdAt: iso(7 * D), updatedAt: iso(1 * H), submittedAt: iso(2 * D), contactPhone: '+998 90 123 45 67', paid: null, published: false, slug: '', customDomain: '' },
    { id: 'p100005', userId: 'u3', name: 'Dasturxon', template: 'restoran', status: 'qoralama', plan: '', price: '', note: '', adminNote: '', createdAt: iso(2 * D), updatedAt: iso(2 * D), submittedAt: '', contactPhone: '', paid: null, published: false, slug: '', customDomain: '' },
    { id: 'p100006', userId: 'u6', name: 'Sevara Studio', template: 'dizayner', status: 'qoralama', plan: '', price: '', note: '', adminNote: '', createdAt: iso(1 * D), updatedAt: iso(1 * D), submittedAt: '', contactPhone: '', paid: null, published: false, slug: '', customDomain: '' },
  ];
  const bots = [
    { id: 'b1000001', name: 'Baraka do\'koni', username: 'baraka_market_bot', status: 'faol', owner: 'Aziz Karimov', phone: '+998 90 123 45 67', subscribers: 248, orders: 37, webhook: true, miniApp: true, createdAt: iso(12 * D) },
    { id: 'b1000002', name: 'Lola Beauty', username: 'lola_beauty_bot', status: 'faol', owner: 'Dilnoza Rahimova', phone: '+998 91 234 56 78', subscribers: 91, orders: 12, webhook: true, miniApp: false, createdAt: iso(5 * D) },
  ];
  let pricing = { currency: "so'm", templatePrice: { usd: 10, rate: 12800 }, plans: [
    { id: 'pl1', name: 'Joylash', price: '350 000', period: 'bir martalik', popular: false, features: ['Sayt serverga joylanadi', 'Subdomen', 'SSL sertifikat'] },
    { id: 'pl2', name: "To'liq xizmat", price: '1 200 000', period: 'bir martalik', popular: true, features: ["Domen va hosting 1 yil", 'Dizaynni sozlash', 'Matn va rasmlar bilan yordam', '6 oy yordam'] },
    { id: 'pl3', name: 'Obuna', price: '120 000', period: 'oyiga', popular: false, features: ['Hosting va yordam', 'Zaxira nusxa', 'Kichik tuzatishlar'] },
  ] };
  let settings = { notify: { telegramBotToken: '', telegramChatId: '' }, allowedOrigins: [], envAllowed: '', domains: ['improuzbekiston.uz'], envDomain: '', manualPay: "Karta: 8600 0000 0000 0000 (Impro IT). To'lovdan keyin chekni Telegramga yuboring.", ai: { hasKey: false, model: '' }, payments: { payme: { merchantId: '', hasKey: false }, click: { serviceId: '', merchantId: '', hasSecret: false } }, adminBot: { hasToken: false, connected: false, chats: [] }, webhooks: { payme: 'https://improuzbekiston.uz/api/pay/payme', click: 'https://improuzbekiston.uz/api/pay/click' } };
  let site = {
    v: 2, template: 'impro', company: { name: 'Impro IT', logo: 'I', tagline: 'Veb-sayt, mobil ilova va Telegram botlar.' },
    theme: { preset: 'dark', accent: '', accent2: '', font: 'display', radius: 'round', bg: 'plain', heads: 'left', switcher: false, look: 'cinema', motion: true }, nav: { style: 'pill', cta: 'Bepul maslahat', ctaLink: '#aloqa', search: false },
    announce: { enabled: false, text: '', link: '' }, orders: { enabled: true, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 }, account: { enabled: false }, contacts: { phone: '+998 33 623 33 13', email: 'chempme@gmail.com', address: 'Toshkent', hours: 'Dush–Shan, 9:00–18:00' }, footer: { text: 'Barcha huquqlar himoyalangan.', links: [] },
    sections: [
      { id: 'bosh', type: 'hero', enabled: true, navLabel: '', layout: 'aurora', fx: 'aurora', badge: 'Yangi loyihalar uchun ochiqmiz', titleStart: 'Biznesingiz uchun *kelajak* saytlari', words: [], titleEnd: '', text: "Veb-sayt, mobil ilova va Telegram botlarni g'oyadan ishga tushirishgacha yaratamiz.", cta1Text: 'Loyihani boshlash', cta1Link: '#aloqa', cta2Text: '', cta2Link: '#', visual: 'none', image: '', windowLines: [], chips: [], collage: [], trust: [{ value: '120+', label: 'loyiha' }, { value: '8 yil', label: 'tajriba' }] },
      { id: 'narx', type: 'products', enabled: true, navLabel: 'Narxlar', eyebrow: 'Narxlar', title: 'Tayyor paketlar', text: '', mode: 'none', buttonText: '', columns: '3', search: false, filters: false, items: [
        { id: 'start', name: 'Start sayt', price: 2500000, oldPrice: 0, category: 'Veb-sayt', badge: '', description: '5 sahifagacha vizitka sayt', image: '/img/p/dasturchi-2.jpg', stock: '', active: true },
        { id: 'dokon', name: "Onlayn do'kon", price: 6900000, oldPrice: 0, category: 'Veb-sayt', badge: "ENG KO'P TANLANADI", description: "Katalog, savat va admin panel", image: '/img/p/elektronika-2.jpg', stock: '', active: true },
        { id: 'bot', name: 'Telegram bot', price: 3200000, oldPrice: 0, category: 'Bot', badge: '', description: "Buyurtma qabul qiluvchi bot", image: '/img/p/ilova-3.jpg', stock: '', active: true }] },
      { id: 'savol', type: 'faq', enabled: true, navLabel: '', eyebrow: 'Savollar', title: "Ko'p so'raladigan *savollar*", text: '', items: [{ q: "Loyiha qancha vaqtda tayyor bo'ladi?", a: 'Vizitka sayt 1–2 hafta, onlayn do\'kon 3–5 hafta.' }, { q: 'Narx qanday hisoblanadi?', a: "Loyiha hajmiga qarab. Anketani to'ldirsangiz, aniq narx aytamiz." }] },
      { id: 'aloqa', type: 'contact', enabled: true, navLabel: 'Aloqa', eyebrow: 'Aloqa', title: 'Biz bilan *bog\'laning*', text: 'Raqamingizni qoldiring.', form: 'message', serviceOptions: [], askGuests: false, askAddress: false, payOptions: [], submitText: 'Yuborish', mapUrl: '' },
    ],
  };
  const daySeries = (vals) => vals;
  const stats = () => ({
    orders: { total: orders.length, new: orders.filter((o) => o.status === 'yangi').length, sum: orders.filter((o) => o.status !== 'bekor').reduce((a, o) => a + (o.total || 0), 0), series: daySeries([1, 0, 2, 1, 3, 2, 1, 4, 2, 3, 5, 2, 3, orders.length]) },
    users: { total: users.length, series: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1] },
    projects: { total: projects.length, submitted: projects.filter((p) => p.status === 'yuborilgan').length, series: [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], paid: projects.filter((p) => p.paid).length, published: projects.filter((p) => p.published).length },
    revenue: { usd: projects.filter((p) => p.paid).reduce((a, p) => a + p.paid.usd, 0) + 130, uzs: projects.filter((p) => p.paid).reduce((a, p) => a + p.paid.uzs, 0) + 1664000 },
  });
  const withUser = (p) => { const u = users.find((x) => x.id === p.userId); return { ...p, user: u ? { name: u.name, phone: u.phone, email: u.email } : null }; };

  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (!/^\/api\/admin\//.test(url)) return realFetch(input, init);
    const method = ((init && init.method) || 'GET').toUpperCase();
    let body = {}; try { body = init && init.body ? JSON.parse(init.body) : {}; } catch (e) { body = {}; }
    const path = url.split('?')[0], q = new URLSearchParams(url.split('?')[1] || '');
    let m;
    if (path === '/api/admin/login' || path === '/api/admin/logout' || path === '/api/admin/password') return json({ ok: true });
    if (path === '/api/admin/stats') return json(stats());
    if (path === '/api/admin/site') { if (method === 'PUT') { site = clone(body); return json({ ok: true }); } return json(clone(site)); }
    if (path === '/api/admin/upload') return json({ url: body.data });
    if (path === '/api/admin/orders') {
      if (method === 'GET') return json(orders.map((o) => ({ ...o, userName: uname[o.userId] || '' })));
      if (method === 'PUT') { const o = orders.find((x) => x.id === body.id); if (o) { if (['yangi', 'jarayonda', 'bajarildi', 'bekor'].includes(body.status)) o.status = body.status; if (typeof body.note === 'string') o.note = body.note; } return json({ ok: true }); }
      if (method === 'DELETE') { const i = orders.findIndex((x) => x.id === q.get('id')); if (i >= 0) orders.splice(i, 1); return json({ ok: true }); }
    }
    if (path === '/api/admin/projects') return json(projects.map(withUser));
    if ((m = /^\/api\/admin\/projects\/([\w]+)$/.exec(path))) {
      const p = projects.find((x) => x.id === m[1]); if (!p) return json({ error: 'Topilmadi' }, 404);
      if (method === 'GET') return json({ project: p, data: clone(site) });
      if (method === 'PUT') {
        if (body.status) p.status = body.status; if (typeof body.price === 'string') p.price = body.price; if (typeof body.adminNote === 'string') p.adminNote = body.adminNote;
        if (typeof body.paid === 'boolean') { p.paid = body.paid ? { at: new Date().toISOString(), usd: 10, uzs: 128000, method: 'manual', paymentId: rid() } : null; if (!body.paid) p.published = false; }
        return json({ project: p });
      }
      if (method === 'DELETE') { projects.splice(projects.indexOf(p), 1); return json({ ok: true }); }
    }
    if (path === '/api/admin/users') return json(users.map((u) => ({ ...u, orders: orders.filter((o) => o.userId === u.id).length, projects: projects.filter((p) => p.userId === u.id).length })));
    if ((m = /^\/api\/admin\/users\/([\w]+)$/.exec(path))) {
      const u = users.find((x) => x.id === m[1]); if (!u) return json({ error: 'Topilmadi' }, 404);
      if (method === 'GET') return json({ user: u, orders: orders.filter((o) => o.userId === u.id), projects: projects.filter((p) => p.userId === u.id) });
      if (method === 'DELETE') { users.splice(users.indexOf(u), 1); return json({ ok: true }); }
    }
    if (path === '/api/admin/pricing') { if (method === 'PUT') { pricing = Object.assign(pricing, clone(body)); return json({ ok: true }); } return json(clone(pricing)); }
    if (path === '/api/admin/settings') {
      if (method === 'PUT') { settings = Object.assign(settings, { notify: body.notify || settings.notify, allowedOrigins: body.allowedOrigins || [], domains: body.domains || [], manualPay: body.manualPay || '' }); return json({ ok: true }); }
      return json(clone(settings));
    }
    if (path === '/api/admin/bots') return json(clone(bots));
    if ((m = /^\/api\/admin\/bots\/([\w]+)$/.exec(path)) && method === 'DELETE') { const i = bots.findIndex((x) => x.id === m[1]); if (i >= 0) bots.splice(i, 1); return json({ ok: true }); }
    if (path === '/api/admin/adminbot/connect') { settings.adminBot = { hasToken: true, connected: true, chats: [{ id: 1, name: 'Demo admin @demo', at: new Date().toISOString() }] }; return json({ ok: true, status: settings.adminBot }); }
    if (path === '/api/admin/adminbot/revoke') { settings.adminBot.chats = []; return json({ ok: true, status: settings.adminBot }); }
    if (path === '/api/admin/payments') return json([]);
    return json({ error: 'Demo rejimida mavjud emas' }, 404);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const r = document.createElement('div');
    r.textContent = "DEMO: namunaviy ma'lumotlar, o'zgarishlar saqlanmaydi";
    r.style.cssText = 'position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:9999;background:#f59e0b;color:#1f1300;font:700 12px/1 system-ui,sans-serif;padding:7px 14px;border-radius:99px;box-shadow:0 6px 20px #0004;pointer-events:none;white-space:nowrap';
    document.body.appendChild(r);
  });
})();
