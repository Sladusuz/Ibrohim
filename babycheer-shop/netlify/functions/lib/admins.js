// Adminlarni bot orqali boshqarish: bir martalik taklif havolasi (24 soat), ro'yxat, olib tashlash.
import { randomBytes } from 'node:crypto';
import * as store from './store.js';
import { api, ownerIds, resetAdminCache } from './tg.js';

const DAY = 24 * 3600 * 1000;
let botUsername = null;

export async function botLink() {
  botUsername ??= (await api('getMe')).username;
  return `https://t.me/${botUsername}`;
}

export async function createInvite(byId) {
  const token = randomBytes(12).toString('base64url');
  await store.put(`invite:${token}`, { by: byId, exp: Date.now() + DAY });
  return `${await botLink()}?start=adm_${token}`;
}

/** Havola orqali kirgan foydalanuvchini admin qiladi. Havola bir marta ishlaydi. */
export async function acceptInvite(token, user) {
  if (!/^[\w-]{8,40}$/.test(token)) return { ok: false, reason: 'Havola noto\'g\'ri' };
  const inv = await store.get(`invite:${token}`);
  if (!inv) return { ok: false, reason: 'Havola topilmadi yoki allaqachon ishlatilgan' };
  await store.put(`invite:${token}`, null); // bir martalik
  if (inv.exp < Date.now()) return { ok: false, reason: 'Havola muddati tugagan (24 soat). Yangisini so\'rang' };
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || String(user.id);
  await store.update('admins', (list) => (list.some((a) => a.id === user.id) ? list : [...list, { id: user.id, name, username: user.username || '', by: inv.by, at: new Date().toISOString() }]), []);
  resetAdminCache();
  return { ok: true, name, by: inv.by };
}

export async function listAdmins() {
  return ((await store.get('admins')) || []).map((a) => ({ ...a, owner: false }));
}

export async function removeAdmin(id) {
  if (ownerIds().includes(Number(id))) return false; // egalarni olib tashlab bo'lmaydi
  let removed = false;
  await store.update('admins', (list) => { const n = list.filter((a) => a.id !== Number(id)); removed = n.length < list.length; return n; }, []);
  resetAdminCache();
  return removed;
}
