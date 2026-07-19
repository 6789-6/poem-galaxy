import type { SearchEntry } from '../workers/search-protocol';
import { dataUrl } from './base-url';
import { parseManifest, type AuthorRecord, type DataManifest, type FeaturedCorpus, type PoemRecord } from './schema';

export class DataLoadError extends Error {
  constructor(public path: string, public status?: number) {
    super(`Unable to load poetry data: ${path}`);
  }
}

export class PoetryDataClient {
  private cache = new Map<string, Promise<unknown>>();

  constructor(private fetcher: typeof fetch = fetch) {}

  private load<T>(path: string): Promise<T> {
    const cached = this.cache.get(path);
    if (cached) return cached as Promise<T>;

    const request = this.fetcher(dataUrl(path)).then(async (response) => {
      if (!response.ok) throw new DataLoadError(path, response.status);
      return response.json() as Promise<T>;
    });
    this.cache.set(path, request);
    request.catch(() => this.cache.delete(path));
    return request;
  }

  async loadManifest(): Promise<DataManifest> {
    return parseManifest(await this.load<unknown>('manifest.json'));
  }

  loadFeatured(): Promise<FeaturedCorpus> {
    return this.load<FeaturedCorpus>('featured.json');
  }

  loadAuthors(): Promise<AuthorRecord[]> {
    return this.load<AuthorRecord[]>('authors.json');
  }

  loadSearchIndex(): Promise<SearchEntry[]> {
    return this.load<SearchEntry[]>('search-index.json');
  }

  loadPoemShard(path: string): Promise<PoemRecord[]> {
    return this.load<PoemRecord[]>(path);
  }
}
