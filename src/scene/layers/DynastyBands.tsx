import * as THREE from 'three';
import type { DynastyId } from '../../data/schema';
import { DYNASTY_BANDS } from '../geometry/poetry-layout';

const DYNASTIES: DynastyId[] = ['pre-qin', 'han-wei', 'tang', 'song', 'yuan-ming-qing', 'modern'];
const BAND_COLORS: Record<DynastyId, string> = {
  'pre-qin': '#8f5d20',
  'han-wei': '#c7822d',
  tang: '#ffd477',
  song: '#efae4a',
  'yuan-ming-qing': '#9f6630',
  modern: '#6b3bb5'
};

export function DynastyBands({ activeDynasties }: { activeDynasties: DynastyId[] }) {
  const active = new Set(activeDynasties);

  return (
    <group>
      {DYNASTIES.map((dynasty) => {
        const band = DYNASTY_BANDS[dynasty];
        const horizontalRadius = Math.cos(band.latitude) * band.radius;
        return (
          <mesh
            key={dynasty}
            position={[0, Math.sin(band.latitude) * 24, 0]}
            rotation={[Math.PI / 2, 0, band.phase]}
            scale={[1, 0.72, 1]}
            visible={active.has(dynasty)}
          >
            <torusGeometry args={[horizontalRadius, 0.028, 6, 192]} />
            <meshBasicMaterial
              color={BAND_COLORS[dynasty]}
              transparent
              opacity={0.13}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
