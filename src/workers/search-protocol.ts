export interface SearchEntry {
  id: string;
  kind: 'author' | 'poem';
  authorId?: string;
  shardPath?: string;
  title: string;
  subtitle: string;
  text: string;
}

export interface SearchHit {
  id: string;
  score: number;
}

export type SearchRequest =
  | { type: 'init'; entries: SearchEntry[] }
  | { type: 'search'; requestId: number; query: string; limit: number };

export type SearchResponse =
  | { type: 'ready' }
  | { type: 'results'; requestId: number; results: SearchHit[] };
