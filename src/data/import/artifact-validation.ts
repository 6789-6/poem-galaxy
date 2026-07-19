export interface RoutedAuthor {
  id: string;
  poemShardIds: string[];
}

export interface RoutedSearchEntry {
  id: string;
  kind: 'author' | 'poem';
  shardPath?: string;
}

function sameStrings(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function assertExactRouting(
  authors: RoutedAuthor[],
  searchEntries: RoutedSearchEntry[],
  actualPoemShardPaths: Map<string, string>,
  actualAuthorShardIds: Map<string, string[]>
) {
  for (const author of authors) {
    const expected = actualAuthorShardIds.get(author.id) ?? [];
    if (!sameStrings(author.poemShardIds, expected)) {
      throw new Error('Author shard routing mismatch: ' + author.id);
    }
  }
  for (const entry of searchEntries) {
    if (entry.kind !== 'poem') continue;
    if (entry.shardPath !== actualPoemShardPaths.get(entry.id)) {
      throw new Error('Poem shard routing mismatch: ' + entry.id);
    }
  }
}
