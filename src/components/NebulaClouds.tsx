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
    float depthScale = 190.0 / max(42.0, -mvPosition.z);
    vColor = color;
    vDepthFade = clamp((-mvPosition.z - 20.0) / 260.0, 0.18, 1.0);
    gl_PointSize = clamp(size * uBaseSize * depthScale * uPixelRatio * uLayerDepth, 0.42, uMaxSize);
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

    float body = exp(-r2 * 6.8);
    float core = exp(-r2 * 38.0) * 0.12;
    float alpha = (body * 0.74 + core) * uOpacity * vDepthFade;

    if (alpha < 0.005) discard;

    vec3 color = vColor * (0.72 + core * 0.35);
    gl_FragColor = vec4(color, alpha);
  }
`;

const streakVertex = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vAlpha = clamp((-mvPosition.z - 8.0) / 190.0, 0.2, 1.0);
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
  far: ['#0a2a62', '#123f86', '#25327b', '#071b38', '#3e4ea8'],
  main: ['#37f4ff', '#61ffd9', '#8f7cff', '#cf7dff', '#e5fbff', '#7da7ff'],
  near: ['#dffcff', '#9ffbff', '#b49cff', '#63ffd2', '#ffffff']
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
};

function createCloudGeometry(profile: CloudProfile) {
  const random = mulberry32(profile.seed);
  const positions = new Float32Array(profile.count * 3);
  const colors = new Float32Array(profile.count * 3);
  const sizes = new Float32Array(profile.count);

  for (let i = 0; i < profile.count; i += 1) {
    const arm = Math.floor(random() * profile.armCount);
    const radius = Math.pow(random(), profile.radiusPower) * profile.radius;
    const angle = random() * Math.PI * 2 + radius * profile.armTwist + arm * ((Math.PI * 2) / profile.armCount);
    const localScatter = profile.scatter + radius * 0.052;

    const x = Math.cos(angle) * radius * profile.xScale + gaussian(random) * localScatter;
    const y = Math.sin(angle * 1.8) * profile.yScale + gaussian(random) * (profile.verticalScatter + radius * 0.026);
    const z = Math.sin(angle) * radius * profile.zScale + gaussian(random) * (localScatter * 1.25);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const color = new THREE.Color(profile.palette[Math.floor(random() * profile.palette.length)]);
    const darkSpace = new THREE.Color(random() > 0.48 ? '#02081f' : '#031321');
    color.lerp(darkSpace, 0.12 + random() * 0.18);
    const luminance = profile.brightness * (0.45 + Math.pow(random(), 0.55) * 0.72);
    colors[i * 3] = Math.min(1, color.r * luminance);
    colors[i * 3 + 1] = Math.min(1, color.g * luminance);
    colors[i * 3 + 2] = Math.min(1, color.b * (luminance + 0.08));

    sizes[i] = profile.sizeMin + Math.pow(random(), 2.4) * profile.sizeMax;
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
};

function NebulaLayer({ geometry, baseSize, maxSize, opacity, pixelRatioCap, layerDepth, parallax, scale, position }: LayerProps) {
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
    group.current.position.y = position[1] - camera.position.y * parallax * 0.2;
    group.current.position.z = position[2] - camera.position.z * parallax * 0.38;
  });

  return (
    <group ref={group} scale={scale} position={position}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

function createStreakGeometry(count: number) {
  const random = mulberry32(77031);
  const positions = new Float32Array(count * 2 * 3);
  const colors = new Float32Array(count * 2 * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 36 + random() * 128;
    const theta = random() * Math.PI * 2;
    const z = -150 + random() * 300;
    const x = Math.cos(theta) * radius * (0.8 + random() * 0.8);
    const y = (random() - 0.5) * 82;
    const len = 1.6 + Math.pow(random(), 2.2) * 9.5;
    const dx = (0.8 + random() * 0.5) * len;
    const dy = (0.2 + random() * 0.32) * len;
    const dz = (1.4 + random()) * len;

    const base = i * 6;
    positions[base] = x;
    positions[base + 1] = y;
    positions[base + 2] = z;
    positions[base + 3] = x + dx;
    positions[base + 4] = y + dy;
    positions[base + 5] = z + dz;

    const color = new THREE.Color(random() > 0.6 ? '#dffcff' : random() > 0.4 ? '#8ffaff' : '#9a86ff');
    const fade = 0.38 + random() * 0.4;
    colors[base] = color.r * 0.08;
    colors[base + 1] = color.g * 0.08;
    colors[base + 2] = color.b * 0.08;
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
  const count = visualQuality === 'performance' ? 420 : visualQuality === 'balanced' ? 900 : 1600;
  const geometry = useMemo(() => createStreakGeometry(count), [count]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: visualQuality === 'performance' ? 0.045 : visualQuality === 'balanced' ? 0.075 : 0.11 } },
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
    group.current.position.x = camera.position.x * 0.18;
    group.current.position.y = camera.position.y * 0.05;
    group.current.position.z = camera.position.z * 0.12;
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
  const farCount = Math.max(12000, Math.floor(nebulaCount * 0.34));
  const mainCount = Math.max(22000, Math.floor(nebulaCount * 0.48));
  const nearCount = Math.max(6000, Math.floor(nebulaCount * 0.18));

  const far = useMemo(() => createCloudGeometry({
    seed: 14001,
    count: farCount,
    radius: 170,
    radiusPower: 0.5,
    xScale: 1.35,
    yScale: 18,
    zScale: 0.58,
    armTwist: 0.014,
    armCount: 9,
    scatter: 18,
    verticalScatter: 11,
    palette: palettes.far,
    brightness: 0.82,
    sizeMin: 0.12,
    sizeMax: 0.72
  }), [farCount]);

  const main = useMemo(() => createCloudGeometry({
    seed: 260614,
    count: mainCount,
    radius: 118,
    radiusPower: 0.58,
    xScale: 1.26,
    yScale: 12,
    zScale: 0.74,
    armTwist: 0.032,
    armCount: 6,
    scatter: 9,
    verticalScatter: 6,
    palette: palettes.main,
    brightness: 1.06,
    sizeMin: 0.08,
    sizeMax: 0.94
  }), [mainCount]);

  const near = useMemo(() => createCloudGeometry({
    seed: 52077,
    count: nearCount,
    radius: 86,
    radiusPower: 0.42,
    xScale: 1.18,
    yScale: 16,
    zScale: 1.05,
    armTwist: 0.052,
    armCount: 5,
    scatter: 12,
    verticalScatter: 10,
    palette: palettes.near,
    brightness: 0.98,
    sizeMin: 0.09,
    sizeMax: 1.28
  }), [nearCount]);

  return (
    <group>
      <NebulaLayer
        geometry={far}
        baseSize={preset.nebula.baseSize * 0.7}
        maxSize={preset.nebula.maxSize * 0.72}
        opacity={preset.nebula.opacity * 0.78}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={0.78}
        parallax={0.012}
        scale={[1.25, 0.92, 1.1]}
        position={[0, 0, -66]}
      />
      <NebulaLayer
        geometry={main}
        baseSize={preset.nebula.baseSize * 1.02}
        maxSize={preset.nebula.maxSize}
        opacity={preset.nebula.opacity * 1.08}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={1}
        parallax={0.036}
        scale={[1.0, 1.0, 1.0]}
        position={[0, 0, -8]}
      />
      <NebulaLayer
        geometry={near}
        baseSize={preset.nebula.baseSize * 1.42}
        maxSize={preset.nebula.maxSize * 1.28}
        opacity={preset.nebula.opacity * 0.74}
        pixelRatioCap={preset.nebula.pixelRatioCap}
        layerDepth={1.2}
        parallax={0.08}
        scale={[1.0, 1.08, 1.24]}
        position={[0, 1, 46]}
      />
      <ForegroundStreaks visualQuality={visualQuality} />
    </group>
  );
});