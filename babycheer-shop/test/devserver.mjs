// Mahalliy sinov serveri: node test/devserver.mjs  (PORT=8788). Telegram soxta, ma'lumotlar xotirada.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
export const TG_LOG = [];

export async function start(port = 8788) {
  const tgMock = http.createServer((req, res) => {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      const method = req.url.split('/').pop();
      TG_LOG.push({ method, ...(b ? JSON.parse(b) : {}) });
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ ok: true, result: method === 'createInvoiceLink' ? 'https://t.me/$invoice' : true }));
    });
  });
  await new Promise((r) => tgMock.listen(0, r));
  Object.assign(process.env, {
    STORE_MEMORY: '1', BOT_TOKEN: '123456:DEVTOKEN', ADMIN_IDS: '999', WEBHOOK_SECRET: 'sec',
    PAYMENT_PROVIDER_TOKEN: 'prov', CARD_NUMBER: '8600 1234 5678 9012', CARD_OWNER: 'BabyCheer LLC',
    TELEGRAM_API_BASE: `http://127.0.0.1:${tgMock.address().port}`,
  });
  const fns = {
    '/api/': (await import('../netlify/functions/api.mjs')).default,
    '/photo/': (await import('../netlify/functions/photo.mjs')).default,
    '/tg': (await import('../netlify/functions/bot.mjs')).default,
  };
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const key = Object.keys(fns).find((k) => url.pathname.startsWith(k));
    if (key) {
      const chunks = []; for await (const c of req) chunks.push(c);
      const r = await fns[key](new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) }));
      res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(Buffer.from(await r.arrayBuffer()));
    }
    const file = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(port, r));
  return { server, tgMock, port };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { port } = await start(Number(process.env.PORT) || 8788);
  console.log(`http://localhost:${port}`);
}
