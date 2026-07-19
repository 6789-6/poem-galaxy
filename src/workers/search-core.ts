import type { SearchEntry, SearchHit } from './search-protocol';

const SEARCH_VARIANTS: Record<string, string> = {
  '將': '将',
  '進': '进'
};

const normalize = (value: string) => value
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[將進]/g, (character) => SEARCH_VARIANTS[character])
  .replace(/\s+/g, '');

function scoreEntry(entry: SearchEntry, needle: string): SearchHit | null {
  const title = normalize(entry.title);
  const subtitle = normalize(entry.subtitle);
  const text = normalize(entry.text);
  const score =
    title === needle ? 0 : title.includes(needle) ? 1 : subtitle.includes(needle) ? 2 : text.includes(needle) ? 3 : 99;
  return score < 99 ? { id: entry.id, score } : null;
}

function sortHits(hits: SearchHit[], limit: number): SearchHit[] {
  return hits.sort((left, right) => left.score - right.score || left.id.localeCompare(right.id, 'zh-CN')).slice(0, limit);
}

export function searchEntries(entries: SearchEntry[], query: string, limit: number): SearchHit[] {
  const needle = normalize(query);
  if (!needle) return [];

  return sortHits(
    entries.map((entry) => scoreEntry(entry, needle)).filter((hit): hit is SearchHit => hit !== null),
    limit
  );
}

export async function searchEntriesInBatches(
  entries: SearchEntry[],
  query: string,
  limit: number,
  batchSize = 1000
): Promise<SearchHit[]> {
  const needle = normalize(query);
  if (!needle) return [];

  const hits: SearchHit[] = [];
  for (let index = 0; index < entries.length; index += batchSize) {
    for (const entry of entries.slice(index, index + batchSize)) {
      const hit = scoreEntry(entry, needle);
      if (hit) hits.push(hit);
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  return sortHits(hits, limit);
}
