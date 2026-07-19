import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataUrl } from './base-url';
import { PoetryDataClient } from './client';

describe('PoetryDataClient', () => {
  beforeEach(() => vi.restoreAllMocks());

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
