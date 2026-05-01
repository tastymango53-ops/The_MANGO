self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  let title = 'Red Rose Mango 🥭';
  let body = 'You have a new notification';
  try {
    const data = event.data.json();
    title = data.title || title;
    body = data.body || body;
  } catch(e) {
    body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});