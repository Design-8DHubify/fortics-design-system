/* ============================================================
   FORTICS DS — TOAST
   Sistema de notificações dinâmicas.

   API:
     FDS.toast.success(title, msg?, opts?)
     FDS.toast.error(title,   msg?, opts?)
     FDS.toast.warning(title, msg?, opts?)
     FDS.toast.info(title,    msg?, opts?)
     FDS.toast.show({ variant, title, message, duration, icon })

   opts:
     duration  → ms (default 3500, 0 = persistente)
     icon      → caractere/HTML inline (default por variante)
   ============================================================ */

(function (global) {
  'use strict';
  const ICONS = { success: '✓', error: '×', warning: '!', info: 'i' };
  const LABELS = { success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Info' };

  let region;
  function ensureRegion() {
    if (region && document.body.contains(region)) return region;
    region = document.querySelector('.fds-toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'fds-toast-region';
      region.setAttribute('role', 'region');
      region.setAttribute('aria-label', 'Notificações');
      document.body.appendChild(region);
    }
    return region;
  }

  function show(opts) {
    const o = Object.assign({
      variant: 'info',
      title: '',
      message: '',
      duration: 3500,
      icon: null
    }, opts || {});

    const el = document.createElement('div');
    el.className = `fds-toast fds-toast--${o.variant}`;
    el.setAttribute('role', o.variant === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', o.variant === 'error' ? 'assertive' : 'polite');
    el.innerHTML = `
      <span class="fds-toast__icon" aria-hidden="true">${o.icon ?? ICONS[o.variant] ?? ''}</span>
      <div class="fds-toast__body">
        <p class="fds-toast__title">${escapeHTML(o.title || LABELS[o.variant])}</p>
        ${o.message ? `<p class="fds-toast__msg">${escapeHTML(o.message)}</p>` : ''}
      </div>
      <button class="fds-toast__close" type="button" aria-label="Fechar notificação">×</button>
    `;
    ensureRegion().appendChild(el);
    // trigger transition
    requestAnimationFrame(() => el.classList.add('is-visible'));

    const close = () => {
      el.classList.remove('is-visible');
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 480);
    };
    el.querySelector('.fds-toast__close').addEventListener('click', close);
    if (o.duration > 0) setTimeout(close, o.duration);
    return { close, element: el };
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const toast = {
    show,
    success: (title, message, opts) => show(Object.assign({ variant: 'success', title, message }, opts)),
    error:   (title, message, opts) => show(Object.assign({ variant: 'error',   title, message }, opts)),
    warning: (title, message, opts) => show(Object.assign({ variant: 'warning', title, message }, opts)),
    info:    (title, message, opts) => show(Object.assign({ variant: 'info',    title, message }, opts))
  };

  global.FDS = global.FDS || {};
  global.FDS.toast = toast;
})(window);
