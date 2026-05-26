/* ============================================================
   FORTICS DS — AUTH GUARD
   Proteção simples por sessão para o Design System.
   Inclua este script antes de qualquer conteúdo em todas as páginas.

   Credenciais padrão:
     Usuário : fortics
     Senha   : Fortics@2026

   Para alterar, edite CREDENTIALS abaixo.
   ============================================================ */

(function () {
  'use strict';

  const AUTH_KEY   = 'fds-session-v1';
  const CREDENTIALS = [
    { user: 'fortics', pass: 'Fortics@2026' },
  ];

  const path       = window.location.pathname;
  const isLogin    = path.endsWith('login.html') || path.endsWith('/login');
  const isInPages  = path.includes('/pages/');
  const loginUrl   = isInPages ? '../login.html' : 'login.html';

  /* ── Helpers ─────────────────────────────────────────────── */
  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === '1'; } catch (_) { return false; }
  }

  function doLogin(user, pass) {
    const ok = CREDENTIALS.some(c => c.user === user.trim() && c.pass === pass);
    if (ok) {
      try { sessionStorage.setItem(AUTH_KEY, '1'); } catch (_) {}
    }
    return ok;
  }

  function doLogout() {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (_) {}
    window.location.replace(loginUrl);
  }

  /* ── Guard: redireciona se não autenticado ───────────────── */
  if (!isLogin && !isAuthed()) {
    document.documentElement.style.visibility = 'hidden';
    window.location.replace(loginUrl);
    return; // para execução imediata
  }

  /* ── Se já autenticado na página de login, vai para home ─── */
  if (isLogin && isAuthed()) {
    window.location.replace('index.html');
    return;
  }

  /* ── API global ─────────────────────────────────────────── */
  window.FDSAuth = { login: doLogin, logout: doLogout, isAuthed };
})();
