import { Html, OrbitControls } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Vector3
} from 'three';
import { dynastyColors, dynastyOrder, poets, poems, type Dynasty, type Poet, type Poem } from './data/expandedPoetry';

type ViewMode = 'overview' | 'poet' | 'poem';

type SceneProps = {
  viewMode: ViewMode;
  selectedPoetId: string | null;
  selectedPoemId: string | null;
  onSelectPoet: (poet: Poet) => void;
  onSelectPoem: (poem: Poem) => void;
  onHoverName: (name: string | null) => void;
};

type DynastyBand = {
  latitude: number;
  width: number;
  radius: number;
  phase: number;
  arms: number;
  label: string;
};

const AXIS = new Vector3(34, 21, 27);
const WHITE = new Color('#f3fdff');
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const DYNASTY_BANDS: Record<Dynasty, DynastyBand> = {
  '先秦': { latitude: 0.72, width: 0.11, radius: 0.82, phase: -0.75, arms: 2, label: '先秦 · 神话源流' },
  '汉魏六朝': { latitude: 0.43, width: 0.13, radius: 0.88, phase: 0.42, arms: 3, label: '汉魏六朝 · 风骨山水' },
  '唐': { latitude: 0.14, width: 0.2, radius: 1.0, phase: 1.08, arms: 5, label: '唐 · 高密度主星带' },
  '宋': { latitude: -0.16, width: 0.18, radius: 0.98, phase: -0.18, arms: 4, label: '宋 · 词与理趣星带' },
  '元明清': { latitude: -0.47, width: 0.14, radius: 0.92, phase: 0.88, arms: 3, label: '元明清 · 曲词余脉' },
  '近现代': { latitude: -0.72, width: 0.12, radius: 0.86, phase: -1.2, arms: 2, label: '近现代 · 新诗南弧' }
};

const DYNASTY_PARTICLE_WEIGHTS: Record<Dynasty, number> = {
  '先秦': 5,
  '汉魏六朝': 8,
  '唐': 18,
  '宋': 15,
  '元明清': 9,
  '近现代': 8
};

const DYNASTY_PARTICLE_SEQUENCE = dynastyOrder.flatMap((dynasty) =>
  Array.from({ length: DYNASTY_PARTICLE_WEIGHTS[dynasty] }, () => dynasty)
);

const POET_BAND_INDEX = new Map<string, { index: number; count: number }>();
dynastyOrder.forEach((dynasty) => {
  const group = poets.filter((poet) => poet.dynasty === dynasty);
  group.forEach((poet, index) => {
    POET_BAND_INDEX.set(poet.id, { index, count: group.length });
  });
});

const SOFT_POINT_VERTEX = `
  attribute vec3 color;
  attribute float aSize;
  uniform float uScale;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * uScale * (210.0 / max(18.0, -mvPosition.z)), 1.0, 16.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SOFT_POINT_FRAGMENT = `
  precision mediump float;
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float core = smoothstep(0.36, 0.02, d);
    float halo = smoothstep(0.5, 0.12, d) * 0.42;
    float rim = smoothstep(0.5, 0.36, d) * 0.08;
    float alpha = (core + halo + rim) * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function hash01(value: string, salt = '') {
  let hash = 2166136261;
  const text = `${value}:${salt}`;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

function poetPosition(poet: Poet) {
  const band = DYNASTY_BANDS[poet.dynasty];
  const bandIndex = POET_BAND_INDEX.get(poet.id) ?? { index: 0, count: 1 };
  const centerBias = (poet.brightness - 1) * 0.045;
  const orbitLayer = ((bandIndex.index % 3) - 1) * 0.045;
  const angle = band.phase + bandIndex.index * GOLDEN_ANGLE + (hash01(poet.id, 'angle') - 0.5) * 0.38;
  const latitude = band.latitude + (hash01(poet.id, 'latitude') - 0.5) * band.width;
  const radius = band.radius + orbitLayer + centerBias + (hash01(poet.id, 'radius') - 0.5) * 0.07;
  const flatten = Math.cos(latitude);

  return new Vector3(
    Math.cos(angle) * flatten * AXIS.x * radius,
    Math.sin(latitude) * AXIS.y * (1.02 + (hash01(poet.id, 'height') - 0.5) * 0.045),
    Math.sin(angle) * flatten * AXIS.z * radius
  );
}

function colorOf(hex: string, intensity = 1) {
  return new Color(hex).multiplyScalar(intensity);
}

function createSoftPointGeometry(count: number, getPoint: (index: number) => { position: Vector3; color: Color; size: number }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const point = getPoint(i);
    positions.set([point.position.x, point.position.y, point.position.z], i * 3);
    colors.set([point.color.r, point.color.g, point.color.b], i * 3);
    sizes[i] = point.size;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
  return geometry;
}

function createBackdropGeometry() {
  return createSoftPointGeometry(1100, (i) => {
    const u = (i * 0.61803398875) % 1;
    const v = ((i * 0.754877666) % 1) * 2 - 1;
    const theta = u * Math.PI * 2;
    const phi = Math.acos(v);
    const radius = 155 + ((i * 0.318309886) % 1) * 82;
    const position = new Vector3(
      Math.sin(phi) * Math.cos(theta) * radius,
      Math.cos(phi) * radius * 0.72,
      Math.sin(phi) * Math.sin(theta) * radius
    );
    const tone = i % 9 === 0 ? '#ff8fe4' : i % 6 === 0 ? '#77fff1' : '#d9f7ff';
    const color = colorOf(tone, 0.22 + ((i * 0.271) % 1) * 0.38);
    return { position, color, size: 0.34 + ((i * 0.417) % 1) * 0.62 };
  });
}

function createStaticGlobeGeometry() {
  return createSoftPointGeometry(8600, (i) => {
    const dynasty = DYNASTY_PARTICLE_SEQUENCE[i % DYNASTY_PARTICLE_SEQUENCE.length];
    const band = DYNASTY_BANDS[dynasty];
    const u = (i * 0.61803398875) % 1;
    const jitterA = (i * 0.754877666) % 1;
    const jitterB = (i * 0.318309886) % 1;
    const theta = band.phase + u * Math.PI * 2 + Math.sin(i * 0.37) * 0.04;
    const latitude = band.latitude + (jitterA - 0.5) * band.width * 1.28;
    const shellNoise = (i * 0.431) % 1;
    const corePoint = i % 23 === 0;
    const ringPoint = i % 11 === 0;
    const shell = corePoint ? 0.38 + Math.pow(shellNoise, 0.7) * 0.28 : 0.7 + Math.pow(shellNoise, 0.5) * 0.34;
    const arm = Math.sin(theta * band.arms + shell * 7.0 + band.phase) * 0.035 + Math.sin(theta * 2.0 - latitude * 3.2) * 0.018;
    const r = (shell + arm + (ringPoint ? Math.sin(theta * 10.0) * 0.018 : 0)) * band.radius;
    const flatten = Math.cos(latitude);
    const position = new Vector3(
      Math.cos(theta) * flatten * AXIS.x * r,
      Math.sin(latitude) * AXIS.y * (0.98 + Math.sin(theta * 2.0) * 0.025),
      Math.sin(theta) * flatten * AXIS.z * r
    );

    const base = colorOf(dynastyColors[dynasty], corePoint ? 0.76 : 0.45 + shell * 0.32);
    const color = base.lerp(WHITE, corePoint ? 0.62 : 0.12 + jitterB * 0.22);
    return { position, color, size: corePoint ? 0.72 : ringPoint ? 0.44 : 0.24 + shellNoise * 0.44 };
  });
}

function createPoemClusterGeometry(poet: Poet) {
  const poetPoems = poems.filter((poem) => poem.poetId === poet.id);
  const visualCount = Math.max(144, poetPoems.length * 34);
  const base = new Color(dynastyColors[poet.dynasty]);

  return createSoftPointGeometry(visualCount, (i) => {
    const poemIndex = i % Math.max(1, poetPoems.length);
    const layer = Math.floor(i / Math.max(1, poetPoems.length));
    const t = i / visualCount;
    const arm = poemIndex % 4;
    const angle = poemIndex * 1.52 + layer * 0.34 + arm * 0.42;
    const radius = 2.2 + Math.sqrt(layer + 1) * 0.52 + Math.sin(i * 2.41) * 0.24;
    const height = Math.sin(angle * 1.72 + layer * 0.34) * (0.72 + layer * 0.08);
    const position = new Vector3(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius * 0.72
    );
    const color = base.clone().lerp(WHITE, 0.32 + 0.42 * Math.sin(t * Math.PI));
    return { position, color, size: 0.34 + ((i * 0.37) % 1) * 0.48 };
  });
}

function SoftPoints({ geometry, opacity = 0.8, scale = 1 }: { geometry: BufferGeometry; opacity?: number; scale?: number }) {
  const uniforms = useMemo(() => ({ uOpacity: { value: opacity }, uScale: { value: scale } }), [opacity, scale]);
  return (
    <points geometry={geometry}>
      <shaderMaterial
        vertexShader={SOFT_POINT_VERTEX}
        fragmentShader={SOFT_POINT_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function BackdropStars() {
  const geometry = useMemo(createBackdropGeometry, []);
  return <SoftPoints geometry={geometry} opacity={0.36} scale={1.08} />;
}

function StaticGlobe() {
  const geometry = useMemo(createStaticGlobeGeometry, []);
  return <SoftPoints geometry={geometry} opacity={0.84} scale={1.06} />;
}

function DynastyBandGuides() {
  return (
    <group>
      {dynastyOrder.map((dynasty) => {
        const band = DYNASTY_BANDS[dynasty];
        const color = dynastyColors[dynasty];
        const y = Math.sin(band.latitude) * AXIS.y;
        const radiusX = Math.cos(band.latitude) * AXIS.x * band.radius;
        const radiusZ = Math.cos(band.latitude) * AXIS.z * band.radius;
        return (
          <group key={dynasty} position={[0, y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[radiusX, radiusZ, 1]}>
              <torusGeometry args={[1, 0.0016, 8, 192]} />
              <meshBasicMaterial color={color} transparent opacity={dynasty === '唐' || dynasty === '宋' ? 0.24 : 0.15} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            <Html distanceFactor={28} position={[radiusX + 2.4, 0, 0]} center>
              <span className="dynasty-space-label" style={{ color, borderColor: color }}>{band.label}</span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function GlobeAtmosphere() {
  return (
    <group>
      <mesh scale={[AXIS.x * 1.055, AXIS.y * 1.055, AXIS.z * 1.055]}>
        <sphereGeometry args={[1, 80, 40]} />
        <meshBasicMaterial color="#7ee9ff" transparent opacity={0.026} side={BackSide} depthWrite={false} />
      </mesh>
      <mesh scale={[AXIS.x * 0.42, AXIS.y * 0.42, AXIS.z * 0.42]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshBasicMaterial color="#dffcff" transparent opacity={0.035} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[AXIS.x * 1.025, AXIS.z * 1.025, 1]}>
        <torusGeometry args={[1, 0.0022, 8, 180]} />
        <meshBasicMaterial color="#a7f4ff" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.78, 0]} scale={[AXIS.x * 0.76, AXIS.z * 0.76, 1]}>
        <torusGeometry args={[1, 0.0018, 8, 150]} />
        <meshBasicMaterial color="#ff8ee5" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[AXIS.y * 0.94, AXIS.z * 0.94, 1]}>
        <torusGeometry args={[1, 0.0015, 8, 130]} />
        <meshBasicMaterial color="#7efee8" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh rotation={[1.18, 0.3, 0.78]} scale={[AXIS.x * 0.98, AXIS.z * 0.98, 1]}>
        <torusGeometry args={[1, 0.0012, 8, 150]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.075} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PoetNodes({ selectedPoetId, onSelectPoet, onHoverName }: Pick<SceneProps, 'selectedPoetId' | 'onSelectPoet' | 'onHoverName'>) {
  return (
    <group>
      {poets.map((poet) => {
        const position = poetPosition(poet);
        const selected = poet.id === selectedPoetId;
        const color = dynastyColors[poet.dynasty];
        const size = selected ? 0.72 : 0.3 + poet.brightness * 0.12;
        return (
          <group key={poet.id} position={position}>
            <mesh
              onClick={(event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation();
                onSelectPoet(poet);
              }}
              onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                document.body.style.cursor = 'pointer';
                onHoverName(`${poet.name} · ${poet.dynasty}`);
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
                onHoverName(null);
              }}
            >
              <sphereGeometry args={[size, 32, 20]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 3.2 : 1.55} roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh>
              <sphereGeometry args={[size * (selected ? 3.25 : 2.0), 32, 18]} />
              <meshBasicMaterial color={color} transparent opacity={selected ? 0.19 : 0.045} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            {selected && (
              <>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[size * 3.05, 0.016, 8, 112]} />
                  <meshBasicMaterial color="#effcff" transparent opacity={0.7} depthWrite={false} />
                </mesh>
                <mesh rotation={[1.06, 0.52, 0.18]}>
                  <torusGeometry args={[size * 4.35, 0.011, 8, 128]} />
                  <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} />
                </mesh>
                <Html distanceFactor={15} position={[0, size * 3.25, 0]} center>
                  <div className="globe-label strong">{poet.name}</div>
                </Html>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

function RelationshipLines() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const poetMap = new Map(poets.map((poet) => [poet.id, poet]));

    poets.forEach((poet) => {
      const from = poetPosition(poet);
      poet.relations.forEach((relationId) => {
        const target = poetMap.get(relationId);
        if (!target) return;
        const to = poetPosition(target);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const lift = mid.clone().normalize().multiplyScalar(8.5 + from.distanceTo(to) * 0.08);
        const control = mid.add(lift);
        const color = new Color(dynastyColors[poet.dynasty]).lerp(new Color(dynastyColors[target.dynasty]), 0.5).lerp(WHITE, 0.26);
        const steps = 16;
        let previous = from.clone();
        for (let s = 1; s <= steps; s += 1) {
          const t = s / steps;
          const a = from.clone().lerp(control, t);
          const b = control.clone().lerp(to, t);
          const point = a.lerp(b, t);
          positions.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
          const fade = 0.72 + 0.28 * Math.sin(t * Math.PI);
          colors.push(color.r * fade, color.g * fade, color.b * fade, color.r * fade, color.g * fade, color.b * fade);
          previous = point;
        }
      });
    });

    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    result.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return result;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.16} blending={AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function PoemCluster({ poet, selectedPoemId, onSelectPoem, onHoverName }: { poet: Poet; selectedPoemId: string | null; onSelectPoem: (poem: Poem) => void; onHoverName: (name: string | null) => void }) {
  const geometry = useMemo(() => createPoemClusterGeometry(poet), [poet]);
  const poetPoems = useMemo(() => poems.filter((poem) => poem.poetId === poet.id), [poet]);
  const baseColor = dynastyColors[poet.dynasty];

  return (
    <group position={poetPosition(poet)} rotation={[0, 0.18, 0]}>
      <SoftPoints geometry={geometry} opacity={0.92} scale={1.36} />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.45, 0.008, 8, 132]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.28} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.95, 0.26, 0.15]}>
        <torusGeometry args={[3.9, 0.006, 8, 116]} />
        <meshBasicMaterial color="#edfaff" transparent opacity={0.18} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      {poetPoems.map((poem, index) => {
        const angle = index * 1.9;
        const position: [number, number, number] = [Math.cos(angle) * 5.3, Math.sin(index * 1.13) * 1.8, Math.sin(angle) * 4.2];
        const selected = poem.id === selectedPoemId;
        return (
          <group key={poem.id} position={position}>
            <mesh
              onClick={(event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation();
                onSelectPoem(poem);
              }}
              onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                document.body.style.cursor = 'pointer';
                onHoverName(poem.title);
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
                onHoverName(null);
              }}
            >
              <sphereGeometry args={[selected ? 0.34 : 0.2, 22, 14]} />
              <meshStandardMaterial color="#f7fbff" emissive="#bdefff" emissiveIntensity={selected ? 2.35 : 1.25} roughness={0.2} />
            </mesh>
            <mesh>
              <sphereGeometry args={[selected ? 0.98 : 0.5, 20, 12]} />
              <meshBasicMaterial color="#c9f5ff" transparent opacity={selected ? 0.22 : 0.06} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            {(selected || poetPoems.length <= 4) && (
              <Html distanceFactor={11} position={[0, 0.58, 0]} center>
                <div className="globe-label">{poem.title}</div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

type CameraTransition = {
  active: boolean;
  startedAt: number;
  duration: number;
  fromPosition: Vector3;
  toPosition: Vector3;
  fromTarget: Vector3;
  toTarget: Vector3;
};

function FocusRig({ viewMode, selectedPoetId }: { viewMode: ViewMode; selectedPoetId: string | null }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const transitionRef = useRef<CameraTransition | null>(null);
  const selectedPoet = poets.find((poet) => poet.id === selectedPoetId) ?? null;

  useEffect(() => {
    const target = selectedPoet ? poetPosition(selectedPoet) : new Vector3(0, 0, 0);
    const direction = target.lengthSq() > 0.001 ? target.clone().normalize() : new Vector3(0, 0, 1);
    const toPosition = selectedPoet
      ? target.clone().add(direction.multiplyScalar(viewMode === 'poem' ? 12 : 21)).add(new Vector3(0, 5.2, 9.2))
      : new Vector3(0, 0, 92);

    transitionRef.current = {
      active: true,
      startedAt: performance.now(),
      duration: selectedPoet ? 920 : 720,
      fromPosition: camera.position.clone(),
      toPosition,
      fromTarget: controlsRef.current?.target?.clone?.() ?? new Vector3(0, 0, 0),
      toTarget: target
    };
  }, [camera, selectedPoetId, viewMode]);

  useFrame(() => {
    const transition = transitionRef.current;
    if (!transition?.active || !controlsRef.current) return;
    const raw = Math.min(1, (performance.now() - transition.startedAt) / transition.duration);
    const eased = raw * raw * (3 - 2 * raw);
    camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased);
    controlsRef.current.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
    controlsRef.current.update();
    if (raw >= 1) transition.active = false;
  });

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} rotateSpeed={0.56} zoomSpeed={0.7} panSpeed={0.22} minDistance={10} maxDistance={130} />;
}

export function PoetryGlobeScene({ viewMode, selectedPoetId, selectedPoemId, onSelectPoet, onSelectPoem, onHoverName }: SceneProps) {
  const selectedPoet = poets.find((poet) => poet.id === selectedPoetId) ?? null;

  return (
    <>
      <color attach="background" args={["#02070d"]} />
      <fog attach="fog" args={["#02070d", 82, 178]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#bff8ff", "#07111f", 0.9]} />
      <pointLight position={[0, 0, 48]} intensity={15} color="#bff6ff" />
      <pointLight position={[-38, 26, 24]} intensity={5.4} color="#ff8ae6" />
      <pointLight position={[42, -20, -28]} intensity={4.2} color="#78ffe9" />

      <BackdropStars />
      <group>
        <GlobeAtmosphere />
        <DynastyBandGuides />
        <StaticGlobe />
        <RelationshipLines />
        <PoetNodes selectedPoetId={selectedPoetId} onSelectPoet={onSelectPoet} onHoverName={onHoverName} />
        {selectedPoet && <PoemCluster poet={selectedPoet} selectedPoemId={selectedPoemId} onSelectPoem={onSelectPoem} onHoverName={onHoverName} />}
      </group>

      <FocusRig viewMode={viewMode} selectedPoetId={selectedPoetId} />
    </>
  );
}
