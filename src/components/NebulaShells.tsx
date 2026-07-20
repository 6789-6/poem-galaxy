import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { VisualQuality } from '../config/renderPresets';

const shellVertex = `
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const shellFragment = `
  precision highp float;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uInner;
  uniform vec3 uOuter;
  uniform vec3 uCore;
  uniform float uBandShift;
  varying vec2 vUv;
  varying vec3 vWorld;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amp;
      p *= 2.03;
      amp *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 1.56;
    float r = length(p);
    if (r > 1.28) discard;

    float theta = atan(p.y, p.x);
    float arm = sin(theta * 5.0 + r * 8.2 + uBandShift) * 0.5 + 0.5;
    float grain = fbm(p * vec2(3.6, 2.1) + vec2(uBandShift * 0.05, -uTime * 0.012));
    float ring = exp(-pow((r - 0.52) * 2.5, 2.0));
    float outer = exp(-pow((r - 0.88) * 2.1, 2.0));
    float core = exp(-r * r * 10.5);
    float edge = smoothstep(1.26, 0.46, r);

    float cloud = (ring * mix(0.34, 0.95, arm) + outer * 0.34 + core * 1.55) * edge;
    cloud *= smoothstep(0.22, 0.98, grain);

    vec3 bandColor = mix(uOuter, uInner, clamp(1.0 - r, 0.0, 1.0));
    bandColor = mix(bandColor, uCore, core * 0.72);
    float alpha = cloud * uOpacity;

    if (alpha < 0.006) discard;
    gl_FragColor = vec4(bandColor, alpha);
  }
`;

type ShellConfig = {
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  opacity: number;
  bandShift: number;
  inner: string;
  outer: string;
  core: string;
  parallax: number;
};

const shells: ShellConfig[] = [
  {
    scale: [1.1, 1, 1],
    position: [0, -2.2, -22],
    rotation: [-Math.PI / 2 + 0.08, 0.05, -0.1],
    opacity: 0.17,
    bandShift: 0.3,
    inner: '#57ffe2',
    outer: '#ff72ce',
    core: '#f8ffff',
    parallax: 0.018
  },
  {
    scale: [0.78, 1, 0.84],
    position: [0, -1.2, 4],
    rotation: [-Math.PI / 2 + 0.03, -0.1, -0.06],
    opacity: 0.2,
    bandShift: 2.4,
    inner: '#75ffe6',
    outer: '#b48cff',
    core: '#ffffff',
    parallax: 0.032
  },
  {
    scale: [1.34, 1, 1.08],
    position: [0, -4.4, -72],
    rotation: [-Math.PI / 2 + 0.12, 0.14, -0.15],
    opacity: 0.08,
    bandShift: 5.1,
    inner: '#42dfff',
    outer: '#ff8cd9',
    core: '#dffaff',
    parallax: 0.006
  }
];

function makeMaterial(config: ShellConfig, quality: VisualQuality) {
  const multiplier = quality === 'performance' ? 0.62 : quality === 'balanced' ? 0.82 : 1;
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: config.opacity * multiplier },
      uInner: { value: new THREE.Color(config.inner) },
      uOuter: { value: new THREE.Color(config.outer) },
      uCore: { value: new THREE.Color(config.core) },
      uBandShift: { value: config.bandShift }
    },
    vertexShader: shellVertex,
    fragmentShader: shellFragment,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false
  });
}

function Shell({ config, quality }: { config: ShellConfig; quality: VisualQuality }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const material = useMemo(() => makeMaterial(config, quality), [config, quality]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (!group.current) return;
    group.current.position.x = config.position[0] - camera.position.x * config.parallax;
    group.current.position.y = config.position[1] - camera.position.y * config.parallax * 0.16;
    group.current.position.z = config.position[2] - camera.position.z * config.parallax * 0.36;
  });

  return (
    <group ref={group} position={config.position} rotation={config.rotation} scale={config.scale}>
      <mesh renderOrder={-4}>
        <planeGeometry args={[260, 124, 1, 1]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export default memo(function NebulaShells({ visualQuality }: { visualQuality: VisualQuality }) {
  return (
    <group>
      {shells.map((config) => (
        <Shell key={config.bandShift} config={config} quality={visualQuality} />
      ))}
    </group>
  );
});
