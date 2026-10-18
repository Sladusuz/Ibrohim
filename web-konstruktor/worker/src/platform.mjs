/* ---------- Platforma API: hisoblar, loyihalar, saytni joylash, buyurtmalar (Cloudflare Worker, VDS shart emas) ---------- */
const PLAT_RESERVED = new Set(['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'static', 'cdn', 'test', 'demo', 'login', 'kabinet', 'yaratish', 'bot', 'support', 'pay', 'sms', 'err', 'chat', 'stats', 'uploads', 's']);
const pHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const pRnd = (n = 6) => pHex(crypto.getRandomValues(new Uint8Array(n)));
const pSha = async (s) => pHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
const pDigits = (s) => String(s || '').replace(/\D/g, '');
const pPhoneKey = (s) => pDigits(s).slice(-9);
const pGoodPhone = (s) => /^[+\d][\d\s()\-]{6,}$/.test(String(s || '').trim()) && pDigits(s).length >= 7;
const pGoodEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || ''));
const pStr = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const pGoodSlug = (v) => /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(v) && !PLAT_RESERVED.has(v) && !/--/.test(v);
const pubUser = (u) => ({ id: u.id, name: u.name, phone: u.phone, email: u.email || '', createdAt: u.createdAt });
const pPages = (env) => String(env.SITE_ORIGIN || 'https://improuzbekiston.uz').replace(/\/$/, '');
async function pwHash(env, pw, salt, it) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw + (env.AUTH_PEPPER || env.WEBHOOK_SECRET || '')), 'PBKDF2', false, ['deriveBits']);
  return pHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: it || 10000 }, key, 256));
}
function platCors(req, env) {
  const o = req.headers.get('Origin') || '', allow = ['https://improuzbekiston.uz', 'https://www.improuzbekiston.uz', ...APP_ORIGINS, new URL(req.url).origin, ...String(env.ALLOW_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean)];
  return { 'Access-Control-Allow-Origin': allow.includes(o) ? o : 'null', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400', Vary: 'Origin' };
}
const pJson = (cors, obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors, ...extra } });
async function authUser(req, st) {
  const m = /^Bearer\s+([0-9a-f]{32,64})$/.exec(req.headers.get('Authorization') || ''); if (!m) return null;
  const uid = await st.get('ss:' + (await pSha(m[1]))); return uid ? await st.get('u:' + uid) : null;
}
async function newSession(st, uid) { const tok = pRnd(24); await st.put('ss:' + (await pSha(tok)), uid, 30 * 86400); return tok; }
const siteOf = (env, req, meta) => (meta.published && meta.slug ? `${new URL(req.url).origin}/s/${meta.slug}` : '');
const jsonForScript = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(new RegExp('[\\u2028\\u2029]', 'g'), (c) => '\\u' + c.charCodeAt(0).toString(16));
const absImg = (env, data, origin) => { const walk = (v) => (typeof v === 'string' ? (v.startsWith('/img/') ? pPages(env) + v : v.startsWith('/uploads/') ? origin + v : v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v); return walk(data); };
const pEsc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function shellHtml(env) { const r = await fetch(pPages(env) + '/shablon.html', { cf: { cacheTtl: 300, cacheEverything: true } }); if (!r.ok) throw new Error('shablon'); return (await r.text()).replace(/<script src="\/native\.js"[^>]*><\/script>/g, ''); }
const MARK = '/*__DATA__*/null';
function renderSite(shell, data, extraHead) {
  const name = (data.company && data.company.name) || 'Sayt', hero = (data.sections || []).find((s) => s.type === 'hero') || {}, desc = String(hero.text || (data.company && data.company.tagline) || '').replace(/\*/g, '').slice(0, 200);
  let h = shell.replace(MARK, jsonForScript(data)).replace(/<title>[^<]*<\/title>/, `<title>${pEsc(name)}</title>`).replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${pEsc(desc)}">`);
  return extraHead ? h.replace('</head>', extraHead + '</head>') : h;
}
async function bump(st, id, kind) { try { const k = `sv:${id}:${dkey()}:${kind}`; await st.put(k, ((await st.get(k)) || 0) + 1, 40 * 86400); } catch { /* statistika ixtiyoriy */ } }

async function platformApi(req, env, ctx, url) {
  const cors = platCors(req, env), pn = url.pathname, st = store(env), origin = url.origin, route = `${req.method} ${pn}`, ip = req.headers.get('CF-Connecting-IP') || 'x';
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const J = (o, s = 200, x = {}) => pJson(cors, o, s, x), body = async (max = 1024 * 1024) => { const t = await req.text(); if (t.length > max) throw Object.assign(new Error('big'), { big: true }); try { return JSON.parse(t || '{}'); } catch { return {}; } };
  const me = await authUser(req, st), need = () => J({ error: 'Kirish talab qilinadi' }, 401);
  try {
    if (route === 'GET /api/pricing') return J({ ...PRICING, payMethods: { payme: !!(env.PAYME_MERCHANT_ID && env.PAYME_KEY), click: !!(env.CLICK_SERVICE_ID && env.CLICK_MERCHANT_ID && env.CLICK_SECRET_KEY) }, manualPay: env.CARD_INFO || '', rootDomain: '', contacts: { phone: (SITE.contacts || {}).phone || '', telegram: (SITE.contacts || {}).telegram || '' }, aiEnabled: true });
    if (route === 'GET /api/site') return J(SITE);
    /* ---- hisob ---- */
    if (route === 'POST /api/auth/register') {
      if (await limited(st, 'reg' + ip, 8, 3600)) return J({ error: "Juda ko'p urinish. Keyinroq qayta urinib ko'ring." }, 429);
      const b = await body(8192), name = pStr(b.name, 80), phone = pStr(b.phone, 30), email = pStr(b.email, 120).toLowerCase(), pw = String(b.password || '');
      if (name.length < 2) return J({ error: 'Ismingizni kiriting' }, 400);
      if (!pGoodPhone(phone)) return J({ error: "Telefon raqamini to'g'ri kiriting" }, 400);
      if (email && !pGoodEmail(email)) return J({ error: "Email noto'g'ri" }, 400);
      if (pw.length < 6 || pw.length > 100) return J({ error: "Parol kamida 6 belgi bo'lsin" }, 400);
      if (await st.get('up:' + pPhoneKey(phone))) return J({ error: "Bu telefon raqam bilan hisob mavjud. Iltimos, kiring." }, 409);
      if (email && (await st.get('ue:' + email))) return J({ error: 'Bu email bilan hisob mavjud. Iltimos, kiring.' }, 409);
      const salt = pRnd(16), u = { id: pRnd(6), name, phone, email, salt, it: 10000, hash: await pwHash(env, pw, salt, 10000), createdAt: new Date().toISOString() };
      await st.put('u:' + u.id, u, 0, { n: name.slice(0, 40), p: phone.slice(0, 25), t: Date.now() }); await st.put('up:' + pPhoneKey(phone), u.id, 0); if (email) await st.put('ue:' + email, u.id, 0);
      ctx && ctx.waitUntil(Promise.all((await adminsOf(env, st)).map((a) => say(env, a, `👤 <b>Yangi mijoz ro'yxatdan o'tdi</b>\n${esc(name)}\n${esc(phone)}${email ? '\n' + esc(email) : ''}`, { disable_notification: true }))).catch(() => {}));
      return J({ token: await newSession(st, u.id), user: pubUser(u) });
    }
    if (route === 'POST /api/auth/login') {
      const b = await body(4096), id = pStr(b.id, 120).toLowerCase(), pw = String(b.password || '');
      if ((await limited(st, 'li' + ip, 20, 600)) || (await limited(st, 'lid' + id, 8, 600))) return J({ error: "Juda ko'p urinish. 10 daqiqadan so'ng qayta urining." }, 429);
      const uid = id.includes('@') ? await st.get('ue:' + id) : pDigits(id).length >= 7 ? await st.get('up:' + pPhoneKey(id)) : null, u = uid ? await st.get('u:' + uid) : null;
      if (!u || !tEq(await pwHash(env, pw, u.salt, u.it), u.hash)) return J({ error: "Telefon/email yoki parol noto'g'ri" }, 401);
      return J({ token: await newSession(st, u.id), user: pubUser(u) });
    }
    if (route === 'GET /api/me') return me ? J({ user: pubUser(me) }) : J({ error: 'Kirish talab qilinadi' }, 401);
    if (route === 'PUT /api/me') {
      if (!me) return need(); const b = await body(4096), name = pStr(b.name, 80), email = pStr(b.email, 120).toLowerCase(), phone = pStr(b.phone, 30);
      if (name.length < 2) return J({ error: 'Ismingizni kiriting' }, 400); if (email && !pGoodEmail(email)) return J({ error: "Email noto'g'ri" }, 400); if (phone && !pGoodPhone(phone)) return J({ error: "Telefon raqamini to'g'ri kiriting" }, 400);
      if (email && email !== me.email) { const o = await st.get('ue:' + email); if (o && o !== me.id) return J({ error: 'Bu email band' }, 409); }
      if (phone && pPhoneKey(phone) !== pPhoneKey(me.phone)) { const o = await st.get('up:' + pPhoneKey(phone)); if (o && o !== me.id) return J({ error: 'Bu telefon raqam band' }, 409); }
      if (me.email && me.email !== email) await st.put('ue:' + me.email, null, 60); if (email) await st.put('ue:' + email, me.id, 0);
      if (phone && pPhoneKey(phone) !== pPhoneKey(me.phone)) { await st.put('up:' + pPhoneKey(me.phone), null, 60); await st.put('up:' + pPhoneKey(phone), me.id, 0); }
      me.name = name; me.email = email; if (phone) me.phone = phone; await st.put('u:' + me.id, me, 0, { n: me.name.slice(0, 40), p: me.phone.slice(0, 25), t: Date.now() }); return J({ user: pubUser(me) });
    }
    if (route === 'POST /api/me/password') {
      if (!me) return need(); const b = await body(4096); if (await limited(st, 'chpw' + ip, 8, 600)) return J({ error: "Juda ko'p urinish" }, 429);
      if (!tEq(await pwHash(env, String(b.old || ''), me.salt, me.it), me.hash)) return J({ error: "Joriy parol noto'g'ri" }, 400);
      const np = String(b.password || ''); if (np.length < 6) return J({ error: "Yangi parol kamida 6 belgi bo'lsin" }, 400);
      me.salt = pRnd(16); me.it = 10000; me.hash = await pwHash(env, np, me.salt, 10000); await st.put('u:' + me.id, me, 0, { n: me.name.slice(0, 40), p: me.phone.slice(0, 25), t: Date.now() }); return J({ ok: true });
    }
    /* ---- AI ---- */
    if (route === 'POST /api/ai/generate') {
      if (!me) return need(); if (await limited(st, 'ai' + me.id, 8, 3600)) return J({ error: "AI so'rovlari soatiga 8 ta. Keyinroq urinib ko'ring." }, 429);
      const b = await body(64 * 1024), d = pStr(b.description, 1500); if (d.length < 8) return J({ error: 'Biznesingiz haqida kamida bir jumla yozing' }, 400);
      try { return J({ ok: true, ...(await makeAiOf(env).generate(d, b.templates)) }); } catch (e) { return J({ error: e.message }, 400); }
    }
    /* ---- buyurtma (ochiq saytlardan yoki asosiy saytdan) ---- */
    if (route === 'POST /api/order') {
      if (await limited(st, 'ord' + ip, 12, 600)) return J({ error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." }, 429);
      const b = await body(200 * 1024), ref = /\/s\/([a-z0-9-]{3,30})/.exec(req.headers.get('Referer') || ''), slug = ref ? ref[1] : '', sid = slug ? await st.get('slug:' + slug) : null;
      const type = ['order', 'booking', 'message', 'brief'].includes(b.type) ? b.type : 'order', name = pStr(b.name, 100) || (me && me.name) || '', phone = pStr(b.phone, 40) || (me && me.phone) || '';
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60).map((i) => ({ id: pStr(i && i.id, 40), name: pStr(i && i.name, 120), price: Math.max(0, Number(i && i.price) || 0), qty: Math.min(999, Math.max(1, parseInt(i && i.qty, 10) || 1)) })).filter((i) => i.name);
      const extra = {}; if (b.extra && typeof b.extra === 'object') for (const k of Object.keys(b.extra).slice(0, 30)) extra[pStr(k, 40)] = pStr(b.extra[k], 700);
      if (name.length < 2) return J({ error: 'Ismingizni kiriting' }, 400); if (!pGoodPhone(phone)) return J({ error: "Telefon raqamini to'g'ri kiriting" }, 400);
      if (type === 'order' && !items.length) return J({ error: "Savat bo'sh" }, 400);
      const o = { id: pRnd(4), date: new Date().toISOString(), userId: me ? me.id : '', tenant: sid || '', type, name, phone, message: pStr(b.message, type === 'brief' ? 3000 : 1000), items, extra, shipping: Math.max(0, Number(b.shipping) || 0), total: items.reduce((a, i) => a + i.price * i.qty, 0), status: 'yangi' };
      await st.put('o:' + Date.now().toString(36) + o.id, o, 90 * 86400, { t: Date.now(), n: name.slice(0, 40), p: phone.slice(0, 25), ty: type, tn: sid || '', u: o.userId });
      if (sid) await bump(st, sid, 'o');
      const kind = { order: '🛒 Yangi buyurtma', booking: '📅 Yangi ariza', message: '✉️ Yangi xabar', brief: "📝 Yangi loyiha so'rovi" }[type];
      ctx && ctx.waitUntil(Promise.all((await adminsOf(env, st)).map((a) => say(env, a, `<b>${kind}</b>${sid ? ' · sayt ' + esc(slug) : ''}\n👤 ${esc(name)}\n📞 ${esc(phone)}${items.length ? '\n🧾 ' + items.slice(0, 20).map((i) => `${esc(i.name)} ×${i.qty}`).join(', ') : ''}${o.message ? '\n\n' + esc(o.message.slice(0, 1200)) : ''}`, sid ? { disable_notification: true } : undefined))).catch(() => {}));
      return J({ ok: true, id: o.id });
    }
    /* ---- shaxsiy ---- */
    if (pn.startsWith('/api/my/')) {
      if (!me) return need();
      const myProjects = async () => (await st.list('pr:' + me.id + ':')).map((k) => k.metadata).filter(Boolean).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      if (route === 'GET /api/my/projects') return J((await myProjects()).map((p) => ({ ...p, url: siteOf(env, req, p) })));
      if (route === 'POST /api/my/projects') {
        if (await limited(st, 'pc' + me.id, 20, 3600)) return J({ error: "Juda ko'p yangi loyiha. Keyinroq urinib ko'ring." }, 429);
        if ((await myProjects()).length >= 25) return J({ error: "Loyihalar soni chegarasi (25). Keraksizini o'chiring." }, 400);
        const b = await body(1500 * 1024); if (!b.data || typeof b.data !== 'object' || !Array.isArray(b.data.sections)) return J({ error: "Noto'g'ri loyiha" }, 400);
        const id = pRnd(6), now = new Date().toISOString(), json = JSON.stringify(b.data), free = !env.PAID_REQUIRED;
        const meta = { id, userId: me.id, name: pStr(b.name || (b.data.company && b.data.company.name), 80) || 'Yangi sayt', template: pStr(b.template || b.data.template, 30), status: 'qoralama', plan: '', price: '', note: '', adminNote: '', createdAt: now, updatedAt: now, submittedAt: '', size: json.length, paid: free, published: false, slug: '' };
        await st.put('pd:' + id, json, 0); await st.put('pr:' + me.id + ':' + id, meta, 0, meta); return J({ project: meta });
      }
      if (route === 'GET /api/my/orders') { const out = []; for (const k of await st.list('o:')) { const m = k.metadata || {}; if (m.u === me.id && !m.tn) { const o = await st.get(k.name); if (o) out.push(o); } } return J(out.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 200)); }
      if (route === 'GET /api/my/leads') { const mine = new Map((await myProjects()).map((p) => [p.id, p.name])), out = []; for (const k of await st.list('o:')) { const m = k.metadata || {}; if (m.tn && mine.has(m.tn)) { const o = await st.get(k.name); if (o) out.push({ ...o, site: mine.get(m.tn) }); } } return J(out.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 500)); }
      if (route === 'GET /api/my/referral') return J({ enabled: false, code: '', link: '', discountPct: 0, rewardUsd: 0, invited: 0, rewarded: 0, credit: 0 });
      if (route === 'GET /api/my/bots') return J([]);
      if (route === 'POST /api/my/bots') return J({ error: "Telegram bot konstruktori hozircha shu platformada mavjud emas. Bot buyurtma qilish uchun biz bilan bog'laning." }, 501);
      if (route === 'POST /api/my/upload') {
        if (await limited(st, 'up' + me.id, 80, 3600)) return J({ error: "Juda ko'p rasm yuklandi. Keyinroq urinib ko'ring." }, 429);
        const b = await body(2 * 1024 * 1024), m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
        if (!m) return J({ error: 'Faqat PNG, JPG, WEBP yoki GIF rasm yuklang' }, 400); if (m[2].length > 1400000) return J({ error: 'Rasm 1 MB dan oshmasin (kichraytirib yuklang)' }, 413);
        const id = Date.now().toString(36) + pRnd(3), ext = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' }[m[1]];
        await st.put('img:' + id, { m: m[1], d: m[2] }, 0); return J({ url: `${origin}/uploads/${id}${ext}` });
      }
      const pm = /^\/api\/my\/projects\/([a-f0-9]{6,24})(\/(?:submit|checkout|export|publish|domain|stats))?$/.exec(pn);
      if (pm) {
        const meta = await st.get('pr:' + me.id + ':' + pm[1]); if (!meta) return J({ error: 'Loyiha topilmadi' }, 404);
        const act = (pm[2] || '').slice(1), save = (m2) => st.put('pr:' + me.id + ':' + m2.id, m2, 0, m2);
        if (req.method === 'GET' && !act) { const d = await st.get('pd:' + meta.id); return J({ project: { ...meta, url: siteOf(env, req, meta) }, data: d ? JSON.parse(d) : null }); }
        if (act === 'stats' && req.method === 'GET') { const series = []; for (let i = 13; i >= 0; i--) { const d = dkey(Date.now() - i * 864e5); series.push({ d, v: (await st.get(`sv:${meta.id}:${d}:v`)) || 0, o: (await st.get(`sv:${meta.id}:${d}:o`)) || 0 }); } return J({ series, views: series.reduce((a, x) => a + x.v, 0), orders: series.reduce((a, x) => a + x.o, 0) }); }
        if (act === 'checkout' && req.method === 'POST') {
          if (meta.paid) return J({ paid: true });
          const b = await body(4096), tp = PRICING.templatePrice || { usd: 10, rate: 12800 }, uzs = Math.round(tp.usd * tp.rate), p = await createPayOrder(env, st, uzs, `Sayt: ${meta.name} (${me.name} ${me.phone})`); p.projectId = meta.id; p.ownerId = me.id; await payOrderPut(st, p);
          if (b.method === 'payme' && env.PAYME_MERCHANT_ID && env.PAYME_KEY) return J({ payment: { id: p.id, usd: tp.usd, uzs }, payUrl: paymeUrl(env, p) });
          if (b.method === 'click' && env.CLICK_SERVICE_ID && env.CLICK_MERCHANT_ID && env.CLICK_SECRET_KEY) return J({ payment: { id: p.id, usd: tp.usd, uzs }, payUrl: clickUrl(env, p) });
          for (const a of await adminsOf(env, st)) await say(env, a, `💳 <b>Sayt sotib olish so'rovi</b>\n👤 ${esc(me.name)} ${esc(me.phone)}\n🌐 ${esc(meta.name)}\n💰 ${sum(uzs)} so'm · #${p.id}`, { reply_markup: { inline_keyboard: [[{ text: "✅ To'lovni tasdiqlash", callback_data: 'pp:' + meta.id + ':' + me.id }]] } });
          return J({ manual: true, payment: { id: p.id, usd: tp.usd, uzs }, contacts: SITE.contacts || {}, text: env.CARD_INFO || '' });
        }
        if (act === 'export' && req.method === 'GET') {
          if (!meta.paid) return J({ error: "Yuklab olish uchun avval saytni sotib oling" }, 402);
          const d = await st.get('pd:' + meta.id); if (!d) return J({ error: "Ma'lumot topilmadi" }, 404);
          const fn = (String(meta.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sayt') + '.html';
          return new Response(renderSite(await shellHtml(env), absImg(env, JSON.parse(d), origin)), { headers: { 'content-type': 'text/html; charset=utf-8', 'content-disposition': `attachment; filename="${fn}"`, ...cors } });
        }
        if (act === 'publish') {
          if (!meta.paid) return J({ error: 'Joylash uchun avval saytni sotib oling' }, 402);
          if (req.method === 'DELETE') { if (meta.slug) await st.put('slug:' + meta.slug, null, 60); meta.published = false; await save(meta); return J({ project: meta }); }
          if (req.method === 'POST') {
            const b = await body(2048), sl = pStr(b.slug, 40).toLowerCase(); if (!pGoodSlug(sl)) return J({ error: "Manzil 3–30 belgi: kichik harf, raqam va chiziqcha bo'lsin" }, 400);
            const own = await st.get('slug:' + sl); if (own && own !== meta.id) return J({ error: 'Bu manzil band. Boshqasini tanlang.' }, 409);
            if (meta.slug && meta.slug !== sl) await st.put('slug:' + meta.slug, null, 60);
            await st.put('slug:' + sl, meta.id, 0); meta.slug = sl; meta.published = true; meta.updatedAt = new Date().toISOString(); meta.status = 'joylandi'; await save(meta);
            return J({ project: { ...meta, url: siteOf(env, req, meta) } });
          }
        }
        if (act === 'domain' && req.method === 'POST') return J({ error: "O'z domeningizni ulash hozircha mavjud emas. Biz bilan bog'laning." }, 400);
        if (req.method === 'PUT' && !act) {
          if (await limited(st, 'ps' + me.id, 200, 600)) return J({ error: 'Juda ko\'p saqlash. Biroz kuting.' }, 429);
          const b = await body(1500 * 1024);
          if (b.data) { if (typeof b.data !== 'object' || !Array.isArray(b.data.sections)) return J({ error: "Noto'g'ri loyiha" }, 400); const json = JSON.stringify(b.data); await st.put('pd:' + meta.id, json, 0); meta.size = json.length; }
          if (b.name) meta.name = pStr(b.name, 80); if (b.template) meta.template = pStr(b.template, 30); meta.updatedAt = new Date().toISOString(); await save(meta); return J({ project: meta });
        }
        if (req.method === 'DELETE' && !act) { if (meta.slug) await st.put('slug:' + meta.slug, null, 60); await st.put('pd:' + meta.id, null, 60); await st.put('pr:' + me.id + ':' + meta.id, null, 60); return J({ ok: true }); }
        if (req.method === 'POST' && act === 'submit') {
          const b = await body(8192); meta.plan = pStr(b.plan, 60); meta.note = pStr(b.note, 1000); meta.contactPhone = pStr(b.phone, 40) || me.phone; if (!['yuborilgan', 'korilmoqda', 'narx', 'joylandi'].includes(meta.status)) meta.status = 'yuborilgan';
          meta.submittedAt = new Date().toISOString(); meta.updatedAt = meta.submittedAt; await save(meta);
          for (const a of await adminsOf(env, st)) await say(env, a, `🌐 <b>Yangi sayt buyurtmasi</b>\n${esc(me.name)} · ${esc(me.phone)}\n${esc(meta.name)} [${esc(meta.template)}]\nTarif: ${esc(meta.plan || '-')}${meta.note ? '\nIzoh: ' + esc(meta.note) : ''}`);
          return J({ project: meta });
        }
        return J({ error: "Ruxsat yo'q" }, 405);
      }
      return J({ error: 'Topilmadi' }, 404);
    }
    return J({ error: 'Topilmadi' }, 404);
  } catch (e) { return e && e.big ? J({ error: 'Hajm juda katta' }, 413) : J({ error: 'Server xatosi' }, 500); }
}
// Joylangan mijoz saytlari: /s/<manzil>
async function sitePage(req, env, ctx, url) {
  const m = /^\/s\/([a-z0-9-]{3,30})\/?$/.exec(url.pathname); if (!m) return new Response('Topilmadi', { status: 404 });
  const st = store(env), id = await st.get('slug:' + m[1]), nf = () => new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sayt topilmadi</title><body style="font:16px system-ui;background:#0a0a0b;color:#efe9dc;display:grid;place-items:center;min-height:100vh;text-align:center"><div><h1>Sayt topilmadi</h1><p>Bu manzilda sayt joylanmagan.</p></div>', { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  if (!id) return nf(); const raw = await st.get('pd:' + id); if (!raw) return nf();
  const data = absImg(env, JSON.parse(raw), url.origin); ctx && ctx.waitUntil(bump(st, id, 'v'));
  try { const html = renderSite(await shellHtml(env), data, `<script>window.__API__=location.origin;window.__TENANT__=${jsonForScript(m[1])};</script>`); return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } }); } catch { return new Response('Sayt vaqtincha ochilmayapti', { status: 503 }); }
}
async function serveUpload(req, env, url) {
  const m = /^\/uploads\/([a-z0-9]+)\.(png|jpg|webp|gif)$/.exec(url.pathname); if (!m) return new Response('Topilmadi', { status: 404 });
  const o = await store(env).get('img:' + m[1]); if (!o) return new Response('Topilmadi', { status: 404 });
  const bin = atob(o.d), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Response(u8, { headers: { 'content-type': o.m, 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' } });
}
async function platformDump(st) {
  const us = [], prs = [], ors = [];
  for (const k of await st.list('u:')) { const u = await st.get(k.name); if (u) us.push(u); }
  for (const k of await st.list('pr:')) { const m = k.metadata; if (m) { const d = await st.get('pd:' + m.id); prs.push({ meta: m, data: d ? JSON.parse(d) : null }); } }
  for (const k of await st.list('o:')) { const o = await st.get(k.name); if (o) ors.push(o); }
  return { users: us, projects: prs, orders: ors };
}
const makeAiOf = (env) => makeAi({ getSettings: () => ({ ai: { key: env.ANTHROPIC_API_KEY || '', model: env.AI_MODEL || '' } }) });
