'use strict';
// Videoni kadrma-kadr chizadi (deterministik) va ffmpeg ga uzatadi. Ishlatish:
//   node video/render.js preview 1,2.5,5      -> /tmp/vid-prev/*.png
//   node video/render.js full [fps] [duration] -> video/out/silent.mp4
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const { spawn } = require('child_process'); const path = require('path'), fs = require('fs');
const mode = process.argv[2] || 'preview', FPS = Number(process.argv[3]) || 30, DUR = Number(process.argv[4]) || 37;
(async () => {
  const b = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 }); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, 'ad.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  if (mode === 'preview') {
    fs.mkdirSync('/tmp/vid-prev', { recursive: true });
    for (const t of String(process.argv[3] || '1,3,5').split(',').map(Number)) { await p.evaluate((t) => window.__frame(t), t); await p.waitForTimeout(60); await p.screenshot({ path: `/tmp/vid-prev/t${String(t).replace('.', '_')}.png` }); }
    console.log('xatolar:', errs.slice(0, 5)); await b.close(); return;
  }
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const out = path.join(__dirname, 'out', 'silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(FPS * DUR), t0 = Date.now();
  for (let i = 0; i < n; i++) { await p.evaluate((t) => window.__frame(t), i / FPS); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (i % 90 === 0) process.stdout.write(`${i}/${n} `); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('\nxatolar:', errs.slice(0, 5), 'vaqt', Math.round((Date.now() - t0) / 1000) + 's', out); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
