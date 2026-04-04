// ICC Junior League Staff PWA Service Worker
const CACHE_NAME = 'icc-staff-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Push notification handler
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'ICC Junior League';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icc-logo.png',
    badge: '/icc-logo.png',
    data: { url: data.url || '/portal' },
    actions: data.actions || [],
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Notification click — open portal
// Only navigate to relative (same-origin) paths to prevent open-redirect
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const rawUrl = e.notification.data?.url || '/portal';
  // Restrict to relative paths; reject absolute URLs
  const url = typeof rawUrl === 'string' && rawUrl.startsWith('/') ? rawUrl : '/portal';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const match = clients.find(c => c.url.includes('/portal'));
      if (match) return match.focus();
      return self.clients.openWindow(url);
    })
  );
});
