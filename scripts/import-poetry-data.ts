import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import {
  CURATED_RELATIONS,
  CURATED_THEMES,
  FEATURED_AUTHOR_NAMES,
  MODERN_WORKS_METADATA
} from '../src/data/featured-seed';
import {
  canonicalAuthorName,
  ensureUniquePoemIds,
  normalizeAuthorName,
  normalizeSourcePoem,
  resolveRelations,
  selectCorpus,
  shardPoems,
  stableId
} from '../src/data/import/normalize';
import { verifySourceIdentity } from './source-identity';
import type {
  AuthorRecord,
  DataManifest,
  DynastyId,
  FeaturedCorpus,
  PoemRecord
} from '../src/data/schema';

const SOURCE_COMMIT = 'b8594f81a89752241442f2ce267d6f66f96704ee';
const QUOTAS = {
  'pre-qin': 400,
  'han-wei': 800,
  tang: 8000,
  song: 6500,
  'yuan-ming-qing': 2500
} as const;
const SHARD_SIZE = 500;
const SOURCE_DIRECTORIES = ['诗经', '楚辞', '曹操诗集', '全唐诗', '宋词', '元曲', '纳兰性德'] as const;
const DYNASTIES: DynastyId[] = ['pre-qin', 'han-wei', 'tang', 'song', 'yuan-ming-qing', 'modern'];

interface SearchEntry {
  id: string;
  kind: 'author' | 'poem';
  authorId?: string;
  shardPath?: string;
  title: string;
  subtitle: string;
  text: string;
}

interface SourcedRow {
  dynasty: DynastyId;
  path: string;
  row: unknown;
}

interface ShardOutput {
  id: string;
  dynasty: DynastyId;
  path: string;
  poems: PoemRecord[];
  raw: string;
}

async function walkJson(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
    .map((entry) => entry.isDirectory()
      ? walkJson(join(directory, entry.name))
      : Promise.resolve(extname(entry.name) === '.json' ? [join(directory, entry.name)] : [])));
  return nested.flat();
}

function inferDynasty(path: string): DynastyId {
  const file = basename(path);
  if (file.startsWith('poet.tang.')) return 'tang';
  if (file.startsWith('poet.song.')) return 'song';
  if (path.includes('诗经') || path.includes('楚辞')) return 'pre-qin';
  if (path.includes('曹操诗集')) return 'han-wei';
  if (path.includes('全唐诗')) return 'tang';
  if (path.includes('宋词')) return 'song';
  if (path.includes('元曲') || path.includes('纳兰性德')) return 'yuan-ming-qing';
  throw new Error('Unsupported poetry source path: ' + path);
}

function sourceRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    for (const key of ['poems', 'content', 'items']) {
      if (Array.isArray(candidate[key])) return candidate[key] as unknown[];
    }
  }
  return [];
}

async function readRows(path: string): Promise<SourcedRow[]> {
  const dynasty = inferDynasty(path);
  const rows = sourceRows(JSON.parse(await readFile(path, 'utf8')));
  return rows.map((row) => ({ dynasty, path, row }));
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2) + '\n';
}

async function writeJson(path: string, value: unknown) {
  await writeFile(path, json(value), 'utf8');
}

export function checksum(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function adaptSourceRow(value: unknown, path: string) {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const author = row.author ?? (path.includes('曹操诗集') ? '曹操' : undefined);
  return {
    ...row,
    author: canonicalAuthorName(author),
    paragraphs: row.paragraphs ?? row.para
  };
}

function rankedThemes(poems: PoemRecord[]) {
  const counts = new Map<string, number>();
  for (const poem of poems) {
    for (const theme of poem.themes) counts.set(theme, (counts.get(theme) ?? 0) + 1);
  }
  return [...counts]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'))
    .slice(0, 4)
    .map(([theme]) => theme);
}

function modernRecords() {
  return MODERN_WORKS_METADATA.map(({ author, title, themes }) => {
    const authorId = stableId('modern:' + author);
    return {
      id: stableId('modern:' + author + ':' + title),
      title,
      authorId,
      dynasty: 'modern' as const,
      lines: [],
      themes: [...themes],
      textAvailability: 'metadata-only' as const
    };
  });
}

async function main() {
  const sourceFlag = process.argv.indexOf('--source');
  const positionalSource = process.argv.slice(2).find((argument) => !argument.startsWith('-'));
  const sourceRoot = sourceFlag >= 0 ? process.argv[sourceFlag + 1] : positionalSource ?? '.cache/chinese-poetry';
  if (!sourceRoot) throw new Error('Missing path after --source');
  const sourceIdentity = await verifySourceIdentity(sourceRoot, SOURCE_COMMIT);

  const sourceFiles = (await Promise.all(
    SOURCE_DIRECTORIES.map((directory) => walkJson(join(sourceRoot, directory)))
  )).flat();
  const sourcedRows = (await Promise.all(sourceFiles.map(readRows))).flat();
  const authorNames = new Map<string, string>();
  const normalized: PoemRecord[] = [];

  for (const sourced of sourcedRows) {
    const row = adaptSourceRow(sourced.row, sourced.path);
    if (!row) continue;
    const poem = normalizeSourcePoem(row, sourced.dynasty);
    if (!poem) continue;
    authorNames.set(poem.authorId, normalizeAuthorName(row.author));
    normalized.push(poem);
  }

  const classical = selectCorpus(normalized, QUOTAS);
  const modern = modernRecords();
  for (const metadata of MODERN_WORKS_METADATA) {
    authorNames.set(stableId('modern:' + metadata.author), metadata.author);
  }
  const poems = ensureUniquePoemIds([...classical, ...modern]);

  const outputRoot = new URL('../public/data/', import.meta.url);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(new URL('poems/', outputRoot), { recursive: true });

  const shardOutputs: ShardOutput[] = [];
  const poemShardPaths = new Map<string, string>();
  const authorShardIds = new Map<string, Set<string>>();
  for (const dynasty of DYNASTIES) {
    const dynastyPoems = poems.filter((poem) => poem.dynasty === dynasty);
    const shards = shardPoems(dynastyPoems, SHARD_SIZE);
    for (const [index, shard] of shards.entries()) {
      const id = dynasty + '-' + String(index).padStart(3, '0');
      const path = 'poems/' + id + '.json';
      const raw = json(shard);
      shardOutputs.push({ id, dynasty, path, poems: shard, raw });
      for (const poem of shard) {
        poemShardPaths.set(poem.id, path);
        const ids = authorShardIds.get(poem.authorId) ?? new Set<string>();
        ids.add(id);
        authorShardIds.set(poem.authorId, ids);
      }
      await writeFile(new URL(path, outputRoot), raw, 'utf8');
    }
  }

  const poemsByAuthor = new Map<string, PoemRecord[]>();
  for (const poem of poems) {
    const records = poemsByAuthor.get(poem.authorId) ?? [];
    records.push(poem);
    poemsByAuthor.set(poem.authorId, records);
  }
  const authors: AuthorRecord[] = [...poemsByAuthor].map(([id, authorPoems]) => {
    const name = authorNames.get(id) ?? '佚名';
    return {
      id,
      name,
      dynasty: authorPoems[0].dynasty,
      themes: CURATED_THEMES[name] ?? rankedThemes(authorPoems),
      poemShardIds: [...(authorShardIds.get(id) ?? [])].sort()
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  const relations = resolveRelations(CURATED_RELATIONS, authors);
  const authorsByName = new Map(authors.map((author) => [author.name, author]));
  const featuredAuthors = FEATURED_AUTHOR_NAMES.flatMap((name) => {
    const author = authorsByName.get(name);
    return author ? [author] : [];
  });
  const featuredIds = new Set(featuredAuthors.map((author) => author.id));
  const featuredPoems = featuredAuthors.flatMap((author) =>
    (poemsByAuthor.get(author.id) ?? []).slice(0, 3)
  );
  const featured: FeaturedCorpus = {
    authors: featuredAuthors,
    poems: featuredPoems,
    relations: relations.filter((relation) => featuredIds.has(relation.fromId) && featuredIds.has(relation.toId))
  };

  const authorById = new Map(authors.map((author) => [author.id, author]));
  const searchIndex: SearchEntry[] = [
    ...authors.map((author) => ({
      id: author.id,
      kind: 'author' as const,
      title: author.name,
      subtitle: '',
      text: author.themes.join(' ')
    })),
    ...poems.map((poem) => {
      const author = authorById.get(poem.authorId);
      const selectedLine = poem.dynasty !== 'modern' && poem.lines.length > 1 ? poem.lines[0] : '';
      return {
        id: poem.id,
        kind: 'poem' as const,
        authorId: poem.authorId,
        shardPath: poemShardPaths.get(poem.id),
        title: poem.title,
        subtitle: author?.name ?? '佚名',
        text: [...poem.themes, selectedLine].filter(Boolean).join(' ')
      };
    })
  ];

  const manifest: DataManifest = {
    version: 1,
    source: {
      repository: 'chinese-poetry/chinese-poetry',
      commit: SOURCE_COMMIT,
      license: 'MIT'
    },
    counts: {
      authors: authors.length,
      poems: poems.length,
      classicalPoems: classical.length,
      relations: relations.length
    },
    featuredPath: 'featured.json',
    authorsPath: 'authors.json',
    searchIndexPath: 'search-index.json',
    poemShards: shardOutputs.map((shard) => ({
      id: shard.id,
      dynasty: shard.dynasty,
      path: shard.path,
      count: shard.poems.length,
      checksum: checksum(shard.raw)
    }))
  };

  await Promise.all([
    writeJson(new URL('authors.json', outputRoot), authors),
    writeJson(new URL('featured.json', outputRoot), featured),
    writeJson(new URL('search-index.json', outputRoot), searchIndex),
    writeJson(new URL('manifest.json', outputRoot), manifest)
  ]);
  console.log('Verified source identity via ' + sourceIdentity);
  console.log('Imported ' + classical.length + ' classical poems and ' + modern.length + ' modern metadata records');
}

await main();
