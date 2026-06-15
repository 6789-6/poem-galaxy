import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GalaxyMode, VisualQuality } from '../App';
import type { Poet } from '../data/poetry';
import { poemsByPoet } from '../data/poetry';

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const accentByDynasty = {
  '先秦': '#5ff6ff',
  '汉魏六朝': '#9a8cff',
  '唐': '#bdefff',
  '宋': '#7fffd2',
  '元明清': '#d987ff',
  '近现代': '#a8c7ff'
} as const;

export default function FocusedPoetBurst({ poet, mode, visualQuality }: { poet: Poet; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const reveal = useRef(0);
  const accent = accentByDynasty[poet.dynasty];
  const poems = poemsByPoet[poet.id] ?? [];

  const geometry = useMemo(() => {
    const random = mulberry32(poet.id.split('').reduce((total, char) => total + char.charCodeAt(0), 1919));
    const base = mode === 'reading' ? 5200 : visualQuality === 'cinematic' ? 3400 : 2200;
    const count = visualQuality === 'performance' ? Math.round(base * 0.4) : base;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color(accent);
    const white = new THREE.Color('#f4feff');
    const cyan = new THREE.Color('#7effef');
    const violet = new THREE.Color('#a98dff');
    const poemCount = Math.max(1, poems.length);

    for (let i = 0; i < count; i += 1) {
      const poemIndex = i % poemCount;
      const arm = Math.floor(random() * 5);
      const angle = (arm / 5) * Math.PI * 2 + (i / count) * 8.5 + poemIndex * 0.15 + (random() - 0.5) * 1.1;
      const shell = Math.floor(random() * 7);
      const radius = 2.5 + Math.pow(random(), 0.55) * (mode === 'reading' ? 25 : 16) + shell * 0.6;
      const ripple = Math.sin((i / count) * Math.PI * 18 + shell) * 1.5;
      positions[i * 3] = Math.cos(angle) * (radius + ripple);
      positions[i * 3 + 1] = (random() - 0.5) * (mode === 'reading' ? 10 : 6) + Math.sin(angle * 2.3) * 1.2;
      positions[i * 3 + 2] = Math.sin(angle) * (radius + ripple) * (0.52 + shell * 0.06) + (random() < 0.12 ? (random() - 0.5) * 16 : 0);

      const target = random() > 0.8 ? white : random() > 0.55 ? cyan : random() > 0.28 ? color : violet;
      const mixed = color.clone().lerp(target, 0.38 + random() * 0.5);
      const tone = 0.45 + random() * 0.7;
      colors[i * 3] = Math.min(1, mixed.r * tone + 0.02);
      colors[i * 3 + 1] = Math.min(1, mixed.g * tone + 0.04);
      colors[i * 3 + 2] = Math.min(1, mixed.b * (tone + 0.12));
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeBoundingSphere();
    return g;
  }, [accent, mode, poet.id, poems.length, visualQuality]);

  useEffect(() => {
    reveal.current = 0;
    group.current?.scale.setScalar(0.2);
    if (material.current) material.current.opacity = 0;
  }, [poet.id, mode]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !material.current) return;
    const target = mode === 'reading' ? 1 : mode === 'network' ? 0.5 : 0.68;
    reveal.current = THREE.MathUtils.damp(reveal.current, target, visualQuality === 'performance' ? 2.4 : 3.6, delta);
    const eased = reveal.current * reveal.current * (3 - 2 * reveal.current);
    group.current.scale.setScalar(0.22 + eased * (mode === 'reading' ? 1.08 : 0.84));
    group.current.rotation.y = clock.elapsedTime * 0.055 + eased * 0.36;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.16) * 0.045;
    material.current.opacity = (mode === 'reading' ? 0.72 : 0.42) * eased;
  });

  const rings = mode === 'reading' ? [5.4, 9.6, 14.5, 20.2, 27.5] : [4.8, 8.8, 13.4, 18.8];

  return (
    <group ref={group} position={poet.position}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial ref={material} vertexColors size={mode === 'reading' ? 0.13 : 0.1} sizeAttenuation transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {visualQuality !== 'performance' && rings.map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.12, index * 0.25, index * 0.5]}>
          <torusGeometry args={[radius, 0.012, 8, 220]} />
          <meshBasicMaterial color={index % 2 ? '#eafcff' : accent} transparent opacity={0.1 - index * 0.014} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
