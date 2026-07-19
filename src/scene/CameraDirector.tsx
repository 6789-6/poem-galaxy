import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AuthorRecord, PoemRecord } from '../data/schema';
import type { GalaxyState } from '../state/galaxy-reducer';
import { authorPosition, poemPosition } from './geometry/poetry-layout';

export const CAMERA_TARGETS = {
  overview: { position: [0, 5, 92], lookAt: [0, 0, 0] },
  poet: { distance: 15 },
  poem: { distance: 10 },
  network: { distance: 24 },
  tour: { distance: 13 }
} as const;

interface CameraDirectorProps {
  state: GalaxyState;
  authors: AuthorRecord[];
  loadedPoems: PoemRecord[];
}

export function CameraDirector({ state, authors, loadedPoems }: CameraDirectorProps) {
  const { camera } = useThree();
  const smoothedLookAt = useRef(new THREE.Vector3());

  const destination = useMemo(() => {
    if (state.mode === 'overview') {
      return {
        position: new THREE.Vector3(...CAMERA_TARGETS.overview.position),
        lookAt: new THREE.Vector3(...CAMERA_TARGETS.overview.lookAt)
      };
    }

    const selectedPoemIndex = state.selectedPoemId
      ? loadedPoems.findIndex((poem) => poem.id === state.selectedPoemId)
      : -1;
    const selectedPoem = selectedPoemIndex >= 0 ? loadedPoems[selectedPoemIndex] : undefined;
    const selectedAuthor = authors.find((author) => author.id === state.selectedAuthorId)
      ?? (state.mode === 'tour' && authors.length > 0 ? authors[state.tourIndex % authors.length] : undefined);
    const focus = selectedPoem
      ? new THREE.Vector3(...poemPosition(selectedPoem, selectedPoemIndex))
      : selectedAuthor
        ? new THREE.Vector3(...authorPosition(selectedAuthor))
        : new THREE.Vector3();
    const distance = CAMERA_TARGETS[state.mode].distance;
    const outward = focus.clone().setY(focus.y * 0.18);
    if (outward.lengthSq() < 0.001) outward.set(0, 0.2, 1);
    outward.normalize();
    const position = focus.clone().addScaledVector(outward, distance);
    position.y += distance * 0.28;
    return { position, lookAt: focus };
  }, [authors, loadedPoems, state.mode, state.selectedAuthorId, state.selectedPoemId, state.tourIndex]);

  useFrame((_, delta) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const damping = 1 - Math.exp(-delta * 1.8);
    camera.position.lerp(destination.position, damping);
    smoothedLookAt.current.lerp(destination.lookAt, damping);
    camera.lookAt(smoothedLookAt.current);
  });

  return null;
}
