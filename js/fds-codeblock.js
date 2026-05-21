/* ============================================================
   FORTICS DS — CODE BLOCK
   Inicializa <div class="fds-codeblock"> com:
   - Preview (mantém o markup original do componente)
   - Abas HTML / CSS / JS (qualquer combinação)
   - Botão Copy por aba

   MARKUP ESPERADO:
     <div class="fds-codeblock">
       <div class="fds-codeblock__preview"> ...componente... </div>
       <template data-code="html">  ...código HTML...  </template>
       <template data-code="css">   ...código CSS...   </template>
       <template data-code="js">    ...código JS...    </template>
     </div>

   O JS gera dinamicamente as tabs + paineis + botão copy.
   ============================================================ */

(function (global) {
  'use strict';

  const TAB_LABEL = { html: 'HTML', css: 'CSS', js: 'JS' };

  // tokenização leve apenas visual (não substitui Prism)
  function tokenize(code, lang) {
    if (!code) return '';
    let out = escapeHTML(code);
    if (lang === 'html') {
      out = out
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tk-com">$1</span>')
        .replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="tk-key">$2</span>')
        .replace(/([a-zA-Z-]+)=(&quot;[^&]*?&quot;)/g, '<span class="tk-fn">$1</span>=<span class="tk-str">$2</span>');
    } else if (lang === 'css') {
      out = out
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tk-com">$1</span>')
        .replace(/(--[a-z0-9-]+)/g, '<span class="tk-fn">$1</span>')
        .replace(/(:\s*)(#[0-9a-fA-F]{3,8}|\d+(\.\d+)?(px|rem|em|%|ms|s)?)/g, '$1<span class="tk-num">$2</span>');
    } else if (lang === 'js') {
      out = out
        .replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="tk-com">$1</span>')
        .replace(/('([^']|\\')*'|"([^"]|\\")*"|`([^`]|\\`)*`)/g, '<span class="tk-str">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|new|class|extends|import|export|from|async|await)\b/g, '<span class="tk-key">$1</span>')
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tk-num">$1</span>');
    }
    return out;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function dedent(s) {
    if (!s) return '';
    // remove leading/trailing blank lines
    s = s.replace(/^\s*\n/, '').replace(/\s+$/, '');
    const lines = s.split('\n');
    const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length));
    return lines.map(l => l.slice(indent)).join('\n');
  }

  function buildCodeblock(root) {
    if (root.dataset.fdsCodeblockInit === '1') return;
    root.dataset.fdsCodeblockInit = '1';

    // colhe templates — usa textContent para evitar duplo escape de entidades
    const sources = {};
    root.querySelectorAll('template[data-code]').forEach(t => {
      const lang = t.getAttribute('data-code');
      // textContent decodifica entidades (&lt; → <); tokenize aplica escape uma única vez
      sources[lang] = dedent(t.content ? (t.content.textContent || '') : t.textContent);
    });

    // se não há nenhuma source, infere HTML do preview
    if (Object.keys(sources).length === 0) {
      const preview = root.querySelector('.fds-codeblock__preview');
      if (preview) sources.html = dedent(preview.innerHTML);
    }

    const langs = ['html', 'css', 'js'].filter(l => sources[l] !== undefined);
    if (!langs.length) return;

    // monta tabs
    const tabs = document.createElement('div');
    tabs.className = 'fds-codeblock__tabs';
    tabs.setAttribute('role', 'tablist');

    const panels = document.createDocumentFragment();

    langs.forEach((lang, i) => {
      const id = `cb-${Math.random().toString(36).slice(2, 8)}-${lang}`;
      const tab = document.createElement('button');
      tab.className = 'fds-codeblock__tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', id);
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.textContent = TAB_LABEL[lang] || lang.toUpperCase();
      tabs.appendChild(tab);

      const panel = document.createElement('div');
      panel.className = 'fds-codeblock__panel';
      panel.id = id;
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = i !== 0;

      const copy = document.createElement('button');
      copy.className = 'fds-codeblock__copy';
      copy.type = 'button';
      copy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
      copy.dataset.copyLang = lang;
      copy.addEventListener('click', () => {
        global.FDS?.clipboard?.copy(sources[lang], { label: TAB_LABEL[lang] });
        copy.classList.add('is-copied');
        copy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copiado!`;
        setTimeout(() => {
          copy.classList.remove('is-copied');
          copy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
        }, 1600);
      });

      const pre = document.createElement('pre');
      pre.innerHTML = tokenize(sources[lang], lang);

      panel.appendChild(copy);
      panel.appendChild(pre);
      panels.appendChild(panel);

      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.fds-codeblock__tab').forEach(t => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');
        root.querySelectorAll('.fds-codeblock__panel').forEach(p => p.hidden = true);
        panel.hidden = false;
      });
    });

    root.appendChild(tabs);
    root.appendChild(panels);

    // remove templates do DOM exposto (eles ficaram no template, ok)
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.fds-codeblock').forEach(buildCodeblock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }

  global.FDS = global.FDS || {};
  global.FDS.codeblock = { init: initAll };
})(window);
