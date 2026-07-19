import type { ThreeEvent } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AuthorRecord } from '../../data/schema';
import { authorPosition } from '../geometry/poetry-layout';

interface PoetStarsProps {
  authors: AuthorRecord[];
  selectedAuthorId: string | null;
  onSelectAuthor: (authorId: string) => void;
}

export function PoetStars({ authors, selectedAuthorId, onSelectAuthor }: PoetStarsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const gold = useMemo(() => new THREE.Color('#ffd778'), []);
  const amber = useMemo(() => new THREE.Color('#d98a32'), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    authors.forEach((author, index) => {
      dummy.position.fromArray(authorPosition(author));
      dummy.scale.setScalar(author.id === selectedAuthorId ? 1.7 : 0.85 + (index % 5) * 0.08);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
      mesh.current?.setColorAt(index, author.id === selectedAuthorId ? gold : amber);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [amber, authors, dummy, gold, selectedAuthorId]);

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId === undefined) return;
    const author = authors[event.instanceId];
    if (author) onSelectAuthor(author.id);
  };

  if (authors.length === 0) return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, authors.length]} onClick={select}>
      <sphereGeometry args={[0.62, 16, 16]} />
      <meshStandardMaterial
        color="#fff0bc"
        emissive="#f0a13b"
        emissiveIntensity={1.7}
        roughness={0.26}
        metalness={0.1}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
