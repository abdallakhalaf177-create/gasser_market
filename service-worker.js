/**
 * Gasser Market - Service Worker v1.0
 * Enables: Offline mode, Add to Home Screen, background caching
 */

const CACHE_NAME = 'gasser-market-v1.2';
const STATIC_ASSETS = [
    './',
    'index.html',
    'style.css',
    'js/app.js',
    'manifest.json',
    'icons/icon.svg',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// ===================== INSTALL =====================
// Cache all static assets on installation
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Gasser Market Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
        }).then(() => {
            console.log('[SW] Static assets cached successfully.');
        })
    );
    // Activate immediately without waiting for old SW to finish
    self.skipWaiting();
});

// ===================== ACTIVATE =====================
// Clean up old caches from previous versions
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log(`[SW] Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Take control of all open clients immediately
    self.clients.claim();
});

// ===================== FETCH =====================
// Cache-First strategy: serve cached version, update in background
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests and cross-origin requests (except CDN)
    if (event.request.method !== 'GET') return;

    // For HTML navigation requests: Network-First (always get fresh HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match('index.html'))
        );
        return;
    }

    // For JS, CSS, images: Cache-First
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Serve from cache, but update cache in background
                fetch(event.request).then((freshResponse) => {
                    if (freshResponse && freshResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, freshResponse);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }

            // Not in cache — fetch from network and cache it
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
        })
    );
});

// ===================== MESSAGE =====================
// Handle messages from the app (e.g. skip waiting)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
