const CACHE_NAME = 'nielit-v3'; // Cache version badal diya taaki naya code force-load ho

const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  
  // CORS issue se bachne ke liye inhein Request object ke through fetch karenge
  new Request('https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/mcqs.png', { mode: 'cors' }),
  new Request('https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/questions.json', { mode: 'cors' }),
  
  // External CSS, JS and Fonts
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  
  // Font Awesome files
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets with CORS bypass...');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
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

// Fetching Assets (Cache First Strategy)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Agar cache mein data hai toh turant return karo (Offline mode ke liye)
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Agar cache mein nahi hai toh network se fetch karo
      return fetch(e.request).catch((err) => {
        console.error('Fetch failed offline:', err);
      });
    })
  );
});
