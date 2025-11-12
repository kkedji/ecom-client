const CACHE_NAME = 'ecom-pwa-v1.0.0'
const STATIC_CACHE = 'ecom-static-v1'
const DYNAMIC_CACHE = 'ecom-dynamic-v1'

// Assets critiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...')
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  )
})

// Gestion des requêtes (stratégie Cache First pour les assets, Network First pour les pages)
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return

  // Stratégie pour les différents types de ressources
  if (request.destination === 'image') {
    // Images: Cache First avec fallback réseau
    event.respondWith(cacheFirst(request))
  } else if (request.destination === 'script' || request.destination === 'style') {
    // JS/CSS: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request))
  } else if (request.mode === 'navigate') {
    // Pages: Network First avec fallback cache
    event.respondWith(networkFirst(request))
  } else {
    // Autres: Network First
    event.respondWith(networkFirst(request))
  }
})

// Stratégie Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Cache First failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Stratégie Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback pour les pages de navigation
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/')
      if (fallback) return fallback
    }
    
    return new Response('Offline - Ressource non disponible', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE)
      cache.then(cache => cache.put(request, networkResponse.clone()))
    }
    return networkResponse
  }).catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ cacheSize: size })
    })
  }
})

// Utilitaire pour calculer la taille du cache
async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    }
  }
  
  return Math.round(totalSize / 1024) // en KB
}

// Background Sync (pour les futures fonctionnalités)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'carbon-actions-sync') {
    event.waitUntil(syncCarbonActions())
  }
})

async function syncCarbonActions() {
  console.log('[SW] Syncing carbon actions...')
  // Implementation future pour synchroniser les actions carbone offline
}

// Push notifications (pour les futures fonctionnalités)
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification Ecom',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'ecom-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icons/action-dismiss.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Ecom', options)
  )
})

// Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
