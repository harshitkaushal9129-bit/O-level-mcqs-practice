// sw.js - Service Worker for NIELIT Official CBT

const CACHE_NAME = 'nielit-cbt-v1';

// 1. Un assets ki list jo app ko offline chalane ke liye zaroori hain
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/mcqs.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// --- INSTALL EVENT ---
// Jab Service Worker pehli baar load hoga, saare important assets ko cache me save karega
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Core assets caching complete!');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Naye service worker ko turant activate karne ke liye
  );
});

// --- ACTIVATE EVENT ---
// Agar aap future me koi naya cache version late hain, toh yeh purane caches ko delete kar dega
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Old cache cleared:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- FETCH EVENT (Network-First with Cache Fallback) ---
// Questions JSON aur online updates ke liye Network-First best hai taaki naye sawal hamesha mil sakein.
// Agar internet nahi hoga, toh yeh cache se load kara dega.
self.addEventListener('fetch', (event) => {
  // Sirf standard HTTP/HTTPS requests ko intercept karein (UPI protocols ko chhodkar)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Agar network sahi chal raha hai, toh response ki ek copy cache me save/update kar lo
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Agar internet band hai, toh check karo kya yeh file cache me save hai
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Agar cache me bhi nahi hai aur image request hai, toh default icon return karein
          if (event.request.headers.get('accept').includes('image')) {
            return caches.match('https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/mcqs.png');
          }
        });
      })
  );
});
