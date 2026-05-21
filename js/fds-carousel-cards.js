/* ============================================================
   FORTICS DS — CAROUSEL CARDS (scroll-snap variant)
   <div class="fds-carousel-cards" data-fds-carousel-cards>
     <div class="fds-carousel-cards__viewport">
       <div class="fds-carousel-cards__card">...</div>
       ...
     </div>
     <div class="fds-carousel-cards__nav">
       <div class="fds-carousel-cards__progress"><div class="fds-carousel-cards__progress-bar"></div></div>
       <div class="fds-carousel-cards__nav-spacer"></div>
       <button class="fds-carousel-cards__nav-btn" data-cc-prev>◀</button>
       <button class="fds-carousel-cards__nav-btn" data-cc-next>▶</button>
     </div>
   </div>
   ============================================================ */
(function () {
  'use strict';
  function init() {
    document.querySelectorAll('[data-fds-carousel-cards]').forEach(root => {
      if (root.dataset.fdsInit === '1') return;
      root.dataset.fdsInit = '1';

      const vp = root.querySelector('.fds-carousel-cards__viewport');
      const cards = root.querySelectorAll('.fds-carousel-cards__card');
      const prev = root.querySelector('[data-cc-prev]');
      const next = root.querySelector('[data-cc-next]');
      const bar  = root.querySelector('.fds-carousel-cards__progress-bar');
      if (!vp || !cards.length) return;

      function step() {
        if (!cards[0]) return 0;
        const a = cards[0].getBoundingClientRect().right;
        const b = cards[1]?.getBoundingClientRect().left ?? a;
        return (cards[1]?.getBoundingClientRect().left ?? cards[0].getBoundingClientRect().right) - cards[0].getBoundingClientRect().left;
      }

      function update() {
        if (!bar) return;
        const max = vp.scrollWidth - vp.clientWidth;
        const pct = max <= 0 ? 100 : (vp.scrollLeft / max) * 100;
        bar.style.width = Math.min(100, Math.max(8, pct + 12)) + '%';
      }

      prev?.addEventListener('click', () => vp.scrollBy({ left: -step(), behavior: 'smooth' }));
      next?.addEventListener('click', () => vp.scrollBy({ left:  step(), behavior: 'smooth' }));
      vp.addEventListener('scroll', update, { passive: true });
      update();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {};
  window.FDS.carouselCards = { init };
})();
