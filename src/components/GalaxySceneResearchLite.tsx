import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import type { GalaxyMode, Selection } from '../App';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';
import type { Dynasty, Poet } from '../data/poetry';
import { poetById, poets } from '../data/poetry';
import { poetWorldPosition } from '../lib/galaxy';
import GpuStarfield from './GpuStarfield';
import NebulaClouds from './NebulaClouds';
import NebulaShells from './NebulaShells';
import PoetBurstCloud from './PoetBurstCloud';
import SceneEffects from './SceneEffects';

type Props = {
  mode: GalaxyMode;
  focusId: string;
  activeDynasties: Dynasty[];
  filteredPoets: Poet[];
  selection: Selection;
  visualQuality: VisualQuality;
  onSelectPoet: (poet: Poet) => void;
};

function CameraRig({ focusId, mode }: { focusId: string; mode: GalaxyMode }) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const time = useRef(0);
  useFrame((_, delta) => {
    const cam = camera.current;
    if (!cam) return;
    time.current += delta;
    const poet = poetById[focusId] ?? poets[0];
    const target = poetWorldPosition(poet);
    const distance = mode === 'reading' ? 20 : mode === 'network' ? 72 : 54;
    const height = mode === 'reading' ? 14 : mode === 'network' ? 40 : 26;
    const orbit = time.current * (mode === 'tour' ? 0.12 : 0.018);
    const desired = target.clone().add(new THREE.Vector3(Math.cos(orbit) * distance, height, Math.sin(orbit) * distance * 0.76));
    cam.position.lerp(desired, 0.025);
    cam.lookAt(target);
    cam.fov = THREE.MathUtils.lerp(cam.fov, mode === 'reading' ? 42 : mode === 'network' ? 54 : 50, 0.04);
    cam.updateProjectionMatrix();
  });
  return <PerspectiveCamera ref={camera} makeDefault position={[64, 32, 72]} fov={50} />;
}

function ResearchScene(props: Props) {
  return (
    <>
      <CameraRig focusId={props.focusId} mode={props.mode} />
      <ambientLight intensity={0.035} />
      <pointLight position={[0, 28, 0]} intensity={0.22} color="#c9ffff" />
      <NebulaShells visualQuality={props.visualQuality} />
      <NebulaClouds visualQuality={props.visualQuality} />
      <GpuStarfield activeDynasties={props.activeDynasties} visualQuality={props.visualQuality} />
      <PoetBurstCloud poet={props.selection.poet} mode={props.mode} visualQuality={props.visualQuality} />
      <SceneEffects mode={props.mode} visualQuality={props.visualQuality} />
    </>
  );
}

export default function GalaxySceneResearchLite(props: Props) {
  const preset = RENDER_PRESETS[props.visualQuality];
  return (
    <Canvas dpr={preset.dpr} gl={{ antialias: props.visualQuality !== 'performance', powerPreference: 'high-performance', alpha: false }} onCreated={({ gl }) => {
      gl.setClearColor('#00020a');
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.outputColorSpace = THREE.SRGBColorSpace;
    }}>
      <color attach="background" args={['#00020a']} />
      <fog attach="fog" args={['#00030d', 150, 360]} />
      <ResearchScene {...props} />
    </Canvas>
  );
}
