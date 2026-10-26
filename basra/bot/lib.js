'use strict';
const fs = require('fs');
const path = require('path');

/* ---------- .env o'quvchi (qo'shimcha paketsiz) ---------- */
function loadEnv(file) {
  try {
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) { process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
    });
  } catch (e) { /* .env bo'lmasa, muhit o'zgaruvchilari ishlatiladi */ }
}

/* ---------- oddiy JSON ma'lumotlar bazasi ---------- */
class Store {
  constructor(file) {
    this.file = file;
    this.data = { users: {}, leads: [], sessions: {}, admins: [], seq: 0 };
    try { this.data = Object.assign(this.data, JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (e) { /* yangi baza */ }
    this.timer = null;
  }
  save() {
    if (this.timer) { return; }
    this.timer = setTimeout(() => { this.timer = null; this.flush(); }, 200);
  }
  flush() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }
}

/* ---------- yordamchilar ---------- */
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** O'zbekiston telefon raqamini +998XXXXXXXXX ko'rinishiga keltiradi, noto'g'ri bo'lsa null. */
function normPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.length === 9) { d = '998' + d; }
  if (d.length === 12 && d.startsWith('998')) { return '+' + d; }
  return null;
}
function fmtPhone(p) {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(p || '');
  return m ? `+998 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : (p || '');
}
/** Toshkent vaqti bo'yicha hozirgi soat (UTC+5). */
function tashkentHour(now) {
  return new Date((now || Date.now()) + 5 * 3600 * 1000).getUTCHours();
}
function isWorkingNow(now) {
  const h = tashkentHour(now);
  return h >= 9 && h < 20;
}
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }

module.exports = { loadEnv, Store, esc, normPhone, fmtPhone, tashkentHour, isWorkingNow, shuffle, csvCell };
