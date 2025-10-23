/* Increment this on each deploy to bust old caches */
const CACHE_VERSION = "ihw-v1";
const CACHE = `ihw-cache-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",                // app shell (served by Pages)
  "/index.html",
  "/manifest.webmanifest"
  // Note: Vite adds hashed assets; we cache them on-the-fly below
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // activate new SW immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Network-first for navigations and static assets; fallback to cache offline
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GETs from our origin
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  const isNav = req.mode === "navigate";
  const isStatic =
    ["style", "script", "image", "font", "manifest"].includes(req.destination) ||
    req.url.endsWith(".js") || req.url.endsWith(".css");

  if (!(isNav || isStatic)) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone()); // update cache in background
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (isNav) {
          // Last resort: return shell if available
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })()
  );
});

// Support manual skipWaiting from page (optional)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
