/* Firebase initialization (Compat SDK for simplicity)
   Fill in your Firebase project config below. This file is safe to include on all pages.
*/

(function() {
  try {
    if (typeof firebase === 'undefined' || !firebase.initializeApp) {
      console.warn('Firebase SDK not loaded. Skipping init.');
      window.firebaseReady = false;
      return;
    }

    const firebaseConfig = {
      apiKey: "env.firebasekey.get()",
      authDomain: "app-cloud-11d89.firebaseapp.com",
      projectId: "app-cloud-11d89",
      storageBucket: "app-cloud-11d89.appspot.com",
      messagingSenderId: "815663475397 ",
      appId: "1:815663475397:web:19f1cc36b53726d88a9eac"
    };

    // Prevent re-initialization if already initialized
    if (firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    // Expose helpers
    window.firebaseApp = firebase.app();
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    window.firebaseReady = true;

    // Optional: Use local persistence for web
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.warn);
  } catch (e) {
    console.warn('Firebase init error:', e);
    window.firebaseReady = false;
  }
})();
