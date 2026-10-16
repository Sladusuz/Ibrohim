// Ma'lumot ombori: Netlify Blobs (strong consistency, ETag bilan shartli yozish).
// Testlar uchun STORE_MEMORY=1 bo'lsa xotiradagi nusxa ishlatiladi.
import { getStore } from '@netlify/blobs';

let mem = null;
function memStore() {
  mem ??= new Map();
  let ver = 0;
  return {
    async getWithMetadata(key) {
      const v = mem.get(key);
      return v ? { data: JSON.parse(v.data), etag: v.etag } : null;
    },
    async setJSON(key, data, opts = {}) {
      const cur = mem.get(key);
      if (opts.onlyIfNew && cur) return { modified: false };
      if (opts.onlyIfMatch && (!cur || cur.etag !== opts.onlyIfMatch)) return { modified: false };
      mem.set(key, { data: JSON.stringify(data), etag: `e${Date.now()}-${++ver}-${Math.random()}` });
      return { modified: true };
    },
    async delete(key) { mem.delete(key); },
  };
}

let blobs = null;
function store() {
  if (process.env.STORE_MEMORY) return memStore();
  blobs ??= getStore({ name: 'babycheer', consistency: 'strong' });
  return blobs;
}

export async function get(key) {
  const r = await store().getWithMetadata(key, { type: 'json', consistency: 'strong' });
  return r ? r.data : null;
}

export async function put(key, value) {
  await store().setJSON(key, value);
}

/** Atomik o'qish-o'zgartirish-yozish. fn(current) yangi qiymatni qaytaradi (yoki xato tashlaydi). */
export async function update(key, fn, initial = null) {
  for (let attempt = 0; attempt < 12; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 15 + Math.random() * 60 * attempt));
    const s = store();
    const r = await s.getWithMetadata(key, { type: 'json', consistency: 'strong' });
    const next = await fn(r ? structuredClone(r.data) : typeof initial === 'function' ? initial() : structuredClone(initial));
    const res = r
      ? await s.setJSON(key, next, { onlyIfMatch: r.etag })
      : await s.setJSON(key, next, { onlyIfNew: true });
    if (res.modified !== false) return next;
  }
  throw new Error("Ma'lumotni yozib bo'lmadi, qayta urinib ko'ring");
}

export function _resetMemory() { mem = null; }
