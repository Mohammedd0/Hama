/* Bite patient app — offline support.
   The app's own files are fetched fresh when there is internet and served from the phone when there is not.
   Fonts and images are kept after the first visit. */
const CACHE = 'bite-app-v4';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'art.js', 'ar.js', 'data.js', 'content.js', 'icons.js', 'qr.js', 'manifest.json', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function withTimeout(p, ms) { return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then((v) => { clearTimeout(t); res(v); }, (er) => { clearTimeout(t); rej(er); }); }); }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* fonts: keep forever after the first download */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('admin.html') || url.pathname.endsWith('admin.js') || url.pathname.endsWith('admin.css')) return;
  /* the app itself: newest version when online, saved copy when offline */
  e.respondWith(
    withTimeout(fetch(req), 4000).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
