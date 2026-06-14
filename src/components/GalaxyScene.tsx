import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';
import type { GalaxyMode, Selection } from '../App';
import { RENDER_PRESETS, type VisualQuality } from '../config/renderPresets';
import type { Dynasty, Poet } from '../data/poetry';
import { dynastyColors, dynastyOrder, poemsByPoet, poetById, poets } from '../data/poetry';
import { buildRelationshipSegments, poetWorldPosition } from '../lib/galaxy';
import GpuStarfield from './GpuStarfield';
import NebulaClouds from './NebulaClouds';
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

const coldAccentByDynasty: Record<Dynasty, string> = {
  '先秦': '#5ff6ff',
  '汉魏六朝': '#9a8cff',
  '唐': '#bdefff',
  '宋': '#7fffd2',
  '元明清': '#d987ff',
  '近现代': '#a8c7ff'
};

function coolAccent(dynasty: Dynasty) {
  return coldAccentByDynasty[dynasty];
}

const softPointVertexShader = `
  attribute float size;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  uniform float uMaxSize;
  varying vec3 vColor;
  varying float vAlphaPulse;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depthScale = 180.0 / max(18.0, -mvPosition.z);
    float shimmer = 0.96 + 0.04 * sin(uTime * 0.25 + position.x * 0.05 + position.z * 0.04);
    vColor = color;
    vAlphaPulse = shimmer;
    gl_PointSize = clamp(size * uBaseSize * depthScale * uPixelRatio, 0.8, uMaxSize);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const softPointFragmentShader = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlphaPulse;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float body = exp(-r2 * 8.0);
    float core = exp(-r2 * 32.0) * 0.22;
    float alpha = (body * 0.72 + core) * uOpacity * vAlphaPulse;

    if (alpha < 0.01) discard;

    vec3 color = vColor * (0.7 + core * 0.45);
    gl_FragColor = vec4(color, alpha);
  }
`;

function createSoftPointMaterial(baseSize: number, opacity: number, maxSize: number, pixelRatioCap: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, pixelRatioCap) },
      uBaseSize: { value: baseSize },
      uOpacity: { value: opacity },
      uMaxSize: { value: maxSize }
    },
    vertexShader: softPointVertexShader,
    fragmentShader: softPointFragmentShader,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
}

function CameraRig({ focusId, mode, visualQuality }: { focusId: string; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(8, 22, 0));
  const clock = useRef(0);
  const lastFocus = useRef(focusId);
  const flightBoost = useRef(0);

  useEffect(() => {
    const poet = poetById[focusId] ?? poets[0];
    target.current.copy(poetWorldPosition(poet));
    if (lastFocus.current !== focusId) {
      flightBoost.current = visualQuality === 'performance' ? 0.55 : 1;
      lastFocus.current = focusId;
    }
  }, [focusId, visualQuality]);

  useFrame((_, delta) => {
    const motionScale = visualQuality === 'performance' ? 0.35 : 0.72;
    clock.current += delta * motionScale;
    flightBoost.current = Math.max(0, flightBoost.current - delta * 0.72);
    const focus = target.current;
    const orbit = mode === 'tour' ? clock.current * 0.16 : clock.current * 0.025;
    const fly = flightBoost.current;
    const distance = mode === 'reading' ? 12 + fly * 10 : mode === 'network' ? 58 : mode === 'tour' ? 72 : 34 + fly * 24;
    const height = mode === 'network' ? 34 : mode === 'tour' ? 32 + Math.sin(clock.current * 0.14) * 5 : 14 + fly * 8;
    const desired = new THREE.Vector3(
      focus.x + Math.cos(orbit + fly * 1.1) * distance,
      focus.y + height,
      focus.z + Math.sin(orbit + fly * 1.1) * distance * 0.78
    );

    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    camera.position.lerp(desired, mode === 'tour' ? 0.012 : fly > 0.05 ? 0.078 : 0.038);
    perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, fly > 0.08 ? 45 : mode === 'reading' ? 42 : 55, 0.08);
    perspectiveCamera.updateProjectionMatrix();
    camera.lookAt(focus);
  });

  return null;
}

function DeepField({ visualQuality }: { visualQuality: VisualQuality }) {
  const preset = RENDER_PRESETS[visualQuality];
  const data = useMemo(() => {
    const random = mulberry32(40811);
    const positions = new Float32Array(preset.deepFieldCount * 3);
    const colors = new Float32Array(preset.deepFieldCount * 3);
    const sizes = new Float32Array(preset.deepFieldCount);

    for (let i = 0; i < preset.deepFieldCount; i += 1) {
      const radius = 210 + random() * 150;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius * 0.72;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
      const tone = 0.16 + random() * 0.5;
      colors[i * 3] = tone * 0.5;
      colors[i * 3 + 1] = tone * (0.72 + random() * 0.16);
      colors[i * 3 + 2] = Math.min(1, tone * 1.28);
      sizes[i] = 0.34 + random() * 0.7;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();
    return geometry;
  }, [preset.deepFieldCount]);

  const material = useMemo(() => createSoftPointMaterial(0.34, preset.deepFieldOpacity, 3.0, preset.nebula.pixelRatioCap), []);

  useEffect(() => {
    material.uniforms.uOpacity.value = preset.deepFieldOpacity;
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, preset.nebula.pixelRatioCap);
  }, [material, preset]);

  useFrame(() => {
    material.uniforms.uTime.value = 0;
  });

  return <points geometry={data} material={material} frustumCulled={false} />;
}

function PoemOrbitCloud({ poet, mode, visualQuality }: { poet: Poet; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const color = coolAccent(poet.dynasty);
  const group = useRef<THREE.Group>(null);
  const data = useMemo(() => {
    const random = mulberry32(poet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 911));
    const baseCount = mode === 'reading' ? 2300 : 1050;
    const count = visualQuality === 'performance' ? Math.round(baseCount * 0.45) : baseCount;
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
      const glow = 0.4 + random() * 0.55;
      colors[i * 3] = Math.min(1, baseColor.r * glow + 0.08);
      colors[i * 3 + 1] = Math.min(1, baseColor.g * glow + 0.12);
      colors[i * 3 + 2] = Math.min(1, baseColor.b * glow + 0.2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    return geometry;
  }, [color, mode, poet.id, visualQuality]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const speed = visualQuality === 'performance' ? 0.35 : 0.62;
    group.current.rotation.y = clock.elapsedTime * 0.065 * speed;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.12 * speed) * 0.05;
  });

  return (
    <group ref={group} position={poet.position}>
      <points geometry={data} frustumCulled={false}>
        <pointsMaterial vertexColors size={0.09} sizeAttenuation transparent opacity={mode === 'reading' ? 0.72 : 0.48} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {visualQuality !== 'performance' && [4.2, 7.6, 11.2, 15.1].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.1, 0.2 * index, index * 0.45]}>
          <torusGeometry args={[radius, 0.012, 6, 180]} />
          <meshBasicMaterial color={color} transparent opacity={0.09 - index * 0.015} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function FocusBeacon({ poet, mode, visualQuality }: { poet: Poet; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const group = useRef<THREE.Group>(null);
  const color = coolAccent(poet.dynasty);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const speed = visualQuality === 'performance' ? 0.25 : 0.55;
    group.current.rotation.y = clock.elapsedTime * 0.28 * speed;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.3 * speed) * 0.08;
  });

  return (
    <group ref={group} position={poet.position}>
      {[3.2, 5.2, 7.4].slice(0, visualQuality === 'performance' ? 2 : 3).map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, index * 0.65, index * 0.22]}>
          <torusGeometry args={[radius, 0.018, 10, 180]} />
          <meshBasicMaterial color={index === 1 ? '#eafcff' : color} transparent opacity={mode === 'network' ? 0.16 : 0.1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
      <mesh scale={[0.035, mode === 'reading' ? 26 : 18, 0.035]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.055} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FloatingVerseConstellation({ selection, mode, visualQuality }: { selection: Selection; mode: GalaxyMode; visualQuality: VisualQuality }) {
  const poet = selection.poet;
  const color = coolAccent(poet.dynasty);
  const fragments = useMemo(() => {
    const limit = visualQuality === 'performance' ? 3 : 7;
    if (selection.kind === 'poem') return splitPoemLines(selection.poem.fullText).slice(0, limit);
    const localPoems = poemsByPoet[poet.id] ?? [];
    return localPoems.flatMap((poem) => splitPoemLines(poem.excerpt)).slice(0, limit);
  }, [poet.id, selection, visualQuality]);

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

function PoetryCore({ visualQuality }: { visualQuality: VisualQuality }) {
  if (visualQuality === 'performance') return null;

  return (
    <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {[48, 72, 104].map((radius, index) => (
        <mesh key={radius} rotation={[0, index * 0.18, index * 0.3]}>
          <torusGeometry args={[radius, 0.012, 8, 220]} />
          <meshBasicMaterial color={index === 0 ? '#70f5ff' : '#8b96ff'} transparent opacity={0.035 - index * 0.006} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function PoetStar({ poet, selected, dimmed, visualQuality, onSelect }: { poet: Poet; selected: boolean; dimmed: boolean; visualQuality: VisualQuality; onSelect: (poet: Poet) => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const outerHalo = useRef<THREE.Mesh>(null);
  const color = coolAccent(poet.dynasty);
  const isMajor = poet.brightness > 1.45;
  const showLabel = selected || visualQuality !== 'performance' || isMajor;

  useFrame(({ clock }) => {
    const motion = visualQuality === 'performance' ? 0.35 : 0.65;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.4 * motion + poet.position[0]) * 0.04;
    if (mesh.current) mesh.current.scale.setScalar((0.68 + poet.brightness * 0.48) * pulse * (selected ? 1.38 : 1));
    if (halo.current) halo.current.scale.setScalar((2.2 + poet.brightness * 1.05) * (selected ? 1.5 : 1) * pulse);
    if (outerHalo.current) outerHalo.current.scale.setScalar((4.8 + poet.brightness * 1.7) * (selected ? 1.35 : 1) * pulse);
  });

  const emissiveIntensity = selected ? 2.3 : isMajor ? 1.15 : 0.48;

  return (
    <group position={poet.position}>
      <mesh ref={outerHalo} renderOrder={0} visible={visualQuality !== 'performance' || selected}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.006 : selected ? 0.055 : 0.018} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={halo} renderOrder={1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.016 : selected ? 0.18 : 0.065} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={mesh} onClick={(event) => { event.stopPropagation(); onSelect(poet); }}>
        <sphereGeometry args={[0.68, 36, 36]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={emissiveIntensity} color="#eafcff" roughness={0.2} metalness={0.04} transparent opacity={dimmed ? 0.28 : 1} toneMapped={false} />
      </mesh>
      {showLabel && (
        <Billboard>
          <Html center distanceFactor={selected ? 6.5 : 12} className="star-label-wrap">
            <button className={`star-label ${selected ? 'selected' : ''} ${isMajor ? 'major' : ''}`} onClick={() => onSelect(poet)}>
              <span>{poet.name}</span>
              <small>{poet.dynasty} · {Math.round(poet.brightness * 100)}L</small>
            </button>
          </Html>
        </Billboard>
      )}
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
      <lineBasicMaterial vertexColors transparent opacity={mode === 'network' ? 0.58 : 0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
}

function NetworkAnchorLabels({ mode, visualQuality, onSelectPoet }: { mode: GalaxyMode; visualQuality: VisualQuality; onSelectPoet: (poet: Poet) => void }) {
  const labelledPoets = useMemo(() => [...poets].sort((a, b) => b.brightness - a.brightness).slice(0, visualQuality === 'performance' ? 6 : 12), [visualQuality]);
  if (mode !== 'network') return null;

  return (
    <group>
      {labelledPoets.map((poet) => (
        <Billboard key={poet.id} position={[poet.position[0], poet.position[1] + 4.2, poet.position[2]]}>
          <Html center distanceFactor={14} className="network-label-wrap">
            <button className="network-label-3d" style={{ '--accent': coolAccent(poet.dynasty) } as CSSProperties} onClick={() => onSelectPoet(poet)}>
              <strong>{poet.name}</strong>
              <span>{poet.relations.length} 条航线</span>
            </button>
          </Html>
        </Billboard>
      ))}
    </group>
  );
}

function DynastyRings({ visualQuality }: { visualQuality: VisualQuality }) {
  if (visualQuality === 'performance') return null;
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {dynastyOrder.map((dynasty, index) => (
        <group key={dynasty} position={[-52 + index * 22, 0, 0]}>
          <mesh>
            <torusGeometry args={[15 + index * 4.8, 0.01, 8, 180]} />
            <meshBasicMaterial color={coolAccent(dynasty)} transparent opacity={0.07} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh>
            <torusGeometry args={[23 + index * 2.4, 0.006, 8, 180]} />
            <meshBasicMaterial color={coolAccent(dynasty)} transparent opacity={0.04} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DynastySpaceLabels({ visualQuality }: { visualQuality: VisualQuality }) {
  if (visualQuality === 'performance') return null;
  return (
    <group>
      {dynastyOrder.map((dynasty, index) => (
        <Billboard key={dynasty} position={[-52 + index * 22, -18, -34]}>
          <Html center className="dynasty-space-label-wrap">
            <span className="dynasty-space-label" style={{ borderColor: coolAccent(dynasty), color: coolAccent(dynasty) }}>{dynasty}</span>
          </Html>
        </Billboard>
      ))}
    </group>
  );
}

function SceneContent({ mode, focusId, activeDynasties, filteredPoets, selection, visualQuality, onSelectPoet }: SceneProps) {
  const selectedPoetId = selection.poet.id;
  const selectedPoet = selection.poet;
  const visiblePoetIds = useMemo(() => new Set(filteredPoets.map((poet) => poet.id)), [filteredPoets]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[48, 26, 58]} fov={55} />
      <CameraRig focusId={focusId} mode={mode} visualQuality={visualQuality} />
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 44, 0]} intensity={0.7} color="#6fefff" />
      <pointLight position={[64, -24, 34]} intensity={0.28} color="#7b78ff" />
      <DeepField visualQuality={visualQuality} />
      <NebulaClouds visualQuality={visualQuality} />
      <PoetryCore visualQuality={visualQuality} />
      <GpuStarfield activeDynasties={activeDynasties} visualQuality={visualQuality} />
      <DynastyRings visualQuality={visualQuality} />
      <DynastySpaceLabels visualQuality={visualQuality} />
      <PoemOrbitCloud poet={selectedPoet} mode={mode} visualQuality={visualQuality} />
      <FocusBeacon poet={selectedPoet} mode={mode} visualQuality={visualQuality} />
      <FloatingVerseConstellation selection={selection} mode={mode} visualQuality={visualQuality} />
      <RelationshipNetwork activePoetId={selectedPoetId} mode={mode} />
      <NetworkAnchorLabels mode={mode} visualQuality={visualQuality} onSelectPoet={onSelectPoet} />
      {poets.map((poet) => (
        <PoetStar key={poet.id} poet={poet} selected={poet.id === selectedPoetId} dimmed={!visiblePoetIds.has(poet.id)} visualQuality={visualQuality} onSelect={onSelectPoet} />
      ))}
      <SceneEffects mode={mode} visualQuality={visualQuality} />
      <OrbitControls enableDamping dampingFactor={0.06} rotateSpeed={0.34} zoomSpeed={0.68} minDistance={7} maxDistance={190} />
    </>
  );
}

export default function GalaxyScene(props: SceneProps) {
  const preset = RENDER_PRESETS[props.visualQuality];

  return (
    <Canvas
      dpr={preset.dpr}
      gl={{ antialias: props.visualQuality !== 'performance', powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#01020a');
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={['#01020a']} />
      <fog attach="fog" args={['#010418', 120, 310]} />
      <SceneContent {...props} />
    </Canvas>
  );
}
