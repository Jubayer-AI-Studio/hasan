// Hasan Life Guide - Resilient Offline Service Worker (v7)
const CACHE_NAME = 'hasan-life-guide-v7';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning (safe to ignore in dev):', err);
      });
    })
  );
});

// Activate: Immediately claim clients and purge old cache generations
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Guaranteed Non-Null Responses (Prevents ERR_FAILED)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass non-GET and backend API requests
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Navigation requests (HTML documents): Network-first with resilient cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Attempt cache match
          const cached = (await caches.match(request)) || (await caches.match('/index.html')) || (await caches.match('/'));
          if (cached) return cached;

          // Safe fallback page to prevent browser ERR_FAILED
          return new Response(
            `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>হাসান - লোড হচ্ছে</title><style>body{background:#0b0f19;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px}a{color:#38bdf8;text-decoration:none}</style></head><body><div><h2>হাসান লাইফ গাইড</h2><p>অফলাইন মোড চালু হচ্ছে... অনুগ্রহ করে রিলোড দিন।</p><button onclick="location.reload()" style="background:#0284c7;color:#fff;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:bold">রিলোড করুন</button></div></body></html>`,
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // 3. Static assets (JS, CSS, fonts, images): Cache-first with stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously update cache in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache: fetch from network with safe fallback
      return fetch(request).catch(() => {
        // Return safe empty 404 response rather than resolving to undefined (which triggers ERR_FAILED)
        return new Response('', { status: 404, statusText: 'Not Found Offline' });
      });
    })
  );
});
