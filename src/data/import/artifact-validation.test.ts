import { describe, expect, it } from 'vitest';
import type { AuthorRecord } from '../schema';
import { assertExactRouting } from './artifact-validation';

const author: AuthorRecord = {
  id: 'li-bai',
  name: '李白',
  dynasty: 'tang',
  themes: ['月'],
  poemShardIds: ['tang-000']
};

const poemEntry = {
  id: 'jing-ye-si',
  kind: 'poem' as const,
  authorId: 'li-bai',
  shardPath: 'poems/tang-000.json',
  title: '静夜思',
  subtitle: '李白',
  text: '月 床前明月光'
};

describe('exact artifact routing', () => {
  it('rejects a wrong but existing author shard ID', () => {
    expect(() => assertExactRouting(
      [{ ...author, poemShardIds: ['tang-001'] }],
      [poemEntry],
      new Map([['jing-ye-si', 'poems/tang-000.json']]),
      new Map([['li-bai', ['tang-000']]])
    )).toThrow('Author shard routing mismatch: li-bai');
  });

  it('rejects a wrong but existing poem shard path', () => {
    expect(() => assertExactRouting(
      [author],
      [{ ...poemEntry, shardPath: 'poems/tang-001.json' }],
      new Map([['jing-ye-si', 'poems/tang-000.json']]),
      new Map([['li-bai', ['tang-000']]])
    )).toThrow('Poem shard routing mismatch: jing-ye-si');
  });

  it('accepts exact author and poem routes', () => {
    expect(() => assertExactRouting(
      [author],
      [poemEntry],
      new Map([['jing-ye-si', 'poems/tang-000.json']]),
      new Map([['li-bai', ['tang-000']]])
    )).not.toThrow();
  });
});
