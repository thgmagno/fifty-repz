// Service worker do Fifty Repz, escrito à mão (sem workbox/serwist): o
// bundler deste app é o Turbopack, e as bibliotecas de PWA disponíveis no
// momento (@serwist/next, next-pwa) só empacotam o service worker via
// webpack. Como public/sw.js é um arquivo estático simples, esse
// problema nem existe — o Next.js só precisa servi-lo, sem transformação.

const CACHE_VERSION = 'fifty-repz-v1'
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const STATIC_CACHE = `${CACHE_VERSION}-static`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const CURRENT_CACHES = [APP_SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE]

const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/manifest.json']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CURRENT_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error('offline e sem versão em cache')
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)
  return cached || fetchPromise
}

function isImageRequest(url) {
  return (
    url.pathname.startsWith('/_next/image') ||
    /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // navegação (reload / URL direta): tenta a rede, cai para a última
  // versão em cache dessa página e, sem nada em cache, para uma página
  // de "offline" genérica
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, APP_SHELL_CACHE).catch(async () => {
        const cache = await caches.open(APP_SHELL_CACHE)
        const offline = await cache.match(OFFLINE_URL)
        return offline || Response.error()
      }),
    )
    return
  }

  // manifest e ícones: praticamente estáticos
  if (url.pathname === '/manifest.json' || url.pathname.startsWith('/icon')) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE))
    return
  }

  // imagens do catálogo de exercícios (via /_next/image) e demais imagens:
  // mostra a versão em cache na hora, atualiza em segundo plano
  if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE))
    return
  }

  // assets do Next.js com hash no nome do arquivo: imutáveis, cache-first
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  }

  // demais requisições (RSC, API, dados dinâmicos/autenticados): sempre
  // rede, nunca cache
})
