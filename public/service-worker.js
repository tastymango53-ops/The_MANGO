// Red Rose Mango — Service Worker
// Handles background push notification display

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Red Rose Mango', body: event.data.text() };
  }

  const title = payload.title || 'Red Rose Mango 🥭';
  const options = {
    body: payload.body || 'You have a new notification.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.url ? { url: payload.url } : {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
