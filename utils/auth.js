const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const SECRET_FILE = path.join(DATA_DIR, '.session-secret');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getSessionSecret() {
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, 'utf8').trim();
  }
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

function ensureAdminAccount() {
  if (fs.existsSync(ADMIN_FILE)) return;
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'impro2024';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  fs.writeFileSync(
    ADMIN_FILE,
    JSON.stringify({ username, salt, hash }, null, 2),
    { mode: 0o600 }
  );
}

function verifyCredentials(username, password) {
  ensureAdminAccount();
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
  if (username !== admin.username) return false;
  const candidate = hashPassword(password, admin.salt);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(admin.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function setPassword(newPassword) {
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
  const salt = crypto.randomBytes(16).toString('hex');
  admin.hash = hashPassword(newPassword, salt);
  admin.salt = salt;
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), { mode: 0o600 });
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function signSession(username) {
  const secret = getSessionSecret();
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${username}.${expires}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

function verifySession(token) {
  try {
    const secret = getSessionSecret();
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [username, expires, sig] = decoded.split('.');
    if (!username || !expires || !sig) return null;
    const payload = `${username}.${expires}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    if (Date.now() > Number(expires)) return null;
    return { username };
  } catch {
    return null;
  }
}

module.exports = {
  ensureAdminAccount,
  verifyCredentials,
  setPassword,
  signSession,
  verifySession,
};
