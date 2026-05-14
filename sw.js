const CACHE = 'caloru-v3';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// ═══════════════════════════════════════════
//   PUSH NOTIFICATIONS
// ═══════════════════════════════════════════

self.addEventListener('push', e => {
  let data = { title: 'Calorú', body: '¡No olvides registrar tu comida!', icon: '/icon-192.png', badge: '/icon-72.png', tag: 'caloru-notif' };
  try {
    if (e.data) data = { ...data, ...e.data.json() };
  } catch(_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon    || '/icon-192.png',
      badge:   data.badge   || '/icon-72.png',
      tag:     data.tag     || 'caloru-notif',
      renotify: true,
      data:    data.url ? { url: data.url } : {},
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(location.origin) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

// ═══════════════════════════════════════════
//   SCHEDULED NOTIFICATIONS (via postMessage)
//   La app le envía el schedule al SW cuando
//   el usuario activa los recordatorios
// ═══════════════════════════════════════════

let scheduledTimers = [];

const clearScheduled = () => {
  scheduledTimers.forEach(t => clearTimeout(t));
  scheduledTimers = [];
};

const scheduleNotification = ({ delay, title, body, tag, icon }) => {
  const t = setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-72.png',
      tag: tag || 'caloru-notif',
      renotify: true,
    });
  }, delay);
  scheduledTimers.push(t);
};

self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    clearScheduled();
    const notifications = e.data.notifications || [];
    notifications.forEach(n => scheduleNotification(n));
  }

  if (e.data.type === 'CLEAR_NOTIFICATIONS') {
    clearScheduled();
  }
});
