const CACHE_NAME = 'hk-deaf-transit-v3';

// Install: only create the cache. Do not precache — fetches during install often
// fail on Cloudflare/other hosts (404, timing). Cache is filled by the fetch
// handler when the page loads assets.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(() => {}));
agtg  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: only cache subresources (scripts, styles, etc.). Do NOT intercept
// document/navigation requests — let the browser load pages from the network
// so the site always works (avoids ERR_FAILED and "無法連上這個網站").
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Critical: do not handle page navigations in the service worker.
  // Let the browser fetch the document from Cloudflare so _redirects work.
  if (event.request.mode === 'navigate') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return caches.match(event.request);
      });
    })
  );
});
