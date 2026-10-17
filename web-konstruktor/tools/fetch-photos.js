#!/usr/bin/env node
// CC0 photo library builder (StockSnap via Openverse).
// Usage:
//   node tools/fetch-photos.js fetch [topic...]   -> search, download candidates, build contact sheets
//   node tools/fetch-photos.js more <topic> "<query>"  -> add candidates from an extra query (numbering continues)
//   node tools/fetch-photos.js build <picks.json>  -> {topic:[{n,alt,tone,hero}...]} -> public/img/p + manifest.json
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const SCRATCH = '/tmp/claude-0/-home-user/02506600-7db1-549b-a9a8-16800e6fc970/scratchpad/photos';
const OUT = path.join(__dirname, '..', 'public', 'img', 'p');
const TOPICS = {
  market: ['grocery', 'supermarket', 'vegetables market', 'fruit market'],
  elektronika: ['consumer electronics', 'smartphone laptop', 'electronics store'],
  kiyim: ['fashion clothing rack', 'boutique clothes', 'clothing store'],
  gul: ['flower shop', 'bouquet flowers', 'florist'],
  mebel: ['sofa living room', 'furniture interior', 'modern interior'],
  restoran: ['fine dining restaurant', 'plated dish gourmet', 'restaurant interior'],
  kafe: ['coffee shop', 'latte coffee', 'cafe interior'],
  fastfood: ['burger', 'pizza', 'street food'],
  qandolat: ['bakery', 'cake pastry', 'bread baking'],
  salon: ['beauty salon', 'hairstyling', 'makeup manicure'],
  barber: ['barbershop', 'barber haircut', 'beard'],
  fitness: ['gym workout', 'fitness training', 'dumbbells'],
  klinika: ['doctor clinic', 'medical hospital', 'stethoscope'],
  stomatolog: ['dentist', 'dental teeth', 'dental clinic'],
  talim: ['classroom students', 'school education', 'students studying'],
  til: ['language learning', 'books reading', 'tutoring teacher'],
  avtoservis: ['car repair mechanic', 'auto workshop', 'car engine'],
  qurilish: ['construction site', 'architecture building', 'construction workers'],
  rieltor: ['modern house exterior', 'real estate', 'house interior'],
  yurist: ['law office', 'gavel justice', 'handshake business'],
  turizm: ['travel mountains', 'beach tropical', 'passport travel'],
  toy: ['wedding', 'banquet decoration', 'event table decoration'],
  fotograf: ['photographer camera', 'camera lens', 'portrait photography'],
  dizayner: ['designer workspace', 'sketch drawing desk', 'color swatches'],
  dasturchi: ['programmer coding', 'laptop code', 'desk setup computer'],
  startap: ['startup office team', 'business meeting', 'whiteboard brainstorming'],
  ilova: ['hand holding smartphone', 'mobile app phone', 'using phone'],
  musiqa: ['dj', 'concert', 'music studio instruments'],
  yoga: ['yoga', 'spa wellness', 'meditation'],
  hayvon: ['dog', 'cat pet', 'veterinarian'],
  logistika: ['truck', 'warehouse', 'cargo shipping container'],
  organik: ['farm', 'organic vegetables', 'fruit harvest'],
  odam: ['portrait man', 'portrait woman', 'headshot smiling', 'business portrait'],
  abstrakt: ['abstract background', 'texture', 'light abstract architecture']
};
const PER = { odam: 26, abstrakt: 20 }, DEF = 14;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(q, page = 1) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&source=stocksnap&page_size=20&page=${page}`;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url);
    await sleep(1000);
    if (r.status === 429) { await sleep(4000 * (i + 1)); continue; }
    if (!r.ok) return [];
    return (await r.json()).results || [];
  }
  return [];
}
async function dl(url, file) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) { fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); return true; }
      if (r.status === 429) await sleep(3000);
    } catch (e) { await sleep(1000); }
  }
  return false;
}
function sheet(dir, files, start) {
  // numbered contact sheet(s), 20 per sheet
  const out = [];
  for (let s = 0; s < files.length; s += 20) {
    const chunk = files.slice(s, s + 20);
    const sheetFile = path.join(dir, `sheet-${s / 20 + 1}.jpg`);
    execFileSync('montage', ['-background', '#222', '-fill', 'white', '-pointsize', '20']
      .concat(chunk.flatMap(f => ['-label', path.basename(f, '.jpg'), f]))
      .concat(['-auto-orient', '-thumbnail', '300x220', '-geometry', '300x220+4+4', '-tile', '5x', sheetFile]));
    out.push(sheetFile);
  }
  return out;
}
async function fetchTopic(t, extraQueries) {
  const dir = path.join(SCRATCH, t); fs.mkdirSync(dir, { recursive: true });
  const idxFile = path.join(dir, 'index.json');
  const idx = fs.existsSync(idxFile) ? JSON.parse(fs.readFileSync(idxFile)) : [];
  const seen = new Set(idx.map(x => x.id));
  const queries = extraQueries || TOPICS[t], want = extraQueries ? idx.length + 12 : (PER[t] || DEF);
  const pools = [];
  for (const q of queries) pools.push((await api(q)).filter(r => /\.jpe?g$/i.test(r.url) && r.width >= 1000));
  // round-robin across queries so synonyms are mixed
  for (let k = 0; idx.length < want && pools.some(p => k < p.length); k++) {
    for (let qi = 0; qi < pools.length && idx.length < want; qi++) {
      const r = pools[qi][k];
      if (!r || seen.has(r.id)) continue;
      const f = path.join(dir, `${String(idx.length + 1).padStart(2, '0')}.jpg`);
      if (await dl(r.url, f)) { seen.add(r.id); idx.push({ n: idx.length + 1, id: r.id, title: r.title, w: r.width, h: r.height, q: queries[qi] }); }
    }
  }
  fs.writeFileSync(idxFile, JSON.stringify(idx, null, 1));
  const files = idx.map(x => path.join(dir, String(x.n).padStart(2, '0') + '.jpg'));
  sheet(dir, files);
  console.log(t, idx.length, 'candidates');
}
function build(picksFile) {
  const picks = JSON.parse(fs.readFileSync(picksFile));
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = {}; let total = 0;
  for (const [t, list] of Object.entries(picks)) {
    manifest[t] = [];
    list.forEach((p, i) => {
      const src = path.join(SCRATCH, t, String(p.n).padStart(2, '0') + '.jpg');
      const file = `${t}-${i + 1}.jpg`, dst = path.join(OUT, file);
      const square = t === 'odam';
      const base = ['-auto-orient', src];
      if (square) {
        // p.face = [cx, cy, s]: face centre as fractions of the image, crop side as fraction of the shorter side
        const [W, H] = execFileSync('identify', ['-format', '%w %h', src + '[0]']).toString().split(' ').map(Number);
        const [cx, cy, sf] = p.face || [0.5, 0.4, 1];
        const side = Math.round(Math.min(W, H) * sf);
        const x = Math.max(0, Math.min(W - side, Math.round(cx * W - side / 2)));
        const y = Math.max(0, Math.min(H - side, Math.round(cy * H - side / 2)));
        base.push('-crop', `${side}x${side}+${x}+${y}`, '+repage', '-resize', '400x400!');
      }
      else base.push('-resize', '1400x>');
      let q = 74;
      for (; ;) {
        execFileSync('convert', [...base, '-strip', '-interlace', 'Plane', '-sampling-factor', '4:2:0', '-quality', String(q), dst]);
        if (fs.statSync(dst).size <= 130 * 1024 || q <= 52) break;
        q -= 6;
      }
      const [w, h] = execFileSync('identify', ['-format', '%w %h', dst]).toString().split(' ').map(Number);
      total += fs.statSync(dst).size;
      manifest[t].push({ file, w, h, alt: p.alt, tone: p.tone || 'light', hero: !!p.hero && w / h >= 1.4 });
    });
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log('built', Object.keys(manifest).length, 'topics,', (total / 1048576).toFixed(1), 'MB');
}
(async () => {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === 'fetch') for (const t of (a.length ? a : Object.keys(TOPICS))) await fetchTopic(t);
  else if (cmd === 'more') await fetchTopic(a[0], a.slice(1));
  else if (cmd === 'build') build(a[0]);
  else console.log('usage: fetch|more|build');
})();
