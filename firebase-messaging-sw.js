
// Estas versiones deben coincidir con las que usa tu app o ser compatibles.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

console.log('[firebase-messaging-sw.js] Script loaded. Service Worker starting process.');

// ================================================================================================
// ¡¡¡MUY IMPORTANTE!!!
// REEMPLAZA LOS VALORES DE "XXXX" CON TU CONFIGURACIÓN REAL DE FIREBASE ANTES DE PROBAR.
// Estos valores deben coincidir con los que tienes en tu .env.local para las variables NEXT_PUBLIC_FIREBASE_...
// Si estos valores no son correctos, Firebase no se inicializará en el Service Worker y las notificaciones PUSH NO FUNCIONARÁN.
// ================================================================================================
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
// ================================================================================================
// FIN DE LA SECCIÓN DE CONFIGURACIÓN CRÍTICA
// ================================================================================================


let firebaseInitialized = false;
let messagingInstance = null;

function initializeFirebaseAndMessaging() {
  if (firebaseInitialized) {
    console.log('[firebase-messaging-sw.js] Firebase already initialized.');
    return true;
  }
  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
      console.log('[firebase-messaging-sw.js] Firebase app initialized successfully.');
    } else {
      firebase.app(); // Get default app
      console.log('[firebase-messaging-sw.js] Firebase app already exists.');
    }
    firebaseInitialized = true;

    if (firebase.messaging.isSupported()) {
      messagingInstance = firebase.messaging();
      console.log('[firebase-messaging-sw.js] Firebase Messaging instance created.');
      
      messagingInstance.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message (FCM): ', payload);
        
        const notificationTitle = payload.notification?.title || 'Nueva Notificación de SignLink';
        const notificationOptions = {
          body: payload.notification?.body || 'Tienes una nueva actualización.',
          icon: payload.notification?.icon || '/icon-192x192.png', // Asegúrate de tener este ícono
          badge: '/badge-72x72.png', // Opcional: un badge para la notificación
          data: payload.data || { url: '/' }, // Para manejar clics, si envías data
        };

        if (self.registration && typeof self.registration.showNotification === 'function') {
          self.registration.showNotification(notificationTitle, notificationOptions)
            .then(() => console.log('[firebase-messaging-sw.js] Background FCM notification shown.'))
            .catch(err => console.error('[firebase-messaging-sw.js] Error showing background FCM notification:', err));
        } else {
          console.error('[firebase-messaging-sw.js] self.registration.showNotification is not available to display the FCM notification.');
        }
      });
      console.log('[firebase-messaging-sw.js] onBackgroundMessage handler set up.');
      return true;
    } else {
      console.warn('[firebase-messaging-sw.js] Firebase Messaging is NOT supported in this Service Worker context.');
      return false;
    }
  } catch (error) {
    console.error('[firebase-messaging-sw.js] CRITICAL ERROR during Firebase initialization or Messaging setup:', error);
    console.error('[firebase-messaging-sw.js] Ensure firebaseConfig is correctly set with your REAL project values.');
    firebaseInitialized = false; // Reset flag on error
    return false;
  }
}

self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Event: install. Forcing skipWaiting.');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Event: activate. Claiming clients and initializing Firebase.');
  // Initialize Firebase here to ensure PushManager is available
  event.waitUntil(
    self.clients.claim().then(() => {
      if (initializeFirebaseAndMessaging()) {
        console.log('[firebase-messaging-sw.js] Firebase initialized on activate.');
      } else {
        console.error('[firebase-messaging-sw.js] Firebase failed to initialize on activate.');
      }
    })
  );
});

// Listener for direct messages from the client page (for testing notification display)
self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] Event: message. Data received:', event.data);
  if (event.data && event.data.type === 'SHOW_SW_NOTIFICATION_TEST') {
    const title = event.data.title || 'Test Notification (SW)';
    const options = event.data.options || { body: 'This is a test from Service Worker.', icon: '/icon-192x192.png' };
    
    if (self.registration && typeof self.registration.showNotification === 'function') {
      self.registration.showNotification(title, options)
        .then(() => console.log('[firebase-messaging-sw.js] Test notification shown via postMessage.'))
        .catch(err => console.error('[firebase-messaging-sw.js] Error showing test notification via postMessage:', err));
    } else {
      console.error('[firebase-messaging-sw.js] self.registration.showNotification not available for test message.');
    }
  }
});

// Fallback push event listener (onBackgroundMessage is generally preferred for FCM)
self.addEventListener('push', event => {
  console.log('[firebase-messaging-sw.js] Event: push. Raw data:', event.data?.text());
  // If onBackgroundMessage is set up correctly with FCM, it should handle the display.
  // This is more of a generic push event listener.
  // For FCM, ensure initializeFirebaseAndMessaging() has been called and was successful.
  if (!firebaseInitialized || !messagingInstance) {
    console.warn('[firebase-messaging-sw.js] Push event received, but Firebase Messaging not initialized. Attempting init...');
    if (!initializeFirebaseAndMessaging()) {
        console.error('[firebase-messaging-sw.js] Failed to initialize Firebase for push event. Notification might not be displayed by FCM handlers.');
        // Potentially try to parse event.data directly if it's a simple format and show a basic notification
        // const pushData = event.data?.json(); // if you expect JSON
        // if(pushData && pushData.notification){
        //    self.registration.showNotification(pushData.notification.title, { body: pushData.notification.body });
        // }
        return;
    }
  }
  console.log('[firebase-messaging-sw.js] Push event received, FCM should handle it via onBackgroundMessage if payload is FCM compliant.');
});

console.log('[firebase-messaging-sw.js] Service Worker script fully parsed and listeners attached.');
