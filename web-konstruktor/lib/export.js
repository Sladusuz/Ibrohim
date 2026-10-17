'use strict';
// Tayyor saytni bitta mustaqil HTML fayl qilib yig'adi (rasmlar ichiga joylanadi) yoki tenant sahifasini chiqaradi.
const fs = require('fs');
const path = require('path');

const MARK = '/*__DATA__*/null';
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jsonForScript = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

module.exports = function makeExporter({ PUBLIC, UPLOADS }) {
  const shell = () => fs.readFileSync(path.join(PUBLIC, 'shablon.html'), 'utf8');
  const resolveLocal = (u) => {
    const m = /^\/(img|uploads)\/([^?#]+)$/.exec(u); if (!m) return null;
    const base = m[1] === 'img' ? path.join(PUBLIC, 'img') : UPLOADS;
    const f = path.normalize(path.join(base, decodeURIComponent(m[2])));
    return f.startsWith(base + path.sep) && fs.existsSync(f) ? f : null;
  };
  const toDataUri = (f) => `data:${MIME[path.extname(f).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;

  // JSON ichidagi /img/... va /uploads/... havolalarini data: manzillarga almashtiradi
  function inlineImages(data) {
    const cache = new Map();
    const walk = (v) => {
      if (typeof v === 'string') {
        if (v[0] !== '/' || !/\.(jpe?g|png|webp|gif|svg)$/i.test(v)) return v;
        if (!cache.has(v)) { const f = resolveLocal(v); cache.set(v, f ? toDataUri(f) : v); }
        return cache.get(v);
      }
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = walk(v[k]); return o; }
      return v;
    };
    return walk(data);
  }

  const setTitle = (html, title, desc) => html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`).replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  const heroOf = (data) => (data.sections || []).find((s) => s.type === 'hero') || {};
  const descOf = (data) => String(heroOf(data).text || (data.company && data.company.tagline) || '').slice(0, 200);

  // Yuklab olinadigan mustaqil fayl
  function standalone(data) {
    const d = inlineImages(data);
    const name = (d.company && d.company.name) || 'Sayt';
    return setTitle(shell().replace(MARK, jsonForScript(d)), name, descOf(d));
  }

  // Subdomenda ishlaydigan sahifa (rasmlar fayl sifatida beriladi, server bilan ishlaydi)
  function tenantPage(data, { origin, slug }) {
    const name = (data.company && data.company.name) || 'Sayt';
    const desc = descOf(data);
    const hero = heroOf(data);
    const cover = /^\/(img|uploads)\//.test(hero.image || '') ? origin + hero.image : '';
    let html = setTitle(shell().replace(MARK, jsonForScript(data)), name, desc);
    const head = [
      `<meta property="og:title" content="${esc(name)}">`, `<meta property="og:description" content="${esc(desc)}">`, '<meta property="og:type" content="website">', `<meta property="og:url" content="${esc(origin)}/">`,
      cover ? `<meta property="og:image" content="${esc(cover)}">` : '', '<meta name="twitter:card" content="summary_large_image">',
      '<link rel="manifest" href="/manifest.webmanifest">', '<link rel="icon" href="/icon.svg" type="image/svg+xml">', '<meta name="theme-color" content="#0a0f1e">',
      `<script>window.__SERVER__=true;window.__API__=location.origin;window.__TENANT__=${jsonForScript(slug)};if('serviceWorker'in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});</script>`,
    ].join('');
    return html.replace('</head>', head + '</head>');
  }

  const manifest = (data, origin) => {
    const name = (data.company && data.company.name) || 'Sayt';
    const acc = (data.theme && /^#[0-9a-f]{6}$/i.test(data.theme.accent || '') && data.theme.accent) || '#4f46e5';
    return { name, short_name: name.slice(0, 12), start_url: '/', scope: '/', display: 'standalone', background_color: '#0a0f1e', theme_color: acc, lang: 'uz', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }], id: origin };
  };
  const icon = (data) => {
    const c = (data.company && data.company.logo) || ((data.company && data.company.name) || 'S')[0] || 'S';
    const acc = (data.theme && /^#[0-9a-f]{6}$/i.test(data.theme.accent || '') && data.theme.accent) || '#4f46e5';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="${acc}"/><text x="256" y="340" font-size="260" font-weight="800" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif">${esc(String(c).slice(0, 2))}</text></svg>`;
  };
  const SW = "const C='site-v1';self.addEventListener('install',e=>{self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).pathname.startsWith('/api/'))return;e.respondWith(fetch(r).then(x=>{if(x.ok&&/\\/(img|uploads)\\//.test(r.url)){const c=x.clone();caches.open(C).then(k=>k.put(r,c))}return x}).catch(()=>caches.match(r)))});";

  return { standalone, tenantPage, manifest, icon, SW, inlineImages };
};
