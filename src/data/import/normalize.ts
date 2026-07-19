import type { SeedRelation } from '../featured-seed';
import type { AuthorRecord, DynastyId, PoemRecord, RelationRecord } from '../schema';

export interface SourcePoem {
  author?: unknown;
  title?: unknown;
  rhythmic?: unknown;
  paragraphs?: unknown;
  content?: unknown;
}

export function stableId(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export function normalizeAuthorName(value: unknown) {
  return clean(value) || '佚名';
}

const FEATURED_AUTHOR_ALIASES: Record<string, string> = {
  '王維': '王维',
  '李商隱': '李商隐',
  '劉禹錫': '刘禹锡',
  '蘇轍': '苏辙',
  '陸游': '陆游'
};

export function canonicalAuthorName(value: unknown) {
  const name = normalizeAuthorName(value);
  return FEATURED_AUTHOR_ALIASES[name] ?? name;
}

export function normalizeSourcePoem(source: SourcePoem, dynasty: DynastyId): PoemRecord | null {
  if (dynasty === 'modern') return null;
  const author = normalizeAuthorName(source.author);
  const title = clean(source.title) || clean(source.rhythmic);
  const values = Array.isArray(source.paragraphs) ? source.paragraphs : Array.isArray(source.content) ? source.content : [];
  const lines = values.map(clean).filter(Boolean);
  if (!title || !lines.length) return null;
  const authorId = stableId(dynasty + ':' + author);
  const id = stableId(dynasty + ':' + author + ':' + title + ':' + lines.join(''));
  return { id, title, authorId, dynasty, lines, themes: inferThemes(lines), textAvailability: 'full' };
}

const THEME_RULES = [
  ['月', /月|婵娟/], ['酒', /酒|醉|樽/], ['思乡', /故乡|乡关|归乡|故园/],
  ['山河', /山|江|河|湖|海/], ['家国', /国|社稷|长安|边关/], ['离别', /别|送|孤帆/],
  ['田园', /田|园|柴门|桑麻/], ['秋', /秋|霜|落叶/], ['春', /春|花|东风/]
] as const;

export function inferThemes(lines: string[]) {
  const text = lines.join('');
  return THEME_RULES.filter(([, pattern]) => pattern.test(text)).map(([theme]) => theme).slice(0, 4);
}

export function selectCorpus(poems: PoemRecord[], quotas: Partial<Record<DynastyId, number>>) {
  const unique = new Map<string, PoemRecord>();
  for (const poem of poems) {
    const key = poem.authorId + '\u0000' + poem.title + '\u0000' + poem.lines.join('');
    if (!unique.has(key)) unique.set(key, poem);
  }
  const used = new Map<DynastyId, number>();
  return [...unique.values()]
    .sort((left, right) => stableId(left.id).localeCompare(stableId(right.id)))
    .filter((poem) => {
      const count = used.get(poem.dynasty) ?? 0;
      if (count >= (quotas[poem.dynasty] ?? 0)) return false;
      used.set(poem.dynasty, count + 1);
      return true;
    });
}

export function ensureUniquePoemIds(poems: PoemRecord[]) {
  const used = new Set<string>();
  return poems.map((poem, index) => {
    let id = poem.id;
    let attempt = 0;
    while (used.has(id)) {
      id = stableId([
        'poem-id', poem.id, poem.authorId, poem.title, poem.lines.join(''), String(index), String(attempt)
      ].join(':'));
      attempt += 1;
    }
    used.add(id);
    return id === poem.id ? poem : { ...poem, id };
  });
}

export function shardPoems(poems: PoemRecord[], size: number) {
  return Array.from({ length: Math.ceil(poems.length / size) }, (_, index) =>
    poems.slice(index * size, (index + 1) * size)
  );
}

export function resolveRelations(seeds: SeedRelation[], authors: AuthorRecord[]): RelationRecord[] {
  const byName = new Map(authors.map((author) => [author.name, author.id]));
  return seeds.flatMap((seed) => {
    const fromId = byName.get(seed.fromName);
    const toId = byName.get(seed.toName);
    if (!fromId || !toId || !seed.sourceLabel.trim()) return [];
    return [{ fromId, toId, type: seed.type, sourceLabel: seed.sourceLabel }];
  });
}
