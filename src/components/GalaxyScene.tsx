import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GalaxyMode, Selection } from '../App';
import type { Dynasty, Poet } from '../data/poetry';
import { dynastyColors, dynastyOrder, poetById, poets } from '../data/poetry';
import { buildRelationshipSegments, generateGalaxyBuffers, generateNebulaBuffers, poetWorldPosition } from '../lib/galaxy';

type SceneProps = {
  mode: GalaxyMode;
  focusId: string;
  activeDynasties: Dynasty[];
  filteredPoets: Poet[];
  selection: Selection;
  onSelectPoet: (poet: Poet) => void;
};

const dynastySetFromList = (items: Dynasty[]) => new Set(items);

function CameraRig({ focusId, mode }: { focusId: string; mode: GalaxyMode }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(8, 22, 0));
  const clock = useRef(0);

  useEffect(() => {
    const poet = poetById[focusId] ?? poets[0];
    target.current.copy(poetWorldPosition(poet));
  }, [focusId]);

  useFrame((_, delta) => {
    clock.current += delta;
    const focus = target.current;
    const desired = new THREE.Vector3(
      focus.x + (mode === 'reading' ? 8 : 22) + Math.sin(clock.current * 0.08) * 8,
      focus.y + (mode === 'tour' ? 18 : 10),
      focus.z + (mode === 'network' ? 36 : 22) + Math.cos(clock.current * 0.07) * 8
    );
    camera.position.lerp(desired, mode === 'tour' ? 0.009 : 0.035);
    camera.lookAt(focus);
  });

  return null;
}

const GalaxyDust = memo(function GalaxyDust({ activeDynasties }: { activeDynasties: Dynasty[] }) {
  const galaxy = useMemo(() => generateGalaxyBuffers(82000), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(galaxy.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(galaxy.colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(galaxy.sizes, 1));
    return g;
  }, [galaxy]);

  const active = useMemo(() => dynastySetFromList(activeDynasties), [activeDynasties]);

  useFrame(() => {
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    for (let i = 0; i < galaxy.total; i += 400) {
      const dynasty = dynastyOrder[galaxy.dynastyIndex[i]];
      const multiplier = active.has(dynasty) ? 1 : 0.14;
      colorAttr.setXYZ(i, colorAttr.getX(i) * multiplier + 0.006, colorAttr.getY(i) * multiplier + 0.006, colorAttr.getZ(i) * multiplier + 0.012);
    }
    colorAttr.needsUpdate = true;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={0.085}
        sizeAttenuation
        transparent
        opacity={0.82}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

function NebulaClouds() {
  const nebula = useMemo(() => generateNebulaBuffers(16000), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(nebula.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(nebula.colors, 3));
    return g;
  }, [nebula]);

  const group = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.025) * 0.08;
  });

  return (
    <points ref={group} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={1.6}
        sizeAttenuation
        transparent
        opacity={0.08}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function PoetStar({ poet, selected, dimmed, onSelect }: { poet: Poet; selected: boolean; dimmed: boolean; onSelect: (poet: Poet) => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const color = dynastyColors[poet.dynasty];

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4 + poet.position[0]) * 0.08;
    if (mesh.current) mesh.current.scale.setScalar((0.75 + poet.brightness * 0.55) * pulse * (selected ? 1.35 : 1));
    if (halo.current) halo.current.scale.setScalar((2.4 + poet.brightness * 1.4) * (selected ? 1.6 : 1) * pulse);
  });

  return (
    <group position={poet.position}>
      <mesh ref={halo} renderOrder={0}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.06 : selected ? 0.28 : 0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={mesh} onClick={(event) => { event.stopPropagation(); onSelect(poet); }}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={selected ? 3.6 : 1.8} color="#fff8dc" roughness={0.25} metalness={0.1} transparent opacity={dimmed ? 0.35 : 1} />
      </mesh>
      <Billboard>
        <Html center distanceFactor={selected ? 7 : 10} className="star-label-wrap">
          <button className={`star-label ${selected ? 'selected' : ''}`} onClick={() => onSelect(poet)}>
            <span>{poet.name}</span>
            <small>{poet.dynasty}</small>
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
      <lineBasicMaterial vertexColors transparent opacity={mode === 'network' ? 0.52 : 0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function DynastyRings() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {dynastyOrder.map((dynasty, index) => (
        <mesh key={dynasty} position={[-44 + index * 18, 0, 0]}>
          <torusGeometry args={[17 + index * 5, 0.015, 8, 160]} />
          <meshBasicMaterial color={dynastyColors[dynasty]} transparent opacity={0.16} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ mode, focusId, activeDynasties, filteredPoets, selection, onSelectPoet }: SceneProps) {
  const selectedPoetId = selection.kind === 'poet' ? selection.poet.id : selection.poet.id;
  const visiblePoetIds = useMemo(() => new Set(filteredPoets.map((poet) => poet.id)), [filteredPoets]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[35, 28, 46]} fov={56} />
      <CameraRig focusId={focusId} mode={mode} />
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 50, 0]} intensity={1.8} color="#9fe8ff" />
      <pointLight position={[50, -20, 20]} intensity={1.2} color="#ffc46b" />
      <NebulaClouds />
      <GalaxyDust activeDynasties={activeDynasties} />
      <DynastyRings />
      <RelationshipNetwork activePoetId={selectedPoetId} mode={mode} />
      {poets.map((poet) => (
        <PoetStar
          key={poet.id}
          poet={poet}
          selected={poet.id === selectedPoetId}
          dimmed={!visiblePoetIds.has(poet.id)}
          onSelect={onSelectPoet}
        />
      ))}
      <OrbitControls enableDamping dampingFactor={0.06} rotateSpeed={0.35} zoomSpeed={0.65} minDistance={8} maxDistance={160} />
    </>
  );
}

export default function GalaxyScene(props: SceneProps) {
  return (
    <Canvas dpr={[1, 1.7]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#03040d', 80, 210]} />
      <SceneContent {...props} />
    </Canvas>
  );
}
