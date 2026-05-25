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
//   PUSH NOTIFICATIONS (push del servidor)
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
//
//   Usa timestamps absolutos (fireAt) en vez de
//   setTimeout para sobrevivir reinicios del SW.
//   El interval de 60s revisa si alguna notif venció.
// ═══════════════════════════════════════════

// { fireAt: timestamp_ms, title, body, tag, icon, dailyMs: 86400000 }
let scheduledNotifications = [];
let checkIntervalId = null;

const fireNotification = ({ title, body, tag, icon }) => {
  self.registration.showNotification(title, {
    body,
    icon:  icon || '/icon-192.png',
    badge: '/icon-72.png',
    tag:   tag  || 'caloru-notif',
    renotify: true,
  });
};

const checkDueNotifications = () => {
  const now = Date.now();
  scheduledNotifications.forEach(n => {
    if (n.fireAt <= now) {
      fireNotification(n);
      // Re-agendar para mañana a la misma hora
      n.fireAt += n.dailyMs || (24 * 60 * 60 * 1000);
    }
  });
};

const startChecker = () => {
  if (checkIntervalId) return; // ya está corriendo
  checkIntervalId = setInterval(checkDueNotifications, 60 * 1000); // cada 60 s
};

const stopChecker = () => {
  if (checkIntervalId) { clearInterval(checkIntervalId); checkIntervalId = null; }
};

self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    stopChecker();
    const notifications = e.data.notifications || [];
    const now = Date.now();
    scheduledNotifications = notifications
      .filter(n => n.delay != null)
      .map(n => ({
        title:   n.title,
        body:    n.body,
        tag:     n.tag,
        icon:    n.icon,
        fireAt:  now + Math.max(0, n.delay),
        dailyMs: 24 * 60 * 60 * 1000,
      }));
    if (scheduledNotifications.length) startChecker();
  }

  if (e.data.type === 'CLEAR_NOTIFICATIONS') {
    scheduledNotifications = [];
    stopChecker();
  }
});
