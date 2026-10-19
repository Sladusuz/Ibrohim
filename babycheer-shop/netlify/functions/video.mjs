import { api, TOKEN } from './lib/tg.js';

export const config = { path: '/vid/*' };

// Telegram file_id bo'yicha videoni olib beradi (Range bilan: brauzer surib ko'ra oladi); token mijozga chiqmaydi.
export default async (req) => {
  const fid = decodeURIComponent(new URL(req.url).pathname.replace(/^\/vid\//, ''));
  if (!/^[\w-]{10,200}$/.test(fid) || fid.startsWith('img_')) return new Response('Not found', { status: 404 });
  try {
    const f = await api('getFile', { file_id: fid });
    const base = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
    const range = req.headers.get('range');
    const r = await fetch(`${base}/file/bot${TOKEN()}/${f.file_path}`, range ? { headers: { range } } : {});
    if (!r.ok && r.status !== 206) return new Response('Not found', { status: 404 });
    const headers = { 'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=604800' };
    for (const h of ['content-length', 'content-range']) if (r.headers.get(h)) headers[h] = r.headers.get(h);
    return new Response(r.body, { status: r.status, headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
