// Benny Service Worker
// Enables offline functionality and app-like experience

const CACHE_NAME = 'mathpop-v2';

const toScopedPath = (path) => new URL(path, self.registration.scope).pathname;

const ASSETS_TO_CACHE = [
  toScopedPath('./'),
  toScopedPath('./index.html'),
  toScopedPath('./favicon.svg'),
  toScopedPath('./favicon.ico'),
  toScopedPath('./manifest.json')
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log('[ServiceWorker] Cache addAll error (non-critical):', err);
        // Continue even if some assets fail to cache
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache on network failure
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log('[ServiceWorker] Using cached response for:', request.url);
            return cached;
          }
          // Return offline page if available
          if (request.destination === 'document') {
            return caches.match(toScopedPath('./index.html'));
          }
        });
      })
  );
});
