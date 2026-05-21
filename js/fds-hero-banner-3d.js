/* ============================================================
   FORTICS DS — HERO BANNER 3D (Glass)
   Banner reutilizável com o Spark 3D em efeito vidro + entrada
   dramática (GSAP) + idle motion sutil.

   USO:
     <div data-fds-hero-banner-3d
          data-obj="/assets/3d/Fortics.obj"
          data-color="#0066FF">
       ...conteúdo da camada de texto sobreposta...
     </div>

   API programática:
     new FDS.HeroBanner3D(container, { objUrl, color, ... })

   Requer: THREE r128 + OBJLoader + GSAP
   ============================================================ */

(function (global) {
  'use strict';

  if (!global.THREE || !global.THREE.OBJLoader) {
    console.error('[FDS HeroBanner3D] THREE + OBJLoader necessários');
    return;
  }
  const THREE = global.THREE;
  const gsap  = global.gsap;

  function hexInt(h){ h=(h||'#000').replace('#',''); if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; return parseInt(h.substring(0,6),16)||0; }

  class HeroBanner3D {
    constructor(container, opts) {
      this.container = container;
      this.opts = Object.assign({
        objUrl: container.dataset.obj || '../assets/3d/Fortics.obj',
        color: container.dataset.color || '#FFFFFF',
        accent1: container.dataset.accent1 || '#0066FF',
        accent2: container.dataset.accent2 || '#8B5CF6',
        accent3: container.dataset.accent3 || '#20D78A',
        bg: container.dataset.bg || 'transparent',
        scale: parseFloat(container.dataset.scale) || 1,
        cameraZ: parseFloat(container.dataset.cameraZ) || 5.5,
        fitMode: container.dataset.fitMode || 'contain',           // 'contain' = vê inteiro · 'cover' = preenche
        fitPadding: parseFloat(container.dataset.fitPadding) || 0.78, // % do viewport útil
        layout: container.dataset.layout || 'centered',             // centered | split-right | split-left | above | background
        offsetX: parseFloat(container.dataset.offsetX) || 0,        // deslocamento horizontal do spark (em unidades 3D)
        offsetY: parseFloat(container.dataset.offsetY) || 0,
        rotXInitial: (container.dataset.rotX !== undefined) ? parseFloat(container.dataset.rotX) : -Math.PI / 2,  // -90° padrão (corrige Blender Z-up)
        rotYInitial: parseFloat(container.dataset.rotY) || 0,
        rotZInitial: parseFloat(container.dataset.rotZ) || 0,
        idleMotion: container.dataset.idleMotion || 'float-rotate',  // float-rotate | float | rotate | still
        entryDuration: parseFloat(container.dataset.entryDuration) || 2.2,
        autoplay: container.dataset.autoplay !== 'false',
        onReady: null,
        onEntryComplete: null
      }, opts || {});

      this.scene = null; this.camera = null; this.renderer = null;
      this.obj = null; this.objGroup = null;
      this.lights = {};
      this.clock = new THREE.Clock();
      this.baseScale = 1;
      this.mouseX = 0; this.mouseY = 0;
      this.entryDone = false;
      this.idleStartTime = 0;
      this.objBobPhase = 0;

      // Layer DOM
      this._stage = null;
      this._canvas = null;

      this._tick = this._tick.bind(this);
      this._onResize = this._onResize.bind(this);
    }

    init() {
      this._buildStage();
      this._setupScene();
      this._setupLights();
      this._loadObj();
      this._bindHover();
      window.addEventListener('resize', this._onResize);
      this._tick();
    }

    destroy() {
      window.removeEventListener('resize', this._onResize);
      if (this.renderer) this.renderer.dispose?.();
      if (this._stage) this._stage.remove();
    }

    _buildStage() {
      // Cria <div class="fds-hero3d-stage"> dentro do container, sem mexer no resto
      const stage = document.createElement('div');
      stage.className = 'fds-hero3d-stage';
      // Backdrop com glow tri-color para reforçar efeito vidro
      stage.innerHTML = `
        <div class="fds-hero3d-stage__glow"></div>
        <div class="fds-hero3d-stage__canvas-wrap"></div>
      `;
      this.container.prepend(stage);
      this._stage = stage;
    }

    _setupScene() {
      const wrap = this._stage.querySelector('.fds-hero3d-stage__canvas-wrap');
      const w = wrap.clientWidth || this.container.clientWidth;
      const h = wrap.clientHeight || this.container.clientHeight;

      this.scene  = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      this.camera.position.set(0, 0, this.opts.cameraZ);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = false; // glass não combina com shadow map duro
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this._canvas = this.renderer.domElement;
      wrap.appendChild(this._canvas);

      this.objGroup = new THREE.Group();
      this.scene.add(this.objGroup);
    }

    _setupLights() {
      // Key light branca, suave
      this.lights.key = new THREE.DirectionalLight(0xffffff, 0);
      this.lights.key.position.set(4, 5, 5);
      this.scene.add(this.lights.key);

      // Accent 1 — Núcleo
      this.lights.a1 = new THREE.PointLight(hexInt(this.opts.accent1), 0, 25);
      this.lights.a1.position.set(-3, 2, 3);
      this.scene.add(this.lights.a1);

      // Accent 2 — Violeta
      this.lights.a2 = new THREE.PointLight(hexInt(this.opts.accent2), 0, 25);
      this.lights.a2.position.set(3, -2, 3);
      this.scene.add(this.lights.a2);

      // Accent 3 — Esmeralda (rim)
      this.lights.a3 = new THREE.PointLight(hexInt(this.opts.accent3), 0, 25);
      this.lights.a3.position.set(0, 3, -4);
      this.scene.add(this.lights.a3);

      // Hemi para preenchimento sutil
      this.lights.hemi = new THREE.HemisphereLight(0xffffff, 0x0B1121, 0.0);
      this.scene.add(this.lights.hemi);
    }

    _buildGlassMaterial() {
      // Crystal/Glass: transmissão total + IOR alto + clearcoat
      return new THREE.MeshPhysicalMaterial({
        color: hexInt(this.opts.color),
        metalness: 0,
        roughness: 0.04,
        transmission: 1,
        ior: 1.55,
        thickness: 1.4,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        opacity: 1,
        transparent: true,
        side: THREE.DoubleSide,
        envMapIntensity: 1.2,
        specularIntensity: 1,
        attenuationColor: new THREE.Color(hexInt(this.opts.accent1)),
        attenuationDistance: 2.5
      });
    }

    _loadObj() {
      const loader = new THREE.OBJLoader();
      loader.load(this.opts.objUrl, (loadedObj) => {
        const material = this._buildGlassMaterial();
        const wireMaterial = new THREE.LineBasicMaterial({
          color: hexInt(this.opts.accent1),
          transparent: true, opacity: 0.0   // entrada ramp-up
        });

        loadedObj.traverse(child => {
          if (child.isMesh) {
            child.material = material;
            if (child.geometry?.computeVertexNormals) child.geometry.computeVertexNormals();
            child.castShadow = false;
            child.receiveShadow = false;

            // Overlay sutil de arestas para reforçar contorno do vidro
            const wire = new THREE.LineSegments(
              new THREE.EdgesGeometry(child.geometry, 1),
              wireMaterial.clone()
            );
            wire.name = 'wireOverlay';
            loadedObj.add(wire);
          }
        });

        // centraliza
        const box = new THREE.Box3().setFromObject(loadedObj);
        loadedObj.position.sub(box.getCenter(new THREE.Vector3()));
        const size = box.getSize(new THREE.Vector3());

        // Escala calculada a partir do FOV + camera Z para garantir que o Spark CAIBA inteiro
        const wrap = this._stage.querySelector('.fds-hero3d-stage__canvas-wrap');
        const aspect = wrap.clientWidth / wrap.clientHeight;
        const fovRad = this.camera.fov * Math.PI / 180;
        // altura visível em z=0 (objeto está centralizado em 0,0,0)
        const visibleH = 2 * Math.tan(fovRad / 2) * this.opts.cameraZ;
        const visibleW = visibleH * aspect;
        // Calcula scale para caber pelo eixo MAIS RESTRITIVO (contain)
        const sizeMax = this.opts.fitMode === 'cover'
          ? Math.min(size.x, size.y)
          : Math.max(size.x, size.y);
        const visibleMin = this.opts.fitMode === 'cover'
          ? Math.max(visibleW, visibleH)
          : Math.min(visibleW, visibleH);
        this.baseScale = (visibleMin * this.opts.fitPadding / sizeMax) * this.opts.scale;

        // Aplica deslocamento configurado
        this._targetPosX = this.opts.offsetX;
        this._targetPosY = this.opts.offsetY;
        this._targetRotX = this.opts.rotXInitial;
        this._targetRotY = this.opts.rotYInitial;
        this._targetRotZ = this.opts.rotZInitial;

        loadedObj.scale.setScalar(this.baseScale);

        // estado INICIAL para entrada dramática
        loadedObj.scale.setScalar(0.001);
        loadedObj.rotation.set(this._targetRotX, this._targetRotY - Math.PI * 1.5, this._targetRotZ + Math.PI * 0.5);
        loadedObj.position.y = this._targetPosY - 1.5;
        loadedObj.position.x = this._targetPosX;
        loadedObj.traverse(c => { if (c.isMesh) { c.material.opacity = 0; } });

        this.obj = loadedObj;
        this.objGroup.add(loadedObj);

        this.opts.onReady?.(this);
        if (this.opts.autoplay) {
          // pequeno delay garante que o navegador desenhe o frame inicial transparente
          requestAnimationFrame(() => this.playEntry());
        }
      }, undefined, (err) => {
        console.error('[FDS HeroBanner3D] erro ao carregar OBJ', err);
        this.container.classList.add('is-error');
      });
    }

    playEntry() {
      if (!this.obj || !gsap) return;
      this.entryDone = false;
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          this.entryDone = true;
          this.idleStartTime = this.clock.getElapsedTime();
          this.opts.onEntryComplete?.(this);
          this.container.classList.add('is-entry-done');
        }
      });

      const target = { s: this.baseScale };
      const dur = this.opts.entryDuration;

      // 1) Glow do palco
      tl.fromTo(this._stage.querySelector('.fds-hero3d-stage__glow'),
        { opacity: 0 }, { opacity: 1, duration: dur * 0.4, ease: 'power2.out' }, 0
      );

      // 2) Lights ramp-up (de fade-in até picos para "burst")
      tl.to(this.lights.key,  { intensity: 0.9, duration: dur * 0.7 }, 0.1);
      tl.to(this.lights.a1,   { intensity: 4.2, duration: dur * 0.7 }, 0.1);
      tl.to(this.lights.a2,   { intensity: 3.5, duration: dur * 0.7 }, 0.2);
      tl.to(this.lights.a3,   { intensity: 5.5, duration: dur * 0.7 }, 0.3);
      tl.to(this.lights.hemi, { intensity: 0.35, duration: dur * 0.7 }, 0.2);

      // Pico de glow seguido de assentamento (efeito de "ignição")
      tl.to(this.lights.a1, { intensity: 8.0, duration: dur * 0.18 }, dur * 0.55);
      tl.to(this.lights.a1, { intensity: 2.2, duration: dur * 0.35, ease: 'power2.inOut' }, dur * 0.73);
      tl.to(this.lights.a2, { intensity: 7.0, duration: dur * 0.18 }, dur * 0.55);
      tl.to(this.lights.a2, { intensity: 2.0, duration: dur * 0.35, ease: 'power2.inOut' }, dur * 0.73);
      tl.to(this.lights.a3, { intensity: 9.5, duration: dur * 0.18 }, dur * 0.55);
      tl.to(this.lights.a3, { intensity: 3.0, duration: dur * 0.35, ease: 'power2.inOut' }, dur * 0.73);

      // 3) Material opacity ramp
      this.obj.traverse(c => {
        if (c.isMesh) {
          tl.to(c.material, { opacity: 1, duration: dur * 0.6, ease: 'power2.out' }, 0.3);
        }
        if (c.name === 'wireOverlay') {
          tl.to(c.material, { opacity: 0.35, duration: dur * 0.5 }, dur * 0.35);
          tl.to(c.material, { opacity: 0.08, duration: dur * 0.4, ease: 'power2.inOut' }, dur * 0.85);
        }
      });

      // 4) Spark — scale 0 → overshoot → settle
      tl.to(target, {
        s: this.baseScale * 1.18,
        duration: dur * 0.55,
        ease: 'back.out(1.6)',
        onUpdate: () => this.obj.scale.setScalar(target.s)
      }, 0.05);
      tl.to(target, {
        s: this.baseScale,
        duration: dur * 0.45,
        ease: 'power2.inOut',
        onUpdate: () => this.obj.scale.setScalar(target.s)
      }, dur * 0.55);

      // 5) Rotação — spin dramático até a pose final configurada
      tl.to(this.obj.rotation, {
        x: this._targetRotX,
        y: this._targetRotY,
        z: this._targetRotZ,
        duration: dur * 0.9,
        ease: 'expo.out'
      }, 0);

      // 6) Posição — vem de baixo até o offset configurado
      tl.to(this.obj.position, {
        x: this._targetPosX,
        y: this._targetPosY,
        duration: dur * 0.7,
        ease: 'back.out(1.3)'
      }, 0.1);

      this._entryTL = tl;
      return tl;
    }

    _bindHover() {
      this.container.addEventListener('mousemove', (e) => {
        const r = this.container.getBoundingClientRect();
        this.mouseX = ((e.clientX - r.left) / r.width)  * 2 - 1;
        this.mouseY = -((e.clientY - r.top)  / r.height) * 2 + 1;
      });
      this.container.addEventListener('mouseleave', () => { this.mouseX = 0; this.mouseY = 0; });
    }

    _tick() {
      requestAnimationFrame(this._tick);
      const t = this.clock.getElapsedTime();

      if (this.obj && this.entryDone) {
        const idleT = t - this.idleStartTime;
        const mode = this.opts.idleMotion;
        const baseX = this._targetPosX, baseY = this._targetPosY;
        const rX = this._targetRotX, rY = this._targetRotY, rZ = this._targetRotZ;

        // 1) bob vertical leve em torno da posição alvo
        this.obj.position.x = baseX;
        this.obj.position.y = baseY + (mode === 'still' ? 0 : Math.sin(idleT * 0.9) * 0.07);

        // 2) rotação leve em Y constante (acumula sobre a pose final)
        if (mode === 'float-rotate' || mode === 'rotate') {
          this.obj.rotation.y = rY + idleT * 0.18;
        } else {
          this.obj.rotation.y = rY;
        }
        // 3) wobble suave em X + parallax do cursor
        this.obj.rotation.x = rX + (mode === 'still' ? 0 : Math.sin(idleT * 0.6) * 0.06) + this.mouseY * 0.12;
        // 4) tilt em Z seguindo mouse
        this.obj.rotation.z = rZ + this.mouseX * 0.06;

        // luz a2 órbita lenta — reforça "vidro vivo"
        this.lights.a2.position.x = Math.cos(idleT * 0.4) * 3;
        this.lights.a2.position.z = Math.sin(idleT * 0.4) * 3 + 1;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    _onResize() {
      const wrap = this._stage.querySelector('.fds-hero3d-stage__canvas-wrap');
      const w = wrap.clientWidth, h = wrap.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  }

  // Auto-init em containers com data-fds-hero-banner-3d
  function autoInit() {
    document.querySelectorAll('[data-fds-hero-banner-3d]').forEach(el => {
      if (el.dataset.fdsInit === '1') return;
      el.dataset.fdsInit = '1';
      const inst = new HeroBanner3D(el);
      inst.init();
      el.__fdsHeroBanner3D = inst;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  global.FDS = global.FDS || {};
  global.FDS.HeroBanner3D = HeroBanner3D;
})(window);
