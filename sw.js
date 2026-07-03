/* Escape from Ansla Island — service worker: the drums live here */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(err){}
  e.waitUntil(self.registration.showNotification(d.title || 'Ansla Island', {
    body: d.body || 'The island calls.',
    icon: 'art/concepts/ansla-emblem.png',
    badge: 'art/concepts/ansla-emblem.png',
    tag: d.tag || 'ansla-call',
    data: { url: './headquarters.html' }
  }));
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(list){
    for (var i = 0; i < list.length; i++){
      if (list[i].url.indexOf('headquarters') !== -1) return list[i].focus();
    }
    return self.clients.openWindow(e.notification.data && e.notification.data.url || './headquarters.html');
  }));
});
