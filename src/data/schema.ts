export type DynastyId = 'pre-qin' | 'han-wei' | 'tang' | 'song' | 'yuan-ming-qing' | 'modern';

export interface AuthorRecord {
  id: string;
  name: string;
  dynasty: DynastyId;
  years?: string;
  summary?: string;
  themes: string[];
  poemShardIds: string[];
}

export interface PoemRecord {
  id: string;
  title: string;
  authorId: string;
  dynasty: DynastyId;
  form?: string;
  lines: string[];
  themes: string[];
  textAvailability?: 'full' | 'metadata-only';
}

export type RelationType = 'historical' | 'family' | 'literary' | 'theme-similarity';

export interface RelationRecord {
  fromId: string;
  toId: string;
  type: RelationType;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface DataManifest {
  version: 1;
  source: {
    repository: 'chinese-poetry/chinese-poetry';
    commit: 'b8594f81a89752241442f2ce267d6f66f96704ee';
    license: 'MIT';
  };
  counts: { authors: number; poems: number; classicalPoems: number; relations: number };
  featuredPath: string;
  authorsPath: string;
  searchIndexPath: string;
  poemShards: Array<{
    id: string;
    dynasty: DynastyId;
    path: string;
    count: number;
    checksum: string;
  }>;
}

export interface FeaturedCorpus {
  authors: AuthorRecord[];
  poems: PoemRecord[];
  relations: RelationRecord[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const dynastyIds = new Set<DynastyId>([
  'pre-qin',
  'han-wei',
  'tang',
  'song',
  'yuan-ming-qing',
  'modern'
]);

function assertNonNegativeInteger(value: unknown, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ${label}; expected a finite non-negative integer`);
  }
}

function assertRelativeJsonPath(value: unknown, label: string): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    !value.endsWith('.json') ||
    value.startsWith('/') ||
    value.startsWith('\\') ||
    value.includes('\\') ||
    value.includes('//') ||
    /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value) ||
    /(^|\/)\.\.($|\/)/.test(value)
  ) {
    throw new Error(`Invalid ${label}; expected a non-empty relative JSON path`);
  }
}

export function parseManifest(value: unknown): DataManifest {
  if (!record(value) || !record(value.source) || !record(value.counts) || !Array.isArray(value.poemShards)) {
    throw new Error('Invalid data manifest shape');
  }
  if (value.version !== 1) throw new Error('Invalid manifest version; expected 1');
  if (value.source.repository !== 'chinese-poetry/chinese-poetry') throw new Error('Unexpected source repository');
  if (value.source.commit !== 'b8594f81a89752241442f2ce267d6f66f96704ee') throw new Error('Unexpected source commit');
  if (value.source.license !== 'MIT') throw new Error('Source license must be MIT');

  assertNonNegativeInteger(value.counts.authors, 'author count');
  assertNonNegativeInteger(value.counts.poems, 'total poem count');
  assertNonNegativeInteger(value.counts.classicalPoems, 'classical poem count');
  assertNonNegativeInteger(value.counts.relations, 'relation count');
  if (value.counts.classicalPoems < 15000 || value.counts.classicalPoems > 20000) {
    throw new Error('Invalid classical poem count; expected 15000—20000');
  }
  if (value.counts.poems < value.counts.classicalPoems || value.counts.poems > 20000) {
    throw new Error('Invalid total poem count');
  }
  if (value.counts.authors < 1000) throw new Error('Invalid author count; expected at least 1000');

  assertRelativeJsonPath(value.featuredPath, 'featured path');
  assertRelativeJsonPath(value.authorsPath, 'authors path');
  assertRelativeJsonPath(value.searchIndexPath, 'search index path');
  for (const shard of value.poemShards) {
    if (!record(shard)) throw new Error('Invalid poem shard');
    if (typeof shard.id !== 'string' || shard.id.length === 0) throw new Error('Invalid shard id');
    if (!dynastyIds.has(shard.dynasty as DynastyId)) throw new Error('Invalid shard dynasty');
    assertRelativeJsonPath(shard.path, 'shard path');
    if (typeof shard.checksum !== 'string' || shard.checksum.length === 0) throw new Error('Invalid shard checksum');
    assertNonNegativeInteger(shard.count, 'shard count');
    if (shard.count < 1 || shard.count > 500) throw new Error('Invalid shard count; expected 1—500');
  }

  return value as unknown as DataManifest;
}
