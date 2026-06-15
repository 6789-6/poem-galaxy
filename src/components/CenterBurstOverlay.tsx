import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function CenterBurstCloud() {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const geometry = useMemo(() => {
    const random = mulberry32(8192);
    const count = 3600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = ['#bdefff', '#7fffd2', '#9a8cff', '#f2feff'].map((value) => new THREE.Color(value));

    for (let i = 0; i < count; i += 1) {
      const arm = Math.floor(random() * 5);
      const angle = (arm / 5) * Math.PI * 2 + (i / count) * 9.4 + (random() - 0.5) * 1.2;
      const radius = 1.2 + Math.pow(random(), 0.52) * 18;
      const shell = Math.floor(random() * 6);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (random() - 0.5) * 7 + Math.sin(angle * 2.1) * 1.4;
      positions[i * 3 + 2] = Math.sin(angle) * radius * (0.5 + shell * 0.07) + (random() - 0.5) * 6;
      const color = palette[Math.floor(random() * palette.length)];
      const tone = 0.45 + random() * 0.72;
      colors[i * 3] = Math.min(1, color.r * tone + 0.04);
      colors[i * 3 + 1] = Math.min(1, color.g * tone + 0.05);
      colors[i * 3 + 2] = Math.min(1, color.b * tone + 0.12);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeBoundingSphere();
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!group.current || !material.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.045;
    group.current.rotation.x = Math.sin(t * 0.13) * 0.045;
    const pulse = 0.5 + Math.sin(t * 0.8) * 0.08;
    material.current.opacity = pulse;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial ref={material} vertexColors size={0.11} sizeAttenuation transparent opacity={0.48} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
    </group>
  );
}

export default function CenterBurstOverlay() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3, mixBlendMode: 'screen', opacity: 0.78 }} aria-hidden="true">
      <Canvas dpr={[1, 1.35]} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => gl.setClearColor('#000000', 0)}>
        <perspectiveCamera makeDefault position={[0, 6, 34]} fov={42} />
        <CenterBurstCloud />
      </Canvas>
    </div>
  );
}
