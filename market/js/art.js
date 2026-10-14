/*
 * Mahsulot rasmi yuklanmagan bo'lsa ko'rinadigan studiya uslubidagi illyustratsiyalar.
 *   BC.art('car' | 'stroller' | 'trike' | 'moto' | 'scooter', '#2b59ff') -> SVG satri
 */
(function () {
  'use strict';
  let n = 0;
  const hex2 = (h) => { const x = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [(x >> 16) & 255, (x >> 8) & 255, x & 255]; };
  const shade = (h, a) => '#' + hex2(h).map((v) => Math.max(0, Math.min(255, Math.round(a >= 0 ? v + (255 - v) * a : v * (1 + a)))).toString(16).padStart(2, '0')).join('');

  function wheel(cx, cy, r, id, accent) {
    const hub = accent || '#9aa4b8';
    return `<g class="wh" style="transform-box:fill-box;transform-origin:center"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#101218"/><circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="none" stroke="#1d212b" stroke-width="${r * 0.08}"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="url(#${id}r)"/><circle cx="${cx}" cy="${cy}" r="${r * 0.46}" fill="#161922"/>` +
      [0, 72, 144, 216, 288].map((a) => `<rect x="${cx - r * 0.05}" y="${cy - r * 0.46}" width="${r * 0.1}" height="${r * 0.46}" rx="${r * 0.04}" fill="url(#${id}r)" transform="rotate(${a} ${cx} ${cy})"/>`).join('') +
      `<circle cx="${cx}" cy="${cy}" r="${r * 0.15}" fill="${hub}"/></g>`;
  }
  const defs = (id, c) => `<defs>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, 0.38)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.34)}"/></linearGradient>
    <linearGradient id="${id}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, 0.1)}"/><stop offset="1" stop-color="${shade(c, -0.5)}"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c4264"/><stop offset="1" stop-color="#0a1120"/></linearGradient>
    <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f4f9"/><stop offset=".5" stop-color="#9ea8ba"/><stop offset="1" stop-color="#e6eaf2"/></linearGradient>
    <radialGradient id="${id}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0b1226" stop-opacity=".42"/><stop offset=".6" stop-color="#0b1226" stop-opacity=".14"/><stop offset="1" stop-color="#0b1226" stop-opacity="0"/></radialGradient></defs>`;
  const shadow = (id, cx, w) => `<ellipse cx="${cx}" cy="240" rx="${w}" ry="13" fill="url(#${id}s)"/>`;

  const A = {
    car: (id, c, acc) => `${shadow(id, 200, 190)}
      <rect x="30" y="146" width="344" height="68" rx="26" fill="url(#${id}b)"/>
      <path d="M118 150 L158 96 Q164 88 176 88 H252 Q266 88 276 100 L312 150 Z" fill="url(#${id}g)"/>
      <path d="M130 148 L162 102 Q166 96 174 96 H206 L196 148 Z" fill="#ffffff" opacity=".13"/>
      <path d="M118 150 L158 96 Q164 88 176 88 H252 Q266 88 276 100 L312 150" fill="none" stroke="${shade(c, 0.1)}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M214 90 V148" stroke="${c}" stroke-width="6"/>
      <rect x="326" y="162" width="40" height="11" rx="5.5" fill="#fff6d6"/><rect x="326" y="162" width="40" height="11" rx="5.5" fill="none" stroke="#ffe08a" stroke-width="2"/>
      <rect x="34" y="162" width="20" height="11" rx="5.5" fill="#ff3340"/><rect x="288" y="150" width="6" height="26" rx="3" fill="${shade(c, -0.25)}" opacity=".5"/>
      <path d="M62 188 H340" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>
      <text x="196" y="182" fill="#fff" font-family="Arial,sans-serif" font-weight="800" font-size="15" text-anchor="middle" opacity=".9">BabyCheer</text>
      <rect x="276" y="212" width="94" height="8" rx="4" fill="#12141b"/><rect x="30" y="212" width="86" height="8" rx="4" fill="#12141b"/>
      <circle cx="118" cy="204" r="40" fill="#0e1016"/><circle cx="292" cy="204" r="40" fill="#0e1016"/>
      ${wheel(118, 204, 34, id, acc)}${wheel(292, 204, 34, id, acc)}`,

    stroller: (id, c, acc) => `${shadow(id, 205, 180)}
      <path d="M96 118 C96 66 134 36 186 36 C226 36 256 56 270 92 L282 124 Z" fill="url(#${id}b)"/>
      <path d="M104 112 C108 74 138 50 178 46" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
      <path d="M92 124 H284 V150 Q284 186 246 186 H134 Q92 186 92 150 Z" fill="url(#${id}d)"/>
      <path d="M104 124 H272 V142 H104 Z" fill="${shade(c, 0.5)}" opacity=".55"/>
      <path d="M280 120 L318 66 H342" fill="none" stroke="#1a1d27" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="334" y="58" width="30" height="14" rx="7" fill="#1a1d27"/>
      <path d="M140 186 L112 222 M248 186 L296 226 M176 186 H236" stroke="#8d97aa" stroke-width="7" stroke-linecap="round"/>
      ${wheel(112, 204, 40, id, acc)}${wheel(300, 212, 28, id, acc)}`,

    trike: (id, c, acc) => `${shadow(id, 210, 170)}
      <path d="M84 96 C84 58 118 32 162 32 C204 32 236 58 238 96 Z" fill="url(#${id}b)"/>
      <path d="M92 90 C96 62 122 44 158 40" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
      <rect x="92" y="96" width="140" height="42" rx="20" fill="url(#${id}d)"/><rect x="104" y="102" width="116" height="18" rx="9" fill="${shade(c, 0.55)}" opacity=".6"/>
      <path d="M236 98 L282 190 M232 90 L292 78 H318" fill="none" stroke="#1a1d27" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M112 138 L96 206 M210 138 L214 206 M150 138 V206" stroke="#8d97aa" stroke-width="7" stroke-linecap="round"/>
      <path d="M298 176 l22 -4" stroke="#1a1d27" stroke-width="8" stroke-linecap="round"/>
      <path d="M268 164 L284 126" stroke="${shade(c, -0.25)}" stroke-width="9" stroke-linecap="round"/>
      ${wheel(290, 196, 44, id, acc)}${wheel(92, 214, 24, id, acc)}${wheel(214, 214, 24, id, acc)}`,

    moto: (id, c, acc) => `${shadow(id, 205, 175)}
      <path d="M96 176 Q100 118 168 112 H236 Q266 112 280 138 L292 168 Q290 184 270 186 H122 Q96 188 96 176 Z" fill="url(#${id}b)"/>
      <path d="M150 112 Q156 84 190 82 H236 L228 112 Z" fill="url(#${id}d)"/>
      <rect x="112" y="98" width="106" height="20" rx="10" fill="#171a23"/>
      <path d="M276 110 L318 214" stroke="#1a1d27" stroke-width="10" stroke-linecap="round"/>
      <path d="M268 84 H316 M308 84 L326 76" fill="none" stroke="#1a1d27" stroke-width="8" stroke-linecap="round"/>
      <circle cx="318" cy="120" r="15" fill="#fff6d6" stroke="#ffe08a" stroke-width="3"/>
      <path d="M96 168 H62" stroke="${shade(c, 0.3)}" stroke-width="9" stroke-linecap="round"/>
      <path d="M150 190 H236" stroke="#8d97aa" stroke-width="8" stroke-linecap="round"/>
      <path d="M120 150 H262" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
      ${wheel(92, 204, 36, id, acc)}${wheel(322, 204, 36, id, acc)}`,

    scooter: (id, c, acc) => `${shadow(id, 205, 165)}
      <rect x="82" y="196" width="226" height="18" rx="9" fill="url(#${id}b)"/>
      <rect x="96" y="200" width="150" height="4" rx="2" fill="#fff" opacity=".5"/>
      <path d="M302 202 L270 58" stroke="#1a1d27" stroke-width="10" stroke-linecap="round"/>
      <path d="M284 202 L254 66" stroke="#aeb7c8" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <rect x="236" y="46" width="76" height="16" rx="8" fill="#1a1d27"/><rect x="226" y="42" width="24" height="24" rx="10" fill="${c}"/><rect x="298" y="42" width="24" height="24" rx="10" fill="${c}"/>
      <path d="M86 206 l-22 -22" stroke="#1a1d27" stroke-width="7" stroke-linecap="round"/>
      <circle cx="62" cy="206" r="32" fill="${acc || c}" opacity=".18"/><circle cx="314" cy="206" r="34" fill="${acc || c}" opacity=".18"/>
      ${wheel(62, 212, 24, id, acc)}${wheel(314, 214, 26, id, acc)}`,
  };

  window.BC = window.BC || {};
  window.BC.art = (type, color) => {
    const id = 'a' + ++n, c = /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#2b59ff';
    return `<svg class="art" viewBox="0 0 400 270" role="img" aria-hidden="true">${defs(id, c)}${(A[type] || A.car)(id, c, c)}</svg>`;
  };
  window.BC.shade = shade;
})();
