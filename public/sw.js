const CACHE_NAME = "task-slayer-v1";

// Add specific assets you want to work offline
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.webmanifest",
  // Add your main CSS/JS if you want,
  // but for now, we'll cache them dynamically
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Strategy: Network First, Fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, clone the response and store it in cache
        if (event.request.method === "GET") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (offline), look in cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the whole page isn't in cache, return the root "/"
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      }),
  );
});
