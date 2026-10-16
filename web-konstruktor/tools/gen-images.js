'use strict';
// Shablonlar uchun namunaviy SVG rasmlar generatori (mahsulot, galereya, loyiha maketi, portret, sahna).
// Ishga tushirish: node tools/gen-images.js  ->  public/img/t/<shablon>/<nom>.svg
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'public', 'img', 't');

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const f = (n) => Math.round(n * 10) / 10;
const svg = (w, h, inner, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${inner}</svg>`;
const grad = (id, c1, c2, x2 = 1, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
const blur = (id, sd) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
function blobs(w, h, cols, r, n, op, seed, filt = 'b') {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${f(R() * w)}" cy="${f(R() * h)}" r="${f(r * (0.6 + R() * 0.8))}" fill="${cols[i % cols.length]}" opacity="${op}" filter="url(#${filt})"/>`;
  return s;
}

/* ---------- Belgilar (ikonka-rasmlar), 200x200 ---------- */
const W = '#ffffff';
const SYM = {
  bag: () => `<path d="M48 82h104l10 88H38z" fill="${W}"/><path d="M72 84V68a28 28 0 0 1 56 0v16" stroke="${W}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="100" cy="112" r="8" fill="#000" opacity=".28"/>`,
  shirt: () => `<path d="M70 40l-45 25 18 32 22-10v83h70V87l22 10 18-32-45-25c-5 15-18 22-30 22S75 55 70 40z" fill="${W}"/><path d="M82 40c6 14 40 14 36 0" stroke="#000" stroke-opacity=".25" stroke-width="5" fill="none"/>`,
  shoe: () => `<path d="M26 132c0-12 6-16 14-18l30-8 12-26c3-7 11-8 16-3l38 30c10 8 22 12 34 14 12 2 18 9 18 18v12H26z" fill="${W}"/><path d="M26 144h162v10a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8z" fill="#000" opacity=".3"/><path d="M94 90l10 8M106 80l10 8M118 90l8 8" stroke="#000" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`,
  phone: () => `<rect x="62" y="22" width="76" height="156" rx="16" fill="${W}"/><rect x="70" y="36" width="60" height="120" rx="7" fill="#000" opacity=".3"/><circle cx="100" cy="167" r="5" fill="#000" opacity=".4"/><rect x="88" y="27" width="24" height="4" rx="2" fill="#000" opacity=".3"/>`,
  headphones: () => `<path d="M45 118V102a55 55 0 0 1 110 0v16" stroke="${W}" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="34" y="108" width="30" height="56" rx="13" fill="${W}"/><rect x="136" y="108" width="30" height="56" rx="13" fill="${W}"/><rect x="42" y="124" width="14" height="24" rx="6" fill="#000" opacity=".28"/><rect x="144" y="124" width="14" height="24" rx="6" fill="#000" opacity=".28"/>`,
  watch: () => `<rect x="72" y="18" width="56" height="34" rx="8" fill="${W}" opacity=".85"/><rect x="72" y="148" width="56" height="34" rx="8" fill="${W}" opacity=".85"/><circle cx="100" cy="100" r="52" fill="${W}"/><circle cx="100" cy="100" r="42" fill="#000" opacity=".28"/><path d="M100 72v30l20 12" stroke="${W}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="152" cy="100" r="5" fill="${W}"/>`,
  laptop: () => `<rect x="38" y="46" width="124" height="86" rx="9" fill="${W}"/><rect x="47" y="55" width="106" height="68" rx="3" fill="#000" opacity=".3"/><path d="M22 140h156l-12 20H34z" fill="${W}"/><rect x="86" y="146" width="28" height="4" rx="2" fill="#000" opacity=".25"/>`,
  cup: () => `<path d="M46 80h84v50a32 32 0 0 1-32 32H78a32 32 0 0 1-32-32z" fill="${W}"/><path d="M130 94h12a19 19 0 0 1 0 38h-12" stroke="${W}" stroke-width="9" fill="none"/><path d="M72 62c0-10 10-10 10-22M98 62c0-10 10-10 10-22" stroke="${W}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".75"/><ellipse cx="88" cy="168" rx="52" ry="6" fill="#000" opacity=".18"/>`,
  bottle: () => `<rect x="87" y="24" width="26" height="28" rx="6" fill="${W}"/><path d="M80 52h40l10 24v84a14 14 0 0 1-14 14H84a14 14 0 0 1-14-14V76z" fill="${W}"/><rect x="77" y="94" width="46" height="44" rx="7" fill="#000" opacity=".28"/>`,
  box: () => `<path d="M100 26l64 33v70l-64 35-64-35V59z" fill="${W}"/><path d="M100 26l64 33-64 33-64-33z" fill="#000" opacity=".16"/><path d="M100 92v72" stroke="#000" stroke-opacity=".28" stroke-width="6"/><path d="M64 44l64 33" stroke="#000" stroke-opacity=".2" stroke-width="6"/>`,
  camera: () => `<path d="M42 64h32l9-14h34l9 14h32a12 12 0 0 1 12 12v72a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12V76a12 12 0 0 1 12-12z" fill="${W}"/><circle cx="100" cy="112" r="32" fill="#000" opacity=".28"/><circle cx="100" cy="112" r="20" fill="${W}"/><circle cx="148" cy="82" r="5" fill="#000" opacity=".3"/>`,
  book: () => `<path d="M28 52c28-8 54-4 72 10 18-14 44-18 72-10v102c-28-8-54-4-72 10-18-14-44-18-72-10z" fill="${W}"/><path d="M100 62v102" stroke="#000" stroke-opacity=".28" stroke-width="5"/><path d="M44 78c14-3 28-2 42 4M44 98c14-3 28-2 42 4M114 82c14-6 28-7 42-4M114 102c14-6 28-7 42-4" stroke="#000" stroke-opacity=".2" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  scissors: () => `<circle cx="60" cy="148" r="22" stroke="${W}" stroke-width="10" fill="none"/><circle cx="60" cy="52" r="22" stroke="${W}" stroke-width="10" fill="none"/><path d="M76 66L172 150M76 134L172 50" stroke="${W}" stroke-width="10" stroke-linecap="round"/>`,
  lipstick: () => `<rect x="74" y="92" width="52" height="82" rx="9" fill="${W}"/><rect x="80" y="58" width="40" height="38" rx="7" fill="${W}" opacity=".85"/><path d="M80 58l20-30 20 30z" fill="${W}"/><rect x="74" y="120" width="52" height="8" fill="#000" opacity=".22"/>`,
  dish: () => `<circle cx="100" cy="112" r="62" fill="${W}"/><circle cx="100" cy="112" r="44" fill="#000" opacity=".2"/><circle cx="100" cy="112" r="26" fill="${W}" opacity=".85"/><path d="M26 56v36M18 56v22a8 8 0 0 0 16 0V56M174 56c-9 6-12 18-12 34h12V56z" stroke="${W}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  pizza: () => `<path d="M100 28c42 0 68 20 78 54L100 178 22 82c10-34 36-54 78-54z" fill="${W}"/><path d="M26 76c24-20 48-26 74-26s50 6 74 26" stroke="#000" stroke-opacity=".18" stroke-width="10" fill="none"/><circle cx="84" cy="78" r="11" fill="#000" opacity=".28"/><circle cx="120" cy="96" r="11" fill="#000" opacity=".28"/><circle cx="98" cy="128" r="10" fill="#000" opacity=".28"/>`,
  burger: () => `<path d="M36 98c0-36 30-58 64-58s64 22 64 58z" fill="${W}"/><circle cx="76" cy="70" r="3.5" fill="#000" opacity=".3"/><circle cx="104" cy="60" r="3.5" fill="#000" opacity=".3"/><circle cx="126" cy="76" r="3.5" fill="#000" opacity=".3"/><rect x="30" y="106" width="140" height="14" rx="7" fill="${W}" opacity=".85"/><rect x="38" y="126" width="124" height="18" rx="9" fill="#000" opacity=".34"/><path d="M36 150h128a10 10 0 0 1-10 22H46a10 10 0 0 1-10-22z" fill="${W}"/>`,
  plant: () => `<path d="M100 176V92" stroke="${W}" stroke-width="8" stroke-linecap="round"/><path d="M100 112C58 112 42 80 44 50c34 0 56 18 56 62z" fill="${W}"/><path d="M100 92c0-42 22-60 58-60 2 34-14 60-58 60z" fill="${W}" opacity=".85"/><path d="M70 176h60l-6-24H76z" fill="${W}"/>`,
  code: () => `<path d="M70 68L34 100l36 32M130 68l36 32-36 32M114 52L86 148" stroke="${W}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  palette: () => `<path d="M100 26c-42 0-74 28-74 68 0 38 32 62 62 62 14 0 15-10 9-19-6-9 0-19 12-19h24c16 0 29-9 29-27 0-36-28-65-62-65z" fill="${W}"/><circle cx="62" cy="90" r="9" fill="#000" opacity=".36"/><circle cx="96" cy="64" r="9" fill="#000" opacity=".5"/><circle cx="134" cy="76" r="9" fill="#000" opacity=".26"/>`,
  gear: () => { let t = ''; for (let i = 0; i < 8; i++) t += `<rect x="90" y="30" width="20" height="26" rx="4" fill="${W}" transform="rotate(${i * 45} 100 100)"/>`; return `${t}<circle cx="100" cy="100" r="50" fill="${W}"/><circle cx="100" cy="100" r="20" fill="#000" opacity=".3"/>`; },
  cap: () => `<path d="M100 38L18 78l82 40 82-40z" fill="${W}"/><path d="M50 98v38c14 18 86 18 100 0V98l-50 24z" fill="${W}" opacity=".88"/><path d="M178 82v52" stroke="${W}" stroke-width="6" stroke-linecap="round"/><circle cx="178" cy="138" r="7" fill="${W}"/>`,
  gift: () => `<rect x="38" y="84" width="124" height="86" rx="9" fill="${W}"/><rect x="30" y="62" width="140" height="30" rx="9" fill="${W}" opacity=".88"/><path d="M100 62v108" stroke="#000" stroke-opacity=".26" stroke-width="14"/><path d="M100 62C90 34 56 34 60 56c4 16 40 6 40 6zm0 0c10-28 44-28 40-6-4 16-40 6-40 6z" fill="${W}"/>`,
  globe: () => `<circle cx="100" cy="100" r="62" fill="${W}"/><path d="M38 100h124M100 38c-24 18-24 106 0 124M100 38c24 18 24 106 0 124" stroke="#000" stroke-opacity=".3" stroke-width="5" fill="none"/>`,
  heart: () => `<path d="M100 170C40 128 30 90 52 66c18-18 40-10 48 8 8-18 30-26 48-8 22 24 12 62-48 104z" fill="${W}"/>`,
  chart: () => `<rect x="36" y="112" width="28" height="58" rx="7" fill="${W}"/><rect x="78" y="82" width="28" height="88" rx="7" fill="${W}" opacity=".9"/><rect x="120" y="96" width="28" height="74" rx="7" fill="${W}" opacity=".8"/><rect x="162" y="50" width="28" height="120" rx="7" fill="${W}"/><path d="M36 76l42-24 42 18 70-44" stroke="#000" stroke-opacity=".28" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  dumbbell: () => `<rect x="20" y="78" width="26" height="44" rx="8" fill="${W}"/><rect x="154" y="78" width="26" height="44" rx="8" fill="${W}"/><rect x="48" y="66" width="22" height="68" rx="8" fill="${W}"/><rect x="130" y="66" width="22" height="68" rx="8" fill="${W}"/><rect x="70" y="94" width="60" height="12" fill="${W}"/>`,
};

const PAL = {
  mint: ['#34d399', '#0ea5a4', '#a7f3d0'], lime: ['#a3e635', '#16a34a', '#ecfccb'], sky: ['#38bdf8', '#2563eb', '#bae6fd'], violet: ['#a78bfa', '#6d28d9', '#ddd6fe'],
  rose: ['#fb7185', '#be185d', '#fecdd3'], sun: ['#fbbf24', '#ea580c', '#fde68a'], ink: ['#334155', '#0f172a', '#94a3b8'], coral: ['#fb923c', '#e11d48', '#fed7aa'],
  teal: ['#2dd4bf', '#0f766e', '#99f6e4'], gold: ['#e7c36b', '#8a5a14', '#fff1c1'], wine: ['#9f1239', '#3b0a1a', '#fda4af'], night: ['#6366f1', '#0b1026', '#a5b4fc'],
  forest: ['#4ade80', '#14532d', '#bbf7d0'], blush: ['#f9a8d4', '#be185d', '#fce7f3'], ocean: ['#22d3ee', '#1e40af', '#cffafe'], sand: ['#fcd34d', '#92400e', '#fef3c7'],
};

/* ---------- Mahsulot rasmi 800x640 ---------- */
function product(sym, pal, seed = 1) {
  const [c1, c2, c3] = pal; const w = 800, h = 640;
  const defs = grad('g', c1, c2) + blur('b', 50) + blur('s', 10);
  return svg(w, h, `<rect width="${w}" height="${h}" fill="url(#g)"/>${blobs(w, h, [c3, '#ffffff', c1], 220, 3, 0.35, seed)}<circle cx="400" cy="300" r="190" fill="#fff" opacity=".13"/><circle cx="400" cy="300" r="130" fill="#fff" opacity=".1"/><ellipse cx="400" cy="506" rx="170" ry="20" fill="#000" opacity=".22" filter="url(#s)"/><g transform="translate(400 300) scale(2.2) translate(-100 -100)">${SYM[sym]()}</g>`, defs);
}
/* ---------- Portret 400x460 ---------- */
function avatar(pal, seed = 1) {
  const [c1, c2, c3] = pal; const R = rng(seed); const style = Math.floor(R() * 4);
  const hair = [
    `<path d="M124 190c-6-62 36-92 78-86 40 6 74 38 68 92-12-30-46-44-72-44s-60 14-74 38z" fill="#000" opacity=".5"/>`,
    `<path d="M120 200c-10-70 30-104 82-98 46 6 78 44 66 104-4-40-26-66-68-66s-70 22-80 60z" fill="#000" opacity=".5"/><path d="M122 200c-4 36 6 70 14 84-14-8-24-50-14-84z" fill="#000" opacity=".5"/>`,
    `<circle cx="200" cy="124" r="22" fill="#000" opacity=".5"/><path d="M128 188c0-52 32-76 72-76s72 24 72 76c-16-28-44-38-72-38s-56 10-72 38z" fill="#000" opacity=".5"/>`,
    `<path d="M126 186c2-48 34-70 74-70s72 22 74 70c-20-22-46-30-74-30s-54 8-74 30z" fill="#000" opacity=".5"/>`,
  ][style];
  return svg(400, 460, `<rect width="400" height="460" fill="url(#g)"/>${blobs(400, 460, [c3, '#fff'], 150, 2, 0.35, seed + 7)}<path d="M30 460c0-96 74-146 170-146s170 50 170 146z" fill="#fff" opacity=".92"/><path d="M168 300h64v34c-14 12-50 12-64 0z" fill="#fff" opacity=".9"/><ellipse cx="200" cy="206" rx="70" ry="82" fill="#fff" opacity=".96"/>${hair}`, grad('g', c1, c2) + blur('b', 40));
}
/* ---------- Loyiha maketlari 1000x780 ---------- */
function mock(kind, pal, seed = 1, letter = 'A') {
  const [c1, c2, c3] = pal; const w = 1000, h = 780; const R = rng(seed);
  const defs = grad('g', c1, c2) + grad('g2', c3, c1) + blur('b', 50) + blur('s', 14);
  let body = `<rect width="${w}" height="${h}" fill="url(#g)"/>${blobs(w, h, [c3, '#fff'], 260, 3, 0.28, seed)}`;
  if (kind === 'web') {
    body += `<rect x="120" y="120" width="760" height="540" rx="26" fill="#000" opacity=".25" filter="url(#s)" transform="translate(0 18)"/><rect x="120" y="110" width="760" height="540" rx="24" fill="#fff"/><rect x="120" y="110" width="760" height="46" rx="24" fill="#eef0f6"/><rect x="120" y="140" width="760" height="16" fill="#eef0f6"/><circle cx="152" cy="133" r="6" fill="#ff5f57"/><circle cx="174" cy="133" r="6" fill="#febc2e"/><circle cx="196" cy="133" r="6" fill="#28c840"/><rect x="156" y="190" width="260" height="22" rx="11" fill="#0f172a" opacity=".85"/><rect x="156" y="226" width="400" height="12" rx="6" fill="#0f172a" opacity=".2"/><rect x="156" y="250" width="340" height="12" rx="6" fill="#0f172a" opacity=".2"/><rect x="156" y="288" width="120" height="38" rx="19" fill="${c2}"/><rect x="600" y="180" width="244" height="170" rx="18" fill="url(#g2)"/>`;
    for (let i = 0; i < 3; i++) body += `<rect x="${156 + i * 234}" y="400" width="214" height="200" rx="16" fill="#f3f4f8"/><rect x="${156 + i * 234}" y="400" width="214" height="104" rx="16" fill="${[c1, c3, c2][i]}" opacity=".85"/><rect x="${176 + i * 234}" y="528" width="120" height="12" rx="6" fill="#0f172a" opacity=".6"/><rect x="${176 + i * 234}" y="552" width="90" height="10" rx="5" fill="#0f172a" opacity=".2"/>`;
  } else if (kind === 'app') {
    for (let k = 0; k < 2; k++) {
      const x = 190 + k * 330, y = k ? 150 : 90;
      body += `<rect x="${x}" y="${y + 20}" width="260" height="520" rx="46" fill="#000" opacity=".3" filter="url(#s)"/><rect x="${x}" y="${y}" width="260" height="520" rx="46" fill="#0b0f1a"/><rect x="${x + 10}" y="${y + 10}" width="240" height="500" rx="38" fill="#fff"/><rect x="${x + 90}" y="${y + 20}" width="80" height="18" rx="9" fill="#0b0f1a"/><rect x="${x + 28}" y="${y + 66}" width="120" height="16" rx="8" fill="#0f172a" opacity=".8"/><rect x="${x + 28}" y="${y + 96}" width="204" height="130" rx="22" fill="url(#g${k ? '' : '2'})"/>`;
      for (let i = 0; i < 3; i++) body += `<rect x="${x + 28}" y="${y + 250 + i * 70}" width="204" height="56" rx="16" fill="#f1f3f8"/><circle cx="${x + 58}" cy="${y + 278 + i * 70}" r="16" fill="${[c1, c2, c3][i]}"/><rect x="${x + 86}" y="${y + 268 + i * 70}" width="100" height="10" rx="5" fill="#0f172a" opacity=".55"/><rect x="${x + 86}" y="${y + 286 + i * 70}" width="70" height="8" rx="4" fill="#0f172a" opacity=".2"/>`;
    }
  } else if (kind === 'brand') {
    body = `<rect width="${w}" height="${h}" fill="${c2}"/>${blobs(w, h, [c1, c3], 280, 3, 0.4, seed)}<circle cx="500" cy="390" r="230" fill="#fff"/><circle cx="500" cy="390" r="190" fill="url(#g2)"/><text x="500" y="458" font-family="Georgia,serif" font-weight="700" font-size="210" text-anchor="middle" fill="#fff">${letter}</text><rect x="320" y="660" width="360" height="14" rx="7" fill="#fff" opacity=".5"/><rect x="400" y="690" width="200" height="10" rx="5" fill="#fff" opacity=".3"/>`;
  } else if (kind === 'poster') {
    body = `<rect width="${w}" height="${h}" fill="${c3}"/><rect x="210" y="70" width="580" height="640" fill="${c2}"/><circle cx="500" cy="300" r="170" fill="${c1}"/><path d="M210 710V520c120-80 220 60 340-10 100-60 170-20 240-40V710z" fill="#fff" opacity=".9"/><rect x="250" y="600" width="260" height="22" fill="${c2}"/><rect x="250" y="640" width="180" height="14" fill="${c2}" opacity=".5"/><circle cx="660" cy="150" r="38" fill="#fff"/>`;
  } else if (kind === 'dash') {
    body = `<rect width="${w}" height="${h}" fill="#0b1020"/>${blobs(w, h, [c1, c2], 260, 3, 0.35, seed)}<rect x="90" y="90" width="820" height="600" rx="26" fill="#10172e" stroke="#ffffff" stroke-opacity=".1"/>`;
    for (let i = 0; i < 3; i++) body += `<rect x="${120 + i * 262}" y="120" width="236" height="110" rx="18" fill="#ffffff" fill-opacity=".05"/><rect x="${140 + i * 262}" y="146" width="90" height="10" rx="5" fill="#fff" opacity=".4"/><rect x="${140 + i * 262}" y="176" width="130" height="30" rx="8" fill="${[c1, c2, c3][i]}"/>`;
    let bars = ''; for (let i = 0; i < 12; i++) { const bh = 40 + R() * 200; bars += `<rect x="${130 + i * 32}" y="${620 - bh}" width="20" height="${f(bh)}" rx="6" fill="${i % 3 ? c1 : c2}" opacity=".9"/>`; }
    body += `<rect x="120" y="260" width="520" height="400" rx="18" fill="#ffffff" fill-opacity=".04"/>${bars}<rect x="670" y="260" width="210" height="400" rx="18" fill="#ffffff" fill-opacity=".04"/><circle cx="775" cy="400" r="62" fill="none" stroke="${c1}" stroke-width="26" stroke-dasharray="260 130" transform="rotate(-90 775 400)"/><circle cx="775" cy="400" r="62" fill="none" stroke="${c3}" stroke-width="26" stroke-dasharray="90 400" stroke-dashoffset="-260" transform="rotate(-90 775 400)"/>`;
  } else if (kind === 'pack') {
    body += `<ellipse cx="500" cy="640" rx="300" ry="30" fill="#000" opacity=".25" filter="url(#s)"/><path d="M500 140l230 120v260l-230 130-230-130V260z" fill="#fff"/><path d="M500 140l230 120-230 120-230-120z" fill="#000" opacity=".1"/><path d="M500 380v270" stroke="#000" stroke-opacity=".12" stroke-width="4"/><path d="M270 260l230 120v270L270 520z" fill="${c3}" opacity=".35"/><text x="385" y="505" font-family="Georgia,serif" font-weight="700" font-size="120" fill="${c2}" text-anchor="middle" transform="rotate(26 385 505) skewY(-0)">${letter}</text><circle cx="610" cy="470" r="46" fill="${c1}"/>`;
  }
  return svg(w, h, body, defs);
}
/* ---------- Mavhum / manzara / sahna ---------- */
function abstract(kind, pal, seed = 1, w = 900, h = 700) {
  const [c1, c2, c3] = pal; const R = rng(seed); const defs = grad('g', c1, c2, 0.4, 1) + grad('sky', c3, c1, 0, 1) + blur('b', 46) + blur('s', 10);
  let b = '';
  if (kind === 'mountains') {
    b += `<rect width="${w}" height="${h}" fill="url(#sky)"/><circle cx="${f(w * (0.3 + R() * 0.4))}" cy="${f(h * 0.34)}" r="${f(h * 0.11)}" fill="#fff" opacity=".85"/><circle cx="${f(w * 0.5)}" cy="${f(h * 0.34)}" r="0" fill="#fff"/>`;
    const layers = [[0.55, c1, 0.55], [0.64, c2, 0.75], [0.74, '#0b1220', 0.9]];
    layers.forEach(([base, col, op], li) => { let d = `M0 ${h}L0 ${f(h * base)}`; const n = 7 + li * 2; for (let i = 1; i <= n; i++) d += `L${f((w / n) * i)} ${f(h * (base - 0.05 - R() * 0.16 + (i % 2 ? 0 : 0.06)))}`; d += `L${w} ${h}z`; b += `<path d="${d}" fill="${col}" opacity="${op}"/>`; });
  } else if (kind === 'waves') {
    b += `<rect width="${w}" height="${h}" fill="url(#g)"/>${blobs(w, h, [c3], 260, 2, 0.3, seed)}`;
    for (let i = 0; i < 5; i++) { const y = h * (0.35 + i * 0.13); b += `<path d="M0 ${f(y)}C${f(w * 0.25)} ${f(y - 90 + R() * 40)} ${f(w * 0.5)} ${f(y + 90 - R() * 40)} ${w} ${f(y - 20)}V${h}H0z" fill="${i % 2 ? c3 : '#fff'}" opacity="${f(0.1 + i * 0.07)}"/>`; }
  } else if (kind === 'aperture') {
    b += `<rect width="${w}" height="${h}" fill="#0a0a0f"/>${blobs(w, h, [c1, c2], 240, 2, 0.4, seed)}`;
    for (let i = 0; i < 6; i++) b += `<path d="M${w / 2} ${h / 2}L${f(w / 2 + 230)} ${f(h / 2 - 40)}A230 230 0 0 1 ${f(w / 2 + 120)} ${f(h / 2 + 196)}z" fill="${[c1, c2, c3][i % 3]}" opacity=".85" transform="rotate(${i * 60} ${w / 2} ${h / 2})"/>`;
    b += `<circle cx="${w / 2}" cy="${h / 2}" r="64" fill="#0a0a0f"/><circle cx="${w / 2}" cy="${h / 2}" r="250" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>`;
  } else if (kind === 'orbs') {
    b += `<rect width="${w}" height="${h}" fill="#0b0d16"/>${blobs(w, h, [c1, c2, c3], 190, 6, 0.85, seed)}`;
  } else if (kind === 'tiles') {
    b += `<rect width="${w}" height="${h}" fill="${c2}"/>`;
    const cols = 6, rows = 5, tw = w / cols, th = h / rows;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) b += `<rect x="${f(x * tw + 6)}" y="${f(y * th + 6)}" width="${f(tw - 12)}" height="${f(th - 12)}" rx="${R() > 0.5 ? 40 : 8}" fill="${[c1, c3, '#fff'][Math.floor(R() * 3)]}" opacity="${f(0.25 + R() * 0.7)}"/>`;
  } else if (kind === 'stripes') {
    b += `<rect width="${w}" height="${h}" fill="${c3}"/>`;
    for (let i = -4; i < 14; i++) b += `<path d="M${f(i * 100)} 0h${f(40 + R() * 50)}L${f(i * 100 - 280)} ${h}h-${f(40 + R() * 50)}z" fill="${i % 2 ? c1 : c2}" opacity="${f(0.55 + R() * 0.4)}"/>`;
  } else if (kind === 'city') {
    b += `<rect width="${w}" height="${h}" fill="url(#sky)"/><circle cx="${f(w * 0.72)}" cy="${f(h * 0.3)}" r="${f(h * 0.09)}" fill="#fff" opacity=".8"/>`;
    let x = 0; while (x < w) { const bw = 40 + R() * 70, bh = h * (0.22 + R() * 0.38); b += `<rect x="${f(x)}" y="${f(h - bh)}" width="${f(bw)}" height="${f(bh)}" fill="${R() > 0.5 ? '#0b1220' : c2}" opacity=".92"/>`; for (let wy = h - bh + 14; wy < h - 10; wy += 24) if (R() > 0.45) b += `<rect x="${f(x + 8)}" y="${f(wy)}" width="8" height="10" fill="#fde68a" opacity=".85"/>`; x += bw + 3; }
  } else if (kind === 'bauhaus') {
    b += `<rect width="${w}" height="${h}" fill="${c3}"/><circle cx="${f(w * 0.3)}" cy="${f(h * 0.45)}" r="${f(h * 0.3)}" fill="${c1}"/><rect x="${f(w * 0.46)}" y="${f(h * 0.18)}" width="${f(w * 0.4)}" height="${f(h * 0.4)}" fill="${c2}"/><path d="M${f(w * 0.46)} ${h}L${f(w * 0.66)} ${f(h * 0.58)}L${f(w * 0.86)} ${h}z" fill="#fff" opacity=".92"/><circle cx="${f(w * 0.78)}" cy="${f(h * 0.24)}" r="${f(h * 0.07)}" fill="#fff"/><rect x="0" y="${f(h * 0.84)}" width="${f(w * 0.46)}" height="${f(h * 0.05)}" fill="${c2}"/>`;
  } else if (kind === 'plate') {
    b += `<rect width="${w}" height="${h}" fill="url(#g)"/>${blobs(w, h, [c3, c1], 300, 3, 0.35, seed)}<circle cx="${f(w * 0.68)}" cy="${f(h * 0.52)}" r="${f(h * 0.4)}" fill="#fff" opacity=".1"/><circle cx="${f(w * 0.68)}" cy="${f(h * 0.52)}" r="${f(h * 0.34)}" fill="#fff" opacity=".92"/><circle cx="${f(w * 0.68)}" cy="${f(h * 0.52)}" r="${f(h * 0.26)}" fill="${c2}" opacity=".35"/><circle cx="${f(w * 0.68)}" cy="${f(h * 0.52)}" r="${f(h * 0.17)}" fill="#f2d38b"/>`;
    ['#e8892b', '#7a3b12', '#fff3c4', '#5aa469', '#c8501e'].forEach((col, ci) => { for (let k = 0; k < 6; k++) { const a = R() * 6.283, d = R() * h * 0.14; b += `<circle cx="${f(w * 0.68 + Math.cos(a) * d)}" cy="${f(h * 0.52 + Math.sin(a) * d)}" r="${f(5 + R() * 8)}" fill="${col}" opacity="${f(0.7 + R() * 0.3)}"/>`; } });
    for (let i = 0; i < 18; i++) b += `<circle cx="${f(w * 0.45 + R() * w * 0.5)}" cy="${f(h * 0.1 + R() * h * 0.8)}" r="${f(3 + R() * 8)}" fill="${c3}" opacity="${f(0.2 + R() * 0.5)}"/>`;
    b += `<path d="M${f(w * 0.6)} ${f(h * 0.2)}c-20-30 20-40 0-80M${f(w * 0.68)} ${f(h * 0.2)}c-20-30 20-40 0-80M${f(w * 0.76)} ${f(h * 0.2)}c-20-30 20-40 0-80" stroke="#fff" stroke-opacity=".5" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  } else if (kind === 'orbit') {
    b += `<rect width="${w}" height="${h}" fill="url(#g)"/>${blobs(w, h, [c3, '#fff'], 260, 3, 0.3, seed)}`;
    for (let i = 1; i <= 4; i++) b += `<ellipse cx="${f(w * 0.66)}" cy="${f(h * 0.5)}" rx="${f(h * 0.14 * i)}" ry="${f(h * 0.1 * i)}" fill="none" stroke="#fff" stroke-opacity="${f(0.45 - i * 0.07)}" stroke-width="3" transform="rotate(-18 ${f(w * 0.66)} ${f(h * 0.5)})"/>`;
    b += `<circle cx="${f(w * 0.66)}" cy="${f(h * 0.5)}" r="${f(h * 0.1)}" fill="#fff" opacity=".95"/><circle cx="${f(w * 0.66)}" cy="${f(h * 0.5)}" r="${f(h * 0.06)}" fill="${c2}"/><circle cx="${f(w * 0.86)}" cy="${f(h * 0.3)}" r="14" fill="#fff"/><circle cx="${f(w * 0.5)}" cy="${f(h * 0.74)}" r="10" fill="${c3}"/>`;
  } else if (kind === 'petals') {
    b += `<rect width="${w}" height="${h}" fill="url(#g)"/>${blobs(w, h, [c3, '#fff'], 280, 3, 0.4, seed)}`;
    for (let i = 0; i < 9; i++) b += `<ellipse cx="${f(w * 0.62)}" cy="${f(h * 0.5)}" rx="${f(h * 0.06)}" ry="${f(h * 0.22)}" fill="#fff" opacity="${f(0.55 - i * 0.04)}" transform="rotate(${i * 40} ${f(w * 0.62)} ${f(h * 0.5)}) translate(0 -${f(h * 0.14)})"/>`;
    b += `<circle cx="${f(w * 0.62)}" cy="${f(h * 0.5)}" r="${f(h * 0.07)}" fill="${c2}" opacity=".8"/>`;
  }
  return svg(w, h, b, defs);
}
const sceneBg = (pal, seed, w, h) => abstract('waves', pal, seed, w, h);

/* ---------- Manifest ---------- */
const files = {};
const add = (name, s) => { files[name + '.svg'] = s; };
// MARKET
const mk = 'market/';
[['phone', 'phone', 'violet'], ['headphones', 'headphones', 'coral'], ['watch', 'watch', 'ink'], ['laptop', 'laptop', 'sky'], ['shirt', 'shirt', 'rose'], ['shoe', 'shoe', 'sun'], ['bag', 'bag', 'teal'], ['cup', 'cup', 'sand'], ['bottle', 'bottle', 'ocean'], ['box', 'box', 'lime'], ['gift', 'gift', 'blush'], ['lipstick', 'lipstick', 'wine']].forEach(([n, s, p], i) => add(mk + 'p-' + n, product(s, PAL[p], i + 3)));
[['elektronika', 'phone', 'night'], ['kiyim', 'shirt', 'rose'], ['uy', 'cup', 'sun'], ['sovga', 'gift', 'forest']].forEach(([n, s, p], i) => add(mk + 'c-' + n, product(s, PAL[p], i + 20)));
add(mk + 'h1', product('bag', PAL.mint, 41)); add(mk + 'h2', product('headphones', PAL.coral, 42)); add(mk + 'h3', product('shoe', PAL.violet, 43));
add(mk + 'banner', abstract('tiles', PAL.forest, 5, 900, 700));
['a1', 'a2', 'a3'].forEach((n, i) => add(mk + n, avatar([PAL.mint, PAL.rose, PAL.sky][i], i + 1)));
// PORTFOLIO DIZAYNER
const dz = 'dizayner/';
[['p1', 'brand', 'wine', 'N'], ['p2', 'poster', 'sun', ''], ['p3', 'web', 'violet', ''], ['p4', 'pack', 'teal', 'L'], ['p5', 'app', 'coral', ''], ['p6', 'brand', 'ocean', 'M']].forEach(([n, k, p, l], i) => add(dz + n, mock(k, PAL[p], i + 11, l || 'A')));
add(dz + 'hero', abstract('bauhaus', ['#ff5a36', '#1b1b1b', '#f3ede2'], 3, 1200, 900)); add(dz + 'about', abstract('bauhaus', ['#2563eb', '#111827', '#fde68a'], 8, 900, 1000));
['a1', 'a2'].forEach((n, i) => add(dz + n, avatar([PAL.sun, PAL.violet][i], i + 5)));
// PORTFOLIO DASTURCHI
const dv = 'dasturchi/';
[['p1', 'dash', 'night'], ['p2', 'web', 'ocean'], ['p3', 'app', 'violet'], ['p4', 'dash', 'teal'], ['p5', 'web', 'rose'], ['p6', 'app', 'sky']].forEach(([n, k, p], i) => add(dv + n, mock(k, PAL[p], i + 31)));
add(dv + 'a1', avatar(PAL.night, 9));
// PORTFOLIO FOTOGRAF
const ft = 'fotograf/';
add(ft + 'hero', abstract('mountains', ['#ff9a62', '#1d2a4a', '#ffd9a8'], 4, 1600, 900));
[['g1', 'mountains', ['#7aa7ff', '#14213d', '#ffe3b3'], 21], ['g2', 'city', ['#f97316', '#1e293b', '#fcd9a8'], 22], ['g3', 'waves', PAL.ocean, 23], ['g4', 'aperture', PAL.sun, 24], ['g5', 'mountains', ['#ff8e72', '#2b1b3d', '#ffd1a1'], 25], ['g6', 'orbs', PAL.night, 26], ['g7', 'stripes', PAL.teal, 27], ['g8', 'city', ['#8b5cf6', '#0b1020', '#f9a8d4'], 28], ['g9', 'mountains', ['#34d399', '#0f3d3e', '#d1fae5'], 29]].forEach(([n, k, p, s]) => add(ft + n, abstract(k, p, s)));
add(ft + 'about', abstract('mountains', ['#ffb36b', '#1f2540', '#ffe0b8'], 12, 900, 1000));
['a1', 'a2'].forEach((n, i) => add(ft + n, avatar([PAL.sun, PAL.blush][i], i + 12)));
// KOMPANIYA (Impro IT)
const kp = 'kompaniya/';
[['start', 'code', 'sky'], ['dokon', 'bag', 'violet'], ['bot', 'globe', 'teal'], ['ilova', 'phone', 'coral'], ['dizayn', 'palette', 'rose'], ['yordam', 'gear', 'night']].forEach(([n, s, p], i) => add(kp + 'p-' + n, product(s, PAL[p], i + 51)));
['a1', 'a2', 'a3', 'a4'].forEach((n, i) => add(kp + n, avatar([PAL.sky, PAL.violet, PAL.teal, PAL.coral][i], i + 20)));
add(kp + 'about', abstract('orbit', ['#6366f1', '#0b1026', '#22d3ee'], 14, 900, 1000));
// RESTORAN
const rs = 'restoran/';
add(rs + 'hero', abstract('plate', ['#3b0f10', '#d4a64a', '#f0d28a'], 6, 1600, 900)); add(rs + 'about', abstract('plate', ['#2a1608', '#c98a2b', '#ffe3a3'], 15, 900, 1000));
[['m1', 'dish', 'gold'], ['m2', 'pizza', 'coral'], ['m3', 'burger', 'sun'], ['m4', 'dish', 'wine'], ['m5', 'plant', 'forest'], ['m6', 'cup', 'sand'], ['m7', 'pizza', 'rose'], ['m8', 'dish', 'teal']].forEach(([n, s, p], i) => add(rs + n, product(s, PAL[p], i + 61)));
[['g1', 'plate', ['#2a1608', '#d4a64a', '#ffe3a3'], 31], ['g2', 'orbs', PAL.wine, 32], ['g3', 'plate', ['#101c14', '#2f9e5b', '#c8f3d4'], 33], ['g4', 'waves', PAL.gold, 34], ['g5', 'tiles', PAL.wine, 35], ['g6', 'plate', ['#1b1020', '#e45f8a', '#ffd0e0'], 36]].forEach(([n, k, p, s]) => add(rs + n, abstract(k, p, s)));
['a1', 'a2', 'a3'].forEach((n, i) => add(rs + n, avatar([PAL.gold, PAL.wine, PAL.coral][i], i + 30)));
// SALON
const sl = 'salon/';
add(sl + 'hero', abstract('petals', ['#f4a3c0', '#c2185b', '#ffe4ee'], 7, 1000, 1100)); add(sl + 'about', abstract('waves', ['#f7b6cf', '#a3174f', '#ffe9f1'], 16, 900, 1000));
['t1', 't2', 't3', 't4'].forEach((n, i) => add(sl + n, avatar([PAL.rose, PAL.blush, PAL.wine, PAL.coral][i], i + 40)));
[['g1', 'petals', ['#f4a3c0', '#c2185b', '#ffe4ee'], 41], ['g2', 'waves', PAL.blush, 42], ['g3', 'orbs', PAL.rose, 43], ['g4', 'tiles', PAL.blush, 44], ['g5', 'petals', ['#c9a063', '#7a1f3d', '#ffe9c7'], 45], ['g6', 'waves', PAL.rose, 46]].forEach(([n, k, p, s]) => add(sl + n, abstract(k, p, s)));
['a1', 'a2', 'a3'].forEach((n, i) => add(sl + n, avatar([PAL.blush, PAL.rose, PAL.sun][i], i + 45)));
// TA'LIM
const ta = 'talim/';
add(ta + 'hero', abstract('orbit', ['#0b78d1', '#0b2a5c', '#7dd3fc'], 8, 1100, 1000)); add(ta + 'about', abstract('orbit', ['#12b5a6', '#0b3a5c', '#a7f3d0'], 17, 900, 1000));
[['c1', 'code', 'night'], ['c2', 'globe', 'ocean'], ['c3', 'palette', 'rose'], ['c4', 'chart', 'teal'], ['c5', 'cap', 'sun'], ['c6', 'camera', 'violet']].forEach(([n, s, p], i) => { if (!SYM[s]) s = 'book'; add(ta + n, product(s, PAL[p], i + 71)); });
['t1', 't2', 't3'].forEach((n, i) => add(ta + n, avatar([PAL.ocean, PAL.teal, PAL.violet][i], i + 50)));
['a1', 'a2', 'a3'].forEach((n, i) => add(ta + n, avatar([PAL.sky, PAL.mint, PAL.sun][i], i + 55)));

let count = 0, bytes = 0;
for (const [name, s] of Object.entries(files)) {
  const fp = path.join(OUT, name); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, s); count++; bytes += s.length;
}
console.log(`${count} ta rasm yaratildi (${Math.round(bytes / 1024)} KB)`);
