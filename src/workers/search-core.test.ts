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

  it('matches common simplified input against traditional corpus text', () => {
    const traditional = [
      { id: 'qiang-jin-jiu', kind: 'poem' as const, title: '將進酒', subtitle: '李白', text: '黃河之水天上來' }
    ];
    expect(searchEntries(traditional, '将进酒', 10).map((item) => item.id)).toEqual(['qiang-jin-jiu']);
  });

  it('matches the yielding fallback result', async () => {
    expect(await searchEntriesInBatches(entries, '明月', 10, 1)).toEqual(searchEntries(entries, '明月', 10));
  });
});
