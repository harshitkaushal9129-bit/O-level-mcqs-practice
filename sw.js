const CACHE_NAME = 'nielit-v2'; // Cache version update kiya taaki changes apply ho sakein
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  './mcqs.png',         // Relative path use kiya CORS issue se bachne ke liye
  './questions.json',    // Relative path use kiya exact cache matching ke liye
  
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

// Fetching Assets (Cache First with Network Fallback Strategy)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 1. Agar cache mein asset mil gaya, toh bina network ke directly return karo
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Agar cache mein nahi mila (jaise koi nayi request), toh network se fetch karo
      return fetch(e.request).catch((err) => {
        console.log('Network request failed and asset not in cache:', err);
        // Aap chahein toh yahan return kuch default error mesh ya blank data bhej sakte hain
      });
    })
  );
});
