// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// Request fullscreen on Android
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
  console.log('✅ Running as PWA');
  
  // Hide address bar on mobile
  window.scrollTo(0, 1);
  
  // Request fullscreen on user interaction
  document.addEventListener('touchstart', function requestFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    document.removeEventListener('touchstart', requestFullscreen);
  }, { once: true });
}


