'use strict';
// Interfeys tarjimasi (ru/en): sahifa tiliga qarab matn, placeholder va sarlavhalarni lug'at bo'yicha almashtiradi.
// Lug'at: i18n-dict.js (kalit: o'zbekcha matn). O'zbekcha sahifada hech narsa qilmaydi.
(function () {
  const lang = document.documentElement.lang || 'uz';
  const D = (window.I18N_DICT || {})[lang];
  const norm = (s) => String(s).replace(/[ʻʼ’‘`´]/g, "'").replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  window.I18N = { lang, t: (s) => s };
  if (!D || lang === 'uz') return;
  const M = new Map(); for (const k of Object.keys(D)) M.set(norm(k), D[k]);
  const CUR = lang === 'ru' ? 'сум' : 'UZS', UNITS = lang === 'ru' ? { oy: 'мес.', kun: 'дн.', hafta: 'нед.', dona: 'шт.' } : { oy: 'mo', kun: 'days', hafta: 'weeks', dona: 'pcs' };
  const PRE = lang === 'ru' ? 'от' : 'from';
  // Raqamli naqshlar: "2 500 000 so'm dan", "1–2 oy", "Taxminan 5 mln so'm"
  const pat = (n) => {
    let m;
    if ((m = /^([\d\s.,–-]+) so'm dan$/.exec(n))) return `${PRE} ${m[1]} ${CUR}`;
    if ((m = /^([\d\s.,–-]+) so'm$/.exec(n))) return `${m[1]} ${CUR}`;
    if ((m = /^([\d\s.,–-]+) (oy|kun|hafta|dona)$/.exec(n))) return `${m[1]} ${UNITS[m[2]]}`;
    if ((m = /^(\d+)\s*\/\s*(\d+): (.+)$/.exec(n))) { const t = M.get(norm(m[3])); return t ? `${m[1]} / ${m[2]}: ${t}` : null; }
    return null;
  };
  const tr = (s) => { const n = norm(s); if (!n) return null; const v = M.get(n) || pat(n); return v && v !== n ? v : null; };
  window.I18N.t = (s) => tr(s) || s;
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'value'];
  function node(n) {
    if (n.nodeType === 3) { const p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(p.nodeName)) return; const v = tr(n.nodeValue); if (v) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), v); return; }
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(n.nodeName)) return;
    for (const a of ATTRS) { if (n.hasAttribute(a) && (a !== 'value' || /^(BUTTON|INPUT)$/.test(n.nodeName) && /submit|button/.test(n.type || 'button'))) { const v = tr(n.getAttribute(a)); if (v) n.setAttribute(a, v); } }
    for (const c of n.childNodes) node(c);
  }
  let q = [], sch = false;
  const flush = () => { sch = false; const l = q; q = []; for (const x of l) if (x.isConnected !== false) node(x); };
  const push = (x) => { q.push(x); if (!sch) { sch = true; (window.requestAnimationFrame || setTimeout)(flush); } };
  new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'characterData') push(m.target); else if (m.type === 'attributes') push(m.target); else for (const a of m.addedNodes) push(a); } })
    .observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.filter((a) => a !== 'value') });
  const start = () => node(document.body);
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  // alert()/confirm() oynalari ham tarjima qilinadi
  for (const f of ['alert', 'confirm', 'prompt']) { const o = window[f]; window[f] = (m, ...r) => o.call(window, tr(m) || m, ...r); }
})();
