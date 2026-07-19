import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { QUALITY_PRESETS } from '../performance/quality';
import { CosmicOperaScene } from './CosmicOperaScene';
import type { CosmicOperaSceneProps } from './scene-contract';
import { WebglContextGuard } from './WebglContextGuard';

export interface CosmicOperaStageProps extends CosmicOperaSceneProps {
  onFail: () => void;
}

export default function CosmicOperaStage({ onFail, ...props }: CosmicOperaStageProps) {
  const preset = QUALITY_PRESETS[props.quality];

  return (
    <Canvas
      camera={{ position: [0, 5, 92], fov: 50, near: 0.1, far: 320 }}
      dpr={preset.dpr}
      gl={{
        antialias: props.quality !== 'performance',
        alpha: false,
        powerPreference: 'high-performance'
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#020100');
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <WebglContextGuard onFail={onFail} />
      <CosmicOperaScene {...props} />
    </Canvas>
  );
}
