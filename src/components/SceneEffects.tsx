import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { GalaxyMode, VisualQuality } from '../App';

export default function SceneEffects({ mode, visualQuality }: { mode: GalaxyMode; visualQuality: VisualQuality }) {
  if (visualQuality === 'performance') return null;

  const isHigh = visualQuality === 'high';
  const isReading = mode === 'reading';
  const isNetwork = mode === 'network';

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        luminanceThreshold={1.08}
        luminanceSmoothing={0.18}
        intensity={isReading ? 0.92 : isNetwork ? 0.82 : 0.62}
        radius={isHigh ? 0.72 : 0.54}
      />
      {isHigh && isReading && (
        <DepthOfField
          focusDistance={0.018}
          focalLength={0.032}
          bokehScale={1.45}
          height={480}
        />
      )}
      {isHigh && <Vignette eskil={false} offset={0.22} darkness={0.72} />}
    </EffectComposer>
  );
}
