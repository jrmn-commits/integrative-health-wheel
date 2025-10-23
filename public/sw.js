const CACHE = "ihw-cache-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Network-first for navigation and static assets, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const isNav = request.mode === "navigate";
  const isStatic =
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "manifest";

  if (!(isNav || isStatic)) return; // let other requests pass through

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isNav) {
          // offline fallback to shell
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        throw new Error("Network error and no cache.");
      }
    })()
  );
});
