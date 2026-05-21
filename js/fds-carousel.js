/* ============================================================
   FORTICS DS — CAROUSEL
   <div class="fds-carousel" data-fds-carousel[="autoplay:4000"]>
     <div class="fds-carousel__track">
       <div class="fds-carousel__slide">...</div>
       ...
     </div>
     <button class="fds-carousel__prev">...</button>
     <button class="fds-carousel__next">...</button>
     <div class="fds-carousel__bullets"></div>
   </div>

   Features:
   - Setas laterais + bullets de paginação
   - Autoplay opcional (pausa no hover)
   - Suporte a touch swipe + teclado
   - Snap suave
   ============================================================ */
(function(){
  function init() {
    document.querySelectorAll('[data-fds-carousel]').forEach(setup);
  }
  function setup(root) {
    if (root.dataset.fdsInit === '1') return;
    root.dataset.fdsInit = '1';
    const track  = root.querySelector('.fds-carousel__track');
    const slides = root.querySelectorAll('.fds-carousel__slide');
    const prev   = root.querySelector('.fds-carousel__prev');
    const next   = root.querySelector('.fds-carousel__next');
    const bulletWrap = root.querySelector('.fds-carousel__bullets');
    if (!track || !slides.length) return;

    let current = 0;
    let timer = null;
    const cfg = (root.getAttribute('data-fds-carousel') || '').split(';').reduce((o, kv) => {
      const [k,v] = kv.split(':').map(s => s.trim());
      if (k) o[k] = v ?? true;
      return o;
    }, {});
    const autoplayMs = cfg.autoplay ? parseInt(cfg.autoplay, 10) || 5000 : 0;

    // gera bullets
    if (bulletWrap) {
      bulletWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'fds-carousel__bullet';
        b.setAttribute('aria-label', `Ir para slide ${i+1}`);
        b.addEventListener('click', () => go(i));
        bulletWrap.appendChild(b);
      });
    }

    function go(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      bulletWrap?.querySelectorAll('.fds-carousel__bullet').forEach((b, idx) => {
        b.classList.toggle('is-active', idx === current);
      });
    }

    prev?.addEventListener('click', () => { go(current - 1); restart(); });
    next?.addEventListener('click', () => { go(current + 1); restart(); });

    // teclado
    root.tabIndex = 0;
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { go(current - 1); restart(); }
      if (e.key === 'ArrowRight') { go(current + 1); restart(); }
    });

    // swipe touch
    let startX = 0, deltaX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; deltaX = 0; }, { passive: true });
    track.addEventListener('touchmove',  (e) => { deltaX = e.touches[0].clientX - startX; }, { passive: true });
    track.addEventListener('touchend',   () => {
      if (Math.abs(deltaX) > 50) { go(current + (deltaX < 0 ? 1 : -1)); restart(); }
    });

    // autoplay
    function start() { if (autoplayMs) timer = setInterval(() => go(current + 1), autoplayMs); }
    function stop()  { if (timer) { clearInterval(timer); timer = null; } }
    function restart(){ stop(); start(); }
    if (autoplayMs) {
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      start();
    }

    go(0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.FDS = window.FDS || {}; window.FDS.carousel = { init };
})();
