import { useMemo } from 'react';
import * as THREE from 'three';
import type { AuthorRecord, RelationRecord } from '../../data/schema';
import { authorPosition } from '../geometry/poetry-layout';

interface RelationArcsProps {
  authors: AuthorRecord[];
  relations: RelationRecord[];
}

export function RelationArcs({ authors, relations }: RelationArcsProps) {
  const geometry = useMemo(() => {
    const positionsById = new Map(authors.map((author) => [author.id, new THREE.Vector3(...authorPosition(author))]));
    const vertices: number[] = [];

    relations.forEach((relation) => {
      const from = positionsById.get(relation.fromId);
      const to = positionsById.get(relation.toId);
      if (!from || !to) return;
      const midpoint = from.clone().add(to).multiplyScalar(0.5);
      midpoint.y += Math.max(4, from.distanceTo(to) * 0.18);
      let previous = from;
      const segmentCount = 12;
      for (let segment = 1; segment <= segmentCount; segment += 1) {
        const t = segment / segmentCount;
        const inverse = 1 - t;
        const next = new THREE.Vector3()
          .addScaledVector(from, inverse * inverse)
          .addScaledVector(midpoint, 2 * inverse * t)
          .addScaledVector(to, t * t);
        vertices.push(previous.x, previous.y, previous.z, next.x, next.y, next.z);
        previous = next;
      }
    });

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return buffer;
  }, [authors, relations]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#df9b43"
        transparent
        opacity={0.36}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}
