'use strict';
// tools/i18n/*.json ({"o'zbekcha": {ru, en}}) fayllaridan public/i18n-dict.js yig'adi
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'i18n'), D = { ru: {}, en: {} };
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const [k, v] of Object.entries(j)) { if (v && v.ru && v.en) { D.ru[k.replace(/\\'/g, "'")] = v.ru; D.en[k.replace(/\\'/g, "'")] = v.en; } }
}
fs.writeFileSync(path.join(__dirname, '..', 'public', 'i18n-dict.js'), `(function(d){if(typeof module!=="undefined")module.exports=d;else window.I18N_DICT=d;})(${JSON.stringify(D)});\n`);
console.log('i18n-dict.js:', Object.keys(D.ru).length, 'ta kalit');
