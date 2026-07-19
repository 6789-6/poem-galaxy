import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AuthorRecord, PoemRecord } from '../data/schema';
import type { GalaxyState } from '../state/galaxy-reducer';
import { authorPosition, poemPosition } from './geometry/poetry-layout';
import { consumeVisibleFrameDelta, useVisibilityFrameTiming } from './scene-timing';

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

export interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export function calculateCameraTarget(
  state: GalaxyState,
  authors: AuthorRecord[],
  loadedPoems: PoemRecord[]
): CameraTarget {
  if (state.mode === 'overview') {
    return {
      position: new THREE.Vector3(...CAMERA_TARGETS.overview.position),
      lookAt: new THREE.Vector3(...CAMERA_TARGETS.overview.lookAt)
    };
  }

  const selectedPoemIndex = state.mode === 'poem' && state.selectedPoemId
    ? loadedPoems.findIndex((poem) => poem.id === state.selectedPoemId)
    : -1;
  const selectedPoem = selectedPoemIndex >= 0 ? loadedPoems[selectedPoemIndex] : undefined;
  const selectedAuthor = state.mode === 'tour'
    ? authors[state.tourIndex]
    : authors.find((author) => author.id === state.selectedAuthorId);
  const focus = selectedPoem
    ? new THREE.Vector3(...poemPosition(selectedPoem, selectedPoemIndex))
    : selectedAuthor
      ? new THREE.Vector3(...authorPosition(selectedAuthor))
      : new THREE.Vector3();
  const distance = CAMERA_TARGETS[state.mode].distance;
  const direction = focus.clone().setY(focus.y * 0.18);
  if (direction.lengthSq() < 0.001) direction.set(0, 0, 1);
  direction.y += 0.28;
  direction.normalize();

  return {
    position: focus.clone().addScaledVector(direction, distance),
    lookAt: focus
  };
}

export function CameraDirector({ state, authors, loadedPoems }: CameraDirectorProps) {
  const { camera } = useThree();
  const smoothedLookAt = useRef(new THREE.Vector3());
  const frameTiming = useVisibilityFrameTiming();

  const destination = useMemo(
    () => calculateCameraTarget(state, authors, loadedPoems),
    [authors, loadedPoems, state]
  );

  useFrame((_, delta) => {
    const visibleDelta = consumeVisibleFrameDelta(frameTiming, delta);
    if (visibleDelta === null) return;
    const damping = 1 - Math.exp(-visibleDelta * 1.8);
    camera.position.lerp(destination.position, damping);
    smoothedLookAt.current.lerp(destination.lookAt, damping);
    camera.lookAt(smoothedLookAt.current);
  });

  return null;
}
