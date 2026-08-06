// Service worker версии в подпапке /v1007/ (офлайн-доступ на iPad).
// ДАННЫЕ ОБНОВЛЕНЫ на срез 31.07.2026 (адрес подпапки оставлен прежним, чтобы уже
// установленная на iPad иконка обновилась сама). Версия кэша поднята v1→v2 — иначе
// старый service worker продолжил бы отдавать офлайн-копию с данными 10.07.
// Отдельный CACHE; HTML кэшируется по ФАКТИЧЕСКОМУ URL запроса, чтобы версии в соседних
// подпапках не мешали офлайну друг друга.
var CACHE = 'k26l-1007-v3';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var accept = req.headers && req.headers.get ? (req.headers.get('accept') || '') : '';
  var isHtml = req.mode === 'navigate' || accept.indexOf('text/html') >= 0;
  if (isHtml) {
    e.respondWith(
      fetch(req).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return resp;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }
  e.respondWith(caches.match(req).then(function (r) { return r || fetch(req); }));
});
