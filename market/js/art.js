/* Mahsulot illyustratsiyalari (SVG). Rasm yuklanmaguncha shular ko'rinadi. */
(function () {
  const INK = '#1d1b3a';
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, v + amt));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
  };
  const wheel = (cx, cy, r) =>
    `<g class="wheel" style="transform-origin:${cx}px ${cy}px"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#d9ddf2"/>` +
    `<path d="M${cx - r * 0.55} ${cy}h${r * 1.1}M${cx} ${cy - r * 0.55}v${r * 1.1}" stroke="${INK}" stroke-width="2.2"/>` +
    `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${INK}"/></g>`;
  const shadow = (cx, w) => `<ellipse cx="${cx}" cy="138" rx="${w}" ry="5" fill="${INK}" opacity=".13"/>`;

  const A = {
    car: (c) => `${shadow(100, 78)}
      <path d="M20 112v-16q0-15 17-18l23-6 17-23h42l18 23 25 6q16 3 16 18v16z" fill="${c}"/>
      <path d="M20 108h160v6q0 6-6 6H26q-6 0-6-6z" fill="${shade(c, -40)}"/>
      <path d="M77 71l11-17h30l12 17z" fill="#dff1ff"/><path d="M104 54v17" stroke="${c}" stroke-width="3"/>
      <path d="M44 96h28" stroke="${shade(c, 50)}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="168" cy="98" r="6" fill="#FFD54A"/><circle cx="168" cy="98" r="10" fill="#FFD54A" opacity=".25"/>
      <rect x="28" y="96" width="8" height="6" rx="2" fill="#ff7a8a"/>
      ${wheel(56, 116, 17)}${wheel(146, 116, 17)}`,

    stroller: (c) => `${shadow(100, 72)}
      <path d="M52 78a38 38 0 0 1 76 0z" fill="${c}"/>
      <path d="M52 78a38 38 0 0 1 12-28" stroke="${shade(c, 45)}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M44 80h92v14q0 20-24 20H68q-24 0-24-20z" fill="${shade(c, -35)}"/>
      <rect x="56" y="64" width="62" height="18" rx="9" fill="#fff6e0"/>
      <circle cx="82" cy="70" r="7" fill="#ffd9b8"/><path d="M76 66q6-7 12 0" stroke="#7a4b2a" stroke-width="2" fill="none"/>
      <path d="M136 80l22-38h14" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M62 114l-6 8M122 114l10 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      ${wheel(56, 124, 14)}${wheel(138, 124, 14)}`,

    trike: (c) => `${shadow(100, 74)}
      <path d="M50 46a34 30 0 0 1 68 0z" fill="${c}"/>
      <rect x="62" y="56" width="48" height="26" rx="12" fill="#fff6e0"/>
      <path d="M118 82l22 30M62 82l-8 32" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M128 60l14-4h10" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M112 76l28 34" stroke="${shade(c, -30)}" stroke-width="7" stroke-linecap="round"/>
      <path d="M20 96h28" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M26 90h18l2 10H24z" fill="${shade(c, 20)}"/>
      ${wheel(148, 112, 22)}${wheel(50, 122, 15)}${wheel(92, 122, 15)}`,

    moto: (c) => `${shadow(100, 72)}
      <path d="M46 92q10-26 42-26h36l16 14-10 14H60z" fill="${c}"/>
      <path d="M76 66q6-16 22-16h18l-6 16z" fill="${shade(c, -35)}"/>
      <rect x="60" y="58" width="46" height="12" rx="6" fill="${INK}"/>
      <path d="M126 70l16 38" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M118 54h24" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M136 54l8-4" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="148" cy="72" r="8" fill="#FFD54A"/><circle cx="148" cy="72" r="14" fill="#FFD54A" opacity=".25"/>
      <path d="M44 96h-14" stroke="${shade(c, 40)}" stroke-width="5" stroke-linecap="round"/>
      ${wheel(54, 112, 20)}${wheel(146, 112, 20)}
      <circle cx="100" cy="124" r="5" fill="${INK}"/>`,

    scooter: (c) => `${shadow(100, 70)}
      <rect x="34" y="104" width="112" height="9" rx="4.5" fill="${c}"/>
      <path d="M142 108L130 38" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M116 36h30" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <rect x="112" y="31" width="10" height="10" rx="4" fill="${shade(c, -35)}"/><rect x="141" y="31" width="10" height="10" rx="4" fill="${shade(c, -35)}"/>
      <path d="M36 104l-8-8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="94" cy="108" r="3" fill="#fff" opacity=".7"/><circle cx="104" cy="108" r="3" fill="#fff" opacity=".7"/>
      ${wheel(42, 122, 15)}${wheel(146, 122, 16)}`,

    bike: (c) => `${shadow(100, 80)}
      <path d="M58 112l32-44h40l-8 44M90 68l-12 44M58 112h72" stroke="${c}" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M86 56h22" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M130 68l-6-18h14" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="94" cy="112" r="5" fill="${INK}"/>
      ${wheel(54, 108, 28)}${wheel(146, 108, 28)}`,
  };

  window.BCArt = (type, color) => `<svg viewBox="0 0 200 150" role="img" aria-hidden="true">${(A[type] || A.car)(color || '#FFB800')}</svg>`;
})();
