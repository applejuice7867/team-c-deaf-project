(function() {
  function applyLanguage(lang) {
    try {
      const finalLang = (lang === 'en') ? 'en' : 'zh-HK';
      document.body.classList.remove('lang-zh-HK', 'lang-en');
      document.body.classList.add(finalLang === 'en' ? 'lang-en' : 'lang-zh-HK');
      localStorage.setItem('lang', finalLang);
      const selectEl = document.getElementById('language-select');
      if (selectEl) selectEl.value = finalLang;
    } catch (e) { console.warn('applyLanguage error', e); }
  }

  function applyThemePref(theme) {
    try {
      const finalTheme = (theme === 'dark') ? 'dark' : 'light';
      if (finalTheme === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) { console.warn('applyThemePref error', e); }
  }

  // If Firebase is available, listen for signed-in user and load prefs
  document.addEventListener('DOMContentLoaded', function() {
    // Always apply localStorage first for instant paint
    const storedLang = localStorage.getItem('lang') || 'zh-HK';
    applyLanguage(storedLang);
    const storedTheme = localStorage.getItem('theme') || 'light';
    applyThemePref(storedTheme);

    if (!window.firebaseReady || !window.auth || !window.db) return;

    window.auth.onAuthStateChanged(async function(user) {
      const statusEl = document.getElementById('auth-status');
      const signInBtn = document.getElementById('btn-sign-in');
      const signOutBtn = document.getElementById('btn-sign-out');

      if (user) {
        if (statusEl) statusEl.textContent = (localStorage.getItem('lang') === 'en') ? `Signed in as ${user.email || user.displayName || user.uid}` : `已登入：${user.email || user.displayName || user.uid}`;
        if (signInBtn) signInBtn.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'inline-block';
        try {
          const docRef = window.db.collection('users').doc(user.uid);
          const snap = await docRef.get();
          if (snap.exists) {
            const data = snap.data() || {};
            if (data.lang) applyLanguage(data.lang);
            if (data.theme) applyThemePref(data.theme);
          }
        } catch (e) {
          console.warn('Failed to load user prefs:', e);
        }
      } else {
        if (statusEl) statusEl.textContent = (localStorage.getItem('lang') === 'en') ? 'Not signed in' : '未登入';
        if (signInBtn) signInBtn.style.display = 'inline-block';
        if (signOutBtn) signOutBtn.style.display = 'none';
      }
    });
  });
})();
