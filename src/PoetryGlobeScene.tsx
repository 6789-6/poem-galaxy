import { Html, OrbitControls } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Vector3 } from 'three';
import { dynastyColors, poets, poems, type Poet, type Poem } from './data/poetry';

type ViewMode = 'overview' | 'poet' | 'poem';

type SceneProps = {
  viewMode: ViewMode;
  selectedPoetId: string | null;
  selectedPoemId: string | null;
  onSelectPoet: (poet: Poet) => void;
  onSelectPoem: (poem: Poem) => void;
  onHoverName: (name: string | null) => void;
};

const AXIS = new Vector3(34, 21, 27);

function poetPosition(poet: Poet) {
  return new Vector3(poet.position[0] / 70, poet.position[1] / 24, poet.position[2] / 38).multiply(AXIS);
}

function colorOf(hex: string, intensity = 1) {
  return new Color(hex).multiplyScalar(intensity);
}

function createStaticGlobeGeometry() {
  const count = 2800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dynasties = Object.keys(dynastyColors) as Array<keyof typeof dynastyColors>;

  for (let i = 0; i < count; i += 1) {
    const u = (i * 0.61803398875) % 1;
    const v = ((i * 0.754877666) % 1) * 2 - 1;
    const theta = u * Math.PI * 2;
    const band = Math.asin(v);
    const shell = 0.58 + Math.pow((i * 0.431) % 1, 0.35) * 0.42;
    const arm = Math.sin(theta * 5 + shell * 4) * 0.08;
    const r = shell + arm;
    const x = Math.cos(theta) * Math.cos(band) * AXIS.x * r;
    const y = Math.sin(band) * AXIS.y * r;
    const z = Math.sin(theta) * Math.cos(band) * AXIS.z * r;
    positions.set([x, y, z], i * 3);

    const dynasty = dynasties[i % dynasties.length];
    const color = colorOf(dynastyColors[dynasty], 0.55 + shell * 0.35);
    colors.set([color.r, color.g, color.b], i * 3);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

function createPoemClusterGeometry(poet: Poet) {
  const poetPoems = poems.filter((poem) => poem.poetId === poet.id);
  const visualCount = Math.max(36, poetPoems.length * 18);
  const positions = new Float32Array(visualCount * 3);
  const colors = new Float32Array(visualCount * 3);
  const base = new Color(dynastyColors[poet.dynasty]);

  for (let i = 0; i < visualCount; i += 1) {
    const poemIndex = i % Math.max(1, poetPoems.length);
    const layer = Math.floor(i / Math.max(1, poetPoems.length));
    const t = i / visualCount;
    const angle = poemIndex * 1.9 + layer * 0.42;
    const radius = 3.5 + layer * 0.22 + Math.sin(i * 2.41) * 0.35;
    const height = Math.sin(angle * 1.7 + layer) * 1.6;
    const x = Math.cos(angle) * radius;
    const y = height;
    const z = Math.sin(angle) * radius * 0.75;
    positions.set([x, y, z], i * 3);

    const color = base.clone().lerp(new Color('#eaf7ff'), 0.22 + 0.42 * Math.sin(t * Math.PI));
    colors.set([color.r, color.g, color.b], i * 3);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

function StaticGlobe() {
  const geometry = useMemo(createStaticGlobeGeometry, []);
  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.085} sizeAttenuation vertexColors transparent opacity={0.72} depthWrite={false} />
    </points>
  );
}

function GlobeGuide() {
  return (
    <mesh scale={[AXIS.x, AXIS.y, AXIS.z]}>
      <sphereGeometry args={[1, 48, 24]} />
      <meshBasicMaterial color="#8ad8ff" wireframe transparent opacity={0.045} depthWrite={false} />
    </mesh>
  );
}

function PoetNodes({ selectedPoetId, onSelectPoet, onHoverName }: Pick<SceneProps, 'selectedPoetId' | 'onSelectPoet' | 'onHoverName'>) {
  return (
    <group>
      {poets.map((poet) => {
        const position = poetPosition(poet);
        const selected = poet.id === selectedPoetId;
        const color = dynastyColors[poet.dynasty];
        const size = selected ? 0.78 : 0.42 + poet.brightness * 0.16;
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
              <sphereGeometry args={[size, 24, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 2.2 : 1.25} roughness={0.35} />
            </mesh>
            {selected && (
              <>
                <mesh>
                  <sphereGeometry args={[size * 2.4, 32, 16]} />
                  <meshBasicMaterial color={color} transparent opacity={0.13} depthWrite={false} />
                </mesh>
                <Html distanceFactor={15} position={[0, size * 2.6, 0]} center>
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
        const color = new Color(dynastyColors[poet.dynasty]).lerp(new Color(dynastyColors[target.dynasty]), 0.5);
        positions.push(from.x, from.y, from.z, to.x, to.y, to.z);
        colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
      });
    });

    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    result.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return result;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function PoemCluster({ poet, selectedPoemId, onSelectPoem, onHoverName }: { poet: Poet; selectedPoemId: string | null; onSelectPoem: (poem: Poem) => void; onHoverName: (name: string | null) => void }) {
  const geometry = useMemo(() => createPoemClusterGeometry(poet), [poet]);
  const poetPoems = useMemo(() => poems.filter((poem) => poem.poetId === poet.id), [poet]);

  return (
    <group position={poetPosition(poet)} rotation={[0, 0.18, 0]}>
      <points geometry={geometry}>
        <pointsMaterial size={0.16} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} />
      </points>
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
              <sphereGeometry args={[selected ? 0.36 : 0.23, 18, 12]} />
              <meshStandardMaterial color="#f7fbff" emissive="#bdefff" emissiveIntensity={selected ? 2.1 : 1.2} roughness={0.3} />
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
      ? target.clone().add(direction.multiplyScalar(viewMode === 'poem' ? 13 : 22)).add(new Vector3(0, 5.5, 10))
      : new Vector3(0, 0, 92);

    transitionRef.current = {
      active: true,
      startedAt: performance.now(),
      duration: selectedPoet ? 950 : 780,
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

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} rotateSpeed={0.52} zoomSpeed={0.65} panSpeed={0.25} minDistance={10} maxDistance={130} />;
}

export function PoetryGlobeScene({ viewMode, selectedPoetId, selectedPoemId, onSelectPoet, onSelectPoem, onHoverName }: SceneProps) {
  const selectedPoet = poets.find((poet) => poet.id === selectedPoetId) ?? null;

  return (
    <>
      <color attach="background" args={["#02070d"]} />
      <fog attach="fog" args={["#02070d", 72, 165]} />
      <ambientLight intensity={0.28} />
      <pointLight position={[0, 0, 45]} intensity={22} color="#aeeeff" />
      <pointLight position={[-35, 24, 20]} intensity={8} color="#ff8ae6" />

      <group>
        <GlobeGuide />
        <StaticGlobe />
        <RelationshipLines />
        <PoetNodes selectedPoetId={selectedPoetId} onSelectPoet={onSelectPoet} onHoverName={onHoverName} />
        {selectedPoet && <PoemCluster poet={selectedPoet} selectedPoemId={selectedPoemId} onSelectPoem={onSelectPoem} onHoverName={onHoverName} />}
      </group>

      <FocusRig viewMode={viewMode} selectedPoetId={selectedPoetId} />
    </>
  );
}
