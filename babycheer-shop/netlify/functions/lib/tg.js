import { createHmac, timingSafeEqual } from 'node:crypto';

export const TOKEN = () => process.env.BOT_TOKEN || '';
const BASE = () => process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function api(method, params = {}) {
  const res = await fetch(`${BASE()}/bot${TOKEN()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const j = await res.json().catch(() => ({}));
  if (!j.ok) throw new Error(`Telegram ${method}: ${j.description || res.status}`);
  return j.result;
}

/** Xatoni yutadi: xabar yuborilmasa buyurtma jarayoni to'xtamasligi kerak. */
export const safe = (method, params) => api(method, params).catch((e) => { console.warn(e.message); return null; });

export const adminIds = () => (process.env.ADMIN_IDS || '').split(',').map((x) => Number(x.trim())).filter(Boolean);

export function notifyAdmins(text, extra = {}) {
  return Promise.allSettled(adminIds().map((id) => safe('sendMessage', { chat_id: id, text, parse_mode: 'HTML', ...extra })));
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
