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
  '唐': '#bdefff',
  '宋': '#7fffd2',
  '元明清': '#d987ff',
  '近现代': '#a8c7ff'
};

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
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>>(null);
  const progress = useRef(0);
  const lastPoet = useRef(poet.id);
  const accent = accentByDynasty[poet.dynasty] ?? '#bdefff';

  const geometry = useMemo(() => {
    const random = mulberry32(poetSeed(poet));
    const poemCount = Math.max(1, poemsByPoet[poet.id]?.length ?? 1);
    const base = mode === 'reading' ? 3600 : 2400;
    const count = visualQuality === 'performance' ? Math.round(base * 0.45) : base;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const baseColor = new THREE.Color(accent);
    const white = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i += 1) {
      const arm = i % 6;
      const poemBand = (i % Math.min(7, poemCount + 2)) / Math.max(1, Math.min(7, poemCount + 2));
      const radius = Math.pow(random(), 0.62) * (mode === 'reading' ? 24 : 17) + 1.2;
      const twist = radius * 0.18;
      const angle = arm * Math.PI * 2 / 6 + twist + (random() - 0.5) * 0.82;
      const ringLift = Math.sin(radius * 0.54 + arm) * 1.7;
      const depth = (random() - 0.5) * (6 + radius * 0.52);
      const x = Math.cos(angle) * radius * (1.05 + poemBand * 0.18);
      const y = ringLift + (random() - 0.5) * (2.2 + poemBand * 3.2);
      const z = Math.sin(angle) * radius * 0.72 + depth;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const brightness = 0.48 + random() * 0.52;
      const mix = random() > 0.84 ? 0.55 : 0.18 + poemBand * 0.22;
      const c = baseColor.clone().lerp(white, mix).multiplyScalar(brightness + 0.35);
      colors[i * 3] = Math.min(1, c.r);
      colors[i * 3 + 1] = Math.min(1, c.g);
      colors[i * 3 + 2] = Math.min(1, c.b);
      sizes[i] = 0.85 + random() * 2.2 + Math.max(0, 1.0 - radius / 20) * 1.1;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.computeBoundingSphere();
    return g;
  }, [accent, mode, poet, visualQuality]);

  useEffect(() => {
    if (lastPoet.current !== poet.id || mode === 'reading') {
      progress.current = 0;
      lastPoet.current = poet.id;
    }
  }, [mode, poet.id]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !points.current) return;
    progress.current = Math.min(1, progress.current + delta * (mode === 'reading' ? 0.82 : 0.58));
    const reveal = progress.current * progress.current * (3 - 2 * progress.current);
    const scale = THREE.MathUtils.lerp(0.12, 1, reveal);
    group.current.scale.setScalar(scale);
    group.current.rotation.y = clock.elapsedTime * (visualQuality === 'performance' ? 0.045 : 0.085);
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.08;
    points.current.material.opacity = (mode === 'reading' ? 0.74 : 0.48) * reveal * (0.86 + Math.sin(clock.elapsedTime * 1.8) * 0.14);
  });

  const ringRadii = mode === 'reading' ? [6.8, 11.5, 17.2, 23.0] : [5.2, 9.2, 13.8];

  return (
    <group ref={group} position={poet.position}>
      <points ref={points} geometry={geometry} frustumCulled={false}>
        <pointsMaterial vertexColors size={0.105} sizeAttenuation transparent opacity={0.01} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {visualQuality !== 'performance' && ringRadii.map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.18, index * 0.37, index * 0.82]}>
          <torusGeometry args={[radius, 0.01, 6, 220]} />
          <meshBasicMaterial color={index % 2 ? '#ffffff' : accent} transparent opacity={0.08 - index * 0.012} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
      <mesh scale={[0.04, mode === 'reading' ? 34 : 22, 0.04]}>
        <cylinderGeometry args={[1, 1, 1, 18]} />
        <meshBasicMaterial color={accent} transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}
