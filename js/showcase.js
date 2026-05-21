/* ============================================================
   FORTICS DS — SHOWCASE INTERACTIONS
   Liga os botões "Play" às funções da biblioteca FDS,
   ativa scroll-reveal das seções e métricas do hero.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- HERO ENTRADA ---------- */
  FDS.animate.textReveal('#hero-title', { stagger: 0.06, duration: 0.9 });
  FDS.animate.pageEnter();
  FDS.animate.sparkPulse('#hero-spark', { scale: 1.05, duration: 4 });

  /* ---------- MÉTRICAS DO HERO ---------- */
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const to = parseFloat(el.dataset.countTo);
    FDS.animate.countUp(el, { from: 0, to, duration: 2 });
  });

  /* ---------- SCROLL REVEAL DAS SEÇÕES ---------- */
  document.querySelectorAll('.section__head').forEach(el => {
    FDS.animate.scrollReveal(el.children, { y: 32, stagger: 0.08 });
  });
  document.querySelectorAll('[data-reveal]').forEach(grid => {
    FDS.animate.scrollReveal(grid.children, { y: 40, stagger: 0.05 });
  });

  /* ---------- HOVER LIFT NOS CARDS INTERATIVOS ---------- */
  FDS.hover.lift('.fds-card--interactive', { y: -6 });
  FDS.hover.tilt('[data-tilt]', { max: 6 });
  FDS.hover.lift('.asset-tile', { y: -3, duration: 0.18 });

  /* ---------- DEMO PLAYERS ---------- */
  const players = {
    fadeIn:        (t) => FDS.animate.fadeIn(t, { duration: 0.6 }),
    slideIn:       (t) => FDS.animate.slideIn(t, { direction: 'up', distance: 60, duration: 0.7 }),
    scaleIn:       (t) => FDS.animate.scaleIn(t),
    blurIn:        (t) => FDS.animate.blurIn(t),
    stagger:       (t) => FDS.animate.stagger(t.children, { y: 40, stagger: 0.08 }),
    textReveal:    (t) => { t.dataset.fdsTextReady = ''; FDS.animate.textReveal(t); },
    countUp:       (t) => FDS.animate.countUp(t, { from: 0, to: 12428, duration: 2.2 }),
    sparkPulse:    (t) => { gsap.killTweensOf(t); FDS.animate.sparkPulse(t); },
    sparkSpin:     (t) => { gsap.killTweensOf(t); FDS.animate.sparkSpin(t); },
    float:         (t) => { gsap.killTweensOf(t); FDS.animate.float(t); },
    gradientShift: (t) => { gsap.killTweensOf(t); FDS.animate.gradientShift(t); },
    magnetic:      (t) => { FDS.animate.magnetic(t); flashMsg(t, 'pronto — mova o mouse'); },
    typewriter:    (t) => FDS.animate.typewriter(t),
    hoverLift:     (t) => { FDS.hover.lift(t); flashMsg(t, 'pronto — hover'); },
    hoverTilt:     (t) => { FDS.hover.tilt(t, { max: 10 }); flashMsg(t, 'pronto — hover'); }
  };

  function flashMsg(el, msg) {
    const stage = el.closest('.demo__stage');
    if (!stage) return;
    let f = stage.querySelector('.flash-msg');
    if (!f) {
      f = document.createElement('div');
      f.className = 'flash-msg';
      f.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-family:var(--fds-font-mono);font-size:var(--fds-text-caption);color:var(--fds-color-esmeralda);opacity:0';
      stage.style.position = 'relative';
      stage.appendChild(f);
    }
    f.textContent = msg;
    gsap.fromTo(f, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 });
    gsap.to(f, { opacity: 0, duration: 0.5, delay: 1.8 });
  }

  document.querySelectorAll('[data-play]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.play;
      const card = btn.closest('.demo');
      const target = card.querySelector('[data-anim]');
      if (target && players[key]) players[key](target);
    });
  });

  /* ---------- SIDEBAR ACTIVE STATE ---------- */
  const links = document.querySelectorAll('.sidebar .fds-nav-link');
  const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href')));

  function updateActive() {
    const y = window.scrollY + 120;
    let activeIdx = 0;
    sections.forEach((sec, i) => { if (sec && sec.offsetTop <= y) activeIdx = i; });
    links.forEach((l, i) => l.classList.toggle('fds-nav-link--active', i === activeIdx));
  }
  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
