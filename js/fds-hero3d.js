/* ============================================================
   FORTICS DS — HERO 3D
   Camadas com data-depth se movem com o cursor, criando
   parallax 3D inspirado em lessestudio.com.

   <div class="fds-hero3d" data-fds-hero3d>
     <div class="fds-hero3d__layer" data-depth="0.2">...</div>
     <div class="fds-hero3d__layer" data-depth="0.4">...</div>
   </div>
   ============================================================ */
(function(){
  function init() {
    document.querySelectorAll('[data-fds-hero3d]').forEach(root => {
      if (root.dataset.fdsInit === '1') return;
      root.dataset.fdsInit = '1';
      const layers = root.querySelectorAll('.fds-hero3d__layer');
      if (!layers.length) return;

      let rect = root.getBoundingClientRect();
      let mouseX = 0.5, mouseY = 0.5;
      let curX = 0.5, curY = 0.5;
      let raf = null;

      function update() {
        // ease toward target
        curX += (mouseX - curX) * 0.08;
        curY += (mouseY - curY) * 0.08;
        const offX = (curX - 0.5) * 2;
        const offY = (curY - 0.5) * 2;
        layers.forEach(layer => {
          const depth = parseFloat(layer.dataset.depth || 0.2);
          const tz    = parseFloat(layer.dataset.tz || 0);
          const dx = offX * depth * -40;
          const dy = offY * depth * -40;
          const rx = offY * depth * -3;
          const ry = offX * depth * 3;
          layer.style.transform =
            `translate3d(${dx}px, ${dy}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        if (Math.abs(mouseX - curX) > 0.001 || Math.abs(mouseY - curY) > 0.001) {
          raf = requestAnimationFrame(update);
        } else {
          raf = null;
        }
      }
      function loop() { if (!raf) raf = requestAnimationFrame(update); }

      root.addEventListener('mousemove', (e) => {
        rect = root.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
        loop();
      });
      root.addEventListener('mouseleave', () => {
        mouseX = 0.5; mouseY = 0.5; loop();
      });
      // touch
      root.addEventListener('touchmove', (e) => {
        rect = root.getBoundingClientRect();
        mouseX = (e.touches[0].clientX - rect.left) / rect.width;
        mouseY = (e.touches[0].clientY - rect.top) / rect.height;
        loop();
      }, { passive: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {}; window.FDS.hero3d = { init };
})();
