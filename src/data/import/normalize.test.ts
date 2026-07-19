import { describe, expect, it } from 'vitest';
import { canonicalAuthorName, ensureUniquePoemIds, inferThemes, normalizeSourcePoem, resolveRelations, selectCorpus, shardPoems } from './normalize';

describe('poetry normalization', () => {
  it('normalizes source rows and blocks modern full text', () => {
    expect(normalizeSourcePoem({
      author: '李白',
      title: '静夜思',
      paragraphs: ['床前明月光，', '疑是地上霜。']
    }, 'tang')).toMatchObject({
      title: '静夜思',
      dynasty: 'tang',
      lines: ['床前明月光，', '疑是地上霜。']
    });
    expect(normalizeSourcePoem({ author: '李白', title: '', paragraphs: ['句'] }, 'tang')).toBeNull();
    expect(normalizeSourcePoem({ author: '徐志摩', title: '再别康桥', paragraphs: ['全文'] }, 'modern')).toBeNull();
  });

  it('canonicalizes upstream traditional names used by featured seeds', () => {
    expect(['王維', '李商隱', '劉禹錫', '蘇轍', '陸游'].map(canonicalAuthorName))
      .toEqual(['王维', '李商隐', '刘禹锡', '苏辙', '陆游']);
  });

  it('deduplicates with stable order', () => {
    const repeated = Array.from({ length: 2 }, () => ({
      id: 'same', title: '静夜思', authorId: 'li-bai', dynasty: 'tang' as const,
      lines: ['床前明月光'], themes: []
    }));
    expect(selectCorpus(repeated, { tang: 10 })).toHaveLength(1);
  });

  it('deterministically disambiguates hash collisions', () => {
    const poems = [
      { id: 'collision', title: '甲', authorId: 'author', dynasty: 'tang' as const, lines: ['甲句'], themes: [] },
      { id: 'collision', title: '乙', authorId: 'author', dynasty: 'tang' as const, lines: ['乙句'], themes: [] }
    ];
    const resolved = ensureUniquePoemIds(poems);
    expect(resolved[0].id).toBe('collision');
    expect(new Set(resolved.map((poem) => poem.id))).toHaveLength(2);
    expect(ensureUniquePoemIds(poems)).toEqual(resolved);
  });

  it('creates shards no larger than 500', () => {
    const poems = Array.from({ length: 1001 }, (_, index) => ({
      id: 'p-' + index, title: '诗 ' + index, authorId: 'author', dynasty: 'tang' as const,
      lines: ['句'], themes: []
    }));
    expect(shardPoems(poems, 500).map((shard) => shard.length)).toEqual([500, 500, 1]);
  });

  it('resolves only sourced relations whose endpoints exist', () => {
    const authors = [
      { id: 'li-bai', name: '李白', dynasty: 'tang' as const, themes: [], poemShardIds: [] },
      { id: 'du-fu', name: '杜甫', dynasty: 'tang' as const, themes: [], poemShardIds: [] }
    ];
    const relations = resolveRelations([
      { fromName: '李白', toName: '杜甫', type: 'literary', sourceLabel: '杜甫《春日忆李白》' },
      { fromName: '李白', toName: '不存在', type: 'literary', sourceLabel: '不得输出' }
    ], authors);
    expect(relations).toEqual([{ fromId: 'li-bai', toId: 'du-fu', type: 'literary', sourceLabel: '杜甫《春日忆李白》' }]);
  });

  it('derives restrained themes from explicit text terms', () => {
    expect(inferThemes(['举头望明月', '低头思故乡'])).toEqual(['月', '思乡']);
  });
});
