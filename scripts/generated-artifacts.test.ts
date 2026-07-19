// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface SearchEntry {
  kind: 'author' | 'poem';
  subtitle: string;
}

describe('generated poetry artifacts', () => {
  it('keeps author search entries within the content whitelist', async () => {
    const path = join(process.cwd(), 'public/data/search-index.json');
    const entries = JSON.parse(await readFile(path, 'utf8')) as SearchEntry[];
    const authorEntries = entries.filter((entry) => entry.kind === 'author');
    expect(authorEntries.length).toBeGreaterThan(0);
    expect(authorEntries.every((entry) => entry.subtitle === '')).toBe(true);
  });
});
