/*
 * Ma'lumotlar qatlami. Sayt va admin panel faqat BC.api bilan ishlaydi.
 * Supabase sozlangan bo'lsa bulutli bazaga, aks holda brauzer xotirasiga (demo) ulanadi.
 */
(function () {
  'use strict';
  const cfg = window.BC_SUPABASE || {};
  const SEED = window.BC_SEED;
  const LIVE = !!(cfg.url && cfg.anonKey && window.supabase);
  const sb = LIVE ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;

  const ls = {
    get(k, d) { try { const v = localStorage.getItem('bc3_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bc3_' + k, JSON.stringify(v)); return true; } catch { return false; } },
  };
  const uid = () => 'x' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const fail = (e) => { throw new Error(e?.message || String(e)); };
  const normPhone = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 9 ? '+998' + d.slice(-9) : ''; };

  /* ====================== DEMO (localStorage) ====================== */
  function demoOrders(products, settings) {
    let seed = 20240607; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296), pick = (a) => a[Math.floor(rnd() * a.length)];
    const names = ['Dilshod Karimov', 'Madina Yusupova', 'Aziz Rahmonov', 'Gulnora Ismoilova', 'Jasur Toshmatov', 'Nilufar Abdullayeva', 'Sardor Qodirov', 'Zarina Nazarova', 'Bekzod Sobirov', 'Malika Ergasheva', 'Otabek Mirzayev', 'Shahzoda Aliyeva', 'Rustam Hasanov', 'Dildora Saidova'];
    const addrs = ['Toshkent, Chilonzor', 'Toshkent, Yunusobod', 'Samarqand, Registon', "Namangan, Davlatobod", "Farg'ona, Markaz", 'Buxoro, Navoiy ko\'chasi', 'Andijon, Bobur shoh', 'Toshkent, Mirzo Ulug\'bek'];
    const out = []; const now = Date.now(), day = 86400000, N = 340;
    for (let i = 0; i < N; i++) {
      const age = Math.pow(rnd(), 1.55) * 430, t = now - age * day - rnd() * day * 0.9; // yaqin kunlarda ko'proq
      const n = rnd() < 0.78 ? 1 : 2, lines = [];
      for (let k = 0; k < n; k++) {
        const p = pick(products), w = 1 + Math.floor(rnd() * 5.2), qty = rnd() < 0.82 ? 1 : 2;
        if (p && !lines.find((l) => l.id === p.id)) lines.push({ id: p.id, title: p.title, price: p.price, qty, color: pick(p.colors || [{ name: '' }]).name });
        void w;
      }
      const sub = lines.reduce((s, l) => s + l.price * l.qty, 0), courier = rnd() < 0.82, fee = courier && sub < settings.freeFrom ? settings.deliveryFee : 0;
      const status = age > 12 ? (rnd() < 0.9 ? 'delivered' : 'cancelled') : age > 5 ? pick(['shipping', 'delivered', 'delivered', 'confirmed']) : pick(['new', 'new', 'confirmed', 'shipping']);
      const nm = pick(names), ph = '+99890' + String(1000000 + Math.floor(rnd() * 8999999)).slice(0, 7);
      out.push({ id: uid(), no: '', name: nm, phone: ph, address: courier ? pick(addrs) : '', comment: '', delivery: courier ? 'courier' : 'pickup', payment: rnd() < 0.7 ? 'cash' : 'card', items: lines, subtotal: sub, delivery_fee: fee, total: sub + fee, status, created_at: new Date(t).toISOString(), demo: true });
    }
    out.sort((a, b) => a.created_at.localeCompare(b.created_at)).forEach((o, i) => { o.no = 'BC-' + (1001 + i); });
    return out.reverse();
  }

  const demo = {
    init() {
      if (ls.get('seeded') === 3) return;
      ls.set('categories', SEED.categories); ls.set('products', SEED.products); ls.set('settings', SEED.settings);
      ls.set('orders', demoOrders(SEED.products, SEED.settings));
      ls.set('messages', [
        { id: uid(), name: 'Madina Yusupova', phone: '+998901112233', message: "Assalomu alaykum! 2 kishilik elektromobilning qizil rangi bormi? Toshkentga yetkazib berish necha kun?", handled: false, created_at: new Date(Date.now() - 3 * 3600e3).toISOString(), demo: true },
        { id: uid(), name: 'Aziz Rahmonov', phone: '+998935554433', message: "Velokalyaskaga 6 oy kafolat nimani qamrab oladi?", handled: true, created_at: new Date(Date.now() - 2 * 86400e3).toISOString(), demo: true },
      ]);
      ls.set('seeded', 3);
    },
    async catalog() {
      return { categories: ls.get('categories', []).sort((a, b) => a.sort - b.sort), products: ls.get('products', []).filter((p) => p.active !== false), settings: { ...SEED.settings, ...ls.get('settings', {}) } };
    },
    async placeOrder(o) {
      const products = ls.get('products', []), settings = { ...SEED.settings, ...ls.get('settings', {}) };
      if ((o.name || '').trim().length < 2) fail('Ismingizni kiriting');
      const phone = normPhone(o.phone); if (!phone) fail("Telefon raqami noto'g'ri");
      if (o.delivery === 'courier' && (o.address || '').trim().length < 5) fail('Manzilni kiriting');
      if (!o.items?.length) fail("Savat bo'sh");
      let sub = 0; const lines = [], need = {};
      for (const it of o.items) {
        const p = products.find((x) => x.id === it.id && x.active !== false);
        if (!p) fail("Mahsulotlardan biri sotuvda yo'q");
        if (it.qty < 1 || it.qty > 20) fail("Miqdor noto'g'ri");
        need[p.id] = (need[p.id] || 0) + it.qty; if (p.stock < need[p.id]) fail(`"${p.title}" omborda yetarli emas (qoldi: ${p.stock})`);
        sub += p.price * it.qty; lines.push({ id: p.id, title: p.title, price: p.price, qty: it.qty, color: String(it.color || '').slice(0, 30) });
      }
      lines.forEach((l) => { products.find((x) => x.id === l.id).stock -= l.qty; });
      const fee = o.delivery === 'courier' && sub < settings.freeFrom ? settings.deliveryFee : 0;
      const orders = ls.get('orders', []); const n = orders.reduce((m, x) => Math.max(m, +String(x.no).slice(3) || 0), 1000) + 1;
      const row = { id: uid(), no: 'BC-' + n, name: o.name.trim(), phone, address: (o.address || '').trim(), comment: (o.comment || '').trim(), delivery: o.delivery, payment: o.payment, items: lines, subtotal: sub, delivery_fee: fee, total: sub + fee, status: 'new', created_at: new Date().toISOString() };
      orders.unshift(row); ls.set('orders', orders); ls.set('products', products);
      return { no: row.no, total: row.total, fee };
    },
    async trackOrder(no, phone) { return ls.get('orders', []).find((x) => x.no === String(no).trim().toUpperCase() && normPhone(x.phone) === normPhone(phone)) || null; },
    async sendMessage(m) {
      if ((m.name || '').trim().length < 2) fail('Ismingizni kiriting'); if (!normPhone(m.phone)) fail("Telefon raqami noto'g'ri"); if ((m.message || '').trim().length < 3) fail('Xabarni yozing');
      const all = ls.get('messages', []); all.unshift({ id: uid(), name: m.name.trim(), phone: normPhone(m.phone), message: m.message.trim(), handled: false, created_at: new Date().toISOString() }); ls.set('messages', all); return { ok: true };
    },
    admin: {
      async session() { return ls.get('adminSession') ? { email: 'demo@babycheer.uz' } : null; },
      async login(email, pw) { if (pw !== 'admin123') fail("Parol noto'g'ri (demo parol: admin123)"); ls.set('adminSession', 1); return { email }; },
      async logout() { ls.set('adminSession', 0); },
      async products() { return ls.get('products', []); },
      async saveProduct(p) {
        const all = ls.get('products', []); const row = { ...p, id: p.id || uid() };
        const i = all.findIndex((x) => x.id === row.id); i >= 0 ? (all[i] = row) : all.unshift(row);
        if (!ls.set('products', all)) fail("Brauzer xotirasi to'ldi. Rasmlar hajmini kamaytiring"); return row;
      },
      async deleteProduct(id) { ls.set('products', ls.get('products', []).filter((x) => x.id !== id)); },
      async categories() { return ls.get('categories', []).sort((a, b) => a.sort - b.sort); },
      async saveCategory(c) {
        const all = ls.get('categories', []); const row = { ...c, id: c.id || uid() };
        const i = all.findIndex((x) => x.id === row.id); i >= 0 ? (all[i] = { ...all[i], ...row }) : all.push(row); ls.set('categories', all); return row;
      },
      async deleteCategory(id) {
        ls.set('categories', ls.get('categories', []).filter((x) => x.id !== id));
        ls.set('products', ls.get('products', []).map((p) => (p.category_id === id ? { ...p, category_id: null } : p)));
      },
      async orders() { return ls.get('orders', []); },
      async setStatus(id, status) {
        const all = ls.get('orders', []); const o = all.find((x) => x.id === id); if (!o) return;
        const products = ls.get('products', []);
        const restock = (sign) => o.items.forEach((l) => { const p = products.find((x) => x.id === l.id); if (p) p.stock = Math.max(p.stock + sign * l.qty, 0); });
        if (!o.demo) { if (status === 'cancelled' && o.status !== 'cancelled') restock(+1); if (status !== 'cancelled' && o.status === 'cancelled') restock(-1); }
        o.status = status; ls.set('orders', all); ls.set('products', products);
      },
      async deleteOrder(id) { ls.set('orders', ls.get('orders', []).filter((x) => x.id !== id)); },
      async messages() { return ls.get('messages', []); },
      async setHandled(id, v) { const a = ls.get('messages', []); const m = a.find((x) => x.id === id); if (m) m.handled = !!v; ls.set('messages', a); },
      async deleteMessage(id) { ls.set('messages', ls.get('messages', []).filter((x) => x.id !== id)); },
      async settings() { return { ...SEED.settings, ...ls.get('settings', {}) }; },
      async saveSettings(s) { ls.set('settings', s); },
      async purgeDemo() { ls.set('orders', ls.get('orders', []).filter((o) => !o.demo)); ls.set('messages', ls.get('messages', []).filter((o) => !o.demo)); },
      async upload(file) { return await shrink(file, 1200, 0.82); },
      onChange(cb) { const h = (e) => { if (e.key === 'bc3_orders' || e.key === 'bc3_messages') cb(e.key.slice(4)); }; addEventListener('storage', h); return () => removeEventListener('storage', h); },
    },
  };

  /* ====================== SUPABASE ====================== */
  async function fetchAll(make) {
    const out = []; for (let from = 0; from < 20000; from += 1000) { const r = await make().range(from, from + 999); if (r.error) fail(r.error); out.push(...r.data); if (r.data.length < 1000) break; }
    return out;
  }
  const cloud = {
    async catalog() {
      const [c, p, s] = await Promise.all([
        sb.from('categories').select('*').order('sort'),
        sb.from('products').select('*').eq('active', true).order('sort').order('created_at', { ascending: false }),
        sb.from('settings').select('value').eq('key', 'store').maybeSingle(),
      ]);
      if (c.error || p.error) fail(c.error || p.error);
      return { categories: c.data, products: p.data.map((x) => ({ ...x, colors: x.colors || [], color: (x.colors && x.colors[0]?.hex) || '#2b59ff' })), settings: { ...SEED.settings, ...(s.data?.value || {}) } };
    },
    async placeOrder(o) {
      const { data, error } = await sb.rpc('place_order', { p_name: o.name, p_phone: o.phone, p_address: o.address || '', p_comment: o.comment || '', p_delivery: o.delivery, p_payment: o.payment, p_items: o.items });
      if (error) fail(error); return data;
    },
    async trackOrder(no, phone) { const { data, error } = await sb.rpc('track_order', { p_no: no, p_phone: phone }); if (error) fail(error); return data; },
    async sendMessage(m) { const { data, error } = await sb.rpc('send_message', { p_name: m.name, p_phone: m.phone, p_message: m.message }); if (error) fail(error); return data; },
    admin: {
      async session() {
        const { data } = await sb.auth.getSession(); if (!data.session) return null;
        const r = await sb.from('admins').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
        return r.data ? { email: data.session.user.email } : null;
      },
      async login(email, pw) {
        const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) fail("Email yoki parol noto'g'ri");
        const s = await this.session(); if (!s) { await sb.auth.signOut(); fail("Bu foydalanuvchiga admin ruxsati berilmagan (README, 2-qadam)"); } return s;
      },
      async logout() { await sb.auth.signOut(); },
      async products() { const r = await sb.from('products').select('*').order('created_at', { ascending: false }); if (r.error) fail(r.error); return r.data; },
      async saveProduct(p) { const row = { ...p }; if (!row.id) delete row.id; delete row.color; const r = await sb.from('products').upsert(row).select().single(); if (r.error) fail(r.error); return r.data; },
      async deleteProduct(id) { const r = await sb.from('products').delete().eq('id', id); if (r.error) fail(r.error); },
      async categories() { const r = await sb.from('categories').select('*').order('sort'); if (r.error) fail(r.error); return r.data; },
      async saveCategory(c) { const row = { ...c }; if (!row.id) delete row.id; const r = await sb.from('categories').upsert(row).select().single(); if (r.error) fail(r.error); return r.data; },
      async deleteCategory(id) { const r = await sb.from('categories').delete().eq('id', id); if (r.error) fail(r.error); },
      async orders() { return fetchAll(() => sb.from('orders').select('*').order('id', { ascending: false })); },
      async setStatus(id, status) {
        const cur = await sb.from('orders').select('status,items').eq('id', id).single(); if (cur.error) fail(cur.error);
        const delta = status === 'cancelled' && cur.data.status !== 'cancelled' ? 1 : status !== 'cancelled' && cur.data.status === 'cancelled' ? -1 : 0;
        const r = await sb.from('orders').update({ status }).eq('id', id); if (r.error) fail(r.error);
        for (const l of delta ? cur.data.items : []) {
          const p = await sb.from('products').select('stock').eq('id', l.id).maybeSingle();
          if (p.data) await sb.from('products').update({ stock: Math.max(p.data.stock + delta * l.qty, 0) }).eq('id', l.id);
        }
      },
      async deleteOrder(id) { const r = await sb.from('orders').delete().eq('id', id); if (r.error) fail(r.error); },
      async messages() { const r = await sb.from('messages').select('*').order('id', { ascending: false }).limit(500); if (r.error) fail(r.error); return r.data; },
      async setHandled(id, v) { const r = await sb.from('messages').update({ handled: !!v }).eq('id', id); if (r.error) fail(r.error); },
      async deleteMessage(id) { const r = await sb.from('messages').delete().eq('id', id); if (r.error) fail(r.error); },
      async settings() { const r = await sb.from('settings').select('value').eq('key', 'store').maybeSingle(); return { ...SEED.settings, ...(r.data?.value || {}) }; },
      async saveSettings(s) { const r = await sb.from('settings').upsert({ key: 'store', value: s }); if (r.error) fail(r.error); },
      async purgeDemo() { /* real rejimda demo ma'lumot yo'q */ },
      async upload(file) {
        const blob = await shrinkBlob(file, 1600, 0.85); const path = uid() + '.jpg';
        const r = await sb.storage.from('products').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' }); if (r.error) fail(r.error);
        return sb.storage.from('products').getPublicUrl(path).data.publicUrl;
      },
      onChange(cb) {
        const ch = sb.channel('live-' + uid())
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => cb('orders'))
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => cb('messages')).subscribe();
        return () => sb.removeChannel(ch);
      },
    },
  };

  /* ====================== rasm siqish ====================== */
  function loadImg(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); res(i); }; i.onerror = () => rej(new Error("Rasmni o'qib bo'lmadi")); i.src = u; }); }
  async function shrinkBlob(file, max, q) {
    const img = await loadImg(file), k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob(res, 'image/jpeg', q));
  }
  async function shrink(file, max, q) { const b = await shrinkBlob(file, max, q); return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); }); }

  if (!LIVE) demo.init();
  const impl = LIVE ? cloud : demo;
  window.BC = window.BC || {};
  window.BC.api = { mode: LIVE ? 'live' : 'demo', ...impl, admin: impl.admin };
  window.BC.util = {
    money: (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm",
    num: (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    esc: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    normPhone,
  };
})();
