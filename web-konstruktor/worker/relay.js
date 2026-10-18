// Cloudflare Worker: statik saytdagi so'rovlarni Telegram'ga xavfsiz yetkazadi.
// Bot tokeni faqat shu yerda (maxfiy o'zgaruvchi) saqlanadi, saytda emas.
// O'zgaruvchilar (Settings → Variables): TG_TOKEN (secret), TG_CHAT (admin chat ID, vergul bilan bir nechta), ALLOW_ORIGIN (masalan https://improuzbekiston.uz)
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const KIND = { order: '🛒 Yangi buyurtma', booking: '📅 Yangi ariza', message: '✉️ Yangi xabar', brief: "📝 Yangi loyiha so'rovi" };
const hits = new Map();
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allow = (env.ALLOW_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean);
    const okOrigin = !allow.length || allow.includes(origin);
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? origin || '*' : 'null', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !okOrigin) return new Response('Ruxsat yo\'q', { status: 403, headers: cors });
    const ip = req.headers.get('CF-Connecting-IP') || 'x', now = Date.now(), h = (hits.get(ip) || []).filter((t) => now - t < 600000);
    if (h.length >= 8) return new Response('Juda ko\'p so\'rov', { status: 429, headers: cors });
    hits.set(ip, [...h, now]);
    let p; try { p = await req.json(); } catch { return new Response('Noto\'g\'ri so\'rov', { status: 400, headers: cors }); }
    const name = String(p.name || '').trim().slice(0, 80), phone = String(p.phone || '').trim().slice(0, 40);
    if (name.length < 2 || phone.replace(/\D/g, '').length < 7) return new Response('Ism va telefon kerak', { status: 400, headers: cors });
    const L = [`<b>${KIND[p.type] || KIND.message}</b>${p.site ? ' · ' + esc(p.site) : ''}`, `👤 ${esc(name)}`, `📞 ${esc(phone)}`];
    for (const [k, v] of Object.entries(p.extra || {}).slice(0, 30)) if (v) L.push(`• ${esc(String(k).slice(0, 40))}: ${esc(String(v).slice(0, 300))}`);
    if (Array.isArray(p.items) && p.items.length) L.push('🧾 ' + p.items.slice(0, 20).map((i) => `${esc(String(i.name).slice(0, 60))} ×${Number(i.qty) || 1}`).join(', '));
    if (p.message) L.push('', esc(String(p.message).slice(0, 1500)));
    if (p.page) L.push('', `🔗 ${esc(String(p.page).slice(0, 200))}`);
    const text = L.join('\n').slice(0, 4000);
    const results = await Promise.all(String(env.TG_CHAT || '').split(',').map((c) => c.trim()).filter(Boolean).map((chat_id) =>
      fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }) }).then((r) => r.ok).catch(() => false)));
    if (!results.length || !results.some(Boolean)) return new Response('Yuborilmadi', { status: 502, headers: cors });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
