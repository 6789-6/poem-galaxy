import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dataUrl } from './base-url';
import { PoetryDataClient } from './client';

describe('PoetryDataClient', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('keeps data under the GitHub Pages base', () => {
    expect(dataUrl('manifest.json', 'https://example.test', '/poem-galaxy/')).toBe(
      'https://example.test/poem-galaxy/data/manifest.json'
    );
  });

  it('deduplicates in-flight shard requests', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([])));
    const client = new PoetryDataClient(fetcher);

    await Promise.all([
      client.loadPoemShard('poems/tang-000.json'),
      client.loadPoemShard('poems/tang-000.json')
    ]);

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('calls the browser default fetch with the global receiver', async () => {
    const browserFetch = vi.fn(function (this: unknown) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(new Response(JSON.stringify({ authors: [], poems: [], relations: [] })));
    });
    vi.stubGlobal('fetch', browserFetch);

    await expect(new PoetryDataClient().loadFeatured()).resolves.toEqual({ authors: [], poems: [], relations: [] });
    expect(browserFetch).toHaveBeenCalledTimes(1);
  });

  it('retries a shard after a rejected request', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(new Response(JSON.stringify([])));
    const client = new PoetryDataClient(fetcher);

    await expect(client.loadPoemShard('poems/tang-000.json')).rejects.toThrow('network unavailable');
    await client.loadPoemShard('poems/tang-000.json');

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
