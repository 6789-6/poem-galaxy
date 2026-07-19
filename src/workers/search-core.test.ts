import { describe, expect, it } from 'vitest';
import { searchEntries, searchEntriesInBatches } from './search-core';

const entries = [
  { id: 'li-bai', kind: 'author' as const, title: '李白', subtitle: '唐', text: '月 酒 豪放' },
  {
    id: 'jing-ye-si',
    kind: 'poem' as const,
    authorId: 'li-bai',
    title: '静夜思',
    subtitle: '李白',
    text: '月 思乡'
  }
];

describe('searchEntries', () => {
  it('ranks exact titles before body matches', () => {
    expect(searchEntries(entries, '李白', 10).map((item) => item.id)).toEqual(['li-bai', 'jing-ye-si']);
  });

  it('returns an empty list for blank queries', () => {
    expect(searchEntries(entries, '   ', 10)).toEqual([]);
  });

  it('matches the yielding fallback result', async () => {
    expect(await searchEntriesInBatches(entries, '明月', 10, 1)).toEqual(searchEntries(entries, '明月', 10));
  });
});
