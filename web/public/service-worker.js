const CACHE_NAME = 'cv-cache-v1';

// Resources to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/avatar.jpg',
  '/logo.png',
  '/cv-data-manifest.json',
];

// Install event - precache critical assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control immediately
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Strategy 1: Cache First for static assets (images, fonts, css, js)
  if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|css|js|woff2|woff|ttf)$/) ||
    url.pathname.startsWith('/_next/')
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((fetchResponse) => {
          // Don't cache if not successful
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          // Clone and cache
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }

  // Strategy 2: Network First for data files (always fresh)
  if (url.pathname.includes('cv-data')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }
          // Cache fresh data
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy 3: Stale While Revalidate for HTML pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });

      // Return cached immediately, or wait for network if no cache
      return cachedResponse || fetchPromise;
    })
  );
});
