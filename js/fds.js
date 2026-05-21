/* ============================================================
   FORTICS DESIGN SYSTEM — ANIMATION LIBRARY
   Biblioteca de animações GSAP exposta como window.FDS

   Requer: gsap 3.x e ScrollTrigger (carregados via CDN no index.html)

   USO:
     FDS.animate.fadeIn('.hero-title')
     FDS.animate.slideIn('.card', { direction: 'up', delay: 0.2 })
     FDS.animate.stagger('.feature', { y: 40, stagger: 0.08 })
     FDS.animate.scrollReveal('.section', { y: 60 })
     FDS.animate.sparkPulse('#spark')
     FDS.animate.textReveal('.headline')
     FDS.animate.countUp('.metric', { to: 1247, duration: 2 })
     FDS.hover.lift('.card-interactive')
   ============================================================ */

(function (global) {
  'use strict';

  if (!global.gsap) {
    console.warn('[FDS] GSAP não está carregado. Importe gsap.min.js antes deste arquivo.');
    return;
  }
  const gsap = global.gsap;
  const ScrollTrigger = global.ScrollTrigger;
  if (ScrollTrigger && gsap.registerPlugin) gsap.registerPlugin(ScrollTrigger);

  /* -------------------------------------------------------- */
  /* DURATIONS & EASES (espelham os tokens CSS)               */
  /* -------------------------------------------------------- */
  const D = { instant: 0.1, fast: 0.2, base: 0.32, slow: 0.48, slower: 0.72, hero: 1.2 };
  const E = {
    out:    'expo.out',
    inOut:  'power3.inOut',
    spring: 'back.out(1.7)',
    soft:   'power2.out',
    bounce: 'elastic.out(1, 0.5)'
  };

  /* -------------------------------------------------------- */
  /* HELPERS                                                  */
  /* -------------------------------------------------------- */
  function toEls(target) {
    if (typeof target === 'string') return gsap.utils.toArray(target);
    if (target instanceof Element) return [target];
    if (target instanceof NodeList || Array.isArray(target)) return Array.from(target);
    return [];
  }

  function defaults(opts, fallback) { return Object.assign({}, fallback, opts || {}); }

  /* -------------------------------------------------------- */
  /* ANIMATE — entradas / saídas                              */
  /* -------------------------------------------------------- */
  const animate = {

    /** Fade in suave. */
    fadeIn(target, opts) {
      const o = defaults(opts, { duration: D.base, delay: 0, y: 0, ease: E.out });
      return gsap.fromTo(target,
        { autoAlpha: 0, y: o.y },
        { autoAlpha: 1, y: 0, duration: o.duration, delay: o.delay, ease: o.ease, overwrite: 'auto' }
      );
    },

    fadeOut(target, opts) {
      const o = defaults(opts, { duration: D.fast, ease: E.soft });
      return gsap.to(target, { autoAlpha: 0, duration: o.duration, ease: o.ease });
    },

    /** Slide a partir de uma direção: 'up' | 'down' | 'left' | 'right'. */
    slideIn(target, opts) {
      const o = defaults(opts, { direction: 'up', distance: 48, duration: D.slow, delay: 0, ease: E.out });
      const from = { autoAlpha: 0 };
      if (o.direction === 'up')    from.y =  o.distance;
      if (o.direction === 'down')  from.y = -o.distance;
      if (o.direction === 'left')  from.x =  o.distance;
      if (o.direction === 'right') from.x = -o.distance;
      return gsap.fromTo(target, from,
        { autoAlpha: 1, x: 0, y: 0, duration: o.duration, delay: o.delay, ease: o.ease, overwrite: 'auto' }
      );
    },

    /** Scale-in com leve overshoot (efeito "pop"). */
    scaleIn(target, opts) {
      const o = defaults(opts, { from: 0.85, duration: D.slow, delay: 0, ease: E.spring });
      return gsap.fromTo(target,
        { autoAlpha: 0, scale: o.from },
        { autoAlpha: 1, scale: 1, duration: o.duration, delay: o.delay, ease: o.ease, overwrite: 'auto' }
      );
    },

    /** Blur reveal — fade + desfoque. */
    blurIn(target, opts) {
      const o = defaults(opts, { duration: D.slow, delay: 0, blur: 16, ease: E.out });
      return gsap.fromTo(target,
        { autoAlpha: 0, filter: `blur(${o.blur}px)` },
        { autoAlpha: 1, filter: 'blur(0px)', duration: o.duration, delay: o.delay, ease: o.ease, overwrite: 'auto' }
      );
    },

    /** Stagger genérico em coleção. */
    stagger(target, opts) {
      const o = defaults(opts, { y: 32, x: 0, duration: D.slow, stagger: 0.08, delay: 0, ease: E.out });
      return gsap.fromTo(target,
        { autoAlpha: 0, y: o.y, x: o.x },
        { autoAlpha: 1, y: 0, x: 0, duration: o.duration, delay: o.delay, stagger: o.stagger, ease: o.ease, overwrite: 'auto' }
      );
    },

    /** Reveal acionado por scroll. */
    scrollReveal(target, opts) {
      if (!ScrollTrigger) { return animate.slideIn(target, opts); }
      const o = defaults(opts, { y: 60, duration: D.slow, stagger: 0.08, ease: E.out, start: 'top 85%' });
      return toEls(target).map(el => gsap.fromTo(el,
        { autoAlpha: 0, y: o.y },
        {
          autoAlpha: 1, y: 0, duration: o.duration, ease: o.ease, stagger: o.stagger,
          scrollTrigger: { trigger: el, start: o.start, toggleActions: 'play none none reverse' }
        }
      ));
    },

    /** Revela texto palavra por palavra (envolve cada palavra em <span>). */
    textReveal(target, opts) {
      const o = defaults(opts, { duration: D.slow, stagger: 0.04, y: '100%', ease: E.out });
      const els = toEls(target);
      const tweens = [];
      els.forEach(el => {
        if (!el.dataset.fdsTextReady) {
          const words = el.textContent.split(/\s+/);
          el.innerHTML = words.map(w =>
            `<span class="fds-word" style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span style="display:inline-block;">${w}</span></span>`
          ).join(' ');
          el.dataset.fdsTextReady = '1';
        }
        const inner = el.querySelectorAll('.fds-word > span');
        tweens.push(gsap.fromTo(inner,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: o.duration, ease: o.ease, stagger: o.stagger, overwrite: 'auto' }
        ));
      });
      return tweens;
    },

    /** Anima um número de `from` até `to`. */
    countUp(target, opts) {
      const o = defaults(opts, { from: 0, to: 100, duration: 1.8, ease: E.out, format: (v) => Math.round(v).toLocaleString('pt-BR'), suffix: '' });
      return toEls(target).map(el => {
        const obj = { v: o.from };
        return gsap.to(obj, {
          v: o.to, duration: o.duration, ease: o.ease,
          onUpdate: () => { el.textContent = o.format(obj.v) + o.suffix; }
        });
      });
    },

    /** Typewriter — escreve o texto caractere por caractere. */
    typewriter(target, opts) {
      const o = defaults(opts, { text: '', speed: 0.035, ease: 'none' });
      return toEls(target).map(el => {
        const text = o.text || el.dataset.text || el.textContent;
        el.textContent = '';
        const obj = { i: 0 };
        return gsap.to(obj, {
          i: text.length, duration: text.length * o.speed, ease: o.ease,
          onUpdate: () => { el.textContent = text.slice(0, Math.round(obj.i)); }
        });
      });
    },

    /* ---------- ANIMAÇÕES DE MARCA ---------- */

    /** Pulsa o Spark — efeito de respiração com glow. */
    sparkPulse(target, opts) {
      const o = defaults(opts, { scale: 1.08, duration: 1.6, ease: 'sine.inOut' });
      return gsap.to(target, {
        scale: o.scale, duration: o.duration, ease: o.ease, yoyo: true, repeat: -1,
        transformOrigin: '50% 50%'
      });
    },

    /** Rotação infinita do Spark. */
    sparkSpin(target, opts) {
      const o = defaults(opts, { duration: 12, direction: 1 });
      return gsap.to(target, { rotation: 360 * o.direction, duration: o.duration, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    },

    /** Float — flutuação contínua (cards, mockups, ícones). */
    float(target, opts) {
      const o = defaults(opts, { y: 12, duration: 3, ease: 'sine.inOut' });
      return gsap.to(target, { y: -o.y, duration: o.duration, ease: o.ease, yoyo: true, repeat: -1 });
    },

    /** Gradiente animado — usa background-position. */
    gradientShift(target, opts) {
      const o = defaults(opts, { duration: 6, ease: 'sine.inOut' });
      return gsap.to(target, {
        backgroundPosition: '200% 50%', duration: o.duration, ease: o.ease,
        yoyo: true, repeat: -1
      });
    },

    /** Magnetic effect — o elemento "atrai" o cursor. */
    magnetic(target, opts) {
      const o = defaults(opts, { strength: 0.25, ease: E.out });
      toEls(target).forEach(el => {
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * o.strength;
          const y = (e.clientY - r.top - r.height / 2) * o.strength;
          gsap.to(el, { x, y, duration: D.base, ease: o.ease });
        };
        const reset = () => gsap.to(el, { x: 0, y: 0, duration: D.slow, ease: E.spring });
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', reset);
      });
    },

    /** Entrada de página — sequência heroica. */
    pageEnter(opts) {
      const o = defaults(opts, { selector: '[data-page-enter]' });
      const els = toEls(o.selector);
      return gsap.fromTo(els,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: D.slow, ease: E.out, stagger: 0.08 }
      );
    },

    /** Parallax leve no scroll. */
    parallax(target, opts) {
      if (!ScrollTrigger) return;
      const o = defaults(opts, { y: 80, ease: 'none' });
      return toEls(target).map(el => gsap.to(el, {
        y: o.y, ease: o.ease,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      }));
    }
  };

  /* -------------------------------------------------------- */
  /* HOVER — efeitos imperativos                              */
  /* -------------------------------------------------------- */
  const hover = {
    lift(target, opts) {
      const o = defaults(opts, { y: -4, scale: 1, duration: D.fast, ease: E.out });
      toEls(target).forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(el, { y: o.y, scale: o.scale, duration: o.duration, ease: o.ease }));
        el.addEventListener('mouseleave', () => gsap.to(el, { y: 0, scale: 1, duration: o.duration, ease: o.ease }));
      });
    },
    glow(target, opts) {
      const o = defaults(opts, { color: '0, 102, 255', intensity: 0.45, duration: D.base });
      toEls(target).forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(el, { boxShadow: `0 0 40px rgba(${o.color}, ${o.intensity})`, duration: o.duration }));
        el.addEventListener('mouseleave', () => gsap.to(el, { boxShadow: '0 0 0 rgba(0,0,0,0)', duration: o.duration }));
      });
    },
    tilt(target, opts) {
      const o = defaults(opts, { max: 8, duration: D.fast });
      toEls(target).forEach(el => {
        el.style.transformStyle = 'preserve-3d';
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(el, { rotateY: px * o.max * 2, rotateX: -py * o.max * 2, duration: o.duration, ease: E.out, transformPerspective: 1000 });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: D.slow, ease: E.spring }));
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
      if (el.dataset.fdsDelay)    opts.delay    = parseFloat(el.dataset.fdsDelay);
      if (el.dataset.fdsDuration) opts.duration = parseFloat(el.dataset.fdsDuration);
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
  global.FDS = { animate, hover, autoInit, D, E };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})(window);
