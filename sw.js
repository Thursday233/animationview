const CACHE_NAME = 'review-app-v2';
const BASE = new URL(self.registration.scope).pathname;
const ASSETS = [
  BASE,
  BASE + 'css/style.css',
  BASE + 'js/db.js',
  BASE + 'js/app.js',
  BASE + 'js/utils/format.js',
  BASE + 'js/components/reviewCard.js',
  BASE + 'js/components/reviewList.js',
  BASE + 'js/components/reviewForm.js',
  BASE + 'js/components/searchBar.js',
  BASE + 'js/components/sortControls.js',
  BASE + 'js/components/starRating.js',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
