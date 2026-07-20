import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { GalaxyMode } from '../App';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';

export default function SceneEffects({ mode, visualQuality }: { mode: GalaxyMode; visualQuality: VisualQuality }) {
  const preset = RENDER_PRESETS[visualQuality];
  const bloom = preset.bloom;
  const dof = mode === 'reading' ? preset.dof : null;

  if (!bloom) return null;

  return (
    <EffectComposer multisampling={preset.multisampling} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        luminanceThreshold={bloom.threshold}
        luminanceSmoothing={bloom.smoothing}
        intensity={mode === 'reading' ? bloom.intensityReading : bloom.intensity}
        radius={bloom.radius}
      />
      {dof && (
        <DepthOfField
          focusDistance={dof.focusDistance}
          focalLength={dof.focalLength}
          bokehScale={dof.bokehScale}
          height={dof.height}
        />
      )}
      {preset.vignette && <Vignette eskil={false} offset={0.18} darkness={0.66} />}
    </EffectComposer>
  );
}
