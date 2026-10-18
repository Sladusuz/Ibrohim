'use strict';
// Cloudflare Worker (bitta fayl) yig'adi: worker/dist/worker.mjs  (lib/assistant.js + sayt ma'lumotlari + worker/src/bot.mjs)
// Ishga tushirish: node tools/build-worker.js   (data/site.json va public/pricing.json dan bilimlar bazasi olinadi)
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(R, 'data', 'site.json'), 'utf8'));
let pricing = {}; try { pricing = JSON.parse(fs.readFileSync(path.join(R, 'public', 'pricing.json'), 'utf8')); } catch { /* ixtiyoriy */ }
const keep = ['products', 'services', 'faq', 'process', 'brief'];
const SITE = { company: { name: (site.company || {}).name }, contacts: site.contacts, sections: (site.sections || []).filter((s) => s.enabled !== false && keep.includes(s.type)).map((s) => ({ type: s.type, enabled: true, items: (s.items || []).map((i) => ({ ...i, image: undefined })), services: (s.services || []).map((x) => ({ name: x.name, price: x.price, days: x.days })) })) };
let blog = [], qa = []; try { blog = JSON.parse(fs.readFileSync(path.join(R, 'tools', 'blog.json'), 'utf8')).map((b) => ({ title: b.title, slug: b.slug })); } catch { /* ixtiyoriy */ } try { qa = JSON.parse(fs.readFileSync(path.join(R, 'tools', 'qa.json'), 'utf8')); } catch { /* ixtiyoriy */ }
SITE.blog = blog; SITE.qa = qa;
const PRICING = { templatePrice: pricing.templatePrice || { usd: 10, rate: 12800 } };
const out = `// AVTOMATIK YIG'ILGAN FAYL (node tools/build-worker.js). Qo'lda tahrirlamang: worker/src/bot.mjs va lib/assistant.js ni o'zgartiring.
const __am = { exports: {} };
(function (module) {
${fs.readFileSync(path.join(R, 'lib', 'assistant.js'), 'utf8')}
})(__am);
const makeAssistant = __am.exports;
const SITE = ${JSON.stringify(SITE)};
const PRICING = ${JSON.stringify(PRICING)};
${fs.readFileSync(path.join(R, 'worker', 'src', 'bot.mjs'), 'utf8')}`;
fs.mkdirSync(path.join(R, 'worker', 'dist'), { recursive: true });
fs.writeFileSync(path.join(R, 'worker', 'dist', 'worker.mjs'), out);
console.log('worker/dist/worker.mjs yig\'ildi,', Math.round(out.length / 1024) + ' KB');
