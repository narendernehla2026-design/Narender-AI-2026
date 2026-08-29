// Minimal service worker for asset caching and offline fallback.
const CACHE_NAME = 'narender-ai-vault-v1'
const OFFLINE_URL = '/offline.html'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  OFFLINE_URL
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (request.method === 'GET' && res && res.status === 200) {
        const copy = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      }
      return res
    }).catch(() => caches.match(OFFLINE_URL)))
  )
})
