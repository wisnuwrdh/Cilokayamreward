const CACHE_NAME = "cilokreward-pages-v4";
const ASSETS_CACHE = "cilokreward-assets-v4";

const PRECACHE_URLS = [
  "/",
  "/pelanggan/baru",
  "/pengaturan",
  "/qris",
  "/wa",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: "no-cache" })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
              return Promise.reject(`fetch failed: ${url}`);
            })
            .catch((err) => console.warn("SW precache skip:", url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== ASSETS_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith("http")) return;
  if (url.origin !== self.location.origin) return;

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match("/offline.html");
          })
        )
    );
    return;
  }

  event.respondWith(
    caches.open(ASSETS_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") {
    self.skipWaiting();
  }
});
