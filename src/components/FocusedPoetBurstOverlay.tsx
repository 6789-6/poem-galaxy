import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { GalaxyMode, VisualQuality } from '../App';
import type { Poet } from '../data/poetry';
import FocusedPoetBurst from './FocusedPoetBurst';

function OverlayScene({ poet, mode, visualQuality }: { poet: Poet; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const overlayPoet = { ...poet, position: [0, 0, 0] as [number, number, number] };
  return (
    <>
      <perspectiveCamera makeDefault position={[0, 8, 36]} fov={43} />
      <ambientLight intensity={0.16} />
      <pointLight position={[0, 8, 18]} intensity={0.8} color="#7ffcff" />
      <FocusedPoetBurst poet={overlayPoet} mode={mode} visualQuality={visualQuality} />
    </>
  );
}

export default function FocusedPoetBurstOverlay({ poet, mode, visualQuality, hidden }: { poet: Poet; mode: GalaxyMode; visualQuality: VisualQuality; hidden: boolean }) {
  if (hidden || visualQuality === 'performance') return null;
  return (
    <div className="focused-burst-overlay" aria-hidden="true">
      <Canvas
        dpr={visualQuality === 'cinematic' ? [1, 1.6] : [1, 1.25]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <OverlayScene poet={poet} mode={mode} visualQuality={visualQuality} />
      </Canvas>
    </div>
  );
}
