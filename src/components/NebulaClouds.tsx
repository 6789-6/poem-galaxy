import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';

const nebulaVertex = `
  attribute float size;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  uniform float uMaxSize;
  uniform float uLayerDepth;
  varying vec3 vColor;
  varying float vDepthFade;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depthScale = 210.0 / max(44.0, -mvPosition.z);
    vColor = color;
    vDepthFade = clamp((-mvPosition.z - 18.0) / 290.0, 0.16, 1.0);
    gl_PointSize = clamp(size * uBaseSize * depthScale * uPixelRatio * uLayerDepth, 0.35, uMaxSize);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const nebulaFragment = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vDepthFade;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float mist = exp(-r2 * 5.2);
    float core = exp(-r2 * 34.0) * 0.16;
    float rim = smoothstep(1.0, 0.38, r2) * 0.08;
    float alpha = (mist * 0.68 + core + rim) * uOpacity * vDepthFade;

    if (alpha < 0.004) discard;

    vec3 color = vColor * (0.78 + core * 0.46);
    gl_FragColor = vec4(color, alpha);
  }
`;

const streakVertex = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vAlpha = clamp((-mvPosition.z - 6.0) / 210.0, 0.18, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const streakFragment = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, uOpacity * vAlpha);
  }
`;

const palettes = {
  far: ['#071a4f', '#102c74', '#182466', '#06152f', '#253d99'],
  main: ['#30f2ff', '#5dffe0', '#8392ff', '#bb80ff', '#eafbff', '#78dcff'],
  core: ['#eafbff', '#bffcff', '#74fff0', '#a78cff', '#ffffff'],
  near: ['#f2ffff', '#a8fbff', '#bba5ff', '#64ffd7', '#ffffff']
};

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const u = 1 - random();
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type CloudProfile = {
  seed: number;
  count: number;
  radius: number;
  radiusPower: number;
  xScale: number;
  yScale: number;
  zScale: number;
  armTwist: number;
  armCount: number;
  scatter: number;
  verticalScatter: number;
  palette: readonly string[];
  brightness: number;
  sizeMin: number;
  sizeMax: number;
  coreBias: number;
  haloBias: number;
  banding: number;
};

function createCloudGeometry(profile: CloudProfile) {
  const random = mulberry32(profile.seed);
  const positions = new Float32Array(profile.count * 3);
  const colors = new Float32Array(profile.count * 3);
  const sizes = new Float32Array(profile.count);

  for (let i = 0; i < profile.count; i += 1) {
    const core = random() < profile.coreBias;
    const halo = random() > 1 - profile.haloBias;
    const arm = Math.floor(random() * profile.armCount);
    const baseRadius = core
      ? Math.pow(random(), 1.75) * profile.radius * 0.32
      : halo
        ? profile.radius * (0.64 + Math.pow(random(), 0.72) * 0.62)
        : Math.pow(random(), profile.radiusPower) * profile.radius;

    const armPhase = arm * ((Math.PI * 2) / profile.armCount);
    const band = (arm - (profile.armCount - 1) / 2) * profile.banding;
    const angle = armPhase + baseRadius * profile.armTwist + gaussian(random) * (core ? 0.48 : 0.13) + random() * 0.38;
    const ribbonWidth = core ? profile.scatter * 1.6 : profile.scatter + baseRadius * 0.035;
    const ribbonNoise = gaussian(random) * ribbonWidth;
    const shell = halo ? 1.25 : 1;

    const x = Math.cos(angle) * baseRadius * profile.xScale * shell + Math.cos(angle + Math.PI * 0.5) * ribbonNoise + band;
    const y = Math.sin(angle * 2.18) * profile.yScale + gaussian(random) * (profile.verticalScatter + baseRadius * 0.018) + (core ? gaussian(random) * 2.8 : 0);
    const z = Math.sin(angle) * baseRadius * profile.zScale * (halo ? 1.18 : 1) + gaussian(random) * (ribbonWidth * 1.18 + (core ? 4 : 0));

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const color = new THREE.Color(profile.palette[Math.floor(random() * profile.palette.length)]);
    const darkSpace = new THREE.Color(random() > 0.48 ? '#020817' : '#031426');
    color.lerp(darkSpace, core ? 0.03 + random() * 0.08 : 0.1 + random() * 0.18);
    const density = core ? 1.22 : halo ? 0.55 : 0.72;
    const luminance = profile.brightness * density * (0.4 + Math.pow(random(), 0.52) * 0.78);
    colors[i * 3] = Math.min(1, color.r * luminance * 0.9);
    colors[i * 3 + 1] = Math.min(1, color.g * luminance * 1.03);
    colors[i * 3 + 2] = Math.min(1, color.b * (luminance + 0.1));

    sizes[i] = profile.sizeMin + Math.pow(random(), 2.25) * profile.sizeMax + (core ? random() * profile.sizeMax * 0.38 : 0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

function createPointMaterial(baseSize: number, opacity: number, maxSize: number, pixelRatioCap: number, layerDepth = 1) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, pixelRatioCap) },
      uBaseSize: { value: baseSize },
      uMaxSize: { value: maxSize },
      uOpacity: { value: opacity },
      uLayerDepth: { value: layerDepth }
    },
    vertexShader: nebulaVertex,
    fragmentShader: nebulaFragment,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
}

type LayerProps = {
  geometry: THREE.BufferGeometry;
  baseSize: number;
  maxSize: number;
  opacity: number;
  pixelRatioCap: number;
  layerDepth: number;
  parallax: number;
  scale: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
};

function NebulaLayer({ geometry, baseSize, maxSize, opacity, pixelRatioCap, layerDepth, parallax, scale, position, rotation = [0, 0, 0] }: LayerProps) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const material = useMemo(() => createPointMaterial(baseSize, opacity, maxSize, pixelRatioCap, layerDepth), [baseSize, opacity, maxSize, pixelRatioCap, layerDepth]);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, pixelRatioCap);
    material.uniforms.uBaseSize.value = baseSize;
    material.uniforms.uMaxSize.value = maxSize;
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uLayerDepth.value = layerDepth;
  }, [baseSize, layerDepth, material, maxSize, opacity, pixelRatioCap]);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.x = position[0] - camera.position.x * parallax;
    group.current.position.y = position[1] - camera.position.y * parallax * 0.22;
    group.current.position.z = position[2] - camera.position.z * parallax * 0.42;
  });

  return (
    <group ref={group} scale={scale} position={position} rotation={rotation}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

function createStreakGeometry(count: number) {
  const random = mulberry32(77031);
  const positions = new Float32Array(count * 2 * 3);
  const colors = new Float32Array(count * 2 * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 34 + random() * 140;
    const theta = random() * Math.PI * 2;
    const z = -170 + random() * 330;
    const x = Math.cos(theta) * radius * (0.78 + random() * 0.88);
    const y = (random() - 0.5) * 86;
    const len = 1.8 + Math.pow(random(), 2.1) * 12.5;
    const dx = (0.8 + random() * 0.5) * len;
    const dy = (0.18 + random() * 0.32) * len;
    const dz = (1.6 + random()) * len;

    const base = i * 6;
    positions[base] = x;
    positions[base + 1] = y;
    positions[base + 2] = z;
    positions[base + 3] = x + dx;
    positions[base + 4] = y + dy;
    positions[base + 5] = z + dz;

    const color = new THREE.Color(random() > 0.58 ? '#e9ffff' : random() > 0.38 ? '#8ffaff' : '#a08dff');
    const fade = 0.36 + random() * 0.44;
    colors[base] = color.r * 0.06;
    colors[base + 1] = color.g * 0.06;
    colors[base + 2] = color.b * 0.06;
    colors[base + 3] = color.r * fade;
    colors[base + 4] = color.g * fade;
    colors[base + 5] = color.b * fade;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function ForegroundStreaks({ visualQuality }: { visualQuality: VisualQuality }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const count = visualQuality === 'performance' ? 480 : visualQuality === 'balanced' ? 1100 : 2200;
  const geometry = useMemo(() => createStreakGeometry(count), [count]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: visualQuality === 'performance' ? 0.045 : visualQuality === 'balanced' ? 0.08 : 0.13 } },
    vertexShader: streakVertex,
    fragmentShader: streakFragment,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  }), [visualQuality]);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.x = camera.position.x * 0.2;
    group.current.position.y = camera.position.y * 0.055;
    group.current.position.z = camera.position.z * 0.14;
    group.current.rotation.y = camera.rotation.y * 0.08;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

export default memo(function NebulaClouds({ visualQuality }: { visualQuality: VisualQuality }) {
  const preset = RENDER_PRESETS[visualQuality];
  const nebulaCount = preset.nebulaCount;
  const farCount = Math.max(12000, Math.floor(nebulaCount * 0.28));
  const mainCount = Math.max(26000, Math.floor(nebulaCount * 0.42));
  const coreCount = Math.max(16000, Math.floor(nebulaCount * 0.18));
  const nearCount = Math.max(7000, Math.floor(nebulaCount * 0.12));

  const far = useMemo(() => createCloudGeometry({
    seed: 14001,
    count: farCount,
    radius: 210,
    radiusPower: 0.48,
    xScale: 1.52,
    yScale: 16,
    zScale: 0.54,
    armTwist: 0.011,
    armCount: 10,
    scatter: 22,
    verticalScatter: 12,
    palette: palettes.far,
    brightness: 0.68,
    sizeMin: 0.1,
    sizeMax: 0.62,
    coreBias: 0.04,
    haloBias: 0.48,
    banding: 7.5
  }), [farCount]);

  const main = useMemo(() => createCloudGeometry({
    seed: 260614,
    count: mainCount,
    radius: 136,
    radiusPower: 0.62,
    xScale: 1.62,
    yScale: 11,
    zScale: 0.72,
    armTwist: 0.036,
    armCount: 5,
    scatter: 7.8,
    verticalScatter: 4.8,
    palette: palettes.main,
    brightness: 1.02,
    sizeMin: 0.07,
    sizeMax: 0.86,
    coreBias: 0.18,
    haloBias: 0.18,
    banding: 4.5
  }), [mainCount]);

  const core = useMemo(() => createCloudGeometry({
    seed: 32657,
    count: coreCount,
    radius: 74,
    radiusPower: 1.25,
    xScale: 1.34,
    yScale: 7.5,
    zScale: 0.68,
    armTwist: 0.058,
    armCount: 4,
    scatter: 5.2,
    verticalScatter: 3.8,
    palette: palettes.core,
    brightness: 1.26,
    sizeMin: 0.07,
    sizeMax: 1.1,
    coreBias: 0.54,
    haloBias: 0.08,
    banding: 2.2
  }), [coreCount]);

  const near = useMemo(() => createCloudGeometry({
    seed: 52077,
    count: nearCount,
    radius: 112,
    radiusPower: 0.44,
    xScale: 1.38,
    yScale: 17,
    zScale: 1.06,
    armTwist: 0.048,
    armCount: 5,
    scatter: 12,
    verticalScatter: 10,
    palette: palettes.near,
    brightness: 0.96,
    sizeMin: 0.08,
    sizeMax: 1.28,
    coreBias: 0.1,
    haloBias: 0.22,
    banding: 3.4
  }), [nearCount]);

  return (
    <group>
      <NebulaLayer
        geometry={far}
        baseSize={preset.nebula.baseSize * 0.66}
        maxSize={preset.nebula.maxSize * 0.66}
        opacity={preset.nebula.opacity * 0.72}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={0.72}
        parallax={0.01}
        scale={[1.12, 0.88, 1.05]}
        position={[0, 0, -86]}
        rotation={[0.02, -0.06, -0.04]}
      />
      <NebulaLayer
        geometry={main}
        baseSize={preset.nebula.baseSize * 1.02}
        maxSize={preset.nebula.maxSize * 0.96}
        opacity={preset.nebula.opacity * 1.02}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={1}
        parallax={0.034}
        scale={[1.03, 1.0, 1.0]}
        position={[0, 0, -10]}
        rotation={[0.04, -0.12, -0.08]}
      />
      <NebulaLayer
        geometry={core}
        baseSize={preset.nebula.baseSize * 1.28}
        maxSize={preset.nebula.maxSize * 1.08}
        opacity={preset.nebula.opacity * 1.18}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={1.08}
        parallax={0.048}
        scale={[0.9, 0.92, 0.95]}
        position={[0, 0, 8]}
        rotation={[0.02, -0.15, -0.08]}
      />
      <NebulaLayer
        geometry={near}
        baseSize={preset.nebula.baseSize * 1.44}
        maxSize={preset.nebula.maxSize * 1.24}
        opacity={preset.nebula.opacity * 0.68}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={1.22}
        parallax={0.088}
        scale={[1.05, 1.08, 1.28]}
        position={[0, 2, 54]}
        rotation={[0.08, -0.2, -0.06]}
      />
      <ForegroundStreaks visualQuality={visualQuality} />
    </group>
  );
});
