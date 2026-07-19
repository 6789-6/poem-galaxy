import { describe, expect, it } from 'vitest';
import { galaxyReducer, initialGalaxyState } from './galaxy-reducer';

describe('galaxyReducer', () => {
  it('follows overview to poet to poem and back by level', () => {
    const poet = galaxyReducer(initialGalaxyState, { type: 'SELECT_AUTHOR', authorId: 'li-bai' });
    const poem = galaxyReducer(poet, { type: 'SELECT_POEM', poemId: 'jing-ye-si', authorId: 'li-bai' });
    expect(poem.mode).toBe('poem');
    expect(galaxyReducer(poem, { type: 'BACK' })).toMatchObject({ mode: 'poet', selectedAuthorId: 'li-bai', selectedPoemId: null });
    expect(galaxyReducer(poet, { type: 'BACK' })).toMatchObject({ mode: 'overview', selectedAuthorId: null });
  });

  it('keeps the selected author for network and exits tour cleanly', () => {
    const poet = galaxyReducer(initialGalaxyState, { type: 'SELECT_AUTHOR', authorId: 'du-fu' });
    expect(galaxyReducer(poet, { type: 'ENTER_NETWORK' }).mode).toBe('network');
    const tour = galaxyReducer(initialGalaxyState, { type: 'START_TOUR' });
    expect(galaxyReducer(tour, { type: 'BACK' }).mode).toBe('overview');
  });

  it('preserves the current dynasty selection when given an empty selection', () => {
    const state = galaxyReducer(initialGalaxyState, { type: 'SET_DYNASTIES', dynasties: ['tang'] });

    expect(galaxyReducer(state, { type: 'SET_DYNASTIES', dynasties: [] })).toBe(state);
  });
});
