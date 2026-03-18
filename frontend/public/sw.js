// Basic Service Worker for PWA Offline Foundation
const CACHE_NAME = 'horizon-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-icon.svg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests and ignore API calls (port 8080)
    if (event.request.method !== 'GET' || event.request.url.includes(':8080')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                return null;
            });
        })
    );
});
