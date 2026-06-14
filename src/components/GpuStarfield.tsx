import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Dynasty } from '../data/poetry';
import { dynastyOrder } from '../data/poetry';
import { generateGalaxyBuffers } from '../lib/galaxy';

const DYNASTY_COUNT = 6;

const vertexShader = `
  attribute float size;
  attribute float dynasty;
  attribute float twinkle;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uActiveDynasties[6];

  varying vec3 vColor;
  varying float vAlpha;
  varying float vTwinkle;

  float dynastyVisibility(float value) {
    if (value < 0.5) return uActiveDynasties[0];
    if (value < 1.5) return uActiveDynasties[1];
    if (value < 2.5) return uActiveDynasties[2];
    if (value < 3.5) return uActiveDynasties[3];
    if (value < 4.5) return uActiveDynasties[4];
    return uActiveDynasties[5];
  }

  void main() {
    float active = dynastyVisibility(dynasty);
    float pulse = 0.92 + 0.08 * sin(uTime * 1.45 + twinkle * 6.2831853);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    vColor = color * mix(vec3(0.2, 0.24, 0.34), vec3(1.0), active);
    vAlpha = mix(0.09, 0.96, active);
    vTwinkle = twinkle;

    gl_PointSize = clamp(size * pulse * (260.0 / max(8.0, -mvPosition.z)) * uPixelRatio * 72.0, 1.0, 24.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    float softDisc = smoothstep(0.5, 0.16, r);
    float core = smoothstep(0.18, 0.0, r);
    float halo = smoothstep(0.5, 0.28, r) * 0.28;
    float alpha = (softDisc * 0.72 + core * 0.38 + halo) * vAlpha;

    if (alpha < 0.018) discard;

    vec3 bloomTint = vColor * (1.0 + core * 1.15 + vTwinkle * 0.12);
    gl_FragColor = vec4(bloomTint, alpha);
  }
`;

function createDynastyMask(activeDynasties: Dynasty[]) {
  const active = new Set(activeDynasties);
  const mask = new Float32Array(DYNASTY_COUNT);
  dynastyOrder.forEach((dynasty, index) => {
    mask[index] = active.has(dynasty) ? 1 : 0;
  });
  return mask;
}

const GpuStarfield = memo(function GpuStarfield({ activeDynasties }: { activeDynasties: Dynasty[] }) {
  const points = useRef<THREE.Points>(null);
  const galaxy = useMemo(() => generateGalaxyBuffers(150000), []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const dynasty = new Float32Array(galaxy.total);
    const twinkle = new Float32Array(galaxy.total);

    for (let i = 0; i < galaxy.total; i += 1) {
      dynasty[i] = galaxy.dynastyIndex[i];
      twinkle[i] = ((i * 16807) % 997) / 997;
    }

    g.setAttribute('position', new THREE.BufferAttribute(galaxy.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(galaxy.colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(galaxy.sizes, 1));
    g.setAttribute('dynasty', new THREE.BufferAttribute(dynasty, 1));
    g.setAttribute('twinkle', new THREE.BufferAttribute(twinkle, 1));
    g.computeBoundingSphere();
    return g;
  }, [galaxy]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
          uActiveDynasties: { value: createDynastyMask(activeDynasties) }
        },
        vertexShader,
        fragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      }),
    []
  );

  useEffect(() => {
    material.uniforms.uActiveDynasties.value = createDynastyMask(activeDynasties);
  }, [activeDynasties, material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (!points.current) return;
    points.current.rotation.y = Math.sin(clock.elapsedTime * 0.018) * 0.035;
    points.current.rotation.z = Math.sin(clock.elapsedTime * 0.011) * 0.01;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
});

export default GpuStarfield;
