import { api, TOKEN } from './lib/tg.js';
import * as store from './lib/store.js';

export const config = { path: '/photo/*' };

// Telegram file_id bo'yicha rasmni olib beradi (token mijozga chiqmaydi); brauzer va CDN keshlaydi.
export default async (req) => {
  const fid = decodeURIComponent(new URL(req.url).pathname.replace(/^\/photo\//, ''));
  if (!/^[\w-]{10,200}$/.test(fid)) return new Response('Not found', { status: 404 });
  if (fid.startsWith('img_')) { // admin panelidan yuklangan rasm (Netlify Blobs)
    const img = await store.getBinary(fid).catch(() => null);
    if (!img) return new Response('Not found', { status: 404 });
    return new Response(img.bytes, { headers: { 'content-type': img.contentType, 'cache-control': 'public, max-age=31536000, immutable', 'netlify-cdn-cache-control': 'public, max-age=31536000, durable' } });
  }
  try {
    const f = await api('getFile', { file_id: fid });
    const base = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
    const r = await fetch(`${base}/file/bot${TOKEN()}/${f.file_path}`);
    if (!r.ok) return new Response('Not found', { status: 404 });
    return new Response(r.body, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=604800, immutable', 'netlify-cdn-cache-control': 'public, max-age=604800, stale-if-error=86400, durable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
