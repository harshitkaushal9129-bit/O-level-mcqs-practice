const CACHE_NAME = 'nielit-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/mcqs.png',
  'https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/questions.json',
  
  // External CSS, JS and Fonts cached for Offline usage
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  
  // Font Awesome files (Taaki icons offline gayab na hon)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Instantly active karne ke liye
  );
});

// Activate & Cleanup Old Caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetching Assets (Network Fallback Strategy)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Agar cache mein mile toh wahi return karo, nahi to network se fetch karo
      return response || fetch(e.request);
    })
  );
});
