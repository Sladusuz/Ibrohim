// Impro IT: oflayn ishlash va tezkor takroriy yuklash (v1792607213259)
const V = 'impro-1792607213259';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /^\/(api|admin|app|kabinet)/.test(u.pathname)) return;
  const asset = /\.(jpg|jpeg|png|webp|svg|woff2?)$/.test(u.pathname);
  if (asset) { e.respondWith(caches.open(V).then((c) => c.match(r).then((m) => m || fetch(r).then((n) => { if (n.ok) c.put(r, n.clone()); return n; })))); return; }
  e.respondWith(fetch(r).then((n) => { if (n.ok && (r.mode === 'navigate' || /\.(js|css)$/.test(u.pathname))) { const c = n.clone(); caches.open(V).then((x) => x.put(r, c)); } return n; }).catch(() => caches.match(r).then((m) => m || caches.match('/'))));
});
