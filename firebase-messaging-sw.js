// // public/firebase-messaging-sw.js

// // Estas versiones deben coincidir con las que usa tu app si es posible, o ser compatibles.
// importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// // REEMPLAZA ESTO CON TU CONFIGURACIÓN REAL DE FIREBASE

// const firebaseConfig = {
//     apiKey: "AIzaSyDJk0oYB5Nci2yWbrqTfPYMoSvwoB5RE8w",
//     authDomain: "signlink-mvp-240je.firebaseapp.com",
//     databaseURL: "https://signlink-mvp-240je-default-rtdb.firebaseio.com",
//     projectId: "signlink-mvp-240je",
//     storageBucket: "signlink-mvp-240je.firebasestorage.app",
//     messagingSenderId: "487669637611",
//     appId: "1:487669637611:web:09bce84cffcc27465b39ae",
//     measurementId: "YOUR_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" // <-- TU VALOR REAL AQUÍ (opcional pero bueno tenerlo)
//   };

// let app;
// if (firebase.apps.length === 0) {
//   app = firebase.initializeApp(firebaseConfig);
// } else {
//   app = firebase.app();
// }

// let messaging;
// if (firebase.messaging.isSupported()) {
//     messaging = firebase.messaging(app);

//     messaging.onBackgroundMessage((payload) => {
//       console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
//       const notificationTitle = payload.notification?.title || 'Nueva Solicitud de SignLink';
//       const notificationOptions = {
//         body: payload.notification?.body || 'Un usuario necesita un intérprete.',
//         icon: '/icon-192x192.png' // Asegúrate de tener este ícono o cambia la ruta
//         // badge: '/badge-72x72.png', // Opcional
//         // image: payload.notification?.image, // Opcional
//         // data: { url: payload.fcmOptions?.link || '/' } // Para abrir una URL al hacer clic
//       };

//       self.registration.showNotification(notificationTitle, notificationOptions);
//     });
// } else {
//     console.log('[firebase-messaging-sw.js] Firebase Messaging is not supported in this service worker context.');
// }

// public/firebase-messaging-sw.js

// Estas versiones deben coincidir con las que usa tu app o ser compatibles.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

console.log('[firebase-messaging-sw.js] Script loaded. Service Worker starting.');

// MUY IMPORTANTE: REEMPLAZA ESTOS VALORES CON TU CONFIGURACIÓN REAL DE FIREBASE


  const firebaseConfig = {
    apiKey: "AIzaSyDJk0oYB5Nci2yWbrqTfPYMoSvwoB5RE8w",
    authDomain: "signlink-mvp-240je.firebaseapp.com",
    databaseURL: "https://signlink-mvp-240je-default-rtdb.firebaseio.com",
    projectId: "signlink-mvp-240je",
    storageBucket: "signlink-mvp-240je.firebasestorage.app",
    messagingSenderId: "487669637611",
    appId: "1:487669637611:web:09bce84cffcc27465b39ae",
    measurementId: "G-L6BLNB7C3D"
  };


try {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    console.log('[firebase-messaging-sw.js] Firebase app initialized successfully inside Service Worker.');
  } else {
    firebase.app(); // Get default app
    console.log('[firebase-messaging-sw.js] Firebase app already exists in Service Worker.');
  }

  if (firebase.messaging.isSupported()) {
    const messaging = firebase.messaging();
    console.log('[firebase-messaging-sw.js] Firebase Messaging instance created in Service Worker.');

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message: ', payload);
      
      const notificationTitle = payload.notification?.title || 'Nueva Solicitud de SignLink';
      const notificationOptions = {
        body: payload.notification?.body || 'Un usuario necesita un intérprete.',
        icon: '/icon-192x192.png', // Asegúrate de tener este ícono en public/ o usa uno tuyo
        // Opcional: puedes agregar más opciones como 'badge', 'image', 'data' para acciones al hacer clic
        // data: { url: payload.fcmOptions?.link || '/' } 
      };

      if (self.registration && typeof self.registration.showNotification === 'function') {
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => console.log('[firebase-messaging-sw.js] Background notification shown.'))
          .catch(err => console.error('[firebase-messaging-sw.js] Error showing background notification:', err));
      } else {
        console.error('[firebase-messaging-sw.js] self.registration.showNotification is not available to display the notification.');
      }
    });
  } else {
    console.warn('[firebase-messaging-sw.js] Firebase Messaging is NOT supported in this Service Worker context.');
  }
} catch (error) {
  console.error('[firebase-messaging-sw.js] CRITICAL ERROR during Firebase initialization or setup in Service Worker:', error);
}

self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Event: install. Forcing skipWaiting.');
  event.waitUntil(self.skipWaiting()); // Ensure the new service worker activates quickly
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Event: activate. Claiming clients.');
  event.waitUntil(self.clients.claim()); // Ensure it takes control of clients immediately
});

self.addEventListener('push', event => {
  console.log('[firebase-messaging-sw.js] Event: push. Raw data:', event.data?.text());
  // This is an alternative way to handle push if onBackgroundMessage doesn't fire for some reason,
  // though onBackgroundMessage is preferred for FCM.
  // For FCM, `onBackgroundMessage` should handle it.
});
