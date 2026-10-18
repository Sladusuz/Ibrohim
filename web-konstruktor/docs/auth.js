'use strict';
// Mijoz hisobi (ro'yxatdan o'tish / kirish) uchun umumiy kutubxona.
// Faqat server mavjud bo'lganda ishlaydi (window.__SERVER__ yoki window.__API__ orqali aniqlanadi).
(function () {
  const API = String(window.__API__ || '').replace(/\/$/, '');
  const enabled = !!API || window.__SERVER__ === true;
  const KEY = 'impro_tok', UKEY = 'impro_user';
  const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }, del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } } };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  try { const q = new URLSearchParams(location.search).get('ref'); if (q && /^[A-Za-z0-9]{4,12}$/.test(q)) ls.set('impro_ref', q); } catch { /* ignore */ }
  let user = null; try { user = JSON.parse(ls.get(UKEY) || 'null'); } catch { user = null; }
  const subs = [];

  const Auth = window.Auth = {
    enabled, api: API,
    user: () => user,
    token: () => ls.get(KEY),
    onChange(fn) { subs.push(fn); },
    _set(u, t) { user = u; if (t) ls.set(KEY, t); if (u) ls.set(UKEY, JSON.stringify(u)); else { ls.del(KEY); ls.del(UKEY); } subs.forEach((f) => { try { f(user); } catch { /* ignore */ } }); },
    async request(path, o = {}) {
      const h = { ...(o.headers || {}) };
      if (o.body !== undefined) h['Content-Type'] = 'application/json';
      const t = ls.get(KEY); if (t) h.Authorization = 'Bearer ' + t;
      let r;
      try { r = await fetch(API + path, { method: o.method || 'GET', headers: h, body: o.body !== undefined ? JSON.stringify(o.body) : undefined }); }
      catch { const e = new Error("Serverga ulanib bo'lmadi. Internetni tekshiring."); e.network = true; throw e; }
      const j = await r.json().catch(() => ({}));
      if (r.status === 401 && t && !path.startsWith('/api/auth/')) Auth._set(null);
      if (!r.ok) { const e = new Error(j.error || 'Xatolik yuz berdi'); e.status = r.status; throw e; }
      return j;
    },
    async init() {
      if (!enabled || !ls.get(KEY)) { if (!ls.get(KEY)) user = null; return user; }
      try { const j = await Auth.request('/api/me'); Auth._set(j.user, null); } catch (e) { if (e.status === 401) Auth._set(null); }
      return user;
    },
    async register(d) { let ref = ''; try { ref = localStorage.getItem('impro_ref') || ''; } catch { /* ignore */ } const j = await Auth.request('/api/auth/register', { method: 'POST', body: ref ? { ...d, ref } : d }); try { localStorage.removeItem('impro_ref'); } catch { /* ignore */ } Auth._set(j.user, j.token); return j.user; },
    async login(d) { const j = await Auth.request('/api/auth/login', { method: 'POST', body: d }); Auth._set(j.user, j.token); return j.user; },
    logout() { Auth._set(null); },
    /* ---------- Kirish / ro'yxatdan o'tish oynasi ---------- */
    modal(o = {}) {
      return new Promise((resolve) => {
        if (document.getElementById('amodal')) document.getElementById('amodal').remove();
        injectCss();
        let mode = o.mode || 'login';
        const wrap = document.createElement('div'); wrap.id = 'amodal'; wrap.className = 'amodal';
        const close = (u) => { wrap.remove(); document.body.classList.remove('noscroll'); resolve(u || null); };
        const draw = () => {
          wrap.innerHTML = `<div class="aback" ${o.closable === false ? '' : 'data-close'}></div><div class="abox" role="dialog" aria-modal="true">${o.closable === false ? '' : '<button class="ax" data-close aria-label="Yopish">×</button>'}
            <div class="atit">${esc(o.title || (mode === 'login' ? 'Hisobingizga kiring' : "Ro'yxatdan o'ting"))}</div>
            <p class="asub">${esc(o.text || (mode === 'login' ? "Telefon raqam yoki email va parolingizni kiriting." : "Hisob ochib, ma'lumotlaringizni xavfsiz saqlang. Istalgan qurilmadan kira olasiz."))}</p>
            <div class="atabs"><button data-m="login" class="${mode === 'login' ? 'on' : ''}">Kirish</button><button data-m="register" class="${mode === 'register' ? 'on' : ''}">Ro'yxatdan o'tish</button></div>
            <form novalidate>${mode === 'register' ? '<label>Ismingiz<input name="name" autocomplete="name" maxlength="80" placeholder="Ism Familiya"></label>' : ''}
              ${mode === 'register' ? '<label>Telefon raqam<input name="phone" inputmode="tel" autocomplete="tel" maxlength="30" placeholder="+998 90 123 45 67"></label><label>Email <small>(ixtiyoriy)</small><input name="email" type="email" autocomplete="email" maxlength="120" placeholder="siz@example.com"></label>' : '<label>Telefon yoki email<input name="id" autocomplete="username" maxlength="120" placeholder="+998 90 123 45 67"></label>'}
              <label>Parol<input name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" maxlength="100" placeholder="${mode === 'register' ? 'Kamida 6 belgi' : 'Parol'}"></label>
              <div class="aerr" role="alert"></div><button class="abtn" type="submit">${mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</button></form></div>`;
          const first = wrap.querySelector('input'); if (first) setTimeout(() => first.focus(), 40);
        };
        wrap.addEventListener('click', (e) => {
          if (e.target.closest('[data-close]')) return close(null);
          const m = e.target.closest('[data-m]'); if (m) { mode = m.dataset.m; draw(); }
        });
        wrap.addEventListener('submit', async (e) => {
          e.preventDefault();
          const f = e.target, err = wrap.querySelector('.aerr'), b = f.querySelector('.abtn'); err.textContent = '';
          const v = (n) => (f.elements[n] ? f.elements[n].value.trim() : '');
          if (mode === 'register') {
            if (v('name').length < 2) { err.textContent = 'Ismingizni kiriting'; return; }
            if (!/^[+\d][\d\s()\-]{6,}$/.test(v('phone'))) { err.textContent = "Telefon raqamini to'g'ri kiriting"; return; }
            if (v('email') && !/^\S+@\S+\.\S+$/.test(v('email'))) { err.textContent = "Email noto'g'ri"; return; }
          } else if (!v('id')) { err.textContent = 'Telefon yoki emailni kiriting'; return; }
          if (v('password').length < 6) { err.textContent = 'Parol kamida 6 belgi bo\'lsin'; return; }
          b.disabled = true; b.textContent = 'Yuborilmoqda…';
          try {
            const u = mode === 'register' ? await Auth.register({ name: v('name'), phone: v('phone'), email: v('email'), password: v('password') }) : await Auth.login({ id: v('id'), password: v('password') });
            close(u); if (o.onSuccess) o.onSuccess(u);
          } catch (er) { err.textContent = er.message; b.disabled = false; b.textContent = mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"; }
        });
        wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape' && o.closable !== false) close(null); });
        draw(); document.body.appendChild(wrap); document.body.classList.add('noscroll');
      });
    },
  };

  function injectCss() {
    if (document.getElementById('acss')) return;
    const s = document.createElement('style'); s.id = 'acss';
    s.textContent = `.amodal{position:fixed;inset:0;z-index:400;display:grid;place-items:center;padding:16px;font-family:var(--fb,Inter,system-ui,sans-serif)}
.aback{position:absolute;inset:0;background:rgba(5,8,18,.62);backdrop-filter:blur(5px)}
.abox{position:relative;width:min(420px,100%);max-height:calc(100vh - 32px);overflow:auto;background:var(--bg2,#fff);color:var(--ink,#0f172a);border:1px solid var(--line,#e3e6f0);border-radius:22px;padding:30px 28px 26px;box-shadow:0 40px 100px rgba(0,0,0,.45);animation:apop .35s cubic-bezier(.2,.8,.2,1)}
@keyframes apop{from{opacity:0;transform:translateY(20px) scale(.97)}}
.ax{position:absolute;top:12px;right:14px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line,#e3e6f0);background:transparent;color:inherit;font-size:22px;line-height:1;cursor:pointer}
.atit{font-size:22px;font-weight:800;letter-spacing:-.02em;font-family:var(--fh,inherit)}.asub{color:var(--muted,#5b6478);font-size:14px;margin:6px 0 16px}
.atabs{display:flex;gap:4px;background:var(--surf,#eef0f9);border-radius:12px;padding:4px;margin-bottom:14px}.atabs button{flex:1;border:0;background:transparent;color:inherit;padding:9px 8px;border-radius:9px;font-weight:600;font-size:13.5px;cursor:pointer}.atabs button.on{background:var(--acc,#4f46e5);color:var(--on,#fff)}
.abox form{display:grid;gap:12px}.abox label{display:grid;gap:5px;font-size:13px;font-weight:600}.abox label small{font-weight:400;color:var(--muted,#5b6478)}
.abox input{width:100%;border:1.5px solid var(--line,#e3e6f0);border-radius:12px;padding:12px 14px;background:transparent;color:inherit;font:inherit;outline:0}.abox input:focus{border-color:var(--acc,#4f46e5);box-shadow:0 0 0 3px rgba(79,70,229,.15)}
.aerr{min-height:18px;color:#e11d48;font-size:13px}.abtn{border:0;border-radius:12px;padding:14px;font-weight:700;font-size:15px;color:var(--on,#fff);background:linear-gradient(135deg,var(--acc,#4f46e5),var(--acc2,#7c3aed));cursor:pointer}.abtn:disabled{opacity:.6;cursor:wait}`;
    document.head.appendChild(s);
  }
})();
