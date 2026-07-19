import { describe, expect, it } from 'vitest';
import type { AuthorRecord, PoemRecord } from '../data/schema';
import { initialGalaxyState, type GalaxyMode } from '../state/galaxy-reducer';
import { calculateCameraTarget, CAMERA_TARGETS } from './CameraDirector';
import { authorPosition } from './geometry/poetry-layout';

const authors: AuthorRecord[] = [
  { id: 'li-bai', name: '李白', dynasty: 'tang', themes: [], poemShardIds: [] },
  { id: 'su-shi', name: '苏轼', dynasty: 'song', themes: [], poemShardIds: [] }
];
const poems: PoemRecord[] = [
  { id: 'jing-ye-si', title: '静夜思', authorId: 'li-bai', dynasty: 'tang', lines: ['床前明月光'], themes: [] }
];

describe('camera target calculation', () => {
  it.each<[Exclude<GalaxyMode, 'overview'>, number]>([
    ['poet', CAMERA_TARGETS.poet.distance],
    ['poem', CAMERA_TARGETS.poem.distance],
    ['network', CAMERA_TARGETS.network.distance],
    ['tour', CAMERA_TARGETS.tour.distance]
  ])('places the %s camera at its exact configured distance', (mode, distance) => {
    const state = {
      ...initialGalaxyState,
      mode,
      selectedAuthorId: authors[0].id,
      selectedPoemId: mode === 'poem' ? poems[0].id : null,
      tourIndex: 0
    };

    const target = calculateCameraTarget(state, authors, poems);

    expect(target.position.distanceTo(target.lookAt)).toBeCloseTo(distance, 10);
  });

  it('uses tourIndex even when stale author and poem selections remain', () => {
    const state = {
      ...initialGalaxyState,
      mode: 'tour' as const,
      selectedAuthorId: authors[0].id,
      selectedPoemId: poems[0].id,
      tourIndex: 1
    };

    const target = calculateCameraTarget(state, authors, poems);

    expect(target.lookAt.toArray()).toEqual(authorPosition(authors[1]));
  });
});
