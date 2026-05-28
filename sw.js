const CACHE_NAME = 'nielit-cbt-offline-v3';

// उन सभी ऑनलाइन लिंक्स की लिस्ट जो आपके HTML में हैं, इन्हें यहीं से कैश कर लिया जाएगा
const ASSETS_TO_CACHE = [
  './',                  // आपकी मुख्य वेबसाइट का रूट
  './index.html',        // आपकी HTML फ़ाइल
  './questions.json',    // आपकी सवालों वाली JSON फ़ाइल (इसे लोकल फोल्डर में ही रखें)
  './manifest.json',     // PWA की फाइल

  // ऑनलाइन लोगो लिंक (बिना HTML बदले ऑफलाइन चलाने के लिए)
  'https://harshitkaushal9129-bit.github.io/O-level-mcqs-practice/mcqs.png',

  // ऑनलाइन स्क्रिप्ट्स, फॉन्ट्स और क्यूआर कोड लाइब्रेरी जो आपके HTML में लिंक्ड हैं
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght=400;500;600;700;800;900&display=swap'
];

// 1. Install: पहली बार ओपन होते ही सारा ऑनलाइन माल-मसाला डाउनलोड करके कैश में डालो
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] All Online Assets & Logo Pre-cached!');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Activate: पुराना कचरा साफ करो ताकि ऐप एकदम फ्रेश रहे
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache storage');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch: अब इंटरनेट हो या न हो, जब भी HTML ऑनलाइन लिंक्स मांगेगा, सर्विस वर्कर उसे कैश से निकाल कर देगा
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // अगर तिजोरी (Cache) में फाइल मिल गई, तो बिना इंटरनेट के तुरंत स्क्रीन पर दिखाओ
      if (cachedResponse) {
        return cachedResponse;
      }

      // अगर कोई नई चीज है, तो इंटरनेट से मंगाओ और साथ ही उसकी एक कॉपी तिजोरी में रख लो
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        console.log('[Service Worker] Device completely offline. Fetch bypassed.');
      });
    })
  );
});
