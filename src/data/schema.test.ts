import { describe, expect, it } from 'vitest';
import { parseManifest } from './schema';

const valid = {
  version: 1,
  source: {
    repository: 'chinese-poetry/chinese-poetry',
    commit: 'b8594f81a89752241442f2ce267d6f66f96704ee',
    license: 'MIT'
  },
  counts: { authors: 1200, poems: 18006, classicalPoems: 18000, relations: 24 },
  featuredPath: 'featured.json',
  authorsPath: 'authors.json',
  searchIndexPath: 'search-index.json',
  poemShards: [
    { id: 'tang-000', dynasty: 'tang', path: 'poems/tang-000.json', count: 500, checksum: 'abc123' }
  ]
};

describe('parseManifest', () => {
  it('accepts the pinned licensed corpus', () => {
    expect(parseManifest(valid)).toEqual(valid);
  });

  it.each([
    [{ ...valid, counts: { ...valid.counts, classicalPoems: 14999 } }, 'classical poem count'],
    [{ ...valid, counts: { ...valid.counts, classicalPoems: 20001 } }, 'classical poem count'],
    [{ ...valid, counts: { ...valid.counts, authors: 999 } }, 'author count'],
    [{ ...valid, source: { ...valid.source, license: 'NONE' } }, 'MIT']
  ])('rejects an invalid manifest', (input, message) => {
    expect(() => parseManifest(input)).toThrow(message);
  });
});
