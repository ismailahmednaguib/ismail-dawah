const CACHE = 'ismail-dawah-v1';
const ASSETS = ['/', '/index.html', '/css/style.css', '/css/extras.css', '/css/extras2.css', '/css/extras3.css', '/css/extras4.css', '/css/extras8.css', '/css/extras9.css', '/css/extras10.css', '/js/data.js', '/js/app.js', '/js/admin.js', '/js/extras.js', '/js/extras2.js', '/js/extras3.js', '/js/extras4.js', '/js/extras8.js', '/js/extras9.js', '/js/extras10.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp.ok && e.request.url.startsWith(self.location.origin)) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => caches.match('/')))
  );
});