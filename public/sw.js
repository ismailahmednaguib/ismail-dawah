// ============================================================================
// عامل الخدمة (Service Worker) — التطبيق التدريجي ودعم العمل دون إنترنت
//
// يُخزّن مسبقًا صفحات أدوات المسلم الأساسية بالعربية والإنجليزية، ويعمل
// كطبقة وصول شبكي أولًا للصفحات، وتخزين أولًا للأصول الثابتة.
//
// قواعد مهمة:
//   • لا نتدخّل في طلبات غير GET، ولا في طلبات النطاقات الخارجية.
//   • لا نخزّن /api/ ولا /admin ولا بيانات RSC (تفاديًا لعرض واجهة قديمة).
//   • أي فشل في التخزين المسبق لا يُفشل التثبيت (كل رابط مستقل بنفسه)،
//     وإلّا تعطّل التطبيق كله بسبب رابط واحد غير موجود.
// ============================================================================

const VERSION = "v4";
const PAGE_CACHE = `ismail-pages-${VERSION}`;
const STATIC_CACHE = `ismail-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

// صفحات تُخزَّن عند التثبيت لتعمل دون إنترنت (الأذكار · القرآن · القبلة · المواقيت)
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/ar/manifest.webmanifest",
  "/en/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/ar",
  "/en",
  "/ar/adhkar",
  "/en/adhkar",
  "/ar/quran",
  "/en/quran",
  "/ar/qibla",
  "/en/qibla",
  "/ar/prayer-times",
  "/en/prayer-times",
  "/ar/tasbih",
  "/en/tasbih",
];

// أصول ثابتة تُخزَّن بأسلوب «التخزين أولًا»
const STATIC_EXTENSIONS = /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|avif|ico)$/i;

function isPrecachable(request) {
  if (request.method !== "GET") return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/admin")) return false;
  if (url.pathname === "/login" || url.pathname === "/register") return false;
  if (url.pathname.startsWith("/_next/data/")) return false;

  // حِمل التنقّل داخل التطبيق (RSC) — لا نخزّنه حتى لا تظهر نسخة قديمة
  if (request.headers.get("RSC") === "1") return false;
  if (request.headers.get("Next-Router-Prefetch") === "1") return false;
  if (request.headers.get("Next-Router-State-Tree")) return false;

  return true;
}

// الصفحات: الشبكة أولًا، ثم التخزين، ثم صفحة «غير متصل»
async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response(
      "<!doctype html><meta charset=\"utf-8\"><title>غير متصل</title><p>تعذّر الاتصال بالشبكة.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// الأصول الثابتة: التخزين أولًا
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);

      // كل رابط على حدة: فشل رابط واحد لا يُفشل التثبيت
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== PAGE_CACHE && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (!isPrecachable(request)) return;

  // التنقّل بين الصفحات
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  const url = new URL(request.url);

  if (url.pathname.startsWith("/_next/static/") || STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // بقية الطلبات (مثل /_next/image) — نمرّرها للشبكة دون تخزين
});

// ============================================================
// الإشعارات
// ============================================================

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "الشيخ إسماعيل";
  const options = {
    body: data.body || "محتوى جديد",
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/ar" },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(event.notification.data.url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
      return undefined;
    })
  );
});
