// سرویس‌ورکر: بعد از اولین بازکردن، برنامه بدون اینترنت هم کار می‌کند.
// برای انتشار نسخه‌ی جدید، عدد نسخه را عوض کن.
const V = "vocab-v1";
const FILES = ["./", "index.html", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
// اول از حافظه بده (سریع و آفلاین)، همزمان در پس‌زمینه تازه‌اش کن
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(cached => {
    const net = fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) caches.open(V).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
