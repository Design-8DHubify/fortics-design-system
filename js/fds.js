/* ============================================================
   FORTICS DESIGN SYSTEM — ANIMATION LIBRARY v2 (Motion One)
   Migrado de GSAP → Motion One (Web Animations API nativa).
   Sem conflitos com Oxygen Builder / WordPress.

   CDN: https://cdn.jsdelivr.net/npm/motion@11/dist/motion.js
   Expõe: window.Motion → { animate, scroll, inView, stagger, spring }

   API pública idêntica à versão anterior:
     FDS.animate.fadeIn('.hero-title')
     FDS.animate.slideIn('.card', { direction: 'up', delay: 0.2 })
     FDS.animate.stagger('.feature', { y: 40, stagger: 0.08 })
     FDS.animate.scrollReveal('.section', { y: 60 })
     FDS.hover.lift('.card-interactive')
   ============================================================ */

(function (global) {
  'use strict';

  const M = global.Motion;
  if (!M) {
    console.warn('[FDS] Motion One não carregado. Adicione motion.js antes de fds.js.');
    return;
  }

  const { animate: mot, scroll: motScroll, inView, stagger: motStagger } = M;

  /* -------------------------------------------------------- */
  /* DURATIONS & EASES (espelham os tokens CSS)               */
  /* -------------------------------------------------------- */
  const D = { instant: 0.1, fast: 0.2, base: 0.32, slow: 0.48, slower: 0.72, hero: 1.2 };
  const E = {
    out:    [0.16, 1, 0.3, 1],           // expo.out
    inOut:  [0.65, 0, 0.35, 1],          // power3.inOut
    spring: [0.34, 1.56, 0.64, 1],       // back.out(1.7) — overshoot suave
    soft:   'ease-out',
    bounce: [0.175, 0.885, 0.32, 1.275]  // elastic — overshoot pronunciado
  };

  /* -------------------------------------------------------- */
  /* HELPERS                                                  */
  /* -------------------------------------------------------- */
  function toEls(target) {
    if (typeof target === 'string')  return Array.from(document.querySelectorAll(target));
    if (target instanceof Element)   return [target];
    if (target instanceof NodeList || Array.isArray(target)) return Array.from(target);
    return [];
  }

  function defaults(opts, fb) { return Object.assign({}, fb, opts || {}); }

  /* -------------------------------------------------------- */
  /* ANIMATE — entradas / saídas / loops                      */
  /* -------------------------------------------------------- */
  const animate = {

    fadeIn(target, opts) {
      const o = defaults(opts, { duration: D.base, delay: 0, y: 0, easing: E.out });
      const els = toEls(target);
      els.forEach(el => { el.style.opacity = '0'; });
      const kf = { opacity: [0, 1] };
      if (o.y) kf.y = [o.y, 0];
      return mot(els, kf, { duration: o.duration, delay: o.delay, easing: o.easing });
    },

    fadeOut(target, opts) {
      const o = defaults(opts, { duration: D.fast, easing: E.soft });
      return mot(toEls(target), { opacity: [1, 0] }, { duration: o.duration, easing: o.easing });
    },

    slideIn(target, opts) {
      const o = defaults(opts, { direction: 'up', distance: 48, duration: D.slow, delay: 0, easing: E.out });
      const els = toEls(target);
      els.forEach(el => { el.style.opacity = '0'; });
      const kf = { opacity: [0, 1] };
      if (o.direction === 'up')    kf.y = [ o.distance, 0];
      if (o.direction === 'down')  kf.y = [-o.distance, 0];
      if (o.direction === 'left')  kf.x = [ o.distance, 0];
      if (o.direction === 'right') kf.x = [-o.distance, 0];
      return mot(els, kf, { duration: o.duration, delay: o.delay, easing: o.easing });
    },

    scaleIn(target, opts) {
      const o = defaults(opts, { from: 0.85, duration: D.slow, delay: 0, easing: E.spring });
      const els = toEls(target);
      els.forEach(el => { el.style.opacity = '0'; });
      return mot(els,
        { opacity: [0, 1], scale: [o.from, 1] },
        { duration: o.duration, delay: o.delay, easing: o.easing }
      );
    },

    blurIn(target, opts) {
      const o = defaults(opts, { duration: D.slow, delay: 0, blur: 16, easing: E.out });
      const els = toEls(target);
      els.forEach(el => { el.style.opacity = '0'; });
      return mot(els,
        { opacity: [0, 1], filter: [`blur(${o.blur}px)`, 'blur(0px)'] },
        { duration: o.duration, delay: o.delay, easing: o.easing }
      );
    },

    stagger(target, opts) {
      const o = defaults(opts, { y: 32, x: 0, duration: D.slow, stagger: 0.08, delay: 0, easing: E.out });
      const els = toEls(target);
      els.forEach(el => { el.style.opacity = '0'; });
      const kf = { opacity: [0, 1] };
      if (o.y) kf.y = [o.y, 0];
      if (o.x) kf.x = [o.x, 0];
      return mot(els, kf, {
        duration: o.duration,
        delay: motStagger(o.stagger, { start: o.delay }),
        easing: o.easing
      });
    },

    scrollReveal(target, opts) {
      const o = defaults(opts, { y: 60, duration: D.slow, stagger: 0.08, easing: E.out });
      toEls(target).forEach(el => {
        el.style.opacity = '0';
        const stop = inView(el, () => {
          mot(el, { opacity: [0, 1], y: [o.y, 0] }, { duration: o.duration, easing: o.easing });
          stop();
        }, { margin: '-10% 0px' });
      });
    },

    textReveal(target, opts) {
      const o = defaults(opts, { duration: D.slow, stagger: 0.04, easing: E.out });
      toEls(target).forEach(el => {
        if (!el.dataset.fdsTextReady) {
          const words = el.textContent.split(/\s+/);
          el.innerHTML = words.map(w =>
            `<span class="fds-word" style="display:inline-block;overflow:hidden;vertical-align:bottom;">` +
            `<span style="display:inline-block;">${w}</span></span>`
          ).join(' ');
          el.dataset.fdsTextReady = '1';
        }
        const inner = Array.from(el.querySelectorAll('.fds-word > span'));
        mot(inner,
          { opacity: [0, 1], transform: ['translateY(110%)', 'translateY(0%)'] },
          { duration: o.duration, easing: o.easing, delay: motStagger(o.stagger) }
        );
      });
    },

    countUp(target, opts) {
      const o = defaults(opts, {
        from: 0, to: 100, duration: 1800,
        format: (v) => Math.round(v).toLocaleString('pt-BR'), suffix: ''
      });
      toEls(target).forEach(el => {
        const start = performance.now();
        const range = o.to - o.from;
        function tick(now) {
          const t      = Math.min((now - start) / o.duration, 1);
          const eased  = 1 - Math.pow(1 - t, 3); // ease-out cubic
          el.textContent = o.format(o.from + range * eased) + o.suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },

    typewriter(target, opts) {
      const o = defaults(opts, { text: '', speed: 35 });
      toEls(target).forEach(el => {
        const text = o.text || el.dataset.text || el.textContent;
        el.textContent = '';
        let i = 0;
        const id = setInterval(() => {
          el.textContent = text.slice(0, ++i);
          if (i >= text.length) clearInterval(id);
        }, o.speed);
      });
    },

    sparkPulse(target, opts) {
      const o = defaults(opts, { scale: 1.08, duration: 1.6 });
      return mot(toEls(target),
        { scale: [1, o.scale] },
        { duration: o.duration, easing: 'ease-in-out', repeat: Infinity, direction: 'alternate' }
      );
    },

    sparkSpin(target, opts) {
      const o = defaults(opts, { duration: 12, direction: 1 });
      return mot(toEls(target),
        { rotate: [0, 360 * o.direction] },
        { duration: o.duration, easing: 'linear', repeat: Infinity }
      );
    },

    float(target, opts) {
      const o = defaults(opts, { y: 12, duration: 3 });
      return mot(toEls(target),
        { y: [0, -o.y] },
        { duration: o.duration, easing: 'ease-in-out', repeat: Infinity, direction: 'alternate' }
      );
    },

    gradientShift(target, opts) {
      const o = defaults(opts, { duration: 6 });
      return mot(toEls(target),
        { backgroundPosition: ['0% 50%', '200% 50%'] },
        { duration: o.duration, easing: 'ease-in-out', repeat: Infinity, direction: 'alternate' }
      );
    },

    magnetic(target, opts) {
      const o = defaults(opts, { strength: 0.25 });
      toEls(target).forEach(el => {
        const move = (e) => {
          const r  = el.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width  / 2) * o.strength;
          const dy = (e.clientY - r.top  - r.height / 2) * o.strength;
          mot(el, { x: dx, y: dy }, { duration: D.base, easing: E.out });
        };
        const reset = () => mot(el, { x: 0, y: 0 }, { duration: D.slow, easing: E.spring });
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', reset);
      });
    },

    pageEnter(opts) {
      const o = defaults(opts, { selector: '[data-page-enter]' });
      const els = toEls(o.selector);
      els.forEach(el => { el.style.opacity = '0'; });
      return mot(els,
        { opacity: [0, 1], y: [24, 0] },
        { duration: D.slow, easing: E.out, delay: motStagger(0.08) }
      );
    },

    parallax(target, opts) {
      const o = defaults(opts, { y: 80 });
      toEls(target).forEach(el => {
        motScroll(
          mot(el, { y: [0, o.y] }, { easing: 'linear' }),
          { target: el, offset: ['start end', 'end start'] }
        );
      });
    }
  };

  /* -------------------------------------------------------- */
  /* HOVER — efeitos imperativos                              */
  /* -------------------------------------------------------- */
  const hover = {
    lift(target, opts) {
      const o = defaults(opts, { y: -4, scale: 1, duration: D.fast, easing: E.out });
      toEls(target).forEach(el => {
        el.addEventListener('mouseenter', () => mot(el, { y: o.y, scale: o.scale }, { duration: o.duration, easing: o.easing }));
        el.addEventListener('mouseleave', () => mot(el, { y: 0,   scale: 1       }, { duration: o.duration, easing: o.easing }));
      });
    },

    glow(target, opts) {
      const o = defaults(opts, { color: '0, 102, 255', intensity: 0.45, duration: D.base });
      toEls(target).forEach(el => {
        el.addEventListener('mouseenter', () => mot(el, { boxShadow: `0 0 40px rgba(${o.color}, ${o.intensity})` }, { duration: o.duration }));
        el.addEventListener('mouseleave', () => mot(el, { boxShadow: '0 0 0px rgba(0,0,0,0)'                    }, { duration: o.duration }));
      });
    },

    tilt(target, opts) {
      const o = defaults(opts, { max: 8, duration: D.fast });
      toEls(target).forEach(el => {
        el.style.transformStyle = 'preserve-3d';
        el.addEventListener('mousemove', (e) => {
          const r  = el.getBoundingClientRect();
          const rx = (e.clientX - r.left) / r.width  - 0.5;
          const ry = (e.clientY - r.top)  / r.height - 0.5;
          mot(el,
            { rotateY: rx * o.max * 2, rotateX: -ry * o.max * 2 },
            { duration: o.duration, easing: E.out }
          );
        });
        el.addEventListener('mouseleave', () =>
          mot(el, { rotateX: 0, rotateY: 0 }, { duration: D.slow, easing: E.spring })
        );
      });
    }
  };

  /* -------------------------------------------------------- */
  /* AUTO — aplica via data-attributes no DOM                  */
  /* -------------------------------------------------------- */
  function autoInit() {
    document.querySelectorAll('[data-fds-anim]').forEach(el => {
      const type = el.dataset.fdsAnim;
      const opts = {};
      if (el.dataset.fdsDelay)     opts.delay     = parseFloat(el.dataset.fdsDelay);
      if (el.dataset.fdsDuration)  opts.duration  = parseFloat(el.dataset.fdsDuration);
      if (el.dataset.fdsDirection) opts.direction = el.dataset.fdsDirection;
      if (el.dataset.fdsScroll === 'true') {
        animate.scrollReveal(el, opts);
      } else if (animate[type]) {
        animate[type](el, opts);
      }
    });
  }

  /* -------------------------------------------------------- */
  /* EXPORT                                                    */
  /* -------------------------------------------------------- */
  global.FDS = global.FDS
    ? Object.assign(global.FDS, { animate, hover, autoInit, D, E })
    : { animate, hover, autoInit, D, E };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})(window);
