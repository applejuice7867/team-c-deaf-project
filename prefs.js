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

  function createAuthModal() {
    if (document.getElementById('auth-modal-overlay')) return null;
    const overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const h2 = document.createElement('h2');
    h2.innerHTML = '<span class="lang-zh">登入或註冊</span><span class="lang-en">Sign in or Sign up</span>';
    const p = document.createElement('p');
    p.innerHTML = '<span class="lang-zh">登入後可同步您的主題和語言設定。</span><span class="lang-en">Sign in to sync your theme and language preferences.</span>';

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const btnGo = document.createElement('button');
    btnGo.className = 'btn-primary';
    btnGo.innerHTML = '<span class="lang-zh">前往登入</span><span class="lang-en">Go to Login</span>';
    btnGo.onclick = function() {
      window.location.href = './login.html';
    };

    const btnLater = document.createElement('button');
    btnLater.className = 'btn-secondary';
    btnLater.innerHTML = '<span class="lang-zh">稍後</span><span class="lang-en">Later</span>';
    btnLater.onclick = function() {
      overlay.style.display = 'none';
    };

    actions.appendChild(btnGo);
    actions.appendChild(btnLater);

    modal.appendChild(h2);
    modal.appendChild(p);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return overlay;
  }

  function showAuthModalNow() {
    const overlay = createAuthModal();
    if (overlay) overlay.style.display = 'flex';
  }

  document.addEventListener('DOMContentLoaded', function() {
    const storedLang = localStorage.getItem('lang') || 'zh-HK';
    applyLanguage(storedLang);
    const storedTheme = localStorage.getItem('theme') || 'light';
    applyThemePref(storedTheme);

    if (!window.firebaseReady || !window.auth || !window.db) {
      showAuthModalNow();
      return;
    }

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
        showAuthModalNow();
      }
    });
  });
})();
