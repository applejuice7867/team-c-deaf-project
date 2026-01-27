/* Firebase initialization (Compat SDK for simplicity)
   Loads API key from secrets.env if available. Firebase API keys are public identifiers.
*/

(async function() {
  try {
    if (typeof firebase === 'undefined' || !firebase.initializeApp) {
      console.warn('Firebase SDK not loaded. Skipping init.');
      window.firebaseReady = false;
      return;
    }


    const firebaseConfig = {
      apiKey: "AIzaSyDOC9QnSFz8inpL6YGIzWy0rz05Iyf7s50",
      authDomain: "app-cloud-11d89.firebaseapp.com",
      projectId: "app-cloud-11d89",
      storageBucket: "app-cloud-11d89.appspot.com",
      messagingSenderId: "815663475397",
      appId: "1:815663475397:web:19f1cc36b53726d88a9eac"
    };

    if (firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    window.firebaseApp = firebase.app();
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    window.firebaseReady = true;

    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.warn);
  } catch (e) {
    console.warn('Firebase init error:', e);
    window.firebaseReady = false;
  }
})();

