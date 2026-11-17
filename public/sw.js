// Service worker Drim: кэширует оболочку приложения для быстрого запуска и работы как PWA.
const CACHE = 'drim-v3';
const SHELL = ['/', '/index.html', '/styles.css', '/js/core.js', '/js/layout.js', '/js/chat.js', '/js/modals.js', '/js/calls.js', '/js/main.js', '/emoji.js', '/icons/icon.svg', '/icons/icon-192.png', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) return;
  // Сначала сеть, при отсутствии — кэш
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
  );
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => {
    for (const c of list) { c.focus(); c.postMessage({ type: 'openChat', chatId: e.notification.data && e.notification.data.chatId }); return; }
    return self.clients.openWindow('/');
  }));
});
