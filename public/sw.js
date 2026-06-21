const CACHE_NAME = "cilokreward-pages-v6";
const ASSETS_CACHE = "cilokreward-assets-v6";

const PRECACHE_URLS = [
  "/",
  "/pelanggan",
  "/pelanggan/baru",
  "/pengaturan",
  "/qris",
  "/wa",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/_next/static/chunks/01dkdyukbdpqq.js",
  "/_next/static/chunks/05-c3ty_6dwfk.js",
  "/_next/static/chunks/07-hzktxqjvzd.js",
  "/_next/static/chunks/0cz1d0mv5g_q7.js",
  "/_next/static/chunks/0sr6czg2qtejm.css",
  "/_next/static/chunks/1-oy76x6jywj_.js",
  "/_next/static/chunks/11oof8oxnxiv9.js",
  "/_next/static/chunks/14mrh2-p_w84d.js",
  "/_next/static/chunks/1crakm2anrsi_.js",
  "/_next/static/chunks/25tkev7uot6yj.js",
  "/_next/static/chunks/2ft20mknf1xm3.js",
  "/_next/static/chunks/2ntbhq8af3__i.js",
  "/_next/static/chunks/2nykiepra7i1k.js",
  "/_next/static/chunks/2q828aiw-scuv.js",
  "/_next/static/chunks/33s71yzbhbl7m.js",
  "/_next/static/chunks/turbopack-1hjhervvwwap8.js",
  "/_next/static/JWMOcCbvoDfIHu1e04PzO/_buildManifest.js",
  "/_next/static/JWMOcCbvoDfIHu1e04PzO/_clientMiddlewareManifest.js",
  "/_next/static/JWMOcCbvoDfIHu1e04PzO/_ssgManifest.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: "no-cache" })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
              return Promise.reject("fetch failed: " + url);
            })
            .catch(() => console.warn("SW precache skip:", url))
        )
      )
    ).then(() => self.skipWaiting())
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
            caches.open(CACHE_NAME).then((cache) => cache.put(url.pathname, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request, { ignoreSearch: true }).then((cached) => {
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
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
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
