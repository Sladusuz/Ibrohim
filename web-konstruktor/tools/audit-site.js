'use strict';
// Statik sayt audit: sarlavha/tavsif/h1/rasm alt/havolalar/takroriy id/lang/canonical/hreflang. Ishlatish: node tools/audit-site.js
const fs = require('fs'), path = require('path'); const ROOT = path.join(__dirname, '..', 'docs');
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/^(demo)$/.test(f)) walk(p); } else if (f.endsWith('.html')) files.push(p); } })(ROOT);
const exists = (u) => { let p = u.split('#')[0].split('?')[0]; if (!p) return true; if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); return fs.existsSync(f) || fs.existsSync(f + '/index.html') || fs.existsSync(f + '.html'); };
const skip = /^(admin|kabinet|bot|yaratish|shablon|404|admin-demo)/, issues = {}; const add = (f, m) => (issues[f] = issues[f] || []).push(m);
for (const f of files) {
  const rel = '/' + path.relative(ROOT, f).replace(/index\.html$/, ''), h = fs.readFileSync(f, 'utf8'), pub = !skip.test(path.basename(f)) && !/noindex/.test(h);
  if (!/<html[^>]*lang=/.test(h)) add(rel, 'html lang yo\'q');
  if (!/<meta name="viewport"/.test(h)) add(rel, 'viewport yo\'q');
  if (pub) {
    const t = (/<title>([^<]*)<\/title>/.exec(h) || [])[1] || ''; if (t.length < 10 || t.length > 70) add(rel, `title uzunligi ${t.length}`);
    const d = (/<meta name="description" content="([^"]*)"/.exec(h) || [])[1] || ''; if (d.length < 50 || d.length > 175) add(rel, `description uzunligi ${d.length}`);
    if (!/rel="canonical"/.test(h)) add(rel, 'canonical yo\'q'); if (!/property="og:image"/.test(h)) add(rel, 'og:image yo\'q'); const h1 = (h.match(/<h1[\s>]/g) || []).length; if (h1 !== 1) add(rel, `h1 soni ${h1}`);
  }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) add(rel, 'rasmda alt yo\'q: ' + (/src="([^"]*)"/.exec(m[0]) || [])[1]);
  const ids = [...h.matchAll(/\sid="([^"$]+)"/g)].map((m) => m[1]), dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) add(rel, 'takroriy id: ' + [...new Set(dup)].slice(0, 3).join(','));
  for (const m of h.matchAll(/<a\b[^>]*href="([^"#][^"]*)"/g)) { const u = m[1]; if (u.includes('${')) continue; if (/^(https?:|mailto:|tel:|javascript:|data:)/.test(u)) { if (/^https?:\/\/(www\.)?improuzbekiston\.uz/.test(u) && !exists(u.replace(/^https?:\/\/[^/]+/, ''))) add(rel, 'singan havola: ' + u); continue; } if (!exists(u)) add(rel, 'singan havola: ' + u); }
  for (const m of h.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)="(\/[^"]*)"/g)) { const u = m[1]; if (u.includes('${')) continue; if (!/^\/(config\.js|native\.js)/.test(u) && !exists(u)) add(rel, 'resurs yo\'q: ' + u); }
  for (const m of h.matchAll(/<button\b[^>]*>\s*<\/button>/g)) add(rel, "bo'sh tugma"); for (const m of h.matchAll(/<button\b(?![^>]*aria-label)[^>]*>\s*(?:<svg[\s\S]*?<\/svg>)\s*<\/button>/g)) add(rel, 'matnsiz tugmada aria-label yo\'q');
}
const keys = Object.keys(issues); console.log(files.length + ' sahifa tekshirildi.'); for (const k of keys) console.log(' ' + k + '\n   ' + [...new Set(issues[k])].join('\n   ')); console.log(keys.length ? `\n${keys.length} sahifada muammo.` : '\nMuammo topilmadi.'); process.exit(keys.length ? 1 : 0);
