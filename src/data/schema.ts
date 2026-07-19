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

export function parseManifest(value: unknown): DataManifest {
  if (!record(value) || !record(value.source) || !record(value.counts) || !Array.isArray(value.poemShards)) {
    throw new Error('Invalid data manifest shape');
  }
  const poems = Number(value.counts.classicalPoems);
  const authors = Number(value.counts.authors);
  if (poems < 15000 || poems > 20000) throw new Error('Invalid classical poem count; expected 15000—20000');
  if (Number(value.counts.poems) < poems || Number(value.counts.poems) > 20000) throw new Error('Invalid total poem count');
  if (authors < 1000) throw new Error('Invalid author count; expected at least 1000');
  if (value.source.repository !== 'chinese-poetry/chinese-poetry') throw new Error('Unexpected source repository');
  if (value.source.commit !== 'b8594f81a89752241442f2ce267d6f66f96704ee') throw new Error('Unexpected source commit');
  if (value.source.license !== 'MIT') throw new Error('Source license must be MIT');
  return value as unknown as DataManifest;
}
