/* ============================================================
   FORTICS DS — DIAGRAM ENGINE v3
   Motor de diagramas com visual tech-brand, conexões editáveis,
   elementos de marca, editor de propriedades e export HTML.

   USO:
     const d = new FDSDiagram('#canvas', { nodes:[…], edges:[…] }, opts);
     d.addNode({ label:'API', type:'integration' });
     d.addBrandNode('Chat Center');
     d.toggleConnect();
     d.exportHTML('Nome do diagrama');
     d.reset();
   ============================================================ */

(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  const SPARK_SRC = '../assets/icons/spark-principal.svg';

  /* ── Formas disponíveis ─────────────────────────────────── */
  const SHAPE_PRESETS = {
    rect:    { r:'12px',   clip:'' },
    circle:  { r:'50%',    clip:'' },
    pill:    { r:'100px',  clip:'' },
    diamond: { r:'10px',   clip:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
    hex:     { r:'10px',   clip:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)' },
  };

  /* ── Tamanhos ───────────────────────────────────────────── */
  const SIZE_PRESETS = {
    sm: { w:100, h:42 },
    md: { w:140, h:56 },
    lg: { w:180, h:72 },
    xl: { w:130, h:130 },  /* para círculos/hub */
  };

  /* ── Paleta de cores ────────────────────────────────────── */
  const COLOR_PRESETS = {
    blue:     { bg:'rgba(0,102,255,.09)',      bd:'rgba(0,102,255,.65)',    glow:'0 0 20px rgba(0,102,255,.3)',    txt:'#e8f0ff' },
    violet:   { bg:'rgba(139,92,246,.1)',      bd:'rgba(139,92,246,.65)',   glow:'0 0 20px rgba(139,92,246,.3)',   txt:'#ede8ff' },
    green:    { bg:'rgba(32,215,138,.08)',     bd:'rgba(32,215,138,.6)',    glow:'0 0 20px rgba(32,215,138,.25)',  txt:'#d0fff1' },
    ghost:    { bg:'rgba(255,255,255,.04)',    bd:'rgba(255,255,255,.2)',   glow:'',                               txt:'rgba(255,255,255,.8)' },
    solid_b:  { bg:'linear-gradient(135deg,#0066FF,#003d99)', bd:'#0066FF', glow:'0 0 28px rgba(0,102,255,.65)', txt:'#fff' },
    solid_v:  { bg:'linear-gradient(135deg,#8B5CF6,#0066FF)', bd:'#8B5CF6', glow:'0 0 28px rgba(139,92,246,.6)', txt:'#fff' },
    solid_g:  { bg:'#20D78A',                 bd:'#20D78A',               glow:'0 0 22px rgba(32,215,138,.55)',  txt:'#0B1121' },
    dark:     { bg:'rgba(11,17,33,.9)',        bd:'rgba(255,255,255,.15)',  glow:'',                               txt:'rgba(255,255,255,.7)' },
  };

  /* ── Ícones disponíveis ─────────────────────────────────── */
  const ICONS = [
    'spark',
    'message-circle','phone-call','mic','mail','smartphone','share-2','send',
    'zap','brain','bot','cpu','server','database','hard-drive','cloud',
    'users','user','headphones','shield','key','lock','user-check',
    'bar-chart-2','trending-up','activity','pie-chart','bar-chart',
    'settings','code','globe','link','plug','git-branch','git-fork','layers',
    'megaphone','bell','volume-2','radio','rss',
    'wifi','check-circle','alert-triangle','info','star','heart',
    'package','box','truck','shopping-cart',
  ];

  /* ── Configurações visuais por tipo (usado nos presets) ─── */
  const CFG = {
    hub:         { w:130, h:130, shape:'circle',  color:'solid_b', fw:700, fs:13 },
    spark:       { w:120, h:120, shape:'circle',  color:'solid_v', fw:700, fs:13 },
    product:     { w:144, h:56,  shape:'rect',    color:'blue',    fw:600, fs:12 },
    platform:    { w:150, h:60,  shape:'rect',    color:'violet',  fw:600, fs:12 },
    channel:     { w:120, h:52,  shape:'rect',    color:'green',   fw:600, fs:12 },
    integration: { w:120, h:52,  shape:'rect',    color:'ghost',   fw:600, fs:12 },
    process:     { w:134, h:52,  shape:'rect',    color:'ghost',   fw:600, fs:12 },
    decision:    { w:134, h:72,  shape:'diamond', color:'violet',  fw:600, fs:12 },
    start:       { w:110, h:46,  shape:'pill',    color:'solid_g', fw:700, fs:12 },
    end:         { w:110, h:46,  shape:'pill',    color:'ghost',   fw:600, fs:12 },
    label:       { w:140, h:36,  shape:'rect',    color:'ghost',   fw:400, fs:11 },
    default:     { w:130, h:52,  shape:'rect',    color:'ghost',   fw:600, fs:12 },
  };

  /* ── Presets de marca ─────────────────────────────────────*/
  const BRAND_PRESETS = {
    'Fortics Hub':      { label:'',              type:'hub',         icon:'spark' },
    'Spark':            { label:'Spark',          type:'spark',       icon:'spark' },
    'Chat Center':      { label:'Chat Center',    type:'product',     icon:'message-circle' },
    'Contact Center':   { label:'Contact Center', type:'product',     icon:'phone-call' },
    'IA Engine':        { label:'IA Engine',       type:'platform',    icon:'zap' },
    'Voz':              { label:'Voz',             type:'product',     icon:'mic' },
    'Campanha':         { label:'Campanha',        type:'product',     icon:'megaphone' },
    'Channel Connect':  { label:'Channel Connect',type:'channel',     icon:'share-2' },
    'WhatsApp':         { label:'WhatsApp',        type:'channel',     icon:'message-circle' },
    'SMS':              { label:'SMS',             type:'channel',     icon:'smartphone' },
    'E-mail':           { label:'E-mail',          type:'channel',     icon:'mail' },
    'Instagram':        { label:'Instagram',       type:'channel',     icon:'share-2' },
    'CRM':              { label:'CRM',             type:'integration', icon:'users' },
    'ERP':              { label:'ERP',             type:'integration', icon:'database' },
    'Analytics':        { label:'Analytics',       type:'integration', icon:'bar-chart-2' },
    'API':              { label:'API',             type:'integration', icon:'plug' },
    'Atendente':        { label:'Atendente',       type:'process',     icon:'user' },
    'Bot':              { label:'Bot',             type:'process',     icon:'bot' },
  };

  /* ── CSS do painel de propriedades ──────────────────────── */
  const PANEL_CSS = `
  .fds-panel{
    position:absolute;z-index:9999;background:rgba(11,17,33,.96);border:1px solid rgba(0,102,255,.35);
    border-radius:14px;padding:14px 16px 16px;z-index:100;min-width:268px;
    box-shadow:0 8px 48px rgba(0,0,0,.7),0 0 0 1px rgba(0,102,255,.15);
    backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
    font-family:'Sora',sans-serif;color:#e8f0ff;font-size:12px;
    animation:fds-panel-in .15s ease-out;
  }
  @keyframes fds-panel-in{from{opacity:0;transform:scale(.94) translateY(-6px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .fds-panel-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .fds-panel-row:last-child{margin-bottom:0}
  .fds-panel-label{font-size:10px;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.4);text-transform:uppercase;width:44px;flex-shrink:0}
  .fds-panel-btns{display:flex;gap:5px;flex-wrap:wrap}
  .fds-pbtn{
    width:36px;height:32px;border-radius:8px;border:1.5px solid rgba(255,255,255,.15);
    background:rgba(255,255,255,.05);cursor:pointer;display:flex;align-items:center;
    justify-content:center;transition:border-color .15s,background .15s;padding:0;
  }
  .fds-pbtn:hover{border-color:rgba(0,102,255,.6);background:rgba(0,102,255,.12)}
  .fds-pbtn.active{border-color:#0066FF;background:rgba(0,102,255,.2);box-shadow:0 0 10px rgba(0,102,255,.3)}
  .fds-pbtn svg{width:16px;height:16px;fill:rgba(255,255,255,.7);pointer-events:none}
  .fds-pbtn[data-size]{font-size:10px;font-weight:700;color:rgba(255,255,255,.7);width:32px}
  .fds-color-dot{width:22px;height:22px;border-radius:6px;border:2px solid transparent;cursor:pointer;transition:transform .15s,border-color .15s;flex-shrink:0}
  .fds-color-dot:hover{transform:scale(1.15)}
  .fds-color-dot.active{border-color:#fff;transform:scale(1.1)}
  .fds-ico-grid{display:flex;flex-wrap:wrap;gap:4px;max-height:108px;overflow-y:auto;padding:2px 0}
  .fds-ico-grid::-webkit-scrollbar{width:3px}
  .fds-ico-grid::-webkit-scrollbar-track{background:transparent}
  .fds-ico-grid::-webkit-scrollbar-thumb{background:rgba(0,102,255,.4);border-radius:2px}
  .fds-ibtn{
    width:30px;height:30px;border-radius:7px;border:1.5px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.04);cursor:pointer;display:flex;align-items:center;
    justify-content:center;transition:border-color .15s,background .15s;flex-shrink:0;padding:0;
  }
  .fds-ibtn:hover{border-color:rgba(0,102,255,.55);background:rgba(0,102,255,.1)}
  .fds-ibtn.active{border-color:#0066FF;background:rgba(0,102,255,.2)}
  .fds-ibtn img{width:16px;height:16px;object-fit:contain;filter:brightness(0) invert(1);pointer-events:none}
  .fds-ibtn [data-lucide]{width:14px;height:14px;color:rgba(255,255,255,.7);pointer-events:none}
  .fds-panel-divider{height:1px;background:rgba(255,255,255,.08);margin:10px 0}
  .fds-panel-del{
    width:100%;padding:7px;border-radius:8px;border:1px solid rgba(255,80,80,.35);
    background:rgba(255,60,60,.07);color:rgba(255,110,110,.9);
    font-family:'Sora',sans-serif;font-size:11px;font-weight:600;cursor:pointer;
    letter-spacing:.04em;transition:background .15s,border-color .15s;
  }
  .fds-panel-del:hover{background:rgba(255,60,60,.15);border-color:rgba(255,80,80,.6)}
  .fds-panel-close{
    position:absolute;top:10px;right:10px;width:20px;height:20px;border-radius:50%;
    border:none;background:rgba(255,255,255,.08);color:rgba(255,255,255,.5);
    font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background .15s;padding:0;line-height:1;
  }
  .fds-panel-close:hover{background:rgba(255,255,255,.15)}
  `;

  /* ── Helpers ────────────────────────────────────────────── */
  function getNodeStyle(node) {
    const baseCfg = CFG[node.type] || CFG.default;
    return {
      w:       node._w       ?? baseCfg.w,
      h:       node._h       ?? baseCfg.h,
      shape:   node._shape   ?? baseCfg.shape,
      color:   node._color   ?? baseCfg.color,
      iconPos: node._iconPos ?? 'top',
      fw:      baseCfg.fw,
      fs:      baseCfg.fs,
    };
  }

  function resolveStyle(ns) {
    const sp = SHAPE_PRESETS[ns.shape] || SHAPE_PRESETS.rect;
    const cp = COLOR_PRESETS[ns.color] || COLOR_PRESETS.ghost;
    return { ...ns, ...sp, ...cp };
  }

  /* ── Classe principal ─────────────────────────────────── */
  class FDSDiagram {
    constructor(container, data, opts = {}) {
      this.el   = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.el) return;
      this._orig = JSON.parse(JSON.stringify(data));
      this.data  = JSON.parse(JSON.stringify(data));
      this.opts  = opts;
      this.nodes = new Map();
      this._sel      = null;
      this._conn     = null;
      this._connectMode = false;
      this._activePanel = null;
      this._injectCSS();
      this._build();
    }

    _injectCSS() {
      if (document.getElementById('fds-panel-css')) return;
      const s = document.createElement('style');
      s.id = 'fds-panel-css';
      s.textContent = PANEL_CSS;
      document.head.appendChild(s);
    }

    /* ── Setup ──────────────────────────────────────────── */
    _build() {
      this.el.style.cssText += ';position:relative;overflow:hidden;';
      Object.assign(this.el.style, {
        backgroundImage: 'radial-gradient(circle,rgba(0,102,255,.2) 1px,transparent 1px)',
        backgroundSize:  '28px 28px',
      });

      this.svg = document.createElementNS(NS, 'svg');
      this.svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:1;pointer-events:none';
      this.svg.appendChild(this._defs());
      this.el.appendChild(this.svg);

      this.el.addEventListener('pointerdown', e => {
        if (e.target === this.el || e.target === this.svg) {
          if (this._conn) this._cancelConn();
          if (this._sel)  { this._sel = null; this._redraw(); }
          this._closePanel();
        }
      });
      this.el.addEventListener('pointermove', e => {
        if (!this._conn || !this._tLine) return;
        const r = this.el.getBoundingClientRect();
        this._moveTLine(this._conn.x1, this._conn.y1, e.clientX - r.left, e.clientY - r.top);
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this._cancelConn();
          this._closePanel();
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && this._sel) {
          this._removeEdge(this._sel.from, this._sel.to);
          this._sel = null;
        }
      });

      this._banner = document.createElement('div');
      this._banner.style.cssText = `
        position:absolute;top:12px;left:50%;transform:translateX(-50%);
        background:rgba(32,215,138,.15);border:1px solid rgba(32,215,138,.5);
        color:#20D78A;font-family:'Sora',sans-serif;font-size:11px;font-weight:600;
        padding:5px 14px;border-radius:100px;pointer-events:none;
        opacity:0;transition:opacity .2s;z-index:20;letter-spacing:.04em;`;
      this._banner.textContent = '⊕ MODO CONEXÃO — clique num nó de origem';
      this.el.appendChild(this._banner);

      this.data.nodes.forEach(n => this._makeNode(n));
      this._redraw();
    }

    _defs() {
      const d = document.createElementNS(NS, 'defs');
      const uid = this.el.id || 'fds';
      d.innerHTML = `
        <filter id="gl-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gln-${uid}" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <marker id="arr-b-${uid}"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="rgba(0,102,255,.9)"/></marker>
        <marker id="arr-g-${uid}"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="rgba(32,215,138,.9)"/></marker>
        <marker id="arr-v-${uid}"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="rgba(139,92,246,.9)"/></marker>
        <marker id="arr-r-${uid}"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#FF6B6B"/></marker>
        <marker id="arr-w-${uid}"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="rgba(255,255,255,.6)"/></marker>
        <style>
          .fds-edge { animation: fds-flow 2.2s linear infinite; }
          .fds-edge-sel { animation: fds-flow .5s linear infinite; }
          @keyframes fds-flow { to { stroke-dashoffset: -24; } }
        </style>`;
      return d;
    }

    /* ── Nó ─────────────────────────────────────────────── */
    _makeNode(node) {
      const ns = getNodeStyle(node);
      const st = resolveStyle(ns);

      const wrap = document.createElement('div');
      wrap.dataset.id = node.id;
      wrap.dataset.x  = node.x;
      wrap.dataset.y  = node.y;
      wrap.style.cssText = `
        position:absolute;left:${node.x}px;top:${node.y}px;
        transform:translate(-50%,-50%);z-index:2;cursor:grab;touch-action:none;`;

      /* Connect handle */
      const hdl = document.createElement('div');
      hdl.style.cssText = `
        position:absolute;right:-9px;top:50%;transform:translateY(-50%);
        width:18px;height:18px;border-radius:50%;
        background:#0066FF;border:2.5px solid #fff;
        cursor:crosshair;opacity:0;transition:opacity .15s;z-index:12;
        box-shadow:0 0 8px rgba(0,102,255,.6);`;
      hdl.title = 'Conectar';
      hdl.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        this._startConn(node.id);
      });
      wrap.appendChild(hdl);

      /* Box */
      const box = document.createElement('div');
      box.className = 'fds-dgr-box';
      this._applyBoxStyle(box, st, node.type);

      /* Ícone */
      this._renderIcon(box, node, st);

      /* Label */
      const lbl = document.createElement('div');
      lbl.className = 'fds-dgr-lbl';
      lbl.contentEditable = 'true';
      lbl.spellcheck = false;
      lbl.textContent = node.label;
      lbl.style.cssText = `
        color:${st.txt};
        font-family:'Sora',var(--fds-font-sans),sans-serif;
        font-size:${st.fs}px;font-weight:${st.fw};
        line-height:1.3;text-align:center;
        outline:none;cursor:text;
        max-width:${st.w - 16}px;word-break:break-word;`;
      if (node.label !== '') box.appendChild(lbl);
      wrap.appendChild(box);
      this.el.appendChild(wrap);
      this.nodes.set(node.id, { el: wrap });

      /* Hover */
      wrap.addEventListener('mouseenter', () => {
        hdl.style.opacity = this._conn ? '0' : '1';
        if (!this._conn) {
          box.style.boxShadow = `${st.glow||''},0 4px 28px rgba(0,102,255,.35)`.replace(/^,/, '');
          box.style.transform = 'scale(1.05)';
        } else if (this._conn.fromId !== node.id) {
          box.style.boxShadow = '0 0 0 2.5px #20D78A,0 0 24px rgba(32,215,138,.45)';
        }
      });
      wrap.addEventListener('mouseleave', () => {
        hdl.style.opacity = '0';
        box.style.boxShadow = st.glow || '0 2px 20px rgba(0,0,0,.4)';
        box.style.transform = '';
      });

      /* Click em modo conexão */
      wrap.addEventListener('pointerdown', e => {
        if (e.target === hdl) return;
        if (this._conn) {
          e.stopPropagation();
          if (this._conn.fromId !== node.id) this._endConn(node.id);
          else this._cancelConn();
          return;
        }
        if (this._connectMode && !this._conn) {
          e.stopPropagation();
          this._startConn(node.id);
          return;
        }
      });

      this._drag(wrap, lbl, node.id);
    }

    _applyBoxStyle(box, st, type) {
      const flexDir = (st.iconPos === 'left')  ? 'row'
                    : (st.iconPos === 'right') ? 'row-reverse'
                    : 'column';
      box.style.cssText = `
        background:${st.bg};
        border:1.5px solid ${st.bd};
        border-radius:${st.r};
        width:${st.w}px;height:${st.h}px;
        display:flex;align-items:center;justify-content:center;
        flex-direction:${flexDir};gap:${flexDir==='column'?'4':'8'}px;
        box-shadow:${st.glow || '0 2px 20px rgba(0,0,0,.4)'};
        backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
        transition:box-shadow .2s,transform .15s;position:relative;overflow:hidden;
        ${st.clip ? `clip-path:${st.clip};-webkit-clip-path:${st.clip};` : ''}
        ${type === 'label' ? 'border:none;backdrop-filter:none;' : ''}`;
    }

    _renderIcon(box, node, st) {
      const old = box.querySelector('.fds-dgr-ico');
      if (old) old.remove();

      const icon = node.icon;
      if (!icon || st.iconPos === 'none') return;

      if (icon === 'spark') {
        const sz = st.shape === 'circle' ? 52 : 30;
        const ico = document.createElement('img');
        ico.className = 'fds-dgr-ico';
        ico.src = this.opts.sparkSrc || SPARK_SRC;
        ico.alt = 'Spark';
        ico.style.cssText = `width:${sz}px;height:${sz}px;object-fit:contain;pointer-events:none;flex-shrink:0;filter:brightness(0) invert(1);`;
        box.insertBefore(ico, box.firstChild);
      } else {
        const ico = document.createElement('i');
        ico.className = 'fds-dgr-ico';
        ico.dataset.lucide = icon;
        ico.style.cssText = `width:18px;height:18px;color:${st.txt};pointer-events:none;flex-shrink:0;opacity:.85;`;
        box.insertBefore(ico, box.firstChild);
        if (global.lucide) global.lucide.createIcons({ nodes: [ico] });
      }
    }

    /* ── Drag com detecção de click ─────────────────────── */
    _drag(el, lbl, nodeId) {
      let on = false, sx, sy, ex, ey, moved = false;
      el.addEventListener('pointerdown', e => {
        if (this._conn || this._connectMode) return;
        if (e.target === lbl || lbl.contains(e.target)) return;
        if (e.target.title === 'Conectar') return;
        on = true; moved = false;
        el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY;
        ex = parseFloat(el.dataset.x); ey = parseFloat(el.dataset.y);
        el.style.cursor = 'grabbing'; el.style.zIndex = '10';
        e.preventDefault();
      });
      el.addEventListener('pointermove', e => {
        if (!on) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) moved = true;
        if (!moved) return;
        const nx = ex + dx, ny = ey + dy;
        el.dataset.x = nx; el.dataset.y = ny;
        el.style.left = nx + 'px'; el.style.top = ny + 'px';
        this._redraw();
        if (this._activePanel && this._activePanel.nodeId === nodeId) {
          this._repositionPanel(this._activePanel.el, el);
        }
      });
      el.addEventListener('pointerup', e => {
        const wasDrag = moved;
        on = false; el.style.cursor = 'grab'; el.style.zIndex = '2';
        if (!wasDrag) {
          /* Click — show property panel */
          this._showPanel(nodeId, el);
        }
      });
    }

    /* ── Painel de propriedades ─────────────────────────── */
    _showPanel(nodeId, wrapEl) {
      this._closePanel();
      const nodeData = this.data.nodes.find(n => n.id === nodeId);
      if (!nodeData) return;

      const panel = document.createElement('div');
      panel.className = 'fds-panel';

      /* Botão fechar */
      const closeBtn = document.createElement('button');
      closeBtn.className = 'fds-panel-close';
      closeBtn.innerHTML = '×';
      closeBtn.addEventListener('click', () => this._closePanel());
      panel.appendChild(closeBtn);

      /* Título */
      const title = document.createElement('div');
      title.style.cssText = 'font-size:11px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.45);text-transform:uppercase;margin-bottom:12px;padding-right:20px';
      title.textContent = 'Estilo do nó';
      panel.appendChild(title);

      const ns = getNodeStyle(nodeData);

      /* ── Forma ── */
      const shapeRow = this._makeRow('Forma');
      const shapeBtns = document.createElement('div');
      shapeBtns.className = 'fds-panel-btns';
      const shapeIcons = {
        rect:    `<svg viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" rx="2.5" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>`,
        circle:  `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>`,
        pill:    `<svg viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="8" rx="4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>`,
        diamond: `<svg viewBox="0 0 16 16"><polygon points="8,1 15,8 8,15 1,8" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>`,
        hex:     `<svg viewBox="0 0 16 16"><polygon points="4,1 12,1 16,8 12,15 4,15 0,8" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>`,
      };
      Object.entries(shapeIcons).forEach(([key, svg]) => {
        const btn = document.createElement('button');
        btn.className = 'fds-pbtn' + (ns.shape === key ? ' active' : '');
        btn.title = key;
        btn.innerHTML = svg;
        btn.style.color = 'rgba(255,255,255,.7)';
        btn.addEventListener('click', () => {
          shapeBtns.querySelectorAll('.fds-pbtn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateNodeStyle(nodeId, { shape: key });
        });
        shapeBtns.appendChild(btn);
      });
      shapeRow.appendChild(shapeBtns);
      panel.appendChild(shapeRow);

      /* ── Tamanho ── */
      const sizeRow = this._makeRow('Tam.');
      const sizeBtns = document.createElement('div');
      sizeBtns.className = 'fds-panel-btns';
      const curW = ns.w;
      const sizes = [
        { key:'sm', label:'S', w:SIZE_PRESETS.sm.w },
        { key:'md', label:'M', w:SIZE_PRESETS.md.w },
        { key:'lg', label:'L', w:SIZE_PRESETS.lg.w },
        { key:'xl', label:'XL',w:SIZE_PRESETS.xl.w },
      ];
      sizes.forEach(sz => {
        const btn = document.createElement('button');
        btn.className = 'fds-pbtn' + (curW === sz.w ? ' active' : '');
        btn.setAttribute('data-size', sz.key);
        btn.textContent = sz.label;
        btn.style.cssText += 'font-size:10px;font-weight:700;color:rgba(255,255,255,.7);width:32px;';
        btn.addEventListener('click', () => {
          sizeBtns.querySelectorAll('.fds-pbtn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sp = SIZE_PRESETS[sz.key];
          this.updateNodeStyle(nodeId, { w: sp.w, h: sp.h });
        });
        sizeBtns.appendChild(btn);
      });
      sizeRow.appendChild(sizeBtns);
      panel.appendChild(sizeRow);

      /* ── Cor ── */
      const colorRow = this._makeRow('Cor');
      const colorBtns = document.createElement('div');
      colorBtns.className = 'fds-panel-btns';
      colorBtns.style.flexWrap = 'wrap';
      const colorDots = {
        blue:    '#0066FF',
        violet:  '#8B5CF6',
        green:   '#20D78A',
        ghost:   'rgba(255,255,255,.25)',
        solid_b: 'linear-gradient(135deg,#0066FF,#003d99)',
        solid_v: 'linear-gradient(135deg,#8B5CF6,#0066FF)',
        solid_g: '#20D78A',
        dark:    '#0B1121',
      };
      Object.entries(colorDots).forEach(([key, bg]) => {
        const dot = document.createElement('div');
        dot.className = 'fds-color-dot' + (ns.color === key ? ' active' : '');
        dot.title = key;
        dot.style.cssText = `width:22px;height:22px;border-radius:6px;border:2px solid transparent;cursor:pointer;transition:transform .15s,border-color .15s;flex-shrink:0;background:${bg};`;
        if (ns.color === key) dot.style.borderColor = '#fff';
        dot.addEventListener('click', () => {
          colorBtns.querySelectorAll('.fds-color-dot').forEach(d => {
            d.classList.remove('active'); d.style.borderColor = 'transparent';
          });
          dot.classList.add('active'); dot.style.borderColor = '#fff';
          this.updateNodeStyle(nodeId, { color: key });
        });
        colorBtns.appendChild(dot);
      });
      colorRow.appendChild(colorBtns);
      panel.appendChild(colorRow);

      /* ── Posição do ícone ── */
      const posRow = this._makeRow('Pos.');
      const posBtns = document.createElement('div');
      posBtns.className = 'fds-panel-btns';
      const curPos = ns.iconPos || 'top';
      const posOpts = [
        { key:'top',   svg:`<svg viewBox="0 0 16 16"><rect x="5" y="1" width="6" height="5" rx="1" fill="currentColor" opacity=".9"/><rect x="2" y="9" width="12" height="4" rx="1.5" fill="currentColor" opacity=".4"/></svg>` },
        { key:'left',  svg:`<svg viewBox="0 0 16 16"><rect x="1" y="5" width="5" height="6" rx="1" fill="currentColor" opacity=".9"/><rect x="9" y="4" width="6" height="8" rx="1.5" fill="currentColor" opacity=".4"/></svg>` },
        { key:'right', svg:`<svg viewBox="0 0 16 16"><rect x="10" y="5" width="5" height="6" rx="1" fill="currentColor" opacity=".9"/><rect x="1" y="4" width="6" height="8" rx="1.5" fill="currentColor" opacity=".4"/></svg>` },
        { key:'none',  svg:`<svg viewBox="0 0 16 16"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>` },
      ];
      posOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'fds-pbtn' + (curPos === opt.key ? ' active' : '');
        btn.title = opt.key;
        btn.innerHTML = opt.svg;
        btn.style.color = 'rgba(255,255,255,.7)';
        btn.addEventListener('click', () => {
          posBtns.querySelectorAll('.fds-pbtn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateNodeStyle(nodeId, { iconPos: opt.key });
        });
        posBtns.appendChild(btn);
      });
      posRow.appendChild(posBtns);
      panel.appendChild(posRow);

      /* ── Ícone ── */
      const icoLabel = document.createElement('div');
      icoLabel.style.cssText = 'font-size:10px;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:6px;';
      icoLabel.textContent = 'Ícone';
      panel.appendChild(icoLabel);
      const grid = document.createElement('div');
      grid.className = 'fds-ico-grid';
      ICONS.forEach(ico => {
        const btn = document.createElement('button');
        btn.className = 'fds-ibtn' + (nodeData.icon === ico ? ' active' : '');
        btn.title = ico;
        if (ico === 'spark') {
          const img = document.createElement('img');
          img.src = this.opts.sparkSrc || SPARK_SRC;
          img.alt = 'Spark';
          btn.appendChild(img);
        } else {
          const i = document.createElement('i');
          i.dataset.lucide = ico;
          btn.appendChild(i);
          if (global.lucide) global.lucide.createIcons({ nodes: [i] });
        }
        btn.addEventListener('click', () => {
          grid.querySelectorAll('.fds-ibtn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateNodeStyle(nodeId, { icon: ico });
        });
        grid.appendChild(btn);
      });
      panel.appendChild(grid);

      /* ── Divider + Deletar ── */
      const div = document.createElement('div');
      div.className = 'fds-panel-divider';
      panel.appendChild(div);

      const delBtn = document.createElement('button');
      delBtn.className = 'fds-panel-del';
      delBtn.textContent = '⊘ Remover nó';
      delBtn.addEventListener('click', () => {
        this._closePanel();
        this.removeNode(nodeId);
      });
      panel.appendChild(delBtn);

      document.body.appendChild(panel);
      this._repositionPanel(panel, wrapEl);

      this._activePanel = { el: panel, nodeId };
      panel.addEventListener('pointerdown', e => e.stopPropagation());
    }

    _makeRow(label) {
      const row = document.createElement('div');
      row.className = 'fds-panel-row';
      const lbl = document.createElement('div');
      lbl.className = 'fds-panel-label';
      lbl.textContent = label;
      row.appendChild(lbl);
      return row;
    }

    _repositionPanel(panel, wrapEl) {
      const canvasRect = this.el.getBoundingClientRect();
      const x = parseFloat(wrapEl.dataset.x);
      const y = parseFloat(wrapEl.dataset.y);
      const ns = getNodeStyle(this.data.nodes.find(n => n.id === wrapEl.dataset.id) || {});
      const hw = (ns.w || 130) / 2;
      const panelW = 284;
      const panelH = panel.offsetHeight || 360;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      /* posição do nó em coordenadas de página */
      const nx = canvasRect.left + scrollX + x;
      const ny = canvasRect.top  + scrollY + y;

      let px = nx + hw + 16;
      let py = ny - 20;

      /* se sair pela direita, colocar à esquerda */
      if (px + panelW > scrollX + window.innerWidth - 16) {
        px = nx - hw - panelW - 16;
      }
      /* clampar verticalmente dentro da janela */
      const maxPy = scrollY + window.innerHeight - panelH - 16;
      if (py < scrollY + 16) py = scrollY + 16;
      if (py > maxPy)        py = maxPy;

      panel.style.left = px + 'px';
      panel.style.top  = py + 'px';
    }

    _closePanel() {
      if (this._activePanel) {
        this._activePanel.el.remove();
        this._activePanel = null;
      }
    }

    /* ── Conexão ────────────────────────────────────────── */
    _startConn(fromId) {
      const n = this.nodes.get(fromId);
      if (!n) return;
      const x1 = parseFloat(n.el.dataset.x);
      const y1 = parseFloat(n.el.dataset.y);
      this._conn = { fromId, x1, y1 };
      this._banner.style.opacity = '1';
      this._banner.textContent   = '⊕ Clique no nó destino para conectar · ESC para cancelar';
      this.el.style.cursor = 'crosshair';
      this._tLine = document.createElementNS(NS, 'line');
      this._tLine.setAttribute('stroke', '#20D78A');
      this._tLine.setAttribute('stroke-width', '2');
      this._tLine.setAttribute('stroke-dasharray', '6 4');
      this._tLine.style.pointerEvents = 'none';
      this.svg.appendChild(this._tLine);
      this._moveTLine(x1, y1, x1 + 20, y1);
    }
    _moveTLine(x1, y1, x2, y2) {
      this._tLine.setAttribute('x1', x1); this._tLine.setAttribute('y1', y1);
      this._tLine.setAttribute('x2', x2); this._tLine.setAttribute('y2', y2);
    }
    _endConn(toId) {
      const from = this._conn.fromId;
      this._cancelConn();
      if (from === toId) return;
      if (!this.data.edges.some(e => e.from === from && e.to === toId)) {
        this.data.edges.push({ from, to: toId });
        this._redraw();
      }
    }
    _cancelConn() {
      if (this._tLine) { this._tLine.remove(); this._tLine = null; }
      this._conn = null;
      this._banner.style.opacity = '0';
      if (!this._connectMode) {
        this.el.style.cursor = '';
        this._banner.textContent = '⊕ MODO CONEXÃO — clique num nó de origem';
      } else {
        this._banner.style.opacity = '1';
        this._banner.textContent   = '⊕ MODO CONEXÃO — clique num nó de origem';
      }
    }
    _removeEdge(from, to) {
      this.data.edges = this.data.edges.filter(e => !(e.from === from && e.to === to));
      this._redraw();
    }

    /* ── Render edges ───────────────────────────────────── */
    _redraw() {
      const uid  = this.el.id || 'fds';
      const defs = this.svg.querySelector('defs');
      this.svg.innerHTML = '';
      this.svg.appendChild(defs);

      (this.data.edges || []).forEach(edge => {
        const a = this.nodes.get(edge.from);
        const b = this.nodes.get(edge.to);
        if (!a || !b) return;
        const x1 = parseFloat(a.el.dataset.x), y1 = parseFloat(a.el.dataset.y);
        const x2 = parseFloat(b.el.dataset.x), y2 = parseFloat(b.el.dataset.y);
        const isSel = this._sel && this._sel.from === edge.from && this._sel.to === edge.to;

        const stroke = isSel
          ? '#FF6B6B'
          : edge.color === 'green'  ? 'rgba(32,215,138,.75)'
          : edge.color === 'violet' ? 'rgba(139,92,246,.75)'
          : 'rgba(0,102,255,.75)';
        const marker = isSel
          ? `url(#arr-r-${uid})`
          : edge.color === 'green'  ? `url(#arr-g-${uid})`
          : edge.color === 'violet' ? `url(#arr-v-${uid})`
          : `url(#arr-b-${uid})`;

        const pathD = this.opts.curved
          ? `M${x1} ${y1} C${x1 + (x2 - x1) * .65} ${y1},${x2 - (x2 - x1) * .65} ${y2},${x2} ${y2}`
          : `M${x1} ${y1} L${x2} ${y2}`;

        /* hit area */
        const hit = document.createElementNS(NS, 'path');
        hit.setAttribute('d', pathD);
        hit.setAttribute('stroke', 'transparent');
        hit.setAttribute('stroke-width', '16');
        hit.setAttribute('fill', 'none');
        hit.style.cssText = 'cursor:pointer;pointer-events:stroke';
        hit.addEventListener('pointerdown', e => {
          e.stopPropagation();
          this._sel = isSel ? null : { from: edge.from, to: edge.to };
          this._redraw();
        });
        this.svg.appendChild(hit);

        /* visible path */
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', pathD);
        p.setAttribute('stroke', stroke);
        p.setAttribute('stroke-width', isSel ? '2.5' : (edge.bold ? '2.5' : '2'));
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke-dasharray', isSel ? '5 3' : '8 4');
        p.setAttribute('marker-end', marker);
        p.setAttribute('filter', `url(#gl-${uid})`);
        p.classList.add(isSel ? 'fds-edge-sel' : 'fds-edge');
        p.style.pointerEvents = 'none';
        this.svg.appendChild(p);

        /* label (static, when not selected) */
        if (edge.label && !isSel) {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 12;
          const t = document.createElementNS(NS, 'text');
          t.setAttribute('x', mx); t.setAttribute('y', my);
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('fill', 'rgba(255,255,255,.65)');
          t.setAttribute('font-size', '11');
          t.setAttribute('font-family', "'Sora',sans-serif");
          t.style.pointerEvents = 'none';
          t.textContent = edge.label;
          this.svg.appendChild(t);
        }

        /* edição de rótulo + botão × quando selecionado */
        if (isSel) {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;

          /* input de rótulo acima do midpoint */
          const fo = document.createElementNS(NS, 'foreignObject');
          fo.setAttribute('x', mx - 72);
          fo.setAttribute('y', my - 46);
          fo.setAttribute('width', '144');
          fo.setAttribute('height', '28');
          fo.style.overflow = 'visible';
          fo.style.pointerEvents = 'all';

          const inp = document.createElement('input');
          inp.type = 'text';
          inp.value = edge.label || '';
          inp.placeholder = 'Rótulo da linha…';
          inp.style.cssText = `
            width:144px;background:rgba(11,17,33,.92);
            border:1px solid rgba(0,102,255,.55);border-radius:7px;
            color:#e8f0ff;font-family:'Sora',sans-serif;font-size:11px;
            padding:5px 10px;outline:none;text-align:center;
            box-shadow:0 2px 16px rgba(0,0,0,.5);`;
          inp.addEventListener('pointerdown', e => e.stopPropagation());
          const save = () => { edge.label = inp.value.trim(); this._redraw(); };
          inp.addEventListener('blur',  save);
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
          fo.appendChild(inp);
          this.svg.appendChild(fo);

          /* foca automaticamente ao selecionar */
          requestAnimationFrame(() => inp.focus());

          /* botão × */
          const g = document.createElementNS(NS, 'g');
          g.style.cssText = 'cursor:pointer;pointer-events:all';
          const c = document.createElementNS(NS, 'circle');
          c.setAttribute('cx', mx); c.setAttribute('cy', my + 16);
          c.setAttribute('r', '11'); c.setAttribute('fill', '#FF4444');
          c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', '1.5');
          const xt = document.createElementNS(NS, 'text');
          xt.setAttribute('x', mx); xt.setAttribute('y', my + 21);
          xt.setAttribute('text-anchor', 'middle');
          xt.setAttribute('fill', '#fff'); xt.setAttribute('font-size', '15');
          xt.setAttribute('font-weight', 'bold');
          xt.textContent = '×';
          g.appendChild(c); g.appendChild(xt);
          g.addEventListener('pointerdown', e => {
            e.stopPropagation();
            this._removeEdge(edge.from, edge.to);
            this._sel = null;
          });
          this.svg.appendChild(g);
        }
      });

      if (this._tLine) this.svg.appendChild(this._tLine);
    }

    /* ── API pública ────────────────────────────────────── */

    toggleConnect() {
      this._connectMode = !this._connectMode;
      if (this._connectMode) {
        this.el.style.cursor = 'crosshair';
        this._banner.style.opacity = '1';
      } else {
        this._cancelConn();
        this.el.style.cursor = '';
      }
      return this._connectMode;
    }

    addNode(data = {}) {
      const node = {
        id:    'n' + Date.now(),
        label: 'Novo nó',
        x:     this.el.offsetWidth  / 2 + (Math.random() - .5) * 120,
        y:     this.el.offsetHeight / 2 + (Math.random() - .5) * 100,
        type:  'default',
        ...data,
      };
      this.data.nodes.push(node);
      this._makeNode(node);
      return node.id;
    }

    addBrandNode(presetName) {
      const p = BRAND_PRESETS[presetName];
      if (!p) return;
      return this.addNode({ ...p });
    }

    updateNodeStyle(nodeId, props) {
      const nodeData = this.data.nodes.find(n => n.id === nodeId);
      if (!nodeData) return;
      const entry = this.nodes.get(nodeId);
      if (!entry) return;

      if (props.shape   !== undefined) nodeData._shape   = props.shape;
      if (props.w       !== undefined) nodeData._w       = props.w;
      if (props.h       !== undefined) nodeData._h       = props.h;
      if (props.color   !== undefined) nodeData._color   = props.color;
      if (props.icon    !== undefined) nodeData.icon     = props.icon;
      if (props.iconPos !== undefined) nodeData._iconPos = props.iconPos;

      const ns = getNodeStyle(nodeData);
      const st = resolveStyle(ns);

      const box = entry.el.querySelector('.fds-dgr-box');
      if (box) {
        this._applyBoxStyle(box, st, nodeData.type);
        /* Re-render icon */
        this._renderIcon(box, nodeData, st);
        /* Update label color */
        const lbl = box.querySelector('.fds-dgr-lbl');
        if (lbl) {
          lbl.style.color    = st.txt;
          lbl.style.maxWidth = (st.w - 16) + 'px';
        }
      }
    }

    removeNode(nodeId) {
      const entry = this.nodes.get(nodeId);
      if (entry) { entry.el.remove(); this.nodes.delete(nodeId); }
      this.data.nodes  = this.data.nodes.filter(n => n.id !== nodeId);
      this.data.edges  = this.data.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
      this._redraw();
    }

    reset() {
      this._closePanel();
      this.nodes.forEach(n => n.el.remove());
      this.nodes.clear();
      this._sel = null;
      this._cancelConn();
      this.data = JSON.parse(JSON.stringify(this._orig));
      const defs = this.svg.querySelector('defs');
      this.svg.innerHTML = '';
      this.svg.appendChild(defs);
      this.data.nodes.forEach(n => this._makeNode(n));
      this._redraw();
    }

    exportHTML(title = 'Fortics Diagrama') {
      const nodes = this.data.nodes.map(n => {
        const s = this.nodes.get(n.id);
        return {
          ...n,
          x:     s ? parseFloat(s.el.dataset.x) : n.x,
          y:     s ? parseFloat(s.el.dataset.y) : n.y,
          label: s ? (s.el.querySelector('.fds-dgr-lbl')?.textContent ?? n.label) : n.label,
        };
      });
      const W = this.el.offsetWidth;
      const H = this.el.offsetHeight;

      const edgeSVG = (this.data.edges || []).map(edge => {
        const a = nodes.find(n => n.id === edge.from);
        const b = nodes.find(n => n.id === edge.to);
        if (!a || !b) return '';
        const color  = edge.color === 'green'  ? 'rgba(32,215,138,.75)'
                     : edge.color === 'violet' ? 'rgba(139,92,246,.75)'
                     : 'rgba(0,102,255,.75)';
        const mColor = edge.color === 'green'  ? 'rgba(32,215,138,.9)'
                     : edge.color === 'violet' ? 'rgba(139,92,246,.9)'
                     : 'rgba(0,102,255,.9)';
        const d = this.opts.curved
          ? `M${a.x} ${a.y} C${a.x + (b.x - a.x) * .65} ${a.y},${b.x - (b.x - a.x) * .65} ${b.y},${b.x} ${b.y}`
          : `M${a.x} ${a.y} L${b.x} ${b.y}`;
        const mid = edge.label
          ? `<text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 10}" text-anchor="middle" fill="rgba(255,255,255,.65)" font-size="11" font-family="'Sora',sans-serif">${edge.label}</text>`
          : '';
        return `<marker id="m-${edge.from}-${edge.to}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${mColor}"/></marker>
<path d="${d}" stroke="${color}" stroke-width="${edge.bold ? 2.5 : 2}" fill="none" stroke-dasharray="8 4" marker-end="url(#m-${edge.from}-${edge.to})" filter="url(#gl)" class="fds-edge"/>${mid}`;
      }).join('\n');

      const nodeHTML = nodes.map(n => {
        const ns  = getNodeStyle(n);
        const st  = resolveStyle(ns);
        let inner = '';
        const sparkSrc = this.opts.sparkSrc || SPARK_SRC;
        if (n.icon === 'spark') {
          const sz = st.shape === 'circle' ? 52 : 30;
          inner = `<img src="${sparkSrc}" alt="Spark" style="width:${sz}px;height:${sz}px;object-fit:contain;filter:brightness(0) invert(1);"/>`;
        } else if (n.icon) {
          inner = `<span data-lucide="${n.icon}" style="width:18px;height:18px;color:${st.txt};opacity:.85;display:inline-block;"></span>`;
        }
        if (n.label) {
          inner += `<div style="color:${st.txt};font-family:'Sora',sans-serif;font-size:${st.fs}px;font-weight:${st.fw};line-height:1.3;text-align:center;max-width:${st.w - 16}px;word-break:break-word;">${n.label}</div>`;
        }
        const clipCss = st.clip ? `clip-path:${st.clip};-webkit-clip-path:${st.clip};` : '';
        return `<div style="position:absolute;left:${n.x}px;top:${n.y}px;transform:translate(-50%,-50%);z-index:2">
  <div style="background:${st.bg};border:1.5px solid ${st.bd};border-radius:${st.r};width:${st.w}px;height:${st.h}px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;box-shadow:${st.glow || '0 2px 20px rgba(0,0,0,.4)'};backdrop-filter:blur(10px);${clipCss}${n.type === 'label' ? 'border:none;backdrop-filter:none;' : ''}">${inner}</div>
</div>`;
      }).join('\n');

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — Fortics</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#060d1a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Sora',sans-serif;padding:32px}
.wrap{position:relative;background:#0b1121;background-image:radial-gradient(circle,rgba(0,102,255,.2) 1px,transparent 1px);background-size:28px 28px;border:1px solid rgba(0,102,255,.2);border-radius:16px;overflow:hidden}
.logo{position:absolute;bottom:16px;right:20px;opacity:.35;font-size:11px;color:#fff;letter-spacing:.06em;font-weight:600}
@keyframes fds-flow{to{stroke-dashoffset:-24}}
.fds-edge{animation:fds-flow 2.2s linear infinite}
</style>
</head>
<body>
<div class="wrap" style="width:${W}px;height:${H}px">
  <svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:1;pointer-events:none">
    <defs>
      <filter id="gl" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      ${edgeSVG.match(/<marker[^>]*>.*?<\/marker>/gs)?.join('\n') ?? ''}
    </defs>
    ${edgeSVG.replace(/<marker[^>]*>.*?<\/marker>/gs, '').trim()}
  </svg>
  ${nodeHTML}
  <div class="logo">✦ FORTICS</div>
</div>
<script>if(window.lucide)lucide.createIcons();</script>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }
  }

  global.FDSDiagram        = FDSDiagram;
  global.FDS_BRAND_PRESETS = Object.keys(BRAND_PRESETS);
})(window);
