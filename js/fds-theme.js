/* ============================================================
   FORTICS DS — THEME
   Light / Dark com persistência via localStorage.

   USO:
     <div class="fds-theme-toggle" data-fds-theme-toggle>
       <button data-theme-set="light" aria-label="Tema claro">☀</button>
       <button data-theme-set="dark"  aria-label="Tema escuro">☾</button>
     </div>

   API:
     FDS.theme.set('light' | 'dark')
     FDS.theme.toggle()
     FDS.theme.current()
   ============================================================ */

(function (global) {
  'use strict';
  const KEY = 'fds-theme';

  function current() {
    return document.documentElement.getAttribute('data-theme')
      || (localStorage.getItem(KEY))
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');  // default: light
  }

  function set(theme) {
    if (!['light', 'dark'].includes(theme)) return;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    updateToggles(theme);
    document.dispatchEvent(new CustomEvent('fds:theme-change', { detail: { theme } }));
  }

  function toggle() { set(current() === 'light' ? 'dark' : 'light'); }

  function updateToggles(theme) {
    document.querySelectorAll('[data-fds-theme-toggle] [data-theme-set]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-theme-set') === theme ? 'true' : 'false');
    });
  }

  function init() {
    // hidrata tema persistido ou seguindo SO
    const persisted = localStorage.getItem(KEY);
    if (persisted) document.documentElement.setAttribute('data-theme', persisted);

    // delega clique
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-set]');
      if (!btn) return;
      set(btn.getAttribute('data-theme-set'));
    });

    updateToggles(current());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.FDS = global.FDS || {};
  global.FDS.theme = { set, toggle, current };
})(window);
