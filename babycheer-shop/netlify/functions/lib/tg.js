import { createHmac, timingSafeEqual } from 'node:crypto';
import * as store from './store.js';

export const TOKEN = () => process.env.BOT_TOKEN || '';
const BASE = () => process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function api(method, params = {}) {
  const res = await fetch(`${BASE()}/bot${TOKEN()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(8000), // Telegram javob bermasa funksiya osilib qolmasin
  });
  const j = await res.json().catch(() => ({}));
  if (!j.ok) throw new Error(`Telegram ${method}: ${j.description || res.status}`);
  return j.result;
}

/** Xatoni yutadi: xabar yuborilmasa buyurtma jarayoni to'xtamasligi kerak. */
export const safe = (method, params) => api(method, params).catch((e) => { console.warn(e.message); return null; });

/** Asosiy adminlar (egalar): Netlify'dagi ADMIN_IDS. Ular boshqa adminlarni qo'sha va olib tashlay oladi. */
export const ownerIds = () => (process.env.ADMIN_IDS || '').split(',').map((x) => Number(x.trim())).filter(Boolean);
export const adminIds = ownerIds; // eski nom

let adminCache = { t: 0, ids: [] };
export const resetAdminCache = () => { adminCache = { t: 0, ids: adminCache.ids }; };
/** Barcha adminlar: egalar + bot orqali taklif qilinganlar (15 soniya xotirada). Ombor ishlamasa oxirgi ro'yxat. */
export async function allAdminIds() {
  if (Date.now() - adminCache.t < 15000) return adminCache.ids;
  let extra = null;
  try { extra = ((await store.get('admins')) || []).map((a) => a.id); } catch { /* ombor vaqtincha ishlamadi */ }
  const ids = [...new Set([...ownerIds(), ...(extra ?? adminCache.ids.filter((i) => !ownerIds().includes(i)))])];
  adminCache = { t: Date.now(), ids };
  return ids;
}
export const isAdminId = async (id) => !!id && (await allAdminIds()).includes(Number(id));
export const isOwnerId = (id) => !!id && ownerIds().includes(Number(id));

export async function notifyAdmins(text, extra = {}) {
  return Promise.allSettled((await allAdminIds()).map((id) => safe('sendMessage', { chat_id: id, text, parse_mode: 'HTML', ...extra })));
}

/** Telegram WebApp initData imzosini tekshiradi. To'g'ri bo'lsa foydalanuvchi obyekti, aks holda null. */
export function verifyInitData(initData, token = TOKEN(), maxAgeSec = 86400) {
  if (!initData || !token) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const check = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const calc = createHmac('sha256', secret).update(check).digest('hex');
  const a = Buffer.from(calc), b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() / 1000 - Number(params.get('auth_date') || 0) > maxAgeSec) return null;
  try { return JSON.parse(params.get('user')); } catch { return null; }
}
