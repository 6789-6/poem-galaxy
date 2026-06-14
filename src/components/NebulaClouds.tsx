import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';
import { generateNebulaBuffers } from '../lib/galaxy';

const nebulaVertex = `
  attribute float size;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  uniform float uMaxSize;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depthScale = 160.0 / max(20.0, -mvPosition.z);
    vColor = color;
    vPulse = 0.96 + 0.04 * sin(uTime * 0.4 + position.x * 0.03 + position.z * 0.02);
    gl_PointSize = clamp(size * uBaseSize * depthScale * uPixelRatio, 1.0, uMaxSize);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const nebulaFragment = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float body = exp(-r2 * 3.8);
    float core = exp(-r2 * 18.0) * 0.22;
    float edge = smoothstep(1.0, 0.22, 1.0 - r2);
    float alpha = (body + core) * edge * uOpacity * vPulse;

    if (alpha < 0.008) discard;

    vec3 color = vColor * (0.76 + core * 0.35);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default memo(function NebulaClouds({ visualQuality }: { visualQuality: VisualQuality }) {
  const preset = RENDER_PRESETS[visualQuality];
  const group = useRef<THREE.Points>(null);
  const data = useMemo(() => generateNebulaBuffers(preset.nebulaCount), [preset.nebulaCount]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const sizes = new Float32Array(data.positions.length / 3);
    for (let i = 0; i < sizes.length; i += 1) {
      sizes[i] = 0.38 + (((i * 9301) % 997) / 997) * 0.92;
    }
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.computeBoundingSphere();
    return g;
  }, [data]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, preset.nebula.pixelRatioCap) },
      uBaseSize: { value: preset.nebula.baseSize },
      uMaxSize: { value: preset.nebula.maxSize },
      uOpacity: { value: preset.nebula.opacity }
    },
    vertexShader: nebulaVertex,
    fragmentShader: nebulaFragment,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  }), []);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, preset.nebula.pixelRatioCap);
    material.uniforms.uBaseSize.value = preset.nebula.baseSize;
    material.uniforms.uMaxSize.value = preset.nebula.maxSize;
    material.uniforms.uOpacity.value = preset.nebula.opacity;
  }, [material, preset]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.018) * 0.07;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.012) * 0.022;
  });

  return <points ref={group} geometry={geometry} material={material} frustumCulled={false} />;
});
