import { Bloom, DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { QUALITY_PRESETS, type VisualQuality } from '../performance/quality';
import type { GalaxyMode } from '../state/galaxy-reducer';

interface ScenePostProcessingProps {
  quality: VisualQuality;
  mode: GalaxyMode;
}

export function ScenePostProcessing({ quality, mode }: ScenePostProcessingProps) {
  const preset = QUALITY_PRESETS[quality];
  if (!preset.bloom) return null;

  const useDepthOfField = quality === 'cinematic' && mode === 'poem' && preset.depthOfField;

  return (
    <EffectComposer multisampling={quality === 'cinematic' ? 4 : 0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={mode === 'poem' ? 1.25 : 0.82}
        luminanceThreshold={0.68}
        luminanceSmoothing={0.28}
        radius={0.7}
      />
      {useDepthOfField ? (
        <DepthOfField focusDistance={0.012} focalLength={0.032} bokehScale={2.2} height={540} />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
}
