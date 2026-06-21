import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const BUILD_DIR = join(ROOT, ".next");
const PUBLIC_DIR = join(ROOT, "public");

function collectFiles(dir, prefix = "") {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full, prefix + entry + "/"));
    } else {
      files.push(prefix + entry);
    }
  }
  return files;
}

const staticPages = [
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
];

const chunksDir = join(BUILD_DIR, "static", "chunks");
const chunkFiles = collectFiles(chunksDir, "static/chunks/");

const metaDir = join(BUILD_DIR, "static");
const metaFiles = collectFiles(metaDir, "static/")
  .filter((f) => !f.startsWith("static/chunks/") && !f.startsWith("static/media/"));

const precacheUrls = [
  ...staticPages,
  ...chunkFiles.map((f) => "/_next/" + f),
  ...metaFiles.map((f) => "/_next/" + f),
];

const urlsJson = JSON.stringify(precacheUrls, null, 2);

const swContent = `const CACHE_NAME = "cilokreward-pages-v5";
const ASSETS_CACHE = "cilokreward-assets-v5";

const PRECACHE_URLS = ${urlsJson};

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
`;

writeFileSync(join(PUBLIC_DIR, "sw.js"), swContent, "utf-8");
console.log("sw.js generated with " + precacheUrls.length + " precache URLs");
