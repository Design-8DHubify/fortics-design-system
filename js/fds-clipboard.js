/* ============================================================
   FORTICS DS — CLIPBOARD
   Click-to-copy declarativo via [data-copy].

   USOS:
     <button data-copy="#0066FF">Núcleo Azul</button>           ← copia o valor literal
     <button data-copy data-copy-from="#meu-codigo">Copiar</button>  ← copia textContent do alvo
     <pre data-copy>texto-livre</pre>                            ← copia o próprio textContent

   API programática:
     FDS.clipboard.copy(text, { silent: false, label: 'HEX' })
   ============================================================ */

(function (global) {
  'use strict';

  async function copy(text, opts) {
    const o = Object.assign({ silent: false, label: '' }, opts || {});
    try {
      await navigator.clipboard.writeText(text);
      if (!o.silent && global.FDS?.toast) {
        global.FDS.toast.success(
          o.label ? `${o.label} copiado` : 'Copiado',
          text.length > 60 ? text.slice(0, 60) + '…' : text
        );
      }
      return true;
    } catch (err) {
      // Fallback antigo (não-https): textarea + execCommand
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (!o.silent && global.FDS?.toast) {
          ok
            ? global.FDS.toast.success(o.label ? `${o.label} copiado` : 'Copiado')
            : global.FDS.toast.error('Falha ao copiar');
        }
        return ok;
      } catch (e) {
        if (!o.silent && global.FDS?.toast) global.FDS.toast.error('Falha ao copiar', String(e));
        return false;
      }
    }
  }

  function getTextToCopy(el) {
    // valor explícito no atributo
    const direct = el.getAttribute('data-copy');
    if (direct && direct.length > 0) return direct;
    // alvo via seletor
    const fromSel = el.getAttribute('data-copy-from');
    if (fromSel) {
      const target = document.querySelector(fromSel);
      if (target) return target.textContent || '';
    }
    // fallback: o próprio elemento
    return el.textContent || '';
  }

  function init() {
    document.addEventListener('click', (e) => {
      const trg = e.target.closest('[data-copy], [data-copy-from]');
      if (!trg) return;
      e.preventDefault();
      const text = getTextToCopy(trg).trim();
      if (!text) return;
      const label = trg.getAttribute('data-copy-label') || '';
      copy(text, { label });

      // micro-feedback visual: classe is-copied por 1.2s
      trg.classList.add('is-copied');
      const old = trg.querySelector('[data-copy-label-el]')?.textContent;
      setTimeout(() => {
        trg.classList.remove('is-copied');
        if (old) trg.querySelector('[data-copy-label-el]').textContent = old;
      }, 1200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.FDS = global.FDS || {};
  global.FDS.clipboard = { copy };
})(window);
