import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { AuthorRecord, FeaturedCorpus, PoemRecord } from '../src/data/schema';
import { parseManifest } from '../src/data/schema';
import { assertExactRouting } from '../src/data/import/artifact-validation';

interface SearchEntry {
  id: string;
  kind: 'author' | 'poem';
  authorId?: string;
  shardPath?: string;
  title: string;
  subtitle: string;
  text: string;
}

const root = new URL('../public/data/', import.meta.url);
const readJson = async <T>(path: string) => JSON.parse(await readFile(new URL(path, root), 'utf8')) as T;
const manifest = parseManifest(await readJson<unknown>('manifest.json'));
if (manifest.poemShards.some((shard) => shard.count < 1 || shard.count > 500)) process.exit(1);

const poems: PoemRecord[] = [];
const actualPoemShardPaths = new Map<string, string>();
const actualAuthorShardIdSets = new Map<string, Set<string>>();
for (const shard of manifest.poemShards) {
  const raw = await readFile(new URL(shard.path, root), 'utf8');
  const records = JSON.parse(raw) as PoemRecord[];
  const actualChecksum = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  if (records.length !== shard.count || actualChecksum !== shard.checksum) throw new Error('Invalid shard: ' + shard.path);
  for (const record of records) {
    actualPoemShardPaths.set(record.id, shard.path);
    const shardIds = actualAuthorShardIdSets.get(record.authorId) ?? new Set<string>();
    shardIds.add(shard.id);
    actualAuthorShardIdSets.set(record.authorId, shardIds);
  }
  poems.push(...records);
}

const authors = await readJson<AuthorRecord[]>('authors.json');
const featured = await readJson<FeaturedCorpus>('featured.json');
const searchIndex = await readJson<SearchEntry[]>('search-index.json');
const authorIds = new Set(authors.map((author) => author.id));
const shardIds = new Set(manifest.poemShards.map((shard) => shard.id));
const poemIds = new Set(poems.map((poem) => poem.id));
const poemsById = new Map(poems.map((poem) => [poem.id, poem]));
const classicalPoems = poems.filter((poem) => poem.dynasty !== 'modern');
const modernPoems = poems.filter((poem) => poem.dynasty === 'modern');
const actualAuthorShardIds = new Map(
  [...actualAuthorShardIdSets].map(([authorId, ids]) => [authorId, [...ids].sort()])
);
if (authors.length !== manifest.counts.authors || poems.length !== manifest.counts.poems) throw new Error('Manifest counts do not match artifacts');
if (authorIds.size !== authors.length || poemIds.size !== poems.length) throw new Error('Artifact IDs must be unique');
if (poems.some((poem) => !authorIds.has(poem.authorId))) throw new Error('Poem references an unknown author');
if (authors.some((author) => author.poemShardIds.some((id) => !shardIds.has(id)))) throw new Error('Author references an unknown shard');
if (classicalPoems.length !== manifest.counts.classicalPoems || classicalPoems.some((poem) => poem.lines.length === 0)) throw new Error('Invalid classical poem count or text');
if (modernPoems.some((poem) => poem.lines.length > 0 || poem.textAvailability !== 'metadata-only')) throw new Error('Modern records must be metadata only');
if (featured.relations.some((relation) => !relation.sourceLabel.trim() || !authorIds.has(relation.fromId) || !authorIds.has(relation.toId))) throw new Error('Invalid sourced relation');
if (featured.authors.some((author) => !authorIds.has(author.id)) || featured.poems.some((poem) => !poemIds.has(poem.id))) throw new Error('Featured records must exist in the corpus');
if (featured.relations.length !== manifest.counts.relations) throw new Error('Manifest relation count does not match featured relations');
if (searchIndex.length !== authors.length + poems.length) throw new Error('Search index count does not match corpus');
assertExactRouting(authors, searchIndex, actualPoemShardPaths, actualAuthorShardIds);
for (const entry of searchIndex.filter((candidate) => candidate.kind === 'poem')) {
  const poem = poemsById.get(entry.id);
  if (!poem || entry.authorId !== poem.authorId || !entry.shardPath) throw new Error('Invalid poem search entry: ' + entry.id);
  const selectedLine = poem.dynasty !== 'modern' && poem.lines.length > 1 ? poem.lines[0] : '';
  const expectedText = [...poem.themes, selectedLine].filter(Boolean).join(' ');
  if (entry.text !== expectedText) throw new Error('Search entry contains unexpected poem text: ' + entry.id);
}
console.log('Verified ' + manifest.counts.poems + ' poems, ' + manifest.counts.authors + ' authors');
