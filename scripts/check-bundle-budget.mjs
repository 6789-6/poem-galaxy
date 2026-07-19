import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const dist = new URL('../dist/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', dist), 'utf8'));
const initialFiles = new Set();

function visit(key) {
  const chunk = manifest[key];
  if (!chunk || initialFiles.has(chunk.file)) return;
  if (chunk.file.endsWith('.js')) initialFiles.add(chunk.file);
  for (const dependency of chunk.imports ?? []) visit(dependency);
}

for (const [key, chunk] of Object.entries(manifest)) {
  if (chunk.isEntry) visit(key);
}

let total = 0;
for (const file of initialFiles) total += gzipSync(await readFile(new URL(file, dist))).byteLength;
const featured = gzipSync(await readFile(new URL('../dist/data/featured.json', import.meta.url))).byteLength;

if (total > 700 * 1024) throw new Error(`Compressed JavaScript exceeds 700 KiB: ${total}`);
if (featured > 250 * 1024) throw new Error(`Compressed featured data exceeds 250 KiB: ${featured}`);

console.log(`Budget OK: initial JS ${total} bytes; featured ${featured} bytes`);
