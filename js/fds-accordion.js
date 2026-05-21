/* ============================================================
   FORTICS DS — ACCORDION
   <div class="fds-accordion" data-fds-accordion[="single"]>
     <details class="fds-accordion__item">
       <summary class="fds-accordion__head">...</summary>
       <div class="fds-accordion__body">...</div>
     </details>
   </div>
   data-fds-accordion="single" → fecha os outros ao abrir um
   ============================================================ */
(function(){
  function init() {
    document.querySelectorAll('[data-fds-accordion]').forEach(acc => {
      if (acc.dataset.fdsInit === '1') return;
      acc.dataset.fdsInit = '1';
      const mode = acc.getAttribute('data-fds-accordion') || 'multi';
      const items = acc.querySelectorAll('details.fds-accordion__item');
      items.forEach(item => {
        item.addEventListener('toggle', () => {
          if (mode === 'single' && item.open) {
            items.forEach(other => { if (other !== item) other.open = false; });
          }
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {}; window.FDS.accordion = { init };
})();
