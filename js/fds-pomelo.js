/* ============================================================
   FORTICS DS — POMELO INTERACTIVE LIST
   Lista de "Your card, your way" estilo Pomelo:
   - Cada item é uma linha clicável
   - Ao ativar, expande um painel rico do lado direito
   - Hover no item destaca; ativo permanece destacado
   - Animação suave de cross-fade entre painéis

   <div class="fds-pomelo" data-fds-pomelo>
     <div class="fds-pomelo__list">
       <button class="fds-pomelo__item" data-target="p1" aria-controls="p1">
         <span class="fds-pomelo__num">01</span>
         <span class="fds-pomelo__lbl">Mensageria</span>
       </button>
       ...
     </div>
     <div class="fds-pomelo__stage">
       <div class="fds-pomelo__panel" id="p1">...painel rico...</div>
       ...
     </div>
   </div>
   ============================================================ */
(function(){
  function init() {
    document.querySelectorAll('[data-fds-pomelo]').forEach(root => {
      if (root.dataset.fdsInit === '1') return;
      root.dataset.fdsInit = '1';

      const items  = root.querySelectorAll('.fds-pomelo__item');
      const panels = root.querySelectorAll('.fds-pomelo__panel');

      function activate(idx) {
        items.forEach((it, i) => it.classList.toggle('is-active', i === idx));
        panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
      }

      items.forEach((it, i) => {
        it.addEventListener('click', () => activate(i));
        it.addEventListener('mouseenter', () => activate(i));
      });
      activate(0);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {}; window.FDS.pomelo = { init };
})();
