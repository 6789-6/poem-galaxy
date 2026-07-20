import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GalaxyMode, Selection } from '../App';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';
import type { Dynasty, Poet } from '../data/poetry';
import { poetById, poets } from '../data/poetry';
import { buildRelationshipSegments, poetWorldPosition } from '../lib/galaxy';
import GpuStarfield from './GpuStarfield';
import NebulaClouds from './NebulaClouds';
import PoetBurstCloud from './PoetBurstCloud';
import SceneEffects from './SceneEffects';

type SceneProps = {
  mode: GalaxyMode;
  focusId: string;
  activeDynasties: Dynasty[];
  filteredPoets: Poet[];
  selection: Selection;
  visualQuality: VisualQuality;
  onSelectPoet: (poet: Poet) => void;
};

const accentByDynasty: Record<Dynasty, string> = {
  '先秦': '#58f3ff',
  '汉魏六朝': '#948cff',
  '唐': '#d8fbff',
  '宋': '#73ffd8',
  '元明清': '#e08cff',
  '近现代': '#a8c8ff'
};

function accent(dynasty: Dynasty) {
  return accentByDynasty[dynasty];
}

function smooth(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function cameraOffset(mode: GalaxyMode, orbit: number) {
  const distance = mode === 'reading' ? 20 : mode === 'network' ? 72 : mode === 'tour' ? 96 : 46;
  const height = mode === 'reading' ? 14 : mode === 'network' ? 40 : mode === 'tour' ? 42 : 24;
  return new THREE.Vector3(Math.cos(orbit) * distance, height, Math.sin(orbit) * distance * 0.76);
}

function CleanCameraRig({ focusId, mode, visualQuality }: { focusId: string; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const { camera } = useThree();
  const focus = useRef(new THREE.Vector3());
  const clock = useRef(0);
  const flight = useRef({
    active: false,
    t: 1,
    duration: 2,
    start: new THREE.Vector3(),
    mid: new THREE.Vector3(),
    end: new THREE.Vector3(),
    lookStart: new THREE.Vector3(),
    lookEnd: new THREE.Vector3()
  });
  const lastKey = useRef(`${focusId}-${mode}`);

  useEffect(() => {
    const poet = poetById[focusId] ?? poets[0];
    const target = poetWorldPosition(poet);
    focus.current.copy(target);
    const key = `${focusId}-${mode}`;
    if (lastKey.current === key) return;

    const route = flight.current;
    const start = camera.position.clone();
    const orbit = Math.atan2(start.z - target.z, start.x - target.x) + 0.72;
    const end = target.clone().add(cameraOffset(mode, orbit));
    const outward = start.clone().sub(target).normalize();
    const side = new THREE.Vector3(-outward.z, 0, outward.x).normalize();
    const pullback = mode === 'network' ? 120 : mode === 'reading' ? 76 : 92;
    const lift = mode === 'network' ? 58 : 42;

    route.active = true;
    route.t = 0;
    route.duration = visualQuality === 'performance' ? 1.3 : mode === 'network' ? 2.35 : 1.9;
    route.start.copy(start);
    route.mid.copy(target).addScaledVector(outward, pullback).addScaledVector(side, 24).add(new THREE.Vector3(0, lift, 0));
    route.end.copy(end);
    route.lookStart.copy(focus.current);
    route.lookEnd.copy(target);
    lastKey.current = key;
  }, [camera, focusId, mode, visualQuality]);

  useFrame((_, delta) => {
    const perspective = camera as THREE.PerspectiveCamera;
    clock.current += delta * (visualQuality === 'performance' ? 0.25 : 0.7);
    const target = focus.current;
    const route = flight.current;

    if (route.active) {
      route.t = Math.min(1, route.t + delta / route.duration);
      const t = smooth(route.t);
      const inv = 1 - t;
      const position = route.start.clone().multiplyScalar(inv * inv)
        .add(route.mid.clone().multiplyScalar(2 * inv * t))
        .add(route.end.clone().multiplyScalar(t * t));
      const rush = Math.sin(t * Math.PI);
      camera.position.copy(position).add(new THREE.Vector3(
        Math.sin(clock.current * 2.3) * 0.22 * rush,
        Math.sin(clock.current * 1.7) * 0.12 * rush,
        Math.cos(clock.current * 2.1) * 0.18 * rush
      ));
      camera.lookAt(route.lookEnd.clone().lerp(route.lookStart, Math.max(0, 1 - t * 1.4)));
      perspective.fov = THREE.MathUtils.lerp(68 + rush * 4, mode === 'reading' ? 42 : mode === 'network' ? 54 : 48, t);
      perspective.updateProjectionMatrix();
      if (route.t >= 1) route.active = false;
      return;
    }

    const orbit = mode === 'tour' ? clock.current * 0.12 : clock.current * 0.012;
    camera.position.lerp(target.clone().add(cameraOffset(mode, orbit)), mode === 'tour' ? 0.012 : 0.026);
    camera.lookAt(target);
    perspective.fov = THREE.MathUtils.lerp(perspective.fov, mode === 'reading' ? 42 : mode === 'network' ? 54 : 51, 0.04);
    perspective.updateProjectionMatrix();
  });

  return null;
}

function CleanPoetStar({ poet, selected, dimmed, onSelect }: { poet: Poet; selected: boolean; dimmed: boolean; onSelect: (poet: Poet) => void }) {
  const group = useRef<THREE.Group>(null);
  const star = useRef<THREE.Mesh>(null);
  const color = accent(poet.dynasty);

  useFrame(({ clock }) => {
    if (!group.current || !star.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.2 + poet.position[0]) * 0.035;
    star.current.scale.setScalar((0.42 + poet.brightness * 0.34) * (selected ? 1.3 : 1) * pulse);
    group.current.rotation.y = clock.elapsedTime * 0.08;
  });

  return (
    <group ref={group} position={poet.position}>
      {selected && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.6, 0.012, 8, 180]} />
            <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.6, 0.2]}>
            <torusGeometry args={[5.8, 0.008, 8, 180]} />
            <meshBasicMaterial color="#eaffff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </>
      )}
      <mesh ref={star} onClick={(event) => { event.stopPropagation(); onSelect(poet); }}>
        <sphereGeometry args={[0.46, 28, 28]} />
        <meshBasicMaterial color="#f7ffff" transparent opacity={dimmed ? 0.22 : 1} toneMapped={false} />
      </mesh>
      {selected && (
        <Billboard position={[0, 3.8, 0]}>
          <Html center distanceFactor={9} className="star-label-wrap clean-star-label">
            <button className="star-label selected" onClick={() => onSelect(poet)}>{poet.name}</button>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

function CleanRelationshipNetwork({ activePoetId, mode }: { activePoetId: string; mode: GalaxyMode }) {
  const lineRef = useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const progress = useRef(0);
  const visible = mode === 'network' || mode === 'reading';
  const lines = useMemo(() => buildRelationshipSegments(mode === 'network' ? undefined : activePoetId), [activePoetId, mode]);
  const total = lines.positions.length / 3;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(lines.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(lines.colors, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [lines]);

  useEffect(() => {
    progress.current = 0;
    geometry.setDrawRange(0, 0);
  }, [geometry, activePoetId, mode]);

  useFrame((_, delta) => {
    if (!visible || !materialRef.current) return;
    progress.current = Math.min(1, progress.current + delta * (mode === 'network' ? 0.5 : 0.3));
    const reveal = smooth(progress.current);
    geometry.setDrawRange(0, Math.max(2, Math.floor(total * reveal)));
    materialRef.current.opacity = (mode === 'network' ? 0.42 : 0.16) * reveal;
  });

  if (!visible) return null;
  return (
    <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial ref={materialRef} vertexColors transparent opacity={0.01} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
}

function SceneContent({ mode, focusId, activeDynasties, filteredPoets, selection, visualQuality, onSelectPoet }: SceneProps) {
  const selectedPoet = selection.poet;
  const selectedPoetId = selectedPoet.id;
  const visiblePoetIds = useMemo(() => new Set(filteredPoets.map((poet) => poet.id)), [filteredPoets]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[58, 30, 68]} fov={51} />
      <CleanCameraRig focusId={focusId} mode={mode} visualQuality={visualQuality} />
      <ambientLight intensity={0.035} />
      <pointLight position={[0, 28, 0]} intensity={0.22} color="#c9ffff" />
      <NebulaClouds visualQuality={visualQuality} />
      <GpuStarfield activeDynasties={activeDynasties} visualQuality={visualQuality} />
      <PoetBurstCloud poet={selectedPoet} mode={mode} visualQuality={visualQuality} />
      <CleanRelationshipNetwork activePoetId={selectedPoetId} mode={mode} />
      {poets.map((poet) => (
        <CleanPoetStar key={poet.id} poet={poet} selected={poet.id === selectedPoetId} dimmed={!visiblePoetIds.has(poet.id)} onSelect={onSelectPoet} />
      ))}
      <SceneEffects mode={mode} visualQuality={visualQuality} />
      <OrbitControls enableDamping dampingFactor={0.06} rotateSpeed={0.28} zoomSpeed={0.55} minDistance={11} maxDistance={210} />
    </>
  );
}

export default function GalaxySceneClean(props: SceneProps) {
  const preset = RENDER_PRESETS[props.visualQuality];
  return (
    <Canvas
      dpr={preset.dpr}
      gl={{ antialias: props.visualQuality !== 'performance', powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#00020a');
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={['#00020a']} />
      <fog attach="fog" args={['#00030d', 150, 360]} />
      <SceneContent {...props} />
    </Canvas>
  );
}
