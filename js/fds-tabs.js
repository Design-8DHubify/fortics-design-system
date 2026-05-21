/* ============================================================
   FORTICS DS — TABS
   <div class="fds-tabs" data-fds-tabs>
     <div class="fds-tabs__list" role="tablist">
       <button class="fds-tabs__tab" role="tab" aria-controls="t1">Tab 1</button>
       ...
     </div>
     <div class="fds-tabs__panels">
       <div id="t1" class="fds-tabs__panel" role="tabpanel">...</div>
       ...
     </div>
   </div>
   ============================================================ */
(function(){
  function init() {
    document.querySelectorAll('[data-fds-tabs]').forEach(tabs => {
      if (tabs.dataset.fdsInit === '1') return;
      tabs.dataset.fdsInit = '1';
      const tabBtns = tabs.querySelectorAll('.fds-tabs__tab');
      const panels = tabs.querySelectorAll('.fds-tabs__panel');
      function activate(idx) {
        tabBtns.forEach((b, i) => {
          b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
          b.tabIndex = i === idx ? 0 : -1;
        });
        panels.forEach((p, i) => p.hidden = i !== idx);
      }
      tabBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => activate(i));
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') { const n = (i+1) % tabBtns.length; tabBtns[n].focus(); activate(n); }
          if (e.key === 'ArrowLeft')  { const n = (i-1+tabBtns.length) % tabBtns.length; tabBtns[n].focus(); activate(n); }
        });
      });
      // ativa a primeira (ou a que tem aria-selected="true")
      const initialIdx = Array.from(tabBtns).findIndex(b => b.getAttribute('aria-selected') === 'true');
      activate(initialIdx >= 0 ? initialIdx : 0);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {}; window.FDS.tabs = { init };
})();
