// Basic service worker registration for the PWA prototype
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // console.log('SW registered', reg)
    }).catch(err => {
      // console.warn('SW registration failed', err)
    })
  })
}
