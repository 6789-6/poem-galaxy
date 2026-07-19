import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { PoemRecord } from '../../data/schema';
import { QUALITY_PRESETS, type VisualQuality } from '../../performance/quality';
import { poemPosition } from '../geometry/poetry-layout';

interface PoemDustProps {
  poems: PoemRecord[];
  quality: VisualQuality;
  onSelectPoem: (poemId: string, authorId: string) => void;
}

export function PoemDust({ poems, quality, onSelectPoem }: PoemDustProps) {
  const visiblePoems = useMemo(
    () => poems.slice(0, QUALITY_PRESETS[quality].poemParticles),
    [poems, quality]
  );
  const positions = useMemo(() => {
    const data = new Float32Array(visiblePoems.length * 3);
    visiblePoems.forEach((poem, index) => data.set(poemPosition(poem, index), index * 3));
    return data;
  }, [visiblePoems]);

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.index === undefined) return;
    const poem = visiblePoems[event.index];
    if (poem) onSelectPoem(poem.id, poem.authorId);
  };

  if (visiblePoems.length === 0) return null;

  return (
    <points onClick={select}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e7ad50"
        size={quality === 'performance' ? 0.12 : 0.16}
        sizeAttenuation
        transparent
        opacity={0.58}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
