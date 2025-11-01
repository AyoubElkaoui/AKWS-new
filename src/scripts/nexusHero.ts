// @ts-nocheck
import * as THREE from 'three';

const ENABLE_DEBUG_UI = import.meta.env?.DEV ?? false;

const TWEAKPANE_URL = 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.4/dist/tweakpane.min.js';
let tweakpanePromise: Promise<any> | null = null;

// Only enable tweakpane in development or when explicitly requested via query flag (?debug=tweakpane)
const ENABLE_TWEAKPANE = typeof window !== 'undefined' && (import.meta.env.DEV || window.location.search.indexOf('debug=tweakpane') !== -1 || window.location.hostname === 'localhost');

function loadTweakpane() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!ENABLE_TWEAKPANE) return Promise.resolve(null);
  if ((window as any).Tweakpane) return Promise.resolve((window as any).Tweakpane);
  if (tweakpanePromise) return tweakpanePromise;

  tweakpanePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-tweakpane]');

    const handleLoad = () => {
      if ((window as any).Tweakpane) {
        resolve((window as any).Tweakpane);
      } else {
        reject(new Error('Tweakpane failed to initialise'));
      }
    };

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = TWEAKPANE_URL;
    // Tweakpane CDN may ship an ESM build; load as module to avoid 'Unexpected token export'
    script.type = 'module';
    script.async = true;
    script.dataset.tweakpane = 'true';
    script.onload = handleLoad;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return tweakpanePromise;
}

type PresetName =
  | 'moody'
  | 'cosmic'
  | 'minimal'
  | 'vibrant'
  | 'neon'
  | 'sunset'
  | 'midnight'
  | 'toxic'
  | 'pastel'
  | 'dithered'
  | 'holographic';

type HeroSettings = {
  preset: PresetName;
  sphereCount: number;
  ambientIntensity: number;
  diffuseIntensity: number;
  specularIntensity: number;
  specularPower: number;
  fresnelPower: number;
  backgroundColor: THREE.Color;
  sphereColor: THREE.Color;
  lightColor: THREE.Color;
  lightPosition: THREE.Vector3;
  smoothness: number;
  contrast: number;
  fogDensity: number;
  cursorGlowIntensity: number;
  cursorGlowRadius: number;
  cursorGlowColor: THREE.Color;
  fixedTopLeftRadius: number;
  fixedBottomRightRadius: number;
  smallTopLeftRadius: number;
  smallBottomRightRadius: number;
  cursorRadiusMin: number;
  cursorRadiusMax: number;
  animationSpeed: number;
  movementScale: number;
  mouseSmoothness: number;
  mergeDistance: number;
  mouseProximityEffect: boolean;
  minMovementScale: number;
  maxMovementScale: number;
};

type Cleanup = () => void;

let initOnce: Cleanup | null = null;

const HERO_ANCHORS = {
  topLeft: {
    large: { x: 0.18, y: 0.88 },
    small: { x: 0.32, y: 0.74 },
  },
  bottomRight: {
    large: { x: 0.82, y: 0.18 },
    small: { x: 0.68, y: 0.34 },
  },
} as const;

export default function initNexusHero(): Cleanup | void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Allow explicit override via URL `?force-animate=1` or global `window.AKWS_FORCE_ANIMATIONS = true`
  let forceAnimate = false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('force-animate') === '1') forceAnimate = true;
    // @ts-ignore
    if (window.AKWS_FORCE_ANIMATIONS) forceAnimate = true;
  } catch (e) {
    // ignore
  }

  if (prefersReducedMotion.matches && !forceAnimate) {
    return;
  }

  if (initOnce) {
    return initOnce;
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const hardwareConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 0 : 0;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);
  const isEdge = /Edg/i.test(ua);
  
  // Aggressive low-power device detection
  const memoryGb = (navigator as any).deviceMemory ?? 8;
  const isIntegratedGPU = /Intel.*HD|Intel.*UHD|Intel.*Iris/i.test((navigator as any).userAgentData?.platform || ua);
  const isLowPowerDevice = isMobile || hardwareConcurrency <= 4 || memoryGb <= 4 || isIntegratedGPU;
  
  // Ultra-low settings for very weak devices
  const isUltraLowPower = hardwareConcurrency <= 2 || memoryGb <= 2;
  
  // Drastically reduce pixel ratio for performance
  const devicePixelRatio = Math.min(
    window.devicePixelRatio || 1, 
    isUltraLowPower ? 0.5 : (isLowPowerDevice ? 0.75 : (isMobile ? 1 : 1))
  );

  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let renderer: THREE.WebGLRenderer | null = null;
  let material: THREE.ShaderMaterial;
  let clock: THREE.Clock;
  const mouse = { x: 0, y: 0 };
  const cursorSphere3D = new THREE.Vector3(0, 0, 0);
  const targetMousePosition = new THREE.Vector2(0.5, 0.5);
  const mousePosition = new THREE.Vector2(0.5, 0.5);
  let activeMerges = 0;
  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 60;
  let rafId = 0;
  let performanceLevel = isUltraLowPower ? 0 : (isLowPowerDevice ? 1 : 2); // 0=ultra-low, 1=low, 2=normal
  let consecutiveLowFPS = 0;
  let autoDowngradeApplied = false;
  
  // Performance optimization: track if scene needs re-render
  let needsRender = true;
  let lastMouseX = 0.5;
  let lastMouseY = 0.5;
  const MOUSE_MOVEMENT_THRESHOLD = 0.001; // Only render if mouse moved significantly

  const presets: Record<PresetName, Partial<HeroSettings>> = {
    moody: {
      sphereCount: isMobile ? 3 : 4, // REDUCED from 4:6 for better initial performance
      ambientIntensity: 0.02,
      diffuseIntensity: 0.6,
      specularIntensity: 1.8,
      specularPower: 8,
      fresnelPower: 1.2,
      backgroundColor: new THREE.Color(0x050505),
      sphereColor: new THREE.Color(0x000000),
      lightColor: new THREE.Color(0xffffff),
      lightPosition: new THREE.Vector3(1, 1, 1),
      smoothness: 0.3,
      contrast: 2,
      fogDensity: 0.12,
      cursorGlowIntensity: 0.4,
      cursorGlowRadius: 1.2,
      cursorGlowColor: new THREE.Color(0xffffff),
    },
    cosmic: {
      sphereCount: isMobile ? 5 : 8,
      ambientIntensity: 0.03,
      diffuseIntensity: 0.8,
      specularIntensity: 1.6,
      specularPower: 6,
      fresnelPower: 1.4,
      backgroundColor: new THREE.Color(0x000011),
      sphereColor: new THREE.Color(0x000022),
      lightColor: new THREE.Color(0x88aaff),
      lightPosition: new THREE.Vector3(0.5, 1, 0.5),
      smoothness: 0.4,
      contrast: 2,
      fogDensity: 0.15,
      cursorGlowIntensity: 0.8,
      cursorGlowRadius: 1.5,
      cursorGlowColor: new THREE.Color(0x4477ff),
    },
    minimal: {
      sphereCount: isMobile ? 2 : 3,
      ambientIntensity: 0,
      diffuseIntensity: 0.25,
      specularIntensity: 1.3,
      specularPower: 11,
      fresnelPower: 1.7,
      backgroundColor: new THREE.Color(0x0a0a0a),
      sphereColor: new THREE.Color(0x000000),
      lightColor: new THREE.Color(0xffffff),
      lightPosition: new THREE.Vector3(1, 0.5, 0.8),
      smoothness: 0.25,
      contrast: 2,
      fogDensity: 0.1,
      cursorGlowIntensity: 0.3,
      cursorGlowRadius: 1,
      cursorGlowColor: new THREE.Color(0xffffff),
    },
    vibrant: {
      sphereCount: isMobile ? 6 : 10,
      ambientIntensity: 0.05,
      diffuseIntensity: 0.9,
      specularIntensity: 1.5,
      specularPower: 5,
      fresnelPower: 1.3,
      backgroundColor: new THREE.Color(0x0a0505),
      sphereColor: new THREE.Color(0x110000),
      lightColor: new THREE.Color(0xff8866),
      lightPosition: new THREE.Vector3(0.8, 1.2, 0.6),
      smoothness: 0.5,
      contrast: 2,
      fogDensity: 0.08,
      cursorGlowIntensity: 0.8,
      cursorGlowRadius: 1.3,
      cursorGlowColor: new THREE.Color(0xff6644),
    },
    neon: {
      sphereCount: isMobile ? 4 : 7,
      ambientIntensity: 0.04,
      diffuseIntensity: 1,
      specularIntensity: 2,
      specularPower: 4,
      fresnelPower: 1,
      backgroundColor: new THREE.Color(0x000505),
      sphereColor: new THREE.Color(0x000808),
      lightColor: new THREE.Color(0x00ffcc),
      lightPosition: new THREE.Vector3(0.7, 1.3, 0.8),
      smoothness: 0.7,
      contrast: 2,
      fogDensity: 0.08,
      cursorGlowIntensity: 0.8,
      cursorGlowRadius: 1.4,
      cursorGlowColor: new THREE.Color(0x00ffaa),
    },
    sunset: {
      sphereCount: isMobile ? 3 : 5,
      ambientIntensity: 0.04,
      diffuseIntensity: 0.7,
      specularIntensity: 1.4,
      specularPower: 7,
      fresnelPower: 1.5,
      backgroundColor: new THREE.Color(0x150505),
      sphereColor: new THREE.Color(0x100000),
      lightColor: new THREE.Color(0xff6622),
      lightPosition: new THREE.Vector3(1.2, 0.4, 0.6),
      smoothness: 0.35,
      contrast: 2,
      fogDensity: 0.1,
      cursorGlowIntensity: 0.8,
      cursorGlowRadius: 1.4,
      cursorGlowColor: new THREE.Color(0xff4422),
    },
    midnight: {
      sphereCount: isMobile ? 3 : 4,
      ambientIntensity: 0.01,
      diffuseIntensity: 0.4,
      specularIntensity: 1.6,
      specularPower: 9,
      fresnelPower: 1.8,
      backgroundColor: new THREE.Color(0x000010),
      sphereColor: new THREE.Color(0x000015),
      lightColor: new THREE.Color(0x4466ff),
      lightPosition: new THREE.Vector3(0.9, 0.8, 1),
      smoothness: 0.28,
      contrast: 2,
      fogDensity: 0.14,
      cursorGlowIntensity: 0.8,
      cursorGlowRadius: 1.6,
      cursorGlowColor: new THREE.Color(0x3355ff),
    },
    toxic: {
      sphereCount: isMobile ? 5 : 9,
      ambientIntensity: 0.06,
      diffuseIntensity: 0.85,
      specularIntensity: 1.7,
      specularPower: 6,
      fresnelPower: 1.1,
      backgroundColor: new THREE.Color(0x001000),
      sphereColor: new THREE.Color(0x001500),
      lightColor: new THREE.Color(0x66ff44),
      lightPosition: new THREE.Vector3(0.6, 1.1, 0.7),
      smoothness: 0.55,
      contrast: 2,
      fogDensity: 0.09,
      cursorGlowIntensity: 0.8,
      cursorGlowRadius: 1.7,
      cursorGlowColor: new THREE.Color(0x44ff22),
    },
    pastel: {
      sphereCount: isMobile ? 4 : 6,
      ambientIntensity: 0.08,
      diffuseIntensity: 0.5,
      specularIntensity: 1.2,
      specularPower: 12,
      fresnelPower: 2,
      backgroundColor: new THREE.Color(0x101018),
      sphereColor: new THREE.Color(0x080814),
      lightColor: new THREE.Color(0xaabbff),
      lightPosition: new THREE.Vector3(1, 0.7, 0.9),
      smoothness: 0.38,
      contrast: 1.8,
      fogDensity: 0.07,
      cursorGlowIntensity: 0.35,
      cursorGlowRadius: 1.1,
      cursorGlowColor: new THREE.Color(0x8899ff),
    },
    dithered: {
      sphereCount: isMobile ? 5 : 8,
      ambientIntensity: 0.1,
      diffuseIntensity: 0.8,
      specularIntensity: 1.5,
      specularPower: 6,
      fresnelPower: 1.2,
      backgroundColor: new THREE.Color(0x0a0520),
      sphereColor: new THREE.Color(0x000000),
      lightColor: new THREE.Color(0xff00ff),
      lightPosition: new THREE.Vector3(0.8, 0.8, 0.8),
      smoothness: 0.6,
      contrast: 1.8,
      fogDensity: 0.05,
      cursorGlowIntensity: 1,
      cursorGlowRadius: 2,
      cursorGlowColor: new THREE.Color(0x00ffff),
    },
    holographic: {
      sphereCount: isMobile ? 4 : 6,
      ambientIntensity: 0.12,
      diffuseIntensity: 1.2,
      specularIntensity: 2.5,
      specularPower: 3,
      fresnelPower: 0.8,
      backgroundColor: new THREE.Color(0x0a0a15),
      sphereColor: new THREE.Color(0x050510),
      lightColor: new THREE.Color(0xccaaff),
      lightPosition: new THREE.Vector3(0.9, 0.9, 1.2),
      smoothness: 0.8,
      contrast: 1.6,
      fogDensity: 0.06,
      cursorGlowIntensity: 1.2,
      cursorGlowRadius: 2.2,
      cursorGlowColor: new THREE.Color(0xaa77ff),
    },
  };

  const settings: HeroSettings = {
    preset: 'holographic',
    ...presets.holographic,
    fixedTopLeftRadius: 0.6,
    fixedBottomRightRadius: 0.62,
    smallTopLeftRadius: 0.24,
    smallBottomRightRadius: 0.26,
    cursorRadiusMin: 0.08,
    cursorRadiusMax: 0.15,
    animationSpeed: 0.45,
    movementScale: 0.95,
    mouseSmoothness: 0.1,
    mergeDistance: 1.25,
    mouseProximityEffect: true,
    minMovementScale: 0.4,
    maxMovementScale: 0.95,
  } as HeroSettings;

  // Ultra-aggressive performance optimization for low-power devices
  if (isUltraLowPower) {
    settings.sphereCount = 2; // Minimum spheres
    settings.animationSpeed *= 0.3;
    settings.movementScale *= 0.5;
    settings.smoothness = 0.1; // Minimal smoothness
    settings.fogDensity = 0; // Disable fog
    settings.cursorGlowIntensity = 0; // Disable glow
    settings.specularIntensity *= 0.3; // Reduce specular
    settings.ambientIntensity *= 0.5;
  } else if (isLowPowerDevice) {
    settings.sphereCount = Math.min(settings.sphereCount, isMobile ? 2 : 3);
    settings.animationSpeed *= 0.5;
    settings.movementScale *= 0.6;
    settings.smoothness *= 0.4;
    settings.fogDensity *= 0.3;
    settings.cursorGlowIntensity *= 0.3;
  }

  const container = document.getElementById('container');
  const statsContainer = document.getElementById('stats');
  const uiContainer = document.getElementById('ui-container');
  if (!container) {
    return;
  }

  function getStoryText(x: string, y: string, radius: string, merges: number, currentFps: number) {
    if (isMobile) {
      return `vessel: (${x}, ${y})<br>field: ${radius}u<br>merges: ${merges}<br>flux: ${currentFps}hz`;
    }
    return `our vessel drifts at coordinates (${x}, ${y})<br>gravitational field extends ${radius} units into quantum foam<br>currently merging with ${merges} other entities<br>temporal flux: ${currentFps} cycles per second`;
  }

  function screenToWorldJS(normalizedX: number, normalizedY: number) {
    const uvX = normalizedX * 2 - 1;
    const uvY = normalizedY * 2 - 1;
    const aspect = window.innerWidth / window.innerHeight;
    return new THREE.Vector3(uvX * aspect * 2, uvY * 2, 0);
  }

  function updateStory(x: number, y: number, radius: number, merges: number, currentFps: number) {
    const storyText = document.getElementById('story-text');
    if (!storyText) return;
    storyText.innerHTML = getStoryText(x.toFixed(2), y.toFixed(2), radius.toFixed(2), merges, currentFps || 0);
  }

  async function setupUI() {
    if (!ENABLE_DEBUG_UI) return;
    if (!uiContainer) return;
    try {
      const Tweakpane = await loadTweakpane();
      if (!Tweakpane) return;
      const pane = new Tweakpane.Pane({
        container: uiContainer,
        title: 'Metaball Controls',
        expanded: !isMobile,
      });

      pane
        .addBinding(settings, 'preset', {
          options: {
            Moody: 'moody',
            Cosmic: 'cosmic',
            Minimal: 'minimal',
            Vibrant: 'vibrant',
            Neon: 'neon',
            Sunset: 'sunset',
            Midnight: 'midnight',
            Toxic: 'toxic',
            Pastel: 'pastel',
            Psychedelic: 'dithered',
            Holographic: 'holographic',
          },
        })
        .on('change', (ev) => {
          applyPreset(ev.value as PresetName);
          pane.refresh();
        });

      const metaballFolder = pane.addFolder({ title: 'Metaballs' });

      metaballFolder
        .addBinding(settings, 'fixedTopLeftRadius', { min: 0.2, max: 2, step: 0.01, label: 'Top Left Size' })
        .on('change', (ev) => {
          material.uniforms.uFixedTopLeftRadius.value = ev.value;
        });

      metaballFolder
        .addBinding(settings, 'fixedBottomRightRadius', { min: 0.2, max: 2, step: 0.01, label: 'Bottom Right Size' })
        .on('change', (ev) => {
          material.uniforms.uFixedBottomRightRadius.value = ev.value;
        });

      metaballFolder
        .addBinding(settings, 'smallTopLeftRadius', { min: 0.1, max: 0.8, step: 0.01, label: 'Small Top Left' })
        .on('change', (ev) => {
          material.uniforms.uSmallTopLeftRadius.value = ev.value;
        });

      metaballFolder
        .addBinding(settings, 'smallBottomRightRadius', { min: 0.1, max: 0.8, step: 0.01, label: 'Small Bottom Right' })
        .on('change', (ev) => {
          material.uniforms.uSmallBottomRightRadius.value = ev.value;
        });

      metaballFolder
        .addBinding(settings, 'sphereCount', { min: 2, max: 10, step: 1, label: 'Moving Count' })
        .on('change', (ev) => {
          material.uniforms.uSphereCount.value = ev.value;
        });

      metaballFolder
        .addBinding(settings, 'smoothness', { min: 0.1, max: 1, step: 0.01, label: 'Blend Smoothness' })
        .on('change', (ev) => {
          material.uniforms.uSmoothness.value = ev.value;
        });

      const mouseFolder = pane.addFolder({ title: 'Mouse Interaction' });

      mouseFolder
        .addBinding(settings, 'mouseProximityEffect')
        .on('change', (ev) => {
          material.uniforms.uMouseProximityEffect.value = ev.value;
        });

      mouseFolder
        .addBinding(settings, 'minMovementScale', { min: 0.1, max: 1, step: 0.05 })
        .on('change', (ev) => {
          material.uniforms.uMinMovementScale.value = ev.value;
        });

      mouseFolder
        .addBinding(settings, 'maxMovementScale', { min: 0.5, max: 2, step: 0.05 })
        .on('change', (ev) => {
          material.uniforms.uMaxMovementScale.value = ev.value;
        });

      mouseFolder.addBinding(settings, 'mouseSmoothness', { min: 0.01, max: 0.2, step: 0.01, label: 'Mouse Smoothness' });

      const cursorFolder = pane.addFolder({ title: 'Cursor' });
      cursorFolder.addBinding(settings, 'cursorRadiusMin', { min: 0.05, max: 0.2, step: 0.01, label: 'Min Radius' });
      cursorFolder.addBinding(settings, 'cursorRadiusMax', { min: 0.1, max: 0.25, step: 0.01, label: 'Max Radius' });

      const animationFolder = pane.addFolder({ title: 'Animation' });

      animationFolder
        .addBinding(settings, 'animationSpeed', { min: 0.1, max: 3, step: 0.1 })
        .on('change', (ev) => {
          material.uniforms.uAnimationSpeed.value = ev.value;
        });

      animationFolder
        .addBinding(settings, 'movementScale', { min: 0.5, max: 2, step: 0.1 })
        .on('change', (ev) => {
          material.uniforms.uMovementScale.value = ev.value;
        });

      const lightingFolder = pane.addFolder({ title: 'Lighting' });

      lightingFolder
        .addBinding(settings, 'ambientIntensity', { min: 0, max: 0.5, step: 0.01 })
        .on('change', (ev) => {
          material.uniforms.uAmbientIntensity.value = ev.value;
        });

      lightingFolder
        .addBinding(settings, 'diffuseIntensity', { min: 0, max: 1, step: 0.01 })
        .on('change', (ev) => {
          material.uniforms.uDiffuseIntensity.value = ev.value;
        });

      lightingFolder
        .addBinding(settings, 'specularIntensity', { min: 0, max: 2, step: 0.01 })
        .on('change', (ev) => {
          material.uniforms.uSpecularIntensity.value = ev.value;
        });

      lightingFolder
        .addBinding(settings, 'specularPower', { min: 1, max: 64, step: 1 })
        .on('change', (ev) => {
          material.uniforms.uSpecularPower.value = ev.value;
        });

      lightingFolder
        .addBinding(settings, 'fresnelPower', { min: 1, max: 5, step: 0.1 })
        .on('change', (ev) => {
          material.uniforms.uFresnelPower.value = ev.value;
        });

      lightingFolder
        .addBinding(settings, 'contrast', { min: 0.5, max: 2, step: 0.1 })
        .on('change', (ev) => {
          material.uniforms.uContrast.value = ev.value;
        });

      const glowFolder = pane.addFolder({ title: 'Cursor Glow' });

      glowFolder
        .addBinding(settings, 'cursorGlowIntensity', { min: 0, max: 2, step: 0.1 })
        .on('change', (ev) => {
          material.uniforms.uCursorGlowIntensity.value = ev.value;
        });

      glowFolder
        .addBinding(settings, 'cursorGlowRadius', { min: 0.5, max: 3, step: 0.1 })
        .on('change', (ev) => {
          material.uniforms.uCursorGlowRadius.value = ev.value;
        });

      glowFolder
        .addBinding(settings, 'fogDensity', { min: 0, max: 0.5, step: 0.01 })
        .on('change', (ev) => {
          material.uniforms.uFogDensity.value = ev.value;
        });
    } catch (error) {
      console.warn('[nexusHero] tweakpane unavailable', error);
    }
  }

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable for all devices - huge performance boost
      alpha: true,
      powerPreference: 'low-power', // Force low-power mode for better compatibility
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
      failIfMajorPerformanceCaveat: false, // Don't fail on slow GPUs
      depth: true,
      stencil: false, // Disable stencil buffer
    });

  const pixelRatio = devicePixelRatio;
  // Start VERY LOW for fast initial render, gradually increase based on FPS
  const initialPixelRatio = isMobile ? 0.4 : 0.5; // REDUCED from 0.5:0.65 for PageSpeed
  renderer.setPixelRatio(initialPixelRatio);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    renderer.setSize(viewportWidth, viewportHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: -1 !important;
      display: block !important;
      opacity: 1 !important;
      transform: translateZ(0);
      will-change: transform;
    `;
    container.appendChild(canvas);
    console.log('[nexusHero] 🎨 Canvas appended to container, opacity: 1');
    let canvasShown = false;

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(viewportWidth, viewportHeight) },
        uActualResolution: { value: new THREE.Vector2(viewportWidth * pixelRatio, viewportHeight * pixelRatio) },
        uPixelRatio: { value: pixelRatio },
        uMousePosition: { value: new THREE.Vector2(0.5, 0.5) },
        uCursorSphere: { value: new THREE.Vector3(0, 0, 0) },
        uCursorRadius: { value: settings.cursorRadiusMin },
        uSphereCount: { value: settings.sphereCount },
        uFixedTopLeftRadius: { value: settings.fixedTopLeftRadius },
        uFixedBottomRightRadius: { value: settings.fixedBottomRightRadius },
        uSmallTopLeftRadius: { value: settings.smallTopLeftRadius },
        uSmallBottomRightRadius: { value: settings.smallBottomRightRadius },
        uMergeDistance: { value: settings.mergeDistance },
        uSmoothness: { value: settings.smoothness },
        uAmbientIntensity: { value: settings.ambientIntensity },
        uDiffuseIntensity: { value: settings.diffuseIntensity },
        uSpecularIntensity: { value: settings.specularIntensity },
        uSpecularPower: { value: settings.specularPower },
        uFresnelPower: { value: settings.fresnelPower },
        uBackgroundColor: { value: settings.backgroundColor },
        uSphereColor: { value: settings.sphereColor },
        uLightColor: { value: settings.lightColor },
        uLightPosition: { value: settings.lightPosition },
        uContrast: { value: settings.contrast },
        uFogDensity: { value: settings.fogDensity },
        uAnimationSpeed: { value: settings.animationSpeed },
        uMovementScale: { value: settings.movementScale },
        uMouseProximityEffect: { value: settings.mouseProximityEffect },
        uMinMovementScale: { value: settings.minMovementScale },
        uMaxMovementScale: { value: settings.maxMovementScale },
        uCursorGlowIntensity: { value: settings.cursorGlowIntensity },
        uCursorGlowRadius: { value: settings.cursorGlowRadius },
        uCursorGlowColor: { value: settings.cursorGlowColor },
        uIsSafari: { value: isSafari ? 1 : 0 },
        uIsMobile: { value: isMobile ? 1 : 0 },
        uIsLowPower: { value: isLowPowerDevice ? 1 : 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        ${isUltraLowPower || isMobile || isSafari || isLowPowerDevice ? 'precision lowp float;' : 'precision mediump float;'}
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uActualResolution;
        uniform float uPixelRatio;
        uniform vec2 uMousePosition;
        uniform vec3 uCursorSphere;
        uniform float uCursorRadius;
        uniform int uSphereCount;
        uniform float uFixedTopLeftRadius;
        uniform float uFixedBottomRightRadius;
        uniform float uSmallTopLeftRadius;
        uniform float uSmallBottomRightRadius;
        uniform float uMergeDistance;
        uniform float uSmoothness;
        uniform float uAmbientIntensity;
        uniform float uDiffuseIntensity;
        uniform float uSpecularIntensity;
        uniform float uSpecularPower;
        uniform float uFresnelPower;
        uniform vec3 uBackgroundColor;
        uniform vec3 uSphereColor;
        uniform vec3 uLightColor;
        uniform vec3 uLightPosition;
        uniform float uContrast;
        uniform float uFogDensity;
        uniform float uAnimationSpeed;
        uniform float uMovementScale;
        uniform bool uMouseProximityEffect;
        uniform float uMinMovementScale;
        uniform float uMaxMovementScale;
        uniform float uCursorGlowIntensity;
        uniform float uCursorGlowRadius;
        uniform vec3 uCursorGlowColor;
        uniform float uIsSafari;
        uniform float uIsMobile;
        uniform float uIsLowPower;
        varying vec2 vUv;
        const float PI = 3.14159265359;
        const float EPSILON = ${isUltraLowPower ? '0.005' : '0.002'};
        const float MAX_DIST = 100.0;
        float smin(float a, float b, float k) {
          float h = max(k - abs(a - b), 0.0) / k;
          return min(a, b) - h * h * k * 0.25;
        }
        float sdSphere(vec3 p, float r) {
          return length(p) - r;
        }
        vec3 screenToWorld(vec2 normalizedPos) {
          vec2 uv = normalizedPos * 2.0 - 1.0;
          uv.x *= uResolution.x / uResolution.y;
          return vec3(uv * 2.0, 0.0);
        }
        float getDistanceToCenter(vec2 pos) {
          float dist = length(pos - vec2(0.5, 0.5)) * 2.0;
          return smoothstep(0.0, 1.0, dist);
        }
        float sceneSDF(vec3 pos) {
          float result = MAX_DIST;
          vec3 topLeftPos = screenToWorld(vec2(${HERO_ANCHORS.topLeft.large.x.toFixed(2)}, ${HERO_ANCHORS.topLeft.large.y.toFixed(2)}));
          float topLeft = sdSphere(pos - topLeftPos, uFixedTopLeftRadius);
          vec3 smallTopLeftPos = screenToWorld(vec2(${HERO_ANCHORS.topLeft.small.x.toFixed(2)}, ${HERO_ANCHORS.topLeft.small.y.toFixed(2)}));
          float smallTopLeft = sdSphere(pos - smallTopLeftPos, uSmallTopLeftRadius);
          vec3 bottomRightPos = screenToWorld(vec2(${HERO_ANCHORS.bottomRight.large.x.toFixed(2)}, ${HERO_ANCHORS.bottomRight.large.y.toFixed(2)}));
          float bottomRight = sdSphere(pos - bottomRightPos, uFixedBottomRightRadius);
          vec3 smallBottomRightPos = screenToWorld(vec2(${HERO_ANCHORS.bottomRight.small.x.toFixed(2)}, ${HERO_ANCHORS.bottomRight.small.y.toFixed(2)}));
          float smallBottomRight = sdSphere(pos - smallBottomRightPos, uSmallBottomRightRadius);
          float t = uTime * uAnimationSpeed;
          float dynamicMovementScale = uMovementScale;
          if (uMouseProximityEffect) {
            float distToCenter = getDistanceToCenter(uMousePosition);
            float mixFactor = smoothstep(0.0, 1.0, distToCenter);
            dynamicMovementScale = mix(uMinMovementScale, uMaxMovementScale, mixFactor);
          }
          int maxIter = int(uIsMobile > 0.5 ? 2.0 : (uIsLowPower > 0.5 ? 3.0 : float(min(uSphereCount, 6))));
          for (int i = 0; i < 6; i++) {
            if (i >= uSphereCount || i >= maxIter) break;
            float fi = float(i);
            float speed = 0.4 + fi * 0.12;
            float radius = 0.12 + mod(fi, 3.0) * 0.06;
            float orbitRadius = (0.3 + mod(fi, 3.0) * 0.15) * dynamicMovementScale;
            float phaseOffset = fi * PI * 0.35;
            float distToCursor = length(vec3(0.0) - uCursorSphere);
            float proximityScale = 1.0 + (1.0 - smoothstep(0.0, 1.0, distToCursor)) * 0.5;
            orbitRadius *= proximityScale;
            vec3 offset;
            if (i == 0) {
              offset = vec3(
                sin(t * speed) * orbitRadius * 0.7,
                sin(t * 0.5) * orbitRadius,
                cos(t * speed * 0.7) * orbitRadius * 0.5
              );
            } else if (i == 1) {
              offset = vec3(
                sin(t * speed + PI) * orbitRadius * 0.5,
                -sin(t * 0.5) * orbitRadius,
                cos(t * speed * 0.7 + PI) * orbitRadius * 0.5
              );
            } else {
              offset = vec3(
                sin(t * speed + phaseOffset) * orbitRadius * 0.8,
                cos(t * speed * 0.85 + phaseOffset * 1.3) * orbitRadius * 0.6,
                sin(t * speed * 0.5 + phaseOffset) * 0.3
              );
            }
            vec3 toCursor = uCursorSphere - offset;
            float cursorDist = length(toCursor);
            if (cursorDist < uMergeDistance && cursorDist > 0.0) {
              float attraction = (1.0 - cursorDist / uMergeDistance) * 0.3;
              offset += normalize(toCursor) * attraction;
            }
            float movingSphere = sdSphere(pos - offset, radius);
            float blend = 0.05;
            if (cursorDist < uMergeDistance) {
              float influence = 1.0 - (cursorDist / uMergeDistance);
              blend = mix(0.05, uSmoothness, influence * influence * influence);
            }
            result = smin(result, movingSphere, blend);
          }
          float cursorBall = sdSphere(pos - uCursorSphere, uCursorRadius);
          float topLeftGroup = smin(topLeft, smallTopLeft, 0.4);
          float bottomRightGroup = smin(bottomRight, smallBottomRight, 0.4);
          result = smin(result, topLeftGroup, 0.3);
          result = smin(result, bottomRightGroup, 0.3);
          result = smin(result, cursorBall, uSmoothness);
          return result;
        }
        vec3 calcNormal(vec3 p) {
          float eps = uIsLowPower > 0.5 ? 0.004 : 0.002;
          vec2 e = vec2(eps, 0.0);
          return normalize(vec3(
            sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
            sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
            sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
          ));
        }
        float ambientOcclusion(vec3 p, vec3 n) {
          if (uIsLowPower > 0.5) {
            float h = sceneSDF(p + n * 0.05);
            return clamp(1.0 - (0.05 - h) * 3.0, 0.0, 1.0);
          } else {
            float occ = 0.0;
            float weight = 1.0;
            for (int i = 0; i < 3; i++) {
              float dist = 0.02 + 0.03 * float(i);
              float h = sceneSDF(p + n * dist);
              occ += (dist - h) * weight;
              weight *= 0.7;
            }
            return clamp(1.0 - occ, 0.0, 1.0);
          }
        }
        float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
          if (uIsLowPower > 0.5) {
            float t = mint + 0.5;
            float h = sceneSDF(ro + rd * t);
            return h < EPSILON ? 0.5 : 1.0;
          } else {
            float result = 1.0;
            float t = mint;
            for (int i = 0; i < 8; i++) {
              if (t >= maxt) break;
              float h = sceneSDF(ro + rd * t);
              if (h < EPSILON) return 0.3;
              result = min(result, k * h / t);
              t += h * 0.5;
            }
            return result;
          }
        }
        float rayMarch(vec3 ro, vec3 rd) {
          float t = 0.0;
          int maxSteps = int(uIsMobile > 0.5 ? 12.0 : (uIsLowPower > 0.5 ? 16.0 : 32.0));
          float stepMultiplier = uIsLowPower > 0.5 ? 1.5 : 1.1;
          
          for (int i = 0; i < 32; i++) {
            if (i >= maxSteps) break;
            vec3 p = ro + rd * t;
            float d = sceneSDF(p);
            if (d < EPSILON) {
              return t;
            }
            if (t > 4.0) {
              break;
            }
            t += d * stepMultiplier;
          }
          return -1.0;
        }
        vec3 lighting(vec3 p, vec3 rd, float t) {
          if (t < 0.0) {
            return vec3(0.0);
          }
          vec3 normal = calcNormal(p);
          vec3 viewDir = -rd;
          vec3 baseColor = uSphereColor;
          float ao = ambientOcclusion(p, normal);
          vec3 ambient = uLightColor * uAmbientIntensity * ao;
          vec3 lightDir = normalize(uLightPosition);
          float diff = max(dot(normal, lightDir), 0.0);
          float shadow = softShadow(p, lightDir, 0.01, 10.0, 20.0);
          vec3 diffuse = uLightColor * diff * uDiffuseIntensity * shadow;
          vec3 reflectDir = reflect(-lightDir, normal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), uSpecularPower);
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
          vec3 specular = uLightColor * spec * uSpecularIntensity * fresnel;
          vec3 fresnelRim = uLightColor * fresnel * 0.4;
          float distToCursor = length(p - uCursorSphere);
          if (distToCursor < uCursorRadius + 0.4) {
            float highlight = 1.0 - smoothstep(0.0, uCursorRadius + 0.4, distToCursor);
            specular += uLightColor * highlight * 0.2;
            float glow = exp(-distToCursor * 3.0) * 0.15;
            ambient += uLightColor * glow * 0.5;
          }
          vec3 color = (baseColor + ambient + diffuse + specular + fresnelRim) * ao;
          color = pow(color, vec3(uContrast * 0.9));
          color = color / (color + vec3(0.8));
          return color;
        }
        float calculateCursorGlow(vec3 worldPos) {
          float dist = length(worldPos.xy - uCursorSphere.xy);
          float glow = 1.0 - smoothstep(0.0, uCursorGlowRadius, dist);
          glow = pow(glow, 2.0);
          return glow * uCursorGlowIntensity;
        }
        void main() {
          vec2 uv = (gl_FragCoord.xy * 2.0 - uActualResolution.xy) / uActualResolution.xy;
          uv.x *= uResolution.x / uResolution.y;
          vec3 ro = vec3(uv * 2.0, -1.0);
          vec3 rd = vec3(0.0, 0.0, 1.0);
          float t = rayMarch(ro, rd);
          vec3 p = ro + rd * t;
          vec3 color = lighting(p, rd, t);
          float cursorGlow = calculateCursorGlow(ro);
          vec3 glowContribution = uCursorGlowColor * cursorGlow;
          if (t > 0.0) {
            float fogAmount = 1.0 - exp(-t * uFogDensity);
            color = mix(color, uBackgroundColor.rgb, fogAmount * 0.3);
            color += glowContribution * 0.3;
            gl_FragColor = vec4(color, 1.0);
          } else {
            if (cursorGlow > 0.01) {
              gl_FragColor = vec4(glowContribution, cursorGlow * 0.8);
            } else {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
          }
        }
      `,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    setupEventListeners();
    if (ENABLE_DEBUG_UI) {
      setupUI();
    }
    onPointerMove({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as MouseEvent);

    // After a short warm-up period, try increasing pixel ratio to improve visual quality
    // if the device is not ultra-low-power and the renderer still exists.
    if (!isUltraLowPower) {
      setTimeout(() => {
        try {
          if (renderer) {
            renderer.setPixelRatio(pixelRatio);
            material.uniforms.uPixelRatio.value = pixelRatio;
            // Also update uActualResolution based on new pixel ratio
            const width = window.innerWidth;
            const height = window.innerHeight;
            material.uniforms.uActualResolution.value.set(width * pixelRatio, height * pixelRatio);
          }
        } catch (e) {
          // ignore failures
        }
      }, 1200);
    }
  }

  function setupEventListeners() {
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('orientationchange', onOrientationChange, { passive: true });
  }

  function removeEventListeners() {
    window.removeEventListener('mousemove', onPointerMove as EventListener);
    window.removeEventListener('touchstart', onTouchStart as EventListener);
    window.removeEventListener('touchmove', onTouchMove as EventListener);
    window.removeEventListener('touchend', onTouchEnd as EventListener);
    window.removeEventListener('resize', onWindowResize as EventListener);
    window.removeEventListener('orientationchange', onOrientationChange as EventListener);
  }

  function onOrientationChange() {
    setTimeout(onWindowResize, 100);
  }

  function onTouchStart(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      onPointerMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  function onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      onPointerMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  function onTouchEnd(event: TouchEvent) {
    event.preventDefault();
  }

  function onPointerMove(event: MouseEvent) {
    const newMouseX = event.clientX / window.innerWidth;
    const newMouseY = 1.0 - event.clientY / window.innerHeight;
    
    // Skip if mouse barely moved (throttle calculations)
    const deltaX = Math.abs(newMouseX - targetMousePosition.x);
    const deltaY = Math.abs(newMouseY - targetMousePosition.y);
    if (deltaX < 0.002 && deltaY < 0.002) return;
    
    targetMousePosition.x = newMouseX;
    targetMousePosition.y = newMouseY;
    needsRender = true; // Force render on mouse move

    const worldPos = screenToWorldJS(targetMousePosition.x, targetMousePosition.y);
    cursorSphere3D.copy(worldPos);

    let closestDistance = 1000.0;
    activeMerges = 0;

    const fixedPositions = [
      screenToWorldJS(HERO_ANCHORS.topLeft.large.x, HERO_ANCHORS.topLeft.large.y),
      screenToWorldJS(HERO_ANCHORS.topLeft.small.x, HERO_ANCHORS.topLeft.small.y),
      screenToWorldJS(HERO_ANCHORS.bottomRight.large.x, HERO_ANCHORS.bottomRight.large.y),
      screenToWorldJS(HERO_ANCHORS.bottomRight.small.x, HERO_ANCHORS.bottomRight.small.y),
    ];

    fixedPositions.forEach((pos) => {
      const dist = cursorSphere3D.distanceTo(pos);
      closestDistance = Math.min(closestDistance, dist);
      if (dist < settings.mergeDistance) activeMerges++;
    });

    const proximityFactor = Math.max(0, 1.0 - closestDistance / settings.mergeDistance);
    const smoothFactor = proximityFactor * proximityFactor * (3.0 - 2.0 * proximityFactor);
    const dynamicRadius =
      settings.cursorRadiusMin +
      (settings.cursorRadiusMax - settings.cursorRadiusMin) * smoothFactor;

    material.uniforms.uCursorSphere.value.copy(cursorSphere3D);
    material.uniforms.uCursorRadius.value = dynamicRadius;
    updateStory(cursorSphere3D.x, cursorSphere3D.y, dynamicRadius, activeMerges, fps);
  }

  function onWindowResize() {
    if (!renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const currentPixelRatio = Math.min(devicePixelRatio, isMobile ? 1.5 : 2);

    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(currentPixelRatio);

    material.uniforms.uResolution.value.set(width, height);
    material.uniforms.uActualResolution.value.set(width * currentPixelRatio, height * currentPixelRatio);
    material.uniforms.uPixelRatio.value = currentPixelRatio;

    const canvas = renderer.domElement;
    canvas.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 0 !important;
      display: block !important;
    `;

    if (renderer.info) {
      renderer.info.autoReset = true;
    }
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    render();
  }

  function render() {
    const currentTime = performance.now();
    frameCount += 1;

    // FPS monitoring - check every second initially, then every 2 seconds after stabilization
    const fpsCheckInterval = frameCount < 300 ? 1000 : 2000;
    
    if (currentTime - lastTime >= fpsCheckInterval) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      updateStory(cursorSphere3D.x, cursorSphere3D.y, material.uniforms.uCursorRadius.value, activeMerges, fps);
      frameCount = 0;
      lastTime = currentTime;
      if (statsContainer) {
        statsContainer.textContent = `${fps} fps`;
      }
      
      // Smart pixel ratio scaling based on FPS (max 1.5 instead of 2)
      if (renderer && frameCount > 60) {
        const currentPixelRatio = renderer.getPixelRatio();
        const maxPixelRatio = isMobile ? 1.25 : 1.5; // Lower max for better performance
        
        if (fps >= 55 && currentPixelRatio < maxPixelRatio) {
          // Good FPS: gradually increase quality
          const newRatio = Math.min(currentPixelRatio + 0.1, maxPixelRatio);
          renderer.setPixelRatio(newRatio);
          console.log(`[nexusHero] ⬆️ Pixel ratio increased to ${newRatio.toFixed(2)} (${fps} fps)`);
        } else if (fps < 30 && currentPixelRatio > 0.5) {
          // Low FPS: decrease quality
          const newRatio = Math.max(currentPixelRatio - 0.15, 0.5);
          renderer.setPixelRatio(newRatio);
          console.log(`[nexusHero] ⬇️ Pixel ratio decreased to ${newRatio.toFixed(2)} (${fps} fps)`);
        }
      }
      
      // Auto-downgrade if consistently low FPS
      if (!autoDowngradeApplied && performanceLevel > 0) {
        if (fps < 20) {
          consecutiveLowFPS++;
          if (consecutiveLowFPS >= 3) {
            console.log('[nexusHero] Low FPS detected, downgrading quality');
            performanceLevel--;
            autoDowngradeApplied = true;
            
            // Apply emergency optimizations
            if (performanceLevel === 0) {
              material.uniforms.uSphereCount.value = 2;
              material.uniforms.uSmoothness.value = 0.1;
              material.uniforms.uFogDensity.value = 0;
              material.uniforms.uCursorGlowIntensity.value = 0;
              if (renderer) {
                renderer.setPixelRatio(0.5);
              }
            } else {
              material.uniforms.uSphereCount.value = 3;
              material.uniforms.uSmoothness.value *= 0.5;
              if (renderer) {
                renderer.setPixelRatio(0.65);
              }
            }
          }
        } else {
          consecutiveLowFPS = 0;
        }
      }
    }

    // Smooth mouse movement (skip on ultra-low devices)
    if (!isUltraLowPower) {
      mousePosition.x += (targetMousePosition.x - mousePosition.x) * settings.mouseSmoothness;
      mousePosition.y += (targetMousePosition.y - mousePosition.y) * settings.mouseSmoothness;
    } else {
      mousePosition.copy(targetMousePosition);
    }
    
    // Check if mouse actually moved significantly
    const mouseMoved = 
      Math.abs(mousePosition.x - lastMouseX) > MOUSE_MOVEMENT_THRESHOLD ||
      Math.abs(mousePosition.y - lastMouseY) > MOUSE_MOVEMENT_THRESHOLD;
    
    if (mouseMoved) {
      needsRender = true;
      lastMouseX = mousePosition.x;
      lastMouseY = mousePosition.y;
    }

    material.uniforms.uTime.value = clock.getElapsedTime();
    
    // Only update mouse uniform if it changed
    if (mouseMoved) {
      material.uniforms.uMousePosition.value = mousePosition;
    }

    // PERFORMANCE: Only render when needed
    if (renderer && needsRender) {
      // Less aggressive memory management (every 600 frames instead of 300)
      if (frameCount % 600 === 0) {
        renderer.renderLists.dispose();
      }
      renderer.render(scene, camera);
      
      // Animation always needs next frame, but we can skip some
      // Keep rendering for first 180 frames (3 seconds @ 60fps) for smooth startup
      needsRender = frameCount < 180;

      // Canvas is already visible (opacity 1 from start)
      // Just hide spinner on first render
      try {
        if (!canvasShown) {
          const spinner = document.querySelector('.hero-3d-loading');
          if (spinner) (spinner as HTMLElement).style.display = 'none';
          canvasShown = true;
          console.log('[nexusHero] ✅ First render complete, spinner hidden');
        }
      } catch (e) {
        // ignore
      }
    }
  }

  function destroy() {
    cancelAnimationFrame(rafId);
    removeEventListeners();
    if (renderer) {
      renderer.dispose();
      const canvas = renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      renderer = null;
    }
  }

  init();
  animate();

  const attachEmailInteraction = () => {
    const emailLink = document.querySelector('.contact-email');
    if (!emailLink) return;
    const originalText = emailLink.textContent || '';
    emailLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (!navigator.clipboard) {
        window.location.href = 'mailto:hi@filip.fyi';
        return;
      }
      navigator.clipboard
        .writeText('hi@filip.fyi')
        .then(() => {
          emailLink.textContent = 'transmission sent to clipboard';
          window.setTimeout(() => {
            emailLink.textContent = originalText;
          }, 2000);
        })
        .catch(() => {
          window.location.href = 'mailto:hi@filip.fyi';
        });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachEmailInteraction, { once: true });
  } else {
    attachEmailInteraction();
  }

  initOnce = () => {
    destroy();
  };

  return initOnce;
}
