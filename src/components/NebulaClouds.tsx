import { memo, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';
import { generateNebulaBuffers } from '../lib/galaxy';

const nebulaVertex = `
  attribute float size;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  uniform float uMaxSize;
  varying vec3 vColor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depthScale = 150.0 / max(30.0, -mvPosition.z);
    vColor = color;
    gl_PointSize = clamp(size * uBaseSize * depthScale * uPixelRatio, 0.75, uMaxSize);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const nebulaFragment = `
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float body = exp(-r2 * 5.4);
    float core = exp(-r2 * 24.0) * 0.16;
    float alpha = (body * 0.78 + core) * uOpacity;

    if (alpha < 0.006) discard;

    vec3 color = vColor * (0.82 + core * 0.28);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default memo(function NebulaClouds({ visualQuality }: { visualQuality: VisualQuality }) {
  const preset = RENDER_PRESETS[visualQuality];
  const data = useMemo(() => generateNebulaBuffers(preset.nebulaCount), [preset.nebulaCount]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const sizes = new Float32Array(data.positions.length / 3);
    for (let i = 0; i < sizes.length; i += 1) {
      sizes[i] = 0.42 + (((i * 9301) % 997) / 997) * 0.78;
    }
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.computeBoundingSphere();
    return g;
  }, [data]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
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

  return <points geometry={geometry} material={material} frustumCulled={false} />;
});
