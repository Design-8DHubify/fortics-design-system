/* ============================================================
   FORTICS DS — DROPDOWN
   Inicializa <div class="fds-dropdown" data-fds-dropdown>
   Toggle via data-open + click-outside para fechar.
   ============================================================ */
(function(){
  function open(dd) { dd.setAttribute('data-open', 'true'); }
  function close(dd) { dd.setAttribute('data-open', 'false'); }
  function init() {
    document.querySelectorAll('.fds-dropdown').forEach(dd => {
      if (dd.dataset.fdsInit === '1') return;
      dd.dataset.fdsInit = '1';
      const trg = dd.querySelector('.fds-dropdown__trigger');
      if (!trg) return;
      trg.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dd.getAttribute('data-open') === 'true';
        document.querySelectorAll('.fds-dropdown[data-open="true"]').forEach(other => other !== dd && close(other));
        isOpen ? close(dd) : open(dd);
      });
      dd.querySelectorAll('.fds-dropdown__item').forEach(item => {
        item.addEventListener('click', () => close(dd));
      });
    });
    if (!window.__fdsDropdownGlobal) {
      window.__fdsDropdownGlobal = true;
      document.addEventListener('click', () => {
        document.querySelectorAll('.fds-dropdown[data-open="true"]').forEach(close);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') document.querySelectorAll('.fds-dropdown[data-open="true"]').forEach(close);
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {};
  window.FDS.dropdown = { init };
})();
