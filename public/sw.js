/* Bump this when you want clients to refresh cached files */
const CACHE_VERSION = "ihw-v1";
const CACHE = `ihw-cache-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
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

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  const isNav = req.mode === "navigate";
  const isStatic =
    ["style", "script", "image", "font", "manifest"].includes(req.destination) ||
    url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

  if (!(isNav || isStatic)) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (isNav) {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503 });
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
