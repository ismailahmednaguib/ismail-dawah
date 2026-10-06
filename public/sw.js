self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.clients.claim());

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.endsWith(".png")) {
    e.respondWith(
      caches.open("v1").then(async (c) => {
        const cached = await c.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  e.respondWith(
    caches.open("v1").then(async (c) => {
      try {
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      } catch {
        const cached = await c.match(e.request);
        return cached || Response.error();
      }
    })
  );
});