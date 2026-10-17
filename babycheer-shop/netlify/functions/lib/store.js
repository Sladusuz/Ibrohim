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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function store() {
  if (process.env.STORE_MEMORY) {
    if (process.env.STORE_FAIL) throw new Error('boom (sinov uchun uzilish)');
    return memStore();
  }
  // Har safar yangi: Netlify har bir so'rovga yangi ruxsat (token) beradi. Bir marta ochib eslab qolinsa,
  // ishlayotgan nusxada token eskirib, hamma so'rov xato bera boshlaydi.
  return getStore({ name: 'babycheer', consistency: 'strong' });
}

/** Vaqtinchalik uzilishlarga qarshi: o'qish va idempotent yozishni 3 martagacha qayta urinadi. */
async function retry(fn, tries = 3) {
  let err;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      err = e;
      if (i < tries - 1) await sleep(120 * 2 ** i + Math.random() * 120);
    }
  }
  throw err;
}

export async function get(key) {
  return retry(async () => {
    const r = await store().getWithMetadata(key, { type: 'json', consistency: 'strong' });
    return r ? r.data : null;
  });
}

export async function put(key, value) {
  await retry(() => store().setJSON(key, value));
}

/** Atomik o'qish-o'zgartirish-yozish. fn(current) yangi qiymatni qaytaradi (yoki xato tashlaydi).
 *  O'qish qayta uriniladi; yozish qayta urinilmaydi (ikki marta qo'llanib ketmasligi uchun). */
export async function update(key, fn, initial = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (attempt) await sleep(15 + Math.random() * 60 * attempt);
    const r = await retry(() => store().getWithMetadata(key, { type: 'json', consistency: 'strong' }));
    const next = await fn(r ? structuredClone(r.data) : typeof initial === 'function' ? initial() : structuredClone(initial));
    const res = r
      ? await store().setJSON(key, next, { onlyIfMatch: r.etag })
      : await store().setJSON(key, next, { onlyIfNew: true });
    if (res.modified !== false) return next;
  }
  throw new Error("Ma'lumotni yozib bo'lmadi, qayta urinib ko'ring");
}

const memBin = new Map();
export async function putBinary(key, bytes, contentType) {
  if (process.env.STORE_MEMORY) { memBin.set(key, { bytes: Buffer.from(bytes), contentType }); return; }
  await retry(() => store().set(key, bytes, { metadata: { contentType } }));
}
export async function getBinary(key) {
  if (process.env.STORE_MEMORY) return memBin.get(key) || null;
  const r = await retry(() => store().getWithMetadata(key, { type: 'arrayBuffer', consistency: 'strong' }));
  return r ? { bytes: r.data, contentType: (r.metadata && r.metadata.contentType) || 'image/jpeg' } : null;
}

export function _resetMemory() { mem = null; memBin.clear(); }
