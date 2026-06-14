import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { memo, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';
import type { GalaxyMode, Selection } from '../App';
import type { Dynasty, Poet } from '../data/poetry';
import { dynastyColors, dynastyOrder, poemsByPoet, poetById, poets } from '../data/poetry';
import { buildRelationshipSegments, generateGalaxyBuffers, generateNebulaBuffers, poetWorldPosition } from '../lib/galaxy';
import GpuStarfield from './GpuStarfield';

type SceneProps = {
  mode: GalaxyMode;
  focusId: string;
  activeDynasties: Dynasty[];
  filteredPoets: Poet[];
  selection: Selection;
  onSelectPoet: (poet: Poet) => void;
};

const dynastySetFromList = (items: Dynasty[]) => new Set(items);

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const splitPoemLines = (text: string) =>
  (text.match(/[^，。！？；]+[，。！？；]?/g) ?? [text]).map((line) => line.trim()).filter(Boolean);

function CameraRig({ focusId, mode }: { focusId: string; mode: GalaxyMode }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(8, 22, 0));
  const clock = useRef(0);
  const lastFocus = useRef(focusId);
  const flightBoost = useRef(0);

  useEffect(() => {
    const poet = poetById[focusId] ?? poets[0];
    target.current.copy(poetWorldPosition(poet));
    if (lastFocus.current !== focusId) {
      flightBoost.current = 1;
      lastFocus.current = focusId;
    }
  }, [focusId]);

  useFrame((_, delta) => {
    clock.current += delta;
    flightBoost.current = Math.max(0, flightBoost.current - delta * 0.72);
    const focus = target.current;
    const orbit = mode === 'tour' ? clock.current * 0.22 : clock.current * 0.06;
    const fly = flightBoost.current;
    const distance = mode === 'reading' ? 14 + fly * 12 : mode === 'network' ? 58 : mode === 'tour' ? 72 : 32 + fly * 24;
    const height = mode === 'network' ? 30 : mode === 'tour' ? 30 + Math.sin(clock.current * 0.18) * 8 : 13 + fly * 10;
    const desired = new THREE.Vector3(
      focus.x + Math.cos(orbit + fly * 1.4) * distance,
      focus.y + height,
      focus.z + Math.sin(orbit + fly * 1.4) * distance * 0.78
    );
    camera.position.lerp(desired, mode === 'tour' ? 0.012 : fly > 0.05 ? 0.065 : 0.04);
    camera.lookAt(focus);
  });

  return null;
}

const GalaxyDust = memo(function GalaxyDust({ activeDynasties }: { activeDynasties: Dynasty[] }) {
  const galaxy = useMemo(() => generateGalaxyBuffers(150000), []);
  const baseColors = useMemo(() => new Float32Array(galaxy.colors), [galaxy]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(galaxy.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(galaxy.colors), 3));
    g.setAttribute('size', new THREE.BufferAttribute(galaxy.sizes, 1));
    return g;
  }, [galaxy]);

  useEffect(() => {
    const active = dynastySetFromList(activeDynasties);
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    for (let i = 0; i < galaxy.total; i += 1) {
      const dynasty = dynastyOrder[galaxy.dynastyIndex[i]];
      const multiplier = active.has(dynasty) ? 1 : 0.08;
      colorAttr.setXYZ(
        i,
        baseColors[i * 3] * multiplier + 0.004,
        baseColors[i * 3 + 1] * multiplier + 0.004,
        baseColors[i * 3 + 2] * multiplier + 0.01
      );
    }
    colorAttr.needsUpdate = true;
  }, [activeDynasties, baseColors, galaxy, geometry]);

  const points = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = Math.sin(clock.elapsedTime * 0.018) * 0.035;
    points.current.rotation.z = Math.sin(clock.elapsedTime * 0.011) * 0.01;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial vertexColors size={0.078} sizeAttenuation transparent opacity={0.92} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
});

function DeepField() {
  const data = useMemo(() => {
    const random = mulberry32(40811);
    const count = 4200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 180 + random() * 120;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius * 0.65;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
      const tone = 0.25 + random() * 0.75;
      colors[i * 3] = tone;
      colors[i * 3 + 1] = tone * (0.9 + random() * 0.18);
      colors[i * 3 + 2] = Math.min(1, tone * 1.22);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  return (
    <points geometry={data} frustumCulled={false}>
      <pointsMaterial vertexColors size={0.22} sizeAttenuation transparent opacity={0.62} depthWrite={false} />
    </points>
  );
}

function NebulaClouds() {
  const nebula = useMemo(() => generateNebulaBuffers(36000), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(nebula.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(nebula.colors, 3));
    return g;
  }, [nebula]);

  const group = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.02) * 0.08;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.013) * 0.025;
  });

  return (
    <points ref={group} geometry={geometry} frustumCulled={false}>
      <pointsMaterial vertexColors size={1.85} sizeAttenuation transparent opacity={0.105} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function PoemOrbitCloud({ poet, mode }: { poet: Poet; mode: GalaxyMode }) {
  const color = dynastyColors[poet.dynasty];
  const group = useRef<THREE.Group>(null);
  const data = useMemo(() => {
    const random = mulberry32(poet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 911));
    const count = mode === 'reading' ? 2300 : 1050;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color(color);
    for (let i = 0; i < count; i += 1) {
      const radius = 3.5 + Math.pow(random(), 0.58) * (mode === 'reading' ? 16 : 9);
      const angle = random() * Math.PI * 2;
      const band = Math.floor(random() * 5);
      const tilt = (band - 2) * 0.34;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle * 2.2) * 0.9 + Math.sin(angle) * radius * tilt * 0.12;
      positions[i * 3 + 2] = Math.sin(angle) * radius * (0.64 + band * 0.07);
      const glow = 0.44 + random() * 0.72;
      colors[i * 3] = Math.min(1, baseColor.r * glow + 0.18);
      colors[i * 3 + 1] = Math.min(1, baseColor.g * glow + 0.14);
      colors[i * 3 + 2] = Math.min(1, baseColor.b * glow + 0.2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [color, mode, poet.id]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.13;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <group ref={group} position={poet.position}>
      <points geometry={data} frustumCulled={false}>
        <pointsMaterial vertexColors size={0.11} sizeAttenuation transparent opacity={mode === 'reading' ? 0.9 : 0.68} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {[4.2, 7.6, 11.2, 15.1].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.1, 0.2 * index, index * 0.45]}>
          <torusGeometry args={[radius, 0.018, 6, 180]} />
          <meshBasicMaterial color={color} transparent opacity={0.18 - index * 0.03} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function FocusBeacon({ poet, mode }: { poet: Poet; mode: GalaxyMode }) {
  const group = useRef<THREE.Group>(null);
  const color = dynastyColors[poet.dynasty];

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.55;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.6) * 0.18;
  });

  return (
    <group ref={group} position={poet.position}>
      {[3.2, 5.2, 7.4].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, index * 0.65, index * 0.22]}>
          <torusGeometry args={[radius, 0.026, 10, 180]} />
          <meshBasicMaterial color={index === 1 ? '#ffffff' : color} transparent opacity={mode === 'network' ? 0.22 : 0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <mesh scale={[0.06, mode === 'reading' ? 34 : 24, 0.06]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function FloatingVerseConstellation({ selection, mode }: { selection: Selection; mode: GalaxyMode }) {
  const poet = selection.poet;
  const color = dynastyColors[poet.dynasty];
  const fragments = useMemo(() => {
    if (selection.kind === 'poem') return splitPoemLines(selection.poem.fullText).slice(0, 7);
    const localPoems = poemsByPoet[poet.id] ?? [];
    return localPoems.flatMap((poem) => splitPoemLines(poem.excerpt)).slice(0, 7);
  }, [poet.id, selection]);

  if (mode !== 'reading') return null;

  return (
    <group position={poet.position}>
      {fragments.map((line, index) => {
        const angle = (index / Math.max(1, fragments.length)) * Math.PI * 2 + index * 0.24;
        const radius = 8.5 + (index % 3) * 3.1;
        return (
          <Billboard key={`${line}-${index}`} position={[Math.cos(angle) * radius, 3.2 + Math.sin(index * 1.7) * 2.6, Math.sin(angle) * radius * 0.72]}>
            <Html center distanceFactor={9} className="floating-verse-wrap">
              <div className="floating-verse" style={{ '--accent': color, '--delay': `${index * 120}ms` } as CSSProperties}>{line}</div>
            </Html>
          </Billboard>
        );
      })}
    </group>
  );
}

function PoetryCore() {
  const core = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!core.current) return;
    core.current.rotation.y = clock.elapsedTime * 0.035;
    core.current.rotation.z = Math.sin(clock.elapsedTime * 0.08) * 0.08;
  });

  return (
    <group ref={core} position={[-2, 2, 8]}>
      <mesh scale={[21, 7.5, 21]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#6eefff" transparent opacity={0.045} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={[12, 4.4, 12]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffe6a8" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[26, 0.035, 8, 220]} />
        <meshBasicMaterial color="#92f3ff" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function PoetStar({ poet, selected, dimmed, onSelect }: { poet: Poet; selected: boolean; dimmed: boolean; onSelect: (poet: Poet) => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const outerHalo = useRef<THREE.Mesh>(null);
  const color = dynastyColors[poet.dynasty];

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4 + poet.position[0]) * 0.08;
    if (mesh.current) mesh.current.scale.setScalar((0.72 + poet.brightness * 0.54) * pulse * (selected ? 1.55 : 1));
    if (halo.current) halo.current.scale.setScalar((2.4 + poet.brightness * 1.3) * (selected ? 1.8 : 1) * pulse);
    if (outerHalo.current) outerHalo.current.scale.setScalar((5.4 + poet.brightness * 2.1) * (selected ? 1.55 : 1) * pulse);
  });

  return (
    <group position={poet.position}>
      <mesh ref={outerHalo} renderOrder={0}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.018 : selected ? 0.13 : 0.045} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={halo} renderOrder={1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.05 : selected ? 0.34 : 0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={mesh} onClick={(event) => { event.stopPropagation(); onSelect(poet); }}>
        <sphereGeometry args={[0.72, 36, 36]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={selected ? 5.2 : 2.25} color="#fff8dc" roughness={0.18} metalness={0.08} transparent opacity={dimmed ? 0.32 : 1} />
      </mesh>
      <Billboard>
        <Html center distanceFactor={selected ? 6.5 : 12} className="star-label-wrap">
          <button className={`star-label ${selected ? 'selected' : ''} ${poet.brightness > 1.45 ? 'major' : ''}`} onClick={() => onSelect(poet)}>
            <span>{poet.name}</span>
            <small>{poet.dynasty} · {Math.round(poet.brightness * 100)}L</small>
          </button>
        </Html>
      </Billboard>
    </group>
  );
}

function RelationshipNetwork({ activePoetId, mode }: { activePoetId?: string; mode: GalaxyMode }) {
  const lines = useMemo(() => buildRelationshipSegments(mode === 'network' ? undefined : activePoetId), [activePoetId, mode]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(lines.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(lines.colors, 3));
    return g;
  }, [lines]);

  if (mode !== 'network' && mode !== 'reading') return null;

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial vertexColors transparent opacity={mode === 'network' ? 0.78 : 0.34} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function NetworkAnchorLabels({ mode, onSelectPoet }: { mode: GalaxyMode; onSelectPoet: (poet: Poet) => void }) {
  if (mode !== 'network') return null;

  return (
    <group>
      {poets.map((poet) => (
        <Billboard key={poet.id} position={[poet.position[0], poet.position[1] + 4.2, poet.position[2]]}>
          <Html center distanceFactor={14} className="network-label-wrap">
            <button className="network-label-3d" style={{ '--accent': dynastyColors[poet.dynasty] } as CSSProperties} onClick={() => onSelectPoet(poet)}>
              <strong>{poet.name}</strong>
              <span>{poet.relations.length} 条航线</span>
            </button>
          </Html>
        </Billboard>
      ))}
    </group>
  );
}

function DynastyRings() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {dynastyOrder.map((dynasty, index) => (
        <group key={dynasty} position={[-52 + index * 22, 0, 0]}>
          <mesh>
            <torusGeometry args={[15 + index * 4.8, 0.014, 8, 180]} />
            <meshBasicMaterial color={dynastyColors[dynasty]} transparent opacity={0.13} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <torusGeometry args={[23 + index * 2.4, 0.008, 8, 180]} />
            <meshBasicMaterial color={dynastyColors[dynasty]} transparent opacity={0.08} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DynastySpaceLabels() {
  return (
    <group>
      {dynastyOrder.map((dynasty, index) => (
        <Billboard key={dynasty} position={[-52 + index * 22, -18, -34]}>
          <Html center className="dynasty-space-label-wrap">
            <span className="dynasty-space-label" style={{ borderColor: dynastyColors[dynasty], color: dynastyColors[dynasty] }}>{dynasty}</span>
          </Html>
        </Billboard>
      ))}
    </group>
  );
}

function SceneContent({ mode, focusId, activeDynasties, filteredPoets, selection, onSelectPoet }: SceneProps) {
  const selectedPoetId = selection.poet.id;
  const selectedPoet = selection.poet;
  const visiblePoetIds = useMemo(() => new Set(filteredPoets.map((poet) => poet.id)), [filteredPoets]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[48, 26, 58]} fov={54} />
      <CameraRig focusId={focusId} mode={mode} />
      <ambientLight intensity={0.16} />
      <pointLight position={[0, 44, 0]} intensity={2.2} color="#9fe8ff" />
      <pointLight position={[60, -22, 30]} intensity={1.5} color="#ffc46b" />
      <DeepField />
      <PoetryCore />
      <NebulaClouds />
      <GpuStarfield activeDynasties={activeDynasties} />
      <DynastyRings />
      <DynastySpaceLabels />
      <PoemOrbitCloud poet={selectedPoet} mode={mode} />
      <FocusBeacon poet={selectedPoet} mode={mode} />
      <FloatingVerseConstellation selection={selection} mode={mode} />
      <RelationshipNetwork activePoetId={selectedPoetId} mode={mode} />
      <NetworkAnchorLabels mode={mode} onSelectPoet={onSelectPoet} />
      {poets.map((poet) => (
        <PoetStar key={poet.id} poet={poet} selected={poet.id === selectedPoetId} dimmed={!visiblePoetIds.has(poet.id)} onSelect={onSelectPoet} />
      ))}
      <OrbitControls enableDamping dampingFactor={0.06} rotateSpeed={0.34} zoomSpeed={0.68} minDistance={7} maxDistance={190} />
    </>
  );
}

export default function GalaxyScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#01020a');
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={['#01020a']} />
      <fog attach="fog" args={['#020413', 95, 260]} />
      <SceneContent {...props} />
    </Canvas>
  );
}
