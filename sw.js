const CACHE_NAME = 'gaser-market-v4-cachebust';
const ASSETS_TO_CACHE = [
  './',
  './index.html?v=1.1.0',
  './style.css?v=1.1.0',
  './css/mobile.css?v=1.1.0',
  './manifest.json?v=1.1.0',
  './js/app.js?v=1.1.0',
  './js/state.js',
  './js/constants.js',
  './js/modules/pos.js',
  './js/modules/inventory.js',
  './js/modules/dashboard.js',
  './js/modules/categories.js',
  './js/modules/customers.js',
  './js/modules/suppliers.js',
  './js/modules/reports.js',
  './js/modules/settings.js',
  './js/modules/users.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-First strategy to ensure browser always gets fresh JS/CSS code when online
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html?v=1.1.0');
          }
        });
      })
  );
});
