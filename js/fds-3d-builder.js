/* ============================================================
   FORTICS DS — 3D BUILDER
   Three.js OBJ builder com material/lighting/motion/hover.
   Inspirado no 8DH 3D Lab, adaptado para o brandbook Fortics.

   Requer: THREE (r128), THREE.OBJLoader, Motion One
   Carrega: assets/3d/Fortics.obj
   ============================================================ */

(function (global) {
  'use strict';
  if (!global.THREE || !global.THREE.OBJLoader) {
    console.error('[FDS 3D] THREE.js + OBJLoader são obrigatórios');
    return;
  }
  const THREE = global.THREE;
  const gsap  = global.gsap;

  /* ----- helpers ----- */
  function hexToInt(hex){ if(!hex)return 0; let h=hex.replace('#',''); if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; return parseInt(h.substring(0,6),16)||0; }
  function fmtHex(hex){ if(!hex)return '000000'; let h=hex.replace('#',''); if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; return h.substring(0,6).toLowerCase(); }

  /* ----- Environment Map procedural — gera reflexos físicos no vidro ----- */
  function makeEnvironment(renderer, accents) {
    // Cria uma cena procedural pequena com luzes coloridas e usa PMREM para
    // gerar um envMap "studio" — bom para refletir nos materiais.
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0B1121);

    // 6 luzes esféricas grandes (uma por face) que servem como "highlights" no vidro
    const faces = [
      { pos: [ 0,  5, 0], color: 0xFFFFFF, size: 2.6 },        // teto
      { pos: [ 0, -3, 0], color: 0x0B1121, size: 5 },           // chão
      { pos: [ 5,  0, 0], color: hexToInt(accents.a1), size: 2.4 },
      { pos: [-5,  0, 0], color: hexToInt(accents.a2), size: 2.4 },
      { pos: [ 0,  0,  5], color: hexToInt(accents.a3), size: 2.0 },
      { pos: [ 0,  0, -5], color: hexToInt(accents.a1), size: 2.0 }
    ];
    faces.forEach(f => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(f.size, 18, 18),
        new THREE.MeshBasicMaterial({ color: f.color })
      );
      m.position.set(f.pos[0], f.pos[1], f.pos[2]);
      envScene.add(m);
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromScene(envScene, 0.02).texture;
    pmrem.dispose();
    return envMap;
  }

  /* ----- PRESETS Fortics (brand-tuned) ----- */
  const PRESETS = {
    nucleo: {
      label: 'Núcleo', dot: '#0066FF',
      material: { color: '#0066FF', metalness: 0.15, roughness: 0.45, transmission: 0, ior: 1.5, thickness: 0, clearcoat: 0.2, opacity: 1, emissive: '#000000', emissiveIntensity: 0, wireframe: false },
      wire:     { visible: false, color: '#0066FF', opacity: 0.2 },
      lights:   { l1Color: '#FFFFFF', l1Intensity: 1.6, l1PosX: 5, l1PosY: 5, l1PosZ: 5, l1Point: false, l1CastShadow: true,
                  l2Color: '#0033AA', l2Intensity: 2.0, l2Orbit: false, l2PosX: -5, l2PosY: -3, l2PosZ: 2, l2Point: false, l2CastShadow: false,
                  l3Color: '#6FA8FF', l3Intensity: 1.4, l3PosX: -2, l3PosY: 3, l3PosZ: -5, l3Point: false,
                  hemiSky: '#FFFFFF', hemiGround: '#0B1121', hemiIntensity: 0.4 },
      motion:   { type: 'float', speed: 1, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'magnetic', intensity: 1 },
      bg:       { color: '#0B1121', grid: false, shadows: true, shadowRadius: 4, shadowBias: -0.001 }
    },
    violeta: {
      label: 'Violeta', dot: '#8B5CF6',
      material: { color: '#8B5CF6', metalness: 0.5, roughness: 0.25, transmission: 0, ior: 1.5, thickness: 0, clearcoat: 1.0, opacity: 1, emissive: '#3B22D4', emissiveIntensity: 0.15, wireframe: false },
      wire:     { visible: false, color: '#8B5CF6', opacity: 0.2 },
      lights:   { l1Color: '#8B5CF6', l1Intensity: 4, l1PosX: 3, l1PosY: 4, l1PosZ: 3, l1Point: true, l1CastShadow: false,
                  l2Color: '#0066FF', l2Intensity: 3, l2Orbit: true, l2PosX: -3, l2PosY: -2, l2PosZ: 2, l2Point: true, l2CastShadow: false,
                  l3Color: '#FFFFFF', l3Intensity: 1.0, l3PosX: 0, l3PosY: 3, l3PosZ: -5, l3Point: false,
                  hemiSky: '#8B5CF6', hemiGround: '#0B1121', hemiIntensity: 0.4 },
      motion:   { type: 'spin', speed: 1, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'tilt', intensity: 1 },
      bg:       { color: '#0B1121', grid: false, shadows: false, shadowRadius: 4, shadowBias: -0.001 }
    },
    esmeralda: {
      label: 'Esmeralda', dot: '#20D78A',
      material: { color: '#20D78A', metalness: 0.05, roughness: 0.35, transmission: 0, ior: 1.5, thickness: 0, clearcoat: 0.3, opacity: 1, emissive: '#20D78A', emissiveIntensity: 0.2, wireframe: false },
      wire:     { visible: false, color: '#20D78A', opacity: 0.2 },
      lights:   { l1Color: '#20D78A', l1Intensity: 4, l1PosX: -4, l1PosY: 4, l1PosZ: 3, l1Point: false, l1CastShadow: true,
                  l2Color: '#0066FF', l2Intensity: 2, l2Orbit: false, l2PosX: 4, l2PosY: -3, l2PosZ: 2, l2Point: false, l2CastShadow: false,
                  l3Color: '#FFFFFF', l3Intensity: 1.2, l3PosX: 0, l3PosY: -3, l3PosZ: -4, l3Point: true,
                  hemiSky: '#20D78A', hemiGround: '#0B1121', hemiIntensity: 0.35 },
      motion:   { type: 'breathe', speed: 1, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'glow', intensity: 1.5 },
      bg:       { color: '#0B1121', grid: false, shadows: true, shadowRadius: 6, shadowBias: -0.001 }
    },
    marinho: {
      label: 'Marinho', dot: '#0B1121',
      material: { color: '#1A2238', metalness: 0.9, roughness: 0.15, transmission: 0, ior: 1.5, thickness: 0, clearcoat: 0.8, opacity: 1, emissive: '#000000', emissiveIntensity: 0, wireframe: false },
      wire:     { visible: false, color: '#0066FF', opacity: 0.2 },
      lights:   { l1Color: '#FFFFFF', l1Intensity: 2.5, l1PosX: 5, l1PosY: 5, l1PosZ: 5, l1Point: false, l1CastShadow: true,
                  l2Color: '#0066FF', l2Intensity: 3, l2Orbit: false, l2PosX: -4, l2PosY: -3, l2PosZ: 2, l2Point: false, l2CastShadow: false,
                  l3Color: '#8B5CF6', l3Intensity: 1.8, l3PosX: 0, l3PosY: 3, l3PosZ: -5, l3Point: false,
                  hemiSky: '#FFFFFF', hemiGround: '#000000', hemiIntensity: 0.3 },
      motion:   { type: 'float', speed: 0.7, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'magnetic', intensity: 1 },
      bg:       { color: '#FFFFFF', grid: false, shadows: true, shadowRadius: 4, shadowBias: -0.001 }
    },
    wireframe: {
      label: 'Wireframe', dot: '#0066FF',
      material: { color: '#0066FF', metalness: 0, roughness: 0.5, transmission: 0, ior: 1.5, thickness: 0, clearcoat: 0, opacity: 0.9, emissive: '#000000', emissiveIntensity: 0, wireframe: true },
      wire:     { visible: false, color: '#0066FF', opacity: 0.3 },
      lights:   { l1Color: '#0066FF', l1Intensity: 4, l1PosX: 3, l1PosY: 3, l1PosZ: 3, l1Point: false, l1CastShadow: false,
                  l2Color: '#8B5CF6', l2Intensity: 4, l2Orbit: true, l2PosX: -3, l2PosY: -2, l2PosZ: 2, l2Point: false, l2CastShadow: false,
                  l3Color: '#20D78A', l3Intensity: 0, l3PosX: 0, l3PosY: 3, l3PosZ: -4, l3Point: true,
                  hemiSky: '#FFFFFF', hemiGround: '#1A2238', hemiIntensity: 0.5 },
      motion:   { type: 'spin', speed: 1.2, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'magnetic', intensity: 1 },
      bg:       { color: '#06091A', grid: true, shadows: false, shadowRadius: 4, shadowBias: -0.001 }
    },
    holo: {
      label: 'Holo IA', dot: '#8B5CF6',
      material: { color: '#0066FF', metalness: 0.3, roughness: 0.3, transmission: 0.6, ior: 1.4, thickness: 1.2, clearcoat: 0.5, opacity: 0.85, emissive: '#8B5CF6', emissiveIntensity: 0.5, wireframe: false },
      wire:     { visible: true, color: '#20D78A', opacity: 0.3 },
      lights:   { l1Color: '#0066FF', l1Intensity: 5, l1PosX: 3, l1PosY: 3, l1PosZ: 3, l1Point: false, l1CastShadow: false,
                  l2Color: '#8B5CF6', l2Intensity: 4, l2Orbit: true, l2PosX: -3, l2PosY: -2, l2PosZ: 2, l2Point: false, l2CastShadow: false,
                  l3Color: '#20D78A', l3Intensity: 5, l3PosX: 0, l3PosY: 0, l3PosZ: -4, l3Point: true,
                  hemiSky: '#FFFFFF', hemiGround: '#1A2238', hemiIntensity: 0.6 },
      motion:   { type: 'glitch', speed: 1, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'glow', intensity: 1.8 },
      bg:       { color: '#000019', grid: false, shadows: false, shadowRadius: 4, shadowBias: -0.001 }
    },
    glass: {
      label: 'Glass', dot: '#80B3FF',
      material: { color: '#FFFFFF', metalness: 0, roughness: 0.04, transmission: 1.0, ior: 1.55, thickness: 1.4, clearcoat: 1, opacity: 1, emissive: '#000000', emissiveIntensity: 0, wireframe: false },
      wire:     { visible: false, color: '#0066FF', opacity: 0.1 },
      lights:   { l1Color: '#FFFFFF', l1Intensity: 1.2, l1PosX: 4, l1PosY: 5, l1PosZ: 5, l1Point: false, l1CastShadow: false,
                  l2Color: '#0066FF', l2Intensity: 3.2, l2Orbit: true, l2PosX: -3, l2PosY: -2, l2PosZ: 3, l2Point: true, l2CastShadow: false,
                  l3Color: '#8B5CF6', l3Intensity: 4.5, l3PosX: 0, l3PosY: 2, l3PosZ: -5, l3Point: true,
                  hemiSky: '#FFFFFF', hemiGround: '#0B1121', hemiIntensity: 0.35 },
      motion:   { type: 'float', speed: 0.6, customSpinX: 0, customSpinY: 0.2, customSpinZ: 0, customWobbleX: 0.1, customWobbleY: 0.05, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'magnetic', intensity: 1 },
      bg:       { color: '#0B1121', grid: false, shadows: false, shadowRadius: 4, shadowBias: -0.001, envMap: true }
    },
    crystal: {
      label: 'Crystal', dot: '#FFFFFF',
      material: { color: '#FFFFFF', metalness: 0, roughness: 0, transmission: 1, ior: 2.3, thickness: 1.5, clearcoat: 1, opacity: 1, emissive: '#000000', emissiveIntensity: 0, wireframe: false },
      wire:     { visible: false, color: '#FFFFFF', opacity: 0.15 },
      lights:   { l1Color: '#FFFFFF', l1Intensity: 6, l1PosX: 3, l1PosY: 3, l1PosZ: 3, l1Point: true, l1CastShadow: false,
                  l2Color: '#0066FF', l2Intensity: 5, l2Orbit: true, l2PosX: -2, l2PosY: -2, l2PosZ: 1, l2Point: true, l2CastShadow: false,
                  l3Color: '#8B5CF6', l3Intensity: 6, l3PosX: 0, l3PosY: 4, l3PosZ: -3, l3Point: true,
                  hemiSky: '#FFFFFF', hemiGround: '#0B1121', hemiIntensity: 0.6 },
      motion:   { type: 'orbit', speed: 0.6, customSpinX: 0, customSpinY: 1, customSpinZ: 0, customWobbleX: 0, customWobbleY: 0.5, customWobbleZ: 0, customPulse: 0 },
      hover:    { type: 'tilt', intensity: 1 },
      bg:       { color: '#0B1121', grid: true, shadows: false, shadowRadius: 4, shadowBias: -0.001, envMap: true }
    }
  };

  // Garante que todos os presets tenham envMap definido (default false)
  Object.values(PRESETS).forEach(p => { if (p.bg.envMap === undefined) p.bg.envMap = false; });

  /* ============================================================
     BUILDER class
     ============================================================ */
  class Builder3D {
    constructor(opts) {
      this.opts = Object.assign({
        viewport:   document.getElementById('viewport'),
        panel:      document.getElementById('panel'),
        loading:    document.getElementById('loading'),
        objUrl:     '../assets/3d/Fortics.obj',
        initialPreset: 'nucleo'
      }, opts || {});
      this.config = JSON.parse(JSON.stringify(PRESETS[this.opts.initialPreset]));
      // rotX = -90° por padrão: corrige orientação Blender (Z-up) → Three.js (Y-up)
      this.config.transform = { posX: 0, posY: 0, posZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1, rotX: -90, rotY: 0, rotZ: 0 };
      this.config.camera = { distance: 4.5 };

      this.baseScale = 1;
      this.mouseX = 0; this.mouseY = 0;

      this.scene = null; this.camera = null; this.renderer = null;
      this.objGroup = null; this.mesh = null;
      this.light1 = null; this.light2 = null; this.light3 = null; this.ambient = null;
      this.grid = null;
      this.clock = new THREE.Clock();
      this.codeBlockEl = null;
    }

    init() {
      this._setupScene();
      this._setupLights();
      this._loadObj();
      this._bindHover();
      this._tick = this._tick.bind(this);
      window.addEventListener('resize', () => this._onResize());
      this._tick();
    }

    _setupScene() {
      const vp = this.opts.viewport;
      const w = vp.clientWidth, h = vp.clientHeight;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      this.camera.position.set(0, 0, this.config.camera.distance);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = this.config.bg.shadows;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      vp.appendChild(this.renderer.domElement);

      // Aplica env map se ativado no preset inicial
      this._refreshEnvMap();

      // Grid helper
      this.grid = new THREE.GridHelper(20, 20, 0x0066FF, 0x1A2238);
      this.grid.material.opacity = 0.18;
      this.grid.material.transparent = true;
      this.grid.position.y = -1.5;
      this.grid.visible = this.config.bg.grid;
      this.scene.add(this.grid);

      this.objGroup = new THREE.Group();
      this.scene.add(this.objGroup);
    }

    _setupLights() {
      this._applyLights();
    }

    _refreshEnvMap() {
      if (!this.renderer) return;
      if (this.config.bg.envMap) {
        this.scene.environment = makeEnvironment(this.renderer, {
          a1: this.config.lights.l1Color,
          a2: this.config.lights.l2Color,
          a3: this.config.lights.l3Color
        });
      } else if (this.scene.environment) {
        this.scene.environment.dispose?.();
        this.scene.environment = null;
      }
      // Força rebuild do material para aplicar envMap intensity
      if (this.mesh) this._applyMaterial();
    }

    _applyLights() {
      const c = this.config;
      [this.light1, this.light2, this.light3, this.ambient].forEach(l => l && this.scene.remove(l));

      this.light1 = c.lights.l1Point
        ? new THREE.PointLight(hexToInt(c.lights.l1Color), c.lights.l1Intensity, 20)
        : new THREE.DirectionalLight(hexToInt(c.lights.l1Color), c.lights.l1Intensity);
      this.light1.position.set(c.lights.l1PosX, c.lights.l1PosY, c.lights.l1PosZ);
      if (c.bg.shadows && c.lights.l1CastShadow) {
        this.light1.castShadow = true;
        this.light1.shadow.mapSize.set(1024, 1024);
        this.light1.shadow.bias = c.bg.shadowBias;
        if (this.light1.shadow.radius !== undefined) this.light1.shadow.radius = c.bg.shadowRadius;
      }
      this.scene.add(this.light1);

      this.light2 = c.lights.l2Point
        ? new THREE.PointLight(hexToInt(c.lights.l2Color), c.lights.l2Intensity, 20)
        : new THREE.DirectionalLight(hexToInt(c.lights.l2Color), c.lights.l2Intensity);
      if (!c.lights.l2Orbit) this.light2.position.set(c.lights.l2PosX, c.lights.l2PosY, c.lights.l2PosZ);
      this.scene.add(this.light2);

      this.light3 = c.lights.l3Point
        ? new THREE.PointLight(hexToInt(c.lights.l3Color), c.lights.l3Intensity, 20)
        : new THREE.DirectionalLight(hexToInt(c.lights.l3Color), c.lights.l3Intensity);
      this.light3.position.set(c.lights.l3PosX, c.lights.l3PosY, c.lights.l3PosZ);
      this.scene.add(this.light3);

      this.ambient = new THREE.HemisphereLight(
        hexToInt(c.lights.hemiSky), hexToInt(c.lights.hemiGround), c.lights.hemiIntensity
      );
      this.scene.add(this.ambient);
    }

    _buildMaterial() {
      const m = this.config.material;
      if (m.wireframe) {
        return new THREE.MeshBasicMaterial({
          color: hexToInt(m.color), wireframe: true,
          transparent: m.opacity < 1, opacity: m.opacity
        });
      }
      return new THREE.MeshPhysicalMaterial({
        color: hexToInt(m.color),
        metalness: m.metalness, roughness: m.roughness,
        transmission: m.transmission, ior: m.ior, thickness: m.thickness,
        clearcoat: m.clearcoat, clearcoatRoughness: 0.08,
        opacity: m.opacity, transparent: m.opacity < 1 || m.transmission > 0,
        emissive: hexToInt(m.emissive), emissiveIntensity: m.emissiveIntensity,
        envMapIntensity: this.config.bg.envMap ? 1.5 : 1.0,
        side: m.transmission > 0 ? THREE.DoubleSide : THREE.FrontSide,
        specularIntensity: 1
      });
    }

    _loadObj() {
      const loader = new THREE.OBJLoader();
      loader.load(this.opts.objUrl, (loadedObj) => {
        this.mesh = loadedObj;
        const material = this._buildMaterial();
        loadedObj.traverse(child => {
          if (child.isMesh) {
            child.material = material;
            if (child.geometry && child.geometry.computeVertexNormals) child.geometry.computeVertexNormals();
            child.castShadow = this.config.bg.shadows;
            child.receiveShadow = this.config.bg.shadows;
            // wireframe overlay
            const wireMat = new THREE.LineBasicMaterial({
              color: hexToInt(this.config.wire.color),
              transparent: true, opacity: this.config.wire.opacity
            });
            const wire = new THREE.LineSegments(new THREE.EdgesGeometry(child.geometry), wireMat);
            wire.visible = this.config.wire.visible && !this.config.material.wireframe;
            wire.name = 'wireOverlay';
            loadedObj.add(wire);
          }
        });
        const box = new THREE.Box3().setFromObject(loadedObj);
        const center = box.getCenter(new THREE.Vector3());
        loadedObj.position.sub(center);
        this.baseScale = 3.6 / box.getSize(new THREE.Vector3()).length();
        loadedObj.scale.setScalar(this.baseScale);
        this.objGroup.add(loadedObj);
        this._hideLoading();
      }, undefined, (err) => {
        console.error('[FDS 3D] Falha ao carregar OBJ', err);
        if (this.opts.loading) this.opts.loading.textContent = 'Falha ao carregar 3D';
      });
    }

    _hideLoading() {
      if (this.opts.loading) this.opts.loading.classList.add('is-hidden');
    }

    _bindHover() {
      const vp = this.opts.viewport;
      vp.addEventListener('mousemove', (e) => {
        const r = vp.getBoundingClientRect();
        this.mouseX = ((e.clientX - r.left) / r.width)  * 2 - 1;
        this.mouseY = -((e.clientY - r.top)  / r.height) * 2 + 1;
      });
      vp.addEventListener('mouseleave', () => { this.mouseX = 0; this.mouseY = 0; });
    }

    _tick() {
      requestAnimationFrame(this._tick);
      const t = this.clock.getElapsedTime();
      const c = this.config;
      const tr = c.transform;
      const sp = c.motion.speed;
      const rX = tr.rotX * Math.PI / 180;
      const rY = tr.rotY * Math.PI / 180;
      const rZ = tr.rotZ * Math.PI / 180;

      // L2 orbit
      if (c.lights.l2Orbit && this.light2) {
        this.light2.position.x = Math.cos(t) * 2;
        this.light2.position.z = Math.sin(t) * 2 - 2;
      }

      if (this.mesh) {
        this.mesh.position.set(tr.posX, tr.posY, tr.posZ);
        this.mesh.rotation.set(rX, rY, rZ);
        this.mesh.scale.setScalar(this.baseScale);

        // motion
        switch (c.motion.type) {
          case 'float':
            this.mesh.rotation.y = rY + t * 0.3 * sp;
            this.mesh.position.y = tr.posY + Math.sin(t * 2 * sp) * 0.1;
            break;
          case 'spin':
            this.mesh.rotation.y = rY + t * 0.72 * sp;
            break;
          case 'breathe': {
            const s = 1 + Math.sin(t * 3 * sp) * 0.05;
            this.mesh.scale.setScalar(this.baseScale * s);
            this.mesh.rotation.y = rY + t * 0.12 * sp;
            break;
          }
          case 'pendulum':
            this.mesh.rotation.z = rZ + Math.sin(t * 1.5 * sp) * 0.4;
            this.mesh.position.x = tr.posX + Math.sin(t * 1.5 * sp) * 0.3;
            break;
          case 'quake':
            this.mesh.position.x = tr.posX + (Math.random() - .5) * 0.05;
            this.mesh.position.y = tr.posY + (Math.random() - .5) * 0.05;
            this.mesh.rotation.z = rZ + (Math.random() - .5) * 0.02;
            break;
          case 'glitch':
            if (Math.random() > 0.95) {
              this.mesh.position.x = tr.posX + (Math.random() - 0.5) * 0.5 * sp;
              this.mesh.position.y = tr.posY + (Math.random() - 0.5) * 0.5 * sp;
              this.mesh.rotation.z = rZ + (Math.random() - 0.5) * 0.5 * sp;
              this.mesh.scale.setScalar(this.baseScale * (1 + (Math.random() - 0.5) * 0.5));
            }
            this.mesh.rotation.y = rY + t * 0.2 * sp;
            break;
          case 'orbit':
            this.mesh.position.x = tr.posX + Math.cos(t * sp) * 2;
            this.mesh.position.z = tr.posZ + Math.sin(t * sp) * 2;
            this.mesh.rotation.y = rY + t * sp;
            break;
          case 'custom':
            this.mesh.rotation.x = rX + t * c.motion.customSpinX * sp + Math.sin(t * sp) * c.motion.customWobbleX;
            this.mesh.rotation.y = rY + t * c.motion.customSpinY * sp + Math.sin(t * 1.3 * sp) * c.motion.customWobbleY;
            this.mesh.rotation.z = rZ + t * c.motion.customSpinZ * sp + Math.sin(t * 1.7 * sp) * c.motion.customWobbleZ;
            this.mesh.scale.setScalar(this.baseScale * (1 + Math.sin(t * 2 * sp) * c.motion.customPulse));
            break;
          case 'none':
          default:
            break;
        }

        // hover
        const intensity = c.hover.intensity;
        switch (c.hover.type) {
          case 'magnetic':
            this.light1.position.x += (this.mouseX * 3 - this.light1.position.x) * 0.05 * intensity;
            this.light1.position.y += (this.mouseY * 3 - this.light1.position.y) * 0.05 * intensity;
            this.mesh.rotation.x = rX + this.mouseY * 0.2 * intensity;
            if (c.motion.type === 'none' || c.motion.type === 'spin') {
              this.mesh.rotation.y = rY + this.mouseX * 0.4 * intensity;
            }
            break;
          case 'tilt':
            this.mesh.rotation.x += ((rX + this.mouseY * 0.4 * intensity) - this.mesh.rotation.x) * 0.08;
            if (c.motion.type === 'none') {
              this.mesh.rotation.y += ((rY + this.mouseX * 0.4 * intensity) - this.mesh.rotation.y) * 0.08;
            }
            break;
          // zoom & glow — bind enter/leave separately
        }

        // Apply scale multiplier
        const sx = this.mesh.scale.x * tr.scaleX;
        const sy = this.mesh.scale.y * tr.scaleY;
        const sz = this.mesh.scale.z * tr.scaleZ;
        this.mesh.scale.set(sx, sy, sz);
      }

      this.renderer.render(this.scene, this.camera);
    }

    _onResize() {
      const vp = this.opts.viewport;
      const w = vp.clientWidth, h = vp.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    /* ----- update functions called pelo painel ----- */

    setPreset(name) {
      if (!PRESETS[name]) return;
      const transform = this.config.transform;
      const camera = this.config.camera;
      this.config = JSON.parse(JSON.stringify(PRESETS[name]));
      this.config.transform = transform;
      this.config.camera = camera;
      this._applyAll();
    }

    update(path, value) {
      // path: 'material.color' etc
      const parts = path.split('.');
      let obj = this.config;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      this._applyFor(path);
    }

    _applyFor(path) {
      if (path.startsWith('material.') || path === 'wire.visible' || path === 'wire.color' || path === 'wire.opacity') {
        this._applyMaterial();
      } else if (path.startsWith('lights.') || path.startsWith('bg.')) {
        this._applyLights();
        if (this.mesh && path.startsWith('bg.')) {
          this.mesh.traverse(c => { if (c.isMesh) { c.castShadow = this.config.bg.shadows; c.receiveShadow = this.config.bg.shadows; } });
          this.renderer.shadowMap.enabled = this.config.bg.shadows;
          if (this.grid) this.grid.visible = this.config.bg.grid;
          this.opts.viewport.style.background =
            `radial-gradient(circle at 50% 50%, rgba(0,102,255,0.10), transparent 70%), ${this.config.bg.color}`;
        }
        if (path === 'bg.envMap' || path.startsWith('lights.l1Color') || path.startsWith('lights.l2Color') || path.startsWith('lights.l3Color')) {
          this._refreshEnvMap();
        }
      } else if (path === 'camera.distance') {
        this.camera.position.z = this.config.camera.distance;
      }
    }

    _applyMaterial() {
      if (!this.mesh) return;
      const material = this._buildMaterial();
      this.mesh.traverse(c => {
        if (c.type === 'LineSegments') {
          c.visible = this.config.wire.visible && !this.config.material.wireframe;
          c.material.color.setHex(hexToInt(this.config.wire.color));
          c.material.opacity = this.config.wire.opacity;
        } else if (c.isMesh) {
          c.material = material;
        }
      });
    }

    _applyAll() {
      this._refreshEnvMap();
      this._applyMaterial();
      this._applyLights();
      if (this.mesh) {
        this.mesh.traverse(c => { if (c.isMesh) { c.castShadow = this.config.bg.shadows; c.receiveShadow = this.config.bg.shadows; } });
      }
      this.renderer.shadowMap.enabled = this.config.bg.shadows;
      if (this.grid) this.grid.visible = this.config.bg.grid;
      this.opts.viewport.style.background =
        `radial-gradient(circle at 50% 50%, rgba(0,102,255,0.10), transparent 70%), ${this.config.bg.color}`;
      this.camera.position.z = this.config.camera.distance;
    }

    /* ----- export ----- */
    exportConfig() {
      return JSON.stringify(this.config, null, 2);
    }

    exportCode() {
      const c = this.config;
      const m = c.material;
      const rX = (c.transform.rotX * Math.PI / 180).toFixed(3);
      const rY = (c.transform.rotY * Math.PI / 180).toFixed(3);
      const rZ = (c.transform.rotZ * Math.PI / 180).toFixed(3);
      const mc = fmtHex(m.color), em = fmtHex(m.emissive);
      const l1 = fmtHex(c.lights.l1Color), l2 = fmtHex(c.lights.l2Color), l3 = fmtHex(c.lights.l3Color);
      const hs = fmtHex(c.lights.hemiSky), hg = fmtHex(c.lights.hemiGround);

      const matBlock = m.wireframe
        ? `const material = new THREE.MeshBasicMaterial({
  color: 0x${mc}, wireframe: true,
  transparent: ${m.opacity < 1}, opacity: ${m.opacity}
});`
        : `const material = new THREE.MeshPhysicalMaterial({
  color: 0x${mc},
  metalness: ${m.metalness}, roughness: ${m.roughness},
  transmission: ${m.transmission}, ior: ${m.ior}, thickness: ${m.thickness},
  clearcoat: ${m.clearcoat}, opacity: ${m.opacity},
  transparent: ${m.opacity < 1 || m.transmission > 0},
  emissive: 0x${em}, emissiveIntensity: ${m.emissiveIntensity}
});`;

      const motion = {
        float:    `obj.rotation.y = ${rY} + t * 0.3 * speed;\n    obj.position.y = ${c.transform.posY} + Math.sin(t * 2 * speed) * 0.1;`,
        spin:     `obj.rotation.y = ${rY} + t * 0.72 * speed;`,
        breathe:  `const s = 1 + Math.sin(t * 3 * speed) * 0.05;\n    obj.scale.setScalar(baseScale * s);\n    obj.rotation.y = ${rY} + t * 0.12 * speed;`,
        pendulum: `obj.rotation.z = ${rZ} + Math.sin(t * 1.5 * speed) * 0.4;\n    obj.position.x = ${c.transform.posX} + Math.sin(t * 1.5 * speed) * 0.3;`,
        quake:    `obj.position.x = ${c.transform.posX} + (Math.random()-.5)*.05;\n    obj.position.y = ${c.transform.posY} + (Math.random()-.5)*.05;`,
        glitch:   `if (Math.random() > 0.95) {\n      obj.position.x = ${c.transform.posX} + (Math.random()-0.5)*0.5*speed;\n      obj.position.y = ${c.transform.posY} + (Math.random()-0.5)*0.5*speed;\n    }\n    obj.rotation.y = ${rY} + t * 0.2 * speed;`,
        orbit:    `obj.position.x = ${c.transform.posX} + Math.cos(t * speed) * 2;\n    obj.position.z = ${c.transform.posZ} + Math.sin(t * speed) * 2;\n    obj.rotation.y = ${rY} + t * speed;`,
        custom:   `obj.rotation.y = ${rY} + t * ${c.motion.customSpinY} * speed;`,
        none:     `// sem motion`
      }[c.motion.type];

      return `// ═══ Fortics 3D — config exportada (preset: ${this._getPresetName()}) ═══
// Requer: THREE r128 + OBJLoader + GSAP

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.z = ${c.camera.distance};

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = ${c.bg.shadows};
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ── MATERIAL ──
${matBlock}

// ── OBJ ──
let obj = new THREE.Group();
let baseScale = 1;
const loader = new THREE.OBJLoader();
loader.load('Fortics.obj', (loaded) => {
  loaded.traverse(c => {
    if (c.isMesh) {
      c.material = material;
      c.castShadow = ${c.bg.shadows};
      c.receiveShadow = ${c.bg.shadows};
    }
  });
  const box = new THREE.Box3().setFromObject(loaded);
  loaded.position.sub(box.getCenter(new THREE.Vector3()));
  baseScale = 3.6 / box.getSize(new THREE.Vector3()).length();
  loaded.scale.setScalar(baseScale);
  obj = loaded;
  scene.add(obj);
});

// ── LIGHTS ──
const light1 = ${c.lights.l1Point ? `new THREE.PointLight(0x${l1}, ${c.lights.l1Intensity}, 20)` : `new THREE.DirectionalLight(0x${l1}, ${c.lights.l1Intensity})`};
light1.position.set(${c.lights.l1PosX}, ${c.lights.l1PosY}, ${c.lights.l1PosZ});
light1.castShadow = ${c.bg.shadows && c.lights.l1CastShadow};
const light2 = ${c.lights.l2Point ? `new THREE.PointLight(0x${l2}, ${c.lights.l2Intensity}, 20)` : `new THREE.DirectionalLight(0x${l2}, ${c.lights.l2Intensity})`};
light2.position.set(${c.lights.l2PosX}, ${c.lights.l2PosY}, ${c.lights.l2PosZ});
const light3 = ${c.lights.l3Point ? `new THREE.PointLight(0x${l3}, ${c.lights.l3Intensity}, 20)` : `new THREE.DirectionalLight(0x${l3}, ${c.lights.l3Intensity})`};
light3.position.set(${c.lights.l3PosX}, ${c.lights.l3PosY}, ${c.lights.l3PosZ});
const ambient = new THREE.HemisphereLight(0x${hs}, 0x${hg}, ${c.lights.hemiIntensity});
scene.add(light1, light2, light3, ambient);

// ── MOTION (${c.motion.type} @ ${c.motion.speed}x) ──
const speed = ${c.motion.speed};
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  if (obj) {
    ${motion}
  }
  ${c.lights.l2Orbit ? 'light2.position.x = Math.cos(t)*2; light2.position.z = Math.sin(t)*2 - 2;' : ''}
  renderer.render(scene, camera);
}
animate();
`;
    }

    _getPresetName() {
      // best-effort match by JSON snapshot
      return Object.keys(PRESETS).find(k =>
        JSON.stringify(PRESETS[k].material) === JSON.stringify(this.config.material)
      ) || 'custom';
    }
  }

  global.FDS = global.FDS || {};
  global.FDS.Builder3D = Builder3D;
  global.FDS.PRESETS_3D = PRESETS;
})(window);
