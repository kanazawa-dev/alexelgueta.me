const CACHE = 'kanazawa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  // Solo cachear GET, ignorar chrome-extension y otros esquemas
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (response) {
        // No cachear respuestas de Spotify ni LinkedIn
        if (e.request.url.includes('spotify') || e.request.url.includes('linkedin')) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(e.request, clone); });
        return response;
      }).catch(function () {
        return caches.match('/index.html');
      });
    })
  );
});
