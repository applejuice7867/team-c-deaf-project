const CACHE_NAME = 'hk-deaf-transit-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/prefs.js',
  '/firebase.js',
  '/bus.html',
  '/minibus.html',
  '/mtr.html',
  '/transport.html',
  '/stt.html',
  '/settings.html',
  '/login.html',
];

// Map clean URL paths to the actual .html file (so navigation works without relying on server redirects)
function getHtmlUrlForPath(pathname) {
  const path = (pathname || '/').replace(/\/$/, '') || 'index';
  if (path === 'index') return new URL('/index.html', self.location.origin).href;
  const cleanPaths = ['bus', 'mtr', 'minibus', 'transport', 'stt', 'settings', 'login'];
  if (cleanPaths.includes(path)) return new URL('/' + path + '.html', self.location.origin).href;
  return null;
}

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.warn('Cache addAll error:', error);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  let request = event.request;

  // For navigation requests (page loads), rewrite /bus -> /bus.html etc. so we always
  // request a URL that exists. This fixes issues when server redirects aren't applied
  // (e.g. first load, incognito, different devices).
  if (event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    const htmlHref = getHtmlUrlForPath(url.pathname);
    if (htmlHref) {
      request = new Request(htmlHref, {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'same-origin',
        credentials: event.request.credentials,
        redirect: 'follow',
      });
    }
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          console.warn('Fetch failed for:', request.url);
          // Return a basic offline fallback for navigations
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html').then((r) => r || new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
          }
        });
    })
  );
});
