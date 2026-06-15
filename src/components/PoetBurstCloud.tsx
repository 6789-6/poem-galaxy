import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { GalaxyMode } from '../App';
import type { Poet } from '../data/poetry';
import { poemsByPoet } from '../data/poetry';
import type { VisualQuality } from '../config/renderPresets';

const accentByDynasty: Record<string, string> = {
  '先秦': '#5ff6ff',
  '汉魏六朝': '#9a8cff',
  '唐': '#d8fbff',
  '宋': '#7fffd2',
  '元明清': '#d987ff',
  '近现代': '#a8c7ff'
};

const vertexShader = `
  attribute float size;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uReveal;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position * mix(0.16, 1.0, uReveal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(10.0, -mv.z);
    float breath = 0.94 + 0.06 * sin(uTime * 0.8 + position.x * 0.21 + position.z * 0.17);
    vColor = color;
    vAlpha = uReveal * breath;
    gl_PointSize = clamp(size * uPointScale * uPixelRatio / depth, 0.35, 4.2);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;
    float core = exp(-r2 * 34.0);
    float body = exp(-r2 * 9.0);
    float alpha = (body * 0.62 + core * 0.24) * vAlpha;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(vColor * (0.72 + core * 0.46), alpha);
  }
`;

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poetSeed(poet: Poet) {
  return poet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0) * 17, 2707);
}

export default function PoetBurstCloud({ poet, mode, visualQuality }: { poet: Poet; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const group = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useRef(0);
  const lastPoet = useRef(poet.id);
  const accent = accentByDynasty[poet.dynasty] ?? '#d8fbff';

  const geometry = useMemo(() => {
    const random = mulberry32(poetSeed(poet));
    const poemCount = Math.max(1, poemsByPoet[poet.id]?.length ?? 1);
    const base = mode === 'reading' ? 2400 : 1600;
    const count = visualQuality === 'performance' ? Math.round(base * 0.38) : base;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const baseColor = new THREE.Color(accent);
    const white = new THREE.Color('#ffffff');
    const violet = new THREE.Color('#978cff');

    for (let i = 0; i < count; i += 1) {
      const arm = i % 7;
      const band = (i % Math.min(8, poemCount + 3)) / Math.max(1, Math.min(8, poemCount + 3));
      const radius = Math.pow(random(), 0.72) * (mode === 'reading' ? 20 : 13.5) + 0.8;
      const angle = arm * Math.PI * 2 / 7 + radius * 0.22 + (random() - 0.5) * 0.52;
      const vertical = Math.sin(radius * 0.55 + arm) * 1.2 + (random() - 0.5) * (1.8 + band * 2.2);
      const depth = (random() - 0.5) * (4 + radius * 0.42);
      positions[i * 3] = Math.cos(angle) * radius * (1.02 + band * 0.1);
      positions[i * 3 + 1] = vertical;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.66 + depth;

      const c = baseColor.clone().lerp(random() > 0.85 ? violet : white, 0.16 + band * 0.24).multiplyScalar(0.55 + random() * 0.46);
      colors[i * 3] = Math.min(1, c.r);
      colors[i * 3 + 1] = Math.min(1, c.g);
      colors[i * 3 + 2] = Math.min(1, c.b);
      sizes[i] = 0.55 + random() * 1.45 + Math.max(0, 1 - radius / 18) * 0.55;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.computeBoundingSphere();
    return g;
  }, [accent, mode, poet, visualQuality]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 1.2) },
      uPointScale: { value: mode === 'reading' ? 34 : 28 },
      uReveal: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  }), [mode]);

  useEffect(() => {
    if (lastPoet.current !== poet.id || mode === 'reading') {
      progress.current = 0;
      lastPoet.current = poet.id;
    }
  }, [mode, poet.id]);

  useFrame(({ clock }, delta) => {
    const mat = materialRef.current ?? material;
    if (!group.current || !mat) return;
    progress.current = Math.min(1, progress.current + delta * (mode === 'reading' ? 0.75 : 0.55));
    const reveal = progress.current * progress.current * (3 - 2 * progress.current);
    group.current.rotation.y = clock.elapsedTime * (visualQuality === 'performance' ? 0.025 : 0.055);
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.16) * 0.035;
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uReveal.value = reveal * (mode === 'network' ? 0.7 : 1);
  });

  return (
    <group ref={group} position={poet.position}>
      <points geometry={geometry} frustumCulled={false}>
        <primitive object={material} ref={materialRef} attach="material" />
      </points>
    </group>
  );
}
