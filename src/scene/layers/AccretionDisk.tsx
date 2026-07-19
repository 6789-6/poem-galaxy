import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { consumeVisibleFrameDelta, useVisibilityFrameTiming } from '../scene-timing';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float radius = length(vUv - vec2(0.5)) * 2.0;
    float streak = pow(max(0.0, sin(atan(vUv.y - 0.5, vUv.x - 0.5) * 34.0 - uTime * 0.18)), 8.0);
    vec3 molten = mix(vec3(1.0, 0.35, 0.09), vec3(1.0, 0.88, 0.48), 1.0 - radius);
    vec3 violet = vec3(0.38, 0.10, 0.95);
    vec3 color = mix(molten, violet, smoothstep(0.45, 1.0, radius)) + streak * 0.22;
    float alpha = (1.0 - smoothstep(0.76, 1.0, radius)) * smoothstep(0.02, 0.18, radius);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function AccretionDisk() {
  const disk = useRef<THREE.Group>(null);
  const frameTiming = useVisibilityFrameTiming();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const visibleDelta = consumeVisibleFrameDelta(frameTiming, delta);
    if (visibleDelta === null) return;
    material.uniforms.uTime.value += visibleDelta;
    if (disk.current) disk.current.rotation.z += visibleDelta * 0.012;
  });

  return (
    <group ref={disk} rotation={[Math.PI * 0.38, -0.08, -0.2]}>
      <mesh material={material} renderOrder={1}>
        <ringGeometry args={[8, 34, 256, 2]} />
      </mesh>
      <mesh renderOrder={3}>
        <sphereGeometry args={[7.7, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh rotation={[0.16, 0.08, 0.08]} renderOrder={0}>
        <torusGeometry args={[37, 0.08, 8, 192]} />
        <meshBasicMaterial
          color="#ffb33f"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-0.22, 0.12, -0.13]} renderOrder={0}>
        <torusGeometry args={[42, 0.045, 8, 192]} />
        <meshBasicMaterial
          color="#7435d9"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
