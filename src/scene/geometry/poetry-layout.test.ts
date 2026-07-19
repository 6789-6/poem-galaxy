import { describe, expect, it } from 'vitest';
import { authorPosition, poemPosition } from './poetry-layout';

const author = { id: 'li-bai', name: '李白', dynasty: 'tang' as const, themes: [], poemShardIds: [] };
const poem = { id: 'jing-ye-si', title: '静夜思', authorId: 'li-bai', dynasty: 'tang' as const, lines: ['床前明月光'], themes: [] };

describe('poetry spatial layout', () => {
  it('is deterministic and finite', () => {
    expect(authorPosition(author)).toEqual(authorPosition(author));
    expect(authorPosition(author).every(Number.isFinite)).toBe(true);
  });

  it('places a poem near but not on its author orbit', () => {
    expect(poemPosition(poem, 0)).not.toEqual(authorPosition(author));
    expect(poemPosition(poem, 0).every(Number.isFinite)).toBe(true);
  });
});
