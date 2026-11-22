// سرویس‌ورکر: بعد از اولین بازکردن، برنامه بدون اینترنت هم کار می‌کند.
// برای انتشار نسخه‌ی جدید، فقط همین عدد نسخه را عوض کن (مثلاً vocab-v3).
const V = "vocab-v2";
const FILES = ["./", "index.html", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  // allSettled: اگر یک فایل موقتاً در دسترس نبود، کل نصب خراب نشود
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(FILES.map(f => c.add(f)))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
// اول از حافظه بده (سریع و آفلاین)، همزمان در پس‌زمینه تازه‌اش کن
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const nav = e.request.mode === "navigate";
  e.respondWith(caches.match(e.request, nav ? {ignoreSearch: true} : undefined).then(cached => {
    const net = fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin)
        caches.open(V).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => cached || (nav ? caches.match("./") : undefined));
    return cached || net;
  }));
});
