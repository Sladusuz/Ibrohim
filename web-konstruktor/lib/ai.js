'use strict';
// AI yordamchi: biznes tavsifidan shablon tanlaydi va matnlarni yozadi (Claude API). Kalit bo'lmasa kalit so'z bo'yicha tanlaydi.
module.exports = function makeAi({ getSettings }) {
  const cfg = () => { const a = getSettings().ai || {}; return { key: process.env.ANTHROPIC_API_KEY || a.key || '', model: process.env.AI_MODEL || a.model || 'claude-sonnet-5-5', base: (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '') }; };
  const enabled = () => !!cfg().key;
  const cut = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const num = (v) => { const n = parseInt(String(v == null ? '' : v).replace(/[^\d]/g, ''), 10); return Number.isFinite(n) && n > 0 ? n : 0; };

  const SYSTEM = `Sen o'zbek tilida (lotin yozuvida) ishlaydigan veb-sayt yaratuvchi yordamchisan. Foydalanuvchi biznesini tasvirlaydi.
Vazifang: ro'yxatdagi shablonlardan ENG mosini tanlash va sayt matnlarini yozish. Faqat bitta JSON obyekt qaytar, boshqa hech narsa yozma.
JSON shakli:
{"template":"<id>","name":"<kompaniya nomi>","tagline":"<qisqa shior, 12 so'zgacha>","heroTitle":"<3-7 so'z, bitta so'zni *yulduzcha* ichiga ol>","heroText":"<1-2 jumla>","about":"<2-3 jumla, bitta-ikki so'zni *yulduzcha* ichiga ol>","services":[{"title":"","text":"","price":"<faqat raqam so'mda yoki bo'sh>"}],"faq":[{"q":"","a":""}],"phone":"","address":""}
Qoidalar: services 4-6 ta, faq 3-5 ta; narxlar real bo'lsin (so'mda, faqat raqam); foydalanuvchi bermagan telefon yoki manzilni to'qima (bo'sh qoldir); nomni foydalanuvchi bergan bo'lsa shuni ishlat, bermagan bo'lsa chiroyli mos nom o'ylab top; reklama bo'rttirmasi va soxta statistika yozma.`;

  async function viaClaude(description, templates) {
    const c = cfg();
    const list = templates.map((t) => `${t.id}: ${t.name} (${t.cat}) [${(t.tags || []).slice(0, 6).join(', ')}]`).join('\n');
    const r = await fetch(`${c.base}/v1/messages`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: c.model, max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: `Shablonlar:\n${list}\n\nBiznes tavsifi:\n${cut(description, 1500)}` }] }),
      signal: AbortSignal.timeout(45000),
    });
    if (!r.ok) throw new Error('AI xizmati javob bermadi (' + r.status + ')');
    const j = await r.json();
    const txt = (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    const a = txt.indexOf('{'), b = txt.lastIndexOf('}');
    if (a < 0 || b < a) throw new Error("AI javobi noto'g'ri");
    return JSON.parse(txt.slice(a, b + 1));
  }

  function fallback(description, templates) {
    const d = ' ' + String(description || '').toLowerCase().replace(/[ʻʼ'’`]/g, '') + ' ';
    let best = null, bs = 0;
    for (const t of templates) {
      let s = 0;
      for (const w of [t.id, t.name, t.cat, ...(t.tags || [])]) {
        const x = String(w || '').toLowerCase().replace(/[ʻʼ'’`]/g, '').trim(); if (x.length < 3) continue;
        if (d.includes(x)) s += x.length > 4 ? 3 : 2; else if (x.length > 5 && d.includes(x.slice(0, x.length - 2))) s += 1;
      }
      if (s > bs) { bs = s; best = t; }
    }
    const nm = /["«“]([^"»”]{2,40})["»”]/.exec(description || '') || /\b([A-ZА-Я][\w'-]{2,20}(?:\s[A-ZА-Я][\w'-]{2,20})?)\s+(?:nomli|nomi|deb nomlangan)/.exec(description || '');
    return { template: (best || templates.find((t) => t.id === 'kompaniya') || templates[0] || {}).id, name: nm ? nm[1] : '' };
  }

  function clean(raw, templates, description) {
    const ids = new Set(templates.map((t) => t.id));
    const fb = fallback(description, templates);
    const r = raw && typeof raw === 'object' ? raw : {};
    return {
      template: ids.has(r.template) ? r.template : fb.template,
      name: cut(r.name, 40) || fb.name, tagline: cut(r.tagline, 140), heroTitle: cut(r.heroTitle, 70), heroText: cut(r.heroText, 260), about: cut(r.about, 360),
      services: (Array.isArray(r.services) ? r.services : []).slice(0, 6).map((s) => ({ title: cut(s && s.title, 60), text: cut(s && s.text, 200), price: num(s && s.price) })).filter((s) => s.title),
      faq: (Array.isArray(r.faq) ? r.faq : []).slice(0, 5).map((f) => ({ q: cut(f && f.q, 140), a: cut(f && f.a, 400) })).filter((f) => f.q && f.a),
      phone: cut(r.phone, 30), address: cut(r.address, 140),
    };
  }

  async function generate(description, templates) {
    const tpl = (Array.isArray(templates) ? templates : []).slice(0, 80).map((t) => ({ id: cut(t.id, 30), name: cut(t.name, 60), cat: cut(t.cat, 40), tags: (Array.isArray(t.tags) ? t.tags : []).slice(0, 10).map((x) => cut(x, 30)) })).filter((t) => t.id);
    if (!tpl.length) throw new Error("Shablonlar ro'yxati bo'sh");
    if (enabled()) { try { return { ai: true, result: clean(await viaClaude(description, tpl), tpl, description) }; } catch (e) { return { ai: false, warn: e.message, result: clean(fallback(description, tpl), tpl, description) }; } }
    return { ai: false, result: clean(fallback(description, tpl), tpl, description) };
  }
  return { generate, enabled, cfg };
};
