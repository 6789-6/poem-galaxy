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

const AXIS = new Vector3(38, 23, 31);
const WHITE = new Color('#f7feff');
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const HERO_POETS = new Set([
  'libai', 'li-bai', 'dufu', 'du-fu', 'sushi', 'su-shi', 'quyuan', 'qu-yuan',
  'taoyuanming', 'tao-yuanming', 'wangwei', 'wang-wei', 'baijuyi', 'bai-juyi',
  'liqingzhao', 'li-qingzhao', 'xinqiji', 'xin-qiji', 'luyou', 'lu-you'
]);

const DYNASTY_BANDS: Record<Dynasty, DynastyBand> = {
  '先秦': { latitude: 0.72, width: 0.13, radius: 0.88, phase: -0.75, arms: 2, label: '先秦 · 神话源流' },
  '汉魏六朝': { latitude: 0.43, width: 0.15, radius: 0.94, phase: 0.42, arms: 3, label: '汉魏六朝 · 风骨山水' },
  '唐': { latitude: 0.13, width: 0.25, radius: 1.0, phase: 1.08, arms: 6, label: '唐 · 高密度主星带' },
  '宋': { latitude: -0.17, width: 0.23, radius: 0.99, phase: -0.18, arms: 5, label: '宋 · 词与理趣星带' },
  '元明清': { latitude: -0.48, width: 0.16, radius: 0.94, phase: 0.88, arms: 3, label: '元明清 · 曲词余脉' },
  '近现代': { latitude: -0.73, width: 0.14, radius: 0.88, phase: -1.2, arms: 2, label: '近现代 · 新诗南弧' }
};

const DYNASTY_PARTICLE_WEIGHTS: Record<Dynasty, number> = {
  '先秦': 8,
  '汉魏六朝': 14,
  '唐': 34,
  '宋': 30,
  '元明清': 15,
  '近现代': 12
};

const DYNASTY_SEQUENCE = dynastyOrder.flatMap((dynasty) =>
  Array.from({ length: DYNASTY_PARTICLE_WEIGHTS[dynasty] }, () => dynasty)
);

const POET_BAND_INDEX = new Map<string, { index: number; count: number }>();
dynastyOrder.forEach((dynasty) => {
  const group = poets.filter((poet) => poet.dynasty === dynasty);
  group.forEach((poet, index) => POET_BAND_INDEX.set(poet.id, { index, count: group.length }));
});

const SOFT_POINT_VERTEX = `
  attribute vec3 color;
  attribute float aSize;
  uniform float uScale;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * uScale * (250.0 / max(16.0, -mvPosition.z)), 0.8, 17.0);
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
    float core = smoothstep(0.26, 0.02, d);
    float body = smoothstep(0.46, 0.12, d) * 0.54;
    float feather = smoothstep(0.5, 0.36, d) * 0.08;
    float alpha = (core + body + feather) * uOpacity;
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function hash01(value: string | number, salt = '') {
  let hash = 2166136261;
  const text = `${value}:${salt}`;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

function colorOf(hex: string, intensity = 1) {
  return new Color(hex).multiplyScalar(intensity);
}

function poetPosition(poet: Poet) {
  const band = DYNASTY_BANDS[poet.dynasty];
  const bandIndex = POET_BAND_INDEX.get(poet.id) ?? { index: 0, count: 1 };
  const centerBias = Math.max(0, poet.brightness - 1) * 0.055;
  const orbitLayer = ((bandIndex.index % 5) - 2) * 0.03;
  const angle = band.phase + bandIndex.index * GOLDEN_ANGLE + (hash01(poet.id, 'angle') - 0.5) * 0.38;
  const latitude = band.latitude + (hash01(poet.id, 'latitude') - 0.5) * band.width;
  const radius = band.radius + orbitLayer + centerBias + (hash01(poet.id, 'radius') - 0.5) * 0.06;
  const flatten = Math.cos(latitude);

  return new Vector3(
    Math.cos(angle) * flatten * AXIS.x * radius,
    Math.sin(latitude) * AXIS.y * (1.02 + (hash01(poet.id, 'height') - 0.5) * 0.05),
    Math.sin(angle) * flatten * AXIS.z * radius
  );
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

function dynastyPoint(index: number, mode: 'inner' | 'band' | 'shell' | 'mist') {
  const dynasty = DYNASTY_SEQUENCE[index % DYNASTY_SEQUENCE.length];
  const band = DYNASTY_BANDS[dynasty];
  const u = (index * 0.61803398875) % 1;
  const j1 = (index * 0.754877666) % 1;
  const j2 = (index * 0.318309886) % 1;
  const j3 = (index * 0.431159265) % 1;

  const armWave = Math.sin((u * Math.PI * 2 + band.phase) * band.arms + j2 * 7.2);
  const theta = band.phase + u * Math.PI * 2 + armWave * (mode === 'band' ? 0.12 : 0.055) + Math.sin(index * 0.032) * 0.08;
  const latitude = band.latitude + (j1 - 0.5) * band.width * (mode === 'mist' ? 2.1 : mode === 'shell' ? 1.55 : 1.0);
  const flatten = Math.cos(latitude);

  const radial =
    mode === 'inner'
      ? 0.14 + Math.pow(j3, 0.55) * 0.58
      : mode === 'band'
      ? 0.55 + Math.pow(j3, 0.38) * 0.5 + armWave * 0.045
      : mode === 'shell'
      ? 0.86 + Math.pow(j3, 0.42) * 0.28 + armWave * 0.028
      : 0.98 + Math.pow(j3, 0.6) * 0.62;

  const position = new Vector3(
    Math.cos(theta) * flatten * AXIS.x * radial * band.radius,
    Math.sin(latitude) * AXIS.y * radial * (mode === 'inner' ? 0.78 : 1.0),
    Math.sin(theta) * flatten * AXIS.z * radial * band.radius
  );

  const base = colorOf(dynastyColors[dynasty], mode === 'inner' ? 0.66 : mode === 'band' ? 0.72 : 0.46);
  const whiteMix = mode === 'inner' ? 0.42 + j2 * 0.38 : mode === 'band' ? 0.2 + j2 * 0.28 : 0.12 + j2 * 0.24;
  const color = base.lerp(WHITE, whiteMix);
  const size =
    mode === 'inner'
      ? 0.26 + j2 * 0.58
      : mode === 'band'
      ? 0.2 + j2 * 0.52
      : mode === 'shell'
      ? 0.16 + j2 * 0.34
      : 0.12 + j2 * 0.28;

  return { position, color, size };
}

function createBackdropGeometry() {
  return createSoftPointGeometry(4200, (i) => {
    const u = (i * 0.61803398875) % 1;
    const v = ((i * 0.754877666) % 1) * 2 - 1;
    const theta = u * Math.PI * 2;
    const phi = Math.acos(v);
    const radius = 135 + Math.pow((i * 0.318309886) % 1, 0.68) * 170;
    const position = new Vector3(
      Math.sin(phi) * Math.cos(theta) * radius,
      Math.cos(phi) * radius * 0.82,
      Math.sin(phi) * Math.sin(theta) * radius
    );
    const tone = i % 13 === 0 ? '#ff91e8' : i % 7 === 0 ? '#79fff1' : i % 5 === 0 ? '#fff2cb' : '#d9f7ff';
    const color = colorOf(tone, 0.18 + ((i * 0.271) % 1) * 0.46);
    return { position, color, size: 0.18 + ((i * 0.417) % 1) * 0.66 };
  });
}

function createInnerCoreGeometry() {
  return createSoftPointGeometry(11500, (i) => dynastyPoint(i, 'inner'));
}

function createDenseBandGeometry() {
  return createSoftPointGeometry(22000, (i) => dynastyPoint(i, 'band'));
}

function createShellDustGeometry() {
  return createSoftPointGeometry(15500, (i) => dynastyPoint(i, 'shell'));
}

function createMistGeometry() {
  return createSoftPointGeometry(9500, (i) => dynastyPoint(i, 'mist'));
}

function createHeroConstellationGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const heroPoets = poets.filter((poet) => HERO_POETS.has(poet.id));

  for (let i = 0; i < heroPoets.length; i += 1) {
    for (let j = i + 1; j < heroPoets.length; j += 1) {
      const from = poetPosition(heroPoets[i]);
      const to = poetPosition(heroPoets[j]);
      const distance = from.distanceTo(to);
      if (distance > 70 && (i + j) % 2 !== 0) continue;
      const mid = from.clone().add(to).multiplyScalar(0.5);
      const lift = mid.clone().normalize().multiplyScalar(12 + distance * 0.1);
      const control = mid.add(lift);
      const color = new Color(dynastyColors[heroPoets[i].dynasty]).lerp(new Color(dynastyColors[heroPoets[j].dynasty]), 0.5).lerp(WHITE, 0.46);
      let previous = from.clone();
      const steps = 32;
      for (let s = 1; s <= steps; s += 1) {
        const t = s / steps;
        const a = from.clone().lerp(control, t);
        const b = control.clone().lerp(to, t);
        const point = a.lerp(b, t);
        positions.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
        const fade = 0.38 + 0.62 * Math.sin(t * Math.PI);
        colors.push(color.r * fade, color.g * fade, color.b * fade, color.r * fade, color.g * fade, color.b * fade);
        previous = point;
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  return geometry;
}

function createRelationGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const poetMap = new Map(poets.map((poet) => [poet.id, poet]));

  poets.forEach((poet, poetIndex) => {
    const from = poetPosition(poet);
    poet.relations.slice(0, 3).forEach((relationId, relationIndex) => {
      const target = poetMap.get(relationId);
      if (!target) return;
      if ((poetIndex + relationIndex) % 3 === 0 && poet.brightness < 1.05) return;
      const to = poetPosition(target);
      const mid = from.clone().add(to).multiplyScalar(0.5);
      const lift = mid.clone().normalize().multiplyScalar(8.5 + from.distanceTo(to) * 0.08);
      const control = mid.add(lift);
      const color = new Color(dynastyColors[poet.dynasty]).lerp(new Color(dynastyColors[target.dynasty]), 0.5).lerp(WHITE, 0.28);
      let previous = from.clone();
      const steps = 16;
      for (let s = 1; s <= steps; s += 1) {
        const t = s / steps;
        const a = from.clone().lerp(control, t);
        const b = control.clone().lerp(to, t);
        const point = a.lerp(b, t);
        positions.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
        const fade = 0.46 + 0.4 * Math.sin(t * Math.PI);
        colors.push(color.r * fade, color.g * fade, color.b * fade, color.r * fade, color.g * fade, color.b * fade);
        previous = point;
      }
    });
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  return geometry;
}

function createPoemClusterGeometry(poet: Poet) {
  const poetPoems = poems.filter((poem) => poem.poetId === poet.id);
  const visualCount = Math.max(520, poetPoems.length * 92);
  const base = new Color(dynastyColors[poet.dynasty]);

  return createSoftPointGeometry(visualCount, (i) => {
    const poemCount = Math.max(1, poetPoems.length);
    const poemIndex = i % poemCount;
    const layer = Math.floor(i / poemCount);
    const arm = poemIndex % 6;
    const angle = poemIndex * 1.42 + layer * 0.22 + arm * 0.6;
    const radius = 1.3 + Math.sqrt(layer + 1) * 0.5 + Math.sin(i * 2.41) * 0.22;
    const height = Math.sin(angle * 1.72 + layer * 0.34) * (0.76 + layer * 0.045);
    const position = new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.76);
    const color = base.clone().lerp(WHITE, 0.34 + 0.46 * Math.sin((i / visualCount) * Math.PI));
    return { position, color, size: 0.25 + ((i * 0.37) % 1) * 0.54 };
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
  return <SoftPoints geometry={geometry} opacity={0.46} scale={1.0} />;
}

function VolumetricGlobe() {
  const inner = useMemo(createInnerCoreGeometry, []);
  const band = useMemo(createDenseBandGeometry, []);
  const shell = useMemo(createShellDustGeometry, []);
  const mist = useMemo(createMistGeometry, []);
  return (
    <group>
      <SoftPoints geometry={mist} opacity={0.22} scale={0.82} />
      <SoftPoints geometry={inner} opacity={0.52} scale={1.28} />
      <SoftPoints geometry={shell} opacity={0.38} scale={0.98} />
      <SoftPoints geometry={band} opacity={0.78} scale={1.18} />
    </group>
  );
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
        const important = dynasty === '唐' || dynasty === '宋';
        return (
          <group key={dynasty} position={[0, y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[radiusX, radiusZ, 1]}>
              <torusGeometry args={[1, important ? 0.005 : 0.0025, 8, 260]} />
              <meshBasicMaterial color={color} transparent opacity={important ? 0.48 : 0.2} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[radiusX * 1.07, radiusZ * 1.07, 1]}>
              <torusGeometry args={[1, 0.0014, 8, 260]} />
              <meshBasicMaterial color="#f7feff" transparent opacity={important ? 0.2 : 0.08} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            <Html distanceFactor={30} position={[radiusX + 2.7, 0, 0]} center>
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
      <mesh scale={[AXIS.x * 1.12, AXIS.y * 1.12, AXIS.z * 1.12]}>
        <sphereGeometry args={[1, 96, 48]} />
        <meshBasicMaterial color="#78e8ff" transparent opacity={0.026} side={BackSide} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh scale={[AXIS.x * 0.72, AXIS.y * 0.72, AXIS.z * 0.72]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial color="#dffcff" transparent opacity={0.035} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh scale={[AXIS.x * 0.28, AXIS.y * 0.28, AXIS.z * 0.28]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[AXIS.x * 1.08, AXIS.z * 1.08, 1]}>
        <torusGeometry args={[1, 0.0036, 8, 300]} />
        <meshBasicMaterial color="#a7f4ff" transparent opacity={0.42} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.72, 0]} scale={[AXIS.x * 1.22, AXIS.z * 1.22, 1]}>
        <torusGeometry args={[1, 0.0015, 8, 260]} />
        <meshBasicMaterial color="#ff8ee5" transparent opacity={0.16} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.44, 0.1, 1.18]} scale={[AXIS.x * 1.34, AXIS.z * 1.34, 1]}>
        <torusGeometry args={[1, 0.0012, 8, 260]} />
        <meshBasicMaterial color="#8df7ff" transparent opacity={0.12} depthWrite={false} blending={AdditiveBlending} />
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
        const hero = HERO_POETS.has(poet.id);
        const color = dynastyColors[poet.dynasty];
        const size = selected ? 0.94 : hero ? 0.58 + poet.brightness * 0.13 : 0.2 + poet.brightness * 0.1;
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
              <sphereGeometry args={[size, hero || selected ? 42 : 22, hero || selected ? 24 : 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 5.2 : hero ? 2.9 : 1.32} roughness={0.12} metalness={0.18} />
            </mesh>
            <mesh>
              <sphereGeometry args={[size * (selected ? 4.6 : hero ? 3.3 : 1.65), 36, 20]} />
              <meshBasicMaterial color={color} transparent opacity={selected ? 0.28 : hero ? 0.12 : 0.028} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            {hero && !selected && (
              <mesh rotation={[1.08, 0.34, 0.2]}>
                <torusGeometry args={[size * 2.05, 0.008, 8, 84]} />
                <meshBasicMaterial color="#f6fdff" transparent opacity={0.24} depthWrite={false} blending={AdditiveBlending} />
              </mesh>
            )}
            {selected && (
              <>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[size * 3.4, 0.018, 8, 132]} />
                  <meshBasicMaterial color="#effcff" transparent opacity={0.86} depthWrite={false} blending={AdditiveBlending} />
                </mesh>
                <mesh rotation={[1.06, 0.52, 0.18]}>
                  <torusGeometry args={[size * 5.0, 0.013, 8, 144]} />
                  <meshBasicMaterial color={color} transparent opacity={0.68} depthWrite={false} blending={AdditiveBlending} />
                </mesh>
                <mesh rotation={[0.3, 1.0, 0.78]}>
                  <torusGeometry args={[size * 6.4, 0.008, 8, 160]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.34} depthWrite={false} blending={AdditiveBlending} />
                </mesh>
                <Html distanceFactor={15} position={[0, size * 3.8, 0]} center>
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
  const geometry = useMemo(createRelationGeometry, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function HeroConstellationLines() {
  const geometry = useMemo(createHeroConstellationGeometry, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.26} blending={AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function PoemCluster({ poet, selectedPoemId, onSelectPoem, onHoverName }: { poet: Poet; selectedPoemId: string | null; onSelectPoem: (poem: Poem) => void; onHoverName: (name: string | null) => void }) {
  const geometry = useMemo(() => createPoemClusterGeometry(poet), [poet]);
  const poetPoems = useMemo(() => poems.filter((poem) => poem.poetId === poet.id), [poet]);
  const baseColor = dynastyColors[poet.dynasty];

  return (
    <group position={poetPosition(poet)} rotation={[0, 0.18, 0]}>
      <SoftPoints geometry={geometry} opacity={0.98} scale={1.65} />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[7.2, 0.011, 8, 170]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.38} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.95, 0.26, 0.15]}>
        <torusGeometry args={[5.3, 0.007, 8, 136]} />
        <meshBasicMaterial color="#edfaff" transparent opacity={0.22} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.38, 1.1, 0.32]}>
        <torusGeometry args={[8.8, 0.0045, 8, 150]} />
        <meshBasicMaterial color="#9ef9ff" transparent opacity={0.15} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      {poetPoems.map((poem, index) => {
        const angle = index * 1.9;
        const position: [number, number, number] = [Math.cos(angle) * 6.6, Math.sin(index * 1.13) * 2.15, Math.sin(angle) * 5.15];
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
              <sphereGeometry args={[selected ? 0.42 : 0.22, 24, 16]} />
              <meshStandardMaterial color="#f7fbff" emissive="#bdefff" emissiveIntensity={selected ? 3.2 : 1.5} roughness={0.16} />
            </mesh>
            <mesh>
              <sphereGeometry args={[selected ? 1.25 : 0.62, 24, 14]} />
              <meshBasicMaterial color="#c9f5ff" transparent opacity={selected ? 0.28 : 0.08} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
            {(selected || poetPoems.length <= 4) && (
              <Html distanceFactor={11} position={[0, 0.66, 0]} center>
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
      ? target.clone().add(direction.multiplyScalar(viewMode === 'poem' ? 13 : 24)).add(new Vector3(0, 5.8, 10.2))
      : new Vector3(0, 0, 106);

    transitionRef.current = {
      active: true,
      startedAt: performance.now(),
      duration: selectedPoet ? 980 : 760,
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

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} rotateSpeed={0.56} zoomSpeed={0.68} panSpeed={0.22} minDistance={10} maxDistance={154} />;
}

export function PoetryGlobeScene({ viewMode, selectedPoetId, selectedPoemId, onSelectPoet, onSelectPoem, onHoverName }: SceneProps) {
  const selectedPoet = poets.find((poet) => poet.id === selectedPoetId) ?? null;

  return (
    <>
      <color attach="background" args={["#01050b"]} />
      <fog attach="fog" args={["#01050b", 96, 260]} />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#d8fbff", "#07111f", 1.0]} />
      <pointLight position={[0, 0, 60]} intensity={24} color="#dffcff" />
      <pointLight position={[-46, 32, 30]} intensity={7.6} color="#ff8ae6" />
      <pointLight position={[48, -26, -34]} intensity={6.2} color="#78ffe9" />

      <BackdropStars />
      <group>
        <GlobeAtmosphere />
        <VolumetricGlobe />
        <DynastyBandGuides />
        <RelationshipLines />
        <HeroConstellationLines />
        <PoetNodes selectedPoetId={selectedPoetId} onSelectPoet={onSelectPoet} onHoverName={onHoverName} />
        {selectedPoet && <PoemCluster poet={selectedPoet} selectedPoemId={selectedPoemId} onSelectPoem={onSelectPoem} onHoverName={onHoverName} />}
      </group>

      <FocusRig viewMode={viewMode} selectedPoetId={selectedPoetId} />
    </>
  );
}
