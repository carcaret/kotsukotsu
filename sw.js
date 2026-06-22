const CACHE = 'kotsukotsu-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/src/state.js',
  '/src/log.js',
  '/src/render.js',
  '/src/github.js',
  '/data/data.json',
];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
);

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
);

self.addEventListener('fetch', e => {
  if (
    e.request.url.includes('api.github.com') ||
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('fonts.gstatic.com')
  ) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
