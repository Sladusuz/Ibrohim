#!/usr/bin/env node
/* ERA — website + lead (zayavka) API + admin panel.
 * Zero dependencies: needs only Node.js 18+.
 *
 *   node server.js
 *
 * Environment variables (all optional):
 *   PORT                 port to listen on (default 3000)
 *   ADMIN_USER           admin panel login (default: eratashkent)
 *   ADMIN_PASSWORD       admin panel password (default: era2026)
 *   DATA_DIR             where leads.json and uploaded photos live (default ./data)
 *   TRUST_PROXY=1        behind nginx / a hosting proxy: use X-Forwarded-For / -Proto
 *   TELEGRAM_BOT_TOKEN   + TELEGRAM_CHAT_ID: also send every new lead to Telegram
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PUB = path.join(ROOT, "public");
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, "data"));
const UPLOADS = path.join(DATA, "uploads");
const DB_FILE = path.join(DATA, "leads.json");
const PORT = +process.env.PORT || 3000;
const TRUST_PROXY = process.env.TRUST_PROXY === "1";

fs.mkdirSync(UPLOADS, { recursive: true });

/* ---------------- admin login ---------------- */
// Defaults requested by the owner; override on the server with ADMIN_USER / ADMIN_PASSWORD.
const ADMIN_USER = process.env.ADMIN_USER || "eratashkent";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "era2026";
const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();
const USER_HASH = sha(ADMIN_USER), PASS_HASH = sha(ADMIN_PASSWORD);

/* ---------------- storage ---------------- */
let db = { seq: 0, leads: [] };
try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch (e) { if (e.code !== "ENOENT") throw e; }
let saving = Promise.resolve();
function save() {
  const snapshot = JSON.stringify(db, null, 1);
  saving = saving.then(() => new Promise((res) => {
    const tmp = DB_FILE + "." + process.pid + ".tmp";
    fs.writeFile(tmp, snapshot, (err) => {
      if (err) { console.error("save failed", err); return res(); }
      fs.rename(tmp, DB_FILE, (e2) => { if (e2) console.error("save failed", e2); res(); });
    });
  }));
  return saving;
}

/* ---------------- helpers ---------------- */
const ITEMS = ["Poyabzal", "Sumka", "Kurtka", "Boshqa"];
const SERVICES = ["Tozalash", "Rangni tiklash", "Ta'mirlash", "Polirovka va himoya", "Maslahat kerak"];
const BRANCHES = ["Mirzo Ulug'bek — ул. Аккурган, 21А", "Yunusobod — ул. Осиё, дом 16"];
const TIMES = ["Istalgan vaqtda", "Ertalab (9:00–12:00)", "Tushdan keyin (12:00–17:00)", "Kechqurun (17:00–20:00)"];
const STATUSES = ["new", "progress", "done", "cancelled"];
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".mp4": "video/mp4", ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain; charset=utf-8" };
const CSP = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const str = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
const ipOf = (req) => (TRUST_PROXY && String(req.headers["x-forwarded-for"] || "").split(",")[0].trim()) || req.socket.remoteAddress || "?";
const isHttps = (req) => req.socket.encrypted || (TRUST_PROXY && req.headers["x-forwarded-proto"] === "https");

function send(res, code, body, headers) {
  const isObj = typeof body === "object" && !Buffer.isBuffer(body);
  res.writeHead(code, Object.assign({
    "Content-Type": isObj ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin"
  }, headers));
  res.end(isObj ? JSON.stringify(body) : body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error("Juda katta so'rov"), { code: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch (e) { reject(Object.assign(new Error("Noto'g'ri JSON"), { code: 400 })); }
    });
    req.on("error", reject);
  });
}

const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now(), arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now); buckets.set(key, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (!v.some((t) => now - t < 3600e3)) buckets.delete(k); }, 600e3).unref();

/* ---------------- sessions ---------------- */
const sessions = new Map(); // token -> expiry
const SESSION_MS = 7 * 24 * 3600e3;
function cookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach((p) => { const i = p.indexOf("="); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
function authed(req) {
  const t = cookies(req).era_admin, exp = t && sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}
function sessionCookie(req, token, maxAge) {
  return `era_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isHttps(req) ? "; Secure" : ""}`;
}

/* ---------------- telegram (optional) ---------------- */
function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat || typeof fetch !== "function") return;
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const text = [
    `<b>🆕 Yangi zayavka № ${lead.id}</b>`,
    `👤 ${esc(lead.name)}`, `📞 ${esc(lead.phone)}`,
    `👞 ${esc(lead.item)}${lead.brand ? " — " + esc(lead.brand) : ""}`,
    lead.services.length ? `🧰 ${esc(lead.services.join(", "))}` : "",
    `📍 ${esc(lead.branch)}`, `🕐 ${esc(lead.time)}`,
    lead.comment ? `💬 ${esc(lead.comment)}` : "",
    lead.photos.length ? `📷 ${lead.photos.length} ta rasm (admin panelda)` : ""
  ].filter(Boolean).join("\n");
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" })
  }).catch((e) => console.error("telegram:", e.message));
}

/* ---------------- handlers ---------------- */
async function createLead(req, res) {
  const ip = ipOf(req);
  if (limited("lead:" + ip, 6, 10 * 60e3)) return send(res, 429, { ok: false, error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring" });
  const b = await readBody(req, 8 * 1024 * 1024);
  if (b.website) return send(res, 200, { ok: true, id: 0 }); // honeypot: bots fill hidden field
  const name = str(b.name, 80), phone = str(b.phone, 20).replace(/[^\d+]/g, "");
  const digits = phone.replace(/\D/g, "");
  if (name.length < 2) return send(res, 400, { ok: false, error: "Ismingizni kiriting" });
  if (digits.length < 9 || digits.length > 15) return send(res, 400, { ok: false, error: "Telefon raqam noto'g'ri" });

  const id = ++db.seq;
  const photos = [];
  for (const [i, p] of (Array.isArray(b.photos) ? b.photos.slice(0, 3) : []).entries()) {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(p));
    if (!m) continue;
    const buf = Buffer.from(m[1], "base64");
    if (buf.length > 2.5 * 1024 * 1024 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) continue;
    const file = `${id}-${i + 1}-${crypto.randomBytes(6).toString("hex")}.jpg`;
    await fs.promises.writeFile(path.join(UPLOADS, file), buf);
    photos.push(file);
  }
  const lead = {
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    name, phone: phone.startsWith("+") ? phone : "+" + digits,
    item: ITEMS.includes(b.item) ? b.item : "Boshqa",
    services: (Array.isArray(b.services) ? b.services : []).filter((s) => SERVICES.includes(s)),
    branch: BRANCHES.includes(b.branch) ? b.branch : BRANCHES[0],
    time: TIMES.includes(b.time) ? b.time : TIMES[0],
    brand: str(b.brand, 80),
    comment: str(b.comment, 1000),
    photos,
    note: "",
    ip
  };
  db.leads.unshift(lead);
  await save();
  notifyTelegram(lead);
  console.log(`[lead] #${id} ${name} ${lead.phone}`);
  send(res, 201, { ok: true, id });
}

function toCsv(leads) {
  const cols = [["id", "№"], ["createdAt", "Sana"], ["status", "Holat"], ["name", "Ism"], ["phone", "Telefon"], ["item", "Buyum"], ["brand", "Brend"], ["services", "Xizmatlar"], ["branch", "Filial"], ["time", "Qulay vaqt"], ["comment", "Izoh"], ["note", "Admin izohi"], ["photos", "Rasmlar"]];
  const cell = (v) => {
    let s = Array.isArray(v) ? v.join(", ") : String(v == null ? "" : v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // spreadsheet formula injection guard
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return "﻿" + [cols.map((c) => cell(c[1])).join(",")].concat(leads.map((l) => cols.map((c) => cell(l[c[0]])).join(","))).join("\r\n");
}

async function admin(req, res, url) {
  const route = url.pathname.slice("/api/admin".length);
  if (route === "/login" && req.method === "POST") {
    if (limited("login:" + ipOf(req), 10, 15 * 60e3)) return send(res, 429, { ok: false, error: "Juda ko'p urinish. 15 daqiqadan so'ng urinib ko'ring" });
    const b = await readBody(req, 4096);
    const userOk = crypto.timingSafeEqual(sha(String(b.username || "").trim()), USER_HASH);
    const passOk = crypto.timingSafeEqual(sha(b.password || ""), PASS_HASH);
    if (!userOk || !passOk) return send(res, 401, { ok: false, error: "Login yoki parol noto'g'ri" });
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_MS);
    return send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(req, token, SESSION_MS / 1000) });
  }
  if (route === "/logout" && req.method === "POST") {
    sessions.delete(cookies(req).era_admin);
    return send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(req, "", 0) });
  }
  if (!authed(req)) return send(res, 401, { ok: false, error: "Kirish talab qilinadi" });

  if (route === "/me") return send(res, 200, { ok: true });
  if (route === "/leads" && req.method === "GET") {
    const counts = { all: db.leads.length };
    STATUSES.forEach((s) => (counts[s] = db.leads.filter((l) => l.status === s).length));
    return send(res, 200, { ok: true, leads: db.leads, counts });
  }
  if (route === "/export.csv" && req.method === "GET") {
    return send(res, 200, toCsv(db.leads), { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="era-zayavkalar-${new Date().toISOString().slice(0, 10)}.csv"` });
  }
  let m = /^\/leads\/(\d+)$/.exec(route);
  if (m) {
    const lead = db.leads.find((l) => l.id === +m[1]);
    if (!lead) return send(res, 404, { ok: false, error: "Topilmadi" });
    if (req.method === "PATCH") {
      if (!/application\/json/.test(req.headers["content-type"] || "")) return send(res, 415, { ok: false });
      const b = await readBody(req, 16 * 1024);
      if (b.status !== undefined) { if (!STATUSES.includes(b.status)) return send(res, 400, { ok: false, error: "Noto'g'ri holat" }); lead.status = b.status; }
      if (b.note !== undefined) lead.note = str(b.note, 2000);
      lead.updatedAt = new Date().toISOString();
      await save();
      return send(res, 200, { ok: true, lead });
    }
    if (req.method === "DELETE") {
      db.leads = db.leads.filter((l) => l !== lead);
      await save();
      lead.photos.forEach((f) => fs.unlink(path.join(UPLOADS, f), () => {}));
      return send(res, 200, { ok: true });
    }
  }
  m = /^\/photo\/([\w-]+\.jpg)$/.exec(route);
  if (m && req.method === "GET") {
    const file = path.join(UPLOADS, m[1]);
    return fs.readFile(file, (err, buf) => err ? send(res, 404, "Not found") : send(res, 200, buf, { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" }));
  }
  send(res, 404, { ok: false, error: "Topilmadi" });
}

function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === "/" ) p = "/index.html";
  if (p === "/admin" || p === "/admin/") p = "/admin.html";
  const file = path.normalize(path.join(PUB, p));
  if (!file.startsWith(PUB + path.sep)) return send(res, 403, "Forbidden");
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, "Topilmadi");
    const ext = path.extname(file).toLowerCase();
    const headers = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": st.size,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=604800"
    };
    if (ext === ".html") { headers["Content-Security-Policy"] = CSP; headers["X-Frame-Options"] = "DENY"; }
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (url.pathname === "/api/leads" && req.method === "POST") return await createLead(req, res);
    if (url.pathname.startsWith("/api/admin/")) return await admin(req, res, url);
    if (url.pathname.startsWith("/api/")) return send(res, 404, { ok: false, error: "Topilmadi" });
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");
    serveStatic(req, res, url);
  } catch (e) {
    if (!res.headersSent) send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { ok: false, error: e.code ? e.message : "Server xatosi" });
    if (!e.code) console.error(e);
  }
});

server.listen(PORT, () => {
  console.log(`ERA sayti:      http://localhost:${PORT}`);
  console.log(`Admin panel:    http://localhost:${PORT}/admin`);
  if (!process.env.ADMIN_PASSWORD) console.log("Diqqat: standart admin paroli ishlatilmoqda — serverda ADMIN_PASSWORD ni o'rnating.");
});
