/* ============================================================
   FORTICS DS — BRAND ANIMATIONS
   Anima o logo SVG (paths em "drawing") + spark independente.
   Requer: GSAP 3.x.

   USO declarativo:
     <div data-fds-brand-draw> ... SVG inline ... </div>
     <svg data-fds-spark-spin> ... </svg>
     <svg data-fds-spark-pulse> ... </svg>

   API:
     FDS.brand.draw(target, { duration, stagger })
     FDS.brand.spin(target, { duration, direction })
     FDS.brand.pulse(target, { scale, duration })
   ============================================================ */
(function(){
  if (!window.gsap) { return; }
  const gsap = window.gsap;

  function draw(target, opts) {
    const o = Object.assign({ duration: 1.2, stagger: 0.06, ease: 'power2.out' }, opts || {});
    const svgs = (typeof target === 'string') ? document.querySelectorAll(target) : (target.length ? target : [target]);
    svgs.forEach(svg => {
      const paths = svg.querySelectorAll('path');
      paths.forEach(p => {
        try {
          const len = p.getTotalLength();
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
          p.setAttribute('data-orig-fill', p.getAttribute('fill') || '');
          p.style.fill = 'transparent';
          p.style.stroke = p.getAttribute('data-orig-fill') || p.getAttribute('fill') || 'currentColor';
          p.style.strokeWidth = '1.5';
        } catch (e) {}
      });
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: o.duration,
        ease: o.ease,
        stagger: o.stagger,
        onComplete: () => {
          gsap.to(paths, {
            fill: (i, t) => t.getAttribute('data-orig-fill') || 'currentColor',
            duration: 0.4, stagger: o.stagger / 2,
            onComplete: () => paths.forEach(p => { p.style.stroke = 'transparent'; p.style.strokeDasharray = ''; })
          });
        }
      });
    });
  }

  function spin(target, opts) {
    const o = Object.assign({ duration: 12, direction: 1 }, opts || {});
    return gsap.to(target, {
      rotation: 360 * o.direction, duration: o.duration, ease: 'none', repeat: -1,
      transformOrigin: '50% 50%'
    });
  }

  function pulse(target, opts) {
    const o = Object.assign({ scale: 1.06, duration: 1.6, ease: 'sine.inOut' }, opts || {});
    return gsap.to(target, {
      scale: o.scale, duration: o.duration, ease: o.ease,
      yoyo: true, repeat: -1, transformOrigin: '50% 50%'
    });
  }

  function autoInit() {
    document.querySelectorAll('[data-fds-brand-draw]').forEach(el => draw(el.querySelector('svg') || el));
    document.querySelectorAll('[data-fds-spark-spin]').forEach(el => spin(el));
    document.querySelectorAll('[data-fds-spark-pulse]').forEach(el => pulse(el));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  window.FDS = window.FDS || {};
  window.FDS.brand = { draw, spin, pulse };
})();
