import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VisualQuality } from '../config/renderPresets';
import { RENDER_PRESETS } from '../config/renderPresets';
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
  uniform float uPointScale;
  uniform float uMaxPointSize;
  uniform float uTwinkleAmp;
  uniform float uDynastyFade;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vTwinkle;
  varying float vNearness;

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
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float viewDepth = max(6.0, -mvPosition.z);
    float pulse = 1.0 + uTwinkleAmp * sin(uTime * 0.55 + twinkle * 6.2831853);
    float nearness = clamp(1.0 - viewDepth / 210.0, 0.0, 1.0);
    float foregroundBoost = 1.0 + pow(nearness, 2.4) * 2.65;
    float farDimming = clamp(viewDepth / 260.0, 0.34, 1.0);

    vColor = color * mix(vec3(uDynastyFade), vec3(1.0), active) * (0.72 + foregroundBoost * 0.16);
    vAlpha = mix(0.045, 0.92, active) * farDimming;
    vTwinkle = twinkle;
    vNearness = nearness;

    gl_PointSize = clamp(
      size * pulse * foregroundBoost * (uPointScale / viewDepth) * uPixelRatio,
      0.56,
      uMaxPointSize
    );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vTwinkle;
  varying float vNearness;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float body = exp(-r2 * mix(11.5, 6.8, vNearness));
    float core = exp(-r2 * 58.0);
    float halo = smoothstep(1.0, 0.12, r2) * mix(0.025, 0.085, vNearness);
    float alpha = (body * 0.7 + core * 0.2 + halo) * vAlpha;

    if (alpha < 0.01) discard;

    vec3 bloomTint = vColor * (0.9 + core * 0.64 + vTwinkle * 0.035 + vNearness * 0.12);
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

const GpuStarfield = memo(function GpuStarfield({ activeDynasties, visualQuality }: { activeDynasties: Dynasty[]; visualQuality: VisualQuality }) {
  const points = useRef<THREE.Points>(null);
  const preset = RENDER_PRESETS[visualQuality];
  const galaxy = useMemo(() => generateGalaxyBuffers(preset.starCount), [preset.starCount]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const twinkle = new Float32Array(galaxy.total);

    for (let i = 0; i < galaxy.total; i += 1) {
      twinkle[i] = ((i * 16807) % 997) / 997;
    }

    g.setAttribute('position', new THREE.BufferAttribute(galaxy.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(galaxy.colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(galaxy.sizes, 1));
    g.setAttribute('dynasty', new THREE.Uint8BufferAttribute(galaxy.dynastyIndex, 1));
    g.setAttribute('twinkle', new THREE.BufferAttribute(twinkle, 1));
    g.computeBoundingSphere();
    return g;
  }, [galaxy]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, preset.starPixelRatioCap) },
          uActiveDynasties: { value: createDynastyMask(activeDynasties) },
          uPointScale: { value: preset.starPointScale },
          uMaxPointSize: { value: preset.starPointMax },
          uTwinkleAmp: { value: preset.twinkleAmplitude },
          uDynastyFade: { value: 0.1 }
        },
        vertexShader,
        fragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      }),
    []
  );

  useEffect(() => {
    material.uniforms.uActiveDynasties.value = createDynastyMask(activeDynasties);
  }, [activeDynasties, material]);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, preset.starPixelRatioCap);
    material.uniforms.uPointScale.value = preset.starPointScale;
    material.uniforms.uMaxPointSize.value = preset.starPointMax;
    material.uniforms.uTwinkleAmp.value = preset.twinkleAmplitude;
  }, [material, preset]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (!points.current) return;
    points.current.rotation.y = 0;
    points.current.rotation.z = 0;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
});

export default GpuStarfield;
